import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, IconButton, Tooltip, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
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

const RAddressListWM = () => {
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);

  const [isFetchingRAddresses, setIsFetchingRAddresses] = useState(false);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography sx={{p:1, fontSize: '0.8rem', color: '#888'}}>Loading context...</Typography>;
  }

  const {
    selectedRAddressWM, setSelectedRAddressWM_independent, // Use WM specific state and new independent setter
  } = idContext;

  const {
    rAddressesWithUtxos, fetchAndSetRAddressesWithUtxos,
    hiddenRAddresses, toggleRAddressVisibility,
    getCopyString,
  } = workbenchContext;

  const handleUpdateRAddresses = async () => {
    if (nodeStatus.connected) {
      setIsFetchingRAddresses(true);
      try {
        if (fetchAndSetRAddressesWithUtxos) await fetchAndSetRAddressesWithUtxos();
      } catch (error) {
        console.error("Failed to fetch R-Addresses:", error);
      } finally {
        setIsFetchingRAddresses(false);
      }
    }
  };

  const handleRAddressSelect = (rAddress) => {
    if (setSelectedRAddressWM_independent) setSelectedRAddressWM_independent(rAddress);
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
        <Typography variant="h6" sx={{color: 'white', fontSize: '0.9rem', fontWeight:'bold' }}>
          R-Addresses
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUpdateRAddresses}
          disabled={isFetchingRAddresses || !nodeStatus.connected}
          startIcon={isFetchingRAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto' }}
        >
           {!isFetchingRAddresses && "Update"}
        </Button>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
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
              const isSelected = selectedRAddressWM === rAddr.address;
              const isHidden = hiddenRAddresses && hiddenRAddresses[rAddr.address];
              return (
                <StyledListItemButton
                  key={rAddr.address}
                  selected={isSelected}
                  onClick={() => handleRAddressSelect(rAddr.address)}
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Tooltip title={isHidden ? "Show R-Address" : "Hide R-Address"}>
                      <IconButton 
                        size="small"
                        onClick={(e) => { e.stopPropagation(); toggleRAddressVisibility(rAddr.address);}}
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
                        onClick={(e) => { e.stopPropagation(); handleCopy(rAddr.address);}}
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

export default RAddressListWM; 