# Verus RPC Command: getpeerinfo

## Purpose
The `getpeerinfo` command returns detailed data about each connected network node as a JSON array of objects. This command is valuable for analyzing peer connections, monitoring network health, and troubleshooting connectivity issues.

## Description
When executed, this command provides comprehensive information about all peers currently connected to the node. For each peer, it returns details such as connection status, TLS information, network statistics, version information, and synchronization status. This information is useful for network diagnostics and for understanding the composition and health of the peer-to-peer network.

**Command Type**: Query/Read-only  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns an array of objects, each representing a connected peer with detailed information:

**Return Type**: Array of Objects

Each peer object contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | numeric | Peer index |
| addr | string | The IP address and port of the peer |
| addrlocal | string | Local address |
| services | string | The services offered |
| tls_established | boolean | Status of TLS connection |
| tls_verified | boolean | Status of peer certificate verification |
| lastsend | numeric | The time in seconds since epoch of the last send |
| lastrecv | numeric | The time in seconds since epoch of the last receive |
| bytessent | numeric | The total bytes sent |
| bytesrecv | numeric | The total bytes received |
| conntime | numeric | The connection time in seconds since epoch |
| timeoffset | numeric | The time offset in seconds |
| pingtime | numeric | Ping time |
| pingwait | numeric | Ping wait |
| version | numeric | The peer version |
| subver | string | The string version |
| inbound | boolean | Inbound (true) or Outbound (false) |
| startingheight | numeric | The starting height (block) of the peer |
| banscore | numeric | The ban score |
| synced_headers | numeric | The last header we have in common with this peer |
| synced_blocks | numeric | The last block we have in common with this peer |
| inflight | array | The heights of blocks we're currently asking from this peer |

## Examples

### Example 1: Get information about all connected peers

**Command:**
```
verus getpeerinfo
```

**Sample Output:**
```json
[
  {
    "id": 1,
    "addr": "203.0.113.1:8233",
    "addrlocal": "192.168.1.100:27485",
    "services": "000000000000040d",
    "tls_established": true,
    "tls_verified": true,
    "lastsend": 1622505600,
    "lastrecv": 1622505590,
    "bytessent": 123456,
    "bytesrecv": 654321,
    "conntime": 1622500000,
    "timeoffset": 0,
    "pingtime": 0.125,
    "pingwait": 0,
    "version": 170013,
    "subver": "/MagicBean:0.7.2-3/",
    "inbound": false,
    "startingheight": 1234500,
    "banscore": 0,
    "synced_headers": 1234567,
    "synced_blocks": 1234567,
    "inflight": []
  },
  {
    "id": 2,
    "addr": "203.0.113.2:8233",
    ... (similar fields for second peer)
  }
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getpeerinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "id": 1,
      "addr": "203.0.113.1:8233",
      ... (other fields as in Example 1)
    },
    ... (more peers)
  ],
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
- `getconnectioncount`: Returns the number of connections to other nodes
- `getnetworkinfo`: Returns an object containing various state info regarding P2P networking
- `addnode`: Attempts to add or remove a node from the addnode list
- `disconnectnode`: Immediately disconnects from the specified node
- `getaddednodeinfo`: Returns information about added nodes
