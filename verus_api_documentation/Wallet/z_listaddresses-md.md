# Verus RPC Command: z_listaddresses

## Purpose
The `z_listaddresses` command retrieves a comprehensive list of all shielded addresses (zaddrs) belonging to the wallet, providing visibility into the wallet's privacy-focused payment endpoints. This command is essential for shielded address management, inventory tracking of private payment channels, selecting appropriate addresses for private transactions, and maintaining awareness of all potential destinations for shielded funds within the wallet.

## Description
When executed with the appropriate parameter, this command returns an array containing all shielded addresses stored in the wallet, including both Sprout and Sapling protocol addresses. Unlike transparent addresses, shielded addresses utilize advanced cryptographic techniques to enhance transaction privacy, making them invisible to blockchain explorers and external observers. This command provides the wallet owner with a complete inventory of these private addresses, facilitating their effective management and utilization. The command offers an optional parameter to include watch-only addresses - those for which the wallet has viewing keys but not spending keys. This inclusion capability allows monitoring of addresses whose funds cannot be spent directly from this wallet, enhancing the command's utility for surveillance and bookkeeping scenarios. By providing a consolidated view of all shielded addresses under the wallet's control or observation, this command serves as a fundamental tool for managing the private aspect of a wallet's financial capabilities.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| includeWatchonly | boolean | No | false | Also include watchonly addresses (see 'z_importviewingkey') |

## Results
The command returns an array of strings, each representing a zaddr belonging to the wallet.

**Return Type**: Array of strings

## Examples

### Example 1: List all shielded addresses in the wallet

**Command:**
```
verus z_listaddresses
```

**Sample Output:**
```
[
  "ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9",
  "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_listaddresses", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected boolean
   ```

2. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
Addresses are returned as strings in their standard base58check encoded format. The list includes both Sprout addresses (which start with "zc") and Sapling addresses (which start with "zs"). Watch-only addresses are included only if the `includeWatchonly` parameter is set to true. These are addresses for which the wallet has imported viewing keys but not spending keys, meaning it can see incoming transactions but cannot spend funds. The order of addresses in the returned array is not guaranteed to be consistent between calls.

## Related Commands
- `z_getnewaddress`: Returns a new shielded address for receiving payments
- `z_getbalance`: Returns the balance of a taddr or zaddr belonging to the wallet
- `z_listreceivedbyaddress`: Returns a list of amounts received by a zaddr
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_exportkey`: Reveals the private key corresponding to a z-address