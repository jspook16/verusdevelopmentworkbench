import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  Divider, 
  CssBaseline, 
  CircularProgress, 
  Button, 
  Paper, 
  Tooltip, 
  IconButton,
  Tab,
  Tabs,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const drawerWidth = 240;

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// vLotto Component
function VLottoTab() {
  const [blockNumber, setBlockNumber] = useState('');
  const [winningHash, setWinningHash] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(10);
  const [tickets, setTickets] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [revealedCharacters, setRevealedCharacters] = useState([]);
  const [matchingTickets, setMatchingTickets] = useState([]);
  const [spinningChar, setSpinningChar] = useState('');

  // Generate random 64-character hex hash
  const generateRandomHash = () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Fetch block hash (simulated for now)
  const fetchBlockHash = async () => {
    if (!blockNumber) return;
    
    try {
      // For now, we'll simulate getting a block hash
      // In real implementation, this would call the Verus API
      const simulatedHash = generateRandomHash();
      setWinningHash(simulatedHash);
    } catch (error) {
      console.error('Error fetching block hash:', error);
      // Fallback to a sample hash for testing
      setWinningHash('0000000063a653769e508ce6612b5736a84a7e7f0f5075706b56635ccc0d5553');
    }
  };

  // Generate tickets
  const generateTickets = () => {
    const newTickets = [];
    for (let i = 0; i < ticketQuantity; i++) {
      newTickets.push({
        id: i + 1,
        hash: generateRandomHash(),
        score: 0,
        matchingPositions: []
      });
    }
    setTickets(newTickets);
  };

  // Calculate ticket scores
  const calculateTicketScores = (tickets, winningHash) => {
    return tickets.map(ticket => {
      let score = 0;
      const matchingPositions = [];
      
      for (let i = 0; i < 64; i++) {
        if (ticket.hash[i] === winningHash[i]) {
          score += Math.pow(2, i);
          matchingPositions.push(i);
        }
      }
      
      return {
        ...ticket,
        score,
        matchingPositions
      };
    });
  };

  // Spinning animation for characters
  const spinCharacter = (callback, duration = 1000) => {
    const chars = '0123456789abcdef';
    const interval = 50;
    const iterations = duration / interval;
    let count = 0;

    const spin = setInterval(() => {
      setSpinningChar(chars[Math.floor(Math.random() * chars.length)]);
      count++;
      
      if (count >= iterations) {
        clearInterval(spin);
        callback();
      }
    }, interval);
  };

  // Run lottery drawing
  const runLottery = async () => {
    if (!winningHash || tickets.length === 0) {
      alert('Please set a winning number and generate tickets first!');
      return;
    }

    setIsDrawing(true);
    setCurrentPosition(-1);
    setRevealedCharacters([]);
    setMatchingTickets([]);

    // Calculate all ticket scores first
    const scoredTickets = calculateTicketScores(tickets, winningHash);
    
    // Animate through each position from right to left (63 to 0)
    for (let pos = 63; pos >= 0; pos--) {
      setCurrentPosition(pos);
      
      // Spin animation
      await new Promise(resolve => {
        spinCharacter(() => {
          // Reveal the actual character
          setSpinningChar('');
          setRevealedCharacters(prev => [...prev, { pos, char: winningHash[pos] }]);
          
          // Calculate matching tickets at this position
          const matchingAtPosition = scoredTickets.filter(ticket => 
            ticket.hash[pos] === winningHash[pos]
          );
          
          setMatchingTickets(matchingAtPosition);
          resolve();
        }, 800);
      });
      
      // Pause between characters
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Final results
    const finalTickets = scoredTickets.sort((a, b) => b.score - a.score);
    setTickets(finalTickets);
    setIsDrawing(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        vLotto - Verus Lottery System
      </Typography>
      
      {/* Input Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Block Number"
              value={blockNumber}
              onChange={(e) => setBlockNumber(e.target.value)}
              type="number"
            />
            <Button 
              variant="contained" 
              onClick={fetchBlockHash}
              sx={{ mt: 1 }}
              disabled={!blockNumber}
            >
              Get Winning Number
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Number of Tickets"
              value={ticketQuantity}
              onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 0)}
              type="number"
            />
            <Button 
              variant="contained" 
              onClick={generateTickets}
              sx={{ mt: 1 }}
              disabled={ticketQuantity <= 0}
            >
              Generate Tickets
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              color="success"
              onClick={runLottery}
              disabled={!winningHash || tickets.length === 0 || isDrawing}
              sx={{ mt: 4 }}
              size="large"
            >
              {isDrawing ? 'Drawing...' : 'Run vLotto'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Winning Number Display */}
      {winningHash && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Winning Number (Block {blockNumber})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {winningHash.split('').map((char, index) => {
              const isRevealed = revealedCharacters.some(r => r.pos === index);
              const isCurrent = currentPosition === index;
              
              return (
                <Box
                  key={index}
                  sx={{
                    width: 30,
                    height: 30,
                    border: '2px solid #1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    backgroundColor: isCurrent ? '#ffeb3b' : isRevealed ? '#e3f2fd' : '#f5f5f5',
                    color: isCurrent ? '#000' : '#1976d2',
                    animation: isCurrent ? 'pulse 0.5s infinite' : 'none'
                  }}
                >
                  {isCurrent && isDrawing ? spinningChar : char}
                </Box>
              );
            })}
          </Box>
          <Typography variant="body2" color="textSecondary">
            Position: {winningHash.split('').map((_, i) => i).join(' ')}
          </Typography>
        </Paper>
      )}

      {/* Drawing Status */}
      {isDrawing && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#fff3e0' }}>
          <Typography variant="h6" gutterBottom>
            Drawing in Progress...
          </Typography>
          <Typography variant="body1">
            Current Position: {currentPosition} | 
            Matching Tickets: {matchingTickets.length}
          </Typography>
          {currentPosition >= 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Revealing character at position {currentPosition}...
            </Typography>
          )}
        </Paper>
      )}

      {/* Tickets Display */}
      {tickets.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Tickets ({tickets.length})
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {tickets.map((ticket, index) => (
              <Card key={ticket.id} sx={{ mb: 1, backgroundColor: index === 0 && !isDrawing ? '#e8f5e8' : 'inherit' }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Ticket #{ticket.id}: {ticket.hash}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {ticket.score > 0 && (
                        <Chip 
                          label={`Score: ${ticket.score}`} 
                          color={index === 0 && !isDrawing ? 'success' : 'primary'} 
                          size="small" 
                        />
                      )}
                      {ticket.matchingPositions && ticket.matchingPositions.length > 0 && (
                        <Chip 
                          label={`Matches: ${ticket.matchingPositions.length}`} 
                          color="secondary" 
                          size="small" 
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default function App() {
  const [nodeInfo, setNodeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [identities, setIdentities] = useState([]);
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [selectedIdentityDetails, setSelectedIdentityDetails] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mainTabValue, setMainTabValue] = useState(0);
  const [verusIdTabValue, setVerusIdTabValue] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const info = await window.electron.ipcRenderer.invoke('check-node-connection');
        setNodeInfo(info);
        
        if (info.connected) {
          await fetchIdentities();
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkConnection();
  }, []);
  
  const fetchIdentities = async () => {
    setRefreshing(true);
    try {
      const idList = await window.electron.ipcRenderer.invoke('list-identities');
      if (idList.error) {
        setError(idList.error);
      } else {
        setIdentities(idList);
        // If we already had a selected identity, keep it selected
        if (selectedIdentity && idList.find(id => id.identity === selectedIdentity.identity)) {
          const currentId = idList.find(id => id.identity === selectedIdentity.identity);
          setSelectedIdentity(currentId);
          await fetchIdentityDetails(currentId.identity);
        } else if (idList.length > 0) {
          setSelectedIdentity(idList[0]);
          await fetchIdentityDetails(idList[0].identity);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchIdentityDetails = async (identityNameOrId) => {
    try {
      const details = await window.electron.ipcRenderer.invoke('get-identity-info', identityNameOrId);
      if (details.error) {
        console.error("Error fetching identity details:", details.error);
      } else {
        setSelectedIdentityDetails(details);
      }
    } catch (err) {
      console.error("Error in fetchIdentityDetails:", err);
    }
  };

  const handleIdentitySelect = async (identity) => {
    setSelectedIdentity(identity);
    await fetchIdentityDetails(identity.identity);
  };

  const handleRefresh = async () => {
    await fetchIdentities();
  };

  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  const handleVerusIdTabChange = (event, newValue) => {
    setVerusIdTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!nodeInfo || !nodeInfo.connected) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>
          Please configure your Verus node connection. Make sure the node is running with the -idindex=1 parameter.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* DEBUG MARKER: test */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, zIndex: 2000, background: 'red', color: 'white', padding: '2px 8px', fontWeight: 'bold' }}>
        test
      </Box>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box 
            component="div"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginRight: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 10px',
              borderRadius: '4px'
            }}
          >
            DIRECTORY
          </Box>
          <Box 
            component="div"
            sx={{ 
              flexGrow: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '4px 10px',
              borderRadius: '4px',
              marginRight: 2
            }}
          >
            Path
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            sx={{ ml: 1 }}
          >
            CONNECT
          </Button>
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              flexGrow: 1, 
              textAlign: 'right',
              fontWeight: 'bold'
            }}
          >
            Verus Development Workbench
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          mt: '64px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)'
        }}
      >
        {/* Main Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={mainTabValue} 
            onChange={handleMainTabChange}
            sx={{ 
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                color: mainTabValue === 0 ? '#2196f3' : 'inherit'
              }
            }}
          >
            <Tab label="VERUSID MANAGEMENT" />
            <Tab label="VDXF MANAGEMENT" />
            <Tab label="CURRENCY MANAGEMENT" />
            <Tab label="vLotto" />
          </Tabs>
        </Box>
        {/* VerusID Management Tab Panel */}
        <TabPanel value={mainTabValue} index={0}>
          <Box sx={{ display: 'flex', height: '100%' }}>
            {/* DEBUG: Test visible box for VerusIDs column */}
            <Box sx={{ width: 300, background: 'yellow', color: 'black', p: 2, fontWeight: 'bold', fontSize: 20 }}>
              DEBUG: VERUSIDs COLUMN TEST
            </Box>
            {/* VerusIDs Drawer - only visible in this tab */}
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  top: '64px',
                  height: 'calc(100% - 64px)',
                  background: '#263238',
                  borderRight: '2px solid #1976d2',
                  border: '3px solid red',
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Box sx={{ overflow: 'auto' }}>
                {/* Confirmation marker for debugging */}
                <Box sx={{ background: '#1976d2', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
                  VerusIDs Column Active
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" component="div">
                    VerusIDs
                  </Typography>
                  <Tooltip title="Refresh Identity List">
                    <IconButton onClick={handleRefresh} disabled={refreshing} size="small">
                      {refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider />
                {/* List of VerusIDs */}
                <List dense>
                  {identities.length > 0 ? (
                    identities.map((identity, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemButton 
                          selected={selectedIdentity && selectedIdentity.identity === identity.identity}
                          onClick={() => handleIdentitySelect(identity)}
                          dense
                        >
                          <ListItemText 
                            primary={identity.name} 
                            secondary={identity.identity.substring(0, 10) + '...'}
                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ fontSize: '0.7rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No identities found" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Drawer>
            {/* Left sidebar for VerusID Operations */}
            <Box 
              sx={{ 
                width: '200px', 
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                height: '100%',
                mr: 2,
                border: '3px solid green',
                boxSizing: 'border-box',
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                  fontWeight: 'bold'
                }}
              >
                VerusID Operations
              </Typography>
              <List dense component="nav">
                <ListItem disablePadding>
                  <ListItemButton selected={verusIdTabValue === 0} onClick={() => setVerusIdTabValue(0)}>
                    <ListItemText primary="Identity Creation" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton selected={verusIdTabValue === 1} onClick={() => setVerusIdTabValue(1)}>
                    <ListItemText primary="Identity Query" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton selected={verusIdTabValue === 2} onClick={() => setVerusIdTabValue(2)}>
                    <ListItemText primary="Identity Management" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton selected={verusIdTabValue === 3} onClick={() => setVerusIdTabValue(3)}>
                    <ListItemText primary="Crypto Operations" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
            {/* Main content area for selected operation */}
            <Box sx={{ flexGrow: 1, border: '3px solid blue', boxSizing: 'border-box' }}>
              {/* Selected Identity Details */}
              {selectedIdentity && (
                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedIdentity.name}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    <strong>Identity Address:</strong> {selectedIdentity.identity}
                  </Typography>
                  {selectedIdentityDetails && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2">
                          <strong>Parent:</strong> {selectedIdentityDetails.parent || 'None'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Min Sigs:</strong> {selectedIdentityDetails.minimumsignatures || '0'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Primary Addresses:</strong> {selectedIdentityDetails.primaryaddresses ? selectedIdentityDetails.primaryaddresses[0] : 'None'}
                          {selectedIdentityDetails.primaryaddresses && selectedIdentityDetails.primaryaddresses.length > 1 && '...'}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Paper>
              )}
              {/* VerusID Tab Panels */}
              <TabPanel value={verusIdTabValue} index={0}>
                <Typography variant="h6">Select an operation</Typography>
                <Typography variant="body1">Select an operation from the left panel to begin.</Typography>
              </TabPanel>
              <TabPanel value={verusIdTabValue} index={1}>
                <Typography variant="h6">Identity Query</Typography>
              </TabPanel>
              <TabPanel value={verusIdTabValue} index={2}>
                <Typography variant="h6">Identity Management</Typography>
              </TabPanel>
              <TabPanel value={verusIdTabValue} index={3}>
                <Typography variant="h6">Crypto Operations</Typography>
              </TabPanel>
            </Box>
          </Box>
        </TabPanel>
        {/* VDXF Management Tab Panel */}
        <TabPanel value={mainTabValue} index={1}>
          <Typography variant="h6">VDXF Management</Typography>
        </TabPanel>
        {/* Currency Management Tab Panel */}
        <TabPanel value={mainTabValue} index={2}>
          <Box sx={{ width: '100%', height: 200, background: 'orange', color: 'black', p: 4, fontWeight: 'bold', fontSize: 32, textAlign: 'center' }}>
            DEBUG: CURRENCY TAB TEST
          </Box>
        </TabPanel>
        {/* vLotto Tab Panel */}
        <TabPanel value={mainTabValue} index={3}>
          <VLottoTab />
        </TabPanel>
      </Box>
    </Box>
  );
} 