import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Checkbox, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Paper } from '@mui/material';
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

const TransactionsPanel = ({ isActive }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const [expandedTransactionsSection, setExpandedTransactionsSection] = useState('listtransactions');

  // State for listtransactions
  const [listTransactionsCount, setListTransactionsCount] = useState('10');
  const [listTransactionsFrom, setListTransactionsFrom] = useState('0');
  const [listTransactionsIncludeWatchOnly, setListTransactionsIncludeWatchOnly] = useState(false);
  const [listTransactionsResult, setListTransactionsResult] = useState([]);
  const [listTransactionsLoading, setListTransactionsLoading] = useState(false);
  const [listTransactionsError, setListTransactionsError] = useState('');

  // State for listsinceblock
  const [listSinceBlockBlockhash, setListSinceBlockBlockhash] = useState('');
  const [listSinceBlockTargetConfirmations, setListSinceBlockTargetConfirmations] = useState('1');
  const [listSinceBlockIncludeWatchOnly, setListSinceBlockIncludeWatchOnly] = useState(false);
  const [listSinceBlockResult, setListSinceBlockResult] = useState({transactions: [], lastblock: ''});
  const [listSinceBlockLoading, setListSinceBlockLoading] = useState(false);
  const [listSinceBlockError, setListSinceBlockError] = useState('');

  // State for gettransaction
  const [getTransactionTxid, setGetTransactionTxid] = useState('');
  const [getTransactionIncludeWatchOnly, setGetTransactionIncludeWatchOnly] = useState(false);
  const [getTransactionResult, setGetTransactionResult] = useState(null);
  const [getTransactionLoading, setGetTransactionLoading] = useState(false);
  const [getTransactionError, setGetTransactionError] = useState('');

  // State for z_viewtransaction
  const [zViewTransactionTxid, setZViewTransactionTxid] = useState('');
  const [zViewTransactionResult, setZViewTransactionResult] = useState(null);
  const [zViewTransactionLoading, setZViewTransactionLoading] = useState(false);
  const [zViewTransactionError, setZViewTransactionError] = useState('');

  const handleTransactionsAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedTransactionsSection(isExpanded ? panel : false);
  };

  const clearListTransactionsFields = () => { setListTransactionsCount('10'); setListTransactionsFrom('0'); setListTransactionsIncludeWatchOnly(false); setListTransactionsResult([]); setListTransactionsError(''); };
  const clearListSinceBlockFields = () => { setListSinceBlockBlockhash(''); setListSinceBlockTargetConfirmations('1'); setListSinceBlockIncludeWatchOnly(false); setListSinceBlockResult({transactions: [], lastblock: ''}); setListSinceBlockError(''); };
  const clearGetTransactionFields = () => { setGetTransactionTxid(''); setGetTransactionIncludeWatchOnly(false); setGetTransactionResult(null); setGetTransactionError(''); };
  const clearZViewTransactionFields = () => { setZViewTransactionTxid(''); setZViewTransactionResult(null); setZViewTransactionError(''); };
  
  const clearAllTransactionFields = () => { 
    clearListTransactionsFields();
    clearListSinceBlockFields();
    clearGetTransactionFields();
    clearZViewTransactionFields();
  }; 

  useEffect(() => {
    if (!isActive) {
      clearAllTransactionFields();
    }
  }, [isActive]);

  const handleListTransactions = async () => {
    setListTransactionsLoading(true); setListTransactionsError('');
    const cmd = 'listtransactions';
    const params = [ '*', parseInt(listTransactionsCount) || 10, parseInt(listTransactionsFrom) || 0, listTransactionsIncludeWatchOnly ];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setListTransactionsResult(result.reverse()); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) { console.error(`Error in ${cmd}:`, err); setListTransactionsError(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setListTransactionsLoading(false); }
  };

  const handleListSinceBlock = async () => {
    setListSinceBlockLoading(true); setListSinceBlockError('');
    const cmd = 'listsinceblock';
    const params = [];
    if (listSinceBlockBlockhash.trim()) params.push(listSinceBlockBlockhash.trim());
    if (listSinceBlockTargetConfirmations.trim()) params.push(parseInt(listSinceBlockTargetConfirmations) || 1);
    else if (listSinceBlockBlockhash.trim()) params.push(1);
    if (listSinceBlockIncludeWatchOnly) { if (params.length === 0) params.push(""); if (params.length === 1 && typeof params[0] === 'string') params.push(1); params.push(listSinceBlockIncludeWatchOnly); }
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setListSinceBlockResult(result); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) { console.error(`Error in ${cmd}:`, err); setListSinceBlockError(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setListSinceBlockLoading(false); }
  };

  const handleGetTransaction = async () => {
    if (!getTransactionTxid.trim()) { setGetTransactionError('Transaction ID (txid) is required.'); return; }
    setGetTransactionLoading(true); setGetTransactionError('');
    const cmd = 'gettransaction';
    const params = [ getTransactionTxid.trim(), getTransactionIncludeWatchOnly ];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setGetTransactionResult(result); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) { console.error(`Error in ${cmd}:`, err); setGetTransactionError(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setGetTransactionLoading(false); }
  };

  const handleZViewTransaction = async () => {
    if(!zViewTransactionTxid.trim()) { setZViewTransactionError('Transaction ID (txid) is required.'); return; }
    setZViewTransactionLoading(true); setZViewTransactionError(''); setZViewTransactionResult(null);
    const cmd = 'z_viewtransaction';
    const params = [zViewTransactionTxid.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try { const result = await sendCommand(cmd, params); setZViewTransactionResult(result); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch(err) { console.error(`Error in ${cmd}:`, err); setZViewTransactionError(err.message || `Failed to ${cmd}.`); if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setZViewTransactionLoading(false); }
  };

  return (
    <Box>
        <Accordion expanded={expandedTransactionsSection === 'listtransactions'} onChange={handleTransactionsAccordionChange('listtransactions')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>List Transactions</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={6} sm={3}>{renderTextField("Count", listTransactionsCount, setListTransactionsCount, "number", "Number of transactions.")}</Grid>
                    <Grid item xs={6} sm={3}>{renderTextField("From", listTransactionsFrom, setListTransactionsFrom, "number", "Skip this many transactions.")}</Grid>
                    <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center'}}><FormControlLabel control={<Checkbox checked={listTransactionsIncludeWatchOnly} onChange={(e) => setListTransactionsIncludeWatchOnly(e.target.checked)} sx={{color:'#aaa'}}/>} label="Include Watch-Only" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/></Grid>
                    <Grid item xs={12} sm={3}><Button onClick={handleListTransactions} variant="contained" disabled={listTransactionsLoading} fullWidth>{listTransactionsLoading ? <CircularProgress size={24} /> : "List Transactions"}</Button></Grid>
                    {listTransactionsError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{listTransactionsError}</Typography></Grid>}
                    {listTransactionsResult.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Transactions:</Typography>
                            <Paper sx={{ maxHeight: 300, overflow: 'auto', background: '#1e1e1e', p:1 }}>
                                <List dense disablePadding>
                                    {listTransactionsResult.map((tx, index) => (
                                        <ListItem key={index} divider sx={{ display: 'block', py:0.5, mb:0.5, borderBottomColor: '#383838'}}>
                                            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                <Typography sx={{fontSize:'0.75rem', color:'#eee', fontWeight:'500'}}>{tx.category} ({tx.address || 'N/A'})</Typography>
                                                <Typography sx={{fontSize:'0.75rem', color: tx.amount > 0 ? '#4caf50' : '#f44336'}}>{tx.amount.toFixed(8)}</Typography>
                                            </Box>
                                            <Typography sx={{fontSize:'0.7rem', color:'#bbb'}}>TXID: {tx.txid} <Tooltip title="Copy TXID"><IconButton onClick={() => handleCopy(tx.txid)} size="small" sx={{p:0, color:'#888', '&:hover':{color:'#ccc'}}}><ContentCopyIcon sx={{fontSize:'0.8rem'}}/></IconButton></Tooltip></Typography>
                                            <Typography sx={{fontSize:'0.7rem', color:'#aaa'}}>Conf: {tx.confirmations} | Time: {new Date(tx.time*1000).toLocaleString()}</Typography>
                                            {tx.comment && <Typography sx={{fontSize:'0.7rem', color:'#aaa'}}>Comment: {tx.comment}</Typography>}
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedTransactionsSection === 'listsinceblock'} onChange={handleTransactionsAccordionChange('listsinceblock')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>List Since Block</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={4}>{renderTextField("Block Hash (Optional)", listSinceBlockBlockhash, setListSinceBlockBlockhash)}</Grid>
                    <Grid item xs={6} sm={3} md={3}>{renderTextField("Target Confirmations", listSinceBlockTargetConfirmations, setListSinceBlockTargetConfirmations, "number")}</Grid>
                    <Grid item xs={6} sm={3} md={2} sx={{ display: 'flex', alignItems: 'center'}}><FormControlLabel control={<Checkbox checked={listSinceBlockIncludeWatchOnly} onChange={(e) => setListSinceBlockIncludeWatchOnly(e.target.checked)} sx={{color:'#aaa'}}/>} label="Watch-Only" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/></Grid>
                    <Grid item xs={12} sm={12} md={3}><Button onClick={handleListSinceBlock} variant="contained" disabled={listSinceBlockLoading} fullWidth>{listSinceBlockLoading ? <CircularProgress size={24} /> : "List Since Block"}</Button></Grid>
                    {listSinceBlockError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{listSinceBlockError}</Typography></Grid>}
                    {listSinceBlockResult.lastblock && (
                        <Grid item xs={12}>
                            <Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Last Block: {listSinceBlockResult.lastblock}</Typography>
                            <Typography variant="caption" display="block" sx={{color:'#aaa', mt:0.5}}>Transactions Since:</Typography>
                            <Paper sx={{ maxHeight: 300, overflow: 'auto', background: '#1e1e1e', p:1 }}>
                                {listSinceBlockResult.transactions && listSinceBlockResult.transactions.length > 0 ? (
                                    <List dense disablePadding>
                                        {listSinceBlockResult.transactions.map((tx, index) => (
                                            <ListItem key={index} divider sx={{ display: 'block', py:0.5, mb:0.5, borderBottomColor: '#383838'}}>
                                                <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                    <Typography sx={{fontSize:'0.75rem', color:'#eee', fontWeight:'500'}}>{tx.category} ({tx.address || 'N/A'})</Typography>
                                                    <Typography sx={{fontSize:'0.75rem', color: tx.amount > 0 ? '#4caf50' : '#f44336'}}>{tx.amount.toFixed(8)}</Typography>
                                                </Box>
                                                <Typography sx={{fontSize:'0.7rem', color:'#bbb'}}>TXID: {tx.txid} <Tooltip title="Copy TXID"><IconButton onClick={() => handleCopy(tx.txid)} size="small" sx={{p:0, color:'#888', '&:hover':{color:'#ccc'}}}><ContentCopyIcon sx={{fontSize:'0.8rem'}}/></IconButton></Tooltip></Typography>
                                                <Typography sx={{fontSize:'0.7rem', color:'#aaa'}}>Conf: {tx.confirmations} | Time: {new Date(tx.time*1000).toLocaleString()}</Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : ( <Typography sx={{color:'#888', fontSize:'0.75rem', p:1}}>No transactions found since specified block.</Typography> )}
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedTransactionsSection === 'gettransaction'} onChange={handleTransactionsAccordionChange('gettransaction')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Transaction</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={7} md={8}>{renderTextField("Transaction ID (txid)", getTransactionTxid, setGetTransactionTxid)}</Grid>
                    <Grid item xs={6} sm={2} md={1} sx={{ display: 'flex', alignItems: 'center'}}><FormControlLabel control={<Checkbox checked={getTransactionIncludeWatchOnly} onChange={(e) => setGetTransactionIncludeWatchOnly(e.target.checked)} sx={{color:'#aaa'}}/>} label="Watch-Only" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/></Grid>
                    <Grid item xs={6} sm={3} md={3}><Button onClick={handleGetTransaction} variant="contained" disabled={getTransactionLoading} fullWidth>{getTransactionLoading ? <CircularProgress size={24} /> : "Get Transaction"}</Button></Grid>
                    {getTransactionError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getTransactionError}</Typography></Grid>}
                    {getTransactionResult && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Transaction Details:</Typography>{renderJsonTextField("", JSON.stringify(getTransactionResult, null, 2), ()=>{}, "", {InputProps: {readOnly: true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedTransactionsSection === 'z_viewtransaction'} onChange={handleTransactionsAccordionChange('z_viewtransaction')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>View Shielded Transaction (z_viewtransaction)</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} md={9}>{renderTextField("Transaction ID (txid)", zViewTransactionTxid, setZViewTransactionTxid)}</Grid>
                    <Grid item xs={12} md={3}><Button onClick={handleZViewTransaction} variant="contained" disabled={zViewTransactionLoading} fullWidth>{zViewTransactionLoading ? <CircularProgress size={24} /> : "View Transaction"}</Button></Grid>
                    {zViewTransactionError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zViewTransactionError}</Typography></Grid>}
                    {zViewTransactionResult && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa', mt:1}}>Shielded Transaction Details:</Typography>{renderJsonTextField("", JSON.stringify(zViewTransactionResult, null, 2), ()=>{}, "", {InputProps: {readOnly: true, sx:{backgroundColor:'#1e1e1e'}}})}</Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
    </Box>
  );
};

export default TransactionsPanel; 