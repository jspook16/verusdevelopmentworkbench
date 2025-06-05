## Important Note About VDXF Data Structures

### DataDescriptor Structure

One of the most commonly used structures with VDXF keys is the DataDescriptor, identified by the VDXF key `i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv`. This structure is used to describe and potentially encrypt data in the Verus ecosystem.

The DataDescriptor has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `version` | Number | Version number (default: 1) |
| `flags` | Number | Flags indicating which items are present in the object |
| `objectdata` | Buffer/String | The actual data or reference to it |
| `label` | String | A label associated with this data |
| `mimeType` | String | Optional MIME type of the data |
| `salt` | Buffer | Optional cryptographic salt (present if encrypted) |
| `epk` | Buffer | Optional encryption public key (present if encrypted) |
| `ivk` | Buffer | Optional incoming viewing key |
| `ssk` | Buffer | Optional specific symmetric key for this object |

Example usage in a JSON object:

```json
{
  "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
    "version": 1,
    "objectdata": "Polar Bears",
    "mimetype": "text/plain",
    "label": "myzoo.vrsc::enclosure.name",
    "salt": "a8edd6a19b359365c797bc27164aeb7f12a2d1cfc4f2786871564926dbb5b96f"
  }
}
```

This structure demonstrates how VDXF keys enable both type identification and structured data storage within the Verus ecosystem, supporting applications from simple data storage to complex encrypted data management.### Practical Applications of VDXF Keys

VDXF keys have numerous practical applications in the Verus ecosystem:

1. **Type Identification**: VDXF keys serve as identifiers for data types, enabling applications to understand and process data correctly. For example, `iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c` identifies string data.

2. **JSON Key-Value Stores**: When used as keys in JSON objects, VDXF keys provide type information about their associated values. For example:
   ```json
   {
     "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c": "I'm a string"
   }
   ```

3. **Complex Data Structures**: VDXF keys can identify complex data structures like DataDescriptor objects, which include version, object data, MIME type, label, and optional encryption information.

4. **Standard Types Library**: Verus provides a standard library of VDXF keys for common data types, including:
   - Primitive types: byte, int16, uint16, int32, uint32, int64, uint64, uint160, uint256, string
   - Collection types: vector, bytevector, int32vector, int64vector
   - Complex types: currencymap, ratings, url, transferdestination, utxoref, datadescriptor
   - Encryption-related: encryptiondescriptor, salteddata
   - Identity-related: multimapkey, multimapremove, profile.media
   - System functions: zmemo.message, zmemo.signature, currency.startnotarization

### Common VDXF Usage Pattern

The typical pattern for using VDXF keys in applications involves:

1. Generate VDXF keys for your application's data types using `getvdxfid`
2. Use these keys in contentmaps, JSON objects, or other data structures
3. When processing data, check the VDXF key to determine the type and structure
4. Apply appropriate parsing and processing based on the identified type# Verus RPC Command: getvdxfid

## Purpose
The `getvdxfid` command is designed to generate and retrieve VDXF (Verus Defined Cross-chain Format) identifiers for URI strings within the Verus ecosystem. This command is essential for creating standardized, globally unique identifiers that can be used across multiple blockchains for data organization, indexing, and referencing. VDXF keys provide a hierarchical naming system that enables structured data representation and interoperability in cross-chain applications, facilitating exchange of information between different systems and programming languages.

## Daemon Requirements
- No special daemon parameters required

## Description
The `getvdxfid` command processes a VDXF URI string (e.g., "vrsc::system.currency.export") and generates a unique identifier in the form of an i-address (base58check format) and its corresponding hash160 value. Additionally, the command can combine the URI hash with other parameters like existing VDXF keys, 256-bit hashes, or index numbers to create derived identifiers. This capability is fundamental for building hierarchical data structures, namespaces, and relational references within decentralized applications on the Verus network.

VDXF is not a strongly opinionated type description specification but rather focuses on a model for recognizing an unlimited number of user-defined data types. It uses a standard human-readable format for definition and encoding of type specifiers, which are then hashed to produce collision-free, 20-byte keys. These keys can be associated with retrievable content hashes and location qualifiers, enabling applications to locate, recognize, parse, and decode various forms of application or system-specific data.

VDXF keys are required when updating the contentmap of a VerusID. The contentmap is a key-value store attached to VerusIDs, and the keys must be valid VDXF keys generated using this command. To update the contentmap of a VerusID, the RPC command `updateidentity` is used, which requires valid VDXF keys for all contentmap entries. This ensures that all data stored in VerusID contentmaps follows a standardized identification pattern.

**Command Type**: Utility  
**Protocol Level**: VDXF Layer  
**Access Requirement**: Basic node access

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `vdxfuri` | string | Yes | N/A | The URI string to be converted to a VDXF identifier. This can be either a system-level URI (e.g., "system.currency.export") or an identity-based URI (e.g., "idname::userdefinedgroup.subgroup.publishedname"). The URI should follow the VDXF naming conventions. |
| `extraparams` | object | No | N/A | Optional JSON object containing additional parameters to combine with the URI hash. This allows for creating derived identifiers by binding additional data to the base URI. |
| » `vdxfkey` | string | No | N/A | Optional VDXF key or i-address to combine with the URI hash. This is useful for creating hierarchical relationships between VDXF keys. |
| » `uint256` | hexstring | No | N/A | Optional 256-bit hash in hex format to combine with the URI hash. Must be a valid 32-byte hex string. |
| » `indexnum` | integer | No | N/A | Optional 32-bit integer to combine with the URI hash. Useful for creating indexed collections of related VDXF keys. |

### Argument Examples

1. Basic URI:
```json
"system.currency.export"
```

2. Identity-based URI:
```json
"myidentity::nft.metadata"
```

3. URI with extra parameters:
```json
{
  "vdxfuri": "system.currency.export",
  "extraparams": {
    "vdxfkey": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "indexnum": 42
  }
}
```

## Results
The command returns a JSON object containing the following fields:

| Property | Type | Description |
|----------|------|-------------|
| `vdxfid` | string (base58check) | The i-ID (identity ID) of the processed URI with all combined parameters. This is the primary identifier that can be used in Verus applications. |
| `hash160result` | string (hexstring) | The 20-byte hash in hex format of the processed URI string. This is the raw hash value before conversion to base58check format. |
| `qualifiedname` | object | An object containing the separated name components of the URI. |
| » `name` | string | The leaf name component of the URI (e.g., "export" in "system.currency.export"). |
| » `parentid` or `namespace` | string | The parent ID or namespace of the name. For system URIs, this is the namespace (e.g., "system.currency"). For identity URIs, this is the parent identity ID. |
| `bounddata` | object | If additional data was bound to create the value, it is returned in this object. This field is only present when extraparams were provided. |
| » `vdxfkey` | string | The i-address that was combined via hash, if a vdxfkey was provided in extraparams. |
| » `uint256` | string (hexstring) | The 256-bit hash combined with the URI hash, if a uint256 was provided in extraparams. |
| » `indexnum` | integer | The 32-bit integer combined with the URI hash, if an indexnum was provided in extraparams. |

### Result Examples

1. Basic Result:
```json
{
  "vdxfid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "hash160result": "a5dfc49feaa9b91515be94b5b4e5a267d18e81c9",
  "qualifiedname": {
    "name": "export",
    "namespace": "system.currency"
  }
}
```

2. Result with Bound Data:
```json
{
  "vdxfid": "i7KFGDcshRKV2jpJEKzRWpgQQgJTZYiZXe",
  "hash160result": "d7c32a9f6c8e4b1d5a7f9e0d2c1b3a5d4e6f8c7",
  "qualifiedname": {
    "name": "export",
    "namespace": "system.currency"
  },
  "bounddata": {
    "vdxfkey": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "indexnum": 42
  }
}
```

## Examples

### Example 1: Generate a VDXF ID for a System URI

**Command:**
```
verus getvdxfid "system.currency.export"
```

**Potential Output:**
```json
{
  "vdxfid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
  "hash160result": "a5dfc49feaa9b91515be94b5b4e5a267d18e81c9",
  "qualifiedname": {
    "name": "export",
    "namespace": "system.currency"
  }
}
```

This example demonstrates generating a VDXF ID for a system-level URI related to currency export functionality.

### Example 2: Generate a VDXF ID for a User-Defined URI

**Command:**
```
verus getvdxfid "idname::userdefinedgroup.subgroup.publishedname"
```

**Potential Output:**
```json
{
  "vdxfid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
  "hash160result": "f9e72a10b8d0ae8c1dd6e218c7f5a85b3c1f9d7f",
  "qualifiedname": {
    "name": "publishedname",
    "parentid": "iDX8bhkBm4VSWZr5uPMQdacab7GB9Ak37S"
  }
}
```

This example demonstrates generating a VDXF ID for a user-defined hierarchical URI structure.

### Example 3: Generate a VDXF ID with Bound Data

**Command:**
```
verus getvdxfid "system.currency.export" '{"vdxfkey":"iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", "indexnum":42}'
```

**Potential Output:**
```json
{
  "vdxfid": "i7KFGDcshRKV2jpJEKzRWpgQQgJTZYiZXe",
  "hash160result": "d7c32a9f6c8e4b1d5a7f9e0d2c1b3a5d4e6f8c7",
  "qualifiedname": {
    "name": "export",
    "namespace": "system.currency"
  },
  "bounddata": {
    "vdxfkey": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "indexnum": 42
  }
}
```

This example demonstrates generating a VDXF ID with additional bound data to create a derived identifier.

### Example 4: Generate a VDXF ID for a Standard Data Type

**Command:**
```
verus getvdxfid "vrsc::data.type.string"
```

**Potential Output:**
```json
{
  "vdxfid": "iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c",
  "indexid": "xPwgY6oPdusaAgNK3u5yHCQG5NsHEcBpi5",
  "hash160result": "e5c061641228a399169211e666de18448b7b8bab",
  "qualifiedname": {
    "namespace": "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
    "name": "vrsc::data.type.string"
  }
}
```

This example demonstrates generating a VDXF ID for a standard data type (string) that can be used in Verus applications to identify string data in key-value stores.

### Example 5: Remote API Usage with curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getvdxfid", "params": ["idname::userdefinedgroup.subgroup.publishedname"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format of Response:**
```json
{
  "result": {
    "vdxfid": "i9KLnM5wrU49D8esN6Bm37pFeiQQkG4BR2",
    "hash160result": "f9e72a10b8d0ae8c1dd6e218c7f5a85b3c1f9d7f",
    "qualifiedname": {
      "name": "publishedname",
      "parentid": "iDX8bhkBm4VSWZr5uPMQdacab7GB9Ak37S"
    }
  },
  "error": null,
  "id": "curltest"
}
```

## Technical Details

### URI Format Conventions

VDXF URIs follow specific formatting conventions:

1. **System-level URIs**: Typically start with "system" followed by hierarchical components
   - Example: `system.currency.export`

2. **Identity-based URIs**: Start with an identity name followed by "::" and hierarchical components
   - Example: `idname::userdefinedgroup.subgroup.publishedname`

3. **Qualified Names**: Include both a leaf name and parent/namespace information
   - The leaf name is the last component of the URI
   - The parent/namespace is everything preceding the leaf name

### Hashing Process

The VDXF ID generation process involves:

1. Converting the URI string to a standardized format
2. Computing a RIPEMD-160 hash of the SHA-256 hash of the formatted string
3. Combining with any additional bound data through deterministic hashing
4. Converting the resulting hash to an i-address (base58check format with an identity prefix)

### Use Cases

VDXF IDs serve multiple purposes in the Verus ecosystem:

1. **Namespace Management**: Creating hierarchical name spaces for decentralized data organization. VDXF keys are used to update a Verus ID contentmap field with the updateidentity RPC command
2. **Cross-Chain References**: Enabling consistent data references across multiple blockchains
3. **Data Indexing**: Providing standardized keys for storing and retrieving blockchain data
4. **Smart Transactions**: Allowing deterministic addressing of smart transaction components
5. **Protocol Definitions**: Defining standard protocol identifiers for interoperability

## Potential Error Cases

1. **Potential Error - Empty URI String:**
   ```
   error code: -8
   error message:
   VDXF URI string cannot be empty
   ```

2. **Potential Error - Invalid Format:**
   ```
   error code: -8
   error message:
   Invalid VDXF URI format
   ```

3. **Potential Error - Invalid Bound Data Format:**
   ```
   error code: -8
   error message:
   Invalid bound data format
   ```

4. **Potential Error - Invalid VDXF Key:**
   ```
   error code: -5
   error message:
   Invalid VDXF key or i-address format
   ```

5. **Potential Error - Invalid uint256 Hash:**
   ```
   error code: -8
   error message:
   uint256 must be a 32-byte hex string
   ```
