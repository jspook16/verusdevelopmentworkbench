/**
 * VLotto Timelock Management Engine
 * 
 * Manages setidentitytimelock operations for security.shylock@ until drawing block
 * Ensures funds cannot be accessed until the proper drawing time
 */

import { getVLottoLogger } from '../utils/vlottoLogger.js';

export class TimelockEngine {
  constructor(sendCommand) {
    this.sendCommand = sendCommand;
    this.isActive = false;
    this.currentOperation = null;
    this.timelockHistory = [];
    this.activeTimelocks = new Map(); // Track active timelocks
    this.logger = getVLottoLogger();
  }

  /**
   * Get primary R-address for an identity (needed for sourceoffunds)
   * @param {string} identityId - Identity to get R-address for
   * @returns {Promise<string>} Primary R-address
   */
  async getPrimaryAddressForIdentity(identityId) {
    try {
      const identityData = await this.sendCommand('getidentity', [identityId]);
      if (identityData?.identity?.primaryaddresses?.[0]) {
        return identityData.identity.primaryaddresses[0];
      }
      throw new Error(`No primary address found for identity ${identityId}`);
    } catch (error) {
      console.error(`[TimelockEngine] Error getting primary address for ${identityId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate timelock block for jackpot security
   * @param {number} startBlock - Automation start block
   * @param {number} drawingCycle - Blocks between drawings
   * @returns {number} Target drawing block
   */
  calculateDrawingBlock(startBlock, drawingCycle) {
    const start = parseInt(startBlock);
    const cycle = parseInt(drawingCycle);
    
    if (isNaN(start) || isNaN(cycle) || cycle <= 0) {
      throw new Error('Invalid start block or drawing cycle');
    }

    const drawingBlock = start + cycle;
    this.logger.writeToLog(`🧮 DRAWING BLOCK CALCULATED: ${start} + ${cycle} = ${drawingBlock}`);
    return drawingBlock;
  }

  /**
   * Set timelock delay on jackpot.shylock@ (locks immediately with 1-block delay for unlock)
   * @param {string} mainLotteryId - Main lottery identity
   * @param {number} unlockDelay - Number of blocks delay for unlock (default 1)
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Timelock operation result
   */
  async setJackpotTimelock(mainLotteryId, unlockDelay = 1, confirmations = 3) {
    try {
      this.logger.logPhaseStart('TIMELOCK_SET', `Setting timelock delay for ${mainLotteryId}`);
      console.log('[TimelockEngine] Setting jackpot timelock with delay...');
      this.isActive = true;
      this.currentOperation = 'timelock';

      const jackpotId = `jackpot.${mainLotteryId}`;
      const delayBlocks = parseInt(unlockDelay);

      if (isNaN(delayBlocks) || delayBlocks < 1) {
        throw new Error('Invalid unlock delay - must be at least 1 block');
      }

      // Get current block for logging
      const blockchainInfo = await this.sendCommand('getblockchaininfo', []);
      const currentBlock = blockchainInfo.blocks || 0;

      this.logger.logBlockchainStatus(currentBlock);

      console.log(`[TimelockEngine] Setting timelock delay: ${jackpotId} with ${delayBlocks} block delay`);

      // Get sourceoffunds from main lottery ID's primary R-address
      // mainLotteryId already includes @ (e.g., "shylock@"), so don't add another @
      const mainIdWithAt = mainLotteryId.includes('@') ? mainLotteryId : `${mainLotteryId}@`;
      const sourceRAddress = await this.getPrimaryAddressForIdentity(mainIdWithAt);
      console.log(`[TimelockEngine] Using sourceoffunds: ${sourceRAddress}`);

      // Execute setidentitytimelock command with unlock delay
      const timelockResult = await this.sendCommand('setidentitytimelock', [
        jackpotId,                        // identity
        { setunlockdelay: delayBlocks },  // timelock_options object with delay
        false,                            // returntx (false = submit transaction)
        0.001,                            // feeoffer (small transaction fee)
        sourceRAddress                    // sourceoffunds - primary R-address of main lottery ID
      ]);

      // Log the timelock operation
      this.logger.logTransactionSubmitted('setidentitytimelock', timelockResult, `Timelock ${jackpotId} with ${delayBlocks} block delay`);
      this.logger.logTimelockSet(jackpotId, `delay:${delayBlocks}`, currentBlock, timelockResult);

      const result = {
        success: true,
        jackpotId: jackpotId,
        unlockDelay: delayBlocks,
        currentBlock: currentBlock,
        isDelayLock: true,
        txid: timelockResult,
        timestamp: new Date().toISOString(),
        confirmations: confirmations
      };

      // Track active timelock
      this.activeTimelocks.set(jackpotId, {
        unlockDelay: delayBlocks,
        setAt: currentBlock,
        txid: timelockResult,
        isDelayLock: true
      });

      this.timelockHistory.push(result);
      this.logger.logPhaseEnd('TIMELOCK_SET', 'SUCCESS', `Timelock delay set: ${delayBlocks} blocks`);
      console.log(`[TimelockEngine] Timelock delay set successfully: ${timelockResult}`);

      return result;

    } catch (error) {
      this.logger.logError('TIMELOCK_SET', error);
      console.error('[TimelockEngine] Error setting timelock:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.timelockHistory.push(errorResult);
      this.logger.logPhaseEnd('TIMELOCK_SET', 'ERROR', error.message);
      throw error;
      
    } finally {
      this.isActive = false;
      this.currentOperation = null;
    }
  }

  /**
   * Check if jackpot timelock is ready for drawing
   * @param {string} mainLotteryId - Main lottery identity
   * @returns {Promise<Object>} Timelock status
   */
  async checkTimelockStatus(mainLotteryId) {
    try {
      const jackpotId = `jackpot.${mainLotteryId}`;
      
      // Get current blockchain info
      const blockchainInfo = await this.sendCommand('getblockchaininfo', []);
      const currentBlock = blockchainInfo.blocks || 0;

      // Get identity info to check timelock
      const identityInfo = await this.sendCommand('getidentity', [jackpotId]);
      
      const status = {
        jackpotId: jackpotId,
        currentBlock: currentBlock,
        hasTimelock: false,
        timelockBlock: null,
        isUnlocked: false,
        blocksRemaining: 0,
        readyForDrawing: false
      };

      if (identityInfo && identityInfo.identity && identityInfo.identity.timelock) {
        status.hasTimelock = true;
        status.timelockBlock = identityInfo.identity.timelock;
        status.blocksRemaining = Math.max(0, status.timelockBlock - currentBlock);
        status.isUnlocked = currentBlock >= status.timelockBlock;
        status.readyForDrawing = status.isUnlocked;
        
        // Log the timelock status
        this.logger.logTimelockStatus(jackpotId, status.isUnlocked, status.blocksRemaining);
        this.logger.logDrawingReadiness(status.timelockBlock, currentBlock, status.readyForDrawing);
      } else {
        // No timelock means it's always ready (but this might be a security issue)
        status.readyForDrawing = true;
        this.logger.logWarning('TIMELOCK_STATUS', `No timelock found for ${jackpotId} - always ready but potentially insecure`);
      }

      return status;

    } catch (error) {
      this.logger.logError('TIMELOCK_STATUS', error);
      console.error('[TimelockEngine] Error checking timelock status:', error);
      return {
        error: error.message,
        readyForDrawing: false
      };
    }
  }

  /**
   * Remove timelock from jackpot (typically after drawing is complete)
   * @param {string} mainLotteryId - Main lottery identity
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Unlock operation result
   */
  async removeJackpotTimelock(mainLotteryId, confirmations = 3) {
    try {
      this.logger.logPhaseStart('TIMELOCK_REMOVE', `Removing timelock for ${mainLotteryId}`);
      console.log('[TimelockEngine] Removing jackpot timelock...');
      this.isActive = true;
      this.currentOperation = 'unlock';

      const jackpotId = `jackpot.${mainLotteryId}`;

      // Get sourceoffunds from main lottery ID's primary R-address
      // mainLotteryId already includes @ (e.g., "shylock@"), so don't add another @
      const mainIdWithAt = mainLotteryId.includes('@') ? mainLotteryId : `${mainLotteryId}@`;
      const sourceRAddress = await this.getPrimaryAddressForIdentity(mainIdWithAt);
      console.log(`[TimelockEngine] Using sourceoffunds: ${sourceRAddress}`);

      // Set timelock to 0 to remove it using correct JSON object format
      const unlockResult = await this.sendCommand('setidentitytimelock', [
        jackpotId,                     // identity
        { unlockatblock: 0 },          // timelock_options object (0 = remove timelock)
        false,                         // returntx (false = submit transaction)
        0.001,                         // feeoffer (small transaction fee)
        sourceRAddress                 // sourceoffunds - primary R-address of main lottery ID
      ]);

      this.logger.logTransactionSubmitted('setidentitytimelock', unlockResult, `Remove timelock from ${jackpotId}`);

      const result = {
        success: true,
        jackpotId: jackpotId,
        operation: 'unlock',
        txid: unlockResult,
        timestamp: new Date().toISOString()
      };

      // Remove from active timelocks tracking
      this.activeTimelocks.delete(jackpotId);

      this.timelockHistory.push(result);
      this.logger.logPhaseEnd('TIMELOCK_REMOVE', 'SUCCESS', `Timelock removed from ${jackpotId}`);
      console.log(`[TimelockEngine] Timelock removed successfully: ${unlockResult}`);

      return result;

    } catch (error) {
      this.logger.logError('TIMELOCK_REMOVE', error);
      console.error('[TimelockEngine] Error removing timelock:', error);
      
      const errorResult = {
        success: false,
        operation: 'unlock',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.timelockHistory.push(errorResult);
      this.logger.logPhaseEnd('TIMELOCK_REMOVE', 'ERROR', error.message);
      throw error;
      
    } finally {
      this.isActive = false;
      this.currentOperation = null;
    }
  }

  /**
   * Unlock jackpot by setting unlockatblock to 0 (starts the delay countdown)
   * @param {string} mainLotteryId - Main lottery identity
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Unlock operation result
   */
  async unlockJackpotAfterDrawing(mainLotteryId, confirmations = 3) {
    try {
      this.logger.logPhaseStart('TIMELOCK_UNLOCK', `Starting unlock countdown for ${mainLotteryId}`);
      console.log('[TimelockEngine] Starting jackpot unlock countdown...');
      this.isActive = true;
      this.currentOperation = 'unlock';

      const jackpotId = `jackpot.${mainLotteryId}`;

      // Get current blockchain info
      const blockchainInfo = await this.sendCommand('getblockchaininfo', []);
      const currentBlock = blockchainInfo.blocks || 0;

      console.log(`[TimelockEngine] Starting unlock countdown: ${jackpotId} at block ${currentBlock}`);

      // Get sourceoffunds from main lottery ID's primary R-address
      // mainLotteryId already includes @ (e.g., "shylock@"), so don't add another @
      const mainIdWithAt = mainLotteryId.includes('@') ? mainLotteryId : `${mainLotteryId}@`;
      const sourceRAddress = await this.getPrimaryAddressForIdentity(mainIdWithAt);
      console.log(`[TimelockEngine] Using sourceoffunds: ${sourceRAddress}`);

      // Execute setidentitytimelock with unlockatblock: 0 to start delay countdown
      const unlockResult = await this.sendCommand('setidentitytimelock', [
        jackpotId,                        // identity
        { unlockatblock: 0 },            // timelock_options object - starts delay countdown
        false,                            // returntx (false = submit transaction)
        0.001,                            // feeoffer (small transaction fee)
        sourceRAddress                    // sourceoffunds - primary R-address of main lottery ID
      ]);

      // Log the unlock operation
      this.logger.logTransactionSubmitted('setidentitytimelock', unlockResult, `Start unlock countdown ${jackpotId}`);

      const result = {
        success: true,
        jackpotId: jackpotId,
        currentBlock: currentBlock,
        unlockStartedAt: currentBlock,
        willUnlockAt: currentBlock + 1, // 1 block delay
        txid: unlockResult,
        timestamp: new Date().toISOString(),
        confirmations: confirmations
      };

      // Update active timelock status
      const activeTimelock = this.activeTimelocks.get(jackpotId);
      if (activeTimelock) {
        activeTimelock.unlockStarted = true;
        activeTimelock.unlockStartedAt = currentBlock;
        activeTimelock.willUnlockAt = currentBlock + 1;
      }

      this.timelockHistory.push(result);
      this.logger.logPhaseEnd('TIMELOCK_UNLOCK', 'SUCCESS', `Unlock countdown started for ${jackpotId}, will unlock at block ${currentBlock + 1}`);
      console.log(`[TimelockEngine] Unlock countdown started successfully: ${unlockResult}`);

      return result;

    } catch (error) {
      this.logger.logError('TIMELOCK_UNLOCK', error);
      console.error('[TimelockEngine] Error starting unlock countdown:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.timelockHistory.push(errorResult);
      this.logger.logPhaseEnd('TIMELOCK_UNLOCK', 'ERROR', error.message);
      throw error;
      
    } finally {
      this.isActive = false;
      this.currentOperation = null;
    }
  }

  /**
   * Set timelock for next cycle (after payout completion)
   * @param {string} mainLotteryId - Main lottery identity
   * @param {number} drawingBlock - Previous drawing block
   * @param {number} gracePeriod - Grace period in blocks
   * @param {number} drawingCycle - Drawing cycle length
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Next cycle timelock result
   */
  async setNextCycleTimelock(mainLotteryId, drawingBlock, gracePeriod, drawingCycle, confirmations = 3) {
    try {
      // Calculate next drawing block: Drawing Block + Grace Period + Drawing Cycle
      const nextPrepBlock = drawingBlock + gracePeriod;
      const nextDrawingBlock = nextPrepBlock + drawingCycle;

      this.logger.writeToLog(`🔄 NEXT CYCLE TIMELOCK: Previous draw ${drawingBlock} + Grace ${gracePeriod} + Cycle ${drawingCycle} = Next draw ${nextDrawingBlock}`);
      console.log(`[TimelockEngine] Setting next cycle timelock for block ${nextDrawingBlock}`);

      return await this.setJackpotTimelock(mainLotteryId, nextDrawingBlock, confirmations);

    } catch (error) {
      this.logger.logError('NEXT_CYCLE_TIMELOCK', error);
      console.error('[TimelockEngine] Error setting next cycle timelock:', error);
      throw error;
    }
  }

  /**
   * Get timelock engine status
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      currentOperation: this.currentOperation,
      activeTimelocksCount: this.activeTimelocks.size,
      activeTimelocks: Array.from(this.activeTimelocks.entries()).map(([id, data]) => ({
        jackpotId: id,
        ...data
      })),
      historyCount: this.timelockHistory.length,
      lastOperation: this.timelockHistory[this.timelockHistory.length - 1] || null
    };
  }

  /**
   * Get timelock history
   * @returns {Array} History of timelock operations
   */
  getHistory() {
    return [...this.timelockHistory];
  }

  /**
   * Clear timelock history
   */
  clearHistory() {
    this.timelockHistory = [];
  }

  /**
   * Clear active timelocks tracking (for reset)
   */
  clearActiveTimelocks() {
    this.activeTimelocks.clear();
  }
} 