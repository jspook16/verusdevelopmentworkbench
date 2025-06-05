# Verus RPC Command: getcurrencystate

## Purpose
The `getcurrencystate` command returns the currency state(s) on the blockchain for any specified currency, either with all changes on the current chain or relative to another system. This command provides detailed information about a currency's current status, including supply, reserves, ratio, and trading data.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (recommended for state queries)

## Description
The `getcurrencystate` command allows users to query the state of a currency at a specific height or range of heights on the blockchain. The state includes critical information such as the currency's flags, initial and current ratios, supply, reserves, and emission data. 

For fractional reserve currencies, this provides essential information about the backing reserves and the current reserve ratio. Additionally, when a conversion data currency is specified, the command returns market data including trading volumes, prices, and price movements for the currency.

This command is vital for monitoring currency performance, calculating conversions, and tracking the historical state of currencies in the Verus ecosystem.

**Command Type**: Currency Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currencynameorid` | string | Yes | | Name or i-address of the currency to query |
| `n` or `m,n` or `m,n,o` | integer or string | Optional | Latest | Height or inclusive range with optional step at which to get the currency state. If not specified, the latest currency state and height is returned |
| `conversiondatacurrency` | string | Optional | | If present, market data with volumes in the given currency are returned |

## Results
The command returns an array of objects, one for each height requested, with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `height` | integer | Block height of this currency state |
| `blocktime` | integer | Block time of this state |
| `currencystate` | object | Details of the currency state |
| » `flags` | integer | Bitflags indicating currency properties |
| » `initialratio` | number | Initial reserve ratio at launch |
| » `initialsupply` | number | Initial supply at launch |
| » `emitted` | number | Total amount emitted by the protocol |
| » `supply` | number | Current circulating supply |
| » `reserve` | number | Current reserve amounts (for fractional currencies) |
| » `currentratio` | number | Current reserve ratio (for fractional currencies) |
| `conversiondata` | object | Market data (if conversiondatacurrency was specified) |
| » `volumecurrency` | string | Currency in which volumes are denominated |
| » `volumethisinterval` | number | Trading volume in this interval |
| » `volumepairs` | array | Detailed trading data for currency pairs |
| »» `currency` | string | Source currency |
| »» `convertto` | string | Destination currency |
| »» `volume` | number | Volume denominated in volumecurrency |
| »» `open` | number | Opening conversion rate |
| »» `high` | number | Highest conversion rate |
| »» `low` | number | Lowest conversion rate |
| »» `close` | number | Closing conversion rate |

## Examples

### Example 1: Get the latest state of a currency

**Command:**
```
verus getcurrencystate "VRSC"
```

**Potential Output:**
```json
[
  {
    "height": 1500000,
    "blocktime": 1620000000,
    "currencystate": {
      "flags": 3,
      "initialratio": 0,
      "initialsupply": 0,
      "emitted": 66432489976200000,
      "supply": 66432489976200000,
      "reserve": 0,
      "currentratio": 0
    }
  }
]
```

### Example 2: Get currency state at a specific height

**Command:**
```
verus getcurrencystate "MYFRACTIONAL" 1000000
```

### Example 3: Get currency state across a range of heights

**Command:**
```
verus getcurrencystate "MYFRACTIONAL" "1000000,1100000,10000"
```

### Example 4: Get currency state with conversion data

**Command:**
```
verus getcurrencystate "MYFRACTIONAL" "1000000" "VRSC"
```

**Potential Output:**
```json
[
  {
    "height": 1000000,
    "blocktime": 1610000000,
    "currencystate": {
      "flags": 1,
      "initialratio": 0.5,
      "initialsupply": 1000000,
      "emitted": 0,
      "supply": 1000000,
      "reserve": 500000,
      "currentratio": 0.5
    },
    "conversiondata": {
      "volumecurrency": "VRSC",
      "volumethisinterval": 25000,
      "volumepairs": [
        {
          "currency": "VRSC",
          "convertto": "MYFRACTIONAL",
          "volume": 15000,
          "open": 0.5,
          "high": 0.52,
          "low": 0.49,
          "close": 0.51
        },
        {
          "currency": "MYFRACTIONAL",
          "convertto": "VRSC",
          "volume": 10000,
          "open": 2.0,
          "high": 2.04,
          "low": 1.92,
          "close": 1.96
        }
      ]
    }
  }
]
```

### Example 5: Using curl to get currency state

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getcurrencystate", "params": ["currencynameorid" "n" "connectedchainid"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Currency Flags

The `flags` field in the currency state contains bitflags that indicate various properties of the currency:

| Flag Value | Description |
|------------|-------------|
| 0x01 | FRACTIONAL - Currency is a fractional reserve currency |
| 0x02 | IDRESTRICTED - Only identities can hold this currency |
| 0x04 | IDSTAKING - Staking is only allowed by identities |
| 0x08 | IDREFERRALS - Identity referrals are enabled |
| 0x10 | IDREFERRALSREQUIRED - Identity referrals are required |
| 0x20 | TOKEN - Currency is a token (not a chain) |
| 0x40 | RESERVED - Reserved for future use |
| 0x100 | IS_PBAAS_CHAIN - Currency is a PBaaS chain |

### Ratio Calculation

For fractional reserve currencies, the ratio represents the portion of the currency that is backed by reserves:

1. **Initial Ratio**: The ratio at launch, determined by the currency definition
2. **Current Ratio**: The current ratio, calculated as total reserves / (supply * reserve currency price)

A ratio of 1.0 (100%) means the currency is fully backed, while lower ratios indicate partial backing.

### Conversion Data

When `conversiondatacurrency` is specified, the command returns market data for the currency:

1. **Volume**: Total trading volume in the specified currency
2. **Price Data**: Open, high, low, and close prices for conversions
3. **Pair Data**: Information about specific trading pairs

This data is similar to OHLC (Open, High, Low, Close) data commonly used in financial markets.

## Potential Error Cases

1. **Currency Not Found:**
   ```
   error code: -5
   error message:
   Currency not found
   ```

2. **Invalid Height:**
   ```
   error code: -8
   error message:
   Invalid height parameter
   ```

3. **Conversion Data Currency Not Found:**
   ```
   error code: -5
   error message:
   Conversion data currency not found
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Currency Monitoring**: Track the state and health of currencies over time
2. **Reserve Analysis**: Analyze the reserve status of fractional currencies
3. **Market Analysis**: Study conversion volumes and prices for trading decisions
4. **DeFi Applications**: Build applications that utilize currency state data
5. **Historical Analysis**: Examine how currencies have evolved over time
6. **Arbitrage Detection**: Identify arbitrage opportunities between currencies

## Related Commands

- `getcurrency` - Get detailed information about a currency
- `listcurrencies` - List all currencies on the blockchain
- `estimateconversion` - Estimate conversion between currencies
- `getcurrencyconverters` - Find currencies that can convert between others
- `getinitialcurrencystate` - Get the initial state of a PBaaS chain being launched

## References
For more detailed information on currency states and their interpretation, refer to the Verus documentation on fractional currencies, DeFi, and PBaaS chains.
