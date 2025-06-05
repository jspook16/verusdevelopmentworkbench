# Verus RPC Command: getwalletinfo

## Purpose
The `getwalletinfo` command returns an object containing various wallet state information. This command provides a comprehensive overview of the wallet's current status, including balance information across different states, wallet version, key pool details, and transaction count.

## Description
When executed, this command retrieves and returns detailed information about the wallet's current state. This includes various balances (confirmed, unconfirmed, immature, and staking), wallet version, transaction count, key pool details, lock status, and fee configuration. This information is valuable for monitoring the wallet's health, understanding available funds across different states, and checking wallet configuration.

**Command Type**: Query/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing various wallet state information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| walletversion | numeric | The wallet version |
| balance | numeric | The total confirmed balance of the wallet in VRSC |
| reserve_balance | numeric | For PBaaS reserve chains, the total confirmed reserve balance of the wallet in VRSC |
| unconfirmed_balance | numeric | The total unconfirmed balance of the wallet in VRSC |
| unconfirmed_reserve_balance | numeric | Total unconfirmed reserve balance of the wallet in VRSC |
| immature_balance | numeric | The total immature balance of the wallet in VRSC |
| immature_reserve_balance | numeric | Total immature reserve balance of the wallet in VRSC |
| eligible_staking_balance | numeric | Eligible staking balance in VRSC |
| txcount | numeric | The total number of transactions in the wallet |
| keypoololdest | numeric | The timestamp of the oldest pre-generated key in the key pool |
| keypoolsize | numeric | How many new keys are pre-generated |
| unlocked_until | numeric | The timestamp until which the wallet is unlocked, or 0 if locked |
| paytxfee | numeric | The transaction fee configuration, set in VRSC/kB |
| seedfp | string | The BLAKE2b-256 hash of the HD seed |

## Examples

### Example 1: Get wallet information

**Command:**
```
verus getwalletinfo
```

**Sample Output:**
```json
{
  "walletversion": 60000,
  "balance": 1250.12345678,
  "reserve_balance": 100.00000000,
  "unconfirmed_balance": 15.50000000,
  "unconfirmed_reserve_balance": 0.00000000,
  "immature_balance": 50.00000000,
  "immature_reserve_balance": 0.00000000,
  "eligible_staking_balance": 1200.00000000,
  "txcount": 1247,
  "keypoololdest": 1622505600,
  "keypoolsize": 100,
  "unlocked_until": 0,
  "paytxfee": 0.00001000,
  "seedfp": "12a7b5c9d8e6f3210123456789abcdef0987654321fedcba9876543210abcdef"
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getwalletinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "walletversion": 60000,
    ... (other fields as in Example 1)
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

2. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

3. **Potential Error - Wallet Access:**
   ```
   error code: -1
   error message:
   Cannot access wallet
   ```

## Related Commands
- `getbalance`: Returns the server's total available balance
- `getunconfirmedbalance`: Returns the server's total unconfirmed balance
- `getcurrencybalance`: Returns the balance in all currencies of a specific address
- `getinfo`: Returns an object containing various state info
