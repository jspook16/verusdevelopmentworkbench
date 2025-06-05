import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, CircularProgress, Paper, Select, MenuItem, FormControl, InputLabel, Divider, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';

// Helper function to render VDXF object data (recursive for objectdata)
const renderVdxfObjectData = (dataObject, indentLevel = 0, handleCopy) => {
  if (typeof dataObject !== 'object' || dataObject === null) {
    return <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd'}}>{String(dataObject)}</Typography>;
  }
  return (
    <List dense disablePadding sx={{ pl: indentLevel * 1 }}> {/* Adjusted indent factor */}
      {Object.entries(dataObject).map(([key, value]) => {
        const labelTypography = <Typography component="span" sx={{ fontSize: '0.7rem', color: '#a0cff9', fontWeight: '500' }}>{key}: </Typography>;
        if (key === 'objectdata' && typeof value === 'object' && value !== null) {
          return (
            <ListItem key={key} disableGutters sx={{ display: 'block' }}>
              {labelTypography}
              {renderVdxfObjectData(value, indentLevel + 1, handleCopy)} 
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

// Adapted from VerusIdDetails.jsx for compact ContentMultiMap display
const renderCompactMultiMapEntry = (entry, indent = 0, handleCopy) => {
  if (
    typeof entry === 'object' &&
    entry !== null &&
    Object.keys(entry).length === 1 &&
    typeof Object.values(entry)[0] === 'object'
  ) {
    const nestedKey = Object.keys(entry)[0];
    const data = Object.values(entry)[0]; // This is the VDXF object (version, flags, etc.)
    return (
      <Box sx={{ mb: 1, p: 0, background: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ color: '#a0cff9', /* Adjusted color for VDXF context */ fontWeight: '500', fontSize: '0.7rem', fontFamily: 'monospace', lineHeight: 1.2, flexGrow: 1, mr: 0.5 }}>
            Nested VDXF Key: {nestedKey}
          </Typography>
          <Tooltip title={`Copy Nested Key: ${nestedKey}`}>
            <IconButton onClick={() => handleCopy(nestedKey)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
              <ContentCopyIcon sx={{fontSize: '0.8rem'}}/>
            </IconButton>
          </Tooltip>
        </Box>
        <ul style={{ margin: `0 0 0 ${indent + 8}px`, padding: 0, listStyle: 'none' }}>
          {/* Render VDXF object fields (version, flags, mimetype, objectdata, etc.) */}
          {Object.entries(data).map(([fieldKey, fieldValue]) => {
             // Exclude 'objectdata' if you want to render its sub-fields specially or just stringify it.
            // For now, let's stringify complex objects within objectdata for simplicity here, or expand renderVdxfObjectData
            let displayValue = fieldValue;
            if (fieldKey === 'objectdata' && typeof fieldValue === 'object' && fieldValue !== null) {
                // Example: display a specific subfield or stringify. For consistency with original, might need more detail.
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
  // Fallback for unexpected entry structures, though primary use is for the specific nested key object.
  if (Array.isArray(entry)) {
    return (
      <Box>
        {entry.map((item, idx) => (
          <div key={idx}>{renderCompactMultiMapEntry(item, indent + 16, handleCopy)}</div> 
        ))}
      </Box>
    );
  }
  return <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd' }}>{JSON.stringify(entry)}</Typography>; // Fallback for other types
};

const StatesOfMyMapsColumn = () => {
  const { 
    selectedIdentityForVDXF, 
    identityHistoryForVDXF, 
    loadingHistoryForVDXF, 
    errorHistoryForVDXF 
  } = useContext(IdentityContext);
  const { nodeStatus } = useContext(NodeContext); 

  const [selectedContentMapIndex, setSelectedContentMapIndex] = useState(0);
  const [selectedMultiMapIndex, setSelectedMultiMapIndex] = useState(0);

  useEffect(() => {
    console.log("[StatesOfMyMapsColumn] History data changed, resetting indices. Length:", identityHistoryForVDXF.length);
    setSelectedContentMapIndex(0);
    setSelectedMultiMapIndex(0);
  }, [identityHistoryForVDXF]);

  const currentContentMapEntryObject = identityHistoryForVDXF[selectedContentMapIndex] || null;
  const currentMultiMapEntryObject = identityHistoryForVDXF[selectedMultiMapIndex] || null;

  const handleCopy = (textToCopy) => {
    if (textToCopy === undefined || textToCopy === null) return;
    navigator.clipboard.writeText(String(textToCopy));
  };

  const renderHistorySelector = (value, onChange, historyArray, label) => {
    if (!selectedIdentityForVDXF) {
        return <Typography sx={{color: '#888', fontSize: '0.8rem', mb:1}}>Select an identity to see versions.</Typography>;
    }
    if (loadingHistoryForVDXF) return <CircularProgress size={20} sx={{my:1}}/>;
    if (errorHistoryForVDXF) return <Typography sx={{color: '#ff6b6b', fontSize: '0.8rem', mb:1}}>Error: {errorHistoryForVDXF}</Typography>;
    if (historyArray.length === 0) {
        return <Typography sx={{color: '#888', fontSize: '0.8rem', mb:1}}>No history entries found for this identity.</Typography>;
    }
    return (
      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
        <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
        <Select
          labelId={`${label}-select-label`}
          value={value}
          label={label}
          onChange={(e) => onChange(e.target.value)}
          disabled={historyArray.length === 0}
        >
          {historyArray.map((entry, index) => {
            const blockHeight = entry.height;
            return (
              <MenuItem key={index} value={index}>
                {`Block: ${blockHeight}`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  const renderMapData = (historyEntryObject, mapType) => {
    if (!historyEntryObject || !historyEntryObject.identity) {
      return <Typography sx={{color: '#888', fontSize: '0.8rem'}}>No version selected or data missing.</Typography>;
    }
    
    const identityData = historyEntryObject.identity;
    const mapData = mapType === 'ContentMap' ? identityData.contentmap : identityData.contentmultimap;
    const txid = historyEntryObject.output?.txid;

    const txidDisplay = txid ? (
      <Box mb={1.5}>
        <Typography variant="caption" sx={{ color: '#aaa', display:'block'}}>Transaction ID:</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#ccc', wordBreak: 'break-all'}}>{txid}</Typography>
      </Box>
    ) : null;

    if (!mapData) {
      return ( <Box>{txidDisplay}<Typography sx={{color: '#888', fontSize: '0.8rem'}}>No {mapType} data for this identity version.</Typography></Box> );
    }
    if (Object.keys(mapData).length === 0 && mapType === 'ContentMap') {
      return ( <Box>{txidDisplay}<Typography sx={{color: '#888', fontSize: '0.8rem'}}>Empty {mapType} for this identity version.</Typography></Box> );
    }
    if (Object.keys(mapData).length === 0 && mapType === 'ContentMultiMap') {
      return ( <Box>{txidDisplay}<Typography sx={{color: '#888', fontSize: '0.8rem'}}>Empty {mapType} for this identity version.</Typography></Box> );
    }

    if (mapType === 'ContentMultiMap') {
      return (
        <Box>
          {txidDisplay}
          <List dense disablePadding>
            {Object.entries(mapData).map(([primaryKey, entriesArray]) => (
              <ListItem key={primaryKey} disableGutters sx={{display:'block', mb: 1, borderBottom: '1px solid #383838', pb: 0.5}}>
                <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', mb:0.5}}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#90caf9', fontWeight: 'bold'}}>{primaryKey}:</Typography>
                  <Tooltip title={`Copy Primary Key: ${primaryKey}`}>
                    <IconButton onClick={() => handleCopy(primaryKey)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}> 
                      <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> 
                    </IconButton>
                  </Tooltip>
                </Box>
                {Array.isArray(entriesArray) && entriesArray.map((entryItem, index) => (
                  <Box key={index} sx={{ pl: 1, mb: 0.5, borderLeft: '2px solid #444', ml:0.5, background: '#232323', p:0.5, borderRadius: '4px' }}>
                    {renderCompactMultiMapEntry(entryItem, 0, handleCopy)} {/* Use the new compact renderer */}
                  </Box>
                ))}
                {(!Array.isArray(entriesArray) || entriesArray.length === 0) && (
                  <Typography sx={{color: '#888', fontSize: '0.75rem', pl:1.5}}>No nested entries for this key.</Typography>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }

    return (
      <Box>
        {txidDisplay}
        {mapType === 'ContentMap' && (
          <List dense disablePadding>
            {Object.entries(mapData).map(([key, value]) => (
              <ListItem key={key} disableGutters sx={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb: 0.5, borderBottom: '1px solid #383838', pb: 0.5}}>
                <Box sx={{flexGrow:1, mr:1}}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#90caf9', fontWeight: 'bold', wordBreak:'break-all' }}>{key}:</Typography>
                  <Typography component="div" sx={{ fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all', pl:1 }}>
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </Typography>
                </Box>
                <Tooltip title={`Copy Value: ${String(value).substring(0,30)}...`}>
                  <IconButton onClick={() => handleCopy(String(value))} size="small" sx={{p:0.1, mt:0.5}}> <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    );
  };

  if (!selectedIdentityForVDXF && !loadingHistoryForVDXF) {
    return (
        <Box sx={{p:1.5, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', background:'#232323', borderRadius:1}}>
             <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Revisions of Maps</Typography>
             <Typography sx={{color: '#888', fontSize: '0.9rem'}}>Select a VerusID from the list to view its map history.</Typography>
        </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0, background: '#232323', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0, mb: 0.5 }}>
            Revisions of Maps
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 1, gap: 1, overflow: 'hidden' }}>
            {/* Top Sub-window: My Content Map */}
            <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, overflow: 'hidden', background: '#282828' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>My Content Map</Typography>
                {renderHistorySelector(selectedContentMapIndex, setSelectedContentMapIndex, identityHistoryForVDXF, 'ContentMap Version')}
                <Box sx={{overflowY: 'auto', flexGrow:1, mt: (identityHistoryForVDXF.length > 0 && !loadingHistoryForVDXF && !errorHistoryForVDXF) ? 1 : 0}}>
                {currentContentMapEntryObject ? renderMapData(currentContentMapEntryObject, 'ContentMap') :
                    (!loadingHistoryForVDXF && !errorHistoryForVDXF && selectedIdentityForVDXF && identityHistoryForVDXF.length > 0 && <Typography sx={{color:'#888', fontSize: '0.8rem'}}>Select a version.</Typography>)}
                </Box>
            </Paper>

            <Divider sx={{bgcolor: '#444'}}/>

            {/* Bottom Sub-window: My Content MultiMap */}
            <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, overflow: 'hidden', background: '#282828' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>My Content MultiMap</Typography>
                {renderHistorySelector(selectedMultiMapIndex, setSelectedMultiMapIndex, identityHistoryForVDXF, 'ContentMultiMap Version')}
                <Box sx={{overflowY: 'auto', flexGrow:1, mt: (identityHistoryForVDXF.length > 0 && !loadingHistoryForVDXF && !errorHistoryForVDXF) ? 1 : 0}}>
                {currentMultiMapEntryObject ? renderMapData(currentMultiMapEntryObject, 'ContentMultiMap') :
                    (!loadingHistoryForVDXF && !errorHistoryForVDXF && selectedIdentityForVDXF && identityHistoryForVDXF.length > 0 && <Typography sx={{color:'#888', fontSize: '0.8rem'}}>Select a version.</Typography>)}
                </Box>
            </Paper>
        </Box>
    </Box>
  );
};

export default StatesOfMyMapsColumn;
