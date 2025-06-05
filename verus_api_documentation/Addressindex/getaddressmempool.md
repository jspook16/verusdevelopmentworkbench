# Verus RPC Command: getaddressmempool

## Purpose
The `getaddressmempool` command returns all mempool deltas (unconfirmed transactions) for one or more addresses. This command is valuable for monitoring pending transactions that have not yet been included in a block.

## Daemon Requirements
- The daemon must be started with the `-addressindex=1` parameter to enable address indexing

## Description
When provided with one or more addresses, this command retrieves all unconfirmed transaction deltas (changes in balance) currently in the memory pool that are associated with those addresses. This allows tracking of pending incoming and outgoing transactions before they are confirmed in a block.

**Command Type**: Query/Read-only  
**Protocol Level**: Address Index/Mempool  
**Access Requirement**: Requires addressindex to be enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| addresses | array | Yes | N/A | Array of base58check encoded addresses to query |
| friendlynames | boolean | No | false | Include additional array of friendly names keyed by currency i-addresses |
| verbosity | number | No | 0 | If 1, include output information for spends, including all reserve amounts and destinations |

## Results
The command returns an array of objects, each representing a mempool delta for one of the addresses:

**Return Type**: Array of Objects

| Field | Type | Description |
|-------|------|-------------|
| address | string | The base58check encoded address |
| txid | string | The related transaction ID |
| index | number | The related input or output index |
| satoshis | number | The difference of satoshis (positive for incoming, negative for outgoing) |
| timestamp | number | The time the transaction entered the mempool (seconds since epoch) |
| prevtxid | string | The previous txid (if spending) |
| prevout | string | The previous transaction output index (if spending) |

If `verbosity` is set to 1, additional output information will be included for spend transactions.

## Examples

### Example 1: Get all mempool deltas for a single address

**Command:**
```
verus getaddressmempool '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Sample Output:**
```json
[
  {
    "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "index": 0,
    "satoshis": 1000000000,
    "timestamp": 1622505600,
    "prevtxid": "",
    "prevout": ""
  },
  {
    "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
    "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "index": 1,
    "satoshis": -500000000,
    "timestamp": 1622505650,
    "prevtxid": "c123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "prevout": "0"
  }
]
```

### Example 2: Get mempool deltas with friendly names and higher verbosity

**Command:**
```
verus getaddressmempool '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"], "friendlynames": true, "verbosity": 1}'
```

**Sample Output:**
```json
{
  "deltas": [
    {
      "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
      "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "index": 0,
      "satoshis": 1000000000,
      "timestamp": 1622505600,
      "prevtxid": "",
      "prevout": "",
      "outputs": [
        {
          "currency": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
          "amount": 10.0,
          "destination": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
        }
      ]
    }
  ],
  "friendlynames": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": "VRSC"
  }
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressmempool", "params": [{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
      ... (other fields as in Example 1)
    },
    ... (more deltas)
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Address Index Not Enabled:**
   ```
   error code: -1
   error message:
   Address index not enabled
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid address format
   ```

3. **Potential Error - Missing Required Parameter:**
   ```
   error code: -8
   error message:
   No addresses provided
   ```

4. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Addresses is expected to be an array
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaddressbalance`: Returns the balance for an address(es)
- `getaddressdeltas`: Returns all changes for an address
- `getaddresstxids`: Returns the txids for an address(es)
- `getaddressutxos`: Returns all unspent outputs for an address
- `getrawmempool`: Returns all transaction IDs in memory pool
