# Verus RPC Command: zcbenchmark

## Purpose
The `zcbenchmark` command runs performance tests on the cryptographic operations underlying shielded transactions. This command is essential for system performance analysis, hardware capability assessment, troubleshooting performance issues, and evaluating the impact of code optimizations on zero-knowledge proof operations. It provides valuable metrics for understanding the resource requirements and execution times of the complex cryptographic operations that enable privacy features in the Verus ecosystem.

## Description
When executed with the appropriate parameters, this command performs a specified cryptographic benchmark operation multiple times and returns the running time for each execution. The benchmark types typically include various zero-knowledge proof generation and verification operations, note encryption and decryption, and other cryptographic primitives essential to the functioning of shielded transactions. These operations are particularly resource-intensive, often requiring significant CPU and memory resources. By measuring their performance across multiple runs, users can gain insights into how well their system handles these operations, identify potential bottlenecks, and make informed decisions about hardware requirements or software configurations. The detailed timing data provided for each run enables statistical analysis to account for variance in execution times. This diagnostic capability is particularly valuable for developers working on optimizing the codebase, system administrators configuring nodes, or users experiencing performance issues with shielded transactions.

**Command Type**: Diagnostic/Development  
**Protocol Level**: Cryptographic  
**Access Requirement**: Requires wallet

## Arguments
The command accepts two required arguments:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| benchmarktype | string | Yes | N/A | The type of benchmark to run |
| samplecount | numeric | Yes | N/A | The number of times to run the benchmark |

## Results
The command returns an array of objects, each containing the running time of a benchmark sample.

**Return Type**: Array of objects

## Examples

### Example 1: Run a joinsplit proof generation benchmark 5 times

**Command:**
```
verus zcbenchmark joinsplit 5
```

**Sample Output:**
```
[
  {
    "runningtime": 2.312
  },
  {
    "runningtime": 2.289
  },
  {
    "runningtime": 2.304
  },
  {
    "runningtime": 2.298
  },
  {
    "runningtime": 2.315
  }
]
```

## Potential Error Cases

1. **Potential Error - Invalid Benchmark Type:**
   ```
   error code: -8
   error message:
   Invalid benchmark type
   ```

2. **Potential Error - Invalid Sample Count:**
   ```
   error code: -8
   error message:
   Invalid sample count, must be a positive integer
   ```

3. **Potential Error - Insufficient Resources:**
   ```
   error code: -4
   error message:
   Error: Out of memory while running benchmark
   ```

4. **Potential Error - Authentication Failure:**
   ```
   error code: -1
   error message:
   Incorrect username or password
   ```

## Notes
The specific benchmark types available may vary depending on the version of the software and the cryptographic protocols supported. Common benchmark types include "joinsplit" (for testing JoinSplit proof generation), "verifyjoinsplit" (for testing JoinSplit proof verification), "solveequihash" (for testing Equihash solving), "connectblock" (for testing block connection with shielded transactions), "sendtoaddress" (for testing full shielded transaction creation), and various other cryptographic operations. Running times are typically reported in seconds. The benchmark results can vary significantly based on hardware specifications, particularly CPU performance and memory availability. For statistically meaningful results, it is recommended to run a sufficient number of samples (typically 10 or more) to account for variability in execution times.

## Related Commands
- `getinfo`: Returns general information about the node and network
- `getmemoryinfo`: Returns information about memory usage
- `getnetworkinfo`: Returns information about the node's network connection
- `getwalletinfo`: Returns information about the wallet state
- `z_getoperationstatus`: Get operation status and any associated result data