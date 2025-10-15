# Eye Flicker Detect 👁️

A Progressive Web App for real-time eye blink frequency monitoring to help prevent eye strain and dryness during extended screen time.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Vite](https://img.shields.io/badge/Vite-4.5.14-purple)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.4.x-green)

## 🎯 Features

### Core Functionality
- **Real-time Blink Detection**: Uses MediaPipe Face Mesh and Eye Aspect Ratio (EAR) algorithm for accurate blink tracking
- **Blink Frequency Monitoring**: Tracks blinks per minute with session statistics
- **10-Minute History Chart**: Visual representation of blink rate trends using Chart.js
- **Smart Alerts**: Configurable low blink rate warnings (5-20 blinks/min threshold)
- **Auto-Zoom Face Tracking**: Automatically zooms and centers on your face (up to 2.5x)

### User Controls
- **Pause/Resume**: Manual control over detection
- **Zoom Toggle**: Turn auto-zoom ON/OFF
- **Threshold Slider**: Customize alert sensitivity
- **Visual Feedback**: Canvas overlay with face mesh (green) and eye landmarks (red)

### Notifications
- 🔊 Sound alerts using Web Audio API
- 🔔 System notifications when blink rate is too low
- ⏸️ Smart alert logic to avoid false positives

### Design
- **Responsive Layout**: Side-by-side view on desktop, stacked on mobile
- **Single View**: Everything fits without scrolling on desktop
- **iPhone Optimized**: Tested on iPhone 14 Pro with proper viewport settings
- **Smooth Animations**: 0.3s transitions for zoom and UI changes

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.5 or higher
- Modern web browser with camera access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/david-cag/pwa-eyeflickerdetect.git
cd pwa-eyeflickerdetect
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 4.5.14** - Build tool and dev server
- **Material-UI v5** - Component library
- **Chart.js + react-chartjs-2** - Data visualization

### Computer Vision
- **MediaPipe Face Mesh 0.4.x** - 478-landmark face detection
- **WebRTC** - Camera access via getUserMedia API

### PWA
- **vite-plugin-pwa 0.16.7** - Service worker and manifest generation
- **Workbox** - Offline support and caching

### Utilities
- **Web Audio API** - Notification sounds
- **Notifications API** - System alerts

## 📊 How It Works

### Eye Aspect Ratio (EAR) Algorithm

The app uses the Eye Aspect Ratio formula to detect blinks:

```
EAR = (||p2 - p6|| + ||p3 - p5||) / (2.0 * ||p1 - p4||)
```

Where p1-p6 are eye landmark points from MediaPipe Face Mesh.

**Detection Logic:**
1. Calculate EAR for both eyes
2. Average the values
3. If EAR < 0.2 for 2 consecutive frames → Blink detected
4. Track timestamps and calculate blinks/minute

### Auto-Zoom Feature

- Calculates face bounding box from all 478 landmarks
- Adds 20% padding on all sides
- Zooms to fit face in frame (max 2.5x)
- Centers face using CSS transforms
- Smooth transitions with 300ms ease-out

### History Chart

- **Time Window**: Last 10 minutes (600 seconds)
- **Intervals**: 30-second buckets (20 data points)
- **Metric**: Blinks per minute (30s count × 2)
- **Labels**: Format: "Now", "-30s", "-1m", "-2m30s", etc.

## 🎨 UI Components

### Main Components
- `BlinkDetector.tsx` - Main component with video, canvas, and controls
- `BlinkHistoryChart.tsx` - 10-minute blink rate visualization
- `BlinkThresholdSlider.tsx` - Alert threshold configuration
- `AlertDialog.tsx` - Sound and system notifications

### Custom Hooks
- `useBlinkDetection.ts` - Core detection logic, state management, and face tracking

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 14+)
- ✅ Mobile browsers with camera access

## 🔒 Privacy

- **No data collection**: All processing happens locally in your browser
- **No server communication**: Face detection runs entirely client-side
- **Camera access**: Only used for real-time detection, no recording or storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [MediaPipe](https://google.github.io/mediapipe/) by Google for face mesh technology
- [Eye Aspect Ratio paper](http://vision.fe.uni-lj.si/cvww2016/proceedings/papers/05.pdf) by Soukupová and Čech
- React and Vite communities for excellent tooling

## 📞 Contact

- GitHub: [@david-cag](https://github.com/david-cag)
- Repository: [pwa-eyeflickerdetect](https://github.com/david-cag/pwa-eyeflickerdetect)

---

**Remember to blink regularly!** 👁️ Normal blink rate is 15-20 times per minute.
