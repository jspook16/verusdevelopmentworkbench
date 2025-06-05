# Verus RPC Command: z_viewtransaction

## Purpose
The `z_viewtransaction` command retrieves detailed information about shielded components of in-wallet transactions. This command is essential for auditing private transactions, verifying payment details that are not visible on the blockchain, accessing encrypted memo data, tracing value flow between shielded addresses, and reconciling private financial records. It provides insight into transaction details that are intentionally obscured from public view in the blockchain explorer.

## Description
When executed with the appropriate parameter, this command decrypts and displays comprehensive information about the shielded aspects of a transaction that involves the wallet's addresses. Unlike standard blockchain explorers or the `gettransaction` command, which can only show transparent transaction details, this command uses the wallet's private keys to decrypt information about shielded inputs (spends) and outputs that are otherwise hidden by zero-knowledge cryptography. Each spend entry includes details about the source of the funds, while each output entry contains information about the destination, including the amount and any encrypted memo data. For Sapling outputs, the command can also identify whether an output is "recovered," meaning it was not sent to an address in the wallet but was decrypted using viewing keys. If encrypted memo data is valid UTF-8 text, the command automatically decodes and presents it as readable text in the "memoStr" field. This powerful capability enables users to maintain comprehensive financial records of their private transactions, which would otherwise be inaccessible due to the privacy features of shielded transactions.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| txid | string | Yes | N/A | The transaction id |

## Results
The command returns an object with detailed information about the shielded components of the transaction.

**Return Type**: Object

## Examples

### Example 1: View detailed information about a shielded transaction

**Command:**
```
verus z_viewtransaction "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"
```

**Sample Output:**
```
{
  "txid": "1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
  "spends": [
    {
      "type": "sapling",
      "spend": 0,
      "txidPrev": "8f01ff1d1b58f01ad0aad623fc0a27e805f8177883e893c3216350a3f9a272a4",
      "outputPrev": 0,
      "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9",
      "value": 5.00000000,
      "valueZat": 500000000
    }
  ],
  "outputs": [
    {
      "type": "sapling",
      "output": 0,
      "address": "zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9slya",
      "value": 3.99990000,
      "valueZat": 399990000,
      "memo": "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "memoStr": "Payment for services rendered"
    },
    {
      "type": "sapling",
      "output": 1,
      "address": "zs1sggj7g5hdgdv5j5z7kd2i4ck5qd9lukhsy4542msjs8g3p6567vkqmadmxdgzrukvsyvpj5hjd9",
      "value": 1.00000000,
      "valueZat": 100000000,
      "memo": "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "change": true
    }
  ]
}
```

### Example 2: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_viewtransaction", "params": ["1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d"] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction ID:**
   ```
   error code: -8
   error message:
   Invalid txid
   ```

2. **Potential Error - Transaction Not Found:**
   ```
   error code: -5
   error message:
   Transaction not in wallet
   ```

3. **Potential Error - No Shielded Components:**
   ```
   error code: -8
   error message:
   Transaction does not have any shielded information
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Notes
This command only works for transactions that involve the wallet's addresses. It cannot decrypt shielded information for transactions not related to the wallet. The structure of the returned data varies slightly between Sprout and Sapling transactions, reflecting their different cryptographic structures. For Sprout transactions, spend entries include "js" (joinsplit index) and "jsSpend" (joinsplit spend index) fields, while output entries include "js" and "jsOutput" fields. For Sapling transactions, spend entries include a "spend" index, while output entries include an "output" index. The "memo" field contains a hexadecimal string representation of the memo data included with the transaction. If this data represents valid UTF-8 text, it is also presented in decoded form in the "memoStr" field. The "change" flag in output entries indicates whether the output is change sent back to the sender's address.

## Related Commands
- `gettransaction`: Get detailed information about a transaction
- `z_listreceivedbyaddress`: Returns a list of amounts received by a zaddr
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_getbalance`: Returns the balance of a taddr or zaddr belonging to the wallet
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet