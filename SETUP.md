# Daily Progress Tracker Setup Guide

This document outlines the setup process for the Daily Progress Tracker application, particularly for features that require additional dependencies like the YouTube Manager.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

## Setup Instructions

### 1. Basic Setup

Clone the repository or download the source code to your local machine.

### 2. Install Dependencies for YouTube Manager

The YouTube Manager feature requires several npm packages. Run the following commands in the project directory:

```bash
# Install Dependencies
npm install electron yt-dlp-exec electron-store chart.js --save
npm install @electron-forge/cli --save-dev
npx electron-forge import
```

#### Dependency Explanation:
- **electron**: Framework for building cross-platform desktop applications
- **yt-dlp-exec**: YouTube video metadata extraction
- **electron-store**: Persistent storage for the application
- **chart.js**: Used for analytics visualizations
- **@electron-forge/cli**: Tool for packaging and distributing Electron applications

### 3. Application Structure

The application uses a modular structure:
- HTML/CSS/JavaScript for the frontend
- Electron for the desktop application wrapper
- LocalStorage for data persistence (browser mode)
- electron-store for data persistence (desktop mode)

### 4. Running the Application

#### Browser Mode (Limited Features)
Simply open `index.html` in a modern web browser. Note that some features like YouTube Manager will not function in browser mode.

#### Desktop Mode (Full Features)
After installing dependencies, run:

```bash
npm start
```

This will launch the application with all features including YouTube Manager.

### 5. Building for Distribution

To package the application for distribution:

```bash
npm run make
```

This will create distributable packages for your platform in the `out` folder.

## Feature Compatibility

| Feature | Browser Mode | Desktop Mode |
|---------|--------------|--------------|
| Task Management | ✅ | ✅ |
| Scheduler | ✅ | ✅ |
| Pomodoro Timer | ✅ | ✅ |
| YouTube Manager | ❌ | ✅ |
| Data Export | ✅ | ✅ |
| Analytics | ✅ | ✅ |

## Troubleshooting

If you encounter issues with the YouTube Manager:

1. Ensure all dependencies are correctly installed
2. Check that you're running in desktop mode (not browser mode)
3. Verify that you have an active internet connection for YouTube metadata retrieval
4. If yt-dlp-exec fails, you may need to update it: `npm update yt-dlp-exec` 