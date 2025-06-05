# Verus RPC Command: getreceivedbyaccount

## Purpose
The `getreceivedbyaccount` command returns the total amount received by addresses with the specified account in transactions with at least the specified number of confirmations. This command is useful for tracking incoming payments to specific accounts.

## Description
When executed with an account name, this command calculates the total amount received by all addresses associated with that account, considering only transactions that have at least the specified minimum number of confirmations. This is helpful for accounting purposes, allowing users to track income by categories. Note that this command is deprecated, as the account system is being phased out in favor of more modern address management approaches.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| account | string | Yes | N/A | MUST be set to the empty string "" to represent the default account |
| minconf | numeric | No | 1 | Only include transactions confirmed at least this many times |

## Results
The command returns a numeric value representing the total amount in VRSC received for the specified account.

**Return Type**: Numeric

## Examples

### Example 1: Get the amount received by the default account

**Command:**
```
verus getreceivedbyaccount ""
```

**Sample Output:**
```
123.45600000
```

### Example 2: Get the amount received including unconfirmed transactions

**Command:**
```
verus getreceivedbyaccount "tabby" 0
```

**Sample Output:**
```
500.00000000
```

### Example 3: Get the amount received with at least 6 confirmations

**Command:**
```
verus getreceivedbyaccount "tabby" 6
```

**Sample Output:**
```
400.00000000
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getreceivedbyaccount", "params": ["tabby", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": 400.00000000,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Account Specified:**
   ```
   error code: -8
   error message:
   Account name required
   ```

2. **Potential Error - Invalid Account Parameter:**
   ```
   error code: -8
   error message:
   Account must be a string
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
- `getreceivedbyaddress`: Returns the amount received by a specific address
- `getbalance`: Returns the server's total available balance
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `listreceivedbyaccount`: List balances by account
