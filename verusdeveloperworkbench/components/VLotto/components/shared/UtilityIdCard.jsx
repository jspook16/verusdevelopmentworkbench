import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';

const UtilityIdCard = React.memo(function UtilityIdCard({ 
  idType,
  details,
  onCreateUtilityId,
  onRefreshBalance,
  mainVerusId,
  isCreatingUtilityId = false
}) {
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  const handleRefreshBalance = async () => {
    if (isRefreshingBalance || !onRefreshBalance) return;
    setIsRefreshingBalance(true);
    try {
      await onRefreshBalance(idType);
    } catch (error) {
      console.error(`Failed to refresh ${idType} balance:`, error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 1, flexGrow: 1, minWidth: '120px' }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
        {idType}
      </Typography>
      
      {details ? (
        <Box>
          <Typography variant="caption" display="block" noWrap title={details.name}>
            Name: {details.name}
          </Typography>
          <Typography variant="caption" display="block" noWrap title={details.parent}>
            Parent: {details.parent}
          </Typography>
          
          {/* Display all currencies */}
          {details.balances && Object.keys(details.balances).length > 0 ? (
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                Balances:
                <IconButton 
                  size="small" 
                  onClick={handleRefreshBalance} 
                  sx={{ ml: 0.5, p: 0.2 }} 
                  disabled={isRefreshingBalance}
                >
                  {isRefreshingBalance ? (
                    <CircularProgress size={10} sx={{ p: 0.2 }} />
                  ) : (
                    <Typography sx={{ fontSize: '0.7rem' }}>♻️</Typography>
                  )}
                </IconButton>
              </Typography>
              {Object.entries(details.balances).map(([currency, amount]) => (
                <Typography key={currency} variant="caption" display="block" sx={{ ml: 1, fontSize: '0.65rem' }}>
                  {currency}: {typeof amount === 'number' ? amount.toFixed(8) : amount}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" display="block">
              No balances found
              <IconButton 
                size="small" 
                onClick={handleRefreshBalance} 
                sx={{ ml: 0.5, p: 0.2 }} 
                disabled={isRefreshingBalance}
              >
                {isRefreshingBalance ? (
                  <CircularProgress size={10} sx={{ p: 0.2 }} />
                ) : (
                  <Typography sx={{ fontSize: '0.7rem' }}>♻️</Typography>
                )}
              </IconButton>
            </Typography>
          )}
          
          {details.txid && (
            <Typography variant="caption" display="block" noWrap title={details.txid}>
              Reg TXID: {details.txid.substring(0, 10)}...
            </Typography>
          )}
        </Box>
      ) : (
        <Button 
          variant="outlined" 
          size="small" 
          color="secondary"
          fullWidth
          onClick={() => onCreateUtilityId && onCreateUtilityId(idType, mainVerusId)}
          disabled={isCreatingUtilityId || !mainVerusId}
          sx={{ mt: 0.5 }}
        >
          Create {idType}
        </Button>
      )}
    </Card>
  );
});

export default UtilityIdCard; 