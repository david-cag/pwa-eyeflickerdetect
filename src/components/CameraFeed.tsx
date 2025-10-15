import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
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

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={320}
        height={240}
        style={{ borderRadius: 8, background: '#000' }}
      />
    </Box>
  );
};

export default CameraFeed;
