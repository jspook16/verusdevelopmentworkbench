# Verus RPC Command: rescanfromheight

## Purpose
The `rescanfromheight` command rescans the current wallet from a specified blockchain height. This command is essential for recovering missing transactions, synchronizing wallet data after restoring from backup, or resolving inconsistencies between blockchain and wallet state. It provides a way to refresh wallet information without restarting the entire node or rebuilding the blockchain index.

## Description
When executed, this command initiates a thorough rescan of the blockchain from the specified height up to the current chain tip. During this process, the wallet examines each block and transaction to identify those relevant to the wallet's addresses. This operation updates the wallet's transaction history, balances, and UTXO set based on the blockchain data. It's particularly useful after importing keys, recovering wallets, or when the wallet might have missed transactions due to connectivity issues or other technical problems. The deeper the rescan starts from (i.e., the lower the height), the more comprehensive but time-consuming the operation will be.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | numeric | No | 0 | The blockchain height from which to start the rescan |

## Results
The command does not return a specific value but may provide status updates during the rescan process.

**Return Type**: None

## Examples

### Example 1: Initiate rescan of entire chain

**Command:**
```
verus rescanfromheight 
```

**Notes:**
This will start a rescan from height 0 (the genesis block), which may take a very long time to complete on large chains.

### Example 2: Initiate rescan from block 1000000

**Command:**
```
verus rescanfromheight 1000000
```

**Notes:**
This will start a rescan from block height 1000000, which is faster than rescanning the entire chain.

## Potential Error Cases

1. **Potential Error - Invalid Height Parameter:**
   ```
   error code: -8
   error message:
   Invalid height parameter, must be a positive number or zero
   ```

2. **Potential Error - Wallet not available:**
   ```
   error code: -18
   error message:
   Error: Wallet is not available
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
This call can take minutes or even hours to complete on very large wallets and rescans. It is advisable to monitor system resources during the operation, and consider using a more recent starting height when possible to reduce the processing time.

## Related Commands
- `importprivkey`: Imports a private key to your wallet (with optional rescan)
- `importwallet`: Imports a wallet dump file (with automatic rescan)
- `z_importkey`: Imports a z-address private key (with optional rescan)
- `z_importviewingkey`: Imports a z-address viewing key (with optional rescan)