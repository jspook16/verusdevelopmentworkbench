# Verus RPC Command: listreceivedbyaccount

## Purpose
The `listreceivedbyaccount` command, while deprecated, provides an account-centric view of received funds within the wallet. This command aggregates incoming transactions by their assigned accounts, creating a comprehensive financial summary that enables users to track and monitor income across different logical categories. This functionality is particularly valuable for bookkeeping, financial reporting, and maintaining separate accounting buckets within a single wallet.

## Description
When executed with the appropriate parameters, this command analyzes the wallet's transaction history and consolidates received amounts according to the account designations assigned to the receiving addresses. Unlike address-based tracking, this account-centric approach offers a higher-level abstraction that aligns with traditional accounting practices. The command can be tailored to include only transactions with a specified minimum number of confirmations, ensuring that reports can distinguish between confirmed and unconfirmed income. It also offers the option to include or exclude empty accounts (those with no received payments) and to incorporate watch-only addresses, providing flexibility for various reporting needs. Each entry in the returned list includes the account name, total amount received by that account, and confirmation information that helps assess the finality of the received funds.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet  
**Deprecated Status**: This command is deprecated and may be removed in future versions of Verus.

## Arguments
The command accepts three optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minconf | numeric | No | 1 | The minimum number of confirmations before payments are included |
| includeempty | boolean | No | false | Whether to include accounts that haven't received any payments |
| includeWatchonly | boolean | No | false | Whether to include watchonly addresses (see 'importaddress') |

## Results
The command returns an array of objects, each representing an account and its received funds.

**Return Type**: Array of objects

## Examples

### Example 1: List received by account with default parameters

**Command:**
```
verus listreceivedbyaccount
```

**Sample Output:**
```
[
  {
    "account": "default",
    "amount": 10.52000000,
    "confirmations": 583
  },
  {
    "account": "marketing",
    "amount": 5.34000000,
    "confirmations": 124
  }
]
```

### Example 2: List received by account with minimum 6 confirmations and include empty accounts

**Command:**
```
verus listreceivedbyaccount 6 true
```

**Sample Output:**
```
[
  {
    "account": "default",
    "amount": 10.52000000,
    "confirmations": 583
  },
  {
    "account": "marketing",
    "amount": 5.34000000,
    "confirmations": 124
  },
  {
    "account": "development",
    "amount": 0.00000000,
    "confirmations": 0
  }
]
```

### Example 3: Using JSON-RPC via curl with all parameters

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listreceivedbyaccount", "params": [6, true, true] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf parameter, must be a non-negative integer
   ```

2. **Potential Error - Invalid Boolean Parameter:**
   ```
   error code: -8
   error message:
   Invalid includeempty parameter, must be a boolean
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
This command is deprecated and maintained only for backward compatibility. The account system is being phased out in newer versions of the Verus wallet. The `confirmations` field in the results shows the number of confirmations of the most recent transaction included in the calculation of the account's balance. This command only tracks transparent address transactions; for shielded address transactions, consider using z-address specific commands.

## Related Commands
- `getaccount`: Returns the account associated with the given address
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `listaccounts`: Returns a list of all accounts in the wallet
- `listreceivedbyaddress`: Lists balances by receiving address
- `sendfrom`: Send from a specific account to a Verus address