# 🎥 RecStudio — Premium Loom-Style Screen Recorder

A modern, highly optimized, and privacy-first web-based screen recording application. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, RecStudio enables users to record their screen, webcam, and audio in high definition directly in the browser—with zero server uploads or installations.

---

## ✨ Features

- **🌐 Multi-Source Capture**: Select between recording your **Entire Screen**, a specific **Application Window**, a single **Browser Tab**, or **Webcam Only**.
- **🎙️ Advanced Audio Controls**: Toggle microphone narration, system audio, or both simultaneously to capture complete presentations.
- **🙋 Draggable Webcam Overlay**: A Loom-style picture-in-picture floating webcam bubble. Drag and position the video feed anywhere inside the viewport during recording.
- **⏱️ Animated Countdown**: A 3-second visual countdown with glowing indicator rings to let you prepare before recording starts.
- **📊 Real-time Recording HUD**: Tracks live duration and features a dynamic microphone audio level meter (waveform visualizer).
- **📁 Local Recordings Library**: A built-in gallery to manage your history. Review, play, download (high-quality WebM format), or delete your captures.
- **🔒 Privacy-First Architecture**: Powered entirely by client-side APIs (`MediaRecorder` and `mediaDevices`). All audio/video processing and storage remain 100% local in your browser.
- **✨ Glassmorphic Dark UI**: High-end aesthetic styling leveraging Tailwind CSS, fluid gradients, and Framer Motion micro-animations.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **APIs**: HTML5 MediaDevices API, MediaStream API, and MediaRecorder API

---

## 📁 Repository Structure

```filepath
├── src/
│   ├── app/
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── layout.tsx           # Global HTML wrapper & provider configs
│   │   └── page.tsx             # Home Router (renders RecorderStudio)
│   ├── components/
│   │   └── ui/                  # Reusable low-level UI elements (e.g., Button)
│   ├── features/
│   │   ├── home/                # Landing/Marketing layouts and constants
│   │   └── recorder/
│   │       ├── components/
│   │       │   ├── recorder-studio.tsx     # Main dashboard interface
│   │       │   └── recorder-dashboard.tsx  # Dashboard layout skeleton
│   │       ├── hooks/
│   │       │   └── use-recorder.ts         # Screen recorder custom hook (state machine)
│   │       ├── utils/
│   │       │   └── format.ts               # Byte size and duration formatters
│   │       ├── constants/
│   │       └── types/
│   ├── lib/
│   │   └── utils.ts             # Tailwind class merging utility (clsx + tailwind-merge)
│   └── styles/
├── public/                      # Static assets
├── tailwind.config.ts           # Design tokens configuration
├── tsconfig.json                # TypeScript settings
└── package.json                 # Project dependencies & scripts
```

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18.0.0 or higher) and `npm` installed.

### 1. Clone the Repository
```bash
git clone https://github.com/RashedulHaqueRasel1/Screen-Recorder.git
cd screen-recorder
```

### 2. Install Dependencies
Install all required node packages:
```bash
npm install
```

### 3. Start Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to access the studio.

### 4. Build for Production
To build a production-ready optimized build:
```bash
npm run build
npm start
```

---

## ⚙️ How It Works (Under the Hood)

1. **Stream Merging**: 
   When you hit *Start Recording*, the application invokes `navigator.mediaDevices.getDisplayMedia` to capture the screen layout and optionally queries `navigator.mediaDevices.getUserMedia` for webcam video and microphone audio. It merges all video and audio tracks dynamically into a single compound `MediaStream`.
   
2. **Media Recorder State Machine**:
   The custom `useRecorder` React hook wraps the browser’s native `MediaRecorder` API. It dynamically tracks recording state transitions (`idle` ➔ `countdown` ➔ `recording` ➔ `paused` ➔ `stopped` ➔ `error`).
   
3. **Optimized Encoders**:
   The recorder automatically detects and requests the best-supported WebM video codecs available in the user's browser (e.g. `video/webm;codecs=vp9,opus` for high compression efficiency and audio clarity).
   
4. **Memory Management**:
   All captured video chunks are combined into a local `Blob`. RecStudio automatically handles local URLs using `URL.createObjectURL(blob)` and cleanly releases them using `URL.revokeObjectURL(url)` upon deletions or session resets to prevent browser memory leaks.

---

## 🔒 Security & Privacy

Your privacy is paramount. RecStudio does not transfer any video or audio recordings to external databases.
- All operations are executed client-side.
- No sign-ups or credentials required to record.
- Downloaded files are saved directly onto your device.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it as needed.
