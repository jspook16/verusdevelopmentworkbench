# Verus RPC Command: getblocktemplate

## Purpose
The `getblocktemplate` command returns data needed to construct a block to work on. This command is primarily used by mining software to get the necessary information to mine the next block.

## Description
This command implements the getblocktemplate specification as described in BIP 0022. When executed, it returns a JSON object containing all the data needed for a miner to construct a valid block, including transactions to include, the target hash, and various blockchain state information. The command can be customized through a JSON request object to specify mining distribution and capabilities.

**Command Type**: Query/Read-only  
**Protocol Level**: Mining  
**Access Requirement**: No special requirements

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| jsonrequestobject | string | No | N/A | A JSON object with request specifications |

The `jsonrequestobject` can contain:
- `mode`: This must be set to "template" or omitted
- `miningdistribution`: A key-value object mapping recipient addresses to relative weights
- `capabilities`: An array of strings representing client-side supported features

## Results
The command returns a JSON object containing extensive data needed to construct a new block:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| version | numeric | The block version |
| previousblockhash | string | The hash of current highest block |
| finalsaplingroothash | string | The hash of the final sapling root |
| transactions | array | Contents of non-coinbase transactions that should be included in the next block |
| coinbasetxn | object | Information for coinbase transaction |
| target | string | The hash target |
| mintime | numeric | The minimum timestamp appropriate for next block time |
| mutable | array | List of ways the block template may be changed |
| noncerange | string | A range of valid nonces |
| sigoplimit | numeric | Limit of sigops in blocks |
| sizelimit | numeric | Limit of block size |
| curtime | numeric | Current timestamp |
| bits | string | Compressed target of next block |
| height | numeric | The height of the next block |

Each transaction in the `transactions` array contains:

| Field | Type | Description |
|-------|------|-------------|
| data | string | Transaction data encoded in hexadecimal |
| hash | string | Hash/id encoded in little-endian hexadecimal |
| depends | array | Array of transaction dependencies by index |
| fee | numeric | Difference in value between inputs and outputs |
| sigops | numeric | Total number of SigOps for block limits |
| required | boolean | If true, this transaction must be in the final block |

## Examples

### Example 1: Get block template with default parameters

**Command:**
```
verus getblocktemplate
```

**Sample Output Format:**
```json
{
  "version": 4,
  "previousblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "finalsaplingroothash": "0dc2e9e02b98cf5a4181cf140f86f3518243b3f5dfc22c7908ea68796f5f6e37",
  "transactions": [
    {
      "data": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff...",
      "hash": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "depends": [],
      "fee": 1000,
      "sigops": 4,
      "required": false
    }
  ],
  "coinbasetxn": {
    "data": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff...",
    "hash": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "depends": [],
    "fee": -1000,
    "sigops": 1,
    "required": true
  },
  "target": "0000000007ffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "mintime": 1622505600,
  "mutable": ["time", "transactions", "prevblock"],
  "noncerange": "00000000ffffffff",
  "sigoplimit": 20000,
  "sizelimit": 2000000,
  "curtime": 1622505650,
  "bits": "1d00ffff",
  "height": 1234567
}
```

### Example 2: Get block template with custom mining distribution

**Command:**
```
verus getblocktemplate '{"mode":"template", "miningdistribution":{"RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87":0.7, "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b":0.3}}'
```

**Sample Output Format:**
Similar to Example 1, but the coinbase transaction will be constructed to distribute mining rewards according to the specified distribution.

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblocktemplate", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "version": 4,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Mode:**
   ```
   error code: -8
   error message:
   Invalid mode
   ```

2. **Potential Error - Invalid Mining Distribution:**
   ```
   error code: -8
   error message:
   Invalid mining distribution format
   ```

3. **Potential Error - Node Not Synced:**
   ```
   error code: -10
   error message:
   Verus is not synchronized with network
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `submitblock`: Attempts to submit new block to network
- `getmininginfo`: Returns mining-related information
- `setminingdistribution`: Sets multiple mining outputs with amounts
- `getnetworksolps`: Returns the estimated network solutions per second
