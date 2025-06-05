# Verus RPC Command: zcrawjoinsplit

## Purpose
The `zcrawjoinsplit` command splices a joinsplit operation into a raw transaction, enabling low-level manipulation of shielded value transfers. This deprecated command was designed for advanced transaction construction, custom shielded transaction building, testing and development of zero-knowledge proof systems, and manual control over the privacy components of transactions. It provides direct access to the cryptographic mechanisms underlying shielded value transfers.

## Description
When executed with the appropriate parameters, this command takes a raw transaction and adds a joinsplit operation to it, which enables the transfer of value between transparent and shielded pools. The joinsplit operation is a fundamental cryptographic construct in the Zcash protocol that Verus implements, allowing value to move while preserving privacy through zero-knowledge proofs. The command requires specifying the input notes (along with their corresponding spending keys), output addresses and amounts, and values for vpub_old and vpub_new (which control the net flow of value between transparent and shielded pools). It performs the complex cryptographic operations needed to create valid zero-knowledge proofs and returns the modified transaction along with encrypted notes for the recipients. This low-level command gives advanced users and developers direct control over joinsplit construction, bypassing the higher-level abstractions provided by commands like `z_sendmany`. However, it places significant responsibility on the caller to manage the encrypted notes and properly broadcast the transaction, as these steps are not handled automatically.

**Command Type**: Low-level/Transaction  
**Protocol Level**: Cryptographic  
**Access Requirement**: Requires wallet  
**Deprecated Status**: This command is deprecated

## Arguments
The command accepts five required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| rawtx | string | Yes | N/A | The raw transaction to add a joinsplit to |
| inputs | object | Yes | N/A | A JSON object mapping notes to zcsecretkeys |
| outputs | object | Yes | N/A | A JSON object mapping zcaddrs to values |
| vpub_old | numeric | Yes | N/A | Value being spent from transparent value pool |
| vpub_new | numeric | Yes | N/A | Value being added to transparent value pool |

## Results
The command returns an object containing the encrypted notes and the modified raw transaction.

**Return Type**: Object

## Examples

### Example 1: Add a joinsplit to a raw transaction

**Command:**
```
verus zcrawjoinsplit "0100000001f6a4be5e262d887dce6212a2e468a5908c25512f9f190f6019b25949151d6ad0000000000ffffffff0100e1f505000000001976a9141d3aad9b04143f7d6e7a6d0f0a7a1fe44d5e1d0f88ac00000000" {"note1":"zcsecretkey1","note2":"zcsecretkey2"} {"zcaddr1":1.0,"zcaddr2":2.0} 0 3.0
```

**Sample Output:**
```
{
  "encryptednote1": "e123d162564e9a5034ba89e7570f25e9875f594095271e6397811f514410e1752a712b98b41116c8ca3dade7c6146f4a7f6bb93a3b7d711e7c46ed398509786b7c0ce29879aaba741c4c2e9ccdfce83cce8495d2fa9b98bfc6d012704cb51f75e",
  "encryptednote2": "f123d162564e9a5034ba89e7570f25e9875f594095271e6397811f514410e1752a712b98b41116c8ca3dade7c6146f4a7f6bb93a3b7d711e7c46ed398509786b7c0ce29879aaba741c4c2e9ccdfce83cce8495d2fa9b98bfc6d012704cb51f75e",
  "rawtxn": "0100000001f6a4be5e262d887dce6212a2e468a5908c25512f9f190f6019b25949151d6ad0000000000ffffffff0100e1f505000000001976a9141d3aad9b04143f7d6e7a6d0f0a7a1fe44d5e1d0f88ac00000000015bf0af0173af0160eb0ea6ea6cd432a9ce8d76c61fb9a62d4b4149fa5e8732e8055232bacbe45a5e714503125362795036d1356c0769951d1f8c8adec6fe6a383fa9a4af32321ba89ce2a9c081c82c53a5ef8c88a2adcf9cae61ed1ca2cb694c03b28399201fafbf52c953d30c1f90be8458b28df0ad747d6906df7b7a8c60e65aeb29c5a021c41536d3a1a5e9f8e8ca64a2a05bc88bd1f68e34fc2e98db555f1be38e2cf5cd73cf356c3a83f4af0ecbb33f7bcfa1c44a1dd333448ba12fe821279fbfd8cea8799ec71edb8c9fe97a35f9d82f549b6ba3ab6dd4eb226cbce6123af4ec999b76ee1c8bb833356132c324d05f5920a73c5fe54c8e6f28bda07550e0ed3b43a97ef28064e66ecd3b5dca64f4ef34d9df3d646810eac7d996e9aca9cbce62143c94fe1703fc39c4358b2f96f7e999e877d9aa9c0a88a28245a44eb15380b6f1352f235ac1a4383fe339e8672c19071b7a335b059ef909a3d2400c1f85f321e5376695f7f5a343e387194a34cf92a3c7cd00f28bb92a44a6b36b7371d441c3943dab5979239f2c21dbd857b0e451f4fbb3c791c7dc2d3637110a5fd4a31395d25e518a3a3d7a4d8f642f68eaa8a645de1719095e2d65cfd8ed04ec57579f434d3a823ba7a33c8df3641f77d5ed4bf1a1d02058023e5dd01c6de0b23e00168ad808b79e0a91586cc1382e4a3f9b8271451291900d0d2d80a993b6a9cf15bd8602427366943bf1feba3c5bcca9c2dbf985748d71f872fb797c677388c3999a8afa7af1ed38cb54c1f7c0b31592dd443f8dd6c7cf3f0cfe99d9c5e318f4ad7c324e06024792b25e22d526e37689e9e2255f34ae260d0528fa0b362ad4c6e332d58fe8afb8c063e2dc7b1247f5e7384edbaaae641a655ad6ddbadca69b964ac4a6c1a2be50e5ee8d58acd6c51fd3c2d0bb5a5ba70b68a1015fada35413a539bd94a59bb293fe6e0b4b6da7c4a6d322536f3f6f76d1c8c4b6a0c39c2c61a0f7eaef1eae7cda9f82a1f0bd9b1a53e84c7ec229244fa2a01c910f3c8b494e0eda0f4adc88c0cf25f742b4ee4941916c5be92c6c34b4aa0ee9419e94e13dad8a5cb947c4813e5fcce6a7a1af2a04a37251a94d9384c2dcaec99ed38a24ebfccc9b5ef4beeb51c2a4a2dbf813dcdc5e3a4c7d11766fcea7d0f5266d7eacf1a0487e4a63cfeee16933df29b3eb790dc4b761f5f1e17c7f7e48e13f7fae850d46ead26d4ca35892ef923eed68bc42f213c1ceebdb9f0dcfb22465e5fa2a5ce40b93e5b1e29be4652fdaeb123ae32667e5e37dabaa4e7f9ce92e561ad66deae28de8c253fa18cbb91fa8b3cb36c4d7917365a03e34f0b34c395721c4a86c1b9e375ad2147afd1b65ce35fd9ed1c049d1c8ec40c4218b045c7d41656b8f525ac9c6d81a9038d8d97c425f93ae14e35e328d90417a2981b0c6adb25ca850c37f000e5a0c3a089840cdbdc7f6ba189a33a9eeb1604890273c9a76a9b9120d5a645aae8cf6db8896c6b14e9564a4f65e4658a1e3eaf2c47908e645b9dc4bf6d9a35bef7560be535b51e9369e2dc5eeb49a58547891ab8fdd3288db6f7201c0a7fbc421a3eddb4a5f1fbd0c9c2ac7e6717e3d70fe58653dc86b3cca1fa6c8dc17324a19c1ceec31fa75f4e1e92e640f0b1b3b3a8eeedc0c03117c3b99d43d46b5231cb566755c6c4f35f8ff16a6ffe7a7b46850ddce246c06dca0ecc9c0cf608ba60ff5465c52e4343b6c091f88b6f8e4847dd3de8bf1a1e5e3f348ee40c5fe9f4a9aeb3c87f8feb61c836ebaef0e284894c0a4a064e7d15ed29be4e59509cb214ad9bb4e0d0dcb05c5e067b32b6c10b9c21ce72e5574686b5b9c1a6f4eb17ce051e40e44f4154c1a9ae5b16ecda33e62f5ac4972fca7ec5bd2a9007f6e2f9887c3c0e0b0b5c31eb474152fc04d3f5bf3e9c54ce34ed77cf5cb2a6f29b1da04ce7998dd5c4ac3ebbe48b9b83b45d45cc3f650a44dc5bed8a6f50b94f6ba50a13e6ef2c63ccac0bcd2a50b7d5b63a7b30d2"
}
```

## Potential Error Cases

1. **Potential Error - Invalid Transaction Format:**
   ```
   error code: -8
   error message:
   Could not parse transaction
   ```

2. **Potential Error - Invalid Inputs Format:**
   ```
   error code: -8
   error message:
   Expected inputs to be a JSON object
   ```

3. **Potential Error - Invalid Outputs Format:**
   ```
   error code: -8
   error message:
   Expected outputs to be a JSON object
   ```

4. **Potential Error - Invalid VP Values:**
   ```
   error code: -8
   error message:
   vpub_old and vpub_new cannot both be non-zero
   ```

5. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
DEPRECATED. This command provides low-level access to the joinsplit mechanism and is intended primarily for development and testing purposes. Inputs to the joinsplit are unilaterally confidential, meaning only the sender knows what notes are being spent. Outputs are confidential between sender and receiver, with the amount and recipient address hidden from external observers. The vpub_old parameter represents value being taken from the transparent value pool and added to the shielded pool, while vpub_new represents value being taken from the shielded pool and added to the transparent pool. Note that vpub_old and vpub_new cannot both be non-zero in the same joinsplit operation. The caller is responsible for delivering the encrypted notes (encryptednote1 and encryptednote2) to the appropriate recipients, as well as signing and broadcasting the raw transaction. A future RPC call will deliver the confidential payments in-band on the blockchain.

## Related Commands
- `zcsamplejoinsplit`: Perform a joinsplit and return the JSDescription
- `zcrawkeygen`: Generate a zcaddr which can send and receive confidential values
- `zcrawreceive`: Decrypt an encrypted note
- `z_sendmany`: Send multiple times from a shielded address to multiple recipients
- `z_viewtransaction`: Get detailed shielded information about a transaction