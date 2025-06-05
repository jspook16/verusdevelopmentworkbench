import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Tabs, Tab, Typography, Button, Paper, Grid, CircularProgress, Divider, TextField, Tooltip, IconButton, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NodeContext } from '../../contexts/NodeContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import { TerminalContext } from '../../contexts/TerminalContext';
import KeyManagementPanel from './KeyManagementPanel';
import BackupRestorePanel from './BackupRestorePanel';
import TransactionsPanel from './TransactionsPanel';
import SendingFundsPanel from './SendingFundsPanel';
import ShieldedOpsPanel from './ShieldedOpsPanel';
import MaintenancePanel from './MaintenancePanel';
import AdvancedWalletOpsPanel from './AdvancedWalletOpsPanel';

// Helper to display key-value pairs nicely
const InfoItem = ({ label, value, isObjectNested = false, xs = 12, sm = 6, md = 4, lg = 3 }) => (
  <Grid item xs={xs} sm={sm} md={md} lg={lg}>
    <Paper elevation={1} sx={{p: 1.5, background: '#2c2c2c', height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Typography variant="caption" sx={{color: '#aaa', display: 'block', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={label}>{label}:</Typography>
      {isObjectNested && typeof value === 'object' && value !== null ? (
        <Box sx={{flexGrow: 1, overflowY: 'auto'}} >
          {Object.entries(value).map(([key, val]) => (
            <Typography key={key} variant="body2" sx={{color: '#e0e0e0', wordBreak: 'break-all', fontSize: '0.75rem'}}>
              {key}: {String(val)}
            </Typography>
          ))}
          {Object.keys(value).length === 0 && <Typography variant="body2" sx={{color: '#888', fontSize: '0.75rem'}}>Empty</Typography>}
        </Box>
      ) : (
        <Typography variant="body2" sx={{color: '#e0e0e0', wordBreak: 'break-all', flexGrow: 1}}>
          {typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : (value !== null && value !== undefined ? String(value) : 'N/A')}
        </Typography>
      )}
    </Paper>
  </Grid>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-op-tabpanel-${index}`}
      aria-labelledby={`wallet-op-tab-${index}`}
      sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}> 
          {children}
        </Box>
      )}
    </Box>
  );
}

const WalletOperationsView = () => {
  const [selectedOpTab, setSelectedOpTab] = useState(0);
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const { selectedVerusIdWM, selectedRAddressWM, selectedZAddressWM } = useContext(IdentityContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);
  
  // State for wallet overview data
  const [walletInfo, setWalletInfo] = useState(null);
  const [balances, setBalances] = useState({ total: null, unconfirmed: null, zTotal: null });
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState(null);

  // Accordion expansion states for remaining tabs
  const [expandedShieldedOpSection, setExpandedShieldedOpSection] = useState('listoperationids');

  // State for Shielded Ops tab (z_listoperationids, etc.)
  const [opIdStatusFilter, setOpIdStatusFilter] = useState('all');
  const [loadingOpIds, setLoadingOpIds] = useState(false);
  const [errorOpIds, setErrorOpIds] = useState('');
  const [opIds, setOpIds] = useState([]);
  const [getStatusOpIdInput, setGetStatusOpIdInput] = useState('');
  const [getOperationStatusResult, setGetOperationStatusResult] = useState(null);
  const [getOperationStatusError, setGetOperationStatusError] = useState('');
  const [getResultOpIdInput, setGetResultOpIdInput] = useState('');
  const [operationResultData, setOperationResultData] = useState(null);
  const [getOperationResultError, setGetOperationResultError] = useState('');

  // Accordion handlers for remaining tabs
  const handleShieldedOpAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedShieldedOpSection(isExpanded ? panel : false);
  };

  const fetchOverviewData = useCallback(async () => {
    if (!nodeStatus.connected || !sendCommand) {
      setOverviewError('Node not connected or sendCommand not available.');
      return;
    }
    setLoadingOverview(true);
    setOverviewError(null);
    try {
      const walletInfoRes = await sendCommand('getwalletinfo', []);
      setWalletInfo(walletInfoRes);
      const balanceRes = await sendCommand('getbalance', []);
      const unconfirmedBalanceRes = await sendCommand('getunconfirmedbalance', []);
      const zTotalBalanceRes = await sendCommand('z_gettotalbalance', []);
      setBalances({ total: balanceRes, unconfirmed: unconfirmedBalanceRes, zTotal: zTotalBalanceRes });
    } catch (err) {
      console.error("Error fetching wallet overview data:", err);
      setOverviewError(err.message || 'Failed to fetch data.');
      setWalletInfo(null);
      setBalances({ total: null, unconfirmed: null, zTotal: null });
    } finally {
      setLoadingOverview(false);
    }
  }, [nodeStatus.connected, sendCommand]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleOpTabChange = (event, newValue) => {
    setSelectedOpTab(newValue);
    clearAllShieldedOpFields();
  };

  const handleCopy = (textToCopy) => {
    if (textToCopy === undefined || textToCopy === null) return;
    navigator.clipboard.writeText(String(textToCopy));
  };

  // Shielded Ops handlers
  const handleListOpIds = async () => {
    setLoadingOpIds(true); setErrorOpIds('');
    const cmd = 'z_listoperationids';
    const params = opIdStatusFilter === 'all' ? [] : [opIdStatusFilter];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setOpIds(result); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) { console.error(`Error in ${cmd}:`, err); setErrorOpIds(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setLoadingOpIds(false); }
  };
  const handleGetOperationStatus = async () => {
    if (!getStatusOpIdInput.trim()) { setGetOperationStatusError('Operation ID is required.'); return; }
    setGetOperationStatusError(''); setGetOperationStatusResult(null);
    const cmd = 'z_getoperationstatus';
    const params = [[getStatusOpIdInput.trim()]];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setGetOperationStatusResult(result[0] || null); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) { console.error(`Error in ${cmd}:`, err); setGetOperationStatusError(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'}); }
  };
  const handleGetOperationResult = async () => {
    if (!getResultOpIdInput.trim()) { setGetOperationResultError('Operation ID is required.'); return; }
    setGetOperationResultError(''); setOperationResultData(null);
    const cmd = 'z_getoperationresult';
    const params = [[getResultOpIdInput.trim()]];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setOperationResultData(result[0] || null); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) { console.error(`Error in ${cmd}:`, err); setGetOperationResultError(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'}); }
  };
  const clearAllShieldedOpFields = () => { setOpIdStatusFilter('all'); setErrorOpIds(''); setOpIds([]); setGetStatusOpIdInput(''); setGetOperationStatusResult(null); setGetOperationStatusError(''); setGetResultOpIdInput(''); setOperationResultData(null); setGetOperationResultError(''); };

  // Helper rendering functions - Duplicated here, consider moving to utils
  const renderTextField = (label, value, onChange, type = "text", helperText = "", props = {}, adornment = null) => (
    <TextField 
        label={label} 
            variant="outlined" 
            size="small"
        fullWidth 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        InputLabelProps={{ sx: { fontSize: '0.8rem' } }} 
        inputProps={{ sx: { fontSize: '0.8rem', ...props.inputProps } }} 
        helperText={helperText} 
        FormHelperTextProps={{ sx: {fontSize: '0.65rem'} }}
        InputProps={adornment ? { endAdornment: adornment } : {}}
        {...props} 
    /> 
  );
  const renderJsonTextField = (label, value, onChange, helperText = "", props = {}) => ( 
              <TextField 
        label={label} 
                variant="outlined" 
                size="small" 
        fullWidth 
        multiline 
        minRows={2} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        InputLabelProps={{ sx: { fontSize: '0.8rem' } }} 
        inputProps={{ sx: { fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', ...props.inputProps } }} 
        helperText={helperText} 
        FormHelperTextProps={{ sx: {fontSize: '0.65rem'} }} 
        {...props} 
    /> 
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor:'#1e1e1e'}}>
      {/* Wallet Overview Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 1, bgcolor: '#232323' }}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb:1}}>
            <Typography variant="h6" sx={{color:'white'}}>Wallet Overview</Typography>
            <Tooltip title="Refresh Overview">
                <IconButton onClick={fetchOverviewData} disabled={loadingOverview} size="small" sx={{color: '#ccc', '&:hover': {color: 'white'}}}>
                    {loadingOverview ? <CircularProgress size={20} color="inherit"/> : <RefreshIcon />}
                </IconButton>
                        </Tooltip>
                    </Box>
        {overviewError && <Typography color="error" sx={{fontSize:'0.8rem', mb:1}}>Error: {overviewError}</Typography>}
        {walletInfo && balances ? (
          <Grid container spacing={1.5}>
            <InfoItem label="Total Balance (Confirmed)" value={walletInfo?.balance} />
            <InfoItem label="Unconfirmed Balance" value={walletInfo?.unconfirmed_balance} />
            <InfoItem label="Shielded Balance (Private)" value={balances.zTotal?.private} />
            <InfoItem label="Shielded Balance (Total)" value={balances.zTotal?.total} />
            <InfoItem label="Immature Balance" value={walletInfo?.immature_balance} />
            <InfoItem label="Eligible for Staking" value={walletInfo?.eligible_for_staking_balance} />
            <InfoItem label="Other Confirmed Balances (Reserve)" value={walletInfo?.reserve_balance} isObjectNested={false} xs={12} sm={6} md={8} lg={6}/>
            <InfoItem label="Wallet Version" value={walletInfo?.walletversion} xs={6} sm={3} md={2} lg={1.5}/>
            <InfoItem label="Tx Count" value={walletInfo?.txcount} xs={6} sm={3} md={2} lg={1.5}/>
            <InfoItem label="Keypool Oldest" value={walletInfo?.keypoololdest ? new Date(walletInfo.keypoololdest * 1000).toLocaleString() : 'N/A'} xs={12} sm={6} md={4} lg={3}/>
            <InfoItem label="Keypool Size" value={walletInfo?.keypoolsize} xs={6} sm={3} md={2} lg={1.5}/>
            <InfoItem label="Unlocked Until" value={walletInfo?.unlocked_until ? (walletInfo.unlocked_until === 0 ? 'Unlocked' : new Date(walletInfo.unlocked_until * 1000).toLocaleTimeString()) : 'Locked / N/A'} xs={6} sm={3} md={2} lg={1.5}/>
            <InfoItem label="Pay Tx Fee (VRSCTEST)" value={walletInfo?.paytxfee} xs={12} sm={6} md={4} lg={3}/>
            {walletInfo?.seedfp && <InfoItem label="Seed Fingerprint" value={walletInfo.seedfp} xs={12} sm={12} md={12} lg={12}/>}
        </Grid>
        ) : ( !loadingOverview && <Typography sx={{color:'#888', fontSize:'0.8rem'}}>No overview data available. Try refreshing.</Typography> )}
      </Paper>

      {/* Tabs for Operations */}
      <Paper elevation={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#232323', overflow: 'hidden' }}>
        <Tabs value={selectedOpTab} onChange={handleOpTabChange} aria-label="Wallet Operations Tabs" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#2a2a2a', '& .MuiTab-root': { color: '#ccc', fontSize: '0.8rem', minWidth: 'auto', px:1.5, py:0.5, height: 40, minHeight:40 }, '& .MuiTab-root.Mui-selected': { color: 'white', fontWeight:'bold' }, '& .MuiTabs-indicator': { backgroundColor: '#90caf9' } }}>
          <Tab label="Key Management" id="wallet-op-tab-0" aria-controls="wallet-op-tabpanel-0" />
          <Tab label="Backup & Restore" id="wallet-op-tab-1" aria-controls="wallet-op-tabpanel-1" />
          <Tab label="Transactions" id="wallet-op-tab-2" aria-controls="wallet-op-tabpanel-2" />
          <Tab label="Sending Funds" id="wallet-op-tab-3" aria-controls="wallet-op-tabpanel-3" />
          <Tab label="Shielded Ops" id="wallet-op-tab-4" aria-controls="wallet-op-tabpanel-4" />
          <Tab label="Maintenance" id="wallet-op-tab-5" aria-controls="wallet-op-tabpanel-5" />
          <Tab label="Advanced" id="wallet-op-tab-6" aria-controls="wallet-op-tabpanel-6" />
        </Tabs>

        <TabPanel value={selectedOpTab} index={0}>
          <KeyManagementPanel isActive={selectedOpTab === 0} selectedRAddressWM={selectedRAddressWM} selectedZAddressWM={selectedZAddressWM}/>
        </TabPanel>

        <TabPanel value={selectedOpTab} index={1}>
          <BackupRestorePanel isActive={selectedOpTab === 1} />
        </TabPanel>

        <TabPanel value={selectedOpTab} index={2}>
          <TransactionsPanel isActive={selectedOpTab === 2} />
        </TabPanel>

        <TabPanel value={selectedOpTab} index={3}>
          <SendingFundsPanel isActive={selectedOpTab === 3} />
        </TabPanel>
        
        <TabPanel value={selectedOpTab} index={4}>
          <ShieldedOpsPanel isActive={selectedOpTab === 4} />
        </TabPanel>

        <TabPanel value={selectedOpTab} index={5}>
          <MaintenancePanel isActive={selectedOpTab === 5} />
        </TabPanel>
        <TabPanel value={selectedOpTab} index={6}>
          <AdvancedWalletOpsPanel isActive={selectedOpTab === 6} />
        </TabPanel>

      </Paper>
    </Box>
  );
};

export default WalletOperationsView; 