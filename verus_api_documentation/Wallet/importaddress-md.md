# Verus RPC Command: importaddress

## Purpose
The `importaddress` command adds an address or script to the wallet as a watch-only address, allowing the wallet to track transactions involving that address without having the ability to spend from it. This command is useful for monitoring addresses that you don't own the private keys for.

## Description
When provided with an address or script (in hex), this command adds it to the wallet as a watch-only entry. Watch-only addresses can be monitored for incoming and outgoing transactions, but cannot be used to spend funds since the wallet doesn't have the private keys. The command can optionally assign a label to the address and control whether the wallet should rescan the blockchain for historical transactions involving the address.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts three arguments, one required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| address | string | Yes | N/A | The address or script (in hex) to add to the wallet |
| label | string | No | "" | An optional label to associate with the address |
| rescan | boolean | No | true | Rescan the wallet for transactions involving the address |

## Results
The command does not provide a structured result. It returns nothing on success, or an error message if the operation fails.

**Return Type**: None or Error

**Note**: This call can take minutes to complete if rescan is true, especially if the address has many historical transactions.

## Examples

### Example 1: Import an address with rescan

**Command:**
```
verus importaddress "myaddress"
```

**Sample Output:**
```
null
```

### Example 2: Import an address with a label and without rescan

**Command:**
```
verus importaddress "myaddress" "testing" false
```

**Sample Output:**
```
null
```

### Example 3: Import a script in hex format

**Command:**
```
verus importaddress "76a914687bcf7eaccef6010b5c1c305288bd5dc9e06b0488ac" "myscript" false
```

**Sample Output:**
```
null
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "importaddress", "params": ["myaddress", "testing", false] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": null,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Address Specified:**
   ```
   error code: -1
   error message:
   Address required
   ```

2. **Potential Error - Invalid Address or Script Format:**
   ```
   error code: -5
   error message:
   Invalid address or script
   ```

3. **Potential Error - Invalid Label Parameter:**
   ```
   error code: -8
   error message:
   Label must be a string
   ```

4. **Potential Error - Invalid Rescan Parameter:**
   ```
   error code: -8
   error message:
   Rescan parameter must be a boolean
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `importprivkey`: Adds a private key to your wallet
- `importwallet`: Imports keys from a wallet dump file
- `dumpprivkey`: Reveals the private key corresponding to a t-addr
- `dumpwallet`: Dumps wallet keys in a human-readable format
