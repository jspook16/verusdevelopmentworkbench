# Verus RPC Command: fundrawtransaction

## Purpose
The `fundrawtransaction` command adds inputs to a transaction until it has enough value to meet its output requirements. This command bridges the gap between manual transaction construction and automated fund management, allowing users to create a transaction structure and then automatically fund it with appropriate inputs from the wallet. It's especially valuable for building complex transactions with specific output structures without needing to manually select and calculate inputs, change amounts, and fees.

## Description
When provided with a hex-encoded raw transaction that may have insufficient inputs or no inputs at all, this command automatically adds appropriate inputs from the wallet to cover the transaction's outputs plus the required fee. It also adds one change output to return excess funds to the wallet. This automation simplifies the process of creating valid transactions while still allowing complete control over the output structure.

The command is particularly useful in scenarios where the specific outputs are important (such as when creating transactions with OP_RETURN data, multi-output distributions, or specific payment patterns), but the source of funds is flexible. It represents a middle ground between completely manual transaction construction with `createrawtransaction` and fully automated transactions with `sendtoaddress` or similar commands.

Note that any inputs which were already signed in the provided transaction may need to be re-signed after completion, as the addition of inputs and the change output modifies the transaction structure. The newly added inputs will not be signed by this command - use `signrawtransaction` for that step.

**Command Type**: Action/Transaction  
**Protocol Level**: Transaction  
**Access Requirement**: Requires a wallet with sufficient funds

## Arguments
The command accepts four arguments, one required and three optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hexstring | string | Yes | N/A | The hex string of the raw transaction |
| objectarray | array | No | N/A | UTXOs to select from for funding |
| changeaddress | string | No | N/A | Address to send change to if there is any |
| explicitfee | numeric | No | N/A | Offer this instead of the default fee only when using UTXO list |

## Results
The command returns a JSON object containing the updated transaction information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| hex | string | The resulting raw transaction (hex-encoded string) |
| fee | numeric | The fee added to the transaction |
| changepos | numeric | The position of the added change output, or -1 |

## Examples

### Example 1: Fund a transaction with no inputs

**Command:**
```
verus fundrawtransaction "0100000000010a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac00000000"
```

**Sample Output:**
```json
{
  "hex": "01000000012d04a5a9af51c365459922e6a7be35c9c3d1a91af5a856dca2e13668d8364f0100000000ffffffff020a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac1eccd601000000001976a914d4c4cfd85a8b369fd04ee15acba64608d2f5548d88ac00000000",
  "fee": 0.00001000,
  "changepos": 2
}
```

### Example 2: Fund a transaction with a specific change address

**Command:**
```
verus fundrawtransaction "0100000000010a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac00000000" '[]' "RKeCJNSGcDcxanxHCZGRFKo5NbuGxT5Lw5"
```

**Sample Output:**
```json
{
  "hex": "01000000012d04a5a9af51c365459922e6a7be35c9c3d1a91af5a856dca2e13668d8364f0100000000ffffffff020a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac1eccd601000000001976a91471e9008a1c12bca3005cc8b5bc01a65cfec397dd88ac00000000",
  "fee": 0.00001000,
  "changepos": 2
}
```

### Example 3: Fund a transaction with specific UTXOs and an explicit fee

**Command:**
```
verus fundrawtransaction "0100000000010a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac00000000" '[{"txid":"8892b6c090b51a4eed7a61b72e9c8dbf5ed5bcd5aca6c6819b630acf2cb3fc87","voutnum":1}]' "RKeCJNSGcDcxanxHCZGRFKo5NbuGxT5Lw5" 0.00002000
```

**Sample Output:**
```json
{
  "hex": "0100000001873fcb2ccf0a639b81c6a6acd5bcd55ebf8d9c2eb7617aed4e1ab590c0b6928901000000ffffffff020a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac06ccd601000000001976a91471e9008a1c12bca3005cc8b5bc01a65cfec397dd88ac00000000",
  "fee": 0.00002000,
  "changepos": 2
}
```

### Example 4: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "fundrawtransaction", "params": ["0100000000010a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac00000000"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "hex": "01000000012d04a5a9af51c365459922e6a7be35c9c3d1a91af5a856dca2e13668d8364f0100000000ffffffff020a8c01000000000017a91415eb8ee35e8950d6ad17dfc8fa373e50092a3dca87e6c2d401000000001976a914ade1d3489b4a5a2048a32d7c0460eae9c43702a788ac1eccd601000000001976a914d4c4cfd85a8b369fd04ee15acba64608d2f5548d88ac00000000",
    "fee": 0.00001000,
    "changepos": 2
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction Format:**
   ```
   error code: -22
   error message:
   TX decode failed
   ```

2. **Potential Error - Invalid UTXO Array Format:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected array of objects
   ```

3. **Potential Error - Invalid Change Address:**
   ```
   error code: -5
   error message:
   Change address is invalid
   ```

4. **Potential Error - Insufficient Funds:**
   ```
   error code: -4
   error message:
   Insufficient funds
   ```

5. **Potential Error - Locked Wallet:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Related Commands
- `createrawtransaction`: Create a raw transaction spending given inputs
- `signrawtransaction`: Sign inputs for a raw transaction
- `sendrawtransaction`: Submit a raw transaction to the network
- `decoderawtransaction`: Return a JSON object representing the serialized transaction
