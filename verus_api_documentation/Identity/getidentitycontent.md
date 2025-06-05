# Verus RPC Command: getidentitycontent

## Purpose
The `getidentitycontent` command is designed to retrieve content information stored within a specific identity on the Verus blockchain. This command allows users to query content associated with an identity, optionally filtering by height range and specific content types.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `getidentitycontent` command fetches content information associated with a specified identity from the Verus blockchain. Content in identities can be accessed by height range, and users can specify whether to include proof of the identity and whether to include deleted content items. Additionally, specific content can be targeted using VDXF keys, providing a flexible mechanism for retrieving identity-associated data.

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
| `vdxfkey` | vdxf key | No | null | More selective search for specific content in ID |
| `keepdeleted` | boolean | No | false | If true, return deleted items as well |

## Results
The command returns an object containing identity content information based on the specified parameters.

**Return Type**: Object

The returned object structure depends on the specific identity content, but typically includes:

| Field | Type | Description |
|-------|------|-------------|
| `content` | object | Map of content items associated with the identity |
| `proofheight` | number | Present if txproofs is true, the height of proof |
| `proof` | object | Present if txproofs is true, proof information |

If no content is found, an empty object or an error is returned, depending on whether the identity exists.

## Examples

### Real Example 1: Get All Content for an Identity

**Command:**
```
./verus -chain=VRSCTEST getidentitycontent "CursorAIFour.VRSCTEST@"
```

**Expected Format:**
```json
{
  "fullyqualifiedname": "CursorAIFour.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 531572,
  "fromheight": 0,
  "toheight": 531580,
  "txid": "db0dd9c8a8576853f8c328019704018837701f75ab4f4838f7e983a316bf753b",
  "vout": 0,
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "minimumsignatures": 1,
    "name": "CursorAIFour",
    "identityaddress": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {
    },
    "contentmultimap": {
      "iRcMatHtfjxyQSZTHgfD6SbwLyT39kM1zJ": [
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "Bookshop"
            },
            "label": "i59nzmfL33gckLj13ACzhLe5QNXbyB8YhK"
          }
        },
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "15 Sea View, Miami, 132523"
            },
            "label": "iQGCpYRadDmDYsAHwehMTqruNQMJNSbbRk"
          }
        },
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "$100,000"
            },
            "label": "iPZUuaG9iVJHRX6zwNTbdeQNkmBxYSyPCE"
          }
        }
      ]
    },
    "revocationauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "recoveryauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "timelock": 0
  }
}
```

This example shows:
- How to retrieve all content for a specific identity
- The complete identity structure including contentmultimap
- Multiple content items stored under the same key
- The actual transaction ID and block height information
- The relationship between parent and system IDs

### Real Example 2: Get Content with Height Range and Proof
```bash
./verus -chain=VRSCTEST getidentitycontent "CursorAIFour.VRSCTEST@" 531570 531580 true
```
```json
{
  "fullyqualifiedname": "CursorAIFour.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 531572,
  "fromheight": 531570,
  "toheight": 531580,
  "txid": "db0dd9c8a8576853f8c328019704018837701f75ab4f4838f7e983a316bf753b",
  "vout": 0,
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "minimumsignatures": 1,
    "name": "CursorAIFour",
    "identityaddress": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {
    },
    "contentmultimap": {
      "iRcMatHtfjxyQSZTHgfD6SbwLyT39kM1zJ": [
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "Bookshop"
            },
            "label": "i59nzmfL33gckLj13ACzhLe5QNXbyB8YhK"
          }
        },
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "15 Sea View, Miami, 132523"
            },
            "label": "iQGCpYRadDmDYsAHwehMTqruNQMJNSbbRk"
          }
        },
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "$100,000"
            },
            "label": "iPZUuaG9iVJHRX6zwNTbdeQNkmBxYSyPCE"
          }
        }
      ]
    },
    "revocationauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "recoveryauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "timelock": 0
  }
}
```

This example shows:
- How to retrieve content for a specific identity within a height range
- The proof information returned when txproofs is true

### Real Example 3: Get Specific Content with VDXF Key

**Command:**
```
./verus -chain=VRSCTEST getidentitycontent "CursorAIFour.VRSCTEST@" 0 0 false 0 "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv"
```

**Expected Format:**
```json
{
  "fullyqualifiedname": "CursorAIFour.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 531572,
  "fromheight": 0,
  "toheight": 531587,
  "txid": "db0dd9c8a8576853f8c328019704018837701f75ab4f4838f7e983a316bf753b",
  "vout": 0,
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "minimumsignatures": 1,
    "name": "CursorAIFour",
    "identityaddress": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {
    },
    "contentmultimap": {
    },
    "revocationauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "recoveryauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "timelock": 0
  }
}
```

This example shows:
- How to retrieve specific content using a VDXF key
- The command format for targeting specific content within an identity
- The response structure when querying with a VDXF key
- The relationship between the identity and its content structure

### Real Example 4: Include Deleted Content

**Command:**
```
./verus -chain=VRSCTEST getidentitycontent "CursorAIFour.VRSCTEST@" 0 0 false 0 null true
```

**Expected Format:**
```json
{
  "fullyqualifiedname": "CursorAIFour.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 531572,
  "fromheight": 0,
  "toheight": 531590,
  "txid": "db0dd9c8a8576853f8c328019704018837701f75ab4f4838f7e983a316bf753b",
  "vout": 0,
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
    ],
    "minimumsignatures": 1,
    "name": "CursorAIFour",
    "identityaddress": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "contentmap": {
    },
    "contentmultimap": {
      "iRcMatHtfjxyQSZTHgfD6SbwLyT39kM1zJ": [
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "Bookshop"
            },
            "label": "i59nzmfL33gckLj13ACzhLe5QNXbyB8YhK"
          }
        },
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "15 Sea View, Miami, 132523"
            },
            "label": "iQGCpYRadDmDYsAHwehMTqruNQMJNSbbRk"
          }
        },
        {
          "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
            "version": 1,
            "flags": 96,
            "mimetype": "text/plain",
            "objectdata": {
              "message": "$100,000"
            },
            "label": "iPZUuaG9iVJHRX6zwNTbdeQNkmBxYSyPCE"
          }
        }
      ]
    },
    "revocationauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "recoveryauthority": "iHQFiCSdeRshVXwrcrvw87qU8KNSfpRHdf",
    "timelock": 0
  }
}
```

This example shows:
- How to retrieve content including deleted items using the keepdeleted parameter
- The command format for including deleted content in the response
- The complete content structure including both active and deleted items
- The relationship between content items and their metadata

### Real Example 5: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentitycontent", "params": ["MyIdentity@"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
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

4. **Potential Error - Invalid VDXF Key:**
   ```
   error code: -8
   error message:
   Invalid VDXF key format
   ```

5. **Potential Error - Network Error:**
   ```
   error code: -1
   error message:
   Network error while fetching identity content
   ```
