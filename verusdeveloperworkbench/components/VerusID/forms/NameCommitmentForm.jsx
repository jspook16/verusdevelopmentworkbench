import React, { useState, useContext } from 'react';
import { Box, Typography, Button, TextField, FormControlLabel, Checkbox, Tooltip, IconButton, Paper, CircularProgress, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { WorkbenchDataContext } from '../../../contexts/WorkbenchDataContext';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';
import { NodeContext } from '../../../contexts/NodeContext';
import FormattedResultDisplay from './common/FormattedResultDisplay';

const NameCommitmentForm = ({ sendRPCCommand, onCommandResponse, onCommandError }) => {
  // Get addNameCommitment from context
  const { addNameCommitment } = useContext(WorkbenchDataContext) || {};
  
  // Form state
  const [identityName, setIdentityName] = useState('');
  const [controlAddress, setControlAddress] = useState('');
  const [referralIdentity, setReferralIdentity] = useState('');
  const [parentIdentity, setParentIdentity] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!identityName) {
      setError('Identity name is required');
      setIsLoading(false);
      return;
    }
    if (!controlAddress) {
      setError('Control R-Address is required');
      setIsLoading(false);
      return;
    }

    try {
      // Build parameters list per RPC spec
      const paramsForRpc = [
        identityName.replace(/@+$/, ''), // Remove trailing @ if present
        controlAddress
      ];

      // For optional parameters, we need to ensure correct positioning.
      // If a later optional param is present, earlier ones might need "" or null.
      // registernamecommitment name controladdress referral parent sourceoffunds

      const referral = referralIdentity.trim();
      const parent = parentIdentity.trim();
      const fundsSource = sourceOfFunds.trim();

      if (referral || parent || fundsSource) {
        paramsForRpc.push(referral || ""); // Add referral or "" if empty but parent/fundsSource exists
        if (parent || fundsSource) {
          paramsForRpc.push(parent || ""); // Add parent or "" if empty but fundsSource exists
          if (fundsSource) {
            paramsForRpc.push(fundsSource);
          }
        }
      }
      
      // TEST: Temporarily re-adding returnTx and feeOffer for testing as per user request
      // These will be appended if set. The daemon's behavior with these as trailing
      // unnamed parameters for registernamecommitment is being tested.
      /* // Removed as per user testing indicating failures
      if (returnTx) { // If true
        paramsForRpc.push(true);
      }
      if (feeOffer && feeOffer.trim() !== '') { // If set and not empty
        const numericFeeOffer = Number(feeOffer);
        if (!isNaN(numericFeeOffer)) {
          paramsForRpc.push(numericFeeOffer);
        } else {
          console.warn('[NameCommitmentForm] Fee offer is not a valid number:', feeOffer);
          // Optionally, you could set an error here or prevent submission
        }
      }
      */

      console.log('[NameCommitmentForm] Params sent to RPC:', paramsForRpc);

      const commandResult = await sendRPCCommand('registernamecommitment', paramsForRpc, 'verusid');
      setResult(commandResult);
      if (onCommandResponse) onCommandResponse(commandResult, 'registernamecommitment');

      // --- SAVE COMMITMENT TO CONTEXT --- 
      if (addNameCommitment && commandResult && commandResult.txid && commandResult.namereservation) {
        const commitmentData = {
          txid: commandResult.txid,
          name: commandResult.namereservation.name, // From RPC result
          nameid: commandResult.namereservation.nameid, // From RPC result
          salt: commandResult.namereservation.salt, // From RPC result
          parent: commandResult.namereservation.parent || undefined, // From RPC result, ensure undefined if empty
          referral: commandResult.namereservation.referral || undefined, // From RPC result
          controlAddress: controlAddress, // Get from form state (required)
          sourceOfFunds: fundsSource || undefined, // Corrected to use fundsSource
          timestamp: new Date().toISOString(),
        };
        addNameCommitment(commitmentData);
        console.log('Saved commitment:', commitmentData);
      } else {
        console.warn('[NameCommitmentForm] Could not save commitment: missing addNameCommitment function, txid, or namereservation in result.', commandResult);
      }
      // ----------------------------------

    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      if (onCommandError) onCommandError(errorMessage, 'registernamecommitment');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIdentityName('');
    setControlAddress('');
    setReferralIdentity('');
    setParentIdentity('');
    setSourceOfFunds('');
    setError('');
    setResult(null);
    setIsLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
        Register a Name Commitment
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Name commitments require at least 1 confirmation before the identity can be registered.
      </Typography>

      {/* Identity Name */}
        <TextField
        label="Identity Name *"
          value={identityName}
        onChange={(e) => setIdentityName(e.target.value.replace(/@+$/, ''))} // Prevent/remove @
        placeholder="Enter unique name for commitment (no @)"
          required
          fullWidth
          size="small"
        InputProps={{
          endAdornment: (
            <Tooltip title="The name to commit to. Do not include '@' at this stage. Names must not have leading, trailing, or multiple consecutive spaces and must not include any of the following characters: \/:*?&quot;&lt;&gt;|@">
              <IconButton size="small" edge="end">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }}
      />

      {/* Control R-Address (required) */}
        <TextField
        label="Control R-Address *"
          value={controlAddress}
          onChange={(e) => setControlAddress(e.target.value)}
        placeholder="Control R-Address (must be in wallet, will be Primary Address)"
          required
          fullWidth
          size="small"
        InputProps={{
          endAdornment: (
            <Tooltip title="R-Address that will control this commitment and can be used to register the ID. This address must be in your wallet and will also be the Primary Address for the Identity. ">
              <IconButton size="small" edge="end">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }}
      />

      {/* Referral Identity */}
        <TextField
        label="Referral Identity"
          value={referralIdentity}
          onChange={(e) => setReferralIdentity(e.target.value)}
        placeholder="Referral Identity (e.g. referral@, optional)"
          fullWidth
          size="small"
        InputProps={{
          endAdornment: (
            <Tooltip title="Optional. Friendly name or i-address of an identity that referred you. Can lower network cost.">
              <IconButton size="small" edge="end">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }}
      />

      {/* Parent Identity */}
        <TextField
        label="Parent Identity"
          value={parentIdentity}
          onChange={(e) => setParentIdentity(e.target.value)}
        placeholder="Parent Identity (PBaaS-only, e.g. parentcurrencyid@, optional)"
          fullWidth
          size="small"
        InputProps={{
          endAdornment: (
            <Tooltip title="Optional. For creating IDs on a PBaaS chain. Enter the parent currency's i-address. If omitted, defaults to the current chain (e.g., VRSCTEST).">
              <IconButton size="small" edge="end">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }}
      />

      {/* Advanced Options */}
      <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 2 }}>
          Advanced Options
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <TextField
            label="Source of Funds (R or Z-Address)"
            value={sourceOfFunds}
            onChange={(e) => setSourceOfFunds(e.target.value)}
            placeholder="Source of Funds R or Z-Address (optional)"
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <Tooltip title="Optional. R-Address or Z-Address to use for transaction fees if you want to specify one. Otherwise, the wallet chooses.">
                  <IconButton size="small" edge="end">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }}
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
        <FormattedResultDisplay result={result} title="Name Commitment Result" />
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !identityName || !controlAddress}
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
    </Box>
  );
};

export default NameCommitmentForm; 