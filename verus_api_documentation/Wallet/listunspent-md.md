# Verus RPC Command: listunspent

## Purpose
The `listunspent` command returns a detailed array of all unspent transaction outputs (UTXOs) in the wallet, representing funds available for spending. This command is fundamental for advanced coin management, transaction fee optimization, privacy considerations, and precise control over which funds are used in transactions. It provides visibility into the raw financial components that make up a wallet's spendable balance, enabling sophisticated transaction strategies.

## Description
When executed with the appropriate parameters, this command queries the wallet database and returns comprehensive information about each unspent output, including the transaction ID, output index, receiving address, script details, amount, confirmation status, and spendability. Each UTXO represents a discrete piece of cryptocurrency that can be used as an input in a new transaction. The command offers flexible filtering capabilities through the minconf and maxconf parameters, allowing users to select outputs with specific confirmation levels (from newly received to thoroughly confirmed). It also supports filtering by specific addresses, enabling targeted UTXO management for accounts or purposes. Additionally, the includeshared parameter determines whether to include UTXOs that are potentially spendable by other parties (such as in multisignature arrangements). This granular control is essential for advanced wallet operations such as coin selection strategies, fee optimization, maintaining privacy through UTXO management, and handling complex transaction scenarios.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts four optional arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| minconf | numeric | No | 1 | The minimum confirmations to filter |
| maxconf | numeric | No | 9999999 | The maximum confirmations to filter |
| addresses | string array | No | [] | A json array of VRSCTEST addresses to filter |
| includeshared | boolean | No | false | Include outputs that can also be spent by others |

## Results
The command returns an array of objects, each representing an unspent transaction output.

**Return Type**: Array of objects

## Examples

### Example 1: List all unspent transaction outputs with default parameters

**Command:**
```
verus listunspent
```

**Sample Output:**
```
[
  {
    "txid": "f2b268d04843c91cc0a0f65f804aa40e0e62513850550f906729b01e953c28a0",
    "vout": 0,
    "generated": false,
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "account": "",
    "scriptPubKey": "76a914d06560d2b9744f2eb9cf0f916f1d0bb5af7d148d88ac",
    "amount": 10.00000000,
    "confirmations": 65,
    "spendable": true
  },
  {
    "txid": "c6a9a6154c369f0e563d4b1f728fae5448d0893f553ac527d050b0293f317a7d",
    "vout": 1,
    "generated": true,
    "address": "RBgD7GkNsNR7zDcaZFuq5JrkxJ1DYcDMUv",
    "account": "mining",
    "scriptPubKey": "76a914a245eddc1d0c7288589605a4c3225fe6959d57a488ac",
    "amount": 2.50000000,
    "confirmations": 12,
    "redeemScript": "522103ede722b146bd97fbe8e0fd3cfa7a0db2811a1a20a29649618dab622a0f8fe7821037b9f0643080cb767286b9630826895bc2539f2dc38323b85a7eb4a4ba71732e2210260edf54233c1119eaccd6cce89830c50a6061c29186ef75e4f13d9ca85cc72bc53ae",
    "spendable": true
  }
]
```

### Example 2: List unspent outputs with 6 to 9999999 confirmations for specific addresses

**Command:**
```
verus listunspent 6 9999999 "[\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\",\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\"]"
```

**Sample Output:**
```
[
  {
    "txid": "f2b268d04843c91cc0a0f65f804aa40e0e62513850550f906729b01e953c28a0",
    "vout": 0,
    "generated": false,
    "address": "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV",
    "account": "",
    "scriptPubKey": "76a914d06560d2b9744f2eb9cf0f916f1d0bb5af7d148d88ac",
    "amount": 10.00000000,
    "confirmations": 65,
    "spendable": true
  }
]
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listunspent", "params": [6, 9999999 "[\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\",\"RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV\"]"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Confirmation Parameter:**
   ```
   error code: -8
   error message:
   Invalid minconf parameter, must be a non-negative integer
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid address format in addresses filter
   ```

3. **Potential Error - JSON Parse Error:**
   ```
   error code: -8
   error message:
   Invalid addresses parameter, expected array
   ```

4. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
The `account` field is deprecated and included only for backward compatibility. The `generated` field indicates whether the UTXO was created from mining/staking rewards. The `spendable` field indicates whether the wallet has the necessary private keys to spend this output. For multisignature addresses, the `redeemScript` field provides the script needed to spend the output. This command only shows transparent address UTXOs; for shielded value, consider using z-address specific commands.

## Related Commands
- `lockunspent`: Updates list of temporarily unspendable outputs
- `listlockunspent`: Returns list of temporarily unspendable outputs
- `createrawtransaction`: Creates a transaction spending the given inputs
- `sendrawtransaction`: Submits a raw transaction to the network
- `fundrawtransaction`: Adds inputs to a transaction until it has enough value to meet its out value