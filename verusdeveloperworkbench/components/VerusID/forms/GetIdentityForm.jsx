import React, { useState, useContext } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert, 
  Switch, FormControlLabel, Divider, Tooltip, IconButton, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useVerusRpc } from '../../../hooks/useVerusRpc';
import { OperationContext } from '../../../contexts/OperationContext';
import { NodeContext } from '../../../contexts/NodeContext';
import FormattedResultDisplay from './common/FormattedResultDisplay';

// Helper component for displaying key-value pairs with copy button
const DetailItem = ({ label, value, isMonospace = true, breakAll = true }) => {
  if (value === undefined || value === null) return null; 

  const handleCopy = (val) => {
      const stringVal = Array.isArray(val) ? val.join(', ') : String(val);
      navigator.clipboard.writeText(stringVal);
  };

  // Determine if value is copyable (string or array)
  const isCopyable = typeof value === 'string' || Array.isArray(value);
  const displayValue = Array.isArray(value) ? value.join(', \n') : String(value);

  return (
    <Box sx={{ mt: 0.5, mb: 0.5 }}>
      <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>{label}:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Typography sx={{ 
              fontSize: '12px', 
              color: '#ddd', 
              wordBreak: breakAll ? 'break-all' : 'normal', 
              fontFamily: isMonospace ? 'monospace' : 'inherit',
              whiteSpace: 'pre-wrap', // Ensure newlines from join are respected
              flexGrow: 1, // Allow text to take available space
              mr: 0.5 // Add margin before copy icon
          }}>
            {displayValue}
      </Typography>
          {isCopyable && displayValue && (
              <Tooltip title={`Copy ${label}`}>
                  <IconButton onClick={() => handleCopy(value)} size="small" sx={{ p: 0.1, flexShrink: 0 /* Prevent icon shrinking */ }}>
                      <ContentCopyIcon sx={{fontSize: '1rem'}} />
                  </IconButton>
              </Tooltip>
          )}
      </Box>
    </Box>
  );
};

// Helper function to render contentmap entries
const renderContentMap = (contentmap, handleCopy) => {
  if (!contentmap || Object.keys(contentmap).length === 0) return null;

  return (
    <Accordion sx={{ background: '#1c1c1c' }} disableGutters elevation={0} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Typography sx={{ fontSize: '13px', color: '#90caf9', fontWeight: 600 }}>
          Content Map ({Object.keys(contentmap).length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '350px', overflowY: 'auto' }}>
        {Object.entries(contentmap).map(([vdxfhash, value]) => (
          <Box key={vdxfhash} sx={{ mb: 1, borderBottom: '1px solid #2a2a2a', pb: 0.5, '&:last-child': {borderBottom:0, pb:0, mb:0} }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#90caf9', fontWeight: 700, fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.1, flexGrow:1, mr:0.5 }}>
                VDXF Hash: {vdxfhash}
              </Typography>
              <Tooltip title={`Copy Hash: ${vdxfhash}`}>
                <IconButton onClick={() => handleCopy(vdxfhash)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
                  <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ml: '16px' }}>
              <Typography sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.1, wordBreak:'break-all', flexGrow:1, mr:0.5 }}>
                Value: {String(value)}
              </Typography>
              <Tooltip title={`Copy Value: ${value}`}>
                <IconButton onClick={() => handleCopy(value)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
                  <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

// Helper function to render contentmultimap entries
const renderContentMultiMap = (contentmultimap, handleCopy) => {
  if (!contentmultimap || Object.keys(contentmultimap).length === 0) return null;

  // Helper for nested contentmultimap entries
  const renderContentMultiMapEntry = (entry, indent = 0) => {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      Object.keys(entry).length === 1 &&
      typeof Object.values(entry)[0] === 'object'
    ) {
      const nestedKey = Object.keys(entry)[0];
      const data = Object.values(entry)[0];
      return (
        <Box sx={{ mb: 1, p: 0, background: 'none', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#90caf9', fontWeight: 700, fontSize: '11px', fontFamily: 'monospace', mb: 0.25, lineHeight: 1.1, flexGrow: 1, mr: 0.5 }}>
              Nested VDXF Key: {nestedKey}
            </Typography>
            <Tooltip title={`Copy Nested Key: ${nestedKey}`}>
              <IconButton onClick={() => handleCopy(nestedKey)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
                <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
              </IconButton>
            </Tooltip>
          </Box>
          <ul style={{ margin: 0, padding: `0 0 0 ${indent + 8}px`, listStyle: 'none' }}>
            {data.version !== undefined && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}><span style={{ minWidth: 90, fontWeight: 700 }}>Version:</span><span>{data.version}</span></li>
            )}
            {data.flags !== undefined && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}><span style={{ minWidth: 90, fontWeight: 700 }}>Flags:</span><span>{data.flags}</span></li>
            )}
            {data.mimetype && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}><span style={{ minWidth: 90, fontWeight: 700 }}>MIME Type:</span><span>{data.mimetype}</span></li>
            )}
            {data.objectdata && data.objectdata.message && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}><span style={{ minWidth: 90, fontWeight: 700 }}>Message:</span><span>{data.objectdata.message}</span></li>
            )}
            {Object.entries(data).map(([key, value]) => {
              if (["version", "flags", "mimetype", "objectdata"].includes(key)) return null;
              return (
                <li key={key} style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}>
                  <span style={{ minWidth: 90, fontWeight: 700 }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </li>
              );
            })}
          </ul>
        </Box>
      );
    }
    if (Array.isArray(entry)) {
      return (
        <Box>
          {entry.map((item, idx) => (
            <div key={idx}>{renderContentMultiMapEntry(item, indent + 16)}</div>
          ))}
        </Box>
      );
    }
    if (typeof entry === 'object' && entry !== null) {
      return (
        <ul style={{ marginLeft: indent + 16, padding: 0, listStyle: 'none' }}>
          {Object.entries(entry).map(([key, value], idx) => (
            <li key={idx} style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}>
              <span style={{ minWidth: 90, fontWeight: 700 }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
              <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <Typography component="span" sx={{ fontSize: '11px', lineHeight: 1.1 }}>{String(entry)}</Typography>;
  };

  return (
    <Accordion sx={{ background: '#1c1c1c' }} disableGutters elevation={0} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Typography sx={{ fontSize: '13px', color: '#90caf9', fontWeight: 600 }}>
          Content MultiMap ({Object.keys(contentmultimap).length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '350px', overflowY: 'auto' }}>
        {Object.entries(contentmultimap).map(([primaryKey, entries]) => (
          <Box key={primaryKey} sx={{ mb: 0.5, p: 1, background: '#232323', borderRadius: 1 }}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Typography sx={{ color: '#90caf9', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', mb: 0.5, flexGrow:1, mr:0.5 }}>
                Primary VDXF Key: {primaryKey}
              </Typography>
              <Tooltip title={`Copy Primary Key: ${primaryKey}`}>
                <IconButton onClick={() => handleCopy(primaryKey)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
                  <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
                </IconButton>
              </Tooltip>
            </Box>
            {Array.isArray(entries) && entries.length > 0 ? (
              entries.map((entry, idx) => (
                <Box key={idx} sx={{ mt: 0.25, mb: 0.25, pt: 0.25, pb: 0.25, px: 0.5, background: '#181818', borderRadius: 1 }}>
                  {renderContentMultiMapEntry(entry, 0)}
                </Box>
              ))
            ) : (
              <Typography sx={{ color: '#bbb', fontSize: '12px' }}>No entries for this key.</Typography>
            )}
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const GetIdentityForm = () => {
  const [identityNameOrId, setIdentityNameOrId] = useState('');
  const [height, setHeight] = useState('');
  const [txProofs, setTxProofs] = useState(false);
  const [txProofHeight, setTxProofHeight] = useState('');

  const { sendCommand } = useVerusRpc();
  const opCtx = useContext(OperationContext);
  const { nodeStatus } = useContext(NodeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    opCtx.setOperationLoading(true);
    opCtx.setOperationError('');
    opCtx.setOperationResult(null);

    if (!identityNameOrId.trim()) {
      opCtx.setOperationError('Identity Name or ID is required.');
      opCtx.setOperationLoading(false);
      return;
    }
    
    let identityParam = identityNameOrId.trim();
    if (!identityParam.startsWith('i-') && !identityParam.endsWith('@')) {
      identityParam = `${identityParam}@`;
    }

    const params = [identityParam];
    if (height.trim()) params.push(parseInt(height, 10));
    // Only add txproofs if true or if txproofheight is also set
    if (txProofs || txProofHeight.trim()) {
        params.push(txProofs); // Add txproofs (true or false)
        if (txProofHeight.trim()) {
            params.push(parseInt(txProofHeight, 10));
        } else if (txProofs) {
            // If txProofs is true but txProofHeight is empty, some APIs might expect a default like 0 or current height.
            // For getidentity, if txproofs is true and txproofheight is omitted, it defaults to 'height'.
            // If height is also omitted, it defaults to current chain height.
            // So, omitting it if empty and txProofs is true is fine.
        }
    }

    try {
      await sendCommand('getidentity', params, 'query');
    } catch (err) {
      console.error('Error in GetIdentityForm:', err);
      // Error is already set in OperationContext by useVerusRpc hook
    }
  };

  return (
    <Paper sx={{ p: 2, background: '#1e1e1e', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Get Identity Details</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Identity Name or ID *"
          value={identityNameOrId}
          onChange={(e) => setIdentityNameOrId(e.target.value)}
          placeholder="Enter i-address or name@ (e.g., VerusID@ or iXXXX...)"
          required
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Block height for query (optional)"
          type="number"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Switch checked={txProofs} onChange={(e) => setTxProofs(e.target.checked)} />}
          label="Include Transaction Proofs"
          sx={{ mb: 1, color: 'text.secondary' }}
        />
        {txProofs && (
          <TextField
            label="Transaction Proof Height"
            value={txProofHeight}
            onChange={(e) => setTxProofHeight(e.target.value)}
            placeholder="Height for proofs (optional, defaults to 'Height')"
            type="number"
            fullWidth
            size="small"
            sx={{ mb: 2, mt: 1}}
          />
        )}
        <Button type="submit" variant="contained" disabled={opCtx.operationLoading || !nodeStatus?.connected} sx={{ minWidth: 120 }}>
            {opCtx.operationLoading ? <CircularProgress size={24} /> : 'Get Identity'}
          </Button>
      </form>

      {/* Display formatted identity results using the shared component */}
      {opCtx.operationResult && !opCtx.operationLoading && (
        <FormattedResultDisplay result={opCtx.operationResult} title="Identity Information" />
      )}
    </Paper>
  );
};

export default GetIdentityForm; 