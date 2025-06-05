# Verus RPC Command: gettxoutproof

## Purpose
The `gettxoutproof` command returns a hex-encoded proof that a transaction was included in a block. This command is useful for verifying transaction inclusion without needing the entire blockchain, supporting lightweight verification systems like SPV (Simplified Payment Verification).

## Description
When provided with an array of transaction IDs, this command creates and returns a cryptographic proof that these transactions were included in a block. By default, this only works for transactions with unspent outputs. However, if transaction indexing is enabled (using the `-txindex` command line option) or if a specific block hash is provided, the command can also work for spent transactions.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: May require txindex=1 to be set in the configuration file for spent transactions

## Arguments
The command accepts two arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txids | array | Yes | N/A | A JSON array of transaction IDs to filter |
| blockhash | string | No | N/A | If specified, looks for txid in the block with this hash |

## Results
The command returns a string that is a serialized, hex-encoded data for the proof.

**Return Type**: String

## Examples

### Example 1: Get proof for a single transaction

**Command:**
```
verus gettxoutproof ["a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"]
```

**Sample Output:**
```
0200000001f5677b6125faf78d1401c53de774d19c2fca1511a70e0a2b71fe1429dd645bfd8e65cb8536e3622f0b77520305800700ea5845c7323f5741d19da12497590b3752af12a8b5e3217342759a3f2fc42d9c21050ec51ed124c3a27ddcae381b8f6400000001db92010000000000000000000000000000000000000000000000000000000000000000a26fc7fd1cc00382f38e4a9a9d315402f586be2db89da0dd775a0af32cee129ded6fe54860c34510363ebb9aa11db025e1e9c8ee1c5ca1a03aba0a4548b1e3f436fc85ccc7ed8abdb79a5964dd9e731c03f9d39cb66d5e92b0ae4e77f9ce3b10
```

### Example 2: Get proof for multiple transactions from a specific block

**Command:**
```
verus gettxoutproof ["a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"] "00000000c937983704a73af28acdec37b049d214adbda81d7e2a3dd146f6ed09"
```

**Sample Output:**
```
0200000001f5677b6125faf78d1401c53de774d19c2fca1511a70e0a2b71fe1429dd645bfda7cb8526e3622f0b77520305800700ea5845c7323f5741d19da12497590b3752af12a8b5e3217342759a3f2fc42d9c21050ec51ed124c3a27ddcae381b8f6400000002db92010000000000000000000000000000000000000000000000000000000000000000a26fc7fd1cc00382f38e4a9a9d315402f586be2db89da0dd775a0af32cee129ded6fe54860c34510363ebb9aa11db025e1e9c8ee1c5ca1a03aba0a4548b1e3f436fc85ccc7ed8abdb79a5964dd9e731c03f9d39cb66d5e92b0ae4e77f9ce3b10
```

## Potential Error Cases

1. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not found in the specified block
   ```

2. **Potential Error - Block Not Found:**
   ```
   error code: -5
   error message:
   Block not found
   ```

3. **Potential Error - No Unspent Outputs:**
   ```
   error code: -5
   error message:
   Transaction has been spent. Use -txindex to enable spent transaction lookup.
   ```

4. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   txid must be a hexadecimal string
   ```

5. **Potential Error - Invalid Block Hash:**
   ```
   error code: -8
   error message:
   blockhash must be of length 64 (not XX)
   ```

## Related Commands
- `verifytxoutproof`: Verifies that a proof points to a transaction in a block
- `getrawtransaction`: Returns raw transaction data
- `gettxout`: Returns details about an unspent transaction output
- `getblock`: Returns detailed information about a block
