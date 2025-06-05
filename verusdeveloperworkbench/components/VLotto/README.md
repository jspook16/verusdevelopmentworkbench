# VLotto System - Complete Refactoring Documentation

## Overview
The VLotto (Verus Lottery) system has been completely refactored from a 2000+ line monolithic component into a modular, maintainable architecture using custom React hooks. This refactoring makes testing the proofguard functionality much easier and improves code organization.

## Architecture

### Core Components

#### 1. Constants (`utils/constants.js`)
Centralized configuration and constants:
- **localStorage Keys**: All VLotto storage keys (JACKPOT_ID, PAYOUT_ID, MAINTENANCE_ID, PROOFGUARD_ID, etc.)
- **VDXF Keys**: Blockchain data storage keys for ticket finalization
- **Default Config**: Ticket quantity (10), sort criteria ('matches'), confirmation attempts (60)
- **Animation Config**: Hash reveal animation settings

#### 2. Utility Functions (`utils/ticketHelpers.js`)
Pure utility functions for ticket operations:
- `generateTicketName()`: Creates format "blockNumber_ticketNumberoftotalTickets."
- `getParentName()`: Removes @ suffix from identity IDs
- `calculateMatchingPositions()`: Compares ticket hash with drawing hash
- `calculateTicketScore()`: Exponential scoring (2^consecutiveFromStart + total matches)
- `sortTickets()`: Supports 'matches', 'score', 'name' criteria with tie-breaking
- `parseTicketName()`: Extracts subID and parent from full ticket names
- `createTicketPayload()`: Structures ticket data for updateidentity

#### 3. Cryptographic Helpers (`utils/cryptoHelpers.js`)
Blockchain interaction functions:
- `signMessage()`: Wrapper for signmessage command
- `verifyMessage()`: Wrapper for verifymessage command
- `createContentMultiMapUpdate()`: Creates VDXF structure for updateidentity
- `extractVLottoData()`: Parses VLotto data from identity contentmultimap
- `verifyRegistrationTransaction()`: Validates registration TXID using blockchain data

### Custom Hooks

#### 1. `useUtilityIds` (`hooks/useUtilityIds.js`)
Manages all four utility ID types with localStorage persistence:
- **State**: jackpotIdDetails, payoutIdDetails, maintenanceIdDetails, proofguardIdDetails
- **Functions**: 
  - `handleCreateUtilityId()`: Creates new utility IDs with name commitment and registration
  - `fetchVlottoSubIdBalance()`: Gets balance for utility IDs
  - `getPrimaryAddressForIdentity()`: Resolves identity to R-address
  - `getUtilityIdDetails()`: Unified getter for any utility ID type
- **Features**: Transaction confirmation waiting, balance refresh, error handling

#### 2. `useTicketGeneration` (`hooks/useTicketGeneration.js`)
Complete ticket creation workflow:
- **Main Process**: name commitment → confirmation → identity registration → confirmation → cryptographic finalization
- **Proofguard Integration**: Uses proofguard ID for signing instead of jackpot ID
- **Two-Step Signing**: 
  1. Ticket signs registration TXID
  2. Proofguard signs ticket signature
- **State Management**: tickets, pendingCommitments, pendingRegistrations, generationStatus
- **localStorage Persistence**: All ticket data and generation status

#### 3. `useDrawingSystem` (`hooks/useDrawingSystem.js`)
Lottery drawing functionality with animated hash reveal:
- **Block Hash Fetching**: Uses getblockhash command
- **Animation**: Character-by-character hash reveal with spinning effects
- **Score Calculation**: Determines winner based on matches, score, and lowest ID tie-breaking
- **Dynamic Sorting**: Real-time re-sorting by matches, score, or name
- **Results**: Single winner, total tickets, max scores, all ticket details

#### 4. `useTicketVerification` (`hooks/useTicketVerification.js`)
3-step cryptographic verification process:
- **Step 1**: Registration TXID validation using blockchain transaction data
- **Step 2**: Ticket self-signature verification (ticket signs its registration TXID)
- **Step 3**: Proofguard acknowledgment verification (proofguard signs ticket's signature)
- **Comprehensive Validation**: Identity primary/reservation data matching
- **Detailed Error Reporting**: Specific failure points and validation details

## Key Technical Changes

### Proofguard Migration
- **Before**: All signing operations used jackpot ID
- **After**: All signing operations use proofguard ID
- **JSON Structure**: Updated `jackpot_acknowledgement` → `proofguard_acknowledgement`
- **UI Labels**: "Jackpot ID Acknowledgment" → "Proofguard ID Acknowledgment"

### VDXF Data Structure
```javascript
const contentMultiMapUpdate = {
  [VDXF_KEYS.PRIMARY_TICKET_FINALIZED_DATA]: [
    {
      [VDXF_KEYS.DATA_DESCRIPTOR]: {
        version: 1,
        flags: 96,
        mimetype: "text/plain",
        objectdata: {
          message: JSON.stringify(ticketPayload)
        },
        label: "VLotto Ticket Chain of Custody Data"
      }
    }
  ]
};
```

### Ticket Payload Structure
```javascript
const ticketPayload = {
  registration_txid: registrationTxId,
  ticket_validation: {
    signed_by_ticket_hash: hash1,
    signed_by_ticket_signature: sig1,
  },
  proofguard_acknowledgement: {
    signed_by_proofguard_hash: hash2,
    signed_by_proofguard_signature: sig2,
  },
  playing_number: hash2,
};
```

## File Structure
```
components/VLotto/
├── VLottoView.jsx (300 lines - down from 2000+)
├── utils/
│   ├── constants.js
│   ├── ticketHelpers.js
│   └── cryptoHelpers.js
└── hooks/
    ├── useUtilityIds.js
    ├── useTicketGeneration.js
    ├── useDrawingSystem.js
    └── useTicketVerification.js
```

## Benefits of Refactoring

### 1. **Maintainability**
- Separated concerns into focused, single-responsibility modules
- Reduced main component from 2000+ lines to ~300 lines
- Clear separation between UI logic and business logic

### 2. **Testability**
- Each hook can be tested independently
- Pure utility functions are easily unit testable
- Proofguard functionality is isolated and testable

### 3. **Reusability**
- Hooks can be reused across different components
- Utility functions are framework-agnostic
- Cryptographic helpers can be used in other blockchain applications

### 4. **Developer Experience**
- Clear, documented APIs for each hook
- Consistent error handling and status reporting
- Easy to understand data flow

### 5. **Performance**
- Optimized re-renders through proper hook dependencies
- Memoized components for ticket display
- Efficient localStorage management

## Usage Example

```javascript
function VLottoView() {
  const { sendCommand } = useContext(NodeContext);

  // Initialize all hooks
  const utilityIds = useUtilityIds(sendCommand);
  const ticketGeneration = useTicketGeneration(sendCommand);
  const drawingSystem = useDrawingSystem(sendCommand);
  const ticketVerification = useTicketVerification(sendCommand);

  // Handle ticket generation with proofguard ID
  const handleGenerateTickets = async () => {
    try {
      await ticketGeneration.generateTickets(utilityIds.proofguardIdDetails?.name);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle drawing
  const handlePerformDrawing = async () => {
    try {
      await drawingSystem.performDrawing(ticketGeneration.tickets);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle verification
  const handleVerifyTicket = async () => {
    try {
      await ticketVerification.verifyTicket();
    } catch (error) {
      alert(error.message);
    }
  };

  // UI rendering...
}
```

## Testing Proofguard Functionality

The refactored architecture makes testing proofguard functionality much easier:

1. **Isolated Testing**: The `useTicketGeneration` hook isolates all proofguard signing logic
2. **Clear State Management**: Easy to track proofguard ID creation and usage
3. **Verification Testing**: The `useTicketVerification` hook provides comprehensive validation
4. **Error Handling**: Clear error messages for each step of the proofguard process

## Migration Notes

- All existing functionality is preserved
- localStorage keys remain the same for backward compatibility
- UI components maintain the same visual design
- All blockchain interactions use the same Verus commands

This refactoring provides a solid foundation for continued development and testing of the VLotto system's proofguard functionality. 