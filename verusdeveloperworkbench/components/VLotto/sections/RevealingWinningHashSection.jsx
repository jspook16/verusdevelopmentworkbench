import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress
} from '@mui/material';
import { VDXF_KEYS } from '../utils/constants';
import { 
  extractVLottoData, 
  verifyMessage, 
  verifyRegistrationTransaction,
  extractLatestVLottoDataFromHistory,
  extractOldestVLottoDataFromHistory,
  extractAllVLottoDataFromHistory
} from '../utils/cryptoHelpers';

const RevealingWinningHashSection = React.memo(function RevealingWinningHashSection({
  ticketGeneration,
  drawingSystem,
  sendCommand
}) {
  const [isRevealingWinner, setIsRevealingWinner] = useState(false);
  const [winnerRevealed, setWinnerRevealed] = useState(false);
  const [isVerifyingWinner, setIsVerifyingWinner] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationSteps, setVerificationSteps] = useState({
    identityFound: 'pending',
    registrationTxid: 'pending',
    ticketSignature: 'pending', 
    proofguardSignature: 'pending',
    publicAudit: 'pending',
    localAudit: 'pending'
  });
  
  // New state for blockchain-verified winner selection
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState('');
  const [ticketProgress, setTicketProgress] = useState({ current: 0, total: 0 });
  const [topFiveTickets, setTopFiveTickets] = useState([]);
  const [blockchainVerifiedWinner, setBlockchainVerifiedWinner] = useState(null);
  const [fraudulentTickets, setFraudulentTickets] = useState([]);
  
  // New state for tracking updated tickets for glow effect
  const [updatedTickets, setUpdatedTickets] = useState(new Set());
  
  // Determine how many digits to show (based on hash length or default to 64)
  const totalDigits = drawingSystem.drawingHash ? Math.min(drawingSystem.drawingHash.length, 64) : 64;
  
  // Blockchain-verified winner selection process
  useEffect(() => {
    const checkAdvancedDrawingResults = () => {
      if (drawingSystem.drawingResults && drawingSystem.topFiveTickets && !blockchainVerifiedWinner) {
        console.log('🔍 Using advanced drawing system results...');
        
        setTopFiveTickets(drawingSystem.topFiveTickets);
        setFraudulentTickets(drawingSystem.fraudulentTickets || []);
          
          setBlockchainVerifiedWinner({
          winner: drawingSystem.blockchainVerifiedWinner?.winner || null,
          isJackpotRollover: drawingSystem.blockchainVerifiedWinner?.isJackpotRollover || false,
          topFive: drawingSystem.topFiveTickets,
          totalTicketsVerified: drawingSystem.blockchainVerifiedWinner?.totalTicketsVerified || 0,
          validTicketsFound: drawingSystem.topFiveTickets.length,
          fraudulentTicketsFound: (drawingSystem.fraudulentTickets || []).length,
            verifiedAt: new Date().toISOString()
          });
          
        setSelectionStatus('✅ Blockchain verification complete using advanced drawing system!');
      }
    };
    
    checkAdvancedDrawingResults();
  }, [drawingSystem.drawingResults, drawingSystem.topFiveTickets, drawingSystem.blockchainVerifiedWinner, blockchainVerifiedWinner]);
  
  // Auto-verify winner when blockchain selection is complete
  useEffect(() => {
    const checkVerificationFromAdvancedSystem = () => {
      if (blockchainVerifiedWinner?.winner && !isVerifyingWinner && !verificationResults) {
        console.log('🔍 Using verification results from advanced drawing system...');
        
        if (drawingSystem.verificationResults) {
          setVerificationResults(drawingSystem.verificationResults);
          setVerificationSteps(drawingSystem.verificationSteps || {
            identityFound: 'success',
            registrationTxid: 'success',
            ticketSignature: 'success',
            proofguardSignature: 'success',
            publicAudit: 'success',
            localAudit: 'success'
          });
          setVerificationStatus('✅ Verification completed by advanced drawing system!');
        }
      }
    };
    
    checkVerificationFromAdvancedSystem();
  }, [blockchainVerifiedWinner?.winner, isVerifyingWinner, verificationResults, drawingSystem.verificationResults]);

  // Trigger winner reveal animation when drawing completes
  useEffect(() => {
    if (drawingSystem.drawingResults && !isRevealingWinner && !winnerRevealed) {
      const startWinnerReveal = async () => {
        setIsRevealingWinner(true);
        
        // Simulate smooth reveal animation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setWinnerRevealed(true);
        setIsRevealingWinner(false);
      };
      
      startWinnerReveal();
    }
  }, [drawingSystem.drawingResults, isRevealingWinner, winnerRevealed]);

  // Monitor live drawing progress for blockchain verification display
  useEffect(() => {
    if (drawingSystem.isDrawing && drawingSystem.drawingHash && !drawingSystem.drawingResults) {
      setIsSelectingWinner(true);
      setSelectionStatus('🔍 Performing blockchain verification with live updates...');
    }
    else if (drawingSystem.drawingResults) {
      setIsSelectingWinner(false);
    }
  }, [drawingSystem.isDrawing, drawingSystem.drawingHash, drawingSystem.drawingResults]);

  // Real-time top 5 updates directly from advanced drawing system
  useEffect(() => {
    if (drawingSystem.topFiveTickets) {
      const previousTicketNames = new Set(topFiveTickets.map(t => t.name));
      const newTicketNames = new Set(drawingSystem.topFiveTickets.map(t => t.name));
      
      // Find newly added tickets
      const newlyAdded = drawingSystem.topFiveTickets.filter(ticket => 
        ticket && !previousTicketNames.has(ticket.name)
      );
      
      if (newlyAdded.length > 0) {
        const newlyAddedNames = new Set(newlyAdded.map(t => t.name));
        setUpdatedTickets(newlyAddedNames);
        
        // Remove glow effect after animation duration
        setTimeout(() => {
          setUpdatedTickets(new Set());
        }, 500);
      }
      
      setTopFiveTickets(drawingSystem.topFiveTickets);
    }
  }, [drawingSystem.topFiveTickets]);

  // Real-time fraudulent tickets updates
  useEffect(() => {
    if (drawingSystem.fraudulentTickets) {
      setFraudulentTickets(drawingSystem.fraudulentTickets);
    }
  }, [drawingSystem.fraudulentTickets]);

  // Real-time progress updates from advanced drawing system
  useEffect(() => {
    if (drawingSystem.verificationProgress) {
      setTicketProgress(drawingSystem.verificationProgress);
    }
  }, [drawingSystem.verificationProgress]);

  // Real-time verification steps updates from advanced drawing system
  useEffect(() => {
    if (drawingSystem.verificationSteps) {
      console.log('🔄 Verification steps updated:', drawingSystem.verificationSteps);
      setVerificationSteps(drawingSystem.verificationSteps);
    }
  }, [drawingSystem.verificationSteps]);

  // Real-time verification status updates
  useEffect(() => {
    if (drawingSystem.verificationStatus) {
      setVerificationStatus(drawingSystem.verificationStatus);
    }
  }, [drawingSystem.verificationStatus]);

  // Update selection status with current ticket being verified
  useEffect(() => {
    if (drawingSystem.currentTicketBeingVerified && drawingSystem.isDrawing) {
      setSelectionStatus(`🔍 Verifying: ${drawingSystem.currentTicketBeingVerified}`);
    }
  }, [drawingSystem.currentTicketBeingVerified, drawingSystem.isDrawing]);

  // Reset states when new drawing starts
  useEffect(() => {
    if (!drawingSystem.drawingResults) {
      setIsRevealingWinner(false);
      setWinnerRevealed(false);
      setIsVerifyingWinner(false);
      setVerificationResults(null);
      setVerificationStatus('');
      setVerificationSteps({
        identityFound: 'pending',
        registrationTxid: 'pending',
        ticketSignature: 'pending',
        proofguardSignature: 'pending',
        publicAudit: 'pending',
        localAudit: 'pending'
      });
      
      // Reset blockchain selection states
      setIsSelectingWinner(false);
      setSelectionStatus('');
      setTicketProgress({ current: 0, total: 0 });
      setTopFiveTickets([]);
      setBlockchainVerifiedWinner(null);
      setFraudulentTickets([]);
    }
  }, [drawingSystem.drawingResults]);

  // Helper function to get chip color and icon based on step status
  const getStepDisplay = (stepStatus) => {
    switch (stepStatus) {
      case 'pending':
        return { color: 'default', icon: '⏳', pulse: false };
      case 'verifying':
        return { color: 'warning', icon: '🔄', pulse: true };
      case 'success':
        return { color: 'success', icon: '✓', pulse: false };
      case 'error':
        return { color: 'error', icon: '✗', pulse: false };
      default:
        return { color: 'default', icon: '⏳', pulse: false };
    }
  };

  // Helper function to get failed verification step display
  const getFailedStepDisplay = (failedStep) => {
    switch (failedStep) {
      case 'registration':
        return { label: 'Registration TXID', color: 'error' };
      case 'ticket_signature':
        return { label: 'Ticket Signature', color: 'error' };
      case 'proofguard_signature':
        return { label: 'Proofguard Signature', color: 'error' };
      case 'playing_number_integrity':
        return { label: 'Proofguard Signature', color: 'error' };
      case 'public_audit':
        return { label: 'Public Audit', color: 'error' };
      case 'verification_error':
        return { label: 'Verification Error', color: 'error' };
      case 'local_audit':
        return { label: 'Local Audit', color: 'error' };
      default:
        return { label: 'Unknown Step', color: 'error' };
    }
  };
  
  const verificationStepLabels = {
    identityFound: 'Identity Found',
    registrationTxid: 'Registration TXID', 
    ticketSignature: 'Ticket Signature',
    proofguardSignature: 'Proofguard Signature',
    publicAudit: 'Public Audit',
    localAudit: 'Local Audit'
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#1a1a1a', borderRadius: 1, border: '1px solid #444' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#ffd700' }}>
          🎰 Revealing Winning Hash
        </Typography>
        
          <Typography variant="caption" sx={{ 
            color: !drawingSystem.isLoadingHash && drawingSystem.currentPosition >= 0 ? '#90caf9' : 'transparent',
            minWidth: '120px',
            textAlign: 'right'
          }}>
            {!drawingSystem.isLoadingHash && drawingSystem.currentPosition >= 0 
              ? `Progress: ${drawingSystem.revealedCharacters.length}/${totalDigits} characters`
              : ''
            }
          </Typography>
        </Box>

        {/* Individual Digit Boxes */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 0.5, 
          justifyContent: 'center',
          p: 2,
          backgroundColor: '#000',
          borderRadius: 1,
          border: '2px solid #ffd700',
          minHeight: '80px',
          alignItems: 'center'
        }}>
          {drawingSystem.isLoadingHash && (
            <Typography sx={{ color: '#90caf9', width: '100%', textAlign: 'center' }}>
              Fetching block hash...
            </Typography>
          )}
          
          {!drawingSystem.isLoadingHash && drawingSystem.revealedCharacters.length === 0 && drawingSystem.currentPosition === -1 && !drawingSystem.drawingHash && (
            <Typography sx={{ color: '#c0c0c0', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
              Awaiting drawing initiation...
            </Typography>
          )}

          {/* Show individual digit boxes when revealing or completed */}
          {(drawingSystem.revealedCharacters.length > 0 || drawingSystem.drawingHash) && (
            Array.from({ length: totalDigits }, (_, index) => {
              const isRevealed = index < drawingSystem.revealedCharacters.length;
              const isCurrentlySpinning = index === drawingSystem.currentPosition;
              const isCompleted = drawingSystem.drawingHash && drawingSystem.currentPosition === -1;
              
              let displayChar = '';
              if (isCompleted && drawingSystem.drawingHash) {
                displayChar = drawingSystem.drawingHash[index] || '';
              } else if (isRevealed) {
                displayChar = drawingSystem.revealedCharacters[index] || '';
              } else if (isCurrentlySpinning) {
                displayChar = drawingSystem.spinningChar || '?';
              } else {
                displayChar = '?';
              }

              return (
                <Box
                  key={index}
                  sx={{
                    width: { xs: '16px', sm: '20px', md: '24px' },
                    height: { xs: '24px', sm: '28px', md: '32px' },
                    border: '1px solid #444',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    fontWeight: 'bold',
                    backgroundColor: isRevealed || isCompleted ? '#333' : '#222',
                    color: isRevealed || isCompleted ? '#4caf50' : '#c0c0c0',
                    animation: isCurrentlySpinning ? 'pulse 0.5s infinite' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {displayChar}
                </Box>
              );
            })
          )}
        </Box>
        </Box>

      {/* Blockchain-Verified Winner Section - moved above Drawing Results */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#000', 
          borderRadius: 1, 
        border: '2px solid #90caf9',
        minHeight: '120px',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#90caf9' }}>
                🔗 Blockchain-Verified Winner Selection
              </Typography>
              
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ 
                color: '#c0c0c0', 
              fontStyle: 'italic',
              whiteSpace: 'nowrap'
              }}>
              {selectionStatus || 'Awaiting drawing initiation...'}
              </Typography>
              
              {ticketProgress.total > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
                <Box sx={{ width: '120px' }}>
                  <LinearProgress 
                    variant="determinate"
                    value={(ticketProgress.current / ticketProgress.total) * 100}
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#90caf9',
                        borderRadius: 3,
                      }
                    }} 
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#90caf9', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  {ticketProgress.current}/{ticketProgress.total} ({Math.round((ticketProgress.current / ticketProgress.total) * 100)}%)
                </Typography>
                </Box>
              )}
          </Box>
        </Box>
        
        {/* Winner Announcement */}
        <Card sx={{ 
          backgroundColor: '#2a2a2a', 
          border: '2px solid #ffd700', 
          minHeight: '120px'
        }}>
          <CardContent sx={{ py: 2, px: 3 }}>
            {/* Single row - Title, Ticket Name Box, and Chips inline */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
              {/* Left: Title */}
              <Typography variant="h5" sx={{ 
                color: '#ffd700', 
                              fontWeight: 'bold',
                flex: '0 0 auto'
                            }}>
                🏆 BLOCKCHAIN-VERIFIED WINNER
                            </Typography>
              
              {/* Center: Always-present ticket name box */}
              <Box sx={{ 
                backgroundColor: '#1a1a1a',
                border: '1px solid #555',
                borderRadius: 1,
                px: 2,
                py: 1,
                minWidth: '200px',
                textAlign: 'center',
                flex: '0 0 auto'
              }}>
                <Typography variant="h6" sx={{ 
                  color: blockchainVerifiedWinner?.isJackpotRollover ? '#f44336' : 
                         blockchainVerifiedWinner?.winner ? '#fff' : '#c0c0c0',
                  fontFamily: 'monospace'
                }}>
                  {blockchainVerifiedWinner?.isJackpotRollover ? 'JACKPOT ROLLOVER' :
                   blockchainVerifiedWinner?.winner ? blockchainVerifiedWinner.winner.name :
                   'Awaiting drawing initiation...'}
                            </Typography>
              </Box>
              
              {/* Right: Always-visible chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: '0 0 auto' }}>
                            <Chip 
                  label={`Matches: ${blockchainVerifiedWinner?.winner?.matchingPositions?.length || 0}`}
                  color={blockchainVerifiedWinner?.winner ? "success" : "default"}
                  size="medium"
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    height: '32px',
                    '& .MuiChip-label': { 
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }
                  }}
                            />
                            <Chip 
                  label={`Score: ${blockchainVerifiedWinner?.winner?.score || 0}`}
                  color={blockchainVerifiedWinner?.winner ? "secondary" : "default"}
                  size="medium"
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    height: '32px',
                    '& .MuiChip-label': { 
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }
                  }}
                />
                              <Chip 
                  label={blockchainVerifiedWinner?.winner ? 
                         (blockchainVerifiedWinner.winner.isRevoked ? 'UNSOLD' : 'SOLD') : 
                         'Status'}
                  color={blockchainVerifiedWinner?.winner ? 
                         (blockchainVerifiedWinner.winner.isRevoked ? 'error' : 'success') : 
                         'default'}
                  size="medium"
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    height: '32px',
                    '& .MuiChip-label': { 
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }
                  }}
                />
                          </Box>
                  </Box>
            
            {/* VLotto Information Section */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #555' }}>
              
              {/* VLotto Data Grid - 6 columns, each box spans 2 columns (half width) */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, maxWidth: '100%' }}>
                {/* Row 1, Columns 1-2: Registration TXID */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: 'span 2' }}>
                  <Typography variant="body2" sx={{ 
                    color: '#90caf9', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Registration TXID:
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: blockchainVerifiedWinner?.winner ? '#fff' : '#666',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      width: '100%'
                    }}>
                      {blockchainVerifiedWinner?.winner?.verification?.vlottoData?.registration_txid || 'Awaiting confirmation...'}
                    </Typography>
                </Box>
            </Box>

                {/* Row 1, Columns 3-4: Ticket Hash */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: 'span 2' }}>
              <Typography variant="body2" sx={{ 
                color: '#90caf9', 
                    fontWeight: 'bold',
                    textAlign: 'center'
              }}>
                    Ticket Hash:
              </Typography>
                  <Box sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: blockchainVerifiedWinner?.winner ? '#fff' : '#666',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      width: '100%'
                    }}>
                      {blockchainVerifiedWinner?.winner?.verification?.vlottoData?.ticket_validation?.signed_by_ticket_hash || 'Awaiting confirmation...'}
                      </Typography>
                  </Box>
                </Box>

                {/* Row 1, Columns 5-6: Proofguard Hash */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: 'span 2' }}>
                  <Typography variant="body2" sx={{ 
                    color: '#90caf9', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Proofguard Hash:
                        </Typography>
                  <Box sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: blockchainVerifiedWinner?.winner ? '#fff' : '#666',
                            fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      width: '100%'
                    }}>
                      {blockchainVerifiedWinner?.winner?.verification?.vlottoData?.proofguard_acknowledgement?.signed_by_proofguard_hash || 'Awaiting confirmation...'}
                          </Typography>
                  </Box>
                </Box>

                {/* Row 2, Columns 1-2: Playing Numbers */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: 'span 2' }}>
                  <Typography variant="body2" sx={{ 
                    color: '#90caf9', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Playing Numbers:
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: blockchainVerifiedWinner?.winner ? '#fff' : '#666',
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      width: '100%'
                    }}>
                      {blockchainVerifiedWinner?.winner?.verification?.vlottoData?.playing_number || 'Awaiting confirmation...'}
                    </Typography>
                          </Box>
                </Box>

                {/* Row 2, Columns 3-4: Ticket Signature */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: 'span 2' }}>
                  <Typography variant="body2" sx={{ 
                    color: '#90caf9', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Ticket Signature:
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: blockchainVerifiedWinner?.winner ? '#fff' : '#666',
                          fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      width: '100%'
                    }}>
                      {blockchainVerifiedWinner?.winner?.verification?.vlottoData?.ticket_validation?.signed_by_ticket_signature || 'Awaiting confirmation...'}
                        </Typography>
                  </Box>
                </Box>

                {/* Row 2, Columns 5-6: Proofguard Signature */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: 'span 2' }}>
                  <Typography variant="body2" sx={{ 
                    color: '#90caf9', 
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    Proofguard Signature:
                        </Typography>
                  <Box sx={{ 
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: blockchainVerifiedWinner?.winner ? '#fff' : '#666',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      width: '100%'
                    }}>
                      {blockchainVerifiedWinner?.winner?.verification?.vlottoData?.proofguard_acknowledgement?.signed_by_proofguard_signature || 'Awaiting confirmation...'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
                    </Box>
                  </CardContent>
                </Card>
      </Box>

      {/* Cryptographic Verification Section - moved above Drawing Results */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#000', 
        borderRadius: 1, 
        border: '2px solid #90caf9',
        minHeight: '120px',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#90caf9' }}>
            🔍 Cryptographic Verification of Winner
                  </Typography>
                  
          <Typography variant="body2" sx={{ 
            color: '#90caf9', 
            fontStyle: 'italic',
            textAlign: 'right',
            minWidth: '200px'
          }}>
            {verificationStatus || 'Verification will begin after winner selection...'}
          </Typography>
        </Box>

        {/* Progressive Verification Steps */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(verificationStepLabels).map(([stepKey, stepLabel]) => {
            const stepDisplay = getStepDisplay(verificationSteps[stepKey]);
                      return (
              <Chip 
                key={stepKey}
                label={`${stepDisplay.icon} ${stepLabel}`}
                color={stepDisplay.color}
                size="small"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  animation: stepDisplay.pulse ? 'pulse 1.5s infinite' : 'none',
                  transition: 'all 0.5s ease-in-out',
                  transform: verificationSteps[stepKey] === 'success' ? 'scale(1.05)' : 'scale(1)'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Drawing Results Section – always visible for stable layout */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#000', 
        borderRadius: 1, 
        border: '2px solid #ffd700',
        minHeight: '200px'
      }}>
        <Typography variant="h6" sx={{ color: '#ffd700', textAlign: 'center', mb: 3 }}>
          🏆 Drawing Results
        </Typography>
        
        {/* Always show Top 5 Leaderboard with placeholders */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#ffd700', mb: 1, textAlign: 'center' }}>
            Current Top 5 Leaderboard
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {Array.from({ length: 5 }, (_, index) => {
              const ticket = topFiveTickets[index];
              const isWinner = index === 0 && ticket && !ticket.isRevoked;
              const isUpdated = ticket && updatedTickets.has(ticket.name);
              return (
                <Card key={index} sx={{ 
                  backgroundColor: ticket ? (isWinner ? '#2d4016' : '#1a1a1a') : '#0a0a0a',
                  border: `1px solid ${ticket ? (isWinner ? '#ffd700' : '#444') : '#222'}`,
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  animation: isUpdated ? 'glowGreen 0.5s ease-in-out' : 'none',
                  boxShadow: isUpdated ? '0 0 20px rgba(76, 175, 80, 0.6)' : 'none',
                  transition: 'all 0.3s ease-in-out'
                }}>
                  <CardContent sx={{ 
                    py: 0, 
                    px: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%',
                    height: '32px',
                    '&:last-child': { pb: 0 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Typography variant="body2" sx={{ 
                        color: ticket ? (isWinner ? '#ffd700' : '#fff') : '#666',
                                fontWeight: 'bold',
                        minWidth: '30px',
                        fontSize: '0.875rem'
                              }}>
                        {ticket ? (isWinner ? '🏆' : `#${index + 1}`) : `#${index + 1}`}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                        color: ticket ? '#fff' : '#666',
                                fontFamily: 'monospace',
                        flex: '0 0 auto',
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                        fontSize: '0.875rem'
                              }}>
                        {ticket ? ticket.name : 'Waiting for ticket...'}
                              </Typography>
                      {ticket && ticket.playingNumber && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, ml: 1, flex: 1, justifyContent: 'center' }}>
                          {Array.from(ticket.playingNumber).map((char, idx) => {
                            const isMatch = ticket.matchingPositions && ticket.matchingPositions.includes(idx);
                            return (
                              <Box key={idx} sx={{ 
                                width: '16px',
                                height: '16px',
                                border: isMatch ? '1px solid #ff9800' : '1px solid #444',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                backgroundColor: isMatch ? '#ff9800' : 'transparent',
                                color: '#fff'
                              }}>
                                {char}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                      <Box sx={{ display:'flex', gap:1, alignItems:'center', ml:'auto' }}>
                        <Chip 
                          label={ticket ? `${ticket.matchingPositions.length} matches` : '0 matches'}
                          color={ticket ? "success" : "default"}
                          size="small"
                          sx={{ fontSize:'0.75rem', fontWeight:'bold', height:'24px', '& .MuiChip-label': { fontWeight:'bold', fontSize:'0.75rem' } }}
                        />
                        <Chip 
                          label={ticket ? `Score: ${ticket.score}` : 'Score: 0'}
                          color={ticket ? "secondary" : "default"}
                          size="small"
                          sx={{ fontSize:'0.75rem', fontWeight:'bold', height:'24px', '& .MuiChip-label': { fontWeight:'bold', fontSize:'0.75rem' } }}
                        />
                        {ticket && (
                          <Chip 
                            label={ticket.isRevoked ? 'UNSOLD' : 'SOLD'}
                            color={ticket.isRevoked ? 'error' : 'success'}
                            size="small"
                            sx={{ fontSize:'0.75rem', fontWeight:'bold', height:'24px', '& .MuiChip-label': { fontWeight:'bold', fontSize:'0.75rem' } }}
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

        {/* Always show Fraud Detection section (can be empty) */}
              {fraudulentTickets.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#f44336', textAlign: 'center', mb: 2 }}>
                    🚨 Fraud Detection Report ({fraudulentTickets.length})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {fraudulentTickets.map((fraudTicket, index) => {
                      const failedStepDisplay = getFailedStepDisplay(fraudTicket.failedStep);
                      return (
                        <Card key={fraudTicket.name} sx={{ 
                          backgroundColor: '#3a1e1e',
                          border: '2px solid #f44336',
                          animation: 'fadeIn 0.5s ease-in'
                        }}>
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#f44336',
                                fontWeight: 'bold',
                                minWidth: '30px'
                              }}>
                                🚨
                              </Typography>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#ff9999',
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold'
                                }}>
                                  {fraudTicket.name}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: '#ffcccc',
                                  display: 'block',
                                  mt: 0.5
                                }}>
                                  {fraudTicket.reason}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                <Chip 
                                  label="FRAUDULENT"
                                  color="error"
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                                <Chip 
                                  label={`${failedStepDisplay.label}`}
                                  color={failedStepDisplay.color}
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                  
                  <Typography variant="caption" sx={{ 
                    color: '#f44336', 
                    textAlign: 'center', 
                    display: 'block',
                    mt: 1,
                    fontWeight: 'bold'
                  }}>
                    All fraudulent tickets have been excluded from the results
                  </Typography>
                </Box>
              )}
            </Box>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes glow {
            0% { text-shadow: 0 0 5px #ffd700; }
            50% { text-shadow: 0 0 20px #ffd700, 0 0 30px #ffd700; }
            100% { text-shadow: 0 0 5px #ffd700; }
          }
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes glowGreen {
            0% { 
              box-shadow: 0 0 5px rgba(76, 175, 80, 0.3), 0 0 10px rgba(76, 175, 80, 0.2);
              transform: scale(1);
            }
            25% { 
              box-shadow: 0 0 10px rgba(76, 175, 80, 0.6), 0 0 20px rgba(76, 175, 80, 0.4);
              transform: scale(1.02);
            }
            50% { 
              box-shadow: 0 0 15px rgba(76, 175, 80, 0.8), 0 0 30px rgba(76, 175, 80, 0.6);
              transform: scale(1.03);
            }
            75% { 
              box-shadow: 0 0 10px rgba(76, 175, 80, 0.6), 0 0 20px rgba(76, 175, 80, 0.4);
              transform: scale(1.02);
            }
            100% { 
              box-shadow: 0 0 5px rgba(76, 175, 80, 0.3), 0 0 10px rgba(76, 175, 80, 0.2);
              transform: scale(1);
            }
          }
        `}
      </style>
    </Paper>
  );
});

export default RevealingWinningHashSection; 