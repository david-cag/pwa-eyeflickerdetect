import { useEffect, useRef, useState } from 'react';
import * as faceMesh from '@mediapipe/face_mesh';

// Eye landmark indices for MediaPipe FaceMesh
const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

// Calculate Euclidean distance between two points
function distance(p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Calculate Eye Aspect Ratio (EAR)
function calculateEAR(eyeLandmarks: any[]): number {
  // Vertical distances
  const v1 = distance(eyeLandmarks[1], eyeLandmarks[5]);
  const v2 = distance(eyeLandmarks[2], eyeLandmarks[4]);
  
  // Horizontal distance
  const h = distance(eyeLandmarks[0], eyeLandmarks[3]);
  
  // EAR formula
  const ear = (v1 + v2) / (2.0 * h);
  return ear;
}

export function useBlinkDetection(
  videoRef: React.RefObject<HTMLVideoElement>, 
  isPaused: boolean, 
  lowBlinkThreshold: number,
  earThreshold: number = 0.2
) {
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinkHistory, setBlinkHistory] = useState<number[]>([]);
  const [blinkRate, setBlinkRate] = useState(0);
  const [faceMeshResults, setFaceMeshResults] = useState<faceMesh.Results | null>(null);
  const [currentEAR, setCurrentEAR] = useState<number>(0);
  const [lowBlinkAlert, setLowBlinkAlert] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceBoundingBox, setFaceBoundingBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const blinkTimestampsRef = useRef<number[]>([]);
  const isBlinkingRef = useRef<boolean>(false);
  const lastAlertTimeRef = useRef<number>(0);
  const CONSECUTIVE_FRAMES = 2; // Number of consecutive frames below threshold to confirm blink
  const ALERT_COOLDOWN = 60000; // 1 minute between alerts

  useEffect(() => {
    if (!videoRef.current) return;
    let faceMeshInstance: faceMesh.FaceMesh | null = null;
    let animationFrameId: number;
    let framesBelowThreshold = 0;

    async function setupFaceMesh() {
      faceMeshInstance = new faceMesh.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMeshInstance.onResults(onResults);
      await faceMeshInstance.initialize();
      detectFrame();
    }

    function onResults(results: faceMesh.Results) {
      // Store results for visualization
      setFaceMeshResults(results);
      
      // If paused, skip all processing
      if (isPaused) {
        return;
      }
      
      // Check if face is actually detected
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        setFaceDetected(false);
        setCurrentEAR(0);
        framesBelowThreshold = 0;
        isBlinkingRef.current = false;
        return;
      }

      // Face detected!
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];
      
      // Calculate face bounding box for auto-zoom
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const landmark of landmarks) {
        minX = Math.min(minX, landmark.x);
        minY = Math.min(minY, landmark.y);
        maxX = Math.max(maxX, landmark.x);
        maxY = Math.max(maxY, landmark.y);
      }
      
      // Add padding (20% on each side)
      const padding = 0.2;
      const width = maxX - minX;
      const height = maxY - minY;
      const paddedMinX = Math.max(0, minX - width * padding);
      const paddedMinY = Math.max(0, minY - height * padding);
      const paddedWidth = Math.min(1 - paddedMinX, width * (1 + 2 * padding));
      const paddedHeight = Math.min(1 - paddedMinY, height * (1 + 2 * padding));
      
      setFaceBoundingBox({
        x: paddedMinX,
        y: paddedMinY,
        width: paddedWidth,
        height: paddedHeight
      });
      
      // Extract left and right eye landmarks
      const leftEyeLandmarks = LEFT_EYE_INDICES.map(idx => landmarks[idx]);
      const rightEyeLandmarks = RIGHT_EYE_INDICES.map(idx => landmarks[idx]);
      
      // Calculate EAR for both eyes
      const leftEAR = calculateEAR(leftEyeLandmarks);
      const rightEAR = calculateEAR(rightEyeLandmarks);
      
      // Average EAR
      const avgEAR = (leftEAR + rightEAR) / 2.0;
      setCurrentEAR(avgEAR);
      
      // Blink detection logic
      if (avgEAR < earThreshold) {
        framesBelowThreshold++;
        
        // If eyes have been closed for enough consecutive frames and not already blinking
        if (framesBelowThreshold >= CONSECUTIVE_FRAMES && !isBlinkingRef.current) {
          isBlinkingRef.current = true;
          
          // Record blink
          const now = Date.now();
          blinkTimestampsRef.current.push(now);
          setBlinkCount((prev) => prev + 1);
          setBlinkHistory([...blinkTimestampsRef.current]);
          
          // Calculate blink rate (blinks per minute)
          const oneMinuteAgo = now - 60000;
          const recentBlinks = blinkTimestampsRef.current.filter((t) => t > oneMinuteAgo);
          setBlinkRate(recentBlinks.length);
          
          // Check for low blink rate and trigger alert
          // Only alert if:
          // 1. Total session blinks >= threshold (avoid initial notifications)
          // 2. Recent blinks (last minute) > 0 and < threshold (actual low rate detected)
          // 3. Cooldown period has passed
          if (blinkTimestampsRef.current.length >= lowBlinkThreshold && 
              recentBlinks.length > 0 && 
              recentBlinks.length < lowBlinkThreshold && 
              now - lastAlertTimeRef.current > ALERT_COOLDOWN) {
            setLowBlinkAlert(true);
            lastAlertTimeRef.current = now;
          }
          
          console.log('Blink detected! EAR:', avgEAR.toFixed(3), 'Rate:', recentBlinks.length, 'blinks/min');
        }
      } else {
        framesBelowThreshold = 0;
        isBlinkingRef.current = false;
      }
    }

    function detectFrame() {
      if (!videoRef.current) return;
      faceMeshInstance?.send({ image: videoRef.current });
      animationFrameId = requestAnimationFrame(detectFrame);
    }

    setupFaceMesh();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      faceMeshInstance?.close();
    };
  }, [videoRef, isPaused, lowBlinkThreshold, earThreshold]);

  return { blinkCount, blinkRate, blinkHistory, faceMeshResults, currentEAR, lowBlinkAlert, setLowBlinkAlert, faceDetected, faceBoundingBox };
}
