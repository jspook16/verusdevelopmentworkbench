import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, IconButton, Tooltip, Button, Switch } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { IdentityContext } from '../../contexts/IdentityContext';

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  paddingTop: theme.spacing(0.3),
  paddingBottom: theme.spacing(0.3),
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  minHeight: '24px',
  borderRadius: '4px',
  marginBottom: theme.spacing(0.25),
  marginRight: theme.spacing(0.5),
  marginLeft: theme.spacing(0.5),
  '&.Mui-selected': {
    backgroundColor: 'rgba(144, 202, 249, 0.22)',
    '&:hover': {
      backgroundColor: 'rgba(144, 202, 249, 0.28)',
    },
  },
  borderBottom: '1px solid transparent',
}));

/**
 * ZAddressListMarketplace - Displays a list of Z-Addresses with balance information
 * 
 * @param {string} contextType - The context type ('marketplace', 'vdxf', 'currency')
 * @param {boolean} hideHeader - Whether to hide the header (default: false)
 * @param {boolean} hideHeaderTitle - Whether to hide just the header title (default: false)
 * @param {Array} zAddressesData - Optional external Z-address data (for Currency tab)
 * @param {boolean} loadingZAddresses - Optional external loading state
 * @param {string} errorZAddresses - Optional external error message
 * @param {function} fetchZAddressesWithBalances - Optional external fetch function
 */
const ZAddressListMarketplace = ({ 
  contextType = 'marketplace', 
  hideHeader = false, 
  hideHeaderTitle = false,
  zAddressesData,
  loadingZAddresses: externalLoading,
  errorZAddresses: externalError,
  fetchZAddressesWithBalances: externalFetch
}) => {
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const { 
    hiddenZAddresses, 
    toggleZAddressVisibility, 
    getCopyString,
    zAddressData: globalZAddressData,
    fetchAndSetZAddressesWithBalances: globalFetchZAddresses
  } = useContext(WorkbenchDataContext);
  const marketplaceContext = useContext(MarketplaceIdentityContext);
  const idContext = useContext(IdentityContext);

  // Determine which context and selection handlers to use based on contextType
  let selectedAddressFromContext;
  let handleSelectAddressForContext;
  
  switch (contextType) {
    case 'vdxf':
      selectedAddressFromContext = idContext.selectedZAddressForVDXF;
      handleSelectAddressForContext = idContext.selectZAddressForVDXF;
      break;
    case 'currency':
      selectedAddressFromContext = idContext.selectedZAddressForCurrencyWS;
      handleSelectAddressForContext = idContext.selectZAddressForCurrencyWS;
      break;
    case 'marketplace':
    default:
      selectedAddressFromContext = marketplaceContext.selectedZAddress;
      handleSelectAddressForContext = marketplaceContext.setSelectedZAddress;
      break;
  }

  // For internal loading state if needed (override with props)
  const [internalLoadingZAddresses, setInternalLoadingZAddresses] = useState(false);
  const [internalErrorZAddresses, setInternalErrorZAddresses] = useState(null);
  
  // Use external data if provided (for Currency tab), otherwise use global context data
  const zAddressesWithBalances = zAddressesData || globalZAddressData;
  const loadingZAddresses = externalLoading !== undefined ? externalLoading : internalLoadingZAddresses;
  const errorZAddresses = externalError || internalErrorZAddresses;
  
  const [hideZeroBalanceZAddrs, setHideZeroBalanceZAddrs] = useState(true);

  // Use external or global fetch function
  const handleUpdateZAddresses = async () => {
    if (externalFetch) {
      // Use external fetch function if provided
      externalFetch();
    } else {
      // Use global fetch function
      setInternalLoadingZAddresses(true);
      try {
        await globalFetchZAddresses();
        setInternalErrorZAddresses(null);
      } catch (error) {
        setInternalErrorZAddresses(error.message || 'Error fetching Z-addresses');
      } finally {
        setInternalLoadingZAddresses(false);
      }
    }
  };

  const handleZAddressSelect = (zAddress) => {
    if (handleSelectAddressForContext) handleSelectAddressForContext(zAddress);
  };

  const handleCopy = (textToCopy) => {
    const stringToCopy = getCopyString ? getCopyString(textToCopy) : String(textToCopy);
    navigator.clipboard.writeText(stringToCopy);
  };

  const renderNameWithVisibility = (name, isHidden) => {
    if (name === undefined || name === null) return '';
    let text = String(name);
    if (typeof name === 'number') {
      text = name.toFixed(8);
    }
    return isHidden ? '*'.repeat(text.length > 0 ? text.length : 3) : text;
  };

  // Auto-fetch Z-addresses if we don't have any and we're not already loading
  useEffect(() => {
    if (!loadingZAddresses && (!zAddressesWithBalances || zAddressesWithBalances.length === 0) && nodeStatus?.connected) {
      handleUpdateZAddresses();
    }
  }, [nodeStatus?.connected]);

  const filteredZAddresses = useMemo(() => {
    if (!zAddressesWithBalances || !Array.isArray(zAddressesWithBalances)) return [];
    if (hideZeroBalanceZAddrs) {
      return zAddressesWithBalances.filter(zAddr => {
        const nativeBalance = typeof zAddr.balance === 'number' ? zAddr.balance : 0;
        let hasPositiveNativeBalance = nativeBalance > 0.000000009;
        let hasPositiveOtherBalance = false;
        if (zAddr.allBalances && typeof zAddr.allBalances === 'object') {
          for (const currencyKey in zAddr.allBalances) {
            if (currencyKey !== (nodeStatus?.chainName || 'VRSCTEST') && typeof zAddr.allBalances[currencyKey] === 'number' && zAddr.allBalances[currencyKey] > 0.000000009) {
              hasPositiveOtherBalance = true;
              break;
            }
          }
        }
        return hasPositiveNativeBalance || hasPositiveOtherBalance;
      });
    }
    return zAddressesWithBalances;
  }, [zAddressesWithBalances, hideZeroBalanceZAddrs, nodeStatus?.chainName]);

  // For filtering the Z-addresses list, we need a filtered input array as well
  const filteredZAddressesInput = zAddressesWithBalances;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!hideHeader && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0 }}>
          {!hideHeaderTitle && (
            <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Z
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: hideHeaderTitle ? 'auto' : 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleUpdateZAddresses}
              disabled={loadingZAddresses || !nodeStatus.connected}
              startIcon={loadingZAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto', mr: 1 }}
            >
              {!loadingZAddresses && ""}
            </Button>
            <Tooltip title={hideZeroBalanceZAddrs ? "Show All Z" : "Hide Zero-Balance Z"}>
              <Switch
                checked={hideZeroBalanceZAddrs}
                onChange={() => setHideZeroBalanceZAddrs(!hideZeroBalanceZAddrs)}
                size="small"
                sx={{ mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4caf50' } }}
              />
            </Tooltip>
            {hideZeroBalanceZAddrs && filteredZAddressesInput && filteredZAddressesInput.length > 0 && (
              <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center' }}>
                {filteredZAddressesInput.length - filteredZAddresses.length}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {nodeStatus.connected && loadingZAddresses && filteredZAddresses.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingZAddresses && errorZAddresses && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#ff6b6b' }}>{errorZAddresses}</Typography>
        )}
        {!loadingZAddresses && !errorZAddresses && filteredZAddresses.length === 0 && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            {hideZeroBalanceZAddrs && zAddressesWithBalances && zAddressesWithBalances.length > 0 ? 'No Z with balances. Toggle filter.' : 'No Z found. Click Update.'}
          </Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see Z.</Typography>
        )}
        {filteredZAddresses.length > 0 && (
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {filteredZAddresses.map((zAddrData) => {
              const isSelected = selectedAddressFromContext === zAddrData.address;
              const isHidden = hiddenZAddresses[zAddrData.address];
              return (
                <StyledListItemButton
                  key={zAddrData.address}
                  selected={isSelected}
                  onClick={() => handleZAddressSelect(zAddrData.address)}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Tooltip title={isHidden ? 'Show Z' : 'Hide Z'}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); if (toggleZAddressVisibility) toggleZAddressVisibility(zAddrData.address); }}
                        sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}
                      >
                        {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 0.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                        {renderNameWithVisibility(zAddrData.address, isHidden)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: -0.5 }}>
                        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369'}}>
                          Bal: {renderNameWithVisibility(zAddrData.balance, isHidden)}
                        </Typography>
                        {zAddrData.allBalances && Object.keys(zAddrData.allBalances).filter(k => k !== (nodeStatus?.chainName || 'VRSCTEST')).some(k => zAddrData.allBalances[k] > 0.000000009) && (
                          <Tooltip title="Has other currency balances">
                            <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369', ml: 1, fontWeight: 'bold' }}>
                              $
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title={`Copy Z: ${zAddrData.address}`}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleCopy(zAddrData.address); }}
                        sx={{ p: 0.25, flexShrink: 0 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </StyledListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ZAddressListMarketplace; 