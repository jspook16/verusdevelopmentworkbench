# Verus RPC Command: sendmany

## Purpose
The `sendmany` command provides a powerful mechanism to send multiple payment amounts to multiple Verus addresses in a single transaction. This command is particularly valuable for batch processing of payments, minimizing transaction fees, reducing blockchain bloat, and simplifying payment workflows that require distributing funds to multiple recipients simultaneously. It offers significant efficiency advantages over processing multiple individual transactions.

## Description
When executed with the appropriate parameters, this command creates and broadcasts a single transaction that sends the specified amounts to the specified addresses. Unlike multiple separate transactions, `sendmany` combines all payments into one blockchain transaction, reducing the overall transaction size and fees while ensuring that either all payments succeed or all fail together (atomic operation). The command allows specification of confirmation requirements for input funds, adding descriptive comments for record-keeping, and optionally distributing transaction fees among specified recipients. This advanced functionality makes it ideal for payroll operations, dividend distributions, mining pool payments, and other scenarios requiring efficient fund distribution.

**Command Type**: Action/Transaction  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts five arguments, two required and three optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaccount | string | Yes | N/A | MUST be set to the empty string "" to represent the default account. Passing any other string will result in an error |
| amounts | string (JSON object) | Yes | N/A | A JSON object with addresses and amounts where the address is the key and the amount in VRSCTEST is the value |
| minconf | numeric | No | 1 | Only use the balance confirmed at least this many times |
| comment | string | No | "" | A comment for record-keeping purposes |
| subtractfeefromamount | string (JSON array) | No | Empty array | A JSON array with addresses from which the fee will be equally deducted |

## Results
The command returns a string representing the transaction ID of the newly created transaction.

**Return Type**: String (transaction ID)

## Examples

### Example 1: Send two amounts to two different addresses

**Command:**
```
verus sendmany "" "{\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.01,\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.02}"
```

**Sample Output:**
```
cd82497a148cee3c8c5a9d5d5f5b1b5f5b1b5f5b1b5f5b1b5f5b1b5f5b1b5f5
```

### Example 2: Send with minimum confirmations and comment

**Command:**
```
verus sendmany "" "{\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.01,\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.02}" 6 "testing"
```

**Sample Output:**
```
ab82497a148cee3c8c5a9d5d5f5b1b5f5b1b5f5b1b5f5b1b5f5b1b5f5b1b5f5
```

### Example 3: Send with fee subtracted from specific addresses

**Command:**
```
verus sendmany "" "{\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.01,\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.02}" 1 "" "[\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\",\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\"]"
```

**Sample Output:**
```
db82497a148cee3c8c5a9d5d5f5b1b5f5b1b5f5b1b5f5b1b5f5b1b5f5b1b5f5
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendmany", "params": ["", "{\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.01,\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\":0.02}", 6, "testing"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Account:**
   ```
   error code: -8
   error message:
   Account specified with non-empty string but empty string is required
   ```

2. **Potential Error - Invalid JSON Format:**
   ```
   error code: -8
   error message:
   Invalid amounts JSON object
   ```

3. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid Verus address
   ```

4. **Potential Error - Invalid Amount:**
   ```
   error code: -3
   error message:
   Amount out of range
   ```

5. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

6. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Notes
Only one transaction is created regardless of the number of addresses specified. This means that either all payments succeed or all fail together. When using the `subtractfeefromamount` option, the fee is divided equally among the specified addresses, causing those recipients to receive less VRSCTEST than entered in their corresponding amount field.

## Related Commands
- `sendtoaddress`: Send an amount to a given address
- `sendfrom`: Send from a specific account to a Verus address
- `listunspent`: Returns array of unspent transaction outputs
- `createrawtransaction`: Create a transaction spending the given inputs