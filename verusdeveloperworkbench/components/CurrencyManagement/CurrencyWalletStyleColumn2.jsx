import React, { useContext, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Split from 'react-split';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import VerusIdDetailsMarketplace from '../Marketplace/VerusIdDetailsMarketplace';
import RAddressDetailsMarketplace from '../Marketplace/RAddressDetailsMarketplace';
import ZAddressDetailsMarketplace from '../Marketplace/ZAddressDetailsMarketplace';

/**
 * CurrencyWalletStyleColumn2 - Displays details for the selected VerusID, R-Address, and Z-Address
 * in a 3-pane vertical split for the Currency Management tab.
 */
const CurrencyWalletStyleColumn2 = () => {
  const {
    selectedIdentityForCurrencyWS,
    selectedRAddressForCurrencyWS,
    selectedZAddressForCurrencyWS,
    currencyWSIdentityDetails,
    fetchIdentityDetailsForCurrencyWS
  } = useContext(IdentityContext);

  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};

  // Use existing split sizes from context or define new ones for Currency details column
  const initialVerticalSizes = columnSizes?.currencyDetailsColumnVerticalSplit || [34, 33, 33];

  const handleVerticalDragEnd = (newSizes) => {
    if (updateColumnSizes) {
      updateColumnSizes('currencyDetailsColumnVerticalSplit', newSizes);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      <Split 
        direction="vertical"
        sizes={initialVerticalSizes} 
        minSize={[80, 80, 80]} 
        gutterSize={6}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        onDragEnd={handleVerticalDragEnd}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#1e1e1e', p: 0.5 }}>
            <Typography variant="h6" sx={{ 
              color: '#fff', 
              fontSize: '0.9rem', 
              fontWeight: 'bold',
              borderBottom: '1px solid #444',
              p: 0.5
            }}>
              VerusID Details
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <VerusIdDetailsMarketplace
              contextType="currency"
            />
          </Box>
        </Box>
        
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#1e1e1e', p: 0.5 }}>
            <Typography variant="h6" sx={{ 
              color: '#fff', 
              fontSize: '0.9rem', 
              fontWeight: 'bold',
              borderBottom: '1px solid #444',
              p: 0.5
            }}>
              R-Address Details
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <RAddressDetailsMarketplace
              contextType="currency"
            />
          </Box>
        </Box>
        
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#1e1e1e', p: 0.5 }}>
            <Typography variant="h6" sx={{ 
              color: '#fff', 
              fontSize: '0.9rem', 
              fontWeight: 'bold',
              borderBottom: '1px solid #444',
              p: 0.5
            }}>
              Z-Address Details
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <ZAddressDetailsMarketplace
              contextType="currency"
            />
          </Box>
        </Box>
      </Split>
    </Box>
  );
};

export default CurrencyWalletStyleColumn2; 