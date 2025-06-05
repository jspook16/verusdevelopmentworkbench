import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, CircularProgress, IconButton, Tooltip, Button, Switch, Avatar } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled, useTheme } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import useIdentityAvatar from '../../hooks/useIdentityAvatar';
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

/**
 * VerusIdListMarketplace - Displays a list of VerusIDs, with support for different context types (marketplace, vdxf, currency)
 * 
 * @param {string} contextType - The context type ('marketplace', 'vdxf', 'currency')
 * @param {string} selectedId - The currently selected ID (from parent or context)
 * @param {function} onSelectId - Function to call when an ID is selected (from parent or context)
 * @param {boolean} hideHeader - Whether to hide the header (default: false)
 * @param {boolean} hideHeaderTitle - Whether to hide just the header title (default: false)
 */
const VerusIdListMarketplace = ({ contextType = 'marketplace', hideHeader = false, hideHeaderTitle = false }) => {
  const theme = useTheme();
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const marketplaceContext = useContext(MarketplaceIdentityContext);
  const [hideZeroBalanceIDs, setHideZeroBalanceIDs] = useState(true);
  const [hideTicketIDs, setHideTicketIDs] = useState(true);
  const [selectedVerusId, setSelectedVerusId] = useState(null);

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

  // Determine which context and selection handlers to use based on contextType
  let selectedIdFromContext;
  let handleSelectIdForContext;
  
  switch (contextType) {
    case 'vdxf':
      selectedIdFromContext = idContext.selectedIdentityForVDXF;
      handleSelectIdForContext = idContext.setSelectedIdentityForVDXF;
      break;
    case 'currency':
      selectedIdFromContext = idContext.selectedIdentityForCurrencyWS;
      handleSelectIdForContext = idContext.selectIdentityForCurrencyWS;
      break;
    case 'marketplace':
    default:
      selectedIdFromContext = marketplaceContext?.selectedMarketplaceId;
      break;
  }

  // Memoized filtered VerusIDs for Marketplace
  const filteredMarketplaceIdentities = useMemo(() => {
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
        if (!item || !item.identity || !item.identity.identityaddress) return true; // Don't filter if invalid
        const balanceInfoObject = identityBalances[item.identity.identityaddress];
        if (!balanceInfoObject || typeof balanceInfoObject !== 'object' || balanceInfoObject.error) return true;
        
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
        return hasPositiveNativeBalance || hasPositiveOtherBalance;
      });
    }
    
    return filtered;
  }, [identities, identityBalances, hideZeroBalanceIDs, hideTicketIDs, nodeStatus?.chainName]);

  const handleUpdateVerusIDs = () => {
    if (nodeStatus.connected) {
      fetchIdentities();
    }
  };

  const handleIdSelect = (item) => {
    if (item && item.displayName) {
      if (contextType === 'marketplace' && marketplaceContext) {
        if (marketplaceContext.setSelectedVerusId) {
          marketplaceContext.setSelectedVerusId(item);
        }
      } else if (handleSelectIdForContext) {
        handleSelectIdForContext(item.displayName);
      }
    } else {
      if (contextType === 'marketplace' && marketplaceContext) {
        if (marketplaceContext.setSelectedVerusId) {
          marketplaceContext.setSelectedVerusId(null);
        }
      } else if (handleSelectIdForContext) {
        handleSelectIdForContext(null);
      }
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

  const toggleVisibility = (event, idDisplayName) => {
    event.stopPropagation();
    toggleVerusIdVisibility(idDisplayName);
  };

  const visibleIdentities = useMemo(() => 
    filteredMarketplaceIdentities.filter(id => {
      if (!id || !id.displayName) return false;
      return !hiddenVerusIds[id.displayName] || hiddenVerusIds[id.displayName] === false;
    }), [filteredMarketplaceIdentities, hiddenVerusIds]);

  // Internal component to render each list item
  const MarketplaceIdListItemRenderer = React.memo(({ 
    item, 
    isSelected, 
    isHidden, 
    nameColor, 
    displayBalanceText, 
    hasOtherBalances, 
    onSelect, 
    onToggleVisibility, 
    onCopy, 
    renderNameWithVisibilityFromParent,
    currentDisplayNameForKeys // This is item.displayName from IdentityContext, already resolved
  }) => {
    const { avatarSrc, isLoading: avatarLoading, label: avatarLabel } = useIdentityAvatar(item.identity.identityaddress);
    // REMOVE the useEffect that calls getResolvedDisplayName and setResolvedDisplayNameState
    // const [resolvedDisplayNameState, setResolvedDisplayNameState] = useState(currentDisplayNameForKeys);
    // const identityForEffect = item?.identity; ... useEffect ... etc.

    // Use currentDisplayNameForKeys directly as it should be pre-resolved by IdentityContext
    const resolvedDisplayNameState = currentDisplayNameForKeys;

    return (
      <StyledListItemButton 
        selected={isSelected} 
        onClick={() => onSelect(item)} 
        sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Tooltip title={isHidden ? "Show ID" : "Hide ID"}>
            <IconButton size="small" onClick={(e) => onToggleVisibility(e, currentDisplayNameForKeys)} sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}>
              {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
            </IconButton>
          </Tooltip>
          
          {/* Avatar Display */}
          <Box sx={{ mr: 0.75, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarLoading ? (
              <CircularProgress size={20} />
            ) : avatarSrc ? (
              <Tooltip title={avatarLabel || 'Avatar'}>
                <Avatar src={avatarSrc} sx={{ width: 24, height: 24, fontSize: '0.7rem' }} />
              </Tooltip>
            ) : (
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'secondary.main' }}>
                {resolvedDisplayNameState ? resolvedDisplayNameState.substring(0, 1).toUpperCase() : '?'}
              </Avatar>
            )}
          </Box>

          <ListItemText 
            primary={renderNameWithVisibilityFromParent(resolvedDisplayNameState, isHidden)} 
            primaryTypographyProps={{ sx: { fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal', color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'} }} 
            sx={{ flexGrow: 1, mr: 0.5, overflow: 'hidden' }}
          />
          <IconButton 
            size="small"
            onClick={(e) => { 
              e.stopPropagation(); 
              onCopy(currentDisplayNameForKeys); // Use original name for copy
            }}
            sx={{ p: 0.25, ml: 'auto', flexShrink: 0, color: '#aaa', '&:hover': {color:'#90caf9'} }}
            aria-label={`Copy VerusID ${currentDisplayNameForKeys}`}
          >
            <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 'calc(24px + 6px + 24px + 6px)', /* Adjusted for visibility + avatar */ mt: -0.5 }}>
          <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369'}}>
            Bal: {renderNameWithVisibilityFromParent(displayBalanceText, isHidden)}
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
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!hideHeader && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
          {!hideHeaderTitle && (
            <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
              VerusIDs
            </Typography>
          )}
          <Box sx={{display: 'flex', alignItems: 'center', ml: hideHeaderTitle ? 'auto' : 0}}>
              <Button variant="outlined" size="small" onClick={handleUpdateVerusIDs} disabled={loadingIdentities || loadingAllBalances || !nodeStatus.connected} startIcon={loadingIdentities || loadingAllBalances ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto', mr: 1 }} > {!loadingIdentities && !loadingAllBalances && ""} </Button>
              
              <Tooltip title={hideTicketIDs ? "Show VLotto Tickets" : "Hide VLotto Tickets"}>
                <Switch 
                  checked={hideTicketIDs} 
                  onChange={() => setHideTicketIDs(!hideTicketIDs)} 
                  size="small"
                  sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#ff9800'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#ff9800'}}}/>
              </Tooltip>
              {hideTicketIDs && identities && (
                <Typography sx={{ fontSize: '0.75rem', color: '#ff9800', minWidth: 24, textAlign: 'center', mr: 1 }}>
                  T:{identities.filter(item => item?.identity?.name && isTicketId(item.identity.name)).length}
                </Typography>
              )}
              
              <Tooltip title={hideZeroBalanceIDs ? "Show All IDs" : "Hide Zero-Balance IDs"}>
                <Switch 
                  checked={hideZeroBalanceIDs} 
                  onChange={() => setHideZeroBalanceIDs(!hideZeroBalanceIDs)} 
                  size="small"
                  sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}/>
              </Tooltip>
              {hideZeroBalanceIDs && (
                <Typography sx={{ fontSize: '0.75rem', color: '#4caf50', minWidth: 24, textAlign: 'center' }}>
                  B:{identities ? identities.length - filteredMarketplaceIdentities.length - (hideTicketIDs ? identities.filter(item => item?.identity?.name && isTicketId(item.identity.name)).length : 0) : 0}
                </Typography>
              )}
          </Box>
        </Box>
      )}
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}> 
        {nodeStatus.connected && (loadingIdentities || loadingAllBalances) && visibleIdentities.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingIdentities && !loadingAllBalances && visibleIdentities.length === 0 && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            {(hideZeroBalanceIDs || hideTicketIDs) && identities && identities.length > 0 ? 'No IDs match current filters. Toggle filters to see all.' : 'No VerusIDs found. Click Update.'}
          </Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see VerusIDs.</Typography>
        )}
        {visibleIdentities.length > 0 && (
          <List dense disablePadding sx={{pt: 0.5}}>
            {visibleIdentities.map((item) => {
              if (!item || !item.displayName || !item.identity) return null; 
              
              const currentDisplayName = item.displayName;
              const isSelected = selectedIdFromContext === currentDisplayName;
              const isHidden = hiddenVerusIds[currentDisplayName];
              
              const balanceInfoObject = identityBalances[item.identity.identityaddress];
              let nativeBalanceValue = 'N/A';
              let hasOtherBalances = false;
              if (balanceInfoObject && typeof balanceInfoObject === 'object') {
                if (balanceInfoObject.error) nativeBalanceValue = 'Error';
                else {
                  const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
                  if (typeof balanceInfoObject[nativeChainTicker] === 'number') nativeBalanceValue = parseFloat(balanceInfoObject[nativeChainTicker]).toFixed(8);
                  else if (Object.keys(balanceInfoObject).length > 0) nativeBalanceValue = (0.0).toFixed(8); 
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
              
              const activelyCountingDown = timelockValue > 0 && timelockValue > longestChainValue;
              const definedWithDelayLock = (itemFlags & 2) === 2 && timelockValue > 0; 
              const isConsideredTimelocked = item.status === 'active' && (activelyCountingDown || definedWithDelayLock);

              let nameColor = isSelected ? theme.palette.primary.light : theme.palette.text.primary; 
              if (isRevoked) {
                nameColor = theme.palette.error.light;
              } else if (isConsideredTimelocked) {
                nameColor = '#ba68c8';
              } else if (isCurrency) {
                nameColor = theme.palette.success.light;
              }
              if (isSelected && nameColor === theme.palette.text.primary) {
                nameColor = theme.palette.primary.light;
              }

              return (
                <MarketplaceIdListItemRenderer
                  key={item.identity.identityaddress || currentDisplayName}
                  item={item}
                  isSelected={isSelected}
                  isHidden={isHidden}
                  nameColor={nameColor}
                  displayBalanceText={displayBalanceText}
                  hasOtherBalances={hasOtherBalances}
                  onSelect={handleIdSelect}
                  onToggleVisibility={toggleVisibility}
                  onCopy={handleCopy}
                  renderNameWithVisibilityFromParent={renderNameWithVisibility}
                  currentDisplayNameForKeys={currentDisplayName}
                />
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default VerusIdListMarketplace; 