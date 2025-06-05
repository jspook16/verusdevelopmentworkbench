/**
 * VLotto Ticket Filtering Utility (CommonJS version for main process)
 * 
 * This utility provides functions to filter out VLotto ticket IDs from VerusID lists
 * to prevent UI pollution and improve performance when dealing with thousands of test tickets.
 */

// Configuration for ticket filtering patterns
const TICKET_FILTER_CONFIG = {
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
  },
  
  // Whitelist specific ticket IDs that should NOT be filtered
  whitelist: [],
  
  // Log filtering statistics
  logStats: true
};

/**
 * Checks if a VerusID name matches VLotto ticket patterns
 * @param {string} name - The VerusID name to check
 * @returns {boolean} - True if it's a ticket ID that should be filtered
 */
const isTicketId = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Check whitelist first
  if (TICKET_FILTER_CONFIG.whitelist.includes(name)) {
    return false;
  }
  
  const { patterns } = TICKET_FILTER_CONFIG;
  
  // Check against all configured patterns
  return (
    patterns.blockBasedWithParent.test(name) ||
    patterns.blockBasedWithDot.test(name) ||
    patterns.numbered.test(name) ||
    patterns.generalTicketPattern.test(name) ||
    patterns.keywords.test(name)
  );
};

/**
 * Filters VLotto ticket IDs from a VerusID list
 * @param {Array} identityList - Array of identity objects from listidentities
 * @returns {Array} - Filtered array with ticket IDs removed
 */
const filterTicketIds = (identityList) => {
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
 * Gets current filtering statistics for a list
 * @param {Array} identityList - Array of identity objects
 * @returns {Object} - Statistics object
 */
const getFilterStats = (identityList) => {
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

module.exports = {
  TICKET_FILTER_CONFIG,
  isTicketId,
  filterTicketIds,
  getFilterStats
}; 