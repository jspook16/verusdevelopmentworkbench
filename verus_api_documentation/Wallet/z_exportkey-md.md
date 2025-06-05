# Verus RPC Command: z_exportkey

## Purpose
The `z_exportkey` command extracts the private key associated with a specified shielded address (zaddr), enabling crucial wallet operations such as backup creation, key migration across wallets, cold storage solutions, and wallet recovery scenarios. This command provides essential key extraction capabilities for managing private shielded funds, analogous to the `dumpprivkey` command for transparent addresses, but specifically designed for the privacy-focused shielded address types.

## Description
When executed with the appropriate parameters, this command retrieves and returns the private spending key corresponding to the provided z-address (zaddr) from the wallet. The returned key contains all the cryptographic information necessary to control funds associated with that address. Unlike transparent addresses, shielded addresses use advanced cryptographic techniques to enhance privacy, making their key management particularly important. The command supports an optional parameter to return the key data in hexadecimal format, which can be useful for certain programmatic applications or specialized storage solutions. The exported private key can subsequently be imported into another wallet using the `z_importkey` command, facilitating wallet migration, backup restoration, or consolidation of funds. This powerful capability comes with significant responsibility, as possession of the private key grants complete control over any funds associated with the corresponding address.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| zaddr | string | Yes | N/A | The z-address for the private key |
| outputashex | boolean | No | false | If true, output key data as hex bytes |

## Results
The command returns a string representing the private key for the specified address.

**Return Type**: String

## Examples

### Example 1: Export the private key for a z-address

**Command:**
```
verus z_exportkey "myaddress"
```

**Sample Output:**
```
AKWUAkypwQjhZ6LLNaMuuuLcmZ6gt5UFyo8m3jGutvALmwAKNtNE
```

### Example 2: Import the private key into another wallet

**Command:**
```
verus z_importkey "mykey"
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_exportkey", "params": ["myaddress"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid zaddr
   ```

2. **Potential Error - Address Not Found:**
   ```
   error code: -4
   error message:
   Zaddr not found in wallet
   ```

3. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

4. **Potential Error - Watch-Only Address:**
   ```
   error code: -4
   error message:
   Zaddr is watch-only and has no private key
   ```

## Notes
The private key contains sensitive information that grants complete control over any funds associated with the corresponding address. It should be handled with extreme caution and never shared with untrusted parties. This command can only export private keys for addresses that are actually in the wallet and for which the wallet has the private key (not watch-only addresses). The exported format differs between Sprout and Sapling z-addresses, reflecting their different cryptographic structures.

## Related Commands
- `z_importkey`: Adds a z-address private key to your wallet
- `z_exportviewingkey`: Reveals the viewing key corresponding to a z-address
- `z_exportwallet`: Exports all wallet keys, including z-address keys
- `z_importwallet`: Imports keys from a wallet export file
- `dumpprivkey`: Reveals the private key corresponding to a transparent address