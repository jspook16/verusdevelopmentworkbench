# Verus RPC Command: estimatepriority

## Purpose
The `estimatepriority` command is designed to calculate the approximate transaction priority needed for a zero-fee transaction to be included in a block within a specified number of blocks. This command is particularly useful for users who wish to send transactions without fees while still achieving timely confirmation, offering an alternative cost-saving approach to transaction processing in the Verus network.

## Description
The `estimatepriority` command analyzes historical network data to predict the minimum transaction priority required for a zero-fee transaction to be confirmed within the target number of blocks. Transaction priority is typically calculated based on factors such as the age and value of inputs being spent. Higher priority transactions may be processed without fees during periods of low network congestion, making this command valuable for cost-efficient transactions.

**Command Type**: Query/Read-only  
**Protocol Level**: Transaction Priority Layer  
**Access Requirement**: Basic node access

## Arguments
The command accepts a single parameter:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nblocks` | numeric | Yes | Target number of blocks for zero-fee transaction confirmation |

## Results
The command returns a single numeric value:

**Return Type**: Numeric

| Value | Description |
|-------|-------------|
| n | The estimated priority value needed for a zero-fee transaction to be confirmed within the specified number of blocks |
| -1.0 | Returned when insufficient data exists to make an accurate estimation |

## Examples

### Example: Estimate Priority for Zero-Fee Confirmation Within 6 Blocks

**Command:**
```
verus estimatepriority 6
```

**Potential Output:**
```
1000000.0
```

This example demonstrates:
- How to query the estimated priority needed for a zero-fee transaction to be confirmed within 6 blocks
- The returned value (1000000.0) represents the estimated priority threshold based on current network conditions
- Transactions with a priority value above this threshold have a reasonable chance of being confirmed within 6 blocks without requiring a fee

If the output were `-1.0`, it would indicate that insufficient transaction and block data has been observed to make a reliable estimate.

## Potential Error Cases

1. **Potential Error - Invalid Block Count:**
   ```
   error code: -8
   error message:
   Invalid block count: must be between 1 and 25
   ```

2. **Potential Error - Negative Block Count:**
   ```
   error code: -8
   error message:
   Block count cannot be less than 1
   ```

3. **Potential Error - Non-numeric Input:**
   ```
   error code: -8
   error message:
   Expected numeric block count
   ```

4. **Potential Warning - Limited Data Available:**
   ```
   warning:
   Priority estimation has limited data available, returning -1.0
   ```
   
   In this case, the command would return -1.0, indicating that a reliable estimate cannot be made due to insufficient historical data.
