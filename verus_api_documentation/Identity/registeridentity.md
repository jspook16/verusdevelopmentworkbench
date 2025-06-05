# Verus RPC Command: registeridentity

## Purpose
The `registeridentity` command is used to register a new identity on the Verus blockchain. This process requires a previously created name commitment and allows the creation of a unique identity with defined authorities and signatures.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `registeridentity` command registers a new identity on the Verus blockchain using a previously created name commitment. It defines the primary addresses associated with the identity, minimum signature requirements, revocation authority, and recovery authority. 

This command is essential for establishing unique, verifiable identities within the Verus ecosystem. The identity creation process consists of two steps:
1. First, create a name commitment using `registernamecommitment` command
2. Once the name commitment has at least 1 confirmation, use this command to register the actual identity

Registering an identity on the Verus mainnet costs 100 VRSC plus transaction fees. This cost may differ on different chains or PBaaS networks. Using a referral ID when registering can provide a discount on this fee. On test networks like VRSCTEST, the cost is the same but paid in test coins with no real-world value.

**Important**: The name commitment transaction must have at least 1 confirmation before it can be used to register an identity.

**Command Type**: Transaction  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `txid` | hex string | Yes | The transaction ID of the name commitment for this ID name |
| `namereservation` | object | Yes | The name reservation details object |
| `namereservation.version` | number | Yes | Version of the name reservation (currently 1) |
| `namereservation.name` | string | Yes | The unique name in this commitment |
| `namereservation.parent` | string | Yes | Parent chain (VerusID for main/test) |
| `namereservation.salt` | hex string | Yes | Salt used to hide the commitment |
| `namereservation.referral` | string | No | Valid ID to use as a referrer to receive a discount |
| `namereservation.nameid` | base58 string | Yes | Identity address for this identity if it is created |
| `identity` | object | Yes | The identity details object |
| `identity.name` | string | Yes | The unique name for this identity (must match name in reservation) |
| `identity.primaryaddresses` | array of strings | Yes | Array of primary addresses associated with this identity |
| `identity.minimumsignatures` | number | Yes | Minimum number of signatures required for transactions |
| `identity.revocationauthority` | array of strings | Yes | Array of identity addresses with revocation authority. Note: While the schema specifies an array, for a single authority, providing it as a direct string (e.g., "iAddress") may be processed effectively by the daemon. Test behavior if multiple distinct authorities are needed in the array. |
| `identity.recoveryauthority` | array of strings | Yes | Array of identity addresses with recovery authority. (Similar note as revocationauthority regarding single string vs. array). |
| `identity.privateaddress` | string | No | Optional. A Z-address to be associated with the identity upon registration. This address is stored with the identity and can be retrieved using `getidentity`. |
| `returntx` | boolean | No | If true, return a transaction for additional signatures rather than committing it (default=false) |
| `feeoffer` | number | No | Amount to offer miner/staker for the registration fee, if missing, uses standard price |
| `sourceoffunds` | string | No | Optional address to use for source of funds. If not specified, transparent wildcard "*" is used |

## Results
The command returns the transaction ID upon successful registration.

**Return Type**: String (hex)

## Sample Examples

### Sample Example 1: Register a New Identity

**Command:**
```
verus registeridentity '{
  "txid": "4e3c5135b0c844d74e5c2264429105219da2047385dae3742a450cb478b3288a",
  "namereservation": {
    "version": 1,
    "name": "TestCurrency",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "cb1617c8e70524e9553ad166e5357e639854d8c890a146f881bf7f064733c17e",
    "referral": "",
    "nameid": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"
  },
  "identity": {
    "name": "TestCurrency",
    "primaryaddresses": ["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],
    "minimumsignatures": 1,
    "revocationauthority": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS",
    "recoveryauthority": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS",
    "privateaddress": "zs1sampleprivateaddressxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}'
```

**Sample Result:**
```
"7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
```
**Note:** After registration and confirmation, use `getidentity TestCurrency@` to verify that the `revocationauthority`, `recoveryauthority`, and `privateaddress` are set as expected.

### Sample Example 2: Register Identity with Fee Offer

**Command:**
```
verus registeridentity '{
  "txid": "4e3c5135b0c844d74e5c2264429105219da2047385dae3742a450cb478b3288a",
  "namereservation": {
    "version": 1,
    "name": "BusinessID",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "cb1617c8e70524e9553ad166e5357e639854d8c890a146f881bf7f064733c17e",
    "referral": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "nameid": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"
  },
  "identity": {
    "name": "BusinessID",
    "primaryaddresses": ["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX", "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"],
    "minimumsignatures": 2,
    "revocationauthority": ["iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"],
    "recoveryauthority": ["iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"]
  }
}' false 1.5
```

**Sample Result:**
```
"8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
```

### Sample Example 3: Register Identity with Return Transaction for Additional Signatures

**Command:**
```
verus registeridentity '{
  "txid": "4e3c5135b0c844d74e5c2264429105219da2047385dae3742a450cb478b3288a",
  "namereservation": {
    "version": 1,
    "name": "MultiSigID",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "salt": "cb1617c8e70524e9553ad166e5357e639854d8c890a146f881bf7f064733c17e",
    "referral": "",
    "nameid": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"
  },
  "identity": {
    "name": "MultiSigID",
    "primaryaddresses": ["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX", "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w", "RYQbUr9WtRRAnMjuddZMdpBKEMtLmU6Ro5"],
    "minimumsignatures": 2,
    "revocationauthority": ["iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"],
    "recoveryauthority": ["iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"]
  }
}' true
```

**Sample Result:**
```
{
  "hex": "0100000001c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d0000000000ffffffff0100e1f505000000007500...",
  "txid": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
  "namereservation": {
    "name": "MultiSigID",
    "salt": "cb1617c8e70524e9553ad166e5357e639854d8c890a146f881bf7f064733c17e",
    "referral": "",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "nameid": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"
  }
}
```

### Sample Example 4: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "registeridentity", "params": [{"txid": "4e3c5135b0c844d74e5c2264429105219da2047385dae3742a450cb478b3288a", "namereservation": {...}, "identity": {...}}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Sample Result:**
```json
{
  "result": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
  "error": null,
  "id": "curltest"
}
```

### Sample Example 5: Register a Sub-Identity for a Currency

This example demonstrates registering a sub-identity, `subid.`, under an existing parent currency/identity (whose i-address is `iNxDE8WyJPaRGCpaVDSp5HdvufkorvydzH`). This is typical for creating identities that are part of a larger system or brand, like `user.brandname@`.

**Key Technical Note:** Pay close attention to the trailing period (`.`) in the `name` fields (`"subid."`). When registering a sub-identity directly under its parent currency/identity, this trailing period in the `namereservation.name` and `identity.name` is essential. It signals to the protocol that `subid` is a child of the parent ID specified in `namereservation.parent`.

The `namereservation.parent` must be the i-address of the fully qualified parent currency or identity. The name commitment (referenced by `txid`) must have been for `subid.` under this specific parent.

**Command:**
```
verus -chain=VRSCTEST registeridentity '{
  "txid":"32f6bdfee6f12a589166493749679fd2f7d2bda0d583a56547eeae3e8b2cadc6",
  "namereservation":{
    "version":1,
    "name":"subid.",
    "parent":"iNxDE8WyJPaRGCpaVDSp5HdvufkorvydzH",
    "salt":"cc51d204a97c00d5a7407985f4936cd437d44898d2fdafefe0e944ab0fa252ca",
    "nameid":"i6rzuXuFcDWhtS4xd5A8GJUyipchC6cr8b"
  },
  "identity":{
    "name":"subid.",
    "primaryaddresses":["RPSGdnEa5dU61hE7CbhN8D9PSR7q3ZSgUs"],
    "minimumsignatures":1,
    "revocationauthority":"iBN2enGtbojLjemuoa8WET9C3T2GXUWkKd",
    "recoveryauthority":"iBN2enGtbojLjemuoa8WET9C3T2GXUWkKd",
    "privateaddress":"zs13uqv6mv0kf73vrlf0qhzv4nnyc6ks4jzug48hj0uxdtrvzvaz8kqm0gvy6zkseapkpmavq98sdv"
  }
}'
```

**Sample Result:**
```
"8e40e78aafef36a14478a8e7b40da37a71c31c42aa0ff3bee530487a0309485c"
```
**Note:** After registration, you would typically interact with this sub-identity using its fully qualified name, which would depend on the name of the parent ID `iNxDE8WyJPaRGCpaVDSp5HdvufkorvydzH`. For example, if the parent was `MyCurrency@`, the sub-ID would be `subid.MyCurrency@`.

## Potential Error Cases

1. **Potential Error - Name Already Exists:**
   ```
   error code: -5
   error message:
   Name already exists
   ```

2. **Potential Error - Invalid or Unconfirmed Name Commitment:**
   ```
   error code: -8
   error message:
   Invalid or unconfirmed commitment transaction id
   ```

3. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

4. **Potential Error - Identity Name Mismatch:**
   ```
   error code: -5
   error message:
   Identity name must match name in reservation
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```
