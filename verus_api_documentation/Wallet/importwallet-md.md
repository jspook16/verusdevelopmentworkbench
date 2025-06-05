# Verus RPC Command: importwallet

## Purpose
The `importwallet` command imports private keys from a wallet dump file, previously created with the `dumpwallet` command. This command is essential for wallet migration, backup restoration, and disaster recovery scenarios. It enables users to transfer their entire wallet, including all addresses and private keys, between different instances of the Verus client or to restore a wallet from a secure backup.

## Description
When executed with the appropriate parameter, this command reads a wallet dump file and imports all transparent addresses (t-addresses) and their corresponding private keys into the current wallet. The import process includes all metadata such as labels, creation times, and key pools if present in the dump file. Upon successful import, the wallet gains control over all addresses contained in the file, allowing it to spend any funds associated with them. The wallet automatically rescans the blockchain to detect and index all historical transactions for these imported addresses, ensuring accurate balance and transaction history. This bulk import method is significantly more efficient than importing keys individually, especially for wallets with many addresses or extensive transaction histories.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| filename | string | Yes | N/A | The wallet file path |

## Results
The command does not return any specific value upon successful execution.

**Return Type**: None

## Examples

### Example 1: Import a wallet from a backup file

**Command:**
```
verus importwallet "path/to/exportdir/nameofbackup"
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importwallet", "params": ["path/to/exportdir/nameofbackup"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - File Not Found:**
   ```
   error code: -8
   error message:
   Cannot open wallet dump file
   ```

2. **Potential Error - Invalid File Format:**
   ```
   error code: -8
   error message:
   File format not recognized
   ```

3. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

4. **Potential Error - Duplicate Keys:**
   ```
   error code: -4
   error message:
   Some keys from the wallet dump file were not imported (duplicate keys)
   ```

## Notes
This command will only import t-address keys from a wallet dump file. For importing z-address private keys, use the `z_importkey` or `z_importwallet` commands. The wallet dump file is a plain text file that contains private keys and should be handled with extreme caution - anyone with access to this file can potentially spend the funds associated with the keys it contains. The import process automatically triggers a blockchain rescan, which can take a considerable amount of time depending on the size of the blockchain and the number of addresses being imported.

## Related Commands
- `dumpwallet`: Creates a wallet dump file containing all private keys and metadata
- `importprivkey`: Imports an individual private key into the wallet
- `backupwallet`: Creates a backup of the entire wallet file
- `z_importwallet`: Imports z-address private keys from a wallet dump file
- `rescanfromheight`: Rescans the blockchain from a specified height