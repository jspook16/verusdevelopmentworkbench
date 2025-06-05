import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography
} from '@mui/material';

const DetailedTicketItem = React.memo(function DetailedTicketItem({ ticket, isWinner }) {
  return (
    <Card sx={{ mb: 1, backgroundColor: isWinner ? '#2d5016' : '#2a2a2a' }}>
      <CardContent sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: 'column' }}>
          {/* Ticket name and basic info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: isWinner ? '#4caf50' : '#fff' }}>
              {ticket.name || `Ticket #${ticket.id}`}
            </Typography>
            {isWinner && (
              <Chip label="🏆 WINNER" color="success" size="small" sx={{ fontWeight: 'bold' }} />
            )}
          </Box>
          
          {/* Playing number hash with highlighting */}
          <Box sx={{ width: '100%', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#90caf9', fontWeight: 'bold' }}>
              Playing Number: 
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 0.5 }}>
              {ticket.hash.split('').map((char, charIndex) => (
                <span
                  key={charIndex}
                  style={{
                    color: ticket.matchingPositions && ticket.matchingPositions.includes(charIndex) ? '#2196f3' : '#fff',
                    fontWeight: ticket.matchingPositions && ticket.matchingPositions.includes(charIndex) ? 'bold' : 'normal',
                    backgroundColor: ticket.matchingPositions && ticket.matchingPositions.includes(charIndex) ? '#0d47a1' : 'transparent',
                    padding: ticket.matchingPositions && ticket.matchingPositions.includes(charIndex) ? '1px 2px' : '0',
                    borderRadius: '2px'
                  }}
                >
                  {char}
                </span>
              ))}
            </Typography>
          </Box>
          
          {/* Score and matches */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            {ticket.score > 0 && (
              <Chip label={`Score: ${ticket.score}`} color={isWinner ? 'success' : 'primary'} size="small" />
            )}
            {ticket.matchingPositions && ticket.matchingPositions.length > 0 && (
              <Chip label={`Matches: ${ticket.matchingPositions.length}`} color="secondary" size="small" />
            )}
            {ticket.score === 0 && (
              <Chip label="No Matches" color="default" size="small" />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export default DetailedTicketItem; 