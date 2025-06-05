# Verus RPC Command: closeoffers

## Purpose
The `closeoffers` command closes specified offers that belong to the wallet, as well as any expired offers. This command allows users to manage and remove their open offers from the blockchain.

## Description
When executed, this command closes (cancels) offers that are listed by transaction ID, provided they still belong to the wallet and are valid. If no specific offers are listed, the command will still close all expired offers in the wallet. The funds from closed offers are returned to a specified destination address.

**Command Type**: Action/Write  
**Protocol Level**: DeFi/Offers  
**Access Requirement**: Wallet with offers

## Arguments
The command accepts three optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| ["offer1_txid", "offer2_txid", ...] | array | No | N/A | Array of hex transaction IDs of offers to close |
| transparentorprivatefundsdestination | string | No | N/A | Transparent or private address as destination for closing funds |
| privatefundsdestination | string | No | N/A | Private address as destination for native funds only |

## Results
The command does not return structured data on success, typically returning null.

**Return Type**: null

## Examples

### Example 1: Close specific offers

**Command:**
```
verus closeoffers '["a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"]'
```

**Sample Output:**
```
null
```

### Example 2: Close offers and specify destination addresses

**Command:**
```
verus closeoffers '["a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"]' "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87" "zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9slya"
```

**Sample Output:**
```
null
```

### Example 3: Close all expired offers

**Command:**
```
verus closeoffers
```

**Sample Output:**
```
null
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction ID Format:**
   ```
   error code: -8
   error message:
   Invalid txid format
   ```

2. **Potential Error - Offer Not Found:**
   ```
   error code: -5
   error message:
   One or more specified offers not found
   ```

3. **Potential Error - Invalid Destination Address:**
   ```
   error code: -5
   error message:
   Invalid destination address
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Wallet is locked, unable to create transaction!
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getoffers`: Returns all open offers for a specific currency or ID
- `listopenoffers`: Shows offers outstanding in the wallet
- `makeoffer`: Creates a new offer for decentralized asset swapping
- `takeoffer`: Accepts an existing offer on the blockchain
