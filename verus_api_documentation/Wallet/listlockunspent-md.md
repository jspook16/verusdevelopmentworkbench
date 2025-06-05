# Verus RPC Command: listlockunspent

## Purpose
The `listlockunspent` command returns a detailed list of all temporarily unspendable transaction outputs (UTXOs) in the wallet. This command is essential for advanced coin control and transaction management, allowing users to view which specific outputs have been manually locked with the `lockunspent` command and are currently excluded from being automatically selected for new transactions. This functionality enables precise control over which funds are used in transactions, which is valuable for privacy management, fee optimization, and multisignature workflow coordination.

## Description
When executed, this command queries the wallet database and returns a comprehensive list of all transaction outputs that have been temporarily marked as unspendable using the `lockunspent` command. These locked outputs will not be automatically selected by the wallet when creating new transactions, even if they would otherwise be suitable candidates based on amount and confirmation criteria. Each entry in the returned list includes the transaction ID (txid) and output index (vout) that uniquely identify the specific output. This locking mechanism is memory-only and not persistent across node restarts - all locks are cleared when the node stops or crashes. The command is particularly useful for advanced wallet management scenarios where users need precise control over UTXO selection, such as when preparing for multisignature transactions, coordinating complex payment protocols, preserving specific UTXOs for future use, or managing coin age for staking.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

## Results
The command returns an array of objects, each representing a locked unspent transaction output with its transaction ID and output index.

**Return Type**: Array of objects

## Examples

### Example 1: List the locked unspent transactions

**Command:**
```
verus listlockunspent
```

**Sample Output:**
```
[
  {
    "txid": "a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0",
    "vout": 1
  },
  {
    "txid": "b27fd7e6b61df7bdb9b7f9b7f8b5f8f5e4b8f7b6c5d4e3f2a1b2c3d4e5f6a7b8",
    "vout": 0
  }
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listlockunspent", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
The locked status of outputs is only maintained in memory and does not persist when the Verus daemon is restarted. All outputs become available (unlocked) when the node restarts or crashes. This command works in conjunction with the `lockunspent` command, which is used to lock and unlock specific outputs. To view all available (unlocked) transaction outputs, use the `listunspent` command.

## Related Commands
- `lockunspent`: Updates list of temporarily unspendable outputs (locks or unlocks specified outputs)
- `listunspent`: Returns array of all unspent transaction outputs available for spending
- `sendrawtransaction`: Submits a raw transaction to the network
- `createrawtransaction`: Creates a transaction using the provided inputs and outputs
- `fundrawtransaction`: Adds inputs to a transaction until it has enough value to meet its out value