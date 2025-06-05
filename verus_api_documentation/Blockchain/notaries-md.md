# Verus RPC Command: notaries

## Purpose
The `notaries` command retrieves information about notary nodes at a specified blockchain height and timestamp. This command is useful for analyzing the state of notary nodes that participate in cross-chain verification and consensus mechanisms.

## Description
When provided with a block height and timestamp, this command returns information about notary nodes active at that point in the blockchain. Notary nodes play a special role in the Verus ecosystem, particularly in relation to cross-chain consensus, and this command helps track their status and activity.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/Notarization  
**Access Requirement**: No special requirements

## Arguments
The command accepts two arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | numeric | Yes | N/A | The block height at which to retrieve notary information |
| timestamp | numeric | Yes | N/A | The timestamp for which to retrieve notary information |

## Results
The command returns information about notary nodes at the specified height and timestamp. The exact format of the returned data is not specified in the limited documentation, but likely includes notary identifiers and potentially statistics about their activity.

**Return Type**: Unspecified (likely Object or Array)

## Examples

### Example 1: Get notary information at a specific height and timestamp

**Command:**
```
verus notaries 100000 1622505600
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include information about notary nodes at the specified height and timestamp.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "notaries", "params": [100000, 1622505600] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // Notary information at the specified height and timestamp
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
   notaries height timestamp
   ```

2. **Potential Error - Invalid Height Parameter:**
   ```
   error code: -8
   error message:
   Height must be a positive integer
   ```

3. **Potential Error - Invalid Timestamp Parameter:**
   ```
   error code: -8
   error message:
   Timestamp must be a positive integer
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
- `minerids`: Returns information about miners at a specified height
- `getblock`: Returns information about a block
- `getblockchaininfo`: Returns various state info regarding blockchain processing
