// Identity Flags (from Verus documentation and usage)
export const FLAGS = {
  1: 'IS_CURRENCY_FLAG', // If set, this identity is a currency
  2: 'ID_FULLY_REGISTERED', // If set, this identity is fully registered
  4: 'ID_ADDRESS_ONLY', // If set, this identity is an address only, not an i-address
  8: 'ID_REFERRALS_ENABLED', // If set, identity referrals are enabled for this ID
  16: 'ID_REFERRALS_REQUIRED', // If set, identity referrals are required to register under this ID
  32: 'ID_TOKENIZED_CONTROL', // If set, this identity is tokenized control
  64: 'ID_PROVISIONAL', // If set, this identity is provisional (e.g., before meeting launch requirements)
  // Note: These are examples, and the actual flags might be more extensive or different.
  // We'll start with these common ones and can expand.
  // For VDXF/ContentMap related flags (if any specific ones are rendered this way) they would be added here.
  // Currency-specific flags like IS_TOKEN_FLAG, IS_FRACTIONAL_FLAG, IS_PBAAS_FLAG might be better handled
  // in a currencyUtils.js if they are only relevant to currency definitions, but for general identity flags, this is the place.
  // From DefineCurrencyParamsCM.jsx options (these are currency options but might overlap or be needed for context)
  // We should clarify if these are the same 'flags' being decoded for general identity display
  // or if 'identity.flags' refers to a different set. Assuming general identity flags for now.
};

// Based on the Verus documentation snippet for currency flags, which might give hints:
// 0x01 (1) - FRACTIONAL (Currency)
// 0x02 (2) - IDRESTRICTED (Currency)
// 0x04 (4) - IDSTAKING (Currency)
// 0x08 (8) - IDREFERRALS (Currency/Identity)
// 0x10 (16) - IDREFERRALSREQUIRED (Currency/Identity)
// 0x20 (32) - TOKEN (Currency)
// 0x100 (256) - IS_PBAAS_CHAIN (Currency)


// For Identity 'flags' field from getidentity:
export const IDENTITY_FLAGS = {
  VDXF_KEY_IS_CURRENCY: 1,        // if set, this is a currency
  VDXF_KEY_REVOKED: 2,            // if set, this identity is revoked
  VDXF_KEY_LOCKED: 4,             // if set, this identity is locked and waiting for unlock. until then, it cannot be used or updated
  VDXF_KEY_ID_INVALID: 8,         // if set, this identity is invalid
  VDXF_KEY_ID_HASPARENT: 16,      // if set, this ID has a parent
  VDXF_KEY_ID_PRIMARY: 32,        // if set, this ID is a primary ID of its parent
  VDXF_KEY_ID_SYSTEMID: 64,       // if set, this ID is a system ID
  VDXF_KEY_IS_SYSTEM_CONTROLLER: 128, // if set, this ID is a system controller namespace or ID
  VDXF_KEY_IS_SUBID: 256,         // if set, this is a subid, not a normal friendly name ID
  VDXF_KEY_CAN_TRANSFER: 512,     // if set, this ID can be transferred
  VDXF_KEY_CAN_CREATEID: 1024,    // if set, this ID can create other IDs
  VDXF_KEY_CAN_CREATECURRENCY: 2048, // if set, this ID can create currencies
  VDXF_KEY_CAN_CREATECONVERTER: 4096, // if set, this ID can create currency converters
  VDXF_KEY_IS_PBAAS_CHAIN: 8192,  // if set, this ID is a PBaaS chain
  VDXF_KEY_IS_PBAAS_CONVERTER: 16384, // if set, this ID is a PBaaS chain converter
  VDXF_KEY_IS_PBAAS_GATEWAY: 32768,  // if set, this ID is a PBaaS gateway
  // Composite flags (examples, more can be defined as needed)
  VDXF_KEY_IS_PBAAS_TYPE: (8192 | 16384 | 32768), // IS_PBAAS_CHAIN or IS_PBAAS_CONVERTER or IS_PBAAS_GATEWAY
};

export const getFlagDescription = (flagsInt) => {
  if (typeof flagsInt !== 'number') return ['N/A'];
  const activeFlags = [];
  for (const flagValue in IDENTITY_FLAGS) {
    if ((flagsInt & parseInt(flagValue)) === parseInt(flagValue)) {
      activeFlags.push(`${IDENTITY_FLAGS[flagValue]} (Bit ${Math.log2(parseInt(flagValue))})`);
    }
  }
  return activeFlags.length > 0 ? activeFlags : ['None'];
};

// Helper to convert flags integer to a list of string descriptions
export const getIdentityFlagStrings = (flagsInt) => {
  if (typeof flagsInt !== 'number') return ['N/A'];
  const descriptions = [];
  if ((flagsInt & 1) === 1) descriptions.push("LOCKED_ID_INVALID");
  if ((flagsInt & 2) === 2) descriptions.push("LOCKED_ID");
  if ((flagsInt & 4) === 4) descriptions.push("REVOKED_ID");
  if ((flagsInt & 8) === 8) descriptions.push("RECOVERY_ID");
  // Add more general identity flags here as they are identified

  return descriptions.length > 0 ? descriptions : ["No specific general flags set"];
};

// You can add other utility functions related to identities here in the future. 