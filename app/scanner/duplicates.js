import { createHash } from 'crypto';
import { readFile, open } from 'fs/promises';

// Minimum file size to consider for duplicates (skip tiny files)
const MIN_DUPLICATE_SIZE = 1024; // 1 KB

// Size of quick hash sample (first N bytes)
const QUICK_HASH_SIZE = 4096; // 4 KB

/**
 * Calculate a quick hash of the first bytes of a file
 */
async function quickHash(filePath, size = QUICK_HASH_SIZE) {
  try {
    const fileHandle = await open(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(size, 65536));
    const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, 0);
    await fileHandle.close();

    if (bytesRead === 0) return null;

    const hash = createHash('sha256');
    hash.update(buffer.subarray(0, bytesRead));
    return hash.digest('hex');
  } catch (err) {
    return null;
  }
}

/**
 * Calculate full file hash
 */
async function fullHash(filePath) {
  try {
    const content = await readFile(filePath);
    const hash = createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  } catch (err) {
    return null;
  }
}

/**
 * Find duplicate files from a list of file info objects
 * Uses a multi-phase approach:
 * 1. Group by size
 * 2. Quick hash (first 4KB) for size groups
 * 3. Full hash for quick-hash matches
 */
export async function findDuplicates(files, onProgress = () => {}) {
  const duplicateGroups = [];

  // Phase 1: Group files by size
  onProgress({ phase: 1, message: 'Grouping files by size...' });

  const sizeGroups = new Map();
  for (const file of files) {
    if (file.size < MIN_DUPLICATE_SIZE) continue;

    const key = file.size.toString();
    if (!sizeGroups.has(key)) {
      sizeGroups.set(key, []);
    }
    sizeGroups.get(key).push(file);
  }

  // Filter to only groups with potential duplicates (>1 file same size)
  const candidates = [...sizeGroups.values()].filter((group) => group.length > 1);
  const totalCandidates = candidates.reduce((sum, g) => sum + g.length, 0);

  onProgress({
    phase: 1,
    message: `Found ${candidates.length} size groups with ${totalCandidates} potential duplicates`,
  });

  // Phase 2: Quick hash for candidates
  onProgress({ phase: 2, message: 'Computing quick hashes...' });

  let processed = 0;
  const quickHashGroups = new Map();

  for (const group of candidates) {
    for (const file of group) {
      const hash = await quickHash(file.path);
      if (hash) {
        const key = `${file.size}-${hash}`;
        if (!quickHashGroups.has(key)) {
          quickHashGroups.set(key, []);
        }
        quickHashGroups.get(key).push(file);
      }

      processed++;
      if (processed % 100 === 0) {
        onProgress({
          phase: 2,
          processed,
          total: totalCandidates,
          message: `Quick hashing: ${processed}/${totalCandidates}`,
        });
      }
    }
  }

  // Filter to groups with matching quick hashes
  const quickHashCandidates = [...quickHashGroups.values()].filter((g) => g.length > 1);

  onProgress({
    phase: 2,
    message: `Found ${quickHashCandidates.length} quick hash matches`,
  });

  // Phase 3: Full hash for verification
  onProgress({ phase: 3, message: 'Verifying duplicates with full hash...' });

  processed = 0;
  const totalToVerify = quickHashCandidates.reduce((sum, g) => sum + g.length, 0);

  for (const group of quickHashCandidates) {
    const fullHashMap = new Map();

    for (const file of group) {
      const hash = await fullHash(file.path);
      if (hash) {
        if (!fullHashMap.has(hash)) {
          fullHashMap.set(hash, []);
        }
        fullHashMap.get(hash).push(file);
      }

      processed++;
      if (processed % 50 === 0) {
        onProgress({
          phase: 3,
          processed,
          total: totalToVerify,
          message: `Verifying: ${processed}/${totalToVerify}`,
        });
      }
    }

    // Add confirmed duplicate groups
    for (const [hash, matchingFiles] of fullHashMap) {
      if (matchingFiles.length > 1) {
        // Sort by modification date (oldest first = "original")
        matchingFiles.sort((a, b) => new Date(a.modified) - new Date(b.modified));

        duplicateGroups.push({
          hash,
          size: matchingFiles[0].size,
          files: matchingFiles.map((f) => ({
            path: f.path,
            size: f.size,
            modified: f.modified,
          })),
        });
      }
    }
  }

  onProgress({
    phase: 3,
    message: `Found ${duplicateGroups.length} duplicate groups`,
    complete: true,
  });

  return duplicateGroups;
}

export default { findDuplicates };
