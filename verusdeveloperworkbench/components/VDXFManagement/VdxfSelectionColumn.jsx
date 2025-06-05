import React, { useState, useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import VdxfVerusIdList from './VdxfVerusIdList';
import VdxfRAddressList from './VdxfRAddressList';
import VdxfZAddressList from './VdxfZAddressList';

// Temporary placeholders are no longer needed
// const VdxfRAddressListPlaceholder = () => <Box p={1}><Typography sx={{color:'#888'}}>R-Addresses (VDXF)</Typography></Box>;
// const VdxfZAddressListPlaceholder = () => <Box p={1}><Typography sx={{color:'#888'}}>Z-Addresses (VDXF)</Typography></Box>;

const VdxfSelectionColumn = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  const { selectedZAddressForVDXF } = useContext(IdentityContext) || {};

  // Log the selected Z-address to help with debugging
  useEffect(() => {
    console.log('[VdxfSelectionColumn] Selected Z-Address for VDXF changed:', selectedZAddressForVDXF);
  }, [selectedZAddressForVDXF]);

  const initialVerticalSizes = columnSizes?.vdxfSelectionColumnVerticalSplit || [34, 33, 33];
  // No need to manage verticalSizes with local state if we're reading from context and it's updated via onDragEnd
  // const [verticalSizes, setVerticalSizes] = useState(initialVerticalSizes);

  const handleVerticalDragEnd = (newSizes) => {
    // setVerticalSizes(newSizes); // Not needed if directly updating context
    if (updateColumnSizes) {
      updateColumnSizes('vdxfSelectionColumnVerticalSplit', newSizes);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      <Split 
        direction="vertical"
        sizes={initialVerticalSizes} // Use initialVerticalSizes directly from context or default
        minSize={[60, 60, 60]} 
        gutterSize={6}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        onDragEnd={handleVerticalDragEnd}
      >
        <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
          <VdxfVerusIdList />
        </Box>
        <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
          <VdxfRAddressList /> 
        </Box>
        <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
          <VdxfZAddressList />
        </Box>
      </Split>
    </Box>
  );
};

export default VdxfSelectionColumn; 