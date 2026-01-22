import React, { useState, useEffect } from 'react';
import { Box, useApp, useInput } from 'ink';
import { useStore } from '../store.js';
import Layout from './components/Layout.js';
import ScanScreen from './screens/ScanScreen.js';
import DuplicatesScreen from './screens/DuplicatesScreen.js';
import JunkScreen from './screens/JunkScreen.js';
import LargeFilesScreen from './screens/LargeFilesScreen.js';
import ReviewScreen from './screens/ReviewScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';
import { screens } from './theme.js';

const App = () => {
  const { exit } = useApp();
  const currentScreen = useStore((state) => state.currentScreen);
  const setScreen = useStore((state) => state.setScreen);
  const [showHelp, setShowHelp] = useState(false);

  // Screen order for arrow navigation
  const screenOrder = [screens.SCAN, screens.DUPLICATES, screens.JUNK, screens.LARGE, screens.REVIEW, screens.SETTINGS];

  // Handle keyboard input
  useInput((input, key) => {
    // Quit on 'q' or Ctrl+C
    if (input === 'q' || input === 'Q') {
      exit();
      return;
    }

    // Toggle help on '?'
    if (input === '?') {
      setShowHelp(!showHelp);
      return;
    }

    // Close help on escape
    if (key.escape && showHelp) {
      setShowHelp(false);
      return;
    }

    // Up/down arrows navigate between screens
    if (key.upArrow) {
      const currentIndex = screenOrder.indexOf(currentScreen);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : screenOrder.length - 1;
      setScreen(screenOrder[prevIndex]);
      return;
    }
    if (key.downArrow) {
      const currentIndex = screenOrder.indexOf(currentScreen);
      const nextIndex = currentIndex < screenOrder.length - 1 ? currentIndex + 1 : 0;
      setScreen(screenOrder[nextIndex]);
      return;
    }

    // Tab / Shift+Tab for screen navigation
    if (key.tab) {
      const currentIndex = screenOrder.indexOf(currentScreen);
      if (key.shift) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : screenOrder.length - 1;
        setScreen(screenOrder[prevIndex]);
      } else {
        const nextIndex = currentIndex < screenOrder.length - 1 ? currentIndex + 1 : 0;
        setScreen(screenOrder[nextIndex]);
      }
      return;
    }

    // Number keys for direct screen navigation
    if (input === '1') setScreen(screens.SCAN);
    if (input === '2') setScreen(screens.DUPLICATES);
    if (input === '3') setScreen(screens.JUNK);
    if (input === '4') setScreen(screens.LARGE);
    if (input === '5') setScreen(screens.REVIEW);
    if (input === '6') setScreen(screens.SETTINGS);
  });

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case screens.SCAN:
        return React.createElement(ScanScreen);
      case screens.DUPLICATES:
        return React.createElement(DuplicatesScreen);
      case screens.JUNK:
        return React.createElement(JunkScreen);
      case screens.LARGE:
        return React.createElement(LargeFilesScreen);
      case screens.REVIEW:
        return React.createElement(ReviewScreen);
      case screens.SETTINGS:
        return React.createElement(SettingsScreen);
      default:
        return React.createElement(ScanScreen);
    }
  };

  return React.createElement(Layout, { showHelp, setShowHelp }, renderScreen());
};

export default App;
