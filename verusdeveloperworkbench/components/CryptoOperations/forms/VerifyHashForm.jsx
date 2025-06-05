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
  TextField
} from '@mui/material';
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

const VerifyHashForm = ({ onCommandResponse, onCommandError }) => {
  const { addCryptoOperation } = useContext(WorkbenchDataContext) || {};
  const { sendCommand } = useContext(NodeContext);

  const [addressOrIdentity, setAddressOrIdentity] = useState('');
  const [signature, setSignature] = useState('');
  const [hexHash, setHexHash] = useState('');
  const [checkLatest, setCheckLatest] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!addressOrIdentity.trim() || !signature.trim() || !hexHash.trim()) {
      setError('Address/Identity, Signature, and Hex Hash are required.');
      setIsLoading(false);
      return;
    }
    if (hexHash.trim().length !== 64) {
        setError('Hex Hash must be 32 bytes (64 hex characters).');
        setIsLoading(false);
        return;
    }

    const rpcParams = [
      addressOrIdentity.trim(),
      signature.trim(),
      hexHash.trim()
    ];
    if (checkLatest) {
      rpcParams.push(true);
    }

    const verifyingAddress = addressOrIdentity.trim(); // For logging key
    const paramsForLog = { address: verifyingAddress, signature: signature.trim(), hash: hexHash.trim(), checklatest: checkLatest };

    try {
      const commandResult = await sendCommand('verifyhash', rpcParams, 'verifyhash');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'verifyhash');

      if (addCryptoOperation && verifyingAddress) {
        const resultToStore = {
          operation: 'verifyhash',
          signer: verifyingAddress, 
          params: paramsForLog,
          result: commandResult, // boolean true, or object with error
          status: (commandResult === true || (typeof commandResult === 'object' && commandResult.result === true)) ? 'Success (Verified)' : 'Error/Failed',
          timestamp: new Date().toISOString()
        };
        addCryptoOperation(resultToStore);
      } else {
        console.warn('[VerifyHashForm] Could not save crypto operation result: missing addCryptoOperation or verifyingAddress.');
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      setResult({ error: errorMessage }); // Ensure result reflects error for UI
      if (onCommandError) onCommandError(errorMessage, 'verifyhash');

      if (addCryptoOperation && verifyingAddress) {
        addCryptoOperation({
          operation: 'verifyhash',
          signer: verifyingAddress,
          params: paramsForLog,
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
    setAddressOrIdentity('');
    setSignature('');
    setHexHash('');
    setCheckLatest(false);
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Verify Hash Signature</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Verify that a hash was signed by a specific address or identity.
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
        <TextField
          label="Hex Hash (32 bytes / 64 hex characters) *"
          value={hexHash}
          onChange={(e) => setHexHash(e.target.value)}
          placeholder="Enter the hex-encoded hash"
          required
          fullWidth
          size="small"
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#2a2a2a', borderRadius: '4px', padding: '0 8px', height: '40px', mt:1 }}>
                <Switch checked={checkLatest} onChange={(e) => setCheckLatest(e.target.checked)} color="primary"/>
                <Typography sx={{ color: checkLatest ? '#90caf9' : '#c5c5c5', ml: 1 }}>Check Signature Against Latest Identity State</Typography>
            </Box>
            <Typography variant="caption" sx={{color: '#999', mt:0.5}}>Default is to check against signing height stored in signature.</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {result !== null && !error && (
          <Alert severity={result === true ? 'success' : 'error'} sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Verification Result: {result === true ? 'VERIFIED' : 'NOT VERIFIED'}</Typography>
            {typeof result !== 'boolean' && (<Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#232323', p:1, borderRadius:1, mt:1 }}>Details: {JSON.stringify(result, null, 2)}</Typography>)}
          </Alert>
        )}
         {result === null && error && (<Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>)}

        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Verify Hash</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default VerifyHashForm;
 