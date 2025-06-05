/**
 * VLotto Comprehensive Logging System
 * 
 * Logs automation phases, fund movements, and performance metrics
 * with timestamps for production monitoring and audit trails
 */

class VLottoLogger {
  constructor() {
    this.logFile = null;
    this.sessionId = this.generateSessionId();
    this.phaseStartTimes = new Map();
    this.cycleStartTime = null;
    this.logBuffer = [];
    this.isLogging = true;
    
    this.initializeLogging();
  }

  generateSessionId() {
    return `vlotto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeLogging() {
    // Initialize log file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = `vlotto_automation_${timestamp}.log`;
    
    // Write initial log header
    this.writeToLog('='.repeat(80));
    this.writeToLog(`VLotto Automation Log Session: ${this.sessionId}`);
    this.writeToLog(`Started: ${new Date().toISOString()}`);
    this.writeToLog('='.repeat(80));
  }

  writeToLog(message) {
    if (!this.isLogging) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // Add to buffer
    this.logBuffer.push(logEntry);
    
    // Console output for development
    console.log(`[VLottoLog] ${logEntry}`);
    
    // In a real environment, you'd write to file system
    // For browser environment, we'll store in localStorage as backup
    try {
      const existingLogs = localStorage.getItem('vlotto-session-logs') || '';
      localStorage.setItem('vlotto-session-logs', existingLogs + logEntry + '\n');
    } catch (error) {
      console.error('Failed to write to localStorage:', error);
    }
  }

  // === AUTOMATION PHASE LOGGING ===

  logPhaseStart(phase, description = '') {
    this.phaseStartTimes.set(phase, Date.now());
    this.writeToLog(`🔄 PHASE START: ${phase} ${description ? `- ${description}` : ''}`);
  }

  logPhaseEnd(phase, status = 'SUCCESS', details = '') {
    const startTime = this.phaseStartTimes.get(phase);
    const duration = startTime ? Date.now() - startTime : 0;
    const durationStr = this.formatDuration(duration);
    
    const statusIcon = status === 'SUCCESS' ? '✅' : status === 'ERROR' ? '❌' : '⚠️';
    this.writeToLog(`${statusIcon} PHASE END: ${phase} (${durationStr}) - ${status} ${details ? `- ${details}` : ''}`);
    
    this.phaseStartTimes.delete(phase);
  }

  logCycleStart(cycleParams) {
    this.cycleStartTime = Date.now();
    this.writeToLog('🎯 CYCLE START: New lottery cycle initiated');
    this.writeToLog(`   Main Lottery ID: ${cycleParams.mainLotteryId}`);
    this.writeToLog(`   Start Block: ${cycleParams.startBlock}`);
    this.writeToLog(`   Drawing Block: ${cycleParams.startBlock + cycleParams.drawingCycle}`);
    this.writeToLog(`   Grace Period: ${cycleParams.gracePeriod} blocks`);
    this.writeToLog(`   Confirmations: ${cycleParams.confirmations}`);
  }

  logCycleEnd(status = 'SUCCESS', details = '') {
    const duration = this.cycleStartTime ? Date.now() - this.cycleStartTime : 0;
    const durationStr = this.formatDuration(duration);
    
    const statusIcon = status === 'SUCCESS' ? '🏁' : '💥';
    this.writeToLog(`${statusIcon} CYCLE END: (${durationStr}) - ${status} ${details ? `- ${details}` : ''}`);
  }

  // === FUND MOVEMENT LOGGING ===

  async logBalanceCheck(identity, purpose = '') {
    try {
      // This would be called with the actual balance
      this.writeToLog(`💰 BALANCE CHECK: ${identity} ${purpose ? `(${purpose})` : ''} - [Balance to be logged by caller]`);
    } catch (error) {
      this.writeToLog(`❌ BALANCE CHECK FAILED: ${identity} - ${error.message}`);
    }
  }

  logBalanceResult(identity, balance, currency, purpose = '') {
    this.writeToLog(`💰 BALANCE: ${identity} = ${balance} ${currency} ${purpose ? `(${purpose})` : ''}`);
  }

  logFundingCalculation(fundingPlan) {
    this.writeToLog('📊 FUNDING CALCULATION:');
    this.writeToLog(`   Required Amount: ${fundingPlan.requiredAmount}`);
    this.writeToLog(`   Revenue Available: ${fundingPlan.sources.revenue.available} -> Allocated: ${fundingPlan.sources.revenue.allocated}`);
    this.writeToLog(`   Reserves Available: ${fundingPlan.sources.reserves.available} -> Allocated: ${fundingPlan.sources.reserves.allocated}`);
    this.writeToLog(`   Main ID Available: ${fundingPlan.sources.mainId.available} -> Allocated: ${fundingPlan.sources.mainId.allocated}`);
    if (fundingPlan.sources.mainIdRAddress) {
      this.writeToLog(`   Main ID R-Address Available: ${fundingPlan.sources.mainIdRAddress.available} -> Allocated: ${fundingPlan.sources.mainIdRAddress.allocated} (${fundingPlan.sources.mainIdRAddress.address || 'N/A'})`);
    }
    this.writeToLog(`   Fully Funded: ${fundingPlan.fullyFunded} (Shortfall: ${fundingPlan.shortfall})`);
  }

  logSendCurrency(fromAddress, toAddress, amount, currency, purpose = '', txid = null) {
    const status = txid ? '✅' : '🔄';
    this.writeToLog(`${status} SEND: ${fromAddress} -> ${toAddress}`);
    this.writeToLog(`   Amount: ${amount} ${currency}`);
    this.writeToLog(`   Purpose: ${purpose}`);
    if (txid) {
      this.writeToLog(`   TXID: ${txid}`);
    }
  }

  logPayoutDistribution(payoutCalc) {
    this.writeToLog('💸 PAYOUT DISTRIBUTION:');
    this.writeToLog(`   Total Jackpot: ${payoutCalc.totalJackpot}`);
    this.writeToLog(`   Winner: ${payoutCalc.distributions.winner.amount} (${payoutCalc.distributions.winner.percent.toFixed(2)}%)`);
    if (payoutCalc.distributions.nextJackpot.amount > 0) {
      this.writeToLog(`   Next Jackpot: ${payoutCalc.distributions.nextJackpot.amount} (${payoutCalc.distributions.nextJackpot.percent}%) -> ${payoutCalc.distributions.nextJackpot.destination}`);
    }
    if (payoutCalc.distributions.operations.amount > 0) {
      this.writeToLog(`   Operations: ${payoutCalc.distributions.operations.amount} (${payoutCalc.distributions.operations.percent}%) -> ${payoutCalc.distributions.operations.destination}`);
    }
    payoutCalc.distributions.destinations.forEach(dest => {
      this.writeToLog(`   ${dest.name}: ${dest.amount} (${dest.percent}%)`);
    });
  }

  // === TRANSACTION CONFIRMATION LOGGING ===

  logTransactionSubmitted(command, txid, details = '') {
    this.writeToLog(`📤 TX SUBMITTED: ${command} - ${txid} ${details ? `- ${details}` : ''}`);
  }

  logTransactionConfirmed(txid, blockHeight = null, confirmations = null) {
    const blockInfo = blockHeight ? ` at block ${blockHeight}` : '';
    const confInfo = confirmations ? ` (${confirmations} confirmations)` : '';
    this.writeToLog(`✅ TX CONFIRMED: ${txid}${blockInfo}${confInfo}`);
  }

  logTransactionTimeout(txid, attempts, details = '') {
    this.writeToLog(`⏰ TX TIMEOUT: ${txid} after ${attempts} attempts ${details ? `- ${details}` : ''}`);
  }

  // === TICKET OPERATIONS LOGGING ===

  logTicketGeneration(calculatedDrawingBlock, ticketQuantity, mainLotteryId) {
    this.writeToLog('🎫 TICKET GENERATION START:');
    this.writeToLog(`   Drawing Block: ${calculatedDrawingBlock}`);
    this.writeToLog(`   Quantity: ${ticketQuantity}`);
    this.writeToLog(`   Lottery ID: ${mainLotteryId}`);
  }

  logTicketCommitment(ticketName, txid) {
    this.writeToLog(`🎫 TICKET COMMITTED: ${ticketName} - ${txid}`);
  }

  logTicketRegistration(ticketName, txid) {
    this.writeToLog(`🎫 TICKET REGISTERED: ${ticketName} - ${txid}`);
  }

  logTicketFinalization(ticketName, updateTxid, playingNumber) {
    this.writeToLog(`🎫 TICKET FINALIZED: ${ticketName} - ${updateTxid}`);
    this.writeToLog(`   Playing Number: ${playingNumber.substring(0, 16)}...`);
  }

  // === TICKET SIGNATURE LOGGING ===

  logTicketSignatureStart(ticketName, registrationTxid) {
    this.writeToLog(`🔐 SIGNATURE PROCESS START: ${ticketName}`);
    this.writeToLog(`   Registration TXID: ${registrationTxid}`);
  }

  logTicketSelfSignature(ticketName, signature, hash, registrationTxid) {
    this.writeToLog(`🔐 STEP 1 - TICKET SELF-SIGNATURE: ${ticketName}`);
    this.writeToLog(`   Message Signed: ${registrationTxid}`);
    this.writeToLog(`   Signature Hash: ${hash}`);
    this.writeToLog(`   Signature: ${signature.substring(0, 20)}...${signature.substring(signature.length - 10)}`);
    this.writeToLog(`   Full Signature: ${signature}`);
  }

  logProofguardSignature(ticketName, proofguardId, signature, hash, ticketSignature) {
    this.writeToLog(`🔐 STEP 2 - PROOFGUARD SIGNATURE: ${ticketName}`);
    this.writeToLog(`   Proofguard ID: ${proofguardId}`);
    this.writeToLog(`   Message Signed: ${ticketSignature.substring(0, 20)}...${ticketSignature.substring(ticketSignature.length - 10)}`);
    this.writeToLog(`   Playing Number (Hash): ${hash}`);
    this.writeToLog(`   Signature: ${signature.substring(0, 20)}...${signature.substring(signature.length - 10)}`);
    this.writeToLog(`   Full Message Signed: ${ticketSignature}`);
    this.writeToLog(`   Full Signature: ${signature}`);
  }

  logTicketPayloadCreation(ticketName, ticketPayload) {
    this.writeToLog(`📋 TICKET PAYLOAD CREATED: ${ticketName}`);
    this.writeToLog(`   Registration TXID: ${ticketPayload.registration_txid}`);
    this.writeToLog(`   Ticket Validation Hash: ${ticketPayload.ticket_validation.signed_by_ticket_hash}`);
    this.writeToLog(`   Ticket Validation Signature: ${ticketPayload.ticket_validation.signed_by_ticket_signature.substring(0, 20)}...`);
    this.writeToLog(`   Proofguard Acknowledgement Hash: ${ticketPayload.proofguard_acknowledgement.signed_by_proofguard_hash}`);
    this.writeToLog(`   Proofguard Acknowledgement Signature: ${ticketPayload.proofguard_acknowledgement.signed_by_proofguard_signature.substring(0, 20)}...`);
    this.writeToLog(`   Playing Number: ${ticketPayload.playing_number}`);
    this.writeToLog(`   Complete Payload: ${JSON.stringify(ticketPayload, null, 2)}`);
  }

  logUpdateIdentityCall(ticketName, updateArgs, contentMultiMap) {
    this.writeToLog(`🔄 UPDATE IDENTITY CALL: ${ticketName}`);
    this.writeToLog(`   Sub ID Name: ${updateArgs.name}`);
    this.writeToLog(`   Parent: ${updateArgs.parent}`);
    this.writeToLog(`   Source of Funds: ${updateArgs.sourceoffunds}`);
    this.writeToLog(`   Content Multi-Map Keys: ${Object.keys(updateArgs.contentmultimap).length}`);
  }

  logUpdateIdentitySuccess(ticketName, updateTxid) {
    this.writeToLog(`✅ UPDATE IDENTITY SUCCESS: ${ticketName}`);
    this.writeToLog(`   Update TXID: ${updateTxid}`);
  }

  logUpdateIdentityFailure(ticketName, error, updateArgs) {
    this.writeToLog(`❌ UPDATE IDENTITY FAILED: ${ticketName}`);
    this.writeToLog(`   Error: ${error.message || error}`);
    this.writeToLog(`   Update Args Used: ${JSON.stringify(updateArgs, null, 2)}`);
  }

  logSignatureVerificationTest(ticketName, step, identity, signature, message, result) {
    this.writeToLog(`🔍 SIGNATURE VERIFICATION TEST: ${ticketName} - Step ${step}`);
    this.writeToLog(`   Identity: ${identity}`);
    this.writeToLog(`   Message: ${message.substring(0, 30)}...`);
    this.writeToLog(`   Signature: ${signature.substring(0, 20)}...`);
    this.writeToLog(`   Verification Result: ${result ? 'VALID' : 'INVALID'}`);
  }

  logProofguardFundingCheck(proofguardId, balance, currency, beforeAfter = 'before') {
    this.writeToLog(`💰 PROOFGUARD FUNDING ${beforeAfter.toUpperCase()}: ${proofguardId}`);
    this.writeToLog(`   Balance: ${balance} ${currency}`);
  }

  logTicketDataVerification(ticketName, identityData, success) {
    this.writeToLog(`🔍 TICKET DATA VERIFICATION: ${ticketName}`);
    if (success && identityData?.identity?.contentmultimap) {
      const contentKeys = Object.keys(identityData.identity.contentmultimap);
      this.writeToLog(`   ContentMultiMap Keys Found: ${contentKeys.join(', ')}`);
      this.writeToLog(`   Data Successfully Stored: YES`);
      
      // Log the actual VLotto data if found
      try {
        const vlottoKey = contentKeys.find(key => key.includes('vlotto') || key.includes('ticket'));
        if (vlottoKey) {
          const vlottoData = identityData.identity.contentmultimap[vlottoKey];
          this.writeToLog(`   VLotto Data Key: ${vlottoKey}`);
          this.writeToLog(`   VLotto Data Preview: ${JSON.stringify(vlottoData).substring(0, 200)}...`);
        }
      } catch (error) {
        this.writeToLog(`   Error parsing VLotto data: ${error.message}`);
      }
    } else {
      this.writeToLog(`   Data Successfully Stored: NO`);
      this.writeToLog(`   Reason: ${success ? 'No contentmultimap found' : 'Identity query failed'}`);
    }
  }

  logMarketplaceListing(ticketName, offerTxid, price, currency) {
    this.writeToLog(`🛒 MARKETPLACE: ${ticketName} listed for ${price} ${currency} - ${offerTxid}`);
  }

  // === MARKETPLACE OPERATIONS LOGGING ===
  
  logMarketplaceListingStart(totalTickets) {
    this.writeToLog(`🏪 MARKETPLACE LISTING START: Listing ${totalTickets} tickets on marketplace`);
  }
  
  logMarketplaceListingEnd(successCount, failedCount, totalTickets) {
    this.writeToLog(`🏪 MARKETPLACE LISTING END: ${successCount}/${totalTickets} tickets listed successfully (${failedCount} failed)`);
  }
  
  logMarketplaceOfferCreated(ticketName, offerTxid, expiryBlock, amount, currency) {
    this.writeToLog(`🛒 OFFER CREATED: ${ticketName} -> ${amount} ${currency} (expires block ${expiryBlock}) - TXID: ${offerTxid}`);
  }
  
  logMarketplaceOfferFailed(ticketName, error) {
    this.writeToLog(`❌ OFFER FAILED: ${ticketName} - ${error}`);
  }
  
  logMarketplaceMonitoring(currentBlock, expiryBlock, drawingBlock, blocksUntilExpiry, closeOffersTrigger) {
    this.writeToLog(`🔍 MARKETPLACE MONITORING: Block ${currentBlock}`);
    this.writeToLog(`   Offers expire at block: ${expiryBlock} (${blocksUntilExpiry} blocks until expiry)`);
    this.writeToLog(`   Drawing block: ${drawingBlock}`);
    this.writeToLog(`   Close offers trigger: ${closeOffersTrigger} blocks before drawing`);
  }
  
  logOffersExpired(currentBlock, expiryBlock, reason) {
    this.writeToLog(`⏰ OFFERS EXPIRED: Block ${currentBlock} >= expiry block ${expiryBlock} (${reason})`);
  }
  
  // === REVOCATION OPERATIONS LOGGING ===
  
  logRevocationStart(totalTickets, originalRAddress) {
    this.writeToLog(`🗑️ REVOCATION START: Checking ${totalTickets} tickets for unsold status`);
    this.writeToLog(`   Original R-address: ${originalRAddress}`);
  }
  
  logTicketSoldStatus(ticketName, currentRAddress, originalRAddress, isSold) {
    const status = isSold ? 'SOLD' : 'UNSOLD';
    this.writeToLog(`🎫 TICKET ${status}: ${ticketName} (R-address: ${currentRAddress === originalRAddress ? 'unchanged' : 'changed'})`);
  }
  
  logRevocationExecution(ticketName, txid) {
    this.writeToLog(`🗑️ TICKET REVOKED: ${ticketName} - TXID: ${txid}`);
  }
  
  logRevocationSummary(soldCount, revokedCount, errorCount, totalChecked) {
    this.writeToLog(`📊 REVOCATION SUMMARY: ${totalChecked} tickets checked`);
    this.writeToLog(`   Sold tickets: ${soldCount}`);
    this.writeToLog(`   Revoked tickets: ${revokedCount}`);  
    this.writeToLog(`   Error tickets: ${errorCount}`);
  }
  
  // === DRAWING OPERATIONS LOGGING ===
  
  logDrawingStart(drawingBlock, totalTickets, winningHash) {
    this.writeToLog(`🎲 DRAWING START: Block ${drawingBlock}`);
    this.writeToLog(`   Total tickets: ${totalTickets}`);
    this.writeToLog(`   Winning hash: ${winningHash}`);
  }
  
  logTicketVerification(ticketName, isValid, score, matchingPositions) {
    const status = isValid ? '✅' : '❌';
    this.writeToLog(`${status} TICKET VERIFICATION: ${ticketName} (score: ${score}, matches: ${matchingPositions})`);
  }
  
  logTicketFraud(ticketName, fraudType, details) {
    this.writeToLog(`🚨 TICKET FRAUD: ${ticketName} - ${fraudType}: ${details}`);
  }
  
  logDrawingWinner(winnerTicket, score, totalValidTickets) {
    this.writeToLog(`🏆 DRAWING WINNER: ${winnerTicket.name} with score ${score} (out of ${totalValidTickets} valid tickets)`);
  }
  
  logDrawingComplete(winnerTicket, totalTickets, validTickets, fraudTickets) {
    this.writeToLog(`🎯 DRAWING COMPLETE:`);
    this.writeToLog(`   Winner: ${winnerTicket?.name || 'No winner'}`);
    this.writeToLog(`   Total tickets: ${totalTickets}`);
    this.writeToLog(`   Valid tickets: ${validTickets}`);
    this.writeToLog(`   Fraud tickets: ${fraudTickets}`);
  }
  
  // === TIMELOCK OPERATIONS LOGGING ===
  
  logTimelockOperation(operation, identity, result, details = '') {
    const status = result ? '✅' : '❌';
    this.writeToLog(`${status} TIMELOCK ${operation.toUpperCase()}: ${identity} ${details ? `- ${details}` : ''}`);
  }
  
  logJackpotUnlock(identity, unlockTxid, delayBlocks) {
    this.writeToLog(`🔓 JACKPOT UNLOCK: ${identity} - TXID: ${unlockTxid} (${delayBlocks}-block delay)`);
  }
  
  logJackpotUnlockReady(identity, currentBlock, unlockBlock) {
    this.writeToLog(`⏰ JACKPOT UNLOCK READY: ${identity} at block ${unlockBlock} (current: ${currentBlock})`);
  }

  // === PAYOUT OPERATIONS LOGGING ===
  
  logPayoutStart(winnerTicket, totalJackpot, currency) {
    this.writeToLog(`💰 PAYOUT START: Distributing ${totalJackpot} ${currency} jackpot`);
    this.writeToLog(`   Winner: ${winnerTicket}`);
  }
  
  logPayoutCalculation(distributions) {
    this.writeToLog(`🧮 PAYOUT CALCULATION:`);
    this.writeToLog(`   Winner: ${distributions.winner.amount} (${distributions.winner.percent}%)`);
    if (distributions.nextJackpot?.amount > 0) {
      this.writeToLog(`   Next Jackpot: ${distributions.nextJackpot.amount} (${distributions.nextJackpot.percent}%)`);
    }
    if (distributions.operations?.amount > 0) {
      this.writeToLog(`   Operations: ${distributions.operations.amount} (${distributions.operations.percent}%)`);
    }
    distributions.destinations?.forEach(dest => {
      this.writeToLog(`   ${dest.name}: ${dest.amount} (${dest.percent}%)`);
    });
  }
  
  logPayoutTransaction(destination, amount, currency, txid, purpose = '') {
    this.writeToLog(`💸 PAYOUT: ${destination} received ${amount} ${currency} ${purpose ? `(${purpose})` : ''} - TXID: ${txid}`);
  }
  
  logPayoutComplete(totalDistributed, currency, distributionCount) {
    this.writeToLog(`✅ PAYOUT COMPLETE: ${totalDistributed} ${currency} distributed across ${distributionCount} recipients`);
  }
  
  logPayoutError(destination, amount, currency, error, purpose = '') {
    this.writeToLog(`❌ PAYOUT FAILED: ${destination} ${amount} ${currency} ${purpose ? `(${purpose})` : ''} - ${error}`);
  }
  
  // === AUTOMATION CYCLE LOGGING ===
  
  logAutomationCycleStart(params) {
    this.writeToLog(`🚀 AUTOMATION CYCLE START:`);
    this.writeToLog(`   Main Lottery ID: ${params.mainLotteryId}`);
    this.writeToLog(`   Target Drawing Block: ${params.targetDrawingBlock}`);
    this.writeToLog(`   Current Block: ${params.currentBlock}`);
    this.writeToLog(`   Blocks Until Drawing: ${params.targetDrawingBlock - params.currentBlock}`);
  }
  
  logPhaseTransition(fromPhase, toPhase, reason = '') {
    this.writeToLog(`🔄 PHASE TRANSITION: ${fromPhase} → ${toPhase} ${reason ? `(${reason})` : ''}`);
  }
  
  logAutomationComplete(params) {
    this.writeToLog(`🏁 AUTOMATION CYCLE COMPLETE:`);
    this.writeToLog(`   Winner: ${params.winner}`);
    this.writeToLog(`   Total Payout: ${params.totalPayout} ${params.currency}`);
    this.writeToLog(`   Duration: ${this.formatDuration(params.duration)}`);
    this.writeToLog(`   Next Drawing Block: ${params.nextDrawingBlock}`);
  }
  
  logAutomationError(phase, error, context = '') {
    this.writeToLog(`💥 AUTOMATION ERROR in ${phase}:`);
    this.writeToLog(`   Error: ${error.message || error}`);
    if (context) {
      this.writeToLog(`   Context: ${context}`);
    }
  }
  
  // === COMMAND EXECUTION LOGGING ===
  
  logRPCCommand(command, params, context = '') {
    this.writeToLog(`📡 RPC COMMAND: ${command} ${context ? `(${context})` : ''}`);
    if (params && params.length > 0) {
      this.writeToLog(`   Params: ${JSON.stringify(params).substring(0, 200)}${JSON.stringify(params).length > 200 ? '...' : ''}`);
    }
  }
  
  logRPCResponse(command, result, success = true) {
    const status = success ? '✅' : '❌';
    this.writeToLog(`${status} RPC RESPONSE: ${command}`);
    if (result) {
      if (typeof result === 'string' && result.length === 64 && /^[a-f0-9]+$/i.test(result)) {
        this.writeToLog(`   TXID: ${result}`);
      } else if (result.txid) {
        this.writeToLog(`   TXID: ${result.txid}`);
      } else {
        this.writeToLog(`   Result: ${JSON.stringify(result).substring(0, 200)}${JSON.stringify(result).length > 200 ? '...' : ''}`);
      }
    }
  }
  
  logRPCError(command, error, params = []) {
    this.writeToLog(`❌ RPC ERROR: ${command}`);
    this.writeToLog(`   Error: ${error.message || error}`);
    if (params && params.length > 0) {
      this.writeToLog(`   Params: ${JSON.stringify(params).substring(0, 200)}${JSON.stringify(params).length > 200 ? '...' : ''}`);
    }
  }

  // === ERROR LOGGING ===

  logError(context, error, details = '') {
    this.writeToLog(`❌ ERROR in ${context}: ${error.message}`);
    if (details) {
      this.writeToLog(`   Details: ${details}`);
    }
    if (error.stack) {
      this.writeToLog(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
    }
  }

  logWarning(context, message, details = '') {
    this.writeToLog(`⚠️ WARNING in ${context}: ${message} ${details ? `- ${details}` : ''}`);
  }

  // === BLOCKCHAIN STATUS LOGGING ===

  logBlockchainStatus(currentBlock, networkHeight = null) {
    const syncInfo = networkHeight ? ` (network: ${networkHeight})` : '';
    this.writeToLog(`⛓️ BLOCKCHAIN: Block ${currentBlock}${syncInfo}`);
  }

  logDrawingReadiness(drawingBlock, currentBlock, isReady) {
    const blocksRemaining = drawingBlock - currentBlock;
    const status = isReady ? '🎯 READY FOR DRAWING' : `⏳ WAITING (${blocksRemaining} blocks)`;
    this.writeToLog(`${status}: Drawing at block ${drawingBlock}`);
  }

  // === UTILITY METHODS ===

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // === LOG EXPORT METHODS ===

  exportLogBuffer() {
    return this.logBuffer.join('\n');
  }

  downloadLog() {
    try {
      const logContent = this.exportLogBuffer();
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = this.logFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.writeToLog('📥 Log file downloaded');
    } catch (error) {
      this.writeToLog(`❌ Failed to download log: ${error.message}`);
    }
  }

  clearLogs() {
    this.logBuffer = [];
    localStorage.removeItem('vlotto-session-logs');
    this.writeToLog('🗑️ Logs cleared');
  }

  // === STATISTICS METHODS ===

  generatePhaseStatistics() {
    // This would analyze the log buffer for phase timing statistics
    this.writeToLog('📈 PHASE STATISTICS:');
    // Implementation would parse log entries and calculate averages
  }

  generateFundingAudit() {
    // This would analyze all fund movements
    this.writeToLog('🔍 FUNDING AUDIT:');
    // Implementation would track all balance changes and movements
  }
}

// Singleton instance
let vlottoLogger = null;

export const getVLottoLogger = () => {
  if (!vlottoLogger) {
    vlottoLogger = new VLottoLogger();
  }
  return vlottoLogger;
};

export const initializeVLottoLogging = () => {
  vlottoLogger = new VLottoLogger();
  return vlottoLogger;
};

export default { getVLottoLogger, initializeVLottoLogging }; 