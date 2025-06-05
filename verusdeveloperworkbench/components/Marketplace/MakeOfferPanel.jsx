import React, { useContext, useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Checkbox, FormControlLabel, CircularProgress, Tooltip, IconButton, Switch
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MarketplaceIdentityContext } from '../../contexts/MarketplaceIdentityContext';
import { WorkbenchDataContext } from '../../contexts/WorkbenchDataContext';
import { NodeContext } from '../../contexts/NodeContext';
import { IdentityContext } from '../../contexts/IdentityContext';

const ASSET_TYPES = [
  { value: 'currency', label: 'Currency' },
  { value: 'identity', label: 'Identity' },
  { value: 'nft', label: 'NFT' },
];

const MANUAL_ENTRY_VALUE = '__manual__';

const MakeOfferPanel = () => {
  const { selectedVerusId, selectedRAddress, selectedZAddress } = useContext(MarketplaceIdentityContext);
  const { rAddressesWithUtxos } = useContext(WorkbenchDataContext);
  const { sendCommand, nodeStatus } = useContext(NodeContext);
  const { identities } = useContext(IdentityContext) || {};

  // Build VerusID name list
  const verusIdNames = useMemo(() => {
    if (!identities) return [];
    return identities
      .filter(idObj => idObj && idObj.identity && idObj.identity.name)
      .map(idObj => idObj.identity.name.endsWith('@') ? idObj.identity.name : idObj.identity.name + '@');
  }, [identities]);

  // Prefill logic
  const defaultFromAddress = (selectedVerusId && selectedVerusId.identity && selectedVerusId.identity.name ? (selectedVerusId.identity.name.endsWith('@') ? selectedVerusId.identity.name : selectedVerusId.identity.name + '@') : selectedRAddress || selectedZAddress || '');
  const defaultChangeAddress = useMemo(() => {
    if (selectedRAddress) return selectedRAddress;
    if (rAddressesWithUtxos && rAddressesWithUtxos.length > 0) return rAddressesWithUtxos[0].address;
    return '';
  }, [selectedRAddress, rAddressesWithUtxos]);

  // Form state
  const [fromAddress, setFromAddress] = useState(defaultFromAddress);
  const [fromAddressManual, setFromAddressManual] = useState('');
  const [changeAddress, setChangeAddress] = useState(defaultChangeAddress);
  const [changeAddressManual, setChangeAddressManual] = useState('');
  const [expiryHeight, setExpiryHeight] = useState('');
  const [feeAmount, setFeeAmount] = useState('0.0001');
  const [returnTx, setReturnTx] = useState(false);

  // Offer section
  const [offerType, setOfferType] = useState('currency');
  const [offerCurrency, setOfferCurrency] = useState('');
  const [offerIdentity, setOfferIdentity] = useState('');
  const [offerNFT, setOfferNFT] = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  // For section
  const [forType, setForType] = useState('currency');
  const [forCurrency, setForCurrency] = useState('');
  const [forIdentity, setForIdentity] = useState('');
  const [forNFT, setForNFT] = useState('');
  const [forAmount, setForAmount] = useState('');
  const [forAddress, setForAddress] = useState(defaultChangeAddress);
  const [forAddressManual, setForAddressManual] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Address options for dropdowns
  const rAddressOptions = rAddressesWithUtxos ? rAddressesWithUtxos.map(r => r.address) : [];
  const addressOptions = useMemo(() => {
    const addrs = [
      ...verusIdNames,
      ...rAddressOptions,
    ];
    // Remove duplicates
    const uniqueAddrs = Array.from(new Set(addrs));
    return uniqueAddrs;
  }, [verusIdNames, rAddressOptions]);

  // Asset type dropdowns
  const renderAssetFields = (type, prefix) => {
    switch (type) {
      case 'currency':
        return (
          <>
            <TextField
              label="Currency"
              size="small"
              value={prefix === 'offer' ? offerCurrency : forCurrency}
              onChange={e => prefix === 'offer' ? setOfferCurrency(e.target.value) : setForCurrency(e.target.value)}
              sx={{ mb: 1, width: '100%' }}
              placeholder="e.g. VRSCTEST"
            />
            <TextField
              label="Amount"
              size="small"
              type="number"
              value={prefix === 'offer' ? offerAmount : forAmount}
              onChange={e => prefix === 'offer' ? setOfferAmount(e.target.value) : setForAmount(e.target.value)}
              sx={{ mb: 1, width: '100%' }}
              placeholder="e.g. 100"
            />
          </>
        );
      case 'identity':
        return (
          <TextField
            label="Identity"
            size="small"
            value={prefix === 'offer' ? offerIdentity : forIdentity}
            onChange={e => prefix === 'offer' ? setOfferIdentity(e.target.value) : setForIdentity(e.target.value)}
            sx={{ mb: 1, width: '100%' }}
            placeholder="e.g. myid@"
          />
        );
      case 'nft':
        return (
          <TextField
            label="NFT ID"
            size="small"
            value={prefix === 'offer' ? offerNFT : forNFT}
            onChange={e => prefix === 'offer' ? setOfferNFT(e.target.value) : setForNFT(e.target.value)}
            sx={{ mb: 1, width: '100%' }}
            placeholder="NFT ID"
          />
        );
      default:
        return null;
    }
  };

  // Validation
  const validate = () => {
    const fromAddr = fromAddress === MANUAL_ENTRY_VALUE ? fromAddressManual : fromAddress;
    const changeAddr = changeAddress === MANUAL_ENTRY_VALUE ? changeAddressManual : changeAddress;
    const forAddr = forAddress === MANUAL_ENTRY_VALUE ? forAddressManual : forAddress;
    if (!fromAddr) return 'From Address is required.';
    if (!changeAddr) return 'Change Address is required.';
    if (!offerType) return 'Offer asset type is required.';
    if (!forType) return 'For asset type is required.';
    if (offerType === 'currency' && (!offerCurrency || !offerAmount)) return 'Offer currency and amount required.';
    if (offerType === 'identity' && !offerIdentity) return 'Offer identity required.';
    if (offerType === 'nft' && !offerNFT) return 'Offer NFT ID required.';
    if (forType === 'currency' && (!forCurrency || !forAmount)) return 'For currency and amount required.';
    if (forType === 'identity' && !forIdentity) return 'For identity required.';
    if (forType === 'nft' && !forNFT) return 'For NFT ID required.';
    if (!forAddr) return 'For address is required.';
    return '';
  };

  // Build offerdata object
  const buildOfferData = () => {
    const offer = {};
    if (offerType === 'currency') {
      offer.currency = offerCurrency;
      offer.amount = Number(offerAmount);
    } else if (offerType === 'identity') {
      offer.identity = offerIdentity;
    } else if (offerType === 'nft') {
      offer.nft = offerNFT;
    }
    const forObj = { address: forAddress === MANUAL_ENTRY_VALUE ? forAddressManual : forAddress };
    if (forType === 'currency') {
      forObj.currency = forCurrency;
      forObj.amount = Number(forAmount);
    } else if (forType === 'identity') {
      forObj.identity = forIdentity;
    } else if (forType === 'nft') {
      forObj.nft = forNFT;
    }
    const offerdata = {
      changeaddress: changeAddress === MANUAL_ENTRY_VALUE ? changeAddressManual : changeAddress,
      offer,
      for: forObj,
    };
    if (expiryHeight) offerdata.expiryheight = Number(expiryHeight);
    return offerdata;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setCopiedField('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!nodeStatus?.connected) {
      setError('Node not connected.');
      return;
    }
    setLoading(true);
    try {
      const params = [
        fromAddress === MANUAL_ENTRY_VALUE ? fromAddressManual : fromAddress,
        buildOfferData(),
        returnTx,
        Number(feeAmount)
      ];
      const res = await sendCommand('makeoffer', params);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Error making offer.');
    } finally {
      setLoading(false);
    }
  };

  // Copy result (now accepts a value and field name)
  const handleCopyResult = (value, field) => {
    if (value) {
      navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 1200);
    }
  };

  return (
    <Paper sx={{ p: 1.5, background: '#232323', borderRadius: 1, minWidth: 0, boxShadow: 'none', mb: 1 }}>
      <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }}>Make Offer</Typography>
      <form onSubmit={handleSubmit} autoComplete="off">
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>From Address</InputLabel>
          <Select
            value={fromAddress}
            label="From Address"
            onChange={e => setFromAddress(e.target.value)}
            sx={{ fontSize: '0.8rem', color: '#fff' }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#232323', color: '#fff' } } }}
          >
            {addressOptions.map(addr => (
              <MenuItem key={addr} value={addr} sx={{ fontSize: '0.8rem' }}>{addr}</MenuItem>
            ))}
            <MenuItem value={MANUAL_ENTRY_VALUE} sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Manual Entry...</MenuItem>
          </Select>
        </FormControl>
        {fromAddress === MANUAL_ENTRY_VALUE && (
          <TextField
            label="Enter From Address"
            size="small"
            value={fromAddressManual}
            onChange={e => setFromAddressManual(e.target.value)}
            sx={{ mb: 1, width: '100%' }}
            placeholder="Enter VerusID, R-address, or Z-address"
          />
        )}
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>Change Address</InputLabel>
          <Select
            value={changeAddress}
            label="Change Address"
            onChange={e => setChangeAddress(e.target.value)}
            sx={{ fontSize: '0.8rem', color: '#fff' }}
            MenuProps={{ PaperProps: { sx: { bgcolor: '#232323', color: '#fff' } } }}
          >
            {addressOptions.map(addr => (
              <MenuItem key={addr} value={addr} sx={{ fontSize: '0.8rem' }}>{addr}</MenuItem>
            ))}
            <MenuItem value={MANUAL_ENTRY_VALUE} sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Manual Entry...</MenuItem>
          </Select>
        </FormControl>
        {changeAddress === MANUAL_ENTRY_VALUE && (
          <TextField
            label="Enter Change Address"
            size="small"
            value={changeAddressManual}
            onChange={e => setChangeAddressManual(e.target.value)}
            sx={{ mb: 1, width: '100%' }}
            placeholder="Enter R-address"
          />
        )}
        <TextField
          label="Expiry Height"
          size="small"
          type="number"
          value={expiryHeight}
          onChange={e => setExpiryHeight(e.target.value)}
          sx={{ mb: 1, width: '100%' }}
          placeholder="(Optional)"
          InputProps={{
            endAdornment: (
              <Tooltip title="Block height at which this offer expires. Defaults to 20 blocks if not set.">
                <span style={{ color: '#90caf9', cursor: 'help', fontSize: '1.1em' }}>?</span>
              </Tooltip>
            )
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.8rem', mb: 0.5 }}>Offer</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Asset Type</InputLabel>
              <Select
                value={offerType}
                label="Asset Type"
                onChange={e => setOfferType(e.target.value)}
                sx={{ fontSize: '0.8rem', color: '#fff' }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#232323', color: '#fff' } } }}
              >
                {ASSET_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.8rem' }}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderAssetFields(offerType, 'offer')}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.8rem', mb: 0.5 }}>For</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Asset Type</InputLabel>
              <Select
                value={forType}
                label="Asset Type"
                onChange={e => setForType(e.target.value)}
                sx={{ fontSize: '0.8rem', color: '#fff' }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#232323', color: '#fff' } } }}
              >
                {ASSET_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.8rem' }}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderAssetFields(forType, 'for')}
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>For Address</InputLabel>
              <Select
                value={forAddress}
                label="For Address"
                onChange={e => setForAddress(e.target.value)}
                sx={{ fontSize: '0.8rem', color: '#fff' }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#232323', color: '#fff' } } }}
              >
                {addressOptions.map(addr => (
                  <MenuItem key={addr} value={addr} sx={{ fontSize: '0.8rem' }}>{addr}</MenuItem>
                ))}
                <MenuItem value={MANUAL_ENTRY_VALUE} sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Manual Entry...</MenuItem>
              </Select>
            </FormControl>
            {forAddress === MANUAL_ENTRY_VALUE && (
              <TextField
                label="Enter For Address"
                size="small"
                value={forAddressManual}
                onChange={e => setForAddressManual(e.target.value)}
                sx={{ mb: 1, width: '100%' }}
                placeholder="Enter R-address or VerusID"
              />
            )}
          </Box>
        </Box>
        <TextField
          label="Fee Amount"
          size="small"
          type="number"
          value={feeAmount}
          onChange={e => setFeeAmount(e.target.value)}
          sx={{ mb: 1, width: '100%' }}
          InputProps={{
            endAdornment: (
              <Tooltip title="Specific fee amount for the transaction. Default is 0.0001.">
                <span style={{ color: '#90caf9', cursor: 'help', fontSize: '1.1em' }}>?</span>
              </Tooltip>
            )
          }}
        />
        <FormControlLabel
          control={<Switch checked={returnTx} onChange={e => setReturnTx(e.target.checked)} color="primary" sx={{ transform: 'scale(0.7)' }} />}
          label={<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>Return TX (Advanced)</Typography>}
          sx={{ mr: 2 }}
        />
        {error && <Typography sx={{ color: '#ff6b6b', fontSize: '0.8rem', mb: 1 }}>{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ fontSize: '0.85rem', fontWeight: 600, py: 0.7, borderRadius: 1, mb: 1 }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Make Offer'}
        </Button>
        {result && (
          <Paper sx={{ p: 1, mt: 1, background: '#191919', borderRadius: 1, wordBreak: 'break-all', position: 'relative' }}>
            <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.8rem', mb: 0.5 }}>Result</Typography>
            {result.txid && (
              <Typography sx={{ color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <b>Transaction ID:</b>&nbsp;<span style={{wordBreak:'break-all'}}>{result.txid}</span>
                <Tooltip title={copiedField === 'txid' ? 'Copied!' : 'Copy'}>
                  <IconButton onClick={() => handleCopyResult(result.txid, 'txid')} size="small" sx={{ ml: 1, color: copiedField === 'txid' ? '#90caf9' : '#aaa' }}>
                    <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Tooltip>
              </Typography>
            )}
            {result.opretxtid && (
              <Typography sx={{ color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <b>OpretTxID:</b>&nbsp;<span style={{wordBreak:'break-all'}}>{result.opretxtid}</span>
                <Tooltip title={copiedField === 'opretxtid' ? 'Copied!' : 'Copy'}>
                  <IconButton onClick={() => handleCopyResult(result.opretxtid, 'opretxtid')} size="small" sx={{ ml: 1, color: copiedField === 'opretxtid' ? '#90caf9' : '#aaa' }}>
                    <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Tooltip>
              </Typography>
            )}
            {result.hex && (
              <Typography sx={{ color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <b>Raw Transaction Hex:</b>&nbsp;<span style={{wordBreak:'break-all'}}>{result.hex}</span>
                <Tooltip title={copiedField === 'hex' ? 'Copied!' : 'Copy'}>
                  <IconButton onClick={() => handleCopyResult(result.hex, 'hex')} size="small" sx={{ ml: 1, color: copiedField === 'hex' ? '#90caf9' : '#aaa' }}>
                    <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Tooltip>
              </Typography>
            )}
          </Paper>
        )}
      </form>
    </Paper>
  );
};

export default MakeOfferPanel; 