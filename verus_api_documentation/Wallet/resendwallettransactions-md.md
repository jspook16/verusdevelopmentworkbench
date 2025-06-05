# Verus RPC Command: resendwallettransactions

## Purpose
The `resendwallettransactions` command immediately re-broadcasts all unconfirmed wallet transactions to all connected peers on the network. This command is crucial for resolving issues with transactions that appear to be stuck or unconfirmed, especially in situations where network congestion or connectivity issues might have prevented proper propagation of transactions across the network. It provides a manual override to the wallet's automatic rebroadcasting mechanism.

## Description
When executed, this command identifies all transactions in the wallet that have been created and signed but not yet confirmed in a block, and immediately re-broadcasts them to all connected peers. While the Verus wallet automatically rebroadcasts pending transactions periodically, this command forces an immediate rebroadcast, which can be helpful in troubleshooting scenarios or when wanting to ensure maximum propagation of time-sensitive transactions. The rebroadcast increases the likelihood that miners will include the transactions in the next blocks they mine, potentially speeding up confirmation times for transactions that might otherwise be delayed.

**Command Type**: Action/Network  
**Protocol Level**: Wallet/Network  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

## Results
The command returns an array of transaction IDs that were re-broadcast.

**Return Type**: Array of strings (transaction IDs)

## Examples

### Example 1: Rebroadcast unconfirmed wallet transactions

**Command:**
```
verus resendwallettransactions
```

**Sample Output:**
```
[
  "7e9450980c2b755234a447d85840d4f62c3d8d1e6d3f50e2d41b1a580e5d6144",
  "c9959aafbee78e314298f4d9e323e5cc5af8cd6950c8b26c368c086a8ec25e22"
]
```

## Potential Error Cases

1. **Potential Error - Wallet not available:**
   ```
   error code: -18
   error message:
   Error: Wallet not available
   ```

2. **Potential Error - No Network Connection:**
   ```
   error code: -9
   error message:
   Verus is not connected to the network
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
This command is intended only for testing or troubleshooting purposes. Under normal circumstances, the wallet code periodically re-broadcasts unconfirmed transactions automatically, making manual intervention unnecessary. Excessive use of this command, especially in short intervals, may cause unnecessary network traffic and could potentially be interpreted as abusive behavior by network peers.

## Related Commands
- `sendtoaddress`: Sends an amount to a given address
- `sendmany`: Send multiple times to multiple addresses
- `gettransaction`: Get detailed information about a transaction
- `listunspent`: Returns array of unspent transaction outputs