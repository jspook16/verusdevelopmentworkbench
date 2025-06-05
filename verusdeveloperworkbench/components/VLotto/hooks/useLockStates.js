import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vlotto-lock-states';

export const useLockStates = () => {
  // Initialize state from localStorage
  const [lockState, setLockState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse lock states from localStorage:', e);
    }
    // Default state
    return {
      mainLotteryIdLocked: false,
      lotteryStartBlockLocked: false,
      ticketMultiplierLocked: false,
      drawingIntervalLocked: false,
      jackpotMinimumLocked: false,
      jackpotCeilingCapLocked: false,
      gracePeriodLocked: false,
      confirmationsLocked: false,
      closeOffersBeforeDrawingLocked: false,
      rAddressForTicketsLocked: false
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lockState));
    } catch (e) {
      console.error('Failed to save lock states to localStorage:', e);
    }
  }, [lockState]);

  const updateLockState = (key, value) => {
    setLockState(prev => ({ ...prev, [key]: value }));
  };

  return {
    mainLotteryIdLocked: lockState.mainLotteryIdLocked,
    setMainLotteryIdLocked: (value) => updateLockState('mainLotteryIdLocked', value),
    lotteryStartBlockLocked: lockState.lotteryStartBlockLocked,
    setLotteryStartBlockLocked: (value) => updateLockState('lotteryStartBlockLocked', value),
    ticketMultiplierLocked: lockState.ticketMultiplierLocked,
    setTicketMultiplierLocked: (value) => updateLockState('ticketMultiplierLocked', value),
    drawingIntervalLocked: lockState.drawingIntervalLocked,
    setDrawingIntervalLocked: (value) => updateLockState('drawingIntervalLocked', value),
    jackpotMinimumLocked: lockState.jackpotMinimumLocked,
    setJackpotMinimumLocked: (value) => updateLockState('jackpotMinimumLocked', value),
    jackpotCeilingCapLocked: lockState.jackpotCeilingCapLocked,
    setJackpotCeilingCapLocked: (value) => updateLockState('jackpotCeilingCapLocked', value),
    rAddressForTicketsLocked: lockState.rAddressForTicketsLocked,
    setRAddressForTicketsLocked: (value) => updateLockState('rAddressForTicketsLocked', value),
    gracePeriodLocked: lockState.gracePeriodLocked,
    setGracePeriodLocked: (value) => updateLockState('gracePeriodLocked', value),
    confirmationsLocked: lockState.confirmationsLocked,
    setConfirmationsLocked: (value) => updateLockState('confirmationsLocked', value),
    closeOffersBeforeDrawingLocked: lockState.closeOffersBeforeDrawingLocked,
    setCloseOffersBeforeDrawingLocked: (value) => updateLockState('closeOffersBeforeDrawingLocked', value)
  };
}; 