/**
 * Enhanced Task Form Module
 * Provides a form for adding/editing tasks with categories, due dates, and dependencies
 */

document.addEventListener('DOMContentLoaded', function() {
    initTaskForm();
});

/**
 * Initialize the enhanced task form functionality
 */
function initTaskForm() {
    console.log('Initializing Enhanced Task Form...');
    
    // Create task form modal if it doesn't exist
    createTaskFormModal();
    
    // Set up event listeners
    setupTaskFormListeners();
}

/**
 * Create the task form modal
 */
function createTaskFormModal() {
    // Check if modal already exists
    if (document.getElementById('task-form-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'task-form-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content task-form-modal">
            <div class="modal-header">
                <h3 id="task-form-title">Add Task</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="task-form">
                    <input type="hidden" id="task-id">
                    
                    <div class="task-form-group">
                        <label for="task-description">Task Description</label>
                        <input type="text" id="task-description" placeholder="What needs to be done?" required>
                    </div>
                    
                    <div class="task-form-row">
                        <div class="task-form-col">
                            <div class="task-form-group">
                                <label for="task-priority">Priority</label>
                                <select id="task-priority" required>
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div class="task-form-col">
                            <div class="task-form-group">
                                <label for="task-category">Category</label>
                                <select id="task-category">
                                    <option value="">None</option>
                                    <option value="work">Work</option>
                                    <option value="personal">Personal</option>
                                    <option value="health">Health</option>
                                    <option value="education">Education</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="task-form-group">
                        <label for="task-due-date">Due Date (Optional)</label>
                        <div class="task-datetime-picker">
                            <input type="date" id="task-due-date">
                            <input type="time" id="task-due-time">
                        </div>
                    </div>
                    
                    <div class="task-form-group">
                        <label for="task-dependencies">Prerequisites</label>
                        <div class="dependencies-wrapper">
                            <select id="task-dependencies" class="form-control" multiple>
                                <option value="" disabled>Select prerequisite tasks</option>
                                <!-- Tasks will be loaded dynamically -->
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
                    </div>
                    
                    <div class="task-form-group">
                        <label for="task-notes">Notes (Optional)</label>
                        <textarea id="task-notes" rows="3" placeholder="Add additional details"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="cancel-task" class="btn-secondary">Cancel</button>
                        <button type="submit" id="save-task" class="btn-primary">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Set up event listeners for the task form
 */
function setupTaskFormListeners() {
    // Add Task button in Tasks section
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            openTaskForm();
        });
    }
    
    // Form modal events
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        // Close button
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeTaskForm();
            });
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-task');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                closeTaskForm();
            });
        }
        
        // Form submission
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveTask();
            });
        }
        
        // Dependencies info toggle
        const dependencyInfo = document.getElementById('dependency-info');
        if (dependencyInfo) {
            dependencyInfo.addEventListener('click', function() {
                const helpText = document.getElementById('dependencies-help');
                if (helpText) {
                    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
        
        // Dependencies selection change
        const dependenciesSelect = document.getElementById('task-dependencies');
        if (dependenciesSelect) {
            dependenciesSelect.addEventListener('change', function() {
                updateSelectedDependencies();
            });
        }
        
        // Click outside to close
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTaskForm();
            }
        });
    }
    
    // Edit and delete task buttons (delegated event)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.task-action-btn.edit')) {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                const taskId = taskItem.dataset.id;
                editTask(taskId);
            }
        } else if (e.target.closest('.task-action-btn.delete')) {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                const taskId = taskItem.dataset.id;
                deleteTask(taskId);
            }
        }
    });
    
    // Allow tasks to be dragged to scheduler
    enableTaskDragToScheduler();
}

/**
 * Open the task form for adding a new task
 */
function openTaskForm() {
    // Set form title
    document.getElementById('task-form-title').textContent = 'Add Task';
    
    // Clear form
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.reset();
        document.getElementById('task-id').value = '';
    }
    
    // Load dependencies
    loadDependencyOptions();
    
    // Clear selected dependencies
    updateSelectedDependencies();
    
    // Show modal
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    // Focus on description field
    document.getElementById('task-description').focus();
}

/**
 * Open the task form for editing an existing task
 * @param {string} taskId - ID of the task to edit
 */
function editTask(taskId) {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Find the task
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (!task) return;
    
    // Set form title
    document.getElementById('task-form-title').textContent = 'Edit Task';
    
    // Fill form
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority || 'medium';
    document.getElementById('task-category').value = task.category || '';
    document.getElementById('task-notes').value = task.notes || '';
    
    // Set due date and time if exists
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        
        // Format date as YYYY-MM-DD
        const dateStr = dueDate.toISOString().split('T')[0];
        document.getElementById('task-due-date').value = dateStr;
        
        // Format time as HH:MM
        const hours = dueDate.getHours().toString().padStart(2, '0');
        const minutes = dueDate.getMinutes().toString().padStart(2, '0');
        document.getElementById('task-due-time').value = `${hours}:${minutes}`;
    } else {
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-due-time').value = '';
    }
    
    // Load dependencies
    loadDependencyOptions();
    
    // Set selected dependencies
    const dependenciesSelect = document.getElementById('task-dependencies');
    if (dependenciesSelect && task.dependencies) {
        // Clear all selected options
        for (let i = 0; i < dependenciesSelect.options.length; i++) {
            dependenciesSelect.options[i].selected = false;
        }
        
        // Select dependencies
        task.dependencies.forEach(depId => {
            for (let i = 0; i < dependenciesSelect.options.length; i++) {
                if (dependenciesSelect.options[i].value === depId.toString()) {
                    dependenciesSelect.options[i].selected = true;
                    break;
                }
            }
        });
        
        // Update displayed dependencies
        updateSelectedDependencies();
    }
    
    // Show modal
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    // Focus on description field
    document.getElementById('task-description').focus();
}

/**
 * Close the task form modal
 */
function closeTaskForm() {
    const modal = document.getElementById('task-form-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Save the task from the form
 */
function saveTask() {
    // Get form values
    const taskId = document.getElementById('task-id').value;
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;
    const dueDateStr = document.getElementById('task-due-date').value;
    const dueTimeStr = document.getElementById('task-due-time').value;
    const notes = document.getElementById('task-notes').value.trim();
    
    // Get dependencies
    const dependenciesSelect = document.getElementById('task-dependencies');
    const dependencies = dependenciesSelect ? 
        Array.from(dependenciesSelect.selectedOptions).map(opt => opt.value).filter(val => val) : 
        [];
    
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
    
    if (taskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                description,
                priority,
                category: category || null,
                dueDate: dueDate ? dueDate.toISOString() : null,
                notes: notes || null,
                dependencies,
                updatedAt: new Date().toISOString()
            };
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
            dependencies,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
    }
    
    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Close form
    closeTaskForm();
    
    // Update task list display
    if (typeof displayTasks === 'function') {
        displayTasks();
    }
    
    // Show notification
    showNotification(taskId ? 'Task updated successfully' : 'Task added successfully', 'success');
}

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 */
function deleteTask(taskId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Filter out the task
    const updatedTasks = tasks.filter(t => t.id.toString() !== taskId.toString());
    
    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Update task list display
    if (typeof displayTasks === 'function') {
        displayTasks();
    }
    
    // Show notification
    showNotification('Task deleted successfully', 'success');
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
    
    // Get the current task ID being edited
    const currentTaskId = document.getElementById('task-id').value;
    
    // Filter for incomplete tasks (excluding the current task being edited)
    const incompleteTasks = tasks.filter(task => 
        !task.completed && 
        (!currentTaskId || task.id.toString() !== currentTaskId)
    );
    
    // Add each task as an option
    incompleteTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.description || task.title;
        dependenciesSelect.appendChild(option);
    });
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
    
    // Add event listeners for removing dependencies
    selectedDepsContainer.querySelectorAll('.remove-dependency').forEach(btn => {
        btn.addEventListener('click', function() {
            const chip = btn.closest('.dependency-chip');
            const value = chip.dataset.value;
            
            // Remove from select
            for (let i = 0; i < dependenciesSelect.options.length; i++) {
                if (dependenciesSelect.options[i].value === value) {
                    dependenciesSelect.options[i].selected = false;
                    break;
                }
            }
            
            // Update display
            updateSelectedDependencies();
        });
    });
}

/**
 * Enable drag and drop of tasks to scheduler
 */
function enableTaskDragToScheduler() {
    // Make tasks draggable
    document.addEventListener('dragstart', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'task',
                id: taskItem.dataset.id
            }));
            taskItem.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            taskItem.classList.remove('dragging');
        }
    });
    
    // Setup scheduler dropzone
    const scheduler = document.getElementById('scheduler-grid');
    if (scheduler) {
        scheduler.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        scheduler.addEventListener('drop', function(e) {
            e.preventDefault();
            
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                
                // Handle only tasks
                if (data.type === 'task') {
                    // Get task details
                    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                    const task = tasks.find(t => t.id.toString() === data.id);
                    
                    if (!task) return;
                    
                    // Calculate time slot from drop position
                    const rect = scheduler.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const rowHeight = rect.height / 24; // 24 hours
                    const hour = Math.floor(y / rowHeight);
                    
                    // Create a scheduled task
                    const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
                    
                    // Get current date
                    const date = new Date();
                    date.setHours(hour, 0, 0, 0);
                    
                    // Default duration is 1 hour
                    const endDate = new Date(date);
                    endDate.setHours(endDate.getHours() + 1);
                    
                    scheduledTasks.push({
                        id: Date.now().toString(),
                        taskId: task.id,
                        title: task.description,
                        start: date.toISOString(),
                        end: endDate.toISOString(),
                        priority: task.priority,
                        category: task.category
                    });
                    
                    // Save to localStorage
                    localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
                    
                    // Refresh scheduler if function exists
                    if (typeof updateScheduler === 'function') {
                        updateScheduler();
                    }
                    
                    // Show notification
                    showNotification('Task scheduled successfully', 'success');
                }
            } catch (error) {
                console.error('Error handling dropped task:', error);
            }
        });
    }
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Check if we have a global notification function
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Create our own notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Export functions for use in other modules
window.openTaskForm = openTaskForm;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.initTaskForm = initTaskForm; 