# Verus RPC Command: migrate_createimporttransaction

## Purpose
The `migrate_createimporttransaction` command creates an import transaction given a burn transaction and the corresponding payouts. This command is an essential part of the cross-chain asset migration process in the Verus ecosystem.

## Description
As part of the Verus cross-chain transfer workflow, this command takes a burn transaction (export transaction) from a source chain and specified payout parameters, then creates a corresponding import transaction for the destination chain. The import transaction includes the necessary proof data to verify the validity of the cross-chain transfer.

**Command Type**: Action/Create  
**Protocol Level**: Cross-Chain  
**Access Requirement**: No special requirements

## Arguments
The command accepts two required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| burnTx | string | Yes | N/A | The burn (export) transaction in hex-encoded format |
| payouts | string | Yes | N/A | The corresponding payouts, hex-encoded |

## Results
The command returns a newly created import transaction that can be submitted to the destination chain to complete the cross-chain transfer.

**Return Type**: String

## Examples

### Example 1: Create an import transaction

**Command:**
```
verus migrate_createimporttransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0300e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af03800111a10001a7dbb0e25245df2177ffc14e1f7589a901161ce03cf4f4ab6c92629e0c9cbbf0a4e4a79dd05f8262404aeed85977d0460a56899857a8ca271295950d76e32fa6a0e39dd4a836a84b8ede292d889e6ed3485969ddf77954e83b388e0ea84640456e9aacd8066154b685cc8ec909e5125be5fa7c748d4bd81b7f41f5fc623c0a36b00000000000000002c6a2ac7add5819ab4b085aafae5d19526e41f42010ac207ec31dfaab96af0add1bc839672143d2fb01000000000000" "0100e1f5050000000023210217a6aa6c0fe017f9e469c3c00de5b3aa164ca410e632d1c04169fd7040e20e06ac00000000"
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely be a hex-encoded transaction string representing the created import transaction.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "migrate_createimporttransaction", "params": ["0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0300e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af03800111a10001a7dbb0e25245df2177ffc14e1f7589a901161ce03cf4f4ab6c92629e0c9cbbf0a4e4a79dd05f8262404aeed85977d0460a56899857a8ca271295950d76e32fa6a0e39dd4a836a84b8ede292d889e6ed3485969ddf77954e83b388e0ea84640456e9aacd8066154b685cc8ec909e5125be5fa7c748d4bd81b7f41f5fc623c0a36b00000000000000002c6a2ac7add5819ab4b085aafae5d19526e41f42010ac207ec31dfaab96af0add1bc839672143d2fb01000000000000", "0100e1f5050000000023210217a6aa6c0fe017f9e469c3c00de5b3aa164ca410e632d1c04169fd7040e20e06ac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "...",  // Hex-encoded import transaction
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameters:**
   ```
   error code: -1
   error message:
   Create an importTx given a burnTx and the corresponding payouts, hex encoded
   ```

2. **Potential Error - Invalid Burn Transaction:**
   ```
   error code: -8
   error message:
   Invalid burn transaction format
   ```

3. **Potential Error - Invalid Payouts:**
   ```
   error code: -8
   error message:
   Invalid payouts format
   ```

4. **Potential Error - Burn Transaction Verification Failed:**
   ```
   error code: -5
   error message:
   Failed to verify burn transaction
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `migrate_converttoexport`: Convert a raw transaction to a cross-chain export
- `migrate_completeimporttransaction`: Complete a cross-chain import transaction
- `assetchainproof`: Generate a proof for a transaction on an asset chain
- `calc_MoM`: Calculate Merkle of Merkles for a range of blocks
