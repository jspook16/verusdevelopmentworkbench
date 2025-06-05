# Verus RPC Command: z_importviewingkey

## Purpose
The `z_importviewingkey` command adds a viewing key for a shielded address (zaddr) to the wallet, enabling read-only access to monitor incoming transactions and balances without the ability to spend funds. This command is crucial for implementing financial oversight, audit capabilities, transaction monitoring, and delegated financial surveillance while maintaining the security of spending keys. It provides a powerful privacy-preserving mechanism that supports the separation of monitoring and spending capabilities.

## Description
When executed with the appropriate parameters, this command imports a viewing key (previously exported with `z_exportviewingkey`) into the wallet, granting visibility into transactions, balances, and memos associated with the corresponding z-address, but without the ability to spend funds. The command supports both Sprout and Sapling shielded address types, automatically detecting the key format and adding the appropriate watch-only address to the wallet. Upon successful import, the command returns the address type ("sprout" or "sapling") and the actual address associated with the viewing key. For Sapling keys, this includes the default address derived from the key. The command offers flexible rescan options that determine how the wallet searches for historical transactions involving the imported address. The "whenkeyisnew" option (the default) only triggers a rescan when the key was not previously in the wallet, while "yes" always rescans and "no" never rescans. Additionally, the command allows specifying a starting height for the rescan, which can significantly reduce processing time when the approximate age of the address is known. This functionality is particularly valuable in scenarios where transaction visibility needs to be delegated without transferring spending authority, such as accounting, auditing, or monitoring operations.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three arguments, one required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| vkey | string | Yes | N/A | The viewing key (see z_exportviewingkey) |
| rescan | string | No | "whenkeyisnew" | Rescan the wallet for transactions - can be "yes", "no" or "whenkeyisnew" |
| startHeight | numeric | No | 0 | Block height to start rescan from |

## Results
The command returns an object containing the type of address and the address itself.

**Return Type**: Object

## Examples

### Example 1: Import a viewing key

**Command:**
```
verus z_importviewingkey "vkey"
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 2: Import the viewing key without rescan

**Command:**
```
verus z_importviewingkey "vkey", no
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 3: Import the viewing key with partial rescan

**Command:**
```
verus z_importviewingkey "vkey" whenkeyisnew 30000
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 4: Re-import the viewing key with longer partial rescan

**Command:**
```
verus z_importviewingkey "vkey" yes 20000
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 5: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_importviewingkey", "params": ["vkey", "no"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Key Format:**
   ```
   error code: -5
   error message:
   Invalid viewing key format
   ```

2. **Potential Error - Invalid Rescan Option:**
   ```
   error code: -8
   error message:
   Invalid rescan parameter, must be one of \"yes\", \"no\" or \"whenkeyisnew\"
   ```

3. **Potential Error - Invalid Start Height:**
   ```
   error code: -8
   error message:
   Invalid start height parameter, must be a non-negative integer
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Notes
This call can take minutes to complete if rescan is set to "yes" and the blockchain is large. Addresses imported with viewing keys are watch-only, meaning the wallet can track incoming transactions but cannot spend funds from these addresses. When using `z_gettotalbalance` or `z_getbalance` with watch-only addresses, be aware that the wallet cannot detect when funds have been spent, which may result in reporting balances higher than actually available if the spending key has been used elsewhere.

## Related Commands
- `z_exportviewingkey`: Reveals the viewing key corresponding to a z-address
- `z_exportkey`: Reveals the private key corresponding to a z-address
- `z_importkey`: Adds a z-address private key to your wallet
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet
- `z_getbalance`: Returns the balance of a taddr or zaddr belonging to the wallet