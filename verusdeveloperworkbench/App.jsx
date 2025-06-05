import React, { useState } from 'react';
import { OperationProvider } from './contexts/OperationContext';
import { TerminalProvider } from './contexts/TerminalContext';
import { NodeProvider } from './contexts/NodeContext';
import { IdentityProvider } from './contexts/IdentityContext';
import { WorkbenchDataProvider } from './contexts/WorkbenchDataContext';
import { CurrencyDefinitionProvider } from './contexts/CurrencyDefinitionContext';
// import { CryptoLogProvider } from './contexts/CryptoLogContext';
import MainAppLayout from './components/Core/MainAppLayout'; // Import the new layout component

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; // Removed Box, Tabs, Tab
// Removed OperationContext import again as it's not used directly in App.jsx anymore
// Removed VDXF component imports as MainAppLayout handles them

// Basic dark theme (can be expanded or moved to its own file later)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#181818', paper: '#232323' }, // paper can be used for cards, dialogs etc.
    text: { primary: '#ffffff', secondary: '#bbbbbb' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', 
    fontSize: 12,
    h5: { fontWeight: 700, fontSize: '1.25rem' }, 
    h6: { fontWeight: 700, fontSize: '1.1rem' }, 
    body2: { fontSize: '0.875rem' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': { color: '#90caf9' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#444' },
            '&:hover fieldset': { borderColor: '#666' },
            '&.Mui-focused fieldset': { borderColor: '#90caf9' },
            'input': { color: '#fff' },
          },
          '& .MuiInputLabel-root': { color: '#bbb' },
        }
      }
    },
    MuiPaper: { styleOverrides: { root: { border: '1px solid #333' } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(144, 202, 249, 0.16)', 
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.22)',
            }
          }
        }
      }
    }
  }
});

function App() {
  const [selectedTab, setSelectedTab] = useState(0); // 0: VerusID, 1: VDXF, 2: Currency
  // Removed useContext calls for OperationContext and IdentityContext from here

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Removed logic that tried to use IdentityContext here, as it's not available
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <TerminalProvider>
        <NodeProvider>
          <WorkbenchDataProvider>
          <OperationProvider>
            <IdentityProvider>
              <CurrencyDefinitionProvider>
                {/* <CryptoLogProvider> */}
                <MainAppLayout selectedTab={selectedTab} handleTabChange={handleTabChange} />
                {/* </CryptoLogProvider> */}
              </CurrencyDefinitionProvider>
            </IdentityProvider>
          </OperationProvider>
          </WorkbenchDataProvider>
        </NodeProvider>
      </TerminalProvider>
    </ThemeProvider>
  );
}

export default App; 