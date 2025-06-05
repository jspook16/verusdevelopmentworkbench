# Verus RPC Command: z_getnewaddress

## Purpose
The `z_getnewaddress` command generates a new shielded address for receiving payments with enhanced privacy protections. This command is essential for creating private transaction endpoints, enabling confidential financial operations, protecting sensitive payment information, and implementing advanced privacy practices within the Verus ecosystem. It provides an alternative to transparent addresses when transaction privacy is a priority.

## Description
When executed with the appropriate parameters, this command creates a new shielded address in the wallet, along with its corresponding keys. The command supports both the older Sprout and the newer Sapling shielded address protocols, with Sapling being the default due to its improved efficiency and features. Shielded addresses created with this command hide transaction details on the blockchain, including the sender, receiver, and amount, providing significantly enhanced privacy compared to transparent addresses. Each generated address is stored in the wallet with its associated spending and viewing keys, enabling the wallet to track incoming payments and spend funds received at that address. The user can optionally specify which shielded address protocol to use, allowing flexibility for different compatibility or performance requirements. Shielded addresses are considerably longer than transparent addresses, reflecting the additional cryptographic information they encode to enable their privacy features.

**Command Type**: Action/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one optional argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| type | string | No | "sapling" | The type of address. One of ["sprout", "sapling"] |

## Results
The command returns a string representing the new shielded address.

**Return Type**: String

## Examples

### Example 1: Generate a new Sapling shielded address (default)

**Command:**
```
verus z_getnewaddress
```

**Sample Output:**
```
zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9slya
```

### Example 2: Generate a new Sapling address (explicit)

**Command:**
```
verus z_getnewaddress sapling
```

**Sample Output:**
```
zs1sxd3b8xtdu6zkaqfkfcwcr9jfxku7amr9y5ntxjr8ry8h4zg0dtk6m9rnc5824yrm43muw0f48c
```

### Example 3: Using JSON-RPC via curl

**Command:**
```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "z_getnewaddress", "params": [] }' -H 'content-type: text/plain;' http://127.0.0.1:27486/
```

## Potential Error Cases

1. **Potential Error - Invalid Address Type:**
   ```
   error code: -8
   error message:
   Invalid address type, must be one of [\"sprout\", \"sapling\"]
   ```

2. **Potential Error - Wallet Full:**
   ```
   error code: -4
   error message:
   Wallet is full. Clean up wallet keypool
   ```

3. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

4. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

## Notes
Sapling addresses provide significant performance and usability improvements over Sprout addresses, including faster transaction creation, reduced memory requirements, and support for viewing keys. It is recommended to use Sapling addresses for most shielded transactions. Shielded addresses require significantly more computational resources to create and use in transactions compared to transparent addresses. The wallet must be unlocked before this command can be used, as it needs to create and encrypt new key material.

## Related Commands
- `getnewaddress`: Returns a new transparent address for receiving payments
- `z_exportkey`: Reveals the private key corresponding to a z-address
- `z_importkey`: Adds a z-address private key to your wallet
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients