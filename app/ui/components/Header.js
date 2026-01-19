import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import { useStore } from '../../store.js';
import { filesize } from 'filesize';

const Header = () => {
  const diskInfo = useStore((state) => state.diskInfo);
  const scanStatus = useStore((state) => state.scanStatus);

  const usedPercent = diskInfo.total > 0
    ? Math.round((diskInfo.used / diskInfo.total) * 100)
    : 0;

  return React.createElement(
    Box,
    {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingX: 1,
      paddingY: 0,
      borderStyle: 'single',
      borderTop: false,
      borderLeft: false,
      borderRight: false,
      borderColor: colors.border,
    },
    // Logo
    React.createElement(
      Box,
      null,
      React.createElement(
        Text,
        { bold: true },
        React.createElement(Text, { color: colors.primary }, '▓▓▓'),
        React.createElement(Text, { color: colors.primaryBright }, ' Max '),
        React.createElement(Text, { color: colors.textMuted }, '- macOS Cleanup')
      )
    ),

    // Disk usage indicator
    React.createElement(
      Box,
      null,
      diskInfo.total > 0
        ? React.createElement(
            Text,
            { color: colors.textMuted },
            React.createElement(Text, { color: colors.accent }, '💾 '),
            filesize(diskInfo.free),
            ' free of ',
            filesize(diskInfo.total),
            ' ',
            React.createElement(
              Text,
              { color: usedPercent > 90 ? colors.danger : usedPercent > 70 ? colors.warning : colors.success },
              `(${usedPercent}% used)`
            )
          )
        : React.createElement(
            Text,
            { color: colors.textDim },
            scanStatus === 'idle' ? 'Press Enter to scan' : ''
          )
    )
  );
};

export default Header;
