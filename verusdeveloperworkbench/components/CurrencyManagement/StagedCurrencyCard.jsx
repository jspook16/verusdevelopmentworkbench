import React, { useState, useContext } from 'react';
import { Card, CardContent, Typography, Button, IconButton, Box, Tooltip, CircularProgress, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { NodeContext } from '../../contexts/NodeContext';
import DetailItem from '../common/DetailItem';

// Helper function for recursively rendering parameter values
const renderStagedParamValue = (value, indentLevel = 0) => {
  const sxProps = { 
    fontSize: '0.7rem', 
    color: '#ddd', 
    whiteSpace: 'pre-wrap', 
    wordBreak: 'break-all',
    ml: indentLevel * 1.5 // Indent nested items (using 1.5 for slightly more indent)
  };

  if (Array.isArray(value)) {
    return (
      <Box sx={{ width: '100%', mt: indentLevel > 0 ? 0.5 : 0 }}>
        {value.map((item, index) => (
          <Box key={index} sx={{ display: 'block', width: '100%' }}>
            {/* For arrays of simple values, display them directly, else recurse */}
            {typeof item === 'object' && item !== null ? 
              renderStagedParamValue(item, indentLevel + 1) : 
              <Typography component="span" sx={{...sxProps, ml: (indentLevel + 1) * 1.5}}>{String(item)}</Typography>}
          </Box>
        ))}
      </Box>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <Box sx={{ width: '100%', mt: indentLevel > 0 ? 0.5 : 0}}>
        {Object.entries(value).map(([k, v]) => (
          <Box key={k} sx={{ display: 'block', width: '100%', mt: 0.5 }}>
            <Typography component="span" sx={{...sxProps, color: '#a0cff9', ml: indentLevel * 1.5 }}>{k}: </Typography>
            {renderStagedParamValue(v, indentLevel + 1)}
          </Box>
        ))}
      </Box>
    );
  }
  // For primitive values, ensure they are on their own line if not part of an object/array directly above.
  // If indentLevel is 0, it means it's a direct value of a DetailItem, already handled by DetailItem's own value display if not an object.
  // This path is mostly for values within arrays/objects.
  return <Typography component="span" sx={sxProps}>{String(value)}</Typography>; 
};

const StagedCurrencyCard = ({ definition }) => {
  const { removeStagedCurrencyDefinition } = useContext(WorkbenchDataContext);
  const { sendCommand } = useContext(NodeContext);
  const [loadingSend, setLoadingSend] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendResultTxid, setSendResultTxid] = useState('');

  const { inputParams, defineTxid, rawHex } = definition;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(String(text)); // Ensure text is string for clipboard
  };

  const abbreviateHex = (hex, startLength = 8, endLength = 8) => {
    if (!hex || hex.length <= startLength + endLength) return hex;
    return `${hex.substring(0, startLength)}...${hex.substring(hex.length - endLength)}`;
  };

  const handleSendRawTransaction = async () => {
    if (!rawHex) {
      setSendError('No raw hex transaction available to send.');
      return;
    }
    setLoadingSend(true);
    setSendError('');
    setSendResultTxid('');
    try {
      const result = await sendCommand('sendrawtransaction', [rawHex], `send_raw_staged_${defineTxid}`);
      setSendResultTxid(result);
    } catch (err) {
      console.error('Error sending raw transaction:', err);
      setSendError(err.message || 'Failed to send raw transaction.');
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <Card sx={{ mb: 2, background: '#2c2c2c', border: '1px solid #444' }}>
      <CardContent sx={{ p: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontSize: '1rem', wordBreak: 'break-all' }}>
            {inputParams.name}
          </Typography>
          <Tooltip title="Remove this staged definition">
            <IconButton onClick={() => removeStagedCurrencyDefinition(defineTxid)} size="small" sx={{ color: '#ff6b6b' }}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <DetailItem compact label="Define TXID" value={defineTxid} onCopy={handleCopy} isAddress hideTooltip={false} />
        <DetailItem compact label="Options" value={String(inputParams.options)} onCopy={handleCopy} isMonospace={false} />
        <DetailItem compact label="Proof Protocol" value={String(inputParams.proofprotocol)} onCopy={handleCopy} isMonospace={false} />
        <DetailItem compact label="End Block" value={String(inputParams.endblock)} onCopy={handleCopy} isMonospace={false} />
        
        {inputParams.preallocations && (
          <DetailItem compact label="Preallocations" hideTooltip={true} >
            <Box sx={{ maxHeight: '80px', overflowY: 'auto', width: '100%', mt:0.5 }}>
              {renderStagedParamValue(inputParams.preallocations)} 
            </Box>
          </DetailItem>
        )}
        
        {Object.entries(inputParams).map(([key, value]) => {
          if (['name', 'options', 'proofprotocol', 'endblock', 'preallocations'].includes(key.toLowerCase())) return null;
          if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
          if (Array.isArray(value) && value.length === 0) return null;
          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return null;

          const isComplex = typeof value === 'object' && value !== null;
          
          return (
            <DetailItem 
              compact 
              key={key} 
              label={key.charAt(0).toUpperCase() + key.slice(1)} 
              value={isComplex ? `(see details)` : String(value).substring(0,30) + (String(value).length > 30 ? '...':'')} 
              fullValue={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              onCopy={handleCopy}
              isMonospace={false} 
              hideTooltip={isComplex}
            >
              {isComplex && (
                 <Box sx={{mt: 0.5, width: '100%', maxHeight: '80px', overflowY: 'auto'}}> 
                    {renderStagedParamValue(value)}
                 </Box>
              )}
            </DetailItem>
          );
        })}

        <DetailItem compact label="Raw TX Hex" value={abbreviateHex(rawHex)} fullValue={rawHex} onCopy={handleCopy} isAddress hideTooltip={false} />

        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            startIcon={loadingSend ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSendRawTransaction}
            disabled={loadingSend || !rawHex || !!sendResultTxid}
            sx={{fontSize: '0.75rem'}}
          >
            {sendResultTxid ? 'Transaction Sent' : (loadingSend ? 'Sending...' : 'Send Raw Transaction')}
          </Button>
          {sendError && <Alert severity="error" sx={{mt:1, fontSize:'0.7rem', p:'0px 8px'}}>{sendError}</Alert>}
          {sendResultTxid && 
            <Alert severity="success" sx={{mt:1, fontSize:'0.7rem', p:'0px 8px', wordBreak: 'break-all'}}>
              Broadcast TXID: {sendResultTxid}
            </Alert>
          }
        </Box>
      </CardContent>
    </Card>
  );
};

export default StagedCurrencyCard; 