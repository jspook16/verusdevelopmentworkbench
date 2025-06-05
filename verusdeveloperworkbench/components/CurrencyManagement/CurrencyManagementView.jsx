import React, { useContext } from 'react';
import { Box, Paper, Divider } from '@mui/material';
import Split from 'react-split'; 
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { CurrencyDefinitionProvider } from '../../contexts/CurrencyDefinitionContext';

// Import wallet-style columns
import CurrencySelectionColumn from './CurrencySelectionColumn';
import CurrencyWalletStyleColumn2 from './CurrencyWalletStyleColumn2';

// Import remaining CM (Currency Management) specific components
import DefineCurrencyParamsCM from './DefineCurrencyParamsCM';
import CurrencyDefinitionPreviewCM from './CurrencyDefinitionPreviewCM';
import StagedCurrenciesColumn from './StagedCurrenciesColumn';
import GetCurrencyCM from './GetCurrencyCM';
import RpcTerminal from '../Terminal/RpcTerminal';

const CurrencyManagementView = () => {
  const { columnSizes, updateColumnSizes } = useContext(WorkbenchDataContext) || {};
  const currencyTabSizes = columnSizes?.currencyTab || [13, 13, 18, 18, 13, 15, 10]; 

  // console.log('[CurrencyManagementView] currencyTabSizes being used:', JSON.stringify(currencyTabSizes));
  // if (Array.isArray(currencyTabSizes) && currencyTabSizes.length !== 6) {
  //   console.error('[CurrencyManagementView] ERROR: currencyTabSizes has an incorrect number of elements! Expected 6, got:', currencyTabSizes.length, currencyTabSizes);
  // }
  // if (Array.isArray(currencyTabSizes) && currencyTabSizes.length === 6 && currencyTabSizes.reduce((a, b) => a + b, 0) !== 100) {
  //   console.warn('[CurrencyManagementView] WARNING: currencyTabSizes do not sum to 100! Sum:', currencyTabSizes.reduce((a, b) => a + b, 0), currencyTabSizes);
  // }

  return (
    <CurrencyDefinitionProvider>
      <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden', height: '100%' }}>
        <Split
          className="currency-management-columns"
          sizes={currencyTabSizes}
          minSize={[150, 150, 200, 180, 180, 180, 130]}
          gutterSize={6}
          expandToMin={true}
          style={{ display: 'flex', height: '100%', width: '100%' }}
          onDragEnd={(newSizes) => {
              // console.log('[CurrencyManagementView] onDragEnd - newSizes:', newSizes);
              if (updateColumnSizes) {
                  updateColumnSizes('currencyTab', newSizes);
              }
          }}
        >
          {/* Column 1: Wallet-style Selection Column */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <CurrencySelectionColumn />
          </Box>

          {/* Column 2: Wallet-style Details Column */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <CurrencyWalletStyleColumn2 />
          </Box>

          {/* Column 3: Define Currency Parameters */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0.5, overflow: 'hidden' }}>
            <DefineCurrencyParamsCM />
          </Box>

          {/* Column 4: Currency Definition Preview */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0.5, overflow: 'hidden' }}>
            <CurrencyDefinitionPreviewCM />
          </Box>
          
          {/* Column 5: Staged Currency Launches */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <StagedCurrenciesColumn />
          </Box>

          {/* Column 6: Get Currency Details */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <GetCurrencyCM />
          </Box>

          {/* Column 7: RPC Terminal */}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow: 'hidden' }}>
            <RpcTerminal />
          </Box>
        </Split>
      </Box>
    </CurrencyDefinitionProvider>
  );
};

export default CurrencyManagementView; 