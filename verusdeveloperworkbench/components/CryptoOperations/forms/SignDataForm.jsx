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

// Styled components (assuming they are defined or imported from a shared file)
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  background: '#1e1e1e',
  border: '1px solid #333',
  borderRadius: '8px',
}));

const StyledFormLabel = styled(FormLabel)({
  color: '#c5c5c5',
  marginBottom: '4px',
  display: 'block',
});

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

const StyledSelect = styled(Select)({
  color: '#fff',
  background: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '4px',
  width: '100%',
  '& .MuiSelect-icon': { color: '#c5c5c5' },
});

const StyledTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    background: '#2a2a2a',
    borderRadius: '4px',
    '& fieldset': { borderColor: '#444' },
    '&:hover fieldset': { borderColor: '#666' },
    '&.Mui-focused fieldset': { borderColor: '#90caf9' },
    '& textarea::placeholder': { color: '#777' },
  },
  '& .MuiInputLabel-root': { color: '#c5c5c5' }, // For label within TextField
  '& .MuiInputLabel-root.Mui-focused': { color: '#90caf9' },
});

const DATA_SOURCE_TYPES = [
  { value: 'message', label: 'Message (Text)' },
  { value: 'filename', label: 'File Path' },
  { value: 'vdxfdata', label: 'VDXF Data (String)' },
  { value: 'messagehex', label: 'Hex-encoded Data' },
  { value: 'messagebase64', label: 'Base64-encoded Data' },
  { value: 'datahash', label: 'Pre-calculated Hash (Hex)' },
  { value: 'mmrdata', label: 'MMR Data Items (Array of messages)' },
];

const HASH_TYPES = ['sha256', 'sha256D', 'blake2b', 'keccak256'];

const SignDataForm = ({ onCommandResponse, onCommandError }) => {
  const { addCryptoOperation } = useContext(WorkbenchDataContext) || {};
  const { sendCommand } = useContext(NodeContext);

  const [address, setAddress] = useState('');
  const [dataSourceType, setDataSourceType] = useState('message');
  const [dataSourceValue, setDataSourceValue] = useState(''); // For simple text inputs
  const [mmrDataItems, setMmrDataItems] = useState(['']);
  const [mmrSaltItems, setMmrSaltItems] = useState(['']); // New: MMR Salts
  
  const [prefixString, setPrefixString] = useState('');
  const [currentSig, setCurrentSig] = useState('');
  const [hashType, setHashType] = useState('sha256'); // Overall hash type
  const [mmrHashType, setMmrHashType] = useState('blake2b'); // New: MMR specific hash type, defaults to blake2b per doc
  const [encryptToAddress, setEncryptToAddress] = useState('');
  const [createMMR, setCreateMMR] = useState(false);

  const [vdxfKeys, setVdxfKeys] = useState(['']); // New
  const [vdxfKeyNames, setVdxfKeyNames] = useState(['']); // New
  const [boundHashes, setBoundHashes] = useState(['']); // New

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleMmrItemChange = (index, value) => {
    const updated = [...mmrDataItems];
    updated[index] = value;
    setMmrDataItems(updated);
  };
  const addMmrItem = () => setMmrDataItems([...mmrDataItems, '']);
  const removeMmrItem = (index) => {
    const updated = mmrDataItems.filter((_, i) => i !== index);
    setMmrDataItems(updated.length > 0 ? updated : ['']);
  };

  // --- MMR Salt Handlers ---
  const handleMmrSaltItemChange = (index, value) => {
    const updated = [...mmrSaltItems];
    updated[index] = value;
    setMmrSaltItems(updated);
  };
  const addMmrSaltItem = () => setMmrSaltItems([...mmrSaltItems, '']);
  const removeMmrSaltItem = (index) => {
    const updated = mmrSaltItems.filter((_, i) => i !== index);
    setMmrSaltItems(updated.length > 0 ? updated : ['']);
  };

  // --- VDXF Keys Handlers ---
  const handleVdxfKeyChange = (index, value) => {
    const updated = [...vdxfKeys];
    updated[index] = value;
    setVdxfKeys(updated);
  };
  const addVdxfKey = () => setVdxfKeys([...vdxfKeys, '']);
  const removeVdxfKey = (index) => {
    const updated = vdxfKeys.filter((_, i) => i !== index);
    setVdxfKeys(updated.length > 0 ? updated : ['']);
  };
  
  // --- VDXF Key Names Handlers ---
  const handleVdxfKeyNameChange = (index, value) => {
    const updated = [...vdxfKeyNames];
    updated[index] = value;
    setVdxfKeyNames(updated);
  };
  const addVdxfKeyName = () => setVdxfKeyNames([...vdxfKeyNames, '']);
  const removeVdxfKeyName = (index) => {
    const updated = vdxfKeyNames.filter((_, i) => i !== index);
    setVdxfKeyNames(updated.length > 0 ? updated : ['']);
  };

  // --- Bound Hashes Handlers ---
  const handleBoundHashChange = (index, value) => {
    const updated = [...boundHashes];
    updated[index] = value;
    setBoundHashes(updated);
  };
  const addBoundHash = () => setBoundHashes([...boundHashes, '']);
  const removeBoundHash = (index) => {
    const updated = boundHashes.filter((_, i) => i !== index);
    setBoundHashes(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!address.trim()) {
      setError('Signing Address/Identity is required.');
      setIsLoading(false);
      return;
    }

    const commandParams = { address: address.trim() };

    if (prefixString.trim()) commandParams.prefixstring = prefixString.trim();
    if (currentSig.trim()) commandParams.signature = currentSig.trim();
    if (hashType !== 'sha256') commandParams.hashtype = hashType;
    if (encryptToAddress.trim()) commandParams.encrypttoaddress = encryptToAddress.trim();

    // VDXF Keys, Names, Bound Hashes (general options)
    const filledVdxfKeys = vdxfKeys.map(s => s.trim()).filter(Boolean);
    if (filledVdxfKeys.length > 0) commandParams.vdxfkeys = filledVdxfKeys;
    const filledVdxfKeyNames = vdxfKeyNames.map(s => s.trim()).filter(Boolean);
    if (filledVdxfKeyNames.length > 0) commandParams.vdxfkeynames = filledVdxfKeyNames;
    const filledBoundHashes = boundHashes.map(s => s.trim()).filter(Boolean);
    if (filledBoundHashes.length > 0) commandParams.boundhashes = filledBoundHashes;

    let dataProvided = false;
    if (dataSourceType === 'mmrdata') {
      const validMmrItems = mmrDataItems.filter(item => item.trim() !== '');
      if (validMmrItems.length > 0) {
        commandParams.mmrdata = validMmrItems.map(item => ({ message: item }));
        commandParams.createmmr = createMMR; // Only set if mmrdata is provided
        if (mmrHashType !== 'blake2b') commandParams.mmrhash = mmrHashType; // Default is blake2b for mmrhash
        const filledMmrSalts = mmrSaltItems.filter(s => s.trim() !== '');
        if (filledMmrSalts.length > 0) {
            if (filledMmrSalts.length !== validMmrItems.length) {
                setError('MMR Salts must match the number of MMR Data Items if provided.');
                setIsLoading(false);
                return;
            }
            commandParams.mmrsalt = filledMmrSalts;
        }
        dataProvided = true;
      } else if (createMMR) {
        setError('MMR Data Items cannot be empty when Create MMR is enabled.');
        setIsLoading(false);
        return;
      }
    } else if (dataSourceValue.trim()) {
      commandParams[dataSourceType] = dataSourceValue.trim();
      dataProvided = true;
    }

    if (!dataProvided) {
      setError('A data source (e.g., Message, File Path, Hash) is required.');
      setIsLoading(false);
      return;
    }
    
    const signingAddress = address.trim(); // For logging key

    try {
      const commandResult = await sendCommand('signdata', [commandParams], 'signdata');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'signdata');

      if (addCryptoOperation && signingAddress) {
        if (commandResult && !commandResult.error) { // Success
        const resultToStore = {
              operation: 'signdata',
              signer: signingAddress,
              params: commandParams,
              result: commandResult,
              status: 'Success',
              timestamp: new Date().toISOString()
          };
          addCryptoOperation(resultToStore);
        } else { // RPC returned an error in the result, or result is unexpected
          const errorMsgFromResult = commandResult && commandResult.error ? 
                                     (commandResult.error.message || JSON.stringify(commandResult.error)) :
                                     'Unexpected result from signdata';
          addCryptoOperation({
            operation: 'signdata',
            signer: signingAddress,
            params: commandParams,
            error: errorMsgFromResult,
            status: 'Error',
            timestamp: new Date().toISOString()
          });
          // If setError is desired here for UI from RPC error, ensure it doesn't conflict with catch block
          // setError(errorMsgFromResult); 
        }
      } else {
        console.warn('[SignDataForm] Could not save crypto operation (success/rpc-error path): missing addCryptoOperation or signingAddress.');
      }
    } catch (err) { // Network/RPC error (exception thrown by sendCommand)
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'signdata');
      if (addCryptoOperation && signingAddress) {
        addCryptoOperation({
          operation: 'signdata',
          signer: signingAddress,
          params: commandParams,
          error: errorMessage,
          status: 'Error',
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAddress('');
    setDataSourceType('message');
    setDataSourceValue('');
    setMmrDataItems(['']);
    setMmrSaltItems(['']);
    setHashType('sha256');
    setMmrHashType('blake2b');
    setEncryptToAddress('');
    setCreateMMR(false);
    setVdxfKeys(['']);
    setVdxfKeyNames(['']);
    setBoundHashes(['']);
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  const renderDataSourceInput = () => {
    if (dataSourceType === 'mmrdata') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight:'bold' }}>MMR Data Items (Messages)</Typography>
          {mmrDataItems.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label={`MMR Data Item ${index + 1}`}
                value={item}
                onChange={(e) => handleMmrItemChange(index, e.target.value)}
                placeholder="Enter message string"
                fullWidth
                size="small"
              />
              {mmrDataItems.length > 1 && (
                <IconButton onClick={() => removeMmrItem(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
              )}
            </Box>
          ))}
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addMmrItem} variant="outlined" size="small" sx={{alignSelf:'flex-start'}}>Add MMR Data Item</Button>
          
          <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight:'bold', mt:1.5 }}>MMR Salt Items (Optional, Hex)</Typography>
          {mmrSaltItems.map((salt, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label={`MMR Salt Item ${index + 1}`}
                value={salt}
                onChange={(e) => handleMmrSaltItemChange(index, e.target.value)}
                placeholder="Enter hex salt string (optional)"
                fullWidth
                size="small"
              />
              {mmrSaltItems.length > 1 && (
                <IconButton onClick={() => removeMmrSaltItem(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
              )}
            </Box>
          ))}
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addMmrSaltItem} variant="outlined" size="small" sx={{alignSelf:'flex-start'}}>Add MMR Salt Item</Button>
        </Box>
      );
    }
    // Default input for other types
    const dsConfig = DATA_SOURCE_TYPES.find(dst => dst.value === dataSourceType);
    return (
      <TextField
        label={dsConfig ? dsConfig.label : "Data Source Value"}
        value={dataSourceValue}
        onChange={(e) => setDataSourceValue(e.target.value)}
        placeholder={`Enter ${dsConfig ? dsConfig.label.toLowerCase() : 'value'}`}
        multiline={dataSourceType === 'message' || dataSourceType === 'vdxfdata'}
        rows={dataSourceType === 'message' || dataSourceType === 'vdxfdata' ? 3 : 1}
        required
        fullWidth
        size="small"
        sx={{mt:1}}
      />
    );
  };

  const RenderSignDataResult = ({ data }) => { // Renamed for clarity and to avoid conflict
    if (!data) return null;

    // Helper to render individual key-value pairs, potentially recursively for objects
    const renderDetailValue = (value, label) => {
      if (typeof value === 'object' && value !== null) {
        // Specifically expand signaturedata, otherwise pre-format other objects
        if (label === 'Signaturedata' || label === 'signaturedata') { // Check for variations
          return (
            <Box sx={{ pl: 2, borderLeft: '2px solid #444', ml:1 }}>
              {Object.entries(value).map(([k, v]) => (
                <DetailItem key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} isMono={typeof v === 'string' && v.length > 30} />
              ))}
            </Box>
          );
        }
        return (
          <Paper component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#2c2c2c', p: 1, borderRadius: 1, color: '#fff', mt: 0.5, fontSize: '0.8rem', fontFamily: 'monospace' }}>
            {JSON.stringify(value, null, 2)}
          </Paper>
        );
      }
      if (Array.isArray(value)) {
         return (
            <Paper component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#2c2c2c', p: 1, borderRadius: 1, color: '#fff', mt: 0.5, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {value.join('\n')}
            </Paper>
         );
      }
      return <Typography variant="body2" sx={{ color: '#fff', ml:1, fontFamily: (typeof value === 'string' && value.length > 30) ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{String(value)}</Typography>;
    };

    const DetailItem = ({ label, value, isMono = false, isArray = false, isPre = false /* isPre not directly used if renderDetailValue handles objects */ }) => {
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) return null;
      return (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#ccc', fontWeight: 'bold' }}>{label}:</Typography>
          {renderDetailValue(value, label)}
        </Box>
      );
    };

    // Known top-level fields
    const knownFields = ['hashtype', 'hash', 'hashes', 'mmrroot', 'signature', 'vdxfkeys', 'vdxfkeynames', 'boundhashes', 'encrypteddata', 'signaturedata'];

    return (
      <Box mt={2}>
        <DetailItem label="Hash Type" value={data.hashtype} />
        {data.hash && <DetailItem label="Hash (Primary)" value={data.hash} isMono />}
        {data.hashes && data.hashes.length > 0 && <DetailItem label="Hashes (MMR)" value={data.hashes} isArray />}
        {data.mmrroot && <DetailItem label="MMR Root" value={data.mmrroot} isMono />}
        <DetailItem label="Signature (Base64)" value={data.signature} isPre /> 
        {/* Signaturedata will be handled by the enhanced DetailItem/renderDetailValue */}
        {data.signaturedata && <DetailItem label="Signaturedata" value={data.signaturedata} />}
        {data.vdxfkeys && data.vdxfkeys.length > 0 && <DetailItem label="VDXF Keys" value={data.vdxfkeys} isArray />}
        {data.vdxfkeynames && data.vdxfkeynames.length > 0 && <DetailItem label="VDXF Key Names" value={data.vdxfkeynames} isArray />}
        {data.boundhashes && data.boundhashes.length > 0 && <DetailItem label="Bound Hashes" value={data.boundhashes} isArray />}
        {data.encrypteddata && <DetailItem label="Encrypted Data (Hex)" value={data.encrypteddata} isPre />}
        
        {/* Render any other unexpected/dynamic top-level fields from the result */}
        {Object.entries(data).filter(([key]) => !knownFields.includes(key))
            .map(([key, value]) => <DetailItem key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={value} />)}
      </Box>
    );
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Sign Data</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Sign arbitrary data with various encoding and hashing options. Results in a compact signature.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Signing Address or Identity *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter R-address, i-address, or Identity@"
          required
          fullWidth
          size="small"
        />

        <TextField
          label="Data Source Type *"
          value={dataSourceType}
          onChange={(e) => {
            setDataSourceType(e.target.value);
            setDataSourceValue(''); // Reset value when type changes
            if (e.target.value === 'mmrdata') {
              setMmrDataItems(['']);
              setMmrSaltItems(['']);
            }
          }}
          select
          required
          fullWidth
          size="small"
        >
          {DATA_SOURCE_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {renderDataSourceInput()}

        <Accordion sx={{ background: '#232323', color: '#fff'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }}/>}>
            <Typography>Advanced Options</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Signature Prefix String (optional)"
              value={prefixString}
              onChange={(e) => setPrefixString(e.target.value)}
              placeholder="Enter prefix string"
              fullWidth
              size="small"
            />
            <TextField
              label="Current Signature (optional, for multi-sig ID)"
              value={currentSig}
              onChange={(e) => setCurrentSig(e.target.value)}
              placeholder="Enter current base64 signature"
              fullWidth
              size="small"
            />
            <TextField
              label="Overall Hash Type"
              value={hashType}
              onChange={(e) => setHashType(e.target.value)}
              select
              fullWidth
              size="small"
            >
              {HASH_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            {dataSourceType === 'mmrdata' && (
              <TextField
                label="MMR Hash Type (for MMR data items)"
                value={mmrHashType}
                onChange={(e) => setMmrHashType(e.target.value)}
                select
                fullWidth
                size="small"
                helperText="Defaults to blake2b for MMR items if not specified."
              >
                {HASH_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Encrypt to Address (optional)"
              value={encryptToAddress}
              onChange={(e) => setEncryptToAddress(e.target.value)}
              placeholder="Enter R-address or i-address to encrypt for"
              fullWidth
              size="small"
            />

            <FormControlLabel
              control={<Switch checked={createMMR} onChange={(e) => setCreateMMR(e.target.checked)} />}
              label="Create Merkle Mountain Range (MMR) from data (forces hash type to blake2b or keccak256 if not already set)"
              sx={{ color: 'text.secondary' }}
            />

            <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight:'bold', mt:1 }}>VDXF Keys (Optional)</Typography>
                {vdxfKeys.map((key, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`VDXF Key ${index + 1}`}
                  value={key}
                  onChange={(e) => handleVdxfKeyChange(index, e.target.value)}
                  placeholder="Enter VDXF key (i-address)"
                  fullWidth
                  size="small"
                />
                {vdxfKeys.length > 1 || (vdxfKeys.length === 1 && key.trim() !== '') ? (
                  <IconButton onClick={() => removeVdxfKey(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                ) : null}
              </Box>
                ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={addVdxfKey} variant="outlined" size="small" sx={{alignSelf:'flex-start'}}>Add VDXF Key</Button>

            <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight:'bold', mt:1 }}>VDXF Key Names (Optional)</Typography>
                {vdxfKeyNames.map((name, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`VDXF Key Name ${index + 1}`}
                  value={name}
                  onChange={(e) => handleVdxfKeyNameChange(index, e.target.value)}
                  placeholder="Enter VDXF key name"
                  fullWidth
                  size="small"
                />
                {vdxfKeyNames.length > 1 || (vdxfKeyNames.length === 1 && name.trim() !== '') ? (
                  <IconButton onClick={() => removeVdxfKeyName(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                ) : null}
              </Box>
                ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={addVdxfKeyName} variant="outlined" size="small" sx={{alignSelf:'flex-start'}}>Add VDXF Key Name</Button>

            <Typography variant="subtitle2" sx={{ color: '#90caf9', fontWeight:'bold', mt:1 }}>Bound Hashes (Optional)</Typography>
                {boundHashes.map((hash, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Bound Hash ${index + 1}`}
                  value={hash}
                  onChange={(e) => handleBoundHashChange(index, e.target.value)}
                  placeholder="Enter hex-encoded hash"
                  fullWidth
                  size="small"
                />
                {boundHashes.length > 1 || (boundHashes.length === 1 && hash.trim() !== '') ? (
                  <IconButton onClick={() => removeBoundHash(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                ) : null}
              </Box>
                ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={addBoundHash} variant="outlined" size="small" sx={{alignSelf:'flex-start'}}>Add Bound Hash</Button>

            </AccordionDetails>
        </Accordion>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {result && !error && (
          <Alert severity="success" sx={{ mt: 1, mb: 1, overflowWrap: 'break-word' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Data Signed Successfully:</Typography>
            <RenderSignDataResult data={result} />
          </Alert>
        )}
        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Sign Data</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default SignDataForm; 