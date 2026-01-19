import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

const ProgressBar = ({ progress = 0, width = 40, showPercent = true }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const filledWidth = Math.round((clampedProgress / 100) * width);
  const emptyWidth = width - filledWidth;

  // Create gradient effect for filled portion
  const filledChar = '█';
  const emptyChar = '░';

  // Color based on progress
  const getProgressColor = () => {
    if (clampedProgress < 30) return colors.info;
    if (clampedProgress < 70) return colors.accent;
    if (clampedProgress < 100) return colors.primaryBright;
    return colors.success;
  };

  return React.createElement(
    Box,
    { flexDirection: 'row' },
    React.createElement(
      Text,
      { color: colors.textDim },
      '['
    ),
    React.createElement(
      Text,
      { color: getProgressColor() },
      filledChar.repeat(filledWidth)
    ),
    React.createElement(
      Text,
      { color: colors.border },
      emptyChar.repeat(emptyWidth)
    ),
    React.createElement(
      Text,
      { color: colors.textDim },
      ']'
    ),
    showPercent
      ? React.createElement(
          Text,
          { color: colors.text },
          ` ${Math.round(clampedProgress)}%`
        )
      : null
  );
};

export default ProgressBar;
