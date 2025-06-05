# Testing Notes

## Identity Registration

*   **Issue/Observation**: When registering an identity and specifying different i-addresses for revocation and recovery authorities (i.e., authorities different from the ID being registered itself), after the transaction is confirmed and the identity is queried (e.g., with `getidentity`), it appears that the identity still lists *itself* as its own revocation and recovery authority. 
    *   **To Investigate**: Is this behavior by design of the Verus protocol (e.g., an override or default if certain conditions aren't met, or perhaps the primary state always shows the ID itself and the *actual controlling addresses* are elsewhere or more nuanced)? Or is there a potential issue in how the `registeridentity` parameters are being processed or interpreted by the daemon, or how the form is sending them? 

## Z-Addresses and Identities

*   **Observation**: Identities can have Z-addresses associated with them.
    *   **To Investigate**: How to add a Z-address to an existing identity using the `updateidentity` command (or other relevant commands). What are the implications and use cases? 

## Identity Timelocking (`setidentitytimelock`)

*   **Question**: Is there a minimum number of blocks into the future that an identity timelock (`unlockatblock` parameter) must be set for? 
    *   **Hypothesis**: The minimum might be 40 blocks from the current block height. This needs to be confirmed through testing or further documentation review. The current API documentation for `setidentitytimelock` only states "Block height must be greater than current height."

## To Do List

### Currency Management
- In Currency Management tab, the ID Registration Fees field needs to be added to the Core Parameters.
- The example for Initial Contributions field should be updated to show [100,50] (amounts in the order of defined reserves).

### VerusID Operations  
- **Update Identity Form Enhancement**: Add support for sub-identity updates in the UpdateIdentityForm component. Recent discovery shows that sub-identity updates require separate `"name"` and `"parent"` parameters instead of the fully qualified name format (e.g., `{"name": "subid@", "parent": "parent@"}` instead of `{"name": "subid.parent@"}`). See updateidentity.md Example 10 for details. The current form only supports main identity updates and needs to detect sub-identities and provide appropriate UI fields.