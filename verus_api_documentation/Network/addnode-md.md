# Verus RPC Command: addnode

## Purpose
The `addnode` command attempts to add or remove a node from the addnode list, or tries a connection to a node once. This command is useful for manually managing peer connections in the Verus network.

## Description
When executed with the appropriate parameters, this command allows manual management of node connections. It can be used to persistently add nodes to the connection list, remove them from the list, or make a one-time connection attempt to a specified node. This functionality is particularly valuable for ensuring connectivity to trusted nodes or for network troubleshooting.

**Command Type**: Action/Network  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
The command accepts two required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| node | string | Yes | N/A | The node address in the format "ip:port" |
| command | string | Yes | N/A | The action to perform: 'add' to add a node to the list, 'remove' to remove a node from the list, 'onetry' to try a connection to the node once |

## Results
The command does not provide a structured result. It returns nothing on success, or an error message if the operation fails.

**Return Type**: None or Error

## Examples

### Example 1: Add a node to the connection list

**Command:**
```
verus addnode "192.168.0.6:8233" "add"
```

**Sample Output:**
```
null
```

### Example 2: Try connecting to a node once

**Command:**
```
verus addnode "192.168.0.6:8233" "onetry"
```

**Sample Output:**
```
null
```

### Example 3: Remove a node from the connection list

**Command:**
```
verus addnode "192.168.0.6:8233" "remove"
```

**Sample Output:**
```
null
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "addnode", "params": ["192.168.0.6:8233", "onetry"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

1. **Potential Error - Invalid Node Format:**
   ```
   error code: -1
   error message:
   Error: Node address must be a string
   ```

2. **Potential Error - Invalid Command:**
   ```
   error code: -1
   error message:
   Error: Command must be one of 'add', 'remove' or 'onetry'
   ```

3. **Potential Error - Node Not Found (for remove):**
   ```
   error code: -1
   error message:
   Error: Node does not exist in node list
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaddednodeinfo`: Returns information about added nodes
- `getpeerinfo`: Returns data about each connected network node
- `getconnectioncount`: Returns the number of connections to other nodes
- `disconnectnode`: Immediately disconnects from the specified node
