# Verus RPC Command: getchaintxstats

## Purpose
The `getchaintxstats` command computes statistics about the total number and rate of transactions in the blockchain. This command is useful for blockchain analysis, network activity monitoring, and understanding transaction throughput trends.

## Description
When executed, this command calculates and returns statistics about transactions in the blockchain, including the total number of transactions and the rate of transactions over a specified window of blocks. These statistics can help in understanding network usage patterns and transaction volume trends.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts two optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| nblocks | numeric | No | 30 days worth of blocks | Number of blocks in the averaging window |
| blockhash | string | No | Chain tip | The hash of the block that ends the window |

## Results
The command returns a JSON object containing the following transaction statistics:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| time | numeric | The timestamp for the final block in the window in UNIX format |
| txcount | numeric | The total number of transactions in the chain up to that point |
| window_final_block_hash | string | The hash of the final block in the window |
| window_block_count | numeric | Size of the window in number of blocks |
| window_tx_count | numeric | The number of transactions in the window (only returned if window_block_count > 0) |
| window_interval | numeric | The elapsed time in the window in seconds (only returned if window_block_count > 0) |
| txrate | numeric | The average rate of transactions per second in the window (only returned if window_interval > 0) |

## Examples

### Example 1: Get transaction statistics using default window

**Command:**
```
verus getchaintxstats
```

**Sample Output:**
```json
{
  "time": 1629876543,
  "txcount": 5432109,
  "window_final_block_hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "window_block_count": 4320,
  "window_tx_count": 54321,
  "window_interval": 259200,
  "txrate": 0.2095
}
```

### Example 2: Get transaction statistics with a custom window size

**Command:**
```
verus getchaintxstats 2016
```

**Sample Output:**
```json
{
  "time": 1629876543,
  "txcount": 5432109,
  "window_final_block_hash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "window_block_count": 2016,
  "window_tx_count": 25000,
  "window_interval": 120960,
  "txrate": 0.2067
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getchaintxstats", "params": [2016] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "time": 1629876543,
    "txcount": 5432109,
    ... (other fields as in Example 2)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Window Size:**
   ```
   error code: -8
   error message:
   Invalid window size (must be between 1 and chain height)
   ```

2. **Potential Error - Invalid Block Hash:**
   ```
   error code: -8
   error message:
   blockhash must be of length 64 (not XX)
   ```

3. **Potential Error - Block Not Found:**
   ```
   error code: -5
   error message:
   Block not found
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getmempoolinfo`: Returns details on the active state of the TX memory pool
- `getrawmempool`: Returns all transaction ids in memory pool
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
