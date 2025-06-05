# Verus RPC Command: listidentities

## Purpose
The `listidentities` command is designed to retrieve and list identities from the Verus blockchain based on specified filtering criteria. This command allows users to view identities they can spend from, sign for, or are watching, providing essential functionality for identity management and verification in the Verus ecosystem.

## Daemon Requirements
- The daemon must be started with the `-idindex=1` parameter to enable identity indexing

## Description
The `listidentities` command accepts boolean parameters to filter the types of identities returned. This command allows users to query identities based on their relationship to the wallet owner (can spend, can sign, watchonly), making it a valuable tool for identity management and verification.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with identity indexing enabled

## Arguments
The command accepts optional boolean parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includecanspend` | boolean | No | true | Include identities for which we can spend/authorize |
| `includecansign` | boolean | No | true | Include identities that we can only sign for but not spend |
| `includewatchonly` | boolean | No | false | Include identities that we can neither sign nor spend, but are either watched or are co-signers with us |

## Results
The command returns a list of identity objects that match the specified filtering criteria.

**Return Type**: Array of Objects

Each returned identity object contains:

| Field | Type | Description |
|-------|------|-------------|
| `identity` | object | The identity object with detailed identity information |
| `identity.version` | number | Version of the identity structure |
| `identity.flags` | number | Binary flags defining identity properties |
| `identity.primaryaddresses` | array | Array of primary addresses associated with this identity |
| `identity.minimumsignatures` | number | Minimum number of signatures required for transactions |
| `identity.name` | string | The name portion of the identity |
| `identity.identityaddress` | string | The i-address of this identity |
| `identity.parent` | string | Parent identity, if applicable (empty string if no parent) |
| `identity.systemid` | string | The system identifier for this identity |
| `identity.contentmap` | object | Map of content associated with this identity |
| `identity.contentmultimap` | object | Map of multiple content items associated with this identity |
| `identity.revocationauthority` | string | The identity with authority to revoke this identity |
| `identity.recoveryauthority` | string | The identity with authority to recover this identity |
| `identity.timelock` | number | Timelock setting for the identity (if applicable) |
| `blockheight` | number | Block height at which this identity was created |
| `txid` | string | Transaction ID of the identity registration |
| `status` | string | Current status of the identity (e.g., "active") |
| `canspendfor` | boolean | Whether the wallet can spend from this identity |
| `cansignfor` | boolean | Whether the wallet can sign for this identity |

## Sample Examples

## Sample Examples

### Real Example 1: List All Identities on Test Network

**Command:**
```
./verus -chain=VRSCTEST listidentities
```

**Actual Output (Truncated):**
```json
[
  {
    "identity": {
      "version": 3,
      "flags": 0,
      "primaryaddresses": [
        "RCL3WgEMT9J3Ga327Aq65RWc35i7GGZXAZ"
      ],
      "minimumsignatures": 1,
      "name": "CursorAIEight",
      "identityaddress": "i482iijvdEon79o8R55F7bq5vTk6DanMxK",
      "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "i482iijvdEon79o8R55F7bq5vTk6DanMxK",
      "recoveryauthority": "i482iijvdEon79o8R55F7bq5vTk6DanMxK",
      "timelock": 0
    },
    "blockheight": 529795,
    "txid": "f719d291da2d52a9f3fcff105bf6150f2aa3df9e6372fdf278151f0e43f06369",
    "status": "active",
    "canspendfor": true,
    "cansignfor": true
  },
  {
    "identity": {
      "version": 3,
      "flags": 1,
      "primaryaddresses": [
        "RMmJedXS6Cu98a53FfkxgJo8p6vDMT431x"
      ],
      "minimumsignatures": 1,
      "name": "CursorAIThree",
      "identityaddress": "i9eN4VVt8SUrCFJXhzeXqQP76gNzQTyYNS",
      "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "i9eN4VVt8SUrCFJXhzeXqQP76gNzQTyYNS",
      "recoveryauthority": "i9eN4VVt8SUrCFJXhzeXqQP76gNzQTyYNS",
      "timelock": 0
    },
    "blockheight": 530159,
    "txid": "44e0749c44d0aa7c359e49aae8f266c28ab809b08f6831a7936c8f8b2d7d4b61",
    "status": "active",
    "canspendfor": true,
    "cansignfor": true
  }
]
```
*Note: Output truncated for brevity. The actual output contains multiple identity records.*

### Sample Example 2: Include Specific Identity Types (Format Based on Real Output)

**Command:**
```
verus listidentities true true false
```

**Expected Format:**
```json
[
  {
    "identity": {
      "version": 3,
      "flags": 0,
      "primaryaddresses": [
        "RYQbUr9WtRRAnMjuddZMdpBKEMtLmU6Ro5"
      ],
      "minimumsignatures": 1,
      "name": "DevelopmentID",
      "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "parent": "",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "timelock": 0
    },
    "blockheight": 156842,
    "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
    "status": "active",
    "canspendfor": true,
    "cansignfor": true
  }
]
```

### Sample Example 3: Only Watch-Only Identities (Format Based on Real Output)

**Command:**
```
verus listidentities false false true
```

**Expected Format:**
```json
[
  {
    "identity": {
      "version": 3,
      "flags": 0,
      "primaryaddresses": [
        "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"
      ],
      "minimumsignatures": 1,
      "name": "WatchedID",
      "identityaddress": "iNdt9WJuA5RRtbTXJXUDKQh4ApCXgn6BrJ",
      "parent": "",
      "systemid": "iNdt9WJuA5RRtbTXJXUDKQh4ApCXgn6BrJ",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "iNdt9WJuA5RRtbTXJXUDKQh4ApCXgn6BrJ",
      "recoveryauthority": "iNdt9WJuA5RRtbTXJXUDKQh4ApCXgn6BrJ",
      "timelock": 0
    },
    "blockheight": 157201,
    "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f",
    "status": "active",
    "canspendfor": false,
    "cansignfor": false
  }
]
```

### Sample Example 4: Remote API Usage with curl (Format Based on Real Output)

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listidentities", "params": [true] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "identity": {
        "version": 3,
        "flags": 0,
        "primaryaddresses": [
          "RYQbUr9WtRRAnMjuddZMdpBKEMtLmU6Ro5"
        ],
        "minimumsignatures": 1,
        "name": "DevelopmentID",
        "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "parent": "",
        "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "contentmap": {},
        "contentmultimap": {},
        "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "timelock": 0
      },
      "blockheight": 156842,
      "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
      "status": "active",
      "canspendfor": true,
      "cansignfor": true
    },
    {
      "identity": {
        "version": 3,
        "flags": 0,
        "primaryaddresses": [
          "RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"
        ],
        "minimumsignatures": 1,
        "name": "TestingID",
        "identityaddress": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
        "parent": "",
        "systemid": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
        "contentmap": {},
        "contentmultimap": {},
        "revocationauthority": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
        "recoveryauthority": "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs",
        "timelock": 0
      },
      "blockheight": 157013,
      "txid": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8",
      "status": "active",
      "canspendfor": true,
      "cansignfor": true
    }
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Identity Index Not Enabled:**
   ```
   error code: -1
   error message:
   Identity index not enabled. Please restart with -idindex=1
   ```

2. **Potential Error - Invalid Parameter Types:**
   ```
   error code: -8
   error message:
   Expected boolean value for includecanspend
   ```

3. **Potential Error - No Identities Found:**
   ```
   error code: 0
   error message:
   []
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

5. **Potential Error - Invalid Chain:**
   ```
   error code: -5
   error message:
   Chain not found: VRSCTEST
   ```
