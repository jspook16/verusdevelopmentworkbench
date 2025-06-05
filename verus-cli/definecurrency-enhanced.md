# Verus RPC Command: definecurrency

## Purpose
The `definecurrency` command is used to define a blockchain currency, either as an independent blockchain or as a token on the Verus blockchain. This is a cornerstone capability of Verus's PBaaS (Public Blockchains as a Service) system, allowing users to create customized blockchain currencies with various properties and configurations without coding.

## Daemon Requirements
- Verus daemon running with the following parameters:
  - `-chain=CHAINNAME` - Specify the chain from which to define the new currency (e.g., VRSC or vrsctest)
  - `-server` - Enable RPC server (required for API commands)
  - `-rpcuser=USERNAME` - Set RPC username 
  - `-rpcpassword=PASSWORD` - Set RPC password
  - `-txindex=1` - Enable full transaction index (recommended for PBaaS operations)

## Description
The `definecurrency` command creates a new currency by spending the identity after which this currency is named and sets a bit indicating that it has a currently active blockchain in its name. This powerful command enables users to launch independent blockchains, fractional reserve currencies, tokens, and other currency types with specific characteristics.

Once a currency is activated for an identity name, the same symbol may not be reused for another currency or blockchain, even if the identity is transferred, revoked, or recovered, unless there is an endblock specified and the currency or blockchain has deactivated as of that end block.

All funds to start the currency and for initial conversion amounts must be available to spend from the identity with the same name and ID as the currency being defined.

**Command Type**: Currency Management  
**Protocol Level**: PBaaS  
**Access Requirement**: Identity owner access

## Arguments
The command accepts a complex JSON object structure with numerous optional and required fields:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `options` | integer | Required | 0 | Bitmask (in decimal) representing currency options:<br>- `1` = OPTION_FRACTIONAL - Allows reserve conversion using base calculations when set. Can have one currency as its reserves, or multiple with up to 10 currencies. This is a "Basket currency" — a currency with a basket of reserves. Such a currency can be launched centralized or decentralized.<br>- `2` = OPTION_ID_ISSUANCE - Clear is permissionless, if set, IDs may only be created by controlling ID.<br>- `4` = OPTION_ID_STAKING - All IDs on chain stake equally, rather than value-based staking (PBaaS Related).<br>- `8` = OPTION_ID_REFERRALS - If set, this chain supports referrals and discounts for subID creation.<br>- `16` = OPTION_ID_REFERRALREQUIRED - If set, this chain requires referrals for subID creation.<br>- `32` = OPTION_TOKEN - If set, this is a token, not a native currency. Such a currency can be launched centralized or decentralized. This option is also used for Ethereum ERC-20 mapped tokens.<br>- `64` = OPTION_SINGLECURRENCY - For PBaaS chains or gateways to potentially restrict to single currency.<br>- `128` = OPTION_GATEWAY - If set, this routes external currencies.<br>- `256` = OPTION_PBAAS - This is a PBaaS chain definition.<br>- `512` = OPTION_GATEWAY_CONVERTER - This means that for a specific PBaaS gateway, this is the default converter and will publish prices.<br>- `1024` = OPTION_GATEWAY_NAMECONTROLLER - When not set on a gateway, top level ID and currency registration happen on launch chain.<br>- `2048` = OPTION_NFT_TOKEN - A single satoshi (0.00000001) NFT token is created & has tokenized control of the root VerusID. Which means you can send the single satoshi token to other addresses and then they have control of the root VerusID. |
| `name` | string | Required | | Name of existing identity with no active or pending blockchain |
| `idregistrationfees` | number | Required | | Price of an identity in native currency |
| `idreferrallevels` | integer | Required | | How many levels ID referrals go back in reward |
| `notaries` | array | Optional | | List of identities that are assigned as chain notaries |
| `minnotariesconfirm` | integer | Optional | | Unique notary signatures required to confirm an auto-notarization |
| `notarizationreward` | number | Required | | Default VRSC notarization reward total for first billing period |
| `proofprotocol` | integer | Required | | Protocol for proofs: 1 = PROOF_PBAASMMR (Verus MMR proof), 2 = PROOF_CHAINID (centralized control), 3 = PROOF_ETHNOTARIZATION (ETH & PATRICIA TRIE proof) |
| `notarizationprotocol` | integer | Optional | | Protocol for notarizations, same options as proofprotocol |
| `expiryheight` | integer | Optional | curheight + 20 | Block height at which the transaction expires |
| `startblock` | integer | Optional | expiryheight | VRSC block must be notarized into block 1 of PBaaS chain |
| `endblock` | integer | Optional | 0 | Chain or currency intended to end life after this height, 0 = no end |
| `currencies` | array | Optional | | Reserve currencies backing this chain in equal amounts |
| `weights` | array | Optional | | The weight of each reserve currency in a fractional currency |
| `conversions` | array | Optional | | Pre-launch conversion ratio overrides |
| `minpreconversion` | array | Optional | | Minimum in each currency to launch |
| `maxpreconversion` | array | Optional | | Maximum in each currency allowed |
| `initialcontributions` | array | Optional | | Initial contribution in each currency |
| `prelaunchdiscount` | number | Optional | | For fractional reserve currencies less than 100%, discount on final price at launch |
| `initialsupply` | number | Required for fractional | | Supply after conversion of contributions, before preallocation |
| `prelaunchcarveout` | number | Optional | | Identities and % of pre-converted amounts from each reserve currency |
| `preallocations` | array | Optional | | List of identities and amounts from pre-allocation |
| `gatewayconvertername` | string | Optional | | If this is a PBaaS chain, this names a co-launched gateway converter currency |
| `blocktime` | integer | Optional | 60 | Target time in seconds to average between blocks |
| `powaveragingwindow` | integer | Optional | 45 | Total number of blocks to look back when averaging for DAA |
| `notarizationperiod` | integer | Optional | 10 | Min period miners/stakers must wait to post new notarization to chain (minutes) |
| `eras` | array | Optional | | Data specific to each era, maximum 3 |
| » `reward` | integer | Required | | Native initial block rewards in each period |
| » `decay` | integer | Optional | | Reward decay for each era |
| » `halving` | integer | Optional | | Halving period for each era |
| » `eraend` | integer | Optional | | Ending block of each era |
| `nodes` | array | Optional | | Up to 5 nodes that can be used to connect to the blockchain |
| » `networkaddress` | string | Optional | | Internet or other supported address for node |
| » `nodeidentity` | string | Optional | | Published node identity |

## Results
The command returns a JSON object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `txid` | string | The transaction id |
| `tx` | object | The transaction decoded as a transaction |
| `hex` | string | Raw data for signed transaction |

## Examples

### Example 1: Define a simple token currency

**Command:**
```
verus definecurrency '{"name":"MYTOKEN", "options":32}'
```

This creates a simple token currency without any reserves (option 32).

### Example 2: Define a basket currency

**Command:**
```
verus definecurrency '{"name":"MYBASKET", "options":33, "currencies":["VRSC", "BTC"], "weights":[0.5, 0.5], "initialsupply":1000000}'
```

This creates a basket currency (option 1 + 32 = 33) with reserves of VRSC and BTC in equal proportions.

### Example 3: Define a token currency where only the rootID can create subIDs

**Command:**
```
verus definecurrency '{"name":"RESTRICTEDTOKEN", "options":34}'
```

This creates a simple token (32) where only the controlling VerusID can create subIDs (2), with options 2 + 32 = 34.

### Example 4: Define a currency with referrals enabled

**Command:**
```
verus definecurrency '{"name":"REFERRALTOKEN", "options":40, "idreferrallevels":3}'
```

This creates a simple token with referrals enabled (options 8 + 32 = 40).

### Example 5: Define a tokenized control NFT

**Command:**
```
verus definecurrency '{"name":"CONTROLNFT", "options":2080, "preallocations":[{"ControlTokenRecipient@":0.00000001}], "maxpreconversion":[0]}'
```

This creates an NFT token that has tokenized control of the root VerusID (option 2048) and is also defined as a token currency (option 32). The combined options value is 2048 + 32 = 2080.

### Example 6: Define a complex currency with multiple options

**Command:**
```
verus definecurrency '{"name":"COMPLEXTOKEN", "options":42, "idreferrallevels":3}'
```

This creates a token with both restricted subID creation and referrals enabled (options 2 + 8 + 32 = 42).

### Example 7: Using curl to define a currency

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "definecurrency", "params": [jsondefinition] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Technical Details

### Currency Options

Based on the options parameter, the following currency options can be defined:

1. **Basket Currency (1)**: OPTION_FRACTIONAL - Allows reserve conversion using base calculations when set. Can have up to 10 reserve currencies. Note that option 32 also needs to be added to enable conversion.

2. **Restricted SubID Currency (2)**: OPTION_ID_ISSUANCE - When set, IDs may only be created by controlling ID.

3. **ID Staking Currency (4)**: OPTION_ID_STAKING - All IDs on chain stake equally, rather than value-based staking.

4. **SubID Referral-Enabled Currency (8)**: OPTION_ID_REFERRALS - A currency that enables referrals and discounts for subID creation.

5. **SubID Referral-Required Currency (16)**: OPTION_ID_REFERRALREQUIRED - A currency that requires referrals for subID creation.

6. **Simple Token Currency (32)**: OPTION_TOKEN - If set, this is a token, not a native currency. Can be launched centralized or decentralized. This option is also used for Ethereum ERC-20 mapped tokens.

7. **Single Currency (64)**: OPTION_SINGLECURRENCY - For PBaaS chains or gateways to potentially restrict to single currency.

8. **Gateway Currency (128)**: OPTION_GATEWAY - If set, this routes external currencies.

9. **PBaaS Chain (256)**: OPTION_PBAAS - This is a PBaaS chain definition.

10. **Gateway Converter (512)**: OPTION_GATEWAY_CONVERTER - For a specific PBaaS gateway, this is the default converter and will publish prices.

11. **Gateway Name Controller (1024)**: OPTION_GATEWAY_NAMECONTROLLER - When not set on a gateway, top level ID and currency registration happen on launch chain.

12. **NFT with Tokenized Control (2048)**: OPTION_NFT_TOKEN - Creates a single satoshi (0.00000001) NFT token that has tokenized control of the root VerusID. The holder of this token controls the root VerusID.

### Valid Option Combinations

Not all combinations of options are valid or logical for currency creation. Here are the valid combinations for creating currencies in Verus:

1. **Simple Token** (32): Basic token without any special properties

2. **Basket/Fractional Currency** (33 = 1 + 32): A token with reserves that can be converted. Note that option 32 must be added to option 1 to enable conversion.

3. **Restricted Token** (34 = 2 + 32): A token where only the controlling VerusID can create subIDs

4. **Referral-Enabled Token** (40 = 8 + 32): A token with referrals enabled for subID creation

5. **Referral-Required Token** (48 = 16 + 32): A token that requires referrals for subID creation

6. **Restricted Referral-Enabled Token** (42 = 2 + 8 + 32): A token with both restricted subID creation and referrals enabled

7. **Restricted Referral-Required Token** (50 = 2 + 16 + 32): A token that both restricts subID creation and requires referrals

8. **ID-Staking Token** (36 = 4 + 32): A token where all IDs stake equally

9. **ID-Staking with Referrals Token** (44 = 4 + 8 + 32): Combines equal staking with referral support

10. **NFT with Tokenized Control** (2080 = 2048 + 32): An NFT token that has tokenized control of the root VerusID

11. **PBaaS Chain** (256): A definition for an independent blockchain

12. **PBaaS Chain with ID Staking** (260 = 256 + 4): A PBaaS chain with ID-based staking

13. **PBaaS Chain with Referrals** (264 = 256 + 8): A PBaaS chain that supports referrals

14. **PBaaS Chain with Required Referrals** (272 = 256 + 16): A PBaaS chain that requires referrals

15. **PBaaS Chain with Single Currency** (320 = 256 + 64): A PBaaS chain restricted to a single currency

16. **Gateway Currency** (128): A currency that routes external currencies

17. **Gateway with Name Controller** (1152 = 128 + 1024): A gateway where top-level ID and currency registration happen on the launch chain

18. **Gateway Converter** (640 = 128 + 512): A gateway that is the default converter and publishes prices

19. **Fractional Gateway Converter** (641 = 1 + 128 + 512): A fractional currency acting as a gateway converter

20. **Fractional PBaaS** (257 = 1 + 256): A fractional currency that is also a PBaaS chain

Some combinations would be logically incompatible or redundant, such as:
- OPTION_TOKEN (32) with OPTION_PBAAS (256) - these are fundamentally different currency types
- OPTION_TOKEN (32) with OPTION_GATEWAY (128) - these serve different purposes
- OPTION_ID_REFERRALREQUIRED (16) without OPTION_ID_REFERRALS (8) - referrals can't be required if not enabled

### Launch Process

The currency definition is just the first step in a multi-stage process:

1. **Definition**: Create the currency definition transaction
2. **Pre-launch Period**: Allow users to contribute reserve currencies (for fractional currencies)
3. **Launch**: The currency launches at the specified startblock if minimum requirements are met
4. **Notarization**: For PBaaS chains, a notarization from Verus is required for block 1

### Identity Requirements

For currency creation:
1. The identity used must be fully controlled by the caller
2. The identity must not already have an active blockchain
3. The identity must have sufficient funds to cover the currency definition and any initial contributions

### Era Configuration

The `eras` parameter allows defining up to three distinct phases for a blockchain, each with their own:
- Initial block reward
- Reward decay rate
- Halving period
- End block height

This enables sophisticated economic models to be implemented directly at the blockchain level.

## Potential Error Cases

1. **Identity Not Found:**
   ```
   error code: -5
   error message:
   Identity not found or not owned by this wallet
   ```

2. **Insufficient Funds:**
   ```
   error code: -6
   error message:
   Insufficient funds for required initial contributions
   ```

3. **Invalid Parameters:**
   ```
   error code: -8
   error message:
   Invalid currencies array - must match weights array size
   ```

4. **Active Blockchain:**
   ```
   error code: -5
   error message:
   Identity already has an active blockchain
   ```

5. **JSON Parse Error:**
   ```
   error code: -32700
   error message:
   Parse error
   ```

## Use Cases

1. **Launch Independent Blockchains**: Create customized blockchains with specific parameters for various applications such as:
   - Community or project-specific chains
   - Industry-specific blockchains
   - Private enterprise chains
   - Application-specific chains
   - Geographic or regional chains

2. **Create Fractional Reserve Currencies**: Launch currencies backed by a basket of other currencies with applications including:
   - Stable currencies backed by multiple assets
   - Liquidity pools for decentralized trading
   - Index-like currencies reflecting market segments
   - Weighted portfolio currencies
   - Reserve-backed payment solutions

3. **Issue Tokens**: Create simple tokens for various use cases like:
   - Ticketing and event access
   - Voting and governance
   - Rewards and loyalty programs
   - Membership credentials
   - Discount coupons
   - Game assets and currencies

4. **Create NFTs**: Issue non-fungible tokens representing unique assets such as:
   - Digital art and collectibles
   - Real estate and property deeds
   - Certificates and diplomas
   - Intellectual property rights
   - Unique game items

5. **Establish Cross-Chain Bridges**: Create gateway currencies that enable:
   - Interoperability between different blockchains
   - Asset transfers between chains
   - Cross-chain liquidity provision
   - Multi-chain applications

6. **Identity-Based Systems**: Develop identity-restricted currencies for:
   - KYC-compliant applications
   - Membership-based organizations
   - Regulated financial instruments
   - Community currencies
   - Closed ecosystem applications

7. **DeFi Applications**: Build decentralized finance infrastructure including:
   - Automated market makers (AMMs)
   - Lending and borrowing platforms
   - Yield farming mechanisms
   - Insurance products
   - Decentralized exchanges

8. **Governance Systems**: Create currencies with voting and participation rights for:
   - Decentralized autonomous organizations (DAOs)
   - Community governance
   - Shareholder voting
   - Project management
   - Resource allocation

## Related Commands

- `getcurrency` - Get detailed information about a currency
- `listcurrencies` - List all currencies on the blockchain
- `estimateconversion` - Estimate conversion from one currency to another
- `sendcurrency` - Send currencies to an address

## References
For more detailed information on the currency creation process and options, refer to the Verus documentation.
