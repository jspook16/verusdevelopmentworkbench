import React, { createContext, useState, useCallback } from 'react';

export const OperationContext = createContext();

export const OperationProvider = ({ children }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedSubOperation, setSelectedSubOperation] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState('');
  const [operationResult, setOperationResult] = useState(null);

  // Define handler functions
  const handleOperationSelect = useCallback((operation) => {
    console.log('[OperationContext] handleOperationSelect:', operation);
    setSelectedOperation(operation);
    setSelectedSubOperation(null); // Reset sub-op when main op changes
    setOperationResult(null);    // Clear results/errors
    setOperationError('');
  }, []); // Empty dependency array as setters are stable

  const handleSubOperationSelect = useCallback((subOperation) => {
    console.log('[OperationContext] handleSubOperationSelect:', subOperation);
    setSelectedSubOperation(subOperation);
    setOperationResult(null);    // Clear results/errors
    setOperationError('');
  }, []); // Empty dependency array as setters are stable

  return (
    <OperationContext.Provider value={{
      selectedOperation, setSelectedOperation,
      selectedSubOperation, setSelectedSubOperation,
      operationLoading, setOperationLoading,
      operationError, setOperationError,
      operationResult, setOperationResult,
      handleOperationSelect,
      handleSubOperationSelect
    }}>
      {children}
    </OperationContext.Provider>
  );
}; 