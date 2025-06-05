# Verus RPC Command: getbalance

## Purpose
The `getbalance` command returns the server's total available balance. This command is essential for checking the wallet balance and monitoring available funds.

## Description
When executed, this command calculates and returns the total available balance in the wallet. The balance calculation can be restricted to a specific account and can be configured to only include transactions with a minimum number of confirmations. Additionally, balances from watch-only addresses can be included if specified.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| account | string | No | "*" | DEPRECATED. If provided, it MUST be set to the empty string "" or to the string "*", which will give the total available balance |
| minconf | numeric | No | 1 | Only include transactions confirmed at least this many times |
| includeWatchonly | boolean | No | false | Also include balance in watchonly addresses |

## Results
The command returns a numeric value representing the total amount in VRSC received for the specified account(s).

**Return Type**: Numeric

## Examples

### Example 1: Get the total wallet balance

**Command:**
```
verus getbalance
```

**Sample Output:**
```
1234.56789000
```

### Example 2: Get the balance with minimum 6 confirmations

**Command:**
```
verus getbalance "*" 6
```

**Sample Output:**
```
1200.00000000
```

### Example 3: Include watch-only addresses in the balance

**Command:**
```
verus getbalance "*" 1 true
```

**Sample Output:**
```
1500.12345678
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getbalance", "params": ["*", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 1200.00000000,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Account Parameter:**
   ```
   error code: -8
   error message:
   Account must be * or empty string
   ```

2. **Potential Error - Invalid Confirmation Count:**
   ```
   error code: -8
   error message:
   Minimum confirmation count must be a non-negative number
   ```

3. **Potential Error - Invalid includeWatchonly Parameter:**
   ```
   error code: -8
   error message:
   includeWatchonly must be a boolean
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getcurrencybalance`: Returns the balance in all currencies of a specific address
- `getunconfirmedbalance`: Returns the server's total unconfirmed balance
- `getwalletinfo`: Returns various wallet state info including balances
- `z_getbalance`: Returns the balance of a t-addr or z-addr belonging to the node's wallet
