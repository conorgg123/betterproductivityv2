/**
 * Tasks Redesign - JavaScript for the sleek professional interface
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Tasks Redesign JS loaded');
    initTasksRedesign();
});

/**
 * Initialize the Tasks redesign functionality
 */
function initTasksRedesign() {
    console.log('Initializing Tasks Redesign...');
    
    // Elements
    const taskSearch = document.getElementById('task-search');
    const viewItems = document.querySelectorAll('.view-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryFilter = document.getElementById('category-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const sortSelect = document.getElementById('sort-select');
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const taskList = document.querySelector('.task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    
    // Initial load of tasks
    loadAndDisplayTasks();
    
    // Update task counts
    updateTaskCounts();
    
    // Make sure task-form.js is loaded and initialized
    if (typeof initTaskForm === 'function') {
        initTaskForm();
    } else {
        console.error('Task form module not loaded correctly');
    }
    
    // Add Task button
    if (addTaskBtn) {
        console.log('Adding click listener to add-task-btn in tasks-redesign.js');
        addTaskBtn.addEventListener('click', () => {
            console.log('Add Task button clicked in tasks-redesign.js');
            if (typeof openTaskForm === 'function') {
                openTaskForm();
            } else {
                console.error('openTaskForm function not found');
                showNotification('Could not open task form. Please try again.', 'error');
                
                // Fallback: try to create modal directly
                if (typeof createTaskFormModal === 'function') {
                    createTaskFormModal();
                    const modal = document.getElementById('task-form-modal');
                    if (modal) {
                        modal.style.display = 'block';
                        console.log('Modal created and displayed via fallback');
                    }
                }
            }
        });
    } else {
        console.warn('Add Task button not found in tasks-redesign.js');
        
        // Add a global click handler as fallback
        document.addEventListener('click', (e) => {
            if (e.target.closest('#add-task-btn')) {
                console.log('Add Task button clicked via delegation in tasks-redesign.js');
                if (typeof openTaskForm === 'function') {
                    openTaskForm();
                } else if (typeof createTaskFormModal === 'function') {
                    createTaskFormModal();
                    const modal = document.getElementById('task-form-modal');
                    if (modal) modal.style.display = 'block';
                }
            }
        });
    }

    // View selection
    viewItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            viewItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get the view
            const view = item.getAttribute('data-view');
            
            // Filter tasks based on view
            filterTasksByView(view);
        });
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find parent filter-options element
            const filterGroup = btn.closest('.filter-options');
            
            // Remove active class from all buttons in this group
            filterGroup.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Apply filters
            applyFilters();
        });
    });
    
    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    
    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Reset all filter buttons to "All"
            document.querySelectorAll('.filter-options').forEach(group => {
                const allBtn = group.querySelector('[data-status="all"], [data-priority="all"]');
                if (allBtn) {
                    group.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    allBtn.classList.add('active');
                }
            });
            
            // Reset category filter
            if (categoryFilter) {
                categoryFilter.value = 'all';
            }
            
            // Apply filters
            applyFilters();
        });
    }
    
    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            loadAndDisplayTasks();
        });
    }
    
    // View toggle
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get the view
            const view = btn.getAttribute('data-view');
            
            // Apply view
            if (view === 'grid') {
                taskList.classList.add('grid-view');
            } else {
                taskList.classList.remove('grid-view');
            }
        });
    });
    
    // Task search
    if (taskSearch) {
        taskSearch.addEventListener('input', () => {
            const searchTerm = taskSearch.value.toLowerCase().trim();
            searchTasks(searchTerm);
        });
    }
    
    // Setup task checkbox click handlers
    setupTaskCheckboxes();
}

/**
 * Load tasks from localStorage and display them in the task list
 */
function loadAndDisplayTasks() {
    const taskList = document.querySelector('.task-list');
    if (!taskList) return;
    
    // Clear the task list
    taskList.innerHTML = '';
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Get the sort option
    const sortOption = document.getElementById('sort-select')?.value || 'date-added-desc';
    
    // Sort tasks based on the selected sort option
    const sortedTasks = sortTasksArray(tasks, sortOption);
    
    // If no tasks, show empty state
    if (sortedTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-tasks"></i>
                <p>No tasks yet</p>
                <p class="empty-state-description">Create your first task to get started!</p>
            </div>
        `;
        return;
    }
    
    // Create task items
    sortedTasks.forEach(task => {
        const taskItem = createTaskItem(task);
        taskList.appendChild(taskItem);
    });
    
    // Apply any active filters
    applyFilters();
    
    // Update task counts
    updateTaskCounts();
}

/**
 * Create a task item element
 * @param {Object} task - The task object
 * @returns {HTMLElement} - The task item element
 */
function createTaskItem(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.priority}`;
    taskItem.dataset.id = task.id;
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && !task.completed;
    if (isOverdue) {
        taskItem.classList.add('overdue');
    }
    
    // Format the due date if exists
    let dueDateHtml = '';
    if (dueDate) {
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const formattedDate = dueDate.toLocaleDateString('en-US', dateOptions);
        dueDateHtml = `
            <div class="task-meta-item">
                <i class="fa-solid ${task.completed ? 'fa-calendar-check' : isOverdue ? 'fa-calendar-times' : 'fa-calendar'}"></i>
                <span>${task.completed ? 'Completed: ' : isOverdue ? 'Overdue: ' : 'Due: '} ${formattedDate}</span>
            </div>
        `;
    }
    
    // Category badge
    let categoryHtml = '';
    if (task.category) {
        categoryHtml = `<div class="task-category">${task.category}</div>`;
    }
    
    // Task description (notes)
    let descriptionHtml = '';
    if (task.notes) {
        descriptionHtml = `<p class="task-description">${task.notes}</p>`;
    }
    
    taskItem.innerHTML = `
        <div class="task-checkbox">
            <i class="fa-solid fa-check"></i>
        </div>
        <div class="task-content">
            <h3 class="task-title">${task.description}</h3>
            ${descriptionHtml}
            <div class="task-meta">
                ${dueDateHtml}
                ${categoryHtml}
            </div>
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
    
    // Add event listener for checkbox
    const checkbox = taskItem.querySelector('.task-checkbox');
    if (checkbox) {
        checkbox.addEventListener('click', () => {
            // Toggle completed class
            taskItem.classList.toggle('completed');
            
            // Update task in localStorage
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const taskIndex = tasks.findIndex(t => t.id.toString() === task.id.toString());
            
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                tasks[taskIndex].updatedAt = new Date().toISOString();
                
                // If completed, set completedAt
                if (tasks[taskIndex].completed) {
                    tasks[taskIndex].completedAt = new Date().toISOString();
                } else {
                    delete tasks[taskIndex].completedAt;
                }
                
                localStorage.setItem('tasks', JSON.stringify(tasks));
                
                // Update task counts
                updateTaskCounts();
                
                // Show notification
                showNotification(
                    tasks[taskIndex].completed ? 'Task marked as completed' : 'Task marked as incomplete', 
                    'success'
                );
            }
        });
    }
    
    // Add event listeners for action buttons
    const editBtn = taskItem.querySelector('.task-action-btn.edit');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (typeof editTask === 'function') {
                editTask(task.id);
            }
        });
    }
    
    const deleteBtn = taskItem.querySelector('.task-action-btn.delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (typeof deleteTask === 'function') {
                deleteTask(task.id);
            }
        });
    }
    
    return taskItem;
}

/**
 * Sort an array of tasks based on the provided sort option
 * @param {Array} tasks - Array of task objects
 * @param {string} sortOption - Sort option string
 * @returns {Array} - Sorted array of tasks
 */
function sortTasksArray(tasks, sortOption) {
    return [...tasks].sort((a, b) => {
        switch (sortOption) {
            case 'date-added-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-added-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'due-date-asc': {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            case 'due-date-desc': {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(b.dueDate) - new Date(a.dueDate);
            }
            case 'priority-desc': {
                const priorityValue = { high: 3, medium: 2, low: 1 };
                return priorityValue[b.priority] - priorityValue[a.priority];
            }
            case 'priority-asc': {
                const priorityValue = { high: 3, medium: 2, low: 1 };
                return priorityValue[a.priority] - priorityValue[b.priority];
            }
            case 'alphabetical':
                return a.description.localeCompare(b.description);
            default:
                return 0;
        }
    });
}

/**
 * Filter tasks based on the selected view
 * @param {string} view - The view to filter by (all, today, upcoming, completed)
 */
function filterTasksByView(view) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskItems = document.querySelectorAll('.task-item');
    
    // Reset any existing filters
    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        const filterGroup = btn.closest('.filter-options');
        const allBtn = filterGroup.querySelector('[data-status="all"], [data-priority="all"]');
        if (allBtn) {
            filterGroup.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            allBtn.classList.add('active');
        }
    });
    
    // Reset category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.value = 'all';
    }
    
    // Apply view filter
    taskItems.forEach(item => {
        const taskId = item.dataset.id;
        const task = tasks.find(t => t.id.toString() === taskId);
        
        if (!task) {
            item.style.display = 'none';
            return;
        }
        
        switch (view) {
            case 'all':
                item.style.display = '';
                break;
            case 'today': {
                const isToday = task.dueDate ? isDateToday(new Date(task.dueDate)) : false;
                item.style.display = isToday ? '' : 'none';
                break;
            }
            case 'upcoming': {
                if (!task.dueDate || task.completed) {
                    item.style.display = 'none';
                    return;
                }
                
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                item.style.display = dueDate >= today ? '' : 'none';
                break;
            }
            case 'completed':
                item.style.display = task.completed ? '' : 'none';
                break;
            default:
                item.style.display = '';
                break;
        }
    });
}

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is today
 */
function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

/**
 * Apply all filters (status, priority, category)
 */
function applyFilters() {
    const taskItems = document.querySelectorAll('.task-item');
    const statusFilter = document.querySelector('.status-filter .filter-btn.active')?.getAttribute('data-status') || 'all';
    const priorityFilter = document.querySelector('.priority-filter .filter-btn.active')?.getAttribute('data-priority') || 'all';
    const categoryFilter = document.getElementById('category-filter')?.value || 'all';
    
    taskItems.forEach(item => {
        // Skip items already hidden by view filter
        if (item.style.display === 'none') return;
        
        let showItem = true;
        
        // Status filter
        if (statusFilter !== 'all') {
            const isCompleted = item.classList.contains('completed');
            if ((statusFilter === 'completed' && !isCompleted) || 
                (statusFilter === 'pending' && isCompleted)) {
                showItem = false;
            }
        }
        
        // Priority filter
        if (priorityFilter !== 'all' && showItem) {
            if (!item.classList.contains(priorityFilter)) {
                showItem = false;
            }
        }
        
        // Category filter
        if (categoryFilter !== 'all' && showItem) {
            const category = item.querySelector('.task-category')?.textContent.toLowerCase() || '';
            if (category !== categoryFilter.toLowerCase()) {
                showItem = false;
            }
        }
        
        // Apply display
        item.style.display = showItem ? '' : 'none';
    });
    
    // Update empty state if no visible tasks
    updateEmptyState();
}

/**
 * Search tasks based on a search term
 * @param {string} searchTerm - The search term
 */
function searchTasks(searchTerm) {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(item => {
        // Skip items already hidden by filters
        if (item.style.display === 'none' && searchTerm !== '') return;
        
        const title = item.querySelector('.task-title').textContent.toLowerCase();
        const description = item.querySelector('.task-description')?.textContent.toLowerCase() || '';
        const category = item.querySelector('.task-category')?.textContent.toLowerCase() || '';
        
        const matchesSearch = 
            title.includes(searchTerm) || 
            description.includes(searchTerm) || 
            category.includes(searchTerm);
        
        item.style.display = (searchTerm === '' || matchesSearch) ? '' : 'none';
    });
    
    // Update empty state if no visible tasks
    updateEmptyState();
}

/**
 * Update the empty state message if no tasks are visible
 */
function updateEmptyState() {
    const taskList = document.querySelector('.task-list');
    const visibleTasks = document.querySelectorAll('.task-item[style="display: none;"]');
    
    if (taskList && taskList.children.length > 0 && visibleTasks.length === taskList.children.length) {
        // All tasks are hidden, show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fa-solid fa-filter"></i>
            <p>No matching tasks</p>
            <p class="empty-state-description">Try adjusting your filters or search term</p>
        `;
        
        // Remove existing empty state if any
        const existingEmptyState = taskList.querySelector('.empty-state');
        if (existingEmptyState) {
            existingEmptyState.remove();
        }
        
        taskList.appendChild(emptyState);
    } else {
        // Remove empty state if tasks are visible
        const existingEmptyState = taskList.querySelector('.empty-state');
        if (existingEmptyState) {
            existingEmptyState.remove();
        }
    }
}

/**
 * Update task counts in the sidebar
 */
function updateTaskCounts() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // All tasks
    const allCount = document.getElementById('all-count');
    if (allCount) {
        allCount.textContent = tasks.length;
    }
    
    // Today's tasks
    const todayCount = document.getElementById('today-count');
    if (todayCount) {
        const todayTasks = tasks.filter(task => 
            task.dueDate && isDateToday(new Date(task.dueDate))
        );
        todayCount.textContent = todayTasks.length;
    }
    
    // Upcoming tasks (not completed, due in the future)
    const upcomingCount = document.getElementById('upcoming-count');
    if (upcomingCount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingTasks = tasks.filter(task => 
            !task.completed && task.dueDate && new Date(task.dueDate) >= today
        );
        upcomingCount.textContent = upcomingTasks.length;
    }
    
    // Completed tasks
    const completedCount = document.getElementById('completed-view-count');
    if (completedCount) {
        const completedTasks = tasks.filter(task => task.completed);
        completedCount.textContent = completedTasks.length;
    }
    
    // Update summary counts
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

/**
 * Setup task checkbox click handlers
 */
function setupTaskCheckboxes() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.task-checkbox')) {
            const checkbox = e.target.closest('.task-checkbox');
            const taskItem = checkbox.closest('.task-item');
            
            if (taskItem) {
                // The click handler is added when creating the task item
                // This delegation is just for dynamically added tasks
            }
        }
    });
}

// Add a global notification function if needed
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

// Export functions
window.loadAndDisplayTasks = loadAndDisplayTasks;
window.updateTaskCounts = updateTaskCounts; 