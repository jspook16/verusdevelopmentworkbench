import React, { useState, useContext, useCallback } from 'react';
import {
  Box, Typography, IconButton, Collapse, Tooltip, CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { NodeContext } from '../../contexts/NodeContext';
import JsonFieldRenderer from './JsonFieldRenderer'; // Assuming it's in the same directory

// Helper function to format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp * 1000).toLocaleString();
  } catch (e) {
    return 'Invalid Date';
  }
};

const TradeCard = ({ txid, details, onDelete }) => {
  const { sendCommand } = useContext(NodeContext);
  const [expanded, setExpanded] = useState(false);
  const [copiedTxid, setCopiedTxid] = useState(false);
  const [currencyCache, setCurrencyCache] = useState({}); // Local cache for this card

  // Basic currency lookup for this component
  const getCurrencyInfo = useCallback(async (currencyId) => {
    if (!currencyId || typeof currencyId !== 'string') return null;
    if (currencyCache[currencyId]) return currencyCache[currencyId];

    // console.log(`[TradeCard] Fetching currency info for: ${currencyId}`);
    try {
      const result = await sendCommand('getcurrency', [currencyId]);
      if (result && result.name) {
        setCurrencyCache(prev => ({ ...prev, [currencyId]: result }));
        return result;
      }
      return null;
    } catch (err) {
      // console.error(`[TradeCard] Error fetching currency info for ${currencyId}:`, err);
      return null;
    }
  }, [sendCommand, currencyCache]);

  const handleCopyTxid = () => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(true);
    setTimeout(() => setCopiedTxid(false), 1200);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Simple summary logic (can be expanded)
  const getSummary = () => {
    if (!details || !details.vout) return 'Details unavailable';
    // Example: Find first output amount/currency (needs refinement)
    const firstOutput = details.vout.find(vout => vout.value && vout.scriptPubKey?.currencies);
    if (firstOutput) {
        const currencyId = Object.keys(firstOutput.scriptPubKey.currencies)[0];
        const amount = firstOutput.value;
        // Very basic summary, needs currency name lookup eventually
        return `Output: ${amount.toFixed(4)} of ${currencyId.substring(0,8)}...`;
    }
    return 'Transaction details available.';
  }

  const time = details?.time || details?.timereceived;
  const confirmations = details?.confirmations ?? 'N/A';

  return (
    <Box sx={{ mb: 1.5, p: 1.2, background: '#1e1e1e', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
      {/* Compact Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box onClick={toggleExpand} sx={{ flexGrow: 1, cursor: 'pointer' }}>
          <Tooltip title={txid}>
            <Typography component="span" sx={{ color: '#a0cff9', fontSize: '0.75rem', mr: 0.5, verticalAlign: 'middle' }}>
              TXID: {txid.substring(0, 10)}...{txid.substring(txid.length - 6)}
            </Typography>
          </Tooltip>
          <IconButton onClick={(e) => { e.stopPropagation(); handleCopyTxid(); }} size="small" sx={{ p: 0.2, color: copiedTxid ? '#90caf9' : '#aaa' }} aria-label={`Copy Trade TXID ${txid}`}>
            <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
          <Typography sx={{ color: '#bbb', fontSize: '0.7rem', display: 'block', mt: 0.2 }}>
            Time: {formatTime(time)} ({confirmations} confs)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onDelete && (
            <Tooltip title="Delete Trade">
              <IconButton 
                onClick={(e) => { 
                  e.stopPropagation();
                  onDelete(txid); 
                }}
                size="small" 
                sx={{ color: '#c77', mr: 0.5 }}
              >
                <DeleteIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={(e) => { e.stopPropagation(); toggleExpand(); }} size="small" sx={{ color: '#ccc' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible Details */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #333' }}>
          <Typography sx={{ color: '#e0e0e0', fontSize: '0.8rem', mb: 1 }}>Full Details:</Typography>
          {/* Use JsonFieldRenderer to display nested details */}
          {details && typeof details === 'object' && Object.entries(details).map(([key, value]) => (
            <JsonFieldRenderer
              key={key} // Ensure unique keys if details object changes
              fieldKey={key}
              fieldValue={value}
              getCurrencyInfo={getCurrencyInfo} // Pass down the lookup function
              labelColor="#b3d1ff" // Slightly different colors for emphasis
              valueColor="#f0f0f0"
              indent={0}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default TradeCard; 