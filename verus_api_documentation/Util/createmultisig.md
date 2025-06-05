# Verus RPC Command: createmultisig

## Purpose
The `createmultisig` command is designed to create multi-signature addresses that require multiple signatures to spend funds. This command is fundamental for implementing shared control over funds, enhancing security, and establishing trustless escrow mechanisms within the Verus ecosystem.

## Description
The `createmultisig` command generates a new multi-signature address based on the specified number of required signatures (M) and a list of keys or addresses (N). The resulting M-of-N scheme means that M signatures are required from the N potential signers to authorize a transaction. The command returns both the newly created multi-signature address and the corresponding redeemScript needed for spending.

**Command Type**: Creation/Write  
**Protocol Level**: Core Transaction Layer  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nrequired` | numeric | Yes | The number of required signatures from the provided keys list |
| `keys` | string (JSON array) | Yes | A JSON array of keys which can be either Verus addresses or hex-encoded public keys |

## Results
The command returns a JSON object containing:

**Return Type**: Object

| Property | Type | Description |
|----------|------|-------------|
| `address` | string | The newly created multi-signature address |
| `redeemScript` | string | The hex-encoded redemption script needed for spending from this address |

## Examples

### Example 1: Create a 2-of-2 Multisignature Address

**Command:**
```
verus createmultisig 2 "[\"RTZMZHDFSTFQst8XmX2dR4DaH87cEUs3gC\",\"RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z\"]"
```

This command creates a multisignature address requiring signatures from both of the provided addresses to spend funds.

### Example 2: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "createmultisig", "params": [2, "[\"RTZMZHDFSTFQst8XmX2dR4DaH87cEUs3gC\",\"RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z\"]"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format of Response:**
```json
{
  "result": {
    "address": "bHqRjyxCgGjMQtajLD3vJB5JUXtumKQQRX",
    "redeemScript": "522103da60379d924c2c30ac290d2a86c2ead128cb7bd571f69c740cbf819be2f097472103caa46fcb1a6f2505bf66a667e911d4a3fbd62ae869ec3fba55afbc3f5d41fb2152ae"
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Number of Required Signatures:**
   ```
   error code: -8
   error message:
   Invalid number of required signatures
   ```

2. **Potential Error - Invalid Key Format:**
   ```
   error code: -8
   error message:
   Invalid public key or address
   ```

3. **Potential Error - Required Signatures Exceeds Available Keys:**
   ```
   error code: -8
   error message:
   Required signatures cannot exceed total available keys
   ```

4. **Potential Error - Malformed JSON Array:**
   ```
   error code: -8
   error message:
   Expected array of keys
   ```

5. **Potential Error - Empty Keys Array:**
   ```
   error code: -8
   error message:
   Keys array cannot be empty
   ```
