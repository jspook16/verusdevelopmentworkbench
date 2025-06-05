# Verus RPC Command: dumpwallet

## Purpose
The `dumpwallet` command dumps taddr wallet keys in a human-readable format to a file. This command is valuable for creating comprehensive backups of wallet keys for safekeeping.

## Description
When executed with a filename, this command exports all transparent address private keys from the wallet to a human-readable text file. The file is saved in the folder specified by the verusd -exportdir option. The command includes safeguards to prevent overwriting existing files. This export can be used as a comprehensive backup or for migrating keys to another wallet.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| filename | string | Yes | N/A | The filename, saved in folder set by verusd -exportdir option |
| omitemptytaddresses | boolean | No | false | If true, export only addresses with indexed UTXOs or that control IDs in the wallet |

## Results
The command returns a string representing the full path of the destination file.

**Return Type**: String

## Examples

### Example 1: Dump all wallet keys to a file

**Command:**
```
verus dumpwallet "test"
```

**Sample Output:**
```
/home/user/.verus/exportdir/test
```

### Example 2: Dump only non-empty addresses

**Command:**
```
verus dumpwallet "active_keys" true
```

**Sample Output:**
```
/home/user/.verus/exportdir/active_keys
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "dumpwallet", "params": ["test"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "/home/user/.verus/exportdir/test",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Filename Specified:**
   ```
   error code: -1
   error message:
   Error: Filename required
   ```

2. **Potential Error - Invalid Export Directory:**
   ```
   error code: -1
   error message:
   Error: Export directory not set or not found
   ```

3. **Potential Error - File Already Exists:**
   ```
   error code: -1
   error message:
   Error: File already exists, will not overwrite
   ```

4. **Potential Error - Permission Denied:**
   ```
   error code: -1
   error message:
   Error: Cannot write to file
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

6. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `backupwallet`: Safely copies wallet.dat to destination filename
- `importwallet`: Imports keys from a wallet dump file
- `dumpprivkey`: Reveals the private key corresponding to a t-addr
- `importprivkey`: Adds a private key to your wallet
