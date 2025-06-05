import React, { createContext, useState, useEffect, useCallback, useContext } from 'react'; // Added useContext
import { electronService } from '../services/electronService';
import { TerminalContext } from './TerminalContext'; // Added TerminalContext

export const NodeContext = createContext();

export const NodeProvider = ({ children }) => {
  const [verusPath, setVerusPathState] = useState('');
  const [nodeStatus, setNodeStatus] = useState({ connected: false, error: null, version: null, blocks: null, longestchain: null });
  const [loadingPath, setLoadingPath] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isRpcLoading, setIsRpcLoading] = useState(false);

  const { addTerminalEntry, getCommandTypeForContext } = useContext(TerminalContext) || {};

  const fetchStoredPath = useCallback(async () => {
    setLoadingPath(true);
    try {
      const path = await electronService.getVerusPath(); 
      if (path) {
        setVerusPathState(path);
      }
    } catch (error) {
      console.error('Error fetching stored Verus path:', error);
    } finally {
      setLoadingPath(false);
    }
  }, []);

  useEffect(() => {
    fetchStoredPath();
  }, [fetchStoredPath]);

  const checkNodeConnection = useCallback(async (currentPath) => { // Wrapped in useCallback
    const pathToUse = currentPath || verusPath;
    const timestamp = new Date().toISOString(); 

    if (!pathToUse) {
      const errorMsg = 'Verus path not set.';
      setNodeStatus({ connected: false, error: errorMsg, version: null, blocks: null, longestchain: null });
      if (addTerminalEntry) { // Check if addTerminalEntry is available
        addTerminalEntry({ timestamp, method: 'check-node-connection (local)', params: [`path: ${pathToUse || 'not set'}`], result: null, error: errorMsg, context: 'node' });
      }
      return;
    }

    setLoadingStatus(true);
    setNodeStatus({ connected: false, error: null, version: null, blocks: null, longestchain: null });
    
    let statusResultForLog = null;
    let statusErrorForLog = null;

    try {
      const status = await window.electron.ipcRenderer.invoke('check-node-connection');
      
      if (status.error) {
        statusErrorForLog = status.error;
        setNodeStatus({ connected: false, error: status.error, version: null, blocks: null, longestchain: null });
      } else {
        statusResultForLog = { version: status.version, blocks: status.blocks, connected: status.connected, longestchain: status.info?.longestchain, fullInfo: status.info };
        setNodeStatus({ 
          connected: status.connected, 
          error: null, 
          version: status.version, 
          blocks: status.blocks,
          longestchain: status.info?.longestchain
        });
      }
    } catch (error) {
      console.error('Error checking node connection in NodeContext:', error);
      statusErrorForLog = error.message || 'Failed to connect to node.';
      setNodeStatus({ connected: false, error: statusErrorForLog, version: null, blocks: null, longestchain: null });
    } finally {
      setLoadingStatus(false);
      if (addTerminalEntry) { // Check if addTerminalEntry is available
        addTerminalEntry({ 
          timestamp, 
          method: 'getinfo', 
          params: [], 
          result: statusResultForLog, 
          error: statusErrorForLog,
          context: 'node' 
        });
      }
    }
  }, [verusPath, addTerminalEntry]);

  const selectVerusDirectory = async () => {
    setLoadingStatus(true);
    let selectedPath = null;
    try {
      selectedPath = await electronService.selectVerusDirectory(); 
      if (selectedPath) {
        await window.electron.ipcRenderer.invoke('set-verus-path', selectedPath);
        setVerusPathState(selectedPath);
        // DO NOT automatically call checkNodeConnection here. User will click "Connect".
      }
      return selectedPath;
    } catch (error) {
      console.error('Error selecting Verus directory:', error);
      const errorMsg = 'Failed to select directory.';
      setNodeStatus({ connected: false, error: errorMsg, version: null, blocks: null, longestchain: null });
      if (addTerminalEntry) {
        addTerminalEntry({ timestamp: new Date().toISOString(), method: 'select-verus-directory (local)', params: [`path: ${selectedPath || 'not selected'}`], result: null, error: errorMsg, context:'node'});
      }
      return null;
    } finally {
      setLoadingStatus(false);
    }
  };
  
  const setVerusPath = async (newPath) => { // This might be for a manual text input in the future
    setLoadingStatus(true);
    try {
      await window.electron.ipcRenderer.invoke('set-verus-path', newPath);
      setVerusPathState(newPath);
      // DO NOT automatically call checkNodeConnection here. User will click "Connect".
      return true;
    } catch (error) {
      console.error('Error setting Verus path:', error);
      const errorMsg = 'Failed to set Verus path in main process.';
      setNodeStatus({ connected: false, error: errorMsg, version: null, blocks: null, longestchain: null });
      if (addTerminalEntry) {
         addTerminalEntry({ timestamp: new Date().toISOString(), method: 'set-verus-path (local)', params:[newPath], result: null, error: errorMsg, context:'node'});
      }
      return false;
    } finally {
      setLoadingStatus(false);
    }
  };

  const sendCommand = useCallback(async (method, params, commandContext = 'general') => {
    if (!verusPath && !method.startsWith('get-verus-path') && !method.startsWith('set-verus-path') && method !== 'select-verus-directory') {
        const errorMsg = 'Verus path not set. Please configure it first.';
        if(addTerminalEntry) addTerminalEntry({timestamp: new Date().toISOString(), method, params, result:null, error: errorMsg, context: commandContext});
        throw new Error(errorMsg);
    }
    if (!window.electron || !window.electron.ipcRenderer) {
        const errorMsg = 'Electron IPC not available. Cannot send RPC command.';
        console.error(errorMsg);
        // Optionally log to terminal if addTerminalEntry is robust enough for this case
        throw new Error(errorMsg);
    }

    setIsRpcLoading(true);
    const timestamp = new Date().toISOString();
    let result = null;
    let rpcError = null;
    try {
      result = await window.electron.ipcRenderer.invoke('sendRPCCommand', method, params);
      if (result && result.error) {
        rpcError = result.error;
        result = null; // Clear result if there's an RPC-level error reported in the result object
      }
    } catch (error) {
      // This catches errors in the IPC communication itself or if invoke throws
      console.error(`Error sending RPC command ${method} via IPC:`, error);
      rpcError = error.message || 'IPC communication error';
    } finally {
      setIsRpcLoading(false);
      if (addTerminalEntry) {
        addTerminalEntry({
          timestamp,
          method,
          params,
          result,
          error: rpcError,
          context: getCommandTypeForContext ? getCommandTypeForContext(method) : commandContext
        });
      }
    }
    if (rpcError) throw new Error(typeof rpcError === 'object' ? JSON.stringify(rpcError) : rpcError);
    return result;
  }, [verusPath, addTerminalEntry, getCommandTypeForContext]);

  return (
    <NodeContext.Provider value={{
      verusPath,
      setVerusPath,
      nodeStatus,
      loadingPath,
      loadingStatus,
      isRpcLoading,
      selectVerusDirectory,
      checkNodeConnection,
      fetchStoredPath,
      sendCommand
    }}>
      {children}
    </NodeContext.Provider>
  );
};