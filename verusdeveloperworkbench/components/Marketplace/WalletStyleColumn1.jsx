import React, { useState, useContext } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import SectionHeader from './SectionHeader';
import VerusIdListMarketplace from './VerusIdListMarketplace';
import RAddressListMarketplace from './RAddressListMarketplace';
import ZAddressListMarketplace from './ZAddressListMarketplace';

const WalletStyleColumn1 = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  // Access MarketplaceIdentityContext to clarify this column only uses marketplace state
  const marketplaceContext = useContext(MarketplaceIdentityContext);

  // State for the vertical split
  const initialVerticalSizes = columnSizes?.marketplaceColumn1VerticalSplit || [34, 33, 33];
  const [verticalSizes, setVerticalSizes] = useState(initialVerticalSizes);

  const handleVerticalDragEnd = (newSizes) => {
    setVerticalSizes(newSizes);
    if (updateColumnSizes) {
      updateColumnSizes('marketplaceColumn1VerticalSplit', newSizes);
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
        <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
          <VerusIdListMarketplace />
        </Box>
        <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
          <RAddressListMarketplace />
        </Box>
        <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
          <ZAddressListMarketplace />
        </Box>
      </Split>
    </Box>
  );
};

export default WalletStyleColumn1; 