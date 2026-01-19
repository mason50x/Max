import { differenceInDays } from 'date-fns';

// Minimum size to consider a file "large" (100 MB)
const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024;

// Age thresholds for suggestions
const OLD_FILE_DAYS = 90; // Files not accessed in 90 days
const VERY_OLD_FILE_DAYS = 180; // Files not accessed in 180 days

/**
 * Find large files from a list of file info objects
 */
export async function findLargeFiles(files, options = {}) {
  const {
    minSize = LARGE_FILE_THRESHOLD,
    onProgress = () => {},
  } = options;

  const largeFiles = [];
  let processed = 0;
  const now = new Date();

  onProgress({ message: 'Finding large files...', processed: 0, total: files.length });

  for (const file of files) {
    if (file.size >= minSize) {
      // Calculate age based on last access time
      const lastAccessed = file.accessed || file.modified;
      const ageInDays = differenceInDays(now, new Date(lastAccessed));

      // Generate suggestion based on age
      let suggestion = null;
      if (ageInDays >= VERY_OLD_FILE_DAYS) {
        suggestion = 'Very old - consider deleting';
      } else if (ageInDays >= OLD_FILE_DAYS) {
        suggestion = 'Not accessed recently';
      }

      largeFiles.push({
        path: file.path,
        size: file.size,
        modified: file.modified,
        lastAccessed: lastAccessed,
        ageInDays,
        suggestion,
      });
    }

    processed++;
    if (processed % 5000 === 0) {
      onProgress({
        message: `Checking file sizes: ${processed}/${files.length}`,
        processed,
        total: files.length,
      });
    }
  }

  // Sort by size (largest first)
  largeFiles.sort((a, b) => b.size - a.size);

  onProgress({
    message: `Found ${largeFiles.length} large files (>100MB)`,
    processed: files.length,
    total: files.length,
    complete: true,
  });

  return largeFiles;
}

/**
 * Get summary statistics for large files
 */
export function getLargeFileStats(largeFiles) {
  const totalSize = largeFiles.reduce((sum, f) => sum + f.size, 0);
  const oldFiles = largeFiles.filter((f) => f.ageInDays >= OLD_FILE_DAYS);
  const veryOldFiles = largeFiles.filter((f) => f.ageInDays >= VERY_OLD_FILE_DAYS);

  return {
    count: largeFiles.length,
    totalSize,
    oldCount: oldFiles.length,
    oldSize: oldFiles.reduce((sum, f) => sum + f.size, 0),
    veryOldCount: veryOldFiles.length,
    veryOldSize: veryOldFiles.reduce((sum, f) => sum + f.size, 0),
  };
}

export default { findLargeFiles, getLargeFileStats };
