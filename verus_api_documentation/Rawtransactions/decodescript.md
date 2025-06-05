# Verus RPC Command: decodescript

## Purpose
The `decodescript` command decodes a hex-encoded script into a human-readable format, providing detailed information about the script's structure, purpose, and requirements. This command is invaluable for script analysis, debugging custom transactions, understanding complex transactions, and educational purposes. It allows developers, analysts, and advanced users to examine and verify script structures without actually executing them, making it a critical tool for blockchain development and investigation.

## Description
When provided with a hex-encoded script, this command parses the script opcodes and data, translating the binary representation into a comprehensive JSON object that describes the script's properties. The decoded information includes the script in assembly language format (which is much more readable than hex), the script type (e.g., pubkeyhash, scripthash), required signatures, associated addresses, and the corresponding P2SH (Pay-to-Script-Hash) address.

This functionality is particularly useful when working with custom or complex transaction scripts, multisignature arrangements, time-locked transactions, or when analyzing unfamiliar transactions. It helps verify that scripts are constructed correctly before they are used in transactions and provides insight into how different script types function within the blockchain.

The command essentially serves as a translator between the compact binary format used in blockchain transactions and a structured, human-readable representation that reveals the script's logic and requirements.

**Command Type**: Query/Read-only  
**Protocol Level**: Transaction/Script  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hex | string | Yes | N/A | The hex-encoded script to decode |

## Results
The command returns a JSON object with detailed information about the script:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| asm | string | Script in assembly language format |
| hex | string | The original hex-encoded script |
| type | string | The output script type |
| reqSigs | numeric | The number of required signatures |
| addresses | array | Array of associated addresses |
| p2sh | string | The script address (P2SH) |

## Examples

### Example 1: Decode a standard P2PKH (Pay-to-Public-Key-Hash) script

**Command:**
```
verus decodescript "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac"
```

**Sample Output:**
```json
{
  "asm": "OP_DUP OP_HASH160 687bcf7eaccef6010b5c1c305288bd5dc9e06b04 OP_EQUALVERIFY OP_CHECKSIG",
  "hex": "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac",
  "type": "pubkeyhash",
  "reqSigs": 1,
  "addresses": [
    "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
  ],
  "p2sh": "bNdEsfGYLDZrKANLpvQi4xWZ3xZG4tq7Mu"
}
```

### Example 2: Decode a multi-signature script

**Command:**
```
verus decodescript "522103956df9c532ca2782531b28a8657a42e456bc9bf9f8395b4f072743b9b6282d5c2102c39910ee93c8318ad04c9d6d7b381dd534dad17e8a84f191c038b5a8d8831a5e21032ca22a4adad95a46b85320522204ac4373a9525c34b4b9755c6a94f5452b02c853ae"
```

**Sample Output:**
```json
{
  "asm": "2 03956df9c532ca2782531b28a8657a42e456bc9bf9f8395b4f072743b9b6282d5c 02c39910ee93c8318ad04c9d6d7b381dd534dad17e8a84f191c038b5a8d8831a5e 032ca22a4adad95a46b85320522204ac4373a9525c34b4b9755c6a94f5452b02c8 3 OP_CHECKMULTISIG",
  "hex": "522103956df9c532ca2782531b28a8657a42e456bc9bf9f8395b4f072743b9b6282d5c2102c39910ee93c8318ad04c9d6d7b381dd534dad17e8a84f191c038b5a8d8831a5e21032ca22a4adad95a46b85320522204ac4373a9525c34b4b9755c6a94f5452b02c853ae",
  "type": "multisig",
  "reqSigs": 2,
  "addresses": [
    "RJSDZjp7kjBNhHsbECDE1jwYNK7af41pZN",
    "RU4QJU3WX4A8YCUJLAXGKPWDFMX36EE126",
    "RBYMsuS89HQKxNCZScxtMu9EzJi5Vkysca"
  ],
  "p2sh": "bJQDDhrM7UwzMYiHDfHr2Prc2cqSUnHSXX"
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "decodescript", "params": ["76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "asm": "OP_DUP OP_HASH160 687bcf7eaccef6010b5c1c305288bd5dc9e06b04 OP_EQUALVERIFY OP_CHECKSIG",
    "hex": "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac",
    "type": "pubkeyhash",
    "reqSigs": 1,
    "addresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "p2sh": "bNdEsfGYLDZrKANLpvQi4xWZ3xZG4tq7Mu"
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameter:**
   ```
   error code: -1
   error message:
   Hex string required
   ```

2. **Potential Error - Invalid Hex Format:**
   ```
   error code: -22
   error message:
   Script decode failed
   ```

3. **Potential Error - Empty Script:**
   ```
   error code: -22
   error message:
   Script is empty
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `createrawtransaction`: Create a raw transaction spending given inputs
- `decoderawtransaction`: Return a JSON object representing the serialized transaction
- `signrawtransaction`: Sign inputs for a raw transaction
- `sendrawtransaction`: Submit a raw transaction to the network
