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
  Select,
  MenuItem,
  IconButton,
  TextField,
  FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { styled } from '@mui/system';

// Assuming styled components are defined elsewhere or copy them
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

const StyledSelect = styled(Select)({
  color: '#fff',
  background: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '4px',
  width: '100%',
  '& .MuiSelect-icon': { color: '#c5c5c5' },
});

const SetIdentityTrustForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  const [clearAll, setClearAll] = useState(false);
  const [setRatings, setSetRatings] = useState([{ id: '', rating: 'approved' }]);
  const [removeRatings, setRemoveRatings] = useState(['']);
  const [identityTrustMode, setIdentityTrustMode] = useState(0);
  const [useSetRatings, setUseSetRatings] = useState(true);
  const [useRemoveRatings, setUseRemoveRatings] = useState(false);
  const [useTrustMode, setUseTrustMode] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Handlers for setRatings array
  const handleSetRatingChange = (index, field, value) => {
    const updated = [...setRatings];
    updated[index][field] = value;
    setSetRatings(updated);
  };
  const addSetRatingField = () => setSetRatings([...setRatings, { id: '', rating: 'approved' }]);
  const removeSetRatingField = (index) => setSetRatings(setRatings.filter((_, i) => i !== index));

  // Handlers for removeRatings array
  const handleRemoveRatingChange = (index, value) => {
    const updated = [...removeRatings];
    updated[index] = value;
    setRemoveRatings(updated);
  };
  const addRemoveRatingField = () => setRemoveRatings([...removeRatings, '']);
  const removeRemoveRatingField = (index) => setRemoveRatings(removeRatings.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    const commandParams = {};
    if (clearAll) commandParams.clearall = true;

    if (useSetRatings && setRatings.length > 0 && setRatings.some(r => r.id.trim() !== '')) {
      commandParams.setratings = {};
      setRatings.forEach(item => {
        if (item.id.trim()) commandParams.setratings[item.id.trim()] = { rating: item.rating };
      });
    }

    if (useRemoveRatings && removeRatings.length > 0 && removeRatings.some(id => id.trim() !== '')) {
      commandParams.removeratings = removeRatings.filter(id => id.trim());
    }
    
    if (useTrustMode) {
        commandParams.identitytrustmode = Number(identityTrustMode);
    }

    if (Object.keys(commandParams).length === 0) {
      setError('No options selected. Please configure at least one trust setting.');
      setIsLoading(false);
      return;
    }

    try {
      const commandResult = await sendRPCCommand('setidentitytrust', [commandParams], 'setidentitytrust');
      setResult(commandResult); // setidentitytrust usually returns null on success
      if (onCommandResponse) onCommandResponse(commandResult, 'setidentitytrust');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'setidentitytrust');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setClearAll(false);
    setSetRatings([{ id: '', rating: 'approved' }]);
    setRemoveRatings(['']);
    setIdentityTrustMode(0);
    setUseSetRatings(true);
    setUseRemoveRatings(false);
    setUseTrustMode(true);
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Set Identity Trust</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>Manage wallet-level trust lists for identities.</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormControlLabel
          control={<Switch checked={clearAll} onChange={(e) => setClearAll(e.target.checked)} color="primary" />}
          label="Clear All Existing Trust Lists First"
          sx={{ color: 'text.secondary', mb: 1 }}
        />

        <Box sx={{border: '1px solid #444', p:2, borderRadius: '4px'}}>
            <FormControlLabel
              control={<Switch checked={useSetRatings} onChange={(e) => setUseSetRatings(e.target.checked)} color="primary" size="small"/>}
              labelPlacement="end"
              label={<Typography variant="subtitle1" sx={{ color: useSetRatings ? '#90caf9' : 'text.secondary', fontWeight: 'bold'}}>Set/Update Ratings</Typography>}
              sx={{ mb: 1.5 }}
            />
            {useSetRatings && setRatings.map((item, index) => (
            <Grid container spacing={1} key={index} sx={{ mb: 1.5, alignItems: 'center' }}>
                <Grid item xs={6.5}>
                  <TextField
                    label={`Identity ID ${index + 1}`}
                    value={item.id}
                    onChange={(e) => handleSetRatingChange(index, 'id', e.target.value)}
                    placeholder="e.g., MyFriend@"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={3.5}>
                  <TextField
                    label={`Rating ${index + 1}`}
                    value={item.rating}
                    onChange={(e) => handleSetRatingChange(index, 'rating', e.target.value)}
                    select
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={2} sx={{textAlign: 'right'}}>
                <IconButton onClick={() => removeSetRatingField(index)} size="small" sx={{color: '#f44336'}} disabled={setRatings.length === 1 && index === 0 && !item.id.trim() }><RemoveCircleOutlineIcon /></IconButton>
                </Grid>
            </Grid>
            ))}
            {useSetRatings && <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addSetRatingField} size="small">Add Rating</Button>}
        </Box>
        
        <Box sx={{border: '1px solid #444', p:2, borderRadius: '4px'}}>
            <FormControlLabel
              control={<Switch checked={useRemoveRatings} onChange={(e) => setUseRemoveRatings(e.target.checked)} color="primary" size="small"/>}
              labelPlacement="end"
              label={<Typography variant="subtitle1" sx={{ color: useRemoveRatings ? '#90caf9' : 'text.secondary', fontWeight: 'bold'}}>Remove Ratings</Typography>}
              sx={{ mb: 1.5 }}
            />
            {useRemoveRatings && removeRatings.map((id, index) => (
            <Grid container spacing={1} key={index} sx={{ mb: 1.5, alignItems: 'center' }}>
                <Grid item xs={10}>
                  <TextField
                    label={`Identity ID to Remove ${index + 1}`}
                    value={id}
                    onChange={(e) => handleRemoveRatingChange(index, e.target.value)}
                    placeholder="Identity ID to remove rating for"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={2} sx={{textAlign: 'right'}}>
                <IconButton onClick={() => removeRemoveRatingField(index)} size="small" sx={{color: '#f44336'}} disabled={removeRatings.length === 1 && index === 0 && !id.trim()}><RemoveCircleOutlineIcon /></IconButton>
                </Grid>
            </Grid>
            ))}
            {useRemoveRatings && <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addRemoveRatingField} size="small">Add ID to Remove</Button>}
        </Box>

        <Box sx={{border: '1px solid #444', p:2, borderRadius: '4px'}}>
            <FormControlLabel
              control={<Switch checked={useTrustMode} onChange={(e) => setUseTrustMode(e.target.checked)} color="primary" size="small"/>}
              labelPlacement="end"
              label={<Typography variant="subtitle1" sx={{ color: useTrustMode ? '#90caf9' : 'text.secondary', fontWeight: 'bold'}}>Set Identity Trust Mode</Typography>}
              sx={{ mb: useTrustMode ? 1.5 : 0 }}
            />
            {useTrustMode && 
              <TextField
                label="Identity Trust Mode"
                value={identityTrustMode}
                onChange={(e) => setIdentityTrustMode(Number(e.target.value))}
                select
                fullWidth
                size="small"
              >
                    <MenuItem value={0}>0: No restriction on sync</MenuItem>
                    <MenuItem value={1}>1: Only sync to IDs rated approved</MenuItem>
                    <MenuItem value={2}>2: Sync to all IDs BUT those on block list</MenuItem>
              </TextField>
            }
        </Box>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>{error}</Alert>}
        {result === null && !error && isLoading === false && (
          <Alert severity="success" sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>
            Set identity trust operation successful.
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ color: '#bbb' }}>Processing request...</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading} sx={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            Set Trust Settings
          </Button>
          <Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading} sx={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            Reset Form
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default SetIdentityTrustForm; 