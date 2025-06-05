# Verus RPC Command: verifyhash

## Purpose
The `verifyhash` command is used to verify that a hash (of a message or file) was signed by the private key associated with a specific Verus transparent address or identity.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `verifyhash` command verifies a signature against a hexadecimal hash and a specified Verus transparent address or identity. This command is particularly useful when you already have the hash of a message or file and want to verify its signature without needing to recalculate the hash. It provides a more direct verification method compared to `verifymessage` or `verifyfile` when the hash is already known. The command supports an option to validate signatures based on either the identity state at the time of signing or the latest identity state.

**Command Type**: Cryptographic  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address or identity` | string | Yes | The transparent address or identity that signed the data. |
| `signature` | string | Yes | The signature provided by the signer in base 64 encoding (see signmessage/signfile). |
| `hexhash` | string | Yes | Hash of the message or file that was signed. |
| `checklatest` | boolean | No | If true, checks signature validity based on latest identity. Defaults to false, which determines validity of signing height stored in signature. |

## Results
The command returns a boolean value indicating whether the signature is verified or not.

**Return Type**: Boolean

## Sample Examples

### Sample Example 1: Verify Hash Signature from a Transparent Address

**Command:**
```
verus verifyhash "RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z" "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE=" "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
```

**Sample Result:**
```
true
```

### Sample Example 2: Verify Hash Signature from an Identity

**Command:**
```
verus verifyhash "MyIdentity@" "IPvC5WnH0f+9XzMU3Rda5UxFKtFcVoDc4nPyJ4Rk2I7JM1MuLe/8mQfxf9i+THJ7K8Z1y4WMUCqFMfPeYM+1qVU=" "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2"
```

**Sample Result:**
```
true
```

### Sample Example 3: Verify Hash Signature Based on Latest Identity State

**Command:**
```
verus verifyhash "BusinessID@" "L8Kp92dOPR0FQaH1j7p+e4fg8JhbRFmTi0wiOiE/ImV3ZXw5UJHD8vBQd1OUJBZjSLB0J9rTc35TqJHNuZ2aJkK=" "e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0" true
```

**Sample Result:**
```
true
```

### Sample Example 4: Failed Verification

**Command:**
```
verus verifyhash "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" "IK7GtR4dX9jJm3qFeUbN82Lp5kRzCvXaW1H6oM9sDyZQnP0y7cBtEhTwS+lY2gfOP836xVi1LdXm4r9zeIutMhA=" "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8"
```

**Sample Result:**
```
false
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifyhash", "params": ["RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z", "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE=", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Sample Result:**
```json
{
  "result": true,
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

2. **Potential Error - Invalid Signature Format:**
   ```
   error code: -5
   error message:
   Invalid base64 signature format
   ```

3. **Potential Error - Invalid Hash Format:**
   ```
   error code: -8
   error message:
   Invalid hex hash format
   ```

4. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```

5. **Potential Error - Incorrect Hash Length:**
   ```
   error code: -8
   error message:
   Hash must be 32 bytes (64 hex characters)
   ```
