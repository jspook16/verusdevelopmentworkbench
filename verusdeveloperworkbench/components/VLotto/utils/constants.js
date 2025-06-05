// VLotto Constants and Configuration

// localStorage keys for persistence
export const STORAGE_KEYS = {
  JACKPOT_ID: 'vlotto-jackpotIdDetails',
  PAYOUT_ID: 'vlotto-payoutIdDetails', 
  OPERATIONS_ID: 'vlotto-operationsIdDetails',
  PROOFGUARD_ID: 'vlotto-proofguardIdDetails',
  RESERVES_ID: 'vlotto-reservesIdDetails',
  REVENUES_ID: 'vlotto-revenuesIdDetails',
  MAIN_VERUS_ID: 'vlotto-mainVerusId',
  TICKETS: 'vlotto-generatedTickets',
  GENERATION_STATUS: 'vlotto-generationStatus'
};

// VDXF Keys used for storing finalized ticket data in contentmultimap
export const VDXF_KEYS = {
  PRIMARY_TICKET_FINALIZED_DATA: "iMzWvy5j4ciiMSBsEEVzfy66awLQ85b4GN", // From getvdxfid "vlotto.ticket.finalizeddata"
  DATA_DESCRIPTOR: "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv", // Standard VDXF Data Descriptor key
};

// Utility ID types
export const UTILITY_ID_TYPES = ['jackpot', 'payout', 'operations', 'proofguard', 'reserves', 'revenues'];

// Default configuration values
export const DEFAULT_CONFIG = {
  TICKET_QUANTITY: 10,
  SORT_CRITERIA: 'matches',
  MAX_CONFIRMATION_ATTEMPTS: 60,
  CONFIRMATION_CHECK_INTERVAL: 10000, // 10 seconds
  TRANSACTION_DELAY: 100, // 0.1 seconds - reduced for testing with proper UTXO management
  INTER_TICKET_DELAY: 100, // 0.1 seconds - reduced for testing with proper UTXO management  
  UPDATE_IDENTITY_DELAY: 100, // 0.1 seconds - reduced for testing with proper UTXO management
};

// Animation configuration
export const ANIMATION_CONFIG = {
  HASH_CHARACTERS: '0123456789abcdef',
  SPIN_COUNT: 5,
  SPIN_DELAY: 20, // milliseconds
  REVEAL_DELAY: 30, // milliseconds
  MAX_HASH_LENGTH: 64
}; 