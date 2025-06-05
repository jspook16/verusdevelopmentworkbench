# Verus RPC Command: sendfrom

## Purpose
The `sendfrom` command, while deprecated in favor of `sendtoaddress`, enables sending funds from a specific account within the wallet to a designated Verus address. This command is useful for maintaining separate accounting within a single wallet and for attributing outbound transactions to specific internal accounts, which can help with transaction tracking and financial record keeping.

## Description
When executed with the appropriate parameters, this command transfers a specified amount of VRSCTEST (the test network token) from a designated account in the user's wallet to a specified Verus address. Although account functionality is deprecated in newer wallet versions, this command maintains backward compatibility for systems that rely on account-based wallet management. The command allows specifying the minimum confirmation requirement for the input funds and enables the user to attach comments for internal record-keeping purposes. Upon successful execution, it returns the transaction ID of the newly created transaction.

**Command Type**: Action/Transaction  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet  
**Deprecated Status**: This command is deprecated and may be removed in future versions. It is recommended to use `sendtoaddress` instead.

## Arguments
The command accepts six arguments, two required and four optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaccount | string | Yes | N/A | MUST be set to the empty string "" to represent the default account. Passing any other string will result in an error |
| toVRSCTESTaddress | string | Yes | N/A | The VRSCTEST address to send funds to |
| amount | numeric | Yes | N/A | The amount in VRSCTEST (transaction fee is added on top) |
| minconf | numeric | No | 1 | Only use funds with at least this many confirmations |
| comment | string | No | "" | A comment used to store what the transaction is for. This is not part of the transaction, just kept in your wallet |
| comment-to | string | No | "" | An optional comment to store the name of the person or organization to which you're sending the transaction. This is not part of the transaction, it is just kept in your wallet |

## Results
The command returns a string representing the transaction ID of the newly created transaction.

**Return Type**: String (transaction ID)

## Examples

### Example 1: Send 0.01 VRSCTEST from the default account to an address

**Command:**
```
verus sendfrom "" "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.01
```

**Sample Output:**
```
7d9f3f44db56f0427d7dab4366b7a8ea4b5d904d5c7c7b2e71742c760e8b86df
```

### Example 2: Send 0.01 from a specific account with minimum confirmations and comments

**Command:**
```
verus sendfrom "tabby" "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" 0.01 6 "donation" "seans outpost"
```

**Sample Output:**
```
d64bcf2f81f815c3d543af1d574d7778abd7ae8eca89a4d3f0a6e8cac337e9ab
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendfrom", "params": ["tabby", "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", 0.01, 6, "donation", "seans outpost"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Account:**
   ```
   error code: -8
   error message:
   Account specified with non-empty string but empty string is required
   ```

2. **Potential Error - Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid Verus address
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
   Insufficient funds
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Notes
This command is deprecated and maintained only for backward compatibility. New implementations should use `sendtoaddress` instead. The account system is also deprecated and will be removed in future versions of the Verus wallet.

## Related Commands
- `sendtoaddress`: Send an amount to a given address (recommended alternative)
- `sendmany`: Send multiple times to multiple addresses
- `getbalance`: Get the balance in the wallet or in a specific account
- `move`: Move funds between accounts within the same wallet