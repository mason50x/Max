import { create } from 'zustand';
import { screens } from './ui/theme.js';

export const useStore = create((set, get) => ({
  // Navigation state
  currentScreen: screens.SCAN,
  setScreen: (screen) => set({ currentScreen: screen }),

  // Settings
  theme: 'default',
  setTheme: (theme) => set({ theme }),

  // Scan state
  isScanning: false,
  scanProgress: 0,
  scanStatus: 'idle', // idle, scanning, complete, error
  scanMessage: '',
  filesScanned: 0,
  totalSize: 0,
  currentFile: '',
  currentDir: '',
  scanStep: 1,
  diskInfo: {
    total: 0,
    used: 0,
    free: 0,
  },

  // Results
  duplicates: [],      // Array of duplicate groups: [{ hash, files: [{ path, size, modified }] }]
  junkFiles: [],       // Array of junk items: [{ path, size, category, modified }]
  largeFiles: [],      // Array of large files: [{ path, size, lastAccessed, age }]

  // Selection state
  selectedDuplicates: new Set(),
  selectedJunk: new Set(),
  selectedLarge: new Set(),

  // Cleanup stats
  totalToClean: 0,
  itemsToClean: 0,

  // Actions for scanning
  startScan: () => set({
    isScanning: true,
    scanStatus: 'scanning',
    scanProgress: 0,
    filesScanned: 0,
    scanMessage: 'Starting scan...',
    currentFile: '',
    currentDir: '',
    scanStep: 1,
  }),

  updateScanProgress: (progress, filesScanned, message, extra = {}) => set({
    scanProgress: progress,
    filesScanned,
    scanMessage: message || get().scanMessage,
    currentFile: extra.currentFile || get().currentFile,
    currentDir: extra.currentDir || get().currentDir,
    scanStep: extra.scanStep || get().scanStep,
  }),

  completeScan: (results) => set({
    isScanning: false,
    scanStatus: 'complete',
    scanProgress: 100,
    duplicates: results.duplicates || [],
    junkFiles: results.junkFiles || [],
    largeFiles: results.largeFiles || [],
    totalSize: results.totalSize || 0,
    scanMessage: 'Scan complete!',
  }),

  setScanError: (error) => set({
    isScanning: false,
    scanStatus: 'error',
    scanMessage: error,
  }),

  setDiskInfo: (info) => set({ diskInfo: info }),

  // Selection actions
  toggleDuplicateSelection: (path) => set((state) => {
    const newSelection = new Set(state.selectedDuplicates);
    if (newSelection.has(path)) {
      newSelection.delete(path);
    } else {
      newSelection.add(path);
    }
    return { selectedDuplicates: newSelection };
  }),

  toggleJunkSelection: (path) => set((state) => {
    const newSelection = new Set(state.selectedJunk);
    if (newSelection.has(path)) {
      newSelection.delete(path);
    } else {
      newSelection.add(path);
    }
    return { selectedJunk: newSelection };
  }),

  toggleLargeSelection: (path) => set((state) => {
    const newSelection = new Set(state.selectedLarge);
    if (newSelection.has(path)) {
      newSelection.delete(path);
    } else {
      newSelection.add(path);
    }
    return { selectedLarge: newSelection };
  }),

  selectAllDuplicates: () => set((state) => {
    const allPaths = new Set();
    state.duplicates.forEach((group) => {
      // Select all but the first (original) in each group
      group.files.slice(1).forEach((file) => allPaths.add(file.path));
    });
    return { selectedDuplicates: allPaths };
  }),

  selectAllJunk: () => set((state) => {
    const allPaths = new Set(state.junkFiles.map((f) => f.path));
    return { selectedJunk: allPaths };
  }),

  selectAllLarge: () => set((state) => {
    const allPaths = new Set(state.largeFiles.map((f) => f.path));
    return { selectedLarge: allPaths };
  }),

  clearAllSelections: () => set({
    selectedDuplicates: new Set(),
    selectedJunk: new Set(),
    selectedLarge: new Set(),
  }),

  // Calculate total cleanup size
  calculateCleanupSize: () => {
    const state = get();
    let total = 0;
    let items = 0;

    // Add selected duplicates
    state.duplicates.forEach((group) => {
      group.files.forEach((file) => {
        if (state.selectedDuplicates.has(file.path)) {
          total += file.size;
          items++;
        }
      });
    });

    // Add selected junk
    state.junkFiles.forEach((file) => {
      if (state.selectedJunk.has(file.path)) {
        total += file.size;
        items++;
      }
    });

    // Add selected large files
    state.largeFiles.forEach((file) => {
      if (state.selectedLarge.has(file.path)) {
        total += file.size;
        items++;
      }
    });

    set({ totalToClean: total, itemsToClean: items });
    return { total, items };
  },

  // Remove cleaned items from results
  removeCleanedItems: (paths) => set((state) => {
    const pathSet = new Set(paths);
    return {
      duplicates: state.duplicates.map((group) => ({
        ...group,
        files: group.files.filter((f) => !pathSet.has(f.path)),
      })).filter((group) => group.files.length > 1),
      junkFiles: state.junkFiles.filter((f) => !pathSet.has(f.path)),
      largeFiles: state.largeFiles.filter((f) => !pathSet.has(f.path)),
      selectedDuplicates: new Set([...state.selectedDuplicates].filter((p) => !pathSet.has(p))),
      selectedJunk: new Set([...state.selectedJunk].filter((p) => !pathSet.has(p))),
      selectedLarge: new Set([...state.selectedLarge].filter((p) => !pathSet.has(p))),
    };
  }),

  // Reset store
  reset: () => set({
    isScanning: false,
    scanProgress: 0,
    scanStatus: 'idle',
    scanMessage: '',
    filesScanned: 0,
    totalSize: 0,
    duplicates: [],
    junkFiles: [],
    largeFiles: [],
    selectedDuplicates: new Set(),
    selectedJunk: new Set(),
    selectedLarge: new Set(),
    totalToClean: 0,
    itemsToClean: 0,
  }),
}));

export default useStore;
