# Verus RPC Command: getpendingtransfers

## Purpose
The `getpendingtransfers` command returns all pending transfers for a particular chain that have not yet been aggregated into an export. This command is important for monitoring the status of cross-chain transfers in the early stages of the export/import process.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for transfer tracking)

## Description
The `getpendingtransfers` command allows users to query all pending transfers destined for a specific chain that have been initiated but not yet aggregated into an export transaction. In the Verus multi-chain ecosystem, cross-chain transfers go through several stages before completion, and this command focuses on the initial stage where transfers have been created but not yet batched for efficiency.

This information is valuable for monitoring the progress of cross-chain transfers, identifying any potential delays in the aggregation process, and verifying that transfers are being properly processed. The command returns detailed information about each pending transfer, including the transaction IDs, amounts, destinations, and other relevant details.

**Command Type**: Cross-Chain Operations  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single optional parameter:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `chainname` | string | Optional | Current chain | Name of the chain to look for pending transfers for |

## Results
The command returns a JSON object with details about pending transfers to the specified chain:

| Property | Type | Description |
|----------|------|-------------|
| `transfers` | array | Array of pending transfer objects |
| » `txid` | string | Transaction ID that created the transfer |
| » `vout` | integer | Output index in the transaction |
| » `amount` | number | Amount being transferred |
| » `currency` | string | Currency of the transfer |
| » `flags` | integer | Flags associated with the transfer |
| » `destination` | string | Destination address or identity |
| » `destinationsystemid` | string | System ID of the destination chain |
| » `destinationcurrencyid` | string | Currency ID on the destination chain |
| » `exportto` | string | Chain to export to |
| » `fees` | number | Fees associated with the transfer |
| » `priority` | integer | Priority of the transfer for aggregation |

## Examples

### Example 1: Get pending transfers for the current chain

**Command:**
```
verus getpendingtransfers
```

**Potential Output:**
```json
{
  "transfers": [
    {
      "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      "vout": 1,
      "amount": 100.0,
      "currency": "VRSC",
      "flags": 1,
      "destination": "RAbcDefGhiJklMnoPqrsTuvWxYz123456",
      "destinationsystemid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
      "destinationcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "exportto": "MYCHAIN",
      "fees": 0.0001,
      "priority": 0
    },
    {
      "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      "vout": 0,
      "amount": 50.0,
      "currency": "VRSC",
      "flags": 1,
      "destination": "R7abCdeFghIjkLmnOpQrStUvWxYz123456",
      "destinationsystemid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
      "destinationcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "exportto": "MYCHAIN",
      "fees": 0.0001,
      "priority": 0
    }
  ]
}
```

### Example 2: Get pending transfers for a specific chain

**Command:**
```
verus getpendingtransfers "MYCHAIN"
```

### Example 3: Using curl to get pending transfers

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getpendingtransfers", "params": ["chainname"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Transfer Process

In the Verus ecosystem, cross-chain transfers follow a multi-stage process:

1. **Transfer Creation**: A transaction creates a transfer to another chain
2. **Pending Phase**: The transfer enters a pending state, waiting for aggregation
3. **Aggregation**: Multiple pending transfers are batched into an export for efficiency
4. **Export**: The aggregated transfers are included in an export transaction
5. **Notarization**: The export is included in a notarization to the destination chain
6. **Import Processing**: The destination chain processes the imports

The `getpendingtransfers` command focuses on the second stage (Pending Phase) of this process.

### Transfer Flags

The `flags` field in a transfer contains bitflags that indicate various properties:

| Flag Value | Description |
|------------|-------------|
| 0x01 | TRANSFER_CROSSCHAIN - Transfer is destined for another chain |
| 0x02 | TRANSFER_CONVERT - Transfer should be converted to another currency |
| 0x04 | TRANSFER_IDENTITY - Transfer is to an identity rather than an address |
| 0x08 | TRANSFER_RESERVE - Transfer is from/to reserve currency |

### Aggregation Process

Pending transfers are aggregated into exports based on several factors:

1. **Destination Chain**: Transfers to the same chain are batched together
2. **Priority**: Higher priority transfers may be aggregated sooner
3. **Size Limits**: Exports have size limits for efficiency
4. **Time Thresholds**: Transfers may be aggregated after a certain time period

The aggregation process helps reduce the overhead of cross-chain transfers by batching multiple transfers into single export transactions.

## Potential Error Cases

1. **Chain Not Found:**
   ```
   error code: -5
   error message:
   Chain not found
   ```

2. **Network Error:**
   ```
   error code: -1
   error message:
   Cannot connect to daemon
   ```

3. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Transfer Monitoring**: Track the status of cross-chain transfers in the early stages
2. **Aggregation Analysis**: Monitor the aggregation process for efficiency
3. **Troubleshooting**: Identify transfers that may be stuck in the pending state
4. **Audit Trail**: Maintain a complete record of cross-chain transfers
5. **Delay Detection**: Detect unusual delays in the transfer process

## Related Commands

- `getexports` - Get exports to other chains
- `getimports` - Get imports from other chains
- `getlastimportfrom` - Get the last import from a specific originating system
- `sendcurrency` - Create transfers to other chains
- `getcurrency` - Get detailed information about a currency

## References
For more detailed information on the transfer and export/import system in the Verus ecosystem, refer to the Verus documentation on cross-chain transfers, PBaaS, and the multi-chain architecture.
