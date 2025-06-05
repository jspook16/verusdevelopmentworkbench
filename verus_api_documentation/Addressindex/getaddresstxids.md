# Verus RPC Command: getaddresstxids

## Purpose
The `getaddresstxids` command returns all transaction IDs (txids) for one or more addresses. This command is useful for retrieving the complete transaction history for specific addresses, which can then be used for further analysis or detailed transaction information retrieval.

## Daemon Requirements
- The daemon must be started with the `-addressindex=1` parameter to enable address indexing

## Description
When provided with one or more addresses, this command retrieves all transaction IDs associated with those addresses. The results can be filtered by block height range, allowing for focused analysis of transactions within specific time periods. This provides a comprehensive list of all transactions involving the specified addresses.

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

## Results
The command returns an array of strings, where each string represents a transaction ID (txid) associated with the provided addresses.

**Return Type**: Array of strings

## Examples

### Example 1: Get all transaction IDs for a single address

**Command:**
```
verus getaddresstxids '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Sample Output:**
```json
[
  "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "c123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
]
```

### Example 2: Get transaction IDs within a specific block height range

**Command:**
```
verus getaddresstxids '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"], "start": 100000, "end": 200000}'
```

**Sample Output:**
```json
[
  "d123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "e123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddresstxids", "params": [{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    ... (more transaction IDs)
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
- `getaddressdeltas`: Returns all changes for an address
- `getaddressmempool`: Returns all mempool deltas for an address
- `getaddressutxos`: Returns all unspent outputs for an address
- `getrawtransaction`: Returns raw transaction data
