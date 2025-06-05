import React, { createContext, useState, useCallback } from 'react';

export const TerminalContext = createContext();

// Helper function to categorize RPC commands (moved from old App.jsx)
// This function is pure and does not depend on component state or props,
// so it doesn't strictly need useCallback if defined outside and passed in,
// but wrapping it ensures stability if its definition were to change or move inside.
const baseGetCommandTypeForContext = (method) => {
  if (!method) return 'other';
  const identityCommands = [
    'registeridentity', 'registernamecommitment', 'updateidentity', 
    'recoveridentity', 'revokeidentity', 'setidentitytimelock', 'setidentitytrust'
  ];
  const cryptoCommands = [
    'signmessage', 'signfile', 'signdata', 'verifymessage', 
    'verifyfile', 'verifyhash', 'verifysignature'
  ];
  const queryCommands = [
    'getidentity', 'listidentities', 'getidentitieswithaddress',
    'getidentitieswithrecovery', 'getidentitieswithrevocation',
    'getidentitycontent', 'getidentityhistory', 'getidentitytrust' // getidentitytrust is a query here
  ];
  const vdxfCommands = ['getvdxfid', 'update-content-map', 'update-content-multimap']; // Added VDXF context

  if (identityCommands.includes(method.toLowerCase())) return 'identity';
  if (cryptoCommands.includes(method.toLowerCase())) return 'crypto';
  if (queryCommands.includes(method.toLowerCase())) return 'query';
  if (vdxfCommands.includes(method.toLowerCase())) return 'vdxf';
  return 'other'; // Default category
};

const MAX_TERMINAL_HISTORY_LENGTH = 50; // Define a maximum length for the history

export const TerminalProvider = ({ children }) => {
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [terminalFilter, setTerminalFilter] = useState('');

  const addTerminalEntry = useCallback((entry) => {
    setTerminalHistory(prev => {
      const newHistory = [...prev, entry];
      if (newHistory.length > MAX_TERMINAL_HISTORY_LENGTH) {
        // Keep only the latest MAX_TERMINAL_HISTORY_LENGTH entries
        return newHistory.slice(newHistory.length - MAX_TERMINAL_HISTORY_LENGTH);
      }
      return newHistory;
    });
  }, []);

  const clearTerminalHistory = useCallback(() => {
    setTerminalHistory([]);
  }, []);

  // Memoize getCommandTypeForContext
  const getCommandTypeForContext = useCallback(baseGetCommandTypeForContext, []);

  return (
    <TerminalContext.Provider value={{
      terminalHistory, terminalFilter, setTerminalFilter,
      addTerminalEntry, clearTerminalHistory,
      getCommandTypeForContext // Now a stable reference
    }}>
      {children}
    </TerminalContext.Provider>
  );
}; 