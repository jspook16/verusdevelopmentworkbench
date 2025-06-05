# Verus RPC Command: makeoffer

## Purpose
The `makeoffer` command creates a decentralized, on-chain atomic swap offer for blockchain assets. This command enables peer-to-peer trading of various assets including currencies, NFTs, identities, and contractual agreements without intermediaries.

## Description
When executed with the appropriate parameters, this command creates and posts a transaction to the blockchain that offers specific assets in exchange for other assets. The offer remains on the blockchain until it is either accepted, expires, or is manually closed. This forms the foundation of Verus's decentralized exchange functionality.

**Command Type**: Action/Write  
**Protocol Level**: DeFi/Offers  
**Access Requirement**: Wallet with funds or assets to offer

## Arguments
The command accepts five arguments, two required and three optional:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| fromaddress | string | Yes | N/A | The VerusID or wildcard address to send funds from. "*", "R*", or "i*" are valid wildcards |
| offerdata | object | Yes | N/A | JSON object containing details of the offer (described below) |
| returntx | boolean | No | false | If true, returns a transaction waiting for taker completion instead of posting |
| feeamount | numeric | No | 0.0001 | Specific fee amount for the transaction |

The `offerdata` object must contain:
- `changeaddress`: (string) Change destination when constructing transactions
- `expiryheight`: (number, optional) Block height at which this offer expires. Defaults to 20 blocks
- `offer`: (object) Funds description or identity name being offered
- `for`: (object) Funds description or full identity description being requested

## Results
The command returns a transaction ID or serialized transaction hex, depending on the parameters:

**Return Type**: Object

| Field | Type | Description |
|-------|------|-------------|
| txid | string | The transaction ID if returntx is false |
| hex | string | The hexadecimal, serialized transaction if returntx is true |

## Examples

### Example 1: Make an offer to swap currencies

**Command:**
```
verus makeoffer "R-address" '{"changeaddress":"R-change-address", "expiryheight":1234567, "offer":{"currency":"VRSC", "amount":100}, "for":{"currency":"USD", "amount":500}}'
```

**Sample Output:**
```json
{
  "txid": "a123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

### Example 2: Make an offer to sell an identity for currency

**Command:**
```
verus makeoffer "MyVerusID" '{"changeaddress":"R-change-address", "expiryheight":1234567, "offer":{"identity":"MyVerusID"}, "for":{"currency":"VRSC", "amount":5000}}'
```

**Sample Output:**
```json
{
  "txid": "b123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

### Example 3: Create an offer transaction without posting (for advanced use)

**Command:**
```
verus makeoffer "R-address" '{"changeaddress":"R-change-address", "expiryheight":1234567, "offer":{"currency":"VRSC", "amount":100}, "for":{"currency":"USD", "amount":500}}' true
```

**Sample Output:**
```json
{
  "hex": "0100000001e4b0dc5f5b2c5e0f618397acb76d2d50bb35b9e8a9ba7e4d4d25f8e593d3217520000000048473044022040fee60761a8f882206419a291cd8b14b23e67d578b4b58873301b242181342d02204ee5316b98b6e9ebc0aa76ac4b63a5c8184c9eb43f0df03eb5609494e048e7810100ffffffff..."
}
```

## Potential Error Cases

1. **Potential Error - Missing Required Parameters:**
   ```
   error code: -1
   error message:
   fromaddress and offer parameters are required
   ```

2. **Potential Error - Invalid Address Format:**
   ```
   error code: -5
   error message:
   Invalid fromaddress format
   ```

3. **Potential Error - Invalid Offer Data Format:**
   ```
   error code: -8
   error message:
   Invalid offer data format
   ```

4. **Potential Error - Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds to create offer
   ```

5. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Wallet is locked, unable to create transaction!
   ```

6. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Related Commands
- `closeoffers`: Closes specified offers in the wallet
- `getoffers`: Returns all open offers for a specific currency or ID
- `listopenoffers`: Shows offers outstanding in the wallet
- `takeoffer`: Accepts an existing offer on the blockchain
