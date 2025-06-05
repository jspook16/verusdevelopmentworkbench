import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';

const DetailItemWithCopy = ({ fieldKey, fieldValue, indentLevel = 0, path = '' }) => {
  const handleCopy = (valueToCopy) => {
    navigator.clipboard.writeText(String(valueToCopy));
  };

  const currentPath = path ? `${path}.${fieldKey}` : fieldKey;

  if (fieldValue === null || fieldValue === undefined) {
    return (
      <ListItem sx={{ pl: indentLevel * 2, display: 'flex', alignItems: 'flex-start', py: 0.5 }} disableGutters>
        <ListItemText
          primaryTypographyProps={{ fontSize: '0.75rem', color: '#a0cff9', fontWeight: '500', mr: 0.5, minWidth: '120px', flexShrink: 0 }}
          primary={`${fieldKey}:`}
          secondaryTypographyProps={{ fontSize: '0.75rem', color: '#888' }}
          secondary='null'
        />
      </ListItem>
    );
  }

  if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
    return (
      <Box sx={{ width: '100%' }}>
        <ListItem sx={{ pl: indentLevel * 2, py: 0.5 }} disableGutters>
          <ListItemText 
            primaryTypographyProps={{ fontSize: '0.8rem', color: '#e0e0e0', fontWeight: 'bold'}}
            primary={`${fieldKey}:`}
           />
        </ListItem>
        {Object.entries(fieldValue).map(([key, value]) => (
          <DetailItemWithCopy key={key} fieldKey={key} fieldValue={value} indentLevel={indentLevel + 1} path={currentPath} />
        ))}
      </Box>
    );
  }

  if (Array.isArray(fieldValue)) {
    return (
      <Box sx={{ width: '100%' }}>
        <ListItem sx={{ pl: indentLevel * 2, py: 0.5 }} disableGutters>
          <ListItemText 
            primaryTypographyProps={{ fontSize: '0.8rem', color: '#e0e0e0', fontWeight: 'bold' }}
            primary={`${fieldKey}: [${fieldValue.length > 0 ? '' : ' (empty)'}]`}
          />
        </ListItem>
        {fieldValue.map((item, index) => (
          <DetailItemWithCopy key={index} fieldKey={`[${index}]`} fieldValue={item} indentLevel={indentLevel + 1} path={currentPath} />
        ))}
      </Box>
    );
  }

  // Primitive value (string, number, boolean)
  return (
    <ListItem sx={{ pl: indentLevel * 2, display: 'flex', alignItems: 'center', py: 0.25 }} disableGutters>
      <Typography sx={{ fontSize: '0.75rem', color: '#a0cff9', fontWeight: '500', mr: 0.5, minWidth: '120px', flexShrink: 0 }}>
        {`${fieldKey}:`}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#ddd', wordBreak: 'break-all', flexGrow: 1 }}>
        {String(fieldValue)}
      </Typography>
      <Tooltip title={`Copy: ${String(fieldValue).substring(0, 50)}${String(fieldValue).length > 50 ? '...' : ''}`}>
        <IconButton onClick={() => handleCopy(fieldValue)} size="small" sx={{ p: 0.25, color: '#777', '&:hover': {color:'#90caf9'} }}>
          <ContentCopyIcon sx={{ fontSize: '0.8rem' }} />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};

const CurrencyDetailsCM = () => {
  const { selectedCurrencyIdentity } = useContext(IdentityContext);
  const { nodeStatus, sendCommand } = useContext(NodeContext);

  const [currencyDetails, setCurrencyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    if (!selectedCurrencyIdentity || !nodeStatus.connected) {
      setCurrencyDetails(null);
      setErrorDetails(null);
      return;
    }

    const fetchCurrencyDetails = async () => {
      setLoadingDetails(true);
      setErrorDetails(null);
      setCurrencyDetails(null);
      try {
        let currencyParam = selectedCurrencyIdentity;
        if (selectedCurrencyIdentity && selectedCurrencyIdentity.endsWith('@') && !selectedCurrencyIdentity.startsWith('i-')) {
          currencyParam = selectedCurrencyIdentity.slice(0, -1);
        }
        
        const result = await sendCommand('getcurrency', [currencyParam], `getcurrency_${currencyParam}`);
        if (result && !result.error) {
          setCurrencyDetails(result);
        } else if (result && result.error) {
          console.error('Error fetching currency details:', result.error);
          setErrorDetails(result.error.message || 'Failed to fetch currency details.');
        } else {
          setErrorDetails('Unexpected empty result when fetching currency details.');
        }
      } catch (err) {
        console.error('Exception fetching currency details:', err);
        setErrorDetails(err.message || 'An error occurred while fetching details.');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchCurrencyDetails();
  }, [selectedCurrencyIdentity, nodeStatus.connected, sendCommand]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p:0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
          Currency Details
        </Typography>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5 }}>
        {!selectedCurrencyIdentity && (
          <Typography sx={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', mt: 2 }}>
            Select a currency from "My Currencies" to view its details.
          </Typography>
        )}
        {loadingDetails && selectedCurrencyIdentity && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {errorDetails && selectedCurrencyIdentity && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#ff6b6b' }}>{errorDetails}</Typography>
        )}
        {currencyDetails && !loadingDetails && !errorDetails && selectedCurrencyIdentity && (
          <Paper sx={{p:1, background:'#2c2c2c', borderRadius:'4px'}}>
            <List dense disablePadding>
              {Object.entries(currencyDetails).map(([key, value]) => (
                <React.Fragment key={key}>
                  <DetailItemWithCopy fieldKey={key} fieldValue={value} />
                  <Divider sx={{borderColor: '#383838'}}/>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CurrencyDetailsCM;
 