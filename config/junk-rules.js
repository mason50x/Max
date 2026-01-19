/**
 * Junk file detection rules
 * Each rule has:
 * - pattern: glob pattern or regex
 * - category: type of junk (cache, logs, temp, dev, downloads)
 * - description: human-readable description
 * - weight: priority weight (higher = more likely to suggest deletion)
 */

export const junkRules = [
  // === System Caches ===
  {
    pattern: '**/Library/Caches/**/*',
    category: 'cache',
    description: 'System and app caches',
    weight: 10,
  },
  {
    pattern: '**/.cache/**/*',
    category: 'cache',
    description: 'User cache directories',
    weight: 10,
  },
  {
    pattern: '**/Cache/**/*',
    category: 'cache',
    description: 'Application cache folders',
    weight: 8,
  },
  {
    pattern: '**/*.cache',
    category: 'cache',
    description: 'Cache files',
    weight: 8,
  },

  // === Browser Caches ===
  {
    pattern: '**/Google/Chrome/**/Cache/**/*',
    category: 'cache',
    description: 'Chrome browser cache',
    weight: 10,
  },
  {
    pattern: '**/Firefox/Profiles/**/cache2/**/*',
    category: 'cache',
    description: 'Firefox browser cache',
    weight: 10,
  },
  {
    pattern: '**/Safari/Databases/**/*',
    category: 'cache',
    description: 'Safari databases',
    weight: 6,
  },

  // === Log Files ===
  {
    pattern: '**/Library/Logs/**/*',
    category: 'logs',
    description: 'System and app logs',
    weight: 8,
  },
  {
    pattern: '**/*.log',
    category: 'logs',
    description: 'Log files',
    weight: 8,
  },
  {
    pattern: '**/*.log.*',
    category: 'logs',
    description: 'Rotated log files',
    weight: 9,
  },
  {
    pattern: '**/logs/**/*.log',
    category: 'logs',
    description: 'Log directories',
    weight: 8,
  },

  // === Temp Files ===
  {
    pattern: '**/tmp/**/*',
    category: 'temp',
    description: 'Temporary files',
    weight: 9,
  },
  {
    pattern: '**/*.tmp',
    category: 'temp',
    description: 'Temp files',
    weight: 9,
  },
  {
    pattern: '**/*.temp',
    category: 'temp',
    description: 'Temp files',
    weight: 9,
  },
  {
    pattern: '**/*~',
    category: 'temp',
    description: 'Backup files',
    weight: 7,
  },
  {
    pattern: '**/.*.swp',
    category: 'temp',
    description: 'Vim swap files',
    weight: 8,
  },
  {
    pattern: '**/.*.swo',
    category: 'temp',
    description: 'Vim swap files',
    weight: 8,
  },
  {
    pattern: '**/*.bak',
    category: 'temp',
    description: 'Backup files',
    weight: 7,
  },
  {
    pattern: '**/.DS_Store',
    category: 'temp',
    description: 'macOS metadata files',
    weight: 10,
  },
  {
    pattern: '**/Thumbs.db',
    category: 'temp',
    description: 'Windows thumbnail cache',
    weight: 10,
  },

  // === Development Artifacts ===
  {
    pattern: '**/node_modules/**/*',
    category: 'dev',
    description: 'Node.js dependencies',
    weight: 5,
  },
  {
    pattern: '**/.npm/**/*',
    category: 'dev',
    description: 'npm cache',
    weight: 8,
  },
  {
    pattern: '**/.yarn/cache/**/*',
    category: 'dev',
    description: 'Yarn cache',
    weight: 8,
  },
  {
    pattern: '**/DerivedData/**/*',
    category: 'dev',
    description: 'Xcode derived data',
    weight: 9,
  },
  {
    pattern: '**/build/**/*',
    category: 'dev',
    description: 'Build artifacts',
    weight: 4,
  },
  {
    pattern: '**/dist/**/*',
    category: 'dev',
    description: 'Distribution builds',
    weight: 4,
  },
  {
    pattern: '**/__pycache__/**/*',
    category: 'dev',
    description: 'Python bytecode cache',
    weight: 9,
  },
  {
    pattern: '**/*.pyc',
    category: 'dev',
    description: 'Python compiled files',
    weight: 9,
  },
  {
    pattern: '**/target/debug/**/*',
    category: 'dev',
    description: 'Rust debug builds',
    weight: 7,
  },
  {
    pattern: '**/target/release/**/*',
    category: 'dev',
    description: 'Rust release builds',
    weight: 5,
  },
  {
    pattern: '**/.gradle/**/*',
    category: 'dev',
    description: 'Gradle cache',
    weight: 7,
  },
  {
    pattern: '**/.m2/repository/**/*',
    category: 'dev',
    description: 'Maven repository cache',
    weight: 6,
  },
  {
    pattern: '**/Pods/**/*',
    category: 'dev',
    description: 'CocoaPods dependencies',
    weight: 5,
  },
  {
    pattern: '**/.cocoapods/**/*',
    category: 'dev',
    description: 'CocoaPods cache',
    weight: 8,
  },
  {
    pattern: '**/vendor/bundle/**/*',
    category: 'dev',
    description: 'Ruby bundler cache',
    weight: 6,
  },
  {
    pattern: '**/coverage/**/*',
    category: 'dev',
    description: 'Test coverage reports',
    weight: 8,
  },
  {
    pattern: '**/.jest/**/*',
    category: 'dev',
    description: 'Jest cache',
    weight: 9,
  },
  {
    pattern: '**/.next/**/*',
    category: 'dev',
    description: 'Next.js build cache',
    weight: 7,
  },
  {
    pattern: '**/.nuxt/**/*',
    category: 'dev',
    description: 'Nuxt.js build cache',
    weight: 7,
  },
  {
    pattern: '**/.turbo/**/*',
    category: 'dev',
    description: 'Turborepo cache',
    weight: 8,
  },

  // === Old Downloads ===
  {
    pattern: '**/Downloads/*.dmg',
    category: 'downloads',
    description: 'Disk image files',
    weight: 8,
  },
  {
    pattern: '**/Downloads/*.pkg',
    category: 'downloads',
    description: 'Package installers',
    weight: 8,
  },
  {
    pattern: '**/Downloads/*.zip',
    category: 'downloads',
    description: 'Zip archives in Downloads',
    weight: 5,
  },
  {
    pattern: '**/Downloads/*.tar.gz',
    category: 'downloads',
    description: 'Tar archives in Downloads',
    weight: 6,
  },
  {
    pattern: '**/Downloads/*.exe',
    category: 'downloads',
    description: 'Windows executables',
    weight: 9,
  },
  {
    pattern: '**/Downloads/*.msi',
    category: 'downloads',
    description: 'Windows installers',
    weight: 9,
  },
];

/**
 * Get rules by category
 */
export const getRulesByCategory = (category) => {
  return junkRules.filter((rule) => rule.category === category);
};

/**
 * Get all categories
 */
export const getCategories = () => {
  return [...new Set(junkRules.map((rule) => rule.category))];
};

export default { junkRules, getRulesByCategory, getCategories };
