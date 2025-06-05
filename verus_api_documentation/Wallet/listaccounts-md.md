# Verus RPC Command: listaccounts

## Purpose
The `listaccounts` command, though deprecated, provides a comprehensive overview of all accounts in the wallet along with their respective balances. This command serves as a financial dashboard that enables users to monitor funds across different logical groupings within a single wallet, facilitating account-based bookkeeping, fund segregation by purpose or entity, and simplified financial tracking for various wallet compartments.

## Description
When executed, this command returns a JSON object where each key represents an account name and each value indicates the total balance for that account in VRSCTEST. The account system in the wallet functions as a logical organizational layer that allows users to categorize addresses and their associated funds without requiring separate wallet files. This structure can be useful for separating personal funds from business expenses, tracking different projects or departments, or maintaining client-specific balances. The command supports filtering based on minimum confirmation requirements and can optionally include balances from watch-only addresses (addresses for which the wallet has public keys but no private keys). Despite being deprecated, the command remains available for backward compatibility with existing systems and workflows.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet  
**Deprecated Status**: This command is deprecated and may be removed in future versions of Verus.

## Arguments
The command accepts two optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minconf | numeric | No | 1 | Only include transactions with at least this many confirmations |
| includeWatchonly | boolean | No | false | Include balances in watchonly addresses (see 'importaddress') |

## Results
The command returns a JSON object where account names are keys and account balances are numeric values.

**Return Type**: Object (JSON)

## Examples

### Example 1: List account balances with at least 1 confirmation

**Command:**
```
verus listaccounts
```

**Sample Output:**
```
{
  "": 23.76001231,
  "tabby": 2.73920000,
  "marketing": 14.52416262
}
```

### Example 2: List account balances including zero confirmation transactions

**Command:**
```
verus listaccounts 0
```

**Sample Output:**
```
{
  "": 23.89000000,
  "tabby": 2.73920000,
  "marketing": 14.52416262
}
```

### Example 3: List account balances for 6 or more confirmations

**Command:**
```
verus listaccounts 6
```

**Sample Output:**
```
{
  "": 21.45700000,
  "tabby": 2.73920000,
  "marketing": 14.52416262
}
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listaccounts", "params": [6] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid confirmation parameter, must be a non-negative integer
   ```

2. **Potential Error - Invalid Watchonly Parameter:**
   ```
   error code: -8
   error message:
   Invalid includeWatchonly parameter, must be a boolean
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet is not available
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
This command is deprecated and maintained only for backward compatibility. The account system is being phased out in newer versions of the Verus wallet. The empty account name ("") represents the default account, which contains all addresses not explicitly assigned to other accounts. Balances shown are only for transparent addresses; to view balances for shielded addresses, use the `z_getbalance` or `z_gettotalbalance` commands.

## Related Commands
- `getaccount`: Returns the account associated with a given address
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `move`: Move funds between accounts within the same wallet
- `sendfrom`: Send from a specific account to a Verus address
- `getbalance`: Get the balance in the wallet or in a specific account