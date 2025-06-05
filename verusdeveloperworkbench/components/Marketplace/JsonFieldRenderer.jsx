import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Attempt 8: Re-adding length check (exact length 34) for i-address detection
const JsonFieldRenderer = ({ fieldKey, fieldValue, getCurrencyInfo, labelColor = '#a0cff9', valueColor = '#fff', indent = 0, nodeStatus, currencyIAddress }) => {
  const [keyCurrencyInfo, setKeyCurrencyInfo] = useState(null);
  const [valueCurrencyInfo, setValueCurrencyInfo] = useState(null);

  // Effect for keyCurrencyInfo (resolves fieldKey if it's an i-address)
  useEffect(() => {
    let isMounted = true; 
    const checkKey = async () => {
      if (!currencyIAddress && fieldKey && typeof fieldKey === 'string' && fieldKey.startsWith('i') && fieldKey.length === 34) {
        try {
          const info = await getCurrencyInfo(fieldKey);
          if (isMounted && info && info.name) {
            setKeyCurrencyInfo(info); // Now keyCurrencyInfo.name is the friendly name for fieldKey
          } else if (isMounted) { setKeyCurrencyInfo(null); }
        } catch (error) { if (isMounted) setKeyCurrencyInfo(null); }
      } else if (isMounted) {
        setKeyCurrencyInfo(null); // If currencyIAddress is provided, fieldKey is already the display name
      }
    };
    checkKey();
    return () => { isMounted = false; };
  }, [fieldKey, getCurrencyInfo, currencyIAddress]);

  // Effect for looking up currency name ONLY if the fieldKey is 'systemid' AND its value looks like a currency i-address
  useEffect(() => {
    let isMounted = true;
    const checkValue = async () => {
      // console.log(`[JsonFieldRenderer] Checking value for key '${fieldKey}':`, fieldValue);
      if (fieldKey === 'systemid' && fieldValue && typeof fieldValue === 'string' && fieldValue.startsWith('i') && fieldValue.length === 34) { 
        // console.log(`[JsonFieldRenderer] Attempting VALUE lookup for systemid: ${fieldValue}`);
        try {
          const info = await getCurrencyInfo(fieldValue);
          // console.log(`[JsonFieldRenderer] Value lookup result for systemid ${fieldValue}:`, info);
          if (isMounted && info && info.name) {
            setValueCurrencyInfo(info);
          } else if (isMounted) {
            setValueCurrencyInfo(null);
          }
        } catch (error) {
          // console.error(`[JsonFieldRenderer] Value Lookup Error for systemid ${fieldValue}:`, error);
          if (isMounted) setValueCurrencyInfo(null);
        }
      } else {
        // If not systemid or value doesn't match currency i-address format
        if (isMounted) setValueCurrencyInfo(null); 
      }
    };
    checkValue();
    return () => { isMounted = false; };
  }, [fieldKey, fieldValue, getCurrencyInfo]);

  const displayName = keyCurrencyInfo?.name || fieldKey;
  const iAddressToDisplay = currencyIAddress;

  // Check if this is a currency balance line based on whether currencyIAddress is passed OR if fieldKey is a known currency name
  const isCurrencyLine = currencyIAddress || 
                         (fieldKey.toUpperCase() === (nodeStatus?.chainName?.toUpperCase() || 'VRSCTEST')) || 
                         ["GOLD", "SILVER", "USD", "EUR", "GBP", "AUD", "YEN", "CAD", "SUPERNET"].includes(fieldKey.toUpperCase());

  // ADD THIS LOGGING BLOCK
  if (isCurrencyLine) {
    console.log(`[JFRenderer] CURRENCY LINE: displayName=${displayName}, amount=${fieldValue}, iAddressToDisplay=${iAddressToDisplay}, startsWith_i_check=${iAddressToDisplay ? iAddressToDisplay.startsWith('i') : 'N/A'}`);
  }

  return (
    <Box sx={{ pl: indent, display: 'flex', flexDirection: 'column', mb: 0.5, alignItems: 'flex-start' }}>
      {isCurrencyLine ? (
        <Box sx={{ display: 'flex', alignItems: 'baseline', width: '100%', flexWrap: 'nowrap', mb: 0.2 }}>
          {/* Column 1: Currency Name */}
          <Typography component="span" sx={{
            fontWeight: 500, 
            fontSize: '0.72rem',
            color: '#4caf50',
            whiteSpace: 'nowrap',
            minWidth: '75px',
            flexShrink: 0,
            pr: 0.5
          }}>
            {displayName}:
          </Typography>

          {/* Column 2: Amount */}
          <Typography component="span" sx={{
            fontSize: '0.72rem',
            color: valueColor, 
            fontWeight: 'bold', 
            whiteSpace: 'nowrap', 
            minWidth: '100px',
            flexShrink: 0,    
            textAlign: 'left',
            textOverflow: 'ellipsis', 
            overflow: 'hidden' 
          }}>
            {String(fieldValue)}
          </Typography>

          {/* Column 3: iAddress and Copy Icon */}
          {iAddressToDisplay && iAddressToDisplay.startsWith('i') && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'nowrap', 
              flexShrink: 0, 
              ml: 0.5,
              overflow: 'hidden'
            }}>
              <Typography component="span" sx={{ 
                fontSize: '0.65rem',
                color: '#aaa', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                mr: 0.15
              }}>
                {iAddressToDisplay.substring(0,7)}...{iAddressToDisplay.substring(iAddressToDisplay.length - 4)}
              </Typography>
              <IconButton 
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(iAddressToDisplay); }} 
                size="small" 
                sx={{ p: 0.1, color: '#777', '&:hover': {color:'#90caf9'}}} 
                aria-label={`Copy i-address ${iAddressToDisplay}`}
              >
                <ContentCopyIcon sx={{ fontSize: '0.8rem' }} />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        // Default rendering for non-currency lines (e.g., systemid or other details)
        <>
          <Box sx={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
            <Typography component="span" sx={{ color: labelColor, minWidth: indent > 0 ? 70 : 80, fontWeight: 500, fontSize: '0.72rem', mr:1, whiteSpace: 'nowrap' }}>
              {fieldKey}:
            </Typography>
            {typeof fieldValue === 'object' && fieldValue !== null && Object.keys(fieldValue).length > 0 ? (
              <Box sx={{ flex: 1, ml: indent > 0 ? 1 : 0 }}>
                {Object.entries(fieldValue).map(([nestedKey, nestedValue]) => (
                  <JsonFieldRenderer
                    key={`${fieldKey}-${nestedKey}`}
                    fieldKey={nestedKey}
                    fieldValue={nestedValue}
                    getCurrencyInfo={getCurrencyInfo}
                    labelColor={labelColor}
                    valueColor={valueColor}
                    indent={1} // Nested items always get some indent
                    nodeStatus={nodeStatus}
                    currencyIAddress={null}
                  />
                ))}
              </Box>
            ) : (
              <Typography component="span" sx={{ color: valueColor, fontSize: '0.72rem', wordBreak: 'break-all' }}>
                {String(fieldValue)}
              </Typography>
            )}
          </Box>
          {fieldKey === 'systemid' && valueCurrencyInfo && (
            <Typography sx={{ fontSize: '0.70rem', color: '#4caf50', pl: indent > 0 ? `calc(${((indent +1) * 8) + 80}px + 1ch)` : `calc(80px + 1ch)`, mt: '1px' }}>
              {valueCurrencyInfo.name}
            </Typography>
          )}
          {/* Other value-based i-address resolution if needed (less common now) */}
        </>
      )}
    </Box>
  );
};

export default JsonFieldRenderer; 