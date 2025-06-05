# Verus RPC Command: submitblock

## Purpose
The `submitblock` command attempts to submit a new block to the Verus network. This command is primarily used by mining software to submit solved blocks to the blockchain.

## Description
When provided with a hex-encoded block data, this command validates the block and broadcasts it to the network if valid. The command follows the BIP 0022 specification for block submission. This is a critical component of the mining process, allowing miners to submit their solutions and potentially earn block rewards.

**Command Type**: Action/Write  
**Protocol Level**: Mining/Network  
**Access Requirement**: No special requirements, but typically used by mining software

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hexdata | string | Yes | N/A | The hex-encoded block data to submit |
| jsonparametersobject | string | No | N/A | Object of optional parameters (currently ignored) |

The optional `jsonparametersobject` may contain:
- `workid`: (string) If the server provided a workid, it MUST be included with submissions

## Results
The command returns one of several string responses indicating the status of the submission:

**Return Type**: String or Null

Possible return values:
- `duplicate`: Node already has a valid copy of the block
- `duplicate-invalid`: Node already has the block, but it is invalid
- `duplicate-inconclusive`: Node already has the block but has not validated it
- `inconclusive`: Node has not validated the block, it may not be on the node's current best chain
- `rejected`: Block was rejected as invalid
- No response (null): Block accepted

## Examples

### Example 1: Submit a new block

**Command:**
```
verus submitblock "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c0101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000"
```

**Sample Output:**
```
null
```

### Example 2: Submit a block with workid

**Command:**
```
verus submitblock "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c0101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000" '{"workid": "12345"}'
```

**Sample Output:**
```
null
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "submitblock", "params": ["0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c0101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format (if rejected):**
```json
{
  "result": "rejected",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Block Data:**
   ```
   error code: -22
   error message:
   Block decode failed
   ```

2. **Potential Error - Invalid Hex Format:**
   ```
   error code: -8
   error message:
   Invalid block data: hex string expected
   ```

3. **Potential Error - Block Rejected:**
   Instead of an error code, returns "rejected" as the result

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getblocktemplate`: Gets data needed to construct a block to work on
- `getmininginfo`: Returns mining-related information
- `getnetworksolps`: Returns the estimated network solutions per second
- `prioritisetransaction`: Accepts the transaction into mined blocks at a higher (or lower) priority
