// Quick Add Module for handling tasks, notes, reminders, and events from keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    initQuickAdd();
});

function initQuickAdd() {
    // Create and append modal structure to the DOM
    const quickAddModal = createQuickAddModal();
    document.body.appendChild(quickAddModal);
    
    // Set up event listeners for the quick add modal
    setupQuickAddListeners();
}

function createQuickAddModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'quick-add-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content quick-add-modal-content">
            <div class="modal-header">
                <h3>Quick Add</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="quick-add-tabs">
                    <button class="quick-add-tab active" data-type="task">Task</button>
                    <button class="quick-add-tab" data-type="note">Note</button>
                    <button class="quick-add-tab" data-type="reminder">Reminder</button>
                    <button class="quick-add-tab" data-type="event">Event</button>
                </div>
                
                <form class="quick-add-form">
                    <input type="text" id="quick-add-text" placeholder="What would you like to add?" autofocus>
                    
                    <div class="quick-add-options">
                        <!-- Dynamic options will be loaded here based on the selected tab -->
                    </div>
                    
                    <div class="quick-add-actions">
                        <button type="button" class="btn-secondary close-quick-add">Cancel</button>
                        <button type="submit" class="btn-primary">Add</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return modalDiv;
}

function setupQuickAddListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.quick-add-tab');
    tabButtons.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            // Update options based on selected tab
            updateQuickAddOptions(e.target.dataset.type);
        });
    });
    
    // Form submission
    const quickAddForm = document.querySelector('.quick-add-form');
    quickAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleQuickAddSubmit();
    });
    
    // Close modal buttons
    document.querySelector('.close-modal').addEventListener('click', hideQuickAddModal);
    document.querySelector('.close-quick-add').addEventListener('click', hideQuickAddModal);
    
    // Close on outside click
    const quickAddModal = document.getElementById('quick-add-modal');
    quickAddModal.addEventListener('click', (e) => {
        if (e.target === quickAddModal) {
            hideQuickAddModal();
        }
    });
    
    // Keyboard shortcut to close modal (Escape key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quickAddModal.style.display === 'block') {
            hideQuickAddModal();
        }
    });
}

function updateQuickAddOptions(type) {
    const optionsContainer = document.querySelector('.quick-add-options');
    const textInput = document.getElementById('quick-add-text');
    
    // Clear current options
    optionsContainer.innerHTML = '';
    
    // Set appropriate placeholder based on type
    switch (type) {
        case 'task':
            textInput.placeholder = 'Enter task description...';
            
            // Task-specific options
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label for="quick-add-priority">Priority</label>
                    <select id="quick-add-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quick-add-date">Due Date</label>
                    <input type="datetime-local" id="quick-add-date">
                </div>
                <div class="form-group">
                    <label for="quick-add-category">Category</label>
                    <select id="quick-add-category">
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="health">Health</option>
                        <option value="education">Education</option>
                        <option value="other" selected>Other</option>
                    </select>
                </div>
            `;
            break;
            
        case 'note':
            textInput.placeholder = 'Enter note title...';
            
            // Note-specific options
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label for="quick-add-note-content">Note Content</label>
                    <textarea id="quick-add-note-content" rows="3" placeholder="Enter note content..."></textarea>
                </div>
                <div class="form-group">
                    <label for="quick-add-note-category">Category</label>
                    <select id="quick-add-note-category">
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="ideas">Ideas</option>
                        <option value="other" selected>Other</option>
                    </select>
                </div>
            `;
            break;
            
        case 'reminder':
            textInput.placeholder = 'Enter reminder description...';
            
            // Reminder-specific options
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label for="quick-add-reminder-date">Remind at</label>
                    <input type="datetime-local" id="quick-add-reminder-date" required>
                </div>
                <div class="form-group">
                    <label for="quick-add-reminder-repeat">Repeat</label>
                    <select id="quick-add-reminder-repeat">
                        <option value="never" selected>Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            `;
            break;
            
        case 'event':
            textInput.placeholder = 'Enter event title...';
            
            // Event-specific options
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label for="quick-add-event-start">Start Time</label>
                    <input type="datetime-local" id="quick-add-event-start" required>
                </div>
                <div class="form-group">
                    <label for="quick-add-event-end">End Time</label>
                    <input type="datetime-local" id="quick-add-event-end" required>
                </div>
                <div class="form-group">
                    <label for="quick-add-event-location">Location</label>
                    <input type="text" id="quick-add-event-location" placeholder="Enter location...">
                </div>
            `;
            break;
    }
}

function handleQuickAddSubmit() {
    const textInput = document.getElementById('quick-add-text');
    const text = textInput.value.trim();
    
    if (!text) {
        textInput.classList.add('error');
        setTimeout(() => textInput.classList.remove('error'), 500);
        return;
    }
    
    // Determine the active tab
    const activeTab = document.querySelector('.quick-add-tab.active').dataset.type;
    
    // Process submission based on type
    let success = false;
    
    switch (activeTab) {
        case 'task':
            success = quickAddTask(text);
            break;
        case 'note':
            success = quickAddNote(text);
            break;
        case 'reminder':
            success = quickAddReminder(text);
            break;
        case 'event':
            success = quickAddEvent(text);
            break;
    }
    
    if (success) {
        // Show success toast
        showToast('Success', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} added successfully`, 'success');
        
        // Close modal
        hideQuickAddModal();
    }
}

function quickAddTask(description) {
    try {
        const priority = document.getElementById('quick-add-priority').value;
        const dueDate = document.getElementById('quick-add-date').value;
        const category = document.getElementById('quick-add-category').value;
        
        // Validate date if provided
        if (dueDate && new Date(dueDate) < new Date()) {
            document.getElementById('quick-add-date').classList.add('error');
            setTimeout(() => document.getElementById('quick-add-date').classList.remove('error'), 500);
            return false;
        }
        
        const task = {
            id: Date.now(),
            description: description,
            completed: false,
            dateAdded: new Date().toISOString(),
            priority: priority,
            category: category,
            dueDate: dueDate || null
        };
        
        // Save task to localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // If displayTasks function exists, refresh the task list
        if (typeof displayTasks === 'function') {
            displayTasks();
        }
        
        return true;
    } catch (error) {
        console.error("Error adding task:", error);
        showToast('Error', 'Failed to add task', 'error');
        return false;
    }
}

function quickAddNote(title) {
    try {
        const content = document.getElementById('quick-add-note-content').value;
        const category = document.getElementById('quick-add-note-category').value;
        
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            category: category
        };
        
        // Save note to localStorage
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // If displayNotes function exists, refresh the notes list
        if (typeof displayNotes === 'function') {
            displayNotes();
        }
        
        return true;
    } catch (error) {
        console.error("Error adding note:", error);
        showToast('Error', 'Failed to add note', 'error');
        return false;
    }
}

function quickAddReminder(description) {
    try {
        const reminderDate = document.getElementById('quick-add-reminder-date').value;
        const repeat = document.getElementById('quick-add-reminder-repeat').value;
        
        // Validate date
        if (!reminderDate) {
            document.getElementById('quick-add-reminder-date').classList.add('error');
            setTimeout(() => document.getElementById('quick-add-reminder-date').classList.remove('error'), 500);
            return false;
        }
        
        const reminder = {
            id: Date.now(),
            description: description,
            reminderDate: reminderDate,
            repeat: repeat,
            dateCreated: new Date().toISOString(),
            isComplete: false
        };
        
        // Save reminder to localStorage
        const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        reminders.push(reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));
        
        // If displayReminders function exists, refresh the reminders list
        if (typeof displayReminders === 'function') {
            displayReminders();
        }
        
        return true;
    } catch (error) {
        console.error("Error adding reminder:", error);
        showToast('Error', 'Failed to add reminder', 'error');
        return false;
    }
}

function quickAddEvent(title) {
    try {
        const startTime = document.getElementById('quick-add-event-start').value;
        const endTime = document.getElementById('quick-add-event-end').value;
        const location = document.getElementById('quick-add-event-location').value;
        
        // Validate dates
        if (!startTime) {
            document.getElementById('quick-add-event-start').classList.add('error');
            setTimeout(() => document.getElementById('quick-add-event-start').classList.remove('error'), 500);
            return false;
        }
        
        if (!endTime) {
            document.getElementById('quick-add-event-end').classList.add('error');
            setTimeout(() => document.getElementById('quick-add-event-end').classList.remove('error'), 500);
            return false;
        }
        
        if (new Date(endTime) <= new Date(startTime)) {
            document.getElementById('quick-add-event-end').classList.add('error');
            setTimeout(() => document.getElementById('quick-add-event-end').classList.remove('error'), 500);
            showToast('Error', 'End time must be after start time', 'error');
            return false;
        }
        
        const event = {
            id: Date.now(),
            title: title,
            startTime: startTime,
            endTime: endTime,
            location: location || '',
            dateCreated: new Date().toISOString()
        };
        
        // Save event to localStorage
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        
        // If updateCalendar function exists, refresh the calendar
        if (typeof updateCalendar === 'function') {
            updateCalendar();
        }
        
        return true;
    } catch (error) {
        console.error("Error adding event:", error);
        showToast('Error', 'Failed to add event', 'error');
        return false;
    }
}

function showQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    modal.style.display = 'block';
    
    // Focus on text input
    setTimeout(() => {
        document.getElementById('quick-add-text').focus();
    }, 100);
    
    // Reset form
    document.querySelector('.quick-add-form').reset();
    
    // Reset to first tab (Task)
    const tabButtons = document.querySelectorAll('.quick-add-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabButtons[0].classList.add('active');
    
    // Update options for default tab
    updateQuickAddOptions('task');
}

function hideQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    modal.style.display = 'none';
}

function showToast(title, message, type = 'info') {
    // Check if toast function exists in the global scope
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Create toast if it doesn't exist already
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set toast content and type
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getIconForToastType(type)}"></i>
            <div>
                <strong>${title}</strong>
                <div>${message}</div>
            </div>
        </div>
    `;
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }, 10);
}

function getIconForToastType(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': 
        default: return 'fa-info-circle';
    }
}

// Export functions for use by other modules
window.showQuickAddModal = showQuickAddModal;
window.hideQuickAddModal = hideQuickAddModal; 