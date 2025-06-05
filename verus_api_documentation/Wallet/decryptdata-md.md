# Verus RPC Command: decryptdata

## Purpose
The `decryptdata` command decrypts a vdxf data descriptor, which is typically encrypted to a z-address. This command is essential for accessing and viewing encrypted data on the Verus blockchain while maintaining privacy.

## Description
When provided with an encrypted data descriptor and optional viewing keys, this command attempts to decrypt the data and any nested encryptions. If either the viewing key or the ssk (spending key) are correct, the command will return the object with as much decryption as possible completed. The command can also retrieve data from blockchain references if requested. If no decryption is possible, the function returns an error.

**Command Type**: Query/Privacy  
**Protocol Level**: Privacy/VDXF  
**Access Requirement**: Access to appropriate viewing or spending keys

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| datadescriptor | object | Yes | N/A | Encrypted data descriptor to decrypt, uses wallet keys included in descriptor |
| evk | string | No | N/A | If known, an extended viewing key to use for decoding that may not be in the descriptor |
| ivk | string | No | N/A | If known, an incoming viewing key to use for decoding |
| txid | string | No | N/A | If data is from a tx and retrieve is true, this may be needed when the data is on the same tx as the link |
| retrieve | boolean | No | false | If true and the data passed is an encrypted or unencrypted reference on this chain, it retrieves the data from its reference and decrypts if it can |

## Results
The command returns the decrypted data descriptor, with as much decryption as possible completed.

**Return Type**: Object

The exact structure of the returned data depends on the encrypted content, but it will contain the decrypted information to the extent possible based on the available keys.

## Examples

### Example 1: Decrypt data using wallet keys

**Command:**
```
verus decryptdata '{encrypteddatadescriptor}'
```

**Sample Output Format:**
The output format will vary depending on the encrypted data, but would contain the decrypted information.

### Example 2: Decrypt data with an external viewing key and retrieve referenced data

**Command:**
```
verus decryptdata '{"datadescriptor": {encrypteddatadescriptor}, "evk": "zxviews1q0duytgcqqqqpqre26m3ht9wfh02zrmqr0l05wlrn0qgwdpqpk6jm2ahvjkve4tqhtejw3zrz99tz6wz688dxrz4qszcm0v6w073k5st443xaw", "retrieve": true}'
```

**Sample Output Format:**
The output format will vary depending on the encrypted data, but would contain the decrypted information and any retrieved referenced data.

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "decryptdata", "params": [{"datadescriptor": {encrypteddatadescriptor}}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // Decrypted data depending on the content
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Data Descriptor:**
   ```
   error code: -8
   error message:
   Encrypted data descriptor parameter required
   ```

2. **Potential Error - Invalid Data Descriptor Format:**
   ```
   error code: -8
   error message:
   Invalid data descriptor format
   ```

3. **Potential Error - Decryption Failed:**
   ```
   error code: -5
   error message:
   Unable to decrypt data with available keys
   ```

4. **Potential Error - Invalid Viewing Key:**
   ```
   error code: -8
   error message:
   Invalid extended viewing key format
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `signdata`: Signs and optionally encrypts data
- `z_viewtransaction`: Get detailed shielded information about in-wallet transaction
- `z_getpaymentdisclosure`: Generate a payment disclosure for a given joinsplit output
- `z_validatepaymentdisclosure`: Validates a payment disclosure
