const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { execFile } = require('child_process');
const fs = require('fs'); // Changed from fs.promises for accessSync

// Import ticket filtering utility
const ticketFilterPath = path.join(__dirname, '../../verusdeveloperworkbench/utils/ticketFilter.cjs');
let filterTicketIds;

// Try to load the utility, fallback to inline filtering if not available
try {
  const ticketFilter = require(ticketFilterPath);
  filterTicketIds = ticketFilter.filterTicketIds;
} catch (e) {
  console.warn('Could not load ticket filter utility, using fallback filtering');
  // Fallback inline filtering function
  filterTicketIds = (identityList) => {
    if (!Array.isArray(identityList)) return identityList;
    
    const filtered = identityList.filter(item => {
      if (!item || !item.identity || !item.identity.name) return true;
      
      const name = item.identity.name;
      const blockWithParentPattern = /^\d{6}_\d+of\d+@[^@]+@$/;
      const blockWithDotPattern = /^\d{6}_\d+of\d+\./;
      const numberedPattern = /^\d{6}_\d+of\d+@$/;
      const generalTicketPattern = /^\d{6}_\d+of\d+/;
      const vlottoPattern = /vlotto|ticket|lottery/i;
      
      return !(blockWithParentPattern.test(name) || blockWithDotPattern.test(name) || numberedPattern.test(name) || generalTicketPattern.test(name) || vlottoPattern.test(name));
    });
    
    console.log(`Filtered ${identityList.length - filtered.length} ticket IDs from listidentities result`);
    return filtered;
  };
}

// Initialize store for app settings
const store = new Store();

const preloadScriptPath = path.join(__dirname, 'preload.js');
console.log('[Main Process] Attempting to load preload script from:', preloadScriptPath);

try {
  fs.accessSync(preloadScriptPath, fs.constants.R_OK);
  console.log('[Main Process] Preload script found and is readable at:', preloadScriptPath);
} catch (err) {
  console.error('[Main Process] ERROR: Preload script not found or not readable at:', preloadScriptPath, err);
  // Consider throwing an error here if preload is critical for your app's functioning
  // For example: throw new Error(`Critical preload script not found: ${preloadScriptPath}`);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1250,
    minHeight: 600,
    webPreferences: {
      preload: preloadScriptPath, // Use the variable
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../verusdeveloperworkbench/dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for Verus node communication
ipcMain.handle('get-verus-path', () => {
  return store.get('verusPath');
});

ipcMain.handle('set-verus-path', (event, path) => {
  store.set('verusPath', path);
  return true;
});

ipcMain.handle('check-node-connection', async () => {
  const verusPath = store.get('verusPath');
  if (!verusPath) {
    return { connected: false, error: 'Verus installation path not set.' };
  }
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'getinfo'], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ connected: false, error: stderr || error.message });
      } else {
        try {
          const info = JSON.parse(stdout);
          resolve({
            connected: true,
            version: info.version,
            blocks: info.blocks,
            info
          });
        } catch (e) {
          resolve({ connected: false, error: 'Failed to parse node output.' });
        }
      }
    });
  });
});

ipcMain.handle('select-verus-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  store.set('verusPath', result.filePaths[0]);
  return result.filePaths[0];
});

ipcMain.handle('list-identities', async () => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'listidentities'], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          resolve({ error: 'Failed to parse listidentities output.' });
        }
      }
    });
  });
});

ipcMain.handle('get-identity', async (event, name) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'getidentity', name], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          resolve({ error: 'Failed to parse getidentity output.' });
        }
      }
    });
  });
});

// New handler to get combined identity information
ipcMain.handle('get-identity-info', async (event, name) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  
  try {
    // Get basic identity info
    const identityInfo = await new Promise((resolve, reject) => {
      execFile('./verus', ['-chain=VRSCTEST', 'getidentity', name], { cwd: verusPath }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else {
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(new Error('Failed to parse getidentity output.'));
          }
        }
      });
    });
    
    // Get identity content
    const contentInfo = await new Promise((resolve, reject) => {
      execFile('./verus', ['-chain=VRSCTEST', 'getidentitycontent', name], { cwd: verusPath }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else {
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(new Error('Failed to parse getidentitycontent output.'));
          }
        }
      });
    });
    
    // Combine the information
    return {
      ...identityInfo,
      content: contentInfo
    };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('get-currency-balance', async (event, address) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'getcurrencybalance', address], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          resolve({ error: 'Failed to parse getcurrencybalance output.' });
        }
      }
    });
  });
});

ipcMain.handle('get-identity-content', async (event, identity) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'getidentitycontent', identity], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result.identity);
        } catch (e) {
          resolve({ error: 'Failed to parse getidentitycontent output.' });
        }
      }
    });
  });
});

ipcMain.handle('update-content-map', async (event, { identity, key, value, contentmap }) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'getidentitycontent', identity], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const currentContent = JSON.parse(stdout);
          console.log('Received contentmap from frontend:', contentmap);
          const updateObj = {
            name: currentContent.identity.name,
            primaryaddresses: currentContent.identity.primaryaddresses,
            minimumsignatures: currentContent.identity.minimumsignatures,
            revocationauthority: currentContent.identity.revocationauthority,
            recoveryauthority: currentContent.identity.recoveryauthority,
            contentmap: contentmap
          };
          console.log('Final updateObj for updateidentity:', updateObj);

          const args = ['-chain=VRSCTEST', 'updateidentity', JSON.stringify(updateObj)];
          console.log('Executing command:', args);

          execFile('./verus', args, { cwd: verusPath }, (updateError, updateStdout, updateStderr) => {
            if (updateError) {
              console.error('Error executing updateidentity:', updateError);
              resolve({ error: updateStderr || updateError.message });
              return;
            }
            if (updateStderr) {
              console.error('stderr:', updateStderr);
              resolve({ error: updateStderr });
              return;
            }
            // Always return the output as a txid string
            resolve({ txid: updateStdout.trim() });
          });
        } catch (e) {
          resolve({ error: 'Failed to parse getidentitycontent output.' });
        }
      }
    });
  });
});

ipcMain.handle('update-content-multimap', async (event, { identity, contentmultimap }) => {
  console.log('update-content-multimap called', identity, JSON.stringify(contentmultimap, null, 2));
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  return new Promise((resolve) => {
    execFile('./verus', ['-chain=VRSCTEST', 'getidentitycontent', identity], { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const currentContent = JSON.parse(stdout);
          const updateObj = {
            name: currentContent.identity.name,
            primaryaddresses: currentContent.identity.primaryaddresses,
            minimumsignatures: currentContent.identity.minimumsignatures,
            revocationauthority: currentContent.identity.revocationauthority,
            recoveryauthority: currentContent.identity.recoveryauthority,
            contentmultimap: contentmultimap // Use the complete contentmultimap from frontend
          };
          console.log('About to execute updateidentity with:', JSON.stringify(updateObj, null, 2));
          const args = ['-chain=VRSCTEST', 'updateidentity', JSON.stringify(updateObj)];
          console.log('TEST LOG: before FINAL COMMAND');
          console.log('FINAL COMMAND:', `./verus ${args.map(a => `'${a}'`).join(' ')}`);
          console.log('TEST LOG: after FINAL COMMAND');
          execFile('./verus', args, { cwd: verusPath }, (updateError, updateStdout, updateStderr) => {
            console.log('updateidentity execFile callback:', updateError, updateStdout, updateStderr);
            if (updateError) {
              resolve({ error: updateStderr || updateError.message });
              return;
            }
            if (updateStderr) {
              resolve({ error: updateStderr });
              return;
            }
            resolve({ txid: updateStdout.trim() });
          });
        } catch (e) {
          resolve({ error: 'Failed to parse getidentitycontent output.' });
        }
      }
    });
  });
});

ipcMain.handle('get-vdxfid', async (event, vdxfuri, extraparams) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };
  const args = ['-chain=VRSCTEST', 'getvdxfid', vdxfuri];
  if (extraparams && Object.keys(extraparams).length > 0) {
    args.push(JSON.stringify(extraparams));
  }
  return new Promise((resolve) => {
    execFile('./verus', args, { cwd: verusPath }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: stderr || error.message });
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          resolve({ error: 'Failed to parse getvdxfid output.' });
        }
      }
    });
  });
});

// Save VDXF Keys Handler
ipcMain.handle('save-vdxf-keys', async (event, keys) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save VDXF Keys',
      defaultPath: path.join(app.getPath('documents'), 'vdxf-keys.json'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (filePath) {
      await fs.promises.writeFile(filePath, JSON.stringify(keys, null, 2)); // Use fs.promises here
      return { success: true };
    }
    return { error: 'Save cancelled' };
  } catch (error) {
    console.error('Error saving VDXF keys:', error);
    return { error: error.message };
  }
});

// Load VDXF Keys Handler
ipcMain.handle('load-vdxf-keys', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Load VDXF Keys',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
      const fileContent = await fs.promises.readFile(filePaths[0], 'utf8'); // Use fs.promises here
      const keys = JSON.parse(fileContent);
      return { keys };
    }
    return { error: 'Load cancelled' };
  } catch (error) {
    console.error('Error loading VDXF keys:', error);
    return { error: error.message };
  }
});

// Save Content Map Handler
ipcMain.handle('save-content-map', async (event, contentmap) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Content Map',
      defaultPath: path.join(app.getPath('documents'), 'content-map.json'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    if (filePath) {
      await fs.promises.writeFile(filePath, JSON.stringify(contentmap, null, 2)); // Use fs.promises here
      return { success: true };
    }
    return { error: 'Save cancelled' };
  } catch (error) {
    console.error('Error saving content map:', error);
    return { error: error.message };
  }
});

// Batch Add Content Map Handler
ipcMain.handle('batch-add-content-map', async (event, identityaddress) => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Select Batch Content Map File',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });
    if (!filePaths || filePaths.length === 0) return { error: 'No file selected' };
    const fileContent = await fs.promises.readFile(filePaths[0], 'utf8'); // Use fs.promises here
    let batchContentMap;
    try {
      batchContentMap = JSON.parse(fileContent);
      console.log('Parsed batchContentMap from file:', batchContentMap);
    } catch (e) {
      return { error: 'Invalid JSON in batch file' };
    }
    // Compose the updateidentity command
    const verusPath = store.get('verusPath');
    if (!verusPath) return { error: 'Verus installation path not set.' };
    // Fetch current identity details to get required fields
    return new Promise((resolve) => {
      execFile('./verus', ['-chain=VRSCTEST', 'getidentitycontent', identityaddress], { cwd: verusPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ error: stderr || error.message });
        } else {
          try {
            const currentContent = JSON.parse(stdout);
            const updateObj = {
              name: currentContent.identity.name,
              primaryaddresses: currentContent.identity.primaryaddresses,
              minimumsignatures: currentContent.identity.minimumsignatures,
              revocationauthority: currentContent.identity.revocationauthority,
              recoveryauthority: currentContent.identity.recoveryauthority,
              contentmap: batchContentMap
            };
            console.log('updateObj for batch updateidentity:', updateObj);
            const args = ['-chain=VRSCTEST', 'updateidentity', JSON.stringify(updateObj)];
            console.log('Batch updateidentity command:', args.join(' '));
            execFile('./verus', args, { cwd: verusPath }, (updateError, updateStdout, updateStderr) => {
              if (updateError) {
                console.error('Batch updateidentity error:', updateError);
                resolve({ error: updateStderr || updateError.message });
                return;
              }
              if (updateStderr) {
                console.error('Batch updateidentity stderr:', updateStderr);
                resolve({ error: updateStderr });
                return;
              }
              console.log('Batch updateidentity result:', updateStdout.trim());
              resolve({ txid: updateStdout.trim() });
            });
          } catch (e) {
            resolve({ error: 'Failed to parse getidentitycontent output.' });
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in batch add content map:', error);
    return { error: error.message };
  }
});

// Add this new handler for multiple file selection
ipcMain.handle('select-multiple-files', async (event, options) => {
  try {
    const dialogOptions = options || { properties: ['openFile', 'multiSelections'] };
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled || !filePaths || filePaths.length === 0) {
      return []; // Return empty array if cancelled or no files selected
    }
    return filePaths;
  } catch (error) {
    console.error('Error opening multiple file dialog:', error);
    return { error: error.message || 'Failed to open file dialog' };
  }
});

// Existing generic RPC command handler for renderer
ipcMain.handle('sendRPCCommand', async (event, method, params) => {
  const verusPath = store.get('verusPath');
  if (!verusPath) return { error: 'Verus installation path not set.' };

  try {
    const args = ['-chain=VRSCTEST', method];
    
    if (params && params.length > 0) {
      params.forEach(param => {
        if (param === null || param === undefined) {
          return;
        }
        
        if (typeof param === 'object') {
          args.push(JSON.stringify(param));
        } else {
          args.push(String(param));
        }
      });
    }
    
    console.log('Executing RPC command:', `./verus ${args.join(' ')}`);
    
    return new Promise((resolve, reject) => {
      // Special handling for listidentities to prevent buffer overflow and filter tickets
      if (method === 'listidentities') {
        // Use a much larger buffer for listidentities (100MB)
        const maxBuffer = 100 * 1024 * 1024;
        
        execFile('./verus', args, { 
          cwd: verusPath, 
          maxBuffer: maxBuffer 
        }, (error, stdout, stderr) => {
          if (error) {
            console.error('RPC command error:', error, stderr);
            resolve({ error: stderr || error.message });
            return;
          }
          
          if (stderr) {
            console.error('RPC command stderr:', stderr);
            resolve({ error: stderr });
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            
            // Use centralized filtering utility
            if (Array.isArray(result)) {
              const filteredResult = filterTicketIds(result);
              resolve(filteredResult);
            } else {
              resolve(result);
            }
          } catch (e) {
            resolve(stdout.trim());
          }
        });
      } else {
        // Standard handling for other commands with increased buffer
        execFile('./verus', args, { 
          cwd: verusPath,
          maxBuffer: 10 * 1024 * 1024 // 10MB for other commands
        }, (error, stdout, stderr) => {
          if (error) {
            console.error('RPC command error:', error, stderr);
            resolve({ error: stderr || error.message });
            return;
          }
          
          if (stderr) {
            console.error('RPC command stderr:', stderr);
            resolve({ error: stderr });
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            resolve(stdout.trim());
          }
        });
      }
    });
  } catch (error) {
    console.error('Exception in sendRPCCommand:', error);
    return { error: error.message };
  }
});

// --- IPC Handlers for electron-store ---
ipcMain.handle('electron-store-get', async (event, key) => {
  try {
    return store.get(key);
  } catch (error) {
    console.error(`Error getting key "${key}" from electron-store:`, error);
    return undefined; // Indicate failure or return error object
  }
});

ipcMain.handle('electron-store-set', async (event, key, val) => {
  try {
    store.set(key, val);
    return { success: true };
  } catch (error) {
    console.error(`Error setting key "${key}" in electron-store:`, error);
    return { success: false, error: error.message };
  }
});
// --- End IPC Handlers --- 
