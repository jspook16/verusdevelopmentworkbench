# Verus RPC Command: migrate_converttoexport

## Purpose
The `migrate_converttoexport` command converts a raw transaction into a cross-chain export transaction. This command is a crucial part of the Verus cross-chain transfer mechanism, enabling assets to be moved between different blockchains in the Verus ecosystem.

## Description
This command transforms a standard raw transaction into a cross-chain export transaction by adding the necessary export-specific data. After conversion, the transaction needs to be funded, signed, and then processed on the destination chain to complete the cross-chain transfer. This is one of several steps in the cross-chain transfer workflow.

**Command Type**: Action/Transform  
**Protocol Level**: Cross-Chain  
**Access Requirement**: No special requirements

## Arguments
The command accepts three required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| rawTx | string | Yes | N/A | The raw transaction to convert to an export transaction |
| dest_symbol | string | Yes | N/A | The symbol of the destination chain (target blockchain) |
| export_amount | numeric | Yes | N/A | The amount to export to the destination chain |

## Results
The command returns the converted export transaction as a raw transaction hex string. This transaction will need to be further processed before it can be broadcast to the network.

**Return Type**: String

## Examples

### Example 1: Convert a raw transaction to an export transaction

**Command:**
```
verus migrate_converttoexport "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0100e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af038001e0a10001ffffffff00000000000000" "VRSC" 1.0
```

**Expected Output Format:**
```
0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0300e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af038001e0a10001a7dbb0e25245df2177ffc14e1f7589a901161ce03cf4f4ab6c92629e0c9cbbf0a4e4a79dd05f8262404aeed85977d0460a56899857a8ca271295950d76e32fa6a0e39dd4a836a84b8ede292d889e6ed3485969ddf77954e83b388e0ea84640456e9aacd8066154b685cc8ec909e5125be5fa7c748d4bd81b7f41f5fc623c0a36b00000000000000002c6a2ac7add5819ab4b085aafae5d19526e41f42010ac207ec31dfaab96af0add1bc839672143d2fb01000000000000
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "migrate_converttoexport", "params": ["0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0100e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af038001e0a10001ffffffff00000000000000", "VRSC", 1.0] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0300e1f50500000000302ea22c8020ab5a9776cae19e2d3a407e0c7a51219b33ebc2051e413f9c34ac7062e860ccf74087e0a60100af038001e0a10001a7dbb0e25245df2177ffc14e1f7589a901161ce03cf4f4ab6c92629e0c9cbbf0a4e4a79dd05f8262404aeed85977d0460a56899857a8ca271295950d76e32fa6a0e39dd4a836a84b8ede292d889e6ed3485969ddf77954e83b388e0ea84640456e9aacd8066154b685cc8ec909e5125be5fa7c748d4bd81b7f41f5fc623c0a36b00000000000000002c6a2ac7add5819ab4b085aafae5d19526e41f42010ac207ec31dfaab96af0add1bc839672143d2fb01000000000000",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameters:**
   ```
   error code: -1
   error message:
   migrate_converttoexport rawTx dest_symbol export_amount
   ```

2. **Potential Error - Invalid Raw Transaction:**
   ```
   error code: -8
   error message:
   Invalid raw transaction format
   ```

3. **Potential Error - Invalid Destination Symbol:**
   ```
   error code: -8
   error message:
   Invalid destination chain symbol
   ```

4. **Potential Error - Invalid Export Amount:**
   ```
   error code: -8
   error message:
   Export amount must be a positive number
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `migrate_createimporttransaction`: Create an import transaction from a burn transaction
- `migrate_completeimporttransaction`: Complete a cross-chain import transaction
- `createrawtransaction`: Create a raw transaction
- `fundrawtransaction`: Fund a raw transaction
- `signrawtransaction`: Sign a raw transaction
