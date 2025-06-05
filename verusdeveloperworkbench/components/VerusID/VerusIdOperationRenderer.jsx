import React, { useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { OperationContext } from '../../contexts/OperationContext';
import { TerminalContext } from '../../contexts/TerminalContext';
import { NodeContext } from '../../contexts/NodeContext';

// VerusID Forms
import NameCommitmentForm from './forms/NameCommitmentForm';
import RegisterIdentityForm from './forms/RegisterIdentityForm';
import GetIdentityForm from './forms/GetIdentityForm';
import GetIdentityTrustForm from './forms/GetIdentityTrustForm';
import IdentityContentForm from './forms/IdentityContentForm';
import ListIdentitiesForm from './forms/ListIdentitiesForm';
import IdentitiesWithAddressForm from './forms/IdentitiesWithAddressForm';
import IdentitiesWithRecoveryForm from './forms/IdentitiesWithRecoveryForm';
import IdentitiesWithRevocationForm from './forms/IdentitiesWithRevocationForm';
import IdentityHistoryForm from './forms/IdentityHistoryForm';
import SetTimelockForm from './forms/SetTimelockForm';
import RevokeIdentityForm from './forms/RevokeIdentityForm';
import RecoverIdentityForm from './forms/RecoverIdentityForm';
import SetIdentityTrustForm from './forms/SetIdentityTrustForm';
import UpdateIdentityForm from './forms/UpdateIdentityForm';

// Crypto Operations Forms
import SignMessageForm from '../CryptoOperations/forms/SignMessageForm';
import SignFileForm from '../CryptoOperations/forms/SignFileForm';
import SignDataForm from '../CryptoOperations/forms/SignDataForm';
import VerifyMessageForm from '../CryptoOperations/forms/VerifyMessageForm';
import VerifyFileForm from '../CryptoOperations/forms/VerifyFileForm';
import VerifyHashForm from '../CryptoOperations/forms/VerifyHashForm';
import VerifySignatureForm from '../CryptoOperations/forms/VerifySignatureForm';

const MAX_TERMINAL_HISTORY_LENGTH_DISPLAY = 200; // Consistent with TerminalContext

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0), // Adjusted for header
  background: '#232323',
  border: '1px solid #333',
  borderRadius: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const VerusIdOperationRenderer = () => {
  const { selectedOperation, selectedSubOperation } = useContext(OperationContext);
  const { appendToTerminal, getCommandType } = useContext(TerminalContext) || {};
  const { sendCommand } = useContext(NodeContext) || {};

  let FormComponent = null;
  let formTitle = 'Select an operation';

  if (selectedOperation === 'crypto') {
    formTitle = 'Crypto Operations';
    if (selectedSubOperation) {
        let subOpCryptoTitle = selectedSubOperation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        if (selectedSubOperation === 'signmessage') subOpCryptoTitle = 'Sign Message';
        if (selectedSubOperation === 'signfile') subOpCryptoTitle = 'Sign File';
        if (selectedSubOperation === 'signdata') subOpCryptoTitle = 'Sign Data';
        if (selectedSubOperation === 'verifymessage') subOpCryptoTitle = 'Verify Message';
        if (selectedSubOperation === 'verifyfile') subOpCryptoTitle = 'Verify File';
        if (selectedSubOperation === 'verifyhash') subOpCryptoTitle = 'Verify Hash';
        if (selectedSubOperation === 'verifysignature') subOpCryptoTitle = 'Verify Signature';
        formTitle += ` - ${subOpCryptoTitle}`;
    }
  } else if (selectedOperation) {
    formTitle = `${selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)}`;
    if (selectedSubOperation) {
      let subOpTitle = selectedSubOperation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      if (selectedSubOperation === 'namecommitment') subOpTitle = 'Name Commitment';
      if (selectedSubOperation === 'registeridentity') subOpTitle = 'Register Identity';
      if (selectedSubOperation === 'getidentity') subOpTitle = 'Get Identity';
      if (selectedSubOperation === 'listidentities') subOpTitle = 'List Identities';
      if (selectedSubOperation === 'identitieswithaddress') subOpTitle = 'Identities With Address';
      if (selectedSubOperation === 'identitieswithrecovery') subOpTitle = 'Identities With Recovery';
      if (selectedSubOperation === 'identitieswithrevocation') subOpTitle = 'Identities With Revocation';
      if (selectedSubOperation === 'identityhistory') subOpTitle = 'Identity History';
      if (selectedSubOperation === 'getidentitytrust') subOpTitle = 'Get Identity Trust';
      if (selectedSubOperation === 'identitycontent') subOpTitle = 'Identity Content';
      if (selectedSubOperation === 'timelock') subOpTitle = 'Set Timelock';
      if (selectedSubOperation === 'revoke') subOpTitle = 'Revoke Identity';
      if (selectedSubOperation === 'recover') subOpTitle = 'Recover Identity';
      if (selectedSubOperation === 'setidentitytrust') subOpTitle = 'Set Trust Preferences';
      if (selectedSubOperation === 'updateidentity') subOpTitle = 'Update Identity';
      formTitle += ` - ${subOpTitle}`;
    }
  }

  const formProps = {
    sendRPCCommand: sendCommand,
    onCommandResponse: (response, command) => {
      if (appendToTerminal && getCommandType) {
        appendToTerminal(command, response, command, false, getCommandType(command));
      }
    },
    onCommandError: (error, command) => {
      if (appendToTerminal && getCommandType) {
        appendToTerminal(command, error, command, true, getCommandType(command));
      }
    }
  };

  // This formTitle is for the content *within* the form area, below the main "Forms" header.
  let subFormTitle = 'Select an operation';
  if (selectedOperation === 'crypto') {
    subFormTitle = 'Crypto Operations';
    if (selectedSubOperation) {
        let subOpCryptoTitle = selectedSubOperation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        if (selectedSubOperation === 'signmessage') subOpCryptoTitle = 'Sign Message';
        if (selectedSubOperation === 'signfile') subOpCryptoTitle = 'Sign File';
        if (selectedSubOperation === 'signdata') subOpCryptoTitle = 'Sign Data';
        if (selectedSubOperation === 'verifymessage') subOpCryptoTitle = 'Verify Message';
        if (selectedSubOperation === 'verifyfile') subOpCryptoTitle = 'Verify File';
        if (selectedSubOperation === 'verifyhash') subOpCryptoTitle = 'Verify Hash';
        if (selectedSubOperation === 'verifysignature') subOpCryptoTitle = 'Verify Signature';
        subFormTitle += ` - ${subOpCryptoTitle}`;
    }
  } else if (selectedOperation === 'identity') {
    subFormTitle = 'VerusID Management';
    if (selectedSubOperation) {
        const subOpIdTitle = selectedSubOperation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        subFormTitle += ` - ${subOpIdTitle}`;
    }
  } else if (!selectedOperation && !selectedSubOperation) {
    subFormTitle = 'Select an operation from the menu';
  }

  switch (selectedSubOperation) {
    // Identity Creation
    case 'namecommitment': FormComponent = NameCommitmentForm; break;
    case 'registeridentity': FormComponent = RegisterIdentityForm; break;
    // Identity Query
    case 'getidentity': FormComponent = GetIdentityForm; break;
    case 'listidentities': FormComponent = ListIdentitiesForm; break;
    case 'identitieswithaddress': FormComponent = IdentitiesWithAddressForm; break;
    case 'identitieswithrecovery': FormComponent = IdentitiesWithRecoveryForm; break;
    case 'identitieswithrevocation': FormComponent = IdentitiesWithRevocationForm; break;
    case 'identityhistory': FormComponent = IdentityHistoryForm; break;
    case 'getidentitytrust': FormComponent = GetIdentityTrustForm; break;
    case 'identitycontent': FormComponent = IdentityContentForm; break;
    // Identity Management - Corrected Keys
    case 'setidentitytimelock': FormComponent = SetTimelockForm; break;
    case 'revokeidentity': FormComponent = RevokeIdentityForm; break;
    case 'recoveridentity': FormComponent = RecoverIdentityForm; break;
    case 'setidentitytrust': FormComponent = SetIdentityTrustForm; break;
    case 'updateidentity': FormComponent = UpdateIdentityForm; break;
    
    // Crypto Operations
    case 'signmessage': FormComponent = SignMessageForm; break;
    case 'signfile': FormComponent = SignFileForm; break;
    case 'signdata': FormComponent = SignDataForm; break;
    case 'verifymessage': FormComponent = VerifyMessageForm; break;
    case 'verifyfile': FormComponent = VerifyFileForm; break;
    case 'verifyhash': FormComponent = VerifyHashForm; break;
    case 'verifysignature': FormComponent = VerifySignatureForm; break;

    default:
      if (selectedSubOperation) { // Check specifically if a subOp IS selected but has no form
        console.warn(`[VerusIdOperationRenderer] No form component found for selectedSubOperation: ${selectedSubOperation}`);
        FormComponent = () => <Typography sx={{ color: '#bbb' }}>Form for "{formTitle}" is not yet implemented or has an error.</Typography>;
      } else {
        FormComponent = () => <Typography sx={{ color: '#bbb' }}>Please select an operation from the menu.</Typography>;
      }
      break;
  }

  return (
    <StyledPaper>
      <Typography 
        variant="h6" 
        sx={{ 
          p: 1, 
          textAlign: 'center', 
          color: 'white', 
          backgroundColor: '#191919',
          flexShrink: 0
        }}
      >
        Forms
      </Typography>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
        {FormComponent ? (
          <>
            {selectedOperation === 'crypto' && (
              <Typography variant="caption" sx={{ color: '#aaa', textAlign: 'center', display: 'block', mb: 1.5 }}>
                Note: RPC Terminal history is capped at the last {MAX_TERMINAL_HISTORY_LENGTH_DISPLAY} entries.
              </Typography>
            )}
            <FormComponent {...formProps} title={subFormTitle} />
          </>
        ) : (
          <Typography sx={{ textAlign: 'center', color: '#bbb', mt: 2 }}>
            {subFormTitle}
          </Typography>
        )}
      </Box>
    </StyledPaper>
  );
};

export default VerusIdOperationRenderer; 