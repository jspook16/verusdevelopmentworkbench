import { useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_CONFIG } from '../utils/constants';
import { getParentName } from '../utils/ticketHelpers';

export const useUtilityIds = (sendCommand) => {
  // State for each utility ID type
  const [jackpotIdDetails, setJackpotIdDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JACKPOT_ID);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
        }
        return parsed;
      }
      return null;
    } catch (e) { 
      console.error("Failed to parse jackpotIdDetails from localStorage", e); 
      return null; 
    }
  });

  const [payoutIdDetails, setPayoutIdDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYOUT_ID);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
        }
        return parsed;
      }
      return null;
    } catch (e) { 
      console.error("Failed to parse payoutIdDetails from localStorage", e); 
      return null; 
    }
  });

  const [operationsIdDetails, setOperationsIdDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATIONS_ID);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
        }
        return parsed;
      }
      return null;
    } catch (e) { 
      console.error("Failed to parse operationsIdDetails from localStorage", e); 
      return null; 
    }
  });

  const [proofguardIdDetails, setProofguardIdDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROOFGUARD_ID);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
        }
        return parsed;
      }
      return null;
    } catch (e) { 
      console.error("Failed to parse proofguardIdDetails from localStorage", e); 
      return null; 
    }
  });

  const [reservesIdDetails, setReservesIdDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVES_ID);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
        }
        return parsed;
      }
      return null;
    } catch (e) { 
      console.error("Failed to parse reservesIdDetails from localStorage", e); 
      return null; 
    }
  });

  const [revenuesIdDetails, setRevenuesIdDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVENUES_ID);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
        }
        return parsed;
      }
      return null;
    } catch (e) { 
      console.error("Failed to parse revenuesIdDetails from localStorage", e); 
      return null; 
    }
  });

  // Utility states
  const [isCreatingUtilityId, setIsCreatingUtilityId] = useState(false);
  const [utilityIdStatus, setUtilityIdStatus] = useState('');

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      if (jackpotIdDetails) {
        localStorage.setItem(STORAGE_KEYS.JACKPOT_ID, JSON.stringify(jackpotIdDetails));
      } else {
        localStorage.removeItem(STORAGE_KEYS.JACKPOT_ID);
      }
    } catch (e) { console.error("Failed to save jackpotIdDetails to localStorage", e); }
  }, [jackpotIdDetails]);

  useEffect(() => {
    try {
      if (payoutIdDetails) {
        localStorage.setItem(STORAGE_KEYS.PAYOUT_ID, JSON.stringify(payoutIdDetails));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PAYOUT_ID);
      }
    } catch (e) { console.error("Failed to save payoutIdDetails to localStorage", e); }
  }, [payoutIdDetails]);

  useEffect(() => {
    try {
      if (operationsIdDetails) {
        localStorage.setItem(STORAGE_KEYS.OPERATIONS_ID, JSON.stringify(operationsIdDetails));
      } else {
        localStorage.removeItem(STORAGE_KEYS.OPERATIONS_ID);
      }
    } catch (e) { console.error("Failed to save operationsIdDetails to localStorage", e); }
  }, [operationsIdDetails]);

  useEffect(() => {
    try {
      if (proofguardIdDetails) {
        localStorage.setItem(STORAGE_KEYS.PROOFGUARD_ID, JSON.stringify(proofguardIdDetails));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROOFGUARD_ID);
      }
    } catch (e) { console.error("Failed to save proofguardIdDetails to localStorage", e); }
  }, [proofguardIdDetails]);

  useEffect(() => {
    try {
      if (reservesIdDetails) {
        localStorage.setItem(STORAGE_KEYS.RESERVES_ID, JSON.stringify(reservesIdDetails));
      } else {
        localStorage.removeItem(STORAGE_KEYS.RESERVES_ID);
      }
    } catch (e) { console.error("Failed to save reservesIdDetails to localStorage", e); }
  }, [reservesIdDetails]);

  useEffect(() => {
    try {
      if (revenuesIdDetails) {
        localStorage.setItem(STORAGE_KEYS.REVENUES_ID, JSON.stringify(revenuesIdDetails));
      } else {
        localStorage.removeItem(STORAGE_KEYS.REVENUES_ID);
      }
    } catch (e) { console.error("Failed to save revenuesIdDetails to localStorage", e); }
  }, [revenuesIdDetails]);

  /**
   * Get primary address for an identity
   */
  const getPrimaryAddressForIdentity = async (identityId) => {
    if (!identityId.includes('@')) {
      console.warn(`getPrimaryAddressForIdentity: Input '${identityId}' does not appear to be an i-address. Using it directly as control address. Ensure it is a valid R-address in the wallet.`);
      return identityId;
    }
    try {
      const identityData = await sendCommand('getidentity', [identityId]);
      if (identityData && identityData.identity && identityData.identity.primaryaddresses && identityData.identity.primaryaddresses.length > 0) {
        return identityData.identity.primaryaddresses[0];
      }
      throw new Error(`Primary R-address not found for ${identityId}. Response: ${JSON.stringify(identityData)}`);
    } catch (error) {
      console.error(`Error fetching primary R-address for ${identityId}:`, error);
      throw error; 
    }
  };

  /**
   * Check if a transaction is confirmed
   */
  const checkBlockConfirmation = async (txid) => {
    try {
      const result = await sendCommand('gettransaction', [txid], `vlotto-check-confirmation-${txid.substring(0,10)}`);
      return result.confirmations > 0;
    } catch (error) {
      console.error('Error checking block confirmation:', error);
      return false;
    }
  };

  /**
   * Wait for transaction confirmation
   */
  const waitForBlockConfirmation = async (txid, maxAttempts = DEFAULT_CONFIG.MAX_CONFIRMATION_ATTEMPTS) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
      if (await checkBlockConfirmation(txid)) {
        return true;
      }
      setUtilityIdStatus(`Waiting for confirmation of ${txid.substring(0,10)}... Attempt ${attempts + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.CONFIRMATION_CHECK_INTERVAL)); 
      attempts++;
    }
    console.warn(`Transaction ${txid} did not confirm after ${maxAttempts} attempts.`);
    return false;
  };

  /**
   * Commit a name for identity creation
   */
  const commitIdentityName = async (name, controlAddress, parentName, mainVerusId) => {
    try {
      // Use primary R-address of mainVerusId for sourceoffunds (has VRSCTEST for fees)
      const mainIdRAddress = await getPrimaryAddressForIdentity(mainVerusId);
      
      const result = await sendCommand('registernamecommitment', [
        name,             
        controlAddress,   
        '',               
        parentName,       
        mainIdRAddress    // sourceoffunds - use R-address instead of identity (has VRSCTEST)
      ], 'vlotto-commit-name');
      
      return result;
    } catch (error) {
      console.error('Error committing identity name:', error);
      throw error;
    }
  };

  /**
   * Register an identity
   */
  const registerIdentity = async (commitmentResult, controlAddress, mainVerusId) => {
    const parentName = getParentName(mainVerusId);
    let nameForRegistration; 
    
    try {
      // Use primary R-address of mainVerusId for sourceoffunds (has VRSCTEST for fees)
      const mainIdRAddress = await getPrimaryAddressForIdentity(mainVerusId);
      
      const nameFromCommitmentOutput = commitmentResult.namereservation.name;
      nameForRegistration = nameFromCommitmentOutput.endsWith('.') 
                              ? nameFromCommitmentOutput 
                              : nameFromCommitmentOutput + '.';

      const result = await sendCommand('registeridentity', [{
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
          primaryaddresses: [controlAddress], 
          minimumsignatures: 1,
          revocationauthority: mainVerusId, 
          recoveryauthority: mainVerusId  
        },
        sourceoffunds: mainIdRAddress,  // Use R-address instead of identity (has VRSCTEST)
        changeaddress: mainIdRAddress   // Use R-address for change as well
      }], 'vlotto-register-identity');
      
      return result;
    } catch (error) {
      console.error('Error registering identity:', error);
      setUtilityIdStatus(`Error registering identity for ${nameForRegistration || 'unknown name'}: ${error.message}`);
      throw error;
    }
  };

  /**
   * Fetch balance for a VLotto sub-ID
   */
  const fetchVlottoSubIdBalance = async (fullIdName, primaryCurrency, idTypeForStatus) => {
    if (!fullIdName) return {};
    if (idTypeForStatus) {
      setUtilityIdStatus(`Refreshing ${idTypeForStatus} ID balances for ${fullIdName}...`);
    }
    
    try {
      setUtilityIdStatus(`Fetching balances for ${fullIdName} via getcurrencybalance...`);
      const balanceResult = await sendCommand('getcurrencybalance', [fullIdName], `vlotto-get-currencybalance-${fullIdName}`);
      
      if (!balanceResult || typeof balanceResult !== 'object') {
        throw new Error(`Invalid or empty response from getcurrencybalance for ${fullIdName}`);
      }

      // Return all currencies found
      const currencies = { ...balanceResult };
      
      if (idTypeForStatus) {
        const currencyList = Object.entries(currencies)
          .map(([currency, amount]) => `${currency}: ${amount}`)
          .join(', ');
        setUtilityIdStatus(`${idTypeForStatus} ID Balances: ${currencyList || 'No balances found'}`);
      }
      
      return currencies;
    } catch (error) {
      console.error(`Error fetching balance for ${fullIdName}:`, error);
      if (idTypeForStatus) {
        setUtilityIdStatus(`Error refreshing ${idTypeForStatus} balance: ${error.message}`);
      }
      return {};
    }
  };

  /**
   * Create or verify a utility ID
   */
  const handleCreateUtilityId = async (baseSubIdName, mainVerusId) => {
    if (!mainVerusId) {
      throw new Error('Main VerusID is required');
    }

    setIsCreatingUtilityId(true);
    setUtilityIdStatus(`Processing ${baseSubIdName} ID...`);

    let controlRAddress;
    const fullSubIdNameToCommit = baseSubIdName + '.';
    const parentNamespace = getParentName(mainVerusId);
    const expectedFullName = `${baseSubIdName}.${parentNamespace}@`;
    let registrationResultTxid = 'N/A (existing or pre-created)'; 
    let idProcessedSuccessfully = false;

    try {
      setUtilityIdStatus(`Fetching primary R-address for ${mainVerusId}...`);
      controlRAddress = await getPrimaryAddressForIdentity(mainVerusId);
      setUtilityIdStatus(`Using R-address: ${controlRAddress} for ${baseSubIdName} ID operations.`);

      try {
        setUtilityIdStatus(`Checking if ${expectedFullName} already exists...`);
        const existingIdentity = await sendCommand('getidentity', [expectedFullName]);
        if (existingIdentity && existingIdentity.identity) {
          setUtilityIdStatus(`${expectedFullName} already exists. Reg TXID: ${existingIdentity.txid || 'N/A'}. Fetching balance.`);
          registrationResultTxid = existingIdentity.txid || registrationResultTxid;
          idProcessedSuccessfully = true; 
        }
      } catch (e) {
        setUtilityIdStatus(`${expectedFullName} not found, attempting creation...`);
        
        setUtilityIdStatus(`Committing name for ${fullSubIdNameToCommit} under parent ${parentNamespace}...`);
        const commitmentResult = await commitIdentityName(fullSubIdNameToCommit, controlRAddress, parentNamespace, mainVerusId);
        setUtilityIdStatus(`${baseSubIdName} ID Name Commitment TXID: ${commitmentResult.txid}`);
        registrationResultTxid = commitmentResult.txid; 

        setUtilityIdStatus(`Waiting for ${baseSubIdName} ID name commitment to confirm...`);
        const isCommitted = await waitForBlockConfirmation(commitmentResult.txid);
        if (!isCommitted) throw new Error(`Name commitment for ${fullSubIdNameToCommit} failed to confirm.`);
        setUtilityIdStatus(`${baseSubIdName} ID Name commitment confirmed.`);

        setUtilityIdStatus(`Registering identity for ${fullSubIdNameToCommit}...`);
        const regTxid = await registerIdentity(commitmentResult, controlRAddress, mainVerusId);
        registrationResultTxid = regTxid; 
        setUtilityIdStatus(`${baseSubIdName} ID Registration TXID: ${registrationResultTxid}`);
        
        let finalStatusMessage = `${baseSubIdName} ID (${expectedFullName}) created! TXID: ${registrationResultTxid}.`;
        setUtilityIdStatus(`Waiting for ${baseSubIdName} ID registration to confirm...`);
        const isRegistered = await waitForBlockConfirmation(registrationResultTxid);
        if (!isRegistered) {
            finalStatusMessage = `Registration for ${baseSubIdName} ID sent (TXID: ${registrationResultTxid}), but confirmation check timed out. Verify manually.`;
        }
        setUtilityIdStatus(finalStatusMessage);
        idProcessedSuccessfully = true;
      }

      if (idProcessedSuccessfully) {
        setUtilityIdStatus(`Fetching balance for ${expectedFullName}...`);
        const balances = await fetchVlottoSubIdBalance(expectedFullName, parentNamespace, baseSubIdName);
        
        const details = { 
          name: expectedFullName, 
          txid: registrationResultTxid, 
          parent: mainVerusId, 
          balances: balances,
          primaryCurrency: parentNamespace 
        };
        
        // Update the appropriate state
        const setterMap = {
          'jackpot': setJackpotIdDetails,
          'payout': setPayoutIdDetails,
          'operations': setOperationsIdDetails,
          'proofguard': setProofguardIdDetails,
          'reserves': setReservesIdDetails,
          'revenues': setRevenuesIdDetails
        };
        
        const setter = setterMap[baseSubIdName];
        if (setter) {
          setter(details);
        }
      } else if (!utilityIdStatus.startsWith('Error')) {
         setUtilityIdStatus(`Could not confirm status or create ${expectedFullName}. Please check manually or try again.`);
      }

    } catch (error) {
      console.error(`Error processing ${baseSubIdName} ID:`, error);
      if (!utilityIdStatus.startsWith('Error')) { 
        setUtilityIdStatus(`Error processing ${baseSubIdName} ID: ${error.message}`);
      }
      throw error;
    } finally {
      setIsCreatingUtilityId(false);
    }
  };

  /**
   * Refresh balance for a specific utility ID
   */
  const refreshBalance = async (idType) => {
    const detailsMap = {
      'jackpot': jackpotIdDetails,
      'payout': payoutIdDetails,
      'operations': operationsIdDetails,
      'proofguard': proofguardIdDetails,
      'reserves': reservesIdDetails,
      'revenues': revenuesIdDetails
    };
    
    const setterMap = {
      'jackpot': setJackpotIdDetails,
      'payout': setPayoutIdDetails,
      'operations': setOperationsIdDetails,
      'proofguard': setProofguardIdDetails,
      'reserves': setReservesIdDetails,
      'revenues': setRevenuesIdDetails
    };
    
    const details = detailsMap[idType];
    const setter = setterMap[idType];
    
    if (!details || !setter) {
      throw new Error(`Invalid utility ID type: ${idType}`);
    }
    
    try {
      const newBalances = await fetchVlottoSubIdBalance(details.name, details.primaryCurrency, idType);
      setter({ ...details, balances: newBalances });
      return newBalances;
    } catch (error) {
      console.error(`Error refreshing balance for ${idType}:`, error);
      throw error;
    }
  };

  /**
   * Get utility ID details by type
   */
  const getUtilityIdDetails = (idType) => {
    const detailsMap = {
      'jackpot': jackpotIdDetails,
      'payout': payoutIdDetails,
      'operations': operationsIdDetails,
      'proofguard': proofguardIdDetails,
      'reserves': reservesIdDetails,
      'revenues': revenuesIdDetails
    };
    return detailsMap[idType] || null;
  };

  return {
    // State
    jackpotIdDetails,
    payoutIdDetails,
    operationsIdDetails,
    proofguardIdDetails,
    reservesIdDetails,
    revenuesIdDetails,
    isCreatingUtilityId,
    utilityIdStatus,
    
    // State setters (for external updates if needed)
    setJackpotIdDetails,
    setPayoutIdDetails,
    setOperationsIdDetails,
    setProofguardIdDetails,
    setReservesIdDetails,
    setRevenuesIdDetails,
    
    // Functions
    handleCreateUtilityId,
    fetchVlottoSubIdBalance,
    refreshBalance,
    getUtilityIdDetails,
    
    // Utility functions (could be useful for other hooks)
    getPrimaryAddressForIdentity,
    waitForBlockConfirmation,
    commitIdentityName,
    registerIdentity
  };
}; 