# Verus RPC Command: z_gettotalbalance

## Purpose
The `z_gettotalbalance` command retrieves the total value of funds stored in the node's wallet, providing a comprehensive financial overview that encompasses both transparent and shielded balances. This command is essential for holistic wallet monitoring, accurate financial reporting, portfolio management across privacy tiers, and maintaining a complete picture of available funds regardless of their privacy characteristics. It offers a unified view of a wallet's financial position that bridges both public and private fund pools.

## Description
When executed with the appropriate parameters, this command calculates and returns the aggregate balance of all funds in the wallet, breaking down the total into transparent and private (shielded) components. The transparent balance includes funds in standard transparent addresses (taddrs), which are visible on the blockchain. The private balance combines funds in both Sprout and Sapling shielded addresses (zaddrs), which utilize zero-knowledge proofs to enhance transaction privacy. The command offers a confirmation threshold parameter that filters transactions based on their confirmation status, distinguishing between confirmed and unconfirmed funds. It also provides an option to include watch-only addresses, which are addresses for which the wallet has public keys but not private keys. The command includes an important caveat for shielded addresses where the wallet has only incoming viewing keys: in such cases, the wallet cannot detect spends, potentially resulting in reported balances that exceed the actual available funds. This comprehensive balance reporting across address types makes the command an essential tool for users who utilize both transparent and privacy-focused features.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minconf | numeric | No | 1 | Only include private and transparent transactions confirmed at least this many times |
| includeWatchonly | boolean | No | false | Also include balance in watchonly addresses (see 'importaddress' and 'z_importviewingkey') |

## Results
The command returns an object with three numeric fields: transparent balance, private balance, and total balance.

**Return Type**: Object

## Examples

### Example 1: Get the total balance with default parameters

**Command:**
```
verus z_gettotalbalance
```

**Sample Output:**
```
{
  "transparent": 25.35481234,
  "private": 7.50000000,
  "total": 32.85481234
}
```

### Example 2: Get the total balance with minimum 5 confirmations

**Command:**
```
verus z_gettotalbalance 5
```

**Sample Output:**
```
{
  "transparent": 24.15481234,
  "private": 6.25000000,
  "total": 30.40481234
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_gettotalbalance", "params": [5] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf parameter, must be a non-negative integer
   ```

2. **Potential Error - Invalid Watchonly Parameter:**
   ```
   error code: -8
   error message:
   Invalid includeWatchonly parameter, must be a boolean
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
CAUTION: If the wallet contains any addresses for which it only has incoming viewing keys, the returned private balance may be larger than the actual balance, because spends cannot be detected with incoming viewing keys. The "private" field combines the balance from both Sprout and Sapling shielded addresses. The "transparent" field includes all regular transparent addresses in the wallet. The "total" field is simply the sum of the transparent and private balances.

## Related Commands
- `getbalance`: Returns the total available balance in transparent addresses
- `z_getbalance`: Returns the balance of a specific transparent or shielded address
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet
- `z_sendmany`: Send multiple times from an address to multiple recipients
- `getwalletinfo`: Returns an object containing various wallet state info