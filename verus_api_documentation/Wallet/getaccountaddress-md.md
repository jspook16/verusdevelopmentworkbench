# Verus RPC Command: getaccountaddress

## Purpose
The `getaccountaddress` command returns the current Verus address for receiving payments to a specific account. This command is useful for generating or retrieving addresses tied to specific accounts within the wallet.

## Description
When provided with an account name, this command returns the current address associated with that account for receiving payments. If no address exists for the account, a new one is created. Note that this command is deprecated, as the account system is being phased out in favor of more modern address management approaches.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| account | string | Yes | N/A | MUST be set to the empty string "" to represent the default account. Passing any other string will result in an error |

## Results
The command returns a string representing the Verus address for receiving payments to the specified account.

**Return Type**: String

## Examples

### Example 1: Get the address for the default account

**Command:**
```
verus getaccountaddress ""
```

**Sample Output:**
```
RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV
```

### Example 2: Get the address for a specific account

**Command:**
```
verus getaccountaddress "myaccount"
```

**Sample Output:**
```
REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaccountaddress", "params": ["myaccount"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Account Parameter Not String:**
   ```
   error code: -8
   error message:
   Account must be a string
   ```

2. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaccount`: Returns the account associated with the given address
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `getnewaddress`: Returns a new Verus address for receiving payments
- `getbalance`: Returns the balance in the wallet
