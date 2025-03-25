/**
 * Scheduler Module
 * Handles daily schedule view and task scheduling
 */

document.addEventListener('DOMContentLoaded', function() {
    initScheduler();
});

/**
 * Initialize the scheduler functionality
 */
function initScheduler() {
    console.log('Initializing Scheduler...');
    
    // Create time blocks for the scheduler
    createTimeBlocks();
    
    // Set current date
    setCurrentDate();
    
    // Load scheduled items
    loadScheduledItems();
    
    // Set up event listeners
    setupSchedulerListeners();
}

/**
 * Create time blocks for the scheduler grid
 */
function createTimeBlocks() {
    const timeLabels = document.querySelector('.time-labels');
    const schedulerGrid = document.getElementById('scheduler-grid');
    
    if (!timeLabels || !schedulerGrid) return;
    
    // Clear existing elements
    timeLabels.innerHTML = '';
    schedulerGrid.innerHTML = '';
    
    // Create 24 hour blocks
    for (let hour = 0; hour < 24; hour++) {
        // Format hour label (12-hour format with AM/PM)
        const hourDisplay = hour === 0 ? '12 AM' : 
                           hour < 12 ? `${hour} AM` : 
                           hour === 12 ? '12 PM' : 
                           `${hour - 12} PM`;
        
        // Create time label
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = hourDisplay;
        timeLabels.appendChild(timeLabel);
        
        // Create grid cell for scheduling
        const gridCell = document.createElement('div');
        gridCell.className = 'scheduler-cell';
        gridCell.dataset.hour = hour;
        
        // Add half-hour marker
        gridCell.innerHTML = `<div class="half-hour-marker"></div>`;
        
        // Current hour highlight
        const now = new Date();
        if (hour === now.getHours()) {
            gridCell.classList.add('current-hour');
        }
        
        schedulerGrid.appendChild(gridCell);
    }
}

/**
 * Set the current date display
 * @param {Date} date - Date to display (defaults to today)
 */
function setCurrentDate(date = new Date()) {
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement) return;
    
    // Format date as "Day of Week, Month Day, Year"
    const dateOptions = { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    
    // Update display
    currentDateElement.textContent = formattedDate;
    
    // Store date in data attribute for easy access
    currentDateElement.dataset.date = date.toISOString().split('T')[0];
}

/**
 * Load scheduled items for the current date
 */
function loadScheduledItems() {
    const schedulerGrid = document.getElementById('scheduler-grid');
    const currentDateElement = document.getElementById('current-date');
    
    if (!schedulerGrid || !currentDateElement) return;
    
    // Get current selected date
    const dateStr = currentDateElement.dataset.date;
    
    // Clear existing scheduled items
    const existingItems = schedulerGrid.querySelectorAll('.scheduled-item');
    existingItems.forEach(item => item.remove());
    
    // Get scheduled items from localStorage
    const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
    
    // Filter items for the current date
    const dateStart = new Date(dateStr);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(dateStr);
    dateEnd.setHours(23, 59, 59, 999);
    
    const itemsForDate = scheduledTasks.filter(item => {
        const itemStart = new Date(item.start);
        return itemStart >= dateStart && itemStart <= dateEnd;
    });
    
    // Render each scheduled item
    itemsForDate.forEach(item => {
        renderScheduledItem(item);
    });
}

/**
 * Render a scheduled item on the grid
 * @param {Object} item - Scheduled item object
 */
function renderScheduledItem(item) {
    const schedulerGrid = document.getElementById('scheduler-grid');
    if (!schedulerGrid) return;
    
    // Get start and end times
    const startTime = new Date(item.start);
    const endTime = new Date(item.end);
    
    // Calculate position and size
    const startHour = startTime.getHours() + (startTime.getMinutes() / 60);
    const endHour = endTime.getHours() + (endTime.getMinutes() / 60);
    const duration = endHour - startHour;
    
    // Create scheduled item element
    const scheduledItem = document.createElement('div');
    scheduledItem.className = 'scheduled-item';
    scheduledItem.dataset.id = item.id;
    
    // Set color based on category/priority
    if (item.category) {
        scheduledItem.classList.add(`category-${item.category}`);
    }
    
    if (item.priority) {
        scheduledItem.classList.add(`priority-${item.priority}`);
    }
    
    // Set position
    const topPosition = (startHour * 60) + 'px';
    const height = (duration * 60) + 'px';
    
    scheduledItem.style.top = topPosition;
    scheduledItem.style.height = height;
    
    // Add content
    scheduledItem.innerHTML = `
        <div class="scheduled-item-content">
            <div class="scheduled-item-title">${item.title}</div>
            <div class="scheduled-item-time">
                ${formatTime(startTime)} - ${formatTime(endTime)}
            </div>
        </div>
        <div class="scheduled-item-actions">
            <button class="item-action-btn edit" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="item-action-btn delete" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add to scheduler grid
    schedulerGrid.appendChild(scheduledItem);
    
    // Add event listeners for edit/delete
    const editBtn = scheduledItem.querySelector('.item-action-btn.edit');
    const deleteBtn = scheduledItem.querySelector('.item-action-btn.delete');
    
    if (editBtn) {
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            editScheduledItem(item.id);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteScheduledItem(item.id);
        });
    }
}

/**
 * Set up event listeners for scheduler functionality
 */
function setupSchedulerListeners() {
    // Next/previous day navigation
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    
    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', function() {
            navigateDay(-1);
        });
    }
    
    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', function() {
            navigateDay(1);
        });
    }
    
    // Click on scheduler cell to add new item
    const schedulerGrid = document.getElementById('scheduler-grid');
    if (schedulerGrid) {
        schedulerGrid.addEventListener('click', function(e) {
            // Only respond to direct clicks on the cells, not on scheduled items
            if (e.target.classList.contains('scheduler-cell') || 
                e.target.classList.contains('half-hour-marker')) {
                
                const cell = e.target.closest('.scheduler-cell');
                if (cell) {
                    const hour = parseInt(cell.dataset.hour);
                    const rect = cell.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const minutes = Math.floor((clickY / rect.height) * 60);
                    
                    addScheduledItem(hour, minutes);
                }
            }
        });
        
        // Handle drop events for tasks
        schedulerGrid.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            const cell = e.target.closest('.scheduler-cell');
            if (cell) {
                // Add highlight to indicate drop target
                removeDropHighlights();
                cell.classList.add('drop-target');
            }
        });
        
        schedulerGrid.addEventListener('dragleave', function(e) {
            removeDropHighlights();
        });
        
        schedulerGrid.addEventListener('drop', function(e) {
            e.preventDefault();
            removeDropHighlights();
            
            // Process the drop
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                
                if (data.type === 'task') {
                    const cell = e.target.closest('.scheduler-cell');
                    if (cell) {
                        const hour = parseInt(cell.dataset.hour);
                        const rect = cell.getBoundingClientRect();
                        const clickY = e.clientY - rect.top;
                        const minutes = Math.floor((clickY / rect.height) * 60);
                        
                        scheduleTaskById(data.id, hour, minutes);
                    }
                }
            } catch (error) {
                console.error('Error handling drop:', error);
            }
        });
    }
}

/**
 * Remove drop highlight from all cells
 */
function removeDropHighlights() {
    document.querySelectorAll('.scheduler-cell.drop-target').forEach(cell => {
        cell.classList.remove('drop-target');
    });
}

/**
 * Navigate to the previous or next day
 * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
 */
function navigateDay(direction) {
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement || !currentDateElement.dataset.date) return;
    
    // Get current selected date
    const currentDate = new Date(currentDateElement.dataset.date);
    
    // Add/subtract days
    currentDate.setDate(currentDate.getDate() + direction);
    
    // Update display
    setCurrentDate(currentDate);
    
    // Reload scheduled items
    loadScheduledItems();
}

/**
 * Add a new scheduled item
 * @param {number} hour - Starting hour (0-23)
 * @param {number} minutes - Starting minutes (0-59)
 */
function addScheduledItem(hour, minutes) {
    // Get the current date
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement || !currentDateElement.dataset.date) return;
    
    const dateStr = currentDateElement.dataset.date;
    
    // Create start and end times (default duration: 1 hour)
    const startTime = new Date(dateStr);
    startTime.setHours(hour, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    // Open the scheduled item form
    openScheduledItemForm({
        start: startTime.toISOString(),
        end: endTime.toISOString()
    });
}

/**
 * Schedule a task by ID
 * @param {string} taskId - ID of the task to schedule
 * @param {number} hour - Starting hour (0-23)
 * @param {number} minutes - Starting minutes (0-59)
 */
function scheduleTaskById(taskId, hour, minutes) {
    // Get the current date
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement || !currentDateElement.dataset.date) return;
    
    const dateStr = currentDateElement.dataset.date;
    
    // Find the task
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }
    
    // Create start and end times (default duration: 1 hour)
    const startTime = new Date(dateStr);
    startTime.setHours(hour, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    // Create scheduled item
    const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
    
    const newItem = {
        id: Date.now().toString(),
        taskId: task.id,
        title: task.description,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        priority: task.priority,
        category: task.category,
        createdAt: new Date().toISOString()
    };
    
    scheduledTasks.push(newItem);
    
    // Save to localStorage
    localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
    
    // Update scheduler display
    loadScheduledItems();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Task scheduled successfully', 'success');
    }
}

/**
 * Edit a scheduled item
 * @param {string} itemId - ID of the scheduled item to edit
 */
function editScheduledItem(itemId) {
    // Get scheduled items
    const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
    
    // Find the item
    const item = scheduledTasks.find(i => i.id.toString() === itemId.toString());
    
    if (!item) {
        console.error('Scheduled item not found:', itemId);
        return;
    }
    
    // Open form with item data
    openScheduledItemForm(item);
}

/**
 * Delete a scheduled item
 * @param {string} itemId - ID of the scheduled item to delete
 */
function deleteScheduledItem(itemId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this scheduled item?')) {
        return;
    }
    
    // Get scheduled items
    const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
    
    // Filter out the item
    const updatedItems = scheduledTasks.filter(i => i.id.toString() !== itemId.toString());
    
    // Save to localStorage
    localStorage.setItem('scheduledTasks', JSON.stringify(updatedItems));
    
    // Update scheduler display
    loadScheduledItems();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Scheduled item deleted', 'info');
    }
}

/**
 * Open the scheduled item form
 * @param {Object} item - Item data for editing (optional)
 */
function openScheduledItemForm(item = null) {
    // Check if a task-form-like modal exists
    const existingModal = document.getElementById('scheduler-item-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'scheduler-item-modal';
    modal.className = 'modal';
    
    // Default times
    let startTime = new Date();
    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    let title = '';
    let priority = 'medium';
    let category = '';
    let itemId = '';
    let taskId = '';
    
    // If editing existing item, populate with its data
    if (item) {
        if (item.id) itemId = item.id;
        if (item.taskId) taskId = item.taskId;
        if (item.title) title = item.title;
        if (item.priority) priority = item.priority;
        if (item.category) category = item.category;
        if (item.start) startTime = new Date(item.start);
        if (item.end) endTime = new Date(item.end);
    }
    
    // Format dates for input fields
    const startDate = startTime.toISOString().split('T')[0];
    const startHours = startTime.getHours().toString().padStart(2, '0');
    const startMinutes = startTime.getMinutes().toString().padStart(2, '0');
    
    const endDate = endTime.toISOString().split('T')[0];
    const endHours = endTime.getHours().toString().padStart(2, '0');
    const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${item && item.id ? 'Edit Scheduled Item' : 'Add to Schedule'}</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="scheduled-item-form">
                    <input type="hidden" id="scheduled-item-id" value="${itemId}">
                    <input type="hidden" id="scheduled-task-id" value="${taskId}">
                    
                    <div class="form-group">
                        <label for="scheduled-item-title">Title</label>
                        <input type="text" id="scheduled-item-title" value="${title}" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="scheduled-item-start-date">Start Date</label>
                            <input type="date" id="scheduled-item-start-date" value="${startDate}" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduled-item-start-time">Start Time</label>
                            <input type="time" id="scheduled-item-start-time" value="${startHours}:${startMinutes}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="scheduled-item-end-date">End Date</label>
                            <input type="date" id="scheduled-item-end-date" value="${endDate}" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduled-item-end-time">End Time</label>
                            <input type="time" id="scheduled-item-end-time" value="${endHours}:${endMinutes}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="scheduled-item-priority">Priority</label>
                            <select id="scheduled-item-priority">
                                <option value="">None</option>
                                <option value="low" ${priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="scheduled-item-category">Category</label>
                            <select id="scheduled-item-category">
                                <option value="">None</option>
                                <option value="work" ${category === 'work' ? 'selected' : ''}>Work</option>
                                <option value="personal" ${category === 'personal' ? 'selected' : ''}>Personal</option>
                                <option value="health" ${category === 'health' ? 'selected' : ''}>Health</option>
                                <option value="education" ${category === 'education' ? 'selected' : ''}>Education</option>
                                <option value="other" ${category === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="cancel-scheduled-item" class="btn-secondary">Cancel</button>
                        <button type="submit" id="save-scheduled-item" class="btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Set up event listeners
    // Close button
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    });
    
    // Cancel button
    document.getElementById('cancel-scheduled-item').addEventListener('click', function() {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    });
    
    // Click outside to close
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    // Form submission
    document.getElementById('scheduled-item-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formItemId = document.getElementById('scheduled-item-id').value;
        const formTaskId = document.getElementById('scheduled-task-id').value;
        const formTitle = document.getElementById('scheduled-item-title').value.trim();
        const formPriority = document.getElementById('scheduled-item-priority').value;
        const formCategory = document.getElementById('scheduled-item-category').value;
        
        // Get start date/time
        const startDate = document.getElementById('scheduled-item-start-date').value;
        const startTime = document.getElementById('scheduled-item-start-time').value;
        const start = new Date(`${startDate}T${startTime}`);
        
        // Get end date/time
        const endDate = document.getElementById('scheduled-item-end-date').value;
        const endTime = document.getElementById('scheduled-item-end-time').value;
        const end = new Date(`${endDate}T${endTime}`);
        
        // Get scheduled items
        const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
        
        if (formItemId) {
            // Update existing item
            const itemIndex = scheduledTasks.findIndex(i => i.id.toString() === formItemId.toString());
            
            if (itemIndex !== -1) {
                scheduledTasks[itemIndex] = {
                    ...scheduledTasks[itemIndex],
                    title: formTitle,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    priority: formPriority || null,
                    category: formCategory || null,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new item
            const newItem = {
                id: Date.now().toString(),
                taskId: formTaskId || null,
                title: formTitle,
                start: start.toISOString(),
                end: end.toISOString(),
                priority: formPriority || null,
                category: formCategory || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            scheduledTasks.push(newItem);
        }
        
        // Save to localStorage
        localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
        
        // Close modal
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
        
        // Update scheduler display
        loadScheduledItems();
        
        // Show notification
        if (typeof showNotification === 'function') {
            const message = formItemId ? 'Scheduled item updated' : 'Item scheduled successfully';
            showNotification(message, 'success');
        }
    });
}

/**
 * Format time for display (12-hour format)
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted time string
 */
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Update the scheduler display
 * Called from other modules when changes might affect the schedule
 */
function updateScheduler() {
    loadScheduledItems();
}

// Export functions for other modules
window.updateScheduler = updateScheduler; 