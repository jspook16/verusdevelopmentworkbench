import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Check environment variable for vLotto feature
const VLOTTO_ENABLED = import.meta.env.VITE_ENABLE_VLOTTO !== 'false';

// Conditionally import VLottoView only if enabled
const VLottoView = VLOTTO_ENABLED ? lazy(() => import('../VLotto/VLottoView')) : null;

const VLottoWrapper = () => {
  if (!VLOTTO_ENABLED) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        flexDirection: 'column'
      }}>
        <CircularProgress />
        <Box sx={{ mt: 2, color: '#aaa' }}>
          vLotto feature is disabled in this build
        </Box>
      </Box>
    );
  }

  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <CircularProgress />
      </Box>
    }>
      <VLottoView />
    </Suspense>
  );
};

export default VLottoWrapper; 