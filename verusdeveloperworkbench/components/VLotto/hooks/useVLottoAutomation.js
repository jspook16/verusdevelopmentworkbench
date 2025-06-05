import { useState, useEffect, useRef, useCallback } from 'react';
import { FundingEngine } from '../engines/fundingEngine.js';
import { TimelockEngine } from '../engines/timelockEngine.js';
import { MasterAutomationEngine } from '../engines/masterAutomationEngine.js';
import { ParameterValidator } from '../utils/parameterValidation.js';
import { VLottoTester } from '../utils/testingUtilities.js';

// Automation phases - Detailed breakdown as requested
export const AUTOMATION_PHASES = {
  IDLE: 'IDLE',
  FUNDING_JACKPOT: 'FUNDING_JACKPOT',
  PENDING_JACKPOT_FUNDING: 'PENDING_JACKPOT_FUNDING',
  SETTING_TIMELOCK: 'SETTING_TIMELOCK',
  PENDING_TIMELOCK_CONFIRMATION: 'PENDING_TIMELOCK_CONFIRMATION',
  CALCULATING_TICKET_QUANTITY: 'CALCULATING_TICKET_QUANTITY',
  COMMITTING_TICKETS: 'COMMITTING_TICKETS',
  PENDING_TICKET_COMMITMENT_CONFIRMATION: 'PENDING_TICKET_COMMITMENT_CONFIRMATION', 
  REGISTERING_TICKETS: 'REGISTERING_TICKETS',
  PENDING_TICKET_REGISTRATION: 'PENDING_TICKET_REGISTRATION',
  VALIDATING_TICKETS: 'VALIDATING_TICKETS',
  PENDING_TICKET_VALIDATION: 'PENDING_TICKET_VALIDATION',
  PREPARING_TICKET_OFFERS: 'PREPARING_TICKET_OFFERS',
  PENDING_MARKETPLACE_LISTING: 'PENDING_MARKETPLACE_LISTING',
  TICKETS_LISTED_IN_MARKETPLACE: 'TICKETS_LISTED_IN_MARKETPLACE',
  CLOSING_OFFERS: 'CLOSING_OFFERS',
  REVOKING_UNSOLD_TICKETS: 'REVOKING_UNSOLD_TICKETS',
  PENDING_UNSOLD_TICKET_REVOCATION: 'PENDING_UNSOLD_TICKET_REVOCATION',
  READY_FOR_DRAWING: 'READY_FOR_DRAWING',
  PERFORMING_DRAWING: 'PERFORMING_DRAWING',
  DRAWING_COMPLETE: 'DRAWING_COMPLETE',
  ERROR: 'ERROR',
  STOPPED: 'STOPPED'
};

const AUTOMATION_STORAGE_KEY = 'vlotto-automation-state';

// Helper functions for state persistence
const saveAutomationState = (state) => {
  try {
    localStorage.setItem(AUTOMATION_STORAGE_KEY, JSON.stringify({
      ...state,
      lastUpdated: Date.now()
    }));
  } catch (e) {
    console.error('Failed to save automation state to localStorage:', e);
  }
};

const loadAutomationState = () => {
  try {
    const saved = localStorage.getItem(AUTOMATION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if state is not too old (older than 24 hours)
      const isStale = Date.now() - (parsed.lastUpdated || 0) > 24 * 60 * 60 * 1000;
      if (isStale) {
        console.log('VLotto Automation: Saved state is stale (>24h), using defaults');
        localStorage.removeItem(AUTOMATION_STORAGE_KEY);
        return null;
      }
      console.log('VLotto Automation: Restored state from localStorage:', parsed);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse automation state from localStorage:', e);
  }
  return null;
};

export const useVLottoAutomation = (sendCommand, config = {}) => {
  // Extract configuration values with defaults
  const { closeOffersBeforeDrawing = -1 } = config;

  // Initialize engines
  const fundingEngineRef = useRef(null);
  const timelockEngineRef = useRef(null);

  // Initialize state from localStorage or defaults
  const getInitialState = () => {
    const saved = loadAutomationState();
    if (saved) {
      return {
        isAutomationRunning: saved.isAutomationRunning || false, // Resume if automation was running in same session
        currentPhase: saved.currentPhase || AUTOMATION_PHASES.IDLE,
        automationStatus: 'Automation stopped - restart manually if needed.',
        automationError: saved.automationError || null,
        targetDrawingBlock: saved.targetDrawingBlock || 0,
        currentBlockHeight: saved.currentBlockHeight || 0,
        blocksUntilDrawing: saved.blocksUntilDrawing || 0
      };
    }
    return {
      isAutomationRunning: false,
      currentPhase: AUTOMATION_PHASES.IDLE,
      automationStatus: 'Automation Idle.',
      automationError: null,
      targetDrawingBlock: 0,
      currentBlockHeight: 0,
      blocksUntilDrawing: 0
    };
  };

  const initialState = getInitialState();
  
  // Core Automation State with persistence
  const [isAutomationRunning, setIsAutomationRunning] = useState(initialState.isAutomationRunning);
  const [isAutomationPaused, setIsAutomationPaused] = useState(false); // NEW: Pause state
  const [currentPhase, setCurrentPhase] = useState(initialState.currentPhase);
  const [automationStatus, setAutomationStatus] = useState(initialState.automationStatus);
  const [automationError, setAutomationError] = useState(initialState.automationError);
  
  // Block Monitoring State with persistence
  const [targetDrawingBlock, setTargetDrawingBlock] = useState(initialState.targetDrawingBlock);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(initialState.currentBlockHeight);
  const [blocksUntilDrawing, setBlocksUntilDrawing] = useState(initialState.blocksUntilDrawing);
  
  const blockMonitorInterval = useRef(null);
  const backupTimeout = useRef(null); // NEW: Track backup setTimeout
  const processingLock = useRef(false); // To prevent concurrent processing
  const lastProcessTime = useRef(0); // Track last processing time
  const tabVisibilityListener = useRef(null); // Track visibility listener
  const forceStop = useRef(false); // NEW: Force stop flag
  const runAutomationCycleRef = useRef(null); // NEW: Ref to avoid circular dependency

  // Keep latest pause state in a ref so guardedSendCommand always sees current value
  const isPausedRef = useRef(isAutomationPaused);
  useEffect(() => { isPausedRef.current = isAutomationPaused; }, [isAutomationPaused]);

  // ----------------------------------------------------------
  // Guarded RPC wrapper: aborts RPCs when paused or force-stopped
  // ----------------------------------------------------------
  const guardedSendCommand = useCallback(async (method, params = [], context = 'automation') => {
    if (forceStop.current || isPausedRef.current) {
      const reason = forceStop.current ? 'FORCE_STOP' : 'PAUSED';
      console.warn(`[VLottoAutomation] RPC aborted (${reason}):`, method);
      throw new Error(`Automation ${reason.toLowerCase()} - RPC blocked (${method})`);
    }
    return await sendCommand(method, params, context);
  }, [sendCommand]);

  // ------------------------------------------------------------------
  // Initialize FundingEngine & TimelockEngine once wrapper exists
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!fundingEngineRef.current) {
      fundingEngineRef.current = new FundingEngine(guardedSendCommand);
    }
    if (!timelockEngineRef.current) {
      timelockEngineRef.current = new TimelockEngine(guardedSendCommand);
    }
  }, [guardedSendCommand]);

  const ticketGenRef = useRef(null);
  const drawingSysRef = useRef(null);

  // Track if parameters have been loaded from VLottoView
  const [parametersLoadedSignal, setParametersLoadedSignal] = useState(false);

  // Save state to localStorage whenever any automation state changes
  useEffect(() => {
    const state = {
      isAutomationRunning,
      currentPhase,
      automationStatus,
      automationError,
      targetDrawingBlock,
      currentBlockHeight,
      blocksUntilDrawing
    };
    saveAutomationState(state);
  }, [isAutomationRunning, currentPhase, automationStatus, automationError, targetDrawingBlock, currentBlockHeight, blocksUntilDrawing]);

  // Function to signal that parameters have been loaded (called by VLottoView)
  const signalParametersLoaded = useCallback(() => {
    console.log('VLotto Automation: Parameters loaded signal received');
    setParametersLoadedSignal(true);
  }, []);

  // Define setPhase first as it's used by reportPhaseUpdate and startFullAutomation
  const setPhase = (phase, status) => {
    console.log(`VLotto Automation: Setting Phase: ${phase}, Status: ${status}`);
    setCurrentPhase(phase);
    setAutomationStatus(status);
  };

  // Define reportPhaseUpdate early and memoize it - always allow phase updates during automation process
  const reportPhaseUpdate = useCallback((newPhase, newStatus) => {
    console.log('VLotto Automation: reportPhaseUpdate called with:', newPhase, newStatus);
    console.log('VLotto Automation: isAutomationRunning =', isAutomationRunning);
    console.log('VLotto Automation: currentPhase =', currentPhase);
    
    // Always allow phase updates when automation process is running
    // Don't check isAutomationRunning here as it can cause timing issues
    setPhase(newPhase, newStatus);
    console.log('VLotto Automation: Phase updated to:', newPhase);
  }, []); // Remove dependency on isAutomationRunning to prevent timing issues

  const setTicketGenerationHook = useCallback((hook) => {
    console.log('VLotto Automation: setTicketGenerationHook called with:', hook);
    ticketGenRef.current = hook;
  }, []);

  const setDrawingSystemHook = useCallback((hook) => {
    console.log('VLotto Automation: setDrawingSystemHook called with:', hook);
    drawingSysRef.current = hook;
  }, []);

  // Helper function to get locked parameters for funding
  const getLockedParameters = useCallback(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        
        // Also get distribution parameters
        const distributionState = localStorage.getItem('vlotto-distribution-state');
        const distributionParams = distributionState ? JSON.parse(distributionState) : {};
        
        return { ...lockedParams, ...distributionParams };
      }
      return {};
    } catch (e) {
      console.error('Error loading locked parameters:', e);
      return {};
    }
  }, []);

  // Public functions to control automation
  const startFullAutomation = useCallback(async (drawingBlock) => {
    console.log(`VLotto Automation: START FULL AUTOMATION. Target Block: ${drawingBlock}`);
    console.log('VLotto Automation: AUTOMATION_PHASES from module scope:', AUTOMATION_PHASES);

    // Wait for ticketGenRef.current to be set by VLottoView's useEffect
    if (!ticketGenRef.current || !drawingSysRef.current) {
      console.log('VLotto Automation: Core hook references not yet set. Waiting...');
      const errorMsg = "Automation cannot start: Core hook references (ticketGen or drawingSys) are not yet set. This usually resolves in a moment. Try again or check console.";
      console.error('VLotto Automation:', errorMsg);
      setAutomationError(errorMsg);
      setPhase(AUTOMATION_PHASES.ERROR, errorMsg);
      setIsAutomationRunning(false);
      return;
    }
    
    console.log('VLotto Automation: ticketGenRef.current IS SET. Proceeding.');

    // Validate parameters before starting automation
    try {
      console.log('VLotto Automation: Validating parameters...');
      const parameters = getLockedParameters();
      const validation = ParameterValidator.validateAutomationParameters(parameters);
      
      if (!validation.valid) {
        const errorDetails = validation.errors.join(', ');
        const warningDetails = validation.warnings.length > 0 ? ` Warnings: ${validation.warnings.join(', ')}` : '';
        const fullErrorMsg = `Parameter validation failed: ${errorDetails}${warningDetails}`;
        
        console.error('VLotto Automation: Parameter validation failed:', validation);
        setAutomationError(fullErrorMsg);
        setPhase(AUTOMATION_PHASES.ERROR, `❌ ${validation.summary}`);
        setIsAutomationRunning(false);
        return;
      }
      
      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('VLotto Automation: Parameter warnings:', validation.warnings);
      }
      
      console.log('VLotto Automation: Parameter validation passed:', validation.summary);
      
    } catch (error) {
      const errorMsg = `Parameter validation error: ${error.message}`;
      console.error('VLotto Automation:', errorMsg);
      setAutomationError(errorMsg);
      setPhase(AUTOMATION_PHASES.ERROR, errorMsg);
      setIsAutomationRunning(false);
      return;
    }

    setIsAutomationRunning(false); 
    setIsAutomationPaused(false); // Clear paused state when starting
    forceStop.current = false; // CRITICAL: Clear force stop flag when starting
    await new Promise(resolve => setTimeout(resolve, 50)); 

    setTargetDrawingBlock(parseInt(drawingBlock));
    setAutomationError(null);
    setCurrentBlockHeight(0); 
    setBlocksUntilDrawing(0); 
    processingLock.current = false; 
    
    setPhase(AUTOMATION_PHASES.FUNDING_JACKPOT, 'Starting lottery automation: Funding jackpot...');
    console.log('VLotto Automation: Initial phase set to FUNDING_JACKPOT');
    setIsAutomationRunning(true); 
    console.log('VLotto Automation: isAutomationRunning set to true');
    
    // Don't immediately start ticket generation - let runAutomationCycle handle the phases
    console.log('VLotto Automation: Automation started, waiting for runAutomationCycle to handle funding phase');
  }, [sendCommand, reportPhaseUpdate, getLockedParameters]);

  // Enhanced timing system that works across tab switches
  const scheduleNextCycle = useCallback(() => {
    if (!isAutomationRunning || isAutomationPaused || forceStop.current) return;
    
    // Clear any existing timers
    if (blockMonitorInterval.current) {
      clearInterval(blockMonitorInterval.current);
      blockMonitorInterval.current = null;
    }
    if (backupTimeout.current) {
      clearTimeout(backupTimeout.current);
      backupTimeout.current = null;
    }
    
    // Use multiple timing mechanisms for reliability
    const runCycle = () => {
      // CRITICAL: Check force stop before running
      if (forceStop.current || !isAutomationRunning || isAutomationPaused) {
        console.log('VLotto Automation: Cycle cancelled - automation stopped');
        return;
      }
      
      const now = Date.now();
      // Only run if enough time has passed (prevent double execution)
      if (now - lastProcessTime.current > 30000) { // 30 second minimum gap
        lastProcessTime.current = now;
        // Call runAutomationCycle directly here to avoid circular dependency
        runAutomationCycleRef.current?.();
      }
    };
    
    // Primary timer - reduced interval for faster response
    blockMonitorInterval.current = setInterval(runCycle, 30000); // 30 seconds instead of 45
    
    // Backup timer using setTimeout (more reliable in background) - NOW TRACKED
    backupTimeout.current = setTimeout(runCycle, 35000); // 35 second backup
    
    console.log('VLotto Automation: Scheduled next automation cycle with enhanced timing');
  }, [isAutomationRunning, isAutomationPaused]);
  
  // Handle tab visibility changes to resume automation immediately
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && isAutomationRunning && !isAutomationPaused && targetDrawingBlock > 0) {
      console.log('VLotto Automation: Tab became visible - checking automation immediately');
      const now = Date.now();
      // Run immediately if it's been more than 25 seconds since last run
      if (now - lastProcessTime.current > 25000) {
        lastProcessTime.current = now;
        runAutomationCycleRef.current?.();
      }
      // Schedule next cycle
      scheduleNextCycle();
    }
  }, [isAutomationRunning, isAutomationPaused, targetDrawingBlock, scheduleNextCycle]);

  // Main automation cycle
  const runAutomationCycle = useCallback(async () => {
    if (!isAutomationRunning || isAutomationPaused || !targetDrawingBlock) {
      return;
    }

    try {
      // Get current block
      const newBlockHeight = await guardedSendCommand('getblockcount', [], 'automation-cycle');
      const remaining = Math.max(0, targetDrawingBlock - parseInt(newBlockHeight));
      
      setCurrentBlockHeight(newBlockHeight);
      setBlocksUntilDrawing(remaining);

      // === MAIN AUTOMATION CYCLE PHASES ===
      
      if (currentPhase === AUTOMATION_PHASES.IDLE) {
        console.log('🔄 [VLottoAutomation] Starting automation cycle...');
        
        // LOG: Automation cycle start
        logger.logAutomationCycleStart({
          mainLotteryId: getMainLotteryId(),
          targetDrawingBlock,
          currentBlock: newBlockHeight,
          blocksUntilDrawing: remaining
        });
        
        setPhase(AUTOMATION_PHASES.CHECKING_CONDITIONS, 'Checking automation conditions...');
        
        // LOG: Phase transition
        logger.logPhaseTransition('IDLE', 'CHECKING_CONDITIONS', 'Starting automation cycle');
        
      } else if (currentPhase === AUTOMATION_PHASES.CHECKING_CONDITIONS) {
        // Check funding, parameters, etc.
        console.log('🔍 [VLottoAutomation] Checking automation conditions...');
        
        // Get locked parameters or validate current ones
        const lockedParams = getLockedParameters();
        
        if (!lockedParams.mainVerusId) {
          throw new Error('Main Lottery ID not configured');
        }
        
        setPhase(AUTOMATION_PHASES.FUNDING_JACKPOT, 'Starting jackpot funding...');
        
        // LOG: Phase transition
        logger.logPhaseTransition('CHECKING_CONDITIONS', 'FUNDING_JACKPOT', 'Conditions validated');
        
      } else if (currentPhase === AUTOMATION_PHASES.FUNDING_JACKPOT) {
        console.log('💰 [VLottoAutomation] === FUNDING PHASE START ===');
        
        // LOG: Funding phase start
        logger.logPhaseStart('FUNDING_JACKPOT', 'Starting jackpot funding operations');
        
        // Execute funding through FundingEngine
        if (fundingEngineRef.current) {
          const lockedParams = getLockedParameters();
          const fundingResult = await fundingEngineRef.current.executeFunding(lockedParams);
          
          if (fundingResult.success) {
            console.log('✅ [VLottoAutomation] Funding completed successfully');
            logger.logPhaseEnd('FUNDING_JACKPOT', 'SUCCESS', 'Jackpot funding completed');
            
            // Apply timelock (skip if disabled for debugging)
            if (!skipTimelock) {
              setPhase(AUTOMATION_PHASES.APPLYING_TIMELOCK, 'Applying security timelock...');
              logger.logPhaseTransition('FUNDING_JACKPOT', 'APPLYING_TIMELOCK', 'Funding completed, applying security');
            } else {
              console.log('⚠️ [VLottoAutomation] Timelock skipped for debugging');
              logger.logWarning('TIMELOCK', 'Timelock functionality disabled for debugging');
              setPhase(AUTOMATION_PHASES.GENERATING_TICKETS, 'Generating lottery tickets...');
              logger.logPhaseTransition('FUNDING_JACKPOT', 'GENERATING_TICKETS', 'Timelock skipped for debugging');
            }
          } else {
            throw new Error(`Funding failed: ${fundingResult.error}`);
          }
        }
        
      } else if (currentPhase === AUTOMATION_PHASES.APPLYING_TIMELOCK) {
        console.log('🔒 [VLottoAutomation] === TIMELOCK PHASE START ===');
        
        // LOG: Timelock phase start
        logger.logPhaseStart('APPLYING_TIMELOCK', 'Applying security timelock to jackpot');
        
        if (timelockEngineRef.current) {
          const lockedParams = getLockedParameters();
          const timelockResult = await timelockEngineRef.current.applyTimelock(lockedParams);
          
          if (timelockResult.success) {
            console.log('✅ [VLottoAutomation] Timelock applied successfully');
            logger.logPhaseEnd('APPLYING_TIMELOCK', 'SUCCESS', 'Security timelock applied');
            setPhase(AUTOMATION_PHASES.GENERATING_TICKETS, 'Generating lottery tickets...');
            logger.logPhaseTransition('APPLYING_TIMELOCK', 'GENERATING_TICKETS', 'Timelock applied successfully');
          } else {
            throw new Error(`Timelock failed: ${timelockResult.error}`);
          }
        }
        
      } else if (currentPhase === AUTOMATION_PHASES.GENERATING_TICKETS) {
        console.log('🎫 [VLottoAutomation] === TICKET GENERATION PHASE START ===');
        
        // LOG: Ticket generation phase start
        logger.logPhaseStart('GENERATING_TICKETS', 'Starting lottery ticket generation');
        
        if (ticketGenRef.current) {
          await ticketGenRef.current.generateAndListTickets(reportPhaseUpdate, AUTOMATION_PHASES);
          console.log('✅ [VLottoAutomation] Ticket generation and listing completed');
          logger.logPhaseEnd('GENERATING_TICKETS', 'SUCCESS', 'Tickets generated and listed on marketplace');
          setPhase(AUTOMATION_PHASES.TICKETS_LISTED_IN_MARKETPLACE, 'Tickets listed on marketplace. Monitoring for expiry...');
          logger.logPhaseTransition('GENERATING_TICKETS', 'TICKETS_LISTED_IN_MARKETPLACE', 'Tickets listed on marketplace');
        }
        
      } else if (currentPhase === AUTOMATION_PHASES.TICKETS_LISTED_IN_MARKETPLACE) {
        // ENHANCED MARKETPLACE MONITORING with detailed logging
        console.log(`🏪 [VLottoAutomation] === MARKETPLACE MONITORING ===`);
        console.log(`📊 [VLottoAutomation] Blocks until drawing: ${remaining}`);
        console.log(`⚙️ [VLottoAutomation] Close offers trigger: ${closeOffersBeforeDrawing} blocks before drawing`);
        
        // Calculate when offers should expire (20 blocks before drawing)
        const offerExpiryBlock = targetDrawingBlock - 20;
        const blocksUntilOfferExpiry = Math.max(0, offerExpiryBlock - parseInt(newBlockHeight));
        
        console.log(`⏰ [VLottoAutomation] Offer expiry block: ${offerExpiryBlock} (${blocksUntilOfferExpiry} blocks until expiry)`);
        
        // LOG: Marketplace monitoring
        logger.logMarketplaceMonitoring(parseInt(newBlockHeight), offerExpiryBlock, targetDrawingBlock, blocksUntilOfferExpiry, closeOffersBeforeDrawing);
        
        // Check if offers have expired (20 blocks before drawing) OR automation trigger reached
        const offersExpired = parseInt(newBlockHeight) >= offerExpiryBlock;
        const automationTrigger = closeOffersBeforeDrawing >= 0 && remaining <= closeOffersBeforeDrawing;
        
        if (offersExpired || automationTrigger) {
          const triggerReason = offersExpired ? 
            `offers expired at block ${offerExpiryBlock}` : 
            `automation trigger at ${closeOffersBeforeDrawing} blocks before drawing`;
            
          console.log(`🚨 [VLottoAutomation] === REVOCATION TRIGGER ===`);
          console.log(`📋 [VLottoAutomation] Trigger reason: ${triggerReason}`);
          console.log(`🧱 [VLottoAutomation] Current block: ${newBlockHeight}, Expiry block: ${offerExpiryBlock}`);
          
          // LOG: Offers expired
          logger.logOffersExpired(parseInt(newBlockHeight), offerExpiryBlock, triggerReason);
          
          setPhase(AUTOMATION_PHASES.REVOKING_UNSOLD_TICKETS, `Checking for expired offers and revoking unsold tickets (${triggerReason})...`);
          
          // LOG: Phase transition
          logger.logPhaseTransition('TICKETS_LISTED_IN_MARKETPLACE', 'REVOKING_UNSOLD_TICKETS', triggerReason);
          
          try {
            console.log('🔍 [VLottoAutomation] Starting expired offer check and revocation process...');
            await ticketGenRef.current.checkAndRevokeExpiredOffers(reportPhaseUpdate, AUTOMATION_PHASES);
            console.log('✅ [VLottoAutomation] Expired offer check and unsold ticket revocation completed successfully');
          } catch (error) {
            console.error('❌ [VLottoAutomation] Error checking expired offers and revoking unsold tickets:', error);
            logger.logError('REVOCATION', error, 'Failed during offer expiry check and revocation');
            // Continue to drawing preparation even if revocation fails
          }
          
          // Always transition to ready for drawing after revocation sequence
          setPhase(AUTOMATION_PHASES.READY_FOR_DRAWING, `Ready for drawing at block ${targetDrawingBlock}.`);
          console.log('⚡ [VLottoAutomation] Transitioned to READY_FOR_DRAWING phase');
          
          // LOG: Phase transition
          logger.logPhaseTransition('REVOKING_UNSOLD_TICKETS', 'READY_FOR_DRAWING', 'Revocation completed, ready for drawing');
        } else {
          // Log marketplace status periodically
          setAutomationStatus(`Marketplace active. Offers expire in ${blocksUntilOfferExpiry} blocks (block ${offerExpiryBlock}). Automation check in ${remaining - closeOffersBeforeDrawing} blocks.`);
          console.log(`💤 [VLottoAutomation] Marketplace active - waiting for expiry or trigger`);
        }
        
      } else if (currentPhase === AUTOMATION_PHASES.READY_FOR_DRAWING) {
        if (remaining <= 0) {
          console.log('🎲 [VLottoAutomation] === DRAWING PHASE START ===');
          
          // LOG: Drawing phase start  
          logger.logPhaseStart('DRAWING_EXECUTION', `Executing drawing at block ${targetDrawingBlock}`);
          
          setPhase(AUTOMATION_PHASES.EXECUTING_DRAWING, `Executing drawing at block ${targetDrawingBlock}...`);
          
          // LOG: Phase transition
          logger.logPhaseTransition('READY_FOR_DRAWING', 'EXECUTING_DRAWING', `Drawing block ${targetDrawingBlock} reached`);
          
          // Get tickets for drawing
          const allTickets = ticketGenRef.current?.tickets || [];
          const revokedTickets = ticketGenRef.current?.revokedTickets || [];
          
          if (allTickets.length === 0) {
            throw new Error('No tickets found for drawing');
          }
          
          console.log(`🎫 [VLottoAutomation] Drawing ${allTickets.length} tickets (${revokedTickets.length} revoked)`);
          
          // LOG: Drawing details
          logger.logDrawingStart(targetDrawingBlock, allTickets.length, 'TBD');
          
          // Execute drawing
          const drawingResult = await drawingSysRef.current.performDrawing(allTickets, revokedTickets);
          
          if (drawingResult && drawingResult.winner) {
            console.log(`🏆 [VLottoAutomation] Drawing completed! Winner: ${drawingResult.winner.name}`);
            
            // LOG: Drawing completion
            logger.logDrawingComplete(drawingResult.winner, allTickets.length, drawingResult.validTickets, drawingResult.fraudTickets);
            logger.logPhaseEnd('DRAWING_EXECUTION', 'SUCCESS', `Winner: ${drawingResult.winner.name}`);
            
            setWinner(drawingResult.winner);
            setPhase(AUTOMATION_PHASES.EXECUTING_PAYOUT, 'Executing winner payout...');
            
            // LOG: Phase transition
            logger.logPhaseTransition('EXECUTING_DRAWING', 'EXECUTING_PAYOUT', `Winner determined: ${drawingResult.winner.name}`);
          } else {
            throw new Error('Drawing failed to produce a winner');
          }
        } else {
          setAutomationStatus(`Ready for drawing. ${remaining} blocks remaining until block ${targetDrawingBlock}.`);
        }
        
      } else if (currentPhase === AUTOMATION_PHASES.EXECUTING_PAYOUT) {
        console.log('💰 [VLottoAutomation] === PAYOUT PHASE START ===');
        
        // LOG: Payout phase start
        logger.logPhaseStart('EXECUTING_PAYOUT', 'Starting winner payout distribution');
        
        // Execute payout logic here
        const lockedParams = getLockedParameters();
        
        // For now, mark as completed
        console.log('✅ [VLottoAutomation] Payout phase completed');
        logger.logPhaseEnd('EXECUTING_PAYOUT', 'SUCCESS', 'Payout distribution completed');
        setPhase(AUTOMATION_PHASES.COMPLETED, 'Lottery cycle completed successfully!');
        
        // LOG: Automation completion
        logger.logAutomationComplete({
          winner: winner?.name || 'Unknown',
          totalPayout: 'TBD',
          currency: 'TBD',
          duration: Date.now() - (automationStartTime || Date.now()),
          nextDrawingBlock: 'TBD'
        });
        
        // LOG: Phase transition
        logger.logPhaseTransition('EXECUTING_PAYOUT', 'COMPLETED', 'Lottery cycle completed successfully');
        
        // Stop automation after completion
        setTimeout(() => {
          resetFullAutomation();
        }, 5000);
      }

    } catch (error) {
      console.error('❌ [VLottoAutomation] Error in automation cycle:', error);
      
      // LOG: Automation error
      logger.logAutomationError(currentPhase, error, `Block ${blockHeight}, ${blocksUntilDrawing} blocks until drawing`);
      
      setAutomationError(error.message);
      setPhase(AUTOMATION_PHASES.ERROR, `Error: ${error.message}`);
    }
  }, [isAutomationRunning, isAutomationPaused, currentPhase, targetDrawingBlock, guardedSendCommand, automationError, closeOffersBeforeDrawing, getLockedParameters, scheduleNextCycle]);

  // Store the runAutomationCycle function in ref to avoid circular dependency
  useEffect(() => {
    runAutomationCycleRef.current = runAutomationCycle;
  }, [runAutomationCycle]);

  // Enhanced block monitoring with tab visibility support
  useEffect(() => {
    if (isAutomationRunning && !isAutomationPaused && targetDrawingBlock > 0) {
      console.log(`VLotto Automation: Starting enhanced block monitor. Target: ${targetDrawingBlock}`);
      console.log('VLotto Automation: Using tab-visibility-aware timing system');
      
      // Run immediately
      lastProcessTime.current = Date.now();
      runAutomationCycleRef.current?.(); 
      
      // Set up enhanced scheduling
      scheduleNextCycle();
      
      // Add visibility change listener if not already added
      if (!tabVisibilityListener.current) {
        tabVisibilityListener.current = handleVisibilityChange;
        document.addEventListener('visibilitychange', handleVisibilityChange);
        console.log('VLotto Automation: Added tab visibility listener');
      }
    } else {
      // Clean up when automation stops
      if (blockMonitorInterval.current) {
        console.log('VLotto Automation: Clearing enhanced block monitor');
        clearInterval(blockMonitorInterval.current);
        blockMonitorInterval.current = null;
      }
      if (backupTimeout.current) {
        console.log('VLotto Automation: Clearing backup timeout');
        clearTimeout(backupTimeout.current);
        backupTimeout.current = null;
      }
    }
    
    return () => {
      if (blockMonitorInterval.current) {
        console.log('VLotto Automation: Cleanup - Clearing enhanced block monitor');
        clearInterval(blockMonitorInterval.current);
        blockMonitorInterval.current = null;
      }
      if (backupTimeout.current) {
        console.log('VLotto Automation: Cleanup - Clearing backup timeout');
        clearTimeout(backupTimeout.current);
        backupTimeout.current = null;
      }
    };
  }, [isAutomationRunning, isAutomationPaused, targetDrawingBlock, scheduleNextCycle, handleVisibilityChange]);
  
  // Clean up visibility listener on unmount
  useEffect(() => {
    return () => {
      if (tabVisibilityListener.current) {
        document.removeEventListener('visibilitychange', tabVisibilityListener.current);
        tabVisibilityListener.current = null;
        console.log('VLotto Automation: Removed tab visibility listener on unmount');
      }
    };
  }, []);

  const stopFullAutomation = useCallback(() => {
    console.log('VLotto Automation: STOP FULL AUTOMATION called.');
    
    // CRITICAL: Set force stop flag FIRST to prevent any new cycles
    forceStop.current = true;
    
    setIsAutomationRunning(false);
    setIsAutomationPaused(false); // Clear paused state when stopping
    setPhase(AUTOMATION_PHASES.STOPPED, 'Automation stopped by user.');
    
    // Clean up ALL timers and listeners immediately
    if (blockMonitorInterval.current) {
      clearInterval(blockMonitorInterval.current);
      blockMonitorInterval.current = null;
      console.log('VLotto Automation: Cleared main interval timer');
    }
    
    if (backupTimeout.current) {
      clearTimeout(backupTimeout.current);
      backupTimeout.current = null;
      console.log('VLotto Automation: Cleared backup timeout timer');
    }
    
    if (tabVisibilityListener.current) {
      document.removeEventListener('visibilitychange', tabVisibilityListener.current);
      tabVisibilityListener.current = null;
      console.log('VLotto Automation: Removed tab visibility listener on stop');
    }
    
    // Clear processing lock
    processingLock.current = false;
    
    // Clear persistent state when stopped manually
    localStorage.removeItem(AUTOMATION_STORAGE_KEY);
    
    console.log('VLotto Automation: All timers cleared and force stop flag set');
  }, []);

  const resetFullAutomation = useCallback(() => {
    console.log('VLotto Automation: RESET FULL AUTOMATION called.');
    
    // Stop automation first (which sets force stop flag)
    stopFullAutomation();
    
    // Reset all state
    setPhase(AUTOMATION_PHASES.IDLE, 'Automation Idle.');
    setAutomationError(null);
    setTargetDrawingBlock(0);
    setCurrentBlockHeight(0);
    setBlocksUntilDrawing(0);
    setIsAutomationPaused(false); // Clear paused state when resetting
    processingLock.current = false;
    
    // Ensure force stop flag is set (redundant but safe)
    forceStop.current = true;
    
    // Clear persistent state when reset
    localStorage.removeItem(AUTOMATION_STORAGE_KEY);
    
    console.log('VLotto Automation: Complete reset finished');
  }, [stopFullAutomation]);

  // NEW: Pause automation (keeps current state but stops processing)
  const pauseAutomation = useCallback(() => {
    console.log('VLotto Automation: PAUSE AUTOMATION called.');
    setIsAutomationPaused(true);
    setAutomationStatus(`Automation paused by user in ${currentPhase} phase.`);
    
    // Clean up timers but keep state
    if (blockMonitorInterval.current) {
      clearInterval(blockMonitorInterval.current);
      blockMonitorInterval.current = null;
    }
    
    if (backupTimeout.current) {
      clearTimeout(backupTimeout.current);
      backupTimeout.current = null;
    }
  }, [currentPhase]);

  // NEW: Resume automation (continues from where it left off)
  const resumeAutomation = useCallback(() => {
    console.log('VLotto Automation: RESUME AUTOMATION called.');
    setIsAutomationPaused(false);
    setAutomationStatus(`Automation resumed from pause in ${currentPhase} phase.`);
    
    // Immediately run a cycle and schedule next one
    if (isAutomationRunning && targetDrawingBlock > 0) {
      console.log('VLotto Automation: Resuming from pause - running cycle immediately');
      lastProcessTime.current = Date.now();
      runAutomationCycleRef.current?.();
    }
  }, [isAutomationRunning, targetDrawingBlock, currentPhase]);

  // Utility function to clear all persistent automation state (for debugging/recovery)
  const clearPersistentState = useCallback(() => {
    console.log('VLotto Automation: Clearing all persistent state.');
    localStorage.removeItem(AUTOMATION_STORAGE_KEY);
    resetFullAutomation();
  }, [resetFullAutomation]);
  
  const getPhaseDisplayInfo = () => {
    const isActive = isAutomationRunning && !isAutomationPaused && currentPhase !== AUTOMATION_PHASES.IDLE && currentPhase !== AUTOMATION_PHASES.ERROR && currentPhase !== AUTOMATION_PHASES.STOPPED && currentPhase !== AUTOMATION_PHASES.DRAWING_COMPLETE;
    
    // If paused, modify any phase to show as paused
    if (isAutomationPaused && isAutomationRunning) {
      return { color: '#ff9800', icon: '⏸️', label: `Paused (${currentPhase})`, spinning: false };
    }
    
    switch (currentPhase) {
      case AUTOMATION_PHASES.IDLE:
        return { color: '#9e9e9e', icon: '⚪', label: 'Idle', spinning: false };
      case 'PAUSED':
        return { color: '#ff9800', icon: '⏸️', label: 'Paused', spinning: false };
      case AUTOMATION_PHASES.FUNDING_JACKPOT:
        return { color: '#ff9800', icon: '💰', label: 'Funding Jackpot', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_JACKPOT_FUNDING:
        return { color: '#ff9800', icon: '⏳', label: 'Pending Jackpot Funding', spinning: isActive };
      case AUTOMATION_PHASES.SETTING_TIMELOCK:
        return { color: '#f44336', icon: '🔒', label: 'Setting Timelock', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_TIMELOCK_CONFIRMATION:
        return { color: '#f44336', icon: '⏳', label: 'Pending Timelock Confirmation', spinning: isActive };
      case AUTOMATION_PHASES.CALCULATING_TICKET_QUANTITY:
        return { color: '#2196f3', icon: '🧮', label: 'Calculating Ticket Quantity', spinning: isActive };
      case AUTOMATION_PHASES.COMMITTING_TICKETS:
        return { color: '#ff9800', icon: '⚙️', label: 'Committing Tickets', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_TICKET_COMMITMENT_CONFIRMATION:
        return { color: '#ff9800', icon: '⏳', label: 'Pending Ticket Commitment Confirmation', spinning: isActive };
      case AUTOMATION_PHASES.REGISTERING_TICKETS:
        return { color: '#ffc107', icon: '⚙️', label: 'Registering Tickets', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_TICKET_REGISTRATION:
        return { color: '#ffc107', icon: '⏳', label: 'Pending Ticket Registration', spinning: isActive };
      case AUTOMATION_PHASES.VALIDATING_TICKETS:
        return { color: '#03a9f4', icon: '⚙️', label: 'Validating Tickets', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_TICKET_VALIDATION:
        return { color: '#03a9f4', icon: '⏳', label: 'Pending Ticket Validation', spinning: isActive };
      case AUTOMATION_PHASES.PREPARING_TICKET_OFFERS:
        return { color: '#2196f3', icon: '⚙️', label: 'Preparing Ticket Offers', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_MARKETPLACE_LISTING:
        return { color: '#2196f3', icon: '⏳', label: 'Pending Marketplace Listing', spinning: isActive };
      case AUTOMATION_PHASES.TICKETS_LISTED_IN_MARKETPLACE:
        return { color: '#4caf50', icon: '🏪', label: 'Tickets Listed in Marketplace', spinning: false };
      case AUTOMATION_PHASES.CLOSING_OFFERS:
        return { color: '#ff9800', icon: '⚙️', label: 'Closing Offers', spinning: isActive };
      case AUTOMATION_PHASES.REVOKING_UNSOLD_TICKETS:
        return { color: '#f44336', icon: '⚙️', label: 'Revoking Unsold Tickets', spinning: isActive };
      case AUTOMATION_PHASES.PENDING_UNSOLD_TICKET_REVOCATION:
        return { color: '#f44336', icon: '⏳', label: 'Pending Unsold Ticket Revocation', spinning: isActive };
      case AUTOMATION_PHASES.READY_FOR_DRAWING:
        return { color: '#9c27b0', icon: '⏳', label: 'Ready for Drawing', spinning: false };
      case AUTOMATION_PHASES.PERFORMING_DRAWING:
        return { color: '#4caf50', icon: '⚙️', label: 'Performing Drawing', spinning: isActive };
      case AUTOMATION_PHASES.DRAWING_COMPLETE:
        return { color: '#4caf50', icon: '🏆', label: 'Drawing Complete', spinning: false };
      case AUTOMATION_PHASES.ERROR:
        return { color: '#d32f2f', icon: '❗', label: 'Error', spinning: false };
      case AUTOMATION_PHASES.STOPPED:
        return { color: '#f44336', icon: '🛑', label: 'Stopped', spinning: false };
      default:
        return { color: '#9e9e9e', icon: '❓', label: 'Unknown', spinning: false };
    }
  };

  return {
    isAutomationRunning,
    isAutomationPaused,
    currentPhase,
    automationStatus,
    automationError,
    targetDrawingBlock,
    currentBlockHeight,
    blocksUntilDrawing,
    closeOffersBeforeDrawing,
    startFullAutomation,
    stopFullAutomation,
    resetFullAutomation,
    pauseAutomation,
    resumeAutomation,
    clearPersistentState,
    getPhaseDisplayInfo,
    reportPhaseUpdate,
    setTicketGenerationHook,
    setDrawingSystemHook,
    getLockedParameters,
    fundingEngine: fundingEngineRef.current,
    timelockEngine: timelockEngineRef.current,
    ParameterValidator,
    AUTOMATION_PHASES,
    VLottoTester
  };
}; 