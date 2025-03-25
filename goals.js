// Goal Setting Module
document.addEventListener('DOMContentLoaded', function() {
    initGoals();
});

/**
 * Initialize goals functionality
 */
function initGoals() {
    console.log('Initializing goals functionality...');
    
    // Create and add goal setting modal to the DOM
    const goalModal = createGoalModal();
    document.body.appendChild(goalModal);
    
    // Set up event listeners
    setupGoalListeners();
    
    // Create goals section if it doesn't exist
    createGoalsSection();
    
    // Display goals
    displayGoals();
}

/**
 * Create goal setting modal
 */
function createGoalModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'goal-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content goal-modal-content">
            <div class="modal-header">
                <h3 id="goal-modal-title">Add New Goal</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="goal-form">
                    <input type="hidden" id="goal-id">
                    
                    <div class="form-group">
                        <label for="goal-title">Goal Title</label>
                        <input type="text" id="goal-title" placeholder="Enter goal title..." required>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-description">Description</label>
                        <textarea id="goal-description" placeholder="Enter goal description..." rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-type">Goal Type</label>
                        <select id="goal-type">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="long-term">Long-term</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="goal-start-date">Start Date</label>
                            <input type="date" id="goal-start-date" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="goal-end-date">End Date</label>
                            <input type="date" id="goal-end-date">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-category">Category</label>
                        <select id="goal-category">
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="health">Health</option>
                            <option value="education">Education</option>
                            <option value="finance">Finance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group goal-tasks-section">
                        <label>Related Tasks</label>
                        <div id="goal-tasks-list" class="goal-tasks-list">
                            <!-- Task list will be populated dynamically -->
                        </div>
                        <div class="goal-tasks-footer">
                            <button type="button" id="add-goal-task" class="btn-small">
                                <i class="fas fa-plus"></i> Add Task
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancel-goal">Cancel</button>
                        <button type="submit" class="btn-primary">Save Goal</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Create goals section in the UI
 */
function createGoalsSection() {
    // Check if goals section already exists
    if (document.getElementById('goals-section')) {
        return;
    }
    
    // Find the main content area or tasks section to append after
    const mainContent = document.querySelector('.main-content');
    const tasksSection = document.getElementById('tasks-section');
    
    if (!mainContent && !tasksSection) {
        console.error('Could not find a suitable location to add goals section');
        return;
    }
    
    // Create goals section
    const goalsSection = document.createElement('div');
    goalsSection.id = 'goals-section';
    goalsSection.className = 'section';
    
    goalsSection.innerHTML = `
        <div class="section-header">
            <h2>Goals</h2>
            <div class="section-actions">
                <button id="add-goal-btn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
            </div>
        </div>
        
        <div class="goals-filter">
            <div class="goal-filter-options">
                <span>Show:</span>
                <button class="goal-filter-btn active" data-filter="all">All</button>
                <button class="goal-filter-btn" data-filter="daily">Daily</button>
                <button class="goal-filter-btn" data-filter="weekly">Weekly</button>
                <button class="goal-filter-btn" data-filter="monthly">Monthly</button>
                <button class="goal-filter-btn" data-filter="long-term">Long-term</button>
            </div>
        </div>
        
        <div class="goals-container">
            <!-- Goals will be dynamically added here -->
        </div>
    `;
    
    // Add to the DOM
    if (tasksSection) {
        tasksSection.insertAdjacentElement('afterend', goalsSection);
    } else {
        mainContent.appendChild(goalsSection);
    }
}

/**
 * Set up event listeners for goals functionality
 */
function setupGoalListeners() {
    // Add goal button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'add-goal-btn' || e.target.closest('#add-goal-btn')) {
            showAddGoalModal();
        }
    });
    
    // Close goal modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || e.target.id === 'cancel-goal') {
            hideGoalModal();
        }
    });
    
    // Close on outside click
    const goalModal = document.getElementById('goal-modal');
    if (goalModal) {
        goalModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideGoalModal();
            }
        });
    }
    
    // Goal form submission
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveGoal();
        });
    }
    
    // Add task to goal
    document.addEventListener('click', function(e) {
        if (e.target.id === 'add-goal-task' || e.target.closest('#add-goal-task')) {
            addTaskToGoal();
        }
    });
    
    // Remove task from goal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-goal-task') || e.target.closest('.remove-goal-task')) {
            const taskItem = e.target.closest('.goal-task-item');
            if (taskItem) {
                taskItem.remove();
            }
        }
    });
    
    // Goal filter buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('goal-filter-btn')) {
            const filterButtons = document.querySelectorAll('.goal-filter-btn');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.getAttribute('data-filter');
            filterGoals(filter);
        }
    });
    
    // Goal actions (complete, edit, delete)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('goal-action-btn') || e.target.closest('.goal-action-btn')) {
            const button = e.target.classList.contains('goal-action-btn') ? e.target : e.target.closest('.goal-action-btn');
            const goalCard = button.closest('.goal-card');
            if (!goalCard) return;
            
            const goalId = goalCard.getAttribute('data-id');
            const action = button.getAttribute('data-action');
            
            switch (action) {
                case 'complete':
                    toggleGoalCompletion(goalId);
                    break;
                case 'edit':
                    editGoal(goalId);
                    break;
                case 'delete':
                    deleteGoal(goalId);
                    break;
            }
        }
    });
}

/**
 * Show modal for adding a new goal
 */
function showAddGoalModal() {
    const modal = document.getElementById('goal-modal');
    const modalTitle = document.getElementById('goal-modal-title');
    const goalForm = document.getElementById('goal-form');
    
    if (modal && modalTitle && goalForm) {
        // Reset form
        goalForm.reset();
        document.getElementById('goal-id').value = '';
        document.getElementById('goal-tasks-list').innerHTML = '';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('goal-start-date').value = today;
        
        // Set title
        modalTitle.textContent = 'Add New Goal';
        
        // Show modal
        modal.style.display = 'block';
    }
}

/**
 * Hide goal modal
 */
function hideGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Save a new goal or update an existing one
 */
function saveGoal() {
    try {
        // Get form values
        const goalId = document.getElementById('goal-id').value;
        const title = document.getElementById('goal-title').value.trim();
        const description = document.getElementById('goal-description').value.trim();
        const type = document.getElementById('goal-type').value;
        const startDate = document.getElementById('goal-start-date').value;
        const endDate = document.getElementById('goal-end-date').value;
        const category = document.getElementById('goal-category').value;
        
        // Validate input
        if (!title) {
            showToast('Please enter a goal title', 'error');
            return;
        }
        
        if (!startDate) {
            showToast('Please select a start date', 'error');
            return;
        }
        
        // Get tasks
        const taskElements = document.querySelectorAll('.goal-task-item');
        const tasks = Array.from(taskElements).map(elem => {
            return {
                description: elem.querySelector('input').value.trim(),
                completed: elem.querySelector('input[type="checkbox"]').checked
            };
        }).filter(task => task.description);
        
        // Create goal object
        const goal = {
            id: goalId || Date.now().toString(),
            title,
            description,
            type,
            startDate,
            endDate: endDate || null,
            category,
            tasks,
            progress: calculateGoalProgress(tasks),
            createdAt: goalId ? getExistingGoal(goalId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: goalId ? getExistingGoal(goalId)?.completed || false : false
        };
        
        // Save to localStorage
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        if (goalId) {
            // Update existing goal
            const index = goals.findIndex(g => g.id === goalId);
            if (index !== -1) {
                goals[index] = goal;
            }
        } else {
            // Add new goal
            goals.push(goal);
        }
        
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Update UI
        displayGoals();
        
        // Close modal
        hideGoalModal();
        
        // Show success message
        showToast(`Goal ${goalId ? 'updated' : 'added'} successfully`, 'success');
    } catch (error) {
        console.error('Error saving goal:', error);
        showToast('Failed to save goal', 'error');
    }
}

/**
 * Get existing goal by ID
 * @param {string} goalId - Goal ID
 * @returns {Object} Goal object or null
 */
function getExistingGoal(goalId) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    return goals.find(goal => goal.id === goalId) || null;
}

/**
 * Add a task field to the goal form
 */
function addTaskToGoal() {
    const tasksList = document.getElementById('goal-tasks-list');
    if (!tasksList) return;
    
    const taskItem = document.createElement('div');
    taskItem.className = 'goal-task-item';
    
    taskItem.innerHTML = `
        <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox">
        </div>
        <input type="text" placeholder="Enter task..." class="goal-task-input">
        <button type="button" class="remove-goal-task btn-icon">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    tasksList.appendChild(taskItem);
    
    // Focus on the new input
    taskItem.querySelector('input[type="text"]').focus();
}

/**
 * Display goals in the UI
 */
function displayGoals() {
    const goalsContainer = document.querySelector('.goals-container');
    if (!goalsContainer) return;
    
    // Get goals from localStorage
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    if (goals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye empty-icon"></i>
                <p>No goals yet. Start by adding your first goal!</p>
            </div>
        `;
        return;
    }
    
    // Sort goals: incomplete first, then by date
    goals.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    // Generate HTML for each goal
    goalsContainer.innerHTML = goals.map(goal => {
        const progress = goal.progress || 0;
        const startDate = new Date(goal.startDate).toLocaleDateString();
        const endDate = goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'Ongoing';
        
        return `
            <div class="goal-card ${goal.completed ? 'completed' : ''}" data-id="${goal.id}" data-type="${goal.type}">
                <div class="goal-header">
                    <div class="goal-title-wrapper">
                        <h3 class="goal-title">${goal.title}</h3>
                        <span class="goal-badge ${goal.type}">${capitalizeFirstLetter(goal.type)}</span>
                    </div>
                    <div class="goal-actions">
                        <button class="goal-action-btn" data-action="complete" title="${goal.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                            <i class="fas ${goal.completed ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                        </button>
                        <button class="goal-action-btn" data-action="edit" title="Edit goal">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="goal-action-btn" data-action="delete" title="Delete goal">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                
                ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                
                <div class="goal-meta">
                    <div class="goal-dates">
                        <span class="goal-date-range">
                            <i class="fas fa-calendar-alt"></i> ${startDate} - ${endDate}
                        </span>
                    </div>
                    <div class="goal-category">
                        <span class="category-badge ${goal.category}">
                            ${capitalizeFirstLetter(goal.category)}
                        </span>
                    </div>
                </div>
                
                <div class="goal-progress-container">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="goal-progress-text">${progress}% Complete</span>
                </div>
                
                ${goal.tasks && goal.tasks.length > 0 ? `
                    <div class="goal-tasks">
                        <h4>Tasks (${goal.tasks.filter(t => t.completed).length}/${goal.tasks.length})</h4>
                        <ul class="goal-tasks-checklist">
                            ${goal.tasks.map(task => `
                                <li class="goal-task ${task.completed ? 'completed' : ''}">
                                    <input type="checkbox" class="task-check" data-goal-id="${goal.id}" data-task-index="${goal.tasks.indexOf(task)}" ${task.completed ? 'checked' : ''}>
                                    <span>${task.description}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Add event listeners for task checkboxes
    document.querySelectorAll('.task-check').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const goalId = this.getAttribute('data-goal-id');
            const taskIndex = parseInt(this.getAttribute('data-task-index'));
            updateGoalTaskStatus(goalId, taskIndex, this.checked);
        });
    });
}

/**
 * Filter goals by type
 * @param {string} filterType - Type to filter by
 */
function filterGoals(filterType) {
    const goalCards = document.querySelectorAll('.goal-card');
    
    goalCards.forEach(card => {
        if (filterType === 'all' || card.getAttribute('data-type') === filterType) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Toggle goal completion status
 * @param {string} goalId - ID of the goal to toggle
 */
function toggleGoalCompletion(goalId) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const index = goals.findIndex(goal => goal.id === goalId);
    
    if (index !== -1) {
        // Toggle completion status
        goals[index].completed = !goals[index].completed;
        goals[index].updatedAt = new Date().toISOString();
        
        localStorage.setItem('goals', JSON.stringify(goals));
        displayGoals();
        
        // Show toast
        const status = goals[index].completed ? 'completed' : 'marked as in progress';
        showToast(`Goal ${status}`, 'success');
    }
}

/**
 * Edit an existing goal
 * @param {string} goalId - ID of the goal to edit
 */
function editGoal(goalId) {
    const goal = getExistingGoal(goalId);
    if (!goal) return;
    
    // Fill form with goal data
    document.getElementById('goal-modal-title').textContent = 'Edit Goal';
    document.getElementById('goal-id').value = goal.id;
    document.getElementById('goal-title').value = goal.title;
    document.getElementById('goal-description').value = goal.description || '';
    document.getElementById('goal-type').value = goal.type;
    document.getElementById('goal-start-date').value = goal.startDate;
    if (goal.endDate) {
        document.getElementById('goal-end-date').value = goal.endDate;
    }
    document.getElementById('goal-category').value = goal.category;
    
    // Add tasks
    const tasksList = document.getElementById('goal-tasks-list');
    tasksList.innerHTML = '';
    
    if (goal.tasks && goal.tasks.length > 0) {
        goal.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'goal-task-item';
            
            taskItem.innerHTML = `
                <div class="task-checkbox-wrapper">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                </div>
                <input type="text" value="${task.description}" class="goal-task-input">
                <button type="button" class="remove-goal-task btn-icon">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            tasksList.appendChild(taskItem);
        });
    }
    
    // Show modal
    document.getElementById('goal-modal').style.display = 'block';
}

/**
 * Delete a goal
 * @param {string} goalId - ID of the goal to delete
 */
function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        const updatedGoals = goals.filter(goal => goal.id !== goalId);
        
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
        displayGoals();
        
        showToast('Goal deleted successfully', 'success');
    }
}

/**
 * Update task status in a goal
 * @param {string} goalId - ID of the goal
 * @param {number} taskIndex - Index of the task in the goal
 * @param {boolean} completed - New completion status
 */
function updateGoalTaskStatus(goalId, taskIndex, completed) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex !== -1 && goals[goalIndex].tasks && goals[goalIndex].tasks[taskIndex] !== undefined) {
        // Update task status
        goals[goalIndex].tasks[taskIndex].completed = completed;
        
        // Recalculate progress
        goals[goalIndex].progress = calculateGoalProgress(goals[goalIndex].tasks);
        goals[goalIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Update UI for progress bar
        const goalCard = document.querySelector(`.goal-card[data-id="${goalId}"]`);
        if (goalCard) {
            const progressBar = goalCard.querySelector('.goal-progress-fill');
            const progressText = goalCard.querySelector('.goal-progress-text');
            const progress = goals[goalIndex].progress;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${progress}% Complete`;
            
            // Update task count
            const taskCountElem = goalCard.querySelector('.goal-tasks h4');
            if (taskCountElem) {
                const completedTasks = goals[goalIndex].tasks.filter(t => t.completed).length;
                const totalTasks = goals[goalIndex].tasks.length;
                taskCountElem.textContent = `Tasks (${completedTasks}/${totalTasks})`;
            }
            
            // Update task item state
            const taskItem = goalCard.querySelector(`.goal-task:nth-child(${taskIndex + 1})`);
            if (taskItem) {
                if (completed) {
                    taskItem.classList.add('completed');
                } else {
                    taskItem.classList.remove('completed');
                }
            }
        }
    }
}

/**
 * Calculate goal progress based on completed tasks
 * @param {Array} tasks - Array of tasks
 * @returns {number} Progress percentage
 */
function calculateGoalProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = Math.round((completedTasks / tasks.length) * 100);
    
    return progress;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

// Export for use in app.js
window.initGoals = initGoals; 