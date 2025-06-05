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
  TextField // For multiline message input
} from '@mui/material';
import { styled } from '@mui/system';
import { NodeContext } from '../../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../../contexts/WorkbenchDataContext';

// Assuming styled components are defined elsewhere or copy them if needed
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

const SignMessageForm = ({ onCommandResponse, onCommandError }) => {
  const { sendCommand } = useContext(NodeContext);
  const { addCryptoOperation } = useContext(WorkbenchDataContext);

  const [addressOrIdentity, setAddressOrIdentity] = useState('');
  const [message, setMessage] = useState('');
  const [currentSig, setCurrentSig] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!addressOrIdentity.trim() || !message.trim()) {
      setError('Address/Identity and Message are required.');
      setIsLoading(false);
      return;
    }

    const paramsForRpc = [addressOrIdentity.trim(), message.trim()];
    if (currentSig.trim()) {
      paramsForRpc.push(currentSig.trim());
    }
    
    const signingAddress = addressOrIdentity.trim();
    const paramsForLog = {
        identity: signingAddress,
        message: message.trim(),
        ...(currentSig.trim() && { current_signature: currentSig.trim() })
    };

    try {
      const commandResult = await sendCommand('signmessage', paramsForRpc, 'signmessage');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'signmessage');

      if (addCryptoOperation && signingAddress) {
        if (commandResult && typeof commandResult === 'object' && commandResult.signature && !commandResult.error) {
        const logEntry = {
            operation: 'Sign Message',
            signer: signingAddress,
            params: paramsForLog,
          result: {
            hash: commandResult.hash,
            signature: commandResult.signature
          },
          status: 'Success',
          timestamp: new Date().toISOString()
        };
          addCryptoOperation(logEntry);
      } else if (commandResult && commandResult.error) {
          addCryptoOperation({
            operation: 'Sign Message',
            signer: signingAddress,
            params: paramsForLog,
            error: commandResult.error.message || 'RPC Error',
            status: 'Error',
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'signmessage');
      
      if (addCryptoOperation && signingAddress) {
        addCryptoOperation({
          operation: 'Sign Message',
          signer: signingAddress,
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
    setMessage('');
    setCurrentSig('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Sign Message</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Generate a cryptographic signature for a text message using an address or identity.
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

        <TextField
          label="Message to Sign *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message text"
            multiline
            rows={4}
          required
          fullWidth
          size="small"
        />

        <TextField
          label="Current Signature (optional, for multi-sig ID)"
          value={currentSig}
          onChange={(e) => setCurrentSig(e.target.value)}
          placeholder="Enter current base64 signature if applicable"
          fullWidth
          size="small"
        />

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
        {result && !error && (
          <Alert severity="success" sx={{ mt: 1, mb: 1, overflowWrap: 'break-word' }}>
             <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Message Signed Successfully:</Typography>
            {result.hash && <Typography sx={{mt:0.5, fontSize:'0.8rem'}}><strong>Hash (SHA256D):</strong> {result.hash}</Typography>}
            {result.signature && <Typography sx={{mt:0.5, fontSize:'0.8rem'}}><strong>Signature (Base64):</strong> {result.signature}</Typography>}
          </Alert>
        )}

        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Sign Message</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default SignMessageForm; 