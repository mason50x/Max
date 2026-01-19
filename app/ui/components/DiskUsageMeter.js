import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../../store.js';
import { colors } from '../theme.js';
import { filesize } from 'filesize';
import { execSync } from 'child_process';

const getDiskInfo = () => {
  try {
    // Get disk info for the home directory's volume
    const output = execSync('df -k ~', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    if (lines.length < 2) return null;

    const parts = lines[1].split(/\s+/);
    // df -k output: Filesystem 1K-blocks Used Available Use% Mounted
    const total = parseInt(parts[1], 10) * 1024;
    const used = parseInt(parts[2], 10) * 1024;
    const free = parseInt(parts[3], 10) * 1024;

    return { total, used, free };
  } catch (err) {
    return null;
  }
};

const DiskUsageMeter = ({ width = 50 }) => {
  const diskInfo = useStore((state) => state.diskInfo);
  const setDiskInfo = useStore((state) => state.setDiskInfo);

  // Fetch disk info on mount
  useEffect(() => {
    const info = getDiskInfo();
    if (info) {
      setDiskInfo(info);
    }
  }, []);

  if (!diskInfo || diskInfo.total === 0) {
    return React.createElement(
      Text,
      { color: colors.textDim },
      'Loading disk information...'
    );
  }

  const usedPercent = Math.round((diskInfo.used / diskInfo.total) * 100);
  const filledWidth = Math.round((usedPercent / 100) * width);
  const emptyWidth = width - filledWidth;

  // Color based on usage
  const getUsageColor = () => {
    if (usedPercent < 60) return colors.success;
    if (usedPercent < 80) return colors.warning;
    return colors.danger;
  };

  return React.createElement(
    Box,
    { flexDirection: 'column' },
    React.createElement(
      Text,
      { color: colors.text, bold: true },
      '💾 Disk Usage'
    ),
    React.createElement(
      Box,
      { flexDirection: 'row', marginTop: 0 },
      React.createElement(
        Text,
        { color: getUsageColor() },
        '█'.repeat(filledWidth)
      ),
      React.createElement(
        Text,
        { color: colors.border },
        '░'.repeat(emptyWidth)
      ),
      React.createElement(
        Text,
        { color: colors.text },
        ` ${usedPercent}%`
      )
    ),
    React.createElement(
      Box,
      { flexDirection: 'row', marginTop: 0 },
      React.createElement(
        Text,
        { color: colors.textMuted },
        `Used: ${filesize(diskInfo.used)}  •  Free: `,
        React.createElement(Text, { color: colors.success }, filesize(diskInfo.free)),
        `  •  Total: ${filesize(diskInfo.total)}`
      )
    )
  );
};

export default DiskUsageMeter;
