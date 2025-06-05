# Verus RPC Command: listreceivedbyaddress

## Purpose
The `listreceivedbyaddress` command provides a detailed breakdown of funds received by each address in the wallet. This command is invaluable for monitoring income, tracking customer payments, reconciling financial records, and analyzing the distribution of funds across different wallet addresses. It offers a comprehensive view of the wallet's receiving history on an address-by-address basis, facilitating precise financial tracking and reporting.

## Description
When executed with the appropriate parameters, this command analyzes the wallet's transaction history and generates a detailed report of all amounts received by each address. The command aggregates multiple payments to the same address, providing a cumulative total that reflects the overall funds received at each location. This granular address-level view enables users to monitor specific payment channels or segregate income sources effectively. The command supports filtering based on confirmation thresholds, allowing users to distinguish between confirmed and unconfirmed income. It also offers options to include addresses that have never received payments and to incorporate watch-only addresses (addresses for which the wallet has public keys but no private keys). Each entry in the returned list includes the receiving address, total amount received, confirmation information, and account label if assigned, providing a comprehensive financial snapshot organized by address.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minconf | numeric | No | 1 | The minimum number of confirmations before payments are included |
| includeempty | numeric | No | false | Whether to include addresses that haven't received any payments |
| includeWatchonly | boolean | No | false | Whether to include watchonly addresses (see 'importaddress') |

## Results
The command returns an array of objects, each representing an address and its received funds.

**Return Type**: Array of objects

## Examples

### Example 1: List received by address with default parameters

**Command:**
```
verus listreceivedbyaddress
```

**Sample Output:**
```
[
  {
    "involvesWatchonly": false,
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "account": "donations",
    "amount": 4.50000000,
    "confirmations": 30
  },
  {
    "involvesWatchonly": false,
    "address": "RBgD7GkNsNR7zDcaZFuq5JrkxJ1DYcDMUv",
    "account": "",
    "amount": 15.40000000,
    "confirmations": 124
  }
]
```

### Example 2: List received by address with minimum 6 confirmations and include empty addresses

**Command:**
```
verus listreceivedbyaddress 6 true
```

**Sample Output:**
```
[
  {
    "involvesWatchonly": false,
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "account": "donations",
    "amount": 4.50000000,
    "confirmations": 30
  },
  {
    "involvesWatchonly": false,
    "address": "RBgD7GkNsNR7zDcaZFuq5JrkxJ1DYcDMUv",
    "account": "",
    "amount": 15.40000000,
    "confirmations": 124
  },
  {
    "involvesWatchonly": false,
    "address": "RC5tKS4jQimLhSA7BkQXDLB2vqPQHWFv5V",
    "account": "new",
    "amount": 0.00000000,
    "confirmations": 0
  }
]
```

### Example 3: Using JSON-RPC via curl with all parameters

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listreceivedbyaddress", "params": [6, true, true] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
The `account` field is deprecated and included only for backward compatibility. The `confirmations` field shows the number of confirmations of the most recent transaction included in the calculation of the address's balance. This command only tracks transparent address transactions; for shielded address transactions, consider using z-address specific commands. If an address has received multiple payments, the `amount` field will show the cumulative total of all received payments, and the `confirmations` field will reflect the confirmation count of the most recent transaction.

## Related Commands
- `getreceivedbyaddress`: Returns the total amount received by the given address
- `listaccounts`: Returns a list of all accounts in the wallet
- `listreceivedbyaccount`: Lists balances by account
- `getnewaddress`: Returns a new Verus address for receiving payments
- `z_listreceivedbyaddress`: Lists amounts received by a z-address