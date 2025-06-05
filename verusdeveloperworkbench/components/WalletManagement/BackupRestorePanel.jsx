import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, TextField, Tooltip, IconButton, Checkbox, FormControlLabel, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NodeContext } from '../../contexts/NodeContext';
import { TerminalContext } from '../../contexts/TerminalContext';

// Helper rendering functions - consider moving to a shared utils file if used across multiple panels
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

const handleCopy = (textToCopy) => {
    if (textToCopy === undefined || textToCopy === null) return;
    navigator.clipboard.writeText(String(textToCopy));
  };

const BackupRestorePanel = ({ isActive }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const [expandedBackupRestoreSection, setExpandedBackupRestoreSection] = useState('backupwallet');

  // State for backupwallet
  const [backupWalletFilename, setBackupWalletFilename] = useState('');
  const [backupWalletLoading, setBackupWalletLoading] = useState(false);
  const [backupWalletError, setBackupWalletError] = useState('');
  const [backupWalletResult, setBackupWalletResult] = useState('');

  // State for dumpwallet
  const [dumpWalletFilename, setDumpWalletFilename] = useState('');
  const [dumpWalletOmitEmpty, setDumpWalletOmitEmpty] = useState(false);
  const [dumpWalletLoading, setDumpWalletLoading] = useState(false);
  const [dumpWalletError, setDumpWalletError] = useState('');
  const [dumpWalletResult, setDumpWalletResult] = useState('');

  // State for importwallet
  const [importWalletFilename, setImportWalletFilename] = useState('');
  const [importWalletLoading, setImportWalletLoading] = useState(false);
  const [importWalletError, setImportWalletError] = useState('');
  const [importWalletSuccess, setImportWalletSuccess] = useState('');

  // State for z_exportwallet
  const [zExportWalletFilename, setZExportWalletFilename] = useState('');
  const [zExportWalletOmitEmpty, setZExportWalletOmitEmpty] = useState(false);
  const [zExportWalletLoading, setZExportWalletLoading] = useState(false);
  const [zExportWalletError, setZExportWalletError] = useState('');
  const [zExportWalletResult, setZExportWalletResult] = useState('');

  // State for z_importwallet
  const [zImportWalletFilename, setZImportWalletFilename] = useState('');
  const [zImportWalletLoading, setZImportWalletLoading] = useState(false);
  const [zImportWalletError, setZImportWalletError] = useState('');
  const [zImportWalletSuccess, setZImportWalletSuccess] = useState('');

  const handleBackupRestoreAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedBackupRestoreSection(isExpanded ? panel : false);
  };

  const clearBackupWalletFields = () => {
    setBackupWalletFilename('');
    setBackupWalletError('');
    setBackupWalletResult('');
  };
  const clearDumpWalletFields = () => {
    setDumpWalletFilename('');
    setDumpWalletOmitEmpty(false);
    setDumpWalletError('');
    setDumpWalletResult('');
  };
  const clearImportWalletFields = () => {
    setImportWalletFilename('');
    setImportWalletError('');
    setImportWalletSuccess('');
  };
  const clearZExportWalletFields = () => {
    setZExportWalletFilename('');
    setZExportWalletOmitEmpty(false);
    setZExportWalletError('');
    setZExportWalletResult('');
  };
  const clearZImportWalletFields = () => {
    setZImportWalletFilename('');
    setZImportWalletError('');
    setZImportWalletSuccess('');
  };
  
  const clearAllBackupRestoreFields = () => {
    clearBackupWalletFields();
    clearDumpWalletFields();
    clearImportWalletFields();
    clearZExportWalletFields();
    clearZImportWalletFields();
  };

  useEffect(() => {
    if (!isActive) {
      clearAllBackupRestoreFields();
    }
  }, [isActive]);

  const handleBackupWallet = async () => {
    if (!backupWalletFilename.trim()) {
      setBackupWalletError('Filename is required.');
      return;
    }
    setBackupWalletLoading(true);
    setBackupWalletError('');
    setBackupWalletResult('');
    const cmd = 'backupwallet';
    const params = [backupWalletFilename.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setBackupWalletResult(result.path || 'Backup successful. No path returned.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setBackupWalletError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setBackupWalletLoading(false);
    }
  };

  const handleDumpWallet = async () => {
    if (!dumpWalletFilename.trim()) {
      setDumpWalletError('Filename is required.');
      return;
    }
    setDumpWalletLoading(true);
    setDumpWalletError('');
    setDumpWalletResult('');
    const cmd = 'dumpwallet';
    const params = [dumpWalletFilename.trim()];
    if (dumpWalletOmitEmpty) params.push(true);

    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setDumpWalletResult(result.filename || 'Dump successful. No path returned.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setDumpWalletError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setDumpWalletLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importWalletFilename.trim()) {
      setImportWalletError('Filename is required.');
      return;
    }
    setImportWalletLoading(true);
    setImportWalletError('');
    setImportWalletSuccess('');
    const cmd = 'importwallet';
    const params = [importWalletFilename.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params);
      setImportWalletSuccess('Wallet imported successfully. Wallet may rescan.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setImportWalletError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setImportWalletLoading(false);
    }
  };
  
  const handleZExportWallet = async () => {
    if (!zExportWalletFilename.trim()) {
      setZExportWalletError('Filename is required.');
      return;
    }
    setZExportWalletLoading(true);
    setZExportWalletError('');
    setZExportWalletResult('');
    const cmd = 'z_exportwallet';
    const params = [zExportWalletFilename.trim()];
    if (zExportWalletOmitEmpty) params.push(true);
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      const result = await sendCommand(cmd, params);
      setZExportWalletResult(result.filename || 'Z-Wallet exported successfully.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: result, status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZExportWalletError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setZExportWalletLoading(false);
    }
  };

  const handleZImportWallet = async () => {
    if (!zImportWalletFilename.trim()) {
      setZImportWalletError('Filename is required.');
      return;
    }
    setZImportWalletLoading(true);
    setZImportWalletError('');
    setZImportWalletSuccess('');
    const cmd = 'z_importwallet';
    const params = [zImportWalletFilename.trim()];
    if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, status: 'executing', type: 'wallet'});
    try {
      await sendCommand(cmd, params);
      setZImportWalletSuccess('Z-Wallet imported successfully. Wallet may rescan.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: 'Success', status: 'success', type: 'wallet'});
    } catch (err) {
      console.error(`Error in ${cmd}:`, err);
      setZImportWalletError(err.message || `Failed to ${cmd}.`);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: cmd, params: params, result: err.message || `Failed to ${cmd}.`, status: 'error', type: 'wallet'});
    } finally {
      setZImportWalletLoading(false);
    }
  };

  return (
    <Box>
        {/* backupwallet */}
        <Accordion expanded={expandedBackupRestoreSection === 'backupwallet'} onChange={handleBackupRestoreAccordionChange('backupwallet')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
                <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Backup Wallet</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>{renderTextField("Filename or Path", backupWalletFilename, setBackupWalletFilename, "text", "e.g., walletbackup.dat or /path/to/walletbackup.dat")}</Grid>
                    <Grid item xs={12} md={4}>
                        <Button onClick={handleBackupWallet} variant="contained" disabled={backupWalletLoading} fullWidth>
                            {backupWalletLoading ? <CircularProgress size={24} /> : "Backup Wallet"}
                        </Button>
                    </Grid>
                    {backupWalletError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{backupWalletError}</Typography></Grid>}
                    {backupWalletResult && 
                        <Grid item xs={12}>
                            <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Result:</Typography>
                            <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                                <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{backupWalletResult}</Typography>
                                <Tooltip title="Copy Path">
                                    <IconButton onClick={() => handleCopy(backupWalletResult)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>

        {/* dumpwallet */}
        <Accordion expanded={expandedBackupRestoreSection === 'dumpwallet'} onChange={handleBackupRestoreAccordionChange('dumpwallet')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
                <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Dump Wallet (Human Readable)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>{renderTextField("Filename or Path", dumpWalletFilename, setDumpWalletFilename, "text", "e.g., walletdump.txt or /path/to/walletdump.txt")}</Grid>
                    <Grid item xs={12} md={2} sx={{display:'flex', alignItems:'center'}}>
                        <FormControlLabel control={<Checkbox checked={dumpWalletOmitEmpty} onChange={(e) => setDumpWalletOmitEmpty(e.target.checked)} sx={{color:'#aaa'}}/>} label="Omit Empty" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button onClick={handleDumpWallet} variant="contained" disabled={dumpWalletLoading} fullWidth>
                            {dumpWalletLoading ? <CircularProgress size={24} /> : "Dump Wallet"}
                        </Button>
                    </Grid>
                    {dumpWalletError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{dumpWalletError}</Typography></Grid>}
                    {dumpWalletResult && 
                        <Grid item xs={12}>
                            <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Result:</Typography>
                            <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                                <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{dumpWalletResult}</Typography>
                                <Tooltip title="Copy Path">
                                    <IconButton onClick={() => handleCopy(dumpWalletResult)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>

        {/* importwallet */}
        <Accordion expanded={expandedBackupRestoreSection === 'importwallet'} onChange={handleBackupRestoreAccordionChange('importwallet')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
                <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Import Wallet (from backup or dump)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>{renderTextField("Filename or Path", importWalletFilename, setImportWalletFilename, "text", "e.g., wallet.dat or /path/to/wallet.dat")}</Grid>
                    <Grid item xs={12} md={4}>
                        <Button onClick={handleImportWallet} variant="contained" disabled={importWalletLoading} fullWidth>
                            {importWalletLoading ? <CircularProgress size={24} /> : "Import Wallet"}
                        </Button>
                    </Grid>
                    {importWalletError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{importWalletError}</Typography></Grid>}
                    {importWalletSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{importWalletSuccess}</Typography></Grid>}
                </Grid>
            </AccordionDetails>
        </Accordion>

        {/* z_exportwallet */}
            <Accordion expanded={expandedBackupRestoreSection === 'z_exportwallet'} onChange={handleBackupRestoreAccordionChange('z_exportwallet')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
                <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Export Z Wallet</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>{renderTextField("Filename or Path", zExportWalletFilename, setZExportWalletFilename, "text", "e.g., zwallet.dat")}</Grid>
                    <Grid item xs={12} md={2} sx={{display:'flex', alignItems:'center'}}>
                        <FormControlLabel control={<Checkbox checked={zExportWalletOmitEmpty} onChange={(e) => setZExportWalletOmitEmpty(e.target.checked)} sx={{color:'#aaa'}}/>} label="Omit Empty" sx={{color:'#ddd', '& .MuiTypography-root': {fontSize: '0.8rem'}}}/>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button onClick={handleZExportWallet} variant="contained" disabled={zExportWalletLoading} fullWidth>
                            {zExportWalletLoading ? <CircularProgress size={24} /> : "Export Z Wallet"}
                        </Button>
                    </Grid>
                    {zExportWalletError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zExportWalletError}</Typography></Grid>}
                    {zExportWalletResult && 
                        <Grid item xs={12}>
                            <Typography variant="caption" display="block" sx={{color:'#aaa'}}>Result:</Typography>
                                <Box sx={{display:'flex', alignItems:'center', bgcolor:'#1e1e1e', p:1, borderRadius:1}}>
                                <Typography sx={{wordBreak:'break-all', flexGrow:1, fontSize:'0.8rem'}}>{zExportWalletResult}</Typography>
                                <Tooltip title="Copy Path">
                                    <IconButton onClick={() => handleCopy(zExportWalletResult)} size="small" sx={{color:'#aaa', '&:hover':{color:'white'}}}> <ContentCopyIcon fontSize="small" /> </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>

        {/* z_importwallet */}
        <Accordion expanded={expandedBackupRestoreSection === 'z_importwallet'} onChange={handleBackupRestoreAccordionChange('z_importwallet')} sx={{ bgcolor: '#333', color: 'white', mb:1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>} sx={{ '&.Mui-expanded': { minHeight: 48, height: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' } }}>
                <Typography sx={{fontSize: '0.9rem', fontWeight:'500'}}>Import Z Wallet</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{bgcolor: '#2a2a2a', p:2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>{renderTextField("Filename or Path", zImportWalletFilename, setZImportWalletFilename, "text", "e.g., zwallet.dat")}</Grid>
                    <Grid item xs={12} md={4}>
                        <Button onClick={handleZImportWallet} variant="contained" disabled={zImportWalletLoading} fullWidth>
                            {zImportWalletLoading ? <CircularProgress size={24} /> : "Import Z Wallet"}
                        </Button>
                    </Grid>
                    {zImportWalletError && <Grid item xs={12}><Typography color="error" sx={{fontSize: '0.75rem'}}>{zImportWalletError}</Typography></Grid>}
                    {zImportWalletSuccess && <Grid item xs={12}><Typography color="primary.light" sx={{fontSize: '0.75rem'}}>{zImportWalletSuccess}</Typography></Grid>}
                </Grid>
            </AccordionDetails>
        </Accordion>
    </Box>
  );
};

export default BackupRestorePanel; 