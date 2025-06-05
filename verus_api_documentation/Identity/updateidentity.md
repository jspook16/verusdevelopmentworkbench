# Verus RPC Command: updateidentity

## Purpose
The `updateidentity` command is used to update the properties and attributes of an existing identity on the Verus blockchain. This command allows modifications to identity details while maintaining the identity's blockchain presence and history.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `updateidentity` command enables the modification of an existing Verus identity's properties, such as primary addresses, minimum signatures required, revocation authority, recovery authority, content maps, and other attributes. The command requires control of the identity being updated or the use of a tokenized ID control token. Identity updates create a historical record of changes, allowing for complete auditability and verification of an identity's evolution over time.

**Command Type**: Transaction  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon with control of the identity or its tokenized ID control token

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `jsonidentity` | object | Yes | N/A | New definition of the identity with updated properties |
| `returntx` | boolean | No | false | If true, returns transaction for additional signatures rather than committing it |
| `tokenupdate` | boolean | No | false | If true, the tokenized ID control token (if one exists) will be used to update, enabling changes to revocation or recovery IDs even without control of either |
| `feeoffer` | number | No | standard fee | Non-standard fee amount to pay for the transaction |
| `sourceoffunds` | string | No | N/A | Transparent or private address to source all funds for fees to preserve privacy of the identity |

The `jsonidentity` object can include the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The name of the identity being updated (must match existing identity) |
| `primaryaddresses` | array | List of addresses that control the identity |
| `minimumsignatures` | number | Minimum signatures required from primary addresses |
| `revocationauthority` | string | Identity or address with revocation authority |
| `recoveryauthority` | string | Identity or address with recovery authority |
| `contentmap` | object | Key-value store for 20-byte keys and 32-byte values |
| `contentmultimap` | object | Extended key-value store for structured data |
| `flags` | number | Special flags for the identity (e.g., locking) |
| `timelock` | number | Block height or delay for unlocking an identity |
| `privateaddress` | string | Optional. A Z-address to be associated with the identity. This address is stored with the identity and can be retrieved using `getidentity`. Unlike addresses in `primaryaddresses`, this field is typically for a single private address intended for specific purposes rather than general control. |

## Results
The command returns a transaction ID or a hex-encoded transaction, depending on the `returntx` parameter.

**Return Type**: String (hex)

If `returntx` is false (default), the command returns the transaction ID of the update transaction once it has been broadcast to the network.

If `returntx` is true, the command returns the hex-encoded transaction, which can be signed by additional parties if required (e.g., in a multi-signature setup) before being broadcast using `sendrawtransaction`.

## Examples

### Example 1: Update Primary Addresses

**Command:**
```
verus updateidentity '{"name":"MyIdentity","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX","RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}'
```

**Expected Result:**
```
"7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9"
```

### Example 2: Update with Return Transaction for Multi-Signature

**Command:**
```
verus updateidentity '{"name":"BusinessID","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX","RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w","RYQbUr9WtRRAnMjuddZMdpBKEMtLmU6Ro5"],"minimumsignatures":2,"revocationauthority":"iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs","recoveryauthority":"iLnmbuYSBABkS9ouLrWUareSeJkxnVtJxS"}' true
```

**Expected Result:**
```
"0100000001c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d0000000000ffffffff0100e1f505000000007500..."
```

### Example 3: Use Tokenized ID Control for Update

**Command:**
```
verus updateidentity '{"name":"TokenizedID","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],"minimumsignatures":1,"revocationauthority":"iS9tNwcNYwgYhanovtUvz72zBuvkDhhyH5","recoveryauthority":"iKj7Di3NqwosiQmQ7opUP6e8t5HJBGBHLs"}' false true
```

**Expected Result:**
```
"8d2f3b5c7e1a6d4f9a8c2b1d3e5f7a9c8b7d6e5f4a3c2b1d0e9f8a7b6c5d4e3f"
```

### Example 4: Update with Custom Fee and Source of Funds

**Command:**
```
verus updateidentity '{"name":"PrivateID","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}' false false 0.001 "RD6GgnrMpPaTSMn8vai6yiGA7mN4QGPV"
```

**Expected Result:**
```
"e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
```

### Example 5: Contentmultimap Update

**Command:**
```
verus -chain=VRSCTEST updateidentity '{"name":"CursorAI_NFT2", "contentmultimap":{ "iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ": [{"i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv":{"version": 1,"flags": 96,"mimetype":"text/plain","objectdata":{"message":"Hello from CursorAI_NFT2! This is a test message."}}}]}}'
```

**Expected Result:**
```
"0977a73cfe46a6c0cd989b0df79b85789f6e2df6ce1e3513a6534fb29c2266a6"
```

### Example 6: Contentmap Update with VDXF Key

**Command:**
```
verus updateidentity '{"name":"MyID@","contentmap":{"e5c061641228a399169211e666de18448b7b8bab":"68d838cf61b0958a086cd4a46e1e462371801212cee1f687ee687c701b09609a"}}'
```

**Expected Result:**
```
"5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
```

### Example 7: Associate a Private Z-Address

**Command:**
```
verus updateidentity '{"name":"catdog1@","privateaddress":"zs13uqv6mv0kf73vrlf0qhzv4nnyc6ks4jzug48hj0uxdtrvzvaz8kqm0gvy6zkseapkpmavq98sdv"}'
```

**Expected Result (Transaction ID):**
```
"3f9a0c1d2e5b8a7f6d5e4c3b2a1f09e8d7c6b5a4f3e2d1c0b9a8e7f6d5c4b3a2" 
```
**Verification with `getidentity` (after confirmation):**
```json
{
  "friendlyname": "catdog1.VRSCTEST@",
  "fullyqualifiedname": "catdog1.VRSCTEST@",
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": [
      "RViQWJCr97nmaroYaJQF5D4jJpShNnDxAr"
    ],
    "minimumsignatures": 1,
    "name": "catdog1",
    "identityaddress": "iBN2enGtbojLjemuoa8WET9C3T2GXUWkKd",
    "parent": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "privateaddress": "zs13uqv6mv0kf73vrlf0qhzv4nnyc6ks4jzug48hj0uxdtrvzvaz8kqm0gvy6zkseapkpmavq98sdv",
    "timelock": 0
  }
}
```

### Example 8: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "updateidentity", "params": [{"name":"MyIdentity","primaryaddresses":["RUf1LzGjSBrPrmdqTXaetF9nLKCb3xYdcX","RTxHZLqNVmLH36UVpTwankFNXafUxKBJ5w"],"minimumsignatures":1,"revocationauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq","recoveryauthority":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"}] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Result:**
```json
{
  "result": "7b1e3a7b53bbfde7aba72a1474f17691e7e5f310a22d9fc4b20c93e8538310a9",
  "error": null,
  "id": "curltest"
}
```

### Example 9: Update Contentmultimap with an Avatar Image

This example demonstrates updating an identity's `contentmultimap` to include an avatar image. The avatar data is stored as a hex string, and the entry is labeled with the VDXF key corresponding to `profile.avatar.image`.

**Assumptions:**
-   You have the VDXF key for primary content: `iMvTg2HGhKKGYMqtapvRyfZNahbzmD9R3b`
-   You have the VDXF key for a DataDescriptor: `i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv`
-   You have the VDXF key for `profile.avatar.image`: `iJv7REmMND6UHwL26nxS48oCXTmUycJfZv` (this will be used as the `label`)
-   You have the avatar image data as a hexadecimal string (e.g., `0x89504e47...`). For brevity, this will be represented as `"[HEX_IMAGE_DATA]"`.

**Command:**
```bash
/path/to/your/verus-cli/verus -chain=VRSCTEST updateidentity '{
  "name": "moneybag1",
  "contentmultimap": {
    "iMvTg2HGhKKGYMqtapvRyfZNahbzmD9R3b": [
      {
        "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
          "version": 1,
          "flags": 96,
          "mimetype": "image/png",
          "objectdata": "[HEX_IMAGE_DATA]",
          "label": "iJv7REmMND6UHwL26nxS48oCXTmUycJfZv"
        }
      }
    ]
  }
}'
```

**Note on `[HEX_IMAGE_DATA]`**: Replace `[HEX_IMAGE_DATA]` with the actual `0x`-prefixed hexadecimal string of your image. For example: `0x89504e470d0a1a0a0000000d4948445200000020...` (a very long string).

**Expected Result (Transaction ID):**
```
"d9231376b28e528439a1c3ad0d755eb75efb7d30823f945b85f48cae8f5d5653"
```
(The actual transaction ID will vary.)

**Explanation:**
- The identity `moneybag1` is updated.
- The `contentmultimap` is modified.
- The primary content key `iMvTg2HGhKKGYMqtapvRyfZNahbzmD9R3b` holds an array.
- Inside this array, an object keyed by the DataDescriptor VDXF key `i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv` contains the image details.
    - `version`, `flags`, and `mimetype` are set.
    - `objectdata` contains the hex string of the PNG image.
    - `label` is set to the VDXF key `iJv7REmMND6UHwL26nxS48oCXTmUycJfZv`, semantically identifying this data as the `profile.avatar.image`.

### Example 10: Updating a Sub-Identity (Critical: Separate Name and Parent Parameters)

**Important Discovery**: When updating sub-identities, the `updateidentity` command requires the sub-identity's name and parent to be specified separately, rather than using the fully qualified name format.

**Incorrect Format for Sub-Identities (will fail with "Invalid primary identity" error):**
```json
{
  "name": "subid.parent@"  // This format fails for sub-identity updates
}
```

**Correct Format for Sub-Identities:**
```json
{
  "name": "subid@",        // Sub-identity name with @ symbol
  "parent": "parent@"      // Parent identity name with @ symbol
}
```

**Command Example - Updating Sub-Identity Content:**
```
verus updateidentity '{
  "name": "573242_1of3@",
  "parent": "shylock@", 
  "contentmultimap": {
    "iMzWvy5j4ciiMSBsEEVzfy66awLQ85b4GN": [
      {
        "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
          "version": 1,
          "flags": 0,
          "mimetype": "application/json",
          "objectdata": {
            "registration_txid": "abc123...",
            "ticket_validation": {
              "signed_by_ticket_hash": "def456...",
              "signed_by_ticket_signature": "ghi789..."
            }
          },
          "label": "Sub-Identity Data"
        }
      }
    ]
  },
  "sourceoffunds": "shylock@"
}'
```

**Expected Result:**
```
"a0c2886e18e9ccafec0d42ee8f4705d97430a4a894c0e604de9ef548af613ddd"
```

**Command Example - Updating Sub-Identity Primary Address:**
```
verus updateidentity '{
  "name": "testsub@",
  "parent": "parentid@",
  "primaryaddresses": ["RNewPrimaryAddressForSubIdentity123..."]
}'
```

**Key Points for Sub-Identity Updates:**
- The `name` parameter should be the sub-identity's name followed by `@` (e.g., `"subid@"`)
- The `parent` parameter should be the parent identity's full name with `@` (e.g., `"parent@"`)
- Do NOT use the fully qualified format (`"subid.parent@"`) in the `name` field for sub-identities
- The `sourceoffunds` parameter can specify which identity pays the transaction fee
- The wallet must control the primary addresses of the sub-identity for authorization
- This format is required for all sub-identity updates including `contentmultimap`, `primaryaddresses`, and other identity properties

## Technical Details

### Transaction Structure
The `updateidentity` command creates a transaction that modifies the identity's blockchain record. The transaction includes:

1. Inputs: Funds to cover transaction fees
2. Outputs: An identity output with the updated identity definition
3. Signatures: From the appropriate controlling addresses

### Identity Data Storage
Identity information is stored on the Verus blockchain in specialized identity outputs. These outputs include:

- Control information (addresses, signature requirements)
- Authority designations (revocation, recovery)
- Content maps (VDXF key-value storage)
- Content multi-maps (structured data storage)

### Fee Considerations
Identity updates require transaction fees. The fee amount depends on:

- The size of the transaction (larger updates cost more)
- The current network fee rate
- Any custom fee offer specified in the command

### Important Note on Contentmap and Contentmultimap Updates

When updating an identity that has an existing `contentmap` or `contentmultimap`, it is critical to understand that providing either of these fields in the `jsonidentity` object will **completely replace** the existing map on the identity. The update operation does not perform a merge or partial update of these map fields.

- **To add new entries or modify existing ones while preserving others**: You must first retrieve the current state of the map (e.g., using `getidentity`), incorporate your changes into this retrieved map data, and then submit the complete, updated map in the `updateidentity` command.
- **Omitting an existing entry**: If you provide a `contentmap` or `contentmultimap` object that omits entries currently present on the identity, those omitted entries will be deleted.
- **Clearing a map**: To intentionally clear an entire map, provide an empty object for that map field (e.g., `"contentmap":{}`).

**Example: Illustrating contentmap Replacement**

1.  **Initial state of an identity (from `getidentity MyID@`):**
    ```json
    {
      "identity": {
        "name": "MyID",
        // ... other fields
        "contentmap": {
          "key1_hash160": "value1_hash",
          "key2_hash160": "value2_hash"
        }
      }
      // ... status fields
    }
    ```

2.  **Attempting to add `key3` by only specifying `key3` in `updateidentity`:**
    ```bash
    verus updateidentity '{"name":"MyID@","contentmap":{"key3_hash160":"value3_hash"}}'
    ```

3. **Resulting state of the identity (from `getidentity MyID@` after update):**
    ```json
    {
      "identity": {
        "name": "MyID",
        // ... other fields
        "contentmap": {
          "key3_hash160": "value3_hash" // key1 and key2 are gone!
        }
      }
      // ... status fields
    }
    ```

4.  **Correct way to add `key3` while preserving `key1` and `key2`:**
    Retrieve the current `contentmap`, add `key3`, then update:
    ```bash
    verus updateidentity '{"name":"MyID@","contentmap":{"key1_hash160":"value1_hash","key2_hash160":"value2_hash","key3_hash160":"value3_hash"}}'
    ```

## Potential Error Cases

1. **Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```

2. **Cannot Update Identity:**
   ```
   error code: -5
   error message:
   Cannot update identity. Not primary or recovery authority
   ```

3. **Invalid Identity Format:**
   ```
   error code: -8
   error message:
   Invalid identity object format
   ```

4. **Invalid Identity Name:**
   ```
   error code: -8
   error message:
   Identity name must match existing identity
   ```

5. **Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds
   ```

6. **Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

7. **Invalid Contentmap Format:**
   ```
   error code: -8
   error message:
   Invalid contentmap format. Keys must be 20-byte hexadecimal strings
   ```

8. **Potential Error - Incorrect Sub-Identity Format:**
   ```
   error code: -26
   error message:
   Unable to commit identity update transaction: bad-txns-failed-precheck
   ```
   
   **Daemon Log Error:**
   ```
   ERROR: Invalid primary identity - does not include identity reservation or spend matching identity
   ```
   
   **Solution:** Use the separate `name` and `parent` parameters format for sub-identity updates as shown in Example 10.

## Use Cases

### Identity Management
- Update control addresses for improved security
- Implement multi-signature control for organizational identities
- Transfer control of identities in a secure manner

### Content Association
- Link identities to external content through contentmap
- Store profile information in structured formats
- Associate identities with metadata about capabilities and services

### Security Controls
- Implement revocation procedures for compromised identities
- Establish recovery mechanisms for lost access
- Set up time-locked identity controls for scheduled transfers

### Data Storage
- Store VDXF-keyed data for application use
- Create standardized data formats for cross-application compatibility
- Reference content stored on decentralized storage systems

## Related Commands

- `getidentity` - Retrieve information about an identity
- `registernamecommitment` - First step in creating a new identity
- `registeridentity` - Complete the process of creating a new identity
- `revokeidentity` - Revoke an identity using its revocation authority
- `recoveridentity` - Recover a revoked identity using its recovery authority
- `setvdxffield` - Set a specific VDXF field in a structured format
- `getvdxfid` - Generate a VDXF ID from a qualified name
- `sendrawtransaction` - Broadcast a signed transaction (used with returntx)

## References

### Updating VerusID Contentmap with the UpdateIdentity Command

The contentmap is a key-value store within a VerusID that allows you to associate standardized data identifiers (VDXF keys) with content hashes. This enables VerusIDs to point to arbitrary data stored in decentralized or centralized systems.

#### Complete Process to Update a VerusID Contentmap

##### Step 1: Generate a VDXF Key

First, you need a VDXF key that represents the type of data you're storing. Generate this using the `getvdxfid` command:

```
./verus getvdxfid "qualified.name.string"
```

Example:
```
./verus getvdxfid "myapp::profile.avatar"
```

This returns a JSON object containing several fields. For contentmap updates, you need the `hash160result` value, which is a 40-character hexadecimal string:

```json
{
  "vdxfid": "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c",
  "indexid": "xPwgY6oPdusaAgNK3u5yHCQG5NsHEcBpi5",
  "hash160result": "e5c061641228a399169211e666de18448b7b8bab",
  "qualifiedname": {
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
    "name": "myapp::profile.avatar"
  }
}
```

##### Step 2: Prepare Your Content Hash Value

The value in the contentmap must be a 32-byte hash, represented as a 64-character hexadecimal string. This typically:
- Points to content on a decentralized storage system like Arweave or IPFS
- Provides a cryptographic hash of your content for verification
- Allows applications to locate and retrieve the actual data

##### Step 3: Execute the UpdateIdentity Command

Use the following structure for the command:

```
verus updateidentity '{"name":"yourVerusID@","contentmap":{"hash160Value":"contentHashValue"}}'
```

Where:
- `yourVerusID@` is your VerusID (including the @ symbol)
- `hash160Value` is the 40-character `hash160result` from Step 1
- `contentHashValue` is your 64-character content hash from Step 2

##### Complete Example

1. Generate a VDXF key for an avatar image:
   ```
   ./verus getvdxfid "myapp::profile.avatar"
   ```
   
   Result (extract the `hash160result`):
   ```
   "hash160result": "e5c061641228a399169211e666de18448b7b8bab"
   ```

2. Prepare your content hash (example for an Arweave-stored image):
   ```
   68d838cf61b0958a086cd4a46e1e462371801212cee1f687ee687c701b09609a
   ```

3. Execute the update command:
   ```
   ./verus updateidentity '{"name":"myID@","contentmap":{"e5c061641228a399169211e666de18448b7b8bab":"68d838cf61b0958a086cd4a46e1e462371801212cee1f687ee687c701b09609a"}}'
   ```

#### Critical Requirements

1. **Key Format**: The contentmap key MUST be in hexadecimal format (only characters 0-9 and a-f)
2. **Key Length**: The contentmap key is typically 40 hexadecimal characters in length (representing a 20-byte hash)
3. **Value Format**: The contentmap value MUST be in hexadecimal format (only characters 0-9 and a-f)
4. **Value Length**: The contentmap value is typically 64 hexadecimal characters in length (representing a 32-byte hash)
5. **No Formatting**: Both key and value must be properly formatted without spaces or other characters
6. **JSON Escaping**: Ensure proper JSON escaping in the command string

#### Updating Multiple Contentmap Entries Simultaneously

You can update multiple contentmap entries in a single command by adding more key-value pairs:

```
verus updateidentity '{"name":"myID@","contentmap":{
  "e5c061641228a399169211e666de18448b7b8bab":"68d838cf61b0958a086cd4a46e1e462371801212cee1f687ee687c701b09609a",
  "f7a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}}'
```

#### Removing Contentmap Entries

To remove a contentmap entry, update it with an empty string or null value, depending on your Verus version:

```
verus updateidentity '{"name":"myID@","contentmap":{"e5c061641228a399169211e666de18448b7b8bab":""}}'
```

#### Best Practices for Contentmap Updates

1. **Use Standardized VDXF Keys**: Follow community standards for naming conventions
2. **Document Key Usage**: Maintain documentation of which VDXF keys your application uses
3. **Verify Updates**: Always verify contentmap updates were successful using `getidentity`
4. **Backup Keys**: Keep a backup of your VDXF keys and their corresponding qualified names
5. **Content Storage**: When using external storage systems, ensure your content is properly tagged with the corresponding VDXF key

### Updating VerusID Contentmultimap with the UpdateIdentity Command

The contentmultimap is an advanced key-value store within a VerusID that extends beyond the simpler contentmap by allowing structured, hierarchical data storage. Unlike the contentmap which is limited to simple hash pairs, the contentmultimap enables more complex data organization and storage of JSON-structured information directly within a VerusID.

#### Complete Process to Update a VerusID Contentmultimap

##### Step 1: Generate VDXF Keys

First, you need to generate VDXF keys that represent the types of data you're storing. These keys provide a standardized way to identify different data types and structures within your contentmultimap.

Generate VDXF keys using the `getvdxfid` command:

```
./verus getvdxfid "qualified.name.string"
```

Example:
```
./verus getvdxfid "myapp::profile"
```

This returns a JSON object containing several fields:

```json
{
  "vdxfid": "iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ",
  "indexid": "xPwgY6oPdusaAgNK3u5yHCQG5NsHEcBpi5",
  "hash160result": "e5c061641228a399169211e666de18448b7b8bab",
  "qualifiedname": {
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
    "name": "myapp::profile"
  }
}
```

For the primary key in your contentmultimap, you'll use the `vdxfid` value (i-address format).

You may need additional VDXF keys for nested structures:

```
./verus getvdxfid "myapp::profile.data"
```

Returns:
```json
{
  "vdxfid": "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv",
  "indexid": "xRNdPaBgJkcKNZcW4xZuTeQzKFdXr8cWqT",
  "hash160result": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  "qualifiedname": {
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
    "name": "myapp::profile.data"
  }
}
```

##### Step 2: Prepare Your Structured Data

Unlike the contentmap which only accepts hash values, the contentmultimap can store structured JSON data. Prepare your data structure according to your application's needs.

Example of a simple data structure:

```json
{
  "version": 1,
  "flags": 96,
  "mimetype": "text/plain",
  "objectdata": {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Blockchain developer and Verus enthusiast"
  }
}
```

##### Step 3: Structure Your Contentmultimap

The contentmultimap is organized hierarchically using VDXF keys. The basic structure is:

```json
"contentmultimap": {
  "primaryVDXFid": [
    {
      "nestedVDXFid": {
        "structured data here"
      }
    }
  ]
}
```

Note the key aspects:
- The primary VDXF ID is the top-level key
- Its value is an array (allowing multiple entries per key)
- Each array element is an object with nested VDXF IDs as keys
- The nested VDXF keys contain the actual structured data

##### Step 4: Execute the UpdateIdentity Command

Use the following structure for the command:

```
verus updateidentity '{"name":"yourVerusID@","contentmultimap":{"primaryVDXFid":[{"nestedVDXFid":{"structured data"}}]}}'
```

Where:
- `yourVerusID@` is your VerusID (including the @ symbol)
- `primaryVDXFid` is the i-address format VDXF ID from Step 1
- `nestedVDXFid` is another i-address format VDXF ID for the nested data
- `structured data` is your JSON object from Step 2

##### Complete Example

1. Generate primary VDXF key for a profile:
   ```
   ./verus getvdxfid "myapp::profile"
   ```
   Result: `"vdxfid": "iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ"`

2. Generate nested VDXF key for profile data:
   ```
   ./verus getvdxfid "myapp::profile.data"
   ```
   Result: `"vdxfid": "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv"`

3. Execute the update command:
   ```
   verus updateidentity '{"name":"myID@","contentmultimap":{"iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ":[{"i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv":{"version":1,"flags":96,"mimetype":"text/plain","objectdata":{"name":"John Doe","email":"john@example.com","bio":"Blockchain developer and Verus enthusiast"}}}]}}'
   ```

#### Critical Requirements for Contentmultimap

1. **Key Format**: The contentmultimap keys must be valid VDXF IDs in i-address format (starting with "i")
2. **Array Structure**: The primary key's value must be an array, even if it contains only one element
3. **Nested Object Structure**: Each array element must be an object with VDXF ID keys
4. **Valid JSON**: All data must be valid JSON, with proper escaping of special characters
5. **Size Limits**: The entire structure must fit within blockchain transaction size limits
6. **JSON Escaping**: Ensure proper JSON escaping in the command string for nested quotes and special characters

#### Updating Multiple Contentmultimap Entries

##### Adding Multiple Entries to the Same Primary Key

You can add multiple entries to the same primary key by including multiple objects in the array:

```
verus updateidentity '{"name":"myID@","contentmultimap":{"iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ":[
  {"i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv":{"version":1,"flags":96,"mimetype":"text/plain","objectdata":{"name":"John Doe"}}},
  {"i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv":{"version":1,"flags":96,"mimetype":"text/plain","objectdata":{"name":"Jane Smith"}}}
]}}'
```

##### Using Multiple Primary Keys

You can update multiple primary keys in a single command:

```
verus updateidentity '{"name":"myID@","contentmultimap":{
  "iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ":[{"i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv":{"version":1,"flags":96,"objectdata":{"profile":"data"}}}],
  "iBDHy7Kt2VUSQA6c192zCZCrYVfnUxGnBi":[{"iCzF6SGhaH3KV6YEjycvULpmfQfdwAFRWS":{"version":1,"flags":96,"objectdata":{"settings":"data"}}}]
}}'
```

#### Removing Contentmultimap Entries

To remove a contentmultimap entry, you have several options:

##### Remove an Entire Primary Key

Set the primary key to an empty array:

```
verus updateidentity '{"name":"myID@","contentmultimap":{"iSSmnhzPg6voUhoixXfB1k6qYrGiMsQBWZ":[]}}'
```

##### Replace the Entire Contentmultimap

To reset the entire contentmultimap:

```
verus updateidentity '{"name":"myID@","contentmultimap":{}}'
```

##### Replace a Specific Entry

To replace a specific entry, update with the new data - the previous data will be overwritten.

#### Contentmultimap vs. Contentmap

| Feature | Contentmap | Contentmultimap |
|---------|------------|-----------------|
| Data Type | Hexadecimal hash pairs only | Structured JSON data |
| Key Format | Hash160 (40 hex chars) | VDXF ID (i-address) |
| Value Format | 32-byte hash (64 hex chars) | JSON structure |
| Nesting | Not supported | Supported with nested VDXF IDs |
| Multiple Entries | One value per key | Array of values per key |
| Use Case | References to external content | Direct storage of structured data |

#### Best Practices for Contentmultimap Updates

1. **Use Descriptive VDXF Names**: Choose clear, descriptive qualified names for your VDXF keys
2. **Document Key Structure**: Maintain documentation of your contentmultimap structure and schema
3. **Follow Common Schemas**: Use established schema patterns when possible for interoperability
4. **Version Your Data**: Include version information in your data to support future schema evolution
5. **Validate Before Updating**: Verify your JSON structure is valid before executing the update
6. **Test on Testnet**: Test complex contentmultimap updates on the Verus testnet before applying to mainnet
7. **Verify Updates**: Always verify contentmultimap updates were successful using `getidentity`
8. **Consider Data Size**: Keep data structures compact to minimize transaction costs
9. **Use Appropriate MIME Types**: Include proper MIME type information for stored data
