import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Tooltip, IconButton, Grid, Chip, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IdentityContext } from '../../contexts/IdentityContext';
import { IDENTITY_FLAGS } from '../../utils/identityUtils'; // Assuming you have this for status flags

const DetailItem = ({ label, value, isAddress = false, onCopy, isMonospace = true, breakAll = true, fullValue, compact = false, children }) => {
  if (value === undefined && !children) return null; // Allow children to render even if value is undefined
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null);
  const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null));

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.25 : 0.5, py: compact ? 0.1 : 0.25, minHeight: compact ? '18px' : '24px' }}>
      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: compact ? 90 : 120, flexShrink: 0, fontSize: compact ? '0.7rem' : '0.75rem', mr: 1, lineHeight: compact ? 1.2 : 1.4 }}>{label}:</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="div" variant="body2" sx={{ 
            color: '#ddd', 
            wordBreak: breakAll ? 'break-all' : 'normal', 
            whiteSpace: Array.isArray(value) ? 'normal' : (isMonospace ? 'pre-wrap' : 'normal'),
            fontFamily: isMonospace ? 'monospace' : 'inherit',
            fontSize: compact ? '0.7rem' : '0.75rem',
            lineHeight: compact ? 1.2 : 1.4,
            pr: (isAddress && valueToCopy) ? 0.5 : 0
          }}>
          {children ? children : displayValue}
        </Typography>
        {isAddress && valueToCopy && (
          <Tooltip title={`Copy ${label}: ${valueToCopy}`}>
            <IconButton onClick={() => onCopy(valueToCopy)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }}>
              <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const renderContentMultiMapEntry = (entry, indent = 0, handleCopy) => {
  if (typeof entry !== 'object' || entry === null) {
    return <Typography component="span" sx={{ fontSize: '0.7rem', color: '#ddd'}}>{String(entry)}</Typography>;
  }
  if (Object.keys(entry).length === 1 && typeof Object.values(entry)[0] === 'object' && Object.values(entry)[0] !== null) {
    const nestedKey = Object.keys(entry)[0];
    const data = Object.values(entry)[0];
    return (
      <Box sx={{ my: 0.5, background: '#181818', borderRadius: 1, p:0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
          <Typography sx={{ color: '#a0cff9', fontWeight: '500', fontSize: '0.7rem', fontFamily: 'monospace', lineHeight: 1.2, flexGrow: 1, mr: 0.5 }}>
            Nested VDXF Key: {nestedKey}
          </Typography>
          <Tooltip title={`Copy Nested Key: ${nestedKey}`}>
            <IconButton onClick={() => handleCopy(nestedKey)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}>
              <ContentCopyIcon sx={{fontSize: '0.8rem'}}/>
            </IconButton>
          </Tooltip>
        </Box>
        <List dense disablePadding sx={{ pl: indent + 1 }}>
          {Object.entries(data).map(([fieldKey, fieldValue]) => {
            let displayValue = fieldValue;
            if (typeof fieldValue === 'object' && fieldValue !== null) {
                displayValue = JSON.stringify(fieldValue, null, 2); 
            }
            return (
              <ListItem key={fieldKey} disableGutters sx={{ display: 'flex', alignItems:'baseline', fontSize: '0.7rem', lineHeight: 1.2, color: '#ccc' }}>
                <Typography component="span" sx={{ minWidth: 70, fontWeight: '500', color: '#bbb', fontSize: '0.7rem', mr: 0.5}}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}:</Typography>
                <Typography component="span" sx={{wordBreak:'break-all', whiteSpace: 'pre-wrap', fontSize: '0.7rem'}}>{String(displayValue)}</Typography>
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  }
  return (
    <List dense disablePadding sx={{ pl: indent + 1 }}>
      {Object.entries(entry).map(([key, value]) => {
        const labelTypography = <Typography component="span" sx={{ fontSize: '0.7rem', color: '#a0cff9', fontWeight: '500' }}>{key}: </Typography>;
        if (typeof value === 'object' && value !== null) {
          return (
            <ListItem key={key} disableGutters sx={{ display: 'block' }}>
              {labelTypography}
              {renderContentMultiMapEntry(value, indent + 1, handleCopy)} 
            </ListItem>
          );
        }
        return (
          <ListItem key={key} disableGutters sx={{ display: 'block' }}>
            {labelTypography}
            <Typography component="span" sx={{ fontSize: '0.7rem', color: '#ddd', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {String(value)}
            </Typography>
          </ListItem>
        );
      })}
    </List>
  );
};

const formatTimelock = (timelock) => {
  if (timelock === 0 || timelock === undefined) return 'None';
  if (timelock > 0 && timelock < 1000000000) return `Block Height: ${timelock}`;
  if (timelock >= 1000000000) return `Timestamp: ${new Date(timelock * 1000).toLocaleString()}`;
  return String(timelock);
};

const getStatusChip = (statusString, flags) => {
  let label = "Active";
  let color = "primary";

  // Prioritize explicit status string from getidentity
  if (statusString) {
    const lowerStatus = statusString.toLowerCase();
    if (lowerStatus === 'revoked') return <Chip label="Revoked" color="error" size="small" sx={{height: 'auto', '& .MuiChip-label': { py: '1px', px: '6px', fontSize:'0.65rem'}}}/>;
    if (lowerStatus === 'locked') return <Chip label="Timelocked" color="secondary" size="small" sx={{height: 'auto', '& .MuiChip-label': { py: '1px', px: '6px', fontSize:'0.65rem'}}}/>;
    if (lowerStatus === 'active') { label = "Active"; color = "primary"; }
    else { label = statusString.charAt(0).toUpperCase() + statusString.slice(1); color = "default";} // Use status string if not a known one but not overridden by flags yet
  }
  
  // Flags can override or add to this
  if (flags & IDENTITY_FLAGS.VDXF_KEY_IS_CURRENCY) { label = "Currency"; color = "success"; } // Currency takes precedence for display
  else if (flags & IDENTITY_FLAGS.VDXF_KEY_REVOKED && color !== 'error') { label = "Revoked"; color = "error"; } // If not already set by statusString
  else if (flags & IDENTITY_FLAGS.VDXF_KEY_LOCKED && color !== 'secondary') { label = "Timelocked"; color = "secondary"; } // If not already set by statusString
  
  return <Chip label={label} color={color} size="small" sx={{height: 'auto', '& .MuiChip-label': { py: '1px', px: '6px', fontSize:'0.65rem'}}}/>; 
};

const VerusIdDetailsWM = () => {
  const { selectedVerusIdWM, identityBalances, loadingAllBalances } = useContext(IdentityContext) || {};
  const [displayedIdentityData, setDisplayedIdentityData] = useState(null); // Stores the full object {identity, status, blockheight etc.}
  const [contentMapExpanded, setContentMapExpanded] = useState(true);
  const [contentMultiMapExpanded, setContentMultiMapExpanded] = useState(true);

  useEffect(() => {
    if (selectedVerusIdWM && selectedVerusIdWM.identity) {
      // When a new valid ID is selected, update our local persistent state
      setDisplayedIdentityData(selectedVerusIdWM);
    } else {
      // If selectedVerusIdWM is null or doesn't have .identity, clear our local display.
      // This ensures that if the VerusID selection is cleared in context, this panel also clears.
      setDisplayedIdentityData(null); 
    }
  }, [selectedVerusIdWM]);

  const handleCopy = useCallback((text) => {
    if (text) navigator.clipboard.writeText(String(text));
  }, []);

  if (!displayedIdentityData || !displayedIdentityData.identity) { 
    return (
      <Paper sx={{p:1.5, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display:'flex', flexDirection:'column'}}>
        <Typography variant="subtitle2" sx={{color: '#ccc', mb:1, textAlign:'center'}}>VerusID Details</Typography>
        <Box sx={{flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Typography sx={{color: '#888', fontSize: '0.9rem'}}>No VerusID selected.</Typography>
        </Box>
      </Paper>
    );
  }

  const { identity, status, blockheight, txid, vout } = displayedIdentityData; // Destructure from local state
  const { name, identityaddress, parent, systemid, flags, primaryaddresses, minimumsignatures, revocationauthority, recoveryauthority, timelock, contentmap, contentmultimap, version } = identity;
  const fullyqualifiedname = identity.fullyqualifiedname || name; // Fallback for name

  const currentIdentityBalances = identityBalances && identityaddress ? identityBalances[identityaddress] : null;

  return (
    <Paper sx={{p:1, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display:'flex', flexDirection:'column'}}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, px:0.5 }}>
        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all', fontSize: '0.85rem' }}>
          {fullyqualifiedname || 'VerusID Details'}
        </Typography>
        {name && <Tooltip title={`Copy ID Name: ${name}`}><IconButton onClick={() => handleCopy(name)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}><ContentCopyIcon sx={{fontSize: '1rem'}}/></IconButton></Tooltip>}
      </Box>
      <Divider sx={{ mb: 0.5, bgcolor: '#444'}} />
      
      <Box sx={{flexGrow:1, overflowY:'auto', pr:0.5, pl:0.5, fontSize: '0.7rem' /* Apply compact font size globally here */}}>
        {/* Section 1: Status, Block, TXID, Vout (Full Width) */}
        <Box sx={{mb:0.5}}>
            <DetailItem compact label="Status">{getStatusChip(status, flags)}</DetailItem>
            <DetailItem compact label="Block Height" value={blockheight !== undefined ? String(blockheight) : 'N/A'} isMonospace={false} />
            <DetailItem compact label="Creation TXID" value={txid} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true}/>
            <DetailItem compact label="Vout" value={vout !== undefined ? String(vout) : 'N/A'} isMonospace={false} />
        </Box>

        <Divider sx={{my:0.5, borderColor:'#383838'}}/>
        
        {/* Section 2: Two Columns for main details */}
        <Grid container spacing={1}> 
            <Grid item xs={12} sm={6}>
                <DetailItem compact label="i-Address" value={identityaddress} isAddress onCopy={handleCopy} isMonospace={false}/>
                <DetailItem compact label="Parent" value={parent} isAddress onCopy={handleCopy} isMonospace={false}/>
                <DetailItem compact label="System ID" value={systemid} isAddress onCopy={handleCopy} isMonospace={false}/>
                <DetailItem compact label="Revocation Auth" value={revocationauthority} isAddress onCopy={handleCopy} isMonospace={false}/>
                <DetailItem compact label="Recovery Auth" value={recoveryauthority} isAddress onCopy={handleCopy} isMonospace={false}/>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box mb={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.7rem', mb:0.1 }}>Primary Addresses:</Typography>
                  {primaryaddresses && primaryaddresses.length > 0 ? (
                      <Paper elevation={0} sx={{p:0.5, background:'#232323', maxHeight: '50px', overflowY:'auto', border:'1px solid #383838'}}>
                          <List dense disablePadding >
                          {primaryaddresses.map((addr, index) => (
                              <ListItem key={index} disableGutters sx={{py:0, display: 'flex', alignItems: 'center'}}>
                                  <ListItemText primary={addr} primaryTypographyProps={{fontSize: '0.7rem', color:'#ddd', wordBreak:'break-all', lineHeight:1.2}}/>
                                  <Tooltip title="Copy Address"><IconButton onClick={() => handleCopy(addr)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}><ContentCopyIcon sx={{fontSize: '0.8rem'}}/></IconButton></Tooltip>
                              </ListItem>
                          ))}
                          </List>
                      </Paper>
                  ) : (
                      <Typography sx={{pl:0, fontSize:'0.7rem', color:'#888'}}>None</Typography>
                  )}
                </Box>
                <DetailItem compact label="Min. Signatures" value={String(minimumsignatures)} isMonospace={false}/>
                <DetailItem compact label="Timelock" value={formatTimelock(timelock)} isMonospace={false}/>
                <DetailItem compact label="Flags" value={String(flags)} isMonospace={false}/>
                <DetailItem label="Version" value={String(version)} isMonospace={false} compact/>
            </Grid>
        </Grid> 

        {/* Section 3: Balances (Full Width) */}
        <Box sx={{mt:1, mb:1}}>
          <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.7rem', mb:0.1 }}>Balances:</Typography>
          <Paper sx={{p:1, background:'#232323', border:'1px solid #383838', maxHeight: '70px', overflowY:'auto'}}>
            {loadingAllBalances && !currentIdentityBalances ? (
                <CircularProgress size={14} sx={{ml:1}}/>
            ) : currentIdentityBalances && typeof currentIdentityBalances === 'object' && Object.keys(currentIdentityBalances).length > 0 ? (
                Object.entries(currentIdentityBalances).map(([currency, amount]) => (
                    <Typography key={currency} sx={{ fontSize: '0.7rem', color: '#ddd', fontFamily: 'monospace', lineHeight: 1.2 }}>
                    {currency}: {parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </Typography>
                ))
            ) : (
                <Typography sx={{fontSize:'0.7rem', color:'#888'}}>{currentIdentityBalances === 'Error' ? 'Error fetching balances' : 'No balances found or N/A.'}</Typography> 
            )}
          </Paper>
        </Box>

        {/* Section 4 & 5: ContentMap & MultiMap Accordions (Full Width) */}
        {contentmap && Object.keys(contentmap).length > 0 && (
            <Box sx={{mt:0.5, mb:0.5}}>
                <Accordion expanded={contentMapExpanded} onChange={() => setContentMapExpanded(!contentMapExpanded)} sx={{background: '#232323', color:'white', boxShadow:'none', '&.Mui-expanded': {margin:0}, '&::before': {display: 'none'} }} disableGutters elevation={0} square>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}} />} sx={{minHeight:30, height:30, '&.Mui-expanded': {minHeight:30, height:30}, background:'#333', borderRadius: '4px'}}>
                        <Typography sx={{fontSize: '0.8rem', fontWeight:'500', color:'#a0cff9'}}>Content Map ({Object.keys(contentmap).length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1, background: '#282828', maxHeight: '150px', overflowY: 'auto', border:'1px solid #333', borderTop:0, borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}>
                        {Object.entries(contentmap).map(([vdxfhash, value]) => (
                            <Box key={vdxfhash} sx={{ mb: 0.5, borderBottom: '1px solid #303030', pb: 0.25, '&:last-child': {borderBottom:0, pb:0, mb:0} }}>
                                <DetailItem compact label="VDXF Hash" value={vdxfhash} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true}/>
                                <DetailItem compact label="Value" value={String(value)} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true}/>
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Box>
        )}
        {contentmultimap && Object.keys(contentmultimap).length > 0 && (
            <Box sx={{mt:0.5, mb:0.5}}>
                <Accordion expanded={contentMultiMapExpanded} onChange={() => setContentMultiMapExpanded(!contentMultiMapExpanded)} sx={{background: '#232323', color:'white', boxShadow:'none', '&.Mui-expanded': {margin:0}, '&::before': {display: 'none'}}} disableGutters elevation={0} square>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}} />} sx={{minHeight:30, height:30, '&.Mui-expanded': {minHeight:30, height:30}, background:'#333', borderRadius: '4px'}}>
                        <Typography sx={{fontSize: '0.8rem', fontWeight:'500', color:'#a0cff9'}}>Content MultiMap ({Object.keys(contentmultimap).length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1, background: '#282828', maxHeight: '200px', overflowY: 'auto', border:'1px solid #333', borderTop:0, borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}>
                    {Object.entries(contentmultimap).map(([primaryKey, entries]) => (
                        <Box key={primaryKey} sx={{ mb: 1, p: 0.5, background: '#232323', borderRadius: '4px' }}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb:0.25}}>
                                <Typography sx={{ color: '#E0E0E0', fontSize: '0.75rem', fontWeight: '500', fontFamily: 'monospace', flexGrow:1, mr:0.5, wordBreak:'break-all' }}>
                                Primary VDXF Key: {primaryKey}
                                </Typography>
                                <Tooltip title={`Copy Primary Key: ${primaryKey}`}><IconButton onClick={() => handleCopy(primaryKey)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'} }}><ContentCopyIcon sx={{fontSize: '0.8rem'}}/></IconButton></Tooltip>
                            </Box>
                            {Array.isArray(entries) && entries.length > 0 ? (
                                entries.map((entry, idx) => (
                                <Box key={idx} sx={{ mt: 0.25, mb: 0.25, pt: 0.25, pb: 0.25, px: 0.5, background: '#1e1e1e', borderRadius: '4px' }}>
                                    {renderContentMultiMapEntry(entry, 0, handleCopy)}
                                </Box>
                                ))
                            ) : (
                                <Typography sx={{ color: '#888', fontSize: '0.7rem', pl:1 }}>No entries for this key.</Typography>
                            )}
                        </Box>
                    ))}
                    </AccordionDetails>
                </Accordion>
            </Box>
        )}
      </Box>
    </Paper>
  );
};

export default VerusIdDetailsWM; 