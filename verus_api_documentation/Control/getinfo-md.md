# Verus RPC Command: getinfo

## Purpose
The `getinfo` command returns an object containing various state information about the Verus node and wallet. This command provides a comprehensive overview of the node's current state, including version information, blockchain status, network connections, and wallet details.

## Description
When executed, this command retrieves and returns a wide range of information about the running Verus node, including software versions, blockchain state, network connectivity, wallet status, and fee settings. This makes it a valuable diagnostic tool for node operators and developers seeking to understand the current state of their node.

**Command Type**: Query/Read-only  
**Protocol Level**: General  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing the following information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| version | numeric | The server version |
| protocolversion | numeric | The protocol version |
| walletversion | numeric | The wallet version |
| blocks | numeric | The current number of blocks processed in the server |
| timeoffset | numeric | The time offset |
| connections | numeric | The number of connections |
| tls_established | numeric | The number of TLS connections established |
| tls_verified | numeric | The number of TLS connections with validated certificates |
| proxy | string | The proxy used by the server (optional) |
| difficulty | numeric | The current difficulty |
| testnet | boolean | If the server is using testnet or not |
| keypoololdest | numeric | The timestamp (seconds since GMT epoch) of the oldest pre-generated key in the key pool |
| keypoolsize | numeric | How many new keys are pre-generated |
| unlocked_until | numeric | The timestamp in seconds since epoch that the wallet is unlocked for transfers, or 0 if the wallet is locked |
| paytxfee | numeric | The transaction fee set in VRSC/kB |
| relayfee | numeric | Minimum relay fee for non-free transactions in VRSC/kB |
| errors | string | Any error messages |

## Examples

### Example 1: Get general information about the node

**Command:**
```
verus getinfo
```

**Sample Output:**
```json
{
  "version": 2010050,
  "protocolversion": 170013,
  "walletversion": 60000,
  "blocks": 1234567,
  "timeoffset": 0,
  "connections": 8,
  "tls_established": 5,
  "tls_verified": 3,
  "proxy": "",
  "difficulty": 58773.4261233,
  "testnet": false,
  "keypoololdest": 1600000000,
  "keypoolsize": 100,
  "unlocked_until": 0,
  "paytxfee": 0.00001000,
  "relayfee": 0.00001000,
  "errors": ""
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "version": 2010050,
    "protocolversion": 170013,
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
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getnetworkinfo`: Returns network-related information
- `getwalletinfo`: Returns an object containing various wallet state info
- `getmininginfo`: Returns mining-related information
