# Verus RPC Command: decoderawtransaction

## Purpose
The `decoderawtransaction` command returns a detailed JSON object representing a serialized, hex-encoded transaction. This command is essential for examining the structure and contents of transactions without broadcasting them to the network. It allows developers, analysts, and users to verify transaction details, debug transaction construction issues, and understand complex transaction structures before signing or broadcasting them.

## Description
When provided with a hex-encoded transaction string, this command parses and decodes all elements of the transaction, returning a comprehensive JSON representation that includes transaction metadata, inputs, outputs, and any special features like JoinSplit operations (for shielded transactions). This decoded view makes it possible to verify that transactions are constructed as intended, including verification of input sources, output destinations, amounts, and scripts.

The command is particularly useful in the raw transaction workflow (create → fund → sign → send) as it allows verification at each step to ensure the transaction is being built correctly. It's also valuable for educational purposes, allowing users to study transaction structures to better understand blockchain transactions.

Because the command only parses and does not modify or broadcast the transaction, it's completely safe to use and can be applied to any valid transaction hex, whether from your wallet or external sources.

**Command Type**: Query/Read-only  
**Protocol Level**: Transaction  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hexstring | string | Yes | N/A | The transaction hex string to decode |

## Results
The command returns a JSON object with detailed information about the transaction:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| txid | string | The transaction ID |
| overwintered | boolean | The Overwintered flag |
| version | numeric | The transaction version |
| versiongroupid | string | The version group ID (only for Overwintered transactions) |
| locktime | numeric | The transaction locktime |
| expiryheight | numeric | Last valid block height for mining transaction (only for Overwintered transactions) |
| vin | array | Array of transaction input objects |
| vout | array | Array of transaction output objects |
| vjoinsplit | array | Array of JoinSplit descriptions (only for version >= 2) |

Each input object in the `vin` array contains:

| Field | Type | Description |
|-------|------|-------------|
| txid | string | The referenced transaction ID |
| vout | numeric | The referenced output index |
| scriptSig | object | The script that provides evidence to spend the output |
| sequence | numeric | The script sequence number |

Each output object in the `vout` array contains:

| Field | Type | Description |
|-------|------|-------------|
| value | numeric | The value in VRSC |
| n | numeric | Output index |
| scriptPubKey | object | The output script |

The `scriptPubKey` object contains:

| Field | Type | Description |
|-------|------|-------------|
| asm | string | Script in assembly language format |
| hex | string | Script in hexadecimal format |
| reqSigs | numeric | Required number of signatures |
| type | string | Script type (e.g., "pubkeyhash") |
| addresses | array | Array of destination addresses |

For JoinSplit transactions, each entry in the `vjoinsplit` array provides detailed information about the shielded components of the transaction.

## Examples

### Example 1: Decode a transaction

**Command:**
```
verus decoderawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000"
```

**Sample Output:**
```json
{
  "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "overwintered": false,
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "1752213d598e5fd2d4e4a79b8a9e5bb350d5d276cb7a3918610f5e2c5fdcb0e4",
      "vout": 0,
      "scriptSig": {
        "asm": "",
        "hex": ""
      },
      "sequence": 4294967295
    }
  ],
  "vout": [
    {
      "value": 0.01000000,
      "n": 0,
      "scriptPubKey": {
        "asm": "03ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76ca OP_CHECKSIG",
        "hex": "2103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac",
        "reqSigs": 1,
        "type": "pubkey",
        "addresses": [
          "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
        ]
      }
    },
    {
      "value": 0.00000000,
      "n": 1,
      "scriptPubKey": {
        "asm": "OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9",
        "hex": "6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9",
        "type": "nulldata"
      }
    }
  ]
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "decoderawtransaction", "params": ["0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    ... (other fields as in Example 1)
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
   TX decode failed
   ```

3. **Potential Error - Incomplete Transaction:**
   ```
   error code: -22
   error message:
   TX decode failed. Make sure the tx has at least one input and one output.
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `createrawtransaction`: Create a raw transaction spending given inputs
- `fundrawtransaction`: Add inputs to a transaction until it has enough value
- `signrawtransaction`: Sign inputs for a raw transaction
- `sendrawtransaction`: Submit a raw transaction to the network
- `decodescript`: Decode a hex-encoded script
