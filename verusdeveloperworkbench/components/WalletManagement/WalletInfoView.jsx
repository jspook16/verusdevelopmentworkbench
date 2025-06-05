import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { NodeContext } from '../../contexts/NodeContext';

// Helper to display key-value pairs nicely
const InfoItem = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Paper elevation={1} sx={{p: 1.5, background: '#2c2c2c', height: '100%'}}>
      <Typography variant="caption" sx={{color: '#aaa', display: 'block', mb: 0.5}}>{label}:</Typography>
      <Typography variant="body2" sx={{color: '#e0e0e0', wordBreak: 'break-all'}}>
        {typeof value === 'object' ? JSON.stringify(value, null, 2) : (value !== null && value !== undefined ? String(value) : 'N/A')}
      </Typography>
    </Paper>
  </Grid>
);

const WalletInfoView = () => {
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const [walletInfo, setWalletInfo] = useState(null);
  const [balances, setBalances] = useState({ total: null, unconfirmed: null, zTotal: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!nodeStatus.connected || !sendCommand) {
      setError('Node not connected or sendCommand not available.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const walletInfoRes = await sendCommand('getwalletinfo', []);
      setWalletInfo(walletInfoRes);

      const balanceRes = await sendCommand('getbalance', []);
      const unconfirmedBalanceRes = await sendCommand('getunconfirmedbalance', []);
      const zTotalBalanceRes = await sendCommand('z_gettotalbalance', []);
      
      setBalances({
        total: balanceRes,
        unconfirmed: unconfirmedBalanceRes,
        zTotal: zTotalBalanceRes,
      });

    } catch (err) {
      console.error("Error fetching wallet overview data:", err);
      setError(err.message || 'Failed to fetch data.');
      setWalletInfo(null);
      setBalances({ total: null, unconfirmed: null, zTotal: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeStatus.connected]); // Re-fetch if connection status changes

  return (
    <Paper sx={{p: 2, background: '#232323', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0}}>
        <Typography variant="h6" sx={{color: '#fff'}}>Wallet Overview & Balances</Typography>
        <Button 
          variant="outlined" 
          startIcon={loading ? <CircularProgress size={16}/> : <RefreshIcon />} 
          onClick={fetchData}
          disabled={loading || !nodeStatus.connected}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {error && <Typography sx={{color: 'error.main', mb:2}}>{error}</Typography>}
      
      <Box sx={{overflowY: 'auto', flexGrow: 1}}>
        {loading && (!walletInfo && !balances.total) && <CircularProgress sx={{display: 'block', margin: 'auto'}}/>}
        
        <Typography variant="subtitle1" sx={{color: '#e0e0e0', fontWeight: 'bold', mb: 1, mt:1}}>Balances:</Typography>
        <Grid container spacing={2} sx={{mb:2}}>
          <InfoItem label="Total Confirmed Balance (Transparent)" value={balances.total !== null ? balances.total : (loading ? 'Loading...': 'N/A')} />
          <InfoItem label="Total Unconfirmed Balance" value={balances.unconfirmed !== null ? balances.unconfirmed : (loading ? 'Loading...': 'N/A')} />
          <InfoItem label="Total Shielded Balance" value={balances.zTotal?.private !== undefined ? balances.zTotal.private : (loading ? 'Loading...': 'N/A')} />
          <InfoItem label="Overall Total Balance (Transparent + Shielded)" value={balances.zTotal?.total !== undefined ? balances.zTotal.total : (loading ? 'Loading...': 'N/A')} />
        </Grid>
        
        {walletInfo && (
          <>
            <Divider sx={{my:2, borderColor: '#444'}} />
            <Typography variant="subtitle1" sx={{color: '#e0e0e0', fontWeight: 'bold', mb: 1}}>Wallet Details (getwalletinfo):</Typography>
            <Grid container spacing={2}>
              {Object.entries(walletInfo).map(([key, value]) => (
                <InfoItem key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={value} />
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default WalletInfoView; 