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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  TextField
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import { styled } from '@mui/system';
import { WorkbenchDataContext } from '../../../contexts/WorkbenchDataContext';
import { NodeContext } from '../../../contexts/NodeContext';

// Assuming styled components are defined (copy from SignMessageForm if not in a shared file)
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

const ScrollablePaper = styled(Paper)(({ theme }) => ({
  maxHeight: '150px',
  overflowY: 'auto',
  background: '#2a2a2a',
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  border: '1px solid #444',
}));

const SignFileForm = ({ onCommandResponse, onCommandError }) => {
  const { addCryptoOperation } = useContext(WorkbenchDataContext) || {};
  const { sendCommand } = useContext(NodeContext);

  const [addressOrIdentity, setAddressOrIdentity] = useState('');
  const [filePaths, setFilePaths] = useState([]);
  const [currentSig, setCurrentSig] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const handleFileBrowse = async () => {
    setError('');
    try {
      const selectedFiles = await window.electron.ipcRenderer.invoke('select-multiple-files');
      
      if (selectedFiles && selectedFiles.error) {
        console.error('Error from main process file dialog:', selectedFiles.error);
        setError(selectedFiles.error);
        setFilePaths([]);
      } else if (selectedFiles && selectedFiles.length > 0) {
        setFilePaths(selectedFiles);
      } else {
        // No files selected or dialog cancelled - optionally clear or do nothing
        // setFilePaths([]); 
      }
    } catch (ipcError) {
      console.error('Error invoking file dialog via IPC:', ipcError);
      setError('Failed to communicate with main process for file dialog. Ensure Electron is running correctly.');
    }
  };

  const removeFilePath = (index) => {
    setFilePaths(filePaths.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setIsLoading(true);

    if (!addressOrIdentity.trim() || filePaths.length === 0) {
      setError('Address/Identity and at least one File Path are required.');
      setIsLoading(false);
      return;
    }

    const operationResults = [];
    let encounteredError = null;
    const signingAddress = addressOrIdentity.trim();

    for (const filePath of filePaths) {
      const currentFilePath = filePath.trim();
      const currentSigTrimmed = currentSig.trim();
      const params = [signingAddress, currentFilePath];
      if (currentSigTrimmed) {
        params.push(currentSigTrimmed);
      }
      
      const currentParamsForLog = { address: signingAddress, filename: currentFilePath, currentSig: currentSigTrimmed || undefined };

      try {
        const commandResult = await sendCommand('signfile', params, `signfile: ${currentFilePath}`);
        operationResults.push({ filePath: currentFilePath, data: commandResult, error: null });
        if (onCommandResponse) onCommandResponse(commandResult, `signfile: ${currentFilePath}`, { filePath: currentFilePath });
        
        if (addCryptoOperation && signingAddress) {
          if (commandResult && typeof commandResult === 'object' && !commandResult.error) {
          const resultToStore = {
              operation: 'signfile', 
                signer: signingAddress,
                params: currentParamsForLog,
              result: commandResult,
                status: 'Success',
                timestamp: new Date().toISOString()
            };
            addCryptoOperation(resultToStore);
          } else if (commandResult && commandResult.error) { 
             const errorResultToStore = {
               operation: 'signfile',
               signer: signingAddress,
               params: currentParamsForLog,
               error: commandResult.error.message || 'RPC Error',
               status: 'Error',
              timestamp: new Date().toISOString()
             };
             addCryptoOperation(errorResultToStore);
          } else {
            console.warn(`[SignFileForm] Could not save crypto operation result for ${currentFilePath}: unexpected result structure.`, commandResult);
          }
        } else {
          console.warn(`[SignFileForm] addCryptoOperation or signingAddress not available for ${currentFilePath}`);
        }
      } catch (err) {
        const errorMessage = err.message || `Failed to sign file: ${currentFilePath}`;
        encounteredError = encounteredError || errorMessage; 
        operationResults.push({ filePath: currentFilePath, data: null, error: errorMessage });
        if (onCommandError) onCommandError(errorMessage, `signfile: ${currentFilePath}`, { filePath: currentFilePath });
        
        if (addCryptoOperation && signingAddress) {
          const errorResultToStore = {
            operation: 'signfile',
            signer: signingAddress,
            params: currentParamsForLog,
            error: errorMessage,
            status: 'Error',
            timestamp: new Date().toISOString()
          };
          addCryptoOperation(errorResultToStore);
        }
      }
    }

    setIsLoading(false);
    setResults(operationResults);
    if (encounteredError) {
      setError(`One or more files failed to sign. First error: ${encounteredError}`);
    }
  };

  const resetForm = () => {
    setAddressOrIdentity('');
    setFilePaths([]);
    setCurrentSig('');
    setError('');
    setResults([]);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Sign File(s)</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Generate a cryptographic signature for a file using an address or identity.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Address or Identity for Signing *"
          value={addressOrIdentity}
          onChange={(e) => setAddressOrIdentity(e.target.value)}
          placeholder="Enter R-address or Identity@"
          required
          fullWidth
          size="small"
        />

        <Box>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs={filePaths.length > 0 ? 9 : 8}>
              <TextField
                label="File Path(s) to Sign *"
                value={filePaths.length === 1 ? filePaths[0] : (filePaths.length > 1 ? `${filePaths.length} files selected` : '')}
                placeholder="Click Browse or enter a single file path"
                onChange={(e) => {
                  if (filePaths.length <= 1) {
                    setFilePaths([e.target.value]);
                  }
                }}
                required={filePaths.length === 0}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: filePaths.length > 1,
                }}
              />
            </Grid>
            <Grid item xs={filePaths.length > 0 ? 3 : 4} sx={{ textAlign: 'left', pt: filePaths.length > 0 ? '0px' : '0px' }}>
              <Button variant="outlined" startIcon={<FolderOpenIcon />} onClick={handleFileBrowse} sx={{height: '40px', width: '100%'}}>Browse Files</Button>
            </Grid>
          </Grid>
          {filePaths.length > 0 && (
            <ScrollablePaper variant="outlined">
              <List dense>
                {filePaths.map((fp, index) => (
                  <ListItem key={index} dense sx={{padding: '2px 8px', borderBottom: '1px solid #3a3a3a', '&:last-child': {borderBottom: 'none'} }}
                    secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => removeFilePath(index)} size="small"><ClearIcon fontSize="small" sx={{color: '#f44336'}}/></IconButton>}
                  >
                    <ListItemText primary={<Typography sx={{fontSize:'0.8rem', color:'#ddd'}}>{fp}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </ScrollablePaper>
          )}
          <Typography variant="caption" sx={{ color: '#999', mt: 0.5 }}>Note: The Verus daemon must have access to these file paths.</Typography>
        </Box>

        <TextField
          label="Current Signature (optional, for multi-sig ID)"
          value={currentSig}
          onChange={(e) => setCurrentSig(e.target.value)}
          placeholder="Enter current base64 signature if applicable"
          fullWidth
          size="small"
        />

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {results.length > 0 && (
            <Box sx={{mt: 2}}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff', mb:1 }}>Signing Results:</Typography>
                {results.map((res, index) => (
                    <Alert 
                        key={index} 
                        severity={res.error ? 'error' : 'success'} 
                        sx={{ mt: 1, mb: 1, overflowWrap: 'break-word' }}
                    >
                        <Typography variant="caption" display="block" sx={{fontWeight:'bold'}}>{res.filePath}</Typography>
                        {res.error ? res.error : (
                            <>
                                <Typography component="div" sx={{ mt: 0.5}}>
                                    <strong>Hash (SHA256):</strong>
                                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#2a2a2a', p:0.5, borderRadius:1, mt:0.25, fontSize: '0.75rem' }}>{res.data?.hash}</Typography>
                                </Typography>
                                <Typography component="div" sx={{ mt: 0.5}}>
                                    <strong>Signature (Base64):</strong>
                                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#2a2a2a', p:0.5, borderRadius:1, mt:0.25, fontSize: '0.75rem' }}>{res.data?.signature}</Typography>
                                </Typography>
                            </>
                        )}
                    </Alert>
                ))}
            </Box>
        )}

        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Sign File(s)</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default SignFileForm; 