# Verus RPC Command: getsnapshot

## Purpose
The `getsnapshot` command returns a snapshot of (address, amount) pairs at the current block height. This command is useful for analyzing wealth distribution, creating rich lists, or gathering statistical information about the state of the blockchain at a specific moment in time.

## Daemon Requirements
- The daemon must be started with the `-addressindex=1` parameter to enable address indexing

## Description
When executed, this command creates a snapshot of all addresses with unspent outputs in the blockchain, along with their respective balances. The results can be limited to return only the top N addresses by balance, making it useful for generating rich lists. The command also provides statistical information such as total amount, average amount per address, and total number of UTXOs.

**Command Type**: Query/Read-only  
**Protocol Level**: Address Index  
**Access Requirement**: Requires addressindex to be enabled

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| top | number | No | N/A | Only return this many addresses, i.e., top N richlist |

## Results
The command returns a JSON object containing the snapshot data and statistics:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| addresses | array | Array of address objects containing address and amount pairs |
| total | numeric | Total amount in the snapshot |
| average | numeric | Average amount in each address |
| utxos | number | Total number of UTXOs in snapshot |
| total_addresses | number | Total number of addresses in snapshot |
| start_height | number | Block height snapshot began |
| ending_height | number | Block height snapshot finished |
| start_time | number | Unix epoch time snapshot started |
| end_time | number | Unix epoch time snapshot finished |

Each object in the `addresses` array contains:

| Field | Type | Description |
|-------|------|-------------|
| addr | string | The base58check encoded address |
| amount | string | The amount in the address as a decimal string |

## Examples

### Example 1: Get a complete snapshot of all addresses

**Command:**
```
verus getsnapshot
```

**Sample Output:**
```json
{
  "addresses": [
    {
      "addr": "RMEBhzvATA8mrfVK82E5TgPzzjtaggRGN3",
      "amount": "100.0"
    },
    {
      "addr": "RqEBhzvATAJmrfVL82E57gPzzjtaggR777",
      "amount": "23.45"
    },
    ... (more addresses)
  ],
  "total": 123.45,
  "average": 61.7,
  "utxos": 14,
  "total_addresses": 2,
  "start_height": 91,
  "ending_height": 91,
  "start_time": 1531982752,
  "end_time": 1531982752
}
```

### Example 2: Get the top 10 richest addresses

**Command:**
```
verus getsnapshot 10
```

**Sample Output:**
```json
{
  "addresses": [
    {
      "addr": "RMEBhzvATA8mrfVK82E5TgPzzjtaggRGN3",
      "amount": "1000000.0"
    },
    {
      "addr": "RqEBhzvATAJmrfVL82E57gPzzjtaggR777",
      "amount": "500000.0"
    },
    ... (8 more addresses)
  ],
  "total": 5000000.0,
  "average": 500000.0,
  "utxos": 50,
  "total_addresses": 10,
  "start_height": 100000,
  "ending_height": 100000,
  "start_time": 1622505600,
  "end_time": 1622505610
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getsnapshot", "params": [1000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "addresses": [
      {
        "addr": "RMEBhzvATA8mrfVK82E5TgPzzjtaggRGN3",
        "amount": "100.0"
      },
      ... (more addresses)
    ],
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Address Index Not Enabled:**
   ```
   error code: -1
   error message:
   Address index not enabled
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Parameter must be a positive integer
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

4. **Potential Error - Resource Exhaustion:**
   ```
   error code: -1
   error message:
   Operation timed out or resource exhaustion
   ```

## Related Commands
- `getaddressbalance`: Returns the balance for an address(es)
- `getaddressutxos`: Returns all unspent outputs for an address
- `gettxoutsetinfo`: Returns statistics about the unspent transaction output set
- `coinsupply`: Return coin supply information at a given block height
