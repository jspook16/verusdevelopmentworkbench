# Verus RPC Command: getlastimportfrom

## Purpose
The `getlastimportfrom` command returns information about the last import received from a specific originating system, as well as the last confirmed notarization of that system on the current chain. This command is crucial for monitoring cross-chain synchronization and verifying the most recent cross-chain transfers.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for cross-chain import operations)

## Description
The `getlastimportfrom` command allows users to query the most recent import received from a specified blockchain or system. In the Verus multi-chain ecosystem, imports represent value transfers from one chain to another. By identifying the last import, users can verify that cross-chain synchronization is functioning properly and determine if any expected transfers are pending.

The command also returns information about the last confirmed notarization of the specified system. Notarizations are cross-chain validations that confirm the state of one chain on another, and they serve as the foundation for secure cross-chain transfers.

**Command Type**: Cross-Chain Operations  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single optional parameter:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `systemname` | string | Optional | | Name or ID of the system to retrieve the last import from |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `lastimport` | object | Last import from the indicated system on this chain |
| » `txid` | string | Transaction ID of the import transaction |
| » `height` | integer | Block height at which this import was processed |
| » `timestamp` | integer | Unix timestamp when the import was processed |
| » `value` | number | Total value of the import |
| » `source` | string | Source chain ID or name |
| » `sourceheight` | integer | Block height on the source chain where the export occurred |
| » `sourcesystemid` | string | System ID of the source chain |
| `lastconfirmednotarization` | object | Last confirmed notarization of the indicated system on this chain |
| » `txid` | string | Transaction ID of the notarization transaction |
| » `height` | integer | Block height at which this notarization was confirmed |
| » `timestamp` | integer | Unix timestamp when the notarization was confirmed |
| » `notarizedsystemid` | string | System ID that was notarized |
| » `notarizedheight` | integer | Height of the notarized chain that was notarized |
| » `notarizedhash` | string | Block hash of the notarized chain at that height |
| » `notaryaddresses` | array | Addresses of the notaries that confirmed this notarization |

## Examples

### Example 1: Get the last import from a specific system

**Command:**
```
verus getlastimportfrom "VRSC"
```

**Potential Output:**
```json
{
  "lastimport": {
    "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    "height": 500000,
    "timestamp": 1620000000,
    "value": 150.0,
    "source": "VRSC",
    "sourceheight": 1000000,
    "sourcesystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"
  },
  "lastconfirmednotarization": {
    "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    "height": 500050,
    "timestamp": 1620010000,
    "notarizedsystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "notarizedheight": 1000100,
    "notarizedhash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "notaryaddresses": [
      "RAbcDefGhiJklMnoPqrsTuvWxYz123456",
      "R7abCdeFghIjkLmnOpQrStUvWxYz123456",
      "RXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ12345"
    ]
  }
}
```

### Example 2: Get the last import from a system using its ID

**Command:**
```
verus getlastimportfrom "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"
```

### Example 3: Using curl to get the last import

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getlastimportfrom", "params": ["systemname"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Cross-Chain Synchronization

In the Verus ecosystem, chains synchronize with each other through a combination of:

1. **Notarizations**: Official cross-chain validations of block headers and state
2. **Imports/Exports**: Value transfers between chains
3. **Proof Verification**: Cryptographic verification of cross-chain claims

The `getlastimportfrom` command provides information about two crucial aspects of this synchronization: the last import and the last notarization.

### Notarization Process

Notarizations are essential for cross-chain security and typically involve:

1. **Block Header Validation**: Verification of block headers from one chain on another
2. **Signature Aggregation**: Multiple notaries sign to confirm the validation
3. **Consensus Confirmation**: The notarization is confirmed through consensus on the target chain
4. **State Synchronization**: The state of one chain is synchronized with another

The `lastconfirmednotarization` field provides details about the most recent successful notarization, including which block was notarized and which notaries confirmed it.

### Import Verification

Imports are processed based on notarizations and typically require:

1. **Export Verification**: Confirmation that the export occurred on the source chain
2. **Notarization Verification**: Confirmation that the export has been notarized
3. **Import Processing**: Processing of the import on the destination chain

The `lastimport` field provides details about the most recent import that has completed this process.

## Potential Error Cases

1. **System Not Found:**
   ```
   error code: -5
   error message:
   System not found
   ```

2. **No Imports Found:**
   ```
   error code: 0
   error message:
   No imports found from the specified system
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

1. **Cross-Chain Synchronization Monitoring**: Verify that chains are properly synchronized
2. **Import Verification**: Confirm that expected imports have been processed
3. **Notarization Monitoring**: Track the most recent notarizations between chains
4. **Troubleshooting**: Identify issues with cross-chain transfers
5. **Security Verification**: Ensure that cross-chain operations are secure and up-to-date

## Related Commands

- `getimports` - Get all imports from other chains
- `getexports` - Get exports to other chains
- `getnotarizationdata` - Get detailed notarization data
- `getnotarizationproofs` - Get proofs for notarizations
- `getcurrency` - Get detailed information about a currency

## References
For more detailed information on the notarization and import/export system in the Verus ecosystem, refer to the Verus documentation on cross-chain operations, PBaaS, and notarizations.
