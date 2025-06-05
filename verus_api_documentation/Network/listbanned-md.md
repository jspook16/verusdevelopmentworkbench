# Verus RPC Command: listbanned

## Purpose
The `listbanned` command lists all banned IP addresses and subnets. This command is useful for monitoring and managing network security by providing visibility into which peers have been banned from connecting to the node.

## Description
When executed, this command returns a list of all IP addresses and subnets that have been banned using the `setban` command. For each banned entry, it typically includes information such as the IP address or subnet, when the ban was created, and when it will expire. This helps in network management and troubleshooting connection issues.

**Command Type**: Query/Read-only  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
This command does not accept any arguments.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| None | | | | |

## Results
The command returns an array of objects, each representing a banned IP address or subnet.

**Return Type**: Array of Objects

The exact structure of the returned data is not specified in the limited documentation, but likely includes details such as the banned IP address or subnet, the time when the ban was created, and the expiration time of the ban.

## Examples

### Example 1: List all banned IPs and subnets

**Command:**
```
verus listbanned
```

**Sample Output Format:**
```json
[
  {
    "address": "203.0.113.1/32",
    "banned_until": 1622592000,
    "ban_created": 1622505600,
    "ban_reason": ""
  },
  {
    "address": "203.0.113.0/24",
    "banned_until": 1622678400,
    "ban_created": 1622505600,
    "ban_reason": "manually added"
  }
]
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "listbanned", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": [
    {
      "address": "203.0.113.1/32",
      "banned_until": 1622592000,
      "ban_created": 1622505600,
      "ban_reason": ""
    },
    ... (more banned IPs)
  ],
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

2. **Potential Error - Node Not Started:**
   ```
   error code: -28
   error message:
   Loading block index...
   ```

3. **Potential Error - Connection Issue:**
   ```
   error code: -9
   error message:
   Cannot connect to Verus daemon
   ```

## Related Commands
- `setban`: Attempts to add or remove an IP/subnet from the banned list
- `clearbanned`: Clear all banned IPs
- `getpeerinfo`: Returns data about each connected network node
- `disconnectnode`: Immediately disconnects from the specified node
