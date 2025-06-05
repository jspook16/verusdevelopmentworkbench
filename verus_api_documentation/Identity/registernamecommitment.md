# Verus RPC Command: registernamecommitment

## Purpose
The `registernamecommitment` command is used to register a name commitment, which is a required first step before registering an identity on the Verus blockchain. This commitment secures the desired name while hiding it from potential front-runners.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `registernamecommitment` command registers a commitment for a name that will later be used when registering an identity. This process protects the desired name from being front-run by miners while ensuring that the registration process remains secure. The commitment contains a cryptographic proof of intention to register a specific name without revealing the name itself during the commitment phase.

Names must adhere to specific formatting rules: they cannot have leading, trailing, or multiple consecutive spaces, and they must not include any of the following characters: \/:*?"<>|@

**Command Type**: Transaction  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The unique name to commit to. Note that creating a name commitment is not a registration, and if one is created for a name that exists, it may succeed, but will never be able to be used. |
| `controladdress` | address | Yes | Address that will control this commitment. IMPORTANT: this is not necessarily the address that should control the actual ID, and it should be present in the current wallet that is registering the ID. Change may go to this address. |
| `referralidentity` | identity | No | Friendly name or identity address that is provided as a referral mechanism and to lower network cost of the ID. |
| `parentnameorid` | currency | No | Friendly name or currency i-address, which will be the parent of this ID and dictate issuance rules & pricing (PBaaS only). |
| `sourceoffunds` | address or ID | No | Optional address to use for source of funds. If not specified, transparent wildcard "*" is used. |

## Results
The command returns a JSON object containing the transaction ID and name reservation details.

**Return Type**: Object

The result object contains:

| Field | Type | Description |
|-------|------|-------------|
| `txid` | hex string | The transaction ID of the name commitment |
| `namereservation` | object | The name reservation details |
| `namereservation.name` | string | The unique name in this commitment |
| `namereservation.salt` | hex string | Salt used to hide the commitment |
| `namereservation.referral` | base58 string | Address of the referring identity if there is one |
| `namereservation.parent` | string | Name of the parent if not Verus or Verus test |
| `namereservation.nameid` | base58 string | Identity address for this identity if it is created |

## Sample Examples

### Sample Example 1: Basic Name Commitment

**Command:**
```
verus registernamecommitment "MyNewIdentity" "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"
```

**Sample Result:**
```json
{
  "txid": "4e3c5135b0c844d74e5c2264429105219da2047385dae3742a450cb478b3288a",
  "namereservation": {
    "name": "MyNewIdentity",
    "salt": "cb1617c8e70524e9553ad166e5357e639854d8c890a146f881bf7f064733c17e",
    "referral": "",
    "parent": "",
    "nameid": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"
  }
}
```

### Sample Example 2: Name Commitment with Referral

**Command:**
```
verus registernamecommitment "BusinessID" "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX" "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs"
```

**Sample Result:**
```json
{
  "txid": "7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6",
  "namereservation": {
    "name": "BusinessID",
    "salt": "8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
    "referral": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "parent": "",
    "nameid": "i8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9"
  }
}
```

### Sample Example 3: Name Commitment with Parent

**Command:**
```
verus registernamecommitment "SubID" "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX" "" "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"
```

**Sample Result:**
```json
{
  "txid": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
  "namereservation": {
    "name": "SubID",
    "salt": "f1e2d3c4b5a6978685746352413f2e1d0c9b8a7968574645342312f1e0d9c8b7",
    "referral": "",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "nameid": "i1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0"
  }
}
```

### Sample Example 4: Name Commitment with Specific Funding Source

**Command:**
```
verus registernamecommitment "FundedID" "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX" "" "" "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"
```

**Sample Result:**
```json
{
  "txid": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8",
  "namereservation": {
    "name": "FundedID",
    "salt": "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9",
    "referral": "",
    "parent": "",
    "nameid": "i9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0"
  }
}
```

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "registernamecommitment", "params": ["name", "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Sample Result:**
```json
{
  "result": {
    "txid": "4e3c5135b0c844d74e5c2264429105219da2047385dae3742a450cb478b3288a",
    "namereservation": {
      "name": "name",
      "salt": "cb1617c8e70524e9553ad166e5357e639854d8c890a146f881bf7f064733c17e",
      "referral": "",
      "parent": "",
      "nameid": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"
    }
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Name Format:**
   ```
   error code: -8
   error message:
   Invalid name format. Names must not have leading, trailing, or multiple consecutive spaces and must not include any of the following characters: \/:*?"<>|@
   ```

2. **Potential Error - Invalid Control Address:**
   ```
   error code: -5
   error message:
   Control address not in wallet
   ```

3. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

4. **Potential Error - Invalid Referral Identity:**
   ```
   error code: -5
   error message:
   Invalid referral identity
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```
