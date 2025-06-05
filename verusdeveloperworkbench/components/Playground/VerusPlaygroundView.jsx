import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';
import { NodeContext } from '../../contexts/NodeContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  background: '#2a2a2a', // Darker paper for sections
  border: '1px solid #383838',
}));

const FullWidthTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    color: '#e0e0e0',
    backgroundColor: '#1e1e1e',
    '& fieldset': {
      borderColor: '#444',
    },
    '&:hover fieldset': {
      borderColor: '#666',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#90caf9',
    },
    '& .MuiInputBase-input::placeholder': {
      color: '#777',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#c5c5c5',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#90caf9',
  },
});

const VerusPlaygroundView = () => {
  // State for Image to Hex
  const [selectedFile, setSelectedFile] = useState(null);
  const [hexOutput, setHexOutput] = useState('');
  const [imageToHexError, setImageToHexError] = useState('');
  const [isConvertingToHex, setIsConvertingToHex] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState('');

  // State for Hex to Image
  const [hexInput, setHexInput] = useState('');
  const [imageSrcOutput, setImageSrcOutput] = useState('');
  const [hexToImageError, setHexToImageError] = useState('');
  const [isConvertingToImage, setIsConvertingToImage] = useState(false);

  // State for Get Identity Avatar
  const [identityInput, setIdentityInput] = useState('');
  const [avatarData, setAvatarData] = useState({ label: '', imageSrc: '', rawJson: '' });
  const [getAvatarError, setGetAvatarError] = useState('');
  const [isFetchingAvatar, setIsFetchingAvatar] = useState(false);

  // State for Segmented UpdateIdentity JSON Generator
  const [segmentedFile, setSegmentedFile] = useState(null);
  const [segmentedJsonOutput, setSegmentedJsonOutput] = useState('');
  const [segmentedJsonError, setSegmentedJsonError] = useState('');
  const [isGeneratingSegmentedJson, setIsGeneratingSegmentedJson] = useState(false);
  const [segmentedFilePreview, setSegmentedFilePreview] = useState('');

  const { sendCommand } = useContext(NodeContext) || {};

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageToHexError('');
      setHexOutput('');
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setOriginalImageSrc('');
    }
  };

  const handleSegmentedFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSegmentedFile(file);
      setSegmentedJsonError('');
      setSegmentedJsonOutput('');
      // Optional: Show a preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSegmentedFilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setSegmentedFilePreview('');
      }
    } else {
      setSegmentedFile(null);
      setSegmentedFilePreview('');
    }
  };

  const arrayBufferToHex = (buffer) => {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  };

  const hexToString = (hex) => {
    let str = '';
    if (typeof hex !== 'string' || hex.length % 2 !== 0) {
      // console.warn("hexToString: Invalid hex input", hex);
      return ''; // Or throw error, depending on desired strictness
    }
    try {
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
    } catch (e) {
      // console.warn("hexToString: Error during conversion", e);
      return ''; // Or re-throw
    }
    return str;
  };

  const convertImageToHex = useCallback(async () => {
    if (!selectedFile) {
      setImageToHexError('Please select an image file first.');
      return;
    }
    setIsConvertingToHex(true);
    setImageToHexError('');
    setHexOutput('');
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hex = arrayBufferToHex(arrayBuffer);
      setHexOutput(hex);
    } catch (error) {
      console.error("Error converting image to hex:", error);
      setImageToHexError(`Failed to convert image: ${error.message}`);
    } finally {
      setIsConvertingToHex(false);
    }
  }, [selectedFile]);

  const hexToUint8Array = (hexString) => {
    if (hexString.length % 2 !== 0) {
        throw new Error('Hex string must have an even number of characters.');
    }
    const byteArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < byteArray.length; i++){
        byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return byteArray;
  };

  const convertHexToImage = useCallback(() => {
    if (!hexInput.trim()) {
      setHexToImageError('Please enter a hex string.');
      return;
    }
    setIsConvertingToImage(true);
    setHexToImageError('');
    setImageSrcOutput(''); // Clear previous image
    try {
      const byteArray = hexToUint8Array(hexInput.trim());
      // Try to guess common image types or let the browser infer
      // For robust solution, might need user to specify type or analyze magic bytes
      const blob = new Blob([byteArray], { type: 'image/png' }); // Defaulting to png, could be jpeg, gif etc.
      const imageUrl = URL.createObjectURL(blob);
      setImageSrcOutput(imageUrl);
    } catch (error) {
      console.error("Error converting hex to image:", error);
      setHexToImageError(`Failed to convert hex: ${error.message}`);
    } finally {
      setIsConvertingToImage(false);
    }
  }, [hexInput]);

  const uint8ArrayToBase64 = (bytes) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleGetIdentityAndDisplayAvatar = useCallback(async () => {
    if (!identityInput.trim()) {
      setGetAvatarError('Please enter an Identity name or i-address.');
      return;
    }
    setIsFetchingAvatar(true);
    setGetAvatarError('');
    setAvatarData({ label: '', imageSrc: '', rawJson: '' });

    const PRIMARY_VDXF_KEY = 'iMvTg2HGhKKGYMqtapvRyfZNahbzmD9R3b';
    const DATADESCRIPTOR_VDXF_KEY = 'i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv';

    try {
      const commandArgs = {
        command: 'getidentity',
        chain: 'VRSCTEST', 
        prettyargs: [identityInput.trim()],
      };
      
      const result = await sendCommand(commandArgs.command, commandArgs.prettyargs);
      
      if (result.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }

      const identityData = result; 
      setAvatarData(prev => ({ ...prev, rawJson: JSON.stringify(identityData, null, 2) }));

      if (!identityData) {
        throw new Error('Received null or undefined response from getidentity.');
      }

      if (
        identityData.identity &&
        identityData.identity.contentmultimap &&
        identityData.identity.contentmultimap[PRIMARY_VDXF_KEY]
      ) {
        const primaryKeyDataArray = identityData.identity.contentmultimap[PRIMARY_VDXF_KEY];
        
        if (Array.isArray(primaryKeyDataArray) && primaryKeyDataArray.length > 0) {
          const descriptorEntry = primaryKeyDataArray.find(item => item && item[DATADESCRIPTOR_VDXF_KEY]);

          if (descriptorEntry && descriptorEntry[DATADESCRIPTOR_VDXF_KEY]) {
            const dataDescriptor = descriptorEntry[DATADESCRIPTOR_VDXF_KEY];
            const { objectdata, mimetype, label } = dataDescriptor;

            if (mimetype === 'image/png' && objectdata && typeof objectdata === 'string') {
              const potentialDataString = hexToString(objectdata); // objectdata is hex of ("0x" + imageHex)
              
              if (potentialDataString.startsWith('0x')) {
                const hexForImageBytes = potentialDataString.substring(2); // Get actual image hex
                const byteArray = hexToUint8Array(hexForImageBytes);
                const base64 = uint8ArrayToBase64(byteArray);
                const imageSrc = `data:image/png;base64,${base64}`;
                
                setAvatarData(prev => ({ ...prev, label: label || 'No label provided', imageSrc: imageSrc }));
                setGetAvatarError(''); // Clear any previous error on success
                return; 
              }
            }
          }
        }
      }
      
      // If we reach here, avatar was not found or data was malformed/missing.
      setGetAvatarError('No Avatar Image Found');

    } catch (error) {
      console.error("Error getting identity or processing avatar:", error);
      setGetAvatarError(`Operation failed: ${error.message}`);
    } finally {
      setIsFetchingAvatar(false);
    }
  }, [identityInput, sendCommand]);

  const generateSegmentedUpdateIdentityJson = useCallback(async () => {
    if (!segmentedFile) {
      setSegmentedJsonError('Please select a file first.');
      return;
    }
    setIsGeneratingSegmentedJson(true);
    setSegmentedJsonError('');
    setSegmentedJsonOutput('');

    const VDXF_KEYS = {
      PRIMARY_CONTENT_KEY: 'iMvTg2HGhKKGYMqtapvRyfZNahbzmD9R3b',
      DATA_DESCRIPTOR_KEY: 'i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv',
      SEGMENT_LABELS_VDXF_IDS: [
        'iGrmDH3fdBx5yWjJzZZ1CpLZixBFi8Mr7u', // profile.avatar.image.segmented.1
        'iLtBtNLw95C2vXTjc83Ld8u5iR77Wg1RPU', // profile.avatar.image.segmented.2
        'i3rKLGtSrPYZAh1SAWBBrNTXFjtJsznLhq', // profile.avatar.image.segmented.3
        'iJxFy92JXwFXr6ACT95tPDtHwktV3yCEhJ', // profile.avatar.image.segmented.4
        'iERT7yvLiVEKLv6RLWeQPCtt2v9rLi2FDs', // profile.avatar.image.segmented.5
      ],
    };
    const NUM_SEGMENTS = 5;

    try {
      const arrayBuffer = await segmentedFile.arrayBuffer();
      const rawHex = arrayBufferToHex(arrayBuffer);

      // Calculate segment length (ensure it's an even number for hex pairs)
      const numHexCharsPerSegment = Math.ceil(rawHex.length / NUM_SEGMENTS);
      const segmentLength = numHexCharsPerSegment % 2 === 0 ? numHexCharsPerSegment : numHexCharsPerSegment + 1;

      const segmentsArray = [];
      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const segmentHexData = rawHex.substr(i * segmentLength, segmentLength);
        if (!segmentHexData) continue; // Skip if somehow out of bounds

        segmentsArray.push({
          [VDXF_KEYS.DATA_DESCRIPTOR_KEY]: {
            objectdata: '0x' + segmentHexData,
            mimetype: 'image/png', // All segments as image/png for now
            label: VDXF_KEYS.SEGMENT_LABELS_VDXF_IDS[i]
          }
        });
      }
              
      const correctedUpdateIdentityJson = {
        name: 'testid@',
        contentmultimap: { 
            [VDXF_KEYS.PRIMARY_CONTENT_KEY]: segmentsArray
        },
        feeamount: 0.0001
      };

      setSegmentedJsonOutput(JSON.stringify(correctedUpdateIdentityJson));

    } catch (error) {
      console.error("Error generating segmented JSON:", error);
      setSegmentedJsonError(`Failed to generate JSON: ${error.message}`);
    } finally {
      setIsGeneratingSegmentedJson(false);
    }
  }, [segmentedFile]);

  // Cleanup object URLs when component unmounts or imageSrc changes
  useEffect(() => {
    let objectUrlToRevoke = imageSrcOutput;
    let previewUrlToRevoke = segmentedFilePreview; // Capture current value
    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      if (previewUrlToRevoke && previewUrlToRevoke.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrlToRevoke);
      }
    };
  }, [imageSrcOutput, segmentedFilePreview]); // Include segmentedFilePreview

  return (
    <Box sx={{ p: 2, backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fafafa', textAlign: 'center', mb: 4 }}>
        Verus Developer Playground
      </Typography>
      <Grid container spacing={3}>
        {/* Image to Hex Converter */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ color: '#fafafa', mb: 2 }}>
              Image to Hex Converter
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={originalImageSrc ? 6 : 12}>
                <FullWidthTextField
                  type="file"
                  variant="outlined"
                  onChange={handleFileChange}
                  InputLabelProps={{ shrink: true }}
                  label="Select Image"
                  inputProps={{ accept: "image/*" }}
                />
              </Grid>
              {originalImageSrc && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mt: 1, mb: 1, textAlign: 'center', border: '1px solid #444', p:1, borderRadius: '4px' }}>
                    <Typography variant="caption" display="block" sx={{color: '#c5c5c5'}}>Preview:</Typography>
                    <img src={originalImageSrc} alt="Selected preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={convertImageToHex}
                  disabled={!selectedFile || isConvertingToHex}
                  fullWidth
                  sx={{ mt: 1, bgcolor: '#f9a825', '&:hover': { bgcolor: '#f57f17' } }}
                >
                  {isConvertingToHex ? <CircularProgress size={24} color="inherit" /> : 'Convert to Hex'}
                </Button>
              </Grid>
            </Grid>
            {imageToHexError && (
              <Alert severity="error" sx={{ mt: 2 }}>{imageToHexError}</Alert>
            )}
            {hexOutput && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 1 }}>Hex Output:</Typography>
                <FullWidthTextField
                  multiline
                  rows={4}
                  value={hexOutput}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="outlined"
                  onClick={() => navigator.clipboard.writeText(hexOutput)}
                  sx={{ mt: 1, color: '#90caf9', borderColor: '#90caf9' }}
                >
                  Copy Hex
                </Button>
              </Box>
            )}
          </StyledPaper>
        </Grid>

        {/* Hex to Image Converter */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ color: '#fafafa', mb: 2 }}>
              Hex to Image Converter
            </Typography>
            <FullWidthTextField
              label="Enter Hex String"
              variant="outlined"
              multiline
              rows={4}
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="Paste hex data here..."
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={convertHexToImage}
              disabled={!hexInput.trim() || isConvertingToImage}
              fullWidth
              sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
            >
              {isConvertingToImage ? <CircularProgress size={24} color="inherit" /> : 'Convert to Image'}
            </Button>
            {hexToImageError && (
              <Alert severity="error" sx={{ mt: 2 }}>{hexToImageError}</Alert>
            )}
            {imageSrcOutput && (
              <Box sx={{ mt: 3, textAlign: 'center', border: '1px solid #444', p: 2, borderRadius: '4px' }}>
                <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 1 }}>Output Image:</Typography>
                <img src={imageSrcOutput} alt="Converted from hex" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', margin: '0 auto' }} />
              </Box>
            )}
          </StyledPaper>
        </Grid>

        {/* Get Identity Avatar */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ color: '#fafafa', mb: 2 }}>
              Get Identity Avatar
            </Typography>
            <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12}>
                    <FullWidthTextField
                    label="Identity Name or i-address (e.g., user@ or i-xxxx)"
                    variant="outlined"
                    value={identityInput}
                    onChange={(e) => setIdentityInput(e.target.value)}
                    placeholder="testid@"
                    sx={{ mb: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGetIdentityAndDisplayAvatar}
                    disabled={isFetchingAvatar || !identityInput.trim() || !sendCommand}
                    fullWidth
                    sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
                    >
                    {isFetchingAvatar ? <CircularProgress size={24} color="inherit" /> : 'Fetch and Display Avatar'}
                    </Button>
                </Grid>
            </Grid>
            {getAvatarError && (
              <Alert severity="error" sx={{ mt: 2 }}>{getAvatarError}</Alert>
            )}
            {avatarData.imageSrc && (
              <Box sx={{ mt: 3, textAlign: 'center', border: '1px solid #444', p: 2, borderRadius: '4px' }}>
                <Typography variant="subtitle1" sx={{ color: '#e0e0e0' }}>Avatar for: {avatarData.label}</Typography>
                <img src={avatarData.imageSrc} alt={`${identityInput} avatar`} style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', margin: 'auto', mt: 1 }} />
              </Box>
            )}
            {avatarData.rawJson && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: '#c5c5c5' }}>Raw getidentity JSON:</Typography>
                <FullWidthTextField
                  multiline
                  rows={8}
                  value={avatarData.rawJson}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}
          </StyledPaper>
        </Grid>
        
        {/* New Section: Segmented UpdateIdentity JSON Generator */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ color: '#fafafa', mb: 2 }}>
              Generate Segmented `updateidentity` JSON (5 Segments)
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={segmentedFilePreview ? 6 : 12}>
                <FullWidthTextField
                  type="file"
                  variant="outlined"
                  onChange={handleSegmentedFileChange}
                  InputLabelProps={{ shrink: true }}
                  label="Select File"
                />
              </Grid>
              {segmentedFilePreview && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mt: 1, mb: 1, textAlign: 'center', border: '1px solid #444', p:1, borderRadius: '4px' }}>
                    <Typography variant="caption" display="block" sx={{color: '#c5c5c5'}}>Preview:</Typography>
                    <img src={segmentedFilePreview} alt="Selected preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateSegmentedUpdateIdentityJson}
                  disabled={!segmentedFile || isGeneratingSegmentedJson}
                  fullWidth
                  sx={{ mt: 1, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                >
                  {isGeneratingSegmentedJson ? <CircularProgress size={24} color="inherit" /> : 'Generate 5-Segment JSON'}
                </Button>
              </Grid>
            </Grid>

            {segmentedJsonError && (
              <Alert severity="error" sx={{ mt: 2 }}>{segmentedJsonError}</Alert>
            )}

            {segmentedJsonOutput && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ color: '#e0e0e0', mb: 1 }}>Generated JSON:</Typography>
                <FullWidthTextField
                  multiline
                  rows={15}
                  value={segmentedJsonOutput}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => navigator.clipboard.writeText(segmentedJsonOutput)}
                  sx={{ mt: 1, color: '#90caf9', borderColor: '#90caf9' }}
                >
                  Copy JSON to Clipboard
                </Button>
              </Box>
            )}
          </StyledPaper>
        </Grid>
        {/* End New Section */}
      </Grid>
    </Box>
  );
};

export default VerusPlaygroundView; 