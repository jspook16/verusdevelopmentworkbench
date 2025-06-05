# Verus RPC Command: z_shieldcoinbase

## Purpose
The `z_shieldcoinbase` command transfers transparent coinbase funds (mining rewards) to a shielded z-address, enhancing privacy for mining proceeds. Although deprecated and unnecessary on Verus and standard PBAAS networks, this command was originally designed to enable miners to shield their mining rewards, obfuscate mining income sources, protect against targeted theft of known mining rewards, and implement enhanced privacy practices for newly minted coins. It provides a specialized transaction type optimized for the unique requirements of coinbase outputs.

## Description
When executed with the appropriate parameters, this command identifies coinbase UTXOs (special transaction outputs created by mining) in the wallet and transfers them to a specified shielded address. The process is executed asynchronously to prevent blocking the user interface during potentially time-consuming operations. The command offers customizable parameters, including transaction fee and a limit on the number of coinbase UTXOs to process in a single transaction. This operation is particularly important in the original Zcash implementation where coinbase UTXOs had unique restrictions and could not be directly included in standard private transactions. Selected UTXOs are temporarily locked during processing to prevent double-spending attempts, and the status of these locks can be viewed using the `listlockunspent` command. Upon completion, the command provides detailed information about the operation, including the number and value of coinbase UTXOs processed and those remaining, along with an operation ID for tracking progress. While deprecated in Verus due to protocol improvements, this command remains a part of the API for compatibility and specialized usage scenarios.

**Command Type**: Action/Transaction  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet  
**Deprecated Status**: This command is deprecated and unnecessary on Verus networks

## Arguments
The command accepts four arguments, two required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaddress | string | Yes | N/A | The address is a taddr or "*" for all taddrs belonging to the wallet |
| toaddress | string | Yes | N/A | The address is a zaddr |
| fee | numeric | No | 0.0001 | The fee amount to attach to this transaction |
| limit | numeric | No | 50 | Limit on the maximum number of utxos to shield |

## Results
The command returns an object with information about the shielding operation and an operation ID for tracking.

**Return Type**: Object

## Examples

### Example 1: Shield coinbase UTXOs from a specific address to a shielded address

**Command:**
```
verus z_shieldcoinbase "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV" "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf"
```

**Sample Output:**
```
{
  "remainingUTXOs": 10,
  "remainingValue": 25.75000000,
  "shieldingUTXOs": 20,
  "shieldingValue": 50.00000000,
  "opid": "opid-7a9ef0f4-d518-504d-b8a6-g9d7e8c66b00"
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_shieldcoinbase", "params": ["RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV", "ztfaW34Gj9FrnGUEf833ywDVL62NWXBM81u6EQnM6VR45eYnXhwztecW1SjxA7JrmAXKJhxhj3vDNEpVCQoSvVoSpmbhtjf"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid From Address:**
   ```
   error code: -8
   error message:
   Invalid from address
   ```

2. **Potential Error - Invalid To Address:**
   ```
   error code: -5
   error message:
   Invalid to address
   ```

3. **Potential Error - Invalid Fee:**
   ```
   error code: -3
   error message:
   Amount out of range
   ```

4. **Potential Error - No Coinbase UTXOs:**
   ```
   error code: -6
   error message:
   No unspent coinbase UTXOs found for address
   ```

5. **Potential Error - UTXO Lock Error:**
   ```
   error code: -4
   error message:
   Error locking unspent coinbase outputs
   ```

## Notes
THIS API IS DEPRECATED AND NON NECESSARY TO USE ON VERUS OR STANDARD PBAAS NETWORKS. The `z_shieldcoinbase` command is specifically designed for transferring coinbase UTXOs (mining rewards) to a shielded address. Selected UTXOs are temporarily locked during processing, and these locks can be viewed or managed using the `listlockunspent` and `lockunspent` commands. The limit parameter controls how many UTXOs are processed in a single transaction. If set to zero, and Overwinter is not yet active, the `-mempooltxinputlimit` option determines the number of UTXOs processed. After Overwinter activation, a zero limit allows as many UTXOs as will fit within transaction size constraints (100,000 bytes before Sapling, 2,000,000 bytes after Sapling activation).

## Related Commands
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_mergetoaddress`: Merge multiple UTXOs and notes into a single UTXO or note
- `z_getoperationstatus`: Get operation status and any associated result or error data
- `listlockunspent`: Returns list of temporarily unspendable outputs
- `lockunspent`: Updates list of temporarily unspendable outputs