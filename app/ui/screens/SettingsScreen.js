import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const themes = [
  { id: 'default', name: 'Default', primary: '#7C3AED', accent: '#06B6D4' },
  { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', accent: '#14B8A6' },
  { id: 'forest', name: 'Forest', primary: '#22C55E', accent: '#84CC16' },
  { id: 'sunset', name: 'Sunset', primary: '#F97316', accent: '#EAB308' },
  { id: 'rose', name: 'Rose', primary: '#EC4899', accent: '#F43F5E' },
];

const menuItems = [
  { id: 'theme', label: 'Theme', icon: '🎨' },
  { id: 'github', label: 'GitHub Repository', icon: '🔗' },
  { id: 'about', label: 'About Max', icon: 'ℹ️' },
  { id: 'uninstall', label: 'Uninstall Max', icon: '🗑' },
];

const SettingsScreen = () => {
  const { exit } = useApp();
  const currentTheme = useStore((state) => state.theme) || 'default';
  const setTheme = useStore((state) => state.setTheme);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
  const [themeIndex, setThemeIndex] = useState(themes.findIndex(t => t.id === currentTheme) || 0);

  useInput((input, key) => {
    // Handle uninstall confirmation
    if (showUninstallConfirm) {
      if (input === 'y' || input === 'Y') {
        // Perform uninstall
        try {
          const appDir = process.cwd();
          exit();
          console.log('\n\nTo uninstall Max, run:\n');
          console.log(`  cd ${appDir} && npm unlink -g && cd .. && rm -rf Max\n`);
        } catch (err) {
          // Exit anyway
        }
        return;
      }
      if (input === 'n' || input === 'N' || key.escape) {
        setShowUninstallConfirm(false);
        return;
      }
      return;
    }

    // Theme selection mode
    if (activeSection === 'theme') {
      if (input === 'k' || input === 'K') {
        setThemeIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (input === 'j' || input === 'J') {
        setThemeIndex((i) => Math.min(themes.length - 1, i + 1));
        return;
      }
      if (key.return || input === ' ') {
        setTheme(themes[themeIndex].id);
        setActiveSection(null);
        return;
      }
      if (key.escape) {
        setActiveSection(null);
        return;
      }
      return;
    }

    // Main menu navigation (j/k to avoid conflict with screen nav)
    if (input === 'k' || input === 'K') {
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
    if (input === 'j' || input === 'J') {
      setSelectedIndex((i) => Math.min(menuItems.length - 1, i + 1));
    }

    if (key.return) {
      const item = menuItems[selectedIndex];

      if (item.id === 'theme') {
        setActiveSection('theme');
      } else if (item.id === 'github') {
        // Open GitHub in browser
        try {
          execSync('open https://github.com/mason50x/Max');
        } catch (err) {
          // Fallback: just show the URL
        }
      } else if (item.id === 'uninstall') {
        setShowUninstallConfirm(true);
      }
    }
  });

  // Uninstall confirmation dialog
  if (showUninstallConfirm) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.danger },
        '⚠️  Uninstall Max'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.text },
        'Are you sure you want to uninstall Max?'
      ),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'This will remove the application from your system.'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Box,
        { flexDirection: 'row' },
        React.createElement(
          Text,
          { color: colors.danger },
          '[',
          React.createElement(Text, { bold: true }, 'Y'),
          '] Yes, uninstall'
        ),
        React.createElement(Text, null, '    '),
        React.createElement(
          Text,
          { color: colors.textMuted },
          '[',
          React.createElement(Text, { bold: true }, 'N'),
          '] Cancel'
        )
      )
    );
  }

  // Theme selection view
  if (activeSection === 'theme') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        '🎨 Select Theme'
      ),
      React.createElement(Text, null, ''),
      ...themes.map((theme, index) => {
        const isSelected = index === themeIndex;
        const isCurrent = theme.id === currentTheme;

        return React.createElement(
          Box,
          { key: theme.id, marginBottom: 0 },
          React.createElement(
            Text,
            {
              color: isSelected ? colors.text : colors.textMuted,
              backgroundColor: isSelected ? colors.primary : undefined,
            },
            isSelected ? ' ▶ ' : '   ',
            React.createElement(Text, { color: theme.primary, bold: true }, '●'),
            React.createElement(Text, { color: theme.accent }, '●'),
            ' ',
            theme.name.padEnd(12),
            isCurrent
              ? React.createElement(Text, { color: colors.success }, ' (current)')
              : ''
          )
        );
      }),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textDim },
        React.createElement(Text, { color: colors.accent }, 'j/k'),
        ' navigate  ',
        React.createElement(Text, { color: colors.accent }, 'Enter'),
        ' select  ',
        React.createElement(Text, { color: colors.accent }, 'Esc'),
        ' back'
      )
    );
  }

  // Main settings view
  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },
    React.createElement(
      Text,
      { bold: true, color: colors.text },
      '⚙️  Settings'
    ),
    React.createElement(Text, null, ''),

    // Menu items
    ...menuItems.map((item, index) => {
      const isSelected = index === selectedIndex;

      return React.createElement(
        Box,
        { key: item.id, marginBottom: 1 },
        React.createElement(
          Text,
          {
            color: isSelected ? colors.text : colors.textMuted,
            backgroundColor: isSelected ? colors.primary : undefined,
          },
          isSelected ? ' ▶ ' : '   ',
          item.icon,
          ' ',
          item.label,
          item.id === 'theme'
            ? React.createElement(
                Text,
                { color: colors.textDim },
                ` (${themes.find(t => t.id === currentTheme)?.name || 'Default'})`
              )
            : ''
        )
      );
    }),

    React.createElement(Text, null, ''),

    // GitHub info box
    React.createElement(
      Box,
      {
        flexDirection: 'column',
        borderStyle: 'round',
        borderColor: colors.border,
        paddingX: 2,
        paddingY: 1,
        marginTop: 1,
      },
      React.createElement(
        Text,
        { color: colors.accent },
        '🔗 github.com/mason50x/Max'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'Star the repo if you find Max useful!'
      ),
      React.createElement(
        Text,
        { color: colors.textDim },
        'Report issues and contribute on GitHub.'
      )
    ),

    React.createElement(Text, null, ''),
    React.createElement(
      Text,
      { color: colors.textDim },
      React.createElement(Text, { color: colors.accent }, 'j/k'),
      ' navigate  ',
      React.createElement(Text, { color: colors.accent }, 'Enter'),
      ' select'
    )
  );
};

export default SettingsScreen;
