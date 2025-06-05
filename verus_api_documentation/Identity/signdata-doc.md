# Verus RPC Command: signdata

## Purpose
The `signdata` command is used to cryptographically sign data with a Verus identity or transparent address, providing proof of ownership and data integrity. This command offers advanced features for signing various data formats, creating Merkle Mountain Range (MMR) structures, and optionally encrypting the signed data.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `signdata` command enables the cryptographic signing of data using a Verus identity or transparent address. It supports a wide range of data formats, including text messages, files, hex data, base64-encoded data, and data hashes. The command can also create Merkle Mountain Range (MMR) structures for efficiently signing multiple data items and can optionally encrypt the signed data for privacy. This command is essential for creating provable digital signatures that can be verified using the `verifysignature` command.

**Command Type**: Utility  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with control of the signing identity or address

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | The transparent address or identity to use for signing |
| `prefixstring` | string | No | Extra string that is hashed during signature and must be supplied for verification |
| `filename` | string | One data source required | File path to the data to sign |
| `message` | string | One data source required | Text message to sign |
| `vdxfdata` | string | One data source required | VDXF encoded data to sign |
| `messagehex` | string | One data source required | Hex-encoded data to sign |
| `messagebase64` | string | One data source required | Base64-encoded data to sign |
| `datahash` | string | One data source required | 256-bit hex hash to sign |
| `mmrdata` | array | Alternative to single data | Array of data items for MMR signing |
| `mmrsalt` | array | No | Array of salts to match the mmrdata, protects privacy of leaf nodes |
| `mmrhash` | string | No | Hash type for MMR: "sha256", "sha256D", "blake2b", "keccak256" (default is blake2b) |
| `priormmr` | array | No | Array of MMR hashes prior to this data (unimplemented) |
| `vdxfkeys` | array | No | Array of vdxfkeys or ID i-addresses |
| `vdxfkeynames` | array | No | Array of vdxfkey names or fully qualified friendly IDs |
| `boundhashes` | array | No | Array of bound hash values |
| `hashtype` | string | No | Hash type: "sha256", "sha256D", "blake2b", "keccak256" (default is sha256) |
| `encrypttoaddress` | string | No | Sapling address to encrypt data to |
| `createmmr` | boolean | No | If true, creates a Merkle Mountain Range from the data items |
| `signature` | string | No | Current signature encoded in base64 (for multisig IDs) |

## Results
The command returns a JSON object containing the signature and related information.

**Return Type**: Object

The returned object contains:

| Field | Type | Description |
|-------|------|-------------|
| `hash` | string | The hash of the message (or null if MMR is used) |
| `hashes` | array | Array of hashes for MMR (alternative to `hash`) |
| `mmrroot` | string | Root hash of the Merkle Mountain Range (only with MMR) |
| `vdxfkeys` | array | Array of VDXF keys or i-addresses |
| `vdxfkeynames` | array | Array of VDXF key names |
| `boundhashes` | array | Array of bound hash values |
| `hashtype` | string | Hash type used |
| `signature` | string | The signature encoded in base64 |

## Sample Examples

### Sample Example 1: Sign a Simple Message

**Command:**
```
verus signdata '{"address":"MyIdentity@", "message":"hello world"}'
```

**Expected Format:**
```json
{
  "hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "hashtype": "sha256",
  "signature": "AyB3dVhK3F8aMHEPzX2gJ6VpnUqXQjL1yMxmGpmC9+G6Zy1U8eMcqEbiJ7YnSgr4g3K5XSc8J8dxGK5t+lVPGWY="
}
```

### Sample Example 2: Sign Data with VDXF Keys

**Command:**
```
verus signdata '{"address":"BusinessID@", "message":"Contract Agreement", "vdxfkeys":["iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"], "vdxfkeynames":["legal.contract"], "hashtype":"blake2b"}'
```

**Expected Format:**
```json
{
  "hash": "d8b1c3a57f675ad32468f324e7bcc3377e62bff0f0f3e3938c4a9eb7b27d3489",
  "vdxfkeys": ["iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"],
  "vdxfkeynames": ["legal.contract"],
  "hashtype": "blake2b",
  "signature": "K1XNsz4SjU8G5dv2Qc3L+RpHnVe6f7DBqwMy3PJf8xKm9rJYsV2e0ZF9CQZVwJf9MCHvnPqsJcYXZ1b5tYTnHbQ="
}
```

### Sample Example 3: Create and Sign an MMR

**Command:**
```
verus signdata '{"address":"MultiSigID@", "mmrdata":[{"message":"data item 1"},{"message":"data item 2"},{"message":"data item 3"}], "createmmr":true}'
```

**Expected Format:**
```json
{
  "hashes": [
    "cd42404756a65cf1196d19486601c27588b63d099aa25e9d55a8364ac4d8d10b",
    "6bd4afbf78d3d30253a99a1752c862be1c6d3d0cf41c42caf168c9f0a7b301a2",
    "b01457fc42e3e5c94c981c5453a269d7a561c151a3d8f3a82dd8f07ddea6b8e4"
  ],
  "mmrroot": "d846f1a4dd7d3cca0f6bad16451d1e8f0e1cb8aea5972ac659b98e9b6253e42c",
  "hashtype": "sha256",
  "signature": "JrtF9s2G8wQmVpDm+Ujy3xKnLz5W1vD4bfQcXIkZ9KqpfYdJTu8XHc7RxlVNJGf2L8VqHyRzn2cYMKwEb1nSH8A="
}
```

### Sample Example 4: Sign with Encryption

**Command:**
```
verus signdata '{"address":"PrivateID@", "message":"confidential information", "encrypttoaddress":"zs1j29m7zdhhyy2eqrz89l4zhk0angqjh368gqkj2vgdyqmps7gmz5x3hqt9f3nebur9h3n2key288z"}'
```

**Expected Format:**
```json
{
  "hash": "a77e4c435c8c65fb6c7f6dfcb6b9d9e952e7afd7cb59a7f592b5f9679137e2a3",
  "hashtype": "sha256",
  "signature": "Hs7mPv3G9dQ8F1zKpLrn+Rx5T2J6L8wfcDbPaJDHY8WJ6+pMzLEAj3nrZkjPVGf5Kt9q2Yf8Qm1vHXd5BnUDGrs=",
  "encrypteddata": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f"
}
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "signdata", "params": [{"address":"MyIdentity@", "message":"hello world"}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "hashtype": "sha256",
    "signature": "AyB3dVhK3F8aMHEPzX2gJ6VpnUqXQjL1yMxmGpmC9+G6Zy1U8eMcqEbiJ7YnSgr4g3K5XSc8J8dxGK5t+lVPGWY="
  },
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

2. **Potential Error - No Data to Sign:**
   ```
   error code: -8
   error message:
   No data to sign specified
   ```

3. **Potential Error - Invalid Hash Type:**
   ```
   error code: -8
   error message:
   Invalid hash type
   ```

4. **Potential Error - Cannot Sign with Address:**
   ```
   error code: -5
   error message:
   Cannot sign with specified address/ID
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```