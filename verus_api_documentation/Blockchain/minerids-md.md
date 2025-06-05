# Verus RPC Command: minerids

## Purpose
The `minerids` command retrieves information about miners and their identities at a specified blockchain height. This command is useful for analyzing mining activity and distribution across different miners.

## Description
When provided with a block height, this command returns information about miners active at that height in the blockchain. The exact details returned may vary based on the implementation, but typically include identifiers or statistics about miners.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/Mining  
**Access Requirement**: No special requirements

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | numeric | Yes | N/A | The block height at which to retrieve miner information |

## Results
The command returns information about miners active at the specified height. The exact format of the returned data is not specified in the limited documentation, but likely includes miner identifiers and potentially statistics about their mining activity.

**Return Type**: Unspecified (likely Object or Array)

## Examples

### Example 1: Get miner IDs at a specific height

**Command:**
```
verus minerids 100000
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include information about miners at block height 100000.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "minerids", "params": [100000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // Miner information at the specified height
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
   minerids needs height
   ```

2. **Potential Error - Invalid Height Parameter:**
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

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getmininginfo`: Returns a JSON object containing mining-related information
- `getblocktemplate`: Returns data needed to construct a block to work on
- `getnetworkhashps`: Returns the estimated network hashes per second
- `getblock`: Returns information about a block (may include miner information)
