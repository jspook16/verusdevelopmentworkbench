# Verus RPC Command: gettxoutsetinfo

## Purpose
The `gettxoutsetinfo` command returns statistics about the unspent transaction output (UTXO) set in the blockchain. This command is valuable for blockchain analysis, monitoring the overall state of the blockchain, and for diagnostic purposes.

## Description
When executed, this command provides comprehensive statistics about the current UTXO set, including the total number of unspent outputs, their combined value, and other relevant metrics. This information can be useful for understanding the blockchain's size, distribution of funds, and overall health. Note that this call may take some time to execute, especially on larger blockchains, as it needs to compute statistics across the entire UTXO set.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing the following statistics about the UTXO set:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| height | numeric | The current block height (index) |
| bestblock | string | The best block hash hex |
| transactions | numeric | The number of transactions with unspent outputs |
| txouts | numeric | The number of unspent transaction outputs |
| bytes_serialized | numeric | The serialized size of the UTXO set |
| hash_serialized | string | The serialized hash |
| total_amount | numeric | The total amount of coins in the UTXO set |

## Examples

### Example 1: Get UTXO set statistics

**Command:**
```
verus gettxoutsetinfo
```

**Sample Output:**
```json
{
  "height": 1234567,
  "bestblock": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "transactions": 543210,
  "txouts": 876543,
  "bytes_serialized": 98765432,
  "hash_serialized": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "total_amount": 42000000.12345678
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxoutsetinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "height": 1234567,
    "bestblock": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
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

4. **Potential Error - Operation Timeout:**
   ```
   error code: -9
   error message:
   Operation timed out
   ```

## Related Commands
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `gettxout`: Returns details about an unspent transaction output
- `listunspent`: Returns array of unspent transaction outputs
- `coinsupply`: Return coin supply information at a given block height
