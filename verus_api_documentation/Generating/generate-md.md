# Verus RPC Command: generate

## Purpose
The `generate` command mines blocks immediately, before the RPC call returns. This command is useful for testing and development purposes when immediate block generation is needed.

## Description
When executed, this command will mine the specified number of blocks right away. The mining is performed by the node itself, regardless of whether it is otherwise configured to mine. This command is restricted to the regtest network only, as it allows for controlled block generation in a test environment.

**Command Type**: Action/Mining  
**Protocol Level**: Mining  
**Access Requirement**: Can only be used on the regtest network

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| numblocks | numeric | Yes | N/A | How many blocks are generated immediately |

## Results
The command returns an array of strings, where each string represents the hash of a generated block.

**Return Type**: Array of strings

## Examples

### Example 1: Generate 11 blocks

**Command:**
```
verus generate 11
```

**Sample Output:**
```json
[
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef34",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef56",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef78",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef9a",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdefbc",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdefde",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdeff0",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef01",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef23",
  "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef45"
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "generate", "params": [11] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    "00000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    ... (more block hashes)
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Not on Regtest Network:**
   ```
   error code: -1
   error message:
   This function can only be used on the regtest network
   ```

2. **Potential Error - Invalid Number of Blocks:**
   ```
   error code: -8
   error message:
   Invalid number of blocks
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

4. **Potential Error - Non-Numeric Parameter:**
   ```
   error code: -1
   error message:
   numblocks must be a numeric parameter
   ```

## Related Commands
- `getgenerate`: Return if the server is set to mine and/or mint coins
- `setgenerate`: Set whether mining/staking is enabled and configure processor limits
- `getblocktemplate`: Gets data needed to construct a block to work on
- `submitblock`: Attempts to submit a new block to the network
