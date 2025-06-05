import React, { useState } from 'react';
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
  TextField,
  AlertTitle,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import { styled } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FormattedResultDisplay from './common/FormattedResultDisplay';

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
  '&::placeholder': { color: '#777' },
  '&:hover': { borderColor: '#666' },
  '&.Mui-focused': { borderColor: '#90caf9' },
});

const StyledTextField = styled(TextField)({
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

const RecoverIdentityForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  // State for jsonidentity fields
  const [identityName, setIdentityName] = useState('');
  const [primaryAddresses, setPrimaryAddresses] = useState(['']); // Array for multiple addresses
  const [minimumSignatures, setMinimumSignatures] = useState(1);
  const [revocationAuthority, setRevocationAuthority] = useState('');
  const [recoveryAuthority, setRecoveryAuthority] = useState('');
  // Optional fields for jsonidentity can be added if needed: contentmap, contentmultimap, flags, timelock

  // State for other recoveridentity params
  const [returnTx, setReturnTx] = useState(false);
  const [tokenRecover, setTokenRecover] = useState(false);
  const [feeOffer, setFeeOffer] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handlePrimaryAddressChange = (index, value) => {
    const updatedAddresses = [...primaryAddresses];
    updatedAddresses[index] = value;
    setPrimaryAddresses(updatedAddresses);
  };

  const addPrimaryAddressField = () => {
    setPrimaryAddresses([...primaryAddresses, '']);
  };

  const removePrimaryAddressField = (index) => {
    const updatedAddresses = primaryAddresses.filter((_, i) => i !== index);
    setPrimaryAddresses(updatedAddresses.length > 0 ? updatedAddresses : ['']); // Ensure at least one field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!identityName || primaryAddresses.some(addr => !addr.trim())) {
      setError('Identity Name and at least one Primary Address are required.');
      setIsLoading(false);
      return;
    }

    const jsonIdentity = {
      name: identityName,
      primaryaddresses: primaryAddresses.filter(addr => addr.trim()), // Filter out empty strings
      minimumsignatures: Number(minimumSignatures),
      revocationauthority: revocationAuthority,
      recoveryauthority: recoveryAuthority,
      // Add other optional jsonidentity fields here if they are included in the form
    };

    const params = [jsonIdentity];

    params.push(returnTx);
    params.push(tokenRecover);

    if (feeOffer) {
      params.push(Number(feeOffer));
      if (sourceOfFunds) {
        params.push(sourceOfFunds);
      }
    } else if (sourceOfFunds) {
      params.push(0.0001); // Default fee if only source of funds is set
      params.push(sourceOfFunds);
    }

    try {
      const commandResult = await sendRPCCommand('recoveridentity', params, 'recoveridentity');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'recoveridentity');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'recoveridentity');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIdentityName('');
    setPrimaryAddresses(['']);
    setMinimumSignatures(1);
    setRevocationAuthority('');
    setRecoveryAuthority('');
    setReturnTx(false);
    setTokenRecover(false);
    setFeeOffer('');
    setSourceOfFunds('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>
        Recover Identity
      </Typography>
      <Alert severity="warning" sx={{ mt: 0, mb:2, background: '#3e2723', color: '#ffccbc'}}>
        <AlertTitle sx={{fontWeight: 'bold'}}>Be Careful: Recovering</AlertTitle>
        Recover all assets to a new address. Funds and UTXOs can be spent again.
      </Alert>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Recover an identity using its recovery authority. This redefines the identity.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#90caf9', fontWeight: 'bold', borderBottom: '1px solid #444', pb: 1, mb: 0.5}}>
          New Identity Definition
        </Typography>
        
        <TextField
          label="Identity Name (must match existing identity to recover) *"
          value={identityName}
          onChange={(e) => setIdentityName(e.target.value)}
          placeholder="e.g., MyIdentity@"
          required
          fullWidth
          size="small"
        />

        {primaryAddresses.map((address, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label={`Primary Address ${index + 1} *`}
              value={address}
              onChange={(e) => handlePrimaryAddressChange(index, e.target.value)}
              placeholder="Enter R-address or i-address"
              required
              fullWidth
              size="small"
            />
                {primaryAddresses.length > 1 && (
              <Button variant="outlined" color="error" size="small" onClick={() => removePrimaryAddressField(index)} sx={{height: '40px' /* Match TextField small height */}}>
                <RemoveIcon />
              </Button>
                )}
          </Box>
        ))}
        <Button variant="outlined" onClick={addPrimaryAddressField} startIcon={<AddIcon />} sx={{alignSelf: 'flex-start'}} size="small">
          Add Primary Address
        </Button>

        <TextField
          label="Minimum Signatures *"
          type="number"
          value={minimumSignatures}
          onChange={(e) => setMinimumSignatures(Math.max(1, Number(e.target.value)))}
          placeholder="e.g., 1"
          required
          fullWidth
          size="small"
          InputProps={{ inputProps: { min: 1 } }}
        />

        <TextField
          label="New Revocation Authority (i-address) *"
          value={revocationAuthority}
          onChange={(e) => setRevocationAuthority(e.target.value)}
          placeholder="Enter i-address"
          required
          fullWidth
          size="small"
        />

        <TextField
          label="New Recovery Authority (i-address) *"
          value={recoveryAuthority}
          onChange={(e) => setRecoveryAuthority(e.target.value)}
          placeholder="Enter i-address"
          required
          fullWidth
          size="small"
        />
        
        <Typography variant="subtitle1" sx={{ color: '#90caf9', fontWeight: 'bold', borderBottom: '1px solid #444', pb: 1, mt: 1, mb:0.5 }}>
          Command Options
        </Typography>

        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={returnTx} onChange={(e) => setReturnTx(e.target.checked)} color="primary" />}
              label="Return Transaction"
              sx={{ color: 'text.secondary'}}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Switch checked={tokenRecover} onChange={(e) => setTokenRecover(e.target.checked)} color="primary" />}
              label="Use Tokenized Control"
              sx={{ color: 'text.secondary'}}
            />
          </Grid>
        </Grid>

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
        
        <TextField
          label="Source of Funds (optional)"
          value={sourceOfFunds}
          onChange={(e) => setSourceOfFunds(e.target.value)}
          placeholder="R-address or z-address for fees"
          fullWidth
          size="small"
        />

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>{error}</Alert>}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ color: '#bbb' }}>Processing request...</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button type="submit" variant="contained" color="warning" disabled={isLoading} sx={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            Recover Identity
          </Button>
          <Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading} sx={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            Reset Form
          </Button>
        </Box>
      </Box>

      {/* Result Display */}
      {result && (
        <FormattedResultDisplay result={result} title="Recovery Result" />
      )}
    </StyledPaper>
  );
};

export default RecoverIdentityForm; 