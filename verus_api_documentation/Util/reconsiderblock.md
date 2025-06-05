# Verus RPC Command: reconsiderblock

## Purpose
The `reconsiderblock` command is designed to remove the invalidity status of a previously invalidated block and its descendants, allowing them to be reconsidered for activation in the blockchain. This command serves as the counterpart to `invalidateblock` and is essential for network administrators and developers when resolving temporary chain forks, testing consensus rules, or recovering from erroneous block invalidations.

## Description
The `reconsiderblock` command reverses the effects of the `invalidateblock` command, removing the manually-applied invalid status from a specified block and all its descendants. This allows the node to reconsider these blocks based on normal consensus rules, potentially leading to a chain reorganization if the reconsidered blocks form a chain with more work than the current active chain. This command is particularly useful for resolving temporary network splits, testing fork scenarios, or correcting administrative actions.

**Command Type**: Administrative/Write  
**Protocol Level**: Consensus Layer  
**Access Requirement**: Administrative access (typically restricted)

## Arguments
The command accepts a single parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hash` | string | Yes | The hash of the block to be reconsidered |

## Results
The command does not return a specific value on success, but rather executes the reconsideration operation silently. A successful execution results in:

1. The specified block and all its descendants having their manual invalidity status removed
2. The node applying normal consensus rules to determine if the blocks should be activated
3. Potential chain reorganization if the reconsidered blocks form a chain with more work than the current active chain

If an error occurs, an appropriate error message is returned.

## Examples

### Example 1: Reconsider a Previously Invalidated Block

**Command:**
```
verus reconsiderblock "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
```

This example demonstrates how to reconsider a specific block that was previously invalidated, allowing it and its descendants to be reevaluated according to normal consensus rules.

### Example 2: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "reconsiderblock", "params": ["000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

3. **Potential Error - Block Not Invalidated:**
   ```
   error code: -1
   error message:
   Block is not manually invalidated
   ```

4. **Potential Error - Insufficient Permissions:**
   ```
   error code: -1
   error message:
   Insufficient permissions to reconsider blocks
   ```

## Important Notes
- This command only affects blocks that were previously invalidated using the `invalidateblock` command
- Reconsidering a block does not guarantee it will become part of the active chain; normal consensus rules still apply
- Chain reorganization may occur if the reconsidered blocks form a chain with more work than the current best chain
- In a network with multiple nodes, other nodes may still consider the blocks invalid unless the `reconsiderblock` command is applied on each node individually
- This command should generally only be used by advanced users with a thorough understanding of blockchain operation
- The effects of this command persist until the node is restarted or the blocks are manually invalidated again
