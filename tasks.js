/**
 * Tasks Management Module
 * Handles task display, filtering, sorting, and interaction
 */

document.addEventListener('DOMContentLoaded', function() {
    initTasks();
});

/**
 * Initialize the tasks functionality
 */
function initTasks() {
    console.log('Initializing Tasks...');
    
    // Load and display tasks
    displayTasks();
    
    // Set up event listeners
    setupTaskListeners();
}

/**
 * Set up event listeners for tasks functionality
 */
function setupTaskListeners() {
    // Task filter change
    const taskFilter = document.getElementById('task-filter');
    if (taskFilter) {
        taskFilter.addEventListener('change', function() {
            displayTasks();
        });
    }
    
    // Task sort change
    const taskSort = document.getElementById('task-sort');
    if (taskSort) {
        taskSort.addEventListener('change', function() {
            displayTasks();
        });
    }
    
    // Task completion toggling (delegated)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.task-checkbox')) {
            const checkbox = e.target.closest('.task-checkbox');
            const taskItem = checkbox.closest('.task-item');
            
            if (taskItem) {
                const taskId = taskItem.dataset.id;
                toggleTaskCompletion(taskId, checkbox.checked);
            }
        }
    });
    
    // Make task items draggable
    document.addEventListener('dragstart', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            // Set draggable attribute if it's not already set
            if (!taskItem.hasAttribute('draggable')) {
                taskItem.setAttribute('draggable', 'true');
            }
            
            taskItem.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', function(e) {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            taskItem.classList.remove('dragging');
        }
    });
}

/**
 * Display tasks based on current filter and sort settings
 */
function displayTasks() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // If no tasks, show empty state
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks yet. Create your first task to get started!</p>
            </div>
        `;
        return;
    }
    
    // Get filter and sort values
    const filter = document.getElementById('task-filter')?.value || 'all';
    const sort = document.getElementById('task-sort')?.value || 'priority';
    
    // Filter tasks
    let filteredTasks = tasks;
    
    if (filter === 'incomplete') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (['work', 'personal', 'health', 'education', 'other'].includes(filter)) {
        filteredTasks = tasks.filter(task => task.category === filter);
    }
    
    // Sort tasks
    filteredTasks.sort((a, b) => {
        if (sort === 'priority') {
            // Priority: high > medium > low
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sort === 'dueDate') {
            // Due Date: earlier > later, null values last
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sort === 'category') {
            // Category: alphabetical, null values last
            if (!a.category && !b.category) return 0;
            if (!a.category) return 1;
            if (!b.category) return -1;
            return a.category.localeCompare(b.category);
        }
        
        // Default sort by created date
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Check dependencies for blocked tasks
    const blockedTaskIds = new Set();
    filteredTasks.forEach(task => {
        if (task.dependencies && task.dependencies.length > 0) {
            // Check if any dependencies are not completed
            const hasIncompletePrerequisites = task.dependencies.some(depId => {
                const depTask = tasks.find(t => t.id.toString() === depId.toString());
                return depTask && !depTask.completed;
            });
            
            if (hasIncompletePrerequisites) {
                blockedTaskIds.add(task.id.toString());
            }
        }
    });
    
    // Create a group container for each day if sorting by due date
    const dueDateGroups = {};
    
    if (sort === 'dueDate') {
        // First, group tasks by due date
        filteredTasks.forEach(task => {
            if (!task.dueDate) {
                if (!dueDateGroups['no-date']) {
                    dueDateGroups['no-date'] = [];
                }
                dueDateGroups['no-date'].push(task);
                return;
            }
            
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const dueDateStart = new Date(dueDate);
            dueDateStart.setHours(0, 0, 0, 0);
            
            let groupKey;
            
            if (dueDateStart < today) {
                groupKey = 'overdue';
            } else if (dueDateStart.getTime() === today.getTime()) {
                groupKey = 'today';
            } else if (dueDateStart.getTime() === tomorrow.getTime()) {
                groupKey = 'tomorrow';
            } else {
                // Format as YYYY-MM-DD
                groupKey = dueDate.toISOString().split('T')[0];
            }
            
            if (!dueDateGroups[groupKey]) {
                dueDateGroups[groupKey] = [];
            }
            
            dueDateGroups[groupKey].push(task);
        });
        
        // Now render each group
        const groupOrder = ['overdue', 'today', 'tomorrow'];
        
        // First render special groups
        groupOrder.forEach(groupKey => {
            if (dueDateGroups[groupKey] && dueDateGroups[groupKey].length > 0) {
                renderTaskGroup(taskList, groupKey, dueDateGroups[groupKey], blockedTaskIds);
                delete dueDateGroups[groupKey];
            }
        });
        
        // Then render date groups (sorted)
        Object.keys(dueDateGroups)
            .filter(key => key !== 'no-date')
            .sort()
            .forEach(groupKey => {
                renderTaskGroup(taskList, groupKey, dueDateGroups[groupKey], blockedTaskIds);
            });
        
        // Finally render tasks with no date
        if (dueDateGroups['no-date'] && dueDateGroups['no-date'].length > 0) {
            renderTaskGroup(taskList, 'no-date', dueDateGroups['no-date'], blockedTaskIds);
        }
    } else if (sort === 'category') {
        // Group by category
        const categoryGroups = {};
        
        filteredTasks.forEach(task => {
            const category = task.category || 'uncategorized';
            
            if (!categoryGroups[category]) {
                categoryGroups[category] = [];
            }
            
            categoryGroups[category].push(task);
        });
        
        // Render each category group (sorted alphabetically)
        Object.keys(categoryGroups)
            .sort()
            .forEach(category => {
                renderTaskGroup(taskList, category, categoryGroups[category], blockedTaskIds);
            });
    } else {
        // Just render all tasks
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task, blockedTaskIds.has(task.id.toString()));
            taskList.appendChild(taskElement);
        });
    }
}

/**
 * Render a group of tasks with a header
 * @param {HTMLElement} container - Container element to append to
 * @param {string} groupKey - Key identifier for the group
 * @param {Array} tasks - Array of tasks in this group
 * @param {Set} blockedTaskIds - Set of task IDs that are blocked by dependencies
 */
function renderTaskGroup(container, groupKey, tasks, blockedTaskIds) {
    let groupLabel;
    
    switch (groupKey) {
        case 'overdue':
            groupLabel = 'Overdue';
            break;
        case 'today':
            groupLabel = 'Today';
            break;
        case 'tomorrow':
            groupLabel = 'Tomorrow';
            break;
        case 'no-date':
            groupLabel = 'No Due Date';
            break;
        case 'uncategorized':
            groupLabel = 'Uncategorized';
            break;
        default:
            // If it's a date string, format it nicely
            if (groupKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const date = new Date(groupKey);
                groupLabel = date.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                });
            } else {
                // Capitalize first letter for categories
                groupLabel = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
            }
    }
    
    const groupElement = document.createElement('div');
    groupElement.className = 'task-group';
    groupElement.innerHTML = `<h3 class="task-group-header">${groupLabel}</h3>`;
    
    const groupContent = document.createElement('div');
    groupContent.className = 'task-group-content';
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task, blockedTaskIds.has(task.id.toString()));
        groupContent.appendChild(taskElement);
    });
    
    groupElement.appendChild(groupContent);
    container.appendChild(groupElement);
}

/**
 * Create a task element 
 * @param {Object} task - Task data
 * @param {boolean} isBlocked - Whether the task is blocked by dependencies
 * @returns {HTMLElement} - The task element
 */
function createTaskElement(task, isBlocked) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;
    taskItem.setAttribute('draggable', 'true');
    
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    if (isBlocked) {
        taskItem.classList.add('blocked');
    }
    
    if (task.priority) {
        taskItem.classList.add(`priority-${task.priority}`);
    }
    
    if (task.category) {
        taskItem.classList.add(`category-${task.category}`);
    }
    
    // Calculate if task is overdue
    let isOverdue = false;
    if (task.dueDate && !task.completed) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        isOverdue = dueDate < now;
    }
    
    if (isOverdue) {
        taskItem.classList.add('overdue');
    }
    
    // Create the task content
    taskItem.innerHTML = `
        <div class="task-main">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                ${isBlocked ? 'disabled' : ''}>
            <div class="task-content">
                <div class="task-description">${task.description}</div>
                
                <div class="task-meta">
                    ${task.category ? `<span class="task-category ${task.category}">${task.category}</span>` : ''}
                    
                    ${task.dueDate ? `
                        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar-alt"></i>
                            ${formatDueDate(task.dueDate)}
                        </span>
                    ` : ''}
                    
                    ${task.dependencies && task.dependencies.length > 0 ? `
                        <span class="task-dependencies-count">
                            <i class="fas fa-link"></i>
                            ${task.dependencies.length}
                        </span>
                    ` : ''}
                    
                    ${task.notes ? `
                        <span class="task-has-notes" title="Has notes">
                            <i class="fas fa-sticky-note"></i>
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <div class="task-actions">
            ${isBlocked ? `
                <span class="task-blocked-indicator" title="This task is blocked by incomplete prerequisites">
                    <i class="fas fa-lock"></i>
                </span>
            ` : ''}
            
            <button class="task-action-btn edit" title="Edit Task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="task-action-btn delete" title="Delete Task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return taskItem;
}

/**
 * Format a due date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDueDate(dateString) {
    const dueDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDateDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    if (dueDateDay.getTime() === today.getTime()) {
        // Format as "Today, 3:00 PM"
        return `Today, ${dueDate.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`;
    } else if (dueDateDay.getTime() === tomorrow.getTime()) {
        // Format as "Tomorrow, 3:00 PM"
        return `Tomorrow, ${dueDate.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`;
    } else {
        // Format as "Mon, Jan 1, 3:00 PM"
        return dueDate.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }) + `, ${dueDate.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`;
    }
}

/**
 * Toggle a task's completion status
 * @param {string} taskId - ID of the task to toggle
 * @param {boolean} completed - New completion status
 */
function toggleTaskCompletion(taskId, completed) {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Find the task
    const taskIndex = tasks.findIndex(t => t.id.toString() === taskId.toString());
    
    if (taskIndex === -1) return;
    
    // Update completion status
    tasks[taskIndex].completed = completed;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    // If completed, set completedAt timestamp
    if (completed) {
        tasks[taskIndex].completedAt = new Date().toISOString();
    } else {
        delete tasks[taskIndex].completedAt;
    }
    
    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Update display
    displayTasks();
    
    // Fire custom event for task completion
    const taskCompletedEvent = new CustomEvent('taskCompletionChanged', {
        detail: {
            taskId,
            completed,
            task: tasks[taskIndex]
        }
    });
    document.dispatchEvent(taskCompletedEvent);
    
    // Show notification
    const message = completed ? 'Task completed!' : 'Task marked incomplete';
    if (typeof showNotification === 'function') {
        showNotification(message, completed ? 'success' : 'info');
    }
    
    // Check if any achievements were unlocked
    if (typeof checkAchievements === 'function') {
        checkAchievements();
    }
}

// Export functions for other modules
window.displayTasks = displayTasks;
window.toggleTaskCompletion = toggleTaskCompletion; 