import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vlotto-distribution-state';

export const useDistributionState = () => {
  // Initialize state from localStorage
  const [distributionState, setDistributionState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse distribution state from localStorage:', e);
    }
    // Default state
    return {
      // Revenue Distribution State
      nextJackpotValue: '',
      nextJackpotPercent: '',
      nextJackpotLocked: false,
      operationsValue: '',
      operationsPercent: '',
      operationsLocked: false,
      destination1Name: '',
      destination1Percent: '',
      destination1Locked: false,
      destination2Name: '',
      destination2Percent: '',
      destination2Locked: false,
      // Operations Distribution State
      destination3Name: '',
      destination3Percent: '',
      destination3Locked: false,
      destination4Name: '',
      destination4Percent: '',
      destination4Locked: false,
      destination5Name: '',
      destination5Percent: '',
      destination5Locked: false,
      destination6Name: '',
      destination6Percent: '',
      destination6Locked: false
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(distributionState));
    } catch (e) {
      console.error('Failed to save distribution state to localStorage:', e);
    }
  }, [distributionState]);

  const updateDistributionState = (key, value) => {
    setDistributionState(prev => ({ ...prev, [key]: value }));
  };

  return {
    // Revenue Distribution
    nextJackpotValue: distributionState.nextJackpotValue,
    setNextJackpotValue: (value) => updateDistributionState('nextJackpotValue', value),
    nextJackpotPercent: distributionState.nextJackpotPercent,
    setNextJackpotPercent: (value) => updateDistributionState('nextJackpotPercent', value),
    nextJackpotLocked: distributionState.nextJackpotLocked,
    setNextJackpotLocked: (value) => updateDistributionState('nextJackpotLocked', value),
    operationsValue: distributionState.operationsValue,
    setOperationsValue: (value) => updateDistributionState('operationsValue', value),
    operationsPercent: distributionState.operationsPercent,
    setOperationsPercent: (value) => updateDistributionState('operationsPercent', value),
    operationsLocked: distributionState.operationsLocked,
    setOperationsLocked: (value) => updateDistributionState('operationsLocked', value),
    destination1Name: distributionState.destination1Name,
    setDestination1Name: (value) => updateDistributionState('destination1Name', value),
    destination1Percent: distributionState.destination1Percent,
    setDestination1Percent: (value) => updateDistributionState('destination1Percent', value),
    destination1Locked: distributionState.destination1Locked,
    setDestination1Locked: (value) => updateDistributionState('destination1Locked', value),
    destination2Name: distributionState.destination2Name,
    setDestination2Name: (value) => updateDistributionState('destination2Name', value),
    destination2Percent: distributionState.destination2Percent,
    setDestination2Percent: (value) => updateDistributionState('destination2Percent', value),
    destination2Locked: distributionState.destination2Locked,
    setDestination2Locked: (value) => updateDistributionState('destination2Locked', value),

    // Operations Distribution
    destination3Name: distributionState.destination3Name,
    setDestination3Name: (value) => updateDistributionState('destination3Name', value),
    destination3Percent: distributionState.destination3Percent,
    setDestination3Percent: (value) => updateDistributionState('destination3Percent', value),
    destination3Locked: distributionState.destination3Locked,
    setDestination3Locked: (value) => updateDistributionState('destination3Locked', value),
    destination4Name: distributionState.destination4Name,
    setDestination4Name: (value) => updateDistributionState('destination4Name', value),
    destination4Percent: distributionState.destination4Percent,
    setDestination4Percent: (value) => updateDistributionState('destination4Percent', value),
    destination4Locked: distributionState.destination4Locked,
    setDestination4Locked: (value) => updateDistributionState('destination4Locked', value),
    destination5Name: distributionState.destination5Name,
    setDestination5Name: (value) => updateDistributionState('destination5Name', value),
    destination5Percent: distributionState.destination5Percent,
    setDestination5Percent: (value) => updateDistributionState('destination5Percent', value),
    destination5Locked: distributionState.destination5Locked,
    setDestination5Locked: (value) => updateDistributionState('destination5Locked', value),
    destination6Name: distributionState.destination6Name,
    setDestination6Name: (value) => updateDistributionState('destination6Name', value),
    destination6Percent: distributionState.destination6Percent,
    setDestination6Percent: (value) => updateDistributionState('destination6Percent', value),
    destination6Locked: distributionState.destination6Locked,
    setDestination6Locked: (value) => updateDistributionState('destination6Locked', value)
  };
}; 