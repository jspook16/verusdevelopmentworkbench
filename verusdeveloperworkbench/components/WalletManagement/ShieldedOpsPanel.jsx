import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Select, MenuItem, InputLabel, FormControl, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Paper } from '@mui/material';
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

const ShieldedOpsPanel = ({ isActive }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const [expandedShieldedOpSection, setExpandedShieldedOpSection] = useState('listoperationids');
  
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

  const handleShieldedOpAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedShieldedOpSection(isExpanded ? panel : false);
  };

  const clearAllShieldedOpFields = () => { 
    setOpIdStatusFilter('all'); 
    setErrorOpIds(''); 
    setOpIds([]); 
    setGetStatusOpIdInput(''); 
    setGetOperationStatusResult(null); 
    setGetOperationStatusError(''); 
    setGetResultOpIdInput(''); 
    setOperationResultData(null); 
    setGetOperationResultError(''); 
  };

  useEffect(() => {
    if (!isActive) {
      clearAllShieldedOpFields();
    }
  }, [isActive]);

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

  return (
    <Box>
        <Accordion expanded={expandedShieldedOpSection === 'listoperationids'} onChange={handleShieldedOpAccordionChange('listoperationids')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>List Operation IDs</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={4}><FormControl fullWidth size="small"><InputLabel id="opid-status-filter-label" sx={{fontSize:'0.8rem', color:'#ccc'}}>Status Filter</InputLabel><Select labelId="opid-status-filter-label" value={opIdStatusFilter} label="Status Filter" onChange={(e) => setOpIdStatusFilter(e.target.value)} sx={{fontSize:'0.8rem',color:'white', '& .MuiSelect-icon':{color:'white'}, '& .MuiOutlinedInput-notchedOutline': {borderColor: '#555'}, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: '#777'}}}><MenuItem value="all" sx={{fontSize:'0.8rem'}}>All</MenuItem><MenuItem value="executing" sx={{fontSize:'0.8rem'}}>Executing</MenuItem><MenuItem value="success" sx={{fontSize:'0.8rem'}}>Success</MenuItem><MenuItem value="failed" sx={{fontSize:'0.8rem'}}>Failed</MenuItem><MenuItem value="cancelled" sx={{fontSize:'0.8rem'}}>Cancelled</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} sm={6} md={3}><Button onClick={handleListOpIds} variant="contained" disabled={loadingOpIds} fullWidth>{loadingOpIds ? <CircularProgress size={24} /> : "List Operation IDs"}</Button></Grid>
                    {errorOpIds && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{errorOpIds}</Typography></Grid>}
                    {opIds.length > 0 && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Operation IDs:</Typography><Paper sx={{ maxHeight: 200, overflow: 'auto', background: '#1e1e1e', p:1 }}><List dense disablePadding>{opIds.map((opid, index) => ( <ListItem key={index} sx={{borderBottom: '1px solid #383838', pb:0.5, mb:0.5}}><Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}><Typography sx={{fontSize:'0.8rem', color:'#eee', wordBreak:'break-all'}}>{opid}</Typography><Tooltip title="Copy OpID"><IconButton onClick={() => handleCopy(opid)} size="small" sx={{p:0, color:'#888', '&:hover':{color:'#ccc'}}}><ContentCopyIcon sx={{fontSize:'0.8rem'}}/></IconButton></Tooltip></Box></ListItem> ))}</List></Paper></Grid> )}
                        {opIds.length === 0 && !loadingOpIds && !errorOpIds && <Grid item xs={12}><Typography sx={{color:'#888', fontSize:'0.75rem'}}>No operation IDs found for this filter.</Typography></Grid>}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedShieldedOpSection === 'getoperationstatus'} onChange={handleShieldedOpAccordionChange('getoperationstatus')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Operation Status</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                    <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} md={9}>{renderTextField("Operation ID", getStatusOpIdInput, setGetStatusOpIdInput, "text", "Enter opid from z_sendmany or listoperationids.", { InputProps: { endAdornment: (<Tooltip title="Clear"><IconButton onClick={() => setGetStatusOpIdInput('')} size="small"><ClearIcon fontSize="small" sx={{color:'#aaa'}}/></IconButton></Tooltip>)}})}</Grid>
                    <Grid item xs={12} md={3}><Button onClick={handleGetOperationStatus} variant="contained" fullWidth>Get Status</Button></Grid>
                    {getOperationStatusError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getOperationStatusError}</Typography></Grid>}
                    {getOperationStatusResult && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Operation Status:</Typography>{renderJsonTextField("", JSON.stringify(getOperationStatusResult, null, 2), ()=>{}, "", {InputProps: {readOnly: true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedShieldedOpSection === 'getoperationresult'} onChange={handleShieldedOpAccordionChange('getoperationresult')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Operation Result</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                    <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} md={9}>{renderTextField("Operation ID", getResultOpIdInput, setGetResultOpIdInput, "text", "Enter opid from z_sendmany or listoperationids.", { InputProps: { endAdornment: (<Tooltip title="Clear"><IconButton onClick={() => setGetResultOpIdInput('')} size="small"><ClearIcon fontSize="small" sx={{color:'#aaa'}} /></IconButton></Tooltip>)}})}</Grid>
                    <Grid item xs={12} md={3}><Button onClick={handleGetOperationResult} variant="contained" fullWidth>Get Result</Button></Grid>
                    {getOperationResultError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getOperationResultError}</Typography></Grid>}
                    {operationResultData && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Operation Result:</Typography>{renderJsonTextField("", JSON.stringify(operationResultData, null, 2), ()=>{}, "", {InputProps: {readOnly: true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
    </Box>
  );
};

export default ShieldedOpsPanel; 