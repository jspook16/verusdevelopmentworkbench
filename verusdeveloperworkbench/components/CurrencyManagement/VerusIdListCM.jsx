import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, CircularProgress, IconButton, Tooltip, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled, useTheme } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

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

const VerusIdListCM = () => {
  const theme = useTheme();
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);

  const [isFetchingRAddresses, setIsFetchingRAddresses] = useState(false);

  // Add logging to see what's in the context
  useEffect(() => {
    console.log('[VerusIdListCM] idContext available:', !!idContext);
    console.log('[VerusIdListCM] selectedVerusIdCM:', idContext?.selectedVerusIdCM);
    console.log('[VerusIdListCM] identities:', Array.isArray(idContext?.identities) ? idContext.identities.length : 'not an array');
  }, [idContext]);

  if (!idContext || !workbenchContext || !nodeStatus) {
    console.log('[VerusIdListCM] Missing context:', {
      idContext: !!idContext,
      workbenchContext: !!workbenchContext,
      nodeStatus: !!nodeStatus
    });
    return <Typography>Loading context...</Typography>;
  }

  const {
    identities, loadingIdentities, fetchIdentities,
    identityBalances, loadingAllBalances,
    selectedRAddress, setSelectedRAddress,
    selectedVerusIdCM, setSelectedVerusIdCM
  } = idContext;

  const {
    rAddressesWithUtxos, fetchAndSetRAddressesWithUtxos,
    hiddenVerusIds, toggleVerusIdVisibility,
    hiddenRAddresses, toggleRAddressVisibility,
    getCopyString,
  } = workbenchContext;

  // Filter identities to exclude currencies
  const nonCurrencyIdentities = useMemo(() => {
    if (!identities || !Array.isArray(identities)) {
      return [];
    }
    return identities.filter(item => {
      // Ensure item and item.identity exist, and flags is a number
      if (item && item.identity && typeof item.identity.flags === 'number') {
        return (item.identity.flags & 1) !== 1; // Keep if NOT a currency
      }
      return true; // Keep if flags are not available or not a number (defensive)
    });
  }, [identities]);

  useEffect(() => {
    if (!nodeStatus.connected) {
      // Identities are cleared in IdentityContext as well
      // setIdentities([]); // Example if needed, but context should handle
      // setRAddressesWithUtxos([]); // Example if needed, but context should handle
    }
  }, [nodeStatus.connected]);

  const handleUpdateVerusIDs = () => {
    if (nodeStatus.connected) {
      fetchIdentities();
    }
  };

  const handleUpdateRAddresses = async () => {
    if (nodeStatus.connected) {
      setIsFetchingRAddresses(true);
      try {
        await fetchAndSetRAddressesWithUtxos();
      } catch (error) {
        console.error("Failed to fetch R-Addresses:", error);
        // Optionally set an error state here to display to the user
      } finally {
        setIsFetchingRAddresses(false);
      }
    }
  };

  const handleIdSelect = (item) => {
    if (item && item.displayName) {
      console.log('[VerusIdListCM] Selecting ID:', item.displayName);
      setSelectedVerusIdCM(item.displayName);
    }
  };

  const handleRAddressSelect = (rAddress) => {
    setSelectedRAddress(rAddress);
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
    else if (name === 'Loading...' || name === 'N/A' || name === 'Error') {
        // Keep as is
    }
    else {
        // For strings like names/addresses
    }
    return isHidden ? '*'.repeat(text.length > 0 ? text.length : 3) : text; // Ensure at least *** for empty/short strings when hidden
  };

  const getIsIdSelected = (item) => {
    if (!item || !item.displayName) return false;
    // Compare with selectedVerusIdCM, which should also be a displayName
    return selectedVerusIdCM === item.displayName;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p:0 }}>
      {/* Top Section: VerusIDs */}
      <Box sx={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minHeight: 0 /* Allow shrinking */ }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
          <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
            VerusIDs (Non-Currency)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUpdateVerusIDs}
            disabled={loadingIdentities || loadingAllBalances || !nodeStatus.connected}
            startIcon={loadingIdentities || loadingAllBalances ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto' }}
          >
            {!loadingIdentities && !loadingAllBalances && ""}
          </Button>
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}> 
          {nodeStatus.connected && (loadingIdentities || loadingAllBalances) && (!nonCurrencyIdentities || nonCurrencyIdentities.length === 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          )}
          {!loadingIdentities && !loadingAllBalances && (!nonCurrencyIdentities || nonCurrencyIdentities.length === 0) && nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>No non-currency VerusIDs found. Click Update.</Typography>
          )}
          {!nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see VerusIDs.</Typography>
          )}
          {nonCurrencyIdentities && nonCurrencyIdentities.length > 0 && (
            <List dense disablePadding sx={{pt: 0.5}}>
              {nonCurrencyIdentities.map((item) => {
                if (!item || !item.displayName || !item.identity) return null; 
                
                const currentDisplayName = item.displayName;
                const iaddress = item.identity.identityaddress;
                const isSelected = getIsIdSelected(item);
                const isHidden = hiddenVerusIds && hiddenVerusIds[currentDisplayName];
                
                let displayBalanceText = 'N/A';
                if (iaddress && identityBalances) {
                  const balanceInfo = identityBalances[iaddress];
                  if (loadingAllBalances && balanceInfo === undefined) {
                    displayBalanceText = 'Loading...';
                  } else if (balanceInfo === undefined || balanceInfo === null) {
                    displayBalanceText = 'N/A';
                  } else if (balanceInfo === 'Error' || (balanceInfo && balanceInfo.error)) {
                    displayBalanceText = 'Error';
                  } else if (typeof balanceInfo === 'object') {
                    const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
                    const nativeBalance = balanceInfo[nativeChainTicker];
                    if (typeof nativeBalance === 'number') {
                      displayBalanceText = parseFloat(nativeBalance).toFixed(8);
                    }
                  }
                }
                
                const isRevoked = item.status === "revoked";
                const isTimelocked = item.identity && item.identity.timelock && parseInt(item.identity.timelock) > 0 && item.status === 'active';
                let nameColor = isSelected ? theme.palette.primary.light : theme.palette.text.primary; 
                if (isRevoked) nameColor = theme.palette.error.light;
                else if (isTimelocked) nameColor = '#ba68c8'; 
                if (isSelected) nameColor = theme.palette.primary.light;

                return (
                  <StyledListItemButton
                    key={item.identity.identityaddress || currentDisplayName}
                    selected={isSelected}
                    onClick={() => handleIdSelect(item)}
                    sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Tooltip title={isHidden ? "Show ID" : "Hide ID"}>
                        <IconButton 
                          size="small"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleVerusIdVisibility(currentDisplayName);
                          }}
                          sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}
                        >
                          {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                        </IconButton>
                      </Tooltip>
              <ListItemText 
                        primary={renderNameWithVisibility(currentDisplayName, isHidden)} 
                primaryTypographyProps={{ 
                    sx: { 
                            fontSize: '0.8rem', 
                            fontWeight: isSelected ? 'bold' : 'normal', 
                            color: nameColor,
                            whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                          }
                        }} 
                        sx={{ flexGrow: 1, mr: 0.5, overflow: 'hidden' }}
                      />
                      <Tooltip title={`Copy ID: ${currentDisplayName}`}>
                        <IconButton 
                          size="small"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCopy(currentDisplayName);
                          }}
                          sx={{ p: 0.25, ml: 'auto', flexShrink: 0 }}
                        >
                          <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#aaa', pl: '36px' }}>
                      Balance: {renderNameWithVisibility(displayBalanceText, isHidden)}
                    </Typography>
                  </StyledListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </Box>

      <Divider sx={{ bgcolor: '#444', flexShrink: 0 }} />

      {/* Bottom Section: R-Addresses */}
      <Box sx={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minHeight: 0 /* Allow shrinking */ }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
          <Typography variant="h6" sx={{color: 'white', fontSize: '0.9rem', fontWeight:'bold' }}>
            My R-Addresses
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUpdateRAddresses}
            disabled={isFetchingRAddresses || !nodeStatus.connected}
            startIcon={isFetchingRAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto' }}
          >
             {!isFetchingRAddresses && ""}
          </Button>
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {nodeStatus.connected && isFetchingRAddresses && (!rAddressesWithUtxos || rAddressesWithUtxos.length === 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          )}
          {!isFetchingRAddresses && (!rAddressesWithUtxos || rAddressesWithUtxos.length === 0) && nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>No R-Addresses found. Click Update.</Typography>
          )}
          {!nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see R-Addresses.</Typography>
          )}
          {rAddressesWithUtxos && rAddressesWithUtxos.length > 0 && (
            <List dense disablePadding sx={{pt: 0.5}}>
              {rAddressesWithUtxos.map((rAddr) => {
                const isSelected = selectedRAddress === rAddr.address;
                const isHidden = hiddenRAddresses && hiddenRAddresses[rAddr.address];
                return (
                  <StyledListItemButton
                    key={rAddr.address}
                    selected={isSelected}
                    onClick={() => handleRAddressSelect(rAddr.address)}
                    sx={{ 
                      flexDirection: 'column', 
                      alignItems: 'flex-start', 
                      borderBottom: '1px solid #333' 
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Tooltip title={isHidden ? "Show R-Address" : "Hide R-Address"}>
                        <IconButton 
                          size="small"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleRAddressVisibility(rAddr.address);
                          }}
                          sx={{ p:0.25, mr: 0.5, flexShrink: 0 }}
                        >
                          {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                          {renderNameWithVisibility(rAddr.address, isHidden)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#aaa'}}>
                          Balance: {renderNameWithVisibility(rAddr.total, isHidden)}
                        </Typography>
                      </Box>
                      <Tooltip title={`Copy R-Address: ${rAddr.address}`}>
                        <IconButton 
                          size="small"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCopy(rAddr.address);
                          }}
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
    </Box>
  );
};

export default VerusIdListCM; 