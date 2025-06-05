# Verus RPC Command: verifysignature

## Purpose
The `verifysignature` command is a versatile verification tool that checks if a signature is valid for various types of content (files, messages, or hashes) against a specified address or identity.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `verifysignature` command provides an advanced verification interface that supports multiple data formats, hash types, and additional verification parameters. Unlike the more specialized verification commands, `verifysignature` offers more flexibility by allowing specification of hash types, bound hashes, and VDXF keys. This makes it particularly useful for complex verification scenarios involving smart contracts, identities with multiple authorities, or cross-chain verifications. The command supports verification against both the signing-time identity state and the latest identity state.

**Command Type**: Cryptographic  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | The transparent address or identity to verify against the signature. |
| One of: `filename`, `message`, `messagehex`, `messagebase64`, or `datahash` | string | Yes | Data or hash of data that was signed. |
| `prefixstring` | string | No | Extra string that is hashed during signature and must be supplied for verification. |
| `vdxfkeys` | array of strings | No | Array of VDXF keys or ID i-addresses. |
| `vdxfkeynames` | array of strings | No | Array of VDXF key names or fully qualified friendly IDs. |
| `boundhashes` | array of strings | No | Array of bound hash values. |
| `hashtype` | string | No | Hash algorithm to use: "sha256", "sha256D", "blake2b", or "keccak256". Defaults to "sha256". |
| `signature` | string | Yes | The signature to verify, encoded in base 64. |
| `checklatest` | boolean | No | If true, checks signature validity based on latest identity. Defaults to false, which determines validity of signing height stored in signature. |

## Results
The command returns a JSON object with verification results.

**Return Type**: Object

The result object contains:

| Field | Type | Description |
|-------|------|-------------|
| `hash` | hex string | The hash of the message using the specified hash type. |
| `signature` | base64 string | The signature that was verified. |

## Sample Examples

### Sample Example 1: Verify Message Signature with Basic Parameters

**Command:**
```
verus verifysignature '{"address":"Verus Coin Foundation.vrsc@", "message":"hello world", "signature":"H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="}'
```

**Sample Result:**
```json
{
  "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "signature": "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="
}
```

### Sample Example 2: Verify File Signature with Custom Hash Type

**Command:**
```
verus verifysignature '{"address":"MyIdentity@", "filename":"contracts/agreement.txt", "hashtype":"sha256D", "signature":"IPvC5WnH0f+9XzMU3Rda5UxFKtFcVoDc4nPyJ4Rk2I7JM1MuLe/8mQfxf9i+THJ7K8Z1y4WMUCqFMfPeYM+1qVU="}'
```

**Sample Result:**
```json
{
  "hash": "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
  "signature": "IPvC5WnH0f+9XzMU3Rda5UxFKtFcVoDc4nPyJ4Rk2I7JM1MuLe/8mQfxf9i+THJ7K8Z1y4WMUCqFMfPeYM+1qVU="
}
```

### Sample Example 3: Verify Signature with VDXF Keys and Bound Hashes

**Command:**
```
verus verifysignature '{"address":"BusinessID@", "message":"Contract approval: XYZ-123", "vdxfkeys":["iVDXF1a2b3c4d5e6f7g8h9i0j"], "boundhashes":["7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8"], "signature":"L8Kp92dOPR0FQaH1j7p+e4fg8JhbRFmTi0wiOiE/ImV3ZXw5UJHD8vBQd1OUJBZjSLB0J9rTc35TqJHNuZ2aJkK="}'
```

**Sample Result:**
```json
{
  "hash": "e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  "signature": "L8Kp92dOPR0FQaH1j7p+e4fg8JhbRFmTi0wiOiE/ImV3ZXw5UJHD8vBQd1OUJBZjSLB0J9rTc35TqJHNuZ2aJkK="
}
```

### Sample Example 4: Verify Hex-Encoded Message with Blake2b Hash

**Command:**
```
verus verifysignature '{"address":"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", "messagehex":"68656c6c6f20776f726c64", "hashtype":"blake2b", "signature":"IK7GtR4dX9jJm3qFeUbN82Lp5kRzCvXaW1H6oM9sDyZQnP0y7cBtEhTwS+lY2gfOP836xVi1LdXm4r9zeIutMhA="}'
```

**Sample Result:**
```json
{
  "hash": "6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7",
  "signature": "IK7GtR4dX9jJm3qFeUbN82Lp5kRzCvXaW1H6oM9sDyZQnP0y7cBtEhTwS+lY2gfOP836xVi1LdXm4r9zeIutMhA="
}
```

### Sample Example 5: Verify Direct Hash with Latest Identity State

**Command:**
```
verus verifysignature '{"address":"MultiSigID@", "datahash":"7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", "checklatest":true, "signature":"H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="}'
```

**Sample Result:**
```json
{
  "hash": "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
  "signature": "H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="
}
```

### Sample Example 6: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "verifysignature", "params": [{"address":"Verus Coin Foundation.vrsc@", "message":"hello world", "signature":"H9Ovk7+zaTfMPrq3R4TG1jHGY+KjwHbRqk88/WZAwADPJLULCjxA/X5dOPJY1eo7Z8K2mS+dtLHcMND8AbN+YAE="}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

2. **Potential Error - Invalid Signature Format:**
   ```
   error code: -5
   error message:
   Invalid base64 signature format
   ```

3. **Potential Error - Missing Required Parameter:**
   ```
   error code: -8
   error message:
   One of message, messagehex, messagebase64, filename, or datahash must be specified
   ```

4. **Potential Error - Invalid VDXF Key:**
   ```
   error code: -5
   error message:
   Invalid VDXF key
   ```

5. **Potential Error - File Not Found:**
   ```
   error code: -8
   error message:
   File not found: filepath/filename
   ```

6. **Potential Error - Invalid Hash Type:**
   ```
   error code: -8
   error message:
   Invalid hash type, must be one of: sha256, sha256D, blake2b, keccak256
   ```
