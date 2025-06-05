# Verus RPC Command: getdeprecationinfo

## Purpose
The `getdeprecationinfo` command returns information about the current version and the block height at which this version will be deprecated and shut down. This command is useful for staying informed about upcoming software deprecation and planning timely upgrades.

## Description
When executed, this command provides details about the current version of the software and the block height at which it will be considered deprecated. After the specified deprecation height is reached, the software will shut down, requiring an upgrade to a newer version. This mechanism ensures that nodes stay up-to-date with protocol changes and improvements. This command is only applicable on the mainnet.

**Command Type**: Query/Read-only  
**Protocol Level**: General  
**Access Requirement**: No special requirements, applies only on mainnet

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns a JSON object containing deprecation information:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| version | numeric | The server version |
| subversion | string | The server subversion string |
| deprecationheight | numeric | The block height at which this version will deprecate and shut down |

## Examples

### Example 1: Get deprecation information

**Command:**
```
verus getdeprecationinfo
```

**Sample Output:**
```json
{
  "version": 2001526,
  "subversion": "/MagicBean:0.7.2-3/",
  "deprecationheight": 1400000
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getdeprecationinfo", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": {
    "version": 2001526,
    "subversion": "/MagicBean:0.7.2-3/",
    "deprecationheight": 1400000
  },
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Not on Mainnet:**
   ```
   error code: -1
   error message:
   Deprecation is only tracked on mainnet
   ```

2. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

3. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

## Related Commands
- `getinfo`: Returns an object containing various state info
- `getnetworkinfo`: Returns an object containing various state info regarding P2P networking
- `getblockchaininfo`: Returns various state info regarding blockchain processing
