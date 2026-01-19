import React from 'react';
import { Box, Text } from 'ink';
import { colors, icons } from '../theme.js';

const ConfirmDialog = ({
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  dangerous = false,
}) => {
  const borderColor = dangerous ? colors.danger : colors.primary;
  const confirmColor = dangerous ? colors.danger : colors.success;

  return React.createElement(
    Box,
    {
      flexDirection: 'column',
      borderStyle: 'round',
      borderColor: borderColor,
      paddingX: 2,
      paddingY: 1,
      marginTop: 1,
    },
    // Title
    React.createElement(
      Text,
      { bold: true, color: dangerous ? colors.danger : colors.primaryBright },
      dangerous ? `${icons.warning} ` : '',
      title
    ),
    React.createElement(Text, null, ''),

    // Message
    React.createElement(
      Text,
      { color: colors.text },
      message
    ),
    React.createElement(Text, null, ''),

    // Buttons hint
    React.createElement(
      Box,
      { flexDirection: 'row' },
      React.createElement(
        Text,
        { color: confirmColor },
        '[',
        React.createElement(Text, { bold: true }, 'Y'),
        '] ',
        confirmLabel
      ),
      React.createElement(Text, null, '    '),
      React.createElement(
        Text,
        { color: colors.textMuted },
        '[',
        React.createElement(Text, { bold: true }, 'N'),
        '] ',
        cancelLabel
      )
    )
  );
};

export default ConfirmDialog;
