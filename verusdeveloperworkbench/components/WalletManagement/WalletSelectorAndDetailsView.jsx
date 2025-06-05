import React, { useState, useContext } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext'; // To save/load vertical split sizes

import WalletLeftmostSelectorColumn from './WalletLeftmostSelectorColumn'; // This will be refactored
import VerusIdListWM from './VerusIdListWM';
import RAddressListWM from './RAddressListWM';
import ZAddressListWM from './ZAddressListWM';

import VerusIdDetailsWM from './VerusIdDetailsWM';
import RAddressDetailsWM from './RAddressDetailsWM';
import ZAddressDetailsWM from './ZAddressDetailsWM';

const WalletSelectorAndDetailsView = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};

  // State for the vertical split (shared between selector and details columns)
  // These sizes are for the 3 vertical sections within each of the two main columns
  const initialVerticalSizes = columnSizes?.walletTabVerticalSplit || [34, 33, 33];
  const [verticalSizes, setVerticalSizes] = useState(initialVerticalSizes);

  const handleVerticalDragEnd = (newSizes) => {
    setVerticalSizes(newSizes);
    if (updateColumnSizes) {
      updateColumnSizes('walletTabVerticalSplit', newSizes); // Save to context
    }
  };

  return (
    <Split
      className="selector-details-columns" // Horizontal split for Selector | Details
      sizes={columnSizes?.walletTabSelectorDetailsSplit || [50, 50]} // Default 50/50 for these two main columns
      minSize={[200, 250]} // Min width for selector column and details column
      gutterSize={6}
      expandToMin={true}
      style={{ display: 'flex', height: '100%', width: '100%' }}
      onDragEnd={(newSizes) => {
        if (updateColumnSizes) {
          updateColumnSizes('walletTabSelectorDetailsSplit', newSizes);
        }
      }}
    >
      {/* Left Column: Selectors */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
        <Split 
          direction="vertical"
          sizes={verticalSizes} 
          minSize={[80, 80, 80]} 
          gutterSize={6}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          onDragEnd={handleVerticalDragEnd} // Use shared handler
        >
          <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}><VerusIdListWM /></Box>
          <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}><RAddressListWM /></Box>
          <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}><ZAddressListWM /></Box>
        </Split>
      </Box>

      {/* Right Column: Details */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
        <Split 
          direction="vertical"
          sizes={verticalSizes} 
          minSize={[80, 80, 80]} 
          gutterSize={6}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          onDragEnd={handleVerticalDragEnd} // Use shared handler
        >
          <Box sx={{ overflow: 'auto', height: '100%', p:0.5, background: '#232323' }}><VerusIdDetailsWM /></Box>
          <Box sx={{ overflow: 'auto', height: '100%', p:0.5, background: '#232323' }}><RAddressDetailsWM /></Box>
          <Box sx={{ overflow: 'auto', height: '100%', p:0.5, background: '#232323' }}><ZAddressDetailsWM /></Box>
        </Split>
      </Box>
    </Split>
  );
};

export default WalletSelectorAndDetailsView; 