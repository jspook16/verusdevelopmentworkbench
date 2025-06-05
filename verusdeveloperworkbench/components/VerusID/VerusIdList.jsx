import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, CircularProgress, IconButton, Tooltip, Button, Switch } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled, useTheme } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { isTicketId } from '../../utils/ticketFilter';

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

const VerusIdList = () => {
  const theme = useTheme();
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);

  const [isFetchingRAddresses, setIsFetchingRAddresses] = useState(false);
  const [hideZeroBalanceIDs, setHideZeroBalanceIDs] = useState(true);
  const [hideZeroBalanceRAddrs, setHideZeroBalanceRAddrs] = useState(true);
  const [hideTicketIDs, setHideTicketIDs] = useState(true);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography>Loading context...</Typography>;
  }

  const {
    identities, loadingIdentities, fetchIdentities,
    identityBalances, loadingAllBalances,
    selectedIdNameForVerusIdOps, selectIdNameForVerusIdOps,
    selectedRAddressForVerusIdOps, selectRAddressForVerusIdOps,
    // The following are needed for backward compatibility and rendering
    selectedIdName, selectedRAddress
  } = idContext;

  const {
    rAddressData,
    fetchAndSetRAddressesWithUtxos,
    hiddenVerusIds, toggleVerusIdVisibility,
    hiddenRAddresses, toggleRAddressVisibility,
    getCopyString,
  } = workbenchContext;

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
    if (item && item.identity && item.identity.name) {
      const name = item.identity.name;
      const idNameWithAt = name.endsWith('@') ? name : `${name}@`;
      selectIdNameForVerusIdOps(idNameWithAt);
    }
  };

  const handleRAddressSelect = (rAddress) => {
    selectRAddressForVerusIdOps(rAddress);
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

  // Memoized filtered VerusIDs
  const filteredIdentities = useMemo(() => {
    if (!identities) return [];
    
    let filtered = identities;
    
    // Apply ticket filter if enabled
    if (hideTicketIDs) {
      filtered = filtered.filter(item => {
        if (!item || !item.identity || !item.identity.name) return true;
        return !isTicketId(item.identity.name);
      });
    }
    
    // Apply balance filter if enabled
    if (hideZeroBalanceIDs) {
      filtered = filtered.filter(item => {
        if (!item || !item.identity || !item.identity.identityaddress) return false; // Should not be hidden if invalid
        const balanceInfoObject = identityBalances[item.identity.identityaddress];
        if (!balanceInfoObject || typeof balanceInfoObject !== 'object' || balanceInfoObject.error) {
          return true; // Don't hide if balance info is missing or an error (treat as potentially non-zero or unknown)
        }
        const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
        const nativeBalance = balanceInfoObject[nativeChainTicker];
        let hasPositiveNativeBalance = (typeof nativeBalance === 'number' && nativeBalance > 0.000000009);
        
        let hasPositiveOtherBalance = false;
        for (const currencyKey in balanceInfoObject) {
          if (currencyKey !== nativeChainTicker && typeof balanceInfoObject[currencyKey] === 'number' && balanceInfoObject[currencyKey] > 0.000000009) {
            hasPositiveOtherBalance = true;
            break;
          }
        }
        return hasPositiveNativeBalance || hasPositiveOtherBalance; // Keep if either native or other balance is positive
      });
    }
    
    return filtered;
  }, [identities, identityBalances, hideZeroBalanceIDs, hideTicketIDs, nodeStatus?.chainName]);

  // Memoized filtered R-Addresses
  const filteredRAddressData = useMemo(() => {
    if (!rAddressData) return [];
    if (hideZeroBalanceRAddrs) {
      return rAddressData.filter(rAddr => {
        const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
        let hasPositiveNativeBalance = (typeof rAddr.nativeBalance === 'number' && rAddr.nativeBalance > 0.000000009);
        let hasPositiveOtherBalance = false;
        if (rAddr.allBalances && typeof rAddr.allBalances === 'object') {
          for (const currencyKey in rAddr.allBalances) {
            if (currencyKey !== nativeChainTicker && typeof rAddr.allBalances[currencyKey] === 'number' && rAddr.allBalances[currencyKey] > 0.000000009) {
              hasPositiveOtherBalance = true;
              break;
            }
          }
        }
        // Check if this R-address is primary for any VerusID
        let isPrimaryForID = identities && identities.some(id => id.primaryaddresses && id.primaryaddresses.includes(rAddr.address));
        return hasPositiveNativeBalance || hasPositiveOtherBalance || isPrimaryForID;
      });
    }
    return rAddressData;
  }, [rAddressData, hideZeroBalanceRAddrs, nodeStatus?.chainName, identities]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p:0 }}>
      {/* Top Section: VerusIDs */}
      <Box sx={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', minHeight: 0 /* Allow shrinking */ }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
          <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
            VerusIDs
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Tooltip title={hideTicketIDs ? "Show VLotto Tickets" : "Hide VLotto Tickets"}>
              <Switch 
                checked={hideTicketIDs} 
                onChange={() => setHideTicketIDs(!hideTicketIDs)} 
                size="small"
                sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#ff9800'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#ff9800'}}}
              />
            </Tooltip>
            {hideTicketIDs && identities && (
              <Typography sx={{ fontSize: '0.75rem', color: '#ff9800', minWidth: 24, textAlign: 'center', mr: 1 }}>
                T:{identities.filter(item => item?.identity?.name && isTicketId(item.identity.name)).length}
              </Typography>
            )}
            
            <Tooltip title={hideZeroBalanceIDs ? "Show All VerusIDs" : "Hide Zero-Balance VerusIDs"}>
              <Switch 
                checked={hideZeroBalanceIDs} 
                onChange={() => setHideZeroBalanceIDs(!hideZeroBalanceIDs)} 
                size="small"
                sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}
              />
            </Tooltip>
            {hideZeroBalanceIDs && (
              <Typography sx={{ fontSize: '0.75rem', color: '#4caf50', minWidth: 24, textAlign: 'center', mr: 1 }}>
                B:{identities ? identities.length - filteredIdentities.length - (hideTicketIDs ? identities.filter(item => item?.identity?.name && isTicketId(item.identity.name)).length : 0) : 0}
              </Typography>
            )}
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
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}> 
          {nodeStatus.connected && (loadingIdentities || loadingAllBalances) && filteredIdentities.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          )}
          {!loadingIdentities && !loadingAllBalances && filteredIdentities.length === 0 && nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
                {(hideZeroBalanceIDs || hideTicketIDs) && identities && identities.length > 0 ? 'No VerusIDs match current filters. Toggle filters to see all.' : 'No VerusIDs found. Click Update.'}
            </Typography>
          )}
          {!nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see VerusIDs.</Typography>
          )}
          {filteredIdentities.length > 0 && (
            <List dense disablePadding sx={{pt: 0.5}}>
              {filteredIdentities.map((item) => {
                if (!item || !item.identity || !item.identity.name) return null; 
                const name = item.identity.name;
                const iaddress = item.identity.identityaddress;
                const idNameWithAt = name.endsWith('@') ? name : `${name}@`;
                // Use the specific selection for VerusID Operations tab
                const isSelected = selectedIdNameForVerusIdOps === idNameWithAt || selectedIdName === idNameWithAt;
                const isHidden = hiddenVerusIds[idNameWithAt];
                
                const balanceInfoObject = identityBalances[iaddress];
                let nativeBalanceValue = 'N/A';
                let hasOtherBalances = false;

                if (balanceInfoObject && typeof balanceInfoObject === 'object') {
                  if (balanceInfoObject.error) {
                    nativeBalanceValue = 'Error';
                  } else {
                    const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
                    if (typeof balanceInfoObject[nativeChainTicker] === 'number') {
                      nativeBalanceValue = parseFloat(balanceInfoObject[nativeChainTicker]).toFixed(8);
                    } else {
                       nativeBalanceValue = (0.0).toFixed(8); 
                    }
                    // Check for other balances
                    for (const currencyKey in balanceInfoObject) {
                        if (currencyKey !== nativeChainTicker && typeof balanceInfoObject[currencyKey] === 'number' && balanceInfoObject[currencyKey] > 0.000000009) {
                            hasOtherBalances = true;
                            break;
                        }
                    }
                  }
                }
  
                let displayBalanceText = (loadingAllBalances && balanceInfoObject === undefined) ? 'Loading...' : nativeBalanceValue;
                
                const isCurrency = item.flags & 1;
                const isRevoked = item.status === "revoked";
                const isTimelocked = item.status === 'active' && item.timelock && nodeStatus.longestchain && item.timelock > nodeStatus.longestchain;

                let nameColor = isSelected ? theme.palette.primary.light : theme.palette.text.primary; 
                if (isRevoked) nameColor = theme.palette.error.light;
                else if (isTimelocked) nameColor = '#ba68c8'; 
                else if (isCurrency) nameColor = theme.palette.success.light;
                if (isSelected) nameColor = theme.palette.primary.light; // Selection color takes precedence

                return (
                  <StyledListItemButton
                    key={idNameWithAt}
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
                            toggleVerusIdVisibility(idNameWithAt);
                          }}
                          sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}
                        >
                          {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                        </IconButton>
                      </Tooltip>
              <ListItemText 
                        primary={renderNameWithVisibility(idNameWithAt, isHidden)} 
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
                      <Tooltip title={`Copy ID: ${idNameWithAt}`}>
                        <IconButton 
                          size="small"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCopy(idNameWithAt);
                          }}
                          sx={{ p: 0.25, ml: 'auto', flexShrink: 0 }}
                        >
                          <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: '36px', mt: -0.5 /* Adjust spacing */ }}>
                      <Typography component="span" sx={{ fontSize: '0.7rem', color: '#aaa'}}>
                        Bal: {renderNameWithVisibility(displayBalanceText, isHidden)}
                      </Typography>
                      {hasOtherBalances && (
                        <Tooltip title="Has other currency balances">
                          <Typography component="span" sx={{ fontSize: '0.7rem', color: '#6c9eda', ml: 1, fontWeight: 'bold' }}>
                            Other Bal: (+)
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
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
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Tooltip title={hideZeroBalanceRAddrs ? "Show All R-Addresses" : "Hide Zero-Balance R-Addresses"}>
              <Switch 
                checked={hideZeroBalanceRAddrs} 
                onChange={() => setHideZeroBalanceRAddrs(!hideZeroBalanceRAddrs)} 
                size="small"
                sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}
              />
            </Tooltip>
            {hideZeroBalanceRAddrs && (
              <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center', mr: 1 }}>
                {rAddressData ? rAddressData.length - filteredRAddressData.length : 0}
              </Typography>
            )}
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
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {nodeStatus.connected && isFetchingRAddresses && (!filteredRAddressData || filteredRAddressData.length === 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          )}
          {!isFetchingRAddresses && (!filteredRAddressData || filteredRAddressData.length === 0) && nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
              {hideZeroBalanceRAddrs && rAddressData && rAddressData.length > 0 ? 'No R-Addresses with balances. Toggle filter.' : 'No R-Addresses found. Click Update.'}
            </Typography>
          )}
          {!nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see R-Addresses.</Typography>
          )}
          {filteredRAddressData && filteredRAddressData.length > 0 && (
            <List dense disablePadding sx={{pt: 0.5}}>
              {filteredRAddressData.map((rAddr) => {
                // Use the specific selection for VerusID Operations tab
                const isSelected = selectedRAddressForVerusIdOps === rAddr.address || selectedRAddress === rAddr.address;
                const isHidden = hiddenRAddresses[rAddr.address];
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
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: -0.5 }}>
                          <Typography component="span" sx={{ fontSize: '0.7rem', color: '#aaa'}}>
                            Bal: {renderNameWithVisibility(rAddr.nativeBalance, isHidden)}
                          </Typography>
                          {rAddr.allBalances && Object.keys(rAddr.allBalances).filter(k => k !== (nodeStatus?.chainName || 'VRSCTEST')).some(k => rAddr.allBalances[k] > 0.000000009) && (
                            <Tooltip title="Has other currency balances">
                              <Typography component="span" sx={{ fontSize: '0.7rem', color: '#6c9eda', ml: 1, fontWeight: 'bold' }}>
                                $
                                {identities && identities.some(id => id.primaryaddresses && id.primaryaddresses.includes(rAddr.address)) && (
                                  <span style={{ color: '#fbc02d', marginLeft: 4 }}>IDs</span>
                                )}
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
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

export default VerusIdList; 