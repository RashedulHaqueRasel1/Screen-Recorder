# 🎥 RecStudio — Premium Loom-Style Screen Recorder

A modern, highly optimized, and privacy-first web-based screen recording application. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, RecStudio enables users to record their screen, webcam, and audio in high definition directly in the browser. Recording works without an account; sign-in (Google) is only required to **publish** a recording to Google Drive or generate a shareable link.

---

## ✨ Features

- **🌐 Multi-Source Capture**: Select between recording your **Entire Screen**, a specific **Application Window**, a single **Browser Tab**, or **Webcam Only**.
- **🎙️ Advanced Audio Controls**: Toggle microphone narration, system audio, or both simultaneously to capture complete presentations.
- **🙋 Draggable Webcam Overlay**: A Loom-style picture-in-picture floating webcam bubble. Drag and position the video feed anywhere inside the viewport during recording.
- **⏱️ Animated Countdown**: A 3-second visual countdown with glowing indicator rings to let you prepare before recording starts.
- **📊 Real-time Recording HUD**: Tracks live duration and features a dynamic microphone audio level meter (waveform visualizer).
- **📁 Local Recordings Library**: A built-in gallery to manage your history. Review, play, download (high-quality WebM format), or delete your captures.
- **🔓 No Account Required to Record**: Guests can capture, preview, edit, and download immediately. Sign-in is prompted only when publishing or sharing.
- **🚀 One-Click Publish to Google Drive**: Publish a recording to upload it to Google Drive and generate a shareable link in a single action. If the user is a guest, the Google sign-in flow runs and the publish resumes automatically afterwards.
- **🔒 Privacy-First Architecture**: Powered by client-side APIs (`MediaRecorder` and `mediaDevices`). Audio/video processing remains local; only published recordings touch Google Drive.
- **✨ Glassmorphic Dark UI**: High-end aesthetic styling leveraging Tailwind CSS, fluid gradients, and Framer Motion micro-animations.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: [Auth.js / NextAuth v5](https://authjs.dev/) with the Google provider
- **APIs**: HTML5 MediaDevices API, MediaStream API, MediaRecorder API, Google Drive REST API

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

### 3. Configure Environment Variables
RecStudio uses Auth.js (NextAuth v5) with Google OAuth for sign-in, and Google Drive for publishing. Copy the example file and fill in real values:

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Description |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID (Web application type) from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | Matching client secret. |
| `AUTH_SECRET` | Session JWT secret. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | Canonical app URL. `http://localhost:3000` in dev, `https://<your-domain>` in prod. |
| `AUTH_TRUST_HOST` | Set to `true`. Required by Auth.js v5 on non-Vercel hosts. |

> The app validates these at startup — missing variables cause a clear boot error.

### 4. Set Up Google OAuth & Drive

1. Open the [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Application type: **Web application**).
3. Add the following **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://<your-production-domain>/api/auth/callback/google` (production)
4. Enable the **Google Drive API** for the same project.
5. While the app is unverified, add your test users under **OAuth consent screen → Test users**. (RecStudio only requests the `drive.file` scope — files it creates, never full Drive access — so the app does **not** require restricted-scope verification.)

### 5. Start Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to access the studio.

### 6. Build for Production
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

- **No account required to record.** Recording, preview, edit, and download happen entirely client-side; nothing is uploaded unless you choose to publish.
- **Publish is gated behind sign-in.** Sign-in (Google) is requested only when you click Publish — and the action resumes automatically once you return, so you don't have to repeat it.
- **Scoped Drive access.** RecStudio requests only the `drive.file` scope — it can manage the files it creates, never your entire Drive.
- **Server-side token refresh.** Google access tokens expire hourly; refresh happens on the server inside the Auth.js JWT callback, so uploads keep working without forcing re-login. The refresh token never reaches the browser.
- **Recordings stay local.** Unless published, recordings never leave your device. Downloads save directly to your device.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it as needed.
