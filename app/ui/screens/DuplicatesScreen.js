import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons, screens } from '../theme.js';
import FileList from '../components/FileList.js';
import FilePreview from '../components/FilePreview.js';
import { filesize } from 'filesize';

const DuplicatesScreen = () => {
  const duplicates = useStore((state) => state.duplicates);
  const selectedDuplicates = useStore((state) => state.selectedDuplicates);
  const toggleDuplicateSelection = useStore((state) => state.toggleDuplicateSelection);
  const selectAllDuplicates = useStore((state) => state.selectAllDuplicates);
  const scanStatus = useStore((state) => state.scanStatus);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Flatten duplicates for display
  const flattenedItems = [];
  duplicates.forEach((group, groupIndex) => {
    // Group header
    flattenedItems.push({
      type: 'group',
      groupIndex,
      hash: group.hash,
      fileCount: group.files.length,
      totalSize: group.files.reduce((sum, f) => sum + f.size, 0),
      expanded: expandedGroup === groupIndex,
    });

    // Files in group (if expanded)
    if (expandedGroup === groupIndex) {
      group.files.forEach((file, fileIndex) => {
        flattenedItems.push({
          type: 'file',
          groupIndex,
          fileIndex,
          path: file.path,
          size: file.size,
          modified: file.modified,
          isOriginal: fileIndex === 0,
          isSelected: selectedDuplicates.has(file.path),
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

    // Enter to expand/collapse group
    if (key.return && currentItem?.type === 'group') {
      setExpandedGroup(expandedGroup === currentItem.groupIndex ? null : currentItem.groupIndex);
    }

    // Space to toggle selection
    if (input === ' ' && currentItem?.type === 'file' && !currentItem.isOriginal) {
      toggleDuplicateSelection(currentItem.path);
    }

    // 'a' to select all duplicates
    if (input === 'a' || input === 'A') {
      selectAllDuplicates();
    }

    // 'p' to preview
    if (input === 'p' || input === 'P') {
      setShowPreview(!showPreview);
    }
  });

  // Calculate selected size
  const selectedSize = duplicates.reduce((acc, group) => {
    return acc + group.files.reduce((sum, f) => {
      return selectedDuplicates.has(f.path) ? sum + f.size : sum;
    }, 0);
  }, 0);

  // Get current selected file for preview
  const currentItem = flattenedItems[selectedIndex];
  const previewPath = currentItem?.type === 'file' ? currentItem.path : null;

  if (scanStatus !== 'complete') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.duplicate,
        ' Duplicates'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'Run a scan first to find duplicate files.'
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

  if (duplicates.length === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.duplicate,
        ' Duplicates'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.success },
        icons.check,
        ' No duplicate files found!'
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
        icons.duplicate,
        ' Duplicates ',
        React.createElement(Text, { color: colors.textMuted }, `(${duplicates.length} groups)`)
      ),
      React.createElement(
        Text,
        { color: colors.accent },
        `Selected: ${selectedDuplicates.size} files (${filesize(selectedSize)})`
      )
    ),
    React.createElement(Text, null, ''),

    // Main content area
    React.createElement(
      Box,
      { flexDirection: 'row', flexGrow: 1 },

      // File list
      React.createElement(
        Box,
        { flexDirection: 'column', width: showPreview ? '50%' : '100%' },
        ...flattenedItems.map((item, index) => {
          const isHighlighted = index === selectedIndex;

          if (item.type === 'group') {
            return React.createElement(
              Text,
              {
                key: `group-${item.groupIndex}`,
                color: isHighlighted ? colors.primaryBright : colors.text,
                backgroundColor: isHighlighted ? colors.primary : undefined,
              },
              item.expanded ? '▼ ' : '▶ ',
              `Group ${item.groupIndex + 1}: ${item.fileCount} files `,
              React.createElement(Text, { color: colors.textMuted }, `(${filesize(item.totalSize)} each)`)
            );
          }

          // File item
          const checkbox = item.isOriginal
            ? React.createElement(Text, { color: colors.success }, ' ★ ')
            : item.isSelected
            ? React.createElement(Text, { color: colors.accent }, ' ✓ ')
            : '   ';

          const displayPath = item.path.replace(process.env.HOME, '~');
          const truncatedPath = displayPath.length > 50
            ? '...' + displayPath.slice(-47)
            : displayPath;

          return React.createElement(
            Text,
            {
              key: item.path,
              color: isHighlighted ? colors.text : item.isOriginal ? colors.success : colors.textMuted,
              backgroundColor: isHighlighted ? colors.primary : undefined,
            },
            '  ',
            checkbox,
            truncatedPath,
            item.isOriginal
              ? React.createElement(Text, { color: colors.success }, ' (original)')
              : ''
          );
        })
      ),

      // Preview panel
      showPreview && previewPath
        ? React.createElement(FilePreview, { path: previewPath, width: '50%' })
        : null
    ),

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
      ' all  ',
      React.createElement(Text, { color: colors.accent }, 'p'),
      ' preview  ',
      React.createElement(Text, { color: colors.accent }, '★'),
      ' = original'
    )
  );
};

export default DuplicatesScreen;
