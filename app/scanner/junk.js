import { junkRules } from '../../config/junk-rules.js';
import { minimatch } from 'minimatch';

// Compile patterns for faster matching
const compiledRules = junkRules.map((rule) => ({
  ...rule,
  // Pre-process pattern for matching
  test: (path) => {
    // Handle glob patterns
    if (rule.pattern.includes('*')) {
      return minimatch(path, rule.pattern, { dot: true });
    }
    // Handle simple string matching
    return path.includes(rule.pattern);
  },
}));

/**
 * Check if a file matches any junk rule
 * Returns the matching rule or null
 */
export function matchJunkRule(filePath) {
  for (const rule of compiledRules) {
    if (rule.test(filePath)) {
      return {
        category: rule.category,
        description: rule.description,
        weight: rule.weight,
      };
    }
  }
  return null;
}

/**
 * Find junk files from a list of file info objects
 */
export async function findJunkFiles(files, onProgress = () => {}) {
  const junkFiles = [];
  let processed = 0;

  onProgress({ message: 'Scanning for junk files...', processed: 0, total: files.length });

  for (const file of files) {
    const match = matchJunkRule(file.path);

    if (match) {
      junkFiles.push({
        path: file.path,
        size: file.size,
        modified: file.modified,
        category: match.category,
        description: match.description,
        weight: match.weight,
      });
    }

    processed++;
    if (processed % 1000 === 0) {
      onProgress({
        message: `Scanning for junk: ${processed}/${files.length}`,
        processed,
        total: files.length,
      });
    }
  }

  // Sort by weight (higher weight = more likely to be deleted)
  junkFiles.sort((a, b) => b.weight - a.weight);

  onProgress({
    message: `Found ${junkFiles.length} junk files`,
    processed: files.length,
    total: files.length,
    complete: true,
  });

  return junkFiles;
}

/**
 * Group junk files by category
 */
export function groupByCategory(junkFiles) {
  const groups = {};

  for (const file of junkFiles) {
    if (!groups[file.category]) {
      groups[file.category] = {
        files: [],
        totalSize: 0,
      };
    }
    groups[file.category].files.push(file);
    groups[file.category].totalSize += file.size;
  }

  return groups;
}

export default { matchJunkRule, findJunkFiles, groupByCategory };
