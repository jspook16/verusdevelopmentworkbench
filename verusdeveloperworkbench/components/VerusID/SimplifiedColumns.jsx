import React from 'react';
import { Box, Grid } from '@mui/material';
import { MarketplaceIdentityProvider } from '../../contexts/MarketplaceIdentityContext';
import SimpleVerusIdList from './SimpleVerusIdList';
import SimpleRAddressList from './SimpleRAddressList';
import SimpleZAddressList from './SimpleZAddressList';
import SimpleVerusIdDetailsColumn from './SimpleVerusIdDetailsColumn';

/**
 * A simplified component for the VerusID Operations tab that uses basic Grid layout
 * instead of complex Split components to avoid rendering issues.
 */
const SimplifiedColumns = () => {
  return (
    <MarketplaceIdentityProvider>
      <Box sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* First column - Lists */}
          <Grid item xs={6} sx={{ height: '100%', borderRight: '1px solid #333' }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* VerusIDs section - 34% height */}
              <Box sx={{ height: '34%', overflow: 'auto', borderBottom: '1px solid #333' }}>
                <SimpleVerusIdList />
              </Box>
              
              {/* R-Addresses section - 33% height */}
              <Box sx={{ height: '33%', overflow: 'auto', borderBottom: '1px solid #333' }}>
                <SimpleRAddressList />
              </Box>
              
              {/* Z-Addresses section - 33% height */}
              <Box sx={{ height: '33%', overflow: 'auto' }}>
                <SimpleZAddressList />
              </Box>
            </Box>
          </Grid>
          
          {/* Second column - Details */}
          <Grid item xs={6} sx={{ height: '100%' }}>
            <SimpleVerusIdDetailsColumn />
          </Grid>
        </Grid>
      </Box>
    </MarketplaceIdentityProvider>
  );
};

export default SimplifiedColumns; 