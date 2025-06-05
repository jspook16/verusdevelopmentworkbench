# Verus RPC Command: z_importwallet

## Purpose
The `z_importwallet` command imports private keys for both transparent addresses (taddr) and shielded addresses (zaddr) from a wallet dump file previously created with `z_exportwallet`. This command is essential for wallet recovery, migration between different nodes or instances, backup restoration, and comprehensive transfer of all address types from one wallet to another. Unlike the standard `importwallet` command, it specifically handles shielded address keys, ensuring complete wallet restoration including privacy-focused funds.

## Description
When executed with the appropriate parameter, this command reads a wallet dump file and imports all addresses and their corresponding private keys into the current wallet. The command processes both transparent and shielded addresses contained in the file, preserving all account structures, labels, and metadata associated with each address. Upon import, the wallet gains full control over all addresses contained in the file, allowing it to spend any funds associated with them and monitor incoming transactions. The wallet automatically rescans the blockchain to detect all historical transactions for these imported addresses, ensuring accurate balance and transaction history. This comprehensive import capability is particularly valuable for users who utilize both transparent and shielded address types, as it provides a single-command solution for transferring complete wallet control between different instances. The import process handles the complexities of different address types and their specialized key formats transparently, making wallet migration or recovery as straightforward as possible despite the underlying cryptographic differences.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| filename | string | Yes | N/A | The wallet file |

## Results
The command does not return any specific value upon successful execution.

**Return Type**: None

## Examples

### Example 1: Export a wallet and then import it

**Command:**
```
verus z_exportwallet "nameofbackup"
```

**Sample Output:**
```
/home/user/.verus/exported/nameofbackup
```

**Follow-up Command:**
```
verus z_importwallet "path/to/exportdir/nameofbackup"
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_importwallet", "params": ["path/to/exportdir/nameofbackup"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
This command imports both transparent (taddr) and shielded (zaddr) keys, making it more comprehensive than the standard `importwallet` command which only handles transparent addresses. The wallet dump file is a plain text file that contains private keys and should be handled with extreme caution - anyone with access to this file can potentially spend the funds associated with the keys it contains. The import process automatically triggers a blockchain rescan, which can take a considerable amount of time depending on the size of the blockchain and the number of addresses being imported.

## Related Commands
- `z_exportwallet`: Creates a wallet dump file containing all keys including z-addresses
- `importwallet`: Imports only transparent address keys from a wallet dump file
- `dumpwallet`: Exports only transparent address keys to a file
- `z_importkey`: Adds a z-address private key to your wallet
- `importprivkey`: Adds a transparent address private key to your wallet