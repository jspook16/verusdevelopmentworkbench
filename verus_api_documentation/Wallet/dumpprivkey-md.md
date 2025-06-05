# Verus RPC Command: dumpprivkey

## Purpose
The `dumpprivkey` command reveals the private key corresponding to a transparent address. This command is useful for backing up specific keys or transferring control of an address to another wallet.

## Description
When provided with a transparent address (t-addr), this command returns the private key in Wallet Import Format (WIF). This private key can then be used with the `importprivkey` command to import the address into another wallet. This enables the backup of specific addresses or the transfer of control between wallets. Because private keys control access to funds, this command should be used with caution and the output should be kept secure.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet with the address's private key

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| t-addr | string | Yes | N/A | The transparent address for which to reveal the private key |

## Results
The command returns a string representing the private key in Wallet Import Format (WIF).

**Return Type**: String

## Examples

### Example 1: Dump the private key for an address

**Command:**
```
verus dumpprivkey "myaddress"
```

**Sample Output:**
```
Uy9kDWgCvN9ijTqEPJF15pNaKBmQUKmQvHXYN9hrqHzbZZbJCudN
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "dumpprivkey", "params": ["myaddress"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "Uy9kDWgCvN9ijTqEPJF15pNaKBmQUKmQvHXYN9hrqHzbZZbJCudN",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid Verus address
   ```

2. **Potential Error - Address Not Found:**
   ```
   error code: -4
   error message:
   Private key for address not known
   ```

3. **Potential Error - Address Not Transparent:**
   ```
   error code: -8
   error message:
   Address must be a transparent address
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `importprivkey`: Adds a private key to your wallet
- `getnewaddress`: Returns a new Verus address for receiving payments
- `getaddressesbyaccount`: Returns the list of addresses for the given account
- `validateaddress`: Returns information about the given address
