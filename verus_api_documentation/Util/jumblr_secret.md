# Verus RPC Command: jumblr_secret

## Purpose
The `jumblr_secret` command is designed to designate a specific address as the final destination for funds that have undergone the Jumblr privacy process. This command is critical for completing the privacy enhancement cycle, providing users with a confidential destination address that cannot be linked to the original source of funds, thereby maintaining financial privacy within the Verus ecosystem.

## Description
The `jumblr_secret` command identifies an address to which anonymized funds will be sent after completing the Jumblr privacy process. Jumblr is an integrated privacy mechanism that processes funds through a series of transactions, obfuscating their origin before delivery to the designated secret address. When this command is executed, it establishes the final destination for the privacy pipeline, ensuring that funds emerging from the anonymization process are directed to an address with no traceable connection to the original deposit.

**Command Type**: Configuration/Write  
**Protocol Level**: Privacy Layer  
**Access Requirement**: Wallet with Jumblr enabled (`-jumblr` flag at startup)

## Arguments
The command accepts a single parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `secretaddress` | string | Yes | A valid Verus transparent address to which anonymized funds will be sent |

## Results
The command does not return a specific value on success. A successful execution configures the specified address as the destination for anonymized funds. If an error occurs, an appropriate error message is returned.

## Examples

### Example: Set a Jumblr Secret Destination Address

**Command:**
```
verus jumblr_secret "RNKiEBduBru6Siv1cZRVhp4fkZNyPska6z"
```

This example demonstrates:
- How to designate a specific transparent address as the final destination for anonymized funds
- Once set, this address will receive funds that have completed the Jumblr privacy process

## Potential Error Cases

1. **Potential Error - Invalid Address Format:**
   ```
   error code: -8
   error message:
   Invalid Verus address format
   ```

2. **Potential Error - Jumblr Not Enabled:**
   ```
   error code: -1
   error message:
   Jumblr is not enabled. Start with -jumblr parameter
   ```

3. **Potential Error - Non-Transparent Address:**
   ```
   error code: -8
   error message:
   Only transparent addresses are supported for Jumblr secret destinations
   ```

4. **Potential Error - Same as Deposit Address:**
   ```
   error code: -8
   error message:
   Secret address cannot be the same as deposit address
   ```

## Important Notes
- For maximum privacy, the secret address should be used exclusively for receiving anonymized funds and should not be used for other transactions that could reveal its connection to the user
- Best practices recommend creating a new address specifically for use as a secret destination
- The secret address does not need to be in the same wallet as the deposit address, and for enhanced privacy, it's often recommended to use an address from a different wallet
- Jumblr processes work in the background and may take time to complete, depending on network conditions and privacy parameters
- The Jumblr service requires both deposit and secret addresses to be configured before it can complete the anonymization process
- Regular transaction fees apply to all stages of the Jumblr anonymization process
