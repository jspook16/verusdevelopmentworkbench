# Verus RPC Command: getoffers

## Purpose
The `getoffers` command returns all open offers for a specific currency or ID. This command is useful for viewing available market offers for trading assets on the Verus blockchain.

## Description
When provided with a currency or ID parameter, this command retrieves and lists all open offers related to the specified asset. Users can configure whether to search for currency-based or ID-based offers, and can optionally request the serialized transaction data for signing.

**Command Type**: Query/Read-only  
**Protocol Level**: DeFi/Offers  
**Access Requirement**: No special requirements

## Arguments
The command accepts three arguments, one required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| currencyorid | string | Yes | N/A | The currency or ID to check for offers, both sale and purchase |
| iscurrency | boolean | No | false | If false, searches for ID offers; if true, searches for currency offers |
| withtx | boolean | No | false | If true, returns serialized hex of the exchange transaction for signing |

## Results
The command returns a list of all available offers for or in the indicated currency or ID.

**Return Type**: Array of Objects

The exact structure of the returned data is not specified in the limited documentation, but likely includes details such as offer value, expiration, and transaction information.

## Examples

### Example 1: Get offers for a currency

**Command:**
```
verus getoffers "VRSC" true
```

**Sample Output Format:**
```json
[
  {
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "currency": "VRSC",
      "amount": 100.0
    },
    "for": {
      "currency": "USD",
      "amount": 500.0
    },
    "expiration": 1234567
  },
  {
    "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "currency": "USD",
      "amount": 1000.0
    },
    "for": {
      "currency": "VRSC",
      "amount": 200.0
    },
    "expiration": 1234600
  }
]
```

### Example 2: Get offers for an ID with transaction data

**Command:**
```
verus getoffers "MyVerusID" false true
```

**Sample Output Format:**
```json
[
  {
    "txid": "c123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "identity": "MyVerusID"
    },
    "for": {
      "currency": "VRSC",
      "amount": 5000.0
    },
    "expiration": 1234700,
    "tx": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d321752000000..."
  }
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getoffers", "params": ["VRSC", true] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      ... (other fields)
    },
    ... (more offers)
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
   Currency or ID parameter required
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   iscurrency must be a boolean
   ```

3. **Potential Error - Currency or ID Not Found:**
   ```
   error code: -5
   error message:
   Currency or ID not found
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `closeoffers`: Closes specified offers in the wallet
- `listopenoffers`: Shows offers outstanding in the wallet
- `makeoffer`: Creates a new offer for decentralized asset swapping
- `takeoffer`: Accepts an existing offer on the blockchain
