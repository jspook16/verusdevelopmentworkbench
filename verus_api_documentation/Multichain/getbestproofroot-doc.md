# Verus RPC Command: getbestproofroot

## Purpose
The `getbestproofroot` command is used to determine and return the index of the best (most recent, valid, qualified) proof root in a list of proof roots, as well as the most recent valid proof root. This command is crucial for the cross-chain verification and notarization systems within the Verus multi-chain ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index
  - `-insightexplorer` - Enable additional blockchain data querying capabilities

## Description
The `getbestproofroot` command evaluates a provided list of proof roots to determine which is the most current and valid. Proof roots are essential components of the Verus cross-chain verification system, allowing one chain to verify the state of another chain securely. This command helps in establishing which proof root should be trusted among a set of candidates, based on various validation criteria.

In Verus's multi-chain ecosystem, chains need to reliably verify the state of other chains for cross-chain transactions, imports, exports, and notarizations. The `getbestproofroot` command aids in this verification process by identifying the most trustworthy proof root based on height, power (combined work and stake), and other validation rules.

**Command Type**: Cross-Chain Verification  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts a JSON object with the following structure:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proofroots` | array | Required (may be empty) | Ordered array of proof roots, indexed on return |
| » `version` | integer | Required | Version of this proof root data structure |
| » `type` | integer | Required | Type of proof root (chain or system specific) |
| » `systemid` | string | Required | System the proof root is for (hex string) |
| » `height` | integer | Required | Height of this proof root |
| » `stateroot` | string | Required | Merkle or merkle-style tree root for the specified block/sequence (hex string) |
| » `blockhash` | string | Required | Hash identifier for the specified block/sequence (hex string) |
| » `power` | string | Required | Work, stake, or combination of the two for most-work/most-power rule (hex string) |
| `currencies` | array | Optional | Currencies to query for currency states |
| `lastconfirmed` | integer | Required | Index into the proof root array indicating the last confirmed root |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `bestindex` | integer | Index of best proof root not confirmed that is provided, confirmed index, or -1 |
| `latestproofroot` | object | Latest valid proof root of chain |
| `laststableproofroot` | object | Either tip-BLOCK_MATURITY or last notarized/witnessed tip |
| `lastconfirmedproofroot` | object | Last proof root of chain that has been confirmed |
| `currencystates` | object | Currency states of target currency and published bridges |

## Examples

### Example 1: Get the best proof root from a list of candidates

**Command:**
```
verus getbestproofroot '{"proofroots":[{"version":1,"type":1,"systemid":"hexstring","height":100,"stateroot":"hexstring","blockhash":"hexstring","power":"hexstring"},{"version":1,"type":1,"systemid":"hexstring","height":101,"stateroot":"hexstring","blockhash":"hexstring","power":"hexstring"}],"lastconfirmed":0}'
```

**Potential Output:**
```json
{
  "bestindex": 1,
  "latestproofroot": {
    "version": 1,
    "type": 1,
    "systemid": "hexstring",
    "height": 101,
    "stateroot": "hexstring",
    "blockhash": "hexstring",
    "power": "hexstring"
  },
  "laststableproofroot": {
    "version": 1,
    "type": 1,
    "systemid": "hexstring",
    "height": 100,
    "stateroot": "hexstring",
    "blockhash": "hexstring",
    "power": "hexstring"
  },
  "lastconfirmedproofroot": {
    "version": 1,
    "type": 1,
    "systemid": "hexstring",
    "height": 100,
    "stateroot": "hexstring",
    "blockhash": "hexstring",
    "power": "hexstring"
  },
  "currencystates": {}
}
```

### Example 2: Get the best proof root with currency states

**Command:**
```
verus getbestproofroot '{"proofroots":[{"version":1,"type":1,"systemid":"hexstring","height":100,"stateroot":"hexstring","blockhash":"hexstring","power":"hexstring"}],"currencies":["VRSC","MYCHAIN"],"lastconfirmed":0}'
```

### Example 3: Using curl to get the best proof root

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getbestproofroot", "params": ["{"proofroots":[{"version":1,"type":1,"systemid":"currencyidorname","height":100,"stateroot":"hex","blockhash":"hex","power":"hex"}],"lastconfirmed":0}"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Proof Root Structure

A proof root in Verus contains essential information about a blockchain's state at a specific height:

1. **Version**: The version of the proof root structure
2. **Type**: The type of proof (system-specific)
3. **SystemID**: Identifier for the system the proof relates to
4. **Height**: The block height of this proof root
5. **StateRoot**: Merkle root of the chain's state at this height
6. **BlockHash**: Hash of the block at this height
7. **Power**: Combined measure of work and stake (for PoW/PoS systems)

### Selection Criteria

When determining the "best" proof root, the command evaluates:

1. **Validity**: The proof root must be validly formed
2. **Height**: Higher heights generally indicate more recent information
3. **Power**: Higher accumulated power indicates more work/stake has been committed
4. **Confirmation Status**: Whether the proof root has been confirmed through notarization

### Currency States

The `currencystates` returned by the command provides information about the state of currencies at the point represented by the proof roots, useful for cross-chain operations and conversions.

## Potential Error Cases

1. **Invalid Proof Root Format:**
   ```
   error code: -8
   error message:
   Invalid proof root format
   ```

2. **Invalid Last Confirmed Index:**
   ```
   error code: -8
   error message:
   Last confirmed index out of range
   ```

3. **System ID Not Found:**
   ```
   error code: -5
   error message:
   System ID not found
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Cross-Chain Verification**: Verify the state of one chain from another chain
2. **Notarization Systems**: Implement secure cross-chain notarization mechanisms
3. **Bridge Operations**: Enable secure bridges between different blockchains
4. **Import/Export Validation**: Validate cross-chain transfers and conversions
5. **Consensus Mechanisms**: Build consensus mechanisms that can operate across chains

## Related Commands

- `getnotarizationdata` - Get notarization data for a specific currency
- `getnotarizationproofs` - Get proofs for notarization challenges
- `getlaunchinfo` - Get launch information for a currency
- `getcurrency` - Get detailed information about a currency

## References
For more detailed information on the proof root system and cross-chain verification in Verus, refer to the Verus documentation on PBaaS and cross-chain operations.
