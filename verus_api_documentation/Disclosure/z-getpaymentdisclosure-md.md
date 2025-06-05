# Verus RPC Command: z_getpaymentdisclosure

## Purpose
The `z_getpaymentdisclosure` command generates a payment disclosure for a given joinsplit output. This feature allows users to create cryptographic proofs that they made a payment, which can be validated by third parties without compromising privacy.

## Daemon Requirements
- The daemon must be started with the `-experimentalfeatures=1` parameter
- The daemon must be started with the `-paymentdisclosure=1` parameter

## Description
This experimental command creates a payment disclosure proof for a specific joinsplit output in a transaction. Payment disclosures allow the sender of a shielded transaction to reveal information about a specific payment to a third party, without revealing other information about the transaction or compromising the privacy of the sender's other transactions.

**Command Type**: Action/Create  
**Protocol Level**: Privacy/Shielded Transactions  
**Access Requirement**: Requires special daemon configuration

## Arguments
The command accepts four arguments, three required and one optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The transaction ID containing the joinsplit output |
| js_index | string | Yes | N/A | The joinsplit index within the transaction |
| output_index | string | Yes | N/A | The output index within the joinsplit |
| message | string | No | N/A | An optional message to include in the disclosure |

## Results
The command returns a string containing the payment disclosure data with a "zpd:" prefix.

**Return Type**: String

## Examples

### Example 1: Generate a payment disclosure with a message

**Command:**
```
verus z_getpaymentdisclosure 96f12882450429324d5f3b48630e3168220e49ab7b0f066e5c2935a6b88bb0f2 0 0 "refund"
```

**Sample Output:**
```
zpd:706462ff004c561a0447ba2ec51184e6c204e6cf9189fcab94e370861d8c8224f84c62f52f78a4613f355b562b140d7b437a0128d25a1c9afe8589ec2f3c57cee1af0f25b2d6f9930a309d3b44358d41c0f1cc95b6a70a28651f9c2cf70e01f8
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_getpaymentdisclosure", "params": ["96f12882450429324d5f3b48630e3168220e49ab7b0f066e5c2935a6b88bb0f2", 0, 0, "refund"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": "zpd:706462ff004c561a0447ba2ec51184e6c204e6cf9189fcab94e370861d8c8224f84c62f52f78a4613f355b562b140d7b437a0128d25a1c9afe8589ec2f3c57cee1af0f25b2d6f9930a309d3b44358d41c0f1cc95b6a70a28651f9c2cf70e01f8",
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Feature Disabled:**
   ```
   error code: -1
   error message:
   WARNING: z_getpaymentdisclosure is disabled. To enable it, restart zcashd with the -experimentalfeatures and -paymentdisclosure commandline options, or add these two lines to the zcash.conf file: experimentalfeatures=1 paymentdisclosure=1
   ```

2. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   Invalid txid
   ```

3. **Potential Error - Invalid JoinSplit Index:**
   ```
   error code: -8
   error message:
   Invalid js_index
   ```

4. **Potential Error - Invalid Output Index:**
   ```
   error code: -8
   error message:
   Invalid output_index
   ```

5. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not found
   ```

6. **Potential Error - Not a Shielded Transaction:**
   ```
   error code: -5
   error message:
   Transaction does not contain any joinsplit outputs
   ```

## Related Commands
- `z_validatepaymentdisclosure`: Validates a payment disclosure
- `z_sendmany`: Send multiple amounts to multiple zaddresses
- `z_listreceivedbyaddress`: List amounts received by a zaddr
- `z_viewtransaction`: Get detailed shielded information about in-wallet transaction
