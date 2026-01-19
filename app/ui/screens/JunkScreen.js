import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import { filesize } from 'filesize';

// Category colors and icons
const categoryInfo = {
  cache: { color: colors.cache, icon: '📦', label: 'Caches' },
  logs: { color: colors.logs, icon: '📋', label: 'Log Files' },
  temp: { color: colors.temp, icon: '🗂', label: 'Temp Files' },
  dev: { color: colors.dev, icon: '💻', label: 'Dev Artifacts' },
  downloads: { color: colors.downloads, icon: '📥', label: 'Old Downloads' },
  other: { color: colors.textMuted, icon: '📄', label: 'Other' },
};

const JunkScreen = () => {
  const junkFiles = useStore((state) => state.junkFiles);
  const selectedJunk = useStore((state) => state.selectedJunk);
  const toggleJunkSelection = useStore((state) => state.toggleJunkSelection);
  const selectAllJunk = useStore((state) => state.selectAllJunk);
  const scanStatus = useStore((state) => state.scanStatus);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'list'
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Group files by category
  const categorizedFiles = {};
  junkFiles.forEach((file) => {
    const cat = file.category || 'other';
    if (!categorizedFiles[cat]) {
      categorizedFiles[cat] = [];
    }
    categorizedFiles[cat].push(file);
  });

  // Build flattened list for navigation
  const flattenedItems = [];
  Object.entries(categorizedFiles).forEach(([category, files]) => {
    const info = categoryInfo[category] || categoryInfo.other;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const selectedCount = files.filter((f) => selectedJunk.has(f.path)).length;

    flattenedItems.push({
      type: 'category',
      category,
      info,
      count: files.length,
      selectedCount,
      totalSize,
      expanded: expandedCategory === category,
    });

    if (expandedCategory === category) {
      files.forEach((file) => {
        flattenedItems.push({
          type: 'file',
          category,
          path: file.path,
          size: file.size,
          isSelected: selectedJunk.has(file.path),
        });
      });
    }
  });

  // Handle keyboard input
  useInput((input, key) => {
    if (flattenedItems.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => Math.min(flattenedItems.length - 1, i + 1));
    }

    const currentItem = flattenedItems[selectedIndex];

    // Enter to expand/collapse category
    if (key.return && currentItem?.type === 'category') {
      setExpandedCategory(expandedCategory === currentItem.category ? null : currentItem.category);
    }

    // Space to toggle selection
    if (input === ' ') {
      if (currentItem?.type === 'file') {
        toggleJunkSelection(currentItem.path);
      } else if (currentItem?.type === 'category') {
        // Toggle all in category
        const files = categorizedFiles[currentItem.category];
        const allSelected = files.every((f) => selectedJunk.has(f.path));
        files.forEach((f) => {
          if (allSelected && selectedJunk.has(f.path)) {
            toggleJunkSelection(f.path);
          } else if (!allSelected && !selectedJunk.has(f.path)) {
            toggleJunkSelection(f.path);
          }
        });
      }
    }

    // 'a' to select all
    if (input === 'a' || input === 'A') {
      selectAllJunk();
    }
  });

  // Calculate selected size
  const selectedSize = junkFiles.reduce((acc, f) => {
    return selectedJunk.has(f.path) ? acc + f.size : acc;
  }, 0);

  if (scanStatus !== 'complete') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.junk,
        ' Junk Files'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'Run a scan first to find junk files.'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textDim },
        'Press ',
        React.createElement(Text, { color: colors.accent }, '1'),
        ' to go to Scan screen'
      )
    );
  }

  if (junkFiles.length === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.junk,
        ' Junk Files'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.success },
        icons.check,
        ' No junk files found! Your system is clean.'
      )
    );
  }

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Header
    React.createElement(
      Box,
      { justifyContent: 'space-between' },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.junk,
        ' Junk Files ',
        React.createElement(Text, { color: colors.textMuted }, `(${junkFiles.length} items)`)
      ),
      React.createElement(
        Text,
        { color: colors.warning },
        `Selected: ${selectedJunk.size} files (${filesize(selectedSize)})`
      )
    ),
    React.createElement(Text, null, ''),

    // Category list
    ...flattenedItems.map((item, index) => {
      const isHighlighted = index === selectedIndex;

      if (item.type === 'category') {
        const info = item.info;
        return React.createElement(
          Text,
          {
            key: `cat-${item.category}`,
            color: isHighlighted ? colors.text : info.color,
            backgroundColor: isHighlighted ? colors.primary : undefined,
          },
          item.expanded ? '▼ ' : '▶ ',
          info.icon,
          ' ',
          info.label.padEnd(15),
          React.createElement(
            Text,
            { color: isHighlighted ? colors.text : colors.textMuted },
            `${item.count} items  `
          ),
          React.createElement(
            Text,
            { color: isHighlighted ? colors.text : colors.textDim },
            filesize(item.totalSize)
          ),
          item.selectedCount > 0
            ? React.createElement(
                Text,
                { color: colors.accent },
                `  [${item.selectedCount} selected]`
              )
            : ''
        );
      }

      // File item
      const displayPath = item.path.replace(process.env.HOME, '~');
      const truncatedPath = displayPath.length > 60
        ? '...' + displayPath.slice(-57)
        : displayPath;

      return React.createElement(
        Text,
        {
          key: item.path,
          color: isHighlighted ? colors.text : colors.textMuted,
          backgroundColor: isHighlighted ? colors.primary : undefined,
        },
        '   ',
        item.isSelected
          ? React.createElement(Text, { color: colors.accent }, '✓ ')
          : '  ',
        truncatedPath,
        '  ',
        React.createElement(Text, { color: colors.textDim }, filesize(item.size))
      );
    }),

    // Footer hints
    React.createElement(Text, null, ''),
    React.createElement(
      Text,
      { color: colors.textDim },
      React.createElement(Text, { color: colors.accent }, 'Enter'),
      ' expand  ',
      React.createElement(Text, { color: colors.accent }, 'Space'),
      ' select  ',
      React.createElement(Text, { color: colors.accent }, 'a'),
      ' all'
    )
  );
};

export default JunkScreen;
