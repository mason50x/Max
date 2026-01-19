import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons, screens } from '../theme.js';
import ConfirmDialog from '../components/ConfirmDialog.js';
import { performCleanup } from '../../cleanup/index.js';
import { filesize } from 'filesize';

const ReviewScreen = () => {
  const duplicates = useStore((state) => state.duplicates);
  const junkFiles = useStore((state) => state.junkFiles);
  const largeFiles = useStore((state) => state.largeFiles);
  const selectedDuplicates = useStore((state) => state.selectedDuplicates);
  const selectedJunk = useStore((state) => state.selectedJunk);
  const selectedLarge = useStore((state) => state.selectedLarge);
  const clearAllSelections = useStore((state) => state.clearAllSelections);
  const scanStatus = useStore((state) => state.scanStatus);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState('trash'); // 'trash' or 'permanent'
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  // Calculate totals
  const calculateTotals = () => {
    let totalSize = 0;
    let totalItems = 0;
    const items = [];

    // Selected duplicates
    duplicates.forEach((group) => {
      group.files.forEach((file) => {
        if (selectedDuplicates.has(file.path)) {
          totalSize += file.size;
          totalItems++;
          items.push({ path: file.path, size: file.size, type: 'duplicate' });
        }
      });
    });

    // Selected junk
    junkFiles.forEach((file) => {
      if (selectedJunk.has(file.path)) {
        totalSize += file.size;
        totalItems++;
        items.push({ path: file.path, size: file.size, type: 'junk' });
      }
    });

    // Selected large files
    largeFiles.forEach((file) => {
      if (selectedLarge.has(file.path)) {
        totalSize += file.size;
        totalItems++;
        items.push({ path: file.path, size: file.size, type: 'large' });
      }
    });

    return { totalSize, totalItems, items };
  };

  const { totalSize, totalItems, items } = calculateTotals();

  // Handle keyboard input
  useInput(async (input, key) => {
    if (isDeleting) return;

    // Toggle delete mode
    if (input === 't' || input === 'T') {
      setDeleteMode(deleteMode === 'trash' ? 'permanent' : 'trash');
    }

    // Clear selections
    if (input === 'c' || input === 'C') {
      clearAllSelections();
    }

    // Start cleanup
    if (key.return && totalItems > 0 && !showConfirm) {
      setShowConfirm(true);
    }

    // Cancel confirm
    if (key.escape && showConfirm) {
      setShowConfirm(false);
    }

    // Confirm cleanup
    if (input === 'y' || input === 'Y') {
      if (showConfirm) {
        setShowConfirm(false);
        setIsDeleting(true);
        try {
          const result = await performCleanup(items.map(i => i.path), deleteMode === 'permanent');
          setDeleteResult(result);
        } catch (err) {
          setDeleteResult({ success: false, error: err.message });
        }
        setIsDeleting(false);
      }
    }

    // Cancel confirm
    if (input === 'n' || input === 'N') {
      setShowConfirm(false);
    }
  });

  if (scanStatus !== 'complete') {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.trash,
        ' Review & Clean'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'Run a scan first to find files to clean.'
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

  if (deleteResult) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.trash,
        ' Cleanup Complete'
      ),
      React.createElement(Text, null, ''),
      deleteResult.success
        ? React.createElement(
            Box,
            { flexDirection: 'column' },
            React.createElement(
              Text,
              { color: colors.success, bold: true },
              icons.check,
              ' Successfully cleaned ',
              deleteResult.deletedCount,
              ' files!'
            ),
            React.createElement(Text, null, ''),
            React.createElement(
              Text,
              { color: colors.text },
              'Space reclaimed: ',
              React.createElement(Text, { color: colors.success, bold: true }, filesize(deleteResult.freedSpace))
            ),
            deleteMode === 'trash'
              ? React.createElement(
                  Text,
                  { color: colors.textMuted },
                  'Files moved to Trash - you can restore them if needed.'
                )
              : null
          )
        : React.createElement(
            Box,
            { flexDirection: 'column' },
            React.createElement(
              Text,
              { color: colors.danger, bold: true },
              icons.cross,
              ' Cleanup failed'
            ),
            React.createElement(Text, null, ''),
            React.createElement(
              Text,
              { color: colors.textMuted },
              deleteResult.error
            )
          ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textDim },
        'Press ',
        React.createElement(Text, { color: colors.accent }, '1'),
        ' to run another scan'
      )
    );
  }

  if (totalItems === 0) {
    return React.createElement(
      Box,
      { flexDirection: 'column', paddingTop: 1 },
      React.createElement(
        Text,
        { bold: true, color: colors.text },
        icons.trash,
        ' Review & Clean'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textMuted },
        'No files selected for cleanup.'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.textDim },
        'Go to ',
        React.createElement(Text, { color: colors.accent }, '2'),
        ' Duplicates, ',
        React.createElement(Text, { color: colors.accent }, '3'),
        ' Junk, or ',
        React.createElement(Text, { color: colors.accent }, '4'),
        ' Large Files to select items.'
      )
    );
  }

  return React.createElement(
    Box,
    { flexDirection: 'column', paddingTop: 1 },

    // Header
    React.createElement(
      Text,
      { bold: true, color: colors.text },
      icons.trash,
      ' Review & Clean'
    ),
    React.createElement(Text, null, ''),

    // Summary
    React.createElement(
      Box,
      {
        flexDirection: 'column',
        borderStyle: 'round',
        borderColor: colors.primary,
        paddingX: 2,
        paddingY: 1,
      },
      React.createElement(
        Text,
        { bold: true, color: colors.primaryBright },
        'Cleanup Summary'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, icons.duplicate),
        ' Duplicates: ',
        selectedDuplicates.size,
        ' files'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.warning }, icons.junk),
        ' Junk Files: ',
        selectedJunk.size,
        ' files'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.info }, icons.large),
        ' Large Files: ',
        selectedLarge.size,
        ' files'
      ),
      React.createElement(Text, null, ''),
      React.createElement(
        Text,
        { bold: true, color: colors.success },
        'Total: ',
        totalItems,
        ' files  •  ',
        filesize(totalSize),
        ' to reclaim'
      )
    ),
    React.createElement(Text, null, ''),

    // Delete mode toggle
    React.createElement(
      Box,
      { flexDirection: 'row' },
      React.createElement(
        Text,
        { color: colors.text },
        'Delete mode: '
      ),
      React.createElement(
        Text,
        {
          color: deleteMode === 'trash' ? colors.success : colors.textDim,
          bold: deleteMode === 'trash',
        },
        deleteMode === 'trash' ? '● ' : '○ ',
        'Move to Trash (safe)'
      ),
      React.createElement(Text, null, '  '),
      React.createElement(
        Text,
        {
          color: deleteMode === 'permanent' ? colors.danger : colors.textDim,
          bold: deleteMode === 'permanent',
        },
        deleteMode === 'permanent' ? '● ' : '○ ',
        'Permanent Delete'
      )
    ),
    React.createElement(Text, null, ''),

    // Warning for permanent delete
    deleteMode === 'permanent'
      ? React.createElement(
          Text,
          { color: colors.warning },
          icons.warning,
          ' Warning: Permanent deletion cannot be undone!'
        )
      : React.createElement(
          Text,
          { color: colors.textMuted },
          'Files will be moved to Trash and can be restored.'
        ),
    React.createElement(Text, null, ''),

    // Action buttons
    !isDeleting
      ? React.createElement(
          Box,
          { flexDirection: 'row', gap: 2 },
          React.createElement(
            Box,
            {
              borderStyle: 'round',
              borderColor: deleteMode === 'permanent' ? colors.danger : colors.success,
              paddingX: 2,
            },
            React.createElement(
              Text,
              { color: deleteMode === 'permanent' ? colors.danger : colors.success, bold: true },
              'Press ',
              React.createElement(Text, { color: colors.accent }, 'Enter'),
              ' to Clean Up'
            )
          ),
          React.createElement(
            Text,
            { color: colors.textDim },
            '  ',
            React.createElement(Text, { color: colors.accent }, 't'),
            ' toggle mode  ',
            React.createElement(Text, { color: colors.accent }, 'c'),
            ' clear'
          )
        )
      : React.createElement(
          Text,
          { color: colors.accent },
          icons.spinner[0],
          ' Cleaning up...'
        ),

    // Confirm dialog
    showConfirm
      ? React.createElement(ConfirmDialog, {
          title: 'Confirm Cleanup',
          message: `Delete ${totalItems} files (${filesize(totalSize)})?`,
          confirmLabel: 'Yes, delete',
          cancelLabel: 'Cancel',
          dangerous: deleteMode === 'permanent',
        })
      : null
  );
};

export default ReviewScreen;
