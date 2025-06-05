# Verus RPC Command: stop

## Purpose
The `stop` command safely shuts down the Verus server (daemon). This command is essential for properly terminating the Verus node to prevent potential data corruption or other issues that might arise from an improper shutdown.

## Description
When executed, this command initiates a graceful shutdown of the Verus daemon. It allows the daemon to complete any pending operations, save its state, and properly close connections before terminating. This is the recommended way to stop the Verus node rather than forcefully terminating the process.

**Command Type**: Action/Write  
**Protocol Level**: Control  
**Access Requirement**: May require admin privileges depending on configuration

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command doesn't provide a structured result. Upon successful execution, the server begins shutting down, which may terminate the connection before a formal response is returned.

**Return Type**: None or simple acknowledgment message

## Examples

### Example 1: Stop the Verus server

**Command:**
```
verus stop
```

**Sample Output:**
```
Verus server stopping
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "stop", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "Verus server stopping",
  "error": null,
  "id": "curltest"
}
```
Note: The full response might not be received as the server could terminate the connection during shutdown.

## Potential Error Cases

1. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

2. **Potential Error - Insufficient Privileges:**
   ```
   error code: -1
   error message:
   Insufficient privileges to stop server
   ```

3. **Potential Error - Server Already Stopping:**
   ```
   error code: -1
   error message:
   Server is already in the process of shutting down
   ```

## Related Commands
- `getinfo`: Returns an object containing various state info before shutting down
- `getmempoolinfo`: Can be used to check for pending transactions before shutdown
- `getblockchaininfo`: Provides blockchain state information which might be useful to check before shutdown
