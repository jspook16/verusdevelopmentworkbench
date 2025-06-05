import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  ButtonGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AutomationProgressSection = React.memo(function AutomationProgressSection({
  ticketGeneration,
  drawingSystem,
  automationProgressExpanded,
  setAutomationProgressExpanded
}) {
  const [sortCriteria, setSortCriteria] = useState('matches');

  // Sort tickets based on criteria
  const sortTickets = (tickets, criteria) => {
    return [...tickets].sort((a, b) => {
      if (criteria === 'matches') {
        const aMatches = a.matchingPositions?.length || 0;
        const bMatches = b.matchingPositions?.length || 0;
        if (aMatches !== bMatches) return bMatches - aMatches; // Descending
        // Tie-breaker: score
        const aScore = a.score || 0;
        const bScore = b.score || 0;
        if (aScore !== bScore) return bScore - aScore; // Descending
        // Final tie-breaker: ticket ID
        return (a.id || 0) - (b.id || 0); // Ascending
      } else if (criteria === 'score') {
        const aScore = a.score || 0;
        const bScore = b.score || 0;
        if (aScore !== bScore) return bScore - aScore; // Descending
        // Tie-breaker: matches
        const aMatches = a.matchingPositions?.length || 0;
        const bMatches = b.matchingPositions?.length || 0;
        if (aMatches !== bMatches) return bMatches - aMatches; // Descending
        // Final tie-breaker: ticket ID
        return (a.id || 0) - (b.id || 0); // Ascending
      }
      return 0;
    });
  };

  return (
    <Accordion
      expanded={automationProgressExpanded}
      onChange={() => setAutomationProgressExpanded(!automationProgressExpanded)}
      sx={{ mb: 3, backgroundColor: '#1e1e1e', border: '1px solid #333' }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
        sx={{ backgroundColor: '#2a2a2a', color: '#fff' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Dynamic phase indicator and title */}
          {ticketGeneration.pendingCommitments.length > 0 && ticketGeneration.pendingRegistrations.length === 0 && ticketGeneration.tickets.length === 0 && !drawingSystem.drawingResults && (
            <>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#ff9800',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🏷️ Phase 1: Ticket Commitments ({ticketGeneration.pendingCommitments.length})
              </Typography>
            </>
          )}
          {ticketGeneration.pendingRegistrations.length > 0 && ticketGeneration.tickets.length === 0 && !drawingSystem.drawingResults && (
            <>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#2196f3',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🆔 Phase 2: Ticket Registration ({ticketGeneration.pendingRegistrations.length})
              </Typography>
            </>
          )}
          {ticketGeneration.tickets.length > 0 && !drawingSystem.drawingResults && (
            <>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#4caf50',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🎫 Phase 3: Generated Tickets ({ticketGeneration.tickets.length})
              </Typography>
            </>
          )}
          {drawingSystem.drawingResults && (
            <>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#ffd700',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🏆 Phase 4: Drawing Results ({drawingSystem.drawingResults.allTickets?.length || ticketGeneration.tickets.length})
              </Typography>
            </>
          )}
          {/* Default title when no phase is active */}
          {ticketGeneration.pendingCommitments.length === 0 && 
           ticketGeneration.pendingRegistrations.length === 0 && 
           ticketGeneration.tickets.length === 0 && 
           !drawingSystem.drawingResults && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#c0c0c0' }}>
              🔄 Automation Progress
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        {/* Phase 1: Ticket Commitments */}
        {ticketGeneration.pendingCommitments.length > 0 && ticketGeneration.pendingRegistrations.length === 0 && ticketGeneration.tickets.length === 0 && !drawingSystem.drawingResults && (
          <Box>
            <Typography variant="body2" sx={{ color: '#c0c0c0', mb: 2, fontStyle: 'italic' }}>
              Creating ticket commitments for lottery tickets...
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {ticketGeneration.pendingCommitments.map((commitment, index) => (
                <Card key={index} sx={{ mb: 1, backgroundColor: '#2a2a2a', border: '1px solid #ff9800' }}>
                  <CardContent sx={{ py: 1, px: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Ticket {commitment.ticketNumber}: {commitment.commitmentResult.txid}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Phase 2: Ticket Registration */}
        {ticketGeneration.pendingRegistrations.length > 0 && ticketGeneration.tickets.length === 0 && !drawingSystem.drawingResults && (
          <Box>
            <Typography variant="body2" sx={{ color: '#c0c0c0', mb: 2, fontStyle: 'italic' }}>
              Registering ticket identities on the blockchain...
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {ticketGeneration.pendingRegistrations.map((registration, index) => (
                <Card key={index} sx={{ mb: 1, backgroundColor: '#2a2a2a', border: '1px solid #2196f3' }}>
                  <CardContent sx={{ py: 1, px: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Ticket {registration.ticketNumber}: {registration.registrationResult}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Phase 3: Generated Tickets */}
        {ticketGeneration.tickets.length > 0 && !drawingSystem.drawingResults && (
          <Box>
            <Typography variant="body2" sx={{ color: '#c0c0c0', mb: 2, fontStyle: 'italic' }}>
              Tickets successfully created and ready for marketplace...
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {ticketGeneration.tickets.map((ticket) => {
                const isRevoked = ticketGeneration.revokedTickets.includes(ticket.name);
                return (
                  <Card key={ticket.id} sx={{ 
                    mb: 1, 
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #555'
                  }}>
                    <CardContent sx={{ py: 1, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        {/* Ticket Name */}
                        <Box sx={{ minWidth: 'fit-content' }}>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 'bold', 
                            color: '#fff'
                          }}>
                            {ticket.name}
                          </Typography>
                        </Box>
                        
                        {/* Playing Number */}
                        {ticket.playingNumber && (
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'monospace', 
                              color: '#4caf50', 
                              fontSize: '0.875rem'
                            }}>
                              <span style={{ color: '#90caf9', fontWeight: 'bold' }}>Playing Number:</span> {ticket.playingNumber}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Registration TX */}
                        <Box sx={{ minWidth: 'fit-content' }}>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            color: '#fff', 
                            fontSize: '0.875rem'
                          }}>
                            <span style={{ color: '#90caf9', fontWeight: 'bold' }}>Reg TX:</span> {ticket.registrationTxId}
                          </Typography>
                        </Box>
                        
                        {/* Status indicators */}
                        <Box sx={{ minWidth: 'fit-content', display: 'flex', gap: 1, alignItems: 'center' }}>
                          {/* UNSOLD indicator for revoked tickets */}
                          {isRevoked && (
                            <Chip
                              label="UNSOLD"
                              color="error"
                              size="small"
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                height: '24px',
                                '& .MuiChip-label': { 
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          )}
                          
                          {/* SOLD indicator for active tickets */}
                          {!isRevoked && (
                            <Chip
                              label="SOLD"
                              color="success"
                              size="small"
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                height: '24px',
                                '& .MuiChip-label': { 
                              fontWeight: 'bold', 
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          )}
                          
                          {/* Error indicator if present */}
                          {ticket.errorFinalizing && (
                            <Chip
                              label="ERROR"
                              color="error"
                              size="small"
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                height: '24px',
                                '& .MuiChip-label': { 
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Phase 4: Drawing Results */}
        {drawingSystem.drawingResults && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#c0c0c0', fontStyle: 'italic' }}>
                Drawing complete! Results showing matches and scores for all tickets...
                {drawingSystem.blockchainVerifiedWinner && (
                  <Typography component="span" sx={{ color: '#4caf50', fontWeight: 'bold', ml: 1 }}>
                    ✅ Blockchain Verified
                  </Typography>
                )}
              </Typography>
              
              {/* Sort Controls */}
              <ButtonGroup size="small" variant="outlined">
                <Button
                  onClick={() => setSortCriteria('matches')}
                  variant={sortCriteria === 'matches' ? 'contained' : 'outlined'}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Sort by Matches
                </Button>
                <Button
                  onClick={() => setSortCriteria('score')}
                  variant={sortCriteria === 'score' ? 'contained' : 'outlined'}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Sort by Score
                </Button>
              </ButtonGroup>
            </Box>

            {/* Winner Display */}
            {drawingSystem.blockchainVerifiedWinner && (
              <Box mb={2}>
                {drawingSystem.blockchainVerifiedWinner.winner ? (
                  <Card sx={{ backgroundColor: '#1a4d1a', border: '2px solid #4caf50' }}>
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                        🏆 BLOCKCHAIN-VERIFIED WINNER
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
                        {drawingSystem.blockchainVerifiedWinner.winner.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#90caf9', mt: 1 }}>
                        Score: {drawingSystem.blockchainVerifiedWinner.winner.score} | 
                        Matches: {drawingSystem.blockchainVerifiedWinner.winner.matchingPositions?.length || 0} |
                        Playing Number: {drawingSystem.blockchainVerifiedWinner.winner.playingNumber?.substring(0, 16)}...
                      </Typography>
                      {drawingSystem.verificationResults && drawingSystem.verificationResults.isValid && (
                        <Typography variant="body2" sx={{ color: '#4caf50', mt: 1, fontWeight: 'bold' }}>
                          ✅ All 5 verification steps passed
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ) : drawingSystem.blockchainVerifiedWinner.isJackpotRollover ? (
                  <Card sx={{ backgroundColor: '#4d1a1a', border: '2px solid #f44336' }}>
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                        🎰 JACKPOT ROLLOVER
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ffcdd2' }}>
                        No valid qualifying tickets found - all top tickets were revoked or fraudulent
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Card sx={{ backgroundColor: '#3d3d1a', border: '2px solid #ff9800' }}>
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                        📊 No Winner
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff3cd' }}>
                        No valid qualifying tickets found
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {/* Fraud Detection Alert */}
            {drawingSystem.fraudulentTickets && drawingSystem.fraudulentTickets.length > 0 && (
              <Box mb={2}>
                <Card sx={{ backgroundColor: '#4d1a1a', border: '2px solid #f44336' }}>
                  <CardContent sx={{ py: 2, px: 3 }}>
                    <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>
                      🚨 FRAUD DETECTION ALERT
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffcdd2', mb: 2 }}>
                      {drawingSystem.fraudulentTickets.length} fraudulent ticket(s) detected and excluded from results
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {drawingSystem.fraudulentTickets.map((fraudTicket, index) => (
                        <Card key={index} sx={{ mb: 1, backgroundColor: '#3a1e1e', border: '1px solid #f44336' }}>
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'monospace', 
                              color: '#ff9999', 
                              fontWeight: 'bold'
                            }}>
                              {fraudTicket.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffcdd2', fontSize: '0.75rem' }}>
                              Reason: {fraudTicket.reason}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#f44336', fontSize: '0.75rem' }}>
                              Failed Step: {fraudTicket.failedStep}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* All Tickets with Results */}
            <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 'bold', mb: 1 }}>
              📋 Complete Results ({drawingSystem.drawingResults.allTickets?.length || ticketGeneration.tickets.length} tickets)
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {sortTickets(drawingSystem.drawingResults.allTickets || ticketGeneration.tickets, sortCriteria).map((ticket, index) => {
                const isWinner = drawingSystem.drawingResults.winner && 
                  (ticket.name === drawingSystem.drawingResults.winner.name || 
                   ticket.id === drawingSystem.drawingResults.winner.id ||
                   (ticket === drawingSystem.drawingResults.winner));
                const isRevoked = ticket.isRevoked || ticketGeneration.revokedTickets.includes(ticket.name);
                const matchCount = ticket.matchingPositions?.length || 0;
                const score = ticket.score || 0;
                
                return (
                  <Card key={ticket.id || ticket.name} sx={{ 
                    mb: 1, 
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #555'
                  }}>
                    <CardContent sx={{ py: 1, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        {/* Ticket Name */}
                        <Box sx={{ minWidth: 'fit-content' }}>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 'bold', 
                            color: '#fff'
                          }}>
                            {ticket.name}
                          </Typography>
                        </Box>
                        
                        {/* Playing Number */}
                        {(ticket.playingNumber || ticket.hash) && (
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'monospace', 
                              color: '#4caf50', 
                              fontSize: '0.875rem'
                            }}>
                              <span style={{ color: '#90caf9', fontWeight: 'bold' }}>Playing Number:</span> {ticket.playingNumber || ticket.hash}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Matches and Score Chips */}
                        <Box sx={{ minWidth: 'fit-content', display: 'flex', gap: 1, alignItems: 'center' }}>
                          {matchCount > 0 && (
                            <Chip 
                              label={`Matches: ${matchCount}`}
                              color="success"
                              size="small"
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                height: '24px',
                                '& .MuiChip-label': { 
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          )}
                          <Chip 
                            label={`Score: ${score}`}
                            color="secondary"
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold',
                              height: '24px',
                              '& .MuiChip-label': { 
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                          
                          {/* UNSOLD/SOLD indicator */}
                            <Chip 
                            label={isRevoked ? 'UNSOLD' : 'SOLD'}
                            color={isRevoked ? 'error' : 'success'}
                              size="small"
                            sx={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold',
                              height: '24px',
                              '& .MuiChip-label': { 
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }
                            }}
                            />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
});

export default AutomationProgressSection; 