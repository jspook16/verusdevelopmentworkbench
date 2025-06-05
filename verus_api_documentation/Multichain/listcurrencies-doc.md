# Verus RPC Command: listcurrencies

## Purpose
The `listcurrencies` command returns complete definitions for all currencies registered on the blockchain, with optional filtering by various criteria. This command is essential for discovering and analyzing the currencies available in the Verus ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password

## Description
The `listcurrencies` command allows users to query all currencies on the blockchain with flexible filtering options. It returns detailed information about each currency, including its definition parameters, current state, and other essential data. This command is particularly useful for exploratory analysis, building user interfaces that display available currencies, and monitoring the currency ecosystem.

Users can filter the results based on launch state, system type, originating system, and converter relationships, allowing for targeted queries that match specific use cases. The command returns the same comprehensive currency information as the `getcurrency` command, but for multiple currencies at once.

**Command Type**: Currency Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts an optional JSON object with filtering criteria and optional start/end block parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query object` | object | Optional | No filtering | JSON object specifying valid query conditions |
| » `launchstate` | string | Optional | | Return only currencies in a specific state ("prelaunch", "launched", "refund", "complete") |
| » `systemtype` | string | Optional | | Filter by system type ("local", "imported", "gateway", "pbaas") |
| » `fromsystem` | string | Optional | Local chain | If currency is from another system, specify here |
| » `converter` | array | Optional | | Only return fractional currency converters of one or more currencies |
| `startblock` | integer | Optional | 0 | Return currencies defined at or after this block height |
| `endblock` | integer | Optional | Current height | Return currencies defined at or before this block height |

## Results
The command returns an array of currency objects, each with the following structure:

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
| `nodes` | array | Up to 8 nodes that can be used to connect to the blockchain |
| `lastconfirmedcurrencystate` | object | Last confirmed state of the currency |
| `besttxid` | string | Transaction ID for the best currency state |
| `confirmednotarization` | object | Last confirmed notarization data |
| `confirmedtxid` | string | Transaction ID for the confirmed notarization |

## Examples

### Example 1: List all currencies on the blockchain

**Command:**
```
verus listcurrencies
```

**Partial Output:**
```json
[
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
    ...
  },
  {
    "version": 1,
    "name": "MYCHAIN",
    "fullyqualifiedname": "MYCHAIN",
    "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "currencyidhex": "f9e72a10b8d0ae8c1dd6e218c7f5a85b3c1f9d7f",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "launchsystemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "notarizationprotocol": 1,
    "proofprotocol": 1,
    "startblock": 1000000,
    "endblock": 0,
    ...
  },
  ...
]
```

### Example 2: List currencies in prelaunch state

**Command:**
```
verus listcurrencies '{"launchstate":"prelaunch"}'
```

### Example 3: List currency converters for specific currencies

**Command:**
```
verus listcurrencies '{"converter":["VRSC","BTC"]}'
```

### Example 4: List currencies from a specific system

**Command:**
```
verus listcurrencies '{"fromsystem":"VRSC"}'
```

### Example 5: List PBaaS chains defined between specific blocks

**Command:**
```
verus listcurrencies '{"systemtype":"pbaas"}' 1000000 1100000
```

### Example 6: Using curl to list currencies

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listcurrencies", "params": [true] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Currency Types

The `listcurrencies` command can filter and return various types of currencies:

1. **Native Chain**: The primary blockchain (e.g., Verus)
2. **PBaaS Chain**: An independent blockchain launched through Verus
3. **Fractional Currency**: A currency backed by reserves in other currencies
4. **Token**: A simple token on an existing blockchain
5. **Imported Currency**: A currency from another chain imported through bridging
6. **Gateway**: A special currency that serves as a bridge between chains

### Launch States

Currencies can be in different launch states:

1. **Prelaunch**: The currency is defined but not yet launched
2. **Launched**: The currency has successfully launched
3. **Refund**: The currency failed to launch and is in refund state
4. **Complete**: The currency has completed its lifecycle (reached endblock)

### System Types

The `systemtype` filter can target currencies from different system types:

1. **Local**: Currencies native to the current chain
2. **Imported**: Currencies imported from other chains
3. **Gateway**: Gateway currencies that bridge between chains
4. **PBaaS**: Public Blockchain as a Service chains

### Converter Relationships

The `converter` filter allows finding currencies that can convert between specified currencies. This is particularly useful for finding:

1. **Liquidity Pools**: Fractional currencies designed for trading
2. **Bridges**: Currencies that bridge between others
3. **Multi-Currency Baskets**: Currencies backed by multiple reserves

## Potential Error Cases

1. **Invalid Query Parameters:**
   ```
   error code: -8
   error message:
   Invalid launchstate value
   ```

2. **Invalid Block Range:**
   ```
   error code: -8
   error message:
   End block must be greater than or equal to start block
   ```

3. **Currency Not Found:**
   ```
   error code: 0
   error message:
   No currencies found matching the criteria
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Currency Discovery**: Find available currencies on the blockchain
2. **UI Development**: Build interfaces that display currency options
3. **Converter Analysis**: Identify conversion paths between currencies
4. **Ecosystem Monitoring**: Monitor the state of the currency ecosystem
5. **Launch Tracking**: Track currencies in the prelaunch state
6. **Filter and Search**: Find currencies matching specific criteria

## Related Commands

- `getcurrency` - Get detailed information about a specific currency
- `getcurrencystate` - Get the current state of a currency
- `getcurrencyconverters` - Find currencies that can convert between others
- `estimateconversion` - Estimate conversion between currencies
- `definecurrency` - Define a new currency

## References
For more detailed information on currencies in the Verus ecosystem, refer to the Verus documentation on PBaaS, fractional currencies, tokens, and multi-chain architecture.
