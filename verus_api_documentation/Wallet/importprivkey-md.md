# Verus RPC Command: importprivkey

## Purpose
The `importprivkey` command adds a private key to the wallet, enabling control over the corresponding Verus address. This command is essential for wallet recovery, migration between wallet instances, importing paper wallets, or taking control of addresses generated externally. It empowers users to consolidate multiple separate keys into a single wallet for simplified management, backup, and transaction processing.

## Description
When executed with the appropriate parameters, this command imports a Verus private key (typically obtained from the `dumpprivkey` command or external key generators) into the wallet, along with its associated address. Upon import, the wallet gains full signing capability for that address, allowing it to spend any funds associated with it. The command offers options to associate a descriptive label with the imported address and to control whether the wallet should immediately rescan the blockchain for historical transactions involving this address. The rescan operation ensures that the wallet's balance and transaction history are accurate, but it can be time-consuming for large blockchains. The ability to selectively disable rescanning is particularly valuable when importing multiple keys in batch operations or when the user knows precisely when the address was first used.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three arguments, one required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| verusprivkey | string | Yes | N/A | The private key (see dumpprivkey) |
| label | string | No | "" | An optional label for the address |
| rescan | boolean | No | true | Rescan the wallet for transactions |

## Results
The command does not return any specific value upon successful execution.

**Return Type**: None

## Examples

### Example 1: Import a private key with rescan

**Command:**
```
verus importprivkey "mykey"
```

### Example 2: Import a private key with a label and without rescan

**Command:**
```
verus importprivkey "mykey" "testing" false
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importprivkey", "params": ["mykey", "testing", false] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Private Key:**
   ```
   error code: -5
   error message:
   Invalid private key encoding
   ```

2. **Potential Error - Key Already in Wallet:**
   ```
   error code: -4
   error message:
   Key already in wallet
   ```

3. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

4. **Potential Error - Wallet Encryption Failed:**
   ```
   error code: -16
   error message:
   Error: Failed to encrypt the private key
   ```

## Notes
This call can take minutes to complete if rescan is true, especially on a large blockchain. For improved performance when importing multiple keys, consider setting rescan=false and then manually invoking the rescanblockchain command afterwards. Importing private keys introduces security considerations, as the keys must be transmitted to the node. It is recommended to use this command only on secure, encrypted connections or on a local node.

## Related Commands
- `dumpprivkey`: Reveals the private key corresponding to a wallet address
- `importwallet`: Imports keys from a wallet dump file
- `importaddress`: Adds an address or script (without private key) to the wallet
- `rescanfromheight`: Rescans the blockchain from a specified height
- `z_importkey`: Imports a z-address private key