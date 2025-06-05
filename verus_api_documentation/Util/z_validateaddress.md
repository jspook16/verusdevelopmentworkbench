# Verus RPC Command: z_validateaddress

## Purpose
The `z_validateaddress` command is designed to verify the validity of a shielded (private) z-address and return detailed information about it. This command is essential for ensuring the correctness of private addresses before sending confidential transactions, integrating privacy features into applications, and diagnosing issues related to shielded wallets by providing comprehensive address metadata.

## Description
The `z_validateaddress` command performs a thorough validation of a specified z-address, checking its format, structure, and compatibility with the Verus network's privacy infrastructure. Beyond basic validation, the command identifies the address type (Sprout or Sapling) and provides technical details specific to shielded addresses. This information is valuable for developers implementing privacy features, users sending confidential transactions, and applications supporting shielded operations in the Verus ecosystem.

**Command Type**: Query/Read-only  
**Protocol Level**: Privacy Address Validation Layer  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `zaddr` | string | Yes | The shielded z-address to validate and analyze |

## Results
The command returns a JSON object containing detailed information about the z-address:

**Return Type**: Object

| Property | Type | Description |
|----------|------|-------------|
| `isvalid` | boolean | Indicates whether the z-address format is valid |
| `address` | string | The validated z-address (only returned if valid) |
| `type` | string | Address type: "sprout" or "sapling" (only returned if valid) |
| `ismine` | boolean | Indicates whether the address belongs to the wallet (only returned if valid) |
| `payingkey` | string | [Sprout only] The hex value of the paying key, a_pk |
| `transmissionkey` | string | [Sprout only] The hex value of the transmission key, pk_enc |
| `diversifier` | string | [Sapling only] The hex value of the diversifier, d |
| `diversifiedtransmissionkey` | string | [Sapling only] The hex value of pk_d |

If the address is invalid, only the `isvalid` property with a value of `false` is returned.

## Examples

### Example 1: Validate a Sprout Z-Address

**Command:**
```
verus z_validateaddress "zcWsmqT4X2V4jgxbgiCzyrAfRT1vi1F4sn7M5Pkh66izzw8Uk7LBGAH3DtcSMJeUb2pi3W4SQF8LMKkU2cUuVP68yAGcomL"
```

**Potential Output:**
```json
{
  "isvalid": true,
  "address": "zcWsmqT4X2V4jgxbgiCzyrAfRT1vi1F4sn7M5Pkh66izzw8Uk7LBGAH3DtcSMJeUb2pi3W4SQF8LMKkU2cUuVP68yAGcomL",
  "type": "sprout",
  "ismine": true,
  "payingkey": "d78a4d73692a67c3c6f3788d8f7e3237df5ded7535de3c48a3b292be283f2f23",
  "transmissionkey": "2033bc75a5c51f7eca8e2076d4ee5da4001265cc8b85a1fd22c39b3eacbe42b6"
}
```

### Example 2: Validate a Sapling Z-Address

**Command:**
```
verus z_validateaddress "zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9slya"
```

**Potential Output:**
```json
{
  "isvalid": true,
  "address": "zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9slya",
  "type": "sapling",
  "ismine": true,
  "diversifier": "1d8c5df473d39a4d6f9",
  "diversifiedtransmissionkey": "34ed1f60f5b9360b6cf2a9f43c9eb9df21d3325b3820078bd7c22f889e15c4ef"
}
```

### Example 3: Validate an Invalid Z-Address

**Command:**
```
verus z_validateaddress "invalidzaddress"
```

**Potential Output:**
```json
{
  "isvalid": false
}
```

### Example 4: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_validateaddress", "params": ["zcWsmqT4X2V4jgxbgiCzyrAfRT1vi1F4sn7M5Pkh66izzw8Uk7LBGAH3DtcSMJeUb2pi3W4SQF8LMKkU2cUuVP68yAGcomL"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format of Response:**
```json
{
  "result": {
    "isvalid": true,
    "address": "zcWsmqT4X2V4jgxbgiCzyrAfRT1vi1F4sn7M5Pkh66izzw8Uk7LBGAH3DtcSMJeUb2pi3W4SQF8LMKkU2cUuVP68yAGcomL",
    "type": "sprout",
    "ismine": true,
    "payingkey": "d78a4d73692a67c3c6f3788d8f7e3237df5ded7535de3c48a3b292be283f2f23",
    "transmissionkey": "2033bc75a5c51f7eca8e2076d4ee5da4001265cc8b85a1fd22c39b3eacbe42b6"
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Address Parameter:**
   ```
   error code: -1
   error message:
   z_validateaddress requires exactly one address argument
   ```

2. **Potential Error - Empty Address String:**
   ```
   error code: -5
   error message:
   Invalid address: empty address string
   ```

3. **Note - Not an Error - Invalid Z-Address:**
   For invalid addresses, the command returns a valid response with `"isvalid": false` rather than throwing an error.

## Important Notes
- This command only validates shielded (private) z-addresses; for transparent addresses, use `validateaddress` instead
- The command correctly identifies and provides type-specific information for both Sprout and Sapling address formats
- Validation only confirms the address format is valid, not that it corresponds to a wallet with funds
- The `ismine` property is only meaningful when run on a node with access to the wallet containing the address
- Technical key details (like `payingkey`, `transmissionkey`, etc.) are primarily useful for developers implementing privacy features
- For security reasons, avoid exposing these technical details in public interfaces or logs
