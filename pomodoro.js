// Pomodoro Timer Implementation
document.addEventListener('DOMContentLoaded', function() {
    initPomodoro();
    
    // Ensure that even after DOM has loaded, we can still detect if elements are added later
    setupDirectButtonHandlers();
});

// Set up direct button click handlers that will monitor the DOM
function setupDirectButtonHandlers() {
    console.log('Setting up direct button handlers for timer buttons');
    
    // First try immediately
    attachDirectButtonHandlers();
    
    // Then set up a MutationObserver to keep checking for button elements
    const observer = new MutationObserver(function(mutations) {
        attachDirectButtonHandlers();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also set up an interval as a fallback
    setInterval(attachDirectButtonHandlers, 1000);
}

// Directly attach click handlers to the buttons
function attachDirectButtonHandlers() {
    // Find all potential start buttons
    const startButtons = document.querySelectorAll('#pomodoro-start, .pomodoro-btn.primary, button[data-action="start-timer"]');
    if (startButtons.length > 0) {
        console.log(`Found ${startButtons.length} start buttons, attaching direct handlers`);
        
        startButtons.forEach(btn => {
            // Remove existing handlers to prevent duplicates
            btn.removeEventListener('click', directStartTimer);
            
            // Add fresh handler
            btn.addEventListener('click', directStartTimer);
            console.log('Attached direct start handler to:', btn);
            
            // Also make sure the button is not disabled
            btn.disabled = false;
            
            // Add inline onclick as another fallback
            if (!btn.hasAttribute('onclick')) {
                btn.setAttribute('onclick', 'window.startPomodoro(); return false;');
                console.log('Added inline onclick attribute');
            }
        });
    }
    
    // Do the same for other buttons
    document.querySelectorAll('#pomodoro-pause, button[data-action="pause-timer"]').forEach(btn => {
        btn.removeEventListener('click', directPauseTimer);
        btn.addEventListener('click', directPauseTimer);
        btn.disabled = false;
    });
    
    document.querySelectorAll('#pomodoro-skip, button[data-action="skip-timer"]').forEach(btn => {
        btn.removeEventListener('click', directSkipTimer);
        btn.addEventListener('click', directSkipTimer);
        btn.disabled = false;
    });
    
    document.querySelectorAll('#pomodoro-reset, button[data-action="reset-timer"]').forEach(btn => {
        btn.removeEventListener('click', directResetTimer);
        btn.addEventListener('click', directResetTimer);
        btn.disabled = false;
    });
}

// Direct timer functions that call the global window functions
function directStartTimer(e) {
    console.log('Direct start button clicked!', e.target);
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    
    if (window.startPomodoro) {
        window.startPomodoro();
    } else if (window.pomodoroStartTimer) {
        window.pomodoroStartTimer();
    } else {
        console.error('No start timer function available!');
        // Try to find the startTimer function in the current scope
        if (typeof startTimer === 'function') {
            startTimer();
        }
    }
    return false;
}

function directPauseTimer(e) {
    if (e) e.preventDefault();
    if (window.pausePomodoro) window.pausePomodoro();
    return false;
}

function directSkipTimer(e) {
    if (e) e.preventDefault();
    if (window.skipPomodoro) window.skipPomodoro();
    return false;
}

function directResetTimer(e) {
    if (e) e.preventDefault();
    if (window.resetPomodoro) window.resetPomodoro();
    return false;
}

// Global startPomodoro function for direct button click
window.startPomodoro = function() {
    console.log('Global startPomodoro function called');
    if (window.pomodoroStartTimer) {
        window.pomodoroStartTimer();
    } else {
        console.error('Pomodoro start timer function not available');
        // Last-resort fallback: try to access startTimer directly
        directFallbackTimerStart();
    }
};

// Fallback to directly invoke the timer start function
function directFallbackTimerStart() {
    console.log('Using direct fallback timer start');
    try {
        // Try to find any active pomodoro timer instance and directly manipulate the state
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            console.log('Found timer circle, adding pulsate class');
            timerCircle.classList.add('pulsate');
        }
        
        // Toggle button visibility directly
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        
        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'flex';
        
        // Get the current time value from the UI
        const minutesEl = document.getElementById('pomodoro-minutes');
        const secondsEl = document.getElementById('pomodoro-seconds');
        
        if (minutesEl && secondsEl) {
            let minutes = parseInt(minutesEl.textContent) || 25;
            let seconds = parseInt(secondsEl.textContent) || 0;
            let totalSeconds = minutes * 60 + seconds;
            
            console.log(`Starting manual timer with ${minutes}:${seconds} (${totalSeconds} seconds)`);
            
            // Set up our own interval to update the timer
            const timerInterval = setInterval(function() {
                if (totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    console.log('Timer completed');
                    
                    // Try to show start button again
                    if (startBtn) startBtn.style.display = 'flex';
                    if (pauseBtn) pauseBtn.style.display = 'none';
                    
                    // Remove pulsate class
                    if (timerCircle) timerCircle.classList.remove('pulsate');
                    return;
                }
                
                totalSeconds--;
                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                
                if (minutesEl) minutesEl.textContent = mins.toString().padStart(2, '0');
                if (secondsEl) secondsEl.textContent = secs.toString().padStart(2, '0');
                
                // Update progress circle if available
                updateManualProgress(mins, secs, totalSeconds);
            }, 1000);
            
            // Store the interval on window to be accessible for pausing
            window.manualTimerInterval = timerInterval;
        }
    } catch (error) {
        console.error('Error starting fallback timer:', error);
    }
}

// Manual progress circle update
function updateManualProgress(minutes, seconds, currentSeconds) {
    const progressCircle = document.querySelector('.timer-circle-progress');
    if (!progressCircle) return;
    
    // Try to determine the total duration
    const phaseButtons = document.querySelectorAll('.phase-btn');
    let currentPhase = 'work';
    
    phaseButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
            currentPhase = btn.getAttribute('data-phase') || 'work';
        }
    });
    
    // Estimate total duration based on typical defaults
    let totalDuration = 25 * 60; // Default work duration
    
    if (currentPhase === 'shortBreak') {
        totalDuration = 5 * 60;
    } else if (currentPhase === 'longBreak') {
        totalDuration = 15 * 60;
    }
    
    // If this is the start of the timer, estimate total from current display
    if (window.estimatedTotalDuration === undefined) {
        window.estimatedTotalDuration = minutes * 60 + seconds;
        totalDuration = window.estimatedTotalDuration;
    } else {
        totalDuration = window.estimatedTotalDuration;
    }
    
    // Calculate the progress percentage (from full to empty)
    const fullCircumference = 879.6; // 2 * π * 140 (circle radius)
    const elapsedTime = totalDuration - currentSeconds;
    const progressPercentage = (elapsedTime / totalDuration);
    const offset = fullCircumference * (1 - progressPercentage);
    
    // Apply the stroke-dashoffset for smooth animation
    progressCircle.style.strokeDashoffset = offset;
}

// Global pausePomodoro function for direct button click
window.pausePomodoro = function() {
    console.log('Global pausePomodoro function called');
    if (window.pomodoroPauseTimer) {
        window.pomodoroPauseTimer();
    } else {
        console.error('Pomodoro pause timer function not available');
        // If we're using the manual interval, clear it
        if (window.manualTimerInterval) {
            clearInterval(window.manualTimerInterval);
            window.manualTimerInterval = null;
            
            // Toggle button visibility directly
            const startBtn = document.getElementById('pomodoro-start');
            const pauseBtn = document.getElementById('pomodoro-pause');
            
            if (startBtn) startBtn.style.display = 'flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
            
            // Remove pulsate class
            const timerCircle = document.querySelector('.timer-circle');
            if (timerCircle) timerCircle.classList.remove('pulsate');
        }
    }
};

// Global skipPomodoro function for direct button click
window.skipPomodoro = function() {
    console.log('Global skipPomodoro function called');
    if (window.pomodoroSkipPhase) {
        window.pomodoroSkipPhase();
    } else {
        console.error('Pomodoro skip phase function not available');
    }
};

// Global resetPomodoro function for direct button click
window.resetPomodoro = function() {
    console.log('Global resetPomodoro function called');
    if (window.pomodoroResetTimer) {
        window.pomodoroResetTimer();
    } else {
        console.error('Pomodoro reset timer function not available');
        // Clear any manual interval
        if (window.manualTimerInterval) {
            clearInterval(window.manualTimerInterval);
            window.manualTimerInterval = null;
        }
        
        // Reset the UI elements directly
        const minutesEl = document.getElementById('pomodoro-minutes');
        const secondsEl = document.getElementById('pomodoro-seconds');
        
        if (minutesEl) minutesEl.textContent = '25';
        if (secondsEl) secondsEl.textContent = '00';
        
        // Toggle button visibility directly
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        
        if (startBtn) startBtn.style.display = 'flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        // Remove pulsate class
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) timerCircle.classList.remove('pulsate');
        
        // Reset progress circle
        const progressCircle = document.querySelector('.timer-circle-progress');
        if (progressCircle) progressCircle.style.strokeDashoffset = 0;
        
        // Reset estimated total duration
        window.estimatedTotalDuration = undefined;
    }
};

// Global savePomodoro function for direct button click
window.savePomodoro = function() {
    console.log('Global savePomodoro function called');
    if (window.pomodoroSaveSettings) {
        window.pomodoroSaveSettings();
    } else {
        console.error('Pomodoro save settings function not available');
    }
};

/**
 * Initialize Pomodoro timer functionality
 */
function initPomodoro() {
    console.log('Initializing Pomodoro timer...');
    
    // Variables for timer state
    let isRunning = false;
    let timerInterval = null;
    let currentSeconds = 0;
    let totalSeconds = 0;
    let currentPhase = 'work'; // 'work', 'shortBreak', 'longBreak'
    let completedPomodoros = 0;
    let skipButtonCooldown = false;
    let sessionHistory = [];
    
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
    
    // Audio elements
    let alarmAudio = new Audio('./assets/sounds/bell.mp3');
    let tickingAudio = new Audio('./assets/sounds/ticking.mp3');
    tickingAudio.loop = true;
    
    // Load user settings from localStorage
    loadPomodoroSettings();
    
    // Load session history
    loadSessionHistory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize timer display
    resetTimer();
    updateTimerDisplay();
    updatePomodoroProgress();
    updatePhaseButtons();
    updateStats();
    
    // Make timer functions available globally
    window.pomodoroStartTimer = startTimer;
    window.pomodoroPauseTimer = pauseTimer;
    window.pomodoroSkipPhase = skipPhase;
    window.pomodoroResetTimer = resetTimer;
    window.pomodoroSaveSettings = saveSettings;
    
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
        
        // Populate settings form with current values
        populateSettingsForm();
    }
    
    /**
     * Load session history from localStorage
     */
    function loadSessionHistory() {
        const savedHistory = JSON.parse(localStorage.getItem('pomodoroHistory'));
        if (savedHistory && Array.isArray(savedHistory)) {
            sessionHistory = savedHistory;
        }
        
        // Display session history
        displaySessionHistory();
    }
    
    /**
     * Set up event listeners for Pomodoro functionality
     */
    function setupEventListeners() {
        // Navigation item
        const pomodoroNavItem = document.getElementById('pomodoro-nav-item');
        if (pomodoroNavItem) {
            pomodoroNavItem.addEventListener('click', function() {
                // Any specific actions when navigating to Pomodoro section
            });
        }
        
        // Phase buttons
        const phaseButtons = document.querySelectorAll('.phase-btn');
        phaseButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const phase = this.getAttribute('data-phase');
                setActivePhase(phase);
            });
        });
        
        // Timer buttons
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        const skipBtn = document.getElementById('pomodoro-skip');
        const resetBtn = document.getElementById('pomodoro-reset');
        
        console.log('Timer buttons:', { startBtn, pauseBtn, skipBtn, resetBtn });
        
        if (startBtn) {
            console.log('Adding click event listener to start button');
            startBtn.addEventListener('click', function() {
                console.log('Start button clicked');
                startTimer();
            });
        } else {
            console.error('Start button not found in the DOM');
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
        
        // Settings form
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
    }
    
    /**
     * Populate settings form with current values
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
    }
    
    /**
     * Save timer settings from form
     */
    function saveSettings() {
        // Get values from form
        const workDuration = parseInt(document.getElementById('work-duration').value) * 60;
        const shortBreakDuration = parseInt(document.getElementById('short-break-duration').value) * 60;
        const longBreakDuration = parseInt(document.getElementById('long-break-duration').value) * 60;
        const longBreakInterval = parseInt(document.getElementById('long-break-interval').value);
        const autoStartBreaks = document.getElementById('auto-start-breaks').checked;
        const autoStartPomodoros = document.getElementById('auto-start-pomodoros').checked;
        const alarmSound = document.getElementById('alarm-sound').value;
        const alarmVolume = parseInt(document.getElementById('alarm-volume').value);
        
        // Validate values
        if (isNaN(workDuration) || isNaN(shortBreakDuration) || isNaN(longBreakDuration) || 
            isNaN(longBreakInterval) || isNaN(alarmVolume)) {
            showToast('Please enter valid numbers for all fields', 'error');
                    return;
                }
                
        // Update settings
        timerSettings = {
            workDuration,
            shortBreakDuration,
            longBreakDuration,
            longBreakInterval,
            autoStartBreaks,
            autoStartPomodoros,
            alarmSound,
            alarmVolume
        };
        
        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(timerSettings));
        
        // Reset timer with new settings
                    resetTimer();
        
        // Show success message
        showToast('Settings saved successfully', 'success');
    }
    
    /**
     * Set the active phase (work, shortBreak, longBreak)
     */
    function setActivePhase(phase) {
        if (phase === currentPhase) return;
        
        // Update phase
        currentPhase = phase;
        
        // Update UI
        updatePhaseButtons();
        resetTimer();
        updateTimerDisplay();
        updatePomodoroProgress();
        
        // Update container class for styling
        const container = document.querySelector('.pomodoro-container');
        if (container) {
            container.className = 'pomodoro-container ' + currentPhase;
        }
    }
    
    /**
     * Start the timer
     */
    function startTimer() {
        console.log('startTimer called. isRunning:', isRunning);
        
        if (isRunning) {
            console.log('Timer is already running, exiting startTimer');
            return;
        }
        
        isRunning = true;
        console.log('isRunning set to true');
        
        // Hide start button, show pause button
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        
        console.log('Start/Pause buttons found:', { startBtn, pauseBtn });
        
        if (startBtn) {
            startBtn.style.display = 'none';
            console.log('Start button hidden');
        }
        
        if (pauseBtn) {
            pauseBtn.style.display = 'flex';
            console.log('Pause button shown');
        }
        
        // Add pulsing animation to timer
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            timerCircle.classList.add('pulsate');
            console.log('Added pulsate class to timer circle');
        } else {
            console.error('Timer circle element not found');
        }
        
        // Start ticking sound if enabled
        if (timerSettings.tickingSound && currentPhase === 'work') {
            startTickingSound();
        }
        
        // Start the interval
        console.log('Starting timer interval');
        timerInterval = setInterval(function() {
            console.log('Timer tick, currentSeconds:', currentSeconds);
            
            if (currentSeconds <= 0) {
                console.log('Timer completed, calling completePhase()');
                completePhase();
                return;
            }
            
            currentSeconds--;
            updateTimerDisplay();
            updatePomodoroProgress();
        }, 1000);
        
        // Store the interval ID in a global variable for emergency access
        window.pomodoroTimerInterval = timerInterval;
        
        console.log('Timer interval started:', timerInterval);
    }
    
    /**
     * Pause the timer
     */
    function pauseTimer() {
        console.log('pauseTimer called, isRunning:', isRunning);
        
        // If timer is not running, exit
        if (!isRunning) {
            console.log('Timer is not running, exiting pauseTimer');
            return;
        }

        // Clear the timer interval
        if (timerInterval) {
            console.log('Clearing timerInterval:', timerInterval);
        clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Also check global pomodoro timer interval
        if (window.pomodoroTimerInterval) {
            console.log('Clearing global pomodoroTimerInterval:', window.pomodoroTimerInterval);
            clearInterval(window.pomodoroTimerInterval);
            window.pomodoroTimerInterval = null;
        }
        
        // Also try to clear any other potential intervals by ID
        try {
            for (let i = 1; i <= 100; i++) {
                clearInterval(i);
            }
        } catch (e) {
            console.log('Error clearing interval IDs:', e);
        }

        // Update the timer status
        isRunning = false;
        
        // Update UI
        document.getElementById('start-btn').style.display = 'inline-block';
        document.getElementById('pause-btn').style.display = 'none';
        document.getElementById('pomodoro-start').style.display = 'inline-block';
        document.getElementById('pomodoro-pause').style.display = 'none';
        
        // Remove pulsing animation from timer circle
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            timerCircle.classList.remove('pulsing');
        }
        
        // Stop ticking sound
        stopTicking();
        
        // If we have our force pause as backup, use it
        if (window.FORCE_PAUSE_TIMER) {
            console.log('Using FORCE_PAUSE_TIMER as backup');
            window.FORCE_PAUSE_TIMER();
        }
        
        console.log('Pause operation complete!');
    }
    
    /**
     * Skip to the next phase
     */
    function skipPhase() {
        if (skipButtonCooldown) return;
        
        // Set cooldown to prevent rapid skipping
        skipButtonCooldown = true;
        setTimeout(() => { skipButtonCooldown = false; }, 1000);
        
        // Stop the current timer
        if (isRunning) {
            pauseTimer();
        }
        
        // Ensure all intervals are cleared
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        // Also clear the global reference
        if (window.pomodoroTimerInterval) {
            clearInterval(window.pomodoroTimerInterval);
            window.pomodoroTimerInterval = null;
        }
        
        // Log the skipped session if it was a work session
        if (currentPhase === 'work' && totalSeconds - currentSeconds > 60) {
            // Only log if the session ran for at least 1 minute
            logSession(currentPhase, totalSeconds - currentSeconds);
        }
        
        // Determine next phase
        completePhase();
    }
    
    /**
     * Reset the timer
     */
    function resetTimer() {
        // Stop the timer if it's running
        if (isRunning) {
        pauseTimer();
        }
        
        // Ensure all intervals are cleared
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        // Also clear the global reference
        if (window.pomodoroTimerInterval) {
            clearInterval(window.pomodoroTimerInterval);
            window.pomodoroTimerInterval = null;
        }
        
        // Reset isRunning flag
        isRunning = false;
        
        // Set the correct duration based on the current phase
        switch (currentPhase) {
            case 'work':
                currentSeconds = timerSettings.workDuration;
                document.getElementById('current-task-name').textContent = 'Focus Session';
                document.getElementById('pomodoro-status').textContent = `Work Session ${(completedPomodoros % timerSettings.longBreakInterval) + 1}/${timerSettings.longBreakInterval}`;
                break;
            case 'shortBreak':
                currentSeconds = timerSettings.shortBreakDuration;
                document.getElementById('current-task-name').textContent = 'Short Break';
                document.getElementById('pomodoro-status').textContent = 'Take a quick break';
                break;
            case 'longBreak':
                currentSeconds = timerSettings.longBreakDuration;
                document.getElementById('current-task-name').textContent = 'Long Break';
                document.getElementById('pomodoro-status').textContent = 'Take a longer break';
                break;
        }
        
        totalSeconds = currentSeconds;
        
        // Show start button, hide pause button
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        
        if (startBtn) startBtn.style.display = 'flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        // Remove pulsing animation
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) timerCircle.classList.remove('pulsate');
        
        // Update the display
        updateTimerDisplay();
        updatePomodoroProgress();
    }
    
    /**
     * Complete the current phase and move to the next one
     */
    function completePhase() {
        // Stop the timer
        if (isRunning) {
            pauseTimer();
        }
        
        // Play alarm sound
        playAlarmSound();
        
        // Show notification
        showPhaseCompleteNotification();
        
        // Log completed session
        if (currentPhase === 'work') {
            completedPomodoros++;
            logSession(currentPhase, totalSeconds);
            logCompletedPomodoro();
        }
        
        // Determine next phase
        if (currentPhase === 'work') {
            // After work session, determine if it's time for a long break
            if (completedPomodoros % timerSettings.longBreakInterval === 0) {
                setActivePhase('longBreak');
            } else {
                setActivePhase('shortBreak');
            }
        } else {
            // After any break, always go back to work
            setActivePhase('work');
        }
        
        // Auto-start next phase if enabled
        if ((currentPhase === 'work' && timerSettings.autoStartPomodoros) || 
            (currentPhase !== 'work' && timerSettings.autoStartBreaks)) {
            startTimer();
        }
        
        // Update stats
        updateStats();
    }
    
    /**
     * Update the timer display with the current time
     */
    function updateTimerDisplay() {
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        
        document.getElementById('pomodoro-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('pomodoro-seconds').textContent = seconds.toString().padStart(2, '0');
        
        // Update page title with timer
        document.title = `(${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}) Better Productivity`;
    }
    
    /**
     * Update the progress bar/circle to show current timer progress
     */
    function updatePomodoroProgress() {
        const progressCircle = document.querySelector('.timer-circle-progress');
        if (!progressCircle) return;
        
        // Calculate progress percentage based on current phase duration
        let totalDuration = 0;
        
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
        
        // Calculate the progress percentage (from full circumference to 0)
        const fullCircumference = 879.6; // 2 * π * 140 (circle radius)
        const elapsedTime = totalDuration - currentSeconds;
        const progressPercentage = (elapsedTime / totalDuration);
        const offset = fullCircumference * (1 - progressPercentage);
        
        // Apply the stroke-dashoffset for smooth animation
        progressCircle.style.strokeDashoffset = offset;
        
        // Update container class based on current phase
        const container = document.querySelector('.pomodoro-container');
        if (container) {
            container.className = `pomodoro-container ${currentPhase}`;
        }
    }
    
    /**
     * Update the phase buttons to highlight the active phase
     */
    function updatePhaseButtons() {
        document.querySelectorAll('.phase-btn').forEach(btn => {
            const phase = btn.getAttribute('data-phase');
            if (phase === currentPhase) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    /**
     * Play the alarm sound when a phase completes
     */
    function playAlarmSound() {
        // Set the correct sound file
        switch (timerSettings.alarmSound) {
            case 'default':
                alarmAudio.src = './assets/sounds/bell.mp3';
                break;
            case 'digital':
                alarmAudio.src = './assets/sounds/digital-alarm.mp3';
                break;
            case 'gentle':
                alarmAudio.src = './assets/sounds/gentle-chime.mp3';
                break;
            case 'nature':
                alarmAudio.src = './assets/sounds/nature-sound.mp3';
                break;
            default:
                alarmAudio.src = './assets/sounds/bell.mp3';
        }
        
        // Set volume and play
        alarmAudio.volume = timerSettings.alarmVolume / 100;
        alarmAudio.play();
    }
    
    /**
     * Start the ticking sound during work sessions
     */
    function startTickingSound() {
        if (!timerSettings.tickingSound) return;
        
        tickingAudio.volume = 0.2;
        tickingAudio.play();
    }
    
    /**
     * Stop the ticking sound
     */
    function stopTickingSound() {
        tickingAudio.pause();
        tickingAudio.currentTime = 0;
    }
    
    /**
     * Show a notification when a phase completes
     */
    function showPhaseCompleteNotification() {
        let title = '';
        let body = '';
        
        switch (currentPhase) {
            case 'work':
                title = 'Work Session Complete!';
                if (completedPomodoros % timerSettings.longBreakInterval === 0) {
                    body = "Time for a long break. You've earned it!";
                } else {
                    body = 'Time for a short break!';
                }
                break;
            case 'shortBreak':
                title = 'Break Complete!';
                body = 'Ready to get back to work?';
                break;
            case 'longBreak':
                title = 'Long Break Complete!';
                body = 'Ready for another productive session?';
                break;
        }
        
        // Show browser notification if supported and permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: './assets/images/logo.png'
            });
        }
        
        // Always show toast
        showToast(title + ' ' + body, 'info');
    }
    
    /**
     * Log a completed pomodoro to the stats
     */
    function logCompletedPomodoro() {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get or initialize stats
        let stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
        
        if (!stats[today]) {
            stats[today] = {
                completedSessions: 0,
                totalMinutes: 0,
                streak: 0
            };
            
            // Calculate streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            
            if (stats[yesterdayString]) {
                stats[today].streak = stats[yesterdayString].streak + 1;
            } else {
                stats[today].streak = 1;
            }
        }
        
        // Update today's stats
        stats[today].completedSessions++;
        stats[today].totalMinutes += Math.round(timerSettings.workDuration / 60);
        
        // Save updated stats
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        
        // Update UI
        updateStats();
    }
    
    /**
     * Log a session to the history
     */
    function logSession(phase, duration) {
        const now = new Date();
        const session = {
            id: Date.now(),
            type: phase,
            duration: duration,
            timestamp: now.toISOString(),
            formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            formattedDate: now.toLocaleDateString()
        };
        
        // Add to history
        sessionHistory.unshift(session);
        
        // Keep only the last 50 sessions to prevent localStorage bloat
        if (sessionHistory.length > 50) {
            sessionHistory = sessionHistory.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem('pomodoroHistory', JSON.stringify(sessionHistory));
        
        // Update the UI
        displaySessionHistory();
    }
    
    /**
     * Display session history from localStorage
     */
    function displaySessionHistory() {
        const historyList = document.getElementById('pomodoro-history-list');
        const noSessionsMessage = document.getElementById('no-sessions-message');
        
        if (!historyList || !noSessionsMessage) return;
        
        // Clear current list
        historyList.innerHTML = '';
        
        // Check if we have any sessions
        if (sessionHistory.length === 0) {
            historyList.appendChild(noSessionsMessage);
            return;
            } else {
            // Hide no sessions message
            noSessionsMessage.style.display = 'none';
        }
        
        // Display most recent 10 sessions
        const recentSessions = [...sessionHistory].reverse().slice(0, 10);
        
        recentSessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = `pomodoro-history-item`;
            
            // Format date/time
            const sessionDate = new Date(session.timestamp);
            const formattedTime = sessionDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            const formattedDate = sessionDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
            });
            
            // Get phase label
            let phaseLabel = 'Focus';
            if (session.type === 'shortBreak') phaseLabel = 'Short Break';
            if (session.type === 'longBreak') phaseLabel = 'Long Break';
            
            // Calculate duration in minutes and seconds
            const minutes = Math.floor(session.duration / 60);
            const seconds = session.duration % 60;
            const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            sessionItem.innerHTML = `
                <div class="history-item-time">${formattedDate} at ${formattedTime}</div>
                <div class="history-item-phase ${session.type}">${phaseLabel}</div>
                <div class="history-item-duration">
                    <i class="fa-regular fa-clock"></i> ${durationText} minutes
                </div>
            `;
            
            historyList.appendChild(sessionItem);
        });
    }
    
    /**
     * Update statistics display
     */
    function updateStats() {
        const todaySessions = document.getElementById('today-sessions');
        const todayMinutes = document.getElementById('today-minutes');
        const currentStreakElement = document.getElementById('current-streak');
        
        if (!todaySessions || !todayMinutes || !currentStreakElement) return;
        
        // Get today's date
        const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        
        // Filter sessions for today
        const todaysCompletedSessions = sessionHistory.filter(session => {
            const sessionDate = new Date(session.timestamp);
            const sessionDateStr = sessionDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            return sessionDateStr === today && session.type === 'work';
        });
        
        // Update completed sessions count
        todaySessions.textContent = todaysCompletedSessions.length;
        
        // Calculate total focused minutes today
        const totalMinutes = todaysCompletedSessions.reduce((total, session) => {
            return total + Math.floor(session.duration / 60);
        }, 0);
        
        todayMinutes.textContent = totalMinutes;
        
        // Calculate current streak (consecutive days with completed sessions)
        let streak = 0;
        if (sessionHistory.length > 0) {
            // Get unique dates from session history in descending order
            const dates = [...new Set(sessionHistory
                .filter(session => session.type === 'work')
                .map(session => {
                    const date = new Date(session.timestamp);
                    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                })
            )].sort().reverse();
            
            // Calculate streak by checking consecutive days
            if (dates.includes(today)) {
                streak = 1;
                
                // Check previous days
                const checkDate = new Date();
                while (streak < dates.length) {
                    checkDate.setDate(checkDate.getDate() - streak);
                    const dateStr = checkDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                    
                    if (dates.includes(dateStr)) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }
        
        currentStreakElement.textContent = streak;
    }
    
    /**
     * Show a toast message
     */
    function showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set toast content and type
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 
                                      type === 'error' ? 'fa-exclamation-circle' : 
                                      'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <div class="toast-progress"></div>
        `;
        
        toast.className = `toast toast-${type} show`;
            
        // Hide toast after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
    }
    }
    
// Make initPomodoro available globally
    window.initPomodoro = initPomodoro;

// Save pomodoro session stats
function savePomodoroSession(duration, type, task) {
    const now = new Date();
    const sessionData = {
        date: now.toISOString(),
        duration: duration,
        type: type,
        task: task || null,
        completed: true
    };
    
    // Get existing stats or initialize new array
    let pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats') || '[]');
    
    // Add new session
    pomodoroStats.push(sessionData);
    
    // Save to localStorage
    localStorage.setItem('pomodoroStats', JSON.stringify(pomodoroStats));
    
    // Dispatch event that a pomodoro was completed
    document.dispatchEvent(new CustomEvent('pomodoro:completed', {
        detail: {
            duration: duration,
            type: type,
            task: task
        }
    }));
    
    console.log('Saved pomodoro session:', sessionData);
} 