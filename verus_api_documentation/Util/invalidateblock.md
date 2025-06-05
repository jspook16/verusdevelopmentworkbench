# Verus RPC Command: invalidateblock

## Purpose
The `invalidateblock` command is designed to permanently mark a specific block as invalid, effectively treating it as if it had violated a consensus rule. This command is particularly valuable for network administrators and developers when troubleshooting blockchain anomalies, managing chain reorganizations, or mitigating the effects of consensus-breaking blocks during network upgrades or fork events.

## Description
The `invalidateblock` command forces the node to treat the specified block (and all its descendants) as invalid, regardless of whether it actually violates consensus rules. This is a powerful administrative tool that can alter the node's view of the blockchain by rejecting otherwise valid blocks. When a block is invalidated, all transactions in that block and subsequent blocks are removed from the active chain and returned to the mempool if they remain valid. This command should be used with extreme caution as it can cause the node to diverge from the network consensus.

**Command Type**: Administrative/Write  
**Protocol Level**: Consensus Layer  
**Access Requirement**: Administrative access (typically restricted)

## Arguments
The command accepts a single parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hash` | string | Yes | The hash of the block to be marked as invalid |

## Results
The command does not return a specific value on success, but rather executes the invalidation operation silently. A successful execution results in:

1. The specified block and all its descendants being marked as invalid in the local node's database
2. The node reorganizing to the chain excluding these blocks
3. Valid transactions from invalidated blocks being returned to the mempool

If an error occurs, an appropriate error message is returned.

## Examples

### Example 1: Invalidate a Block by Hash

**Command:**
```
verus invalidateblock "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
```

This example demonstrates how to invalidate a specific block using its hash. After execution, the node will treat this block and all subsequent blocks as invalid, reorganizing to the longest valid chain that does not include the invalidated block.

### Example 2: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "invalidateblock", "params": ["000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format of Response on Success:**
```json
{
  "result": null,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Block Not Found:**
   ```
   error code: -5
   error message:
   Block not found
   ```

2. **Potential Error - Invalid Block Hash Format:**
   ```
   error code: -8
   error message:
   blockhash must be of length 64 (not X characters)
   ```

3. **Potential Error - Genesis Block Invalidation Attempt:**
   ```
   error code: -8
   error message:
   Cannot invalidate the genesis block
   ```

4. **Potential Error - Insufficient Permissions:**
   ```
   error code: -1
   error message:
   Insufficient permissions to invalidate blocks
   ```

5. **Potential Error - Active Best Chain:**
   ```
   error code: -1
   error message:
   Cannot invalidate the active best chain tip
   ```

## Important Notes
- This command should be used with extreme caution, as it can cause your node to fork from the network
- The effects persist until you either restart the node or use the `reconsiderblock` command
- Invalidating recent blocks can result in transaction reprocessing and potential double-spend risks
- In a production environment, this command should generally only be used by advanced users with a thorough understanding of blockchain operation
