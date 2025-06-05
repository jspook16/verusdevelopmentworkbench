import React, { useContext, useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Tooltip, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LockIcon from '@mui/icons-material/Lock';
import BlockIcon from '@mui/icons-material/Block';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useTheme } from '@mui/material/styles';
import { NodeContext } from '../../contexts/NodeContext'; // Adjust path as necessary
import QuickSendModal from '../Modals/QuickSendModal'; // Import the modal
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import VDevLogo from '../../vdevupdatedlogo.svg?react';
import { IdentityContext } from '../../contexts/IdentityContext';

const AppHeader = () => {
  const theme = useTheme();
  const {
    verusPath,
    nodeStatus,
    loadingPath,
    loadingStatus,
    selectVerusDirectory,
    checkNodeConnection,
    sendCommand // Assuming sendCommand is available from NodeContext
  } = useContext(NodeContext);
  const {
    totalNativeBalance,
    loadingTotalNativeBalance,
    fetchTotalNativeBalance // Optional: if you want a refresh button for total balance here
  } = useContext(IdentityContext) || {}; // Add || {} for safety if context is not yet available

  const [isBlockWatcherActive, setIsBlockWatcherActive] = useState(false);
  const [currentBlockCount, setCurrentBlockCount] = useState(null);
  const [blockCountError, setBlockCountError] = useState(null);
  const [isLoadingBlockCount, setIsLoadingBlockCount] = useState(false);
  const intervalRef = useRef(null);

  const [isQuickSendModalOpen, setIsQuickSendModalOpen] = useState(false); // State for modal

  const [isGetTxModalOpen, setIsGetTxModalOpen] = useState(false);
  const [getTxId, setGetTxId] = useState('');
  const [getTxWatchonly, setGetTxWatchonly] = useState(false);
  const [getTxLoading, setGetTxLoading] = useState(false);
  const [getTxError, setGetTxError] = useState('');
  const [getTxResult, setGetTxResult] = useState(null);
  const [copiedTxField, setCopiedTxField] = useState('');

  const [mining, setMining] = useState(false);
  const [staking, setStaking] = useState(false);
  const [miningLoading, setMiningLoading] = useState(false);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [miningThreads, setMiningThreads] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const miningThreadOptions = [0, ...Array.from({length: 24}, (_, i) => i + 1)];

  const commonButtonStyles = {
    fontSize: '0.875rem', // Standardized font size
    minWidth: '150px',   // Ensure buttons have a decent minimum width
    height: '36px',       // Standardized height
  };

  const fetchBlockCount = async () => {
    if (!sendCommand) {
      setBlockCountError('RPC unavailable');
      return;
    }
    setIsLoadingBlockCount(true);
    setBlockCountError(null);
    try {
      // console.log('[AppHeader] Fetching getblockcount...');
      const result = await sendCommand('getblockcount', [], 'node');
      // console.log('[AppHeader] getblockcount result:', result);
      if (result !== null && typeof result === 'number') {
        setCurrentBlockCount(result);
      } else if (result && result.error) {
        setBlockCountError(result.error.message || 'Error fetching');
        setCurrentBlockCount(null);
      } else if (typeof result !== 'number') {
        setBlockCountError('Invalid response');
        setCurrentBlockCount(null);
      }
    } catch (err) {
      // console.error('[AppHeader] Error fetching block count:', err);
      setBlockCountError(err.message || 'Request failed');
      setCurrentBlockCount(null);
    } finally {
      setIsLoadingBlockCount(false);
    }
  };

  useEffect(() => {
    if (isBlockWatcherActive && nodeStatus.connected) { // Only watch if connected
      fetchBlockCount(); 
      intervalRef.current = setInterval(fetchBlockCount, 15000); 
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (!nodeStatus.connected && isBlockWatcherActive) { // If disconnected while watcher was active
        setIsBlockWatcherActive(false); // Turn off watcher
        setCurrentBlockCount(null);
        setBlockCountError('Disconnected');
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isBlockWatcherActive, sendCommand, nodeStatus.connected]);

  const handleToggleBlockWatcher = () => {
    if (!nodeStatus.connected && !isBlockWatcherActive) return; // Don't activate if not connected
    setIsBlockWatcherActive(prev => !prev);
    if (isBlockWatcherActive) { 
        setCurrentBlockCount(null); 
        setBlockCountError(null);
    }
  };

  // Set Verus Dir Button Logic
  let setDirButtonText = "Dir Path?";
  let setDirButtonColor = "warning";
  if (loadingPath) {
    setDirButtonText = "Loading...";
    setDirButtonColor = "info";
  } else if (verusPath) {
    setDirButtonText = "Path Set";
    setDirButtonColor = "success";
  }

  // Connect Button Logic
  let connectButtonText = "Connect";
  let connectButtonColor = "warning";
  if (loadingStatus) {
    connectButtonText = "Connecting...";
    connectButtonColor = "info";
  } else if (nodeStatus.connected) {
    connectButtonText = "Connected";
    connectButtonColor = "success";
  } else if (nodeStatus.error) {
    connectButtonText = "Connect Error"; // Or keep as "Click to Connect" and show error elsewhere if preferred
    connectButtonColor = "error";
  }

  // Blocks Button Logic
  let blockButtonText = 'Blocks: Click to Enable';
  let blockButtonColor = 'warning'; 
  if (!nodeStatus.connected && !isBlockWatcherActive){
    blockButtonText = 'Blocks: (Connect First)'; // Indicate need to connect
    blockButtonColor = 'default';
  } else if (isBlockWatcherActive) {
    if (isLoadingBlockCount && currentBlockCount === null) {
      blockButtonText = 'Blocks: Fetching...';
      blockButtonColor = 'info'; 
    } else if (blockCountError) {
      blockButtonText = `Blocks: Error (${blockCountError === 'Disconnected' ? 'Node Disconnected' : blockCountError })`;
      blockButtonColor = 'error'; 
    } else if (currentBlockCount !== null) {
      blockButtonText = `Blocks: ${currentBlockCount}`;
      blockButtonColor = 'success'; 
    } else {
      blockButtonText = 'Blocks: Initializing...';
      blockButtonColor = 'info';
    }
  }

  const handleGetTransaction = async () => {
    setGetTxError('');
    setGetTxResult(null);
    setCopiedTxField('');
    if (!getTxId) {
      setGetTxError('Transaction ID is required.');
      return;
    }
    setGetTxLoading(true);
    try {
      const params = [getTxId, getTxWatchonly];
      const result = await sendCommand('gettransaction', params);
      if (result && typeof result === 'object' && result.txid) {
        setGetTxResult(result);
      } else {
        setGetTxResult(null);
        setGetTxError('Unexpected result format.');
      }
    } catch (err) {
      setGetTxError(err.message || 'Error fetching transaction.');
      setGetTxResult(null);
    } finally {
      setGetTxLoading(false);
    }
  };

  const handleCopyTxField = (value, field) => {
    if (value) {
      navigator.clipboard.writeText(String(value));
      setCopiedTxField(field);
      setTimeout(() => setCopiedTxField(''), 1200);
    }
  };

  // Query mining/staking state on load
  useEffect(() => {
    const fetchMiningStaking = async () => {
      try {
        const info = await sendCommand('getgenerate', []);
        // getgenerate returns: { mining: bool, staking: bool, threads: int }
        if (info && typeof info === 'object') {
          setMining(!!info.mining);
          setStaking(!!info.staking);
          setMiningThreads(info.threads || 1);
        }
      } catch {}
    };
    fetchMiningStaking();
  }, [sendCommand]);

  const handleMiningToggle = async () => {
    setMiningLoading(true);
    try {
      if (mining) {
        // Turn off mining, keep staking if enabled
        await sendCommand('setgenerate', [staking, staking ? 0 : undefined]);
        setMining(false);
      } else {
        // Turn on mining with selected threads
        await sendCommand('setgenerate', [true, miningThreads]);
        setMining(true);
      }
    } catch {} finally {
      setMiningLoading(false);
    }
  };

  const handleStakingToggle = async () => {
    setStakingLoading(true);
    try {
      if (staking) {
        // Turn off staking, keep mining if enabled
        await sendCommand('setgenerate', [mining, mining ? miningThreads : undefined]);
        setStaking(false);
      } else {
        // Turn on staking only (threads=0)
        await sendCommand('setgenerate', [true, 0]);
        setStaking(true);
      }
    } catch {} finally {
      setStakingLoading(false);
    }
  };

  const handleMiningThreadSelect = async (threads) => {
    setAnchorEl(null);
    setMiningThreads(threads);
    if (threads === 0) {
      setMiningLoading(true);
      try {
        await sendCommand('setgenerate', [staking, staking ? 0 : undefined]);
        setMining(false);
      } catch {} finally {
        setMiningLoading(false);
      }
      return;
    }
    if (!mining) {
      setMiningLoading(true);
      try {
        await sendCommand('setgenerate', [true, threads]);
        setMining(true);
      } catch {} finally {
        setMiningLoading(false);
      }
    } else {
      setMiningLoading(true);
      try {
        await sendCommand('setgenerate', [true, threads]);
      } catch {} finally {
        setMiningLoading(false);
      }
    }
  };

  return (
    <>
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 1, background: '#232323', borderBottom: '1px solid #333' }}>
      {/* Left Section: Node Configuration, Legend, and Modals */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Node Configuration Buttons */}
        <Button
          variant="contained"
          color={setDirButtonColor}
          onClick={selectVerusDirectory}
          disabled={loadingStatus || loadingPath}
          sx={commonButtonStyles}
        >
          {loadingPath ? <CircularProgress size={18} color="inherit" sx={{mr:0.5}}/> : null}
          {setDirButtonText}
        </Button>
        <Button
          variant="contained"
          color={connectButtonColor}
          onClick={() => checkNodeConnection()} 
          disabled={!verusPath || loadingStatus || loadingPath}
          sx={commonButtonStyles}
        >
          {loadingStatus ? <CircularProgress size={18} color="inherit" sx={{mr:0.5}}/> : null}
          {connectButtonText}
        </Button>
        {nodeStatus.error && !nodeStatus.connected && !loadingStatus && connectButtonColor !== 'error' && (
          <Tooltip title={nodeStatus.error}>
            <Typography sx={{ fontSize: '12px', color: '#f44336' }}> Error</Typography>
          </Tooltip>
        )}
        {/* Legend indicators, spaced from Connect button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 4 }}>
          <Tooltip title="Is a Currency">
            <FiberManualRecordIcon sx={{ color: theme.palette.success.light, fontSize: '1rem' }} />
          </Tooltip>
          <Typography variant="caption" sx={{color: '#bbb', fontSize: '0.75rem', mr:1.5 }}>= Currency</Typography>
          <Tooltip title="Is Timelocked (and active)">
            <LockIcon sx={{ color: '#ba68c8', fontSize: '1rem' }} />
          </Tooltip>
          <Typography variant="caption" sx={{color: '#bbb', fontSize: '0.75rem', mr:1.5 }}>= Timelocked</Typography>
          <Tooltip title="Is Revoked">
            <BlockIcon sx={{ color: theme.palette.error.light, fontSize: '1rem' }} />
          </Tooltip>
          <Typography variant="caption" sx={{color: '#bbb', fontSize: '0.75rem'}}>= Revoked</Typography>
        </Box>
        {/* Modal Buttons - moved here */}
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 4, gap: 0.75, flexWrap: 'nowrap' }}>
        <Tooltip title="Quick Send Funds">
            <span>
            <IconButton onClick={() => setIsQuickSendModalOpen(true)} color="primary" disabled={!nodeStatus.connected} sx={{border: '1px solid', borderColor: 'primary.main', borderRadius: '4px', p:0.75}}>
                <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Get Transaction">
          <span>
            <IconButton onClick={() => setIsGetTxModalOpen(true)} color="info" sx={{border: '1px solid', borderColor: 'info.main', borderRadius: '4px', p:0.75, ml: 1}}>
              <ReceiptLongIcon />
            </IconButton>
          </span>
        </Tooltip>
        </Box>
      </Box>

      {/* Center Section: Logo (restored) */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
        <VDevLogo style={{ height: 60, width: 'auto', display: 'block' }} />
      </Box>
      
      {/* Right Section: Total Balance, Block Watcher, Mining/Staking */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Display Total Native Balance */}
        {nodeStatus.connected && (
          <Tooltip title="Total Wallet Balance (Native Currency)">
            <Box sx={{ mr: 2, p: '4px 8px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#a0cff9', mr: 0.5 }}>Total Balance:</Typography>
              {loadingTotalNativeBalance ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>
                  {totalNativeBalance !== null ? totalNativeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : 'N/A'}
                  {/* Display native currency ticker if available, e.g., from nodeStatus.chainName */}
                  {nodeStatus.chainName && (<Typography component="span" sx={{fontSize: '0.7rem', color: '#a0cff9', ml: 0.5}}> {nodeStatus.chainName}</Typography>)}
                </Typography>
              )}
              {/* Optional: Refresh button for total balance */}
              {/* 
              <IconButton onClick={fetchTotalNativeBalance} size="small" sx={{ ml: 0.5, color: '#a0cff9' }} disabled={loadingTotalNativeBalance}>
                <RefreshIcon fontSize="small" />
              </IconButton>
              */}
            </Box>
          </Tooltip>
        )}
        {/* Block Watcher Button */}
        <Button
          variant="contained"
          onClick={handleToggleBlockWatcher}
          disabled={!nodeStatus.connected && !isBlockWatcherActive}
          color={blockButtonColor}
          sx={commonButtonStyles}
        >
          {isLoadingBlockCount && isBlockWatcherActive ? <CircularProgress size={18} color="inherit" sx={{mr:0.5}}/> : null}
          {blockButtonText}
        </Button>
        {/* Mining Button with Thread Dropdown */}
        <Button
          variant="contained"
          onClick={e => setAnchorEl(e.currentTarget)}
          color={mining && miningThreads > 0 ? 'success' : 'warning'}
          sx={{ ...commonButtonStyles, ml: 1, minWidth: 120 }}
          endIcon={<ArrowDropDownIcon />}
          disabled={miningLoading || stakingLoading || !nodeStatus.connected}
        >
          {miningLoading ? <CircularProgress size={18} color="inherit" sx={{mr:0.5}}/> : null}
          Mining{mining && miningThreads > 0 ? ` (${miningThreads})` : ''}
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {miningThreadOptions.map(opt => (
            <MenuItem key={opt} selected={miningThreads === opt} onClick={() => handleMiningThreadSelect(opt)}>
              {opt === 0 ? 'Off' : opt}
            </MenuItem>
          ))}
        </Menu>
        {/* Staking Button */}
        <Button
          variant="contained"
          onClick={handleStakingToggle}
          color={staking ? 'success' : 'warning'}
          sx={{ ...commonButtonStyles, ml: 1, minWidth: 120 }}
          disabled={stakingLoading || miningLoading || !nodeStatus.connected}
        >
          {stakingLoading ? <CircularProgress size={18} color="inherit" sx={{mr:0.5}}/> : null}
          Stake
        </Button>
      </Box>
    </Box>
    <QuickSendModal open={isQuickSendModalOpen} onClose={() => setIsQuickSendModalOpen(false)} />
    <Dialog open={isGetTxModalOpen} onClose={() => setIsGetTxModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: '#232323', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Get Transaction</DialogTitle>
      <DialogContent sx={{ background: '#232323', color: '#fff' }}>
        <TextField
          label="Transaction ID"
          size="small"
          value={getTxId}
          onChange={e => setGetTxId(e.target.value)}
          sx={{ mb: 2, width: '100%' }}
          placeholder="Enter TxID"
          InputProps={{
            endAdornment: (
              <Tooltip title="Enter a transaction ID to fetch details">
                <span style={{ color: '#90caf9', cursor: 'help', fontSize: '1.1em' }}>?</span>
              </Tooltip>
            )
          }}
        />
        <FormControlLabel
          control={<Switch checked={getTxWatchonly} onChange={e => setGetTxWatchonly(e.target.checked)} color="primary" sx={{ transform: 'scale(0.7)' }} />}
          label={<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>Include Watchonly</Typography>}
          sx={{ mb: 2 }}
        />
        {getTxError && <Typography sx={{ color: '#ff6b6b', fontSize: '0.8rem', mb: 1 }}>{getTxError}</Typography>}
        {getTxLoading && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}><CircularProgress size={28} /></Box>}
        {getTxResult && !getTxLoading && (
          <Paper sx={{ p: 1, mt: 1, background: '#191919', borderRadius: 1, wordBreak: 'break-all', position: 'relative' }}>
            <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.8rem', mb: 0.5 }}>Result</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Amount:</b> {getTxResult.amount}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Confirmations:</b> {getTxResult.confirmations}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Block Hash:</b> {getTxResult.blockhash}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Block Index:</b> {getTxResult.blockindex}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Block Time:</b> {getTxResult.blocktime}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5, display: 'flex', alignItems: 'center' }}><b>TxID:</b>&nbsp;<span>{getTxResult.txid}</span>
              <Tooltip title={copiedTxField === 'txid' ? 'Copied!' : 'Copy TxID'}>
                <IconButton onClick={() => handleCopyTxField(getTxResult.txid, 'txid')} size="small" sx={{ ml: 1, color: copiedTxField === 'txid' ? '#90caf9' : '#aaa' }}>
                  <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Time:</b> {getTxResult.time}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.8rem', mb: 0.5 }}><b>Time Received:</b> {getTxResult.timereceived}</Typography>
            {/* Details Table */}
            {Array.isArray(getTxResult.details) && getTxResult.details.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.8rem', mb: 0.5 }}>Details</Typography>
                <TableContainer sx={{ background: 'transparent', maxHeight: 120 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#a0cff9', fontSize: '0.8rem', background: '#232323', borderBottom: '1px solid #333' }}>Address</TableCell>
                        <TableCell sx={{ color: '#a0cff9', fontSize: '0.8rem', background: '#232323', borderBottom: '1px solid #333' }}>Category</TableCell>
                        <TableCell sx={{ color: '#a0cff9', fontSize: '0.8rem', background: '#232323', borderBottom: '1px solid #333' }}>Amount</TableCell>
                        <TableCell sx={{ color: '#a0cff9', fontSize: '0.8rem', background: '#232323', borderBottom: '1px solid #333' }}>Vout</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getTxResult.details.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ color: '#fff', fontSize: '0.8rem' }}>{d.address}</TableCell>
                          <TableCell sx={{ color: '#fff', fontSize: '0.8rem' }}>{d.category}</TableCell>
                          <TableCell sx={{ color: '#fff', fontSize: '0.8rem' }}>{d.amount}</TableCell>
                          <TableCell sx={{ color: '#fff', fontSize: '0.8rem' }}>{d.vout}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            {/* Hex with copy */}
            {getTxResult.hex && (
              <Typography sx={{ color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', mt: 1 }}>
                <b>Raw Hex:</b>&nbsp;<span style={{wordBreak:'break-all'}}>{getTxResult.hex}</span>
                <Tooltip title={copiedTxField === 'hex' ? 'Copied!' : 'Copy Hex'}>
                  <IconButton onClick={() => handleCopyTxField(getTxResult.hex, 'hex')} size="small" sx={{ ml: 1, color: copiedTxField === 'hex' ? '#90caf9' : '#aaa' }}>
                    <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Tooltip>
              </Typography>
            )}
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ background: '#232323' }}>
        <Button onClick={() => setIsGetTxModalOpen(false)} color="inherit">Close</Button>
        <Button onClick={handleGetTransaction} color="primary" variant="contained" disabled={getTxLoading}>
          {getTxLoading ? <CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} /> : 'Fetch Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  </>
);
};

export default AppHeader; 