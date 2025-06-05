# Verus RPC Command: kvupdate

## Purpose
The `kvupdate` command stores a key-value pair in the blockchain. This command allows users to utilize the blockchain as a secure, decentralized key-value store with optional expiration and passphrase protection.

## Description
When executed with the required parameters, this command creates a transaction that stores the specified key-value pair on the blockchain. The data can be set to expire after a specified number of days, and access to update the key can be restricted with an optional passphrase. This feature is only available for asset chains.

**Command Type**: Action/Write  
**Protocol Level**: Blockchain/KeyValue  
**Access Requirement**: Only available on asset chains

## Arguments
The command accepts four arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| key | string | Yes | N/A | Key to store |
| value | string | Yes | N/A | Value to store |
| days | numeric | Yes | N/A | Amount of days (1440 blocks/day) before the key expires. Minimum 1 day |
| passphrase | string | No | N/A | Passphrase required to update this key |

## Results
The command returns a JSON object containing information about the stored key-value pair and the transaction:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| coin | string | Chain the key is stored on |
| height | numeric | Height the key was stored at |
| expiration | numeric | Height the key will expire |
| flags | numeric | Amount of days the key will be stored |
| key | string | Stored key |
| keylen | numeric | Length of the key |
| value | string | Stored value |
| valuesize | numeric | Length of the stored value |
| fee | numeric | Transaction fee paid to store the key |
| txid | string | Transaction ID |

## Examples

### Example 1: Store a key-value pair with expiration and passphrase

**Command:**
```
verus kvupdate examplekey "examplevalue" 2 examplepassphrase
```

**Sample Output:**
```json
{
  "coin": "VRSC",
  "height": 1234567,
  "expiration": 1237447,
  "flags": 2,
  "key": "examplekey",
  "keylen": 10,
  "value": "examplevalue",
  "valuesize": 12,
  "fee": 0.0001,
  "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "kvupdate", "params": ["examplekey", "examplevalue", 2, "examplepassphrase"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "coin": "VRSC",
    "height": 1234567,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Not an Asset Chain:**
   ```
   error code: -1
   error message:
   KV features are only available on asset chains
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Key, value must be strings; days must be a positive number
   ```

3. **Potential Error - Invalid Days Parameter:**
   ```
   error code: -8
   error message:
   Days must be a minimum of 1
   ```

4. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds for transaction fee
   ```

5. **Potential Error - Incorrect Passphrase:**
   ```
   error code: -13
   error message:
   Incorrect passphrase for key update
   ```

## Related Commands
- `kvsearch`: Search for a key stored via the kvupdate command
