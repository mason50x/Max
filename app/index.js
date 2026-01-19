import React from 'react';
import { render } from 'ink';
import App from './ui/App.js';

// Store instance reference for cleanup
let instance = null;

const main = async () => {
  instance = render(React.createElement(App));

  // Wait for the app to exit
  await instance.waitUntilExit();
};

main().catch((err) => {
  console.error('Error running Max:', err);
  process.exit(1);
});

export { instance };
