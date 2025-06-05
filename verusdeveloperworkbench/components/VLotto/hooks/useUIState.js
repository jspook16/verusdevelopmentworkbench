import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vlotto-ui-state';

export const useUIState = () => {
  // Initialize state from localStorage
  const [uiState, setUiState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse UI state from localStorage:', e);
    }
    // Default state
    return {
      utilitiesExpanded: true,
      lotteryParametersExpanded: true,
      lotteryDrawingSystemExpanded: true,
      automationProgressExpanded: true,
      loggingControlsExpanded: false,
      parameterValidationExpanded: false
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uiState));
    } catch (e) {
      console.error('Failed to save UI state to localStorage:', e);
    }
  }, [uiState]);

  const updateState = (key, value) => {
    setUiState(prev => ({ ...prev, [key]: value }));
  };

  return {
    utilitiesExpanded: uiState.utilitiesExpanded,
    setUtilitiesExpanded: (value) => updateState('utilitiesExpanded', value),
    lotteryParametersExpanded: uiState.lotteryParametersExpanded,
    setLotteryParametersExpanded: (value) => updateState('lotteryParametersExpanded', value),
    lotteryDrawingSystemExpanded: uiState.lotteryDrawingSystemExpanded,
    setLotteryDrawingSystemExpanded: (value) => updateState('lotteryDrawingSystemExpanded', value),
    automationProgressExpanded: uiState.automationProgressExpanded,
    setAutomationProgressExpanded: (value) => updateState('automationProgressExpanded', value),
    loggingControlsExpanded: uiState.loggingControlsExpanded,
    setLoggingControlsExpanded: (value) => updateState('loggingControlsExpanded', value),
    parameterValidationExpanded: uiState.parameterValidationExpanded,
    setParameterValidationExpanded: (value) => updateState('parameterValidationExpanded', value)
  };
}; 