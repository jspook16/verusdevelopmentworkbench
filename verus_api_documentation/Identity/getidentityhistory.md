# Verus RPC Command: getidentityhistory

## Purpose
The `getidentityhistory` command is designed to retrieve the historical record of changes and updates to a specific identity on the Verus blockchain. This command allows users to trace the evolution of an identity through time, providing valuable information for audit and verification purposes.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `getidentityhistory` command fetches the complete history of a specified identity from the Verus blockchain, optionally limited to a specific height range. The command can also include cryptographic proofs of the identity's status at different points in time. This historical record is essential for understanding how an identity has evolved, who has controlled it, and what changes have been made to its structure over time.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name@ || iid` | string | Yes | N/A | Name followed by "@" or i-address of an identity |
| `heightstart` | number | No | 0 | Only return content from this height forward, inclusive |
| `heightend` | number | No | 0 (max height) | Only return content up to this height, inclusive. -1 means also return values from the mempool |
| `txproofs` | boolean | No | false | If true, returns proof of ID |
| `txproofheight` | number | No | value of `height` | Height from which to generate a proof |

## Results
The command returns an array of identity objects, each representing the state of the identity at a specific point in the blockchain history.

**Return Type**: Array of Objects

Each object in the returned array typically contains:

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Version of the identity structure |
| `flags` | number | Binary flags defining identity properties |
| `primaryaddresses` | array | Array of primary addresses associated with this identity |
| `minimumsignatures` | number | Minimum number of signatures required for transactions |
| `name` | string | The name portion of the identity |
| `identityaddress` | string | The i-address of this identity |
| `parent` | string | Parent identity, if applicable (empty string if no parent) |
| `systemid` | string | The system identifier for this identity |
| `contentmap` | object | Map of content associated with this identity |
| `contentmultimap` | object | Map of multiple content items associated with this identity |
| `revocationauthority` | string | The identity with authority to revoke this identity |
| `recoveryauthority` | string | The identity with authority to recover this identity |
| `timelock` | number | Timelock setting for the identity (if applicable) |
| `blockheight` | number | Block height at which this version of the identity was defined |
| `txid` | string | Transaction ID that created this version of the identity |
| `proofheight` | number | Present if txproofs is true, the height of proof |
| `proof` | object | Present if txproofs is true, proof information |

If the identity is not found, an error is returned.

## Sample Examples

### Sample Example 1: Get Complete Identity History

**Command:**
```
verus getidentityhistory "MyIdentity@"
```

**Expected Format:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"
    ],
    "minimumsignatures": 1,
    "name": "MyIdentity",
    "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "parent": "",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "blockheight": 156842,
    "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
  },
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX",
      "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"
    ],
    "minimumsignatures": 1,
    "name": "MyIdentity",
    "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "parent": "",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "blockheight": 170000,
    "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
  }
]
```

### Sample Example 2: Get Identity History with Height Range

**Command:**
```
verus getidentityhistory "BusinessID@" 160000 180000
```

**Expected Format:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX",
      "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"
    ],
    "minimumsignatures": 2,
    "name": "BusinessID",
    "identityaddress": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "parent": "",
    "systemid": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "recoveryauthority": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "timelock": 0,
    "blockheight": 170000,
    "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
  },
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX",
      "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w",
      "RYQbUr9WtRRAnMjuddZMdpBKEMtLmU6Ro5"
    ],
    "minimumsignatures": 2,
    "name": "BusinessID",
    "identityaddress": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "parent": "",
    "systemid": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "recoveryauthority": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
    "timelock": 0,
    "blockheight": 175000,
    "txid": "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9"
  }
]
```

### Sample Example 3: Get Identity History with Proof

**Command:**
```
verus getidentityhistory "MyIdentity@" 0 0 true
```

**Expected Format:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"
    ],
    "minimumsignatures": 1,
    "name": "MyIdentity",
    "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "parent": "",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "blockheight": 156842,
    "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
    "proofheight": 500000,
    "proof": {
      "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
      "height": 156842,
      "txoutnum": 0,
      "txproof": "...[detailed cryptographic proof data]..."
    }
  },
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX",
      "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"
    ],
    "minimumsignatures": 1,
    "name": "MyIdentity",
    "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "parent": "",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "blockheight": 170000,
    "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f",
    "proofheight": 500000,
    "proof": {
      "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f",
      "height": 170000,
      "txoutnum": 0,
      "txproof": "...[detailed cryptographic proof data]..."
    }
  }
]
```

### Sample Example 4: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentityhistory", "params": ["MyIdentity@"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "version": 3,
      "flags": 0,
      "primaryaddresses": [
        "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"
      ],
      "minimumsignatures": 1,
      "name": "MyIdentity",
      "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "parent": "",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "timelock": 0,
      "blockheight": 156842,
      "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
    },
    {
      "version": 3,
      "flags": 0,
      "primaryaddresses": [
        "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX",
        "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"
      ],
      "minimumsignatures": 1,
      "name": "MyIdentity",
      "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "parent": "",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "timelock": 0,
      "blockheight": 170000,
      "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
    }
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```

2. **Potential Error - Invalid Identity Format:**
   ```
   error code: -8
   error message:
   Invalid identity name or address format
   ```

3. **Potential Error - Invalid Height Parameters:**
   ```
   error code: -8
   error message:
   heightstart cannot be greater than heightend
   ```

4. **Potential Error - Invalid Proof Height:**
   ```
   error code: -8
   error message:
   Invalid proof height parameter
   ```

5. **Potential Error - Network Error:**
   ```
   error code: -1
   error message:
   Network error while fetching identity history
   ```