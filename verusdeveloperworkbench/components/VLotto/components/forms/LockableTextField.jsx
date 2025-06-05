import React from 'react';
import {
  Box,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const LockableTextField = React.memo(function LockableTextField({ 
  label,
  value, 
  onChange, 
  locked, 
  onToggleLock,
  tooltip,
  ...textFieldProps 
}) {
  const lockTooltip = tooltip || (locked ? "Unlock to edit" : "Lock to prevent changes");
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        disabled={locked}
        {...textFieldProps}
      />
      <Tooltip title={lockTooltip}>
        <IconButton
          onClick={onToggleLock}
          color={locked ? "error" : "default"}
          size="small"
          sx={{ 
            border: '1px solid #444',
            backgroundColor: locked ? '#2a1a1a' : '#1a1a1a'
          }}
        >
          {locked ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
});

export default LockableTextField; 