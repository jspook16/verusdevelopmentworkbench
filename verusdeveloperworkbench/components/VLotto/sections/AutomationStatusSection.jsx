import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Typography,
  Tooltip
} from '@mui/material';

const AutomationStatusSection = React.memo(function AutomationStatusSection({
  vlottoAutomation,
  ticketGeneration,
  utilityIds,
  drawingSystem
}) {
  
  // Helper functions for lottery status display
  const getLotteryStatusText = () => {
    if (ticketGeneration.tickets.length > 0 && 
        vlottoAutomation.isAutomationRunning && 
        !vlottoAutomation.automationPhase?.includes('REVOKE') &&
        !vlottoAutomation.automationPhase?.includes('DRAWING')) {
      return 'LIVE';
    }
    return 'CLOSED';
  };

  const getLotteryStatusColor = () => {
    const status = getLotteryStatusText();
    return status === 'LIVE' ? 'success' : 'default';
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a', border: '2px solid #333' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ 
                fontSize: '1.5rem',
                ...(vlottoAutomation.getPhaseDisplayInfo().spinning && { 
                  animation: 'spin 1s linear infinite' 
                })
              }}>
                {vlottoAutomation.getPhaseDisplayInfo().icon}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: vlottoAutomation.getPhaseDisplayInfo().color,
                fontWeight: 'bold'
              }}>
                {vlottoAutomation.getPhaseDisplayInfo().label}
              </Typography>
            </Box>
            
            {vlottoAutomation.isAutomationRunning && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                <Chip 
                  label={`${vlottoAutomation.blocksUntilDrawing} blocks to drawing ${vlottoAutomation.targetDrawingBlock}`}
                  color={vlottoAutomation.blocksUntilDrawing <= (vlottoAutomation.closeOffersBeforeDrawing || 5) ? 'warning' : 'info'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            {vlottoAutomation.isAutomationRunning && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={vlottoAutomation.stopFullAutomation}
              >
                Stop Automation
              </Button>
            )}
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={vlottoAutomation.resetFullAutomation}
              disabled={vlottoAutomation.isAutomationRunning}
            >
              Reset
            </Button>
            
            {/* Emergency Recovery - Show when there's an error or stuck state */}
            {(vlottoAutomation.automationError || vlottoAutomation.currentPhase === 'ERROR') && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={vlottoAutomation.clearPersistentState}
                sx={{ fontSize: '0.7rem' }}
                title="Clear all persistent automation state and reset completely"
              >
                🔧 Force Recovery
              </Button>
            )}

            {/* Emergency Manual Controls - Show when close to critical timing */}
            {vlottoAutomation.isAutomationRunning && vlottoAutomation.blocksUntilDrawing <= (vlottoAutomation.closeOffersBeforeDrawing || 10) && (
              <>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={async () => {
                    try {
                      await ticketGeneration.checkAndRevokeExpiredOffers();
                    } catch (error) {
                      console.error('Manual expiry check and revocation error:', error);
                    }
                  }}
                  sx={{ fontSize: '0.7rem' }}
                >
                  🚨 Check Expiry & Revoke
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={async () => {
                    try {
                      await drawingSystem.setPastBlockNumber(vlottoAutomation.targetDrawingBlock.toString());
                      await drawingSystem.performDrawing(ticketGeneration.tickets, ticketGeneration.revokedTickets);
                    } catch (error) {
                      console.error('Manual drawing error:', error);
                    }
                  }}
                  disabled={vlottoAutomation.blocksUntilDrawing > 0}
                  sx={{ fontSize: '0.7rem' }}
                >
                  🎲 Force Drawing
                </Button>
              </>
            )}
          </Box>
        </Grid>
        
        {/* Detailed Status Display */}
        {(vlottoAutomation.automationStatus || ticketGeneration.generationStatus || utilityIds.utilityIdStatus) && (
          <Grid item xs={12}>
            <Box sx={{ 
              p: 1.5, 
              backgroundColor: '#2a2a2a', 
              borderRadius: 1,
              border: '1px solid #444'
            }}>                
              {ticketGeneration.generationStatus && (
                <Typography variant="body2" sx={{ 
                  color: '#e0e0e0', 
                  fontStyle: 'italic',
                  fontSize: '0.85rem'
                }}>
                  {ticketGeneration.generationStatus}
                </Typography>
              )}
              
              {utilityIds.utilityIdStatus && !ticketGeneration.generationStatus && (
                <Typography variant="body2" sx={{ 
                  color: '#e0e0e0', 
                  fontStyle: 'italic',
                  fontSize: '0.85rem'
                }}>
                  {utilityIds.utilityIdStatus}
                </Typography>
              )}
            </Box>
          </Grid>
        )}
        
        {vlottoAutomation.automationError && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ 
              color: '#f44336', 
              fontWeight: 'bold',
              textAlign: 'center',
              py: 1,
              backgroundColor: '#3a1e1e',
              borderRadius: 1
            }}>
              ⚠️ {vlottoAutomation.automationError}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 1.5, backgroundColor: '#2a2a2a', border: '1px solid #444' }}>
            <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.7rem' }}>
              Lottery Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip 
                label={getLotteryStatusText()} 
                color={getLotteryStatusColor()} 
                size="small" 
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Calculated Ticket Quantity - Automation Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 1.5, backgroundColor: '#2a2a2a', border: '1px solid #444' }}>
            <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.7rem' }}>
              Calculated Ticket Quantity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {ticketGeneration.ticketQuantityCalculated ? (
                <>
                  <Tooltip title="Tickets quantity calculated by automation from locked jackpot balance × multiplier">
                    <Typography variant="h6" sx={{ 
                      color: '#4caf50', 
                      fontWeight: 'bold' 
                    }}>
                      {ticketGeneration.ticketQuantity}
                    </Typography>
                  </Tooltip>
                  <Chip 
                    label="Auto-calculated" 
                    color="success" 
                    size="small" 
                    sx={{ fontSize: '0.6rem' }}
                  />
                </>
              ) : (
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  fontSize: '0.8rem'
                }}>
                  Not calculated yet
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
});

export default AutomationStatusSection; 