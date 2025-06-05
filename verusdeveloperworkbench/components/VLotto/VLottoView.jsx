import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { NodeContext } from '../../contexts/NodeContext';
import { STORAGE_KEYS, VDXF_KEYS, DEFAULT_CONFIG, ANIMATION_CONFIG } from './utils/constants';
import { getParentName } from './utils/ticketHelpers';
import { useUtilityIds } from './hooks/useUtilityIds';
import { useTicketGeneration } from './hooks/useTicketGeneration';
import { useAdvancedDrawingSystem } from './hooks/useAdvancedDrawingSystem';
import { useTicketVerification } from './hooks/useTicketVerification';
import { useVLottoAutomation, AUTOMATION_PHASES as VLottoAutomationPhases } from './hooks/useVLottoAutomation';

// Import state management hooks
import { useUIState } from './hooks/useUIState';
import { useLockStates } from './hooks/useLockStates';
import { useDistributionState } from './hooks/useDistributionState';
import { useLotteryParameters } from './hooks/useLotteryParameters';
import { useCurrencyDetails } from './hooks/useCurrencyDetails';

// Import extracted components
import DetailedTicketItem from './components/tickets/DetailedTicketItem';
import MinimalTicketItem from './components/tickets/MinimalTicketItem';
import TicketTableView from './components/tickets/TicketTableView';
import LockableTextField from './components/forms/LockableTextField';
import StatusIndicator from './components/shared/StatusIndicator';
import UtilityIdCard from './components/shared/UtilityIdCard';
import ParameterValidationStatus from './components/shared/ParameterValidationStatus';
import LotteryParametersSection from './sections/LotteryParametersSection';
import UtilitiesSection from './sections/UtilitiesSection';
import RevealingWinningHashSection from './sections/RevealingWinningHashSection';
import AutomationProgressSection from './sections/AutomationProgressSection';
import LotteryDrawingSystemSection from './sections/LotteryDrawingSystemSection';
import TicketVerificationSection from './sections/TicketVerificationSection';
import AutomationStatusSection from './sections/AutomationStatusSection';
import VLottoHeaderSection from './sections/VLottoHeaderSection';
import LoggingControlsSection from './sections/LoggingControlsSection';

function VLottoView() {
  const { sendCommand } = useContext(NodeContext);

  // Initialize all hooks in correct order
  const utilityIds = useUtilityIds(sendCommand);
  const drawingSystem = useAdvancedDrawingSystem(sendCommand);
  const ticketVerification = useTicketVerification(sendCommand);
  
  // Declare closeOffersBeforeDrawing state BEFORE using it in vlottoAutomation
  const [closeOffersBeforeDrawing, setCloseOffersBeforeDrawing] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.closeOffersBeforeDrawing || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  // Declare rAddressForTickets BEFORE using it in ticketGeneration
  const [rAddressForTickets, setRAddressForTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.rAddressForTickets || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });
  
  // Initialize automation hook without ticketGen/drawingSys initially
  const vlottoAutomation = useVLottoAutomation(sendCommand, {
    closeOffersBeforeDrawing: parseInt(closeOffersBeforeDrawing) || 5
  });
  
  // Pass the reportPhaseUpdate from vlottoAutomation to ticketGeneration
  const ticketGeneration = useTicketGeneration(sendCommand, vlottoAutomation.reportPhaseUpdate, rAddressForTickets);
  
  // Set dependencies for vlottoAutomation hook after all hooks are initialized
  const [hooksReady, setHooksReady] = useState(false);
  useEffect(() => {
    console.log('VLottoView: Setting dependencies for vlottoAutomation hook');
    if (vlottoAutomation && ticketGeneration && drawingSystem && vlottoAutomation.setTicketGenerationHook && vlottoAutomation.setDrawingSystemHook) {
      console.log('VLottoView: Calling setTicketGenerationHook and setDrawingSystemHook...');
      vlottoAutomation.setTicketGenerationHook(ticketGeneration);
      vlottoAutomation.setDrawingSystemHook(drawingSystem);
      setHooksReady(true); // Signal that hooks are ready
      console.log('VLottoView: Dependencies for vlottoAutomation set and hooksReady=true');
    } else {
      console.warn('VLottoView: Could not set dependencies for vlottoAutomation - one or more hooks or setters missing');
      setHooksReady(false);
    }
  }, [vlottoAutomation, ticketGeneration, drawingSystem]); 

  // Debug object identity
  console.log('VLottoView: sendCommand identity:', sendCommand);
  console.log('VLottoView: drawingSystem identity:', drawingSystem);
  
  // Add debugging to track hook recreation
  console.log('VLottoView: Initializing vlottoAutomation hook...');
  console.log('VLottoView: vlottoAutomation hook initialized:', !!vlottoAutomation);
  
  console.log('VLottoView: Initializing ticketGeneration hook...');
  console.log('VLottoView: ticketGeneration hook initialized:', !!ticketGeneration);
  
  // State for Main ID details
  const [mainIdDetails, setMainIdDetails] = useState(() => {
    // Try to migrate from old format if it exists in localStorage
    try {
      const saved = localStorage.getItem('vlotto-mainIdDetails'); // Check if there's saved data
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
          // Save migrated data back
          localStorage.setItem('vlotto-mainIdDetails', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse mainIdDetails from localStorage", e);
      return null;
    }
  });
  const [isRefreshingMainId, setIsRefreshingMainId] = useState(false);
  const [mainIdError, setMainIdError] = useState(null);

  // State for Basket Currency details
  const [basketCurrencyDetails, setBasketCurrencyDetails] = useState(null);
  const [isRefreshingBasketCurrency, setIsRefreshingBasketCurrency] = useState(false);
  const [basketCurrencyError, setBasketCurrencyError] = useState(null);

  // State for accordions
  // (Now handled by useUIState hook)

  // State for Main Lottery ID lock
  // (Now handled by useLockStates hook)

  // State for other Lottery Parameter locks
  // (Now handled by useLockStates hook)

  // State for lottery status indicator
  const [lotteryStatus, setLotteryStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-lottery-status');
      return saved ? JSON.parse(saved) : 'closed';
    } catch (e) {
      console.error('Failed to parse lottery status from localStorage:', e);
      return 'closed';
    }
  });

  // Save lottery status to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vlotto-lottery-status', JSON.stringify(lotteryStatus));
    } catch (e) {
      console.error('Failed to save lottery status to localStorage:', e);
    }
  }, [lotteryStatus]);

  // Determine lottery status based on automation phases and ticket state
  const determineLotteryStatus = () => {
    // If tickets are generated and automation is running, and tickets haven't been revoked yet
    if (ticketGeneration.tickets.length > 0 && 
        vlottoAutomation.isAutomationRunning && 
        !vlottoAutomation.automationPhase?.includes('REVOKE') &&
        !vlottoAutomation.automationPhase?.includes('DRAWING')) {
      return 'live';
    }
    
    // If tickets have been revoked or we're in drawing phase, or no automation running
    if (ticketGeneration.revokedTickets.length > 0 || 
        vlottoAutomation.automationPhase?.includes('REVOKE') ||
        vlottoAutomation.automationPhase?.includes('DRAWING') ||
        !vlottoAutomation.isAutomationRunning) {
      return 'closed';
    }
    
    return 'closed'; // Default to closed
  };

  // Update lottery status based on automation state
  useEffect(() => {
    const newStatus = determineLotteryStatus();
    setLotteryStatus(newStatus);
  }, [
    vlottoAutomation.isAutomationRunning, 
    vlottoAutomation.automationPhase, 
    ticketGeneration.tickets.length, 
    ticketGeneration.revokedTickets.length
  ]);

  // Initialize custom state hooks
  const uiState = useUIState();
  const lockStates = useLockStates();
  const distributionState = useDistributionState();
  const currencyDetails = useCurrencyDetails(sendCommand, ticketGeneration.mainVerusId);

  // Add missing lottery parameter state that LotteryParametersSection expects
  const [drawingInterval, setDrawingInterval] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.drawingInterval || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  const [gracePeriod, setGracePeriod] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.gracePeriod || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  const [confirmations, setConfirmations] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.confirmations || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  const [jackpotMinimum, setJackpotMinimum] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.jackpotMinimum || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  const [jackpotCeilingCap, setJackpotCeilingCap] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.jackpotCeilingCap || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  // Lock-based persistence - save parameters only when they are locked
  useEffect(() => {
    if (lockStates.drawingIntervalLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.drawingInterval = drawingInterval;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked drawing interval:', e);
      }
    }
  }, [lockStates.drawingIntervalLocked, drawingInterval]);

  useEffect(() => {
    if (lockStates.gracePeriodLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.gracePeriod = gracePeriod;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked grace period:', e);
      }
    }
  }, [lockStates.gracePeriodLocked, gracePeriod]);

  useEffect(() => {
    if (lockStates.confirmationsLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.confirmations = confirmations;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked confirmations:', e);
      }
    }
  }, [lockStates.confirmationsLocked, confirmations]);

  useEffect(() => {
    if (lockStates.jackpotMinimumLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.jackpotMinimum = jackpotMinimum;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked jackpot minimum:', e);
      }
    }
  }, [lockStates.jackpotMinimumLocked, jackpotMinimum]);

  useEffect(() => {
    if (lockStates.jackpotCeilingCapLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.jackpotCeilingCap = jackpotCeilingCap;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked jackpot ceiling cap:', e);
      }
    }
  }, [lockStates.jackpotCeilingCapLocked, jackpotCeilingCap]);

  useEffect(() => {
    if (lockStates.closeOffersBeforeDrawingLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.closeOffersBeforeDrawing = closeOffersBeforeDrawing;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked close offers before drawing:', e);
      }
    }
  }, [lockStates.closeOffersBeforeDrawingLocked, closeOffersBeforeDrawing]);

  useEffect(() => {
    if (lockStates.rAddressForTicketsLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.rAddressForTickets = rAddressForTickets;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked R-address for tickets:', e);
      }
    }
  }, [lockStates.rAddressForTicketsLocked, rAddressForTickets]);

  // Lock-based persistence for Main Lottery ID
  useEffect(() => {
    if (lockStates.mainLotteryIdLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.mainVerusId = ticketGeneration.mainVerusId;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked main lottery ID:', e);
      }
    }
  }, [lockStates.mainLotteryIdLocked, ticketGeneration.mainVerusId]);

  // Lock-based persistence for Target Drawing Block
  useEffect(() => {
    if (lockStates.lotteryStartBlockLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.futureBlockNumber = ticketGeneration.futureBlockNumber;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked target drawing block:', e);
      }
    }
  }, [lockStates.lotteryStartBlockLocked, ticketGeneration.futureBlockNumber]);

  // Lock-based persistence for Ticket Multiplier
  useEffect(() => {
    if (lockStates.ticketMultiplierLocked) {
      try {
        const saved = localStorage.getItem('vlotto-locked-params') || '{}';
        const lockedParams = JSON.parse(saved);
        lockedParams.ticketMultiplier = ticketGeneration.ticketMultiplier;
        localStorage.setItem('vlotto-locked-params', JSON.stringify(lockedParams));
      } catch (e) {
        console.error('Failed to save locked ticket multiplier:', e);
      }
    }
  }, [lockStates.ticketMultiplierLocked, ticketGeneration.ticketMultiplier]);

  // State for tracking parameter initialization
  const [parametersLoaded, setParametersLoaded] = useState(false);

  // Restore locked parameters on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        
        // Restore locked Main Lottery ID
        if (lockStates.mainLotteryIdLocked && lockedParams.mainVerusId) {
          ticketGeneration.setMainVerusId(lockedParams.mainVerusId);
        }
        
        // Restore locked Target Drawing Block
        if (lockStates.lotteryStartBlockLocked && lockedParams.futureBlockNumber) {
          ticketGeneration.setFutureBlockNumber(lockedParams.futureBlockNumber);
        }
        
        // Restore locked Ticket Multiplier
        if (lockStates.ticketMultiplierLocked && lockedParams.ticketMultiplier) {
          ticketGeneration.setTicketMultiplier(lockedParams.ticketMultiplier);
        }
      }
      
      // Mark parameters as loaded after restoration attempt
      setParametersLoaded(true);
      console.log('VLottoView: Locked parameters restored and marked as loaded');
      
    } catch (e) {
      console.error('Failed to restore locked parameters:', e);
      setParametersLoaded(true); // Still mark as loaded to prevent indefinite blocking
    }
  }, [lockStates.mainLotteryIdLocked, lockStates.lotteryStartBlockLocked, lockStates.ticketMultiplierLocked, ticketGeneration]);

  // CONSOLIDATED: Use currencyDetails hook instead of duplicate implementation
  // Remove duplicate fetching - useCurrencyDetails already handles this
  useEffect(() => {
    // Just sync the state from currencyDetails hook to avoid duplication
    if (currencyDetails.mainIdDetails) {
      setMainIdDetails(currencyDetails.mainIdDetails);
      setMainIdError(currencyDetails.mainIdError);
      setIsRefreshingMainId(currencyDetails.isRefreshingMainId);
    } else if (currencyDetails.mainIdError) {
      setMainIdDetails(null);
      setMainIdError(currencyDetails.mainIdError);
      setIsRefreshingMainId(false);
    }
  }, [currencyDetails.mainIdDetails, currencyDetails.mainIdError, currencyDetails.isRefreshingMainId]);

  // CONSOLIDATED: Use currencyDetails hook for basket currency too - avoid duplicate getcurrency calls
  // Sync basket currency state from currencyDetails hook
  useEffect(() => {
    if (currencyDetails.basketCurrencyDetails) {
      setBasketCurrencyDetails(currencyDetails.basketCurrencyDetails);
      setBasketCurrencyError(currencyDetails.basketCurrencyError);
      setIsRefreshingBasketCurrency(currencyDetails.isRefreshingBasketCurrency);
    } else if (currencyDetails.basketCurrencyError) {
      setBasketCurrencyDetails(null);
      setBasketCurrencyError(currencyDetails.basketCurrencyError);
      setIsRefreshingBasketCurrency(false);
    }
  }, [currencyDetails.basketCurrencyDetails, currencyDetails.basketCurrencyError, currencyDetails.isRefreshingBasketCurrency]);

  // REMOVED: All duplicate basket currency functions - now using currencyDetails hook to avoid duplicate getcurrency calls

  // Handle ticket generation with proofguard ID
  const handleGenerateTickets = async () => {
    try {
      console.log('VLottoView: Starting ticket generation');
      console.log('VLottoView: vlottoAutomation available?', !!vlottoAutomation);
      console.log('VLottoView: vlottoAutomation.startFullAutomation available?', !!vlottoAutomation?.startFullAutomation);
      console.log('VLottoView: Future block:', ticketGeneration.futureBlockNumber);
      
      if (ticketGeneration.futureBlockNumber && vlottoAutomation && vlottoAutomation.startFullAutomation && VLottoAutomationPhases) {
        console.log('VLottoView: Calling startFullAutomation...');
        await vlottoAutomation.startFullAutomation(ticketGeneration.futureBlockNumber);
        console.log('VLottoView: startFullAutomation completed (this triggers ticket gen in automation hook)');
      } else {
        let errorMsg = 'Cannot start automation: ';
        if (!ticketGeneration.futureBlockNumber) errorMsg += 'Future block number missing. ';
        if (!vlottoAutomation) errorMsg += 'Automation hook not available. ';
        if (vlottoAutomation && !vlottoAutomation.startFullAutomation) errorMsg += 'startFullAutomation function missing on automation hook. ';
        if (vlottoAutomation && !VLottoAutomationPhases) errorMsg += 'AUTOMATION_PHASES missing on automation hook. ';
        console.error(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('VLottoView: Error in handleGenerateTickets:', error);
      alert(error.message);
      if (vlottoAutomation) vlottoAutomation.stopFullAutomation();
    }
  };

  // Handle drawing
  const handlePerformDrawing = async () => {
    try {
      // Use the advanced drawing system which performs comprehensive blockchain verification with live updates
      await drawingSystem.performDrawing(ticketGeneration.tickets, ticketGeneration.revokedTickets);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle ticket verification
  const handleVerifyTicket = async () => {
    try {
      await ticketVerification.verifyTicket();
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle clear ticket data
  const handleClearTicketData = () => {
    ticketGeneration.clearTicketData();
    drawingSystem.clearDrawingResults(); // Only clear the basic system - this is what RevealingWinningHashSection watches
    vlottoAutomation.resetFullAutomation();
    alert('All generated ticket data, drawing results, and automation have been cleared.');
  };

  // Handle Start/Pause Lottery button
  const handleStartPauseLottery = async () => {
    try {
      if (vlottoAutomation.isAutomationRunning && !vlottoAutomation.isAutomationPaused) {
        // Pause the automation
        vlottoAutomation.pauseAutomation();
      } else if (vlottoAutomation.isAutomationPaused) {
        // Resume the automation
        vlottoAutomation.resumeAutomation();
      } else {
        // Start the automation
        if (!parametersLoaded) {
          alert('Please wait for parameters to finish loading before starting automation.');
          return;
        }
        
        if (!ticketGeneration.futureBlockNumber) {
          alert('Please set the Target Drawing Block first.');
          return;
        }
        if (!ticketGeneration.mainVerusId) {
          alert('Please set the Main Lottery ID first.');
          return;
        }
        
        console.log('VLottoView: Starting automation with loaded parameters:', {
          mainVerusId: ticketGeneration.mainVerusId,
          ticketMultiplier: ticketGeneration.ticketMultiplier,
          futureBlockNumber: ticketGeneration.futureBlockNumber,
          parametersLoaded: parametersLoaded
        });
        
        // Note: Ticket quantity calculation will happen during automation after jackpot is timelocked
        // We don't try to calculate it here since the jackpot needs to be secured first
        console.log('Starting VLotto automation - ticket quantity will be calculated after jackpot timelock');
        
        await vlottoAutomation.startFullAutomation(ticketGeneration.futureBlockNumber);
      }
    } catch (error) {
      console.error('Error in Start/Pause Lottery:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle Stop Lottery button (completely stops and resets)
  const handleStopLottery = async () => {
    try {
      // Stop and reset the automation completely
      vlottoAutomation.resetFullAutomation();
    } catch (error) {
      console.error('Error in Stop Lottery:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle Reset Lottery button (resets state and clears ticket data)
  const handleResetLottery = async () => {
    try {
      console.log('VLottoView: Reset Lottery button clicked');
      
      // Force clear all persistent state first (handles stuck confirmations)
      vlottoAutomation.clearPersistentState();
      
      // Clear ticket data from ticket generation
      ticketGeneration.clearTicketData();
      
      // Clear drawing results
      drawingSystem.clearDrawingResults();
      
      // Reset automation state completely
      vlottoAutomation.resetFullAutomation();
      
      // Clear any stuck transaction confirmations by clearing all storage
      localStorage.removeItem('vlotto-automation-state');
      localStorage.removeItem('vlotto-stuck-transactions');
      
      alert('✅ Reset Complete: All lottery state and ticket data have been cleared.');
      console.log('VLottoView: Reset lottery completed successfully');
      
    } catch (error) {
      console.error('Error in Reset Lottery:', error);
      alert(`Reset Error: ${error.message}`);
    }
  };

  // Set the hook references for automation after they're initialized AND parameters are loaded
  useEffect(() => {
    if (ticketGeneration && vlottoAutomation && parametersLoaded) {
      console.log('VLottoView: Setting automation hook references...');
      console.log('VLottoView: Parameters loaded:', parametersLoaded);
      console.log('VLottoView: Current mainVerusId:', ticketGeneration.mainVerusId);
      console.log('VLottoView: Current ticketMultiplier:', ticketGeneration.ticketMultiplier);
      
      vlottoAutomation.setTicketGenerationHook(ticketGeneration);
      vlottoAutomation.setDrawingSystemHook(drawingSystem); // Use basic drawing system - same as manual
      console.log('VLottoView: Automation hook references set with loaded parameters.');
    } else {
      console.log('VLottoView: Waiting for initialization...', {
        ticketGeneration: !!ticketGeneration,
        vlottoAutomation: !!vlottoAutomation,
        parametersLoaded: parametersLoaded
      });
    }
  }, [ticketGeneration, vlottoAutomation, drawingSystem, parametersLoaded]);

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes glow {
            0% { box-shadow: 0 0 5px #4caf50, 0 0 10px #4caf50, 0 0 15px #4caf50; }
            50% { box-shadow: 0 0 10px #4caf50, 0 0 20px #4caf50, 0 0 30px #4caf50; }
            100% { box-shadow: 0 0 5px #4caf50, 0 0 10px #4caf50, 0 0 15px #4caf50; }
          }
          .spinning {
            animation: spin 1s linear infinite;
          }
          .glowing {
            animation: glow 2s ease-in-out infinite;
          }
        `}
      </style>
      
      <VLottoHeaderSection 
        lotteryStatus={lotteryStatus} 
        vlottoAutomation={vlottoAutomation}
        ticketGeneration={ticketGeneration}
        onStartPauseLottery={handleStartPauseLottery}
        onResetLottery={handleResetLottery}
        onStopLottery={handleStopLottery}
        parametersLoaded={parametersLoaded}
      />
      
      {/* Parameter Validation Status */}
      <ParameterValidationStatus
        parameters={vlottoAutomation.getLockedParameters()}
        ParameterValidator={vlottoAutomation.ParameterValidator}
        expanded={uiState.parameterValidationExpanded}
        onToggleExpanded={() => uiState.setParameterValidationExpanded(!uiState.parameterValidationExpanded)}
      />
      
      {/* Automation Status Display */}
      <AutomationStatusSection
        vlottoAutomation={vlottoAutomation}
        ticketGeneration={ticketGeneration}
        utilityIds={utilityIds}
        drawingSystem={drawingSystem}
      />

      {/* Lottery Parameters Section */}
      <LotteryParametersSection
        expanded={uiState.lotteryParametersExpanded}
        onToggleExpanded={() => uiState.setLotteryParametersExpanded(!uiState.lotteryParametersExpanded)}
        ticketGeneration={ticketGeneration}
        
        // Main parameters
        mainLotteryIdLocked={lockStates.mainLotteryIdLocked}
        setMainLotteryIdLocked={lockStates.setMainLotteryIdLocked}
        lotteryStartBlockLocked={lockStates.lotteryStartBlockLocked}
        setLotteryStartBlockLocked={lockStates.setLotteryStartBlockLocked}
        ticketMultiplierLocked={lockStates.ticketMultiplierLocked}
        setTicketMultiplierLocked={lockStates.setTicketMultiplierLocked}
        drawingIntervalLocked={lockStates.drawingIntervalLocked}
        setDrawingIntervalLocked={lockStates.setDrawingIntervalLocked}
        jackpotMinimumLocked={lockStates.jackpotMinimumLocked}
        setJackpotMinimumLocked={lockStates.setJackpotMinimumLocked}
        jackpotCeilingCapLocked={lockStates.jackpotCeilingCapLocked}
        setJackpotCeilingCapLocked={lockStates.setJackpotCeilingCapLocked}
        
        // New automation parameters
        gracePeriodLocked={lockStates.gracePeriodLocked}
        setGracePeriodLocked={lockStates.setGracePeriodLocked}
        confirmationsLocked={lockStates.confirmationsLocked}
        setConfirmationsLocked={lockStates.setConfirmationsLocked}
        closeOffersBeforeDrawingLocked={lockStates.closeOffersBeforeDrawingLocked}
        setCloseOffersBeforeDrawingLocked={lockStates.setCloseOffersBeforeDrawingLocked}
        
        // Parameter values that were missing
        drawingInterval={drawingInterval}
        setDrawingInterval={setDrawingInterval}
        gracePeriod={gracePeriod}
        setGracePeriod={setGracePeriod}
        confirmations={confirmations}
        setConfirmations={setConfirmations}
        jackpotMinimum={jackpotMinimum}
        setJackpotMinimum={setJackpotMinimum}
        jackpotCeilingCap={jackpotCeilingCap}
        setJackpotCeilingCap={setJackpotCeilingCap}
        closeOffersBeforeDrawing={closeOffersBeforeDrawing}
        setCloseOffersBeforeDrawing={setCloseOffersBeforeDrawing}
        
        // R-Address for Tickets parameter
        rAddressForTickets={rAddressForTickets}
        setRAddressForTickets={setRAddressForTickets}
        rAddressForTicketsLocked={lockStates.rAddressForTicketsLocked}
        setRAddressForTicketsLocked={lockStates.setRAddressForTicketsLocked}
        
        // Revenue distribution
        nextJackpotValue={distributionState.nextJackpotValue}
        setNextJackpotValue={distributionState.setNextJackpotValue}
        nextJackpotPercent={distributionState.nextJackpotPercent}
        setNextJackpotPercent={distributionState.setNextJackpotPercent}
        nextJackpotLocked={distributionState.nextJackpotLocked}
        setNextJackpotLocked={distributionState.setNextJackpotLocked}
        operationsValue={distributionState.operationsValue}
        setOperationsValue={distributionState.setOperationsValue}
        operationsPercent={distributionState.operationsPercent}
        setOperationsPercent={distributionState.setOperationsPercent}
        operationsLocked={distributionState.operationsLocked}
        setOperationsLocked={distributionState.setOperationsLocked}
        destination1Name={distributionState.destination1Name}
        setDestination1Name={distributionState.setDestination1Name}
        destination1Percent={distributionState.destination1Percent}
        setDestination1Percent={distributionState.setDestination1Percent}
        destination1Locked={distributionState.destination1Locked}
        setDestination1Locked={distributionState.setDestination1Locked}
        destination2Name={distributionState.destination2Name}
        setDestination2Name={distributionState.setDestination2Name}
        destination2Percent={distributionState.destination2Percent}
        setDestination2Percent={distributionState.setDestination2Percent}
        destination2Locked={distributionState.destination2Locked}
        setDestination2Locked={distributionState.setDestination2Locked}
        
        // Operations distribution
        destination3Name={distributionState.destination3Name}
        setDestination3Name={distributionState.setDestination3Name}
        destination3Percent={distributionState.destination3Percent}
        setDestination3Percent={distributionState.setDestination3Percent}
        destination3Locked={distributionState.destination3Locked}
        setDestination3Locked={distributionState.setDestination3Locked}
        destination4Name={distributionState.destination4Name}
        setDestination4Name={distributionState.setDestination4Name}
        destination4Percent={distributionState.destination4Percent}
        setDestination4Percent={distributionState.setDestination4Percent}
        destination4Locked={distributionState.destination4Locked}
        setDestination4Locked={distributionState.setDestination4Locked}
        destination5Name={distributionState.destination5Name}
        setDestination5Name={distributionState.setDestination5Name}
        destination5Percent={distributionState.destination5Percent}
        setDestination5Percent={distributionState.setDestination5Percent}
        destination5Locked={distributionState.destination5Locked}
        setDestination5Locked={distributionState.setDestination5Locked}
        destination6Name={distributionState.destination6Name}
        setDestination6Name={distributionState.setDestination6Name}
        destination6Percent={distributionState.destination6Percent}
        setDestination6Percent={distributionState.setDestination6Percent}
        destination6Locked={distributionState.destination6Locked}
        setDestination6Locked={distributionState.setDestination6Locked}
      />

      {/* Utilities Section */}
      <UtilitiesSection
        expanded={uiState.utilitiesExpanded}
        onToggleExpanded={() => uiState.setUtilitiesExpanded(!uiState.utilitiesExpanded)}
        mainVerusId={ticketGeneration.mainVerusId}
        basketCurrencyDetails={currencyDetails.basketCurrencyDetails}
        isRefreshingBasketCurrency={currencyDetails.isRefreshingBasketCurrency}
        basketCurrencyError={currencyDetails.basketCurrencyError}
        refreshBasketCurrency={currencyDetails.refreshBasketCurrency}
        mainIdDetails={currencyDetails.mainIdDetails}
        isRefreshingMainId={currencyDetails.isRefreshingMainId}
        mainIdError={currencyDetails.mainIdError}
        refreshMainIdBalance={currencyDetails.refreshMainIdBalance}
        utilityIds={utilityIds}
        VDXF_KEYS={VDXF_KEYS}
      />

      {/* Drawing System (Hash Input) */}
      <Box mb={3}>
        <LotteryDrawingSystemSection 
          ticketGeneration={ticketGeneration}
          drawingSystem={drawingSystem} // Use basic drawing system for manual controls
          lotteryDrawingSystemExpanded={uiState.lotteryDrawingSystemExpanded}
          setLotteryDrawingSystemExpanded={uiState.setLotteryDrawingSystemExpanded}
          handleGenerateTickets={handleGenerateTickets}
          handlePerformDrawing={handlePerformDrawing}
          handleClearTicketData={handleClearTicketData}
          hooksReady={hooksReady}
        />
      </Box>

      {/* Revealing Winning Hash with Animation */}
      <Box mb={3}>
        <RevealingWinningHashSection 
          drawingSystem={drawingSystem} // Restore to basic drawing system - this has all the advanced features
          ticketGeneration={ticketGeneration}
          sendCommand={sendCommand}
        />
      </Box>

      {/* Drawing Results Progress Section */}
      <Box mb={3}>
        <AutomationProgressSection 
          ticketGeneration={ticketGeneration}
          drawingSystem={drawingSystem} // Restore to basic drawing system
          onClearTicketData={() => {
            ticketGeneration.clearTicketData();
            drawingSystem.clearDrawingResults(); // Only clear the basic system
          }}
        />
      </Box>

      {/* Ticket Verification System */}
      <TicketVerificationSection
        ticketVerification={ticketVerification}
        handleVerifyTicket={handleVerifyTicket}
      />

      {/* Logging Controls - Always visible for monitoring */}
      <LoggingControlsSection
        expanded={uiState.loggingControlsExpanded}
        onToggleExpanded={() => uiState.setLoggingControlsExpanded(!uiState.loggingControlsExpanded)}
      />
    </Box>
  );
}

export default VLottoView; 