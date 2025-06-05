/**
 * VLotto Cycle Management Engine
 * 
 * Coordinates drawing cycles and grace periods
 * Cycle Logic: Start Block + Drawing Cycle = Drawing Block; after payout, Grace Period begins; next prep at Drawing Block + Grace Period
 * Example: Start 570000, Cycle 5000 → Draw 575000 → Grace 1000 → Next prep 576000 → Next draw 580000
 */

export class CycleEngine {
  constructor(sendCommand) {
    this.sendCommand = sendCommand;
    this.isActive = false;
    this.currentCycle = null;
    this.cycleHistory = [];
    
    // Cycle phases
    this.PHASES = {
      PREPARATION: 'preparation',      // Setting up for next cycle
      FUNDING: 'funding',             // Funding jackpot
      TIMELOCK: 'timelock',           // Jackpot locked until drawing
      DRAWING_READY: 'drawing_ready', // Ready for drawing
      DRAWING: 'drawing',             // Drawing in progress
      PAYOUT: 'payout',               // Paying out winners
      GRACE_PERIOD: 'grace_period',   // Grace period after payout
      CYCLE_COMPLETE: 'cycle_complete'// Cycle finished
    };
  }

  /**
   * Initialize a new lottery cycle
   * @param {Object} cycleParams - Cycle parameters
   * @returns {Object} New cycle object
   */
  initializeCycle(cycleParams) {
    try {
      console.log('[CycleEngine] Initializing new cycle...');

      const {
        mainLotteryId,
        startBlock,
        drawingCycle,
        gracePeriod,
        confirmations
      } = cycleParams;

      // Calculate cycle blocks
      const start = parseInt(startBlock);
      const cycle = parseInt(drawingCycle);
      const grace = parseInt(gracePeriod) || 1000;

      if (isNaN(start) || isNaN(cycle) || cycle <= 0) {
        throw new Error('Invalid cycle parameters');
      }

      const drawingBlock = start + cycle;
      const graceEndBlock = drawingBlock + grace;
      const nextPrepBlock = graceEndBlock;
      const nextDrawingBlock = nextPrepBlock + cycle;

      const newCycle = {
        id: `cycle_${Date.now()}`,
        mainLotteryId: mainLotteryId,
        
        // Block calculations
        startBlock: start,
        drawingBlock: drawingBlock,
        graceEndBlock: graceEndBlock,
        nextPrepBlock: nextPrepBlock,
        nextDrawingBlock: nextDrawingBlock,
        
        // Cycle parameters
        drawingCycle: cycle,
        gracePeriod: grace,
        confirmations: parseInt(confirmations) || 3,
        
        // State tracking
        phase: this.PHASES.PREPARATION,
        startTime: new Date().toISOString(),
        completedSteps: [],
        errors: [],
        
        // Results
        fundingResult: null,
        timelockResult: null,
        drawingResult: null,
        payoutResult: null
      };

      this.currentCycle = newCycle;
      console.log(`[CycleEngine] Cycle initialized: Draw at block ${drawingBlock}, Next prep at ${nextPrepBlock}`);

      return newCycle;

    } catch (error) {
      console.error('[CycleEngine] Error initializing cycle:', error);
      throw error;
    }
  }

  /**
   * Get current block information
   * @returns {Promise<Object>} Current blockchain status
   */
  async getCurrentBlockInfo() {
    try {
      const blockchainInfo = await this.sendCommand('getblockchaininfo', []);
      return {
        currentBlock: blockchainInfo.blocks || 0,
        networkHeight: blockchainInfo.blocks || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[CycleEngine] Error getting block info:', error);
      return { currentBlock: 0, error: error.message };
    }
  }

  /**
   * Calculate cycle timing and status
   * @param {Object} cycle - Cycle object
   * @param {number} currentBlock - Current blockchain block
   * @returns {Object} Timing analysis
   */
  calculateCycleTiming(cycle, currentBlock) {
    if (!cycle) return null;

    const timing = {
      currentBlock: currentBlock,
      
      // Time to drawing
      blocksToDrawing: Math.max(0, cycle.drawingBlock - currentBlock),
      drawingReady: currentBlock >= cycle.drawingBlock,
      
      // Grace period timing
      blocksToGraceEnd: Math.max(0, cycle.graceEndBlock - currentBlock),
      inGracePeriod: currentBlock >= cycle.drawingBlock && currentBlock < cycle.graceEndBlock,
      gracePeriodEnded: currentBlock >= cycle.graceEndBlock,
      
      // Next cycle timing
      blocksToNextPrep: Math.max(0, cycle.nextPrepBlock - currentBlock),
      nextPrepReady: currentBlock >= cycle.nextPrepBlock,
      
      // Suggested next action
      suggestedAction: this.determineSuggestedAction(cycle, currentBlock)
    };

    return timing;
  }

  /**
   * Determine what action should be taken next
   * @param {Object} cycle - Cycle object
   * @param {number} currentBlock - Current blockchain block
   * @returns {string} Suggested action
   */
  determineSuggestedAction(cycle, currentBlock) {
    const timing = {
      drawingReady: currentBlock >= cycle.drawingBlock,
      inGracePeriod: currentBlock >= cycle.drawingBlock && currentBlock < cycle.graceEndBlock,
      gracePeriodEnded: currentBlock >= cycle.graceEndBlock
    };

    switch (cycle.phase) {
      case this.PHASES.PREPARATION:
        return 'Start funding process';
        
      case this.PHASES.FUNDING:
        return 'Set timelock on jackpot';
        
      case this.PHASES.TIMELOCK:
        if (timing.drawingReady) {
          return 'Perform drawing';
        }
        return `Wait ${cycle.drawingBlock - currentBlock} blocks for drawing`;
        
      case this.PHASES.DRAWING_READY:
        return 'Perform drawing';
        
      case this.PHASES.DRAWING:
        return 'Process payouts';
        
      case this.PHASES.PAYOUT:
        if (timing.inGracePeriod) {
          return 'Wait for grace period to end';
        }
        return 'Grace period ended, prepare next cycle';
        
      case this.PHASES.GRACE_PERIOD:
        if (timing.gracePeriodEnded) {
          return 'Start next cycle';
        }
        return `Wait ${cycle.graceEndBlock - currentBlock} blocks`;
        
      default:
        return 'Unknown phase';
    }
  }

  /**
   * Update cycle phase and log progress
   * @param {string} newPhase - New phase to transition to
   * @param {Object} stepResult - Result from the completed step
   */
  updateCyclePhase(newPhase, stepResult = null) {
    if (!this.currentCycle) {
      console.warn('[CycleEngine] Cannot update phase: No active cycle');
      return;
    }

    const previousPhase = this.currentCycle.phase;
    this.currentCycle.phase = newPhase;

    const stepLog = {
      fromPhase: previousPhase,
      toPhase: newPhase,
      timestamp: new Date().toISOString(),
      result: stepResult
    };

    this.currentCycle.completedSteps.push(stepLog);

    console.log(`[CycleEngine] Phase transition: ${previousPhase} → ${newPhase}`);

    // Store specific results
    if (stepResult) {
      switch (newPhase) {
        case this.PHASES.TIMELOCK:
          this.currentCycle.fundingResult = stepResult;
          break;
        case this.PHASES.DRAWING_READY:
          this.currentCycle.timelockResult = stepResult;
          break;
        case this.PHASES.PAYOUT:
          this.currentCycle.drawingResult = stepResult;
          break;
        case this.PHASES.GRACE_PERIOD:
          this.currentCycle.payoutResult = stepResult;
          break;
      }
    }
  }

  /**
   * Log cycle error
   * @param {string} phase - Phase where error occurred
   * @param {Error} error - Error that occurred
   */
  logCycleError(phase, error) {
    if (!this.currentCycle) return;

    const errorLog = {
      phase: phase,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    this.currentCycle.errors.push(errorLog);
    console.error(`[CycleEngine] Error in ${phase}:`, error);
  }

  /**
   * Complete current cycle and archive it
   * @returns {Object} Completed cycle
   */
  completeCycle() {
    if (!this.currentCycle) {
      console.warn('[CycleEngine] No active cycle to complete');
      return null;
    }

    console.log('[CycleEngine] Completing cycle...');

    this.currentCycle.phase = this.PHASES.CYCLE_COMPLETE;
    this.currentCycle.endTime = new Date().toISOString();
    this.currentCycle.duration = new Date() - new Date(this.currentCycle.startTime);

    // Archive completed cycle
    const completedCycle = { ...this.currentCycle };
    this.cycleHistory.push(completedCycle);

    // Clear current cycle
    this.currentCycle = null;

    console.log(`[CycleEngine] Cycle completed and archived: ${completedCycle.id}`);
    return completedCycle;
  }

  /**
   * Get cycle status summary
   * @param {number} currentBlock - Current blockchain block
   * @returns {Object} Status summary
   */
  getCycleStatus(currentBlock = null) {
    const status = {
      hasActiveCycle: !!this.currentCycle,
      isActive: this.isActive,
      currentCycle: null,
      timing: null,
      historyCount: this.cycleHistory.length
    };

    if (this.currentCycle) {
      status.currentCycle = {
        id: this.currentCycle.id,
        phase: this.currentCycle.phase,
        mainLotteryId: this.currentCycle.mainLotteryId,
        drawingBlock: this.currentCycle.drawingBlock,
        graceEndBlock: this.currentCycle.graceEndBlock,
        nextDrawingBlock: this.currentCycle.nextDrawingBlock,
        completedStepsCount: this.currentCycle.completedSteps.length,
        errorCount: this.currentCycle.errors.length
      };

      if (currentBlock) {
        status.timing = this.calculateCycleTiming(this.currentCycle, currentBlock);
      }
    }

    return status;
  }

  /**
   * Get cycle history
   * @returns {Array} Array of completed cycles
   */
  getCycleHistory() {
    return [...this.cycleHistory];
  }

  /**
   * Clear cycle history
   */
  clearHistory() {
    this.cycleHistory = [];
  }

  /**
   * Emergency cycle reset
   */
  emergencyReset() {
    console.log('[CycleEngine] Emergency reset triggered');
    
    if (this.currentCycle) {
      this.currentCycle.phase = 'EMERGENCY_RESET';
      this.currentCycle.endTime = new Date().toISOString();
      this.cycleHistory.push({ ...this.currentCycle });
    }
    
    this.currentCycle = null;
    this.isActive = false;
  }

  /**
   * Validate cycle parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateCycleParameters(params) {
    const errors = [];

    if (!params.mainLotteryId || !params.mainLotteryId.includes('@')) {
      errors.push('Main Lottery ID must be a valid identity (name@)');
    }

    const startBlock = parseInt(params.startBlock);
    if (isNaN(startBlock) || startBlock <= 0) {
      errors.push('Start Block must be a positive number');
    }

    const drawingCycle = parseInt(params.drawingCycle);
    if (isNaN(drawingCycle) || drawingCycle <= 0) {
      errors.push('Drawing Cycle must be a positive number');
    }

    const gracePeriod = parseInt(params.gracePeriod);
    if (isNaN(gracePeriod) || gracePeriod < 0) {
      errors.push('Grace Period must be a non-negative number');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
} 