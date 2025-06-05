import React from 'react';
import { Box, Divider } from '@mui/material';
import Split from 'react-split';
import VerusIdListWM from './VerusIdListWM';
import RAddressListWM from './RAddressListWM';
import ZAddressListWM from './ZAddressListWM';

const WalletLeftmostSelectorColumn = () => {
  // TODO: Add context for selected items in this column later

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      <Split 
        direction="vertical"
        sizes={[34, 33, 33]} // Equal split for the three sections
        minSize={[100, 100, 100]} // Min height for each section
        gutterSize={6}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <VerusIdListWM />
        </Box>
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <RAddressListWM />
        </Box>
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <ZAddressListWM />
        </Box>
      </Split>
    </Box>
  );
};

export default WalletLeftmostSelectorColumn; 