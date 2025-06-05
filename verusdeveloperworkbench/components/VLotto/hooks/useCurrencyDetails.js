import { useState, useEffect, useRef } from 'react';
import { getParentName } from '../utils/ticketHelpers';

export const useCurrencyDetails = (sendCommand, mainVerusId) => {
  // State for Main ID details
  const [mainIdDetails, setMainIdDetails] = useState(() => {
    // Try to migrate from old format if it exists in localStorage
    try {
      const saved = localStorage.getItem('vlotto-mainIdDetails');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old format to new format
        if (parsed && parsed.balance !== undefined && parsed.currency && !parsed.balances) {
          parsed.balances = { [parsed.currency]: parsed.balance };
          parsed.primaryCurrency = parsed.currency;
          delete parsed.balance;
          delete parsed.currency;
          // Save migrated data back
          localStorage.setItem('vlotto-mainIdDetails', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse mainIdDetails from localStorage", e);
      return null;
    }
  });
  const [isRefreshingMainId, setIsRefreshingMainId] = useState(false);
  const [mainIdError, setMainIdError] = useState(null);

  // State for Basket Currency details
  const [basketCurrencyDetails, setBasketCurrencyDetails] = useState(null);
  const [isRefreshingBasketCurrency, setIsRefreshingBasketCurrency] = useState(false);
  const [basketCurrencyError, setBasketCurrencyError] = useState(null);

  // Save mainIdDetails to localStorage when it changes
  useEffect(() => {
    try {
      if (mainIdDetails) {
        localStorage.setItem('vlotto-mainIdDetails', JSON.stringify(mainIdDetails));
      } else {
        localStorage.removeItem('vlotto-mainIdDetails');
      }
    } catch (e) {
      console.error("Failed to save mainIdDetails to localStorage", e);
    }
  }, [mainIdDetails]);

  // Enhanced: Add simple caching to prevent duplicate calls on rapid re-renders
  const lastFetchedId = useRef(null);
  const fetchCooldown = useRef(0);
  
  // Caching for basket currency to prevent duplicate getcurrency calls
  const lastFetchedCurrency = useRef(null);
  const currencyFetchCooldown = useRef(0);
  
  // Effect to fetch MainID details when mainVerusId changes or on mount
  useEffect(() => {
    const fetchMainIdDetails = async () => {
      if (mainVerusId && mainVerusId.includes('@')) {
        // Simple caching: don't refetch same ID within 2 seconds
        const now = Date.now();
        if (lastFetchedId.current === mainVerusId && now - fetchCooldown.current < 2000) {
          console.log(`[useCurrencyDetails] Skipping duplicate fetch for ${mainVerusId} (cooldown active)`);
          return;
        }
        
        console.log(`[useCurrencyDetails] Fetching details for ${mainVerusId}`);
        lastFetchedId.current = mainVerusId;
        fetchCooldown.current = now;
        
        setIsRefreshingMainId(true);
        setMainIdError(null);
        setMainIdDetails(null); 
        try {
          const identityData = await sendCommand('getidentity', [mainVerusId]);
          if (identityData && identityData.identity) {
            const primaryCurrency = getParentName(mainVerusId) || 'VRSC';
            const balanceData = await sendCommand('getcurrencybalance', [mainVerusId]);
            
            // Store all balances returned
            let allBalances = {};
            if (balanceData && typeof balanceData === 'object') {
              allBalances = { ...balanceData };
            }

            setMainIdDetails({
              name: identityData.identity.name,
              parent: primaryCurrency, 
              balances: allBalances,
              primaryCurrency: primaryCurrency, 
              txid: identityData.txid, 
              identityaddress: identityData.identity.identityaddress
            });
          } else {
            setMainIdError('Failed to fetch identity details.');
          }
        } catch (error) {
          console.error("Error fetching Main ID details:", error);
          setMainIdError(error.message || 'Error fetching details.');
        } finally {
          setIsRefreshingMainId(false);
        }
      } else {
        setMainIdDetails(null); 
        setMainIdError(mainVerusId ? 'Invalid Main ID format (must be name@)' : null);
        if (!mainVerusId) setIsRefreshingMainId(false); 
      }
    };

    fetchMainIdDetails();
  }, [mainVerusId, sendCommand]);

  // Fetch basket currency details with caching
  const fetchBasketCurrencyDetails = async () => {
    if (!mainVerusId || !mainVerusId.includes('@')) {
      setBasketCurrencyDetails(null);
      setBasketCurrencyError('Invalid Main ID format.');
      return;
    }

    const parentName = getParentName(mainVerusId);
    if (!parentName) {
      setBasketCurrencyDetails(null);
      setBasketCurrencyError('Cannot determine parent currency name.');
      return;
    }

    // Simple caching: don't refetch same currency within 2 seconds
    const now = Date.now();
    if (lastFetchedCurrency.current === parentName && now - currencyFetchCooldown.current < 2000) {
      console.log(`[useCurrencyDetails] Skipping duplicate getcurrency for ${parentName} (cooldown active)`);
      return;
    }
    
    console.log(`[useCurrencyDetails] Fetching basket currency for ${parentName}`);
    lastFetchedCurrency.current = parentName;
    currencyFetchCooldown.current = now;

    setIsRefreshingBasketCurrency(true);
    setBasketCurrencyError(null);
    
    try {
      const currencyData = await sendCommand('getcurrency', [parentName]);
      
      if (currencyData && currencyData.lastconfirmedcurrencystate) {
        const state = currencyData.lastconfirmedcurrencystate;
        const currencyNames = currencyData.currencynames || {};
        
        // Process reserve currencies with friendly names
        const processedReserveCurrencies = state.reservecurrencies ? state.reservecurrencies.map(reserve => ({
          ...reserve,
          friendlyName: currencyNames[reserve.currencyid] || reserve.currencyid
        })) : [];

        setBasketCurrencyDetails({
          name: currencyData.name,
          currencyid: currencyData.currencyid,
          supply: state.supply,
          reservecurrencies: processedReserveCurrencies,
          currencynames: currencyNames
        });
      } else {
        setBasketCurrencyError('Invalid currency data received.');
      }
    } catch (error) {
      console.error("Error fetching basket currency details:", error);
      setBasketCurrencyError(error.message || 'Error fetching basket currency details.');
    } finally {
      setIsRefreshingBasketCurrency(false);
    }
  };

  // Effect to fetch Basket Currency details when mainVerusId changes
  useEffect(() => {
    if (mainVerusId && mainVerusId.includes('@')) {
      fetchBasketCurrencyDetails();
    } else {
      setBasketCurrencyDetails(null);
      setBasketCurrencyError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainVerusId, sendCommand]);

  const refreshMainIdBalance = async () => {
    if (mainVerusId && mainVerusId.includes('@')) {
      setIsRefreshingMainId(true);
      setMainIdError(null);
      try {
        const identityData = await sendCommand('getidentity', [mainVerusId]);
        const primaryCurrency = getParentName(mainVerusId) || 'VRSC';
        const balanceData = await sendCommand('getcurrencybalance', [mainVerusId]);

        // Store all balances returned
        let allBalances = {};
        if (balanceData && typeof balanceData === 'object') {
          allBalances = { ...balanceData };
        }

        setMainIdDetails(prev => ({
          ...(prev || {}),
          name: prev?.name || (identityData?.identity?.name || mainVerusId),
          parent: primaryCurrency,
          balances: allBalances,
          primaryCurrency: primaryCurrency,
          txid: prev?.txid || identityData?.txid,
          identityaddress: prev?.identityaddress || identityData?.identity?.identityaddress
        }));
      } catch (error) {
        console.error("Error refreshing Main ID balance:", error);
        setMainIdError(error.message || 'Error refreshing balance.');
      } finally {
        setIsRefreshingMainId(false);
      }
    } else {
      setMainIdError('Cannot refresh: Invalid Main ID format.');
    }
  };

  const refreshBasketCurrency = async () => {
    await fetchBasketCurrencyDetails();
  };

  return {
    mainIdDetails,
    isRefreshingMainId,
    mainIdError,
    basketCurrencyDetails,
    isRefreshingBasketCurrency,
    basketCurrencyError,
    refreshMainIdBalance,
    refreshBasketCurrency
  };
}; 