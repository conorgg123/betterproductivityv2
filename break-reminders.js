// Break Reminders Module
document.addEventListener('DOMContentLoaded', function() {
    initBreakReminders();
});

/**
 * Initialize break reminders functionality
 */
function initBreakReminders() {
    console.log('Initializing break reminders system...');
    
    // Add break reminders settings to the settings section
    addBreakRemindersSettings();
    
    // Set up event listeners
    setupBreakRemindersListeners();
    
    // Start monitoring for break reminders if enabled
    startBreakReminderMonitoring();
}

/**
 * Add break reminders settings to the settings section
 */
function addBreakRemindersSettings() {
    // Find the productivity settings card
    const productivityCard = document.querySelector('.settings-card:last-child .settings-group');
    
    if (!productivityCard) {
        console.error('Could not find productivity settings card');
        return;
    }
    
    // Create the break reminders settings item
    const breakRemindersItem = document.createElement('div');
    breakRemindersItem.className = 'settings-item';
    
    // Get current settings or use defaults
    const breakSettings = getBreakSettings();
    
    breakRemindersItem.innerHTML = `
        <div class="settings-label">
            <h4>Break Reminders</h4>
            <p>Get reminded to take breaks during long work periods</p>
        </div>
        <div class="settings-control">
            <label class="toggle-switch">
                <input type="checkbox" id="break-reminders-toggle" ${breakSettings.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </label>
        </div>
        
        <div id="break-reminders-settings" class="sub-settings" ${breakSettings.enabled ? '' : 'style="display: none;"'}>
            <div class="settings-item">
                <div class="settings-label">
                    <h5>Work Duration</h5>
                    <p>Remind me to take a break after working for:</p>
                </div>
                <div class="settings-control">
                    <select id="break-work-duration" class="settings-select">
                        <option value="30" ${breakSettings.workDuration === 30 ? 'selected' : ''}>30 minutes</option>
                        <option value="45" ${breakSettings.workDuration === 45 ? 'selected' : ''}>45 minutes</option>
                        <option value="60" ${breakSettings.workDuration === 60 ? 'selected' : ''}>1 hour</option>
                        <option value="90" ${breakSettings.workDuration === 90 ? 'selected' : ''}>1.5 hours</option>
                        <option value="120" ${breakSettings.workDuration === 120 ? 'selected' : ''}>2 hours</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-item">
                <div class="settings-label">
                    <h5>Break Duration</h5>
                    <p>Suggested break duration:</p>
                </div>
                <div class="settings-control">
                    <select id="break-duration" class="settings-select">
                        <option value="5" ${breakSettings.breakDuration === 5 ? 'selected' : ''}>5 minutes</option>
                        <option value="10" ${breakSettings.breakDuration === 10 ? 'selected' : ''}>10 minutes</option>
                        <option value="15" ${breakSettings.breakDuration === 15 ? 'selected' : ''}>15 minutes</option>
                        <option value="20" ${breakSettings.breakDuration === 20 ? 'selected' : ''}>20 minutes</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-item">
                <div class="settings-label">
                    <h5>Smart Detection</h5>
                    <p>Only suggest breaks when I'm actively working</p>
                </div>
                <div class="settings-control">
                    <label class="toggle-switch">
                        <input type="checkbox" id="break-smart-detection" ${breakSettings.smartDetection ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-item">
                <div class="settings-label">
                    <h5>Break Types</h5>
                    <p>Choose what types of breaks to suggest:</p>
                </div>
                <div class="settings-control break-types-control">
                    <label class="checkbox-label">
                        <input type="checkbox" id="break-type-stretch" ${breakSettings.breakTypes.includes('stretch') ? 'checked' : ''}>
                        <span>Stretching</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="break-type-eyes" ${breakSettings.breakTypes.includes('eyes') ? 'checked' : ''}>
                        <span>Eye Rest</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="break-type-hydrate" ${breakSettings.breakTypes.includes('hydrate') ? 'checked' : ''}>
                        <span>Hydration</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="break-type-walk" ${breakSettings.breakTypes.includes('walk') ? 'checked' : ''}>
                        <span>Quick Walk</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Add to productivity card
    productivityCard.appendChild(breakRemindersItem);
}

/**
 * Set up event listeners for break reminders
 */
function setupBreakRemindersListeners() {
    // Toggle break reminders on/off
    document.addEventListener('change', function(e) {
        if (e.target.id === 'break-reminders-toggle') {
            const breakSettings = getBreakSettings();
            breakSettings.enabled = e.target.checked;
            
            // Show/hide settings
            const settingsSection = document.getElementById('break-reminders-settings');
            if (settingsSection) {
                settingsSection.style.display = e.target.checked ? 'block' : 'none';
            }
            
            // Save settings
            saveBreakSettings(breakSettings);
            
            // Start/stop monitoring
            if (e.target.checked) {
                startBreakReminderMonitoring();
            } else {
                stopBreakReminderMonitoring();
            }
        }
    });
    
    // Change work duration
    document.addEventListener('change', function(e) {
        if (e.target.id === 'break-work-duration') {
            const breakSettings = getBreakSettings();
            breakSettings.workDuration = parseInt(e.target.value);
            saveBreakSettings(breakSettings);
            
            // Reset monitoring with new settings
            if (breakSettings.enabled) {
                stopBreakReminderMonitoring();
                startBreakReminderMonitoring();
            }
        }
    });
    
    // Change break duration
    document.addEventListener('change', function(e) {
        if (e.target.id === 'break-duration') {
            const breakSettings = getBreakSettings();
            breakSettings.breakDuration = parseInt(e.target.value);
            saveBreakSettings(breakSettings);
        }
    });
    
    // Toggle smart detection
    document.addEventListener('change', function(e) {
        if (e.target.id === 'break-smart-detection') {
            const breakSettings = getBreakSettings();
            breakSettings.smartDetection = e.target.checked;
            saveBreakSettings(breakSettings);
        }
    });
    
    // Toggle break types
    document.addEventListener('change', function(e) {
        if (e.target.id.startsWith('break-type-')) {
            const breakSettings = getBreakSettings();
            const breakType = e.target.id.replace('break-type-', '');
            
            if (e.target.checked) {
                if (!breakSettings.breakTypes.includes(breakType)) {
                    breakSettings.breakTypes.push(breakType);
                }
            } else {
                const index = breakSettings.breakTypes.indexOf(breakType);
                if (index !== -1) {
                    breakSettings.breakTypes.splice(index, 1);
                }
            }
            
            saveBreakSettings(breakSettings);
        }
    });
    
    // Close break reminder notification
    document.addEventListener('click', function(e) {
        if (e.target.closest('.break-reminder-close')) {
            const notification = e.target.closest('.break-reminder-notification');
            if (notification) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }
    });
    
    // Take break now
    document.addEventListener('click', function(e) {
        if (e.target.closest('#take-break-btn')) {
            const notification = e.target.closest('.break-reminder-notification');
            if (notification) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                    startBreak();
                }, 300);
            }
        }
    });
    
    // Snooze break reminder
    document.addEventListener('click', function(e) {
        if (e.target.closest('#snooze-break-btn')) {
            const notification = e.target.closest('.break-reminder-notification');
            const snoozeTime = e.target.closest('#snooze-break-btn').getAttribute('data-time') || '5';
            
            if (notification) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                    snoozeBreakReminder(parseInt(snoozeTime));
                }, 300);
            }
        }
    });
}

/**
 * Get break reminder settings from localStorage or use defaults
 * @returns {Object} Break reminder settings
 */
function getBreakSettings() {
    const defaultSettings = {
        enabled: false,
        workDuration: 60,
        breakDuration: 10,
        smartDetection: true,
        breakTypes: ['stretch', 'eyes', 'hydrate', 'walk'],
        lastBreakTime: null,
        nextBreakTime: null,
        snoozedUntil: null
    };
    
    const savedSettings = JSON.parse(localStorage.getItem('breakSettings') || '{}');
    
    return { ...defaultSettings, ...savedSettings };
}

/**
 * Save break reminder settings to localStorage
 * @param {Object} settings - Break reminder settings
 */
function saveBreakSettings(settings) {
    localStorage.setItem('breakSettings', JSON.stringify(settings));
}

/**
 * Start monitoring for break reminders
 */
function startBreakReminderMonitoring() {
    const breakSettings = getBreakSettings();
    
    if (!breakSettings.enabled) {
        return;
    }
    
    // Clear any existing monitoring
    stopBreakReminderMonitoring();
    
    // Set initial next break time if not set
    if (!breakSettings.nextBreakTime || breakSettings.snoozedUntil) {
        const now = new Date().getTime();
        let nextBreakTime;
        
        if (breakSettings.snoozedUntil && breakSettings.snoozedUntil > now) {
            // If snoozed, use snoozed time as next break time
            nextBreakTime = breakSettings.snoozedUntil;
        } else {
            // Otherwise, set next break time based on work duration
            nextBreakTime = now + (breakSettings.workDuration * 60 * 1000);
        }
        
        breakSettings.nextBreakTime = nextBreakTime;
        breakSettings.snoozedUntil = null;
        saveBreakSettings(breakSettings);
    }
    
    // Start monitoring interval
    window.breakReminderInterval = setInterval(() => {
        checkForBreakTime();
    }, 60000); // Check every minute
    
    // Also check immediately
    checkForBreakTime();
}

/**
 * Stop monitoring for break reminders
 */
function stopBreakReminderMonitoring() {
    if (window.breakReminderInterval) {
        clearInterval(window.breakReminderInterval);
        window.breakReminderInterval = null;
    }
}

/**
 * Check if it's time for a break
 */
function checkForBreakTime() {
    const breakSettings = getBreakSettings();
    
    if (!breakSettings.enabled || !breakSettings.nextBreakTime) {
        return;
    }
    
    const now = new Date().getTime();
    
    // If it's time for a break
    if (now >= breakSettings.nextBreakTime) {
        // If smart detection is enabled, check if the user is actively working
        if (breakSettings.smartDetection) {
            if (!isActivelyWorking()) {
                // If not actively working, push back the break time
                breakSettings.nextBreakTime = now + (15 * 60 * 1000); // Try again in 15 minutes
                saveBreakSettings(breakSettings);
                return;
            }
        }
        
        // Show break reminder
        showBreakReminder(breakSettings);
        
        // Reset break time
        breakSettings.lastBreakTime = now;
        breakSettings.nextBreakTime = now + (breakSettings.workDuration * 60 * 1000);
        saveBreakSettings(breakSettings);
    }
}

/**
 * Check if the user is actively working
 * @returns {boolean} True if the user appears to be actively working
 */
function isActivelyWorking() {
    // In a real implementation, this would check for recent user activity
    // and possibly the current active section (e.g., tasks, time blocks)
    
    // For now, we'll just check if any work-related sections are open
    const activeSection = document.querySelector('.section-content[style*="display: block"]');
    if (activeSection) {
        const sectionId = activeSection.id;
        const workSections = ['tasks-section', 'scheduler-section', 'youtube-section'];
        return workSections.includes(sectionId);
    }
    
    return true; // Default to assuming they're working
}

/**
 * Show a break reminder notification
 * @param {Object} settings - Break reminder settings
 */
function showBreakReminder(settings) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.break-reminder-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Get a random break type from enabled types
    const breakType = getRandomBreakType(settings.breakTypes);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'break-reminder-notification';
    
    notification.innerHTML = `
        <div class="break-reminder-icon">
            <i class="${getBreakTypeIcon(breakType)}"></i>
        </div>
        <div class="break-reminder-content">
            <div class="break-reminder-title">Time for a Break</div>
            <div class="break-reminder-message">${getBreakTypeMessage(breakType, settings.breakDuration)}</div>
            <div class="break-reminder-actions">
                <button id="take-break-btn" class="break-btn break-btn-primary">
                    <i class="fa-solid fa-play"></i> Start ${settings.breakDuration} min Break
                </button>
                <button id="snooze-break-btn" class="break-btn" data-time="5">
                    <i class="fa-solid fa-clock"></i> Snooze 5m
                </button>
            </div>
        </div>
        <button class="break-reminder-close">&times;</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Play notification sound if available
    if (typeof playNotificationSound === 'function') {
        playNotificationSound();
    }
    
    // Show native notification if browser allows
    if (Notification.permission === 'granted') {
        const nativeNotification = new Notification('Time for a Break', {
            body: getBreakTypeMessage(breakType, settings.breakDuration).replace(/<[^>]*>/g, ''),
            icon: 'assets/break-icon.png'
        });
        
        // Close native notification after 10 seconds
        setTimeout(() => {
            nativeNotification.close();
        }, 10000);
    }
}

/**
 * Get a random break type from enabled types
 * @param {Array} enabledTypes - Array of enabled break types
 * @returns {string} Random break type
 */
function getRandomBreakType(enabledTypes) {
    if (!enabledTypes || enabledTypes.length === 0) {
        return 'stretch'; // Default
    }
    
    const randomIndex = Math.floor(Math.random() * enabledTypes.length);
    return enabledTypes[randomIndex];
}

/**
 * Get icon for a break type
 * @param {string} breakType - Break type
 * @returns {string} Icon class
 */
function getBreakTypeIcon(breakType) {
    switch (breakType) {
        case 'stretch':
            return 'fa-solid fa-person-walking';
        case 'eyes':
            return 'fa-solid fa-eye';
        case 'hydrate':
            return 'fa-solid fa-glass-water';
        case 'walk':
            return 'fa-solid fa-person-hiking';
        default:
            return 'fa-solid fa-mug-hot';
    }
}

/**
 * Get message for a break type
 * @param {string} breakType - Break type
 * @param {number} duration - Break duration in minutes
 * @returns {string} Break message
 */
function getBreakTypeMessage(breakType, duration) {
    switch (breakType) {
        case 'stretch':
            return `You've been working for a while. Take a <strong>${duration}-minute break</strong> to stretch your body.`;
        case 'eyes':
            return `Give your eyes a rest! Take a <strong>${duration}-minute break</strong> and look at something in the distance.`;
        case 'hydrate':
            return `Time to hydrate! Take a <strong>${duration}-minute break</strong> to get some water and refresh.`;
        case 'walk':
            return `Get your blood flowing with a <strong>${duration}-minute walk</strong>. Your body will thank you!`;
        default:
            return `Take a <strong>${duration}-minute break</strong> to recharge your energy.`;
    }
}

/**
 * Snooze break reminder for specified minutes
 * @param {number} minutes - Snooze time in minutes
 */
function snoozeBreakReminder(minutes) {
    const breakSettings = getBreakSettings();
    
    const now = new Date().getTime();
    const snoozeTime = now + (minutes * 60 * 1000);
    
    breakSettings.nextBreakTime = snoozeTime;
    breakSettings.snoozedUntil = snoozeTime;
    
    saveBreakSettings(breakSettings);
    
    // Show toast notification
    if (typeof showToast === 'function') {
        showToast(`Break reminder snoozed for ${minutes} minutes`, 'info');
    }
}

/**
 * Start a break session
 */
function startBreak() {
    const breakSettings = getBreakSettings();
    
    // Create break timer modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'break-timer-modal';
    
    modal.innerHTML = `
        <div class="modal-content break-timer-modal-content">
            <div class="modal-header">
                <h3>Break Time</h3>
                <button class="modal-close close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="break-timer-container">
                    <div class="break-message">Take a moment to relax and recharge</div>
                    
                    <div class="break-timer">
                        <span id="break-minutes">${breakSettings.breakDuration}</span>:<span id="break-seconds">00</span>
                    </div>
                    
                    <div class="break-progress">
                        <div class="break-progress-bar" style="width: 100%;"></div>
                    </div>
                    
                    <div class="break-actions">
                        <button id="end-break-btn" class="btn btn-secondary">
                            End Break Early
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Start break timer
    let timeLeft = breakSettings.breakDuration * 60;
    const totalTime = timeLeft;
    const minutesEl = document.getElementById('break-minutes');
    const secondsEl = document.getElementById('break-seconds');
    const progressBar = document.querySelector('.break-progress-bar');
    
    const timer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endBreak();
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress bar
        const percentLeft = (timeLeft / totalTime) * 100;
        if (progressBar) progressBar.style.width = `${percentLeft}%`;
    }, 1000);
    
    // Store timer so we can clear it if needed
    window.breakTimer = timer;
    
    // Close modal event
    document.querySelector('#break-timer-modal .modal-close').addEventListener('click', function() {
        endBreak();
    });
    
    // End break early button
    document.getElementById('end-break-btn').addEventListener('click', function() {
        endBreak();
    });
}

/**
 * End the break session
 */
function endBreak() {
    // Clear timer
    if (window.breakTimer) {
        clearInterval(window.breakTimer);
        window.breakTimer = null;
    }
    
    // Close modal
    const modal = document.getElementById('break-timer-modal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Show toast notification
    if (typeof showToast === 'function') {
        showToast('Break completed. Back to work!', 'success');
    }
    
    // Log break in activity
    logBreakActivity();
}

/**
 * Log break activity for analytics
 */
function logBreakActivity() {
    const breakSettings = getBreakSettings();
    
    // Get existing break log or create new one
    const breakLog = JSON.parse(localStorage.getItem('breakLog') || '[]');
    
    // Add new entry
    breakLog.push({
        timestamp: new Date().toISOString(),
        duration: breakSettings.breakDuration
    });
    
    // Save back to localStorage
    localStorage.setItem('breakLog', JSON.stringify(breakLog));
}

/**
 * Request notification permission if not already granted
 */
function requestNotificationPermission() {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Request notification permission when initializing
setTimeout(requestNotificationPermission, 3000);

// Export for use in app.js
window.initBreakReminders = initBreakReminders; 