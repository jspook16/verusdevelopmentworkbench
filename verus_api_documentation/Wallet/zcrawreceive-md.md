# Verus RPC Command: zcrawreceive

## Purpose
The `zcrawreceive` command decrypts an encrypted note intended for a shielded address and verifies if the corresponding commitment exists in the blockchain. This deprecated command was designed for low-level transaction verification, manual processing of private payments, testing and development of shielded transaction systems, and direct access to encrypted note contents. It provides a mechanism to manually decode and validate shielded payment components.

## Description
When executed with the appropriate parameters, this command takes a secret key (zcsecretkey) and an encrypted note, and attempts to decrypt the note to reveal its contents. The encrypted note typically comes from the output of a joinsplit operation, such as one created by the `zcrawjoinsplit` command. If decryption is successful, the command reveals the plaintext value of the note, including the amount being transferred. Additionally, it checks the blockchain to determine whether the commitment associated with this note has been included in a transaction, indicated by the "exists" result. This verification is important because it confirms whether the note represents a valid, on-chain transfer of value. This low-level command gives advanced users direct access to the cryptographic operations involved in receiving shielded payments, bypassing the wallet's automatic handling of these operations. However, it places responsibility on the user to manage decryption and verification processes manually, which would normally be handled automatically by the wallet infrastructure.

**Command Type**: Low-level/Transaction  
**Protocol Level**: Cryptographic  
**Access Requirement**: None  
**Deprecated Status**: This command is deprecated

## Arguments
The command accepts two required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| zcsecretkey | string | Yes | N/A | The secret key for the recipient z-address |
| encryptednote | string | Yes | N/A | The encrypted note data to decrypt |

## Results
The command returns an object containing the amount, plaintext note, and existence status.

**Return Type**: Object

## Examples

### Example 1: Decrypt an encrypted note and check its existence

**Command:**
```
verus zcrawreceive "secret-extended-key-main1qwh9ptcv0qqqqpqzpycvcnzjvxnj0qm4v8r8h4ge0qd7al6c0pvnzup9r3kzmgkl5k5v7v2f6yj5vcd7chsxtaww0jhdl0lt3gdyq6c25tqfhazqaqpa6ywvvxj4zr37jlnwcul2zaqcqrmmj76waahxal9wkvq9qfdhw9l" "e123d162564e9a5034ba89e7570f25e9875f594095271e6397811f514410e1752a712b98b41116c8ca3dade7c6146f4a7f6bb93a3b7d711e7c46ed398509786b7c0ce29879aaba741c4c2e9ccdfce83cce8495d2fa9b98bfc6d012704cb51f75e"
```

**Sample Output:**
```
{
  "amount": 1.00000000,
  "note": "09a47589a8c95cb0885901c8faad3f32d99c5c24b9c31f262e5a162a59f7b8122a9e0be37a5c71235fe62464d8d5a9c18b8f59c62f60e4ce7faf974f33087d5d",
  "exists": true
}
```

## Potential Error Cases

1. **Potential Error - Invalid Secret Key:**
   ```
   error code: -8
   error message:
   Invalid zcsecretkey format
   ```

2. **Potential Error - Invalid Encrypted Note:**
   ```
   error code: -8
   error message:
   Invalid encryptednote format
   ```

3. **Potential Error - Decryption Failure:**
   ```
   error code: -4
   error message:
   Could not decrypt note with the provided key
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
DEPRECATED. This command is intended primarily for development, testing, and educational purposes. The command only checks if the commitment exists in the blockchain; it does not verify whether the note has already been spent. For that, a full scan of the blockchain would be needed. The "exists" field in the result indicates whether the commitment corresponding to this note is present in the blockchain's commitment tree. If true, it means the note represents a valid transfer of value. If false, it either means the transaction containing this note has not yet been mined, or the note is invalid. The "note" field in the result contains the plaintext representation of the note, which includes cryptographic information like the commitment and nullifier. For most use cases, the higher-level shielded transaction commands (`z_sendmany`, `z_listreceivedbyaddress`, etc.) are more appropriate as they handle encryption, decryption, and verification automatically within the wallet infrastructure.

## Related Commands
- `zcrawjoinsplit`: Splices a joinsplit into a raw transaction
- `zcrawkeygen`: Generate a zcaddr which can send and receive confidential values
- `z_listreceivedbyaddress`: Returns a list of amounts received by a z-address
- `z_viewtransaction`: Get detailed shielded information about a transaction
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients