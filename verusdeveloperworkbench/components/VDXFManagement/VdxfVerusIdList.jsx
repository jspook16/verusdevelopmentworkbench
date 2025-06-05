import React, { useContext, useState, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, CircularProgress, IconButton, Tooltip, Button, Switch } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled, useTheme } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
// Removed: import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';

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

const VdxfVerusIdList = () => {
  const theme = useTheme();
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);
  const { selectedIdentityForVDXF, setSelectedIdentityForVDXF } = useContext(IdentityContext); 
  const [hideZeroBalanceIDs, setHideZeroBalanceIDs] = useState(true);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography sx={{p:1, fontSize: '0.8rem', color: '#888'}}>Loading context...</Typography>;
  }

  const {
    identities, loadingIdentities, fetchIdentities,
    identityBalances, loadingAllBalances,
  } = idContext;

  const {
    hiddenVerusIds, toggleVerusIdVisibility,
    getCopyString,
  } = workbenchContext;

  const filteredIdentities = useMemo(() => {
    if (!identities) return [];
    if (hideZeroBalanceIDs) {
      return identities.filter(item => {
        if (!item || !item.identity || !item.identity.identityaddress) return true;
        const balanceInfoObject = identityBalances[item.identity.identityaddress];
        if (!balanceInfoObject || typeof balanceInfoObject !== 'object' || balanceInfoObject.error) return true;
        const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
        const nativeBalance = balanceInfoObject[nativeChainTicker];
        let hasPositiveNativeBalance = (typeof nativeBalance === 'number' && nativeBalance > 0.000000009);
        let hasPositiveOtherBalance = false;
        for (const currencyKey in balanceInfoObject) {
          if (currencyKey !== nativeChainTicker && typeof balanceInfoObject[currencyKey] === 'number' && balanceInfoObject[currencyKey] > 0.000000009) {
            hasPositiveOtherBalance = true; break;
          }
        }
        return hasPositiveNativeBalance || hasPositiveOtherBalance;
      });
    }
    return identities;
  }, [identities, identityBalances, hideZeroBalanceIDs, nodeStatus?.chainName]);

  const handleUpdateVerusIDs = () => {
    if (nodeStatus.connected) {
      fetchIdentities();
    }
  };

  const handleIdSelect = (item) => {
    if (item && item.displayName) {
      setSelectedIdentityForVDXF(item.displayName);
    } else {
      setSelectedIdentityForVDXF(null);
    }
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
          VerusIDs
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Button variant="outlined" size="small" onClick={handleUpdateVerusIDs} disabled={loadingIdentities || loadingAllBalances || !nodeStatus.connected} startIcon={loadingIdentities || loadingAllBalances ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto', mr: 1 }} > {!loadingIdentities && !loadingAllBalances && ""} </Button>
            <Tooltip title={hideZeroBalanceIDs ? "Show All IDs" : "Hide Zero-Balance IDs"}>
              <Switch 
                checked={hideZeroBalanceIDs} 
                onChange={() => setHideZeroBalanceIDs(!hideZeroBalanceIDs)} 
                size="small"
                sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}/>
            </Tooltip>
            {hideZeroBalanceIDs && (
              <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center' }}>
                {identities ? identities.length - filteredIdentities.length : 0}
              </Typography>
            )}
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}> 
        {nodeStatus.connected && (loadingIdentities || loadingAllBalances) && filteredIdentities.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingIdentities && !loadingAllBalances && filteredIdentities.length === 0 && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            {hideZeroBalanceIDs && identities && identities.length > 0 ? 'No IDs with balances. Toggle filter.' : 'No VerusIDs found. Click Update.'}
          </Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see VerusIDs.</Typography>
        )}
        {filteredIdentities.length > 0 && (
          <List dense disablePadding sx={{pt: 0.5}}>
            {filteredIdentities.map((item) => {
              if (!item || !item.displayName || !item.identity) return null; 

              const currentDisplayName = item.displayName;
              const isSelected = selectedIdentityForVDXF === currentDisplayName; 
              const isHidden = hiddenVerusIds[currentDisplayName];
              
              const balanceInfoObject = identityBalances[item.identity.identityaddress];
              let nativeBalanceValue = 'N/A';
              let hasOtherBalances = false;

              if (balanceInfoObject && typeof balanceInfoObject === 'object') {
                if (balanceInfoObject.error) {
                  nativeBalanceValue = 'Error';
                } else {
                  const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
                  if (typeof balanceInfoObject[nativeChainTicker] === 'number') {
                    nativeBalanceValue = parseFloat(balanceInfoObject[nativeChainTicker]).toFixed(8);
                  } else if (Object.keys(balanceInfoObject).length > 0) {
                     nativeBalanceValue = (0.0).toFixed(8); 
                  }
                  for (const currencyKey in balanceInfoObject) {
                    if (currencyKey !== nativeChainTicker && typeof balanceInfoObject[currencyKey] === 'number' && balanceInfoObject[currencyKey] > 0.000000009) {
                      hasOtherBalances = true; break;
                    }
                  }
                }
              }

              let displayBalanceText = (loadingAllBalances && balanceInfoObject === undefined) ? 'Loading...' : nativeBalanceValue;
              
              const itemFlags = item.identity.flags || 0;
              const isCurrency = (itemFlags & 1) === 1;
              const isRevoked = item.status === "revoked";
              
              const timelockValue = item.identity && typeof item.identity.timelock === 'number' ? item.identity.timelock : 0;
              const longestChainValue = nodeStatus && typeof nodeStatus.longestchain === 'number' ? nodeStatus.longestchain : 0;
              
              // Revised isTimelocked condition for color coding
              const activelyCountingDown = timelockValue > 0 && timelockValue > longestChainValue;
              const definedWithDelayLock = (itemFlags & 2) === 2 && timelockValue > 0; // timelockValue here is the delay period
              const isConsideredTimelocked = item.status === 'active' && (activelyCountingDown || definedWithDelayLock);

              if (item.displayName === 'timelockme@' || item.displayName === 'timelockme1@') {
                console.log(`[VdxfVerusIdList] Debug for ${item.displayName}: `,
                  `isConsideredTimelocked: ${isConsideredTimelocked}, `,
                  `activelyCountingDown: ${activelyCountingDown}, `,
                  `definedWithDelayLock: ${definedWithDelayLock}, `,
                  `timelockValue: ${timelockValue}, `,
                  `longestChainValue: ${longestChainValue}, `,
                  `item.status: ${item.status}, `,
                  `itemFlags: ${itemFlags}`);
              }

              let nameColor;
              if (isRevoked) {
                nameColor = theme.palette.error.light;
              } else if (isConsideredTimelocked) { // Use the new combined condition
                nameColor = '#ba68c8'; 
              } else if (isCurrency) {
                nameColor = theme.palette.success.light;
              } else if (isSelected) {
                nameColor = theme.palette.primary.light;
              } else {
                nameColor = theme.palette.text.primary;
              }

              return (
                <StyledListItemButton key={item.identity.identityaddress || currentDisplayName} selected={isSelected} onClick={() => handleIdSelect(item)} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Tooltip title={isHidden ? "Show ID" : "Hide ID"}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleVerusIdVisibility(currentDisplayName);}} sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}>
                        {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      </IconButton>
                    </Tooltip>
                    <ListItemText 
                      primary={renderNameWithVisibility(currentDisplayName, isHidden)} 
                      primaryTypographyProps={{ sx: { fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal', color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'} }} 
                      sx={{ flexGrow: 1, mr: 0.5, overflow: 'hidden' }}
                    />
                    <IconButton 
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleCopy(currentDisplayName);}}
                      sx={{ p: 0.25, ml: 'auto', flexShrink: 0, color: '#aaa', '&:hover': {color:'#90caf9'} }}
                      aria-label={`Copy VerusID ${currentDisplayName}`}
                    >
                      <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: '36px', mt: -0.5 }}>
                    <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369'}}>
                      Bal: {renderNameWithVisibility(displayBalanceText, isHidden)}
                    </Typography>
                    {hasOtherBalances && (
                      <Tooltip title="Has other currency balances">
                        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369', ml: 1, fontWeight: 'bold' }}>
                          $
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
  );
};

export default VdxfVerusIdList; 