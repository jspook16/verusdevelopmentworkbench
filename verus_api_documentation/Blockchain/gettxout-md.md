# Verus RPC Command: gettxout

## Purpose
The `gettxout` command returns details about an unspent transaction output (UTXO). This command is useful for verifying the status and properties of a specific output from a transaction, including whether it has been spent and what its script requirements are.

## Description
When provided with a transaction ID (txid) and an output index (n), this command checks if the output is unspent and, if so, returns detailed information about it. This can be valuable for tracking funds, verifying transaction status, or analyzing the UTXO set. The command can optionally include outputs in the mempool (unconfirmed transactions) in its search.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts three arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The transaction ID |
| n | numeric | Yes | N/A | The output index (vout) value |
| includemempool | boolean | No | true | Whether to include the mempool in the search |

## Results
If the output is found and unspent, the command returns a JSON object with the following fields:

**Return Type**: Object or null (if output is spent or not found)

| Field | Type | Description |
|-------|------|-------------|
| bestblock | string | The hash of the block at the tip of the blockchain |
| confirmations | numeric | The number of confirmations for the transaction |
| value | numeric | The value of the output in VRSC |
| scriptPubKey | object | Information about the output script |
| version | numeric | The transaction version |
| coinbase | boolean | Whether this is a coinbase transaction |

The `scriptPubKey` object contains:

| Field | Type | Description |
|-------|------|-------------|
| asm | string | Script in assembly language format |
| hex | string | Script in hexadecimal format |
| reqSigs | numeric | Number of required signatures |
| type | string | The type of script (e.g., "pubkeyhash") |
| addresses | array | Array of Verus addresses associated with this output |

## Examples

### Example 1: Get details of a specific unspent transaction output

**Command:**
```
verus gettxout "txid" 1
```

**Sample Output:**
```json
{
  "bestblock": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "confirmations": 125,
  "value": 0.5,
  "scriptPubKey": {
    "asm": "OP_DUP OP_HASH160 687bcf7eaccef6010b5c1c305288bd5dc9e06b04 OP_EQUALVERIFY OP_CHECKSIG",
    "hex": "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac",
    "reqSigs": 1,
    "type": "pubkeyhash",
    "addresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ]
  },
  "version": 1,
  "coinbase": false
}
```

### Example 2: Get details of a transaction output, excluding mempool

**Command:**
```
verus gettxout "txid" 1 false
```

**Sample Output:**
Either the same as Example 1 if the output is confirmed in a block, or `null` if it's only in the mempool or has been spent.

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettxout", "params": ["txid", 1] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "bestblock": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Output Not Found or Spent:**
   Returns `null` instead of an error.

2. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   txid must be a hexadecimal string
   ```

3. **Potential Error - Invalid Output Index:**
   ```
   error code: -8
   error message:
   vout must be a positive integer
   ```

4. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Expected boolean value for includemempool parameter
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getrawtransaction`: Returns raw transaction data
- `listunspent`: Returns array of unspent transaction outputs
- `getspentinfo`: Returns the txid and index where an output is spent
- `decoderawtransaction`: Returns information about a transaction
