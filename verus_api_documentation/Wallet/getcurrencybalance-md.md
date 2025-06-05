# Verus RPC Command: getcurrencybalance

## Purpose
The `getcurrencybalance` command returns the balance in all currencies of a transparent or private address belonging to the node's wallet. This command is particularly useful in the multi-currency environment of Verus for checking balances across different currencies.

## Description
When provided with an address, this command returns the total amount received by that address across all currencies. The address can be transparent or private, and wildcards are supported for querying multiple addresses at once. The command also accepts parameters to specify confirmation requirements and includes options for friendly name display and shared output inclusion.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts four arguments, one required and three optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| address | string or object | Yes | N/A | The selected address. It may be a transparent or private address and include z*, R*, and i* wildcards. If this is an object, it can have "address" and "currency" members, where currency limits currencies shown |
| minconf | numeric | No | 1 | Only include transactions confirmed at least this many times |
| friendlynames | boolean | No | true | Use friendly names instead of i-addresses |
| includeshared | boolean | No | false | Include outputs that can also be spent by others |

## Results
The command returns a numeric value or an object representing the total amount in VRSC received by the specified address.

**Return Type**: Numeric or Object

## Examples

### Example 1: Get the currency balance for a specific address

**Command:**
```
verus getcurrencybalance "myaddress"
```

**Sample Output:**
```json
{
  "VRSC": 123.45678900,
  "USD": 500.00000000,
  "EUR": 450.00000000
}
```

### Example 2: Get the balance with minimum 5 confirmations

**Command:**
```
verus getcurrencybalance "myaddress" 5
```

**Sample Output:**
```json
{
  "VRSC": 100.00000000,
  "USD": 450.00000000,
  "EUR": 400.00000000
}
```

### Example 3: Get the balance with i-addresses instead of friendly names

**Command:**
```
verus getcurrencybalance "myaddress" 1 false
```

**Sample Output:**
```json
{
  "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 123.45678900,
  "iKYR95AHNwokT3qJ2L3JFgXJ6zaBHr4c4T": 500.00000000,
  "iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM": 450.00000000
}
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getcurrencybalance", "params": ["myaddress", 5] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "VRSC": 100.00000000,
    "USD": 450.00000000,
    "EUR": 400.00000000
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Address Specified:**
   ```
   error code: -8
   error message:
   Address parameter required
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid address format
   ```

3. **Potential Error - Invalid Confirmation Count:**
   ```
   error code: -8
   error message:
   Minimum confirmation count must be a non-negative number
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

5. **Potential Error - Viewing Key Only:**
   ```
   warning message:
   CAUTION: If the wallet has only an incoming viewing key for this address, then spends cannot be detected, and so the returned balance may be larger than the actual balance
   ```

## Related Commands
- `getbalance`: Returns the server's total available balance
- `z_getbalance`: Returns the balance of a t-addr or z-addr belonging to the node's wallet
- `getunconfirmedbalance`: Returns the server's total unconfirmed balance
- `getwalletinfo`: Returns various wallet state info including balances
