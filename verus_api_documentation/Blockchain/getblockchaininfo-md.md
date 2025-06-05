# Verus RPC Command: getblockchaininfo

## Purpose
The `getblockchaininfo` command returns comprehensive information about the current state of the blockchain, including network type, synchronization progress, difficulty, and details about network upgrades and consensus rules. This command is valuable for monitoring the blockchain status and for diagnostic purposes.

## Description
When executed, this command provides a detailed overview of the blockchain's current state, including information about the network type, blockchain identity, block counts, validation progress, and the status of softforks and network upgrades. This is particularly useful for developers, node operators, and applications that need to monitor the blockchain's state.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing various state information regarding blockchain processing:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| chain | string | Current network type (main, test, regtest) |
| name | string | Current network name of blockchain ID (VRSC, VRSCTEST, PBAASNAME) |
| chainid | string | Blockchain ID (i-address of the native blockchain currency) |
| blocks | numeric | The current number of blocks processed in the server |
| headers | numeric | The current number of headers validated |
| bestblockhash | string | The hash of the currently best block |
| difficulty | numeric | The current difficulty |
| verificationprogress | numeric | Estimate of verification progress [0..1] |
| chainwork | string | Total amount of work in active chain, in hexadecimal |
| size_on_disk | numeric | The estimated size of the block and undo files on disk |
| commitments | numeric | The current number of note commitments in the commitment tree |
| softforks | array | Status of softforks in progress |
| upgrades | object | Status of network upgrades |
| consensus | object | Branch IDs of the current and upcoming consensus rules |

The `softforks` array contains objects with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Name of softfork |
| version | numeric | Block version |
| enforce | object | Progress toward enforcing the softfork rules for new-version blocks |
| reject | object | Progress toward rejecting pre-softfork blocks |

The `enforce` and `reject` objects contain:

| Field | Type | Description |
|-------|------|-------------|
| status | boolean | True if threshold reached |
| found | numeric | Number of blocks with the new version found |
| required | numeric | Number of blocks required to trigger |
| window | numeric | Maximum size of examined window of recent blocks |

The `upgrades` object contains upgrade details with branch IDs as keys:

| Field | Type | Description |
|-------|------|-------------|
| name | string | Name of upgrade |
| activationheight | numeric | Block height of activation |
| status | string | Status of upgrade |
| info | string | Additional information about upgrade |

The `consensus` object contains:

| Field | Type | Description |
|-------|------|-------------|
| chaintip | string | Branch ID used to validate the current chain tip |
| nextblock | string | Branch ID that the next block will be validated under |

## Examples

### Example 1: Get blockchain information

**Command:**
```
verus getblockchaininfo
```

**Sample Output:**
```json
{
  "chain": "main",
  "name": "VRSC",
  "chainid": "iCu9H5RrpGpHMkMgyRbe1Yme11QXbQyLsd",
  "blocks": 1234567,
  "headers": 1234567,
  "bestblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "difficulty": 123456.789,
  "verificationprogress": 0.99999,
  "chainwork": "000000000000000000000000000000000000000000000000123456789abcdef0",
  "size_on_disk": 54321987654,
  "commitments": 9876543,
  "softforks": [
    {
      "id": "bip34",
      "version": 2,
      "enforce": {
        "status": true,
        "found": 1000,
        "required": 750,
        "window": 1000
      },
      "reject": {
        "status": true,
        "found": 1000,
        "required": 950,
        "window": 1000
      }
    }
  ],
  "upgrades": {
    "e9ff75a6": {
      "name": "Canopy",
      "activationheight": 1000000,
      "status": "active",
      "info": "See https://z.cash/upgrade/canopy/ for details."
    }
  },
  "consensus": {
    "chaintip": "2bb40e60",
    "nextblock": "2bb40e60"
  }
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "chain": "main",
    "name": "VRSC",
    ... (other fields as in Example 1)
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
- `getblockcount`: Returns the number of blocks in the best valid block chain
- `getbestblockhash`: Returns the hash of the best (tip) block in the longest blockchain
- `getdifficulty`: Returns the proof-of-work difficulty as a multiple of the minimum difficulty
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
