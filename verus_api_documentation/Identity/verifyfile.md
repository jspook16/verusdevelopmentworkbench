# Verus RPC Command: verifyfile

## Purpose
The `verifyfile` command is used to verify that a file was signed by the private key associated with a specific Verus transparent address or identity.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `verifyfile` command verifies a signature for a file against a specified Verus transparent address or identity. It checks whether the signature was created using the private key associated with the given address or identity. This command allows for authentication and verification of file integrity. It supports an option to validate signatures based on either the identity state at the time of signing or the latest identity state.

**Command Type**: Cryptographic  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address or identity` | string | Yes | The transparent address or identity that signed the file. |
| `signature` | string | Yes | The signature provided by the signer in base 64 encoding (see signfile). |
| `filepath/filename` | string | Yes | The file, which must be available locally to the daemon and that was signed. |
| `checklatest` | boolean | No | If true, checks signature validity based on latest identity. Defaults to false, which determines validity of signing height stored in signature. |

## Results
The command returns a boolean value indicating whether the signature is verified or not.

**Return Type**: Boolean

## Sample Examples

### Sample Example 1: Verify File Signature from a Transparent Address

**Command:**
```
verus verifyfile "RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z" "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE=" "documents/important.pdf"
```

**Sample Result:**
```
true
```

### Sample Example 2: Verify File Signature from an Identity

**Command:**
```
verus verifyfile "MyIdentity@" "IPvC5WnH0f+9XzMU3Rda5UxFKtFcVoDc4nPyJ4Rk2I7JM1MuLe/8mQfxf9i+THJ7K8Z1y4WMUCqFMfPeYM+1qVU=" "contracts/agreement.txt"
```

**Sample Result:**
```
true
```

### Sample Example 3: Verify File Signature Based on Latest Identity State

**Command:**
```
verus verifyfile "BusinessID@" "L8Kp92dOPR0FQaH1j7p+e4fg8JhbRFmTi0wiOiE/ImV3ZXw5UJHD8vBQd1OUJBZjSLB0J9rTc35TqJHNuZ2aJkK=" "project/proposal.docx" true
```

**Sample Result:**
```
true
```

### Sample Example 4: Failed Verification

**Command:**
```
verus verifyfile "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" "IK7GtR4dX9jJm3qFeUbN82Lp5kRzCvXaW1H6oM9sDyZQnP0y7cBtEhTwS+lY2gfOP836xVi1LdXm4r9zeIutMhA=" "shared/modified-document.txt"
```

**Sample Result:**
```
false
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifyfile", "params": ["RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z", "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE=", "filepath/filename"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

1. **Potential Error - File Not Found:**
   ```
   error code: -8
   error message:
   File not found: filepath/filename
   ```

2. **Potential Error - Invalid Address or Identity:**
   ```
   error code: -5
   error message:
   Invalid Verus address or identity
   ```

3. **Potential Error - Invalid Signature Format:**
   ```
   error code: -5
   error message:
   Invalid base64 signature format
   ```

4. **Potential Error - Insufficient Permissions:**
   ```
   error code: -8
   error message:
   Cannot open file (check permissions)
   ```

5. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```
