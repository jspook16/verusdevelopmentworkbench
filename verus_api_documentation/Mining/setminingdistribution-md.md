# Verus RPC Command: setminingdistribution

## Purpose
The `setminingdistribution` command sets multiple mining outputs with specified relative values that will be used to calculate outputs to each address for any mining or staking reward. This command enables distribution of mining rewards to multiple addresses in specified proportions.

## Description
When executed with the appropriate parameters, this command configures how mining rewards are distributed. It accepts a JSON object containing destination addresses as keys and their relative values as numeric values. These values determine the proportional distribution of mining rewards to each address. This is useful for mining pools, cooperative mining arrangements, or when a miner wants to split rewards across multiple wallets.

**Command Type**: Action/Write  
**Protocol Level**: Mining  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| jsonminingdistribution | object | Yes | N/A | JSON object mapping destination addresses to relative values |

The `jsonminingdistribution` object contains:
- Keys: Unique destination addresses (must be valid)
- Values: Relative numeric values for distribution (proportional allocation)

## Results
The command returns NULL for success, or an exception if there was an error.

**Return Type**: NULL or Exception

## Examples

### Example 1: Set an equal mining distribution between two addresses

**Command:**
```
verus setminingdistribution {"RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87":0.5, "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b":0.5}
```

**Sample Output:**
```
null
```

### Example 2: Set a weighted mining distribution to three addresses

**Command:**
```
verus setminingdistribution {"RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87":0.6, "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b":0.3, "R9wprka91hbVWjnkzHYXtGPBpp7DHwznRk":0.1}
```

**Sample Output:**
```
null
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setminingdistribution", "params": [{"RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87":0.5, "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b":0.5}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

1. **Potential Error - Invalid JSON Format:**
   ```
   error code: -8
   error message:
   Invalid mining distribution format
   ```

2. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid destination address
   ```

3. **Potential Error - Invalid Value:**
   ```
   error code: -8
   error message:
   Invalid value for distribution
   ```

4. **Potential Error - Values Don't Sum to 1:**
   ```
   error code: -8
   error message:
   Distribution values must sum to 1.0
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getminingdistribution`: Retrieves current mining distribution
- `getblocktemplate`: Gets data needed to construct a block to work on
- `getmininginfo`: Returns mining-related information
- `setgenerate`: Set whether mining/staking is enabled and configure processor limits
