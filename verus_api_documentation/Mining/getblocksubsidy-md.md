# Verus RPC Command: getblocksubsidy

## Purpose
The `getblocksubsidy` command returns the block subsidy reward for a specific block height, taking into account the mining slow start and the founders reward. This command is useful for understanding the reward structure of the blockchain at different heights.

## Description
When provided with a block height, this command calculates and returns the mining reward amount for that specific block. The calculation factors in protocol-specific parameters such as the mining slow start period and any founders reward allocations. This information is valuable for miners and analysts who need to understand block reward economics.

**Command Type**: Query/Read-only  
**Protocol Level**: Mining/Rewards  
**Access Requirement**: No special requirements

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | numeric | No | Current chain height | The block height for which to calculate the subsidy |

## Results
The command returns a JSON object containing the mining reward:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| miner | numeric | The mining reward amount in the blockchain's native currency |

## Examples

### Example 1: Get block subsidy for a specific height

**Command:**
```
verus getblocksubsidy 1000
```

**Sample Output:**
```json
{
  "miner": 3.0
}
```

### Example 2: Get block subsidy for the current height

**Command:**
```
verus getblocksubsidy
```

**Sample Output:**
```json
{
  "miner": 0.5
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblocksubsidy", "params": [1000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "miner": 3.0
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Height:**
   ```
   error code: -8
   error message:
   Invalid height
   ```

2. **Potential Error - Negative Height:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

3. **Potential Error - Height Too Large:**
   ```
   error code: -8
   error message:
   Block height too large
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getblocktemplate`: Gets data needed to construct a block to work on
- `getmininginfo`: Returns mining-related information
- `getdifficulty`: Returns the proof-of-work difficulty as a multiple of the minimum difficulty
- `getnetworksolps`: Returns the estimated network solutions per second
