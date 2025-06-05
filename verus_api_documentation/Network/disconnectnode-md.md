# Verus RPC Command: disconnectnode

## Purpose
The `disconnectnode` command immediately disconnects from the specified node. This command is useful for managing peer connections and troubleshooting network issues.

## Description
When executed with a node address, this command forces an immediate disconnection from that node. Unlike removing a node with `addnode "remove"`, this command doesn't prevent the node from reconnecting in the future if it is part of the P2P network discovery process. It simply terminates the current connection.

**Command Type**: Action/Network  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| node | string | Yes | N/A | The node address in the format "ip:port" (see getpeerinfo for nodes) |

## Results
The command does not provide a structured result. It returns nothing on success, or an error message if the operation fails.

**Return Type**: None or Error

## Examples

### Example 1: Disconnect from a specific node

**Command:**
```
verus disconnectnode "192.168.0.6:8233"
```

**Sample Output:**
```
null
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "disconnectnode", "params": ["192.168.0.6:8233"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

1. **Potential Error - Missing Node Parameter:**
   ```
   error code: -1
   error message:
   Node address required
   ```

2. **Potential Error - Invalid Node Format:**
   ```
   error code: -1
   error message:
   Error: Node address must be a string
   ```

3. **Potential Error - Node Not Connected:**
   ```
   error code: -1
   error message:
   Node not connected
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `addnode`: Attempts to add or remove a node from the addnode list
- `getpeerinfo`: Returns data about each connected network node
- `getconnectioncount`: Returns the number of connections to other nodes
- `getaddednodeinfo`: Returns information about added nodes
