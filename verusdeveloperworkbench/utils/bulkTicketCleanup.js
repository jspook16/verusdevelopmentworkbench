/**
 * Bulk VLotto Ticket Cleanup Utility
 * 
 * This utility provides functions to identify and optionally revoke large numbers
 * of VLotto ticket IDs from the wallet to improve performance and reduce clutter.
 * 
 * WARNING: This performs irreversible blockchain operations. Use with caution.
 */

import { isTicketId, getFilterStats } from './ticketFilter.js';

// Configuration for cleanup operations
export const CLEANUP_CONFIG = {
  // Safety limits
  maxBatchSize: 100,
  delayBetweenRevocations: 1000, // 1 second
  dryRunMode: true, // Set to false to actually execute revocations
  
  // Pattern-based cleanup options
  cleanupPatterns: {
    oldTestTickets: true,
    specificBlockRanges: [], // e.g., [570000, 571000]
    olderThanDays: 30,
  },
  
  // Safety confirmations required
  requireConfirmation: true,
  
  // Logging
  logOperations: true,
};

/**
 * Analyzes the wallet for VLotto tickets
 * @param {Function} sendCommand - Function to send RPC commands
 * @returns {Object} - Analysis report
 */
export const analyzeTickets = async (sendCommand) => {
  console.log('[BulkCleanup] Starting ticket analysis...');
  
  try {
    // Get all identities (unfiltered)
    const allIdentities = await sendCommand('listidentities', [true, true, false], 'bulk_cleanup_analysis');
    
    if (!Array.isArray(allIdentities)) {
      throw new Error('Invalid response from listidentities');
    }
    
    const stats = getFilterStats(allIdentities);
    
    // Categorize tickets by patterns
    const ticketCategories = {
      blockBased: [],
      numbered: [],
      keywordBased: [],
      other: []
    };
    
    const tickets = allIdentities.filter(item => 
      item?.identity?.name && isTicketId(item.identity.name)
    );
    
    tickets.forEach(ticket => {
      const name = ticket.identity.name;
      
      if (/^\d{6}_\d+of\d+@[^@]+@$/.test(name) || /^\d{6}_\d+of\d+\./.test(name)) {
        ticketCategories.blockBased.push(ticket);
      } else if (/^\d{6}_\d+of\d+@$/.test(name)) {
        ticketCategories.numbered.push(ticket);
      } else if (/vlotto|ticket|lottery/i.test(name)) {
        ticketCategories.keywordBased.push(ticket);
      } else {
        ticketCategories.other.push(ticket);
      }
    });
    
    const report = {
      totalIdentities: stats.total,
      totalTickets: stats.tickets,
      regularIdentities: stats.regular,
      ticketCategories,
      estimatedCleanupTime: Math.ceil(stats.tickets * CLEANUP_CONFIG.delayBetweenRevocations / 1000 / 60), // minutes
      recommendations: generateRecommendations(ticketCategories, stats)
    };
    
    if (CLEANUP_CONFIG.logOperations) {
      console.log('[BulkCleanup] Analysis complete:', report);
    }
    
    return report;
    
  } catch (error) {
    console.error('[BulkCleanup] Error during analysis:', error);
    throw error;
  }
};

/**
 * Generates cleanup recommendations based on analysis
 * @param {Object} categories - Ticket categories
 * @param {Object} stats - Overall statistics
 * @returns {Array} - Array of recommendation objects
 */
const generateRecommendations = (categories, stats) => {
  const recommendations = [];
  
  if (stats.tickets > 1000) {
    recommendations.push({
      priority: 'high',
      action: 'bulk_cleanup',
      reason: `${stats.tickets} ticket IDs detected, significantly impacting performance`,
      estimatedImprovement: 'Major performance improvement expected'
    });
  }
  
  if (categories.blockBased.length > 100) {
    recommendations.push({
      priority: 'medium',
      action: 'cleanup_block_based',
      reason: `${categories.blockBased.length} block-based test tickets found`,
      estimatedImprovement: 'Improved UI responsiveness'
    });
  }
  
  if (categories.numbered.length > 100) {
    recommendations.push({
      priority: 'medium', 
      action: 'cleanup_numbered',
      reason: `${categories.numbered.length} numbered test tickets found`,
      estimatedImprovement: 'Reduced memory usage'
    });
  }
  
  return recommendations;
};

/**
 * Performs bulk cleanup of ticket IDs (with safety checks)
 * @param {Function} sendCommand - Function to send RPC commands
 * @param {Object} options - Cleanup options
 * @returns {Object} - Cleanup results
 */
export const performBulkCleanup = async (sendCommand, options = {}) => {
  const config = { ...CLEANUP_CONFIG, ...options };
  
  console.log('[BulkCleanup] Starting bulk cleanup with config:', config);
  
  if (config.requireConfirmation && config.dryRunMode) {
    console.log('[BulkCleanup] DRY RUN MODE - No actual revocations will be performed');
  }
  
  try {
    // First, analyze current state
    const analysis = await analyzeTickets(sendCommand);
    
    if (analysis.totalTickets === 0) {
      return { success: true, message: 'No tickets found to clean up', details: analysis };
    }
    
    // Select tickets for cleanup based on criteria
    const ticketsToCleanup = selectTicketsForCleanup(analysis, config);
    
    if (ticketsToCleanup.length === 0) {
      return { success: true, message: 'No tickets match cleanup criteria', details: analysis };
    }
    
    console.log(`[BulkCleanup] Selected ${ticketsToCleanup.length} tickets for cleanup`);
    
    if (config.dryRunMode) {
      return {
        success: true,
        dryRun: true,
        message: `DRY RUN: Would revoke ${ticketsToCleanup.length} tickets`,
        ticketsToRevoke: ticketsToCleanup.map(t => t.identity.name),
        details: analysis
      };
    }
    
    // Perform actual cleanup (if not in dry run mode)
    const results = await executeCleanup(sendCommand, ticketsToCleanup, config);
    
    return {
      success: true,
      message: `Cleanup completed: ${results.successful} revoked, ${results.failed} failed`,
      results,
      details: analysis
    };
    
  } catch (error) {
    console.error('[BulkCleanup] Error during bulk cleanup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Selects tickets for cleanup based on criteria
 * @param {Object} analysis - Analysis results
 * @param {Object} config - Cleanup configuration
 * @returns {Array} - Tickets selected for cleanup
 */
const selectTicketsForCleanup = (analysis, config) => {
  const { ticketCategories } = analysis;
  let selected = [];
  
  // Add tickets based on patterns
  if (config.cleanupPatterns.oldTestTickets) {
    selected.push(...ticketCategories.blockBased);
    selected.push(...ticketCategories.numbered);
  }
  
  // Limit batch size for safety
  if (selected.length > config.maxBatchSize) {
    console.warn(`[BulkCleanup] Limiting cleanup to ${config.maxBatchSize} tickets for safety`);
    selected = selected.slice(0, config.maxBatchSize);
  }
  
  return selected;
};

/**
 * Executes the actual cleanup operations
 * @param {Function} sendCommand - Function to send RPC commands
 * @param {Array} tickets - Tickets to revoke
 * @param {Object} config - Configuration
 * @returns {Object} - Execution results
 */
const executeCleanup = async (sendCommand, tickets, config) => {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };
  
  console.log(`[BulkCleanup] Executing cleanup of ${tickets.length} tickets...`);
  
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const ticketName = ticket.identity.name;
    
    try {
      console.log(`[BulkCleanup] Revoking ticket ${i + 1}/${tickets.length}: ${ticketName}`);
      
      // Get the parent ID for revocation (typically the main lottery ID)
      const parentId = await getParentIdForRevocation(sendCommand, ticket);
      
      const result = await sendCommand('revokeidentity', [ticketName, parentId], 'bulk_cleanup_revoke');
      
      if (result && typeof result === 'string' && result.length === 64) {
        results.successful++;
        console.log(`[BulkCleanup] ✅ Successfully revoked ${ticketName}`);
      } else {
        results.failed++;
        results.errors.push(`Unexpected result for ${ticketName}: ${JSON.stringify(result)}`);
      }
      
      // Delay between operations for safety
      if (i < tickets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRevocations));
      }
      
    } catch (error) {
      results.failed++;
      results.errors.push(`Error revoking ${ticketName}: ${error.message}`);
      console.error(`[BulkCleanup] ❌ Error revoking ${ticketName}:`, error);
    }
  }
  
  return results;
};

/**
 * Determines the parent ID needed for revocation
 * @param {Function} sendCommand - Function to send RPC commands  
 * @param {Object} ticket - Ticket object
 * @returns {string} - Parent ID for revocation
 */
const getParentIdForRevocation = async (sendCommand, ticket) => {
  try {
    // Get full identity details to find the controlling identity
    const details = await sendCommand('getidentity', [ticket.identity.name], 'get_parent_for_revocation');
    
    if (details?.identity?.revocationauthority) {
      return details.identity.revocationauthority;
    }
    
    // Fallback: extract parent from ticket name pattern
    const name = ticket.identity.name;
    const match = name.match(/^\d{6}_\d+of\d+\.([^@]+)@$/);
    if (match) {
      return `${match[1]}@`; // e.g., "shylock@"
    }
    
    // Final fallback - this would need to be configured per deployment
    throw new Error('Could not determine parent ID for revocation');
    
  } catch (error) {
    console.warn(`[BulkCleanup] Could not get parent ID for ${ticket.identity.name}:`, error);
    throw error;
  }
};

/**
 * Updates cleanup configuration
 * @param {Object} newConfig - New configuration to merge
 */
export const updateCleanupConfig = (newConfig) => {
  Object.assign(CLEANUP_CONFIG, newConfig);
  console.log('[BulkCleanup] Configuration updated:', CLEANUP_CONFIG);
}; 