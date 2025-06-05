# Verus RPC Command: getnetworkinfo

## Purpose
The `getnetworkinfo` command returns comprehensive information regarding the P2P networking state of the node. This command is useful for retrieving detailed network configuration, connectivity status, and other network-related information.

## Description
When executed, this command provides a wide range of information about the node's network status and configuration. It returns details about the software version, protocol version, network services, connections, supported networks, relay fee, local addresses, and any network warnings. This information is valuable for diagnosing network issues and understanding the node's connectivity.

**Command Type**: Query/Read-only  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing various networking information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| version | numeric | The server version |
| subversion | string | The server subversion string |
| protocolversion | numeric | The protocol version |
| localservices | string | The services offered to the network |
| timeoffset | numeric | The time offset |
| connections | numeric | The number of connections |
| networks | array | Information per network (ipv4, ipv6, onion) |
| relayfee | numeric | Minimum relay fee for non-free transactions in VRSC/kB |
| localaddresses | array | List of local addresses |
| warnings | string | Any network warnings |

Each object in the `networks` array contains:

| Field | Type | Description |
|-------|------|-------------|
| name | string | Network name (ipv4, ipv6, or onion) |
| limited | boolean | Whether the network is limited using -onlynet |
| reachable | boolean | Whether the network is reachable |
| proxy | string | The proxy that is used for this network, or empty if none |

Each object in the `localaddresses` array contains:

| Field | Type | Description |
|-------|------|-------------|
| address | string | Network address |
| port | numeric | Network port |
| score | numeric | Relative score |

## Examples

### Example 1: Get network information

**Command:**
```
verus getnetworkinfo
```

**Sample Output:**
```json
{
  "version": 2001526,
  "subversion": "/MagicBean:0.7.2-3/",
  "protocolversion": 170013,
  "localservices": "0000000000000425",
  "timeoffset": 0,
  "connections": 8,
  "networks": [
    {
      "name": "ipv4",
      "limited": false,
      "reachable": true,
      "proxy": ""
    },
    {
      "name": "ipv6",
      "limited": false,
      "reachable": true,
      "proxy": ""
    },
    {
      "name": "onion",
      "limited": true,
      "reachable": false,
      "proxy": ""
    }
  ],
  "relayfee": 0.00001000,
  "localaddresses": [
    {
      "address": "192.168.1.100",
      "port": 27485,
      "score": 100
    }
  ],
  "warnings": ""
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnetworkinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "version": 2001526,
    "subversion": "/MagicBean:0.7.2-3/",
    ... (other fields as in Example 1)
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
- `getpeerinfo`: Returns data about each connected network node
- `getnettotals`: Returns information about network traffic
- `getconnectioncount`: Returns the number of connections to other nodes
- `getdeprecationinfo`: Returns information about the current version and deprecation block height
