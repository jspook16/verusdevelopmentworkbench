# Verus RPC Command: convertpassphrase

## Purpose
The `convertpassphrase` command converts a passphrase from Verus Desktop, Agama, Verus Agama, or Verus Mobile to a private key and WIF (Wallet Import Format). This command is useful for importing wallet credentials from these applications into a Verus daemon.

## Description
When provided with a wallet passphrase, this command derives the corresponding private key, WIF, public key, and address. This allows users to migrate their wallet from other Verus wallet applications to the Verus daemon by using the returned WIF with the `importprivkey` command. This provides flexibility for users who want to switch between different Verus wallet applications.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| walletpassphrase | string | Yes | N/A | The wallet passphrase to convert |

## Results
The command returns a JSON object containing the passphrase and derived key information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| walletpassphrase | string | The wallet passphrase you entered |
| address | string | The Verus address corresponding to your passphrase |
| pubkey | string | The hex value of the raw public key |
| privkey | string | The hex value of the raw private key |
| wif | string | The private key in WIF format to use with 'importprivkey' |

## Examples

### Example 1: Convert a passphrase to private key and WIF

**Command:**
```
verus convertpassphrase "my secret passphrase"
```

**Sample Output:**
```json
{
  "walletpassphrase": "my secret passphrase",
  "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
  "pubkey": "02a7acc1911bfc6b5cf185329ce03064a2201d3e41b4ffd13a6a4345be79f1a940",
  "privkey": "345f602e2c3fcda39e2a71a07acbf87a1cf4a6f5d7b1b427a71ff6248a03d6ca",
  "wif": "Uy9kDWgCvN9ijTqEPJF15pNaKBmQUKmQvHXYN9hrqHzbZZbJCudN"
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "convertpassphrase", "params": ["my secret passphrase"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "walletpassphrase": "my secret passphrase",
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "pubkey": "02a7acc1911bfc6b5cf185329ce03064a2201d3e41b4ffd13a6a4345be79f1a940",
    "privkey": "345f602e2c3fcda39e2a71a07acbf87a1cf4a6f5d7b1b427a71ff6248a03d6ca",
    "wif": "Uy9kDWgCvN9ijTqEPJF15pNaKBmQUKmQvHXYN9hrqHzbZZbJCudN"
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Passphrase:**
   ```
   error code: -1
   error message:
   Error: Wallet passphrase required
   ```

2. **Potential Error - Invalid Passphrase:**
   ```
   error code: -5
   error message:
   Error: Invalid passphrase
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `importprivkey`: Adds a private key to your wallet
- `dumpprivkey`: Reveals the private key corresponding to an address
- `dumpwallet`: Dumps wallet keys in a human-readable format
- `importwallet`: Imports keys from a wallet dump file
