import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Paper,
  Divider,
  TextField,
  IconButton,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useCurrencyDefinition } from '../../contexts/CurrencyDefinitionContext';

const currencyOptionsList = [
  {
    value: 1,
    name: 'OPTION_FRACTIONAL',
    label: 'Fractional Currency (Basket)',
    description: 'Allows reserve conversion. Requires Token option. Up to 10 reserve currencies.'
  },
  {
    value: 2,
    name: 'OPTION_ID_ISSUANCE',
    label: 'Restricted ID Issuance',
    description: 'If set, IDs on this chain may only be created by the controlling ID of the currency.'
  },
  {
    value: 4,
    name: 'OPTION_ID_STAKING',
    label: 'ID-Based Staking',
    description: 'All IDs on chain stake equally, not value-based (PBaaS Specific).'
  },
  {
    value: 8,
    name: 'OPTION_ID_REFERRALS',
    label: 'Enable ID Referrals',
    description: 'This chain supports ID referrals and discounts for subID creation.'
  },
  {
    value: 16,
    name: 'OPTION_ID_REFERRALREQUIRED',
    label: 'Require ID Referrals',
    description: 'This chain requires referrals for subID creation (Enable ID Referrals must also be set).'
  },
  {
    value: 32,
    name: 'OPTION_TOKEN',
    label: 'Token',
    description: 'Defines this as a token, not a native currency. Required for Fractional & NFT types.'
  },
  {
    value: 64,
    name: 'OPTION_SINGLECURRENCY',
    label: 'Single Currency Mode',
    description: 'For PBaaS chains or gateways to potentially restrict to a single currency.'
  },
  {
    value: 128,
    name: 'OPTION_GATEWAY',
    label: 'Gateway',
    description: 'This currency can route external currencies. Does not automatically make it a converter.'
  },
  {
    value: 256,
    name: 'OPTION_PBAAS',
    label: 'PBaaS Chain',
    description: 'Defines this as a PBaaS chain (independent blockchain).'
  },
  {
    value: 512,
    name: 'OPTION_GATEWAY_CONVERTER',
    label: 'Gateway Converter',
    description: 'For a PBaaS gateway or Gateway currency, this marks it as a default converter publishing prices.'
  },
  {
    value: 1024,
    name: 'OPTION_GATEWAY_NAMECONTROLLER',
    label: 'Gateway Name Controller',
    description: 'When NOT set on a gateway, top-level ID and currency registration happen on the launch chain.'
  },
  {
    value: 2048,
    name: 'OPTION_NFT_TOKEN',
    label: 'NFT Token (Tokenized Control)',
    description: 'Creates a single satoshi NFT that tokenizes control of the root VerusID. Requires Token option.'
  }
];

const DefineCurrencyParamsCM = () => {
  const { updateCurrencyDefinition } = useCurrencyDefinition();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [optionsExpanded, setOptionsExpanded] = useState(true); 

  // --- State for all parameters ---
  const [currencyName, setCurrencyName] = useState('');
  const [idRegFees, setIdRegFees] = useState('');
  const [idReferralLevels, setIdReferralLevels] = useState('');
  const [notarizationReward, setNotarizationReward] = useState('');
  const [proofProtocol, setProofProtocol] = useState('1'); 
  const [notarizationProtocol, setNotarizationProtocol] = useState(''); 
  const [expiryHeight, setExpiryHeight] = useState(''); 
  const [startBlock, setStartBlock] = useState('');
  const [endBlock, setEndBlock] = useState('0'); 
  
  const [currencies, setCurrencies] = useState(''); 
  const [weights, setWeights] = useState(''); 
  const [conversions, setConversions] = useState('');
  const [minPreconversion, setMinPreconversion] = useState('');
  const [maxPreconversion, setMaxPreconversion] = useState('');
  const [initialContributions, setInitialContributions] = useState('');
  const [prelaunchDiscount, setPrelaunchDiscount] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [prelaunchCarveout, setPrelaunchCarveout] = useState('');
  
  const [preallocations, setPreallocations] = useState(''); 
  // New state for dynamic simple token preallocations
  const [simpleTokenPreallocations, setSimpleTokenPreallocations] = useState([{ identity: '', amount: '' }]);

  const [notaries, setNotaries] = useState('');
  const [minNotariesConfirm, setMinNotariesConfirm] = useState('');
  const [blockTime, setBlockTime] = useState('60'); 
  const [powAveragingWindow, setPowAveragingWindow] = useState('45');
  const [notarizationPeriod, setNotarizationPeriod] = useState('10'); 
  const [eras, setEras] = useState('');
  const [nodes, setNodes] = useState('');
  const [gatewayConverterName, setGatewayConverterName] = useState('');

  const handleOptionChange = (event) => {
    const { name, checked } = event.target;
    const optionValue = parseInt(name, 10);
    setSelectedOptions(prev => ({ ...prev, [optionValue]: checked }));
  };

  // Handlers for simple token preallocations list
  const handleSimplePreallocationChange = (index, field, value) => {
    const updatedList = [...simpleTokenPreallocations];
    updatedList[index][field] = value;
    setSimpleTokenPreallocations(updatedList);
  };

  const addSimplePreallocation = () => {
    setSimpleTokenPreallocations([...simpleTokenPreallocations, { identity: '', amount: '' }]);
  };

  const removeSimplePreallocation = (index) => {
    const updatedList = simpleTokenPreallocations.filter((_, i) => i !== index);
    // Ensure at least one entry if the list becomes empty, or allow empty
    setSimpleTokenPreallocations(updatedList.length > 0 ? updatedList : [{ identity: '', amount: '' }]);
  };

  // Determine boolean flags first for use in useEffect and JSX
  const isToken = selectedOptions[32] || false;
  const isFractional = (selectedOptions[1] && isToken) || false;
  const isPBaaS = selectedOptions[256] || false;
  const isGateway = selectedOptions[128] || false;
  const isNFT = (selectedOptions[2048] && isToken) || false;
  const enableIDReferrals = selectedOptions[8] || false; 
  const showNotarizationReward = isPBaaS || (selectedOptions[512] || false);

  useEffect(() => {
    const optionsBitmask = currencyOptionsList.reduce((acc, option) => {
      if (selectedOptions[option.value]) return acc | option.value;
      return acc;
    }, 0);

    const currentDefinition = {
      options: optionsBitmask,
      name: currencyName,
      idregistrationfees: idRegFees ? parseFloat(idRegFees) : undefined,
      idreferrallevels: idReferralLevels ? parseInt(idReferralLevels, 10) : undefined,
      notarizationreward: notarizationReward ? parseFloat(notarizationReward) : undefined,
      proofprotocol: proofProtocol ? parseInt(proofProtocol, 10) : undefined,
      notarizationprotocol: notarizationProtocol ? parseInt(notarizationProtocol, 10) : undefined,
      expiryheight: expiryHeight ? parseInt(expiryHeight, 10) : undefined,
      startblock: startBlock ? parseInt(startBlock, 10) : undefined,
      endblock: endBlock ? parseInt(endBlock, 10) : 0,
      initialsupply: initialSupply ? parseFloat(initialSupply) : undefined,
      prelaunchdiscount: prelaunchDiscount ? parseFloat(prelaunchDiscount) : undefined,
      prelaunchcarveout: prelaunchCarveout ? parseFloat(prelaunchCarveout) : undefined,
      gatewayconvertername: gatewayConverterName,
    };

    // PBaaS specific parameters - only add if isPBaaS is true
    if (isPBaaS) {
      currentDefinition.minnotariesconfirm = minNotariesConfirm ? parseInt(minNotariesConfirm, 10) : undefined;
      currentDefinition.blocktime = blockTime ? parseInt(blockTime, 10) : undefined;
      currentDefinition.powaveragingwindow = powAveragingWindow ? parseInt(powAveragingWindow, 10) : undefined;
      currentDefinition.notarizationperiod = notarizationPeriod ? parseInt(notarizationPeriod, 10) : undefined;
      try { currentDefinition.eras = eras ? JSON.parse(eras) : undefined; } catch (e) { currentDefinition.eras = eras; }
    }
    
    // Notaries and Nodes can be for PBaaS or Gateway
    if (isPBaaS || isGateway) {
        try { currentDefinition.notaries = notaries ? JSON.parse(notaries) : undefined; } catch (e) { currentDefinition.notaries = notaries; }
        try { currentDefinition.nodes = nodes ? JSON.parse(nodes) : undefined; } catch (e) { currentDefinition.nodes = nodes; }
        // minnotariesconfirm for non-PBaaS gateway is handled by direct inclusion if not PBaaS but gateway is selected
        if (isGateway && !isPBaaS) {
             currentDefinition.minnotariesconfirm = minNotariesConfirm ? parseInt(minNotariesConfirm, 10) : undefined;
        }
    }

    try { currentDefinition.currencies = currencies ? JSON.parse(currencies) : undefined; } catch (e) { currentDefinition.currencies = currencies; }
    try { currentDefinition.weights = weights ? JSON.parse(weights) : undefined; } catch (e) { currentDefinition.weights = weights; }
    try { currentDefinition.conversions = conversions ? JSON.parse(conversions) : undefined; } catch (e) { currentDefinition.conversions = conversions; }
    try { currentDefinition.minpreconversion = minPreconversion ? JSON.parse(minPreconversion) : undefined; } catch (e) { currentDefinition.minpreconversion = minPreconversion; }
    try { currentDefinition.maxpreconversion = maxPreconversion ? JSON.parse(maxPreconversion) : undefined; } catch (e) { currentDefinition.maxpreconversion = maxPreconversion; }
    try { currentDefinition.initialcontributions = initialContributions ? JSON.parse(initialContributions) : undefined; } catch (e) { currentDefinition.initialcontributions = initialContributions; }
    
    const isTokenOnly = isToken && !isFractional && !isNFT;

    if (isTokenOnly) {
      const builtPreallocations = simpleTokenPreallocations
        .map(item => {
          if (item.identity && item.amount) {
            const amount = parseFloat(item.amount);
            if (!isNaN(amount)) {
              return { [item.identity]: amount };
            }
          }
          return null;
        })
        .filter(item => item !== null);
      if (builtPreallocations.length > 0) {
        currentDefinition.preallocations = builtPreallocations;
      }
    } else if ((isFractional || isNFT) && preallocations) { 
      try {
        const parsedPreallocations = JSON.parse(preallocations);
        if (Array.isArray(parsedPreallocations) && parsedPreallocations.length > 0) {
          currentDefinition.preallocations = parsedPreallocations;
        } else if (typeof parsedPreallocations === 'object' && parsedPreallocations !== null && Object.keys(parsedPreallocations).length > 0) {
            currentDefinition.preallocations = parsedPreallocations; 
        } else if (preallocations.trim() !== '' && !Array.isArray(parsedPreallocations) && typeof parsedPreallocations !== 'object') { 
          currentDefinition.preallocations = preallocations; 
        }
      } catch (e) {
        if (preallocations.trim() !== '') { 
          currentDefinition.preallocations = preallocations; 
        }
      }
    }

    Object.keys(currentDefinition).forEach(key => {
      if (currentDefinition[key] === undefined || 
          currentDefinition[key] === null || 
          (typeof currentDefinition[key] === 'number' && isNaN(currentDefinition[key])) ||
          (typeof currentDefinition[key] === 'string' && currentDefinition[key].trim() === '')) {
        delete currentDefinition[key];
      }
    });
    updateCurrencyDefinition(currentDefinition);
  }, [
    selectedOptions, currencyName, idRegFees, idReferralLevels, notarizationReward, proofProtocol, notarizationProtocol, expiryHeight, startBlock, endBlock,
    currencies, weights, conversions, minPreconversion, maxPreconversion, initialContributions, prelaunchDiscount, initialSupply, prelaunchCarveout, 
    preallocations, simpleTokenPreallocations,
    notaries, minNotariesConfirm, blockTime, powAveragingWindow, notarizationPeriod, eras, nodes, gatewayConverterName,
    isPBaaS, isGateway, isToken, isFractional, isNFT,
    updateCurrencyDefinition
  ]);

  // --- Render Helper Functions (renderTextField, renderJsonTextField) --- (These remain the same as before)
  const renderTextField = (label, value, onChange, type = "text", helperText = "", props = {}) => (
    <TextField label={label} variant="outlined" size="small" fullWidth type={type} value={value} onChange={(e) => onChange(e.target.value)} InputLabelProps={{ sx: { fontSize: '0.8rem' } }} inputProps={{ sx: { fontSize: '0.8rem', ...props.inputProps } }} helperText={helperText} FormHelperTextProps={{ sx: {fontSize: '0.65rem'} }} {...props} />
  );
  const renderJsonTextField = (label, value, onChange, helperText = "", props = {}) => (
    <TextField label={label} variant="outlined" size="small" fullWidth multiline minRows={2} value={value} onChange={(e) => onChange(e.target.value)} InputLabelProps={{ sx: { fontSize: '0.8rem' } }} inputProps={{ sx: { fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', ...props.inputProps } }} helperText={helperText} FormHelperTextProps={{ sx: {fontSize: '0.65rem'} }} {...props} />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#232323', borderRadius: 1, p:0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, backgroundColor: '#191919', flexShrink: 0}}>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>Define Currency Parameters</Typography>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5 }}>
        {/* Currency Options (Bitmask) - Collapsible Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: 1 }} onClick={() => setOptionsExpanded(!optionsExpanded)}>
          <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', fontWeight: '500' }}>Currency Options (Bitmask):</Typography>
          <IconButton size="small" sx={{ color: '#e0e0e0' }}>{optionsExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}</IconButton>
        </Box>
        {optionsExpanded && (
          <Paper sx={{p:1.5, background:'#2c2c2c', borderRadius:'4px'}}>
            <FormGroup>
              {currencyOptionsList.map((option) => (
                <Box key={option.value} sx={{ mb: 1.5, borderBottom: '1px solid #3b3b3b', pb: 1, '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 } }}>
                  <FormControlLabel control={<Checkbox checked={selectedOptions[option.value] || false} onChange={handleOptionChange} name={String(option.value)} size="small" sx={{py:0.1, color: '#888', '&.Mui-checked': {color: '#90caf9'} }} />} label={`${option.label} (Value: ${option.value})`} sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { fontSize: '0.8rem', color: '#c5cae9', fontWeight:'500' } }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#a0a0a0', ml: 4, mt: -0.5 }}>{option.description}</Typography>
                </Box>
              ))}
            </FormGroup>
          </Paper>
        )}
        
        {/* Core Parameters Section */}
        <Divider sx={{ my: 2, borderColor: '#444' }} />
        <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mb: 1.5, fontWeight: '500' }}>Core Parameters:</Typography>
        <Paper sx={{p:2, background:'#2c2c2c', borderRadius:'4px', display:'flex', flexDirection:'column', gap: 2}}>
          {renderTextField("Currency Name (must match an owned VerusID)", currencyName, setCurrencyName, "text", "Required. Name of an existing identity.")}
          {enableIDReferrals && (
            <>
              {renderTextField("ID Registration Fees (in native currency)", idRegFees, setIdRegFees, "number", "Price of an identity in this currency's namespace (if referrals enabled).", {inputProps: {step: "0.00000001"}})}
              {renderTextField("ID Referral Levels", idReferralLevels, setIdReferralLevels, "number", "How many levels ID referrals go back in reward (if referrals enabled).", {inputProps: {step: "1"}})}
            </>
          )}
          {showNotarizationReward && 
            renderTextField("Notarization Reward (Total VRSC for 1st period)", notarizationReward, setNotarizationReward, "number", "Required for PBaaS/Gateway Converters.", {inputProps: {step: "0.00000001"}})}
          {renderTextField("Proof Protocol (1: PBaaSMMR, 2: CHAINID, 3: ETH)", proofProtocol, setProofProtocol, "number", "Required. Protocol for proofs.", {inputProps: {step: "1"}})}
          {renderTextField("Notarization Protocol (e.g., 1, 2, or 3)", notarizationProtocol, setNotarizationProtocol, "number", "Optional. Protocol for notarizations (if different from proofprotocol).", {inputProps: {step: "1"}})}
          {renderTextField("Expiry Height (parent chain)", expiryHeight, setExpiryHeight, "number", "Optional. Block height at which the transaction expires (default: curheight + 20).", {inputProps: {step: "1"}})}
          {renderTextField("Start Block (Parent chain height for PBaaS)", startBlock, setStartBlock, "number", "Optional. For PBaaS, VRSC block notarized into its block 1. For others, currency activation.", {inputProps: {step: "1"}})}
          {renderTextField("End Block (0 = no end)", endBlock, setEndBlock, "number", "Optional. Chain/currency ends after this height. (Default: 0)", {inputProps: {step: "1"}})}
        </Paper>

        {/* Token Currency Parameters Section */}
        {isToken && !isFractional && !isNFT && (
          <>
            <Divider sx={{ my: 2, borderColor: '#444' }} />
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mb: 1.5, fontWeight: '500' }}>Token Currency Parameters:</Typography>
            <Paper sx={{p:2, background:'#2c2c2c', borderRadius:'4px', display:'flex', flexDirection:'column', gap: 2}}>
              {renderJsonTextField('Initial Contributions (e.g., for liquidity)', initialContributions, setInitialContributions, 'Optional. E.g., [{\"currencyid\": \"VRSC\", \"amount\": 100}]')}
              
              <Typography variant="body1" sx={{ color: '#c5cae9', fontSize: '0.85rem', mt: 1, fontWeight: '500' }}>Pre-allocations:</Typography>
              {simpleTokenPreallocations.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Box sx={{flex: 2}}>
                    {renderTextField(
                      `Recipient Identity ${index + 1}`,
                      item.identity,
                      (value) => handleSimplePreallocationChange(index, 'identity', value),
                      "text",
                      "E.g., Alice@ or iXYZ..."
                    )}
                  </Box>
                  <Box sx={{flex: 1}}>
                    {renderTextField(
                      `Amount ${index + 1}`,
                      item.amount,
                      (value) => handleSimplePreallocationChange(index, 'amount', value),
                      "number",
                      "E.g., 1000",
                      {inputProps: {step: "0.00000001"}}
                    )}
                  </Box>
                  <IconButton onClick={() => removeSimplePreallocation(index)} size="small" sx={{color: '#ff7961'}}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addSimplePreallocation}
                sx={{mt: 0, alignSelf: 'flex-start'}}
              >
                Add Preallocation
              </Button>
            </Paper>
          </>
        )}

        {/* Fractional Currency Parameters Section */}
        {isFractional && (
          <>
            <Divider sx={{ my: 2, borderColor: '#444' }} />
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mb: 1.5, fontWeight: '500' }}>Fractional Currency Parameters:</Typography>
            <Paper sx={{p:2, background:'#2c2c2c', borderRadius:'4px', display:'flex', flexDirection:'column', gap: 2}}>
              {renderJsonTextField('Reserve Currencies (JSON Array)', currencies, setCurrencies, 'Required. E.g., ["VRSC", "BTC"]')}
              {renderJsonTextField('Reserve Weights (JSON Array)', weights, setWeights, "Required. Must match currencies. E.g., [0.5,0.5]")}
              {renderTextField("Initial Supply (after conversion)", initialSupply, setInitialSupply, "number", "Required. Supply after conversion of contributions, before preallocation.", {inputProps: {step: "0.00000001"}})}
              {renderJsonTextField('Pre-launch Conversion Overrides', conversions, setConversions, 'Optional. E.g. [{\"VRSC\": 0.9, \"MYCOIN\": 1.0}]')}
              {renderJsonTextField('Minimum Pre-conversion to Launch', minPreconversion, setMinPreconversion, 'Optional. E.g., [1000, 500] for reserves.')}
              {renderJsonTextField('Maximum Pre-conversion Allowed', maxPreconversion, setMaxPreconversion, 'Optional. E.g., [100000, 50000]. [0] for unlimited.')}
              {renderJsonTextField('Initial Contributions to Reserves', initialContributions, setInitialContributions, 'Optional, if not using preconversion. E.g., [{\"currencyid\": \"iXXXX\", \"amount\": 100}]')}
              {renderTextField("Pre-launch Discount (e.g., 0.05 for 5%)", prelaunchDiscount, setPrelaunchDiscount, "number", "Optional. For fractional < 100% reserves.", {inputProps: {step: "0.00000001"}})}
              {renderTextField("Pre-launch Carveout (e.g., 0.1 for 10%)", prelaunchCarveout, setPrelaunchCarveout, "number", "Optional. % of pre-converted amounts from reserves.", {inputProps: {step: "0.00000001"}})}
              {renderJsonTextField('Pre-allocations (JSON Array - from converted supply)', preallocations, setPreallocations, 'Optional. E.g., [{\"identity@\": 1000}]. For simple token, use specific fields above.')}
            </Paper>
          </>
        )}
        
        {/* PBaaS Chain Parameters Section */}
        {isPBaaS && (
          <>
            <Divider sx={{ my: 2, borderColor: '#444' }} />
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mb: 1.5, fontWeight: '500' }}>PBaaS Chain Parameters:</Typography>
            <Paper sx={{p:2, background:'#2c2c2c', borderRadius:'4px', display:'flex', flexDirection:'column', gap: 2}}>
              {renderJsonTextField('Notaries (JSON Array of VerusIDs)', notaries, setNotaries, 'Optional. E.g., ["Alice@","Bob@"]')}
              {renderTextField("Min Notaries Confirm", minNotariesConfirm, setMinNotariesConfirm, "number", "Optional. Unique notary signatures required.", {inputProps: {step: "1"}})}
              {renderTextField("Block Time (seconds)", blockTime, setBlockTime, "number", "Optional. Target time between blocks (Default: 60).", {inputProps: {step: "1"}})}
              {renderTextField("PoW Averaging Window (blocks)", powAveragingWindow, setPowAveragingWindow, "number", "Optional. DAA window (Default: 45).", {inputProps: {step: "1"}})}
              {renderTextField("Notarization Period (minutes)", notarizationPeriod, setNotarizationPeriod, "number", "Optional. Min period for new notarization (Default: 10).", {inputProps: {step: "1"}})}
              {renderJsonTextField('Eras (JSON Array of Era Objects)', eras, setEras, 'Optional. Max 3. E.g., [{\"reward\": 1000, \"decay\": 0, \"halving\": 0, \"eraend\": 0}]')}
              {renderJsonTextField('Nodes (JSON Array of Node Objects)', nodes, setNodes, 'Optional. Max 5. E.g., [{\"networkaddress\":\"ip:port\", \"nodeidentity\":\"nodeid@\"}]')}
              {renderTextField("Co-launched Gateway Converter Name", gatewayConverterName, setGatewayConverterName, "text", "Optional. Name a co-launched gateway converter currency.")}
            </Paper>
          </>
        )}

        {/* Gateway Parameters Section */}
        {isGateway && (
          <>
            <Divider sx={{ my: 2, borderColor: '#444' }} />
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mb: 1.5, fontWeight: '500' }}>Gateway Parameters:</Typography>
            <Paper sx={{p:2, background:'#2c2c2c', borderRadius:'4px', display:'flex', flexDirection:'column', gap: 2}}>
              {!isPBaaS && renderJsonTextField('Notaries (JSON Array of VerusIDs)', notaries, setNotaries, 'Optional if not PBaaS. E.g., ["Alice@","Bob@"]')}
              {!isPBaaS && renderTextField("Min Notaries Confirm", minNotariesConfirm, setMinNotariesConfirm, "number", "Optional if not PBaaS. Unique notary signatures.", {inputProps: {step: "1"}})}
              {!isPBaaS && renderJsonTextField('Nodes (JSON Array of Node Objects)', nodes, setNodes, 'Optional if not PBaaS. Max 5. E.g., [{\"networkaddress\":\"ip:port\"}]')}
              {isPBaaS && <Typography sx={{fontSize: '0.75rem', color: '#888'}}>Notaries, Min Confirm, and Nodes are configured in PBaaS section.</Typography>}
            </Paper>
          </>
        )}

        {/* NFT Parameters Section */}
        {isNFT && (
          <>
            <Divider sx={{ my: 2, borderColor: '#444' }} />
            <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem', mb: 1.5, fontWeight: '500' }}>NFT Parameters:</Typography>
            <Paper sx={{p:2, background:'#2c2c2c', borderRadius:'4px', display:'flex', flexDirection:'column', gap: 2}}>
              {renderJsonTextField('Pre-allocations (JSON Array - for NFT definition)', preallocations, setPreallocations, 'Mandatory for tokenized control. E.g., [{\"ControlTokenRecipient@\":0.00000001}]. For simple token, use specific fields above.')}
              {renderJsonTextField('Max Pre-conversion (for NFT)', maxPreconversion, setMaxPreconversion, 'Optional. Recommended: [0] for tokenized control NFTs.')}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DefineCurrencyParamsCM; 