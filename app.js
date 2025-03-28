console.log('app.js loaded successfully at:', new Date().toLocaleTimeString());

// Simple console log to verify script loading
console.log('App.js loaded successfully');

// Function to close all modals and popups
function closeAllModalsAndPopups() {
    console.log('Closing all modals and popups');
    
    // Remove any modal elements
    document.querySelectorAll('.modal, .modal-overlay, [class*="modal"], [class*="popup"], [class*="overlay"], .save-current-layout-container, .template-modal, [id*="template"]').forEach(el => {
        if (el.style) {
            el.style.display = 'none';
        }
        // Try to remove from DOM after a short delay
        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 10);
    });
    
    // Specifically target the template popup seen in the screenshot
    document.querySelectorAll('[id*="use-template"], [class*="template"], .save-current-layout-container').forEach(el => {
        if (el.style) {
            el.style.display = 'none';
        }
        // Try to remove from DOM
        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 10);
    });
}

// Create a MutationObserver to watch for and remove any template popups that might be added to the DOM
function setupPopupObserver() {
    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };
    
    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check each added node
                mutation.addedNodes.forEach(node => {
                    // If it's an Element (not a text node)
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if it's a modal or template-related element
                        if (node.classList && (
                            node.classList.contains('modal') || 
                            node.classList.contains('modal-overlay') ||
                            node.classList.contains('template-modal') ||
                            node.classList.contains('save-current-layout-container') ||
                            (node.id && node.id.includes('template')) ||
                            (node.className && node.className.includes('template'))
                        )) {
                            // Only remove if it wasn't triggered by a user action
                            if (!window.isUserInitiatedAction) {
                                console.log('Auto-removing popup:', node);
                                if (node.style) {
                                    node.style.display = 'none';
                                }
                                setTimeout(() => {
                                    if (node.parentNode) {
                                        node.parentNode.removeChild(node);
                                    }
                                }, 0);
                            }
                        }
                        
                        // Also check children for any matching elements
                        const templateElements = node.querySelectorAll('.modal, .modal-overlay, .template-modal, .save-current-layout-container, [id*="template"], [class*="template"]');
                        if (templateElements.length > 0 && !window.isUserInitiatedAction) {
                            templateElements.forEach(el => {
                                console.log('Auto-removing popup child:', el);
                                if (el.style) {
                                    el.style.display = 'none';
                                }
                                setTimeout(() => {
                                    if (el.parentNode) {
                                        el.parentNode.removeChild(el);
                                    }
                                }, 0);
                            });
                        }
                    }
                });
            }
        }
    };
    
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, config);
    
    console.log('Popup observer initialized');
    
    return observer;
}

// Set up click tracking to know when actions are user-initiated
document.addEventListener('click', function() {
    window.isUserInitiatedAction = true;
    // Reset after a short delay
    setTimeout(function() {
        window.isUserInitiatedAction = false;
    }, 300);
});

// Modify the DOMContentLoaded event to include the observer setup
document.addEventListener('DOMContentLoaded', () => {
    // Set initial state for user actions
    window.isUserInitiatedAction = false;
    
    // Close all modals immediately
    closeAllModalsAndPopups();
    
    // Set up observer to watch for and remove unwanted popups
    const popupObserver = setupPopupObserver();
    
    // Also after a short delay to catch any that appear during initialization
    setTimeout(closeAllModalsAndPopups, 100);
    setTimeout(closeAllModalsAndPopups, 500);
    setTimeout(closeAllModalsAndPopups, 1000);
    
    console.log('DOM fully loaded');
    
    // Initialize the sidebar navigation
    initNavigation();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize settings functionality
    initSettings();
    
    // Initialize Time Blocking
    initTimeBlocking();
    
    // Initialize Pomodoro Timer
    initPomodoro();
    
    // Initialize Focus Mode
    initFocusMode();
    
    // Initialize Keyboard Shortcuts
    initKeyboardShortcuts();
    
    // Initialize Quick Add
    initQuickAdd();
    
    // Initialize Tasks and Task Form
    initTasks();
    initTaskForm();
    
    // Initialize Analytics
    initAnalytics();
    
    // Initialize Reminders
    initReminders();
    
    // Initialize Animations
    initAnimations();
    
    // Initialize Data Management
    initDataManagement();
    
    // Initialize Goals - we've modified this to ensure it doesn't show popups on startup
    initGoals();
    
    // Close all modals again after Goals initialization
    setTimeout(closeAllModalsAndPopups, 0);
    
    // Initialize Workflows
    initWorkflows();
    
    // Initialize Achievements
    initAchievements();
    
    // Initialize Break Reminders
    initBreakReminders();
    
    // Initialize Export Options
    initExportOptions();
    
    // Initialize Productivity Trends
    initProductivityTrends();
    
    // Initialize Task Dependencies
    initTaskDependencies();
    
    // Initialize Onboarding
    initOnboarding();
    
    // Initialize YouTube Manager and Notes (imported from separate files)
    if (typeof initYouTubeManager === 'function') {
        initYouTubeManager();
    }
    
    if (typeof initNotes === 'function') {
        initNotes();
    }
    
    // Final check for any popups
    setTimeout(closeAllModalsAndPopups, 1500);
});

// Initialize navigation
function initNavigation() {
    console.log('Initializing navigation...');
    
    // Get all nav items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`Found ${navItems.length} navigation items`);
    
    // Add click event to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Nav item clicked');
            
            // Get the section to show
            const sectionId = this.getAttribute('data-section');
            console.log(`Section ID: ${sectionId}`);
            
            // Hide all sections first
            const allSections = document.querySelectorAll('.section-content, .dashboard-content');
            allSections.forEach(section => {
                section.style.display = 'none';
                console.log(`Hidden section: ${section.id}`);
            });
            
            // Show the selected section
            // Check if sectionId already ends with "-section" to avoid duplication
            const targetSectionId = sectionId.endsWith('-section') ? sectionId : sectionId + '-section';
            const targetSection = document.getElementById(targetSectionId);
            
            if (targetSection) {
                console.log(`Found target section: ${targetSection.id}`);
                
                if (sectionId === 'dashboard') {
                    targetSection.style.display = 'grid';
                } else if (['tasks', 'reminders', 'analytics', 'settings', 'goals'].includes(sectionId)) {
                    targetSection.style.display = 'grid';
                } else {
                    targetSection.style.display = 'block';
                }
                
                console.log(`Set display style to: ${targetSection.style.display}`);
                
                // Execute section-specific refresh functions if they exist
                if (sectionId === 'pomodoro-section' && typeof refreshPomodoroUI === 'function') {
                    refreshPomodoroUI();
                }
            } else {
                console.error(`Target section not found: ${targetSectionId}`);
            }
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            console.log('Updated active state');
        });
    });
    
    // Initialize with dashboard view
    const dashboardItem = document.querySelector('.nav-item[data-section="dashboard"]');
    if (dashboardItem) {
        dashboardItem.classList.add('active');
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.style.display = 'grid';
            console.log('Initialized dashboard view');
        }
    }
}

// Initialize theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        
        // Set initial toggle state
        updateThemeToggleIcon(themeToggle, savedTheme);
        
        // Add click event
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }
}

// Initialize settings
function initSettings() {
    // Get DOM elements
    const themeOptions = document.querySelectorAll('input[name="theme"]');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const compactModeToggle = document.getElementById('compact-mode');
    const desktopNotificationsToggle = document.getElementById('desktop-notifications');
    const notificationSoundToggle = document.getElementById('notification-sound');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const increaseFontBtn = document.getElementById('increase-font');
    const fontSizeDisplay = document.getElementById('font-size-display');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // Get data management buttons
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    const clearDataBtn = document.getElementById('clear-data');
    
    // Set initial values from localStorage
    const theme = localStorage.getItem('theme') || 'light';
    themeOptions.forEach(option => {
        if (option.value === theme) {
            option.checked = true;
        }
    });
    
    // Apply theme on initialization
    applyTheme(theme);
    
    sidebarToggle.checked = localStorage.getItem('sidebarVisible') !== 'false';
    compactModeToggle.checked = localStorage.getItem('compactMode') === 'true';
    desktopNotificationsToggle.checked = localStorage.getItem('desktopNotifications') !== 'false';
    notificationSoundToggle.checked = localStorage.getItem('notificationSound') === 'true';
    
    // Set font size
    const fontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    setFontSize(fontSize);
    
    // Set active color
    const accentColor = localStorage.getItem('accentColor') || 'purple';
    colorOptions.forEach(option => {
        if (option.dataset.color === accentColor) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Apply accent color
    applyAccentColor(accentColor);
    
    // Event listener for theme change
    themeOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                const theme = this.value;
                localStorage.setItem('theme', theme);
                applyTheme(theme);
            }
        });
    });
    
    // Event listener for sidebar toggle
    sidebarToggle.addEventListener('change', function() {
        const isVisible = this.checked;
        localStorage.setItem('sidebarVisible', isVisible);
        
        const appContainer = document.querySelector('.app-container');
        if (isVisible) {
            appContainer.classList.remove('sidebar-hidden');
        } else {
            appContainer.classList.add('sidebar-hidden');
        }
    });
    
    // Event listener for compact mode
    compactModeToggle.addEventListener('change', function() {
        const isCompact = this.checked;
        localStorage.setItem('compactMode', isCompact);
        
        if (isCompact) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    });
    
    // Event listener for desktop notifications
    desktopNotificationsToggle.addEventListener('change', function() {
        const enabled = this.checked;
        localStorage.setItem('desktopNotifications', enabled);
        
        if (enabled && 'Notification' in window) {
            Notification.requestPermission();
        }
    });
    
    // Event listener for notification sound
    notificationSoundToggle.addEventListener('change', function() {
        const enabled = this.checked;
        localStorage.setItem('notificationSound', enabled);
    });
    
    // Event listeners for font size
    decreaseFontBtn.addEventListener('click', function() {
        const currentSize = parseInt(localStorage.getItem('fontSize')) || 100;
        const newSize = Math.max(70, currentSize - 10);
        setFontSize(newSize);
    });
    
    increaseFontBtn.addEventListener('click', function() {
        const currentSize = parseInt(localStorage.getItem('fontSize')) || 100;
        const newSize = Math.min(150, currentSize + 10);
        setFontSize(newSize);
    });
    
    // Event listeners for color options
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all color options
            colorOptions.forEach(o => o.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
            
            // Get color from data attribute
            const color = this.dataset.color;
            
            // Apply the accent color
            applyAccentColor(color);
        });
    });
    
    // Event listener for export data
    exportDataBtn.addEventListener('click', exportData);
    
    // Event listener for import data
    importDataBtn.addEventListener('click', function() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Trigger click event
        fileInput.click();
        
        // Listen for file selection
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        importData(e.target.result);
                    } catch (error) {
                        showToast('Invalid data file', 'error');
                    }
                };
                reader.readAsText(file);
            }
            
            // Remove the file input
            document.body.removeChild(fileInput);
        });
    });
    
    // Event listener for clear data
    clearDataBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
            clearData();
        }
    });
    
    function setFontSize(size) {
        localStorage.setItem('fontSize', size);
        fontSizeDisplay.textContent = size + '%';
        document.documentElement.style.fontSize = (size / 100) * 16 + 'px';
    }
    
    function exportData() {
        // Collect all data from localStorage
        const data = {};
        
        // Get all data that should be exported
        const keysToExport = [
            'tasks',
            'reminders',
            'youtubeLinks',
            'youtubeCategories',
            'scheduledItems',
            'pomodoroSettings',
            'pomodoroStats'
        ];
        
        // Add each key to the data object
        keysToExport.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch (e) {
                    data[key] = value;
                }
            }
        });
        
        // Add export metadata
        data.exportDate = new Date().toISOString();
        data.appVersion = '1.0.0';
        
        // Convert to JSON string
        const jsonString = JSON.stringify(data, null, 2);
        
        // Create a blob and download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-progress-export-${formatDateForFilename(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showToast('Data exported successfully', 'success');
    }
    
    function importData(jsonString) {
        try {
            // Parse the JSON data
            const data = JSON.parse(jsonString);
            
            // Validate the data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // Check for app version compatibility
            const appVersion = data.appVersion || '1.0.0';
            // In a real app, you would check version compatibility here
            
            // Import data for each key
            Object.keys(data).forEach(key => {
                // Skip metadata
                if (key === 'exportDate' || key === 'appVersion') {
                    return;
                }
                
                // Store the data in localStorage
                if (data[key] !== undefined) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
            });
            
            // Show success message
            showToast('Data imported successfully', 'success');
            
            // Reload page to refresh all data
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Import error:', error);
            showToast('Error importing data', 'error');
        }
    }
    
    function clearData() {
        // List of keys to clear
        const keysToClear = [
            'tasks',
            'reminders',
            'youtubeLinks',
            'youtubeCategories',
            'scheduledItems',
            'pomodoroSettings',
            'pomodoroStats'
        ];
        
        // Clear each key
        keysToClear.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Show success message
        showToast('All data has been cleared', 'success');
        
        // Reload page to refresh all data
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    function formatDateForFilename(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add toast to body
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Helper function to toggle theme
function toggleTheme() {
    // Toggle theme
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    
    // Apply the theme
    applyTheme(newTheme);
    
    // Update all theme-related UI
    updateAllThemeToggles(newTheme);
}

// Helper function to apply theme
function applyTheme(theme) {
    // Apply theme to body
    document.body.classList.toggle('dark-theme', theme === 'dark');
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    // Apply accent color from localStorage
    const accentColor = localStorage.getItem('accentColor') || 'purple';
    applyAccentColor(accentColor);
    
    console.log(`Applied theme: ${theme}`);
}

// Helper function to apply accent color
function applyAccentColor(color) {
    // Valid color options
    const validColors = ['purple', 'blue', 'green', 'orange', 'red'];
    
    // Default to purple if not valid
    if (!validColors.includes(color)) {
        color = 'purple';
    }
    
    // Save preference
    localStorage.setItem('accentColor', color);
    
    // Apply CSS variables based on selected color
    const root = document.documentElement;
    switch (color) {
        case 'purple':
            root.style.setProperty('--accent-color', '#8b5cf6');
            root.style.setProperty('--accent-color-hover', '#7c3aed');
            root.style.setProperty('--accent-color-rgb', '139, 92, 246');
            root.style.setProperty('--primary-color', '#7a5af8');
            root.style.setProperty('--primary-color-hover', '#6246ea');
            break;
        case 'blue':
            root.style.setProperty('--accent-color', '#3b82f6');
            root.style.setProperty('--accent-color-hover', '#2563eb');
            root.style.setProperty('--accent-color-rgb', '59, 130, 246');
            root.style.setProperty('--primary-color', '#3b82f6');
            root.style.setProperty('--primary-color-hover', '#2563eb');
            break;
        case 'green':
            root.style.setProperty('--accent-color', '#10b981');
            root.style.setProperty('--accent-color-hover', '#059669');
            root.style.setProperty('--accent-color-rgb', '16, 185, 129');
            root.style.setProperty('--primary-color', '#10b981');
            root.style.setProperty('--primary-color-hover', '#059669');
            break;
        case 'orange':
            root.style.setProperty('--accent-color', '#f97316');
            root.style.setProperty('--accent-color-hover', '#ea580c');
            root.style.setProperty('--accent-color-rgb', '249, 115, 22');
            root.style.setProperty('--primary-color', '#f97316');
            root.style.setProperty('--primary-color-hover', '#ea580c');
            break;
        case 'red':
            root.style.setProperty('--accent-color', '#ef4444');
            root.style.setProperty('--accent-color-hover', '#dc2626');
            root.style.setProperty('--accent-color-rgb', '239, 68, 68');
            root.style.setProperty('--primary-color', '#ef4444');
            root.style.setProperty('--primary-color-hover', '#dc2626');
            break;
    }
    
    console.log(`Applied accent color: ${color}`);
}

// Helper function to update theme toggle icon
function updateThemeToggleIcon(toggleElement, theme) {
    if (toggleElement) {
        toggleElement.innerHTML = theme === 'dark' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    }
}

// Helper function to update all theme toggles
function updateAllThemeToggles(theme) {
    // Update sidebar toggle
    const sidebarToggle = document.getElementById('theme-toggle');
    updateThemeToggleIcon(sidebarToggle, theme);
    
    // Update settings radio buttons
    const themeToggleLight = document.getElementById('theme-light');
    const themeToggleDark = document.getElementById('theme-dark');
    
    if (themeToggleLight && themeToggleDark) {
        themeToggleLight.checked = theme === 'light';
        themeToggleDark.checked = theme === 'dark';
    }
}

// Initialize Time Blocking
function initTimeBlocking() {
    const schedulerGrid = document.getElementById('scheduler-grid');
    const addTimeBlockBtn = document.getElementById('add-time-block');
    const todayBtn = document.getElementById('today-btn');
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const currentDateSpan = document.getElementById('current-date');

    // Generate time slots
    function generateTimeSlots() {
        schedulerGrid.innerHTML = '';
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.hour = hour;
            timeSlot.addEventListener('dragover', handleDragOver);
        }
    }
}

// Initialize Reminders
function initReminders() {
    console.log('Initializing reminders...');
    
    // Check if the specialized recurring.js file is loaded
    if (typeof initRecurringReminders === 'function') {
        // Initialize advanced recurring functionality from the external file
        console.log('Advanced recurring reminders functionality available');
    } else {
        console.log('Basic reminders functionality initialized');
        // Basic reminders functionality if recurring.js is not loaded
        setupBasicReminders();
    }
}

// Basic reminders setup as a fallback if recurring.js is not loaded
function setupBasicReminders() {
    const addReminderBtn = document.getElementById('add-reminder-btn');
    const reminderFilter = document.getElementById('reminder-filter');
    
    if (addReminderBtn) {
        addReminderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('reminder-title').value.trim();
            const datetime = document.getElementById('reminder-datetime').value;
            const notification = document.getElementById('reminder-notification').checked;
            
            if (!title) {
                showToast('Please enter a reminder description', 'error');
                return;
            }
            
            if (!datetime) {
                showToast('Please select a date and time', 'error');
                return;
            }
            
            const reminder = {
                id: Date.now().toString(),
                title: title,
                datetime: datetime,
                notification: notification,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
            reminders.push(reminder);
            localStorage.setItem('reminders', JSON.stringify(reminders));
            
            // Reset form
            document.getElementById('reminder-title').value = '';
            document.getElementById('reminder-datetime').value = '';
            
            // Show success message
            showToast('Reminder added successfully', 'success');
            
            // Refresh reminders list
            loadReminders();
        });
    }
    
    if (reminderFilter) {
        reminderFilter.addEventListener('change', loadReminders);
    }
    
    // Initial load of reminders
    loadReminders();
    
    function loadReminders() {
        const reminderList = document.getElementById('reminder-list');
        const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        const filterValue = reminderFilter ? reminderFilter.value : 'all';
        
        if (!reminderList) return;
        
        // Clear current list
        reminderList.innerHTML = '';
        
        // Filter reminders
        let filteredReminders = reminders;
        const now = new Date();
        
        if (filterValue === 'upcoming') {
            filteredReminders = reminders.filter(reminder => new Date(reminder.datetime) >= now);
        } else if (filterValue === 'past') {
            filteredReminders = reminders.filter(reminder => new Date(reminder.datetime) < now);
        }
        
        // Sort by date (upcoming first)
        filteredReminders.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        // Display empty state if no reminders
        if (filteredReminders.length === 0) {
            reminderList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-bell-slash"></i>
                    <p>No reminders to display</p>
                    <p class="empty-state-description">Add a new reminder to get started</p>
                </div>
            `;
            return;
        }
        
        // Display reminders
        filteredReminders.forEach(reminder => {
            const reminderDate = new Date(reminder.datetime);
            const isPast = reminderDate < now;
            
            // Format date/time
            const formattedDate = reminderDate.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
            const formattedTime = reminderDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            
            const reminderEl = document.createElement('div');
            reminderEl.className = `reminder-item ${isPast ? 'past' : ''}`;
            reminderEl.innerHTML = `
                <div class="reminder-icon">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="reminder-content">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-datetime">
                        <i class="fa-solid fa-calendar"></i>
                        <span>${formattedDate}</span>
                        <i class="fa-solid fa-clock"></i>
                        <span>${formattedTime}</span>
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="reminder-action-btn delete" data-id="${reminder.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            
            reminderList.appendChild(reminderEl);
        });
        
        // Add delete event listeners
        document.querySelectorAll('.reminder-action-btn.delete').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const reminderId = this.getAttribute('data-id');
                
                // Remove from storage
                let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
                reminders = reminders.filter(r => r.id !== reminderId);
                localStorage.setItem('reminders', JSON.stringify(reminders));
                
                // Refresh the list
                loadReminders();
                
                // Show success message
                showToast('Reminder deleted successfully', 'success');
            });
        });
    }
}

// Initialize Analytics
function initAnalytics() {
    // Analytics initialization code
}

// Initialize Pomodoro
function initPomodoro() {
    // We now use the implementation from pomodoro.js
    if (typeof window.initPomodoro === 'function') {
        window.initPomodoro();
    } else {
        console.warn('Pomodoro implementation not found.');
    }
}

// Initialize Tasks
function initTasks() {
    // Tasks initialization code
}

/**
 * Update the Pomodoro counter when statistics change
 */
function updatePomodoroStats() {
    const todaySessions = document.getElementById('today-sessions');
    const todayMinutes = document.getElementById('today-minutes');
    
    if (!todaySessions || !todayMinutes) return;
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get pomodoro stats from localStorage
    const pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats') || '[]');
    
    // Filter for today's sessions
    const todayStats = pomodoroStats.filter(session => 
        session.date.startsWith(today)
    );
    
    // Update UI
    todaySessions.textContent = todayStats.length;
    
    // Calculate total focus minutes
    const totalMinutes = todayStats.reduce((total, session) => 
        total + (session.duration || 0), 0);
    
    todayMinutes.textContent = `${totalMinutes}m`;
    
    // Update pomodoro counter if the function exists
    if (typeof updatePomodoroCounter === 'function') {
        updatePomodoroCounter();
    }
}

/**
 * Initialize animations throughout the application
 */
function initAnimations() {
    // Apply entrance animations to dashboard cards
    applyDashboardAnimations();
    
    // Add animation classes to interactive elements
    enhanceInteractiveElements();
    
    // Set up modal animations
    setupModalAnimations();
    
    // Add section transition animations
    setupSectionTransitions();
}

/**
 * Apply staggered entrance animations to dashboard cards
 */
function applyDashboardAnimations() {
    const dashboardCards = document.querySelectorAll('.card, .statistics-card, .analytics-card');
    
    dashboardCards.forEach((card, index) => {
        // Add index as CSS variable for staggered animation
        card.style.setProperty('--index', index);
        card.classList.add('dashboard-card');
    });
}

/**
 * Enhance interactive elements with animation classes
 */
function enhanceInteractiveElements() {
    // Add hover animations to buttons that don't already have them
    const buttons = document.querySelectorAll('button:not(.no-animation), .btn:not(.no-animation)');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.classList.add('active');
        });
        
        button.addEventListener('mouseup mouseleave', function() {
            this.classList.remove('active');
        });
    });
    
    // Add animation to task completion
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const taskItem = this.closest('.task-item');
                if (taskItem) {
                    taskItem.classList.add('task-complete');
                    
                    // Remove the animation class after animation completes
                    setTimeout(() => {
                        taskItem.classList.remove('task-complete');
                    }, 500);
                }
            }
        });
    });
    
    // Add transitions to sidebar nav items
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.classList.add('nav-item');
    });
}

/**
 * Set up animations for modal opening and closing
 */
function setupModalAnimations() {
    // Store the original close modal function to override
    const originalCloseModal = window.closeModal;
    
    // Override closeModal function to add animations
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            
            // Add closing animations
            modal.classList.add('closing');
            if (modalContent) {
                modalContent.classList.add('closing');
            }
            
            // Actually close the modal after animation completes
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('closing');
                if (modalContent) {
                    modalContent.classList.remove('closing');
                }
            }, 300);
        }
    };
}

/**
 * Set up section transition animations when switching tabs
 */
function setupSectionTransitions() {
    // Store the original section switching function to override
    const originalShowSection = window.showSection;
    
    // Override showSection function to add animations
    window.showSection = function(sectionId) {
        // Get all sections
        const sections = document.querySelectorAll('.section');
        const targetSection = document.getElementById(sectionId);
        
        if (!targetSection) return;
        
        // Hide current section with exit animation
        sections.forEach(section => {
            if (section.classList.contains('active')) {
                section.classList.add('section-transition', 'section-exit');
                
                setTimeout(() => {
                    section.classList.remove('active');
                    section.classList.remove('section-transition', 'section-exit');
                }, 300);
            }
        });
        
        // Show target section with entrance animation
        setTimeout(() => {
            targetSection.classList.add('section-transition', 'section-enter');
            targetSection.classList.add('active');
            
            setTimeout(() => {
                targetSection.classList.remove('section-enter');
                
                setTimeout(() => {
                    targetSection.classList.remove('section-transition');
                }, 300);
            }, 10);
        }, 300);
        
        // Update active menu item
        const menuItems = document.querySelectorAll('.sidebar-nav a');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });
    };
}

/**
 * Refresh the Pomodoro UI when the section is shown
 */
function refreshPomodoroUI() {
    console.log('Refreshing Pomodoro UI');
    // Update stats and display current timer state
    if (typeof updateStats === 'function') updateStats();
    if (typeof displaySessionHistory === 'function') displaySessionHistory();
}

// Task form global handlers
function handleAddTaskClick() {
    console.log('Add Task button clicked via global handler');
    openTaskForm();
}

function openTaskForm() {
    console.log('Opening task form');
    // Reset form
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.reset();
        document.getElementById('task-id').value = '';
    }
    
    // Show modal
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Focus on description field
        const descField = document.getElementById('task-description');
        if (descField) {
            setTimeout(() => descField.focus(), 100);
        }
    } else {
        console.error('Task form modal not found');
    }
}

function closeTaskForm() {
    console.log('Closing task form');
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make sure form submission is handled
document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTask();
        });
    }
    
    // Also add click handler for modal background
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTaskForm();
            }
        });
    }
});

function saveTask() {
    try {
        console.log('Saving task...');
        
        // Get form values
        const taskId = document.getElementById('task-id').value;
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const dueDateStr = document.getElementById('task-due-date').value;
        const dueTimeStr = document.getElementById('task-due-time').value;
        const notes = document.getElementById('task-notes').value.trim();
        
        // Validate required fields
        if (!description) {
            alert('Please enter a task description');
            return;
        }
        
        // Create due date if provided
        let dueDate = null;
        if (dueDateStr) {
            dueDate = new Date(dueDateStr);
            
            // Add time if provided
            if (dueTimeStr) {
                const [hours, minutes] = dueTimeStr.split(':').map(Number);
                dueDate.setHours(hours, minutes);
            } else {
                // Default to end of day
                dueDate.setHours(23, 59, 59);
            }
        }
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Create task object
        if (taskId) {
            // Update existing task
            const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
            
            if (taskIndex !== -1) {
                // Preserve completion status and creation date
                const completed = tasks[taskIndex].completed || false;
                const createdAt = tasks[taskIndex].createdAt;
                
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    description,
                    priority,
                    category: category || null,
                    dueDate: dueDate ? dueDate.toISOString() : null,
                    notes: notes || null,
                    completed,
                    createdAt,
                    updatedAt: new Date().toISOString()
                };
                
                console.log('Task updated:', tasks[taskIndex]);
                alert('Task updated successfully');
            }
        } else {
            // Create new task
            const newTask = {
                id: Date.now().toString(),
                description,
                priority,
                category: category || null,
                dueDate: dueDate ? dueDate.toISOString() : null,
                notes: notes || null,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            console.log('New task added:', newTask);
            alert('Task added successfully');
        }
        
        // Save tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Close form
        closeTaskForm();
        
        // Update task list display
        if (typeof loadAndDisplayTasks === 'function') {
            loadAndDisplayTasks();
        } else if (typeof displayTasks === 'function') {
            displayTasks();
        } else {
            console.warn('No task display function found, refresh might be needed');
            // Force page refresh as a last resort
            window.location.reload();
        }
        
        return true;
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task: ' + error.message);
        return false;
    }
}

// Quick Add Task Form Functions
function toggleQuickAddForm() {
    console.log('toggleQuickAddForm called');
    const form = document.getElementById('quick-add-task-form');
    console.log('Form element found:', form);
    
    if (!form) {
        console.error('CRITICAL ERROR: Quick add task form not found in DOM');
        // Try to find the task section first to make sure we're on the right page
        const taskSection = document.getElementById('tasks-section');
        console.log('Tasks section found:', taskSection);
        return;
    }
    
    const currentDisplay = window.getComputedStyle(form).display;
    console.log('Current form display style:', currentDisplay);
    
    if (currentDisplay === 'none' || currentDisplay === '') {
        console.log('Showing quick add form');
        
        // Clean up any previous form state first
        cleanupTaskForm();
        
        // Now display the form
        form.style.display = 'block';
        
        // Focus on description field with a delay
        const descField = document.getElementById('quick-task-description');
        if (descField) {
            console.log('Setting focus to description field');
            // Clear any existing value first
            descField.value = '';
            
            // Use a longer delay to ensure the input is fully rendered
            setTimeout(() => {
                console.log('Attempting to focus input field now');
                descField.focus();
                
                // Verify focus was applied
                setTimeout(() => {
                    console.log('Input field focused:', document.activeElement === descField);
                    
                    // If focus failed, try again
                    if (document.activeElement !== descField) {
                        console.log('Focus failed, trying again');
                        descField.click();
                        descField.focus();
                    }
                }, 100);
            }, 200);
        } else {
            console.error('Description field not found in quick add form');
        }
    } else {
        console.log('Hiding quick add form');
        form.style.display = 'none';
        
        // Clean up form state when hiding
        cleanupTaskForm();
    }
}

// Helper function to reset task form to a clean state
function cleanupTaskForm() {
    console.log('Cleaning up task form state');
    
    // Reset the form
    const taskForm = document.getElementById('inline-task-form');
    if (taskForm) {
        // Reset all form fields
        taskForm.reset();
        
        // Clear any editing task ID
        delete taskForm.dataset.editingTaskId;
        window.editingTaskId = null;
        
        // Reset to default submission handler
        taskForm.onsubmit = function(e) {
            return addTaskQuick(e);
        };
        
        // Reset submit button text
        const saveButton = taskForm.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.textContent = 'Save Task';
        }
    }
    
    // Clear individual fields to be extra safe
    const descField = document.getElementById('quick-task-description');
    const notesField = document.getElementById('quick-task-notes');
    if (descField) descField.value = '';
    if (notesField) notesField.value = '';
}

function addTaskQuick(event) {
    event.preventDefault();
    
    try {
        console.log('Adding task via quick form...');
        
        // Get form values
        const descriptionInput = document.getElementById('quick-task-description');
        if (!descriptionInput) {
            console.error('CRITICAL ERROR: quick-task-description input not found');
            alert('Error: Task description field not found. Please try again.');
            return false;
        }
        
        console.log('Description input element:', descriptionInput);
        console.log('Description input value:', descriptionInput.value);
        
        const description = descriptionInput.value.trim();
        const notes = document.getElementById('quick-task-notes')?.value.trim() || '';
        const priority = document.getElementById('quick-task-priority')?.value || 'medium';
        const category = document.getElementById('quick-task-category')?.value || '';
        const dueDateStr = document.getElementById('quick-task-due-date')?.value || '';
        
        // Debug info
        console.log('Task values:', {
            description,
            notes,
            priority,
            category,
            dueDateStr
        });
        
        // Validate required fields
        if (!description) {
            alert('Please enter a task description');
            // Try to focus the field again
            descriptionInput.focus();
            return false;
        }
        
        // Create due date if provided
        let dueDate = null;
        if (dueDateStr) {
            dueDate = new Date(dueDateStr);
            // Set to end of day
            dueDate.setHours(23, 59, 59);
        }
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Create new task
        const newTask = {
            id: Date.now().toString(),
            description,
            notes: notes || null,
            priority,
            category: category || null,
            dueDate: dueDate ? dueDate.toISOString() : null,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to array
        tasks.push(newTask);
        
        // Save back to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        console.log('Task added successfully:', newTask);
        
        // Reset form
        document.getElementById('inline-task-form').reset();
        
        // Close form
        toggleQuickAddForm();
        
        // Update UI
        loadTasks();
        
        // Show success message
        alert('Task added successfully!');
        
        return false; // Prevent form submission
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task: ' + error.message);
        return false;
    }
}

// Direct Task Loading Function
function loadTasks() {
    // Get task list container
    const taskList = document.querySelector('.task-list');
    if (!taskList) {
        console.error('Task list container not found');
        return;
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Clear existing content
    taskList.innerHTML = '';
    
    // Check if there are no tasks
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-tasks"></i>
                <p>No tasks yet</p>
                <p class="empty-state-description">Create your first task to get started!</p>
            </div>
        `;
        
        // Update counts
        updateTaskCountsBasic();
        return;
    }
    
    // Sort tasks (newest first by default)
    const sortedTasks = [...tasks].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Create task items
    sortedTasks.forEach(task => {
        const taskItem = createTaskItemElement(task);
        taskList.appendChild(taskItem);
    });
    
    // Update counts
    updateTaskCountsBasic();
}

function createTaskItemElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.priority}`;
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    taskItem.dataset.id = task.id;
    
    // Format date if available
    let dateHtml = '';
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const formattedDate = dueDate.toLocaleDateString('en-US', options);
        
        dateHtml = `
            <div class="task-meta-item">
                <i class="fa-solid fa-calendar"></i>
                <span>Due: ${formattedDate}</span>
            </div>
        `;
    }
    
    // Format category if available
    let categoryHtml = '';
    if (task.category) {
        categoryHtml = `<div class="task-category">${task.category}</div>`;
    }
    
    // Format notes if available
    let notesHtml = '';
    if (task.notes) {
        notesHtml = `<p class="task-description">${task.notes}</p>`;
    }
    
    taskItem.innerHTML = `
        <div class="task-checkbox" data-task-id="${task.id}">
            <i class="fa-solid fa-check"></i>
        </div>
        <div class="task-content">
            <h3 class="task-title">${task.description}</h3>
            ${notesHtml}
            <div class="task-meta">
                ${dateHtml}
                ${categoryHtml}
            </div>
        </div>
        <div class="task-actions">
            <button class="task-action-btn edit" data-task-id="${task.id}">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="task-action-btn delete" data-task-id="${task.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add direct event listener for task completion
    const checkbox = taskItem.querySelector('.task-checkbox');
    if (checkbox) {
        checkbox.addEventListener('click', function() {
            toggleTaskCompletion(task.id);
        });
    }
    
    return taskItem;
}

function toggleTaskCompletion(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reload tasks
        loadTasks();
    }
}

function deleteTaskBasic(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const newTasks = tasks.filter(t => t.id.toString() !== taskId.toString());
        
        localStorage.setItem('tasks', JSON.stringify(newTasks));
        
        // Reload tasks
        loadTasks();
    }
}

function updateTaskCountsBasic() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // All tasks count
    const allCount = document.getElementById('all-count');
    if (allCount) {
        allCount.textContent = tasks.length;
    }
    
    // Today count
    const todayCount = document.getElementById('today-count');
    if (todayCount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayTasks = tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate >= today && taskDate < tomorrow;
        });
        
        todayCount.textContent = todayTasks.length;
    }
    
    // Upcoming count
    const upcomingCount = document.getElementById('upcoming-count');
    if (upcomingCount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate >= today;
        });
        
        upcomingCount.textContent = upcomingTasks.length;
    }
    
    // Completed count
    const completedCount = document.getElementById('completed-view-count');
    if (completedCount) {
        const completedTasks = tasks.filter(task => task.completed);
        completedCount.textContent = completedTasks.length;
    }
    
    // Summary counts
    const pendingCount = document.getElementById('pending-count');
    const completedSummaryCount = document.getElementById('completed-count');
    
    if (pendingCount) {
        const pendingTasks = tasks.filter(task => !task.completed);
        pendingCount.textContent = pendingTasks.length;
    }
    
    if (completedSummaryCount) {
        const completedTasks = tasks.filter(task => task.completed);
        completedSummaryCount.textContent = completedTasks.length;
    }
}

// Update the DOMContentLoaded event handler to include a global click handler for edit buttons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize quick form
    const addTaskBtn = document.getElementById('add-task-btn-direct');
    if (addTaskBtn) {
        console.log('Quick Add Task button found');
        // Remove any existing event listeners
        const newBtn = addTaskBtn.cloneNode(true);
        if (addTaskBtn.parentNode) {
            addTaskBtn.parentNode.replaceChild(newBtn, addTaskBtn);
            
            // Add multiple ways to handle the click event
            console.log('Adding click event listener to Add Task button');
            newBtn.addEventListener('click', function(e) {
                console.log('Add Task button clicked directly');
                e.preventDefault();
                toggleQuickAddForm();
            });
        }
    } else {
        console.error('CRITICAL ERROR: Add Task button not found by ID add-task-btn-direct');
    }
    
    // Add a global click handler to catch any task button clicks
    document.addEventListener('click', function(e) {
        // Handle Add Task button clicks
        if (e.target && e.target.closest('#add-task-btn-direct, .btn-primary[id="add-task-btn-direct"]')) {
            console.log('Add Task button clicked via delegation');
            e.preventDefault();
            toggleQuickAddForm();
        }
        
        // Handle Edit button clicks through event delegation
        if (e.target && (e.target.closest('.task-action-btn.edit') || e.target.matches('.fa-pen'))) {
            console.log('Edit button clicked via delegation');
            e.preventDefault();
            
            // Find the task item and get its ID
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                const taskId = taskItem.dataset.id;
                console.log('Editing task ID:', taskId);
                
                // Call editTaskBasic function
                editTaskDirectly(taskId);
            }
        }
        
        // Handle Delete button clicks through event delegation
        if (e.target && (e.target.closest('.task-action-btn.delete') || e.target.matches('.fa-trash'))) {
            console.log('Delete button clicked via delegation');
            e.preventDefault();
            
            // Find the task item and get its ID
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                const taskId = taskItem.dataset.id;
                console.log('Deleting task ID:', taskId);
                
                // Call deleteTaskBasic function
                deleteTaskDirectly(taskId);
            }
        }
    });
    
    // Load tasks
    loadTasks();
});

// Add the editTaskBasic function to handle editing tasks
function editTaskBasic(taskId) {
    console.log('Editing task:', taskId);
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Find the task
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }
    
    // Show the quick add form
    const form = document.getElementById('quick-add-task-form');
    if (!form) {
        console.error('Quick add task form not found');
        return;
    }
    
    // Set form display
    form.style.display = 'block';
    
    // Set form values
    document.getElementById('quick-task-description').value = task.description || '';
    document.getElementById('quick-task-priority').value = task.priority || 'medium';
    document.getElementById('quick-task-category').value = task.category || '';
    
    // Set due date if exists
    const dueDateInput = document.getElementById('quick-task-due-date');
    if (dueDateInput && task.dueDate) {
        // Format date as YYYY-MM-DD for the date input
        const dueDate = new Date(task.dueDate);
        const dateStr = dueDate.toISOString().split('T')[0];
        dueDateInput.value = dateStr;
    } else if (dueDateInput) {
        dueDateInput.value = '';
    }
    
    // Add task ID to the form as a hidden field or data attribute
    const taskForm = document.getElementById('inline-task-form');
    if (taskForm) {
        taskForm.dataset.editTaskId = taskId;
        
        // Change submit handler to update task instead of creating a new one
        taskForm.onsubmit = function(event) {
            return updateTaskQuick(event, taskId);
        };
    }
    
    // Focus on description field
    setTimeout(() => {
        const descField = document.getElementById('quick-task-description');
        if (descField) {
            descField.focus();
        }
    }, 100);
}

// Add function to update existing task
function updateTaskQuick(event, taskId) {
    event.preventDefault();
    
    try {
        console.log('Updating task:', taskId);
        
        // Get form values
        const descriptionInput = document.getElementById('quick-task-description');
        if (!descriptionInput) {
            console.error('CRITICAL ERROR: quick-task-description input not found');
            alert('Error: Task description field not found. Please try again.');
            return false;
        }
        
        const description = descriptionInput.value.trim();
        const notes = document.getElementById('quick-task-notes')?.value.trim() || '';
        const priority = document.getElementById('quick-task-priority')?.value || 'medium';
        const category = document.getElementById('quick-task-category')?.value || '';
        const dueDateStr = document.getElementById('quick-task-due-date')?.value || '';
        
        // Validate required fields
        if (!description) {
            alert('Please enter a task description');
            // Try to focus the field again
            descriptionInput.focus();
            return false;
        }
        
        // Create due date if provided
        let dueDate = null;
        if (dueDateStr) {
            dueDate = new Date(dueDateStr);
            // Set to end of day
            dueDate.setHours(23, 59, 59);
        }
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Find task index
        const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
        
        if (taskIndex === -1) {
            alert('Error: Task not found.');
            return false;
        }
        
        // Preserve creation date and completed status
        const createdAt = tasks[taskIndex].createdAt;
        const completed = tasks[taskIndex].completed;
        
        // Update task
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            description,
            notes: notes || null,
            priority,
            category: category || null,
            dueDate: dueDate ? dueDate.toISOString() : null,
            updatedAt: new Date().toISOString(),
            createdAt,
            completed
        };
        
        // Save to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        console.log('Task updated successfully:', tasks[taskIndex]);
        
        // Reset form
        const taskForm = document.getElementById('inline-task-form');
        if (taskForm) {
            taskForm.reset();
            delete taskForm.dataset.editTaskId;
            
            // Restore original submit handler
            taskForm.onsubmit = function(event) {
                return addTaskQuick(event);
            };
        }
        
        // Close form
        toggleQuickAddForm();
        
        // Reload tasks
        loadTasks();
        
        // Show success message
        alert('Task updated successfully!');
        
        return false; // Prevent form submission
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task: ' + error.message);
        return false;
    }
}

// Direct task edit function that avoids previous issues
function editTaskDirectly(taskId) {
    console.log('editTaskDirectly called for task ID:', taskId);
    
    try {
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Find the task
        const task = tasks.find(t => t.id.toString() === taskId.toString());
        if (!task) {
            console.error('Task not found with ID:', taskId);
            alert('Error: Could not find the task to edit.');
            return;
        }
        
        // Store the current editing task ID globally
        window.editingTaskId = taskId;
        
        // Show the quick add form
        const form = document.getElementById('quick-add-task-form');
        if (!form) {
            console.error('Quick add task form not found');
            alert('Error: Task form not found.');
            return;
        }
        
        console.log('Found task to edit:', task);
        
        // Reset the form first to clear any previous state
        const taskForm = document.getElementById('inline-task-form');
        if (taskForm) {
            taskForm.reset();
        }
        
        // Make sure the form is visible
        form.style.display = 'block';
        
        // Clear and set form values
        const descriptionInput = document.getElementById('quick-task-description');
        const notesInput = document.getElementById('quick-task-notes');
        const prioritySelect = document.getElementById('quick-task-priority');
        const categorySelect = document.getElementById('quick-task-category');
        const dueDateInput = document.getElementById('quick-task-due-date');
        
        // Set field values with a slight delay to ensure form is ready
        setTimeout(() => {
            if (descriptionInput) descriptionInput.value = task.description || '';
            if (notesInput) notesInput.value = task.notes || '';
            if (prioritySelect) prioritySelect.value = task.priority || 'medium';
            if (categorySelect) categorySelect.value = task.category || '';
            
            // Format date for input if exists
            if (dueDateInput && task.dueDate) {
                try {
                    const dueDate = new Date(task.dueDate);
                    const dateStr = dueDate.toISOString().split('T')[0];
                    dueDateInput.value = dateStr;
                } catch (e) {
                    console.error('Error parsing date:', e);
                    dueDateInput.value = '';
                }
            } else if (dueDateInput) {
                dueDateInput.value = '';
            }
            
            // Store the task ID in the form for updating
            if (taskForm) {
                // Store the task ID as a data attribute
                taskForm.dataset.editingTaskId = taskId;
                
                // Change the form submission handler
                const saveButton = taskForm.querySelector('button[type="submit"]');
                if (saveButton) {
                    saveButton.textContent = 'Update Task';
                }
                
                // Create a new function for updating to avoid closure issues
                taskForm.onsubmit = function(event) {
                    return updateTaskDirectly(event);
                };
                
                // Focus on description field
                if (descriptionInput) {
                    descriptionInput.focus();
                    descriptionInput.select();
                }
            }
        }, 50);
        
    } catch (error) {
        console.error('Error in editTaskDirectly:', error);
        alert('An error occurred while editing the task: ' + error.message);
    }
}

// Direct task update function
function updateTaskDirectly(event) {
    event.preventDefault();
    
    try {
        // Get the task ID from the form
        const taskForm = document.getElementById('inline-task-form');
        if (!taskForm) {
            console.error('Task form not found');
            return false;
        }
        
        const taskId = taskForm.dataset.editingTaskId;
        if (!taskId) {
            console.error('No task ID found in the form');
            return false;
        }
        
        console.log('Updating task with ID:', taskId);
        
        // Get form values
        const description = document.getElementById('quick-task-description')?.value.trim() || '';
        const notes = document.getElementById('quick-task-notes')?.value.trim() || '';
        const priority = document.getElementById('quick-task-priority')?.value || 'medium';
        const category = document.getElementById('quick-task-category')?.value || '';
        const dueDateStr = document.getElementById('quick-task-due-date')?.value || '';
        
        // Validate
        if (!description) {
            alert('Please enter a task description');
            document.getElementById('quick-task-description')?.focus();
            return false;
        }
        
        // Parse due date
        let dueDate = null;
        if (dueDateStr) {
            dueDate = new Date(dueDateStr);
            dueDate.setHours(23, 59, 59);
        }
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Find task index
        const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
        if (taskIndex === -1) {
            console.error('Task not found in localStorage');
            alert('Error: Task not found.');
            return false;
        }
        
        // Get existing properties to preserve
        const existingTask = tasks[taskIndex];
        const createdAt = existingTask.createdAt;
        const completed = existingTask.completed;
        
        // Update the task
        tasks[taskIndex] = {
            ...existingTask,
            description,
            notes: notes || null,
            priority,
            category: category || null,
            dueDate: dueDate ? dueDate.toISOString() : null,
            updatedAt: new Date().toISOString(),
            createdAt,
            completed
        };
        
        // Save back to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reset form state completely
        taskForm.reset();
        delete taskForm.dataset.editingTaskId;
        
        // Clear any stored editing state
        window.editingTaskId = null;
        
        // Restore the default form submission handler
        // Create a new function reference to avoid closure issues
        taskForm.onsubmit = function(e) {
            return addTaskQuick(e);
        };
        
        // Change the form submission handler back and button text
        const saveButton = taskForm.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.textContent = 'Save Task';
        }
        
        // Hide the form
        const form = document.getElementById('quick-add-task-form');
        if (form) {
            form.style.display = 'none';
        }
        
        // Reload tasks
        loadTasks();
        
        // Alert success
        alert('Task updated successfully!');
        
        return false;
    } catch (error) {
        console.error('Error in updateTaskDirectly:', error);
        alert('An error occurred while updating the task: ' + error.message);
        return false;
    }
}

// Direct task delete function
function deleteTaskDirectly(taskId) {
    try {
        console.log('deleteTaskDirectly called for task ID:', taskId);
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Filter out the task to delete
        const updatedTasks = tasks.filter(t => t.id.toString() !== taskId.toString());
        
        // Check if a task was actually removed
        if (updatedTasks.length === tasks.length) {
            console.error('Task not found with ID:', taskId);
            alert('Error: Could not find the task to delete.');
            return;
        }
        
        // Save back to localStorage
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Reload tasks
        loadTasks();
        
        // Alert success
        alert('Task deleted successfully!');
        
    } catch (error) {
        console.error('Error in deleteTaskDirectly:', error);
        alert('An error occurred while deleting the task: ' + error.message);
    }
}

// Direct Pomodoro timer control 
document.addEventListener('DOMContentLoaded', function() {
    // Set up global click handler for timer buttons
    document.body.addEventListener('click', function(e) {
        // Check if the click was on a timer button or its child (like an icon)
        let targetElement = e.target;
        
        // Walk up the DOM tree to find if we clicked on or within a timer button
        while (targetElement && targetElement !== document.body) {
            // Check if this is a timer button
            if (targetElement.classList && targetElement.classList.contains('pomodoro-btn')) {
                const action = targetElement.getAttribute('data-action') || '';
                console.log('Timer button clicked:', targetElement, 'Action:', action);
                
                // Handle different actions
                if (action === 'start-timer' || targetElement.id === 'pomodoro-start') {
                    console.log('Starting timer from global handler');
                    if (window.startPomodoro) {
                        window.startPomodoro();
                    }
                    e.preventDefault();
                    return false;
                } else if (action === 'pause-timer' || targetElement.id === 'pomodoro-pause') {
                    if (window.pausePomodoro) window.pausePomodoro();
                    e.preventDefault();
                    return false;
                } else if (action === 'skip-timer' || targetElement.id === 'pomodoro-skip') {
                    if (window.skipPomodoro) window.skipPomodoro();
                    e.preventDefault();
                    return false;
                } else if (action === 'reset-timer' || targetElement.id === 'pomodoro-reset') {
                    if (window.resetPomodoro) window.resetPomodoro();
                    e.preventDefault();
                    return false;
                }
                
                // We found a pomodoro button but no specific action, check for id
                if (targetElement.id === 'pomodoro-start') {
                    console.log('Start button clicked from ID check');
                    if (window.startPomodoro) {
                        window.startPomodoro();
                    }
                    e.preventDefault();
                    return false;
                }
            }
            
            // Move up to parent
            targetElement = targetElement.parentElement;
        }
    }, true); // Using capture phase to ensure we get clicks before any other handlers
    
    // Keyboard shortcuts for timer controls
    document.addEventListener('keydown', function(e) {
        // Only trigger if we're on the pomodoro section
        const pomodoroSection = document.getElementById('pomodoro-section');
        if (pomodoroSection && pomodoroSection.style.display !== 'none') {
            // Space bar to toggle timer (start/pause)
            if (e.key === ' ' || e.code === 'Space') {
                const startBtn = document.getElementById('pomodoro-start');
                const pauseBtn = document.getElementById('pomodoro-pause');
                
                if (startBtn && startBtn.style.display !== 'none') {
                    console.log('Starting timer via spacebar');
                    if (window.startPomodoro) window.startPomodoro();
                } else if (pauseBtn && pauseBtn.style.display !== 'none') {
                    if (window.pausePomodoro) window.pausePomodoro();
                }
                
                e.preventDefault();
            }
            
            // 'S' key to start
            if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.altKey) {
                console.log('Starting timer via S key');
                if (window.startPomodoro) window.startPomodoro();
                e.preventDefault();
            }
            
            // 'P' key to pause
            if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.altKey) {
                if (window.pausePomodoro) window.pausePomodoro();
                e.preventDefault();
            }
            
            // 'R' key to reset
            if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.altKey) {
                if (window.resetPomodoro) window.resetPomodoro();
                e.preventDefault();
            }
        }
    });
    
    // Also try to add direct button functionality when app is loaded
    setTimeout(initializeTimerButtons, 1000);
    setTimeout(initializeTimerButtons, 2000);
    setTimeout(initializeTimerButtons, 5000);
});

function initializeTimerButtons() {
    console.log('Initializing timer buttons directly from app.js');
    
    // Try to find the start button
    const startBtn = document.getElementById('pomodoro-start');
    if (startBtn) {
        // Remove any existing listeners to avoid duplicates
        const newStartBtn = startBtn.cloneNode(true);
        if (startBtn.parentNode) {
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        }
        
        // Add the event listener
        newStartBtn.addEventListener('click', function(e) {
            console.log('Start button clicked from direct app.js handler');
            e.preventDefault();
            e.stopPropagation();
            
            if (window.startPomodoro) {
                window.startPomodoro();
            } else {
                // Direct implementation as fallback
                startTimerDirectly();
            }
            return false;
        });
        
        // Also add inline onclick as belt-and-suspenders approach
        newStartBtn.setAttribute('onclick', 'window.startPomodoro(); return false;');
    }
}

// Direct timer start implementation as final fallback
function startTimerDirectly() {
    console.log('Starting timer directly from app.js fallback');
    
    try {
        // Get the timer elements
        const minutesEl = document.getElementById('pomodoro-minutes');
        const secondsEl = document.getElementById('pomodoro-seconds');
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        const timerCircle = document.querySelector('.timer-circle');
        
        // Show/hide appropriate buttons
        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'flex';
        
        // Add pulsing animation to timer
        if (timerCircle) timerCircle.classList.add('pulsate');
        
        // Parse the current timer values
        let minutes = parseInt(minutesEl.textContent) || 25;
        let seconds = parseInt(secondsEl.textContent) || 0;
        let totalSeconds = minutes * 60 + seconds;
        
        // Create a new interval
        if (window.appTimerInterval) {
            clearInterval(window.appTimerInterval);
        }
        
        window.appTimerInterval = setInterval(function() {
            if (totalSeconds <= 0) {
                clearInterval(window.appTimerInterval);
                
                // Show the start button again
                if (startBtn) startBtn.style.display = 'flex';
                if (pauseBtn) pauseBtn.style.display = 'none';
                
                // Remove pulsing
                if (timerCircle) timerCircle.classList.remove('pulsate');
                return;
            }
            
            totalSeconds--;
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            
            if (minutesEl) minutesEl.textContent = mins.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = secs.toString().padStart(2, '0');
            
            // Update the progress circle if available
            updateTimerProgress(totalSeconds, minutes * 60 + seconds);
        }, 1000);
    } catch (error) {
        console.error('Error in direct timer start:', error);
    }
}

function updateTimerProgress(currentSeconds, totalDuration) {
    const progressCircle = document.querySelector('.timer-circle-progress');
    if (!progressCircle) return;
    
    const fullCircumference = 879.6; // 2 * π * 140 (circle radius)
    const elapsedTime = totalDuration - currentSeconds;
    const progressPercentage = (elapsedTime / totalDuration);
    const offset = fullCircumference * (1 - progressPercentage);
    
    // Apply the stroke-dashoffset for smooth animation
    progressCircle.style.strokeDashoffset = offset;
}

// Emergency Pomodoro control functions
function emergencyPause() {
    console.log('Emergency pause activated');
    // Try all possible pause methods
    if (window.pausePomodoro) {
        window.pausePomodoro();
    }
    if (window.pomodoroPauseTimer) {
        window.pomodoroPauseTimer();
    }
    
    // Clear all known interval timers
    if (window.manualTimerInterval) {
        clearInterval(window.manualTimerInterval);
        window.manualTimerInterval = null;
    }
    if (window.appTimerInterval) {
        clearInterval(window.appTimerInterval);
        window.appTimerInterval = null;
    }
    if (window.pomodoroTimerInterval) {
        clearInterval(window.pomodoroTimerInterval);
        window.pomodoroTimerInterval = null;
    }
    // Force clear any other intervals that might exist (search for any timing-related ones)
    for (let prop in window) {
        if (prop.toLowerCase().includes('timer') && prop.toLowerCase().includes('interval') && typeof window[prop] === 'number') {
            clearInterval(window[prop]);
            window[prop] = null;
        }
    }
    
    // Show start button, hide pause button
    const startBtn = document.getElementById('pomodoro-start');
    const pauseBtn = document.getElementById('pomodoro-pause');
    if (startBtn) startBtn.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    
    // Remove pulsing animation from timer
    const timerCircle = document.querySelector('.timer-circle');
    if (timerCircle) timerCircle.classList.remove('pulsate');
    
    return false;
}

function emergencySkip() {
    console.log('Emergency skip activated');
    // First pause the timer
    emergencyPause();
    
    // Try proper skip methods
    if (window.skipPomodoro) {
        window.skipPomodoro();
    }
    if (window.pomodoroSkipPhase) {
        window.pomodoroSkipPhase();
    }
    
    // If the proper methods didn't work, manually simulate skip
    // In a basic implementation, this is similar to reset but would advance to next phase
    // For safety, we'll just reset
    emergencyReset();
    
    return false;
}

function emergencyReset() {
    console.log('Emergency reset activated');
    // First pause the timer
    emergencyPause();
    
    // Try proper reset methods
    if (window.resetPomodoro) {
        window.resetPomodoro();
    }
    if (window.pomodoroResetTimer) {
        window.pomodoroResetTimer();
    }
    
    // Manual reset as fallback
    // Reset the display
    const minutesEl = document.getElementById('pomodoro-minutes');
    const secondsEl = document.getElementById('pomodoro-seconds');
    
    if (minutesEl) minutesEl.textContent = '25';
    if (secondsEl) secondsEl.textContent = '00';
    
    // Reset the progress circle
    const progressCircle = document.querySelector('.timer-circle-progress');
    if (progressCircle) progressCircle.style.strokeDashoffset = '879.6';
    
    // Ensure the timer is ready for a new start
    const timerCircle = document.querySelector('.timer-circle');
    if (timerCircle) timerCircle.classList.remove('pulsate');
    
    return false;
}

// Add to window object for direct access
window.emergencyPause = emergencyPause;
window.emergencySkip = emergencySkip;
window.emergencyReset = emergencyReset;

// GUARANTEED POMODORO TIMER SYSTEM
// This is a completely independent timer implementation that will override any existing functionality
(function() {
    // This will be called when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Setting up guaranteed Pomodoro timer system');
        setupGuaranteedPomodoro();
    });
    
    // Also try again after a delay to catch late DOM loading
    setTimeout(function() {
        console.log('Delayed setup of guaranteed Pomodoro timer system');
        setupGuaranteedPomodoro();
    }, 1000);
    
    // Track our own state
    let isTimerRunning = false;
    let currentTimerInterval = null;
    let lastKnownMinutes = 25;
    let lastKnownSeconds = 0;
    let totalSecondsRemaining = 25 * 60;
    let originalTotalSeconds = 25 * 60;
    
    function setupGuaranteedPomodoro() {
        // Find the critical elements
        const startButton = document.getElementById('pomodoro-start');
        const pauseButton = document.getElementById('pomodoro-pause');
        const skipButton = document.getElementById('pomodoro-skip');
        const resetButton = document.getElementById('pomodoro-reset');
        
        // Direct absolute nuclear option for pause function
        window.FORCE_PAUSE_TIMER = function() {
            console.log('🔴 FORCE PAUSE ACTIVATED');
            
            // Clear our own interval
            if (currentTimerInterval) {
                clearInterval(currentTimerInterval);
                currentTimerInterval = null;
            }
            
            // NUCLEAR OPTION: Brute force clear ALL intervals
            // This is extreme but will ensure everything stops
            const maxIntervalId = 1000; // Assume no more than 1000 intervals in the app
            for (let i = 1; i < maxIntervalId; i++) {
                try {
                    clearInterval(i);
                    console.log(`Cleared interval ID: ${i}`);
                } catch (e) {
                    // Ignore
                }
            }
            
            // Clear any possible interval in the window object
            for (const prop in window) {
                if (typeof window[prop] === 'number' && 
                    (String(prop).toLowerCase().includes('interval') || 
                    String(prop).toLowerCase().includes('timer'))) {
                    try {
                        clearInterval(window[prop]);
                        console.log(`Cleared possible timer interval: ${prop}`);
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }
            
            // Also look for specific known interval properties
            if (window.timerInterval) {
                clearInterval(window.timerInterval);
                window.timerInterval = null;
            }
            if (window.pomodoroTimerInterval) {
                clearInterval(window.pomodoroTimerInterval);
                window.pomodoroTimerInterval = null;
            }
            if (window.manualTimerInterval) {
                clearInterval(window.manualTimerInterval);
                window.manualTimerInterval = null;
            }
            if (window.appTimerInterval) {
                clearInterval(window.appTimerInterval);
                window.appTimerInterval = null;
            }
            
            // Explicitly set any other possible timer state variables to stopped
            if (window.isRunning !== undefined) window.isRunning = false;
            if (window.isTimerRunning !== undefined) window.isTimerRunning = false;
            
            // Force UI to show correct state
            isTimerRunning = false;
            const startBtn = document.getElementById('pomodoro-start');
            const pauseBtn = document.getElementById('pomodoro-pause');
            
            if (startBtn) {
                startBtn.style.display = 'flex';
                startBtn.style.visibility = 'visible'; // In case display isn't working
            }
            
            if (pauseBtn) {
                pauseBtn.style.display = 'none';
                pauseBtn.style.visibility = 'hidden'; // In case display isn't working
            }
            
            // Remove pulsing animation from all possible elements
            const timerCircle = document.querySelector('.timer-circle');
            if (timerCircle) timerCircle.classList.remove('pulsate');
            
            // Try to force redraw of the UI
            document.body.style.display = 'none';
            document.body.offsetHeight; // Force reflow
            document.body.style.display = '';
            
            console.log('Timer fully stopped and all intervals cleared');
            
            return false;
        };
        
        // Override the pause button with our guaranteed version
        if (pauseButton) {
            // Remove existing event listeners by cloning
            const newPauseButton = pauseButton.cloneNode(true);
            if (pauseButton.parentNode) {
                pauseButton.parentNode.replaceChild(newPauseButton, pauseButton);
            }
            
            // Add our bulletproof event handler
            newPauseButton.addEventListener('click', function(e) {
                console.log('Guaranteed pause button clicked');
                e.preventDefault();
                e.stopPropagation();
                window.FORCE_PAUSE_TIMER();
                return false;
            });
            
            // Also add inline handler as backup
            newPauseButton.setAttribute('onclick', 'window.FORCE_PAUSE_TIMER(); return false;');
        }
        
        // Direct absolute nuclear option for start function
        window.FORCE_START_TIMER = function() {
            console.log('🟢 FORCE START ACTIVATED');
            
            // Just to be safe, pause first to clear any running timers
            window.FORCE_PAUSE_TIMER();
            
            // Get the current timer values
            const minutesEl = document.getElementById('pomodoro-minutes');
            const secondsEl = document.getElementById('pomodoro-seconds');
            
            if (minutesEl && secondsEl) {
                lastKnownMinutes = parseInt(minutesEl.textContent) || lastKnownMinutes;
                lastKnownSeconds = parseInt(secondsEl.textContent) || lastKnownSeconds;
                totalSecondsRemaining = lastKnownMinutes * 60 + lastKnownSeconds;
                originalTotalSeconds = totalSecondsRemaining;
            }
            
            // Show the correct buttons
            if (startButton) startButton.style.display = 'none';
            if (pauseButton) pauseButton.style.display = 'flex';
            
            // Add pulsing animation
            const timerCircle = document.querySelector('.timer-circle');
            if (timerCircle) timerCircle.classList.add('pulsate');
            
            // Start our guaranteed timer
            isTimerRunning = true;
            currentTimerInterval = setInterval(function() {
                if (!isTimerRunning) {
                    clearInterval(currentTimerInterval);
                    currentTimerInterval = null;
                    return;
                }
                
                if (totalSecondsRemaining <= 0) {
                    window.FORCE_TIMER_COMPLETE();
                    return;
                }
                
                totalSecondsRemaining--;
                const minutes = Math.floor(totalSecondsRemaining / 60);
                const seconds = totalSecondsRemaining % 60;
                
                // Update the UI
                if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
                if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
                
                // Update progress circle
                updateTimerProgress(totalSecondsRemaining, originalTotalSeconds);
            }, 1000);
            
            return false;
        };
        
        // Override the start button with our guaranteed version
        if (startButton) {
            // Remove existing event listeners by cloning
            const newStartButton = startButton.cloneNode(true);
            if (startButton.parentNode) {
                startButton.parentNode.replaceChild(newStartButton, startButton);
            }
            
            // Add our bulletproof event handler
            newStartButton.addEventListener('click', function(e) {
                console.log('Guaranteed start button clicked');
                e.preventDefault();
                e.stopPropagation();
                window.FORCE_START_TIMER();
                return false;
            });
            
            // Also add inline handler as backup
            newStartButton.setAttribute('onclick', 'window.FORCE_START_TIMER(); return false;');
        }
        
        // Direct absolute nuclear option for reset function
        window.FORCE_RESET_TIMER = function() {
            console.log('🔄 FORCE RESET ACTIVATED');
            
            // First pause to stop any running timers
            window.FORCE_PAUSE_TIMER();
            
            // Determine which phase we're in
            let currentPhase = 'work';
            const phaseButtons = document.querySelectorAll('.phase-btn');
            phaseButtons.forEach(btn => {
                if (btn.classList.contains('active')) {
                    currentPhase = btn.getAttribute('data-phase') || 'work';
                }
            });
            
            // Reset the timer based on the current phase
            let newMinutes = 25; // Default for work
            if (currentPhase === 'shortBreak') {
                newMinutes = 5;
            } else if (currentPhase === 'longBreak') {
                newMinutes = 15;
            }
            
            // Update display values
            const minutesEl = document.getElementById('pomodoro-minutes');
            const secondsEl = document.getElementById('pomodoro-seconds');
            
            if (minutesEl) minutesEl.textContent = newMinutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = '00';
            
            // Update our internal state
            lastKnownMinutes = newMinutes;
            lastKnownSeconds = 0;
            totalSecondsRemaining = newMinutes * 60;
            originalTotalSeconds = totalSecondsRemaining;
            
            // Reset the progress circle
            updateTimerProgress(totalSecondsRemaining, originalTotalSeconds);
            
            return false;
        };
        
        // Override the reset button with our guaranteed version
        if (resetButton) {
            // Remove existing event listeners by cloning
            const newResetButton = resetButton.cloneNode(true);
            if (resetButton.parentNode) {
                resetButton.parentNode.replaceChild(newResetButton, resetButton);
            }
            
            // Add our bulletproof event handler
            newResetButton.addEventListener('click', function(e) {
                console.log('Guaranteed reset button clicked');
                e.preventDefault();
                e.stopPropagation();
                window.FORCE_RESET_TIMER();
                return false;
            });
            
            // Also add inline handler as backup
            newResetButton.setAttribute('onclick', 'window.FORCE_RESET_TIMER(); return false;');
        }
        
        // Direct absolute nuclear option for skip function
        window.FORCE_SKIP_TIMER = function() {
            console.log('⏭️ FORCE SKIP ACTIVATED');
            
            // First pause to stop any running timers
            window.FORCE_PAUSE_TIMER();
            
            // Determine current phase and switch to next
            let currentPhase = 'work';
            let nextPhase = 'shortBreak';
            
            const phaseButtons = document.querySelectorAll('.phase-btn');
            phaseButtons.forEach(btn => {
                if (btn.classList.contains('active')) {
                    currentPhase = btn.getAttribute('data-phase') || 'work';
                }
            });
            
            // Determine next phase
            if (currentPhase === 'work') {
                // Check if we should go to long break
                const longBreakIntervalEl = document.getElementById('long-break-interval');
                const longBreakInterval = longBreakIntervalEl ? parseInt(longBreakIntervalEl.value) || 4 : 4;
                
                // Check completed pomodoros
                const sessionCountEl = document.getElementById('today-sessions');
                const completedSessions = sessionCountEl ? parseInt(sessionCountEl.textContent) || 0 : 0;
                
                if ((completedSessions + 1) % longBreakInterval === 0) {
                    nextPhase = 'longBreak';
                } else {
                    nextPhase = 'shortBreak';
                }
            } else {
                nextPhase = 'work';
            }
            
            // Activate the next phase button
            phaseButtons.forEach(btn => {
                const phase = btn.getAttribute('data-phase') || '';
                if (phase === nextPhase) {
                    btn.click(); // This should trigger the phase change
                }
            });
            
            // As a backup, also reset the timer
            window.FORCE_RESET_TIMER();
            
            return false;
        };
        
        // Override the skip button with our guaranteed version
        if (skipButton) {
            // Remove existing event listeners by cloning
            const newSkipButton = skipButton.cloneNode(true);
            if (skipButton.parentNode) {
                skipButton.parentNode.replaceChild(newSkipButton, skipButton);
            }
            
            // Add our bulletproof event handler
            newSkipButton.addEventListener('click', function(e) {
                console.log('Guaranteed skip button clicked');
                e.preventDefault();
                e.stopPropagation();
                window.FORCE_SKIP_TIMER();
                return false;
            });
            
            // Also add inline handler as backup
            newSkipButton.setAttribute('onclick', 'window.FORCE_SKIP_TIMER(); return false;');
        }
        
        // Handle timer completion
        window.FORCE_TIMER_COMPLETE = function() {
            console.log('⏰ TIMER COMPLETED');
            
            // Pause the timer
            window.FORCE_PAUSE_TIMER();
            
            // Play a sound if we can find one
            try {
                const audio = new Audio('./assets/sounds/bell.mp3');
                audio.volume = 0.8;
                audio.play();
            } catch (e) {
                console.error('Could not play timer completion sound', e);
            }
            
            // Update statistics
            const sessionCountEl = document.getElementById('today-sessions');
            if (sessionCountEl) {
                const currentCount = parseInt(sessionCountEl.textContent) || 0;
                sessionCountEl.textContent = (currentCount + 1).toString();
            }
            
            const minutesCountEl = document.getElementById('today-minutes');
            if (minutesCountEl) {
                const currentMinutes = parseInt(minutesCountEl.textContent) || 0;
                const completedMinutes = Math.round(originalTotalSeconds / 60);
                minutesCountEl.textContent = (currentMinutes + completedMinutes).toString();
            }
            
            // Skip to next phase
            window.FORCE_SKIP_TIMER();
            
            return false;
        };
        
        // Also add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Only if we're on the Pomodoro section
            const pomodoroSection = document.getElementById('pomodoro-section');
            if (!pomodoroSection || pomodoroSection.style.display === 'none') return;
            
            // Space to toggle timer
            if (e.key === ' ' || e.code === 'Space') {
                if (isTimerRunning) {
                    window.FORCE_PAUSE_TIMER();
                } else {
                    window.FORCE_START_TIMER();
                }
                e.preventDefault();
            }
            
            // P to pause
            if (e.key === 'p' || e.key === 'P') {
                window.FORCE_PAUSE_TIMER();
                e.preventDefault();
            }
            
            // S to start
            if (e.key === 's' || e.key === 'S') {
                window.FORCE_START_TIMER();
                e.preventDefault();
            }
            
            // R to reset
            if (e.key === 'r' || e.key === 'R') {
                window.FORCE_RESET_TIMER();
                e.preventDefault();
            }
            
            // F to skip (forward)
            if (e.key === 'f' || e.key === 'F') {
                window.FORCE_SKIP_TIMER();
                e.preventDefault();
            }
        });
        
        // Make the timer circle clickable
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            timerCircle.addEventListener('click', function(e) {
                if (isTimerRunning) {
                    window.FORCE_PAUSE_TIMER();
                } else {
                    window.FORCE_START_TIMER();
                }
            });
        }
        
        console.log('Guaranteed Pomodoro timer system setup complete');
    }
    
    // Helper function to update timer progress
    function updateTimerProgress(currentSeconds, totalDuration) {
        const progressCircle = document.querySelector('.timer-circle-progress');
        if (!progressCircle) return;
        
        const fullCircumference = 879.6; // 2 * π * 140 (circle radius)
        const elapsedTime = totalDuration - currentSeconds;
        const progressPercentage = (elapsedTime / totalDuration);
        const offset = fullCircumference * (1 - progressPercentage);
        
        // Apply the stroke-dashoffset for smooth animation
        progressCircle.style.strokeDashoffset = offset;
    }
})();

// Add a global document listener for "Pause" clicks
document.addEventListener('DOMContentLoaded', function() {
    // This handler will catch ANY click in the document
    document.addEventListener('click', function(e) {
        // Check if we found a pause button or anything with pause in its ID or class
        const el = e.target;
        
        // Check if clicked element or any parent is a pause button
        let currentNode = el;
        let isPauseButton = false;
        
        while (currentNode && currentNode !== document.body) {
            // Check for pause in ID
            if (currentNode.id && (
                currentNode.id === 'pomodoro-pause' || 
                currentNode.id.includes('pause') ||
                currentNode.id.includes('Pause'))) {
                isPauseButton = true;
                break;
            }
            
            // Check for pause in classes
            if (currentNode.classList) {
                for (let i = 0; i < currentNode.classList.length; i++) {
                    const className = currentNode.classList[i];
                    if (className.includes('pause') || className.includes('Pause')) {
                        isPauseButton = true;
                        break;
                    }
                }
                if (isPauseButton) break;
            }
            
            // Check for pause in content
            if (currentNode.textContent && 
                (currentNode.textContent.includes('Pause') || 
                 currentNode.textContent.includes('pause'))) {
                isPauseButton = true;
                break;
            }
            
            // Move up to parent
            currentNode = currentNode.parentElement;
        }
        
        // If we found a pause button, force pause the timer
        if (isPauseButton) {
            console.log('Global pause button click detected!', currentNode);
            
            // Call our force pause method if available
            if (window.FORCE_PAUSE_TIMER) {
                e.preventDefault();
                e.stopPropagation();
                window.FORCE_PAUSE_TIMER();
                return false;
            }
        }
    }, true); // Use capture phase for max reliability
    
    // Add keyboard shortcut for pause
    document.addEventListener('keydown', function(e) {
        // P or Escape to pause
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            console.log('Pause keyboard shortcut detected!');
            
            // Check if we're on Pomodoro section
            const pomodoroSection = document.getElementById('pomodoro-section');
            if (pomodoroSection && pomodoroSection.style.display !== 'none') {
                if (window.FORCE_PAUSE_TIMER) {
                    e.preventDefault();
                    window.FORCE_PAUSE_TIMER();
                }
            }
        }
    });
});
