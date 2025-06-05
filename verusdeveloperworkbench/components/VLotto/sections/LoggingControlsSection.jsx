/**
 * VLotto Logging Controls Section
 * 
 * Provides controls for downloading, clearing, and monitoring the automation logs
 * Essential for production monitoring and debugging
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
  Divider,
  Grid,
  Switch,
  TextField,
  Typography,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getVLottoLogger } from '../utils/vlottoLogger.js';

const LoggingControlsSection = ({ 
  expanded,
  onToggleExpanded
}) => {
  const [logger] = useState(() => getVLottoLogger());
  const [logStats, setLogStats] = useState({
    totalEntries: 0,
    sessionId: '',
    startTime: '',
    lastLogTime: '',
    bufferSize: 0
  });
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(true);
  const [logPreview, setLogPreview] = useState('');

  // Update log statistics
  const updateLogStats = () => {
    if (logger) {
      setLogStats({
        totalEntries: logger.logBuffer?.length || 0,
        sessionId: logger.sessionId || 'Unknown',
        startTime: logger.logBuffer?.[0]?.split(']')[0]?.replace('[', '') || 'N/A',
        lastLogTime: logger.logBuffer?.[logger.logBuffer.length - 1]?.split(']')[0]?.replace('[', '') || 'N/A',
        bufferSize: (JSON.stringify(logger.logBuffer || []).length / 1024).toFixed(2)
      });

      // Get preview of last 10 log entries
      const lastEntries = (logger.logBuffer || []).slice(-10);
      setLogPreview(lastEntries.join('\n'));
    }
  };

  // Update stats periodically
  useEffect(() => {
    updateLogStats();
    const interval = setInterval(updateLogStats, 5000);
    return () => clearInterval(interval);
  }, [logger]);

  // Download complete log file
  const handleDownloadLogs = () => {
    try {
      if (logger) {
        logger.downloadLog();
        updateLogStats();
      }
    } catch (error) {
      console.error('Error downloading logs:', error);
    }
  };

  // Download just fund movement audit
  const handleDownloadFundingAudit = () => {
    try {
      if (logger && logger.logBuffer) {
        // Filter for funding-related entries
        const fundingEntries = logger.logBuffer.filter(entry => 
          entry.includes('💰 BALANCE') || 
          entry.includes('📊 FUNDING') ||
          entry.includes('💸 PAYOUT') ||
          entry.includes('✅ SEND') ||
          entry.includes('🔄 SEND')
        );

        const auditContent = [
          '='.repeat(80),
          'VLotto Fund Movement Audit',
          `Generated: ${new Date().toISOString()}`,
          `Session: ${logger.sessionId}`,
          '='.repeat(80),
          '',
          ...fundingEntries
        ].join('\n');

        const blob = new Blob([auditContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vlotto_funding_audit_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading funding audit:', error);
    }
  };

  // Download performance statistics
  const handleDownloadPerformanceStats = () => {
    try {
      if (logger && logger.logBuffer) {
        // Extract phase timing information
        const phaseEntries = logger.logBuffer.filter(entry => 
          entry.includes('🔄 PHASE START') || 
          entry.includes('✅ PHASE END') ||
          entry.includes('❌ PHASE END') ||
          entry.includes('⚠️ PHASE END')
        );

        const statsContent = [
          '='.repeat(80),
          'VLotto Performance Statistics',
          `Generated: ${new Date().toISOString()}`,
          `Session: ${logger.sessionId}`,
          '='.repeat(80),
          '',
          'Phase Timing Information:',
          '',
          ...phaseEntries,
          '',
          '='.repeat(80),
          `Total Log Entries: ${logger.logBuffer.length}`,
          `Buffer Size: ${(JSON.stringify(logger.logBuffer).length / 1024).toFixed(2)} KB`
        ].join('\n');

        const blob = new Blob([statsContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vlotto_performance_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading performance stats:', error);
    }
  };

  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      try {
        if (logger) {
          logger.clearLogs();
          updateLogStats();
          setLogPreview('');
        }
      } catch (error) {
        console.error('Error clearing logs:', error);
      }
    }
  };

  // Toggle logging on/off
  const handleToggleLogging = (enabled) => {
    setIsLoggingEnabled(enabled);
    if (logger) {
      logger.isLogging = enabled;
      if (enabled) {
        logger.writeToLog('📝 LOGGING ENABLED by user');
      } else {
        logger.writeToLog('🔇 LOGGING DISABLED by user');
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
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Automation Logging & Audit Controls
          </Typography>
          <Chip 
            label={`${logStats.totalEntries} entries`} 
            size="small" 
            color={logStats.totalEntries > 0 ? 'success' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip 
            label={isLoggingEnabled ? 'Logging ON' : 'Logging OFF'} 
            size="small" 
            color={isLoggingEnabled ? 'success' : 'error'}
          />
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 2 }}>
        {/* Logging Status */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            📊 Logging Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Session ID: <span style={{ color: '#90caf9' }}>{logStats.sessionId}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Total Entries: <span style={{ color: '#4caf50' }}>{logStats.totalEntries}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Buffer Size: <span style={{ color: '#ff9800' }}>{logStats.bufferSize} KB</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Started: <span style={{ color: '#90caf9' }}>{logStats.startTime}</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Last Entry: <span style={{ color: '#90caf9' }}>{logStats.lastLogTime}</span>
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isLoggingEnabled}
                    onChange={(e) => handleToggleLogging(e.target.checked)}
                    color="success"
                  />
                }
                label="Enable Logging"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Download Controls */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            📥 Download Reports
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadLogs}
                color="primary"
                fullWidth
                disabled={logStats.totalEntries === 0}
              >
                Complete Log
              </Button>
              <Typography variant="caption" sx={{ display: 'block', color: '#aaa', mt: 0.5 }}>
                All automation events & phases
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={handleDownloadFundingAudit}
                color="success"
                fullWidth
                disabled={logStats.totalEntries === 0}
              >
                Fund Audit
              </Button>
              <Typography variant="caption" sx={{ display: 'block', color: '#aaa', mt: 0.5 }}>
                All balance & fund movements
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={handleDownloadPerformanceStats}
                color="info"
                fullWidth
                disabled={logStats.totalEntries === 0}
              >
                Performance Stats
              </Button>
              <Typography variant="caption" sx={{ display: 'block', color: '#aaa', mt: 0.5 }}>
                Phase timing & statistics
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Log Preview */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 2 }}>
            👁️ Recent Log Entries (Last 10)
          </Typography>
          <TextField
            multiline
            rows={8}
            value={logPreview}
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true,
              sx: { 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                backgroundColor: '#0a0a0a',
                color: '#00ff00'
              }
            }}
            placeholder="No log entries yet..."
          />
        </Card>

        {/* Management Controls */}
        <Card variant="outlined" sx={{ backgroundColor: '#2a1a1a', p: 2, border: '1px solid #f44336' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f44336', mb: 2 }}>
            🗑️ Log Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleClearLogs}
            color="error"
            disabled={logStats.totalEntries === 0}
          >
            Clear All Logs
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: '#f44336', mt: 1 }}>
            ⚠️ This will permanently delete all logged data
          </Typography>
        </Card>

        {/* Usage Information */}
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>
            ℹ️ Logging Information
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
            • <strong>Complete Log</strong>: All automation events, phases, and operations with timestamps
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
            • <strong>Fund Audit</strong>: Balance checks, fund movements, and transaction confirmations
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
            • <strong>Performance Stats</strong>: Phase timing data for optimization analysis
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa' }}>
            • Logs are stored in browser localStorage and can be downloaded for analysis
          </Typography>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
};

export default LoggingControlsSection; 