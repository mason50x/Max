import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import { filesize } from 'filesize';
import { formatDistanceToNow } from 'date-fns';

const ITEMS_PER_PAGE = 10;

const LargeFilesScreen = () => {
  const largeFiles = useStore((state) => state.largeFiles);
  const selectedLarge = useStore((state) => state.selectedLarge);
  const toggleLargeSelection = useStore((state) => state.toggleLargeSelection);
  const selectAllLarge = useStore((state) => state.selectAllLarge);
  const clearAllSelections = useStore((state) => state.clearAllSelections);
  const scanStatus = useStore((state) => state.scanStatus);

  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('size'); // 'size', 'age', 'name'

  // Sort files
  const sortedFiles = [...largeFiles].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return b.size - a.size;
      case 'age':
        return new Date(a.lastAccessed) - new Date(b.lastAccessed);
      case 'name':
        return a.path.localeCompare(b.path);
      default:
        return b.size - a.size;
    }
  });

  const totalSize = largeFiles.reduce((sum, f) => sum + f.size, 0);
  const selectedSize = largeFiles.reduce((sum, f) => selectedLarge.has(f.path) ? sum + f.size : sum, 0);
  const totalPages = Math.ceil(sortedFiles.length / ITEMS_PER_PAGE);
  const visibleFiles = sortedFiles.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  useInput((input, key) => {
    // Pagination
    if (key.rightArrow || input === 'n' || input === 'N') {
      setPage((p) => Math.min(totalPages - 1, p + 1));
    }
    if (key.leftArrow || input === 'p' || input === 'P') {
      setPage((p) => Math.max(0, p - 1));
    }

    // Toggle selection with number keys
    const num = parseInt(input);
    if (num >= 1 && num <= ITEMS_PER_PAGE && num <= visibleFiles.length) {
      toggleLargeSelection(visibleFiles[num - 1].path);
    }

    // Sort toggle
    if (input === 's' || input === 'S') {
      const sorts = ['size', 'age', 'name'];
      const idx = sorts.indexOf(sortBy);
      setSortBy(sorts[(idx + 1) % sorts.length]);
    }

    // Select all
    if (input === 'a' || input === 'A') {
      selectAllLarge();
    }

    // Clear
    if (input === 'c' || input === 'C') {
      clearAllSelections();
    }
  });

  if (scanStatus !== 'complete') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(Text, { bold: true, color: colors.text }, icons.large, ' Large Files'),
      React.createElement(Text, null, ''),
      React.createElement(Text, { color: colors.textMuted }, 'Run a scan first to find large files.'),
      React.createElement(Text, { color: colors.textDim }, 'Press ', React.createElement(Text, { color: colors.accent }, '1'), ' to go to Scan')
    );
  }

  if (largeFiles.length === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(Text, { bold: true, color: colors.text }, icons.large, ' Large Files'),
      React.createElement(Text, null, ''),
      React.createElement(Text, { color: colors.success }, icons.check, ' No large files (>100MB) found!')
    );
  }

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Header
    React.createElement(
      Text,
      { bold: true, color: colors.text },
      icons.large, ' Large Files  ',
      React.createElement(Text, { color: colors.textMuted }, `${largeFiles.length} files • ${filesize(totalSize)}`)
    ),
    React.createElement(
      Text,
      { color: colors.accent },
      `Selected: ${selectedLarge.size} files (${filesize(selectedSize)})`
    ),
    React.createElement(Text, null, ''),

    // Sort indicator
    React.createElement(
      Text,
      { color: colors.textDim },
      'Sort: ',
      React.createElement(
        Text,
        { color: colors.accent },
        sortBy === 'size' ? '▼ Size' : sortBy === 'age' ? '▲ Last Access' : '▲ Name'
      ),
      '  (press s to change)'
    ),

    // Table
    React.createElement(Text, { color: colors.border }, '─'.repeat(65)),
    React.createElement(
      Text,
      { color: colors.textDim },
      '#   File                              Size        Last Accessed'
    ),
    React.createElement(Text, { color: colors.border }, '─'.repeat(65)),

    ...visibleFiles.map((file, idx) => {
      const num = idx + 1;
      const isSelected = selectedLarge.has(file.path);
      const displayPath = file.path.replace(process.env.HOME, '~');
      const filename = displayPath.split('/').pop();
      const shortName = filename.length > 30 ? filename.slice(0, 27) + '...' : filename;

      let lastAccessed = 'Unknown';
      try {
        if (file.lastAccessed) {
          lastAccessed = formatDistanceToNow(new Date(file.lastAccessed), { addSuffix: false });
          if (lastAccessed.length > 12) {
            lastAccessed = lastAccessed.slice(0, 12);
          }
        }
      } catch (e) {}

      return React.createElement(
        Text,
        { key: file.path, color: isSelected ? colors.accent : colors.text },
        React.createElement(Text, { color: colors.accent }, `${num}`.padStart(2), '. '),
        isSelected ? '✓ ' : '  ',
        shortName.padEnd(32),
        React.createElement(Text, { color: colors.info, bold: true }, filesize(file.size).padStart(10)),
        '  ',
        React.createElement(Text, { color: colors.textDim }, lastAccessed)
      );
    }),

    React.createElement(Text, { color: colors.border }, '─'.repeat(65)),

    // Pagination and hints
    React.createElement(
      Box,
      { justifyContent: 'space-between' },
      React.createElement(Text, { color: colors.textMuted }, `Page ${page + 1}/${totalPages || 1}`),
      React.createElement(
        Text,
        { color: colors.textDim },
        React.createElement(Text, { color: colors.accent }, '←/→'),
        ' page  ',
        React.createElement(Text, { color: colors.accent }, '1-9'),
        ' toggle  ',
        React.createElement(Text, { color: colors.accent }, 'a'),
        ' all  ',
        React.createElement(Text, { color: colors.accent }, 'c'),
        ' clear'
      )
    )
  );
};

export default LargeFilesScreen;
