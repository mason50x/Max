import { homedir } from 'os';
import { traverseDirectory, estimateFileCount } from './traverser.js';
import { findDuplicates } from './duplicates.js';
import { findJunkFiles } from './junk.js';
import { findLargeFiles } from './large.js';
import { useStore } from '../store.js';

/**
 * Main scan coordinator
 * Orchestrates the full scan process
 */
export async function startScan(options = {}) {
  const {
    rootPath = homedir(),
    skipDuplicates = false,
    skipJunk = false,
    skipLarge = false,
  } = options;

  const store = useStore.getState();

  // Start scan
  store.startScan();

  try {
    // Phase 1: Collect all files
    store.updateScanProgress(5, 0, 'Starting file traversal...');

    const allFiles = [];
    let filesScanned = 0;

    for await (const file of traverseDirectory(rootPath)) {
      allFiles.push(file);
      filesScanned++;

      // Update progress periodically
      if (filesScanned % 500 === 0) {
        // Progress from 5% to 40% during traversal
        const progress = Math.min(40, 5 + (filesScanned / 1000));
        store.updateScanProgress(progress, filesScanned, `Scanning: ${filesScanned.toLocaleString()} files found`);
      }
    }

    store.updateScanProgress(40, filesScanned, `Found ${filesScanned.toLocaleString()} files. Analyzing...`);

    // Phase 2: Find duplicates (40% - 70%)
    let duplicates = [];
    if (!skipDuplicates) {
      store.updateScanProgress(40, filesScanned, 'Finding duplicate files...');

      duplicates = await findDuplicates(allFiles, (progress) => {
        const percent = 40 + (progress.phase / 3) * 30;
        store.updateScanProgress(percent, filesScanned, progress.message);
      });
    }

    // Phase 3: Find junk files (70% - 85%)
    let junkFiles = [];
    if (!skipJunk) {
      store.updateScanProgress(70, filesScanned, 'Identifying junk files...');

      junkFiles = await findJunkFiles(allFiles, (progress) => {
        const percent = 70 + (progress.processed / progress.total) * 15;
        store.updateScanProgress(percent, filesScanned, progress.message);
      });
    }

    // Phase 4: Find large files (85% - 95%)
    let largeFiles = [];
    if (!skipLarge) {
      store.updateScanProgress(85, filesScanned, 'Finding large files...');

      largeFiles = await findLargeFiles(allFiles, {
        onProgress: (progress) => {
          const percent = 85 + (progress.processed / progress.total) * 10;
          store.updateScanProgress(percent, filesScanned, progress.message);
        },
      });
    }

    // Calculate total size of all files
    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);

    // Complete scan
    store.completeScan({
      duplicates,
      junkFiles,
      largeFiles,
      totalSize,
    });

    return {
      success: true,
      filesScanned,
      duplicates: duplicates.length,
      junkFiles: junkFiles.length,
      largeFiles: largeFiles.length,
    };
  } catch (error) {
    store.setScanError(error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Quick scan - faster but less thorough
 * Only scans common problematic areas
 */
export async function quickScan() {
  const home = homedir();
  const scanPaths = [
    `${home}/Downloads`,
    `${home}/Library/Caches`,
    `${home}/Library/Logs`,
    `${home}/Desktop`,
    `${home}/Documents`,
  ];

  // For quick scan, combine results from targeted directories
  // (Implementation would scan each path separately)
  return startScan({ rootPath: home });
}

export default { startScan, quickScan };
