# Verus RPC Command: encryptwallet

## Purpose
The `encryptwallet` command encrypts the wallet with a passphrase. This command is used to add an important layer of security to the wallet, protecting private keys from unauthorized access.

## Daemon Requirements
- The daemon must be started with the `-experimentalfeatures=1` parameter
- The daemon must be started with the `-developerencryptwallet=1` parameter

## Description
When provided with a passphrase, this command encrypts the wallet, securing its private keys. This is only for first-time encryption. After encryption, any operations that interact with private keys (such as sending or signing) will require the passphrase to be set using the `walletpassphrase` command before those operations can be performed. Once the operations are completed, the wallet can be locked again using the `walletlock` command. For changing an existing passphrase, use the `walletpassphrasechange` command instead. Note that executing this command will shut down the server.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires enabled experimental features and developer encryption option

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| passphrase | string | Yes | N/A | The passphrase to encrypt the wallet with. It must be at least 1 character, but should be long |

## Results
The command does not return a standard result as it shuts down the server upon successful execution.

**Return Type**: None (Server Shuts Down)

## Examples

### Example 1: Encrypt the wallet

**Command:**
```
verus encryptwallet "my pass phrase"
```

**Expected Result:**
The server will shut down, and a message about wallet encryption will be displayed.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "encryptwallet", "params": ["my pass phrase"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Result:**
The server will shut down, potentially returning a partial response before termination.

## Potential Error Cases

1. **Confirmed Error - Feature Disabled:**
   ```
   error code: -1
   error message:
   WARNING: encryptwallet is disabled. To enable it, restart zcashd with the -experimentalfeatures and -developerencryptwallet commandline options, or add these two lines to the zcash.conf file: experimentalfeatures=1 developerencryptwallet=1
   ```

2. **Potential Error - Wallet Already Encrypted:**
   ```
   error code: -15
   error message:
   Error: Wallet is already encrypted. Use walletpassphrasechange to change the passphrase
   ```

3. **Potential Error - Empty Passphrase:**
   ```
   error code: -8
   error message:
   Error: passphrase must not be empty
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `walletpassphrase`: Unlocks the wallet for use
- `walletpassphrasechange`: Changes the wallet passphrase
- `walletlock`: Locks the wallet
- `getwalletinfo`: Returns information about the wallet state, including encryption status
