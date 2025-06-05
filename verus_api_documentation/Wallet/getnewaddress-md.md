# Verus RPC Command: getnewaddress

## Purpose
The `getnewaddress` command returns a new Verus address for receiving payments. This command is essential for generating unique addresses to receive funds or track specific payments.

## Description
When executed, this command creates a new address in the wallet and returns it. This is useful for creating unique payment addresses for different sources, improving privacy and accounting. If an account is specified, the new address is associated with that account, although the account system is deprecated.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| account | string | No | "" | DEPRECATED. If provided, it MUST be set to the empty string "" to represent the default account |

## Results
The command returns a string representing the new Verus address.

**Return Type**: String

## Examples

### Example 1: Get a new address with default parameters

**Command:**
```
verus getnewaddress
```

**Sample Output:**
```
RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV
```

### Example 2: Get a new address for the default account

**Command:**
```
verus getnewaddress ""
```

**Sample Output:**
```
REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnewaddress", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

1. **Potential Error - Invalid Account Parameter:**
   ```
   error code: -8
   error message:
   Account must be a string
   ```

2. **Potential Error - Non-Empty Account String:**
   ```
   error code: -8
   error message:
   Account must be empty string
   ```

3. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaccountaddress`: Returns the current address for receiving payments to this account
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `getrawchangeaddress`: Returns a new address for receiving change
- `validateaddress`: Returns information about the given address
