import React, { useState, useContext } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';
import FormattedResultDisplay from '../forms/common/FormattedResultDisplay';

const IdentityHistoryForm = () => {
  const [identityNameOrId, setIdentityNameOrId] = useState('');
  const [heightStart, setHeightStart] = useState('');
  const [heightEnd, setHeightEnd] = useState('');
  const [txProofs, setTxProofs] = useState(false);
  const [txProofHeight, setTxProofHeight] = useState('');

  const { sendCommand } = useVerusRpc();
  const opCtx = useContext(OperationContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    opCtx.setOperationLoading(true);
    opCtx.setOperationError('');
    opCtx.setOperationResult(null);

    const trimmedInput = identityNameOrId.trim();
    if (!trimmedInput) {
      opCtx.setOperationError('Identity Name or ID is required.');
      opCtx.setOperationLoading(false);
      return;
    }

    let identityParam;
    const isIAddress = /^i[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmedInput);

    if (isIAddress) {
      identityParam = trimmedInput; // Use i-address as is, without quotes, without @
    } else {
      // It's a friendly name
      if (trimmedInput.endsWith('@')) {
        identityParam = trimmedInput; // Already has @
      } else {
        identityParam = `${trimmedInput}@`; // Append @
      }
    }

    const params = [identityParam];
    if (heightStart.trim()) params.push(parseInt(heightStart, 10));
    if (heightEnd.trim()) params.push(parseInt(heightEnd, 10));
    
    if (txProofs) {
      params.push(true); 
      if (txProofHeight.trim()) {
        params.push(parseInt(txProofHeight, 10)); 
      }
    } else {
      if (txProofHeight.trim()) {
          console.warn("IdentityHistoryForm: txProofHeight is set but txProofs is false. txProofHeight will be ignored.");
      }
    }
    
    try {
      await sendCommand('getidentityhistory', params, 'query');
    } catch (err) {
      console.error('Error in IdentityHistoryForm:', err);
    }
  };
  
  const currentResult = opCtx.operationResult;

  return (
    <Paper sx={{ p: 2, background: '#181818' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Get Identity History</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Retrieve the historical states of an identity.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Identity Name or ID *"
          value={identityNameOrId}
          onChange={(e) => setIdentityNameOrId(e.target.value)}
          placeholder="name@ or i-address"
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
          label="Include Transaction Proofs for each state"
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
            {opCtx.operationLoading ? <CircularProgress size={24} /> : 'Get History'}
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
            Identity History {currentResult.fullyqualifiedname ? `for ${currentResult.fullyqualifiedname}` : ''}
          </Typography>
          
          {/* Display top-level fields using FormattedResultDisplay */}
          {(() => {
            const topLevelData = { ...currentResult };
            delete topLevelData.history; // Remove history array for this part
            // Remove other potentially large objects if they are not simple summary fields
            // For now, just removing history
            if (Object.keys(topLevelData).length > 0) {
              return <FormattedResultDisplay result={topLevelData} title="Summary Details" initialCompact={true} />;
            }
            return null;
          })()}
          
          {currentResult.history && Array.isArray(currentResult.history) && currentResult.history.length > 0 && <Divider sx={{my:2, borderColor:'#444'}}/>}

          {currentResult.history && Array.isArray(currentResult.history) && currentResult.history.length > 0 ? (
            currentResult.history.map((historyItem, index) => (
              <Accordion key={historyItem.txid || index} sx={{ background: '#181818', color:'#fff', mb: 1 }} defaultExpanded={index < 3 /* Expand first few by default */}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'#fff'}}/>}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems:'center' }}>
                    <Typography sx={{ fontSize: '14px', color: '#4caf50', fontWeight: 600 }}>
                      State at Block: {historyItem.height || historyItem.blockheight}
                    </Typography>
                    {historyItem.blocktime && 
                      <Typography sx={{ fontSize: '12px', color: '#bbb'}}>{new Date(historyItem.blocktime * 1000).toLocaleString()}</Typography>
                    }
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, background: '#1e1e1e', borderTop: '1px solid #333' }}>
                  {/* Use FormattedResultDisplay for the content of each history item */}
                  <FormattedResultDisplay result={historyItem.identity || historyItem} title="State Details" initialCompact={true} />
                </AccordionDetails>
              </Accordion>
            ))
          ) : currentResult.history && Array.isArray(currentResult.history) && currentResult.history.length === 0 ? (
            <Typography sx={{ color: '#bbb', fontStyle: 'italic' }}>
              No historical records found for this identity within the specified range.
            </Typography>
          ) : !currentResult.history ? (
             <Typography sx={{ color: '#bbb', fontStyle: 'italic' }}>
              Result does not contain a 'history' array. Displaying raw JSON:
              <pre>{JSON.stringify(currentResult, null, 2)}</pre>
            </Typography>
          ) : null}
        </Box>
      )}
    </Paper>
  );
};

export default IdentityHistoryForm; 