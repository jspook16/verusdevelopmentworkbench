/**
 * VLotto Manual Controls Section
 * 
 * Comprehensive manual override controls for production use
 * Provides full control over funding, timelock, drawing, and payout operations
 */

import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';

const ManualControlsSection = ({ 
  masterAutomationEngine,
  fundingEngine,
  timelockEngine,
  payoutEngine,
  cycleEngine,
  expanded,
  onToggleExpanded,
  currentBlock = 0
}) => {
  // State for manual operations
  const [fundingDialogOpen, setFundingDialogOpen] = useState(false);
  const [timelockDialogOpen, setTimelockDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  
  // Manual operation parameters
  const [manualParams, setManualParams] = useState({
    mainLotteryId: '',
    jackpotAmount: '',
    drawingBlock: '',
    winnerTicketId: '',
    emergencyRecoveryAddress: '',
    emergencyAmount: '',
    customFundingSource: 'revenue',
    timelockConfirmations: 3,
    payoutConfirmations: 3
  });
  
  // Engine statuses
  const [engineStatuses, setEngineStatuses] = useState({
    funding: null,
    timelock: null,
    payout: null,
    cycle: null
  });
  
  // Manual override settings
  const [overrideSettings, setOverrideSettings] = useState({
    skipFunding: false,
    skipTimelock: false,
    skipPayout: false,
    customWinner: ''
  });

  // Refresh engine statuses
  const refreshStatuses = async () => {
    try {
      if (fundingEngine) setEngineStatuses(prev => ({ ...prev, funding: fundingEngine.getStatus() }));
      if (timelockEngine) setEngineStatuses(prev => ({ ...prev, timelock: timelockEngine.getStatus() }));
      if (payoutEngine) setEngineStatuses(prev => ({ ...prev, payout: payoutEngine.getStatus() }));
      if (cycleEngine) setEngineStatuses(prev => ({ ...prev, cycle: cycleEngine.getCycleStatus(currentBlock) }));
    } catch (error) {
      console.error('Error refreshing engine statuses:', error);
    }
  };

  // Refresh statuses on mount and periodically
  useEffect(() => {
    refreshStatuses();
    const interval = setInterval(refreshStatuses, 5000);
    return () => clearInterval(interval);
  }, [fundingEngine, timelockEngine, payoutEngine, cycleEngine, currentBlock]);

  // Manual funding operation
  const handleManualFunding = async () => {
    try {
      if (!fundingEngine || !manualParams.mainLotteryId) {
        alert('Missing funding engine or lottery ID');
        return;
      }

      // Get locked parameters
      const lockedParams = getLockedParameters();
      
      // Calculate funding requirements
      const fundingCalc = await fundingEngine.calculateFundingRequirements(
        manualParams.mainLotteryId,
        lockedParams
      );

      // Execute funding
      const result = await fundingEngine.executeFunding(
        fundingCalc,
        manualParams.mainLotteryId,
        3 // confirmations
      );

      alert(result.success ? 
        `Funding completed: ${result.totalFunded} funded` : 
        'Funding failed: ' + result.error
      );
      
      setFundingDialogOpen(false);
      refreshStatuses();

    } catch (error) {
      console.error('Manual funding error:', error);
      alert('Funding error: ' + error.message);
    }
  };

  // Manual timelock operation
  const handleManualTimelock = async () => {
    try {
      if (!timelockEngine || !manualParams.mainLotteryId || !manualParams.drawingBlock) {
        alert('Missing timelock engine, lottery ID, or drawing block');
        return;
      }

      const result = await timelockEngine.setJackpotTimelock(
        manualParams.mainLotteryId,
        parseInt(manualParams.drawingBlock),
        parseInt(manualParams.timelockConfirmations)
      );

      alert(result.success ? 
        `Timelock set until block ${result.drawingBlock}` : 
        'Timelock failed: ' + result.error
      );
      
      setTimelockDialogOpen(false);
      refreshStatuses();

    } catch (error) {
      console.error('Manual timelock error:', error);
      alert('Timelock error: ' + error.message);
    }
  };

  // Manual payout operation  
  const handleManualPayout = async () => {
    try {
      if (!payoutEngine || !manualParams.mainLotteryId || !manualParams.winnerTicketId) {
        alert('Missing payout engine, lottery ID, or winner ticket ID');
        return;
      }

      // Get locked parameters and jackpot balance
      const lockedParams = getLockedParameters();
      const jackpotBalance = await sendCommand('getcurrencybalance', [
        `jackpot.${manualParams.mainLotteryId}`
      ]);
      
      const parentCurrency = getParentCurrency(manualParams.mainLotteryId);
      const totalJackpot = jackpotBalance[parentCurrency] || 0;

      // Calculate payout distribution
      const payoutCalc = payoutEngine.calculatePayoutDistribution(
        manualParams.mainLotteryId,
        lockedParams,
        totalJackpot
      );

      // Execute payouts
      const result = await payoutEngine.executePayouts(
        payoutCalc,
        manualParams.winnerTicketId,
        parseInt(manualParams.payoutConfirmations)
      );

      alert(result.success ? 
        `Payout completed: ${result.totalPaidOut} distributed` : 
        'Payout failed: ' + result.error
      );
      
      setPayoutDialogOpen(false);
      refreshStatuses();

    } catch (error) {
      console.error('Manual payout error:', error);
      alert('Payout error: ' + error.message);
    }
  };

  // Emergency recovery
  const handleEmergencyRecovery = async () => {
    try {
      if (!payoutEngine || !manualParams.mainLotteryId || !manualParams.emergencyRecoveryAddress || !manualParams.emergencyAmount) {
        alert('Missing required parameters for emergency recovery');
        return;
      }

      const result = await payoutEngine.emergencyRecovery(
        manualParams.mainLotteryId,
        manualParams.emergencyRecoveryAddress,
        parseFloat(manualParams.emergencyAmount),
        3
      );

      alert(result.success ? 
        `Emergency recovery completed: ${result.amount} sent to ${result.to}` : 
        'Emergency recovery failed: ' + result.error
      );
      
      setEmergencyDialogOpen(false);
      refreshStatuses();

    } catch (error) {
      console.error('Emergency recovery error:', error);
      alert('Emergency recovery error: ' + error.message);
    }
  };

  // Apply manual overrides to automation engine
  const applyManualOverrides = () => {
    if (masterAutomationEngine) {
      masterAutomationEngine.setManualOverride({
        enabled: true,
        ...overrideSettings
      });
      alert('Manual overrides applied to automation engine');
    }
  };

  // Emergency stop automation
  const handleEmergencyStop = () => {
    if (masterAutomationEngine) {
      masterAutomationEngine.emergencyStop();
      alert('EMERGENCY STOP activated - all automation halted');
      refreshStatuses();
    }
  };

  // Helper functions
  const getLockedParameters = () => {
    try {
      const saved = localStorage.getItem('vlotto-locked-params') || '{}';
      const lockedParams = JSON.parse(saved);
      const distributionSaved = localStorage.getItem('vlotto-distribution-state') || '{}';
      const distributionParams = JSON.parse(distributionSaved);
      return { ...lockedParams, ...distributionParams };
    } catch (error) {
      console.error('Error getting locked parameters:', error);
      return {};
    }
  };

  const getParentCurrency = (lotteryId) => {
    if (!lotteryId.includes('@')) return 'VRSC';
    const parts = lotteryId.split('@');
    return parts[parts.length - 1] || 'VRSC';
  };

  const sendCommand = async (command, params) => {
    // This should be passed from parent component
    // For now, throw error to indicate missing implementation
    throw new Error('sendCommand not available - please connect to daemon');
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
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Manual Controls & Production Overrides
          </Typography>
          <Tooltip title="Refresh Status">
            <IconButton onClick={refreshStatuses} size="small" sx={{ color: '#fff' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 2 }}>
        {/* Engine Status Overview */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 1, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>
            Engine Status Overview
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(engineStatuses).map(([engine, status]) => (
              <Grid item xs={6} md={3} key={engine}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label={engine.charAt(0).toUpperCase() + engine.slice(1)}
                    color={status?.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', color: '#aaa' }}>
                    {status?.currentOperation || 'Idle'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Manual Override Settings */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 1, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>
            Automation Override Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={overrideSettings.skipFunding}
                    onChange={(e) => setOverrideSettings(prev => ({ ...prev, skipFunding: e.target.checked }))}
                    color="warning"
                  />
                }
                label="Skip Funding"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={overrideSettings.skipTimelock}
                    onChange={(e) => setOverrideSettings(prev => ({ ...prev, skipTimelock: e.target.checked }))}
                    color="warning"
                  />
                }
                label="Skip Timelock"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={overrideSettings.skipPayout}
                    onChange={(e) => setOverrideSettings(prev => ({ ...prev, skipPayout: e.target.checked }))}
                    color="warning"
                  />
                }
                label="Skip Payout"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={applyManualOverrides}
                size="small"
                color="warning"
                fullWidth
              >
                Apply Overrides
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Manual Operation Controls */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 1, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            Manual Operations
          </Typography>
          
          {/* Common Parameters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Main Lottery ID"
                value={manualParams.mainLotteryId}
                onChange={(e) => setManualParams(prev => ({ ...prev, mainLotteryId: e.target.value }))}
                placeholder="e.g., test.shylock@"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                Current Block: {currentBlock}
              </Typography>
            </Grid>
          </Grid>

          {/* Operation Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Button
                variant="contained"
                startIcon={<AttachMoneyIcon />}
                onClick={() => setFundingDialogOpen(true)}
                color="primary"
                fullWidth
                disabled={engineStatuses.funding?.isActive}
              >
                Fund Jackpot
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                onClick={() => setTimelockDialogOpen(true)}
                color="secondary"
                fullWidth
                disabled={engineStatuses.timelock?.isActive}
              >
                Set Timelock
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="contained"
                startIcon={<EmojiEventsIcon />}
                onClick={() => setPayoutDialogOpen(true)}
                color="success"
                fullWidth
                disabled={engineStatuses.payout?.isActive}
              >
                Process Payout
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="contained"
                startIcon={<WarningIcon />}
                onClick={() => setEmergencyDialogOpen(true)}
                color="error"
                fullWidth
              >
                Emergency
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Emergency Controls */}
        <Card variant="outlined" sx={{ backgroundColor: '#2a1a1a', p: 1, border: '1px solid #f44336' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f44336', mb: 1 }}>
            Emergency Controls
          </Typography>
          <Button
            variant="contained"
            startIcon={<StopIcon />}
            onClick={handleEmergencyStop}
            color="error"
            size="large"
            fullWidth
          >
            EMERGENCY STOP AUTOMATION
          </Button>
        </Card>

        {/* Manual Funding Dialog */}
        <Dialog open={fundingDialogOpen} onClose={() => setFundingDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manual Jackpot Funding</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
              Fund jackpot.{manualParams.mainLotteryId} using the priority funding system:
              1) Revenue distribution, 2) Reserves backup, 3) Main ID emergency
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Parameters will be read from locked values. Ensure Next Jackpot % and source accounts are properly configured.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFundingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleManualFunding} variant="contained" color="primary">
              Execute Funding
            </Button>
          </DialogActions>
        </Dialog>

        {/* Manual Timelock Dialog */}
        <Dialog open={timelockDialogOpen} onClose={() => setTimelockDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manual Timelock Setup</DialogTitle>
          <DialogContent>
            <TextField
              label="Drawing Block"
              value={manualParams.drawingBlock}
              onChange={(e) => setManualParams(prev => ({ ...prev, drawingBlock: e.target.value }))}
              type="number"
              fullWidth
              sx={{ mb: 2, mt: 1 }}
              helperText={`Current block: ${currentBlock}. Must be in the future.`}
            />
            <TextField
              label="Confirmations"
              value={manualParams.timelockConfirmations}
              onChange={(e) => setManualParams(prev => ({ ...prev, timelockConfirmations: e.target.value }))}
              type="number"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTimelockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleManualTimelock} variant="contained" color="secondary">
              Set Timelock
            </Button>
          </DialogActions>
        </Dialog>

        {/* Manual Payout Dialog */}
        <Dialog open={payoutDialogOpen} onClose={() => setPayoutDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manual Payout Processing</DialogTitle>
          <DialogContent>
            <TextField
              label="Winner Ticket ID"
              value={manualParams.winnerTicketId}
              onChange={(e) => setManualParams(prev => ({ ...prev, winnerTicketId: e.target.value }))}
              fullWidth
              sx={{ mb: 2, mt: 1 }}
              placeholder="e.g., 575000_1of10@test.shylock@"
            />
            <TextField
              label="Confirmations"
              value={manualParams.payoutConfirmations}
              onChange={(e) => setManualParams(prev => ({ ...prev, payoutConfirmations: e.target.value }))}
              type="number"
              fullWidth
            />
            <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
              Payout flow: jackpot.{manualParams.mainLotteryId} → payout.{manualParams.mainLotteryId} → distributions
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleManualPayout} variant="contained" color="success">
              Process Payout
            </Button>
          </DialogActions>
        </Dialog>

        {/* Emergency Recovery Dialog */}
        <Dialog open={emergencyDialogOpen} onClose={() => setEmergencyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: '#f44336' }}>Emergency Recovery</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: '#f44336' }}>
              WARNING: Emergency recovery will transfer funds from payout.{manualParams.mainLotteryId} to the specified address.
            </Typography>
            <TextField
              label="Recovery Address"
              value={manualParams.emergencyRecoveryAddress}
              onChange={(e) => setManualParams(prev => ({ ...prev, emergencyRecoveryAddress: e.target.value }))}
              fullWidth
              sx={{ mb: 2 }}
              placeholder="Address to send funds to"
            />
            <TextField
              label="Amount"
              value={manualParams.emergencyAmount}
              onChange={(e) => setManualParams(prev => ({ ...prev, emergencyAmount: e.target.value }))}
              type="number"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmergencyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEmergencyRecovery} variant="contained" color="error">
              Execute Recovery
            </Button>
          </DialogActions>
        </Dialog>
      </AccordionDetails>
    </Accordion>
  );
};

export default ManualControlsSection; 