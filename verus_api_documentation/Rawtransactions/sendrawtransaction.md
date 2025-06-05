# Verus RPC Command: sendrawtransaction

## Purpose
The `sendrawtransaction` command submits a raw transaction (serialized, hex-encoded) to the local node and network for inclusion in the blockchain. This command represents the final step in the manual transaction workflow, broadcasting a fully formed and signed transaction to the network. It allows for complete control over transaction creation while providing the means to introduce the transaction to the network, making it an essential tool for advanced transaction operations, automation scenarios, and applications that require precise transaction management.

## Description
When provided with a hex-encoded transaction, this command validates the transaction's format and basic sanity checks, then broadcasts it to the local node's peers for propagation throughout the network. The transaction is also added to the node's mempool (the collection of unconfirmed transactions) if it passes validation.

The command is typically used after a transaction has been created with `createrawtransaction`, potentially funded with `fundrawtransaction`, and signed with `signrawtransaction`. This sequence allows for complete customization of transaction parameters and structure before committing it to the network.

By default, the command will reject transactions with fees considered abnormally high (to protect against user error), but this check can be bypassed with the `allowhighfees` parameter if needed. Once successfully submitted, the transaction's hash is returned, which can be used to track the transaction's status in the blockchain.

It's important to note that a successful response means only that the transaction was accepted by the local node and began propagation - it does not guarantee that the transaction will be mined into a block or confirm.

**Command Type**: Action/Network  
**Protocol Level**: Transaction/Network  
**Access Requirement**: No special requirements

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hexstring | string | Yes | N/A | The hex string of the raw transaction |
| allowhighfees | boolean | No | false | Allow high fees (bypass the fee sanity check) |

## Results
The command returns a string representing the transaction hash (txid) in hexadecimal format.

**Return Type**: String

## Examples

### Example 1: Send a raw transaction with default fee validation

**Command:**
```
verus sendrawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000"
```

**Sample Output:**
```
a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Example 2: Send a raw transaction allowing high fees

**Command:**
```
verus sendrawtransaction "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000" true
```

**Sample Output:**
```
a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendrawtransaction", "params": ["0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff0240420f0000000000232103ac7a9dbcbea7d48a6ffd97f882e9629f3749688be9e274d78c452a3ad3ff76caac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction Format:**
   ```
   error code: -22
   error message:
   TX decode failed
   ```

2. **Potential Error - Transaction Already in Blockchain:**
   ```
   error code: -27
   error message:
   Transaction already in block chain
   ```

3. **Potential Error - Transaction Rejected:**
   ```
   error code: -26
   error message:
   18: txn-mempool-conflict
   ```

4. **Potential Error - Missing Inputs:**
   ```
   error code: -25
   error message:
   Missing inputs
   ```

5. **Potential Error - Fees Too High:**
   ```
   error code: -25
   error message:
   Absurdly high fee
   ```

6. **Potential Error - Transaction Verification Failed:**
   ```
   error code: -26
   error message:
   16: mandatory-script-verify-flag-failed (Signature must be zero for failed CHECK(MULTI)SIG operation)
   ```

7. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `createrawtransaction`: Create a raw transaction spending given inputs
- `fundrawtransaction`: Add inputs to a transaction until it has enough value
- `signrawtransaction`: Sign inputs for a raw transaction
- `decoderawtransaction`: Return a JSON object representing the serialized transaction
- `gettransaction`: Get detailed information about an in-wallet transaction
