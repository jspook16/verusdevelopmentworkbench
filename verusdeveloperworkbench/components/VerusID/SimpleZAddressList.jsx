import React, { useContext, useState } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, Button, Switch } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';

// Simple styled button for list items
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
 * A simplified version of ZAddressListMarketplace that avoids problematic function calls
 */
const SimpleZAddressList = () => {
  const { nodeStatus } = useContext(NodeContext) || {};
  const workbenchContext = useContext(WorkbenchDataContext) || {};
  const { selectedZAddress, setSelectedZAddress } = useContext(MarketplaceIdentityContext) || {};
  
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [hideZeroBalanceZAddrs, setHideZeroBalanceZAddrs] = useState(true);
  
  // Use safe access to zAddressData with fallback to empty array
  const zAddressData = workbenchContext?.zAddressData || [];
  
  // Compute filtered and hidden Z-addresses
  const filteredZAddressData = React.useMemo(() => {
    if (!zAddressData) return [];
    if (hideZeroBalanceZAddrs) {
      return zAddressData.filter(zAddr => {
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
    return zAddressData;
  }, [zAddressData, hideZeroBalanceZAddrs, nodeStatus?.chainName]);
  
  // Handle fetching addresses
  const handleUpdateZAddresses = async () => {
    if (!workbenchContext?.fetchAndSetZAddressesWithBalances || !nodeStatus?.connected) return;
    
    setLoadingAddresses(true);
    try {
      await workbenchContext.fetchAndSetZAddressesWithBalances();
    } catch (error) {
      console.error("Failed to fetch Z-Addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Handle selection
  const handleZAddressSelect = (address) => {
    if (setSelectedZAddress) {
      setSelectedZAddress(address);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight:'bold' }}>
          Z
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUpdateZAddresses}
          disabled={loadingAddresses || !nodeStatus?.connected}
          startIcon={loadingAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto', ml: 1 }}
        >
          {!loadingAddresses && ""}
        </Button>
          {/* Hide/unhide slider and hidden count */}
          <Switch
            checked={hideZeroBalanceZAddrs}
            onChange={() => setHideZeroBalanceZAddrs(!hideZeroBalanceZAddrs)}
            size="small"
            sx={{mr: 0.5, ml: 1, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}
          />
          {hideZeroBalanceZAddrs && (
            <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center', mr: 1 }}>
              {zAddressData ? zAddressData.length - filteredZAddressData.length : 0}
            </Typography>
          )}
        </Box>
      </Box>
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {/* Loading state */}
        {nodeStatus?.connected && loadingAddresses && zAddressData.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {/* Empty state */}
        {!loadingAddresses && zAddressData.length === 0 && nodeStatus?.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            No Z found. Click Update.
          </Typography>
        )}
        
        {/* Not connected state */}
        {!nodeStatus?.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            Connect to daemon to see Z.
          </Typography>
        )}
        
        {/* Address list */}
        {filteredZAddressData.length > 0 && (
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {filteredZAddressData.map((zAddr) => {
              const isSelected = selectedZAddress === zAddr.address;
              return (
                <StyledListItemButton
                  key={zAddr.address}
                  selected={isSelected}
                  onClick={() => handleZAddressSelect(zAddr.address)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                      {zAddr.address ? `${zAddr.address.substring(0, 8)}...${zAddr.address.slice(-6)}` : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#aaa' }}>
                      Bal: {typeof zAddr.balance === 'number' ? zAddr.balance.toFixed(8) : '0.00000000'}
                    </Typography>
                      {zAddr.allBalances && Object.keys(zAddr.allBalances).filter(k => k !== (nodeStatus?.chainName || 'VRSCTEST')).some(k => zAddr.allBalances[k] > 0.000000009) && (
                        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#6c9eda', ml: 1, fontWeight: 'bold' }}>
                          $
                        </Typography>
                      )}
                    </Box>
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

export default SimpleZAddressList; 