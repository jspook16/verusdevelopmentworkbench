# Verus RPC Command: createrawtransaction

## Purpose
The `createrawtransaction` command creates an unsigned raw transaction that spends specified inputs and sends to specified addresses. This command is fundamental to building custom transactions programmatically, enabling advanced transaction construction outside the constraints of the wallet's automated transaction creation. It serves as the initial step in the raw transaction workflow, allowing for precise control over transaction inputs and outputs.

## Description
This command constructs a transaction from the ground up by manually specifying which unspent transaction outputs (UTXOs) to use as inputs and defining the destination addresses and amounts as outputs. The created transaction is returned as a hex-encoded string but is not signed, stored in the wallet, or transmitted to the network - these are separate steps handled by other commands.

The command's flexibility allows for complex transaction structures, including multi-output transactions, OP_RETURN data outputs, and multi-currency outputs. You can also specify parameters such as locktime and expiry height to control when a transaction becomes valid or expires.

Note that creating raw transactions requires careful attention to detail, as mistakes can lead to loss of funds. This command is typically used as part of a sequence: create → fund → sign → send.

**Command Type**: Create/Transaction  
**Protocol Level**: Transaction  
**Access Requirement**: No special requirements, but requires knowledge of specific UTXOs

## Arguments
The command accepts four arguments, two required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| transactions | array | Yes | N/A | A JSON array of transaction inputs, each specifying a UTXO to spend |
| addresses | object | Yes | N/A | A JSON object with addresses as keys and amounts as values |
| locktime | numeric | No | 0 | Raw locktime. Non-zero value also locktime-activates inputs |
| expiryheight | numeric | No | nextblockheight+20 (pre-Blossom) or nextblockheight+40 (post-Blossom) | Expiry height of transaction (if Overwinter is active) |

**Transaction Input Object Fields:**
- `txid` (string, required): The transaction ID containing the output to spend
- `vout` (numeric, required): The output index number in the referenced transaction
- `sequence` (numeric, optional): The sequence number for the input

**Addresses Object Fields:**
- Keys can be destination addresses with numeric values representing VRSC amounts
- Keys can be addresses with objects containing currency-specific amounts
- A special key "data" can be included with a hex-encoded string value to add OP_RETURN data

## Results
The command returns a hex-encoded string representing the raw transaction.

**Return Type**: String

## Examples

### Example 1: Create a simple transaction with one input and one output

**Command:**
```
verus createrawtransaction '[{"txid":"myid","vout":0}]' '{"address":0.01}'
```

**Sample Output:**
```
0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000
```

### Example 2: Create a transaction with data output (OP_RETURN)

**Command:**
```
verus createrawtransaction '[{"txid":"myid","vout":0}]' '{"address":0.01,"data":"00010203"}'
```

**Sample Output:**
```
0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac00000000000000000806a04000102030000000000
```

### Example 3: Create a transaction with specific locktime and expiry height

**Command:**
```
verus createrawtransaction '[{"txid":"myid","vout":0}]' '{"address":0.01}' 1000000 1050000
```

**Sample Output:**
```
0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000040420f90100000
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "createrawtransaction", "params": ["[{\"txid\":\"myid\",\"vout\":0}]", "{\"address\":0.01}"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000000ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction Input Format:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected array of objects
   ```

2. **Potential Error - Invalid Address Destination:**
   ```
   error code: -5
   error message:
   Invalid address or script
   ```

3. **Potential Error - Invalid Amount:**
   ```
   error code: -3
   error message:
   Invalid amount
   ```

4. **Potential Error - Invalid Hex in Data Output:**
   ```
   error code: -5
   error message:
   Invalid data, data must be hexadecimal string
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `fundrawtransaction`: Add inputs to a transaction until it has enough value
- `signrawtransaction`: Sign inputs for a raw transaction
- `sendrawtransaction`: Submit a raw transaction to the network
- `decoderawtransaction`: Return a JSON object representing the serialized transaction
