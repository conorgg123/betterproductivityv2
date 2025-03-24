const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // YouTube links
    addYoutubeLink: (url) => ipcRenderer.invoke('add-youtube-link', url),
    getYoutubeLinks: () => ipcRenderer.invoke('get-youtube-links'),
    getYoutubeVideoDetails: (url) => ipcRenderer.invoke('get-youtube-video-details', url),
    getYoutubeCategories: () => ipcRenderer.invoke('get-youtube-categories'),
    addYoutubeCategory: (category) => ipcRenderer.invoke('add-youtube-category', category),
    updateYoutubeLinkCategory: (update) => ipcRenderer.invoke('update-youtube-link-category', update),
    
    // Reminders
    addReminder: (reminder) => ipcRenderer.invoke('add-reminder', reminder),
    getReminders: () => ipcRenderer.invoke('get-reminders'),
    
    // Tasks
    addTask: (task) => ipcRenderer.invoke('add-task', task),
    updateTask: (taskUpdate) => ipcRenderer.invoke('update-task', taskUpdate),
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    
    // Schedule
    updateSchedule: (schedule) => ipcRenderer.invoke('update-schedule', schedule),
    getSchedule: () => ipcRenderer.invoke('get-schedule'),
    
    // Notifications
    showNotification: (notification) => ipcRenderer.send('show-notification', notification)
  }
); 