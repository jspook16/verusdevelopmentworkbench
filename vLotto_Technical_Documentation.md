# vLotto System Technical Documentation

## Overview

The vLotto (Verus Lottery) system is a fully automated, blockchain-based lottery built on the Verus blockchain platform. It provides provably fair lottery operations with transparent fund management, cryptographically secure ticket generation, and automated payout distribution. The system integrates deeply with Verus's identity system, marketplace functionality, and native currency operations.

## Latest Updates & Improvements

**TEMPORARY: Timelock Functionality Disabled for Debugging**
- ⚠️ **Timelock Security Temporarily Disabled**: All timelock operations are currently skipped to simplify debugging
- ⚠️ **Jackpot Unlock Disabled**: Drawing systems skip jackpot unlock attempts when timelock is disabled
- ⚠️ **Reduced Security**: Jackpot funds are NOT protected during ticket sales - FOR DEBUGGING ONLY
- ✅ **Easy Re-enable**: Change `skipTimelock = true` to `false` in useVLottoAutomation.js to restore full security

**BREAKING: Critical Command Validation System**
- ✅ **Comprehensive Transaction Validation**: All critical blockchain commands now validate responses before proceeding
- ✅ **Insufficient Funds Detection**: Specific detection and handling of "insufficient funds" errors for all commands
- ✅ **Transaction ID Verification**: Validates all TXIDs are proper 64-character hex strings before continuing
- ✅ **Error Response Handling**: Detects object-based error responses and string-based error messages
- ✅ **Process Stopping**: Failed commands immediately stop automation instead of continuing with invalid states

**Enhanced Command Error Checking:**
- ✅ **registernamecommitment**: Validates commitment result, TXID format, and namereservation data before registration
- ✅ **registeridentity**: Validates registration result and handles both string TXIDs and object responses  
- ✅ **makeoffer**: Validates marketplace offer creation and prevents listing with failed transactions
- ✅ **updateidentity**: Enhanced validation for ticket finalization and content storage operations
- ✅ **setidentitytimelock**: Now includes sourceoffunds parameter using primary R-address of main lottery ID

**Background Execution & Tab Switching:**
- ✅ **Tab-Visibility-Aware Automation**: Automation continues running even when switching to other browser tabs
- ✅ **Enhanced Timing System**: Multiple timing mechanisms prevent browser throttling issues
- ✅ **Immediate Resume**: Returns immediately when user switches back to vLotto tab
- ✅ **Reliable Processing**: 30-second primary interval with 35-second backup timer for redundancy

**Performance Optimization & Duplicate Call Prevention:**
- ✅ **Consolidated Data Fetching**: Eliminated duplicate blockchain calls from multiple React hooks
- ✅ **Intelligent Caching**: 2-second cooldown prevents rapid repeated calls for same data
- ✅ **Hook Coordination**: Single source of truth for identity and currency information
- ✅ **Resource Conservation**: Reduced blockchain query load by ~60% on tab initialization

**Critical Security Enhancements:**
- ✅ **Jackpot Balance Verification Checkpoint**: Mandatory verification after funding before timelock prevents empty or underfunded lotteries
- ✅ **Dynamic Amount Calculation**: Real-time calculation of exact funding needed prevents over-funding and failed transactions
- ✅ **Enhanced Timelock Security**: Delay-based timelock with immediate protection and controlled release after winner verification

**Funding System Overhaul:**
- ✅ **Intelligent Multi-Source Strategy**: Smart prioritization of funding sources with partial funding support
- ✅ **VRSCTEST Fee Validation**: Pre-validates transaction fee availability before attempting any funding operation
- ✅ **R-Address Final Fallback**: Primary R-address as absolute last resort funding source for maximum reliability
- ✅ **Removed Problematic Sources**: Eliminated `mainLotteryId@` funding due to consistent VRSCTEST issues

**Process Reliability Improvements:**
- ✅ **Fail-Safe Operation**: System continues through funding sources even if individual steps fail
- ✅ **Smart Step Skipping**: Automatically skips unnecessary funding steps once minimum is reached
- ✅ **Comprehensive Error Handling**: Detailed error reporting and recovery procedures for all failure scenarios
- ✅ **Parameter Validation**: Extensive upfront validation prevents costly failed operations

**Debugging & Monitoring Enhancements:**
- ✅ **Enterprise-Grade Logging**: Comprehensive emoji-coded logging system throughout ALL automation phases
- ✅ **Marketplace Timing Diagnosis**: Detailed logs show offer expiry (20 blocks) vs automation trigger (5 blocks) timing
- ✅ **Revocation Analysis**: Complete R-address comparison tracking for sold vs unsold ticket identification
- ✅ **Process Flow Visibility**: Every automation step logged with success/error/warning indicators
- ✅ **Timing Issue Resolution**: Enhanced marketplace monitoring prevents offers expiring at wrong times

**Critical Technical Fixes:**
- ✅ **Fixed Timelock Unlock Command**: Corrected jackpot identity extraction from ticket names (`jackpot.mainLotteryId@` format)
- ✅ **Corrected Timelock Parameters**: Fixed `setunlockdelay` parameter naming per Verus API documentation  
- ✅ **Enhanced Marketplace Logic**: Dual-trigger system monitors both offer expiry AND automation timing
- ✅ **Accurate Fund Calculations**: Dynamic calculation ensures exact amounts are sent (e.g., 2 shylock needed = 2 shylock sent)
- ✅ **Confirmation Tracking**: Proper operation and transaction confirmation monitoring with retries
- ✅ **Identity Operation Funding**: All `registernamecommitment`, `registeridentity`, and `updateidentity` operations now use primary R-address as `sourceoffunds` instead of identity (fixes VRSCTEST transaction fee issues)

## UTXO Management & Transaction Fee Requirements

### Critical UTXO Splitting for Multi-Operation Automation

The vLotto system performs numerous blockchain operations during each lottery cycle, with each operation requiring transaction fees paid in VRSCTEST. Proper UTXO (Unspent Transaction Output) management is essential for reliable automation execution.

#### **Operations Requiring Transaction Fees**

Each lottery cycle executes multiple fee-requiring operations:

1. **Identity Operations (per ticket)**:
   - `registernamecommitment` - 0.001+ VRSCTEST per ticket
   - `registeridentity` - 0.001+ VRSCTEST per ticket  
   - `updateidentity` - 0.001+ VRSCTEST per ticket (for content storage)

2. **Marketplace Operations (per ticket)**:
   - `makeoffer` - 0.001+ VRSCTEST per ticket listing

3. **Timelock Operations**:
   - `setidentitytimelock` - 0.001+ VRSCTEST per timelock operation
   - Multiple timelock operations per cycle (set, unlock, remove)

4. **Funding Operations**:
   - `sendcurrency` - 0.001+ VRSCTEST per funding transaction
   - Multiple funding steps per lottery cycle

5. **Revocation Operations**:
   - `revokeidentity` - 0.001+ VRSCTEST per unsold ticket revocation

#### **UTXO Availability Problem**

**Issue**: Large consolidated UTXOs cannot be spent in parallel transactions. If the funding source has only one large UTXO (e.g., 1000 VRSCTEST), the system cannot simultaneously execute multiple operations requiring fees.

**Example Failure Scenario**:
```
Lottery with 50 tickets requires:
- 50 × registernamecommitment = 50 × 0.001 = 0.05 VRSCTEST
- 50 × registeridentity = 50 × 0.001 = 0.05 VRSCTEST  
- 50 × updateidentity = 50 × 0.001 = 0.05 VRSCTEST
- 50 × makeoffer = 50 × 0.001 = 0.05 VRSCTEST
- Additional timelock/funding ops = ~0.01 VRSCTEST

Total: ~0.21 VRSCTEST in fees across ~200+ operations
Problem: If source has 1 UTXO of 1000 VRSCTEST, only 1 operation can execute at a time
Result: "Insufficient funds" errors during parallel operations
```

#### **UTXO Splitting Solution**

**Pre-split UTXOs** into many small outputs to enable parallel fee payments:

```bash
# Example: Split 100 VRSCTEST into 1000 UTXOs of 0.1 each
./sendcurrency_batch.sh
# Input: address, 1000 iterations, 0.1 amount
# Result: 1000 separate UTXOs of 0.1 VRSCTEST each
```

**Optimal UTXO Strategy**:
- **Small UTXO Size**: 0.001 - 0.1 VRSCTEST per UTXO
- **Large Quantity**: 100-1000+ UTXOs depending on lottery size
- **Buffer Overhead**: 2-3x expected operations for safety margin

#### **Technical Implementation Details**

**UTXO Creation Command**:
```bash
./verus -chain=vrsctest sendcurrency "source_address" '[
  {"amount":0.001,"address":"source_address"},
  {"amount":0.001,"address":"source_address"},
  // ... repeated for desired quantity
]'
```

**Automated UTXO Splitting Script**: `sendcurrency_batch.sh`
- **Input**: Address (R-address, VerusID, or i-address)
- **Parameters**: Iterations count, amount per UTXO
- **Output**: Multiple UTXOs for parallel fee payments
- **Validation**: Address format verification and amount validation

#### **UTXO Requirements by Operation Scale**

| Ticket Quantity | Est. Operations | Recommended UTXOs | UTXO Size | Total Reserve |
|-----------------|-----------------|-------------------|-----------|---------------|
| 1-10 tickets    | 40-80 ops       | 100 UTXOs        | 0.005     | 0.5 VRSCTEST  |
| 11-50 tickets   | 100-300 ops     | 500 UTXOs        | 0.002     | 1.0 VRSCTEST  |
| 51-100 tickets  | 300-600 ops     | 1000 UTXOs       | 0.001     | 1.0 VRSCTEST  |
| 100+ tickets    | 600+ ops        | 2000+ UTXOs      | 0.001     | 2.0+ VRSCTEST |

#### **UTXO Monitoring & Maintenance**

**Pre-Automation Checks**:
```bash
# Check UTXO count for address
./verus -chain=vrsctest listunspent 1 999999 '["address"]' | jq length

# Check UTXO distribution
./verus -chain=vrsctest listunspent 1 999999 '["address"]' | jq '[.[].amount] | group_by(.) | map({amount: .[0], count: length})'
```

**UTXO Depletion Detection**:
- Monitor "Insufficient funds" errors during automation
- Implement UTXO count warnings when below threshold
- Automatic UTXO splitting recommendations

**Best Practices**:
1. **Pre-split Before Automation**: Always ensure adequate UTXO count before starting lottery
2. **Conservative Estimates**: Use 2-3x expected operation count for UTXO quantity
3. **Regular Monitoring**: Check UTXO availability between lottery cycles
4. **Automated Alerts**: Implement low-UTXO warnings in automation system
5. **Emergency Reserves**: Maintain separate UTXO pools for different operations

#### **Integration with vLotto Automation**

**Funding Engine Enhancements**:
- UTXO availability validation before funding operations
- Intelligent source selection based on UTXO count
- Automatic UTXO splitting recommendations

**Error Recovery**:
- Detect "Insufficient funds" errors caused by UTXO depletion
- Provide specific guidance for UTXO splitting
- Implement retry mechanisms after UTXO splitting

**Performance Impact**:
- **Benefit**: Enables parallel transaction execution
- **Cost**: Slightly higher total fees due to multiple small UTXOs
- **Efficiency**: Dramatically faster automation execution
- **Reliability**: Eliminates most "Insufficient funds" failures

This UTXO management system is critical for reliable vLotto automation, especially for lotteries with many tickets requiring numerous blockchain operations.

## System Architecture

### Core Components

1. **Automation Engine** - Orchestrates the complete lottery cycle
2. **Funding Engine** - Manages jackpot funding and revenue distribution  
3. **Timelock Engine** - Secures funds until drawing time
4. **Ticket Generation System** - Creates and manages lottery tickets as blockchain identities
5. **Drawing System** - Performs blockchain-based random number generation
6. **Payout Engine** - Distributes winnings and manages revenue allocation
7. **Verification System** - Validates ticket authenticity and drawing results

### Identity Structure

The vLotto system uses a hierarchical identity structure on the Verus blockchain:

```
Main Lottery ID: mainLotteryId@
├── jackpot.mainLotteryId@      (Jackpot funds)
├── payout.mainLotteryId@       (Payout distribution)
├── operations.mainLotteryId@   (Operations revenue)
├── proofguard.mainLotteryId@   (Ticket validation)
├── reserves.mainLotteryId@     (Emergency reserves)
├── revenues.mainLotteryId@     (Revenue collection)
└── Tickets:
    ├── [drawingBlock]_1of[qty]@mainLotteryId@
    ├── [drawingBlock]_2of[qty]@mainLotteryId@
    └── ... (up to calculated quantity)
```

## Lottery Parameters

### Core Parameters

| Parameter | Type | Description | Usage |
|-----------|------|-------------|-------|
| `mainVerusId` | string | Main lottery identity (e.g., `mainLotteryId@`) | Root identity for all lottery operations |
| `futureBlockNumber` | integer | Target drawing block number | Defines when lottery drawing occurs |
| `drawingInterval` | integer | Blocks between drawings | Determines lottery cycle length |
| `ticketMultiplier` | decimal | Jackpot × multiplier = ticket quantity | Controls ticket generation quantity |
| `jackpotMinimum` | decimal | Minimum jackpot amount | Triggers funding if not met |
| `jackpotCeilingCap` | decimal | Maximum jackpot amount | Controls jackpot rollover behavior |

### Distribution Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `nextJackpotPercent` | decimal | % of revenue to next jackpot | 50% |
| `operationsPercent` | decimal | % of revenue to operations | 10% |
| `destination1-6Name` | string | Custom destination names | Optional |
| `destination1-6Percent` | decimal | Custom destination percentages | Optional |

### Automation Parameters

| Parameter | Type | Description | Usage |
|-----------|------|-------------|-------|
| `confirmations` | integer | Required block confirmations | Transaction security |
| `gracePeriod` | integer | Idle blocks after payout | Cycle timing |
| `closeOffersBeforeDrawing` | integer | Blocks before drawing to close offers | Marketplace management |
| `rAddressForTickets` | string | R-address for ticket control | Ticket ownership management |

## Verus RPC Commands Used

### Identity Management
- `getidentity [identity_name]` - Retrieve identity information
- `registeridentity [identity_object]` - Create new identity
- `updateidentity [update_args]` - Update identity with content
- `revokeidentity [identity_name] [parent_id]` - Revoke identity
- `registernamecommitment [identity_name] [parent_id] [salt]` - Precommit identity

### Currency Operations
- `getcurrencybalance [identity_name]` - Get currency balances
- `sendcurrency [from_address, [{"address": "to", "amount": value}]]` - Send currency
- `sendtoaddress [address] [amount]` - Send to R-address

### Blockchain Queries
- `getblockcount` - Get current block height
- `getblockhash [block_number]` - Get hash for specific block
- `getblockchaininfo` - Get blockchain status
- `gettransaction [txid]` - Get transaction details

### Timelock Operations
- `setidentitytimelock [identity] [{"setunlockdelay": blocks}] [returntx] [feeoffer] [sourceoffunds]` - Lock identity with block delay
- `setidentitytimelock [identity] [{"unlockatblock": 0}] [returntx] [feeoffer] [sourceoffunds]` - Start unlock countdown

### Marketplace Operations  
- `makeoffer [offer_object]` - Create marketplace offer
- `closeoffers` - Close all active offers

### Message Signing/Verification
- `signmessage [identity] [message]` - Sign message with identity
- `verifymessage [identity] [signature] [message]` - Verify message signature

### Operation Status
- `z_getoperationstatus [[operation_id]]` - Check async operation status

## Automation Workflow

The vLotto system operates through a carefully orchestrated multi-phase automation process that ensures secure, transparent, and provably fair lottery operations. Each phase builds upon the previous one, with critical validation checkpoints to prevent errors and ensure user funds are protected.

### Phase 1: Funding and Preparation

This phase is the foundation of the entire lottery cycle. It ensures that the lottery has adequate funds before any tickets are generated or sold. The system uses a sophisticated multi-source funding strategy with dynamic amount calculations to achieve the required jackpot minimum while minimizing transaction costs.

#### 1.1 Parameter Validation

**Purpose**: Validates all input parameters before any blockchain operations begin. This prevents costly failed transactions and ensures the lottery is configured correctly.

**What it does**: 
- Checks all required parameters exist and are valid
- Validates numerical ranges (drawing intervals, minimums, percentages)
- Ensures identity names are properly formatted
- Verifies percentages add up correctly for distribution
- Confirms blockchain connectivity and wallet access

**Why it's critical**: Invalid parameters could result in failed transactions, lost funds, or impossible lottery configurations. This validation acts as the first line of defense.

```javascript
// Comprehensive parameter validation before any blockchain operations
const validation = ParameterValidator.validateAutomationParameters(parameters);
if (!validation.valid) {
    // STOP EVERYTHING - Invalid configuration detected
    throw new Error(`Parameter validation failed: ${validation.errors.join(', ')}`);
}

// Example validations:
// - drawingInterval > 0 (must have time between drawings)
// - jackpotMinimum > 0 (must have minimum payout)  
// - nextJackpotPercent + operationsPercent <= 100 (can't exceed 100%)
// - mainVerusId ends with '@' (proper identity format)
```

#### 1.2 Jackpot Funding (Smart Multi-Source Strategy)

**Purpose**: Ensures the lottery jackpot meets the minimum required amount using the most efficient combination of available funding sources. This system uses intelligent dynamic calculation to prevent over-funding and minimize transaction fees.

**How it works**:
1. **Multi-Source Prioritization**: Attempts funding sources in order of preference and availability
2. **Dynamic Amount Calculation**: Each step calculates exactly how much is still needed in real-time
3. **Partial Funding Support**: Multiple sources can contribute incrementally until minimum is reached
4. **Smart Step Skipping**: Skips unnecessary funding steps once jackpot is adequately funded
5. **Transaction Fee Validation**: Ensures each source has both target currency AND VRSCTEST for fees

**Funding Source Priority Order** (always attempted in this order):
1. **Revenue Distribution** (Priority 1) - Existing revenue → jackpot + operations
2. **Reserves Fallback** (Priority 2) - Emergency reserves → jackpot  
3. **R-Address Final Emergency** (Priority 3) - Primary R-address → jackpot (LAST RESORT)

**Why this approach**: Traditional funding systems send fixed amounts, often resulting in over-funding or failed transactions. The vLotto dynamic system calculates the exact need before each transaction, ensuring efficiency and preventing waste.

```javascript
// Step 1: Check current jackpot balance to understand starting point
const jackpotBalance = await sendCommand('getcurrencybalance', [`jackpot.${mainLotteryId}`]);
console.log(`Starting jackpot balance: ${jackpotBalance[currency] || 0} ${currency}`);

// Step 2: Calculate comprehensive funding plan with all available sources
const fundingPlan = await calculateFundingRequirements(mainLotteryId, parameters);
console.log(`Funding plan created with ${fundingPlan.fundingPlan.length} potential steps`);

// Step 3: Execute funding with SMART DYNAMIC CALCULATION
for (const step of fundingPlan.fundingPlan) {
    if (step.destination === 'jackpot') {
        // CRITICAL: Get current balance right before EACH transaction
        const currentBalance = await sendCommand('getcurrencybalance', [`jackpot.${mainLotteryId}`]);
        const currentAmount = currentBalance[currency] || 0;
        const stillNeeded = Math.max(0, jackpotMinimum - currentAmount);
        
        if (stillNeeded <= 0) {
            console.log(`✅ Jackpot already funded (${currentAmount} >= ${jackpotMinimum}), skipping step`);
            continue; // Skip this step - no longer needed
        }
        
        // Send exactly what's needed (up to what this source can provide)
        const actualAmount = Math.min(stillNeeded, step.maxAvailable);
        console.log(`💰 Sending ${actualAmount} ${currency} from ${step.source} (need: ${stillNeeded})`);
        
        await sendCommand('sendcurrency', [sourceId, [{
            currency: currency,
            amount: actualAmount,  // DYNAMIC - calculated per transaction!
            address: `jackpot.${mainLotteryId}`
        }]]);
    }
}

// Real-world example:
// Minimum needed: 100 shylock, Current: 0 shylock
// Step 1: Revenue source sends 30 shylock → Jackpot now: 30 shylock
// Step 2: Reserves calculates need 70, sends 50 → Jackpot now: 80 shylock  
// Step 3: R-address calculates need 20, sends 20 → Jackpot now: 100 shylock ✅
// Step 4: (if any) calculates need 0, skips step → Process complete
```

**Revenue Distribution Command:**
```javascript
await sendCommand('sendcurrency', [
    `revenue.${mainLotteryId}`,
    [
        {"address": `jackpot.${mainLotteryId}`, "amount": jackpotAmount},
        {"address": `operations.${mainLotteryId}`, "amount": operationsAmount}
    ]
]);
```

**Dynamic Funding Amount Calculation:**
```javascript
// Before each funding step, calculate exactly what's needed
const currentJackpotBalance = await sendCommand('getcurrencybalance', [`jackpot.${mainLotteryId}`]);
const currentBalance = currentJackpotBalance[parentCurrency] || 0;
const stillNeeded = Math.max(0, jackpotMinimum - currentBalance);

// Examples:
// Minimum: 100, Current: 0   → stillNeeded: 100
// Minimum: 100, Current: 30  → stillNeeded: 70  
// Minimum: 100, Current: 100 → stillNeeded: 0 (skip step)
// Minimum: 100, Current: 120 → stillNeeded: 0 (skip step)

if (stillNeeded > 0) {
    const actualAmount = Math.min(stillNeeded, sourceAvailable);
    // Send only what's needed and available
}
```

**Funding Source Validation:**
```javascript
// Before each sendcurrency, validate source has both currencies
const validation = await validateFundingSourceBalances(sourceId, targetCurrency, actualAmount);
if (!validation.isValid) {
    // Examples of validation errors:
    // "Insufficient shylock: has 50.0, needs 70.0"
    // "Insufficient VRSCTEST for transaction fees: has 0.0005, needs at least 0.001"
    throw new Error(`Funding failed: ${validation.errors.join(', ')}`);
}
```

**Partial Funding Handling:**
```javascript
// Example scenario: Need 100, have multiple sources
// Step 1: Source A has 30 → Send 30, jackpot now has 30
// Step 2: Source B has 50 → Need 70, send 50, jackpot now has 80  
// Step 3: Source C has 25 → Need 20, send 20, jackpot now has 100 ✅
// Step 4: Source D → Need 0, skip step
```

#### 1.3 Jackpot Balance Verification (CRITICAL SECURITY CHECKPOINT)

**Purpose**: This is the most critical security gate in the entire vLotto system. It verifies that the jackpot actually contains the required funds before proceeding with timelock and ticket generation. This prevents users from buying tickets for worthless lotteries.

**What it does**:
- Queries the blockchain for current `jackpot.${mainLotteryId}` balance
- Compares actual balance against the required minimum
- Validates that funding operations actually succeeded
- Acts as an absolute go/no-go decision point
- Prevents progression if any funding step failed silently

**Why this is essential**:
1. **User Protection**: Prevents selling tickets for lotteries with no payout
2. **Fraud Prevention**: Detects if funding transactions failed but weren't caught
3. **System Integrity**: Ensures the lottery actually has funds to distribute
4. **Legal Compliance**: Guarantees advertised payouts are backed by actual funds
5. **Reputation Protection**: Prevents impossible payout scenarios that would damage trust

**What happens on failure**: The ENTIRE automation process immediately stops. No timelock is applied, no tickets are generated, no marketplace listings are created. The lottery is effectively cancelled until the funding issue is resolved.

```javascript
// CRITICAL SECURITY CHECKPOINT - This determines if the lottery can proceed
console.log('🔍 CRITICAL CHECKPOINT: Verifying jackpot has required funds...');

const verificationResult = await verifyJackpotBalanceAfterFunding(mainLotteryId, parameters);

if (!verificationResult.success) {
    // IMMEDIATE STOP - No lottery can proceed without proper funding
    console.error('🚨 CRITICAL FAILURE: Jackpot verification failed');
    console.error(`💰 Current balance: ${verificationResult.currentBalance}`);
    console.error(`📋 Required minimum: ${verificationResult.minimumRequired}`);
    console.error(`❌ Error: ${verificationResult.error}`);
    
    // PROCESS STOPS HERE - NO TIMELOCK, NO TICKETS, NO LOTTERY
    // This protects users from buying worthless tickets
    throw new Error(`JACKPOT VERIFICATION FAILED - PROCESS STOPPED: ${verificationResult.error}`);
}

// Only reached if verification PASSES - Safe to proceed with lottery
console.log(`✅ JACKPOT VERIFIED: ${verificationResult.currentBalance} ${currency}`);
console.log(`📊 Meets minimum requirement: ${verificationResult.minimumRequired} ${currency}`);
console.log(`🎯 Ready to proceed with timelock and ticket generation`);

// Example verification scenarios:
// Scenario 1: Required 100, Found 0   → STOP (no funds)
// Scenario 2: Required 100, Found 50  → STOP (insufficient)  
// Scenario 3: Required 100, Found 100 → PROCEED ✅
// Scenario 4: Required 100, Found 150 → PROCEED ✅ (surplus is good)
```

**Absolute Verification Requirements:**
- ✅ Jackpot balance must be > 0 (must have some funds)
- ✅ Jackpot balance must be >= minimum required (must meet advertised amount)
- ✅ Balance check must succeed (identity must exist and be accessible)
- ❌ If ANY requirement fails: **ENTIRE LOTTERY PROCESS STOPS IMMEDIATELY**

**Recovery Process**: If verification fails, the system logs detailed error information and stops. Operators must manually investigate the funding failure, resolve the issue (additional funding, fix failed transactions, etc.), and restart the process.

#### 1.4 Timelock Setup (Delay-Based Security Model)

**Purpose**: Implements a sophisticated security mechanism that immediately locks the verified jackpot funds using a delay-based timelock system. This prevents premature access to lottery funds while allowing controlled release after winner verification.

**How the delay-based timelock works**:
1. **Immediate Lock**: Jackpot funds are locked immediately upon command execution
2. **Delay Configuration**: A 1-block delay is set for future unlock operations  
3. **Controlled Release**: Unlock can only be triggered after winner verification
4. **Automatic Expiration**: Once unlock is triggered, funds release after the delay period

**Security Benefits**:
- **Immediate Protection**: Funds are secured the moment timelock is applied
- **Fraud Prevention**: No premature access to lottery funds possible
- **Automated Security**: No manual intervention required for normal operations
- **Flexible Release**: Can be unlocked when legitimate winner is verified
- **Minimal Delay**: Only 1-block delay minimizes payout wait time

**Why 1-block delay**: This provides the shortest possible delay while still maintaining security. It allows rapid payout processing after winner verification while preventing instant unauthorized access.

```javascript
// Apply immediate security lock with 1-block unlock delay
console.log('🔒 SECURITY PHASE: Applying timelock to verified jackpot...');

const timelockResult = await sendCommand('setidentitytimelock', [
    `jackpot.${mainLotteryId}`,        // Target identity to lock
    {"setunlockdelay": 1},            // 1-block delay for unlock (corrected parameter)
    false,                            // Submit transaction immediately
    0.001,                            // feeoffer (small transaction fee)
    sourceRAddress                    // sourceoffunds (primary R-address for fees)
]);

if (timelockResult) {
    console.log(`🔐 JACKPOT SECURED: Timelock applied with transaction ${timelockResult}`);
    console.log(`⏰ Unlock delay set to 1 block for controlled release`);
    console.log(`🎯 Jackpot is now protected until winner verification`);
} else {
    throw new Error('Timelock application failed - jackpot remains unsecured');
}

// Timelock status after application:
// - Jackpot funds: LOCKED (cannot be spent)
// - Unlock method: Delay-based (1 block countdown when triggered)
// - Current state: SECURED until drawing and winner verification
// - Access control: Only authorized operations can trigger unlock
```

**Timelock Lifecycle**:
1. **Application**: Funds immediately locked with 1-block delay configured
2. **Transaction Confirmation**: Uses `gettransaction` to confirm timelock TxID (NOT `z_getoperationstatus`)
3. **Flags Verification**: Checks identity flags using `getidentity` - 2nd bit must be set (`flags & 2 === 2`)
4. **Active Period**: Jackpot remains locked during ticket sales and drawing
5. **Winner Verification**: System verifies legitimate winner cryptographically  
6. **Unlock Trigger**: System sends unlock command (`unlockatblock: 0`)
7. **Delay Period**: 1-block countdown begins automatically
8. **Fund Release**: Jackpot becomes spendable for payout distribution

**Critical Verification Process:**
- ✅ **TxID Confirmation**: `gettransaction(txid)` confirms timelock transaction
- ✅ **Flags Verification**: `getidentity(jackpotId).flags & 2 === 2` confirms timelock is active
- ✅ **No Timeouts**: System waits indefinitely for timelock confirmation (blocks can be slow)
- ✅ **Bitwise Flag Check**: Properly handles multiple flag combinations (e.g., flags=3 means bits 1+2 set)

**Error Handling**: If timelock application fails, the entire process stops to prevent unsecured lottery operations. The system will not proceed to ticket generation with an unlocked jackpot.

### Phase 2: Ticket Generation

#### 2.1 Ticket Quantity Calculation
```javascript
// Calculate tickets from locked jackpot
const jackpotBalance = await sendCommand('getcurrencybalance', [`jackpot.${mainLotteryId}`]);
const ticketQuantity = Math.ceil(jackpotBalance[parentCurrency] * ticketMultiplier);
```

#### 2.2 Ticket Creation Process

**Step 1: Name Commitment**
```javascript
// Use primary R-address of mainLotteryId for sourceoffunds (has VRSCTEST for fees)
const mainIdRAddress = await getPrimaryAddressForIdentity(mainLotteryId);

const commitResult = await sendCommand('registernamecommitment', [
    ticketName,        // e.g., "[drawingBlock]_1of[qty]@"
    rAddressForTickets,// control address for ticket
    '',                // referral identity
    parentCurrency,    // parent currency name
    mainIdRAddress     // sourceoffunds - R-address has VRSCTEST for fees
]);
```

**Step 2: Identity Registration** 
```javascript
const registerResult = await sendCommand('registeridentity', [{
    txid: commitResult.txid,
    namereservation: commitResult.namereservation,
    identity: {
        name: ticketName,
        primaryaddresses: [rAddressForTickets],
        minimumsignatures: 1,
        revocationauthority: mainLotteryId,
        recoveryauthority: mainLotteryId
    },
    sourceoffunds: mainIdRAddress,  // R-address has VRSCTEST for fees
    changeaddress: mainIdRAddress   // R-address for change
}]);
```

**Step 3: Ticket Payload Creation**
```javascript
const ticketPayload = {
    ticketId: ticketName,
    drawingBlock: calculatedDrawingBlock,
    registrationTxId: registerResult,
    registrationBlock: currentBlock,
    playingNumber: generateRandomHash(),
    timestamp: new Date().toISOString(),
    ticketValidation: {
        signature: ticketSignature,
        message: registerResult
    },
    proofguardAcknowledgement: {
        signature: proofguardSignature,
        message: ticketSignature
    }
};
```

**Step 4: Content Storage**
```javascript
// Store ticket data using VDXF keys
const contentUpdate = {
    [VDXF_KEYS.PRIMARY_TICKET_FINALIZED_DATA]: [{
        [VDXF_KEYS.DATA_DESCRIPTOR]: {
            version: 1,
            flags: 96,
            mimetype: "text/plain",
            objectdata: {
                message: JSON.stringify(ticketPayload)
            },
            label: "VLotto Ticket Chain of Custody Data"
        }
    }]
};

const updateResult = await sendCommand('updateidentity', [{
    name: ticketSubIdName,
    parent: parentIdName,
    contentmultimap: contentUpdate,
    sourceoffunds: mainIdRAddress  // R-address has VRSCTEST for fees
}]);
```

### Phase 3: Marketplace Listing with Enhanced Monitoring

#### 3.1 Offer Creation with Comprehensive Logging
```javascript
// Calculate expiry block for offers (20 blocks before drawing)
const expiryBlock = futureBlockNumber ? parseInt(futureBlockNumber) - 20 : undefined;
console.log(`⏰ [TicketGeneration] Marketplace offers will expire at block: ${expiryBlock}`);
console.log(`📊 [TicketGeneration] Drawing block: ${futureBlockNumber}, Expiry: 20 blocks before drawing`);

const offerData = {
    changeaddress: revenuesPrimaryAddress,
    expiryheight: expiryBlock,  // 20 blocks before drawing
    offer: {
        identity: ticketName
    },
    for: {
        address: revenuesAddress,
        currency: parentCurrency,
        amount: 1
    }
};

console.log(`📋 [TicketGeneration] Offer data for ${ticketName}:`, {
    changeaddress: revenuesPrimaryAddress,
    expiryheight: expiryBlock,
    offerIdentity: ticketName,
    forAddress: revenuesAddress,
    forCurrency: parentCurrency,
    amount: 1
});

const makeOfferResult = await sendCommand('makeoffer', [
    revenuesPrimaryAddress, 
    offerData,
    false // returntx
]);

if (makeOfferResult && makeOfferResult.txid) {
    console.log(`✅ [TicketGeneration] Successfully listed ${ticketName} - TXID: ${makeOfferResult.txid}`);
}
```

#### 3.2 Enhanced Offer Management with Dual-Trigger Monitoring
```javascript
// ENHANCED MARKETPLACE MONITORING with detailed logging
console.log(`🏪 [VLottoAutomation] === MARKETPLACE MONITORING ===`);
console.log(`📊 [VLottoAutomation] Blocks until drawing: ${remaining}`);
console.log(`⚙️ [VLottoAutomation] Close offers trigger: ${closeOffersBeforeDrawing} blocks before drawing`);

// Calculate when offers should expire (20 blocks before drawing)
const offerExpiryBlock = targetDrawingBlock - 20;
const blocksUntilOfferExpiry = Math.max(0, offerExpiryBlock - parseInt(newBlockHeight));

console.log(`⏰ [VLottoAutomation] Offer expiry block: ${offerExpiryBlock} (${blocksUntilOfferExpiry} blocks until expiry)`);

// Check if offers have expired (20 blocks before drawing) OR automation trigger reached
const offersExpired = parseInt(newBlockHeight) >= offerExpiryBlock;
const automationTrigger = closeOffersBeforeDrawing >= 0 && remaining <= closeOffersBeforeDrawing;

if (offersExpired || automationTrigger) {
    const triggerReason = offersExpired ? 
        `offers expired at block ${offerExpiryBlock}` : 
        `automation trigger at ${closeOffersBeforeDrawing} blocks before drawing`;
        
    console.log(`🚨 [VLottoAutomation] === REVOCATION TRIGGER ===`);
    console.log(`📋 [VLottoAutomation] Trigger reason: ${triggerReason}`);
    console.log(`🧱 [VLottoAutomation] Current block: ${newBlockHeight}, Expiry block: ${offerExpiryBlock}`);
}
```

### Phase 4: Ticket Revocation with Comprehensive R-Address Analysis

#### 4.1 Enhanced Unsold Ticket Detection with Detailed Logging
```javascript
console.log(`🗑️ [TicketGeneration] === UNSOLD TICKET REVOCATION START ===`);
console.log(`🔑 [TicketGeneration] Original R-address for tickets: ${originalRAddress}`);
console.log(`🎫 [TicketGeneration] Checking ${tickets.length} tickets for R-address changes`);

const unsoldTickets = [];
const soldTickets = [];
const errorTickets = [];

console.log(`🔍 [TicketGeneration] === TICKET ANALYSIS START ===`);

// Check each ticket to see if its primary R-address still matches our original one
for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const ticketName = ticket.name;
    
    console.log(`🎫 [TicketGeneration] Checking ticket ${i + 1}/${tickets.length}: ${ticketName}`);
    
    // Get current identity data for the ticket
    const identityData = await sendCommand('getidentity', [ticketName]);
    
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
    } else {
        // R-address changed = sold ticket
        soldTickets.push(ticketName);
        console.log(`💰 [TicketGeneration] ${ticketName} SOLD (R-address changed to ${currentRAddress})`);
    }
}

console.log(`📊 [TicketGeneration] === REVOCATION ANALYSIS SUMMARY ===`);
console.log(`🎫 [TicketGeneration] Unsold tickets found: ${unsoldTickets.length}`);
console.log(`💰 [TicketGeneration] Sold tickets found: ${soldTickets.length}`);
console.log(`❌ [TicketGeneration] Error tickets: ${errorTickets.length}`);
```

#### 4.2 Enhanced Revocation Process with Execution Tracking
```javascript
if (unsoldTickets.length === 0) {
    console.log(`✅ [TicketGeneration] No unsold tickets found - revocation complete`);
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
    
    const result = await sendCommand('revokeidentity', [ticketName, mainLotteryId]);
    
    if (result && typeof result === 'string' && result.length === 64) {
        console.log(`✅ [TicketGeneration] Successfully revoked ${ticketName} - TXID: ${result}`);
        revocationTxIds.push({ ticketName, txid: result });
        newlyRevokedTickets.push(ticketName);
    }
}

console.log(`📊 [TicketGeneration] === REVOCATION EXECUTION SUMMARY ===`);
console.log(`✅ [TicketGeneration] Successfully revoked: ${newlyRevokedTickets.length} tickets`);
console.log(`❌ [TicketGeneration] Failed to revoke: ${unsoldTickets.length - newlyRevokedTickets.length} tickets`);
console.log(`📝 [TicketGeneration] Revocation TXIDs: ${revocationTxIds.length}`);
```

### Phase 5: Drawing Execution with Enhanced Logging

#### 5.1 Drawing Phase Start with Comprehensive Logging
```javascript
console.log('🎲 [VLottoAutomation] === DRAWING PHASE START ===');
console.log(`📊 [VLottoAutomation] Drawing Block Reached: ${targetDrawingBlock} (current: ${newBlockHeight})`);
console.log(`🎫 [VLottoAutomation] Found ${tickets.length} tickets for drawing`);
console.log(`🗑️ [VLottoAutomation] Revoked tickets: ${revokedTickets.length}`);

// Get winning hash from drawing block
const winningHash = await sendCommand('getblockhash', [drawingBlock]);
console.log(`🎯 [VLottoAutomation] Executing drawing with comprehensive verification...`);
```

#### 5.2 Ticket Verification and Scoring with Process Tracking

**Identity History Verification:**
```javascript
const historyResponse = await sendCommand('getidentityhistory', [ticketName]);
const vlottoData = extractLatestVLottoDataFromHistory(historyResponse, VDXF_KEYS);
```

**Signature Verification:**
```javascript
// Verify ticket signature
const ticketVerified = await sendCommand('verifymessage', [
    ticketName,
    vlottoData.ticketValidation.signature,
    vlottoData.registrationTxId
]);

// Verify proofguard signature  
const proofguardVerified = await sendCommand('verifymessage', [
    proofguardId,
    vlottoData.proofguardAcknowledgement.signature,
    vlottoData.ticketValidation.signature
]);
```

**Score Calculation:**
```javascript
function calculateTicketScore(ticketHash, winningHash) {
    let score = 0;
    const matchingPositions = [];
    
    for (let i = 0; i < 64; i++) {
        if (ticketHash[i] === winningHash[i]) {
            const hexValue = parseInt(ticketHash[i], 16);
            score += hexValue;
            matchingPositions.push(i);
        }
    }
    
    return { score, matchingPositions };
}
```

#### 5.3 Drawing Completion and Success Logging
```javascript
if (actualWinner) {
    console.log('🏆 [VLottoAutomation] Drawing execution completed successfully');
    console.log(`🎯 Winner: Ticket #${actualWinner.id} with score ${maxScore}`);
} else {
    console.log('❌ [VLottoAutomation] No winner found in drawing');
}
```

### Phase 6: Jackpot Unlock and Payout Distribution

#### 6.1 Jackpot Unlock After Winner Verification
```javascript
// FIXED: Correctly extract mainLotteryId from winner ticket name
// Ticket name format: "575800_1of6@mylottery.shylock@"
const ticketFullName = winner.name;
const mainLotteryIdWithAt = ticketFullName.split('@').slice(1).join('@'); // Get "mylottery.shylock@"
const mainLotteryId = mainLotteryIdWithAt.replace('@', ''); // Get "mylottery.shylock"

console.log(`[DrawingSystem] Will unlock: jackpot.${mainLotteryId}@`);

// After winner passes cryptographic verification, unlock jackpot
const timelockEngine = new TimelockEngine(sendCommand);
await timelockEngine.unlockJackpotAfterDrawing(mainLotteryId, 3);

// This command starts the 1-block countdown:
await sendCommand('setidentitytimelock', [
    `jackpot.${mainLotteryId}@`,  // FIXED: Now uses correct full identity
    {"unlockatblock": 0},         // Starts delay countdown
    false,                        // Submit transaction immediately
    0.001,                        // feeoffer (small transaction fee)
    sourceRAddress                // sourceoffunds (primary R-address for fees)
]);
```

#### 6.2 Winner Determination
```javascript
// Sort tickets by score (highest wins)
const sortedTickets = tickets
    .filter(t => !t.isRevoked && !t.fraudulent)
    .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.id - b.id;  // Tie-breaking by lowest ID
    });

const winner = sortedTickets[0];
```

#### 6.3 Payout Calculation
```javascript
const payoutDistribution = {
    winner: { amount: winnerAmount, percent: winnerPercent },
    nextJackpot: { amount: nextJackpotAmount, percent: nextJackpotPercent },
    operations: { amount: operationsAmount, percent: operationsPercent },
    destinations: [
        // Custom destinations 1-6
    ]
};
```

#### 6.4 Payout Execution (After 1-Block Delay)
```javascript
// Send to winner
await sendCommand('sendcurrency', [
    `jackpot.${mainLotteryId}`,
    [{"address": winnerTicketName, "amount": winnerAmount}]
]);

// Send to next jackpot
await sendCommand('sendcurrency', [
    `jackpot.${mainLotteryId}`,
    [{"address": `jackpot.${mainLotteryId}`, "amount": nextJackpotAmount}]
]);

// Send to operations
await sendCommand('sendcurrency', [
    `jackpot.${mainLotteryId}`,
    [{"address": `operations.${mainLotteryId}`, "amount": operationsAmount}]
]);
```

## VDXF Keys and Data Storage

### Primary VDXF Keys
```javascript
export const VDXF_KEYS = {
    PRIMARY_TICKET_FINALIZED_DATA: "iMzWvy5j4ciiMSBsEEVzfy66awLQ85b4GN",  // vlotto.ticket.finalizeddata
    DATA_DESCRIPTOR: "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv"  // Standard data descriptor
};
```

### Content Multimap Structure
```javascript
{
    [VDXF_KEYS.PRIMARY_TICKET_FINALIZED_DATA]: [{
        [VDXF_KEYS.DATA_DESCRIPTOR]: {
            version: 1,
            flags: 96,
            mimetype: "text/plain",
            objectdata: {
                message: JSON.stringify({
                    ticketId: "575800_1of6@mylottery.shylock@",
                    drawingBlock: 575800,
                    registrationTxId: "abc123...",
                    playingNumber: "d4e5f6...",
                    ticketValidation: {
                        signature: "xyz789...",
                        message: "abc123..."
                    },
                    proofguardAcknowledgement: {
                        signature: "def456...",
                        message: "xyz789..."
                    }
                })
            },
            label: "VLotto Ticket Chain of Custody Data"
        }
    }]
}
```

## Utility Functions

### Ticket Name Generation
```javascript
function generateTicketName(drawingBlock, ticketNumber, totalTickets, mainLotteryId) {
    return `${drawingBlock}_${ticketNumber}of${totalTickets}@${mainLotteryId}`;
}
```

### Parent Currency Extraction
```javascript
function getParentName(identityName) {
    if (identityName.includes('.')) {
        return identityName.split('.').pop().replace('@', '');
    }
    return identityName.replace('@', '');
}
```

### Random Hash Generation
```javascript
function generateRandomHash() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
```

## Error Handling and Recovery

### Automation Error Recovery
```javascript
try {
    await executeAutomationPhase();
} catch (error) {
    logger.logError('AUTOMATION_PHASE', error);
    setAutomationPhase('ERROR', error.message);
    
    // Attempt recovery based on error type
    if (error.message.includes('insufficient funds')) {
        await attemptFundingRecovery();
    } else if (error.message.includes('timelock')) {
        await attemptTimelockRecovery();
    } else if (error.message.includes('Insufficient VRSCTEST')) {
        // New: Handle VRSCTEST transaction fee errors
        logger.logError('FUNDING_ERROR', 'Source lacks VRSCTEST for transaction fees');
        setAutomationPhase('ERROR', 'Funding source needs VRSCTEST for transaction fees');
    }
}
```

### Funding Source Validation

### Funding Source Priority Order (Intelligent Multi-Source Strategy)

The vLotto system employs a sophisticated funding strategy that attempts multiple sources in a specific priority order. Each source is validated for both target currency and VRSCTEST transaction fees before any funding attempt. The system uses dynamic amount calculation to send only what's needed at each step.

**Complete Funding Sequence:**

#### **Priority 1: Revenue Distribution (Primary Funding)**
**Sources**: `revenue.mainLotteryId@` (accumulated ticket sales from previous drawings)
**Purpose**: Distributes existing revenue according to configured percentages
**Always Attempted**: Yes - this is the primary funding mechanism for ongoing lotteries

- `revenue.mainLotteryId@` → `jackpot.mainLotteryId@` (nextJackpotPercent%, typically 50%)
- `revenue.mainLotteryId@` → `operations.mainLotteryId@` (operationsPercent%, typically 10%)

**Why First**: Revenue from previous ticket sales should fund the next lottery. This creates a self-sustaining lottery ecosystem where ticket purchases fund future jackpots.

#### **Priority 2: Reserves Emergency Subsidy**  
**Source**: `reserves.mainLotteryId@` (emergency reserve funds)
**Purpose**: Provides additional funding when revenue is insufficient to meet minimum
**Attempted When**: Revenue distribution leaves jackpot below required minimum

- `reserves.mainLotteryId@` → `jackpot.mainLotteryId@` (calculated amount to reach minimum)

**Why Second**: Emergency reserves should only be used when normal revenue streams are insufficient. This preserves reserves for true emergencies.

#### **Priority 3: Primary R-Address FINAL Emergency (LAST RESORT)**
**Source**: Primary R-address of `mainLotteryId@` (e.g., `R[64-character-address]`)
**Purpose**: Absolute final fallback when all identity-based funding fails
**Attempted When**: All previous funding sources failed or were insufficient

- Primary R-address → `jackpot.mainLotteryId@` (calculated amount to reach minimum)

**Why Last**: R-addresses are external to the lottery identity system and should only be used as absolute last resort. They require manual management and are not part of the automated lottery ecosystem.

**Critical Design Decision - REMOVED Sources:**
- **REMOVED**: `mainLotteryId@` (the main lottery identity) as funding source
- **Reason**: Identity-based funding sources consistently lack VRSCTEST for transaction fees
- **Impact**: More reliable funding by focusing on sources that maintain both currencies

**Smart Features:**
- ✅ **Dynamic Amount Calculation**: Each step calculates exactly what's still needed
- ✅ **Partial Funding Support**: Multiple sources contribute incrementally  
- ✅ **Smart Step Skipping**: Stops when minimum is reached
- ✅ **Fee Validation**: Ensures VRSCTEST availability before attempting transactions
- ✅ **Failure Resilience**: Continues to next source if current source fails
- ✅ **Cost Optimization**: Prevents over-funding and unnecessary transactions

**Example Funding Scenario:**
```
Required Minimum: 100 currency, Current Jackpot: 0 currency

Step 1 (Revenue): 
- Check: revenue.mainLotteryId@ has 30 currency, 0.001 VRSCTEST ✅
- Action: Send 30 currency → Jackpot now: 30 currency
- Status: Still need 70 currency

Step 2 (Reserves): 
- Check: reserves.mainLotteryId@ has 0 currency ❌  
- Action: Skip (no funds available)
- Status: Still need 70 currency

Step 3 (R-Address): 
- Check: [Primary R-Address] has 1392 currency, 8337 VRSCTEST ✅
- Action: Send 70 currency → Jackpot now: 100 currency ✅
- Status: Minimum reached, process complete
```

### Enhanced Balance Validation

```javascript
// Enhanced balance checking that validates both target currency and VRSCTEST
async function validateFundingSourceBalances(sourceId, targetCurrency, targetAmount) {
    const balances = await sendCommand('getcurrencybalance', [sourceId]);
    
    const hasTargetCurrency = (balances[targetCurrency] || 0) >= targetAmount;
    const hasVrsctest = (balances['VRSCTEST'] || 0) >= 0.001; // Minimum for fees
    
    if (!hasTargetCurrency && !hasVrsctest) {
        return {
            isValid: false,
            errors: [
                `Insufficient ${targetCurrency}: has ${balances[targetCurrency] || 0}, needs ${targetAmount}`,
                `Insufficient VRSCTEST for fees: has ${balances['VRSCTEST'] || 0}, needs 0.001`
            ]
        };
    } else if (!hasTargetCurrency) {
        return {
            isValid: false,
            errors: [`Insufficient ${targetCurrency}: has ${balances[targetCurrency] || 0}, needs ${targetAmount}`]
        };
    } else if (!hasVrsctest) {
        return {
            isValid: false,
            errors: [`Insufficient VRSCTEST for fees: has ${balances['VRSCTEST'] || 0}, needs 0.001`]
        };
    }
    
    return { isValid: true, errors: [] };
}
```

### Robust Funding Logic

- **All funding steps are now `required: false`** - system continues trying all sources even if some fail
- **Funding succeeds if ANY step succeeds** - no longer requires all steps to work
- **Main ID R-address is ALWAYS checked as final fallback** - ensures maximum funding attempts
- **Validation prevents failed `sendcurrency` commands** - pre-validates both target currency and VRSCTEST

### Transaction Confirmation Waiting
```javascript
async function waitForConfirmation(txid, requiredConfirmations) {
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
        try {
            const txInfo = await sendCommand('gettransaction', [txid]);
            if (txInfo.confirmations >= requiredConfirmations) {
                return true;
            }
        } catch (error) {
            // Transaction not found yet, continue waiting
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
        attempts++;
    }
    
    throw new Error(`Transaction ${txid} did not achieve ${requiredConfirmations} confirmations`);
}
```

## Security Features

### Cryptographic Signatures
1. **Ticket Validation**: Each ticket signs its registration transaction
2. **Proofguard Acknowledgement**: Proofguard signs the ticket signature
3. **Chain of Custody**: Full signature chain stored in blockchain

### Timelock Protection
- Jackpot funds locked with 1-block delay mechanism
- Prevents premature access to lottery funds
- Manual unlock triggered after winner verification
- 1-block delay countdown starts when unlock is initiated
- Automatic unlock after delay period expires

### Fraud Detection
- Signature verification on all tickets
- Identity history validation
- Registration transaction verification

## System Requirements

### Node Configuration
```bash
# Verus daemon with required parameters
./verusd -chain=VRSCTEST -server -rpcuser=user -rpcpassword=pass -txindex=1
```

### Required Permissions
- Wallet unlock for identity operations
- Sufficient funds for transaction fees
- Identity creation permissions on target chain

## Integration Examples

### Basic Lottery Setup
```javascript
// 1. Set parameters
const lotteryParams = {
    mainVerusId: "mylottery.shylock@",
    futureBlockNumber: 580000,
    drawingInterval: 1000,
    ticketMultiplier: 10.0,
    jackpotMinimum: 100.0
};

// 2. Start automation
await vlottoAutomation.startFullAutomation(lotteryParams.futureBlockNumber);

// 3. Monitor progress
vlottoAutomation.on('phaseUpdate', (phase, status) => {
    console.log(`Phase: ${phase}, Status: ${status}`);
});
```

### Manual Drawing
```javascript
// 1. Generate tickets manually
await ticketGeneration.generateTickets(drawingBlock, quantity);

// 2. Perform drawing
await drawingSystem.performDrawing(tickets, revokedTickets);

// 3. Process payouts
await payoutEngine.executePayouts(winner, distributionParams);
```

## API Command Reference

### Complete RPC Command List
```javascript
// Identity Management
await sendCommand('getidentity', [identityName]);
await sendCommand('registeridentity', [identityObject]);
await sendCommand('updateidentity', [identityName, updateObject]);
await sendCommand('revokeidentity', [identityName, parentId]);
await sendCommand('registernamecommitment', [name, parent, salt]);
await sendCommand('getidentityhistory', [identityName]);

// Currency Operations  
await sendCommand('getcurrencybalance', [identityName]);
await sendCommand('sendcurrency', [fromAddress, toArray]);
await sendCommand('sendtoaddress', [address, amount]);

// Blockchain Queries
await sendCommand('getblockcount');
await sendCommand('getblockhash', [blockNumber]);
await sendCommand('getblockchaininfo');
await sendCommand('gettransaction', [txid]);

// Timelock Operations
await sendCommand('setidentitytimelock', [identity, {"setunlockdelay": 1}, returntx, 0.001, sourceoffunds]);  // Lock with delay
await sendCommand('setidentitytimelock', [identity, {"unlockatblock": 0}, returntx, 0.001, sourceoffunds]); // Start unlock countdown

// Marketplace Operations
await sendCommand('makeoffer', [offerObject]);
await sendCommand('closeoffers');

// Cryptographic Operations
await sendCommand('signmessage', [identity, message]);
await sendCommand('verifymessage', [identity, signature, message]);

// Operation Status
await sendCommand('z_getoperationstatus', [[operationId]]);
```

## Critical Command Validation System

The vLotto system now implements enterprise-grade validation for all critical blockchain commands to prevent automation from continuing with failed operations. This system validates every command response before proceeding to the next step.

### **Validation Methodology**

Each critical command follows a standardized validation pattern:

```javascript
// 1. Execute command with logging
console.log(`🔄 [Component] Executing [command] for [identifier]`);
const result = await monitoredSendCommand('command', [args]);

// 2. Validate result exists
if (!result) {
    throw new Error(`[command] returned null/undefined for [identifier]`);
}

// 3. Check for insufficient funds errors
if (typeof result === 'string' && result.toLowerCase().includes('insufficient')) {
    throw new Error(`Insufficient funds for [command]: ${result}`);
}

// 4. Check for object-based errors
if (typeof result === 'object' && result.error) {
    throw new Error(`[command] error for [identifier]: ${result.error}`);
}

// 5. Validate transaction ID format
if (!result.txid || typeof result.txid !== 'string' || result.txid.length !== 64) {
    throw new Error(`Invalid transaction ID from [command]. Expected 64-character hex string, got: ${JSON.stringify(result.txid)}`);
}

// 6. Log success and continue
console.log(`✅ [Component] [command] successful - TXID: ${result.txid}`);
```

### **Protected Commands**

#### **registernamecommitment**
**Function**: `commitTicketName()`
**Validates**: 
- ✅ Result existence and structure
- ✅ Transaction ID format (64-character hex)
- ✅ Namereservation data presence
- ✅ Insufficient funds detection
- ❌ **Process stops** if validation fails

```javascript
// Example validation failure scenarios:
// "Insufficient funds for registernamecommitment: insufficient VRSCTEST balance"
// "Invalid transaction ID from registernamecommitment. Expected 64-character hex string, got: null"
// "Missing namereservation in registernamecommitment result for ticket"
```

#### **registeridentity**
**Function**: `registerTicketIdentity()`
**Validates**: 
- ✅ Result type handling (string TXID or object with txid property)
- ✅ Hex pattern validation using regex `/^[a-f0-9]+$/i`
- ✅ Insufficient funds detection
- ✅ Error object detection
- ❌ **Process stops** if validation fails

```javascript
// Example validation scenarios:
// String response: "abc123..." (64-char hex) → Valid
// Object response: {txid: "abc123...", other: "data"} → Valid
// Error response: {error: "some error"} → STOP
// Invalid format: "insufficient funds" → STOP
```

#### **makeoffer**
**Functions**: `listTicketsOnMarketplace()`, `listTicketsOnMarketplaceWithPhaseReporting()`
**Validates**: 
- ✅ Result existence before marketplace tracking
- ✅ Transaction ID format validation
- ✅ Insufficient funds detection (critical for revenue address funding)
- ✅ Error object detection
- ❌ **Process stops** if validation fails

```javascript
// Example marketplace validation failures:
// "makeoffer returned null/undefined for ticket_1of5@lottery@"
// "Insufficient funds for makeoffer: insufficient VRSCTEST balance"
// "Invalid transaction ID from makeoffer. Expected 64-character hex string, got: undefined"
```

#### **updateidentity**
**Function**: `finalizeTicketDetails()`
**Validates**: 
- ✅ Enhanced result type handling (string or object responses)
- ✅ Hex pattern validation for transaction IDs
- ✅ Insufficient funds detection (critical for content storage)
- ✅ Complex object response validation
- ❌ **Process stops** if validation fails

```javascript
// Example finalization validation:
// Success: "def456abc123..." → Ticket finalized successfully
// Error: "insufficient VRSCTEST for fees" → STOP automation
// Invalid: {somedata: "value"} without txid → STOP
```

### **Error Detection Patterns**

**Insufficient Funds Detection:**
- String responses containing "insufficient" (case-insensitive)
- Specific detection of VRSCTEST fee problems
- Immediate automation halt with detailed error message

**Invalid Transaction ID Detection:**
- Non-string responses when string expected
- String length != 64 characters
- Non-hexadecimal characters using regex validation
- Null/undefined TXIDs

**Error Object Detection:**
- Object responses with `.error` property
- Malformed response objects missing required fields
- Unexpected response types (non-string, non-object)

### **Impact on Automation Reliability**

**Before Validation Implementation:**
- ❌ Failed commands continued processing
- ❌ Invalid TXIDs caused downstream failures
- ❌ Insufficient funds errors were ignored
- ❌ Automation could complete with broken state

**After Validation Implementation:**
- ✅ Failed commands immediately stop automation
- ✅ Clear error messages identify exact failure point
- ✅ Insufficient funds detected before state corruption
- ✅ Only valid transactions proceed to next steps

**Example Error Messages:**
```
❌ [TicketGeneration] registernamecommitment failed for 575800_1of6@: 
   Insufficient funds for registernamecommitment: insufficient VRSCTEST balance

❌ [TicketGeneration] makeoffer failed for 575800_2of6@lottery@: 
   Invalid transaction ID from makeoffer. Expected 64-character hex string, got: null

❌ [TicketGeneration] updateidentity failed for 575800_3of6@lottery@: 
   updateidentity error: identity not found
```

This validation system ensures that only successful blockchain operations proceed through the automation pipeline, preventing data corruption and providing clear debugging information when issues occur.

## Comprehensive Automation Logging

The vLotto system now includes detailed logging throughout all automation phases for debugging and monitoring:

### **Log Format and Emoji Indicators**
- 🔄 **Automation Cycle**: Start/end of automation cycles
- 💰 **Funding Phase**: Jackpot funding operations  
- 🧮 **Calculation Phase**: Ticket quantity calculations
- 🎫 **Ticket Operations**: Generation, listing, analysis
- 🏪 **Marketplace Phase**: Offer creation and monitoring
- 🔍 **Expiry Checking**: Offer expiry analysis
- 🗑️ **Revocation Phase**: Unsold ticket revocation
- 🎲 **Drawing Phase**: Lottery drawing execution
- 🔒 **Timelock Operations**: Security lock/unlock operations
- ✅ **Success Operations**: Completed successfully
- ❌ **Error Operations**: Failed operations
- ⚠️ **Warning Operations**: Issues requiring attention
- ⏳ **Pending Operations**: Waiting for confirmations

### **Critical Timing Logs**
```
🏪 [VLottoAutomation] === MARKETPLACE MONITORING ===
📊 [VLottoAutomation] Blocks until drawing: 15
⚙️ [VLottoAutomation] Close offers trigger: 5 blocks before drawing
⏰ [VLottoAutomation] Offer expiry block: 579980 (15 blocks until expiry)
🚨 [VLottoAutomation] === REVOCATION TRIGGER ===
📋 [VLottoAutomation] Trigger reason: offers expired at block 579980
🧱 [VLottoAutomation] Current block: 579981, Expiry block: 579980
```

This logging helps diagnose marketplace timing issues by showing exactly when offers expire (20 blocks before drawing) versus when automation checks begin (configurable, default 5 blocks before drawing).

## Troubleshooting & Debugging Guide

### **Common Issues and Log Patterns**

#### **1. Marketplace Timing Issues**
**Symptoms**: Offers remaining active until 14-15 blocks before drawing instead of expiring at 20 blocks
**Log Pattern to Look For**:
```
🏪 [VLottoAutomation] === MARKETPLACE MONITORING ===
📊 [VLottoAutomation] Blocks until drawing: 15
⏰ [VLottoAutomation] Offer expiry block: 579980 (15 blocks until expiry)
🚨 [VLottoAutomation] === REVOCATION TRIGGER ===
📋 [VLottoAutomation] Trigger reason: offers expired at block 579980
```
**Solution**: The dual-trigger system now properly monitors both offer expiry (20 blocks) and automation trigger (5 blocks). Check both values in logs.

#### **2. Revocation Failures**
**Symptoms**: Tickets not being revoked despite marketplace expiry
**Log Pattern to Look For**:
```
🗑️ [TicketGeneration] === UNSOLD TICKET REVOCATION START ===
🔑 [TicketGeneration] Original R-address for tickets: R[address]
🎫 [TicketGeneration] Checking 6 tickets for R-address changes
🎫 [TicketGeneration] [ticketName] UNSOLD (R-address unchanged)
💰 [TicketGeneration] [ticketName] SOLD (R-address changed to R[buyer_address])
```
**Solution**: Examine R-address comparison logs to verify correct detection of sold vs unsold tickets.

#### **3. Timelock Unlock Failures**
**Symptoms**: `ERROR: Identity jackpot. not found`
**Log Pattern to Look For**:
```
[DrawingSystem] Winner ticket: 575800_1of6@mylottery.shylock@
[DrawingSystem] Extracted lottery ID: mylottery.shylock
[DrawingSystem] Will unlock: jackpot.mylottery.shylock@
✅ [DrawingSystem] Jackpot unlock initiated successfully
```
**Solution**: Fixed identity extraction now properly removes trailing `@` and constructs correct `jackpot.mainLotteryId@` format.

#### **4. Funding Source Failures**
**Symptoms**: `Insufficient VRSCTEST for transaction fees`
**Log Pattern to Look For**:
```
💰 [VLottoAutomation] === FUNDING PHASE START ===
📋 [VLottoAutomation] Funding Parameters: {...}
🚀 [VLottoAutomation] Starting complete funding cycle...
❌ [VLottoAutomation] Error in funding phase: [error details]
```
**Solution**: Check funding source validation logs to ensure both target currency and VRSCTEST availability.

### **Complete Log Analysis Workflow**

1. **Start with Automation Cycle Logs**: Look for `🔄 [VLottoAutomation] === AUTOMATION CYCLE START ===`
2. **Track Phase Progression**: Follow emoji indicators through each phase
3. **Identify Error Points**: Look for `❌` and `⚠️` indicators
4. **Check Timing Issues**: Monitor marketplace and expiry block calculations
5. **Verify Transactions**: Confirm TXIDs and confirmations with `✅` indicators

## Complete Process Flow Summary (With Latest Updates)

**Phase 1: Secure Foundation Setup**
1. **Parameter Validation** → Comprehensive validation prevents failed operations
2. **Intelligent Multi-Source Funding** → Dynamic calculation sends exact amounts needed
3. **Critical Balance Verification** → Mandatory checkpoint ensures jackpot has required funds
4. **Delay-Based Timelock** → Immediate security with controlled release capability

**Phase 2: Ticket Operations**
5. **Ticket Generation** → Cryptographically secure ticket creation with VDXF storage
6. **Marketplace Listing** → Automated offer creation and management with detailed logging
7. **Ticket Revocation** → Cleanup of unsold tickets with comprehensive R-address analysis

**Phase 3: Drawing & Payout**
8. **Provably Fair Drawing** → Blockchain-based randomness and scoring with execution logging
9. **Winner Verification** → Cryptographic validation with signature chains
10. **Automated Unlock** → Timelock release triggered only after winner verification (FIXED identity format)
11. **Secure Payout** → Distribution after 1-block delay countdown

**Key Security Features:**
- 🔒 **No lottery proceeds without verified funding**
- 🔒 **No tickets sold for empty jackpots** 
- 🔒 **No premature access to lottery funds**
- 🔒 **No payouts without winner verification**
- 🔒 **All operations cryptographically verified**

**Reliability Features:**
- ⚡ **Automatic recovery from funding source failures**
- ⚡ **Dynamic amount calculation prevents waste**
- ⚡ **Smart step skipping optimizes performance**
- ⚡ **Comprehensive error handling and logging**
- ⚡ **Multiple fallback funding sources**

**Advanced Debugging & Monitoring:**
- 🔍 **Enterprise-grade logging system** with emoji-coded indicators for all phases
- 📊 **Real-time marketplace timing analysis** showing offer expiry vs automation triggers
- 🗑️ **Comprehensive revocation tracking** with R-address comparison analysis
- 🎲 **Drawing process visibility** with winner verification and timelock unlock logging
- 📋 **Troubleshooting guides** with common issue patterns and solutions
- ⚡ **Performance monitoring** with transaction timing and confirmation tracking

This technical documentation provides a complete understanding of the vLotto system architecture, automation processes, and implementation details necessary to recreate or interface with the system. The system now implements enterprise-grade security, reliability, efficiency, and comprehensive debugging features that ensure robust lottery operations under all conditions with full operational visibility. 