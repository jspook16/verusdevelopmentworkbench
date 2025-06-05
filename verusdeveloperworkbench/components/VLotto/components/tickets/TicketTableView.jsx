import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

const TicketTableView = React.memo(function TicketTableView({ 
  tickets, 
  selectedTicketIds, 
  onToggleSelection, 
  maxDisplay = 50 
}) {
  const displayTickets = tickets.slice(0, maxDisplay);
  
  return (
    <TableContainer component={Paper} sx={{ backgroundColor: '#2a2a2a', maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Select</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>ID</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Hash</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Score</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Matches</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Status</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Created</TableCell>
            <TableCell sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>Series</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayTickets.map((ticket) => (
            <TableRow 
              key={ticket.id}
              sx={{ 
                backgroundColor: selectedTicketIds.has(ticket.id) ? '#1976d2' : '#2a2a2a',
                '&:hover': { backgroundColor: selectedTicketIds.has(ticket.id) ? '#1565c0' : '#333' }
              }}
            >
              <TableCell>
                <Checkbox
                  checked={selectedTicketIds.has(ticket.id)}
                  onChange={() => onToggleSelection(ticket.id)}
                  sx={{ color: '#fff' }}
                />
              </TableCell>
              <TableCell sx={{ color: '#fff', fontFamily: 'monospace' }}>
                {ticket.id}
              </TableCell>
              <TableCell sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                <Tooltip title={ticket.hash} arrow>
                  <span>{ticket.hash.substring(0, 16)}...</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                {ticket.score || 0}
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                {ticket.matchingPositions ? ticket.matchingPositions.length : 0}
              </TableCell>
              <TableCell>
                <Chip 
                  label={ticket.status || 'N/A'} 
                  size="small" 
                  color={ticket.status === 'available' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell sx={{ color: '#fff', fontSize: '0.75rem' }}>
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell sx={{ color: '#fff', fontSize: '0.75rem' }}>
                {ticket.series || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {tickets.length > maxDisplay && (
        <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#1e1e1e' }}>
          <Typography variant="body2" color="textSecondary">
            Showing first {maxDisplay} of {tickets.length} tickets
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
});

export default TicketTableView; 