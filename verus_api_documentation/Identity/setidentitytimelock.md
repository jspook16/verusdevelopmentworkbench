# Verus RPC Command: setidentitytimelock

## Purpose
The `setidentitytimelock` command enables timelocking and unlocking of funds access for an on-chain VerusID, providing a security mechanism to control when an identity can access its funds.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `setidentitytimelock` command implements a time-based security feature for VerusIDs that controls when an identity can access and spend its funds on the blockchain. This command offers two different approaches to timelocking: absolute block height unlocking and unlock delay periods. This security feature is specific to the blockchain on which it is set and does not affect the same identity on other chains if it has been exported. Services that support VerusID authentication may also recognize these timelocks to prevent fund transfers when an ID is locked.

When a VerusID is timelocked, its controlled addresses can still receive funds (e.g., currency, tokens). However, any outgoing transactions from these addresses, or operations requiring control of the ID (such as updating the ID or spending its funds), are prevented until the timelock conditions are met and the ID is unlocked. This ensures that while assets can be accrued, they cannot be moved or spent by the ID during the locked period.

**Command Type**: Transaction  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with control of the identity

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id@` | string | Yes | The VerusID to set the timelock for. |
| `timelock_options` | JSON object | Yes | JSON object containing either `unlockatblock` or `setunlockdelay` (not both). |
| `timelock_options.unlockatblock` | number | One of these is required | Unlock at an absolute block height; countdown starts when mined into a block. |
| `timelock_options.setunlockdelay` | number | One of these is required | Delay this many blocks after unlock request to unlock; can only be circumvented by revoke/recover. |
| `returntx` | boolean | No | Defaults to false and transaction is sent; if true, transaction is signed by this wallet and returned. |
| `feeoffer` | number | No | Non-standard fee amount to pay for the transaction. |
| `sourceoffunds` | string | No | Transparent or private address to source all funds for fees to preserve privacy of the identity. |

## Results
The command returns a hexadecimal string, which is either:
- The transaction ID (txid) if `returntx` is false
- The hex serialized transaction if `returntx` is true

**Return Type**: String (hex)

If `returntx` is true, the transaction will not have been submitted and must be sent with "sendrawtransaction" after any necessary signatures are applied in the case of multisig.

## Sample Examples

### Sample Example 1: Set Absolute Block Height Unlock

**Command:**
```
verus setidentitytimelock "MyIdentity@" '{"unlockatblock":1250000}'
```

**Sample Result:**
```
"a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
```

### Sample Example 2: Set Unlock Delay Period

**Command:**
```
verus setidentitytimelock "BusinessID@" '{"setunlockdelay":144}'
```

**Sample Result:**
```
"c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2"
```

### Sample Example 3: Return Transaction for Multi-signature

**Command:**
```
verus setidentitytimelock "MultiSigID@" '{"unlockatblock":1250000}' true
```

**Sample Result:**
```
"0100000001c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d0000000000ffffffff0100e1f505000000007500..."
```

### Sample Example 4: Set Timelock with Custom Fee and Source of Funds

**Command:**
```
verus setidentitytimelock "PrivateID@" '{"setunlockdelay":72}' false 0.001 "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"
```

**Sample Result:**
```
"e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setidentitytimelock", "params": ["MyIdentity@", {"unlockatblock":1250000}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Sample Result:**
```json
{
  "result": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Identity:**
   ```
   error code: -5
   error message:
   Invalid identity or identity not found
   ```

2. **Potential Error - Invalid Parameter Format:**
   ```
   error code: -8
   error message:
   Both unlockatblock and setunlockdelay parameters cannot be specified
   ```

3. **Potential Error - No Parameters Specified:**
   ```
   error code: -8
   error message:
   Either unlockatblock or setunlockdelay parameters must be specified
   ```

4. **Potential Error - Invalid Block Height:**
   ```
   error code: -8
   error message:
   Block height must be greater than current height
   ```

5. **Potential Error - No Control of Identity:**
   ```
   error code: -5
   error message:
   Cannot update identity. Not primary or recovery authority
   ```

6. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

7. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```
