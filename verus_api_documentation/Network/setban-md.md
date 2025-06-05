# Verus RPC Command: setban

## Purpose
The `setban` command attempts to add or remove an IP address or subnet from the banned list. This command is useful for managing network connections and blocking potentially malicious or problematic peers.

## Description
When executed with the appropriate parameters, this command allows you to manually ban or unban specific IP addresses or entire subnets. For banning, you can specify the duration of the ban, either as a relative time in seconds or as an absolute timestamp. This provides flexible control over which peers are allowed to connect to your node.

**Command Type**: Action/Network  
**Protocol Level**: Network  
**Access Requirement**: No special requirements

## Arguments
The command accepts four arguments, two required and two optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| ip(/netmask) | string | Yes | N/A | The IP address or subnet to ban/unban. Optional netmask can be included (default is /32 = single IP) |
| command | string | Yes | N/A | 'add' to add an IP/subnet to the list, 'remove' to remove an IP/subnet from the list |
| bantime | numeric | No | 86400 (24h) | Time in seconds for how long the IP is banned, or until when if absolute is set |
| absolute | boolean | No | false | If set, the bantime is an absolute timestamp in seconds since epoch |

## Results
The command does not provide a structured result. It returns nothing on success, or an error message if the operation fails.

**Return Type**: None or Error

## Examples

### Example 1: Ban a single IP address for the default time (24 hours)

**Command:**
```
verus setban "192.168.0.6" "add"
```

**Sample Output:**
```
null
```

### Example 2: Ban a single IP address for a specific time (86400 seconds = 24 hours)

**Command:**
```
verus setban "192.168.0.6" "add" 86400
```

**Sample Output:**
```
null
```

### Example 3: Ban an entire subnet

**Command:**
```
verus setban "192.168.0.0/24" "add"
```

**Sample Output:**
```
null
```

### Example 4: Remove a ban on a specific IP

**Command:**
```
verus setban "192.168.0.6" "remove"
```

**Sample Output:**
```
null
```

### Example 5: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "setban", "params": ["192.168.0.6", "add", 86400] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

**Expected Format:**
```json
{
  "result": null,
  "error": null,
  "id": "curltest"
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameters:**
   ```
   error code: -1
   error message:
   IP address and command required
   ```

2. **Potential Error - Invalid IP Format:**
   ```
   error code: -1
   error message:
   Error: Invalid IP/Subnet
   ```

3. **Potential Error - Invalid Command:**
   ```
   error code: -1
   error message:
   Error: Command must be 'add' or 'remove'
   ```

4. **Potential Error - Invalid Bantime:**
   ```
   error code: -1
   error message:
   Error: bantime must be a number
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `listbanned`: List all banned IPs/subnets
- `clearbanned`: Clear all banned IPs
- `getpeerinfo`: Returns data about each connected network node
- `disconnectnode`: Immediately disconnects from the specified node
