import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NodeContext } from '../../contexts/NodeContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import { TerminalContext } from '../../contexts/TerminalContext';

// Helper rendering functions (assuming these are general enough, or pass them as props if very specific and complex)
// For simplicity, these are recreated here. If they are identical to WalletOperationsView, they could be imported from a shared utils file.
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


const KeyManagementPanel = ({ isActive, selectedRAddressWM, selectedZAddressWM }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  // State for dumpprivkey
  const [dumpPrivKeyAddress, setDumpPrivKeyAddress] = useState('');
  const [dumpedPrivKey, setDumpedPrivKey] = useState('');
  const [dumpPrivKeyLoading, setDumpPrivKeyLoading] = useState(false);
  const [dumpPrivKeyError, setDumpPrivKeyError] = useState('');

  // State for importprivkey
  const [importPrivKeyWIF, setImportPrivKeyWIF] = useState('');
  const [importPrivKeyLabel, setImportPrivKeyLabel] = useState('');
  const [importPrivKeyRescan, setImportPrivKeyRescan] = useState(true);
  const [importPrivKeyLoading, setImportPrivKeyLoading] = useState(false);
  const [importPrivKeyError, setImportPrivKeyError] = useState('');
  const [importPrivKeySuccess, setImportPrivKeySuccess] = useState('');

  // State for z_exportkey
  const [zExportKeyAddress, setZExportKeyAddress] = useState('');
  const [zExportKeyAsHex, setZExportKeyAsHex] = useState(false);
  const [exportedZKey, setExportedZKey] = useState('');
  const [zExportKeyLoading, setZExportKeyLoading] = useState(false);
  const [zExportKeyError, setZExportKeyError] = useState('');

  // State for z_importkey
  const [zImportKeyZKey, setZImportKeyZKey] = useState('');
  const [zImportKeyRescan, setZImportKeyRescan] = useState('whenkeyisnew'); // Default
  const [zImportKeyStartHeight, setZImportKeyStartHeight] = useState(''); // Optional
  const [importedZKeyResult, setImportedZKeyResult] = useState(null);
  const [zImportKeyLoading, setZImportKeyLoading] = useState(false);
  const [zImportKeyError, setZImportKeyError] = useState('');

  // State for z_exportviewingkey
  const [zExportViewKeyAddress, setZExportViewKeyAddress] = useState('');
  const [exportedZViewKey, setExportedZViewKey] = useState('');
  const [zExportViewKeyLoading, setZExportViewKeyLoading] = useState(false);
  const [zExportViewKeyError, setZExportViewKeyError] = useState('');

  // State for z_importviewingkey
  const [zImportViewKeyVKey, setZImportViewKeyVKey] = useState('');
  const [zImportViewKeyRescan, setZImportViewKeyRescan] = useState('whenkeyisnew');
  const [zImportViewKeyStartHeight, setZImportViewKeyStartHeight] = useState('');
  const [importedZViewKeyResult, setImportedZViewKeyResult] = useState(null);
  const [zImportViewKeyLoading, setZImportViewKeyLoading] = useState(false);
  const [zImportViewKeyError, setZImportViewKeyError] = useState('');
  
  // State for getnewaddress
  const [newTAddress, setNewTAddress] = useState('');
  const [getNewAddressLoading, setGetNewAddressLoading] = useState(false);
  const [getNewAddressError, setGetNewAddressError] = useState('');

  // State for z_getnewaddress
  const [newZAddressType, setNewZAddressType] = useState('sapling');
  const [newZAddress, setNewZAddress] = useState('');
  const [getNewZAddressLoading, setGetNewZAddressLoading] = useState(false);
  const [getNewZAddressError, setGetNewZAddressError] = useState('');

  // State for convertpassphrase
  const [convertPassphraseInput, setConvertPassphraseInput] = useState('');
  const [convertPassphraseResult, setConvertPassphraseResult] = useState(null);
  const [convertPassphraseLoading, setConvertPassphraseLoading] = useState(false);
  const [convertPassphraseError, setConvertPassphraseError] = useState('');

  // State for getrawchangeaddress
  const [rawChangeAddress, setRawChangeAddress] = useState('');
  const [getRawChangeAddressLoading, setGetRawChangeAddressLoading] = useState(false);
  const [getRawChangeAddressError, setGetRawChangeAddressError] = useState('');

  // State for encryptwallet
  const [encryptWalletPassphrase, setEncryptWalletPassphrase] = useState('');
  const [encryptWalletLoading, setEncryptWalletLoading] = useState(false);
  const [encryptWalletError, setEncryptWalletError] = useState('');
  const [encryptWalletSuccess, setEncryptWalletSuccess] = useState('');

  // State for walletpassphrase
  const [walletPassphrase, setWalletPassphrase] = useState('');
  const [walletPassphraseTimeout, setWalletPassphraseTimeout] = useState('60');
  const [walletPassphraseLoading, setWalletPassphraseLoading] = useState(false);
  const [walletPassphraseError, setWalletPassphraseError] = useState('');
  const [walletPassphraseSuccess, setWalletPassphraseSuccess] = useState('');

  // State for walletpassphrasechange
  const [oldWalletPassphrase, setOldWalletPassphrase] = useState('');
  const [newWalletPassphrase, setNewWalletPassphrase] = useState('');
  const [walletPassphraseChangeLoading, setWalletPassphraseChangeLoading] = useState(false);
  const [walletPassphraseChangeError, setWalletPassphraseChangeError] = useState('');
  const [walletPassphraseChangeSuccess, setWalletPassphraseChangeSuccess] = useState('');

  // State for walletlock
  const [walletLockLoading, setWalletLockLoading] = useState(false);
  const [walletLockError, setWalletLockError] = useState('');
  const [walletLockSuccess, setWalletLockSuccess] = useState('');

  // State for Accordion expansion
  const [expandedKeySection, setExpandedKeySection] = useState('dumpprivkey'); // Default open section

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedKeySection(isExpanded ? panel : false);
  };

  const handleCopy = (textToCopy) => {
    if (textToCopy === undefined || textToCopy === null) return;
    navigator.clipboard.writeText(String(textToCopy));
  };

  // Pre-fill dumpprivkey address if an R-Address is selected
  useEffect(() => {
    if (isActive && selectedRAddressWM) {
      setDumpPrivKeyAddress(selectedRAddressWM);
    } else if (isActive && !selectedRAddressWM) {
      // If RAddress is deselected while on this tab, clear field (optional)
      // setDumpPrivKeyAddress(''); 
    }
  }, [selectedRAddressWM, isActive]);

  // Pre-fill z_exportkey and z_exportviewingkey address if a Z-Address is selected
  useEffect(() => {
    if (isActive && selectedZAddressWM) {
        setZExportKeyAddress(selectedZAddressWM);
        setZExportViewKeyAddress(selectedZAddressWM);
    } else if (isActive && !selectedZAddressWM) {
        // setZExportKeyAddress('');
        // setZExportViewKeyAddress('');
    }
  }, [selectedZAddressWM, isActive]);


  const clearDumpPrivKeyFields = () => {
    setDumpPrivKeyAddress(selectedRAddressWM && isActive ? selectedRAddressWM : ''); // Keep prefill if active
    setDumpedPrivKey('');
    setDumpPrivKeyError('');
  };

  const handleDumpPrivKey = async () => {
    if (!dumpPrivKeyAddress.trim()) {
      setDumpPrivKeyError('R-Address is required.');
      return;
    }
    setDumpPrivKeyLoading(true);
    setDumpPrivKeyError('');
    setDumpedPrivKey('');
    const cmd = 'dumpprivkey';
    const params = [dumpPrivKeyAddress.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setDumpedPrivKey(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setDumpPrivKeyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setDumpPrivKeyLoading(false);
    }
  };

  const clearImportPrivKeyFields = () => {
    setImportPrivKeyWIF('');
    setImportPrivKeyLabel('');
    setImportPrivKeyRescan(true);
    setImportPrivKeyError('');
    setImportPrivKeySuccess('');
  };

  const handleImportPrivKey = async () => {
    if (!importPrivKeyWIF.trim()) {
      setImportPrivKeyError('Private Key (WIF) is required.');
      return;
    }
    setImportPrivKeyLoading(true);
    setImportPrivKeyError('');
    setImportPrivKeySuccess('');
    const cmd = 'importprivkey';
    const params = [importPrivKeyWIF.trim(), importPrivKeyLabel.trim(), importPrivKeyRescan];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params);
      setImportPrivKeySuccess('Private key imported successfully. Wallet may rescan.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setImportPrivKeyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setImportPrivKeyLoading(false);
    }
  };

  const clearZExportKeyFields = () => {
    setZExportKeyAddress(selectedZAddressWM && isActive ? selectedZAddressWM : ''); // Keep prefill
    setZExportKeyAsHex(false);
    setExportedZKey('');
    setZExportKeyError('');
  };
  
  const handleZExportKey = async () => {
    if (!zExportKeyAddress.trim()) {
      setZExportKeyError('Z-Address is required.');
      return;
    }
    setZExportKeyLoading(true);
    setZExportKeyError('');
    setExportedZKey('');
    const cmd = 'z_exportkey';
    const params = [zExportKeyAddress.trim()];
    if (zExportKeyAsHex) params.push(true);
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setExportedZKey(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZExportKeyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setZExportKeyLoading(false);
    }
  };

  const clearZImportKeyFields = () => {
    setZImportKeyZKey('');
    setZImportKeyRescan('whenkeyisnew');
    setZImportKeyStartHeight('');
    setImportedZKeyResult(null);
    setZImportKeyError('');
  };

  const handleZImportKey = async () => {
    if (!zImportKeyZKey.trim()) {
      setZImportKeyError('Z Private Key is required.');
      return;
    }
    setZImportKeyLoading(true);
    setZImportKeyError('');
    setImportedZKeyResult(null);
    const cmd = 'z_importkey';
    const params = [zImportKeyZKey.trim()];
    if (zImportKeyRescan) params.push(zImportKeyRescan); // "" is falsey, so this is fine
    if (zImportKeyStartHeight.trim()) {
      // z_importkey expects rescan (true/false/"whenkeyisnew") before startheight
      // If rescan is not provided by user (e.g. left as empty string), but height is, default rescan to true.
      // However, our UI default is "whenkeyisnew", so this condition might need refinement based on exact desired logic
      // For now, if height is given, rescan param must be present.
      if (!params.includes(zImportKeyRescan) && zImportKeyRescan === '') params.push(true); // Ensure rescan is explicitly set if height is used
      params.push(parseInt(zImportKeyStartHeight.trim(), 10));
    } else if (zImportKeyRescan === '') { 
      // if rescan is explicitly set to empty string (meaning false by CLI standards) and no height
      params.push(false);
    }

    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setImportedZKeyResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZImportKeyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setZImportKeyLoading(false);
    }
  };
  
  const clearZExportViewKeyFields = () => {
    setZExportViewKeyAddress(selectedZAddressWM && isActive ? selectedZAddressWM : ''); // Keep prefill
    setExportedZViewKey('');
    setZExportViewKeyError('');
  };

  const handleZExportViewKey = async () => {
    if (!zExportViewKeyAddress.trim()) {
      setZExportViewKeyError('Z-Address is required.');
      return;
    }
    setZExportViewKeyLoading(true);
    setZExportViewKeyError('');
    setExportedZViewKey('');
    const cmd = 'z_exportviewingkey';
    const params = [zExportViewKeyAddress.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setExportedZViewKey(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZExportViewKeyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setZExportViewKeyLoading(false);
    }
  };

  const clearZImportViewKeyFields = () => {
    setZImportViewKeyVKey('');
    setZImportViewKeyRescan('whenkeyisnew');
    setZImportViewKeyStartHeight('');
    setImportedZViewKeyResult(null);
    setZImportViewKeyError('');
  };

  const handleZImportViewKey = async () => {
    if (!zImportViewKeyVKey.trim()) {
      setZImportViewKeyError('Viewing Key is required.');
      return;
    }
    setZImportViewKeyLoading(true);
    setZImportViewKeyError('');
    setImportedZViewKeyResult(null);
    const cmd = 'z_importviewingkey';
    const params = [zImportViewKeyVKey.trim()];
    if (zImportViewKeyRescan) params.push(zImportViewKeyRescan);
    if (zImportViewKeyStartHeight.trim()) {
      if (!params.includes(zImportViewKeyRescan) && zImportViewKeyRescan === '') params.push(true);
      params.push(parseInt(zImportViewKeyStartHeight.trim(), 10));
    } else if (zImportViewKeyRescan === '') {
        params.push(false);
    }
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setImportedZViewKeyResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZImportViewKeyError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setZImportViewKeyLoading(false);
    }
  };

  const clearGetNewAddressFields = () => {
    setNewTAddress('');
    setGetNewAddressError('');
  };

  const handleGetNewAddress = async () => {
    setGetNewAddressLoading(true);
    setGetNewAddressError('');
    setNewTAddress('');
    const cmd = 'getnewaddress';
    const params = [];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setNewTAddress(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetNewAddressError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setGetNewAddressLoading(false);
    }
  };

  const clearGetNewZAddressFields = () => {
    setNewZAddressType('sapling');
    setNewZAddress('');
    setGetNewZAddressError('');
  };

  const handleGetNewZAddress = async () => {
    setGetNewZAddressLoading(true);
    setGetNewZAddressError('');
    setNewZAddress('');
    const cmd = 'z_getnewaddress';
    const params = [newZAddressType];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setNewZAddress(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetNewZAddressError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setGetNewZAddressLoading(false);
    }
  };
  
  const clearConvertPassphraseFields = () => {
    setConvertPassphraseInput('');
    setConvertPassphraseResult(null);
    setConvertPassphraseError('');
  };

  const handleConvertPassphrase = async () => {
    if (!convertPassphraseInput.trim()) {
      setConvertPassphraseError('Passphrase is required.');
      return;
    }
    setConvertPassphraseLoading(true);
    setConvertPassphraseError('');
    setConvertPassphraseResult(null);
    const cmd = 'convertpassphrase';
    const params = [convertPassphraseInput.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setConvertPassphraseResult(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setConvertPassphraseError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setConvertPassphraseLoading(false);
    }
  };

  const clearGetRawChangeAddressFields = () => {
    setRawChangeAddress('');
    setGetRawChangeAddressError('');
  };

  const handleGetRawChangeAddress = async () => {
    setGetRawChangeAddressLoading(true);
    setGetRawChangeAddressError('');
    setRawChangeAddress('');
    const cmd = 'getrawchangeaddress';
    const params = [];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setRawChangeAddress(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setGetRawChangeAddressError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setGetRawChangeAddressLoading(false);
    }
  };

  const clearEncryptWalletFields = () => {
    setEncryptWalletPassphrase('');
    setEncryptWalletError('');
    setEncryptWalletSuccess('');
  };

  const handleEncryptWallet = async () => {
    if (!encryptWalletPassphrase.trim()) {
      setEncryptWalletError('Passphrase is required.');
      return;
    }
    setEncryptWalletLoading(true);
    setEncryptWalletError('');
    setEncryptWalletSuccess('');
    const cmd = 'encryptwallet';
    const params = [encryptWalletPassphrase.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params); // Result is usually a string notice
      setEncryptWalletSuccess(result || 'Wallet encrypted successfully. Restart the wallet.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result || 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setEncryptWalletError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setEncryptWalletLoading(false);
    }
  };

  const clearWalletPassphraseFields = () => {
    setWalletPassphrase('');
    setWalletPassphraseTimeout('60');
    setWalletPassphraseError('');
    setWalletPassphraseSuccess('');
  };

  const handleWalletPassphrase = async () => {
    if (!walletPassphrase.trim()) {
      setWalletPassphraseError('Passphrase is required.');
      return;
    }
    if (!walletPassphraseTimeout.trim() || isNaN(parseInt(walletPassphraseTimeout))) {
        setWalletPassphraseError('Timeout (in seconds) is required and must be a number.');
        return;
    }
    setWalletPassphraseLoading(true);
    setWalletPassphraseError('');
    setWalletPassphraseSuccess('');
    const cmd = 'walletpassphrase';
    const params = [walletPassphrase.trim(), parseInt(walletPassphraseTimeout.trim())];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params); // No direct result, success is by not throwing
      setWalletPassphraseSuccess('Wallet unlocked successfully.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setWalletPassphraseError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setWalletPassphraseLoading(false);
    }
  };
  
  const clearWalletPassphraseChangeFields = () => {
    setOldWalletPassphrase('');
    setNewWalletPassphrase('');
    setWalletPassphraseChangeError('');
    setWalletPassphraseChangeSuccess('');
  };

  const handleWalletPassphraseChange = async () => {
    if (!oldWalletPassphrase.trim() || !newWalletPassphrase.trim()) {
      setWalletPassphraseChangeError('Both old and new passphrases are required.');
      return;
    }
    setWalletPassphraseChangeLoading(true);
    setWalletPassphraseChangeError('');
    setWalletPassphraseChangeSuccess('');
    const cmd = 'walletpassphrasechange';
    const params = [oldWalletPassphrase.trim(), newWalletPassphrase.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params); // No direct result
      setWalletPassphraseChangeSuccess('Wallet passphrase changed successfully.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setWalletPassphraseChangeError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setWalletPassphraseChangeLoading(false);
    }
  };

  const clearWalletLockFields = () => {
    setWalletLockError('');
    setWalletLockSuccess('');
  };

  const handleWalletLock = async () => {
    setWalletLockLoading(true);
    setWalletLockError('');
    setWalletLockSuccess('');
    const cmd = 'walletlock';
    const params = [];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params); // No direct result
      setWalletLockSuccess('Wallet locked successfully.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setWalletLockError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setWalletLockLoading(false);
    }
  };
  
  const clearAllKeyManagementFields = () => {
    clearDumpPrivKeyFields();
    clearImportPrivKeyFields();
    clearZExportKeyFields();
    clearZImportKeyFields();
    clearZExportViewKeyFields();
    clearZImportViewKeyFields();
    clearGetNewAddressFields();
    clearGetNewZAddressFields();
    clearConvertPassphraseFields();
    clearGetRawChangeAddressFields();
    clearEncryptWalletFields();
    clearWalletPassphraseFields();
    clearWalletPassphraseChangeFields();
    clearWalletLockFields();
  };

  useEffect(() => {
    if (!isActive) {
      clearAllKeyManagementFields();
    }
  }, [isActive]);


  return (
    <Box>
      {/* dumpprivkey */}
      <Accordion expanded={expandedKeySection === 'dumpprivkey'} onChange={handleAccordionChange('dumpprivkey')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Dump Private Key</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              {renderTextField("R-Address", dumpPrivKeyAddress, setDumpPrivKeyAddress, "text", "The R-Address for which to dump the private key.", {
                  InputProps: {endAdornment: (
                    <Tooltip title="Clear">
                      <IconButton onClick={() => setDumpPrivKeyAddress('')} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ClearIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                  )}
              })}
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button onClick={handleDumpPrivKey} variant="contained" disabled={dumpPrivKeyLoading} fullWidth sx={{height: 40}}>
                {dumpPrivKeyLoading ? <CircularProgress size={24} /> : "Dump Key"}
              </Button>
            </Grid>
            {dumpPrivKeyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{dumpPrivKeyError}</Typography></Grid>}
            {dumpedPrivKey && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Private Key (WIF):</Typography>
                <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{dumpedPrivKey}</Typography>
                    <Tooltip title="Copy Private Key">
                      <IconButton onClick={() => handleCopy(dumpedPrivKey)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* importprivkey */}
      <Accordion expanded={expandedKeySection === 'importprivkey'} onChange={handleAccordionChange('importprivkey')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Import Private Key</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>{renderTextField("Private Key (WIF)", importPrivKeyWIF, setImportPrivKeyWIF, "password")}</Grid>
            <Grid item xs={12} md={6}>{renderTextField("Label (Optional)", importPrivKeyLabel, setImportPrivKeyLabel)}</Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={importPrivKeyRescan} onChange={(e) => setImportPrivKeyRescan(e.target.checked)} sx={{color:'#aaa'}}/>} label="Rescan Blockchain" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleImportPrivKey} variant="contained" disabled={importPrivKeyLoading} fullWidth>
                {importPrivKeyLoading ? <CircularProgress size={24} /> : "Import Key"}
              </Button>
            </Grid>
            {importPrivKeyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{importPrivKeyError}</Typography></Grid>}
            {importPrivKeySuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{importPrivKeySuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* z_exportkey */}
      <Accordion expanded={expandedKeySection === 'z_exportkey'} onChange={handleAccordionChange('z_exportkey')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Export Z Private Key</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              {renderTextField("Z-Address", zExportKeyAddress, setZExportKeyAddress, "text", "The Z-Address for which to export the private key.", {
                 InputProps: {endAdornment: (
                    <Tooltip title="Clear">
                      <IconButton onClick={() => setZExportKeyAddress('')} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ClearIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                  )}
              })}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel control={<Checkbox checked={zExportKeyAsHex} onChange={(e) => setZExportKeyAsHex(e.target.checked)} sx={{color:'#aaa'}}/>} label="Export as Hex" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleZExportKey} variant="contained" disabled={zExportKeyLoading} fullWidth>
                {zExportKeyLoading ? <CircularProgress size={24} /> : "Export Z Key"}
              </Button>
            </Grid>
            {zExportKeyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zExportKeyError}</Typography></Grid>}
            {exportedZKey && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Z Private Key:</Typography>
                 <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{exportedZKey}</Typography>
                    <Tooltip title="Copy Z Private Key">
                      <IconButton onClick={() => handleCopy(exportedZKey)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* z_importkey */}
      <Accordion expanded={expandedKeySection === 'z_importkey'} onChange={handleAccordionChange('z_importkey')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Import Z Private Key</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2}>
            <Grid item xs={12}>{renderTextField("Z Private Key", zImportKeyZKey, setZImportKeyZKey, "password")}</Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="zimportkey-rescan-label" sx={{fontSize:'0.8rem', color:'#ccc'}}>Rescan</InputLabel>
                <Select labelId="zimportkey-rescan-label" value={zImportKeyRescan} label="Rescan" onChange={(e) => setZImportKeyRescan(e.target.value)} sx={{fontSize:'0.8rem',color:'white', '& .MuiSelect-icon':{color:'white'}, '& .MuiOutlinedInput-notchedOutline': {borderColor: '#555'}, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: '#777'}}}>
                  <MenuItem value="whenkeyisnew" sx={{fontSize:'0.8rem'}}>When Key is New (default)</MenuItem>
                  <MenuItem value="true" sx={{fontSize:'0.8rem'}}>True (Rescan)</MenuItem>
                  <MenuItem value="false" sx={{fontSize:'0.8rem'}}>False (No Rescan)</MenuItem>
                  <MenuItem value="" sx={{fontSize:'0.8rem'}}>No (Equivalent to false if no height)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>{renderTextField("Start Height (Optional)", zImportKeyStartHeight, setZImportKeyStartHeight, "number", "If rescanning, block height to start rescan from.")}</Grid>
            <Grid item xs={12}>
              <Button onClick={handleZImportKey} variant="contained" disabled={zImportKeyLoading} fullWidth>
                {zImportKeyLoading ? <CircularProgress size={24} /> : "Import Z Key"}
              </Button>
            </Grid>
            {zImportKeyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zImportKeyError}</Typography></Grid>}
            {importedZKeyResult && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Import Result:</Typography>
                {renderJsonTextField("", JSON.stringify(importedZKeyResult, null, 2), () => {}, "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})}
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* z_exportviewingkey */}
      <Accordion expanded={expandedKeySection === 'z_exportviewingkey'} onChange={handleAccordionChange('z_exportviewingkey')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Export Z Viewing Key</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
             <Grid item xs={12} md={8}>
                {renderTextField("Z-Address", zExportViewKeyAddress, setZExportViewKeyAddress, "text", "The Z-Address for which to export the viewing key.", {
                    InputProps: {endAdornment: (
                        <Tooltip title="Clear">
                        <IconButton onClick={() => setZExportViewKeyAddress('')} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ClearIcon fontSize="small" /> </IconButton>
                        </Tooltip>
                    )}
                })}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button onClick={handleZExportViewKey} variant="contained" disabled={zExportViewKeyLoading} fullWidth sx={{height:40}}>
                {zExportViewKeyLoading ? <CircularProgress size={24} /> : "Export Viewing Key"}
              </Button>
            </Grid>
            {zExportViewKeyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zExportViewKeyError}</Typography></Grid>}
            {exportedZViewKey && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Z Viewing Key:</Typography>
                 <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{exportedZViewKey}</Typography>
                    <Tooltip title="Copy Z Viewing Key">
                      <IconButton onClick={() => handleCopy(exportedZViewKey)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* z_importviewingkey */}
      <Accordion expanded={expandedKeySection === 'z_importviewingkey'} onChange={handleAccordionChange('z_importviewingkey')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Import Z Viewing Key</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2}>
            <Grid item xs={12}>{renderTextField("Viewing Key (vkey)", zImportViewKeyVKey, setZImportViewKeyVKey, "password")}</Grid>
            <Grid item xs={12} sm={6}>
               <FormControl fullWidth size="small">
                <InputLabel id="zimportviewkey-rescan-label" sx={{fontSize:'0.8rem', color:'#ccc'}}>Rescan</InputLabel>
                <Select labelId="zimportviewkey-rescan-label" value={zImportViewKeyRescan} label="Rescan" onChange={(e) => setZImportViewKeyRescan(e.target.value)} sx={{fontSize:'0.8rem',color:'white', '& .MuiSelect-icon':{color:'white'}, '& .MuiOutlinedInput-notchedOutline': {borderColor: '#555'}, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: '#777'}}}>
                  <MenuItem value="whenkeyisnew" sx={{fontSize:'0.8rem'}}>When Key is New (default)</MenuItem>
                  <MenuItem value="true" sx={{fontSize:'0.8rem'}}>True (Rescan)</MenuItem>
                  <MenuItem value="false" sx={{fontSize:'0.8rem'}}>False (No Rescan)</MenuItem>
                  <MenuItem value="" sx={{fontSize:'0.8rem'}}>No (Equivalent to false if no height)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>{renderTextField("Start Height (Optional)", zImportViewKeyStartHeight, setZImportViewKeyStartHeight, "number", "If rescanning, block height to start rescan from.")}</Grid>
            <Grid item xs={12}>
              <Button onClick={handleZImportViewKey} variant="contained" disabled={zImportViewKeyLoading} fullWidth>
                {zImportViewKeyLoading ? <CircularProgress size={24} /> : "Import Viewing Key"}
              </Button>
            </Grid>
            {zImportViewKeyError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zImportViewKeyError}</Typography></Grid>}
            {importedZViewKeyResult && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Import Result:</Typography>
                {renderJsonTextField("", JSON.stringify(importedZViewKeyResult, null, 2), () => {}, "", {InputProps:{readOnly:true, sx:{backgroundColor:'#1e1e1e'}}})}
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* getnewaddress */}
      <Accordion expanded={expandedKeySection === 'getnewaddress'} onChange={handleAccordionChange('getnewaddress')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get New T-Address</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Button onClick={handleGetNewAddress} variant="contained" disabled={getNewAddressLoading} fullWidth>
                {getNewAddressLoading ? <CircularProgress size={24} /> : "Generate New T-Address"}
              </Button>
            </Grid>
             <Grid item xs={12} md={4} sx={{display:'flex', justifyContent:'flex-end'}}>
                <Tooltip title="Clear Result">
                    <IconButton onClick={clearGetNewAddressFields} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ClearIcon /> </IconButton>
                </Tooltip>
            </Grid>
            {getNewAddressError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getNewAddressError}</Typography></Grid>}
            {newTAddress && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>New T-Address:</Typography>
                <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{newTAddress}</Typography>
                    <Tooltip title="Copy T-Address">
                      <IconButton onClick={() => handleCopy(newTAddress)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* z_getnewaddress */}
      <Accordion expanded={expandedKeySection === 'z_getnewaddress'} onChange={handleAccordionChange('z_getnewaddress')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get New Z-Address</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="newzaddresstype-label" sx={{fontSize:'0.8rem', color:'#ccc'}}>Address Type</InputLabel>
                <Select labelId="newzaddresstype-label" value={newZAddressType} label="Address Type" onChange={(e) => setNewZAddressType(e.target.value)} sx={{fontSize:'0.8rem',color:'white', '& .MuiSelect-icon':{color:'white'}, '& .MuiOutlinedInput-notchedOutline': {borderColor: '#555'}, '&:hover .MuiOutlinedInput-notchedOutline': {borderColor: '#777'}}}>
                  <MenuItem value="sapling" sx={{fontSize:'0.8rem'}}>Sapling (default)</MenuItem>
                  <MenuItem value="sprout" sx={{fontSize:'0.8rem'}}>Sprout (legacy)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <Button onClick={handleGetNewZAddress} variant="contained" disabled={getNewZAddressLoading} fullWidth>
                {getNewZAddressLoading ? <CircularProgress size={24} /> : "Generate New Z-Address"}
              </Button>
            </Grid>
            <Grid item xs={12} md={3} sx={{display:'flex', justifyContent:'flex-end'}}>
                <Tooltip title="Clear Result">
                    <IconButton onClick={clearGetNewZAddressFields} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ClearIcon /> </IconButton>
                </Tooltip>
            </Grid>
            {getNewZAddressError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getNewZAddressError}</Typography></Grid>}
            {newZAddress && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>New Z-Address ({newZAddressType}):</Typography>
                <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{newZAddress}</Typography>
                    <Tooltip title="Copy Z-Address">
                      <IconButton onClick={() => handleCopy(newZAddress)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* convertpassphrase */}
      <Accordion expanded={expandedKeySection === 'convertpassphrase'} onChange={handleAccordionChange('convertpassphrase')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Convert Passphrase to Hex</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>{renderTextField("Passphrase", convertPassphraseInput, setConvertPassphraseInput, "password", "Enter passphrase to convert.")}</Grid>
            <Grid item xs={12} md={4}>
              <Button onClick={handleConvertPassphrase} variant="contained" disabled={convertPassphraseLoading} fullWidth>
                {convertPassphraseLoading ? <CircularProgress size={24} /> : "Convert to Hex"}
              </Button>
            </Grid>
            {convertPassphraseError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{convertPassphraseError}</Typography></Grid>}
            {convertPassphraseResult && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Conversion Result:</Typography>
                 <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{JSON.stringify(convertPassphraseResult)}</Typography>
                    <Tooltip title="Copy Result">
                      <IconButton onClick={() => handleCopy(JSON.stringify(convertPassphraseResult))} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* getrawchangeaddress */}
      <Accordion expanded={expandedKeySection === 'getrawchangeaddress'} onChange={handleAccordionChange('getrawchangeaddress')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Get Raw Change Address</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
           <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Button onClick={handleGetRawChangeAddress} variant="contained" disabled={getRawChangeAddressLoading} fullWidth>
                {getRawChangeAddressLoading ? <CircularProgress size={24} /> : "Get Change Address"}
              </Button>
            </Grid>
             <Grid item xs={12} md={4} sx={{display:'flex', justifyContent:'flex-end'}}>
                <Tooltip title="Clear Result">
                    <IconButton onClick={clearGetRawChangeAddressFields} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ClearIcon /> </IconButton>
                </Tooltip>
            </Grid>
            {getRawChangeAddressError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{getRawChangeAddressError}</Typography></Grid>}
            {rawChangeAddress && (
              <Grid item xs={12}>
                <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Raw Change Address:</Typography>
                 <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                    <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{rawChangeAddress}</Typography>
                    <Tooltip title="Copy Address">
                      <IconButton onClick={() => handleCopy(rawChangeAddress)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                    </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* encryptwallet */}
      <Accordion expanded={expandedKeySection === 'encryptwallet'} onChange={handleAccordionChange('encryptwallet')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Encrypt Wallet</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>{renderTextField("Passphrase", encryptWalletPassphrase, setEncryptWalletPassphrase, "password", "Enter a new passphrase to encrypt the wallet.")}</Grid>
            <Grid item xs={12} md={4}>
              <Button onClick={handleEncryptWallet} variant="contained" disabled={encryptWalletLoading} fullWidth>
                {encryptWalletLoading ? <CircularProgress size={24} /> : "Encrypt Wallet"}
              </Button>
            </Grid>
            {encryptWalletError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{encryptWalletError}</Typography></Grid>}
            {encryptWalletSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{encryptWalletSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* walletpassphrase */}
      <Accordion expanded={expandedKeySection === 'walletpassphrase'} onChange={handleAccordionChange('walletpassphrase')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Unlock Wallet (walletpassphrase)</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>{renderTextField("Passphrase", walletPassphrase, setWalletPassphrase, "password")}</Grid>
            <Grid item xs={12} sm={5}>{renderTextField("Timeout (seconds)", walletPassphraseTimeout, setWalletPassphraseTimeout, "number")}</Grid>
            <Grid item xs={12}>
              <Button onClick={handleWalletPassphrase} variant="contained" disabled={walletPassphraseLoading} fullWidth>
                {walletPassphraseLoading ? <CircularProgress size={24} /> : "Unlock Wallet"}
              </Button>
            </Grid>
            {walletPassphraseError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{walletPassphraseError}</Typography></Grid>}
            {walletPassphraseSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{walletPassphraseSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* walletpassphrasechange */}
      <Accordion expanded={expandedKeySection === 'walletpassphrasechange'} onChange={handleAccordionChange('walletpassphrasechange')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Change Wallet Passphrase</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>{renderTextField("Old Passphrase", oldWalletPassphrase, setOldWalletPassphrase, "password")}</Grid>
            <Grid item xs={12} md={6}>{renderTextField("New Passphrase", newWalletPassphrase, setNewWalletPassphrase, "password")}</Grid>
            <Grid item xs={12}>
              <Button onClick={handleWalletPassphraseChange} variant="contained" disabled={walletPassphraseChangeLoading} fullWidth>
                {walletPassphraseChangeLoading ? <CircularProgress size={24} /> : "Change Passphrase"}
              </Button>
            </Grid>
            {walletPassphraseChangeError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{walletPassphraseChangeError}</Typography></Grid>}
            {walletPassphraseChangeSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{walletPassphraseChangeSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* walletlock */}
      <Accordion expanded={expandedKeySection === 'walletlock'} onChange={handleAccordionChange('walletlock')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
          <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Lock Wallet</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Button onClick={handleWalletLock} variant="contained" color="warning" disabled={walletLockLoading} fullWidth>
                {walletLockLoading ? <CircularProgress size={24} /> : "Lock Wallet"}
              </Button>
            </Grid>
            {walletLockError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{walletLockError}</Typography></Grid>}
            {walletLockSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{walletLockSuccess}</Typography></Grid>}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default KeyManagementPanel; 