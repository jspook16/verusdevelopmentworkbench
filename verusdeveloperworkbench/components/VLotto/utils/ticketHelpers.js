// Ticket utility functions

/**
 * Generate a ticket name based on block number and ticket details
 * @param {string|number} blockNumber - The future block number
 * @param {number} ticketNumber - The ticket number (1-based)
 * @param {number} totalTickets - Total number of tickets being generated
 * @returns {string} Generated ticket name
 */
export const generateTicketName = (blockNumber, ticketNumber, totalTickets) => {
  return `${blockNumber}_${ticketNumber}of${totalTickets}.`;
};

/**
 * Get parent name from an identity ID
 * @param {string} id - The identity ID (e.g., "parent@")
 * @returns {string} Parent name without the @ suffix
 */
export const getParentName = (id) => {
  if (id.endsWith('@')) {
    return id.slice(0, -1);
  }
  return id; 
};

/**
 * Calculate matching positions between two hashes
 * @param {string} ticketHash - The ticket's playing number hash
 * @param {string} drawingHash - The block hash from drawing
 * @returns {number[]} Array of matching position indices
 */
export const calculateMatchingPositions = (ticketHash, drawingHash) => {
  const matches = [];
  
  // Find the first non-zero character in the drawing hash to skip leading zeros
  let startPosition = 0;
  for (let i = 0; i < drawingHash.length; i++) {
    if (drawingHash[i] !== '0') {
      startPosition = i;
      break;
    }
  }
  
  const minLength = Math.min(ticketHash.length, drawingHash.length);
  
  for (let i = startPosition; i < minLength; i++) {
    if (ticketHash[i] === drawingHash[i]) {
      matches.push(i);
    }
  }
  return matches;
};

/**
 * Calculate ticket score based on matching positions
 * Score is the sum of the decimal values of matching hex characters
 * @param {number[]} matchingPositions - Array of matching position indices
 * @param {string} ticketHash - The ticket's playing number hash (to get the hex values)
 * @returns {number} Calculated score
 */
export const calculateTicketScore = (matchingPositions, ticketHash) => {
  if (!matchingPositions || matchingPositions.length === 0 || !ticketHash) {
    return 0;
  }
  
  let score = 0;
  for (const position of matchingPositions) {
    const hexChar = ticketHash[position];
    if (hexChar) {
      // Convert hex character to decimal value
      const decimalValue = parseInt(hexChar, 16);
      score += decimalValue;
    }
  }
  
  return score;
};

/**
 * Sort tickets based on given criteria
 * @param {Array} tickets - Array of ticket objects
 * @param {string} criteria - Sorting criteria: 'matches', 'score', or 'name'
 * @returns {Array} Sorted array of tickets
 */
export const sortTickets = (tickets, criteria) => {
  return [...tickets].sort((a, b) => {
    switch (criteria) {
      case 'matches':
        const aMatches = a.matchingPositions ? a.matchingPositions.length : 0;
        const bMatches = b.matchingPositions ? b.matchingPositions.length : 0;
        if (bMatches !== aMatches) {
          return bMatches - aMatches; // Higher matches first
        }
        // If matches are tied, use score as secondary tie-breaker
        if (b.score !== a.score) {
          return b.score - a.score; // Higher score wins tie
        }
        return a.id - b.id; // Lower ticket ID wins if both matches and score are tied
      case 'score':
        if (b.score !== a.score) {
          return b.score - a.score; // Higher score first
        }
        return a.id - b.id; // Lower ticket ID wins ties
      case 'name':
        const aName = a.name || `Ticket #${a.id}`;
        const bName = b.name || `Ticket #${b.id}`;
        return aName.localeCompare(bName);
      default:
        return 0;
    }
  });
};

/**
 * Parse ticket name to extract subID and parent
 * @param {string} ticketFullName - Full ticket name (e.g., "573242_1of3.shylock@")
 * @returns {Object} Object with subIdName and parentIdName
 */
export const parseTicketName = (ticketFullName) => {
  const dotIndex = ticketFullName.indexOf('.');
  if (dotIndex === -1) {
    throw new Error(`Invalid ticket name format: ${ticketFullName}. Expected format: subid.parent@`);
  }
  const subIdName = ticketFullName.substring(0, dotIndex) + '@';
  const parentIdName = ticketFullName.substring(dotIndex + 1);
  
  return { subIdName, parentIdName };
};

/**
 * Create ticket payload for updateidentity
 * @param {string} registrationTxId - Registration transaction ID
 * @param {Object} ticketValidation - Ticket validation object with hash and signature
 * @param {Object} proofguardAcknowledgement - Proofguard acknowledgement with hash and signature
 * @param {string} playingNumber - The playing number (hash2)
 * @returns {Object} Ticket payload object
 */
export const createTicketPayload = (registrationTxId, ticketValidation, proofguardAcknowledgement, playingNumber) => {
  return {
    registration_txid: registrationTxId,
    ticket_validation: {
      signed_by_ticket_hash: ticketValidation.hash,
      signed_by_ticket_signature: ticketValidation.signature,
    },
    proofguard_acknowledgement: {
      signed_by_proofguard_hash: proofguardAcknowledgement.hash,
      signed_by_proofguard_signature: proofguardAcknowledgement.signature,
    },
    playing_number: playingNumber,
  };
}; 