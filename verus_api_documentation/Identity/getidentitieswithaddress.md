# Verus RPC Command: getidentitieswithaddress

## Purpose
The `getidentitieswithaddress` command is designed to query and retrieve all identities within the Verus blockchain that contain a specified address in their primary addresses list. This command is vital for identity management and verification, allowing users to track and monitor identities associated with particular addresses in the Verus ecosystem.

## Daemon Requirements
- The daemon must be started with the `-idindex=1` parameter to enable identity indexing

## Description
The `getidentitieswithaddress` command accepts a JSON object containing parameters and returns an array of identity objects that match the specified criteria. This command is particularly useful for tracking identity ownership and verifying address-identity relationships.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Requires running daemon with identity indexing enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `address` | string | Yes | N/A | A valid Verus address to search for among identity primary addresses |
| `fromheight` | number | No | 0 | Block height to start the search from |
| `toheight` | number | No | 0 | Block height to end the search at (0 = no limit) |
| `unspent` | boolean | No | false | When true, only returns active identity UTXOs as of the current block height |

## Results
The command returns an array of identity objects, each representing an identity that has the specified address in its primary addresses list.

**Return Type**: Array of Objects

Each returned identity object contains standard identity properties such as:
- Identity name
- Parent identity (if applicable)
- Authorities (revocation, recovery)
- Primary addresses
- Transaction output information (txout)
- Other identity-specific information

If no matching identities are found, an empty array is returned.

## Examples

### Real Example 1: Search for Identity by Address with Height Range

**Command:**
```
./verus -chain=VRSCTEST getidentitieswithaddress '{"address":"RChJTspomV6v6nRkcL2KnCNnwDnWaJpyFt","fromheight":10000,"toheight":1100000,"unspent":false}'
```

**Actual Output:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RChJTspomV6v6nRkcL2KnCNnwDnWaJpyFt"
    ],
    "minimumsignatures": 1,
    "name": "CursorAISeven",
    "identityaddress": "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {
    },
    "contentmultimap": {
    },
    "revocationauthority": "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5",
    "recoveryauthority": "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5",
    "timelock": 0,
    "txout": {
      "txid": "b040d181b2de82f689095ced683b061524534126e1d76a922ba3f265c31422a9",
      "voutnum": 0
    }
  }
]
```

### Real Example 2: Get identities for a specific address

**Command:**
```
./verus -chain=VRSCTEST getidentitieswithaddress '{"address":"RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"}'
```

**Actual Output:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "minimumsignatures": 1,
    "name": "TestCurrenyOne",
    "identityaddress": "iBt112AxrDFbCc8EkVmWF6bAvNrvehjhuD",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "revocationauthority": "iBt112AxrDFbCc8EkVmWF6bAvNrvehjhuD",
    "recoveryauthority": "iBt112AxrDFbCc8EkVmWF6bAvNrvehjhuD",
    "txout": {
      "txid": "c8c07c124a6a7ef14aebbeeb7935dda375b1787105fc9880885b483c1dceca34",
      "voutnum": 0
    }
  },
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "minimumsignatures": 1,
    "name": "CursorAIFour",
    "identityaddress": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "revocationauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "recoveryauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "txout": {
      "txid": "50b800b2a2342bc1449ad1fa0387f86fb4b8c82e39a22d4c6a1d945b5dcb3a44",
      "voutnum": 0
    }
  }
]
```

This example shows:
- How to query identities associated with a specific address
- The complete identity details returned for each identity
- Multiple identities can be associated with a single address
- The actual transaction IDs and output numbers for each identity

### Sample Example 3: Remote API Usage with curl (Format Based on Real Output)

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentitieswithaddress", "params": [{"address":"RYQbUr9WtRRAnMjuddZMdpBKEMtLmU6Ro5"}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
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
      "timelock": 0,
      "txout": {
        "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
        "voutnum": 0
      }
    }
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Confirmed Error - Daemon Not Started with Required Index:**
   ```
   error code: -32602
   error message:
   getidentitieswithaddress requires -idindex=1 when starting the daemon
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -8
   error message:
   Invalid Verus address format
   ```

3. **Potential Error - Invalid Parameter Types:**
   ```
   error code: -8
   error message:
   Expected fromheight as number
   ```

4. **Potential Error - Parameter Range Error:**
   ```
   error code: -8
   error message:
   fromheight cannot be greater than toheight
   ```

5. **Potential Error - Identity Index Not Enabled:**
   ```
   error code: -1
   error message:
   Identity index not enabled. Please restart with -idindex=1
   ```
