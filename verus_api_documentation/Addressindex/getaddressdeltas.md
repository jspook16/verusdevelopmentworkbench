# Verus RPC Command: getaddressdeltas

## Purpose
The `getaddressdeltas` command returns all changes (deltas) for one or more addresses, showing the history of incoming and outgoing transactions. This command is valuable for tracking transaction history and analyzing the flow of funds for specific addresses.

## Daemon Requirements
- The daemon must be started with the `-addressindex=1` parameter to enable address indexing

## Description
When provided with one or more addresses, this command retrieves all transaction deltas (changes in balance) associated with those addresses. The results can be filtered by block height range and can include additional chain information. This provides a complete transaction history for the specified addresses.

**Command Type**: Query/Read-only  
**Protocol Level**: Address Index  
**Access Requirement**: Requires addressindex to be enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| addresses | array | Yes | N/A | Array of base58check encoded addresses to query |
| start | number | No | N/A | The start block height for filtering results |
| end | number | No | N/A | The end block height for filtering results |
| chaininfo | boolean | No | false | Include chain info in results, only applies if start and end are specified |
| friendlynames | boolean | No | false | Include additional array of friendly names keyed by currency i-addresses |
| verbosity | number | No | 0 | If 1, include output information for spends, including all reserve amounts and destinations |

## Results
The command returns an array of objects, each representing a delta (change) for one of the addresses:

**Return Type**: Array of Objects

| Field | Type | Description |
|-------|------|-------------|
| satoshis | number | The difference of satoshis (positive for incoming, negative for outgoing) |
| txid | string | The related transaction ID |
| index | number | The related input or output index |
| height | number | The block height where this delta occurred |
| address | string | The base58check encoded address |

If `verbosity` is set to 1, additional output information will be included for spend transactions.

## Examples

### Example 1: Get all address deltas for a single address

**Command:**
```
verus getaddressdeltas '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Sample Output:**
```json
[
  {
    "satoshis": 1000000000,
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "index": 0,
    "height": 100000,
    "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
  },
  {
    "satoshis": -500000000,
    "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "index": 1,
    "height": 100050,
    "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
  }
]
```

### Example 2: Get address deltas within a specific block height range with chain info

**Command:**
```
verus getaddressdeltas '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"], "start": 100000, "end": 100100, "chaininfo": true}'
```

**Sample Output:**
```json
{
  "deltas": [
    {
      "satoshis": 1000000000,
      "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "index": 0,
      "height": 100000,
      "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
    },
    {
      "satoshis": -500000000,
      "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "index": 1,
      "height": 100050,
      "address": "RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"
    }
  ],
  "start": {
    "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    "height": 100000
  },
  "end": {
    "hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34",
    "height": 100100
  }
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressdeltas", "params": [{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "satoshis": 1000000000,
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

4. **Potential Error - Invalid Start/End Values:**
   ```
   error code: -8
   error message:
   Start height greater than end height
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaddressbalance`: Returns the balance for an address(es)
- `getaddressmempool`: Returns all mempool deltas for an address
- `getaddresstxids`: Returns the txids for an address(es)
- `getaddressutxos`: Returns all unspent outputs for an address
