# Verus RPC Command: getblockheader

## Purpose
The `getblockheader` command retrieves information about the header of a block in the blockchain. This command is useful for lightweight applications that need block metadata without the full transaction details.

## Description
When provided with a block hash, this command returns either serialized, hex-encoded data for the block header (if verbose is false) or a JSON object with detailed information about the block header (if verbose is true). Block headers contain essential metadata about a block without including the full transaction data.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts two arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hash | string | Yes | N/A | The block hash |
| verbose | boolean | No | true | True for a JSON object, false for the hex-encoded data |

## Results
The output format depends on the verbose parameter:

**Verbose = true (default):**  
Returns a JSON object with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| hash | string | The block hash (same as provided hash) |
| confirmations | numeric | The number of confirmations, or -1 if the block is not on the main chain |
| height | numeric | The block height or index |
| version | numeric | The block version |
| merkleroot | string | The merkle root hash |
| finalsaplingroot | string | The root of the Sapling commitment tree after applying this block |
| time | numeric | The block time in seconds since epoch (Jan 1 1970 GMT) |
| nonce | numeric | The nonce value |
| bits | string | The bits representing the difficulty target |
| difficulty | numeric | The difficulty of the block |
| previousblockhash | string | The hash of the previous block |
| nextblockhash | string | The hash of the next block (if available) |

**Verbose = false:**  
Returns a string that is serialized, hex-encoded data for the block header.

**Return Type**: Object (verbose=true) or String (verbose=false)

## Examples

### Example 1: Get block header with default verbosity (JSON object)

**Command:**
```
verus getblockheader "00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09"
```

**Sample Output:**
```json
{
  "hash": "00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09",
  "confirmations": 12345,
  "height": 1000,
  "version": 4,
  "merkleroot": "7e2fc7196d3df2884dbc8ad28902d4751a5c8397e3a4b053086e49f2acd14fbd",
  "finalsaplingroot": "0dc2e9e02b98cf5a4181cf140f86f3518243b3f5dfc22c7908ea68796f5f6e37",
  "time": 1529696743,
  "nonce": "00001a5c07f0ffff",
  "bits": "1d00ffff",
  "difficulty": 1.0,
  "previousblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "nextblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34"
}
```

### Example 2: Get block header as hex-encoded data

**Command:**
```
verus getblockheader "00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09" false
```

**Sample Output:**
```
0400000012efcdab9078563412efcdab9078563412efcdab9078563412efcdab00000000bd4fd1ace2496e0853b0a4e397835c1a75d40289d28abc4d88f23d6d19c72f7e3b67f4f7996a68e90c7c22dff5b3438251f3860f14cf81415acf982be0e9c20dffff0fc0a7001a0000ffff001d
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockheader", "params": ["00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hash": "00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09",
    "confirmations": 12345,
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

3. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Expected boolean for verbose parameter
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getbestblockhash`: Returns the hash of the best (tip) block in the longest blockchain
- `getblock`: Returns detailed information about a block
- `getblockhash`: Returns hash of block at specified height in the blockchain
- `getblockchaininfo`: Returns various state info regarding blockchain processing
