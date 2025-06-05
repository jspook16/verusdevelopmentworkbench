import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, CircularProgress, IconButton, Tooltip, Button } from '@mui/material';
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

const ZAddressListWM = () => {
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { nodeStatus, sendCommand } = useContext(NodeContext);

  const [zAddressesWithBalances, setZAddressesWithBalances] = useState([]); // Store { address, balance }
  const [loadingZAddresses, setLoadingZAddresses] = useState(false);
  const [errorZAddresses, setErrorZAddresses] = useState(null);

  if (!idContext || !workbenchContext || !nodeStatus) {
    return <Typography sx={{p:1, fontSize: '0.8rem', color: '#888'}}>Loading context...</Typography>;
  }

  const {
    selectedZAddressWM, setSelectedZAddressWM_independent,
  } = idContext;

  const {
    hiddenZAddresses, toggleZAddressVisibility,
    getCopyString,
  } = workbenchContext;

  const fetchZAddressesWithBalances = async () => {
    if (!nodeStatus.connected || typeof sendCommand !== 'function') {
      setZAddressesWithBalances([]);
      setErrorZAddresses('Node not connected.');
      return;
    }
    setLoadingZAddresses(true);
    setErrorZAddresses(null);
    try {
      const addresses = await sendCommand('z_listaddresses', [true]); // includeWatchOnly = true
      if (Array.isArray(addresses)) {
        if (addresses.length === 0) {
          setErrorZAddresses('No Z-Addresses found in wallet.');
          setZAddressesWithBalances([]);
        } else {
          const addressesWithBalances = await Promise.all(
            addresses.map(async (addr) => {
              try {
                const receivedTxs = await sendCommand('z_listreceivedbyaddress', [addr, 0]); // minconf = 0
                let balance = 0;
                if (Array.isArray(receivedTxs)) {
                  balance = receivedTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
                }
                return { address: addr, balance: balance };
              } catch (balanceError) {
                console.error(`Error fetching balance for Z-Address ${addr}:`, balanceError);
                return { address: addr, balance: 'Error' }; // Or some other error indicator
              }
            })
          );
          setZAddressesWithBalances(addressesWithBalances);
        }
      } else if (addresses && addresses.error) {
        console.error('Error fetching Z-Addresses list:', addresses.error);
        setErrorZAddresses(addresses.error.message || 'Failed to fetch Z-Addresses list.');
        setZAddressesWithBalances([]);
      } else {
        setErrorZAddresses('Unexpected result when fetching Z-Addresses list.');
        setZAddressesWithBalances([]);
      }
    } catch (err) {
      console.error('Exception fetching Z-Addresses and balances:', err);
      setErrorZAddresses(err.message || 'An error occurred.');
      setZAddressesWithBalances([]);
    } finally {
      setLoadingZAddresses(false);
    }
  };

  const handleZAddressSelect = (zAddress) => {
    if (setSelectedZAddressWM_independent) setSelectedZAddressWM_independent(zAddress);
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
          Z-Addresses
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={fetchZAddressesWithBalances} // Updated handler
          disabled={loadingZAddresses || !nodeStatus.connected}
          startIcon={loadingZAddresses ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto' }}
        >
           {!loadingZAddresses && "Update"}
        </Button>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, bgcolor: '#232323' }}>
        {nodeStatus.connected && loadingZAddresses && (!zAddressesWithBalances || zAddressesWithBalances.length === 0) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingZAddresses && errorZAddresses && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#ff6b6b' }}>{errorZAddresses}</Typography>
        )}
        {!loadingZAddresses && !errorZAddresses && (!zAddressesWithBalances || zAddressesWithBalances.length === 0) && nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>No Z-Addresses found. Click Update.</Typography>
        )}
        {!nodeStatus.connected && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see Z-Addresses.</Typography>
        )}
        {zAddressesWithBalances && zAddressesWithBalances.length > 0 && (
          <List dense disablePadding sx={{pt: 0.5}}>
            {zAddressesWithBalances.map((zAddrData) => {
              const isSelected = selectedZAddressWM === zAddrData.address;
              const isHidden = hiddenZAddresses && hiddenZAddresses[zAddrData.address];
              return (
                <StyledListItemButton
                  key={zAddrData.address}
                  selected={isSelected}
                  onClick={() => handleZAddressSelect(zAddrData.address)}
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Tooltip title={isHidden ? "Show Z-Address" : "Hide Z-Address"}>
                      <IconButton 
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (toggleZAddressVisibility) toggleZAddressVisibility(zAddrData.address);
                        }}
                        sx={{ p:0.25, mr: 0.5, flexShrink: 0 }}
                      >
                        {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 0.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#90caf9' : '#ccc', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                        {renderNameWithVisibility(zAddrData.address, isHidden)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#aaa'}}>
                        Balance: {renderNameWithVisibility(zAddrData.balance, isHidden)}
                      </Typography>
                    </Box>
                    <Tooltip title={`Copy Z-Address: ${zAddrData.address}`}>
                      <IconButton 
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleCopy(zAddrData.address);}}
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

export default ZAddressListWM; 