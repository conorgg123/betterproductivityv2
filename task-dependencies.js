// Task Dependencies and Sequencing Module
document.addEventListener('DOMContentLoaded', function() {
    initTaskDependencies();
});

/**
 * Initialize task dependencies functionality
 */
function initTaskDependencies() {
    console.log('Initializing task dependencies and sequencing...');
    
    // Extend the task form to include dependencies
    extendTaskForm();
    
    // Set up event listeners
    setupDependencyListeners();
    
    // Load visualization if we're on the tasks page
    if (document.getElementById('tasks-section') && 
        document.getElementById('tasks-section').style.display !== 'none') {
        visualizeDependencies();
    }
    
    // Listen for section changes to update visualization
    document.addEventListener('click', function(e) {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.getAttribute('data-section') === 'tasks') {
            // Small timeout to allow the section to display
            setTimeout(visualizeDependencies, 100);
        }
    });
}

/**
 * Extend the task form to include dependency selection
 */
function extendTaskForm() {
    // Find the task form container
    const taskForm = document.getElementById('add-task-form');
    if (!taskForm) {
        console.error('Task form not found');
        return;
    }
    
    // Find the submit button or a good insertion point
    const submitButton = taskForm.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('Task form submit button not found');
        return;
    }
    
    // Create the dependencies selection
    const dependenciesDiv = document.createElement('div');
    dependenciesDiv.className = 'form-group dependencies-container';
    dependenciesDiv.innerHTML = `
        <label for="task-dependencies">Prerequisites</label>
        <div class="dependencies-wrapper">
            <select id="task-dependencies" class="form-control" multiple>
                <option value="" disabled>Select prerequisite tasks</option>
            </select>
            <button type="button" id="dependency-info" class="icon-button" title="What are prerequisites?">
                <i class="fa-solid fa-circle-info"></i>
            </button>
        </div>
        <div class="dependencies-help" id="dependencies-help" style="display: none;">
            Prerequisites are tasks that must be completed before this one can be started.
            This helps enforce a logical order for your workflow.
        </div>
        <div id="selected-dependencies" class="selected-dependencies"></div>
    `;
    
    // Insert before the submit button
    submitButton.parentNode.insertBefore(dependenciesDiv, submitButton);
    
    // Load existing tasks as options for dependencies
    loadDependencyOptions();
}

/**
 * Load existing incomplete tasks as options for dependencies
 */
function loadDependencyOptions() {
    const dependenciesSelect = document.getElementById('task-dependencies');
    if (!dependenciesSelect) return;
    
    // Clear existing options (except the first one)
    while (dependenciesSelect.options.length > 1) {
        dependenciesSelect.remove(1);
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Filter for incomplete tasks
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    // Add each task as an option
    incompleteTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.description || task.title;
        dependenciesSelect.appendChild(option);
    });
    
    // Initialize any existing selected dependencies
    updateSelectedDependencies();
}

/**
 * Update the display of selected dependencies
 */
function updateSelectedDependencies() {
    const selectedDepsContainer = document.getElementById('selected-dependencies');
    const dependenciesSelect = document.getElementById('task-dependencies');
    if (!selectedDepsContainer || !dependenciesSelect) return;
    
    // Clear current selected dependencies
    selectedDepsContainer.innerHTML = '';
    
    // Get selected options
    const selectedOptions = Array.from(dependenciesSelect.selectedOptions);
    
    // If no dependencies selected, hide the container
    if (selectedOptions.length === 0) {
        selectedDepsContainer.style.display = 'none';
        return;
    }
    
    // Show the container
    selectedDepsContainer.style.display = 'block';
    
    // Create a chip for each selected dependency
    selectedOptions.forEach(option => {
        if (!option.value) return; // Skip the placeholder
        
        const chip = document.createElement('div');
        chip.className = 'dependency-chip';
        chip.dataset.value = option.value;
        chip.innerHTML = `
            <span>${option.textContent}</span>
            <button type="button" class="remove-dependency" title="Remove dependency">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        selectedDepsContainer.appendChild(chip);
    });
}

/**
 * Set up event listeners for the dependencies features
 */
function setupDependencyListeners() {
    // Listen for dependency select changes
    document.addEventListener('change', function(e) {
        if (e.target.id === 'task-dependencies') {
            updateSelectedDependencies();
        }
    });
    
    // Listen for dependency removal clicks
    document.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-dependency');
        if (removeBtn) {
            const chip = removeBtn.closest('.dependency-chip');
            const value = chip.dataset.value;
            
            // Remove from select
            const dependenciesSelect = document.getElementById('task-dependencies');
            if (dependenciesSelect) {
                for (let i = 0; i < dependenciesSelect.options.length; i++) {
                    if (dependenciesSelect.options[i].value === value) {
                        dependenciesSelect.options[i].selected = false;
                        break;
                    }
                }
            }
            
            // Update display
            updateSelectedDependencies();
        }
    });
    
    // Info button toggle
    document.addEventListener('click', function(e) {
        if (e.target.closest('#dependency-info')) {
            const helpText = document.getElementById('dependencies-help');
            if (helpText) {
                helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
    
    // Extend the task form submission to handle dependencies
    const taskForm = document.getElementById('add-task-form');
    if (taskForm) {
        const originalSubmitHandler = taskForm.onsubmit;
        
        taskForm.onsubmit = function(e) {
            // Call the original handler first if it exists
            if (typeof originalSubmitHandler === 'function') {
                const result = originalSubmitHandler.call(this, e);
                if (result === false) return false; // If original handler returns false, abort
            }
            
            // Get selected dependencies
            const dependenciesSelect = document.getElementById('task-dependencies');
            const selectedDependencies = dependenciesSelect ? 
                Array.from(dependenciesSelect.selectedOptions).map(opt => opt.value).filter(val => val) : 
                [];
            
            // Get the task ID (assumes it's stored in a hidden input or data attribute)
            let taskId;
            const taskIdInput = taskForm.querySelector('input[name="task-id"]');
            if (taskIdInput) {
                taskId = taskIdInput.value;
            } else {
                // If no task ID input exists, it might be a new task
                taskId = Date.now().toString();
            }
            
            // Save dependencies to the task in localStorage
            saveDependencies(taskId, selectedDependencies);
            
            // Return true to allow form submission to continue
            return true;
        };
    }
}

/**
 * Save dependencies for a task
 * @param {string} taskId - ID of the task
 * @param {Array} dependencies - Array of dependency task IDs
 */
function saveDependencies(taskId, dependencies) {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Find the task and update it
    const taskIndex = tasks.findIndex(task => task.id.toString() === taskId.toString());
    
    if (taskIndex !== -1) {
        // Update existing task
        tasks[taskIndex].dependencies = dependencies;
    } else {
        // This might be a new task, it will be handled by the main task saving logic
        // We'll just need to ensure dependencies are saved when the task is created
        console.log('Task not found for dependency saving, might be a new task');
    }
    
    // Save back to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Update visualization
    visualizeDependencies();
}

/**
 * Visualize dependencies between tasks
 */
function visualizeDependencies() {
    // Remove any existing visualization
    removeDependencyVisualization();
    
    // Check if we're on the tasks view
    const tasksSection = document.getElementById('tasks-section');
    if (!tasksSection || tasksSection.style.display === 'none') {
        return;
    }
    
    // Get the task list
    const taskList = document.getElementById('task-list');
    if (!taskList) {
        console.error('Task list not found for dependency visualization');
        return;
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Create a map of task elements by ID
    const taskElements = {};
    taskList.querySelectorAll('.task-item').forEach(el => {
        const taskId = el.dataset.id;
        if (taskId) {
            taskElements[taskId] = el;
        }
    });
    
    // Create a container for dependency lines
    const linesContainer = document.createElement('div');
    linesContainer.id = 'dependency-lines-container';
    linesContainer.className = 'dependency-lines-container';
    taskList.parentNode.appendChild(linesContainer);
    
    // Create a canvas for drawing the lines
    const canvas = document.createElement('canvas');
    canvas.id = 'dependency-canvas';
    canvas.className = 'dependency-canvas';
    canvas.width = taskList.offsetWidth;
    canvas.height = taskList.offsetHeight;
    linesContainer.appendChild(canvas);
    
    // Get canvas context for drawing
    const ctx = canvas.getContext('2d');
    
    // Draw dependency lines
    tasks.forEach(task => {
        if (!task.dependencies || task.dependencies.length === 0) return;
        
        const taskElement = taskElements[task.id];
        if (!taskElement) return;
        
        // Add dependency indicator to the task
        if (!taskElement.querySelector('.dependency-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'dependency-indicator';
            indicator.title = 'This task has prerequisites';
            indicator.innerHTML = '<i class="fa-solid fa-link"></i>';
            taskElement.querySelector('.task-actions').appendChild(indicator);
        }
        
        // Loop through each dependency
        task.dependencies.forEach(depId => {
            const depElement = taskElements[depId];
            if (!depElement) return;
            
            // Get positions for line
            const depRect = depElement.getBoundingClientRect();
            const taskRect = taskElement.getBoundingClientRect();
            
            // Convert to canvas coordinates
            const containerRect = taskList.getBoundingClientRect();
            const startX = depRect.right - containerRect.left;
            const startY = depRect.top + depRect.height / 2 - containerRect.top;
            const endX = taskRect.left - containerRect.left;
            const endY = taskRect.top + taskRect.height / 2 - containerRect.top;
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            // Create a curved line with control points
            const controlX = startX + (endX - startX) * 0.5;
            ctx.bezierCurveTo(
                controlX, startY, // First control point
                controlX, endY,   // Second control point
                endX, endY        // End point
            );
            
            // Style based on completion status
            if (tasks.find(t => t.id === depId)?.completed) {
                ctx.strokeStyle = '#4CAF50'; // Green for completed dependencies
            } else {
                ctx.strokeStyle = '#FF5722'; // Orange for incomplete dependencies
            }
            
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 2]);
            ctx.stroke();
            
            // Draw arrow at the end
            const arrowSize = 6;
            const angle = Math.atan2(endY - (startY + (endY - startY) * 0.9), endX - (startX + (endX - startX) * 0.9));
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle - Math.PI / 6),
                endY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle + Math.PI / 6),
                endY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
        });
    });
    
    // Add completion check to enforce dependencies
    enforceTaskDependencies();
}

/**
 * Remove existing dependency visualization
 */
function removeDependencyVisualization() {
    const linesContainer = document.getElementById('dependency-lines-container');
    if (linesContainer) {
        linesContainer.remove();
    }
}

/**
 * Enforce task dependencies when completing tasks
 */
function enforceTaskDependencies() {
    // Get all task checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Process each checkbox
    taskCheckboxes.forEach(checkbox => {
        const taskItem = checkbox.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.id;
        const task = tasks.find(t => t.id.toString() === taskId);
        
        if (!task) return;
        
        // Create a blocked overlay if needed
        let blockedOverlay = taskItem.querySelector('.dependency-blocked');
        
        // Check if this task has incomplete dependencies
        const hasBlockingDependencies = task.dependencies && task.dependencies.some(depId => {
            const dependency = tasks.find(t => t.id.toString() === depId.toString());
            return dependency && !dependency.completed;
        });
        
        // If task has incomplete dependencies
        if (hasBlockingDependencies) {
            // Disable the checkbox
            checkbox.disabled = true;
            
            // Add "blocked" class to the task item
            taskItem.classList.add('dependency-blocked-item');
            
            // Add blocked overlay if it doesn't exist
            if (!blockedOverlay) {
                blockedOverlay = document.createElement('div');
                blockedOverlay.className = 'dependency-blocked';
                blockedOverlay.innerHTML = `
                    <div class="dependency-blocked-message">
                        <i class="fa-solid fa-lock"></i>
                        <span>Complete prerequisites first</span>
                    </div>
                `;
                
                // Add info button to show dependencies
                const infoBtn = document.createElement('button');
                infoBtn.className = 'dependency-info-btn';
                infoBtn.innerHTML = '<i class="fa-solid fa-info-circle"></i>';
                infoBtn.title = 'Show prerequisites';
                infoBtn.dataset.id = taskId;
                
                blockedOverlay.querySelector('.dependency-blocked-message').appendChild(infoBtn);
                taskItem.appendChild(blockedOverlay);
                
                // Add click listener to show dependencies
                infoBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showTaskDependencies(taskId);
                });
            }
        } else {
            // No blocking dependencies, ensure checkbox is enabled
            checkbox.disabled = false;
            taskItem.classList.remove('dependency-blocked-item');
            
            // Remove blocked overlay if exists
            if (blockedOverlay) {
                blockedOverlay.remove();
            }
        }
    });
}

/**
 * Show a modal with task dependencies
 * @param {string} taskId - ID of the task
 */
function showTaskDependencies(taskId) {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Find the task
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (!task) return;
    
    // Find task dependencies
    const dependencies = (task.dependencies || [])
        .map(depId => tasks.find(t => t.id.toString() === depId.toString()))
        .filter(dep => dep); // Filter out undefined dependencies
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-header">
            <h3>Prerequisites for "${task.description || task.title}"</h3>
            <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
            ${dependencies.length > 0 ? `
                <p>The following tasks must be completed first:</p>
                <ul class="dependency-list">
                    ${dependencies.map(dep => `
                        <li class="dependency-item ${dep.completed ? 'completed' : ''}">
                            <div class="dependency-status">
                                <i class="fa-solid ${dep.completed ? 'fa-check-circle' : 'fa-clock'}"></i>
                            </div>
                            <div class="dependency-info">
                                <div class="dependency-title">${dep.description || dep.title}</div>
                                <div class="dependency-meta">
                                    ${dep.completed ? 
                                        `<span class="dependency-completed">Completed</span>` : 
                                        `<span class="dependency-pending">Pending</span>`
                                    }
                                    ${dep.priority ? 
                                        `<span class="priority-badge ${dep.priority}">${dep.priority}</span>` : 
                                        ''
                                    }
                                </div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            ` : `
                <p>This task has dependencies, but they were not found. This might be due to a data issue.</p>
            `}
        </div>
        <div class="modal-footer">
            <button class="btn-primary" id="close-dependencies-modal">Got it</button>
        </div>
    `;
    
    // Create or reuse dependency modal
    let modal = document.getElementById('dependencies-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dependencies-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Set modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content dependency-modal-content';
    modalContent.innerHTML = modalHTML;
    modal.innerHTML = '';
    modal.appendChild(modalContent);
    
    // Show modal
    modal.style.display = 'block';
    
    // Close button listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.querySelector('#close-dependencies-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close on outside click
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Handle task completion with dependency enforcement
 * @param {string} taskId - ID of the task being completed
 * @param {boolean} completed - Whether the task is being completed or uncompleted
 * @returns {boolean} Whether the completion should be allowed
 */
function handleTaskCompletion(taskId, completed) {
    // If uncompleting a task, always allow
    if (!completed) return true;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Find the task
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (!task) return true; // If task not found, allow by default
    
    // Check if this task has incomplete dependencies
    const hasBlockingDependencies = task.dependencies && task.dependencies.some(depId => {
        const dependency = tasks.find(t => t.id.toString() === depId.toString());
        return dependency && !dependency.completed;
    });
    
    // If blocked, show an error message
    if (hasBlockingDependencies) {
        showToast('Cannot complete: prerequisites not completed', 'error');
        return false;
    }
    
    // If not blocked, check if completing this task unblocks other tasks
    if (completed) {
        const unblockingTasks = tasks.filter(t => 
            t.dependencies && 
            t.dependencies.includes(taskId.toString()) &&
            !t.completed
        );
        
        // If this task is a prerequisite for others, show notification
        if (unblockingTasks.length > 0) {
            setTimeout(() => {
                showToast(`Unblocked ${unblockingTasks.length} dependent task${unblockingTasks.length > 1 ? 's' : ''}!`, 'success');
                
                // Refresh the visualization
                visualizeDependencies();
            }, 500);
        }
    }
    
    return true;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
    // Use global toast function if available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Create toast if it doesn't exist
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

// Patch the existing task completion function to enforce dependencies
function patchTaskCompletionFunction() {
    // Store original function
    if (typeof window.completeTask === 'function') {
        const originalCompleteTask = window.completeTask;
        
        // Override with our version
        window.completeTask = function(taskId, completed) {
            // Call our dependency check
            if (!handleTaskCompletion(taskId, completed)) {
                return false;
            }
            
            // Call original function
            return originalCompleteTask.call(this, taskId, completed);
        };
    }
    
    // Also handle checkbox clicks directly
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.id;
            const completed = e.target.checked;
            
            // If task being completed, check dependencies
            if (completed && !handleTaskCompletion(taskId, completed)) {
                // If not allowed, revert the checkbox
                e.target.checked = false;
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, true);
}

// Export for use in app.js
window.initTaskDependencies = initTaskDependencies;
window.handleTaskCompletion = handleTaskCompletion; 