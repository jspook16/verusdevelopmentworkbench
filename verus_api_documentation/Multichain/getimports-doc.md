# Verus RPC Command: getimports

## Purpose
The `getimports` command returns all imports into a specific currency, optionally filtered by a specific block height range. This command is essential for tracking cross-chain transfers received from other chains within the Verus multi-chain ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for import operations)

## Description
The `getimports` command allows users to query all imports received by a specific chain within a given block height range. Imports in the Verus ecosystem are transactions that receive value from another chain, requiring confirmation on both chains to complete the transfer.

This command provides detailed information about these imports, including the transaction IDs, source chains, amounts, and other relevant details. It's a vital tool for monitoring cross-chain transfers and ensuring they are properly processed and confirmed on the receiving chain.

**Command Type**: Cross-Chain Operations  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `chainname` | string | Optional | Current chain | Name of the chain to look for imports on |
| `startheight` | integer | Optional | 0 | Start height for the query range |
| `endheight` | integer | Optional | 0 | End height for the query range (0 means current height) |

## Results
The command returns a JSON object with details about imports to the specified chain:

| Property | Type | Description |
|----------|------|-------------|
| `imports` | array | Array of import objects |
| » `txid` | string | Transaction ID of the import transaction |
| » `height` | integer | Block height at which this import was processed |
| » `value` | number | Total value of the import |
| » `source` | string | Source chain ID or name |
| » `sourceheight` | integer | Block height on the source chain where the export occurred |
| » `exports` | array | Array of individual exports included in this import |
| »» `txid` | string | Transaction ID of the export on the source chain |
| »» `txoutnum` | integer | Output number in the source transaction |
| »» `amount` | number | Amount transferred |
| »» `currency` | string | Currency of the transfer |
| »» `destination` | string | Destination address or identity |

## Examples

### Example 1: Get all imports to the current chain

**Command:**
```
verus getimports
```

**Potential Output:**
```json
{
  "imports": [
    {
      "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      "height": 500000,
      "value": 150.0,
      "source": "VRSC",
      "sourceheight": 1000000,
      "exports": [
        {
          "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
          "txoutnum": 1,
          "amount": 100.0,
          "currency": "VRSC",
          "destination": "RAbcDefGhiJklMnoPqrsTuvWxYz123456"
        },
        {
          "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
          "txoutnum": 2,
          "amount": 50.0,
          "currency": "VRSC",
          "destination": "R7abCdeFghIjkLmnOpQrStUvWxYz123456"
        }
      ]
    },
    {
      "txid": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1",
      "height": 500050,
      "value": 1000.0,
      "source": "VRSC",
      "sourceheight": 1000050,
      "exports": [
        {
          "txid": "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2",
          "txoutnum": 0,
          "amount": 1000.0,
          "currency": "MYTOKEN",
          "destination": "RXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ12345"
        }
      ]
    }
  ]
}
```

### Example 2: Get imports to a specific chain

**Command:**
```
verus getimports "MYCHAIN"
```

### Example 3: Get imports within a specific height range

**Command:**
```
verus getimports "MYCHAIN" 500000 501000
```

### Example 4: Using curl to get imports

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getimports", "params": ["chainname"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Import Process

In the Verus ecosystem, cross-chain transfers follow a specific process:

1. **Export Creation**: A transaction on the source chain creates an export to the destination chain
2. **Export Aggregation**: Multiple exports are aggregated into batches for efficiency
3. **Notarization**: The exports are included in a notarization to the destination chain
4. **Import Processing**: The destination chain processes the imports based on the notarized exports
5. **Finalization**: Once confirmed on both chains, the transfer is complete

The `getimports` command shows the imports that have been processed on the destination chain after being exported from source chains.

### Import Verification

Imports are verified through a combination of:

1. **Notarizations**: Official cross-chain verifications by notary nodes
2. **Transaction Proofs**: Cryptographic proofs of the export transactions
3. **Consensus Rules**: Protocol-level rules governing valid imports

This multi-layered verification ensures that only legitimate transfers are processed, preventing double-spending and other attacks.

### Cross-Chain Synchronization

Imports may not appear immediately after the corresponding exports are created due to:

1. **Block Confirmation Requirements**: Typically, exports need multiple confirmations
2. **Notarization Processing Time**: Notarizations occur at regular intervals
3. **Network Conditions**: Network latency or temporary disconnections

The `getimports` command helps track this synchronization process and identify any delays or issues.

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

1. **Cross-Chain Transfer Monitoring**: Track transfers received from other chains
2. **Import Verification**: Verify that imports have been processed correctly
3. **Transfer Reconciliation**: Match imports with corresponding exports for reconciliation
4. **Audit Trail**: Maintain a complete record of cross-chain transfers
5. **DeFi Applications**: Build applications that utilize cross-chain functionality

## Related Commands

- `getexports` - Get exports to other chains
- `getlastimportfrom` - Get the last import from a specific originating system
- `getpendingtransfers` - Get pending transfers that have not yet been aggregated into an export
- `getcurrency` - Get detailed information about a currency
- `getnotarizationdata` - Get notarization data for cross-chain verification

## References
For more detailed information on the export/import system in the Verus ecosystem, refer to the Verus documentation on cross-chain transfers, notarizations, and PBaaS operations.
