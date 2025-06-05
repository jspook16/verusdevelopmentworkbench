# Verus RPC Command: keypoolrefill

## Purpose
The `keypoolrefill` command refills the keypool with fresh pre-generated keys, which is critical for maintaining wallet security and functionality. This command ensures that the wallet always has a reserve of unused addresses ready for allocation when requested, preventing potential issues with address generation during high-demand periods and maintaining proper backup coverage for future addresses that may be assigned to transactions.

## Description
When executed, this command generates new cryptographic key pairs and adds them to the wallet's keypool, which is a reservoir of pre-generated keys that the wallet draws from when new addresses are requested. The keypool serves as a buffer that allows wallets to provide new addresses immediately upon request without having to generate keys on demand, which could potentially introduce delays or vulnerabilities. Additionally, having pre-generated keys ensures that proper backups contain all necessary information to recover funds sent to future addresses, as long as the backup was made after the keys were generated. The command allows specifying the new target size for the keypool, enabling administrators to adjust the number of pre-generated keys based on anticipated usage patterns, security considerations, and backup frequency.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| newsize | numeric | No | 100 | The new keypool size |

## Results
The command does not return any specific value upon successful execution.

**Return Type**: None

## Examples

### Example 1: Refill the keypool with the default size (100)

**Command:**
```
verus keypoolrefill
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "keypoolrefill", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Size Parameter:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected positive integer
   ```

2. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

3. **Potential Error - Keypool Generation Failed:**
   ```
   error code: -4
   error message:
   Error: Keypool ran out, please call keypoolrefill first
   ```

## Notes
It is recommended to back up the wallet after running this command, as it generates new private keys that will not be included in previous backups. The default keypool size of 100 is suitable for most use cases, but it can be increased for wallets that generate large numbers of addresses frequently. Keeping the keypool well-filled is particularly important for deterministic wallets (HD wallets) to ensure that all potential future addresses are recoverable from the wallet's seed phrase or backup.

## Related Commands
- `getnewaddress`: Returns a new Verus address for receiving payments
- `getwalletinfo`: Returns information about the wallet, including the keypool size
- `backupwallet`: Creates a backup of the wallet
- `dumpwallet`: Creates a human-readable dump of the wallet keys and metadata
- `walletpassphrase`: Temporarily decrypts the wallet for operations requiring private keys