# Verus RPC Command: prioritisetransaction

## Purpose
The `prioritisetransaction` command accepts a transaction into mined blocks at a higher (or lower) priority. This command is useful for miners and pool operators who need to prioritize specific transactions regardless of their standard priority or fee levels.

## Description
When executed, this command modifies the priority score for a specific transaction in the mempool. It allows adjustment of both the priority value (based on coin age and value) and fee value (in satoshis). These adjustments affect only the transaction selection algorithm and do not actually change the transaction itself or require additional payment. Transactions with artificially boosted priority/fee are more likely to be included in the next mined block.

**Command Type**: Action/Write  
**Protocol Level**: Mining/Mempool  
**Access Requirement**: Mining node or pool operator

## Arguments
The command accepts three required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The transaction ID |
| priority delta | numeric | Yes | N/A | The priority to add or subtract |
| fee delta | numeric | Yes | N/A | The fee value (in satoshis) to add or subtract |

## Results
The command returns a boolean value indicating success.

**Return Type**: Boolean

- `true`: Indicates that the transaction priority was successfully adjusted

## Examples

### Example 1: Increase fee priority for a transaction

**Command:**
```
verus prioritisetransaction "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" 0.0 10000
```

**Sample Output:**
```
true
```

### Example 2: Increase priority value for a transaction

**Command:**
```
verus prioritisetransaction "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" 1000.0 0
```

**Sample Output:**
```
true
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "prioritisetransaction", "params": ["a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", 0.0, 10000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": true,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   Invalid transaction id
   ```

2. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not in mempool
   ```

3. **Potential Error - Invalid Priority Delta:**
   ```
   error code: -3
   error message:
   Priority delta must be a number
   ```

4. **Potential Error - Invalid Fee Delta:**
   ```
   error code: -3
   error message:
   Fee delta must be a number
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getrawmempool`: Returns all transaction IDs in memory pool
- `getmempoolinfo`: Returns details on the active state of the TX memory pool
- `getblocktemplate`: Gets data needed to construct a block to work on
- `submitblock`: Attempts to submit new block to network
