# Verus RPC Command: getidentitieswithrecovery

## Purpose
The `getidentitieswithrecovery` command is designed to query and retrieve all identities within the Verus blockchain that have a specified identity or i-address as their recovery authority. This command is vital for identity management and verification, allowing users to track and monitor identities for which they serve as a recovery authority.

## Daemon Requirements
- The daemon must be started with the `-idindex=1` parameter to enable identity indexing

## Description
The `getidentitieswithrecovery` command accepts a JSON object containing parameters and returns an array of identity objects where the specified identity or i-address is the recovery authority. This command is particularly useful for tracking identity relationships and verifying recovery authority assignments.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Requires running daemon with identity indexing enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `identityid` | string | Yes | N/A | ID or i-address to search for as recovery authority |
| `fromheight` | number | No | 0 | Block height to start the search from |
| `toheight` | number | No | 0 | Block height to end the search at (0 = no limit) |
| `unspent` | boolean | No | false | When true, only returns active identity UTXOs as of the current block height |

## Results
The command returns an array of identity objects, each representing an identity that has the specified ID or i-address as its recovery authority.

**Return Type**: Array of Objects

Each returned identity object contains standard identity properties such as:
- Identity name
- Parent identity (if applicable)
- Authorities (revocation, recovery)
- Primary addresses
- Transaction output information (txout)
- Other identity-specific information

If no matching identities are found, an empty array is returned.

## Sample Examples

### Real Example 1: Get identities with specific recovery authority

**Command:**
```
./verus -chain=VRSCTEST getidentitieswithrecovery '{"identityid":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","fromheight":10000,"toheight":1100000,"unspent":false}'
```

**Actual Output:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"
    ],
    "minimumsignatures": 1,
    "name": "CursorAIOne",
    "identityaddress": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "txout": {
      "txid": "1620149d7ce6e6bc868a74172cfa0c6e092082f7b2b43e1d0c6c5d6f9b0271fc",
      "voutnum": 0
    }
  },
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"
    ],
    "minimumsignatures": 1,
    "name": "CursorAITwo",
    "identityaddress": "iByqSsw6TN9QTzPUGgX1DhWAJtLdEoZrx4",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iByqSsw6TN9QTzPUGgX1DhWAJtLdEoZrx4",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "txout": {
      "txid": "5034e99401be6e20fd164cbc77e63a9630532af9ca5888e5daa5f43baf15ecec",
      "voutnum": 0
    }
  }
]
```

This example shows:
- How to query identities that have a specific identity as their recovery authority
- The complete identity details returned for each identity
- Multiple identities can have the same recovery authority
- The actual transaction IDs and output numbers for each identity
- The relationship between parent and child identities

### Sample Example 2: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentitieswithrecovery", "params": [{"identityid":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","fromheight":10000,"toheight":1100000,"unspent":false}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
      "name": "TestIdentity",
      "identityaddress": "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5",
      "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "contentmap": {},
      "contentmultimap": {},
      "revocationauthority": "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5",
      "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "timelock": 0,
      "txout": {
        "txid": "b040d181b2de82f689095ced683b061524534126e1d76a922ba3f265c31422a9",
        "voutnum": 0
      }
    }
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Daemon Not Started with Required Index:**
   ```
   error code: -32602
   error message:
   getidentitieswithrecovery requires -idindex=1 when starting the daemon
   ```

2. **Potential Error - Invalid Identity ID Format:**
   ```
   error code: -8
   error message:
   Invalid identity ID format
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