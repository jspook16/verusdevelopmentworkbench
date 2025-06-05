# Verus RPC Command: scanNotarisationsDB

## Purpose
The `scanNotarisationsDB` command scans the notarizations database backwards from a specified height, searching for notarizations of a given blockchain symbol. This command is useful for finding the most recent notarization of a particular blockchain within a certain block range.

## Description
When provided with a block height, blockchain symbol, and optional blocks limit, this command scans the notarizations database backwards from the specified height, looking for notarizations that match the given symbol. This is particularly valuable for cross-chain verification, as it helps locate the most recent notarization data for a specific blockchain.

**Command Type**: Query/Read-only  
**Protocol Level**: Cross-Chain/Notarization  
**Access Requirement**: No special requirements

## Arguments
The command accepts three arguments, two required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blockHeight | numeric | Yes | N/A | The block height to start scanning backwards from |
| symbol | string | Yes | N/A | The blockchain symbol to scan for |
| blocksLimit | numeric | No | 1440 | The maximum number of blocks to scan backwards |

## Results
The command returns information about the found notarization(s) for the specified blockchain symbol. The exact format and contents of the returned data are not specified in the limited documentation.

**Return Type**: Unspecified (likely Object or Array)

## Examples

### Example 1: Scan for the most recent VRSC notarization from height 1000000

**Command:**
```
verus scanNotarisationsDB 1000000 "VRSC"
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include notarization details such as the block height, transaction ID, and MoM data.

### Example 2: Scan for VRSC notarization with a custom block limit

**Command:**
```
verus scanNotarisationsDB 1000000 "VRSC" 5000
```

**Expected Output Format:**
Similar to Example 1, but with a larger scan range of 5000 blocks instead of the default 1440.

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "scanNotarisationsDB", "params": [1000000, "VRSC", 2000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // Notarization data for the specified symbol
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
   Scans notarisationsdb backwards from height for a notarisation of given symbol
   ```

2. **Potential Error - Invalid Block Height:**
   ```
   error code: -8
   error message:
   Block height must be a positive integer
   ```

3. **Potential Error - Invalid Symbol:**
   ```
   error code: -8
   error message:
   Symbol must be a valid string
   ```

4. **Potential Error - Invalid Blocks Limit:**
   ```
   error code: -8
   error message:
   Blocks limit must be a positive integer
   ```

5. **Potential Error - No Notarizations Found:**
   ```
   error code: -5
   error message:
   No notarizations found for the specified symbol within the block range
   ```

6. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getNotarisationsForBlock`: Get notarisation transactions within a specific block
- `calc_MoM`: Calculate Merkle of Merkles for a range of blocks
- `height_MoM`: Get Merkle of Merkles data for a specific height
- `MoMoMdata`: Retrieve Merkle of Merkle of Merkles data
