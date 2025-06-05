import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';

const StatusIndicator = React.memo(function StatusIndicator({ 
  status, 
  liveText = 'Live', 
  closedText = 'Closed - Waiting for Drawing' 
}) {
  const isLive = status === 'live';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: isLive ? '#4caf50' : '#f44336',
          border: '2px solid',
          borderColor: isLive ? '#66bb6a' : '#ef5350',
          ...(isLive && { 
            animation: 'glow 2s ease-in-out infinite',
            boxShadow: '0 0 5px #4caf50, 0 0 10px #4caf50'
          })
        }}
      />
      <Typography 
        variant="body2" 
        sx={{ 
          color: isLive ? '#4caf50' : '#f44336', 
          fontWeight: 'bold',
          fontSize: '0.85rem',
          whiteSpace: 'nowrap'
        }}
      >
        {isLive ? liveText : closedText}
      </Typography>
    </Box>
  );
});

export default StatusIndicator; 