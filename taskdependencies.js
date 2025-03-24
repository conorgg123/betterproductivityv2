// Task Dependencies Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize task dependencies once DOM is loaded
    initTaskDependencies();
});

/**
 * Initialize task dependencies functionality
 */
function initTaskDependencies() {
    console.log('Initializing task dependencies...');
    
    // Check if task prerequisite elements exist
    const taskPrerequisitesSelect = document.getElementById('task-prerequisites');
    const addTaskBtn = document.getElementById('add-task-btn');
    
    if (!taskPrerequisitesSelect || !addTaskBtn) {
        console.warn('Task prerequisites elements not found.');
        return;
    }
    
    // Load existing tasks into the prerequisites dropdown
    loadTasksIntoPrerequisites();
    
    // Modify the task creation functionality to include prerequisites
    enhanceTaskCreation();
    
    // Enhance task display to show dependencies
    enhanceTaskDisplay();
    
    // Draw dependency arrows in scheduler view
    if (typeof loadBlocks === 'function') {
        // Hook into the time block loading function if it exists
        const originalLoadBlocks = loadBlocks;
        window.loadBlocks = function() {
            originalLoadBlocks.apply(this, arguments);
            drawDependencyArrows();
        };
    }
}

/**
 * Load existing tasks into the prerequisites dropdown
 */
function loadTasksIntoPrerequisites() {
    const taskPrerequisitesSelect = document.getElementById('task-prerequisites');
    if (!taskPrerequisitesSelect) return;
    
    // Clear current options except the placeholder
    while (taskPrerequisitesSelect.options.length > 0) {
        taskPrerequisitesSelect.remove(0);
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Filter out completed tasks
    const pendingTasks = tasks.filter(task => !task.completed);
    
    // Add each task as an option
    pendingTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.description;
        taskPrerequisitesSelect.appendChild(option);
    });
    
    // If no pending tasks, disable the select
    if (pendingTasks.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No available tasks';
        taskPrerequisitesSelect.appendChild(option);
        taskPrerequisitesSelect.disabled = true;
    } else {
        taskPrerequisitesSelect.disabled = false;
    }
}

/**
 * Enhance task creation to include prerequisites
 */
function enhanceTaskCreation() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskPrerequisitesSelect = document.getElementById('task-prerequisites');
    
    if (!addTaskBtn || !taskDescriptionInput) return;
    
    // Override the click event handler
    addTaskBtn.removeEventListener('click', window.addTask);
    
    addTaskBtn.addEventListener('click', function() {
        // Get task details
        const description = taskDescriptionInput.value.trim();
        if (!description) {
            showToast('Please enter a task description', 'error');
            return;
        }
        
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-due-date').value;
        const category = document.getElementById('task-category').value;
        
        // Get selected prerequisites
        const prerequisites = [];
        if (taskPrerequisitesSelect) {
            Array.from(taskPrerequisitesSelect.selectedOptions).forEach(option => {
                prerequisites.push(option.value);
            });
        }
        
        // Create the task object
        const task = {
            id: Date.now().toString(),
            description: description,
            priority: priority,
            dueDate: dueDate,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            prerequisites: prerequisites
        };
        
        // Save to localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reset form fields
        taskDescriptionInput.value = '';
        document.getElementById('task-priority').value = 'medium';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-category').value = '';
        if (taskPrerequisitesSelect) {
            Array.from(taskPrerequisitesSelect.options).forEach(option => {
                option.selected = false;
            });
        }
        
        // Update the task list
        displayTasks();
        
        // Refresh prerequisites dropdown
        loadTasksIntoPrerequisites();
        
        // Show success message
        showToast('Task added successfully', 'success');
    });
}

/**
 * Enhance task display to show dependencies
 */
function enhanceTaskDisplay() {
    // Override the existing displayTasks function
    window.displayTasks = function(filter = 'all', priority = 'all') {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;
        
        // Clear current list
        taskList.innerHTML = '';
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Check if there are any tasks
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <p>No tasks to display</p>
                    <p class="empty-state-description">Add your first task to get started</p>
                </div>
            `;
            return;
        }
        
        // Apply filters
        let filteredTasks = tasks;
        
        if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priority);
        }
        
        // If no tasks match the filters
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-filter"></i>
                    <p>No tasks match the selected filters</p>
                    <p class="empty-state-description">Try changing your filters or add a new task</p>
                </div>
            `;
            return;
        }
        
        // Create and append task items
        filteredTasks.forEach(task => {
            // Check if the task has blocked status
            const isBlocked = isTaskBlocked(task, tasks);
            
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${isBlocked ? 'blocked' : ''}`;
            taskItem.dataset.id = task.id;
            
            // Format due date if present
            let dueDateDisplay = '';
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const isOverdue = !task.completed && dueDate < new Date();
                dueDateDisplay = `
                    <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i class="fa-solid fa-calendar-day"></i>
                        <span>${dueDate.toLocaleDateString()}</span>
                    </div>
                `;
            }
            
            // Create category badge if present
            let categoryDisplay = '';
            if (task.category) {
                categoryDisplay = `
                    <div class="task-category">
                        <span>${task.category}</span>
                    </div>
                `;
            }
            
            // Create blocked indicator if the task is blocked
            let blockedDisplay = '';
            if (isBlocked) {
                blockedDisplay = `
                    <div class="task-blocked-indicator">
                        <i class="fa-solid fa-lock"></i>
                        <span>Blocked</span>
                    </div>
                `;
            }
            
            // Create HTML for the task item
            taskItem.innerHTML = `
                <div class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </div>
                <div class="task-content">
                    <div class="task-description">${task.description}</div>
                    <div class="task-details">
                        <div class="task-priority ${task.priority}">
                            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </div>
                        ${categoryDisplay}
                        ${dueDateDisplay}
                        ${blockedDisplay}
                    </div>
                    ${getTaskDependenciesHTML(task, tasks)}
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" title="Edit Task">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="task-action-btn delete" title="Delete Task">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add to task list
            taskList.appendChild(taskItem);
            
            // Add event listener for checkbox
            const checkbox = taskItem.querySelector('.task-checkbox input');
            checkbox.addEventListener('change', function() {
                toggleTaskCompletion(task.id);
            });
            
            // Add event listeners for action buttons
            const editBtn = taskItem.querySelector('.task-action-btn.edit');
            editBtn.addEventListener('click', function() {
                editTask(task.id);
            });
            
            const deleteBtn = taskItem.querySelector('.task-action-btn.delete');
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
        });
    };
    
    // Override the existing toggleTaskCompletion function
    window.toggleTaskCompletion = function(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            // Toggle completion status
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            
            // If task is being marked as completed, update completedAt
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completedAt = new Date().toISOString();
            } else {
                delete tasks[taskIndex].completedAt;
            }
            
            // Save back to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Update the display
            displayTasks(
                document.getElementById('task-filter').value,
                document.getElementById('priority-filter').value
            );
            
            // Update prerequisites
            loadTasksIntoPrerequisites();
            
            // Refresh dependency visualizations
            drawDependencyArrows();
        }
    };
    
    // Override the existing deleteTask function
    window.deleteTask = function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            
            // Check if this task is a prerequisite for other tasks
            const dependentTasks = tasks.filter(task => 
                task.prerequisites && task.prerequisites.includes(taskId)
            );
            
            if (dependentTasks.length > 0) {
                const dependentTaskNames = dependentTasks.map(t => t.description).join('\n- ');
                const confirmMessage = `This task is a prerequisite for other tasks:\n- ${dependentTaskNames}\n\nDeleting it will remove the dependency. Continue?`;
                
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                // Remove this task as a prerequisite from other tasks
                tasks = tasks.map(task => {
                    if (task.prerequisites && task.prerequisites.includes(taskId)) {
                        task.prerequisites = task.prerequisites.filter(id => id !== taskId);
                    }
                    return task;
                });
            }
            
            // Remove the task
            tasks = tasks.filter(task => task.id !== taskId);
            
            // Save back to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Update the display
            displayTasks(
                document.getElementById('task-filter').value,
                document.getElementById('priority-filter').value
            );
            
            // Update prerequisites
            loadTasksIntoPrerequisites();
            
            // Refresh dependency visualizations
            drawDependencyArrows();
            
            // Show success message
            showToast('Task deleted successfully', 'success');
        }
    };
    
    // Override the existing editTask function
    window.editTask = function(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            // Populate form fields
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-priority').value = task.priority;
            if (task.dueDate) {
                document.getElementById('task-due-date').value = task.dueDate;
            }
            document.getElementById('task-category').value = task.category || '';
            
            // Select prerequisites
            const taskPrerequisitesSelect = document.getElementById('task-prerequisites');
            if (taskPrerequisitesSelect) {
                // Deselect all options first
                Array.from(taskPrerequisitesSelect.options).forEach(option => {
                    option.selected = false;
                });
                
                // Select the prerequisites
                if (task.prerequisites && task.prerequisites.length > 0) {
                    task.prerequisites.forEach(prerequisiteId => {
                        const option = taskPrerequisitesSelect.querySelector(`option[value="${prerequisiteId}"]`);
                        if (option) {
                            option.selected = true;
                        }
                    });
                }
            }
            
            // Change add button to update button
            const addTaskBtn = document.getElementById('add-task-btn');
            addTaskBtn.textContent = 'Update Task';
            addTaskBtn.dataset.editing = taskId;
            
            // Add event listener for the update
            addTaskBtn.removeEventListener('click', window.addTask);
            addTaskBtn.addEventListener('click', function updateTask() {
                const description = document.getElementById('task-description').value.trim();
                if (!description) {
                    showToast('Please enter a task description', 'error');
                    return;
                }
                
                const taskId = this.dataset.editing;
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    // Get prerequisite IDs
                    const prerequisites = [];
                    if (taskPrerequisitesSelect) {
                        Array.from(taskPrerequisitesSelect.selectedOptions).forEach(option => {
                            // Skip if the prerequisite would create a circular dependency
                            if (option.value !== taskId) {
                                prerequisites.push(option.value);
                            }
                        });
                    }
                    
                    // Update task
                    tasks[taskIndex].description = description;
                    tasks[taskIndex].priority = document.getElementById('task-priority').value;
                    tasks[taskIndex].dueDate = document.getElementById('task-due-date').value;
                    tasks[taskIndex].category = document.getElementById('task-category').value;
                    tasks[taskIndex].prerequisites = prerequisites;
                    
                    // Save back to localStorage
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    
                    // Reset form
                    document.getElementById('task-description').value = '';
                    document.getElementById('task-priority').value = 'medium';
                    document.getElementById('task-due-date').value = '';
                    document.getElementById('task-category').value = '';
                    if (taskPrerequisitesSelect) {
                        Array.from(taskPrerequisitesSelect.options).forEach(option => {
                            option.selected = false;
                        });
                    }
                    
                    // Reset button
                    addTaskBtn.textContent = 'Add Task';
                    delete addTaskBtn.dataset.editing;
                    
                    // Remove this specific event listener
                    addTaskBtn.removeEventListener('click', updateTask);
                    
                    // Re-add the enhanced task creation listener
                    enhanceTaskCreation();
                    
                    // Update the display
                    displayTasks(
                        document.getElementById('task-filter').value,
                        document.getElementById('priority-filter').value
                    );
                    
                    // Update prerequisites
                    loadTasksIntoPrerequisites();
                    
                    // Refresh dependency visualizations
                    drawDependencyArrows();
                    
                    // Show success message
                    showToast('Task updated successfully', 'success');
                }
            });
        }
    };
}

/**
 * Check if a task is blocked by incomplete prerequisites
 * @param {Object} task - The task to check
 * @param {Array} allTasks - All tasks array
 * @returns {boolean} True if the task is blocked
 */
function isTaskBlocked(task, allTasks) {
    if (!task.prerequisites || task.prerequisites.length === 0) {
        return false;
    }
    
    // Check if any prerequisite is incomplete
    return task.prerequisites.some(prerequisiteId => {
        const prerequisite = allTasks.find(t => t.id === prerequisiteId);
        return prerequisite && !prerequisite.completed;
    });
}

/**
 * Generate HTML for task dependencies section
 * @param {Object} task - The task object
 * @param {Array} allTasks - All tasks array
 * @returns {string} HTML for the dependencies section
 */
function getTaskDependenciesHTML(task, allTasks) {
    // If no prerequisites, return empty string
    if (!task.prerequisites || task.prerequisites.length === 0) {
        return '';
    }
    
    // Get prerequisite tasks
    const prerequisites = task.prerequisites.map(prerequisiteId => {
        return allTasks.find(t => t.id === prerequisiteId);
    }).filter(Boolean); // Remove any not found (null/undefined)
    
    if (prerequisites.length === 0) {
        return '';
    }
    
    // Generate HTML for each prerequisite
    const prerequisiteItems = prerequisites.map(prerequisite => {
        const status = prerequisite.completed ? 'completed' : 'pending';
        return `
            <div class="task-dependency-item" data-id="${prerequisite.id}">
                <div class="dependency-icon">
                    <i class="fa-solid fa-link"></i>
                </div>
                <div class="dependency-title">${prerequisite.description}</div>
                <div class="dependency-status ${status}">
                    ${status === 'completed' ? 'Completed' : 'Pending'}
                </div>
                <button class="dependency-remove" data-task-id="${task.id}" data-dependency-id="${prerequisite.id}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }).join('');
    
    // Return the full HTML
    return `
        <div class="task-dependencies-container">
            <div class="task-dependencies-title">Prerequisites:</div>
            <div class="task-dependency-list">
                ${prerequisiteItems}
            </div>
        </div>
    `;
}

/**
 * Draw dependency arrows in the scheduler view
 */
function drawDependencyArrows() {
    // Remove existing arrows
    document.querySelectorAll('.task-dependency-arrow, .task-dependency-tooltip').forEach(el => el.remove());
    
    // Get all task blocks in the scheduler
    const taskBlocks = document.querySelectorAll('.time-block.task');
    if (taskBlocks.length === 0) return;
    
    // Get all tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Create a mapping of task IDs to their blocks in the scheduler
    const taskBlockMap = new Map();
    taskBlocks.forEach(block => {
        const taskId = block.dataset.taskId;
        if (taskId) {
            taskBlockMap.set(taskId, block);
        }
    });
    
    // Draw an arrow for each task dependency
    taskBlocks.forEach(block => {
        const taskId = block.dataset.taskId;
        if (!taskId) return;
        
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.prerequisites || task.prerequisites.length === 0) return;
        
        // Draw an arrow from each prerequisite to this task
        task.prerequisites.forEach(prerequisiteId => {
            const prerequisiteBlock = taskBlockMap.get(prerequisiteId);
            if (!prerequisiteBlock) return;
            
            const prerequisite = tasks.find(t => t.id === prerequisiteId);
            if (!prerequisite) return;
            
            // Calculate arrow position and dimensions
            const blockRect = block.getBoundingClientRect();
            const prereqRect = prerequisiteBlock.getBoundingClientRect();
            const schedulerRect = document.querySelector('.scheduler-grid').getBoundingClientRect();
            
            // Calculate relative positions
            const blockTop = blockRect.top - schedulerRect.top + (blockRect.height / 2);
            const blockLeft = blockRect.left - schedulerRect.left;
            const prereqTop = prereqRect.top - schedulerRect.top + (prereqRect.height / 2);
            const prereqRight = prereqRect.left - schedulerRect.left + prereqRect.width;
            
            // Create the arrow element
            const arrow = document.createElement('div');
            arrow.className = 'task-dependency-arrow';
            
            // Position the arrow
            if (prereqTop < blockTop) {
                // Prerequisite is above the task
                const arrowHeight = blockTop - prereqTop;
                const arrowWidth = blockLeft - prereqRight + 10; // Gap between blocks
                
                arrow.style.top = prereqTop + 'px';
                arrow.style.left = prereqRight + 'px';
                arrow.style.width = arrowWidth + 'px';
                arrow.style.height = '2px';
                
                // Add a vertical line
                const vLine = document.createElement('div');
                vLine.className = 'task-dependency-arrow vertical';
                vLine.style.top = prereqTop + 'px';
                vLine.style.left = prereqRight + arrowWidth + 'px';
                vLine.style.width = '2px';
                vLine.style.height = arrowHeight + 'px';
                vLine.style.transform = 'rotate(0deg)';
                
                document.querySelector('.scheduler-grid').appendChild(vLine);
            } else if (prereqTop > blockTop) {
                // Prerequisite is below the task
                const arrowHeight = prereqTop - blockTop;
                const arrowWidth = blockLeft - prereqRight + 10; // Gap between blocks
                
                arrow.style.top = blockTop + 'px';
                arrow.style.left = prereqRight + 'px';
                arrow.style.width = arrowWidth + 'px';
                arrow.style.height = '2px';
                
                // Add a vertical line
                const vLine = document.createElement('div');
                vLine.className = 'task-dependency-arrow vertical';
                vLine.style.top = blockTop + 'px';
                vLine.style.left = prereqRight + arrowWidth + 'px';
                vLine.style.width = '2px';
                vLine.style.height = arrowHeight + 'px';
                vLine.style.transform = 'rotate(0deg)';
                
                document.querySelector('.scheduler-grid').appendChild(vLine);
            } else {
                // Prerequisite is at the same level
                arrow.style.top = prereqTop + 'px';
                arrow.style.left = prereqRight + 'px';
                arrow.style.width = (blockLeft - prereqRight) + 'px';
                arrow.style.height = '2px';
            }
            
            // Add animation if prerequisite is not completed
            if (!prerequisite.completed) {
                arrow.classList.add('animate');
            }
            
            // Add to the scheduler
            document.querySelector('.scheduler-grid').appendChild(arrow);
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'task-dependency-tooltip';
            tooltip.textContent = `${prerequisite.description} → ${task.description}`;
            tooltip.style.top = (prereqTop - 25) + 'px';
            tooltip.style.left = (prereqRight + 20) + 'px';
            document.querySelector('.scheduler-grid').appendChild(tooltip);
            
            // Show tooltip on arrow hover
            arrow.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
            });
            
            arrow.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    });
}

// Helper function to display toast notifications
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="fa-solid fa-times"></i></button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add close event
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
} 