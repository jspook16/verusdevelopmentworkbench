# Verus RPC Command: signrawtransaction

## Purpose
The `signrawtransaction` command signs inputs for a raw transaction (serialized, hex-encoded), adding the cryptographic signatures necessary for the transaction to be valid on the blockchain. This command is a crucial step in the manual transaction workflow, transforming a constructed transaction into one that can be verified and accepted by the network. It provides granular control over the signing process, allowing specification of which inputs to sign, which private keys to use, and what signature hash type to employ, making it essential for complex transaction scenarios like multi-signature arrangements, offline signing, and custom transaction flows.

## Description
When provided with a hex-encoded raw transaction, this command attempts to sign the transaction inputs using the private keys available in the wallet. The signing process adds cryptographic proof that the spender owns the coins being spent, which is necessary for the transaction to be valid.

The command offers significant flexibility through its optional parameters:
- You can provide specific information about previous transactions that this transaction depends on
- You can specify exactly which private keys to use for signing (allowing for selective or offline signing)
- You can choose a signature hash type that determines what parts of the transaction are committed to by the signature

After signing, the command returns the resulting transaction in hex-encoded format along with information about whether the transaction has a complete set of signatures. If signing is not successful for all inputs, it also returns error information that can help diagnose the issues.

This command is typically used after creating a transaction with `createrawtransaction` and potentially funding it with `fundrawtransaction`, and before broadcasting it with `sendrawtransaction`.

**Command Type**: Action/Transaction  
**Protocol Level**: Transaction  
**Access Requirement**: Access to private keys (either in wallet or explicitly provided)

## Arguments
The command accepts five arguments, one required and four optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hexstring | string | Yes | N/A | The transaction hex string to sign |
| prevtxs | array | No | null | An array of previous transaction outputs that this transaction depends on |
| privatekeys | array | No | null | An array of base58-encoded private keys for signing |
| sighashtype | string | No | "ALL" | The signature hash type |
| branchid | string | No | N/A | The hex representation of the consensus branch id to sign with |

The `prevtxs` array contains objects with the following fields:
- `txid` (string, required): The transaction id
- `vout` (numeric, required): The output number
- `scriptPubKey` (string, required): The output script
- `redeemScript` (string, required for P2SH): The redeem script
- `amount` (numeric, required): The amount spent

The `sighashtype` can be one of:
- `"ALL"`: Sign all inputs and outputs
- `"NONE"`: Sign all inputs, but no outputs
- `"SINGLE"`: Sign all inputs and only the output with the same index as the input
- `"ALL|ANYONECANPAY"`: Sign one input and all outputs
- `"NONE|ANYONECANPAY"`: Sign one input and no outputs
- `"SINGLE|ANYONECANPAY"`: Sign one input and the output with the same index

## Results
The command returns a JSON object with information about the signing process:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| hex | string | The hex-encoded raw transaction with signature(s) |
| complete | boolean | If the transaction has a complete set of signatures |
| errors | array | Script verification errors (if there are any) |

Each error object in the `errors` array contains:

| Field | Type | Description |
|-------|------|-------------|
| txid | string | The hash of the referenced, previous transaction |
| vout | numeric | The index of the output to spent and used as input |
| scriptSig | string | The hex-encoded signature script |
| sequence | numeric | Script sequence number |
| error | string | Verification or signing error related to the input |

## Examples

### Example 1: Sign a transaction with wallet keys

**Command:**
```
verus signrawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000"
```

**Sample Output:**
```json
{
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
  "complete": true
}
```

### Example 2: Sign a transaction with specific transaction info and private keys

**Command:**
```
verus signrawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000" '[{"txid":"1752213d598e5fd2d4e4a79b8a9e5bb350d5d276cb7a3918610f5e2c5fdcb0e4","vout":0,"scriptPubKey":"76a9142a3a6886d98776d0197611e5328ba8806c3739db88ac","amount":1.0}]' '["5JZTNPqKmAHJxDL1xtqmRQMvTYi97ToUQJ8U4Vopjz1nwXHG8H3"]'
```

**Sample Output:**
```json
{
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
  "complete": true
}
```

### Example 3: Sign a transaction with a specific signature hash type

**Command:**
```
verus signrawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000" '[]' '[]' "SINGLE|ANYONECANPAY"
```

**Sample Output:**
```json
{
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810300ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
  "complete": true
}
```

### Example 4: Example with incomplete signing and errors

**Command:**
```
verus signrawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000" '[{"txid":"1752213d598e5fd2d4e4a79b8a9e5bb350d5d276cb7a3918610f5e2c5fdcb0e4","vout":0,"scriptPubKey":"76a9142a3a6886d98776d0197611e5328ba8806c3739db88ac","amount":1.0}]'
```

**Sample Output:**
```json
{
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
  "complete": false,
  "errors": [
    {
      "txid": "1752213d598e5fd2d4e4a79b8a9e5bb350d5d276cb7a3918610f5e2c5fdcb0e4",
      "vout": 0,
      "scriptSig": "",
      "sequence": 4294967295,
      "error": "Private key not available"
    }
  ]
}
```

### Example 5: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "signrawtransaction", "params": ["0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
    "complete": true
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction Format:**
   ```
   error code: -22
   error message:
   TX decode failed
   ```

2. **Potential Error - Invalid Private Key Format:**
   ```
   error code: -5
   error message:
   Invalid private key
   ```

3. **Potential Error - Missing Previous Transaction Information:**
   ```
   error code: -8
   error message:
   Missing amount for prevtx
   ```

4. **Potential Error - Invalid Signature Hash Type:**
   ```
   error code: -8
   error message:
   Invalid sighash param
   ```

5. **Potential Error - Locked Wallet:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

6. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `createrawtransaction`: Create a raw transaction spending given inputs
- `fundrawtransaction`: Add inputs to a transaction until it has enough value
- `sendrawtransaction`: Submit a raw transaction to the network
- `decoderawtransaction`: Return a JSON object representing the serialized transaction
- `walletpassphrase`: Temporarily decrypt the wallet for transaction signing
