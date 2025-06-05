import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, Tooltip, IconButton, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import JsonFieldRenderer from './JsonFieldRenderer';

const DetailItem = ({ label, value, isAddress = false, onCopy, isMonospace = true, breakAll = true, fullValue, compact = false, children, hideTooltip = false }) => {
  if (value === undefined && !children) return null; 
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null);
  const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null));

  const CopyButton = (
    <IconButton 
      onClick={() => onCopy(valueToCopy)} 
      size="small" 
      sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }} 
      aria-label={`Copy ${label}`}
    >
      <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
    </IconButton>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.25 : 0.5, py: compact ? 0.1 : 0.25, minHeight: compact ? '18px' : '24px' }}>
      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: compact ? 90 : 120, flexShrink: 0, fontSize: compact ? '0.7rem' : '0.75rem', mr: 1, lineHeight: compact ? 1.2 : 1.4 }}>{label}:</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="div" variant="body2" sx={{ 
            color: '#ddd', 
            wordBreak: breakAll ? 'break-all' : 'normal', 
            whiteSpace: Array.isArray(value) ? 'normal' : (isMonospace ? 'pre-wrap' : 'normal'),
            fontFamily: isMonospace ? 'monospace' : 'inherit',
            fontSize: compact ? '0.7rem' : '0.75rem',
            lineHeight: compact ? 1.2 : 1.4,
            pr: (isAddress && valueToCopy) ? 0.5 : 0
          }}>
          {children ? children : displayValue}
        </Typography>
        {isAddress && valueToCopy && (
          hideTooltip ? CopyButton : <Tooltip title={`Copy ${label}: ${valueToCopy}`}>{CopyButton}</Tooltip>
        )}
      </Box>
    </Box>
  );
};

const RAddressDetailsMarketplace = ({ rAddressToDisplay, contextType = 'marketplace' }) => {
  const idContext = useContext(IdentityContext);
  const marketplaceContext = useContext(MarketplaceIdentityContext);
  
  // Determine which context to use based on contextType
  let selectedAddressFromContext;
  
  switch (contextType) {
    case 'vdxf':
      selectedAddressFromContext = idContext.selectedRAddressForVDXF;
      break;
    case 'currency':
      selectedAddressFromContext = idContext.selectedRAddressForCurrencyWS;
      break;
    case 'marketplace':
    default:
      selectedAddressFromContext = marketplaceContext.selectedRAddress;
      break;
  }
  
  // Use explicitly provided address or context address
  const finalRAddress = rAddressToDisplay || selectedAddressFromContext;

  const { identities } = useContext(IdentityContext) || {};
  const { rAddressData, getCopyString } = useContext(WorkbenchDataContext) || {};
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const [currencyCache, setCurrencyCache] = useState({});
  const [displayedAllBalances, setDisplayedAllBalances] = useState(null);
  const [sortedBalancesForDisplay, setSortedBalancesForDisplay] = useState([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const [displayedRAddress, setDisplayedRAddress] = useState(null);
  const [displayedAssociatedIDs, setDisplayedAssociatedIDs] = useState([]);

  const getCurrencyInfo = useCallback(async (currencyIdentifier) => {
    if (!currencyIdentifier || typeof currencyIdentifier !== 'string') return null;
    if (currencyCache[currencyIdentifier]) return currencyCache[currencyIdentifier];
    try {
      const result = await sendCommand('getcurrency', [currencyIdentifier]);
      if (result && result.name) {
        setCurrencyCache(prev => ({ ...prev, [currencyIdentifier]: result }));
        return result;
      }
      return null;
    } catch (err) { return null; }
  }, [sendCommand, currencyCache]);

  const handleCopy = (text) => {
    const stringToCopy = getCopyString ? getCopyString(text) : String(text);
    if (stringToCopy) navigator.clipboard.writeText(stringToCopy);
  };

  useEffect(() => {
    const processAndSetBalances = async () => {
      if (!displayedAllBalances || typeof displayedAllBalances !== 'object' || displayedAllBalances.error) {
        setSortedBalancesForDisplay([]);
        return;
      }
      setIsLoadingBalances(true);
      const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
      const nativeChainId = nodeStatus?.currencyid;
      let processedEntries = [];

      for (const [originalKey, amount] of Object.entries(displayedAllBalances)) {
        if (typeof amount !== 'number') continue;
        let currencyDef = await getCurrencyInfo(originalKey);
        let displayName = originalKey;
        let iAddress = null;
        if (currencyDef && currencyDef.name && currencyDef.currencyid) {
          displayName = currencyDef.name;
          iAddress = currencyDef.currencyid;
        } else if (originalKey.startsWith('i') && originalKey.length === 34) {
          iAddress = originalKey;
        }
        processedEntries.push({ 
          keyForReact: originalKey,
          displayName,
          amount,
          iAddress: (displayName === nativeChainTicker || iAddress === nativeChainId) ? null : iAddress,
          isNative: (displayName === nativeChainTicker || iAddress === nativeChainId)
        });
      }
      processedEntries.sort((a, b) => {
        if (a.isNative && !b.isNative) return -1;
        if (!a.isNative && b.isNative) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
      setSortedBalancesForDisplay(processedEntries);
      setIsLoadingBalances(false);
    };
    if (displayedAllBalances) { 
        processAndSetBalances();
    }
  }, [displayedAllBalances, nodeStatus, getCurrencyInfo]);

  useEffect(() => {
    if (finalRAddress && rAddressData) {
      setDisplayedRAddress(finalRAddress);
      const rAddrDetails = rAddressData.find(r => r.address === finalRAddress);
      if (rAddrDetails) {
        setDisplayedAllBalances(rAddrDetails.allBalances || {});
      } else {
        setDisplayedAllBalances({});
      }
      const associatedIDs = identities?.filter(idObj => 
          idObj.identity && 
          Array.isArray(idObj.identity.primaryaddresses) && 
          idObj.identity.primaryaddresses.includes(finalRAddress)
      ).map(idObj => idObj.identity.name) || [];
      setDisplayedAssociatedIDs(associatedIDs);
    } else {
      setDisplayedRAddress(null);
      setDisplayedAllBalances(null);
      setDisplayedAssociatedIDs([]);
    }
  }, [finalRAddress, rAddressData, identities]);

  if (!displayedRAddress) {
    return (
      <Paper sx={{p:1.5, height: '100%', background: '#282828', borderRadius: 1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column'}}>
        <Typography sx={{color: '#ccc', mb:1, textAlign:'center', fontWeight: 'bold', fontSize: '0.9rem'}}>R-Address Details</Typography>
        <Box sx={{flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Typography sx={{color: '#888', fontSize: '0.9rem'}}>No R-Address selected.</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{p:1, height: '100%', background: '#282828', borderRadius: 1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column'}}>
      <Typography sx={{ color: '#fff', fontWeight: 'bold', wordBreak: 'break-all', fontSize: '0.9rem', mb: 1 }}>
        R-Address
      </Typography>
      <Divider sx={{ mb: 1, bgcolor: '#444'}} />
      <Box sx={{flexGrow:1, overflowY:'auto', pr:0.5, pl:0.5}}>
        <DetailItem compact label="R-Address" value={displayedRAddress} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true} hideTooltip={true} />
        <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize:'0.8rem', mb:0.5 }}>Balances:</Typography>
        <Paper sx={{p:1, background:'#232323', border:'1px solid #383838', maxHeight: '150px', overflowY:'auto', mb:1}}>
          {isLoadingBalances && sortedBalancesForDisplay.length === 0 ? (
            <CircularProgress size={14} sx={{ml:1}}/>
          ) : sortedBalancesForDisplay.length > 0 ? (
            sortedBalancesForDisplay.map(({ keyForReact, displayName, amount, iAddress }) => {
              return (
                <JsonFieldRenderer 
                    key={keyForReact} 
                    fieldKey={displayName} 
                    fieldValue={parseFloat(amount).toFixed(8)} 
                    currencyIAddress={iAddress} 
                    labelColor="#cce0ff"
                    valueColor="#ffffff"
                    nodeStatus={nodeStatus}
                />
              );
            })
          ) : (
            <Typography sx={{fontSize:'0.75rem', color:'#888'}}>No balances found for this address.</Typography> 
          )}
        </Paper>
        <Box sx={{mt:0.5}}>
            <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.7rem', mb:0.1 }}>Primary Address For:</Typography>
            {displayedAssociatedIDs.length > 0 ? (
                <Paper sx={{p:0.5, background:'#232323', maxHeight: 'calc(100% - 100px)', overflowY:'auto', border:'1px solid #383838'}}>
                  <List dense disablePadding >
                  {displayedAssociatedIDs.map((idName, index) => (
                      <ListItem key={index} disableGutters sx={{py:0, display: 'flex', alignItems: 'center'}}>
                          <ListItemText primary={idName.endsWith('@') ? idName : `${idName}@`} primaryTypographyProps={{fontSize: '0.7rem', color:'#ddd', wordBreak:'break-all', lineHeight:1.2}}/>
                          <IconButton onClick={() => handleCopy(idName.endsWith('@') ? idName : `${idName}@`)} size="small" sx={{p:0.1, color: '#aaa', '&:hover': {color:'#90caf9'}}} aria-label={`Copy ID ${idName.endsWith('@') ? idName : `${idName}@`}`}>
                            <ContentCopyIcon sx={{fontSize: '0.8rem'}}/>
                          </IconButton>
                      </ListItem>
                  ))}
                  </List>
                </Paper>
            ) : (
                <Typography sx={{pl:1, fontSize:'0.7rem', color:'#888'}}>Not a primary address for any loaded VerusIDs.</Typography>
            )}
        </Box>
      </Box>
    </Paper>
  );
};

export default RAddressDetailsMarketplace; 