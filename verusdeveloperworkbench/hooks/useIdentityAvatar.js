import { useState, useEffect, useContext } from 'react';
import { NodeContext } from '../contexts/NodeContext';
import { IdentityContext } from '../contexts/IdentityContext';

// Helper function to convert a hex string to an ASCII string
const hexToString = (hex) => {
  let str = '';
  if (typeof hex !== 'string' || !hex || hex.length % 2 !== 0) {
    // console.warn("hexToString: Invalid hex input", hex);
    return ''; 
  }
  try {
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
  } catch (e) {
    // console.warn("hexToString: Error during conversion", e);
    return '';
  }
  return str;
};

// Helper function to convert a hex string to a Uint8Array
const hexToUint8Array = (hexString) => {
  if (typeof hexString !== 'string' || !hexString || hexString.length % 2 !== 0) {
    // console.warn('hexToUint8Array: Invalid hexString input', hexString);
    //throw new Error('Hex string must have an even number of characters.');
    return new Uint8Array(0); // Return empty array on error to prevent crash
  }
  try {
    const byteArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
      if (isNaN(byteArray[i])) {
        // console.warn(`hexToUint8Array: NaN found at index ${i} for hex part ${hexString.substr(i * 2, 2)}`);
        // throw new Error('Invalid hex character encountered.');
        return new Uint8Array(0); // Return empty on encountering invalid hex
      }
    }
    return byteArray;
  } catch (e) {
    // console.warn('hexToUint8Array: Error during conversion', e);
    return new Uint8Array(0); // Return empty array on error
  }
};

// Helper function to convert Uint8Array to Base64
const uint8ArrayToBase64 = (bytes) => {
  if (!bytes || bytes.byteLength === 0) return '';
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Module-level cache for avatar data and fetch promises
const avatarCache = new Map(); // Stores { data?: { src, label }, error?: string, promise?: Promise }

const PRIMARY_VDXF_KEY = 'iMvTg2HGhKKGYMqtapvRyfZNahbzmD9R3b'; // vdxfkey for general primary content multimap
const DATADESCRIPTOR_VDXF_KEY = 'i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv'; // vdxfkey for DataDescriptor structure
const PROFILE_AVATAR_IMAGE_VDXF_KEY = 'iJv7REmMND6UHwL26nxS48oCXTmUycJfZv'; // vdxfkey for profile.avatar.image

const useIdentityAvatar = (identityNameOrIAddress) => {
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [label, setLabel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { sendCommand } = useContext(NodeContext);
  const { listVersion } = useContext(IdentityContext);

  useEffect(() => {
    const cacheKey = `${identityNameOrIAddress}-${listVersion}`;

    if (!identityNameOrIAddress || !sendCommand) {
      setAvatarSrc(null);
      setLabel(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Check cache first using the new cacheKey
    if (avatarCache.has(cacheKey)) {
      const cached = avatarCache.get(cacheKey);
      if (cached.promise) { 
        setIsLoading(true);
        cached.promise.then(data => {
          if (data.id !== cacheKey && avatarCache.get(cacheKey)?.promise !== cached.promise) return; 
          if (data.error) {
            setError(data.error); setAvatarSrc(null); setLabel(null);
          } else {
            setAvatarSrc(data.src); setLabel(data.label); setError(null);
          }
          setIsLoading(false);
        }).catch(err => {
          if (avatarCache.get(cacheKey)?.promise !== cached.promise) return;
          setError(err.message || 'Cached promise failed'); setIsLoading(false);
        });
        return;
      } else if (cached.data) { 
        setAvatarSrc(cached.data.src); setLabel(cached.data.label); setError(null); setIsLoading(false);
        return;
      } else if (cached.error) { 
        setError(cached.error); setAvatarSrc(null); setLabel(null); setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null); 
    setAvatarSrc(null); 
    setLabel(null);

    const fetchAvatarPromise = (async () => {
      try {
        const result = await sendCommand('getidentity', [identityNameOrIAddress.trim()]);
        let foundAvatar = false;
        let dataToReturn = { id: cacheKey };

        if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
        
        const identityData = result;
        if (identityData?.identity?.contentmultimap?.[PRIMARY_VDXF_KEY]) {
          const primaryKeyDataArray = identityData.identity.contentmultimap[PRIMARY_VDXF_KEY];
          if (Array.isArray(primaryKeyDataArray) && primaryKeyDataArray.length > 0) {
            for (const item of primaryKeyDataArray) { 
              if (item && item[DATADESCRIPTOR_VDXF_KEY]) {
                const dataDescriptor = item[DATADESCRIPTOR_VDXF_KEY];
                if (dataDescriptor.label === PROFILE_AVATAR_IMAGE_VDXF_KEY) {
                  const { objectdata, mimetype } = dataDescriptor;
                  dataToReturn.label = dataDescriptor.label || 'No label provided'; 

                  if (mimetype === 'image/png' && objectdata && typeof objectdata === 'string') {
                    let hexForImageBytes = objectdata; 
                    if (objectdata.startsWith('0x')) { 
                        hexForImageBytes = objectdata.substring(2);
                    } else {
                        const potentialDataString = hexToString(objectdata); 
                        if (potentialDataString.startsWith('0x')) {
                             hexForImageBytes = potentialDataString.substring(2);
                        } else {
                            // If not 0x prefixed and hexToString also doesn't yield 0x,
                            // assume it might be base64 already or some other format. 
                            // For now, this path is less likely for direct blockchain data.
                            // Or, it could be plain hex without the 0x, which hexToUint8Array handles.
                        }
                    }

                    const byteArray = hexToUint8Array(hexForImageBytes);
                    if (byteArray.length > 0) {
                      const base64 = uint8ArrayToBase64(byteArray);
                      if (base64) {
                        dataToReturn.src = `data:image/png;base64,${base64}`;
                        foundAvatar = true;
                        break; 
                      }
                    }
                  }
                }
              }
              if (foundAvatar) break; 
            }
          }
        }
        if (!foundAvatar) dataToReturn.error = 'No Avatar Image Found';
        return dataToReturn;
      } catch (err) {
        return { id: cacheKey, error: `Failed to load avatar: ${err.message}` };
      }
    })();

    avatarCache.set(cacheKey, { promise: fetchAvatarPromise });

    fetchAvatarPromise.then(data => {
      if (avatarCache.get(cacheKey)?.promise === fetchAvatarPromise) {
        if (data.error) {
          setError(data.error); setAvatarSrc(null); setLabel(null);
          avatarCache.set(cacheKey, { error: data.error });
        } else {
          setAvatarSrc(data.src); setLabel(data.label); setError(null);
          avatarCache.set(cacheKey, { data: { src: data.src, label: data.label } });
        }
        setIsLoading(false);
      }
    }).catch(err => { 
      if (avatarCache.get(cacheKey)?.promise === fetchAvatarPromise) {
        const errorMsg = err.message || 'Fetch promise rejected unexpectedly';
        setError(errorMsg);
        setIsLoading(false);
        avatarCache.set(cacheKey, { error: errorMsg });
      }
    });

  }, [identityNameOrIAddress, sendCommand, listVersion]);

  return { avatarSrc, label, isLoading, error };
};

export default useIdentityAvatar; 