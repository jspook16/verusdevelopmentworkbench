import React, { useContext } from 'react';
import { Box } from '@mui/material';
import Split from 'react-split';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import WalletSelectorAndDetailsView from './WalletSelectorAndDetailsView';
import WalletOperationsView from './WalletOperationsView';
import RpcTerminal from '../Terminal/RpcTerminal';

// Placeholder for the main content area is now replaced by WalletOperationsView
// const WalletOperationsArea = () => { ... }

const WalletManagementView = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  const defaultSizes = [30, 45, 25];
  let walletMainTabSizes = columnSizes?.walletMainTabSplit || defaultSizes; 

  // Rigorous check and correction for walletMainTabSizes before rendering Split
  if (!Array.isArray(walletMainTabSizes) || walletMainTabSizes.length !== 3) {
    console.error('[WalletManagementView] CRITICAL: walletMainTabSizes is invalid. Length or type issue. Reverting to default.', walletMainTabSizes);
    walletMainTabSizes = [...defaultSizes];
  } else {
    const sum = walletMainTabSizes.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.1) { // Allow for minor floating point inaccuracies
      console.warn(`[WalletManagementView] WARNING: walletMainTabSizes sum (${sum}) is not 100. Attempting normalization. Sizes:`, walletMainTabSizes);
      // Attempt a more robust normalization ensuring it sums to 100
      const factor = 100 / sum;
      walletMainTabSizes = walletMainTabSizes.map(s => s * factor);
      // Due to floating point, ensure it sums to 100 by adjusting the last element
      const newSum = walletMainTabSizes.reduce((a, b) => a + b, 0);
      if (newSum !== 100 && walletMainTabSizes.length === 3) {
          walletMainTabSizes[2] += (100 - newSum);
      }
      console.log('[WalletManagementView] Normalized walletMainTabSizes:', walletMainTabSizes);
    }
  }

  console.log('[WalletManagementView] Rendering Split with walletMainTabSizes:', JSON.stringify(walletMainTabSizes));

  return (
    <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden', height: '100%' }}>
      <Split
        className="wallet-management-main-columns"
        sizes={walletMainTabSizes}
        minSize={[400, 300, 200]} // Min widths for (Selector+Details), Operations, and RPC Terminal
        gutterSize={8} 
        expandToMin={true}
        style={{ display: 'flex', height: '100%', width: '100%' }}
        onDragEnd={(newSizes) => {
            if (updateColumnSizes) {
                updateColumnSizes('walletMainTabSplit', newSizes);
            }
        }}
      >
        {/* Pane 1: Combined Selector and Details Columns */}
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent', borderRadius: 0, p: 0, overflow: 'hidden' }}>
          <WalletSelectorAndDetailsView />
        </Box>
        
        {/* Pane 2: Wallet Operations Area with Tabs */}
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent', borderRadius: 0, p: 0, overflow: 'hidden' }}>
          <WalletOperationsView />
        </Box>

        {/* Pane 3: RPC Terminal */}
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow: 'hidden' }}>
          <RpcTerminal />
        </Box>
      </Split>
    </Box>
  );
};

export default WalletManagementView; 