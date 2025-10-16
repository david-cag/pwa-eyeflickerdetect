# EAR (Eye Aspect Ratio) Threshold Configuration

## Overview

The EAR (Eye Aspect Ratio) threshold is a critical parameter that determines when the algorithm considers an eye to be "closed" for blink detection. This configurable setting helps improve blink detection accuracy across different face angles and individual eye characteristics.

## What is EAR?

Eye Aspect Ratio (EAR) is calculated using the geometry of eye landmarks:

```
EAR = (v1 + v2) / (2.0 * h)
```

Where:
- `v1`, `v2` = Vertical distances between upper and lower eyelid landmarks
- `h` = Horizontal distance between eye corners

### EAR Values:
- **Open eye**: EAR ≈ 0.25-0.35
- **Partially closed**: EAR ≈ 0.15-0.25
- **Closed eye**: EAR < 0.15

## Configuration Range

The EAR threshold slider allows values from **0.15 to 0.30**:

### Low Sensitivity (0.15 - 0.18)
**Use when:**
- Face is angled to the camera
- Eyes appear smaller due to camera angle
- Getting too many missed blinks (false negatives)
- User has naturally narrow eyes

**Effects:**
- ✅ Detects blinks with partial eye closure
- ✅ Works better with angled faces
- ⚠️ May detect false positives (squinting, looking down)

### Medium Sensitivity (0.19 - 0.21) - **Default: 0.20**
**Use when:**
- Face is directly facing the camera
- Standard use case
- Balanced accuracy needed

**Effects:**
- ✅ Balanced detection accuracy
- ✅ Good for most situations
- ✅ Reduces false positives

### High Sensitivity (0.22 - 0.30)
**Use when:**
- Getting false positives (non-blinks detected as blinks)
- User has very wide eyes
- Need stricter blink detection
- Face is very close to camera

**Effects:**
- ✅ Requires full eye closure
- ✅ Minimal false positives
- ⚠️ May miss quick or partial blinks

## Common Issues & Solutions

### Problem: Too many missed blinks (False Negatives)
**Symptoms:**
- Blinking but counter doesn't increase
- Especially when face is angled

**Solution:**
- **Lower the EAR threshold** to 0.16-0.18
- Try adjusting camera angle
- Enable auto-zoom feature

### Problem: Too many false blinks (False Positives)
**Symptoms:**
- Blinks detected when not blinking
- Counter increases while squinting or looking down

**Solution:**
- **Raise the EAR threshold** to 0.22-0.25
- Ensure good lighting
- Face the camera directly

### Problem: Inconsistent detection
**Symptoms:**
- Sometimes works, sometimes doesn't

**Solution:**
- Check camera position (eye level recommended)
- Improve lighting (avoid backlighting)
- Adjust EAR threshold based on current conditions
- Enable auto-zoom for better face tracking

## Technical Details

### Implementation

The EAR threshold is passed to the `useBlinkDetection` hook:

```typescript
const { blinkCount, ... } = useBlinkDetection(
  videoRef,
  isPaused,
  lowBlinkThreshold,
  earThreshold  // Configurable from 0.15 to 0.30
);
```

### Blink Detection Logic

```typescript
if (avgEAR < earThreshold) {
  framesBelowThreshold++;
  if (framesBelowThreshold >= CONSECUTIVE_FRAMES) {
    // Blink detected!
  }
}
```

- Requires 2 consecutive frames below threshold to confirm blink
- Prevents single-frame noise from triggering false detections

### Real-time Feedback

The EAR progress bar provides visual feedback:
- **Green**: Eyes open (EAR > threshold)
- **Red**: Eyes closed (EAR < threshold)
- Bar fills as EAR approaches threshold

## Best Practices

1. **Start with default (0.20)**
   - Adjust only if experiencing issues

2. **Test your setup**
   - Blink 10 times and verify count
   - Adjust threshold if count is off

3. **Consider lighting**
   - Good lighting improves accuracy
   - Front lighting is best

4. **Camera position**
   - Eye level works best
   - Avoid extreme angles

5. **Individual calibration**
   - Each person may need different settings
   - Save preferred settings (future feature)

## UI Controls

### EAR Threshold Slider
- **Location**: Left sidebar, below "Low Blink Alert Threshold"
- **Title**: "Eye Closure Sensitivity (EAR Threshold)"
- **Range**: 0.15 - 0.35
- **Step**: 0.01
- **Marks**: 0.15, 0.20, 0.25, 0.30, 0.35
- **Default**: 0.20

### Helper Text
Provides context-sensitive guidance:
- **Lower values**: More sensitive, good for angled faces
- **Higher values**: Less sensitive, reduces false positives
- **Default**: Balanced for most situations
