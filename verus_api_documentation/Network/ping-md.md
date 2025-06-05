# Verus RPC Command: ping

## Purpose
The `ping` command requests that a ping be sent to all other connected nodes to measure ping time. This command is useful for testing network latency and the processing backlog of the node.

## Description
When executed, this command queues ping requests to all connected peers. The results of these pings are not returned directly, but can be viewed in the `pingtime` and `pingwait` fields of the `getpeerinfo` command output. Since the ping command is handled in the same queue as all other commands, it measures not just network latency but also the processing backlog of the node.

**Command Type**: Action/Network  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command does not provide a structured result. It simply queues ping requests to all connected nodes and returns null. The actual ping results must be viewed using the `getpeerinfo` command.

**Return Type**: None or Error

## Examples

### Example 1: Send ping to all connected nodes

**Command:**
```
verus ping
```

**Sample Output:**
```
null
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "ping", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": null,
  "error": null,
  "id": "curltest"
}
```

### Example 3: Check ping results using getpeerinfo

**Command:**
```
verus getpeerinfo
```

**Expected Output (showing ping results):**
```json
[
  {
    "id": 1,
    "addr": "203.0.113.1:8233",
    ...
    "pingtime": 0.125,
    "pingwait": 0,
    ...
  },
  ...
]
```

## Potential Error Cases

1. **Potential Error - No Connected Peers:**
   ```
   error code: -9
   error message:
   No peers connected
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
- `getpeerinfo`: Returns data about each connected network node (including ping results)
- `getconnectioncount`: Returns the number of connections to other nodes
- `getnetworkinfo`: Returns an object containing various state info regarding P2P networking
- `getnettotals`: Returns information about network traffic
