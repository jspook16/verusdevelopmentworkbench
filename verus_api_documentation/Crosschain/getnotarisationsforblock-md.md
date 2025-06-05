# Verus RPC Command: getNotarisationsForBlock

## Purpose
The `getNotarisationsForBlock` command retrieves all notarisation transactions contained within a specified block. This command is valuable for analyzing cross-chain notarisations and understanding the relationship between different chains in the Verus ecosystem.

## Description
When provided with a block hash, this command returns information about notarisation transactions found within that block. Notarisation transactions are special transactions that record commitments to other blockchains, providing cross-chain security and verification capabilities.

**Command Type**: Query/Read-only  
**Protocol Level**: Cross-Chain/Notarization  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blockHash | string | Yes | N/A | The hash of the block to search for notarisation transactions |

## Results
The command returns information about notarisation transactions found within the specified block. The exact format and contents of the returned data are not specified in the limited documentation.

**Return Type**: Unspecified (likely Array of Objects)

## Examples

### Example 1: Get notarisations for a specific block

**Command:**
```
verus getNotarisationsForBlock 00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include an array of notarisation transactions with details such as notarised chain symbols, block heights, and Merkle root commitments.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getNotarisationsForBlock", "params": ["00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    // Array of notarisation transaction data
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameter:**
   ```
   error code: -1
   error message:
   getNotarisationsForBlock blockHash
   ```

2. **Potential Error - Invalid Block Hash:**
   ```
   error code: -8
   error message:
   Block hash must be a hexadecimal string
   ```

3. **Potential Error - Block Not Found:**
   ```
   error code: -5
   error message:
   Block not found
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `scanNotarisationsDB`: Scan notarisations database for a specific symbol
- `calc_MoM`: Calculate Merkle of Merkles for a range of blocks
- `height_MoM`: Get Merkle of Merkles data for a specific height
- `MoMoMdata`: Retrieve Merkle of Merkle of Merkles data
- `getblock`: Get detailed information about a specific block
