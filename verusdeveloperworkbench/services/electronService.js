/**
 * Service for interacting with Electron's main process via IPC.
 */
export const electronService = {
  /**
   * Sends an RPC command to the Verus daemon via the Electron main process.
   * @param {string} method The RPC method name.
   * @param {Array<any>} params An array of parameters for the RPC method.
   * @returns {Promise<any>} A promise that resolves with the result of the RPC command.
   * @throws Will throw an error if the IPC call fails or the daemon returns an error.
   */
  sendRPCCommand: async (method, params) => {
    if (window.electron && window.electron.ipcRenderer) {
      try {
        console.log(`electronService: Sending RPC command - Method: ${method}, Params:`, params);
        const result = await window.electron.ipcRenderer.invoke('sendRPCCommand', method, params);
        console.log(`electronService: Received result for ${method}:`, result);
        if (result && result.error) {
          // If the Verus daemon itself returned an error object
          throw new Error(typeof result.error === 'object' ? JSON.stringify(result.error) : result.error);
        }
        return result;
      } catch (e) {
        console.error(`electronService: Error sending RPC command ${method}:`, e);
        // Re-throw the error to be caught by the calling function in useVerusRpc
        throw e instanceof Error ? e : new Error(e.message || 'An unexpected error occurred during IPC call.');
      }
    } else {
      console.error('electronService: Electron IPC renderer not available. Are you running in Electron?');
      throw new Error('Electron IPC renderer is not available.');
    }
  },

  // Add other Electron IPC interactions here as needed, for example:
  // selectDirectory: async () => window.electron.ipcRenderer.invoke('select-verus-directory'),
  // saveFile: async (filePath, content) => window.electron.ipcRenderer.invoke('save-file', filePath, content),
  // loadFile: async (filePath) => window.electron.ipcRenderer.invoke('load-file', filePath),
  // getVerusPath: async () => window.electron.ipcRenderer.invoke('get-verus-path'),
  // showSaveDialog: async (options) => window.electron.showSaveDialog(options)

  // Example for functions from the original App.jsx that interact with electron
  getVerusPath: async () => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.ipcRenderer.invoke('get-verus-path');
    }
    throw new Error('Electron IPC not available');
  },
  selectVerusDirectory: async () => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.ipcRenderer.invoke('select-verus-directory');
    }
    throw new Error('Electron IPC not available');
  },
  saveVdxfKeys: async (keys) => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.ipcRenderer.invoke('save-vdxf-keys', keys);
    }
    throw new Error('Electron IPC not available');
  },
  loadVdxfKeys: async () => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.ipcRenderer.invoke('load-vdxf-keys');
    }
    throw new Error('Electron IPC not available');
  },
  saveContentMap: async (contentMap) => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.ipcRenderer.invoke('save-content-map', contentMap);
    }
    throw new Error('Electron IPC not available');
  },
  showSaveDialog: async (options) => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.showSaveDialog(options);
    }
    throw new Error('Electron IPC not available');
  },
  saveFile: async (filePath, content) => {
    if (window.electron && window.electron.ipcRenderer) {
      return window.electron.saveFile(filePath, content);
    }
    throw new Error('Electron IPC not available');
  }
}; 