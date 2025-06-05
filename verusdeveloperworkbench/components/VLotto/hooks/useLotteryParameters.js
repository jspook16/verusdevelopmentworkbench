import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vlotto-lottery-parameters-locked';

export const useLotteryParameters = () => {
  // Only store locked values - much simpler approach
  const [lockedValues, setLockedValues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse locked lottery parameters from localStorage:', e);
    }
    return {};
  });

  // Save locked values to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lockedValues));
    } catch (e) {
      console.error('Failed to save locked lottery parameters to localStorage:', e);
    }
  }, [lockedValues]);

  const saveLockedValue = (key, value) => {
    setLockedValues(prev => ({ ...prev, [key]: value }));
  };

  const getLockedValue = (key) => {
    return lockedValues[key];
  };

  const removeLockedValue = (key) => {
    setLockedValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  };

  return {
    saveLockedValue,
    getLockedValue,
    removeLockedValue,
    lockedValues
  };
}; 