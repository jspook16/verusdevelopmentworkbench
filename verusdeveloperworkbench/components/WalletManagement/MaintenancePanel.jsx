import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Accordion, AccordionSummary, AccordionDetails, Paper, FormControlLabel, Checkbox, Divider } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NodeContext } from '../../contexts/NodeContext';
import { TerminalContext } from '../../contexts/TerminalContext';

// Helper rendering functions - consider moving to a shared utils file
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

const MaintenancePanel = ({ isActive }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const [expandedMaintenanceSection, setExpandedMaintenanceSection] = useState('keypoolrefill');

  // State for keypoolrefill
  const [keypoolRefillSize, setKeypoolRefillSize] = useState('100');
  const [keypoolRefillLoading, setKeypoolRefillLoading] = useState(false);
  const [keypoolRefillError, setKeypoolRefillError] = useState('');
  const [keypoolRefillSuccess, setKeypoolRefillSuccess] = useState('');

  // State for rescanfromheight
  const [rescanHeight, setRescanHeight] = useState('0'); // Default to 0 for full rescan
  const [rescanLoading, setRescanLoading] = useState(false);
  const [rescanError, setRescanError] = useState('');
  const [rescanSuccess, setRescanSuccess] = useState('');

  // State for prunespentwallettransactions
  const [pruneTxidToKeep, setPruneTxidToKeep] = useState('');
  const [pruneLoading, setPruneLoading] = useState(false);
  const [pruneError, setPruneError] = useState('');
  const [pruneResult, setPruneResult] = useState(null);

  // State for z_setmigration
  const [migrationEnabled, setMigrationEnabled] = useState(false);
  const [setMigrationLoading, setSetMigrationLoading] = useState(false);
  const [setMigrationError, setSetMigrationError] = useState('');
  const [setMigrationSuccess, setSetMigrationSuccess] = useState('');

  // State for z_getmigrationstatus
  const [migrationStatusResult, setMigrationStatusResult] = useState(null);
  const [getMigrationStatusLoading, setGetMigrationStatusLoading] = useState(false);
  const [getMigrationStatusError, setGetMigrationStatusError] = useState('');

  // State for listlockunspent
  const [listLockUnspentResult, setListLockUnspentResult] = useState(null);
  const [listLockUnspentLoading, setListLockUnspentLoading] = useState(false);
  const [listLockUnspentError, setListLockUnspentError] = useState('');

  // State for lockunspent
  const [lockUnspentUnlock, setLockUnspentUnlock] = useState(false); // false to lock, true to unlock
  const [lockUnspentTransactions, setLockUnspentTransactions] = useState('[{"txid":"", "vout":0}]');
  const [lockUnspentLoading, setLockUnspentLoading] = useState(false);
  const [lockUnspentError, setLockUnspentError] = useState('');
  const [lockUnspentSuccess, setLockUnspentSuccess] = useState('');

  // Add states for other maintenance commands here later...

  const handleMaintenanceAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedMaintenanceSection(isExpanded ? panel : false);
  };

  const clearKeypoolRefillFields = () => {
    setKeypoolRefillSize('100');
    setKeypoolRefillError('');
    setKeypoolRefillSuccess('');
  };

  const clearRescanFromHeightFields = () => {
    setRescanHeight('0');
    setRescanError('');
    setRescanSuccess('');
  };

  const clearPruneSpentWalletTransactionsFields = () => {
    setPruneTxidToKeep('');
    setPruneError('');
    setPruneResult(null);
  };

  const clearSetMigrationFields = () => {
    // migrationEnabled can retain its last set state or be reset, user preference
    setSetMigrationError('');
    setSetMigrationSuccess('');
  };

  const clearGetMigrationStatusFields = () => {
    setMigrationStatusResult(null);
    setGetMigrationStatusError('');
  };

  const clearListLockUnspentFields = () => {
    setListLockUnspentResult(null);
    setListLockUnspentError('');
  };

  const clearLockUnspentFields = () => {
    setLockUnspentUnlock(false);
    setLockUnspentTransactions('[{"txid":"", "vout":0}]');
    setLockUnspentError('');
    setLockUnspentSuccess('');
  };

  // Define clear functions for other commands here later...

  const clearAllMaintenanceFields = () => {
    clearKeypoolRefillFields();
    clearRescanFromHeightFields();
    clearPruneSpentWalletTransactionsFields();
    clearSetMigrationFields();
    clearGetMigrationStatusFields();
    clearListLockUnspentFields();
    clearLockUnspentFields();
    // Call other clear functions here...
  };

  useEffect(() => {
    if (!isActive) {
      clearAllMaintenanceFields();
    }
  }, [isActive]);

  const handleKeypoolRefill = async () => {
    setKeypoolRefillLoading(true);
    setKeypoolRefillError('');
    setKeypoolRefillSuccess('');
    const cmd = 'keypoolrefill';
    const params = keypoolRefillSize.trim() ? [parseInt(keypoolRefillSize.trim())] : [];
    
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params); // keypoolrefill usually returns null or an error
      setKeypoolRefillSuccess('Keypool refill command sent successfully.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setKeypoolRefillError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setKeypoolRefillLoading(false);
    }
  };

  const handleRescanFromHeight = async () => {
    setRescanLoading(true);
    setRescanError('');
    setRescanSuccess('');
    const cmd = 'rescanfromheight';
    // rescanfromheight takes an optional height, if not provided or empty, daemon defaults to 0
    const params = rescanHeight.trim() && !isNaN(parseInt(rescanHeight.trim())) ? [parseInt(rescanHeight.trim())] : [];

    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_long_action'});
    try {
      // This command can take a long time and may not return a direct success message immediately through RPC in the same way.
      // The primary indication of start is no error. Success is that the daemon begins the process.
      await sendCommand(cmd, params);
      setRescanSuccess(`Rescan from height ${params.length > 0 ? params[0] : 0} initiated. This may take a long time. Monitor daemon logs.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Rescan initiated', status: 'success', type: 'wallet_long_action'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setRescanError(err.message || `Failed to initiate ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to initiate ${cmd}.`, status: 'error', type: 'wallet_long_action'});
    } finally {
      setRescanLoading(false);
    }
  };

  const handlePruneSpentWalletTransactions = async () => {
    setPruneLoading(true);
    setPruneError('');
    setPruneResult(null);
    const cmd = 'prunespentwallettransactions';
    const params = pruneTxidToKeep.trim() ? [pruneTxidToKeep.trim()] : [];

    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_action'});
    try {
      const result = await sendCommand(cmd, params);
      setPruneResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_action'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setPruneError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_action'});
    } finally {
      setPruneLoading(false);
    }
  };

  const handleSetMigration = async () => {
    setSetMigrationLoading(true);
    setSetMigrationError('');
    setSetMigrationSuccess('');
    const cmd = 'z_setmigration';
    const params = [migrationEnabled];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_config'});
    try {
      await sendCommand(cmd, params);
      setSetMigrationSuccess(`Sprout to Sapling migration ${migrationEnabled ? 'enabled' : 'disabled'} successfully.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet_config'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setSetMigrationError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_config'});
    } finally {
      setSetMigrationLoading(false);
    }
  };

  const handleGetMigrationStatus = async () => {
    setGetMigrationStatusLoading(true);
    setGetMigrationStatusError('');
    setMigrationStatusResult(null);
    const cmd = 'z_getmigrationstatus';
    const params = [];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_query'});
    try {
      const result = await sendCommand(cmd, params);
      setMigrationStatusResult(result);
      // Update the switch based on fetched status if desired, e.g., setMigrationEnabled(result.enabled);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_query'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetMigrationStatusError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_query'});
    } finally {
      setGetMigrationStatusLoading(false);
    }
  };

  const handleListLockUnspent = async () => {
    setListLockUnspentLoading(true);
    setListLockUnspentError('');
    setListLockUnspentResult(null);
    const cmd = 'listlockunspent';
    const params = [];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_query'});
    try {
      const result = await sendCommand(cmd, params);
      setListLockUnspentResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_query'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setListLockUnspentError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_query'});
    } finally {
      setListLockUnspentLoading(false);
    }
  };

  const handleLockUnspent = async () => {
    setLockUnspentLoading(true);
    setLockUnspentError('');
    setLockUnspentSuccess('');
    const cmd = 'lockunspent';
    let parsedTransactions;
    try {
      parsedTransactions = JSON.parse(lockUnspentTransactions);
      if (!Array.isArray(parsedTransactions) || !parsedTransactions.every(tx => typeof tx === 'object' && tx !== null && 'txid' in tx && 'vout' in tx)) {
        throw new Error('Transactions JSON must be an array of objects with "txid" and "vout" properties.');
      }
    } catch (e) {
      setLockUnspentError('Invalid JSON for transactions: ' + e.message);
      setLockUnspentLoading(false);
      return;
    }

    const params = [lockUnspentUnlock, parsedTransactions];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_action'});
    try {
      const result = await sendCommand(cmd, params);
      if (result === true) {
        setLockUnspentSuccess(`Successfully ${lockUnspentUnlock ? 'unlocked' : 'locked'} specified UTXOs.`);
      } else {
        setLockUnspentError('Operation may not have succeeded. Expected true, received: ' + JSON.stringify(result));
      }
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_action'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setLockUnspentError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_action'});
    } finally {
      setLockUnspentLoading(false);
    }
  };

  // Define handlers for other maintenance commands here later...

  return (
    <Box>
      {/* keypoolrefill */}
      <Accordion expanded={expandedMaintenanceSection === 'keypoolrefill'} onChange={handleMaintenanceAccordionChange('keypoolrefill')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Keypool Refill</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              {renderTextField("New Keypool Size (Optional)", keypoolRefillSize, setKeypoolRefillSize, "number", "Default is 100.")}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button onClick={handleKeypoolRefill} variant="contained" disabled={keypoolRefillLoading} fullWidth sx={{height: 40}}>
                {keypoolRefillLoading ? <CircularProgress size={24} /> : "Refill Keypool"}
              </Button>
            </Grid>
            {keypoolRefillError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{keypoolRefillError}</Typography></Grid>}
            {keypoolRefillSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{keypoolRefillSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* rescanfromheight */}
      <Accordion expanded={expandedMaintenanceSection === 'rescanfromheight'} onChange={handleMaintenanceAccordionChange('rescanfromheight')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Rescan Wallet From Height</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              {renderTextField("Start Height (Optional)", rescanHeight, setRescanHeight, "number", "Default is 0 (full rescan). This can take a VERY long time.")}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button onClick={handleRescanFromHeight} variant="contained" color="warning" disabled={rescanLoading} fullWidth sx={{height: 40}}>
                {rescanLoading ? <CircularProgress size={24} /> : "Start Rescan"}
              </Button>
            </Grid>
            {rescanError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{rescanError}</Typography></Grid>}
            {rescanSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{rescanSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* prunespentwallettransactions */}
      <Accordion expanded={expandedMaintenanceSection === 'prunespentwallettransactions'} onChange={handleMaintenanceAccordionChange('prunespentwallettransactions')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Prune Spent Wallet Transactions</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              {renderTextField("Transaction ID to Keep (Optional)", pruneTxidToKeep, setPruneTxidToKeep, "text", "If provided, this specific transaction will not be pruned.")}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button onClick={handlePruneSpentWalletTransactions} variant="contained" color="warning" disabled={pruneLoading} fullWidth sx={{height: 40}}>
                {pruneLoading ? <CircularProgress size={24} /> : "Prune Transactions"}
              </Button>
            </Grid>
            {pruneError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{pruneError}</Typography></Grid>}
            {pruneResult && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Prune Result:</Typography>
                <Paper sx={{p:1, background:'#1e1e1e', borderRadius:1}}>
                  <Typography sx={{fontSize:'0.8rem', color:'#ddd'}}>Total Transactions: {pruneResult.total_transactions}</Typography>
                  <Typography sx={{fontSize:'0.8rem', color:'#ddd'}}>Remaining Transactions: {pruneResult.remaining_transactions}</Typography>
                  <Typography sx={{fontSize:'0.8rem', color:'#ddd'}}>Removed Transactions: {pruneResult.removed_transactions}</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Sprout to Sapling Migration */}
      <Accordion expanded={expandedMaintenanceSection === 'migration'} onChange={handleMaintenanceAccordionChange('migration')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Sprout to Sapling Migration</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <FormControlLabel 
                control={<Checkbox checked={migrationEnabled} onChange={(e) => setMigrationEnabled(e.target.checked)} sx={{color:'#aaa'}}/>}
                label="Enable Automatic Migration" 
                sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button onClick={handleSetMigration} variant="contained" disabled={setMigrationLoading} fullWidth>
                {setMigrationLoading ? <CircularProgress size={24}/> : "Set Migration" }
              </Button>
            </Grid>
            {setMigrationError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{setMigrationError}</Typography></Grid>}
            {setMigrationSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{setMigrationSuccess}</Typography></Grid>}
            
            <Grid item xs={12}><Divider sx={{my:1, bgcolor: '#444'}}/></Grid>

            <Grid item xs={12} md={12} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button onClick={handleGetMigrationStatus} variant="outlined" disabled={getMigrationStatusLoading} fullWidth>
                {getMigrationStatusLoading ? <CircularProgress size={24} /> : "Get Migration Status"}
              </Button>
            </Grid>
            {getMigrationStatusError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getMigrationStatusError}</Typography></Grid>}
            {migrationStatusResult && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Migration Status:</Typography>
                {renderTextField("", JSON.stringify(migrationStatusResult, null, 2), () => {}, "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})}
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Lock/Unlock UTXOs */}
      <Accordion expanded={expandedMaintenanceSection === 'lockunspent'} onChange={handleMaintenanceAccordionChange('lockunspent')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Lock/Unlock Transaction Outputs</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Button onClick={handleListLockUnspent} variant="outlined" disabled={listLockUnspentLoading} fullWidth>
                {listLockUnspentLoading ? <CircularProgress size={24}/> : "List Locked UTXOs"}
              </Button>
            </Grid>
            {listLockUnspentError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{listLockUnspentError}</Typography></Grid>}
            {listLockUnspentResult && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Currently Locked UTXOs:</Typography>
                {listLockUnspentResult.length > 0 ? (
                  renderTextField("", JSON.stringify(listLockUnspentResult, null, 2), () => {}, "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})
                ) : (
                  <Typography sx={{fontSize:'0.8rem', color:'#888', p:1, background:'#1e1e1e', borderRadius:1}}>None</Typography>
                )}
              </Grid>
            )}

            <Grid item xs={12}><Divider sx={{my:1, bgcolor: '#444'}}/></Grid>
            
            <Grid item xs={12} sm={4}>
                <FormControlLabel 
                    control={<Checkbox checked={lockUnspentUnlock} onChange={(e) => setLockUnspentUnlock(e.target.checked)} sx={{color:'#aaa'}}/>}
                    label="Unlock UTXOs" 
                    sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}
                />
            </Grid>
            <Grid item xs={12} sm={8}>
                {renderTextField("Transactions (JSON Array)", lockUnspentTransactions, setLockUnspentTransactions, 'Format: [{\"txid\":\"id\",\"vout\":n},...]')}
            </Grid>
            <Grid item xs={12}>
                <Button onClick={handleLockUnspent} variant="contained" color={lockUnspentUnlock ? "success" : "warning"} disabled={lockUnspentLoading} fullWidth>
                    {lockUnspentLoading ? <CircularProgress size={24}/> : (lockUnspentUnlock ? "Unlock Specified UTXOs" : "Lock Specified UTXOs")}
                </Button>
            </Grid>
            {lockUnspentError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{lockUnspentError}</Typography></Grid>}
            {lockUnspentSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{lockUnspentSuccess}</Typography></Grid>}

          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Add other maintenance command Accordions here */}

    </Box>
  );
};

export default MaintenancePanel; 