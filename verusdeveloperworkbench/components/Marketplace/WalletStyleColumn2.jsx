import React, { useState, useContext } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import SectionHeader from './SectionHeader';
import VerusIdDetailsMarketplace from './VerusIdDetailsMarketplace';
import RAddressDetailsMarketplace from './RAddressDetailsMarketplace';
import ZAddressDetailsMarketplace from './ZAddressDetailsMarketplace';

const WalletStyleColumn2 = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  // Access MarketplaceIdentityContext to clarify this column only uses marketplace state
  const marketplaceContext = useContext(MarketplaceIdentityContext);

  // State for the vertical split
  const initialVerticalSizes = columnSizes?.marketplaceColumn2VerticalSplit || [34, 33, 33];
  const [verticalSizes, setVerticalSizes] = useState(initialVerticalSizes);

  const handleVerticalDragEnd = (newSizes) => {
    setVerticalSizes(newSizes);
    if (updateColumnSizes) {
      updateColumnSizes('marketplaceColumn2VerticalSplit', newSizes);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      <Split 
        direction="vertical"
        sizes={verticalSizes} 
        minSize={[80, 80, 80]} 
        gutterSize={6}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        onDragEnd={handleVerticalDragEnd}
      >
        <Box sx={{ p: 0.5, background: '#232323' }}>
          <SectionHeader>VerusID Details</SectionHeader>
          <VerusIdDetailsMarketplace />
        </Box>
        <Box sx={{ p: 0.5, background: '#232323' }}>
          <SectionHeader>R-Address Details</SectionHeader>
          <RAddressDetailsMarketplace />
        </Box>
        <Box sx={{ p: 0.5, background: '#232323' }}>
          <SectionHeader>Z-Address Details</SectionHeader>
          <ZAddressDetailsMarketplace />
        </Box>
      </Split>
    </Box>
  );
};

export default WalletStyleColumn2; 