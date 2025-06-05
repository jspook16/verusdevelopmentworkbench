# Verus RPC Command: signmessage

## Purpose
The `signmessage` command is used to create a cryptographic signature for a message using the private key of a transparent address or the authorities present in the wallet for an identity.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `signmessage` command signs a provided message with the private key associated with a specified transparent address or identity. The command returns both the hash of the message and the signature. This functionality enables verifiable proof that a particular message was signed by the controller of a specific address or identity, which is useful for authentication, verification, and non-repudiation purposes.

**Command Type**: Cryptographic  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with access to the private key

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address or identity` | string | Yes | The transparent address or identity to use for signing. |
| `message` | string | Yes | The message to create a signature of. |
| `currentsig` | string | No | The current signature of the message encoded in base 64 if multisig ID. |

## Results
The command returns a JSON object containing the hash and signature.

**Return Type**: Object

The result object contains:

| Field | Type | Description |
|-------|------|-------------|
| `hash` | hex string | The hash of the message (SHA256, NOT SHA256D). |
| `signature` | base64 string | The aggregate signature of the message encoded in base 64 if all or partial signing successful. |

## Sample Examples

### Sample Example 1: Sign a Message with a Transparent Address

**Command:**
```
verus signmessage "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" "This is a verified message from RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"
```

**Sample Result:**
```json
{
  "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "signature": "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="
}
```

### Sample Example 2: Sign a Message with an Identity

**Command:**
```
verus signmessage "MyIdentity@" "Agreement to terms and conditions for the project dated April 30, 2025"
```

**Sample Result:**
```json
{
  "hash": "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
  "signature": "IPvC5WnH0f+9XzMU3Rda5UxFKtFcVoDc4nPyJ4Rk2I7JM1MuLe/8mQfxf9i+THJ7K8Z1y4WMUCqFMfPeYM+1qVU="
}
```

### Sample Example 3: Add to Multi-Signature for a Message

**Command:**
```
verus signmessage "MultiSigID@" "Approved transaction #12345" "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="
```

**Sample Result:**
```json
{
  "hash": "e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  "signature": "L8Kp92dOPR0FQaH1j7p+e4fg8JhbRFmTi0wiOiE/ImV3ZXw5UJHD8vBQd1OUJBZjSLB0J9rTc35TqJHNuZ2aJkK="
}
```

### Sample Example 4: Sign After Unlocking Wallet

**Command (Sequence):**
```
verus walletpassphrase "mypassphrase" 30
verus signmessage "RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z" "Confirming ownership of this address"
```

**Sample Result:**
```json
{
  "hash": "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
  "signature": "IK7GtR4dX9jJm3qFeUbN82Lp5kRzCvXaW1H6oM9sDyZQnP0y7cBtEhTwS+lY2gfOP836xVi1LdXm4r9zeIutMhA="
}
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "signmessage", "params": ["RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", "my message"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Sample Result:**
```json
{
  "result": {
    "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "signature": "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Address or Identity:**
   ```
   error code: -5
   error message:
   Invalid Verus address or identity
   ```

2. **Potential Error - Address Not in Wallet:**
   ```
   error code: -5
   error message:
   Address not found in wallet
   ```

3. **Potential Error - Invalid Signature Format:**
   ```
   error code: -5
   error message:
   Invalid base64 signature format
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

5. **Potential Error - Empty Message:**
   ```
   error code: -8
   error message:
   Empty message not allowed
   ```
