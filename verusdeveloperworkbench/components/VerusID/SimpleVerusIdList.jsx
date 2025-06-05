import React, { useContext, useState, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, Button, Switch } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
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
 * A simplified version of VerusIdListMarketplace that avoids problematic function calls
 */
const SimpleVerusIdList = () => {
  const { nodeStatus } = useContext(NodeContext) || {};
  const idContext = useContext(IdentityContext) || {};
  const { selectedVerusId, setSelectedVerusId } = useContext(MarketplaceIdentityContext) || {};
  
  const [loadingIdentities, setLoadingIdentities] = useState(false);
  const [hideZeroBalance, setHideZeroBalance] = useState(true);
  
  // Use safe access to identities with fallback to empty array
  const identities = idContext?.identities || [];
  
  // Filtered VerusIDs
  const filteredIdentities = useMemo(() => {
    if (!identities) return [];
    if (hideZeroBalance) {
      return identities.filter(id => {
        const nativeBalance = typeof id.transparentbalance === 'number' ? id.transparentbalance : 0;
        let hasPositiveNativeBalance = nativeBalance > 0.000000009;
        let hasPositiveOtherBalance = false;
        if (id.allBalances && typeof id.allBalances === 'object') {
          for (const currencyKey in id.allBalances) {
            if (currencyKey !== (nodeStatus?.chainName || 'VRSCTEST') && typeof id.allBalances[currencyKey] === 'number' && id.allBalances[currencyKey] > 0.000000009) {
              hasPositiveOtherBalance = true;
              break;
            }
          }
        }
        return hasPositiveNativeBalance || hasPositiveOtherBalance;
      });
    }
    return identities;
  }, [identities, hideZeroBalance, nodeStatus?.chainName]);
  
  // Handle fetching identities
  const handleUpdateVerusIDs = async () => {
    if (!idContext?.fetchIdentities || !nodeStatus?.connected) return;
    
    setLoadingIdentities(true);
    try {
      await idContext.fetchIdentities();
    } catch (error) {
      console.error("Failed to fetch identities:", error);
    } finally {
      setLoadingIdentities(false);
    }
  };

  // Handle selection
  const handleVerusIdSelect = (idName) => {
    if (setSelectedVerusId) {
      setSelectedVerusId(idName);
    }
  };

  // Compute the display name for an identity
  const getDisplayName = (identity) => {
    if (!identity) return '';
    return identity.name || identity.identity || '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight:'bold' }}>
          VerusIDs
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUpdateVerusIDs}
          disabled={loadingIdentities || !nodeStatus?.connected}
          startIcon={loadingIdentities ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto' }}
        >
          {!loadingIdentities && ""}
        </Button>
          <Switch
            checked={hideZeroBalance}
            onChange={() => setHideZeroBalance(!hideZeroBalance)}
            size="small"
            sx={{mr: 0.5, ml: 1, '& .MuiSwitch-switchBase.Mui-checked': {color: '#4caf50'}, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#4caf50'}}}
          />
          {hideZeroBalance && (
            <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center', mr: 1 }}>
              {identities ? identities.length - filteredIdentities.length : 0}
            </Typography>
          )}
        </Box>
      </Box>
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {/* Loading state */}
        {nodeStatus?.connected && loadingIdentities && identities.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {/* Empty state */}
        {!loadingIdentities && identities.length === 0 && nodeStatus?.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            No VerusIDs found. Click Update.
          </Typography>
        )}
        
        {/* Not connected state */}
        {!nodeStatus?.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            Connect to daemon to see VerusIDs.
          </Typography>
        )}
        
        {/* VerusID list */}
        {filteredIdentities.length > 0 && (
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {filteredIdentities.map((id) => {
              const displayName = getDisplayName(id);
              const isSelected = selectedVerusId === displayName;
              
              return (
                <StyledListItemButton
                  key={id.identity || displayName}
                  selected={isSelected}
                  onClick={() => handleVerusIdSelect(displayName)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                      {displayName}
                    </Typography>
                    {id.transparentbalance && (
                      <Typography sx={{ fontSize: '0.7rem', color: '#aaa' }}>
                        Bal: {typeof id.transparentbalance === 'number' ? id.transparentbalance.toFixed(8) : '0.00000000'}
                      </Typography>
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

export default SimpleVerusIdList; 