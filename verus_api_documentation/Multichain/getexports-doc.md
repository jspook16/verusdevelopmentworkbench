# Verus RPC Command: getexports

## Purpose
The `getexports` command returns pending export transfers to a specified currency from a start height to an end height. This command is crucial for tracking cross-chain transfers within the Verus multi-chain ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for export operations)

## Description
The `getexports` command allows users to query all pending exports to a specific chain within a given block height range. Exports in the Verus ecosystem are transactions that transfer value from one chain to another, requiring confirmation on both chains to complete the transfer.

This command provides detailed information about these pending exports, including the transaction IDs, transaction output numbers, partial transaction proofs, and transfer details. It's an essential tool for monitoring cross-chain transfers and ensuring they are properly processed and confirmed.

**Command Type**: Cross-Chain Operations  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `chainname` | string | Yes | | Name/ID of the currency to look for exports to |
| `heightstart` | integer | Optional | 0 | Only return exports at or above this height |
| `heightend` | integer | Optional | maxheight | Only return exports below or at this height |

## Results
The command returns an array of export objects, each with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `height` | integer | Block height at which this export was created |
| `txid` | string | Transaction ID of the export transaction |
| `txoutnum` | integer | Output number in the transaction that contains the export |
| `partialtransactionproof` | string | Hex-encoded proof of the transaction for verification |
| `transfers` | array | Array of transfer objects contained in this export |
| » `transfer` | object | Individual transfer details (currency, amount, destination, etc.) |

## Examples

### Example 1: Get all exports to a specific currency

**Command:**
```
verus getexports "MYCHAIN"
```

**Potential Output:**
```json
[
  {
    "height": 1000000,
    "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    "txoutnum": 1,
    "partialtransactionproof": "0400008085202f890221...",
    "transfers": [
      {
        "currency": "VRSC",
        "amount": 100.0,
        "destinationaddress": "RAbcDefGhiJklMnoPqrsTuvWxYz123456",
        "destinationsystemid": "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c",
        "fees": 0.0001
      },
      {
        "currency": "VRSC",
        "amount": 50.0,
        "destinationaddress": "R7abCdeFghIjkLmnOpQrStUvWxYz123456",
        "destinationsystemid": "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c",
        "fees": 0.0001
      }
    ]
  },
  {
    "height": 1000050,
    "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    "txoutnum": 0,
    "partialtransactionproof": "0400008085202f890221...",
    "transfers": [
      {
        "currency": "MYTOKEN",
        "amount": 1000.0,
        "destinationaddress": "RXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ12345",
        "destinationsystemid": "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c",
        "fees": 0.001
      }
    ]
  }
]
```

### Example 2: Get exports within a specific height range

**Command:**
```
verus getexports "MYCHAIN" 1000000 1001000
```

### Example 3: Get exports from a specific height onwards

**Command:**
```
verus getexports "MYCHAIN" 1500000
```

### Example 4: Using curl to get exports

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getexports", "params": ["chainname" 1000000 1001000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Export Process

In the Verus ecosystem, cross-chain transfers follow a specific process:

1. **Export Creation**: A transaction on the source chain creates an export to the destination chain
2. **Export Aggregation**: Multiple exports are aggregated into batches for efficiency
3. **Notarization**: The exports are included in a notarization to the destination chain
4. **Import Processing**: The destination chain processes the imports based on the notarized exports
5. **Finalization**: Once confirmed on both chains, the transfer is complete

The `getexports` command shows the exports created on the source chain that have not yet been fully processed on the destination chain.

### Transaction Proofs

The `partialtransactionproof` field contains a cryptographic proof that proves the existence and validity of the export transaction. This proof can be verified by other chains to ensure the export is legitimate without requiring access to the entire source blockchain.

### Transfer Details

For each export, the `transfers` array contains detailed information about the individual transfers included in the export:

1. **Currency**: The currency being transferred
2. **Amount**: The amount being transferred
3. **Destination**: The recipient address and system
4. **Fees**: Any fees associated with the transfer

## Potential Error Cases

1. **Chain Not Found:**
   ```
   error code: -5
   error message:
   Chain not found
   ```

2. **Invalid Height Range:**
   ```
   error code: -8
   error message:
   End height must be greater than or equal to start height
   ```

3. **Network Error:**
   ```
   error code: -1
   error message:
   Cannot connect to daemon
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Cross-Chain Transfer Monitoring**: Track transfers between chains in the Verus ecosystem
2. **Export Verification**: Verify that exports have been created correctly
3. **Import Troubleshooting**: Debug issues with imports by checking the corresponding exports
4. **Audit Trail**: Maintain a complete record of cross-chain transfers
5. **DeFi Applications**: Build applications that utilize cross-chain functionality

## Related Commands

- `getimports` - Get imports from other chains
- `getlastimportfrom` - Get the last import from a specific originating system
- `getpendingtransfers` - Get pending transfers that have not yet been aggregated into an export
- `getcurrency` - Get detailed information about a currency
- `getnotarizationdata` - Get notarization data for cross-chain verification

## References
For more detailed information on the export/import system in the Verus ecosystem, refer to the Verus documentation on cross-chain transfers, notarizations, and PBaaS operations.
