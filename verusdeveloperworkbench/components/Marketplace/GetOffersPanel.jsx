import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tooltip, IconButton, Divider, Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { NodeContext } from '../../contexts/NodeContext';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import JsonFieldRenderer from './JsonFieldRenderer';
import Split from 'react-split';

const GetOffersPanel = () => {
  const { sendCommand, nodeStatus } = useContext(NodeContext);
  const [currencyOrId, setCurrencyOrId] = useState('');
  const [isCurrency, setIsCurrency] = useState(false);
  const [withTx, setWithTx] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [copiedTxid, setCopiedTxid] = useState('');
  const [selectedOfferData, setSelectedOfferData] = useState(null);
  const [takeOfferTxid, setTakeOfferTxid] = useState('');
  const [takeOfferFrom, setTakeOfferFrom] = useState('');
  const [takeOfferDeliver, setTakeOfferDeliver] = useState('');
  const [takeOfferAccept, setTakeOfferAccept] = useState('');
  const [takeOfferLoading, setTakeOfferLoading] = useState(false);
  const [takeOfferResult, setTakeOfferResult] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [takeOfferChange, setTakeOfferChange] = useState('');
  const [takeOfferReturnTx, setTakeOfferReturnTx] = useState(false);
  const [takeOfferFee, setTakeOfferFee] = useState('');
  const [deliverCurrency, setDeliverCurrency] = useState('');
  const [deliverAmount, setDeliverAmount] = useState('');
  const [deliverAddress, setDeliverAddress] = useState('');
  const [acceptCurrency, setAcceptCurrency] = useState('');
  const [acceptAmount, setAcceptAmount] = useState('');
  const [acceptAddress, setAcceptAddress] = useState('');
  const [acceptName, setAcceptName] = useState('');
  const [acceptIdentityId, setAcceptIdentityId] = useState('');
  const [acceptParent, setAcceptParent] = useState('');
  const [acceptPrimaryAddresses, setAcceptPrimaryAddresses] = useState([]);
  const [acceptMinSignatures, setAcceptMinSignatures] = useState(1);
  const [loadingIdentityDetails, setLoadingIdentityDetails] = useState(false);
  const [identityDetailsError, setIdentityDetailsError] = useState('');
  const [currencyCache, setCurrencyCache] = useState({});
  const [newPrimaryAddressForAcceptedId, setNewPrimaryAddressForAcceptedId] = useState('');
  const [currentRevocationAuth, setCurrentRevocationAuth] = useState('');
  const [currentRecoveryAuth, setCurrentRecoveryAuth] = useState('');
  const [currentPrivateAddress, setCurrentPrivateAddress] = useState('');
  const [newRevocationAuthority, setNewRevocationAuthority] = useState('');
  const [newRecoveryAuthority, setNewRecoveryAuthority] = useState('');
  const [newPrivateAddress, setNewPrivateAddress] = useState('');
  const [newMinSignatures, setNewMinSignatures] = useState('1');

  const resetTakeOfferFormState = () => {
    setTakeOfferTxid('');
    setTakeOfferFrom('');
    setTakeOfferDeliver('');
    setTakeOfferAccept('');
    setTakeOfferResult('');
    setShowAdvanced(false);
    setIdentityDetailsError('');
    setLoadingIdentityDetails(false);
    setNewPrimaryAddressForAcceptedId('');
    setCurrentRevocationAuth('');
    setCurrentRecoveryAuth('');
    setCurrentPrivateAddress('');
    setNewRevocationAuthority('');
    setNewRecoveryAuthority('');
    setNewPrivateAddress('');
    setNewMinSignatures('1');
    setDeliverCurrency('');
    setDeliverAmount('');
    setDeliverAddress('');
    setAcceptCurrency('');
    setAcceptAmount('');
    setAcceptAddress('');
    setAcceptName('');
    setAcceptIdentityId('');
    setAcceptParent('');
    setAcceptPrimaryAddresses([]);
    setAcceptMinSignatures(1);
    setTakeOfferChange('');
    setTakeOfferReturnTx(false);
    setTakeOfferFee('');
  };

  const handleFetchOffers = async () => {
    if (!currencyOrId) {
      setError('Currency or ID is required');
      return;
    }

    setError('');
    setOffers([]);
    setLoading(true);
    try {
      const params = [currencyOrId, isCurrency, withTx];
      const result = await sendCommand('getoffers', params);
      if (result && typeof result === 'object' && !Array.isArray(result) && Object.keys(result).length === 0) {
        setOffers([]);
      } else {
      setOffers(result);
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

  // Helper to flatten offers from grouped result
  const flattenOffers = (offersObj) => {
    if (Array.isArray(offersObj)) return offersObj;
    let arr = [];
    Object.values(offersObj).forEach(group => {
      if (Array.isArray(group)) arr.push(...group);
    });
    return arr;
  };

  // Helper to prefill deliver/accept fields
  const prefillFields = (offerMadeByOtherParty, requiredFromYou) => {
    // offerMadeByOtherParty is what you will receive (e.g., selectedOfferData.offer)
    // requiredFromYou is what you will deliver (e.g., selectedOfferData.accept)

    let dCurrency = '', dAmount = ''; // For "Delivering" section
    if (requiredFromYou) {
      if (requiredFromYou.currency && typeof requiredFromYou.amount !== 'undefined') {
        dCurrency = requiredFromYou.currency;
        dAmount = requiredFromYou.amount;
      } else if (requiredFromYou.name && requiredFromYou.identityid) {
        // User is delivering an ID. The form doesn't currently support input for this.
        // For now, leave dCurrency/dAmount blank if UI doesn't allow specifying ID to deliver.
        // Or, if this structure implies an ID is being delivered as the 'currency' value itself.
        // This part needs UI to specify *which* ID to deliver if requiredFromYou is an ID def.
        // For the common case of receiving an ID (they want currency), this branch is not hit for dCurrency.
      } else if (typeof requiredFromYou === 'object' && Object.keys(requiredFromYou).length > 0) {
        // Attempt to parse as a direct currency:amount map if not standard structure
        const keys = Object.keys(requiredFromYou);
        // Filter out known non-currency keys that might appear in such objects
        const potentialCurrencyKey = keys.find(k => 
          !['txid', 'type', 'blockexpiry', 'offer', 'accept', 'name', 'identityid', 'currency', 'amount', 'addresses', 'primaryaddresses', 'parent', 'minimumsignatures', 'revocationauthority', 'recoveryauthority', 'privateaddress', 'contentmap', 'systemid', 'nodeid', 'gateway', 'options', 'proofprotocol', 'version', 'fullyqualifiedname', 'friendlyname', 'tokenizedcontrol', 'price', 'localprice', 'lastblock', 'lastprocessedblock', 'expiration', 'expired', 'via', 'viacurrency', 'satoshis', 'intermediateprice', 'intermediatesatoshis', 'bestprice', 'bestpricelocal', 'bestpriceintermediatecurrency', 'bestpriceintermediatecurrencyprice', 'bestpriceintermediatecurrencysatoshis', 'initialconversion'].includes(k.toLowerCase())
        );
        if (potentialCurrencyKey && typeof requiredFromYou[potentialCurrencyKey] !== 'object') {
           dCurrency = potentialCurrencyKey;
           dAmount = requiredFromYou[potentialCurrencyKey];
        }
      }
    }

    let aCurrency = '', aAmount = '', aName = '', aIdentityId = ''; // For "Accepting" section
    if (offerMadeByOtherParty) {
      if (offerMadeByOtherParty.name && offerMadeByOtherParty.identityid) { // Receiving an ID
        aName = offerMadeByOtherParty.name;
        aIdentityId = offerMadeByOtherParty.identityid;
      } else if (offerMadeByOtherParty.currency && typeof offerMadeByOtherParty.amount !== 'undefined') { // Receiving a single structured currency
        aCurrency = offerMadeByOtherParty.currency;
        aAmount = offerMadeByOtherParty.amount;
      } else if (typeof offerMadeByOtherParty === 'object' && Object.keys(offerMadeByOtherParty).length > 0) {
        // Receiving an object of currencies, e.g., {"curA": amtA, "curB": amtB}
        // Pick the first valid one for the `takeoffer` command's `accept` currency/amount.
         const potentialCurrencyKeys = Object.keys(offerMadeByOtherParty).filter(k => 
          !['txid', 'type', 'blockexpiry', 'offer', 'accept', 'name', 'identityid', 'currency', 'amount', 'addresses', 'primaryaddresses', 'parent', 'minimumsignatures', 'revocationauthority', 'recoveryauthority', 'privateaddress', 'contentmap', 'systemid', 'nodeid', 'gateway', 'options', 'proofprotocol', 'version', 'fullyqualifiedname', 'friendlyname', 'tokenizedcontrol', 'price', 'localprice', 'lastblock', 'lastprocessedblock', 'expiration', 'expired', 'via', 'viacurrency', 'satoshis', 'intermediateprice', 'intermediatesatoshis', 'bestprice', 'bestpricelocal', 'bestpriceintermediatecurrency', 'bestpriceintermediatecurrencyprice', 'bestpriceintermediatecurrencysatoshis', 'initialconversion'].includes(k.toLowerCase())
          && typeof offerMadeByOtherParty[k] !== 'object' // Ensure the value is not another object
        );
        if (potentialCurrencyKeys.length > 0) {
          aCurrency = potentialCurrencyKeys[0];
          aAmount = offerMadeByOtherParty[aCurrency];
        }
      }
    }
    // dAddress (deliverAddress state) and aAddress (acceptAddress state) are user inputs, not prefilled from offer data structure here.
    return { dCurrency, dAmount, aCurrency, aAmount, aName, aIdentityId };
  };

  const prepareTakeOfferForm = async (txid, offerObj, acceptObj) => {
    resetTakeOfferFormState();
    setTakeOfferTxid(txid);
    setSelectedOfferData({ txid, offer: offerObj, accept: acceptObj });

    const { dCurrency, dAmount, aCurrency, aAmount, aName, aIdentityId } = prefillFields(offerObj, acceptObj);
    setDeliverCurrency(dCurrency);
    setDeliverAmount(dAmount);
    setAcceptCurrency(aCurrency);
    setAcceptAmount(aAmount);
    setAcceptName(aName);
    setAcceptIdentityId(aIdentityId);

    if (aName && aIdentityId) {
      setLoadingIdentityDetails(true);
      try {
        console.log(`[TAKE OFFER FORM] Fetching identity details for: ${aIdentityId}`);
        const identityResult = await sendCommand('getidentity', [aIdentityId]);
        console.log(`[TAKE OFFER FORM] Identity details result:`, identityResult);
        
        if (identityResult && identityResult.identity) {
          setAcceptParent(identityResult.identity.parent || '');
          setAcceptPrimaryAddresses(identityResult.identity.primaryaddresses || []);
          const fetchedMinSigs = identityResult.identity.minimumsignatures;
          setAcceptMinSignatures(fetchedMinSigs || 1);
          setNewMinSignatures(String(fetchedMinSigs || 1));
          setCurrentRevocationAuth(identityResult.identity.revocationauthority || '');
          setCurrentRecoveryAuth(identityResult.identity.recoveryauthority || '');
          setCurrentPrivateAddress(identityResult.identity.privateaddress || '');
          setIdentityDetailsError('');
        } else {
          throw new Error('Identity details not found in result.');
        }
      } catch (err) {
        console.error("[TAKE OFFER FORM] Error fetching identity details:", err);
        setIdentityDetailsError(`Error fetching identity details: ${err.message || err}`);
      } finally {
        setLoadingIdentityDetails(false);
      }
    }
  };

  const handleTakeOffer = async () => {
    setTakeOfferLoading(true);
    setTakeOfferResult('');
    setIdentityDetailsError('');
    try {
      let deliverObj = {};
      if (deliverCurrency && deliverAmount) {
        deliverObj = { 
          currency: deliverCurrency,
          amount: parseFloat(deliverAmount)
        };
      }

      let acceptObj = {};
      if (acceptName && acceptIdentityId) {
        const finalAcceptName = acceptName.includes('@') ? acceptName : `${acceptName}@`;
        
        let addressesToUseInAccept = acceptPrimaryAddresses;
        if (newPrimaryAddressForAcceptedId.trim() !== '') {
          addressesToUseInAccept = [newPrimaryAddressForAcceptedId.trim()];
        }
        if (addressesToUseInAccept.length === 0 && newPrimaryAddressForAcceptedId.trim() === ''){
            setTakeOfferResult('Error: New Primary Address is required for the accepted identity.');
            setTakeOfferLoading(false);
            return;
        }

        let minSigs = parseInt(newMinSignatures, 10);
        if (isNaN(minSigs) || minSigs < 1) {
          minSigs = 1;
        }

        acceptObj = { 
          name: finalAcceptName,        
          parent: acceptParent, 
          primaryaddresses: addressesToUseInAccept, 
          minimumsignatures: minSigs
        };

        if (newRevocationAuthority.trim() !== '') {
          acceptObj.revocationauthority = newRevocationAuthority.trim();
        }
        if (newRecoveryAuthority.trim() !== '') {
          acceptObj.recoveryauthority = newRecoveryAuthority.trim();
        }
        if (newPrivateAddress.trim() !== '') {
          acceptObj.privateaddress = newPrivateAddress.trim();
        }

      } else if (acceptCurrency && acceptAmount) {
        acceptObj = { 
          currency: acceptCurrency, 
          amount: parseFloat(acceptAmount),
          address: acceptAddress 
        };
      }

      // Construct offerdata, carefully handling optional changeaddress
      const offerdata = { 
        txid: takeOfferTxid, 
        deliver: deliverObj, 
        accept: acceptObj
      };

      const trimmedTakeOfferChange = takeOfferChange.trim();
      const trimmedTakeOfferFrom = takeOfferFrom.trim();

      if (trimmedTakeOfferChange !== '') {
        // User explicitly provided a change address
        offerdata.changeaddress = trimmedTakeOfferChange;
      } else {
        // User left change address blank.
        // Only set it if 'fromAddress' is not the wildcard "*"
        // as "*" is invalid for changeaddress.
        if (trimmedTakeOfferFrom !== '*') {
          offerdata.changeaddress = trimmedTakeOfferFrom;
        }
        // If trimmedTakeOfferFrom IS "*", changeaddress is NOT added to offerdata,
        // so it will be omitted from the JSON sent to the daemon, which is correct.
      }
      
      const params = [takeOfferFrom, offerdata];
      if (takeOfferReturnTx) params.push(true);
      if (takeOfferFee) params.push(parseFloat(takeOfferFee));

      console.log('[TAKE OFFER] Sending takeoffer command with params:', JSON.stringify(params, null, 2));
      const result = await sendCommand('takeoffer', params);

      let successTxid = null;
      if (result && result.error) {
        setTakeOfferResult(`Error: ${result.error.message || JSON.stringify(result.error)}`);
      } else if (typeof result === 'string') {
        setTakeOfferResult(`Success: ${result}`);
        successTxid = result;
        setSelectedOfferData(null);
        resetTakeOfferFormState();
      } else if (result && typeof result === 'object') {
        if (result.txid) {
          setTakeOfferResult(`Success! TxID: ${result.txid}`);
          successTxid = result.txid;
          setSelectedOfferData(null);
          resetTakeOfferFormState();
        } else {
          setTakeOfferResult(`Success: ${JSON.stringify(result)}`);
        }
      } else if (result === null || result === undefined ) {
        setTakeOfferResult('Received an unexpected null or undefined result from takeoffer.');
      } else {
        setTakeOfferResult(`Unexpected result: ${JSON.stringify(result)}`);
      }
      
      if (successTxid) {
          try {
          const key = 'verusWorkbench_successfulTradeTxids_VRSCTEST';
              const existingTxidsString = localStorage.getItem(key);
              const existingTxids = existingTxidsString ? JSON.parse(existingTxidsString) : [];
              
              if (!existingTxids.includes(successTxid)) {
              const updatedTxids = [successTxid, ...existingTxids];
                  localStorage.setItem(key, JSON.stringify(updatedTxids));
                  console.log(`[TAKE OFFER] Saved successful trade TXID: ${successTxid}`);
              }
          } catch (e) {
              console.error("[TAKE OFFER] Failed to save trade TXID to localStorage:", e);
          }
      }

    } catch (err) {
      console.error('[TAKE OFFER] Error in handleTakeOffer:', err);
      setTakeOfferResult(`Error: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setTakeOfferLoading(false);
    }
  };

  const getCurrencyInfo = useCallback(async (currencyId) => {
    if (!currencyId || typeof currencyId !== 'string') return null;
    if (currencyCache[currencyId]) {
      return currencyCache[currencyId];
    }
    try {
      const result = await sendCommand('getcurrency', [currencyId]);
      if (result && result.name) {
        setCurrencyCache(prev => ({
          ...prev,
          [currencyId]: result
        }));
      }
      return result;
    } catch (err) {
      return null;
    }
  }, [sendCommand, currencyCache]);

  const renderTakeOfferForm = () => {
    if (!selectedOfferData) {
      return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#1e1e1e', borderRadius: 1 }}>
          <Typography sx={{color: '#777'}}>Select an offer to see details and take action.</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2, background: '#1e1e1e', borderRadius: 1, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Take Offer: {selectedOfferData.txid.substring(0, 12)}...
          </Typography>
          <IconButton onClick={() => { setSelectedOfferData(null); resetTakeOfferFormState(); }} size="small">
            <CloseIcon sx={{ color: '#ccc' }} />
          </IconButton>
        </Box>

        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto' }}>
          <TextField
            label="From Address *"
            value={takeOfferFrom}
            onChange={(e) => setTakeOfferFrom(e.target.value)}
            fullWidth
            required
            placeholder="R-address or i-address to send from"
            size="small"
          />

          <Typography variant="subtitle2" sx={{ color: '#ddd', mt: 1, fontWeight: 'bold' }}>Delivering (What you send)</Typography>
          {deliverCurrency && <TextField label="Deliver Currency" value={deliverCurrency} fullWidth disabled size="small" />}
          {deliverAmount && <TextField label="Deliver Amount" value={deliverAmount} fullWidth disabled size="small" />}
          {deliverAddress && <TextField label="Deliver To Address (Optional)" value={deliverAddress} onChange={e => setDeliverAddress(e.target.value)} fullWidth size="small" />}

          <Typography variant="subtitle2" sx={{ color: '#ddd', mt: 1, fontWeight: 'bold' }}>Accepting (What you receive)</Typography>
          {acceptName && acceptIdentityId ? (
            <>
              <TextField label="Accepting Identity Name" value={acceptName} fullWidth disabled size="small"/>
              <TextField label="Identity ID" value={acceptIdentityId} fullWidth disabled size="small"/>
              {loadingIdentityDetails && <CircularProgress size={20} sx={{my:1}} />}
              {identityDetailsError && <Alert severity="warning" sx={{my:1}}>{identityDetailsError}</Alert>}
              {!loadingIdentityDetails && !identityDetailsError && (
                <>
                  <TextField
                    label="New Primary Address for Accepted Identity *"
                    value={newPrimaryAddressForAcceptedId}
                    onChange={e => setNewPrimaryAddressForAcceptedId(e.target.value)}
                    fullWidth
                    required={!acceptPrimaryAddresses || acceptPrimaryAddresses.length === 0}
                    placeholder="Enter new R-address or i-address"
                    helperText={(!acceptPrimaryAddresses || acceptPrimaryAddresses.length === 0) ? "Required as no current primary address found for identity." : "Optional: If you want to change primary address upon acceptance."}
                    size="small"
                    sx={{mt:1}}
                  />
                  <TextField
                    label="New Minimum Signatures"
                    type="number"
                    value={newMinSignatures}
                    onChange={e => setNewMinSignatures(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText={`Current is ${acceptMinSignatures}. Must be >= 1.`}
                  />
                  <Typography variant="caption" sx={{ color: '#bbb', mt:1 }}>Identity Update Fields (Optional - Leave blank to keep current):</Typography>
                  <TextField 
                    label="New Revocation Authority" 
                    value={newRevocationAuthority} 
                    onChange={e => setNewRevocationAuthority(e.target.value)} 
                    fullWidth 
                    placeholder={`Current: ${currentRevocationAuth || 'Not set'}`} 
                    size="small" 
                  />
                  <TextField 
                    label="New Recovery Authority" 
                    value={newRecoveryAuthority} 
                    onChange={e => setNewRecoveryAuthority(e.target.value)} 
                    fullWidth 
                    placeholder={`Current: ${currentRecoveryAuth || 'Not set'}`} 
                    size="small" 
                  />
                  <TextField 
                    label="New Private Address" 
                    value={newPrivateAddress} 
                    onChange={e => setNewPrivateAddress(e.target.value)} 
                    fullWidth 
                    placeholder={`Current: ${currentPrivateAddress || 'Not set'}`} 
                    size="small" 
                  />
                </>
              )}
            </>
          ) : (
            <>
              {acceptCurrency && <TextField label="Accept Currency" value={acceptCurrency} fullWidth disabled size="small"/>}
              {acceptAmount && <TextField label="Accept Amount" value={acceptAmount} fullWidth disabled size="small"/>}
              <TextField 
                label="Accept To Address (Your R-address or i-address) *" 
                value={acceptAddress} 
                onChange={e => setAcceptAddress(e.target.value)} 
                fullWidth 
                required
                placeholder="R-address or i-address"
                size="small"
              />
            </>
          )}

          <Button onClick={() => setShowAdvanced(!showAdvanced)} startIcon={<ExpandMoreIcon sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }} />} sx={{ alignSelf: 'flex-start', color: '#90caf9', textTransform: 'none', fontSize:'0.8rem', mt:1 }}>
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>

          {showAdvanced && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, border: '1px solid #333', p:1.5, borderRadius:1 }}>
              <TextField
                label="Change Address (Optional)"
                value={takeOfferChange}
                onChange={(e) => setTakeOfferChange(e.target.value)}
                fullWidth
                placeholder="Defaults to From Address if blank"
                size="small"
              />
              <TextField
                label="Fee Amount (Optional)"
                type="number"
                value={takeOfferFee}
                onChange={(e) => setTakeOfferFee(e.target.value)}
                fullWidth
                placeholder="e.g. 0.0001"
                size="small"
              />
              <FormControlLabel
                control={<Switch checked={takeOfferReturnTx} onChange={(e) => setTakeOfferReturnTx(e.target.checked)} />}
                label="Return Hex Transaction Only (offline signing)"
                sx={{color: '#ccc'}}
              />
            </Box>
          )}
          
          {takeOfferResult && (
            <Alert 
              severity={takeOfferResult.toLowerCase().startsWith('error:') ? 'error' : 'success'} 
              sx={{ mt: 2, overflowWrap: 'break-word', wordBreak: 'break-all' }}
            >
              {takeOfferResult}
            </Alert>
          )}
        </Box>
        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid #333' }}>
           <Button onClick={() => {setSelectedOfferData(null); resetTakeOfferFormState();}} color="inherit" variant="outlined" size="small">
            Clear / Cancel
          </Button>
          <Button
            onClick={handleTakeOffer}
            color="success"
            variant="contained"
            size="small"
            disabled={
              takeOfferLoading || 
              loadingIdentityDetails || 
              !!identityDetailsError || 
              !takeOfferFrom || 
              (acceptName && acceptIdentityId && !newPrimaryAddressForAcceptedId && (!acceptPrimaryAddresses || acceptPrimaryAddresses.length === 0)) ||
              (!acceptName && !acceptIdentityId && !acceptAddress)
            }
          >
            {takeOfferLoading ? <CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} /> : 'Submit Take Offer'}
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 0, background: '#232323', borderRadius: 1, minWidth: 0, boxShadow: 'none', mb: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow:'hidden' }}>
      <Box sx={{p: 1.5, pb: 0}}>
        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }}>Get & Take Offers</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
        <TextField
          label="Currency or ID"
          size="small"
          value={currencyOrId}
          onChange={e => setCurrencyOrId(e.target.value)}
          sx={{ width: '100%' }}
          placeholder="e.g. VRSC or myid@"
          InputProps={{
            endAdornment: (
              <Tooltip title="Enter a currency symbol or VerusID to search for offers">
                <span style={{ color: '#90caf9', cursor: 'help', fontSize: '1.1em' }}>?</span>
              </Tooltip>
            )
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={isCurrency} onChange={e => setIsCurrency(e.target.checked)} color="primary" sx={{ transform: 'scale(0.7)' }} />}
            label={<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>Search Currency Offers</Typography>}
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Switch checked={withTx} onChange={e => setWithTx(e.target.checked)} color="primary" sx={{ transform: 'scale(0.7)' }} />}
            label={<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>Return Transaction Data</Typography>}
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
        </Box>
      </Box>

      {error && <Typography sx={{ color: '#ff6b6b', fontSize: '0.8rem', mb: 1, px:1.5 }}>{error}</Typography>}

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Split
          direction="vertical"
          sizes={[60, 40]}
          minSize={[100, 150]}
          gutterSize={6}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
          className="getoffers-split"
        >
          <Box sx={{ overflowY: 'auto', height: '100%', p:1.5, pt:0 }}>
        {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight:120 }}>
            <CircularProgress size={28} />
          </Box>
        ) : flattenOffers(offers).length === 0 && !error ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight:100 }}>
                <Typography sx={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', mt: 2 }}>
                  No offers found. Enter a currency or ID and fetch offers.
                </Typography>
              </Box>
        ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {flattenOffers(offers).map((offer, idx) => {
              const txid = offer.offer?.txid || offer.txid;
              const blockexpiry = offer.offer?.blockexpiry || offer.blockexpiry;
              const offerObj = offer.offer?.offer || offer.offer;
              const acceptObj = offer.offer?.accept || offer.accept;
              const renderAddresses = (addresses) => Array.isArray(addresses) ? addresses.join(", ") : '';
              const renderIdentity = (identity) => identity ? `${identity.name || identity} (${identity.identityid || identity})` : '';
              const offerType = offerObj?.type || (offerObj?.name ? 'Identity' : 'Unknown');
              const offerIdentity = offerObj?.name ? renderIdentity(offerObj) : '';
              const offerAmount = offerObj?.nativeout !== undefined ? offerObj.nativeout : offer.price !== undefined ? offer.price : '';
              const offerAddresses = renderAddresses(offerObj?.primaryaddresses || offerObj?.addresses);
              const forType = typeof acceptObj === 'object' && Object.keys(acceptObj).length > 0 ? 'Currency' : 'Unknown';
              const forAmount = typeof acceptObj === 'object' ? Object.values(acceptObj)[0] : '';
              const forAddresses = '';
              const expiration = blockexpiry !== undefined ? blockexpiry : '';
              const offerKeyPrefix = `${txid || idx}-offer`;
              const acceptKeyPrefix = `${txid || idx}-accept`;
              return (
                <Paper key={txid || idx} sx={{ background: '#191919', borderRadius: 2, p: 1.2, mb: 1, boxShadow: '0 2px 8px #0002', position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ fontWeight: 600, color: '#a0cff9', fontSize: '0.78rem', display: 'flex', alignItems: 'center' }}>
                      TXID:&nbsp;
                      <span style={{ wordBreak: 'break-all', color: '#fff', fontWeight: 400, fontSize: '0.78rem' }}>{txid}</span>
                      <IconButton onClick={() => handleCopyTxid(txid)} size="small" sx={{ ml: 0.5, color: copiedTxid === txid ? '#90caf9' : '#aaa', fontSize: '0.78rem' }} aria-label={`Copy Offer TXID ${txid}`}>
                        <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: {xs: 1, sm: 1.2}, width: '100%', mt: 0.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.75rem', mb: 0.2 }}>Offered</Typography>
                      <Box sx={{ color: '#fff', fontSize: '0.72rem', pl: 0.5 }}>
                        {Object.entries(offerObj || {}).map(([key, value]) => (
                          <JsonFieldRenderer
                            key={`offer-${key}`}
                            fieldKey={key}
                            fieldValue={value}
                            getCurrencyInfo={getCurrencyInfo}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: '#444', mx: 0.5 }} />
                    <Divider sx={{ display: { xs: 'block', sm: 'none' }, borderColor: '#444', my: 1 }} />

                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ color: '#a0cff9', fontWeight: 500, fontSize: '0.75rem', mb: 0.2 }}>For</Typography>
                      <Box sx={{ color: '#fff', fontSize: '0.72rem', pl: 0.5 }}>
                        {Object.entries(acceptObj || {}).map(([key, value]) => (
                          <JsonFieldRenderer
                            key={`accept-${key}`}
                            fieldKey={key}
                            fieldValue={value}
                            getCurrencyInfo={getCurrencyInfo}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Box sx={{ color: '#bbb', fontSize: '0.7rem' }}>
                      <span style={{ color: '#a0cff9' }}><b>Expiration Block:</b></span> <span style={{ color: '#fff' }}>{expiration}</span>
                    </Box>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      sx={{ fontSize: '0.7rem', minWidth: 0, px: 1.2, py: 0.3, ml: 2, borderRadius: 1, textTransform: 'none' }}
                          onClick={() => prepareTakeOfferForm(txid, offerObj, acceptObj)}
                    >
                      Take Offer
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
          <Box sx={{ overflow: 'hidden', height: '100%', background: '#1a1a1a', p:0 }}>
            {renderTakeOfferForm()}
            </Box>
        </Split>
            </Box>
    </Paper>
  );
};

export default GetOffersPanel; 