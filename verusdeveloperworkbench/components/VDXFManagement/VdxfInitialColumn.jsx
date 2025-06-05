import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, CircularProgress, IconButton, Tooltip, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import VdxfVerusIdDetailsView from './VdxfVerusIdDetailsView';

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  paddingTop: theme.spacing(0.3),
  paddingBottom: theme.spacing(0.3),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
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
}));

const VdxfInitialColumn = () => {
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography>Loading context...</Typography>;
  }

  const {
    identities, loadingIdentities,
    selectedIdentityForVDXF, setSelectedIdentityForVDXF,
    vdxfIdentityDetails,
    loadingVdxfDetails,
    errorVdxfDetails,
    fetchIdentities
  } = idContext;

  const { hiddenVerusIds, toggleVerusIdVisibility, getCopyString } = workbenchContext;

  useEffect(() => {
    const subidItem = identities.find(id => id?.identity?.name === 'subid');
    if (subidItem) {
        console.log('[VDXFColumn] useEffect [identities]: subidItem.displayName:', subidItem.displayName);
    }
  }, [identities]);

  useEffect(() => {
    if (!nodeStatus.connected) {
    }
  }, [nodeStatus.connected]);

  const handleUpdateVerusIDs = () => {
    if (nodeStatus.connected) {
      fetchIdentities();
    }
  };

  const handleIdSelect = (item) => {
    if (item && item.displayName) {
      console.log('[VDXFColumn] handleIdSelect, selecting displayName:', item.displayName);
      setSelectedIdentityForVDXF(item.displayName);
    } else {
      console.warn('[VDXFColumn] handleIdSelect called with invalid item:', item);
    }
  };

  const handleCopy = (textToCopy) => {
    const stringToCopy = getCopyString ? getCopyString(textToCopy) : String(textToCopy);
    navigator.clipboard.writeText(stringToCopy);
  };

  const renderNameWithVisibility = (name, isHidden) => {
    if (name === undefined || name === null) return '';
    let text = String(name);
    return isHidden ? '*'.repeat(text.length > 0 ? text.length : 3) : text;
  };

  const getIsIdSelected = (item) => {
    if (!item || !item.displayName) return false;
    return selectedIdentityForVDXF === item.displayName;
  };

  const getIdNameColor = (item, isSelected) => {
    console.log('[getIdNameColor] Item:', item, 'IsSelected:', isSelected, 'NodeStatus:', nodeStatus);
    if (!item) return isSelected ? '#90caf9' : '#ddd';

    const isCurrency = item.flags & 1;
    const isRevoked = item.status === 'revoked';
    const isTimelocked = item.timelock && nodeStatus && item.timelock > nodeStatus.longestchain;

    if (isRevoked) return '#ff6b6b';
    if (isTimelocked) return '#c56cf0';
    if (isCurrency) return '#4caf50';
    return isSelected ? '#90caf9' : '#ddd';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
          My VerusIDs
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUpdateVerusIDs}
          disabled={loadingIdentities || !nodeStatus.connected}
          startIcon={loadingIdentities ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto' }}
        >
          {!loadingIdentities && "Update"}
        </Button>
      </Box>

      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {console.log('[VDXFColumn] SubID item from context identities:', JSON.stringify(identities.find(id => id?.identity?.name === 'subid')))}
        {nodeStatus.connected && loadingIdentities && identities.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingIdentities && identities.length === 0 && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>No VerusIDs found. Click Update.</Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see VerusIDs.</Typography>
        )}
        {identities.length > 0 && (
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {identities.map((item) => {
              if (!item || !item.identity || !item.displayName) {
                return null;
              }

              const currentDisplayName = item.displayName;

              if (item.identity.name === 'subid') {
                console.log('[VDXFColumn] MAP: Processing subid. item.displayName:', item.displayName, 'currentDisplayName var:', currentDisplayName);
              }

              const isSelected = getIsIdSelected(item);
              const isHidden = hiddenVerusIds[currentDisplayName];
              const nameColor = getIdNameColor(item, isSelected);
              
              return (
                <StyledListItemButton 
                  key={item.identity.identityaddress || currentDisplayName} 
                  selected={isSelected} 
                  onClick={() => handleIdSelect(item)} 
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Tooltip title={isHidden ? "Show ID" : "Hide ID"}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleVerusIdVisibility(currentDisplayName); }} sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}>
                      {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                    </IconButton>
                  </Tooltip>
                  <ListItemText
                    primary={renderNameWithVisibility(currentDisplayName, isHidden)}
                    primaryTypographyProps={{ sx: { fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal', color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                    sx={{ flexGrow: 1, mr: 0.5, overflow: 'hidden' }}
                  />
                  <Tooltip title={`Copy ID: ${currentDisplayName}`}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopy(currentDisplayName); }} sx={{ p: 0.25, ml: 'auto', flexShrink: 0 }}>
                      <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </StyledListItemButton>
              );
            })}
          </List>
        )}
      </Box>

      <Divider sx={{ bgcolor: '#444', flexShrink: 0, mt: 'auto' }} />
      <Box sx={{
        flexShrink: 0,
        minHeight: '150px',
        maxHeight: '45%',
        overflow: 'hidden',
        p: 0
      }}>
        <VdxfVerusIdDetailsView
          identityDetails={vdxfIdentityDetails}
          isLoading={loadingVdxfDetails}
          error={errorVdxfDetails}
        />
      </Box>
    </Box>
  );
};

export default VdxfInitialColumn; 