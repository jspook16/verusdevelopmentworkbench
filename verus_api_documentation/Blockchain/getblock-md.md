# Verus RPC Command: getblock

## Purpose
The `getblock` command retrieves detailed information about a specific block in the blockchain. This command is essential for blockchain analysis, transaction verification, and understanding the blockchain's structure.

## Description
The `getblock` command accepts either a block hash or a block height as its primary argument and returns information about the specified block. The level of detail provided depends on the verbosity parameter. At the lowest verbosity level, it returns serialized, hex-encoded data for the block. At higher verbosity levels, it returns a JSON object with increasing amounts of information about the block and its transactions.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts two arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hash\|height | string\|numeric | Yes | N/A | The block hash (string) or block height (numeric) |
| verbosity | numeric | No | 1 | 0 for hex-encoded data, 1 for a JSON object with block information, 2 for JSON object with transaction data |

## Results
The output format depends on the verbosity parameter:

**Verbosity = 0:**  
Returns a string that is serialized, hex-encoded data for the block.

**Verbosity = 1:**  
Returns a JSON object with detailed information about the block, including:

| Field | Type | Description |
|-------|------|-------------|
| hash | string | The block hash (same as provided hash) |
| confirmations | numeric | The number of confirmations, or -1 if the block is not on the main chain |
| size | numeric | The block size in bytes |
| height | numeric | The block height or index (same as provided height) |
| version | numeric | The block version |
| merkleroot | string | The merkle root hash |
| finalsaplingroot | string | The root of the Sapling commitment tree after applying this block |
| tx | array of string | Array of transaction IDs in the block |
| time | numeric | The block time in seconds since epoch (Jan 1 1970 GMT) |
| nonce | numeric | The nonce value |
| bits | string | The bits representing the difficulty target |
| difficulty | numeric | The difficulty of the block |
| previousblockhash | string | The hash of the previous block |
| nextblockhash | string | The hash of the next block (if available) |

**Verbosity = 2:**  
Returns all fields from verbosity=1, but with the `tx` field containing detailed transaction objects instead of just transaction IDs. Each transaction object contains the same fields as returned by the `getrawtransaction` RPC.

**Return Type**: String (verbosity=0) or Object (verbosity=1,2)

## Examples

### Example 1: Get block by hash with default verbosity (1)

**Command:**
```
verus getblock "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5"
```

**Sample Output:**
```json
{
  "hash": "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5",
  "confirmations": 12345,
  "size": 2345,
  "height": 5000,
  "version": 4,
  "merkleroot": "7e2fc7196d3df2884dbc8ad28902d4751a5c8397e3a4b053086e49f2acd14fbd",
  "finalsaplingroot": "0dc2e9e02b98cf5a4181cf140f86f3518243b3f5dfc22c7908ea68796f5f6e37",
  "tx": [
    "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  ],
  "time": 1529696743,
  "nonce": "00001a5c07f0ffff",
  "bits": "1d00ffff",
  "difficulty": 1.0,
  "previousblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "nextblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34"
}
```

### Example 2: Get block by height with verbosity=0 (hex data)

**Command:**
```
verus getblock 12800 0
```

**Sample Output:**
```
04000000ef233fdc38c9e32224f361d61c12d...
```
(truncated hex string representing the serialized block data)

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblock", "params": ["00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hash": "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5",
    "confirmations": 12345,
    "size": 2345,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Block Not Found:**
   ```
   error code: -5
   error message:
   Block not found
   ```

2. **Potential Error - Invalid Block Hash:**
   ```
   error code: -8
   error message:
   blockhash must be of length 64 (not XX)
   ```

3. **Potential Error - Invalid Block Height:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

4. **Potential Error - Invalid Verbosity Value:**
   ```
   error code: -8
   error message:
   Verbosity value out of range (0-2)
   ```

## Related Commands
- `getbestblockhash`: Returns the hash of the best (tip) block in the longest blockchain
- `getblockcount`: Returns the number of blocks in the best valid block chain
- `getblockhash`: Returns hash of block at specified height in the blockchain
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getrawtransaction`: Returns raw transaction data
