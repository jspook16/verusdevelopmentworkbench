import React, { useState } from 'react';
import { Box, Typography, Button, TextField, FormControlLabel, Checkbox, Tooltip, IconButton, Divider, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FormattedResultDisplay from './common/FormattedResultDisplay';

const RegisterIdentityForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  // Name Reservation state
  const [txid, setTxid] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState(1);
  const [parent, setParent] = useState('iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq');
  const [salt, setSalt] = useState('');
  const [referral, setReferral] = useState('');
  const [nameId, setNameId] = useState('');

  // Identity state
  const [primaryAddresses, setPrimaryAddresses] = useState(['']);
  const [minimumSignatures, setMinimumSignatures] = useState(1);
  const [revocationAuthority, setRevocationAuthority] = useState('');
  const [recoveryAuthority, setRecoveryAuthority] = useState('');
  const [privateAddress, setPrivateAddress] = useState('');

  // Advanced options
  const [returnTx, setReturnTx] = useState(false);
  const [feeOffer, setFeeOffer] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handlePrimaryAddressChange = (index, value) => {
    const updated = [...primaryAddresses];
    updated[index] = value;
    setPrimaryAddresses(updated);
  };

  const addPrimaryAddress = () => {
    setPrimaryAddresses([...primaryAddresses, '']);
  };

  const removePrimaryAddress = (index) => {
    const updated = primaryAddresses.filter((_, i) => i !== index);
    setPrimaryAddresses(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!txid || !name) {
      setError('Name Commitment TXID and Identity Name are required');
      setIsLoading(false);
      return;
    }

    try {
      const params = {
        txid,
        namereservation: {
          version,
          name,
          parent,
          salt,
          referral: referral.trim() || undefined,
          nameid: nameId.trim() || undefined
        },
        identity: {
          name,
          primaryaddresses: primaryAddresses.map(s => s.trim()).filter(Boolean),
          minimumsignatures: Number(minimumSignatures),
          revocationauthority: revocationAuthority.trim() || undefined,
          recoveryauthority: recoveryAuthority.trim() || undefined
        }
      };

      if (privateAddress.trim() !== '') {
        params.identity.privateaddress = privateAddress.trim();
      }

      if (!params.namereservation.referral) delete params.namereservation.referral;
      if (!params.namereservation.nameid) delete params.namereservation.nameid;

      let rpcParams = [params];
      const feeOfferTrimmed = feeOffer.toString().trim();
      const sourceOfFundsTrimmed = sourceOfFunds.trim();

      if (returnTx || feeOfferTrimmed !== '' || sourceOfFundsTrimmed !== '') {
        rpcParams.push(returnTx);
        if (feeOfferTrimmed !== '') {
          rpcParams.push(Number(feeOfferTrimmed));
          if (sourceOfFundsTrimmed !== '') rpcParams.push(sourceOfFundsTrimmed);
        } else if (sourceOfFundsTrimmed !== '') {
          rpcParams.push(0); 
          rpcParams.push(sourceOfFundsTrimmed);
        }
      }

      const commandResult = await sendRPCCommand('registeridentity', rpcParams, 'verusid');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'registeridentity');
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'registeridentity');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTxid('');
    setName('');
    setVersion(1);
    setParent('iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq');
    setSalt('');
    setReferral('');
    setNameId('');
    setPrimaryAddresses(['']);
    setMinimumSignatures(1);
    setRevocationAuthority('');
    setRecoveryAuthority('');
    setPrivateAddress('');
    setReturnTx(false);
    setFeeOffer('');
    setSourceOfFunds('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <Paper sx={{ p: 2, background: '#1e1e1e', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Register Identity</Typography>
      <form onSubmit={handleSubmit}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Fill in the details below. Fields will autofill from the previous step if available.
      </Typography>

      {/* Name Reservation Section */}
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 2 }}>
          Name Reservation Details
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
            label="Name Commitment TXID *"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="Enter name commitment TXID"
              required
              fullWidth
              size="small"
            />

            <TextField
            label="Identity Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter identity name"
              required
              fullWidth
              size="small"
            />

            <TextField
            label="Version"
              value={version}
              onChange={(e) => setVersion(Number(e.target.value))}
              type="number"
            placeholder="Enter version number (e.g., 1)"
              fullWidth
              size="small"
            />

            <TextField
            label="Parent Identity"
              value={parent}
              onChange={(e) => setParent(e.target.value)}
            placeholder="Enter parent identity (e.g., i-address or name@)"
              fullWidth
              size="small"
            />

            <TextField
            label="Salt"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
            placeholder="Enter salt value (hex string)"
              fullWidth
              size="small"
            />

            <TextField
            label="Referral Identity"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            placeholder="Enter referral identity (optional)"
              fullWidth
              size="small"
            />

            <TextField
            label="Name ID"
              value={nameId}
              onChange={(e) => setNameId(e.target.value)}
            placeholder="Enter name ID (i-address, optional)"
              fullWidth
              size="small"
            />
        </Box>
      </Box>

      {/* Identity Details Section */}
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 2 }}>
          Identity Details
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {primaryAddresses.map((addr, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                label={`Primary Address ${index + 1}${index === 0 ? ' *' : ''}`}
                value={addr}
                  onChange={(e) => handlePrimaryAddressChange(index, e.target.value)}
                placeholder="Enter primary R-Address"
                required={index === 0}
                  fullWidth
                  size="small"
                />
                <IconButton
                  onClick={() => removePrimaryAddress(index)}
                  disabled={primaryAddresses.length === 1}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
          <Button onClick={addPrimaryAddress} startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}>Add Primary Address</Button>

            <TextField
            label="Minimum Signatures *"
              value={minimumSignatures}
              onChange={(e) => setMinimumSignatures(Number(e.target.value))}
              type="number"
            placeholder="Enter minimum signatures required (e.g., 1)"
            required
              fullWidth
              size="small"
            />

                <TextField
            label="Revocation Authority *"
            value={revocationAuthority}
            onChange={(e) => setRevocationAuthority(e.target.value)}
                placeholder="Enter revocation authority (i-address or R-Address)"
            required
                  fullWidth
                  size="small"
                />

                <TextField
            label="Recovery Authority *"
            value={recoveryAuthority}
            onChange={(e) => setRecoveryAuthority(e.target.value)}
                placeholder="Enter recovery authority (i-address or R-Address)"
            required
                  fullWidth
                  size="small"
                />

          {/* Private Address */}
          <Typography variant="caption" sx={{ color: 'text.secondary', mt:1 }}>Private Address (Optional)</Typography>
          <TextField
            label="Private Address"
            value={privateAddress}
            onChange={(e) => setPrivateAddress(e.target.value)}
            placeholder="Enter a Z-address (e.g., zs1...)"
            fullWidth
            size="small"
            helperText="Optional Z-address to associate with the identity."
          />
        </Box>
      </Box>

      {/* Advanced Options */}
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 2 }}>
          Advanced Options
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={returnTx}
              onChange={(e) => setReturnTx(e.target.checked)}
            />
          }
          label="Return Transaction"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Fee Offer (VRSCTEST)
          </Typography>
          <TextField
            value={feeOffer}
            onChange={(e) => setFeeOffer(e.target.value)}
            placeholder="Enter fee offer (optional)"
            type="number"
            fullWidth
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Source of Funds
          </Typography>
          <TextField
            value={sourceOfFunds}
            onChange={(e) => setSourceOfFunds(e.target.value)}
            placeholder="Enter source of funds (optional)"
            fullWidth
            size="small"
          />
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Result Display */}
      {result && (
        <FormattedResultDisplay result={result} title="Registration Result" />
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !txid || !name}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? 'Processing...' : 'Register'}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={resetForm}
          disabled={isLoading}
        >
          Reset
        </Button>
      </Box>

      {/* Fee Estimate */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <InfoIcon color="info" fontSize="small" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Estimated transaction fee: 0.0001 VRSCTEST
        </Typography>
      </Box>
      </form>
    </Paper>
  );
};

export default RegisterIdentityForm; 