// Pomodoro Timer Implementation
document.addEventListener('DOMContentLoaded', function() {
    window.initPomodoro();
});

/**
 * Initialize Pomodoro timer functionality
 */
function initPomodoro() {
    console.log('Initializing Pomodoro timer...');
    
    // Variables for timer state
    let isRunning = false;
    let timerInterval = null;
    let currentSeconds = 0;
    let currentPhase = 'work'; // 'work', 'shortBreak', 'longBreak'
    let completedPomodoros = 0;
    let skipButtonCooldown = false;
    
    // Default timer settings (can be overridden by user preferences)
    let timerSettings = {
        workDuration: 25 * 60, // 25 minutes in seconds
        shortBreakDuration: 5 * 60, // 5 minutes in seconds
        longBreakDuration: 15 * 60, // 15 minutes in seconds
        longBreakInterval: 4, // After how many work sessions
        autoStartBreaks: false,
        autoStartPomodoros: false,
        alarmSound: 'default', // sound file to play
        alarmVolume: 80, // volume percentage
        tickingSound: false // whether to play ticking during work sessions
    };
    
    // Load user settings from localStorage
    loadPomodoroSettings();
    
    // Setup DOM elements
    setupPomodoroUI();
    
    // Initialize timer display
    updateTimerDisplay();
    updatePomodoroProgress();
    
    // Set up event listeners
    setupEventListeners();
    
    /**
     * Load Pomodoro settings from localStorage
     */
    function loadPomodoroSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
        if (savedSettings) {
            timerSettings = { ...timerSettings, ...savedSettings };
        }
        
        // Save default settings if none exist
        if (!savedSettings) {
            localStorage.setItem('pomodoroSettings', JSON.stringify(timerSettings));
        }
        
        // Set initial seconds based on current phase
        resetTimer();
    }
    
    /**
     * Set up the Pomodoro UI elements
     */
    function setupPomodoroUI() {
        // Pomodoro modal
        const pomodoroModal = document.getElementById('pomodoro-modal');
        
        if (!pomodoroModal) {
            const modalHTML = `
                <div id="pomodoro-modal" class="modal">
                    <div class="modal-content pomodoro-modal-content">
                        <div class="modal-header">
                            <h3>Pomodoro Timer</h3>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="pomodoro-container">
                                <div class="pomodoro-phase">
                                    <button class="phase-btn active" data-phase="work">Focus</button>
                                    <button class="phase-btn" data-phase="shortBreak">Short Break</button>
                                    <button class="phase-btn" data-phase="longBreak">Long Break</button>
                                </div>
                                
                                <div class="pomodoro-timer">
                                    <div class="timer-circle">
                                        <svg width="250" height="250" class="timer-svg">
                                            <circle cx="125" cy="125" r="115" class="timer-circle-bg"></circle>
                                            <circle cx="125" cy="125" r="115" class="timer-circle-progress pomodoro-progress"></circle>
                                        </svg>
                                        <div class="timer-display">25:00</div>
                                    </div>
                                </div>
                                
                                <div class="pomodoro-controls">
                                    <button id="pomodoro-start" class="pomodoro-btn">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <button id="pomodoro-pause" class="pomodoro-btn" style="display: none;">
                                        <i class="fas fa-pause"></i>
                                    </button>
                                    <button id="pomodoro-skip" class="pomodoro-btn">
                                        <i class="fas fa-forward"></i>
                                    </button>
                                    <button id="pomodoro-reset" class="pomodoro-btn">
                                        <i class="fas fa-undo"></i>
                                    </button>
                                </div>
                                
                                <div class="pomodoro-info">
                                    <div class="pomodoro-counter">
                                        <span id="completed-pomodoros">0</span> pomodoros completed today
                                    </div>
                                </div>
                                
                                <div class="pomodoro-settings">
                                    <button id="settings-toggle" class="settings-toggle-btn">
                                        <i class="fas fa-cog"></i> Settings
                                    </button>
                                    
                                    <div id="pomodoro-settings-panel" class="settings-panel" style="display: none;">
                                        <h4>Timer Settings</h4>
                                        <div class="settings-form">
                                            <div class="form-group">
                                                <label for="work-duration">Focus time (minutes)</label>
                                                <input type="number" id="work-duration" min="1" max="120" value="25">
                                            </div>
                                            <div class="form-group">
                                                <label for="short-break-duration">Short break (minutes)</label>
                                                <input type="number" id="short-break-duration" min="1" max="30" value="5">
                                            </div>
                                            <div class="form-group">
                                                <label for="long-break-duration">Long break (minutes)</label>
                                                <input type="number" id="long-break-duration" min="5" max="60" value="15">
                                            </div>
                                            <div class="form-group">
                                                <label for="long-break-interval">Long break interval</label>
                                                <input type="number" id="long-break-interval" min="1" max="10" value="4">
                                            </div>
                                            <div class="form-group checkbox">
                                                <input type="checkbox" id="auto-start-breaks">
                                                <label for="auto-start-breaks">Auto-start breaks</label>
                                            </div>
                                            <div class="form-group checkbox">
                                                <input type="checkbox" id="auto-start-pomodoros">
                                                <label for="auto-start-pomodoros">Auto-start pomodoros</label>
                                            </div>
                                            <div class="form-group checkbox">
                                                <input type="checkbox" id="ticking-sound">
                                                <label for="ticking-sound">Play ticking sound</label>
                                            </div>
                                            <div class="form-group">
                                                <label for="alarm-sound">Alarm sound</label>
                                                <select id="alarm-sound">
                                                    <option value="default">Default Bell</option>
                                                    <option value="digital">Digital Alarm</option>
                                                    <option value="gentle">Gentle Chime</option>
                                                    <option value="nature">Nature Sound</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label for="alarm-volume">Alarm volume</label>
                                                <input type="range" id="alarm-volume" min="0" max="100" value="80">
                                            </div>
                                            <div class="form-actions">
                                                <button id="save-settings" class="btn-primary">Save Settings</button>
                                                <button id="cancel-settings" class="btn-secondary">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="pomodoro-floating-btn" class="floating-action-btn">
                    <button>
                        <i class="fas fa-clock"></i>
                    </button>
                </div>
            `;
            
            // Append modal to the body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Check if we need to create a notification badge
        const notificationBadge = document.getElementById('pomodoro-notification-badge');
        if (!notificationBadge) {
            const badge = document.createElement('div');
            badge.id = 'pomodoro-notification-badge';
            badge.className = 'notification-badge';
            badge.style.display = 'none';
            document.body.appendChild(badge);
        }
    }
    
    /**
     * Set up event listeners for Pomodoro UI
     */
    function setupEventListeners() {
        // Modal close button
        const closeBtn = document.querySelector('#pomodoro-modal .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                togglePomodoroModal();
            });
        }
        
        // Phase buttons
        const phaseButtons = document.querySelectorAll('.phase-btn');
        phaseButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (isRunning) {
                    // Ask for confirmation before changing phase during active session
                    if (confirm('Changing the phase will reset the current timer. Continue?')) {
                        pauseTimer();
                        changePhase(this.dataset.phase);
                    }
                } else {
                    changePhase(this.dataset.phase);
                }
            });
        });
        
        // Control buttons
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        const skipBtn = document.getElementById('pomodoro-skip');
        const resetBtn = document.getElementById('pomodoro-reset');
        
        if (startBtn) {
            startBtn.addEventListener('click', startTimer);
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', pauseTimer);
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', skipPhase);
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimer);
        }
        
        // Settings toggle
        const settingsToggle = document.getElementById('settings-toggle');
        if (settingsToggle) {
            settingsToggle.addEventListener('click', toggleSettingsPanel);
        }
        
        // Settings save and cancel
        const saveSettingsBtn = document.getElementById('save-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
        
        if (cancelSettingsBtn) {
            cancelSettingsBtn.addEventListener('click', toggleSettingsPanel);
        }
        
        // Floating button
        const floatingBtn = document.getElementById('pomodoro-floating-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', function() {
                togglePomodoroModal();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Only process shortcuts when the modal is open
            const pomodoroModal = document.getElementById('pomodoro-modal');
            if (pomodoroModal && pomodoroModal.style.display === 'block') {
                // Don't process if user is typing in an input field
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                    return;
                }
                
                // Space to start/pause
                if (e.key === ' ' || e.code === 'Space') {
                    e.preventDefault();
                    if (isRunning) {
                        pauseTimer();
                    } else {
                        startTimer();
                    }
                }
                
                // R to reset
                if (e.key === 'r' || e.code === 'KeyR') {
                    resetTimer();
                }
                
                // S to skip
                if (e.key === 's' || e.code === 'KeyS') {
                    skipPhase();
                }
                
                // Escape to close modal
                if (e.key === 'Escape' || e.code === 'Escape') {
                    togglePomodoroModal();
                }
            }
        });
    }
    
    /**
     * Start the timer
     */
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        
        // Update UI
        document.getElementById('pomodoro-start').style.display = 'none';
        document.getElementById('pomodoro-pause').style.display = 'inline-flex';
        
        // Start ticking sound if enabled
        if (timerSettings.tickingSound && currentPhase === 'work') {
            startTickingSound();
        }
        
        // Start the interval
        timerInterval = setInterval(function() {
            // Decrement time
            currentSeconds--;
            
            // Update display
            updateTimerDisplay();
            updatePomodoroProgress();
            
            // Check if timer is complete
            if (currentSeconds <= 0) {
                completePhase();
            }
        }, 1000);
    }
    
    /**
     * Pause the timer
     */
    function pauseTimer() {
        if (!isRunning) return;
        
        isRunning = false;
        
        // Clear interval
        clearInterval(timerInterval);
        
        // Update UI
        document.getElementById('pomodoro-start').style.display = 'inline-flex';
        document.getElementById('pomodoro-pause').style.display = 'none';
        
        // Stop ticking sound if it's playing
        stopTickingSound();
    }
    
    /**
     * Skip to the next phase
     */
    function skipPhase() {
        // Prevent rapid skipping
        if (skipButtonCooldown) return;
        
        skipButtonCooldown = true;
        setTimeout(() => { skipButtonCooldown = false; }, 1000);
        
        // Determine next phase
        let nextPhase;
        
        if (currentPhase === 'work') {
            // After work, determine if it should be a short or long break
            completedPomodoros++;
            document.getElementById('completed-pomodoros').textContent = completedPomodoros;
            
            if (completedPomodoros % timerSettings.longBreakInterval === 0) {
                nextPhase = 'longBreak';
            } else {
                nextPhase = 'shortBreak';
            }
        } else {
            // After any break, go back to work
            nextPhase = 'work';
        }
        
        // Stop current phase
        pauseTimer();
        
        // Start next phase
        changePhase(nextPhase);
        
        // Auto-start if configured
        if ((nextPhase !== 'work' && timerSettings.autoStartBreaks) || 
            (nextPhase === 'work' && timerSettings.autoStartPomodoros)) {
            startTimer();
        }
    }
    
    /**
     * Reset the current timer
     */
    function resetTimer() {
        // Stop the timer
        pauseTimer();
        
        // Reset seconds based on current phase
        switch (currentPhase) {
            case 'work':
                currentSeconds = timerSettings.workDuration;
                break;
            case 'shortBreak':
                currentSeconds = timerSettings.shortBreakDuration;
                break;
            case 'longBreak':
                currentSeconds = timerSettings.longBreakDuration;
                break;
        }
        
        // Update UI
        updateTimerDisplay();
        updatePomodoroProgress();
    }
    
    /**
     * Complete the current phase and move to the next
     */
    function completePhase() {
        // Play alarm sound
        playAlarmSound();
        
        // Show notification
        showPhaseCompleteNotification();
        
        // Log the completed session if it was a work session
        if (currentPhase === 'work') {
            logCompletedPomodoro();
        }
        
        // Skip to next phase
        skipPhase();
    }
    
    /**
     * Change to a specific phase
     * @param {string} phase - The phase to change to ('work', 'shortBreak', 'longBreak')
     */
    function changePhase(phase) {
        // Update current phase
        currentPhase = phase;
        
        // Set seconds based on phase
        switch (phase) {
            case 'work':
                currentSeconds = timerSettings.workDuration;
                break;
            case 'shortBreak':
                currentSeconds = timerSettings.shortBreakDuration;
                break;
            case 'longBreak':
                currentSeconds = timerSettings.longBreakDuration;
                break;
        }
        
        // Update UI
        updateTimerDisplay();
        updatePomodoroProgress();
        updatePhaseButtons();
    }
    
    /**
     * Update the timer display with current time
     */
    function updateTimerDisplay() {
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = formattedTime;
        }
        
        // Update document title if timer is running
        if (isRunning) {
            document.title = `${formattedTime} - ${currentPhase === 'work' ? 'Focus' : 'Break'} - Daily Progress Tracker`;
        } else {
            // Reset title if not running
            document.title = 'Daily Progress Tracker';
        }
    }
    
    /**
     * Update the circular progress indicator
     */
    function updatePomodoroProgress() {
        const progressCircle = document.querySelector('.timer-circle-progress');
        if (!progressCircle) return;
        
        // Calculate total duration based on current phase
        let totalDuration;
        switch (currentPhase) {
            case 'work':
                totalDuration = timerSettings.workDuration;
                break;
            case 'shortBreak':
                totalDuration = timerSettings.shortBreakDuration;
                break;
            case 'longBreak':
                totalDuration = timerSettings.longBreakDuration;
                break;
        }
        
        // Calculate progress percentage
        const progress = currentSeconds / totalDuration;
        
        // Calculate stroke dash offset (circle perimeter is 2 * PI * r)
        const circumference = 2 * Math.PI * 115; // 115 is the radius from the SVG
        const dashOffset = circumference * (1 - progress);
        
        // Update the circle properties
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = dashOffset;
        
        // Set color based on phase
        const phaseColor = getPhaseColor();
        progressCircle.style.stroke = phaseColor;
    }
    
    /**
     * Update phase buttons to highlight current phase
     */
    function updatePhaseButtons() {
        const phaseButtons = document.querySelectorAll('.phase-btn');
        phaseButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.phase === currentPhase) {
                btn.classList.add('active');
            }
        });
    }
    
    /**
     * Get the color for the current phase
     * @returns {string} CSS color value
     */
    function getPhaseColor() {
        switch (currentPhase) {
            case 'work':
                return 'var(--primary-color)';
            case 'shortBreak':
                return 'var(--success-color)';
            case 'longBreak':
                return 'var(--info-color)';
            default:
                return 'var(--primary-color)';
        }
    }
    
    /**
     * Toggle the Pomodoro modal visibility
     */
    function togglePomodoroModal() {
        const modal = document.getElementById('pomodoro-modal');
        if (modal) {
            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    /**
     * Toggle the settings panel visibility
     */
    function toggleSettingsPanel() {
        const settingsPanel = document.getElementById('pomodoro-settings-panel');
        if (settingsPanel) {
            const isVisible = settingsPanel.style.display === 'block';
            settingsPanel.style.display = isVisible ? 'none' : 'block';
            
            // If opening, populate with current settings
            if (!isVisible) {
                populateSettingsForm();
            }
        }
    }
    
    /**
     * Populate the settings form with current values
     */
    function populateSettingsForm() {
        document.getElementById('work-duration').value = timerSettings.workDuration / 60;
        document.getElementById('short-break-duration').value = timerSettings.shortBreakDuration / 60;
        document.getElementById('long-break-duration').value = timerSettings.longBreakDuration / 60;
        document.getElementById('long-break-interval').value = timerSettings.longBreakInterval;
        document.getElementById('auto-start-breaks').checked = timerSettings.autoStartBreaks;
        document.getElementById('auto-start-pomodoros').checked = timerSettings.autoStartPomodoros;
        document.getElementById('alarm-sound').value = timerSettings.alarmSound;
        document.getElementById('alarm-volume').value = timerSettings.alarmVolume;
        document.getElementById('ticking-sound').checked = timerSettings.tickingSound;
    }
    
    /**
     * Save settings from form
     */
    function saveSettings() {
        // Get values from form
        const workDuration = parseInt(document.getElementById('work-duration').value);
        const shortBreakDuration = parseInt(document.getElementById('short-break-duration').value);
        const longBreakDuration = parseInt(document.getElementById('long-break-duration').value);
        const longBreakInterval = parseInt(document.getElementById('long-break-interval').value);
        const autoStartBreaks = document.getElementById('auto-start-breaks').checked;
        const autoStartPomodoros = document.getElementById('auto-start-pomodoros').checked;
        const alarmSound = document.getElementById('alarm-sound').value;
        const alarmVolume = parseInt(document.getElementById('alarm-volume').value);
        const tickingSound = document.getElementById('ticking-sound').checked;
        
        // Validate inputs
        if (workDuration < 1 || shortBreakDuration < 1 || longBreakDuration < 5 || longBreakInterval < 1) {
            alert('Please enter valid values for all time settings.');
            return;
        }
        
        // Update settings
        timerSettings = {
            workDuration: workDuration * 60,
            shortBreakDuration: shortBreakDuration * 60,
            longBreakDuration: longBreakDuration * 60,
            longBreakInterval: longBreakInterval,
            autoStartBreaks: autoStartBreaks,
            autoStartPomodoros: autoStartPomodoros,
            alarmSound: alarmSound,
            alarmVolume: alarmVolume,
            tickingSound: tickingSound
        };
        
        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(timerSettings));
        
        // Reset timer with new settings
        resetTimer();
        
        // Close settings panel
        toggleSettingsPanel();
        
        // Show success toast
        showToast('Settings saved successfully', 'success');
    }
    
    /**
     * Play the alarm sound when a phase completes
     */
    function playAlarmSound() {
        const sound = new Audio(`assets/sounds/${timerSettings.alarmSound}.mp3`);
        sound.volume = timerSettings.alarmVolume / 100;
        sound.play();
    }
    
    /**
     * Start playing the ticking sound
     */
    function startTickingSound() {
        // Implement if you have a ticking sound file
        // This would create an audio loop for the ticking sound
    }
    
    /**
     * Stop the ticking sound
     */
    function stopTickingSound() {
        // Implement to stop the ticking sound
    }
    
    /**
     * Show a notification when a phase completes
     */
    function showPhaseCompleteNotification() {
        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
            let title, body;
            
            if (currentPhase === 'work') {
                title = 'Focus Session Complete!';
                body = 'Take a break now.';
            } else {
                title = 'Break Complete!';
                body = 'Ready to focus again?';
            }
            
            const notification = new Notification(title, {
                body: body,
                icon: 'assets/icons/pomodoro-icon.png'
            });
        }
        
        // In-app notification
        const badge = document.getElementById('pomodoro-notification-badge');
        if (badge) {
            let message;
            
            if (currentPhase === 'work') {
                message = 'Focus session complete!';
            } else {
                message = 'Break complete!';
            }
            
            badge.textContent = message;
            badge.style.display = 'block';
            
            // Hide after 5 seconds
            setTimeout(() => {
                badge.style.display = 'none';
            }, 5000);
        }
        
        // Show toast notification
        let message;
        if (currentPhase === 'work') {
            message = 'Focus session complete! Take a break.';
        } else {
            message = 'Break complete! Ready to focus again?';
        }
        
        showToast(message, 'info');
    }
    
    /**
     * Log a completed pomodoro session
     */
    function logCompletedPomodoro() {
        completedPomodoros++;
        document.getElementById('completed-pomodoros').textContent = completedPomodoros;
        
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Get saved pomodoro history
        const pomodoroHistory = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
        
        // Update today's count
        if (!pomodoroHistory[today]) {
            pomodoroHistory[today] = 0;
        }
        pomodoroHistory[today]++;
        
        // Save updated history
        localStorage.setItem('pomodoroHistory', JSON.stringify(pomodoroHistory));
        
        // Update analytics if the function exists
        if (typeof updateAnalytics === 'function') {
            updateAnalytics();
        }
    }
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, info, warning)
     */
    function showToast(message, type) {
        // Check if there's a global toast function
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        
        // Create a toast element if none exists
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set toast content
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }, 10);
    }
    
    // Export functions for external use
    window.initPomodoro = initPomodoro;
    window.togglePomodoroModal = togglePomodoroModal;
}

// Export for app.js initialization
window.initPomodoro = initPomodoro; 