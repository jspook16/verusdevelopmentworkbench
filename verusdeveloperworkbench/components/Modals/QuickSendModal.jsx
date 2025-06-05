import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Tooltip, Dialog, DialogActions, 
  DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, Paper, Grid, Switch, FormControlLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { NodeContext } from '../../contexts/NodeContext';
import { TerminalContext } from '../../contexts/TerminalContext';

// Define initialRecipientState OUTSIDE the component for a stable reference
const STABLE_INITIAL_RECIPIENT_STATE = {
  address: '',
  amount: '',
  memo: '',
  currency: '', 
  convertto: '',
  addconversionfees: false,
  exportto: '',
  exportid: false,
  exportcurrency: false,
  feecurrency: '',
  via: '',
  refundto: '',
  preconvert: false,
  burn: false,
  mintnew: false,
};

const QuickSendModal = ({ open, onClose }) => {
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const nodeConnected = nodeStatus?.connected;
  const nodeChainName = nodeStatus?.chainName;

  const [fromAddress, setFromAddress] = useState('*');
  // Use the stable version for initial state
  const [recipients, setRecipients] = useState([STABLE_INITIAL_RECIPIENT_STATE]); 
  const [minconf, setMinconf] = useState('1');
  const [feeamount, setFeeamount] = useState('');
  const [availableSendCurrencies, setAvailableSendCurrencies] = useState([]);
  
  const [quickSendLoading, setQuickSendLoading] = useState(false);
  const [quickSendError, setQuickSendError] = useState('');
  const [fromAddressError, setFromAddressError] = useState('');
  const [quickSendResultTxid, setQuickSendResultTxid] = useState('');
  const [loadingSendCurrencies, setLoadingSendCurrencies] = useState(false);

  const getDefaultCurrency = useCallback((currencies) => {
    if (!currencies || currencies.length === 0) return '';
    const native = currencies.find(c => c.name === (nodeChainName || 'VRSCTEST'));
    return native ? native.id : currencies[0].id;
  }, [nodeChainName]);

  const fetchAvailableSendCurrencies = useCallback(async () => {
    if (!nodeConnected || !sendCommand) return;
    const currentFromAddress = fromAddress.trim();

    if (!currentFromAddress) {
        setFromAddressError('From Address cannot be empty.');
        setAvailableSendCurrencies([]);
        return;
    }
    setLoadingSendCurrencies(true);
    setFromAddressError('');
    setQuickSendError('');
    setAvailableSendCurrencies([]);
    try {
      const balances = await sendCommand('getcurrencybalance', [currentFromAddress, 0, true, true]);
      if (balances && typeof balances === 'object' && !balances.error) {
        const currenciesArray = Object.entries(balances).map(([name, balance]) => ({
            id: name, name: name, balance: parseFloat(balance) || 0 
        }));
        if (currenciesArray.length === 0) {
            if (currentFromAddress === '*') {
                setFromAddressError('No spendable currencies found in wallet.');
            } else {
                setFromAddressError('No balances for this From Address, or address is invalid/not in wallet.');
            }
        }
        setAvailableSendCurrencies(currenciesArray);
      } else if (balances && balances.error) {
        const specificAddressErrorMsg = currentFromAddress !== '*' ? `Error for '${currentFromAddress}': ${balances.error.message}` : balances.error.message;
        setFromAddressError(specificAddressErrorMsg); 
        setAvailableSendCurrencies([]);
      } else {
        setFromAddressError('Failed to fetch balances or empty result.');
        setAvailableSendCurrencies([]);
      }
    } catch (err) {
      console.error("Error fetching send currencies:", err);
      const specificAddressErrorCatchMsg = currentFromAddress !== '*' && err.message ? `Error for '${currentFromAddress}': ${err.message}` : (err.message || 'Error fetching currencies.');
      setFromAddressError(specificAddressErrorCatchMsg);
      setAvailableSendCurrencies([]);
    } finally {
    setLoadingSendCurrencies(false);
    }
  }, [nodeConnected, sendCommand, fromAddress, nodeChainName]);

  // Effect to fetch currencies for initial load (e.g. fromAddress is '*')
  // This effect should NOT run every time fromAddress changes due to typing.
  useEffect(() => {
    // Only run if modal is open, node is connected, AND fromAddress is the initial wildcard or similar.
    // This aims to fetch for '*' when the modal first opens, but not for intermediate typed values.
    if (open && nodeConnected && (fromAddress === '*')) { // Conditioned on fromAddress being '*'
      fetchAvailableSendCurrencies();
    }
    if (!open) { 
      setLoadingSendCurrencies(false);
    }
    // We don't want this to run if fromAddress changes from '*' to something else due to typing.
    // The onBlur handler will take care of that. fetchAvailableSendCurrencies is stable if its deps are.
  }, [open, nodeConnected, fromAddress, fetchAvailableSendCurrencies]); // Added fromAddress and fetchAvailableSendCurrencies here
                                                                        // to correctly re-fetch if fromAddress is externally set to '*' again
                                                                        // OR if fetchAvailableSendCurrencies definition changes.
                                                                        // The key is the internal fromAddress === '*' condition.

  // Effect to reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFromAddress('*'); // Reset to wildcard
      setMinconf('1');
      setFeeamount('');
      setRecipients([STABLE_INITIAL_RECIPIENT_STATE]); 
      setQuickSendError('');
      setFromAddressError('');
      setQuickSendResultTxid('');
      setAvailableSendCurrencies([]);
    }
  }, [open]);

  // Effect to update recipient default currencies when availableSendCurrencies list changes
  useEffect(() => {
    if (open && availableSendCurrencies.length > 0) {
      const defaultCurrencyToSet = getDefaultCurrency(availableSendCurrencies);
      if (defaultCurrencyToSet) {
        setRecipients(prevRecipients =>
          prevRecipients.map(rec => ({
            ...rec,
            currency: rec.currency || defaultCurrencyToSet,
          }))
        );
      }
    } else if (open && availableSendCurrencies.length === 0 && recipients.some(r => r.currency !== '')) {
      setRecipients(prevRecipients => prevRecipients.map(rec => ({ ...rec, currency: '' })));
    }
  }, [open, availableSendCurrencies, getDefaultCurrency, recipients.length]);

  const handleFromAddressChange = (event) => {
    setFromAddress(event.target.value);
  };

  const handleFromAddressBlur = () => {
    // Fetch if fromAddress is not the wildcard, not empty, and node is connected.
    // The initial wildcard fetch is handled by the useEffect above.
    if (fromAddress && fromAddress.trim() !== '' && fromAddress.trim() !== '*' && nodeConnected) {
      fetchAvailableSendCurrencies();
    }
  };

  const handleRecipientChange = (index, field, value, isSwitch = false) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = isSwitch ? value : value;
    setRecipients(newRecipients);
    setQuickSendError('');
  };

  const addRecipient = () => {
    const defaultCurrency = getDefaultCurrency(availableSendCurrencies);
    setRecipients([...recipients, {...STABLE_INITIAL_RECIPIENT_STATE, currency: defaultCurrency || '' }]);
    setQuickSendError('');
  };

  const removeRecipient = (index) => {
    if (recipients.length <= 1) return;
    const newRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(newRecipients);
  };

  const handleQuickSend = async () => {
    // Clear previous general errors before new validation attempt
    setQuickSendError(''); 

    for (const recipient of recipients) {
      if (!recipient.burn && !recipient.address.trim()) {
        setQuickSendError('Recipient Address/ID is required if not burning.'); return;
      }
      if (!recipient.amount.trim() || parseFloat(recipient.amount) <= 0) {
        setQuickSendError('All recipient amounts must be valid positive numbers.'); return;
      }
      if (!recipient.currency.trim()) {
        setQuickSendError('Currency must be selected for all recipients.'); return;
      }
    }
    if (!sendCommand) { setQuickSendError('sendCommand is not available.'); return; }
    setQuickSendLoading(true);
    setQuickSendResultTxid('');
    const cmd = 'sendcurrency';
    const payments = recipients.map(r => {
      const payment = {
      address: r.address.trim(),
      amount: parseFloat(r.amount),
        currency: r.currency.trim(),
      };
      if (r.memo.trim()) payment.memo = r.memo.trim();
      if (r.convertto.trim()) payment.convertto = r.convertto.trim();
      if (r.addconversionfees) payment.addconversionfees = r.addconversionfees;
      if (r.exportto.trim()) payment.exportto = r.exportto.trim();
      if (r.exportid) payment.exportid = r.exportid;
      if (r.exportcurrency) payment.exportcurrency = r.exportcurrency;
      if (r.feecurrency.trim()) payment.feecurrency = r.feecurrency.trim();
      if (r.via.trim()) payment.via = r.via.trim();
      if (r.refundto.trim()) payment.refundto = r.refundto.trim();
      if (r.preconvert) payment.preconvert = r.preconvert;
      if (r.burn) payment.burn = r.burn;
      if (r.mintnew) payment.mintnew = r.mintnew;
      return payment;
    });
    const params = [fromAddress.trim(), payments];
    if (minconf.trim() && !isNaN(parseInt(minconf.trim())) && parseInt(minconf.trim()) >=0 ) {
      params.push(parseInt(minconf.trim()));
      if (feeamount.trim() && !isNaN(parseFloat(feeamount.trim())) && parseFloat(feeamount.trim()) >=0) {
        params.push(parseFloat(feeamount.trim()));
      }
    } else if (feeamount.trim() && !isNaN(parseFloat(feeamount.trim())) && parseFloat(feeamount.trim()) >=0) {
      params.push(1); 
      params.push(parseFloat(feeamount.trim()));
    }
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet_send'});
    try {
      const result = await sendCommand(cmd, params);
      setQuickSendResultTxid(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet_send'});
    } catch (err) {
      console.error(`Error in quick send (${cmd}):`, err);
      setQuickSendError(err.message || `Failed to send funds using ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to send funds using ${cmd}.`, status: 'error', type: 'wallet_send'});
    } finally {
      setQuickSendLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{sx: {background: '#2c2c2c', minWidth: '750px', maxWidth: 'md'}}} fullWidth>
      <DialogTitle sx={{color: '#fff', pb:1}}>Quick Send Funds</DialogTitle>
      <DialogContent dividers sx={{borderColor: '#3f3f3f'}}>
        <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
        <TextField 
          label="From Address / ID (* for wallet-wide)" 
          fullWidth 
          size="small"
          value={fromAddress} 
                  onChange={handleFromAddressChange}
                  onBlur={handleFromAddressBlur}
          InputLabelProps={{sx:{fontSize:'0.9rem'}}} 
          inputProps={{sx:{fontSize:'0.9rem'}}}
                  error={!!(fromAddressError && !loadingSendCurrencies)}
                  helperText={!loadingSendCurrencies && fromAddressError ? fromAddressError : ''}
                  FormHelperTextProps={{ sx: { fontSize: '0.7rem', ml: 0 } }}
                />
            </Grid>
            <Grid item xs={12} sm={2}>
                <TextField 
                  label="Min Confs" 
                  fullWidth 
                  size="small"
                  type="number"
                  value={minconf} 
                  onChange={e => setMinconf(e.target.value)} 
                  InputLabelProps={{sx:{fontSize:'0.9rem'}}} 
                  inputProps={{sx:{fontSize:'0.9rem', min: 0}}}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <TextField 
                  label="Fee Amount (Optional)" 
                  fullWidth 
                  size="small"
                  type="number"
                  value={feeamount} 
                  onChange={e => setFeeamount(e.target.value)} 
                  InputLabelProps={{sx:{fontSize:'0.9rem'}}} 
                  inputProps={{sx:{fontSize:'0.9rem', step: '0.00000001'}}}
                />
            </Grid>
            <Grid item xs={12} sm={3} sx={{display: 'flex', alignItems: 'center', pt: fromAddressError && !loadingSendCurrencies ? 4.5 : 0.5}}>
                <Tooltip title="Refresh Balances for From Address">
                    <span> 
                    <IconButton onClick={fetchAvailableSendCurrencies} disabled={loadingSendCurrencies || !nodeConnected} size="small">
                    {loadingSendCurrencies ? <CircularProgress size={20}/> : <RefreshIcon sx={{color: '#90caf9'}}/>}
                </IconButton>
                </span>
            </Tooltip>
            </Grid>
        </Grid>

        <Typography sx={{mt: 2.5, mb:1, color: '#ccc', fontSize: '1rem', fontWeight:'500'}}>Recipients:</Typography>
        
        {recipients.map((recipient, index) => (
          <Paper key={index} elevation={2} sx={{p: 2, mb: 2, background: '#333', borderRadius: '4px'}}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
              <TextField 
                  label={`Recipient ${index + 1} Address/ID@Chain`}
                value={recipient.address}
                onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                  fullWidth size="small" 
                InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
              />
              </Grid>
              <Grid item xs={12} sm={3}>
              <TextField 
                label="Amount"
                type="number"
                value={recipient.amount}
                onChange={(e) => handleRecipientChange(index, 'amount', e.target.value)}
                  fullWidth size="small" 
                InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem', step: '0.00000001'}}}
              />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small" disabled={availableSendCurrencies.length === 0 && !loadingSendCurrencies}>
                    <InputLabel id={`recipient-${index}-currency-label`} sx={{fontSize: '0.85rem'}}>Currency</InputLabel>
                    <Select
                        labelId={`recipient-${index}-currency-label`}
                        value={recipient.currency} 
                        label="Currency"
                        onChange={(e) => handleRecipientChange(index, 'currency', e.target.value)}
                        sx={{fontSize: '0.85rem', color:'#fff'}}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                    >
                        <MenuItem value="" sx={{fontSize:'0.8rem', color:'#888'}}><em>None</em></MenuItem>
                        {availableSendCurrencies.map(c => (
                            <MenuItem key={c.id} value={c.id} sx={{fontSize:'0.85rem'}}>{c.name} ({c.balance.toFixed(4)})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
            <TextField 
              label="Memo (z-address only)"
              value={recipient.memo}
              onChange={(e) => handleRecipientChange(index, 'memo', e.target.value)}
                  fullWidth size="small" 
                  InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  label="Convert To"
                  value={recipient.convertto}
                  onChange={(e) => handleRecipientChange(index, 'convertto', e.target.value)}
                  fullWidth size="small" 
                  InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  label="Export To (Chain)"
                  value={recipient.exportto}
                  onChange={(e) => handleRecipientChange(index, 'exportto', e.target.value)}
                  fullWidth size="small" 
                  InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
            />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  label="Refund To"
                  value={recipient.refundto}
                  onChange={(e) => handleRecipientChange(index, 'refundto', e.target.value)}
                  fullWidth size="small" 
                  InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  label="Fee Currency"
                  value={recipient.feecurrency}
                  onChange={(e) => handleRecipientChange(index, 'feecurrency', e.target.value)}
                  fullWidth size="small" 
                  InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  label="Via (Currency)"
                  value={recipient.via}
                  onChange={(e) => handleRecipientChange(index, 'via', e.target.value)}
                  fullWidth size="small" 
                  InputLabelProps={{sx:{fontSize:'0.85rem'}}} inputProps={{sx:{fontSize:'0.85rem'}}}
                />
              </Grid>
              <Grid item xs={12} sm={3} sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                <IconButton onClick={() => removeRecipient(index)} disabled={recipients.length <= 1} size="small" sx={{color: '#f46a6a', mt:1}}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Grid>

              <Grid item xs={12}> <Typography variant="caption" sx={{color: '#aaa', ml:0.5}}>Options:</Typography></Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel control={<Switch size="small" checked={recipient.addconversionfees} onChange={(e) => handleRecipientChange(index, 'addconversionfees', e.target.checked, true)} />} label={<Typography sx={{fontSize:'0.8rem'}}>Add Conv. Fees</Typography>} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel control={<Switch size="small" checked={recipient.exportid} onChange={(e) => handleRecipientChange(index, 'exportid', e.target.checked, true)} />} label={<Typography sx={{fontSize:'0.8rem'}}>Export ID</Typography>} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel control={<Switch size="small" checked={recipient.exportcurrency} onChange={(e) => handleRecipientChange(index, 'exportcurrency', e.target.checked, true)} />} label={<Typography sx={{fontSize:'0.8rem'}}>Export Currency Def.</Typography>} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel control={<Switch size="small" checked={recipient.preconvert} onChange={(e) => handleRecipientChange(index, 'preconvert', e.target.checked, true)} />} label={<Typography sx={{fontSize:'0.8rem'}}>Pre-convert</Typography>} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel control={<Switch size="small" checked={recipient.burn} onChange={(e) => handleRecipientChange(index, 'burn', e.target.checked, true)} />} label={<Typography sx={{fontSize:'0.8rem'}}>Burn</Typography>} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel control={<Switch size="small" checked={recipient.mintnew} onChange={(e) => handleRecipientChange(index, 'mintnew', e.target.checked, true)} />} label={<Typography sx={{fontSize:'0.8rem'}}>Mint New</Typography>} />
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Button 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={addRecipient} 
          size="small" 
          variant="outlined"
          sx={{color: '#90caf9', borderColor: '#90caf9', mt:0.5, mb:2, fontSize:'0.8rem'}}
          disabled={!!(fromAddressError && !loadingSendCurrencies && availableSendCurrencies.length === 0)}
        >
          Add Recipient
        </Button>
        
        {quickSendError && <Typography color="error" sx={{mt:1, mb:1, fontSize: '0.8rem'}}>{quickSendError}</Typography>}
        {quickSendResultTxid && (
          <Box sx={{mt:2, p:1, background: '#1c1c1c', borderRadius:1}}>
            <Typography variant="body2" sx={{color: '#c5e1a5'}}>Sent! TxID/OpID:</Typography>
            <Typography variant="caption" sx={{color: '#e0e0e0', wordBreak:'break-all'}}>{quickSendResultTxid}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{borderColor: '#3f3f3f', px:2.5, py:1.5}}>
        <Button onClick={onClose} sx={{color: '#bbb'}} size="small">Cancel</Button>
        <Button 
          onClick={handleQuickSend} 
          variant="contained" 
          startIcon={quickSendLoading ? <CircularProgress size={16} color="inherit"/> : <SendIcon />} 
          disabled={quickSendLoading || !nodeConnected || 
                     recipients.some(r => 
                       !r.currency.trim() || 
                       !r.amount.trim() || 
                       parseFloat(r.amount) <= 0 || 
                       !r.address.trim() // Address is always required now
                     ) || 
                     (!!(fromAddressError && !loadingSendCurrencies && availableSendCurrencies.length === 0))}
          size="small"
        >
          Send Funds
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickSendModal; 