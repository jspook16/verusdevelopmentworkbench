# Verus RPC Command: z_gettreestate

## Purpose
The `z_gettreestate` command returns information about a given block's tree state, particularly focusing on the Sprout and Sapling commitment trees. This command is valuable for developers and researchers analyzing the state of the shielded transaction components of the blockchain.

## Description
When provided with a block hash or height, this command returns detailed information about the Sprout and Sapling commitment trees at that point in the blockchain. These commitment trees are critical data structures for managing shielded transactions in the Verus/Zcash protocol. The information includes hash references to blocks with more detailed information, as well as root values and state information for both the Sprout and Sapling trees.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/ZK-SNARK  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hash\|height | string\|numeric | Yes | N/A | The block hash or height. Height can be negative where -1 is the last known valid block |

## Results
The command returns a JSON object containing the following information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| hash | string | Hex block hash |
| height | numeric | Block height |
| sprout | object | Information about the Sprout commitment tree |
| sapling | object | Information about the Sapling commitment tree |

Both the `sprout` and `sapling` objects contain:

| Field | Type | Description |
|-------|------|-------------|
| skipHash | string | Hash of most recent block with more information |
| commitments | object | Commitment tree data |

The `commitments` object contains:

| Field | Type | Description |
|-------|------|-------------|
| finalRoot | string | The root hash of the commitment tree (hex) |
| finalState | string | The state of the commitment tree (hex) |

## Examples

### Example 1: Get tree state by block hash

**Command:**
```
verus z_gettreestate "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5"
```

**Sample Output:**
```json
{
  "hash": "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5",
  "height": 12800,
  "sprout": {
    "skipHash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    "commitments": {
      "finalRoot": "0dc2e9e02b98cf5a4181cf140f86f3518243b3f5dfc22c7908ea68796f5f6e37",
      "finalState": "3d04d0ec1a0d0b5d39b25a0ad832cc7d5305e5ded391f6c6278ebe5b3aa7c794"
    }
  },
  "sapling": {
    "skipHash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34",
    "commitments": {
      "finalRoot": "5bdf0072adf25e0d9e0a35983a1f8383bf0c66d73ad8a7e305a09df03fb730b4",
      "finalState": "9e8b614c65c7a414b3b8402cc0d3b16a83243e8197aab4a6e3c751e7bd16f2ad"
    }
  }
}
```

### Example 2: Get tree state by block height

**Command:**
```
verus z_gettreestate 12800
```

**Sample Output:**
The output would be the same as in Example 1 if block 12800 has the same hash.

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_gettreestate", "params": ["00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hash": "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5",
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

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getblock`: Returns detailed information about a block
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `z_viewtransaction`: Get detailed shielded information about in-wallet transaction
- `z_getnotescount`: Returns the number of sprout and sapling notes in the wallet
