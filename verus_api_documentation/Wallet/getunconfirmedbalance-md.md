# Verus RPC Command: getunconfirmedbalance

## Purpose
The `getunconfirmedbalance` command returns the server's total unconfirmed balance. This command is useful for monitoring pending incoming funds that have not yet been confirmed in the blockchain.

## Description
When executed, this command calculates and returns the total value of unconfirmed transactions in the wallet. These are transactions that have been received by the wallet but have not yet been included in a block (zero confirmations). This information is valuable for tracking pending funds and understanding the distinction between confirmed and unconfirmed wallet balances.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a numeric value representing the server's total unconfirmed balance.

**Return Type**: Numeric

## Examples

### Example 1: Get the unconfirmed balance

**Command:**
```
verus getunconfirmedbalance
```

**Sample Output:**
```
15.50000000
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getunconfirmedbalance", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 15.50000000,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

2. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

3. **Potential Error - Wallet Access:**
   ```
   error code: -1
   error message:
   Cannot access wallet
   ```

## Related Commands
- `getbalance`: Returns the server's total available balance
- `getcurrencybalance`: Returns the balance in all currencies of a specific address
- `getwalletinfo`: Returns various wallet state info including balances
- `z_getbalance`: Returns the balance of a t-addr or z-addr belonging to the node's wallet
