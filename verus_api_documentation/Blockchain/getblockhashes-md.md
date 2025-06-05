# Verus RPC Command: getblockhashes

## Purpose
The `getblockhashes` command returns an array of hashes for blocks within a specified timestamp range. This command is valuable for blockchain analysis, allowing users to retrieve blocks that were created within a specific time period.

## Description
When provided with a high (newer) and low (older) timestamp, this command returns an array of block hashes for all blocks that fall within that timestamp range. It can be configured to include only blocks on the main chain and to include logical timestamps alongside the hashes.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts three arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| high | numeric | Yes | N/A | The newer block timestamp (in Unix time) |
| low | numeric | Yes | N/A | The older block timestamp (in Unix time) |
| options | object | No | {} | JSON object with additional options |

The `options` object can contain the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| noOrphans | boolean | false | If true, will only include blocks on the main chain |
| logicalTimes | boolean | false | If true, will include logical timestamps with hashes |

## Results
Depending on the options provided, the command returns one of two formats:

1. If `logicalTimes` is false or not specified:
   - An array of strings, each representing a block hash

2. If `logicalTimes` is true:
   - An array of objects, each containing:
     - `blockhash`: The block hash
     - `logicalts`: The logical timestamp

**Return Type**: Array of strings or Array of objects

## Examples

### Example 1: Get block hashes within a timestamp range

**Command:**
```
verus getblockhashes 1231614698 1231024505
```

**Sample Output:**
```json
[
  "00000000d91bdbb5394bbd4a89d9291a9b41c2c8788e27507ca68296cb5d1ea8",
  "000000006f016342d1275be946166cff975c8b27542de70a7113ac6d1ef3294f",
  ... (more hashes)
]
```

### Example 2: Get block hashes with logical timestamps and include orphans

**Command:**
```
verus getblockhashes 1231614698 1231024505 '{"noOrphans":false, "logicalTimes":true}'
```

**Sample Output:**
```json
[
  {
    "blockhash": "00000000d91bdbb5394bbd4a89d9291a9b41c2c8788e27507ca68296cb5d1ea8",
    "logicalts": 1231442072
  },
  {
    "blockhash": "000000006f016342d1275be946166cff975c8b27542de70a7113ac6d1ef3294f",
    "logicalts": 1231381725
  },
  ... (more hash and timestamp pairs)
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockhashes", "params": [1231614698, 1231024505] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    "00000000d91bdbb5394bbd4a89d9291a9b41c2c8788e27507ca68296cb5d1ea8",
    ... (more hashes)
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Timestamp Range:**
   ```
   error code: -8
   error message:
   High timestamp is less than or equal to low timestamp
   ```

2. **Potential Error - Non-Numeric Timestamp:**
   ```
   error code: -8
   error message:
   Expected numeric timestamps
   ```

3. **Potential Error - Invalid Options Format:**
   ```
   error code: -8
   error message:
   Options must be a JSON object
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getblockhash`: Returns hash of block at specified height in the blockchain
- `getblock`: Returns detailed information about a block
- `getblockheader`: Returns information about the block header
- `getchaintips`: Return information about all known tips in the block tree
