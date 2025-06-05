# Verus RPC Command: getlocalsolps

## Purpose
The `getlocalsolps` command returns the average local solutions per second since the node was started. This command is useful for monitoring the mining performance of the local node.

## Description
When executed, this command calculates and returns the average number of solutions per second that the local node has achieved since it was started. This provides a measure of the mining performance of the hardware running the node. This is the same information that is shown on the metrics screen, if that feature is enabled.

**Command Type**: Query/Read-only  
**Protocol Level**: Mining  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a numeric value representing the average solutions per second.

**Return Type**: Numeric

## Examples

### Example 1: Get local solutions per second

**Command:**
```
verus getlocalsolps
```

**Sample Output:**
```
123.45678
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getlocalsolps", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 123.45678,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Mining Not Started:**
   ```
   error code: -1
   error message:
   Mining has not started
   ```

2. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

3. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

## Related Commands
- `getnetworksolps`: Returns the estimated network solutions per second
- `getmininginfo`: Returns mining-related information
- `getgenerate`: Return if the server is set to mine and/or mint coins
- `setgenerate`: Set whether mining/staking is enabled and configure processor limits
