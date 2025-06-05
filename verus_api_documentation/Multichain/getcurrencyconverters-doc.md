# Verus RPC Command: getcurrencyconverters

## Purpose
The `getcurrencyconverters` command retrieves all currencies that can satisfy a conversion request at or better than a specified target price without other traffic and have all the requested currencies as reserves. This command is essential for finding optimal conversion paths in the Verus DeFi ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (recommended for currency converters operations)

## Description
The `getcurrencyconverters` command allows users to find currencies (typically fractional currencies or liquidity pools) that can facilitate conversions between specified currencies. It can handle both simple queries for specific currencies and advanced queries with slippage options, target prices, and specific conversion amounts.

This command is particularly useful for finding the most efficient way to convert between currencies that may not have a direct conversion path but can be converted through intermediary fractional currencies that have both as reserves. It returns detailed information about the potential converter currencies, including their current state and conversion capabilities.

**Command Type**: Currency Management  
**Protocol Level**: PBaaS/DeFi  
**Access Requirement**: Basic node access

## Arguments
The command accepts either a list of currency names or a detailed parameter object:

### Simple Format (Currency Names)
| Parameter | Type | Description |
|-----------|------|-------------|
| `currencyname` | string (one or more) | Names of currencies to find converters for |

### Advanced Format (Parameter Object)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `convertto` | string | Yes | Target currency |
| `fromcurrency` | string or array | Yes | Source currency or currencies |
| `targetprice` | number or array | Optional | Target price within slippage required |
| `amount` | number | Optional | Amount of target currency needed |
| `slippage` | number | Optional | Maximum acceptable slippage (max is 50% = 50000000) |

## Results
The command returns an array of currency objects, each containing detailed information about the currency, its current state, and conversion capabilities:

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Name of the converter currency |
| `currencyid` | string | ID of the converter currency |
| `parent` | string | Parent currency/chain ID |
| `systemid` | string | System the currency operates on |
| `currencies` | array | Reserve currencies for this converter |
| `weights` | array | Relative weights of reserves |
| `reserves` | object | Current reserve amounts |
| `supply` | number | Current supply of the converter currency |
| `initialsupply` | number | Initial supply at launch |
| `conversion` | object | Conversion details if specific query was made |
| » `amount` | number | Amount to convert |
| » `estimatedoutput` | number | Estimated output from conversion |
| » `price` | number | Conversion price |
| » `slippage` | number | Expected slippage for this conversion |

## Examples

### Example 1: Get converters for specific currencies

**Command:**
```
verus getcurrencyconverters '["VRSC","BTC"]'
```

**Potential Output:**
```json
[
  {
    "name": "VRSCBTCBRIDGE",
    "currencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "currencies": ["VRSC", "BTC"],
    "weights": [0.5, 0.5],
    "reserves": {
      "VRSC": 100000,
      "BTC": 1
    },
    "supply": 20000,
    "initialsupply": 20000
  },
  {
    "name": "MULTICURRENCYPOOL",
    "currencyid": "i7KFGDcshRKV2jpJEKzRWpgQQgJTZYiZXe",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "currencies": ["VRSC", "BTC", "ETH"],
    "weights": [0.4, 0.3, 0.3],
    "reserves": {
      "VRSC": 80000,
      "BTC": 0.75,
      "ETH": 10
    },
    "supply": 15000,
    "initialsupply": 15000
  }
]
```

### Example 2: Get converters with specific conversion requirements

**Command:**
```
verus getcurrencyconverters '{"convertto":"BTC", "fromcurrency":"VRSC", "targetprice":100000, "amount":0.1, "slippage":0.01}'
```

### Example 3: Get converters for multiple source currencies with target prices

**Command:**
```
verus getcurrencyconverters '{"convertto":"USDT", "fromcurrency":[{"currency":"VRSC", "targetprice":0.5}, {"currency":"BTC", "targetprice":40000}], "slippage":0.02}'
```

### Example 4: Using curl to get currency converters

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getcurrencyconverters", "params": ['["currency1","currency2",...]'] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Converter Types

In the Verus ecosystem, there are several types of currency converters:

1. **Fractional Currencies**: Currencies backed by reserves of other currencies
2. **Liquidity Pools**: Similar to fractional currencies but specifically designed for trading
3. **Bridge Currencies**: Specifically designed to bridge between two or more currencies
4. **Gateway Converters**: Used for conversions between PBaaS chains

### Slippage Calculation

When requesting converters with specific slippage requirements:

1. **Price Impact**: The effect of the conversion on the price is calculated
2. **Maximum Slippage**: The maximum acceptable deviation from the target price
3. **Effective Output**: The estimated output considering the slippage
4. **Qualifying Converters**: Only converters that can satisfy the slippage requirements are returned

### Reserve Weights

The weights of reserves in a fractional currency determine:

1. **Conversion Rates**: How conversions between reserves are priced
2. **Reserve Requirements**: The minimum amounts of each reserve required
3. **Price Stability**: How price-stable the currency is against its reserves

## Potential Error Cases

1. **Currencies Not Found:**
   ```
   error code: -5
   error message:
   One or more currencies not found
   ```

2. **Invalid Slippage:**
   ```
   error code: -8
   error message:
   Slippage must be between 0 and 0.5 (50%)
   ```

3. **Invalid Target Price:**
   ```
   error code: -8
   error message:
   Target price must be positive
   ```

4. **No Converters Available:**
   ```
   error code: 0
   error message:
   No converters found for the specified currencies
   ```

5. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Automated Trading**: Find the best conversion paths for automated trading systems
2. **Trading User Interfaces**: Power conversion options in wallet or exchange UIs
3. **Arbitrage Detection**: Identify arbitrage opportunities between different converters
4. **DeFi Applications**: Build decentralized finance applications on top of the Verus DeFi system
5. **Routing Optimization**: Find optimal routes for complex multi-currency conversions

## Related Commands

- `estimateconversion` - Estimate a specific conversion between currencies
- `sendcurrency` - Execute currency conversions
- `getcurrency` - Get detailed information about a currency
- `getcurrencystate` - Get the current state of a currency, including reserves and supply

## References
For more detailed information on currency converters and the Verus DeFi system, refer to the Verus documentation on fractional currencies, liquidity pools, and cross-chain conversions.
