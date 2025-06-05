# Verus RPC Command: move

## Purpose
The `move` command, while deprecated, provides functionality to transfer funds between accounts within the same wallet. This command enables internal bookkeeping and fund management without creating actual blockchain transactions, facilitating organization of funds into logical categories, allocation of wallet balances to different purposes or projects, and maintenance of separate accounting records while keeping all funds under a single wallet's control.

## Description
When executed with the appropriate parameters, this command moves a specified amount of VRSCTEST from one account to another within the same wallet. Unlike transactions that appear on the blockchain, these moves are purely internal to the wallet database and do not incur transaction fees or require confirmation from the network. They are recorded immediately and do not change the total wallet balance or create any on-chain activity. This mechanism provides a lightweight way to track fund allocations across different logical buckets within a single wallet, which can be useful for personal accounting, budget management, or tracking funds earmarked for different purposes. The command supports specifying a minimum confirmation threshold for the source funds and allows attaching optional comments for record-keeping purposes.

**Command Type**: Management/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet  
**Deprecated Status**: This command is deprecated and may be removed in future versions of Verus.

## Arguments
The command accepts five arguments, three required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaccount | string | Yes | N/A | MUST be set to the empty string "" to represent the default account. Passing any other string will result in an error |
| toaccount | string | Yes | N/A | MUST be set to the empty string "" to represent the default account. Passing any other string will result in an error |
| amount | numeric | Yes | N/A | Quantity of VRSCTEST to move between accounts |
| minconf | numeric | No | 1 | Only use funds with at least this many confirmations |
| comment | string | No | "" | An optional comment, stored in the wallet only |

## Results
The command returns a boolean value indicating whether the move was successful.

**Return Type**: Boolean

## Examples

### Example 1: Move 0.01 VRSCTEST from the default account to the account named tabby

**Command:**
```
verus move "" "tabby" 0.01
```

**Sample Output:**
```
true
```

### Example 2: Move 0.01 VRSCTEST from timotei to akiko with a comment and 6 confirmations

**Command:**
```
verus move "timotei" "akiko" 0.01 6 "happy birthday!"
```

**Sample Output:**
```
true
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "move", "params": ["timotei", "akiko", 0.01, 6, "happy birthday!"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Account:**
   ```
   error code: -8
   error message:
   Account specified with non-empty string but empty string is required
   ```

2. **Potential Error - Invalid Amount:**
   ```
   error code: -3
   error message:
   Amount out of range
   ```

3. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf parameter, must be a non-negative integer
   ```

4. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

5. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
This command is deprecated and maintained only for backward compatibility. The account system is being phased out in newer versions of the Verus wallet. Move operations do not create actual blockchain transactions and are not visible to external observers. They are merely bookkeeping entries within the wallet's database. Despite the parameter requirements in the RPC documentation, attempting to use account names other than empty strings may result in errors, as the account system's deprecation has led to restrictions on account usage.

## Related Commands
- `getbalance`: Get the balance in the wallet or in a specific account
- `listaccounts`: Returns Object that has account names as keys, account balances as values
- `sendfrom`: Send from a specific account to a Verus address (creates an actual blockchain transaction)
- `sendtoaddress`: Send an amount to a given address (creates an actual blockchain transaction)
- `getaccount`: Returns the account associated with the given address