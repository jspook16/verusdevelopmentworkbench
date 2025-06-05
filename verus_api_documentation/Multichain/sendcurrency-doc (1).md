# Verus RPC Command: sendcurrency

## Purpose
The `sendcurrency` command facilitates the transfer of one or multiple Verus outputs to one or multiple addresses across the same or different chains. This versatile command supports currency transfers, conversions between currencies, cross-chain transactions, and specialized operations like preconversions and token burning.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, VRSCTEST, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password

## Description
The `sendcurrency` command enables comprehensive currency operations within the Verus ecosystem. It automatically sources funds from the current wallet, which must be present. If a specific "fromaddress" is provided, all funds will be taken from that address; otherwise, funds may come from any source set of UTXOs controlled by the wallet.

This command is central to Verus's multicurrency capabilities, enabling not just simple transfers but also:
- Converting between currencies (e.g., from native chain currency to fractional currencies)
- Cross-chain transfers via PBaaS bridges
- Preconversions to new currencies before they are active
- Minting new centralized currencies
- Burning tokens to reduce supply
- Including memo data with transactions

**Command Type**: Currency Transaction  
**Protocol Level**: PBaaS  
**Access Requirement**: Active wallet with funds

## Arguments

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fromaddress` | string | Required | | The Sapling, VerusID, or wildcard address to send funds from. "*", "R*", or "i*" are valid wildcards |
| `outputs` | array | Required | | An array of JSON objects representing currencies, amounts, and destinations |
| » `currency` | string | Required | Native chain currency | Name of the source currency to send in this output |
| » `amount` | numeric | Required | | The numeric amount of currency, denominated in source currency |
| » `convertto` | string | Optional | | Valid currency to convert to, either a reserve of a fractional, or fractional |
| » `addconversionfees` | boolean | Optional | false | Calculate additional conversion fees to convert the full amount specified after fees |
| » `exportto` | string | Optional | | Valid chain or system name or ID to export to |
| » `exportid` | boolean | Optional | false | If cross-chain export, export the full ID to the destination chain (will cost to export) |
| » `exportcurrency` | boolean | Optional | false | If cross-chain export, export the currency definition (will cost to export) |
| » `feecurrency` | string | Optional | | Valid currency that should be pulled from the current wallet and used to pay fee |
| » `via` | string | Optional | | If source and destination currency are reserves, via is a common fractional to convert through |
| » `address` | string | Required | | The address and optionally chain/system after the "@" as a system specific destination |
| » `refundto` | string | Optional | fromaddress | For pre-conversions, this is where refunds will go |
| » `memo` | string | Optional | | If destination is a zaddr, a string message to include |
| » `data` | object | Optional | | For data-only outputs with no other function, stores large, optionally signed data in one or more outputs |
| » `preconvert` | boolean | Optional | false | Convert to currency at market price, only works if transaction is mined before start of currency |
| » `burn` | boolean | Optional | false | Destroy the currency and subtract it from the supply (currency must be a token) |
| » `mintnew` | boolean | Optional | false | If the transaction is sent from the currency ID of a centralized currency, this creates new currency to send |
| `minconf` | numeric | Optional | 1 | Only use funds confirmed at least this many times |
| `feeamount` | numeric | Optional | | Specific fee amount requested instead of default miner's fee |
| `returntxtemplate` | boolean | Optional | false | If true, returns transaction template instead of submitting transaction |

## Results

The command returns different outputs based on the `returntxtemplate` parameter:

If `returntxtemplate` is false (default):
```json
{
  "operation-id": "opid"  // The operation id (string)
}
```

If `returntxtemplate` is true:
```json
{
  "outputtotals": {
    // Currency value map showing total outputs for each currency
  },
  "hextx": "hexstring"  // The transaction with all specified outputs and no inputs
}
```

## Examples

### Example 1: Converting VRSCTEST to basket currency

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "*" '[{
  "address":"bob@",
  "amount":10,
  "convertto":"VRSC-BTC"
}]'
```

This command converts VRSCTEST to the VRSC-BTC basket currency, with bob@ as the recipient.

### Example 2: Converting VRSCTEST to BTC via basket currency

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "*" '[{
  "address":"bob@",
  "amount":10,
  "convertto":"BTC",
  "via":"VRSC-BTC"
}]'
```

This command converts VRSCTEST to BTC through the VRSC-BTC basket currency.

### Example 3: Preconverting to a new currency

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "*" '[{
  "address":"alice@",
  "amount":10,
  "convertto":"NEWCOIN",
  "preconvert":true,
  "refundto":"alice@"
}]'
```

This command performs a preconversion to NEWCOIN (before it's active), with refunds directed to alice@.

### Example 4: Converting VRSCTEST cross-chain to PBaaS-chain

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "*" '[{
  "address":"PXXIm4jGqi7yam9zXtkERwbvCrDWGZuv",
  "amount":10,
  "convertto":"PBaaSChain",
  "exportto":"Bridge.PBaaSChain",
  "via":"Bridge.PBaaSChain"
}]'
```

This command converts VRSCTEST to PBaaSChain via a bridge.

### Example 5: Converting PBaaS-chain to VRSCTEST

**Command:**
```
./verus -chain=PBaaSChain sendcurrency "*" '[{
  "address":"PXXIm4jGqi7yam9zXtkERwbvCrDWGZuv",
  "amount":10,
  "convertto":"VRSCTEST",
  "exportto":"VRSCTEST",
  "via":"Bridge.PBaaSChain"
}]'
```

This command converts from PBaaSChain back to VRSCTEST.

### Example 6: Sending VRSCTEST from a single address to a single recipient

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "bob@" '[{
  "currency":"vrsctest",
  "address":"alice@",
  "amount":10
}]'
```

This command sends 10 VRSCTEST from bob@ to alice@.

### Example 7: Sending VRSCTEST from all private wallet funds to two recipients

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "*" '[{
  "currency":"vrsctest",
  "address":"alice@:private",
  "amount":10
},
{
  "currency":"VRSCTEST",
  "address":"bob@:private",
  "amount":10
}]'
```

This command sends VRSCTEST to two recipients with friendly-name z-addresses.

### Example 8: Sending VRSCTEST cross-chain to PBaaSChain

**Command:**
```
./verus -chain=VRSCTEST sendcurrency "*" '[{
  "address":"PXXIm4jGqi7yam9zXtkERwbvCrDWGZuv",
  "amount":10,
  "exportto":"Bridge.PBaaSChain"
}]'
```

This command sends VRSCTEST cross-chain to PBaaSChain.

### Example 9: Using curl to send currency

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "sendcurrency", "params": ["bob@", [{"currency":"btc", "address":"alice@quad", "amount":500.0}]] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

This command uses curl to send 500 BTC from bob@ to alice@quad.

## Technical Details

### Transaction Types

The `sendcurrency` command can create several types of transactions:

1. **Simple Transfer**: Direct transfer of currency from one address to another
2. **Currency Conversion**: Convert one currency to another within the same chain
3. **Cross-Chain Transfer**: Send currency between different blockchains
4. **Preconversion**: Convert to a currency that isn't active yet
5. **Token Operations**: Burn tokens or mint new centralized currencies

### Address Types

Addresses in the `sendcurrency` command can be specified in several formats:

1. **VerusID**: Human-readable identities (e.g., "alice@", "bob@")
2. **Z-addresses**: Private addresses for shielded transactions
3. **R-addresses**: Transparent addresses
4. **I-addresses**: Identity addresses
5. **Wildcards**: Use "*", "R*", or "i*" to select from all addresses of a certain type

### Conversion Paths

When converting between currencies, the path can be:

1. **Direct**: Convert directly between two currencies
2. **Via Fractional**: Use a fractional currency as an intermediary (using the `via` parameter)
3. **Cross-Chain**: Convert and bridge to another blockchain

## Potential Error Cases

1. **Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

2. **Invalid Address:**
   ```
   error code: -5
   error message:
   Invalid address or identity
   ```

3. **Invalid Amount:**
   ```
   error code: -3
   error message:
   Amount out of range
   ```

4. **Currency Not Found:**
   ```
   error code: -4
   error message:
   Currency not found
   ```

5. **Invalid Conversion:**
   ```
   error code: -7
   error message:
   Invalid conversion parameters
   ```

6. **Transaction Rejected:**
   ```
   error code: -26
   error message:
   Transaction rejected by network rules
   ```

## Security Considerations

1. **Cross-Chain Security**: When performing cross-chain operations, ensure the destination chain is valid and trusted
2. **Preconversion Risks**: Preconversions are speculative and may not result in receiving the expected currency if the launch fails
3. **Address Verification**: Always double-check destination addresses, especially when using friendly names (@)
4. **Minting Controls**: The `mintnew` parameter should only be used by currency controllers with proper authorization
5. **Burn Verification**: Once burned, tokens cannot be recovered, so verify burn transactions carefully
6. **Private Transaction Considerations**: When using z-addresses, understand the privacy implications and memo field usage
7. **Fee Currency Selection**: When specifying a `feecurrency`, ensure sufficient balance in that currency

## Use Cases

1. **Cross-Chain Transfers**: Move value between PBaaS chains in the Verus ecosystem
2. **Cryptocurrency Exchange**: Convert between different currencies in the same transaction
3. **Private Transactions**: Use z-addresses for enhanced privacy
4. **Pre-Launch Investments**: Preconvert to new currencies before they launch
5. **Token Management**: Burn tokens to reduce supply or mint new tokens in centralized currencies
6. **DeFi Operations**: Participate in decentralized finance by converting between reserves and fractional currencies
7. **Multiparty Payments**: Send to multiple recipients in a single transaction
8. **Cross-Currency Payments**: Pay in one currency while the recipient receives another

## Related Commands

- `getcurrency` - Get detailed information about a currency
- `listcurrencies` - List all currencies on the blockchain
- `getcurrencyconverters` - Find currencies that can convert between others
- `estimateconversion` - Estimate conversion between currencies
- `z_sendmany` - Send multiple private transactions
- `sendtoaddress` - Simple currency transfer
- `getbalance` - Check balances for specific currencies
- `getnewaddress` - Generate a new address for receiving funds

## References
For more detailed information on the `sendcurrency` command and related functionality, refer to the Verus documentation on:
- [PBaaS (Public Blockchains as a Service)](https://docs.verus.io/tech/pbaas)
- [Multi-currency Support](https://docs.verus.io/tech/currencies)
- [Identity System](https://docs.verus.io/tech/verusid)
- [Cross-Chain Operations](https://docs.verus.io/tech/bridges)
