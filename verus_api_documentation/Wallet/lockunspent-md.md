# Verus RPC Command: lockunspent

## Purpose
The `lockunspent` command provides advanced control over unspent transaction outputs (UTXOs) by temporarily locking or unlocking specified outputs to exclude or include them from automatic coin selection. This command is essential for precise UTXO management, enabling users to reserve specific outputs for particular transactions, implement custom coin selection strategies, coordinate complex multi-party transactions, and maintain fund availability for time-sensitive operations, all without needing to move funds to separate wallets.

## Description
When executed with the appropriate parameters, this command updates the wallet's internal database of temporarily locked outputs, either adding outputs to the locked list (when unlock=false) or removing them (when unlock=true). Locked outputs are excluded from automatic coin selection when creating new transactions through high-level commands like `sendtoaddress` or `sendmany`, though they remain fully visible and countable in the wallet balance. This temporary locking mechanism provides a powerful way to control exactly which outputs are available for spending without requiring complex wallet management or fund segregation strategies. The lock status is maintained only in memory and is not persisted across wallet restarts, ensuring that all outputs automatically become available again if the node stops or restarts. This behavior provides a safety mechanism that prevents funds from becoming permanently unavailable due to lock status.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, both required:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| unlock | boolean | Yes | N/A | Whether to unlock (true) or lock (false) the specified transactions |
| transactions | array | Yes | N/A | A JSON array of objects, each with a transaction id (txid) and output number (vout) |

## Results
The command returns a boolean indicating whether the operation was successful.

**Return Type**: Boolean

## Examples

### Example 1: Lock an unspent transaction output

**Command:**
```
verus lockunspent false "[{\"txid\":\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\",\"vout\":1}]"
```

**Sample Output:**
```
true
```

### Example 2: Unlock a previously locked transaction output

**Command:**
```
verus lockunspent true "[{\"txid\":\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\",\"vout\":1}]"
```

**Sample Output:**
```
true
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "lockunspent", "params": [false, "[{\"txid\":\"a08e6907dbbd3d809776dbfc5d82e371b764ed838b5655e72f463568df1aadf0\",\"vout\":1}]"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Unlock Parameter:**
   ```
   error code: -8
   error message:
   Invalid unlock parameter, must be a boolean
   ```

2. **Potential Error - Invalid Transaction Format:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected json array of objects
   ```

3. **Potential Error - Missing Transaction Fields:**
   ```
   error code: -8
   error message:
   Invalid parameter, missing txid or vout key
   ```

4. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   Invalid parameter, txid must be hexadecimal string
   ```

5. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
Locks are stored in memory only and are not persisted across wallet restarts. Nodes start with zero locked outputs, and the locked output list is automatically cleared when a node stops or crashes. This provides a safety mechanism to prevent funds from becoming permanently unavailable due to lock status. Locking outputs does not affect their confirmation status or ownership; it only prevents them from being automatically selected for spending. Locked outputs still contribute to the wallet's total balance.

## Related Commands
- `listlockunspent`: Returns a list of temporarily unspendable outputs
- `listunspent`: Returns array of all unspent transaction outputs available for spending
- `createrawtransaction`: Creates a transaction using the provided inputs and outputs
- `fundrawtransaction`: Adds inputs to a transaction until it has enough value to meet its out value
- `sendrawtransaction`: Submits a raw transaction to the network