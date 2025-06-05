# Verus RPC Command: getidentitieswithrevocation

## Purpose
The `getidentitieswithrevocation` command is designed to query and retrieve all identities within the Verus blockchain that have a specified identity or i-address as their revocation authority. This command is vital for identity management and verification, allowing users to track and monitor identities for which they serve as a revocation authority.

## Daemon Requirements
- The daemon must be started with the `-idindex=1` parameter to enable identity indexing

## Description
The `getidentitieswithrevocation` command accepts a JSON object containing parameters and returns an array of identity objects where the specified identity or i-address is the revocation authority. This command is particularly useful for tracking identity relationships and verifying revocation authority assignments.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Requires running daemon with identity indexing enabled

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `identityid` | string | Yes | N/A | ID or i-address to search for as revocation authority |
| `fromheight` | number | No | 0 | Block height to start the search from |
| `toheight` | number | No | 0 | Block height to end the search at (0 = no limit) |
| `unspent` | boolean | No | false | When true, only returns active identity UTXOs as of the current block height |

## Results
The command returns an array of identity objects, each representing an identity that has the specified ID or i-address as its revocation authority.

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

### Real Example 1: Get identities with specific revocation authority

**Command:**
```
./verus -chain=VRSCTEST getidentitieswithrevocation '{"identityid":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","fromheight":10000,"toheight":1100000,"unspent":false}'
```

**Actual Output:**
```json
[
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "R9bu6RuPXP81wsC79ep53Nu3K2kc5Xw3wt"
    ],
    "minimumsignatures": 1,
    "name": "testidentity2",
    "identityaddress": "iDEwH8F9HG1GRJQ4rjfqFF3nBdfJaEHZv2",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iDEwH8F9HG1GRJQ4rjfqFF3nBdfJaEHZv2",
    "timelock": 0,
    "txout": {
      "txid": "4af420578a9a8912f223ad4c70478c275f9f53039100e4655c52928eea3af8fd",
      "voutnum": 0
    }
  },
  {
    "version": 3,
    "flags": 1,
    "primaryaddresses": [
      "RXKs5Gz8kRqpA52M25AW5FzP3aCNq46yMh"
    ],
    "minimumsignatures": 1,
    "name": "VRSCTEST",
    "identityaddress": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "parent": "i3UXS5QPRQGNRDDqVnyWTnmFCTHDbzmsYk",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {
      "iH51dFy7vF3LTRuVQvCTVu6QSbYfhTjek8": [
        "0187878304f6e7430a62a2be3c299c6734935a73221dd505b0d53e00"
      ]
    },
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "txout": {
      "txid": "e5bdba14dccc4bea38ca12798264160c0257ccef685a5091d343286e87040cf3",
      "voutnum": 0
    }
  },
  {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RUgMAyf4Z4XjwhkGTfZjaumY3KUK1d2UfF"
    ],
    "minimumsignatures": 1,
    "name": "testidentity5",
    "identityaddress": "iN2kP3v2R4enjpzknbQKYutgeBe3tahXtM",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {},
    "contentmultimap": {},
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0,
    "txout": {
      "txid": "9d9fe90acd0d29d6d5f0c7e988c05c3f26a7e4f47e6e20a8b6fc5b5f6215093f",
      "voutnum": 0
    }
  }
]
```

This example shows:
- Three identities that have "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq" as their revocation authority
- The complete identity details for each identity, including:
  - Version and flags
  - Primary addresses
  - Parent and system IDs
  - Content maps
  - Revocation and recovery authorities
  - Transaction IDs and output numbers
- Different types of identities:
  - A test identity (testidentity2)
  - The VRSCTEST system identity
  - Another test identity (testidentity5)
- The relationship between parent and child identities
- The actual transaction IDs and output numbers for each identity

### Sample Example 2: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentitieswithrevocation", "params": [{"identityid":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","fromheight":10000,"toheight":1100000,"unspent":false}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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
      "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
      "recoveryauthority": "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5",
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
   getidentitieswithrevocation requires -idindex=1 when starting the daemon
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