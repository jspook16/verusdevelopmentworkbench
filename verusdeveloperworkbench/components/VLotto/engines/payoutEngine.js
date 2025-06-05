/**
 * VLotto Payout Engine
 * 
 * Manages winner payouts and fund distributions
 * Payout Flow: jackpot.shylock@ → payout.shylock@ → Winner Ticket → Grace Period → Next Cycle
 */

import { getVLottoLogger } from '../utils/vlottoLogger.js';

export class PayoutEngine {
  constructor(sendCommand) {
    this.sendCommand = sendCommand;
    this.isActive = false;
    this.currentOperation = null;
    this.payoutHistory = [];
    this.logger = getVLottoLogger();
  }

  /**
   * Calculate payout amounts and distribution
   * @param {string} mainLotteryId - Main lottery identity
   * @param {Object} distributionParams - Distribution parameters from locked values
   * @param {number} totalJackpotAmount - Total jackpot amount available
   * @returns {Object} Payout calculation result
   */
  calculatePayoutDistribution(mainLotteryId, distributionParams, totalJackpotAmount) {
    try {
      this.logger.logPhaseStart('PAYOUT_CALCULATION', `Calculating distribution for ${mainLotteryId}`);
      console.log('[PayoutEngine] Calculating payout distribution...');

      const result = {
        totalJackpot: totalJackpotAmount,
        distributions: {
          winner: { amount: 0, percent: 0 },
          nextJackpot: { amount: 0, percent: 0 },
          operations: { amount: 0, percent: 0 },
          destinations: []
        },
        payoutPlan: []
      };

      // Log starting jackpot balance
      this.logger.logBalanceResult(`jackpot.${mainLotteryId}`, totalJackpotAmount, this.getParentCurrency(mainLotteryId), 'pre-payout balance');

      // Calculate winner payout (remaining after all distributions)
      let remainingForWinner = totalJackpotAmount;

      // Next Jackpot percentage
      const nextJackpotPercent = parseFloat(distributionParams.nextJackpotPercent) || 0;
      if (nextJackpotPercent > 0) {
        const nextJackpotAmount = (totalJackpotAmount * nextJackpotPercent) / 100;
        result.distributions.nextJackpot = {
          amount: nextJackpotAmount,
          percent: nextJackpotPercent,
          destination: distributionParams.nextJackpotValue || `jackpot.${mainLotteryId}`
        };
        remainingForWinner -= nextJackpotAmount;
      }

      // Operations percentage
      const operationsPercent = parseFloat(distributionParams.operationsPercent) || 0;
      if (operationsPercent > 0) {
        const operationsAmount = (totalJackpotAmount * operationsPercent) / 100;
        result.distributions.operations = {
          amount: operationsAmount,
          percent: operationsPercent,
          destination: distributionParams.operationsValue || `operations.${mainLotteryId}`
        };
        remainingForWinner -= operationsAmount;
      }

      // Additional destinations (1-6)
      for (let i = 1; i <= 6; i++) {
        const destName = distributionParams[`destination${i}Name`];
        const destPercent = parseFloat(distributionParams[`destination${i}Percent`]) || 0;
        
        if (destName && destPercent > 0) {
          const destAmount = (totalJackpotAmount * destPercent) / 100;
          result.distributions.destinations.push({
            name: destName,
            amount: destAmount,
            percent: destPercent,
            index: i
          });
          remainingForWinner -= destAmount;
        }
      }

      // Winner gets the remainder
      result.distributions.winner = {
        amount: Math.max(0, remainingForWinner),
        percent: (remainingForWinner / totalJackpotAmount) * 100
      };

      // Create payout execution plan
      this.createPayoutPlan(result, mainLotteryId);

      // Log the calculated distribution
      this.logger.logPayoutDistribution(result);
      this.logger.logPhaseEnd('PAYOUT_CALCULATION', 'SUCCESS', `Winner gets ${result.distributions.winner.amount} (${result.distributions.winner.percent.toFixed(2)}%)`);

      return result;

    } catch (error) {
      this.logger.logError('PAYOUT_CALCULATION', error);
      console.error('[PayoutEngine] Error calculating payout distribution:', error);
      throw error;
    }
  }

  /**
   * Create payout execution plan
   * @param {Object} result - Payout calculation result to modify
   * @param {string} mainLotteryId - Main lottery identity
   */
  createPayoutPlan(result, mainLotteryId) {
    const jackpotId = `jackpot.${mainLotteryId}`;
    const payoutId = `payout.${mainLotteryId}`;

    // Step 1: Transfer total jackpot to payout.shylock@
    result.payoutPlan.push({
      step: 1,
      description: 'Transfer jackpot to payout account',
      from: jackpotId,
      to: payoutId,
      amount: result.totalJackpot,
      purpose: 'staging'
    });

    // Step 2: Distribute from payout.shylock@ to destinations
    if (result.distributions.nextJackpot.amount > 0) {
      result.payoutPlan.push({
        step: 2,
        description: `Next Jackpot (${result.distributions.nextJackpot.percent}%)`,
        from: payoutId,
        to: result.distributions.nextJackpot.destination,
        amount: result.distributions.nextJackpot.amount,
        purpose: 'next_jackpot'
      });
    }

    if (result.distributions.operations.amount > 0) {
      result.payoutPlan.push({
        step: 3,
        description: `Operations (${result.distributions.operations.percent}%)`,
        from: payoutId,
        to: result.distributions.operations.destination,
        amount: result.distributions.operations.amount,
        purpose: 'operations'
      });
    }

    // Additional destinations
    result.distributions.destinations.forEach((dest, index) => {
      result.payoutPlan.push({
        step: 4 + index,
        description: `${dest.name} (${dest.percent}%)`,
        from: payoutId,
        to: dest.name,
        amount: dest.amount,
        purpose: 'destination'
      });
    });

    // Final step: Remaining amount to winner (will be set when winner is determined)
    result.payoutPlan.push({
      step: result.payoutPlan.length + 1,
      description: `Winner Payout (${result.distributions.winner.percent.toFixed(2)}%)`,
      from: payoutId,
      to: null, // To be set when winner is determined
      amount: result.distributions.winner.amount,
      purpose: 'winner'
    });
  }

  /**
   * Execute payout to winner and distributions
   * @param {Object} payoutPlan - Plan from calculatePayoutDistribution
   * @param {string} winnerTicketId - Winner ticket identity
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Payout execution result
   */
  async executePayouts(payoutPlan, winnerTicketId, confirmations = 3) {
    try {
      this.logger.logPhaseStart('PAYOUT_EXECUTION', `Executing payouts for winner ${winnerTicketId}`);
      console.log('[PayoutEngine] Executing payouts...');
      this.isActive = true;
      this.currentOperation = 'payout';

      // Extract mainLotteryId from the first payout step
      const firstStep = payoutPlan.payoutPlan[0];
      let mainLotteryId = '';
      if (firstStep && firstStep.from) {
        // Extract from jackpot.shylock@ or payout.shylock@ format
        const fromParts = firstStep.from.split('.');
        if (fromParts.length > 1) {
          mainLotteryId = fromParts.slice(1).join('.');
        }
      }

      // Set winner in the payout plan
      const winnerStep = payoutPlan.payoutPlan.find(step => step.purpose === 'winner');
      if (winnerStep) {
        winnerStep.to = winnerTicketId;
        this.logger.writeToLog(`🎯 WINNER SET: ${winnerTicketId} will receive ${winnerStep.amount}`);
      }

      const results = [];

      // Execute each payout step
      for (const step of payoutPlan.payoutPlan) {
        console.log(`[PayoutEngine] Executing step ${step.step}: ${step.description}`);

        if (!step.to) {
          this.logger.logWarning('PAYOUT_EXECUTION', `Skipping step ${step.step}: No destination specified`);
          console.warn(`[PayoutEngine] Skipping step ${step.step}: No destination specified`);
          continue;
        }

        try {
          // Log the transaction before sending
          this.logger.logSendCurrency(step.from, step.to, step.amount, this.getParentCurrency(mainLotteryId), step.description);

          // Execute sendcurrency with confirmations using proper format
          const sendResult = await this.sendCommand('sendcurrency', [
            step.from,              // fromaddress
            [{                      // outputs array
              currency: this.getParentCurrency(mainLotteryId),
              amount: step.amount,
              address: step.to,
              memo: `VLotto Payout: ${step.description}`
            }],
            confirmations           // minconf
          ]);

          // Log successful transaction
          this.logger.logTransactionSubmitted('sendcurrency', sendResult, step.description);
          this.logger.logSendCurrency(step.from, step.to, step.amount, this.getParentCurrency(mainLotteryId), step.description, sendResult);

          results.push({
            step: step,
            txid: sendResult,
            success: true,
            timestamp: new Date().toISOString()
          });

          console.log(`[PayoutEngine] Step ${step.step} completed: ${sendResult}`);

          // Add delay between transactions to avoid issues
          if (step.step < payoutPlan.payoutPlan.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (error) {
          this.logger.logError('PAYOUT_EXECUTION', error, `Step ${step.step} failed`);
          console.error(`[PayoutEngine] Step ${step.step} failed:`, error);
          results.push({
            step: step,
            error: error.message,
            success: false,
            timestamp: new Date().toISOString()
          });
          
          // Continue with other steps even if one fails
        }
      }

      const executionResult = {
        success: results.some(r => r.success),
        results: results,
        winnerTicketId: winnerTicketId,
        totalPaidOut: results
          .filter(r => r.success)
          .reduce((sum, r) => sum + r.step.amount, 0),
        failedPayouts: results.filter(r => !r.success),
        timestamp: new Date().toISOString()
      };

      // Wait for payout confirmations if any were successful
      if (executionResult.success) {
        this.logger.writeToLog(`⏳ PAYOUT CONFIRMATION: Waiting for ${results.filter(r => r.success).length} payout confirmations...`);
        try {
          await this.waitForAllPayoutConfirmations(results, confirmations);
          this.logger.writeToLog(`✅ ALL PAYOUTS CONFIRMED: All successful payouts have been confirmed on blockchain`);
        } catch (confirmationError) {
          this.logger.logWarning('PAYOUT_CONFIRMATION', `Some payouts may not have confirmed: ${confirmationError.message}`);
          // Don't fail the entire payout process due to confirmation timeout
          // The transactions may still be processing
        }
      }

      this.payoutHistory.push(executionResult);
      
      const status = executionResult.success ? 'SUCCESS' : 'ERROR';
      const successfulSteps = results.filter(r => r.success).length;
      this.logger.logPhaseEnd('PAYOUT_EXECUTION', status, `${successfulSteps}/${results.length} steps completed, ${executionResult.totalPaidOut} total paid`);
      
      return executionResult;

    } catch (error) {
      this.logger.logError('PAYOUT_EXECUTION', error);
      console.error('[PayoutEngine] Error executing payouts:', error);
      throw error;
    } finally {
      this.isActive = false;
      this.currentOperation = null;
    }
  }

  /**
   * Check payout account balance
   * @param {string} mainLotteryId - Main lottery identity
   * @returns {Promise<Object>} Payout account status
   */
  async checkPayoutAccountBalance(mainLotteryId) {
    try {
      const payoutId = `payout.${mainLotteryId}`;
      this.logger.logBalanceCheck(payoutId, 'payout account check');
      
      const balance = await this.sendCommand('getcurrencybalance', [payoutId]);
      
      const parentCurrency = this.getParentCurrency(mainLotteryId);
      const balanceAmount = balance[parentCurrency] || 0;
      
      this.logger.logBalanceResult(payoutId, balanceAmount, parentCurrency, 'payout account balance');
      
      return {
        payoutId: payoutId,
        balance: balanceAmount,
        currency: parentCurrency,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.logError('PAYOUT_BALANCE_CHECK', error);
      console.error('[PayoutEngine] Error checking payout account balance:', error);
      return {
        error: error.message,
        balance: 0
      };
    }
  }

  /**
   * Emergency payout recovery (manual intervention)
   * @param {string} mainLotteryId - Main lottery identity
   * @param {string} recoveryAddress - Address to send funds to
   * @param {number} amount - Amount to recover
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Recovery result
   */
  async emergencyRecovery(mainLotteryId, recoveryAddress, amount, confirmations = 3) {
    try {
      this.logger.logPhaseStart('EMERGENCY_RECOVERY', `Recovering ${amount} from ${mainLotteryId} to ${recoveryAddress}`);
      console.log('[PayoutEngine] Executing emergency recovery...');
      this.isActive = true;
      this.currentOperation = 'emergency_recovery';

      const payoutId = `payout.${mainLotteryId}`;

      // Log the emergency transaction
      this.logger.logSendCurrency(payoutId, recoveryAddress, amount, this.getParentCurrency(mainLotteryId), 'Emergency Recovery');

      const recoveryResult = await this.sendCommand('sendcurrency', [
        payoutId,               // fromaddress
        [{                      // outputs array
          currency: this.getParentCurrency(mainLotteryId),
          amount: amount,
          address: recoveryAddress,
          memo: 'VLotto Emergency Recovery'
        }],
        confirmations           // minconf
      ]);

      // Log successful recovery
      this.logger.logTransactionSubmitted('sendcurrency', recoveryResult, 'Emergency Recovery');
      this.logger.logSendCurrency(payoutId, recoveryAddress, amount, this.getParentCurrency(mainLotteryId), 'Emergency Recovery', recoveryResult);

      const result = {
        success: true,
        operation: 'emergency_recovery',
        from: payoutId,
        to: recoveryAddress,
        amount: amount,
        txid: recoveryResult,
        timestamp: new Date().toISOString()
      };

      // Wait for recovery confirmation
      this.logger.writeToLog(`⏳ RECOVERY CONFIRMATION: Waiting for emergency recovery confirmation...`);
      try {
        await this.waitForPayoutOperationConfirmation(recoveryResult, confirmations, 'Emergency Recovery');
        this.logger.writeToLog(`✅ RECOVERY CONFIRMED: Emergency recovery confirmed on blockchain`);
      } catch (confirmationError) {
        this.logger.logWarning('RECOVERY_CONFIRMATION', `Recovery confirmation timeout: ${confirmationError.message}`);
        // Don't fail the recovery due to confirmation timeout - transaction may still be processing
      }

      this.payoutHistory.push(result);
      this.logger.logPhaseEnd('EMERGENCY_RECOVERY', 'SUCCESS', `${amount} recovered to ${recoveryAddress}`);
      
      return result;

    } catch (error) {
      this.logger.logError('EMERGENCY_RECOVERY', error);
      console.error('[PayoutEngine] Error in emergency recovery:', error);
      throw error;
    } finally {
      this.isActive = false;
      this.currentOperation = null;
    }
  }

  /**
   * Get parent currency from lottery ID
   * @param {string} lotteryId - Lottery identity like "test.shylock@"
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
   * Get payout engine status
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      currentOperation: this.currentOperation,
      historyCount: this.payoutHistory.length,
      lastPayout: this.payoutHistory[this.payoutHistory.length - 1] || null
    };
  }

  /**
   * Get payout history
   * @returns {Array} History of payout operations
   */
  getHistory() {
    return [...this.payoutHistory];
  }

  /**
   * Clear payout history
   */
  clearHistory() {
    this.payoutHistory = [];
  }

  /**
   * Wait for payout operation confirmation using z_getoperationstatus and gettransaction
   * @param {string} opid - Operation ID from sendcurrency
   * @param {number} requiredConfirmations - Required confirmations
   * @param {string} description - Description for logging
   */
  async waitForPayoutOperationConfirmation(opid, requiredConfirmations, description) {
    let attempts = 0;
    const maxAttempts = 60; // Maximum 5 minutes at 5-second intervals for operation status
    let actualTxid = null;

    this.logger.writeToLog(`🔍 PAYOUT OPERATION: Checking operation ${opid.substring(0,10)}... for ${description}`);

    // Step 1: Wait for operation to complete and get txid
    while (attempts < maxAttempts && !actualTxid) {
      try {
        const operationStatus = await this.sendCommand('z_getoperationstatus', [[opid]]);
        
        if (operationStatus && operationStatus.length > 0) {
          const operation = operationStatus[0];
          
          if (operation.status === 'success' && operation.result && operation.result.txid) {
            actualTxid = operation.result.txid;
            this.logger.writeToLog(`✅ PAYOUT OPERATION SUCCESS: ${opid.substring(0,10)}... completed with txid ${actualTxid.substring(0,10)}...`);
            break;
          } else if (operation.status === 'failed') {
            const error = operation.error || 'Unknown error';
            throw new Error(`Payout operation ${opid} failed: ${error.message || error}`);
          } else if (operation.status === 'executing') {
            this.logger.writeToLog(`⏳ PAYOUT EXECUTING: ${opid.substring(0,10)}... still executing (attempt ${attempts + 1}/${maxAttempts})`);
          }
        }

        attempts++;
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        attempts++;
        this.logger.logWarning('PAYOUT_OPERATION', `Failed to check payout operation status for ${opid}: ${error.message} (attempt ${attempts})`);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Payout operation status timeout for ${opid} after ${maxAttempts} attempts`);
        }
        
        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!actualTxid) {
      throw new Error(`Payout operation ${opid} did not complete within timeout period`);
    }

    // Step 2: Wait for transaction confirmations
    this.logger.writeToLog(`🔗 PAYOUT CONFIRMATIONS: Waiting for ${requiredConfirmations} confirmations on ${actualTxid.substring(0,10)}...`);
    await this.waitForPayoutTransactionConfirmation(actualTxid, requiredConfirmations);
  }

  /**
   * Wait for transaction confirmation using gettransaction (no timeout)
   * @param {string} txid - Transaction ID
   * @param {number} requiredConfirmations - Required confirmations
   */
  async waitForPayoutTransactionConfirmation(txid, requiredConfirmations) {
    let attempts = 0;
    // No timeout - blocks can take a very long time

    while (true) { // Wait indefinitely for confirmations
      try {
        const txInfo = await this.sendCommand('gettransaction', [txid]);
        
        if (txInfo && txInfo.confirmations >= requiredConfirmations) {
          this.logger.writeToLog(`✅ PAYOUT CONFIRMED: ${txid.substring(0,10)}... has ${txInfo.confirmations} confirmations`);
          return true;
        }

        attempts++;
        // Log every attempt for the first 60 attempts (5 minutes), then every 60th attempt (every 5 minutes)
        if (attempts <= 60 || attempts % 60 === 0) {
          this.logger.writeToLog(`⏳ PAYOUT WAITING: ${txid.substring(0,10)}... has ${txInfo?.confirmations || 0}/${requiredConfirmations} confirmations (attempt ${attempts})`);
        }
        
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        attempts++;
        this.logger.logWarning('PAYOUT_CONFIRMATION', `Failed to check payout transaction ${txid}: ${error.message} (attempt ${attempts})`);
        
        // Continue trying even on errors - the transaction may just not be visible yet
        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Wait for all payout confirmations using proper blockchain methods
   * @param {Array} payoutResults - Array of payout execution results
   * @param {number} requiredConfirmations - Required confirmations
   */
  async waitForAllPayoutConfirmations(payoutResults, requiredConfirmations) {
    const successfulResults = payoutResults.filter(r => r.success && r.txid);

    if (successfulResults.length === 0) {
      this.logger.logWarning('PAYOUT_CONFIRMATION', 'No successful payout transactions to confirm');
      return;
    }

    this.logger.writeToLog(`💸 PAYOUT CONFIRMATION: Starting confirmation for ${successfulResults.length} payout operations`);

    // Wait for all payout operations to be confirmed
    for (const result of successfulResults) {
      await this.waitForPayoutOperationConfirmation(
        result.txid, // This is the opid from sendcurrency
        requiredConfirmations,
        result.step.description
      );
    }

    this.logger.writeToLog(`✅ ALL PAYOUTS CONFIRMED: All ${successfulResults.length} payout operations confirmed`);
  }
}