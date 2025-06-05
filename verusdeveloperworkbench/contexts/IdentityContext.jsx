import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useVerusRpc } from '../hooks/useVerusRpc'; // Adjust path
import { NodeContext } from './NodeContext'; // Adjust path
import { filterTicketIds } from '../utils/ticketFilter';
// import { useLocalStorage } from '../hooks/useLocalStorage'; // For nameCommitments later

export const IdentityContext = createContext();

// Simple cache for parent currency names
const parentCurrencyNameCache = new Map();

export const IdentityProvider = ({ children }) => {
  const [identities, setIdentities] = useState([]);
  const [loadingIdentities, setLoadingIdentities] = useState(false);
  const [listVersion, setListVersion] = useState(0); // <-- New state for list version
  
  // Balances for all listed identities
  const [identityBalances, setIdentityBalances] = useState({}); // { [iaddress]: balanceInfo }
  const [loadingAllBalances, setLoadingAllBalances] = useState(false);

  // For VerusID Operations Tab
  const [selectedIdName, setSelectedIdName] = useState(null); 
  const [identityDetails, setIdentityDetails] = useState(null); // This will be updated to include history-based maps
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [identityHistoryForOps, setIdentityHistoryForOps] = useState([]); // New state for Ops tab history
  const [loadingHistoryForOps, setLoadingHistoryForOps] = useState(false); // New loading state
  const [errorHistoryForOps, setErrorHistoryForOps] = useState(null);     // New error state
  const [transparentBalance, setTransparentBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  // New state variables for VerusID Operations tab (for persistence)
  const [selectedIdNameForVerusIdOps, setSelectedIdNameForVerusIdOps] = useState(null);
  const [selectedRAddressForVerusIdOps, setSelectedRAddressForVerusIdOps] = useState(null);
  const [selectedZAddressForVerusIdOps, setSelectedZAddressForVerusIdOps] = useState(null);
  
  // For VDXF Management Tab
  const [selectedIdentityForVDXF, setSelectedIdentityForVDXF] = useState(null); // NAME STRING of selected ID for VDXF tab
  const [vdxfIdentityDetails, setVdxfIdentityDetails] = useState(null); // OBJECT of selected ID content for VDXF tab
  const [loadingVdxfDetails, setLoadingVdxfDetails] = useState(false); // Loading for vdxfIdentityDetails
  const [errorVdxfDetails, setErrorVdxfDetails] = useState(null);     // Error for vdxfIdentityDetails
  const [identityHistoryForVDXF, setIdentityHistoryForVDXF] = useState([]);
  const [loadingHistoryForVDXF, setLoadingHistoryForVDXF] = useState(false);
  const [errorHistoryForVDXF, setErrorHistoryForVDXF] = useState(null);
  const [selectedRAddressForVDXF, setSelectedRAddressForVDXF] = useState(null); // New for VDXF R-Addr selection
  const [selectedZAddressForVDXF, setSelectedZAddressForVDXF] = useState(null); // New for VDXF Z-Addr selection

  const [availableRAddresses, setAvailableRAddresses] = useState([]);

  // Add state for selected R-Address
  const [selectedRAddress, setSelectedRAddress] = useState(null); 
  // New state for R-Address related identities
  const [identitiesForSelectedRAddress, setIdentitiesForSelectedRAddress] = useState([]);
  const [loadingIdentitiesForRAddress, setLoadingIdentitiesForRAddress] = useState(false);
  const [errorIdentitiesForRAddress, setErrorIdentitiesForRAddress] = useState(null);

  // For Currency Management Tab
  const [selectedCurrencyIdentity, setSelectedCurrencyIdentity] = useState(null); // Stores name@ of selected currency ID
  const [selectedVerusIdCM, setSelectedVerusIdCM] = useState(null); // For the VerusID selected in CM's first column

  // For Wallet Management Tab
  const [selectedVerusIdWM, setSelectedVerusIdWM] = useState(null);
  const [selectedRAddressWM, setSelectedRAddressWM] = useState(null);
  const [selectedZAddressWM, setSelectedZAddressWM] = useState(null);

  // New states for VerusID Details in Currency Management tab
  const [verusIdDetailsForCM, setVerusIdDetailsForCM] = useState(null);
  const [loadingVerusIdDetailsCM, setLoadingVerusIdDetailsCM] = useState(false);
  const [errorVerusIdDetailsCM, setErrorVerusIdDetailsCM] = useState(null);
  const [identityHistoryForCM, setIdentityHistoryForCM] = useState([]);
  const [loadingHistoryForCM, setLoadingHistoryForCM] = useState(false);
  const [errorHistoryForCM, setErrorHistoryForCM] = useState(null);

  // New state for total native balance
  const [totalNativeBalance, setTotalNativeBalance] = useState(null);
  const [loadingTotalNativeBalance, setLoadingTotalNativeBalance] = useState(false);

  // --- Currency Management Tab State (independent from main selections) ---
  const [selectedIdentityForCurrencyWS, setSelectedIdentityForCurrencyWS] = useState(null);
  const [selectedRAddressForCurrencyWS, setSelectedRAddressForCurrencyWS] = useState(null);
  const [selectedZAddressForCurrencyWS, setSelectedZAddressForCurrencyWS] = useState(null);
  const [currencyWSIdentityDetails, setCurrencyWSIdentityDetails] = useState(null);
  const [errorCurrencyWSDetails, setErrorCurrencyWSDetails] = useState(null);
  const [loadingCurrencyWSDetails, setLoadingCurrencyWSDetails] = useState(false);
  const [identityHistoryForCurrencyWS, setIdentityHistoryForCurrencyWS] = useState([]);
  const [errorHistoryForCurrencyWS, setErrorHistoryForCurrencyWS] = useState(null);
  const [loadingHistoryForCurrencyWS, setLoadingHistoryForCurrencyWS] = useState(false);

  const { nodeStatus, sendCommand } = useContext(NodeContext);

  const fetchBasicIdentitiesOnly = useCallback(async () => {
    if (!nodeStatus.connected || typeof sendCommand !== 'function') {
      setIdentities([]);
      setLoadingIdentities(false);
      return;
    }
    console.log('[IdentityContext] Fetching basic identities ONLY...');
    setLoadingIdentities(true);
    setIdentities([]); // Clear previous identities
    try {
      const result = await sendCommand('listidentities', [], 'identity_list_basic_query');
      if (result && Array.isArray(result)) {
        // Apply ticket filtering at frontend level for consistency
        const filteredResult = filterTicketIds(result);
        setIdentities(filteredResult);
      } else if (result && result.error) {
        console.error('Error fetching basic identities:', result.error);
      } else {
        console.warn('Unexpected result fetching basic identities:', result);
      }
    } catch (err) {
      console.error('Error in fetchBasicIdentitiesOnly catch:', err);
    } finally {
      setLoadingIdentities(false);
    }
  }, [sendCommand, nodeStatus.connected]);

  const fetchIdentities = useCallback(async (includeCanSpendFor = true, includeWatchOnly = true, includeCanSignFor = false) => {
    if (!nodeStatus.connected || typeof sendCommand !== 'function') {
      setIdentities([]);
      setIdentityBalances({});
      setLoadingIdentities(false);
      setLoadingAllBalances(false);
      return;
    }
    console.log('[IdentityContext] Fetching ALL identities with full details and enhanced display names...');
    setLoadingIdentities(true);
    setLoadingAllBalances(true);
    setIdentities([]); 
    setIdentityBalances({});

    const nativeChainIAddress = nodeStatus?.chainActive?.identityaddress || 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq'; // Fallback for VRSCTEST

    try {
      const baseIdentityList = await sendCommand('listidentities', [includeCanSpendFor, includeWatchOnly, includeCanSignFor], 'identity_list_base');
      
      if (baseIdentityList && Array.isArray(baseIdentityList)) {
        // Apply ticket filtering at frontend level for consistency
        const filteredBaseList = filterTicketIds(baseIdentityList);
        
        const detailedIdentitiesPromises = filteredBaseList.map(async (baseItem) => {
          if (baseItem && baseItem.identity && baseItem.identity.name) {
            const identityBase = baseItem.identity;
            const originalName = identityBase.name;
            let displayName = originalName.endsWith('@') ? originalName : `${originalName}@`;
            let identityNameForRpc = displayName;

            if (originalName === 'subid') {
              console.log(`[fetchIdentities] Processing item: ${originalName}, initial displayName: ${displayName}, parent: ${identityBase.parent}, identityaddress: ${identityBase.identityaddress}`);
            }

            try {
              const parentIAddr = identityBase.parent;
              let parentFriendlyNameForRpc = null;

              if (parentIAddr && parentIAddr !== nativeChainIAddress && parentIAddr !== identityBase.identityaddress) {
                if (originalName === 'subid') {
                  console.log(`[fetchIdentities] subid: Is sub-id of a different parent. Parent iAddr: ${parentIAddr}, Native iAddr: ${nativeChainIAddress}`);
                }
                parentFriendlyNameForRpc = parentCurrencyNameCache.get(parentIAddr);
                if (parentFriendlyNameForRpc) {
                  if (originalName === 'subid') console.log(`[fetchIdentities] subid: Found parent '${parentFriendlyNameForRpc}' in cache.`);
                } else {
                  if (originalName === 'subid') console.log(`[fetchIdentities] subid: Parent not in cache, fetching for ${parentIAddr}...`);
                  try {
                    const parentCurrencyData = await sendCommand('getcurrency', [parentIAddr], `get_parent_currency_name_${parentIAddr}`);
                    if (originalName === 'subid') console.log(`[fetchIdentities] subid: getcurrency result for parent ${parentIAddr}:`, parentCurrencyData);
                    if (parentCurrencyData && parentCurrencyData.name) {
                      parentFriendlyNameForRpc = parentCurrencyData.name;
                      parentCurrencyNameCache.set(parentIAddr, parentFriendlyNameForRpc);
                      if (originalName === 'subid') console.log(`[fetchIdentities] subid: Successfully fetched and cached parent name: ${parentFriendlyNameForRpc}`);
                    } else {
                       if (originalName === 'subid') console.log(`[fetchIdentities] subid: getcurrency for parent ${parentIAddr} did not return .name or was invalid.`);
                    }
                  } catch (e) {
                    console.warn(`[IdentityContext] Error fetching parent currency name for ${parentIAddr}:`, e);
                    if (originalName === 'subid') console.log(`[fetchIdentities] subid: Error in getcurrency for parent ${parentIAddr}:`, e);
                  }
                }
              } else {
                 if (originalName === 'subid') console.log(`[fetchIdentities] subid: Not considered a sub-id of a different parent based on conditions. Parent: ${parentIAddr}, Native: ${nativeChainIAddress}, Self: ${identityBase.identityaddress}`);
              }

              if (parentFriendlyNameForRpc) {
                identityNameForRpc = `${originalName}.${parentFriendlyNameForRpc}@`;
                displayName = identityNameForRpc;
                if (originalName === 'subid') console.log(`[fetchIdentities] subid: displayName set to FQN: ${displayName}, identityNameForRpc: ${identityNameForRpc}`);
              } else {
                // Ensure identityNameForRpc and displayName end with @ if not a resolved sub-id
                if (!originalName.endsWith('@')) {
                    identityNameForRpc = `${originalName}@`;
                    displayName = identityNameForRpc;
                } else {
                    displayName = originalName;
                    identityNameForRpc = originalName;
                }
                if (originalName === 'subid') console.log(`[fetchIdentities] subid: displayName (no parent found or not FQN): ${displayName}, identityNameForRpc: ${identityNameForRpc}`);
              }
              
              const fullDetails = await sendCommand('getidentity', [identityNameForRpc], `getidentity_for_list_${originalName}`);
              
              if (fullDetails && fullDetails.identity) {
                // Parent friendly name already resolved for displayName, just ensure structure.
                let balanceInfo = { error: 'Balance not fetched' };
                const iaddress = fullDetails.identity.identityaddress;
                if (iaddress) {
                    try {
                        const balanceData = await sendCommand('getcurrencybalance', [iaddress, 0], `balance_query_list_${iaddress}`);
                        if (balanceData && typeof balanceData === 'object' && !balanceData.error) {
                            balanceInfo = balanceData;
                        } else if (typeof balanceData === 'number') { 
                            const nativeTicker = nodeStatus?.chainName || 'VRSCTEST';
                            balanceInfo = { [nativeTicker]: balanceData };
                        } else {
                          console.warn(`No valid balance object for ${iaddress} from getcurrencybalance:`, balanceData);
                          balanceInfo = { error: 'Failed to retrieve balances' };
                        }
                    } catch (balanceError) {
                        console.warn(`Balance fetch error for ${iaddress}:`, balanceError);
                        balanceInfo = { error: balanceError.message || 'Balance fetch failed' };
                    }
                }

                return {
                  ...baseItem,
                  status: fullDetails.status,
                  flags: identityBase.flags,
                  timelock: fullDetails.identity.timelock,
                  displayName: displayName, 
                  identity: { 
                    ...fullDetails.identity, 
                    ...identityBase 
                  },
                  balanceData: balanceInfo 
                };
              } else {
                if (originalName === 'subid') console.warn(`[fetchIdentities] subid: Failed to get full details for ${identityNameForRpc}, using base info.`);
                return { ...baseItem, displayName, balanceData: { error: 'Details fetch failed'} }; 
              }
            } catch (detailError) {
              if (originalName === 'subid') console.warn(`[fetchIdentities] subid: Outer catch error for ${identityNameForRpc}:`, detailError);
              return { ...baseItem, displayName, balanceData: { error: 'Details fetch error'} }; 
            }
          }
          return null; 
        });

        const resolvedIdentitiesWithDetails = (await Promise.all(detailedIdentitiesPromises)).filter(Boolean);
        
        const finalBalancesMap = {};
        resolvedIdentitiesWithDetails.forEach(item => {
            if (item.identity && item.identity.identityaddress && item.balanceData) {
                finalBalancesMap[item.identity.identityaddress] = item.balanceData;
            }
        });

        setIdentities(resolvedIdentitiesWithDetails);
        setIdentityBalances(finalBalancesMap);
        setListVersion(prev => prev + 1); // <-- Increment list version
      } else if (baseIdentityList && baseIdentityList.error) {
        console.error('Error fetching base identity list:', baseIdentityList.error);
      } else {
        console.warn('Unexpected result fetching base identity list:', baseIdentityList);
      }
    } catch (err) {
      console.error('Error in enhanced fetchIdentities catch:', err);
    } finally {
      setLoadingIdentities(false);
      setLoadingAllBalances(false);
    }
  }, [sendCommand, nodeStatus.connected, nodeStatus?.chainActive?.identityaddress, nodeStatus?.chainName]);

  const fetchTotalNativeBalance = useCallback(async () => {
    if (!nodeStatus.connected || typeof sendCommand !== 'function') {
      setTotalNativeBalance(null);
      setLoadingTotalNativeBalance(false);
      return;
    }
    console.log('[IdentityContext] Fetching total native balance...');
    setLoadingTotalNativeBalance(true);
    try {
      const result = await sendCommand('z_gettotalbalance', [], 'total_balance_query');
      if (result && typeof result.total !== 'undefined') {
        setTotalNativeBalance(parseFloat(result.total));
      } else {
        console.warn('[IdentityContext] Unexpected result from z_gettotalbalance:', result);
        setTotalNativeBalance(null); // Or 0, or specific error state
      }
    } catch (err) {
      console.error('[IdentityContext] Error fetching total native balance:', err);
      setTotalNativeBalance(null); // Or specific error state
    } finally {
      setLoadingTotalNativeBalance(false);
    }
  }, [sendCommand, nodeStatus.connected]);

  // useEffect to clear identities if node disconnects
  useEffect(() => {
    if (!nodeStatus.connected) {
      console.warn('[IdentityContext] Node disconnected! Clearing ALL states.');
      setIdentities([]);
      setIdentityBalances({}); // Clear all balances
      setSelectedIdName(null);
      setIdentityDetails(null);
      setIdentityHistoryForOps([]); // Clear ops history
      setErrorHistoryForOps(null);  // Clear ops history error
      setTransparentBalance(null);
      setSelectedRAddress(null);
      setIdentitiesForSelectedRAddress([]);
      setErrorIdentitiesForRAddress(null);
      setSelectedIdentityForVDXF(null);
      setVdxfIdentityDetails(null);
      setErrorVdxfDetails(null);
      setIdentityHistoryForVDXF([]);
      setErrorHistoryForVDXF(null);
      setSelectedRAddressForVDXF(null); // Clear VDXF R-Addr
      setSelectedZAddressForVDXF(null); // Clear VDXF Z-Addr
      setSelectedCurrencyIdentity(null); // Clear currency selection
      setSelectedRAddressWM(null);
      setSelectedZAddressWM(null);
      // Clear CM VerusID details states
      setSelectedVerusIdCM(null);
      setVerusIdDetailsForCM(null);
      setLoadingVerusIdDetailsCM(false);
      setErrorVerusIdDetailsCM(null);
      setIdentityHistoryForCM([]);
      setLoadingHistoryForCM(false);
      setErrorHistoryForCM(null);
      setTotalNativeBalance(null);
    }
    // Also fetch total balance when connection is established or on mount if connected
    // This could also be called by fetchIdentities or a global refresh action
    if (nodeStatus.connected) {
        fetchTotalNativeBalance();
    }
  }, [nodeStatus.connected, fetchTotalNativeBalance]); 

  // --- Effect to Fetch Details & HISTORY on VerusID Tab Selection Change ---
  useEffect(() => {
    const fetchDetailsForOps = async () => {
      if (!selectedIdName || !nodeStatus.connected || typeof sendCommand !== 'function') { 
          setIdentityDetails(null);
          setTransparentBalance(null);
          setLoadingDetails(false); // Ensure loading state is reset
          setLoadingBalance(false); // Ensure loading state is reset
          return;
      }

      setLoadingDetails(true);
      setIdentityDetails(null); // Clear previous full details
      setTransparentBalance(null);
      setLoadingBalance(true); 

      let identityParam = selectedIdName; 

      try {
        // Only fetch getidentity for the main details view
        const detailsResponse = await sendCommand('getidentity', [identityParam], 'ops_tab_identity_query');
        
        if (detailsResponse && detailsResponse.identity) {
          // contentmap and contentmultimap will be taken directly from getidentity response
          setIdentityDetails(detailsResponse); 
        } else {
          const errorMessage = detailsResponse?.error?.message || (detailsResponse?.error ? JSON.stringify(detailsResponse.error) : 'Identity not found or response malformed.');
          console.error(errorMessage, detailsResponse);
          setIdentityDetails({ error: errorMessage, isErrorObject: true });
        }

        // Fetch transparent balance if identityaddress is available
        if (detailsResponse?.identity?.identityaddress) {
          try {
            const balance = await sendCommand('getcurrencybalance', [detailsResponse.identity.identityaddress], 'ops_tab_balance_query');
            setTransparentBalance(balance);
          } catch (balanceError) {
            console.error('Error fetching balance for Ops tab:', balanceError);
            setTransparentBalance({ error: balanceError.message || 'Error fetching balance' });
          }
        }

      } catch (err) {
        console.error('Error in fetchDetailsForOps catch:', err);
        setIdentityDetails({ error: err.message || 'Error fetching details', isErrorObject: true });
      } finally {
        setLoadingDetails(false);
        setLoadingBalance(false);
      }
    };

    fetchDetailsForOps();
  }, [selectedIdName, nodeStatus.connected, sendCommand]); 

  // --- Effect to Fetch Details on VerusID Tab Selection Change ---
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedIdName || !nodeStatus.connected || typeof sendCommand !== 'function') { 
          if (!selectedIdName) { 
          }
          setSelectedRAddress(null); 
          return;
      }

      let identityParam = selectedIdName; 
      console.log(`[IdentityContext Effect] Secondary effect for selectedIdName: ${selectedIdName} - REVIEW IF STILL NEEDED`);

    try {
      // This effect should likely be removed or its purpose re-evaluated as the primary effect above handles getidentity.
      // If getidentitycontent was for a different purpose, that needs to be clarified.
      // For now, commenting out the core logic of this effect to avoid redundant calls or state overwrites.
      /*
      const details = await sendCommand('getidentitycontent', [identityParam], 'secondary_ops_tab_content_query');
      if (details && details.identity) {
        // setIdentityDetails(details.identity); // This would overwrite the full details from the primary effect
      } else {
        // Error handling if needed
      }
      */
    } catch (err) {
      console.error('Error in secondary fetchDetails effect catch:', err);
      // setIdentityDetails({ error: err.message || 'Error fetching content', isErrorObject: true });
    } finally {
        setSelectedRAddress(null); 
      }
    };

    if (selectedIdName) {
    // fetchDetails(); // Temporarily disable this effect to ensure primary effect takes precedence.
    } else {
        setSelectedRAddress(null); 
    }
  }, [selectedIdName, nodeStatus.connected, sendCommand]); 

  // --- Effect to Fetch Details AND HISTORY for selectedIdentityForVDXF (VDXF Tab) ---
  useEffect(() => {
    const fetchVdxfData = async () => {
      if (!selectedIdentityForVDXF || !nodeStatus.connected || typeof sendCommand !== 'function') {
        setVdxfIdentityDetails(null);
        setErrorVdxfDetails(null);
        setIdentityHistoryForVDXF([]);
        setErrorHistoryForVDXF(null);
        return;
      }

      const identityNameToFetch = selectedIdentityForVDXF;
      console.log(`[IdentityContext VDXF Effect] Now fetching data for name: ${identityNameToFetch}`);

      setLoadingVdxfDetails(true);
      setErrorVdxfDetails(null);
      setVdxfIdentityDetails(null);
      setLoadingHistoryForVDXF(true);
      setErrorHistoryForVDXF(null);
      setIdentityHistoryForVDXF([]);
      
      let completeDetailsResponse = null;

      try {
        console.log(`[IdentityContext VDXF Effect] Attempting getidentity for: ${identityNameToFetch}`);
        const detailsResponse = await sendCommand('getidentity', [identityNameToFetch], 'vdxf_tab_identity_query');
        
        if (detailsResponse && detailsResponse.identity) {
          completeDetailsResponse = detailsResponse;
          setVdxfIdentityDetails(detailsResponse);
        } else {
          const errorMsg = detailsResponse?.error?.message || (detailsResponse?.error ? JSON.stringify(detailsResponse.error) : 'Identity not found or response malformed for VDXF.');
          setErrorVdxfDetails(errorMsg);
          setVdxfIdentityDetails(null);
        }
      } catch (err) {
        setErrorVdxfDetails(err.message || JSON.stringify(err));
        setVdxfIdentityDetails(null);
      }

      // Fetch history using the fully qualified name - THIS IS STILL NEEDED FOR StatesOfMyMapsColumn
      console.log(`[IdentityContext VDXF Effect] Fetching history for StatesOfMyMapsColumn using name: ${identityNameToFetch}`);

      try {
        const historyResult = await sendCommand('getidentityhistory', [identityNameToFetch], 'vdxf_tab_history_query'); 
        if (historyResult && historyResult.history && Array.isArray(historyResult.history) && historyResult.history.length > 0) {
          const sortedHistory = historyResult.history.slice().sort((a, b) => b.height - a.height);
          setIdentityHistoryForVDXF(sortedHistory);
        } else if (historyResult && Array.isArray(historyResult) && historyResult.length > 0) { 
           const sortedHistory = historyResult.slice().sort((a, b) => b.height - a.height);
           setIdentityHistoryForVDXF(sortedHistory);
        } else if (historyResult && historyResult.error) {
          setErrorHistoryForVDXF(historyResult.error.message || JSON.stringify(historyResult.error));
          setIdentityHistoryForVDXF([]);
        } else {
          setIdentityHistoryForVDXF([]);
        }
      } catch (err) {
        setErrorHistoryForVDXF(err.message || 'Exception fetching history for VDXF');
        setIdentityHistoryForVDXF([]);
      } finally {
        setLoadingHistoryForVDXF(false);
      }

      setLoadingVdxfDetails(false);
    };

    fetchVdxfData();
  }, [selectedIdentityForVDXF, nodeStatus.connected, sendCommand]);

  // --- Effect to Fetch Details when selectedIdentityForCurrencyWS changes ---
  useEffect(() => {
    const fetchCurrencyWSData = async () => {
      if (!selectedIdentityForCurrencyWS || !nodeStatus.connected || typeof sendCommand !== 'function') {
        setCurrencyWSIdentityDetails(null);
        setErrorCurrencyWSDetails(null);
        return;
      }

      const identityNameToFetch = selectedIdentityForCurrencyWS;
      console.log(`[IdentityContext Currency WS Effect] Now fetching data for name: ${identityNameToFetch}`);

      setLoadingCurrencyWSDetails(true);
      setErrorCurrencyWSDetails(null);
      setCurrencyWSIdentityDetails(null);
      
      try {
        console.log(`[IdentityContext Currency WS Effect] Attempting getidentity for: ${identityNameToFetch}`);
        const detailsResponse = await sendCommand('getidentity', [identityNameToFetch], 'currency_ws_tab_identity_query');
        
        if (detailsResponse && detailsResponse.identity) {
          setCurrencyWSIdentityDetails(detailsResponse);
        } else {
          const errorMsg = detailsResponse?.error?.message || (detailsResponse?.error ? JSON.stringify(detailsResponse.error) : 'Identity not found or response malformed for Currency WS.');
          setErrorCurrencyWSDetails(errorMsg);
          setCurrencyWSIdentityDetails(null);
        }
      } catch (err) {
        setErrorCurrencyWSDetails(err.message || JSON.stringify(err));
        setCurrencyWSIdentityDetails(null);
      } finally {
        setLoadingCurrencyWSDetails(false);
      }
    };

    fetchCurrencyWSData();
  }, [selectedIdentityForCurrencyWS, nodeStatus.connected, sendCommand]);

  // Add a callable function to fetch identity details for VDXF
  const fetchIdentityDetailsForVDXF = useCallback(async (identityName) => {
    if (!identityName || !nodeStatus.connected || typeof sendCommand !== 'function') {
      console.log('[IdentityContext] fetchIdentityDetailsForVDXF called with invalid parameters');
      return;
    }

    console.log(`[IdentityContext] fetchIdentityDetailsForVDXF: Refreshing details for ${identityName}`);
    setLoadingVdxfDetails(true);
    setErrorVdxfDetails(null);

    try {
      const detailsResponse = await sendCommand('getidentity', [identityName], 'vdxf_refresh_details');
      
      if (detailsResponse && detailsResponse.identity) {
        setVdxfIdentityDetails(detailsResponse);
      } else {
        const errorMsg = detailsResponse?.error?.message || (detailsResponse?.error ? JSON.stringify(detailsResponse.error) : 'Identity not found or response malformed for VDXF.');
        setErrorVdxfDetails(errorMsg);
        setVdxfIdentityDetails(null);
      }
    } catch (err) {
      setErrorVdxfDetails(err.message || JSON.stringify(err));
      setVdxfIdentityDetails(null);
    } finally {
      setLoadingVdxfDetails(false);
    }
  }, [nodeStatus.connected, sendCommand]);

  // --- Effect to Fetch Identities for Selected R-Address ---
  useEffect(() => {
      const fetchIdentitiesForRAddress = async () => {
          if (!selectedRAddress || !nodeStatus.connected || typeof sendCommand !== 'function') {
              setIdentitiesForSelectedRAddress([]);
              setErrorIdentitiesForRAddress(null);
              return;
          }
          setLoadingIdentitiesForRAddress(true);
          setIdentitiesForSelectedRAddress([]); // Clear previous
          setErrorIdentitiesForRAddress(null);
          console.log(`[IdentityContext Effect RAddr] Fetching identities for: ${selectedRAddress}`);
          try {
              // Ensure the address is passed within an object as required by the command
              const params = [{ address: selectedRAddress }]; 
              const result = await sendCommand('getidentitieswithaddress', params, 'raddress_identity_query');
              
              if (result && Array.isArray(result)) {
                  setIdentitiesForSelectedRAddress(result);
              } else if (result && result.error) {
                  console.error(`Error fetching identities for R-Address ${selectedRAddress}:`, result.error);
                  setErrorIdentitiesForRAddress(result.error.message || 'Error fetching identities for address');
              } else {
                   console.warn(`Unexpected result for getidentitieswithaddress for ${selectedRAddress}:`, result);
                   setErrorIdentitiesForRAddress('Unexpected result fetching identities for address');
              }
          } catch (err) {
              console.error(`Error in fetchIdentitiesForRAddress effect catch for ${selectedRAddress}:`, err);
              setErrorIdentitiesForRAddress(err.message || 'Failed to fetch identities for address');
          } finally {
              setLoadingIdentitiesForRAddress(false);
          }
      };
      fetchIdentitiesForRAddress();
  }, [selectedRAddress, nodeStatus.connected, sendCommand]); // Trigger when selectedRAddress or connection changes

  // Add setter logic for R-Address (clears VerusID selection)
  const selectRAddress = useCallback((rAddress) => {
      console.log('[IdentityContext] Selecting R-Address:', rAddress);
      setSelectedRAddress(rAddress); 
      setSelectedIdName(null); // Clear VerusID selection
      setIdentityDetails(null); // Clear details
      setTransparentBalance(null); // Clear balance
  }, []);

  // Modify VerusID setter logic (clears R-Address selection)
  const selectVerusId = useCallback((idName) => {
      console.log('[IdentityContext] Selecting VerusID:', idName);
      setSelectedIdName(idName);
      setSelectedRAddress(null); // Clear R-Address selection
      // Details fetching is handled by the useEffect hook
  }, []);
  
  // Placeholder for other actions
  // const addNameCommitment = (commitment) => setNameCommitments(prev => [commitment, ...prev]);
  // const removeNameCommitment = (txid) => setNameCommitments(prev => prev.filter(c => c.txid !== txid));
  // const fetchAvailableRAddresses = useCallback(async () => { ... });

  // Load useEffect
  useEffect(() => {
    // Remove initial fetch call
    // loadInitialData(); // Call the async function - NO LONGER NEEDED HERE
    // Data loading is now handled manually via Update button
    console.log('[IdentityContext] Initial mount - data will be loaded manually.');
  }, []); // Empty dependency array ensures this runs only once on mount

  // Setter for VerusID Operations Tab ID selection
  const selectVerusIdForOps = useCallback((idName) => {
    console.log('[IdentityContext] Selecting ID for Ops Tab:', idName);
    setSelectedIdName(idName);
    // Don't clear R-Address selections - allow multiple types to be viewed simultaneously
    // setSelectedRAddress(null);
    // setIdentitiesForSelectedRAddress([]);
    // setErrorIdentitiesForRAddress(null);
    
    // Still clear selections in other tabs for isolation
    setSelectedIdentityForVDXF(null);
    setVdxfIdentityDetails(null);
    setErrorVdxfDetails(null);
    setIdentityHistoryForVDXF([]);
    setErrorHistoryForVDXF(null);
    setSelectedVerusIdWM(null); setSelectedRAddressWM(null); setSelectedZAddressWM(null);
  }, []);

  // Setter for R-Address (VerusID Operations Tab) selection
  const selectRAddressForOps = useCallback((rAddress) => {
    console.log('[IdentityContext] Selecting R-Address for Ops Tab:', rAddress);
    setSelectedRAddress(rAddress);
    // Don't clear VerusID selection - allow multiple types to be viewed simultaneously
    // setSelectedIdName(null);
    // setIdentityDetails(null);
    // setTransparentBalance(null);
    
    // Still clear selections in other tabs for isolation
    setSelectedIdentityForVDXF(null);
    setVdxfIdentityDetails(null);
    setErrorVdxfDetails(null);
    setIdentityHistoryForVDXF([]);
    setErrorHistoryForVDXF(null);
    setSelectedVerusIdWM(null); setSelectedRAddressWM(null); setSelectedZAddressWM(null);
  }, []);

  // Setter for VDXF Tab ID selection
  const selectIdentityNameForVDXF = useCallback((idName) => {
    console.log('[IdentityContext] Selecting ID Name for VDXF Tab:', idName);
    setSelectedIdentityForVDXF(idName);
    // vdxfIdentityDetails will be populated by the useEffect that watches selectedIdentityForVDXF
    // setVdxfIdentityDetails(null); 
    // setErrorVdxfDetails(null);

    // DO NOT clear other VDXF selections (selectedRAddressForVDXF, selectedZAddressForVDXF)

    // Clear other general selections from other tabs for consistency
    setSelectedIdName(null); 
    setSelectedRAddress(null); 
    setSelectedCurrencyIdentity(null);
    setSelectedVerusIdCM(null);
    setSelectedVerusIdWM(null); 
    setSelectedRAddressWM(null); 
    setSelectedZAddressWM(null);
  }, []);

  // Setter for Currency Management Tab (when a currency ID is selected from MyCurrenciesListCM)
  const selectCurrencyForDetails = useCallback((currencyIdName) => {
    console.log('[IdentityContext] Selecting Currency ID for Details (for CurrencyDetailsCM):', currencyIdName);
    setSelectedCurrencyIdentity(currencyIdName);
    // Clear other selections
    setSelectedIdName(null);
    setSelectedRAddress(null);
    setSelectedIdentityForVDXF(null);
    setSelectedVerusIdCM(null); 
    setSelectedVerusIdWM(null); setSelectedRAddressWM(null); setSelectedZAddressWM(null);
    // Clear CM VerusID details states as this is for currency details, not VerusID details in CM
    setVerusIdDetailsForCM(null);
    setErrorVerusIdDetailsCM(null);
    setIdentityHistoryForCM([]);
    setErrorHistoryForCM(null);
    setLoadingHistoryForCM(false);
    setLoadingVerusIdDetailsCM(false);
  }, []);

  // Setter for VerusID selected in Currency Management's first column
  const selectVerusIdForCM = useCallback((idName) => {
    console.log('[IdentityContext] Selecting VerusID for Currency Management Details:', idName);
    setSelectedVerusIdCM(idName);
    // Clear other selections
    setSelectedIdName(null);
    setSelectedRAddress(null);
    setSelectedIdentityForVDXF(null);
    setSelectedCurrencyIdentity(null);
    setSelectedVerusIdWM(null); setSelectedRAddressWM(null); setSelectedZAddressWM(null);
    // Don't clear verusIdDetailsForCM here, the effect will handle it.
  }, []);

  // For Currency Management Tab (selectedCurrencyDetails is for getcurrency)
  const [selectedCurrencyDetails, setSelectedCurrencyDetails] = useState(null); // Details from getcurrency
  const [loadingCurrencyIdentityDetails, setLoadingCurrencyIdentityDetails] = useState(false);

  // Fetch currency details when a currency identity is selected
  useEffect(() => {
    if (selectedCurrencyIdentity && sendCommand) {
      const fetchDetails = async () => {
        setLoadingCurrencyIdentityDetails(true);
        setSelectedCurrencyDetails(null);
        try {
          const nameForRpc = selectedCurrencyIdentity.endsWith('@') 
                             ? selectedCurrencyIdentity.slice(0, -1) 
                             : selectedCurrencyIdentity;
          const details = await sendCommand('getcurrency', [nameForRpc]);
          setSelectedCurrencyDetails(details);
        } catch (error) {
          console.error('Error fetching currency details for CurrencyDetailsCM:', error);
          setSelectedCurrencyDetails({ error: error.message });
        }
        setLoadingCurrencyIdentityDetails(false);
      };
      fetchDetails();
    } else if (!selectedCurrencyIdentity) {
      setSelectedCurrencyDetails(null);
      setLoadingCurrencyIdentityDetails(false);
    }
  }, [selectedCurrencyIdentity, sendCommand]);

  // --- Effect to Fetch Details & HISTORY for selectedVerusIdCM (Currency Management Tab) ---
  useEffect(() => {
    const fetchVerusIdDetailsForCM = async () => {
      if (!selectedVerusIdCM || !nodeStatus.connected || typeof sendCommand !== 'function') {
        setVerusIdDetailsForCM(null);
        setErrorVerusIdDetailsCM(null);
        setLoadingVerusIdDetailsCM(false); 
        return;
      }

      const identityNameToFetch = selectedVerusIdCM;
      console.log(`[IdentityContext CM Effect] Fetching VerusID details (getidentity only) for CM: ${identityNameToFetch}`);

      setLoadingVerusIdDetailsCM(true);
      setErrorVerusIdDetailsCM(null);
      setVerusIdDetailsForCM(null); 
      
      try {
        // Only fetch getidentity
        const detailsResponse = await sendCommand('getidentity', [identityNameToFetch], 'cm_tab_identity_query');
        
        if (detailsResponse && detailsResponse.identity) {
          // contentmap and contentmultimap will be taken directly from getidentity response
          setVerusIdDetailsForCM(detailsResponse);
        } else {
          const errorMessage = detailsResponse?.error?.message || (detailsResponse?.error ? JSON.stringify(detailsResponse.error) : 'Identity not found or response malformed for CM.');
          setErrorVerusIdDetailsCM(errorMessage);
        }
      } catch (err) {
        setErrorVerusIdDetailsCM(err.message || JSON.stringify(err));
      }
      setLoadingVerusIdDetailsCM(false); 
    };

    fetchVerusIdDetailsForCM();
  }, [selectedVerusIdCM, nodeStatus.connected, sendCommand]);

  // New setters for Wallet Management selections
  const selectVerusIdForWM = useCallback((idName) => {
    console.log('[IdentityContext] Selecting VerusID for Wallet Management:', idName);
    setSelectedVerusIdWM(idName);
    setSelectedRAddressWM(null);
    setSelectedZAddressWM(null);
    // Clear selections from other main tabs
    setSelectedIdName(null); setSelectedRAddress(null); setSelectedIdentityForVDXF(null); setSelectedCurrencyIdentity(null); setSelectedVerusIdCM(null);
    // Clear CM VerusID details states
    setVerusIdDetailsForCM(null);
    setErrorVerusIdDetailsCM(null);
    setIdentityHistoryForCM([]);
    setErrorHistoryForCM(null);
    setLoadingHistoryForCM(false);
    setLoadingVerusIdDetailsCM(false);
  }, []);

  const selectRAddressForWM = useCallback((rAddress) => {
    console.log('[IdentityContext] Selecting R-Address for Wallet Management:', rAddress);
    setSelectedRAddressWM(rAddress);
    setSelectedVerusIdWM(null);
    setSelectedZAddressWM(null);
    setSelectedIdName(null); setSelectedRAddress(null); setSelectedIdentityForVDXF(null); setSelectedCurrencyIdentity(null); setSelectedVerusIdCM(null);
    // Clear CM VerusID details states
    setVerusIdDetailsForCM(null);
    setErrorVerusIdDetailsCM(null);
    setIdentityHistoryForCM([]);
    setErrorHistoryForCM(null);
    setLoadingHistoryForCM(false);
    setLoadingVerusIdDetailsCM(false);
  }, []);

  const selectZAddressForWM = useCallback((zAddress) => {
    console.log('[IdentityContext] Selecting Z-Address for Wallet Management:', zAddress);
    setSelectedZAddressWM(zAddress);
    setSelectedVerusIdWM(null);
    setSelectedRAddressWM(null);
    setSelectedIdName(null); setSelectedRAddress(null); setSelectedIdentityForVDXF(null); setSelectedCurrencyIdentity(null); setSelectedVerusIdCM(null);
    // Clear CM VerusID details states
    setVerusIdDetailsForCM(null);
    setErrorVerusIdDetailsCM(null);
    setIdentityHistoryForCM([]);
    setErrorHistoryForCM(null);
    setLoadingHistoryForCM(false);
    setLoadingVerusIdDetailsCM(false);
  }, []);

  // New independent setters for Wallet Management Tab selections
  const setSelectedVerusIdWM_independent = useCallback((idObject) => {
    setSelectedVerusIdWM(idObject);
  }, []);

  const setSelectedRAddressWM_independent = useCallback((rAddress) => {
    setSelectedRAddressWM(rAddress);
  }, []);

  const setSelectedZAddressWM_independent = useCallback((zAddress) => {
    setSelectedZAddressWM(zAddress);
  }, []);

  const selectRAddressForVDXF = useCallback((rAddress) => {
    console.log('[IdentityContext] Selecting R-Address for VDXF Tab:', rAddress);
    setSelectedRAddressForVDXF(rAddress);
    // DO NOT clear selectedIdentityForVDXF
    // DO NOT clear selectedZAddressForVDXF

    // Clear other general selections from other tabs for consistency
    setSelectedIdName(null); 
    setSelectedRAddress(null); // Clear general R-Address selection
    // No general Z-Address selection state to clear directly here, handled by individual tab states if necessary
    setSelectedCurrencyIdentity(null);
    setSelectedVerusIdCM(null);
    setSelectedVerusIdWM(null); 
    // setSelectedRAddressWM(null); // Keep VDXF RAddress selection independent
    setSelectedZAddressWM(null);
  }, []);

  // Direct setter for Z-addresses in VDXF tab
  const directSetSelectedZAddressForVDXF = useCallback((zAddress) => {
    console.log('[IdentityContext] Direct set Z-Address for VDXF Tab:', zAddress);
    setSelectedZAddressForVDXF(zAddress);
  }, []);

  // Selection function for Z-addresses in VDXF tab (with additional logic)
  const selectZAddressForVDXF = useCallback((zAddress) => {
    try {
      console.log('[IdentityContext] Selecting Z-Address for VDXF Tab:', zAddress);
      
      // Validate input
      if (!zAddress) {
        console.warn('[IdentityContext] selectZAddressForVDXF called with empty/null address');
        return;
      }
      
      // Set the state directly
      setSelectedZAddressForVDXF(zAddress);
      
      // Verify state was updated
      setTimeout(() => {
        console.log('[IdentityContext] After selectZAddressForVDXF, state is now:', zAddress);
      }, 0);

      // DO NOT clear selectedIdentityForVDXF
      // DO NOT clear selectedRAddressForVDXF

      // Clear other general selections from other tabs for consistency
      setSelectedIdName(null); 
      setSelectedRAddress(null); 
      // No general Z-Address selection state to clear directly here, handled by individual tab states if necessary
      setSelectedCurrencyIdentity(null);
      setSelectedVerusIdCM(null);
      setSelectedVerusIdWM(null); 
      setSelectedRAddressWM(null); 
      // setSelectedZAddressWM(null); // Keep VDXF ZAddress selection independent
    } catch (error) {
      console.error('[IdentityContext] Error in selectZAddressForVDXF:', error);
    }
  }, []);

  // --- Currency Management Tab Selection Handlers (for wallet-style columns) ---
  const selectIdentityForCurrencyWS = useCallback((idName) => {
    console.log('[IdentityContext] Selecting Identity for Currency WS:', idName);
    setSelectedIdentityForCurrencyWS(idName);
    // Don't clear other Currency-specific selections
  }, []);

  const selectRAddressForCurrencyWS = useCallback((rAddress) => {
    console.log('[IdentityContext] Selecting R-Address for Currency WS:', rAddress);
    setSelectedRAddressForCurrencyWS(rAddress);
    // Don't clear other Currency-specific selections
  }, []);

  const selectZAddressForCurrencyWS = useCallback((zAddress) => {
    console.log('[IdentityContext] Selecting Z-Address for Currency WS:', zAddress);
    setSelectedZAddressForCurrencyWS(zAddress);
    // Don't clear other Currency-specific selections
  }, []);

  // Function to fetch identity details and history for Currency Management tab
  const fetchIdentityDetailsForCurrencyWS = useCallback(async (identityName) => {
    if (!identityName || !nodeStatus.connected || typeof sendCommand !== 'function') {
      console.log('[IdentityContext] fetchIdentityDetailsForCurrencyWS called with invalid parameters');
      return;
    }
  
    console.log(`[IdentityContext] fetchIdentityDetailsForCurrencyWS: Refreshing details for ${identityName}`);
    setLoadingCurrencyWSDetails(true);
    setErrorCurrencyWSDetails(null);
    
    try {
      const identityResult = await sendCommand('getidentity', [identityName], 'currency-ws-getidentity');
      console.log(`[IdentityContext] fetchIdentityDetailsForCurrencyWS result:`, identityResult);
      
      if (identityResult && identityResult.identity) {
        setCurrencyWSIdentityDetails(identityResult);
      } else {
        const errorMsg = identityResult?.error?.message || 
          (identityResult?.error ? JSON.stringify(identityResult.error) : 'Identity not found or response malformed');
        console.error(`[IdentityContext] Error in fetchIdentityDetailsForCurrencyWS:`, errorMsg);
        setErrorCurrencyWSDetails(errorMsg);
        setCurrencyWSIdentityDetails(null);
      }
    } catch (err) {
      console.error(`[IdentityContext] Error fetching Currency WS identity details:`, err);
      setErrorCurrencyWSDetails(err.message || 'Error fetching identity details');
      setCurrencyWSIdentityDetails(null);
    } finally {
      setLoadingCurrencyWSDetails(false);
    }
  }, [nodeStatus.connected, sendCommand]);

  // --- VerusID Operations tab selection handlers (that preserve selections) ---
  const selectIdNameForVerusIdOps = useCallback((idName) => {
    console.log('[IdentityContext] Selecting ID Name for VerusID Operations Tab:', idName);
    setSelectedIdNameForVerusIdOps(idName);
    // Also set the main selection for compatibility with existing code
    setSelectedIdName(idName);
    // Don't clear other VerusID Operations tab selections
  }, []);

  const selectRAddressForVerusIdOps = useCallback((rAddress) => {
    console.log('[IdentityContext] Selecting R-Address for VerusID Operations Tab:', rAddress);
    setSelectedRAddressForVerusIdOps(rAddress);
    // Also set the main selection for compatibility with existing code
    setSelectedRAddress(rAddress);
    // Don't clear other VerusID Operations tab selections
  }, []);

  const selectZAddressForVerusIdOps = useCallback((zAddress) => {
    console.log('[IdentityContext] Selecting Z-Address for VerusID Operations Tab:', zAddress);
    setSelectedZAddressForVerusIdOps(zAddress);
    // Don't clear other VerusID Operations tab selections
  }, []);

  const contextValue = {
    identities,
    loadingIdentities,
    identityBalances,
    loadingAllBalances,
    listVersion, // <-- Expose list version
    fetchIdentities,
    fetchBasicIdentitiesOnly,
    selectedIdName,
    setSelectedIdName,
    identityDetails,
    loadingDetails,
    identityHistoryForOps,
    loadingHistoryForOps,
    errorHistoryForOps,
    transparentBalance,
    loadingBalance,
    selectedRAddress,
    setSelectedRAddress,
    identitiesForSelectedRAddress,
    loadingIdentitiesForRAddress,
    errorIdentitiesForRAddress,
    selectedIdentityForVDXF,
    setSelectedIdentityForVDXF: selectIdentityNameForVDXF,
    vdxfIdentityDetails,
    loadingVdxfDetails,
    errorVdxfDetails,
    identityHistoryForVDXF,
    loadingHistoryForVDXF,
    errorHistoryForVDXF,
    selectedRAddressForVDXF,
    setSelectedRAddressForVDXF: selectRAddressForVDXF,
    selectedZAddressForVDXF,
    setSelectedZAddressForVDXF: selectZAddressForVDXF,
    directSetSelectedZAddressForVDXF,
    selectedCurrencyIdentity,
    setSelectedCurrencyIdentity,
    setSelectedVerusIdCM,
    selectedVerusIdCM,
    verusIdDetailsForCM,
    loadingVerusIdDetailsCM,
    errorVerusIdDetailsCM,
    identityHistoryForCM,
    loadingHistoryForCM,
    errorHistoryForCM,
    selectedVerusIdWM,
    setSelectedVerusIdWM,
    selectedRAddressWM,
    setSelectedRAddressWM,
    selectedZAddressWM,
    setSelectedZAddressWM,
    totalNativeBalance,
    loadingTotalNativeBalance,
    fetchTotalNativeBalance,
    fetchIdentityDetailsForVDXF,
    fetchIdentityDetailsForCurrencyWS,
    selectedIdentityForCurrencyWS,
    selectIdentityForCurrencyWS,
    selectedRAddressForCurrencyWS,
    selectRAddressForCurrencyWS,
    selectedZAddressForCurrencyWS,
    selectZAddressForCurrencyWS,
    currencyWSIdentityDetails,
    loadingCurrencyWSDetails,
    errorCurrencyWSDetails,
    identityHistoryForCurrencyWS,
    loadingHistoryForCurrencyWS,
    errorHistoryForCurrencyWS,
    // Add new VerusID Operations tab selection state and handlers
    selectedIdNameForVerusIdOps,
    selectIdNameForVerusIdOps,
    selectedRAddressForVerusIdOps,
    selectRAddressForVerusIdOps,
    selectedZAddressForVerusIdOps,
    selectZAddressForVerusIdOps,
  };

  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
}; 