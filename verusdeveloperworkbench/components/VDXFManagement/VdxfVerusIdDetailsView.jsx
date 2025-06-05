import React, { /* useContext, */ useEffect, useState } from 'react'; // Removed useContext as props are now primary
import { Box, Typography, Paper, Divider, CircularProgress, Tooltip, IconButton, List, ListItem, ListItemText, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Added ExpandMoreIcon
// import { IdentityContext } from '../../contexts/IdentityContext'; // Removed direct context consumption
import { getFlagDescription } from '../../utils/identityUtils.js'; // For flag descriptions
import { NodeContext } from '../../contexts/NodeContext'; // For getNetworkNotarizationForBlock
import { useContext } from 'react'; // Keep useContext for NodeContext

// Helper functions (similar to VerusIdDetails.jsx)
const handleCopy = (textToCopy) => {
  if (textToCopy === undefined || textToCopy === null) return;
  navigator.clipboard.writeText(String(textToCopy));
};

const DetailItemWithCopy = ({ label, value, isJson = false, fullValue = null, isMonospace = true }) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;

  let displayValue;
  if (isJson) {
    if (Array.isArray(value)) {
      displayValue = value.join('\n'); // Display array items on new lines
    } else if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value, null, 2);
    } else {
      displayValue = String(value);
    }
  } else {
    displayValue = String(value);
  }

  const valueToCopy = fullValue !== null ? String(fullValue) : 
                      (Array.isArray(value) ? JSON.stringify(value) : 
                      (value !== undefined && value !== null ? String(value) : ''));

  return (
    <ListItem dense disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #303030', pb: 0.5, mb: 0.5}}>
      <ListItemText
        primary={label}
        secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: isMonospace ? 'monospace' : 'inherit' } }}
        secondary={displayValue}
        primaryTypographyProps={{ sx: { fontSize: '0.8rem', color: '#a0cff9', fontWeight: '500', minWidth:'130px', mr:1 } }}
      />
      {(value !== undefined && value !== null && String(value).length > 0) && (
          <Tooltip title={`Copy ${label}`}>
          <IconButton onClick={() => handleCopy(valueToCopy)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}>
            <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
            </IconButton>
          </Tooltip>
        )}
    </ListItem>
  );
};

const IdentityFlagsList = ({ flagsInt }) => {
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

// Added ContentMapDisplay helper (similar to VerusIdDetailsCM.jsx)
const ContentMapDisplay = ({ contentmap }) => {
  if (!contentmap || Object.keys(contentmap).length === 0) {
    return <Typography sx={{ fontSize: '0.75rem', color: '#bbb', fontStyle: 'italic', mt:1 }}>Empty Content Map</Typography>;
  }
  return (
    <Accordion sx={{ mt: 1, background: '#1c1c1c', boxShadow:'none', '&.Mui-expanded:before': {opacity:1} }} disableGutters elevation={0} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Typography sx={{ fontSize: '0.8rem', color: '#a0cff9', fontWeight: 500 }}>Content Map ({Object.keys(contentmap).length})</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '200px', overflowY: 'auto', borderTop: '1px solid #303030' }}>
        <List dense disablePadding>
        {Object.entries(contentmap).map(([vdxfkey, value]) => (
          <DetailItemWithCopy key={vdxfkey} label={vdxfkey} value={value} />
        ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

// Updated ContentMultiMapDisplay helper
const ContentMultiMapDisplay = ({ contentmultimap }) => {
  if (!contentmultimap || Object.keys(contentmultimap).length === 0) {
    return <Typography sx={{ fontSize: '0.75rem', color: '#bbb', fontStyle: 'italic', mt:1 }}>Empty Content Multi-Map</Typography>;
  }

  // Updated renderNestedVdxfObject for compact display consistent with StatesOfMyMapsColumn
  const renderNestedVdxfObject = (vdxfObject) => {
    if (typeof vdxfObject !== 'object' || vdxfObject === null) {
      return (
        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {String(vdxfObject)}
        </Typography>
      );
    }
    // Similar to renderCompactMultiMapEntry in StatesOfMyMapsColumn.jsx
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {Object.entries(vdxfObject).map(([fieldKey, fieldValue]) => {
          let displayValue = fieldValue;
          if (fieldKey === 'objectdata' && typeof fieldValue === 'object' && fieldValue !== null) {
            // Prioritize known fields like 'message' or 'label' within objectdata, then fallback to stringify
            if (fieldValue.message) displayValue = fieldValue.message;
            else if (fieldValue.label) displayValue = fieldValue.label;
            else displayValue = JSON.stringify(fieldValue); // Compact stringify for unknown objectdata structure
          } else if (typeof fieldValue === 'object' && fieldValue !== null) {
            displayValue = JSON.stringify(fieldValue); // Compact stringify for other nested objects
          }

          return (
            <li key={fieldKey} style={{ fontSize: '0.7rem', lineHeight: 1.2, color: '#ccc' }}>
              <Typography component="span" sx={{ minWidth: 70, fontWeight: '500', color: '#bbb', fontSize: '0.7rem' }}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}:</Typography>
              <Typography component="span" sx={{ wordBreak:'break-all', fontSize: '0.7rem', color: '#ddd', ml:0.5 }}>{String(displayValue)}</Typography>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Accordion sx={{ mt: 1, background: '#1c1c1c', boxShadow:'none', '&.Mui-expanded:before': {opacity:1} }} disableGutters elevation={0} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Typography sx={{ fontSize: '0.8rem', color: '#a0cff9', fontWeight: 500 }}>Content Multi-Map ({Object.keys(contentmultimap).length})</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '250px', overflowY: 'auto', borderTop: '1px solid #303030' }}>
        <List dense disablePadding>
          {Object.entries(contentmultimap).map(([primaryKey, entriesArray]) => (
            <ListItem key={primaryKey} dense disableGutters sx={{ display: 'block', borderBottom: '1px dashed #444', pb: 1, mb: 1, '&:last-child': {borderBottom:0, mb:0} }}>
              <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', mb:0.5}}>
                <Typography sx={{ fontSize: '0.75rem', color: '#90caf9', fontWeight: 'bold' }}>{primaryKey}:</Typography>
                <Tooltip title={`Copy Primary Key: ${primaryKey}`}>
                  <IconButton onClick={() => handleCopy(primaryKey)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}> 
                    <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> 
                  </IconButton>
                </Tooltip>
              </Box>
              {Array.isArray(entriesArray) && entriesArray.map((entryItem, index) => {
                const nestedKey = Object.keys(entryItem)[0];
                const vdxfContent = entryItem[nestedKey];
                return (
                  <Box key={`${primaryKey}-${nestedKey}-${index}`} sx={{ pl: 1, mb: 0.5, borderLeft: '2px solid #444', ml:0.5, background: '#232323', p:0.5, borderRadius: '4px' }}>
                     <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', mb:0.25}}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#a0cff9', fontWeight: '500' }}>
                           Nested Key: {nestedKey}
                        </Typography>
                        <Tooltip title={`Copy Nested Key: ${nestedKey}`}>
                            <IconButton onClick={() => handleCopy(nestedKey)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}> 
                                <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> 
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {/* Call the compact renderer for vdxfContent */}
                    {renderNestedVdxfObject(vdxfContent)}
                  </Box>
                );
              })}
              {(!Array.isArray(entriesArray) || entriesArray.length === 0) && (
                <Typography sx={{color: '#888', fontSize: '0.75rem', pl:1.5}}>No nested entries for this key.</Typography>
              )}
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

// Component now primarily relies on props passed from VdxfInitialColumn.jsx
const VdxfVerusIdDetailsView = ({ identityDetails, isLoading, error }) => {
  // const { vdxfIdentityDetails, loadingVdxfDetails, errorVdxfDetails } = useContext(IdentityContext); // Replaced by props
  const { getNetworkNotarizationForBlock } = useContext(NodeContext);
  const [notarizationDetails, setNotarizationDetails] = useState(null);
  const [loadingNotarization, setLoadingNotarization] = useState(false);

  useEffect(() => {
    const fetchNotarization = async () => {
      if (identityDetails?.identity?.proofprotocol === 2 && identityDetails.bestcurrencystate?.lastconfirmednotarization?.blockhash) {
        setLoadingNotarization(true);
        setNotarizationDetails(null);
        try {
          const notarization = await getNetworkNotarizationForBlock(identityDetails.bestcurrencystate.lastconfirmednotarization.blockhash);
          setNotarizationDetails(notarization);
        } catch (err) {
          console.error("Error fetching notarization details for VDXF tab:", err);
          setNotarizationDetails({ error: "Failed to fetch notarization details." });
        } finally {
          setLoadingNotarization(false);
        }
      } else {
        setNotarizationDetails(null);
      }
    };
    fetchNotarization();
  }, [identityDetails, getNetworkNotarizationForBlock]);


  if (isLoading) {
    return (
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
        <CircularProgress size={20} />
        <Typography sx={{ ml: 1, fontSize: '0.8rem', color: '#bbb' }}>Loading details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 1, height: '100%' }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#f44336' }}>Error: {typeof error === 'string' ? error : JSON.stringify(error)}</Typography>
      </Box>
    );
  }

  // vdxfIdentityDetails is now passed as identityDetails prop
  if (!identityDetails || !identityDetails.identity) { // Check for identity sub-object as well
    return (
      <Box sx={{ p: 1, height: '100%' }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#bbb', textAlign: 'center' }}>Select a VerusID to view its details.</Typography>
      </Box>
    );
  }

  const { 
    fullyqualifiedname,
    status,
    blockheight,
    txid,
    vout,
    identity // Destructure the inner identity object
  } = identityDetails;

  const { 
    identityaddress, parent, systemid, primaryaddresses, 
    minimumsignatures, revocationauthority, recoveryauthority,
    timelock, contentmap, contentmultimap, flags,
    privateaddress, contentbrands, proofprotocol
    // version, // Add version if available in identity object
  } = identity; // Now destructuring from the inner identity object

  // const contentMapKeys = contentmap ? Object.keys(contentmap) : [];
  // const contentMultiMapKeys = contentmultimap ? Object.keys(contentmultimap) : [];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 1, 
        height: '100%', 
        overflowY: 'auto', 
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexShrink: 0 }}>
        <Typography 
          variant="subtitle1"
          sx={{ 
            color: '#fff', 
            fontWeight: 600, 
            wordBreak: 'break-all', 
            flexGrow: 1,
            fontSize: '0.9rem',
            lineHeight: 1.2
          }}
        >
          {fullyqualifiedname}
        </Typography>
        <Tooltip title={`Copy ID: ${fullyqualifiedname}`}>
          <IconButton onClick={() => handleCopy(fullyqualifiedname)} size="small" sx={{ p: 0.25 }}>
            <ContentCopyIcon sx={{fontSize: '0.9rem'}} />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ mb: 1, bgcolor: '#444', flexShrink:0 }} />

      <Box sx={{flexGrow:1, overflowY:'auto', pr:0.5 }}>
        <List dense disablePadding>
            <DetailItemWithCopy label="Status" value={status} isMonospace={false}/>
            <DetailItemWithCopy label="Identity Address" value={identityaddress} />
            <DetailItemWithCopy label="Parent" value={parent || 'None'} />
            <DetailItemWithCopy label="System ID" value={systemid} />
            
            {/* Display Raw Flags Value First */}
            <DetailItemWithCopy label="Flags" value={flags} isMonospace={false} fullValue={flags}/>
            {/* Then display decoded flags if available and not just 'None' or 'N/A' */}
            {typeof flags === 'number' && (() => {
              const flagDescriptions = getFlagDescription(flags);
              if (flagDescriptions && flagDescriptions.length > 0 && flagDescriptions[0] !== 'None' && flagDescriptions[0] !== 'N/A') {
                return (
                  <ListItem dense disableGutters sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb:0.5, pl:1.5, pt:0, borderBottom: '1px solid #303030'}}>
                    <Typography variant="caption" sx={{ color: '#888', fontSize:'0.7rem', mb:0.25 }}>Decoded Flags:</Typography>
                    <IdentityFlagsList flagsInt={flags} />
                  </ListItem>
                );
              }
              return null;
            })()}

            <DetailItemWithCopy label="Timelock" value={timelock === "0" || timelock === 0 ? 'No timelock' : timelock} isMonospace={false}/>
            <DetailItemWithCopy label="Primary Addresses" value={primaryaddresses} isJson={true} />
            <DetailItemWithCopy label="Min Signatures" value={minimumsignatures} isMonospace={false}/>
            <DetailItemWithCopy label="Revocation Auth" value={revocationauthority} />
            <DetailItemWithCopy label="Recovery Auth" value={recoveryauthority} />
            <DetailItemWithCopy label="Private Address" value={privateaddress || 'undefined'} /> 
            {/* <DetailItemWithCopy label="Version" value={identity.version !== undefined ? identity.version : 'N/A'} isMonospace={false}/> */} 
            {/* Assuming contentbrands might be an object/array, pass isJson if needed or format appropriately */}
            <DetailItemWithCopy label="Content Brands" value={contentbrands ? JSON.stringify(contentbrands) : 'undefined'} isMonospace={false}/>
            <DetailItemWithCopy label="Proof Protocol" value={proofprotocol === 1 ? 'VRSC (PoP)' : proofprotocol === 2 ? 'PBaaS (PoS)' : proofprotocol} isMonospace={false}/>

            {blockheight !== undefined && <DetailItemWithCopy label="Defined at Block" value={blockheight} isMonospace={false}/>}
            {txid && <DetailItemWithCopy label="Definition TXID" value={txid} />}
            {vout !== undefined && <DetailItemWithCopy label="Definition VOUT" value={vout} isMonospace={false}/>}

            {/* PBaaS Chain State Details */} 
            {identityDetails?.identity?.proofprotocol === 2 && identityDetails.bestcurrencystate && (
                <>
                  <Divider sx={{ my: 1, borderColor: '#444' }} />
                  <Typography variant="body2" sx={{ color: '#a0cff9', fontWeight: '500', mt:1, fontSize:'0.85rem' }}>PBaaS Chain State:</Typography>
                  <DetailItemWithCopy label="  Best State Block" value={identityDetails.bestcurrencystate.blockheight} isMonospace={false}/>
                  <DetailItemWithCopy label="  Flags" value={identityDetails.bestcurrencystate.flags} isMonospace={false}/>
                  <DetailItemWithCopy label="  Fractional Supply" value={identityDetails.bestcurrencystate.supply} isMonospace={false}/>
                  <DetailItemWithCopy label="  Reserve Currencies" value={identityDetails.bestcurrencystate.currencies} isJson={true}/>
                  {identityDetails.bestcurrencystate.lastconfirmednotarization && (
                    <>
                     <DetailItemWithCopy label="  LC Not. Height" value={identityDetails.bestcurrencystate.lastconfirmednotarization.blockheight} isMonospace={false}/>
                     <DetailItemWithCopy label="  LC Not. Hash" value={identityDetails.bestcurrencystate.lastconfirmednotarization.blockhash}/>
                     {/* <DetailItemWithCopy label="  LC Not. Parent Hash" value={identityDetails.bestcurrencystate.lastconfirmednotarization.parenthash}/> */}
                    </>
        )}
                  {loadingNotarization && <Box sx={{display:'flex', justifyContent:'center', py:1}}><CircularProgress size={18} /></Box>}
                  {notarizationDetails && !notarizationDetails.error && (
                    <>
                      <Typography variant="body2" sx={{ color: '#bbb', fontWeight: '500', mt:0.5, ml:1, fontSize:'0.8rem' }}>LC Notarization Proof:</Typography>
                      <DetailItemWithCopy label="    Network" value={notarizationDetails.network} isMonospace={false}/>
                      <DetailItemWithCopy label="    Currency ID" value={notarizationDetails.currencyid}/>
                      {/* <DetailItemWithCopy label="    Proof Protocol" value={notarizationDetails.proofprotocol} isMonospace={false}/> */}
                      <DetailItemWithCopy label="    Notaries" value={notarizationDetails.notaries?.join(', ')} isMonospace={false}/>
                      <DetailItemWithCopy label="    Signed Mask" value={notarizationDetails.signedmask}/>
                      <DetailItemWithCopy label="    MoM" value={notarizationDetails.MoM}/>
                      <DetailItemWithCopy label="    MoMoM" value={notarizationDetails.MoMoM}/>
                      <DetailItemWithCopy label="    MoMoTRoot" value={notarizationDetails.MoMoTRoot}/>
                    </>
        )}
                  {notarizationDetails?.error && <Alert severity="warning" sx={{fontSize:'0.75rem', p:0.5, ml:1, mt:0.5}}>{notarizationDetails.error}</Alert>}
                </>
            )}
            {/* Add ContentMap and ContentMultiMap display here */}
            <Divider sx={{ my: 1, borderColor: '#444' }} />
            <ContentMapDisplay contentmap={contentmap} />
            <ContentMultiMapDisplay contentmultimap={contentmultimap} />
        </List>
      </Box>
    </Paper>
  );
};

export default VdxfVerusIdDetailsView; 