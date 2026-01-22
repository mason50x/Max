import chalk from 'chalk';

// Color palette - Modern, clean terminal aesthetic
export const colors = {
  // Primary colors
  primary: '#7C3AED',      // Purple
  primaryBright: '#A78BFA',

  // Accent colors
  accent: '#06B6D4',       // Cyan
  accentBright: '#67E8F9',

  // Status colors
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  danger: '#EF4444',       // Red
  info: '#3B82F6',         // Blue

  // Neutral colors
  text: '#F9FAFB',         // Near white
  textMuted: '#9CA3AF',    // Gray
  textDim: '#6B7280',      // Darker gray

  // Background shades (for borders, etc)
  border: '#374151',
  borderLight: '#4B5563',

  // Category colors for junk types
  cache: '#F97316',        // Orange
  logs: '#8B5CF6',         // Violet
  temp: '#EC4899',         // Pink
  dev: '#14B8A6',          // Teal
  downloads: '#6366F1',    // Indigo
};

// Styled text helpers using chalk
export const style = {
  // Primary styles
  primary: (text) => chalk.hex(colors.primary)(text),
  primaryBright: (text) => chalk.hex(colors.primaryBright)(text),
  accent: (text) => chalk.hex(colors.accent)(text),
  accentBright: (text) => chalk.hex(colors.accentBright)(text),

  // Status styles
  success: (text) => chalk.hex(colors.success)(text),
  warning: (text) => chalk.hex(colors.warning)(text),
  danger: (text) => chalk.hex(colors.danger)(text),
  info: (text) => chalk.hex(colors.info)(text),

  // Text styles
  text: (text) => chalk.hex(colors.text)(text),
  muted: (text) => chalk.hex(colors.textMuted)(text),
  dim: (text) => chalk.hex(colors.textDim)(text),

  // Combined styles
  bold: (text) => chalk.bold(text),
  boldPrimary: (text) => chalk.bold.hex(colors.primary)(text),
  boldAccent: (text) => chalk.bold.hex(colors.accent)(text),
  boldSuccess: (text) => chalk.bold.hex(colors.success)(text),
  boldWarning: (text) => chalk.bold.hex(colors.warning)(text),
  boldDanger: (text) => chalk.bold.hex(colors.danger)(text),

  // Category styles
  cache: (text) => chalk.hex(colors.cache)(text),
  logs: (text) => chalk.hex(colors.logs)(text),
  temp: (text) => chalk.hex(colors.temp)(text),
  dev: (text) => chalk.hex(colors.dev)(text),
  downloads: (text) => chalk.hex(colors.downloads)(text),

  // Special styles
  selected: (text) => chalk.bgHex(colors.primary).hex(colors.text)(text),
  highlight: (text) => chalk.bgHex(colors.accent).hex('#000000')(text),
};

// Box drawing characters
export const box = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
  verticalRight: '├',
  verticalLeft: '┤',
  horizontalDown: '┬',
  horizontalUp: '┴',
  cross: '┼',
};

// Icons/symbols
export const icons = {
  check: '✓',
  cross: '✗',
  bullet: '•',
  arrow: '→',
  arrowUp: '↑',
  arrowDown: '↓',
  folder: '📁',
  file: '📄',
  trash: '🗑',
  search: '🔍',
  warning: '⚠',
  info: 'ℹ',
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  disk: '💾',
  duplicate: '📋',
  junk: '🧹',
  large: '📦',
  clock: '⏱',
  settings: '⚙️',
};

// Screen names for navigation
export const screens = {
  SCAN: 'scan',
  DUPLICATES: 'duplicates',
  JUNK: 'junk',
  LARGE: 'large',
  REVIEW: 'review',
  SETTINGS: 'settings',
};

export default { colors, style, box, icons, screens };
