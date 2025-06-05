# Verus RPC Command: sendtoaddress

## Purpose
The `sendtoaddress` command is a fundamental wallet operation that sends a specified amount of VRSCTEST (the test network token) to a designated Verus address. This command represents the most direct and commonly used method for transferring funds from a wallet to any valid Verus address on the network. It simplifies the process of creating, signing, and broadcasting a transaction, handling all these operations automatically with a single command call.

## Description
When executed with the appropriate parameters, this command constructs a transaction that transfers the specified amount of VRSCTEST from the wallet to the designated recipient address. The command automatically selects appropriate inputs (UTXOs) from the wallet, calculates the necessary fees based on the current network conditions, creates change outputs if needed, signs the transaction with the appropriate private keys, and broadcasts it to the network. The command supports attaching comments for internal record-keeping and allows the user to specify whether the transaction fee should be deducted from the amount being sent or taken separately from the wallet. This robust functionality makes it the preferred method for sending funds in most scenarios.

**Command Type**: Action/Transaction  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts five arguments, two required and three optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| VRSCTEST_address | string | Yes | N/A | The VRSCTEST address to send to |
| amount | numeric | Yes | N/A | The amount in VRSCTEST to send (e.g., 0.1) |
| comment | string | No | "" | A comment used to store what the transaction is for. This is not part of the transaction, just kept in your wallet |
| comment-to | string | No | "" | A comment to store the name of the person or organization to which you're sending the transaction. This is not part of the transaction, just kept in your wallet |
| subtractfeefromamount | boolean | No | false | The fee will be deducted from the amount being sent. The recipient will receive less VRSCTEST than entered in the amount field |

## Results
The command returns a string representing the transaction ID of the newly created transaction.

**Return Type**: String (transaction ID)

## Examples

### Example 1: Send 0.1 VRSCTEST to an address

**Command:**
```
verus sendtoaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.1
```

**Sample Output:**
```
a2a3b83acbc2e18095f7690915c6d8e6c3ae8c098e83a20c6d677cd7d6e72931
```

### Example 2: Send 0.1 VRSCTEST with comments

**Command:**
```
verus sendtoaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.1 "donation" "seans outpost"
```

**Sample Output:**
```
b2a3b83acbc2e18095f7690915c6d8e6c3ae8c098e83a20c6d677cd7d6e72932
```

### Example 3: Send 0.1 VRSCTEST with fees subtracted from the amount

**Command:**
```
verus sendtoaddress "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.1 "" "" true
```

**Sample Output:**
```
c2a3b83acbc2e18095f7690915c6d8e6c3ae8c098e83a20c6d677cd7d6e72933
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendtoaddress", "params": ["RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", 0.1, "donation", "seans outpost"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid Verus address
   ```

2. **Potential Error - Invalid Amount:**
   ```
   error code: -3
   error message:
   Amount out of range
   ```

3. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

5. **Potential Error - Transaction Creation Failed:**
   ```
   error code: -4
   error message:
   Error: Transaction creation failed
   ```

## Notes
When using the `subtractfeefromamount` option, the recipient will receive less VRSCTEST than specified in the amount parameter, as the transaction fee will be deducted from that amount instead of being paid from the sender's additional funds. The actual amount received will depend on the current network fee rates.

## Related Commands
- `sendfrom`: Send from a specific account to a Verus address (deprecated)
- `sendmany`: Send multiple times to multiple addresses
- `listunspent`: Returns array of unspent transaction outputs
- `gettransaction`: Get detailed information about a transaction