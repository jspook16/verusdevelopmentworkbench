import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PlaceholderSixthColumn = () => {
  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0, borderRadius:1, background: '#232323' }}>
      <Box sx={{ p: 1, backgroundColor: '#191919', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
          New Column Title
        </Typography>
      </Box>
      <Box sx={{ p: 1.5, overflowY: 'auto', flexGrow: 1, color: '#ccc' }}>
        <Typography>Content for the new sixth column will go here.</Typography>
      </Box>
    </Paper>
  );
};

export default PlaceholderSixthColumn; 