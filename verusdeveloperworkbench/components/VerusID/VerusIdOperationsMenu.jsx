import React, { useContext } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { OperationContext } from '../../contexts/OperationContext';

const operations = {
  'Identity Creation': ['namecommitment', 'registeridentity'],
  'Identity Query': [
    'getidentity', 
    'listidentities', 
    'getidentitytrust', 
    'identitieswithaddress', 
    'identitieswithrecovery', 
    'identitieswithrevocation', 
    'identityhistory'
  ],
  'Identity Management': [
    'updateidentity', 
    'recoveridentity', 
    'revokeidentity', 
    'setidentitytimelock', 
    'setidentitytrust',
    'manageidentitycontent' // For IdentityContentForm.jsx
  ],
  'Crypto Operations': ['signmessage', 'signfile', 'signdata', 'verifymessage', 'verifyfile', 'verifyhash', 'verifysignature'],
};

// Function to format operation names (optional)
const formatOperationName = (op) => {
  // Example: Convert 'namecommitment' to 'Name Commitment'
  return op.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const StyledPaperContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#232323',
  borderRadius: theme.shape.borderRadius,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const VerusIdOperationsMenu = () => {
  const { selectedOperation, selectedSubOperation, handleOperationSelect, handleSubOperationSelect } = useContext(OperationContext);

  return (
    <StyledPaperContainer>
      <Typography 
        variant="h6" 
        sx={{ 
          p: 1, 
          textAlign: 'center', 
          color: 'white', 
          backgroundColor: '#191919',
          flexShrink: 0
        }}
      >
        Operations
      </Typography>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
        <List dense sx={{ width: '100%' }}>
          {Object.entries(operations).map(([category, subOps]) => (
            <Box key={category} sx={{ mb: 1.5 }}>
              <ListItem sx={{ pb: 0.5, pt: 0 }}>
                <ListItemText 
                  primary={<Typography sx={{fontSize: '13px', fontWeight: 600, color: '#90caf9'}}>{category}</Typography>} 
                />
              </ListItem>
              <List dense disablePadding sx={{ pl: 1 }}>
                {subOps.map((subOp) => {
                  const isSelected = selectedSubOperation === subOp;
                  return (
                    <ListItem key={subOp} disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => {
                          handleSubOperationSelect(subOp);
                        }}
                        sx={{ 
                          py: 0.25, 
                          pl: 1, 
                          borderRadius: '4px',
                          mb: 0.5,
                          '&.Mui-selected': { bgcolor: 'rgba(144, 202, 249, 0.2)' },
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' }
                        }}
                      >
                        <ListItemText primary={<Typography sx={{fontSize: '13px', color: isSelected ? '#fff' : '#ddd'}}>{formatOperationName(subOp)}</Typography>} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </List>
      </Box>
    </StyledPaperContainer>
  );
};

export default VerusIdOperationsMenu; 