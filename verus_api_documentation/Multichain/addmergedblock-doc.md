# Verus RPC Command: addmergedblock

## Purpose
The `addmergedblock` command is designed to add a fully prepared block and its header to the current merge mining queue of the Verus daemon. This command is fundamental to Verus's PBaaS (Public Blockchains as a Service) functionality, enabling the merge mining of multiple chains simultaneously.

## Daemon Requirements
- Must be running a Verus daemon with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - For merge mining, you may also need:
    - `-gen` - Enable mining
    - `-genproclimit=N` - Set number of threads for mining (where N is the number of threads)
    - `-mineraddress=ADDRESS` - Set the address to receive mining rewards

## Description
The `addmergedblock` command takes a fully prepared, unsolved block in hexadecimal format and adds it to the merge mining queue of the daemon. When a block is added to the queue, certain parameters (notably nTime and nSolution) are replaced by the daemon. This command is essential for the merge mining process that allows miners to simultaneously mine multiple chains without sacrificing hash power.

Verus's innovative approach to merge mining allows miners to work on up to 22 PBaaS chains simultaneously, optimizing mining efficiency by validating multiple blockchains with the same proof of work. When this command is executed, the daemon evaluates whether adding the block would exceed available merge mining slots and determines the appropriate action based on the specified parameters.

**Command Type**: Mining  
**Protocol Level**: Blockchain  
**Access Requirement**: Mining node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hexdata` | string | Yes | The hex-encoded, complete, unsolved block data to add. The nTime and nSolution fields will be replaced by the daemon. |
| `jsonparametersobject` | object | Yes | A JSON object containing parameters for handling the block |
| » `name` | string | Yes | Chain name symbol |
| » `rpchost` | string | Yes | Host address for RPC connection |
| » `rpcport` | integer | Yes | Port address for RPC connection |
| » `userpass` | string | Yes | Credentials for login to RPC |
| » `estimatedroi` | number | Optional | Estimated return on investment (calculated as verusreward/hashrate) |

## Results
The command returns one of the following results:

| Result | Description |
|--------|-------------|
| `"deserialize-invalid"` | The block could not be deserialized and was rejected as invalid |
| `"blocksfull"` | The block did not exceed others in estimated ROI, and there was no room for an additional merge mined block |
| `{"nextblocktime": n}` | The block has an invalid time and must be remade with the time returned |
| Transaction ID | If successful, returns the transaction ID of the added block |

## Examples

### Example 1: Add a merged block to the queue

**Command:**
```
verus addmergedblock "hexdata" '{"currencyid": "hexstring", "rpchost": "127.0.0.1", "rpcport": portnum}'
```

### Example 2: Using curl to add a merged block

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "addmergedblock", "params": ["hexdata" '{"currencyid": "hexstring", "rpchost": "127.0.0.1", "rpcport": portnum, "estimatedroi": (verusreward/hashrate)}'] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Merge Mining Process

The merge mining process in Verus involves:

1. Creating a block template for each chain to be merge mined
2. Adding these templates to the mining queue using the `addmergedblock` command
3. The daemon replaces nTime and nSolution fields in each block
4. The miner works on solving all blocks simultaneously with the same proof of work
5. When a valid solution is found, it can be used to confirm blocks on all chains in the queue

### ROI Calculation

When determining which blocks to keep in the merge mining queue:
- Each block has an associated ROI (Return On Investment)
- ROI is calculated as `verusreward/hashrate`
- If adding a new block would exceed available slots, blocks with the lowest ROI may be replaced

### Queue Management

The merge mining queue has a limited number of slots. When adding a block:
1. If slots are available, the block is added directly
2. If no slots are available, the daemon compares the estimated ROI of the new block with those already in the queue
3. If the new block has a higher ROI than the lowest in the queue, it replaces that block
4. Otherwise, the command returns "blocksfull"

## Potential Error Cases

1. **Invalid Block Data:**
   ```
   error code: -22
   error message:
   Block data could not be deserialized
   ```

2. **Invalid Parameters:**
   ```
   error code: -8
   error message:
   Invalid parameters, expected object with fields: name, rpchost, rpcport, userpass
   ```

3. **Connection Error:**
   ```
   error code: -9
   error message:
   Could not connect to RPC host
   ```

4. **Authentication Error:**
   ```
   error code: -5
   error message:
   Invalid RPC credentials
   ```

5. **Queue Full:**
   ```
   blocksfull
   ```

## Use Cases

1. **Multi-chain Mining Operations:**
   Mining pool operators can optimize mining operations by merge mining multiple chains simultaneously.

2. **PBaaS Chain Mining:**
   Miners can contribute hash power to newly launched PBaaS chains while still mining Verus.

3. **Mining Efficiency Optimization:**
   Mining operations can be made more efficient by allocating resources based on ROI calculations.

4. **Secondary Chain Security:**
   Provides security to smaller chains by allowing them to benefit from the hash power of larger miners.

## Related Commands

- `getblocktemplate` - Generate a block template for mining
- `getmininginfo` - Get information about the current mining status
- `setgenerate` - Control CPU mining process

## Reference
For additional information about merge mining in the Verus ecosystem, refer to the official documentation and community resources.
