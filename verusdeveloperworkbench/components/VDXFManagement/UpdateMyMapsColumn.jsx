import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  Grid, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  List, ListItem, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { styled } from '@mui/system';
import { NodeContext } from '../../contexts/NodeContext';
import { IdentityContext } from '../../contexts/IdentityContext';

const StyledInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    background: '#2a2a2a',
    borderRadius: '4px',
    '& fieldset': { borderColor: '#444' },
    '&:hover fieldset': { borderColor: '#666' },
    '&.Mui-focused fieldset': { borderColor: '#90caf9' },
    '& input::placeholder': { color: '#777' },
    '& textarea::placeholder': { color: '#777' },
  },
  '& .MuiInputLabel-root': { color: '#c5c5c5' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#90caf9' },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: '#232323',
  border: '1px solid #333',
  borderRadius: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  position: 'relative'
}));

const renderSimpleMultiMapEntry = (nestedKey, jsonData) => {
  return (
    <Box sx={{ mb: 1, p: 1, background: '#2c2c2c', borderRadius: 1 }}>
      <Typography sx={{ color: '#90caf9', fontWeight: 'bold', fontSize: '0.8rem', fontFamily: 'monospace', mb: 0.5 }}>
        {nestedKey}
      </Typography>
      <Typography component="pre" sx={{ fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight:'100px', overflowY:'auto' }}>
        {jsonData}
      </Typography>
    </Box>
  );
};

const UpdateMyMapsColumn = () => {
  const { 
    selectedIdentityForVDXF, 
    identityHistoryForVDXF, 
    fetchIdentityDetailsForVDXF,
    loadingHistoryForVDXF 
  } = useContext(IdentityContext);
  const { sendCommand } = useContext(NodeContext);

  const [currentContentMap, setCurrentContentMap] = useState({});
  const [currentContentMultiMap, setCurrentContentMultiMap] = useState({});
  const [latestHistoryEntry, setLatestHistoryEntry] = useState(null);

  const [contentMapKey, setContentMapKey] = useState('');
  const [contentMapValue, setContentMapValue] = useState('');
  const [editingContentMapKey, setEditingContentMapKey] = useState(null);
  const [selectedContentMapKeysToDelete, setSelectedContentMapKeysToDelete] = useState(new Set());
  const [contentMapError, setContentMapError] = useState('');
  const [contentMapExpanded, setContentMapExpanded] = useState(true);
  const [isLoadingCM, setIsLoadingCM] = useState(false);
  
  const [multiMapPrimaryKeyInput, setMultiMapPrimaryKeyInput] = useState('');
  const [multiMapNestedKeyInput, setMultiMapNestedKeyInput] = useState('');
  const [multiMapJsonInput, setMultiMapJsonInput] = useState('');
  const [editingMultiMapTarget, setEditingMultiMapTarget] = useState(null);
  const [multiMapError, setMultiMapError] = useState('');
  const [multiMapExpanded, setMultiMapExpanded] = useState(true);
  const [isLoadingCMM, setIsLoadingCMM] = useState(false);

  useEffect(() => {
    if (identityHistoryForVDXF && identityHistoryForVDXF.length > 0) {
      const latestEntry = identityHistoryForVDXF[0];
      setLatestHistoryEntry(latestEntry);
      setCurrentContentMap(latestEntry.identity?.contentmap || {});
      setCurrentContentMultiMap(latestEntry.identity?.contentmultimap || {});
      setSelectedContentMapKeysToDelete(new Set());
    } else {
      setLatestHistoryEntry(null);
      setCurrentContentMap({});
      setCurrentContentMultiMap({});
      setSelectedContentMapKeysToDelete(new Set());
    }
  }, [identityHistoryForVDXF]);

  const handleToggleContentMapSelection = (key) => {
    setSelectedContentMapKeysToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleAddOrUpdateContentMap = async () => {
    if (!latestHistoryEntry || !latestHistoryEntry.identity?.identityaddress) {
      setContentMapError('No identity selected or history available to update.'); return;
    }
    if (!contentMapKey.trim() || !contentMapValue.trim()) {
      setContentMapError('Both VDXF Key Hash and Content Hash Value are required.'); return;
    }
    if (!/^[0-9a-fA-F]{40}$/.test(contentMapKey.trim())) {
        setContentMapError('VDXF Key Hash must be a 40-character hex string.'); return;
    }
    if (!/^[0-9a-fA-F]{64}$/.test(contentMapValue.trim())) {
        setContentMapError('Content Hash Value must be a 64-character hex string.'); return;
    }
    setIsLoadingCM(true); setContentMapError('');

    const updatedContentMap = { ...currentContentMap };
    if (editingContentMapKey && editingContentMapKey !== contentMapKey.trim()) {
      delete updatedContentMap[editingContentMapKey];
    }
    updatedContentMap[contentMapKey.trim()] = contentMapValue.trim();

    const updateParams = {
      name: latestHistoryEntry.identity.identityaddress,
      contentmap: updatedContentMap,
      primaryaddresses: latestHistoryEntry.identity.primaryaddresses,
      minimumsignatures: latestHistoryEntry.identity.minimumsignatures,
    };
    if (latestHistoryEntry.identity.parent) updateParams.parent = latestHistoryEntry.identity.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-update');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF?.name) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF.name);
      }
      setContentMapKey(''); setContentMapValue(''); setEditingContentMapKey(null);
      setSelectedContentMapKeysToDelete(new Set());
    } catch (err) {
      setContentMapError(err.message || 'Failed to update content map.');
    } finally { setIsLoadingCM(false); }
  };

  const handleEditContentMapEntry = (key, value) => {
    setContentMapKey(key);
    setContentMapValue(value);
    setEditingContentMapKey(key);
  };

  const handleCancelEditContentMap = () => {
    setContentMapKey(''); setContentMapValue(''); setEditingContentMapKey(null);
  };

  const handleDeleteSelectedContentMapEntries = async () => {
    if (!latestHistoryEntry || !latestHistoryEntry.identity?.identityaddress) {
      setContentMapError('No identity selected or history to update.'); return;
    }
    if (selectedContentMapKeysToDelete.size === 0) {
      setContentMapError('No entries selected for deletion.'); return;
    }
    setIsLoadingCM(true); setContentMapError('');

    const updatedContentMap = { ...currentContentMap };
    selectedContentMapKeysToDelete.forEach(key => {
      delete updatedContentMap[key];
    });

    const updateParams = {
      name: latestHistoryEntry.identity.identityaddress,
      contentmap: Object.keys(updatedContentMap).length === 0 ? null : updatedContentMap,
      primaryaddresses: latestHistoryEntry.identity.primaryaddresses,
      minimumsignatures: latestHistoryEntry.identity.minimumsignatures,
    };
    if (latestHistoryEntry.identity.parent) updateParams.parent = latestHistoryEntry.identity.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-update');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF?.name) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF.name);
      }
      setSelectedContentMapKeysToDelete(new Set());
    } catch (err) {
      setContentMapError(err.message || 'Failed to delete content map entries.');
    } finally { setIsLoadingCM(false); }
  };

  const handleAddOrUpdateMultiMapEntry = async () => {
    if (!latestHistoryEntry || !latestHistoryEntry.identity?.identityaddress) { setMultiMapError('No identity selected or history available.'); return; }
    if (!multiMapPrimaryKeyInput.trim() || !multiMapNestedKeyInput.trim() || !multiMapJsonInput.trim()) { setMultiMapError('All fields (Primary Key, Nested Key, JSON Data) are required.'); return; }
    if (!multiMapPrimaryKeyInput.startsWith('i') || !multiMapNestedKeyInput.startsWith('i')) { setMultiMapError('Primary and Nested keys must be valid i-addresses (starting with i).'); return; }
    let parsedJsonData;
    try { parsedJsonData = JSON.parse(multiMapJsonInput); } catch (e) { setMultiMapError('Invalid JSON data: ' + e.message); return; }
    setIsLoadingCMM(true); setMultiMapError('');

    const updatedContentMultiMap = JSON.parse(JSON.stringify(currentContentMultiMap || {}));
    const pk = multiMapPrimaryKeyInput.trim();
    const nk = multiMapNestedKeyInput.trim();

    if (!updatedContentMultiMap[pk]) updatedContentMultiMap[pk] = [];
    
    let entryIndex = -1;
    if (editingMultiMapTarget && editingMultiMapTarget.primaryKey === pk) {
      entryIndex = updatedContentMultiMap[pk].findIndex(entry => Object.keys(entry)[0] === editingMultiMapTarget.nestedKey);
    }

    if (editingMultiMapTarget && editingMultiMapTarget.primaryKey === pk && entryIndex !== -1) {
      updatedContentMultiMap[pk][entryIndex] = { [nk]: parsedJsonData };
    } else if (editingMultiMapTarget && editingMultiMapTarget.primaryKey !== pk && updatedContentMultiMap[editingMultiMapTarget.primaryKey]) {
      updatedContentMultiMap[editingMultiMapTarget.primaryKey] = updatedContentMultiMap[editingMultiMapTarget.primaryKey].filter(
        entry => Object.keys(entry)[0] !== editingMultiMapTarget.nestedKey
      );
      if (updatedContentMultiMap[editingMultiMapTarget.primaryKey].length === 0) {
        delete updatedContentMultiMap[editingMultiMapTarget.primaryKey];
      }
      if (!updatedContentMultiMap[pk]) updatedContentMultiMap[pk] = [];
      updatedContentMultiMap[pk].push({ [nk]: parsedJsonData });
    } else {
      updatedContentMultiMap[pk].push({ [nk]: parsedJsonData });
    }
    
    const updateParams = { 
      name: latestHistoryEntry.identity.identityaddress, 
      contentmultimap: Object.keys(updatedContentMultiMap).length === 0 ? null : updatedContentMultiMap,
      primaryaddresses: latestHistoryEntry.identity.primaryaddresses,
      minimumsignatures: latestHistoryEntry.identity.minimumsignatures,
    };
    if (latestHistoryEntry.identity.parent) updateParams.parent = latestHistoryEntry.identity.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-update');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF?.name) await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF.name);
      setMultiMapPrimaryKeyInput(''); setMultiMapNestedKeyInput(''); setMultiMapJsonInput(''); setEditingMultiMapTarget(null);
    } catch (err) { setMultiMapError(err.message || 'Failed to update content multi-map.');
    } finally { setIsLoadingCMM(false); }
  };

  const handleEditMultiMapEntry = (primaryK, nestedK, jsonDataString) => {
    setMultiMapPrimaryKeyInput(primaryK);
    setMultiMapNestedKeyInput(nestedK);
    setMultiMapJsonInput(jsonDataString);
    setEditingMultiMapTarget({ primaryKey: primaryK, nestedKey: nestedK, originalJsonData: jsonDataString });
  };

  const handleRemoveMultiMapEntry = async (primaryK, nestedKToRemove) => {
    if (!latestHistoryEntry || !latestHistoryEntry.identity?.identityaddress) return;
    setIsLoadingCMM(true); setMultiMapError('');
    const updatedContentMultiMap = JSON.parse(JSON.stringify(currentContentMultiMap || {}));
    
    if (updatedContentMultiMap[primaryK]) {
      updatedContentMultiMap[primaryK] = updatedContentMultiMap[primaryK].filter(entry => Object.keys(entry)[0] !== nestedKToRemove);
      if (updatedContentMultiMap[primaryK].length === 0) {
        delete updatedContentMultiMap[primaryK];
      }
    }

    const updateParams = { 
      name: latestHistoryEntry.identity.identityaddress, 
      contentmultimap: Object.keys(updatedContentMultiMap).length === 0 ? null : updatedContentMultiMap,
      primaryaddresses: latestHistoryEntry.identity.primaryaddresses,
      minimumsignatures: latestHistoryEntry.identity.minimumsignatures,
    };
    if (latestHistoryEntry.identity.parent) updateParams.parent = latestHistoryEntry.identity.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-update');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF?.name) await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF.name);
       setEditingMultiMapTarget(null);
    } catch (err) { setMultiMapError(err.message || 'Failed to remove content multi-map entry.');
    } finally { setIsLoadingCMM(false); }
  };

  const handleCancelEditMultiMap = () => {
    setMultiMapPrimaryKeyInput(''); setMultiMapNestedKeyInput(''); setMultiMapJsonInput(''); setEditingMultiMapTarget(null);
  };

  if (loadingHistoryForVDXF && !latestHistoryEntry) {
    return <StyledPaper><Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box></StyledPaper>;
  }

  if (!selectedIdentityForVDXF) {
    return <StyledPaper><Typography sx={{color:'#bbb', textAlign:'center', mt:2}}>Select a VerusID to update its maps.</Typography></StyledPaper>;
  }
  
  if (!latestHistoryEntry && !loadingHistoryForVDXF) {
     return <StyledPaper><Alert severity="warning">No history data found for {selectedIdentityForVDXF.name}. Cannot determine current maps.</Alert></StyledPaper>;
  }
  
   if (selectedIdentityForVDXF.error) {
     // We rely on identityHistoryForVDXF now. An error there would be in errorHistoryForVDXF
   }

  return (
    <StyledPaper sx={{ overflowY: 'hidden' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', flexShrink: 0, textAlign:'center' }}>
         Update My Maps
      </Typography>
      <Divider sx={{ mb: 1, borderColor: '#444', flexShrink: 0 }} />
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, minHeight: 0 }}>
        <Box component="section" mb={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: '#90caf9', fontWeight: 'bold' }}>Content Map</Typography>
            <IconButton size="small" onClick={() => setContentMapExpanded(!contentMapExpanded)} sx={{ ml: 'auto', color: '#90caf9' }}>
              {contentMapExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={contentMapExpanded}>
            <Paper sx={{ p: 2, background: '#1c1c1c', border: '1px solid #303030' }}>
              <Box component="form" onSubmit={(e) => {e.preventDefault(); handleAddOrUpdateContentMap();}} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb:2 }}>
                <StyledInput value={contentMapKey} onChange={e => setContentMapKey(e.target.value)} placeholder="VDXF Key Hash (40 hex chars)" size="small" label="VDXF Key Hash"/>
                <StyledInput value={contentMapValue} onChange={e => setContentMapValue(e.target.value)} placeholder="Content Hash Value (64 hex chars)" size="small" label="Content Hash Value"/>
                <Box sx={{ display: 'flex', gap: 1, mt:1 }}>
                  <Button type="submit" variant="contained" color="primary" size="small" disabled={isLoadingCM || !latestHistoryEntry}>{editingContentMapKey ? 'Update Entry' : 'Add Entry'}</Button>
                  {editingContentMapKey && <Button variant="outlined" size="small" onClick={handleCancelEditContentMap} disabled={isLoadingCM}>Cancel Edit</Button>}
                </Box>
                {contentMapError && <Alert severity="error" sx={{mt:1}} onClose={() => setContentMapError('')}>{contentMapError}</Alert>}
                {isLoadingCM && <CircularProgress size={24} sx={{mt:1}}/>}
              </Box>

              <Typography variant="body2" sx={{color: '#ccc', mb:1}}>Current Entries:</Typography>
              <Box sx={{ maxHeight: '200px', overflowY: 'auto', background: '#2a2a2a', p:1, borderRadius: '4px'}}>
                {currentContentMap && Object.keys(currentContentMap).length > 0 ? (
                  Object.entries(currentContentMap).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3a3a3a', py: 0.5, '&:last-child': {borderBottom:0} }}>
                      <Checkbox 
                        size="small"
                        checked={selectedContentMapKeysToDelete.has(key)}
                        onChange={() => handleToggleContentMapSelection(key)}
                        sx={{p:0, mr:1, color:'#90caf9', '&.Mui-checked': {color: '#90caf9'}}}/>
                      <Box sx={{flexGrow: 1, maxWidth: 'calc(100% - 100px)', overflowX:'auto'}}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#90caf9', fontFamily: 'monospace', wordBreak:'break-all' }}>{key}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#ddd', fontFamily: 'monospace', wordBreak:'break-all', ml:2 }}>{value}</Typography>
                      </Box>
                      <Box sx={{flexShrink:0}}>
                        <IconButton size="small" onClick={() => handleEditContentMapEntry(key, value)} sx={{color: '#90caf9'}}><EditIcon fontSize="small"/></IconButton>
                      </Box>
                    </Box>
                  ))
                ) : <Typography sx={{color:'#777', fontStyle:'italic'}}>No content map entries.</Typography>}
              </Box>
              {currentContentMap && Object.keys(currentContentMap).length > 0 &&
                <Button 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    sx={{mt:1.5, alignSelf:'flex-start'}}
                    onClick={handleDeleteSelectedContentMapEntries}
                    disabled={selectedContentMapKeysToDelete.size === 0 || isLoadingCM || !latestHistoryEntry}
                >
                    Delete Selected ({selectedContentMapKeysToDelete.size})
                </Button>
              }
            </Paper>
          </Collapse>
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: '#90caf9', fontWeight: 'bold' }}>Content Multi-Map</Typography>
            <IconButton size="small" onClick={() => setMultiMapExpanded(!multiMapExpanded)} sx={{ ml: 'auto', color: '#90caf9' }}>
              {multiMapExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={multiMapExpanded}>
            <Paper sx={{ p: 2, background: '#1c1c1c', border: '1px solid #303030' }}>
              <Box component="form" onSubmit={(e) => {e.preventDefault(); handleAddOrUpdateMultiMapEntry();}} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                <StyledInput value={multiMapPrimaryKeyInput} onChange={e => setMultiMapPrimaryKeyInput(e.target.value)} placeholder="Primary VDXF Key (i-address)" size="small" label="Primary VDXF Key"/>
                <StyledInput value={multiMapNestedKeyInput} onChange={e => setMultiMapNestedKeyInput(e.target.value)} placeholder="Nested VDXF Key (i-address)" size="small" label="Nested VDXF Key"/>
                <StyledInput value={multiMapJsonInput} onChange={e => setMultiMapJsonInput(e.target.value)} placeholder='Structured Data (JSON) e.g., { "message": "hello" }' multiline rows={3} size="small" label="JSON Data"/>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button type="submit" variant="contained" color="primary" size="small" disabled={isLoadingCMM || !latestHistoryEntry}>{editingMultiMapTarget ? 'Update Nested Entry' : 'Add Nested Entry'}</Button>
                  {editingMultiMapTarget && <Button variant="outlined" size="small" onClick={handleCancelEditMultiMap} disabled={isLoadingCMM}>Cancel Edit</Button>}
                </Box>
                {multiMapError && <Alert severity="error" sx={{mt:1}} onClose={() => setMultiMapError('')}>{multiMapError}</Alert>}
                {isLoadingCMM && <CircularProgress size={24} sx={{mt:1}}/>}
              </Box>
              <Typography variant="body2" sx={{color: '#ccc', mb:1}}>Current Entries:</Typography>
              <Box sx={{ maxHeight: '250px', overflowY: 'auto', background: '#2a2a2a', p:1, borderRadius: '4px'}}>
                {currentContentMultiMap && Object.keys(currentContentMultiMap).length > 0 ? (
                  Object.entries(currentContentMultiMap).map(([primaryKey, nestedArray]) => (
                    <Accordion key={primaryKey} sx={{background: '#232323', border: '1px solid #444', mb:1, '.MuiAccordionSummary-content': {overflowX:'auto'}}} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: '#fff'}}/>} >
                          <Typography sx={{ fontSize: '0.9rem', color: '#90caf9', fontFamily: 'monospace', wordBreak:'break-all', flexGrow: 1 }}>{primaryKey}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{p:1}}>
                        {Array.isArray(nestedArray) && nestedArray.map((nEntry, nIndex) => {
                          const nestedKey = Object.keys(nEntry)[0];
                          const jsonData = JSON.stringify(Object.values(nEntry)[0], null, 2);
                          return (
                            <Box key={`${nestedKey}-${nIndex}`} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #3a3a3a', py: 0.5, '&:last-child': {borderBottom:0} }}>
                              <Box sx={{flexGrow: 1, mr:1, overflow:'hidden'}}>
                                {renderSimpleMultiMapEntry(nestedKey, jsonData)}
                              </Box>
                              <Box sx={{flexShrink:0, ml:1, display:'flex', flexDirection:'column', gap:0.5}}>
                                <IconButton size="small" onClick={() => handleEditMultiMapEntry(primaryKey, nestedKey, jsonData)} sx={{color: '#90caf9'}}><EditIcon fontSize="small"/></IconButton>
                                <IconButton size="small" onClick={() => handleRemoveMultiMapEntry(primaryKey, nestedKey)} sx={{color: '#f44336'}}><EditIcon fontSize="small"/></IconButton>
                              </Box>
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : <Typography sx={{color:'#777', fontStyle:'italic'}}>No content multi-map entries.</Typography>}
              </Box>
            </Paper>
          </Collapse>
        </Box>

      </Box>
    </StyledPaper>
  );
};

export default UpdateMyMapsColumn; 