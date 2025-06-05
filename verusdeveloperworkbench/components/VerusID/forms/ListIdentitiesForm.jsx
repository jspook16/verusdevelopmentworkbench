import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert,
  Switch, FormControlLabel, Card, CardHeader, CardContent, 
  Collapse, IconButton, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { OperationContext } from '../../../contexts/OperationContext';
import { NodeContext } from '../../../contexts/NodeContext';
import { useVerusRpc } from '../../../hooks/useVerusRpc';

// Re-use the global cache if possible, or define a local one
// For simplicity, let's assume a local cache for this form for now.
const listFormParentCurrencyNameCache = new Map();

// Helper component for displaying key-value pairs with copy button
const DetailItem = ({ label, value, isMonospace = true, breakAll = true }) => {
  if (value === undefined || value === null) return null; 

  const handleCopy = (val) => {
    const stringVal = Array.isArray(val) ? val.join(', ') : String(val);
    navigator.clipboard.writeText(stringVal);
  };

  // Format value for display
  let displayValue;
  if (Array.isArray(value)) {
    displayValue = value.join(', \n');
  } else if (typeof value === 'object' && value !== null) {
    displayValue = JSON.stringify(value, null, 2);
  } else {
    displayValue = String(value);
  }

  // Determine if value is copyable
  const isCopyable = typeof value === 'string' || Array.isArray(value) || typeof value === 'object';

  return (
    <Box sx={{ mt: 0.25, mb: 0.25 }}>
      <Typography sx={{ fontSize: '11px', color: '#90caf9', fontWeight: 600 }}>{label}:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Typography sx={{ 
          fontSize: '11px', 
          color: '#ddd', 
          wordBreak: breakAll ? 'break-all' : 'normal', 
          fontFamily: isMonospace ? 'monospace' : 'inherit',
          whiteSpace: 'pre-wrap', 
          flexGrow: 1, 
          mr: 0.5
        }}>
          {displayValue}
        </Typography>
        {isCopyable && (
          <IconButton 
            onClick={() => handleCopy(typeof value === 'object' ? JSON.stringify(value) : value)} 
            size="small" 
            sx={{ p: 0.1, flexShrink: 0 }}
          >
            <ContentCopyIcon sx={{fontSize: '0.9rem'}} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

// Custom IdentityCard component for expandable/retractable cards
const IdentityCard = ({ identity, index }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Extract identity data
  const identityDetails = identity.identity || {};
  // Use displayName if available, otherwise fallback to original name logic
  const nameToDisplay = identity.displayName || identityDetails.name || "Unnamed Identity";
  const address = identityDetails.identityaddress || "No address";

  return (
    <Card sx={{ mb: 1, background: '#1c1c1c', color: '#fff', overflow: 'hidden' }}>
      <CardHeader 
        sx={{ 
          p: 1, 
          pb: 0.5,
          '& .MuiCardHeader-content': { overflow: 'hidden' }
        }}
        title={
          <Typography sx={{ fontSize: '13px', color: '#4caf50', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {nameToDisplay}
          </Typography>
        }
        subheader={
          <Typography sx={{ fontSize: '11px', color: '#bbb', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {address}
          </Typography>
        }
        action={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            sx={{ color: '#fff', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ borderColor: '#333' }} />
        <CardContent sx={{ bgcolor: '#181818', p: 1.5, pt: 1 }}>
          {/* Identity section */}
          {identityDetails && Object.keys(identityDetails).length > 0 && (
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 700, mb: 0.5 }}>
                Identity Details:
              </Typography>
              <Box sx={{ pl: 1 }}>
                {Object.entries(identityDetails).map(([key, value]) => (
                  <DetailItem key={`identity-${key}`} label={key} value={value} />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Show other fields from identity object that aren't in the identity property */}
          {Object.entries(identity).filter(([key]) => key !== 'identity' && key !== 'displayName').map(([key, value]) => (
            <Box key={key} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 700, mb: 0.5 }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </Typography>
              <Box sx={{ pl: 1 }}>
                {typeof value === 'object' && value !== null ? (
                  Object.entries(value).map(([subKey, subValue]) => (
                    <DetailItem key={`${key}-${subKey}`} label={subKey} value={subValue} />
                  ))
                ) : (
                  <DetailItem label={key} value={value} />
                )}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
};

const ListIdentitiesForm = () => {
  const [includeCanSpend, setIncludeCanSpend] = useState(true);
  const [includeCanSign, setIncludeCanSign] = useState(true);
  const [includeWatchOnly, setIncludeWatchOnly] = useState(false);

  const opCtx = useContext(OperationContext);
  const { nodeStatus, sendCommand: nodeSendCommand } = useContext(NodeContext);
  const { sendCommand, loading, error, RpcRequest } = useVerusRpc();

  const enrichIdentitiesWithDisplayNames = useCallback(async (identitiesArray) => {
    if (!Array.isArray(identitiesArray)) return [];

    const nativeChainIAddress = nodeStatus?.chainActive?.identityaddress || 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq'; // Fallback for VRSCTEST

    const enrichedIdentitiesPromises = identitiesArray.map(async (item) => {
      if (item && item.identity && item.identity.name) {
        const identityBase = item.identity;
        const originalName = identityBase.name;
        let displayName = originalName.endsWith('@') ? originalName : `${originalName}@`; // Default

        const parentIAddr = identityBase.parent;
        if (parentIAddr && parentIAddr !== nativeChainIAddress && parentIAddr !== identityBase.identityaddress) {
          let parentFriendlyName = listFormParentCurrencyNameCache.get(parentIAddr);
          if (!parentFriendlyName) {
            try {
              // Use nodeSendCommand for getcurrency as opCtx.sendCommand might be tied to OperationContext result/error handling
              const parentCurrencyData = await nodeSendCommand('getcurrency', [parentIAddr], `list_form_get_parent_curr_${parentIAddr}`);
              if (parentCurrencyData && parentCurrencyData.name) {
                parentFriendlyName = parentCurrencyData.name;
                listFormParentCurrencyNameCache.set(parentIAddr, parentFriendlyName);
              }
            } catch (e) {
              console.warn(`[ListIdentitiesForm] Error fetching parent currency name for ${parentIAddr}:`, e);
            }
          }
          if (parentFriendlyName) {
            displayName = `${originalName}.${parentFriendlyName}@`;
          }
        }
        return { ...item, displayName }; // Add displayName to the item
      }
      return item; // Return item as is if not processable
    });
    return Promise.all(enrichedIdentitiesPromises);
  }, [nodeStatus, nodeSendCommand]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    opCtx.setOperationLoading(true);
    opCtx.setOperationError('');
    opCtx.setOperationResult(null);

    // Validate that at least one filter is selected (as per original app logic)
    if (!includeCanSpend && !includeCanSign && !includeWatchOnly) {
      opCtx.setOperationError('Please select at least one filter option.');
      opCtx.setOperationLoading(false);
      return;
    }

    const params = [includeCanSpend, includeCanSign, includeWatchOnly];

    try {
      // Use the sendCommand from useVerusRpc hook
      const rawResult = await sendCommand('listidentities', params, 'query_listidentities_form');
      
      // Check if useVerusRpc hook already set the error in opCtx via its own error handling
      // For now, we assume rawResult is the direct output or contains an error property from the hook wrapper.
      if (rawResult && rawResult.error) {
        opCtx.setOperationError(typeof rawResult.error === 'string' ? rawResult.error : rawResult.error.message || 'Error executing command.');
        opCtx.setOperationResult(null);
      } else if (rawResult && Array.isArray(rawResult)) {
        const enrichedResult = await enrichIdentitiesWithDisplayNames(rawResult);
        opCtx.setOperationResult(enrichedResult);
        opCtx.setOperationError(''); // Clear error on success
      } else {
        opCtx.setOperationError('Invalid or unexpected result from listidentities.');
        opCtx.setOperationResult(null);
      }
    } catch (err) {
      console.error('Error in ListIdentitiesForm handleSubmit:', err);
      opCtx.setOperationError(err.message || 'An unexpected error occurred.');
      opCtx.setOperationResult(null);
    } finally {
      opCtx.setOperationLoading(false);
    }
  };

  // Update loading state based on useVerusRpc hook's loading state if needed, or keep manual.
  // For now, using manual setOperationLoading as before, but if useVerusRpc.loading is reliable, it could be used.
  useEffect(() => {
    // If useVerusRpc provides a loading state that OperationContext should reflect:
    // opCtx.setOperationLoading(loading); 
  }, [loading, opCtx]);

  useEffect(() => {
    // If useVerusRpc provides an error state that OperationContext should reflect:
    // if (error) opCtx.setOperationError(error.message || 'Error from RPC hook');
  }, [error, opCtx]);

  return (
    <Paper sx={{ p: 2, background: '#181818' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>List Identities (Filtered)</Typography>
      <Typography variant="body2" sx={{ color: '#bbb', fontStyle: 'italic', mb: 2 }}>
        List identities from the wallet based on filter criteria.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb:2 }}>
        <FormControlLabel
          control={<Switch checked={includeCanSpend} onChange={(e) => setIncludeCanSpend(e.target.checked)} />}
          label="Include identities I can spend and sign for"
          sx={{color: '#fff'}}
        />
        <FormControlLabel
          control={<Switch checked={includeCanSign} onChange={(e) => setIncludeCanSign(e.target.checked)} />}
          label="Include identities I can only sign for (not spend)"
          sx={{color: '#fff'}}
        />
        <FormControlLabel
          control={<Switch checked={includeWatchOnly} onChange={(e) => setIncludeWatchOnly(e.target.checked)} />}
          label="Include watch-only or co-signer identities"
          sx={{color: '#fff'}}
        />
        <Typography variant="caption" sx={{ color: '#bbb', fontStyle: 'italic', mt: 1 }}>
          Note: The daemon may need to be started with -idindex=1 for some filter combinations to work as expected.
        </Typography>

        {opCtx.operationError && (
          <Alert severity="error" sx={{ mt: 1 }}>{opCtx.operationError}</Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={opCtx.operationLoading || loading}
          >
            {(opCtx.operationLoading || loading) ? <CircularProgress size={24} /> : 'List Identities'}
          </Button>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={() => {
              setIncludeCanSpend(true);
              setIncludeCanSign(true);
              setIncludeWatchOnly(false);
              opCtx.setOperationError('');
              opCtx.setOperationResult(null);
            }}
            disabled={opCtx.operationLoading || loading}
          >
            Reset Filters
          </Button>
        </Box>
      </Box>

      {opCtx.operationResult && !opCtx.operationLoading && !loading && (
        <Box sx={{ mt: 2, p: 1.5, background: '#282828', borderRadius: 1, maxHeight: '60vh', overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontSize: '14px', color: '#fff', fontWeight: 700, mb: 1.5, pl: 1 }}>
            Found {Array.isArray(opCtx.operationResult) ? opCtx.operationResult.length : 0} Identities
          </Typography>
          
          {Array.isArray(opCtx.operationResult) && opCtx.operationResult.length > 0 ? (
            opCtx.operationResult.map((identity, index) => (
              <IdentityCard 
                key={identity.identity?.identityaddress || `identity-${index}`}
                identity={identity}
                index={index}
              />
            ))
          ) : Array.isArray(opCtx.operationResult) && opCtx.operationResult.length === 0 ? (
            <Typography sx={{ color: '#bbb', fontStyle: 'italic', p: 1 }}>
              No identities found matching the selected criteria.
            </Typography>
          ) : null}
        </Box>
      )}
    </Paper>
  );
};

export default ListIdentitiesForm; 