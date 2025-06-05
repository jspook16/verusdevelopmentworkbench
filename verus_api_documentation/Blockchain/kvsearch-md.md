# Verus RPC Command: kvsearch

## Purpose
The `kvsearch` command searches for a key that was previously stored via the `kvupdate` command. This command allows users to retrieve key-value data that has been stored on the blockchain.

## Description
When provided with a key identifier, this command searches the blockchain for the specified key and returns detailed information about the key and its associated value. This feature is only available for asset chains.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/KeyValue  
**Access Requirement**: Only available on asset chains

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| key | string | Yes | N/A | Search the chain for this key |

## Results
The command returns a JSON object containing detailed information about the key, its associated value, and metadata:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| coin | string | Chain the key is stored on |
| currentheight | numeric | Current height of the chain |
| key | string | The key that was searched for |
| keylen | numeric | Length of the key |
| owner | string | Hex string representing the owner of the key |
| height | numeric | Height at which the key was stored |
| expiration | numeric | Height at which the key will expire |
| flags | numeric | 1 if the key was created with a password; 0 otherwise |
| value | string | The stored value associated with the key |
| valuesize | numeric | Amount of characters stored in the value |

## Examples

### Example 1: Search for a specific key

**Command:**
```
verus kvsearch examplekey
```

**Sample Output:**
```json
{
  "coin": "VRSC",
  "currentheight": 1234567,
  "key": "examplekey",
  "keylen": 10,
  "owner": "02a7acc1911bfc6b5cf185329ce03064a2201d3e41b4ffd13a6a4345be79f1a940",
  "height": 1234000,
  "expiration": 1237000,
  "flags": 1,
  "value": "examplevalue",
  "valuesize": 12
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "kvsearch", "params": ["examplekey"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "coin": "VRSC",
    "currentheight": 1234567,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Key Not Found:**
   ```
   error code: -5
   error message:
   Key not found
   ```

2. **Potential Error - Not an Asset Chain:**
   ```
   error code: -1
   error message:
   KV features are only available on asset chains
   ```

3. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Key must be a string
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `kvupdate`: Store a key-value pair in the blockchain
