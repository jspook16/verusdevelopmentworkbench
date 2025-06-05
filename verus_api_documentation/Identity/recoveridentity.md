# Verus RPC Command: recoveridentity

## Purpose
The `recoveridentity` command is used to recover a Verus identity using the recovery authority, allowing restoration of identity control when primary access has been lost or compromised.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `recoveridentity` command enables the recovery of a Verus identity by using the recovery authority designated for that identity. This process allows an identity to be recovered when the primary keys have been lost, stolen, or compromised. Recovery can be performed either by the wallet that controls the recovery authority or by using a tokenized ID control token. This command is a critical security feature of the Verus identity system, providing a mechanism to regain control of identities in emergency situations.

**Command Type**: Transaction  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with control of the recovery authority for the identity

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `jsonidentity` | object | Yes | N/A | JSON representation of the identity to recover |
| `returntx` | boolean | No | false | If true, returns transaction for additional signatures rather than committing it |
| `tokenrecover` | boolean | No | false | If true, the tokenized ID control token (if one exists) will be used to recover |
| `feeoffer` | number | No | standard fee | Non-standard fee amount to pay for the transaction |
| `sourceoffunds` | string | No | N/A | Transparent or private address to source all funds for fees to preserve privacy of the identity |

## Results
The command returns a transaction ID or a hex-encoded transaction, depending on the `returntx` parameter.

**Return Type**: String (hex)

If `returntx` is false (default), the command returns the transaction ID of the recovery transaction once it has been broadcast to the network.

If `returntx` is true, the command returns the hex-encoded transaction, which can be signed by additional parties if required (e.g., in a multi-signature setup) before being broadcast using `sendrawtransaction`.

## Sample Examples

### Sample Example 1: Basic Identity Recovery

**Command:**
```
verus recoveridentity '{"name":"MyIdentity","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}'
```

**Expected Format:**
```
"7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
```

### Sample Example 2: Return Transaction for Multi-Signature

**Command:**
```
verus recoveridentity '{"name":"BusinessID","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX","RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"],"minimumsignatures":2,"revocationauthority":"iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs","recoveryauthority":"iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"}' true
```

**Expected Format:**
```
"0100000001c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d0000000000ffffffff0100e1f505000000007500..."
```

### Sample Example 3: Use Tokenized ID Control for Recovery

**Command:**
```
verus recoveridentity '{"name":"TokenizedID","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs"}' false true
```

**Expected Format:**
```
"8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
```

### Sample Example 4: Recovery with Custom Fee and Source of Funds

**Command:**
```
verus recoveridentity '{"name":"PrivateID","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}' false false 0.001 "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"
```

**Expected Format:**
```
"e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "recoveridentity", "params": [{"name":"MyIdentity","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```

2. **Potential Error - Not Recovery Authority:**
   ```
   error code: -5
   error message:
   Cannot recover identity. Not recovery authority
   ```

3. **Potential Error - Invalid Identity Format:**
   ```
   error code: -8
   error message:
   Invalid identity object format
   ```

4. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```