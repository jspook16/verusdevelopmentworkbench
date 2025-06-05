/**
 * VLotto Parameter Validation Utility
 * 
 * Validates all required parameters for lottery automation
 * Provides detailed error messages and validation results
 */

export class ParameterValidator {
  
  /**
   * Validate all parameters required for automation
   * @param {Object} parameters - All lottery parameters
   * @returns {Object} Validation result with errors and warnings
   */
  static validateAutomationParameters(parameters) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      missing: [],
      invalid: [],
      summary: ''
    };

    // Required parameters with validation rules
    const requiredParams = [
      {
        key: 'mainVerusId',
        name: 'Main Lottery ID',
        validator: (value) => value && value.includes('@'),
        errorMsg: 'Main Lottery ID must be a valid identity (name@)'
      },
      {
        key: 'futureBlockNumber',
        name: 'Target Drawing Block',
        validator: (value) => value && !isNaN(parseInt(value)) && parseInt(value) > 0,
        errorMsg: 'Target Drawing Block must be a positive number'
      },
      {
        key: 'drawingInterval', 
        name: 'Drawing Cycle',
        validator: (value) => value && !isNaN(parseInt(value)) && parseInt(value) > 0,
        errorMsg: 'Drawing Cycle must be a positive number (blocks between drawings)'
      },
      {
        key: 'jackpotMinimum',
        name: 'Jackpot Minimum',
        validator: (value) => value && !isNaN(parseFloat(value)) && parseFloat(value) > 0,
        errorMsg: 'Jackpot Minimum must be a positive number'
      },
      {
        key: 'nextJackpotPercent',
        name: 'Next Jackpot Percentage',
        validator: (value) => value && !isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100,
        errorMsg: 'Next Jackpot Percentage must be between 0 and 100'
      },
      {
        key: 'operationsPercent',
        name: 'Operations Percentage', 
        validator: (value) => value && !isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100,
        errorMsg: 'Operations Percentage must be between 0 and 100'
      },
      {
        key: 'ticketMultiplier',
        name: 'Ticket Multiplier',
        validator: (value) => value && !isNaN(parseFloat(value)) && parseFloat(value) > 0,
        errorMsg: 'Ticket Multiplier must be a positive number'
      },
      {
        key: 'rAddressForTickets',
        name: 'R-Address for Tickets',
        validator: (value) => value && value.trim().length > 0 && value.trim().startsWith('R'),
        errorMsg: 'R-Address for Tickets must be a valid R-address used for ticket creation'
      }
    ];

    // Optional parameters with validation rules
    const optionalParams = [
      {
        key: 'confirmations',
        name: 'Confirmations',
        default: 3,
        validator: (value) => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 1 && parseInt(value) <= 10),
        errorMsg: 'Confirmations must be between 1 and 10'
      },
      {
        key: 'gracePeriod',
        name: 'Grace Period',
        default: 1000,
        validator: (value) => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 0),
        errorMsg: 'Grace Period must be a non-negative number'
      },
      {
        key: 'closeOffersBeforeDrawing',
        name: 'Close Offers Before Drawing',
        default: 5,
        validator: (value) => !value || (!isNaN(parseInt(value)) && parseInt(value) >= 0),
        errorMsg: 'Close Offers Before Drawing must be a non-negative number'
      }
    ];

    // Validate required parameters
    for (const param of requiredParams) {
      const value = parameters[param.key];
      
      if (!value && value !== 0) {
        result.missing.push(param.name);
        result.errors.push(`${param.name} is required`);
      } else if (!param.validator(value)) {
        result.invalid.push(param.name);
        result.errors.push(param.errorMsg);
      }
    }

    // Validate optional parameters (only if provided)
    for (const param of optionalParams) {
      const value = parameters[param.key];
      
      if (value && !param.validator(value)) {
        result.invalid.push(param.name);
        result.errors.push(param.errorMsg);
      }
    }

    // Additional validation rules
    this.validateDistributionPercentages(parameters, result);
    this.validateBlockSequence(parameters, result);
    this.validateIdentityFormat(parameters, result);

    // Determine overall validity
    result.valid = result.errors.length === 0;

    // Create summary
    if (result.valid) {
      result.summary = `✅ All parameters valid. Ready for automation.`;
    } else {
      const errorCount = result.errors.length;
      const missingCount = result.missing.length;
      const invalidCount = result.invalid.length;
      
      result.summary = `❌ ${errorCount} validation error${errorCount !== 1 ? 's' : ''}: ${missingCount} missing, ${invalidCount} invalid.`;
    }

    return result;
  }

  /**
   * Validate distribution percentages add up correctly
   * @param {Object} parameters - Parameters to validate
   * @param {Object} result - Validation result to update
   */
  static validateDistributionPercentages(parameters, result) {
    const nextJackpot = parseFloat(parameters.nextJackpotPercent) || 0;
    const operations = parseFloat(parameters.operationsPercent) || 0;
    
    // Get additional destination percentages
    const destinations = [];
    for (let i = 1; i <= 6; i++) {
      const percent = parseFloat(parameters[`destination${i}Percent`]) || 0;
      if (percent > 0) {
        destinations.push(percent);
      }
    }
    
    const totalPercent = nextJackpot + operations + destinations.reduce((sum, p) => sum + p, 0);
    
    if (Math.abs(totalPercent - 100) > 0.01) { // Allow for floating point precision
      result.warnings.push(`Distribution percentages total ${totalPercent.toFixed(2)}% (should be 100%)`);
    }
    
    if (nextJackpot + operations > 100) {
      result.errors.push('Next Jackpot and Operations percentages cannot exceed 100%');
    }
  }

  /**
   * Validate block sequence makes sense
   * @param {Object} parameters - Parameters to validate
   * @param {Object} result - Validation result to update
   */
  static validateBlockSequence(parameters, result) {
    const startBlock = parseInt(parameters.futureBlockNumber);
    const drawingCycle = parseInt(parameters.drawingInterval);
    const gracePeriod = parseInt(parameters.gracePeriod) || 1000;
    
    if (startBlock && drawingCycle) {
      const drawingBlock = startBlock + drawingCycle;
      
      if (drawingCycle < 1000) {
        result.warnings.push('Drawing Cycle is less than 1000 blocks (~16 hours). Consider longer cycles for ticket sales.');
      }
      
      if (gracePeriod > drawingCycle) {
        result.warnings.push('Grace Period is longer than Drawing Cycle. This may cause scheduling issues.');
      }
      
      result.calculatedDrawingBlock = drawingBlock;
    }
  }

  /**
   * Validate identity format and structure  
   * @param {Object} parameters - Parameters to validate
   * @param {Object} result - Validation result to update
   */
  static validateIdentityFormat(parameters, result) {
    const mainId = parameters.mainVerusId;
    
    if (mainId && mainId.includes('@')) {
      // Check for proper identity format
      if (mainId.startsWith('@') || mainId.endsWith('@@')) {
        result.errors.push('Main Lottery ID format is invalid (should be name@)');
      }
      
      // Check for reserved characters
      if (mainId.includes(' ') || mainId.includes('\t')) {
        result.errors.push('Main Lottery ID cannot contain spaces or tabs');
      }
      
      // Extract parent currency for validation
      const parts = mainId.split('@');
      if (parts.length > 2) {
        result.warnings.push('Main Lottery ID has complex format - ensure it\'s correct');
      }
    }
  }

  /**
   * Get parameter readiness status for UI display
   * @param {Object} parameters - Parameters to check
   * @returns {Object} Readiness status
   */
  static getParameterReadiness(parameters) {
    const validation = this.validateAutomationParameters(parameters);
    
    const readiness = {
      overall: validation.valid,
      funding: false,
      timelock: false,
      tickets: false,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: validation.summary
    };

    // Check funding readiness
    const fundingRequired = ['mainVerusId', 'jackpotMinimum', 'nextJackpotPercent', 'operationsPercent'];
    readiness.funding = fundingRequired.every(key => {
      const value = parameters[key];
      return value && value !== '';
    });

    // Check timelock readiness  
    const timelockRequired = ['futureBlockNumber', 'drawingInterval'];
    readiness.timelock = timelockRequired.every(key => {
      const value = parameters[key];
      return value && value !== '' && !isNaN(parseInt(value)) && parseInt(value) > 0;
    });

    // Check ticket readiness
    const ticketRequired = ['mainVerusId', 'ticketMultiplier', 'rAddressForTickets'];
    readiness.tickets = ticketRequired.every(key => {
      const value = parameters[key];
      return value && value !== '';
    });

    return readiness;
  }

  /**
   * Format parameter value for display
   * @param {string} key - Parameter key
   * @param {*} value - Parameter value
   * @returns {string} Formatted value
   */
  static formatParameterValue(key, value) {
    if (!value && value !== 0) return 'Not set';
    
    switch (key) {
      case 'nextJackpotPercent':
      case 'operationsPercent':
        return `${value}%`;
      case 'jackpotMinimum':
        return `${value} (currency units)`;
      case 'drawingInterval':
        return `${value} blocks (~${Math.round(value / 60)} hours)`;
      case 'futureBlockNumber':
        return `Block ${value}`;
      case 'ticketMultiplier':
        return `${value}x`;
      case 'rAddressForTickets':
        return value.toString();
      default:
        return value.toString();
    }
  }

  /**
   * Get parameter help text
   * @param {string} key - Parameter key
   * @returns {string} Help text
   */
  static getParameterHelp(key) {
    const helpTexts = {
      mainVerusId: 'The main lottery identity (e.g., mylottery.shylock@). All sub-identities will be created under this.',
      futureBlockNumber: 'Block number when the drawing will occur. Funding and preparation will begin automatically to reach this target.',
      drawingInterval: 'Number of blocks between drawings. Determines lottery cycle length.',
      jackpotMinimum: 'Minimum jackpot amount. If not met after revenue distribution, subsidy sources will be used.',
      nextJackpotPercent: 'Percentage of revenue that goes to the next jackpot.',
      operationsPercent: 'Percentage of revenue that goes to operations.',
      ticketMultiplier: 'Multiplier to calculate tickets: Locked Jackpot Balance × Multiplier = Ticket Quantity.',
      rAddressForTickets: 'R-address used for ticket creation. Unsold tickets will retain this address, while sold tickets will have buyer\'s address.',
      confirmations: 'Number of block confirmations required for transactions.',
      gracePeriod: 'Idle blocks after payout before next cycle preparation begins.',
      closeOffersBeforeDrawing: 'Blocks before drawing when marketplace offers are closed.'
    };
    
    return helpTexts[key] || 'No help available for this parameter.';
  }
} 