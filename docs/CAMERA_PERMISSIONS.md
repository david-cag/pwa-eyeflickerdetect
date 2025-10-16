# Camera Permission Handling

## Overview
The Eye Flicker Detect app requires camera access to perform real-time blink detection. This document explains how camera permissions are managed and what users can expect.

## Permission States

The app tracks four distinct camera permission states:

### 1. **Idle** (`idle`)
- Initial state before requesting camera access
- Brief transitional state

### 2. **Requesting** (`requesting`)
- Active state while waiting for user permission
- Shows loading indicator: "📷 Requesting camera access..."

### 3. **Granted** (`granted`)
- Camera access successfully obtained
- No error message displayed
- Blink detection active

### 4. **Denied** (`denied`)
- User explicitly denied camera permission
- Shows red alert with:
  - Title: "🚫 Camera Access Denied"
  - Error message: "Camera access denied. Please grant permission to use this app."
  - Instructions on how to enable permissions
  - "Try Again" button

### 5. **Error** (`error`)
- Camera access failed for technical reasons
- Shows yellow/warning alert with specific error messages:
  - **No camera found**: "No camera found on this device."
  - **Camera in use**: "Camera is already in use by another application."
  - **Other errors**: Specific error message from the browser

## Error Handling

The component handles different types of camera errors:

| Error Type | Error Name | User Message |
|-----------|------------|--------------|
| Permission Denied | `NotAllowedError`, `PermissionDeniedError` | Camera access denied |
| No Camera | `NotFoundError`, `DevicesNotFoundError` | No camera found on this device |
| Camera Busy | `NotReadableError`, `TrackStartError` | Camera is already in use |
| Unknown | Any other error | Camera error: [specific message] |

## User Experience

### When Permission is Denied:
1. Red alert box appears above the video feed
2. Clear explanation of the problem
3. Step-by-step instructions:
   - Click camera icon in browser address bar
   - Or navigate to browser Settings → Privacy → Camera
4. "Try Again" button to retry permission request

### When Camera is Not Available:
1. Warning alert box (yellow/orange background)
2. Specific error message
3. "Try Again" button for retry

### Retry Functionality:
- Users can click "Try Again" to re-request camera access
- Useful after:
  - Changing browser permission settings
  - Closing other apps using the camera
  - Connecting a camera device

## Browser Compatibility

Camera permissions work consistently across modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Implementation Details

### Component State:
```typescript
const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
const [cameraError, setCameraError] = useState<string>('');
```

### Permission Request Flow:
1. Component mounts → `setupCamera()` called
2. Request permissions → `setCameraStatus('requesting')`
3. Success → `setCameraStatus('granted')`
4. Failure → `setCameraStatus('denied' | 'error')` + set error message

### Cleanup:
- Camera stream is stopped when component unmounts
- Prevents camera LED staying on after closing app

## Testing

To test camera permission handling:

1. **First time users**: App will request permission automatically
2. **Test denied state**: Block camera in browser settings, reload page
3. **Test retry**: Deny permission, then click "Try Again"
4. **Test no camera**: Use a device without camera
5. **Test camera in use**: Open camera in another tab/app first

## Future Enhancements

Possible improvements:
- [ ] Show permission prompt preview/animation
- [ ] Add camera device selector for multiple cameras
- [ ] Remember permission state across sessions
- [ ] Provide browser-specific instructions (detect browser)
- [ ] Add fallback mode without camera (demo mode)
