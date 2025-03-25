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
    // Elements
    const taskSearch = document.getElementById('task-search');
    const viewItems = document.querySelectorAll('.view-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryFilter = document.getElementById('category-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const sortSelect = document.getElementById('sort-select');
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const taskList = document.querySelector('.task-list');
    
    // Task checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    
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
            sortTasks(sortSelect.value);
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
    
    // Task checkboxes
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', () => {
            const taskItem = checkbox.closest('.task-item');
            
            // Toggle completed state
            taskItem.classList.toggle('completed');
            
            // Update task in storage
            // This would typically call a function to update the task in storage
            // Example: updateTaskCompletionStatus(taskId, taskItem.classList.contains('completed'));
            
            // Update counts
            updateTaskCounts();
        });
    });
    
    // Initial update of task counts
    updateTaskCounts();
}

/**
 * Filter tasks based on the selected view
 * @param {string} view - The view to filter by (all, today, upcoming, completed)
 */
function filterTasksByView(view) {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(item => {
        switch (view) {
            case 'all':
                item.style.display = '';
                break;
            case 'today':
                // Example logic - would need to check actual due dates in real implementation
                const isToday = item.querySelector('.task-meta-item span').textContent.includes('Oct 15, 2023');
                item.style.display = isToday ? '' : 'none';
                break;
            case 'upcoming':
                // Example logic - would need date comparison in real implementation
                const isDueInFuture = !item.classList.contains('completed');
                item.style.display = isDueInFuture ? '' : 'none';
                break;
            case 'completed':
                item.style.display = item.classList.contains('completed') ? '' : 'none';
                break;
            default:
                item.style.display = '';
                break;
        }
    });
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
            const category = item.querySelector('.task-category').textContent.toLowerCase();
            if (category !== categoryFilter.toLowerCase()) {
                showItem = false;
            }
        }
        
        // Apply display
        item.style.display = showItem ? '' : 'none';
    });
}

/**
 * Sort tasks based on the selected sort option
 * @param {string} sortOption - The sort option to apply
 */
function sortTasks(sortOption) {
    const taskList = document.querySelector('.task-list');
    const tasks = Array.from(taskList.querySelectorAll('.task-item'));
    
    // Sort tasks based on the selected option
    tasks.sort((a, b) => {
        switch (sortOption) {
            case 'date-added-desc':
                // This would use actual data-attribute in real implementation
                return -1; // Newest first (placeholder)
            case 'date-added-asc':
                return 1; // Oldest first (placeholder)
            case 'due-date-asc':
                // This would compare actual dates in real implementation
                const dateA = a.querySelector('.task-meta-item span').textContent;
                const dateB = b.querySelector('.task-meta-item span').textContent;
                return dateA.localeCompare(dateB); // Soonest first
            case 'due-date-desc':
                const date1 = a.querySelector('.task-meta-item span').textContent;
                const date2 = b.querySelector('.task-meta-item span').textContent;
                return date2.localeCompare(date1); // Latest first
            case 'priority-desc':
                // High > Medium > Low
                const getPriorityValue = item => 
                    item.classList.contains('high') ? 3 : 
                    item.classList.contains('medium') ? 2 : 
                    item.classList.contains('low') ? 1 : 0;
                
                return getPriorityValue(b) - getPriorityValue(a);
            case 'priority-asc':
                // Low > Medium > High
                const getPriorityVal = item => 
                    item.classList.contains('high') ? 3 : 
                    item.classList.contains('medium') ? 2 : 
                    item.classList.contains('low') ? 1 : 0;
                
                return getPriorityVal(a) - getPriorityVal(b);
            case 'alphabetical':
                const titleA = a.querySelector('.task-title').textContent.toLowerCase();
                const titleB = b.querySelector('.task-title').textContent.toLowerCase();
                return titleA.localeCompare(titleB);
            default:
                return 0;
        }
    });
    
    // Reappend tasks in the new order
    tasks.forEach(task => {
        taskList.appendChild(task);
    });
}

/**
 * Search tasks by title or description
 * @param {string} searchTerm - The search term to filter by
 */
function searchTasks(searchTerm) {
    const taskItems = document.querySelectorAll('.task-item');
    
    if (!searchTerm) {
        // If search is empty, show all tasks
        taskItems.forEach(item => {
            item.style.display = '';
        });
        return;
    }
    
    taskItems.forEach(item => {
        const title = item.querySelector('.task-title').textContent.toLowerCase();
        const description = item.querySelector('.task-description')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Update task counts in the sidebar
 */
function updateTaskCounts() {
    const taskItems = document.querySelectorAll('.task-item');
    const allCount = taskItems.length;
    const completedCount = document.querySelectorAll('.task-item.completed').length;
    const pendingCount = allCount - completedCount;
    
    // Today count (example logic)
    const todayCount = Array.from(taskItems).filter(item => {
        return item.querySelector('.task-meta-item span')?.textContent.includes('Oct 15, 2023') || false;
    }).length;
    
    // Upcoming count (example logic)
    const upcomingCount = pendingCount;
    
    // Update count elements
    document.getElementById('all-count').textContent = allCount;
    document.getElementById('today-count').textContent = todayCount;
    document.getElementById('upcoming-count').textContent = upcomingCount;
    document.getElementById('completed-view-count').textContent = completedCount;
    
    // Update summary counts
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('completed-count').textContent = completedCount;
} 