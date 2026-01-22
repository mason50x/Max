import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import { filesize } from 'filesize';

const ITEMS_PER_PAGE = 8;

const DuplicatesScreen = () => {
  const duplicates = useStore((state) => state.duplicates);
  const selectedDuplicates = useStore((state) => state.selectedDuplicates);
  const toggleDuplicateSelection = useStore((state) => state.toggleDuplicateSelection);
  const selectAllDuplicates = useStore((state) => state.selectAllDuplicates);
  const clearAllSelections = useStore((state) => state.clearAllSelections);
  const scanStatus = useStore((state) => state.scanStatus);

  const [page, setPage] = useState(0);
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Calculate total duplicates and size
  const totalGroups = duplicates.length;
  const totalDupeFiles = duplicates.reduce((acc, g) => acc + g.files.length - 1, 0);
  const totalDupeSize = duplicates.reduce((acc, g) => {
    return acc + g.files.slice(1).reduce((sum, f) => sum + f.size, 0);
  }, 0);

  const totalPages = Math.ceil(totalGroups / ITEMS_PER_PAGE);
  const visibleGroups = duplicates.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  // Handle keyboard input
  useInput((input, key) => {
    // Pagination
    if (input === 'n' || input === 'N' || key.rightArrow) {
      setPage((p) => Math.min(totalPages - 1, p + 1));
      setExpandedGroup(null);
    }
    if (input === 'p' || input === 'P' || key.leftArrow) {
      setPage((p) => Math.max(0, p - 1));
      setExpandedGroup(null);
    }

    // Expand/collapse with number keys 1-8
    const num = parseInt(input);
    if (num >= 1 && num <= ITEMS_PER_PAGE) {
      const idx = num - 1;
      if (idx < visibleGroups.length) {
        setExpandedGroup(expandedGroup === idx ? null : idx);
      }
    }

    // Select all duplicates in expanded group
    if (input === 's' || input === 'S') {
      if (expandedGroup !== null && visibleGroups[expandedGroup]) {
        const group = visibleGroups[expandedGroup];
        group.files.slice(1).forEach((f) => {
          if (!selectedDuplicates.has(f.path)) {
            toggleDuplicateSelection(f.path);
          }
        });
      }
    }

    // Select all
    if (input === 'a' || input === 'A') {
      selectAllDuplicates();
    }

    // Clear selections
    if (input === 'c' || input === 'C') {
      clearAllSelections();
    }
  });

  // Calculate selected size
  const selectedSize = duplicates.reduce((acc, group) => {
    return acc + group.files.reduce((sum, f) => {
      return selectedDuplicates.has(f.path) ? sum + f.size : sum;
    }, 0);
  }, 0);

  if (scanStatus !== 'complete') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(Text, { bold: true, color: colors.text }, icons.duplicate, ' Duplicates'),
      React.createElement(Text, null, ''),
      React.createElement(Text, { color: colors.textMuted }, 'Run a scan first to find duplicate files.'),
      React.createElement(Text, { color: colors.textDim }, 'Press ', React.createElement(Text, { color: colors.accent }, '1'), ' to go to Scan')
    );
  }

  if (totalGroups === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(Text, { bold: true, color: colors.text }, icons.duplicate, ' Duplicates'),
      React.createElement(Text, null, ''),
      React.createElement(Text, { color: colors.success }, icons.check, ' No duplicate files found!')
    );
  }

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Header with stats
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.duplicate, ' Duplicates  ',
        React.createElement(Text, { color: colors.textMuted }, `${totalGroups} groups • ${totalDupeFiles} files • ${filesize(totalDupeSize)}`)
      )
    ),

    // Selection info
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(
        Text,
        { color: colors.accent },
        `Selected: ${selectedDuplicates.size} files (${filesize(selectedSize)})`
      )
    ),

    // Table header
    React.createElement(
      Box,
      { marginBottom: 0 },
      React.createElement(Text, { color: colors.textDim }, '#  Size        Files  Status')
    ),
    React.createElement(Text, { color: colors.border }, '─'.repeat(50)),

    // Groups list
    ...visibleGroups.map((group, idx) => {
      const groupNum = idx + 1;
      const isExpanded = expandedGroup === idx;
      const dupeCount = group.files.length - 1;
      const selectedInGroup = group.files.filter((f) => selectedDuplicates.has(f.path)).length;

      const elements = [
        // Group row
        React.createElement(
          Box,
          { key: `group-${idx}`, flexDirection: 'column' },
          React.createElement(
            Text,
            { color: isExpanded ? colors.primaryBright : colors.text },
            React.createElement(Text, { color: colors.accent }, `${groupNum}. `),
            filesize(group.files[0].size).padEnd(10),
            `  ${group.files.length}      `,
            selectedInGroup > 0
              ? React.createElement(Text, { color: colors.success }, `${selectedInGroup} selected`)
              : React.createElement(Text, { color: colors.textDim }, 'none selected')
          )
        ),
      ];

      // Expanded view - show files
      if (isExpanded) {
        group.files.forEach((file, fileIdx) => {
          const isOriginal = fileIdx === 0;
          const isSelected = selectedDuplicates.has(file.path);
          const displayPath = file.path.replace(process.env.HOME, '~');
          const shortPath = displayPath.length > 45 ? '...' + displayPath.slice(-42) : displayPath;

          elements.push(
            React.createElement(
              Text,
              { key: file.path, color: isOriginal ? colors.success : isSelected ? colors.accent : colors.textMuted },
              '   ',
              isOriginal ? '★ ' : isSelected ? '✓ ' : '  ',
              shortPath,
              isOriginal ? ' (original)' : ''
            )
          );
        });
        elements.push(
          React.createElement(
            Text,
            { key: `hint-${idx}`, color: colors.textDim },
            '   Press ', React.createElement(Text, { color: colors.accent }, 's'), ' to select all duplicates in this group'
          )
        );
      }

      return elements;
    }).flat(),

    // Pagination
    React.createElement(Text, { color: colors.border }, '─'.repeat(50)),
    React.createElement(
      Box,
      { justifyContent: 'space-between', marginTop: 0 },
      React.createElement(
        Text,
        { color: colors.textMuted },
        `Page ${page + 1}/${totalPages}`
      ),
      React.createElement(
        Text,
        { color: colors.textDim },
        React.createElement(Text, { color: colors.accent }, '←/→'),
        ' page  ',
        React.createElement(Text, { color: colors.accent }, '1-8'),
        ' expand  ',
        React.createElement(Text, { color: colors.accent }, 'a'),
        ' all  ',
        React.createElement(Text, { color: colors.accent }, 'c'),
        ' clear'
      )
    )
  );
};

export default DuplicatesScreen;
