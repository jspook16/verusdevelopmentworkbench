import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import StatusIndicator from '../components/shared/StatusIndicator';

const VLottoHeaderSection = React.memo(function VLottoHeaderSection({
  lotteryStatus,
  vlottoAutomation,
  ticketGeneration,
  onStartPauseLottery,
  onStopLottery,
  onResetLottery,
  parametersLoaded = true // Default to true for backward compatibility
}) {
  // Get parameter validation status
  const parameters = vlottoAutomation?.getLockedParameters() || {};
  const isParametersValid = vlottoAutomation?.ParameterValidator ? 
    vlottoAutomation.ParameterValidator.validateAutomationParameters(parameters).valid : false;

  const getStartPauseButtonContent = () => {
    if (!vlottoAutomation) {
      return {
        text: 'Loading...',
        icon: <CircularProgress size={16} />,
        disabled: true,
        color: 'default',
        tooltip: 'Loading automation system...'
      };
    }

    const missingParams = !ticketGeneration?.futureBlockNumber || !ticketGeneration?.mainVerusId;
    const invalidParams = !isParametersValid;
    const parametersNotLoaded = !parametersLoaded;

    // Paused state
    if (vlottoAutomation.isAutomationPaused) {
      return {
        text: 'Resume Lottery',
        icon: <PlayArrowIcon />,
        disabled: false,
        color: 'success',
        tooltip: 'Resume the paused lottery automation'
      };
    }

    // Running state
    if (vlottoAutomation.isAutomationRunning) {
      return {
        text: 'Pause Lottery',
        icon: <PauseIcon />,
        disabled: false,
        color: 'warning',
        tooltip: 'Pause the running lottery automation'
      };
    }

    // Idle state
    let tooltip = 'Start lottery automation';
    let disabled = false;
    
    if (parametersNotLoaded) {
      disabled = true;
      tooltip = 'Loading parameters... Please wait.';
    } else if (missingParams) {
      disabled = true;
      tooltip = 'Missing required parameters: Main Lottery ID and Target Drawing Block';
    } else if (invalidParams) {
      disabled = true;
      tooltip = 'Invalid parameters - check Parameter Validation section for details';
    }
    
    return {
      text: parametersNotLoaded ? 'Loading...' : 'Start Lottery',
      icon: parametersNotLoaded ? <CircularProgress size={16} /> : <PlayArrowIcon />,
      disabled: disabled,
      color: disabled ? 'default' : 'success',
      tooltip: tooltip
    };
  };

  const getStopButtonContent = () => {
    if (!vlottoAutomation) {
      return {
        disabled: true,
        color: 'default',
        tooltip: 'Loading automation system...'
      };
    }

    const isActive = vlottoAutomation.isAutomationRunning || vlottoAutomation.isAutomationPaused;

    return {
      disabled: !isActive,
      color: isActive ? 'error' : 'default',
      tooltip: isActive ? 'Stop and reset lottery automation completely' : 'No active automation to stop'
    };
  };

  const getResetButtonContent = () => {
    if (!vlottoAutomation) {
      return {
        disabled: true,
        color: 'default',
        tooltip: 'Loading automation system...'
      };
    }

    const isActive = vlottoAutomation.isAutomationRunning || vlottoAutomation.isAutomationPaused;
    const hasTickets = ticketGeneration?.tickets?.length > 0;
    const isStuck = vlottoAutomation.automationError || vlottoAutomation.currentPhase === 'ERROR';

    return {
      disabled: isActive && !isStuck, // Allow reset when stuck, even if automation is "running"
      color: isStuck ? 'warning' : 'secondary',
      tooltip: isActive && !isStuck ? 
        'Stop automation first before resetting' : 
        hasTickets || isStuck ?
          'Reset lottery state and clear all ticket data' :
          'Reset lottery state (no tickets to clear)'
    };
  };

  const startPauseButtonContent = getStartPauseButtonContent();
  const stopButtonContent = getStopButtonContent();
  const resetButtonContent = getResetButtonContent();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      {/* Status Indicator */}
      <StatusIndicator status={lotteryStatus} />
      
      <Typography variant="h4" sx={{ flexGrow: 1 }}>
        vLotto - Verus Lottery System
      </Typography>

      {/* Parameter Status Indicator */}
      {vlottoAutomation?.ParameterValidator && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ 
            color: isParametersValid ? '#4caf50' : '#f44336',
            fontWeight: 'bold',
            fontSize: '0.8rem'
          }}>
            {isParametersValid ? '✅ Parameters Valid' : '❌ Invalid Parameters'}
          </Typography>
        </Box>
      )}

      {/* Start/Pause Lottery Button */}
      <Tooltip title={startPauseButtonContent.tooltip} arrow>
        <span> {/* Wrap in span to allow tooltip on disabled button */}
          <Button
            variant="contained"
            size="large"
            color={startPauseButtonContent.color}
            startIcon={startPauseButtonContent.icon}
            onClick={onStartPauseLottery}
            disabled={startPauseButtonContent.disabled}
            sx={{
              minWidth: 160,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              py: 1.5,
              px: 3,
              mr: 1 // Add margin to separate buttons
            }}
          >
            {startPauseButtonContent.text}
          </Button>
        </span>
      </Tooltip>

      {/* Reset Lottery Button */}
      <Tooltip title={resetButtonContent.tooltip} arrow>
        <span> {/* Wrap in span to allow tooltip on disabled button */}
          <Button
            variant="contained"
            size="large"
            color={resetButtonContent.color}
            startIcon={<RestartAltIcon />}
            onClick={onResetLottery}
            disabled={resetButtonContent.disabled}
            sx={{
              minWidth: 140,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              py: 1.5,
              px: 3,
              mr: 1 // Add margin to separate buttons
            }}
          >
            Reset
          </Button>
        </span>
      </Tooltip>

      {/* Stop Lottery Button */}
      <Tooltip title={stopButtonContent.tooltip} arrow>
        <span> {/* Wrap in span to allow tooltip on disabled button */}
          <Button
            variant="contained"
            size="large"
            color={stopButtonContent.color}
            startIcon={<StopIcon />}
            onClick={onStopLottery}
            disabled={stopButtonContent.disabled}
            sx={{
              minWidth: 140,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              py: 1.5,
              px: 3
            }}
          >
            Stop Lottery
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
});

export default VLottoHeaderSection; 