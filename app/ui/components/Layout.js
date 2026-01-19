import React from 'react';
import { Box, Text, useStdout } from 'ink';
import Sidebar from './Sidebar.js';
import Header from './Header.js';
import { colors, style, box } from '../theme.js';

const HelpOverlay = ({ onClose }) => {
  return React.createElement(
    Box,
    {
      flexDirection: 'column',
      borderStyle: 'round',
      borderColor: colors.primary,
      padding: 1,
      marginLeft: 10,
      marginTop: 3,
      width: 50,
    },
    React.createElement(
      Text,
      { bold: true, color: colors.primaryBright },
      '  Keyboard Shortcuts'
    ),
    React.createElement(Text, null, ''),
    React.createElement(
      Box,
      { flexDirection: 'column', paddingLeft: 1 },
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, '1-5'),
        '     Switch screens'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, '↑/↓'),
        '     Navigate list'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, 'Space'),
        '   Toggle selection'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, 'a'),
        '       Select all'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, 'Enter'),
        '   Start scan / Confirm'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, 'p'),
        '       Preview file'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, '?'),
        '       Toggle help'
      ),
      React.createElement(
        Text,
        { color: colors.text },
        React.createElement(Text, { color: colors.accent }, 'q'),
        '       Quit'
      )
    ),
    React.createElement(Text, null, ''),
    React.createElement(
      Text,
      { color: colors.textMuted, dimColor: true },
      '  Press ? or Esc to close'
    )
  );
};

const Layout = ({ children, showHelp, setShowHelp }) => {
  const { stdout } = useStdout();
  const width = stdout?.columns || 80;
  const height = stdout?.rows || 24;

  const sidebarWidth = 24;
  const contentWidth = width - sidebarWidth - 3;
  const contentHeight = height - 5; // Account for header and footer

  return React.createElement(
    Box,
    {
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    },
    // Header
    React.createElement(Header),

    // Main content area
    React.createElement(
      Box,
      {
        flexDirection: 'row',
        flexGrow: 1,
      },
      // Sidebar
      React.createElement(Sidebar, { width: sidebarWidth }),

      // Vertical separator
      React.createElement(
        Box,
        {
          flexDirection: 'column',
          width: 1,
        },
        React.createElement(Text, { color: colors.border }, box.vertical.repeat(contentHeight))
      ),

      // Main content
      React.createElement(
        Box,
        {
          flexDirection: 'column',
          flexGrow: 1,
          paddingLeft: 1,
          paddingRight: 1,
        },
        children
      )
    ),

    // Footer / Status bar
    React.createElement(
      Box,
      {
        borderStyle: 'single',
        borderTop: true,
        borderBottom: false,
        borderLeft: false,
        borderRight: false,
        borderColor: colors.border,
        paddingLeft: 1,
        paddingRight: 1,
      },
      React.createElement(
        Text,
        { color: colors.textMuted },
        React.createElement(Text, { color: colors.accent }, '?'),
        ' Help  ',
        React.createElement(Text, { color: colors.accent }, '1-5'),
        ' Navigate  ',
        React.createElement(Text, { color: colors.accent }, 'q'),
        ' Quit'
      )
    ),

    // Help overlay (conditional)
    showHelp && React.createElement(HelpOverlay, { onClose: () => setShowHelp(false) })
  );
};

export default Layout;
