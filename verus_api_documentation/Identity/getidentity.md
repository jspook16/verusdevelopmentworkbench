# Verus RPC Command: getidentity

## Purpose
The `getidentity` command is designed to retrieve detailed information about a specific identity on the Verus blockchain. This command allows users to look up an identity by its name or i-address and view its current state, optionally at a specific blockchain height.

## Daemon Requirements
- No specific daemon parameters are required to use this command

## Description
The `getidentity` command retrieves comprehensive information about a specified identity from the Verus blockchain. The command can return the identity state as it existed at a particular block height, and optionally include cryptographic proof of the identity's status. This command is essential for identity verification and information retrieval in the Verus ecosystem. **Important**: Newly registered identities require at least 1 confirmation before they become visible and queryable on the blockchain.

**Command Type**: Query/Read-only  
**Protocol Level**: Identity Layer  
**Access Requirement**: Access to a running Verus daemon

## Arguments
The command accepts the following parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name@ || iid` | string | Yes | N/A | Name followed by "@" or i-address of an identity |
| `height` | number | No | current height | Return identity as of this height, if -1 include mempool |
| `txproof` | boolean | No | false | If true, returns proof of ID |
| `txproofheight` | number | No | value of `height` | Height from which to generate a proof |

## Results
The command returns an identity object containing detailed information about the requested identity.

**Return Type**: Object

The returned identity object typically contains:

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Version of the identity structure |
| `flags` | number | Binary flags defining identity properties |
| `primaryaddresses` | array | Array of primary addresses associated with this identity |
| `minimumsignatures` | number | Minimum number of signatures required for transactions |
| `name` | string | The name portion of the identity |
| `identityaddress` | string | The i-address of this identity |
| `parent` | string | Parent identity, if applicable (empty string if no parent) |
| `systemid` | string | The system identifier for this identity |
| `contentmap` | object | Map of content associated with this identity |
| `contentmultimap` | object | Map of multiple content items associated with this identity |
| `revocationauthority` | string | The identity with authority to revoke this identity |
| `recoveryauthority` | string | The identity with authority to recover this identity |
| `timelock` | number | Timelock setting for the identity (if applicable) |
| `proofheight` | number | Present if txproof is true, the height of proof |
| `proof` | object | Present if txproof is true, proof information |

If the identity is not found, an error is returned.

## Examples

### Example 1: Get Identity by ID

**Command:**
```
./verus -chain=VRSCTEST getidentity "iDEwH8F9HG1GRJQ4rjfqFF3nBdfJaEHZv2" 458243
```

**Expected Format:**
```json
{
  "friendlyname": "testidentity2.VRSCTEST@",
  "fullyqualifiedname": "testidentity2.VRSCTEST@",
  "identity": {
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
    "contentmap": {
    },
    "contentmultimap": {
    },
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0
  },
  "status": "active",
  "canspendfor": false,
  "cansignfor": false,
  "blockheight": 458243,
  "txid": "84176a4df513692fe306718421be79834f10e43d37f17489b46bb14e2e92259a",
  "vout": 0
}
```

### Example 2: Get Identity by ID with Proof

**Command:**
```
./verus -chain=VRSCTEST getidentity "iDEwH8F9HG1GRJQ4rjfqFF3nBdfJaEHZv2" 458243 true
```

**Expected Format:**
```json
{
  "friendlyname": "testidentity2.VRSCTEST@",
  "fullyqualifiedname": "testidentity2.VRSCTEST@",
  "identity": {
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
    "contentmap": {
    },
    "contentmultimap": {
    },
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0
  },
  "status": "active",
  "canspendfor": false,
  "cansignfor": false,
  "blockheight": 458243,
  "txid": "84176a4df513692fe306718421be79834f10e43d37f17489b46bb14e2e92259a",
  "vout": 0,
  "proof": "0102030000000202090b03997af6361eec40c2b32e8d1a2f52672501ab216b09f09fecf9a616fa242c862a95437c402892fd8ac45584cc7b35852c5968bc566f6b002c538bb44f84197d524198bdeda2456a9e0484e7c8613be4d9891fa900c875779b0f6ebc0f80ce08ad0202000201b428fa9227893028c67b443dddd69351dcc5b5d2fb8a950c985fe39c0000000003039afb039afb04092b497f9b0000000000000000000000000000000000000000000000000000000000801d4d732db7e74a24615bb16ca5c47c2978fe636c34afee470fdfcbd9b56782bd12ae2e010000000000000000000000000000000000000000000000000000000077d5086503af2acf440c3fef69d8271f01e5e634684d6ed81ad90296b38967905e1a8881020000000000000000000000637f85980eed11000000000000000000d88ff6681d99797b054e8faa9ada7d7ff86f54466c71963c0b4866c3a4b3e53dcf7956aeed0000000000000000000000e5878e05d6f11113000000000000000020227b0f09ac272548b01d5cd74d27f7b339905399008fb92c8b3d5ed7acef6c3e702024444b0300000000000000000019c5b30ad80f2d403e000000000000000201000000499a25922e4eb16bb48974f1373de4104f8379be21847106e32f6913f54d6a1784010400000085202f89020000000200000000000000000000000000000017fe06000000000000000000010000000202000704dfd0cd75e3e0962657660e1a36a86e595a0fa073b710d5d3bd33349470f2788bcdc9b6ed78d206866a8e97155e8707f4ad103d5e34df7dea59300d7bd5e16177fb6f2d4b6e7367757fa54b5b6d4ef697c54e4af403e7935fe8f42024d76fce72b7e5b8eb9084a289b76252925584c5bc6029310754530a9f84214e537752b91c04000000fd33010000000000000000fd280147040300010315046b1f56f905e10c87250b6d491b9315a6fc4b49ec1504a6ef9ea235635e328124ff3429db9f9e91b64e2d1504a6ef9ea235635e328124ff3429db9f9e91b64e2dcc4cdc04030e010115046b1f56f905e10c87250b6d491b9315a6fc4b49ec4c87030000000000000001140389b9bd51725c05b1bbcac0e7a5e779ca2eb87301000000a6ef9ea235635e328124ff3429db9f9e91b64e2d0d746573746964656e74697479320000a6ef9ea235635e328124ff3429db9f9e91b64e2da6ef9ea235635e328124ff3429db9f9e91b64e2d00a6ef9ea235635e328124ff3429db9f9e91b64e2d000000001b04030f01011504a6ef9ea235635e328124ff3429db9f9e91b64e2d1b04031001011504a6ef9ea235635e328124ff3429db9f9e91b64e2d750100000002020507030b625a04b298c7e63a346433a50b146e6aee1ddfa41af5b597c8d4d11c2aa595fa8d06da31024c17e87a3db32606e0eb1e89b58fab3d6da3165f06e015263addb7e5b8eb9084a289b76252925584c5bc6029310754530a9f84214e537752b91c"
}
```

### Example 3: Get Identity by Friendly Name with Proof

**Command:**
```
./verus -chain=VRSCTEST getidentity "testidentity2.VRSCTEST@" 458243 true
```

**Expected Format:**
```json
{
  "friendlyname": "testidentity2.VRSCTEST@",
  "fullyqualifiedname": "testidentity2.VRSCTEST@",
  "identity": {
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
    "contentmap": {
    },
    "contentmultimap": {
    },
    "revocationauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "recoveryauthority": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    "timelock": 0
  },
  "status": "active",
  "canspendfor": false,
  "cansignfor": false,
  "blockheight": 458243,
  "txid": "84176a4df513692fe306718421be79834f10e43d37f17489b46bb14e2e92259a",
  "vout": 0,
  "proof": "0102030000000202090b03997af6361eec40c2b32e8d1a2f52672501ab216b09f09fecf9a616fa242c862a95437c402892fd8ac45584cc7b35852c5968bc566f6b002c538bb44f84197d524198bdeda2456a9e0484e7c8613be4d9891fa900c875779b0f6ebc0f80ce08ad0202000201b428fa9227893028c67b443dddd69351dcc5b5d2fb8a950c985fe39c0000000003039afb039afb04092b497f9b0000000000000000000000000000000000000000000000000000000000801d4d732db7e74a24615bb16ca5c47c2978fe636c34afee470fdfcbd9b56782bd12ae2e010000000000000000000000000000000000000000000000000000000077d5086503af2acf440c3fef69d8271f01e5e634684d6ed81ad90296b38967905e1a8881020000000000000000000000637f85980eed11000000000000000000d88ff6681d99797b054e8faa9ada7d7ff86f54466c71963c0b4866c3a4b3e53dcf7956aeed0000000000000000000000e5878e05d6f11113000000000000000020227b0f09ac272548b01d5cd74d27f7b339905399008fb92c8b3d5ed7acef6c3e702024444b0300000000000000000019c5b30ad80f2d403e000000000000000201000000499a25922e4eb16bb48974f1373de4104f8379be21847106e32f6913f54d6a1784010400000085202f89020000000200000000000000000000000000000017fe06000000000000000000010000000202000704dfd0cd75e3e0962657660e1a36a86e595a0fa073b710d5d3bd33349470f2788bcdc9b6ed78d206866a8e97155e8707f4ad103d5e34df7dea59300d7bd5e16177fb6f2d4b6e7367757fa54b5b6d4ef697c54e4af403e7935fe8f42024d76fce72b7e5b8eb9084a289b76252925584c5bc6029310754530a9f84214e537752b91c04000000fd33010000000000000000fd280147040300010315046b1f56f905e10c87250b6d491b9315a6fc4b49ec1504a6ef9ea235635e328124ff3429db9f9e91b64e2d1504a6ef9ea235635e328124ff3429db9f9e91b64e2dcc4cdc04030e010115046b1f56f905e10c87250b6d491b9315a6fc4b49ec4c87030000000000000001140389b9bd51725c05b1bbcac0e7a5e779ca2eb87301000000a6ef9ea235635e328124ff3429db9f9e91b64e2d0d746573746964656e74697479320000a6ef9ea235635e328124ff3429db9f9e91b64e2da6ef9ea235635e328124ff3429db9f9e91b64e2d00a6ef9ea235635e328124ff3429db9f9e91b64e2d000000001b04030f01011504a6ef9ea235635e328124ff3429db9f9e91b64e2d1b04031001011504a6ef9ea235635e328124ff3429db9f9e91b64e2d750100000002020507030b625a04b298c7e63a346433a50b146e6aee1ddfa41af5b597c8d4d11c2aa595fa8d06da31024c17e87a3db32606e0eb1e89b58fab3d6da3165f06e015263addb7e5b8eb9084a289b76252925584c5bc6029310754530a9f84214e537752b91c"
}
```

### Sample Example 4: Remote API Usage with curl

**Command:**
```
> curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getidentity", "params": ["name@"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found
   ```
   Note: This error may occur if the identity registration transaction has not yet been confirmed on the blockchain.

2. **Potential Error - Invalid Identity Format:**
   ```
   error code: -8
   error message:
   Invalid identity name or address format
   ```

3. **Potential Error - Invalid Height Parameter:**
   ```
   error code: -8
   error message:
   Invalid height parameter
   ```

4. **Potential Error - Invalid Proof Height:**
   ```
   error code: -8
   error message:
   Invalid proof height parameter
   ```

5. **Potential Error - Network Error:**
   ```
   error code: -1
   error message:
   Network error while fetching identity information
   ```
