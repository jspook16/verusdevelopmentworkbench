# Verus RPC Command: getaddressbalance

## Purpose
The `getaddressbalance` command returns the balance for one or more addresses. This command is particularly useful for tracking funds across multiple addresses or monitoring specific addresses without needing to import them into a wallet.

## Daemon Requirements
- The daemon must be started with the `-addressindex=1` parameter to enable address indexing

## Description
When provided with one or more addresses, this command retrieves the current balance and total amount received for those addresses from the blockchain. The balance represents the current unspent amount, while the received amount includes all funds ever received by the address, including those that have been spent.

**Command Type**: Query/Read-only  
**Protocol Level**: Address Index  
**Access Requirement**: Requires addressindex to be enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| addresses | array | Yes | N/A | Array of base58check encoded addresses to query |
| friendlynames | boolean | No | false | Include additional array of friendly names keyed by currency i-addresses |

## Results
The command returns a JSON object containing the following information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| balance | number | The current balance in satoshis |
| received | number | The total number of satoshis received (including change) |

## Examples

### Example 1: Get balance for a single address

**Command:**
```
verus getaddressbalance '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}'
```

**Sample Output:**
```json
{
  "balance": 1000000000,
  "received": 1500000000
}
```

### Example 2: Get balance for multiple addresses with friendly names

**Command:**
```
verus getaddressbalance '{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87", "REbnDdUxFUx1g4HBU9gwmQR5ga1ZzDiM9b"], "friendlynames": true}'
```

**Sample Output:**
```json
{
  "balance": 2500000000,
  "received": 5000000000,
  "friendlynames": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": "VRSC",
    "iKYR95AHNwokT3qJ2L3JFgXJ6zaBHr4c4T": "SPLITTEST"
  }
}
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddressbalance", "params": [{"addresses": ["RY5LccmGiX9bUHYGtSWQouNy1yFhc5rM87"]}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "balance": 1000000000,
    "received": 1500000000
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Address Index Not Enabled:**
   ```
   error code: -1
   error message:
   Address index not enabled
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid address format
   ```

3. **Potential Error - Missing Required Parameter:**
   ```
   error code: -8
   error message:
   No addresses provided
   ```

4. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Addresses is expected to be an array
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `getaddressdeltas`: Returns all changes for an address
- `getaddressmempool`: Returns all mempool deltas for an address
- `getaddresstxids`: Returns the txids for an address(es)
- `getaddressutxos`: Returns all unspent outputs for an address
