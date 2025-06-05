import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';

const MinimalTicketItem = React.memo(function MinimalTicketItem({ ticketId, ticketHash }) {
  return (
    <Card sx={{ mb: 1, backgroundColor: '#2a2a2a' }}>
      <CardContent sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            Ticket #{ticketId}: {ticketHash}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
});

export default MinimalTicketItem; 