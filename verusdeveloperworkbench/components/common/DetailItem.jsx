import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const DetailItem = ({ label, value, isAddress = false, onCopy, isMonospace = true, breakAll = true, fullValue, compact = false, children, hideTooltip = false }) => {
  if (value === undefined && !children) return null;
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const handleLocalCopy = () => {
    const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null));
    if (onCopy && typeof onCopy === 'function') {
      onCopy(valueToCopy); // Use provided onCopy if available
    } else if (valueToCopy) {
      navigator.clipboard.writeText(valueToCopy);
    }
  };
  
  const displayValue = Array.isArray(value) ? value.join(', ') : (value !== undefined && value !== null ? String(value) : null);
  const copyableValueExists = fullValue !== undefined || (value !== undefined && value !== null);

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
            pr: (isAddress && copyableValueExists) ? 0.5 : 0
          }}>
          {children ? children : displayValue}
        </Typography>
        {copyableValueExists && typeof onCopy === 'function' && (
          hideTooltip ? (
            <IconButton onClick={handleLocalCopy} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }} aria-label={`Copy ${label}`}>
              <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
            </IconButton>
          ) : (
            <Tooltip title={`Copy ${label}: ${fullValue !== undefined ? fullValue : displayValue}`}>
              <IconButton onClick={handleLocalCopy} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }} aria-label={`Copy ${label}`}>
                <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
              </IconButton>
            </Tooltip>
          )
        )}
      </Box>
    </Box>
  );
};

export default DetailItem; 