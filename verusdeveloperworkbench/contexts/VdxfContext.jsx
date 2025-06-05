import React, { createContext, useState } from 'react';

export const VdxfContext = createContext();

export const VdxfProvider = ({ children }) => {
  const [vdxfKeys, setVdxfKeys] = useState([]);
  // Add more VDXF related state here e.g., for contentmap editing

  // Placeholder actions
  const createVdxfKey = async (params) => console.log('createVdxfKey action', params);
  const updateContentMap = async (params) => console.log('updateContentMap action', params);

  return (
    <VdxfContext.Provider value={{ vdxfKeys, createVdxfKey, updateContentMap, setVdxfKeys }}>
      {children}
    </VdxfContext.Provider>
  );
}; 