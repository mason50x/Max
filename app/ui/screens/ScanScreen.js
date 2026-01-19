import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons, style } from '../theme.js';
import ProgressBar from '../components/ProgressBar.js';
import DiskUsageMeter from '../components/DiskUsageMeter.js';
import { startScan } from '../../scanner/index.js';
import { filesize } from 'filesize';

const ScanScreen = () => {
  const isScanning = useStore((state) => state.isScanning);
  const scanStatus = useStore((state) => state.scanStatus);
  const scanProgress = useStore((state) => state.scanProgress);
  const scanMessage = useStore((state) => state.scanMessage);
  const filesScanned = useStore((state) => state.filesScanned);
  const duplicates = useStore((state) => state.duplicates);
  const junkFiles = useStore((state) => state.junkFiles);
  const largeFiles = useStore((state) => state.largeFiles);

  // Spinner animation
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      setSpinnerIndex((i) => (i + 1) % icons.spinner.length);
    }, 80);
    return () => clearInterval(timer);
  }, [isScanning]);

  // Handle input
  useInput((input, key) => {
    if ((key.return || input === 's' || input === 'S') && !isScanning) {
      startScan();
    }
  });

  // Calculate total duplicate size
  const duplicateSize = duplicates.reduce((acc, group) => {
    const dupeFiles = group.files.slice(1);
    return acc + dupeFiles.reduce((sum, f) => sum + f.size, 0);
  }, 0);

  // Calculate total junk size
  const junkSize = junkFiles.reduce((acc, f) => acc + f.size, 0);

  // Calculate total large files size
  const largeSize = largeFiles.reduce((acc, f) => acc + f.size, 0);

  const totalReclaimable = duplicateSize + junkSize + largeSize;

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Title
    React.createElement(
      Text,
      { bold: true, color: colors.text },
      icons.search,
      ' Scan Your System'
    ),
    React.createElement(Text, null, ''),

    // Disk usage meter
    React.createElement(DiskUsageMeter),
    React.createElement(Text, null, ''),

    // Scan status / start button
    scanStatus === 'idle'
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(
            Text,
            { color: colors.textMuted },
            'Max will scan your home directory for:'
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.text },
            '  ',
            React.createElement(Text, { color: colors.accent }, icons.duplicate),
            ' Duplicate files (same content, different locations)'
          ),
          React.createElement(
            Text,
            { color: colors.text },
            '  ',
            React.createElement(Text, { color: colors.warning }, icons.junk),
            ' Junk files (caches, logs, temp files)'
          ),
          React.createElement(
            Text,
            { color: colors.text },
            '  ',
            React.createElement(Text, { color: colors.info }, icons.large),
            ' Large files (over 100 MB, rarely accessed)'
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Box,
            {
              borderStyle: 'round',
              borderColor: colors.primary,
              paddingX: 2,
              paddingY: 0,
            },
            React.createElement(
              Text,
              { color: colors.primaryBright, bold: true },
              'Press ',
              React.createElement(Text, { color: colors.accent }, 'Enter'),
              ' or ',
              React.createElement(Text, { color: colors.accent }, 'S'),
              ' to start scanning'
            )
          )
        )
      : null,

    // Scanning progress
    isScanning
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(
            Text,
            { color: colors.accent },
            icons.spinner[spinnerIndex],
            ' Scanning...'
          ),
          React.createElement(Text, null, ''),
          React.createElement(ProgressBar, { progress: scanProgress, width: 40 }),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textMuted },
            `Files scanned: ${filesScanned.toLocaleString()}`
          ),
          React.createElement(
            Text,
            { color: colors.textDim },
            scanMessage
          )
        )
      : null,

    // Scan complete results
    scanStatus === 'complete'
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(
            Text,
            { color: colors.success, bold: true },
            icons.check,
            ' Scan Complete!'
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.text },
            `Scanned ${filesScanned.toLocaleString()} files`
          ),
          React.createElement(Text, null, ''),

          // Results summary
          React.createElement(
            Box,
            { flexDirection: 'column', marginLeft: 2 },
            React.createElement(
              Text,
              { color: colors.text },
              React.createElement(Text, { color: colors.accent }, icons.duplicate),
              ` Duplicates: ${duplicates.length} groups `,
              React.createElement(Text, { color: colors.textMuted }, `(${filesize(duplicateSize)})`)
            ),
            React.createElement(
              Text,
              { color: colors.text },
              React.createElement(Text, { color: colors.warning }, icons.junk),
              ` Junk Files: ${junkFiles.length} items `,
              React.createElement(Text, { color: colors.textMuted }, `(${filesize(junkSize)})`)
            ),
            React.createElement(
              Text,
              { color: colors.text },
              React.createElement(Text, { color: colors.info }, icons.large),
              ` Large Files: ${largeFiles.length} files `,
              React.createElement(Text, { color: colors.textMuted }, `(${filesize(largeSize)})`)
            )
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Box,
            {
              borderStyle: 'round',
              borderColor: colors.success,
              paddingX: 2,
              paddingY: 0,
            },
            React.createElement(
              Text,
              { color: colors.success, bold: true },
              'Total reclaimable: ',
              filesize(totalReclaimable)
            )
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textMuted },
            'Use ',
            React.createElement(Text, { color: colors.accent }, '2'),
            '-',
            React.createElement(Text, { color: colors.accent }, '4'),
            ' to review results, or ',
            React.createElement(Text, { color: colors.accent }, '5'),
            ' to clean up'
          )
        )
      : null,

    // Error state
    scanStatus === 'error'
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(
            Text,
            { color: colors.danger, bold: true },
            icons.cross,
            ' Scan Error'
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textMuted },
            scanMessage
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textDim },
            'Press ',
            React.createElement(Text, { color: colors.accent }, 'Enter'),
            ' to try again'
          )
        )
      : null
  );
};

export default ScanScreen;
