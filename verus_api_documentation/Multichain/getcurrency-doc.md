# Verus RPC Command: getcurrency

## Purpose
The `getcurrency` command is used to retrieve complete definition and status information for any currency registered on the Verus blockchain. This includes native PBaaS chains, tokens, fractional currencies, and imported currencies from connected chains.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password

## Description
The `getcurrency` command returns comprehensive information about a specified currency, including its definition parameters, current state, reserves, supply, and other essential data. If no currency name is provided, the command returns information about the current chain the daemon is running on.

This command is vital for querying the status and configuration of currencies in the Verus ecosystem, whether they are simple tokens, fractional reserve currencies, or full independent blockchains. The information returned includes everything from basic currency identifiers to complex configuration details like reward schedules, notarization protocols, and network nodes.

**Command Type**: Currency Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single optional parameter:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currencyname` | string | Optional | Current chain | Name or ID of the currency to look up |

## Results
The command returns a detailed JSON object with comprehensive information about the currency:

| Property | Type | Description |
|----------|------|-------------|
| `version` | integer | Version of this chain definition |
| `name` | string | Name or symbol of the chain |
| `fullyqualifiedname` | string | Name or symbol with all parent namespaces, separated by "." |
| `currencyid` | string | i-address that represents the currency ID |
| `currencyidhex` | string | Hex representation of currency ID |
| `parent` | string | Parent blockchain ID |
| `systemid` | string | System on which this currency is considered to run |
| `launchsystemid` | string | System from which this currency was launched |
| `notarizationprotocol` | integer | Protocol number for cross-chain or bridged notarizations |
| `proofprotocol` | integer | Protocol number for cross-chain or bridged proofs |
| `startblock` | integer | Block number on parent chain where this currency/chain starts |
| `endblock` | integer | Block number after which this chain's useful life ends (0 = no end) |
| `currencies` | array | Currencies that can be converted to this currency or make up a liquidity basket |
| `weights` | array | Relative currency weights (only for liquidity baskets) |
| `conversions` | array | Pre-launch conversion rates for non-fractional currencies |
| `minpreconversion` | array | Minimum amounts required in pre-conversions for currency to launch |
| `currencynames` | object | i-addresses mapped to fully qualified names of all sub-currencies |
| `initialsupply` | number | Initial currency supply before preallocation or issuance |
| `prelaunchcarveout` | number | Pre-launch percentage of proceeds for fractional currency |
| `preallocations` | array | VerusIDs and amounts for pre-allocation at launch |
| `initialcontributions` | array | Amounts of pre-conversions reserved for launching ID |
| `idregistrationfees` | number | Base cost of IDs for this currency namespace |
| `idreferrallevels` | integer | Levels of ID referrals (for native PBaaS chains and IDs) |
| `idimportfees` | number | Fees required to import an ID to this system |
| `eras` | array | Different chain phases of rewards and convertibility |
| » `reward` | array | Reward start for each era in native coin |
| » `decay` | array | Exponential or linear decay of rewards during each era |
| » `halving` | array | Blocks between halvings during each era |
| » `eraend` | array | Block marking the end of each era |
| » `eraoptions` | array | Options (reserved) |
| `nodes` | array | Up to 8 nodes that can be used to connect to the blockchain |
| » `nodeidentity` | string | Network identifier for node |
| » `paymentaddress` | integer | Rewards payment address |
| `lastconfirmedcurrencystate` | object | Last confirmed state of the currency |
| `besttxid` | string | Transaction ID for the best currency state |
| `confirmednotarization` | object | Last confirmed notarization data |
| `confirmedtxid` | string | Transaction ID for the confirmed notarization |

## Examples

### Example 1: Get information about the current chain

**Command:**
```
verus getcurrency
```

**Potential Output:**
```json
{
  "version": 1,
  "name": "VRSC",
  "fullyqualifiedname": "VRSC",
  "currencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "currencyidhex": "a5dfc49feaa9b91515be94b5b4e5a267d18e81c9",
  "parent": "",
  "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "launchsystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "notarizationprotocol": 1,
  "proofprotocol": 1,
  "startblock": 0,
  "endblock": 0,
  "eras": [
    {
      "reward": 38400000000,
      "decay": 0,
      "halving": 43200,
      "eraend": 129600
    },
    {
      "reward": 2400000000,
      "decay": 0,
      "halving": 43200,
      "eraend": 0
    }
  ],
  "nodes": [],
  "lastconfirmedcurrencystate": {
    "flags": 3,
    "initialratio": 0,
    "initialsupply": 0,
    "emitted": 66432489976200000,
    "supply": 66432489976200000,
    "reserve": 0,
    "currentratio": 0
  }
}
```

### Example 2: Get information about a specific currency

**Command:**
```
verus getcurrency "MYFRACTIONAL"
```

### Example 3: Get information about a currency using its ID

**Command:**
```
verus getcurrency "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2"
```

### Example 4: Using curl to get currency information

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getcurrency", "params": ["currencyname"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Currency Identifiers

Currencies in the Verus ecosystem can be identified in several ways:

1. **Name**: The human-readable name of the currency (e.g., "VRSC", "MYTOKEN")
2. **Fully Qualified Name**: The complete name including any parent namespaces (e.g., "PARENT.CHILD")
3. **Currency ID**: An i-address representing the currency (e.g., "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq")
4. **Currency ID Hex**: The hexadecimal representation of the currency ID

### Currency Types

The information returned will vary based on the currency type:

1. **Native Chain**: The primary blockchain (e.g., Verus)
2. **PBaaS Chain**: An independent blockchain launched through Verus
3. **Fractional Currency**: A currency backed by reserves in other currencies
4. **Token**: A simple token on an existing blockchain
5. **Imported Currency**: A currency from another chain imported through bridging

### Currency States

The `lastconfirmedcurrencystate` field provides critical information about the current state of the currency:

1. **Flags**: Bitflags indicating currency properties
2. **Initial Ratio/Supply**: Starting parameters
3. **Emitted**: Total amount emitted by the protocol
4. **Supply**: Current circulating supply
5. **Reserve**: Current reserve amounts (for fractional currencies)
6. **Current Ratio**: Current reserve ratio (for fractional currencies)

## Potential Error Cases

1. **Currency Not Found:**
   ```
   error code: -5
   error message:
   Currency not found
   ```

2. **Invalid Currency Name:**
   ```
   error code: -8
   error message:
   Invalid currency name
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

1. **Currency Verification**: Verify the properties and status of a currency
2. **Exchange Integration**: Gather necessary information for listing a currency
3. **DeFi Applications**: Access currency state for decentralized finance applications
4. **Blockchain Analysis**: Analyze the configuration and parameters of a blockchain
5. **Conversion Calculations**: Get reserve information for calculating conversions

## Related Commands

- `listcurrencies` - List all currencies on the blockchain
- `getcurrencystate` - Get detailed state information for a currency
- `estimateconversion` - Estimate conversion between currencies
- `getcurrencyconverters` - Find currencies that can convert between others

## References
For more detailed information on currencies in the Verus ecosystem, refer to the Verus documentation on PBaaS, currencies, and tokens.
