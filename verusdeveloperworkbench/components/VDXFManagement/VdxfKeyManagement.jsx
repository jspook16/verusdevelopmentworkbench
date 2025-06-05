import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save'; // For potential save/load buttons
import FileOpenIcon from '@mui/icons-material/FolderOpen'; // For potential load button
import { styled } from '@mui/system';
import { NodeContext } from '../../contexts/NodeContext'; // To use sendCommand
import { TerminalContext } from '../../contexts/TerminalContext'; // To use appendToTerminal, getCommandType

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  background: '#232323', // Slightly lighter than main panel for contrast
  border: '1px solid #333',
  borderRadius: '8px',
}));

const StyledFormLabel = styled(FormLabel)({ color: '#c5c5c5', marginBottom: '4px', display: 'block' });
const StyledInput = styled(Input)({
  color: '#fff',
  background: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '4px',
  padding: '8px',
  width: '100%',
  '&::placeholder': { color: '#777' },
  '&:hover': { borderColor: '#666' },
  '&.Mui-focused': { borderColor: '#90caf9' },
});

const VdxfKeyManagement = () => {
  const { sendCommand } = useContext(NodeContext) || {};
  const { appendToTerminal, getCommandType } = useContext(TerminalContext) || {};

  const [vdxfUri, setVdxfUri] = useState('');
  const [parentVdxfKey, setParentVdxfKey] = useState('');
  const [uint256, setUint256] = useState('');
  const [indexNum, setIndexNum] = useState('');
  
  const [createdVdxfKeys, setCreatedVdxfKeys] = useState([]);
  const [error, setError] = useState('');
  // No direct result display here, results go to terminal

  // Load saved VDXF keys on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('vdxfKeysWorkbench'); // Use a different key to avoid conflict with old App.jsx state
    if (savedKeys) {
      setCreatedVdxfKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Save VDXF keys whenever they change
  useEffect(() => {
    localStorage.setItem('vdxfKeysWorkbench', JSON.stringify(createdVdxfKeys));
  }, [createdVdxfKeys]);

  const handleCreateVdxfKey = async (e) => {
    e.preventDefault();
    setError('');
    if (!vdxfUri.trim()) {
      setError('VDXF URI is required.');
      return;
    }
    if (uint256.trim() && !/^[0-9a-fA-F]{64}$/.test(uint256.trim())) {
      setError('uint256 must be a 32-byte hex string (64 hexadecimal characters).');
      return;
    }

    const extraparams = {};
    if (parentVdxfKey.trim()) extraparams.vdxfkey = parentVdxfKey.trim();
    if (uint256.trim()) extraparams.uint256 = uint256.trim();
    if (indexNum.trim()) extraparams.indexnum = parseInt(indexNum, 10);

    try {
      if (!sendCommand) {
        setError('Required context functions not available.');
        return;
      }
      const result = await sendCommand('getvdxfid', [vdxfUri.trim(), extraparams], 'vdxf');
      
      if (result && !result.error) {
        setCreatedVdxfKeys(prevKeys => [{
          timestamp: new Date().toISOString(),
          uri: vdxfUri.trim(),
          result: result,
          extraparams: extraparams
        }, ...prevKeys].slice(0, 50));
        setVdxfUri('');
        setParentVdxfKey('');
        setUint256('');
        setIndexNum('');
      } else if (result && result.error) {
        setError(result.error.message || 'Error creating VDXF key.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create VDXF key.');
      console.error("[VdxfKeyManagement] Error during sendCommand:", err);
    }
  };

  const handleDeleteVdxfKey = (index) => {
    setCreatedVdxfKeys(prevKeys => prevKeys.filter((_, i) => i !== index));
  };

  const handleCopyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (err) { console.error('Failed to copy:', err); }
  };

  const handleSaveKeysToFile = async () => { 
    setError('');
    try {
      // Use the existing IPC channel from main.js
      const result = await window.electron.ipcRenderer.invoke('save-vdxf-keys', createdVdxfKeys);
      if (result && result.error) {
        setError(result.error);
      } else if (result && result.success) {
        // Optionally show a success message or clear error
        console.log('VDXF Keys saved successfully.');
      }
    } catch (ipcError) {
      console.error('Error invoking save-vdxf-keys:', ipcError);
      setError('Failed to save VDXF keys to file.');
    }
  };

  const handleLoadKeysFromFile = async () => { 
    setError('');
    try {
      // Use the existing IPC channel from main.js
      const result = await window.electron.ipcRenderer.invoke('load-vdxf-keys');
      if (result && result.error) {
        setError(result.error);
      } else if (result && result.keys) {
        setCreatedVdxfKeys(result.keys);
        console.log('VDXF Keys loaded successfully.');
      }
    } catch (ipcError) {
      console.error('Error invoking load-vdxf-keys:', ipcError);
      setError('Failed to load VDXF keys from file.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <StyledPaper 
        component="section" 
        sx={{
          flexShrink: 0, 
          m: 0, // Remove margin for this instance
          p: 0  // Remove padding for this instance
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0, mb:0 /* Adjusted mb */ }}>
          Create VDXF Key
        </Typography>
        <Box 
          component="form" 
          onSubmit={handleCreateVdxfKey} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5, 
            p: 2 // Add padding to the form area
          }}
        >
          <StyledInput 
            value={vdxfUri} 
            onChange={e => setVdxfUri(e.target.value)} 
            placeholder="VDXF URI (e.g. system.currency.export) *" 
            required 
          />
          <StyledInput 
            value={parentVdxfKey} 
            onChange={e => setParentVdxfKey(e.target.value)} 
            placeholder="Parent VDXF Key (optional i-address)" 
          />
          <StyledInput 
            value={uint256} 
            onChange={e => setUint256(e.target.value)} 
            placeholder="uint256 (optional 32-byte hex)" 
          />
          <StyledInput 
            type="number" 
            value={indexNum} 
            onChange={e => setIndexNum(e.target.value)} 
            placeholder="Index Number (optional integer)" 
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>Create VDXF Key</Button>
          {error && <Alert severity="error" sx={{mt:1}} onClose={() => setError('')}>{error}</Alert>}
        </Box>
      </StyledPaper>

      <StyledPaper component="section" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY:'hidden'}}>
        <Box sx={{display: 'flex', justifyContent:'space-between', alignItems:'center', mb:1}}>
            <Typography variant="h6" sx={{ color: '#fff'}}>Created VDXF Keys</Typography>
            <Box>
                <IconButton onClick={handleSaveKeysToFile} title="Save Keys to File" size="small" sx={{color: '#90caf9'}}><SaveIcon /></IconButton>
                <IconButton onClick={handleLoadKeysFromFile} title="Load Keys from File" size="small" sx={{color: '#90caf9', ml:1}}><FileOpenIcon /></IconButton>
            </Box>
        </Box>
        <Box sx={{flexGrow:1, overflowY:'auto', background: '#1c1c1c', p:1, borderRadius: '4px'}}>
            {createdVdxfKeys.length === 0 && <Typography sx={{color: '#777', fontStyle:'italic'}}>No VDXF keys created yet.</Typography>}
            <List dense>
            {createdVdxfKeys.map((keyItem, index) => (
                <ListItem key={keyItem.timestamp + index} divider sx={{borderBottomColor: '#3a3a3a', flexDirection:'column', alignItems:'flex-start', py:1}}>
                    <Box sx={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', mb:0.5}}>
                        <Typography sx={{ fontSize: '0.9rem', color: '#90caf9', fontFamily: 'monospace', wordBreak:'break-all' }}>{keyItem.uri}</Typography>
                        <IconButton size="small" onClick={() => handleDeleteVdxfKey(index)} sx={{color: '#f44336'}}><DeleteIcon fontSize="small"/></IconButton>
                    </Box>
                    <Box sx={{width:'100%', fontSize: '0.75rem', color:'#bbb', fontFamily:'monospace'}}>
                        <CopyableDetail label="VDXFID" value={keyItem.result.vdxfid} onCopy={handleCopyToClipboard}/>
                        <CopyableDetail label="hash160" value={keyItem.result.hash160result} onCopy={handleCopyToClipboard}/>
                        <CopyableDetail label="Parent Namespace" value={keyItem.result.qualifiedname?.namespace || keyItem.uri.split('.').slice(0, -1).join('.') || 'None'} onCopy={handleCopyToClipboard} showCopyIfValueIsNone={false}/>
                        {keyItem.extraparams && Object.entries(keyItem.extraparams).map(([pKey, pVal]) => pVal && <Typography key={pKey} sx={{fontSize:'inherit', color:'inherit'}}>{pKey}: {String(pVal)}</Typography>)}
                        <Typography sx={{fontSize:'0.7rem', color:'#666', mt:0.5}}>{new Date(keyItem.timestamp).toLocaleString()}</Typography>
                    </Box>
                </ListItem>
            ))}
            </List>
        </Box>
      </StyledPaper>
    </Box>
  );
};

const CopyableDetail = ({label, value, onCopy, showCopyIfValueIsNone = true}) => (
    <Box sx={{ display: 'flex', alignItems: 'center', my: '2px' }}>
        <Typography component="span" sx={{ fontWeight: '500', color: '#ccc', minWidth:'120px', fontSize:'inherit' }}>{label}:</Typography>
        <Typography component="span" sx={{ wordBreak: 'break-all', flexGrow: 1, fontSize:'inherit' }}>{value}</Typography>
        {(showCopyIfValueIsNone || value !== 'None') && 
         <IconButton onClick={() => onCopy(value)} size="small" sx={{ p: '2px', color: '#777', '&:hover': {color: '#90caf9'} }}><ContentCopyIcon sx={{fontSize:'1rem'}}/></IconButton>} 
    </Box>
);

export default VdxfKeyManagement; 