import React, { useState, useContext } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';

// Helper to render key-value pairs (can be moved to a utils file later)
const renderKeyValuePairs = (data, indent = 0) => {
  if (typeof data !== 'object' || data === null) {
    return <Typography sx={{ fontFamily: 'monospace', ml: indent }}>{String(data)}</Typography>;
  }
  if (Array.isArray(data)) {
    return (
      <Box sx={{ ml: indent }}>
        {data.map((item, idx) => (
          <Box key={idx}>{renderKeyValuePairs(item, indent + 2)}</Box>
        ))}
      </Box>
    );
  }
  return (
    <Box sx={{ ml: indent }}>
      {Object.entries(data).map(([key, value]) => (
        <Box key={key} sx={{ display: 'flex', my: 0.5 }}>
          <Typography sx={{ fontWeight: 'bold', minWidth: '150px', mr: 1, fontFamily: 'monospace' }}>{key}:</Typography>
          <Box sx={{ flexGrow: 1 }}>{renderKeyValuePairs(value, 0)}</Box>
        </Box>
      ))}
    </Box>
  );
};

const IdentityContentForm = () => {
  const [identityNameOrId, setIdentityNameOrId] = useState('');
  const [heightStart, setHeightStart] = useState('');
  const [heightEnd, setHeightEnd] = useState('');
  const [txProofs, setTxProofs] = useState(false);
  const [txProofHeight, setTxProofHeight] = useState('');
  const [vdxfKey, setVdxfKey] = useState('');
  const [keepDeleted, setKeepDeleted] = useState(false);

  const { sendCommand } = useVerusRpc();
  const opCtx = useContext(OperationContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    opCtx.setOperationLoading(true);
    opCtx.setOperationError('');
    opCtx.setOperationResult(null);

    if (!identityNameOrId.trim()) {
      opCtx.setOperationError('Identity Name or ID is required.');
      opCtx.setOperationLoading(false);
      return;
    }

    const params = [identityNameOrId.trim()];
    if (heightStart.trim()) params.push(parseInt(heightStart, 10));
    if (heightEnd.trim()) params.push(parseInt(heightEnd, 10));
    if (txProofs) params.push(true);
    if (txProofHeight.trim() && txProofs) params.push(parseInt(txProofHeight, 10));
    else if (txProofs) params.push(0); // Default proof height if txProofs is true but no height given
    if (vdxfKey.trim()) params.push(vdxfKey.trim());
    if (keepDeleted) params.push(true);

    try {
      await sendCommand('getidentitycontent', params, 'query');
    } catch (err) {
      // Error is set by useVerusRpc hook
      console.error('Error in IdentityContentForm:', err);
    }
  };

  const currentResult = opCtx.operationResult;

  return (
    <Paper sx={{ p: 2, background: '#181818' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Get Identity Content</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Identity Name or ID *"
          value={identityNameOrId}
          onChange={(e) => setIdentityNameOrId(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Height Start (optional)"
          type="number"
          value={heightStart}
          onChange={(e) => setHeightStart(e.target.value)}
          fullWidth
        />
        <TextField
          label="Height End (optional)"
          type="number"
          value={heightEnd}
          onChange={(e) => setHeightEnd(e.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={txProofs} onChange={(e) => setTxProofs(e.target.checked)} />}
          label="Include Transaction Proofs"
          sx={{color: '#fff'}}
        />
        {txProofs && (
          <TextField
            label="TX Proof Height (optional, for proofs)"
            type="number"
            value={txProofHeight}
            onChange={(e) => setTxProofHeight(e.target.value)}
            fullWidth
          />
        )}
        <TextField
          label="VDXF Key Filter (optional)"
          value={vdxfKey}
          onChange={(e) => setVdxfKey(e.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={keepDeleted} onChange={(e) => setKeepDeleted(e.target.checked)} />}
          label="Keep Deleted Content (if applicable)"
          sx={{color: '#fff'}}
        />

        {opCtx.operationError && (
          <Alert severity="error" sx={{ mt: 1 }}>{opCtx.operationError}</Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={opCtx.operationLoading}
          >
            {opCtx.operationLoading ? <CircularProgress size={24} /> : 'Get Content'}
          </Button>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={() => {
              setIdentityNameOrId('');
              setHeightStart('');
              setHeightEnd('');
              setTxProofs(false);
              setTxProofHeight('');
              setVdxfKey('');
              setKeepDeleted(false);
              opCtx.setOperationError('');
              opCtx.setOperationResult(null);
            }}
            disabled={opCtx.operationLoading}
          >
            Reset Form
          </Button>
        </Box>
      </Box>

      {currentResult && !opCtx.operationLoading && (
        <Box sx={{ mt: 3, p: 2, background: '#232323', borderRadius: 1, maxHeight: '60vh', overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 700, mb: 2 }}>
            Identity Content Result
          </Typography>
          {/* Render the result - can be quite nested. Using a generic renderer for now. */}
          {renderKeyValuePairs(currentResult)}
        </Box>
      )}
    </Paper>
  );
};

export default IdentityContentForm; 