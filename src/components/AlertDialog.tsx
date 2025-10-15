import React, { useEffect, useRef } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  severity: 'warning' | 'error' | 'info';
  message: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onClose, severity, message }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open) {
      // Play soft notification sound
      if (!audioRef.current) {
        // Create a soft, non-intrusive beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = severity === 'error' ? 400 : 600; // Lower pitch for error
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Soft volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      // Request notification permission and show system notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Eye Flicker Detect', {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'blink-alert',
          requireInteraction: false,
          silent: true // We already have sound
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Eye Flicker Detect', {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'blink-alert',
              requireInteraction: false,
              silent: true
            });
          }
        });
      }
    }
  }, [open, severity, message]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertDialog;
