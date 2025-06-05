// Helper function to format a CLI command from RPC method and params
export const formatCliCommand = (method, params) => {
  // Start with the base command
  let command = `./verus -chain=VRSCTEST ${method}`;
  
  // Special case formatting for specific commands
  if (method === 'updateidentity' && params && params[0] && typeof params[0] === 'object') {
    // Format updateidentity command with pretty JSON
    return `./verus -chain=VRSCTEST ${method} '${JSON.stringify(params[0], null, 0)}'`;
  } else if (method === 'registernamecommitment' && Array.isArray(params)) {
    // Format parameters appropriately for registernamecommitment
    return `./verus -chain=VRSCTEST ${method} ${params.map(p => p === null ? 'null' : `"${p}"`).join(' ')}`;
  } else if (method === 'getidentitycontent' && Array.isArray(params) && params.length > 0 && params.length <= 7) {
    // Ensure all parameters are appropriately quoted or handled if they are objects/booleans for CLI
    const cliParams = params.map(p => {
      if (typeof p === 'string' && p.startsWith('i-') && p.length >= 33 && p.length <=34) return p; // Don't quote i-addresses
      if (typeof p === 'string') return `"${p}"`;
      if (typeof p === 'boolean' || typeof p === 'number') return String(p);
      if (p === null) return 'null';
      // For other types, especially objects, it might need specific handling or might not be CLI-friendly without stringification
      // For getidentitycontent specifically, complex objects are not typical for its direct CLI parameters beyond the first few simple ones.
      return `'${JSON.stringify(p)}'`; // Fallback, might need adjustment per command
    }).join(' ');
    return `./verus -chain=VRSCTEST ${method} ${cliParams}`;
  }
  
  // Default formatting for other commands
  if (Array.isArray(params) && params.length > 0) {
    const processedParams = params.map(p => {
      if (p === null) return 'null';
      // Heuristic for i-address: starts with 'i', is alphanumeric, and typical length (e.g. 34 chars for mainnet/testnet)
      // A more robust check might be needed if other i-like strings are used.
      if (typeof p === 'string' && p.startsWith('i') && p.length >= 33 && p.length <= 34 && /^[a-zA-Z0-9]+$/.test(p)) {
        return p; // Don't quote i-addresses
      }
      if (typeof p === 'string') return `"${p}"`;
      if (typeof p === 'boolean' || typeof p === 'number') return String(p);
      if (typeof p === 'object') return `'${JSON.stringify(p)}'`; // Enclose JSON strings in single quotes for CLI
      return `"${String(p)}"`; // Default to string an quote
    });
    command += ' ' + processedParams.join(' ');
  }
  
  return command;
};

// Helper function to categorize RPC commands (from original App.jsx)
export const getCommandType = (method) => {
  const identityCommands = [
    'registeridentity', 'registernamecommitment', 'updateidentity', 
    'recoveridentity', 'revokeidentity', 'setidentitytimelock', 'setidentitytrust'
  ];
  
  const cryptoCommands = [
    'signmessage', 'signfile', 'signdata', 'verifymessage', 
    'verifyfile', 'verifyhash', 'verifysignature'
  ];
  
  const queryCommands = [
    'getidentity', 'listidentities', 'getidentitieswithaddress',
    'getidentitieswithrecovery', 'getidentitieswithrevocation',
    'getidentitycontent', 'getidentityhistory', 'getidentitytrust',
    'getvdxfid' // Added getvdxfid as it's a query
  ];

  // Added from VDXF Tab
  const vdxfCommands = ['get-vdxfid', 'update-content-map', 'update-content-multimap', 'batch-add-content-map'];

  // Added from Node Context / General
  const nodeCommands = ['getinfo', 'check-node-connection']; // check-node-connection is an IPC event, getinfo is the RPC

  if (identityCommands.includes(method)) return 'identity';
  if (cryptoCommands.includes(method)) return 'crypto';
  if (queryCommands.includes(method)) return 'query';
  if (vdxfCommands.includes(method)) return 'vdxf'; // New category for VDXF specific commands
  if (nodeCommands.includes(method)) return 'node'; // New category for node commands

  return 'other'; // Default category
}; 