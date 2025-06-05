# Verus RPC Command: getlaunchinfo

## Purpose
The `getlaunchinfo` command returns the launch notarization data and partial transaction proof of the launch notarization for a specified currency ID. This information is crucial for verifying the launch process of a PBaaS chain or currency.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for launch information queries)

## Description
The `getlaunchinfo` command allows users to retrieve comprehensive information about the launch of a specific currency or blockchain in the Verus ecosystem. When a new PBaaS chain or currency is launched, a launch notarization is created that confirms the initial state, parameters, and preconversions for the new currency. This command provides access to that notarization data along with cryptographic proofs of its validity.

This information is valuable for auditing the launch process, verifying that a currency launched correctly, and understanding the initial conditions under which it was created. The command returns the full currency definition, transaction proofs, and notarization data.

**Command Type**: Currency Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single required parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currencyid` | string | Yes | The hex-encoded ID or string name to search for notarizations on |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `currencydefinition` | object | Full currency definition |
| `txid` | string | Transaction ID of the launch notarization |
| `voutnum` | integer | Output index of the launch notarization |
| `transactionproof` | object | Partial transaction proof of the launch transaction and output |
| `launchnotarization` | object | Final CPBaaSNotarization clearing launch or refund |
| `notarynotarization` | object | Current notarization of this chain |

## Examples

### Example 1: Get launch information for a currency

**Command:**
```
verus getlaunchinfo "MYCHAIN"
```

**Potential Output:**
```json
{
  "currencydefinition": {
    "version": 1,
    "name": "MYCHAIN",
    "fullyqualifiedname": "MYCHAIN",
    "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "notarizationprotocol": 1,
    "proofprotocol": 1,
    "startblock": 1000000,
    "endblock": 0,
    "currencies": ["VRSC", "BTC"],
    "weights": [0.5, 0.5],
    "initialsupply": 1000000,
    "prelaunchcarveout": 0.1,
    "initialcontributions": [100000, 1],
    "idregistrationfees": 10,
    "idreferrallevels": 1,
    "eras": [
      {
        "reward": 10000000000,
        "decay": 0,
        "halving": 840000,
        "eraend": 4200000
      }
    ],
    "nodes": [
      {
        "networkaddress": "127.0.0.1:27486",
        "nodeidentity": "mynode@"
      }
    ]
  },
  "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  "voutnum": 1,
  "transactionproof": {
    "version": 1,
    "type": 1,
    "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    "voutnum": 1,
    "merkleproof": "0400008085202f890221..."
  },
  "launchnotarization": {
    "version": 1,
    "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "notarizationheight": 1000000,
    "mmrroot": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "notaryaddresses": [
      "RAbcDefGhiJklMnoPqrsTuvWxYz123456",
      "R7abCdeFghIjkLmnOpQrStUvWxYz123456",
      "RXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ12345"
    ],
    "signatures": [
      "signature1",
      "signature2",
      "signature3"
    ]
  },
  "notarynotarization": {
    "version": 1,
    "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "notarizationheight": 1000100,
    "mmrroot": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "notaryaddresses": [
      "RAbcDefGhiJklMnoPqrsTuvWxYz123456",
      "R7abCdeFghIjkLmnOpQrStUvWxYz123456",
      "RXyZaBcDeFgHiJkLmNoPqRsTuVwXyZ12345"
    ],
    "signatures": [
      "signature1",
      "signature2",
      "signature3"
    ]
  }
}
```

### Example 2: Get launch information using a currency ID

**Command:**
```
verus getlaunchinfo "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2"
```

### Example 3: Using curl to get launch information

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getlaunchinfo", "params": ["currencyid"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Launch Process

In the Verus ecosystem, the launch of a new currency or blockchain follows a specific process:

1. **Currency Definition**: A currency is defined using the `definecurrency` command
2. **Preconversion Period**: Users can convert existing currencies into the new one during this period
3. **Launch Notarization**: At the specified start block, a launch notarization is created
4. **Chain Initialization**: For PBaaS chains, the blockchain is initialized with block 1
5. **Continued Notarization**: The chain continues to be notarized at regular intervals

The `getlaunchinfo` command provides data about the critical launch notarization step in this process.

### Transaction Proofs

The `transactionproof` field contains a partial transaction proof that can be used to verify the launch transaction without requiring access to the entire blockchain. This proof typically includes:

1. **Merkle Path**: A path in a Merkle tree that proves the transaction's inclusion in a block
2. **Transaction Data**: Selected parts of the transaction relevant to the proof
3. **Output Data**: Data from the specific output containing the launch notarization

### Notarizations

The command returns two types of notarizations:

1. **Launch Notarization**: The notarization that officially launched the currency or chain
2. **Current Notarization**: The most recent notarization of the chain

Notarizations include signatures from multiple notaries, ensuring the security and validity of the cross-chain verification.

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

3. **Launch Information Not Available:**
   ```
   error code: -5
   error message:
   Launch information not available for the specified currency
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Launch Verification**: Verify that a currency launched correctly and with the expected parameters
2. **Audit Trail**: Maintain a record of currency launches for auditing purposes
3. **Initial State Verification**: Confirm the initial state and parameters of a currency
4. **Notarization Verification**: Verify the notarization process for a currency
5. **Security Analysis**: Analyze the security of a currency's launch process

## Related Commands

- `definecurrency` - Define a new currency or blockchain
- `getcurrency` - Get detailed information about a currency
- `getinitialcurrencystate` - Get the initial state of a currency
- `getnotarizationdata` - Get notarization data for a currency
- `listcurrencies` - List all currencies on the blockchain

## References
For more detailed information on the currency launch process in the Verus ecosystem, refer to the Verus documentation on PBaaS, notarizations, and currency creation.
