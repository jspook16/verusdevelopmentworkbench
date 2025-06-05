# Verus RPC Command: backupwallet

## Purpose
The `backupwallet` command safely copies the wallet.dat file to a specified destination filename. This command is essential for creating secure backups of your wallet to prevent loss of funds in case of hardware failure or other issues.

## Description
When executed with a destination filename, this command creates a copy of the current wallet.dat file, which contains private keys, addresses, and transaction information. The backup is saved in the directory specified by the -exportdir configuration option. Regular wallet backups are an important practice to prevent loss of funds.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| destination | string | Yes | N/A | The destination filename, saved in the directory set by -exportdir option |

## Results
The command returns a string representing the full path of the destination file.

**Return Type**: String

## Examples

### Example 1: Backup wallet to a file named "backupdata"

**Command:**
```
verus backupwallet "backupdata"
```

**Sample Output:**
```
/home/user/.verus/exportdir/backupdata
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "backupwallet", "params": ["backupdata"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "/home/user/.verus/exportdir/backupdata",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Destination Specified:**
   ```
   error code: -1
   error message:
   Error: Destination filename required
   ```

2. **Potential Error - Invalid Export Directory:**
   ```
   error code: -1
   error message:
   Error: Export directory not set or not found
   ```

3. **Potential Error - Permission Denied:**
   ```
   error code: -1
   error message:
   Error: Cannot write to destination file
   ```

4. **Potential Error - File Already Exists:**
   ```
   error code: -1
   error message:
   Error: File already exists, will not overwrite
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `dumpwallet`: Dumps wallet keys in a human-readable format
- `importwallet`: Imports keys from a wallet dump file
- `encryptwallet`: Encrypts the wallet with a passphrase
- `walletpassphrase`: Unlocks the wallet for use
