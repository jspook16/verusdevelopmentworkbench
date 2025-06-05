# Verus RPC Command: getreceivedbyaddress

## Purpose
The `getreceivedbyaddress` command returns the total amount received by the given Verus address in transactions with at least the specified number of confirmations. This command is useful for tracking incoming payments to specific addresses.

## Description
When provided with a Verus address, this command calculates the total amount received by that address, considering only transactions that have at least the specified minimum number of confirmations. This is particularly helpful for monitoring payment receipts to specific addresses, verifying deposits, or checking balances of individual addresses.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| VRSCTEST_address | string | Yes | N/A | The Verus address for which to check received funds |
| minconf | numeric | No | 1 | Only include transactions confirmed at least this many times |

## Results
The command returns a numeric value representing the total amount in VRSC received at the specified address.

**Return Type**: Numeric

## Examples

### Example 1: Get the amount received by an address with default confirmations

**Command:**
```
verus getreceivedbyaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"
```

**Sample Output:**
```
10.50000000
```

### Example 2: Get the amount received including unconfirmed transactions

**Command:**
```
verus getreceivedbyaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0
```

**Sample Output:**
```
15.75000000
```

### Example 3: Get the amount received with at least 6 confirmations

**Command:**
```
verus getreceivedbyaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 6
```

**Sample Output:**
```
5.25000000
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getreceivedbyaddress", "params": ["RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 5.25000000,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Address Specified:**
   ```
   error code: -1
   error message:
   Address not specified
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid Verus address
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

## Related Commands
- `getreceivedbyaccount`: Returns the total amount received by addresses with the specified account
- `getbalance`: Returns the server's total available balance
- `listreceivedbyaddress`: Lists balances by receiving address
- `validateaddress`: Returns information about the given address
