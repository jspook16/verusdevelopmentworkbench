# Verus RPC Command: estimateconversion

## Purpose
The `estimateconversion` command is designed to estimate the result of converting from one currency to another within the Verus ecosystem. It provides information about conversion rates, fees, slippage, and the estimated output amount, taking into account pending conversions and the current state of the currencies involved.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (recommended for all currency operations)

## Description
The `estimateconversion` command allows users to estimate how much of a destination currency they would receive when converting from a source currency. This is particularly useful in Verus's fractional reserve currency system, where currencies can be converted between each other according to their relative weights and reserves.

The command takes into account the current state of the currencies, including pending conversions, fees, and potential slippage, to provide an accurate estimate of the conversion outcome. It can process either a single conversion request or an array of multiple conversion requests using one basket.

**Command Type**: Currency Management  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts either a single JSON object or an array of such objects:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currency` | string | Required | | Name of the source currency to send in this output, defaults to native of chain |
| `amount` | number | Required | | The numeric amount of currency, denominated in source currency |
| `convertto` | string | Optional | | Valid currency to convert to, either a reserve of a fractional, or fractional |
| `preconvert` | boolean | Optional | false | Convert to currency at market price (default=false), only works if transaction is mined before start of currency |
| `via` | string | Optional | | If source and destination currency are reserves, via is a common fractional to convert through |

## Results
The command returns a JSON object with the following structure (if parameters were an array, the first four return values are returned 1:1 for objects passed in an array named "conversions"):

| Property | Type | Description |
|----------|------|-------------|
| `inputcurrencyid` | string | i-address of source currency |
| `netinputamount` | number | Net amount in, after conversion fees in source currency |
| `outputcurrencyid` | string | i-address of destination currency |
| `estimatedcurrencyout` | number | Estimated amount out in destination currency |
| `estimatedcurrencystate` | object | Estimation of all currency values, including prices and changes |

## Examples

### Example 1: Estimate a simple conversion

**Command:**
```
verus estimateconversion '{"currency":"VRSC", "convertto":"MYTOKEN", "amount":100}'
```

**Potential Output:**
```json
{
  "inputcurrencyid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "netinputamount": 99.9,
  "outputcurrencyid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
  "estimatedcurrencyout": 198.5,
  "estimatedcurrencystate": {
    "reserves": {
      "VRSC": 5000.0
    },
    "supply": 10000.0,
    "primarycurrencyprice": 0.5,
    "primarycurrencyconversionfee": 0.025,
    "primarycurrencytransactionfee": 0.0001
  }
}
```

### Example 2: Estimate a conversion through a fractional currency

**Command:**
```
verus estimateconversion '{"currency":"BTC", "convertto":"ETH", "via":"MYFRACTIONAL", "amount":0.1}'
```

### Example 3: Estimate a pre-conversion for a launching currency

**Command:**
```
verus estimateconversion '{"currency":"VRSC", "convertto":"NEWCURRENCY", "amount":1000, "preconvert":true}'
```

### Example 4: Using curl to estimate a conversion

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "estimateconversion", "params": ['{"currency":"name","convertto":"name","amount":n}'] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Conversion Process

In the Verus ecosystem, currency conversions can happen in several ways:

1. **Direct Conversion**: Between a fractional currency and one of its reserves
2. **Via Conversion**: Between two reserve currencies through a common fractional currency
3. **Pre-conversion**: Contributing to a currency that has not yet launched
4. **Cross-Chain Conversion**: Converting between currencies on different chains

The estimation process calculates the expected output based on the current reserves, supply, and other factors affecting the conversion rate.

### Fee Structure

Conversions in the Verus ecosystem involve several types of fees:

1. **Conversion Fee**: A percentage of the conversion amount, typically 0.025% to 0.05%
2. **Transaction Fee**: A small fixed fee for processing the transaction
3. **Network Fee**: Standard network transaction fees
4. **Slippage**: Not a fee, but the price impact caused by the conversion itself

These fees are all considered when estimating the conversion output.

### Currency State Calculation

The `estimatedcurrencystate` object returned by the command provides a snapshot of how the conversion would affect the currency's state, including:

1. **Reserves**: The amount of each reserve currency backing the fractional currency
2. **Supply**: The total supply of the fractional currency
3. **Price**: The price of the fractional currency in terms of its reserves
4. **Fees**: The applicable conversion and transaction fees

This information can be valuable for making informed trading decisions.

## Potential Error Cases

1. **Currency Not Found:**
   ```
   error code: -5
   error message:
   Currency 'name' not found
   ```

2. **Invalid Conversion Path:**
   ```
   error code: -5
   error message:
   Invalid conversion path - no conversion possible between currencies
   ```

3. **Invalid Amount:**
   ```
   error code: -8
   error message:
   Amount must be positive
   ```

4. **Invalid Parameters:**
   ```
   error code: -8
   error message:
   Missing required parameters
   ```

5. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Currency Trading**: Estimate the outcome of currency conversions before executing them
2. **Arbitrage Calculation**: Identify profitable arbitrage opportunities between currencies
3. **DeFi Applications**: Build decentralized financial applications that utilize the conversion mechanism
4. **Pre-launch Contributions**: Estimate the value of contributing to a currency before it launches
5. **Price Impact Analysis**: Understand how a large conversion would impact currency prices

## Related Commands

- `sendcurrency` - Used to execute the actual conversion after estimation
- `getcurrency` - Get detailed information about a currency
- `getcurrencystate` - Get the current state of a currency
- `getcurrencyconverters` - Find currencies that can be used for conversions

## References
For more detailed information on the currency conversion process, refer to the Verus documentation on DeFi capabilities and fractional reserve currencies.
