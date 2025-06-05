# Valid Parameters for Verus Currency Types

This document outlines the valid parameters for each currency type that can be created using the `definecurrency` command in Verus. The options are organized by the bitmask combinations identified in the Valid Combinations list.

## Global Parameters (Apply to All Currency Types)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | **Mandatory** | Name of existing identity with no active or pending blockchain |
| `idregistrationfees` | number | **Mandatory** | Price of an identity in native currency |
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward |
| `notarizationreward` | number | **Mandatory** | Default VRSC notarization reward total for first billing period |
| `proofprotocol` | integer | **Mandatory** | Protocol for proofs: 1 = PROOF_PBAASMMR, 2 = PROOF_CHAINID, 3 = PROOF_ETHNOTARIZATION |
| `notarizationprotocol` | integer | Optional | Protocol for notarizations, same options as proofprotocol |
| `expiryheight` | integer | Optional | Block height at which the transaction expires (default: curheight + 20) |
| `endblock` | integer | Optional | Chain or currency intended to end life after this height, 0 = no end (default: 0) |

## Currency-Specific Parameters

### 1. Simple Token (32)
**Bitmask Value: 32**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `initialcontributions` | array | Optional | Initial contribution in each currency |

### 2. Basket/Fractional Currency (33 = 1 + 32)
**Bitmask Value: 33**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currencies` | array | **Mandatory** | Reserve currencies backing this chain |
| `weights` | array | **Mandatory** | The weight of each reserve currency in a fractional currency |
| `initialsupply` | number | **Mandatory** | Supply after conversion of contributions, before preallocation |
| `conversions` | array | Optional | Pre-launch conversion ratio overrides |
| `minpreconversion` | array | Optional | Minimum in each currency to launch |
| `maxpreconversion` | array | Optional | Maximum in each currency allowed |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `prelaunchdiscount` | number | Optional | Discount on final price at launch (for fractional reserve < 100%) |
| `prelaunchcarveout` | number | Optional | % of pre-converted amounts from each reserve currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 3. Restricted Token (34 = 2 + 32)
**Bitmask Value: 34**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 4. Referral-Enabled Token (40 = 8 + 32)
**Bitmask Value: 40**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 5. Referral-Required Token (48 = 16 + 32)
**Bitmask Value: 48**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 6. Restricted Referral-Enabled Token (42 = 2 + 8 + 32)
**Bitmask Value: 42**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 7. Restricted Referral-Required Token (50 = 2 + 16 + 32)
**Bitmask Value: 50**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 8. ID-Staking Token (36 = 4 + 32)
**Bitmask Value: 36**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 9. ID-Staking with Referrals Token (44 = 4 + 8 + 32)
**Bitmask Value: 44**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |

### 10. NFT with Tokenized Control (2080 = 2048 + 32)
**Bitmask Value: 2080**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `preallocations` | array | **Mandatory** | List of identities and amounts from pre-allocation (crucial to specify the 0.00000001 allocation) |
| `maxpreconversion` | array | Optional | Maximum in each currency allowed (recommended to set to [0]) |

### 11. PBaaS Chain (256)
**Bitmask Value: 256**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startblock` | integer | Optional | VRSC block must be notarized into block 1 of PBaaS chain (default: expiryheight) |
| `notaries` | array | Optional | List of identities that are assigned as chain notaries |
| `minnotariesconfirm` | integer | Optional | Unique notary signatures required to confirm an auto-notarization |
| `nodes` | array | Optional | Up to 5 nodes that can be used to connect to the blockchain |
| `blocktime` | integer | Optional | Target time in seconds to average between blocks (default: 60) |
| `powaveragingwindow` | integer | Optional | Total number of blocks to look back when averaging for DAA (default: 45) |
| `notarizationperiod` | integer | Optional | Min period miners/stakers must wait to post new notarization (default: 10 minutes) |
| `gatewayconvertername` | string | Optional | Names a co-launched gateway converter currency |
| `eras` | array | Optional | Data specific to each era, maximum 3 |

### 12. PBaaS Chain with ID Staking (260 = 256 + 4)
**Bitmask Value: 260**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| All parameters from PBaaS Chain (#11) apply | | | |

### 13. PBaaS Chain with Referrals (264 = 256 + 8)
**Bitmask Value: 264**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| All parameters from PBaaS Chain (#11) apply | | | |

### 14. PBaaS Chain with Required Referrals (272 = 256 + 16)
**Bitmask Value: 272**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idreferrallevels` | integer | **Mandatory** | How many levels ID referrals go back in reward (important for this type) |
| All parameters from PBaaS Chain (#11) apply | | | |

### 15. PBaaS Chain with Single Currency (320 = 256 + 64)
**Bitmask Value: 320**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| All parameters from PBaaS Chain (#11) apply | | | |

### 16. Gateway Currency (128)
**Bitmask Value: 128**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notaries` | array | Optional | List of identities that are assigned as chain notaries |
| `minnotariesconfirm` | integer | Optional | Unique notary signatures required to confirm an auto-notarization |
| `nodes` | array | Optional | Up to 5 nodes that can be used to connect to the blockchain |

### 17. Gateway with Name Controller (1152 = 128 + 1024)
**Bitmask Value: 1152**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| All parameters from Gateway Currency (#16) apply | | | |

### 18. Gateway Converter (640 = 128 + 512)
**Bitmask Value: 640**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| All parameters from Gateway Currency (#16) apply | | | |

### 19. Fractional Gateway Converter (641 = 1 + 128 + 512)
**Bitmask Value: 641**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currencies` | array | **Mandatory** | Reserve currencies backing this chain |
| `weights` | array | **Mandatory** | The weight of each reserve currency in a fractional currency |
| `initialsupply` | number | **Mandatory** | Supply after conversion of contributions, before preallocation |
| `conversions` | array | Optional | Pre-launch conversion ratio overrides |
| `minpreconversion` | array | Optional | Minimum in each currency to launch |
| `maxpreconversion` | array | Optional | Maximum in each currency allowed |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `prelaunchdiscount` | number | Optional | Discount on final price at launch (for fractional reserve < 100%) |
| `prelaunchcarveout` | number | Optional | % of pre-converted amounts from each reserve currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |
| All parameters from Gateway Currency (#16) apply | | | |

### 20. Fractional PBaaS (257 = 1 + 256)
**Bitmask Value: 257**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `currencies` | array | **Mandatory** | Reserve currencies backing this chain |
| `weights` | array | **Mandatory** | The weight of each reserve currency in a fractional currency |
| `initialsupply` | number | **Mandatory** | Supply after conversion of contributions, before preallocation |
| `conversions` | array | Optional | Pre-launch conversion ratio overrides |
| `minpreconversion` | array | Optional | Minimum in each currency to launch |
| `maxpreconversion` | array | Optional | Maximum in each currency allowed |
| `initialcontributions` | array | Optional | Initial contribution in each currency |
| `prelaunchdiscount` | number | Optional | Discount on final price at launch (for fractional reserve < 100%) |
| `prelaunchcarveout` | number | Optional | % of pre-converted amounts from each reserve currency |
| `preallocations` | array | Optional | List of identities and amounts from pre-allocation |
| All parameters from PBaaS Chain (#11) apply | | | |

## Era Configuration Parameters

For currency types that support eras (particularly PBaaS chains), the `eras` array can contain up to 3 objects with the following structure:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reward` | integer | **Mandatory** | Native initial block rewards in each period |
| `decay` | integer | Optional | Reward decay for each era |
| `halving` | integer | Optional | Halving period for each era |
| `eraend` | integer | Optional | Ending block of each era |

## Node Configuration Parameters

For currency types that support nodes, the `nodes` array can contain up to 5 objects with the following structure:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `networkaddress` | string | Optional | Internet or other supported address for node |
| `nodeidentity` | string | Optional | Published node identity |
