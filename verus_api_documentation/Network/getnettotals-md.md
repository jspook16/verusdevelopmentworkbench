# Verus RPC Command: getnettotals

## Purpose
The `getnettotals` command returns information about network traffic, including bytes received, bytes sent, and current time. This command is useful for monitoring network traffic and diagnosing connectivity issues.

## Description
When executed, this command provides statistics about the total network traffic handled by the node since it was started. This includes the total number of bytes received and sent, as well as the current time in milliseconds. This information can be useful for bandwidth monitoring and network performance analysis.

**Command Type**: Query/Read-only  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing network traffic information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| totalbytesrecv | numeric | Total bytes received |
| totalbytessent | numeric | Total bytes sent |
| timemillis | numeric | Total CPU time in milliseconds |

## Examples

### Example 1: Get network traffic information

**Command:**
```
verus getnettotals
```

**Sample Output:**
```json
{
  "totalbytesrecv": 1234567890,
  "totalbytessent": 9876543210,
  "timemillis": 1622505600123
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnettotals", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "totalbytesrecv": 1234567890,
    "totalbytessent": 9876543210,
    "timemillis": 1622505600123
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
- `getnetworkinfo`: Returns an object containing various state info regarding P2P networking
- `getpeerinfo`: Returns data about each connected network node
- `getconnectioncount`: Returns the number of connections to other nodes
