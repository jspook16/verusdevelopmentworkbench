# Verus RPC Command: z_listreceivedbyaddress

## Purpose
The `z_listreceivedbyaddress` command retrieves a detailed list of all amounts received by a specific shielded address (zaddr) belonging to the wallet. This command is essential for monitoring private fund inflows, verifying expected payments, auditing transaction history for a shielded address, and decoding encrypted memo information attached to private transactions. It provides a comprehensive view of incoming transfers that is not otherwise available through blockchain explorers for privacy-protected addresses.

## Description
When executed with the appropriate parameters, this command analyzes the wallet's shielded transaction history and returns detailed information about each payment received at the specified z-address. Unlike transparent addresses, shielded addresses utilize zero-knowledge cryptography to protect transaction details on the blockchain, making this command the only way to comprehensively view incoming payment information for such addresses. Each entry in the returned list includes the transaction ID, amount received, memo field contents (in hexadecimal format), protocol-specific output indices, confirmation status, and a flag indicating whether the transaction represents change from the wallet's own outgoing payment. The command supports filtering based on confirmation thresholds, allowing users to distinguish between confirmed and unconfirmed incoming transactions. The memo field is particularly significant for shielded transactions, as it provides a private communication channel that can contain payment references, messages, or other metadata that only the recipient can decrypt and view. This rich transaction information enables detailed financial tracking and reconciliation for private funds that is impossible to obtain through public blockchain analysis.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two arguments, one required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| address | string | Yes | N/A | The private address |
| minconf | numeric | No | 1 | Only include transactions confirmed at least this many times |

## Results
The command returns an array of objects, each representing a payment received at the address.

**Return Type**: Array of objects

## Examples

### Example 1: List all payments received by a z-address

**Command:**
```
verus z_listreceivedbyaddress "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf"
```

**Sample Output:**
```
[
  {
    "txid": "5b7e9d647e2eb60fb2a2a0b45082d4f0fab6cce3cb9aee68d67414d878927202",
    "amount": 1.00000000,
    "memo": "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "jsoutindex": 1,
    "jsindex": 0,
    "confirmations": 42,
    "change": false
  },
  {
    "txid": "8f01ff1d1b58f01ad0aad623fc0a27e805f8177883e893c3216350a3f9a272a4",
    "amount": 0.50000000,
    "memo": "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "jsoutindex": 0,
    "jsindex": 0,
    "confirmations": 28,
    "change": false
  }
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_listreceivedbyaddress", "params": ["ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid zaddr
   ```

2. **Potential Error - Address Not Found:**
   ```
   error code: -4
   error message:
   Zaddr not found in wallet
   ```

3. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf parameter, must be a non-negative integer
   ```

4. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
The structure of the returned data varies slightly between Sprout and Sapling addresses. Sprout transactions include "jsindex" (joinsplit index) and "jsoutindex" (joinsplit output index) fields, while Sapling transactions include an "outindex" field instead. The "memo" field contains a hexadecimal string representation of the memo data included with the transaction. This can be decoded to reveal any messages or references sent along with the payment. The "change" field indicates whether the note was created as change from the wallet's own transaction, which helps distinguish between external payments and internal transfers.

## Related Commands
- `z_getbalance`: Returns the balance of a taddr or zaddr belonging to the wallet
- `z_gettotalbalance`: Returns the total value of funds stored in the node's wallet
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_viewtransaction`: Get detailed shielded information about in-wallet transaction