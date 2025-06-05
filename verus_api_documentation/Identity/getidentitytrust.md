# Verus RPC Command: getidentitytrust

## Purpose
The `getidentitytrust` command is designed to retrieve trust ratings for identities in the Verus blockchain. This command allows users to query the trust relationships between identities, which are used to determine synchronization and interaction permissions in the network.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `getidentitytrust` command fetches the trust ratings assigned to identities within the Verus ecosystem. Trust ratings are a crucial component of the Verus identity system, allowing identities to express approval or disapproval of other identities, which influences network interactions and synchronization behavior. This command can return ratings for all identities or be filtered to show ratings for specific identities.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `["id",...]` | array of strings | No | [] | If specified, only returns rating values for the specified IDs, otherwise returns for all |

## Results
The command returns an object containing trust ratings and the current identity trust mode.

**Return Type**: Object

The returned object contains:

| Field | Type | Description |
|-------|------|-------------|
| `setratings` | object | A map of identity IDs to their JSON rating objects |
| `identitytrustmode` | number | The current trust mode setting: 0 = no restriction on sync, 1 = only sync to IDs rated approved, 2 = sync to all IDs but those on block list |

Each rating object typically contains trust information such as approval status, rating level, and any additional metadata associated with the trust relationship.

## Sample Examples

### Sample Example 1: Get Trust Ratings for All Identities

**Command:**
```
verus getidentitytrust
```

**Expected Format:**
```json
{
  "setratings": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": {
      "rating": 1,
      "flags": 0,
      "blockheight": 156842,
      "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
    },
    "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs": {
      "rating": 2,
      "flags": 0,
      "blockheight": 157013,
      "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
    },
    "iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5": {
      "rating": -1,
      "flags": 0,
      "blockheight": 157142,
      "txid": "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9"
    }
  },
  "identitytrustmode": 1
}
```

### Sample Example 2: Get Trust Ratings for Specific Identities

**Command:**
```
verus getidentitytrust '["iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs"]'
```

**Expected Format:**
```json
{
  "setratings": {
    "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": {
      "rating": 1,
      "flags": 0,
      "blockheight": 156842,
      "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
    },
    "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs": {
      "rating": 2,
      "flags": 0,
      "blockheight": 157013,
      "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
    }
  },
  "identitytrustmode": 1
}
```

### Sample Example 3: Get Trust Ratings When No Ratings Exist

**Command:**
```
verus getidentitytrust '["iNdt9WJuA5RRtbTXJXUDKQh4ApCXgn6BrJ"]'
```

**Expected Format:**
```json
{
  "setratings": {},
  "identitytrustmode": 0
}
```

### Sample Example 4: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentitytrust", "params": [["iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs"]] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "setratings": {
      "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq": {
        "rating": 1,
        "flags": 0,
        "blockheight": 156842,
        "txid": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
      },
      "iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs": {
        "rating": 2,
        "flags": 0,
        "blockheight": 157013,
        "txid": "8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
      }
    },
    "identitytrustmode": 1
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Identity Format:**
   ```
   error code: -8
   error message:
   Invalid identity ID format
   ```

2. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Expected array of identity IDs
   ```

3. **Potential Error - Network Error:**
   ```
   error code: -1
   error message:
   Network error while fetching identity trust information
   ```

4. **Potential Error - Daemon Not Running:**
   ```
   error code: -28
   error message:
   Verifying blocks... (height varies with daemon state)
   ```

5. **Potential Error - Identity System Not Active:**
   ```
   error code: -5
   error message:
   Identity system is not yet active
   ```