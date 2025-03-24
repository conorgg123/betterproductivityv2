// Focus Mode Implementation
document.addEventListener('DOMContentLoaded', () => {
    initFocusMode();
});

/**
 * Initialize Focus Mode functionality
 */
function initFocusMode() {
    console.log('Initializing Focus Mode...');
    
    // DOM Elements
    const focusModeToggle = document.getElementById('focus-mode-toggle');
    const focusModeExitBtn = document.getElementById('exit-focus-mode');
    const appContainer = document.querySelector('.app-container');
    const focusModeOverlay = document.getElementById('focus-mode-overlay');
    const activeFocusTask = document.getElementById('active-focus-task');
    
    // Variables
    let isFocusModeActive = false;
    let currentFocusTask = null;
    
    // Check if we have a stored focus state
    if (localStorage.getItem('focusModeActive') === 'true') {
        enableFocusMode(JSON.parse(localStorage.getItem('focusModeTask') || 'null'));
    }
    
    // Add event listeners
    if (focusModeToggle) {
        focusModeToggle.addEventListener('click', () => {
            if (isFocusModeActive) {
                disableFocusMode();
            } else {
                // Ask what to focus on
                showFocusTaskSelection();
            }
        });
    }
    
    if (focusModeExitBtn) {
        focusModeExitBtn.addEventListener('click', disableFocusMode);
    }
    
    // Add keyboard shortcut (Alt+F) to toggle focus mode
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'f') {
            if (isFocusModeActive) {
                disableFocusMode();
            } else {
                showFocusTaskSelection();
            }
            e.preventDefault();
        } else if (e.key === 'Escape' && isFocusModeActive) {
            disableFocusMode();
        }
    });
    
    /**
     * Show dialog to select a task to focus on
     */
    function showFocusTaskSelection() {
        // Get active tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const pendingTasks = tasks.filter(task => !task.completed);
        
        // Create dialog
        const focusDialog = document.createElement('div');
        focusDialog.className = 'focus-task-dialog';
        focusDialog.innerHTML = `
            <div class="focus-task-dialog-content">
                <h3>What would you like to focus on?</h3>
                <div class="focus-task-options">
                    <div class="focus-task-option custom">
                        <input type="text" id="custom-focus-task" placeholder="Custom focus task...">
                        <button id="start-custom-focus">Start Focus</button>
                    </div>
                    <div class="focus-task-separator">OR</div>
                    <div class="focus-task-option tasks">
                        <h4>Select from your tasks:</h4>
                        <div class="focus-task-list">
                            ${pendingTasks.length > 0 
                                ? pendingTasks.map(task => `
                                    <div class="focus-task-item" data-id="${task.id}" data-title="${task.description}">
                                        <span class="focus-task-priority ${task.priority}"></span>
                                        <span class="focus-task-title">${task.description}</span>
                                    </div>
                                `).join('')
                                : '<p class="no-tasks-message">No pending tasks available</p>'
                            }
                        </div>
                    </div>
                </div>
                <div class="focus-task-actions">
                    <button id="cancel-focus-selection">Cancel</button>
                </div>
            </div>
        `;
        
        // Add dialog to body
        document.body.appendChild(focusDialog);
        
        // Animate in
        setTimeout(() => {
            focusDialog.classList.add('active');
        }, 10);
        
        // Event listeners for dialog
        const customFocusInput = document.getElementById('custom-focus-task');
        const startCustomFocusBtn = document.getElementById('start-custom-focus');
        const cancelBtn = document.getElementById('cancel-focus-selection');
        const taskItems = document.querySelectorAll('.focus-task-item');
        
        // Custom focus task
        startCustomFocusBtn.addEventListener('click', () => {
            const customTask = customFocusInput.value.trim();
            if (customTask) {
                closeFocusDialog();
                enableFocusMode({ description: customTask, custom: true });
            } else {
                customFocusInput.classList.add('error');
                setTimeout(() => {
                    customFocusInput.classList.remove('error');
                }, 1000);
            }
        });
        
        // Cancel button
        cancelBtn.addEventListener('click', closeFocusDialog);
        
        // Task selection
        taskItems.forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.dataset.id;
                const taskTitle = item.dataset.title;
                const selectedTask = pendingTasks.find(t => t.id.toString() === taskId);
                
                closeFocusDialog();
                enableFocusMode(selectedTask);
            });
        });
        
        // Close dialog when clicking outside
        focusDialog.addEventListener('click', (e) => {
            if (e.target === focusDialog) {
                closeFocusDialog();
            }
        });
        
        // Close dialog function
        function closeFocusDialog() {
            focusDialog.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(focusDialog);
            }, 300);
        }
    }
    
    /**
     * Enable Focus Mode
     * @param {Object} task - The task to focus on
     */
    function enableFocusMode(task) {
        if (!task) return;
        
        currentFocusTask = task;
        isFocusModeActive = true;
        
        // Update UI
        if (appContainer) {
            appContainer.classList.add('focus-mode-active');
        }
        
        if (focusModeOverlay) {
            focusModeOverlay.classList.add('active');
        }
        
        if (activeFocusTask) {
            activeFocusTask.textContent = task.description || 'Focus Session';
        }
        
        // Start focus timer
        startFocusTimer();
        
        // Update toggle button if it exists
        if (focusModeToggle) {
            focusModeToggle.classList.add('active');
            focusModeToggle.setAttribute('title', 'Exit Focus Mode (Alt+F)');
        }
        
        // Store state in localStorage
        localStorage.setItem('focusModeActive', 'true');
        localStorage.setItem('focusModeTask', JSON.stringify(task));
        
        // Disable notifications if not related to the focus task
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            // We'll handle this when notifications come in
        }
        
        // Log focus session start for analytics
        logFocusSession('start', task);
    }
    
    /**
     * Start the focus timer
     */
    function startFocusTimer() {
        const startTime = Date.now();
        const focusTimerElement = document.getElementById('focus-timer');
        
        if (focusTimerElement) {
            // Initial display
            updateFocusTimer(startTime, focusTimerElement);
            
            // Update every second
            setInterval(() => {
                updateFocusTimer(startTime, focusTimerElement);
            }, 1000);
        }
    }
    
    /**
     * Update the focus timer display
     * @param {number} startTime - The start time in milliseconds
     * @param {HTMLElement} element - The timer element
     */
    function updateFocusTimer(startTime, element) {
        const elapsedMs = Date.now() - startTime;
        const seconds = Math.floor((elapsedMs / 1000) % 60);
        const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
        const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
        
        element.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Disable Focus Mode
     */
    function disableFocusMode() {
        if (!isFocusModeActive) return;
        
        // Update UI
        if (appContainer) {
            appContainer.classList.remove('focus-mode-active');
        }
        
        if (focusModeOverlay) {
            focusModeOverlay.classList.remove('active');
        }
        
        // Update toggle button if it exists
        if (focusModeToggle) {
            focusModeToggle.classList.remove('active');
            focusModeToggle.setAttribute('title', 'Enter Focus Mode (Alt+F)');
        }
        
        // Log focus session end for analytics
        logFocusSession('end', currentFocusTask);
        
        // Reset variables
        isFocusModeActive = false;
        currentFocusTask = null;
        
        // Clear localStorage state
        localStorage.removeItem('focusModeActive');
        localStorage.removeItem('focusModeTask');
    }
    
    /**
     * Log a focus session for analytics
     * @param {string} action - 'start' or 'end'
     * @param {Object} task - The task being focused on
     */
    function logFocusSession(action, task) {
        if (!task) return;
        
        const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        
        if (action === 'start') {
            focusSessions.push({
                taskId: task.id,
                taskTitle: task.description,
                startTime: new Date().toISOString(),
                isCustom: !!task.custom
            });
        } else if (action === 'end') {
            // Find the most recent session for this task
            const lastSession = [...focusSessions].reverse().find(session => 
                session.taskId === task.id && !session.endTime
            );
            
            if (lastSession) {
                lastSession.endTime = new Date().toISOString();
                lastSession.duration = new Date(lastSession.endTime) - new Date(lastSession.startTime);
            }
        }
        
        localStorage.setItem('focusSessions', JSON.stringify(focusSessions));
        
        // Update analytics if the function exists
        if (typeof updateAnalytics === 'function') {
            updateAnalytics();
        }
    }
    
    // Export functions for use by other modules
    window.enableFocusMode = enableFocusMode;
    window.disableFocusMode = disableFocusMode;
    window.showFocusTaskSelection = showFocusTaskSelection;
}

// Export for app.js initialization
window.initFocusMode = initFocusMode;

/**
 * Toggle Focus Mode - can be called from keyboard shortcuts
 */
function toggleFocusMode() {
    // Check if focus mode is active by looking at the overlay
    const focusModeOverlay = document.getElementById('focus-mode-overlay');
    const isFocusModeActive = focusModeOverlay && focusModeOverlay.classList.contains('active');
    
    if (isFocusModeActive) {
        // Focus mode is active, so disable it
        if (typeof window.disableFocusMode === 'function') {
            window.disableFocusMode();
        }
    } else {
        // Focus mode is not active, so try to select a task
        
        // Check if there's a selected task in the task list
        const selectedTask = document.querySelector('.task-item.selected');
        
        if (selectedTask) {
            // A task is selected, use it for focus mode
            const taskDescription = selectedTask.querySelector('.task-description').textContent;
            const taskId = selectedTask.dataset.id;
            
            if (typeof window.enableFocusMode === 'function') {
                window.enableFocusMode({ id: taskId, description: taskDescription });
            }
        } else {
            // No task selected, show task selection dialog
            if (typeof window.showFocusTaskSelection === 'function') {
                window.showFocusTaskSelection();
            }
        }
    }
}

// Export for use in keyboard shortcuts
window.toggleFocusMode = toggleFocusMode; 