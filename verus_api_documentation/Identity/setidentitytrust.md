# Verus RPC Command: setidentitytrust

## Purpose
The `setidentitytrust` command is used to manage trust relationships with other identities in the Verus ecosystem, allowing users to set ratings for other identities and configure identity trust mode settings.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `setidentitytrust` command provides functionality to manage a wallet's identity trust lists. It allows users to set ratings for specific identities, remove ratings, clear all existing ratings, and configure the identity trust mode. This trust system affects how the wallet synchronizes with other identities and can be used to create allow lists or block lists for identity-based interactions. The command is essential for creating a personalized trust network within the Verus ecosystem.

**Command Type**: Wallet Management  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with wallet access

## Arguments
The command accepts a JSON object with the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clearall` | boolean | No | If true, clears all wallet identity trust lists before adding, removing, or trust mode operations. |
| `setratings` | object | No | Replaces ratings for specified IDs with those given. Format: `{"id": JSONRatingObject, ...}` |
| `removeratings` | array of strings | No | Erases ratings for the specified IDs. Format: `["id1", "id2", ...]` |
| `identitytrustmode` | number | No | Sets the identity trust mode: 0 = no restriction on sync, 1 = only sync to IDs rated approved, 2 = sync to all IDs but those on block list. |

## Results
The command does not return a value on success; it returns an error object if the operation fails.

**Return Type**: None (or error)

## Sample Examples

### Sample Example 1: Set Ratings for Specific Identities

**Command:**
```
verus setidentitytrust '{"setratings": {"MyFriend@": {"rating": "approved"}, "BusinessPartner@": {"rating": "approved"}}}'
```

**Sample Result:**
No return value on success.

### Sample Example 2: Clear All Ratings and Set New Trust Mode

**Command:**
```
verus setidentitytrust '{"clearall": true, "identitytrustmode": 1}'
```

**Sample Result:**
No return value on success.

### Sample Example 3: Remove Specific Ratings

**Command:**
```
verus setidentitytrust '{"removeratings": ["Untrusted@", "Competitor@"]}'
```

**Sample Result:**
No return value on success.

### Sample Example 4: Comprehensive Trust Configuration

**Command:**
```
verus setidentitytrust '{"clearall": true, "setratings": {"Partner@": {"rating": "approved"}, "Supplier@": {"rating": "approved"}, "Spammer@": {"rating": "blocked"}}, "identitytrustmode": 2}'
```

**Sample Result:**
No return value on success.

### Sample Example 5: Remote API Usage with curl

**Command:**
```
curl --user username:password --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setidentitytrust", "params": [{"setratings": {"MyFriend@": {"rating": "approved"}, "BusinessPartner@": {"rating": "approved"}}}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Sample Result:**
```json
{
  "result": null,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Invalid JSON Format:**
   ```
   error code: -8
   error message:
   Invalid parameter: expected JSON object
   ```

2. **Potential Error - Invalid Identity Format:**
   ```
   error code: -5
   error message:
   Invalid identity format
   ```

3. **Potential Error - Invalid Rating Value:**
   ```
   error code: -8
   error message:
   Invalid rating value: must be 'approved' or 'blocked'
   ```

4. **Potential Error - Invalid Trust Mode:**
   ```
   error code: -8
   error message:
   Invalid identitytrustmode value: must be 0, 1, or 2
   ```

5. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   One or more specified identities not found
   ```

6. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```
