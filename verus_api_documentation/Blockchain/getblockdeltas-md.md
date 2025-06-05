# Verus RPC Command: getblockdeltas

## Purpose
The `getblockdeltas` command returns detailed information about a specific block and all its transactions, including inputs and outputs of each transaction. This experimental command is particularly useful for blockchain explorers and analytics tools that need to track the flow of funds across the blockchain.

## Daemon Requirements
- The daemon must be started with the `-experimentalfeatures=1` parameter
- The daemon must be started with the `-insightexplorer=1` parameter

## Description
When enabled and executed, this command provides comprehensive information about a specific block identified by its hash, including details about all transactions within the block. For each transaction, it provides information about inputs and outputs, including addresses and amounts, making it valuable for tracking the movement of funds.

**Command Type**: Query/Read-only  
**Protocol Level**: Blockchain/Experimental  
**Access Requirement**: Requires special daemon configuration

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| blockhash | string | Yes | N/A | The block hash identifying the block to retrieve |

## Results
The command returns a JSON object containing detailed information about the block and its transactions:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| hash | string | Block ID |
| confirmations | numeric | Number of confirmations |
| size | numeric | Block size in bytes |
| height | numeric | Block height |
| version | numeric | Block version (e.g., 4) |
| merkleroot | string | Block Merkle root (hexstring) |
| deltas | array | Array of transaction objects with detailed input/output information |
| time | numeric | The block time |
| mediantime | numeric | The most recent blocks' average time |
| nonce | string | The nonce (hex string) |
| bits | string | The bits (hex string) |
| difficulty | numeric | The current difficulty |
| chainwork | string | Total amount of work in active chain (hex string) |
| previousblockhash | string | The hash of the previous block (hex string) |
| nextblockhash | string | The hash of the next block (hex string) |

Each object in the `deltas` array contains:

| Field | Type | Description |
|-------|------|-------------|
| txid | string | Transaction ID (hexstring) |
| index | numeric | The offset of the tx in the block |
| inputs | array | Array of input objects |
| outputs | array | Array of output objects |

Each input object contains:

| Field | Type | Description |
|-------|------|-------------|
| address | string | Transparent address |
| satoshis | numeric | Negative of spend amount |
| index | numeric | Vin index |
| prevtxid | string | Source UTXO tx ID |
| prevout | numeric | Source UTXO index |

Each output object contains:

| Field | Type | Description |
|-------|------|-------------|
| address | string | Transparent address |
| satoshis | numeric | Amount |
| index | numeric | Vout index |

## Examples

### Example 1: Get block deltas for a specific block

**Command:**
```
verus getblockdeltas 00227e566682aebd6a7a5b772c96d7a999cadaebeaf1ce96f4191a3aad58b00b
```

**Expected Output Format:**
```json
{
  "hash": "00227e566682aebd6a7a5b772c96d7a999cadaebeaf1ce96f4191a3aad58b00b",
  "confirmations": 12345,
  "size": 2345,
  "height": 5000,
  "version": 4,
  "merkleroot": "7e2fc7196d3df2884dbc8ad28902d4751a5c8397e3a4b053086e49f2acd14fbd",
  "deltas": [
    {
      "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "index": 0,
      "inputs": [
        {
          "address": "RV1234567890abcdef1234567890abcdef12",
          "satoshis": -1000000,
          "index": 0,
          "prevtxid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          "prevout": 1
        }
      ],
      "outputs": [
        {
          "address": "RV2345678901abcdef2345678901abcdef23",
          "satoshis": 900000,
          "index": 0
        },
        {
          "address": "RV3456789012abcdef3456789012abcdef34",
          "satoshis": 100000,
          "index": 1
        }
      ]
    }
  ],
  "time": 1529696743,
  "mediantime": 1529696500,
  "nonce": "00001a5c07f0ffff",
  "bits": "1d00ffff",
  "difficulty": 1.0,
  "chainwork": "0000000000000000000000000000000000000000000000123456789abcdef0",
  "previousblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "nextblockhash": "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34"
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockdeltas", "params": ["00227e566682aebd6a7a5b772c96d7a999cadaebeaf1ce96f4191a3aad58b00b"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hash": "00227e566682aebd6a7a5b772c96d7a999cadaebeaf1ce96f4191a3aad58b00b",
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Command Disabled:**
   ```
   error code: -32601
   error message:
   getblockdeltas is disabled. To enable it, restart zcashd with the -experimentalfeatures and -insightexplorer commandline options, or add these two lines to the zcash.conf file: experimentalfeatures=1 insightexplorer=1
   ```

2. **Potential Error - Block Not Found:**
   ```
   error code: -5
   error message:
   Block not found
   ```

3. **Potential Error - Invalid Block Hash:**
   ```
   error code: -8
   error message:
   blockhash must be of length 64 (not XX)
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getblock`: Returns information about a block
- `getblockhash`: Returns hash of block at specified height in the blockchain
- `getrawtransaction`: Returns raw transaction data
- `gettxout`: Returns details about an unspent transaction output
