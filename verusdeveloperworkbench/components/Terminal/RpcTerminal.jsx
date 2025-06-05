import React, { useContext, useRef, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, Divider, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import { TerminalContext } from '../../contexts/TerminalContext'; // Adjust path as necessary
import { formatCliCommand, getCommandType } from '../../utils/commandHelper'; // Adjust path
import { electronService } from '../../services/electronService'; // Adjust path

const RpcTerminal = () => {
  const {
    terminalHistory,
    terminalFilter,
    setTerminalFilter,
    clearTerminalHistory
  } = useContext(TerminalContext);
  const endOfHistoryRef = useRef(null);

  const filteredHistory = terminalFilter
    ? terminalHistory.filter(entry => getCommandType(entry.method) === terminalFilter)
    : terminalHistory;

  // useEffect(() => {
  //   endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [filteredHistory]);

  const generateTextContent = () => {
    return filteredHistory.map(entry => {
      const commandString = entry.method ? formatCliCommand(entry.method, entry.params) : (entry.command || '');
      const resultString = entry.error 
        ? `ERROR: ${typeof entry.error === 'object' ? JSON.stringify(entry.error, null, 2) : String(entry.error)}` 
        : (typeof entry.result === 'object' ? JSON.stringify(entry.result, null, 2) : String(entry.result || ''));
      
      return [
        `Timestamp: ${entry.timestamp}`,
        `Command: ${commandString}`,
        `Result: ${resultString}`,
        '-----------------------------------'
      ].join('\n');
    }).join('\n\n');
  };

  const handleCopyEntry = (entry) => {
    const commandString = entry.method ? formatCliCommand(entry.method, entry.params) : (entry.command || '');
    const resultString = entry.error 
      ? `ERROR: ${typeof entry.error === 'object' ? JSON.stringify(entry.error, null, 2) : String(entry.error)}` 
      : (typeof entry.result === 'object' ? JSON.stringify(entry.result, null, 2) : String(entry.result || ''));
    const textToCopy = `Command: ${commandString}\n\nResult:\n${resultString}`;
    navigator.clipboard.writeText(textToCopy).catch(err => console.error('Failed to copy entry:', err));
  };

  const handleSaveTerminalContent = async () => {
    const textContent = generateTextContent();
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const defaultFileName = `verus-rpc-terminal-${timestamp}.txt`;
      
      const dialogResult = await electronService.ipcRenderer.invoke('showSaveDialog', {
        title: 'Save Terminal History',
        defaultPath: defaultFileName,
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (dialogResult.filePath) {
        await electronService.ipcRenderer.invoke('saveFile', dialogResult.filePath, textContent);
        console.log(`Terminal history saved to ${dialogResult.filePath}`);
      } else {
        console.log('Save terminal history cancelled.');
      }
    } catch (error) {
      console.error('Failed to save terminal history:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#232323', p:0, border: '1px solid #333', borderRadius:1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, backgroundColor: '#191919' }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>RPC Terminal</Typography>
        <Box sx={{display: 'flex', gap: 0.5}}>
          <IconButton onClick={handleSaveTerminalContent} size="small" title="Save Content">
            <SaveIcon fontSize="small" sx={{color: '#90caf9'}}/>
          </IconButton>
          <IconButton onClick={clearTerminalHistory} size="small" title="Clear Terminal">
            <ClearIcon fontSize="small" sx={{color: '#90caf9'}}/>
          </IconButton>
        </Box>
      </Box>
      <Select
        value={terminalFilter}
        onChange={(e) => setTerminalFilter(e.target.value)}
        size="small"
        fullWidth
        sx={{ fontSize: '12px', mb: 1, backgroundColor: '#181818' }}
        displayEmpty
      >
        <MenuItem value="">All Commands</MenuItem>
        <MenuItem value="identity">Identity Commands</MenuItem>
        <MenuItem value="crypto">Crypto Commands</MenuItem>
        <MenuItem value="query">Query Commands</MenuItem>
        <MenuItem value="vdxf">VDXF Commands</MenuItem>
        <MenuItem value="node">Node Commands</MenuItem>
        <MenuItem value="other">Other Commands</MenuItem>
      </Select>
      
      <Box sx={{ flex: 1, background: '#181818', borderRadius: 1, p: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px' }}>
        {filteredHistory.length === 0 ? (
          <Typography sx={{ color: '#bbb', fontSize: '13px', fontStyle: 'italic' }}>No RPC commands executed yet.</Typography>
        ) : (
          [...filteredHistory].reverse().map((entry, index) => (
            <Box key={`${entry.timestamp}-${index}`} sx={{ mb: 1.5, color: entry?.error ? '#f44336' : '#fff', borderBottom: '1px solid #2a2a2a', pb: 1, position: 'relative'}}>
              <IconButton 
                onClick={() => handleCopyEntry(entry)} 
                size="small" 
                title="Copy Command & Result"
                sx={{position: 'absolute', top: '4px', right: '4px', color: '#777', '&:hover': {color: '#90caf9'} }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ color: '#bbb', mb: 0.5, fontSize: '11px' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </Typography>
              <Typography sx={{ color: '#90caf9', mb: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {`> ${entry.method ? formatCliCommand(entry.method, entry.params) : (entry.command || '')}`}
              </Typography>
              <Box sx={{ 
                color: entry?.error ? '#f44336' : '#4caf50', 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                background: '#1c1c1c',
                padding: '6px',
                borderRadius: '3px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {entry?.error 
                  ? (typeof entry.error === 'object' ? `ERROR: ${JSON.stringify(entry.error, null, 2)}` : `ERROR: ${String(entry.error)}`)
                  : (typeof entry?.result === 'object' ? JSON.stringify(entry.result, null, 2) : String(entry?.result || ''))
                }
              </Box>
            </Box>
          ))
        )}
        <div ref={endOfHistoryRef} />
      </Box>
    </Box>
  );
};

export default RpcTerminal; 