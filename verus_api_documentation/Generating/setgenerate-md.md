# Verus RPC Command: setgenerate

## Purpose
The `setgenerate` command configures whether mining (generation) and/or staking (minting) is enabled on the node, and sets processor limits for mining operations. This command is essential for controlling how the node participates in blockchain consensus.

## Description
When executed, this command allows you to turn mining and/or staking on or off. When mining is enabled, you can specify how many processors the node should use for mining operations. Setting the processor limit to 0 while enabling generation turns on staking only, while setting it to -1 allows unlimited processor usage for mining.

**Command Type**: Action/Write  
**Protocol Level**: Mining/Staking  
**Access Requirement**: No special requirements

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| generate | boolean | Yes | N/A | Set to true to turn on generation (mining/staking), false to turn off |
| genproclimit | numeric | No | 1 | Set processor limit when generation is on (-1 for unlimited, 0 to turn on staking only) |

## Results
The command does not provide a structured result. Typically, it returns nothing if successful, or an error message if there was an issue.

**Return Type**: None or Error

## Examples

### Example 1: Turn on mining with one processor

**Command:**
```
verus setgenerate true 1
```

**Sample Output:**
```
null
```

### Example 2: Turn on staking only

**Command:**
```
verus setgenerate true 0
```

**Sample Output:**
```
null
```

### Example 3: Turn off both mining and staking

**Command:**
```
verus setgenerate false
```

**Sample Output:**
```
null
```

### Example 4: Turn on mining with unlimited processors

**Command:**
```
verus setgenerate true -1
```

**Sample Output:**
```
null
```

### Example 5: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setgenerate", "params": [true, 1] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

1. **Potential Error - Missing Required Parameter:**
   ```
   error code: -1
   error message:
   setgenerate requires at least one parameter
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -1
   error message:
   First parameter must be a boolean
   ```

3. **Potential Error - Invalid Processor Limit:**
   ```
   error code: -1
   error message:
   Second parameter must be numeric
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Wallet is locked, unable to create stake transaction!
   ```

## Related Commands
- `getgenerate`: Return if the server is set to mine and/or mint coins
- `getmininginfo`: Returns mining-related information
- `getnetworkhashps`: Returns the estimated network hashes per second
- `getbalance`: Check available balance for staking
- `encryptwallet`: Encrypt wallet to secure staking funds
