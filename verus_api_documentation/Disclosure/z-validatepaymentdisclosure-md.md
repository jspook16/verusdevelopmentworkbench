# Verus RPC Command: z_validatepaymentdisclosure

## Purpose
The `z_validatepaymentdisclosure` command validates a payment disclosure that was generated with the `z_getpaymentdisclosure` command. This feature allows third parties to verify payment proofs without compromising privacy.

## Daemon Requirements
- The daemon must be started with the `-experimentalfeatures=1` parameter
- The daemon must be started with the `-paymentdisclosure=1` parameter

## Description
This experimental command validates a payment disclosure proof that was previously generated using the `z_getpaymentdisclosure` command. Payment disclosure validation allows recipients or third parties to verify that a specific shielded payment was made, without requiring access to the sender's private data or compromising the privacy of other transactions.

**Command Type**: Query/Verify  
**Protocol Level**: Privacy/Shielded Transactions  
**Access Requirement**: Requires special daemon configuration

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| paymentdisclosure | string | Yes | N/A | Hex data string with "zpd:" prefix, representing the payment disclosure to validate |

## Results
The command returns information about the validated payment disclosure. The exact format and contents of the returned data are not specified in the limited documentation.

**Return Type**: Unspecified (likely Object)

## Examples

### Example 1: Validate a payment disclosure

**Command:**
```
verus z_validatepaymentdisclosure "zpd:706462ff004c561a0447ba2ec51184e6c204e6cf9189fcab94e370861d8c8224f84c62f52f78a4613f355b562b140d7b437a0128d25a1c9afe8589ec2f3c57cee1af0f25b2d6f9930a309d3b44358d41c0f1cc95b6a70a28651f9c2cf70e01f8"
```

**Expected Output Format:**
The output format is not specified in the available documentation, but would likely include verification status and details about the payment if validation is successful.

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_validatepaymentdisclosure", "params": ["zpd:706462ff004c561a0447ba2ec51184e6c204e6cf9189fcab94e370861d8c8224f84c62f52f78a4613f355b562b140d7b437a0128d25a1c9afe8589ec2f3c57cee1af0f25b2d6f9930a309d3b44358d41c0f1cc95b6a70a28651f9c2cf70e01f8"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    // Validation results and payment details
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Feature Disabled:**
   ```
   error code: -1
   error message:
   WARNING: z_validatepaymentdisclosure is disabled. To enable it, restart zcashd with the -experimentalfeatures and -paymentdisclosure commandline options, or add these two lines to the zcash.conf file: experimentalfeatures=1 paymentdisclosure=1
   ```

2. **Potential Error - Invalid Payment Disclosure Format:**
   ```
   error code: -8
   error message:
   Payment disclosure string must begin with 'zpd:'
   ```

3. **Potential Error - Malformed Payment Disclosure:**
   ```
   error code: -5
   error message:
   Invalid payment disclosure format
   ```

4. **Potential Error - Invalid Signature:**
   ```
   error code: -5
   error message:
   Payment disclosure signature verification failed
   ```

5. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not found in blockchain
   ```

6. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `z_getpaymentdisclosure`: Generate a payment disclosure for a given joinsplit output
- `z_sendmany`: Send multiple amounts to multiple zaddresses
- `z_listreceivedbyaddress`: List amounts received by a zaddr
- `z_viewtransaction`: Get detailed shielded information about in-wallet transaction
