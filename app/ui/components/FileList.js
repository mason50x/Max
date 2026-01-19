import React from 'react';
import { Box, Text } from 'ink';
import { colors, icons } from '../theme.js';
import { filesize } from 'filesize';

const FileList = ({
  files = [],
  selectedPaths = new Set(),
  highlightedIndex = 0,
  onToggle,
  showSize = true,
  maxItems = 20,
}) => {
  const displayFiles = files.slice(0, maxItems);
  const hasMore = files.length > maxItems;

  return React.createElement(
    Box,
    { flexDirection: 'column' },
    ...displayFiles.map((file, index) => {
      const isHighlighted = index === highlightedIndex;
      const isSelected = selectedPaths.has(file.path);

      const displayPath = file.path.replace(process.env.HOME, '~');
      const truncatedPath = displayPath.length > 60
        ? '...' + displayPath.slice(-57)
        : displayPath;

      return React.createElement(
        Text,
        {
          key: file.path,
          color: isHighlighted ? colors.text : colors.textMuted,
          backgroundColor: isHighlighted ? colors.primary : undefined,
        },
        isSelected
          ? React.createElement(Text, { color: colors.accent }, ' ✓ ')
          : '   ',
        truncatedPath,
        showSize
          ? React.createElement(
              Text,
              { color: isHighlighted ? colors.accentBright : colors.textDim },
              `  ${filesize(file.size)}`
            )
          : null
      );
    }),
    hasMore
      ? React.createElement(
          Text,
          { color: colors.textDim },
          `   ... and ${files.length - maxItems} more`
        )
      : null
  );
};

export default FileList;
