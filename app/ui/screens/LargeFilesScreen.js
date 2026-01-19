import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import FilePreview from '../components/FilePreview.js';
import { filesize } from 'filesize';
import { formatDistanceToNow } from 'date-fns';

const LargeFilesScreen = () => {
  const largeFiles = useStore((state) => state.largeFiles);
  const selectedLarge = useStore((state) => state.selectedLarge);
  const toggleLargeSelection = useStore((state) => state.toggleLargeSelection);
  const selectAllLarge = useStore((state) => state.selectAllLarge);
  const scanStatus = useStore((state) => state.scanStatus);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
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

  // Handle keyboard input
  useInput((input, key) => {
    if (sortedFiles.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => Math.min(sortedFiles.length - 1, i + 1));
    }

    const currentFile = sortedFiles[selectedIndex];

    // Space to toggle selection
    if (input === ' ' && currentFile) {
      toggleLargeSelection(currentFile.path);
    }

    // 'a' to select all
    if (input === 'a' || input === 'A') {
      selectAllLarge();
    }

    // 'p' to preview
    if (input === 'p' || input === 'P') {
      setShowPreview(!showPreview);
    }

    // 's' to cycle sort
    if (input === 's' || input === 'S') {
      const sortOptions = ['size', 'age', 'name'];
      const currentIdx = sortOptions.indexOf(sortBy);
      setSortBy(sortOptions[(currentIdx + 1) % sortOptions.length]);
    }
  });

  // Calculate selected size
  const selectedSize = largeFiles.reduce((acc, f) => {
    return selectedLarge.has(f.path) ? acc + f.size : acc;
  }, 0);

  const currentFile = sortedFiles[selectedIndex];

  if (scanStatus !== 'complete') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.large,
        ' Large Files'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'Run a scan first to find large files.'
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

  if (largeFiles.length === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.large,
        ' Large Files'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.success },
        icons.check,
        ' No large files (>100MB) found!'
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
        icons.large,
        ' Large Files ',
        React.createElement(Text, { color: colors.textMuted }, `(${largeFiles.length} files >100MB)`)
      ),
      React.createElement(
        Text,
        { color: colors.info },
        `Selected: ${selectedLarge.size} files (${filesize(selectedSize)})`
      )
    ),
    React.createElement(Text, null, ''),

    // Sort indicator
    React.createElement(
      Text,
      { color: colors.textDim },
      'Sort by: ',
      React.createElement(
        Text,
        { color: colors.accent },
        sortBy === 'size' ? 'Size ↓' : sortBy === 'age' ? 'Last Accessed ↑' : 'Name'
      ),
      '  (press ',
      React.createElement(Text, { color: colors.accent }, 's'),
      ' to change)'
    ),
    React.createElement(Text, null, ''),

    // Main content
    React.createElement(
      Box,
      { flexDirection: 'row', flexGrow: 1 },

      // File list
      React.createElement(
        Box,
        { flexDirection: 'column', width: showPreview ? '50%' : '100%' },
        ...sortedFiles.slice(0, 20).map((file, index) => {
          const isHighlighted = index === selectedIndex;
          const isSelected = selectedLarge.has(file.path);

          const displayPath = file.path.replace(process.env.HOME, '~');
          const filename = displayPath.split('/').pop();
          const dir = displayPath.slice(0, -filename.length);

          let lastAccessed = 'Unknown';
          try {
            if (file.lastAccessed) {
              lastAccessed = formatDistanceToNow(new Date(file.lastAccessed), { addSuffix: true });
            }
          } catch (e) {
            // Ignore date parsing errors
          }

          return React.createElement(
            Box,
            {
              key: file.path,
              flexDirection: 'column',
              marginBottom: 0,
            },
            React.createElement(
              Text,
              {
                color: isHighlighted ? colors.text : colors.text,
                backgroundColor: isHighlighted ? colors.primary : undefined,
              },
              isSelected
                ? React.createElement(Text, { color: colors.accent }, '✓ ')
                : '  ',
              React.createElement(Text, { bold: true }, filename.slice(0, 30)),
              '  ',
              React.createElement(
                Text,
                { color: isHighlighted ? colors.accentBright : colors.info, bold: true },
                filesize(file.size).padStart(10)
              ),
              '  ',
              React.createElement(
                Text,
                { color: isHighlighted ? colors.text : colors.textDim },
                `accessed ${lastAccessed}`
              )
            ),
            React.createElement(
              Text,
              {
                color: isHighlighted ? colors.textMuted : colors.textDim,
                backgroundColor: isHighlighted ? colors.primary : undefined,
              },
              '   ',
              dir.length > 50 ? '...' + dir.slice(-47) : dir
            )
          );
        }),
        sortedFiles.length > 20
          ? React.createElement(
              Text,
              { color: colors.textDim },
              `... and ${sortedFiles.length - 20} more files`
            )
          : null
      ),

      // Preview panel
      showPreview && currentFile
        ? React.createElement(FilePreview, { path: currentFile.path, width: '50%' })
        : null
    ),

    // Footer hints
    React.createElement(Text, null, ''),
    React.createElement(
      Text,
      { color: colors.textDim },
      React.createElement(Text, { color: colors.accent }, 'Space'),
      ' select  ',
      React.createElement(Text, { color: colors.accent }, 'a'),
      ' all  ',
      React.createElement(Text, { color: colors.accent }, 'p'),
      ' preview  ',
      React.createElement(Text, { color: colors.accent }, 's'),
      ' sort'
    )
  );
};

export default LargeFilesScreen;
