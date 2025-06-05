# Verus RPC Command: getblockhash

## Purpose
The `getblockhash` command returns the hash of a block at the specified height in the best blockchain. This command is essential for retrieving block identifiers when you know the block height but need the corresponding hash for further operations.

## Description
When provided with a block index (height), this command returns the hash of the block at that position in the best blockchain. The block hash is a unique identifier for each block and can be used with other commands like `getblock` to retrieve detailed block information.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| index | numeric | Yes | N/A | The block index (height) in the best blockchain |

## Results
The command returns a string representing the hash of the block at the specified height.

**Return Type**: String

## Examples

### Example 1: Get the hash of block at height 1000

**Command:**
```
verus getblockhash 1000
```

**Sample Output:**
```
00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhash", "params": [1000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Block Height Out of Range:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

2. **Potential Error - Non-Numeric Parameter:**
   ```
   error code: -8
   error message:
   Expected numeric block index
   ```

3. **Potential Error - Negative Block Height:**
   ```
   error code: -8
   error message:
   Block height cannot be negative
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getbestblockhash`: Returns the hash of the best (tip) block in the longest blockchain
- `getblock`: Returns detailed information about a block
- `getblockcount`: Returns the number of blocks in the best valid block chain
- `getblockheader`: Returns information about the block header
