# Verus RPC Command: getaddressesbyaccount

## Purpose
The `getaddressesbyaccount` command returns the list of addresses for the given account. This command is useful for retrieving all addresses associated with a specific account in the wallet.

## Description
When provided with an account name, this command returns a JSON array of all Verus addresses that are associated with that account. This can be helpful for identifying all addresses belonging to a particular logical grouping within the wallet. Note that this command is deprecated, as the account system is being phased out in favor of more modern address management approaches.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| account | string | Yes | N/A | MUST be set to the empty string "" to represent the default account. Passing any other string will result in an error |

## Results
The command returns a JSON array of strings, each representing a Verus address associated with the given account.

**Return Type**: Array of strings

## Examples

### Example 1: Get addresses for the default account

**Command:**
```
verus getaddressesbyaccount ""
```

**Sample Output:**
```json
[
  "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
  "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b",
  "R9wprka91hbVWjnkzHYXtGPBpp7DHwznRk"
]
```

### Example 2: Get addresses for a specific account

**Command:**
```
verus getaddressesbyaccount "tabby"
```

**Sample Output:**
```json
[
  "RKJGGLpSFgvyDnj7jFNQccTAooBcK8qRBr",
  "RTZMdKmzWY3o3JTiKUaJ9s1nJX5uPn3RHs"
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressesbyaccount", "params": ["tabby"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    "RKJGGLpSFgvyDnj7jFNQccTAooBcK8qRBr",
    "RTZMdKmzWY3o3JTiKUaJ9s1nJX5uPn3RHs"
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Account Name Provided:**
   ```
   error code: -8
   error message:
   Account name required
   ```

2. **Potential Error - Account Parameter Not String:**
   ```
   error code: -8
   error message:
   Account must be a string
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaccount`: Returns the account associated with the given address
- `getaccountaddress`: Returns the current address for receiving payments to this account
- `getnewaddress`: Returns a new Verus address for receiving payments
- `getbalance`: Returns the balance in the wallet
