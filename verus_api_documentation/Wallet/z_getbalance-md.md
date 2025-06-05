# Verus RPC Command: z_getbalance

## Purpose
The `z_getbalance` command retrieves the balance of a specific address belonging to the wallet, with support for both transparent addresses (taddr) and shielded addresses (zaddr). This command is essential for monitoring funds across different address types, verifying received payments, tracking address-specific balances, and maintaining financial records. Unlike the standard `getbalance` command, it provides explicit support for shielded addresses and their enhanced privacy features.

## Description
When executed with the appropriate parameters, this command calculates and returns the total balance of funds received at the specified address that is part of the wallet. The command is versatile, supporting not only specific addresses but also pattern matching through wildcards (z*, R*, i*), allowing easy balance checking across groups of related addresses. It offers a confirmation threshold parameter that enables filtering based on transaction finality, distinguishing between confirmed and unconfirmed funds. This functionality is particularly important for shielded addresses, where the enhanced privacy features make tracking balances through blockchain explorers impossible for external observers. The command includes an important caveat for addresses where the wallet has only incoming viewing keys: in such cases, the wallet cannot detect spends, potentially resulting in reported balances that exceed the actual available funds. This comprehensive balance reporting across address types makes the command an essential tool for managing funds in wallets that utilize both transparent and privacy-focused features.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| address | string | Yes | N/A | The selected address. It may be a transparent or private address and include z*, R*, and i* wildcards |
| minconf | numeric | No | 1 | Only include transactions confirmed at least this many times |

## Results
The command returns a numeric value representing the total amount in VRSCTEST received for the address.

**Return Type**: Numeric

## Examples

### Example 1: Get the balance of a specific address

**Command:**
```
verus z_getbalance "myaddress"
```

**Sample Output:**
```
10.50000000
```

### Example 2: Get the balance with minimum 5 confirmations

**Command:**
```
verus z_getbalance "myaddress" 5
```

**Sample Output:**
```
8.75000000
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_getbalance", "params": ["myaddress", 5] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid address
   ```

2. **Potential Error - Address Not in Wallet:**
   ```
   error code: -4
   error message:
   Address not found in wallet
   ```

3. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf parameter, must be a non-negative integer
   ```

4. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
For addresses where the wallet has only an incoming viewing key, spends cannot be detected, and so the returned balance may be larger than the actual balance. This limitation affects only shielded addresses for which the wallet has imported a viewing key but not the corresponding spending key. The command supports wildcard patterns, such as "z*" to check balances across all shielded addresses, or "R*" for all transparent addresses. The balance returned reflects the sum of all outputs received by the address minus any that have been spent, though for view-only addresses, spends may not be properly accounted for.

## Related Commands
- `getbalance`: Returns the total available balance in the wallet
- `z_gettotalbalance`: Returns the total value of funds in the wallet across transparent and shielded addresses
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet
- `z_listreceivedbyaddress`: Returns a list of amounts received by a shielded address
- `z_sendmany`: Send multiple amounts from a shielded address to multiple recipients