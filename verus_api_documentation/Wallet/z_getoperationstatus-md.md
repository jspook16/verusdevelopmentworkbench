# Verus RPC Command: z_getoperationstatus

## Purpose
The `z_getoperationstatus` command retrieves the current status and associated result or error data for asynchronous z-address operations, while preserving these operations in memory. This command is essential for monitoring the progress of shielded transactions, diagnosing operation issues in real-time, tracking long-running privacy-preserving operations, and implementing sophisticated transaction management in applications that utilize shielded funds.

## Description
When executed with the appropriate parameters, this command checks the status of asynchronous z-address operations (such as those initiated by commands like `z_sendmany` or `z_shieldcoinbase`) and returns detailed information about their current state. Unlike its counterpart `z_getoperationresult`, this command returns information about operations regardless of their completion status and preserves these operations in memory for future status checks. This "check but preserve" behavior makes it particularly suitable for monitoring operations as they progress through their lifecycle. The command can be used either to check specific operations by providing their operation IDs, or to retrieve status information for all known operations when called without parameters. Each returned operation status includes comprehensive details such as the operation ID, current status (queued, executing, success, or failed), creation time, execution time, and any available result or error information. This command is an invaluable tool for applications that need to monitor the progress of shielded transactions, especially given that these operations can take considerable time to complete due to their cryptographic complexity.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| operationid | array | No | [] | A list of operation ids we are interested in. If not provided, examine all operations known to the node |

## Results
The command returns an array of objects, each representing the status of an operation.

**Return Type**: Array of objects

## Examples

### Example 1: Get status for all operations

**Command:**
```
verus z_getoperationstatus
```

**Sample Output:**
```
[
  {
    "id": "opid-6a9da0f3-c487-403c-a7a5-f8d6e7c55b99",
    "status": "executing",
    "creation_time": 1574026806,
    "method": "z_sendmany",
    "params": {
      "fromaddress": "ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9",
      "amounts": [
        {
          "address": "zs1s57c8e6r5gvl0htdctks5xwxs52awg5nezk3ajvd77wjqpn6vkjl60avuh08ffr5g9ree53k86w",
          "amount": 1.00000000
        }
      ],
      "minconf": 1,
      "fee": 0.0001
    }
  },
  {
    "id": "opid-7a9ef0f4-d518-504d-b8a6-g9d7e8c66b00",
    "status": "success",
    "creation_time": 1574025712,
    "result": {
      "txid": "8f01ff1d1b58f01ad0aad623fc0a27e805f8177883e893c3216350a3f9a272a4"
    },
    "execution_secs": 2.485999822,
    "method": "z_sendmany",
    "params": {
      "fromaddress": "ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9",
      "amounts": [
        {
          "address": "zs1s57c8e6r5gvl0htdctks5xwxs52awg5nezk3ajvd77wjqpn6vkjl60avuh08ffr5g9ree53k86w",
          "amount": 0.50000000
        }
      ],
      "minconf": 1,
      "fee": 0.0001
    }
  }
]
```

### Example 2: Get status for specific operations

**Command:**
```
verus z_getoperationstatus '["operationid", ... ]'
```

**Sample Output:**
```
[
  {
    "id": "operationid",
    "status": "failed",
    "creation_time": 1574027012,
    "error": {
      "code": -6,
      "message": "Insufficient funds, no unspent notes found for zaddr from address."
    },
    "execution_secs": 0.109999895,
    "method": "z_sendmany",
    "params": {
      "fromaddress": "ztbx5DLDxa5ZLFTchHhoPNkKs57QzSyib6UqXpEdy76T1aUdFxJt1w9318Z8DJ73XzbnWHKEZP9Yjg712N5kMmP4QzS9iC9",
      "amounts": [
        {
          "address": "zs1s57c8e6r5gvl0htdctks5xwxs52awg5nezk3ajvd77wjqpn6vkjl60avuh08ffr5g9ree53k86w",
          "amount": 10.00000000
        }
      ],
      "minconf": 1,
      "fee": 0.0001
    }
  }
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_getoperationstatus", "params": ['["operationid", ... ]'] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Operation ID Format:**
   ```
   error code: -8
   error message:
   Invalid parameter, operationid must be a string
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected array
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
This command preserves operations in memory after checking their status. If you want to remove completed operations from memory after retrieving their status, use `z_getoperationresult` instead. Operations can be in one of several states: "queued", "executing", "success", or "failed". The "queued" and "executing" states are transient, while "success" and "failed" are terminal states. The operation data structure includes detailed information about the original request parameters, which can be useful for monitoring and debugging.

## Related Commands
- `z_getoperationresult`: Get operation results and remove operations from memory
- `z_listoperationids`: Returns a list of operation ids currently known to the wallet
- `z_sendmany`: Send multiple amounts from a shielded address to multiple recipients
- `z_shieldcoinbase`: Shield transparent coinbase funds to a shielded address
- `z_mergetoaddress`: Merge multiple UTXOs and notes into a single UTXO or note