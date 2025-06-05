# Verus RPC Command: z_exportwallet

## Purpose
The `z_exportwallet` command exports all wallet keys, both transparent (taddr) and shielded (zaddr), into a human-readable file format. This command is essential for creating comprehensive wallet backups, migrating wallets between systems, performing wallet recovery operations, and creating secure cold storage solutions. Unlike the standard `dumpwallet` command, it includes shielded address keys, providing complete coverage of all address types in a single backup operation.

## Description
When executed with the appropriate parameters, this command creates a plain text file containing all private keys, viewing keys, and metadata from the wallet, formatted in a human-readable manner. The export includes both transparent addresses (taddrs) and shielded addresses (zaddrs), ensuring that all funds controlled by the wallet can be recovered from this single file. The command provides an optional parameter to exclude empty transparent addresses, which can significantly reduce file size for wallets that have generated many unused addresses. The file is saved to the location specified by the exportdir option during daemon startup, providing a consistent and secure location for sensitive key material. As a safety measure, the command refuses to overwrite existing files, preventing accidental data loss. This comprehensive export capability is particularly valuable for users who utilize both transparent and shielded address types, as it consolidates all key material into a single, manageable backup file that can later be imported using the `z_importwallet` command.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| filename | string | Yes | N/A | The filename, saved in folder set by verusd -exportdir option |
| omitemptytaddresses | boolean | No | false | Defaults to false. If true, export only addresses with indexed UTXOs or that control IDs in the wallet |

## Results
The command returns a string representing the full path of the destination file.

**Return Type**: String

## Examples

### Example 1: Export the wallet to a file named "test"

**Command:**
```
verus z_exportwallet "test"
```

**Sample Output:**
```
/home/user/.verus/exported/test
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_exportwallet", "params": ["test"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - File Already Exists:**
   ```
   error code: -8
   error message:
   Error: file already exists, will not overwrite
   ```

2. **Potential Error - Export Directory Not Set:**
   ```
   error code: -8
   error message:
   Export directory not set. Use verusd -exportdir=<directory>
   ```

3. **Potential Error - File Write Error:**
   ```
   error code: -8
   error message:
   Error writing to file
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Notes
The exported wallet file contains sensitive information that grants complete control over all funds associated with the addresses it contains. It should be handled with extreme caution, stored securely, and never shared with untrusted parties. The exported file is in plain text format, so it can be inspected and edited if necessary, though manual editing is not recommended except by advanced users. The `omitemptytaddresses` option should be used with caution, as it may exclude addresses that appear empty but might receive funds in the future or are needed for other purposes.

## Related Commands
- `z_importwallet`: Imports keys from a wallet export file
- `dumpwallet`: Exports only transparent address keys to a file
- `importwallet`: Imports only transparent address keys from a file
- `z_exportkey`: Reveals the private key corresponding to a z-address
- `z_importkey`: Adds a z-address private key to your wallet