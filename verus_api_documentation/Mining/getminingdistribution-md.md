# Verus RPC Command: getminingdistribution

## Purpose
The `getminingdistribution` command retrieves the current mining distribution settings. This command is useful for checking how mining rewards are distributed among different addresses.

## Description
When executed, this command returns the current mining distribution configuration, which determines how mining rewards are allocated to different addresses. If no distribution has been set, it returns a null object. This distribution is used to calculate the relative outputs to each address for any reward when mining.

**Command Type**: Query/Read-only  
**Protocol Level**: Mining  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns one of the following:

**Return Type**: Null or Object

- If no mining distribution is set: Returns null
- If a mining distribution is set: Returns an object with destination addresses as keys and their relative values as numeric values

## Examples

### Example 1: Get current mining distribution

**Command:**
```
verus getminingdistribution
```

**Sample Output (if set):**
```json
{
  "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87": 0.7,
  "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b": 0.3
}
```

**Sample Output (if not set):**
```
null
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getminingdistribution", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format (if set):**
```json
{
  "result": {
    "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87": 0.7,
    "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b": 0.3
  },
  "error": null,
  "id": "curltest"
}
```

**Expected Format (if not set):**
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

2. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

## Related Commands
- `setminingdistribution`: Sets multiple mining outputs with amounts
- `getblocktemplate`: Gets data needed to construct a block to work on
- `getmininginfo`: Returns mining-related information
- `setgenerate`: Set whether mining/staking is enabled and configure processor limits
