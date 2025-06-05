import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { NodeContext } from '../../contexts/NodeContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { IdentityContext } from '../../contexts/IdentityContext';

const DetailItem = ({ label, value, isAddress = false, onCopy, isMonospace = true, breakAll = true, fullValue, compact = false, children }) => {
  if (value === undefined && !children) return null;
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null);
  const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null));

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.2 : 0.5, py: compact ? 0.1 : 0.25 }}>
      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: compact ? 100 : 130, flexShrink: 0, fontSize: compact ? '0.7rem' : '0.75rem', mr: 1 }}>{label}:</Typography>
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
            <IconButton onClick={() => onCopy(valueToCopy)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }}>
              <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const ZAddressDetailsMarketplace = ({ zAddressToDisplay, contextType = 'marketplace' }) => {
  const idContext = useContext(IdentityContext) || {};
  const { selectedZAddressForVDXF, selectedZAddressForCurrencyWS } = idContext;
  const marketplaceContext = useContext(MarketplaceIdentityContext);
  
  // Determine which context to use based on contextType
  let selectedAddressFromContext;
  
  // Log the context information for debugging
  console.log('[ZAddressDetailsMarketplace] Context type:', contextType);
  console.log('[ZAddressDetailsMarketplace] VDXF Z-Address:', selectedZAddressForVDXF);
  console.log('[ZAddressDetailsMarketplace] Currency Z-Address:', selectedZAddressForCurrencyWS);
  console.log('[ZAddressDetailsMarketplace] Marketplace Z-Address:', marketplaceContext?.selectedZAddress);
  
  switch (contextType) {
    case 'vdxf':
      selectedAddressFromContext = selectedZAddressForVDXF;
      console.log('[ZAddressDetailsMarketplace] Using VDXF context address:', selectedZAddressForVDXF);
      break;
    case 'currency':
      selectedAddressFromContext = selectedZAddressForCurrencyWS;
      console.log('[ZAddressDetailsMarketplace] Using Currency context address:', selectedZAddressForCurrencyWS);
      break;
    case 'marketplace':
    default:
      selectedAddressFromContext = marketplaceContext?.selectedZAddress;
      console.log('[ZAddressDetailsMarketplace] Using Marketplace context address:', marketplaceContext?.selectedZAddress);
      break;
  }
  
  // Use explicitly provided address or context address
  const finalZAddress = zAddressToDisplay || selectedAddressFromContext;
  console.log('[ZAddressDetailsMarketplace] Final Z-Address to display:', finalZAddress);

  const { sendCommand, nodeStatus } = useContext(NodeContext) || {};

  const [displayedZAddress, setDisplayedZAddress] = useState(null);
  const [displayedBalance, setDisplayedBalance] = useState('N/A');
  const [loadingDisplayedBalance, setLoadingDisplayedBalance] = useState(false);
  const [displayedBalanceError, setDisplayedBalanceError] = useState('');

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(String(text));
  };

  const fetchZAddressBalanceInternal = useCallback(async (zaddr) => {
    if (!zaddr || !sendCommand || !nodeStatus?.connected) {
      setDisplayedBalance('N/A');
      setDisplayedBalanceError(nodeStatus?.connected ? '' : 'Node not connected');
      setLoadingDisplayedBalance(false);
      return;
    }
    setLoadingDisplayedBalance(true);
    setDisplayedBalanceError('');
    setDisplayedBalance('Fetching...');
    try {
      const balanceResult = await sendCommand('z_getbalance', [zaddr, 0]);
      setDisplayedBalance(parseFloat(balanceResult).toFixed(8));
    } catch (err) {
      setDisplayedBalance('Error');
      setDisplayedBalanceError(err.message || 'Failed to fetch balance.');
    } finally {
      setLoadingDisplayedBalance(false);
    }
  }, [sendCommand, nodeStatus]);

  useEffect(() => {
    console.log('[ZAddressDetailsMarketplace] useEffect triggered with finalZAddress:', finalZAddress);
    if (finalZAddress) {
      setDisplayedZAddress(finalZAddress);
      fetchZAddressBalanceInternal(finalZAddress);
    } else {
      setDisplayedZAddress(null);
      setDisplayedBalance('N/A');
      setDisplayedBalanceError('');
      setLoadingDisplayedBalance(false);
    }
  }, [finalZAddress, fetchZAddressBalanceInternal, contextType]); // Added contextType dependency to ensure we update when tab changes

  if (!displayedZAddress) {
    return (
      <Paper sx={{ p: 1.5, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#ccc', mb: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>Z-Address Details</Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
            {contextType === 'vdxf' ? 'No Z-Address selected for VDXF.' : 'No Z-Address selected.'}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 1, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ color: '#fff', fontWeight: 'bold', wordBreak: 'break-all', fontSize: '0.9rem', mb: 1 }}>
        Z-Address{contextType === 'vdxf' ? ' (VDXF)' : contextType === 'currency' ? ' (Currency)' : ''}
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, pl: 0.5 }}>
        <DetailItem compact label="Z-Address" value={displayedZAddress} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true} />
        <DetailItem compact label="Balance">
          {loadingDisplayedBalance ?
            <CircularProgress size={14} sx={{ ml: 0 }} /> :
            <Typography variant="body2" sx={{ color: displayedBalanceError ? 'error.main' : '#ddd', fontSize: '0.7rem' }}>
              {displayedBalanceError ? displayedBalanceError : displayedBalance}
            </Typography>
          }
        </DetailItem>
      </Box>
    </Paper>
  );
};

export default ZAddressDetailsMarketplace; 