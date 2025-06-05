import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, List, ListItem, ListItemText, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { styled } from '@mui/material/styles';
import { getFlagDescription } from '../../utils/identityUtils.js';
import { NodeContext } from '../../contexts/NodeContext';

// Helper functions defined once at the top
const handleCopyGlobal = (textToCopy) => {
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
          <IconButton onClick={() => handleCopyGlobal(valueToCopy)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}>
            <ContentCopyIcon sx={{fontSize: '0.9rem'}}/>
          </IconButton>
        </Tooltip>
      )}
    </ListItem>
  );
};

const IdentityFlagsListDisplay = ({ flagsInt }) => {
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

const ContentMapDisplay = ({ contentmap }) => {
  if (!contentmap || Object.keys(contentmap).length === 0) {
    return <Typography sx={{ fontSize: '0.75rem', color: '#bbb', fontStyle: 'italic', mt:1 }}>Empty Content Map</Typography>;
  }
  return (
    <Accordion sx={{ mt: 1, background: '#1c1c1c' }} disableGutters elevation={0} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Typography sx={{ fontSize: '0.8rem', color: '#90caf9', fontWeight: 500 }}>Content Map ({Object.keys(contentmap).length})</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '200px', overflowY: 'auto' }}>
        <List dense disablePadding>
        {Object.entries(contentmap).map(([vdxfkey, value]) => (
          <DetailItemWithCopy key={vdxfkey} label={vdxfkey} value={value} />
        ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

const ContentMultiMapDisplay = ({ contentmultimap }) => {
  if (!contentmultimap || Object.keys(contentmultimap).length === 0) {
    return <Typography sx={{ fontSize: '0.75rem', color: '#bbb', fontStyle: 'italic', mt:1 }}>Empty Content Multi-Map</Typography>;
  }

  const renderNestedVdxfObject = (vdxfObject) => {
    if (typeof vdxfObject !== 'object' || vdxfObject === null) {
      return (
        <Typography component="span" sx={{ fontSize: '0.7rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {String(vdxfObject)}
        </Typography>
      );
    }
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {Object.entries(vdxfObject).map(([fieldKey, fieldValue]) => {
          let displayValue = fieldValue;
          if (fieldKey === 'objectdata' && typeof fieldValue === 'object' && fieldValue !== null) {
            if (fieldValue.message) displayValue = fieldValue.message;
            else if (fieldValue.label) displayValue = fieldValue.label;
            else displayValue = JSON.stringify(fieldValue);
          } else if (typeof fieldValue === 'object' && fieldValue !== null) {
            displayValue = JSON.stringify(fieldValue);
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
                  <IconButton onClick={() => handleCopyGlobal(primaryKey)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}> 
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
                            <IconButton onClick={() => handleCopyGlobal(nestedKey)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}> 
                                <ContentCopyIcon sx={{fontSize: '0.8rem'}}/> 
                            </IconButton>
                        </Tooltip>
                    </Box>
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

const StyledOuterPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
  background: '#232323',
  borderRadius: '8px', 
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', 
  margin: 0,
}));

const VerusIdDetailsCM = () => {
  const {
    selectedVerusIdCM,
    verusIdDetailsForCM,
    loadingVerusIdDetailsCM,
    errorVerusIdDetailsCM,
  } = useContext(IdentityContext);

  const { getNetworkNotarizationForBlock } = useContext(NodeContext);
  const [notarizationDetails, setNotarizationDetails] = useState(null);
  const [loadingNotarization, setLoadingNotarization] = useState(false);

  useEffect(() => {
    const fetchNotarization = async () => {
      if (verusIdDetailsForCM?.identity?.proofprotocol === 2 && verusIdDetailsForCM.bestcurrencystate?.lastconfirmednotarization?.blockhash) {
        setLoadingNotarization(true);
        setNotarizationDetails(null);
        try {
          const notarization = await getNetworkNotarizationForBlock(verusIdDetailsForCM.bestcurrencystate.lastconfirmednotarization.blockhash);
          setNotarizationDetails(notarization);
        } catch (err) {
          console.error("Error fetching notarization details for CM tab:", err);
          setNotarizationDetails({ error: "Failed to fetch notarization details." });
        } finally {
          setLoadingNotarization(false);
        }
      } else {
        setNotarizationDetails(null);
      }
    };
    if (selectedVerusIdCM && verusIdDetailsForCM) {
        fetchNotarization();
    }
  }, [verusIdDetailsForCM, getNetworkNotarizationForBlock, selectedVerusIdCM]);

  if (loadingVerusIdDetailsCM) {
    return (
      <StyledOuterPaper>
        <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0 }}>VerusID Details</Typography>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexGrow:1 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2, color: '#bbb' }}>Loading identity details...</Typography>
        </Box>
      </StyledOuterPaper>
    );
  }

  if (errorVerusIdDetailsCM) {
    return (
      <StyledOuterPaper>
        <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0 }}>VerusID Details</Typography>
        <Box sx={{ p: 2, flexGrow:1 }}><Alert severity="error">Error: {typeof errorVerusIdDetailsCM === 'string' ? errorVerusIdDetailsCM : JSON.stringify(errorVerusIdDetailsCM)}</Alert></Box>
      </StyledOuterPaper>
    );
  }

  if (!selectedVerusIdCM || !verusIdDetailsForCM || !verusIdDetailsForCM.identity) {
    return (
      <StyledOuterPaper>
        <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919', flexShrink: 0 }}>VerusID Details</Typography>
        <Box sx={{ p: 2, flexGrow:1 }}><Typography sx={{ fontSize: '0.8rem', color: '#bbb', textAlign: 'center' }}>Select a VerusID from the list to view its details.</Typography></Box>
      </StyledOuterPaper>
    );
  }

  const {
    fullyqualifiedname,
    status,
    blockheight,
    txid,
    vout,
    identity 
  } = verusIdDetailsForCM;

  const {
    identityaddress, parent, systemid, primaryaddresses,
    minimumsignatures, revocationauthority, recoveryauthority,
    timelock, flags, privateaddress, contentbrands, proofprotocol,
    contentmap, contentmultimap
  } = identity;

  const displayTitle = fullyqualifiedname || selectedVerusIdCM || 'VerusID Details';

  return (
    <StyledOuterPaper>
      <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between', p:1, backgroundColor: '#191919', flexShrink:0}}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          {displayTitle}
        </Typography>
        {fullyqualifiedname && (
          <Tooltip title={`Copy ID: ${fullyqualifiedname}`}>
            <IconButton onClick={() => handleCopyGlobal(fullyqualifiedname)} size="small" sx={{ p: 0.25, color: '#ccc' }}>
              <ContentCopyIcon sx={{fontSize: '0.9rem'}} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box sx={{flexGrow: 1, overflowY: 'auto', p: 1.5, pr:1 }}>
        <List dense disablePadding>
            <DetailItemWithCopy label="Status" value={status} isMonospace={false}/>
            <DetailItemWithCopy label="Identity Address" value={identityaddress} />
            <DetailItemWithCopy label="Parent" value={parent || 'None'} />
            <DetailItemWithCopy label="System ID" value={systemid} />
            
            <DetailItemWithCopy label="Flags" value={flags} isMonospace={false} fullValue={flags}/>
            {typeof flags === 'number' && (() => {
              const flagDescriptions = getFlagDescription(flags);
              if (flagDescriptions && flagDescriptions.length > 0 && flagDescriptions[0] !== 'None' && flagDescriptions[0] !== 'N/A') {
                return (
                  <ListItem dense disableGutters sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb:0.5, pl:1.5, pt:0, borderBottom: '1px solid #303030'}}>
                    <Typography variant="caption" sx={{ color: '#888', fontSize:'0.7rem', mb:0.25 }}>Decoded Flags:</Typography>
                    <IdentityFlagsListDisplay flagsInt={flags} />
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
            <DetailItemWithCopy label="Content Brands" value={contentbrands ? JSON.stringify(contentbrands) : 'undefined'} isMonospace={false}/>
            <DetailItemWithCopy label="Proof Protocol" value={proofprotocol === 1 ? 'VRSC (PoP)' : proofprotocol === 2 ? 'PBaaS (PoS)' : proofprotocol} isMonospace={false}/>

            {blockheight !== undefined && <DetailItemWithCopy label="Defined at Block" value={blockheight} isMonospace={false}/>}
            {txid && <DetailItemWithCopy label="Definition TXID" value={txid} />}
            {vout !== undefined && <DetailItemWithCopy label="Definition VOUT" value={vout} isMonospace={false}/>}

            {verusIdDetailsForCM?.identity?.proofprotocol === 2 && verusIdDetailsForCM.bestcurrencystate && (
                <>
                  <Divider sx={{ my: 1, borderColor: '#444' }} />
                  <Typography variant="body2" sx={{ color: '#a0cff9', fontWeight: '500', mt:1, fontSize:'0.85rem' }}>PBaaS Chain State:</Typography>
                  <DetailItemWithCopy label="  Best State Block" value={verusIdDetailsForCM.bestcurrencystate.blockheight} isMonospace={false}/>
                  <DetailItemWithCopy label="  Flags" value={verusIdDetailsForCM.bestcurrencystate.flags} isMonospace={false}/>
                  <DetailItemWithCopy label="  Fractional Supply" value={verusIdDetailsForCM.bestcurrencystate.supply} isMonospace={false}/>
                  <DetailItemWithCopy label="  Reserve Currencies" value={verusIdDetailsForCM.bestcurrencystate.currencies} isJson={true}/>
                  {verusIdDetailsForCM.bestcurrencystate.lastconfirmednotarization && (
                    <>
                     <DetailItemWithCopy label="  LC Not. Height" value={verusIdDetailsForCM.bestcurrencystate.lastconfirmednotarization.blockheight} isMonospace={false}/>
                     <DetailItemWithCopy label="  LC Not. Hash" value={verusIdDetailsForCM.bestcurrencystate.lastconfirmednotarization.blockhash}/>
                    </>
                  )}
                  {loadingNotarization && <Box sx={{display:'flex', justifyContent:'center', py:1}}><CircularProgress size={18} /></Box>}
                  {notarizationDetails && !notarizationDetails.error && (
                    <>
                      <Typography variant="body2" sx={{ color: '#bbb', fontWeight: '500', mt:0.5, ml:1, fontSize:'0.8rem' }}>LC Notarization Proof:</Typography>
                      <DetailItemWithCopy label="    Network" value={notarizationDetails.network} isMonospace={false}/>
                      <DetailItemWithCopy label="    Currency ID" value={notarizationDetails.currencyid}/>
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
            <Divider sx={{ my: 1, borderColor: '#444' }} />
            <ContentMapDisplay contentmap={contentmap} />
            <ContentMultiMapDisplay contentmultimap={contentmultimap} />
        </List>
      </Box>
    </StyledOuterPaper>
  );
};

export default VerusIdDetailsCM; 