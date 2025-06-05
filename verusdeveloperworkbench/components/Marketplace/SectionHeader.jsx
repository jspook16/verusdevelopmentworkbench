import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader = ({ children }) => (
  <Box
    sx={{
      background: '#191919',
      px: 2,
      py: 1,
      borderBottom: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      minHeight: '40px',
    }}
  >
    <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
      {children}
    </Typography>
  </Box>
);

export default SectionHeader; 