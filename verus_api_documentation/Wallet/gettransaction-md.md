# Verus RPC Command: gettransaction

## Purpose
The `gettransaction` command retrieves detailed information about an in-wallet transaction. This command is essential for examining transaction details, confirmations, amounts, and associated metadata.

## Description
When provided with a transaction ID, this command returns comprehensive information about the specified transaction if it exists in the wallet. The information includes the transaction amount, confirmation status, block information, timestamps, and detailed breakdowns of transaction inputs and outputs. Optionally, it can include information about watch-only addresses in the balance calculation and details.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet with the transaction

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The transaction ID to retrieve information for |
| includeWatchonly | boolean | No | false | Whether to include watchonly addresses in balance calculation and details |

## Results
The command returns a JSON object containing detailed information about the transaction:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| amount | numeric | The transaction amount in VRSC |
| confirmations | numeric | The number of confirmations |
| blockhash | string | The block hash containing the transaction |
| blockindex | numeric | The block index |
| blocktime | numeric | The block time in seconds since epoch (1 Jan 1970 GMT) |
| txid | string | The transaction ID |
| time | numeric | The transaction time in seconds since epoch |
| timereceived | numeric | The time received in seconds since epoch |
| details | array | Array of objects with detailed per-address information |
| vjoinsplit | array | Array of joinsplit descriptions (for shielded transactions) |
| hex | string | Raw data for transaction |

Each object in the `details` array contains:

| Field | Type | Description |
|-------|------|-------------|
| account | string | The account name involved (DEPRECATED) |
| address | string | The Verus address involved |
| category | string | The category, either 'send' or 'receive' |
| amount | numeric | The amount in VRSC |
| vout | numeric | The vout value |

Each object in the `vjoinsplit` array contains:

| Field | Type | Description |
|-------|------|-------------|
| anchor | string | Merkle root of note commitment tree |
| nullifiers | array | Nullifiers of input notes |
| commitments | array | Note commitments for note outputs |
| macs | array | Message authentication tags |
| vpub_old | numeric | The amount removed from the transparent value pool |
| vpub_new | numeric | The amount added to the transparent value pool |

## Examples

### Example 1: Get transaction details

**Command:**
```
verus gettransaction "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"
```

**Sample Output:**
```json
{
  "amount": 10.00000000,
  "confirmations": 80,
  "blockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "blockindex": 3,
  "blocktime": 1622505600,
  "txid": "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
  "time": 1622505500,
  "timereceived": 1622505510,
  "details": [
    {
      "account": "",
      "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
      "category": "receive",
      "amount": 10.00000000,
      "vout": 0
    }
  ],
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff..."
}
```

### Example 2: Get transaction details including watchonly addresses

**Command:**
```
verus gettransaction "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d" true
```

**Sample Output:**
```json
{
  "amount": 15.00000000,
  "confirmations": 80,
  "blockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "blockindex": 3,
  "blocktime": 1622505600,
  "txid": "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
  "time": 1622505500,
  "timereceived": 1622505510,
  "details": [
    {
      "account": "",
      "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
      "category": "receive",
      "amount": 10.00000000,
      "vout": 0
    },
    {
      "account": "",
      "address": "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b",
      "category": "receive",
      "amount": 5.00000000,
      "vout": 1
    }
  ],
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff..."
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "gettransaction", "params": ["1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "amount": 10.00000000,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - No Transaction ID Specified:**
   ```
   error code: -8
   error message:
   Transaction ID required
   ```

2. **Potential Error - Invalid Transaction ID Format:**
   ```
   error code: -8
   error message:
   Invalid transaction ID
   ```

3. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Invalid or non-wallet transaction ID
   ```

4. **Potential Error - Invalid includeWatchonly Parameter:**
   ```
   error code: -8
   error message:
   includeWatchonly must be a boolean
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `listtransactions`: Returns up to 'count' most recent transactions
- `listsinceblock`: Get all transactions since block [blockhash]
- `getrawtransaction`: Returns raw transaction data
- `decoderawtransaction`: Returns information about a raw transaction
