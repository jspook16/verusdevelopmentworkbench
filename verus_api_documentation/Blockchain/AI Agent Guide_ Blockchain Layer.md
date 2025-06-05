# AI Agent Guide: When to Use Verus RPC Commands Related to Blockchain-Level Functionality

This guide helps AI agents determine which Verus RPC command to use in different scenarios when interacting with the blockchain layer functionality of a Verus node. It categorizes commands that specifically relate to blockchain operations, blockchain data retrieval, and blockchain state management by their purpose and describes when each should be used. All commands in this guide are focused solely on blockchain-level interactions.

## Block Information Commands

### When you need basic block information:

- **getblockcount**: When you need to know the current blockchain height (total number of blocks).
- **getbestblockhash**: When you need the hash of the most recent block in the chain.
- **getblockhash**: When you have a block height (index) and need to obtain the corresponding block hash.
- **getblock**: When you have a block hash or height and need detailed information about that block.
- **getblockheader**: When you need only the header information of a specific block (lighter than full block data).

### When you need blockchain state information:

- **getblockchaininfo**: When you need comprehensive information about the current state of the blockchain (network type, chain name, difficulty, verification progress, etc.).
- **getchaintips**: When you need to know about all chain tips, including orphaned branches.
- **getchaintxstats**: When you need statistics about transaction counts and rates in the chain.
- **getdifficulty**: When you need to know only the current proof-of-work difficulty.
- **z_gettreestate**: When you need information about a block's tree state (Sprout and Sapling commitment trees).

### When you need to verify blockchain integrity:

- **verifychain**: When you need to verify the integrity of the blockchain database.
- **verifytxoutproof**: When you need to verify that a proof points to a transaction in a block.

## Transaction and Mempool Commands

### When you need mempool information:

- **getmempoolinfo**: When you need statistics about the current state of the transaction memory pool.
- **getrawmempool**: When you need a list of all transaction IDs in the memory pool, or detailed information about each transaction.
- **clearrawmempool**: When you need to clear all transactions from the node's mempool.

### When you need transaction output information:

- **gettxout**: When you need details about an unspent transaction output.
- **gettxoutsetinfo**: When you need statistics about the entire unspent transaction output set.
- **gettxoutproof**: When you need a cryptographic proof that a transaction was included in a block.
- **getspentinfo**: When you need to find where a transaction output was spent.

## Historical Data and Search Commands

### When you need to search for blocks:

- **getblockhashes**: When you need to find blocks within a specific timestamp range.
- **getblockdeltas**: When you need detailed information about changes a block made to the blockchain state.

### When you need currency supply information:

- **coinsupply**: When you need information about the current coin supply at a given block height.

## Key-Value Store Commands 

### When you need to work with key-value data:

- **kvsearch**: When you need to search for a key stored via the kvupdate command.
- **kvupdate**: When you need to store a key-value pair on the blockchain.

## Special Purpose Commands

### When you need validation or notary information:

- **minerids**: When you need information about miner IDs (requires height parameter).
- **notaries**: When you need information about notaries (requires height and timestamp parameters).
- **processupgradedata**: When you need to process blockchain upgrade data.

## Best Practices for AI Agents

1. Start with **getblockchaininfo** to understand the current state of the blockchain.
2. Use **getblockcount** and **getbestblockhash** to get the most current block information.
3. For transaction analysis, first check **getmempoolinfo** to understand the current transaction pool.
4. When analyzing historical data, use **getblock** with appropriate verbosity levels to control the amount of data returned.
5. For performance-sensitive operations, use lighter commands like **getblockheader** instead of full **getblock** when possible.
6. Remember that some commands like **getblockdeltas** may require special flags to be enabled on the Verus node.
7. For key-value operations, note that these features are primarily available for asset chains.
8. Always handle errors appropriately, especially for commands that might take significant time to process like **gettxoutsetinfo** or **verifychain**.
