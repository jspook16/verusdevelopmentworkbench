const { contextBridge, ipcRenderer } = require('electron');

console.log('[Preload Script] Attempting to expose electron API...');

// --- Expose electron-store functionality ---
const storeApi = {
  get: (key) => ipcRenderer.invoke('electron-store-get', key),
  set: (key, val) => ipcRenderer.invoke('electron-store-set', key, val),
};

// --- Existing electronService exposure (Keep this) ---
const electronService = {
  selectVerusDirectory: () => ipcRenderer.invoke('select-verus-directory'),
  checkNodeConnection: () => ipcRenderer.invoke('check-node-connection'),
  setVerusPath: (path) => ipcRenderer.invoke('set-verus-path', path),
  getVerusPath: () => ipcRenderer.invoke('get-verus-path'),
  // Add any other previously exposed methods here
};

// --- Expose all APIs under window.electron ---
try {
  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      invoke: (channel, ...args) => {
        console.log(`[Preload IPC Invoke] Channel: ${channel}, Args:`, args);
        return ipcRenderer.invoke(channel, ...args);
      }
      // Add other ipcRenderer methods like 'on', 'send' if needed by your app
    },
    store: storeApi,
    service: electronService
  });
  console.log('[Preload Script] Successfully exposed electron API to window.electron');
} catch (error) {
  console.error('[Preload Script] FAILED to expose electron API:', error);
} 