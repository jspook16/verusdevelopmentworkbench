import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, CircularProgress, IconButton, Tooltip, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { IdentityContext } from '../../contexts/IdentityContext';
import { NodeContext } from '../../contexts/NodeContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  paddingTop: theme.spacing(0.3),
  paddingBottom: theme.spacing(0.3),
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  minHeight: '24px',
  borderRadius: '4px',
  marginBottom: theme.spacing(0.25),
  marginRight: theme.spacing(0.5),
  marginLeft: theme.spacing(0.5),
  '&.Mui-selected': {
    backgroundColor: 'rgba(144, 202, 249, 0.22)',
    '&:hover': {
      backgroundColor: 'rgba(144, 202, 249, 0.28)',
    },
  },
  borderBottom: '1px solid transparent',
}));

// Helper function to determine currency type from options bitmask
const getCurrencyType = (options) => {
  if (typeof options !== 'number') return 'Currency';

  const isPBaaS = (options & 256) === 256;
  const isGateway = (options & 128) === 128;
  const isToken = (options & 32) === 32;
  const isFractional = (options & 1) === 1;
  const isNFT = (options & 2048) === 2048;
  const isGatewayConverter = (options & 512) === 512;

  if (isPBaaS) {
    if (isFractional) return 'Fractional PBaaS Chain';
    return 'PBaaS Chain';
  }
  if (isGateway) {
    if (isGatewayConverter) {
      if (isFractional) return 'Fractional Gateway Converter';
      return 'Gateway Converter';
    }
    return 'Gateway Currency';
  }
  if (isToken) {
    if (isFractional) return 'Fractional Currency';
    if (isNFT) return 'NFT Token';
    return 'Token Currency';
  }
  if (options === 0) return 'Simple Token (implied)';
  return 'Currency (unknown type)';
};

const MyCurrenciesListCM = () => {
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  const { 
    setSelectedCurrencyIdentity, 
    selectedCurrencyIdentity,
  } = useContext(IdentityContext);
  const { hiddenVerusIds, toggleVerusIdVisibility, getCopyString } = useContext(WorkbenchDataContext);

  const [currencyIdentitiesWithOptions, setCurrencyIdentitiesWithOptions] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [errorCurrencies, setErrorCurrencies] = useState(null);

  const fetchCurrencyIdentitiesWithOptions = async () => {
    if (!nodeStatus.connected || typeof sendCommand !== 'function') {
      setCurrencyIdentitiesWithOptions([]);
      setErrorCurrencies('Node not connected.');
      return;
    }
    setLoadingCurrencies(true);
    setErrorCurrencies(null);
    setCurrencyIdentitiesWithOptions([]);

    try {
      const listIdentitiesResult = await sendCommand('listidentities', [true, true, false], 'list_all_identities_for_currency_check');
      
      if (listIdentitiesResult && Array.isArray(listIdentitiesResult)) {
        const potentialCurrencies = listIdentitiesResult.filter(item => item.identity && (item.identity.flags & 1) === 1);
        
        if (potentialCurrencies.length === 0) {
          setErrorCurrencies('No identities found that are defined as currencies.');
          setLoadingCurrencies(false);
          return;
        }

        const currenciesWithOptions = [];
        for (const item of potentialCurrencies) {
          try {
            const nameForRpc = item.identity.name.endsWith('@') 
                             ? item.identity.name.slice(0, -1) 
                             : item.identity.name;
            const currencyDetails = await sendCommand('getcurrency', [nameForRpc], `getcurrency_${nameForRpc}`);
            if (currencyDetails && typeof currencyDetails.options === 'number') {
              currenciesWithOptions.push({ ...item, currencyOptions: currencyDetails.options });
            } else {
              currenciesWithOptions.push({ ...item, currencyOptions: undefined }); 
              console.warn(`Could not get valid options for currency: ${nameForRpc}`, currencyDetails);
            }
          } catch (err) {
            console.error(`Error fetching details for currency ${item.identity.name}:`, err);
            currenciesWithOptions.push({ ...item, currencyOptions: undefined, errorFetchingOptions: true });
          }
        }
        setCurrencyIdentitiesWithOptions(currenciesWithOptions);
        if(currenciesWithOptions.length === 0 && potentialCurrencies.length > 0){
            setErrorCurrencies('Found currency-flagged IDs, but failed to retrieve their currency details.');
        }

      } else if (listIdentitiesResult && listIdentitiesResult.error) {
        console.error('Error fetching initial list of identities:', listIdentitiesResult.error);
        setErrorCurrencies(listIdentitiesResult.error.message || 'Failed to fetch identities list.');
      } else {
        setErrorCurrencies('Unexpected result when fetching initial identities list.');
      }
    } catch (err) {
      console.error('Exception fetching currency identities and their options:', err);
      setErrorCurrencies(err.message || 'An error occurred while fetching currencies.');
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const handleSelectCurrency = (item) => {
    if (item && item.identity && item.identity.name) {
      const nameWithAt = item.identity.name.endsWith('@') ? item.identity.name : `${item.identity.name}@`;
      setSelectedCurrencyIdentity(nameWithAt);
    }
  };

  const handleCopy = (textToCopy) => {
    const stringToCopy = getCopyString ? getCopyString(textToCopy) : String(textToCopy);
    navigator.clipboard.writeText(stringToCopy);
  };

  const renderNameWithVisibility = (name, isHidden) => {
    if (name === undefined || name === null) return '';
    const text = String(name);
    return isHidden ? '*'.repeat(text.length > 0 ? text.length : 3) : text;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p:0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
          My Currencies
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={fetchCurrencyIdentitiesWithOptions}
          disabled={loadingCurrencies || !nodeStatus.connected}
          startIcon={loadingCurrencies ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ fontSize: '0.7rem', py:0.25, px:0.75, minWidth: 'auto' }}
        >
          {!loadingCurrencies && "Update"}
        </Button>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
        {loadingCurrencies && currencyIdentitiesWithOptions.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {!loadingCurrencies && errorCurrencies && (
          <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#ff6b6b' }}>{errorCurrencies}</Typography>
        )}
        {!loadingCurrencies && !errorCurrencies && currencyIdentitiesWithOptions.length === 0 && nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>No currency identities found. Click Update.</Typography>
        )}
        {!nodeStatus.connected && (
            <Typography sx={{ p: 1, textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>Connect to daemon to see currencies.</Typography>
        )}
        {!loadingCurrencies && !errorCurrencies && currencyIdentitiesWithOptions.length > 0 && (
          <List dense disablePadding sx={{pt: 0.5}}>
            {currencyIdentitiesWithOptions.map((item) => {
              if (!item || !item.identity || !item.identity.name) return null;
              const name = item.identity.name;
              const idNameWithAt = name.endsWith('@') ? name : `${name}@`;
              const isSelected = selectedCurrencyIdentity === idNameWithAt;
              const isHidden = hiddenVerusIds[idNameWithAt];
              
              let currencyTypeString = getCurrencyType(item.currencyOptions);
              if (item.errorFetchingOptions) {
                currencyTypeString = 'Error loading type';
              }

              return (
                <StyledListItemButton
                  key={idNameWithAt}
                  selected={isSelected}
                  onClick={() => handleSelectCurrency(item)}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Tooltip title={isHidden ? "Show Currency ID" : "Hide Currency ID"}>
                      <IconButton
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          toggleVerusIdVisibility(idNameWithAt);
                        }}
                        sx={{ p: 0.25, mr: 0.5, flexShrink: 0 }}
                      >
                        {isHidden ? <VisibilityOffIcon sx={{ fontSize: '0.9rem' }} /> : <VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                      </IconButton>
                    </Tooltip>
                    <ListItemText
                      primary={renderNameWithVisibility(idNameWithAt, isHidden)}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: isSelected ? '#66bb6a' : '#4caf50',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }
                      }}
                      sx={{ flexGrow: 1, mr: 0.5, overflow: 'hidden', mb: 0 }}
                    />
                    <Tooltip title={`Copy Currency ID: ${idNameWithAt}`}>
                      <IconButton
                        size="small"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleCopy(idNameWithAt);
                        }}
                        sx={{ p: 0.25, ml: 'auto', flexShrink: 0 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: '#aaa', pl: '36px' }}>
                    {renderNameWithVisibility(currencyTypeString, isHidden)}
                  </Typography>
                </StyledListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default MyCurrenciesListCM; 