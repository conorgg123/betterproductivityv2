const { contextBridge, ipcRenderer, shell } = require('electron');

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
    deleteYouTubeLink: (linkId) => ipcRenderer.invoke('delete-youtube-link', linkId),
    
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
    openExternal: (url) => shell.openExternal(url),
    
    // Notifications (uses Electron's native notifications)
    showNotification: (options) => ipcRenderer.invoke('show-notification', options),
    
    // New yt-dlp integration methods
    fetchVideoInfo: (videoUrl) => ipcRenderer.invoke('fetch-video-info', videoUrl),
    downloadYouTubeVideo: (videoUrl, options) => ipcRenderer.invoke('download-youtube-video', videoUrl, options),
    onDownloadProgress: (callback) => {
        // Remove previous listener to avoid duplicates
        ipcRenderer.removeAllListeners('download-progress');
        // Add new listener
        ipcRenderer.on('download-progress', (event, data) => callback(data));
    },
    
    // File system related methods
    showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
    
    // Additional YouTube utilities
    getAvailableVideoFormats: (formats) => {
        // Process formats to create user-friendly options
        if (!formats || !Array.isArray(formats)) return [];
        
        // Group formats by type and quality
        const videoFormats = formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none')
            .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
        
        const audioFormats = formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none')
            .sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
        
        // Create options
        const options = [];
        
        // Add combined video+audio formats
        if (videoFormats.length > 0) {
            options.push({ 
                id: 'best', 
                label: 'Best Quality (Video + Audio)',
                description: 'Automatic best quality selection'
            });
            
            // Add specific resolutions
            const resolutions = [...new Set(videoFormats
                .filter(f => f.resolution)
                .map(f => f.resolution))];
            
            resolutions.forEach(resolution => {
                const format = videoFormats.find(f => f.resolution === resolution);
                if (format) {
                    options.push({
                        id: format.formatId,
                        label: `${resolution} (${format.ext})`,
                        description: `${format.formatNote || ''} ${format.filesize ? '- ' + formatFileSize(format.filesize) : ''}`,
                        filesize: format.filesize,
                        ext: format.ext
                    });
                }
            });
        }
        
        // Add audio-only formats
        if (audioFormats.length > 0) {
            options.push({ 
                id: 'bestaudio', 
                label: 'Best Audio Only',
                description: 'Highest quality audio only',
                audioOnly: true
            });
            
            audioFormats.slice(0, 3).forEach(format => {
                options.push({
                    id: format.formatId,
                    label: `Audio: ${format.formatNote || format.ext}`,
                    description: `${format.filesize ? formatFileSize(format.filesize) : ''}`,
                    filesize: format.filesize,
                    ext: format.ext,
                    audioOnly: true
                });
            });
        }
        
        return options;
    }
  }
);

// Helper function to format file size
function formatFileSize(bytes) {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    
    return `${bytes.toFixed(1)} ${units[i]}`;
} 