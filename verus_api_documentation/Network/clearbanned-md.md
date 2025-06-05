# Verus RPC Command: clearbanned

## Purpose
The `clearbanned` command clears all banned IP addresses from the node's ban list. This command is useful for resetting connection restrictions when you want to allow previously banned peers to connect again.

## Description
When executed, this command removes all IP addresses and subnets from the node's ban list, effectively allowing any previously banned peers to attempt connections again. This is particularly useful after network issues have been resolved or when reconfiguring network connectivity.

**Command Type**: Action/Network  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command does not provide a structured result. It returns nothing on success, or an error message if the operation fails.

**Return Type**: None or Error

## Examples

### Example 1: Clear all banned IPs

**Command:**
```
verus clearbanned
```

**Sample Output:**
```
null
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "clearbanned", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
- `setban`: Attempts to add or remove an IP/subnet from the banned list
- `listbanned`: Lists all banned IPs/subnets
- `getpeerinfo`: Returns data about each connected network node
- `disconnectnode`: Immediately disconnects from the specified node
