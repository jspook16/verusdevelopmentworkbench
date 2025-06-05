# Verus RPC Command: getmininginfo

## Purpose
The `getmininginfo` command returns a comprehensive JSON object containing mining-related information. This command is valuable for monitoring mining and staking activities, network statistics, and blockchain state.

## Description
When executed, this command provides detailed information about the current mining and staking status, including block statistics, difficulty, network solution rate, memory pool status, and more. This information is useful for miners, stakers, and node operators who need to monitor performance and network conditions.

**Command Type**: Query/Read-only  
**Protocol Level**: Mining/Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing the following mining-related information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| blocks | numeric | The current block height |
| currentblocksize | numeric | The size of the last block |
| currentblocktx | numeric | The number of transactions in the last block |
| averageblockfees | numeric | The average block fees, in addition to block reward, over the past 100 blocks |
| difficulty | numeric | The current mining difficulty |
| stakingsupply | numeric | The current estimated total staking supply |
| errors | string | Current error messages |
| generate | boolean | If mining/generation is enabled |
| genproclimit | numeric | The processor limit for mining (-1 if unlimited) |
| localsolps | numeric | The average local solution rate in Sol/s since node start |
| networksolps | numeric | The estimated network solution rate in Sol/s |
| pooledtx | numeric | The size of the memory pool |
| testnet | boolean | Whether the node is running on testnet |
| chain | string | Current network name (main, test, regtest) |
| staking | boolean | Whether staking is enabled |
| numthreads | numeric | Number of CPU threads mining |
| mergemining | numeric | Number of blockchains being merge mined |
| mergeminedchains | array | List of blockchain names being merge mined (optional) |

## Examples

### Example 1: Get mining information

**Command:**
```
verus getmininginfo
```

**Sample Output:**
```json
{
  "blocks": 1234567,
  "currentblocksize": 8432,
  "currentblocktx": 12,
  "averageblockfees": 0.00123,
  "difficulty": 123456.789,
  "stakingsupply": 50000000.0,
  "errors": "",
  "generate": true,
  "genproclimit": 4,
  "localsolps": 250.123,
  "networksolps": 15000000,
  "pooledtx": 34,
  "testnet": false,
  "chain": "main",
  "staking": true,
  "numthreads": 4,
  "mergemining": 2,
  "mergeminedchains": ["CHAIN1", "CHAIN2"]
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getmininginfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "blocks": 1234567,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

2. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

3. **Potential Error - Connection Issue:**
   ```
   error code: -9
   error message:
   Cannot connect to Verus daemon
   ```

## Related Commands
- `getnetworksolps`: Returns the estimated network solutions per second
- `getlocalsolps`: Returns the average local solutions per second since node start
- `getgenerate`: Return if the server is set to mine and/or mint coins
- `setgenerate`: Set whether mining/staking is enabled and configure processor limits
- `getblocktemplate`: Gets data needed to construct a block to work on
- `getminingdistribution`: Retrieves current mining distribution
