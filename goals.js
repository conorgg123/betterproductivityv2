// Goal Setting Module
document.addEventListener('DOMContentLoaded', function() {
    initGoals();
});

/**
 * Initialize goals functionality
 */
function initGoals() {
    console.log('Initializing goals module');
    
    try {
        // Close any open modals first
        closeAllModals();
        
        // Create goals container if it doesn't exist
        const container = createGoalsContainer();
        if (!container) {
            throw new Error('Failed to create goals container');
        }
        
        // Create goals section with UI elements
        createGoalsSection();
        
        // Load goals from storage
        const goals = loadGoals();
        
        // Update stats
        updateGoalStats(goals);
        
        // Set up event listeners for buttons
        setupEventListeners();
        
        // Set up view toggles
        setupViewToggles();
        
        // Set up search functionality
        setupSearchFunctionality();
        
        // Set up drag and drop
        setupDragAndDrop();
        
        // Apply current view preference
        applyCurrentView();
        
        // Display goals in the current view
        if (goals && goals.length > 0) {
            displayGoals(goals);
        } else {
            // Show empty state
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No Goals Yet</h3>
                    <p>Start by adding your first goal!</p>
                    <button id="empty-add-goal-btn" class="btn-primary">
                        <i class="fas fa-plus"></i> Add Goal
                    </button>
                </div>
            `;
            
            // Set up empty state button listener
            const emptyAddGoalBtn = document.getElementById('empty-add-goal-btn');
            if (emptyAddGoalBtn) {
                emptyAddGoalBtn.addEventListener('click', showAddGoalForm);
            }
        }
        
        console.log('Goals module initialized successfully');
    } catch (error) {
        console.error('Failed to initialize goals module:', error);
        showToast('Failed to initialize goals. Please refresh the page.', 'error');
    }
}

/**
 * Create the goals container if it doesn't exist
 */
function createGoalsContainer() {
    // Check if container already exists
    let goalsContainer = document.querySelector('.goals-container');
    if (!goalsContainer) {
        console.log('Creating goals container');
        
        // Get the main content area
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('Main content area not found');
            return;
        }
        
        // Create goals section container
        goalsContainer = document.createElement('div');
        goalsContainer.className = 'goals-container section-content';
        goalsContainer.id = 'goals-section';
        goalsContainer.style.display = 'none'; // Hidden by default
        
        // Add to main content
        mainContent.appendChild(goalsContainer);
    }
    
    return goalsContainer;
}

/**
 * Initialize drag and drop functionality
 */
function setupDragAndDrop() {
    const goalsContainer = document.querySelector('.goals-container');
    if (!goalsContainer) return;
    
    // Add event listeners to container
    goalsContainer.addEventListener('dragover', handleDragOver);
    goalsContainer.addEventListener('drop', handleDrop);
}

/**
 * Initialize event listeners
 */
function setupEventListeners() {
    console.log('Setting up goals event listeners');
    
    // Add Goal button
    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        console.log('Found Add Goal button, adding event listener');
        // Remove any existing listeners to prevent duplicates
        const newBtn = addGoalBtn.cloneNode(true);
        addGoalBtn.parentNode?.replaceChild(newBtn, addGoalBtn);
        
        // Add click event listener
        newBtn.addEventListener('click', function(e) {
            console.log('Add Goal button clicked');
            e.preventDefault();
            window.isUserInitiatedAction = true;
            showAddGoalForm(e);
        });
    } else {
        console.warn('Add Goal button not found in DOM');
        
        // Try to find it with querySelector instead
        const alternateBtns = document.querySelectorAll('.btn-primary');
        alternateBtns.forEach(btn => {
            if (btn.textContent.includes('Add Goal')) {
                console.log('Found alternative Add Goal button');
                btn.addEventListener('click', showAddGoalForm);
            }
        });
    }
    
    // Set up other goal buttons
    setupGoalActionButtons();
}

/**
 * Set up all the goal action buttons
 */
function setupGoalActionButtons() {
    // Empty add goal button (shown when no goals exist)
    const emptyAddGoalBtn = document.getElementById('empty-add-goal-btn');
    if (emptyAddGoalBtn) {
        emptyAddGoalBtn.addEventListener('click', showAddGoalForm);
    }
    
    // Template button
    const useTemplateBtn = document.querySelector('.use-template-btn');
    if (useTemplateBtn) {
        const newBtn = useTemplateBtn.cloneNode(true);
        useTemplateBtn.parentNode?.replaceChild(newBtn, useTemplateBtn);
        newBtn.addEventListener('click', handleTemplateButtonClick);
    }
    
    // Quick Add button
    const quickAddBtn = document.getElementById('quick-add-btn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', showQuickAddGoalModal);
    }
    
    // View toggle buttons
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            if (view) {
                switchView(view);
            }
        });
    });
    
    // Archive button
    const archiveBtn = document.getElementById('archive-btn');
    if (archiveBtn) {
        archiveBtn.addEventListener('click', toggleArchiveView);
    }
    
    // Achievements button
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', showAchievementsModal);
    }
    
    // Tag filter button
    const tagFilterBtn = document.getElementById('tag-filter-btn');
    if (tagFilterBtn) {
        tagFilterBtn.addEventListener('click', showTagFilterModal);
    }
    
    // Search input
    const searchInput = document.getElementById('goals-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            const filteredGoals = searchGoals(query);
            displayGoals(filteredGoals);
        });
    }
}

/**
 * Set up view toggle buttons
 */
function setupViewToggles() {
    const viewToggles = document.querySelectorAll('.view-toggle');
    if (viewToggles.length === 0) return;
    
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Remove active class from all toggles
            viewToggles.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked toggle
            this.classList.add('active');
            
            // Get view type
            const viewType = this.getAttribute('data-view');
            if (viewType) {
                // Save view preference
                localStorage.setItem('goalsViewPreference', viewType);
                
                // Load goals with new view
                const goals = loadGoals();
                displayGoals(goals);
            }
        });
    });
}

/**
 * Set up search functionality
 */
function setupSearchFunctionality() {
    const searchInput = document.getElementById('goals-search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        // Debounce search to avoid too many refreshes
        clearTimeout(searchInput.searchTimeout);
        searchInput.searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            const filteredGoals = searchGoals(query);
            displayGoals(filteredGoals);
        }, 300);
    });
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
                <div class="modal-header-actions">
                    <button type="button" id="use-template-btn" class="btn-small btn-outline">
                        <i class="fas fa-copy"></i> Use Template
                    </button>
                <span class="close-modal">&times;</span>
                </div>
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
                    
                    <div class="form-row">
                    <div class="form-group">
                        <label for="goal-type">Goal Type</label>
                        <select id="goal-type">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="long-term">Long-term</option>
                        </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="goal-priority">Priority</label>
                            <select id="goal-priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
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
                    
                    <div class="form-row">
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
                        
                        <div class="form-group">
                            <label for="goal-parent">Parent Goal (Optional)</label>
                            <select id="goal-parent">
                                <option value="">None</option>
                                <!-- Parent goals will be populated dynamically -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-tags">Tags</label>
                        <div class="tags-input-container">
                            <input type="text" id="goal-tags-input" placeholder="Add tags...">
                            <div id="goal-tags-list" class="tags-list"></div>
                            <input type="hidden" id="goal-tags" value="">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="goal-reminder-toggle">
                            <span>Set Reminder</span>
                        </label>
                        <div id="reminder-options" class="reminder-options" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="reminder-date">Reminder Date</label>
                                    <input type="date" id="reminder-date">
                                </div>
                                <div class="form-group">
                                    <label for="reminder-time">Time</label>
                                    <input type="time" id="reminder-time">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="reminder-frequency">Frequency</label>
                                <select id="reminder-frequency">
                                    <option value="once">Once</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        </div>
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
                        <div class="form-actions-left">
                            <button type="button" id="save-as-template-btn" class="btn-text">
                                <i class="fas fa-save"></i> Save as Template
                            </button>
                        </div>
                        <div class="form-actions-right">
                        <button type="button" class="btn-secondary" id="cancel-goal">Cancel</button>
                        <button type="submit" class="btn-primary">Save Goal</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Creates a modal with the given content
 * @param {string} title - Modal title
 * @param {string|HTMLElement} content - Modal content (HTML string or element)
 * @param {Function} onClose - Callback when modal is closed
 * @param {string} className - Additional class name for the modal
 * @returns {HTMLElement} - The modal element
 */
function createModal(title, content, onClose = null, className = '') {
    // Remove any existing modals first to prevent multiple modals
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    document.querySelectorAll('.modal').forEach(el => el.remove());
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = `modal ${className}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', `modal-title-${Date.now()}`);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const titleEl = document.createElement('h3');
    titleEl.id = `modal-title-${Date.now()}`;
    titleEl.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });
    
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    
    // Create body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }
    
    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(body);
    document.body.appendChild(modal);
    
    // Focus trap setup
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    if (firstFocusableElement) {
        setTimeout(() => firstFocusableElement.focus(), 100);
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    // Close on escape key
    function escListener(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
    
    document.addEventListener('keydown', escListener);
    
    // Handle tab navigation
    modal.addEventListener('keydown', function trapFocus(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
    
    // Close modal function
    function closeModal() {
        document.removeEventListener('keydown', escListener);
        modal.remove();
        overlay.remove();
        if (onClose) onClose();
    }
    
    // Add a public method to the modal for closing
    modal.close = closeModal;
    
    return modal;
}

/**
 * Close any open modals
 * This function can be called to ensure all modals are closed
 */
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    document.querySelectorAll('.modal').forEach(el => el.remove());
}

/**
 * Global event handler to close any dropdown menus when clicking outside
 */
document.addEventListener('click', function(e) {
    // Close any open more-actions-menu
    const openMenus = document.querySelectorAll('.more-actions-menu.active');
    if (openMenus.length > 0) {
        const isClickInsideMenu = Array.from(openMenus).some(menu => 
            menu.contains(e.target) || 
            e.target.closest('.more-actions-btn') === menu.previousElementSibling
        );
        
        if (!isClickInsideMenu) {
            openMenus.forEach(menu => menu.classList.remove('active'));
        }
    }
});

/**
 * Create template selection modal
 */
function createTemplateModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'template-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content template-modal-content">
            <div class="modal-header">
                <h3>Choose a Template</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="templates-grid" id="templates-grid">
                    <!-- Templates will be populated dynamically -->
                </div>
                <div class="empty-templates" id="empty-templates" style="display: none;">
                    <i class="fas fa-file-alt empty-icon"></i>
                    <p>No templates available yet. Save a goal as template to see it here.</p>
                </div>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Create or update the goals section with all necessary UI elements
 */
function createGoalsSection() {
    console.log('Creating goals section');
    
    // Get the goals container
    const goalsContainer = document.querySelector('.goals-container');
    if (!goalsContainer) {
        console.error('Goals container not found');
        return;
    }
    
    // Check if content already exists
    if (goalsContainer.querySelector('.goals-header')) {
        console.log('Goals section already exists');
        return;
    }
    
    // Create the goals section HTML
    const goalsHTML = `
        <div class="goals-header">
            <h2>Goals</h2>
            <div class="goals-actions">
                <div class="search-container">
                    <input type="text" id="goals-search" placeholder="Search goals...">
                    <i class="fas fa-search"></i>
                </div>
                <div class="view-toggle">
                    <button class="view-toggle-btn active" data-view="list">
                        <i class="fas fa-list"></i>
                    </button>
                    <button class="view-toggle-btn" data-view="timeline">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                    <button class="view-toggle-btn" data-view="analytics">
                        <i class="fas fa-chart-pie"></i>
                    </button>
                </div>
                <button id="archive-btn" class="btn-outline">
                    <i class="fas fa-archive"></i> Archive
                </button>
                <button id="tag-filter-btn" class="btn-outline">
                    <i class="fas fa-tags"></i> Filter
                </button>
                <button id="achievements-btn" class="btn-outline">
                    <i class="fas fa-medal"></i> Achievements
                </button>
                <button id="quick-add-btn" class="btn-outline">
                    <i class="fas fa-bolt"></i> Quick Add
                </button>
                <button id="add-goal-btn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
            </div>
        </div>
        
        <div class="goals-content-wrapper">
            <div class="goals-view list-view active">
                <div class="goals-list"></div>
            </div>
            
            <div class="goals-view timeline-view">
                <div class="timeline-header">
                    <div class="timeline-scale">
                        <button class="timeline-scale-btn" data-scale="day">Day</button>
                        <button class="timeline-scale-btn active" data-scale="week">Week</button>
                        <button class="timeline-scale-btn" data-scale="month">Month</button>
                    </div>
                    <div class="timeline-navigation">
                        <button class="timeline-nav-btn" data-direction="prev">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="timeline-period-text">This Week</span>
                        <button class="timeline-nav-btn" data-direction="next">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="timeline-container"></div>
        </div>
        
            <div class="goals-view analytics-view">
                <div class="analytics-header">
                    <h3>Goal Analytics</h3>
                </div>
                <div class="analytics-container">
                    <div class="analytics-card completion-rate">
                        <h4>Completion Rate</h4>
                        <div class="chart-container">
                            <canvas id="completion-rate-chart"></canvas>
                        </div>
                    </div>
                    <div class="analytics-card category-distribution">
                        <h4>Category Distribution</h4>
                        <div class="chart-container">
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                    </div>
                    <div class="analytics-card completion-trend">
                        <h4>Completion Trend</h4>
                        <div class="chart-container">
                            <canvas id="completion-trend-chart"></canvas>
                        </div>
                    </div>
                    <div class="analytics-card goal-statistics">
                        <h4>Goal Statistics</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-value" id="total-goals">0</span>
                                <span class="stat-label">Total Goals</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="completed-goals">0</span>
                                <span class="stat-label">Completed</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="active-goals">0</span>
                                <span class="stat-label">Active</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="archived-goals">0</span>
                                <span class="stat-label">Archived</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set the HTML content
    goalsContainer.innerHTML = goalsHTML;
    
    console.log('Goals section created successfully');
}

/**
 * Apply the current view based on saved preference or default to list view
 */
function applyCurrentView() {
    // Get saved view preference
    const currentView = localStorage.getItem('goalsView') || 'list';
    
    // Switch to that view
    switchView(currentView);
    
    console.log(`Applied saved view: ${currentView}`);
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
            
            const goalId = goalCard.getAttribute('data-goal-id');
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
 * Display goals based on current view
 */
function displayGoals(goals = []) {
    console.log('Displaying goals:', goals.length);
    
    const container = document.querySelector('.goals-container');
    if (!container) {
        console.error('Goals container not found');
        return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // Get the currently active view
    const activeViewToggle = document.querySelector('.view-toggle.active');
    const currentView = activeViewToggle ? activeViewToggle.getAttribute('data-view') : 'grid';
    
    // Sort goals (complete at the bottom, then by due date)
    const sortedGoals = [...goals].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // If both have due dates, sort by that
        if (a.endDate && b.endDate) {
            return new Date(a.endDate) - new Date(b.endDate);
        }
        
        return 0;
    });
    
    // Show appropriate view
    switch (currentView) {
        case 'timeline':
            renderTimelineView(sortedGoals);
            break;
        case 'list':
            renderListView(sortedGoals);
            break;
        default:
            // Grid view (default)
            renderGridView(sortedGoals);
    }
    
    // Update stats and achievements
    updateGoalStats(goals);
    updateStreaksAndAchievements(goals);
}

/**
 * Render goals in grid view
 */
function renderGridView(goals) {
    const container = document.querySelector('.goals-container');
    if (!container) return;
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No Goals Found</h3>
                <p>Start by adding your first goal!</p>
                <button id="empty-add-goal-btn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
            </div>
        `;
        
        const emptyAddGoalBtn = document.getElementById('empty-add-goal-btn');
        if (emptyAddGoalBtn) {
            emptyAddGoalBtn.addEventListener('click', showAddGoalForm);
        }
    } else {
        const goalsGrid = document.createElement('div');
        goalsGrid.className = 'goals-grid';
        
        goals.forEach(goal => {
            const goalCard = createGoalCard(goal);
            goalsGrid.appendChild(goalCard);
        });
        
        container.appendChild(goalsGrid);
        
        // Initialize drag and drop
        initDragAndDrop();
    }
}

/**
 * Render goals in list view
 */
function renderListView(goals) {
    const container = document.querySelector('.goals-container');
    if (!container) return;
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No Goals Found</h3>
                <p>Start by adding your first goal!</p>
                <button id="empty-add-goal-btn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
            </div>
        `;
        
        const emptyAddGoalBtn = document.getElementById('empty-add-goal-btn');
        if (emptyAddGoalBtn) {
            emptyAddGoalBtn.addEventListener('click', showAddGoalForm);
        }
    } else {
        const goalsList = document.createElement('div');
        goalsList.className = 'goals-list-view';
        
        goals.forEach(goal => {
            const goalItem = createGoalListItem(goal);
            goalsList.appendChild(goalItem);
        });
        
        container.appendChild(goalsList);
    }
}

/**
 * Create a goal list item for list view
 */
function createGoalListItem(goal) {
    const listItem = document.createElement('div');
    listItem.className = `goal-list-item ${goal.completed ? 'completed' : ''}`;
    listItem.setAttribute('data-id', goal.id);
    
    // Calculate progress percentage
    let progress = 0;
    if (goal.tasks && goal.tasks.length > 0) {
        const completedTasks = goal.tasks.filter(task => task.completed).length;
        progress = Math.round((completedTasks / goal.tasks.length) * 100);
    } else if (goal.completed) {
        progress = 100;
    }
    
    // Format dates
    const startDate = goal.startDate ? new Date(goal.startDate).toLocaleDateString() : 'Not set';
    const endDate = goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'Not set';
    
    listItem.innerHTML = `
        <div class="goal-list-checkbox">
            <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''}>
        </div>
        <div class="goal-list-content">
            <h3 class="goal-title">${goal.title}</h3>
            <div class="goal-meta">
                <span class="goal-dates">
                    <i class="fas fa-calendar"></i> ${startDate} - ${endDate}
                </span>
                <span class="goal-badge ${goal.type}">${goal.type}</span>
            </div>
            <div class="goal-progress-container">
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="goal-progress-text">${progress}% Complete</span>
            </div>
        </div>
        <div class="goal-list-actions">
            <button class="goal-action-btn" data-action="edit" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="goal-action-btn" data-action="delete" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const editBtn = listItem.querySelector('[data-action="edit"]');
    if (editBtn) {
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            editGoal(goal.id);
        });
    }
    
    const deleteBtn = listItem.querySelector('[data-action="delete"]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this goal?')) {
                deleteGoal(goal.id);
            }
        });
    }
    
    const checkbox = listItem.querySelector('.goal-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation();
            toggleGoalCompletion(goal.id);
        });
    }
    
    return listItem;
}

/**
 * Creates a goal card element
 * @param {Object} goal - The goal object
 * @returns {HTMLElement} - The goal card element
 */
function createGoalCard(goal) {
    const card = document.createElement('div');
    card.className = `goal-card ${goal.completed ? 'completed' : ''} priority-${goal.priority}`;
    card.setAttribute('data-goal-id', goal.id);
    card.draggable = true;
    
    // Calculate progress
    const progress = goal.tasks && goal.tasks.length > 0
        ? Math.round((goal.tasks.filter(task => task.completed).length / goal.tasks.length) * 100)
        : 0;
    
    // Format dates
        const startDate = new Date(goal.startDate).toLocaleDateString();
    const endDate = goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'No end date';
    
    // Check if goal has reminders
    const hasReminders = goal.reminders && goal.reminders.length > 0;
    
    // Check if goal has sub-goals
    const hasSubGoals = goal.tasks && goal.tasks.length > 0;
    
    card.innerHTML = `
                <div class="goal-header">
            <div class="goal-status">
                <input type="checkbox" class="goal-checkbox" 
                    ${goal.completed ? 'checked' : ''} 
                    title="${goal.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                <span class="completion-status">
                    ${goal.completed ? 'Completed' : progress + '% Complete'}
                </span>
                    </div>
                    <div class="goal-actions">
                <button class="btn-icon share-goal" title="Share Goal">
                    <i class="fas fa-share-alt"></i>
                        </button>
                <button class="btn-icon more-actions" title="More Actions">
                    <i class="fas fa-ellipsis-v"></i>
                        </button>
                <div class="more-actions-menu">
                    <button class="edit-goal">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="duplicate-goal">
                        <i class="fas fa-copy"></i> Duplicate
                    </button>
                    <button class="archive-goal">
                        <i class="fas fa-archive"></i> Archive
                    </button>
                    <button class="delete-goal">
                        <i class="fas fa-trash-alt"></i> Delete
                        </button>
                </div>
                    </div>
                </div>
                
        <div class="goal-content">
            <h3 class="goal-title">${goal.title}</h3>
            <p class="goal-description">${goal.description || 'No description'}</p>
                
                <div class="goal-meta">
                <span class="goal-dates">
                    <i class="fas fa-calendar"></i>
                    ${startDate} - ${endDate}
                        </span>
                <span class="goal-priority priority-${goal.priority}">
                    <i class="fas fa-flag"></i>
                    ${goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                </span>
                <span class="goal-category">
                    <i class="fas ${getCategoryIcon(goal.category)}"></i>
                    ${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                        </span>
                    </div>
            
            ${goal.tags && goal.tags.length > 0 ? `
                <div class="goal-tags">
                    ${goal.tags.map(tag => `
                        <span class="tag" onclick="filterByTag('${tag}')">${tag}</span>
                    `).join('')}
                </div>
            ` : ''}
            
            ${hasReminders ? `
                <div class="goal-reminders">
                    <i class="fas fa-bell"></i>
                    ${goal.reminders.map(reminder => `
                        <span class="reminder-badge">${reminder}</span>
                    `).join('')}
                    </div>
            ` : ''}
                
            ${hasSubGoals ? `
                    <div class="goal-tasks">
                    <h4>Tasks (${goal.tasks.filter(task => task.completed).length}/${goal.tasks.length})</h4>
                    <div class="tasks-list">
                        ${goal.tasks.map((task, index) => `
                            <div class="task-item ${task.completed ? 'completed' : ''}">
                                <input type="checkbox" 
                                    class="task-checkbox" 
                                    data-task-index="${index}"
                                    ${task.completed ? 'checked' : ''}>
                                <span class="task-title">${task.title}</span>
                            </div>
                            `).join('')}
                    </div>
                    </div>
                ` : ''}
            
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}%</span>
            </div>
        </div>
        
        <div class="drag-handle" title="Drag to reorder">
            <i class="fas fa-grip-vertical"></i>
            </div>
        `;
    
    // Add event listeners
    addGoalCardListeners(card, goal);
    setupDragListeners(card);
    
    return card;
}

/**
 * Add event listeners to goal card
 * @param {HTMLElement} goalCard - The goal card element 
 * @param {Object} goal - The goal object
 */
function addGoalCardListeners(goalCard, goal) {
    // Checkbox for completing goal
    const checkbox = goalCard.querySelector('.goal-checkbox');
    checkbox.addEventListener('change', () => {
        try {
            toggleGoalCompletion(goal.id);
            showToast(`Goal marked as ${checkbox.checked ? 'complete' : 'incomplete'}`, 'success');
        } catch (error) {
            console.error('Failed to toggle goal completion:', error);
            showToast('Failed to update goal status', 'error');
            checkbox.checked = !checkbox.checked; // Revert the checkbox
        }
    });
    
    // Task checkboxes
    goalCard.querySelectorAll('.task-checkbox').forEach(taskCheckbox => {
        taskCheckbox.addEventListener('change', () => {
            const taskIndex = parseInt(taskCheckbox.dataset.taskIndex);
            try {
                updateGoalTaskStatus(goal.id, taskIndex, taskCheckbox.checked);
                showToast('Task status updated', 'success');
            } catch (error) {
                console.error('Failed to update task status:', error);
                showToast('Failed to update task status', 'error');
                taskCheckbox.checked = !taskCheckbox.checked; // Revert the checkbox
            }
        });
    });
    
    // Share button
    const shareBtn = goalCard.querySelector('.share-goal');
    shareBtn.addEventListener('click', () => {
        showShareModal(goal);
    });
    
    // More actions menu
    const moreActionsBtn = goalCard.querySelector('.more-actions');
    const moreActionsMenu = goalCard.querySelector('.more-actions-menu');
    
    moreActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMoreActionsMenu(moreActionsBtn);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!moreActionsMenu.contains(e.target) && !moreActionsBtn.contains(e.target)) {
            moreActionsMenu.classList.remove('active');
        }
    });
    
    // Edit button
    const editBtn = goalCard.querySelector('.edit-goal');
    editBtn.addEventListener('click', () => {
        editGoal(goal.id);
    });
    
    // Duplicate button
    const duplicateBtn = goalCard.querySelector('.duplicate-goal');
    duplicateBtn.addEventListener('click', () => {
        try {
            const newGoal = { ...goal };
            newGoal.id = generateId();
            newGoal.title = `${goal.title} (Copy)`;
            newGoal.completed = false;
            newGoal.progress = 0;
            newGoal.createdAt = new Date().toISOString();
            
            if (newGoal.tasks) {
                newGoal.tasks = newGoal.tasks.map(task => ({
                    ...task,
                    completed: false
                }));
            }
            
            saveGoal(newGoal);
            showToast('Goal duplicated successfully', 'success');
            
            // Refresh goals display
            const goals = loadGoals();
            displayGoals(goals);
        } catch (error) {
            console.error('Failed to duplicate goal:', error);
            showToast('Failed to duplicate goal', 'error');
        }
    });
    
    // Archive button
    const archiveBtn = goalCard.querySelector('.archive-goal');
    archiveBtn.addEventListener('click', () => {
        try {
            archiveGoal(goal.id);
            showToast('Goal archived successfully', 'success');
        } catch (error) {
            console.error('Failed to archive goal:', error);
            showToast('Failed to archive goal', 'error');
        }
    });
    
    // Delete button
    const deleteBtn = goalCard.querySelector('.delete-goal');
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
            try {
                deleteGoal(goal.id);
                showToast('Goal deleted successfully', 'success');
            } catch (error) {
                console.error('Failed to delete goal:', error);
                showToast('Failed to delete goal', 'error');
            }
        }
    });
    
    // Tag filtering
    goalCard.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            const tagText = tag.textContent.trim();
            filterByTag(tagText);
        });
    });
}

/**
 * Set up drag and drop listeners for goal card
 * @param {HTMLElement} goalCard - The goal card element
 */
function setupDragListeners(goalCard) {
    const dragHandle = goalCard.querySelector('.drag-handle');
    
    dragHandle.addEventListener('mousedown', () => {
        goalCard.draggable = true;
    });
    
    dragHandle.addEventListener('mouseup', () => {
        goalCard.draggable = false;
    });
    
    goalCard.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', goalCard.dataset.goalId);
        goalCard.classList.add('dragging');
        
        // Create drag image
        const dragImage = goalCard.cloneNode(true);
        dragImage.style.width = goalCard.offsetWidth + 'px';
        dragImage.classList.add('drag-ghost');
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        setTimeout(() => {
            dragImage.remove();
        }, 0);
    });
    
    goalCard.addEventListener('dragend', () => {
        goalCard.classList.remove('dragging');
        goalCard.draggable = false;
    });
}

/**
 * Filter goals by date range for timeline view
 * @param {Array} goals - The list of goals
 * @returns {Array} - Filtered goals
 */
function filterGoalsByTimelineView(goals) {
    // Get current timeline view (day, week, month)
    const timelineScale = document.querySelector('.timeline-scale-btn.active')?.getAttribute('data-scale') || 'week';
    
    // Get current date
    const now = new Date();
    let startRange, endRange;
    
    // Calculate range based on view
    if (timelineScale === 'day') {
        // Today only
        startRange = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (timelineScale === 'week') {
        // Current week
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        startRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        endRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek) + 1);
    } else if (timelineScale === 'month') {
        // Current month
        startRange = new Date(now.getFullYear(), now.getMonth(), 1);
        endRange = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    // Filter goals that fall within range
    return goals.filter(goal => {
        const startDate = new Date(goal.startDate);
        const endDate = goal.endDate ? new Date(goal.endDate) : null;
        
        // Include if start date is within range
        if (startDate >= startRange && startDate < endRange) {
            return true;
        }
        
        // Include if end date is within range
        if (endDate && endDate >= startRange && endDate < endRange) {
            return true;
        }
        
        // Include if goal spans the range (starts before and ends after)
        if (startDate < startRange && endDate && endDate >= endRange) {
            return true;
        }
        
        return false;
    });
}

/**
 * Update goal statistics display
 */
function updateGoalStats(goalsData) {
    if (!goalsData) return;
    
    const completedCount = document.getElementById('completed-goals-count');
    const inProgressCount = document.getElementById('in-progress-goals-count');
    const dailyCount = document.getElementById('daily-goals-count');
    const weeklyCount = document.getElementById('weekly-goals-count');
    
    if (completedCount && inProgressCount && dailyCount && weeklyCount) {
        const completed = goalsData.filter(goal => goal.completed).length;
        const inProgress = goalsData.filter(goal => !goal.completed).length;
        const daily = goalsData.filter(goal => goal.type === 'daily').length;
        const weekly = goalsData.filter(goal => goal.type === 'weekly').length;
        
        completedCount.textContent = completed;
        inProgressCount.textContent = inProgress;
        dailyCount.textContent = daily;
        weeklyCount.textContent = weekly;
    }
}

/**
 * Search goals by title or description
 */
function searchGoals(query) {
    if (!query) {
        // If query is empty, just display all goals based on current filter
        const activeFilter = document.querySelector('.goal-filter-btn.active');
        const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        filterGoals(filterType);
        return;
    }
    
    query = query.toLowerCase();
    
    const goalCards = document.querySelectorAll('.goal-card');
    let hasVisibleGoals = false;
    
    goalCards.forEach(card => {
        const title = card.querySelector('.goal-title').textContent.toLowerCase();
        const descriptionEl = card.querySelector('.goal-description');
        const description = descriptionEl ? descriptionEl.textContent.toLowerCase() : '';
        
        if (title.includes(query) || description.includes(query)) {
            card.style.display = '';
            hasVisibleGoals = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show or hide empty state
    const goalsContainer = document.querySelector('.goals-container');
    const emptyState = document.getElementById('goals-empty-state');
    
    if (hasVisibleGoals) {
        goalsContainer.style.display = 'grid';
        emptyState.style.display = 'none';
    } else {
        goalsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        
        // Update empty state text for search
        emptyState.querySelector('h3').textContent = 'No Matching Goals';
        emptyState.querySelector('p').textContent = `No goals found matching "${query}". Try a different search term.`;
    }
}

/**
 * Filter goals by type
 */
function filterGoals(filterType) {
    // Update active filter button
    const filterButtons = document.querySelectorAll('.goal-filter-btn');
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === filterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Clear search input
    const searchInput = document.getElementById('goals-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Redisplay goals with the new filter
    displayGoals();
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
        const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
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
    // Close any existing toasts
    document.querySelectorAll('.toast').forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    const toastContainer = document.querySelector('.toast-container') || (() => {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    })();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;
    
    toastContainer.appendChild(toast);
        
    // Show the toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
        }, 3000);
    
    return toast;
}

/**
 * Initialize drag and drop functionality
 */
function initDragAndDrop() {
    const goalsContainer = document.querySelector('.goals-container');
    if (!goalsContainer) return;
    
    // Add event listeners to container
    goalsContainer.addEventListener('dragover', handleDragOver);
    goalsContainer.addEventListener('drop', handleDrop);
}

/**
 * Handle drag start event
 */
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-goal-id'));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class
    e.target.classList.add('dragging');
    
    // Show drag indicator
    const dragIndicator = document.getElementById('drag-indicator');
    if (dragIndicator) {
        dragIndicator.style.display = 'flex';
        
        // Position it at the cursor
        document.addEventListener('mousemove', updateDragIndicatorPosition);
    }
    
    // Hide more actions menu if it's open
    const moreActionsMenu = document.querySelector('.more-actions-menu.active');
    if (moreActionsMenu) {
        moreActionsMenu.classList.remove('active');
    }
}

/**
 * Update drag indicator position
 */
function updateDragIndicatorPosition(e) {
    const dragIndicator = document.getElementById('drag-indicator');
    if (dragIndicator) {
        dragIndicator.style.left = `${e.clientX + 10}px`;
        dragIndicator.style.top = `${e.clientY + 10}px`;
    }
}

/**
 * Handle drag end event
 */
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    
    // Hide drag indicator
    const dragIndicator = document.getElementById('drag-indicator');
    if (dragIndicator) {
        dragIndicator.style.display = 'none';
    }
    
    // Remove mousemove event listener
    document.removeEventListener('mousemove', updateDragIndicatorPosition);
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const target = getDropTarget(e);
    if (!target) return;
    
    // Reset all hover effects
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    
    // Add hover effect to the target
    target.classList.add('drag-over');
}

/**
 * Get the drop target for the given drag event
 */
function getDropTarget(e) {
    const goalCard = e.target.closest('.goal-card');
    if (!goalCard || goalCard.classList.contains('dragging')) {
        return null;
    }
    return goalCard;
}

/**
 * Handle drop event
 */
function handleDrop(e) {
    e.preventDefault();
    
    const goalId = e.dataTransfer.getData('text/plain');
    const dropTarget = getDropTarget(e);
    
    if (!goalId || !dropTarget) return;
    
    // Get the dragged goal card
    const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
    if (!goalCard || goalCard === dropTarget) return;
    
    // Get the position where to insert the dragged goal
    const goalsContainer = document.querySelector('.goals-container');
    const rect = dropTarget.getBoundingClientRect();
    const isAfter = e.clientY > rect.top + rect.height / 2;
    
    // Update goal orders in the DOM
    if (isAfter) {
        dropTarget.after(goalCard);
    } else {
        dropTarget.before(goalCard);
    }
    
    // Remove all drag-over effects
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    
    // Save the new order to storage
    saveGoalOrder();
}

/**
 * Save the current goal order to storage
 */
function saveGoalOrder() {
    const goalCards = document.querySelectorAll('.goals-container .goal-card');
    const goalIds = Array.from(goalCards).map(card => card.getAttribute('data-goal-id'));
    
    // Get all goals from storage
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    if (!goalsData.length) return;
    
    // Create a map for quick access
    const goalsMap = {};
    goalsData.forEach(goal => {
        goalsMap[goal.id] = goal;
    });
    
    // Create a new sorted array
    const sortedGoals = goalIds
        .filter(id => goalsMap[id]) // Make sure the goal exists
        .map(id => goalsMap[id]);
    
    // Add any missing goals (that may be filtered out currently)
    goalsData.forEach(goal => {
        if (!sortedGoals.some(g => g.id === goal.id)) {
            sortedGoals.push(goal);
        }
    });
    
    // Save back to storage
    if (window.electronAPI) {
        window.electronAPI.setStoreValue('goals', sortedGoals);
    } else {
        localStorage.setItem('goals', JSON.stringify(sortedGoals));
    }
    
    // Display success message
    showToast('Goal order updated successfully');
}

/**
 * Switch between different goal views (card, timeline, analytics)
 */
function switchView(viewType) {
    const cardViewToggle = document.getElementById('card-view-toggle');
    const timelineViewToggle = document.getElementById('timeline-view-toggle');
    const analyticsViewToggle = document.getElementById('analytics-view-toggle');
    
    const goalsContainer = document.querySelector('.goals-container');
    const timelineContainer = document.querySelector('.timeline-container');
    const analyticsContainer = document.querySelector('.goals-analytics');
    
    // Reset all toggle buttons
    [cardViewToggle, timelineViewToggle, analyticsViewToggle].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    // Hide all containers
    [goalsContainer, timelineContainer, analyticsContainer].forEach(container => {
        if (container) container.style.display = 'none';
    });
    
    // Set the active view
    switch (viewType) {
        case 'timeline':
            if (timelineViewToggle) timelineViewToggle.classList.add('active');
            if (timelineContainer) {
                timelineContainer.style.display = 'block';
                renderTimelineView();
            }
            break;
        case 'analytics':
            if (analyticsViewToggle) analyticsViewToggle.classList.add('active');
            if (analyticsContainer) {
                analyticsContainer.style.display = 'block';
                renderAnalyticsView();
            }
            break;
        case 'card':
        default:
            if (cardViewToggle) cardViewToggle.classList.add('active');
            if (goalsContainer) goalsContainer.style.display = 'grid';
            break;
    }
    
    // Save view preference
    saveViewPreference(viewType);
}

/**
 * Save view preference to local storage
 */
function saveViewPreference(viewType) {
    if (window.electronAPI) {
        window.electronAPI.setStoreValue('goals-view-preference', viewType);
    } else {
        localStorage.setItem('goals-view-preference', viewType);
    }
}

// Variables for timeline state
let timelineCurrentDate = new Date();
let timelineScale = 'week';

/**
 * Render the timeline view
 */
function renderTimelineView() {
    const timelineGrid = document.getElementById('timeline-grid');
    const timelinePeriod = document.getElementById('timeline-period');
    
    if (!timelineGrid || !timelinePeriod) return;
    
    // Get all goals
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    if (!goalsData.length) {
        timelineGrid.innerHTML = `
            <div class="timeline-empty">
                <div class="empty-icon"><i class="fas fa-calendar-alt"></i></div>
                <h3>No Goals on Timeline</h3>
                <p>Add goals with start and end dates to see them on the timeline.</p>
            </div>
        `;
        return;
    }
    
    // Update period text
    updateTimelinePeriodText();
    
    // Generate timeline based on scale
    switch (timelineScale) {
        case 'day':
            renderDayTimeline(goalsData);
            break;
        case 'month':
            renderMonthTimeline(goalsData);
            break;
        case 'week':
        default:
            renderWeekTimeline(goalsData);
            break;
    }
}

/**
 * Update the timeline period text
 */
function updateTimelinePeriodText() {
    const timelinePeriod = document.getElementById('timeline-period');
    if (!timelinePeriod) return;
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    switch (timelineScale) {
        case 'day':
            timelinePeriod.textContent = timelineCurrentDate.toLocaleDateString(undefined, options);
            break;
        case 'week': {
            const weekStart = new Date(timelineCurrentDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            timelinePeriod.textContent = `${weekStart.toLocaleDateString(undefined, 
                { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, 
                { month: 'short', day: 'numeric', year: 'numeric' })}`;
            break;
        }
        case 'month': {
            timelinePeriod.textContent = timelineCurrentDate.toLocaleDateString(undefined, 
                { month: 'long', year: 'numeric' });
            break;
        }
    }
}

/**
 * Render day timeline
 */
function renderDayTimeline(goalsData) {
    const timelineGrid = document.getElementById('timeline-grid');
    if (!timelineGrid) return;
    
    // Clear grid
    timelineGrid.innerHTML = '';
    
    // Create timeline header for hours
    const timelineHeader = document.createElement('div');
    timelineHeader.className = 'timeline-day-header';
    
    // Create hour markers
    for (let hour = 0; hour < 24; hour++) {
        const hourMarker = document.createElement('div');
        hourMarker.className = 'timeline-hour';
        hourMarker.textContent = `${hour}:00`;
        timelineHeader.appendChild(hourMarker);
    }
    
    timelineGrid.appendChild(timelineHeader);
    
    // Filter goals for the current day
    const currentDay = timelineCurrentDate.toISOString().split('T')[0];
    const dayGoals = goalsData.filter(goal => {
        const startDate = new Date(goal.startDate);
        const endDate = goal.endDate ? new Date(goal.endDate) : null;
        
        // Check if goal is active on this day
        return startDate.toISOString().split('T')[0] === currentDay || 
               (endDate && endDate.toISOString().split('T')[0] === currentDay) ||
               (startDate <= timelineCurrentDate && (!endDate || endDate >= timelineCurrentDate));
    });
    
    // Create timeline container
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-day-container';
    
    // Add empty state if no goals
    if (dayGoals.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'timeline-day-empty';
        emptyState.innerHTML = `
            <p>No goals scheduled for ${timelineCurrentDate.toLocaleDateString()}</p>
        `;
        timelineContainer.appendChild(emptyState);
    } else {
        // Create goal items on timeline
        dayGoals.forEach(goal => {
            const goalItem = document.createElement('div');
            goalItem.className = `timeline-goal ${goal.completed ? 'completed' : ''} priority-${goal.priority || 'medium'}`;
            goalItem.setAttribute('data-goal-id', goal.id);
            
            // Determine the position based on time
            const startHour = new Date(goal.startDate).getHours();
            goalItem.style.gridColumnStart = startHour + 1;
            
            // If the goal has an end date and it's the same day, calculate span
            if (goal.endDate && new Date(goal.endDate).toDateString() === timelineCurrentDate.toDateString()) {
                const endHour = new Date(goal.endDate).getHours();
                const span = endHour - startHour + 1;
                goalItem.style.gridColumnEnd = `span ${span}`;
            } else {
                // Otherwise span till end of day
                goalItem.style.gridColumnEnd = `span ${24 - startHour}`;
            }
            
            goalItem.innerHTML = `
                <div class="timeline-goal-content">
                    <div class="timeline-goal-title">${goal.title}</div>
                    <div class="timeline-goal-info">
                        <span class="goal-badge ${goal.type}">${capitalizeFirstLetter(goal.type)}</span>
                        <span class="category-badge ${goal.category}">
                            <i class="${getCategoryIcon(goal.category)}"></i>
                        </span>
                    </div>
                </div>
            `;
            
            goalItem.addEventListener('click', () => showGoalDetails(goal.id));
            timelineContainer.appendChild(goalItem);
        });
    }
    
    timelineGrid.appendChild(timelineContainer);
}

/**
 * Render week timeline
 */
function renderWeekTimeline(goalsData) {
    const timelineGrid = document.getElementById('timeline-grid');
    if (!timelineGrid) return;
    
    // Clear grid
    timelineGrid.innerHTML = '';
    
    // Get the start of the week (Sunday)
    const weekStart = new Date(timelineCurrentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    // Create an array of days for the week
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        days.push(day);
    }
    
    // Create timeline header with days
    const timelineHeader = document.createElement('div');
    timelineHeader.className = 'timeline-week-header';
    
    // Create day headers
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'timeline-day-header';
        const isToday = day.toDateString() === new Date().toDateString();
        
        dayHeader.innerHTML = `
            <div class="day-name ${isToday ? 'today' : ''}">${day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
            <div class="day-number ${isToday ? 'today' : ''}">${day.getDate()}</div>
        `;
        
        timelineHeader.appendChild(dayHeader);
    });
    
    timelineGrid.appendChild(timelineHeader);
    
    // Filter and group goals by day
    const goalsByDay = days.map(day => {
        const dayStr = day.toISOString().split('T')[0];
        return goalsData.filter(goal => {
            const startDate = new Date(goal.startDate);
            const endDate = goal.endDate ? new Date(goal.endDate) : null;
            
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate ? endDate.toISOString().split('T')[0] : null;
            
            // Check if goal is active on this day
            return startStr === dayStr || endStr === dayStr || 
                   (startDate <= day && (!endDate || endDate >= day));
        });
    });
    
    // Create timeline rows
    const timelineContent = document.createElement('div');
    timelineContent.className = 'timeline-week-content';
    
    // Add goals for each day
    days.forEach((day, index) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'timeline-day-column';
        const isToday = day.toDateString() === new Date().toDateString();
        if (isToday) dayColumn.classList.add('today');
        
        const dayGoals = goalsByDay[index];
        
        if (dayGoals.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'timeline-day-empty';
            emptyState.textContent = 'No goals';
            dayColumn.appendChild(emptyState);
        } else {
            // Sort goals by priority and completeness
            dayGoals.sort((a, b) => {
                // Sort completed goals last
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                
                // Sort by priority (high, medium, low)
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
            });
            
            // Create goal items
            dayGoals.forEach(goal => {
                const goalItem = document.createElement('div');
                goalItem.className = `timeline-goal ${goal.completed ? 'completed' : ''} priority-${goal.priority || 'medium'}`;
                goalItem.setAttribute('data-goal-id', goal.id);
                
                // Add visuals based on goal type
                const typeClass = goal.type === 'daily' ? 'daily' : 
                                 goal.type === 'weekly' ? 'weekly' : 
                                 goal.type === 'monthly' ? 'monthly' : 'long-term';
                
                goalItem.classList.add(typeClass);
                
                goalItem.innerHTML = `
                    <div class="timeline-goal-progress">
                        <div class="timeline-goal-progress-bar" style="width: ${calculateGoalProgress(goal.tasks).percent}%"></div>
                    </div>
                    <div class="timeline-goal-content">
                        <div class="timeline-goal-title">${goal.title}</div>
                        <div class="timeline-goal-info">
                            <span class="goal-badge ${goal.type}">${goal.type.charAt(0).toUpperCase()}</span>
                            <span class="priority-badge ${goal.priority || 'medium'}"></span>
                        </div>
                    </div>
                `;
                
                goalItem.addEventListener('click', () => showGoalDetails(goal.id));
                dayColumn.appendChild(goalItem);
            });
        }
        
        timelineContent.appendChild(dayColumn);
    });
    
    timelineGrid.appendChild(timelineContent);
}

/**
 * Render month timeline
 */
function renderMonthTimeline(goalsData) {
    const timelineGrid = document.getElementById('timeline-grid');
    if (!timelineGrid) return;
    
    // Clear grid
    timelineGrid.innerHTML = '';
    
    // Get the first day of the month
    const firstDay = new Date(timelineCurrentDate.getFullYear(), timelineCurrentDate.getMonth(), 1);
    
    // Get the last day of the month
    const lastDay = new Date(timelineCurrentDate.getFullYear(), timelineCurrentDate.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Create the calendar grid header (weekday names)
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = document.createElement('div');
    headerRow.className = 'timeline-month-header';
    
    weekdayNames.forEach(name => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'timeline-month-day-name';
        dayHeader.textContent = name;
        headerRow.appendChild(dayHeader);
    });
    
    timelineGrid.appendChild(headerRow);
    
    // Create the calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'timeline-month-grid';
    
    // Add empty cells for days before the start of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'timeline-month-day empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(timelineCurrentDate.getFullYear(), timelineCurrentDate.getMonth(), day);
        const isToday = currentDate.toDateString() === new Date().toDateString();
        
        const dayCell = document.createElement('div');
        dayCell.className = `timeline-month-day ${isToday ? 'today' : ''}`;
        
        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'timeline-month-day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Find goals for this day
        const dayStr = currentDate.toISOString().split('T')[0];
        const dayGoals = goalsData.filter(goal => {
            const startDate = new Date(goal.startDate);
            const endDate = goal.endDate ? new Date(goal.endDate) : null;
            
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate ? endDate.toISOString().split('T')[0] : null;
            
            // Check if goal is active on this day
            return startStr === dayStr || endStr === dayStr || 
                   (startDate <= currentDate && (!endDate || endDate >= currentDate));
        });
        
        // Create goal indicators
        if (dayGoals.length > 0) {
            const goalsContainer = document.createElement('div');
            goalsContainer.className = 'timeline-month-goals';
            
            // Sort by priority
            dayGoals.sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
            });
            
            // Show up to 3 goals, with a "+X more" indicator if needed
            const displayGoals = dayGoals.slice(0, 3);
            
            displayGoals.forEach(goal => {
                const goalDot = document.createElement('div');
                goalDot.className = `goal-dot priority-${goal.priority || 'medium'} ${goal.completed ? 'completed' : ''}`;
                goalDot.setAttribute('data-goal-id', goal.id);
                goalDot.setAttribute('title', goal.title);
                goalDot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showGoalDetails(goal.id);
                });
                goalsContainer.appendChild(goalDot);
            });
            
            if (dayGoals.length > 3) {
                const moreIndicator = document.createElement('div');
                moreIndicator.className = 'more-goals';
                moreIndicator.textContent = `+${dayGoals.length - 3}`;
                moreIndicator.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showDayGoalsList(dayGoals, currentDate);
                });
                goalsContainer.appendChild(moreIndicator);
            }
            
            dayCell.appendChild(goalsContainer);
        }
        
        // Make the day cell clickable to show all goals
        dayCell.addEventListener('click', () => {
            // Set the timeline to this day and switch to day view
            timelineCurrentDate = new Date(currentDate);
            setTimelineScale('day');
        });
        
        calendarGrid.appendChild(dayCell);
    }
    
    timelineGrid.appendChild(calendarGrid);
}

/**
 * Navigate the timeline
 */
function navigateTimeline(direction) {
    switch (timelineScale) {
        case 'day':
            if (direction === 'prev') {
                timelineCurrentDate.setDate(timelineCurrentDate.getDate() - 1);
            } else if (direction === 'next') {
                timelineCurrentDate.setDate(timelineCurrentDate.getDate() + 1);
            } else if (direction === 'today') {
                timelineCurrentDate = new Date();
            }
            break;
        case 'week':
            if (direction === 'prev') {
                timelineCurrentDate.setDate(timelineCurrentDate.getDate() - 7);
            } else if (direction === 'next') {
                timelineCurrentDate.setDate(timelineCurrentDate.getDate() + 7);
            } else if (direction === 'today') {
                timelineCurrentDate = new Date();
            }
            break;
        case 'month':
            if (direction === 'prev') {
                timelineCurrentDate.setMonth(timelineCurrentDate.getMonth() - 1);
            } else if (direction === 'next') {
                timelineCurrentDate.setMonth(timelineCurrentDate.getMonth() + 1);
            } else if (direction === 'today') {
                timelineCurrentDate = new Date();
            }
            break;
    }
    
    renderTimelineView();
}

/**
 * Set the timeline scale (day, week, month)
 */
function setTimelineScale(scale) {
    if (['day', 'week', 'month'].includes(scale)) {
        timelineScale = scale;
        
        // Update active button
        document.querySelectorAll('.timeline-scale-btn').forEach(btn => {
            if (btn.getAttribute('data-scale') === scale) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        renderTimelineView();
    }
}

/**
 * Show a list of goals for a specific day
 */
function showDayGoalsList(goals, date) {
    // Create modal to show goals for the day
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'day-goals-modal';
    
    modal.innerHTML = `
        <div class="modal-content day-goals-modal-content">
            <div class="modal-header">
                <h3>Goals for ${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="day-goals-list">
                    ${goals.map(goal => `
                        <div class="day-goal-item ${goal.completed ? 'completed' : ''}" data-goal-id="${goal.id}">
                            <div class="day-goal-priority priority-${goal.priority || 'medium'}"></div>
                            <div class="day-goal-content">
                                <div class="day-goal-title">${goal.title}</div>
                                <div class="day-goal-info">
                                    <span class="goal-badge ${goal.type}">${capitalizeFirstLetter(goal.type)}</span>
                                    <span class="category-badge ${goal.category}">
                                        <i class="fas fa-${getCategoryIcon(goal.category)}"></i> ${capitalizeFirstLetter(goal.category)}
                                    </span>
                                </div>
                                <div class="day-goal-progress">
                                    <div class="goal-progress-bar">
                                        <div class="goal-progress-fill" style="width: ${calculateGoalProgress(goal.tasks).percent}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add click event for goal items
    modal.querySelectorAll('.day-goal-item').forEach(item => {
        item.addEventListener('click', () => {
            const goalId = item.getAttribute('data-goal-id');
            document.body.removeChild(modal);
            showGoalDetails(goalId);
        });
    });
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Get icon for goal category
 */
function getCategoryIcon(category) {
    const icons = {
        work: 'briefcase',
        personal: 'user',
        health: 'heartbeat',
        education: 'graduation-cap',
        finance: 'dollar-sign',
        other: 'fas fa-star'
    };
    
    return icons[category] || 'fas fa-star';
}

/**
 * Render the analytics view
 */
function renderAnalyticsView() {
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    if (!goalsData.length) {
        const analyticsContainer = document.querySelector('.goals-analytics');
        if (analyticsContainer) {
            analyticsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-chart-bar"></i></div>
                    <h3>No Analytics Available</h3>
                    <p>Add some goals to see analytics and track your progress.</p>
                </div>
            `;
        }
        return;
    }
    
    // Render all charts and stats
    renderCompletionRateChart(goalsData);
    renderCategoryDistributionChart(goalsData);
    renderCompletionTrendChart(goalsData);
    updateStreaksAndAchievements(goalsData);
}

/**
 * Render completion rate donut chart
 */
function renderCompletionRateChart(goalsData) {
    const canvas = document.getElementById('completion-rate-chart');
    if (!canvas) return;
    
    // Calculate completion rate
    const total = goalsData.length;
    const completed = goalsData.filter(goal => goal.completed).length;
    const inProgress = total - completed;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Create chart
    if (window.completionRateChart) {
        window.completionRateChart.destroy();
    }
    
    window.completionRateChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress'],
            datasets: [{
                data: [completed, inProgress],
                backgroundColor: [
                    'rgba(var(--success-rgb), 0.8)',
                    'rgba(var(--primary-rgb), 0.8)'
                ],
                borderColor: [
                    'rgba(var(--success-rgb), 1)',
                    'rgba(var(--primary-rgb), 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Add the completion rate in the center
    const chartContainer = canvas.closest('.completion-rate-chart');
    if (chartContainer) {
        // Remove previous rate display if exists
        const existingRate = chartContainer.querySelector('.completion-rate');
        if (existingRate) {
            existingRate.remove();
        }
        
        // Add new rate display
        const rateDisplay = document.createElement('div');
        rateDisplay.className = 'completion-rate';
        rateDisplay.innerHTML = `
            <span class="rate-number">${completionRate}%</span>
            <span class="rate-label">Completed</span>
        `;
        
        chartContainer.style.position = 'relative';
        chartContainer.appendChild(rateDisplay);
    }
}

/**
 * Render category distribution chart
 */
function renderCategoryDistributionChart(goalsData) {
    const canvas = document.getElementById('category-distribution-chart');
    if (!canvas) return;
    
    // Count goals by category
    const categories = {};
    goalsData.forEach(goal => {
        const category = goal.category || 'other';
        categories[category] = (categories[category] || 0) + 1;
    });
    
    // Define colors and labels
    const categoryColors = {
        work: 'rgba(var(--primary-rgb), 0.8)',
        personal: 'rgba(var(--info-rgb), 0.8)',
        health: 'rgba(var(--success-rgb), 0.8)',
        education: 'rgba(var(--accent-rgb), 0.8)',
        finance: 'rgba(var(--warning-rgb), 0.8)',
        other: 'rgba(var(--secondary-rgb), 0.8)'
    };
    
    const labels = Object.keys(categories).map(category => capitalizeFirstLetter(category));
    const data = Object.values(categories);
    const backgroundColor = Object.keys(categories).map(category => categoryColors[category] || 'rgba(var(--muted-rgb), 0.8)');
    
    // Create chart
    if (window.categoryDistributionChart) {
        window.categoryDistributionChart.destroy();
    }
    
    window.categoryDistributionChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Render completion trend chart
 */
function renderCompletionTrendChart(goalsData) {
    const canvas = document.getElementById('completion-trend-chart');
    if (!canvas) return;
    
    // Get completed goals with dates
    const completedGoals = goalsData.filter(goal => goal.completed);
    
    // Group by month
    const months = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
        months[monthKey] = 0;
    }
    
    // Count completed goals by month
    completedGoals.forEach(goal => {
        if (goal.completedAt) {
            const completedDate = new Date(goal.completedAt);
            const monthKey = `${completedDate.getFullYear()}-${completedDate.getMonth() + 1}`;
            
            if (months[monthKey] !== undefined) {
                months[monthKey]++;
            }
        }
    });
    
    // Prepare data for chart
    const labels = [];
    const data = [];
    
    Object.keys(months).sort().forEach(key => {
        const [year, month] = key.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        labels.push(date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
        data.push(months[key]);
    });
    
    // Create chart
    if (window.completionTrendChart) {
        window.completionTrendChart.destroy();
    }
    
    window.completionTrendChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completed Goals',
                data: data,
                fill: true,
                backgroundColor: 'rgba(var(--primary-rgb), 0.2)',
                borderColor: 'rgba(var(--primary-rgb), 1)',
                tension: 0.3,
                pointBackgroundColor: 'rgba(var(--primary-rgb), 1)',
                pointBorderColor: '#fff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Update streaks and achievements display
 */
function updateStreaksAndAchievements(goalsData) {
    const streaksContainer = document.getElementById('streaks-container');
    if (!streaksContainer) return;
    
    // Calculate current streak (days with completed goals in a row)
    let currentStreak = 0;
    let bestStreak = 0;
    let achievements = 0;
    
    // Get all achievements
    const allAchievements = goalsData.reduce((acc, goal) => {
        if (goal.achievements && goal.achievements.length > 0) {
            acc = acc.concat(goal.achievements);
        }
        return acc;
    }, []);
    
    achievements = allAchievements.length;
    
    // Calculate streaks
    const completedDays = {};
    goalsData.forEach(goal => {
        if (goal.completed && goal.completedAt) {
            const date = new Date(goal.completedAt).toISOString().split('T')[0];
            completedDays[date] = true;
        }
    });
    
    // Count days in current streak
    let checkDate = new Date();
    while (completedDays[checkDate.toISOString().split('T')[0]]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Find best streak
    const dates = Object.keys(completedDays).sort();
    if (dates.length > 0) {
        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else {
                if (streak > bestStreak) {
                    bestStreak = streak;
                }
                streak = 1;
            }
        }
        
        if (streak > bestStreak) {
            bestStreak = streak;
        }
    }
    
    // Update display
    const streakElements = streaksContainer.querySelectorAll('.streak-badge span');
    if (streakElements.length >= 3) {
        streakElements[0].textContent = currentStreak;
        streakElements[1].textContent = bestStreak;
        streakElements[2].textContent = achievements;
    }
}

/**
 * Show achievements for a goal
 */
function showAchievements(goalId) {
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    const goal = goalsData.find(g => g.id === goalId);
    if (!goal || !goal.achievements || goal.achievements.length === 0) return;
    
    // Create modal to show achievements
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'achievements-modal';
    
    modal.innerHTML = `
        <div class="modal-content achievements-modal-content">
            <div class="modal-header">
                <h3>Achievements for "${goal.title}"</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="achievements-list">
                    ${goal.achievements.map((achievement, index) => `
                        <div class="achievement-item">
                            <div class="achievement-icon">
                                <i class="fas fa-${achievement.icon || 'medal'}"></i>
                            </div>
                            <div class="achievement-content">
                                <div class="achievement-title">${achievement.title}</div>
                                <div class="achievement-description">${achievement.description}</div>
                                <div class="achievement-date">${new Date(achievement.dateEarned).toLocaleDateString()}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Show goal template selection modal
 */
function showTemplateModal() {
    // Only proceed if this function is called from a user action
    // Check if we're in an event handler initiated by a user click
    if (!window.isUserInitiatedAction) {
        console.log('Template modal prevented from auto-showing');
        return;
    }
    
    const content = document.createElement('div');
    
    content.innerHTML = `
        <div class="template-form">
            <div class="form-group">
                <label for="template-name">Template Name</label>
                <input type="text" id="template-name" placeholder="Enter template name">
            </div>
            <div class="form-group">
                <label for="template-description">Description (optional)</label>
                <textarea id="template-description" placeholder="Enter template description"></textarea>
            </div>
            <div class="form-group">
                <label>Template Preview</label>
                <div class="template-preview">
                    <!-- Preview content will be loaded here -->
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancel-template">Cancel</button>
                <button type="button" class="btn-primary" id="save-template">Save Template</button>
            </div>
        </div>
    `;
    
    const modal = createModal('Save as Template', content, null, 'template-modal');
    
    // Load templates
    loadTemplates();
    
    // Add event listeners
    const cancelBtn = modal.querySelector('#cancel-template');
    const saveBtn = modal.querySelector('#save-template');
    
    cancelBtn.addEventListener('click', () => {
        modal.close();
    });
    
    saveBtn.addEventListener('click', () => {
        const name = modal.querySelector('#template-name').value.trim();
        const description = modal.querySelector('#template-description').value.trim();
        
        if (!name) {
            showToast('Please enter a template name', 'warning');
            return;
        }
        
        saveGoalTemplate(name, description);
        modal.close();
    });
    
    return modal;
}

/**
 * Load goal templates and display them in the modal
 */
function loadTemplates() {
    const templatesGrid = document.getElementById('templates-grid');
    const emptyTemplates = document.getElementById('empty-templates');
    
    if (!templatesGrid || !emptyTemplates) return;
    
    // Get templates from storage
    const templates = window.electronAPI ? 
        window.electronAPI.getStoreValue('goal-templates') : 
        JSON.parse(localStorage.getItem('goal-templates') || '[]');
    
    // Clear grid
    templatesGrid.innerHTML = '';
    
    if (templates.length === 0) {
        templatesGrid.style.display = 'none';
        emptyTemplates.style.display = 'block';
        return;
    }
    
    templatesGrid.style.display = 'grid';
    emptyTemplates.style.display = 'none';
    
    // Add built-in templates if no user templates
    const allTemplates = templates.length > 0 ? templates : getBuiltInTemplates();
    
    // Create template cards
    allTemplates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';
        
        const categoryIcon = getCategoryIcon(template.category || 'other');
        
        templateCard.innerHTML = `
            <div class="template-icon">
                <i class="fas fa-${categoryIcon}"></i>
            </div>
            <div class="template-content">
                <div class="template-title">${template.title}</div>
                <div class="template-info">
                    <span class="template-category">${capitalizeFirstLetter(template.category || 'other')}</span>
                    <span class="template-type">${capitalizeFirstLetter(template.type || 'daily')}</span>
                </div>
                ${template.description ? `<div class="template-description">${template.description}</div>` : ''}
            </div>
            <div class="template-actions">
                <button class="use-template-btn" data-template-id="${template.id}">Use</button>
            </div>
        `;
        
        templatesGrid.appendChild(templateCard);
        
        // Add event listener to use button
        const useButton = templateCard.querySelector('.use-template-btn');
        useButton.addEventListener('click', () => {
            useTemplate(template);
            document.getElementById('template-modal').classList.remove('show');
        });
    });
}

/**
 * Get built-in goal templates
 */
function getBuiltInTemplates() {
    return [
        {
            id: 'builtin-fitness',
            title: 'Fitness Goal',
            description: 'Track your fitness and workout progress',
            type: 'daily',
            category: 'health',
            tasks: [
                { text: 'Morning workout', completed: false },
                { text: 'Track calories', completed: false },
                { text: 'Drink water', completed: false }
            ],
            tags: ['fitness', 'health', 'workout']
        },
        {
            id: 'builtin-work',
            title: 'Work Project',
            description: 'Manage a work project with tasks and deadlines',
            type: 'weekly',
            category: 'work',
            tasks: [
                { text: 'Define project scope', completed: false },
                { text: 'Create timeline', completed: false },
                { text: 'Assign tasks', completed: false },
                { text: 'Review progress', completed: false }
            ],
            tags: ['work', 'project', 'management']
        },
        {
            id: 'builtin-learning',
            title: 'Learning Goal',
            description: 'Track progress on learning a new skill',
            type: 'long-term',
            category: 'education',
            tasks: [
                { text: 'Research resources', completed: false },
                { text: 'Create study plan', completed: false },
                { text: 'Practice regularly', completed: false },
                { text: 'Track progress', completed: false }
            ],
            tags: ['learning', 'education', 'skill']
        },
        {
            id: 'builtin-finance',
            title: 'Budget Goal',
            description: 'Set and track financial goals',
            type: 'monthly',
            category: 'finance',
            tasks: [
                { text: 'Review current finances', completed: false },
                { text: 'Set budget limits', completed: false },
                { text: 'Track expenses', completed: false },
                { text: 'Review at month end', completed: false }
            ],
            tags: ['finance', 'budget', 'money']
        }
    ];
}

/**
 * Use a template to create a new goal
 */
function useTemplate(template) {
    // Fill the goal modal with template data
    document.getElementById('goal-id').value = '';
    document.getElementById('goal-title').value = template.title;
    document.getElementById('goal-description').value = template.description || '';
    
    if (template.type) {
        document.getElementById('goal-type').value = template.type;
    }
    
    if (template.category) {
        document.getElementById('goal-category').value = template.category;
    }
    
    if (template.priority) {
        document.getElementById('goal-priority').value = template.priority;
    }
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('goal-start-date').value = today;
    
    // Add tags
    if (template.tags && template.tags.length > 0) {
        const tagsList = document.getElementById('goal-tags-list');
        if (tagsList) {
            tagsList.innerHTML = '';
            template.tags.forEach(tag => addTag(tag));
        }
    }
    
    // Add tasks
    if (template.tasks && template.tasks.length > 0) {
        const tasksList = document.getElementById('goal-tasks-list');
        if (tasksList) {
            tasksList.innerHTML = '';
            template.tasks.forEach(task => {
                addTaskToGoalForm(task.text);
            });
        }
    }
    
    // Show the goal modal
    showAddGoalModal();
}

/**
 * Save a goal as a template
 */
function saveAsTemplate() {
    // Get form values
    const title = document.getElementById('goal-title').value;
    const description = document.getElementById('goal-description').value;
    const type = document.getElementById('goal-type').value;
    const category = document.getElementById('goal-category').value;
    const priority = document.getElementById('goal-priority').value;
    
    // Get tags
    const tagsInput = document.getElementById('goal-tags').value;
    const tags = tagsInput ? tagsInput.split(',') : [];
    
    // Get tasks
    const tasksElements = document.querySelectorAll('#goal-tasks-list .goal-task-item');
    const tasks = Array.from(tasksElements).map(taskEl => {
        const taskInput = taskEl.querySelector('.goal-task-input');
        return {
            text: taskInput.value.trim(),
            completed: false
        };
    }).filter(task => task.text);
    
    // Create template object
    const template = {
        id: 'template_' + Date.now(),
        title,
        description,
        type,
        category,
        priority,
        tags,
        tasks,
        createdAt: new Date().toISOString()
    };
    
    // Get existing templates
    const templates = window.electronAPI ? 
        window.electronAPI.getStoreValue('goal-templates') : 
        JSON.parse(localStorage.getItem('goal-templates') || '[]');
    
    // Add new template
    templates.push(template);
    
    // Save to storage
    if (window.electronAPI) {
        window.electronAPI.setStoreValue('goal-templates', templates);
    } else {
        localStorage.setItem('goal-templates', JSON.stringify(templates));
    }
    
    // Show success message
    showToast('Template saved successfully');
}

/**
 * Show tag filter modal
 */
function showTagFilterModal() {
    // Get all unique tags from goals
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    // Extract all tags
    const allTags = new Set();
    goalsData.forEach(goal => {
        if (goal.tags && goal.tags.length > 0) {
            goal.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Convert to array and sort
    const tagsList = Array.from(allTags).sort();
    
    if (tagsList.length === 0) {
        showToast('No tags found in goals');
        return;
    }
    
    const content = document.createElement('div');
    
    content.innerHTML = `
        <div class="tags-filter-list">
            ${tagsList.map(tag => `
                <div class="tag-filter-item">
                    <label class="checkbox-label">
                        <input type="checkbox" value="${tag}">
                        <span>${tag}</span>
                    </label>
                </div>
            `).join('')}
        </div>
        <div class="tag-filter-actions">
            <button id="apply-tag-filter" class="btn-primary">Apply Filter</button>
            <button id="clear-tag-filter" class="btn-secondary">Clear</button>
        </div>
    `;
    
    const modal = createModal('Filter by Tags', content, null, 'tag-filter-modal');
    
    // Apply button
    modal.querySelector('#apply-tag-filter').addEventListener('click', () => {
        const selectedTags = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedTags.length > 0) {
            filterByTags(selectedTags);
        } else {
            showToast('Please select at least one tag');
            return;
        }
        
        modal.close();
    });
    
    // Clear button
    modal.querySelector('#clear-tag-filter').addEventListener('click', () => {
        // Reset checkboxes
        modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    });
    
    return modal;
}

/**
 * Filter goals by multiple tags
 */
function filterByTags(tags) {
    if (!tags || tags.length === 0) return;
    
    const goalCards = document.querySelectorAll('.goal-card');
    let hasVisibleGoals = false;
    
    goalCards.forEach(card => {
        // Get tags for this goal
        const tagElements = card.querySelectorAll('.goal-tag');
        const goalTags = Array.from(tagElements).map(el => el.getAttribute('data-tag'));
        
        // Check if this goal has any of the selected tags
        const hasTag = tags.some(tag => goalTags.includes(tag));
        
        if (hasTag) {
            card.style.display = '';
            hasVisibleGoals = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update filter buttons to show active filter
    const filterBtns = document.querySelectorAll('.goal-filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show toast with filter info
    showToast(`Filtered by tags: ${tags.join(', ')}`);
    
    // Show or hide empty state
    const goalsContainer = document.querySelector('.goals-container');
    const emptyState = document.getElementById('goals-empty-state');
    
    if (hasVisibleGoals) {
        if (goalsContainer) goalsContainer.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
    } else {
        if (goalsContainer) goalsContainer.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const title = emptyState.querySelector('h3');
            const description = emptyState.querySelector('p');
            
            if (title) title.textContent = 'No Matching Goals';
            if (description) description.textContent = `No goals found with the selected tags: ${tags.join(', ')}`;
        }
    }
}

/**
 * Filter goals by a single tag
 */
function filterByTag(tag) {
    if (!tag) return;
    filterByTags([tag]);
}

/**
 * Archive a goal
 */
function archiveGoal(goalId) {
    if (!goalId) return;
    
    // Get goals data
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    // Find the goal
    const goalIndex = goalsData.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    // Update goal
    goalsData[goalIndex].archived = true;
    goalsData[goalIndex].archivedAt = new Date().toISOString();
    
    // Save updated goals
    if (window.electronAPI) {
        window.electronAPI.setStoreValue('goals', goalsData);
    } else {
        localStorage.setItem('goals', JSON.stringify(goalsData));
    }
    
    // Remove from UI if not in archive view
    if (!document.body.classList.contains('archive-view')) {
        const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
        if (goalCard) {
            goalCard.classList.add('fade-out');
            setTimeout(() => {
                goalCard.remove();
            }, 300);
        }
    } else {
        // In archive view, update the card to show it's archived
        const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
        if (goalCard) {
            goalCard.classList.add('archived');
            const moreActions = goalCard.querySelector('.more-actions-menu');
            if (moreActions) {
                const archiveButton = moreActions.querySelector('[data-action="archive"]');
                if (archiveButton) {
                    archiveButton.innerHTML = '<i class="fas fa-box-open"></i> Unarchive';
                    archiveButton.setAttribute('data-action', 'unarchive');
                }
            }
        }
    }
    
    // Show success message
    showToast('Goal archived successfully', 'success');
}

/**
 * Unarchive a goal
 */
function unarchiveGoal(goalId) {
    if (!goalId) return;
    
    // Get goals data
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    // Find the goal
    const goalIndex = goalsData.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    // Update goal
    goalsData[goalIndex].archived = false;
    delete goalsData[goalIndex].archivedAt;
    
    // Save updated goals
    if (window.electronAPI) {
        window.electronAPI.setStoreValue('goals', goalsData);
    } else {
        localStorage.setItem('goals', JSON.stringify(goalsData));
    }
    
    // Remove from UI if in archive view
    if (document.body.classList.contains('archive-view')) {
        const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
        if (goalCard) {
            goalCard.classList.add('fade-out');
            setTimeout(() => {
                goalCard.remove();
            }, 300);
        }
    } else {
        // In normal view, update the card to show it's not archived
        const goalCard = document.querySelector(`.goal-card[data-goal-id="${goalId}"]`);
        if (goalCard) {
            goalCard.classList.remove('archived');
            const moreActions = goalCard.querySelector('.more-actions-menu');
            if (moreActions) {
                const unarchiveButton = moreActions.querySelector('[data-action="unarchive"]');
                if (unarchiveButton) {
                    unarchiveButton.innerHTML = '<i class="fas fa-archive"></i> Archive';
                    unarchiveButton.setAttribute('data-action', 'archive');
                }
            }
        }
    }
    
    // Show success message
    showToast('Goal unarchived successfully', 'success');
}

/**
 * Toggle archive view
 */
function toggleArchiveView() {
    const archiveButton = document.getElementById('show-archive-btn');
    const goalsContainer = document.querySelector('.goals-container');
    const emptyState = document.getElementById('goals-empty-state');
    
    if (!archiveButton || !goalsContainer) return;
    
    // Toggle archive view
    const isArchiveView = document.body.classList.toggle('archive-view');
    
    // Update button text
    if (isArchiveView) {
        archiveButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Goals';
        showArchivedGoals();
    } else {
        archiveButton.innerHTML = '<i class="fas fa-archive"></i> Archives';
        // Redisplay normal goals
        displayGoals();
    }
}

/**
 * Display archived goals
 */
function showArchivedGoals() {
    const goalsContainer = document.querySelector('.goals-container');
    const emptyState = document.getElementById('goals-empty-state');
    
    if (!goalsContainer) return;
    
    // Get goals from storage
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    // Filter archived goals
    const archivedGoals = goalsData.filter(goal => goal.archived);
    
    // Clear container
    goalsContainer.innerHTML = '';
    
    if (archivedGoals.length === 0) {
        goalsContainer.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const title = emptyState.querySelector('h3');
            const description = emptyState.querySelector('p');
            
            if (title) title.textContent = 'No Archived Goals';
            if (description) description.textContent = 'You haven\'t archived any goals yet.';
        }
        return;
    }
    
    goalsContainer.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    
    // Sort archived goals by archive date
    archivedGoals.sort((a, b) => {
        return new Date(b.archivedAt) - new Date(a.archivedAt);
    });
    
    // Create goal cards for archived goals
    archivedGoals.forEach(goal => {
        const goalCard = createGoalCard(goal);
        goalsContainer.appendChild(goalCard);
    });
}

/**
 * Share a goal
 */
function shareGoal(goalId) {
    if (!goalId) return;
    
    // Get goals data
    const goalsData = window.electronAPI ? 
        window.electronAPI.getStoreValue('goals') : 
        JSON.parse(localStorage.getItem('goals') || '[]');
    
    // Find the goal
    const goal = goalsData.find(g => g.id === goalId);
    if (!goal) return;
    
    // Create modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'share-goal-modal';
    
    modal.innerHTML = `
        <div class="modal-content share-modal-content">
            <div class="modal-header">
                <h3>Share "${goal.title}"</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="share-options">
                    <button class="share-option" data-action="copy">
                        <i class="fas fa-copy"></i>
                        <span>Copy as Text</span>
                    </button>
                    <button class="share-option" data-action="export">
                        <i class="fas fa-file-export"></i>
                        <span>Export as JSON</span>
                    </button>
                    <button class="share-option" data-action="email">
                        <i class="fas fa-envelope"></i>
                        <span>Email</span>
                    </button>
                </div>
                
                <div class="share-preview">
                    <h4>Preview</h4>
                    <div class="preview-content">
                        <p><strong>Goal:</strong> ${goal.title}</p>
                        ${goal.description ? `<p><strong>Description:</strong> ${goal.description}</p>` : ''}
                        <p><strong>Type:</strong> ${capitalizeFirstLetter(goal.type)}</p>
                        <p><strong>Category:</strong> ${capitalizeFirstLetter(goal.category)}</p>
                        <p><strong>Progress:</strong> ${calculateGoalProgress(goal.tasks).percent}%</p>
                        ${goal.tasks && goal.tasks.length > 0 ? `
                            <p><strong>Tasks:</strong></p>
                            <ul>
                                ${goal.tasks.map(task => `
                                    <li>${task.completed ? '✓' : '○'} ${task.text}</li>
                                `).join('')}
                            </ul>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Share option buttons
    const shareOptions = modal.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.addEventListener('click', () => {
            const action = option.getAttribute('data-action');
            
            switch (action) {
                case 'copy':
                    copyGoalAsText(goal);
                    break;
                case 'export':
                    exportGoalAsJson(goal);
                    break;
                case 'email':
                    emailGoal(goal);
                    break;
            }
            
            document.body.removeChild(modal);
        });
    });
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Copy goal as text to clipboard
 */
function copyGoalAsText(goal) {
    if (!goal) return;
    
    // Format the goal as text
    let text = `Goal: ${goal.title}\n`;
    if (goal.description) text += `Description: ${goal.description}\n`;
    text += `Type: ${capitalizeFirstLetter(goal.type)}\n`;
    text += `Category: ${capitalizeFirstLetter(goal.category)}\n`;
    text += `Progress: ${calculateGoalProgress(goal.tasks).percent}%\n`;
    
    if (goal.tags && goal.tags.length > 0) {
        text += `Tags: ${goal.tags.join(', ')}\n`;
    }
    
    if (goal.tasks && goal.tasks.length > 0) {
        text += `\nTasks:\n`;
        goal.tasks.forEach(task => {
            text += `${task.completed ? '✓' : '○'} ${task.text}\n`;
        });
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
        .then(() => {
            showToast('Goal copied to clipboard', 'success');
        })
        .catch(err => {
            console.error('Failed to copy goal: ', err);
            showToast('Failed to copy to clipboard', 'error');
        });
}

/**
 * Export goal as JSON file
 */
function exportGoalAsJson(goal) {
    if (!goal) return;
    
    // Create a Blob with the goal data
    const goalData = JSON.stringify(goal, null, 2);
    const blob = new Blob([goalData], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goal-${goal.id}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Goal exported successfully', 'success');
    }, 100);
}

/**
 * Email goal details
 */
function emailGoal(goal) {
    if (!goal) return;
    
    // Format the goal as text for email body
    let body = `Goal: ${goal.title}\n\n`;
    if (goal.description) body += `Description: ${goal.description}\n\n`;
    body += `Type: ${capitalizeFirstLetter(goal.type)}\n`;
    body += `Category: ${capitalizeFirstLetter(goal.category)}\n`;
    body += `Progress: ${calculateGoalProgress(goal.tasks).percent}%\n\n`;
    
    if (goal.tags && goal.tags.length > 0) {
        body += `Tags: ${goal.tags.join(', ')}\n\n`;
    }
    
    if (goal.tasks && goal.tasks.length > 0) {
        body += `Tasks:\n`;
        goal.tasks.forEach(task => {
            body += `${task.completed ? '✓' : '○'} ${task.text}\n`;
        });
    }
    
    // Create mailto link
    const subject = encodeURIComponent(`Goal: ${goal.title}`);
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:?subject=${subject}&body=${encodedBody}`;
    
    // Open email client
    window.location.href = mailtoLink;
}

/**
 * Show quick add goal modal
 */
function showQuickAddGoalModal() {
    const content = document.createElement('div');
    
    // Get today's date for default value
    const today = new Date().toISOString().split('T')[0];
    
    content.innerHTML = `
        <form id="quick-add-form">
            <div class="form-group">
                <label for="quick-goal-input">Enter Goal</label>
                <input type="text" id="quick-goal-input" 
                       placeholder="Example: Finish report by Friday #work @high" 
                       autocomplete="off">
                <p class="quick-add-help">
                    <small>
                        Use format: Goal title [by date] [#category] [@priority]<br>
                        Example: "Finish quarterly report by next Friday #work @high"
                    </small>
                </p>
            </div>
            
            <div class="quick-add-preview">
                <h4>Preview</h4>
                <div id="quick-add-preview-content" class="preview-content">
                    <p>Enter a goal above to see preview</p>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancel-quick-add">Cancel</button>
                <button type="submit" class="btn-primary">Add Goal</button>
            </div>
        </form>
    `;
    
    const modal = createModal('Quick Add Goal', content, null, 'quick-add-modal');
    
    // Add event listeners
    const form = modal.querySelector('#quick-add-form');
    const input = modal.querySelector('#quick-goal-input');
    const previewContent = modal.querySelector('#quick-add-preview-content');
    const cancelBtn = modal.querySelector('#cancel-quick-add');
    
    cancelBtn.addEventListener('click', () => {
        modal.close();
    });
    
    // Live preview as user types
    input.addEventListener('input', () => {
        const parsedGoal = parseQuickAddInput(input.value);
        updateQuickAddPreview(parsedGoal, previewContent);
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const goalText = input.value.trim();
        if (!goalText) {
            showToast('Please enter a goal', 'error');
            return;
        }
        
        const parsedGoal = parseQuickAddInput(goalText);
        createQuickGoal(parsedGoal);
        
        modal.close();
    });
    
    // Focus input
    setTimeout(() => {
        input.focus();
    }, 10);
    
    return modal;
}

/**
 * Parse quick add input text
 * Supports: Goal title [by date] [#category] [@priority]
 */
function parseQuickAddInput(text) {
    if (!text) return null;
    
    const parsedGoal = {
        title: text,
        type: 'daily',
        category: 'other',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        tags: []
    };
    
    // Extract date (by)
    const byMatch = text.match(/\bby\s+([^\#\@]+)/i);
    if (byMatch) {
        const dateText = byMatch[1].trim();
        parsedGoal.title = text.replace(byMatch[0], '').trim();
        
        // Parse natural date expressions
        let endDate = null;
        
        if (dateText.match(/\b(today|now)\b/i)) {
            endDate = new Date();
        } else if (dateText.match(/\btomorrow\b/i)) {
            endDate = new Date();
}

// Export for use in app.js
window.initGoals = initGoals; 
    }
    
    return parsedGoal;
}

/**
 * Shows the share goal modal
 * @param {Object} goal - The goal to share
 */
function showShareModal(goal) {
    const content = document.createElement('div');
    
    content.innerHTML = `
        <div class="share-options">
            <div class="share-option">
                <h4>Share as Text</h4>
                <p>Copy formatted text of this goal</p>
                <div class="share-preview text-preview">
                    <pre>${formatGoalForSharing(goal, 'text')}</pre>
                </div>
                <button class="btn-secondary copy-share-btn" data-format="text">
                    <i class="fas fa-copy"></i> Copy Text
                </button>
            </div>
            
            <div class="share-option">
                <h4>Share as JSON</h4>
                <p>Copy JSON data for importing</p>
                <div class="share-preview json-preview">
                    <pre>${formatGoalForSharing(goal, 'json')}</pre>
                </div>
                <button class="btn-secondary copy-share-btn" data-format="json">
                    <i class="fas fa-code"></i> Copy JSON
                </button>
            </div>
            
            <div class="share-option">
                <h4>Share via Email</h4>
                <p>Send this goal via email</p>
                <button class="btn-primary email-share-btn">
                    <i class="fas fa-envelope"></i> Email Goal
                </button>
            </div>
        </div>
    `;
    
    const modal = createModal(`Share Goal: ${goal.title}`, content, null, 'share-modal');
    
    // Add event listeners for copy buttons
    modal.querySelectorAll('.copy-share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.getAttribute('data-format');
            const textToCopy = formatGoalForSharing(goal, format);
            
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    showToast('Copied to clipboard');
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = `<i class="fas fa-copy"></i> Copy ${format === 'text' ? 'Text' : 'JSON'}`;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy goal: ', err);
                    showToast('Failed to copy to clipboard', 'error');
                });
        });
    });
    
    // Email button
    const emailBtn = modal.querySelector('.email-share-btn');
    emailBtn.addEventListener('click', () => {
        const subject = `Shared Goal: ${goal.title}`;
        const body = formatGoalForSharing(goal, 'text');
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        modal.close();
    });
    
    return modal;
}

/**
 * Shows the achievements modal with user's achievements
 */
function showAchievementsModal() {
    const content = document.createElement('div');
    
    // Get achievements data
    const achievements = getAchievements();
    
    content.innerHTML = `
        <div class="achievements-container">
            <div class="achievements-stats">
                <div class="achievement-stat">
                    <span class="stat-value">${achievements.completed}</span>
                    <span class="stat-label">Goals Completed</span>
                </div>
                <div class="achievement-stat">
                    <span class="stat-value">${achievements.streak}</span>
                    <span class="stat-label">Day Streak</span>
                </div>
                <div class="achievement-stat">
                    <span class="stat-value">${achievements.badges.length}</span>
                    <span class="stat-label">Badges Earned</span>
                </div>
            </div>
            
            <div class="achievements-badges">
                <h4>Earned Badges</h4>
                <div class="badges-grid">
                    ${achievements.badges.length > 0 ? 
                        achievements.badges.map(badge => `
                            <div class="achievement-badge ${badge.unlocked ? 'unlocked' : 'locked'}">
                                <div class="badge-icon">
                                    <i class="${badge.icon}"></i>
                                </div>
                                <div class="badge-info">
                                    <h5>${badge.name}</h5>
                                    <p>${badge.description}</p>
                                </div>
                            </div>
                        `).join('') : 
                        '<p class="no-badges">No badges earned yet. Complete goals to earn badges!</p>'
                    }
                </div>
            </div>
        </div>
    `;
    
    const modal = createModal('Achievements', content, null, 'achievements-modal');
    
    // Add a close button in the footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    const closeButton = document.createElement('button');
    closeButton.className = 'btn-primary';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => modal.close());
    footer.appendChild(closeButton);
    modal.appendChild(footer);
    
    return modal;
}

// Update the more actions menu to properly toggle visibility
function toggleMoreActionsMenu(btn) {
    // Close any other open menus first
    const openMenus = document.querySelectorAll('.more-actions-menu.active');
    openMenus.forEach(menu => {
        if (menu !== btn.nextElementSibling) {
            menu.classList.remove('active');
        }
    });
    
    // Toggle this menu
    const menu = btn.nextElementSibling;
    menu.classList.toggle('active');
    
    // Close menu when clicking outside
    function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== btn) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    }
    
    if (menu.classList.contains('active')) {
        // Add with a small delay to avoid immediate trigger
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }
}

/**
 * Handler for template button clicks to prevent auto-opening
 * @param {Event} e - The click event
 */
function handleTemplateButtonClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Set the flag to indicate this is a user action
    window.isUserInitiatedAction = true;
    
    // Show the template modal
    showTemplateModal();
    
    // Reset flag after a short delay
    setTimeout(function() {
        window.isUserInitiatedAction = false;
    }, 100);
}

// Add this to track if an action is user-initiated
document.addEventListener('click', function() {
    window.isUserInitiatedAction = true;
    // Reset after a short delay
    setTimeout(function() {
        window.isUserInitiatedAction = false;
    }, 100);
});

// Find and close the specific layout template modal on load
document.addEventListener('DOMContentLoaded', function() {
    // Close all modals immediately
    setTimeout(function() {
        // Find the specific Save Current Layout modal that appears in the screenshot
        const saveCurrentLayoutModal = document.querySelector('.save-current-layout-container');
        if (saveCurrentLayoutModal) {
            saveCurrentLayoutModal.style.display = 'none';
            saveCurrentLayoutModal.remove();
        }
        
        // Find any template modals
        const templateModals = document.querySelectorAll('[class*="template-modal"], .modal:has(.template-form)');
        templateModals.forEach(modal => {
            modal.remove();
        });
        
        // Remove any modal overlays
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.remove();
        });
    }, 10);
});

// Specific function to hide the template layout modal
function hideTemplateLayoutOnLoad() {
    // Find and hide or remove any template UI elements that are showing automatically
    const saveCurrentLayoutContainers = document.querySelectorAll('.save-current-layout-container, [id^="template"], .template-container, .template-form, .template-modal');
    saveCurrentLayoutContainers.forEach(container => {
        // First try to hide it
        container.style.display = 'none';
        
        // Then remove it from the DOM
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 0);
    });
    
    // Hide any modal overlays too
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.style.display = 'none';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 0);
    });
    
    // Try to find the specific element in the screenshot (has a checkbox for Pomodoro Settings)
    const pomodoroSettings = document.querySelectorAll('input[type="checkbox"][id^="include-"][id*="pomodoro"]');
    if (pomodoroSettings.length > 0) {
        pomodoroSettings.forEach(setting => {
            // Find the container and remove it
            let parent = setting;
            while (parent && !parent.classList.contains('modal') && parent.tagName !== 'BODY') {
                parent = parent.parentNode;
            }
            
            if (parent && parent.classList.contains('modal')) {
                parent.style.display = 'none';
                setTimeout(() => {
                    if (parent.parentNode) {
                        parent.parentNode.removeChild(parent);
                    }
                }, 0);
            }
        });
    }
}

// Override the function that's creating the Save Current Layout as Template UI
function handleSaveAsTemplateClick(e) {
    // Only allow this to run if explicitly triggered by a user click
    if (e && e.isTrusted) {
        window.isUserInitiatedAction = true;
        showTemplateModal();
        setTimeout(() => {
            window.isUserInitiatedAction = false;
        }, 100);
    }
}

/**
 * Shows the Add Goal form popup when Add Goal button is clicked
 * @param {Event} e - The click event
 */
function showAddGoalForm(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Set the user action flag to allow popup
    window.isUserInitiatedAction = true;
    
    console.log('Opening Add Goal form popup');
    
    // Create modal content with all fields
    const content = document.createElement('div');
    content.innerHTML = `
        <form id="goal-form" class="goal-form">
            <div class="form-group">
                <label for="goal-title">Goal Title <span class="required">*</span></label>
                <input type="text" id="goal-title" placeholder="Enter goal title" required 
                    maxlength="100" data-error="Please enter a goal title">
                <div class="error-message"></div>
            </div>
            
            <div class="form-group">
                <label for="goal-description">Description</label>
                <textarea id="goal-description" placeholder="Enter goal description" maxlength="500"></textarea>
                <div class="char-count">0/500</div>
            </div>
            
            <div class="form-row">
                <div class="form-group half">
                    <label for="goal-start-date">Start Date <span class="required">*</span></label>
                    <input type="date" id="goal-start-date" required data-error="Please select a start date">
                    <div class="error-message"></div>
                </div>
                <div class="form-group half">
                    <label for="goal-end-date">End Date</label>
                    <input type="date" id="goal-end-date">
                    <div class="error-message"></div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group half">
                    <label for="goal-priority">Priority</label>
                    <select id="goal-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group half">
                    <label for="goal-category">Category</label>
                    <select id="goal-category">
                        <option value="personal">Personal</option>
                        <option value="work" selected>Work</option>
                        <option value="health">Health</option>
                        <option value="education">Education</option>
                        <option value="finance">Finance</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="goal-tags-input">Tags</label>
                <div class="tags-input-container">
                    <div id="goal-tags-list" class="tags-list"></div>
                    <input type="text" id="goal-tags-input" placeholder="Add tags (press Enter)" 
                        autocomplete="off" maxlength="30">
                    <input type="hidden" id="goal-tags" value="">
                </div>
                <small class="help-text">Press Enter or comma to add a tag</small>
            </div>
            
            <div class="form-group">
                <label>Reminders</label>
                <div class="reminder-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="goal-reminder-daily">
                        <span>Daily</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="goal-reminder-weekly">
                        <span>Weekly</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="goal-reminder-before-due">
                        <span>Before Due Date</span>
                    </label>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancel-goal">Cancel</button>
                <button type="submit" class="btn-primary">Save Goal</button>
            </div>
        </form>
    `;
    
    // Create modal with the form content
    const modal = createModal('Add New Goal', content, null, 'goal-modal');
    
    // Set default dates (today for start date)
    const today = new Date().toISOString().split('T')[0];
    modal.querySelector('#goal-start-date').value = today;
    
    // Character count for description
    const description = modal.querySelector('#goal-description');
    const charCount = modal.querySelector('.char-count');
    description.addEventListener('input', () => {
        const count = description.value.length;
        charCount.textContent = `${count}/500`;
        charCount.classList.toggle('near-limit', count > 450);
    });
    
    // End date validation
    const startDate = modal.querySelector('#goal-start-date');
    const endDate = modal.querySelector('#goal-end-date');
    
    startDate.addEventListener('change', () => {
        endDate.min = startDate.value;
        validateDates();
    });
    
    endDate.addEventListener('change', validateDates);
    
    function validateDates() {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        const errorDiv = endDate.nextElementSibling;
        
        if (end < start) {
            errorDiv.textContent = 'End date must be after start date';
            endDate.setCustomValidity('End date must be after start date');
        } else {
            errorDiv.textContent = '';
            endDate.setCustomValidity('');
        }
    }
    
    // Set up tags input functionality
    const tagsInput = modal.querySelector('#goal-tags-input');
    const tagsList = modal.querySelector('#goal-tags-list');
    const tagsHiddenInput = modal.querySelector('#goal-tags');
    
    // Handle tag input
    tagsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            
            const tagText = tagsInput.value.trim();
            if (tagText) {
                // Check if tag already exists
                const existingTags = Array.from(tagsList.children).map(tag => 
                    tag.textContent.trim().toLowerCase()
                );
                
                if (existingTags.includes(tagText.toLowerCase())) {
                    showToast('This tag already exists', 'warning');
                    return;
                }
                
                // Add tag to the list
                const tagElement = document.createElement('span');
                tagElement.className = 'tag-item';
                tagElement.innerHTML = `
                    ${tagText}
                    <button type="button" class="remove-tag" aria-label="Remove tag">&times;</button>
                `;
                tagsList.appendChild(tagElement);
                
                // Clear input
                tagsInput.value = '';
                
                // Update hidden input
                updateTagsInput(tagsList, tagsHiddenInput);
                
                // Add remove event for tag
                const removeButton = tagElement.querySelector('.remove-tag');
                removeButton.addEventListener('click', () => {
                    tagElement.remove();
                    updateTagsInput(tagsList, tagsHiddenInput);
                });
            }
        }
    });
    
    // Form submission handler
    const form = modal.querySelector('#goal-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                const errorDiv = field.nextElementSibling;
                if (errorDiv && errorDiv.classList.contains('error-message')) {
                    errorDiv.textContent = field.dataset.error || 'This field is required';
                }
                field.classList.add('error');
            }
        });
        
        if (!isValid) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate dates
        validateDates();
        if (endDate.validity.customError) {
            showToast('Please fix the date range', 'error');
            return;
        }
        
        try {
            const goal = {
                id: generateId(),
                title: form.querySelector('#goal-title').value.trim(),
                description: form.querySelector('#goal-description').value.trim(),
                startDate: form.querySelector('#goal-start-date').value,
                endDate: form.querySelector('#goal-end-date').value || null,
                priority: form.querySelector('#goal-priority').value,
                category: form.querySelector('#goal-category').value,
                tags: tagsHiddenInput.value ? tagsHiddenInput.value.split(',') : [],
                reminders: [],
                completed: false,
                progress: 0,
                tasks: [],
                createdAt: new Date().toISOString()
            };
            
            // Add selected reminders
            if (form.querySelector('#goal-reminder-daily').checked) {
                goal.reminders.push('daily');
            }
            if (form.querySelector('#goal-reminder-weekly').checked) {
                goal.reminders.push('weekly');
            }
            if (form.querySelector('#goal-reminder-before-due').checked) {
                goal.reminders.push('before-due');
            }
            
            // Save the goal
            await saveGoal(goal);
            
            // Close modal and show success message
            closeAllModals();
            showToast('Goal added successfully', 'success');
            
            // Refresh goals display
            const goals = loadGoals();
            displayGoals(goals);
        } catch (error) {
            console.error('Failed to save goal:', error);
            showToast('Failed to save goal. Please try again.', 'error');
        }
    });
    
    // Focus on title input
    setTimeout(() => {
        modal.querySelector('#goal-title').focus();
    }, 100);
    
    // Reset user action flag after a delay
    setTimeout(() => {
        window.isUserInitiatedAction = false;
    }, 100);
}

// Add a function to generate unique IDs for goals
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to save a goal
function saveGoal(goal) {
    // Get existing goals
    let goals = [];
    
    if (window.electronAPI) {
        goals = window.electronAPI.getStoreValue('goals') || [];
    } else {
        goals = JSON.parse(localStorage.getItem('goals') || '[]');
    }
    
    // Add new goal
    goals.push(goal);
    
    // Save updated goals
    if (window.electronAPI) {
        window.electronAPI.setStoreValue('goals', goals);
    } else {
        localStorage.setItem('goals', JSON.stringify(goals));
    }
    
    // Check achievements
    checkAchievements();
    
    // Return the saved goal
    return goal;
}

// Function to load goals from storage
function loadGoals() {
    console.log('Loading goals from storage');
    
    // Get goals from storage
    let goals = [];
    
    if (window.electronAPI) {
        goals = window.electronAPI.getStoreValue('goals') || [];
    } else {
        goals = JSON.parse(localStorage.getItem('goals') || '[]');
    }
    
    // Filter goals based on current view
    displayGoals(goals);
    
    return goals;
}

// Function to display goals
function displayGoals(goals) {
    const goalsContainer = document.querySelector('.goals-list');
    if (!goalsContainer) {
        console.error('Goals container not found');
        return;
    }
    
    // Clear container
    goalsContainer.innerHTML = '';
    
    // Filter based on archive state and view
    let filteredGoals = goals;
    
    // Apply filters based on current state
    const isArchiveView = document.querySelector('.goals-container')?.classList.contains('archive-view');
    
    // Filter for archive/active goals
    filteredGoals = goals.filter(goal => goal.archived === isArchiveView);
    
    // If we're in timeline view, filter by date range for current view
    const currentView = document.querySelector('.view-toggle-btn.active')?.getAttribute('data-view');
    if (currentView === 'timeline') {
        filteredGoals = filterGoalsByTimelineView(filteredGoals);
    }
    
    // Sort goals
    filteredGoals.sort((a, b) => {
        // Sort by completed status first
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then by priority
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Display goals or empty state
    if (filteredGoals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <h3>No goals yet</h3>
                <p>Create a new goal to get started on your journey.</p>
                <button id="empty-add-goal-btn" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
            </div>
        `;
        
        // Add event listener to the empty state button
        const emptyAddGoalBtn = document.getElementById('empty-add-goal-btn');
        if (emptyAddGoalBtn) {
            emptyAddGoalBtn.addEventListener('click', showAddGoalForm);
        }
    } else {
        // Create a goal card for each goal
        filteredGoals.forEach(goal => {
            const goalCard = createGoalCard(goal);
            goalsContainer.appendChild(goalCard);
        });
    }
}