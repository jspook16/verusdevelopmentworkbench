# Verus RPC Command: z_listoperationids

## Purpose
The `z_listoperationids` command returns a list of operation IDs for all asynchronous operations currently known to the wallet. This command is essential for tracking asynchronous shielded transaction operations, monitoring pending z-address transactions, implementing automated transaction management, and maintaining systematic oversight of ongoing privacy-preserving financial activities. It provides a crucial index of operations that can be used with other commands to retrieve detailed status information.

## Description
When executed with the appropriate parameter, this command retrieves and returns the identifiers for all asynchronous operations that the wallet is currently tracking. These operations typically represent shielded transactions that are being created, signed, or broadcast, initiated by commands such as `z_sendmany` or `z_shieldcoinbase`. The command supports optional filtering by status, allowing users to retrieve only operations in a specific state, such as "success" or "failed". This filtering capability enables focused monitoring of operations based on their execution stage. The returned operation IDs can subsequently be passed to commands like `z_getoperationstatus` or `z_getoperationresult` to obtain detailed information about each operation's current state, execution time, parameters, and results. This command serves as an entry point into the wallet's asynchronous operation tracking system, providing a comprehensive overview of all operations the wallet is processing or has recently completed. This functionality is particularly valuable in automated systems that need to systematically track and manage multiple shielded transactions.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | All statuses | Filter result by the operation's state e.g. "success" |

## Results
The command returns an array of strings, each representing an operation ID.

**Return Type**: Array of strings

## Examples

### Example 1: List all operation IDs known to the wallet

**Command:**
```
verus z_listoperationids
```

**Sample Output:**
```
[
  "opid-6a9da0f3-c487-403c-a7a5-f8d6e7c55b99",
  "opid-7a9ef0f4-d518-504d-b8a6-g9d7e8c66b00",
  "opid-8b0fa1e5-e629-615e-c9b7-h0e8f9d77c01"
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_listoperationids", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Status Parameter:**
   ```
   error code: -8
   error message:
   Invalid status parameter, expected one of: \"queued\", \"executing\", \"success\", \"failed\", \"cancelled\"
   ```

2. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
Operation IDs are unique identifiers generated when asynchronous operations are initiated. They are designed to be used with other commands to retrieve status and result information. Operations can be in various states: "queued", "executing", "success", "failed", or "cancelled". The status filter parameter accepts any of these state strings. If no operations match the specified status filter, an empty array is returned. Operations are typically removed from the wallet's memory when their results are retrieved using `z_getoperationresult`, so this list represents only operations that are still being tracked.

## Related Commands
- `z_getoperationstatus`: Get operation status and any associated result or error data
- `z_getoperationresult`: Retrieve the result and status of an operation which has finished
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_shieldcoinbase`: Shield transparent coinbase funds to a shielded address
- `z_mergetoaddress`: Merge multiple UTXOs and notes into a single UTXO or note