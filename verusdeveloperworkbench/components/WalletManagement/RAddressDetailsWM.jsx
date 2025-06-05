import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Tooltip, IconButton, Grid } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

// DetailItem component (copied from VerusIdDetailsWM for now - move to utils later)
const DetailItem = ({ label, value, isAddress = false, onCopy, isMonospace = true, breakAll = true, fullValue, compact = false, children }) => {
  if (value === undefined && !children) return null; 
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null);
  const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null));

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.2 : 0.5, py: compact ? 0.1 : 0.25}}>
      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: compact ? 100 : 130, flexShrink:0, fontSize: compact ? '0.7rem' : '0.75rem', mr:1 }}>{label}:</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="div" variant="body2" sx={{ 
            color: '#ddd', 
            wordBreak: breakAll ? 'break-all' : 'normal', 
            whiteSpace: Array.isArray(value) ? 'normal' : (isMonospace ? 'pre-wrap' : 'normal'),
            fontFamily: isMonospace ? 'monospace' : 'inherit',
            fontSize: compact ? '0.7rem' : '0.75rem',
            lineHeight: compact ? 1.3 : 1.4,
            pr: (isAddress && valueToCopy) ? 0.5 : 0 
          }}>
          {children ? children : displayValue}
        </Typography>
        {isAddress && valueToCopy && (
          <Tooltip title={`Copy ${label}`}>
            <IconButton onClick={() => onCopy(valueToCopy)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}, flexShrink: 0}}>
              <ContentCopyIcon sx={{fontSize: compact ? '0.8rem' : '0.9rem'}}/>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const RAddressDetailsWM = () => {
  const { selectedRAddressWM, identities } = useContext(IdentityContext) || {};
  const { rAddressesWithUtxos } = useContext(WorkbenchDataContext) || {};

  const [displayedRAddress, setDisplayedRAddress] = useState(null);
  const [displayedBalance, setDisplayedBalance] = useState('N/A');
  const [displayedAssociatedIDs, setDisplayedAssociatedIDs] = useState([]);

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(String(text));
  };

  useEffect(() => {
    if (selectedRAddressWM) {
      setDisplayedRAddress(selectedRAddressWM);
      const rAddrData = rAddressesWithUtxos?.find(r => r.address === selectedRAddressWM);
      setDisplayedBalance(rAddrData ? parseFloat(rAddrData.total).toFixed(8) : 'N/A');
      const associatedIDs = identities?.filter(idObj => 
          idObj.identity && 
          Array.isArray(idObj.identity.primaryaddresses) && 
          idObj.identity.primaryaddresses.includes(selectedRAddressWM)
      ).map(idObj => idObj.identity.name) || [];
      setDisplayedAssociatedIDs(associatedIDs);
    } else {
      // Only clear if selectedRAddressWM is explicitly nullified by its own list/context action
      // This check might need refinement based on exact context behavior for clearing selections.
      // For now, if selectedRAddressWM is null, we clear.
      setDisplayedRAddress(null);
      setDisplayedBalance('N/A');
      setDisplayedAssociatedIDs([]);
    }
  }, [selectedRAddressWM, rAddressesWithUtxos, identities]);

  if (!displayedRAddress) { 
    return (
      <Paper sx={{p:1.5, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display:'flex', flexDirection:'column'}}>
        <Typography variant="subtitle2" sx={{color: '#ccc', mb:1, textAlign:'center'}}>R-Address Details</Typography>
        <Box sx={{flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Typography sx={{color: '#888', fontSize: '0.9rem'}}>No R-Address selected.</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{p:1, height: '100%', background: '#282828', borderRadius: 1, overflow: 'auto', display:'flex', flexDirection:'column'}}>
      <Typography variant="subtitle2" sx={{color: '#ccc', mb:1, textAlign:'center', fontSize: '0.85rem', fontWeight:600}}>R-Address Details</Typography>
      <Box sx={{flexGrow:1, overflowY:'auto', pr:0.5, pl:0.5}}>
        <DetailItem compact label="R-Address" value={displayedRAddress} isAddress onCopy={handleCopy} isMonospace={false} breakAll={true}/>
        <DetailItem compact label="Balance" value={displayedBalance} isMonospace={false} />
        
        <Box sx={{mt:0.5}}>
            <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.7rem', mb:0.1 }}>Primary Address For:</Typography>
            {displayedAssociatedIDs.length > 0 ? (
                <Paper sx={{p:0.5, background:'#232323', maxHeight: 'calc(100% - 100px)', overflowY:'auto', border:'1px solid #383838'}}>
                  <List dense disablePadding >
                  {displayedAssociatedIDs.map((idName, index) => (
                      <ListItem key={index} disableGutters sx={{py:0, display: 'flex', alignItems: 'center'}}>
                          <ListItemText primary={idName.endsWith('@') ? idName : `${idName}@`} primaryTypographyProps={{fontSize: '0.7rem', color:'#ddd', wordBreak:'break-all', lineHeight:1.2}}/>
                          <Tooltip title={`Copy ID: ${idName.endsWith('@') ? idName : `${idName}@`}`}>
                              <IconButton onClick={() => handleCopy(idName.endsWith('@') ? idName : `${idName}@`)} size="small" sx={{p:0.1, color: '#777', '&:hover': {color:'#90caf9'}}}><ContentCopyIcon sx={{fontSize: '0.8rem'}}/></IconButton>
                          </Tooltip>
                      </ListItem>
                  ))}
                  </List>
                </Paper>
            ) : (
                <Typography sx={{pl:1, fontSize:'0.7rem', color:'#888'}}>Not a primary address for any loaded VerusIDs.</Typography>
            )}
        </Box>
      </Box>
    </Paper>
  );
};

export default RAddressDetailsWM; 