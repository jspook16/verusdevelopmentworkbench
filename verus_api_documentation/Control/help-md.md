# Verus RPC Command: help

## Purpose
The `help` command lists all available commands or provides detailed help for a specific command. This command is essential for exploring the Verus RPC API and understanding how to use individual commands properly.

## Description
When executed without parameters, this command returns a list of all available RPC commands supported by the Verus daemon. When a specific command name is provided as an argument, it returns detailed help information for that command, including its purpose, arguments, and usage examples.

**Command Type**: Query/Read-only  
**Protocol Level**: General  
**Access Requirement**: No special requirements

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| command | string | No | N/A | The command to get help on |

## Results
The command returns a string containing the help text:

**Return Type**: String

If no command is specified, it returns a list of all available commands.
If a specific command is specified, it returns detailed help information for that command.

## Examples

### Example 1: List all available commands

**Command:**
```
verus help
```

**Sample Output:**
```
== Blockchain ==
getbestblockhash
getblock "hash|height" ( verbosity )
getblockchaininfo
getblockcount
...

== Control ==
getinfo
help ( "command" )
stop
...

== Generating ==
generate numblocks
generatetoaddress numblocks address
...

== Mining ==
getblocksubsidy height
getblocktemplate ( "jsonrequestobject" )
getlocalsolps
getmininginfo
...

== Network ==
addnode "node" "add|remove|onetry"
clearbanned
disconnectnode "node" 
getaddednodeinfo ( "node" )
...

== Rawtransactions ==
createrawtransaction [{"txid":"id","vout":n},...] {"address":amount,...} ( locktime ) ( expiryheight )
decoderawtransaction "hexstring"
...

== Util ==
createmultisig nrequired ["key",...]
estimatefee nblocks
estimatepriority nblocks
...

== Wallet ==
addmultisigaddress nrequired ["key",...] ( "account" )
backupwallet "destination"
dumpprivkey "t-addr"
...
```

### Example 2: Get help for a specific command

**Command:**
```
verus help getblock
```

**Sample Output:**
```
getblock "hash|height" ( verbosity )

If verbosity is 0, returns a string that is serialized, hex-encoded data for the block.
If verbosity is 1, returns an Object with information about the block.
If verbosity is 2, returns an Object with information about the block and information about each transaction. 

Arguments:
1. "hash|height"          (string, required) The block hash or height
2. verbosity              (numeric, optional, default=1) 0 for hex encoded data, 1 for a json object, and 2 for json object with transaction data

Result (for verbosity = 0):
"data"             (string) A string that is serialized, hex-encoded data for the block.

Result (for verbosity = 1):
{
  "hash" : "hash",       (string) the block hash (same as provided hash)
  "confirmations" : n,   (numeric) The number of confirmations, or -1 if the block is not on the main chain
  "size" : n,            (numeric) The block size
  "height" : n,          (numeric) The block height or index (same as provided height)
  "version" : n,         (numeric) The block version
  "merkleroot" : "xxxx", (string) The merkle root
  "finalsaplingroot" : "xxxx", (string) The root of the Sapling commitment tree after applying this block
  "tx" : [               (array of string) The transaction ids
     "transactionid"     (string) The transaction id
     ,...
  ],
  "time" : ttt,          (numeric) The block time in seconds since epoch (Jan 1 1970 GMT)
  "nonce" : n,           (numeric) The nonce
  "bits" : "1d00ffff",   (string) The bits
  "difficulty" : x.xxx,  (numeric) The difficulty
  "previousblockhash" : "hash",  (string) The hash of the previous block
  "nextblockhash" : "hash"       (string) The hash of the next block
}

Result (for verbosity = 2):
{
  ...,                     Same output as verbosity = 1.
  "tx" : [               (array of Objects) The transactions in the format of the getrawtransaction RPC. Different from verbosity = 1 "tx" result.
         ,...
  ],
  ,...                     Same output as verbosity = 1.
}

Examples:
> verus getblock "00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5"
> curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblock", "params": ["00000000febc373a1da2bd9f887b105ad79ddc26ac26c2b28652d64e5207c5b5"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
> verus getblock 12800
> curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblock", "params": [12800] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Unknown Command:**
   ```
   error code: -1
   error message:
   Command not found
   ```

2. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- All Verus RPC commands, as this command provides help for using any command
