import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, Divider, Button, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components for resizable columns
const ResizableColumn = styled(Paper)(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
}));

const DetailsSection = ({ selectedVerusId, selectedRAddress, selectedZAddress }) => {
  if (!selectedVerusId && !selectedRAddress && !selectedZAddress) {
    return (
      <Typography variant="body2" color="text.secondary">
        Select a VerusID, R-address, or Z-address to view details
      </Typography>
    );
  }

  return (
    <Box>
      {selectedVerusId && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            VerusID Details
          </Typography>
          <Typography variant="body2">
            ID: {selectedVerusId}
          </Typography>
          {/* Add more VerusID specific details here */}
        </>
      )}

      {selectedRAddress && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            R-address Details
          </Typography>
          <Typography variant="body2">
            Address: {selectedRAddress}
          </Typography>
          {/* Add more R-address specific details here */}
        </>
      )}

      {selectedZAddress && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Z-address Details
          </Typography>
          <Typography variant="body2">
            Address: {selectedZAddress}
          </Typography>
          {/* Add more Z-address specific details here */}
        </>
      )}
    </Box>
  );
};

const MyOffersSection = () => {
  const [openOffers, setOpenOffers] = useState([]);
  const [newOffer, setNewOffer] = useState({
    currency: '',
    amount: '',
    price: '',
  });

  // Mock data for testing
  useEffect(() => {
    setOpenOffers([
      { id: 1, currency: 'VRSC', amount: '100', price: '1.5' },
      { id: 2, currency: 'BTC', amount: '0.5', price: '25000' },
    ]);
  }, []);

  const handleNewOfferChange = (field) => (event) => {
    setNewOffer({
      ...newOffer,
      [field]: event.target.value,
    });
  };

  const handleCreateOffer = () => {
    // TODO: Implement offer creation logic
    console.log('Creating new offer:', newOffer);
  };

  return (
    <Box>
      {/* List My Open Offers Section */}
      <SectionHeader variant="subtitle1">
        List My Open Offers
      </SectionHeader>
      <List dense>
        {openOffers.map((offer) => (
          <ListItem key={offer.id}>
            <ListItemText
              primary={`${offer.amount} ${offer.currency}`}
              secondary={`Price: ${offer.price}`}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Make an Offer Section */}
      <SectionHeader variant="subtitle1">
        Make an Offer
      </SectionHeader>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Currency"
          value={newOffer.currency}
          onChange={handleNewOfferChange('currency')}
          margin="dense"
          size="small"
        />
        <TextField
          fullWidth
          label="Amount"
          value={newOffer.amount}
          onChange={handleNewOfferChange('amount')}
          margin="dense"
          size="small"
        />
        <TextField
          fullWidth
          label="Price"
          value={newOffer.price}
          onChange={handleNewOfferChange('price')}
          margin="dense"
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateOffer}
          sx={{ mt: 2 }}
          fullWidth
        >
          Create Offer
        </Button>
      </Box>
    </Box>
  );
};

const MarketOffersSection = () => {
  const [marketOffers, setMarketOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for testing
  useEffect(() => {
    // TODO: Replace with actual API call to get market offers
    setMarketOffers([
      { id: 1, seller: 'user1@', currency: 'VRSC', amount: '100', price: '1.5' },
      { id: 2, seller: 'user2@', currency: 'BTC', amount: '0.5', price: '25000' },
      { id: 3, seller: 'user3@', currency: 'ETH', amount: '2.0', price: '2000' },
    ]);
    setLoading(false);
  }, []);

  const handleTakeOffer = (offer) => {
    // TODO: Implement take offer logic
    console.log('Taking offer:', offer);
  };

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading market offers...
      </Typography>
    );
  }

  return (
    <Box>
      <List dense>
        {marketOffers.map((offer) => (
          <ListItem
            key={offer.id}
            secondaryAction={
              <Button
                variant="contained"
                size="small"
                onClick={() => handleTakeOffer(offer)}
              >
                Take Offer
              </Button>
            }
          >
            <ListItemText
              primary={`${offer.amount} ${offer.currency}`}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    Seller: {offer.seller}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    Price: {offer.price}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const TradesInProgressSection = () => {
  const [activeTrades, setActiveTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for testing
  useEffect(() => {
    // TODO: Replace with actual API call to get active trades
    setActiveTrades([
      {
        id: 1,
        offerId: 1,
        seller: 'user1@',
        buyer: 'user2@',
        currency: 'VRSC',
        amount: '100',
        price: '1.5',
        status: 'Pending',
      },
      {
        id: 2,
        offerId: 2,
        seller: 'user3@',
        buyer: 'user4@',
        currency: 'BTC',
        amount: '0.5',
        price: '25000',
        status: 'Processing',
      },
    ]);
    setLoading(false);
  }, []);

  const handleCancelTrade = (trade) => {
    // TODO: Implement cancel trade logic
    console.log('Cancelling trade:', trade);
  };

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading active trades...
      </Typography>
    );
  }

  return (
    <Box>
      <List dense>
        {activeTrades.map((trade) => (
          <ListItem
            key={trade.id}
            secondaryAction={
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleCancelTrade(trade)}
              >
                Cancel
              </Button>
            }
          >
            <ListItemText
              primary={`${trade.amount} ${trade.currency}`}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {trade.seller} → {trade.buyer}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    Price: {trade.price}
                  </Typography>
                  <br />
                  <Typography
                    component="span"
                    variant="body2"
                    color={trade.status === 'Pending' ? 'warning.main' : 'info.main'}
                  >
                    Status: {trade.status}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const MarketPlaceView = () => {
  const theme = useTheme();
  const [selectedVerusId, setSelectedVerusId] = useState(null);
  const [selectedRAddress, setSelectedRAddress] = useState(null);
  const [selectedZAddress, setSelectedZAddress] = useState(null);
  const [verusIds, setVerusIds] = useState([]);
  const [rAddresses, setRAddresses] = useState([]);
  const [zAddresses, setZAddresses] = useState([]);

  // Mock data for testing - replace with actual data fetching
  useEffect(() => {
    // TODO: Replace with actual API calls
    setVerusIds(['test@', 'example@']);
    setRAddresses(['R123456789', 'R987654321']);
    setZAddresses(['z123456789', 'z987654321']);
  }, []);

  const handleVerusIdSelect = (verusId) => {
    setSelectedVerusId(verusId);
    setSelectedRAddress(null);
    setSelectedZAddress(null);
  };

  const handleRAddressSelect = (address) => {
    setSelectedRAddress(address);
    setSelectedVerusId(null);
    setSelectedZAddress(null);
  };

  const handleZAddressSelect = (address) => {
    setSelectedZAddress(address);
    setSelectedVerusId(null);
    setSelectedRAddress(null);
  };

  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Market Place
      </Typography>
      
      <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}>
        {/* VerusID Column */}
        <Grid item xs={2}>
          <ResizableColumn>
            <Typography variant="h6" gutterBottom>
              VerusID Information
            </Typography>
            
            {/* VerusIDs Section */}
            <SectionHeader variant="subtitle1">
              VerusIDs
            </SectionHeader>
            <List dense>
              {verusIds.map((id) => (
                <ListItem
                  key={id}
                  button
                  selected={selectedVerusId === id}
                  onClick={() => handleVerusIdSelect(id)}
                >
                  <ListItemText primary={id} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            {/* R-addresses Section */}
            <SectionHeader variant="subtitle1">
              R-addresses
            </SectionHeader>
            <List dense>
              {rAddresses.map((address) => (
                <ListItem
                  key={address}
                  button
                  selected={selectedRAddress === address}
                  onClick={() => handleRAddressSelect(address)}
                >
                  <ListItemText primary={address} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Z-addresses Section */}
            <SectionHeader variant="subtitle1">
              Z-addresses
            </SectionHeader>
            <List dense>
              {zAddresses.map((address) => (
                <ListItem
                  key={address}
                  button
                  selected={selectedZAddress === address}
                  onClick={() => handleZAddressSelect(address)}
                >
                  <ListItemText primary={address} />
                </ListItem>
              ))}
            </List>
          </ResizableColumn>
        </Grid>

        {/* Details Column */}
        <Grid item xs={2}>
          <ResizableColumn>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <DetailsSection
              selectedVerusId={selectedVerusId}
              selectedRAddress={selectedRAddress}
              selectedZAddress={selectedZAddress}
            />
          </ResizableColumn>
        </Grid>

        {/* My Offers Column */}
        <Grid item xs={3}>
          <ResizableColumn>
            <Typography variant="h6" gutterBottom>
              My Offers
            </Typography>
            <MyOffersSection />
          </ResizableColumn>
        </Grid>

        {/* Market Offers Column */}
        <Grid item xs={3}>
          <ResizableColumn>
            <Typography variant="h6" gutterBottom>
              Market Offers
            </Typography>
            <MarketOffersSection />
          </ResizableColumn>
        </Grid>

        {/* Trades in Progress Column */}
        <Grid item xs={2}>
          <ResizableColumn>
            <Typography variant="h6" gutterBottom>
              Trades in Progress
            </Typography>
            <TradesInProgressSection />
          </ResizableColumn>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketPlaceView;