# Verus RPC Command: listaddressgroupings

## Purpose
The `listaddressgroupings` command provides crucial insights into address relationships by listing groups of addresses whose common ownership has been revealed through transaction patterns. This command is particularly valuable for privacy analysis, wallet organization, and understanding the on-chain footprint of a wallet's activities. It helps users identify which of their addresses have been linked together through common inputs or change outputs in past transactions, potentially informing better privacy practices.

## Description
When executed, this command analyzes the wallet's transaction history to identify sets of addresses that have been used together in transactions, thereby potentially revealing their common ownership to blockchain observers. In Bitcoin-derived cryptocurrencies like Verus, when multiple inputs are used in a transaction, they are presumed to be controlled by the same entity. Similarly, when a transaction generates change, that change address becomes linked to the input addresses. This command exposes these relationships, grouping addresses that have been used together as inputs or where one address has received change from a transaction involving another address. Each group represents a set of addresses that a blockchain analyst could reasonably infer belong to the same owner. This information is valuable for understanding privacy implications of past transactions and for organizing addresses within the wallet based on their public linkage history.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

## Results
The command returns a nested array structure. The outermost array contains groupings of addresses. Each grouping contains an array of address information entries. Each address information entry is an array containing the address, balance, and optionally the account name.

**Return Type**: Array of arrays (nested structure)

## Examples

### Example 1: List address groupings

**Command:**
```
verus listaddressgroupings
```

**Sample Output:**
```
[
  [
    [
      "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
      0.01000000,
      "tabby"
    ],
    [
      "RBgD7GkNsNR7zDcaZFuq5JrkxJ1DYcDMUv",
      2.74846387
    ]
  ],
  [
    [
      "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
      10.00000000
    ]
  ]
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listaddressgroupings", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

2. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
Address groupings reflect public on-chain connections and do not necessarily represent how you might logically organize your funds. In blockchain analysis, addresses in the same group are considered to belong to the same entity due to their usage patterns in transactions. For better privacy, consider using privacy-enhancing techniques like zk-SNARK shielded transactions (z-addresses) in Verus, or careful UTXO management practices to minimize address linkage. The account field is deprecated and included only for backward compatibility.

## Related Commands
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `listreceivedbyaddress`: Lists balances by receiving address
- `listunspent`: Returns array of unspent transaction outputs
- `z_listaddresses`: Lists all z-addresses in the wallet
- `z_sendmany`: Send multiple times from a z-address to multiple addresses