# Verus RPC Command: addmultisigaddress

## Purpose
The `addmultisigaddress` command adds a nrequired-to-sign multisignature address to the wallet. This command is useful for creating addresses that require multiple signatures to authorize transactions, enhancing security and enabling shared control of funds.

## Description
When executed with the appropriate parameters, this command creates a multisignature address that requires a specified number of signatures from a set of provided public keys or addresses. The created address is added to the wallet, allowing it to track transactions involving that address. Multisignature addresses are useful for scenarios requiring joint control of funds or enhanced security through multiple signing requirements.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three arguments, two required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| nrequired | numeric | Yes | N/A | The number of required signatures out of the n keys or addresses |
| keysobject | string | Yes | N/A | A JSON array of Verus addresses or hex-encoded public keys |
| account | string | No | "" | DEPRECATED. If provided, MUST be set to the empty string "" to represent the default account |

## Results
The command returns a string representing the Verus address associated with the multisignature keys.

**Return Type**: String

## Examples

### Example 1: Add a multisig address requiring 2 signatures from 2 addresses

**Command:**
```
verus addmultisigaddress 2 "[\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\",\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\"]"
```

**Sample Output:**
```
bHq8ox4oXDQN8bFVrYN13vZJxau8yQXQQ8
```

### Example 2: Add a multisig address with a label (default account)

**Command:**
```
verus addmultisigaddress 2 "[\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\",\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\"]" ""
```

**Sample Output:**
```
bHq8ox4oXDQN8bFVrYN13vZJxau8yQXQQ8
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "addmultisigaddress", "params": [2, "[\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\",\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\"]"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "bHq8ox4oXDQN8bFVrYN13vZJxau8yQXQQ8",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid nrequired Value:**
   ```
   error code: -8
   error message:
   Invalid parameter, nrequired must be a positive number <= number of keys
   ```

2. **Potential Error - Invalid Key Format:**
   ```
   error code: -5
   error message:
   Invalid public key or address
   ```

3. **Potential Error - Non-Empty Account String:**
   ```
   error code: -8
   error message:
   Account parameter must be empty string if provided
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `createmultisig`: Creates a multi-signature address but does not add it to the wallet
- `importaddress`: Adds an address or script to the wallet without the private key
- `validateaddress`: Returns information about the given address
- `getnewaddress`: Returns a new Verus address for receiving payments
