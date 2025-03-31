# Better Productivity

A comprehensive desktop productivity suite built with Electron, designed to enhance your workflow, manage tasks efficiently, and visualize your productivity metrics - all in a sleek, customizable interface.

![Better Productivity Dashboard](https://example.com/dashboard-screenshot.png)

## Overview

Better Productivity is an all-in-one productivity application that combines powerful productivity tools in a single, cohesive interface. The application features a central Dashboard with time tracking and analytics, along with dedicated modules for Task Management, Reminders, Goals, Notes, YouTube content management, Scheduling, and a Pomodoro Timer. The app operates entirely locally on your computer with optional cloud sync, ensuring your productivity data remains private and accessible even offline.

## Key Features

### Dashboard
- **Daily Summary** - View your focus metrics, category breakdown (Meetings, Breaks, etc.), and productivity comparisons
- **Total Time Worked** - Track daily work time with productive vs. unproductive time breakdowns
- **Productivity Tracking** - Calculate productivity percentage based on user-defined "productive" apps and websites
- **Timeline View** - Visual timeline of daily activities with color-coded segments for different apps and projects
- **Projects & Tasks** - Quick access to your projects with time spent on each and associated tasks
- **Apps & Websites** - Monitor time spent on various applications and websites with categorization

### Task Management
- **Comprehensive Task Organization** - Add tasks with descriptions, due dates, priorities, categories, and status
- **Recurring Tasks** - Set daily, weekly, or custom recurrence patterns for repeating tasks
- **Visual Priority System** - Color-coded task cards based on High/Medium/Low priority levels
- **Filtering & Search** - Filter tasks by status, priority, category, and due date with full-text search
- **Task Dependencies** - Link tasks together to establish workflows and prerequisites
- **Task Statistics** - View completion rates, average time to completion, and priority distribution

### Reminders
- **Time-Based Notifications** - Set reminders with precise date and time triggers
- **Category System** - Organize reminders by category (Work, Personal, Health, etc.)
- **Recurring Reminders** - Schedule repeating reminders (daily, weekly, monthly)
- **Desktop Notifications** - Receive alerts directly on your desktop
- **Snooze Function** - Postpone reminders with customizable snooze durations
- **Quick View** - Filter reminders by Today, Upcoming, Completed statuses

### Goals Tracking
- **Goal Setting Framework** - Create goals with descriptions, deadline dates, and milestone tracking
- **Progress Visualization** - Track completion rates with progress bars and percentage indicators
- **Milestone Breakdown** - Divide goals into manageable sub-goals with individual deadlines
- **Goal Types** - Categorize as Daily, Weekly, Monthly, or Long-term goals
- **Motivation System** - Receive encouraging messages as you make progress
- **Dashboard Integration** - Goals contribute to your overall productivity score

### Notes System
- **Rich Text Editor** - Create and edit notes with markdown formatting support
- **Organization System** - Tag and categorize notes for easy retrieval
- **Search Functionality** - Find notes quickly with full-text search
- **Templates** - Use pre-designed templates for common note types
- **Timeline Integration** - Link notes to specific events on your timeline

### YouTube Manager
- **Video Collection** - Save and organize YouTube videos in your personal library
- **Metadata Retrieval** - Automatically fetch video titles, thumbnails, and duration
- **Categorization** - Organize videos into customizable categories
- **Search & Filtering** - Find saved videos quickly with search and category filters
- **Video Interaction** - Open videos directly, add notes, or schedule for viewing later
- **Integration with yt-dlp** - Enhanced metadata retrieval and download capabilities

### Scheduler
- **24-Hour Timeline** - Visual time-blocking interface for planning your day
- **Drag-and-Drop** - Easily move tasks, reminders, and videos into time slots
- **Integration** - Pulls in tasks, reminders, and YouTube videos for scheduling
- **Time Block Customization** - Adjust durations and times with simple controls
- **Timeline Sync** - Scheduled items appear on the Dashboard timeline for a unified view

### Pomodoro Timer
- **Focus Sessions** - Standard 25-minute work intervals with 5-minute breaks
- **Customizable Durations** - Adjust work, short break, and long break durations
- **Session Tracking** - Count completed sessions and total focused minutes
- **Timer Controls** - Start, pause, skip, and reset functionality
- **Settings Persistence** - Save your preferred timer configurations
- **Visual Feedback** - Circular progress indicator shows remaining time
- **Sound Notifications** - Audible alerts when sessions end

### Analytics Dashboard
- **Task Completion Metrics** - Visualize task completion rates and patterns
- **Time Allocation** - Detailed breakdown of how you spend your time
- **Productivity Trends** - Track productivity scores over time (daily, weekly, monthly)
- **Pomodoro Statistics** - Analyze focus session frequency and duration patterns
- **Data Export** - Generate reports as CSV or PDF for external analysis
- **Date Range Selection** - View analytics for different time periods

### Settings & Customization
- **Dark/Light Mode** - Toggle between visual themes based on preference (default: Dark)
- **Accent Colors** - Customize the application's color scheme
- **Font Size Adjustment** - Scale text for better readability
- **Notification Settings** - Configure desktop alerts and sounds
- **Data Management** - Import/export your data and clear history when needed
- **Layout Options** - Toggle sidebar visibility and enable compact mode

## Technical Features

- **Local-First Architecture** - All data stored locally for privacy and offline access
- **Optional Cloud Sync** - Encrypted synchronization via Dropbox for cross-device access
- **Electron Framework** - Cross-platform desktop application runs on Windows, macOS, and Linux
- **SQLite Database** - Structured data storage with efficient querying capabilities
- **Modern UI** - Card-based interface with responsive design and smooth animations
- **Keyboard Navigation** - Extensive shortcut support for power users
- **Time Tracking** - Background process monitors application usage automatically
- **Achievements System** - Gamification elements reward productive behaviors

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

4. Run the application:
   ```
   npx electron .
   ```

## Usage Guide

### Getting Started
1. Upon first launch, the application opens in Dark mode by default (can be changed in Settings)
2. The Dashboard provides an overview of your productivity metrics
3. Use the sidebar to navigate between different modules
4. Start by adding some tasks, setting up reminders, or creating goals

### Dashboard
- View your daily productivity metrics and time tracking
- Click on projects or apps to drill down into detailed usage data
- Use the Date selector (Day/Week/Month) to change the time range

### Tasks
- Click "Add Task" to create new tasks with details, due dates, and priorities
- Use filters to view specific subsets of tasks
- Check off completed tasks to update your progress metrics

### Reminders
- Set up time-based reminders with the "Add Reminder" button
- Categorize reminders for better organization
- Receive desktop notifications when reminders are due

### Goals
- Create short-term and long-term goals with the "Add Goal" button
- Track progress by updating completion percentages
- Break down large goals into smaller milestones

### Notes
- Create quick notes or detailed documentation with markdown support
- Organize notes with tags and categories
- Use the search function to find specific information

### YouTube Manager
- Paste YouTube links to save videos for later
- Organize videos into custom categories
- Search and filter your video collection

### Scheduler
- Drag tasks, reminders, or YouTube videos onto the timeline
- Schedule your day with visual time blocks
- Adjust durations by dragging block edges

### Pomodoro Timer
- Start focused work sessions with the "Start" button
- Customize timer settings in the sidebar
- Track your daily focus time and session count

### Analytics
- View detailed productivity metrics and trends
- Filter data by different time ranges
- Export reports for external analysis

### Settings
- Customize the application appearance (theme, colors, font size)
- Configure notification preferences
- Manage data (import/export/clear)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for better productivity 