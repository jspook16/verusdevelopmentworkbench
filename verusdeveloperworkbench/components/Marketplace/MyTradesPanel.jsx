import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Paper, Typography, CircularProgress, Button, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { NodeContext } from '../../contexts/NodeContext';
import TradeCard from './TradeCard';

const MyTradesPanel = () => {
  const { sendCommand, nodeStatus } = useContext(NodeContext);
  const [tradeTxids, setTradeTxids] = useState([]);
  const [tradeDetails, setTradeDetails] = useState({}); // Store details: { txid: data }
  const [loadingStates, setLoadingStates] = useState({}); // Store loading: { txid: boolean }
  const [overallLoading, setOverallLoading] = useState(false);

  const tradeStorageKey = 'verusWorkbench_successfulTradeTxids_VRSCTEST'; // Chain-specific key

  const loadTradeTxids = useCallback(() => {
    try {
      const storedTxids = localStorage.getItem(tradeStorageKey);
      if (storedTxids) {
        setTradeTxids(JSON.parse(storedTxids));
      } else {
        setTradeTxids([]);
      }
    } catch (e) {
      console.error("Failed to load trade TXIDs from localStorage:", e);
      setTradeTxids([]);
    }
  }, [tradeStorageKey]);

  useEffect(() => {
    loadTradeTxids();
  }, [loadTradeTxids]);

  const fetchTradeDetail = useCallback(async (txid) => {
    if (!txid || !nodeStatus?.connected || tradeDetails[txid]) return; // Don't refetch if already loaded

    setLoadingStates(prev => ({ ...prev, [txid]: true }));
    try {
      console.log(`[MyTradesPanel] Fetching details for TXID: ${txid}`);
      const result = await sendCommand('gettransaction', [txid]);
      setTradeDetails(prev => ({ ...prev, [txid]: result }));
    } catch (err) {
      console.error(`[MyTradesPanel] Error fetching details for TXID ${txid}:`, err);
      setTradeDetails(prev => ({ ...prev, [txid]: { error: err.message || 'Failed to fetch' } }));
    }
    setLoadingStates(prev => ({ ...prev, [txid]: false }));
  }, [sendCommand, nodeStatus, tradeDetails]);

  // Effect to fetch details for new TXIDs
  useEffect(() => {
    if (tradeTxids.length > 0 && nodeStatus?.connected) {
        let didFetch = false;
        tradeTxids.forEach(txid => {
            if (!tradeDetails[txid] && !loadingStates[txid]) {
                fetchTradeDetail(txid);
                didFetch = true;
            }
        });
        if (didFetch && !overallLoading) {
            // This is a bit simplistic; ideally, track all individual loadings
            // For now, just a general loading state if any fetch is initiated.
        }
    }
  }, [tradeTxids, tradeDetails, loadingStates, fetchTradeDetail, nodeStatus, overallLoading]);

  // Effect to load initial TXIDs and listen for storage changes
  useEffect(() => {
    loadTradeTxids(); // Initial load

    const handleStorageChange = (event) => {
      if (event.key === tradeStorageKey) {
        console.log('[MyTradesPanel] Storage change detected, reloading trade TXIDs.');
        loadTradeTxids();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadTradeTxids, tradeStorageKey]); // tradeStorageKey is stable, loadTradeTxids is useCallback

  const handleRefreshAll = () => {
    setTradeDetails({}); // Clear existing details to force refetch
    setLoadingStates({});
    setOverallLoading(true);
    loadTradeTxids(); // This will trigger the fetch effect
    // A delay to turn off overallLoading, or track individual loadings more precisely
    setTimeout(() => setOverallLoading(false), 2000 + tradeTxids.length * 200); 
  };
  
  const handleClearAllTrades = () => {
    if (window.confirm('Are you sure you want to clear all trade history? This cannot be undone.')) {
      localStorage.removeItem(tradeStorageKey);
      setTradeTxids([]);
      setTradeDetails({});
      setLoadingStates({});
    }
  };

  const handleDeleteTrade = useCallback((txidToDelete) => {
    if (window.confirm(`Are you sure you want to remove trade ${txidToDelete.substring(0,12)}...?`)) {
      try {
        const currentTxids = tradeTxids.filter(txid => txid !== txidToDelete);
        localStorage.setItem(tradeStorageKey, JSON.stringify(currentTxids));
        setTradeTxids(currentTxids);
        
        // Clean up details and loading states
        setTradeDetails(prev => {
          const newState = {...prev};
          delete newState[txidToDelete];
          return newState;
        });
        setLoadingStates(prev => {
          const newState = {...prev};
          delete newState[txidToDelete];
          return newState;
        });
        console.log(`[MyTradesPanel] Deleted trade: ${txidToDelete}`);
      } catch (e) {
        console.error("[MyTradesPanel] Error deleting trade:", e);
      }
    }
  }, [tradeTxids, tradeStorageKey]);

  return (
    <Paper sx={{ p: 1.5, background: '#232323', borderRadius: 1, minWidth: 0, boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>My Trades</Typography>
        <Box>
          <Tooltip title="Clear All Trades">
            <IconButton onClick={handleClearAllTrades} size="small" sx={{ color: '#f46a6a' }} disabled={tradeTxids.length === 0}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Trades">
            <IconButton onClick={handleRefreshAll} size="small" sx={{ color: '#a0cff9' }} disabled={overallLoading || !nodeStatus?.connected}>
              {overallLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {!nodeStatus?.connected && (
          <Typography sx={{ color: '#888', textAlign: 'center', mt: 2, fontSize: '0.8rem' }}>Connect to daemon to see trades.</Typography>
        )}
        {nodeStatus?.connected && tradeTxids.length === 0 && !overallLoading && (
          <Typography sx={{ color: '#888', textAlign: 'center', mt: 2, fontSize: '0.8rem' }}>No trades found.</Typography>
        )}
        {nodeStatus?.connected && overallLoading && tradeTxids.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px'}}><CircularProgress /></Box>
        )}

        {tradeTxids.map(txid => (
          <React.Fragment key={txid}>
            {loadingStates[txid] && (
              <Box sx={{ display: 'flex', alignItems: 'center', p:1, background: '#191919', borderRadius:1, mb:1}}>
                <CircularProgress size={14} sx={{mr:1}}/>
                <Typography component="span" sx={{color: '#aaa', fontSize: '0.8rem'}}>Loading {txid.substring(0,12)}...</Typography>
              </Box>
            )}
            {tradeDetails[txid] && tradeDetails[txid].error && (
              <Box sx={{ mb: 1, p: 1, background: '#191919', borderRadius: 1 }}>
                <Typography sx={{color: 'red', fontSize: '0.7rem'}}>Error loading {txid.substring(0,12)}...: {tradeDetails[txid].error}</Typography>
              </Box>
            )}
            {tradeDetails[txid] && !tradeDetails[txid].error && (
              <TradeCard 
                txid={txid} 
                details={tradeDetails[txid]} 
                onDelete={handleDeleteTrade}
              />
            )}
            {!tradeDetails[txid] && !loadingStates[txid] && nodeStatus?.connected && (
              <Box sx={{ mb: 1, p: 1, background: '#191919', borderRadius: 1, display: 'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Typography component="span" sx={{color: '#ccc', fontSize: '0.8rem'}}>TXID: {txid.substring(0,12)}...</Typography>
                <Button size="small" onClick={() => fetchTradeDetail(txid)}>Load Details</Button>
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};

export default MyTradesPanel; 