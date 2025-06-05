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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';

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

const StyledSelect = styled(Select)({
  color: '#fff',
  background: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '4px',
  width: '100%',
  '& .MuiSelect-icon': { color: '#c5c5c5' },
});

// Add definition for StyledTextField
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

const UpdateIdentityForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  // Identity to update
  const [identityName, setIdentityName] = useState('');

  // TODO: Add support for separate parent field for sub-identity updates
  // Recent discovery: Sub-identity updates require separate "name" and "parent" parameters
  // instead of the fully qualified name format. See updateidentity.md Example 10.
  // Current form only supports main identity updates with single name field.
  // Need to add:
  // - Detection if updating a sub-identity (contains dot in name)
  // - Separate parent field input when sub-identity is detected
  // - Modified command construction to use {"name": "subid@", "parent": "parent@"} format
  // - UI indicators to help users understand the difference

  // Fields for jsonidentity object
  const [primaryAddresses, setPrimaryAddresses] = useState(['']);
  const [minimumSignatures, setMinimumSignatures] = useState(''); // Can be optional, so empty initially
  const [revocationAuthority, setRevocationAuthority] = useState('');
  const [recoveryAuthority, setRecoveryAuthority] = useState('');
  const [flags, setFlags] = useState('');
  const [timelockValue, setTimelockValue] = useState(''); // For block height or delay
  const [privateAddress, setPrivateAddress] = useState(''); // New state for privateAddress
  const [contentMapEntries, setContentMapEntries] = useState([{ key: '', value: '' }]);
  const [contentMultiMapPrimaryEntries, setContentMultiMapPrimaryEntries] = useState([
    { primaryKey: '', nestedEntries: [{ nestedKey: '', jsonData: '' }] }
  ]);

  // Command-level options
  const [returnTx, setReturnTx] = useState(false);
  const [tokenUpdate, setTokenUpdate] = useState(false);
  const [feeOffer, setFeeOffer] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handlePrimaryAddressChange = (index, value) => {
    const updated = [...primaryAddresses];
    updated[index] = value;
    setPrimaryAddresses(updated);
  };
  const addPrimaryAddressField = () => setPrimaryAddresses([...primaryAddresses, '']);
  const removePrimaryAddressField = (index) => {
    const updated = primaryAddresses.filter((_, i) => i !== index);
    setPrimaryAddresses(updated.length > 0 ? updated : ['']);
  };

  const handleContentMapChange = (index, field, value) => {
    const updated = [...contentMapEntries];
    updated[index][field] = value;
    setContentMapEntries(updated);
  };
  const addContentMapEntry = () => setContentMapEntries([...contentMapEntries, { key: '', value: '' }]);
  const removeContentMapEntry = (index) => {
    const updated = contentMapEntries.filter((_, i) => i !== index);
    setContentMapEntries(updated.length > 0 ? updated : [{ key: '', value: '' }]);
  };

  // --- ContentMultiMap Handlers ---
  const handlePrimaryMultiMapKeyChange = (index, value) => {
    const updated = [...contentMultiMapPrimaryEntries];
    updated[index].primaryKey = value;
    setContentMultiMapPrimaryEntries(updated);
  };

  const addPrimaryMultiMapEntry = () => {
    setContentMultiMapPrimaryEntries([
      ...contentMultiMapPrimaryEntries,
      { primaryKey: '', nestedEntries: [{ nestedKey: '', jsonData: '' }] }
    ]);
  };

  const removePrimaryMultiMapEntry = (index) => {
    let updated = contentMultiMapPrimaryEntries.filter((_, i) => i !== index);
    if (updated.length === 0) updated = [{ primaryKey: '', nestedEntries: [{ nestedKey: '', jsonData: '' }] }];
    setContentMultiMapPrimaryEntries(updated);
  };

  const handleNestedMultiMapChange = (primaryIndex, nestedIndex, field, value) => {
    const updated = [...contentMultiMapPrimaryEntries];
    updated[primaryIndex].nestedEntries[nestedIndex][field] = value;
    setContentMultiMapPrimaryEntries(updated);
  };

  const addNestedMultiMapEntry = (primaryIndex) => {
    const updated = [...contentMultiMapPrimaryEntries];
    updated[primaryIndex].nestedEntries.push({ nestedKey: '', jsonData: '' });
    setContentMultiMapPrimaryEntries(updated);
  };

  const removeNestedMultiMapEntry = (primaryIndex, nestedIndex) => {
    const updated = [...contentMultiMapPrimaryEntries];
    updated[primaryIndex].nestedEntries = updated[primaryIndex].nestedEntries.filter((_, i) => i !== nestedIndex);
    if (updated[primaryIndex].nestedEntries.length === 0) {
      updated[primaryIndex].nestedEntries = [{ nestedKey: '', jsonData: '' }];
    }
    setContentMultiMapPrimaryEntries(updated);
  };
  // --- End ContentMultiMap Handlers ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!identityName.trim()) {
      setError('Identity Name to update is required.');
      setIsLoading(false);
      return;
    }

    const jsonIdentity = { name: identityName.trim() };

    const filledPrimaryAddresses = primaryAddresses.map(s => s.trim()).filter(Boolean);
    if (filledPrimaryAddresses.length > 0) jsonIdentity.primaryaddresses = filledPrimaryAddresses;
    if (minimumSignatures.trim() !== '') jsonIdentity.minimumsignatures = Number(minimumSignatures);
    if (revocationAuthority.trim() !== '') jsonIdentity.revocationauthority = revocationAuthority.trim();
    if (recoveryAuthority.trim() !== '') jsonIdentity.recoveryauthority = recoveryAuthority.trim();
    if (flags.trim() !== '') jsonIdentity.flags = Number(flags);
    if (timelockValue.trim() !== '') jsonIdentity.timelock = Number(timelockValue);
    if (privateAddress.trim() !== '') jsonIdentity.privateaddress = privateAddress.trim();

    // Assemble contentmap
    const validContentMapEntries = contentMapEntries.filter(entry => entry.key.trim() !== '' && entry.value.trim() !== '');
    if (validContentMapEntries.length > 0) {
      jsonIdentity.contentmap = {};
      validContentMapEntries.forEach(entry => {
        jsonIdentity.contentmap[entry.key.trim()] = entry.value.trim();
      });
    }

    // Assemble contentmultimap
    const validPrimaryMultiMapEntries = contentMultiMapPrimaryEntries.filter(pmEntry => pmEntry.primaryKey.trim() !== '');
    if (validPrimaryMultiMapEntries.length > 0) {
      jsonIdentity.contentmultimap = {};
      let parseError = false;
      validPrimaryMultiMapEntries.forEach(pmEntry => {
        const validNestedEntries = pmEntry.nestedEntries.filter(ne => ne.nestedKey.trim() !== '' && ne.jsonData.trim() !== '');
        if (validNestedEntries.length > 0) {
          if (!jsonIdentity.contentmultimap[pmEntry.primaryKey.trim()]) {
            jsonIdentity.contentmultimap[pmEntry.primaryKey.trim()] = [];
          }
          validNestedEntries.forEach(ne => {
            try {
              const parsedJsonData = JSON.parse(ne.jsonData.trim());
              jsonIdentity.contentmultimap[pmEntry.primaryKey.trim()].push({ [ne.nestedKey.trim()]: parsedJsonData });
            } catch (jsonErr) {
              setError(`Invalid JSON data for multi-map entry (Primary: ${pmEntry.primaryKey}, Nested: ${ne.nestedKey}): ${jsonErr.message}`);
              parseError = true;
            }
          });
        }
      });
      if (parseError) {
        setIsLoading(false);
        return;
      }
      if (Object.keys(jsonIdentity.contentmultimap).length === 0) delete jsonIdentity.contentmultimap; // Remove if all primary keys ended up empty
    }

    // Check if at least one updatable field is provided beyond the name
    const updatableFields = ['primaryaddresses', 'minimumsignatures', 'revocationauthority', 'recoveryauthority', 'flags', 'timelock', 'privateaddress', 'contentmap', 'contentmultimap'];
    const hasUpdates = updatableFields.some(field => jsonIdentity.hasOwnProperty(field));

    if (!hasUpdates) {
        setError('At least one property must be provided to update the identity.');
        setIsLoading(false);
        return;
    }

    const params = [jsonIdentity];
    params.push(returnTx);
    params.push(tokenUpdate);
    if (feeOffer) {
      params.push(Number(feeOffer));
      if (sourceOfFunds) params.push(sourceOfFunds.trim());
    } else if (sourceOfFunds) {
      params.push(0.0001); // Default fee
      params.push(sourceOfFunds.trim());
    }

    try {
      const commandResult = await sendRPCCommand('updateidentity', params, 'updateidentity');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'updateidentity');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'updateidentity');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIdentityName('');
    setPrimaryAddresses(['']);
    setMinimumSignatures('');
    setRevocationAuthority('');
    setRecoveryAuthority('');
    setFlags('');
    setTimelockValue('');
    setPrivateAddress('');
    setContentMapEntries([{ key: '', value: '' }]);
    setContentMultiMapPrimaryEntries([{ primaryKey: '', nestedEntries: [{ nestedKey: '', jsonData: '' }] }]);
    setReturnTx(false);
    setTokenUpdate(false);
    setFeeOffer('');
    setSourceOfFunds('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', mb: 2 }}>Update Identity</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Modify the properties of an existing identity. Only provide fields you wish to change.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Identity Name or ID to Update *"
          value={identityName}
          onChange={(e) => setIdentityName(e.target.value)}
          placeholder="Enter name@ or i-address of the identity to update"
          required
          fullWidth
          size="small"
        />

        {/* Identity Definition Fields - Optional */}
        <Accordion sx={{ background: '#232323', color: '#fff'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }}/>}>
            <Typography sx={{fontWeight: 'bold'}}>Identity Properties (Optional Updates)</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {primaryAddresses.map((address, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Primary Address ${index + 1}`}
                  value={address}
                  onChange={(e) => handlePrimaryAddressChange(index, e.target.value)}
                  placeholder="Enter R-address or i-address"
                  fullWidth
                  size="small"
                />
                {primaryAddresses.length > 1 || (primaryAddresses.length === 1 && address.trim() !== '') ? (
                  <IconButton onClick={() => removePrimaryAddressField(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                ) : null}
        </Box>
            ))}
            <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addPrimaryAddressField} size="small" sx={{alignSelf: 'flex-start'}}>Add Primary Address</Button>

            <TextField
              label="Minimum Signatures"
              type="number"
              value={minimumSignatures}
              onChange={(e) => setMinimumSignatures(e.target.value)}
              placeholder="e.g., 1 (leave blank to keep unchanged)"
              fullWidth
              size="small"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              label="Revocation Authority"
              value={revocationAuthority}
              onChange={(e) => setRevocationAuthority(e.target.value)}
              placeholder="Enter i-address (leave blank to keep unchanged)"
              fullWidth
              size="small"
            />
            <TextField
              label="Recovery Authority"
              value={recoveryAuthority}
              onChange={(e) => setRecoveryAuthority(e.target.value)}
              placeholder="Enter i-address (leave blank to keep unchanged)"
              fullWidth
              size="small"
            />
            <TextField
              label="Flags (Numeric)"
              type="number"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="e.g., 0 or 1 (leave blank to keep unchanged)"
              fullWidth
              size="small"
            />
            <TextField
              label="Timelock (Block Height or Delay)"
              type="number"
              value={timelockValue}
              onChange={(e) => setTimelockValue(e.target.value)}
              placeholder="e.g., 123456 or 20160"
              helperText="Set a future block height or a block delay (approx. 2 weeks if 20160) for unlocking."
              fullWidth
              size="small"
            />

            {/* Private Address - Moved here */}
            <StyledTextField
              label="Private Address (Optional Z-address)"
              value={privateAddress}
              onChange={(e) => setPrivateAddress(e.target.value)}
              placeholder="Enter a Z-address (e.g., zs1...)"
              helperText="Optionally specify a private Z-address. This will be stored with the identity."
              fullWidth
              size="small"
            />
          </AccordionDetails>
        </Accordion>

        {/* ContentMap Section */}
        <Accordion sx={{ background: '#232323', color: '#fff'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }}/>}>
            <Typography sx={{fontWeight: 'bold'}}>Content Map (Optional)</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {contentMapEntries.map((entry, index) => (
              <Grid container spacing={1} key={index} alignItems="center">
                <Grid item xs={5.5}>
                  <TextField
                    label={`Key ${index + 1}`}
                    value={entry.key}
                    onChange={(e) => handleContentMapChange(index, 'key', e.target.value)}
                    placeholder="VDXF Key (e.g., profile.image.primary)"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={5.5}>
                  <TextField
                    label={`Value ${index + 1}`}
                    value={entry.value}
                    onChange={(e) => handleContentMapChange(index, 'value', e.target.value)}
                    placeholder="Data or VDXF Hash"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={1} sx={{ textAlign: 'right' }}>
                  {contentMapEntries.length > 1 || (contentMapEntries.length === 1 && (entry.key.trim() !== '' || entry.value.trim() !== '')) ? (
                    <IconButton onClick={() => removeContentMapEntry(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                  ) : null}
            </Grid>
              </Grid>
            ))}
            <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addContentMapEntry} size="small" sx={{alignSelf: 'flex-start'}}>Add Content Map Entry</Button>
          </AccordionDetails>
        </Accordion>

        {/* ContentMultiMap Section */}
        <Accordion sx={{ background: '#232323', color: '#fff'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }}/>}>
            <Typography sx={{fontWeight: 'bold'}}>Content Multi-Map (Optional)</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {contentMultiMapPrimaryEntries.map((primaryEntry, pIndex) => (
              <Paper key={`primary-${pIndex}`} sx={{ p: 2, background: '#1c1c1c', border: '1px solid #383838' }}>
                <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5}}>
                    <Grid item xs={11}>
                        <TextField
                            label={`Primary Key ${pIndex + 1}`}
                            value={primaryEntry.primaryKey}
                            onChange={(e) => handlePrimaryMultiMapKeyChange(pIndex, e.target.value)}
                            placeholder="Primary VDXF Key"
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: 'right' }}>
                        {contentMultiMapPrimaryEntries.length > 1 || (contentMultiMapPrimaryEntries.length === 1 && primaryEntry.primaryKey.trim() !== '') ? (
                            <IconButton onClick={() => removePrimaryMultiMapEntry(pIndex)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                        ) : null}
                    </Grid>
                </Grid>
                {primaryEntry.nestedEntries.map((nestedEntry, nIndex) => (
                  <Grid container spacing={1} key={`nested-${pIndex}-${nIndex}`} alignItems="center" sx={{ mb: 1 }}>
                    <Grid item xs={5}>
                      <TextField
                        label={`Nested Key ${nIndex + 1}`}
                        value={nestedEntry.nestedKey}
                        onChange={(e) => handleNestedMultiMapChange(pIndex, nIndex, 'nestedKey', e.target.value)}
                        placeholder="Nested VDXF Key"
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label={`JSON Data ${nIndex + 1}`}
                        value={nestedEntry.jsonData}
                        onChange={(e) => handleNestedMultiMapChange(pIndex, nIndex, 'jsonData', e.target.value)}
                        placeholder='{ "message": "hello" }'
                        multiline
                        minRows={1}
                        maxRows={3}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: 'right' }}>
                        {primaryEntry.nestedEntries.length > 1 || (primaryEntry.nestedEntries.length === 1 && (nestedEntry.nestedKey.trim() !== '' || nestedEntry.jsonData.trim() !== '')) ? (
                            <IconButton onClick={() => removeNestedMultiMapEntry(pIndex, nIndex)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                        ): null}
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={() => addNestedMultiMapEntry(pIndex)} size="small" sx={{mt:1}}>Add Nested Entry</Button>
              </Paper>
        ))}
            <Button startIcon={<AddCircleOutlineIcon />} variant="outlined" onClick={addPrimaryMultiMapEntry} size="small" sx={{alignSelf: 'flex-start', mt:1}}>Add Primary Multi-Map Entry</Button>
          </AccordionDetails>
        </Accordion>

        {/* Command Options */}
        <Accordion sx={{ background: '#232323', color: '#fff'}} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }}/>}>
            <Typography sx={{fontWeight: 'bold'}}>Command Options</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={returnTx} onChange={(e) => setReturnTx(e.target.checked)} color="primary" />}
                  label="Return Transaction"
                  sx={{ color: 'text.secondary'}}
                />
          </Grid>
          <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={tokenUpdate} onChange={(e) => setTokenUpdate(e.target.checked)} color="primary" />}
                  label="Use Tokenized ID Control for Update"
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
          </AccordionDetails>
        </Accordion>

        {error && <Alert severity="error" sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>{error}</Alert>}
        {result && !error && <Alert severity="success" sx={{ mt: 1, mb: 1, overflowWrap: 'break-word' }}><Typography variant="body2" sx={{ fontWeight: 'bold' }}>Success!</Typography><Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{returnTx ? "Transaction Hex:" : "Transaction ID:"} {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</Typography></Alert>}
        {isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}><CircularProgress size={24} /><Typography sx={{ color: '#bbb' }}>Processing...</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}><Button type="submit" variant="contained" color="primary" disabled={isLoading}>Update Identity</Button><Button type="button" variant="outlined" onClick={resetForm} disabled={isLoading}>Reset Form</Button></Box>
      </Box>
    </StyledPaper>
  );
};

export default UpdateIdentityForm; 