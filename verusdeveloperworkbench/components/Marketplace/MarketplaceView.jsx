import React, { useContext } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import RpcTerminal from '../Terminal/RpcTerminal';
import WalletStyleColumn1 from './WalletStyleColumn1';
import WalletStyleColumn2 from './WalletStyleColumn2';
import SectionHeader from './SectionHeader';
import { MarketplaceIdentityProvider } from '../../contexts/MarketplaceIdentityContext';
import MakeOfferPanel from './MakeOfferPanel';
import ListOpenOffersPanel from './ListOpenOffersPanel';
import GetOffersPanel from './GetOffersPanel';
import MyTradesPanel from './MyTradesPanel';

// Placeholder components - we'll create these next
const GetOffersSection = () => (
  <Box>
    <SectionHeader>Get Offers</SectionHeader>
    <Box sx={{ p: 1, color: '#fff' }}>Get Offers Content</Box>
  </Box>
);
const MyTradesSection = () => (
  <Box>
    <SectionHeader>My Trades</SectionHeader>
    <Box sx={{ p: 1, color: '#fff' }}>My Trades Content</Box>
  </Box>
);

const MarketplaceView = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  const defaultSizes = [15, 15, 20, 20, 20, 10]; // 6 columns with reasonable defaults
  let marketplaceTabSizes = columnSizes?.marketplaceTabSplit || defaultSizes;

  // Rigorous check and correction for marketplaceTabSizes before rendering Split
  if (!Array.isArray(marketplaceTabSizes) || marketplaceTabSizes.length !== 6) {
    console.error('[MarketplaceView] CRITICAL: marketplaceTabSizes is invalid. Length or type issue. Reverting to default.', marketplaceTabSizes);
    marketplaceTabSizes = [...defaultSizes];
  } else {
    const sum = marketplaceTabSizes.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.1) { // Allow for minor floating point inaccuracies
      console.warn(`[MarketplaceView] WARNING: marketplaceTabSizes sum (${sum}) is not 100. Attempting normalization. Sizes:`, marketplaceTabSizes);
      // Normalize to ensure sum is 100
      const factor = 100 / sum;
      marketplaceTabSizes = marketplaceTabSizes.map(s => s * factor);
      // Ensure it sums to 100 by adjusting the last element
      const newSum = marketplaceTabSizes.reduce((a, b) => a + b, 0);
      if (newSum !== 100 && marketplaceTabSizes.length === 6) {
        marketplaceTabSizes[5] += (100 - newSum);
      }
      console.log('[MarketplaceView] Normalized marketplaceTabSizes:', marketplaceTabSizes);
    }
  }

  console.log('[MarketplaceView] Rendering Split with marketplaceTabSizes:', JSON.stringify(marketplaceTabSizes));

  return (
    <MarketplaceIdentityProvider>
      <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden', height: '100%' }}>
        <Split
          className="marketplace-main-columns"
          sizes={marketplaceTabSizes}
          minSize={[200, 200, 200, 200, 200, 200]} // Minimum widths for each column
          gutterSize={6}
          expandToMin={true}
          style={{ display: 'flex', height: '100%', width: '100%' }}
          onDragEnd={(newSizes) => {
            if (updateColumnSizes) {
              updateColumnSizes('marketplaceTabSplit', newSizes);
            }
          }}
        >
          {/* Column 1: Wallet Style Column 1 */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <WalletStyleColumn1 />
          </Box>

          {/* Column 2: Wallet Style Column 2 */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <WalletStyleColumn2 />
          </Box>

          {/* Column 3: List Open Offers and Make Offer */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <Split
              direction="vertical"
              sizes={[50, 50]}
              minSize={[100, 100]}
              gutterSize={6}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <Box sx={{ background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
                <ListOpenOffersPanel />
              </Box>
              <Box sx={{ background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
                <MakeOfferPanel />
              </Box>
            </Split>
          </Box>

          {/* Column 4: Get Offers */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <GetOffersPanel />
          </Box>

          {/* Column 5: My Trades */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <MyTradesPanel />
          </Box>

          {/* Column 6: RPC Terminal */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <RpcTerminal />
          </Box>
        </Split>
      </Box>
    </MarketplaceIdentityProvider>
  );
};

export default MarketplaceView; 