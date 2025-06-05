# Verus RPC Command: getmempoolinfo

## Purpose
The `getmempoolinfo` command returns detailed information about the active state of the transaction memory pool. This command is useful for monitoring pending transactions and understanding the current load on the network.

## Description
When executed, this command provides statistics about the node's memory pool, which is where unconfirmed transactions are stored before being included in a block. The information returned includes the current number of transactions, total size in bytes, and memory usage, which can help in diagnosing transaction propagation issues or understanding network congestion.

**Command Type**: Query/Read-only  
**Protocol Level**: Network/Mempool  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing the following information about the memory pool:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| size | numeric | Current number of transactions in the memory pool |
| bytes | numeric | Sum of all transaction sizes in bytes |
| usage | numeric | Total memory usage for the mempool in bytes |

## Examples

### Example 1: Get memory pool information

**Command:**
```
verus getmempoolinfo
```

**Sample Output:**
```json
{
  "size": 125,
  "bytes": 42500,
  "usage": 180000
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmempoolinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "size": 125,
    "bytes": 42500,
    "usage": 180000
  },
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
- `getrawmempool`: Returns all transaction IDs in memory pool
- `clearrawmempool`: Clears the mempool of all transactions
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
- `getblockchaininfo`: Returns various state info regarding blockchain processing
