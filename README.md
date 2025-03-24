# Daily Progress Tracker

A desktop application built with Electron for tracking daily tasks, reminders, and YouTube links. This application runs locally on your computer with no server dependencies, ensuring privacy and offline functionality.

## Features

- **Modern Dashboard**: A beautiful, intuitive dashboard inspired by the design you provided
- **Task Management**: Create, organize, and track tasks with priority levels
- **Calendar & Reminders**: Schedule events and get desktop notifications
- **YouTube Link Manager**: (Coming soon) Organize and schedule YouTube videos
- **Data Persistence**: All data is stored locally on your computer

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- npm (included with Node.js)

### Setup

1. Clone this repository:
```
git clone https://github.com/yourusername/daily-progress-tracker.git
cd daily-progress-tracker
```

2. Install dependencies:
```
npm install
```

3. Start the application:
```
npm start
```

### Building for Distribution

To create a distributable package for your platform:

```
npm run make
```

This will create platform-specific distributables in the `out` folder.

## Usage

### Task Management

- Click the "+" button in the "LIST OF MY TASKS" section to add a new task
- Tasks can be marked as completed by clicking on them
- Each task has a due date displayed on the right

### Calendar

- Click the "+" button in the "MY CALENDAR" section to add a new event or reminder
- Events are organized by day and display the time range
- Reminders will trigger desktop notifications when they are due

### Dashboard Stats

The dashboard shows various statistics including:
- Number of new cases
- Number of new tasks
- Trends over the last month
- Case type breakdown

## Development

This application is built with:

- [Electron](https://www.electronjs.org/) - For creating the desktop application
- [HTML/CSS/JavaScript](https://developer.mozilla.org/en-US/docs/Web) - For the user interface
- [Electron Store](https://github.com/sindresorhus/electron-store) - For data persistence

To modify the application:

1. Edit the HTML structure in `index.html`
2. Style changes can be made in `styles.css`
3. Application logic is in `app.js` and `main.js`

## License

[MIT](LICENSE)

## Credits

- Dashboard design inspired by the provided mockup
- Icons from [Font Awesome](https://fontawesome.com/) 