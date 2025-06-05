# Verus RPC Command: listsinceblock

## Purpose
The `listsinceblock` command retrieves a comprehensive list of wallet transactions that have occurred since a specified block, or all transactions if no block is specified. This command is crucial for synchronizing external systems with blockchain activity, reconciling wallet state after downtime, generating transaction reports for specific time periods, and monitoring wallet activity since a known checkpoint. It provides an efficient way to catch up on transaction history without processing the entire wallet history.

## Description
When executed with the appropriate parameters, this command queries the wallet's transaction database and returns detailed information about all transactions that occurred after the specified block. If no block is specified, it returns all wallet transactions. Each transaction entry in the result contains extensive details including the transaction category (send/receive), amount, address, transaction ID, confirmation status, block information, timestamps, and any associated comments. The command also returns the hash of the latest block in the chain, allowing clients to use this value as a reference point for subsequent calls to track ongoing transactions incrementally. This functionality is particularly valuable for applications that need to maintain synchronized records with the blockchain, such as accounting systems, exchange platforms, or monitoring tools.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blockhash | string | No | Null | The block hash to list transactions since |
| target-confirmations | numeric | No | 1 | The confirmations required, must be 1 or more |
| includeWatchonly | boolean | No | false | Include transactions to watchonly addresses (see 'importaddress') |

## Results
The command returns an object with two fields: an array of transactions and the hash of the last block.

**Return Type**: Object

## Examples

### Example 1: List all transactions in the wallet

**Command:**
```
verus listsinceblock
```

**Sample Output:**
```
{
  "transactions": [
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
      "comment": "payment for services"
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
      "to": "landlord"
    }
  ],
  "lastblock": "000000000000000bacf66f7497b7dc45ef753ee9a7d38571037cdb1a57f663ad"
}
```

### Example 2: List transactions since a specific block with 6 confirmations

**Command:**
```
verus listsinceblock "000000000000000bacf66f7497b7dc45ef753ee9a7d38571037cdb1a57f663ad" 6
```

**Sample Output:**
```
{
  "transactions": [
    {
      "account": "",
      "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
      "category": "receive",
      "amount": 2.50000000,
      "vout": 0,
      "confirmations": 12,
      "blockhash": "0000000000000000e89778970a1cd187c5679c102cdb59349c0e98d2b8998675",
      "blockindex": 2,
      "blocktime": 1573821345,
      "txid": "c6a9a6154c369f0e563d4b1f728fae5448d0893f553ac527d050b0293f317a7d",
      "time": 1573821322,
      "timereceived": 1573821322
    }
  ],
  "lastblock": "000000000000000898eafdc0e1bfc28845998e18107f622694d35b32354940d9"
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listsinceblock", "params": ["000000000000000bacf66f7497b7dc45ef753ee9a7d38571037cdb1a57f663ad", 6] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Block Hash:**
   ```
   error code: -5
   error message:
   Block not found
   ```

2. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid target-confirmations parameter, must be a positive integer
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
The `lastblock` field in the response provides the hash of the most recent block in the chain, which can be used as the `blockhash` parameter in subsequent calls to this command to get only new transactions. Transactions with negative amounts are outgoing (send), while those with positive amounts are incoming (receive). This command only shows transparent address transactions; for shielded transactions, consider using z-address specific commands.

## Related Commands
- `listtransactions`: Returns the most recent transactions in the wallet
- `gettransaction`: Get detailed information about a specific transaction
- `listunspent`: Returns array of unspent transaction outputs
- `getblock`: Returns information about the specified block
- `z_listreceivedbyaddress`: Lists amounts received by a z-address