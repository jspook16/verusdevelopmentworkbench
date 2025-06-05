# Verus RPC Command: getnotarizationproofs

## Purpose
The `getnotarizationproofs` command returns proofs for requested challenges against unconfirmed notarizations on a bridged system. These proofs can independently or in combination with other proofs invalidate or force a competing chain to provide more proofs to confirm any pending cross-chain notarization.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for notarization proofs)
  - `-insightexplorer` - Enable additional blockchain data querying capabilities (recommended for generating and verifying proofs)

## Description
The `getnotarizationproofs` command is a sophisticated tool for the cross-chain security system in Verus. It allows users to request cryptographic proofs that can be used to validate or challenge notarizations between chains. This command is particularly important in situations where there may be competing chains or disputed notarizations, as it provides a mechanism for resolving these conflicts through cryptographic evidence.

The command accepts a complex array of challenge requests, each specifying what type of proof is needed, what evidence is being challenged, and other parameters. It returns evidence challenges and proofs that can be used in the notarization verification process.

**Command Type**: Cross-Chain Verification  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts an array of challenge request objects, each with the following structure:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Challenge type (e.g., "vrsc::evidence.skipchallenge" or currency ID) |
| `evidence` | object | Yes | The notary evidence being challenged |
| `entropyhash` | string | Optional | Hex-encoded entropy hash for randomization |
| `proveheight` | integer | Optional | Height to prove |
| `atheight` | integer | Optional | Height at which to provide proof |
| `priornotarizationref` | object | Optional | Reference to prior notarization |
| `priorroot` | object | Optional | Prior proof root |
| `challengeroots` | array | Optional | Array of challenge root objects |
| `confirmnotarization` | object | Optional | New notarization to confirm |
| `confirmroot` | object | Optional | Proof root to confirm |
| `fromheight` | integer | Optional | Starting height for range proofs |
| `toheight` | integer | Optional | Ending height for range proofs |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `evidence` | array | Array of notary evidence challenges, including proofs for the challenges requested |

## Examples

### Example 1: Request a skip challenge proof

**Command:**
```
verus getnotarizationproofs '[{"type":"vrsc::evidence.skipchallenge", "evidence":{"version":1, "type":1, "currencyid":"i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2"}, "proveheight":1000000, "atheight":1000050}]'
```

**Potential Output:**
```json
{
  "evidence": [
    {
      "version": 1,
      "type": 1,
      "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
      "height": 1000000,
      "stateroot": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "blockhash": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
      "timestamp": 1620000000,
      "proofs": [
        {
          "type": "vrsc::evidence.skipchallenge",
          "height": 1000000,
          "stateroot": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          "blockhash": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
          "mmrroot": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "power": "0000000000000000000000000000000000000000000000000000000000000100"
        }
      ]
    }
  ]
}
```

### Example 2: Request a primary proof challenge

**Command:**
```
verus getnotarizationproofs '[{"type":"vrsc::evidence.primaryproof", "priornotarizationref":{"txid":"1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t", "voutnum":1}, "challengeroots":[{"indexkey":{"height":1000100}, "proofroot":{"version":1, "type":1, "systemid":"i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2", "height":1000100, "stateroot":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "blockhash":"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210", "power":"0000000000000000000000000000000000000000000000000000000000000100"}}], "evidence":{"version":1, "type":1, "currencyid":"i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2"}, "entropyhash":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"}]'
```

### Example 3: Using curl to request notarization proofs

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getnotarizationproofs", "params": [[{"type":"iCwxpRL6h3YeCRtGjgQSsqoKdZCuM4Dxaf", "evidence":{CNotaryEvidence}, "proveheight":n, "atheight":n}, ...]] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Challenge Types

The `getnotarizationproofs` command supports several types of challenges:

1. **Skip Challenge** ("vrsc::evidence.skipchallenge" or "iCwxpRL6h3YeCRtGjgQSsqoKdZCuM4Dxaf"): Proves that a notarization skipped a valid block, invalidating the notarization.

2. **Primary Proof Challenge** ("vrsc::evidence.primaryproof" or "iKDesmiEkEjDG61nQSZJSGhWvC8x8xA578"): Provides a primary proof that challenges the validity of a notarization.

3. **Custom Type Challenges**: Other challenge types can be specified using their corresponding currency IDs.

### Proof Generation

When a challenge request is received, the command:

1. Validates the request parameters
2. Retrieves the appropriate blockchain data
3. Constructs cryptographic proofs based on the request type
4. Returns the proofs in a structured format

These proofs can then be used in the cross-chain verification process to either validate or invalidate notarizations.

### Evidence and Counterevidence

The notarization system operates on evidence and counterevidence:

1. **Evidence**: Supports the validity of a notarization
2. **Counterevidence**: Challenges the validity of a notarization
3. **Proofs**: Cryptographic verifications of evidence or counterevidence

The `getnotarizationproofs` command primarily deals with generating counterevidence in the form of proofs that challenge existing notarizations.

### Notarization Conflicts

In cases where there are competing chains or disputed notarizations:

1. Each chain can provide proofs supporting its version of events
2. Challenges can be issued requiring additional proofs
3. The chain with the most valid proofs and evidence prevails
4. This cryptographic dispute resolution ensures security across chains

## Potential Error Cases

1. **Invalid Challenge Type:**
   ```
   error code: -8
   error message:
   Invalid challenge type
   ```

2. **Missing Evidence:**
   ```
   error code: -8
   error message:
   Evidence object required
   ```

3. **Invalid Prior Notarization:**
   ```
   error code: -5
   error message:
   Prior notarization not found
   ```

4. **Invalid Parameters:**
   ```
   error code: -8
   error message:
   Confirm notarization and confirm root cannot both be specified
   ```

5. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Cross-Chain Security**: Verify and challenge notarizations between chains
2. **Dispute Resolution**: Resolve conflicts between competing chains
3. **Notarization Validation**: Validate the integrity of the notarization process
4. **Security Auditing**: Audit the cross-chain verification system
5. **Attack Mitigation**: Counter potential attacks on the cross-chain system

## Related Commands

- `getnotarizationdata` - Get detailed notarization data
- `getbestproofroot` - Determine the best proof root among candidates
- `getlaunchinfo` - Get launch information for a currency, including initial notarization
- `getlastimportfrom` - Get the last import and its associated notarization
- `getcurrency` - Get detailed information about a currency

## References
For more detailed information on the notarization proof system in the Verus ecosystem, refer to the Verus documentation on cross-chain verification, PBaaS, and notarization protocols.
