import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockableTextField from '../components/forms/LockableTextField';

const LotteryParametersSection = React.memo(function LotteryParametersSection({
  // Expansion state
  expanded,
  onToggleExpanded,
  
  // Ticket generation hook
  ticketGeneration,
  
  // Main parameters
  mainLotteryIdLocked,
  setMainLotteryIdLocked,
  lotteryStartBlockLocked,
  setLotteryStartBlockLocked,
  ticketMultiplierLocked,
  setTicketMultiplierLocked,
  drawingIntervalLocked,
  setDrawingIntervalLocked,
  jackpotMinimumLocked,
  setJackpotMinimumLocked,
  jackpotCeilingCapLocked,
  setJackpotCeilingCapLocked,
  
  // New automation parameters
  gracePeriodLocked,
  setGracePeriodLocked,
  confirmationsLocked,
  setConfirmationsLocked,
  closeOffersBeforeDrawingLocked,
  setCloseOffersBeforeDrawingLocked,
  
  // Additional parameter values and setters
  drawingInterval,
  setDrawingInterval,
  jackpotMinimum,
  setJackpotMinimum,
  jackpotCeilingCap,
  setJackpotCeilingCap,
  
  // R-Address for Tickets parameter
  rAddressForTickets,
  setRAddressForTickets,
  rAddressForTicketsLocked,
  setRAddressForTicketsLocked,
  
  // New automation parameter values
  gracePeriod,
  setGracePeriod,
  confirmations,
  setConfirmations,
  closeOffersBeforeDrawing,
  setCloseOffersBeforeDrawing,
  
  // Revenue distribution
  nextJackpotValue,
  setNextJackpotValue,
  nextJackpotPercent,
  setNextJackpotPercent,
  nextJackpotLocked,
  setNextJackpotLocked,
  operationsValue,
  setOperationsValue,
  operationsPercent,
  setOperationsPercent,
  operationsLocked,
  setOperationsLocked,
  destination1Name,
  setDestination1Name,
  destination1Percent,
  setDestination1Percent,
  destination1Locked,
  setDestination1Locked,
  destination2Name,
  setDestination2Name,
  destination2Percent,
  setDestination2Percent,
  destination2Locked,
  setDestination2Locked,
  
  // Operations distribution
  destination3Name,
  setDestination3Name,
  destination3Percent,
  setDestination3Percent,
  destination3Locked,
  setDestination3Locked,
  destination4Name,
  setDestination4Name,
  destination4Percent,
  setDestination4Percent,
  destination4Locked,
  setDestination4Locked,
  destination5Name,
  setDestination5Name,
  destination5Percent,
  setDestination5Percent,
  destination5Locked,
  setDestination5Locked,
  destination6Name,
  setDestination6Name,
  destination6Percent,
  setDestination6Percent,
  destination6Locked,
  setDestination6Locked
}) {
  // Local state for ticket multiplier input to handle partial decimal input
  const [ticketMultiplierInput, setTicketMultiplierInput] = React.useState('');

  // Initialize local input state when component mounts or ticketGeneration changes
  React.useEffect(() => {
    if (ticketGeneration.ticketMultiplier !== null && ticketGeneration.ticketMultiplier !== undefined && ticketGeneration.ticketMultiplier !== '') {
      setTicketMultiplierInput(ticketGeneration.ticketMultiplier.toString());
    } else {
      setTicketMultiplierInput(''); // Start empty if no value
    }
  }, [ticketGeneration.ticketMultiplier]);

  const handleTicketMultiplierChange = (value) => {
    console.log('Ticket multiplier input:', value);
    
    // Allow empty string or valid decimal numbers with up to 2 decimal places
    if (value === '') {
      setTicketMultiplierInput('');
      return;
    }
    
    // Simple validation: digits, optional decimal point, up to 2 decimal places
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      console.log('Invalid input pattern:', value);
      return;
    }
    
    setTicketMultiplierInput(value);
    
    // Update the hook only if it's a complete valid number (not ending with '.')
    if (!value.endsWith('.') && value !== '') {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        console.log('Setting ticket multiplier to:', numericValue);
        ticketGeneration.setTicketMultiplier(numericValue);
      }
    }
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={onToggleExpanded}
      sx={{ mb: 3, backgroundColor: '#1e1e1e', border: '1px solid #333' }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
        sx={{ backgroundColor: '#2a2a2a', color: '#fff' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Lottery Parameters
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        {/* Main Parameters Section */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 0.5, mb: 1 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}> 
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1, color: '#fff', whiteSpace: 'nowrap' }}>Main Parameters:</Typography>
                <LockableTextField
                  label="Main Lottery ID"
                  value={ticketGeneration.mainVerusId}
                  onChange={(e) => ticketGeneration.setMainVerusId(e.target.value)}
                  placeholder="i-address or name@"
                  size="small"
                  locked={mainLotteryIdLocked}
                  onToggleLock={() => setMainLotteryIdLocked(!mainLotteryIdLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Target Drawing Block"
                  value={ticketGeneration.futureBlockNumber}
                  onChange={(e) => ticketGeneration.setFutureBlockNumber(e.target.value)}
                  type="number"
                  placeholder="Block when drawing will occur"
                  size="small"
                  locked={lotteryStartBlockLocked}
                  onToggleLock={() => setLotteryStartBlockLocked(!lotteryStartBlockLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Ticket Multiplier"
                  value={ticketMultiplierInput}
                  onChange={(e) => {
                    try {
                      handleTicketMultiplierChange(e.target.value);
                    } catch (error) {
                      console.error('Error in ticket multiplier change:', error);
                    }
                  }}
                  type="text"
                  inputProps={{ 
                    inputMode: 'decimal'
                  }}
                  placeholder="e.g., 10 or 1.50"
                  size="small"
                  disabled={ticketMultiplierLocked}
                  sx={{ flexGrow: 1 }}
                  title="Multiplier used to calculate ticket quantity: Locked Jackpot Balance × Multiplier = Tickets (rounded up)"
                />
                <Tooltip title={ticketMultiplierLocked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setTicketMultiplierLocked(!ticketMultiplierLocked)}
                    color={ticketMultiplierLocked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: ticketMultiplierLocked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {ticketMultiplierLocked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              {/* Removed warning text */}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Drawing Cycle"
                  value={drawingInterval}
                  onChange={(e) => setDrawingInterval(e.target.value)}
                  type="number"
                  placeholder="Blocks between drawings"
                  size="small"
                  locked={drawingIntervalLocked}
                  onToggleLock={() => setDrawingIntervalLocked(!drawingIntervalLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Grace Period"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(e.target.value)}
                  type="number"
                  placeholder="Idle blocks after payout"
                  size="small"
                  locked={gracePeriodLocked}
                  onToggleLock={() => setGracePeriodLocked(!gracePeriodLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Confirmations"
                  value={confirmations}
                  onChange={(e) => setConfirmations(e.target.value)}
                  type="number"
                  placeholder="Required confirmations"
                  size="small"
                  locked={confirmationsLocked}
                  onToggleLock={() => setConfirmationsLocked(!confirmationsLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Close Offers Before Drawing"
                  value={closeOffersBeforeDrawing}
                  onChange={(e) => setCloseOffersBeforeDrawing(e.target.value)}
                  type="number"
                  placeholder="Blocks before drawing"
                  size="small"
                  locked={closeOffersBeforeDrawingLocked}
                  onToggleLock={() => setCloseOffersBeforeDrawingLocked(!closeOffersBeforeDrawingLocked)}
                  title="Number of blocks before drawing when offers will be closed and unsold tickets revoked"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Jackpot Minimum"
                  value={jackpotMinimum}
                  onChange={(e) => setJackpotMinimum(e.target.value)}
                  type="number"
                  size="small"
                  locked={jackpotMinimumLocked}
                  onToggleLock={() => setJackpotMinimumLocked(!jackpotMinimumLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="Jackpot Ceiling Cap"
                  value={jackpotCeilingCap}
                  onChange={(e) => setJackpotCeilingCap(e.target.value)}
                  type="number"
                  size="small"
                  locked={jackpotCeilingCapLocked}
                  onToggleLock={() => setJackpotCeilingCapLocked(!jackpotCeilingCapLocked)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockableTextField
                  label="R-Address for Tickets"
                  value={rAddressForTickets}
                  onChange={(e) => setRAddressForTickets(e.target.value)}
                  placeholder="R-address used for ticket creation"
                  size="small"
                  locked={rAddressForTicketsLocked}
                  onToggleLock={() => setRAddressForTicketsLocked(!rAddressForTicketsLocked)}
                  title="R-address used when creating tickets. Used to identify unsold vs sold tickets for revocation."
                />
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Revenue Distribution Section */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 0.5, mb: 1 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Next Jackpot */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1, color: '#fff', whiteSpace: 'nowrap' }}>Revenue Distribution:</Typography>
                <TextField
                  label="Next Jackpot"
                  value={nextJackpotValue} 
                  onChange={(e) => setNextJackpotValue(e.target.value)}
                  size="small"
                  disabled={nextJackpotLocked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  value={nextJackpotPercent} 
                  onChange={(e) => setNextJackpotPercent(e.target.value)}
                  type="number"
                  placeholder="%"
                  size="small"
                  disabled={nextJackpotLocked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={nextJackpotLocked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setNextJackpotLocked(!nextJackpotLocked)}
                    color={nextJackpotLocked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: nextJackpotLocked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {nextJackpotLocked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Operations */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Operations"
                  value={operationsValue} 
                  onChange={(e) => setOperationsValue(e.target.value)}
                  size="small"
                  disabled={operationsLocked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  value={operationsPercent} 
                  onChange={(e) => setOperationsPercent(e.target.value)}
                  type="number"
                  placeholder="%"
                  size="small"
                  disabled={operationsLocked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={operationsLocked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setOperationsLocked(!operationsLocked)}
                    color={operationsLocked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: operationsLocked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {operationsLocked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Destination 1 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Destination 1 Name"
                  value={destination1Name}
                  onChange={(e) => setDestination1Name(e.target.value)}
                  size="small"
                  disabled={destination1Locked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  label="%"
                  value={destination1Percent}
                  onChange={(e) => setDestination1Percent(e.target.value)}
                  type="number"
                  size="small"
                  disabled={destination1Locked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={destination1Locked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setDestination1Locked(!destination1Locked)}
                    color={destination1Locked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: destination1Locked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {destination1Locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Destination 2 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Destination 2 Name"
                  value={destination2Name}
                  onChange={(e) => setDestination2Name(e.target.value)}
                  size="small"
                  disabled={destination2Locked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  label="%"
                  value={destination2Percent}
                  onChange={(e) => setDestination2Percent(e.target.value)}
                  type="number"
                  size="small"
                  disabled={destination2Locked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={destination2Locked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setDestination2Locked(!destination2Locked)}
                    color={destination2Locked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: destination2Locked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {destination2Locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Operations Distribution Section */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 0.5, mb: 1 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Destination 3 with inline header */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1, color: '#fff', whiteSpace: 'nowrap' }}>Operations Distribution:</Typography>
                <TextField
                  label="Destination 3 Name"
                  value={destination3Name}
                  onChange={(e) => setDestination3Name(e.target.value)}
                  size="small"
                  disabled={destination3Locked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  placeholder="%"
                  value={destination3Percent}
                  onChange={(e) => setDestination3Percent(e.target.value)}
                  type="number"
                  size="small"
                  disabled={destination3Locked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={destination3Locked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setDestination3Locked(!destination3Locked)}
                    color={destination3Locked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: destination3Locked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {destination3Locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Destination 4 */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Destination 4 Name"
                  value={destination4Name}
                  onChange={(e) => setDestination4Name(e.target.value)}
                  size="small"
                  disabled={destination4Locked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  placeholder="%"
                  value={destination4Percent}
                  onChange={(e) => setDestination4Percent(e.target.value)}
                  type="number"
                  size="small"
                  disabled={destination4Locked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={destination4Locked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setDestination4Locked(!destination4Locked)}
                    color={destination4Locked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: destination4Locked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {destination4Locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Destination 5 */}
            <Grid item xs={12} md={6}> 
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Destination 5 Name"
                  value={destination5Name}
                  onChange={(e) => setDestination5Name(e.target.value)}
                  size="small"
                  disabled={destination5Locked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  placeholder="%"
                  value={destination5Percent}
                  onChange={(e) => setDestination5Percent(e.target.value)}
                  type="number"
                  size="small"
                  disabled={destination5Locked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={destination5Locked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setDestination5Locked(!destination5Locked)}
                    color={destination5Locked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: destination5Locked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {destination5Locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Destination 6 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Destination 6 Name"
                  value={destination6Name}
                  onChange={(e) => setDestination6Name(e.target.value)}
                  size="small"
                  disabled={destination6Locked}
                  sx={{ flexBasis: '60%', mr: 1 }}
                />
                <TextField
                  placeholder="%"
                  value={destination6Percent}
                  onChange={(e) => setDestination6Percent(e.target.value)}
                  type="number"
                  size="small"
                  disabled={destination6Locked}
                  sx={{ flexBasis: '30%' }}
                />
                <Tooltip title={destination6Locked ? "Unlock to edit" : "Lock to prevent changes"}>
                  <IconButton
                    onClick={() => setDestination6Locked(!destination6Locked)}
                    color={destination6Locked ? "error" : "default"}
                    size="small"
                    sx={{ 
                      border: '1px solid #444',
                      backgroundColor: destination6Locked ? '#2a1a1a' : '#1a1a1a'
                    }}
                  >
                    {destination6Locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
});

export default LotteryParametersSection; 