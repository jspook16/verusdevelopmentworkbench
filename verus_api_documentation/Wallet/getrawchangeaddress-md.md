# Verus RPC Command: getrawchangeaddress

## Purpose
The `getrawchangeaddress` command returns a new Verus address specifically intended for receiving change. This command is designed for use with raw transactions, not for normal wallet use.

## Description
When executed, this command generates a new address in the wallet that is intended to be used as a change address in manually created transactions. Unlike regular addresses created with `getnewaddress`, change addresses are not intended to be shared with others for receiving payments, but rather are used internally by the wallet when constructing transactions to receive unspent amounts.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a string representing the new Verus address for receiving change.

**Return Type**: String

## Examples

### Example 1: Get a new change address

**Command:**
```
verus getrawchangeaddress
```

**Sample Output:**
```
RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getrawchangeaddress", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

2. **Potential Error - Keypool Empty:**
   ```
   error code: -12
   error message:
   Error: Keypool ran out, please call keypoolrefill first
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getnewaddress`: Returns a new Verus address for receiving payments
- `createrawtransaction`: Creates a raw transaction spending the given inputs
- `signrawtransaction`: Signs a raw transaction
- `sendrawtransaction`: Submits a raw transaction to the network
