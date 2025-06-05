/**
 * VLotto Funding Engine
 * 
 * Handles jackpot funding with comprehensive logic:
 * 1) Check current jackpot balance vs Jackpot Minimum
 * 2) Revenue distribution (revenue.shylock@ → jackpot.shylock@ + operations.shylock@)
 * 3) Subsidy layers if below minimum: reserves.shylock@ → main ID emergency
 * 4) Growth mode: If jackpot > minimum, only revenue distribution
 * 5) Store final balance for timelock and ticket calculation
 */

import { getVLottoLogger } from '../utils/vlottoLogger.js';

export class FundingEngine {
  constructor(sendCommand) {
    this.sendCommand = sendCommand;
    this.isActive = false;
    this.currentOperation = null;
    this.fundingHistory = [];
    this.logger = getVLottoLogger();
  }

  /**
   * Calculate comprehensive funding requirements and plan
   * @param {string} mainLotteryId - Main lottery identity
   * @param {Object} parameters - Lottery parameters from locked values
   * @returns {Promise<Object>} Complete funding analysis and plan
   */
  async calculateFundingRequirements(mainLotteryId, parameters) {
    try {
      this.logger.logPhaseStart('FUNDING_CALCULATION', `Calculating comprehensive funding for ${mainLotteryId}`);
      console.log('[FundingEngine] Calculating comprehensive funding requirements...');
      
      const result = {
        // Requirements
        jackpotMinimum: parseFloat(parameters.jackpotMinimum) || 1000,
        currentJackpotBalance: 0,
        isGrowthMode: false,
        
        // Revenue distribution percentages
        nextJackpotPercent: parseFloat(parameters.nextJackpotPercent) || 50,
        operationsPercent: parseFloat(parameters.operationsPercent) || 50,
        
        // Source balances
        sources: {
          jackpot: { current: 0, afterRevenue: 0 },
          revenue: { available: 0, toJackpot: 0, toOperations: 0 },
          reserves: { available: 0, allocated: 0 },
          mainId: { available: 0, allocated: 0 },
          mainIdRAddress: { available: 0, allocated: 0, address: null }
        },
        
        // Funding analysis
        needsSubsidy: false,
        subsidyAmount: 0,
        finalJackpotBalance: 0,
        
        // Execution plan
        fundingPlan: [],
        
        // Status flags
        fullyFunded: false,
        shortfall: 0
      };

      // Step 1: Get current jackpot balance
      const jackpotId = `jackpot.${mainLotteryId}`;
      const parentCurrency = this.getParentCurrency(mainLotteryId);
      
      this.logger.logBalanceCheck(jackpotId, 'current jackpot balance check');
      try {
        const jackpotBalance = await this.sendCommand('getcurrencybalance', [jackpotId]);
        result.currentJackpotBalance = jackpotBalance[parentCurrency] || 0;
        result.sources.jackpot.current = result.currentJackpotBalance;
        this.logger.logBalanceResult(jackpotId, result.currentJackpotBalance, parentCurrency, 'current jackpot balance');
      } catch (error) {
        this.logger.logWarning('FUNDING_CALCULATION', `Jackpot ID not found: ${jackpotId} - assuming 0 balance`);
        console.warn('[FundingEngine] Jackpot ID not found, assuming 0 balance');
      }

      // Step 2: Check if we're in growth mode (jackpot > minimum)
      result.isGrowthMode = result.currentJackpotBalance >= result.jackpotMinimum;
      if (result.isGrowthMode) {
        this.logger.writeToLog(`🚀 GROWTH MODE: Current jackpot ${result.currentJackpotBalance} >= minimum ${result.jackpotMinimum}`);
      } else {
        this.logger.writeToLog(`💰 FUNDING MODE: Current jackpot ${result.currentJackpotBalance} < minimum ${result.jackpotMinimum}, subsidy may be needed`);
      }

      // Step 3: Get revenue source balance
      const revenueId = `revenue.${mainLotteryId}`;
      this.logger.logBalanceCheck(revenueId, 'revenue source for distribution');
      try {
        const revenueBalance = await this.sendCommand('getcurrencybalance', [revenueId]);
        result.sources.revenue.available = revenueBalance[parentCurrency] || 0;
        const vrsctestBalance = revenueBalance['VRSCTEST'] || 0;
        
        // Check if revenue source has sufficient VRSCTEST for transaction fees
        if (result.sources.revenue.available > 0 && vrsctestBalance < 0.001) {
          this.logger.logWarning('FUNDING_CALCULATION', `Revenue source ${revenueId} has ${result.sources.revenue.available} ${parentCurrency} but insufficient VRSCTEST (${vrsctestBalance}) for transaction fees`);
          console.warn(`[FundingEngine] Warning: Revenue source has ${parentCurrency} but may lack VRSCTEST for fees`);
        }
        
        this.logger.logBalanceResult(revenueId, result.sources.revenue.available, parentCurrency, `revenue source (${vrsctestBalance} VRSCTEST)`);
      } catch (error) {
        this.logger.logWarning('FUNDING_CALCULATION', `Revenue ID not found: ${revenueId}`);
        console.warn('[FundingEngine] Revenue ID not found:', revenueId);
      }

      // Step 4: Calculate revenue distribution amounts
      if (result.sources.revenue.available > 0) {
        result.sources.revenue.toJackpot = (result.sources.revenue.available * result.nextJackpotPercent) / 100;
        result.sources.revenue.toOperations = (result.sources.revenue.available * result.operationsPercent) / 100;
        
        this.logger.writeToLog(`📊 REVENUE DISTRIBUTION: ${result.sources.revenue.available} → Jackpot: ${result.sources.revenue.toJackpot} (${result.nextJackpotPercent}%), Operations: ${result.sources.revenue.toOperations} (${result.operationsPercent}%)`);
      }

      // Step 5: Calculate jackpot balance after revenue distribution
      result.sources.jackpot.afterRevenue = result.currentJackpotBalance + result.sources.revenue.toJackpot;

      // Step 6: Determine if subsidy is needed (only if not in growth mode AND still below minimum after revenue)
      if (!result.isGrowthMode && result.sources.jackpot.afterRevenue < result.jackpotMinimum) {
        result.needsSubsidy = true;
        result.subsidyAmount = result.jackpotMinimum - result.sources.jackpot.afterRevenue;
        this.logger.writeToLog(`🆘 SUBSIDY NEEDED: ${result.subsidyAmount} to reach minimum (Current after revenue: ${result.sources.jackpot.afterRevenue} < Minimum: ${result.jackpotMinimum})`);
        this.logger.writeToLog(`📐 SUBSIDY CALCULATION: Minimum ${result.jackpotMinimum} - Current after revenue ${result.sources.jackpot.afterRevenue} = Subsidy needed ${result.subsidyAmount}`);
      } else {
        this.logger.writeToLog(`✅ NO SUBSIDY NEEDED: Growth mode or sufficient after revenue (${result.sources.jackpot.afterRevenue} >= ${result.jackpotMinimum})`);
      }

      // Step 6.5: ALWAYS get subsidy source balances as fallback, regardless of mode
      // This ensures R-address and other sources are available if primary funding fails
      this.logger.writeToLog(`🔍 CHECKING FALLBACK SOURCES: Getting subsidy source balances for backup funding`);
      await this.getSubsidySourceBalances(mainLotteryId, result);

      // Step 7: Calculate final jackpot balance
      result.finalJackpotBalance = result.sources.jackpot.afterRevenue + 
        (result.needsSubsidy ? Math.min(result.subsidyAmount, result.sources.reserves.allocated + result.sources.mainId.allocated + result.sources.mainIdRAddress.allocated) : 0);

      // Step 8: Create execution plan
      this.createComprehensiveFundingPlan(result);

      // Step 9: Final validation
      result.fullyFunded = result.finalJackpotBalance >= result.jackpotMinimum;
      result.shortfall = Math.max(0, result.jackpotMinimum - result.finalJackpotBalance);

      // Log comprehensive results
      this.logger.logFundingCalculation(result);
      this.logger.logPhaseEnd('FUNDING_CALCULATION', 'SUCCESS', 
        `Mode: ${result.isGrowthMode ? 'Growth' : 'Funding'}, Final: ${result.finalJackpotBalance}, Funded: ${result.fullyFunded}`);

      return result;

    } catch (error) {
      this.logger.logError('FUNDING_CALCULATION', error);
      console.error('[FundingEngine] Error calculating funding requirements:', error);
      throw error;
    }
  }

  /**
   * Get primary R-address for an identity
   * @param {string} identityId - Identity to get R-address for
   * @returns {Promise<string>} Primary R-address
   */
  async getPrimaryAddressForIdentity(identityId) {
    try {
      const identityData = await this.sendCommand('getidentity', [identityId]);
      if (identityData && identityData.identity && identityData.identity.primaryaddresses && identityData.identity.primaryaddresses.length > 0) {
        return identityData.identity.primaryaddresses[0];
      }
      throw new Error(`Primary R-address not found for ${identityId}`);
    } catch (error) {
      this.logger.logWarning('FUNDING_CALCULATION', `Could not get primary R-address for ${identityId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subsidy source balances (reserves, main ID, and main ID R-address)
   * @param {string} mainLotteryId - Main lottery identity
   * @param {Object} result - Result object to update
   */
  async getSubsidySourceBalances(mainLotteryId, result) {
    const parentCurrency = this.getParentCurrency(mainLotteryId);

    // Initialize new source for main ID R-address
    result.sources.mainIdRAddress = { available: 0, allocated: 0, address: null };

    // Get reserves balance
    const reservesId = `reserves.${mainLotteryId}`;
    this.logger.logBalanceCheck(reservesId, 'reserves subsidy source');
    try {
      const reservesBalance = await this.sendCommand('getcurrencybalance', [reservesId]);
      result.sources.reserves.available = reservesBalance[parentCurrency] || 0;
      const vrsctestBalance = reservesBalance['VRSCTEST'] || 0;
      
      // Check if reserves has sufficient VRSCTEST for transaction fees
      if (result.sources.reserves.available > 0 && vrsctestBalance < 0.001) {
        this.logger.logWarning('FUNDING_CALCULATION', `Reserves source ${reservesId} has ${result.sources.reserves.available} ${parentCurrency} but insufficient VRSCTEST (${vrsctestBalance}) for transaction fees`);
        console.warn(`[FundingEngine] Warning: Reserves has ${parentCurrency} but may lack VRSCTEST for fees`);
      }
      
      this.logger.logBalanceResult(reservesId, result.sources.reserves.available, parentCurrency, `reserves source (${vrsctestBalance} VRSCTEST)`);
    } catch (error) {
      this.logger.logWarning('FUNDING_CALCULATION', `Reserves ID not found: ${reservesId}`);
      console.warn('[FundingEngine] Reserves ID not found:', reservesId);
    }

    // Get main ID balance  
    this.logger.logBalanceCheck(mainLotteryId, 'main ID emergency subsidy source');
    try {
      const mainBalance = await this.sendCommand('getcurrencybalance', [mainLotteryId]);
      result.sources.mainId.available = mainBalance[parentCurrency] || 0;
      const vrsctestBalance = mainBalance['VRSCTEST'] || 0;
      
      // Check if main ID has sufficient VRSCTEST for transaction fees
      if (result.sources.mainId.available > 0 && vrsctestBalance < 0.001) {
        this.logger.logWarning('FUNDING_CALCULATION', `Main ID source ${mainLotteryId} has ${result.sources.mainId.available} ${parentCurrency} but insufficient VRSCTEST (${vrsctestBalance}) for transaction fees`);
        console.warn(`[FundingEngine] Warning: Main ID has ${parentCurrency} but may lack VRSCTEST for fees`);
      }
      
      this.logger.logBalanceResult(mainLotteryId, result.sources.mainId.available, parentCurrency, `main ID source (${vrsctestBalance} VRSCTEST)`);
    } catch (error) {
      this.logger.logWarning('FUNDING_CALCULATION', 'Main ID balance check failed');
      console.warn('[FundingEngine] Main ID balance check failed');
    }

    // Get main ID R-address balance as final fallback
    try {
      const mainIdRAddress = await this.getPrimaryAddressForIdentity(mainLotteryId);
      result.sources.mainIdRAddress.address = mainIdRAddress;
      this.logger.logBalanceCheck(mainIdRAddress, 'main ID R-address final fallback source');
      
      const rAddressBalance = await this.sendCommand('getcurrencybalance', [mainIdRAddress]);
      result.sources.mainIdRAddress.available = rAddressBalance[parentCurrency] || 0;
      const vrsctestBalance = rAddressBalance['VRSCTEST'] || 0;
      
      // Check if R-address has sufficient VRSCTEST for transaction fees
      if (result.sources.mainIdRAddress.available > 0 && vrsctestBalance < 0.001) {
        this.logger.logWarning('FUNDING_CALCULATION', `Main ID R-address ${mainIdRAddress} has ${result.sources.mainIdRAddress.available} ${parentCurrency} but insufficient VRSCTEST (${vrsctestBalance}) for transaction fees`);
        console.warn(`[FundingEngine] Warning: Main ID R-address has ${parentCurrency} but may lack VRSCTEST for fees`);
      }
      
      this.logger.logBalanceResult(mainIdRAddress, result.sources.mainIdRAddress.available, parentCurrency, `main ID R-address final fallback (${vrsctestBalance} VRSCTEST)`);
    } catch (error) {
      this.logger.logWarning('FUNDING_CALCULATION', `Main ID R-address balance check failed: ${error.message}`);
      console.warn('[FundingEngine] Main ID R-address balance check failed:', error);
    }

    // Calculate subsidy allocations
    let remainingSubsidyNeeded = result.subsidyAmount;
    this.logger.writeToLog(`💰 STARTING SUBSIDY ALLOCATION: Need ${remainingSubsidyNeeded} total`);

    // Priority 1: Reserves
    if (remainingSubsidyNeeded > 0 && result.sources.reserves.available > 0) {
      result.sources.reserves.allocated = Math.min(remainingSubsidyNeeded, result.sources.reserves.available);
      remainingSubsidyNeeded -= result.sources.reserves.allocated;
      this.logger.writeToLog(`🏦 RESERVES ALLOCATION: ${result.sources.reserves.allocated} from ${result.sources.reserves.available} available (${remainingSubsidyNeeded} still needed)`);
    }

    // Priority 2: Main ID emergency
    if (remainingSubsidyNeeded > 0 && result.sources.mainId.available > 0) {
      result.sources.mainId.allocated = Math.min(remainingSubsidyNeeded, result.sources.mainId.available);
      remainingSubsidyNeeded -= result.sources.mainId.allocated;
      this.logger.writeToLog(`🚨 MAIN ID EMERGENCY: ${result.sources.mainId.allocated} from ${result.sources.mainId.available} available (${remainingSubsidyNeeded} still needed)`);
    }

    // Priority 3: Main ID R-address final fallback
    if (remainingSubsidyNeeded > 0 && result.sources.mainIdRAddress.available > 0) {
      result.sources.mainIdRAddress.allocated = Math.min(remainingSubsidyNeeded, result.sources.mainIdRAddress.available);
      remainingSubsidyNeeded -= result.sources.mainIdRAddress.allocated;
      this.logger.writeToLog(`🆘 MAIN ID R-ADDRESS FALLBACK: ${result.sources.mainIdRAddress.allocated} from ${result.sources.mainIdRAddress.available} available at ${result.sources.mainIdRAddress.address} (${remainingSubsidyNeeded} still needed)`);
    }

    // Final allocation summary
    const totalAllocated = result.sources.reserves.allocated + result.sources.mainId.allocated + result.sources.mainIdRAddress.allocated;
    this.logger.writeToLog(`📊 SUBSIDY ALLOCATION SUMMARY: Total allocated ${totalAllocated} (Reserves: ${result.sources.reserves.allocated} + Main ID: ${result.sources.mainId.allocated} + R-address: ${result.sources.mainIdRAddress.allocated})`);

    if (remainingSubsidyNeeded > 0) {
      this.logger.logWarning('FUNDING_CALCULATION', `Still short ${remainingSubsidyNeeded} after all subsidy sources`);
    }
  }

  /**
   * Create comprehensive funding execution plan
   * @param {Object} result - Funding calculation result to modify
   */
  createComprehensiveFundingPlan(result) {
    result.fundingPlan = [];
    let stepNumber = 1;

    // Always execute revenue distribution (growth mode or funding mode)
    if (result.sources.revenue.available > 0) {
      // Revenue to jackpot
      if (result.sources.revenue.toJackpot > 0) {
        result.fundingPlan.push({
          step: stepNumber++,
          source: 'revenue',
          destination: 'jackpot',
          amount: result.sources.revenue.toJackpot,
          percentage: result.nextJackpotPercent,
          description: `Revenue to jackpot (${result.nextJackpotPercent}%)`,
          priority: 1,
          required: false  // Changed to false - try but continue if it fails
        });
      }

      // Revenue to operations  
      if (result.sources.revenue.toOperations > 0) {
        result.fundingPlan.push({
          step: stepNumber++,
          source: 'revenue',
          destination: 'operations', 
          amount: result.sources.revenue.toOperations,
          percentage: result.operationsPercent,
          description: `Revenue to operations (${result.operationsPercent}%)`,
          priority: 1,
          required: false  // Changed to false - try but continue if it fails
        });
      }
    }

    // Add fallback steps - ALWAYS add if sources are available, regardless of mode
    // This ensures backup funding if primary revenue distribution fails due to VRSCTEST issues
    
    // Reserves fallback (Priority 2)
    if (result.sources.reserves.available > 0) {
      // Amount will be calculated dynamically during execution based on current jackpot balance
      const maxReservesAmount = Math.min(result.jackpotMinimum, result.sources.reserves.available);
      result.fundingPlan.push({
        step: stepNumber++,
        source: 'reserves',
        destination: 'jackpot',
        amount: maxReservesAmount, // Maximum this source can contribute (actual amount calculated dynamically)
        description: 'Reserves fallback funding (amount calculated dynamically)',
        priority: 2,
        required: false
      });
    }

    // Main ID R-address FINAL emergency fallback (Priority 3) - LAST RESORT
    if (result.sources.mainIdRAddress.available > 0) {
      // Amount will be calculated dynamically during execution based on current jackpot balance
      const maxRAddressAmount = Math.min(result.jackpotMinimum, result.sources.mainIdRAddress.available);
      result.fundingPlan.push({
        step: stepNumber++,
        source: 'mainIdRAddress',
        destination: 'jackpot',
        amount: maxRAddressAmount, // Maximum this source can contribute (actual amount calculated dynamically)
        description: `Main ID R-address FINAL emergency fallback (${result.sources.mainIdRAddress.address}) - amount calculated dynamically`,
        priority: 3,
        required: false
      });
    }

    this.logger.writeToLog(`📋 FUNDING PLAN: ${result.fundingPlan.length} steps created`);
    result.fundingPlan.forEach(step => {
      this.logger.writeToLog(`   Step ${step.step}: ${step.description} - ${step.amount}`);
    });
  }

  /**
   * Execute comprehensive funding plan
   * @param {Object} fundingPlan - Plan from calculateFundingRequirements
   * @param {string} mainLotteryId - Main lottery identity
   * @param {number} confirmations - Required confirmations
   * @returns {Promise<Object>} Complete execution result
   */
  async executeFunding(fundingPlan, mainLotteryId, confirmations = 3) {
    try {
      this.logger.logPhaseStart('FUNDING_EXECUTION', `Executing comprehensive funding for ${mainLotteryId}`);
      console.log('[FundingEngine] Executing comprehensive funding plan...');
      this.isActive = true;
      this.currentOperation = 'comprehensive_funding';

      const results = [];
      const parentCurrency = this.getParentCurrency(mainLotteryId);

      for (const step of fundingPlan.fundingPlan) {
        console.log(`[FundingEngine] Executing step ${step.step}: ${step.description}`);
        
        let sourceId, destinationId;
        
        // Determine source ID
        switch (step.source) {
          case 'revenue':
            sourceId = `revenue.${mainLotteryId}`;
            break;
          case 'reserves':
            sourceId = `reserves.${mainLotteryId}`;
            break;
          case 'mainId':
            sourceId = mainLotteryId;
            break;
          case 'mainIdRAddress':
            // Use the R-address directly for this source
            const mainIdRAddress = await this.getPrimaryAddressForIdentity(mainLotteryId);
            sourceId = mainIdRAddress;
            break;
          default:
            throw new Error(`Unknown funding source: ${step.source}`);
        }

        // Determine destination ID
        switch (step.destination) {
          case 'jackpot':
            destinationId = `jackpot.${mainLotteryId}`;
            break;
          case 'operations':
            destinationId = `operations.${mainLotteryId}`;
            break;
          default:
            throw new Error(`Unknown funding destination: ${step.destination}`);
        }

        try {
          // DYNAMIC AMOUNT CALCULATION: Calculate how much is actually needed right now
          let actualAmount = step.amount;
          
          if (step.destination === 'jackpot') {
            // Get current jackpot balance to calculate actual need
            const currentJackpotBalance = await this.sendCommand('getcurrencybalance', [`jackpot.${mainLotteryId}`]);
            const currentBalance = currentJackpotBalance[parentCurrency] || 0;
            const jackpotMinimum = parseFloat(fundingPlan.jackpotMinimum || 0);
            const stillNeeded = Math.max(0, jackpotMinimum - currentBalance);
            
            // Only send what's actually needed, up to what this source has available
            actualAmount = stillNeeded;
            this.logger.writeToLog(`💰 DYNAMIC CALCULATION: Jackpot has ${currentBalance}, needs ${jackpotMinimum}, shortfall: ${stillNeeded}`);
            
            if (stillNeeded <= 0) {
              this.logger.writeToLog(`✅ JACKPOT ALREADY FUNDED: ${currentBalance} >= ${jackpotMinimum}, skipping step ${step.step}`);
              results.push({
                step: step,
                sourceId: sourceId,
                destinationId: destinationId,
                skipped: true,
                reason: 'Jackpot already adequately funded',
                success: true,
                timestamp: new Date().toISOString()
              });
              continue;
            }
            
            this.logger.writeToLog(`📊 ACTUAL AMOUNT TO SEND: ${actualAmount} ${parentCurrency} to reach minimum`);
          }

          // Validate funding source has both target currency and VRSCTEST for fees
          const validation = await this.validateFundingSourceBalances(sourceId, parentCurrency, actualAmount);
          
          if (!validation.isValid) {
            const errorMessage = `Funding source validation failed for ${sourceId}: ${validation.errors.join(', ')}`;
            this.logger.logError('FUNDING_EXECUTION', new Error(errorMessage), `Step ${step.step}: ${step.description}`);
            console.error(`[FundingEngine] ${errorMessage}`);
            
            results.push({
              step: step,
              sourceId: sourceId,
              destinationId: destinationId,
              error: errorMessage,
              success: false,
              timestamp: new Date().toISOString(),
              validation: validation
            });
            
            // Skip this step and continue with others
            if (step.required) {
              this.logger.logWarning('FUNDING_EXECUTION', `Required step ${step.step} failed validation but continuing with remaining steps`);
            }
            continue;
          }

          // Log successful validation
          this.logger.writeToLog(`✅ FUNDING SOURCE VALIDATED: ${sourceId} has ${validation.targetBalance} ${parentCurrency} and ${validation.vrsctestBalance} VRSCTEST`);

          // Log the transaction before sending
          this.logger.logSendCurrency(sourceId, destinationId, actualAmount, parentCurrency, step.description);

          // Send funds with confirmations using proper sendcurrency format without fee and change address
          const sendResult = await this.sendCommand('sendcurrency', [
            sourceId,           // fromaddress
            [{                  // outputs array
              currency: parentCurrency,
              amount: actualAmount,
              address: destinationId
            }],
            confirmations       // minconf
          ]);

          // Log successful transaction
          this.logger.logTransactionSubmitted('sendcurrency', sendResult, step.description);
          this.logger.logSendCurrency(sourceId, destinationId, actualAmount, parentCurrency, step.description, sendResult);

          results.push({
            step: step,
            sourceId: sourceId,
            destinationId: destinationId,
            txid: sendResult,
            actualAmountSent: actualAmount,
            plannedAmount: step.amount,
            success: true,
            timestamp: new Date().toISOString()
          });

          console.log(`[FundingEngine] Step ${step.step} completed: ${sendResult}`);

        } catch (error) {
          this.logger.logError('FUNDING_EXECUTION', error, `Failed step ${step.step}: ${step.description}`);
          console.error(`[FundingEngine] Failed step ${step.step}:`, error);
          
          results.push({
            step: step,
            sourceId: sourceId,
            destinationId: destinationId,
            error: error.message,
            success: false,
            timestamp: new Date().toISOString()
          });
          
          // Continue with other steps even if one fails, but log the failure
          if (step.required) {
            this.logger.logWarning('FUNDING_EXECUTION', `Required step ${step.step} failed but continuing with remaining steps`);
          }
        }
      }

      // Calculate execution summary
      const successfulSteps = results.filter(r => r.success);
      const failedSteps = results.filter(r => !r.success);
      const totalFunded = successfulSteps.reduce((sum, r) => sum + (r.actualAmountSent || r.step.amount || 0), 0);

      const executionResult = {
        success: successfulSteps.length > 0 || failedSteps.filter(r => r.step.required).length === 0,
        results: results,
        summary: {
          totalSteps: results.length,
          successfulSteps: successfulSteps.length,
          failedSteps: failedSteps.length,
          totalFunded: totalFunded,
          fundingComplete: successfulSteps.length > 0 || failedSteps.filter(r => r.step.required).length === 0
        },
        fundingPlan: fundingPlan,
        timestamp: new Date().toISOString()
      };

      this.fundingHistory.push(executionResult);
      
      const status = executionResult.success ? 'SUCCESS' : 'ERROR';
      this.logger.logPhaseEnd('FUNDING_EXECUTION', status, 
        `Total funded: ${totalFunded}, Steps: ${successfulSteps.length}/${results.length} successful`);
      
      return executionResult;

    } catch (error) {
      this.logger.logError('FUNDING_EXECUTION', error);
      console.error('[FundingEngine] Error executing comprehensive funding:', error);
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
   * Get funding status
   * @returns {Object} Current funding status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      currentOperation: this.currentOperation,
      historyCount: this.fundingHistory.length,
      lastFunding: this.fundingHistory[this.fundingHistory.length - 1] || null
    };
  }

  /**
   * Clear funding history
   */
  clearHistory() {
    this.fundingHistory = [];
  }

  /**
   * Calculate next drawing block based on automation start + drawing interval
   * @param {number} automationStartBlock - Block when automation begins
   * @param {number} drawingInterval - Blocks between drawings
   * @returns {number} Next drawing block
   */
  calculateDrawingBlock(automationStartBlock, drawingInterval) {
    const startBlock = parseInt(automationStartBlock);
    const interval = parseInt(drawingInterval);
    
    if (isNaN(startBlock) || isNaN(interval) || interval <= 0) {
      throw new Error('Invalid automation start block or drawing interval');
    }

    const drawingBlock = startBlock + interval;
    this.logger.writeToLog(`🎯 DRAWING BLOCK CALCULATED: Automation start ${startBlock} + Drawing interval ${interval} = Drawing block ${drawingBlock}`);
    return drawingBlock;
  }

  /**
   * Calculate next drawing block from previous drawing
   * @param {number} lastDrawingBlock - Previous drawing block
   * @param {number} drawingInterval - Blocks between drawings
   * @returns {number} Next drawing block
   */
  calculateNextDrawingBlock(lastDrawingBlock, drawingInterval) {
    const lastBlock = parseInt(lastDrawingBlock);
    const interval = parseInt(drawingInterval);
    
    if (isNaN(lastBlock) || isNaN(interval) || interval <= 0) {
      throw new Error('Invalid last drawing block or drawing interval');
    }

    const nextDrawingBlock = lastBlock + interval;
    this.logger.writeToLog(`🔄 NEXT DRAWING CALCULATED: Last drawing ${lastBlock} + Interval ${interval} = Next drawing ${nextDrawingBlock}`);
    return nextDrawingBlock;
  }

  /**
   * Execute complete funding cycle with timelock integration
   * @param {string} mainLotteryId - Main lottery identity
   * @param {Object} parameters - All lottery parameters
   * @param {Object} timelockEngine - Timelock engine instance
   * @param {number} confirmations - Required confirmations
   * @param {boolean} skipTimelock - Skip timelock functionality for testing
   * @returns {Promise<Object>} Complete funding and timelock result
   */
  async executeCompleteFundingCycle(mainLotteryId, parameters, timelockEngine, confirmations = 3, skipTimelock = false) {
    try {
      this.logger.logPhaseStart('COMPLETE_FUNDING_CYCLE', `Starting complete funding cycle for ${mainLotteryId}`);
      console.log('[FundingEngine] Starting complete funding cycle...');

      const result = {
        phase: 'COMPLETE_FUNDING_CYCLE',
        success: false,
        funding: null,
        timelock: null,
        drawingBlock: 0,
        finalJackpotBalance: 0,
        timestamp: new Date().toISOString()
      };

      // Step 1: Calculate drawing block
      const automationStartBlock = parseInt(parameters.automationStartBlock || parameters.futureBlockNumber);
      const drawingInterval = parseInt(parameters.drawingInterval);
      
      if (!automationStartBlock || !drawingInterval) {
        throw new Error('Missing automation start block or drawing interval in parameters');
      }

      result.drawingBlock = this.calculateDrawingBlock(automationStartBlock, drawingInterval);
      this.logger.writeToLog(`📅 DRAWING BLOCK SET: ${result.drawingBlock}`);

      // Step 2: Calculate funding requirements
      this.logger.writeToLog(`💰 FUNDING PHASE: Calculating requirements...`);
      const fundingPlan = await this.calculateFundingRequirements(mainLotteryId, parameters);
      
      // Step 3: Execute funding
      this.logger.writeToLog(`💸 FUNDING EXECUTION: Executing ${fundingPlan.fundingPlan.length} funding steps...`);
      const fundingResult = await this.executeFunding(fundingPlan, mainLotteryId, confirmations);
      result.funding = {
        plan: fundingPlan,
        execution: fundingResult,
        finalBalance: fundingPlan.finalJackpotBalance
      };
      result.finalJackpotBalance = fundingPlan.finalJackpotBalance;

      if (!fundingResult.success) {
        throw new Error('Funding execution failed - cannot proceed to timelock');
      }

      // Step 4: Wait for funding confirmations
      this.logger.writeToLog(`⏳ FUNDING CONFIRMATION: Waiting for ${confirmations} confirmations...`);
      await this.waitForFundingConfirmations(fundingResult, confirmations);

      // Step 5: Verify jackpot balance after funding confirmation - CRITICAL CHECKPOINT
      this.logger.writeToLog(`🔍 JACKPOT VERIFICATION: Checking jackpot balance after funding...`);
      const verifiedBalance = await this.verifyJackpotBalanceAfterFunding(mainLotteryId, parameters);
      result.verifiedJackpotBalance = verifiedBalance.currentBalance;
      
      if (!verifiedBalance.success) {
        this.logger.logError('COMPLETE_FUNDING_CYCLE', new Error(`VERIFICATION FAILED - STOPPING: ${verifiedBalance.error}`));
        this.logger.logPhaseEnd('COMPLETE_FUNDING_CYCLE', 'CRITICAL_ERROR', 
          `Jackpot verification failed - Process STOPPED`);
        throw new Error(`JACKPOT VERIFICATION FAILED - PROCESS STOPPED: ${verifiedBalance.error}`);
      }

      this.logger.writeToLog(`✅ JACKPOT VERIFICATION PASSED: ${verifiedBalance.currentBalance} - Proceeding to timelock...`);

      if (!skipTimelock) {
        // Step 6: Execute timelock with delay (re-enabled)
        this.logger.writeToLog(`🔒 TIMELOCK PHASE: Setting timelock with 1-block delay...`);
        const timelockResult = await timelockEngine.setJackpotTimelock(
          mainLotteryId, 
          1,  // 1-block delay
          confirmations
        );
        result.timelock = timelockResult;

        if (!timelockResult.success) {
          throw new Error('Timelock execution failed');
        }

        // Step 7: Wait for timelock confirmations  
        this.logger.writeToLog(`⏳ TIMELOCK CONFIRMATION: Waiting for timelock delay confirmation...`);
        await this.waitForTimelockConfirmation(
          timelockResult.txid, 
          `jackpot.${mainLotteryId}`, 
          null,  // No specific block - using delay
          confirmations
        );

        this.logger.logPhaseEnd('COMPLETE_FUNDING_CYCLE', 'SUCCESS', 
          `Jackpot funded: ${result.verifiedJackpotBalance}, Locked with 1-block delay for unlock`);
      } else {
        this.logger.logPhaseEnd('COMPLETE_FUNDING_CYCLE', 'SUCCESS', 
          `Jackpot funded: ${result.verifiedJackpotBalance}, Timelock skipped`);
      }

      result.success = true;
      return result;

    } catch (error) {
      this.logger.logError('COMPLETE_FUNDING_CYCLE', error);
      console.error('[FundingEngine] Error in complete funding cycle:', error);
      throw error;
    }
  }

  /**
   * Wait for funding transaction confirmations using proper blockchain methods
   * @param {Object} fundingResult - Funding execution result
   * @param {number} requiredConfirmations - Required confirmations
   */
  async waitForFundingConfirmations(fundingResult, requiredConfirmations) {
    const successfulResults = fundingResult.results.filter(r => r.success && r.txid);

    if (successfulResults.length === 0) {
      this.logger.logWarning('FUNDING_CONFIRMATION', 'No successful funding transactions to confirm');
      return;
    }

    // Wait for all funding operations to be confirmed
    for (const result of successfulResults) {
      await this.waitForOperationConfirmation(
        result.txid, // This is the opid from sendcurrency
        requiredConfirmations,
        result.step.description
      );
    }

    this.logger.writeToLog(`✅ FUNDING CONFIRMED: All ${successfulResults.length} funding operations confirmed`);
  }

  /**
   * Wait for operation confirmation using z_getoperationstatus and gettransaction
   * @param {string} opid - Operation ID from sendcurrency
   * @param {number} requiredConfirmations - Required confirmations
   * @param {string} description - Description for logging
   */
  async waitForOperationConfirmation(opid, requiredConfirmations, description) {
    let attempts = 0;
    const maxAttempts = 60; // Maximum 5 minutes at 5-second intervals for operation status
    let actualTxid = null;

    this.logger.writeToLog(`🔍 OPERATION STATUS: Checking operation ${opid.substring(0,10)}... for ${description}`);

    // Step 1: Wait for operation to complete and get txid
    while (attempts < maxAttempts && !actualTxid) {
      try {
        const operationStatus = await this.sendCommand('z_getoperationstatus', [[opid]]);
        
        if (operationStatus && operationStatus.length > 0) {
          const operation = operationStatus[0];
          
          if (operation.status === 'success' && operation.result && operation.result.txid) {
            actualTxid = operation.result.txid;
            this.logger.writeToLog(`✅ OPERATION SUCCESS: ${opid.substring(0,10)}... completed with txid ${actualTxid.substring(0,10)}...`);
            break;
          } else if (operation.status === 'failed') {
            const error = operation.error || 'Unknown error';
            throw new Error(`Operation ${opid} failed: ${error.message || error}`);
          } else if (operation.status === 'executing') {
            this.logger.writeToLog(`⏳ OPERATION EXECUTING: ${opid.substring(0,10)}... still executing (attempt ${attempts + 1}/${maxAttempts})`);
          }
        }

        attempts++;
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        attempts++;
        this.logger.logWarning('OPERATION_STATUS', `Failed to check operation status for ${opid}: ${error.message} (attempt ${attempts})`);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Operation status timeout for ${opid} after ${maxAttempts} attempts`);
        }
        
        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!actualTxid) {
      throw new Error(`Operation ${opid} did not complete within timeout period`);
    }

    // Step 2: Wait for transaction confirmations
    this.logger.writeToLog(`🔗 TRANSACTION CONFIRMATIONS: Waiting for ${requiredConfirmations} confirmations on ${actualTxid.substring(0,10)}...`);
    await this.waitForTransactionConfirmation(actualTxid, requiredConfirmations);
  }

  /**
   * Wait for transaction confirmation using gettransaction (no timeout)
   * @param {string} txid - Transaction ID
   * @param {number} requiredConfirmations - Required confirmations
   */
  async waitForTransactionConfirmation(txid, requiredConfirmations) {
    let attempts = 0;
    // No timeout - blocks can take a very long time

    while (true) { // Wait indefinitely for confirmations
      try {
        const txInfo = await this.sendCommand('gettransaction', [txid]);
        
        if (txInfo && txInfo.confirmations >= requiredConfirmations) {
          this.logger.writeToLog(`✅ CONFIRMED: ${txid.substring(0,10)}... has ${txInfo.confirmations} confirmations`);
          return true;
        }

        attempts++;
        // Log every attempt for the first 60 attempts (5 minutes), then every 60th attempt (every 5 minutes)
        if (attempts <= 60 || attempts % 60 === 0) {
          this.logger.writeToLog(`⏳ WAITING: ${txid.substring(0,10)}... has ${txInfo?.confirmations || 0}/${requiredConfirmations} confirmations (attempt ${attempts})`);
        }
        
        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        attempts++;
        this.logger.logWarning('CONFIRMATION_CHECK', `Failed to check transaction ${txid}: ${error.message} (attempt ${attempts})`);
        
        // Continue trying even on errors - the transaction may just not be visible yet
        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Wait for timelock confirmation using gettransaction and identity flags verification
   * @param {string} timelockTxid - Timelock transaction ID from setidentitytimelock
   * @param {string} jackpotId - Jackpot identity to verify timelock was set
   * @param {number|null} expectedTimelockBlock - Expected timelock block (null for delay-based timelock)
   * @param {number} requiredConfirmations - Required confirmations for the transaction
   */
  async waitForTimelockConfirmation(timelockTxid, jackpotId, expectedTimelockBlock, requiredConfirmations) {
    // Step 1: Wait for timelock transaction confirmations (NO TIMEOUT - wait as long as needed)
    this.logger.writeToLog(`🔗 TIMELOCK CONFIRMATIONS: Waiting for ${requiredConfirmations} confirmations on ${timelockTxid.substring(0,10)}...`);
    await this.waitForTransactionConfirmation(timelockTxid, requiredConfirmations);

    // Step 2: Verify timelock was actually set on the identity by checking flags
    this.logger.writeToLog(`🔍 TIMELOCK VERIFICATION: Verifying timelock flags are set on ${jackpotId}`);
    let attempts = 0;
    // NO TIMEOUT - keep trying until timelock is confirmed

    while (true) {
      try {
        const identityInfo = await this.sendCommand('getidentity', [jackpotId]);
        
        if (identityInfo && identityInfo.identity) {
          const flags = identityInfo.identity.flags || 0;
          const hasTimelock = (flags & 2) === 2; // Check if 2nd bit is set
          const actualTimelockBlock = identityInfo.identity.timelock;
          
          this.logger.writeToLog(`🏁 FLAGS CHECK: ${jackpotId} flags=${flags}, hasTimelock=${hasTimelock}, timelockBlock=${actualTimelockBlock}`);
          
          if (hasTimelock && actualTimelockBlock) {
            if (expectedTimelockBlock === null) {
              // Delay-based timelock - verify it has a timelock set
              this.logger.writeToLog(`✅ TIMELOCK VERIFIED: ${jackpotId} locked with delay-based timelock until block ${actualTimelockBlock} (flags=${flags})`);
              return true;
            } else if (actualTimelockBlock === expectedTimelockBlock) {
              // Block-based timelock - verify exact match
              this.logger.writeToLog(`✅ TIMELOCK VERIFIED: ${jackpotId} locked until block ${actualTimelockBlock} as expected (flags=${flags})`);
              return true;
            } else {
              this.logger.logWarning('TIMELOCK_VERIFICATION', `Timelock mismatch: ${jackpotId} locked until ${actualTimelockBlock}, expected ${expectedTimelockBlock} (flags=${flags})`);
            }
          } else {
            this.logger.writeToLog(`⏳ TIMELOCK PENDING: ${jackpotId} timelock not yet active (flags=${flags}, timelock=${actualTimelockBlock}) - continuing to wait...`);
          }
        }

        attempts++;
        // Log every 10 attempts to avoid spam
        if (attempts % 10 === 0) {
          this.logger.writeToLog(`⏳ TIMELOCK VERIFICATION: Still waiting for timelock to be active (attempt ${attempts})`);
        }
        
        // Wait 5 seconds before next verification attempt
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        attempts++;
        this.logger.logWarning('TIMELOCK_VERIFICATION', `Failed to verify timelock for ${jackpotId}: ${error.message} (attempt ${attempts})`);
        
        // Continue trying - no timeout
        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Get funding and timelock status for a lottery
   * @param {string} mainLotteryId - Main lottery identity
   * @returns {Promise<Object>} Combined status
   */
  async getFundingAndTimelockStatus(mainLotteryId) {
    try {
      const jackpotId = `jackpot.${mainLotteryId}`;
      const parentCurrency = this.getParentCurrency(mainLotteryId);

      // Get current jackpot balance
      let currentBalance = 0;
      try {
        const balanceResult = await this.sendCommand('getcurrencybalance', [jackpotId]);
        currentBalance = balanceResult[parentCurrency] || 0;
      } catch (error) {
        this.logger.logWarning('STATUS_CHECK', `Could not get jackpot balance: ${error.message}`);
      }

      // Get timelock status
      let timelockStatus = null;
      try {
        const identityInfo = await this.sendCommand('getidentity', [jackpotId]);
        if (identityInfo && identityInfo.identity) {
          const currentBlock = await this.sendCommand('getblockcount', []);
          timelockStatus = {
            hasTimelock: !!identityInfo.identity.timelock,
            timelockBlock: identityInfo.identity.timelock || null,
            currentBlock: currentBlock,
            blocksRemaining: identityInfo.identity.timelock ? Math.max(0, identityInfo.identity.timelock - currentBlock) : 0,
            isLocked: !!identityInfo.identity.timelock && identityInfo.identity.timelock > currentBlock
          };
        }
      } catch (error) {
        this.logger.logWarning('STATUS_CHECK', `Could not get timelock status: ${error.message}`);
      }

      return {
        jackpotId: jackpotId,
        currentBalance: currentBalance,
        timelock: timelockStatus,
        fundingEngine: this.getStatus(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.logError('STATUS_CHECK', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verify jackpot balance after funding confirmations but before timelock
   * @param {string} mainLotteryId - Main lottery identity
   * @param {Object} parameters - Lottery parameters containing minimum requirements
   * @returns {Promise<Object>} Verification result with current balance and status
   */
  async verifyJackpotBalanceAfterFunding(mainLotteryId, parameters) {
    try {
      const jackpotId = `jackpot.${mainLotteryId}`;
      const parentCurrency = this.getParentCurrency(mainLotteryId);
      const jackpotMinimum = parseFloat(parameters.jackpotMinimum || 0);

      this.logger.logBalanceCheck(jackpotId, 'post-funding verification');

      // Get current jackpot balance
      const balances = await this.sendCommand('getcurrencybalance', [jackpotId]);
      const currentBalance = balances[parentCurrency] || 0;

      const result = {
        success: false,
        jackpotId: jackpotId,
        currentBalance: currentBalance,
        minimumRequired: jackpotMinimum,
        hasMinimum: currentBalance >= jackpotMinimum,
        error: null,
        timestamp: new Date().toISOString()
      };

      if (currentBalance <= 0) {
        result.error = `CRITICAL: Jackpot has no funds after funding (${currentBalance} ${parentCurrency}) - CANNOT PROCEED`;
        this.logger.logError('JACKPOT_VERIFICATION', new Error(result.error));
      } else if (currentBalance < jackpotMinimum) {
        result.error = `CRITICAL: Jackpot below minimum after funding: has ${currentBalance}, needs ${jackpotMinimum} - CANNOT PROCEED`;
        this.logger.logError('JACKPOT_VERIFICATION', new Error(result.error));
      } else {
        result.success = true;
        this.logger.logBalanceResult(jackpotId, currentBalance, parentCurrency, 'post-funding verification PASSED');
        this.logger.writeToLog(`✅ JACKPOT VERIFIED: ${currentBalance} ${parentCurrency} (minimum: ${jackpotMinimum}) - Ready for timelock`);
      }

      return result;

    } catch (error) {
      this.logger.logError('JACKPOT_VERIFICATION', error);
      return {
        success: false,
        error: `Failed to verify jackpot balance: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate that a funding source has both target currency and VRSCTEST for transaction fees
   * @param {string} sourceId - Source identity or address
   * @param {string} targetCurrency - Currency to send (e.g., 'shylock')
   * @param {number} targetAmount - Amount to send
   * @param {number} minVrsctest - Minimum VRSCTEST needed for fees (default 0.001)
   * @returns {Promise<Object>} Validation result with balances and status
   */
  async validateFundingSourceBalances(sourceId, targetCurrency, targetAmount, minVrsctest = 0.001) {
    try {
      this.logger.logBalanceCheck(sourceId, `funding source validation for ${targetAmount} ${targetCurrency}`);
      
      // Get all balances for the source
      const balances = await this.sendCommand('getcurrencybalance', [sourceId]);
      
      const targetBalance = balances[targetCurrency] || 0;
      const vrsctestBalance = balances['VRSCTEST'] || 0;
      
      const hasTargetCurrency = targetBalance >= targetAmount;
      const hasVrsctest = vrsctestBalance >= minVrsctest;
      
      const result = {
        sourceId: sourceId,
        targetCurrency: targetCurrency,
        targetAmount: targetAmount,
        targetBalance: targetBalance,
        vrsctestBalance: vrsctestBalance,
        minVrsctest: minVrsctest,
        hasTargetCurrency: hasTargetCurrency,
        hasVrsctest: hasVrsctest,
        isValid: hasTargetCurrency && hasVrsctest,
        errors: []
      };
      
      if (!hasTargetCurrency) {
        result.errors.push(`Insufficient ${targetCurrency}: has ${targetBalance}, needs ${targetAmount}`);
      }
      
      if (!hasVrsctest) {
        result.errors.push(`Insufficient VRSCTEST for transaction fees: has ${vrsctestBalance}, needs at least ${minVrsctest}`);
      }
      
      // Log the validation result
      if (result.isValid) {
        this.logger.logBalanceResult(sourceId, targetBalance, targetCurrency, `valid funding source (${vrsctestBalance} VRSCTEST for fees)`);
      } else {
        this.logger.logWarning('FUNDING_VALIDATION', `Invalid funding source ${sourceId}: ${result.errors.join(', ')}`);
      }
      
      return result;
      
    } catch (error) {
      this.logger.logError('FUNDING_VALIDATION', error, `Failed to validate funding source ${sourceId}`);
      return {
        sourceId: sourceId,
        targetCurrency: targetCurrency,
        targetAmount: targetAmount,
        isValid: false,
        errors: [`Balance check failed: ${error.message}`]
      };
    }
  }
} 