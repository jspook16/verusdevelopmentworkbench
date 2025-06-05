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
  Switch,
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

// Styled components (copy or import)
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

const ScrollablePaper = styled(Paper)(({ theme }) => ({
  maxHeight: '150px',
  overflowY: 'auto',
  background: '#2a2a2a',
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  border: '1px solid #444',
}));

const VerifyFileForm = ({ onCommandResponse, onCommandError }) => {
  const { addCryptoOperation } = useContext(WorkbenchDataContext) || {};
  const { sendCommand } = useContext(NodeContext);

  const [addressOrIdentity, setAddressOrIdentity] = useState('');
  const [signature, setSignature] = useState('');
  const [filePaths, setFilePaths] = useState([]);
  const [checkLatest, setCheckLatest] = useState(false);

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
        // No files selected or dialog cancelled
        // setFilePaths([]); 
      }
    } catch (ipcError) {
      console.error('Error invoking file dialog via IPC:', ipcError);
      setError('Failed to communicate with main process for file dialog. Ensure Electron is running correctly.');
    }
  };

  const removeFilePath = (index) => {
    setFilePaths(filePaths.filter((_, i) => i !== index));
    setResults(results.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setIsLoading(true);

    if (!addressOrIdentity.trim() || !signature.trim() || filePaths.length === 0) {
      setError('Address/Identity, Signature, and at least one File Path are required.');
      setIsLoading(false);
      return;
    }

    const operationResults = [];
    let encounteredError = null;

    for (const filePath of filePaths) {
      const params = [
        addressOrIdentity.trim(),
        signature.trim(),
        filePath.trim()
      ];
      if (checkLatest) {
        params.push(true);
      }

      try {
        const commandResult = await sendCommand('verifyfile', params, `verifyfile: ${filePath}`);
        const logParams = { 
            address: params[0], 
            signature: params[1], 
            filename: params[2]
        };
        if (params.length > 3) { // checklatest was added
            logParams.checklatest = params[3];
        }

        if (commandResult === true) { // Successful verification
          operationResults.push({ filePath, verified: true, data: commandResult, error: null });
          if (onCommandResponse) onCommandResponse(commandResult, `verifyfile: ${filePath}`);
          
          if (addCryptoOperation) {
            const resultToStore = {
              operation: 'verifyfile',
              signer: addressOrIdentity.trim(), 
              params: logParams,
              result: { verified: true, rawOutput: commandResult }, 
              status: 'Success',
              timestamp: new Date().toISOString()
            };
            addCryptoOperation(resultToStore); 
          }
        } else { // Failed verification or RPC error object
          let errorMessage = 'Verification failed.';
          let rpcErrorObject = null;

          if (typeof commandResult === 'object' && commandResult !== null && commandResult.error) {
            errorMessage = commandResult.error.message || JSON.stringify(commandResult.error);
            rpcErrorObject = commandResult.error;
          } else if (commandResult === false) {
            errorMessage = 'Verification returned false.';
            rpcErrorObject = { message: errorMessage }; 
          } else if (commandResult !== null) { 
            errorMessage = `Unexpected result: ${JSON.stringify(commandResult)}`;
            rpcErrorObject = { message: errorMessage, rawOutput: commandResult };
          }

          operationResults.push({ filePath, verified: false, data: null, error: errorMessage });
          if (onCommandError) onCommandError(errorMessage, `verifyfile: ${filePath}`);
          
          if (addCryptoOperation) {
            const errorResultToStore = {
              operation: 'verifyfile',
              signer: addressOrIdentity.trim(), 
              params: logParams,
              error: rpcErrorObject ? rpcErrorObject.message : errorMessage, 
              result: commandResult, 
              status: 'Error',
              timestamp: new Date().toISOString()
            };
            addCryptoOperation(errorResultToStore); 
          }
        }
      } catch (err) { 
        const errorMessage = err.message || `Failed to execute verifyfile for: ${filePath}`;
        encounteredError = encounteredError || errorMessage; 
        operationResults.push({ filePath, verified: false, data: null, error: errorMessage });
        if (onCommandError) onCommandError(errorMessage, `verifyfile: ${filePath}`);
        
        if (addCryptoOperation) {
           const logParamsCatch = { // Renamed to avoid conflict, though scope should protect
              address: params[0], 
              signature: params[1], 
              filename: params[2]
          };
          if (params.length > 3) {
              logParamsCatch.checklatest = params[3];
          }
          addCryptoOperation({
            operation: 'verifyfile',
            signer: addressOrIdentity.trim(),
            params: logParamsCatch,
            error: errorMessage,
            status: 'Error',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    setIsLoading(false);
    setResults(operationResults);
    if (encounteredError) {
      setError(`One or more files failed to verify. See results below. First error: ${encounteredError}`);
    }
  };

  const resetForm = () => {
    setAddressOrIdentity('');
    setSignature('');
    setFilePaths([]);
    setCheckLatest(false);
    setError('');
    setResults([]);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Verify File Signature(s)</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Verify that a file was signed by a specific address or identity.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Address or Identity that Signed *"
          value={addressOrIdentity}
          onChange={(e) => setAddressOrIdentity(e.target.value)}
          placeholder="Enter R-address or Identity@"
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Signature (Base64) *"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter Base64 encoded signature"
          required
          fullWidth
          size="small"
        />
        
        <Box>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs={filePaths.length > 0 ? 9 : 8}>
              <TextField
                label="File Path(s) to Verify *"
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
            <Grid item xs={filePaths.length > 0 ? 3 : 4} sx={{ textAlign: 'left', pt: '0px'}}>
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

        <Box sx={{ display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#2a2a2a', borderRadius: '4px', padding: '0 8px', height: '40px', mt:1 }}>
                <Switch checked={checkLatest} onChange={(e) => setCheckLatest(e.target.checked)} color="primary"/>
                <Typography sx={{ color: checkLatest ? '#90caf9' : '#c5c5c5', ml: 1 }}>Check Signature Against Latest Identity State</Typography>
            </Box>
            <Typography variant="caption" sx={{color: '#999', mt:0.5}}>Default is to check against signing height stored in signature.</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {results.length > 0 && (
            <Box sx={{mt:2}}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff', mb:1 }}>Verification Results:</Typography>
                {results.map((res, index) => (
                    <Alert 
                        key={index} 
                        severity={res.verified ? 'success' : 'error'} 
                        sx={{ mt: 1, mb: 1, overflowWrap: 'break-word' }}
                    >
                        <Typography variant="caption" display="block" sx={{fontWeight:'bold'}}>{res.filePath}</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{res.verified ? 'VERIFIED' : 'NOT VERIFIED'}</Typography>
                        {res.error && <Typography sx={{fontSize:'0.8rem', mt:0.5}}>Error: {res.error}</Typography>}
                        {!res.verified && res.data !== null && typeof res.data !== 'boolean' && (
                           <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#232323', p:1, borderRadius:1, mt:1, fontSize:'0.75rem' }}>Details: {JSON.stringify(res.data, null, 2)}</Typography>
                        )}
                    </Alert>
                ))}
            </Box>
        )}

        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Verify File(s)</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default VerifyFileForm; 