import React, { useContext, useState, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, IconButton, Tooltip, Button, Switch } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// Removed: import FilterListIcon from '@mui/icons-material/FilterList'; // If not used
import { styled } from '@mui/material/styles';
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

const VdxfRAddressList = () => { // Renamed component
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus } = useContext(NodeContext);
  
  // Use VDXF specific selection from IdentityContext
  const { selectedRAddressForVDXF, setSelectedRAddressForVDXF, identities } = useContext(IdentityContext); 
  const [isFetchingRAddresses, setIsFetchingRAddresses] = useState(false);
  const [hideZeroBalanceRAddrs, setHideZeroBalanceRAddrs] = useState(true);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography sx={{p:1, fontSize: '0.8rem', color: '#888'}}>Loading context...</Typography>;
  }

  // identities already destructured from idContext above
  // const {
  //   identities,
  // } = idContext;

  const {
    rAddressData,
    fetchAndSetRAddressesWithUtxos,
    hiddenRAddresses, toggleRAddressVisibility,
    getCopyString,
  } = workbenchContext;

  const filteredRAddressData = useMemo(() => {
    if (!rAddressData) return [];
    if (hideZeroBalanceRAddrs) {
      return rAddressData.filter(rAddr => {
        if (!rAddr || !rAddr.address) return false; // Added guard for rAddr
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
        // Ensure identities array is available before using .some()
        let isPrimaryForID = identities && identities.some(id => id.identity && id.identity.primaryaddresses && id.identity.primaryaddresses.includes(rAddr.address));
        return hasPositiveNativeBalance || hasPositiveOtherBalance || isPrimaryForID;
      });
    }
    return rAddressData;
  }, [rAddressData, hideZeroBalanceRAddrs, nodeStatus?.chainName, identities]);

  const handleUpdateRAddresses = async () => {
    if (nodeStatus.connected && fetchAndSetRAddressesWithUtxos) { // check fetchAndSetRAddressesWithUtxos
      setIsFetchingRAddresses(true);
      try {
        await fetchAndSetRAddressesWithUtxos();
      } catch (error) {
        console.error("Failed to fetch R-Addresses for VDXF:", error);
      } finally {
        setIsFetchingRAddresses(false);
      }
    }
  };

  const handleRAddressSelect = (rAddress) => {
    // Use VDXF specific setter
    if (setSelectedRAddressForVDXF) setSelectedRAddressForVDXF(rAddress); 
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
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight:'bold' }}>
          R
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUpdateRAddresses}
            disabled={isFetchingRAddresses || !nodeStatus.connected}
            startIcon={isFetchingRAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto', mr: 1 }}
          >
             {!isFetchingRAddresses && ""}
          </Button>
          <Tooltip title={hideZeroBalanceRAddrs ? "Show All R" : "Hide Zero-Balance R"}>
            <Switch 
              checked={hideZeroBalanceRAddrs} 
              onChange={() => setHideZeroBalanceRAddrs(!hideZeroBalanceRAddrs)} 
              size="small"
              sx={{mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}/>
          </Tooltip>
          {hideZeroBalanceRAddrs && (
            <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center' }}>
              {rAddressData ? rAddressData.length - (filteredRAddressData ? filteredRAddressData.length : 0) : 0}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {nodeStatus.connected && isFetchingRAddresses && (!filteredRAddressData || filteredRAddressData.length === 0) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!isFetchingRAddresses && (!filteredRAddressData || filteredRAddressData.length === 0) && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            {hideZeroBalanceRAddrs && rAddressData && rAddressData.length > 0 ? 'No R with balances. Toggle filter.' : 'No R found. Click Update.'}
          </Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see R.</Typography>
        )}
        {filteredRAddressData && filteredRAddressData.length > 0 && (
          <List dense disablePadding sx={{pt:0.5}}>
            {filteredRAddressData.map((rAddr) => {
              if (!rAddr || !rAddr.address) return null; // Added guard for rAddr
              // Use VDXF specific selected address for isSelected logic
              const isSelected = selectedRAddressForVDXF === rAddr.address;
              const isHidden = hiddenRAddresses && hiddenRAddresses[rAddr.address]; // Check hiddenRAddresses
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
                    <Tooltip title={isHidden ? "Show R" : "Hide R"}>
                      <IconButton 
                        size="small"
                        onClick={(e) => { e.stopPropagation(); if (toggleRAddressVisibility) toggleRAddressVisibility(rAddr.address);}} // Check toggleRAddressVisibility
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
                        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369'}}>
                          Bal: {renderNameWithVisibility(rAddr.nativeBalance, isHidden)}
                        </Typography>
                        {rAddr.allBalances && Object.keys(rAddr.allBalances).filter(k => k !== (nodeStatus?.chainName || 'VRSCTEST')).some(k => rAddr.allBalances[k] > 0.000000009) && (
                          <Tooltip title="Has other currency balances">
                            <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369', ml: 1, fontWeight: 'bold' }}>
                              $
                            </Typography>
                          </Tooltip>
                        )}
                        {/* Ensure identities array is available before using .some() */}
                        {identities && identities.some(id => id.identity && id.identity.primaryaddresses && id.identity.primaryaddresses.includes(rAddr.address)) && (
                           <Tooltip title="Primary address for one or more VerusIDs">
                            <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369', ml: 1, fontWeight: 'bold' }}>
                               IDs
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title={`Copy R: ${rAddr.address}`}>
                      <IconButton 
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleCopy(rAddr.address);
                        }}
                        sx={{ p: 0.25, flexShrink: 0, color: '#aaa', '&:hover': {color:'#90caf9'} }}
                        aria-label={`Copy R ${rAddr.address}`}
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

export default VdxfRAddressList; 