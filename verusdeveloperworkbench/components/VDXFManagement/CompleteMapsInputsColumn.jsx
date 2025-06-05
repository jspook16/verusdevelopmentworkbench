import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, CircularProgress, Paper, Select, MenuItem, FormControl, InputLabel, Divider, TextField, Button, Switch, FormGroup, FormControlLabel, Grid, List, ListItem, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';

// Helper function to handle copying text
const handleCopy = (textToCopy) => {
  if (textToCopy === undefined || textToCopy === null) return;
  navigator.clipboard.writeText(String(textToCopy));
};

// Helper function to render VDXF object data (recursive for objectdata)
const renderVdxfObjectDataRecursive = (dataObject, indentLevel = 0) => {
  if (typeof dataObject !== 'object' || dataObject === null) {
    return <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd'}}>{String(dataObject)}</Typography>;
  }
  return (
    <List dense disablePadding sx={{ pl: indentLevel * 1 }}>
      {Object.entries(dataObject).map(([key, value]) => {
        const labelTypography = <Typography component="span" sx={{ fontSize: '0.7rem', color: '#a0cff9', fontWeight: '500' }}>{key}: </Typography>;
        if (key === 'objectdata' && typeof value === 'object' && value !== null) {
          return (
            <ListItem key={key} disableGutters sx={{ display: 'block' }}>
              {labelTypography}
              {renderVdxfObjectDataRecursive(value, indentLevel + 1)}
            </ListItem>
          );
        }
        return (
          <ListItem key={key} disableGutters sx={{ display: 'block' }}>
            {labelTypography}
            <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)}
            </Typography>
          </ListItem>
        );
      })}
    </List>
  );
};

// Adapted from VerusIdDetails.jsx/StatesOfMyMapsColumn.jsx for compact ContentMultiMap display
const renderCompactMultiMapEntry = (entry, indent = 0, handleCopyFn) => { // Renamed prop to handleCopyFn to avoid conflict if handleCopy is in scope
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
          <Typography sx={{ color: '#a0cff9', fontWeight: '500', fontSize: '0.7rem', fontFamily: 'monospace', lineHeight: 1.2, flexGrow: 1, mr: 0.5 }}>
            Nested VDXF Key: {nestedKey}
          </Typography>
          <Tooltip title={`Copy Nested Key: ${nestedKey}`}>
            <IconButton onClick={() => handleCopyFn(nestedKey)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
              <ContentCopyIcon sx={{fontSize: '0.8rem'}}/>
            </IconButton>
          </Tooltip>
        </Box>
        <ul style={{ margin: `0 0 0 ${indent + 8}px`, padding: 0, listStyle: 'none' }}>
          {Object.entries(data).map(([fieldKey, fieldValue]) => {
            let displayValue = fieldValue;
            if (fieldKey === 'objectdata' && typeof fieldValue === 'object' && fieldValue !== null) {
                displayValue = fieldValue.message ? fieldValue.message : JSON.stringify(fieldValue);
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                displayValue = JSON.stringify(fieldValue);
            }
            return (
              <li key={fieldKey} style={{ display: 'flex', fontSize: '0.7rem', lineHeight: 1.2, color: '#ccc' }}>
                <span style={{ minWidth: 70, fontWeight: '500', color: '#bbb' }}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}:</span>
                <span style={{wordBreak:'break-all'}}>{String(displayValue)}</span>
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
          <div key={idx}>{renderCompactMultiMapEntry(item, indent + 16, handleCopyFn)}</div>
        ))}
      </Box>
    );
  }
  return <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd' }}>{JSON.stringify(entry)}</Typography>;
};

const CompleteMapsInputsColumn = () => {
  const { selectedIdentityForVDXF } = useContext(IdentityContext);
  const { nodeStatus, sendCommand } = useContext(NodeContext);

  // Form State for getidentitycontent parameters
  const [heightStart, setHeightStart] = useState(0);
  const [heightEnd, setHeightEnd] = useState(0);
  const [txProofs, setTxProofs] = useState(false);
  const [txProofHeight, setTxProofHeight] = useState(0);
  const [vdxfKeyFilter, setVdxfKeyFilter] = useState('');
  const [keepDeleted, setKeepDeleted] = useState(false);

  // Data State
  const [identityContent, setIdentityContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(null);

  const executeGetIdentityContent = async () => {
    // Log current state when function is called by button click
    console.log('[CompleteMapsInputsColumn] executeGetIdentityContent called by button.');
    console.log('[CompleteMapsInputsColumn] Current selectedIdentityForVDXF:', selectedIdentityForVDXF);
    console.log('[CompleteMapsInputsColumn] Current nodeStatus.connected:', nodeStatus.connected);
    console.log('[CompleteMapsInputsColumn] Current typeof sendCommand:', typeof sendCommand);

    if (!selectedIdentityForVDXF || !nodeStatus.connected || typeof sendCommand !== 'function') {
      const errorMsg = 'Prerequisites not met: Select an ID from the first column and ensure node is connected.';
      console.error('[CompleteMapsInputsColumn] Prerequisites check failed:', errorMsg);
      setContentError(errorMsg);
      setIdentityContent(null);
      return;
    }
    setLoadingContent(true);
    setContentError(null);
    setIdentityContent(null);

    const params = [selectedIdentityForVDXF]; // Name or i-address is first param
    const options = {};
    if (heightStart > 0) options.heightstart = Number(heightStart);
    if (heightEnd > 0) options.heightend = Number(heightEnd);
    if (txProofs) {
      options.txproofs = true;
      if (txProofHeight > 0) options.txproofheight = Number(txProofHeight);
      // If txproofs is true but txproofheight is 0, the daemon uses a default (current height or value of heightend)
    } else {
      // Ensure txproofheight is not sent if txproofs is false, or send 0 if API expects it
      // options.txproofheight = 0; // Depending on API strictness
    }
    if (vdxfKeyFilter.trim()) options.vdxfkey = vdxfKeyFilter.trim();
    if (keepDeleted) options.keepdeleted = true;

    // Only add the options object if it has keys
    if (Object.keys(options).length > 0) {
      params.push(options);
    } else {
      // If no options, the API might expect specific nulls or empty objects for subsequent optional params
      // For getidentitycontent, usually just sending the name is enough for default behavior.
      // Based on getidentitycontent.md, if no other params, just [name] is fine for all defaults.
      // If other params are to be skipped and later ones used, nulls are needed.
    }

    try {
      console.log("[CompleteMapsInputsColumn] Fetching getidentitycontent with params:", params);
      const result = await sendCommand('getidentitycontent', params);
      if (result && result.identity) {
        setIdentityContent(result);
      } else if (result && result.error) {
        setContentError(result.error.message || JSON.stringify(result.error));
      } else {
        setContentError('Failed to fetch identity content or empty response.');
      }
    } catch (err) {
      setContentError(err.message || 'An exception occurred');
    } finally {
      setLoadingContent(false);
    }
  };
  
  // Effect to auto-fetch when ID changes and form params are at default (or fetch on form submit)
  useEffect(() => {
    console.log("[CompleteMapsInputsColumn] useEffect for ID change. selectedIdentityForVDXF:", selectedIdentityForVDXF);
    if (selectedIdentityForVDXF && 
        heightStart === 0 && heightEnd === 0 && !txProofs && 
        txProofHeight === 0 && vdxfKeyFilter === '' && !keepDeleted &&
        nodeStatus.connected && typeof sendCommand === 'function') { // Also check sendCommand here
      console.log("[CompleteMapsInputsColumn] Auto-fetching content due to ID change and default params.");
      executeGetIdentityContent();
    } else if (selectedIdentityForVDXF) {
        console.log("[CompleteMapsInputsColumn] ID selected, but form params are not default or other conditions not met for auto-fetch.");
        // Clear previous results if ID changed but not auto-fetching
        // setIdentityContent(null); setContentError(null); // Or let user manually fetch
    } else {
        setIdentityContent(null); setContentError(null); // Clear if no ID selected
    }
  }, [selectedIdentityForVDXF, nodeStatus.connected, sendCommand]); // Add sendCommand to deps here for auto-fetch correctness

  // Ensure handleCopy is defined in this scope if not already global to the file
  const localHandleCopy = (textToCopy) => {
    if (textToCopy === undefined || textToCopy === null) return;
    navigator.clipboard.writeText(String(textToCopy));
  };

  const renderMapData = (mapData, mapType) => {
    if (!mapData) {
      return <Typography sx={{color: '#888', fontSize: '0.8rem'}}>No {mapType} data available.</Typography>;
    }
    if (Object.keys(mapData).length === 0) {
      return <Typography sx={{color: '#888', fontSize: '0.8rem'}}>Empty {mapType}.</Typography>;
    }

    return (
      <Box>
        {mapType === 'ContentMap' && (
          <List dense disablePadding>
            {Object.entries(mapData).map(([key, value]) => (
              <ListItem key={key} disableGutters sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb: 0.5, borderBottom: '1px solid #383838', pb: 0.5}} >
                <Box sx={{flexGrow:1, mr:1}}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#90caf9', fontWeight: 'bold', wordBreak:'break-all' }}>{key}:</Typography>
                  <Typography component="div" sx={{ fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all', pl:1 }}>
                    {typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)}
                  </Typography>
                </Box>
                <Tooltip title={`Copy Value`}>
                  <IconButton onClick={() => handleCopy(String(value))} size="small" sx={{p:0.1, mt:0.5, mr: 1}}> <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        )}

        {mapType === 'ContentMultiMap' && (
          <List dense disablePadding>
            {Object.entries(mapData).map(([primaryKey, entriesArray]) => (
              <ListItem key={primaryKey} disableGutters sx={{display:'block', mb: 1, borderBottom: '1px solid #383838', pb: 0.5}}>
                <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', mb:0.5}}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#90caf9', fontWeight: 'bold' }}>{primaryKey}:</Typography>
                  <Tooltip title={`Copy Primary Key: ${primaryKey}`}>
                    <IconButton onClick={() => localHandleCopy(primaryKey)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}> 
                      <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> 
                    </IconButton>
                  </Tooltip>
                </Box>
                {Array.isArray(entriesArray) && entriesArray.map((entryItem, index) => (
                  <Box key={index} sx={{ pl: 1, mb: 0.5, borderLeft: '2px solid #444', ml:0.5, background: '#232323', p:0.5, borderRadius: '4px' }}>
                    {renderCompactMultiMapEntry(entryItem, 0, localHandleCopy)} {/* Use new compact renderer and pass localHandleCopy */}
                  </Box>
                ))}
                {(!Array.isArray(entriesArray) || entriesArray.length === 0) && (
                  <Typography sx={{color: '#888', fontSize: '0.75rem', pl:1.5}}>No nested entries for this key.</Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0, background:'#232323', borderRadius:1 }}>
      <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0, mb:0.5 }}>
        Complete Maps Inputs
      </Typography>
      {/* Parameter Form */}
      <Paper elevation={0} sx={{ p: 1.5, background: '#2c2c2c', borderRadius:0, flexShrink:0}}> 
        <Grid container spacing={1.5}>
          <Grid item xs={6} sm={3}><TextField label="Height Start" type="number" value={heightStart} onChange={e => setHeightStart(e.target.value)} size="small" fullWidth InputLabelProps={{shrink: true}}/></Grid>
          <Grid item xs={6} sm={3}><TextField label="Height End" type="number" value={heightEnd} onChange={e => setHeightEnd(e.target.value)} size="small" fullWidth InputLabelProps={{shrink: true}}/></Grid>
          <Grid item xs={6} sm={3}><TextField label="TX Proof Height" type="number" value={txProofHeight} onChange={e => setTxProofHeight(e.target.value)} size="small" fullWidth InputLabelProps={{shrink: true}} disabled={!txProofs}/></Grid>
          <Grid item xs={12} sm={3}><TextField label="VDXF Key Filter" value={vdxfKeyFilter} onChange={e => setVdxfKeyFilter(e.target.value)} size="small" fullWidth InputLabelProps={{shrink: true}}/></Grid>
          <Grid item xs={6} sm={3}><FormControlLabel control={<Switch checked={txProofs} onChange={e => setTxProofs(e.target.checked)} />} label="TX Proofs" sx={{color:'#ccc'}}/></Grid>
          <Grid item xs={6} sm={3}><FormControlLabel control={<Switch checked={keepDeleted} onChange={e => setKeepDeleted(e.target.checked)} />} label="Keep Deleted" sx={{color:'#ccc'}}/></Grid>
          <Grid item xs={12} sm={6} sx={{display:'flex', justifyContent:'flex-end'}}><Button variant="contained" onClick={executeGetIdentityContent} disabled={loadingContent || !selectedIdentityForVDXF}>Fetch Content</Button></Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 1, gap: 1, overflow: 'hidden' }}>
        {/* Top Sub-window: Complete Content Map */}
        <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, overflow: 'hidden', background: '#282828' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>Complete Content Map</Typography>
          <Box sx={{overflowY: 'auto', flexGrow:1, mt:1}}>
            {loadingContent && <CircularProgress size={20}/>}
            {contentError && <Typography sx={{color:'#ff6b6b', fontSize: '0.8rem'}}>Error: {contentError}</Typography>}
            {identityContent?.identity?.contentmap ? renderMapData(identityContent.identity.contentmap, 'ContentMap') : 
              (!loadingContent && !contentError && selectedIdentityForVDXF && <Typography sx={{color: '#888', fontSize: '0.8rem'}}>No ContentMap data or not fetched.</Typography>)}
          </Box>
        </Paper>
        <Divider sx={{bgcolor: '#444'}}/>
        {/* Bottom Sub-window: Complete Content MultiMap */}
        <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, overflow: 'hidden', background: '#282828' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>Complete Content MultiMap</Typography>
          <Box sx={{overflowY: 'auto', flexGrow:1, mt:1}}>
            {loadingContent && <CircularProgress size={20}/>}
            {contentError && <Typography sx={{color:'#ff6b6b', fontSize: '0.8rem'}}>Error: {contentError}</Typography>}
            {identityContent?.identity?.contentmultimap ? renderMapData(identityContent.identity.contentmultimap, 'ContentMultiMap') : 
              (!loadingContent && !contentError && selectedIdentityForVDXF && <Typography sx={{color: '#888', fontSize: '0.8rem'}}>No ContentMultiMap data or not fetched.</Typography>)}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CompleteMapsInputsColumn; 