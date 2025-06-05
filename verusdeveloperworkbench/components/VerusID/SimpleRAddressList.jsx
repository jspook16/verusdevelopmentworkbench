import React, { useContext, useState, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, Button, Switch } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { IdentityContext } from '../../contexts/IdentityContext';

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
 * A simplified version of RAddressListMarketplace that avoids problematic function calls
 */
const SimpleRAddressList = () => {
  const { nodeStatus } = useContext(NodeContext) || {};
  const workbenchContext = useContext(WorkbenchDataContext) || {};
  const marketplaceContext = useContext(MarketplaceIdentityContext) || {};
  const idContext = useContext(IdentityContext) || {};
  const { selectedRAddress, setSelectedRAddress } = marketplaceContext;
  const identities = idContext?.identities || [];
  
  const [isFetching, setIsFetching] = useState(false);
  const [hideZeroBalance, setHideZeroBalance] = useState(true);
  
  // Use safe access to rAddressData with fallback to empty array
  const rAddressData = workbenchContext?.rAddressData || [];
  
  // Enhanced filter logic for R-addresses
  const filteredAddresses = useMemo(() => {
    if (!rAddressData || !Array.isArray(rAddressData)) return [];
    if (hideZeroBalance) {
      try {
        return rAddressData.filter(rAddr => {
          const nativeBalance = typeof rAddr.nativeBalance === 'number' ? rAddr.nativeBalance : 0;
          let hasPositiveNativeBalance = nativeBalance > 0.000000009;
          let hasPositiveOtherBalance = false;
          if (rAddr.allBalances && typeof rAddr.allBalances === 'object') {
            for (const currencyKey in rAddr.allBalances) {
              if (currencyKey !== (nodeStatus?.chainName || 'VRSCTEST') && typeof rAddr.allBalances[currencyKey] === 'number' && rAddr.allBalances[currencyKey] > 0.000000009) {
                hasPositiveOtherBalance = true;
                break;
              }
            }
          }
          // Check if this R-address is primary for any VerusID
          let isPrimaryForID = identities && identities.some(id => id.primaryaddresses && id.primaryaddresses.includes(rAddr.address));
          return hasPositiveNativeBalance || hasPositiveOtherBalance || isPrimaryForID;
        });
      } catch (err) {
        console.error('Error filtering addresses:', err);
        return rAddressData;
      }
    }
    return rAddressData;
  }, [rAddressData, hideZeroBalance, nodeStatus?.chainName, identities]);

  const handleUpdateRAddresses = async () => {
    if (!workbenchContext?.fetchAndSetRAddressesWithUtxos || !nodeStatus?.connected) return;
    
    setIsFetching(true);
    try {
      await workbenchContext.fetchAndSetRAddressesWithUtxos();
    } catch (error) {
      console.error("Failed to fetch R-Addresses:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRAddressSelect = (address) => {
    if (setSelectedRAddress) {
      setSelectedRAddress(address);
    }
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
          disabled={isFetching || !nodeStatus?.connected}
          startIcon={isFetching ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto' }}
        >
          {!isFetching && ""}
        </Button>
          <Switch
            checked={hideZeroBalance}
            onChange={() => setHideZeroBalance(!hideZeroBalance)}
            size="small"
            sx={{mr: 0.5, ml: 1, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}
          />
          {hideZeroBalance && (
            <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center', mr: 1 }}>
              {rAddressData ? rAddressData.length - filteredAddresses.length : 0}
            </Typography>
          )}
        </Box>
      </Box>
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {/* Loading state */}
        {nodeStatus?.connected && isFetching && filteredAddresses.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {/* Empty state */}
        {!isFetching && filteredAddresses.length === 0 && nodeStatus?.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            No R found. Click Update.
          </Typography>
        )}
        
        {/* Not connected state */}
        {!nodeStatus?.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            Connect to daemon to see R.
          </Typography>
        )}
        
        {/* Address list */}
        {filteredAddresses.length > 0 && (
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {filteredAddresses.map((rAddr) => {
              const isSelected = selectedRAddress === rAddr.address;
              return (
                <StyledListItemButton
                  key={rAddr.address}
                  selected={isSelected}
                  onClick={() => handleRAddressSelect(rAddr.address)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                      {rAddr.address || ''}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#aaa' }}>
                      Bal: {typeof rAddr.nativeBalance === 'number' ? rAddr.nativeBalance.toFixed(8) : '0.00000000'}
                    </Typography>
                      {rAddr.allBalances && Object.keys(rAddr.allBalances).filter(k => k !== (nodeStatus?.chainName || 'VRSCTEST')).some(k => rAddr.allBalances[k] > 0.000000009) && (
                        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#6c9eda', ml: 1, fontWeight: 'bold' }}>
                          $
                          {identities && identities.some(id => id.primaryaddresses && id.primaryaddresses.includes(rAddr.address)) && (
                            <span style={{ color: '#fbc02d', marginLeft: 4 }}>IDs</span>
                          )}
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

export default SimpleRAddressList; 