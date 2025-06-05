# Verus RPC Command: getreservedeposits

## Purpose
The `getreservedeposits` command returns all deposits under control of the specified currency or chain. This command is essential for monitoring and auditing the reserves that back fractional reserve currencies in the Verus ecosystem.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (required for reserve deposit tracking)

## Description
The `getreservedeposits` command allows users to query all deposits that are under the control of a specific currency or chain. In the Verus ecosystem, fractional reserve currencies are backed by deposits of other currencies, and this command provides transparency into those reserves.

For external systems or chains, all deposits will be under the control of that system or chain only, not its independent currencies. The command can optionally return detailed UTXO (Unspent Transaction Output) information for each deposit in addition to the total values by currency.

This information is valuable for verifying the backing of fractional reserve currencies, auditing reserve levels, and ensuring the proper functioning of the currency system.

**Command Type**: Currency Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currencyname` | string | Yes | | Full name or i-ID of controlling currency |
| `returnutxos` | boolean | Optional | false | If true, returns a UTXO list and currency values on each |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `utxos` | object or null | If returnutxos is true, contains UTXO and currency values, otherwise null |
| `[currency 1 i-address]` | number | Total value of deposits in currency 1 |
| `[currency 2 i-address]` | number | Total value of deposits in currency 2 |
| ... | ... | Additional currencies as applicable |

## Examples

### Example 1: Get reserve deposits for a currency without UTXOs

**Command:**
```
verus getreservedeposits "MYFRACTIONAL"
```

**Potential Output:**
```json
{
  "utxos": null,
  "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 100000.0,
  "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2": 1.0
}
```

### Example 2: Get reserve deposits with UTXO details

**Command:**
```
verus getreservedeposits "MYFRACTIONAL" true
```

**Potential Output:**
```json
{
  "utxos": {
    "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t-1": {
      "txid": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      "vout": 1,
      "amount": 50000.0,
      "currency": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "scriptPubKey": "76a914abcdef0123456789abcdef0123456789abcdef88ac",
      "redeemScript": "",
      "spendable": false
    },
    "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0-0": {
      "txid": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      "vout": 0,
      "amount": 50000.0,
      "currency": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "scriptPubKey": "76a914fedcba9876543210fedcba9876543210fedc88ac",
      "redeemScript": "",
      "spendable": false
    },
    "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1-2": {
      "txid": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1",
      "vout": 2,
      "amount": 1.0,
      "currency": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
      "scriptPubKey": "76a9140123456789abcdef0123456789abcdef012388ac",
      "redeemScript": "",
      "spendable": false
    }
  },
  "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": 100000.0,
  "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2": 1.0
}
```

### Example 3: Get reserve deposits for a system

**Command:**
```
verus getreservedeposits "MYCHAIN"
```

### Example 4: Using curl to get reserve deposits

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getreservedeposits", "params": ["currencyname"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Reserve System

In the Verus ecosystem, fractional reserve currencies operate on a reserve system:

1. **Reserve Deposits**: Deposits of other currencies that back a fractional currency
2. **Reserve Ratio**: The portion of a currency that is backed by reserves (e.g., 50%)
3. **Controlling Currency**: The currency or chain that controls the reserves
4. **UTXO Management**: Reserves are managed as UTXOs for security and transparency

This system provides liquidity, stability, and convertibility for currencies in the ecosystem.

### Deposit Control

Deposits can be controlled by:

1. **Fractional Currencies**: Individual fractional reserve currencies control their own reserves
2. **External Systems**: For external systems, all deposits are under system control, not individual currencies
3. **Conversion Mechanisms**: Automated mechanisms convert between reserves and fractional currencies
4. **Protocol Rules**: Protocol-level rules ensure proper reserve management

### UTXO Details

When `returnutxos` is set to true, the command provides detailed information about each UTXO:

1. **Transaction ID**: The transaction that created the UTXO
2. **Output Index**: The index of the output in the transaction
3. **Amount**: The amount of the currency
4. **Currency**: The currency of the UTXO
5. **Script Details**: Information about the locking scripts
6. **Spendability**: Whether the UTXO can be spent (typically false for reserves)

This detailed information can be valuable for auditing and troubleshooting.

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

1. **Reserve Auditing**: Verify the reserves backing a fractional currency
2. **Currency Analysis**: Analyze the composition of reserves for a currency
3. **System Monitoring**: Monitor the deposits controlled by a system or chain
4. **Transparency Reporting**: Generate reports on reserve holdings for transparency
5. **Conversion Calculations**: Gather data for calculating conversion rates and potentials

## Related Commands

- `getcurrency` - Get detailed information about a currency
- `getcurrencystate` - Get the current state of a currency, including reserve ratio
- `estimateconversion` - Estimate conversion between currencies
- `listcurrencies` - List all currencies on the blockchain
- `getcurrencyconverters` - Find currencies that can convert between others

## References
For more detailed information on the reserve system in the Verus ecosystem, refer to the Verus documentation on fractional reserve currencies, DeFi, and the multi-currency architecture.
