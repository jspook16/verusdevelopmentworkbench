# Verus RPC Command: z_getmigrationstatus

## Purpose
The `z_getmigrationstatus` command provides detailed information about the status of the Sprout to Sapling migration process for shielded funds in the wallet. This command is crucial for monitoring the progression of funds from the older Sprout shielded pool to the more efficient and secure Sapling shielded pool, enabling users to track migration completion, verify transaction status, and ensure proper transfer of funds during protocol upgrades. It offers comprehensive visibility into this critical wallet maintenance process.

## Description
When executed, this command returns a detailed report on the current state of the Sprout to Sapling migration process for the wallet. The migration process involves transferring funds from the older Sprout shielded addresses to the newer Sapling shielded addresses, which offer improved performance, reduced memory requirements, and enhanced security features. The command provides information about whether migration is enabled, the destination Sapling address receiving the migrated funds, and detailed financial statistics tracking the amounts in different stages of migration. It distinguishes between unmigrated funds (still in Sprout addresses), unfinalized migrated funds (in transactions with fewer than ten confirmations), and finalized migrated funds (in transactions with at least ten confirmations). Additionally, it returns the count of migration transactions, the timestamp of the first migration transaction, and a complete list of transaction IDs involved in the migration process. This comprehensive reporting enables users to monitor the migration progress, troubleshoot any issues, and maintain accurate records of the protocol transition process.

**Command Type**: Query/Informational  
**Protocol Level**: Wallet  
**Access Requirement**: Requires wallet

## Arguments
This command does not accept any arguments.

## Results
The command returns an object containing detailed information about the migration status.

**Return Type**: Object

## Examples

### Example 1: Get the migration status

**Command:**
```
verus z_getmigrationstatus
```

**Sample Output:**
```
{
  "enabled": true,
  "destination_address": "zs1s57c8e6r5gvl0htdctks5xwxs52awg5nezk3ajvd77wjqpn6vkjl60avuh08ffr5g9ree53k86w",
  "unmigrated_amount": 2.50000000,
  "unfinalized_migrated_amount": 0.15000000,
  "finalized_migrated_amount": 7.35000000,
  "finalized_migration_transactions": 5,
  "time_started": 1574023963,
  "migration_txids": [
    "ff7d61074d9b33170bd74eb7396794910c96e92f8ae92cdc94d38fca7ddbe755",
    "afc53d591fa98e67c016897306b229d94b4243e28450ba2ecddf593b4215d11c",
    "e84c28d3fe86cb7ed350bf486b13bbf8c78fb5c9be27c4c5ab63734ce38526b1",
    "5b7e9d647e2eb60fb2a2a0b45082d4f0fab6cce3cb9aee68d67414d878927202",
    "8f01ff1d1b58f01ad0aad623fc0a27e805f8177883e893c3216350a3f9a272a4"
  ]
}
```

## Potential Error Cases

1. **Potential Error - Wallet Not Available:**
   ```
   error code: -18
   error message:
   Wallet not available
   ```

2. **Potential Error - Migration Not Enabled:**
   ```
   error code: -8
   error message:
   Migration not enabled
   ```

3. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
A transaction is defined as finalized if it has at least ten confirmations. The command may include manually created transactions involving the wallet in the results, not just automatic migration transactions. The migration process is a one-way operation—funds moved from Sprout to Sapling addresses cannot be automatically returned to Sprout addresses. The migration feature must be enabled separately before it will operate or provide meaningful status information.

## Related Commands
- `z_setmigration`: Enables or disables the migration from Sprout to Sapling
- `z_getbalance`: Returns the balance of a taddr or zaddr
- `z_gettotalbalance`: Returns the total value of funds in the wallet
- `z_listaddresses`: Returns the list of Sprout and Sapling shielded addresses
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients