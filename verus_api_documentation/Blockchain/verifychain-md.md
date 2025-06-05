# Verus RPC Command: verifychain

## Purpose
The `verifychain` command verifies the blockchain database's integrity. This command is useful for validating the blockchain's consistency and detecting potential corruption or anomalies in the blockchain data.

## Description
When executed, this command performs a verification of the blockchain database according to the specified check level. The verification can be limited to a specific number of blocks or can check the entire blockchain. This is a valuable tool for node operators to ensure the integrity of their blockchain data.

**Command Type**: Action/Read-intensive  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts two optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| checklevel | numeric | No | 3 | How thorough the block verification is (0-4) |
| numblocks | numeric | No | 288 | The number of blocks to check (0=all) |

The `checklevel` parameter determines the depth of verification:
- Level 0: Read from disk
- Level 1: Verify block validity
- Level 2: Verify undo validity
- Level 3: Check disconnection of tip blocks
- Level 4: Run memory-intensive tests

## Results
The command returns a boolean value indicating whether the blockchain passed verification.

**Return Type**: Boolean

- `true`: The blockchain passed verification
- `false`: The blockchain failed verification

## Examples

### Example 1: Verify blockchain with default parameters

**Command:**
```
verus verifychain
```

**Sample Output:**
```
true
```

### Example 2: Verify blockchain with custom parameters

**Command:**
```
verus verifychain 4 1000
```

**Sample Output:**
```
true
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifychain", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": true,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Check Level:**
   ```
   error code: -8
   error message:
   Invalid check level (must be between 0 and 4)
   ```

2. **Potential Error - Invalid Number of Blocks:**
   ```
   error code: -8
   error message:
   Invalid number of blocks (must be 0 or a positive integer)
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

4. **Potential Error - Blockchain Access:**
   ```
   error code: -1
   error message:
   Error accessing blockchain database
   ```

## Related Commands
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getblock`: Returns detailed information about a block
- `gettxout`: Returns details about an unspent transaction output
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
