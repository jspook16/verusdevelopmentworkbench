# Verus RPC Command: listopenoffers

## Purpose
The `listopenoffers` command shows all offers that are outstanding in the wallet. This command is useful for tracking and managing offers created from the wallet, providing a view of both active and expired offers.

## Description
When executed, this command lists all outstanding offers belonging to the wallet. By default, it shows both unexpired and expired offers, but these parameters can be adjusted to filter the results. This provides wallet owners with a comprehensive view of all their created offers.

**Command Type**: Query/Read-only  
**Protocol Level**: DeFi/Offers  
**Access Requirement**: Wallet with offers

## Arguments
The command accepts two optional boolean arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| unexpired | boolean | No | true | If true, list offers in the wallet which are not expired |
| expired | boolean | No | true | If true, list offers in the wallet which are expired |

## Results
The command returns a list of all open offers in the wallet, filtered by the expiration parameters.

**Return Type**: Array of Objects

The exact structure of the returned data is not specified in the limited documentation, but likely includes details such as offer value, expiration, and transaction information.

## Examples

### Example 1: List all open offers (default behavior)

**Command:**
```
verus listopenoffers
```

**Sample Output Format:**
```json
[
  {
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "currency": "VRSC",
      "amount": 100.0
    },
    "for": {
      "currency": "USD",
      "amount": 500.0
    },
    "expired": false,
    "expiration": 1234567
  },
  {
    "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "identity": "MyVerusID"
    },
    "for": {
      "currency": "VRSC",
      "amount": 5000.0
    },
    "expired": true,
    "expiration": 1230000
  }
]
```

### Example 2: List only unexpired offers

**Command:**
```
verus listopenoffers true false
```

**Sample Output Format:**
```json
[
  {
    "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "currency": "VRSC",
      "amount": 100.0
    },
    "for": {
      "currency": "USD",
      "amount": 500.0
    },
    "expired": false,
    "expiration": 1234567
  }
]
```

### Example 3: List only expired offers

**Command:**
```
verus listopenoffers false true
```

**Sample Output Format:**
```json
[
  {
    "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "offer": {
      "identity": "MyVerusID"
    },
    "for": {
      "currency": "VRSC",
      "amount": 5000.0
    },
    "expired": true,
    "expiration": 1230000
  }
]
```

## Potential Error Cases

1. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   First parameter must be a boolean
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Second parameter must be a boolean
   ```

3. **Potential Error - Wallet Not Available:**
   ```
   error code: -13
   error message:
   Error: Wallet not available
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `closeoffers`: Closes specified offers in the wallet
- `getoffers`: Returns all open offers for a specific currency or ID
- `makeoffer`: Creates a new offer for decentralized asset swapping
- `takeoffer`: Accepts an existing offer on the blockchain
