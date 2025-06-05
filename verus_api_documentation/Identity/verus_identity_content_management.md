# Verus Identity Content Management Guide

## 0. Creating VDXF Keys (Prerequisite)

### Process:
1. **Create VDXF Key Definition**:
```json
{
  "name": "KeyName",
  "version": 1,
  "flags": 96,
  "mimetype": "text/plain",
  "objectdata": {
    "message": "Key description"
  }
}
```

2. **Get VDXF Key**:
```bash
./verus -chain=VRSCTEST getvdxfkey "KeyName"
```

3. **Verify VDXF Key**:
```bash
./verus -chain=VRSCTEST getidentity "KeyName.VRSCTEST@"
```

### Important Notes:
- VDXF keys must be created before they can be used in contentmap
- Each VDXF key needs a unique name
- The key's identity address will be used as the VDXF key in contentmap
- Keys can be reused across different identities
- Keys should be descriptive of their intended content type

## 1. Adding Content to ContentMap

### Prerequisites:
- Access to a running Verus daemon
- Control of the identity you want to update
- Wallet unlocked with `walletpassphrase` command

### Process:
1. **Create VDXF Key Definition**:
```bash
# Create a JSON file with the key definition
echo '{
  "name": "my.content.key",
  "version": 1,
  "flags": 96,
  "mimetype": "text/plain",
  "objectdata": {
    "message": "Description of this key's purpose"
  }
}' > key_definition.json
```

2. **Get the VDXF Key**:
```bash
# This will return the VDXF key (i-address) that we'll use in the contentmap
./verus -chain=VRSCTEST getvdxfkey "my.content.key"
```

3. **Verify the VDXF Key**:
```bash
# Verify the key was created successfully
./verus -chain=VRSCTEST getidentity "my.content.key.VRSCTEST@"
```

4. **Unlock Your Wallet** (if locked):
```bash
./verus -chain=VRSCTEST walletpassphrase "your_wallet_passphrase" 60
```

5. **Update the Identity with Content**:
```bash
./verus -chain=VRSCTEST updateidentity "YourIdentityName.VRSCTEST@" '{
  "name": "YourIdentityName",
  "primaryaddresses": ["YOUR_ADDRESS"],
  "minimumsignatures": 1,
  "contentmap": {
    "VDXF_KEY_FROM_STEP_2": {
      "version": 1,
      "flags": 96,
      "mimetype": "text/plain",
      "objectdata": {
        "message": "Your actual content here"
      }
    }
  }
}'
```

6. **Verify the Content was Added**:
```bash
# Get the content using the VDXF key
./verus -chain=VRSCTEST getidentitycontent "YourIdentityName.VRSCTEST@" 0 0 false "VDXF_KEY_FROM_STEP_2"
```

### Important Notes:
- Replace `YourIdentityName` with your actual VerusID name
- Replace `YOUR_ADDRESS` with your actual address
- Replace `VDXF_KEY_FROM_STEP_2` with the i-address returned from step 2
- The wallet must be unlocked before updating the identity
- Make sure you have sufficient funds for the transaction
- The content is stored in the `objectdata.message` field
- You can add multiple content items in a single update by adding more entries to the contentmap

## 2. Retrieving Content from ContentMap

### Basic Retrieval:
```bash
./verus -chain=VRSCTEST getidentitycontent "IdentityName.VRSCTEST@"
```

### Retrieval with Parameters:
```bash
./verus -chain=VRSCTEST getidentitycontent "IdentityName.VRSCTEST@" [heightstart] [heightend] [txproofs] [vdxfkey] [keepdeleted]
```

### Parameter Details:
- `heightstart`: Starting block height (0 for all)
- `heightend`: Ending block height (0 for all)
- `txproofs`: Boolean for transaction proofs (true/false)
- `vdxfkey`: Specific VDXF key to retrieve
- `keepdeleted`: Boolean to include deleted content (true/false)

### Example with All Parameters:
```bash
./verus -chain=VRSCTEST getidentitycontent "IdentityName.VRSCTEST@" 0 0 false "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv" true
```

## 3. Expected Response Format

```json
{
  "fullyqualifiedname": "IdentityName.VRSCTEST@",
  "status": "active",
  "canspendfor": true,
  "cansignfor": true,
  "blockheight": 531572,
  "fromheight": 0,
  "toheight": 531590,
  "txid": "transaction_id",
  "identity": {
    "version": 3,
    "flags": 0,
    "primaryaddresses": ["ADDRESS"],
    "minimumsignatures": 1,
    "name": "IdentityName",
    "identityaddress": "identity_address",
    "contentmap": {
      "VDXF_KEY": {
        "version": 1,
        "flags": 96,
        "mimetype": "text/plain",
        "objectdata": {
          "message": "Content to store"
        }
      }
    }
  }
}
```

## 4. Common Error Cases

1. **Wallet Locked**:
```
error code: -13
error message: Error: Please enter the wallet passphrase with walletpassphrase first
```

2. **Invalid Identity Format**:
```
error code: -8
error message: Invalid identity format
```

3. **Identity Not Found**:
```
error code: -5
error message: Identity not found
```

4. **Insufficient Funds**:
```
error code: -6
error message: Insufficient funds
```

## 5. Best Practices

1. Always unlock the wallet before attempting updates
2. Use proper JSON formatting for update objects
3. Include all required fields in the update object
4. Verify content after updates
5. Use specific height ranges when querying to improve performance
6. Keep track of VDXF keys used for content storage
7. Use the `keepdeleted` parameter when you need to track content history

## 6. Complete Workflow Example

1. **Create VDXF Key**:
```bash
# Create key definition
echo '{
  "name": "business.info",
  "version": 1,
  "flags": 96,
  "mimetype": "text/plain",
  "objectdata": {
    "message": "Business information key"
  }
}' > key_definition.json

# Get the VDXF key
./verus -chain=VRSCTEST getvdxfkey "business.info"

# Verify key creation
./verus -chain=VRSCTEST getidentity "business.info.VRSCTEST@"
```

2. **Update Identity with Content**:
```bash
# Unlock wallet
./verus -chain=VRSCTEST walletpassphrase "your_wallet_passphrase" 60

# Update identity with content
./verus -chain=VRSCTEST updateidentity "MyIdentity.VRSCTEST@" '{
  "name": "MyIdentity",
  "primaryaddresses": ["YOUR_ADDRESS"],
  "minimumsignatures": 1,
  "contentmap": {
    "VDXF_KEY_FROM_STEP_1": {
      "version": 1,
      "flags": 96,
      "mimetype": "text/plain",
      "objectdata": {
        "message": "Business content"
      }
    }
  }
}'
```

3. **Retrieve Content**:
```bash
# Get content using the VDXF key
./verus -chain=VRSCTEST getidentitycontent "MyIdentity.VRSCTEST@" 0 0 false "VDXF_KEY_FROM_STEP_1"
```

### VDXF Key Best Practices:
1. Use descriptive names for VDXF keys
2. Document the purpose of each key
3. Keep track of which keys are used for what content
4. Consider creating a key hierarchy for related content
5. Reuse keys when appropriate to maintain consistency
6. Verify key creation before using in content updates
7. Use appropriate flags and mimetypes for the content type 