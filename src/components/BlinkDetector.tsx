import React, { useRef, useEffect, useState } from 'react';
import { Typography, Box, LinearProgress, Button } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useBlinkDetection } from '../hooks/useBlinkDetection';
import AlertDialog from './AlertDialog';
import BlinkThresholdSlider from './BlinkThresholdSlider';
import EARThresholdSlider from './EARThresholdSlider';
import BlinkHistoryChart from './BlinkHistoryChart';

type CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

// LocalStorage utility functions
const STORAGE_KEYS = {
  LOW_BLINK_THRESHOLD: 'pwa-eyeflicker-lowBlinkThreshold',
  EAR_THRESHOLD: 'pwa-eyeflicker-earThreshold',
  AUTO_ZOOM: 'pwa-eyeflicker-autoZoom'
};

const getStoredValue = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStoredValue = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

const BlinkDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(true); // Start paused until camera is ready
  
  // Initialize with localStorage values or defaults
  const [lowBlinkThreshold, setLowBlinkThreshold] = useState(() => 
    getStoredValue(STORAGE_KEYS.LOW_BLINK_THRESHOLD, 10)
  );
  const [earThreshold, setEarThreshold] = useState(() => 
    getStoredValue(STORAGE_KEYS.EAR_THRESHOLD, 0.25)
  );
  const [autoZoom, setAutoZoom] = useState(() => 
    getStoredValue(STORAGE_KEYS.AUTO_ZOOM, true)
  );
  
  const { blinkCount, blinkRate, blinkHistory, faceMeshResults, currentEAR, lowBlinkAlert, setLowBlinkAlert, faceDetected, faceBoundingBox } = useBlinkDetection(videoRef, isPaused, lowBlinkThreshold, earThreshold);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string>('');

  // Save to localStorage when values change
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.LOW_BLINK_THRESHOLD, lowBlinkThreshold);
  }, [lowBlinkThreshold]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.EAR_THRESHOLD, earThreshold);
  }, [earThreshold]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.AUTO_ZOOM, autoZoom);
  }, [autoZoom]);

  const setupCamera = async () => {
    setCameraStatus('requesting');
    setCameraError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStatus('granted');
        
        // Auto-start detection when video begins playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              // Start detection automatically once video is playing
              setTimeout(() => {
                setIsPaused(false);
                console.log('Auto-starting blink detection...');
              }, 1000); // Give MediaPipe time to initialize
            });
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraStatus('denied');
          setCameraError('Camera access denied. Please grant permission to use this app.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraStatus('error');
          setCameraError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraStatus('error');
          setCameraError('Camera is already in use by another application.');
        } else {
          setCameraStatus('error');
          setCameraError(`Camera error: ${err.message}`);
        }
      } else {
        setCameraStatus('error');
        setCameraError('Unknown camera error occurred.');
      }
    }
  };

  useEffect(() => {
    setupCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Draw face mesh and eye landmarks on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !faceMeshResults) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face mesh landmarks
    if (faceMeshResults.multiFaceLandmarks) {
      for (const landmarks of faceMeshResults.multiFaceLandmarks) {
        // Draw all face landmarks - no mirroring in context since CSS handles it
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 1, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Highlight eye landmarks
        const leftEyeIndices = [33, 133, 160, 159, 158, 157, 173, 246];
        const rightEyeIndices = [362, 263, 387, 386, 385, 384, 398, 466];
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2;

        // Draw left eye
        for (const idx of leftEyeIndices) {
          const landmark = landmarks[idx];
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw right eye
        for (const idx of rightEyeIndices) {
          const landmark = landmarks[idx];
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }, [faceMeshResults]);

  // Calculate video transform for auto-zoom
  const getVideoTransform = () => {
    let transform = 'scaleX(-1)'; // Mirror effect
    
    if (autoZoom && faceBoundingBox && faceDetected) {
      const { x, y, width, height } = faceBoundingBox;
      
      // Calculate zoom to fill the frame with the face
      const zoomX = 1 / width;
      const zoomY = 1 / height;
      const zoom = Math.min(zoomX, zoomY, 2.5); // Cap at 2.5x zoom
      
      // Calculate translation to center the face
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const translateX = (0.5 - centerX) * 100;
      const translateY = (0.5 - centerY) * 100;
      
      transform = `scaleX(-${zoom}) scaleY(${zoom}) translate(${translateX}%, ${translateY}%)`;
    }
    
    return transform;
  };

  // Get canvas transform - should match video transform exactly for perfect overlay
  const getCanvasTransform = () => {
    // Use exactly the same transform as video for perfect alignment
    return getVideoTransform();
  };

  return (
    <Box 
      sx={{ 
        mt: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        height: { md: 'calc(100vh - 140px)' },
        overflow: 'hidden'
      }}
    >
      {/* Left Column: Video and Controls */}
      <Box 
        sx={{ 
          flex: { xs: '1', md: '1' },
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box 
          display="flex" 
          justifyContent="center" 
          position="relative"
          sx={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: '#000'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: { xs: '75%', md: '100%' }, // Square on desktop for compact view
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: getVideoTransform(),
                transition: 'transform 0.3s ease-out'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: getCanvasTransform(),
                transition: 'transform 0.3s ease-out',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
          </Box>
        </Box>
        
        {/* Camera Permission Status */}
        {cameraStatus !== 'granted' && (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: cameraStatus === 'denied' ? 'error.light' : 
                       cameraStatus === 'error' ? 'warning.light' : 
                       'info.light',
              borderRadius: 1,
              color: cameraStatus === 'denied' || cameraStatus === 'error' ? 'error.contrastText' : 'info.contrastText'
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {cameraStatus === 'requesting' && '📷 Requesting camera access...'}
              {cameraStatus === 'denied' && '🚫 Camera Access Denied'}
              {cameraStatus === 'error' && '⚠️ Camera Error'}
              {cameraStatus === 'idle' && 'Camera not initialized'}
            </Typography>
            {cameraError && (
              <>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {cameraError}
                </Typography>
                {cameraStatus === 'denied' && (
                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    To enable camera access:
                    <br />• Click the camera icon in your browser's address bar
                    <br />• Or go to browser Settings → Privacy → Camera
                    <br />• Then click "Try Again" below
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={setupCamera}
                  sx={{ mt: 1 }}
                >
                  Try Again
                </Button>
              </>
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={isPaused ? <PlayArrow /> : <Pause />}
            onClick={() => setIsPaused(!isPaused)}
            sx={{ 
              flex: { xs: '1 1 auto', sm: '0 1 auto' },
              minWidth: 120,
              fontSize: { xs: '0.875rem', sm: '0.875rem' }
            }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => setAutoZoom(!autoZoom)}
            sx={{ 
              flex: { xs: '1 1 auto', sm: '0 1 auto' },
              minWidth: 120,
              fontSize: { xs: '0.875rem', sm: '0.875rem' }
            }}
          >
            {autoZoom ? '🔍 Zoom: ON' : '🔍 Zoom: OFF'}
          </Button>
        </Box>
        
        <Box sx={{ px: 1 }}>
          <Typography 
            variant="caption" 
            display="block"
            color={faceDetected ? 'success.main' : 'error.main'}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
          >
            {isPaused 
              ? '⏸️ PAUSED' 
              : faceDetected 
                ? '✅ Face Detected' 
                : '❌ No Face'}
          </Typography>
          <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}>
            EAR: {currentEAR.toFixed(3)} {isPaused ? '⏸️' : faceDetected ? (currentEAR < earThreshold ? '👁️ CLOSED' : '👀 OPEN') : '⏸️'}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={isPaused ? 0 : faceDetected ? Math.min((currentEAR / earThreshold) * 100, 100) : 0} 
            sx={{ height: 6, borderRadius: 4 }}
            color={isPaused ? 'inherit' : faceDetected ? (currentEAR < earThreshold ? 'error' : 'success') : 'inherit'}
          />
        </Box>
      </Box>
      
      {/* Right Column: Stats and Chart */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflow: 'auto',
          minHeight: { xs: 'auto', md: 0 },
          minWidth: 0 // Prevent flex item from overflowing
        }}
      >
        <Box sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, mb: 1 }}>
            Blink Statistics
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Session: {blinkCount} blinks
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Current: {blinkRate} blinks/min
          </Typography>
        </Box>
        
        <BlinkHistoryChart blinkTimestamps={blinkHistory} />
        
        <BlinkThresholdSlider
          value={lowBlinkThreshold}
          onChange={setLowBlinkThreshold}
        />
        
        <EARThresholdSlider
          value={earThreshold}
          onChange={setEarThreshold}
        />
      </Box>
      
      <AlertDialog
        open={lowBlinkAlert}
        onClose={() => setLowBlinkAlert(false)}
        severity="warning"
        message={`Low blink rate detected (${blinkRate} blinks/min). Take a break and blink more frequently to avoid eye strain!`}
      />
    </Box>
  );
};

export default BlinkDetector;
