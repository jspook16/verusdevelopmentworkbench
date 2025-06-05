import React, { useContext } from 'react';
import { Box, Typography, Paper, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, List, ListItem, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { styled } from '@mui/material/styles';

// Re-using the helper from IdentityContentForm for contentmultimap display
// Consider moving this to a shared utils file, e.g., utils/displayHelpers.js
const renderContentMultiMapEntry = (entry, indent = 0, handleCopy) => {
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
          <div key={idx}>{renderContentMultiMapEntry(item, indent + 16, handleCopy)}</div>
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

// Modify DetailItem to include a copy button for relevant types
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

const VerusIdDetails = () => {
  const {
    selectedIdName,
    identityDetails,
    loadingDetails,
    transparentBalance,
    loadingBalance,
    selectedRAddress,
    identitiesForSelectedRAddress,
    loadingIdentitiesForRAddress,
    errorIdentitiesForRAddress
  } = useContext(IdentityContext);

  const {
    rAddressesWithUtxos,
    getCopyString
  } = useContext(WorkbenchDataContext);

  const handleCopy = (textToCopy) => {
    if (textToCopy) {
      navigator.clipboard.writeText(getCopyString(textToCopy));
    }
  };

  const renderConditionalContent = () => {
    if (loadingDetails) {
      return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2, color: '#bbb' }}>Loading identity details...</Typography>
        </Box>
      );
    }

    if (identityDetails && identityDetails.isErrorObject) {
      return <Typography sx={{color: 'error.main', p:2}}>Error loading identity: {identityDetails.error}</Typography>;
    }

    if (selectedRAddress) {
      const rAddressData = rAddressesWithUtxos.find(item => item.address === selectedRAddress);
      const utxos = rAddressData?.utxos || [];
      const total = rAddressData?.total || 0;
      return (
        <Paper sx={{ p: 2, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#232323', border: '1px solid #333', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, wordBreak: 'break-all', flexGrow: 1 }}>
              {selectedRAddress} (R-Address)
            </Typography>
            <Tooltip title="Copy R-Address">
              <IconButton onClick={() => handleCopy(selectedRAddress)} size="small" sx={{ p: 0.5 }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ mb: 1, bgcolor: '#444', flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600, mb: 0.5 }}>Balance:</Typography>
            <Typography sx={{ fontSize: '13px', color: '#ddd', fontFamily: 'monospace', mb: 1.5 }}>{total.toFixed(8)} VRSCTEST</Typography>
            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600, mb: 0.5 }}>UTXOs ({utxos.length}):</Typography>
            <Box sx={{ maxHeight: '180px', overflowY: 'auto', pr: 0.5, mb: 2 }}>
              {utxos.length === 0 ? (
                <Typography sx={{ color: '#bbb', fontStyle: 'italic', fontSize: '12px' }}>No UTXOs found for this address.</Typography>
              ) : (
                <List dense disablePadding>
                  {utxos.map((utxo, idx) => (
                    <ListItem key={utxo.txid + ':' + utxo.vout} divider sx={{ alignItems: 'flex-start', py: 0.5, borderBottomColor: '#444' }}>
                      <ListItemText
                        primary={<>
                          <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>Amount:</Typography> <span style={{ fontSize: '0.85rem', color: '#eee' }}>{utxo.amount}</span> <br />
                          <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>Confirmations:</Typography> <span style={{ fontSize: '0.85rem', color: '#eee' }}>{utxo.confirmations}</span> <br />
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
                            <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem', mr: 0.5 }}>TXID:</Typography>
                            <Typography component="span" sx={{ wordBreak: 'break-all', fontSize: '0.8rem', color: '#ccc', flexGrow: 1, mr: 0.5 }}>{utxo.txid}</Typography>
                            <Tooltip title="Copy TXID">
                              <IconButton onClick={() => handleCopy(utxo.txid)} size="small" sx={{ p: 0.1, flexShrink: 0 }}>
                                <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography component="span" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>Vout:</Typography> <span style={{ fontSize: '0.85rem', color: '#eee' }}>{utxo.vout}</span>
                        </>}
                        secondary={utxo.account ? `Account: ${utxo.account}` : ''}
                        secondaryTypographyProps={{ sx: { color: '#aaa', fontSize: '0.8rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <Divider sx={{ my: 1, bgcolor: '#444' }} />
            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600, mb: 0.5, mt: 1 }}>Associated Identities:</Typography>
            <Box sx={{ maxHeight: 'calc(100% - 280px)', overflowY: 'auto', pr: 0.5 }}>
              {loadingIdentitiesForRAddress ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={16} sx={{ mr: 1 }} /><Typography sx={{ color: '#bbb', fontSize: '12px' }}>Loading identities...</Typography></Box>
              ) : errorIdentitiesForRAddress ? (
                <Typography sx={{ color: '#f44336', fontSize: '12px' }}>Error: {errorIdentitiesForRAddress}</Typography>
              ) : identitiesForSelectedRAddress.length === 0 ? (
                <Typography sx={{ color: '#bbb', fontStyle: 'italic', fontSize: '12px' }}>No identities found associated with this address.</Typography>
              ) : (
                <List dense disablePadding>
                  {identitiesForSelectedRAddress.map((identity, idx) => {
                    let name = identity.name;
                    if (name && !name.startsWith('i-') && !name.endsWith('@')) name += '@';
                    const iAddr = identity.identityaddress;
                    return (
                      <ListItem key={iAddr || idx} divider sx={{ borderBottomColor: '#444', py: 0.5, display: 'block' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                          <Typography sx={{ fontSize: '12px', color: '#eee', fontWeight: 500, flexGrow: 1, mr: 1 }}>{name || 'Unknown Name'}</Typography>
                          <Tooltip title={`Copy Name: ${name}`}>
                            <IconButton onClick={() => handleCopy(name)} size="small" sx={{ p: 0.1, flexShrink: 0 }}>
                              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', wordBreak: 'break-all', flexGrow: 1, mr: 1 }}>{iAddr}</Typography>
                          <Tooltip title={`Copy i-Address: ${iAddr}`}>
                            <IconButton onClick={() => handleCopy(iAddr)} size="small" sx={{ p: 0.1, flexShrink: 0 }}>
                              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>
        </Paper>
      );
    }

    if (selectedIdName && identityDetails && identityDetails.identity) {
      const { status, blockheight, txid, vout } = identityDetails;
      const {
        name, identityaddress, parent, systemid, flags, primaryaddresses,
        minimumsignatures, revocationauthority, recoveryauthority, privateaddress,
        timelock, version, contentmap, contentmultimap, fullyqualifiedname,
      } = identityDetails.identity;
      
      const displayTitle = selectedIdName || 'Details';
      return (
        <Paper sx={{ p: 1.5, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#282828', borderRadius:1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, wordBreak: 'break-all', flexGrow: 1 }}>
              {displayTitle}
            </Typography>
            <Tooltip title={`Copy ID: ${displayTitle}`}>
              <IconButton onClick={() => handleCopy(displayTitle)} size="small" sx={{ p: 0.5 }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ mb: 1, bgcolor: '#444', flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
            <DetailItem label="Status" value={status} isMonospace={false} />
            <DetailItem label="Fully Qualified Name" value={fullyqualifiedname} />
            <DetailItem label="Block Height" value={blockheight} isMonospace={false} />
            <DetailItem label="Creation TXID" value={txid} />
            <DetailItem label="Vout" value={vout} isMonospace={false} />
            <Divider sx={{ my: 1, bgcolor: '#444' }} />
            <Box display="flex" flexDirection={{xs: 'column', md: 'row'}} gap={2} sx={{ mb: 1.5 }}>
              <Box display="flex" flexDirection="column" sx={{ flex: 1 }}>
                <DetailItem label="Identity Address" value={identityaddress} />
                <DetailItem label="Parent" value={parent} />
                <DetailItem label="System ID" value={systemid} />
                <DetailItem label="Revocation Authority" value={revocationauthority} />
                <DetailItem label="Recovery Authority" value={recoveryauthority} />
              </Box>
              <Box display="flex" flexDirection="column" sx={{ flex: 1 }}>
                {privateaddress && <DetailItem label="Private Address" value={privateaddress} />}
                {primaryaddresses && primaryaddresses.length > 0 && (
                  <DetailItem label="Primary Addresses" value={primaryaddresses} />
                )}
                <DetailItem label="Minimum Signatures" value={minimumsignatures} isMonospace={false} />
                <DetailItem label="Timelock" value={timelock} isMonospace={false} />
                <DetailItem label="Flags" value={flags} isMonospace={false} />
                <DetailItem label="Version" value={version} isMonospace={false} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#90caf9', fontWeight: 600, mb: 0.5, mt: 1 }}>Balances:</Typography>
            <Box sx={{ maxHeight: '120px', overflowY: 'auto', pr: 0.5, mb: 1, background: '#232323', p:1, borderRadius:1 }}>
              {loadingBalance ? <CircularProgress size={18} sx={{ ml: 1 }} /> :
                transparentBalance && !transparentBalance.error && Object.keys(transparentBalance).length > 0 ? (
                  Object.entries(transparentBalance).map(([currency, amount]) => (
                    <Typography key={currency} sx={{ fontSize: '12px', color: '#ddd', fontFamily: 'monospace' }}>
                      {currency}: {parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </Typography>
                  ))
                ) : transparentBalance && transparentBalance.error ? (
                  <Typography sx={{ fontSize: '12px', color: '#f44336', fontFamily: 'monospace' }}>{transparentBalance.error}</Typography>
                ) : (
                  <Typography sx={{ fontSize: '12px', color: '#bbb', fontFamily: 'monospace' }}>No balances found or N/A.</Typography>
                )
              }
            </Box>
            {identityDetails.identity.contentmap && Object.keys(identityDetails.identity.contentmap).length > 0 && (
              <Accordion sx={{ background: '#1c1c1c' }} disableGutters elevation={0} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                  <Typography sx={{ fontSize: '13px', color: '#90caf9', fontWeight: 600 }}>Content Map ({Object.keys(identityDetails.identity.contentmap).length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '350px', overflowY: 'auto' }}>
                  {Object.entries(identityDetails.identity.contentmap).map(([vdxfhash, value]) => (
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
                          Value: {value}
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
            )}
            {identityDetails.identity.contentmultimap && Object.keys(identityDetails.identity.contentmultimap).length > 0 && (
              <Accordion sx={{ background: '#1c1c1c' }} disableGutters elevation={0} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                  <Typography sx={{ fontSize: '13px', color: '#90caf9', fontWeight: 600 }}>Content MultiMap ({Object.keys(identityDetails.identity.contentmultimap).length})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1, background: '#181818', maxHeight: '350px', overflowY: 'auto' }}>
                  {Object.entries(identityDetails.identity.contentmultimap).map(([primaryKey, entries]) => (
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
                            {renderContentMultiMapEntry(entry, 0, handleCopy)}
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ color: '#bbb', fontSize: '12px' }}>No entries for this key.</Typography>
                      )}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Paper>
      );
    }

    return (
        <Typography sx={{ fontSize: '13px', color: '#bbb', textAlign: 'center', mt: 2, p:2 }}>Select a VerusID or R-Address from the list to view its details.</Typography>
    );
  };

  return (
    <StyledOuterPaper>
      <Typography variant="h6" sx={{ p: 1, textAlign: 'center', color: 'white', backgroundColor: '#191919',flexShrink: 0 }}>Details</Typography>
      <Box sx={{flexGrow: 1, overflowY: 'auto', p: {xs: 1, sm: 1.5} /* Reduced padding slightly */ }}>
        {renderConditionalContent()}
      </Box>
    </StyledOuterPaper>
  );
};

export default VerusIdDetails; 