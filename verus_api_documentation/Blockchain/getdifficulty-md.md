# Verus RPC Command: getdifficulty

## Purpose
The `getdifficulty` command returns the proof-of-work difficulty as a multiple of the minimum difficulty. This command is useful for monitoring mining difficulty and network security.

## Description
When executed, this command provides a numeric value representing the current mining difficulty of the blockchain. The value returned is a multiple of the minimum difficulty (the difficulty of the easiest possible block), making it a relative measure of how difficult it is to find a new block compared to the easiest it could be.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/Mining  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a numeric value representing the current proof-of-work difficulty as a multiple of the minimum difficulty.

**Return Type**: Numeric

## Examples

### Example 1: Get the current mining difficulty

**Command:**
```
verus getdifficulty
```

**Sample Output:**
```
123456.789
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getdifficulty", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 123456.789,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

2. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

3. **Potential Error - Connection Issue:**
   ```
   error code: -9
   error message:
   Cannot connect to Verus daemon
   ```

## Related Commands
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getmininginfo`: Returns mining-related information
- `getnetworkhashps`: Returns the estimated network hashes per second
- `getblock`: Returns detailed information about a block (includes difficulty)
