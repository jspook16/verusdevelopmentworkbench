# Verus RPC Command: MoMoMdata

## Purpose
The `MoMoMdata` command retrieves Merkle of Merkle of Merkles (MoMoM) data for a specific symbol, KMD height, and CCID (Cross-Chain ID). This command is essential for cross-chain verification and notarization in the Verus multi-chain ecosystem.

## Description
When provided with the required parameters, this command returns MoMoM data that represents a cryptographic commitment to a particular state across multiple blockchains. MoMoM data is used in the Verus cross-chain verification system to enable secure and efficient verification of one blockchain's state from another blockchain.

**Command Type**: Query/Read-only  
**Protocol Level**: Cross-Chain/Notarization  
**Access Requirement**: No special requirements

## Arguments
The command accepts three required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| symbol | string | Yes | N/A | The blockchain symbol to retrieve MoMoM data for |
| kmdheight | numeric | Yes | N/A | The Komodo blockchain height to use as reference |
| ccid | string/numeric | Yes | N/A | The Cross-Chain ID for which to retrieve MoMoM data |

## Results
The command returns MoMoM data for the specified parameters. The exact format and contents of the returned data are not specified in the limited documentation, but likely include cryptographic commitments and metadata related to cross-chain notarizations.

**Return Type**: Unspecified (likely Object)

## Examples

### Example 1: Get MoMoM data for VRSC at KMD height 1000000 with CCID 1

**Command:**
```
verus MoMoMdata "VRSC" 1000000 1
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include MoMoM hash, notarization details, and cross-chain verification data.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "MoMoMdata", "params": ["VRSC", 1000000, 1] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // MoMoM data for the specified parameters
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
   MoMoMdata symbol kmdheight ccid
   ```

2. **Potential Error - Invalid Symbol:**
   ```
   error code: -8
   error message:
   Invalid blockchain symbol
   ```

3. **Potential Error - Invalid KMD Height:**
   ```
   error code: -8
   error message:
   KMD height must be a positive integer
   ```

4. **Potential Error - Invalid CCID:**
   ```
   error code: -8
   error message:
   CCID must be a valid identifier
   ```

5. **Potential Error - No Data Found:**
   ```
   error code: -5
   error message:
   No MoMoM data found for these parameters
   ```

6. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `calc_MoM`: Calculate Merkle of Merkles for a range of blocks
- `height_MoM`: Get Merkle of Merkles data for a specific height
- `getNotarisationsForBlock`: Get notarisation transactions within a specific block
- `scanNotarisationsDB`: Scan notarisations database for a specific symbol
