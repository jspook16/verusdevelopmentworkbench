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
  TextField,
  Grid // Added Grid for layout if needed, though not strictly used in this version
} from '@mui/material';
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
  '& .MuiInputLabel-root': { color: '#c5c5c5' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#90caf9' },
});

const VerifyMessageForm = ({ onCommandResponse, onCommandError }) => {
  const { addCryptoOperation } = useContext(WorkbenchDataContext) || {};
  const { sendCommand } = useContext(NodeContext);

  const [addressOrIdentity, setAddressOrIdentity] = useState('');
  const [signature, setSignature] = useState('');
  const [message, setMessage] = useState('');
  const [checkLatest, setCheckLatest] = useState(false);
  const [vdxfkey, setVdxfkey] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // Stores boolean result or error object

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!addressOrIdentity.trim() || !signature.trim() || (!message.trim() && !checkLatest)) {
      setError('Address/Identity, Signature, and Message (or Check Latest) are required.');
      setIsLoading(false);
      return;
    }

    const params = [addressOrIdentity.trim(), signature.trim(), message.trim() || null];
    if (checkLatest) params.push(true);
    if (vdxfkey.trim()) params.push(vdxfkey.trim());

    try {
      const commandResult = await sendCommand('verifymessage', params, 'verifymessage');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'verifymessage');

      if (addCryptoOperation && addressOrIdentity && commandResult !== undefined && !commandResult.error) {
        const resultToStore = {
          operation: 'verifymessage',
          params: { address: params[0], signature: params[1], message: params[2], checklatest: params[3], vdxfkey: params[4] },
          result: commandResult,
          timestamp: new Date().toISOString()
        }
        addCryptoOperation(addressOrIdentity, resultToStore);
        console.log(`Saved verifymessage result for ${addressOrIdentity}:`, resultToStore);
      } else if (commandResult === undefined) {
        console.warn('[VerifyMessageForm] Could not save crypto operation result: missing context function or address.');
      }

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      setResult({ error: errorMessage });
      if (onCommandError) onCommandError(errorMessage, 'verifymessage');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAddressOrIdentity('');
    setSignature('');
    setMessage('');
    setCheckLatest(false);
    setVdxfkey('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Verify Message Signature</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Verify that a message was signed by a specific address or identity.
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
          label="Original Message *"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter the exact original message text"
          multiline
          rows={4}
          required={!checkLatest} // Message is required if not checking latest
          fullWidth
          size="small"
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column'}}> {/* Replaced FormControl wrapper */} 
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#2a2a2a', borderRadius: '4px', padding: '0 8px', height: '40px', mt:1 }}>
                <Switch checked={checkLatest} onChange={(e) => setCheckLatest(e.target.checked)} color="primary"/>
                <Typography sx={{ color: checkLatest ? '#90caf9' : '#c5c5c5', ml: 1 }}>Check Signature Against Latest Identity State</Typography>
            </Box>
            <Typography variant="caption" sx={{color: '#999', mt:0.5}}>Default is to check against signing height stored in signature.</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {/* Displaying result for verifymessage which returns a boolean or an error object */}
        {result !== null && !error && (
          <Alert 
            severity={result === true ? 'success' : 'error'} 
            sx={{ mt: 1, mb: 1 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Verification Result: {result === true ? 'VERIFIED' : 'NOT VERIFIED'}
            </Typography>
            {typeof result !== 'boolean' && (
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#232323', p:1, borderRadius:1, mt:1 }}>
                Details: {JSON.stringify(result, null, 2)}
              </Typography>
            )}
          </Alert>
        )}
        {result === null && error && (
            <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>
        )}


        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Verify Message</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default VerifyMessageForm;
