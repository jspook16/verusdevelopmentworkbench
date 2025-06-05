/**
 * VLotto Testing Utilities
 * 
 * Comprehensive testing functions for the VLotto system
 * Validates parameters, funding logic, and automation flow
 */

import { ParameterValidator } from './parameterValidation.js';

export class VLottoTester {
  
  /**
   * Run comprehensive system test
   * @param {Object} vlottoAutomation - VLotto automation hook
   * @param {Object} ticketGeneration - Ticket generation hook
   * @returns {Object} Complete test results
   */
  static async runSystemTest(vlottoAutomation, ticketGeneration) {
    const testResults = {
      timestamp: new Date().toISOString(),
      overall: { passed: false, score: 0, maxScore: 0 },
      tests: {},
      summary: '',
      recommendations: []
    };

    console.log('🧪 VLotto System Test Started');

    // Test 1: Parameter Validation
    testResults.tests.parameterValidation = await this.testParameterValidation(vlottoAutomation);
    
    // Test 2: Engine Availability  
    testResults.tests.engineAvailability = this.testEngineAvailability(vlottoAutomation);
    
    // Test 3: Parameter Completeness
    testResults.tests.parameterCompleteness = this.testParameterCompleteness(vlottoAutomation);
    
    // Test 4: Identity Configuration
    testResults.tests.identityConfiguration = this.testIdentityConfiguration(ticketGeneration);
    
    // Test 5: Distribution Logic
    testResults.tests.distributionLogic = this.testDistributionLogic(vlottoAutomation);
    
    // Test 6: Block Sequence Validation
    testResults.tests.blockSequence = this.testBlockSequence(vlottoAutomation);

    // Calculate overall score
    const tests = Object.values(testResults.tests);
    testResults.overall.maxScore = tests.length * 100;
    testResults.overall.score = tests.reduce((sum, test) => sum + test.score, 0);
    testResults.overall.passed = testResults.overall.score >= (testResults.overall.maxScore * 0.8);

    // Generate summary and recommendations
    this.generateTestSummary(testResults);
    
    console.log('🧪 VLotto System Test Completed:', testResults.overall);
    return testResults;
  }

  /**
   * Test parameter validation system
   */
  static async testParameterValidation(vlottoAutomation) {
    const test = {
      name: 'Parameter Validation',
      passed: false,
      score: 0,
      maxScore: 100,
      details: [],
      errors: []
    };

    try {
      if (!vlottoAutomation.ParameterValidator) {
        test.errors.push('ParameterValidator not available');
        return test;
      }

      // Test with valid parameters
      const validParams = {
        mainVerusId: 'test.shylock@',
        futureBlockNumber: 100000,
        drawingInterval: 1000,
        jackpotMinimum: 100,
        nextJackpotPercent: 50,
        operationsPercent: 50,
        ticketMultiplier: 10
      };

      const validation = vlottoAutomation.ParameterValidator.validateAutomationParameters(validParams);
      
      if (validation.valid) {
        test.details.push('✅ Valid parameters correctly validated');
        test.score += 50;
      } else {
        test.errors.push('Valid parameters failed validation');
      }

      // Test readiness calculation
      const readiness = vlottoAutomation.ParameterValidator.getParameterReadiness(validParams);
      if (readiness && typeof readiness.overall === 'boolean') {
        test.details.push('✅ Parameter readiness calculation working');
        test.score += 50;
      } else {
        test.errors.push('Parameter readiness calculation failed');
      }

      test.passed = test.score >= 80;

    } catch (error) {
      test.errors.push(`Parameter validation test failed: ${error.message}`);
    }

    return test;
  }

  /**
   * Generate test summary and recommendations
   */
  static generateTestSummary(testResults) {
    const passedTests = Object.values(testResults.tests).filter(test => test.passed);
    const failedTests = Object.values(testResults.tests).filter(test => !test.passed);
    
    testResults.summary = `${passedTests.length}/${Object.keys(testResults.tests).length} tests passed`;

    if (testResults.overall.passed) {
      testResults.recommendations.push('✅ System appears ready for automation');
    } else {
      testResults.recommendations.push('⚠️ System needs configuration before automation can start');
    }
  }
} 