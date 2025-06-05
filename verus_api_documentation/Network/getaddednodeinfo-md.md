# Verus RPC Command: getaddednodeinfo

## Purpose
The `getaddednodeinfo` command returns information about manually added nodes. This command is useful for monitoring the status of specific nodes that have been added to the connection list.

## Description
When executed, this command provides details about nodes that have been added using the `addnode` command. It can provide either a simple list of added nodes or detailed connection information depending on the parameters. Note that nodes added with "onetry" are not listed by this command.

**Command Type**: Query/Read-only  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| dns | boolean | Yes | N/A | If false, only a list of added nodes will be provided. If true, connection information will also be available |
| node | string | No | N/A | If provided, return information about this specific node, otherwise all nodes are returned |

## Results
The command returns an array of objects containing information about the added nodes:

**Return Type**: Array of Objects

Each object in the array contains:

| Field | Type | Description |
|-------|------|-------------|
| addednode | string | The node IP address |
| connected | boolean | Whether the node is currently connected |
| addresses | array | Array of connection details (only if dns=true and connected=true) |

Each entry in the `addresses` array contains:

| Field | Type | Description |
|-------|------|-------------|
| address | string | The server host and port |
| connected | string | The type of connection: "inbound" or "outbound" |

## Examples

### Example 1: Get basic information about all added nodes

**Command:**
```
verus getaddednodeinfo false
```

**Sample Output:**
```json
[
  {
    "addednode": "192.168.0.201"
  },
  {
    "addednode": "192.168.0.202"
  }
]
```

### Example 2: Get detailed information about all added nodes

**Command:**
```
verus getaddednodeinfo true
```

**Sample Output:**
```json
[
  {
    "addednode": "192.168.0.201",
    "connected": true,
    "addresses": [
      {
        "address": "192.168.0.201:8233",
        "connected": "outbound"
      }
    ]
  },
  {
    "addednode": "192.168.0.202",
    "connected": false
  }
]
```

### Example 3: Get detailed information about a specific node

**Command:**
```
verus getaddednodeinfo true "192.168.0.201"
```

**Sample Output:**
```json
[
  {
    "addednode": "192.168.0.201",
    "connected": true,
    "addresses": [
      {
        "address": "192.168.0.201:8233",
        "connected": "outbound"
      }
    ]
  }
]
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddednodeinfo", "params": [true, "192.168.0.201"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "addednode": "192.168.0.201",
      "connected": true,
      "addresses": [
        {
          "address": "192.168.0.201:8233",
          "connected": "outbound"
        }
      ]
    }
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameter:**
   ```
   error code: -1
   error message:
   DNS is required
   ```

2. **Potential Error - Invalid DNS Parameter:**
   ```
   error code: -1
   error message:
   DNS must be a boolean
   ```

3. **Potential Error - Node Not Found:**
   ```
   error code: -1
   error message:
   Error: Node has not been added
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
- `disconnectnode`: Immediately disconnects from the specified node
