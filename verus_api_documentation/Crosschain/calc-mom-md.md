# Verus RPC Command: calc_MoM

## Purpose
The `calc_MoM` command calculates the Merkle of Merkles (MoM) for a specified range of blocks. This command is essential for cross-chain verification and notarization in the Verus ecosystem.

## Description
When provided with a specific block height and depth, this command calculates a Merkle tree of block Merkle roots across the specified range. The MoM serves as a cryptographic commitment to a range of blocks, enabling efficient cross-chain verification without requiring the full blockchain data.

**Command Type**: Query/Read-only  
**Protocol Level**: Cross-Chain/Notarization  
**Access Requirement**: No special requirements

## Arguments
The command accepts two required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | numeric | Yes | N/A | The block height from which to start the MoM calculation |
| MoMdepth | numeric | Yes | N/A | The number of blocks to include in the MoM calculation |

## Results
The command returns information about the calculated MoM. The exact format and contents of the returned data are not specified in the limited documentation, but likely include the MoM hash and related metadata.

**Return Type**: Unspecified (likely Object)

## Examples

### Example 1: Calculate MoM for 1000 blocks starting from height 100000

**Command:**
```
verus calc_MoM 100000 1000
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include the calculated MoM hash and possibly additional verification data.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "calc_MoM", "params": [100000, 1000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // MoM calculation data
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameters:**
   ```
   error code: -1
   error message:
   calc_MoM height MoMdepth
   ```

2. **Potential Error - Invalid Height:**
   ```
   error code: -8
   error message:
   Height must be a positive integer
   ```

3. **Potential Error - Invalid MoMdepth:**
   ```
   error code: -8
   error message:
   MoMdepth must be a positive integer
   ```

4. **Potential Error - Height Out of Range:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `height_MoM`: Get Merkle of Merkles data for a specific height
- `MoMoMdata`: Retrieve Merkle of Merkle of Merkles data
- `getNotarisationsForBlock`: Get notarisation transactions within a specific block
- `scanNotarisationsDB`: Scan notarisations database for a specific symbol
