const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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

// Add these handlers with the other ipcMain handlers
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
      await fs.writeFile(filePath, JSON.stringify(keys, null, 2));
      return { success: true };
    }
    return { error: 'Save cancelled' };
  } catch (error) {
    console.error('Error saving VDXF keys:', error);
    return { error: error.message };
  }
});

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
      const fileContent = await fs.readFile(filePaths[0], 'utf8');
      const keys = JSON.parse(fileContent);
      return { keys };
    }
    return { error: 'Load cancelled' };
  } catch (error) {
    console.error('Error loading VDXF keys:', error);
    return { error: error.message };
  }
});

// Generic RPC command handler for renderer
ipcMain.handle('sendRPCCommand', async (event, method, params) => {
  try {
    // Use the same logic as other handlers to get the verusPath
    // Try to get from environment or config, or fallback to './verus'
    let verusPath = process.env.VERUS_PATH || './verus';
    // If you have a more robust way to get the path, use it here

    let command = `${verusPath} -chain=VRSCTEST ${method}`;
    if (params && params.length > 0) {
      command += ' ' + params.map(p => (typeof p === 'object' ? `'${JSON.stringify(p)}'` : `'${p}'`)).join(' ');
    }
    console.log('Executing RPC command:', command);
    
    // Special handling for listidentities
    if (method === 'listidentities') {
      const { stdout, stderr } = await execPromise(command, { 
        maxBuffer: 100 * 1024 * 1024 // 100MB buffer for listidentities
      });
      
      if (stderr) return { error: stderr };
      
      try {
        const result = JSON.parse(stdout);
        
        // Use centralized filtering utility
        if (Array.isArray(result)) {
          const filteredResult = filterTicketIds(result);
          return filteredResult;
        }
        return result;
      } catch {
        return stdout.trim();
      }
    } else {
      // Standard handling for other commands
      const { stdout, stderr } = await execPromise(command, {
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for other commands
      });
      
      if (stderr) return { error: stderr };
      try {
        return JSON.parse(stdout);
      } catch {
        return stdout.trim();
      }
    }
  } catch (error) {
    return { error: error.message };
  }
}); 