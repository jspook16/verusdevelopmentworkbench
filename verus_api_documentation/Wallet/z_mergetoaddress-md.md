# Verus RPC Command: z_mergetoaddress

## Purpose
The `z_mergetoaddress` command consolidates multiple UTXOs (Unspent Transaction Outputs) and notes into a single UTXO or note. This command is crucial for wallet optimization, reducing transaction fragmentation, lowering future transaction fees, improving privacy by consolidating multiple payment traces, and simplifying wallet management by reducing the number of distinct payment units. It provides an efficient solution for wallets that have accumulated many small UTXOs over time through mining, receiving numerous small payments, or extensive transaction activity.

## Description
When enabled and executed with the appropriate parameters, this command analyzes the wallet for available UTXOs and notes, selects those that match the specified criteria, and consolidates them into a single transaction that creates one new output at the destination address. The operation is executed asynchronously to prevent blocking of the user interface during potentially time-consuming operations involving many inputs. The command provides flexible input selection through special address identifiers ("ANY_TADDR", "ANY_SPROUT", "ANY_SAPLING") or specific addresses, allowing precise control over which funds to consolidate. It offers customizable parameters for transaction fee, input count limits for both transparent and shielded inputs, and support for memo fields when sending to shielded addresses. The command returns detailed information about the operation, including counts and values of UTXOs/notes being merged and those remaining, along with an operation ID for tracking the progress. This comprehensive functionality enables efficient wallet maintenance and optimization while providing transparency throughout the consolidation process.

**Command Type**: Action/Transaction  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet  
**Experimental Status**: This command is experimental and requires special activation flags

## Arguments
The command accepts six arguments, two required and four optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaddresses | array | Yes | N/A | A JSON array with addresses or special strings "ANY_TADDR", "ANY_SPROUT", or "ANY_SAPLING" |
| toaddress | string | Yes | N/A | The t-addr or zaddr to send the funds to |
| fee | numeric | No | 0.0001 | The fee amount to attach to this transaction |
| transparent_limit | numeric | No | 50 | Limit on the maximum number of UTXOs to merge |
| shielded_limit | numeric | No | 20/200 | Limit on the maximum number of notes to merge (20 for Sprout, 200 for Sapling) |
| memo | string | No | "" | Encoded as hex. When toaddress is a zaddr, this will be stored in the memo field of the new note |

## Results
The command returns an object with information about the merging operation and an operation ID for tracking.

**Return Type**: Object

## Examples

### Example 1: Merge Sapling notes and transparent UTXOs to a shielded address

**Command:**
```
verus z_mergetoaddress '["ANY_SAPLING", "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"]' ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf
```

**Sample Output:**
```
{
  "remainingUTXOs": 15,
  "remainingTransparentValue": 10.24540000,
  "remainingNotes": 0,
  "remainingShieldedValue": 0.00000000,
  "mergingUTXOs": 50,
  "mergingTransparentValue": 73.36092500,
  "mergingNotes": 5,
  "mergingShieldedValue": 38.42883700,
  "opid": "opid-5a3b3c45-d8f6-4f4d-8c9a-b0e1d3b5e6f7"
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_mergetoaddress", "params": [["ANY_SAPLING", "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"], "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Feature Not Enabled:**
   ```
   error code: -8
   error message:
   z_mergetoaddress is disabled. Run 'verusd -experimentalfeatures -zmergetoaddress' to enable it.
   ```

2. **Potential Error - Invalid From Address:**
   ```
   error code: -8
   error message:
   From address parameter must be a string or array of strings.
   ```

3. **Potential Error - Invalid To Address:**
   ```
   error code: -5
   error message:
   Invalid to address.
   ```

4. **Potential Error - Protocol Mixing:**
   ```
   error code: -4
   error message:
   Cannot merge from both Sprout and Sapling addresses using a single transaction.
   ```

5. **Potential Error - Protected Coinbase:**
   ```
   error code: -4
   error message:
   Could not find any funds to merge. Protected coinbase UTXOs can be merged by using z_shieldcoinbase.
   ```

## Notes
WARNING: z_mergetoaddress is disabled by default. To enable it, restart zcashd with the -experimentalfeatures and -zmergetoaddress commandline options, or add these two lines to the zcash.conf file: `experimentalfeatures=1` and `zmergetoaddress=1`. Protected coinbase UTXOs are ignored by this command; use `z_shieldcoinbase` to combine those into a single note. The number of UTXOs and notes selected for merging can be limited by the caller. The transparent_limit and shielded_limit parameters help manage transaction size constraints. Transaction size is limited to 100,000 bytes before Sapling, and 2,000,000 bytes after Sapling activation.

## Related Commands
- `z_shieldcoinbase`: Shield transparent coinbase funds to a shielded address
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_getoperationstatus`: Get operation status and associated result data
- `listunspent`: Returns array of unspent transaction outputs
- `z_listunspent`: Returns array of unspent shielded notes