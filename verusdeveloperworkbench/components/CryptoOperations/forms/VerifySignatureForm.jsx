import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Select,
  MenuItem,
  TextField,
  Grid,
  Switch,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';
import { WorkbenchDataContext } from '../../../contexts/WorkbenchDataContext';
import { NodeContext } from '../../../contexts/NodeContext';

// Styled components (assuming defined or imported)
const StyledPaper = styled(Paper)(({ theme }) => ({ padding: theme.spacing(3), margin: theme.spacing(2, 0), background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }));
const StyledFormLabel = styled(FormLabel)({ color: '#c5c5c5', marginBottom: '4px', display: 'block' });
const StyledInput = styled(Input)({ color: '#fff', background: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', padding: '8px', width: '100%', '&::placeholder': { color: '#777' }, '&:hover': { borderColor: '#666' }, '&.Mui-focused': { borderColor: '#90caf9' } });
const StyledSelect = styled(Select)({ color: '#fff', background: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', width: '100%', '& .MuiSelect-icon': { color: '#c5c5c5' } });
const StyledTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': { color: '#fff', background: '#2a2a2a', borderRadius: '4px', '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#666' }, '&.Mui-focused fieldset': { borderColor: '#90caf9' }, '& textarea::placeholder': { color: '#777' } },
  '& .MuiInputLabel-root': { color: '#c5c5c5' }, '& .MuiInputLabel-root.Mui-focused': { color: '#90caf9' },
});

const DATA_SOURCE_TYPES_VERIFY = [
  { value: 'message', label: 'Message (Text)' },
  { value: 'filename', label: 'File Path' },
  { value: 'messagehex', label: 'Hex-encoded Data' },
  { value: 'messagebase64', label: 'Base64-encoded Data' },
  { value: 'datahash', label: 'Pre-calculated Hash (Hex)' },
];
const HASH_TYPES = ['sha256', 'sha256D', 'blake2b', 'keccak256'];

const VerifySignatureForm = ({ onCommandResponse, onCommandError }) => {
  const { addCryptoOperation } = useContext(WorkbenchDataContext) || {};
  const { sendCommand } = useContext(NodeContext);

  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [dataSourceType, setDataSourceType] = useState('message');
  const [dataSourceValue, setDataSourceValue] = useState('');
  
  const [prefixString, setPrefixString] = useState('');
  const [checkLatest, setCheckLatest] = useState(false);
  const [hashType, setHashType] = useState('sha256');
  const [vdxfKeys, setVdxfKeys] = useState(['']);
  const [vdxfKeyNames, setVdxfKeyNames] = useState(['']);
  const [boundHashes, setBoundHashes] = useState(['']);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // Can be boolean (true) or error object / false

  // Dynamic list handlers (similar to SignDataForm)
  const createListHandlers = (list, setList) => ({
    handleChange: (index, value) => { const u = [...list]; u[index] = value; setList(u); },
    add: () => setList([...list, '']),
    remove: (index) => { const u = list.filter((_, i) => i !== index); setList(u.length > 0 ? u : ['']); },
  });
  const vdxfKeysHandlers = createListHandlers(vdxfKeys, setVdxfKeys);
  const vdxfKeyNamesHandlers = createListHandlers(vdxfKeyNames, setVdxfKeyNames);
  const boundHashesHandlers = createListHandlers(boundHashes, setBoundHashes);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null); setIsLoading(true);
    if (!address.trim() || !signature.trim()) {
      setError('Address/Identity and Signature are required.'); setIsLoading(false); return;
    }
    const commandParams = { address: address.trim(), signature: signature.trim() };
    if (dataSourceValue.trim()) commandParams[dataSourceType] = dataSourceValue.trim();
    else { setError('A data source (Message, File, Hash, etc.) is required.'); setIsLoading(false); return; }

    if (prefixString.trim()) commandParams.prefixstring = prefixString.trim();
    if (hashType !== 'sha256') commandParams.hashtype = hashType;
    if (checkLatest) commandParams.checklatest = true;

    const filledVdxfKeys = vdxfKeys.map(s => s.trim()).filter(Boolean);
    if (filledVdxfKeys.length > 0) commandParams.vdxfkeys = filledVdxfKeys;
    const filledVdxfKeyNames = vdxfKeyNames.map(s => s.trim()).filter(Boolean);
    if (filledVdxfKeyNames.length > 0) commandParams.vdxfkeynames = filledVdxfKeyNames;
    const filledBoundHashes = boundHashes.map(s => s.trim()).filter(Boolean);
    if (filledBoundHashes.length > 0) commandParams.boundhashes = filledBoundHashes;

    const verifyingAddress = address.trim(); // For logging key

    try {
      const commandResult = await sendCommand('verifysignature', [commandParams], 'verifysignature');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'verifysignature');

      if (addCryptoOperation && verifyingAddress) {
        const resultToStore = {
          operation: 'verifysignature', 
          signer: verifyingAddress, // Keyed by the address whose signature is being verified against
          params: commandParams, 
          result: commandResult, // This will be true, false, or an error object from RPC
          status: (commandResult === true || (typeof commandResult === 'object' && commandResult.result === true)) ? 'Success (Verified)' : 'Error/Failed',
          timestamp: new Date().toISOString()
        };
        addCryptoOperation(resultToStore);
      } else {
        console.warn('[VerifySignatureForm] Could not save crypto operation result: missing addCryptoOperation or verifyingAddress.');
      }

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      setResult({ error: errorMessage }); // Ensure result reflects error for UI
      if (onCommandError) onCommandError(errorMessage, 'verifysignature');

      if (addCryptoOperation && verifyingAddress) {
        addCryptoOperation({
          operation: 'verifysignature',
          signer: verifyingAddress,
          params: commandParams,
          error: errorMessage,
          status: 'Error',
          timestamp: new Date().toISOString()
        });
      }
    } finally { setIsLoading(false); }
  };

  const resetForm = () => {
    setAddress(''); setSignature(''); setDataSourceType('message'); setDataSourceValue('');
    setPrefixString(''); setCheckLatest(false); setHashType('sha256');
    setVdxfKeys(['']); setVdxfKeyNames(['']); setBoundHashes(['']);
    setError(''); setResult(null); setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Verify Signature (Advanced)</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>General purpose signature verification for various content types.</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Address or Identity that Signed *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="R-address or Identity@"
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Signature (Base64) *"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Base64 encoded signature"
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Data Source Type *"
          value={dataSourceType}
          onChange={(e) => { setDataSourceType(e.target.value); setDataSourceValue(''); }}
          select
          required
          fullWidth
          size="small"
        >
            {DATA_SOURCE_TYPES_VERIFY.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>

        <TextField
          label={DATA_SOURCE_TYPES_VERIFY.find(d=>d.value===dataSourceType)?.label || 'Data Source Value' + " *"}
          value={dataSourceValue}
          onChange={(e) => setDataSourceValue(e.target.value)}
          placeholder={`Enter ${DATA_SOURCE_TYPES_VERIFY.find(d=>d.value===dataSourceType)?.label.toLowerCase() || 'value'}`}
          multiline={dataSourceType === 'message'}
          rows={dataSourceType === 'message' ? 3 : 1}
          required
          fullWidth
          size="small"
        />
        {dataSourceType === 'filename' && <Typography variant="caption" sx={{ color: '#999', mt: -1.5 }}>Note: The Verus daemon must have access to this file path.</Typography>}
        
        <Accordion sx={{background: '#232323', border: '1px solid #444', mt:1, color: '#fff'}}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: '#fff'}}/>}><Typography sx={{color: '#90caf9', fontWeight:'bold'}}>Optional Verification Parameters</Typography></AccordionSummary>
            <AccordionDetails sx={{display:'flex', flexDirection:'column', gap:2}}>
                <TextField
                  label="Prefix String (optional)"
                  value={prefixString}
                  onChange={(e) => setPrefixString(e.target.value)}
                  placeholder="Extra string used during signing"
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Hash Type (default: sha256)"
                  value={hashType}
                  onChange={(e) => setHashType(e.target.value)}
                  select
                  fullWidth
                  size="small"
                >
                  {HASH_TYPES.map(ht => <MenuItem key={ht} value={ht}>{ht}</MenuItem>)}
                </TextField>
                
                <FormControlLabel control={<Switch checked={checkLatest} onChange={(e) => setCheckLatest(e.target.checked)} color="primary"/>} label="Check Signature Against Latest Identity State" sx={{color: 'text.secondary'}}/>
                
                {[ {title: 'VDXF Keys', ph: 'VDXF Key (i-address or name)', list: vdxfKeys, handlers: vdxfKeysHandlers}, {title: 'VDXF Key Names', ph: 'VDXF Key Name', list: vdxfKeyNames, handlers: vdxfKeyNamesHandlers}, {title: 'Bound Hashes', ph: 'Bound Hash (hex)', list: boundHashes, handlers: boundHashesHandlers} ].map(group => (
                    <Box key={group.title} sx={{mt:1}}>
                        <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight:'bold', mb:1 }}>{group.title} (Optional)</Typography>
                        {group.list.map((item, index) => (
                            <Grid container spacing={1} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                                <Grid item xs={11}>
                                  <TextField
                                    label={`${group.title.slice(0,-1)} ${index + 1}`}
                                    value={item}
                                    onChange={(e) => group.handlers.handleChange(index, e.target.value)}
                                    placeholder={`Enter ${group.ph.toLowerCase()}`}
                                    fullWidth
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={1} sx={{textAlign:'right'}}>
                                  <IconButton onClick={() => group.handlers.remove(index)} size="small" disabled={group.list.length === 1 && !item.trim()} sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Button startIcon={<AddCircleOutlineIcon/>} variant="outlined" onClick={group.handlers.add} size="small" sx={{alignSelf:'flex-start'}}>Add {group.title.slice(0,-1)}</Button>
                    </Box>
                ))}
            </AccordionDetails>
        </Accordion>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {result && (
          <Alert 
            severity={result && !result.error ? 'success' : 'error'} 
            sx={{ mt: 1, mb: 1, overflowWrap: 'break-word' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Verification Outcome: {result && !result.error ? 'SIGNATURE VALID (as per parameters)' : 'SIGNATURE INVALID or ERROR'}</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#232323', p:1, borderRadius:1, color:'#fff', mt:1 }}>{JSON.stringify(result, null, 2)}</pre>
          </Alert>
        )}
        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Verify Signature</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default VerifySignatureForm; 