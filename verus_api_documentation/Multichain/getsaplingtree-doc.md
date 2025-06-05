# Verus RPC Command: getsaplingtree

## Purpose
The `getsaplingtree` command returns the entries for a light wallet Sapling tree state. This command is important for applications that need to interact with Verus's privacy features based on the Sapling protocol.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (recommended for Sapling operations)

## Description
The `getsaplingtree` command allows users to retrieve the state of the Sapling Merkle tree at a specific height or range of heights. The Sapling protocol is a privacy-focused upgrade that enables shielded transactions, which protect transaction amounts and addresses. The Sapling Merkle tree is a cryptographic data structure that efficiently stores commitments to these shielded transactions.

This command is particularly useful for light wallets and applications that need to validate shielded transactions without downloading the entire blockchain. It provides the essential cryptographic data needed to verify the validity of shielded transactions and compute new note positions.

**Command Type**: Privacy Information  
**Protocol Level**: Sapling  
**Access Requirement**: Basic node access

## Arguments
The command accepts a flexible parameter format:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `n` or `m,n` or `m,n,o` | integer or string | Optional | Latest height | Block height or range specification where:<br>- `n`: A single block height<br>- `m,n`: A range from height `m` to height `n` (inclusive)<br>- `m,n,o`: A range from height `m` to height `n` with step interval `o`<br>If not specified, the latest tree state and height is returned |

## Results
The command returns an array of Sapling tree state objects, each with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `network` | string | Network identifier (e.g., "VRSC") |
| `height` | integer | Block height of this tree state |
| `hash` | string | Block hash at this height |
| `time` | integer | Block timestamp |
| `tree` | string | Hex-encoded Sapling tree state |

## Examples

### Example 1: Get the latest Sapling tree state

**Command:**
```
verus getsaplingtree
```

**Potential Output:**
```json
[
  {
    "network": "VRSC",
    "height": 1500000,
    "hash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "time": 1620000000,
    "tree": "fe9c46f5a80a26f6b3263f0c2ebbb88fb3c8576fb2f1599de42d89d462d8f4..."
  }
]
```

### Example 2: Get the Sapling tree state at a specific height

**Command:**
```
verus getsaplingtree 1000000
```

### Example 3: Get Sapling tree states across a range of heights

**Command:**
```
verus getsaplingtree "1000000,1100000,10000"
```

**Potential Output:**
```json
[
  {
    "network": "VRSC",
    "height": 1000000,
    "hash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "time": 1610000000,
    "tree": "fe9c46f5a80a26f6b3263f0c2ebbb88fb3c8576fb2f1599de42d89d462d8f4..."
  },
  {
    "network": "VRSC",
    "height": 1010000,
    "hash": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    "time": 1611000000,
    "tree": "a80a26f6b3263f0c2ebbb88fb3c8576fb2f1599de42d89d462d8f4fe9c46f5a..."
  },
  ...
]
```

### Example 4: Using curl to get the Sapling tree state

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getsaplingtree", "params": [1000000] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Sapling Protocol

The Sapling protocol is a privacy-enhancing technology used in Verus and other Zcash-derived blockchains:

1. **Shielded Transactions**: Transactions that hide sender, receiver, and amount
2. **Zero-Knowledge Proofs**: Cryptographic proofs that validate transactions without revealing details
3. **Commitment Scheme**: System for creating cryptographic commitments to values
4. **Note Encryption**: Mechanism for encrypting transaction details

### Sapling Merkle Tree

The Sapling Merkle tree is a specialized data structure:

1. **Incremental Merkle Tree**: Efficiently updated as new shielded transactions are added
2. **Commitments**: Contains commitments to all shielded notes in the blockchain
3. **Root Hash**: The top-level hash summarizing the entire tree
4. **Position Tracking**: Enables efficient position tracking for note spending

### Light Wallet Support

The `getsaplingtree` command is particularly valuable for light wallets:

1. **Efficient Verification**: Allows verification of shielded transactions without full blockchain
2. **Tree State Synchronization**: Enables wallets to synchronize their local tree state
3. **Note Position Management**: Supports proper handling of note positions for spending
4. **Privacy Enhancement**: Maintains privacy while allowing efficient operation

## Potential Error Cases

1. **Invalid Height:**
   ```
   error code: -8
   error message:
   Invalid height parameter
   ```

2. **Height Out of Range:**
   ```
   error code: -8
   error message:
   Height exceeds current blockchain height
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

1. **Light Wallet Development**: Implement privacy-preserving light wallets
2. **Shielded Transaction Validation**: Validate shielded transactions efficiently
3. **Privacy-Focused Applications**: Build applications that utilize privacy features
4. **Blockchain Analysis**: Analyze the state of the shielded pool over time
5. **Synchronization**: Synchronize private addresses across devices

## Related Commands

- `z_sendmany` - Create a shielded transaction
- `z_listaddresses` - List shielded addresses
- `z_getbalance` - Get balance for a shielded address
- `z_viewtransaction` - Get detailed information about a shielded transaction
- `z_getoperationstatus` - Get status of shielded operations

## References
For more detailed information on the Sapling protocol and privacy features in Verus, refer to the Verus documentation on privacy, the Sapling protocol, and shielded transactions.
