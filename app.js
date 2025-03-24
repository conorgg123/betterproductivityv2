// Simple console log to verify script loading
console.log('App.js loaded successfully');

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Initialize Tasks
    initTasks();
    
    // Initialize Analytics
    initAnalytics();
    
    // Initialize Reminders
    initReminders();
    
    // Initialize Animations
    initAnimations();
    
    // Initialize YouTube Manager and Notes (imported from separate files)
    if (typeof initYouTubeManager === 'function') {
        initYouTubeManager();
    }
    
    if (typeof initNotes === 'function') {
        initNotes();
    }
    
    // Update the floating Pomodoro button with session count
    updatePomodoroButton();
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
            const targetSection = document.getElementById(sectionId + '-section');
            if (targetSection) {
                console.log(`Found target section: ${targetSection.id}`);
                
                if (sectionId === 'dashboard') {
                    targetSection.style.display = 'grid';
                } else if (['tasks', 'reminders', 'analytics', 'settings'].includes(sectionId)) {
                    targetSection.style.display = 'grid';
                } else {
                    targetSection.style.display = 'block';
                }
                
                console.log(`Set display style to: ${targetSection.style.display}`);
            } else {
                console.error(`Target section not found: ${sectionId}-section`);
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
            colorOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            const color = this.dataset.color;
            localStorage.setItem('accentColor', color);
            document.documentElement.setAttribute('data-accent-color', color);
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
    
    console.log(`Applied theme: ${theme}`);
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
 * Update the floating Pomodoro button with session count
 */
function updatePomodoroButton() {
    const pomodoroBtn = document.getElementById('floating-pomodoro-btn');
    if (!pomodoroBtn) return;
    
    // Get today's Pomodoro sessions
    const pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const todaySessions = pomodoroStats.filter(session => 
        session.date.startsWith(today)
    ).length;
    
    // Update the button with a badge if there are sessions
    if (todaySessions > 0) {
        if (!pomodoroBtn.querySelector('.pomodoro-count')) {
            const countBadge = document.createElement('span');
            countBadge.className = 'pomodoro-count';
            pomodoroBtn.appendChild(countBadge);
        }
        
        const countBadge = pomodoroBtn.querySelector('.pomodoro-count');
        countBadge.textContent = todaySessions;
    } else {
        const countBadge = pomodoroBtn.querySelector('.pomodoro-count');
        if (countBadge) {
            countBadge.remove();
        }
    }
}

// Also export as a global function for other modules to call
window.updatePomodoroButton = updatePomodoroButton;

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