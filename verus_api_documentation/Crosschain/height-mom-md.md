# Verus RPC Command: height_MoM

## Purpose
The `height_MoM` command retrieves Merkle of Merkles (MoM) data for a specific block height. This command is important for cross-chain verification and understanding the notarization state at a particular block height.

## Description
When provided with a block height, this command returns information about the Merkle of Merkles data associated with that height. MoM data is crucial for Verus's cross-chain verification system, allowing efficient validation of one blockchain's state from another blockchain.

**Command Type**: Query/Read-only  
**Protocol Level**: Cross-Chain/Notarization  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | numeric | Yes | N/A | The block height for which to retrieve MoM data |

## Results
The command returns MoM data for the specified height. The exact format and contents of the returned data are not specified in the limited documentation, but likely include the MoM hash and associated metadata.

**Return Type**: Unspecified (likely Object)

## Examples

### Example 1: Get MoM data for block height 100000

**Command:**
```
verus height_MoM 100000
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include the MoM hash, MoM depth, and possibly notarization details for the specified height.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "height_MoM", "params": [100000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // MoM data for the specified height
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameter:**
   ```
   error code: -1
   error message:
   height_MoM height
   ```

2. **Potential Error - Invalid Height:**
   ```
   error code: -8
   error message:
   Height must be a positive integer
   ```

3. **Potential Error - Height Out of Range:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

4. **Potential Error - No MoM Data:**
   ```
   error code: -5
   error message:
   No MoM data found for this height
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `calc_MoM`: Calculate Merkle of Merkles for a range of blocks
- `MoMoMdata`: Retrieve Merkle of Merkle of Merkles data
- `getNotarisationsForBlock`: Get notarisation transactions within a specific block
- `scanNotarisationsDB`: Scan notarisations database for a specific symbol
