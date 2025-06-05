import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { NodeContext } from './NodeContext';

// Utility for persistent storage (Electron or localStorage fallback)
const STORAGE_KEY = 'verus_workbench_data';

// Initial default column sizes (percentages)
const DEFAULT_COLUMN_SIZES = {
  verusIdTab: [15, 20, 15, 20, 15, 15], // Updated for 6 columns
  vdxfTab: [13, 13, 18, 18, 13, 15, 10], // Stays 7 columns (as per last VDXF setup)
  currencyTab: [13, 13, 18, 18, 13, 15, 10], // Stays 7 columns
  walletMainTabSplit: [30, 45, 25],
  walletTabSelectorDetailsSplit: [50, 50],
  walletTabVerticalSplit: [34, 33, 33]
};

function robustNormalizeSizes(loadedSizes, defaultSizes, tabKeyForLog = 'unknownTab', minPercentage = 5) {
  let currentSizes = [...defaultSizes]; // Start with a copy of default as a base

  if (Array.isArray(loadedSizes) && loadedSizes.length === defaultSizes.length) {
    currentSizes = loadedSizes.map(s => {
      const num = parseFloat(s);
      return isNaN(num) || num < 0 ? minPercentage : Math.max(0, num); // Ensure positive numbers, default to min if NaN
    });
  } else if (Array.isArray(loadedSizes)) {
    console.warn(`[WBDataCtx][${tabKeyForLog}] Loaded sizes length ${loadedSizes.length} !== default ${defaultSizes.length}. Resetting.`);
    // currentSizes is already defaultSizes copy
  } else if (loadedSizes !== undefined) {
    console.warn(`[WBDataCtx][${tabKeyForLog}] Loaded sizes is not an array. Resetting.`);
    // currentSizes is already defaultSizes copy
  }

  // Clamp to minimum percentage for all elements first
  currentSizes = currentSizes.map(s => Math.max(minPercentage, s));
  
  let sum = currentSizes.reduce((a, b) => a + b, 0);

  if (sum === 0 && currentSizes.length > 0) { // Avoid division by zero if all were clamped to 0 (e.g. bad input)
      console.warn(`[WBDataCtx][${tabKeyForLog}] Sum of sizes is 0 after clamping, distributing equally.`);
      const equalShare = 100 / currentSizes.length;
      currentSizes = currentSizes.map(() => equalShare);
      sum = 100;
  }

  // Scale to 100% if not already there
  if (Math.abs(sum - 100) > 0.01) { // Allow small tolerance for floating point
    const factor = 100 / sum;
    currentSizes = currentSizes.map(s => s * factor);
  }

  // Final pass to ensure sum is exactly 100 by adjusting the largest element(s)
  sum = currentSizes.reduce((a, b) => a + b, 0);
  let diff = 100 - sum;

  if (Math.abs(diff) > 0.0001) { // If there's still a notable difference
    // Try to distribute the difference proportionally to elements that are above minPercentage
    let totalAboveMin = 0;
    currentSizes.forEach(s => { if (s > minPercentage) totalAboveMin += s; });

    if (totalAboveMin > 0) {
      for (let i = 0; i < currentSizes.length; i++) {
        if (currentSizes[i] > minPercentage) {
          currentSizes[i] += diff * (currentSizes[i] / totalAboveMin);
        }
      }
    } else {
      // If all are at minPercentage, distribute to the first one that can take it
      currentSizes[0] += diff;
    }
  }
  // Final clamp and one last sum check for the very first element due to multiple adjustments
  currentSizes = currentSizes.map(s => Math.max(minPercentage, s));
  sum = currentSizes.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.0001 && currentSizes.length > 0) {
      currentSizes[0] += (100-sum);
  }

  // console.log(`[WBDataCtx][${tabKeyForLog}] Final normalized sizes:`, currentSizes.map(s => parseFloat(s.toFixed(4))));
  return currentSizes.map(s => parseFloat(s.toFixed(4))); // Return with some precision
}

// Make the function async
async function loadPersistedData() { 
  console.log('[WorkbenchDataContext] Attempting to load persisted data...');
  let parsedData = {};
  if (window.electron && window.electron.store && typeof window.electron.store.get === 'function') {
    try {
        parsedData = await window.electron.store.get(STORAGE_KEY) || {}; 
    } catch (e) {
        console.error('[WorkbenchDataContext] Error loading from electron-store:', e);
        parsedData = {};
    }
  } else {
    console.warn('[WorkbenchDataContext] electron-store not available, using empty defaults for persisted data.');
    parsedData = {}; // Ensure parsedData is an object if store is not available
  }
  
  const loadedColumnSizes = {};
  loadedColumnSizes.verusIdTab = robustNormalizeSizes(parsedData.columnSizes?.verusIdTab, DEFAULT_COLUMN_SIZES.verusIdTab, 'verusIdTab');
  loadedColumnSizes.vdxfTab = robustNormalizeSizes(parsedData.columnSizes?.vdxfTab, DEFAULT_COLUMN_SIZES.vdxfTab, 'vdxfTab');
  loadedColumnSizes.currencyTab = robustNormalizeSizes(parsedData.columnSizes?.currencyTab, DEFAULT_COLUMN_SIZES.currencyTab, 'currencyTab');
  loadedColumnSizes.walletMainTabSplit = robustNormalizeSizes(parsedData.columnSizes?.walletMainTabSplit, DEFAULT_COLUMN_SIZES.walletMainTabSplit, 'walletMainTabSplit');
  loadedColumnSizes.walletTabSelectorDetailsSplit = robustNormalizeSizes(parsedData.columnSizes?.walletTabSelectorDetailsSplit, DEFAULT_COLUMN_SIZES.walletTabSelectorDetailsSplit, 'walletTabSelectorDetailsSplit');
  loadedColumnSizes.walletTabVerticalSplit = robustNormalizeSizes(parsedData.columnSizes?.walletTabVerticalSplit, DEFAULT_COLUMN_SIZES.walletTabVerticalSplit, 'walletTabVerticalSplit');

  parsedData.hiddenVerusIds = {};
  parsedData.hiddenRAddresses = {};
  parsedData.hiddenZAddresses = {};
  // console.log('[WorkbenchDataContext] Hidden states RESET for testing.');
  
  // Process cryptoOperations: ensure it's an array, discard old object format
  let loadedCryptoOperations = parsedData.cryptoOperations;
  if (typeof loadedCryptoOperations === 'object' && !Array.isArray(loadedCryptoOperations) && loadedCryptoOperations !== null) {
    console.warn('[WorkbenchDataContext] Old object format for cryptoOperations found in persistent storage. Discarding and starting fresh with an array.');
    loadedCryptoOperations = []; // Start fresh
  } else if (!Array.isArray(loadedCryptoOperations)) {
    // If it's not an array for any other reason (e.g. undefined, null but not object), default to empty array
    loadedCryptoOperations = []; 
  }
  
  const finalLoadedData = {
      pendingNameCommitments: parsedData.pendingNameCommitments || [],
      cryptoOperations: loadedCryptoOperations, // Use the processed array
      stagedCurrencyDefinitions: parsedData.stagedCurrencyDefinitions || [],
      hiddenVerusIds: parsedData.hiddenVerusIds || {},
      hiddenRAddresses: parsedData.hiddenRAddresses || {},
      hiddenZAddresses: parsedData.hiddenZAddresses || {},
      columnSizes: loadedColumnSizes,
      rAddressData: parsedData.rAddressData || [],
      zAddressData: parsedData.zAddressData || []
  };
  console.log('[WorkbenchDataContext] loadPersistedData - Returning finalLoadedData:', finalLoadedData);
  return finalLoadedData;
}

function savePersistedData(data) {
  console.log('[WorkbenchDataContext] Attempting to save persisted data (using electron-store ONLY):', data);
  if (window.electron && window.electron.store && typeof window.electron.store.set === 'function') {
    try {
      window.electron.store.set(STORAGE_KEY, data);
      console.log('[WorkbenchDataContext] Saved to electron-store successfully.');
    } catch (e) {
      console.error('[WorkbenchDataContext] Error saving to electron-store:', e);
    }
  } else {
      console.error('[WorkbenchDataContext] electron-store (window.electron.store.set) not available! Data NOT saved.');
  }
}

export const WorkbenchDataContext = createContext();

export const WorkbenchDataProvider = ({ children }) => {
  // --- Data State ---
  const [rAddressData, setRAddressData] = useState([]); // NEW STATE: [{address, nativeBalance, allBalances: {curr:amt,...}}]
  const [zAddressData, setZAddressData] = useState([]); // NEW STATE: [{address, balance, allBalances: {curr:amt,...}}]
  const [pendingNameCommitments, setPendingNameCommitments] = useState([]);
  const [cryptoOperations, setCryptoOperations] = useState([]); // Initialized as array
  const [columnSizes, setColumnSizes] = useState(DEFAULT_COLUMN_SIZES);
  // New state for hidden items
  const [hiddenVerusIds, setHiddenVerusIds] = useState({});
  const [hiddenRAddresses, setHiddenRAddresses] = useState({});
  const [hiddenZAddresses, setHiddenZAddresses] = useState({});
  const [stagedCurrencyDefinitions, setStagedCurrencyDefinitions] = useState([]);

  // NodeContext for RPC
  const { sendCommand, nodeStatus } = useContext(NodeContext) || {};

  // Ref for the debounce timer
  const saveTimeoutRef = useRef(null);

  // --- Load from persistent storage on mount (handle async load) ---
  useEffect(() => {
    // Define an async function inside useEffect
    async function loadInitialData() {
      console.log('[WorkbenchDataContext] Load useEffect triggered.');
      // Await the async load function
      const data = await loadPersistedData(); 
      console.log('[WorkbenchDataContext] Data loaded in useEffect (RAddresses excluded):', data);
      setPendingNameCommitments(data.pendingNameCommitments || []);
      setCryptoOperations(data.cryptoOperations || []); // Set as array
      setStagedCurrencyDefinitions(data.stagedCurrencyDefinitions || []);
      setHiddenVerusIds(data.hiddenVerusIds || {});
      setHiddenRAddresses(data.hiddenRAddresses || {});
      setHiddenZAddresses(data.hiddenZAddresses || {});
      setColumnSizes(data.columnSizes); // Defaults handled in loadPersistedData
      
      // Load Z-address data if available
      if (data.zAddressData && Array.isArray(data.zAddressData)) {
        setZAddressData(data.zAddressData);
      }
      
      console.log('[WorkbenchDataContext] Initial state set from loaded data.');
    }
    
    loadInitialData(); // Call the async function

  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Save to persistent storage on change (with Debounce) ---
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after a delay
    saveTimeoutRef.current = setTimeout(() => {
      const dataToSave = { 
          rAddressData, // SAVE NEW STATE
          zAddressData, // Save Z-address data
          pendingNameCommitments, 
          cryptoOperations, 
          stagedCurrencyDefinitions,
          columnSizes, 
          hiddenVerusIds, 
          hiddenRAddresses,
          hiddenZAddresses
      };
      console.log('[WorkbenchDataContext] Debounced Save useEffect triggered. Data to save:', dataToSave);
      savePersistedData(dataToSave); 
    }, 500); // Debounce delay: 500ms

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [rAddressData, zAddressData, pendingNameCommitments, cryptoOperations, stagedCurrencyDefinitions, columnSizes, hiddenVerusIds, hiddenRAddresses, hiddenZAddresses]); // Dependencies still trigger the effect

  // --- Fetch all R-addresses with UTXOs using listunspent ---
  const fetchAndSetRAddressesWithUtxos = useCallback(async () => {
    if (!sendCommand || !nodeStatus || !nodeStatus.connected) {
      setRAddressData([]); // Clear data if not connected
      return;
    }
    console.log('[WorkbenchDataContext] Fetching R-Address data using listaddressgroupings and listunspent...');
    try {
      // Step 1: Get all unique R-addresses from the wallet
      // listaddressgroupings returns an array of arrays of address groups.
      // Each group: [[address, balance, account], [address, balance, account], ...]
      const groupings = await sendCommand('listaddressgroupings', [], 'wallet_r_addresses');
      const uniqueRAddresses = new Set();
      if (Array.isArray(groupings)) {
        groupings.forEach(group => {
          if (Array.isArray(group)) {
            group.forEach(addrInfo => {
              if (typeof addrInfo[0] === 'string' && addrInfo[0].startsWith('R')) {
                uniqueRAddresses.add(addrInfo[0]);
              }
            });
          }
        });
      }

      if (uniqueRAddresses.size === 0) {
        console.log('[WorkbenchDataContext] No R-addresses found in wallet via listaddressgroupings.');
        setRAddressData([]);
        return;
      }

      const nativeChainTicker = nodeStatus.chainName || 'VRSCTEST'; // Determine native currency
      const processedRAddressData = [];

      for (const rAddress of uniqueRAddresses) {
        let nativeBalance = 0;
        const allBalances = {}; // This will store { currency_id_or_name: total_amount }
        try {
          const utxos = await sendCommand('listunspent', [0, 9999999, [rAddress]], 'wallet_utxos_for_' + rAddress);
          if (Array.isArray(utxos)) {
            utxos.forEach(utxo => {
              if (utxo.currencyvalues && typeof utxo.currencyvalues === 'object' && Object.keys(utxo.currencyvalues).length > 0) {
                // This UTXO has specific currency values (non-native or tokenized native)
                for (const [currencyId, currencyAmount] of Object.entries(utxo.currencyvalues)) {
                  const amountNum = parseFloat(currencyAmount) || 0;
                  allBalances[currencyId] = (allBalances[currencyId] || 0) + amountNum;
                  // Check if this currencyId IS the nativeChainTicker ID (less common for currencyvalues but possible)
                  if (currencyId === nativeChainTicker || currencyId === nodeStatus.currencyid) { // Compare with both ticker and i-address of native currency
                    nativeBalance += amountNum;
                  }
                }
              } else if (utxo.amount && typeof utxo.amount === 'number' && utxo.amount > 0) {
                // This UTXO likely represents the native currency or a simple token where amount is primary
                const currencyName = utxo.currencyname || nativeChainTicker; // Default to native if currencyname is absent
                allBalances[currencyName] = (allBalances[currencyName] || 0) + utxo.amount;
                if (currencyName === nativeChainTicker) {
                  nativeBalance += utxo.amount;
                }
              }
              // Note: A single UTXO might have both `amount` (for native part) and `currencyvalues` (for tokens) 
              // The above logic handles them somewhat separately. If a UTXO has native amount AND other currencyvalues,
              // the native amount from `utxo.amount` should also contribute to `nativeBalance` and `allBalances[nativeChainTicker]`.
              // The current structure might slightly miscount if a UTXO has both native `amount` and `currencyvalues` that include native.
              // However, `listunspent` usually presents these cleanly: either `amount` for native, or `currencyvalues` for tokens/other chains.
            });
          }
        } catch (utxoError) {
          console.error(`[WorkbenchDataContext] Error fetching UTXOs for ${rAddress}:`, utxoError);
        }
        processedRAddressData.push({ 
          address: rAddress, 
          nativeBalance: parseFloat(nativeBalance.toFixed(8)), 
          allBalances 
        });
      }

      setRAddressData(processedRAddressData);
      console.log('[WorkbenchDataContext] Processed R-Address Data:', processedRAddressData);

    } catch (e) {
      console.error("[WorkbenchDataContext] Error in fetchAndSetRAddressesWithUtxos:", e);
      setRAddressData([]); // Set to empty array on error
    }
  }, [sendCommand, nodeStatus]);

  // --- NEW FUNCTION: Fetch all Z-addresses with balances ---
  const fetchAndSetZAddressesWithBalances = useCallback(async () => {
    if (!sendCommand || !nodeStatus || !nodeStatus.connected) {
      setZAddressData([]); // Clear data if not connected
      return;
    }
    console.log('[WorkbenchDataContext] Fetching Z-Address data using z_listaddresses and z_getbalance...');
    try {
      const addresses = await sendCommand('z_listaddresses', [true], 'global_z_list');
      
      if (Array.isArray(addresses)) {
        if (addresses.length === 0) {
          console.log('[WorkbenchDataContext] No Z-addresses found in wallet.');
          setZAddressData([]);
          return;
        }
        
        const nativeChainTicker = nodeStatus.chainName || 'VRSCTEST';
        const addressesWithBalances = await Promise.all(
          addresses.map(async (addr) => {
            try {
              const balance = await sendCommand('z_getbalance', [addr, 0], `global_z_balance_${addr}`);
              return { 
                address: addr, 
                balance: parseFloat(balance),
                allBalances: { [nativeChainTicker]: parseFloat(balance) } 
              };
            } catch (balanceError) {
              console.error(`[WorkbenchDataContext] Error fetching balance for Z-Address ${addr}:`, balanceError);
              return { address: addr, balance: 0, allBalances: {} };
            }
          })
        );
        
        console.log('[WorkbenchDataContext] Setting Z-address data with balances:', addressesWithBalances);
        setZAddressData(addressesWithBalances);
      } else {
        console.error("[WorkbenchDataContext] Unexpected result format from z_listaddresses:", addresses);
        setZAddressData([]); 
      }
    } catch (e) {
      console.error("[WorkbenchDataContext] Error in fetchAndSetZAddressesWithBalances:", e);
      setZAddressData([]); // Set to empty array on error
    }
  }, [sendCommand, nodeStatus]);

  // --- Initialize Z-addresses when node connects ---
  useEffect(() => {
    if (nodeStatus?.connected && zAddressData.length === 0) {
      console.log('[WorkbenchDataContext] Node connected and no Z-addresses loaded. Fetching Z-addresses...');
      fetchAndSetZAddressesWithBalances();
    }
  }, [nodeStatus?.connected, zAddressData.length, fetchAndSetZAddressesWithBalances]);

  // --- Name Commitments ---
  const addNameCommitment = useCallback((commitment) => {
    setPendingNameCommitments(prev => {
      // Check if commitment already exists (by txid)
      if (prev.some(c => c.txid === commitment.txid)) {
          console.log('[WorkbenchDataContext] Commitment already exists, not adding:', commitment.txid);
          return prev; // Don't add duplicate
      }
      console.log('[WorkbenchDataContext] Adding new commitment:', commitment);
      const newState = [...prev, commitment];
      console.log('[WorkbenchDataContext] New pendingNameCommitments state:', newState);
      return newState;
    });
  }, []);
  const removeNameCommitment = useCallback((txid) => {
    setPendingNameCommitments(prev => prev.filter(c => c.txid !== txid));
  }, []);
  const clearNameCommitments = useCallback(() => setPendingNameCommitments([]), []);

  // --- Crypto Operations (Corrected to maintain a flat array) ---
  const addCryptoOperation = useCallback((opResult) => {
    if (!opResult || !opResult.operation || !opResult.signer) {
        console.warn('[WorkbenchDataContext] addCryptoOperation called with invalid opResult (missing operation or signer). Skipping.', opResult);
        return;
    }
    setCryptoOperations(prevCryptoOperations => [opResult, ...prevCryptoOperations]);
    console.log('[WorkbenchDataContext] Added crypto operation, new log length:', cryptoOperations.length + 1, opResult);
  }, []);
  
  const removeCryptoOperation = useCallback((indexToRemove) => {
    setCryptoOperations(prevCryptoOperations => prevCryptoOperations.filter((_, index) => index !== indexToRemove));
  }, []);

  const clearCryptoOperations = useCallback(() => {
    setCryptoOperations([]);
  }, []);

  // --- Column Sizes ---
  const updateColumnSizes = useCallback((tabKey, newSizes) => {
    setColumnSizes(prev => ({ ...prev, [tabKey]: newSizes }));
  }, []);

  // --- Visibility Toggles ---
  const toggleVerusIdVisibility = useCallback((idName) => {
    if (!idName) return;
    const trimmedIdName = idName.trim();
    setHiddenVerusIds(prev => ({
      ...prev,
      [trimmedIdName]: !prev[trimmedIdName] // Toggle boolean value
    }));
  }, []);

  const toggleRAddressVisibility = useCallback((rAddress) => {
    if (!rAddress) return;
    const trimmedAddress = rAddress.trim();
    setHiddenRAddresses(prev => ({
      ...prev,
      [trimmedAddress]: !prev[trimmedAddress] // Toggle boolean value
    }));
  }, []);

  const toggleZAddressVisibility = useCallback((zAddress) => {
    if (!zAddress) return;
    const trimmedAddress = String(zAddress).trim(); // Ensure it's a string before trim
    setHiddenZAddresses(prev => ({
      ...prev,
      [trimmedAddress]: !prev[trimmedAddress]
    }));
  }, []);

  // --- Staged Currency Definitions ---
  const addStagedCurrencyDefinition = useCallback((definition) => {
    setStagedCurrencyDefinitions(prev => {
      // Use defineTxid as a unique key for the definition entry
      if (prev.some(d => d.defineTxid === definition.defineTxid)) {
        console.log('[WorkbenchDataContext] Staged currency definition already exists:', definition.defineTxid);
        return prev; // Don't add duplicate
      }
      console.log('[WorkbenchDataContext] Adding new staged currency definition:', definition);
      return [definition, ...prev]; // Prepend new definition
    });
  }, []);

  const removeStagedCurrencyDefinition = useCallback((defineTxid) => {
    console.log('[WorkbenchDataContext] Removing staged currency definition:', defineTxid);
    setStagedCurrencyDefinitions(prev => prev.filter(d => d.defineTxid !== defineTxid));
  }, []);

  const clearAllStagedCurrencyDefinitions = useCallback(() => {
    console.log('[WorkbenchDataContext] Clearing all staged currency definitions.');
    setStagedCurrencyDefinitions([]);
  }, []);

  // --- Copy utility (returns stringified data for clipboard) ---
  const getCopyString = (data) => {
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  return (
    <WorkbenchDataContext.Provider value={{
      rAddressData,
      fetchAndSetRAddressesWithUtxos,
      zAddressData,
      setZAddressData,
      fetchAndSetZAddressesWithBalances,
      pendingNameCommitments, addNameCommitment, removeNameCommitment, clearNameCommitments,
      cryptoOperations, addCryptoOperation, removeCryptoOperation, clearCryptoOperations,
      stagedCurrencyDefinitions, addStagedCurrencyDefinition, removeStagedCurrencyDefinition, clearAllStagedCurrencyDefinitions,
      columnSizes, updateColumnSizes, // Provide column size state and updater
      hiddenVerusIds, toggleVerusIdVisibility,
      hiddenRAddresses, toggleRAddressVisibility,
      hiddenZAddresses, toggleZAddressVisibility,
      getCopyString
    }}>
      {children}
    </WorkbenchDataContext.Provider>
  );
}; 