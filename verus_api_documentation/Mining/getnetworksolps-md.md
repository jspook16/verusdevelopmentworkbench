# Verus RPC Command: getnetworksolps

## Purpose
The `getnetworksolps` command returns the estimated network solutions per second based on recent blocks. This command is essential for analyzing network mining power and difficulty trends.

## Description
When executed, this command calculates an estimate of the network's hashing power (solutions per second) based on the difficulty and time taken to mine a specified number of blocks. This provides insight into the overall mining capacity of the network, which is useful for miners to gauge competition and for analysts to understand network security.

**Command Type**: Query/Read-only  
**Protocol Level**: Mining/Network  
**Access Requirement**: No special requirements

## Arguments
The command accepts two optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blocks | numeric | No | 120 | The number of blocks to analyze, or -1 for blocks over difficulty averaging window |
| height | numeric | No | -1 | The height at which to estimate the network speed (-1 for current height) |

## Results
The command returns a numeric value representing the estimated solutions per second achieved by the network.

**Return Type**: Numeric

## Examples

### Example 1: Get network solution rate with default parameters

**Command:**
```
verus getnetworksolps
```

**Sample Output:**
```
15000000
```

### Example 2: Get network solution rate over 200 blocks

**Command:**
```
verus getnetworksolps 200
```

**Sample Output:**
```
14500000
```

### Example 3: Get historical network solution rate at height 1000000

**Command:**
```
verus getnetworksolps 120 1000000
```

**Sample Output:**
```
7500000
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnetworksolps", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 15000000,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Block Count:**
   ```
   error code: -8
   error message:
   Block count must be greater than 0 or -1
   ```

2. **Potential Error - Invalid Height:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getnetworkhashps`: Deprecated version of this command (maintained for backward compatibility)
- `getlocalsolps`: Returns the average local solutions per second
- `getmininginfo`: Returns mining-related information
- `getdifficulty`: Returns the proof-of-work difficulty as a multiple of the minimum difficulty
