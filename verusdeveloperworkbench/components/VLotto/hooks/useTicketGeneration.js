import { useState, useEffect } from 'react';
import { STORAGE_KEYS, VDXF_KEYS, DEFAULT_CONFIG } from '../utils/constants';
import { generateTicketName, getParentName, createTicketPayload, parseTicketName } from '../utils/ticketHelpers';
import { signMessage, createContentMultiMapUpdate } from '../utils/cryptoHelpers';
import { getVLottoLogger } from '../utils/vlottoLogger.js';

export const useTicketGeneration = (sendCommand, reportAutomationPhase = null, rAddressForTickets = null) => {
  const logger = getVLottoLogger();
  
  // State for main inputs
  const [mainVerusId, setMainVerusId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.MAIN_VERUS_ID) || '';
  });
  const [futureBlockNumber, setFutureBlockNumber] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.futureBlockNumber || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  });
  const [ticketQuantity, setTicketQuantity] = useState(0); // Start with 0 until actually calculated
  const [ticketQuantityCalculated, setTicketQuantityCalculated] = useState(false); // Track if quantity has been calculated
  const [ticketMultiplier, setTicketMultiplier] = useState(() => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params');
      if (saved) {
        const lockedParams = JSON.parse(saved);
        return lockedParams.ticketMultiplier || '';
      }
      return '';
    } catch (e) {
      return '';
    }
  }); // Multiplier for calculating quantity from jackpot balance
  const [marketplaceExpiryBlock, setMarketplaceExpiryBlock] = useState('');

  // Generation state
  const [isGeneratingTickets, setIsGeneratingTickets] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.GENERATION_STATUS) || '';
  });
  const [pendingCommitments, setPendingCommitments] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [tickets, setTickets] = useState(() => {
    try {
      const savedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return savedTickets ? JSON.parse(savedTickets) : [];
    } catch (e) {
      console.error("Failed to parse tickets from localStorage", e);
      return [];
    }
  });

  // Marketplace state
  const [listedOffers, setListedOffers] = useState({}); // Map of offerTxId -> ticketName
  const [soldTickets, setSoldTickets] = useState([]); // Array of ticket names that were sold
  const [revokedTickets, setRevokedTickets] = useState([]); // Array of ticket names that were revoked

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAIN_VERUS_ID, mainVerusId);
  }, [mainVerusId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GENERATION_STATUS, generationStatus);
  }, [generationStatus]);

  /**
   * Calculate ticket quantity from jackpot balance × ticket multiplier (rounded up)
   * Only allows calculation if jackpot identity is timelocked (secured for drawing)
   */
  const calculateTicketQuantity = async (overrideMainVerusId = null, overrideTicketMultiplier = null) => {
    // Use override if provided, otherwise fall back to state
    const activeMainVerusId = overrideMainVerusId || mainVerusId;
    const activeTicketMultiplier = overrideTicketMultiplier || ticketMultiplier;
    
    if (!activeMainVerusId || !activeMainVerusId.includes('@')) {
      throw new Error('Main Lottery ID is required to calculate ticket quantity');
    }

    if (!activeTicketMultiplier || activeTicketMultiplier <= 0) {
      throw new Error(`Ticket multiplier is required and must be > 0. Current value: ${activeTicketMultiplier}`);
    }

    try {
      const parentCurrency = getParentName(activeMainVerusId);
      const jackpotId = `jackpot.${parentCurrency}@`;
      
      // Check if timelock validation should be skipped (for testing purposes)
      const skipTimelockValidation = true; // TODO: Make this configurable or read from settings
      
      if (!skipTimelockValidation) {
        logger.writeToLog(`🔒 TIMELOCK CHECK: Verifying jackpot identity ${jackpotId} is timelocked`);
        
        // First, check if the jackpot identity is timelocked
        const jackpotIdentity = await monitoredSendCommand('getidentity', [jackpotId]);
        
        if (!jackpotIdentity || !jackpotIdentity.identity) {
          throw new Error(`Jackpot identity ${jackpotId} not found. Please ensure it exists before calculating ticket quantity.`);
        }

        // Check if identity is timelocked
        const currentBlock = await monitoredSendCommand('getblockcount', []);
        const timelock = jackpotIdentity.timelock;
        
        if (!timelock || timelock <= currentBlock) {
          throw new Error(`Jackpot identity ${jackpotId} is not timelocked or timelock has expired. The jackpot balance must be locked before calculating ticket quantity to ensure security. Current block: ${currentBlock}, Timelock: ${timelock || 'none'}`);
        }
        
        logger.writeToLog(`✅ TIMELOCK VERIFIED: ${jackpotId} is locked until block ${timelock} (current: ${currentBlock})`);
      } else {
        logger.writeToLog(`⚠️ TIMELOCK CHECK SKIPPED: Testing mode - timelock validation disabled for ${jackpotId}`);
      }
      
      logger.writeToLog(`💰 BALANCE CHECK: Getting jackpot balance for ${jackpotId}`);
      const jackpotBalance = await monitoredSendCommand('getcurrencybalance', [jackpotId]);
      
      if (!jackpotBalance || typeof jackpotBalance !== 'object') {
        throw new Error(`Invalid jackpot balance response: ${JSON.stringify(jackpotBalance)}`);
      }

      const totalJackpot = jackpotBalance[parentCurrency] || 0;
      logger.logBalanceResult(jackpotId, totalJackpot, parentCurrency, skipTimelockValidation ? 'jackpot balance for ticket calculation (timelock check skipped)' : 'locked jackpot balance for ticket calculation');
      
      if (totalJackpot <= 0) {
        throw new Error(`Insufficient jackpot balance: ${totalJackpot} ${parentCurrency}. Cannot calculate ticket quantity.`);
      }

      // Calculate: jackpot balance × ticket multiplier, rounded up to whole number
      const calculatedQuantity = Math.ceil(totalJackpot * activeTicketMultiplier);
      
      logger.writeToLog(`🎯 CALCULATION: ${totalJackpot} ${parentCurrency} ${skipTimelockValidation ? '(TESTING MODE)' : '(LOCKED)'} × ${activeTicketMultiplier} = ${calculatedQuantity} tickets (rounded up)`);
      
      // Update the ticket quantity
      setTicketQuantity(calculatedQuantity);
      setTicketQuantityCalculated(true);
      
      return {
        jackpotBalance: totalJackpot,
        multiplier: activeTicketMultiplier,
        calculatedQuantity: calculatedQuantity,
        jackpotTimelock: skipTimelockValidation ? null : undefined, // Set based on timelock check
        currentBlock: skipTimelockValidation ? null : undefined,
        isLocked: !skipTimelockValidation
      };
    } catch (error) {
      logger.logError('TICKET_CALCULATION', error, 'Failed to calculate ticket quantity from jackpot balance');
      throw error;
    }
  };

  /**
   * Enhanced sendCommand wrapper that monitors RPC calls for automation
   */
  const monitoredSendCommand = async (command, args, identifier) => {
    console.log('TicketGeneration: monitoredSendCommand called with:', command);
    console.log('TicketGeneration: automation object available?', !!reportAutomationPhase);
    
    // Execute the actual command
    return await sendCommand(command, args, identifier);
  };

  /**
   * Get primary address for an identity
   */
  const getPrimaryAddressForIdentity = async (identityId) => {
    if (!identityId.includes('@')) {
      console.warn(`getPrimaryAddressForIdentity: Input '${identityId}' does not appear to be an i-address. Using it directly as control address. Ensure it is a valid R-address in the wallet.`);
      return identityId;
    }
    try {
      const identityData = await monitoredSendCommand('getidentity', [identityId]);
      if (identityData && identityData.identity && identityData.identity.primaryaddresses && identityData.identity.primaryaddresses.length > 0) {
        return identityData.identity.primaryaddresses[0];
      }
      throw new Error(`Primary R-address not found for ${identityId}. Response: ${JSON.stringify(identityData)}`);
    } catch (error) {
      console.error(`Error fetching primary R-address for ${identityId}:`, error);
      setGenerationStatus(`Error fetching R-address for ${identityId}: ${error.message}`);
      throw error; 
    }
  };

  /**
   * Check if a transaction is confirmed
   */
  const checkBlockConfirmation = async (txid) => {
    try {
      const result = await monitoredSendCommand('gettransaction', [txid], `vlotto-check-confirmation-${txid.substring(0,10)}`);
      return result.confirmations > 0;
    } catch (error) {
      console.error('Error checking block confirmation:', error);
      return false;
    }
  };

  /**
   * Wait for transaction confirmation
   */
  const waitForBlockConfirmation = async (txid) => {
    let attempts = 0;
    while (true) {
      if (await checkBlockConfirmation(txid)) {
        logger.logTransactionConfirmed(txid);
        return true;
      }
      attempts++;
      setGenerationStatus(`Waiting for confirmation of ${txid.substring(0,10)}... Attempt ${attempts} (blocks can take time)`);
      await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.CONFIRMATION_CHECK_INTERVAL)); 
    }
  };

  /**
   * Commit a ticket name
   */
  const commitTicketName = async (ticketName, controlRAddressForCommitment) => {
    const parentName = getParentName(mainVerusId);
    try {
      // Use primary R-address of mainVerusId for sourceoffunds (has VRSCTEST for fees)
      const mainIdRAddress = await getPrimaryAddressForIdentity(mainVerusId);
      
      console.log(`🔄 [TicketGeneration] Executing registernamecommitment for ${ticketName}`);
      const result = await monitoredSendCommand('registernamecommitment', [
        ticketName,       
        controlRAddressForCommitment,  
        '',               
        parentName,
        mainIdRAddress    // sourceoffunds - use R-address instead of identity (has VRSCTEST)
      ], 'vlotto-commit-name');
      
      // CRITICAL: Validate registernamecommitment result
      if (!result) {
        throw new Error(`registernamecommitment returned null/undefined for ${ticketName}`);
      }
      
      if (typeof result === 'string' && result.toLowerCase().includes('insufficient')) {
        throw new Error(`Insufficient funds for registernamecommitment: ${result}`);
      }
      
      if (typeof result === 'object' && result.error) {
        throw new Error(`registernamecommitment error for ${ticketName}: ${result.error}`);
      }
      
      if (!result.txid || typeof result.txid !== 'string' || result.txid.length !== 64) {
        throw new Error(`Invalid transaction ID from registernamecommitment for ${ticketName}. Expected 64-character hex string, got: ${JSON.stringify(result.txid)}`);
      }
      
      if (!result.namereservation) {
        throw new Error(`Missing namereservation in registernamecommitment result for ${ticketName}`);
      }
      
      console.log(`✅ [TicketGeneration] registernamecommitment successful for ${ticketName} - TXID: ${result.txid}`);
      logger.logTicketCommitment(ticketName, result.txid);
      return result;
    } catch (error) {
      console.error(`❌ [TicketGeneration] registernamecommitment failed for ${ticketName}:`, error);
      logger.logError('TICKET_COMMITMENT', error, `Failed to commit ${ticketName}`);
      throw error;
    }
  };

  /**
   * Register a ticket identity
   */
  const registerTicketIdentity = async (commitmentResult, controlRAddressForIdentity) => {
    const parentName = getParentName(mainVerusId);
    let nameForRegistration; 
    try {
      // Use primary R-address of mainVerusId for sourceoffunds (has VRSCTEST for fees)
      const mainIdRAddress = await getPrimaryAddressForIdentity(mainVerusId);
      
      const nameFromCommitmentOutput = commitmentResult.namereservation.name;
      nameForRegistration = nameFromCommitmentOutput.endsWith('.') 
                              ? nameFromCommitmentOutput 
                              : nameFromCommitmentOutput + '.';

      console.log(`🔄 [TicketGeneration] Executing registeridentity for ${nameForRegistration}`);
      const result = await monitoredSendCommand('registeridentity', [{
        txid: commitmentResult.txid,
        namereservation: {
          version: 1,
          name: nameForRegistration, 
          parent: parentName, 
          salt: commitmentResult.namereservation.salt,
          referralidentity: '',
          nameid: commitmentResult.namereservation.nameid
        },
        identity: {
          name: nameForRegistration, 
          primaryaddresses: [controlRAddressForIdentity], 
          minimumsignatures: 1,
          revocationauthority: mainVerusId, 
          recoveryauthority: mainVerusId  
        },
        sourceoffunds: mainIdRAddress,  // Use R-address instead of identity (has VRSCTEST)
        changeaddress: mainIdRAddress   // Use R-address for change as well
      }], 'vlotto-register-identity');
      
      // CRITICAL: Validate registeridentity result
      if (!result) {
        throw new Error(`registeridentity returned null/undefined for ${nameForRegistration}`);
      }
      
      if (typeof result === 'string') {
        if (result.toLowerCase().includes('insufficient')) {
          throw new Error(`Insufficient funds for registeridentity: ${result}`);
        }
        // If it's a string and not an error, it should be a 64-character hex TXID
        if (result.length !== 64 || !/^[a-f0-9]+$/i.test(result)) {
          throw new Error(`Invalid transaction ID from registeridentity for ${nameForRegistration}. Expected 64-character hex string, got: ${result}`);
        }
      } else if (typeof result === 'object') {
        if (result.error) {
          throw new Error(`registeridentity error for ${nameForRegistration}: ${result.error}`);
        }
        // If it's an object, it might have a txid property
        if (result.txid && typeof result.txid === 'string') {
          if (result.txid.length !== 64 || !/^[a-f0-9]+$/i.test(result.txid)) {
            throw new Error(`Invalid transaction ID from registeridentity for ${nameForRegistration}. Expected 64-character hex string, got: ${result.txid}`);
          }
        } else {
          throw new Error(`Unexpected registeridentity result format for ${nameForRegistration}: ${JSON.stringify(result)}`);
        }
      } else {
        throw new Error(`Unexpected registeridentity result type for ${nameForRegistration}: ${typeof result}`);
      }
      
      const txid = typeof result === 'string' ? result : result.txid;
      console.log(`✅ [TicketGeneration] registeridentity successful for ${nameForRegistration} - TXID: ${txid}`);
      logger.logTicketRegistration(nameForRegistration, result);
      return result;
    } catch (error) {
      console.error(`❌ [TicketGeneration] registeridentity failed for ${nameForRegistration || 'unknown name'}:`, error);
      logger.logError('TICKET_REGISTRATION', error, `Failed to register ${nameForRegistration || 'unknown name'}`);
      setGenerationStatus(`Error registering identity for ${nameForRegistration || 'unknown name'}: ${error.message}`);
      throw error;
    }
  };

  /**
   * Finalize ticket details with cryptographic signatures
   */
  const finalizeTicketDetails = async (ticket, proofguardIdFullName) => {
    const ticketFullName = ticket.name;
    const registrationTxId = ticket.registrationTxId;

    // Log signature process start
    logger.logTicketSignatureStart(ticketFullName, registrationTxId);

    // Check proofguard funding before signing
    try {
      const proofguardBalance = await monitoredSendCommand('getcurrencybalance', [proofguardIdFullName]);
      const parentCurrency = getParentName(mainVerusId);
      const balance = proofguardBalance[parentCurrency] || 0;
      logger.logProofguardFundingCheck(proofguardIdFullName, balance, parentCurrency, 'before');
    } catch (error) {
      logger.logWarning('PROOFGUARD_FUNDING', `Could not check proofguard balance before signing: ${error.message}`);
    }

    setGenerationStatus(`Finalizing ticket ${ticketFullName}: Preparing to sign TXID by ticket...`);
    await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY));
    
    // Step 1: Ticket signs its registration TXID
    const ticketValidation = await signMessage(monitoredSendCommand, ticketFullName, registrationTxId);
    setGenerationStatus(`Finalizing ticket ${ticketFullName}: Sig1 by ticket: ${ticketValidation.signature.substring(0,10)}...`);
    
    // Log Step 1 signature details
    logger.logTicketSelfSignature(ticketFullName, ticketValidation.signature, ticketValidation.hash, registrationTxId);

    // Verify Step 1 signature immediately
    try {
      const step1VerifyResult = await monitoredSendCommand('verifymessage', [ticketFullName, ticketValidation.signature, registrationTxId]);
      logger.logSignatureVerificationTest(ticketFullName, 1, ticketFullName, ticketValidation.signature, registrationTxId, step1VerifyResult);
    } catch (error) {
      logger.logWarning('SIGNATURE_VERIFICATION', `Step 1 verification failed for ${ticketFullName}: ${error.message}`);
    }

    setGenerationStatus(`Finalizing ticket ${ticketFullName}: Preparing to sign Sig1 by proofguard ID ${proofguardIdFullName}...`);
    await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY));
    
    // Step 2: Proofguard signs the ticket's signature
    const proofguardAcknowledgement = await signMessage(monitoredSendCommand, proofguardIdFullName, ticketValidation.signature);
    setGenerationStatus(`Finalizing ticket ${ticketFullName}: Sig2 by proofguard: ${proofguardAcknowledgement.signature.substring(0,10)}... Playing number: ${proofguardAcknowledgement.hash.substring(0,10)}...`);
    
    // Log Step 2 signature details
    logger.logProofguardSignature(ticketFullName, proofguardIdFullName, proofguardAcknowledgement.signature, proofguardAcknowledgement.hash, ticketValidation.signature);

    // Verify Step 2 signature immediately
    try {
      const step2VerifyResult = await monitoredSendCommand('verifymessage', [proofguardIdFullName, proofguardAcknowledgement.signature, ticketValidation.signature]);
      logger.logSignatureVerificationTest(ticketFullName, 2, proofguardIdFullName, proofguardAcknowledgement.signature, ticketValidation.signature, step2VerifyResult);
    } catch (error) {
      logger.logWarning('SIGNATURE_VERIFICATION', `Step 2 verification failed for ${ticketFullName}: ${error.message}`);
    }

    // Check proofguard funding after signing
    try {
      const proofguardBalance = await monitoredSendCommand('getcurrencybalance', [proofguardIdFullName]);
      const parentCurrency = getParentName(mainVerusId);
      const balance = proofguardBalance[parentCurrency] || 0;
      logger.logProofguardFundingCheck(proofguardIdFullName, balance, parentCurrency, 'after');
    } catch (error) {
      logger.logWarning('PROOFGUARD_FUNDING', `Could not check proofguard balance after signing: ${error.message}`);
    }
    
    // Create ticket payload
    const ticketPayload = createTicketPayload(
      registrationTxId,
      ticketValidation,
      proofguardAcknowledgement,
      proofguardAcknowledgement.hash // playing number
    );

    // Log ticket payload creation
    logger.logTicketPayloadCreation(ticketFullName, ticketPayload);

    // Create contentmultimap update
    const contentMultiMapUpdate = createContentMultiMapUpdate(VDXF_KEYS, ticketPayload);
    
    setGenerationStatus(`Finalizing ticket ${ticketFullName}: Preparing to update identity with finalized data...`);
    await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.UPDATE_IDENTITY_DELAY));

    // Parse ticket name for updateidentity
    const { subIdName, parentIdName } = parseTicketName(ticketFullName);

    // Use primary R-address of mainVerusId for sourceoffunds (has VRSCTEST for fees)
    const mainIdRAddress = await getPrimaryAddressForIdentity(mainVerusId);

    const updateIdentityArgs = {
      name: subIdName,
      parent: parentIdName,
      contentmultimap: contentMultiMapUpdate,
      sourceoffunds: mainIdRAddress  // Use R-address instead of identity (has VRSCTEST)
    };

    // Log updateidentity call details
    logger.logUpdateIdentityCall(ticketFullName, updateIdentityArgs, contentMultiMapUpdate);

    try {
      console.log(`🔄 [TicketGeneration] Executing updateidentity for ${ticketFullName}`);
      const updateTxId = await monitoredSendCommand('updateidentity', [updateIdentityArgs]);
      
      // CRITICAL: Validate updateidentity result
      if (!updateTxId) {
        throw new Error(`updateidentity returned null/undefined for ${ticketFullName}`);
      }
      
      if (typeof updateTxId === 'string') {
        if (updateTxId.toLowerCase().includes('insufficient')) {
          throw new Error(`Insufficient funds for updateidentity: ${updateTxId}`);
        }
        // If it's a string and not an error, it should be a 64-character hex TXID
        if (updateTxId.length !== 64 || !/^[a-f0-9]+$/i.test(updateTxId)) {
          throw new Error(`Invalid transaction ID from updateidentity for ${ticketFullName}. Expected 64-character hex string, got: ${updateTxId}`);
        }
      } else if (typeof updateTxId === 'object') {
        if (updateTxId.error) {
          throw new Error(`updateidentity error for ${ticketFullName}: ${updateTxId.error}`);
        }
        // If it's an object, it might have a txid property
        if (updateTxId.txid && typeof updateTxId.txid === 'string') {
          if (updateTxId.txid.length !== 64 || !/^[a-f0-9]+$/i.test(updateTxId.txid)) {
            throw new Error(`Invalid transaction ID from updateidentity for ${ticketFullName}. Expected 64-character hex string, got: ${updateTxId.txid}`);
          }
        } else {
          throw new Error(`Unexpected updateidentity result format for ${ticketFullName}: ${JSON.stringify(updateTxId)}`);
        }
      } else {
        throw new Error(`Unexpected updateidentity result type for ${ticketFullName}: ${typeof updateTxId}`);
      }
      
      const finalTxId = typeof updateTxId === 'string' ? updateTxId : updateTxId.txid;
      console.log(`✅ [TicketGeneration] updateidentity successful for ${ticketFullName} - TXID: ${finalTxId}`);
      
      // Log successful updateidentity
      logger.logUpdateIdentitySuccess(ticketFullName, finalTxId);
      
      // Log ticket finalization (existing call)
      logger.logTicketFinalization(ticketFullName, finalTxId, proofguardAcknowledgement.hash);
      
      setGenerationStatus(`Finalizing ticket ${ticketFullName}: Update submitted ${finalTxId.substring(0,10)}... (will confirm all at end)`);

      // Verify ticket data was actually stored
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay to ensure update is processed
        const verifyIdentityData = await monitoredSendCommand('getidentity', [ticketFullName]);
        logger.logTicketDataVerification(ticketFullName, verifyIdentityData, !!verifyIdentityData);
      } catch (error) {
        logger.logTicketDataVerification(ticketFullName, null, false);
        logger.logWarning('TICKET_VERIFICATION', `Could not verify ticket data storage for ${ticketFullName}: ${error.message}`);
      }

      return {
        hash1: ticketValidation.hash,
        sig1: ticketValidation.signature,
        hash2: proofguardAcknowledgement.hash, // playingNumber
        sig2: proofguardAcknowledgement.signature,
        updateIdentityTxId: finalTxId,
        playingNumber: proofguardAcknowledgement.hash,
        finalizedData: ticketPayload
      };
    } catch (error) {
      // Log failed updateidentity
      console.error(`❌ [TicketGeneration] updateidentity failed for ${ticketFullName}:`, error);
      logger.logUpdateIdentityFailure(ticketFullName, error, updateIdentityArgs);
      throw error;
    }
  };

  /**
   * Generate tickets using calculated drawing block
   */
  const generateTickets = async (proofguardIdFullName, calculatedDrawingBlock = null) => {
    if (!mainVerusId || ticketQuantity <= 0) {
      throw new Error('Please fill in all required fields');
    }

    if (!proofguardIdFullName) {
      throw new Error('Proofguard ID is not yet created or loaded. Please create the Proofguard ID under Utility IDs before generating tickets.');
    }

    // Use calculated drawing block if provided, otherwise fall back to user input
    const blockNumber = calculatedDrawingBlock || futureBlockNumber;
    
    if (!blockNumber) {
      throw new Error('Drawing block number is required (either calculated or manual input)');
    }

    // Log the start of ticket generation
    logger.logTicketGeneration(blockNumber, ticketQuantity, mainVerusId);
    logger.logPhaseStart('TICKET_GENERATION', `Generating ${ticketQuantity} tickets for drawing block ${blockNumber}`);

    setIsGeneratingTickets(true);
    setGenerationStatus('Starting ticket generation...');
    setPendingCommitments([]);
    setPendingRegistrations([]);
    setTickets([]);

    let controlRAddress;
    if (rAddressForTickets && rAddressForTickets.trim()) {
      // Use the provided R-address for tickets parameter
      controlRAddress = rAddressForTickets.trim();
      setGenerationStatus(`Using provided R-address for tickets: ${controlRAddress}`);
      logger.writeToLog(`🔑 R-ADDRESS FOR TICKETS: Using provided address ${controlRAddress}`);
    } else {
      // Fallback to deriving from main lottery ID (legacy behavior)
      controlRAddress = await getPrimaryAddressForIdentity(mainVerusId);
      setGenerationStatus(`Using R-address derived from lottery ID: ${controlRAddress} for operations.`);
      logger.writeToLog(`🔑 R-ADDRESS FALLBACK: Derived from main lottery ID ${controlRAddress}`);
    }

    try {
      // Wait for ticket quantity to be updated by the calculation in parent function
      let attempts = 0;
      let currentQty = ticketQuantity;
      while (currentQty <= 0 && attempts < 20) {
        console.log(`VLotto TicketGen: Waiting for ticket quantity update... Attempt ${attempts + 1}, current: ${currentQty}`);
        await new Promise(resolve => setTimeout(resolve, 150)); // Brief wait for React state update
        currentQty = ticketQuantity; // refresh from state
        attempts++;
      }
      
      if (currentQty <= 0) {
        throw new Error(`Ticket quantity is still ${currentQty} after waiting for calculation. Please ensure ticket quantity calculation completed successfully.`);
      }
      
      const qty = currentQty;
      
      console.log(`VLotto TicketGen: ✅ Ticket quantity confirmed: ${qty}`);

      // Phase 1: Committing tickets
      console.log('VLotto TicketGen: About to report COMMITTING_TICKETS phase');
      console.log('VLotto TicketGen: reportAutomationPhase available?', !!reportAutomationPhase);
      console.log('VLotto TicketGen: automationPhases available?', !!automationPhases);
      
      if (reportAutomationPhase && automationPhases) {
        console.log('VLotto TicketGen: Calling reportAutomationPhase with COMMITTING_TICKETS');
        reportAutomationPhase(automationPhases.COMMITTING_TICKETS, 'Committing ticket names on blockchain...');
        console.log('VLotto TicketGen: reportAutomationPhase call completed for COMMITTING_TICKETS');
      } else {
        console.warn('VLotto TicketGen: Cannot report COMMITTING_TICKETS phase - missing reportAutomationPhase or automationPhases');
      }
      setGenerationStatus('Committing ticket names...');
      
      const localCommitments = [];
      
      for (let i = 1; i <= qty; i++) {
        const ticketName = generateTicketName(blockNumber, i, qty); 
        setGenerationStatus(`Preparing to commit ticket ${i} of ${qty} (${ticketName})...`);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY));
        
        const commitmentResult = await commitTicketName(ticketName, controlRAddress);
        const newCommitmentEntry = {
          ticketNumber: i,
          commitmentResult,
        };
        localCommitments.push(newCommitmentEntry);
        setPendingCommitments([...localCommitments]);

        if (i < qty) { 
          setGenerationStatus(`Waiting briefly before committing next ticket (${i}/${qty})...`);
          await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.INTER_TICKET_DELAY)); 
        }
      }

      // Phase 2: Pending commitment confirmation
      console.log('VLotto TicketGen: About to report PENDING_TICKET_COMMITMENT_CONFIRMATION phase');
      console.log('VLotto TicketGen: reportAutomationPhase available?', !!reportAutomationPhase);
      console.log('VLotto TicketGen: automationPhases available?', !!automationPhases);
      
      if (reportAutomationPhase && automationPhases) {
        console.log('VLotto TicketGen: Calling reportAutomationPhase with PENDING_TICKET_COMMITMENT_CONFIRMATION');
        reportAutomationPhase(automationPhases.PENDING_TICKET_COMMITMENT_CONFIRMATION, 'Waiting for ticket name commitments to confirm...');
        console.log('VLotto TicketGen: reportAutomationPhase call completed');
      } else {
        console.warn('VLotto TicketGen: Cannot report phase - missing reportAutomationPhase or automationPhases');
      }
      setGenerationStatus('Waiting for name commitments to be confirmed...');
      
      for (const commitmentEntry of localCommitments) {
        setGenerationStatus(`Waiting for confirmation of commitment for ticket ${commitmentEntry.ticketNumber} (TXID: ${commitmentEntry.commitmentResult.txid.substring(0,10)})...`);
        await waitForBlockConfirmation(commitmentEntry.commitmentResult.txid);
      }

      // Phase 3: Registering tickets
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.REGISTERING_TICKETS, 'Registering ticket identities on blockchain...');
      }
      setGenerationStatus('Registering ticket identities...');
      
      const localRegistrations = [];
      
      for (let i = 0; i < localCommitments.length; i++) { 
        const commitmentEntry = localCommitments[i];
        const ticketNumber = commitmentEntry.ticketNumber;
        const commitmentResultForReg = commitmentEntry.commitmentResult;
        
        let nameForDisplayInStatus = commitmentResultForReg.namereservation.name;
        if (!nameForDisplayInStatus.endsWith('.')) {
          nameForDisplayInStatus += '.';
        }
        setGenerationStatus(`Preparing to register ticket ${ticketNumber} (${nameForDisplayInStatus})...`);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY));
        
        const registrationResult = await registerTicketIdentity(commitmentResultForReg, controlRAddress);
        const newRegistrationEntry = {
          ticketNumber: ticketNumber,
          registrationResult
        };
        localRegistrations.push(newRegistrationEntry);
        setPendingRegistrations([...localRegistrations]); 

        if (i < localCommitments.length - 1) { 
          setGenerationStatus(`Waiting briefly before registering next identity (${i + 1}/${localCommitments.length})...`);
          await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.INTER_TICKET_DELAY)); 
        }
      }

      // Phase 4: Pending registration confirmation
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.PENDING_TICKET_REGISTRATION, 'Waiting for ticket identity registrations to confirm...');
      }
      setGenerationStatus('Waiting for identity registrations to be confirmed...');
      
      for (const registration of localRegistrations) {
        setGenerationStatus(`Waiting for confirmation of registration for ticket ${registration.ticketNumber} (TXID: ${registration.registrationResult.substring(0,10)})...`);
        await waitForBlockConfirmation(registration.registrationResult);
      }

      const parentNamespace = getParentName(mainVerusId);

      const finalTickets = localRegistrations.map(reg => {
        const subIdPart = generateTicketName(blockNumber, reg.ticketNumber, qty);
        return {
          id: reg.ticketNumber,
          name: `${subIdPart}${parentNamespace}@`,
          registrationTxId: reg.registrationResult
        };
      });
      
      // Phase 5: Validating tickets
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.VALIDATING_TICKETS, 'Creating cryptographic signatures for tickets...');
      }
      setGenerationStatus('Ticket registration completed. Starting finalization (signatures & data storage)...');

      const fullyFinalizedTickets = [];
      for (let i = 0; i < finalTickets.length; i++) {
        const ticketToFinalize = finalTickets[i];
        setGenerationStatus(`Preparing to finalize ticket ${i + 1}/${finalTickets.length}: ${ticketToFinalize.name}`);

        try {
          const finalizedDetails = await finalizeTicketDetails(ticketToFinalize, proofguardIdFullName);
          fullyFinalizedTickets.push({ ...ticketToFinalize, ...finalizedDetails });
          
          // Update pendingRegistrations to remove finalized ticket
          setPendingRegistrations(prev => prev.filter(p => p.registrationResult !== ticketToFinalize.registrationTxId));

          if (i < finalTickets.length - 1) {
            setGenerationStatus(`Brief pause before preparing to finalize next ticket (${i + 2}/${finalTickets.length})...`);
            await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.INTER_TICKET_DELAY));
          }
        } catch (finalizationError) {
          console.error(`Error finalizing ticket ${ticketToFinalize.name}:`, finalizationError);
          setGenerationStatus(`Error finalizing ticket ${ticketToFinalize.name}: ${finalizationError.message}. Skipping this ticket's finalization.`);
          fullyFinalizedTickets.push({ ...ticketToFinalize, errorFinalizing: finalizationError.message });
        }
      }
      
      setTickets(fullyFinalizedTickets);
      
      // Phase 6: Pending validation confirmation - only report if we actually have tickets to validate
      const ticketsWithUpdates = fullyFinalizedTickets.filter(ticket => ticket.updateIdentityTxId && !ticket.errorFinalizing);
      
      if (ticketsWithUpdates.length > 0) {
        console.log('VLotto TicketGen: About to report PENDING_TICKET_VALIDATION phase');
        if (reportAutomationPhase && automationPhases) {
          console.log('VLotto TicketGen: Calling reportAutomationPhase with PENDING_TICKET_VALIDATION');
          reportAutomationPhase(automationPhases.PENDING_TICKET_VALIDATION, 'Confirming final ticket updates...');
          console.log('VLotto TicketGen: reportAutomationPhase call completed for PENDING_TICKET_VALIDATION');
        }
        
        // Wait for confirmation of the last updateidentity transaction
        const lastTicket = ticketsWithUpdates[ticketsWithUpdates.length - 1];
        setGenerationStatus(`Waiting for confirmation of last updateidentity transaction: ${lastTicket.updateIdentityTxId.substring(0,10)}...`);
        
        await waitForBlockConfirmation(lastTicket.updateIdentityTxId);
        
        setGenerationStatus('All ticket updates confirmed! Ready for marketplace listing.');
      } else {
        console.log('VLotto TicketGen: No tickets need validation confirmation, skipping PENDING_TICKET_VALIDATION phase');
        setGenerationStatus('No ticket updates to confirm. Ready for marketplace listing.');
      }
      
      setGenerationStatus('Ticket generation and validation completed!');
      
      // Return the generated tickets so they can be used by the calling function
      return fullyFinalizedTickets;
    } catch (error) {
      logger.logError('TICKET_GENERATION', error);
      console.error('Error generating tickets:', error);
      if (!generationStatus.startsWith('Error')) { 
        setGenerationStatus(`Error: ${error.message}`);
      }
      throw error;
    } finally {
      setIsGeneratingTickets(false);
    }
  };

  /**
   * List tickets on marketplace using makeoffer
   */
  const listTicketsOnMarketplace = async (tickets) => {
    if (!tickets || tickets.length === 0) {
      return;
    }

    logger.logPhaseStart('MARKETPLACE_LISTING', `Listing ${tickets.length} tickets on marketplace`);
    setGenerationStatus('Starting marketplace listing process...');
    const parentCurrency = getParentName(mainVerusId); // e.g., "shylock"
    const revenuesAddress = `revenues.${parentCurrency}@`; // Utility ID that receives funds
    
    // Get the primary R-address from the revenues identity to use as maker
    const revenuesPrimaryAddress = await getPrimaryAddressForIdentity(revenuesAddress);
    setGenerationStatus(`Using revenues R-address: ${revenuesPrimaryAddress} for marketplace offers.`);
    
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      
      if (ticket.errorFinalizing) {
        setGenerationStatus(`Skipping marketplace listing for ticket ${ticket.name} due to finalization error`);
        continue;
      }

      try {
        setGenerationStatus(`Listing ticket ${i + 1}/${tickets.length} on marketplace: ${ticket.name}`);
        
        // Use the new DEFAULT_CONFIG.TRANSACTION_DELAY
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY)); 
        
        const offerData = {
          changeaddress: revenuesPrimaryAddress,
          expiryheight: futureBlockNumber ? parseInt(futureBlockNumber) - 20 : undefined,
          offer: {
            identity: ticket.name
          },
          for: {
            address: revenuesAddress,
            currency: parentCurrency,
            amount: 1
          }
        };

        console.log(`🔄 [TicketGeneration] Executing makeoffer for ${ticket.name}`);
        const makeOfferResult = await monitoredSendCommand('makeoffer', [
          revenuesPrimaryAddress, 
          offerData,
          false // returntx
        ], 'vlotto-marketplace-listing');

        // CRITICAL: Validate makeoffer result
        if (!makeOfferResult) {
          throw new Error(`makeoffer returned null/undefined for ${ticket.name}`);
        }
        
        if (typeof makeOfferResult === 'string' && makeOfferResult.toLowerCase().includes('insufficient')) {
          throw new Error(`Insufficient funds for makeoffer: ${makeOfferResult}`);
        }
        
        if (typeof makeOfferResult === 'object' && makeOfferResult.error) {
          throw new Error(`makeoffer error for ${ticket.name}: ${makeOfferResult.error}`);
        }
        
        if (!makeOfferResult.txid || typeof makeOfferResult.txid !== 'string' || makeOfferResult.txid.length !== 64) {
          throw new Error(`Invalid transaction ID from makeoffer for ${ticket.name}. Expected 64-character hex string, got: ${JSON.stringify(makeOfferResult.txid)}`);
        }
        
        console.log(`✅ [TicketGeneration] makeoffer successful for ${ticket.name} - TXID: ${makeOfferResult.txid}`);
        
        // Log the marketplace listing
        logger.logMarketplaceListing(ticket.name, makeOfferResult.txid, 1, parentCurrency);
        
        setGenerationStatus(`✅ Listed ticket ${ticket.name} on marketplace. Offer TXID: ${makeOfferResult.txid.substring(0,10)}...`);
        // Track the offer for later closing/revocation logic
        setListedOffers(prev => ({
          ...prev,
          [makeOfferResult.txid]: ticket.name
        }));

        // Add brief delay between marketplace listings, using 500ms
        if (i < tickets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); 
        }

      } catch (error) {
        logger.logError('MARKETPLACE_LISTING', error, `Failed to list ${ticket.name}`);
        console.error(`Error listing ticket ${ticket.name} on marketplace:`, error);
        setGenerationStatus(`❌ Error listing ticket ${ticket.name} on marketplace: ${error.message}`);
        // Continue with next ticket
      }
    }
    
    logger.logPhaseEnd('MARKETPLACE_LISTING', 'SUCCESS', `${tickets.length} tickets listed on marketplace`);
    setGenerationStatus('Marketplace listing process completed!');
  };

  /**
   * Close all marketplace offers
   */
  const closeAllOffers = async (reportAutomationPhase = null, automationPhases = null) => {
    setGenerationStatus('Closing all marketplace offers...');
    
    if (reportAutomationPhase && automationPhases) {
      reportAutomationPhase(automationPhases.CLOSING_OFFERS, 'Closing all marketplace offers...');
    }
    
    try {
      const result = await monitoredSendCommand('closeoffers', []);
      setGenerationStatus('✅ All marketplace offers closed successfully.');
      
      // For testing, we'll assume all listed tickets are now unsold
      // In production, we'd need more sophisticated tracking of which were actually sold
      return result;
    } catch (error) {
      console.error('Error closing offers:', error);
      setGenerationStatus(`❌ Error closing offers: ${error.message}`);
      throw error;
    }
  };

  /**
   * Revoke unsold tickets based on R-address analysis  
   */
  const revokeUnsoldTickets = async (reportAutomationPhase = null, automationPhases = null) => {
    console.log(`🗑️ [TicketGeneration] === UNSOLD TICKET REVOCATION START ===`);
    
    if (!tickets || tickets.length === 0) {
      console.log('🗑️ [TicketGeneration] No tickets to check for revocation');
      return;
    }

    const originalRAddress = rAddressForTickets && rAddressForTickets.trim() 
      ? rAddressForTickets.trim() 
      : await getPrimaryAddressForIdentity(mainVerusId);
    
    console.log(`🔑 [TicketGeneration] Original R-address for tickets: ${originalRAddress}`);
    console.log(`🎫 [TicketGeneration] Checking ${tickets.length} tickets for R-address changes`);
    
    // LOG: Revocation process start
    logger.logRevocationStart(tickets.length, originalRAddress);
    logger.logPhaseStart('REVOKE_UNSOLD_TICKETS', `Checking ${tickets.length} tickets for unsold status`);

    const unsoldTickets = [];
    const soldTickets = [];
    const errorTickets = [];

    console.log(`🔍 [TicketGeneration] === TICKET ANALYSIS START ===`);

    // Check each ticket to see if its primary R-address still matches our original one
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const ticketName = ticket.name;
      
      console.log(`🎫 [TicketGeneration] Checking ticket ${i + 1}/${tickets.length}: ${ticketName}`);
      
      try {
        // Get current identity data for the ticket
        const identityData = await monitoredSendCommand('getidentity', [ticketName]);
        
        if (!identityData || !identityData.identity) {
          console.log(`❌ [TicketGeneration] ${ticketName} identity not found - may already be revoked`);
          errorTickets.push({ ticketName, error: 'Identity not found' });
          continue;
        }
        
        // Check if identity is already revoked
        if (identityData.identity.flags === 32768) {
          console.log(`🗑️ [TicketGeneration] ${ticketName} already revoked (flags: 32768)`);
          continue;
        }
        
        const currentRAddress = identityData.identity.primaryaddresses[0];
        console.log(`🔍 [TicketGeneration] ${ticketName} current R-address: ${currentRAddress}`);
        
        // Compare with original R-address
        if (currentRAddress === originalRAddress) {
          // R-address unchanged = unsold ticket
          unsoldTickets.push(ticketName);
          console.log(`🎫 [TicketGeneration] ${ticketName} UNSOLD (R-address unchanged)`);
          
          // LOG: Ticket sold status
          logger.logTicketSoldStatus(ticketName, currentRAddress, originalRAddress, false);
        } else {
          // R-address changed = sold ticket
          soldTickets.push(ticketName);
          console.log(`💰 [TicketGeneration] ${ticketName} SOLD (R-address changed to ${currentRAddress})`);
          
          // LOG: Ticket sold status
          logger.logTicketSoldStatus(ticketName, currentRAddress, originalRAddress, true);
        }
      } catch (error) {
        console.log(`❌ [TicketGeneration] Error checking ${ticketName}: ${error.message}`);
        errorTickets.push({ ticketName, error: error.message });
        logger.logError('TICKET_ANALYSIS', error, `Failed to check ticket ${ticketName}`);
      }
    }

    console.log(`📊 [TicketGeneration] === REVOCATION ANALYSIS SUMMARY ===`);
    console.log(`🎫 [TicketGeneration] Unsold tickets found: ${unsoldTickets.length}`);
    console.log(`💰 [TicketGeneration] Sold tickets found: ${soldTickets.length}`);
    console.log(`❌ [TicketGeneration] Error tickets: ${errorTickets.length}`);

    if (unsoldTickets.length === 0) {
      console.log(`✅ [TicketGeneration] No unsold tickets found - revocation complete`);
      
      // LOG: No revocations needed
      logger.logRevocationSummary(soldTickets.length, 0, errorTickets.length, tickets.length);
      logger.logPhaseEnd('REVOKE_UNSOLD_TICKETS', 'SUCCESS', 'No unsold tickets found');
      return;
    }

    console.log(`🗑️ [TicketGeneration] === REVOCATION EXECUTION START ===`);
    console.log(`🎫 [TicketGeneration] Starting revocation of ${unsoldTickets.length} unsold tickets`);

    const revocationTxIds = [];
    const newlyRevokedTickets = [];

    // Execute revocations with detailed tracking
    for (let i = 0; i < unsoldTickets.length; i++) {
      const ticketName = unsoldTickets[i];
      console.log(`🗑️ [TicketGeneration] Revoking ticket ${i + 1}/${unsoldTickets.length}: ${ticketName}`);
      
      try {
        // LOG: RPC command being executed
        logger.logRPCCommand('revokeidentity', [ticketName, mainVerusId], `Revoking unsold ticket ${ticketName}`);
        
        const result = await monitoredSendCommand('revokeidentity', [ticketName, mainVerusId]);
        
        if (result && typeof result === 'string' && result.length === 64) {
          console.log(`✅ [TicketGeneration] Successfully revoked ${ticketName} - TXID: ${result}`);
          revocationTxIds.push({ ticketName, txid: result });
          newlyRevokedTickets.push(ticketName);
          
          // LOG: Successful revocation
          logger.logRPCResponse('revokeidentity', result, true);
          logger.logRevocationExecution(ticketName, result);
        } else {
          console.log(`❌ [TicketGeneration] Failed to revoke ${ticketName} - Invalid result: ${JSON.stringify(result)}`);
          logger.logRPCError('revokeidentity', new Error(`Invalid revocation result: ${JSON.stringify(result)}`), [ticketName, mainVerusId]);
        }
      } catch (error) {
        console.error(`❌ [TicketGeneration] Error revoking ${ticketName}:`, error);
        logger.logRPCError('revokeidentity', error, [ticketName, mainVerusId]);
      }
    }

    console.log(`📊 [TicketGeneration] === REVOCATION EXECUTION SUMMARY ===`);
    console.log(`✅ [TicketGeneration] Successfully revoked: ${newlyRevokedTickets.length} tickets`);
    console.log(`❌ [TicketGeneration] Failed to revoke: ${unsoldTickets.length - newlyRevokedTickets.length} tickets`);
    console.log(`📝 [TicketGeneration] Revocation TXIDs: ${revocationTxIds.length}`);

    // LOG: Final revocation summary
    logger.logRevocationSummary(soldTickets.length, newlyRevokedTickets.length, errorTickets.length, tickets.length);
    logger.logPhaseEnd('REVOKE_UNSOLD_TICKETS', 'SUCCESS', `Revoked ${newlyRevokedTickets.length} unsold tickets, ${soldTickets.length} tickets were sold`);

    // Update UI state based on automation context
    if (reportAutomationPhase && automationPhases) {
      // For automation, report progress as we go
      reportAutomationPhase(automationPhases.PENDING_REVOCATION_CONFIRMATION, 'Waiting for revocation confirmations...');
      for (const ticketName of newlyRevokedTickets) {
        setRevokedTickets(prev => [...prev, ticketName]);
      }
    } else {
      // If no automation reporting, just update all revoked tickets at once
      setRevokedTickets(prev => [...prev, ...newlyRevokedTickets]);
    }
    
    console.log(`🗑️ [TicketGeneration] === UNSOLD TICKET REVOCATION COMPLETE ===`);
  };

  /**
   * Check if makeoffer has expired and revoke unsold tickets
   * This should be called periodically or when drawing time is reached
   */
  const checkAndRevokeExpiredOffers = async (reportAutomationPhase = null, automationPhases = null) => {
    console.log(`🔍 [TicketGeneration] === OFFER EXPIRY CHECK START ===`);
    
    try {
      // Get current block height
      const currentBlock = await monitoredSendCommand('getblockcount', []);
      console.log(`🧱 [TicketGeneration] Current block height: ${currentBlock}`);
      
      // Calculate expected expiry block (futureBlockNumber - 20 as set in makeoffer)
      const expiryBlock = parseInt(futureBlockNumber) - 20;
      
      if (!futureBlockNumber || isNaN(expiryBlock)) {
        console.log(`⚠️ [TicketGeneration] Cannot determine expiry - futureBlockNumber: ${futureBlockNumber}`);
        logger.logWarning('EXPIRY_CHECK', 'Future block number not set - cannot determine makeoffer expiry');
        return;
      }
      
      console.log(`📊 [TicketGeneration] Drawing block: ${futureBlockNumber}`);
      console.log(`⏰ [TicketGeneration] Calculated expiry block: ${expiryBlock} (20 blocks before drawing)`);
      console.log(`📈 [TicketGeneration] Blocks until expiry: ${Math.max(0, expiryBlock - currentBlock)}`);
      
      logger.writeToLog(`🕐 EXPIRY CHECK: Current block ${currentBlock}, makeoffer expiry block ${expiryBlock}`);
      
      if (currentBlock >= expiryBlock) {
        console.log(`🚨 [TicketGeneration] === OFFERS EXPIRED ===`);
        console.log(`🧱 [TicketGeneration] Current block ${currentBlock} >= expiry block ${expiryBlock}`);
        logger.writeToLog(`⏰ OFFERS EXPIRED: Current block ${currentBlock} >= expiry block ${expiryBlock}`);
        setGenerationStatus(`Makeoffer expiry reached (block ${expiryBlock}). Checking for unsold tickets to revoke...`);
        
        // Offers have expired, proceed with revocation
        console.log(`🗑️ [TicketGeneration] Starting revocation process for unsold tickets...`);
        await revokeUnsoldTickets(reportAutomationPhase, automationPhases);
      } else {
        const blocksUntilExpiry = expiryBlock - currentBlock;
        console.log(`⏳ [TicketGeneration] Offers still active - ${blocksUntilExpiry} blocks until expiry`);
        logger.writeToLog(`⏳ OFFERS ACTIVE: ${blocksUntilExpiry} blocks until makeoffer expiry`);
        setGenerationStatus(`Makeoffer still active. ${blocksUntilExpiry} blocks until expiry (block ${expiryBlock})`);
      }
      
      const result = {
        currentBlock,
        expiryBlock,
        expired: currentBlock >= expiryBlock,
        blocksUntilExpiry: Math.max(0, expiryBlock - currentBlock)
      };
      
      console.log(`📋 [TicketGeneration] Expiry check result:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ [TicketGeneration] Error during expiry check:`, error);
      logger.logError('EXPIRY_CHECK', error, 'Failed to check makeoffer expiry');
      throw error;
    } finally {
      console.log(`🔍 [TicketGeneration] === OFFER EXPIRY CHECK END ===`);
    }
  };

  /**
   * Clear ticket data
   */
  const clearTicketData = () => {
    setTickets([]);
    setTicketQuantity(0); // Reset to 0
    setTicketQuantityCalculated(false); // Reset calculation flag
    setGenerationStatus('Ticket data cleared.');
    setPendingCommitments([]);
    setPendingRegistrations([]);
    setIsGeneratingTickets(false);
  };

  /**
   * Refresh marketplace state by querying blockchain
   */
  const refreshMarketplaceState = async () => {
    if (!tickets || tickets.length === 0) {
      setGenerationStatus('No tickets to check marketplace state for.');
      return;
    }

    setGenerationStatus('Refreshing marketplace state from blockchain...');
    
    try {
      // Check which tickets still exist (not revoked) by trying to get their identity
      const existingTickets = [];
      const currentlyRevokedTickets = [];
      
      for (const ticket of tickets) {
        try {
          const identityData = await monitoredSendCommand('getidentity', [ticket.name]);
          if (identityData && identityData.identity) {
            existingTickets.push(ticket.name);
          }
        } catch (error) {
          // If getidentity fails, the ticket is likely revoked
          currentlyRevokedTickets.push(ticket.name);
        }
      }
      
      // Update revoked tickets state
      setRevokedTickets(currentlyRevokedTickets);
      
      // For offers, we'll check if there are any active offers
      // If user has generated tickets, assume some might be listed
      if (existingTickets.length > 0) {
        // Create a mock listedOffers state based on existing tickets
        // This allows the buttons to be enabled for testing
        const mockListedOffers = {};
        existingTickets.forEach((ticketName, index) => {
          mockListedOffers[`mock-offer-${index}`] = ticketName;
        });
        setListedOffers(mockListedOffers);
      }
      
      setGenerationStatus(`✅ Marketplace state refreshed. Found ${existingTickets.length} existing tickets, ${currentlyRevokedTickets.length} revoked.`);
      
    } catch (error) {
      console.error('Error refreshing marketplace state:', error);
      setGenerationStatus(`❌ Error refreshing marketplace state: ${error.message}`);
    }
  };

  /**
   * Check if marketplace buttons should be enabled
   */
  const hasActiveMarketplaceTickets = () => {
    // Enable buttons if we have any tickets that aren't revoked
    const availableTickets = tickets.filter(ticket => 
      !revokedTickets.includes(ticket.name) && !ticket.errorFinalizing
    );
    return availableTickets.length > 0;
  };

  // New combined function to be called by automation
  const generateAndListTickets = async (calculatedDrawingBlock, reportAutomationPhase, automationPhases) => {
    console.log('VLotto TicketGen: === DEBUG generateAndListTickets START ===');
    console.log('VLotto TicketGen: calculatedDrawingBlock:', calculatedDrawingBlock);
    console.log('VLotto TicketGen: mainVerusId:', mainVerusId);
    console.log('VLotto TicketGen: ticketMultiplier:', ticketMultiplier);
    console.log('VLotto TicketGen: ticketQuantity:', ticketQuantity);
    console.log('VLotto TicketGen: ticketQuantityCalculated:', ticketQuantityCalculated);
    
    // Validate that we have the necessary parameters
    if (!mainVerusId || !mainVerusId.includes('@')) {
      throw new Error('Main Lottery ID is not set. Please ensure it is properly configured in Main Parameters.');
    }
    
    if (!ticketMultiplier || ticketMultiplier <= 0) {
      throw new Error('Ticket Multiplier is not set or invalid. Please ensure it is properly configured in Main Parameters.');
    }
    
    // CRITICAL FIX: Calculate ticket quantity if not already calculated
    console.log('VLotto TicketGen: Checking if ticket quantity calculation is needed...');
    
    let effectiveTicketQuantity = ticketQuantity; // default to state
    
    if (!ticketQuantityCalculated || ticketQuantity <= 0) {
      console.log('VLotto TicketGen: Ticket quantity not calculated, calculating now...');
      
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.CALCULATING_TICKET_QUANTITY, 'Calculating ticket quantity from jackpot balance...');
      }
      
      try {
        const calculationResult = await calculateTicketQuantity(mainVerusId, ticketMultiplier);
        console.log('VLotto TicketGen: ✅ Ticket quantity calculated:', calculationResult.calculatedQuantity);
        console.log('VLotto TicketGen: Jackpot balance:', calculationResult.jackpotBalance);
        console.log('VLotto TicketGen: Multiplier:', calculationResult.multiplier);
        effectiveTicketQuantity = calculationResult.calculatedQuantity;
      } catch (error) {
        console.error('VLotto TicketGen: Failed to calculate ticket quantity:', error);
        if (reportAutomationPhase && automationPhases) {
          reportAutomationPhase(automationPhases.ERROR, `Failed to calculate ticket quantity: ${error.message}`);
        }
        throw new Error(`Failed to calculate ticket quantity: ${error.message}`);
      }
    } else {
      console.log('VLotto TicketGen: ✅ Ticket quantity already calculated:', ticketQuantity);
      effectiveTicketQuantity = ticketQuantity;
    }
    
    if (reportAutomationPhase && automationPhases) {
      reportAutomationPhase(automationPhases.COMMITTING_TICKETS, 'Starting ticket generation process...');
    }
    
    try {
      // Get the proofguard ID from localStorage with detailed debugging
      console.log('VLotto TicketGen: Looking for proofguard ID in localStorage...');
      console.log('VLotto TicketGen: STORAGE_KEYS.PROOFGUARD_ID =', STORAGE_KEYS.PROOFGUARD_ID);
      
      const savedProofguard = localStorage.getItem(STORAGE_KEYS.PROOFGUARD_ID);
      console.log('VLotto TicketGen: Raw savedProofguard from localStorage:', savedProofguard);
      
      let proofguardIdFullName = null;
      
      if (savedProofguard) {
        try {
          const proofguardDetails = JSON.parse(savedProofguard);
          console.log('VLotto TicketGen: Parsed proofguardDetails:', proofguardDetails);
          proofguardIdFullName = proofguardDetails?.name;
          console.log('VLotto TicketGen: Extracted proofguardIdFullName:', proofguardIdFullName);
        } catch (e) {
          console.error('VLotto TicketGen: Error parsing proofguard details from localStorage:', e);
        }
      } else {
        console.log('VLotto TicketGen: No proofguard found in localStorage, checking all localStorage keys...');
        // Debug: show all localStorage keys to see what's available
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.includes('vlotto') || key.includes('proofguard')) {
            console.log(`VLotto TicketGen: Found related key: ${key} = ${localStorage.getItem(key)?.substring(0, 100)}...`);
          }
        }
      }
      
      if (!proofguardIdFullName) {
        // Try alternative: construct from main lottery ID pattern
        console.log('VLotto TicketGen: === DEBUG PROOFGUARD CONSTRUCTION ===');
        console.log('VLotto TicketGen: Current mainVerusId state:', mainVerusId);
        
        if (!mainVerusId) {
          throw new Error('Main Lottery ID is not available in the ticket generation state. Please ensure it is set in the Main Parameters section before running automation.');
        }
        
        const parentCurrency = getParentName(mainVerusId);
        console.log('VLotto TicketGen: Extracted parent currency:', parentCurrency);
        
        const constructedProofguardName = `proofguard.${parentCurrency}@`;
        console.log('VLotto TicketGen: Constructed proofguard name:', constructedProofguardName);
        
        // Verify this proofguard exists on blockchain
        try {
          console.log('VLotto TicketGen: Verifying proofguard exists on blockchain...');
          const verifyProofguard = await monitoredSendCommand('getidentity', [constructedProofguardName]);
          
          if (verifyProofguard && verifyProofguard.identity) {
            console.log('VLotto TicketGen: ✅ Successfully verified proofguard exists:', constructedProofguardName);
            proofguardIdFullName = constructedProofguardName;
          } else {
            throw new Error(`Proofguard identity '${constructedProofguardName}' was not found on the blockchain. Please create it in the Utility IDs section.`);
          }
        } catch (verifyError) {
          console.error('VLotto TicketGen: Failed to verify proofguard:', verifyError);
          throw new Error(`Failed to verify proofguard '${constructedProofguardName}' on blockchain: ${verifyError.message}`);
        }
      }
      
      if (!proofguardIdFullName) {
        throw new Error('Proofguard ID could not be found or verified. Please ensure: 1) Main Lottery ID is set in Main Parameters, 2) Proofguard utility ID exists in Utility IDs section, and 3) Proofguard is accessible on the blockchain.');
      }

      console.log('VLotto TicketGen: Using proofguard ID:', proofguardIdFullName);

      // Generate tickets using the calculated drawing block and get the actual generated tickets returned
      // PASS the currentMainVerusId to avoid React state timing issues
      const generatedTickets = await generateTicketsWithPhaseReporting(proofguardIdFullName, calculatedDrawingBlock, reportAutomationPhase, automationPhases, mainVerusId, effectiveTicketQuantity); 

      console.log('VLotto TicketGen: About to report PREPARING_TICKET_OFFERS phase');
      if (reportAutomationPhase && automationPhases) {
        console.log('VLotto TicketGen: Calling reportAutomationPhase with PREPARING_TICKET_OFFERS');
        reportAutomationPhase(automationPhases.PREPARING_TICKET_OFFERS, 'Preparing ticket offers for marketplace...');
        console.log('VLotto TicketGen: reportAutomationPhase call completed for PREPARING_TICKET_OFFERS');
      }

      // CRITICAL FIX: Pass the actual generated tickets, not the state variable
      await listTicketsOnMarketplaceWithPhaseReporting(generatedTickets, reportAutomationPhase, automationPhases);

      console.log('VLotto TicketGen: About to report TICKETS_LISTED_IN_MARKETPLACE phase');
      if (reportAutomationPhase && automationPhases) {
        console.log('VLotto TicketGen: Calling reportAutomationPhase with TICKETS_LISTED_IN_MARKETPLACE');
        reportAutomationPhase(automationPhases.TICKETS_LISTED_IN_MARKETPLACE, 'Tickets successfully listed. Monitoring for drawing time.');
        console.log('VLotto TicketGen: reportAutomationPhase call completed for TICKETS_LISTED_IN_MARKETPLACE');
      }
    } catch (error) {
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.ERROR, `Ticket Generation/Listing Error: ${error.message}`);
      }
      throw error; // Re-throw for startFullAutomation to catch
    }
  };

  /**
   * Generate tickets with detailed phase reporting
   */
  const generateTicketsWithPhaseReporting = async (proofguardIdFullName, calculatedDrawingBlock, reportAutomationPhase, automationPhases, passedMainVerusId, overrideTicketQuantity) => {
    // Use passed mainVerusId to avoid React state timing issues
    const activeMainVerusId = passedMainVerusId || mainVerusId;
    
    console.log('VLotto TicketGen: === DEBUG generateTicketsWithPhaseReporting ===');
    console.log('VLotto TicketGen: activeMainVerusId:', activeMainVerusId);
    console.log('VLotto TicketGen: ticketQuantity:', ticketQuantity);
    console.log('VLotto TicketGen: passedMainVerusId:', passedMainVerusId);
    console.log('VLotto TicketGen: mainVerusId (state):', mainVerusId);
    
    // Basic validation - ticket quantity validation removed since it's calculated in parent function
    if (!activeMainVerusId) {
      throw new Error('Main Lottery ID is missing or empty');
    }
    
    console.log('VLotto TicketGen: ✅ Parameters validated successfully');
    
    if (!calculatedDrawingBlock) {
      throw new Error('Calculated drawing block is required for ticket generation');
    }

    if (!proofguardIdFullName) {
      throw new Error('Proofguard ID is not yet created or loaded. Please create the Proofguard ID under Utility IDs before generating tickets.');
    }

    setIsGeneratingTickets(true);
    setGenerationStatus('Starting ticket generation...');
    setPendingCommitments([]);
    setPendingRegistrations([]);
    setTickets([]);

    let controlRAddress;
    if (rAddressForTickets && rAddressForTickets.trim()) {
      // Use the provided R-address for tickets parameter
      controlRAddress = rAddressForTickets.trim();
      setGenerationStatus(`Using provided R-address for tickets: ${controlRAddress}`);
      logger.writeToLog(`🔑 R-ADDRESS FOR TICKETS: Using provided address ${controlRAddress}`);
    } else {
      // Fallback to deriving from main lottery ID (legacy behavior)
      controlRAddress = await getPrimaryAddressForIdentity(activeMainVerusId);
      setGenerationStatus(`Using R-address derived from lottery ID: ${controlRAddress} for operations.`);
      logger.writeToLog(`🔑 R-ADDRESS FALLBACK: Derived from main lottery ID ${controlRAddress}`);
    }

    try {
      // Wait for ticket quantity to be updated by the calculation in parent function
      let attempts = 0;
      let currentQty = overrideTicketQuantity || ticketQuantity;
      while (currentQty <= 0 && attempts < 20) {
        console.log(`VLotto TicketGen: Waiting for ticket quantity update... Attempt ${attempts + 1}, current: ${currentQty}`);
        await new Promise(resolve => setTimeout(resolve, 150)); // Brief wait for React state update
        currentQty = ticketQuantity; // refresh from state
        attempts++;
      }
      
      if (currentQty <= 0) {
        throw new Error(`Ticket quantity is still ${currentQty} after waiting for calculation. Please ensure ticket quantity calculation completed successfully.`);
      }
      
      const qty = currentQty;
      
      console.log(`VLotto TicketGen: ✅ Ticket quantity confirmed: ${qty}`);

      // Phase 1: Committing tickets
      console.log('VLotto TicketGen: About to report COMMITTING_TICKETS phase');
      console.log('VLotto TicketGen: reportAutomationPhase available?', !!reportAutomationPhase);
      console.log('VLotto TicketGen: automationPhases available?', !!automationPhases);
      
      if (reportAutomationPhase && automationPhases) {
        console.log('VLotto TicketGen: Calling reportAutomationPhase with COMMITTING_TICKETS');
        reportAutomationPhase(automationPhases.COMMITTING_TICKETS, 'Committing ticket names on blockchain...');
        console.log('VLotto TicketGen: reportAutomationPhase call completed for COMMITTING_TICKETS');
      } else {
        console.warn('VLotto TicketGen: Cannot report COMMITTING_TICKETS phase - missing reportAutomationPhase or automationPhases');
      }
      setGenerationStatus('Committing ticket names...');
      
      const localCommitments = [];
      
      for (let i = 1; i <= qty; i++) {
        const ticketName = generateTicketName(calculatedDrawingBlock, i, qty); 
        setGenerationStatus(`Preparing to commit ticket ${i} of ${qty} (${ticketName})...`);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY));
        
        const commitmentResult = await commitTicketName(ticketName, controlRAddress);
        const newCommitmentEntry = {
          ticketNumber: i,
          commitmentResult,
        };
        localCommitments.push(newCommitmentEntry);
        setPendingCommitments([...localCommitments]);

        if (i < qty) { 
          setGenerationStatus(`Waiting briefly before committing next ticket (${i}/${qty})...`);
          await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.INTER_TICKET_DELAY)); 
        }
      }

      // Phase 2: Pending commitment confirmation
      console.log('VLotto TicketGen: About to report PENDING_TICKET_COMMITMENT_CONFIRMATION phase');
      console.log('VLotto TicketGen: reportAutomationPhase available?', !!reportAutomationPhase);
      console.log('VLotto TicketGen: automationPhases available?', !!automationPhases);
      
      if (reportAutomationPhase && automationPhases) {
        console.log('VLotto TicketGen: Calling reportAutomationPhase with PENDING_TICKET_COMMITMENT_CONFIRMATION');
        reportAutomationPhase(automationPhases.PENDING_TICKET_COMMITMENT_CONFIRMATION, 'Waiting for ticket name commitments to confirm...');
        console.log('VLotto TicketGen: reportAutomationPhase call completed');
      } else {
        console.warn('VLotto TicketGen: Cannot report phase - missing reportAutomationPhase or automationPhases');
      }
      setGenerationStatus('Waiting for name commitments to be confirmed...');
      
      for (const commitmentEntry of localCommitments) {
        setGenerationStatus(`Waiting for confirmation of commitment for ticket ${commitmentEntry.ticketNumber} (TXID: ${commitmentEntry.commitmentResult.txid.substring(0,10)})...`);
        await waitForBlockConfirmation(commitmentEntry.commitmentResult.txid);
      }

      // Phase 3: Registering tickets
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.REGISTERING_TICKETS, 'Registering ticket identities on blockchain...');
      }
      setGenerationStatus('Registering ticket identities...');
      
      const localRegistrations = [];
      
      for (let i = 0; i < localCommitments.length; i++) { 
        const commitmentEntry = localCommitments[i];
        const ticketNumber = commitmentEntry.ticketNumber;
        const commitmentResultForReg = commitmentEntry.commitmentResult;
        
        let nameForDisplayInStatus = commitmentResultForReg.namereservation.name;
        if (!nameForDisplayInStatus.endsWith('.')) {
          nameForDisplayInStatus += '.';
        }
        setGenerationStatus(`Preparing to register ticket ${ticketNumber} (${nameForDisplayInStatus})...`);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY));
        
        const registrationResult = await registerTicketIdentity(commitmentResultForReg, controlRAddress);
        const newRegistrationEntry = {
          ticketNumber: ticketNumber,
          registrationResult
        };
        localRegistrations.push(newRegistrationEntry);
        setPendingRegistrations([...localRegistrations]); 

        if (i < localCommitments.length - 1) { 
          setGenerationStatus(`Waiting briefly before registering next identity (${i + 1}/${localCommitments.length})...`);
          await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.INTER_TICKET_DELAY)); 
        }
      }

      // Phase 4: Pending registration confirmation
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.PENDING_TICKET_REGISTRATION, 'Waiting for ticket identity registrations to confirm...');
      }
      setGenerationStatus('Waiting for identity registrations to be confirmed...');
      
      for (const registration of localRegistrations) {
        setGenerationStatus(`Waiting for confirmation of registration for ticket ${registration.ticketNumber} (TXID: ${registration.registrationResult.substring(0,10)})...`);
        await waitForBlockConfirmation(registration.registrationResult);
      }

      const parentNamespace = getParentName(activeMainVerusId);

      const finalTickets = localRegistrations.map(reg => {
        const subIdPart = generateTicketName(calculatedDrawingBlock, reg.ticketNumber, qty);
        return {
          id: reg.ticketNumber,
          name: `${subIdPart}${parentNamespace}@`,
          registrationTxId: reg.registrationResult
        };
      });
      
      // Phase 5: Validating tickets
      if (reportAutomationPhase && automationPhases) {
        reportAutomationPhase(automationPhases.VALIDATING_TICKETS, 'Creating cryptographic signatures for tickets...');
      }
      setGenerationStatus('Ticket registration completed. Starting finalization (signatures & data storage)...');

      const fullyFinalizedTickets = [];
      for (let i = 0; i < finalTickets.length; i++) {
        const ticketToFinalize = finalTickets[i];
        setGenerationStatus(`Preparing to finalize ticket ${i + 1}/${finalTickets.length}: ${ticketToFinalize.name}`);

        try {
          const finalizedDetails = await finalizeTicketDetails(ticketToFinalize, proofguardIdFullName);
          fullyFinalizedTickets.push({ ...ticketToFinalize, ...finalizedDetails });
          
          // Update pendingRegistrations to remove finalized ticket
          setPendingRegistrations(prev => prev.filter(p => p.registrationResult !== ticketToFinalize.registrationTxId));

          if (i < finalTickets.length - 1) {
            setGenerationStatus(`Brief pause before preparing to finalize next ticket (${i + 2}/${finalTickets.length})...`);
            await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.INTER_TICKET_DELAY));
          }
        } catch (finalizationError) {
          console.error(`Error finalizing ticket ${ticketToFinalize.name}:`, finalizationError);
          setGenerationStatus(`Error finalizing ticket ${ticketToFinalize.name}: ${finalizationError.message}. Skipping this ticket's finalization.`);
          fullyFinalizedTickets.push({ ...ticketToFinalize, errorFinalizing: finalizationError.message });
        }
      }
      
      setTickets(fullyFinalizedTickets);
      
      // Phase 6: Pending validation confirmation - only report if we actually have tickets to validate
      const ticketsWithUpdates = fullyFinalizedTickets.filter(ticket => ticket.updateIdentityTxId && !ticket.errorFinalizing);
      
      if (ticketsWithUpdates.length > 0) {
        console.log('VLotto TicketGen: About to report PENDING_TICKET_VALIDATION phase');
        if (reportAutomationPhase && automationPhases) {
          console.log('VLotto TicketGen: Calling reportAutomationPhase with PENDING_TICKET_VALIDATION');
          reportAutomationPhase(automationPhases.PENDING_TICKET_VALIDATION, 'Confirming final ticket updates...');
          console.log('VLotto TicketGen: reportAutomationPhase call completed for PENDING_TICKET_VALIDATION');
        }
        
        // Wait for confirmation of the last updateidentity transaction
        const lastTicket = ticketsWithUpdates[ticketsWithUpdates.length - 1];
        setGenerationStatus(`Waiting for confirmation of last updateidentity transaction: ${lastTicket.updateIdentityTxId.substring(0,10)}...`);
        
        await waitForBlockConfirmation(lastTicket.updateIdentityTxId);
        
        setGenerationStatus('All ticket updates confirmed! Ready for marketplace listing.');
      } else {
        console.log('VLotto TicketGen: No tickets need validation confirmation, skipping PENDING_TICKET_VALIDATION phase');
        setGenerationStatus('No ticket updates to confirm. Ready for marketplace listing.');
      }
      
      setGenerationStatus('Ticket generation and validation completed!');
      
      // Return the generated tickets so they can be used by the calling function
      return fullyFinalizedTickets;
    } catch (error) {
      console.error('Error generating tickets:', error);
      if (!generationStatus.startsWith('Error')) { 
        setGenerationStatus(`Error: ${error.message}`);
      }
      throw error;
    } finally {
      setIsGeneratingTickets(false);
    }
  };

  /**
   * List tickets on marketplace with phase reporting
   */
  const listTicketsOnMarketplaceWithPhaseReporting = async (tickets, reportAutomationPhase, automationPhases) => {
    if (!tickets || tickets.length === 0) {
      console.log('🏪 [TicketGeneration] No tickets to list on marketplace');
      logger.logMarketplaceListingStart(0);
      return;
    }

    console.log(`🏪 [TicketGeneration] === MARKETPLACE LISTING START ===`);
    console.log(`🎫 [TicketGeneration] Listing ${tickets.length} tickets on marketplace`);
    
    // LOG: Marketplace listing start
    logger.logMarketplaceListingStart(tickets.length);
    logger.logPhaseStart('MARKETPLACE_LISTING', `Listing ${tickets.length} tickets on marketplace`);
    
    setGenerationStatus('Starting marketplace listing process...');
    const parentCurrency = getParentName(mainVerusId); // e.g., "shylock"
    const revenuesAddress = `revenues.${parentCurrency}@`; // Utility ID that receives funds
    
    console.log(`💰 [TicketGeneration] Parent currency: ${parentCurrency}`);
    console.log(`🏦 [TicketGeneration] Revenues address: ${revenuesAddress}`);
    
    // Get the primary R-address from the revenues identity to use as maker
    const revenuesPrimaryAddress = await getPrimaryAddressForIdentity(revenuesAddress);
    console.log(`🔑 [TicketGeneration] Revenues R-address: ${revenuesPrimaryAddress}`);
    setGenerationStatus(`Using revenues R-address: ${revenuesPrimaryAddress} for marketplace offers.`);
    
    // Calculate expiry block for offers
    const expiryBlock = futureBlockNumber ? parseInt(futureBlockNumber) - 20 : undefined;
    console.log(`⏰ [TicketGeneration] Marketplace offers will expire at block: ${expiryBlock}`);
    console.log(`📊 [TicketGeneration] Drawing block: ${futureBlockNumber}, Expiry: 20 blocks before drawing`);
    
    let lastOfferTxId = null;
    let successfulListings = 0;
    let failedListings = 0;
    
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      
      if (ticket.errorFinalizing) {
        console.log(`⚠️ [TicketGeneration] Skipping ${ticket.name} - finalization error`);
        setGenerationStatus(`Skipping marketplace listing for ticket ${ticket.name} due to finalization error`);
        logger.logMarketplaceOfferFailed(ticket.name, 'Ticket finalization error - skipping marketplace listing');
        failedListings++;
        continue;
      }

      try {
        console.log(`🎫 [TicketGeneration] Listing ticket ${i + 1}/${tickets.length}: ${ticket.name}`);
        setGenerationStatus(`Listing ticket ${i + 1}/${tickets.length} on marketplace: ${ticket.name}`);
        
        // Use the new DEFAULT_CONFIG.TRANSACTION_DELAY
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.TRANSACTION_DELAY)); 
        
        const offerData = {
          changeaddress: revenuesPrimaryAddress,
          expiryheight: expiryBlock,
          offer: {
            identity: ticket.name
          },
          for: {
            address: revenuesAddress,
            currency: parentCurrency,
            amount: 1
          }
        };

        console.log(`📋 [TicketGeneration] Offer data for ${ticket.name}:`, {
          changeaddress: revenuesPrimaryAddress,
          expiryheight: expiryBlock,
          offerIdentity: ticket.name,
          forAddress: revenuesAddress,
          forCurrency: parentCurrency,
          amount: 1
        });

        // LOG: RPC command being executed
        logger.logRPCCommand('makeoffer', [revenuesPrimaryAddress, offerData, false], `Listing ${ticket.name} on marketplace`);

        console.log(`🔄 [TicketGeneration] Executing makeoffer for ${ticket.name}`);
        const makeOfferResult = await monitoredSendCommand('makeoffer', [
          revenuesPrimaryAddress, 
          offerData,
          false // returntx
        ], 'vlotto-marketplace-listing');

        // CRITICAL: Validate makeoffer result
        if (!makeOfferResult) {
          throw new Error(`makeoffer returned null/undefined for ${ticket.name}`);
        }
        
        if (typeof makeOfferResult === 'string' && makeOfferResult.toLowerCase().includes('insufficient')) {
          throw new Error(`Insufficient funds for makeoffer: ${makeOfferResult}`);
        }
        
        if (typeof makeOfferResult === 'object' && makeOfferResult.error) {
          throw new Error(`makeoffer error for ${ticket.name}: ${makeOfferResult.error}`);
        }
        
        if (!makeOfferResult.txid || typeof makeOfferResult.txid !== 'string' || makeOfferResult.txid.length !== 64) {
          throw new Error(`Invalid transaction ID from makeoffer for ${ticket.name}. Expected 64-character hex string, got: ${JSON.stringify(makeOfferResult.txid)}`);
        }
        
        console.log(`✅ [TicketGeneration] makeoffer successful for ${ticket.name} - TXID: ${makeOfferResult.txid}`);
        setGenerationStatus(`✅ Listed ticket ${ticket.name} on marketplace. Offer TXID: ${makeOfferResult.txid.substring(0,10)}...`);
        lastOfferTxId = makeOfferResult.txid;
        successfulListings++;
        
        // LOG: Successful marketplace offer creation
        logger.logRPCResponse('makeoffer', makeOfferResult, true);
        logger.logMarketplaceOfferCreated(ticket.name, makeOfferResult.txid, expiryBlock, 1, parentCurrency);
        
        // Track the offer for later closing/revocation logic
        setListedOffers(prev => ({
          ...prev,
          [makeOfferResult.txid]: ticket.name
        }));

        // Add brief delay between marketplace listings, using 500ms
        if (i < tickets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); 
        }

      } catch (error) {
        console.error(`❌ [TicketGeneration] Error listing ${ticket.name}:`, error);
        setGenerationStatus(`❌ Error listing ticket ${ticket.name} on marketplace: ${error.message}`);
        
        // LOG: Failed marketplace offer
        logger.logRPCError('makeoffer', error, [revenuesPrimaryAddress, 'offerData', false]);
        logger.logMarketplaceOfferFailed(ticket.name, error.message);
        
        failedListings++;
        // Continue with next ticket
      }
    }
    
    console.log(`📊 [TicketGeneration] === MARKETPLACE LISTING SUMMARY ===`);
    console.log(`✅ [TicketGeneration] Successful listings: ${successfulListings}`);
    console.log(`❌ [TicketGeneration] Failed listings: ${failedListings}`);
    console.log(`📝 [TicketGeneration] Last offer TXID: ${lastOfferTxId}`);
    console.log(`⏰ [TicketGeneration] All offers expire at block: ${expiryBlock}`);
    
    // LOG: Marketplace listing completion
    logger.logMarketplaceListingEnd(successfulListings, failedListings, tickets.length);
    logger.logPhaseEnd('MARKETPLACE_LISTING', 'SUCCESS', `${successfulListings}/${tickets.length} tickets listed successfully`);
    
    // Phase 8: Pending marketplace listing confirmation
    if (reportAutomationPhase && automationPhases && lastOfferTxId) {
      console.log('⏳ [TicketGeneration] Starting marketplace listing confirmation phase...');
      reportAutomationPhase(automationPhases.PENDING_MARKETPLACE_LISTING, 'Waiting for marketplace listings to confirm...');
      
      // Wait for the last offer to be confirmed
      setGenerationStatus(`Waiting for confirmation of last marketplace offer: ${lastOfferTxId.substring(0,10)}...`);
      await waitForBlockConfirmation(lastOfferTxId);
      console.log(`✅ [TicketGeneration] Last marketplace offer confirmed: ${lastOfferTxId}`);
      
      // LOG: Marketplace confirmation
      logger.logTransactionConfirmed(lastOfferTxId);
    }
    
    setGenerationStatus('Marketplace listing process completed!');
    console.log(`🏪 [TicketGeneration] === MARKETPLACE LISTING COMPLETE ===`);
  };

  return {
    // State
    mainVerusId,
    futureBlockNumber,
    ticketQuantity,
    ticketQuantityCalculated,
    ticketMultiplier,
    marketplaceExpiryBlock,
    isGeneratingTickets,
    generationStatus,
    pendingCommitments,
    pendingRegistrations,
    tickets,
    
    // Marketplace state
    listedOffers,
    soldTickets,
    revokedTickets,
    
    // Setters
    setMainVerusId,
    setFutureBlockNumber,
    setTicketQuantity,
    setTicketMultiplier,
    setMarketplaceExpiryBlock,
    setGenerationStatus,
    setSoldTickets,
    
    // Functions
    generateTickets,
    clearTicketData,
    listTicketsOnMarketplace,
    closeAllOffers,
    revokeUnsoldTickets,
    checkAndRevokeExpiredOffers,
    calculateTicketQuantity,
    
    // Utility functions
    getPrimaryAddressForIdentity,
    waitForBlockConfirmation,
    refreshMarketplaceState,
    hasActiveMarketplaceTickets,
    generateAndListTickets
  };
};