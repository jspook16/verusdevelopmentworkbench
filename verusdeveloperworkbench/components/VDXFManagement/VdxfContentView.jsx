import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
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
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/system';
import { NodeContext } from '../../contexts/NodeContext';
import { IdentityContext } from '../../contexts/IdentityContext';
import { getFlagDescription } from '../../utils/identityUtils.js';

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
  background: '#232323',
  border: '1px solid #333',
  borderRadius: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
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

const handleCopy = (textToCopy) => {
  if (textToCopy === undefined || textToCopy === null) return;
  navigator.clipboard.writeText(String(textToCopy));
};

const renderDetailItem = (label, value, isJson = false, fullValue = null) => {
  const displayValue = isJson && typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
  const valueToCopy = fullValue !== null ? String(fullValue) : (value !== undefined && value !== null ? String(value) : '');

  return (
    <ListItem dense disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #303030', pb: 0.5, mb:0.5 }}>
      <ListItemText 
        primary={label} 
        secondary={
          <Typography component="span" sx={{ fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {displayValue}
          </Typography>
        }
        primaryTypographyProps={{ sx: { fontSize: '0.8rem', color: '#a0cff9', fontWeight: '500', minWidth: '120px', mr:1 } }}
      />
      {value !== undefined && value !== null && (
        <Tooltip title={`Copy ${label}`}>
          <IconButton onClick={() => handleCopy(valueToCopy)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}>
            <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
          </IconButton>
        </Tooltip>
      )}
    </ListItem>
  );
};

const renderIdentityFlagsList = (flagsInt) => {
  if (typeof flagsInt !== 'number') return <ListItemText secondary="N/A" secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: '#ddd' } }}/>;
  
  const descriptions = getFlagDescription(flagsInt);

  if (!descriptions || descriptions.length === 0 || descriptions[0] === 'None' || descriptions[0] === 'N/A') {
    return <ListItemText secondary={descriptions && descriptions.length > 0 ? descriptions[0] : 'None'} secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: '#ddd' } }}/>;
  }

  return (
    <List dense disablePadding sx={{pl:0}}>
      {descriptions.map((desc, index) => (
        <ListItem key={index} dense disableGutters sx={{ pt:0, pb:0}}>
          <ListItemText 
            primary={`- ${desc}`} 
            primaryTypographyProps={{ sx: { fontSize: '0.75rem', color: '#ddd' } }}
          />
        </ListItem>
      ))}
    </List>
  );
};

const VdxfContentView = () => {
  const { 
    selectedIdentityForVDXF, 
    identityHistoryForVDXF, 
    loadingHistoryForVDXF,
    vdxfIdentityDetails,
    loadingVdxfDetails,
    errorVdxfDetails,
    fetchIdentityDetailsForVDXF
  } = useContext(IdentityContext);
  const { sendCommand, getNetworkNotarizationForBlock } = useContext(NodeContext);

  const [currentContentMap, setCurrentContentMap] = useState({});
  const [currentContentMultiMap, setCurrentContentMultiMap] = useState({});
  const [latestHistoryEntry, setLatestHistoryEntry] = useState(null);

  const [contentMapFormEntries, setContentMapFormEntries] = useState([{ key: '', value: '' }]);
  const [editingEntriesData, setEditingEntriesData] = useState({});
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

  const [notarizationDetails, setNotarizationDetails] = useState(null);
  const [loadingNotarization, setLoadingNotarization] = useState(false);

  useEffect(() => {
    if (vdxfIdentityDetails && vdxfIdentityDetails.identity) {
      setCurrentContentMap(vdxfIdentityDetails.identity.contentmap || {});
      setCurrentContentMultiMap(vdxfIdentityDetails.identity.contentmultimap || {});
      setLatestHistoryEntry(vdxfIdentityDetails);
    } else if (identityHistoryForVDXF && identityHistoryForVDXF.length > 0 && !vdxfIdentityDetails) {
      const latestEntryFromHistory = identityHistoryForVDXF[0];
      console.log('[VdxfContentView] useEffect - Using latest from identityHistoryForVDXF:', JSON.parse(JSON.stringify(latestEntryFromHistory)));
      setLatestHistoryEntry(latestEntryFromHistory);
      setCurrentContentMap(latestEntryFromHistory.identity?.contentmap || {});
      setCurrentContentMultiMap(latestEntryFromHistory.identity?.contentmultimap || {});
    } else {
      console.log('[VdxfContentView] useEffect - No VDXF details or history, resetting map states.');
      setLatestHistoryEntry(null);
      setCurrentContentMap({});
      setCurrentContentMultiMap({});
    }
    setSelectedContentMapKeysToDelete(new Set());
    setContentMapFormEntries([{ key: '', value: '' }]);
    setEditingEntriesData({});
  }, [vdxfIdentityDetails, identityHistoryForVDXF, selectedIdentityForVDXF]);

  useEffect(() => {
    const fetchNotarization = async () => {
      if (vdxfIdentityDetails?.identity?.proofprotocol === 2 && vdxfIdentityDetails.bestcurrencystate?.lastconfirmednotarization?.blockhash) {
        setLoadingNotarization(true);
        setNotarizationDetails(null);
        try {
          const notarization = await getNetworkNotarizationForBlock(vdxfIdentityDetails.bestcurrencystate.lastconfirmednotarization.blockhash);
          setNotarizationDetails(notarization);
        } catch (error) {
          console.error("Error fetching notarization details:", error);
          setNotarizationDetails({ error: "Failed to fetch notarization details." });
        } finally {
          setLoadingNotarization(false);
        }
      } else {
        setNotarizationDetails(null);
      }
    };
    fetchNotarization();
  }, [vdxfIdentityDetails, getNetworkNotarizationForBlock]);

  const handleContentMapFormChange = (index, field, fieldValue) => {
    const newEntries = [...contentMapFormEntries];
    newEntries[index][field] = fieldValue;
    setContentMapFormEntries(newEntries);
  };

  const addContentMapFormPair = () => {
    setContentMapFormEntries([...contentMapFormEntries, { key: '', value: '' }]);
  };

  const removeContentMapFormPair = (index) => {
    if (contentMapFormEntries.length <= 1) return;
    const newEntries = contentMapFormEntries.filter((_, i) => i !== index);
    setContentMapFormEntries(newEntries);
  };

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

  const handleInlineContentMapValueChange = (originalKey, newValue) => {
    setEditingEntriesData(prev => ({
      ...prev,
      [originalKey]: { ...prev[originalKey], currentValue: newValue }
    }));
  };

  const handleInlineContentMapKeyChange = (originalKey, newKey) => {
    setEditingEntriesData(prev => ({
      ...prev,
      [originalKey]: { ...prev[originalKey], currentKey: newKey }
    }));
  };

  const toggleInlineEditContentMap = (key, currentValue) => {
    setEditingEntriesData(prev => {
      const newEditingData = {...prev};
      if (newEditingData[key]) {
        delete newEditingData[key];
      } else {
        newEditingData[key] = { 
          currentKey: key, 
          currentValue: currentValue 
        };
      }
      return newEditingData;
    });
  };

  const handleAddContentMapEntries = async () => {
    const baseIdentityForUpdate = vdxfIdentityDetails?.identity || latestHistoryEntry?.identity;
    const fqn = latestHistoryEntry?.fullyqualifiedname || selectedIdentityForVDXF;
    
    if (!baseIdentityForUpdate || !baseIdentityForUpdate.identityaddress || !fqn) {
      setContentMapError('Current identity details not available for update.'); return;
    }
    setIsLoadingCM(true); setContentMapError('');
    const updatedContentMap = { ...currentContentMap };
    let formHasErrors = false;

    for (const entry of contentMapFormEntries) {
      if (!entry.key.trim() && !entry.value.trim()) continue;
      if (!entry.key.trim() || !entry.value.trim()) {
        setContentMapError('All key/value pairs must be completely filled or both left empty.'); formHasErrors = true; break;
      }
      if (!/^[0-9a-fA-F]{40}$/.test(entry.key.trim())) {
        setContentMapError(`Invalid Key Hash: ${entry.key}. Must be 40 hex chars.`); formHasErrors = true; break;
      }
      if (!/^[0-9a-fA-F]{64}$/.test(entry.value.trim())) {
        setContentMapError(`Invalid Value Hash for key ${entry.key}. Must be 64 hex chars.`); formHasErrors = true; break;
      }
      updatedContentMap[entry.key.trim()] = entry.value.trim();
    }

    if (formHasErrors) { setIsLoadingCM(false); return; }
    if (JSON.stringify(updatedContentMap) === JSON.stringify(currentContentMap) && 
        contentMapFormEntries.every(e => !e.key.trim() && !e.value.trim())){
        setContentMapError("No new entries to add."); setIsLoadingCM(false); return;
    }

    const updateParams = {
      name: fqn, 
      contentmap: Object.keys(updatedContentMap).length === 0 ? null : updatedContentMap,
      contentmultimap: currentContentMultiMap, 
      primaryaddresses: baseIdentityForUpdate.primaryaddresses,
      minimumsignatures: baseIdentityForUpdate.minimumsignatures,
      revocationauthority: baseIdentityForUpdate.revocationauthority,
      recoveryauthority: baseIdentityForUpdate.recoveryauthority,
      parent: baseIdentityForUpdate.parent
    };
    if (!updateParams.parent) delete updateParams.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-add-cm');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF);
      }
      setContentMapFormEntries([{ key: '', value: '' }]);
    } catch (err) {
      setContentMapError(err.message || 'Failed to add to content map.');
    } finally { setIsLoadingCM(false); }
  };

  const handleDeleteSelectedContentMapEntries = async () => {
    const baseIdentityForUpdate = vdxfIdentityDetails?.identity || latestHistoryEntry?.identity;
    const fqn = latestHistoryEntry?.fullyqualifiedname || selectedIdentityForVDXF;
    
    console.log('[VdxfContentView] handleDeleteSelectedContentMapEntries - baseIdentityForUpdate:', baseIdentityForUpdate);
    console.log('[VdxfContentView] handleDeleteSelectedContentMapEntries - fqn:', fqn);

    if (!baseIdentityForUpdate || !baseIdentityForUpdate.identityaddress || !fqn) {
      setContentMapError('Current identity details (including address and FQN) not available for update.'); 
      console.error('Delete CM Guard Failed: baseIdentityForUpdate:', baseIdentityForUpdate, 'fqn:', fqn);
      return;
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
      name: fqn, 
      contentmap: Object.keys(updatedContentMap).length === 0 ? null : updatedContentMap,
      contentmultimap: currentContentMultiMap,
      primaryaddresses: baseIdentityForUpdate.primaryaddresses,
      minimumsignatures: baseIdentityForUpdate.minimumsignatures,
      revocationauthority: baseIdentityForUpdate.revocationauthority,
      recoveryauthority: baseIdentityForUpdate.recoveryauthority,
    };
    if (baseIdentityForUpdate.parent) updateParams.parent = baseIdentityForUpdate.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-delete-cm');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF);
      }
      setSelectedContentMapKeysToDelete(new Set());
    } catch (err) {
      setContentMapError(err.message || 'Failed to delete content map entries.');
    } finally { setIsLoadingCM(false); }
  };

  const handleCommitAllModifiedContentMapEntries = async () => {
    const baseIdentityForUpdate = vdxfIdentityDetails?.identity || latestHistoryEntry?.identity;
    const fqn = latestHistoryEntry?.fullyqualifiedname || selectedIdentityForVDXF;

    if (!baseIdentityForUpdate || !baseIdentityForUpdate.identityaddress || !fqn) {
      setContentMapError('Current identity details not available for update.'); return;
    }
    if (Object.keys(editingEntriesData).length === 0) {
      setContentMapError('No entries have been modified.'); return;
    }

    setIsLoadingCM(true); setContentMapError('');
    const updatedContentMap = { ...currentContentMap }; // Start with the map from history
    let formHasErrors = false;

    for (const originalKey in editingEntriesData) {
      if (editingEntriesData.hasOwnProperty(originalKey)) {
        const { currentKey, currentValue } = editingEntriesData[originalKey];
        
        // Validate the new key if it has changed
        if (currentKey !== originalKey) {
          if (!/^[0-9a-fA-F]{40}$/.test(currentKey.trim())) {
            setContentMapError(`Invalid Key Hash: ${currentKey}. Must be 40 hex chars.`);
            formHasErrors = true;
            break;
          }
          // Check if the new key already exists in the map
          if (updatedContentMap[currentKey.trim()] && currentKey.trim() !== originalKey) {
            setContentMapError(`Key ${currentKey} already exists in the content map.`);
            formHasErrors = true;
            break;
          }
        }
        
        // Validate the value
        if (!/^[0-9a-fA-F]{64}$/.test(currentValue.trim()) && currentValue.trim()) {
          setContentMapError(`Invalid Content Hash Value for key ${originalKey}: "${currentValue}". Must be 64 hex chars, or empty to remove (use delete for removal).`); 
          formHasErrors = true; 
          break;
        }
        
        // If currentValue is empty string, it implies user wants to remove it - but batch delete is preferred.
        // For now, an empty value during edit could be an error or ignored if we want to enforce delete via checkboxes.
        // Let's assume an edit to empty is an error for now if original value was not empty.
        if (!currentValue.trim() && currentContentMap[originalKey]?.trim()) {
            setContentMapError(`Cannot set value to empty for key ${originalKey} via modify. Use Delete Selected.`);
            formHasErrors = true;
            break;
        }
        
        // Handle key change and value update
        if (currentKey.trim() !== originalKey) {
          // Remove the old key
          delete updatedContentMap[originalKey];
        }
        
        if(currentValue.trim()) { // Only update if new value is not empty
          updatedContentMap[currentKey.trim()] = currentValue.trim();
        } else if (!currentValue.trim() && !currentContentMap[originalKey]?.trim()) {
          // If both new and old are empty, do nothing to this key, effectively no change.
        } else if (!currentValue.trim() && currentContentMap[originalKey]?.trim()){
          // This case means user tried to clear a previously non-empty field via modify.
          // We already show an error above. For safety, explicitly do not delete here, require checkbox delete.
        }
      }
    }

    if (formHasErrors) { setIsLoadingCM(false); return; }

    // Check if any actual changes were made
    if (JSON.stringify(updatedContentMap) === JSON.stringify(currentContentMap)) {
        setContentMapError("No actual changes detected in modified entries.");
        setIsLoadingCM(false);
        // Optionally clear editingEntriesData if no real change but user clicked commit
        // setEditingEntriesData({}); 
        return;
    }

    const updateParams = {
      name: fqn, 
      contentmap: Object.keys(updatedContentMap).length === 0 ? null : updatedContentMap,
      contentmultimap: currentContentMultiMap, 
      primaryaddresses: baseIdentityForUpdate.primaryaddresses,
      minimumsignatures: baseIdentityForUpdate.minimumsignatures,
      revocationauthority: baseIdentityForUpdate.revocationauthority,
      recoveryauthority: baseIdentityForUpdate.recoveryauthority,
      parent: baseIdentityForUpdate.parent
    };
    if (!updateParams.parent) delete updateParams.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-commit-cm-edits');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF);
      }
      setEditingEntriesData({}); // Clear successfully committed edits
    } catch (err) {
      setContentMapError(err.message || 'Failed to commit modified content map entries.');
    } finally { setIsLoadingCM(false); }
  };

  const handleAddOrUpdateMultiMapEntry = async () => {
    const baseIdentityForUpdate = vdxfIdentityDetails?.identity || latestHistoryEntry?.identity;
    const fqn = latestHistoryEntry?.fullyqualifiedname || selectedIdentityForVDXF;

    if (!baseIdentityForUpdate || !baseIdentityForUpdate.identityaddress || !fqn) { 
        setMultiMapError('Current identity details (including address and FQN) not available.'); 
        console.error('Update CMM Guard Failed: baseIdentityForUpdate:', baseIdentityForUpdate, 'fqn:', fqn);
        return; 
    }
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
      name: fqn, 
      contentmap: currentContentMap,
      contentmultimap: Object.keys(updatedContentMultiMap).length === 0 ? null : updatedContentMultiMap,
      primaryaddresses: baseIdentityForUpdate.primaryaddresses,
      minimumsignatures: baseIdentityForUpdate.minimumsignatures,
      revocationauthority: baseIdentityForUpdate.revocationauthority,
      recoveryauthority: baseIdentityForUpdate.recoveryauthority,
    };
    if (baseIdentityForUpdate.parent) updateParams.parent = baseIdentityForUpdate.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-update-cmm');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF);
      }
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
    const baseIdentityForUpdate = vdxfIdentityDetails?.identity || latestHistoryEntry?.identity;
    const fqn = latestHistoryEntry?.fullyqualifiedname || selectedIdentityForVDXF;

    if (!baseIdentityForUpdate || !baseIdentityForUpdate.identityaddress || !fqn) { 
        setMultiMapError('Current identity details (including address and FQN) not available.'); 
        console.error('Remove CMM Guard Failed: baseIdentityForUpdate:', baseIdentityForUpdate, 'fqn:', fqn);
        return; 
    }
    setIsLoadingCMM(true); setMultiMapError('');
    const updatedContentMultiMap = JSON.parse(JSON.stringify(currentContentMultiMap || {}));
    
    if (updatedContentMultiMap[primaryK]) {
      updatedContentMultiMap[primaryK] = updatedContentMultiMap[primaryK].filter(entry => Object.keys(entry)[0] !== nestedKToRemove);
      if (updatedContentMultiMap[primaryK].length === 0) {
        delete updatedContentMultiMap[primaryK];
      }
    }

    const updateParams = { 
      name: fqn, 
      contentmap: currentContentMap,
      contentmultimap: Object.keys(updatedContentMultiMap).length === 0 ? null : updatedContentMultiMap,
      primaryaddresses: baseIdentityForUpdate.primaryaddresses,
      minimumsignatures: baseIdentityForUpdate.minimumsignatures,
      revocationauthority: baseIdentityForUpdate.revocationauthority,
      recoveryauthority: baseIdentityForUpdate.recoveryauthority,
    };
    if (baseIdentityForUpdate.parent) updateParams.parent = baseIdentityForUpdate.parent;

    try {
      await sendCommand('updateidentity', [updateParams], 'vdxf-delete-cmm');
      if (fetchIdentityDetailsForVDXF && selectedIdentityForVDXF) {
        await fetchIdentityDetailsForVDXF(selectedIdentityForVDXF);
      }
      setEditingMultiMapTarget(null);
    } catch (err) { setMultiMapError(err.message || 'Failed to remove content multi-map entry.');
    } finally { setIsLoadingCMM(false); }
  };

  const handleCancelEditMultiMap = () => {
    setMultiMapPrimaryKeyInput(''); setMultiMapNestedKeyInput(''); setMultiMapJsonInput(''); setEditingMultiMapTarget(null);
  };
  
  if (loadingVdxfDetails) {
    return <StyledPaper><Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}><CircularProgress /></Box></StyledPaper>;
  }

  if (!selectedIdentityForVDXF) {
    return <StyledPaper><Typography sx={{color:'#bbb', textAlign:'center', mt:2}}>Select a VerusID to view and update its maps.</Typography></StyledPaper>;
  }
  
  if (errorVdxfDetails && !vdxfIdentityDetails) {
    return <StyledPaper><Alert severity="error" sx={{m:1}}>Error loading VerusID details for {selectedIdentityForVDXF}: {typeof errorVdxfDetails === 'object' ? JSON.stringify(errorVdxfDetails) : errorVdxfDetails}</Alert></StyledPaper>;
  }

  // Fix for "Current identity details not available for update" error
  // We need to check if we have either vdxfIdentityDetails or latestHistoryEntry with valid identity data
  const hasValidIdentityData = (
    vdxfIdentityDetails?.identity?.identityaddress || 
    (latestHistoryEntry?.identity?.identityaddress && 
     selectedIdentityForVDXF === latestHistoryEntry.fullyqualifiedname)
  );
  
  if (!hasValidIdentityData && !loadingVdxfDetails) {
    return <StyledPaper><Alert severity="warning" sx={{m:1}}>No valid identity details found for {selectedIdentityForVDXF}. Cannot update maps.</Alert></StyledPaper>;
  }

  const identity = vdxfIdentityDetails?.identity || latestHistoryEntry?.identity;
  const status = vdxfIdentityDetails?.status || latestHistoryEntry?.status;
  const fqn = vdxfIdentityDetails?.fullyqualifiedname || latestHistoryEntry?.fullyqualifiedname;
  const blockheight = vdxfIdentityDetails?.blockheight || latestHistoryEntry?.blockheight;
  const txid = vdxfIdentityDetails?.txid || latestHistoryEntry?.txid;
  const vout = vdxfIdentityDetails?.vout || latestHistoryEntry?.vout;

  return (
    <StyledPaper sx={{ overflowY: 'hidden', p:0 }}>
      <Typography variant="h6" gutterBottom sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0, mb:0 }}>
         Update Maps
      </Typography>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, minHeight: 0 }}>

        <Box component="section" mb={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: '#90caf9', fontWeight: 'bold' }}>Content Map</Typography>
            <IconButton size="small" onClick={() => setContentMapExpanded(!contentMapExpanded)} sx={{ ml: 'auto', color: '#90caf9' }}>
              {contentMapExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={contentMapExpanded}>
            <Paper sx={{ p: 2, background: '#1c1c1c', border: '1px solid #303030' }}>
              <Box component="form" onSubmit={(e) => {e.preventDefault(); handleAddContentMapEntries();}} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb:2 }}>
                {contentMapFormEntries.map((entry, index) => (
                  <Grid container spacing={1} key={index} alignItems="center">
                    <Grid item xs={5.5}>
                      <StyledInput variant="outlined" value={entry.key} onChange={e => handleContentMapFormChange(index, 'key', e.target.value)} placeholder={`Key ${index + 1} Hash160 (40 hex chars)`} size="small" />
                    </Grid>
                    <Grid item xs={5.5}>
                      <StyledInput variant="outlined" value={entry.value} onChange={e => handleContentMapFormChange(index, 'value', e.target.value)} placeholder={`Value ${index + 1} uint256 (64 hex chars)`} size="small" />
                    </Grid>
                    <Grid item xs={1}>
                      {contentMapFormEntries.length > 1 && (
                        <IconButton onClick={() => removeContentMapFormPair(index)} size="small" sx={{color: '#f44336'}}><RemoveCircleOutlineIcon /></IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
                <Box sx={{ display: 'flex', justifyContent:'space-between', alignItems:'center', mt:1}}>
                  <Button type="button" variant="outlined" size="small" onClick={addContentMapFormPair} startIcon={<AddCircleOutlineIcon />}>Add Pair</Button>
                  <Button type="submit" variant="contained" color="primary" size="small" disabled={isLoadingCM || !(vdxfIdentityDetails?.identity || latestHistoryEntry?.identity)}>Add to Content Map</Button>
                </Box>
                {contentMapError && <Alert severity="error" sx={{mt:1}} onClose={() => setContentMapError('')}>{contentMapError}</Alert>}
                {isLoadingCM && <CircularProgress size={24} sx={{mt:1}}/>}
              </Box>

              <Typography variant="body2" sx={{color: '#ccc', mb:1, mt: 2}}>Current Entries:</Typography>
              <Box sx={{ maxHeight: '200px', overflowY: 'auto', background: '#2a2a2a', p:1, borderRadius: '4px'}}>
                {currentContentMap && Object.keys(currentContentMap).length > 0 ? (
                  Object.entries(currentContentMap).map(([originalMapKey, originalMapValue]) => {
                    const isEditingThisEntry = editingEntriesData.hasOwnProperty(originalMapKey);
                    const displayValue = isEditingThisEntry ? editingEntriesData[originalMapKey].currentValue : originalMapValue;
                    return (
                      <Box key={originalMapKey} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3a3a3a', py: 0.5, '&:last-child': {borderBottom:0}, background: isEditingThisEntry ? '#333' : 'transparent' }}>
                        {!isEditingThisEntry && (
                          <Checkbox size="small" checked={selectedContentMapKeysToDelete.has(originalMapKey)} onChange={() => handleToggleContentMapSelection(originalMapKey)} sx={{p:0, mr:1, color:'#90caf9', '&.Mui-checked': {color: '#90caf9'}}}/>
                        )}
                        {isEditingThisEntry && <Box sx={{width: '28px'}} />} 
                        <Box sx={{flexGrow: 1, maxWidth: `calc(100% - ${isEditingThisEntry ? '70px' : '100px'})`, overflowX:'auto'}}>
                          {isEditingThisEntry ? (
                            <>
                              <StyledInput 
                                fullWidth
                                variant="standard" 
                                size="small"
                                sx={{ input: {fontSize: '0.8rem', padding:'2px 0px'}, mt:0.25}}
                                value={editingEntriesData[originalMapKey].currentKey}
                                onChange={(e) => handleInlineContentMapKeyChange(originalMapKey, e.target.value)}
                                placeholder="VDXF Key Hash (40 hex)"
                              />
                              <StyledInput 
                                fullWidth
                                variant="standard" 
                                size="small"
                                sx={{ input: {fontSize: '0.8rem', padding:'2px 0px'}, mt:0.25}}
                                value={editingEntriesData[originalMapKey].currentValue}
                                onChange={(e) => handleInlineContentMapValueChange(originalMapKey, e.target.value)}
                                placeholder="Content Hash Value (64 hex)"
                              />
                            </>
                          ) : (
                            <>
                              <Typography sx={{ fontSize: '0.8rem', color: '#90caf9', fontFamily: 'monospace', wordBreak:'break-all' }}>{originalMapKey}</Typography>
                              <Typography sx={{ fontSize: '0.8rem', color: '#ddd', fontFamily: 'monospace', wordBreak:'break-all', ml:2 }}>{displayValue}</Typography>
                            </>
                          )}
                        </Box>
                        <Box sx={{flexShrink:0}}>
                          <IconButton size="small" onClick={() => toggleInlineEditContentMap(originalMapKey, originalMapValue)} sx={{color: '#90caf9'}}>
                            {isEditingThisEntry ? <RemoveCircleOutlineIcon /> : <EditIcon fontSize="small"/>}
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })
                ) : <Typography sx={{color:'#777', fontStyle:'italic'}}>No content map entries.</Typography>}
              </Box>
              <Box sx={{mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button 
                    variant="outlined" 
                    color="error" 
                    size="small" 
                    onClick={handleDeleteSelectedContentMapEntries}
                    disabled={selectedContentMapKeysToDelete.size === 0 || isLoadingCM || Object.keys(editingEntriesData).length > 0 || !(vdxfIdentityDetails?.identity || latestHistoryEntry?.identity)}
                >
                    Delete Selected ({selectedContentMapKeysToDelete.size})
                </Button>
                <Button 
                    variant="contained" 
                    color="secondary"
                    size="small" 
                    startIcon={<SaveIcon />}
                    onClick={handleCommitAllModifiedContentMapEntries}
                    disabled={Object.keys(editingEntriesData).length === 0 || isLoadingCM || !(vdxfIdentityDetails?.identity || latestHistoryEntry?.identity)}
                >
                    Commit All Modified ({Object.keys(editingEntriesData).length})
                </Button>
              </Box>
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
                <StyledInput variant="outlined" value={multiMapPrimaryKeyInput} onChange={e => setMultiMapPrimaryKeyInput(e.target.value)} placeholder="Primary VDXF Key (i-address)" size="small" label="Primary VDXF Key"/>
                <StyledInput variant="outlined" value={multiMapNestedKeyInput} onChange={e => setMultiMapNestedKeyInput(e.target.value)} placeholder="Nested VDXF Key (i-address)" size="small" label="Nested VDXF Key"/>
                <StyledInput variant="outlined" value={multiMapJsonInput} onChange={e => setMultiMapJsonInput(e.target.value)} placeholder='Structured Data (JSON) e.g., { "message": "hello" }' multiline rows={6} size="small" label="JSON Data"/>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button type="submit" variant="contained" color="primary" size="small" disabled={isLoadingCMM || !(vdxfIdentityDetails?.identity || latestHistoryEntry?.identity)}>{editingMultiMapTarget ? 'Update Nested Entry' : 'Add to Multimap'}</Button>
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
                ) : <Typography sx={{color:'#777', fontStyle:'italic'}}>No content multi-map entries. (Data source: {vdxfIdentityDetails || latestHistoryEntry ? "Current Details/History" : "None"})</Typography>}
              </Box>
            </Paper>
          </Collapse>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default VdxfContentView; 