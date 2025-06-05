# Verus RPC Command: z_sendmany

## Purpose
The `z_sendmany` command facilitates the sending of multiple payments in a single transaction from a specified address to multiple recipients. This command is essential for batch processing payments, reducing transaction fees through consolidation, enhancing privacy by combining multiple payments, and enabling cross-pool transfers between transparent and shielded address types. It provides flexible support for both transparent and shielded transactions, with additional features like encrypted memo fields for shielded recipients.

## Description
When executed with the appropriate parameters, this command constructs and broadcasts a transaction that sends funds from a single source address (either transparent or shielded) to multiple destination addresses of either type. The command handles the complex cryptography required for privacy-preserving transactions automatically, creating appropriate zero-knowledge proofs when shielded addresses are involved. For transactions from transparent addresses, change is directed to a new transparent address, while transactions from shielded addresses return change to the original sender address. The command supports attaching encrypted memos when sending to shielded addresses, enabling private communication or transaction labeling that only the recipient can decrypt. This operation is processed asynchronously due to the potentially intensive cryptographic calculations required, especially for shielded transactions, and returns an operation ID that can be used to track progress. This comprehensive functionality makes it a powerful tool for managing complex payment scenarios while maintaining privacy options.

**Command Type**: Action/Transaction  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts four arguments, two required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaddress | string | Yes | N/A | The taddr or zaddr to send the funds from |
| amounts | array | Yes | N/A | An array of JSON objects representing the amounts to send |
| minconf | numeric | No | 1 | Only use funds confirmed at least this many times |
| fee | numeric | No | 0.0001 | The fee amount to attach to this transaction |

## Results
The command returns a string representing the operation ID, which can be used to track the status of the operation.

**Return Type**: String (operation ID)

## Examples

### Example 1: Send from a transparent address to a shielded address

**Command:**
```
verus z_sendmany "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" '[{"address": "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf" ,"amount": 5.0}]'
```

**Sample Output:**
```
opid-6a9da0f3-c487-403c-a7a5-f8d6e7c55b99
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_sendmany", "params": ["RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", [{"address": "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf" ,"amount": 5.0}]] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid From Address:**
   ```
   error code: -8
   error message:
   Invalid from address
   ```

2. **Potential Error - Invalid Amounts Object:**
   ```
   error code: -8
   error message:
   Invalid amounts object, expected array of JSON objects with format: {\"address\":address,\"amount\":amount}
   ```

3. **Potential Error - Invalid Amount:**
   ```
   error code: -3
   error message:
   Amount out of range
   ```

4. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds, no unspent notes found for zaddr from address
   ```

5. **Potential Error - Transaction Size Limit:**
   ```
   error code: -4
   error message:
   Transaction is too large, size exceeds limit
   ```

## Notes
Amounts are decimal numbers with at most 8 digits of precision. Change generated from a transparent address (taddr) flows to a new transparent address, while change generated from a shielded address (zaddr) returns to itself. When sending coinbase UTXOs to a shielded address, change is not allowed; the entire value of the UTXO(s) must be consumed. Before Sapling activation, the maximum number of shielded outputs is limited to 54 due to transaction size limits. If a memo is provided when sending to a transparent address, the memo is ignored as transparent addresses cannot receive memos. The operation is processed asynchronously, and the status can be checked using the returned operation ID with `z_getoperationstatus` and `z_getoperationresult` commands.

## Related Commands
- `z_getoperationstatus`: Get operation status and any associated result or error data
- `z_getoperationresult`: Retrieve the result and status of an operation which has finished
- `z_listoperationids`: Returns the list of operation ids currently known to the wallet
- `z_getnewaddress`: Returns a new shielded address for receiving payments
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet