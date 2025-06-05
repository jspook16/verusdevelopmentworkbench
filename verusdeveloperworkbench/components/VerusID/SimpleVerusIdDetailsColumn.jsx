import React, { useContext } from 'react';
import { Box, Typography, Paper, CircularProgress, Divider } from '@mui/material';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

/**
 * A simplified details column that displays basic information about selected entities
 * Avoids the problematic renderRAddresses function
 */
const SimpleVerusIdDetailsColumn = () => {
  const marketplaceContext = useContext(MarketplaceIdentityContext) || {};
  const idContext = useContext(IdentityContext) || {};
  const workbenchContext = useContext(WorkbenchDataContext) || {};
  
  const { selectedVerusId, selectedRAddress, selectedZAddress } = marketplaceContext;
  
  // Get identity details
  const selectedIdentityDetails = idContext?.identities?.find(id => 
    id.name === selectedVerusId || id.identity === selectedVerusId
  );
  
  // Get R-Address details
  const selectedRAddressDetails = workbenchContext?.rAddressData?.find(addr => 
    addr.address === selectedRAddress
  );
  
  // Get Z-Address details
  const selectedZAddressDetails = workbenchContext?.zAddressData?.find(addr => 
    addr.address === selectedZAddress
  );

  const renderVerusIdDetails = () => {
    if (!selectedVerusId) {
      return <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>Select a VerusID to view details</Typography>;
    }
    
    if (!selectedIdentityDetails) {
      return <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>Loading details...</Typography>;
    }
    
    return (
      <Box sx={{ p: 1 }}>
        <Typography sx={{ color: '#90caf9', fontWeight: 'bold', fontSize: '0.85rem', mb: 1 }}>
          {selectedIdentityDetails.name || selectedVerusId}
        </Typography>
        
        {selectedIdentityDetails.identity && (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Identity:</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {selectedIdentityDetails.identity}
            </Typography>
          </Box>
        )}
        
        {selectedIdentityDetails.parent && (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Parent:</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {selectedIdentityDetails.parent}
            </Typography>
          </Box>
        )}
        
        {selectedIdentityDetails.transparentbalance && (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Balance:</Typography>
            <Typography sx={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {selectedIdentityDetails.transparentbalance}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  const renderRAddressDetails = () => {
    if (!selectedRAddress) {
      return <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>Select an R-Address to view details</Typography>;
    }
    
    if (!selectedRAddressDetails) {
      return <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>Loading details...</Typography>;
    }
    
    return (
      <Box sx={{ p: 1 }}>
        <Typography sx={{ color: '#90caf9', fontWeight: 'bold', fontSize: '0.85rem', mb: 1 }}>
          R-Address Details
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Address:</Typography>
          <Typography sx={{ color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
            {selectedRAddressDetails.address}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Balance:</Typography>
          <Typography sx={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {selectedRAddressDetails.nativeBalance?.toFixed(8) || '0.00000000'}
          </Typography>
        </Box>
        
        {selectedRAddressDetails.allBalances && Object.keys(selectedRAddressDetails.allBalances).length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold', mb: 0.5 }}>Other Balances:</Typography>
            {Object.entries(selectedRAddressDetails.allBalances || {})
              .filter(([currency, amount]) => amount > 0)
              .map(([currency, amount]) => (
                <Box key={currency} sx={{ display: 'flex', mb: 0.25 }}>
                  <Typography sx={{ color: '#aaa', fontSize: '0.75rem', width: 80, flexShrink: 0 }}>
                    {currency}:
                  </Typography>
                  <Typography sx={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {typeof amount === 'number' ? amount.toFixed(8) : amount}
                  </Typography>
                </Box>
              ))
            }
          </Box>
        )}
      </Box>
    );
  };
  
  const renderZAddressDetails = () => {
    if (!selectedZAddress) {
      return <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>Select a Z-Address to view details</Typography>;
    }
    
    if (!selectedZAddressDetails) {
      return <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>Loading details...</Typography>;
    }
    
    return (
      <Box sx={{ p: 1 }}>
        <Typography sx={{ color: '#90caf9', fontWeight: 'bold', fontSize: '0.85rem', mb: 1 }}>
          Z-Address Details
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Address:</Typography>
          <Typography sx={{ color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
            {selectedZAddressDetails.address}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>Balance:</Typography>
          <Typography sx={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {selectedZAddressDetails.balance?.toFixed(8) || '0.00000000'}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, backgroundColor: '#191919', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Details
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#232323', p: 0 }}>
        <Box sx={{ p: 1 }}>
          <Paper sx={{ p: 1, background: '#2d2d2d' }}>
            {selectedVerusId ? renderVerusIdDetails() : 
             selectedRAddress ? renderRAddressDetails() : 
             selectedZAddress ? renderZAddressDetails() :
             <Typography sx={{ p: 1, color: '#888', fontSize: '0.75rem' }}>
               Select a VerusID, R-Address, or Z-Address to view details
             </Typography>
            }
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SimpleVerusIdDetailsColumn; 