# Verus RPC Command: getcurrencytrust

## Purpose
The `getcurrencytrust` command retrieves trust ratings assigned to currencies in the Verus ecosystem. These ratings influence whether and how a node synchronizes with other currencies and chains, providing a decentralized mechanism for security and trust management.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain to operate on (e.g., VRSC, vrsctest, or your PBaaS chain)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password

## Description
The `getcurrencytrust` command allows users to query the trust ratings assigned to specified currencies or all currencies known to the node. Trust ratings in Verus are used to determine how a node interacts with different currencies in the multi-chain ecosystem, particularly regarding synchronization and cross-chain operations.

The command returns both the specific ratings for each currency and the global trust mode setting for the node. These trust settings enable nodes to protect themselves from potentially malicious chains while maintaining interoperability with trusted chains in the ecosystem.

**Command Type**: System Information  
**Protocol Level**: PBaaS  
**Access Requirement**: Basic node access

## Arguments
The command accepts an optional parameter:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `currencyids` | array | Optional | All currencies | If specified, only returns rating values for the listed currencies, otherwise returns ratings for all currencies |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `setratings` | object | An ID/ratings key/value object mapping currency IDs to their trust ratings |
| `currencytrustmode` | integer | The global trust mode setting for the node (0 = no restriction on sync, 1 = only sync to IDs rated approved, 2 = sync to all IDs but those on block list) |

## Examples

### Example 1: Get trust ratings for all currencies

**Command:**
```
verus getcurrencytrust
```

**Potential Output:**
```json
{
  "setratings": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": {
      "rating": 1,
      "lastupdate": 1620000000
    },
    "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2": {
      "rating": 0,
      "lastupdate": 1620001000
    },
    "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c": {
      "rating": -1,
      "lastupdate": 1620002000
    }
  },
  "currencytrustmode": 1
}
```

### Example 2: Get trust ratings for specific currencies

**Command:**
```
verus getcurrencytrust '["iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2"]'
```

**Potential Output:**
```json
{
  "setratings": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": {
      "rating": 1,
      "lastupdate": 1620000000
    },
    "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2": {
      "rating": 0,
      "lastupdate": 1620001000
    }
  },
  "currencytrustmode": 1
}
```

### Example 3: Using curl to get currency trust ratings

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getcurrencytrust", "params": ['["currencyid",...]'] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Rating Values

Currency trust ratings can have the following values:

| Rating | Description |
|--------|-------------|
| 1 | Approved - The currency is trusted and will be synchronized |
| 0 | Neutral - The currency has no specific trust setting (default) |
| -1 | Blocked - The currency is not trusted and will not be synchronized |

### Trust Modes

The `currencytrustmode` setting determines the global behavior for currency synchronization:

| Mode | Description |
|------|-------------|
| 0 | No restrictions - Synchronize with all currencies regardless of ratings |
| 1 | Whitelist only - Only synchronize with currencies rated as approved (1) |
| 2 | Blacklist - Synchronize with all currencies except those explicitly blocked (-1) |

### Rating Updates

Each rating includes a `lastupdate` timestamp indicating when the rating was last modified. This allows users to track changes to trust settings over time.

## Potential Error Cases

1. **Currency Not Found:**
   ```
   error code: -5
   error message:
   One or more currencies not found
   ```

2. **Invalid Currency ID:**
   ```
   error code: -8
   error message:
   Invalid currency ID format
   ```

3. **Permission Denied:**
   ```
   error code: -1
   error message:
   Insufficient privileges to access trust settings
   ```

4. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Network Security**: Protect nodes from interacting with potentially malicious chains
2. **Trust Management**: Maintain a list of trusted and untrusted currencies
3. **Cross-Chain Operations**: Control which chains can participate in cross-chain transactions
4. **Resource Optimization**: Limit synchronization to only necessary and trusted chains
5. **Ecosystem Governance**: Participate in the decentralized governance of the Verus ecosystem

## Related Commands

- `setcurrencytrust` - Set trust ratings for currencies
- `listcurrencies` - List all currencies on the blockchain
- `getcurrency` - Get detailed information about a currency
- `getnotarizationdata` - Get notarization data for cross-chain verification

## References
For more detailed information on currency trust management in the Verus ecosystem, refer to the Verus documentation on cross-chain security, trust mechanisms, and PBaaS operations.
