import React, { useState } from 'react';
import {
  Box, Paper, Typography, Switch, FormControlLabel, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tooltip, IconButton, Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { NodeContext } from '../../contexts/NodeContext';

const ListOpenOffersPanel = () => {
  const { sendCommand, nodeStatus } = React.useContext(NodeContext);
  const [showUnexpired, setShowUnexpired] = useState(true);
  const [showExpired, setShowExpired] = useState(true);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [copiedTxid, setCopiedTxid] = useState('');
  const [closingTxid, setClosingTxid] = useState('');
  const [panelFeedback, setPanelFeedback] = useState({ type: '', message: '' });

  const handleFetchOffers = async () => {
    setError('');
    setOffers([]);
    setLoading(true);
    try {
      const params = [showUnexpired, showExpired];
      const result = await sendCommand('listopenoffers', params);
      
      // Improved handling for empty results
      if (Array.isArray(result)) {
        setOffers(result); // Standard case: result is an array of offers
      } else if (result && typeof result === 'object' && Object.keys(result).length === 0) {
        // Case: result is an empty object, meaning no offers found
        setOffers([]); 
        // No error message here, the UI will show "No offers found..."
      } else if (result === null || result === undefined) {
        // Case: result is explicitly null or undefined, also no offers
        setOffers([]);
      } else {
        // Any other non-array, non-empty-object, non-null/undefined result is unexpected
        setOffers([]);
        setError('No open offers.'); 
      }
    } catch (err) {
      setError(err.message || 'Error fetching offers.');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTxid = (txid) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(txid);
    setTimeout(() => setCopiedTxid(''), 1200);
  };

  const handleCloseOffer = async (txid) => {
    setClosingTxid(txid);
    setPanelFeedback({ type: '', message: '' });
    try {
      await sendCommand('closeoffers', [[txid]]);
      setPanelFeedback({ type: 'success', message: `Offer ${txid.substring(0,12)}... closed successfully.` });
      handleFetchOffers();
    } catch (err) {
      setPanelFeedback({ type: 'error', message: `Error closing offer ${txid.substring(0,12)}...: ${err.message || 'Unknown error'}` });
    } finally {
      setClosingTxid('');
      setTimeout(() => setPanelFeedback({ type: '', message: '' }), 5000);
    }
  };

  return (
    <Paper sx={{ p: 1.5, background: '#232323', borderRadius: 1, minWidth: 0, boxShadow: 'none', mb: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>List Open Offers</Typography>
        {panelFeedback.message && (
          <Typography sx={{
            color: panelFeedback.type === 'success' ? '#4caf50' : '#ff6b6b',
            fontSize: '0.8rem', 
            mb: 1, 
            p: 0.5,
            background: panelFeedback.type === 'success' ? '#1a331a' : '#442222',
            borderRadius: 1,
            textAlign: 'center'
          }}>
            {panelFeedback.message}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <FormControlLabel
          control={<Switch checked={showUnexpired} onChange={e => setShowUnexpired(e.target.checked)} color="primary" sx={{ transform: 'scale(0.7)' }} />}
          label={<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>Show Unexpired</Typography>}
          sx={{ mr: 2 }}
        />
        <FormControlLabel
          control={<Switch checked={showExpired} onChange={e => setShowExpired(e.target.checked)} color="primary" sx={{ transform: 'scale(0.7)' }} />}
          label={<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>Show Expired</Typography>}
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          onClick={handleFetchOffers}
          disabled={loading || !nodeStatus?.connected}
          sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1, ml: 'auto', minWidth: 120 }}
        >
          {loading ? 'Fetching...' : 'Fetch Offers'}
        </Button>
      </Box>
      {error && <Typography sx={{ color: '#ff6b6b', fontSize: '0.8rem', mb: 1 }}>{error}</Typography>}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
            <CircularProgress size={28} />
          </Box>
        ) : offers.length === 0 && !error ? (
          <Typography sx={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', mt: 2 }}>No offers found. Adjust filters and fetch again.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {offers.map((offer, idx) => {
              const renderAddresses = (addresses) => Array.isArray(addresses) ? addresses.join(", ") : '';
              const renderIdentity = (identity) => identity ? `${identity.name} ${identity.identityaddress}` : '';
              const offerType = offer.offer?.type || 'Unknown';
              const offerIdentity = offer.offer?.identityprimary ? renderIdentity(offer.offer.identityprimary) : '';
              const offerAmount = offer.offer?.nativeout !== undefined ? offer.offer.nativeout : '';
              const offerAddresses = offer.offer?.addresses;
              const forType = offer.for?.type || 'Unknown';
              const forAmount = offer.for?.nativeout !== undefined ? offer.for.nativeout : '';
              const forAddresses = offer.for?.addresses;
              const expiration = offer.expires !== undefined ? offer.expires : (offer.expiration !== undefined ? offer.expiration : '');
              const status = expiration ? `Expires at: ${expiration}` : 'Unknown';

              let offeredAddressesLabel = "Addresses:";
              if (offerIdentity) {
                offeredAddressesLabel = "Identity Addresses:";
              } else if (offerType.toLowerCase() === 'cryptocondition') {
                offeredAddressesLabel = "Condition Addresses:";
              }

              let forAddressesLabel = "Receiving Addresses:";

              return (
                <Paper key={offer.txid || idx} sx={{ background: '#191919', borderRadius: 2, p: 1.2, mb: 1, boxShadow: '0 2px 8px #0002', position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ fontWeight: 600, color: '#a0cff9', fontSize: '0.78rem', display: 'flex', alignItems: 'center' }}>
                      TXID:&nbsp;
                      <span style={{ wordBreak: 'break-all', color: '#fff', fontWeight: 400, fontSize: '0.78rem' }}>{offer.txid}</span>
                      <IconButton onClick={() => handleCopyTxid(offer.txid)} size="small" sx={{ ml: 0.5, color: copiedTxid === offer.txid ? '#90caf9' : '#aaa', fontSize: '0.78rem' }} aria-label={`Copy Open Offer TXID ${offer.txid}`}>
                        <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ color: '#90caf9', fontWeight: 600, fontSize: '0.72rem' }}>{status}</Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: {xs: 1, sm: 1.2}, width: '100%' }}>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.75rem', mb: 0.2 }}>Offered</Typography>
                      <Box sx={{ color: '#fff', fontSize: '0.72rem', pl: 0.5 }}>
                        <div><span style={{ color: '#a0cff9' }}><b>Type:</b></span> <span style={{ color: '#fff' }}>{offerType}</span></div>
                        {offerIdentity && (
                          <div>
                            <span style={{ color: '#a0cff9' }}><b>Identity:</b></span> 
                            <span style={{ color: '#fff', wordBreak: 'break-all' }}> {offerIdentity}</span>
                          </div>
                        )}
                        {offerAmount !== '' && (<div><span style={{ color: '#a0cff9' }}><b>Amount:</b></span> <span style={{ color: '#fff' }}>{offerAmount}</span></div>)}
                        {Array.isArray(offerAddresses) && offerAddresses.length > 0 && (
                            <div>
                                <span style={{ color: '#a0cff9' }}><b>{offeredAddressesLabel}</b></span> 
                                {offerAddresses.map((addr, i) => <Typography key={i} component="div" sx={{ color: '#fff', pl:1, wordBreak:'break-all', fontSize: '0.72rem' }}>{addr}</Typography>)}
                            </div>
                        )}
                      </Box>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: '#444', mx:0.5 }} />
                    <Divider sx={{ display: { xs: 'block', sm: 'none' }, borderColor: '#444', my:1 }} />

                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.75rem', mb: 0.2 }}>For</Typography>
                      <Box sx={{ color: '#fff', fontSize: '0.72rem', pl: 0.5 }}>
                        <div><span style={{ color: '#a0cff9' }}><b>Type:</b></span> <span style={{ color: '#fff' }}>{forType}</span></div>
                        {forAmount !== '' && (<div><span style={{ color: '#a0cff9' }}><b>Amount:</b></span> <span style={{ color: '#fff' }}>{forAmount}</span></div>)}
                        {Array.isArray(forAddresses) && forAddresses.length > 0 && (
                            <div>
                                <span style={{ color: '#a0cff9' }}><b>{forAddressesLabel}</b></span> 
                                {forAddresses.map((addr, i) => <Typography key={i} component="div" sx={{ color: '#fff', pl:1, wordBreak:'break-all', fontSize: '0.72rem' }}>{addr}</Typography>)}
                            </div>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Box sx={{ color: '#bbb', fontSize: '0.7rem' }}>
                      <span style={{ color: '#a0cff9' }}><b>Expiration Block:</b></span> <span style={{ color: '#fff' }}>{expiration}</span>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      endIcon={closingTxid === offer.txid ? <CircularProgress size={14} color="inherit" /> : <CloseIcon />}
                      sx={{ fontSize: '0.7rem', minWidth: 0, px: 1.2, py: 0.3, ml: 2, borderRadius: 1, textTransform: 'none' }}
                      disabled={closingTxid === offer.txid}
                      onClick={() => handleCloseOffer(offer.txid)}
                    >
                      Close Offer
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ListOpenOffersPanel; 
