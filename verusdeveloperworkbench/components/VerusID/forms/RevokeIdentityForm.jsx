import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Switch,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  AccordionDetails,
  FormControlLabel,
  AlertTitle,
  TextField,
  Divider
} from '@mui/material';
import { styled } from '@mui/system';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';
import { NodeContext } from '../../../contexts/NodeContext';
import FormattedResultDisplay from './common/FormattedResultDisplay';

// Re-using styled components from SetTimelockForm or a shared file is recommended
// For brevity, defining them here if not already shared.
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
  '&::placeholder': { color: '#777' },
  '&:hover': { borderColor: '#666' },
  '&.Mui-focused': { borderColor: '#90caf9' },
});

const RevokeIdentityForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  const [nameOrId, setNameOrId] = useState('');
  const [returnTx, setReturnTx] = useState(false);
  const [tokenRevoke, setTokenRevoke] = useState(false);
  const [feeOffer, setFeeOffer] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [revokeId, setRevokeId] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!nameOrId) {
      setError('Identity Name or ID is required.');
      setIsLoading(false);
      return;
    }
    if (!revokeId) {
      setError('You must enable the "Revoke this Identity ID" switch to confirm this permanent action.');
      setIsLoading(false);
      return;
    }

    const params = [nameOrId];

    // param 2: returntx (optional, boolean, default: false)
    params.push(returnTx);

    // param 3: tokenrevoke (optional, boolean, default: false)
    params.push(tokenRevoke);
    
    // param 4: feeoffer (optional, number, default: standard fee)
    // param 5: sourceoffunds (optional, string, default: N/A)
    // Only add feeoffer and sourceoffunds if feeoffer is explicitly set.
    // If sourceoffunds is set without feeoffer, the RPC might require a placeholder for feeoffer.
    // However, based on CLI, sending only the first 3 params should work if the latter are omitted.

    if (feeOffer.trim() !== '' || sourceOfFunds.trim() !== '') {
      // If either is set, we need to ensure feeoffer is present, even if as default proxy
      params.push(feeOffer.trim() !== '' ? Number(feeOffer) : null); // Use null if feeOffer empty but source is set
      if (sourceOfFunds.trim() !== '') {
        params.push(sourceOfFunds.trim());
      } else if (feeOffer.trim() !== '') {
        // If feeOffer was set but sourceOfFunds is not, we might need to explicitly push null for sourceOfFunds
        // if the RPC call is strictly positional for all 5 params once the 4th is included.
        // For now, let's assume omitting it is fine if it's empty.
      }
    } else {
      // Neither feeOffer nor sourceOfFunds is set. Params will be [nameOrId, returnTx, tokenRevoke]
      // This matches the CLI example that worked for you.
    }

    // Current params array: [nameOrId, returnTx, tokenRevoke, (feeoffer), (sourceoffunds)]
    // where optional ones are only added if provided or if needed to ensure correct positioning.
    // Given the error, and if your CLI of 3 params worked, the issue is likely not the number of params if feeOffer and sourceOfFunds are empty.

    console.log('[RevokeIdentityForm] Sending params:', JSON.stringify(params));

    try {
      const commandResult = await sendRPCCommand('revokeidentity', params, 'revokeidentity');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'revokeidentity');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'revokeidentity');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNameOrId('');
    setReturnTx(false);
    setTokenRevoke(false);
    setFeeOffer('');
    setSourceOfFunds('');
    setRevokeId(false);
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>
        Revoke Identity
      </Typography>
      <Alert severity="warning" sx={{ mt: 0, mb:2,  background: '#3e2723', color: '#ffccbc', fontSize: '0.7rem'}}>
        <AlertTitle sx={{fontWeight: 'bold'}}>Be Careful: Revoking</AlertTitle>
        Funds can not be spent anymore.
      </Alert>
      <Alert severity="warning" sx={{ mt: 0, mb:2,  background: '#3e2723', color: '#ffccbc', fontSize: '0.7rem'}}>
        <AlertTitle sx={{fontWeight: 'bold'}}>Important: Recovery Authority Requirement</AlertTitle>
        To revoke a VerusID, the Recovery Authority must be different from the VerusID being revoked in order to be successful, otherwise you may get the error below:
        <Box component="pre" sx={{ mt: 1, p: 1, background: '#2a2a2a', borderRadius: '4px', fontSize: '0.7rem' }}>
          ERROR: error code: -26{'\n'}
          error message:{'\n'}
          Unable to commit identity update transaction: mandatory-script-verify-flag-failed (Script evaluated without error but finished with a false/empty top stack element)
        </Box>
      </Alert>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Revoke an identity using its revocation authority. This action is permanent.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Identity Name or ID to Revoke *"
            value={nameOrId}
            onChange={(e) => setNameOrId(e.target.value)}
            placeholder="Enter identity name or ID (e.g., MyIdentity@ or i-address)"
          required
          fullWidth
          size="small"
          />

        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={returnTx} onChange={(e) => setReturnTx(e.target.checked)} color="primary" />}
              label="Return Transaction (for multi-sig)"
              sx={{ color: 'text.secondary'}} // Adjusted for consistency
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={tokenRevoke} onChange={(e) => setTokenRevoke(e.target.checked)} color="primary" />}
              label="Use Tokenized ID Control for Revocation"
              sx={{ color: 'text.secondary'}} // Adjusted for consistency
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1, borderColor: '#444' }} />

        <FormControlLabel 
          control={<Switch checked={revokeId} onChange={(e) => setRevokeId(e.target.checked)} color="error"/>}
          label="CONFIRM: Revoke this Identity ID (Permanent Action)"
          sx={{color: revokeId ? '#f44336' : 'text.secondary', fontWeight: revokeId ? 'bold' : 'normal' , mb: 1}} 
        />
        
          <Grid container spacing={2}>
          <Grid item xs={12} sm={6}> 
            <TextField
              label="Fee Offer (optional)"
              type="number"
              value={feeOffer}
              onChange={(e) => setFeeOffer(e.target.value)}
              placeholder="e.g., 0.0001"
              inputProps={{ step: "0.0001" }}
              fullWidth
              size="small"
            />
            </Grid>
          <Grid item xs={12} sm={6}> 
            <TextField
              label="Source of Funds (optional)"
              type="text"
              value={sourceOfFunds}
              onChange={(e) => setSourceOfFunds(e.target.value)}
              placeholder="R-address or z-address"
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>{error}</Alert>}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ color: '#bbb' }}>Processing request...</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="error" 
            disabled={isLoading}
            sx={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            Revoke Identity
          </Button>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={resetForm}
            disabled={isLoading}
            sx={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            Reset Form
          </Button>
        </Box>
      </Box>

      {/* Display formatted results if available */}
      {result && (
        <FormattedResultDisplay result={result} title="Revocation Result" />
      )}
    </StyledPaper>
  );
};

export default RevokeIdentityForm; 