import React from 'react';
import { 
  Box, Typography, Divider, Tooltip, IconButton, 
  Accordion, AccordionSummary, AccordionDetails, Paper
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// New DetailItem component based on VerusIdDetailsMarketplace styling
const NewDetailItem = ({ label, value, isMonospace = true, breakAll = true, onCopy, fullValue, compact = false, children, depth = 0 }) => {
  if (value === undefined && !children) return null;
  if (value === null && !children) return null;
  if (typeof value === 'string' && value.trim() === '' && !children) return null;

  const displayValue = Array.isArray(value) ? '[Array]' : (typeof value === 'object' && value !== null ? '{Object}' : String(value));
  const valueToCopy = fullValue !== undefined ? fullValue : (Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
  const canCopy = valueToCopy !== null && valueToCopy !== undefined && String(valueToCopy).trim() !== '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: compact ? 0.25 : 0.5, py: compact ? 0.1 : 0.25, minHeight: compact ? '18px' : '24px', ml: depth * 2 }}>
      <Typography variant="body2" sx={{ fontWeight: '500', color: '#a0cff9', minWidth: compact ? 80 - (depth * 10) : 150 - (depth * 15), flexShrink: 0, fontSize: compact ? '0.7rem' : '0.75rem', mr: 1, lineHeight: compact ? 1.2 : 1.4, whiteSpace: 'nowrap' }}>{label}:</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="div" variant="body2" sx={{ 
          color: '#ddd', 
          wordBreak: breakAll ? 'break-all' : 'normal', 
            whiteSpace: (typeof value === 'object' || Array.isArray(value)) ? 'normal' : (isMonospace ? 'pre-wrap' : 'normal'),
            fontFamily: (typeof value === 'object' || Array.isArray(value)) ? 'inherit' : (isMonospace ? 'monospace' : 'inherit'),
            fontSize: compact ? '0.7rem' : '0.75rem',
            lineHeight: compact ? 1.2 : 1.4,
            pr: canCopy ? 0.5 : 0
        }}>
          {children ? children : displayValue}
        </Typography>
        {canCopy && (
          <Tooltip title={`Copy ${label}: ${String(valueToCopy).substring(0, 100)}${String(valueToCopy).length > 100 ? '...' : ''}`}>
            <IconButton onClick={() => onCopy(valueToCopy)} size="small" sx={{ p: 0.1, color: '#777', '&:hover': { color: '#90caf9' }, flexShrink: 0 }} aria-label={`Copy ${label}`}>
              <ContentCopyIcon sx={{ fontSize: compact ? '0.8rem' : '0.9rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

// Recursive rendering function for object properties
const renderObjectProperties = (obj, onCopy, depth = 0, forceCompact = false) => {
  if (obj === null || typeof obj !== 'object') {
    return <NewDetailItem label="Value" value={String(obj)} onCopy={onCopy} isMonospace={false} depth={depth} compact={forceCompact || depth > 0} />;
  }

  return Object.entries(obj).map(([key, value]) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize key for label

    if (value === null || typeof value !== 'object') {
      return (
        <NewDetailItem 
          key={key} 
          label={label} 
          value={String(value)} 
          onCopy={onCopy} 
          isMonospace={typeof value === 'string' || typeof value === 'number'} 
          depth={depth}
          compact={forceCompact || depth > 0}
        />
      );
    } else { // Value is an object or array
      return (
        <Accordion key={key} sx={{ background: depth === 0 ? '#232323' : '#1c1c1c', color: '#fff', my: depth === 0 ? 0.5: 0, boxShadow: 'none', '&:before': {display: 'none'} }} defaultExpanded={depth < 1} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '36px', '& .MuiAccordionSummary-content': { my: '8px' } }}>
            <Typography sx={{ fontWeight: '500', color: '#a0cff9', fontSize: '0.75rem' }}>{label}:</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1, background: '#181818', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {renderObjectProperties(value, onCopy, depth + 1, forceCompact)}
          </AccordionDetails>
        </Accordion>
      );
    }
  });
};

const FormattedResultDisplay = ({ result, title = "Result", initialCompact = false }) => {
  if (!result) return null;
  
  const handleCopy = (text) => {
    if (text !== undefined && text !== null) {
      navigator.clipboard.writeText(String(text));
    }
  };

  // Handle primitive types directly (boolean, string, number)
  if (typeof result !== 'object' || result === null) {
    let displayResult = String(result);
    let severity = 'info';
    if (typeof result === 'boolean') {
        displayResult = result ? 'Success (True)' : 'Failed (False)';
        severity = result ? 'success' : 'error';
    }
  
  return (
      <Box sx={{ mt: 2, p: 1.5, background: '#282828', borderRadius: 1, border: '1px solid #383838' }}>
        <Typography variant="subtitle1" sx={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', mb: 1, borderBottom: '1px solid #383838', pb:0.5 }}>
          {title}
        </Typography>
        <NewDetailItem label={typeof result === 'boolean' ? "Status" : "Value"} value={displayResult} onCopy={handleCopy} isMonospace={typeof result === 'string'} compact={false} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 2, p: 1.5, background: '#282828', borderRadius: 1, border: '1px solid #383838', maxHeight: '70vh', overflowY: 'auto' }}>
      <Typography variant="subtitle1" sx={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', mb: 1, borderBottom: '1px solid #383838', pb:0.5, position:'sticky', top:0, background:'#282828', zIndex:1}}>
        {title}
      </Typography>
      {renderObjectProperties(result, handleCopy, 0, initialCompact)}
    </Box>
  );
};

export default FormattedResultDisplay; 