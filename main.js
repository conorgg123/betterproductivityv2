const { app, BrowserWindow, ipcMain, dialog, Menu, shell, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const youtubedl = require('youtube-dl-exec');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const ytdlp = require('yt-dlp-exec');
const { spawn } = require('child_process');
const os = require('os');
const gamification = require('./src/main/gamification'); // Import gamification module
const { extractVideoIdFromUrl } = require('./src/main/youtubeUtils'); // Import the utility function
const { v4: uuidv4 } = require('uuid');
// const knex = require('knex'); // Assuming knex is imported for database operations - Moved initialization down

// Ensure the application data directory exists before initializing Knex
const appDataDir = path.join(os.homedir(), '.better-productivity');
try {
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
    console.log(`Created application data directory: ${appDataDir}`);
  }
} catch (error) {
  console.error(`Error creating application data directory (${appDataDir}):`, error);
  // Consider how to handle this error - maybe alert the user or exit
}

// Find where knex is configured and migrations are run
console.log('Running database migrations...');

// Use this configuration for knex
const dbPath = path.join(app.getPath('userData'), 'db.sqlite');
console.log(`Using database at: ${dbPath}`);

// Initialize knex with our migrations_fix directory
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'src', 'db', 'migrations_fix')
  }
});

// Wrap the migration code in an async IIFE to handle top-level await
(async function setupDatabase() {
  try {
    // Run the migrations with better error handling
    await knex.migrate.latest();
    console.log('Database migrations completed successfully');
    
    // Log migration details - fixing the destructuring issue
    const migrationStatus = await knex.migrate.status();
    console.log('Migration status:', migrationStatus);
    
    // Verify Projects table exists
    const hasProjectsTable = await knex.schema.hasTable('Projects');
    console.log(`Projects table exists: ${hasProjectsTable}`);
    
    if (hasProjectsTable) {
      // Count records in Projects table
      const count = await knex('Projects').count('* as count').first();
      console.log(`Projects table has ${count.count} records`);
    }
  } catch (error) {
    console.error('Error running database migrations:', error);
    // Continue anyway - we'll handle missing tables in the handlers
  }
})();

// Add a runMigrations function that's called later
async function runMigrations() {
  // Migrations are already being handled in the IIFE above
  // This function is here to avoid the "not defined" error
  console.log('Migration handler called from app.whenReady()');
  // No need to run migrations again
}

// Initialize the local storage
const store = new Store({
  name: 'daily-progress-data',
  defaults: {
    'youtube-categories': ['Entertainment', 'Education', 'Music', 'Technology', 'Sports'],
    'youtube-links': [],
    'tasks': [],
    'reminders': [],
    'schedule': [],
    'auto-backup-enabled': false,
    'backup-directory': app.getPath('documents')
  }
});

// Create a global variable to hold the window reference
let mainWindow = null;

// Define platform-specific paths for yt-dlp
const getYtDlpPath = () => {
  try {
    // For Windows, search in several possible locations
    if (process.platform === 'win32') {
      const possiblePaths = [
        // Try the pip installed path first
        'C:\\Users\\mrcon\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python311\\Scripts\\yt-dlp.exe',
        // Look in PATH for yt-dlp
        path.join(process.env.APPDATA, 'Python', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA, 'Programs', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
        // Default to just the command and hope it's in PATH
        'yt-dlp.exe'
      ];
      
      for (const pathToCheck of possiblePaths) {
        if (fs.existsSync(pathToCheck)) {
          console.log(`Found yt-dlp at: ${pathToCheck}`);
          return pathToCheck;
        }
      }
      // If not found in expected locations, default to command name
      return 'yt-dlp.exe';
    }
    
    // For macOS and Linux, just use the command name
    return 'yt-dlp';
  } catch (error) {
    console.error('Error determining yt-dlp path:', error);
    return process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  }
};

// Initialize the yt-dlp path
const ytDlpPath = getYtDlpPath();
console.log(`Using yt-dlp path: ${ytDlpPath}`);

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
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    backgroundColor: '#121212',
    show: false
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Initialize gamification after window and store are ready
    gamification.initGamification(store, mainWindow); 
    // Optional: Run an initial check for all achievements on startup
    // gamification.checkAllAchievements(); 
    
    // Maximize on first run
    if (!fs.existsSync(path.join(app.getPath('userData'), 'window-state.json'))) {
      mainWindow.maximize();
    }
  });

  // Handle window state
  mainWindow.on('close', (event) => {
    if (mainWindow) {
      // Save window state
      const windowState = {
        bounds: mainWindow.getBounds()
      };
      fs.writeFileSync(
        path.join(app.getPath('userData'), 'window-state.json'),
        JSON.stringify(windowState)
      );
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

// Build the application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          click: () => mainWindow.webContents.send('menu-export-data')
        },
        {
          label: 'Import Data',
          click: () => mainWindow.webContents.send('menu-import-data')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => mainWindow.webContents.send('menu-settings')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Focus Mode',
          click: () => mainWindow.webContents.send('toggle-focus-mode')
        },
        {
          label: 'Pomodoro Timer',
          click: () => mainWindow.webContents.send('open-pomodoro')
        },
        { type: 'separator' },
        {
          label: 'Keyboard Shortcuts',
          click: () => mainWindow.webContents.send('show-shortcuts')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/daily-progress-tracker');
          }
        },
        {
          label: 'About',
          click: () => mainWindow.webContents.send('show-about')
        }
      ]
    }
  ];

  // Special case for Mac
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for file operations
ipcMain.handle('save-file', async (event, { content, filename, defaultPath }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || filename,
    filters: [
      { name: 'JSON', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, content);
    return { success: true, filePath };
  }
  
  return { success: false };
});

ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!canceled && filePaths.length > 0) {
    const content = fs.readFileSync(filePaths[0], 'utf8');
    return { success: true, content, filePath: filePaths[0] };
  }
  
  return { success: false };
});

// Show native notifications
ipcMain.handle('show-notification', (event, { title, body, silent }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      silent: silent || false,
      icon: path.join(__dirname, 'icon.png')
    });
    
    notification.show();
    return true;
  }
  return false;
});

// Setup auto-backup functionality
let autoBackupInterval = null;

/**
 * Set up auto backup if enabled
 */
function setupAutoBackup() {
  // Clear any existing interval
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
    autoBackupInterval = null;
  }
  
  // Check if auto backup is enabled
  const autoBackupEnabled = store.get('auto-backup-enabled') || false;
  
  if (autoBackupEnabled) {
    console.log('Setting up auto backup...');
    
    // Schedule backup once a day (24 hours)
    autoBackupInterval = setInterval(() => {
      console.log('Running scheduled backup...');
      createAutomaticBackup();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Also run a backup right away
    setTimeout(() => {
      createAutomaticBackup();
    }, 5000); // 5 seconds after app starts
    
    console.log('Auto backup scheduled.');
  } else {
    console.log('Auto backup is disabled.');
  }
}

/**
 * Create an automatic backup and save it to the backup directory
 */
async function createAutomaticBackup() {
  try {
    console.log('Creating automatic backup...');
    
    // Collect all data from store
    const storeData = {};
    const storeKeys = [
      'youtube-categories', 
      'youtube-links', 
      'tasks', 
      'reminders', 
      'schedule',
      'notes',
      'pomodoro-sessions',
      'achievements',
      'user-settings'
    ];
    
    for (const key of storeKeys) {
      storeData[key] = store.get(key);
    }
    
    // Get data from database
    let dbData = {};
    try {
      const projects = await getProjectsFromDb();
      
      // For each project, get its tasks
      const projectsWithTasks = await Promise.all(projects.map(async (project) => {
        const projectTasks = await getProjectTasksFromDb(project.id);
        return {
          ...project,
          tasks: projectTasks || []
        };
      }));
      
      dbData = {
        projects: projectsWithTasks
      };
    } catch (error) {
      console.error('Error getting data from database:', error);
    }
    
    // Combine all data into one backup object
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      localStorage: storeData,
      database: dbData,
      autoBackup: true
    };
    
    // Create a JSON string from the backup data
    const backupJson = JSON.stringify(backupData, null, 2);
    
    // Get the backup directory
    const backupDir = store.get('backup-directory') || app.getPath('documents');
    
    // Create the file path
    const date = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `daily-progress-auto-backup-${date}.json`;
    const filePath = path.join(backupDir, filename);
    
    // Save the file
    fs.writeFileSync(filePath, backupJson, 'utf-8');
    
    console.log('Automatic backup created successfully:', filePath);
    
    // Keep only the last 5 backups to avoid excessive storage usage
    cleanupOldBackups(backupDir);
    
    // Notify the renderer if the window is open
    if (mainWindow) {
      mainWindow.webContents.send('auto-backup-completed', {
        success: true,
        timestamp: new Date().toISOString(),
        path: filePath
      });
    }
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Error creating automatic backup:', error);
    
    // Notify the renderer if the window is open
    if (mainWindow) {
      mainWindow.webContents.send('auto-backup-completed', {
        success: false,
        error: error.message
      });
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Clean up old auto-backups, keeping only the most recent 5
 */
function cleanupOldBackups(backupDir) {
  try {
    // Read all files in the backup directory
    const files = fs.readdirSync(backupDir);
    
    // Filter only auto-backup files
    const backupFiles = files
      .filter(file => file.startsWith('daily-progress-auto-backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by timestamp, newest first
    
    // Keep only the 5 most recent backups
    if (backupFiles.length > 5) {
      const filesToDelete = backupFiles.slice(5);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log('Deleted old backup:', file.name);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Run database migrations first
  await runMigrations();
  
  initializeCategories();
  createWindow();
  setupIPCHandlers();

  // Initialize gamification module
  gamification.init(mainWindow);

  // Set up auto-backup if enabled
  setupAutoBackup();

  // Handle macOS behavior
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle window-all-closed event
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle before-quit event
app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
});

// IPC Handlers for YouTube links
ipcMain.handle('get-youtube-info', async (event, url) => {
  try {
    return await getVideoDetails(url);
  } catch (error) {
    console.error('Error in get-youtube-info:', error);
    return {
      error: error.message,
      id: null,
      title: 'Error fetching video details',
      duration: 'Unknown',
      thumbnail: null
    };
  }
});

// Get all categories
ipcMain.handle('get-youtube-categories', (event) => {
  try {
    const categories = store.get('youtube-categories', []);
    console.log('Retrieved YouTube categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error in get-youtube-categories:', error);
    return [];
  }
});

// Add a new category
ipcMain.handle('add-youtube-category', async (event, category) => {
  try {
    console.log('Adding YouTube category:', category);
    const categories = store.get('youtube-categories', []);
    if (!categories.includes(category)) {
      categories.push(category);
      store.set('youtube-categories', categories);
      console.log('Successfully added YouTube category');
      return { success: true };
    }
    return { success: false, error: 'Category already exists' };
  } catch (error) {
    console.error('Error in add-youtube-category:', error);
    return { success: false, error: error.message };
  }
});

// Add a YouTube link with category
ipcMain.handle('add-youtube-link', async (event, linkData) => {
  try {
    console.log('Adding YouTube link:', linkData);
    const links = store.get('youtube-links', []);
    links.push(linkData);
    store.set('youtube-links', links);
    console.log('Successfully added YouTube link');
    return { success: true };
  } catch (error) {
    console.error('Error in add-youtube-link:', error);
    return { success: false, error: error.message };
  }
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
ipcMain.handle('get-youtube-links', (event) => {
  try {
    const links = store.get('youtube-links', []);
    console.log('Retrieved YouTube links:', links);
    return links;
  } catch (error) {
    console.error('Error in get-youtube-links:', error);
    return [];
  }
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

// Handle IPC messages (communication between renderer and main processes)
function setupIPCHandlers() {
  // YouTube URL info fetch using yt-dlp
  ipcMain.handle('fetch-youtube-info', async (event, url) => {
    try {
      const result = await ytdlp(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
      });
      
      return {
        success: true,
        data: {
          title: result.title,
          duration: result.duration,
          thumbnail: result.thumbnail,
          channel: result.channel,
          uploadDate: result.upload_date
        }
      };
    } catch (error) {
      console.error('Error fetching YouTube info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // File export
  ipcMain.handle('export-data', async (event, { format, data }) => {
    try {
      const options = {
        title: 'Save Data',
        defaultPath: path.join(app.getPath('documents'), `daily-progress-export.${format}`),
        buttonLabel: 'Export',
        filters: [
          { name: 'All Files', extensions: ['*'] }
        ]
      };

      if (format === 'json') {
        options.filters.unshift({ name: 'JSON Files', extensions: ['json'] });
      } else if (format === 'csv') {
        options.filters.unshift({ name: 'CSV Files', extensions: ['csv'] });
      } else if (format === 'ics') {
        options.filters.unshift({ name: 'Calendar Files', extensions: ['ics'] });
      }

      const { canceled, filePath } = await dialog.showSaveDialog(options);
      
      if (canceled || !filePath) {
        return { success: false, message: 'Export cancelled' };
      }

      fs.writeFileSync(filePath, data, 'utf-8');
      
      return { success: true, message: 'Data exported successfully', filePath };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, message: error.message };
    }
  });

  // File import
  ipcMain.handle('import-data', async (event, { format }) => {
    try {
      const options = {
        title: 'Import Data',
        buttonLabel: 'Import',
        filters: [
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      };

      if (format === 'json') {
        options.filters.unshift({ name: 'JSON Files', extensions: ['json'] });
      } else if (format === 'csv') {
        options.filters.unshift({ name: 'CSV Files', extensions: ['csv'] });
      } else if (format === 'ics') {
        options.filters.unshift({ name: 'Calendar Files', extensions: ['ics'] });
      }

      const { canceled, filePaths } = await dialog.showOpenDialog(options);
      
      if (canceled || filePaths.length === 0) {
        return { success: false, message: 'Import cancelled' };
      }

      const data = fs.readFileSync(filePaths[0], 'utf-8');
      
      return { success: true, data, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: error.message };
    }
  });

  // Persistent data storage
  ipcMain.handle('store-set', async (event, key, value) => {
    try {
      store.set(key, value);
      return { success: true };
    } catch (error) {
      console.error('Error in store-set:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('store-get', (event, key) => {
    try {
      return store.get(key);
    } catch (error) {
      console.error('Error in store-get:', error);
      return null;
    }
  });

  ipcMain.handle('store-delete', (event, key) => {
    store.delete(key);
    return true;
  });

  // Open links in external browser
  ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return true;
  });

  // Delete a YouTube link
  ipcMain.handle('delete-youtube-link', async (event, id) => {
    try {
      console.log('Deleting YouTube link with ID:', id);
      const links = store.get('youtube-links', []);
      const filteredLinks = links.filter(link => link.id !== id);
      
      if (links.length === filteredLinks.length) {
        console.warn('No link found with ID:', id);
        return { success: false, error: 'Link not found' };
      }
      
      store.set('youtube-links', filteredLinks);
      console.log('Successfully deleted YouTube link');
      return { success: true };
    } catch (error) {
      console.error('Error in delete-youtube-link:', error);
      return { success: false, error: error.message };
    }
  });

  // Handle YouTube video info fetch using yt-dlp
  ipcMain.handle('fetch-video-info', async (event, videoUrl) => {
    console.log('Fetching video info using yt-dlp:', videoUrl);
    
    return new Promise((resolve, reject) => {
      // Set up the command args
      const args = ['--dump-json', '--no-playlist', videoUrl];
      
      console.log(`Running command: ${ytDlpPath} ${args.join(' ')}`);
      
      const ytDlpProcess = spawn(ytDlpPath, args);
      let stdout = '';
      let stderr = '';
      
      ytDlpProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      ytDlpProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ytDlpProcess.on('close', (code) => {
        console.log(`yt-dlp process exited with code ${code}`);
        
        if (code === 0 && stdout) {
          try {
            const videoInfo = JSON.parse(stdout);
            
            // Extract relevant information
            const result = {
              id: videoInfo.id,
              title: videoInfo.title,
              thumbnail: videoInfo.thumbnail,
              uploadDate: videoInfo.upload_date,
              duration: videoInfo.duration,
              viewCount: videoInfo.view_count,
              likeCount: videoInfo.like_count,
              channel: videoInfo.channel,
              channelId: videoInfo.channel_id,
              description: videoInfo.description,
              categories: videoInfo.categories,
              tags: videoInfo.tags,
              formats: videoInfo.formats ? videoInfo.formats.map(f => ({
                formatId: f.format_id,
                formatNote: f.format_note,
                ext: f.ext,
                resolution: f.resolution,
                filesize: f.filesize,
                tbr: f.tbr,
                protocol: f.protocol,
                vcodec: f.vcodec,
                acodec: f.acodec,
                url: f.url
              })) : []
            };
            
            resolve(result);
          } catch (error) {
            console.error('Error parsing yt-dlp output:', error);
            reject(new Error(`Failed to parse video info: ${error.message}`));
          }
        } else {
          console.error('yt-dlp error:', stderr);
          reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
        }
      });
      
      ytDlpProcess.on('error', (error) => {
        console.error('Failed to start yt-dlp process:', error);
        reject(new Error(`Failed to start yt-dlp process: ${error.message}. Please make sure yt-dlp is installed correctly.`));
      });
    });
  });

  // Handle YouTube video download
  ipcMain.handle('download-youtube-video', async (event, videoUrl, options) => {
    console.log('Downloading video using yt-dlp:', videoUrl, options);
    
    // Allow user to select download directory if not specified
    let downloadDir = options.directory;
    if (!downloadDir) {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Download Folder',
          defaultPath: path.join(os.homedir(), 'Downloads')
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          downloadDir = result.filePaths[0];
        } else {
          // User canceled the dialog
          return { canceled: true };
        }
      } catch (error) {
        console.error('Error showing directory dialog:', error);
        downloadDir = path.join(os.homedir(), 'Downloads');
      }
    }
    
    // Ensure download directory exists
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    return new Promise((resolve, reject) => {
      // Set up download arguments
      const args = [
        '--no-playlist',
        '-o', path.join(downloadDir, '%(title)s.%(ext)s')
      ];
      
      // Add format option if specified
      if (options.format) {
        args.push('-f', options.format);
      }
      
      // Add audio-only option if specified
      if (options.audioOnly) {
        args.push('-x', '--audio-format', options.audioFormat || 'mp3');
      }
      
      // Add additional options
      if (options.embedThumbnail) {
        args.push('--embed-thumbnail');
      }
      
      if (options.addMetadata) {
        args.push('--add-metadata');
      }
      
      if (options.subtitles) {
        args.push('--write-auto-sub', '--sub-lang', options.subtitleLanguage || 'en');
      }
      
      // Add the video URL
      args.push(videoUrl);
      
      console.log(`Running download command: ${ytDlpPath} ${args.join(' ')}`);
      
      const ytDlpProcess = spawn(ytDlpPath, args);
      let output = '';
      let progressPercent = 0;
      let filename = '';
      
      ytDlpProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        // Try to parse progress percentage
        const progressMatch = chunk.match(/(\d+\.\d+)%/);
        if (progressMatch) {
          progressPercent = parseFloat(progressMatch[1]);
          event.sender.send('download-progress', { videoUrl, progress: progressPercent });
        }
        
        // Try to parse output filename
        const filenameMatch = chunk.match(/Destination: (.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
        
        // Also try to match the "[download] ... of ..." format
        const downloadMatch = chunk.match(/\[download\]\s+(\d+\.\d+)%/);
        if (downloadMatch) {
          progressPercent = parseFloat(downloadMatch[1]);
          event.sender.send('download-progress', { videoUrl, progress: progressPercent });
        }
      });
      
      ytDlpProcess.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      ytDlpProcess.on('close', async (code) => {
        console.log(`yt-dlp download process exited with code ${code}`);
        
        if (code === 0) {
          resolve({
            success: true,
            message: 'Download completed successfully',
            path: filename || downloadDir,
            output
          });
        } else {
          console.error('yt-dlp download error:', output);
          reject(new Error(`Download failed with code ${code}: ${output}`));
        }
      });
      
      ytDlpProcess.on('error', (error) => {
        console.error('Failed to start yt-dlp download process:', error);
        reject(new Error(`Failed to start yt-dlp download process: ${error.message}`));
      });
    });
  });

  // Show video file in folder
  ipcMain.handle('show-in-folder', async (event, filePath) => {
    if (fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return { success: true };
    } else {
      return { success: false, error: 'File not found' };
    }
  });

  // --- Data Retrieval Handlers for Dashboard ---

  // Get time tracking data (add filtering later if needed)
  ipcMain.handle('get-time-tracking-data', async (event) => {
    try {
      return store.get('timeTrackingData', []);
    } catch (error) {
      console.error('Error getting time tracking data:', error);
      return [];
    }
  });

  // Get projects data
  ipcMain.handle('get-projects', async () => {
    try {
      console.log('Getting projects from database...');
      
      // Check if the Projects table exists
      const hasProjectsTable = await knex.schema.hasTable('Projects');
      
      if (!hasProjectsTable) {
        console.log('Projects table does not exist, returning empty array');
        return [];
      }
      
      // Get all projects
      const projects = await knex('Projects')
        .select('*')
        .orderBy('created_at', 'desc');
        
      console.log(`Retrieved ${projects.length} projects`);
      
      return projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  });

  // Get a single project by ID
  ipcMain.handle('get-project', async (event, projectId) => {
    try {
      console.log(`Getting project ${projectId}...`);
      
      if (!projectId) {
        console.error('Project ID is required');
        return null;
      }
      
      // Get project
      const project = await knex('Projects')
        .select('*')
        .where('id', projectId)
        .first();
        
      if (project) {
        console.log(`Retrieved project ${projectId}`);
      } else {
        console.log(`Project ${projectId} not found`);
      }
      
      return project;
    } catch (error) {
      console.error(`Error getting project ${projectId}:`, error);
      return null;
    }
  });

  // Get Pomodoro session data
  ipcMain.handle('get-pomodoro-sessions', async (event) => {
    try {
      // Assuming history is stored under 'pomodoroHistory' as used in gamification tests
      return store.get('pomodoroHistory', []); 
    } catch (error) {
      console.error('Error getting Pomodoro sessions:', error);
      return [];
    }
  });

  // --- Gamification IPC Handlers ---
  ipcMain.handle('get-all-achievements', async (event) => {
    const allAchievements = gamification.achievements; 
    const earnedIds = gamification.getEarnedAchievements();
    // Return all achievement definitions, marking which are earned
    return allAchievements.map(ach => ({
      ...ach,
      earned: earnedIds.includes(ach.id)
    }));
  });

  ipcMain.on('check-achievement-event', (event, eventType) => {
    console.log(`IPC Received: check-achievement-event - ${eventType}`);
    gamification.checkAchievementsOnEvent(eventType);
  });

  // Handler to fetch defined and unlocked achievements for the settings page
  ipcMain.handle('get-achievements', async (event) => {
    try {
      const allDefinedAchievements = gamification.achievements;
      // Select only serializable fields (omit the 'criteria' function)
      const definedAchievements = allDefinedAchievements.map(({ id, name, description, checkFrequency }) => ({
        id,
        name,
        description,
        checkFrequency // Include frequency if needed in UI
      }));
      const unlockedAchievements = gamification.getEarnedAchievements(); // Get IDs of unlocked achievements
      return { definedAchievements, unlockedAchievements };
    } catch (error) {
      console.error('Error getting achievements:', error);
      // Ensure the error object itself is serializable or just send a message
      return { definedAchievements: [], unlockedAchievements: [], error: error.message }; 
    }
  });

  // Handler to add a new project
  ipcMain.handle('add-project', async (event, projectName, priority, projectData) => {
    console.log(`IPC Handler: Received request to add project: ${projectName} with priority: ${priority}`);
    if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
        throw new Error('Invalid project name provided.');
    }
    // Basic validation for priority (optional, depends on requirements)
    const validPriorities = ['Low', 'Medium', 'High'];
    if (priority && !validPriorities.includes(priority)) {
        console.warn(`Invalid priority value received: ${priority}. Defaulting to Medium.`);
        priority = 'Medium'; // Default or throw error based on requirements
    }
    
    try {
        const newProjectId = uuidv4(); // Generate unique ID
        const now = new Date().toISOString();
        
        // Create base project object
        const newProject = {
            id: newProjectId,
            user_id: 'default-user', // Replace with actual user ID if implementing multi-user
            name: projectName.trim(),
            priority: priority || 'Medium', // Include priority, default to Medium if null/undefined
            created_at: now,
            updated_at: now
        };
        
        // Add additional data if provided
        if (projectData) {
            if (projectData.description) newProject.description = projectData.description;
            if (projectData.due_date) newProject.due_date = projectData.due_date;
            if (projectData.estimated_hours !== null && projectData.estimated_hours !== undefined) {
                newProject.estimated_hours = projectData.estimated_hours;
            }
            if (projectData.color) newProject.color = projectData.color;
            
            // Save team members in a separate table if your schema supports it
            if (projectData.team_members && projectData.team_members.length > 0) {
                newProject.team_members_json = JSON.stringify(projectData.team_members);
                
                // If you have a ProjectMembers table, you could insert there too
                // Example:
                // const memberInserts = projectData.team_members.map(member => ({
                //     project_id: newProjectId,
                //     user_id: member.id,
                //     added_at: now
                // }));
                // if (memberInserts.length > 0) {
                //     await knex('ProjectMembers').insert(memberInserts);
                // }
            }
        }
        
        // Log the complete project object
        console.log('Adding project to database:', newProject);
        
        // Insert into database (assuming 'knex' instance is available)
        await knex('Projects').insert(newProject);
        
        // Trigger achievement check if applicable
        if (gamification) {
            gamification.checkAchievementsOnEvent('project_created');
        }
        
        console.log('Project added to DB:', newProject);
        return newProject; // Return the created project object
    } catch (error) {
        console.error('Error adding project to database:', error);
        throw new Error(`Failed to add project: ${error.message}`);
    }
  });

  // Update project
  ipcMain.handle('update-project', async (event, projectId, projectData) => {
    try {
      console.log(`Updating project ${projectId}...`);
      
      if (!projectId) {
        console.error('Project ID is required for updating');
        return { success: false, error: 'Project ID is required' };
      }
      
      // Update project in database
      await knex('Projects')
        .where('id', projectId)
        .update({
          ...projectData,
          updated_at: new Date().toISOString()
        });
        
      console.log(`Project ${projectId} updated successfully`);
      
      // Return updated project
      const updatedProject = await knex('Projects')
        .select('*')
        .where('id', projectId)
        .first();
        
      return { success: true, project: updatedProject };
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Delete project
  ipcMain.handle('delete-project', async (event, projectId) => {
    try {
      console.log(`Deleting project ${projectId}...`);
      
      if (!projectId) {
        console.error('Project ID is required for deletion');
        return { success: false, error: 'Project ID is required' };
      }
      
      // Delete all tasks associated with this project
      await knex('Tasks')
        .where('project_id', projectId)
        .delete();
        
      // Delete the project
      await knex('Projects')
        .where('id', projectId)
        .delete();
        
      console.log(`Project ${projectId} deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: error.message };
    }
  });

  // --- Electron Store Handlers ---
  ipcMain.handle('electron-store-get', async (event, key) => {
    try {
      return store.get(key);
    } catch (error) {
      console.error(`Error getting key "${key}" from electron-store:`, error);
      return undefined; // Or handle error appropriately
    }
  });

  ipcMain.handle('electron-store-set', async (event, key, value) => {
    try {
      store.set(key, value);
      return { success: true };
    } catch (error) {
      console.error(`Error setting key "${key}" in electron-store:`, error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('store-delete', async (event, key) => {
     try {
       store.delete(key);
       return { success: true };
     } catch (error) {
       console.error(`Error deleting key "${key}" from electron-store:`, error);
       return { success: false, error: error.message };
     }
  });

  // Handler to add a task to a specific project
  ipcMain.handle('add-task-to-project', async (event, taskData) => {
    try {
      console.log(`Adding task to project ${taskData.project_id}:`, taskData.description);
      
      if (!taskData.project_id) {
        console.error('Project ID is required for adding a task to a project');
        return { success: false, error: 'Project ID is required' };
      }
      
      // Validate required fields
      if (!taskData.description) {
        console.error('Task description is required');
        return { success: false, error: 'Task description is required' };
      }
      
      // Create the task
      const taskId = uuidv4();
      const now = new Date().toISOString();
      
      const newTask = {
        id: taskId,
        user_id: 'default-user', // Replace with actual user ID if needed
        description: taskData.description,
        due_date: taskData.due_date || null,
        priority: taskData.priority || 'Medium',
        category: taskData.category || null,
        status: taskData.status || 'Pending',
        completed: taskData.completed || false,
        recurrence: taskData.recurrence || null,
        project_id: taskData.project_id,
        notes: taskData.notes || null,
        created_at: now,
        updated_at: now
      };
      
      // Check if the Tasks table exists, create it if it doesn't
      const hasTasksTable = await knex.schema.hasTable('Tasks');
      if (!hasTasksTable) {
        console.log('Tasks table does not exist, creating it...');
        await knex.schema.createTable('Tasks', function(table) {
          table.string('id').primary();
          table.string('user_id');
          table.string('description').notNullable();
          table.date('due_date');
          table.string('priority');
          table.string('category');
          table.string('status').defaultTo('Pending');
          table.boolean('completed').defaultTo(false);
          table.string('recurrence');
          table.string('project_id').references('id').inTable('Projects').onDelete('CASCADE');
          table.text('notes');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
        console.log('Tasks table created successfully');
      }
      
      // Add task to database
      await knex('Tasks').insert(newTask);
      
      console.log(`Task "${newTask.description}" added to project ${newTask.project_id}`);
      
      // Trigger achievement check
      gamification.checkAchievementsOnEvent('task_created');
      
      return { success: true, task: newTask };
    } catch (error) {
      console.error('Error adding task to project:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Handler to get tasks for a specific project
  ipcMain.handle('get-project-tasks', async (event, projectId) => {
    try {
      console.log(`Getting tasks for project ${projectId}...`);
      
      if (!projectId) {
        console.error('Project ID is required for getting project tasks');
        return { success: false, error: 'Project ID is required' };
      }
      
      // Check if the Tasks table exists
      const hasTasksTable = await knex.schema.hasTable('Tasks');
      if (!hasTasksTable) {
        console.log('Tasks table does not exist, returning empty array');
        return { success: true, tasks: [] };
      }
      
      // Get tasks for this project
      const tasks = await knex('Tasks')
        .select('*')
        .where('project_id', projectId)
        .orderBy('created_at', 'desc');
      
      console.log(`Retrieved ${tasks.length} tasks for project ${projectId}`);
      
      return { success: true, tasks };
    } catch (error) {
      console.error(`Error getting tasks for project ${projectId}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Open URLs in Chrome browser
  ipcMain.handle('open-url-in-chrome', async (event, url) => {
    try {
      console.log('Opening URL in Chrome:', url);
      
      // Determine the Chrome executable path based on the platform
      let chromePath;
      
      switch (process.platform) {
        case 'win32':
          // Windows paths
          const possibleWindowsPaths = [
            path.join(process.env.PROGRAMFILES, 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env['PROGRAMFILES(X86)'], 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
          ];
          
          for (const pathToCheck of possibleWindowsPaths) {
            if (fs.existsSync(pathToCheck)) {
              chromePath = pathToCheck;
              break;
            }
          }
          break;
          
        case 'darwin':
          // macOS
          chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
          break;
          
        case 'linux':
          // Linux
          chromePath = 'google-chrome';
          break;
      }
      
      if (chromePath) {
        // Spawn Chrome process with the URL
        const chromeProcess = spawn(chromePath, [url]);
        
        chromeProcess.on('error', (error) => {
          console.error('Error opening Chrome:', error);
          // Fallback to default browser if Chrome fails to open
          shell.openExternal(url);
        });
        
        return { success: true, message: 'URL opened in Chrome' };
      } else {
        // If Chrome is not found, fallback to default browser
        console.log('Chrome not found, falling back to default browser');
        await shell.openExternal(url);
        return { success: true, message: 'URL opened in default browser (Chrome not found)' };
      }
    } catch (error) {
      console.error('Error opening URL in Chrome:', error);
      // Attempt to open in default browser as fallback
      try {
        await shell.openExternal(url);
        return { success: true, message: 'URL opened in default browser (fallback)' };
      } catch (fallbackError) {
        console.error('Error opening URL in default browser:', fallbackError);
        return { success: false, error: error.message };
      }
    }
  });

  // Auto backup related handlers
  ipcMain.handle('setup-auto-backup', async () => {
    try {
      store.set('auto-backup-enabled', true);
      setupAutoBackup();
      return { success: true };
    } catch (error) {
      console.error('Error setting up auto backup:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('disable-auto-backup', async () => {
    try {
      store.set('auto-backup-enabled', false);
      
      if (autoBackupInterval) {
        clearInterval(autoBackupInterval);
        autoBackupInterval = null;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error disabling auto backup:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('get-auto-backup-status', () => {
    return {
      enabled: store.get('auto-backup-enabled') || false,
      directory: store.get('backup-directory') || app.getPath('documents')
    };
  });
  
  ipcMain.handle('get-backup-directory', () => {
    return store.get('backup-directory') || app.getPath('documents');
  });
  
  ipcMain.handle('set-backup-directory', async (event, directory) => {
    try {
      // Verify the directory exists
      if (!fs.existsSync(directory)) {
        return { success: false, error: 'Directory does not exist' };
      }
      
      store.set('backup-directory', directory);
      return { success: true };
    } catch (error) {
      console.error('Error setting backup directory:', error);
      return { success: false, error: error.message };
    }
  });
}

// In this file you can include the rest of your app's specific main process code. 