# Verus RPC Command: coinsupply

## Purpose
The `coinsupply` command returns detailed information about the current supply of coins in the blockchain at a specified block height. This command is valuable for analyzing the distribution and total amount of coins in circulation, including both transparent and shielded amounts.

## Description
The `coinsupply` command provides a comprehensive breakdown of the coin supply in the blockchain, including transparent coins, shielded coins (in z-addresses), and the total combined supply. This information is retrieved for a specific block height, which can be specified as an argument or defaults to the current height if not provided.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain  
**Access Requirement**: No special requirements

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| height | integer | No | Current height | The block height at which to calculate the coin supply |

## Results
The command returns a JSON object containing the following information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| result | string | Indicates whether the request was successful ("success") |
| coin | string | The currency symbol of the native coin of this blockchain (e.g., "VRSC") |
| height | integer | The block height at which this coin supply data was calculated |
| supply | float | The transparent coin supply (coins in t-addresses) |
| zfunds | float | The shielded coin supply (coins in z-addresses) |
| total | float | The total coin supply (sum of transparent and shielded coins) |

## Examples

### Example 1: Get coin supply at a specific height

**Command:**
```
verus coinsupply 420
```

**Expected Output:**
```json
{
  "result": "success",
  "coin": "VRSC",
  "height": 420,
  "supply": "777.0",
  "zfunds": "0.777",
  "total": "777.777"
}
```

### Example 2: Get current coin supply (no height specified)

**Command:**
```
verus coinsupply
```

**Expected Output:**
```json
{
  "result": "success",
  "coin": "VRSC",
  "height": 1250000,
  "supply": "42750500.123",
  "zfunds": "4275.789",
  "total": "42754775.912"
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "coinsupply", "params": [420] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "result": "success",
    "coin": "VRSC",
    "height": 420,
    "supply": "777.0",
    "zfunds": "0.777",
    "total": "777.777"
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Height:**
   ```
   error code: -8
   error message:
   Block height out of range
   ```

2. **Potential Error - Node Not Synced:**
   ```
   error code: -1
   error message:
   Node not fully synced
   ```

3. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Height must be a positive integer
   ```

## Related Commands
- `getblockchaininfo`: Returns various state info regarding blockchain processing
- `getblockcount`: Returns the number of blocks in the best valid block chain
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
