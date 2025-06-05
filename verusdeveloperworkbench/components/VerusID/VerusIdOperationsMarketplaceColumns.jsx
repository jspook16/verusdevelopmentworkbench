import React, { useState, useContext } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { MarketplaceIdentityProvider } from '../../contexts/MarketplaceIdentityContext';
import WalletStyleColumn1 from '../Marketplace/WalletStyleColumn1';
import WalletStyleColumn2 from '../Marketplace/WalletStyleColumn2';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

/**
 * A specialized component that renders the marketplace-style columns (WalletStyleColumn1 and WalletStyleColumn2)
 * in a horizontal Split layout just for the VerusID Operations tab.
 * 
 * This component wraps both columns in a shared MarketplaceIdentityProvider so they
 * can communicate and share state between themselves.
 * 
 * NOTE: Context synchronization with the parent IdentityContext has been removed
 * to eliminate errors. The columns operate independently from the operation components.
 */
const VerusIdOperationsMarketplaceColumns = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  const initialSizes = columnSizes?.verusIdMarkeplaceColumns || [50, 50];

  const handleSplitDragEnd = (newSizes) => {
    if (updateColumnSizes) {
      updateColumnSizes('verusIdMarkeplaceColumns', newSizes);
    }
  };

  return (
    <MarketplaceIdentityProvider>
      <Split
        direction="horizontal"
        sizes={initialSizes}
        minSize={[200, 200]}
        gutterSize={6}
        style={{ display: 'flex', height: '100%', width: '100%' }}
        onDragEnd={handleSplitDragEnd}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'auto' }}>
          <WalletStyleColumn1 />
        </Box>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'auto' }}>
          <WalletStyleColumn2 />
        </Box>
      </Split>
    </MarketplaceIdentityProvider>
  );
};

export default VerusIdOperationsMarketplaceColumns; 