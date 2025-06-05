# Verus RPC Command: getnotarizationdata

## Purpose
The `getnotarizationdata` command returns the latest PBaaS notarization data for a specified currency ID. This command is crucial for examining the cross-chain verification mechanisms that secure the Verus multi-chain ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for notarization operations)
  - `-insightexplorer` - Enable additional blockchain data querying capabilities (recommended for detailed notarization data)

## Description
The `getnotarizationdata` command allows users to retrieve detailed information about the most recent notarizations for a specific currency or blockchain. Notarizations in the Verus ecosystem are cross-chain validations that confirm the state of one chain on another, serving as the foundation for secure cross-chain transfers and communication.

This command can optionally return notarization evidence and counterevidence, providing comprehensive information about the notarization process and any challenges to it. The data returned includes notarization protocol version, timestamps, block heights, state roots, and other critical verification information.

**Command Type**: Cross-Chain Verification  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currencyid` | string | Yes | | The hex-encoded ID or string name to search for notarizations on |
| `getevidence` | boolean | Optional | false | If true, returns notarization evidence as well as other data |
| `separatecounterevidence` | boolean | Optional | false | If true, counter-evidence is processed and returned with proofroots |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `version` | integer | The notarization protocol version |
| `currencyid` | string | ID of the notarized currency |
| `notarizationheight` | integer | Height of the notarization on the current chain |
| `mmrroot` | string | Merkle Mountain Range root of the notarized chain |
| `blockhash` | string | Hash of the notarized block |
| `timestamp` | integer | Timestamp of the notarization |
| `notaryaddresses` | array | Addresses of the notaries that signed this notarization |
| `signatures` | array | Signatures from the notaries |
| `evidence` | array | (Optional) Evidence used for the notarization |
| `counterevidence` | array | (Optional) Counter-evidence challenging the notarization |
| `proofroots` | array | Array of proof roots for verification |
| `currencystate` | object | State of the currency at the notarized height |

## Examples

### Example 1: Get basic notarization data for a currency

**Command:**
```
verus getnotarizationdata "MYCHAIN"
```

**Potential Output:**
```json
{
  "version": 1,
  "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
  "notarizationheight": 1000000,
  "mmrroot": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "blockhash": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
  "timestamp": 1620000000,
  "notaryaddresses": [
    "RAbcDefGhiJklMnoPqrsTuvWxYz123456",
    "R7abCdeFghIjkLmnOpQrStUvWxYz123456",
    "RXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ12345"
  ],
  "signatures": [
    "signature1",
    "signature2",
    "signature3"
  ],
  "proofroots": [
    {
      "version": 1,
      "type": 1,
      "systemid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
      "height": 500000,
      "stateroot": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "blockhash": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
      "power": "0000000000000000000000000000000000000000000000000000000000000100"
    }
  ],
  "currencystate": {
    "flags": 257,
    "initialratio": 0.5,
    "initialsupply": 1000000,
    "emitted": 0,
    "supply": 1000000,
    "reserve": 500000,
    "currentratio": 0.5
  }
}
```

### Example 2: Get notarization data with evidence

**Command:**
```
verus getnotarizationdata "MYCHAIN" true
```

### Example 3: Get notarization data with separate counterevidence

**Command:**
```
verus getnotarizationdata "MYCHAIN" true true
```

### Example 4: Using curl to get notarization data

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnotarizationdata", "params": ["currencyid"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Notarization Process

In the Verus ecosystem, notarizations serve several critical functions:

1. **Cross-Chain Verification**: Confirming the state of one chain on another
2. **Security Enhancement**: Providing additional security through multi-chain consensus
3. **Import/Export Validation**: Enabling secure cross-chain transfers
4. **Dispute Resolution**: Resolving conflicts through evidence and counterevidence

The notarization process typically involves:

1. **Block Header Inclusion**: Including the header of one chain in another
2. **MMR Root Calculation**: Computing a Merkle Mountain Range root for efficient verification
3. **Signature Aggregation**: Collecting signatures from multiple notaries
4. **Evidence Collection**: Gathering evidence to support the notarization
5. **Consensus Confirmation**: Confirming the notarization through consensus

### Notarization Protocols

The `version` field indicates the notarization protocol being used:

| Protocol Version | Description |
|------------------|-------------|
| 1 | PROOF_PBAASMMR - Verus MMR proof, no notaries required |
| 2 | PROOF_CHAINID - Chain ID is sole notary for proof, no evidence required |
| 3 | PROOF_ETHNOTARIZATION - Ethereum notarization and PATRICIA TRIE proof |

### Evidence and Counterevidence

When the `getevidence` parameter is set to true, the command returns:

1. **Evidence**: Data supporting the validity of the notarization
2. **Counterevidence**: Challenges to the notarization that claim it is invalid

When `separatecounterevidence` is true, counterevidence is processed separately and returned alongside proof roots, providing a more detailed view of any disputes.

## Potential Error Cases

1. **Currency Not Found:**
   ```
   error code: -5
   error message:
   Currency not found
   ```

2. **Invalid Currency ID:**
   ```
   error code: -8
   error message:
   Invalid currency ID format
   ```

3. **No Notarizations Found:**
   ```
   error code: 0
   error message:
   No notarizations found for the specified currency
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Cross-Chain Verification**: Verify the state of a chain that has been notarized
2. **Security Auditing**: Audit the notarization process for a currency
3. **Dispute Resolution**: Examine evidence and counterevidence in notarization disputes
4. **Synchronization Verification**: Ensure that chains are properly synchronized
5. **Import/Export Validation**: Validate the notarizations required for cross-chain transfers

## Related Commands

- `getnotarizationproofs` - Get proofs for notarization challenges
- `getbestproofroot` - Determine the best proof root among candidates
- `getlaunchinfo` - Get launch information for a currency, including initial notarization
- `getlastimportfrom` - Get the last import and its associated notarization
- `getcurrency` - Get detailed information about a currency

## References
For more detailed information on the notarization process in the Verus ecosystem, refer to the Verus documentation on cross-chain verification, PBaaS, and notarization protocols.
