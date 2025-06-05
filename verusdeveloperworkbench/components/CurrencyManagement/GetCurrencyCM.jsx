import React, { useState, useContext, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TextField, CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { NodeContext } from '../../contexts/NodeContext';
import { TerminalContext } from '../../contexts/TerminalContext'; // For logging RPC commands

// Recursive DetailItem/Value Renderer for complex JSON
const JsonDetailItem = ({ label, value, onCopy, path = '', compact = true, indentLevel = 0 }) => {
  const handleLocalCopy = () => {
    const valueToCopy = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    if (onCopy && typeof onCopy === 'function') {
      onCopy(valueToCopy);
    } else {
      navigator.clipboard.writeText(valueToCopy);
    }
  };

  const sxLabel = {
    fontWeight: '500',
    color: '#a0cff9',
    minWidth: compact ? (90 - indentLevel * 10) : (120 - indentLevel * 15),
    flexShrink: 0,
    fontSize: compact ? '0.7rem' : '0.75rem',
    mr: 1,
    lineHeight: 1.4,
    pl: indentLevel * 1.5, // Indentation for keys
  };

  const sxValue = {
    color: '#ddd',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    fontSize: compact ? '0.7rem' : '0.75rem',
    lineHeight: 1.4,
  };

  if (typeof value === 'object' && value !== null) {
    return (
      <Box sx={{ mt: 0.25, mb: 0.25, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography variant="body2" sx={sxLabel}>{label}:</Typography>
          {label && (
            <Tooltip title={`Copy ${label} (JSON)`}>
              <IconButton onClick={handleLocalCopy} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, ml: 'auto' }} aria-label={`Copy ${label}`}>
                <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {Array.isArray(value) ? (
          value.map((item, index) => (
            <JsonDetailItem key={`${path}.${index}`} label={`[${index}]`} value={item} onCopy={onCopy} compact={compact} indentLevel={indentLevel + 1} path={`${path}.${index}`} />
          ))
        ) : (
          Object.entries(value).map(([key, val]) => (
            <JsonDetailItem key={`${path}.${key}`} label={key} value={val} onCopy={onCopy} compact={compact} indentLevel={indentLevel + 1} path={`${path}.${key}`} />
          ))
        )}
      </Box>
    );
  }

  // Primitive value rendering
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.25 : 0.5, py: compact ? 0.1 : 0.25, minHeight: compact ? '18px' : '24px', width: '100%' }}>
      <Typography variant="body2" sx={sxLabel}>{label}:</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="span" variant="body2" sx={sxValue}>
          {String(value)}
        </Typography>
        {label && (
          <Tooltip title={`Copy ${label}: ${String(value)}`}>
            <IconButton onClick={handleLocalCopy} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' } }} aria-label={`Copy ${label}`}>
              <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const GetCurrencyCM = () => {
  const [currencyInput, setCurrencyInput] = useState('');
  const [currencyData, setCurrencyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { sendCommand } = useContext(NodeContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);

  const handleFetchCurrency = async () => {
    if (!sendCommand) {
      setError('sendCommand function not available.');
      return;
    }
    setIsLoading(true);
    setError('');
    setCurrencyData(null);
    const params = currencyInput.trim() ? [currencyInput.trim()] : [];
    const rpcContext = `getcurrency_${currencyInput.trim() || 'currentchain'}`;

    try {
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: 'getcurrency', params: params, status: 'executing', type: 'query'});
      const result = await sendCommand('getcurrency', params, rpcContext);
      setCurrencyData(result);
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: 'getcurrency', params: params, result: result, status: 'success', type: 'query'});
    } catch (err) {
      console.error('Error fetching currency:', err);
      setError(err.message || 'Failed to fetch currency data.');
      if(addRpcCommandToHistory) addRpcCommandToHistory({command: 'getcurrency', params: params, result: err.message, status: 'error', type: 'query'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = (dataToCopy) => {
    navigator.clipboard.writeText(dataToCopy);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1, bgcolor: '#1e1e1e' }}>
      <Typography variant="h6" sx={{ color: '#fff', fontSize: '1rem', mb: 1 }}>
        Get Currency
      </Typography>
      <Paper sx={{ p: 2, background: '#2c2c2c', mb: 2 }}>
        <TextField
          fullWidth
          label="Currency Name or ID (optional)"
          value={currencyInput}
          onChange={(e) => setCurrencyInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') { handleFetchCurrency(); e.preventDefault(); } }}
          size="small"
          variant="outlined"
          InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
          inputProps={{ sx: { fontSize: '0.9rem', color: '#fff' } }}
          sx={{ mb: 1, bgcolor:'#3d3d3d' }}
        />
        <Button
          variant="contained"
          onClick={handleFetchCurrency}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isLoading ? 'Fetching...' : 'Get Currency'}
        </Button>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {currencyData && (
        <Paper sx={{ p: 1.5, background: '#2c2c2c', flexGrow: 1, overflowY: 'auto', border:'1px solid #444' }}>
          <JsonDetailItem label="Currency Data" value={currencyData} onCopy={handleCopyJson} indentLevel={-1} /* Start with -1 to have first level keys at 0 indent */ />
        </Paper>
      )}
    </Box>
  );
};

export default GetCurrencyCM; 