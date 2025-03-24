const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const youtubedl = require('youtube-dl-exec');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initialize the local storage
const store = new Store();

// Create a global variable to hold the window reference
let mainWindow;

// Function to get YouTube video details
async function getVideoDetails(url) {
  try {
    // Extract video ID first
    const videoId = extractVideoIdFromUrl(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Direct API call for title (most reliable)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched video title via oEmbed:', data.title);
        
        return {
          id: videoId,
          title: data.title,
          duration: 'Unknown duration',
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        };
      }
    } catch (oembedError) {
      console.warn('oEmbed API failed, trying youtube-dl-exec:', oembedError.message);
    }
    
    // Try youtube-dl-exec as backup
    try {
      const output = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
        skipDownload: true
      });
      
      // Format duration from seconds to MM:SS
      let duration = 'Unknown';
      if (output.duration) {
        const minutes = Math.floor(output.duration / 60);
        const seconds = output.duration % 60;
        duration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      }
      
      return {
        id: output.id,
        title: output.title || 'YouTube Video',
        duration: duration,
        thumbnail: output.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    } catch (ytdlError) {
      console.warn('youtube-dl-exec failed:', ytdlError.message);
      
      // Final fallback
      return {
        id: videoId,
        title: `YouTube Video (${videoId.substring(0, 6)}...)`,
        duration: 'Unknown duration',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    }
  } catch (error) {
    console.error('Error getting video details:', error);
    
    // Extract video ID from URL even if previous methods failed
    const videoId = extractVideoIdFromUrl(url) || createFallbackId(url);
    
    // Return a basic fallback with the video ID
    return {
      id: videoId,
      title: `YouTube Video`,
      duration: 'Unknown',
      thumbnail: videoId.length === 11 ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
    };
  }
}

// Helper function to extract video ID from YouTube URL
function extractVideoIdFromUrl(url) {
  try {
    // Handle YouTube Shorts URLs
    if (url.includes('youtube.com/shorts/')) {
      const shortsRegExp = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
      const match = url.match(shortsRegExp);
      return match ? match[1] : null;
    }
    
    // Handle standard YouTube URLs
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

// Create a fallback ID in case URL parsing fails
function createFallbackId(url) {
  // Generate a consistent ID based on the URL
  return 'fb_' + Math.abs(url.split('').reduce((a, b) => (a * 31 + b.charCodeAt(0)) | 0, 0)).toString(16).substring(0, 9);
}

// Initialize categories
function initializeCategories() {
  const defaultCategories = ['Entertainment', 'Education', 'Music', 'Technology', 'Sports'];
  const existingCategories = store.get('youtube-categories');
  
  if (!existingCategories) {
    store.set('youtube-categories', defaultCategories);
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  // mainWindow.webContents.openDevTools();

  // Event when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();
  initializeCategories();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for YouTube links
ipcMain.handle('get-youtube-video-details', async (event, url) => {
  return await getVideoDetails(url);
});

// Get all categories
ipcMain.handle('get-youtube-categories', () => {
  return store.get('youtube-categories') || [];
});

// Add a new category
ipcMain.handle('add-youtube-category', (event, category) => {
  const categories = store.get('youtube-categories') || [];
  
  // Check if category already exists
  if (!categories.includes(category)) {
    categories.push(category);
    store.set('youtube-categories', categories);
  }
  
  return categories;
});

// Add a YouTube link with category
ipcMain.handle('add-youtube-link', async (event, linkData) => {
  const links = store.get('youtube-links') || [];
  
  // If linkData is just a URL string, convert it to an object
  const linkObject = typeof linkData === 'string' 
    ? {
        url: linkData,
        title: 'YouTube Video',
        duration: '0:00',
        timestamp: new Date().toISOString(),
        category: 'Uncategorized'
      }
    : {
        ...linkData,
        category: linkData.category || 'Uncategorized'
      };
    
  links.push(linkObject);
  store.set('youtube-links', links);
  return links;
});

// Update a YouTube link's category
ipcMain.handle('update-youtube-link-category', (event, { id, category }) => {
  const links = store.get('youtube-links') || [];
  const updatedLinks = links.map(link => 
    link.id === id ? { ...link, category } : link
  );
  store.set('youtube-links', updatedLinks);
  return updatedLinks;
});

// Get all YouTube links
ipcMain.handle('get-youtube-links', () => {
  return store.get('youtube-links') || [];
});

// IPC Handlers for reminders
ipcMain.handle('add-reminder', (event, reminder) => {
  const reminders = store.get('reminders') || [];
  reminders.push({
    ...reminder,
    id: Date.now().toString()
  });
  store.set('reminders', reminders);
  return reminders;
});

ipcMain.handle('get-reminders', () => {
  return store.get('reminders') || [];
});

// IPC Handlers for tasks
ipcMain.handle('add-task', (event, task) => {
  const tasks = store.get('tasks') || [];
  tasks.push({
    ...task,
    id: Date.now().toString(),
    completed: false
  });
  store.set('tasks', tasks);
  return tasks;
});

ipcMain.handle('update-task', (event, { id, completed }) => {
  const tasks = store.get('tasks') || [];
  const updatedTasks = tasks.map(task => 
    task.id === id ? { ...task, completed } : task
  );
  store.set('tasks', updatedTasks);
  return updatedTasks;
});

ipcMain.handle('get-tasks', () => {
  return store.get('tasks') || [];
});

// IPC Handlers for scheduled items
ipcMain.handle('update-schedule', (event, schedule) => {
  store.set('schedule', schedule);
  return schedule;
});

ipcMain.handle('get-schedule', () => {
  return store.get('schedule') || [];
});

// Handle notifications
ipcMain.on('show-notification', (event, { title, body }) => {
  new Notification({ title, body }).show();
}); 