import React, { useState, useContext } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';

// Re-using the generic key-value renderer for accordion details.
const renderKeyValuePairs = (data, indent = 0) => {
  if (typeof data !== 'object' || data === null) {
    return <Typography sx={{ fontFamily: 'monospace', ml: indent, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{String(data)}</Typography>;
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
        <Box key={key} sx={{ display: 'flex', my: 0.5, flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#90caf9' }}>{key}:</Typography>
          <Box sx={{ pl: 2 }}>{renderKeyValuePairs(value, 0)}</Box>
        </Box>
      ))}
    </Box>
  );
};

const IdentitiesWithRecoveryForm = () => {
  const [identityId, setIdentityId] = useState('');
  const [fromHeight, setFromHeight] = useState('');
  const [toHeight, setToHeight] = useState('');
  const [unspent, setUnspent] = useState(false);

  const { sendCommand } = useVerusRpc();
  const opCtx = useContext(OperationContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    opCtx.setOperationLoading(true);
    opCtx.setOperationError('');
    opCtx.setOperationResult(null);

    if (!identityId.trim()) {
      opCtx.setOperationError('Identity ID is required.');
      opCtx.setOperationLoading(false);
      return;
    }

    const queryParams = { identityid: identityId.trim() };
    if (fromHeight.trim()) queryParams.fromheight = parseInt(fromHeight, 10);
    if (toHeight.trim()) queryParams.toheight = parseInt(toHeight, 10);
    if (unspent) queryParams.unspent = true;
    
    const params = [queryParams];

    try {
      await sendCommand('getidentitieswithrecovery', params, 'query');
    } catch (err) {
      console.error('Error in IdentitiesWithRecoveryForm:', err);
    }
  };
  
  const currentResult = opCtx.operationResult;

  return (
    <Paper sx={{ p: 2, background: '#181818' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Identities With Recovery Authority</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Find identities that have the specified identity as their recovery authority.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Recovery Authority Identity ID *"
          value={identityId}
          onChange={(e) => setIdentityId(e.target.value)}
          placeholder="Enter i-address of the recovery authority"
          required
          fullWidth
        />
        <TextField
          label="From Height (optional)"
          type="number"
          value={fromHeight}
          onChange={(e) => setFromHeight(e.target.value)}
          fullWidth
        />
        <TextField
          label="To Height (optional)"
          type="number"
          value={toHeight}
          onChange={(e) => setToHeight(e.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={unspent} onChange={(e) => setUnspent(e.target.checked)} />}
          label="Unspent States Only"
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
            {opCtx.operationLoading ? <CircularProgress size={24} /> : 'Find Identities'}
          </Button>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={() => {
              setIdentityId('');
              setFromHeight('');
              setToHeight('');
              setUnspent(false);
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
            Found {Array.isArray(currentResult) ? currentResult.length : 0} Identities
          </Typography>
          {Array.isArray(currentResult) && currentResult.length > 0 ? (
            currentResult.map((item, index) => (
              <Accordion key={item.identity?.identityaddress || item.txid || index} sx={{ background: '#181818', color:'#fff', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#fff'}}/>}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontSize: '14px', color: '#4caf50', fontWeight: 600 }}>
                      {item.identity?.name || item.name || "Unnamed Identity"}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                      {item.identity?.identityaddress || item.identityaddress || "No i-address"}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, background: '#1e1e1e', borderTop: '1px solid #333' }}>
                  {renderKeyValuePairs(item)}
                </AccordionDetails>
              </Accordion>
            ))
          ) : Array.isArray(currentResult) && currentResult.length === 0 ? (
            <Typography sx={{ color: '#bbb', fontStyle: 'italic' }}>
              No identities found with the specified recovery authority.
            </Typography>
          ) : (
            <Typography sx={{ color: '#bbb', fontStyle: 'italic' }}>
              Unexpected result format. Displaying raw JSON:
              <pre>{JSON.stringify(currentResult, null, 2)}</pre>
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default IdentitiesWithRecoveryForm; 