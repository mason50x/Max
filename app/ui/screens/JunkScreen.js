import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import { filesize } from 'filesize';

const ITEMS_PER_PAGE = 10;

const categoryInfo = {
  cache: { color: colors.cache, icon: '📦', label: 'Caches' },
  logs: { color: colors.logs, icon: '📋', label: 'Logs' },
  temp: { color: colors.temp, icon: '🗂', label: 'Temp' },
  dev: { color: colors.dev, icon: '💻', label: 'Dev' },
  downloads: { color: colors.downloads, icon: '📥', label: 'Downloads' },
  other: { color: colors.textMuted, icon: '📄', label: 'Other' },
};

const JunkScreen = () => {
  const junkFiles = useStore((state) => state.junkFiles);
  const selectedJunk = useStore((state) => state.selectedJunk);
  const toggleJunkSelection = useStore((state) => state.toggleJunkSelection);
  const selectAllJunk = useStore((state) => state.selectAllJunk);
  const clearAllSelections = useStore((state) => state.clearAllSelections);
  const scanStatus = useStore((state) => state.scanStatus);

  const [viewMode, setViewMode] = useState('category'); // 'category' or 'list'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);

  // Group by category
  const categories = {};
  junkFiles.forEach((file) => {
    const cat = file.category || 'other';
    if (!categories[cat]) {
      categories[cat] = { files: [], totalSize: 0 };
    }
    categories[cat].files.push(file);
    categories[cat].totalSize += file.size;
  });

  const categoryList = Object.entries(categories).sort((a, b) => b[1].totalSize - a[1].totalSize);
  const totalSize = junkFiles.reduce((sum, f) => sum + f.size, 0);
  const selectedSize = junkFiles.reduce((sum, f) => selectedJunk.has(f.path) ? sum + f.size : sum, 0);

  // Get files for current view
  const currentFiles = selectedCategory
    ? categories[selectedCategory]?.files || []
    : junkFiles;
  const totalPages = Math.ceil(currentFiles.length / ITEMS_PER_PAGE);
  const visibleFiles = currentFiles.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  useInput((input, key) => {
    // Back to category view
    if (key.escape && selectedCategory) {
      setSelectedCategory(null);
      setPage(0);
      return;
    }

    // Category selection (letters a-f)
    if (viewMode === 'category' && !selectedCategory) {
      const catKeys = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5 };
      const idx = catKeys[input.toLowerCase()];
      if (idx !== undefined && idx < categoryList.length) {
        setSelectedCategory(categoryList[idx][0]);
        setPage(0);
        return;
      }
    }

    // Pagination
    if (key.rightArrow || input === 'n' || input === 'N') {
      setPage((p) => Math.min(totalPages - 1, p + 1));
    }
    if (key.leftArrow || input === 'p' || input === 'P') {
      setPage((p) => Math.max(0, p - 1));
    }

    // Toggle file selection with number keys
    const num = parseInt(input);
    if (num >= 1 && num <= ITEMS_PER_PAGE && num <= visibleFiles.length) {
      toggleJunkSelection(visibleFiles[num - 1].path);
    }

    // Select all in category or all junk
    if (input === 's' || input === 'S') {
      if (selectedCategory && categories[selectedCategory]) {
        categories[selectedCategory].files.forEach((f) => {
          if (!selectedJunk.has(f.path)) {
            toggleJunkSelection(f.path);
          }
        });
      }
    }

    // Select all
    if (input === 'a' || input === 'A') {
      selectAllJunk();
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
      React.createElement(Text, { bold: true, color: colors.text }, icons.junk, ' Junk Files'),
      React.createElement(Text, null, ''),
      React.createElement(Text, { color: colors.textMuted }, 'Run a scan first to find junk files.'),
      React.createElement(Text, { color: colors.textDim }, 'Press ', React.createElement(Text, { color: colors.accent }, '1'), ' to go to Scan')
    );
  }

  if (junkFiles.length === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(Text, { bold: true, color: colors.text }, icons.junk, ' Junk Files'),
      React.createElement(Text, null, ''),
      React.createElement(Text, { color: colors.success }, icons.check, ' No junk files found!')
    );
  }

  // Category view
  if (!selectedCategory) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },

      // Header
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.junk, ' Junk Files  ',
        React.createElement(Text, { color: colors.textMuted }, `${junkFiles.length} files • ${filesize(totalSize)}`)
      ),
      React.createElement(
        Text,
        { color: colors.accent },
        `Selected: ${selectedJunk.size} files (${filesize(selectedSize)})`
      ),
      React.createElement(Text, null, ''),

      // Categories grid
      React.createElement(Text, { color: colors.textDim }, 'Categories:'),
      React.createElement(Text, { color: colors.border }, '─'.repeat(50)),

      ...categoryList.map(([cat, data], idx) => {
        const info = categoryInfo[cat] || categoryInfo.other;
        const key = String.fromCharCode(97 + idx); // a, b, c, d, e, f
        const selectedInCat = data.files.filter((f) => selectedJunk.has(f.path)).length;

        return React.createElement(
          Text,
          { key: cat, color: colors.text },
          React.createElement(Text, { color: colors.accent }, `${key}. `),
          React.createElement(Text, { color: info.color }, info.icon, ' ', info.label.padEnd(12)),
          React.createElement(Text, { color: colors.textMuted }, `${data.files.length} files`.padEnd(12)),
          React.createElement(Text, { color: colors.text }, filesize(data.totalSize).padEnd(10)),
          selectedInCat > 0
            ? React.createElement(Text, { color: colors.success }, `${selectedInCat} sel`)
            : ''
        );
      }),

      React.createElement(Text, { color: colors.border }, '─'.repeat(50)),
      React.createElement(
        Text,
        { color: colors.textDim },
        React.createElement(Text, { color: colors.accent }, 'a-f'),
        ' select category  ',
        React.createElement(Text, { color: colors.accent }, 'a'),
        ' select all  ',
        React.createElement(Text, { color: colors.accent }, 'c'),
        ' clear'
      )
    );
  }

  // File list view for selected category
  const catInfo = categoryInfo[selectedCategory] || categoryInfo.other;

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Header
    React.createElement(
      Text,
      { bold: true, color: catInfo.color },
      catInfo.icon, ' ', catInfo.label, '  ',
      React.createElement(Text, { color: colors.textMuted }, `${currentFiles.length} files`)
    ),
    React.createElement(
      Text,
      { color: colors.textDim },
      'Press ', React.createElement(Text, { color: colors.accent }, 'Esc'), ' to go back'
    ),
    React.createElement(Text, null, ''),

    // File list
    React.createElement(Text, { color: colors.textDim }, '#  File                                        Size'),
    React.createElement(Text, { color: colors.border }, '─'.repeat(55)),

    ...visibleFiles.map((file, idx) => {
      const num = idx + 1;
      const isSelected = selectedJunk.has(file.path);
      const displayPath = file.path.replace(process.env.HOME, '~');
      const shortPath = displayPath.length > 40 ? '...' + displayPath.slice(-37) : displayPath;

      return React.createElement(
        Text,
        { key: file.path, color: isSelected ? colors.accent : colors.text },
        React.createElement(Text, { color: colors.accent }, `${num}`.padStart(2), '. '),
        isSelected ? '✓ ' : '  ',
        shortPath.padEnd(42),
        React.createElement(Text, { color: colors.textMuted }, filesize(file.size))
      );
    }),

    React.createElement(Text, { color: colors.border }, '─'.repeat(55)),
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
        React.createElement(Text, { color: colors.accent }, 's'),
        ' select category'
      )
    )
  );
};

export default JunkScreen;
