import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { NodeContext } from './NodeContext';

export const MarketplaceIdentityContext = createContext();

export const MarketplaceIdentityProvider = ({ children }) => {
  const [selectedVerusId, setSelectedVerusId] = useState(null);
  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState(null);
  const [selectedRAddress, setSelectedRAddress] = useState(null);
  const [selectedZAddress, setSelectedZAddress] = useState(null);
  
  // Add state for identity details
  const [selectedVerusIdDetails, setSelectedVerusIdDetails] = useState(null);
  const [loadingIdentityDetails, setLoadingIdentityDetails] = useState(false);
  const [errorIdentityDetails, setErrorIdentityDetails] = useState(null);
  
  const { nodeStatus, sendCommand } = useContext(NodeContext);
  
  // When selectedVerusId (the full object) changes, update selectedMarketplaceId (the FQN string)
  useEffect(() => {
    if (selectedVerusId) {
      let nameToSet = null;
      if (selectedVerusId.displayName) { // Prioritize displayName from the enriched item
        nameToSet = selectedVerusId.displayName;
      } else if (selectedVerusId.identity && selectedVerusId.identity.name) {
        // Fallback if displayName is somehow missing, construct FQN from .identity.name
        const baseName = selectedVerusId.identity.name;
        nameToSet = baseName.endsWith('@') ? baseName : `${baseName}@`;
        // This fallback won't handle complex sub-IDs correctly if displayName was missing, but it's a safeguard.
        // Ideally, selectedVerusId always comes from the enriched list from IdentityContext.
      }
      setSelectedMarketplaceId(nameToSet);
    } else {
      setSelectedMarketplaceId(null);
    }
  }, [selectedVerusId]);
  
  // When selectedMarketplaceId (the FQN string) changes, fetch details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedMarketplaceId || !nodeStatus.connected || typeof sendCommand !== 'function') {
        setSelectedVerusIdDetails(null);
        setErrorIdentityDetails(null);
        setLoadingIdentityDetails(false);
        return;
      }
      
      setLoadingIdentityDetails(true);
      setErrorIdentityDetails(null); // Clear previous error
      try {
        // Ensure selectedMarketplaceId is used for the RPC call
        console.log(`[MarketplaceIdentityContext] Fetching details for: ${selectedMarketplaceId}`);
        const result = await sendCommand('getidentity', [selectedMarketplaceId], 'marketplace-getidentity');
        setSelectedVerusIdDetails(result);
      } catch (error) {
        console.error('[MarketplaceIdentityContext] Error fetching identity details:', error);
        setErrorIdentityDetails(error.message || 'Error fetching identity details');
        setSelectedVerusIdDetails(null);
      } finally {
        setLoadingIdentityDetails(false);
      }
    };
    
    fetchDetails();
  }, [selectedMarketplaceId, nodeStatus.connected, sendCommand]);
  
  // Function to manually fetch identity details using a FQN string
  const fetchIdentityDetails = useCallback(async (identityNameString) => {
    if (!identityNameString || !nodeStatus.connected || typeof sendCommand !== 'function') return;
    
    setLoadingIdentityDetails(true);
    setErrorIdentityDetails(null);
    try {
      console.log(`[MarketplaceIdentityContext] Manually fetching details for: ${identityNameString}`);
      const result = await sendCommand('getidentity', [identityNameString], 'marketplace-manual-getidentity');
      setSelectedVerusIdDetails(result);
    } catch (error) {
      console.error('[MarketplaceIdentityContext] Error fetching identity details (manual):', error);
      setErrorIdentityDetails(error.message || 'Error fetching identity details');
      setSelectedVerusIdDetails(null);
    } finally {
      setLoadingIdentityDetails(false);
    }
  }, [nodeStatus.connected, sendCommand]);
  
  // This function is called by UI components when an ID name string (displayName) is selected
  const selectMarketplaceId = useCallback((idNameString) => {
    console.log('[MarketplaceIdentityContext] selectMarketplaceId called with:', idNameString);
    setSelectedMarketplaceId(idNameString); // This directly sets the FQN string for fetching
    // We might not need to set selectedVerusId (the object) from here if UI passes the string directly.
    // If the UI passes the full item, selectedVerusId should be set by a different handler.
  }, []);
  
  // This function is called by UI components when a full identity item object is selected
  const selectVerusIdObject = useCallback((idObject) => {
    console.log('[MarketplaceIdentityContext] selectVerusIdObject called with:', idObject?.displayName || idObject?.identity?.name);
    setSelectedVerusId(idObject); // This will trigger the useEffect to update selectedMarketplaceId (string)
  }, []);
  
  // Function to select an R-address while preserving other selections
  const selectRAddress = useCallback((rAddress) => {
    console.log('[MarketplaceIdentityContext] Selecting R-address:', rAddress);
    setSelectedRAddress(rAddress);
    // Don't clear other selections
  }, []);
  
  // Function to select a Z-address while preserving other selections
  const selectZAddress = useCallback((zAddress) => {
    console.log('[MarketplaceIdentityContext] Selecting Z-address:', zAddress);
    setSelectedZAddress(zAddress);
    // Don't clear other selections
  }, []);
  
  return (
    <MarketplaceIdentityContext.Provider value={{
      selectedVerusId, 
      setSelectedVerusId: selectVerusIdObject,
      selectedMarketplaceId,
      setSelectedMarketplaceId: selectMarketplaceId,
      selectMarketplaceId,
      selectedRAddress, 
      setSelectedRAddress: selectRAddress,
      selectedZAddress, 
      setSelectedZAddress: selectZAddress,
      selectedVerusIdDetails,
      loadingIdentityDetails,
      errorIdentityDetails,
      fetchIdentityDetails
    }}>
      {children}
    </MarketplaceIdentityContext.Provider>
  );
}; 