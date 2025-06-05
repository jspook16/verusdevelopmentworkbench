# Verus RPC Command: clearrawmempool

## Purpose
The `clearrawmempool` command clears all transactions from the memory pool (mempool) of the current node. This command is useful for maintenance operations or troubleshooting when you need to reset the node's pending transaction queue.

## Description
When executed, this command removes all pending transactions that are currently waiting in the node's memory pool to be included in a block. This can be helpful in scenarios where problematic or stuck transactions need to be cleared, or when testing transaction behavior.

**Command Type**: Action/Write  
**Protocol Level**: Network  
**Access Requirement**: Requires wallet access

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns no specific result on success. A successful execution is indicated by the absence of an error response.

**Return Type**: None (on success)

## Examples

### Example 1: Clear the mempool

**Command:**
```
verus clearrawmempool
```

**Output:**
No output on success.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "clearrawmempool", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": null,
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

2. **Potential Error - Node Syncing:**
   ```
   error code: -10
   error message:
   Cannot clear mempool while node is still syncing
   ```

3. **Potential Error - Access Denied:**
   ```
   error code: -8
   error message:
   Insufficient permissions to execute this command
   ```

## Related Commands
- `getrawmempool`: Returns all transaction IDs in memory pool
- `getmempoolinfo`: Returns details on the active state of the TX memory pool
