/**
 * VLotto Master Automation Engine
 * 
 * Coordinates all automation engines and provides unified interface
 * Orchestrates the complete lottery cycle with manual override capabilities
 */

import { FundingEngine } from './fundingEngine.js';
import { TimelockEngine } from './timelockEngine.js';
import { PayoutEngine } from './payoutEngine.js';
import { CycleEngine } from './cycleEngine.js';
import { getVLottoLogger } from '../utils/vlottoLogger.js';

export class MasterAutomationEngine {
  constructor(sendCommand) {
    this.sendCommand = sendCommand;
    this.logger = getVLottoLogger();
    
    // Initialize individual engines
    this.fundingEngine = new FundingEngine(sendCommand);
    this.timelockEngine = new TimelockEngine(sendCommand);
    this.payoutEngine = new PayoutEngine(sendCommand);
    this.cycleEngine = new CycleEngine(sendCommand);
    
    // Master state
    this.isAutomationRunning = false;
    this.currentPhase = 'IDLE';
    this.automationHistory = [];
    this.lastError = null;
    
    // Automation phases
    this.AUTOMATION_PHASES = {
      IDLE: 'idle',
      INITIALIZING: 'initializing',
      FUNDING: 'funding',
      TIMELOCK_SET: 'timelock_set',
      WAITING_FOR_DRAWING: 'waiting_for_drawing',
      DRAWING_READY: 'drawing_ready',
      DRAWING_COMPLETE: 'drawing_complete',
      PROCESSING_PAYOUTS: 'processing_payouts',
      GRACE_PERIOD: 'grace_period',
      CYCLE_COMPLETE: 'cycle_complete',
      ERROR: 'error'
    };
    
    // Manual override flags
    this.manualOverride = {
      enabled: false,
      skipFunding: false,
      skipTimelock: true,  // Disabled for testing - avoid timelock issues
      skipPayout: false,
      customWinner: null
    };
  }

  /**
   * Start full automation cycle
   * @param {Object} automationParams - Automation parameters
   * @returns {Promise<Object>} Start result
   */
  async startFullAutomation(automationParams) {
    try {
      this.logger.logPhaseStart('AUTOMATION_START', 'Starting full automation cycle');
      console.log('[MasterAutomation] Starting full automation...');
      
      if (this.isAutomationRunning) {
        throw new Error('Automation is already running');
      }

      this.isAutomationRunning = true;
      this.currentPhase = this.AUTOMATION_PHASES.INITIALIZING;
      this.lastError = null;

      // Log cycle start with parameters
      this.logger.logCycleStart(automationParams);

      // Validate parameters
      const validation = this.validateAutomationParams(automationParams);
      if (!validation.valid) {
        throw new Error(`Parameter validation failed: ${validation.errors.join(', ')}`);
      }

      // Initialize cycle
      const cycle = this.cycleEngine.initializeCycle(automationParams);
      
      // Get locked parameter values
      const lockedParams = this.getLockedParameters();
      this.logger.writeToLog(`📋 LOCKED PARAMETERS: ${Object.keys(lockedParams).length} parameters loaded`);
      
      // Start funding if not overridden
      if (!this.manualOverride.skipFunding) {
        await this.executeFundingPhase(automationParams, lockedParams);
      } else {
        this.logger.logWarning('AUTOMATION_OVERRIDE', 'Skipping funding (manual override)');
        console.log('[MasterAutomation] Skipping funding (manual override)');
        this.currentPhase = this.AUTOMATION_PHASES.TIMELOCK_SET;
      }

      // Set timelock if not overridden
      if (!this.manualOverride.skipTimelock) {
        await this.executeTimelockPhase(automationParams, lockedParams);
      } else {
        this.logger.logWarning('AUTOMATION_OVERRIDE', 'Skipping timelock (manual override)');
        console.log('[MasterAutomation] Skipping timelock (manual override)');
        this.currentPhase = this.AUTOMATION_PHASES.WAITING_FOR_DRAWING;
      }

      // Wait for drawing block
      this.currentPhase = this.AUTOMATION_PHASES.WAITING_FOR_DRAWING;
      this.logger.logPhaseStart('WAITING_FOR_DRAWING', `Waiting for drawing block ${cycle.drawingBlock}`);
      
      const result = {
        success: true,
        cycleId: cycle.id,
        phase: this.currentPhase,
        drawingBlock: cycle.drawingBlock,
        graceEndBlock: cycle.graceEndBlock,
        nextDrawingBlock: cycle.nextDrawingBlock,
        timestamp: new Date().toISOString()
      };

      this.automationHistory.push(result);
      this.logger.logPhaseEnd('AUTOMATION_START', 'SUCCESS', `Cycle ${cycle.id} ready for drawing at block ${cycle.drawingBlock}`);
      
      return result;

    } catch (error) {
      this.logger.logError('AUTOMATION_START', error);
      console.error('[MasterAutomation] Error starting automation:', error);
      this.lastError = error;
      this.currentPhase = this.AUTOMATION_PHASES.ERROR;
      this.isAutomationRunning = false;
      
      const errorResult = {
        success: false,
        error: error.message,
        phase: 'startup_error',
        timestamp: new Date().toISOString()
      };
      
      this.automationHistory.push(errorResult);
      this.logger.logPhaseEnd('AUTOMATION_START', 'ERROR', error.message);
      throw error;
    }
  }

  /**
   * Execute funding phase
   * @param {Object} automationParams - Automation parameters
   * @param {Object} lockedParams - Locked parameter values
   */
  async executeFundingPhase(automationParams, lockedParams) {
    try {
      console.log('[MasterAutomation] Executing funding phase...');
      this.currentPhase = this.AUTOMATION_PHASES.FUNDING;

      // Calculate funding requirements
      const fundingCalc = await this.fundingEngine.calculateFundingRequirements(
        automationParams.mainLotteryId,
        lockedParams
      );

      if (!fundingCalc.fullyFunded) {
        this.logger.logWarning('FUNDING_PHASE', `Funding shortfall detected: ${fundingCalc.shortfall}`, 'Manual intervention may be needed');
        console.warn('[MasterAutomation] Funding shortfall detected:', fundingCalc.shortfall);
        // Continue anyway - manual intervention may be needed
      }

      // Execute funding
      const fundingResult = await this.fundingEngine.executeFunding(
        fundingCalc,
        automationParams.mainLotteryId,
        automationParams.confirmations
      );

      this.cycleEngine.updateCyclePhase(this.cycleEngine.PHASES.FUNDING, fundingResult);
      
    } catch (error) {
      this.cycleEngine.logCycleError('funding', error);
      throw error;
    }
  }

  /**
   * Execute timelock phase
   * @param {Object} automationParams - Automation parameters
   * @param {Object} lockedParams - Locked parameter values
   */
  async executeTimelockPhase(automationParams, lockedParams) {
    try {
      console.log('[MasterAutomation] Executing timelock phase...');
      
      const drawingBlock = this.timelockEngine.calculateDrawingBlock(
        automationParams.startBlock,
        automationParams.drawingCycle
      );

      const timelockResult = await this.timelockEngine.setJackpotTimelock(
        automationParams.mainLotteryId,
        drawingBlock,
        automationParams.confirmations
      );

      this.cycleEngine.updateCyclePhase(this.cycleEngine.PHASES.TIMELOCK, timelockResult);
      this.currentPhase = this.AUTOMATION_PHASES.TIMELOCK_SET;

    } catch (error) {
      this.cycleEngine.logCycleError('timelock', error);
      throw error;
    }
  }

  /**
   * Check if ready for drawing and update phase
   * @returns {Promise<Object>} Drawing readiness status
   */
  async checkDrawingReadiness() {
    try {
      if (!this.cycleEngine.currentCycle) {
        return { ready: false, reason: 'No active cycle' };
      }

      const currentBlock = await this.cycleEngine.getCurrentBlockInfo();
      const timing = this.cycleEngine.calculateCycleTiming(
        this.cycleEngine.currentCycle,
        currentBlock.currentBlock
      );

      // Log current blockchain status
      this.logger.logBlockchainStatus(currentBlock.currentBlock);

      if (timing.drawingReady) {
        this.currentPhase = this.AUTOMATION_PHASES.DRAWING_READY;
        this.cycleEngine.updateCyclePhase(this.cycleEngine.PHASES.DRAWING_READY);
        this.logger.logDrawingReadiness(this.cycleEngine.currentCycle.drawingBlock, currentBlock.currentBlock, true);
        
        return {
          ready: true,
          currentBlock: currentBlock.currentBlock,
          drawingBlock: this.cycleEngine.currentCycle.drawingBlock,
          timing: timing
        };
      }

      // Log waiting status periodically (not every call to avoid spam)
      if (currentBlock.currentBlock % 10 === 0) { // Log every 10 blocks
        this.logger.logDrawingReadiness(this.cycleEngine.currentCycle.drawingBlock, currentBlock.currentBlock, false);
      }

      return {
        ready: false,
        reason: `Waiting for block ${this.cycleEngine.currentCycle.drawingBlock}`,
        blocksRemaining: timing.blocksToDrawing,
        timing: timing
      };

    } catch (error) {
      this.logger.logError('DRAWING_READINESS_CHECK', error);
      console.error('[MasterAutomation] Error checking drawing readiness:', error);
      return { ready: false, reason: error.message };
    }
  }

  /**
   * Process drawing completion and start payouts
   * @param {Object} drawingResult - Result from drawing system
   * @param {string} winnerTicketId - Winner ticket identity
   * @returns {Promise<Object>} Payout processing result
   */
  async processDrawingCompletion(drawingResult, winnerTicketId) {
    try {
      this.logger.logPhaseStart('DRAWING_COMPLETION', `Processing drawing completion for winner ${winnerTicketId}`);
      console.log('[MasterAutomation] Processing drawing completion...');
      
      if (this.manualOverride.customWinner) {
        winnerTicketId = this.manualOverride.customWinner;
        this.logger.logWarning('AUTOMATION_OVERRIDE', `Using custom winner (manual override): ${winnerTicketId}`);
        console.log('[MasterAutomation] Using custom winner (manual override):', winnerTicketId);
      }

      this.currentPhase = this.AUTOMATION_PHASES.DRAWING_COMPLETE;
      this.cycleEngine.updateCyclePhase(this.cycleEngine.PHASES.DRAWING, drawingResult);

      if (!this.manualOverride.skipPayout) {
        await this.executePayoutPhase(winnerTicketId);
      } else {
        this.logger.logWarning('AUTOMATION_OVERRIDE', 'Skipping payout (manual override)');
        console.log('[MasterAutomation] Skipping payout (manual override)');
        this.currentPhase = this.AUTOMATION_PHASES.GRACE_PERIOD;
      }

      const result = {
        success: true,
        winnerTicketId: winnerTicketId,
        phase: this.currentPhase,
        timestamp: new Date().toISOString()
      };

      this.logger.logPhaseEnd('DRAWING_COMPLETION', 'SUCCESS', `Winner ${winnerTicketId} processed`);
      return result;

    } catch (error) {
      this.logger.logError('DRAWING_COMPLETION', error);
      console.error('[MasterAutomation] Error processing drawing completion:', error);
      this.lastError = error;
      this.currentPhase = this.AUTOMATION_PHASES.ERROR;
      throw error;
    }
  }

  /**
   * Execute payout phase
   * @param {string} winnerTicketId - Winner ticket identity
   */
  async executePayoutPhase(winnerTicketId) {
    try {
      console.log('[MasterAutomation] Executing payout phase...');
      this.currentPhase = this.AUTOMATION_PHASES.PROCESSING_PAYOUTS;

      const lockedParams = this.getLockedParameters();
      const cycle = this.cycleEngine.currentCycle;

      // Get jackpot balance
      this.logger.logBalanceCheck(`jackpot.${cycle.mainLotteryId}`, 'pre-payout jackpot balance');
      const jackpotBalance = await this.sendCommand('getcurrencybalance', [
        `jackpot.${cycle.mainLotteryId}`
      ]);
      
      const parentCurrency = this.getParentCurrency(cycle.mainLotteryId);
      const totalJackpot = jackpotBalance[parentCurrency] || 0;
      this.logger.logBalanceResult(`jackpot.${cycle.mainLotteryId}`, totalJackpot, parentCurrency, 'pre-payout jackpot balance');

      // Calculate payout distribution
      const payoutCalc = this.payoutEngine.calculatePayoutDistribution(
        cycle.mainLotteryId,
        lockedParams,
        totalJackpot
      );

      // Execute payouts
      const payoutResult = await this.payoutEngine.executePayouts(
        payoutCalc,
        winnerTicketId,
        cycle.confirmations
      );

      this.cycleEngine.updateCyclePhase(this.cycleEngine.PHASES.PAYOUT, payoutResult);
      this.currentPhase = this.AUTOMATION_PHASES.GRACE_PERIOD;

      // Start grace period countdown
      await this.startGracePeriod();

    } catch (error) {
      this.cycleEngine.logCycleError('payout', error);
      throw error;
    }
  }

  /**
   * Start grace period and prepare for next cycle
   */
  async startGracePeriod() {
    try {
      this.logger.logPhaseStart('GRACE_PERIOD', 'Starting grace period before next cycle');
      console.log('[MasterAutomation] Starting grace period...');
      this.cycleEngine.updateCyclePhase(this.cycleEngine.PHASES.GRACE_PERIOD);
      
      // Set up next cycle timelock if not overridden
      if (!this.manualOverride.skipTimelock) {
        const cycle = this.cycleEngine.currentCycle;
        
        await this.timelockEngine.setNextCycleTimelock(
          cycle.mainLotteryId,
          cycle.drawingBlock,
          cycle.gracePeriod,
          cycle.drawingCycle,
          cycle.confirmations
        );

        this.logger.logPhaseEnd('GRACE_PERIOD', 'SUCCESS', `Next cycle timelock set for block ${cycle.nextDrawingBlock}`);
      } else {
        this.logger.logWarning('AUTOMATION_OVERRIDE', 'Skipping next cycle timelock (manual override)');
        console.log('[MasterAutomation] Skipping next cycle timelock (manual override)');
        this.logger.logPhaseEnd('GRACE_PERIOD', 'SUCCESS', 'Grace period complete (timelock disabled)');
      }

      // The grace period will end automatically based on blocks
      // Manual intervention or monitoring will trigger the next cycle

    } catch (error) {
      this.logger.logError('GRACE_PERIOD', error);
      console.error('[MasterAutomation] Error in grace period setup:', error);
      this.cycleEngine.logCycleError('grace_period', error);
    }
  }

  /**
   * Complete current cycle and prepare for next
   * @returns {Promise<Object>} Completion result
   */
  async completeCycleAndPrepareNext() {
    try {
      this.logger.logPhaseStart('CYCLE_COMPLETION', 'Completing current cycle');
      console.log('[MasterAutomation] Completing cycle...');
      
      const completedCycle = this.cycleEngine.completeCycle();
      this.currentPhase = this.AUTOMATION_PHASES.CYCLE_COMPLETE;
      
      // Log cycle end
      this.logger.logCycleEnd('SUCCESS', `Cycle ${completedCycle.id} completed successfully`);
      
      // Reset for next cycle
      this.isAutomationRunning = false;
      this.currentPhase = this.AUTOMATION_PHASES.IDLE;

      const result = {
        success: true,
        completedCycle: completedCycle.id,
        nextCycleReady: true,
        timestamp: new Date().toISOString()
      };

      this.logger.logPhaseEnd('CYCLE_COMPLETION', 'SUCCESS', `Ready for next cycle`);
      return result;

    } catch (error) {
      this.logger.logError('CYCLE_COMPLETION', error);
      console.error('[MasterAutomation] Error completing cycle:', error);
      throw error;
    }
  }

  /**
   * Get locked parameters from localStorage
   * @returns {Object} Locked parameter values
   */
  getLockedParameters() {
    try {
      const saved = localStorage.getItem('vlotto-locked-params') || '{}';
      const lockedParams = JSON.parse(saved);
      
      // Get distribution parameters
      const distributionSaved = localStorage.getItem('vlotto-distribution-state') || '{}';
      const distributionParams = JSON.parse(distributionSaved);
      
      return { ...lockedParams, ...distributionParams };
      
    } catch (error) {
      this.logger.logError('PARAMETER_LOADING', error);
      console.error('[MasterAutomation] Error getting locked parameters:', error);
      return {};
    }
  }

  /**
   * Get parent currency from lottery ID
   * @param {string} lotteryId - Lottery identity
   * @returns {string} Parent currency
   */
  getParentCurrency(lotteryId) {
    if (!lotteryId.includes('@')) return 'VRSC';
    // Extract the part before '@' - for "shylock@" this returns "shylock"
    if (lotteryId.endsWith('@')) {
      return lotteryId.slice(0, -1);
    }
    // For compound identities like "test.shylock@", get the last part before '@'
    const beforeAt = lotteryId.split('@')[0];
    const parts = beforeAt.split('.');
    return parts[parts.length - 1] || 'VRSC';
  }

  /**
   * Validate automation parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateAutomationParams(params) {
    return this.cycleEngine.validateCycleParameters(params);
  }

  /**
   * Get comprehensive automation status
   * @returns {Promise<Object>} Complete status
   */
  async getAutomationStatus() {
    try {
      const blockInfo = await this.cycleEngine.getCurrentBlockInfo();
      const cycleStatus = this.cycleEngine.getCycleStatus(blockInfo.currentBlock);

      return {
        isRunning: this.isAutomationRunning,
        phase: this.currentPhase,
        currentBlock: blockInfo.currentBlock,
        lastError: this.lastError?.message || null,
        
        // Engine statuses
        engines: {
          funding: this.fundingEngine.getStatus(),
          timelock: this.timelockEngine.getStatus(),
          payout: this.payoutEngine.getStatus(),
          cycle: cycleStatus
        },
        
        // Manual override settings
        manualOverride: { ...this.manualOverride },
        
        // History counts
        historyCount: this.automationHistory.length,
        
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.logError('STATUS_CHECK', error);
      console.error('[MasterAutomation] Error getting status:', error);
      return {
        error: error.message,
        isRunning: this.isAutomationRunning,
        phase: this.currentPhase
      };
    }
  }

  /**
   * Emergency stop automation
   */
  emergencyStop() {
    this.logger.logPhaseStart('EMERGENCY_STOP', 'Emergency stop activated');
    console.log('[MasterAutomation] EMERGENCY STOP triggered');
    
    this.isAutomationRunning = false;
    this.currentPhase = this.AUTOMATION_PHASES.ERROR;
    this.lastError = new Error('Emergency stop activated');
    
    // Reset engines
    this.cycleEngine.emergencyReset();
    
    // Clear manual overrides
    this.manualOverride = {
      enabled: false,
      skipFunding: false,
      skipTimelock: true,
      skipPayout: false,
      customWinner: null
    };

    this.logger.logCycleEnd('EMERGENCY_STOP', 'Emergency stop triggered by user');
    this.logger.logPhaseEnd('EMERGENCY_STOP', 'SUCCESS', 'All automation halted');
  }

  /**
   * Set manual override options
   * @param {Object} overrideOptions - Override settings
   */
  setManualOverride(overrideOptions) {
    this.manualOverride = { ...this.manualOverride, ...overrideOptions };
    this.logger.writeToLog(`⚙️ MANUAL OVERRIDE UPDATED: ${JSON.stringify(this.manualOverride)}`);
    console.log('[MasterAutomation] Manual override updated:', this.manualOverride);
  }

  /**
   * Clear all history
   */
  clearAllHistory() {
    this.automationHistory = [];
    this.fundingEngine.clearHistory();
    this.timelockEngine.clearHistory();
    this.payoutEngine.clearHistory();
    this.cycleEngine.clearHistory();
    this.logger.writeToLog('🗑️ ALL AUTOMATION HISTORY CLEARED');
  }
} 