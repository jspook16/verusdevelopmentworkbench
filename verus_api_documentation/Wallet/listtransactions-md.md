# Verus RPC Command: listtransactions

## Purpose
The `listtransactions` command retrieves a detailed list of recent wallet transactions, providing comprehensive visibility into the wallet's financial activity. This command is essential for monitoring transaction history, generating financial reports, reconciling accounts, troubleshooting payment issues, and maintaining accurate records of wallet activities. It serves as the primary tool for users to review and analyze their transaction flow.

## Description
When executed with the appropriate parameters, this command queries the wallet's transaction database and returns a chronologically ordered list of transactions, with the most recent ones first. Each transaction entry contains extensive information including the transaction category (send, receive, or move), amount, associated address, confirmation status, transaction ID, timestamp, and any memo data or comments attached to the transaction. The command offers flexible pagination through count and from parameters, allowing users to retrieve specific transaction ranges for efficient processing of large transaction histories. Additionally, it supports filtering by account (though this feature is deprecated) and can optionally include watch-only addresses, providing adaptable views of transaction data based on specific needs. This rich transaction data enables users to track fund flows, verify payment completions, audit wallet activity, and maintain accurate financial records.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts four optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| account | string | No | "*" | DEPRECATED. The account name. Should be "*". |
| count | numeric | No | 10 | The number of transactions to return |
| from | numeric | No | 0 | The number of transactions to skip |
| includeWatchonly | boolean | No | false | Include transactions to watchonly addresses (see 'importaddress') |

## Results
The command returns an array of objects, each containing detailed information about a transaction.

**Return Type**: Array of objects

## Examples

### Example 1: List the most recent 10 transactions in the wallet

**Command:**
```
verus listtransactions
```

**Sample Output:**
```
[
  {
    "account": "",
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "category": "receive",
    "amount": 10.00000000,
    "vout": 0,
    "confirmations": 65,
    "blockhash": "00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048",
    "blockindex": 1,
    "blocktime": 1573721956,
    "txid": "f2b268d04843c91cc0a0f65f804aa40e0e62513850550f906729b01e953c28a0",
    "time": 1573721938,
    "timereceived": 1573721938,
    "comment": "payment for services",
    "size": 225
  },
  {
    "account": "",
    "address": "RBgD7GkNsNR7zDcaZFuq5JrkxJ1DYcDMUv",
    "category": "send",
    "amount": -5.00000000,
    "vout": 1,
    "fee": -0.00010000,
    "confirmations": 30,
    "blockhash": "000000008b630b3aae99b6fe215548168bed92167c47a2f7ba4e3d56ccb67d0d",
    "blockindex": 3,
    "blocktime": 1573735412,
    "txid": "b5f484c07c3b217941b7e7c7af10106c7ac7c8ff8e4213c1c8e5ca557435dbd7",
    "time": 1573735384,
    "timereceived": 1573735384,
    "comment": "monthly rent",
    "otheraccount": "landlord",
    "size": 226
  }
]
```

### Example 2: List transactions 100 to 120

**Command:**
```
verus listtransactions "*" 20 100
```

**Sample Output:**
```
[
  {
    "account": "",
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "category": "receive",
    "amount": 0.50000000,
    "vout": 0,
    "confirmations": 350,
    "blockhash": "000000007bc154e0fa7ea32218a72fe2c1bb9f86cf8c9ebf9a715ed27fdb229a",
    "blockindex": 1,
    "blocktime": 1570735412,
    "txid": "a5f484c07c3b217941b7e7c7af10106c7ac7c8ff8e4213c1c8e5ca557435dbd7",
    "time": 1570735384,
    "timereceived": 1570735384,
    "size": 225
  },
  ...
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listtransactions", "params": ["*", 20, 100] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Count Parameter:**
   ```
   error code: -8
   error message:
   Invalid count parameter, must be a non-negative integer
   ```

2. **Potential Error - Invalid From Parameter:**
   ```
   error code: -8
   error message:
   Invalid from parameter, must be a non-negative integer
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
The `account` parameter is deprecated and maintained only for backward compatibility. Use "*" to list transactions from all accounts. The transactions are listed in reverse chronological order, with the most recent transactions first. The 'move' category represents internal wallet transfers between accounts and is not associated with blockchain transactions. This command only shows transparent address transactions; for shielded transactions, consider using z-address specific commands.

## Related Commands
- `gettransaction`: Get detailed information about a specific transaction
- `listsinceblock`: Get all transactions in blocks since a specified block
- `listunspent`: Returns array of unspent transaction outputs
- `sendtoaddress`: Send an amount to a given address
- `z_listreceivedbyaddress`: Lists amounts received by a z-address