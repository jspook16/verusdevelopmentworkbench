import React, { useState, useContext } from 'react';
import {
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import WarningIcon from '@mui/icons-material/Warning';
import { NodeContext } from '../../../contexts/NodeContext';
import { analyzeTickets, performBulkCleanup, CLEANUP_CONFIG } from '../../../utils/bulkTicketCleanup';

const TicketCleanupSection = React.memo(function TicketCleanupSection({
  expanded,
  setExpanded
}) {
  const { sendCommand } = useContext(NodeContext);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResults, setCleanupResults] = useState(null);
  const [dryRunMode, setDryRunMode] = useState(true);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeTickets(sendCommand);
      setAnalysis(result);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    setError(null);
    setCleanupResults(null);
    
    try {
      const result = await performBulkCleanup(sendCommand, {
        dryRunMode,
        maxBatchSize: 50, // Conservative batch size
      });
      setCleanupResults(result);
    } catch (err) {
      setError(`Cleanup failed: ${err.message}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    const { totalIdentities, totalTickets, regularIdentities, ticketCategories, recommendations } = analysis;

    return (
      <Card sx={{ mt: 2, backgroundColor: '#2a2a2a' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
            📊 Analysis Results
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`Total IDs: ${totalIdentities}`} 
              color="info" 
              variant="outlined" 
            />
            <Chip 
              label={`Ticket IDs: ${totalTickets}`} 
              color="warning" 
              variant="outlined" 
            />
            <Chip 
              label={`Regular IDs: ${regularIdentities}`} 
              color="success" 
              variant="outlined" 
            />
          </Box>

          <Typography variant="subtitle2" sx={{ color: '#ddd', mb: 1 }}>
            Ticket Categories:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Block-based tickets" 
                secondary={`${ticketCategories.blockBased.length} tickets (e.g., "570150_1of6.shylock@")`}
                primaryTypographyProps={{ color: '#fff' }}
                secondaryTypographyProps={{ color: '#aaa' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Numbered tickets" 
                secondary={`${ticketCategories.numbered.length} tickets (e.g., "575712_1of6@")`}
                primaryTypographyProps={{ color: '#fff' }}
                secondaryTypographyProps={{ color: '#aaa' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Keyword-based tickets" 
                secondary={`${ticketCategories.keywordBased.length} tickets (containing "vlotto", "ticket", etc.)`}
                primaryTypographyProps={{ color: '#fff' }}
                secondaryTypographyProps={{ color: '#aaa' }}
              />
            </ListItem>
          </List>

          {recommendations.length > 0 && (
            <>
              <Divider sx={{ my: 2, bgcolor: '#444' }} />
              <Typography variant="subtitle2" sx={{ color: '#ddd', mb: 1 }}>
                🎯 Recommendations:
              </Typography>
              {recommendations.map((rec, index) => (
                <Alert 
                  key={index}
                  severity={rec.priority === 'high' ? 'warning' : 'info'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2">
                    <strong>{rec.reason}</strong>
                  </Typography>
                  <Typography variant="caption">
                    Expected improvement: {rec.estimatedImprovement}
                  </Typography>
                </Alert>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCleanupResults = () => {
    if (!cleanupResults) return null;

    return (
      <Card sx={{ mt: 2, backgroundColor: '#2a2a2a' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
            {cleanupResults.dryRun ? '🔍 Dry Run Results' : '✅ Cleanup Results'}
          </Typography>
          
          <Alert 
            severity={cleanupResults.success ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {cleanupResults.message}
          </Alert>

          {cleanupResults.dryRun && cleanupResults.ticketsToRevoke && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#ddd', mb: 1 }}>
                Tickets that would be revoked:
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#1a1a1a', p: 1, borderRadius: 1 }}>
                {cleanupResults.ticketsToRevoke.slice(0, 20).map((ticket, index) => (
                  <Typography key={index} variant="body2" sx={{ color: '#ccc', fontFamily: 'monospace' }}>
                    {ticket}
                  </Typography>
                ))}
                {cleanupResults.ticketsToRevoke.length > 20 && (
                  <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                    ... and {cleanupResults.ticketsToRevoke.length - 20} more
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {cleanupResults.results && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Chip 
                  label={`Successful: ${cleanupResults.results.successful}`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`Failed: ${cleanupResults.results.failed}`} 
                  color="error" 
                  size="small" 
                />
              </Box>
              
              {cleanupResults.results.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#ddd' }}>
                    Errors:
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: '#1a1a1a', p: 1, borderRadius: 1 }}>
                    {cleanupResults.results.errors.map((error, index) => (
                      <Typography key={index} variant="body2" sx={{ color: '#ff6b6b' }}>
                        {error}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={(e, isExpanded) => setExpanded(isExpanded)}
      sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteSweepIcon sx={{ color: '#ff9800' }} />
          <Typography variant="h6">
            VLotto Ticket Cleanup
          </Typography>
          {analysis && (
            <Chip 
              label={`${analysis.totalTickets} tickets found`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon />
              <Typography variant="body2">
                This tool helps manage thousands of VLotto test tickets that can slow down the application.
                Use with caution - revocation operations are irreversible on the blockchain.
              </Typography>
            </Box>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              sx={{ minWidth: 140 }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Tickets'}
            </Button>

            {analysis && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dryRunMode}
                      onChange={(e) => setDryRunMode(e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Dry Run Mode"
                  sx={{ color: '#fff' }}
                />

                <Button
                  variant="contained"
                  color={dryRunMode ? "info" : "warning"}
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleCleanup}
                  disabled={isCleaningUp || analysis.totalTickets === 0}
                  sx={{ minWidth: 140 }}
                >
                  {isCleaningUp ? 'Processing...' : (dryRunMode ? 'Preview Cleanup' : 'Execute Cleanup')}
                </Button>
              </>
            )}
          </Box>

          {(isAnalyzing || isCleaningUp) && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress sx={{ backgroundColor: '#333' }} />
              <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                {isAnalyzing ? 'Analyzing ticket patterns...' : 'Processing cleanup operations...'}
              </Typography>
            </Box>
          )}

          {renderAnalysisResults()}
          {renderCleanupResults()}

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#ddd', mb: 1 }}>
              ℹ️ How it works:
            </Typography>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              • Analysis identifies VLotto test tickets by pattern matching<br/>
              • Dry run mode shows what would be cleaned up without making changes<br/>
              • Actual cleanup revokes selected tickets from the blockchain<br/>
              • Operations are rate-limited for safety (1 second between revocations)
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

export default TicketCleanupSection; 