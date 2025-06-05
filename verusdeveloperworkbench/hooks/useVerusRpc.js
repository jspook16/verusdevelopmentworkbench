import { useContext, useCallback } from 'react';
import { electronService } from '../services/electronService';
import { TerminalContext } from '../contexts/TerminalContext';
import { OperationContext } from '../contexts/OperationContext';

export const useVerusRpc = () => {
  const { addTerminalEntry } = useContext(TerminalContext) || {};
  const { setOperationLoading, setOperationError, setOperationResult } = useContext(OperationContext) || {};

  const sendCommand = useCallback(async (method, params, context = 'common') => {
    if (!setOperationLoading || !setOperationError || !setOperationResult || !addTerminalEntry) {
      console.error('Missing context functions in useVerusRpc');
      throw new Error('RPC Context not fully available');
    }

    setOperationLoading(true);
    setOperationError('');
    setOperationResult(null);
    
    const timestamp = new Date().toISOString();

    try {
      const result = await electronService.sendRPCCommand(method, params);
      addTerminalEntry && addTerminalEntry({ timestamp, method, params, result, error: null, context });
      setOperationResult(result);
      return result;
    } catch (error) {
      console.error(`useVerusRpc: Error calling ${method}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addTerminalEntry && addTerminalEntry({ timestamp, method, params, result: null, error: errorMessage, context });
      setOperationError(errorMessage || 'RPC Error');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [addTerminalEntry, setOperationLoading, setOperationError, setOperationResult]);

  return { sendCommand };
}; 