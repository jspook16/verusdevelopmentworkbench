import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ParameterValidationStatus = React.memo(function ParameterValidationStatus({
  parameters,
  ParameterValidator,
  expanded = false,
  onToggleExpanded
}) {
  const validation = useMemo(() => {
    if (!ParameterValidator || !parameters) {
      return {
        valid: false,
        errors: ['Parameter validator not available'],
        warnings: [],
        summary: 'Validation unavailable'
      };
    }
    return ParameterValidator.validateAutomationParameters(parameters);
  }, [parameters, ParameterValidator]);

  const readiness = useMemo(() => {
    if (!ParameterValidator || !parameters) {
      return {
        overall: false,
        funding: false,
        timelock: false,
        tickets: false
      };
    }
    return ParameterValidator.getParameterReadiness(parameters);
  }, [parameters, ParameterValidator]);

  const getStatusColor = () => {
    if (validation.valid) return '#4caf50'; // Green
    if (validation.errors.length > 0) return '#f44336'; // Red
    return '#ff9800'; // Orange for warnings
  };

  const getStatusIcon = () => {
    if (validation.valid) return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    if (validation.errors.length > 0) return <ErrorIcon sx={{ color: '#f44336' }} />;
    return <WarningIcon sx={{ color: '#ff9800' }} />;
  };

  const getStatusText = () => {
    if (validation.valid) return 'Ready for Automation';
    if (validation.errors.length > 0) return `${validation.errors.length} Error${validation.errors.length !== 1 ? 's' : ''}`;
    return `${validation.warnings.length} Warning${validation.warnings.length !== 1 ? 's' : ''}`;
  };

  const ReadinessChip = ({ label, ready, tooltip }) => (
    <Tooltip title={tooltip}>
      <Chip
        label={label}
        size="small"
        color={ready ? 'success' : 'default'}
        variant={ready ? 'filled' : 'outlined'}
        icon={ready ? <CheckCircleIcon /> : <ErrorIcon />}
        sx={{ 
          fontSize: '0.7rem',
          '& .MuiChip-icon': { 
            fontSize: '0.8rem' 
          }
        }}
      />
    </Tooltip>
  );

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        backgroundColor: '#1e1e1e', 
        border: `1px solid ${getStatusColor()}`,
        mb: 1 
      }}
    >
      <Box sx={{ p: 1 }}>
        {/* Header with status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {getStatusIcon()}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#fff', flexGrow: 1 }}>
            Parameter Validation
          </Typography>
          <Typography variant="body2" sx={{ color: getStatusColor(), fontWeight: 'bold' }}>
            {getStatusText()}
          </Typography>
          {onToggleExpanded && (
            <IconButton
              onClick={onToggleExpanded}
              size="small"
              sx={{ color: '#fff' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {/* Readiness indicators */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <ReadinessChip 
            label="Funding" 
            ready={readiness.funding}
            tooltip="Main ID, jackpot minimum, and distribution percentages"
          />
          <ReadinessChip 
            label="Timelock" 
            ready={readiness.timelock}
            tooltip="Target drawing block and drawing interval"
          />
          <ReadinessChip 
            label="Tickets" 
            ready={readiness.tickets}
            tooltip="Main ID and ticket multiplier"
          />
        </Box>

        {/* Summary */}
        <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.8rem' }}>
          {validation.summary}
        </Typography>

        {/* Expandable details */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Errors */}
            {validation.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>
                  <ErrorIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                  Errors ({validation.errors.length})
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {validation.errors.map((error, index) => (
                    <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <ErrorIcon sx={{ fontSize: '0.8rem', color: '#f44336' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={error}
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          color: '#f44336'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                  <WarningIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                  Warnings ({validation.warnings.length})
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {validation.warnings.map((warning, index) => (
                    <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 20 }}>
                        <WarningIcon sx={{ fontSize: '0.8rem', color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={warning}
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          color: '#ff9800'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Calculated values */}
            {validation.calculatedDrawingBlock && (
              <Box sx={{ mt: 2, p: 1, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                  <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                  Calculated Values
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.8rem' }}>
                  Drawing Block: {validation.calculatedDrawingBlock}
                </Typography>
              </Box>
            )}

            {/* Missing parameters */}
            {validation.missing && validation.missing.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>
                  Missing Required Parameters ({validation.missing.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {validation.missing.map((param, index) => (
                    <Chip
                      key={index}
                      label={param}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Invalid parameters */}
            {validation.invalid && validation.invalid.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>
                  Invalid Parameters ({validation.invalid.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {validation.invalid.map((param, index) => (
                    <Chip
                      key={index}
                      label={param}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Card>
  );
});

export default ParameterValidationStatus; 