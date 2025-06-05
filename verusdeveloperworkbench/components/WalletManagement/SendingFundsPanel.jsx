import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Checkbox, FormControlLabel, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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

const SendingFundsPanel = ({ isActive }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const [expandedSendSection, setExpandedSendSection] = useState('sendtoaddress');

  // State for sendtoaddress
  const [sendToAddressAddress, setSendToAddressAddress] = useState('');
  const [sendToAddressAmount, setSendToAddressAmount] = useState('');
  const [sendToAddressComment, setSendToAddressComment] = useState('');
  const [sendToAddressCommentTo, setSendToAddressCommentTo] = useState('');
  const [sendToAddressSubtractFee, setSendToAddressSubtractFee] = useState(false);
  const [sendToAddressLoading, setSendToAddressLoading] = useState(false);
  const [sendToAddressError, setSendToAddressError] = useState('');
  const [sendToAddressResult, setSendToAddressResult] = useState('');

  // State for sendmany
  const [sendManyFromAccount, setSendManyFromAccount] = useState('""');
  const [sendManyRecipients, setSendManyRecipients] = useState([{ address: '', amount: '' }]);
  const [sendManyMinConf, setSendManyMinConf] = useState('1');
  const [sendManyComment, setSendManyComment] = useState('');
  const [sendManySubtractFeeFrom, setSendManySubtractFeeFrom] = useState('[]');
  const [sendManyLoading, setSendManyLoading] = useState(false);
  const [sendManyError, setSendManyError] = useState('');
  const [sendManyResult, setSendManyResult] = useState('');

  // State for z_sendmany
  const [zSendManyFromAddress, setZSendManyFromAddress] = useState('');
  const [zSendManyRecipients, setZSendManyRecipients] = useState([{ address: '', amount: '', memo: '' }]);
  const [zSendManyMinConf, setZSendManyMinConf] = useState('1');
  const [zSendManyFee, setZSendManyFee] = useState('0.0001');
  const [zSendManyLoading, setZSendManyLoading] = useState(false);
  const [zSendManyError, setZSendManyError] = useState('');
  const [zSendManyResultOpId, setZSendManyResultOpId] = useState('');

  const handleSendAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSendSection(isExpanded ? panel : false);
  };

  const clearSendToAddressFields = () => {
    setSendToAddressAddress(''); setSendToAddressAmount(''); setSendToAddressComment(''); setSendToAddressCommentTo(''); setSendToAddressSubtractFee(false); setSendToAddressError(''); setSendToAddressResult('');
  };

  const handleSendToAddress = async () => {
    if (!sendToAddressAddress.trim() || !sendToAddressAmount.trim()) {
      setSendToAddressError('Address and Amount are required.');
      return;
    }
    setSendToAddressLoading(true);
    setSendToAddressError('');
    setSendToAddressResult('');
    const cmd = 'sendtoaddress';
    const params = [ sendToAddressAddress.trim(), parseFloat(sendToAddressAmount.trim()), sendToAddressComment.trim(), sendToAddressCommentTo.trim(), sendToAddressSubtractFee ];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setSendToAddressResult(result);
      setSendToAddressAddress(''); setSendToAddressAmount(''); setSendToAddressComment(''); setSendToAddressCommentTo(''); setSendToAddressSubtractFee(false);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setSendToAddressError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setSendToAddressLoading(false);
    }
  };

  const handleSendManyRecipientChange = (index, field, value) => {
    const newRecipients = [...sendManyRecipients];
    newRecipients[index][field] = value;
    setSendManyRecipients(newRecipients);
  };
  const addSendManyRecipient = () => { setSendManyRecipients([...sendManyRecipients, { address: '', amount: '' }]); };
  const removeSendManyRecipient = (index) => { const newRecipients = sendManyRecipients.filter((_, i) => i !== index); setSendManyRecipients(newRecipients); };

  const clearSendManyFields = () => { setSendManyFromAccount('""'); setSendManyRecipients([{ address: '', amount: '' }]); setSendManyMinConf('1'); setSendManyComment(''); setSendManySubtractFeeFrom('[]'); setSendManyError(''); setSendManyResult(''); };

  const handleSendMany = async () => {
    if (!sendManyFromAccount.trim()) { setSendManyError('From Account is required (e.g., "").'); return; }
    const amounts = {};
    for (const recip of sendManyRecipients) { if (!recip.address.trim() || !recip.amount.trim()) { setSendManyError('All recipients must have an address and amount.'); return; } amounts[recip.address.trim()] = parseFloat(recip.amount.trim()); }
    if (Object.keys(amounts).length === 0) { setSendManyError('At least one recipient is required.'); return; }
    setSendManyLoading(true); setSendManyError(''); setSendManyResult('');
    const cmd = 'sendmany';
    const params = [ sendManyFromAccount.trim(), amounts, parseInt(sendManyMinConf) || 1, sendManyComment.trim() ];
    try { const subtractFeeArray = JSON.parse(sendManySubtractFeeFrom.trim() || '[]'); if (Array.isArray(subtractFeeArray) && subtractFeeArray.length > 0) { params.push(subtractFeeArray); } } catch (e) { setSendManyError('Invalid JSON for Subtract Fee From addresses.'); setSendManyLoading(false); return; }
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setSendManyResult(result); clearSendManyFields();
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setSendManyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setSendManyLoading(false); }
  };
  
  const handleZSendManyRecipientChange = (index, field, value) => { const newRecipients = [...zSendManyRecipients]; newRecipients[index][field] = value; setZSendManyRecipients(newRecipients); };
  const addZSendManyRecipient = () => { setZSendManyRecipients([...zSendManyRecipients, { address: '', amount: '', memo: '' }]); };
  const removeZSendManyRecipient = (index) => { const newRecipients = zSendManyRecipients.filter((_, i) => i !== index); setZSendManyRecipients(newRecipients); };
  const clearZSendManyFields = () => { setZSendManyFromAddress(''); setZSendManyRecipients([{ address: '', amount: '', memo: '' }]); setZSendManyMinConf('1'); setZSendManyFee('0.0001'); setZSendManyError(''); setZSendManyResultOpId(''); };

  const handleZSendMany = async () => {
    if (!zSendManyFromAddress.trim()) { setZSendManyError('From Z-Address is required.'); return; }
    const amounts = [];
    for (const recip of zSendManyRecipients) { if (!recip.address.trim() || !recip.amount.trim()) { setZSendManyError('All recipients must have an address and amount.'); return; } const recipientObj = { address: recip.address.trim(), amount: parseFloat(recip.amount.trim()) }; if (recip.memo && recip.memo.trim()) { recipientObj.memo = recip.memo.trim(); } amounts.push(recipientObj); }
    if (amounts.length === 0) { setZSendManyError('At least one recipient is required.'); return; }
    setZSendManyLoading(true); setZSendManyError(''); setZSendManyResultOpId('');
    const cmd = 'z_sendmany';
    const params = [ zSendManyFromAddress.trim(), amounts, parseInt(zSendManyMinConf) || 1, parseFloat(zSendManyFee) || 0.0001 ];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setZSendManyResultOpId(result); clearZSendManyFields();
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZSendManyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally { setZSendManyLoading(false); }
  };

  const clearAllSendFields = () => { clearSendToAddressFields(); clearSendManyFields(); clearZSendManyFields(); };

  useEffect(() => {
    if (!isActive) {
      clearAllSendFields();
    }
  }, [isActive]);

  return (
    <Box>
        <Accordion expanded={expandedSendSection === 'sendtoaddress'} onChange={handleSendAccordionChange('sendtoaddress')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Send To Address</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>{renderTextField("To Address (R-Address, i-Address, VerusID@)", sendToAddressAddress, setSendToAddressAddress)}</Grid>
                    <Grid item xs={12} md={4}>{renderTextField("Amount", sendToAddressAmount, setSendToAddressAmount, "number")}</Grid>
                    <Grid item xs={12} sm={6}>{renderTextField("Comment (Optional)", sendToAddressComment, setSendToAddressComment)}</Grid>
                    <Grid item xs={12} sm={6}>{renderTextField("Comment To (Optional)", sendToAddressCommentTo, setSendToAddressCommentTo)}</Grid>
                    <Grid item xs={12} sm={6}><FormControlLabel control={<Checkbox checked={sendToAddressSubtractFee} onChange={(e) => setSendToAddressSubtractFee(e.target.checked)} sx={{color:'#aaa'}}/>} label="Subtract Fee From Amount" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/></Grid>
                    <Grid item xs={12} sm={6}><Button onClick={handleSendToAddress} variant="contained" color="success" disabled={sendToAddressLoading} fullWidth>{sendToAddressLoading ? <CircularProgress size={24} /> : "Send"}</Button></Grid>
                    {sendToAddressError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{sendToAddressError}</Typography></Grid>}
                    {sendToAddressResult && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa'}}>Transaction ID:</Typography><Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}><Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{sendToAddressResult}</Typography><Tooltip title="Copy TXID"><IconButton onClick={() => handleCopy(sendToAddressResult)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton></Tooltip></Box></Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedSendSection === 'sendmany'} onChange={handleSendAccordionChange('sendmany')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Send Many (T-Addresses)</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>{renderTextField("From Account (e.g., \"\")", sendManyFromAccount, setSendManyFromAccount)}</Grid>
                    <Grid item xs={12} sm={6}>{renderTextField("Min Confirmations", sendManyMinConf, setSendManyMinConf, "number")}</Grid>
                    <Grid item xs={12}>{renderTextField("Comment (Optional)", sendManyComment, setSendManyComment)}</Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{color:'#ccc', mb:1, fontSize:'0.8rem'}}>Recipients:</Typography>
                        {sendManyRecipients.map((recipient, index) => (
                            <Grid container spacing={1} key={index} sx={{mb:1, alignItems:'center'}}>
                                <Grid item xs={6} sm={5}>{renderTextField(`Address ${index + 1}`, recipient.address, (val) => handleSendManyRecipientChange(index, 'address', val))}</Grid>
                                <Grid item xs={4} sm={4}>{renderTextField(`Amount ${index + 1}`, recipient.amount, (val) => handleSendManyRecipientChange(index, 'amount', val), "number")}</Grid>
                                <Grid item xs={2} sm={3} sx={{textAlign: 'right'}}>
                                    {sendManyRecipients.length > 1 && <Tooltip title="Remove Recipient"><IconButton onClick={() => removeSendManyRecipient(index)} size="small" sx={{color:'#ff7961', '&:hover':{color:'#ffc9c4'}}}> <RemoveCircleOutlineIcon /> </IconButton></Tooltip>}
                                    {index === sendManyRecipients.length - 1 && <Tooltip title="Add Recipient"><IconButton onClick={addSendManyRecipient} size="small" sx={{color:'#69f0ae', '&:hover':{color:'#b9f6ca'}}}> <AddCircleOutlineIcon /> </IconButton></Tooltip>}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                    <Grid item xs={12}>{renderJsonTextField("Subtract Fee From (JSON Array, Optional)", sendManySubtractFeeFrom, setSendManySubtractFeeFrom, 'e.g., ["address1", "address2"]')}</Grid>
                    <Grid item xs={12}><Button onClick={handleSendMany} variant="contained" color="success" disabled={sendManyLoading} fullWidth>{sendManyLoading ? <CircularProgress size={24} /> : "Send Many"}</Button></Grid>
                    {sendManyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{sendManyError}</Typography></Grid>}
                    {sendManyResult && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa'}}>Transaction ID:</Typography><Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}><Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{sendManyResult}</Typography><Tooltip title="Copy TXID"><IconButton onClick={() => handleCopy(sendManyResult)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton></Tooltip></Box></Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion expanded={expandedSendSection === 'z_sendmany'} onChange={handleSendAccordionChange('z_sendmany')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}> <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Send Many (Shielded - Z-Addresses)</Typography> </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>{renderTextField("From Z-Address", zSendManyFromAddress, setZSendManyFromAddress)}</Grid>
                    <Grid item xs={6} sm={3}>{renderTextField("Min Confirmations", zSendManyMinConf, setZSendManyMinConf, "number")}</Grid>
                    <Grid item xs={6} sm={3}>{renderTextField("Fee (Optional)", zSendManyFee, setZSendManyFee, "number", "Default 0.0001")}</Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{color:'#ccc', mb:1, fontSize:'0.8rem'}}>Recipients:</Typography>
                        {zSendManyRecipients.map((recipient, index) => (
                            <Grid container spacing={1} key={index} sx={{mb:1, alignItems:'center'}}>
                                <Grid item xs={12} sm={5} md={4}>{renderTextField(`To Z-Address ${index + 1}`, recipient.address, (val) => handleZSendManyRecipientChange(index, 'address', val))}</Grid>
                                <Grid item xs={6} sm={3} md={3}>{renderTextField(`Amount ${index + 1}`, recipient.amount, (val) => handleZSendManyRecipientChange(index, 'amount', val), "number")}</Grid>
                                <Grid item xs={6} sm={4} md={3}>{renderTextField(`Memo (Hex, Optional) ${index + 1}`, recipient.memo, (val) => handleZSendManyRecipientChange(index, 'memo', val))}</Grid>
                                <Grid item xs={12} sm={12} md={2} sx={{textAlign: {xs:'left', md:'right'}}}>
                                    {zSendManyRecipients.length > 1 && <Tooltip title="Remove Recipient"><IconButton onClick={() => removeZSendManyRecipient(index)} size="small" sx={{color:'#ff7961', '&:hover':{color:'#ffc9c4'}}}> <RemoveCircleOutlineIcon /> </IconButton></Tooltip>}
                                    {index === zSendManyRecipients.length - 1 && <Tooltip title="Add Recipient"><IconButton onClick={addZSendManyRecipient} size="small" sx={{color:'#69f0ae', '&:hover':{color:'#b9f6ca'}}}> <AddCircleOutlineIcon /> </IconButton></Tooltip>}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                    <Grid item xs={12}><Button onClick={handleZSendMany} variant="contained" color="success" disabled={zSendManyLoading} fullWidth>{zSendManyLoading ? <CircularProgress size={24} /> : "Z-Send Many"}</Button></Grid>
                    {zSendManyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zSendManyError}</Typography></Grid>}
                    {zSendManyResultOpId && ( <Grid item xs={12}><Typography variant="caption" display="block" sx={{color:'#aaa'}}>Operation ID:</Typography><Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}><Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{zSendManyResultOpId}</Typography><Tooltip title="Copy Operation ID"><IconButton onClick={() => handleCopy(zSendManyResultOpId)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton></Tooltip></Box></Grid> )}
                </Grid>
            </AccordionDetails>
        </Accordion>
    </Box>
  );
};

export default SendingFundsPanel; 