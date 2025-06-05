# Verus RPC Command: getblockcount

## Purpose
The `getblockcount` command returns the current number of blocks in the best valid block chain. This command is essential for determining the current blockchain height and monitoring synchronization progress.

## Description
When executed, this command provides the total number of blocks that exist in the blockchain that the node considers to be valid. This value represents the current blockchain height and is a key indicator for determining whether a node is fully synchronized with the network.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a numeric value representing the current block count.

**Return Type**: Numeric

## Examples

### Example 1: Get the current block count

**Command:**
```
verus getblockcount
```

**Sample Output:**
```
1234567
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockcount", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 1234567,
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
- `getbestblockhash`: Returns the hash of the best (tip) block in the longest blockchain
- `getblock`: Returns detailed information about a block
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
