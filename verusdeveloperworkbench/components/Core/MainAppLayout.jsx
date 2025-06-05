import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Tooltip
} from '@mui/material';
import { OperationContext } from '../../contexts/OperationContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { NodeContext } from '../../contexts/NodeContext';
// Import the new dynamic column
import WorkbenchDynamicColumn from '../WorkbenchDynamicColumn';
import Split from 'react-split';
import { MarketplaceIdentityProvider } from '../../contexts/MarketplaceIdentityContext';

// Import all the view components used in the layout
import AppHeader from './AppHeader';
import VerusIdList from '../VerusID/VerusIdList';
import VdxfSelectionColumn from '../VDXFManagement/VdxfSelectionColumn';
import VdxfWalletStyleColumn2 from '../VDXFManagement/VdxfWalletStyleColumn2';
import VerusIdOperationsMenu from '../VerusID/VerusIdOperationsMenu';
import VerusIdOperationRenderer from '../VerusID/VerusIdOperationRenderer';
import VdxfKeyManagement from '../VDXFManagement/VdxfKeyManagement';
import VdxfContentView from '../VDXFManagement/VdxfContentView';
import RpcTerminal from '../Terminal/RpcTerminal';
import StatesOfMyMapsColumn from '../VDXFManagement/StatesOfMyMapsColumn';
import CompleteMapsInputsColumn from '../VDXFManagement/CompleteMapsInputsColumn';
import VerusPlaygroundView from '../Playground/VerusPlaygroundView';
import CurrencyManagementView from '../CurrencyManagement/CurrencyManagementView';
import WalletManagementView from '../WalletManagement/WalletManagementView';
import MarketplaceView from '../Marketplace/MarketplaceView';
// Import Marketplace column components for direct use in VerusID Operations
import WalletStyleColumn1 from '../Marketplace/WalletStyleColumn1';
import WalletStyleColumn2 from '../Marketplace/WalletStyleColumn2';
import VLottoWrapper from './VLottoWrapper';

// Define localStorage keys outside the component for consistency
const JACKPOT_ID_STORAGE_KEY = 'vlotto-jackpotIdDetails';
const PAYOUT_ID_STORAGE_KEY = 'vlotto-payoutIdDetails';
const MAINTENANCE_ID_STORAGE_KEY = 'vlotto-maintenanceIdDetails';
const MAIN_VERUS_ID_STORAGE_KEY = 'vlotto-mainVerusId'; // For persisting Main VerusID input

// Define environment variable check for vLotto feature
const VLOTTO_ENABLED = import.meta.env.VITE_ENABLE_VLOTTO !== 'false';

// Memoized detailed ticket item for use AFTER drawing
const DetailedTicketItem = React.memo(function DetailedTicketItem({ ticket, isWinner }) {
  // ticket object contains id, hash, score, matchingPositions
  // console.log(`Rendering DETAILED TicketItem: ${ticket.id}`); // DEBUG
  return (
    <Card sx={{ mb: 1, backgroundColor: isWinner ? '#2d5016' : '#2a2a2a' }}>
      <CardContent sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            Ticket #{ticket.id}: {
              ticket.hash.split('').map((char, charIndex) => (
                <span
                  key={charIndex}
                  style={{
                    color: ticket.matchingPositions.includes(charIndex) ? '#2196f3' : '#fff',
                    fontWeight: ticket.matchingPositions.includes(charIndex) ? 'bold' : 'normal',
                  }}
                >
                  {char}
                </span>
              ))
            }
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {ticket.score > 0 && (
              <Chip label={`Score: ${ticket.score}`} color={isWinner ? 'success' : 'primary'} size="small" />
            )}
            {ticket.matchingPositions.length > 0 && (
              <Chip label={`Matches: ${ticket.matchingPositions.length}`} color="secondary" size="small" />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

// Memoized minimal ticket item for use DURING drawing
const MinimalTicketItem = React.memo(function MinimalTicketItem({ ticketId, ticketHash }) {
  // console.log(`Rendering MINIMAL TicketItem: ${ticketId}`); // DEBUG
  return (
    <Card sx={{ mb: 1, backgroundColor: '#2a2a2a' }}>
      <CardContent sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            Ticket #{ticketId}: {ticketHash}
          </Typography>
          {/* No chips during drawing for max performance */}
        </Box>
      </CardContent>
    </Card>
  );
});

// Table view component for detailed ticket inspection
const TicketTableView = React.memo(function TicketTableView({ 
  tickets, 
  selectedTicketIds, 
  onToggleSelection, 
  maxDisplay = 50 
}) {
  const displayTickets = tickets.slice(0, maxDisplay);
  
  return (
    <TableContainer component={Paper} sx={{ backgroundColor: '#2a2a2a', maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Select</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>ID</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Hash</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Score</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Matches</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Status</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Created</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Series</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayTickets.map((ticket) => (
            <TableRow 
              key={ticket.id}
              sx={{ 
                backgroundColor: selectedTicketIds.has(ticket.id) ? '#1976d2' : '#2a2a2a',
                '&:hover': { backgroundColor: selectedTicketIds.has(ticket.id) ? '#1565c0' : '#333' }
              }}
            >
              <TableCell>
                <Checkbox
                  checked={selectedTicketIds.has(ticket.id)}
                  onChange={() => onToggleSelection(ticket.id)}
                  sx={{ color: '#fff' }}
                />
              </TableCell>
              <TableCell sx={{ color: '#fff', fontFamily: 'monospace' }}>
                {ticket.id}
              </TableCell>
              <TableCell sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                <Tooltip title={ticket.hash} arrow>
                  <span>{ticket.hash.substring(0, 16)}...</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                {ticket.score || 0}
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                {ticket.matchingPositions ? ticket.matchingPositions.length : 0}
              </TableCell>
              <TableCell>
                <Chip 
                  label={ticket.status || 'N/A'} 
                  size="small" 
                  color={ticket.status === 'available' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell sx={{ color: '#fff', fontSize: '0.75rem' }}>
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell sx={{ color: '#fff', fontSize: '0.75rem' }}>
                {ticket.series || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {tickets.length > maxDisplay && (
        <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#1e1e1e' }}>
          <Typography variant="body2" color="textSecondary">
            Showing first {maxDisplay} of {tickets.length} tickets
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
});

const MainAppLayout = ({ selectedTab, handleTabChange }) => {
  const opContext = useContext(OperationContext);
  const idContext = useContext(IdentityContext);
  const workbenchContext = useContext(WorkbenchDataContext);
  const { sendCommand } = useContext(NodeContext);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Get VDXF specific details from IdentityContext to pass to VdxfVerusIdDetailsView
  const { vdxfIdentityDetails, loadingVdxfDetails, errorVdxfDetails } = idContext; 

  // Get columnSizes directly from context
  const { columnSizes, updateColumnSizes } = workbenchContext || {};

  // Set layout ready only when columnSizes state from context is available
  useEffect(() => {
    if (columnSizes && 
        columnSizes.verusIdTab && 
        columnSizes.vdxfTab && 
        columnSizes.currencyTab && 
        columnSizes.walletMainTabSplit &&
        columnSizes.walletTabSelectorDetailsSplit &&
        columnSizes.walletTabVerticalSplit
    ) { 
      setIsLayoutReady(true);
    }
  }, [columnSizes]);

  // Guard against contexts not being ready (including workbenchContext)
  if (!opContext || !idContext || !workbenchContext || !isLayoutReady) { 
    return <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}><CircularProgress /></Box>;
  }

  const { selectedOperation, selectedSubOperation } = opContext;
  const { selectedIdName, selectedRAddress } = idContext;

  // Determine the active key for dynamic column filtering
  const activeEntityKey = selectedIdName || selectedRAddress;

  // Use loaded sizes or fall back to defaults if context hasn't provided them yet
  const verusIdTabSizesDefault = [15, 20, 15, 20, 15, 15];
  let verusIdTabSizes = (columnSizes?.verusIdTab && columnSizes.verusIdTab.length === 6) 
                          ? columnSizes.verusIdTab 
                          : verusIdTabSizesDefault;
  
  // Aggressive local normalization for verusIdTabSizes for testing
  const sumVerusIdTab = verusIdTabSizes.reduce((a, b) => a + b, 0);
  if (Math.abs(sumVerusIdTab - 100) > 0.01 && sumVerusIdTab !== 0) { 
      console.warn(`[MainAppLayout] VerusID tab sizes sum to ${sumVerusIdTab}, re-normalizing locally.`);
      const factor = 100 / sumVerusIdTab;
      verusIdTabSizes = verusIdTabSizes.map(s => Math.max(5, s * factor)); // Ensure min 5%
      let newSum = verusIdTabSizes.reduce((a,b) => a+b, 0);
      if (Math.abs(newSum - 100) > 0.01 && verusIdTabSizes.length > 0) { // If still off, adjust first element
          verusIdTabSizes[0] += (100 - newSum);
      }
      // Final check to ensure the first element didn't go below min due to adjustment
      verusIdTabSizes[0] = Math.max(5, verusIdTabSizes[0]);
      // Re-distribute any tiny remainder from clamping the first element, if necessary
      newSum = verusIdTabSizes.reduce((a,b) => a+b, 0);
      if (Math.abs(newSum - 100) > 0.01 && verusIdTabSizes.length > 1) {
          verusIdTabSizes[1] += (100 - newSum);
      }
  }
  
  const defaultVdxfTabSizes = [14, 14, 14, 14, 14, 14, 16]; // More balanced distribution with emphasis on RPC Terminal
  let vdxfTabSizes = defaultVdxfTabSizes; // Always use our defaults to reset any problematic saved values
  
  // Restore size persistence
  if (columnSizes?.vdxfTab) { // If there are saved sizes for vdxfTab
    if (columnSizes.vdxfTab.length === defaultVdxfTabSizes.length) {
      vdxfTabSizes = columnSizes.vdxfTab; // Use them if length matches
    } else {
      // Log that saved sizes are incompatible
      console.warn(
        `[MainAppLayout] VDXF tab sizes from context had incompatible length ${columnSizes.vdxfTab.length}, expected ${defaultVdxfTabSizes.length}. Using default sizes.`
      );
      // vdxfTabSizes remains defaultVdxfTabSizes, ensuring correct length
    }
  }
  
  // Now vdxfTabSizes is guaranteed to have the correct length for the Split component.

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow:'hidden' }}>
      <AppHeader />
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="main application tabs" sx={{ borderBottom: 1, borderColor: 'divider', flexShrink:0, backgroundColor:'#1e1e1e' }}>
        <Tab label="VerusID Operations" sx={{fontSize:'0.8rem', color: selectedTab === 0 ? '#fff' : '#aaa'}}/>
        <Tab label="VDXF Management" sx={{fontSize:'0.8rem', color: selectedTab === 1 ? '#fff' : '#aaa'}}/>
        <Tab label="Currency Management" sx={{fontSize:'0.8rem', color: selectedTab === 2 ? '#fff' : '#aaa'}}/>
        <Tab label="Wallet Management" sx={{fontSize:'0.8rem', color: selectedTab === 3 ? '#fff' : '#aaa'}}/>
        <Tab label="Marketplace" sx={{fontSize:'0.8rem', color: selectedTab === 4 ? '#fff' : '#aaa'}}/>
        <Tab label="Verus Playground" sx={{fontSize:'0.8rem', color: selectedTab === 5 ? '#fff' : '#aaa'}}/>
        {VLOTTO_ENABLED && <Tab label="vLotto" sx={{fontSize:'0.8rem', color: selectedTab === 6 ? '#fff' : '#aaa'}}/>}
      </Tabs>

      {/* VerusID Operations Tab */}
      {selectedTab === 0 && (
        <MarketplaceIdentityProvider>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', minHeight: 0, p:1, bgcolor:'#121212' }}>
            {isLayoutReady ? (
              <Split 
                className="verusid-operations-columns"
                sizes={verusIdTabSizes}
                minSize={[150, 200, 180, 230, 180, 130]}
                gutterSize={6} 
                expandToMin={true}
                style={{display: 'flex', height: '100%', width: '100%'}}
                onDragEnd={(newSizes) => updateColumnSizes('verusIdTab', newSizes)}
              >
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow:'hidden' }}>
                  <WalletStyleColumn1 contextType="verusidops" />
                </Box>
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow:'hidden' }}>
                   <WalletStyleColumn2 contextType="verusidops" />
                </Box>
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow:'hidden' }}>
                  <VerusIdOperationsMenu />
                </Box>
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow:'hidden' }}>
                  <VerusIdOperationRenderer />
                </Box>
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow:'hidden' }}>
                  <WorkbenchDynamicColumn selectedSubOperation={selectedSubOperation} activeEntityKey={activeEntityKey} />
                </Box>
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 1, p: 0, overflow:'hidden' }}>
                  <RpcTerminal />
                </Box>
              </Split>
            ) : (
              <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box>
            )}
          </Box>
        </MarketplaceIdentityProvider>
      )}

      {/* VDXF Management Tab */}
      {selectedTab === 1 && (
        <Box 
          sx={{ 
            flex: 1, 
            width: '100%', 
            minHeight: 0, 
            p: 0, 
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'stretch'
          }} 
          role="tabpanel" 
          id="tabpanel-vdxf" 
          aria-labelledby="tab-vdxf"
        >
          {isLayoutReady ? (
            <Split
              sizes={vdxfTabSizes}
              minSize={[200, 200, 250, 250, 300, 150, 0]}
              gutterSize={6}
              expandToMin={true}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              style={{ 
                display: 'flex', 
                height: '100%', 
                width: '100%',
                margin: 0,
                padding: 0,
                flex: 1,
                alignItems: 'stretch',
                flexGrow: 1
              }}
              onDragEnd={(newSizes) => updateColumnSizes && updateColumnSizes('vdxfTab', newSizes)}
            >
              {/* Column 1 - New Selection Column */}
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0 }}>
                <VdxfSelectionColumn />
              </Box>
              {/* Column 2 - New Details View Column */}
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0 /* Adjusted padding if VdxfWalletStyleColumn2 handles its own */ }}>
                <VdxfWalletStyleColumn2 />
              </Box>
              {/* Column 3 */}
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0.5 }}>
                <StatesOfMyMapsColumn sendCommand={sendCommand} />
              </Box>
              {/* Column 4 */}
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0 }}>
                <CompleteMapsInputsColumn />
              </Box>
              {/* Column 5 */}
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
                <VdxfContentView /> 
              </Box>
              {/* Column 6 */}
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflowY:'auto' }}>
                <VdxfKeyManagement />
              </Box>
              {/* Column 7 */}
              <Box sx={{ height: '100%', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, minWidth: 0 }}>
                <RpcTerminal /> 
              </Box>
            </Split>
          ) : (
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box>
          )}
        </Box>
      )}

      {/* Tab Panel for Currency Management */}
      {selectedTab === 2 && (
         <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden' }} role="tabpanel" id="tabpanel-currency" aria-labelledby="tab-currency">
          {isLayoutReady ? (
            <CurrencyManagementView />
          ) : (
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box>
          )}
        </Box>
      )}

      {/* Tab Panel for Wallet Management */}
      {selectedTab === 3 && (
        <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden' }} role="tabpanel" id="tabpanel-walletmgmt" aria-labelledby="tab-walletmgmt">
          {isLayoutReady ? <WalletManagementView /> : <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box> } 
        </Box>
      )}

      {/* Tab Panel for Market Place */}
      {selectedTab === 4 && (
        <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden' }} role="tabpanel" id="tabpanel-marketplace" aria-labelledby="tab-marketplace">
          {isLayoutReady ? <MarketplaceView /> : <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box>}
        </Box>
      )}

      {/* Tab Panel for Verus Playground */}
      {selectedTab === 5 && (
        <Box sx={{ flex: 1, p: 1, background: '#1e1e1e', overflowY: 'auto' }} role="tabpanel" id="tabpanel-playground" aria-labelledby="tab-playground">
          <VerusPlaygroundView />
        </Box>
      )}

      {/* Tab Panel for vLotto - Only render if enabled */}
      {VLOTTO_ENABLED && selectedTab === 6 && (
        <Box sx={{ flex: 1, minHeight: 0, p: 0, overflow: 'hidden' }} role="tabpanel" id="tabpanel-vlotto" aria-labelledby="tab-vlotto">
          {isLayoutReady ? (
            <Split
              sizes={[70, 30]}
              minSize={[300, 200]}
              gutterSize={6}
              expandToMin={true}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              style={{ 
                display: 'flex', 
                height: '100%', 
                width: '100%',
                margin: 0,
                padding: 0,
                flex: 1,
                alignItems: 'stretch',
                flexGrow: 1
              }}
            >
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'auto' }}>
                <VLottoWrapper />
              </Box>
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#232323', borderRadius: 1, p: 0, overflow: 'hidden' }}>
                <RpcTerminal />
              </Box>
            </Split>
          ) : (
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MainAppLayout; 