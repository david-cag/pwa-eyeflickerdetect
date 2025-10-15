import React, { useRef, useEffect, useState } from 'react';
import { Typography, Box, LinearProgress, Button } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useBlinkDetection } from '../hooks/useBlinkDetection';
import AlertDialog from './AlertDialog';
import BlinkThresholdSlider from './BlinkThresholdSlider';
import BlinkHistoryChart from './BlinkHistoryChart';

const BlinkDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false); // Start with detection active
  const [lowBlinkThreshold, setLowBlinkThreshold] = useState(10);
  const { blinkCount, blinkRate, blinkHistory, faceMeshResults, currentEAR, lowBlinkAlert, setLowBlinkAlert, faceDetected, faceBoundingBox } = useBlinkDetection(videoRef, isPaused, lowBlinkThreshold);
  const [autoZoom, setAutoZoom] = useState(true);

  useEffect(() => {
    async function setupCamera() {
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
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
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
        // Draw all face landmarks
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

  // Get canvas transform - same as video but without the negative scaleX for proper overlay
  const getCanvasTransform = () => {
    let transform = 'scaleX(-1)'; // Mirror effect to match video
    
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
      
      // Same transform as video for perfect overlay
      transform = `scaleX(-${zoom}) scaleY(${zoom}) translate(${translateX}%, ${translateY}%)`;
    }
    
    return transform;
  };

  return (
    <Box 
      sx={{ 
        mt: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        height: { md: 'calc(100vh - 100px)' },
        overflow: 'hidden'
      }}
    >
      {/* Left Column: Video and Controls */}
      <Box 
        sx={{ 
          flex: { xs: '1', md: '0 0 400px' },
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
            EAR: {currentEAR.toFixed(3)} {isPaused ? '⏸️' : faceDetected ? (currentEAR < 0.2 ? '👁️ CLOSED' : '👀 OPEN') : '⏸️'}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={isPaused ? 0 : faceDetected ? Math.min(currentEAR * 200, 100) : 0} 
            sx={{ height: 6, borderRadius: 4 }}
            color={isPaused ? 'inherit' : faceDetected ? (currentEAR < 0.2 ? 'error' : 'success') : 'inherit'}
          />
        </Box>
        
        <BlinkThresholdSlider
          value={lowBlinkThreshold}
          onChange={setLowBlinkThreshold}
        />
      </Box>
      
      {/* Right Column: Stats and Chart */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflow: 'auto',
          minHeight: { xs: 'auto', md: 0 }
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
