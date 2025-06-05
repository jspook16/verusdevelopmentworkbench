# Verus RPC Command: getaddressutxos

## Purpose
The `getaddressutxos` command returns all unspent transaction outputs (UTXOs) for one or more addresses. This command is valuable for analyzing available funds, planning transactions, and understanding the state of an address's unspent outputs.

## Daemon Requirements
- The daemon must be started with the `-addressindex=1` parameter to enable address indexing

## Description
When provided with one or more addresses, this command retrieves all unspent transaction outputs associated with those addresses. The results include detailed information about each UTXO, including the transaction ID, output index, script, and value. Additional options allow for including chain information and friendly names for currencies.

**Command Type**: Query/Read-only  
**Protocol Level**: Address Index  
**Access Requirement**: Requires addressindex to be enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| addresses | array | Yes | N/A | Array of base58check encoded addresses to query |
| chaininfo | boolean | No | false | Include chain info with results |
| friendlynames | boolean | No | false | Include additional array of friendly names keyed by currency i-addresses |
| verbosity | number | No | 0 | If 1, include output information for spends, including all reserve amounts and destinations |

## Results
The command returns an array of objects, each representing an unspent transaction output (UTXO) for one of the addresses:

**Return Type**: Array of Objects

| Field | Type | Description |
|-------|------|-------------|
| address | string | The address base58check encoded |
| txid | string | The output transaction ID |
| height | number | The block height where this UTXO was created |
| outputIndex | number | The output index |
| script | string | The script hex encoded |
| satoshis | number | The number of satoshis of the output |

If `chaininfo` is set to true, the response will also include information about the blockchain.

If `verbosity` is set to 1, additional output information will be included, such as reserve amounts and destinations.

## Examples

### Example 1: Get all UTXOs for a single address

**Command:**
```
verus getaddressutxos '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Sample Output:**
```json
[
  {
    "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "height": 100000,
    "outputIndex": 0,
    "script": "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac",
    "satoshis": 1000000000
  },
  {
    "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
    "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "height": 100050,
    "outputIndex": 1,
    "script": "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac",
    "satoshis": 500000000
  }
]
```

### Example 2: Get UTXOs with chain information and friendly names

**Command:**
```
verus getaddressutxos '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"], "chaininfo": true, "friendlynames": true}'
```

**Sample Output:**
```json
{
  "utxos": [
    {
      "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
      "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "height": 100000,
      "outputIndex": 0,
      "script": "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac",
      "satoshis": 1000000000
    }
  ],
  "friendlynames": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": "VRSC"
  },
  "height": 250000,
  "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "chainwork": "0000000000000000000000000000000000000000000000123456789abcdef0"
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressutxos", "params": [{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87",
      ... (other fields as in Example 1)
    },
    ... (more UTXOs)
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
- `getaddressmempool`: Returns all mempool deltas for an address
- `getaddresstxids`: Returns the txids for an address(es)
- `listunspent`: Returns array of unspent transaction outputs in the wallet
