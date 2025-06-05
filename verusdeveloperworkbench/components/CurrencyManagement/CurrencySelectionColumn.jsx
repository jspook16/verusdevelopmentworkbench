import React, { useState, useContext, useEffect } from 'react';
import { Box, Button, CircularProgress, Tooltip, IconButton, Switch, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import SectionHeader from '../Marketplace/SectionHeader';
import VerusIdListMarketplace from '../Marketplace/VerusIdListMarketplace';
import RAddressListMarketplace from '../Marketplace/RAddressListMarketplace';
import ZAddressListMarketplace from '../Marketplace/ZAddressListMarketplace';

/**
 * SectionWrapper - A wrapper component that adds proper styling, header and update controls
 */
const SectionWrapper = ({ title, children, updateFn, loading, disabled }) => (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0 }}>
      <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={updateFn}
        disabled={loading || disabled}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
        sx={{ fontSize: '0.7rem', py: 0.25, px: 0.75, minWidth: 'auto' }}
      >
        {!loading && "Update"}
      </Button>
    </Box>
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </Box>
  </Box>
);

/**
 * CurrencySelectionColumn - Displays VerusIDs, R-Addresses, and Z-Addresses in a 3-pane vertical split
 * for the Currency Management tab. Uses context from IdentityContext with Currency-specific state.
 */
const CurrencySelectionColumn = () => {
  const { columnSizes, updateColumnSizes, fetchAndSetZAddressesWithBalances } = useContext(WorkbenchDataContext) || {};
  const { nodeStatus } = useContext(NodeContext) || {};
  const {
    selectedIdentityForCurrencyWS,
    selectedRAddressForCurrencyWS,
    selectedZAddressForCurrencyWS,
    fetchIdentities
  } = useContext(IdentityContext);

  // State for the vertical split
  const initialVerticalSizes = columnSizes?.currencyColumn1VerticalSplit || [34, 33, 33];
  const [verticalSizes, setVerticalSizes] = useState(initialVerticalSizes);

  const handleVerticalDragEnd = (newSizes) => {
    setVerticalSizes(newSizes);
    if (updateColumnSizes) {
      updateColumnSizes('currencyColumn1VerticalSplit', newSizes);
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
        <Box sx={{ height: '100%', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
          <VerusIdListMarketplace 
            contextType="currency"
          />
        </Box>
        
        <Box sx={{ height: '100%', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
          <RAddressListMarketplace 
            contextType="currency"
          />
        </Box>
        
        <Box sx={{ height: '100%', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
          <ZAddressListMarketplace 
            contextType="currency"
            fetchZAddressesWithBalances={fetchAndSetZAddressesWithBalances}
          />
        </Box>
      </Split>
    </Box>
  );
};

export default CurrencySelectionColumn; 