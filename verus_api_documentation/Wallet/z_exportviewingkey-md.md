# Verus RPC Command: z_exportviewingkey

## Purpose
The `z_exportviewingkey` command extracts the viewing key associated with a specified shielded address (zaddr), enabling read-only access to the address's transaction history without exposing spending capability. This command is essential for implementing financial monitoring, audit capabilities, transaction verification, and delegated oversight of shielded funds while maintaining the security of the private spending key. It provides a crucial privacy-preserving mechanism for sharing transaction visibility without surrendering financial control.

## Description
When executed with the appropriate parameter, this command retrieves and returns the viewing key corresponding to the provided z-address (zaddr) from the wallet. Unlike the private spending key, the viewing key only grants the ability to see incoming transactions, balances, and memos associated with the address, but cannot be used to spend funds. This creates a powerful separation of capabilities that enables a variety of secure monitoring arrangements. The viewing key can subsequently be imported into another wallet using the `z_importviewingkey` command, facilitating audit processes, backup monitoring, or financial supervision. This capability is particularly valuable in organizational settings where transaction visibility needs to be shared with individuals who should not have spending authority, or in scenarios where a user wants the convenience of monitoring their shielded funds from a potentially less secure device without risking those funds. The viewing key feature represents a significant privacy advancement over transparent addresses, which provide no mechanism for separating transaction viewing from spending capabilities.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| zaddr | string | Yes | N/A | The z-address for the viewing key |

## Results
The command returns a string representing the viewing key for the specified address.

**Return Type**: String

## Examples

### Example 1: Export the viewing key for a z-address

**Command:**
```
verus z_exportviewingkey "myaddress"
```

**Sample Output:**
```
ZiVtf1yjjR6U8sRz9WBYbGcT5A6zTf3XrKChZYtbsXKt5eWuGZHVj9k4iqxK9GLT4vYfQELnajPFzQvMbLDaQVRx2kgJAyHRZU
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_exportviewingkey", "params": ["myaddress"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

4. **Potential Error - Already Watch-Only Address:**
   ```
   error code: -4
   error message:
   Zaddr is already a watch-only address
   ```

## Notes
The viewing key can only be used to monitor incoming transactions, balances, and memos. It cannot be used to spend funds. This command can only export viewing keys for addresses that are actually in the wallet. The exported format differs between Sprout and Sapling z-addresses, reflecting their different cryptographic structures. While less sensitive than the private spending key, viewing keys still expose transaction information and should be shared only with trusted parties.

## Related Commands
- `z_importviewingkey`: Adds a z-address viewing key to your wallet
- `z_exportkey`: Reveals the private spending key corresponding to a z-address
- `z_exportwallet`: Exports all wallet keys, including z-address keys
- `z_importwallet`: Imports keys from a wallet export file
- `z_getnewaddress`: Returns a new shielded address for receiving payments