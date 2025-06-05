import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export const CurrencyDefinitionContext = createContext();

export const CurrencyDefinitionProvider = ({ children }) => {
  const [currencyDefinition, setCurrencyDefinition] = useState({});
  
  const updateCurrencyDefinition = useCallback((newDefinition) => {
    setCurrencyDefinition(newDefinition);
  }, []); // Empty dependency array means this function instance is stable

  const contextValue = useMemo(() => ({
    currencyDefinition,
    updateCurrencyDefinition
  }), [currencyDefinition, updateCurrencyDefinition]);

  return (
    <CurrencyDefinitionContext.Provider value={contextValue}>
      {children}
    </CurrencyDefinitionContext.Provider>
  );
};

export const useCurrencyDefinition = () => useContext(CurrencyDefinitionContext); 