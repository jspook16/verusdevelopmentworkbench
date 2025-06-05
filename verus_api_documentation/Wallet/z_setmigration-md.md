# Verus RPC Command: z_setmigration

## Purpose
The `z_setmigration` command enables or disables the automatic migration of funds from Sprout shielded addresses to Sapling shielded addresses. This command is essential for transitioning to the more efficient and secure Sapling protocol, reducing resource requirements for maintaining shielded funds, enhancing transaction performance, and ensuring continued access to privacy features as the Sprout protocol becomes deprecated. It provides a privacy-preserving migration path that minimizes information leakage during the transition between shielded pool implementations.

## Description
When enabled, this command activates an automatic process that gradually transfers funds from the older Sprout shielded addresses to the newer Sapling shielded addresses within the same wallet. The migration is designed to maximize privacy by following specific patterns defined in ZIP 308, including splitting transactions into randomized amounts and executing them at predetermined blockchain heights. The command directs funds to either the wallet's default Sapling address (account 0) or a user-specified destination address configured via the `-migrationdestaddress` parameter. The migration process operates autonomously in the background, creating transactions whenever the blockchain height reaches a value equal to 499 modulo 500, and continues until the wallet's Sprout balance falls below 0.01 VRSC. This carefully designed migration strategy balances privacy concerns with the need to transition to more efficient cryptographic protocols, ensuring that users can maintain privacy while benefiting from the performance improvements offered by the Sapling protocol.

**Command Type**: Configuration/Wallet  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
The command accepts one required argument:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| enabled | boolean | Yes | N/A | 'true' or 'false' to enable or disable respectively |

## Results
The command does not return any specific value upon successful execution.

**Return Type**: None

## Examples

### Example 1: Enable Sprout to Sapling migration

**Command:**
```
verus z_setmigration true
```

### Example 2: Disable Sprout to Sapling migration

**Command:**
```
verus z_setmigration false
```

## Potential Error Cases

1. **Potential Error - Invalid Parameter Type:**
   ```
   error code: -8
   error message:
   Invalid parameter, expected boolean
   ```

2. **Potential Error - No Sprout Addresses:**
   ```
   error code: -8
   error message:
   No Sprout addresses with sufficient balance found in wallet
   ```

3. **Potential Error - No Sapling Destination:**
   ```
   error code: -8
   error message:
   No Sapling address available in wallet for migration
   ```

4. **Potential Error - Wallet Locked:**
   ```
   error code: -13
   error message:
   Error: Please enter the wallet passphrase with walletpassphrase first
   ```

## Notes
The migration is designed to minimize information leakage about the user's finances, making it a gradual process that may take several weeks for wallets with significant Sprout balances. The migration works by sending up to 5 transactions whenever the blockchain reaches a height equal to 499 modulo 500. Transaction amounts are selected according to the random distribution specified in ZIP 308, enhancing privacy by avoiding predictable patterns. The migration automatically concludes when the wallet's Sprout balance falls below 0.01 VRSC. This threshold prevents spending excessive fees on migrating dust amounts. The destination address can be configured using the `-migrationdestaddress` parameter when starting the Verus daemon.

## Related Commands
- `z_getmigrationstatus`: Returns information about the status of the Sprout to Sapling migration
- `z_getnewaddress`: Returns a new shielded address for receiving payments
- `z_getbalance`: Returns the balance of a taddr or zaddr belonging to the wallet
- `z_gettotalbalance`: Returns the total value of funds stored in the node's wallet
- `z_listaddresses`: Returns the list of shielded addresses belonging to the wallet