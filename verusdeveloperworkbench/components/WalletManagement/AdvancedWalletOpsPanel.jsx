import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Accordion, AccordionSummary, AccordionDetails, Paper } from '@mui/material';
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

const handleCopy = (textToCopy) => {
    if (textToCopy === undefined || textToCopy === null) return;
    navigator.clipboard.writeText(String(textToCopy));
};

const AdvancedWalletOpsPanel = ({ isActive }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const [expandedAdvancedSection, setExpandedAdvancedSection] = useState('setaccount'); // Default to first command

  // State for setaccount
  const [setAccountAddress, setSetAccountAddress] = useState('');
  const [setAccountAccount, setSetAccountAccount] = useState('""'); // As per docs, MUST be ""
  const [setAccountLoading, setSetAccountLoading] = useState(false);
  const [setAccountError, setSetAccountError] = useState('');
  const [setAccountSuccess, setSetAccountSuccess] = useState('');

  // State for getaccount
  const [getAccountAddress, setGetAccountAddress] = useState('');
  const [getAccountResult, setGetAccountResult] = useState('');
  const [getAccountLoading, setGetAccountLoading] = useState(false);
  const [getAccountError, setGetAccountError] = useState('');

  // State for getaddressesbyaccount
  const [getAddressesByAccountAccount, setGetAddressesByAccountAccount] = useState('""'); // As per docs, MUST be ""
  const [getAddressesByAccountResult, setGetAddressesByAccountResult] = useState(null);
  const [getAddressesByAccountLoading, setGetAddressesByAccountLoading] = useState(false);
  const [getAddressesByAccountError, setGetAddressesByAccountError] = useState('');

  // State for getaccountaddress
  const [getAccountAddressAccount, setGetAccountAddressAccount] = useState('""'); // As per docs, MUST be ""
  const [getAccountAddressResult, setGetAccountAddressResult] = useState('');
  const [getAccountAddressLoading, setGetAccountAddressLoading] = useState(false);
  const [getAccountAddressError, setGetAccountAddressError] = useState('');

  const handleAdvancedAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAdvancedSection(isExpanded ? panel : false);
  };

  const clearSetAccountFields = () => { setSetAccountAddress(''); setSetAccountAccount('""'); setSetAccountError(''); setSetAccountSuccess(''); };
  const clearGetAccountFields = () => { setGetAccountAddress(''); setGetAccountResult(''); setGetAccountError(''); };
  const clearGetAddressesByAccountFields = () => { setGetAddressesByAccountAccount('""'); setGetAddressesByAccountResult(null); setGetAddressesByAccountError(''); };
  const clearGetAccountAddressFields = () => { setGetAccountAddressAccount('""'); setGetAccountAddressResult(''); setGetAccountAddressError(''); };

  const clearAllAdvancedFields = () => {
    clearSetAccountFields();
    clearGetAccountFields();
    clearGetAddressesByAccountFields();
    clearGetAccountAddressFields();
  };

  useEffect(() => {
    if (!isActive) {
      clearAllAdvancedFields();
    }
  }, [isActive]);

  // --- Handlers ---
  const handleSetAccount = async () => {
    if (!setAccountAddress.trim()) { setSetAccountError('Address is required.'); return; }
    // As per docs, account field MUST be ""
    if (setAccountAccount.trim() !== '' && setAccountAccount.trim() !== '""') { 
        setSetAccountError('Account MUST be an empty string "".'); 
        return; 
    }
    setSetAccountLoading(true); setSetAccountError(''); setSetAccountSuccess('');
    const cmd = 'setaccount';
    const params = [setAccountAddress.trim(), setAccountAccount.trim() === '""' ? '' : setAccountAccount.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_action'});
    try {
      await sendCommand(cmd, params);
      setSetAccountSuccess('Account set successfully.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet_action'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setSetAccountError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_action'});
    } finally { setSetAccountLoading(false); }
  };

  const handleGetAccount = async () => {
    if (!getAccountAddress.trim()) { setGetAccountError('Address is required.'); return; }
    setGetAccountLoading(true); setGetAccountError(''); setGetAccountResult('');
    const cmd = 'getaccount';
    const params = [getAccountAddress.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_query'});
    try {
      const result = await sendCommand(cmd, params);
      setGetAccountResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_query'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetAccountError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_query'});
    } finally { setGetAccountLoading(false); }
  };

  const handleGetAddressesByAccount = async () => {
    // As per docs, account field MUST be ""
     if (getAddressesByAccountAccount.trim() !== '' && getAddressesByAccountAccount.trim() !== '""') { 
        setGetAddressesByAccountError('Account MUST be an empty string "".'); 
        return; 
    }
    setGetAddressesByAccountLoading(true); setGetAddressesByAccountError(''); setGetAddressesByAccountResult(null);
    const cmd = 'getaddressesbyaccount';
    const params = [getAddressesByAccountAccount.trim() === '""' ? '' : getAddressesByAccountAccount.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_query'});
    try {
      const result = await sendCommand(cmd, params);
      setGetAddressesByAccountResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_query'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetAddressesByAccountError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_query'});
    } finally { setGetAddressesByAccountLoading(false); }
  };

  const handleGetAccountAddress = async () => {
    // As per docs, account field MUST be ""
    if (getAccountAddressAccount.trim() !== '' && getAccountAddressAccount.trim() !== '""') { 
        setGetAccountAddressError('Account MUST be an empty string "".'); 
        return; 
    }
    setGetAccountAddressLoading(true); setGetAccountAddressError(''); setGetAccountAddressResult('');
    const cmd = 'getaccountaddress';
    const params = [getAccountAddressAccount.trim() === '""' ? '' : getAccountAddressAccount.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_query'});
    try {
      const result = await sendCommand(cmd, params);
      setGetAccountAddressResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_query'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetAccountAddressError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet_query'});
    } finally { setGetAccountAddressLoading(false); }
  };

  return (
    <Box>
      {/* setaccount */}
      <Accordion expanded={expandedAdvancedSection === 'setaccount'} onChange={handleAdvancedAccordionChange('setaccount')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Set Account (Deprecated)</Typography> </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={6}>{renderTextField("Verus Address", setAccountAddress, setSetAccountAddress)}</Grid>
            <Grid item xs={12} md={3}>{renderTextField("Account Label", setAccountAccount, setSetAccountAccount, "text", 'MUST be "" (empty string).')}</Grid>
            <Grid item xs={12} md={3} sx={{display:'flex', alignItems:'center', height:'100%'}}><Button onClick={handleSetAccount} variant="contained" disabled={setAccountLoading} fullWidth sx={{height:40}}>{setAccountLoading ? <CircularProgress size={24}/> : "Set Account"}</Button></Grid>
            {setAccountError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{setAccountError}</Typography></Grid>}
            {setAccountSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{setAccountSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* getaccount */}
      <Accordion expanded={expandedAdvancedSection === 'getaccount'} onChange={handleAdvancedAccordionChange('getaccount')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Account (Deprecated)</Typography> </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={9}>{renderTextField("Verus Address", getAccountAddress, setGetAccountAddress)}</Grid>
            <Grid item xs={12} md={3} sx={{display:'flex', alignItems:'center', height:'100%'}}><Button onClick={handleGetAccount} variant="contained" disabled={getAccountLoading} fullWidth sx={{height:40}}>{getAccountLoading ? <CircularProgress size={24}/> : "Get Account"}</Button></Grid>
            {getAccountError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getAccountError}</Typography></Grid>}
            {getAccountResult && <Grid item xs={12}>{renderTextField("Account Result", getAccountResult, ()=>{}, "text", "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* getaddressesbyaccount */}
      <Accordion expanded={expandedAdvancedSection === 'getaddressesbyaccount'} onChange={handleAdvancedAccordionChange('getaddressesbyaccount')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Addresses By Account (Deprecated)</Typography> </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={9}>{renderTextField("Account Label", getAddressesByAccountAccount, setGetAddressesByAccountAccount, "text", 'MUST be "" (empty string).')}</Grid>
            <Grid item xs={12} md={3} sx={{display:'flex', alignItems:'center', height:'100%'}}><Button onClick={handleGetAddressesByAccount} variant="contained" disabled={getAddressesByAccountLoading} fullWidth sx={{height:40}}>{getAddressesByAccountLoading ? <CircularProgress size={24}/> : "Get Addresses"}</Button></Grid>
            {getAddressesByAccountError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getAddressesByAccountError}</Typography></Grid>}
            {getAddressesByAccountResult && <Grid item xs={12}>{renderJsonTextField("Addresses Result", JSON.stringify(getAddressesByAccountResult, null, 2), ()=>{}, "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* getaccountaddress */}
      <Accordion expanded={expandedAdvancedSection === 'getaccountaddress'} onChange={handleAdvancedAccordionChange('getaccountaddress')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Account Address (Deprecated)</Typography> </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={9}>{renderTextField("Account Label", getAccountAddressAccount, setGetAccountAddressAccount, "text", 'MUST be "" (empty string).')}</Grid>
            <Grid item xs={12} md={3} sx={{display:'flex', alignItems:'center', height:'100%'}}><Button onClick={handleGetAccountAddress} variant="contained" disabled={getAccountAddressLoading} fullWidth sx={{height:40}}>{getAccountAddressLoading ? <CircularProgress size={24}/> : "Get Address"}</Button></Grid>
            {getAccountAddressError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getAccountAddressError}</Typography></Grid>}
            {getAccountAddressResult && <Grid item xs={12}>{renderTextField("Address Result", getAccountAddressResult, ()=>{}, "text", "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

    </Box>
  );
};

export default AdvancedWalletOpsPanel; 