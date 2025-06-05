# Verus RPC Command: z_listunspent

## Purpose
The `z_listunspent` command retrieves a comprehensive list of unspent shielded notes (UTXOs) in the wallet, providing crucial visibility into private funds available for spending. This command serves as the privacy-focused counterpart to the transparent `listunspent` command, enabling users to manage their shielded funds with the same level of control. It supports financial planning, transaction preparation, privacy analysis, and advanced wallet management for shielded transactions in both Sprout and Sapling protocols.

## Description
When executed with the appropriate parameters, this command queries the wallet's database and returns detailed information about each unspent shielded note, including transaction identifiers, confirmation status, receiving address, amount, and associated memo data. Unlike transparent UTXOs, shielded notes incorporate privacy-enhancing cryptography that protects transaction details on the blockchain. The command allows filtering by confirmation depth through minconf and maxconf parameters, enabling users to distinguish between newly received and well-confirmed funds. It also offers the ability to filter for specific z-addresses and can optionally include watch-only addresses for which the wallet has viewing keys but not spending keys. The returned data differentiates between Sprout and Sapling protocol notes, providing protocol-specific details for each entry. This granular information about available shielded funds enables precise management of private transactions, facilitating advanced use cases such as fee optimization, coin selection, and maintaining transaction privacy.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts four optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minconf | numeric | No | 1 | The minimum confirmations to filter |
| maxconf | numeric | No | 9999999 | The maximum confirmations to filter |
| includeWatchonly | boolean | No | false | Also include watchonly addresses (see 'z_importviewingkey') |
| addresses | string array | No | [] | A json array of zaddrs (both Sprout and Sapling) to filter on. Duplicate addresses not allowed |

## Results
The command returns an array of objects, each representing an unspent shielded note.

**Return Type**: Array of objects

## Examples

### Example 1: List all unspent shielded notes with default parameters

**Command:**
```
verus z_listunspent
```

**Sample Output:**
```
[
  {
    "txid": "8d5bf46a7d3927dc3d204a2311a9bb8ff8eb689acced7feb8745f537a02bdb93",
    "outindex": 0,
    "confirmations": 28,
    "spendable": true,
    "address": "zs1tg9vwyqgmjz4tlj2w0k8ua6r4zs8xzzyqg8d5weahcklxumjn5jsp52kuehafcwpnxzw06xslnx",
    "amount": 5.00000000,
    "memo": "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "change": false
  }
]
```

### Example 2: List unspent notes with specific confirmation range and addresses

**Command:**
```
verus z_listunspent 6 9999999 false "[\"ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9\",\"ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf\"]"
```

**Sample Output:**
```
[
  {
    "txid": "ff7d61074d9b33170bd74eb7396794910c96e92f8ae92cdc94d38fca7ddbe755",
    "jsindex": 0,
    "jsoutindex": 1,
    "confirmations": 457,
    "spendable": true,
    "address": "ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9",
    "amount": 1.00000000,
    "memo": "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "change": false
  }
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_listunspent", "params": [6 9999999 false "[\"ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9\",\"ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf\"]"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf or maxconf parameter, must be a non-negative integer
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid address format in addresses filter
   ```

3. **Potential Error - JSON Parse Error:**
   ```
   error code: -8
   error message:
   Invalid addresses parameter, expected array
   ```

4. **Potential Error - Duplicate Addresses:**
   ```
   error code: -8
   error message:
   Invalid parameter, duplicated address
   ```

5. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
Unspent notes with zero confirmations are included when minconf is set to 0, even though they may not be immediately spendable. The `memo` field contains a hexadecimal string representation of any memo data attached to the note when it was created. The `change` field indicates whether the note was received as change from a transaction sent by the wallet. The structure of the returned data differs slightly between Sprout and Sapling notes, reflecting the different protocols.

## Related Commands
- `listunspent`: Returns array of unspent transparent transaction outputs
- `z_getbalance`: Returns the balance of a taddr or zaddr
- `z_sendmany`: Send multiple times from a z-address to multiple addresses
- `z_shieldcoinbase`: Shield transparent coinbase funds to a z-address
- `z_importkey`: Adds a z-address private key to your wallet