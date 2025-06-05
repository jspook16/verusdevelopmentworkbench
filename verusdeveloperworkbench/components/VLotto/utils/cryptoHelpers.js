// Cryptographic utility functions for VLotto

/**
 * Sign a message with an identity
 * @param {Function} sendCommand - The command sender function
 * @param {string} identity - The identity to sign with
 * @param {string} message - The message to sign
 * @returns {Promise<Object>} Object with hash and signature
 */
export const signMessage = async (sendCommand, identity, message) => {
  const result = await sendCommand('signmessage', [identity, message]);
  if (!result || result.error || !result.signature) {
    throw new Error(`Failed to sign message with ${identity}: ${result?.error?.message || 'No signature returned'}`);
  }
  return {
    hash: result.hash,
    signature: result.signature
  };
};

/**
 * Verify a message signature
 * @param {Function} sendCommand - The command sender function
 * @param {string} identity - The identity that signed the message
 * @param {string} signature - The signature to verify
 * @param {string} message - The original message
 * @returns {Promise<boolean>} True if signature is valid
 */
export const verifyMessage = async (sendCommand, identity, signature, message) => {
  try {
    const result = await sendCommand('verifymessage', [identity, signature, message]);
    return result === true;
  } catch (error) {
    console.warn(`Message verification failed for ${identity}:`, error);
    return false;
  }
};

/**
 * Create contentmultimap update structure for updateidentity
 * @param {Object} vdxfKeys - Object containing VDXF key constants
 * @param {Object} ticketPayload - The ticket payload to store
 * @returns {Object} ContentMultiMap structure for updateidentity
 */
export const createContentMultiMapUpdate = (vdxfKeys, ticketPayload) => {
  return {
    [vdxfKeys.PRIMARY_TICKET_FINALIZED_DATA]: [
      {
        [vdxfKeys.DATA_DESCRIPTOR]: {
          version: 1,
          flags: 96,  // Working examples use 96
          mimetype: "text/plain",  // Working examples use text/plain
          objectdata: {
            message: JSON.stringify(ticketPayload)  // Store JSON payload as stringified message
          }, 
          label: "VLotto Ticket Chain of Custody Data" 
        }
      }
    ]
  };
};

/**
 * Extract and parse VLotto data from identity contentmultimap
 * @param {Object} identityData - Identity data from getidentity
 * @param {Object} vdxfKeys - Object containing VDXF key constants
 * @returns {Object|null} Parsed VLotto data or null if not found
 */
export const extractVLottoData = (identityData, vdxfKeys) => {
  const contentmultimap = identityData?.identity?.contentmultimap;
  
  if (!contentmultimap || !contentmultimap[vdxfKeys.PRIMARY_TICKET_FINALIZED_DATA]) {
    return null;
  }

  const dataArray = contentmultimap[vdxfKeys.PRIMARY_TICKET_FINALIZED_DATA];
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return null;
  }

  const dataEntry = dataArray[0];
  if (!dataEntry[vdxfKeys.DATA_DESCRIPTOR]) {
    return null;
  }

  const descriptor = dataEntry[vdxfKeys.DATA_DESCRIPTOR];
  if (!descriptor.objectdata || !descriptor.objectdata.message) {
    return null;
  }

  try {
    return JSON.parse(descriptor.objectdata.message);
  } catch (parseError) {
    throw new Error(`Failed to parse VLotto data: ${parseError.message}`);
  }
};

/**
 * Extract latest VLotto data from identity history (before revocation)
 * @param {Object} historyResponse - Response from getidentityhistory
 * @param {Object} vdxfKeys - Object containing VDXF key constants
 * @returns {Object|null} Object with latest VLotto data and history entry, or null if not found
 */
export const extractLatestVLottoDataFromHistory = (historyResponse, vdxfKeys) => {
  if (!historyResponse || !historyResponse.history || historyResponse.history.length === 0) {
    return null;
  }

  // Sort history entries by height (newest first) and find the latest entry with VLotto data
  const sortedHistory = [...historyResponse.history].sort((a, b) => b.height - a.height);
  
  for (const entry of sortedHistory) {
    // Skip revoked entries **only if** they have no VLotto payload (some revocations keep the data)
    if (entry.identity.flags === 32768) {
      const cmmap = entry.identity.contentmultimap || {};
      const hasVLotto = Object.keys(cmmap).some(key => key === vdxfKeys.PRIMARY_TICKET_FINALIZED_DATA);
      if (!hasVLotto) continue;
    }
    
    const testWrapper = { identity: entry.identity };
    const vlottoData = extractVLottoData(testWrapper, vdxfKeys);
    
    if (vlottoData) {
      return {
        vlottoData: vlottoData,
        historyEntry: entry,
        identityData: entry.identity,
        blockHeight: entry.height,
        txid: entry.output.txid
      };
    }
  }
  
  return null;
};

/**
 * Extract oldest VLotto data from identity history (first VLotto entry)
 * @param {Object} historyResponse - Response from getidentityhistory
 * @param {Object} vdxfKeys - Object containing VDXF key constants
 * @returns {Object|null} Object with oldest VLotto data and history entry, or null if not found
 */
export const extractOldestVLottoDataFromHistory = (historyResponse, vdxfKeys) => {
  if (!historyResponse || !historyResponse.history || historyResponse.history.length === 0) {
    return null;
  }

  // Sort history entries by height (oldest first) and find the first entry with VLotto data
  const sortedHistory = [...historyResponse.history].sort((a, b) => a.height - b.height);
  
  for (const entry of sortedHistory) {
    // Skip revoked entries **only if** they have no VLotto payload (some revocations keep the data)
    if (entry.identity.flags === 32768) {
      const cmmap = entry.identity.contentmultimap || {};
      const hasVLotto = Object.keys(cmmap).some(key => key === vdxfKeys.PRIMARY_TICKET_FINALIZED_DATA);
      if (!hasVLotto) continue;
    }
    
    const testWrapper = { identity: entry.identity };
    const vlottoData = extractVLottoData(testWrapper, vdxfKeys);
    
    if (vlottoData) {
      return {
        vlottoData: vlottoData,
        historyEntry: entry,
        identityData: entry.identity,
        blockHeight: entry.height,
        txid: entry.output.txid
      };
    }
  }
  
  return null;
};

/**
 * Extract all VLotto data entries from identity history
 * @param {Object} historyResponse - Response from getidentityhistory
 * @param {Object} vdxfKeys - Object containing VDXF key constants
 * @returns {Array} Array of objects with VLotto data and history entries
 */
export const extractAllVLottoDataFromHistory = (historyResponse, vdxfKeys) => {
  if (!historyResponse || !historyResponse.history || historyResponse.history.length === 0) {
    return [];
  }

  const vlottoEntries = [];
  
  for (const entry of historyResponse.history) {
    // Skip revoked entries **only if** they have no VLotto payload (some revocations keep the data)
    if (entry.identity.flags === 32768) {
      const cmmap = entry.identity.contentmultimap || {};
      const hasVLotto = Object.keys(cmmap).some(key => key === vdxfKeys.PRIMARY_TICKET_FINALIZED_DATA);
      if (!hasVLotto) continue;
    }
    
    const testWrapper = { identity: entry.identity };
    const vlottoData = extractVLottoData(testWrapper, vdxfKeys);
    
    if (vlottoData) {
      vlottoEntries.push({
        vlottoData: vlottoData,
        historyEntry: entry,
        identityData: entry.identity,
        blockHeight: entry.height,
        txid: entry.output.txid
      });
    }
  }
  
  // Sort by height (oldest first)
  return vlottoEntries.sort((a, b) => a.blockHeight - b.blockHeight);
};

/**
 * Verify ticket registration transaction
 * @param {Function} sendCommand - The command sender function
 * @param {string} registrationTxId - The registration transaction ID
 * @param {string} expectedTicketName - Expected ticket base name
 * @param {Object} identityData - Identity data to verify against
 * @returns {Promise<Object>} Verification results object
 */
export const verifyRegistrationTransaction = async (sendCommand, registrationTxId, expectedTicketName, identityData) => {
  const validationDetails = {
    txidMatches: false,
    hasIdentityPrimary: false,
    hasIdentityReservation: false,
    nameMatches: false,
    parentMatches: false,
    identityAddressMatches: false
  };

  try {
    // Get transaction details
    const registrationTxData = await sendCommand('gettransaction', [registrationTxId]);
    if (!registrationTxData || !registrationTxData.hex) {
      return { valid: false, validationDetails, transactionData: null, decodedData: null };
    }

    // Decode the raw transaction
    const decodedTxData = await sendCommand('decoderawtransaction', [registrationTxData.hex]);
    
    if (!decodedTxData || decodedTxData.txid !== registrationTxId) {
      return { valid: false, validationDetails, transactionData: registrationTxData, decodedData: decodedTxData };
    }

    validationDetails.txidMatches = true;

    // Look for identity data in transaction outputs
    let identityPrimary = null;
    
    if (decodedTxData.vout) {
      for (const output of decodedTxData.vout) {
        if (output.scriptPubKey) {
          if (output.scriptPubKey.identityprimary) {
            identityPrimary = output.scriptPubKey.identityprimary;
            validationDetails.hasIdentityPrimary = true;
          }
          if (output.scriptPubKey.identityreservation) {
            validationDetails.hasIdentityReservation = true;
          }
        }
      }
    }

    // Verify the identity details match our ticket
    if (identityPrimary) {
      if (identityPrimary.name === expectedTicketName) {
        validationDetails.nameMatches = true;
      }
      if (identityPrimary.parent === identityData?.identity?.parent) {
        validationDetails.parentMatches = true;
      }
      if (identityPrimary.identityaddress === identityData?.identity?.identityaddress) {
        validationDetails.identityAddressMatches = true;
      }
    }

    // All validations must pass
    const isValid = Object.values(validationDetails).every(check => check === true);

    return {
      valid: isValid,
      validationDetails,
      transactionData: registrationTxData,
      decodedData: decodedTxData
    };

  } catch (error) {
    console.warn('Registration TXID verification failed:', error);
    return { valid: false, validationDetails, error: error.message };
  }
}; 