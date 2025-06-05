# Verus RPC Command: z_importkey

## Purpose
The `z_importkey` command adds a shielded private key (zkey) to the wallet, enabling control over the corresponding z-address. This command is essential for wallet restoration, key migration between wallet instances, recovery of paper wallets, and managing shielded funds across different wallet installations. It provides the critical ability to import control of existing shielded addresses, allowing users to access and manage private funds that were previously generated or stored elsewhere.

## Description
When executed with the appropriate parameters, this command imports a shielded private key (previously exported with `z_exportkey`) into the wallet, granting the wallet full spending capability for the corresponding z-address. The command supports both Sprout and Sapling shielded address types, automatically detecting the key format and adding the appropriate address type to the wallet. Upon successful import, the command returns the address type ("sprout" or "sapling") and the actual address associated with the key. For Sapling keys, this includes the default address derived from the key. The command offers flexible rescan options that determine how the wallet searches for historical transactions involving the imported address. The "whenkeyisnew" option (the default) only triggers a rescan when the key was not previously in the wallet, while "yes" always rescans and "no" never rescans. Additionally, the command allows specifying a starting height for the rescan, which can significantly reduce processing time when the approximate age of the address is known. This comprehensive functionality enables efficient management of shielded addresses across different wallet instances, backup restoration, and migration scenarios.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three arguments, one required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| zkey | string | Yes | N/A | The zkey (see z_exportkey) |
| rescan | string | No | "whenkeyisnew" | Rescan the wallet for transactions - can be "yes", "no" or "whenkeyisnew" |
| startHeight | numeric | No | 0 | Block height to start rescan from |

## Results
The command returns an object containing the type of address and the address itself.

**Return Type**: Object

## Examples

### Example 1: Export a zkey from one wallet and import it to another

**Command:**
```
verus z_exportkey "myaddress"
```

**Sample Output:**
```
AKWUAkypwQjhZ6LLNaMuuuLcmZ6gt5UFyo8m3jGutvALmwAKNtNE
```

**Follow-up Command:**
```
verus z_importkey "mykey"
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 2: Import the zkey with partial rescan

**Command:**
```
verus z_importkey "mykey" whenkeyisnew 30000
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 3: Re-import the zkey with longer partial rescan

**Command:**
```
verus z_importkey "mykey" yes 20000
```

**Sample Output:**
```
{
  "type": "sapling",
  "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9"
}
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_importkey", "params": ["mykey", "no"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Key Format:**
   ```
   error code: -5
   error message:
   Invalid zkey format
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
This call can take minutes to complete if rescan is set to "yes" and the blockchain is large. For faster performance when importing multiple keys, consider setting rescan="no" and then manually invoking a rescan using the `rescanblockchain` command or `z_importkey` with a targeted startHeight. Private keys for shielded addresses are more complex and larger than those for transparent addresses, reflecting the advanced cryptographic mechanisms they use to enhance privacy.

## Related Commands
- `z_exportkey`: Reveals the private key corresponding to a z-address
- `z_exportviewingkey`: Reveals the viewing key corresponding to a z-address
- `z_importviewingkey`: Adds a z-address viewing key to your wallet
- `z_exportwallet`: Exports all wallet keys, including z-address keys
- `z_importwallet`: Imports keys from a wallet export file