const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // YouTube functionality
    getYouTubeInfo: (url) => ipcRenderer.invoke('get-youtube-info', url),
    getYouTubeVideoDetails: (url) => ipcRenderer.invoke('get-youtube-video-details', url),
    getYouTubeCategories: () => ipcRenderer.invoke('get-youtube-categories'),
    addYouTubeCategory: (category) => ipcRenderer.invoke('add-youtube-category', category),
    addYouTubeLink: (linkData) => ipcRenderer.invoke('add-youtube-link', linkData),
    updateYouTubeLinkCategory: (data) => ipcRenderer.invoke('update-youtube-link-category', data),
    getYouTubeLinks: () => ipcRenderer.invoke('get-youtube-links'),
    deleteYouTubeLink: (id) => ipcRenderer.invoke('delete-youtube-link', id),
    
    // Task functionality
    addTask: (task) => ipcRenderer.invoke('add-task', task),
    updateTask: (data) => ipcRenderer.invoke('update-task', data),
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    
    // Reminder functionality
    addReminder: (reminder) => ipcRenderer.invoke('add-reminder', reminder),
    getReminders: () => ipcRenderer.invoke('get-reminders'),
    
    // Schedule functionality
    updateSchedule: (schedule) => ipcRenderer.invoke('update-schedule', schedule),
    getSchedule: () => ipcRenderer.invoke('get-schedule', schedule),
    
    // Data persistence
    storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
    storeGet: (key) => ipcRenderer.invoke('store-get', key),
    storeDelete: (key) => ipcRenderer.invoke('store-delete', key),
    
    // File operations
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    openFile: () => ipcRenderer.invoke('open-file'),
    
    // YouTube URL info fetch (from ytdlp)
    fetchYoutubeInfo: (url) => ipcRenderer.invoke('fetch-youtube-info', url),
    
    // Data export/import
    exportData: (data) => ipcRenderer.invoke('export-data', data),
    importData: (options) => ipcRenderer.invoke('import-data', options),
    
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // External operations
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    
    // Notifications (uses Electron's native notifications)
    showNotification: (options) => ipcRenderer.invoke('show-notification', options)
  }
); 