# Verus RPC Command: getspentinfo

## Purpose
The `getspentinfo` command returns information about where and how a transaction output was spent. This command is useful for tracking the flow of funds and analyzing transaction chains in the blockchain.

## Description
When provided with a transaction ID (txid) and an output index (vout), this command returns the transaction ID and input index that spent this specific output. This information can be valuable for blockchain analysis, transaction tracking, and debugging purposes.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: May require txindex=1 to be set in the configuration file

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The hex string of the transaction ID containing the output |
| index | number | Yes | N/A | The output index (vout) within the transaction |

## Results
The command returns a JSON object containing the transaction ID and input index where the specified output was spent:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| txid | string | The transaction ID of the spending transaction |
| index | number | The input index within the spending transaction |

## Examples

### Example 1: Get spent information for a specific transaction output

**Command:**
```
verus getspentinfo '{"txid": "0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9", "index": 0}'
```

**Sample Output:**
```json
{
  "txid": "e8d5f5ebd6eb3075c665c8e9d9d92e1e2646d48b16dee7dba201ebb443a391ce",
  "index": 2
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getspentinfo", "params": [{"txid": "0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9", "index": 0}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "txid": "e8d5f5ebd6eb3075c665c8e9d9d92e1e2646d48b16dee7dba201ebb443a391ce",
    "index": 2
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Output Not Found:**
   ```
   error code: -5
   error message:
   No information available about the spent output
   ```

2. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not found in the blockchain
   ```

3. **Potential Error - Output Not Spent:**
   ```
   error code: -5
   error message:
   Output has not been spent
   ```

4. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   txid must be a hexadecimal string
   ```

5. **Potential Error - Missing Index:**
   ```
   error code: -8
   error message:
   Missing required parameter 'index'
   ```

6. **Potential Error - Transaction Index Not Enabled:**
   ```
   error code: -1
   error message:
   Transaction index not enabled. Please restart with -txindex=1
   ```

## Related Commands
- `getrawtransaction`: Returns raw transaction data
- `gettxout`: Returns details about an unspent transaction output
- `decoderawtransaction`: Returns information about a transaction
- `listunspent`: Returns array of unspent transaction outputs
