# Better Productivity

A comprehensive desktop productivity suite built with Electron, designed to help you organize tasks, manage time efficiently, and integrate with digital content - all in one application.

## Overview

Better Productivity is an all-in-one productivity tool that combines task management, Pomodoro timer, YouTube content management, notes, and goal tracking in a single, cohesive interface. The application runs locally on your computer, with no server dependencies, ensuring your productivity data remains private and accessible even offline.

## Key Features

### Task Management System
- **Quick Add Task Form**: Add tasks quickly with a streamlined form at the top of your task list.
- **Priority Levels**: Assign High, Medium, or Low priority to each task for better organization.
- **Categories**: Categorize tasks to keep your work organized by project or area of responsibility.
- **Due Dates**: Set due dates for tasks to maintain deadlines.
- **Task Notes**: Add detailed descriptions to any task for additional context.
- **Task Editing**: Fully edit any task's details after creation, including description, category, priority, and due date.
- **Task Completion**: Mark tasks as complete with a single click and track your progress.
- **Task Filtering**: Filter your tasks by priority, category, or completion status.
- **Task Counts**: See at-a-glance stats on total tasks, today's tasks, upcoming tasks, and completed tasks.

### Pomodoro Timer
- **Customizable Timer**: Default work sessions (25 minutes), short breaks (5 minutes), and long breaks (15 minutes).
- **Session Phases**: Automatically cycle between work phases and breaks.
- **Timer Controls**: Start, pause, skip to next phase, and reset the timer with dedicated buttons.
- **Visual Feedback**: Circular progress indicator shows remaining time visually.
- **Session Tracking**: Count completed Pomodoro sessions and total minutes of focused work.
- **Sound Notifications**: Audio alerts when timer completes.
- **Keyboard Shortcuts**: Control the timer with keyboard shortcuts for efficiency.

### YouTube Manager
- **Video Linking**: Save and organize YouTube videos for later viewing.
- **Video Metadata**: Automatically fetches and displays video titles and other information.
- **Categorization**: Organize saved videos into custom categories.
- **Offline Access**: Access your saved video list even when offline.
- **Integration with yt-dlp**: Enhanced YouTube video metadata retrieval.

### Notes System
- **Create Notes**: Quickly jot down ideas, information, or reminders.
- **Rich Text**: Format your notes with basic styling options.
- **Note Organization**: Categorize and organize notes for easy reference.
- **Search**: Find notes quickly by searching for content.

### Goals Tracking
- **Goal Setting**: Define short-term and long-term goals.
- **Progress Tracking**: Monitor your advancement toward goal completion.
- **Due Dates**: Set target dates for your goals.
- **Priority Setting**: Assign priorities to your goals to focus on what matters most.

### General Features
- **Dark/Light Mode**: Switch between visual themes based on your preference.
- **Local Storage**: All data is stored locally on your machine for privacy and offline access.
- **Modern UI**: Clean, intuitive interface designed for productivity.
- **Keyboard Navigation**: Navigate and control the app efficiently with keyboard shortcuts.

## Installation

### Prerequisites
- Node.js (includes npm) installed on your system
- Basic knowledge of command-line operations

### Setup Instructions

1. Clone the repository:
```
git clone https://github.com/conorgg123/better-productivity.git
```

2. Navigate to the project directory:
```
cd better-productivity
```

3. Install dependencies:
```
npm install
```

4. For YouTube functionality, ensure yt-dlp is installed on your system path.

5. Run the application:
```
npx electron .
```

## Usage

### Tasks Management
- Click the "Add Task" button to create a new task.
- Fill in the task details including description, priority, category, and optional due date.
- Edit tasks by clicking the edit button on any task card.
- Mark tasks as complete by checking the checkbox.
- Delete tasks with the delete button when they're no longer needed.

### Pomodoro Timer
- Select your preferred phase (work, short break, long break).
- Click "Start" to begin the timer.
- Use "Pause" to temporarily stop the timer.
- "Skip" advances to the next phase.
- "Reset" returns the timer to its initial state for the current phase.
- After completing work sessions, the timer automatically suggests appropriate breaks.

### YouTube Manager
- Paste YouTube URLs into the link input field.
- The system automatically retrieves video metadata.
- Organize videos by assigning them to categories.
- Click on saved videos to view details or open them.

### Notes
- Click "New Note" to create a new note.
- Add a title and content to your note.
- Save notes for future reference.
- Edit or delete notes as needed.

### Goals
- Add new goals with descriptions and target dates.
- Track progress by updating completion percentage.
- Sort goals by priority or due date.

## Technical Details

Built using:
- Electron framework for cross-platform desktop application development
- HTML, CSS, and JavaScript for the user interface
- Local storage for data persistence
- yt-dlp integration for YouTube functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Happy Productivity! 