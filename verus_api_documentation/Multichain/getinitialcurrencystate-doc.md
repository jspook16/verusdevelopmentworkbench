# Verus RPC Command: getinitialcurrencystate

## Purpose
The `getinitialcurrencystate` command returns the total amount of preconversions that have been confirmed on the blockchain for a specified PBaaS chain. This command is primarily used to get information about chains that are not the current chain but are being launched by it.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (recommended for currency state operations)

## Description
The `getinitialcurrencystate` command allows users to query the initial state of a currency that is in the prelaunch phase. When a new PBaaS chain or currency is defined, it typically goes through a prelaunch phase where users can contribute various currencies that will be converted into the new currency upon launch. This command provides detailed information about the preconversions and the initial state the currency will have when it launches.

This information is valuable for tracking the progress of a launching currency, understanding its initial parameters, and making informed decisions about contributing to preconversions.

**Command Type**: Currency Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single required parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name or chain ID of the chain to get the initial currency state for |

## Results
The command returns an array containing a single object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `flags` | integer | Bitflags indicating currency properties |
| `initialratio` | number | Initial reserve ratio at launch |
| `initialsupply` | number | Initial supply at launch |
| `emitted` | number | Total amount emitted by the protocol |
| `supply` | number | Current circulating supply |
| `reserve` | number | Current reserve amounts (for fractional currencies) |
| `currentratio` | number | Current reserve ratio (for fractional currencies) |

## Examples

### Example 1: Get the initial currency state for a PBaaS chain

**Command:**
```
verus getinitialcurrencystate "MYCHAIN"
```

**Potential Output:**
```json
[
  {
    "flags": 257,
    "initialratio": 0.5,
    "initialsupply": 1000000,
    "emitted": 0,
    "supply": 1000000,
    "reserve": 500000,
    "currentratio": 0.5
  }
]
```

### Example 2: Get the initial currency state using a currency ID

**Command:**
```
verus getinitialcurrencystate "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2"
```

### Example 3: Using curl to get the initial currency state

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinitialcurrencystate", "params": [name] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

### Preconversion Process

For currencies that enable preconversions, the process typically works as follows:

1. **Currency Definition**: A new currency is defined with parameters for preconversions
2. **Preconversion Period**: Users can convert existing currencies into the new currency before launch
3. **Minimum Requirements**: The currency can only launch if minimum preconversion requirements are met
4. **Launch**: At the specified start block, the currency launches with the accumulated preconversions
5. **Initial State**: The state at launch is determined by the preconversions and the currency parameters

The `getinitialcurrencystate` command shows what the state will be (or was) at launch based on the current preconversions.

### Reserve Ratio

For fractional reserve currencies, the `initialratio` and `currentratio` fields indicate the portion of the currency that is backed by reserves:

1. **Initial Ratio**: The ratio at launch, determined by the preconversions and currency definition
2. **Current Ratio**: The ratio after launch, which may change based on conversions and emissions

A ratio of 1.0 (100%) means the currency is fully backed, while lower ratios indicate partial backing.

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

3. **Not a Prelaunch Currency:**
   ```
   error code: -5
   error message:
   Currency is not in prelaunch state
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Prelaunch Monitoring**: Track the progress of a currency during its prelaunch phase
2. **Contribution Planning**: Make informed decisions about contributing to preconversions
3. **Launch Verification**: Verify that a currency launched with the expected initial state
4. **Market Analysis**: Understand the initial distribution and backing of a currency
5. **DeFi Applications**: Build applications that utilize prelaunch currency data

## Related Commands

- `getcurrency` - Get detailed information about a currency
- `getcurrencystate` - Get the current state of a currency
- `estimateconversion` - Estimate conversion between currencies, including preconversions
- `listcurrencies` - List all currencies on the blockchain
- `sendcurrency` - Send currency, including for preconversions

## References
For more detailed information on currency launching and preconversions in the Verus ecosystem, refer to the Verus documentation on PBaaS, fractional currencies, and currency creation.
