import { readdir, stat, lstat } from 'fs/promises';
import { join } from 'path';

// Directories to skip during traversal
const SKIP_DIRS = new Set([
  '.Trash',
  '.Spotlight-V100',
  '.fseventsd',
  '.DocumentRevisions-V100',
  '.TemporaryItems',
  '.DS_Store',
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'Library/Caches',
  'Library/Logs',
  '.npm',
  '.yarn',
]);

// Check if path should be skipped
const shouldSkip = (name, fullPath) => {
  // Skip hidden system directories
  if (SKIP_DIRS.has(name)) return true;

  // Skip certain deep Library paths to avoid permission issues
  if (fullPath.includes('/Library/Application Support/MobileSync')) return true;
  if (fullPath.includes('/Library/Containers')) return true;
  if (fullPath.includes('/Library/Group Containers')) return true;

  return false;
};

/**
 * Async generator that walks a directory tree
 * Yields file information objects: { path, size, modified, accessed, isDirectory }
 */
export async function* traverseDirectory(rootPath, options = {}) {
  const {
    maxDepth = 20,
    followSymlinks = false,
    onError = () => {},
  } = options;

  const queue = [{ path: rootPath, depth: 0 }];

  while (queue.length > 0) {
    const { path: currentPath, depth } = queue.shift();

    if (depth > maxDepth) continue;

    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);

        // Skip certain directories
        if (shouldSkip(entry.name, fullPath)) continue;

        try {
          const statFn = followSymlinks ? stat : lstat;
          const stats = await statFn(fullPath);

          // Skip symlinks if not following them
          if (!followSymlinks && stats.isSymbolicLink()) continue;

          if (stats.isDirectory()) {
            // Add directory to queue for traversal
            queue.push({ path: fullPath, depth: depth + 1 });
          } else if (stats.isFile()) {
            // Yield file information
            yield {
              path: fullPath,
              size: stats.size,
              modified: stats.mtime,
              accessed: stats.atime,
              created: stats.birthtime,
              isDirectory: false,
            };
          }
        } catch (err) {
          // Permission denied or other stat error
          onError({ path: fullPath, error: err });
        }
      }
    } catch (err) {
      // Permission denied or other readdir error
      onError({ path: currentPath, error: err });
    }
  }
}

/**
 * Counts files in a directory tree (for progress estimation)
 */
export async function estimateFileCount(rootPath, sampleSize = 1000) {
  let count = 0;
  const startTime = Date.now();

  try {
    for await (const _ of traverseDirectory(rootPath)) {
      count++;
      // Stop after sample size or 5 seconds to keep estimation quick
      if (count >= sampleSize || Date.now() - startTime > 5000) {
        break;
      }
    }
  } catch (err) {
    // Ignore errors during estimation
  }

  // If we hit the sample size, estimate total based on typical ratios
  if (count >= sampleSize) {
    return count * 10; // Rough estimate
  }

  return count;
}

export default { traverseDirectory, estimateFileCount };
