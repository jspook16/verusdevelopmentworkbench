# Verus RPC Command: verifymessage

## Purpose
The `verifymessage` command is used to verify that a message was signed by the private key associated with a specific Verus transparent address or identity.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `verifymessage` command verifies a signature for a message against a specified Verus transparent address or identity. It determines whether the signature was created using the private key associated with the given address or identity. This command is essential for authentication and verification purposes in various use cases, from simple identity verification to complex multi-signature agreements. It supports an option to validate signatures based on either the identity state at the time of signing or the latest identity state.

**Command Type**: Cryptographic  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address or identity` | string | Yes | The transparent address or identity that signed the message. |
| `signature` | string | Yes | The signature provided by the signer in base 64 encoding (see signmessage). |
| `message` | string | Yes | The message that was signed. |
| `checklatest` | boolean | No | If true, checks signature validity based on latest identity. Defaults to false, which determines validity of signing height stored in signature. |

## Results
The command returns a boolean value indicating whether the signature is verified or not.

**Return Type**: Boolean

## Sample Examples

### Sample Example 1: Verify Message Signature from a Transparent Address

**Command:**
```
verus verifymessage "RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z" "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE=" "Confirming ownership of this address"
```

**Sample Result:**
```
true
```

### Sample Example 2: Verify Message Signature from an Identity

**Command:**
```
verus verifymessage "MyIdentity@" "IPvC5WnH0f+9XzMU3Rda5UxFKtFcVoDc4nPyJ4Rk2I7JM1MuLe/8mQfxf9i+THJ7K8Z1y4WMUCqFMfPeYM+1qVU=" "Agreement to terms and conditions for the project dated April 30, 2025"
```

**Sample Result:**
```
true
```

### Sample Example 3: Verify Message Signature Based on Latest Identity State

**Command:**
```
verus verifymessage "BusinessID@" "L8Kp92dOPR0FQaH1j7p+e4fg8JhbRFmTi0wiOiE/ImV3ZXw5UJHD8vBQd1OUJBZjSLB0J9rTc35TqJHNuZ2aJkK=" "Approved transaction #12345" true
```

**Sample Result:**
```
true
```

### Sample Example 4: Failed Verification

**Command:**
```
verus verifymessage "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" "IK7GtR4dX9jJm3qFeUbN82Lp5kRzCvXaW1H6oM9sDyZQnP0y7cBtEhTwS+lY2gfOP836xVi1LdXm4r9zeIutMhA=" "This message was tampered with"
```

**Sample Result:**
```
false
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifymessage", "params": ["RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z", "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE=", "my message"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

3. **Potential Error - Empty Message:**
   ```
   error code: -8
   error message:
   Empty message not allowed
   ```

4. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```

5. **Potential Error - Malformed Parameters:**
   ```
   error code: -8
   error message:
   Malformed parameters
   ```
