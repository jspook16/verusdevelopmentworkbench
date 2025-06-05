import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LotteryDrawingSystemSection = React.memo(function LotteryDrawingSystemSection({
  ticketGeneration,
  drawingSystem,
  lotteryDrawingSystemExpanded,
  setLotteryDrawingSystemExpanded,
  handleGenerateTickets,
  handlePerformDrawing,
  handleClearTicketData,
  hooksReady
}) {
  return (
    <Accordion
      expanded={lotteryDrawingSystemExpanded}
      onChange={() => setLotteryDrawingSystemExpanded(!lotteryDrawingSystemExpanded)}
      sx={{ mb: 3, backgroundColor: '#1e1e1e', border: '1px solid #333' }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
        sx={{ backgroundColor: '#2a2a2a', color: '#fff' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🎲 Lottery Drawing System Manual Override
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 0.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {/* Generate Tickets */}
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleGenerateTickets}
              disabled={!hooksReady || ticketGeneration.isGeneratingTickets || !ticketGeneration.mainVerusId || !ticketGeneration.futureBlockNumber || ticketGeneration.ticketQuantity <= 0}
              size="small"
            >
              {ticketGeneration.isGeneratingTickets ? 'Generating Tickets...' : 'Generate Tickets'}
            </Button>

            {/* Marketplace Expiry Block field */}
            <TextField
              label="Marketplace Expiry Block"
              value={ticketGeneration.marketplaceExpiryBlock}
              onChange={(e) => ticketGeneration.setMarketplaceExpiryBlock(e.target.value)}
              type="number"
              size="small"
              sx={{ width: '200px' }}
              placeholder="e.g., 580000"
            />

            {/* List Current Tickets on Marketplace */}
            <Button
              variant="contained"
              color="info"
              size="small"
              onClick={async () => {
                if (ticketGeneration.tickets.length > 0) {
                  if (!ticketGeneration.marketplaceExpiryBlock) {
                    alert('Please enter a marketplace expiry block number first.');
                    return;
                  }
                  
                  // Check if tickets have been properly finalized
                  const unfinalizedTickets = ticketGeneration.tickets.filter(ticket => 
                    !ticket.updateIdentityTxId || !ticket.playingNumber || ticket.errorFinalizing
                  );
                  
                  if (unfinalizedTickets.length > 0) {
                    const message = `Cannot list ${unfinalizedTickets.length} ticket(s) on marketplace - they are not properly finalized yet. ` +
                                  `Please wait for all updateidentity transactions to be confirmed, or regenerate tickets if there are errors.`;
                    alert(message);
                    return;
                  }
                  
                  try {
                    ticketGeneration.setGenerationStatus('Manual marketplace listing: Checking ticket finalization status...');
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for safety
                    ticketGeneration.setGenerationStatus('Manual marketplace listing: Starting marketplace offers...');
                    await ticketGeneration.listTicketsOnMarketplace(ticketGeneration.tickets);
                    ticketGeneration.setGenerationStatus('Manual marketplace listing attempt completed.');
                  } catch (e) {
                    console.error("Error during manual marketplace listing:", e);
                    ticketGeneration.setGenerationStatus(`Error during manual marketplace listing: ${e.message}`);
                    alert(`Error during manual marketplace listing: ${e.message}`);
                  }
                } else {
                  alert('No tickets available to list on the marketplace.');
                }
              }}
              disabled={ticketGeneration.isGeneratingTickets || ticketGeneration.tickets.length === 0}
            >
              List Current Tickets on Marketplace
            </Button>
            
            {/* Refresh Marketplace State */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={async () => {
                try {
                  await ticketGeneration.refreshMarketplaceState();
                } catch (e) {
                  console.error("Error refreshing marketplace state:", e);
                  alert(`Error refreshing marketplace state: ${e.message}`);
                }
              }}
              disabled={ticketGeneration.isGeneratingTickets || ticketGeneration.tickets.length === 0}
            >
              🔄 Refresh Marketplace State
            </Button>
            
            {/* Close All Offers */}
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={async () => {
                try {
                  await ticketGeneration.closeAllOffers();
                } catch (e) {
                  console.error("Error closing offers:", e);
                  alert(`Error closing offers: ${e.message}`);
                }
              }}
              disabled={ticketGeneration.isGeneratingTickets || !ticketGeneration.hasActiveMarketplaceTickets()}
            >
              Close All Offers
            </Button>
            
            {/* Check Expiry & Revoke Unsold Tickets */}
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={async () => {
                try {
                  await ticketGeneration.checkAndRevokeExpiredOffers();
                } catch (e) {
                  console.error("Error checking expiry and revoking unsold tickets:", e);
                  alert(`Error checking expiry and revoking unsold tickets: ${e.message}`);
                }
              }}
              disabled={ticketGeneration.isGeneratingTickets || ticketGeneration.tickets.length === 0}
            >
              🕐 Check Expiry & Revoke Unsold
            </Button>
            
            {/* Revoke Unsold Tickets (R-address based) */}
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={async () => {
                const availableTickets = ticketGeneration.tickets.filter(ticket => 
                  !ticketGeneration.revokedTickets.includes(ticket.name) && !ticket.errorFinalizing
                );
                
                if (availableTickets.length === 0) {
                  alert('No tickets available to check for revocation.');
                  return;
                }
                
                if (window.confirm(`Are you sure you want to check ${availableTickets.length} ticket(s) and revoke any that are unsold (based on R-address comparison)? This action cannot be undone.`)) {
                  try {
                    await ticketGeneration.revokeUnsoldTickets();
                  } catch (e) {
                    console.error("Error revoking unsold tickets:", e);
                    alert(`Error revoking unsold tickets: ${e.message}`);
                  }
                }
              }}
              disabled={ticketGeneration.isGeneratingTickets || !ticketGeneration.hasActiveMarketplaceTickets()}
            >
              Revoke Unsold Tickets (R-address Check)
            </Button>
      
            {/* Past Block Number field */}
            <TextField
              label="Past Block Number (for hash source)"
              value={drawingSystem.pastBlockNumber}
              onChange={(e) => drawingSystem.setPastBlockNumber(e.target.value)}
              type="number"
              size="small"
              sx={{ width: '200px' }}
              placeholder="e.g., 570000"
            />

            {/* Perform Drawing */}
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePerformDrawing}
              disabled={drawingSystem.isDrawing || !drawingSystem.pastBlockNumber || ticketGeneration.tickets.length === 0}
              size="small"
            >
              {drawingSystem.isDrawing ? 'Drawing...' : 'Perform Drawing'}
            </Button>

            {/* Clear Ticket Data */}
            <Button
              variant="outlined"
              color="warning"
              onClick={handleClearTicketData}
              disabled={ticketGeneration.isGeneratingTickets}
              size="small"
            >
              Clear Ticket Data
            </Button>
          </Box>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
});

export default LotteryDrawingSystemSection; 