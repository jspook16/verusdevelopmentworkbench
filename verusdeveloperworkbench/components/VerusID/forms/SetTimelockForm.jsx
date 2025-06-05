import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  Grid,
  TextField,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  background: '#1e1e1e', // Darker background for the form paper
  border: '1px solid #333',
  borderRadius: '8px',
}));

const StyledFormLabel = styled(FormLabel)({
  color: '#c5c5c5', // Lighter label color for dark theme
  marginBottom: '4px',
});

const StyledInput = styled(Input)({
  color: '#fff',
  background: '#2a2a2a', // Dark input background
  border: '1px solid #444',
  borderRadius: '4px',
  padding: '8px',
  '&::placeholder': {
    color: '#777',
  },
  '&:hover': {
    borderColor: '#666',
  },
  '&.Mui-focused': {
    borderColor: '#90caf9', // MUI blue for focus
  },
});

const StyledSelect = styled(Select)({
  color: '#fff',
  background: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '4px',
  '& .MuiSelect-icon': {
    color: '#c5c5c5',
  },
  '&:hover': {
    borderColor: '#666',
  },
  '&.Mui-focused': {
    borderColor: '#90caf9',
  },
});

const SetTimelockForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  const [identityNameOrId, setIdentityNameOrId] = useState('');
  const [timelockOption, setTimelockOption] = useState('unlockatblock'); // 'unlockatblock' or 'setunlockdelay'
  const [unlockAtBlock, setUnlockAtBlock] = useState('');
  const [unlockDelay, setUnlockDelay] = useState('');
  const [returnTx, setReturnTx] = useState(false);
  const [feeOffer, setFeeOffer] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!identityNameOrId) {
      setError('Identity Name or ID is required.');
      setIsLoading(false);
      return;
    }

    const timelockParams = {};
    if (timelockOption === 'unlockatblock') {
      if (!unlockAtBlock) {
        setError('Unlock at Block height is required when "Unlock at Block" is selected.');
        setIsLoading(false);
        return;
      }
      timelockParams.unlockatblock = Number(unlockAtBlock);
    } else if (timelockOption === 'setunlockdelay') {
      if (!unlockDelay) {
        setError('Unlock Delay (blocks) is required when "Set Unlock Delay" is selected.');
        setIsLoading(false);
        return;
      }
      timelockParams.setunlockdelay = Number(unlockDelay);
    } else {
      setError('Invalid timelock option selected.');
      setIsLoading(false);
      return;
    }

    const params = [
      identityNameOrId,
      timelockParams,
    ];

    if (returnTx) params.push(true);
    else params.push(false); // Explicitly push false if not true

    if (feeOffer) params.push(Number(feeOffer));
    if (sourceOfFunds) {
      // Ensure feeOffer is present if sourceOfFunds is, even if default (0.0001) or custom
      if (!feeOffer) params.push(0.0001); // Default fee if not specified but sourceoffunds is
      params.push(sourceOfFunds);
    }


    try {
      const commandResult = await sendRPCCommand('setidentitytimelock', params, 'setidentitytimelock');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'setidentitytimelock');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'setidentitytimelock');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIdentityNameOrId('');
    setTimelockOption('unlockatblock');
    setUnlockAtBlock('');
    setUnlockDelay('');
    setReturnTx(false);
    setFeeOffer('');
    setSourceOfFunds('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>
        Set Identity Timelock
      </Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Configure timelock settings for an identity. This controls when an identity can access its funds.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Identity Name or ID *"
            value={identityNameOrId}
            onChange={(e) => setIdentityNameOrId(e.target.value)}
          placeholder="Enter identity name or ID (e.g., MyIdentity@ or i-address)"
          required
          fullWidth
          size="small" 
          />

        <TextField
          label="Timelock Option"
            value={timelockOption}
            onChange={(e) => setTimelockOption(e.target.value)}
          select
          fullWidth
          size="small" 
          >
            <MenuItem value="unlockatblock">Unlock at Block</MenuItem>
            <MenuItem value="setunlockdelay">Set Unlock Delay</MenuItem>
        </TextField>

        {timelockOption === 'unlockatblock' && (
          <TextField
            label="Unlock at Block (Absolute Block Height) *"
              type="number"
              value={unlockAtBlock}
              onChange={(e) => setUnlockAtBlock(e.target.value)}
              placeholder="Enter block height"
            required
            fullWidth
            size="small" 
            helperText="To execute an Unlock request, select Unblock at Block 0"
            />
        )}

        {timelockOption === 'setunlockdelay' && (
          <TextField
            label="Unlock Delay (Number of Blocks) *"
              type="number"
              value={unlockDelay}
              onChange={(e) => setUnlockDelay(e.target.value)}
              placeholder="Enter number of blocks for delay"
            required
            fullWidth
            size="small" 
            />
        )}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={returnTx} onChange={(e) => setReturnTx(e.target.checked)} color="primary" />}
              label="Return Transaction (for multi-sig)"
              sx={{ color: 'text.secondary'}} // Adjusted for consistency
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fee Offer (optional)"
                type="number"
                value={feeOffer}
                onChange={(e) => setFeeOffer(e.target.value)}
              placeholder="e.g., 0.0001 (default: standard fee)"
                inputProps={{ step: "0.0001" }}
              fullWidth
              size="small" 
              />
          </Grid>
        </Grid>
        
        <TextField
          label="Source of Funds (optional R-address or z-address)"
            type="text"
            value={sourceOfFunds}
            onChange={(e) => setSourceOfFunds(e.target.value)}
            placeholder="Enter address for fees"
          fullWidth
          size="small" 
          />

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>{error}</Alert>}
        {result && !error && (
          <Alert severity="success" sx={{ mt: 1, mb: 1, fontSize: '0.875rem', overflowWrap: 'break-word' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Success!</Typography>
            {typeof result === 'string' ? (
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {returnTx ? "Transaction Hex:" : "Transaction ID:"} {result}
              </Typography>
            ) : (
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(result, null, 2)}
              </Typography>
            )}
          </Alert>
        )}

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
            color="primary" 
            disabled={isLoading}
            sx={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            Set Timelock
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
    </StyledPaper>
  );
};

export default SetTimelockForm; 