import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useCurrencyDefinition } from '../../contexts/CurrencyDefinitionContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import { NodeContext } from '../../contexts/NodeContext';
import { TerminalContext } from '../../contexts/TerminalContext';
import Split from 'react-split';
import { useVerusRpc } from '../../hooks/useVerusRpc';
import { OperationContext } from '../../contexts/OperationContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

// Helper function to render complex values in clean format
const renderCleanValue = (value, indentLevel = 0) => {
  if (Array.isArray(value)) {
    return (
      <List dense disablePadding sx={{ pl: indentLevel * 2 }}>
        {value.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ display: 'block', py: 0.2 }}>
            {renderCleanValue(item, indentLevel + 1)}
          </ListItem>
        ))}
      </List>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <List dense disablePadding sx={{ pl: indentLevel * 2 }}>
        {Object.entries(value).map(([k, v]) => (
          <ListItem key={k} disableGutters sx={{ display: 'block', py: 0.2 }}>
            <Typography component="span" sx={{ fontSize: '0.75rem', color: '#a0cff9', fontWeight: '500' }}>{k}: </Typography>
            {renderCleanValue(v, indentLevel + 1)}
          </ListItem>
        ))}
      </List>
    );
  }
  return <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{String(value)}</Typography>;
};

const CurrencyDefinitionPreviewCM = () => {
  const { currencyDefinition } = useCurrencyDefinition();
  const { sendCommand } = useVerusRpc();
  const opCtx = useContext(OperationContext);
  const { addRpcCommandToHistory } = useContext(TerminalContext);
  const { addStagedCurrencyDefinition } = useContext(WorkbenchDataContext);

  const [isLaunching, setIsLaunching] = useState(false);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const generateCleanText = (obj) => {
    let text = '';
    const generateText = (currentObj, indent = '') => {
      for (const key in currentObj) {
        if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
          const value = currentObj[key];
          text += `${indent}${key}: `;
          if (typeof value === 'object' && value !== null) {
            text += '\n';
            generateText(value, indent + '  ');
          } else {
            text += `${String(value)}\n`;
          }
        }
      }
    }
    generateText(obj);
    return text;
  }

  const handleLaunchCurrency = async () => {
    if (!currencyDefinition || !currencyDefinition.name) {
      opCtx.setOperationError('Currency name is required to launch.');
      return;
    }
    if (!sendCommand) {
      opCtx.setOperationError('sendCommand function is not available.');
      return;
    }
    
    const defineCurrencyParams = { ...currencyDefinition };
    
    setIsLaunching(true);
    opCtx.setOperationError('');
    opCtx.setOperationResult(null);
    
    let cmdRecord = {
      command: `definecurrency (params below)`,
      params: defineCurrencyParams,
      type: 'definecurrency' 
    };

    try {
      if(addRpcCommandToHistory) addRpcCommandToHistory({...cmdRecord, status: 'executing'});
      
      const result = await sendCommand('definecurrency', [defineCurrencyParams]);
      
      if(addRpcCommandToHistory) addRpcCommandToHistory({...cmdRecord, result: result, status: 'success'});
      // opCtx.setOperationResult({ message: `DefineCurrency successful. TXID: ${result.txid || result.tx?.txid}`, data: result });

      // ** Add to Staged Currency Definitions **
      if (result && result.tx && result.tx.txid && result.hex) { // Check for result.hex (the complete raw tx)
        const defineTxid = result.tx.txid;
        const completeRawHex = result.hex; // Use the top-level hex for sendrawtransaction

        // No longer need to find specific vout hex for this purpose
        // const voutWithCurrencyDef = result.tx.vout.find(
        //   v => v.scriptPubKey && v.scriptPubKey.currencydefinition
        // );
        // let currencyDefinitionHex = null;
        // if (voutWithCurrencyDef && voutWithCurrencyDef.scriptPubKey && voutWithCurrencyDef.scriptPubKey.hex) {
        //   currencyDefinitionHex = voutWithCurrencyDef.scriptPubKey.hex;
        // }

        if (defineTxid && completeRawHex) {
          const newStagedDefinition = {
            inputParams: defineCurrencyParams,
            defineTxid: defineTxid,
            rawHex: completeRawHex // Store the complete transaction hex
          };
          addStagedCurrencyDefinition(newStagedDefinition);
          console.log('Staged currency definition added:', newStagedDefinition);
          opCtx.setOperationResult({ 
            message: `Currency ${defineCurrencyParams.name} defined (TXID: ${defineTxid}) and staged for launch. Raw TX hex captured.`,
            data: result 
          });
        } else {
          // This case should be less likely if result.hex is present with result.tx.txid
          console.error('[CurrencyDefinitionPreviewCM] Could not extract defineTxid or complete rawHex from definecurrency result even if tx and hex fields exist:', result);
          opCtx.setOperationError('Failed to extract necessary data from definecurrency result to stage it.');
        }
      } else {
        console.error('[CurrencyDefinitionPreviewCM] Invalid result structure from definecurrency (missing tx, tx.txid, or top-level hex):', result);
        opCtx.setOperationError('Received invalid result structure from definecurrency (missing tx, txid, or hex). Needed for staging.');
      }

    } catch (error) {
      console.error('Error launching currency:', error);
      const errorMsg = error.message || (typeof error === 'string' ? error : 'Unknown error during definecurrency');
      if(addRpcCommandToHistory) addRpcCommandToHistory({...cmdRecord, result: errorMsg, status: 'error'});
      opCtx.setOperationError(errorMsg);
    } finally {
      setIsLaunching(false);
    }
  };

  const isDefinitionValid = currencyDefinition && currencyDefinition.name;
  const rawJsonString = formatJson(currencyDefinition);
  const cleanTextString = generateCleanText(currencyDefinition);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p:0, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
          Currency Definition Preview
        </Typography>
      </Box>
      <Split 
        direction="vertical" 
        sizes={[50, 50]} 
        minSize={[100, 100]} 
        gutterSize={6}
        style={{ height: 'calc(100% - 40px)', width: '100%' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', p: 1.5, position: 'relative' }}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="subtitle2" sx={{ color: '#ccc', fontWeight: '500'}}>Readable Format:</Typography>
            <Tooltip title="Copy Readable Format">
              <IconButton size="small" onClick={() => handleCopyToClipboard(cleanTextString)} sx={{ color: '#90caf9'}}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Paper 
            elevation={0} 
            sx={{ p: 1.5, bgcolor: '#1a1a1a', color: '#e0e0e0', flexGrow: 1, overflow: 'auto', borderRadius: 1, border: '1px solid #333' }}
          >
            {Object.keys(currencyDefinition).length > 0 ? (
              <List dense disablePadding>
                {Object.entries(currencyDefinition).map(([key, value]) => (
                  <ListItem key={key} disableGutters sx={{ display: 'block', borderBottom: '1px solid #282828', py:0.5, '&:last-child': {borderBottom: 'none'} }}>
                    <Typography component="span" sx={{ fontSize: '0.8rem', color: '#90caf9', fontWeight: 'bold' }}>{key}: </Typography>
                    {renderCleanValue(value)}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>
                Configure parameters to see a readable preview.
              </Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', p: 1.5, position: 'relative' }}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="subtitle2" sx={{ color: '#ccc', fontWeight: '500'}}>JSON Format (for command):</Typography>
            <Tooltip title="Copy JSON">
              <IconButton size="small" onClick={() => handleCopyToClipboard(rawJsonString)} sx={{ color: '#90caf9'}}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Paper 
            elevation={0} 
            sx={{ p: 1.5, bgcolor: '#1a1a1a', color: '#e0e0e0', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', flexGrow: 1, overflow: 'auto', borderRadius: 1, border: '1px solid #333' }}
          >
            {Object.keys(currencyDefinition).length > 0 ? rawJsonString : (
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>
                Configure parameters to see the JSON preview.
              </Typography>
            )}
          </Paper>
          <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #444' }}>
          <Button 
              fullWidth 
            variant="contained" 
            color="primary" 
            onClick={handleLaunchCurrency}
              disabled={!isDefinitionValid || isLaunching}
              startIcon={isLaunching ? <CircularProgress size={20} color="inherit"/> : <LaunchIcon />}
          >
              {isLaunching ? 'Launching...' : 'Launch Command'}
          </Button>
          </Box>
        </Box>
      </Split>
    </Box>
  );
};

export default CurrencyDefinitionPreviewCM; 