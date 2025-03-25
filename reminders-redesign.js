/**
 * Reminders Redesign - JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Reminders Redesign JS loaded');
    initRemindersRedesign();
});

/**
 * Initialize the Reminders redesign functionality
 */
function initRemindersRedesign() {
    // Elements
    const reminderSearch = document.getElementById('reminder-search');
    const categoryItems = document.querySelectorAll('.category-item');
    const sortSelect = document.getElementById('sort-reminders');
    const remindersList = document.querySelector('.reminders-list');
    const addReminderBtn = document.getElementById('add-reminder-btn');
    
    // Reminder status toggles
    const reminderStatuses = document.querySelectorAll('.reminder-status');
    
    // Category selection
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            categoryItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get the category
            const category = item.getAttribute('data-category');
            
            // Filter reminders based on category
            filterRemindersByCategory(category);
        });
    });
    
    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortReminders(sortSelect.value);
        });
    }
    
    // Reminder search
    if (reminderSearch) {
        reminderSearch.addEventListener('input', () => {
            const searchTerm = reminderSearch.value.toLowerCase().trim();
            searchReminders(searchTerm);
        });
    }
    
    // Add reminder button
    if (addReminderBtn) {
        addReminderBtn.addEventListener('click', () => {
            showAddReminderModal();
        });
    }
    
    // Reminder status toggles
    reminderStatuses.forEach(status => {
        status.addEventListener('click', () => {
            const reminderItem = status.closest('.reminder-item');
            
            // Toggle completed state
            reminderItem.classList.toggle('completed');
            
            // Update reminder in storage
            // This would typically call a function to update the reminder in storage
            // Example: updateReminderStatus(reminderId, reminderItem.classList.contains('completed'));
            
            // Update counts
            updateReminderCounts();
        });
    });
    
    // Edit and delete buttons
    setupReminderActions();
    
    // Initial update of reminder counts
    updateReminderCounts();
}

/**
 * Filter reminders based on the selected category
 * @param {string} category - The category to filter by
 */
function filterRemindersByCategory(category) {
    const reminderItems = document.querySelectorAll('.reminder-item');
    
    reminderItems.forEach(item => {
        switch (category) {
            case 'all':
                item.style.display = '';
                break;
            case 'today':
                const isToday = item.querySelector('.reminder-detail span').textContent.includes('Today');
                item.style.display = isToday ? '' : 'none';
                break;
            case 'scheduled':
                const hasSchedule = item.querySelector('.reminder-detail .fa-calendar');
                item.style.display = hasSchedule ? '' : 'none';
                break;
            case 'recurring':
                const isRecurring = item.querySelector('.reminder-detail .fa-repeat');
                item.style.display = isRecurring ? '' : 'none';
                break;
            case 'completed':
                item.style.display = item.classList.contains('completed') ? '' : 'none';
                break;
            default:
                // Custom categories (work, personal, health)
                const categoryTag = item.querySelector('.reminder-category-tag span').textContent.toLowerCase();
                item.style.display = categoryTag === category ? '' : 'none';
                break;
        }
    });
}

/**
 * Sort reminders based on the selected sort option
 * @param {string} sortOption - The sort option to apply
 */
function sortReminders(sortOption) {
    const remindersList = document.querySelector('.reminders-list');
    const reminders = Array.from(remindersList.querySelectorAll('.reminder-item'));
    
    reminders.sort((a, b) => {
        switch (sortOption) {
            case 'date-added-desc':
                // This would use actual data-attribute in real implementation
                return -1; // Newest first (placeholder)
            case 'date-added-asc':
                return 1; // Oldest first (placeholder)
            case 'due-date-asc':
                const dateA = a.querySelector('.reminder-detail span').textContent;
                const dateB = b.querySelector('.reminder-detail span').textContent;
                return dateA.localeCompare(dateB);
            case 'due-date-desc':
                const date1 = a.querySelector('.reminder-detail span').textContent;
                const date2 = b.querySelector('.reminder-detail span').textContent;
                return date2.localeCompare(date1);
            case 'priority':
                // This would use actual priority data in real implementation
                return 0;
            case 'alphabetical':
                const titleA = a.querySelector('.reminder-title').textContent.toLowerCase();
                const titleB = b.querySelector('.reminder-title').textContent.toLowerCase();
                return titleA.localeCompare(titleB);
            default:
                return 0;
        }
    });
    
    // Reappend reminders in the new order
    reminders.forEach(reminder => {
        remindersList.appendChild(reminder);
    });
}

/**
 * Search reminders by title or details
 * @param {string} searchTerm - The search term to filter by
 */
function searchReminders(searchTerm) {
    const reminderItems = document.querySelectorAll('.reminder-item');
    
    if (!searchTerm) {
        // If search is empty, show all reminders
        reminderItems.forEach(item => {
            item.style.display = '';
        });
        return;
    }
    
    reminderItems.forEach(item => {
        const title = item.querySelector('.reminder-title').textContent.toLowerCase();
        const details = item.querySelector('.reminder-details').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || details.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Update reminder counts in the sidebar and header
 */
function updateReminderCounts() {
    const reminderItems = document.querySelectorAll('.reminder-item');
    const allCount = reminderItems.length;
    const completedCount = document.querySelectorAll('.reminder-item.completed').length;
    const activeCount = allCount - completedCount;
    
    // Today count
    const todayCount = Array.from(reminderItems).filter(item => {
        return item.querySelector('.reminder-detail span')?.textContent.includes('Today') || false;
    }).length;
    
    // Scheduled count
    const scheduledCount = Array.from(reminderItems).filter(item => {
        return item.querySelector('.reminder-detail .fa-calendar') !== null;
    }).length;
    
    // Recurring count
    const recurringCount = Array.from(reminderItems).filter(item => {
        return item.querySelector('.reminder-detail .fa-repeat') !== null;
    }).length;
    
    // Update counts in sidebar
    document.getElementById('all-reminders-count').textContent = allCount;
    document.getElementById('today-reminders-count').textContent = todayCount;
    document.getElementById('scheduled-reminders-count').textContent = scheduledCount;
    document.getElementById('recurring-reminders-count').textContent = recurringCount;
    document.getElementById('completed-category-count').textContent = completedCount;
    
    // Update counts in header
    document.getElementById('active-reminders-count').textContent = activeCount;
    document.getElementById('completed-reminders-count').textContent = completedCount;
    
    // Update custom category counts
    updateCustomCategoryCounts();
}

/**
 * Update counts for custom categories
 */
function updateCustomCategoryCounts() {
    const customCategories = document.querySelectorAll('#custom-categories .category-item');
    
    customCategories.forEach(category => {
        const categoryName = category.getAttribute('data-category');
        const count = document.querySelectorAll(`.reminder-category-tag span:contains('${categoryName}')`).length;
        category.querySelector('.reminder-count').textContent = count;
    });
}

/**
 * Set up event listeners for reminder action buttons
 */
function setupReminderActions() {
    // Edit buttons
    document.querySelectorAll('.reminder-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const reminderItem = btn.closest('.reminder-item');
            editReminder(reminderItem);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.reminder-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const reminderItem = btn.closest('.reminder-item');
            deleteReminder(reminderItem);
        });
    });
}

/**
 * Show the add reminder modal
 */
function showAddReminderModal() {
    // This would be implemented to show a modal for adding new reminders
    console.log('Show add reminder modal');
}

/**
 * Edit a reminder
 * @param {HTMLElement} reminderItem - The reminder item element to edit
 */
function editReminder(reminderItem) {
    // This would be implemented to show a modal for editing the reminder
    console.log('Edit reminder:', reminderItem);
}

/**
 * Delete a reminder
 * @param {HTMLElement} reminderItem - The reminder item element to delete
 */
function deleteReminder(reminderItem) {
    if (confirm('Are you sure you want to delete this reminder?')) {
        reminderItem.remove();
        updateReminderCounts();
    }
} 