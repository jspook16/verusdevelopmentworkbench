import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';

const TicketVerificationSection = React.memo(function TicketVerificationSection({
  ticketVerification,
  handleVerifyTicket
}) {
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Ticket Verification System
      </Typography>
      
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={8} md={6}>
          <TextField
            fullWidth
            label="Ticket Name to Verify"
            value={ticketVerification.ticketToVerify}
            onChange={(e) => ticketVerification.setTicketToVerify(e.target.value)}
            size="small"
            placeholder="e.g., 573242_1of3.shylock@"
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button
            variant="contained"
            color="info"
            onClick={handleVerifyTicket}
            disabled={ticketVerification.isVerifying || !ticketVerification.ticketToVerify.trim()}
            sx={{ height: '100%' }}
          >
            {ticketVerification.isVerifying ? 'Verifying...' : 'Verify Ticket'}
          </Button>
        </Grid>
      </Grid>

      {ticketVerification.verificationStatus && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            {ticketVerification.verificationStatus}
          </Typography>
        </Box>
      )}

      {ticketVerification.verificationResults && !ticketVerification.verificationResults.error && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#4caf50' }}>
            ✅ Ticket Verification Results
          </Typography>

          {/* Verification Process Explanation */}
          <Card sx={{ backgroundColor: '#2a2a2a', p: 1.5, mb: 2, border: '1px solid #666' }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
              🔍 3-Step Cryptographic Verification Process:
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, color: '#e0e0e0', fontSize: '0.75rem' }}>
              <strong>1. Registration TXID Validation:</strong> Verify transaction created this specific ticket identity using blockchain data
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, color: '#e0e0e0', fontSize: '0.75rem' }}>
              <strong>2. Ticket Self-Signature:</strong> Confirm ticket signed its registration TXID with verifymessage
            </Typography>
            <Typography variant="body2" sx={{ color: '#e0e0e0', fontSize: '0.75rem' }}>
              <strong>3. Proofguard ID Acknowledgment:</strong> Confirm proofguard ID signed ticket's signature - any tampering breaks the chain
            </Typography>
          </Card>

          {/* Verification Summary */}
          <Card sx={{ 
            backgroundColor: '#2a2a2a', 
            p: 2, 
            mb: 3, 
            border: `2px solid ${ticketVerification.verificationResults.isValid ? '#4caf50' : '#f44336'}` 
          }}>
            <Typography variant="subtitle2" sx={{ 
              color: ticketVerification.verificationResults.isValid ? '#4caf50' : '#f44336', 
              mb: 2, 
              fontWeight: 'bold', 
              textAlign: 'center' 
            }}>
              {ticketVerification.verificationResults.isValid 
                ? '✅ CRYPTOGRAPHIC VERIFICATION PASSED - TICKET IS AUTHENTIC' 
                : '❌ CRYPTOGRAPHIC VERIFICATION FAILED - TICKET MAY BE TAMPERED'
              }
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" sx={{ 
                    color: ticketVerification.verificationResults.isValid ? '#4caf50' : '#e0e0e0', 
                    fontWeight: 'bold' 
                  }}>
                    {ticketVerification.verificationResults.isValid ? '✓' : '✗'} Identity Found
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#c0c0c0' }}>
                    On-chain at block {ticketVerification.verificationResults.identityData.blockheight}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" sx={{ 
                    color: ticketVerification.verificationResults.registrationVerification?.valid ? '#4caf50' : '#f44336', 
                    fontWeight: 'bold' 
                  }}>
                    {ticketVerification.verificationResults.registrationVerification?.valid ? '✓' : '✗'} Registration TXID
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#c0c0c0' }}>
                    Verified on blockchain
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" sx={{ 
                    color: ticketVerification.verificationResults.cryptographicVerification?.step1Valid ? '#4caf50' : '#f44336', 
                    fontWeight: 'bold' 
                  }}>
                    {ticketVerification.verificationResults.cryptographicVerification?.step1Valid ? '✓' : '✗'} Ticket Signature
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#c0c0c0' }}>
                    Ticket signed registration TXID
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" sx={{ 
                    color: ticketVerification.verificationResults.cryptographicVerification?.step2Valid ? '#4caf50' : '#f44336', 
                    fontWeight: 'bold' 
                  }}>
                    {ticketVerification.verificationResults.cryptographicVerification?.step2Valid ? '✓' : '✗'} Proofguard Signature
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#c0c0c0' }}>
                    Proofguard signed ticket signature
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
          
          <Grid container spacing={2}>
            {/* Basic Identity Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#2a2a2a', p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  🎫 Ticket Identity Information
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Name:</strong> {ticketVerification.verificationResults.ticketName}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Playing Number:</strong> {ticketVerification.verificationResults.playingNumber}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Identity Address:</strong> {ticketVerification.verificationResults.identityData.identity?.identityaddress}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Parent Identity:</strong> {ticketVerification.verificationResults.identityData.identity?.parent}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Original Registration TXID:</strong> {ticketVerification.verificationResults.registrationTxId}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Current Identity TXID:</strong> {ticketVerification.verificationResults.currentIdentityTxId}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, fontSize: '0.75rem' }}>
                  <strong>Block Height:</strong> {ticketVerification.verificationResults.identityData.blockheight}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, fontSize: '0.75rem' }}>
                  <strong>Status:</strong> {ticketVerification.verificationResults.identityData.status}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1, fontSize: '0.75rem' }}>
                  <strong>Verified At:</strong> {new Date(ticketVerification.verificationResults.verifiedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                  <strong>VLotto JSON Data:</strong>
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#000', 
                  p: 1, 
                  borderRadius: 1,
                  border: '1px solid #444',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    color: '#4caf50', 
                    fontSize: '0.7rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(ticketVerification.verificationResults.vlottoData, null, 2)}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            
            {/* Transaction Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#1e2a3a', p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  📋 Transaction Details
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Original Registration TXID:</strong> {ticketVerification.verificationResults.registrationTxId}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  <strong>Current Identity TXID:</strong> {ticketVerification.verificationResults.currentIdentityTxId}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5, fontSize: '0.75rem' }}>
                  <strong>Verified At:</strong> {new Date(ticketVerification.verificationResults.verifiedAt).toLocaleString()}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Verification 1: Registration TXID Verification */}
          {ticketVerification.verificationResults.registrationVerification && (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: '#2a2a2a', 
                p: 1.5,
                border: `1px solid ${ticketVerification.verificationResults.registrationVerification.valid ? '#4caf50' : '#f44336'}`
              }}>
                <Typography variant="subtitle2" sx={{ 
                  color: ticketVerification.verificationResults.registrationVerification.valid ? '#4caf50' : '#f44336', 
                  mb: 1, 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {ticketVerification.verificationResults.registrationVerification.valid ? '✅' : '❌'} Verification 1: Registration TXID Validation
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#fff', fontSize: '0.75rem' }}>
                      <strong>Commands:</strong> gettransaction + decoderawtransaction
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#fff', fontSize: '0.75rem' }}>
                      <strong>Confirmations:</strong> {ticketVerification.verificationResults.registrationVerification.transactionData?.confirmations || 'N/A'}
                    </Typography>
                    {ticketVerification.verificationResults.registrationVerification.decodedData?.vout && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5, color: '#fff', fontSize: '0.75rem' }}>
                          <strong>Identity Reservation Data:</strong>
                        </Typography>
                        {ticketVerification.verificationResults.registrationVerification.decodedData.vout.map((output, index) => {
                          if (output.scriptPubKey?.identityreservation) {
                            return (
                              <Box key={index} sx={{ 
                                backgroundColor: '#1a1a1a', 
                                p: 1, 
                                borderRadius: 1,
                                border: '1px solid #444',
                                mb: 1
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontFamily: 'monospace', 
                                  color: '#90caf9', 
                                  fontSize: '0.7rem',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {JSON.stringify(output.scriptPubKey.identityreservation, null, 2)}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        })}
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {ticketVerification.verificationResults.registrationVerification.validationDetails && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.entries(ticketVerification.verificationResults.registrationVerification.validationDetails).map(([key, isValid]) => {
                          const labels = {
                            txidMatches: 'TXID', hasIdentityPrimary: 'Primary', hasIdentityReservation: 'Reserve',
                            nameMatches: 'Name', parentMatches: 'Parent', identityAddressMatches: 'Address'
                          };
                          return (
                            <Chip 
                              key={key}
                              label={labels[key]}
                              color={isValid ? 'success' : 'error'}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: '20px' }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          )}

          {/* Verification 2: Ticket Self-Signature */}
          {ticketVerification.verificationResults.cryptographicVerification && (
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: '#2a2a2a', 
                p: 1.5,
                border: `1px solid ${ticketVerification.verificationResults.cryptographicVerification.step1Valid ? '#4caf50' : '#f44336'}`
              }}>
                <Typography variant="subtitle2" sx={{ 
                  color: ticketVerification.verificationResults.cryptographicVerification.step1Valid ? '#4caf50' : '#f44336', 
                  mb: 1, 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {ticketVerification.verificationResults.cryptographicVerification.step1Valid ? '✅' : '❌'} Verification 2: Ticket Self-Signature
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 0.5, color: '#fff', fontSize: '0.7rem' }}>
                  <strong>Command:</strong> verifymessage ticket signature regTxId
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                  <strong>Expected Hash:</strong>
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#1a1a1a', 
                  p: 1, 
                  borderRadius: 1,
                  border: '1px solid #444',
                  mb: 1
                }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    color: '#e1bee7', 
                    fontSize: '0.7rem',
                    wordBreak: 'break-all'
                  }}>
                    {ticketVerification.verificationResults.cryptographicVerification.step1Expected}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                  <strong>Actual Hash:</strong>
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#1a1a1a', 
                  p: 1, 
                  borderRadius: 1,
                  border: '1px solid #444'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    color: ticketVerification.verificationResults.cryptographicVerification.step1Valid ? '#4caf50' : '#f44336', 
                    fontSize: '0.7rem',
                    wordBreak: 'break-all'
                  }}>
                    {ticketVerification.verificationResults.cryptographicVerification.step1Hash || 'Verification failed'}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          )}

          {/* Verification 3: Proofguard ID Acknowledgment */}
          {ticketVerification.verificationResults.cryptographicVerification && (
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: '#2a2a2a', 
                p: 1.5,
                border: `1px solid ${ticketVerification.verificationResults.cryptographicVerification.step2Valid ? '#4caf50' : '#f44336'}`
              }}>
                <Typography variant="subtitle2" sx={{ 
                  color: ticketVerification.verificationResults.cryptographicVerification.step2Valid ? '#4caf50' : '#f44336', 
                  mb: 1, 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {ticketVerification.verificationResults.cryptographicVerification.step2Valid ? '✅' : '❌'} Verification 3: Proofguard ID Acknowledgment
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 0.5, color: '#fff', fontSize: '0.7rem' }}>
                  <strong>Command:</strong> verifymessage proofguard signature ticketSig
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                  <strong>Expected Hash:</strong>
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#1a1a1a', 
                  p: 1, 
                  borderRadius: 1,
                  border: '1px solid #444',
                  mb: 1
                }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    color: '#ffcc02', 
                    fontSize: '0.7rem',
                    wordBreak: 'break-all'
                  }}>
                    {ticketVerification.verificationResults.cryptographicVerification.step2Expected}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                  <strong>Actual Hash:</strong>
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#1a1a1a', 
                  p: 1, 
                  borderRadius: 1,
                  border: '1px solid #444'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    color: ticketVerification.verificationResults.cryptographicVerification.step2Valid ? '#4caf50' : '#f44336', 
                    fontSize: '0.7rem',
                    wordBreak: 'break-all'
                  }}>
                    {ticketVerification.verificationResults.cryptographicVerification.step2Hash || 'Verification failed'}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          )}
        </Box>
      )}

      {ticketVerification.verificationResults && ticketVerification.verificationResults.error && (
        <Box sx={{ mt: 3 }}>
          <Card sx={{ backgroundColor: '#3a1e1e', p: 2 }}>
            <Typography variant="h6" sx={{ color: '#f44336', mb: 1 }}>
              ❌ Verification Failed
            </Typography>
            <Typography variant="body2" sx={{ color: '#ffcdd2' }}>
              {ticketVerification.verificationResults.error}
            </Typography>
          </Card>
        </Box>
      )}
    </Paper>
  );
});

export default TicketVerificationSection; 