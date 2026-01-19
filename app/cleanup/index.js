import { unlink, rm } from 'fs/promises';
import { stat } from 'fs/promises';
import { useStore } from '../store.js';

// Try to import trash, fall back to permanent delete
let trashFn = null;
try {
  const trashModule = await import('trash');
  trashFn = trashModule.default;
} catch (err) {
  console.warn('trash module not available, will use permanent delete');
}

/**
 * Move files to trash (safe deletion)
 */
export async function moveToTrash(paths) {
  if (!trashFn) {
    throw new Error('Trash functionality not available. Use permanent delete instead.');
  }

  const results = {
    success: [],
    failed: [],
    freedSpace: 0,
  };

  for (const filePath of paths) {
    try {
      // Get file size before deletion
      const stats = await stat(filePath);
      const size = stats.size;

      await trashFn(filePath);

      results.success.push(filePath);
      results.freedSpace += size;
    } catch (err) {
      results.failed.push({ path: filePath, error: err.message });
    }
  }

  return results;
}

/**
 * Permanently delete files (no undo)
 */
export async function permanentDelete(paths) {
  const results = {
    success: [],
    failed: [],
    freedSpace: 0,
  };

  for (const filePath of paths) {
    try {
      // Get file size before deletion
      const stats = await stat(filePath);
      const size = stats.size;

      // Check if it's a directory
      if (stats.isDirectory()) {
        await rm(filePath, { recursive: true });
      } else {
        await unlink(filePath);
      }

      results.success.push(filePath);
      results.freedSpace += size;
    } catch (err) {
      results.failed.push({ path: filePath, error: err.message });
    }
  }

  return results;
}

/**
 * Perform cleanup operation
 * @param {string[]} paths - Array of file paths to delete
 * @param {boolean} permanent - If true, permanently delete; if false, move to trash
 */
export async function performCleanup(paths, permanent = false) {
  if (!paths || paths.length === 0) {
    return {
      success: true,
      deletedCount: 0,
      freedSpace: 0,
      failedCount: 0,
    };
  }

  let results;

  if (permanent) {
    results = await permanentDelete(paths);
  } else {
    // Try trash first, fall back to permanent delete if trash unavailable
    if (trashFn) {
      results = await moveToTrash(paths);
    } else {
      results = await permanentDelete(paths);
    }
  }

  // Update store to remove cleaned items
  if (results.success.length > 0) {
    const store = useStore.getState();
    store.removeCleanedItems(results.success);
  }

  return {
    success: results.failed.length === 0,
    deletedCount: results.success.length,
    freedSpace: results.freedSpace,
    failedCount: results.failed.length,
    failed: results.failed,
  };
}

/**
 * Undo last cleanup (restore from trash)
 * Note: This only works for files moved to trash, not permanently deleted
 */
export async function undoCleanup() {
  // macOS doesn't have a programmatic way to restore from Trash
  // Users need to manually restore from Trash
  return {
    success: false,
    message: 'Please restore files manually from the Trash folder.',
  };
}

export default { moveToTrash, permanentDelete, performCleanup, undoCleanup };
