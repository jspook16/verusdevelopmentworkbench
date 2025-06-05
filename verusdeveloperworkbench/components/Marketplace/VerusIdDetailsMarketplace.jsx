import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Tooltip, IconButton, Grid, Chip, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IdentityContext } from '../../contexts/IdentityContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { IDENTITY_FLAGS } from '../../utils/identityUtils';
import { NodeContext } from '../../contexts/NodeContext';
import JsonFieldRenderer from './JsonFieldRenderer';
import DetailItem from '../common/DetailItem';

const formatTimelock = (timelock) => {
  if (timelock === 0 || timelock === undefined) return 'None';
  if (timelock > 0 && timelock < 1000000000) return `Block Height: ${timelock}`;
  if (timelock >= 1000000000) return `Timestamp: ${new Date(timelock * 1000).toLocaleString()}`;
  return String(timelock);
};

const getStatusChip = (statusString, flags, itemTimelock, nodeLongestChain) => {
  let label = "Unknown";
  let chipColor = "default";

  if (statusString) {
    const lowerStatus = statusString.toLowerCase();

    if (lowerStatus === 'revoked') {
      label = "Revoked";
      chipColor = "error";
    } else if (lowerStatus === 'active') {
      label = "Active";
      chipColor = "primary";
    } else {
      label = statusString.charAt(0).toUpperCase() + statusString.slice(1);
      chipColor = "default";
  }
  }
  return <Chip label={label} color={chipColor} size="small" sx={{height: 'auto', '& .MuiChip-label': { py: '1px', px: '6px', fontSize:'0.65rem'}}}/>; 
};

/**
 * VerusIdDetailsMarketplace - Displays details for the selected VerusID, with support for different context types
 * 
 * @param {string} contextType - The context type ('marketplace', 'vdxf', 'currency')
 * @param {string} selectedId - The currently selected ID (from parent or context)
 * @param {object} identityDetails - The identity details object (from parent or context)
 * @param {function} fetchIdentityDetails - Function to fetch identity details (from parent or context)
 */
const VerusIdDetailsMarketplace = ({ 
  contextType = 'marketplace',
  selectedId,
  identityDetails,
  fetchIdentityDetails
}) => {
  const idContext = useContext(IdentityContext);
  const marketplaceContext = useContext(MarketplaceIdentityContext);
  const { nodeStatus } = useContext(NodeContext);
  const [isExpanded, setIsExpanded] = useState({});
  
  // Determine which context and data to use
  let currentSelectedId;
  let currentIdentityDetails;
  let currentLoadingDetails;
  let currentErrorDetails;
  let currentFetchDetails;
  
  // If explicit props are provided, use those
  if (selectedId !== undefined && fetchIdentityDetails !== undefined) {
    currentSelectedId = selectedId;
    currentFetchDetails = fetchIdentityDetails;
    if (identityDetails !== undefined) {
      currentIdentityDetails = identityDetails;
      currentLoadingDetails = false;
      currentErrorDetails = null;
    }
  } else {
    // Otherwise, infer from contextType
    switch (contextType) {
      case 'vdxf':
        currentSelectedId = idContext.selectedIdentityForVDXF;
        currentIdentityDetails = idContext.vdxfIdentityDetails;
        currentLoadingDetails = idContext.loadingVdxfDetails;
        currentErrorDetails = idContext.errorVdxfDetails;
        currentFetchDetails = idContext.fetchIdentityDetailsForVDXF;
        break;
      case 'currency':
        currentSelectedId = idContext.selectedIdentityForCurrencyWS;
        currentIdentityDetails = idContext.currencyWSIdentityDetails;
        currentLoadingDetails = idContext.loadingCurrencyWSDetails;
        currentErrorDetails = idContext.errorCurrencyWSDetails;
        currentFetchDetails = idContext.fetchIdentityDetailsForCurrencyWS;
        break;
      case 'marketplace':
      default:
        currentSelectedId = marketplaceContext.selectedMarketplaceId;
        currentIdentityDetails = marketplaceContext.selectedVerusIdDetails;
        currentLoadingDetails = marketplaceContext.loadingIdentityDetails;
        currentErrorDetails = marketplaceContext.errorIdentityDetails;
        currentFetchDetails = marketplaceContext.fetchIdentityDetails;
        break;
    }
  }

  const { identityBalances, loadingAllBalances } = idContext || {};
  const { sendCommand } = useContext(NodeContext) || {};
  const [currencyCache, setCurrencyCache] = useState({});
  const [currentIdentityBalances, setCurrentIdentityBalancesState] = useState(null);
  const [sortedBalancesForDisplay, setSortedBalancesForDisplay] = useState([]);
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [displayedIdentityData, setDisplayedIdentityData] = useState(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Log for debugging purposes
  useEffect(() => {
    if (contextType && currentSelectedId) {
      console.log(`[VerusIdDetailsMarketplace] contextType=${contextType}, selectedId=${currentSelectedId}`);
      console.log(`[VerusIdDetailsMarketplace] currentIdentityDetails:`, currentIdentityDetails);
    }
  }, [contextType, currentSelectedId, currentIdentityDetails]);

  // Get identity address from details data
  const identityaddress = displayedIdentityData?.identity?.identityaddress;

  // Update displayed identity data when props or context changes
  useEffect(() => {
    if (identityDetails) {
      console.log('[VerusIdDetailsMarketplace] Setting displayedIdentityData from props:', identityDetails);
      setDisplayedIdentityData(identityDetails);
    } else if (currentIdentityDetails && currentSelectedId) {
      console.log('[VerusIdDetailsMarketplace] Setting displayedIdentityData from context:', currentIdentityDetails);
      setDisplayedIdentityData(currentIdentityDetails);
    } else {
      console.log('[VerusIdDetailsMarketplace] No identity details available, clearing display');
      setDisplayedIdentityData(null);
    }
  }, [identityDetails, currentSelectedId, currentIdentityDetails]);

  useEffect(() => {
    const newBalances = identityBalances && displayedIdentityData?.identity?.identityaddress 
                      ? identityBalances[displayedIdentityData.identity.identityaddress] 
                      : null;
    setCurrentIdentityBalancesState(newBalances);
  }, [identityBalances, displayedIdentityData]);

  const handleCopy = useCallback((text) => {
    if (text) navigator.clipboard.writeText(String(text));
  }, []);

  const getCurrencyInfo = useCallback(async (currencyIdentifier) => {
    if (!currencyIdentifier || typeof currencyIdentifier !== 'string' || !sendCommand) return null;
    if (currencyCache[currencyIdentifier]) return currencyCache[currencyIdentifier];
    try {
      const result = await sendCommand('getcurrency', [currencyIdentifier]);
      if (result && result.currencyid && result.name) {
        setCurrencyCache(prev => ({ ...prev, [currencyIdentifier]: result, [result.currencyid]: result, [result.name]: result }));
        return result;
      }
      return null;
    } catch (err) {
      setCurrencyCache(prev => ({...prev, [currencyIdentifier]: {error: 'notfound'}}));
      return null;
    }
  }, [sendCommand, currencyCache]);

  useEffect(() => {
    const processAndSetBalances = async () => {
      if (!currentIdentityBalances || typeof currentIdentityBalances !== 'object' || currentIdentityBalances.error) {
        setSortedBalancesForDisplay([]);
        return;
      }
      setIsLoadingBalances(true);

      const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
      const nativeChainId = nodeStatus?.currencyid;

      let processedEntries = [];

      for (const [originalKey, amount] of Object.entries(currentIdentityBalances)) {
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

        console.log(`[VerusIdDetails] Processing Balance: originalKey=${originalKey}, displayName=${displayName}, amount=${amount}, resolved_iAddress=${iAddress}`);

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

    processAndSetBalances();
  }, [currentIdentityBalances, nodeStatus, getCurrencyInfo]);

  if (!displayedIdentityData || !displayedIdentityData.identity) { 
    return (
      <Paper sx={{p:1.5, height: '100%', background: '#282828', borderRadius: 1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column'}}>
        <Typography sx={{color: '#ccc', mb:1, textAlign:'center', fontWeight: 'bold', fontSize: '0.9rem'}}>VerusID Details</Typography>
        <Box sx={{flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection: 'column'}}>
          {currentLoadingDetails ? (
            <CircularProgress size={20} sx={{mb: 1}} />
          ) : currentSelectedId ? (
            <>
              <Typography sx={{color: '#888', fontSize: '0.9rem'}}>Loading details for {currentSelectedId}...</Typography>
              {currentErrorDetails && (
                <Typography sx={{color: '#ff6b6b', fontSize: '0.8rem', mt: 1}}>Error: {currentErrorDetails}</Typography>
              )}
            </>
          ) : (
            <Typography sx={{color: '#888', fontSize: '0.9rem'}}>No VerusID selected.</Typography>
          )}
        </Box>
      </Paper>
    );
  }

  const { identity, status, blockheight, txid, vout } = displayedIdentityData;
  const { name, parent, systemid, flags, primaryaddresses, minimumsignatures, revocationauthority, recoveryauthority, privateaddress, timelock, contentmap, contentmultimap, version } = identity;
  const fullyqualifiedname = identity.fullyqualifiedname || name;

  return (
    <Paper sx={{p:1, height: '100%', background: '#282828', borderRadius: 1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column'}}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, px:0.5 }}>
        <Typography sx={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all', fontSize: '0.85rem' }}>
          {fullyqualifiedname || 'VerusID Details'}
        </Typography>
        {name && <IconButton onClick={() => handleCopy(name)} size="small" sx={{p:0.1, color: '#aaa', '&:hover': {color:'#90caf9'}}} aria-label={`Copy ID Name ${name}`}>
          <ContentCopyIcon sx={{fontSize: '1rem'}}/>
        </IconButton>}
      </Box>
      <Divider sx={{ mb: 0.5, bgcolor: '#444'}} />
      <Box sx={{flexGrow:1, overflowY:'auto', pr:0.5, pl:0.5, fontSize: '0.7rem'}}>
        <Box sx={{mb:0.5}}>
            <DetailItem compact label="Status">
              {getStatusChip(status, flags, timelock, nodeStatus?.longestchain)}
            </DetailItem>
            <DetailItem compact label="Block Height" value={blockheight !== undefined ? String(blockheight) : 'N/A'} isMonospace={false} />
            <DetailItem compact label="Creation TXID" value={txid} isAddress onCopy={handleCopy} hideTooltip={true} />
            <DetailItem compact label="Vout" value={vout !== undefined ? String(vout) : 'N/A'} isMonospace={false} />
        </Box>
        <Divider sx={{my:0.5, borderColor:'#383838'}}/>
        <Grid container spacing={1}> 
            <Grid item xs={12} sm={6}>
                <DetailItem compact label="i-Address" value={identityaddress} isAddress onCopy={handleCopy} hideTooltip={true} />
                <DetailItem compact label="Parent" value={parent} isAddress onCopy={handleCopy} hideTooltip={true} />
                <DetailItem compact label="System ID" value={systemid} isAddress onCopy={handleCopy} hideTooltip={true} />
                <DetailItem compact label="Revocation Auth" value={revocationauthority} isAddress onCopy={handleCopy} hideTooltip={true} />
                <DetailItem compact label="Recovery Auth" value={recoveryauthority} isAddress onCopy={handleCopy} hideTooltip={true} />
                {privateaddress && (
                  <DetailItem compact label="Private Address" value={privateaddress} isAddress onCopy={handleCopy} hideTooltip={true} />
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box mb={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.7rem', mb:0.1 }}>Primary Addresses:</Typography>
                  {primaryaddresses && primaryaddresses.length > 0 ? (
                      <Paper elevation={0} sx={{p:0.5, background:'#232323', maxHeight: '50px', overflowY:'auto', border:'1px solid #383838'}}>
                          <List dense disablePadding >
                          {primaryaddresses.map((addr, index) => (
                              <ListItem key={index} disableGutters sx={{py:0, display: 'flex', alignItems: 'center'}}>
                                  <ListItemText primary={addr} primaryTypographyProps={{fontSize: '0.7rem', color:'#ddd', wordBreak:'break-all', lineHeight:1.2}}/>
                                  <IconButton onClick={() => handleCopy(addr)} size="small" sx={{p:0.1, color: '#aaa', '&:hover': {color:'#90caf9'}}} aria-label={`Copy address ${addr}`}>
                                    <ContentCopyIcon sx={{fontSize: '0.8rem'}}/>
                                  </IconButton>
                              </ListItem>
                          ))}
                          </List>
                      </Paper>
                  ) : (
                      <Typography sx={{pl:0, fontSize:'0.7rem', color:'#888'}}>None</Typography>
                  )}
                </Box>
                <DetailItem compact label="Min. Signatures" value={String(minimumsignatures)} isMonospace={false}/>
                <DetailItem compact label="Timelock" value={formatTimelock(timelock)} isMonospace={false}/>
                <DetailItem compact label="Flags" value={String(flags)} isMonospace={false}/>
                <DetailItem label="Version" value={String(version)} isMonospace={false} compact/>
            </Grid>
        </Grid> 
        <Box sx={{mt:1, mb:1}}>
          <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.7rem', mb:0.1 }}>Balances:</Typography>
          <Paper sx={{p:1, background:'#232323', border:'1px solid #383838', maxHeight: '150px', overflowY:'auto'}}>
            {(loadingAllBalances || isLoadingBalances) && sortedBalancesForDisplay.length === 0 ? (
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
            ) : currentIdentityBalances && currentIdentityBalances.error ? (
                <Typography sx={{fontSize:'0.7rem', color:'#ff6b6b', p:1}}>Error: {typeof currentIdentityBalances.error === 'string' ? currentIdentityBalances.error : JSON.stringify(currentIdentityBalances.error)}</Typography> 
            ) : (
                <Typography sx={{fontSize:'0.7rem', color:'#888', p:1}}>No balances found for this VerusID.</Typography> 
            )}
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
};

export default VerusIdDetailsMarketplace; 