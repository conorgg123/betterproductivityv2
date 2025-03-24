# YouTube Scheduler: A Sophisticated Local Desktop Application

## Project Overview
**YouTube Scheduler** is a standalone desktop application built with Electron, designed to manage YouTube links, reminders, and tasks within a visually appealing, time-based scheduler. Running entirely locally with no server dependencies, it ensures privacy and offline functionality after initial setup. The app features a modern, React-inspired UI and is packaged as a `.exe` for Windows, offering a seamless and sophisticated user experience.

---

## Features

### 1. YouTube Link Manager
- **Link Input**: A sleek, animated HTML input field with placeholder text ("Paste YouTube Link") for users to add YouTube URLs.
- **Validation**: Local JavaScript regex ensures only valid YouTube URLs (e.g., `youtube.com` or `youtu.be`) are accepted.
- **Metadata Display**: Fetches and displays video title and duration using `youtube-dl-exec`, with optional thumbnails cached locally for offline use.
- **Link List**: A scrollable, card-based list of saved YouTube links, each showing the title, duration, and timestamp of addition.
- **Drag Support**: Links can be dragged from the list to the scheduler for time-based organization.

### 2. Reminders
- **Reminder Creation**: A form with a text input for the reminder description and an HTML `<input type="datetime-local">` picker for scheduling.
- **Local Notifications**: Electron’s `Notification` API triggers pop-up alerts on the user’s desktop when reminders are due, fully functional offline.
- **Reminder List**: A dynamic, scrollable list of upcoming reminders displayed as cards, including the description and scheduled time.
- **Edit/Delete Options**: Buttons on each reminder card allow users to modify or remove entries (future enhancement potential).
- **Drag Support**: Reminders can be dragged to the scheduler to assign them to specific time slots.

### 3. To-Do List
- **Task Entry**: A form with a text input for task descriptions and a dropdown menu to set priority levels (High, Medium, Low).
- **Block-Style Display**: Tasks appear as draggable, color-coded blocks (e.g., red for High, yellow for Medium, green for Low) with smooth CSS transitions.
- **Completion Tracking**: Each task includes a checkbox; checking it applies a strike-through animation and marks the task as done in local storage.
- **Task List**: A scrollable section of task cards, sortable by priority or completion status (future enhancement potential).
- **Drag Support**: Tasks can be dragged to the scheduler for time-based planning.

### 4. Time-Based Scheduler
- **Block Timeline**: A CSS Grid-based hourly timeline where YouTube links, reminders, and tasks are represented as draggable blocks.
- **Drag-and-Drop Functionality**: Uses HTML5 Drag and Drop API with snap-to-grid behavior, allowing users to seamlessly organize items by time.
- **Overlap Detection**: JavaScript logic detects overlapping scheduled items, visually indicated by a red border or tooltip warning.
- **Visual Feedback**: Blocks resize and reposition dynamically with smooth animations, maintaining a clean and intuitive layout.
- **Time Slots**: Displays a 24-hour view (scrollable for longer periods), with each block labeled by its content (e.g., video title, task text).

### 5. User Interface Design
- **React-Inspired Aesthetic**: Component-based layout with card elements, subtle shadows, and hover effects for a modern, web-app-like feel.
- **Modern Styling**: Rounded corners, gradient accents, and a consistent font (Roboto) enhance visual appeal.
- **Theme Toggle**: A dark/light mode switch using CSS variables, saved locally for user preference persistence.
- **Layout**: A single-window interface with three resizable sections:
  - **Left Sidebar**: YouTube Link Manager.
  - **Central Panel**: To-Do List and Reminders.
  - **Bottom/Right Panel**: Time-Based Scheduler.
- **Responsiveness**: Adjusts gracefully to window resizing, ensuring usability across different screen sizes.

### 6. Data Management
- **Local Storage**: All data (YouTube links, reminders, tasks) is stored in a local JSON file via `electron-store`, ensuring portability and offline access.
- **Persistence**: Data loads automatically on app start and saves instantly on changes, maintaining state between sessions.
- **Offline Functionality**: After initial YouTube metadata fetches, the app operates fully offline, relying on cached data.

### 7. Additional Features
- **Portable Design**: The app stores data relative to the `.exe`, making it USB-drive friendly.
- **Error Handling**: Alerts for invalid YouTube URLs or scheduling conflicts enhance user experience.
- **Scalability**: Modular code structure allows easy addition of future features (e.g., analytics, exports).

---

## Technical Details

### Tech Stack
- **Electron**: Combines Node.js and Chromium for a local desktop app with web technologies.
- **Frontend**: HTML, CSS, JavaScript (plain, with potential for React integration).
- **Dependencies**:
  - `youtube-dl-exec`: Fetches YouTube metadata locally.
  - `electron-store`: Manages local JSON storage.
  - `sqlite3`: Optional for structured data (not implemented by default).
- **Styling**: Custom CSS with Grid, Flexbox, and animations.

### Setup Instructions
#### Prerequisites
- Node.js (includes npm) from [nodejs.org](https://nodejs.org).
- A text editor (e.g., VS Code).

#### Installation
1. Create and enter project folder:
mkdir youtube-scheduler
cd youtube-scheduler

2. Initialize project:
npm init -y

3. Install Electron and dependencies:
npm install electron --save-dev
npm install youtube-dl-exec electron-store

4. Install Electron Forge for packaging:
npm install --save-dev @electron-forge/cli
npx electron-forge import

#### Project Files
- `main.js`: Electron main process.
- `index.html`: UI structure.
- `styles.css`: Styling.
- `app.js`: Frontend logic.
- `data.json`: Local storage (auto-generated).
- `package.json`: Project configuration.

#### Running Locally
- Start the app: npm start

#### Packaging to `.exe`
- Create the `.exe`: npm run make
- Output in `out/` folder.

#### Optional Icon
- Add a `.ico` file and update `package.json`:
```json
"config": {
  "forge": {
    "packagerConfig": {
      "icon": "path/to/icon.ico"
    }
  }
}