import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../../store.js';
import { colors, icons, screens } from '../theme.js';
import { filesize } from 'filesize';

const menuItems = [
  { key: '1', screen: screens.SCAN, label: 'Scan', icon: icons.search },
  { key: '2', screen: screens.DUPLICATES, label: 'Duplicates', icon: icons.duplicate },
  { key: '3', screen: screens.JUNK, label: 'Junk Files', icon: icons.junk },
  { key: '4', screen: screens.LARGE, label: 'Large Files', icon: icons.large },
  { key: '5', screen: screens.REVIEW, label: 'Review', icon: icons.trash },
];

const Sidebar = ({ width }) => {
  const currentScreen = useStore((state) => state.currentScreen);
  const duplicates = useStore((state) => state.duplicates);
  const junkFiles = useStore((state) => state.junkFiles);
  const largeFiles = useStore((state) => state.largeFiles);
  const selectedDuplicates = useStore((state) => state.selectedDuplicates);
  const selectedJunk = useStore((state) => state.selectedJunk);
  const selectedLarge = useStore((state) => state.selectedLarge);

  // Calculate counts for badges
  const getCounts = (screen) => {
    switch (screen) {
      case screens.DUPLICATES: {
        const totalDupes = duplicates.reduce((acc, g) => acc + g.files.length - 1, 0);
        return { total: totalDupes, selected: selectedDuplicates.size };
      }
      case screens.JUNK:
        return { total: junkFiles.length, selected: selectedJunk.size };
      case screens.LARGE:
        return { total: largeFiles.length, selected: selectedLarge.size };
      case screens.REVIEW: {
        const totalSelected = selectedDuplicates.size + selectedJunk.size + selectedLarge.size;
        return { total: totalSelected, selected: totalSelected };
      }
      default:
        return { total: 0, selected: 0 };
    }
  };

  return React.createElement(
    Box,
    {
      flexDirection: 'column',
      width: width,
      paddingTop: 1,
      paddingLeft: 1,
    },
    // Menu items
    ...menuItems.map((item) => {
      const isActive = currentScreen === item.screen;
      const counts = getCounts(item.screen);

      return React.createElement(
        Box,
        {
          key: item.key,
          paddingY: 0,
          marginBottom: 1,
        },
        React.createElement(
          Text,
          {
            color: isActive ? colors.primaryBright : colors.textMuted,
            bold: isActive,
            backgroundColor: isActive ? colors.primary : undefined,
          },
          isActive ? ' ' : ' ',
          React.createElement(
            Text,
            { color: isActive ? colors.accentBright : colors.accent },
            item.key
          ),
          ' ',
          item.icon,
          ' ',
          item.label.padEnd(10),
          counts.total > 0
            ? React.createElement(
                Text,
                { color: isActive ? colors.text : colors.textDim },
                ` ${counts.total}`
              )
            : '',
          isActive ? ' ' : ''
        )
      );
    }),

    // Spacer
    React.createElement(Box, { flexGrow: 1 }),

    // Stats summary at bottom
    React.createElement(
      Box,
      {
        flexDirection: 'column',
        borderStyle: 'round',
        borderColor: colors.border,
        paddingX: 1,
        marginBottom: 1,
        marginRight: 1,
      },
      React.createElement(
        Text,
        { color: colors.textMuted, bold: true },
        'Selected'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        `${selectedDuplicates.size + selectedJunk.size + selectedLarge.size} items`
      )
    )
  );
};

export default Sidebar;
