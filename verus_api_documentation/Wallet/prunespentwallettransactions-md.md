# Verus RPC Command: prunespentwallettransactions

## Purpose
The `prunespentwallettransactions` command removes transactions from the wallet database that have been fully spent and are no longer needed for reference. This command is essential for wallet maintenance and optimization, helping to reduce wallet file size, improve wallet performance, decrease loading times, and minimize resource usage. It provides a mechanism to clean up historical transaction data while preserving the wallet's current financial state and optionally maintaining specific transactions of interest.

## Description
When executed with or without the optional transaction ID parameter, this command analyzes the wallet's transaction history and removes entries for transactions where all outputs have been spent. This pruning process helps manage the growth of the wallet.dat file, which can become large over time due to accumulated transaction history, especially for wallets with high transaction volumes. The command offers the flexibility to preserve a specific transaction by providing its transaction ID as a parameter, which is useful when certain transaction records need to be maintained for reference, accounting, or legal purposes. Upon completion, the command returns statistics about the pruning operation, including the total number of transactions present before pruning, the number of transactions remaining after pruning, and the number of transactions that were removed. This functionality is particularly valuable for long-running wallets or those used in high-volume scenarios, as it helps maintain optimal wallet performance without losing essential financial information.

**Command Type**: Maintenance/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | No | N/A | The transaction id to keep |

## Results
The command returns an object containing statistics about the pruning operation.

**Return Type**: Object

## Examples

### Example 1: Prune all spent transactions from the wallet

**Command:**
```
verus prunespentwallettransactions
```

**Sample Output:**
```
{
  "total_transactions": 1257,
  "remaining_transactions": 42,
  "removed_transactions": 1215
}
```

### Example 2: Prune wallet but keep a specific transaction

**Command:**
```
verus prunespentwallettransactions "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"
```

**Sample Output:**
```
{
  "total_transactions": 1257,
  "remaining_transactions": 43,
  "removed_transactions": 1214
}
```

### Example 3: Using JSON-RPC via curl to prune all spent transactions

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "prunespentwallettransactions", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

### Example 4: Using JSON-RPC via curl to prune but keep a specific transaction

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "prunespentwallettransactions", "params": ["1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -5
   error message:
   Invalid transaction id
   ```

2. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not found in wallet
   ```

3. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

4. **Potential Error - Database Error:**
   ```
   error code: -4
   error message:
   Error accessing wallet database
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
Please backup your wallet.dat file before running this command to prevent potential data loss in case of unforeseen issues during the pruning process. This command only removes transactions where all outputs have been fully spent, ensuring that no currently spendable funds are affected. Pruning is a permanent operation and cannot be undone once completed, so exercise caution. The wallet's current balance and spendable funds are not affected by this operation, as it only removes historical data for fully spent transactions. While this command can significantly reduce wallet size, it may also remove transaction history that could be useful for accounting or tax purposes, so consider your record-keeping needs before pruning.

## Related Commands
- `backupwallet`: Creates a backup of the wallet file
- `dumpwallet`: Creates a human-readable dump of the wallet keys and metadata
- `importwallet`: Imports keys from a wallet dump file
- `gettransaction`: Get detailed information about a transaction
- `listtransactions`: Returns the most recent transactions in the wallet