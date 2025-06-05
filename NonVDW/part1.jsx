import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, List, ListItem, ListItemButton, ListItemText, Divider, IconButton, Collapse, Tabs, Tab, Alert, CircularProgress, Select, MenuItem, Switch } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

function App() {
  const [verusPath, setVerusPath] = useState('');
  const [nodeStatus, setNodeStatus] = useState({ connected: false, error: null });
  const [lastCommand, setLastCommand] = useState('');
  const [identities, setIdentities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [identityDetails, setIdentityDetails] = useState(null);
  const [loadingIdentities, setLoadingIdentities] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [verusIdCommand, setVerusIdCommand] = useState('');
  const [transparentBalance, setTransparentBalance] = useState(null);
  const [vdxfUri, setVdxfUri] = useState('');
  const [parentVdxfKey, setParentVdxfKey] = useState('');
  const [uint256, setUint256] = useState('');
  const [indexNum, setIndexNum] = useState('');
  const [vdxfResult, setVdxfResult] = useState(null);
  const [vdxfError, setVdxfError] = useState('');
  const [vdxfKeys, setVdxfKeys] = useState([]);
  const [contentMapKey, setContentMapKey] = useState('');
  const [contentMapValue, setContentMapValue] = useState('');
  const [editingContentMap, setEditingContentMap] = useState(null);
  const [contentMapCommand, setContentMapCommand] = useState('');
  const [contentMultiMapPrimaryKey, setContentMultiMapPrimaryKey] = useState('');
  const [contentMultiMapNestedKey, setContentMultiMapNestedKey] = useState('');
  const [contentMultiMapJson, setContentMultiMapJson] = useState('');
  const [editingContentMultiMap, setEditingContentMultiMap] = useState(null);
  const [contentMultiMapError, setContentMultiMapError] = useState('');
  const [contentMultiMapCommand, setContentMultiMapCommand] = useState('');
  const [contentMapExpanded, setContentMapExpanded] = useState(true);
  const [transparentBalanceExpanded, setTransparentBalanceExpanded] = useState(true);
  const [lastVerusCommand, setLastVerusCommand] = useState('');
  const [verusCommandHistory, setVerusCommandHistory] = useState([]);
  const [contentMapHeight, setContentMapHeight] = useState(360); // initial height in px
  const contentMapRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const [contentMultiMapHeight, setContentMultiMapHeight] = useState(360); // initial height in px
  const [isResizingMultiMap, setIsResizingMultiMap] = useState(false);
  const contentMultiMapRef = useRef(null);
  const startYMultiMapRef = useRef(0);
  const startHeightMultiMapRef = useRef(0);
  const [contentMultiMapExpanded, setContentMultiMapExpanded] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1); // 0: VerusID, 1: VDXF, 2: Currency
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedSubOperation, setSelectedSubOperation] = useState(null);
  const [operationError, setOperationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [operationResult, setOperationResult] = useState(null);
  const [terminalFilter, setTerminalFilter] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  
  // Name commitment form state
  const [ncIdentityName, setNcIdentityName] = useState('');
  const [ncControlAddress, setNcControlAddress] = useState('');
  const [ncReferralIdentity, setNcReferralIdentity] = useState('');
  const [ncParentIdentity, setNcParentIdentity] = useState('');
  const [ncSourceAddress, setNcSourceAddress] = useState('');
  const [availableRAddresses, setAvailableRAddresses] = useState([]);

  // Register Identity form state
  const [riTxid, setRiTxid] = useState('');
  const [riName, setRiName] = useState('');
  const [riVersion, setRiVersion] = useState(1);
  const [riParent, setRiParent] = useState('iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq');
  const [riSalt, setRiSalt] = useState('');
  const [riReferral, setRiReferral] = useState('');
  const [riNameId, setRiNameId] = useState('');
  const [riPrimaryAddresses, setRiPrimaryAddresses] = useState(['']);
  const [riMinimumSignatures, setRiMinimumSignatures] = useState(1);
  const [riRevocationAuthorities, setRiRevocationAuthorities] = useState(['']);
  const [riRecoveryAuthorities, setRiRecoveryAuthorities] = useState(['']);
  const [riReturnTx, setRiReturnTx] = useState(false);
  const [riFeeOffer, setRiFeeOffer] = useState('');
  const [riSourceOfFunds, setRiSourceOfFunds] = useState('');
  const [riAdvancedOpen, setRiAdvancedOpen] = useState(false);
  const [riError, setRiError] = useState('');
  const [riLoading, setRiLoading] = useState(false);

  // Add after other state variables
  const [nameCommitments, setNameCommitments] = useState([]);
  const [selectedNameCommitment, setSelectedNameCommitment] = useState(null);

  // Get Identity state variables
  const [giIdentityNameOrId, setGiIdentityNameOrId] = useState('');
  const [giHeight, setGiHeight] = useState('');
  const [giTxProof, setGiTxProof] = useState(false);
  const [giTxProofHeight, setGiTxProofHeight] = useState('');
  const [giResult, setGiResult] = useState(null);
  const [giLoading, setGiLoading] = useState(false);
  const [giError, setGiError] = useState('');
  
  // List Identities state variables
  const [liIdentityNameOrId, setLiIdentityNameOrId] = useState('');
  const [liHeight, setLiHeight] = useState('');
  const [liTxProof, setLiTxProof] = useState(false);
  const [liTxProofHeight, setLiTxProofHeight] = useState('');
  const [liResult, setLiResult] = useState(null);
  const [liLoading, setLiLoading] = useState(false);
  const [liError, setLiError] = useState('');

  // Identities By Address state variables
  const [iwaAddress, setIwaAddress] = useState('');
  const [iwaIncludeWatchOnly, setIwaIncludeWatchOnly] = useState(false);
  const [iwaResult, setIwaResult] = useState(null);
  const [iwaLoading, setIwaLoading] = useState(false);
  const [iwaError, setIwaError] = useState('');

  // Identities With Address state variables
  const [iwtaIdentityId, setIwtaIdentityId] = useState('');
  const [iwtaFromHeight, setIwtaFromHeight] = useState('');
  const [iwtaToHeight, setIwtaToHeight] = useState('');
  const [iwtaUnspent, setIwtaUnspent] = useState(false);
  const [iwtaResult, setIwtaResult] = useState(null);
  const [iwtaLoading, setIwtaLoading] = useState(false);
  const [iwtaError, setIwtaError] = useState('');

  // Identities With Revocation state variables
  const [iwrIdentityId, setIwrIdentityId] = useState('');
  const [iwrFromHeight, setIwrFromHeight] = useState('');
  const [iwrToHeight, setIwrToHeight] = useState('');
  const [iwrUnspent, setIwrUnspent] = useState(false);
  const [iwrResult, setIwrResult] = useState(null);
  const [iwrLoading, setIwrLoading] = useState(false);
  const [iwrError, setIwrError] = useState('');
  
  // Identities With Recovery state variables
  const [iwcIdentityId, setIwcIdentityId] = useState('');
  const [iwcFromHeight, setIwcFromHeight] = useState('');
  const [iwcToHeight, setIwcToHeight] = useState('');
  const [iwcUnspent, setIwcUnspent] = useState(false);
  const [iwcResult, setIwcResult] = useState(null);
  const [iwcLoading, setIwcLoading] = useState(false);
  const [iwcError, setIwcError] = useState('');
  
  // Identity Content state variables
  const [icIdentityNameOrId, setIcIdentityNameOrId] = useState('');
  const [icHeightStart, setIcHeightStart] = useState('');
  const [icHeightEnd, setIcHeightEnd] = useState('');
  const [icTxProofs, setIcTxProofs] = useState(false);
  const [icTxProofHeight, setIcTxProofHeight] = useState('');
  const [icVdxfKey, setIcVdxfKey] = useState('');
  const [icKeepDeleted, setIcKeepDeleted] = useState(false);
  const [icResult, setIcResult] = useState(null);
  const [icLoading, setIcLoading] = useState(false);
  const [icError, setIcError] = useState('');

  // Identity History state variables
  const [ihIdentityNameOrId, setIhIdentityNameOrId] = useState('');
  const [ihHeightStart, setIhHeightStart] = useState('');
  const [ihHeightEnd, setIhHeightEnd] = useState('');
  const [ihTxProofs, setIhTxProofs] = useState(false);
  const [ihTxProofHeight, setIhTxProofHeight] = useState('');
  const [ihLoading, setIhLoading] = useState(false);
  const [ihError, setIhError] = useState('');
  const [ihResult, setIhResult] = useState(null);

  // Identity Trust state
  const [itIdentityIds, setItIdentityIds] = useState(['']);
  const [itLoading, setItLoading] = useState(false);
  const [itError, setItError] = useState('');
  const [itResult, setItResult] = useState(null);

  // Terminal panel state
  const [terminalHeight, setTerminalHeight] = useState(250);
  
  useEffect(() => {
    // Load saved Verus path on component mount
    window.electron.ipcRenderer.invoke('get-verus-path').then(path => {
      if (path) setVerusPath(path);
    });
  }, []);

  // Fetch identities when node is connected
  useEffect(() => {
    if (nodeStatus.connected) {
      fetchIdentities();
    }
  }, [nodeStatus]);

  const fetchIdentities = async () => {
    setLoadingIdentities(true);
    const command = verusPath ? `${verusPath}/verus -chain=VRSCTEST listidentities` : './verus -chain=VRSCTEST listidentities';
    setVerusIdCommand(command);
    setLastVerusCommand(command);
    console.log('Executing command:', command);
    try {
      const result = await sendRPCCommandWithLogging('listidentities', [], 'common');
      if (result && Array.isArray(result)) {
        setIdentities(result);
      } else if (result && result.error) {
        setIdentities({ error: result.error });
      } else {
        setIdentities([]);
      }
    } catch (err) {
      setIdentities({ error: err.message || 'Error fetching identities' });
    }
    setLoadingIdentities(false);
  };

  const fetchIdentityDetails = async (name) => {
    setLoadingDetails(true);
    setIdentityDetails(null);
    setSelectedId(name);

    // Find the identity object in the list
    const found = identities.find((item) => item.identity && item.identity.name === name);
    let identityParam = name;
    if (found && found.identity) {
      if (found.identity.fullyqualifiedname) {
        identityParam = found.identity.fullyqualifiedname;
      } else if (found.identity.name && found.identity.parent) {
        const parent = found.identity.parent === 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq' ? 'VRSCTEST' : found.identity.parent;
        identityParam = `${found.identity.name}.${parent}@`;
      } else if (found.identity.identityaddress) {
        identityParam = found.identity.identityaddress;
      }
    }

    try {
      // Use sendRPCCommandWithLogging but extract the identity data appropriately
      const result = await sendRPCCommandWithLogging('getidentitycontent', [identityParam], 'common');
      
      // The response from getidentitycontent contains the data in the identity field
      if (result && result.identity) {
        setIdentityDetails(result.identity);
      } else {
        // If no identity field, use the entire result as it might be the identity already
        setIdentityDetails(result);
      }
      
      console.log('Fetched identity details:', result);
    } catch (err) {
      setIdentityDetails({ error: err.message || 'Error fetching identity details' });
    }
    setLoadingDetails(false);
  };

  const handleSelectDirectory = async () => {
    const selected = await window.electron.ipcRenderer.invoke('select-verus-directory');
    if (selected) setVerusPath(selected);
  };

  const checkNodeConnection = async () => {
    const command = verusPath ? `${verusPath}/verus -chain=VRSCTEST getinfo` : './verus -chain=VRSCTEST getinfo';
    setLastCommand(command);
    setLastVerusCommand(command);
    console.log('Executing command:', command);
    try {
      const result = await sendRPCCommandWithLogging('getinfo', [], 'common');
      setNodeStatus(result);
    } catch (err) {
      setNodeStatus({ connected: false, error: err.message || 'Error checking node connection' });
    }
  };

  useEffect(() => {
    if (identityDetails && identityDetails.identityaddress) {
      setTransparentBalance(null); // show loading
      sendRPCCommandWithLogging('getcurrencybalance', [identityDetails.identityaddress], 'common')
        .then(setTransparentBalance)
        .catch(e => setTransparentBalance({ error: e.message || 'Error fetching balance' }));
    }
  }, [identityDetails]);

  // Load saved VDXF keys on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('vdxfKeys');
    if (savedKeys) {
      setVdxfKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Save VDXF keys whenever they change
  useEffect(() => {
    localStorage.setItem('vdxfKeys', JSON.stringify(vdxfKeys));
  }, [vdxfKeys]);

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCreateVdxfKey = async (e) => {
    e.preventDefault();
    setVdxfError('');
    setVdxfResult(null);

    if (!vdxfUri.trim()) {
      setVdxfError('VDXF URI is required.');
      return;
    }

    // Validate uint256 if provided
    if (uint256.trim()) {
      const hexRegex = /^[0-9a-fA-F]{64}$/; // 32 bytes = 64 hex characters
      if (!hexRegex.test(uint256.trim())) {
        setVdxfError('uint256 must be a 32-byte hex string (64 hexadecimal characters).');
        return;
      }
    }

    // Build extraparams object
    const extraparams = {};
    if (parentVdxfKey.trim()) extraparams.vdxfkey = parentVdxfKey.trim();
    if (uint256.trim()) extraparams.uint256 = uint256.trim();
    if (indexNum.trim()) extraparams.indexnum = parseInt(indexNum, 10);

    try {
      const command = `get-vdxfid ${vdxfUri.trim()} ${JSON.stringify(extraparams)}`;
      setLastVerusCommand(command);
      console.log('Executing command:', command);
      const result = await sendRPCCommandWithLogging('get-vdxfid', [vdxfUri.trim(), extraparams], 'common');
      if (result.error) {
        setVdxfError(result.error);
      } else {
        setVdxfResult(result);
        // Add the new key to the list with the extraparams used
        setVdxfKeys(prevKeys => [{
          timestamp: new Date().toISOString(),
          uri: vdxfUri.trim(),
          result: result,
          extraparams: extraparams
        }, ...prevKeys]);
      }
    } catch (err) {
      setVdxfError('Failed to create VDXF key.');
    }
  };

  const handleAddContentMap = async () => {
    if (!contentMapKey.trim() || !contentMapValue.trim()) {
      setVdxfError('Both key and value are required for content map entries.');
      return;
    }

    try {
      // Get current contentmap entries
      const currentContentMap = { ...identityDetails.contentmap };
      // If editing and the key name changed, remove the old key
      if (editingContentMap && editingContentMap !== contentMapKey.trim()) {
        delete currentContentMap[editingContentMap];
      }
      // Set or update the value for the (possibly new) key
      currentContentMap[contentMapKey.trim()] = contentMapValue.trim();

      // Update command display with complete contentmap
      const command = `./verus -chain=VRSCTEST updateidentity '{"name":"${identityDetails.identityaddress}","contentmap":${JSON.stringify(currentContentMap)}}'`;
      setLastVerusCommand(command);
      setContentMapCommand(command);
      console.log('Executing command:', command);

      const result = await sendRPCCommandWithLogging('update-content-map', [{
        identity: identityDetails.identityaddress,
        key: contentMapKey.trim(),
        value: contentMapValue.trim(),
        contentmap: currentContentMap
      }], 'common');

      if (result.error) {
        setVdxfError(result.error);
      } else {
        // Refresh identity details to show updated content map
        await fetchIdentityDetails(selectedId);
        // Clear form
        setContentMapKey('');
        setContentMapValue('');
        setEditingContentMap(null);
        setContentMapCommand('');
      }
    } catch (err) {
      setVdxfError('Failed to update content map.');
    }
  };

  const handleEditContentMap = (key, value) => {
    setContentMapKey(key);
    setContentMapValue(value);
    setEditingContentMap(key);
    
    // Show the command that will be executed with complete contentmap
    const currentContentMap = { ...identityDetails.contentmap };
    currentContentMap[key] = value;
    const command = `./verus -chain=VRSCTEST updateidentity '{"name":"${identityDetails.identityaddress}","contentmap":${JSON.stringify(currentContentMap)}}'`;
    setContentMapCommand(command);
  };

  const handleRemoveContentMap = async (key) => {
    try {
      // Get current contentmap entries
      const currentContentMap = { ...identityDetails.contentmap };
      delete currentContentMap[key];

      // Update command display with complete contentmap
      const command = `./verus -chain=VRSCTEST updateidentity '{"name":"${identityDetails.identityaddress}","contentmap":${JSON.stringify(currentContentMap)}}'`;
      setLastVerusCommand(command);
      setContentMapCommand(command);
      console.log('Executing command:', command);

      const result = await sendRPCCommandWithLogging('update-content-map', [{
        identity: identityDetails.identityaddress,
        key: key,
        value: '', // Empty value for deletion
        contentmap: currentContentMap
      }], 'common');

      if (result.error) {
        setVdxfError(result.error);
      } else {
        // Refresh identity details to show updated content map
        await fetchIdentityDetails(selectedId);
        setContentMapCommand('');
      }
    } catch (err) {
      setVdxfError('Failed to remove content map entry.');
    }
  };

  const handleCancelEdit = () => {
    setContentMapKey('');
    setContentMapValue('');
    setEditingContentMap(null);
    setContentMapCommand('');
  };

  function renderContentMultiMapEntry(entry, indent = 0) {
    // If entry is a nested VDXF object (e.g., { nestedKey: { ...data } })
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
          <Typography sx={{ color: '#90caf9', fontWeight: 700, fontSize: '11px', fontFamily: 'monospace', mb: 0.25, lineHeight: 1.1 }}>
            Nested VDXF Key: {nestedKey}
          </Typography>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.version !== undefined && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}>
                <span style={{ minWidth: 90, fontWeight: 700 }}>Version:</span>
                <span>{data.version}</span>
              </li>
            )}
            {data.flags !== undefined && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}>
                <span style={{ minWidth: 90, fontWeight: 700 }}>Flags:</span>
                <span>{data.flags}</span>
              </li>
            )}
            {data.mimetype && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}>
                <span style={{ minWidth: 90, fontWeight: 700 }}>MIME Type:</span>
                <span>{data.mimetype}</span>
              </li>
            )}
            {data.objectdata && data.objectdata.message && (
              <li style={{ display: 'flex', fontSize: '11px', lineHeight: 1.1 }}>
                <span style={{ minWidth: 90, fontWeight: 700 }}>Message:</span>
                <span>{data.objectdata.message}</span>
              </li>
            )}
            {/* Show any other fields in a generic aligned way */}
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
    // If entry is an array, render each item
    if (Array.isArray(entry)) {
      return (
        <Box>
          {entry.map((item, idx) => (
            <div key={idx}>{renderContentMultiMapEntry(item, indent + 16)}</div>
          ))}
        </Box>
      );
    }
    // If entry is a plain object (not a nested VDXF object)
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
    // Fallback for primitives
    return <span style={{ fontSize: '11px', lineHeight: 1.1 }}>{String(entry)}</span>;
  }

  const handleEditContentMultiMap = (primaryKey, nestedKey, data) => {
    // Find the index of the entry being edited
    const idx = identityDetails.contentmultimap && identityDetails.contentmultimap[primaryKey]
      ? identityDetails.contentmultimap[primaryKey].findIndex(entry => Object.keys(entry)[0] === nestedKey)
      : -1;
    setContentMultiMapPrimaryKey(primaryKey);
    setContentMultiMapNestedKey(nestedKey);
    setContentMultiMapJson(JSON.stringify(data, null, 2));
    setEditingContentMultiMap({ primaryKey, nestedKey, idx });
  };

  const handleAddOrEditContentMultiMap = async () => {
    setContentMultiMapError('');
    // Validate i-addresses
    if (!contentMultiMapPrimaryKey.trim().startsWith('i') || contentMultiMapPrimaryKey.trim().length !== 34) {
      setContentMultiMapError('Primary VDXF Key must be a valid i-address (34 chars, starts with i)');
      return;
    }
    if (!contentMultiMapNestedKey.trim().startsWith('i') || contentMultiMapNestedKey.trim().length !== 34) {
      setContentMultiMapError('Nested VDXF Key must be a valid i-address (34 chars, starts with i)');
      return;
    }
    let parsedJson;
    try {
      parsedJson = JSON.parse(contentMultiMapJson);
    } catch (e) {
      setContentMultiMapError('Structured Data must be valid JSON');
      return;
    }

    // Clone the current contentmultimap
    const newContentMultiMap = JSON.parse(JSON.stringify(identityDetails.contentmultimap || {}));
    if (!newContentMultiMap[contentMultiMapPrimaryKey]) newContentMultiMap[contentMultiMapPrimaryKey] = [];

    // If editing, replace the entry at the stored index
    if (editingContentMultiMap && editingContentMultiMap.primaryKey === contentMultiMapPrimaryKey && editingContentMultiMap.idx !== undefined && editingContentMultiMap.idx !== -1) {
      newContentMultiMap[contentMultiMapPrimaryKey][editingContentMultiMap.idx] = { [contentMultiMapNestedKey.trim()]: parsedJson };
    } else {
      // Not editing, just append
      newContentMultiMap[contentMultiMapPrimaryKey].push({ [contentMultiMapNestedKey.trim()]: parsedJson });
    }

    // Show the command in the debug window
    const command = `./verus -chain=VRSCTEST updateidentity '{"name":"${identityDetails.identityaddress}","contentmultimap":${JSON.stringify(newContentMultiMap)}}'`;
    setContentMultiMapCommand(command);
    setLastVerusCommand(command);
    console.log('Executing command:', command);

    // Call the backend
    try {
      const result = await sendRPCCommandWithLogging('update-content-multimap', [{
        identity: identityDetails.identityaddress,
        contentmultimap: newContentMultiMap
      }], 'common');
      if (result.error) {
        setContentMultiMapError(result.error);
      } else {
        // Refresh identity details to show updated contentmultimap
        await fetchIdentityDetails(selectedId);
        setContentMultiMapPrimaryKey('');
        setContentMultiMapNestedKey('');
        setContentMultiMapJson('');
        setEditingContentMultiMap(null);
        setContentMultiMapCommand('');
      }
    } catch (err) {
      setContentMultiMapError('Failed to update content multimap.');
    }
  };

  // Test function to verify contentmultimap update logic
  const testContentMultiMapUpdates = async () => {
    if (!identityDetails) {
      console.error('No identity selected');
      return;
    }

    // Test 1: Add first entry
    setContentMultiMapPrimaryKey("iRcMatHtfjxyQSZTHgfD6SbwLyT39kM1zJ");
    setContentMultiMapNestedKey("i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv");
    setContentMultiMapJson(JSON.stringify({
      "version": 1,
      "flags": 96,
      "mimetype": "text/plain",
      "objectdata": {
        "message": "First Entry"
      },
      "label": "i59nzmfL33gckLj13ACzhLe5QNXbyB8YhK"
    }, null, 2));
    await handleAddOrEditContentMultiMap();

    // Test 2: Add entry with same label (should replace first)
    setContentMultiMapPrimaryKey("iRcMatHtfjxyQSZTHgfD6SbwLyT39kM1zJ");
    setContentMultiMapNestedKey("i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv");
    setContentMultiMapJson(JSON.stringify({
      "version": 1,
      "flags": 96,
      "mimetype": "text/plain",
      "objectdata": {
        "message": "Second Entry"
      },
      "label": "i59nzmfL33gckLj13ACzhLe5QNXbyB8YhK"
    }, null, 2));
    await handleAddOrEditContentMultiMap();

    // Test 3: Add entry with different label (should coexist)
    setContentMultiMapPrimaryKey("iRcMatHtfjxyQSZTHgfD6SbwLyT39kM1zJ");
    setContentMultiMapNestedKey("i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv");
    setContentMultiMapJson(JSON.stringify({
      "version": 1,
      "flags": 96,
      "mimetype": "text/plain",
      "objectdata": {
        "message": "Third Entry"
      },
      "label": "iQGCpYRadDmDYsAHwehMTqruNQMJNSbbRk"
    }, null, 2));
    await handleAddOrEditContentMultiMap();
  };

  const handleDeleteContentMultiMap = async (primaryKey, nestedKey) => {
    const newContentMultiMap = JSON.parse(JSON.stringify(identityDetails.contentmultimap || {}));
    newContentMultiMap[primaryKey] = newContentMultiMap[primaryKey].filter(
      entry => Object.keys(entry)[0] !== nestedKey
    );
    if (newContentMultiMap[primaryKey].length === 0) delete newContentMultiMap[primaryKey];

    // Show the command in the debug window
    const command = `./verus -chain=VRSCTEST updateidentity '{"name":"${identityDetails.identityaddress}","contentmultimap":${JSON.stringify(newContentMultiMap)}}'`;
    setContentMultiMapCommand(command);
    setLastVerusCommand(command);
    console.log('Executing command:', command);

    try {
      const result = await sendRPCCommandWithLogging('update-content-multimap', [{
        identity: identityDetails.identityaddress,
        contentmultimap: newContentMultiMap
      }], 'common');
      if (result.error) {
        setContentMultiMapError(result.error);
      } else {
        // Refresh identity details to show updated contentmultimap
        await fetchIdentityDetails(selectedId);
        setContentMultiMapPrimaryKey('');
        setContentMultiMapNestedKey('');
        setContentMultiMapJson('');
        setEditingContentMultiMap(null);
        setContentMultiMapCommand('');
      }
    } catch (err) {
      setContentMultiMapError('Failed to delete content multimap entry.');
    }
  };

  const handleCancelEditContentMultiMap = () => {
    setContentMultiMapPrimaryKey('');
    setContentMultiMapNestedKey('');
    setContentMultiMapJson('');
    setEditingContentMultiMap(null);
  };

  const handleSaveVdxfKeys = async () => {
    try {
      // This is a UI/file operation, not an RPC command, so keep it as direct invoke
      const result = await window.electron.ipcRenderer.invoke('save-vdxf-keys', vdxfKeys);
      if (result.error) {
        console.error('Failed to save VDXF keys:', result.error);
      }
    } catch (err) {
      console.error('Error saving VDXF keys:', err);
    }
  };

  const handleLoadVdxfKeys = async () => {
    try {
      // This is a UI/file operation, not an RPC command, so keep it as direct invoke
      const result = await window.electron.ipcRenderer.invoke('load-vdxf-keys');
      if (result.error) {
        console.error('Failed to load VDXF keys:', result.error);
      } else if (result.keys) {
        setVdxfKeys(result.keys);
      }
    } catch (err) {
      console.error('Error loading VDXF keys:', err);
    }
  };

  const handleDeleteVdxfKey = (index) => {
    setVdxfKeys(prevKeys => prevKeys.filter((_, i) => i !== index));
  };

  const handleSaveContentMap = async () => {
    if (!identityDetails || !identityDetails.contentmap) return;
    try {
      // This is a UI/file operation, not an RPC command, so keep it as direct invoke
      await window.electron.ipcRenderer.invoke('save-content-map', identityDetails.contentmap);
    } catch (err) {
      console.error('Error saving content map:', err);
    }
  };

  const handleBatchAddContentMap = async () => {
    if (!identityDetails || !identityDetails.identityaddress) return;
    try {
      const result = await sendRPCCommandWithLogging('batch-add-content-map', [identityDetails.identityaddress], 'common');
      if (result && result.error) {
        setVdxfError(result.error);
      } else if (result && result.txid) {
        setVdxfError('Batch update successful! TXID: ' + result.txid);
      } else {
        setVdxfError('Batch update completed, but no TXID returned.');
      }
      // Refresh identity details to show updated content map
      await fetchIdentityDetails(selectedId);
    } catch (err) {
      setVdxfError('Error performing batch add to content map.');
    }
  };

  // Mouse event handlers for resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = contentMapHeight;
    document.body.style.cursor = 'ns-resize';
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const dy = e.clientY - startYRef.current;
      let newHeight = startHeightRef.current + dy;
      newHeight = Math.max(80, Math.min(400, newHeight)); // min 80px, max 400px
      setContentMapHeight(newHeight);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
    };
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const handleMouseDownMultiMap = (e) => {
    setIsResizingMultiMap(true);
    startYMultiMapRef.current = e.clientY;
    startHeightMultiMapRef.current = contentMultiMapHeight;
    document.body.style.cursor = 'ns-resize';
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingMultiMap) return;
      const dy = e.clientY - startYMultiMapRef.current;
      let newHeight = startHeightMultiMapRef.current + dy;
      newHeight = Math.max(80, Math.min(400, newHeight)); // min 80px, max 400px
      setContentMultiMapHeight(newHeight);
    };
    const handleMouseUp = () => {
      setIsResizingMultiMap(false);
      document.body.style.cursor = '';
    };
    if (isResizingMultiMap) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingMultiMap]);

  const handleCopyTerminalContent = () => {
    try {
      const filteredHistory = terminalFilter 
        ? terminalHistory.filter(entry => getCommandType(entry.method) === terminalFilter)
        : terminalHistory;
      
      const textContent = filteredHistory.map(entry => {
        return `Timestamp: ${entry.timestamp}
Command: ${entry.method}
Parameters: ${JSON.stringify(entry.params, null, 2)}
Result: ${entry.error ? `ERROR: ${JSON.stringify(entry.error, null, 2)}` : JSON.stringify(entry.result, null, 2)}
-----------------------------------`;
      }).join('\n\n');
      
      navigator.clipboard.writeText(textContent);
      
      // Show notification
      console.log('Terminal content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy terminal content:', error);
    }
  };

  const handleSaveTerminalContent = async () => {
    try {
      const filteredHistory = terminalFilter 
        ? terminalHistory.filter(entry => getCommandType(entry.method) === terminalFilter)
        : terminalHistory;
      
      const textContent = filteredHistory.map(entry => {
        return `Timestamp: ${entry.timestamp}
Command: ${entry.method}
Parameters: ${JSON.stringify(entry.params, null, 2)}
Result: ${entry.error ? `ERROR: ${JSON.stringify(entry.error, null, 2)}` : JSON.stringify(entry.result, null, 2)}
-----------------------------------`;
      }).join('\n\n');
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `verus-rpc-terminal-${timestamp}.txt`;
      
      // Use electron's showSaveDialog to let user choose save location
      const { filePath } = await window.electron.showSaveDialog({
        title: 'Save Terminal History',
        defaultPath: fileName,
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (filePath) {
        await window.electron.saveFile(filePath, textContent);
        console.log(`Terminal history saved to ${filePath}`);
      }
    } catch (error) {
      console.error('Failed to save terminal history:', error);
    }
  };

  const handleClearTerminal = () => {
    setTerminalHistory([]);
  };

  const handleCopyResult = () => {
    try {
      const resultText = typeof operationResult === 'string' 
        ? operationResult 
        : JSON.stringify(operationResult, null, 2);
      navigator.clipboard.writeText(resultText);
      console.log('Result copied to clipboard');
    } catch (error) {
      console.error('Failed to copy result:', error);
    }
  };

  // Helper function to categorize RPC commands
  const getCommandType = (method) => {
    const identityCommands = ['registeridentity', 'registernamecommitment', 'updateidentity', 
                           'recoveridentity', 'revokeidentity', 'setidentitytimelock', 'setidentitytrust'];
    
    const cryptoCommands = ['signmessage', 'signfile', 'signdata', 'verifymessage', 
                          'verifyfile', 'verifyhash', 'verifysignature'];
    
    const queryCommands = ['getidentity', 'listidentities', 'getidentitieswithaddress',
                         'getidentitieswithrecovery', 'getidentitieswithrevocation',
                         'getidentitycontent', 'getidentityhistory', 'getidentitytrust'];
    
    if (identityCommands.includes(method)) return 'identity';
    if (cryptoCommands.includes(method)) return 'crypto';
    if (queryCommands.includes(method)) return 'query';
    return 'other';
  };

  // Wrapped RPC function with logging
  const sendRPCCommandWithLogging = async (method, params, context) => {
    try {
      setIsLoading(true);
      const timestamp = new Date().toISOString();
      const result = await window.electron.ipcRenderer.invoke('sendRPCCommand', method, params);
      const entry = { timestamp, method, params, result, error: null, context };
      setTerminalHistory(prev => [...prev, entry]);
      setOperationResult(result);
      setOperationError('');
      return result;
    } catch (error) {
      const entry = {
        timestamp: new Date().toISOString(),
        method,
        params,
        result: null,
        error: error.message || 'Unknown error',
        context
      };
      setTerminalHistory(prev => [...prev, entry]);
      setOperationError(error.message || 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if daemon is running with required parameters
  const checkDaemonSettings = async () => {
    try {
      // Try an operation that requires idindex=1
      await sendRPCCommandWithLogging('getidentitieswithaddress', [{
        address: "RN5H3tQgCC5wozAE7a3qeY7Z9apz6cnK6R"
      }], 'verusid');
      return true;
    } catch (error) {
      if (error.message && error.message.includes("requires -idindex=1")) {
        setOperationError("Daemon must be started with -idindex=1 parameter. Please restart the daemon with this parameter.");
        return false;
      }
      return true; // Return true for other errors as they may not be related to daemon settings
    }
  };
  
  // Reset form fields for name commitment
  const resetNameCommitmentForm = () => {
    setNcIdentityName('');
    setNcControlAddress('');
    setNcReferralIdentity('');
    setNcParentIdentity('');
    setNcSourceAddress('');
  };
  
  // Load saved name commitments on component mount
  useEffect(() => {
    const savedCommitments = localStorage.getItem('nameCommitments');
    if (savedCommitments) {
      setNameCommitments(JSON.parse(savedCommitments));
    }
  }, []);

  // Save name commitments whenever they change
  useEffect(() => {
    localStorage.setItem('nameCommitments', JSON.stringify(nameCommitments));
  }, [nameCommitments]);

  // Add a name commitment to the list
  const addNameCommitment = (commitment) => {
    // Add timestamp for sorting/reference
    const commitmentWithTimestamp = {
      ...commitment,
      timestamp: new Date().toISOString()
    };
    setNameCommitments(prev => [commitmentWithTimestamp, ...prev]);
  };

  // Remove a name commitment from the list
  const removeNameCommitment = (txid) => {
    setNameCommitments(prev => prev.filter(commitment => commitment.txid !== txid));
    if (selectedNameCommitment && selectedNameCommitment.txid === txid) {
      setSelectedNameCommitment(null);
    }
  };

  // Update handleNameCommitment to save results to the list
  const handleNameCommitment = async (e) => {
    e.preventDefault();
    setOperationError('');
    setIsLoading(true);
    
    if (!ncIdentityName) {
      setOperationError('Identity name is required');
      setIsLoading(false);
      return;
    }
    
    // Check if daemon has required settings
    const hasCorrectSettings = await checkDaemonSettings();
    if (!hasCorrectSettings) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Build parameters list
      const params = [ncIdentityName];
      
      // Add control address if provided
      if (ncControlAddress) {
        params.push(ncControlAddress);
      } else {
        params.push(null);
      }
      
      // Add referral identity if provided
      if (ncReferralIdentity) {
        params.push(ncReferralIdentity);
      } else if (ncParentIdentity || ncSourceAddress) {
        // Need to include null for referral if we want to specify parent or source
        params.push(null);
      }
      
      // Add parent identity if provided
      if (ncParentIdentity) {
        params.push(ncParentIdentity);
      } else if (ncSourceAddress) {
        // Need to include null for parent if we want to specify source
        params.push(null);
      }
      
      // Add source address if provided
      if (ncSourceAddress) {
        params.push(ncSourceAddress);
      }
      
      // Send RPC command
      const result = await sendRPCCommandWithLogging('registernamecommitment', params, 'verusid');
      
      // Store the name commitment with additional metadata
      if (result && result.txid && result.namereservation) {
        const commitment = {
          ...result,
          identityName: ncIdentityName,
          controlAddress: ncControlAddress,
          referralIdentity: ncReferralIdentity,
          parentIdentity: ncParentIdentity,
          sourceAddress: ncSourceAddress
        };
        addNameCommitment(commitment);
      }
      
      // Reset form on success
      resetNameCommitmentForm();
    } catch (error) {
      // Error is already handled by sendRPCCommandWithLogging
      console.error('Name commitment error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form when operation changes
  useEffect(() => {
    setSelectedSubOperation(null);
    setOperationResult(null);
    setOperationError('');
  }, [selectedOperation]);

  // Reset results when sub-operation changes
  useEffect(() => {
    setOperationResult(null);
    setOperationError('');
    
    // Reset form fields based on selected sub-operation
    if (selectedSubOperation === 'namecommitment') {
      resetNameCommitmentForm();
    }
  }, [selectedSubOperation]);

  useEffect(() => {
    // ... existing code ...
  }, [selectedOperation, selectedSubOperation, terminalFilter, terminalHistory]);

  useEffect(() => {
    if (selectedSubOperation === 'namecommitment') {
      sendRPCCommandWithLogging('listaddressgroupings', [], 'common')
        .then(result => {
          if (Array.isArray(result)) {
            // Flatten and filter for R-addresses
            const addrs = result.flat().map(arr => arr[0]).filter(addr => addr && addr[0] === 'R');
            setAvailableRAddresses(addrs);
          }
        })
        .catch(err => console.error('Error loading R-addresses:', err));
    }
  }, [selectedSubOperation]);

  // Helper function to format a CLI command from RPC method and params
  const formatCliCommand = (method, params) => {
    // Start with the base command
    let command = `./verus -chain=VRSCTEST ${method}`;
    
    // Special case formatting for specific commands
    if (method === 'updateidentity' && params && params[0] && typeof params[0] === 'object') {
      // Format updateidentity command with pretty JSON
      return `./verus -chain=VRSCTEST ${method} '${JSON.stringify(params[0], null, 0)}'`;
    } else if (method === 'registernamecommitment' && Array.isArray(params)) {
      // Format parameters appropriately for registernamecommitment
      return `./verus -chain=VRSCTEST ${method} ${params.map(p => p === null ? 'null' : `"${p}"`).join(' ')}`;
    } else if (method === 'getidentitycontent' && Array.isArray(params) && params.length > 0) {
      // Format getidentitycontent command
      return `./verus -chain=VRSCTEST ${method} "${params[0]}"`;
    }
    
    // Default formatting for other commands
    if (Array.isArray(params) && params.length > 0) {
      // For simple parameters, just join them
      if (params.every(p => p === null || typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean')) {
        command += ' ' + params.map(p => p === null ? 'null' : `"${p}"`).join(' ');
      } else {
        // For complex parameters, stringify them
        command += ' ' + params.map(p => typeof p === 'object' ? `'${JSON.stringify(p)}'` : (p === null ? 'null' : `"${p}"`)).join(' ');
      }
    }
    
    return command;
  };

  // Helper function to render key-value pairs recursively in parameter: data format
  function renderKeyValuePairs(data, indent = 0) {
    if (typeof data !== 'object' || data === null) {
      return <span style={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}>{String(data)}</span>;
    }
    if (Array.isArray(data)) {
      return (
        <ul style={{ marginLeft: indent + 16, padding: 0 }}>
          {data.map((item, idx) => (
            <li key={idx}>{renderKeyValuePairs(item, indent + 16)}</li>
          ))}
        </ul>
      );
    }
    // Find the longest key for alignment
    const entries = Object.entries(data);
    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
    return (
      <ul style={{ marginLeft: indent, padding: 0 }}>
        {entries.map(([key, value], i) => (
          <li key={i} style={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all', display: 'block', alignItems: 'flex-start' }}>
            <span style={{ color: '#90caf9', fontWeight: 700, minWidth: `${maxKeyLength + 1}ch`, display: 'inline-block' }}>{key}:</span>
            {typeof value === 'object' && value !== null
              ? <div style={{ marginLeft: 24 }}>{renderKeyValuePairs(value, indent + 16)}</div>
              : <span style={{ marginLeft: 8 }}>{renderKeyValuePairs(value, indent + 16)}</span>
            }
          </li>
        ))}
      </ul>
    );
  }

  // Autofill from name commitment if available
  useEffect(() => {
    if (selectedSubOperation === 'registeridentity' && ncIdentityName && ncControlAddress && ncParentIdentity && ncSourceAddress) {
      setRiName(ncIdentityName);
      setRiPrimaryAddresses([ncControlAddress]);
      setRiParent(ncParentIdentity || 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq');
      setRiSourceOfFunds(ncSourceAddress);
    }
  }, [selectedSubOperation, ncIdentityName, ncControlAddress, ncParentIdentity, ncSourceAddress]);

  const handleAddToArray = (arr, setArr) => setArr([...arr, '']);
  const handleRemoveFromArray = (arr, setArr, idx) => setArr(arr.filter((_, i) => i !== idx));
  const handleArrayChange = (arr, setArr, idx, value) => setArr(arr.map((v, i) => i === idx ? value : v));

  const handleRegisterIdentity = async (e) => {
    e.preventDefault();
    setRiError('');
    setRiLoading(true);
    try {
      // Build params for registeridentity
      const params = {
        txid: riTxid,
        namereservation: {
          version: riVersion,
          name: riName,
          parent: riParent,
          salt: riSalt,
          referral: riReferral,
          nameid: riNameId
        },
        identity: {
          name: riName,
          primaryaddresses: riPrimaryAddresses.filter(Boolean),
          minimumsignatures: Number(riMinimumSignatures),
          revocationauthority: riRevocationAuthorities.filter(Boolean),
          recoveryauthority: riRecoveryAuthorities.filter(Boolean)
        }
      };
      // Remove empty optional fields
      if (!riReferral) delete params.namereservation.referral;
      if (!riNameId) delete params.namereservation.nameid;
      // Advanced options
      let rpcParams = [params];
      if (riReturnTx) rpcParams.push(true);
      if (riFeeOffer) rpcParams.push(Number(riFeeOffer));
      if (riSourceOfFunds) rpcParams.push(riSourceOfFunds);
      const result = await sendRPCCommandWithLogging('registeridentity', rpcParams, 'verusid');
      
      // If successful, remove this name commitment from our list
      if (result && !result.error) {
        // Remove the name commitment that was used in this registration
        removeNameCommitment(riTxid);
        
        // Reset form
        setRiTxid('');
        setRiName('');
        setRiSalt('');
        setRiParent('iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq');
        setRiNameId('');
        setRiReferral('');
        setRiPrimaryAddresses(['']);
        setRiMinimumSignatures(1);
        setRiRevocationAuthorities(['']);
        setRiRecoveryAuthorities(['']);
        setRiSourceOfFunds('');
        setRiFeeOffer('');
        setSelectedNameCommitment(null);
      }
    } catch (err) {
      setRiError(err.message || 'Failed to register identity');
    }
    setRiLoading(false);
  };

  // Handler for Get Identity operation
  const handleGetIdentity = async (e) => {
    e.preventDefault();
    setGiLoading(true);
    setGiError('');
    setGiResult(null);
    
    try {
      // Prepare parameters for getidentity
      let params = [giIdentityNameOrId];
      
      // Add optional parameters if provided
      if (giHeight) params.push(Number(giHeight));
      if (giTxProof) params.push(true);
      if (giTxProofHeight) params.push(Number(giTxProofHeight));
      
      console.log('Sending getidentity command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentity', params, 'query');
      console.log('Get Identity result:', result);
      
      if (result.error) {
        setGiError(result.error);
      } else {
        setGiResult(result);
      }
    } catch (err) {
      console.error('Error in getidentity:', err);
      setGiError(err.message || 'Failed to get identity information');
    }
    
    setGiLoading(false);
  };

  // Handler for List Identities operation
  const handleListIdentities = async (e) => {
    e.preventDefault();
    setLiLoading(true);
    setLiError('');
    setLiResult(null);
    
    try {
      // Prepare parameters for listidentities
      const includeCanSpend = document.getElementById('li-includecanspend').checked;
      const includeCanSign = document.getElementById('li-includecansign').checked;
      const includeWatchOnly = document.getElementById('li-includewatchonly').checked;
      
      // Validate that at least one filter is selected
      if (!includeCanSpend && !includeCanSign && !includeWatchOnly) {
        setLiError('Please select at least one filter option.');
        setLiLoading(false);
        return;
      }
      
      // Build params array with the filter options
      const params = [includeCanSpend, includeCanSign, includeWatchOnly];
      
      console.log('Sending listidentities command with params:', params);
      
      const result = await sendRPCCommandWithLogging('listidentities', params, 'query');
      console.log('List Identities result:', result);
      
      if (result.error) {
        setLiError(result.error);
      } else {
        // Make sure we have an array of results
        if (Array.isArray(result)) {
          setLiResult(result);
        } else {
          // Handle case where result might not be an array
          setLiError('Unexpected result format. Expected an array of identities.');
        }
      }
    } catch (err) {
      console.error('Error in listidentities:', err);
      setLiError(err.message || 'Failed to list identities');
    }
    
    setLiLoading(false);
  };

  // Handler for Identities With Address operation
  const handleIdentitiesWithAddress = async (e) => {
    e.preventDefault();
    setIwtaLoading(true);
    setIwtaError('');
    setIwtaResult(null);
    
    try {
      if (!iwtaIdentityId.trim()) {
        setIwtaError('Identity ID is required.');
        setIwtaLoading(false);
        return;
      }
      
      // Prepare parameters for getidentitieswithaddress
      const params = [
        {
          identityid: iwtaIdentityId.trim()
        }
      ];
      
      // Add optional parameters if provided
      if (iwtaFromHeight) params[0].fromheight = parseInt(iwtaFromHeight, 10);
      if (iwtaToHeight) params[0].toheight = parseInt(iwtaToHeight, 10);
      if (iwtaUnspent) params[0].unspent = true;
      
      console.log('Sending getidentitieswithaddress command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentitieswithaddress', params, 'query');
      console.log('Identities With Address result:', result);
      
      if (result.error) {
        setIwtaError(result.error);
      } else if (Array.isArray(result)) {
        setIwtaResult(result);
      } else {
        setIwtaError('Unexpected response format');
      }
    } catch (err) {
      console.error('Error in getidentitieswithaddress:', err);
      setIwtaError(err.message || 'Failed to find identities with address');
    }
    
    setIwtaLoading(false);
  };

  // Handler for Identities With Revocation operation
  const handleIdentitiesWithRevocation = async (e) => {
    e.preventDefault();
    setIwrLoading(true);
    setIwrError('');
    setIwrResult(null);
    
    try {
      if (!iwrIdentityId.trim()) {
        setIwrError('Identity ID is required.');
        setIwrLoading(false);
        return;
      }
      
      // Prepare parameters for getidentitieswithrevocation
      const params = [
        {
          identityid: iwrIdentityId.trim()
        }
      ];
      
      // Add optional parameters if provided
      if (iwrFromHeight) params[0].fromheight = parseInt(iwrFromHeight, 10);
      if (iwrToHeight) params[0].toheight = parseInt(iwrToHeight, 10);
      if (iwrUnspent) params[0].unspent = true;
      
      console.log('Sending getidentitieswithrevocation command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentitieswithrevocation', params, 'query');
      console.log('Identities With Revocation result:', result);
      
      if (result.error) {
        setIwrError(result.error);
      } else if (Array.isArray(result)) {
        setIwrResult(result);
      } else {
        setIwrError('Unexpected response format');
      }
    } catch (err) {
      console.error('Error in getidentitieswithrevocation:', err);
      setIwrError(err.message || 'Failed to find identities with revocation authority');
    }
    
    setIwrLoading(false);
  };

  // Handler for Identities With Recovery operation
  const handleIdentitiesWithRecovery = async (e) => {
    e.preventDefault();
    setIwcLoading(true);
    setIwcError('');
    setIwcResult(null);
    
    try {
      if (!iwcIdentityId.trim()) {
        setIwcError('Identity ID is required.');
        setIwcLoading(false);
        return;
      }
      
      // Prepare parameters for getidentitieswithrecovery
      const params = [
        {
          identityid: iwcIdentityId.trim()
        }
      ];
      
      // Add optional parameters if provided
      if (iwcFromHeight) params[0].fromheight = parseInt(iwcFromHeight, 10);
      if (iwcToHeight) params[0].toheight = parseInt(iwcToHeight, 10);
      if (iwcUnspent) params[0].unspent = true;
      
      console.log('Sending getidentitieswithrecovery command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentitieswithrecovery', params, 'query');
      console.log('Identities With Recovery result:', result);
      
      if (result.error) {
        setIwcError(result.error);
      } else if (Array.isArray(result)) {
        setIwcResult(result);
      } else {
        setIwcError('Unexpected response format');
      }
    } catch (err) {
      console.error('Error in getidentitieswithrecovery:', err);
      setIwcError(err.message || 'Failed to find identities with recovery authority');
    }
    
    setIwcLoading(false);
  };

  // Handler for Identity Content operation
  const handleIdentityContent = async (e) => {
    e.preventDefault();
    setIcLoading(true);
    setIcError('');
    setIcResult(null);
    
    try {
      if (!icIdentityNameOrId.trim()) {
        setIcError('Identity name or ID is required.');
        setIcLoading(false);
        return;
      }
      
      // Prepare parameters for getidentitycontent
      const params = [icIdentityNameOrId.trim()];
      
      // Add optional parameters if provided
      if (icHeightStart) params.push(parseInt(icHeightStart, 10));
      if (icHeightEnd) params.push(parseInt(icHeightEnd, 10));
      if (icTxProofs) params.push(true);
      if (icTxProofHeight) params.push(parseInt(icTxProofHeight, 10));
      if (icVdxfKey) params.push(icVdxfKey.trim());
      if (icKeepDeleted) params.push(true);
      
      console.log('Sending getidentitycontent command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentitycontent', params, 'query');
      console.log('Identity Content result:', result);
      
      if (result.error) {
        setIcError(result.error);
      } else {
        setIcResult(result);
      }
    } catch (err) {
      console.error('Error in getidentitycontent:', err);
      setIcError(err.message || 'Failed to get identity content');
    }
    
    setIcLoading(false);
  };
  
  // Handler for Identity History operation
  const handleIdentityHistory = async (e) => {
    e.preventDefault();
    setIhLoading(true);
    setIhError('');
    setIhResult(null);
    
    try {
      if (!ihIdentityNameOrId.trim()) {
        setIhError('Identity name or ID is required.');
        setIhLoading(false);
        return;
      }
      
      // Prepare parameters for getidentityhistory
      const params = [ihIdentityNameOrId.trim()];
      
      // Add optional parameters if provided
      if (ihHeightStart) params.push(parseInt(ihHeightStart, 10));
      if (ihHeightEnd) params.push(parseInt(ihHeightEnd, 10));
      params.push(ihTxProofs);
      if (ihTxProofHeight) params.push(parseInt(ihTxProofHeight, 10));
      
      console.log('Sending getidentityhistory command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentityhistory', params, 'query');
      console.log('Identity History result:', result);
      
      if (result.error) {
        setIhError(result.error);
      } else {
        setIhResult(result);
      }
    } catch (err) {
      console.error('Error in getidentityhistory:', err);
      setIhError(err.message || 'Failed to retrieve identity history');
    }
    
    setIhLoading(false);
  };

  // Handler for Identity Trust operation
  const handleIdentityTrust = async (e) => {
    e.preventDefault();
    setItLoading(true);
    setItError('');
    setItResult(null);
    
    try {
      // Filter out empty identity IDs
      const filteredIds = itIdentityIds.filter(id => id.trim());
      
      // Params - if no IDs provided or only empty strings, send empty array to get all trust ratings
      const params = filteredIds.length > 0 ? [filteredIds] : [];
      
      console.log('Sending getidentitytrust command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentitytrust', params, 'query');
      console.log('Identity Trust result:', result);
      
      if (result.error) {
        setItError(result.error);
      } else {
        setItResult(result);
      }
    } catch (err) {
      console.error('Error in getidentitytrust:', err);
      setItError(err.message || 'Failed to retrieve identity trust ratings');
    }
    
    setItLoading(false);
  };

  // Handler for Identities By Address operation
  const handleIdentitiesByAddress = async (e) => {
    e.preventDefault();
    setIwaLoading(true);
    setIwaError('');
    setIwaResult(null);
    
    try {
      if (!iwaAddress.trim()) {
        setIwaError('Address is required.');
        setIwaLoading(false);
        return;
      }
      
      // Prepare parameters for getidentitieswithaddress
      const params = [
        {
          address: iwaAddress.trim(),
          includewatchonly: iwaIncludeWatchOnly
        }
      ];
      
      console.log('Sending getidentitieswithaddress command with params:', params);
      
      const result = await sendRPCCommandWithLogging('getidentitieswithaddress', params, 'query');
      console.log('Identities By Address result:', result);
      
      if (result.error) {
        setIwaError(result.error);
      } else {
        // Make sure we have an array of results
        if (Array.isArray(result)) {
          setIwaResult(result);
        } else if (result === null || result === undefined) {
          setIwaResult([]);
        } else {
          // Handle case where result might not be an array
          setIwaError('Unexpected result format. Expected an array of identities.');
        }
      }
    } catch (err) {
      console.error('Error in getidentitieswithaddress:', err);
      setIwaError(err.message || 'Failed to get identities with address');
    }
    
    setIwaLoading(false);
  };
  
  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#181818', overflowX: 'hidden', overflowY: 'hidden' }}>
      {/* Title header with Node Configuration */}
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 1, background: '#232323', borderBottom: '1px solid #333' }}>
        {/* Node Configuration on far left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectDirectory}
            sx={{ fontSize: '10px', minWidth: 0, px: 1, py: 0.5 }}
          >
            Directory
          </Button>
          <Typography variant="body2" sx={{ fontSize: '9px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#bbb' }}>
            {verusPath || 'No directory selected'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={checkNodeConnection}
            sx={{ fontSize: '10px', minWidth: 0, px: 1, py: 0.5 }}
            disabled={!verusPath}
          >
            Connect
          </Button>
          {nodeStatus.connected && (
            <Typography sx={{ fontSize: '10px', color: '#4caf50' }}>
              Connected! v{nodeStatus.version}, Height: {nodeStatus.blocks}
            </Typography>
          )}
          {nodeStatus.error && !nodeStatus.connected && (
            <Typography sx={{ fontSize: '10px', color: '#f44336', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nodeStatus.error}
            </Typography>
          )}
        </Box>
        {/* Center title */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h5" sx={{ fontSize: '18px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
            Verus Development Workbench
          </Typography>
        </Box>
        {/* Empty space on the right to balance layout */}
        <Box sx={{ minWidth: '250px' }}></Box>
      </Box>
      
      {/* Tab Navigation */}
      <Box sx={{ bgcolor: '#1e1e1e' }}>
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ px: 2 }}>
          <Tab label="VerusID Management" sx={{ color: '#90caf9', fontWeight: selectedTab === 0 ? 700 : 400 }} />
          <Tab label="VDXF Management" sx={{ color: '#90caf9', fontWeight: selectedTab === 1 ? 700 : 400 }} />
          <Tab label="Currency Management" sx={{ color: '#90caf9', fontWeight: selectedTab === 2 ? 700 : 400 }} />
        </Tabs>
      </Box>

      {/* Tab Content Areas */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* VerusID Management Tab */}
        {selectedTab === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
            {/* Left Panel - VerusIDs List */}
            <Box sx={{ width: 220, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ flex: 1, overflowY: 'auto', background: '#232323', borderRadius: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, pl: 1 }}>
                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700, mr: 1 }}>VerusIDs</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '14px', minWidth: '40px', px: 1, py: 0, height: '22px', color: '#2196f3', borderColor: '#2196f3', textTransform: 'none' }}
                    onClick={fetchIdentities}
                    disabled={loadingIdentities}
                  >
                    Update
                  </Button>
                </Box>
                <Divider sx={{ mb: 1, bgcolor: '#444' }} />
                {typeof identities.error === 'string' && (
                  <Typography sx={{ color: '#f44336', fontSize: '10px', px: 1 }}>{identities.error}</Typography>
                )}
                <List dense sx={{ overflowY: 'auto', minHeight: 0 }}>
                  {loadingIdentities && <ListItem><ListItemText primary={<span style={{ fontSize: '10px', color: '#bbb' }}>Loading...</span>} /></ListItem>}
                  {!loadingIdentities && Array.isArray(identities) && identities.length === 0 && <ListItem><ListItemText primary={<span style={{ fontSize: '10px', color: '#bbb' }}>No IDs</span>} /></ListItem>}
                  {Array.isArray(identities) && identities.map((item) => (
                    <ListItem key={item.identity.identityaddress} disablePadding>
                      <ListItemButton selected={selectedId === item.identity.name} onClick={() => fetchIdentityDetails(item.identity.name)} sx={{ fontSize: '14px', py: 0.05, minHeight: '24px' }}>
                        <ListItemText primary={<span style={{ fontSize: '14px', color: selectedId === item.identity.name ? '#2196f3' : '#fff' }}>{item.identity.name}</span>} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
            
            {/* Left-Center Panel - VerusID Details */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', ml: 2, width: '140%' }}>
              <Box sx={{ flex: 1, overflowY: 'auto', background: '#232323', borderRadius: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, pl: 1, position: 'sticky', top: 0, background: '#232323', zIndex: 10 }}>
                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700, mr: 1 }}>VerusID Details</Typography>
                </Box>
                <Divider sx={{ mb: 1, bgcolor: '#444', position: 'sticky', top: '30px', zIndex: 10 }} />
                
                {loadingDetails && (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: '11px', color: '#bbb' }}>Loading identity details...</Typography>
                  </Box>
                )}
                
                {!loadingDetails && !identityDetails && (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: '11px', color: '#bbb' }}>Select a VerusID to view details.</Typography>
                  </Box>
                )}
                
                {!loadingDetails && identityDetails && identityDetails.error && (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: '11px', color: '#f44336' }}>{identityDetails.error}</Typography>
                  </Box>
                )}
                
                {!loadingDetails && identityDetails && !identityDetails.error && (
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700, mb: 0.5 }}>{identityDetails.name}</Typography>
                    
                    {/* Identity Address and Balances side by side */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', mt: 0.25, mb: 0.25 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Identity Address:</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          {identityDetails.identityaddress}
                        </Typography>
                        {identityDetails.fullyqualifiedname && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Fully Qualified Name:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.fullyqualifiedname}</Typography>
                          </Box>
                        )}
                        {identityDetails.parent && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Parent:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.parent}</Typography>
                          </Box>
                        )}
                        {identityDetails.systemid && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>System ID:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.systemid}</Typography>
                          </Box>
                        )}
                        {identityDetails.revocationauthority && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Revocation Authority:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>{identityDetails.revocationauthority}</Typography>
                          </Box>
                        )}
                        {identityDetails.recoveryauthority && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Recovery Authority:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>{identityDetails.recoveryauthority}</Typography>
                          </Box>
                        )}
                        {identityDetails.privateaddress && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Private Address:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>{identityDetails.privateaddress}</Typography>
                          </Box>
                        )}
                        {identityDetails.primaryaddresses && identityDetails.primaryaddresses.length > 0 && (
                          <Box sx={{ mt: 0.25, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Primary Addresses:</Typography>
                            {identityDetails.primaryaddresses.map((addr, idx) => (
                              <Typography key={idx} sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>{addr}</Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ minWidth: 180, ml: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box>
                          <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Balances:</Typography>
                          <Box sx={{ mt: 0.25 }}>
                            {transparentBalance && !transparentBalance.error && Object.keys(transparentBalance).length > 0 ? (
                              Object.entries(transparentBalance).map(([currency, amount], idx) => (
                                <Typography key={idx} sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>
                                  {currency}: {parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                </Typography>
                              ))
                            ) : (
                              <Typography sx={{ fontSize: '12px', color: '#f44336', fontFamily: 'monospace' }}>Broke AF</Typography>
                            )}
                          </Box>
                        </Box>
                        {identityDetails.timelock !== undefined && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Timelock:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.timelock}</Typography>
                          </Box>
                        )}
                        {identityDetails.flags !== undefined && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Flags:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.flags}</Typography>
                          </Box>
                        )}
                        {identityDetails.minimumsignatures !== undefined && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Minimum Signatures:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.minimumsignatures}</Typography>
                          </Box>
                        )}
                        {identityDetails.version !== undefined && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Version:</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>{identityDetails.version}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {identityDetails.txid && (
                      <Box sx={{ mt: 0.25, mb: 0.25 }}>
                        <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Transaction ID:</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          {identityDetails.txid}
                        </Typography>
                      </Box>
                    )}
                    
                    {identityDetails.txoutnum !== undefined && (
                      <Box sx={{ mt: 0.25, mb: 0.25 }}>
                        <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>TX Out Number:</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>
                          {identityDetails.txoutnum}
                        </Typography>
                      </Box>
                    )}
                    
                    {identityDetails.contentmap && Object.keys(identityDetails.contentmap).length > 0 && (
                      <Box sx={{ mt: 0.25, mb: 0.25 }}>
                        <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Content Map ({Object.keys(identityDetails.contentmap).length} entries):</Typography>
                        <Box sx={{ ml: 1, mt: 0.5, p: 1, background: '#181818', borderRadius: 1, maxHeight: '400px', overflowY: 'auto' }}>
                          {Object.entries(identityDetails.contentmap).map(([vdxfhash, value], idx) => (
                            <Box key={idx} sx={{ mb: 1 }}>
                              <span style={{ color: '#90caf9', fontWeight: 700, fontFamily: 'monospace', fontSize: '11px', display: 'block', lineHeight: 1.1 }}>
                                VDXF Hash: {vdxfhash}
                              </span>
                              <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '11px', marginLeft: 16, marginTop: 0, display: 'block', lineHeight: 1.1 }}>
                                Value: {value}
                              </span>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {identityDetails.contentmultimap && Object.keys(identityDetails.contentmultimap).length > 0 && (
                      <Box sx={{ mt: 0.25, mb: 0.25 }}>
                        <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>Content MultiMap ({Object.keys(identityDetails.contentmultimap).length} entries):</Typography>
                        <Box sx={{ ml: 1, mt: 0.5, p: 1, background: '#181818', borderRadius: 1, maxHeight: '400px', overflowY: 'auto' }}>
                          {Object.entries(identityDetails.contentmultimap).map(([primaryKey, entries], idx) => (
                            <Box key={idx} sx={{ mb: 0.5, p: 1, background: '#232323', borderRadius: 1 }}>
                              <Typography sx={{ color: '#90caf9', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', mb: 0.5 }}>
                                Primary VDXF Key: {primaryKey}
                              </Typography>
                              {Array.isArray(entries) && entries.length > 0 ? (
                                entries.map((entry, idx) => (
                                  <Box key={idx} sx={{ mt: 0.25, mb: 0.25, pt: 0.25, pb: 0.25, px: 0.5, background: '#181818', borderRadius: 1 }}>
                                    {renderContentMultiMapEntry(entry)}
                                  </Box>
                                ))
                              ) : (
                                <Typography sx={{ color: '#bbb', fontSize: '12px' }}>No entries for this key.</Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Additional fields that may be present */}
                    {Object.entries(identityDetails)
                      .filter(([key]) => ![
                        'name', 'identityaddress', 'parent', 'systemid', 'flags', 'primaryaddresses',
                        'minimumsignatures', 'revocationauthority', 'recoveryauthority', 'privateaddress',
                        'timelock', 'blockheight', 'txid', 'txoutnum', 'contentmap', 'contentmultimap',
                        'version', 'iscontrol', 'isrevocation', 'isrecovery', 'blocktime', 'fullyqualifiedname',
                        'error'
                      ].includes(key))
                      .map(([key, value]) => (
                        <Box key={key} sx={{ mt: 1, mb: 1 }}>
                          <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600 }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#ddd', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </Typography>
                        </Box>
                      ))
                    }
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Center Panel - Categories & Operations */}
            <Box sx={{ width: 220, display: 'flex', flexDirection: 'column', height: '100%', ml: 2 }}>
              <Box sx={{ flex: 1, overflowY: 'auto', background: '#232323', borderRadius: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, pl: 1 }}>
                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700, mr: 1 }}>VerusID Operations</Typography>
          </Box>
                <Divider sx={{ mb: 1, bgcolor: '#444' }} />
                
                {/* Operations Categories */}
                <List dense sx={{ overflowY: 'auto', minHeight: 0 }}>
                  {/* Identity Creation */}
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedOperation === 'creation'} 
                      onClick={() => setSelectedOperation('creation')}
                      sx={{ fontSize: '14px', py: 0.5 }}
                    >
                      <ListItemText 
                        primary={<span style={{ fontSize: '14px', fontWeight: 600, color: selectedOperation === 'creation' ? '#2196f3' : '#fff' }}>Identity Creation</span>} 
                      />
                    </ListItemButton>
                  </ListItem>
                  
                  {/* Identity Query */}
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedOperation === 'query'} 
                      onClick={() => setSelectedOperation('query')}
                      sx={{ fontSize: '14px', py: 0.5 }}
                    >
                      <ListItemText 
                        primary={<span style={{ fontSize: '14px', fontWeight: 600, color: selectedOperation === 'query' ? '#2196f3' : '#fff' }}>Identity Query</span>} 
                      />
                    </ListItemButton>
                  </ListItem>
                  
                  {/* Identity Management */}
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedOperation === 'management'} 
                      onClick={() => setSelectedOperation('management')}
                      sx={{ fontSize: '14px', py: 0.5 }}
                    >
                      <ListItemText 
                        primary={<span style={{ fontSize: '14px', fontWeight: 600, color: selectedOperation === 'management' ? '#2196f3' : '#fff' }}>Identity Management</span>} 
                      />
                    </ListItemButton>
                  </ListItem>
                  
                  {/* Crypto Operations */}
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedOperation === 'crypto'} 
                      onClick={() => setSelectedOperation('crypto')}
                      sx={{ fontSize: '14px', py: 0.5 }}
                    >
                      <ListItemText 
                        primary={<span style={{ fontSize: '14px', fontWeight: 600, color: selectedOperation === 'crypto' ? '#2196f3' : '#fff' }}>Crypto Operations</span>} 
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
                
                {/* Sub-operations based on selected category */}
                {selectedOperation && (
                  <>
                    <Divider sx={{ my: 1, bgcolor: '#444' }} />
                    <Box sx={{ px: 1, mb: 1 }}>
                      <Typography sx={{ fontSize: '13px', color: '#bbb' }}>
                        {selectedOperation === 'creation' && 'Create & Register Identities'}
                        {selectedOperation === 'query' && 'Query & View Identities'}
                        {selectedOperation === 'management' && 'Manage & Update Identities'}
                        {selectedOperation === 'crypto' && 'Sign & Verify with Identities'}
                      </Typography>
                    </Box>
                    <List dense sx={{ overflowY: 'auto', minHeight: 0 }}>
                      {selectedOperation === 'creation' && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'namecommitment'} 
                              onClick={() => setSelectedSubOperation('namecommitment')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'namecommitment' ? '#90caf9' : '#ddd' }}>Name Commitment</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'registeridentity'} 
                              onClick={() => setSelectedSubOperation('registeridentity')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'registeridentity' ? '#90caf9' : '#ddd' }}>Register Identity</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                        </>
                      )}
                      
                      {selectedOperation === 'query' && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'getidentity'} 
                              onClick={() => setSelectedSubOperation('getidentity')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'getidentity' ? '#90caf9' : '#ddd' }}>Get Identity</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'listidentities'} 
                              onClick={() => setSelectedSubOperation('listidentities')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'listidentities' ? '#90caf9' : '#ddd' }}>List Identities</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'identitieswithaddress'} 
                              onClick={() => setSelectedSubOperation('identitieswithaddress')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'identitieswithaddress' ? '#90caf9' : '#ddd' }}>With Address</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'identitieswithrecovery'} 
                              onClick={() => setSelectedSubOperation('identitieswithrecovery')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'identitieswithrecovery' ? '#90caf9' : '#ddd' }}>With Recovery Authority</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'identitieswithrevocation'} 
                              onClick={() => setSelectedSubOperation('identitieswithrevocation')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'identitieswithrevocation' ? '#90caf9' : '#ddd' }}>With Revocation Authority</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'identitycontent'} 
                              onClick={() => setSelectedSubOperation('identitycontent')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'identitycontent' ? '#90caf9' : '#ddd' }}>Identity Content</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'identityhistory'} 
                              onClick={() => setSelectedSubOperation('identityhistory')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'identityhistory' ? '#90caf9' : '#ddd' }}>Identity History</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'identitytrust'} 
                              onClick={() => setSelectedSubOperation('identitytrust')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'identitytrust' ? '#90caf9' : '#ddd' }}>Identity Trust</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                        </>
                      )}
                      
                      {selectedOperation === 'management' && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'updateidentity'} 
                              onClick={() => setSelectedSubOperation('updateidentity')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'updateidentity' ? '#90caf9' : '#ddd' }}>Update Identity</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'timelock'} 
                              onClick={() => setSelectedSubOperation('timelock')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'timelock' ? '#90caf9' : '#ddd' }}>Set Timelock</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'revoke'} 
                              onClick={() => setSelectedSubOperation('revoke')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'revoke' ? '#90caf9' : '#ddd' }}>Revoke Identity</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'recover'} 
                              onClick={() => setSelectedSubOperation('recover')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'recover' ? '#90caf9' : '#ddd' }}>Recover Identity</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'setidentitytrust'} 
                              onClick={() => setSelectedSubOperation('setidentitytrust')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'setidentitytrust' ? '#90caf9' : '#ddd' }}>Set Trust</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                        </>
                      )}
                      
                      {selectedOperation === 'crypto' && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'signmessage'} 
                              onClick={() => setSelectedSubOperation('signmessage')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'signmessage' ? '#90caf9' : '#ddd' }}>Sign Message</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'signfile'} 
                              onClick={() => setSelectedSubOperation('signfile')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'signfile' ? '#90caf9' : '#ddd' }}>Sign File</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'signdata'} 
                              onClick={() => setSelectedSubOperation('signdata')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'signdata' ? '#90caf9' : '#ddd' }}>Sign Data</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'verifymessage'} 
                              onClick={() => setSelectedSubOperation('verifymessage')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'verifymessage' ? '#90caf9' : '#ddd' }}>Verify Message</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'verifyfile'} 
                              onClick={() => setSelectedSubOperation('verifyfile')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'verifyfile' ? '#90caf9' : '#ddd' }}>Verify File</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemButton 
                              selected={selectedSubOperation === 'verifydata'} 
                              onClick={() => setSelectedSubOperation('verifydata')}
                              sx={{ fontSize: '12px', py: 0.3, pl: 2 }}
                            >
                              <ListItemText 
                                primary={<span style={{ fontSize: '13px', color: selectedSubOperation === 'verifydata' ? '#90caf9' : '#ddd' }}>Verify Data</span>} 
                              />
                            </ListItemButton>
                          </ListItem>
                        </>
                      )}
                    </List>
                  </>
                )}
              </Box>
            </Box>
            
            {/* Center Panel - Operation Form & Results Display */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ flex: 1, overflowY: 'auto', background: '#232323', borderRadius: 0, ml: 2, mt: 0, p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700, mb: 1 }}>
                  {selectedOperation && selectedSubOperation ? `${selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)} - ${selectedSubOperation}` : 'Select an operation'}
                </Typography>
                <Divider sx={{ mb: 1, bgcolor: '#444' }} />
                
                {/* Dynamic form based on selected operation */}
                {selectedSubOperation ? (
                  <Paper sx={{ p: 2, flex: 0, background: '#181818' }}>
                    {/* Placeholder error display - will be populated from state */}
                    {operationError && (
                      <Alert severity="error" sx={{ mb: 2, fontSize: '14px' }}>{operationError}</Alert>
                    )}
                    
                    {/* Name Commitment Form */}
                    {selectedSubOperation === 'namecommitment' && (
                      <Box component="form" onSubmit={handleNameCommitment} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Register a name commitment for a new VerusID
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Name commitments require at least 1 confirmation before the identity can be registered.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Identity Name *
                          </Typography>
                          <input
                            type="text"
                            value={ncIdentityName}
                            onChange={(e) => setNcIdentityName(e.target.value)}
                            placeholder="Enter identity name (e.g. myname@)"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            required
                          />
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                            Identity names must end with @ for testnet identities
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Control Address (Primary Address) *
                          </Typography>
                          <select
                            value={ncControlAddress}
                            onChange={e => setNcControlAddress(e.target.value)}
                            required
                            style={{
                              fontSize: '14px',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #444',
                              background: '#232323',
                              color: '#fff'
                            }}
                          >
                            <option value="" disabled>Select an R-address</option>
                            {availableRAddresses.map(addr => (
                              <option key={addr} value={addr}>{addr}</option>
                            ))}
                          </select>
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                            This address will control the new identity.
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Referral Identity
                          </Typography>
                          <input
                            type="text"
                            value={ncReferralIdentity}
                            onChange={(e) => setNcReferralIdentity(e.target.value)}
                            placeholder="Enter referral identity (optional)"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Parent Identity
                          </Typography>
                          <input
                            type="text"
                            value={ncParentIdentity}
                            onChange={(e) => setNcParentIdentity(e.target.value)}
                            placeholder="Enter parent identity (optional)"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Source of Funds
                          </Typography>
                          <input
                            type="text"
                            value={ncSourceAddress}
                            onChange={(e) => setNcSourceAddress(e.target.value)}
                            placeholder="Enter source address (optional)"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="button" 
                            variant="contained" 
                            color="primary" 
                            disabled={isLoading || !ncIdentityName}
                            sx={{ fontSize: '14px' }}
                            onClick={handleNameCommitment}
                          >
                            REGISTER NAME COMMITMENT
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={resetNameCommitmentForm}
                            disabled={isLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            Reset Form
                          </Button>
                        </Box>
                        
                        {/* Fee Estimate */}
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InfoIcon sx={{ color: '#90caf9', fontSize: '16px' }} />
                          <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                            Estimated transaction fee: 0.0001 VRSCTEST
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {selectedSubOperation === 'registeridentity' && (
                      <Box component="form" onSubmit={handleRegisterIdentity} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Register a new VerusID (requires a confirmed name commitment)
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Fill in the details below. Fields will autofill from the previous step if available.
                        </Typography>

                        {/* Name Commitment Selector */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Saved Name Commitments
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <select 
                              value={selectedNameCommitment ? selectedNameCommitment.txid : ""}
                              onChange={(e) => {
                                const selected = nameCommitments.find(commitment => commitment.txid === e.target.value);
                                setSelectedNameCommitment(selected || null);
                              }}
                              style={{ 
                                flex: 1,
                                fontSize: '14px', 
                                padding: '8px', 
                                borderRadius: '4px', 
                                border: '1px solid #444', 
                                background: '#232323', 
                                color: '#fff' 
                              }}
                            >
                              <option value="" disabled>Select a saved name commitment</option>
                              {nameCommitments.map((commitment) => (
                                <option key={commitment.txid} value={commitment.txid}>
                                  {commitment.identityName} ({new Date(commitment.timestamp).toLocaleString()})
                                </option>
                              ))}
                            </select>
                            {selectedNameCommitment && (
                              <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                                onClick={() => removeNameCommitment(selectedNameCommitment.txid)}
                                sx={{ fontSize: '12px' }}
                              >
                                Remove
                              </Button>
                            )}
                          </Box>
                          
                          {/* Show selected commitment details */}
                          {selectedNameCommitment && (
                            <Box sx={{ mt: 1, p: 2, background: '#181818', borderRadius: 1, border: '1px solid #333' }}>
                              <Typography sx={{ fontSize: '14px', color: '#90caf9', fontWeight: 600, mb: 1 }}>
                                Name Commitment Details (Copy values to the form below)
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Transaction ID:</Typography>
                                  <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.txid}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Name:</Typography>
                                  <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.namereservation.name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Salt:</Typography>
                                  <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.namereservation.salt}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Name ID:</Typography>
                                  <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.namereservation.nameid}</Typography>
                                </Box>
                                {selectedNameCommitment.namereservation.parent && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Parent:</Typography>
                                    <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.namereservation.parent}</Typography>
                                  </Box>
                                )}
                                {selectedNameCommitment.namereservation.referral && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Referral:</Typography>
                                    <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.namereservation.referral}</Typography>
                                  </Box>
                                )}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600, minWidth: 100 }}>Control Addr:</Typography>
                                  <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#ddd', wordBreak: 'break-all', flex: 1 }}>{selectedNameCommitment.controlAddress}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Name Commitment TXID *</Typography>
                          <input type="text" value={riTxid} onChange={e => setRiTxid(e.target.value)} placeholder="Name commitment TXID" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} required />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Identity Name *</Typography>
                          <input type="text" value={riName} onChange={e => setRiName(e.target.value)} placeholder="Identity name" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} required />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Parent Identity *</Typography>
                          <input type="text" value={riParent} onChange={e => setRiParent(e.target.value)} placeholder="Parent identity (default: iJhCez...)" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} required />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Salt *</Typography>
                          <input type="text" value={riSalt} onChange={e => setRiSalt(e.target.value)} placeholder="Salt from name commitment" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} required />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>NameID (identity address)</Typography>
                          <input type="text" value={riNameId} onChange={e => setRiNameId(e.target.value)} placeholder="Identity address (optional)" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Referral Identity</Typography>
                          <input type="text" value={riReferral} onChange={e => setRiReferral(e.target.value)} placeholder="Referral identity (optional)" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} />
                        </Box>
                        <Divider sx={{ my: 1, bgcolor: '#444' }} />
                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>Identity Details</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Primary Addresses *</Typography>
                          {riPrimaryAddresses.map((addr, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <input type="text" value={addr} onChange={e => handleArrayChange(riPrimaryAddresses, setRiPrimaryAddresses, idx, e.target.value)} placeholder="Primary address" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff', flex: 1 }} required />
                              <Button variant="outlined" color="primary" onClick={() => handleRemoveFromArray(riPrimaryAddresses, setRiPrimaryAddresses, idx)} disabled={riPrimaryAddresses.length === 1}>Remove</Button>
                            </Box>
                          ))}
                          <Button variant="outlined" color="primary" onClick={() => handleAddToArray(riPrimaryAddresses, setRiPrimaryAddresses)}>Add Address</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Minimum Signatures *</Typography>
                          <input type="number" min={1} value={riMinimumSignatures} onChange={e => setRiMinimumSignatures(e.target.value)} placeholder="Minimum signatures" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} required />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Revocation Authorities *</Typography>
                          {riRevocationAuthorities.map((addr, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <input type="text" value={addr} onChange={e => handleArrayChange(riRevocationAuthorities, setRiRevocationAuthorities, idx, e.target.value)} placeholder="Revocation authority address" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff', flex: 1 }} required />
                              <Button variant="outlined" color="primary" onClick={() => handleRemoveFromArray(riRevocationAuthorities, setRiRevocationAuthorities, idx)} disabled={riRevocationAuthorities.length === 1}>Remove</Button>
                            </Box>
                          ))}
                          <Button variant="outlined" color="primary" onClick={() => handleAddToArray(riRevocationAuthorities, setRiRevocationAuthorities)}>Add Authority</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>Recovery Authorities *</Typography>
                          {riRecoveryAuthorities.map((addr, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <input type="text" value={addr} onChange={e => handleArrayChange(riRecoveryAuthorities, setRiRecoveryAuthorities, idx, e.target.value)} placeholder="Recovery authority address" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff', flex: 1 }} required />
                              <Button variant="outlined" color="primary" onClick={() => handleRemoveFromArray(riRecoveryAuthorities, setRiRecoveryAuthorities, idx)} disabled={riRecoveryAuthorities.length === 1}>Remove</Button>
                            </Box>
                          ))}
                          <Button variant="outlined" color="primary" onClick={() => handleAddToArray(riRecoveryAuthorities, setRiRecoveryAuthorities)}>Add Authority</Button>
                        </Box>
                        <Divider sx={{ my: 1, bgcolor: '#444' }} />
                        <Button variant="outlined" color="primary" onClick={() => setRiAdvancedOpen(!riAdvancedOpen)}>{riAdvancedOpen ? 'Hide' : 'Show'} Advanced Options</Button>
                        {riAdvancedOpen && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#181818', p: 2, borderRadius: 1 }}>
                            <Typography sx={{ fontSize: '14px', color: '#fff' }}>Return Transaction (for multisig)</Typography>
                            <Select value={riReturnTx} onChange={e => setRiReturnTx(e.target.value === 'true')} sx={{ color: '#fff', background: '#232323', borderRadius: 1 }}>
                              <MenuItem value={false}>No</MenuItem>
                              <MenuItem value={true}>Yes</MenuItem>
                            </Select>
                            <Typography sx={{ fontSize: '14px', color: '#fff' }}>Fee Offer</Typography>
                            <input type="number" min={0} value={riFeeOffer} onChange={e => setRiFeeOffer(e.target.value)} placeholder="Fee offer (optional)" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} />
                            <Typography sx={{ fontSize: '14px', color: '#fff' }}>Source of Funds</Typography>
                            <input type="text" value={riSourceOfFunds} onChange={e => setRiSourceOfFunds(e.target.value)} placeholder="Source address (optional)" style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }} />
                          </Box>
                        )}
                        {riError && <Alert severity="error" sx={{ mt: 2 }}>{riError}</Alert>}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button type="submit" variant="contained" color="primary" disabled={riLoading} sx={{ fontSize: '14px' }}>REGISTER IDENTITY</Button>
                        </Box>
                        {riLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Processing request...</Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Get Identity Form */}
                    {selectedSubOperation === 'getidentity' && (
                      <Box component="form" onSubmit={handleGetIdentity} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Retrieve information about a specific identity
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Look up an identity by name or i-address to view its details.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Identity Name or ID Address *
                          </Typography>
                          <input
                            type="text"
                            value={giIdentityNameOrId}
                            onChange={(e) => setGiIdentityNameOrId(e.target.value)}
                            placeholder="Enter identity name with @ or i-address"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            required
                          />
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                            Example: "myname@" or "iXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Block Height (optional)
                          </Typography>
                          <input
                            type="number"
                            value={giHeight}
                            onChange={(e) => setGiHeight(e.target.value)}
                            placeholder="Block height (default: current)"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                            Return identity as of this height, or leave blank for current height. Use -1 to include mempool.
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Include Transaction Proof
                          </Typography>
                          <Switch
                            checked={giTxProof}
                            onChange={(e) => setGiTxProof(e.target.checked)}
                            color="primary"
                          />
                        </Box>
                        
                        {giTxProof && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                              Proof Height (optional)
                            </Typography>
                            <input
                              type="number"
                              value={giTxProofHeight}
                              onChange={(e) => setGiTxProofHeight(e.target.value)}
                              placeholder="Proof height (default: same as height)"
                              style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            />
                            <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                              Height from which to generate a proof, or leave blank to use the same as height parameter.
                            </Typography>
                          </Box>
                        )}
                        
                        {giError && <Alert severity="error" sx={{ mt: 1 }}>{giError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={giLoading || !giIdentityNameOrId}
                            sx={{ fontSize: '14px' }}
                          >
                            GET IDENTITY
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              setGiIdentityNameOrId('');
                              setGiHeight('');
                              setGiTxProof(false);
                              setGiTxProofHeight('');
                              setGiResult(null);
                              setGiError('');
                            }}
                            disabled={giLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            Reset Form
                          </Button>
                        </Box>
                        
                        {giLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Fetching identity information...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the result */}
                        {giResult && !giLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700, mb: 2 }}>
                              Identity Information
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {/* Basic identity information */}
                              {giResult.fullyqualifiedname && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Full Name:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#4caf50', flex: 1 }}>{giResult.fullyqualifiedname}</Typography>
                                </Box>
                              )}
                              
                              {giResult.identity && (
                                <>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Name:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.name}</Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Identity Address:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.identityaddress}</Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Parent:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.parent || "(none)"}</Typography>
                                  </Box>
                                  
                                  {/* Primary addresses section */}
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Primary Addresses:</Typography>
                                    <Box sx={{ flex: 1 }}>
                                      {giResult.identity.primaryaddresses && giResult.identity.primaryaddresses.map((addr, idx) => (
                                        <Typography key={idx} sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd' }}>{addr}</Typography>
                                      ))}
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Min Signatures:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.minimumsignatures}</Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>System ID:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.systemid}</Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Revocation Auth:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.revocationauthority}</Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Recovery Auth:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.recoveryauthority}</Typography>
                                  </Box>
                                  
                                  {giResult.identity.timelock > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Timelock:</Typography>
                                      <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.identity.timelock}</Typography>
                                    </Box>
                                  )}
                                </>
                              )}
                              
                              {/* Transaction information */}
                              {giResult.blockheight && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Block Height:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.blockheight}</Typography>
                                </Box>
                              )}
                              
                              {giResult.txid && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Transaction ID:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1, wordBreak: 'break-all' }}>{giResult.txid}</Typography>
                                </Box>
                              )}
                              
                              {giResult.status && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Status:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: giResult.status === 'active' ? '#4caf50' : '#ff9800', flex: 1 }}>{giResult.status}</Typography>
                                </Box>
                              )}
                              
                              {/* Content maps section header */}
                              {giResult.identity && (
                                <>
                                  {(giResult.identity.contentmap && Object.keys(giResult.identity.contentmap).length > 0) && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>Content Map</Typography>
                                      <pre style={{ fontSize: '12px', color: '#ddd', background: '#181818', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>
                                        {JSON.stringify(giResult.identity.contentmap, null, 2)}
                                      </pre>
                                    </Box>
                                  )}
                                  
                                  {(giResult.identity.contentmultimap && Object.keys(giResult.identity.contentmultimap).length > 0) && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>Content Multi-Map</Typography>
                                      <pre style={{ fontSize: '12px', color: '#ddd', background: '#181818', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>
                                        {JSON.stringify(giResult.identity.contentmultimap, null, 2)}
                                      </pre>
                                    </Box>
                                  )}
                                </>
                              )}
                              
                              {/* Proof information if requested */}
                              {giResult.proof && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 700 }}>Transaction Proof</Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Proof Height:</Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>{giResult.proofheight || "N/A"}</Typography>
                                  </Box>
                                  <Accordion sx={{ mt: 1, background: '#181818' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                      <Typography sx={{ fontSize: '13px', color: '#90caf9' }}>View Proof Data</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <pre style={{ fontSize: '12px', color: '#ddd', background: '#232323', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>
                                        {typeof giResult.proof === 'string' ? giResult.proof : JSON.stringify(giResult.proof, null, 2)}
                                      </pre>
                                    </AccordionDetails>
                                  </Accordion>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* List Identities Form */}
                    {selectedSubOperation === 'listidentities' && (
                      <Box component="form" onSubmit={handleListIdentities} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          List all identities from the wallet
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Configure filtering options to refine which identities are displayed.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: '1px solid #444', borderRadius: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>
                            Filter Options
                          </Typography>
                          
                          {/* Include Can Spend and Sign */}
                          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                              Include identities for which I can spend and sign for
                            </Typography>
                            <Switch
                              id="li-includecanspend"
                              defaultChecked={true}
                              color="primary"
                            />
                          </Box>
                          
                          {/* Include Can Only Sign */}
                          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                              Include identities for which I can only sign for but not spend
                            </Typography>
                            <Switch
                              id="li-includecansign"
                              defaultChecked={true}
                              color="primary"
                            />
                          </Box>
                          
                          {/* Include Watch Only or Co-signers */}
                          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                              Include identities that I can only watch or are co-signers with me
                            </Typography>
                            <Switch
                              id="li-includewatchonly"
                              defaultChecked={false}
                              color="primary"
                            />
                          </Box>
                          
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mt: 1 }}>
                            Note: The daemon must be started with -idindex=1 for this command to work properly.
                            These filters decide which types of identities to include in the results.
                          </Typography>
                        </Box>
                        
                        {liError && <Alert severity="error" sx={{ mt: 1 }}>{liError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={liLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            LIST IDENTITIES
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              // Reset filter options to defaults
                              document.getElementById('li-includecanspend').checked = true;
                              document.getElementById('li-includecansign').checked = true;
                              document.getElementById('li-includewatchonly').checked = false;
                              // Clear results and errors
                              setLiResult(null);
                              setLiError('');
                            }}
                            disabled={liLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            RESET FILTERS
                          </Button>
                        </Box>
                        
                        {liLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Retrieving identities...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the results */}
                        {liResult && !liLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700 }}>
                                Found {liResult.length} Identities
                              </Typography>
                              {liResult.length > 0 && (
                                <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                  Click on an identity to expand details
                                </Typography>
                              )}
                            </Box>
                            
                            {liResult.length === 0 ? (
                              <Typography sx={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic' }}>
                                No identities found matching the selected criteria. Try changing the filter options.
                              </Typography>
                            ) : (
                              liResult.map((item, index) => (
                                <Accordion key={index} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '14px', color: '#4caf50', fontWeight: 600 }}>
                                        {item.identity.name}
                                      </Typography>
                                      <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                        {item.identity.identityaddress}
                                      </Typography>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 2, background: '#232323', borderTop: '1px solid #333' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {/* Basic identity information */}
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Status:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: item.status === 'active' ? '#4caf50' : '#ff9800', flex: 1 }}>
                                          {item.status}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Can Spend:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: item.canspendfor ? '#4caf50' : '#f44336', flex: 1 }}>
                                          {item.canspendfor ? 'Yes' : 'No'}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Can Sign:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: item.cansignfor ? '#4caf50' : '#f44336', flex: 1 }}>
                                          {item.cansignfor ? 'Yes' : 'No'}
                                        </Typography>
                                      </Box>
                                      
                                      <Divider sx={{ my: 1, bgcolor: '#444' }} />
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Name:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity.name}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Identity Address:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity.identityaddress}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Parent:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity.parent || "(none)"}
                                        </Typography>
                                      </Box>
                                      
                                      {/* Primary addresses section */}
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Primary Addresses:</Typography>
                                        <Box sx={{ flex: 1 }}>
                                          {item.identity.primaryaddresses && item.identity.primaryaddresses.map((addr, idx) => (
                                            <Typography key={idx} sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd' }}>
                                              {addr}
                                            </Typography>
                                          ))}
                                        </Box>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Min Signatures:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity.minimumsignatures}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Revocation Auth:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity.revocationauthority}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Recovery Auth:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity.recoveryauthority}
                                        </Typography>
                                      </Box>
                                      
                                      <Divider sx={{ my: 1, bgcolor: '#444' }} />
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Block Height:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.blockheight}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Transaction ID:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1, wordBreak: 'break-all' }}>
                                          {item.txid}
                                        </Typography>
                                      </Box>
                                      
                                      {/* Additional fields based on the identity properties */}
                                      {item.identity.timelock > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Timelock:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {item.identity.timelock}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {/* Show content maps if they exist */}
                                      {item.identity.contentmap && Object.keys(item.identity.contentmap).length > 0 && (
                                        <Accordion sx={{ mt: 1, background: '#181818' }}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                            <Typography sx={{ fontSize: '14px', color: '#90caf9' }}>
                                              Content Map ({Object.keys(item.identity.contentmap).length} entries)
                                            </Typography>
                                          </AccordionSummary>
                                          <AccordionDetails>
                                            <pre style={{ fontSize: '12px', color: '#ddd', background: '#232323', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>
                                              {JSON.stringify(item.identity.contentmap, null, 2)}
                                            </pre>
                                          </AccordionDetails>
                                        </Accordion>
                                      )}
                                      
                                      {/* Show content multi map if it exists */}
                                      {item.identity.contentmultimap && Object.keys(item.identity.contentmultimap).length > 0 && (
                                        <Accordion sx={{ mt: 1, background: '#181818' }}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                            <Typography sx={{ fontSize: '14px', color: '#90caf9' }}>
                                              Content Multi-Map ({Object.keys(item.identity.contentmultimap).length} entries)
                                            </Typography>
                                          </AccordionSummary>
                                          <AccordionDetails>
                                            <pre style={{ fontSize: '12px', color: '#ddd', background: '#232323', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>
                                              {JSON.stringify(item.identity.contentmultimap, null, 2)}
                                            </pre>
                                          </AccordionDetails>
                                        </Accordion>
                                      )}
                                      
                                      {/* Action buttons */}
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => {
                                            setGiIdentityNameOrId(item.identity.identityaddress);
                                            setSelectedOperation('query');
                                            setSelectedSubOperation('getidentity');
                                          }}
                                          sx={{ fontSize: '12px' }}
                                        >
                                          View Details
                                        </Button>
                                      </Box>
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              ))
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Identities With Address Form */}
                    {selectedSubOperation === 'identitieswithaddress' && (
                      <Box component="form" onSubmit={handleIdentitiesByAddress} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Find identities associated with a specific address
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Search for identities that use the specified address as a primary address or in their content maps.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Address *
                          </Typography>
                          <input
                            type="text"
                            value={iwaAddress}
                            onChange={(e) => setIwaAddress(e.target.value)}
                            placeholder="Enter transparent address (R-addresses are the only valid type)"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            required
                          />
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                            Example: "R..." for transparent or "i..." for identity addresses
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                            Include Watch-Only Addresses
                          </Typography>
                          <Switch
                            checked={iwaIncludeWatchOnly}
                            onChange={(e) => setIwaIncludeWatchOnly(e.target.checked)}
                            color="primary"
                          />
                        </Box>
                        
                        {iwaError && <Alert severity="error" sx={{ mt: 1 }}>{iwaError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={iwaLoading || !iwaAddress}
                            sx={{ fontSize: '14px' }}
                          >
                            FIND IDENTITIES
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              setIwaAddress('');
                              setIwaIncludeWatchOnly(false);
                              setIwaResult(null);
                              setIwaError('');
                            }}
                            disabled={iwaLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            RESET FORM
                          </Button>
                        </Box>
                        
                        {iwaLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Searching for identities...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the results */}
                        {iwaResult && !iwaLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700 }}>
                                Found {iwaResult.length} Identities
                              </Typography>
                              {iwaResult.length > 0 && (
                                <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                  Click on an identity to expand details
                                </Typography>
                              )}
                            </Box>
                            
                            {iwaResult.length === 0 ? (
                              <Typography sx={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic' }}>
                                No identities found associated with the specified address.
                              </Typography>
                            ) : (
                              iwaResult.map((item, index) => (
                                <Accordion key={index} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '14px', color: '#4caf50', fontWeight: 600 }}>
                                        {item.identity?.name || item.name || "Unnamed Identity"}
                                      </Typography>
                                      <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                        {item.identity?.identityaddress || item.identityaddress || "No address available"}
                                      </Typography>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 2, background: '#232323', borderTop: '1px solid #333' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {/* Basic identity information */}
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Name:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity?.name || item.name || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Identity Address:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity?.identityaddress || item.identityaddress || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      {(item.identity?.parent || item.parent) && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Parent:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {item.identity?.parent || item.parent || "N/A"}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {/* Primary addresses section */}
                                      {(item.identity?.primaryaddresses || item.primaryaddresses) && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Primary Addresses:</Typography>
                                          <Box sx={{ flex: 1 }}>
                                            {(item.identity?.primaryaddresses || item.primaryaddresses)?.map((addr, idx) => (
                                              <Typography key={idx} sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd' }}>
                                                {addr}
                                              </Typography>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {/* Status information - if status or flags are present */}
                                      {(item.status || item.identity?.flags || item.flags) && (
                                        <>
                                          <Divider sx={{ my: 1, bgcolor: '#444' }} />
                                          
                                          {item.status && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Status:</Typography>
                                              <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: item.status === 'active' ? '#4caf50' : '#ff9800', flex: 1 }}>
                                                {item.status}
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          {(item.identity?.flags || item.flags) && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Flags:</Typography>
                                              <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                                {item.identity?.flags || item.flags}
                                              </Typography>
                                            </Box>
                                          )}
                                        </>
                                      )}
                                      
                                      {/* Action buttons */}
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => {
                                            // Set up details view for this identity
                                            const idAddress = item.identity?.identityaddress || item.identityaddress;
                                            if (idAddress) {
                                              setGiIdentityNameOrId(idAddress);
                                              setSelectedOperation('query');
                                              setSelectedSubOperation('getidentity');
                                            }
                                          }}
                                          sx={{ fontSize: '12px' }}
                                        >
                                          View Details
                                        </Button>
                                      </Box>
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              ))
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Identities With Recovery Form */}
                    {selectedSubOperation === 'identitieswithrecovery' && (
                      <Box component="form" onSubmit={handleIdentitiesWithRecovery} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Find identities with a specific identity as recovery authority
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Search for identities that have the specified identity as their recovery authority.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Identity ID *
                          </Typography>
                          <input
                            type="text"
                            value={iwcIdentityId}
                            onChange={(e) => setIwcIdentityId(e.target.value)}
                            placeholder="Enter identity ID"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            required
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            From Height
                          </Typography>
                          <input
                            type="number"
                            value={iwcFromHeight}
                            onChange={(e) => setIwcFromHeight(e.target.value)}
                            placeholder="Enter start block height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            To Height
                          </Typography>
                          <input
                            type="number"
                            value={iwcToHeight}
                            onChange={(e) => setIwcToHeight(e.target.value)}
                            placeholder="Enter end block height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                            Unspent
                          </Typography>
                          <Switch
                            checked={iwcUnspent}
                            onChange={(e) => setIwcUnspent(e.target.checked)}
                            color="primary"
                          />
                        </Box>
                        
                        {iwcError && <Alert severity="error" sx={{ mt: 1 }}>{iwcError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={iwcLoading || !iwcIdentityId}
                            sx={{ fontSize: '14px' }}
                          >
                            FIND IDENTITIES
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              setIwcIdentityId('');
                              setIwcFromHeight('');
                              setIwcToHeight('');
                              setIwcUnspent(false);
                              setIwcResult(null);
                              setIwcError('');
                            }}
                            disabled={iwcLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            RESET FORM
                          </Button>
                        </Box>
                        
                        {iwcLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Searching for identities...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the results */}
                        {iwcResult && !iwcLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700 }}>
                                Found {iwcResult.length} Identities
                              </Typography>
                              {iwcResult.length > 0 && (
                                <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                  Click on an identity to expand details
                                </Typography>
                              )}
                            </Box>
                            
                            {iwcResult.length === 0 ? (
                              <Typography sx={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic' }}>
                                No identities found with the specified recovery authority.
                              </Typography>
                            ) : (
                              iwcResult.map((item, index) => (
                                <Accordion key={index} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '14px', color: '#4caf50', fontWeight: 600 }}>
                                        {item.identity?.name || item.name || "Unnamed Identity"}
                                      </Typography>
                                      <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                        {item.identity?.identityaddress || item.identityaddress || "No address available"}
                                      </Typography>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 2, background: '#232323', borderTop: '1px solid #333' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {/* Basic identity information */}
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Name:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity?.name || item.name || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Identity Address:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity?.identityaddress || item.identityaddress || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      {(item.identity?.parent || item.parent) && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Parent:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {item.identity?.parent || item.parent || "N/A"}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {/* Primary addresses section */}
                                      {(item.identity?.primaryaddresses || item.primaryaddresses) && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Primary Addresses:</Typography>
                                          <Box sx={{ flex: 1 }}>
                                            {(item.identity?.primaryaddresses || item.primaryaddresses)?.map((addr, idx) => (
                                              <Typography key={idx} sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd' }}>
                                                {addr}
                                              </Typography>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {/* Status information - if status or flags are present */}
                                      {(item.status || item.identity?.flags || item.flags) && (
                                        <>
                                          <Divider sx={{ my: 1, bgcolor: '#444' }} />
                                          
                                          {item.status && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Status:</Typography>
                                              <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: item.status === 'active' ? '#4caf50' : '#ff9800', flex: 1 }}>
                                                {item.status}
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          {(item.identity?.flags || item.flags) && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Flags:</Typography>
                                              <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                                {item.identity?.flags || item.flags}
                                              </Typography>
                                            </Box>
                                          )}
                                        </>
                                      )}
                                      
                                      {/* Action buttons */}
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => {
                                            // Set up details view for this identity
                                            const idAddress = item.identity?.identityaddress || item.identityaddress;
                                            if (idAddress) {
                                              setGiIdentityNameOrId(idAddress);
                                              setSelectedOperation('query');
                                              setSelectedSubOperation('getidentity');
                                            }
                                          }}
                                          sx={{ fontSize: '12px' }}
                                        >
                                          View Details
                                        </Button>
                                      </Box>
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              ))
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Identities With Revocation Form */}
                    {selectedSubOperation === 'identitieswithrevocation' && (
                      <Box component="form" onSubmit={handleIdentitiesWithRevocation} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Find identities with a specific identity as revocation authority
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Search for identities that have the specified identity as their revocation authority.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Identity ID *
                          </Typography>
                          <input
                            type="text"
                            value={iwrIdentityId}
                            onChange={(e) => setIwrIdentityId(e.target.value)}
                            placeholder="Enter identity ID"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            required
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            From Height
                          </Typography>
                          <input
                            type="number"
                            value={iwrFromHeight}
                            onChange={(e) => setIwrFromHeight(e.target.value)}
                            placeholder="Enter start block height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            To Height
                          </Typography>
                          <input
                            type="number"
                            value={iwrToHeight}
                            onChange={(e) => setIwrToHeight(e.target.value)}
                            placeholder="Enter end block height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                            Unspent
                          </Typography>
                          <Switch
                            checked={iwrUnspent}
                            onChange={(e) => setIwrUnspent(e.target.checked)}
                            color="primary"
                          />
                        </Box>
                        
                        {iwrError && <Alert severity="error" sx={{ mt: 1 }}>{iwrError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={iwrLoading || !iwrIdentityId}
                            sx={{ fontSize: '14px' }}
                          >
                            FIND IDENTITIES
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              setIwrIdentityId('');
                              setIwrFromHeight('');
                              setIwrToHeight('');
                              setIwrUnspent(false);
                              setIwrResult(null);
                              setIwrError('');
                            }}
                            disabled={iwrLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            RESET FORM
                          </Button>
                        </Box>
                        
                        {iwrLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Searching for identities...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the results */}
                        {iwrResult && !iwrLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700 }}>
                                Found {iwrResult.length} Identities
                              </Typography>
                              {iwrResult.length > 0 && (
                                <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                  Click on an identity to expand details
                                </Typography>
                              )}
                            </Box>
                            
                            {iwrResult.length === 0 ? (
                              <Typography sx={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic' }}>
                                No identities found with the specified revocation authority.
                              </Typography>
                            ) : (
                              iwrResult.map((item, index) => (
                                <Accordion key={index} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '14px', color: '#4caf50', fontWeight: 600 }}>
                                        {item.identity?.name || item.name || "Unnamed Identity"}
                                      </Typography>
                                      <Typography sx={{ fontSize: '12px', color: '#bbb' }}>
                                        {item.identity?.identityaddress || item.identityaddress || "No address available"}
                                      </Typography>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 2, background: '#232323', borderTop: '1px solid #333' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {/* Basic identity information */}
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Name:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity?.name || item.name || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Identity Address:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {item.identity?.identityaddress || item.identityaddress || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      {(item.identity?.parent || item.parent) && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Parent:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {item.identity?.parent || item.parent || "N/A"}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {/* Primary addresses section */}
                                      {(item.identity?.primaryaddresses || item.primaryaddresses) && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Primary Addresses:</Typography>
                                          <Box sx={{ flex: 1 }}>
                                            {(item.identity?.primaryaddresses || item.primaryaddresses)?.map((addr, idx) => (
                                              <Typography key={idx} sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd' }}>
                                                {addr}
                                              </Typography>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {/* Status information - if status or flags are present */}
                                      {(item.status || item.identity?.flags || item.flags) && (
                                        <>
                                          <Divider sx={{ my: 1, bgcolor: '#444' }} />
                                          
                                          {item.status && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Status:</Typography>
                                              <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: item.status === 'active' ? '#4caf50' : '#ff9800', flex: 1 }}>
                                                {item.status}
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          {(item.identity?.flags || item.flags) && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Flags:</Typography>
                                              <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                                {item.identity?.flags || item.flags}
                                              </Typography>
                                            </Box>
                                          )}
                                        </>
                                      )}
                                      
                                      {/* Action buttons */}
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => {
                                            // Set up details view for this identity
                                            const idAddress = item.identity?.identityaddress || item.identityaddress;
                                            if (idAddress) {
                                              setGiIdentityNameOrId(idAddress);
                                              setSelectedOperation('query');
                                              setSelectedSubOperation('getidentity');
                                            }
                                          }}
                                          sx={{ fontSize: '12px' }}
                                        >
                                          View Details
                                        </Button>
                                      </Box>
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              ))
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Identity Content Form */}
                    {selectedSubOperation === 'identitycontent' && (
                      <Box component="form" onSubmit={handleIdentityContent} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Retrieve the content of an identity
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Get the content of an identity, including its name, primary addresses, and other details.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Identity Name or ID *
                          </Typography>
                          <input
                            type="text"
                            value={icIdentityNameOrId}
                            onChange={(e) => setIcIdentityNameOrId(e.target.value)}
                            placeholder="Enter identity name or ID"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                            required
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Height Start
                          </Typography>
                          <input
                            type="number"
                            value={icHeightStart}
                            onChange={(e) => setIcHeightStart(e.target.value)}
                            placeholder="Enter start block height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Height End
                          </Typography>
                          <input
                            type="number"
                            value={icHeightEnd}
                            onChange={(e) => setIcHeightEnd(e.target.value)}
                            placeholder="Enter end block height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                            Tx Proofs
                          </Typography>
                          <Switch
                            checked={icTxProofs}
                            onChange={(e) => setIcTxProofs(e.target.checked)}
                            color="primary"
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            Tx Proof Height
                          </Typography>
                          <input
                            type="number"
                            value={icTxProofHeight}
                            onChange={(e) => setIcTxProofHeight(e.target.value)}
                            placeholder="Enter tx proof height"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                            VDXF Key
                          </Typography>
                          <input
                            type="text"
                            value={icVdxfKey}
                            onChange={(e) => setIcVdxfKey(e.target.value)}
                            placeholder="Enter VDXF key"
                            style={{ fontSize: '14px', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#232323', color: '#fff' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '14px', color: '#fff', flex: 1 }}>
                            Keep Deleted
                          </Typography>
                          <Switch
                            checked={icKeepDeleted}
                            onChange={(e) => setIcKeepDeleted(e.target.checked)}
                            color="primary"
                          />
                        </Box>
                        
                        {icError && <Alert severity="error" sx={{ mt: 1 }}>{icError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={icLoading || !icIdentityNameOrId}
                            sx={{ fontSize: '14px' }}
                          >
                            GET IDENTITY CONTENT
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              setIcIdentityNameOrId('');
                              setIcHeightStart('');
                              setIcHeightEnd('');
                              setIcTxProofs(false);
                              setIcTxProofHeight('');
                              setIcVdxfKey('');
                              setIcKeepDeleted(false);
                              setIcResult(null);
                              setIcError('');
                            }}
                            disabled={icLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            RESET FORM
                          </Button>
                        </Box>
                        
                        {icLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Retrieving identity content...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the results */}
                        {icResult && !icLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700 }}>
                                Identity Content
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleCopyToClipboard(JSON.stringify(icResult, null, 2))}
                                startIcon={<ContentCopyIcon />}
                                sx={{ fontSize: '12px' }}
                              >
                                Copy JSON
                              </Button>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {/* Main identity information */}
                              {icResult.fullyqualifiedname && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Fully Qualified Name:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#4caf50', flex: 1 }}>
                                    {icResult.fullyqualifiedname}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.status && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Status:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: icResult.status === 'active' ? '#4caf50' : '#ff9800', flex: 1 }}>
                                    {icResult.status}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.blockheight !== undefined && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Block Height:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                    {icResult.blockheight}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.fromheight !== undefined && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>From Height:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                    {icResult.fromheight}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.toheight !== undefined && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>To Height:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                    {icResult.toheight}
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Transaction information */}
                              {icResult.txid && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Transaction ID:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1, wordBreak: 'break-all' }}>
                                    {icResult.txid}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.vout !== undefined && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Vout:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                    {icResult.vout}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.canspendfor !== undefined && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Can Spend For:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: icResult.canspendfor ? '#4caf50' : '#f44336', flex: 1 }}>
                                    {icResult.canspendfor ? 'Yes' : 'No'}
                                  </Typography>
                                </Box>
                              )}
                              
                              {icResult.cansignfor !== undefined && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Can Sign For:</Typography>
                                  <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: icResult.cansignfor ? '#4caf50' : '#f44336', flex: 1 }}>
                                    {icResult.cansignfor ? 'Yes' : 'No'}
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Divider before identity object */}
                              <Divider sx={{ my: 1, bgcolor: '#444' }} />
                              
                              {/* Identity object */}
                              {icResult.identity && (
                                <Accordion defaultExpanded sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Typography sx={{ fontSize: '14px', color: '#90caf9', fontWeight: 700 }}>
                                      Identity Details
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Name:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {icResult.identity.name || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Identity Address:</Typography>
                                        <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                          {icResult.identity.identityaddress || "N/A"}
                                        </Typography>
                                      </Box>
                                      
                                      {icResult.identity.parent && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Parent:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.parent}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.systemid && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>System ID:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.systemid}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {/* Primary addresses section */}
                                      {icResult.identity.primaryaddresses && icResult.identity.primaryaddresses.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Primary Addresses:</Typography>
                                          <Box sx={{ flex: 1 }}>
                                            {icResult.identity.primaryaddresses.map((addr, idx) => (
                                              <Typography key={idx} sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd' }}>
                                                {addr}
                                              </Typography>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.minimumsignatures !== undefined && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Min Signatures:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.minimumsignatures}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.revocationauthority && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Revocation Auth:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.revocationauthority}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.recoveryauthority && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Recovery Auth:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.recoveryauthority}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.privateaddress && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Private Address:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.privateaddress}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.timelock !== undefined && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Timelock:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.timelock}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.version !== undefined && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Version:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.version}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      {icResult.identity.flags !== undefined && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Flags:</Typography>
                                          <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                            {icResult.identity.flags}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              
                              {/* Content Map section */}
                              {icResult.identity && icResult.identity.contentmap && Object.keys(icResult.identity.contentmap).length > 0 && (
                                <Accordion defaultExpanded={false} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Typography sx={{ fontSize: '14px', color: '#90caf9', fontWeight: 700 }}>
                                      Content Map ({Object.keys(icResult.identity.contentmap).length} entries)
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                                      {Object.entries(icResult.identity.contentmap).map(([key, value], idx) => (
                                        <Box key={idx} sx={{ mb: 1.5, p: 1, background: '#232323', borderRadius: 1 }}>
                                          <Typography sx={{ color: '#90caf9', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', mb: 0.5 }}>
                                            Key: {key}
                                          </Typography>
                                          <Typography sx={{ color: '#ddd', fontSize: '13px', fontFamily: 'monospace', ml: 2, wordBreak: 'break-all' }}>
                                            Value: {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              
                              {/* Content MultiMap section */}
                              {icResult.identity && icResult.identity.contentmultimap && Object.keys(icResult.identity.contentmultimap).length > 0 && (
                                <Accordion defaultExpanded={false} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Typography sx={{ fontSize: '14px', color: '#90caf9', fontWeight: 700 }}>
                                      Content MultiMap ({Object.keys(icResult.identity.contentmultimap).length} entries)
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                                      {Object.entries(icResult.identity.contentmultimap).map(([primaryKey, entries], idx) => (
                                        <Box key={idx} sx={{ mb: 1.5, p: 1, background: '#232323', borderRadius: 1 }}>
                                          <Typography sx={{ color: '#90caf9', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', mb: 0.5 }}>
                                            Primary VDXF Key: {primaryKey}
                                          </Typography>
                                          {Array.isArray(entries) && entries.length > 0 ? (
                                            <Box sx={{ pl: 2 }}>
                                              {entries.map((entry, entryIdx) => (
                                                <Box key={entryIdx} sx={{ mt: 0.25, mb: 0.25, pt: 0.25, pb: 0.25, pl: 1, background: '#181818', borderRadius: 1 }}>
                                                  {renderContentMultiMapEntry(entry)}
                                                </Box>
                                              ))}
                                            </Box>
                                          ) : (
                                            <Typography sx={{ color: '#bbb', fontSize: '12px', ml: 2 }}>No entries for this key.</Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              
                              {/* Transaction proof section */}
                              {icResult.proof && (
                                <Accordion defaultExpanded={false} sx={{ background: '#181818', mb: 1 }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                    <Typography sx={{ fontSize: '14px', color: '#90caf9', fontWeight: 700 }}>
                                      Transaction Proof
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>Proof Height:</Typography>
                                      <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                        {icResult.proofheight || "N/A"}
                                      </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, mt: 1, mb: 0.5 }}>Proof Data:</Typography>
                                    <pre style={{ 
                                      fontSize: '12px', 
                                      color: '#ddd', 
                                      background: '#232323', 
                                      padding: '8px', 
                                      borderRadius: '4px', 
                                      overflowX: 'auto',
                                      maxHeight: '200px',
                                      overflowY: 'auto'
                                    }}>
                                      {typeof icResult.proof === 'string' ? icResult.proof : JSON.stringify(icResult.proof, null, 2)}
                                    </pre>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              
                              {/* Additional fields not explicitly handled above */}
                              {Object.entries(icResult)
                                .filter(([key]) => ![
                                  'fullyqualifiedname', 'status', 'blockheight', 'fromheight', 'toheight',
                                  'txid', 'vout', 'canspendfor', 'cansignfor', 'identity', 'proof', 
                                  'proofheight'
                                ].includes(key))
                                .map(([key, value]) => (
                                  <Box key={key} sx={{ display: 'flex', gap: 1 }}>
                                    <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 150 }}>
                                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                                    </Typography>
                                    <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1, wordBreak: 'break-all' }}>
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </Typography>
                                  </Box>
                                ))
                              }
                              
                              {/* Action buttons */}
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => {
                                    // Set up details view for this identity
                                    const idAddress = icResult.identity?.identityaddress;
                                    if (idAddress) {
                                      setGiIdentityNameOrId(idAddress);
                                      setSelectedOperation('query');
                                      setSelectedSubOperation('getidentity');
                                    }
                                  }}
                                  sx={{ fontSize: '12px' }}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Identity Trust Form */}
                    {selectedSubOperation === 'identitytrust' && (
                      <Box component="form" onSubmit={handleIdentityTrust} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ fontSize: '14px', color: '#fff', mb: 0 }}>
                          Retrieve trust ratings for identities
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic', mb: 1 }}>
                          Get trust ratings assigned to identities within the Verus ecosystem. Leave empty to fetch all ratings.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '14px', color: '#fff' }}>
                              Identity IDs (Optional)
                            </Typography>
                            <Button 
                              type="button" 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleAddToArray(itIdentityIds, setItIdentityIds)} 
                              sx={{ fontSize: '12px', py: 0.25 }}
                            >
                              + ADD ID
                            </Button>
                          </Box>
                          
                          {itIdentityIds.map((id, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <input
                                type="text"
                                value={id}
                                onChange={(e) => handleArrayChange(itIdentityIds, setItIdentityIds, index, e.target.value)}
                                placeholder="Enter identity ID"
                                style={{ 
                                  fontSize: '14px', 
                                  padding: '8px', 
                                  borderRadius: '4px', 
                                  border: '1px solid #444', 
                                  background: '#232323', 
                                  color: '#fff',
                                  flex: 1
                                }}
                              />
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveFromArray(itIdentityIds, setItIdentityIds, index)} 
                                disabled={itIdentityIds.length === 1}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                          <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>
                            Add multiple IDs to filter results, or leave empty to get all trust ratings
                          </Typography>
                        </Box>
                        
                        {itError && <Alert severity="error" sx={{ mt: 1 }}>{itError}</Alert>}
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={itLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            GET IDENTITY TRUST
                          </Button>
                          <Button 
                            type="button" 
                            variant="outlined" 
                            onClick={() => {
                              setItIdentityIds(['']);
                              setItResult(null);
                              setItError('');
                            }}
                            disabled={itLoading}
                            sx={{ fontSize: '14px' }}
                          >
                            RESET FORM
                          </Button>
                        </Box>
                        
                        {itLoading && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                            <CircularProgress size={20} />
                            <Typography sx={{ fontSize: '14px', color: '#bbb' }}>Retrieving identity trust data...</Typography>
                          </Box>
                        )}
                        
                        {/* Display the results */}
                        {itResult && !itLoading && (
                          <Box sx={{ mt: 2, p: 2, background: '#232323', borderRadius: 4, overflowY: 'auto', maxHeight: '500px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: '16px', color: '#90caf9', fontWeight: 700 }}>
                                Identity Trust Results
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleCopyToClipboard(JSON.stringify(itResult, null, 2))}
                                startIcon={<ContentCopyIcon />}
                                sx={{ fontSize: '12px' }}
                              >
                                Copy JSON
                              </Button>
                            </Box>
                            
                            {/* Display trust mode */}
                            <Box sx={{ mb: 2, p: 1.5, background: '#181818', borderRadius: 2 }}>
                              <Typography sx={{ fontSize: '14px', color: '#90caf9', fontWeight: 600 }}>
                                Current Trust Mode: {itResult.identitytrustmode}
                              </Typography>
                              <Typography sx={{ fontSize: '13px', color: '#ddd', mt: 0.5 }}>
                                {itResult.identitytrustmode === 0 && "No restriction on sync"}
                                {itResult.identitytrustmode === 1 && "Only sync to IDs rated approved"}
                                {itResult.identitytrustmode === 2 && "Sync to all IDs but those on block list"}
                              </Typography>
                            </Box>
                            
                            {/* Display trust ratings */}
                            {itResult.setratings && Object.keys(itResult.setratings).length > 0 ? (
                              <>
                                <Typography sx={{ fontSize: '14px', color: '#90caf9', mb: 1.5 }}>
                                  Trust Ratings ({Object.keys(itResult.setratings).length} total)
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  {Object.entries(itResult.setratings).map(([identityId, ratingInfo], index) => (
                                    <Accordion 
                                      key={index} 
                                      defaultExpanded={false} 
                                      sx={{ background: '#181818', mb: 0.5 }}
                                    >
                                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                          <Box 
                                            sx={{ 
                                              width: 20, 
                                              height: 20, 
                                              borderRadius: '50%', 
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 'bold',
                                              bgcolor: ratingInfo.rating > 0 ? '#4caf50' : (ratingInfo.rating < 0 ? '#f44336' : '#bbb'),
                                              color: '#fff',
                                              fontSize: '14px'
                                            }}
                                          >
                                            {ratingInfo.rating > 0 ? '+' : ratingInfo.rating < 0 ? '-' : '0'}
                                          </Box>
                                          <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {identityId}
                                          </Typography>
                                          <Typography sx={{ fontSize: '13px', color: '#bbb', mr: 1 }}>
                                            Rating: {ratingInfo.rating}
                                          </Typography>
                                        </Box>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 120 }}>Identity ID:</Typography>
                                            <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1, wordBreak: 'break-all' }}>
                                              {identityId}
                                            </Typography>
                                          </Box>
                                          
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 120 }}>Rating:</Typography>
                                            <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                              {ratingInfo.rating}
                                            </Typography>
                                          </Box>
                                          
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 120 }}>Flags:</Typography>
                                            <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                              {ratingInfo.flags}
                                            </Typography>
                                          </Box>
                                          
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 120 }}>Block Height:</Typography>
                                            <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1 }}>
                                              {ratingInfo.blockheight}
                                            </Typography>
                                          </Box>
                                          
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography sx={{ fontSize: '14px', color: '#fff', fontWeight: 600, minWidth: 120 }}>Transaction ID:</Typography>
                                            <Typography sx={{ fontSize: '14px', fontFamily: 'monospace', color: '#ddd', flex: 1, wordBreak: 'break-all' }}>
                                              {ratingInfo.txid}
                                            </Typography>
                                          </Box>
                                          
                                          {/* Action buttons */}
                                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                                            <Button
                                              variant="outlined"
                                              size="small"
                                              onClick={() => {
                                                // Set up details view for this identity
                                                setGiIdentityNameOrId(identityId);
                                                setSelectedOperation('query');
                                                setSelectedSubOperation('getidentity');
                                              }}
                                              sx={{ fontSize: '12px' }}
                                            >
                                              View Identity Details
                                            </Button>
                                          </Box>
                                        </Box>
                                      </AccordionDetails>
                                    </Accordion>
                                  ))}
                                </Box>
                              </>
                            ) : (
                              <Typography sx={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic' }}>
                                No trust ratings found.
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                      </Box>
