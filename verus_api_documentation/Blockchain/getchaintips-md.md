# Verus RPC Command: getchaintips

## Purpose
The `getchaintips` command returns information about all known tips in the block tree, including the main chain as well as orphaned branches. This command is valuable for blockchain analysis, debugging synchronization issues, and understanding the current state of the blockchain network.

## Description
When executed, this command provides detailed information about all chain tips known to the node. A chain tip is the end of a chain branch - this can be the main active chain or alternate (orphaned) chains. For each tip, it returns information such as height, hash, branch length, and status, allowing users to understand the structure of the blockchain tree.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns an array of objects, each representing a chain tip with the following fields:

**Return Type**: Array of Objects

| Field | Type | Description |
|-------|------|-------------|
| height | numeric | Height of the chain tip |
| hash | string | Block hash of the tip |
| branchlen | numeric | Zero for main chain, otherwise length of branch connecting the tip to the main chain |
| status | string | Status of the chain (active, valid-fork, valid-headers, headers-only, invalid) |

Possible values for status:
1. `invalid` - This branch contains at least one invalid block
2. `headers-only` - Not all blocks for this branch are available, but the headers are valid
3. `valid-headers` - All blocks are available for this branch, but they were never fully validated
4. `valid-fork` - This branch is not part of the active chain, but is fully validated
5. `active` - This is the tip of the active main chain, which is certainly valid

## Examples

### Example 1: Get information about all chain tips

**Command:**
```
verus getchaintips
```

**Sample Output:**
```json
[
  {
    "height": 1234567,
    "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    "branchlen": 0,
    "status": "active"
  },
  {
    "height": 1234000,
    "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34",
    "branchlen": 5,
    "status": "valid-fork"
  },
  {
    "height": 1230000,
    "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef56",
    "branchlen": 10,
    "status": "headers-only"
  }
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getchaintips", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "height": 1234567,
      "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      "branchlen": 0,
      "status": "active"
    },
    ... (other tips as in Example 1)
  ],
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
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getblock`: Returns detailed information about a block
- `getblockcount`: Returns the number of blocks in the best valid block chain
