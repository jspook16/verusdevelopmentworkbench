import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  Card,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UtilityIdCard from '../components/shared/UtilityIdCard';
import { getParentName } from '../utils/ticketHelpers';

const UtilitiesSection = React.memo(function UtilitiesSection({
  // Expansion state
  expanded,
  onToggleExpanded,
  
  // Main Verus ID
  mainVerusId,
  
  // Basket currency data
  basketCurrencyDetails,
  refreshBasketCurrency,
  
  // Main ID data
  mainIdDetails,
  refreshMainIdBalance,
  
  // Utility IDs hook
  utilityIds,
  
  // VDXF Keys
  VDXF_KEYS,
  
  // Optional props (may not be used but passed from parent)
  isRefreshingBasketCurrency,
  basketCurrencyError,
  isRefreshingMainId,
  mainIdError
}) {
  return (
    <Accordion 
      expanded={expanded} 
      onChange={onToggleExpanded}
      sx={{ mb: 3, backgroundColor: '#1e1e1e', border: '1px solid #333' }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
        sx={{ backgroundColor: '#2a2a2a', color: '#fff' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Utilities
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}> 
          {/* Basket Currency Card - First */}
          {mainVerusId && (
            <UtilityIdCard
              idType="basket"
              details={basketCurrencyDetails ? {
                name: basketCurrencyDetails.name,
                parent: getParentName(mainVerusId) || 'Unknown',
                balances: basketCurrencyDetails.reservecurrencies?.length > 0 
                  ? basketCurrencyDetails.reservecurrencies.reduce((acc, reserve) => {
                      const friendlyName = reserve.friendlyName || reserve.currencyid?.substring(0, 10) + '...';
                      acc[friendlyName] = (typeof reserve.reserves === 'number' ? reserve.reserves.toFixed(8) : reserve.reserves) || 'N/A';
                      return acc;
                    }, {
                      'Supply': basketCurrencyDetails.supply ? basketCurrencyDetails.supply.toFixed(8) : 'N/A'
                    })
                  : { 'Supply': basketCurrencyDetails.supply ? basketCurrencyDetails.supply.toFixed(8) : 'N/A' },
                txid: basketCurrencyDetails.currencyid
              } : null}
              onRefreshBalance={refreshBasketCurrency}
              mainVerusId={mainVerusId}
            />
          )}

          {/* Main ID Card - Second */}
          {mainVerusId && (
            <UtilityIdCard
              idType="main"
              details={mainIdDetails}
              onRefreshBalance={refreshMainIdBalance}
              mainVerusId={mainVerusId}
            />
          )}

          {/* Other Utility Cards - Reordered */}
          {['jackpot', 'payout', 'operations', 'proofguard', 'revenues', 'reserves'].map((idType) => {
            let details = utilityIds?.getUtilityIdDetails?.(idType);
            
            const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
          
            return (
              <UtilityIdCard
                key={idType}
                idType={idType}
                details={details}
                onRefreshBalance={async () => {
                  if (isRefreshingBalance || !utilityIds?.refreshBalance) return;
                  setIsRefreshingBalance(true);
                  try {
                    await utilityIds.refreshBalance(idType);
                  } catch (error) {
                    console.error(`Failed to refresh ${idType} balance:`, error);
                  } finally {
                    setIsRefreshingBalance(false);
                  }
                }}
                onCreateUtilityId={utilityIds?.createUtilityId}
                mainVerusId={mainVerusId}
                isCreatingUtilityId={utilityIds?.isCreatingUtilityId}
              />
            );
          })}

          {/* VDXF Key Cards */}
          {VDXF_KEYS && (
            <>
              {/* Primary Data Key */}
              <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 1, flexGrow: 1, minWidth: '120px' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Primary Data Key
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                  {VDXF_KEYS.PRIMARY_TICKET_FINALIZED_DATA}
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', color: '#ccc', mt: 0.5 }}>
                  from "vlotto.ticket.finalizeddata"
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="secondary"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Create VDXF Key
                </Button>
              </Card>

              {/* Data Descriptor */}
              <Card variant="outlined" sx={{ backgroundColor: '#1e1e1e', p: 1, flexGrow: 1, minWidth: '120px' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Data Descriptor
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                  {VDXF_KEYS.DATA_DESCRIPTOR}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: '#ccc', mt: 0.5 }}>
                  Standard VDXF Data Descriptor
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="secondary"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Create VDXF Key
                </Button>
              </Card>
            </>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

export default UtilitiesSection; 