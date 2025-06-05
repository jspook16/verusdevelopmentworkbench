# Verus RPC Command: migrate_completeimporttransaction

## Purpose
The `migrate_completeimporttransaction` command takes a cross-chain import transaction with proof generated on an asset chain and extends the proof to the target chain's proof root. This command is essential for finalizing cross-chain asset transfers in the Verus ecosystem.

## Description
As part of the Verus cross-chain transfer process, this command completes a cross-chain import transaction by extending the proof originally generated on the source chain to include validation against the target chain's proof root. This ensures the cryptographic integrity of the cross-chain transfer and allows the import transaction to be properly validated on the target chain.

**Command Type**: Action/Write  
**Protocol Level**: Cross-Chain  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| importTx | string | Yes | N/A | The cross-chain import transaction with proof generated on the asset chain |

## Results
The command returns the completed import transaction with an extended proof that validates against the target chain's proof root. The exact format of the returned data is not specified in the limited documentation.

**Return Type**: Unspecified (likely String or Object)

## Examples

### Example 1: Complete an import transaction

**Command:**
```
verus migrate_completeimporttransaction 0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0300e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af03800111a10001a7dbb0e25245df2177ffc14e1f7589a901161ce03cf4f4ab6c92629e0c9cbbf0a4e4a79dd05f8262404aeed85977d0460a56899857a8ca271295950d76e32fa6a0e39dd4a836a84b8ede292d889e6ed3485969ddf77954e83b388e0ea84640456e9aacd8066154b685cc8ec909e5125be5fa7c748d4bd81b7f41f5fc623c0a36b00000000000000002c6a2ac7add5819ab4b085aafae5d19526e41f42010ac207ec31dfaab96af0add1bc839672143d2fb01000000000000
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include the completed import transaction with extended proof data.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "migrate_completeimporttransaction", "params": ["0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0300e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af03800111a10001a7dbb0e25245df2177ffc14e1f7589a901161ce03cf4f4ab6c92629e0c9cbbf0a4e4a79dd05f8262404aeed85977d0460a56899857a8ca271295950d76e32fa6a0e39dd4a836a84b8ede292d889e6ed3485969ddf77954e83b388e0ea84640456e9aacd8066154b685cc8ec909e5125be5fa7c748d4bd81b7f41f5fc623c0a36b00000000000000002c6a2ac7add5819ab4b085aafae5d19526e41f42010ac207ec31dfaab96af0add1bc839672143d2fb01000000000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "...",  // Completed import transaction with extended proof
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameter:**
   ```
   error code: -1
   error message:
   Takes a cross chain import tx with proof generated on assetchain and extends proof to target chain proof root
   ```

2. **Potential Error - Invalid Import Transaction:**
   ```
   error code: -8
   error message:
   Invalid import transaction format
   ```

3. **Potential Error - Proof Extension Failed:**
   ```
   error code: -5
   error message:
   Failed to extend proof to target chain
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `migrate_converttoexport`: Convert a raw transaction to a cross-chain export
- `migrate_createimporttransaction`: Create an import transaction from a burn transaction
- `assetchainproof`: Generate a proof for a transaction on an asset chain
- `calc_MoM`: Calculate Merkle of Merkles for a range of blocks
- `MoMoMdata`: Retrieve Merkle of Merkle of Merkles data
