import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';

// DetailItem component (copied for now - move to utils later)
const DetailItem = ({ label, value, isAddress = false, onCopy, isMonospace = true, breakAll = true, fullValue, compact = false, children }) => {
  if (value === undefined && !children) return null; 
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null);
  const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null));

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.2 : 0.5, py: compact ? 0.1 : 0.25}}>
      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: compact ? 100 : 130, flexShrink:0, fontSize: compact ? '0.7rem' : '0.75rem', mr:1 }}>{label}:</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="div" variant="body2" sx={{ 
            color: '#ddd', 
            wordBreak: breakAll ? 'break-all' : 'normal', 
            whiteSpace: Array.isArray(value) ? 'normal' : (isMonospace ? 'pre-wrap' : 'normal'),
            fontFamily: isMonospace ? 'monospace' : 'inherit',
            fontSize: compact ? '0.7rem' : '0.75rem',
            lineHeight: compact ? 1.3 : 1.4,
            pr: (isAddress && valueToCopy) ? 0.5 : 0
          }}>
          {children ? children : displayValue}
        </Typography>
        {isAddress && valueToCopy && (
          <Tooltip title={`Copy ${label}`}>
            <IconButton onClick={() => onCopy(valueToCopy)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}, flexShrink: 0}}>
              <ContentCopyIcon sx={{fontSize: compact ? '0.8rem' : '0.9rem'}}/>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const ZAddressDetailsWM = () => {
  const { selectedZAddressWM } = useContext(IdentityContext) || {};
  const { sendCommand, nodeStatus } = useContext(NodeContext) || {};

  const [displayedZAddress, setDisplayedZAddress] = useState(null);
  const [displayedBalance, setDisplayedBalance] = useState('N/A');
  const [loadingDisplayedBalance, setLoadingDisplayedBalance] = useState(false);
  const [displayedBalanceError, setDisplayedBalanceError] = useState('');

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(String(text));
  };

  const fetchZAddressBalanceInternal = useCallback(async (zaddr) => {
    if (!zaddr || !sendCommand || !nodeStatus.connected) {
      setDisplayedBalance('N/A');
      setDisplayedBalanceError(nodeStatus.connected ? '' : 'Node not connected');
      setLoadingDisplayedBalance(false); // Ensure loading is stopped
      return;
    }
    setLoadingDisplayedBalance(true);
    setDisplayedBalanceError('');
    setDisplayedBalance('Fetching...');
    try {
      const balanceResult = await sendCommand('z_getbalance', [zaddr, 0]);
      setDisplayedBalance(parseFloat(balanceResult).toFixed(8));
    } catch (err) {
      console.error(`Error fetching balance for Z-Address ${zaddr}:`, err);
      setDisplayedBalance('Error');
      setDisplayedBalanceError(err.message || 'Failed to fetch balance.');
    } finally {
      setLoadingDisplayedBalance(false);
    }
  }, [sendCommand, nodeStatus.connected]);

  useEffect(() => {
    if (selectedZAddressWM) {
      setDisplayedZAddress(selectedZAddressWM);
      fetchZAddressBalanceInternal(selectedZAddressWM);
    } else {
      // If selectedZAddressWM is null (cleared from its list), clear local display
      setDisplayedZAddress(null);
      setDisplayedBalance('N/A');
      setDisplayedBalanceError('');
      setLoadingDisplayedBalance(false);
    }
  }, [selectedZAddressWM, fetchZAddressBalanceInternal]);

  if (!displayedZAddress) { 
    return (
      <Paper sx={{p:1.5, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display:'flex', flexDirection:'column'}}>
        <Typography variant="subtitle2" sx={{color: '#ccc', mb:1, textAlign:'center'}}>Z-Address Details</Typography>
        <Box sx={{flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Typography sx={{color: '#888', fontSize: '0.9rem'}}>No Z-Address selected.</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{p:1, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display:'flex', flexDirection:'column'}}>
      <Typography variant="subtitle2" sx={{color: '#ccc', mb:1, textAlign:'center', fontSize: '0.85rem', fontWeight:600}}>Z-Address Details</Typography>
      <Box sx={{flexGrow:1, overflowY:'auto', pr:0.5, pl:0.5}}>
        <DetailItem compact label="Z-Address" value={displayedZAddress} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true}/>
        <DetailItem compact label="Balance">
          {loadingDisplayedBalance ? 
              <CircularProgress size={14} sx={{ml:0}}/> : 
              <Typography variant="body2" sx={{ color: displayedBalanceError ? 'error.main' : '#ddd', fontSize: '0.7rem' }}>
                  {displayedBalanceError ? displayedBalanceError : displayedBalance}
              </Typography>
          }
        </DetailItem>
      </Box>
    </Paper>
  );
};

export default ZAddressDetailsWM; 