# Verus RPC Command: z_getoperationresult

## Purpose
The `z_getoperationresult` command retrieves the results and status information for completed asynchronous z-address operations and then removes them from memory. This command is essential for efficiently collecting outcomes of asynchronous operations like shielded transactions, facilitating automated transaction processing, enabling programmatic verification of operation completion, and maintaining clean memory usage within the wallet by removing processed operation records.

## Description
When executed with the appropriate parameters, this command checks the status of asynchronous z-address operations (such as those initiated by commands like `z_sendmany` or `z_shieldcoinbase`) and returns detailed information about any operations that have completed. Unlike its counterpart `z_getoperationstatus`, this command only returns information about operations that have reached a terminal state (success or failure) and, crucially, removes these operations from the node's memory after reporting them. This "retrieve and remove" behavior makes it particularly suitable for processing workflows where operations need to be consumed and acknowledged once completed. The command can be used either to check specific operations by providing their operation IDs, or to retrieve all completed operations when called without parameters. Each returned operation result includes comprehensive details such as the operation ID, status, execution result or error information, and any relevant transaction details. This command is an essential tool for applications that initiate asynchronous shielded transactions and need to process their results systematically.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| operationid | array | No | [] | A list of operation ids we are interested in. If not provided, examine all operations known to the node |

## Results
The command returns an array of objects, each representing the result of a completed operation.

**Return Type**: Array of objects

## Examples

### Example 1: Get results for all completed operations

**Command:**
```
verus z_getoperationresult
```

**Sample Output:**
```
[
  {
    "id": "opid-6a9da0f3-c487-403c-a7a5-f8d6e7c55b99",
    "status": "success",
    "creation_time": 1574026806,
    "result": {
      "txid": "5b7e9d647e2eb60fb2a2a0b45082d4f0fab6cce3cb9aee68d67414d878927202"
    },
    "execution_secs": 2.271999835,
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
  }
]
```

### Example 2: Get results for specific operations

**Command:**
```
verus z_getoperationresult '["operationid", ... ]'
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
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_getoperationresult", "params": ['["operationid", ... ]'] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
This command removes operations from memory after retrieving them. If you need to preserve the operation data in memory for future reference, use `z_getoperationstatus` instead. The command only returns results for operations that have completed (either successfully or with errors); operations still in progress will not be included in the results. The operation data structure includes detailed information about the original request parameters, which can be useful for reconciliation and auditing purposes.

## Related Commands
- `z_getoperationstatus`: Get operation status without removing operations from memory
- `z_listoperationids`: Returns a list of operation ids currently known to the wallet
- `z_sendmany`: Send multiple amounts from a shielded address to multiple recipients
- `z_shieldcoinbase`: Shield transparent coinbase funds to a shielded address
- `z_mergetoaddress`: Merge multiple UTXOs and notes into a single UTXO or note