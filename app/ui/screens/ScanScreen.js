import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons } from '../theme.js';
import ProgressBar from '../components/ProgressBar.js';
import DiskUsageMeter from '../components/DiskUsageMeter.js';
import { startScan } from '../../scanner/index.js';
import { filesize } from 'filesize';

// Mini game: Catch the junk!
const MiniGame = () => {
  const [playerPos, setPlayerPos] = useState(10);
  const [junkItems, setJunkItems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameWidth] = useState(30);

  useEffect(() => {
    // Spawn junk periodically
    const spawnInterval = setInterval(() => {
      setJunkItems(prev => [...prev, { x: Math.floor(Math.random() * gameWidth), y: 0, char: ['📦', '📋', '🗂', '💾'][Math.floor(Math.random() * 4)] }]);
    }, 800);

    // Move junk down
    const moveInterval = setInterval(() => {
      setJunkItems(prev => {
        const newItems = prev.map(item => ({ ...item, y: item.y + 1 })).filter(item => item.y < 5);
        // Check for catches
        newItems.forEach((item, idx) => {
          if (item.y === 4 && Math.abs(item.x - playerPos) <= 1) {
            setScore(s => s + 10);
            newItems.splice(idx, 1);
          }
        });
        return newItems;
      });
    }, 300);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [playerPos, gameWidth]);

  useInput((input, key) => {
    if (key.leftArrow || input === 'h') {
      setPlayerPos(p => Math.max(0, p - 2));
    }
    if (key.rightArrow || input === 'l') {
      setPlayerPos(p => Math.min(gameWidth - 1, p + 2));
    }
  });

  // Render game field
  const renderRow = (y) => {
    let row = ' '.repeat(gameWidth);
    junkItems.filter(item => item.y === y).forEach(item => {
      if (item.x < gameWidth) {
        row = row.slice(0, item.x) + item.char + row.slice(item.x + 2);
      }
    });
    return row;
  };

  const renderPlayer = () => {
    let row = ' '.repeat(gameWidth);
    row = row.slice(0, Math.max(0, playerPos - 1)) + '\\🧹/' + row.slice(playerPos + 3);
    return row;
  };

  return React.createElement(
    Box,
    { flexDirection: 'column', borderStyle: 'round', borderColor: colors.border, paddingX: 1, marginTop: 1 },
    React.createElement(
      Text,
      { color: colors.primaryBright, bold: true },
      '🎮 Catch the Junk!  Score: ', React.createElement(Text, { color: colors.accent }, score),
      '  (←/→ to move)'
    ),
    React.createElement(Text, { color: colors.textDim }, renderRow(0)),
    React.createElement(Text, { color: colors.textDim }, renderRow(1)),
    React.createElement(Text, { color: colors.textDim }, renderRow(2)),
    React.createElement(Text, { color: colors.textDim }, renderRow(3)),
    React.createElement(Text, { color: colors.success }, renderPlayer())
  );
};

// Scan steps display
const ScanSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Traversing directories', icon: '📂' },
    { id: 2, label: 'Finding duplicates', icon: '📋' },
    { id: 3, label: 'Detecting junk files', icon: '🧹' },
    { id: 4, label: 'Identifying large files', icon: '📦' },
    { id: 5, label: 'Finalizing results', icon: '✨' },
  ];

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(Text, { color: colors.textMuted, bold: true }, 'Progress:'),
    ...steps.map(step => {
      const isActive = step.id === currentStep;
      const isComplete = step.id < currentStep;
      const isPending = step.id > currentStep;

      return React.createElement(
        Text,
        { key: step.id, color: isActive ? colors.accent : isComplete ? colors.success : colors.textDim },
        isComplete ? '✓ ' : isActive ? '▶ ' : '  ',
        step.icon, ' ',
        step.label,
        isActive ? React.createElement(Text, { color: colors.accent }, ' ...') : ''
      );
    })
  );
};

const ScanScreen = () => {
  const isScanning = useStore((state) => state.isScanning);
  const scanStatus = useStore((state) => state.scanStatus);
  const scanProgress = useStore((state) => state.scanProgress);
  const scanMessage = useStore((state) => state.scanMessage);
  const filesScanned = useStore((state) => state.filesScanned);
  const currentFile = useStore((state) => state.currentFile);
  const currentDir = useStore((state) => state.currentDir);
  const scanStep = useStore((state) => state.scanStep);
  const duplicates = useStore((state) => state.duplicates);
  const junkFiles = useStore((state) => state.junkFiles);
  const largeFiles = useStore((state) => state.largeFiles);

  // Spinner animation
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      setSpinnerIndex((i) => (i + 1) % icons.spinner.length);
    }, 80);
    return () => clearInterval(timer);
  }, [isScanning]);

  // Handle input
  useInput((input, key) => {
    if ((key.return || input === 's' || input === 'S') && !isScanning && scanStatus !== 'scanning') {
      startScan();
      setShowGame(true);
    }
    if (input === 'g' || input === 'G') {
      setShowGame(!showGame);
    }
  });

  // Calculate stats
  const duplicateSize = duplicates.reduce((acc, group) => {
    const dupeFiles = group.files.slice(1);
    return acc + dupeFiles.reduce((sum, f) => sum + f.size, 0);
  }, 0);
  const junkSize = junkFiles.reduce((acc, f) => acc + f.size, 0);
  const largeSize = largeFiles.reduce((acc, f) => acc + f.size, 0);
  const totalReclaimable = duplicateSize + junkSize + largeSize;

  // Determine current step based on progress
  const getCurrentStep = () => {
    if (scanProgress < 40) return 1;
    if (scanProgress < 70) return 2;
    if (scanProgress < 85) return 3;
    if (scanProgress < 95) return 4;
    return 5;
  };

  // Format current path for display
  const formatPath = (path) => {
    if (!path) return '';
    const display = path.replace(process.env.HOME, '~');
    return display.length > 50 ? '...' + display.slice(-47) : display;
  };

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Title
    React.createElement(
      Text,
      { bold: true, color: colors.text },
      icons.search, ' Scan Your System'
    ),
    React.createElement(Text, null, ''),

    // Disk usage meter
    React.createElement(DiskUsageMeter),
    React.createElement(Text, null, ''),

    // Idle state - show start prompt
    scanStatus === 'idle'
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(Text, { color: colors.textMuted }, 'Max will scan your home directory for:'),
          React.createElement(Text, null, ''),
          React.createElement(Text, { color: colors.text }, '  ', React.createElement(Text, { color: colors.accent }, icons.duplicate), ' Duplicate files'),
          React.createElement(Text, { color: colors.text }, '  ', React.createElement(Text, { color: colors.warning }, icons.junk), ' Junk files (caches, logs, temp)'),
          React.createElement(Text, { color: colors.text }, '  ', React.createElement(Text, { color: colors.info }, icons.large), ' Large files (>100 MB)'),
          React.createElement(Text, null, ''),
          React.createElement(
            Box,
            { borderStyle: 'round', borderColor: colors.primary, paddingX: 2 },
            React.createElement(
              Text,
              { color: colors.primaryBright, bold: true },
              'Press ', React.createElement(Text, { color: colors.accent }, 'Enter'), ' or ', React.createElement(Text, { color: colors.accent }, 'S'), ' to start'
            )
          )
        )
      : null,

    // Scanning state
    isScanning
      ? React.createElement(
          Box,
          { flexDirection: 'column' },

          // Progress bar and spinner
          React.createElement(
            Box,
            { marginBottom: 1 },
            React.createElement(
              Text,
              { color: colors.accent },
              icons.spinner[spinnerIndex], ' Scanning...  ',
              React.createElement(Text, { color: colors.text }, `${Math.round(scanProgress)}%`)
            )
          ),
          React.createElement(ProgressBar, { progress: scanProgress, width: 40 }),
          React.createElement(Text, null, ''),

          // Step tracker
          React.createElement(ScanSteps, { currentStep: getCurrentStep() }),
          React.createElement(Text, null, ''),

          // Live stats
          React.createElement(
            Box,
            { flexDirection: 'column', borderStyle: 'single', borderColor: colors.border, paddingX: 1 },
            React.createElement(Text, { color: colors.textMuted, bold: true }, '📊 Live Stats'),
            React.createElement(
              Text,
              { color: colors.text },
              'Files scanned: ', React.createElement(Text, { color: colors.accent, bold: true }, filesScanned.toLocaleString())
            ),
            React.createElement(
              Text,
              { color: colors.text },
              'Duplicates found: ', React.createElement(Text, { color: colors.warning }, duplicates.length, ' groups')
            ),
            React.createElement(
              Text,
              { color: colors.text },
              'Junk found: ', React.createElement(Text, { color: colors.warning }, junkFiles.length, ' files')
            ),
            React.createElement(
              Text,
              { color: colors.text },
              'Large files: ', React.createElement(Text, { color: colors.warning }, largeFiles.length, ' files')
            )
          ),
          React.createElement(Text, null, ''),

          // Current location
          React.createElement(
            Box,
            { flexDirection: 'column' },
            React.createElement(
              Text,
              { color: colors.textDim },
              '📂 ', formatPath(currentDir || scanMessage)
            ),
            currentFile
              ? React.createElement(
                  Text,
                  { color: colors.textDim },
                  '   └─ ', formatPath(currentFile).split('/').pop()
                )
              : null
          ),

          // Mini game toggle
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textDim },
            'Press ', React.createElement(Text, { color: colors.accent }, 'G'), ' to ', showGame ? 'hide' : 'play', ' mini-game'
          ),

          // Mini game
          showGame ? React.createElement(MiniGame) : null
        )
      : null,

    // Scan complete
    scanStatus === 'complete'
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(
            Text,
            { color: colors.success, bold: true },
            icons.check, ' Scan Complete!'
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
            { flexDirection: 'column', borderStyle: 'round', borderColor: colors.success, paddingX: 2, paddingY: 1 },
            React.createElement(Text, { color: colors.text, bold: true }, '📊 Results'),
            React.createElement(Text, null, ''),
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
            ),
            React.createElement(Text, null, ''),
            React.createElement(
              Text,
              { color: colors.success, bold: true },
              '💾 Total reclaimable: ', filesize(totalReclaimable)
            )
          ),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textMuted },
            'Press ', React.createElement(Text, { color: colors.accent }, '2-4'), ' to review, or ', React.createElement(Text, { color: colors.accent }, '5'), ' to clean'
          )
        )
      : null,

    // Error state
    scanStatus === 'error'
      ? React.createElement(
          Box,
          { flexDirection: 'column' },
          React.createElement(Text, { color: colors.danger, bold: true }, icons.cross, ' Scan Error'),
          React.createElement(Text, null, ''),
          React.createElement(Text, { color: colors.textMuted }, scanMessage),
          React.createElement(Text, null, ''),
          React.createElement(
            Text,
            { color: colors.textDim },
            'Press ', React.createElement(Text, { color: colors.accent }, 'Enter'), ' to try again'
          )
        )
      : null
  );
};

export default ScanScreen;
