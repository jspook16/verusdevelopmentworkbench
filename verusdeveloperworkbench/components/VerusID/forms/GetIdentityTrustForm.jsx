import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';
import FormattedResultDisplay from '../forms/common/FormattedResultDisplay';

const GetIdentityTrustForm = () => {
  const [identityIds, setIdentityIds] = useState('');
  
  const { sendCommand } = useVerusRpc();
  const { 
    operationLoading,
    operationError,
    operationResult,
    setOperationLoading,
    setOperationError,
    setOperationResult
  } = useContext(OperationContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setOperationError('');
    setOperationResult(null);

    const params = [];
    if (identityIds.trim() !== '') {
      params.push(identityIds.split(',').map(id => id.trim()).filter(id => id));
    }

    try {
      await sendCommand('getidentitytrust', params, 'query');
    } catch (err) {
      console.error("Error in GetIdentityTrustForm handleSubmit:", err);
    } finally {
      // Loading is handled by useVerusRpc hook
    }
  };

  const currentResult = operationResult;

  return (
    <Paper sx={{ p: 2, background: '#181818' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Test Query for Identity Trust</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        Retrieve trust ratings for specific identities or all identities.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Identity IDs (comma-separated, optional)"
          value={identityIds}
          onChange={(e) => setIdentityIds(e.target.value)}
          placeholder="e.g., identityA@,identityB@"
          variant="outlined"
          fullWidth
          InputLabelProps={{ style: { color: '#bbb' } }}
          inputProps={{ style: { color: '#fff' } }}
          sx={{ 
            borderColor: '#444',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#444' },
              '&:hover fieldset': { borderColor: '#666' },
              '&.Mui-focused fieldset': { borderColor: '#90caf9' },
            }
          }}
        />
        
        {operationError && (
          <Alert severity="error" sx={{ mt: 1 }}>{operationError}</Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={operationLoading}
            sx={{ fontSize: '14px' }}
          >
            {operationLoading ? <CircularProgress size={24} /> : 'Get Identity Trust'}
          </Button>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={() => {
              setIdentityIds('');
              setOperationError('');
              setOperationResult(null);
            }}
            disabled={operationLoading}
            sx={{ fontSize: '14px' }}
          >
            Reset Form
          </Button>
        </Box>
      </Box>

      {currentResult && !operationLoading && (
        <Box sx={{ mt: 3, p: 2, background: '#232323', borderRadius: 1 }}>
          <FormattedResultDisplay result={currentResult} title="Identity Trust Information" initialCompact={true} />
        </Box>
      )}
    </Paper>
  );
};

export default GetIdentityTrustForm; 