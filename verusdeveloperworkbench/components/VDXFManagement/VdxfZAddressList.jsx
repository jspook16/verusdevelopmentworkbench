import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, CircularProgress, IconButton, Tooltip, Button, Switch } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  paddingTop: 2,
  paddingBottom: 2,
  paddingLeft: 4,
  paddingRight: 4,
  minHeight: '24px',
  borderRadius: '4px',
  marginBottom: 2,
  marginRight: 2,
  marginLeft: 2,
  '&.Mui-selected': {
    backgroundColor: 'rgba(144, 202, 249, 0.22)',
    '&:hover': {
      backgroundColor: 'rgba(144, 202, 249, 0.28)',
    },
  },
  borderBottom: '1px solid transparent',
}));

/**
 * VdxfZAddressList - Displays Z-addresses specific to the VDXF tab
 * Uses global Z-address data from WorkbenchDataContext
 */
const VdxfZAddressList = () => {
  const { sendCommand, nodeStatus } = useContext(NodeContext) || {};
  const identityContext = useContext(IdentityContext);
  
  // Important: Safely extract context values or provide defaults
  const workbenchContext = useContext(WorkbenchDataContext) || {};
  
  const { 
    hiddenZAddresses = {}, 
    toggleZAddressVisibility,
    zAddressData = [],
    fetchAndSetZAddressesWithBalances
  } = workbenchContext;

  const [loadingZAddresses, setLoadingZAddresses] = useState(false);
  const [hideZeroBalanceZAddrs, setHideZeroBalanceZAddrs] = useState(true);
  
  // Get the selected Z-address and selection function from the context
  const selectedZAddressForVDXF = identityContext?.selectedZAddressForVDXF;
  
  // Directly use setSelectedZAddressForVDXF if available, fallback to selectZAddressForVDXF
  const setSelectedZAddressForVDXF = identityContext?.setSelectedZAddressForVDXF;
  const selectZAddressForVDXF = identityContext?.selectZAddressForVDXF;
  
  // Debug log
  console.log('[VdxfZAddressList][Render] Selected Z-address:', selectedZAddressForVDXF);
  console.log('[VdxfZAddressList][Render] Have selectZAddressForVDXF?', !!selectZAddressForVDXF);
  console.log('[VdxfZAddressList][Render] Have setSelectedZAddressForVDXF?', !!setSelectedZAddressForVDXF);
  
  // Fetch Z-addresses from the global context if needed
  const handleUpdateZAddresses = async () => {
    if (!fetchAndSetZAddressesWithBalances) {
      console.error('[VdxfZAddressList] fetchAndSetZAddressesWithBalances function not available');
      return;
    }
    
    setLoadingZAddresses(true);
    try {
      await fetchAndSetZAddressesWithBalances();
    } catch (error) {
      console.error("[VdxfZAddressList] Error fetching Z-addresses:", error);
    } finally {
      setLoadingZAddresses(false);
    }
  };

  // Auto-load Z-addresses if we don't have any
  useEffect(() => {
    if (nodeStatus?.connected && (!zAddressData || zAddressData.length === 0) && !loadingZAddresses) {
      handleUpdateZAddresses();
    }
  }, [nodeStatus?.connected, zAddressData?.length, loadingZAddresses]);

  // FIXED: Create a safe Z-address selection handler
  const safelySelectZAddress = (zAddress) => {
    if (!zAddress) {
      console.error('[VdxfZAddressList] Attempted to select empty/null Z-address');
      return;
    }
    
    console.log('[VdxfZAddressList] Attempting to select Z-address:', zAddress);
    
    try {
      // Try direct setter first (newly added)
      if (identityContext && typeof identityContext.directSetSelectedZAddressForVDXF === 'function') {
        console.log('[VdxfZAddressList] Using direct setter function (new)');
        identityContext.directSetSelectedZAddressForVDXF(zAddress);
        return;
      }
      
      // First try using the setter directly if available
      if (typeof setSelectedZAddressForVDXF === 'function') {
        console.log('[VdxfZAddressList] Using direct setter function');
        setSelectedZAddressForVDXF(zAddress);
        return;
      }
      
      // Then try using the select function if available
      if (typeof selectZAddressForVDXF === 'function') {
        console.log('[VdxfZAddressList] Using select function');
        selectZAddressForVDXF(zAddress);
        return;
      }
      
      // Last resort - try to access the context's setter directly
      if (identityContext && typeof identityContext.setSelectedZAddressForVDXF === 'function') {
        console.log('[VdxfZAddressList] Using context setter directly');
        identityContext.setSelectedZAddressForVDXF(zAddress);
        return;
      }
      
      // If all else fails, do a direct state update if possible
      // This is a nuclear option as a last resort
      if (identityContext) {
        console.warn('[VdxfZAddressList] No valid function found, trying manual state update');
        try {
          // Hard-code the internal state variable name as a last resort
          // @ts-ignore - This is a hack but might work in emergencies
          identityContext._currentValue.selectedZAddressForVDXF = zAddress;
        } catch (e) {
          console.error('[VdxfZAddressList] Manual state update failed', e);
        }
      }
      
      // If all else fails
      console.error('[VdxfZAddressList] No valid function found to select Z-address:', zAddress);
    } catch (error) {
      console.error('[VdxfZAddressList] Error selecting Z-address:', error);
    }
  };

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(String(text));
  };

  const renderNameWithVisibility = (name, isHidden) => {
    if (name === undefined || name === null) return '';
    let text = String(name);
    if (typeof name === 'number') {
      text = name.toFixed(8);
    }
    return isHidden ? '*'.repeat(text.length > 0 ? text.length : 3) : text;
  };

  // Filter Z-addresses based on balance if needed
  const filteredZAddresses = hideZeroBalanceZAddrs && zAddressData
    ? zAddressData.filter(addr => {
        // Show addresses with positive balance
        const balance = typeof addr.balance === 'number' ? addr.balance : 0;
        return balance > 0.000000009;
      })
    : zAddressData || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Z
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUpdateZAddresses}
            disabled={loadingZAddresses || !nodeStatus?.connected}
            startIcon={loadingZAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto', mr: 1 }}
          >
            {!loadingZAddresses && ""}
          </Button>
          <Tooltip title={hideZeroBalanceZAddrs ? "Show All Z" : "Hide Zero-Balance Z"}>
            <Switch
              checked={hideZeroBalanceZAddrs}
              onChange={() => setHideZeroBalanceZAddrs(!hideZeroBalanceZAddrs)}
              size="small"
              sx={{ mr: 0.5, '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4caf50' } }}
            />
          </Tooltip>
          {hideZeroBalanceZAddrs && zAddressData && filteredZAddresses && (
            <Typography sx={{ fontSize: '0.75rem', color: '#aaa', minWidth: 24, textAlign: 'center' }}>
              {zAddressData.length - filteredZAddresses.length}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {loadingZAddresses && filteredZAddresses.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        {!loadingZAddresses && filteredZAddresses.length === 0 && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
            {hideZeroBalanceZAddrs && zAddressData && zAddressData.length > 0
              ? 'No Z with balances. Toggle filter.'
              : 'No Z found. Click Update.'}
          </Typography>
        )}
        {filteredZAddresses.length > 0 && (
          <List dense disablePadding sx={{ pt: 0.5 }}>
            {filteredZAddresses.map((zAddr) => {
              const isSelected = selectedZAddressForVDXF === zAddr.address;
              const isHidden = hiddenZAddresses?.[zAddr.address];
              
              return (
                <StyledListItemButton
                  key={zAddr.address}
                  selected={isSelected}
                  onClick={() => safelySelectZAddress(zAddr.address)}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Tooltip title={isHidden ? 'Show Z' : 'Hide Z'}>
                      <IconButton
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (typeof toggleZAddressVisibility === 'function') {
                            toggleZAddressVisibility(zAddr.address);
                          }
                        }}
                        sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}
                      >
                        {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 0.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                        {renderNameWithVisibility(zAddr.address, isHidden)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: -0.5 }}>
                        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369' }}>
                          Bal: {renderNameWithVisibility(zAddr.balance, isHidden)}
                        </Typography>
                        {zAddr.allBalances && Object.keys(zAddr.allBalances).filter(k => k !== (nodeStatus?.chainName || 'VRSCTEST')).some(k => zAddr.allBalances[k] > 0.000000009) && (
                          <Tooltip title="Has other currency balances">
                            <Typography component="span" sx={{ fontSize: '0.7rem', color: '#C9B369', ml: 1, fontWeight: 'bold' }}>
                              $
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title={`Copy Z: ${zAddr.address}`}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleCopy(zAddr.address); }}
                        sx={{ p: 0.25, flexShrink: 0, color: '#aaa', '&:hover': { color: '#90caf9' } }}
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

export default VdxfZAddressList; 