# Verus RPC Command: getrawtransaction

## Purpose
The `getrawtransaction` command retrieves raw transaction data for a specified transaction ID, either as a serialized hex string or as a detailed JSON object. This command is fundamental for transaction analysis, verification, and debugging, allowing users to access complete transaction data even for transactions not directly related to the wallet. It serves as a gateway to examine any transaction's structure, inputs, outputs, and metadata, which is essential for blockchain explorers, auditing tools, and debugging complex transaction issues.

## Description
When provided with a transaction ID (txid), this command returns the complete raw transaction data. By default, it returns the transaction as a serialized, hex-encoded string, but when the verbose parameter is set to a non-zero value, it returns a comprehensive JSON object with all transaction details parsed.

Important limitations to note:
- By default, this command only works for transactions in the mempool (unconfirmed) or transactions that have at least one unspent output in the UTXO set.
- To make it work consistently for all transactions (including fully spent ones), the node must be started with the `-txindex=1` command line option to maintain a full transaction index.

The ability to access and examine any transaction on the blockchain makes this command invaluable for developers, analysts, and users who need to verify transaction details, troubleshoot issues, or develop applications that interact with the blockchain.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/Transaction  
**Access Requirement**: For transactions not in mempool or without unspent outputs, requires `-txindex=1` node option

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The transaction ID to retrieve |
| verbose | numeric | No | 0 | If 0, return a hex-encoded string; if non-zero, return a JSON object |

## Results
The command returns either a hex-encoded string or a JSON object, depending on the verbose parameter:

**Return Type (if verbose=0)**: String
- A serialized, hex-encoded string representing the complete transaction

**Return Type (if verbose > 0)**: Object

| Field | Type | Description |
|-------|------|-------------|
| hex | string | The serialized, hex-encoded data for the transaction |
| txid | string | The transaction ID (same as provided) |
| version | numeric | The transaction version |
| locktime | numeric | The transaction locktime |
| expiryheight | numeric | The block height after which the transaction expires (optional) |
| vin | array | Array of transaction input objects |
| vout | array | Array of transaction output objects |
| vjoinsplit | array | Array of JoinSplit components (for version >= 2) |
| blockhash | string | The block hash containing the transaction |
| confirmations | numeric | The number of confirmations |
| time | numeric | The transaction time in seconds since epoch |
| blocktime | numeric | The block time in seconds since epoch |

## Examples

### Example 1: Get transaction as hex string

**Command:**
```
verus getrawtransaction "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

**Sample Output:**
```
0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000
```

### Example 2: Get transaction as JSON object

**Command:**
```
verus getrawtransaction "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" 1
```

**Sample Output:**
```json
{
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
  "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "version": 1,
  "locktime": 0,
  "vin": [
    {
      "txid": "1752213d598e5fd2d4e4a79b8a9e5bb350d5d276cb7a3918610f5e2c5fdcb0e4",
      "vout": 0,
      "scriptSig": {
        "asm": "3044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e781[ALL]",
        "hex": "473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e78101"
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
  ],
  "blockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "confirmations": 1234,
  "time": 1622505600,
  "blocktime": 1622505600
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawtransaction", "params": ["a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", 1] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
    ... (other fields as in Example 2)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   No information available about transaction
   ```

2. **Potential Error - Transaction Index Not Enabled:**
   ```
   error code: -5
   error message:
   No information available about transaction (txindex must be enabled with -txindex=1)
   ```

3. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   txid must be a hexadecimal string
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
- `sendrawtransaction`: Submit a raw transaction to the network
- `gettransaction`: Get detailed information about an in-wallet transaction
