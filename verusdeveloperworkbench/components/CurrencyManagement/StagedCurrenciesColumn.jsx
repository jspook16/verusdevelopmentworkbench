import React, { useContext } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import StagedCurrencyCard from './StagedCurrencyCard';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const StagedCurrenciesColumn = () => {
  const { stagedCurrencyDefinitions, clearAllStagedCurrencyDefinitions } = useContext(WorkbenchDataContext);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1, borderLeft: '1px solid #444' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontSize: '1rem' }}>
          Staged Currency Launches
        </Typography>
        {stagedCurrencyDefinitions && stagedCurrencyDefinitions.length > 0 && (
          <Tooltip title="Clear All Staged Definitions">
            <IconButton onClick={clearAllStagedCurrencyDefinitions} size="small" sx={{color: '#ff8a80'}}>
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {stagedCurrencyDefinitions && stagedCurrencyDefinitions.length > 0 ? (
        <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 0.5 }}>
          {stagedCurrencyDefinitions.map((definition) => (
            <StagedCurrencyCard key={definition.defineTxid} definition={definition} />
          ))}
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', color: '#777', mt: 2, fontSize: '0.9rem' }}>
          No currencies staged for launch.
        </Typography>
      )}
    </Box>
  );
};

export default StagedCurrenciesColumn; 