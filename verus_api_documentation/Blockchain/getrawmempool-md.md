# Verus RPC Command: getrawmempool

## Purpose
The `getrawmempool` command returns all transaction IDs in the memory pool as a JSON array of transaction IDs, or as a detailed JSON object with transaction details when verbose mode is enabled. This command is valuable for monitoring pending transactions and analyzing the current state of the mempool.

## Description
When executed, this command provides information about all transactions currently in the node's memory pool (mempool), which are waiting to be confirmed and included in a block. In its basic form, it returns just the transaction IDs, but when the verbose parameter is set to true, it returns detailed information about each transaction, including size, fee, time, and dependencies.

**Command Type**: Query/Read-only  
**Protocol Level**: Network/Mempool  
**Access Requirement**: No special requirements

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| verbose | boolean | No | false | True for a JSON object, false for an array of transaction IDs |

## Results
The output format depends on the verbose parameter:

**Verbose = false (default):**  
Returns an array of strings, each representing a transaction ID in the mempool.

**Verbose = true:**  
Returns a JSON object with transaction IDs as keys and transaction details as values. Each transaction object contains:

| Field | Type | Description |
|-------|------|-------------|
| size | numeric | Transaction size in bytes |
| fee | numeric | Transaction fee in VRSC |
| time | numeric | Local time transaction entered pool in seconds since 1 Jan 1970 GMT |
| height | numeric | Block height when transaction entered pool |
| startingpriority | numeric | Priority when transaction entered pool |
| currentpriority | numeric | Transaction priority now |
| depends | array | Unconfirmed transactions used as inputs for this transaction |

**Return Type**: Array of strings (verbose=false) or Object (verbose=true)

## Examples

### Example 1: Get all transaction IDs in the mempool

**Command:**
```
verus getrawmempool
```

**Sample Output:**
```json
[
  "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "c123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
]
```

### Example 2: Get detailed information about all transactions in the mempool

**Command:**
```
verus getrawmempool true
```

**Sample Output:**
```json
{
  "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef": {
    "size": 226,
    "fee": 0.00001000,
    "time": 1633456789,
    "height": 1234567,
    "startingpriority": 12345.67890,
    "currentpriority": 12345.67890,
    "depends": []
  },
  "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef": {
    "size": 521,
    "fee": 0.00005000,
    "time": 1633456790,
    "height": 1234567,
    "startingpriority": 98765.43210,
    "currentpriority": 98765.43210,
    "depends": [
      "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    ]
  }
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawmempool", "params": [true] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef": {
      "size": 226,
      ... (other fields as in Example 2)
    },
    ... (other transactions)
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

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Expected boolean value for verbose parameter
   ```

3. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

## Related Commands
- `getmempoolinfo`: Returns details on the active state of the TX memory pool
- `clearrawmempool`: Clears the mempool of all transactions
- `getrawtransaction`: Returns raw transaction data
- `sendrawtransaction`: Submits raw transaction to the network
