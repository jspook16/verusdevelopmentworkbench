import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress, Button, Skeleton, Alert as MuiAlert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { WorkbenchDataContext } from '../contexts/WorkbenchDataContext';
import { NodeContext } from '../contexts/NodeContext';
import { styled } from '@mui/material/styles';
import DetailItem from './common/DetailItem';

const ScrollableBox = ({ children, height }) => (
  <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: 0, width: '100%', ...(height && { height }) }}>{children}</Box>
);

// const COLUMN_WIDTH = 320; // Keep removed

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0), // Adjusted for header
  background: '#232323',
  border: '1px solid #333',
  borderRadius: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

// Simplified Recursive Data Renderer for params/results in log
// Uses DetailItem for key-value pairs
const RenderLogData = ({ data, pathPrefix, onCopy }) => {
  if (typeof data !== 'object' || data === null) {
    return <Typography component="span" sx={{ fontSize: '0.75rem', color:'#ddd', whiteSpace:'pre-wrap' }}>{String(data)}</Typography>;
  }
  return (
    <Box sx={{width: '100%'}}>
      {Object.entries(data).map(([key, value]) => (
        <DetailItem
          compact
          key={`${pathPrefix}-${key}`}
          label={key}
          value={typeof value === 'object' ? "(Object - see copy)" : String(value)}
          fullValue={typeof value === 'object' ? JSON.stringify(value,null,2) : String(value)}
          onCopy={() => onCopy(typeof value === 'object' ? JSON.stringify(value,null,2) : String(value))}
          isAddress={false}
          hideTooltip={typeof value === 'object' && value !== null}
        >
          {typeof value === 'object' && value !== null && (
            <Paper component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#222', p: 0.5, mt:0.5, borderRadius: 1, color: '#ccc', fontSize: '0.7rem', maxHeight:'100px', overflowY:'auto'}}>
              {JSON.stringify(value, null, 2)}
            </Paper>
          )}
        </DetailItem>
      ))}
    </Box>
  );
};

const WorkbenchDynamicColumn = ({ selectedSubOperation, activeEntityKey }) => {
  const {
    rAddressesWithUtxos,
    fetchAndSetRAddressesWithUtxos,
    pendingNameCommitments,
    removeNameCommitment,
    getCopyString,
    cryptoOperations,
    clearCryptoOperations,
    removeCryptoOperation
  } = useContext(WorkbenchDataContext);

  const { nodeStatus } = useContext(NodeContext);

  // Log props on every render, now using activeEntityKey
  console.log('[WorkbenchDynamicColumn] Props received:', { selectedSubOperation, activeEntityKey });
  // Log context state
  console.log('[WorkbenchDynamicColumn] Context cryptoOperations:', cryptoOperations);

  // State to hold the *type* and *title* of content to display persistently
  const [displayState, setDisplayState] = useState({ type: null, title: 'Dynamic Output' });
  // State for loading R-addresses specifically (can be expanded if other sections load)
  const [isLoading, setIsLoading] = useState(false);
  const [rpcError, setRpcError] = useState(null);

  // Determine the current content type based on selection and update persistent state only if valid
  useEffect(() => {
    let newType = null;
    let newTitle = '';
    if (selectedSubOperation === 'namecommitment') {
      newType = 'rAddresses'; newTitle = 'Wallet R-addresses';
    } else if (selectedSubOperation === 'registeridentity') {
      newType = 'pendingNames'; newTitle = 'Pending Name Registrations';
    } else if (['signmessage', 'signfile', 'signdata', 'verifymessage', 'verifyfile', 'verifyhash', 'verifysignature'].includes(selectedSubOperation)) {
      newType = 'cryptoLog'; newTitle = 'Crypto Operations Log';
    }
    // If no specific operation defines a title, keep or revert to a default.
    if (newType) {
      console.log(`[WorkbenchDynamicColumn] Setting display state: type=${newType}, title=${newTitle}`);
      setDisplayState({ type: newType, title: newTitle });
      setRpcError(null); 
    } else if (!selectedSubOperation) {
        // When no sub-operation is selected, clear to a default state or title
        setDisplayState({ type: null, title: 'Dynamic Output' });
    }
    if (newType && displayState.type !== newType) setRpcError(null);
  }, [selectedSubOperation, displayState.type]);

  const handleCopy = (data) => {
    const stringToCopy = (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') ? String(data) : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(stringToCopy);
  };

  // Modified refresh handler to set loading/error state
  const handleRefreshRAddresses = async () => {
    if (typeof fetchAndSetRAddressesWithUtxos !== 'function') {
      setRpcError('R-address fetch function not available.');
      return;
    }
    setRpcError(null);
    setIsLoading(true);
    try {
      console.log('[WorkbenchDynamicColumn] Manual refresh: Fetching listunspent...');
      await fetchAndSetRAddressesWithUtxos();
    } catch (e) {
      setRpcError(e.message || 'Error fetching R-addresses.');
      console.error('[WorkbenchDynamicColumn] Error fetching listunspent:', e);
    } finally {
        setIsLoading(false);
    }
  };

  // Render R-addresses with UTXOs
  const renderRAddresses = () => {
    // Add safety check for rAddressesWithUtxos
    const addresses = Array.isArray(rAddressesWithUtxos) ? rAddressesWithUtxos : [];
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}> 
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: '#90caf9', flexGrow: 1, fontSize: '1.05rem' }}>Wallet R-addresses</Typography>
          <Tooltip title="Refresh R-addresses">
            <span>
              <IconButton size="small" onClick={handleRefreshRAddresses} disabled={isLoading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {isLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Box>
        {/* Display general RPC error if present */}
        {rpcError && (
          <Typography sx={{ color: '#f44336', fontStyle: 'italic', mb: 1, fontSize: '0.9rem' }}>
            Error: {rpcError}
          </Typography>
        )}
        <ScrollableBox> 
          {!isLoading && addresses.length === 0 && !rpcError ? (
            <Typography sx={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.95rem' }}>No R-addresses with UTXOs found in wallet.</Typography>
          ) : (
            !isLoading && addresses.map(({ address, utxos, total }) => (
              <Paper key={address} sx={{ mb: 2, p: 1, background: '#232323', border: '1px solid #444', width: '100%', boxSizing: 'border-box' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>{address}</Typography>
                  <Tooltip title="Copy R-address">
                    <IconButton size="small" onClick={() => handleCopy(address)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography sx={{ color: '#90caf9', fontWeight: 500, fontSize: '0.85rem', mb: 0.5 }}>Total: {total.toFixed(8)}</Typography>
                <Divider sx={{ mb: 1, borderColor: '#444' }} />
                <ScrollableBox height="100px">
                  {utxos.length === 0 ? (
                    <Typography sx={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.9rem' }}>No UTXOs</Typography>
                  ) : (
                    <List dense sx={{ width: '100%' }}>
                      {utxos.map((utxo, idx) => (
                        <ListItem key={utxo.txid + ':' + utxo.vout} divider sx={{ alignItems: 'flex-start', py: 0.5, width: '100%' }}>
                          <ListItemText
                            primary={<>
                              <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>Amount:</Typography> <span style={{ fontSize: '0.85rem' }}>{utxo.amount}</span> <br />
                              <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>Confirmations:</Typography> <span style={{ fontSize: '0.85rem' }}>{utxo.confirmations}</span> <br />
                              <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>TXID:</Typography> <span style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{utxo.txid}</span> <br />
                              <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>Vout:</Typography> <span style={{ fontSize: '0.85rem' }}>{utxo.vout}</span>
                            </>}
                            secondary={utxo.account ? `Account: ${utxo.account}` : ''}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </ScrollableBox>
              </Paper>
            ))
          )}
        </ScrollableBox>
      </Box>
    );
  };

  // Helper: Render pending name commitments
  const renderPendingNames = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <ScrollableBox>
        {pendingNameCommitments.length === 0 ? (
          <Typography sx={{ color: '#bbb', fontStyle: 'italic' }}>No pending name commitments.</Typography>
        ) : (
          <List dense sx={{ width: '100%', p:0 }}>
            {pendingNameCommitments.map((commit, idx) => (
              <Paper key={commit.txid || idx} sx={{ mb: 1.5, p: 1.5, background: '#282828', border: '1px solid #444', width: '100%', boxSizing: 'border-box' }}>
                {/* Main Name Display with Copy/Delete */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                    {commit.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Copy all details of this commitment">
                      <IconButton size="small" onClick={() => handleCopy(commit)} sx={{p:0.25}}><ContentCopyIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Remove this pending commitment (does not cancel on-chain)">
                      <IconButton size="small" onClick={() => removeNameCommitment(commit.txid)} sx={{p:0.25}}><DeleteIcon fontSize="small" sx={{ color: '#f44336' }} /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* DetailItem-like rendering for other fields */}
                {Object.entries(commit).map(([key, value]) => {
                  // Skip 'name' as it's displayed above, and any potentially problematic keys
                  if (key === 'name') return null;
                  // You might want to format specific keys differently, e.g., timestamp
                  let displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                  if (key === 'timestamp') {
                    displayValue = new Date(value).toLocaleString();
                  }

                  // Determine if value is an address-like string for copy icon
                  const isAddressLike = typeof value === 'string' && (value.startsWith('R') || value.startsWith('i') || value.length === 64 /* txid */);

                  return (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5, py: 0.25, minHeight: '20px' }}>
                      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: 100, flexShrink: 0, fontSize: '0.75rem', mr: 1, lineHeight: 1.3 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </Typography>
                      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography component="div" variant="body2" sx={{ 
                            color: '#ddd', 
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace', // Monospace for most values for alignment
                            fontSize: '0.75rem',
                            lineHeight: 1.3,
                            pr: isAddressLike ? 0.5 : 0
                          }}>
                          {displayValue}
                        </Typography>
                        {isAddressLike && (
                          <Tooltip title={`Copy ${key}: ${value}`}>
                            <IconButton onClick={() => handleCopy(value)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }} aria-label={`Copy ${key}`}>
                              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                </Box>
                  );
                })}
              </Paper>
            ))}
          </List>
        )}
      </ScrollableBox>
    </Box>
  );

  // Helper: Render crypto operations using activeEntityKey
  const renderCryptoLog = () => { 
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, px:1, pt:1}}>
            <Button 
                variant="outlined" 
                size="small" 
                onClick={clearCryptoOperations}
                startIcon={<DeleteIcon />}
                sx={{fontSize: '0.8rem', color:'#ff8a80', borderColor:'#ff8a80'}}
            >Clear Log</Button>
        </Box>
        <ScrollableBox sx={{px:1 /* Add padding to scrollable area */}}>
          {cryptoOperations.length === 0 ? (
            <Typography sx={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', textAlign:'center', mt:2 }}>No crypto operations recorded.</Typography>
          ) : (
            <List dense sx={{ width: '100%', p:0 }}>
              {cryptoOperations.map((entry, idx) => (
                <Paper key={idx} elevation={1} sx={{ mb: 1.5, p: 1.5, background: '#282828', borderRadius: '4px' }}>
                  <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:0.5}}>
                    <Typography sx={{fontSize:'0.85rem', color: entry.status === 'Error' ? '#e57373' : '#a5d6a7', fontWeight: 'bold'}}>
                      {entry.operation || 'Unknown Op'} - {entry.status || 'Status Unknown'}
                    </Typography>
                    <IconButton onClick={() => removeCryptoOperation(idx)} size="small" sx={{color:'#777', '&:hover':{color:'#bbb'}}}><DeleteIcon fontSize='small'/></IconButton>
                  </Box>
                  <Typography sx={{fontSize:'0.7rem', color:'#999', mb:1}}>{new Date(entry.timestamp).toLocaleString()}</Typography>
                  
                  <DetailItem compact label="Signer/Actor" value={entry.signer || 'N/A'} onCopy={handleCopy} isAddress={true} hideTooltip={false}/>

                  {entry.params && Object.keys(entry.params).length > 0 && (
                     <Box sx={{ mt: 0.5, mb:0.5 }}>
                        <Typography sx={{fontSize:'0.7rem', color:'#a0cff9', fontWeight:'500', mb: 0.25}}>Parameters:</Typography>
                         <Paper elevation={0} sx={{ pl: 0, background:'#2d2d2d', p:0.5, borderRadius: '4px' }}>
                           <RenderLogData data={entry.params} pathPrefix={`log-${idx}-params`} onCopy={handleCopy} />
                        </Paper>
                    </Box>
                  )}
                  {entry.result && (
                     <Box sx={{ mt: 0.5, mb:0.5 }}>
                        <Typography sx={{fontSize:'0.7rem', color:'#a0cff9', fontWeight:'500', mb: 0.25}}>Result:</Typography>
                         <Paper elevation={0} sx={{ pl: 0, background:'#2d2d2d', p:0.5, borderRadius: '4px' }}>
                           <RenderLogData data={entry.result} pathPrefix={`log-${idx}-result`} onCopy={handleCopy} />
                        </Paper>
                    </Box>
                  )}
                  {entry.error && (
                     <Box sx={{ mt: 0.5 }}>
                        <Typography sx={{fontSize:'0.7rem', color:'#e57373', fontWeight:'500', mb: 0.25}}>Error:</Typography>
                         <Paper elevation={0} component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem', background:'#2d2d2d', p:1, borderRadius: '4px', color: '#ffcdd2' }}>
                           {typeof entry.error === 'object' ? JSON.stringify(entry.error, null, 2) : entry.error}
                        </Paper>
                    </Box>
                  )}
                </Paper>
              ))}
            </List>
          )}
        </ScrollableBox>
      </Box>
    );
  };

  // Determine the content to render based on the persisted displayState.type
  let finalContent = null;
  if (displayState.type === 'rAddresses') {
    finalContent = renderRAddresses();
  } else if (displayState.type === 'pendingNames') {
    finalContent = renderPendingNames();
  } else if (displayState.type === 'cryptoLog') {
    finalContent = renderCryptoLog();
  }

  // Only render the column if there is some persisted content type
  if (!displayState.type) return null; 

  return (
    <StyledPaper>
      <Typography 
        variant="h6" 
        sx={{ 
          p: 1, 
          textAlign: 'center', 
          color: 'white', 
          backgroundColor: '#191919',
          flexShrink: 0
        }}
      >
        {displayState.title || (finalContent ? 'Crypto Operations Log' : 'Dynamic Output')} 
      </Typography>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: displayState.type ? 1.5 : 0, pt:1 }}>
        {finalContent ? finalContent : (
          <Typography sx={{ textAlign: 'center', color: '#bbb', mt: 2, p:1, fontSize:'0.9rem' }}>
            Select an operation or view logs here.
          </Typography>
        )}
      </Box>
    </StyledPaper>
  );
};

export default WorkbenchDynamicColumn; 