import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Split from 'react-split';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext'; // For split sizes
import VerusIdDetailsMarketplace from '../Marketplace/VerusIdDetailsMarketplace';
import RAddressDetailsMarketplace from '../Marketplace/RAddressDetailsMarketplace';
import ZAddressDetailsMarketplace from '../Marketplace/ZAddressDetailsMarketplace';
import SectionHeader from '../Marketplace/SectionHeader';

/**
 * VdxfWalletStyleColumn2 - Displays details for the selected VerusID, R-Address, and Z-Address
 * in a 3-pane vertical split for the VDXF Management tab.
 */
const VdxfWalletStyleColumn2 = () => {
  // Safely get context with fallbacks
  const idContext = useContext(IdentityContext) || {};
  
  const {
    selectedIdentityForVDXF,
    selectedRAddressForVDXF,
    selectedZAddressForVDXF,
    vdxfIdentityDetails,
    fetchIdentityDetailsForVDXF,
    loadingVdxfDetails,
    errorVdxfDetails
  } = idContext;

  // Log the selected Z-address for debugging
  console.log('[VdxfWalletStyleColumn2][Render] Selected Z-Address for VDXF:', selectedZAddressForVDXF);

  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};

  // Use existing split sizes from context or define new ones for VDXF details column
  const initialVerticalSizes = columnSizes?.vdxfDetailsColumnVerticalSplit || [34, 33, 33];

  const handleVerticalDragEnd = (newSizes) => {
    if (updateColumnSizes) {
      updateColumnSizes('vdxfDetailsColumnVerticalSplit', newSizes);
    }
  };

  // Effect to log when Z-address selection changes
  useEffect(() => {
    console.log('[VdxfWalletStyleColumn2][Effect] Z-Address selection changed to:', selectedZAddressForVDXF);
  }, [selectedZAddressForVDXF]);

  // Render customized details components that use the VDXF-specific selection state
  const renderVerusIdDetails = () => (
    <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
      <Box sx={{ p: 0.5, background: '#232323' }}>
        <SectionHeader>VerusID Details</SectionHeader>
        {selectedIdentityForVDXF ? (
          <VerusIdDetailsMarketplace contextType="vdxf" />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>No VerusID selected for VDXF.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderRAddressDetails = () => (
    <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
      <Box sx={{ p: 0.5, background: '#232323' }}>
        <SectionHeader>R-Address Details</SectionHeader>
        {selectedRAddressForVDXF ? (
          <RAddressDetailsMarketplace contextType="vdxf" />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>No R-Address selected for VDXF.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderZAddressDetails = () => {
    // Log before rendering Z-address details component
    console.log('[VdxfWalletStyleColumn2] Rendering Z-Address Details with selectedZAddressForVDXF:', selectedZAddressForVDXF);
    
    return (
      <Box sx={{ overflow: 'auto', height: '100%', background: '#1e1e1e'}}>
        <Box sx={{ p: 0.5, background: '#232323' }}>
          <SectionHeader>Z-Address Details</SectionHeader>
          {selectedZAddressForVDXF ? (
            // Pass both contextType and zAddressToDisplay to ensure it works
            <ZAddressDetailsMarketplace 
              contextType="vdxf" 
              zAddressToDisplay={selectedZAddressForVDXF} 
            />
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>No Z-Address selected for VDXF.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
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
        {renderVerusIdDetails()}
        {renderRAddressDetails()}
        {renderZAddressDetails()}
      </Split>
    </Box>
  );
};

export default VdxfWalletStyleColumn2; 