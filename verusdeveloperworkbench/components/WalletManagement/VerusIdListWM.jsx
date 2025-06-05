import React, { useContext, useEffect, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, CircularProgress, IconButton, Tooltip, Button } from '@mui/material';
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

const VerusIdListWM = () => {
  const theme = useTheme();
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography sx={{p:1, fontSize: '0.8rem', color: '#888'}}>Loading context...</Typography>;
  }

  const {
    identities, loadingIdentities, fetchIdentities,
    identityBalances, loadingAllBalances,
    selectedVerusIdWM, setSelectedVerusIdWM_independent,
  } = idContext;

  const {
    hiddenVerusIds, toggleVerusIdVisibility,
    getCopyString,
  } = workbenchContext;

  useEffect(() => {
  }, [nodeStatus.connected, identities, loadingIdentities, fetchIdentities]);

  const handleUpdateVerusIDs = () => {
    if (nodeStatus.connected) {
      fetchIdentities();
    }
  };

  const handleIdSelect = (item) => {
    if (item && item.identity) { 
      if (setSelectedVerusIdWM_independent) {
        setSelectedVerusIdWM_independent(item);
      }
    } else {
      if (setSelectedVerusIdWM_independent) {
        setSelectedVerusIdWM_independent(null);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
          VerusIDs
        </Typography>
        <Button variant="outlined" size="small" onClick={handleUpdateVerusIDs} disabled={loadingIdentities || loadingAllBalances || !nodeStatus.connected} startIcon={loadingIdentities || loadingAllBalances ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto' }} > {!loadingIdentities && !loadingAllBalances && ""} </Button>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}> 
        {nodeStatus.connected && (loadingIdentities || loadingAllBalances) && (!identities || identities.length === 0) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingIdentities && !loadingAllBalances && (!identities || identities.length === 0) && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>No VerusIDs found. Click Update.</Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see VerusIDs.</Typography>
        )}
        {identities && identities.length > 0 && (
          <List dense disablePadding sx={{pt: 0.5}}>
            {identities.map((item) => {
              if (!item || !item.identity || !item.identity.name) return null; 
              const idNameWithAt = item.identity.name.endsWith('@') ? item.identity.name : `${item.identity.name}@`;
              const isSelected = selectedVerusIdWM && selectedVerusIdWM.identity && selectedVerusIdWM.identity.name === item.identity.name;
              const isHidden = hiddenVerusIds && hiddenVerusIds[idNameWithAt];
              
              // Safe access to balance information with thorough null checks
              let displayBalanceText = 'N/A';
              if (item.identity.identityaddress && identityBalances) {
                const balanceInfo = identityBalances[item.identity.identityaddress];
                if (loadingAllBalances && balanceInfo === undefined) {
                  displayBalanceText = 'Loading...';
                } else if (balanceInfo === undefined || balanceInfo === null) {
                  displayBalanceText = 'N/A';
                } else if (balanceInfo === 'Error' || (balanceInfo && balanceInfo.error)) {
                  displayBalanceText = 'Error';
                } else if (typeof balanceInfo === 'object') {
                  // Handle object format from new balance structure
                  const nativeChainTicker = nodeStatus?.chainName || 'VRSCTEST';
                  const nativeBalance = balanceInfo[nativeChainTicker];
                  if (typeof nativeBalance === 'number') {
                    displayBalanceText = parseFloat(nativeBalance).toFixed(8);
                  }
                } else if (typeof balanceInfo === 'number' || typeof balanceInfo === 'string') {
                  // Handle legacy format (direct number)
                  displayBalanceText = parseFloat(balanceInfo).toFixed(8);
                }
              }

              const isCurrency = item.identity && typeof item.identity.flags === 'number' && (item.identity.flags & 1) === 1;
              const isRevoked = item.status === "revoked";
              const isTimelocked = item.identity && item.identity.timelock && parseInt(item.identity.timelock) > 0 && item.status === 'active';

              let nameColor = isSelected ? theme.palette.primary.light : theme.palette.text.primary; 
              if (isRevoked) {
                nameColor = theme.palette.error.light;
              } else if (isTimelocked) {
                nameColor = '#ba68c8';
              } else if (isCurrency) {
                nameColor = theme.palette.success.light;
              }
              if (isSelected) nameColor = theme.palette.primary.light;

              return (
                <StyledListItemButton key={idNameWithAt} selected={isSelected} onClick={() => handleIdSelect(item)} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Tooltip title={isHidden ? "Show ID" : "Hide ID"}><IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleVerusIdVisibility(idNameWithAt);}} sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}>{isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}</IconButton></Tooltip>
                    <ListItemText 
                      primary={renderNameWithVisibility(idNameWithAt, isHidden)} 
                      primaryTypographyProps={{ sx: { fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal', color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'} }} 
                      sx={{ flexGrow: 1, mr: 0.5, overflow: 'hidden' }}
                    />
                    <Tooltip title={`Copy ID: ${idNameWithAt}`}><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopy(idNameWithAt);}} sx={{ p: 0.25, ml: 'auto', flexShrink: 0 }}><ContentCopyIcon sx={{ fontSize: '0.9rem' }} /></IconButton></Tooltip>
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
  );
};

export default VerusIdListWM; 