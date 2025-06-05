/**
 * VLotto Ticket Filtering Utility
 * 
 * This utility provides functions to filter out VLotto ticket IDs from VerusID lists
 * to prevent UI pollution and improve performance when dealing with thousands of test tickets.
 */

// Configuration for ticket filtering patterns
export const TICKET_FILTER_CONFIG = {
  // Enable/disable filtering
  enabled: true,
  
  // Patterns to identify VLotto tickets
  patterns: {
    // Block-based tickets with parent: "575800_5of6@shylock@"
    blockBasedWithParent: /^\d{6}_\d+of\d+@[^@]+@$/,
    
    // Block-based tickets with dot: "570150_1of6.shylock@"
    blockBasedWithDot: /^\d{6}_\d+of\d+\./,
    
    // Simple numbered tickets: "575712_1of6@"  
    numbered: /^\d{6}_\d+of\d+@$/,
    
    // Any ticket pattern starting with 6 digits, underscore, numbers, "of", numbers
    generalTicketPattern: /^\d{6}_\d+of\d+/,
    
    // VLotto keyword patterns
    keywords: /vlotto|ticket|lottery/i,
    
    // Additional custom patterns can be added here
    // customPattern: /your-pattern-here/
  },
  
  // Whitelist specific ticket IDs that should NOT be filtered
  whitelist: [
    // Add specific ticket names that should always appear
    // Example: "special-ticket.example@"
  ],
  
  // Log filtering statistics
  logStats: true
};

/**
 * Checks if a VerusID name matches VLotto ticket patterns
 * @param {string} name - The VerusID name to check
 * @returns {boolean} - True if it's a ticket ID that should be filtered
 */
export const isTicketId = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Check whitelist first
  if (TICKET_FILTER_CONFIG.whitelist.includes(name)) {
    return false;
  }
  
  const { patterns } = TICKET_FILTER_CONFIG;
  
  // Check against all configured patterns
  const blockWithParentMatch = patterns.blockBasedWithParent.test(name);
  const blockWithDotMatch = patterns.blockBasedWithDot.test(name);
  const numberedMatch = patterns.numbered.test(name);
  const generalMatch = patterns.generalTicketPattern.test(name);
  const keywordMatch = patterns.keywords.test(name);
  
  const isTicket = (
    blockWithParentMatch ||
    blockWithDotMatch ||
    numberedMatch ||
    generalMatch ||
    keywordMatch
  );
  
  return isTicket;
};

/**
 * Filters VLotto ticket IDs from a VerusID list
 * @param {Array} identityList - Array of identity objects from listidentities
 * @returns {Array} - Filtered array with ticket IDs removed
 */
export const filterTicketIds = (identityList) => {
  if (!TICKET_FILTER_CONFIG.enabled || !Array.isArray(identityList)) {
    return identityList;
  }
  
  const originalCount = identityList.length;
  
  const filtered = identityList.filter(item => {
    if (!item || !item.identity || !item.identity.name) return true;
    
    return !isTicketId(item.identity.name);
  });
  
  const filteredCount = originalCount - filtered.length;
  
  if (TICKET_FILTER_CONFIG.logStats && filteredCount > 0) {
    console.log(`[TicketFilter] Filtered ${filteredCount} ticket IDs from ${originalCount} total identities`);
  }
  
  return filtered;
};

/**
 * Updates the ticket filter configuration
 * @param {Object} newConfig - Partial configuration object to merge
 */
export const updateFilterConfig = (newConfig) => {
  Object.assign(TICKET_FILTER_CONFIG, newConfig);
  console.log('[TicketFilter] Configuration updated:', TICKET_FILTER_CONFIG);
};

/**
 * Gets current filtering statistics for a list
 * @param {Array} identityList - Array of identity objects
 * @returns {Object} - Statistics object
 */
export const getFilterStats = (identityList) => {
  if (!Array.isArray(identityList)) {
    return { total: 0, tickets: 0, regular: 0 };
  }
  
  const total = identityList.length;
  const tickets = identityList.filter(item => 
    item?.identity?.name && isTicketId(item.identity.name)
  ).length;
  const regular = total - tickets;
  
  return { total, tickets, regular };
};

/**
 * Creates a summary report of ticket filtering
 * @param {Array} originalList - Original unfiltered list
 * @param {Array} filteredList - Filtered list
 * @returns {Object} - Summary report
 */
export const createFilterReport = (originalList, filteredList) => {
  const originalStats = getFilterStats(originalList);
  const filteredStats = getFilterStats(filteredList);
  
  return {
    original: originalStats,
    filtered: filteredStats,
    removed: originalStats.tickets,
    efficiency: originalStats.total > 0 ? 
      ((originalStats.tickets / originalStats.total) * 100).toFixed(1) + '%' : '0%'
  };
}; 