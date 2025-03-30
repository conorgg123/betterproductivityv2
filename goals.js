// Goal Setting Module
let activeGoalView = 'grid';
let goalCompletionChart = null;

// Integration with other system components
function syncGoalsWithTasks() {
    console.log('Syncing goals with tasks system');
    
    // Get all goals and tasks
    const goals = loadGoals();
    const tasks = loadTasks();
    
    // Skip if we don't have both goals and tasks
    if (!goals || !tasks) return;
    
    // For each goal that has linked tasks
    goals.forEach((goal, index) => {
        if (!goal.linkedTaskIds || goal.linkedTaskIds.length === 0) return;
        
        // Find associated tasks
        const linkedTasks = tasks.filter(task => goal.linkedTaskIds.includes(task.id));
        
        // Calculate progress based on completed linked tasks
        if (linkedTasks.length > 0) {
            const completedLinkedTasks = linkedTasks.filter(task => task.completed);
            
            // If all linked tasks are completed, mark goal as completed if it wasn't already
            if (completedLinkedTasks.length === linkedTasks.length && !goal.completed) {
                goals[index].completed = true;
                goals[index].completedDate = new Date().toISOString();
                console.log(`Goal '${goal.title}' automatically marked as completed`);
            }
            
            // Update goal progress
            goals[index].progress = Math.round((completedLinkedTasks.length / linkedTasks.length) * 100);
        }
    });
    
    // Save updated goals
    localStorage.setItem('goals', JSON.stringify(goals));
    
    // Update display if on goals section
    if (document.getElementById('goals-section') && 
        document.getElementById('goals-section').style.display !== 'none') {
        displayGoals(goals);
        updateGoalStats(goals);
    }
}

function loadTasks() {
    try {
        const tasksData = localStorage.getItem('tasks');
        return tasksData ? JSON.parse(tasksData) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

function syncGoalsWithAnalytics() {
    console.log('Syncing goals with analytics system');
    
    // Get all goals
    const goals = loadGoals();
    if (!goals) return;
    
    // Prepare analytics data
    const analyticsData = {
        totalGoals: goals.length,
        completedGoals: goals.filter(goal => goal.completed).length,
        goalsInProgress: goals.filter(goal => !goal.completed).length,
        goalsByType: {
            daily: goals.filter(goal => goal.type === 'daily').length,
            weekly: goals.filter(goal => goal.type === 'weekly').length,
            monthly: goals.filter(goal => goal.type === 'monthly').length,
            longTerm: goals.filter(goal => goal.type === 'long-term').length
        },
        completionRates: {
            daily: calculateCompletionRate(goals, 'daily'),
            weekly: calculateCompletionRate(goals, 'weekly'),
            monthly: calculateCompletionRate(goals, 'monthly'),
            longTerm: calculateCompletionRate(goals, 'long-term')
        },
        overallCompletionRate: goals.length > 0 
            ? Math.round((goals.filter(goal => goal.completed).length / goals.length) * 100) 
            : 0
    };
    
    // Store analytics data for use in the analytics dashboard
    try {
        let appAnalytics = JSON.parse(localStorage.getItem('analytics') || '{}');
        appAnalytics.goals = analyticsData;
        localStorage.setItem('analytics', JSON.stringify(appAnalytics));
        
        // If analytics module is available, notify it of data change
        if (window.updateAnalytics && typeof window.updateAnalytics === 'function') {
            window.updateAnalytics();
        }
    } catch (error) {
        console.error('Error saving goals analytics:', error);
    }
}

function calculateCompletionRate(goals, type) {
    const typeGoals = goals.filter(goal => goal.type === type);
    return typeGoals.length > 0 
        ? Math.round((typeGoals.filter(goal => goal.completed).length / typeGoals.length) * 100) 
        : 0;
}

function syncWithMainDashboard() {
    console.log('Syncing goals with main dashboard');
    
    // Get all goals
    const goals = loadGoals();
    if (!goals) return;
    
    // Calculate key metrics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.completed).length;
    const inProgressGoals = totalGoals - completedGoals;
    
    // Calculate daily, weekly goals
    const dailyGoals = goals.filter(goal => goal.type === 'daily').length;
    const weeklyGoals = goals.filter(goal => goal.type === 'weekly').length;
    
    // Update dashboard elements
    updateDashboardCounter('completed-count', completedGoals);
    updateDashboardCounter('in-progress-count', inProgressGoals);
    updateDashboardCounter('daily-count', dailyGoals);
    updateDashboardCounter('weekly-count', weeklyGoals);
    
    // Update tags in sidebar
    updateTagsInSidebar(goals);
    
    // Update chart if exists
    if (window.goalCompletionChart) {
        updateGoalCompletionChart(goals);
    } else {
        initializeCharts(goals);
    }
}

function updateDashboardCounter(className, value) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => {
        element.textContent = value;
    });
}

function updateTagsInSidebar(goals) {
    // Get all unique tags from goals
    const allTags = new Set();
    goals.forEach(goal => {
        if (goal.tags && Array.isArray(goal.tags)) {
            goal.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Find tags container
    const tagsContainer = document.querySelector('#goals-section .tags-container');
    if (!tagsContainer) return;
    
    // Clear existing tags
    tagsContainer.innerHTML = '';
    
    // If no tags, show message
    if (allTags.size === 0) {
        tagsContainer.innerHTML = '<div class="no-tags">No tags yet</div>';
        return;
    }
    
    // Add each tag with count
    Array.from(allTags).sort().forEach(tag => {
        // Count goals with this tag
        const tagCount = goals.filter(goal => 
            goal.tags && Array.isArray(goal.tags) && goal.tags.includes(tag)
        ).length;
        
        // Create tag element
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            <span class="tag-name">${tag}</span>
            <span class="tag-count">${tagCount}</span>
        `;
        
        // Add click handler to filter by this tag
        tagElement.addEventListener('click', () => filterGoalsByTag(tag));
        
        // Add to container
        tagsContainer.appendChild(tagElement);
    });
}

// Make sure this function finds the correct main chart container
function initializeCharts(goals) {
    if (!goals) goals = loadGoals();
    
    // Find chart container
    const chartContainer = document.querySelector('.goals-chart-container');
    if (!chartContainer) {
        console.log('Chart container not found');
        return;
    }
    
    try {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not available');
            loadChartJsIfNeeded(() => initializeCharts(goals));
            return;
        }
        
        // Prepare data for chart
        const completionRates = {
            daily: calculateCompletionRate(goals, 'daily'),
            weekly: calculateCompletionRate(goals, 'weekly'),
            monthly: calculateCompletionRate(goals, 'monthly'),
            longTerm: calculateCompletionRate(goals, 'long-term')
        };
        
        // Create canvas if it doesn't exist
        let canvas = chartContainer.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'goal-completion-chart';
            chartContainer.appendChild(canvas);
        }
        
        // If chart already exists, destroy it
        if (window.goalCompletionChart) {
            window.goalCompletionChart.destroy();
        }
        
        // Create chart
        const ctx = canvas.getContext('2d');
        window.goalCompletionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Daily', 'Weekly', 'Monthly', 'Long-term'],
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: [
                        completionRates.daily,
                        completionRates.weekly,
                        completionRates.monthly,
                        completionRates.longTerm
                    ],
                    backgroundColor: [
                        'rgba(56, 189, 248, 0.7)', // Daily - blue
                        'rgba(74, 222, 128, 0.7)', // Weekly - green
                        'rgba(251, 146, 60, 0.7)', // Monthly - orange
                        'rgba(244, 114, 182, 0.7)'  // Long-term - pink
                    ],
                    borderColor: [
                        'rgb(56, 189, 248)',
                        'rgb(74, 222, 128)',
                        'rgb(251, 146, 60)',
                        'rgb(244, 114, 182)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Goal completion chart initialized');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Load Chart.js dynamically if needed
function loadChartJsIfNeeded(callback) {
    if (typeof Chart !== 'undefined') {
        callback();
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = callback;
    document.head.appendChild(script);
}

// Update the chart with new data
function updateGoalCompletionChart(goals) {
    if (!window.goalCompletionChart || !goals) return;
    
    // Calculate completion rates
    const completionRates = {
        daily: calculateCompletionRate(goals, 'daily'),
        weekly: calculateCompletionRate(goals, 'weekly'),
        monthly: calculateCompletionRate(goals, 'monthly'),
        longTerm: calculateCompletionRate(goals, 'long-term')
    };
    
    // Update chart data
    window.goalCompletionChart.data.datasets[0].data = [
        completionRates.daily,
        completionRates.weekly,
        completionRates.monthly,
        completionRates.longTerm
    ];
    
    // Update chart
    window.goalCompletionChart.update();
}

/**
 * Update goal stats in the dashboard
 */
function updateGoalStats(goals) {
    if (!goals) goals = loadGoals();
    
    // Completed goals
    const completedCount = goals.filter(goal => goal.completed).length;
    const completedElement = document.querySelector('.goal-stats .completed-count');
    if (completedElement) {
        completedElement.textContent = completedCount;
    }
    
    // In progress goals
    const inProgressCount = goals.filter(goal => !goal.completed).length;
    const inProgressElement = document.querySelector('.goal-stats .in-progress-count');
    if (inProgressElement) {
        inProgressElement.textContent = inProgressCount;
    }
    
    // Daily goals
    const dailyCount = goals.filter(goal => goal.type === 'daily').length;
    const dailyElement = document.querySelector('.goal-stats .daily-count');
    if (dailyElement) {
        dailyElement.textContent = dailyCount;
    }
    
    // Weekly goals
    const weeklyCount = goals.filter(goal => goal.type === 'weekly').length;
    const weeklyElement = document.querySelector('.goal-stats .weekly-count');
    if (weeklyElement) {
        weeklyElement.textContent = weeklyCount;
    }
    
    // Update chart if it exists
    if (window.goalCompletionChart) {
        updateGoalCompletionChart(goals);
    }
    
    // Update sidebar tags
    updateTagsInSidebar(goals);
    
    // Sync with analytics system
    syncGoalsWithAnalytics();
    
    // Update any main dashboard elements
    const allCompletedCounters = document.querySelectorAll('.completed-count');
    allCompletedCounters.forEach(counter => {
        counter.textContent = completedCount;
    });
    
    const allInProgressCounters = document.querySelectorAll('.in-progress-count');
    allInProgressCounters.forEach(counter => {
        counter.textContent = inProgressCount;
    });
    
    const allDailyCounters = document.querySelectorAll('.daily-count');
    allDailyCounters.forEach(counter => {
        counter.textContent = dailyCount;
    });
    
    const allWeeklyCounters = document.querySelectorAll('.weekly-count');
    allWeeklyCounters.forEach(counter => {
        counter.textContent = weeklyCount;
    });
}

/**
 * Save a goal from the form
 */
function saveGoal(form, modal) {
    if (!form) return;
    
    try {
        // Get form data
        const title = form.querySelector('#goal-title').value;
        const type = form.querySelector('#goal-type').value;
        const priority = form.querySelector('#goal-priority').value;
        const description = form.querySelector('#goal-description').value;
        const startDate = form.querySelector('#goal-start-date').value;
        const dueDate = form.querySelector('#goal-due-date').value;
        const tagsInput = form.querySelector('#goal-tags').value;
        
        // Parse tags
        const tags = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
        
        // Get tasks
        const taskInputs = form.querySelectorAll('.goal-task-input');
        const tasks = Array.from(taskInputs)
            .map(input => input.value.trim())
            .filter(task => task !== '')
            .map(task => ({
                title: task,
                completed: false
            }));
        
        // Create goal object
        const goal = {
            id: generateId(),
            title,
            type,
            priority,
            description,
            startDate: startDate || null,
            dueDate: dueDate || null,
            tags,
            tasks,
            linkedTaskIds: [], // For linking to existing tasks
            createdAt: new Date().toISOString(),
            completed: false,
            progress: 0 // Track overall progress
        };
        
        // Save to storage
        const goals = loadGoals();
            goals.push(goal);
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Close modal
        closeModal(modal);
        
        // Show success message
        showToast('Goal added successfully', 'success');
        
        // Create real tasks from the goal's tasks if needed
        if (tasks.length > 0) {
            createTasksFromGoal(goal);
        }
        
        // Refresh goals display
        displayGoals(goals);
        
        // Update stats
        updateGoalStats(goals);
        
        // Sync with other systems
        syncWithMainDashboard();
        syncGoalsWithTasks();
        syncGoalsWithAnalytics();
        
    } catch (error) {
        console.error('Error saving goal:', error);
        showToast('Failed to save goal. Please try again.', 'error');
    }
}

/**
 * Save a quick goal from the form
 */
function saveQuickGoal(form, modal) {
    if (!form) return;
    
    try {
        // Get form data
        const title = form.querySelector('#quick-goal-title').value;
        const type = form.querySelector('#quick-goal-type').value;
        const priority = form.querySelector('#quick-goal-priority').value || 'medium';
        const dueDate = form.querySelector('#quick-goal-due-date').value;
        const tagsInput = form.querySelector('#quick-goal-tags').value;
        
        // Parse tags
        const tags = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
        
        // Create goal object
        const goal = {
            id: generateId(),
            title,
            type,
            priority,
            description: '',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: dueDate || null,
            tags,
            tasks: [],
            linkedTaskIds: [],
            createdAt: new Date().toISOString(),
            completed: false,
            progress: 0
        };
        
        // Save to storage
        const goals = loadGoals();
        goals.push(goal);
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Close modal
        closeModal(modal);
        
        // Show success message
        showToast('Goal added successfully', 'success');
        
        // Refresh goals display
        displayGoals(goals);
        
        // Update stats
        updateGoalStats(goals);
        
        // Sync with other systems
        syncWithMainDashboard();
        syncGoalsWithTasks();
        syncGoalsWithAnalytics();
        
    } catch (error) {
        console.error('Error saving quick goal:', error);
        showToast('Failed to save goal. Please try again.', 'error');
    }
}

/**
 * Toggle goal completion status
 */
function toggleGoalCompletion(goalId, completed) {
    if (!goalId) return;
    
    try {
        // Get the goals from storage
        const goals = loadGoals();
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex === -1) {
            showToast('Goal not found', 'error');
        return;
    }
    
        // Update completion status
        goals[goalIndex].completed = completed;
        
        // Update completion date
        if (completed) {
            goals[goalIndex].completedDate = new Date().toISOString();
            
            // Also complete any linked tasks
            if (goals[goalIndex].linkedTaskIds && goals[goalIndex].linkedTaskIds.length > 0) {
                completeLinkedTasks(goals[goalIndex].linkedTaskIds);
            }
        } else {
            goals[goalIndex].completedDate = null;
        }
        
        // Save to storage
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Show success message
        showToast(`Goal marked as ${completed ? 'completed' : 'in progress'}`, 'success');
        
        // Refresh goals display
        displayGoals(goals);
        
        // Update stats
        updateGoalStats(goals);
        
        // Sync with other systems
        syncWithMainDashboard();
        syncGoalsWithAnalytics();
        
    } catch (error) {
        console.error('Error toggling goal completion:', error);
        showToast('Failed to update goal. Please try again.', 'error');
    }
}

// Create actual tasks from goal tasks for integration
function createTasksFromGoal(goal) {
    // Skip if no tasks or tasks system not available
    if (!goal.tasks || goal.tasks.length === 0) return;
    
    try {
        // Load existing tasks
        const existingTasks = loadTasks();
        
        // Create new task objects from goal tasks
        const newTasks = goal.tasks.map(goalTask => {
            return {
                id: generateId(),
                title: goalTask.title,
                description: `Task for goal: ${goal.title}`,
                dueDate: goal.dueDate,
                priority: goal.priority,
                completed: goalTask.completed,
                goalId: goal.id,
                createdAt: new Date().toISOString(),
                category: 'goal-task'
            };
        });
        
        // Add new tasks to existing tasks
        const updatedTasks = [...existingTasks, ...newTasks];
        
        // Save updated tasks
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Update goal with linked task IDs
        const linkedTaskIds = newTasks.map(task => task.id);
        updateGoalWithLinkedTasks(goal.id, linkedTaskIds);
        
        console.log(`Created ${newTasks.length} tasks from goal '${goal.title}'`);
        
        // Notify tasks system if available
        if (window.updateTaskList && typeof window.updateTaskList === 'function') {
            window.updateTaskList();
        }
    } catch (error) {
        console.error('Error creating tasks from goal:', error);
    }
}

// Update a goal with linked task IDs
function updateGoalWithLinkedTasks(goalId, taskIds) {
    if (!goalId || !taskIds || !Array.isArray(taskIds)) return;
    
    try {
        // Load existing goals
        const goals = loadGoals();
        
        // Find the goal to update
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;
        
        // Update the goal
        goals[goalIndex].linkedTaskIds = goals[goalIndex].linkedTaskIds || [];
        goals[goalIndex].linkedTaskIds = [...goals[goalIndex].linkedTaskIds, ...taskIds];
        
        // Save updated goals
        localStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
        console.error('Error updating goal with linked tasks:', error);
    }
}

// Complete linked tasks when a goal is completed
function completeLinkedTasks(taskIds) {
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) return;
    
    try {
        // Load tasks
        const tasks = loadTasks();
        
        // Mark linked tasks as completed
        let updated = false;
        
        taskIds.forEach(taskId => {
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1 && !tasks[taskIndex].completed) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedAt = new Date().toISOString();
                updated = true;
            }
        });
        
        // Save updated tasks if any changes
        if (updated) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            console.log(`Completed ${taskIds.length} tasks linked to goal`);
            
            // Notify tasks system if available
            if (window.updateTaskList && typeof window.updateTaskList === 'function') {
                window.updateTaskList();
            }
        }
    } catch (error) {
        console.error('Error completing linked tasks:', error);
    }
}

// Enhanced initialization to fully sync with other features
function initGoals() {
    console.log('Initializing Goals Module');
    
    // Close modals
    closeAllModalsAndPopups();
    
    // Create goals container
    const goalsContainer = createGoalsContainer();
    if (!goalsContainer) {
        console.error('Goals container not found');
        return;
    }
    
    // Load goals from storage
    const goals = loadGoals();
    
    // Update stats
    updateGoalStats(goals);
    
    // Set up functionality
    setupDragAndDrop();
    setupEventListeners();
    setupViewToggles();
    setupSearchFunctionality();
    setupSortFunctionality();
    setupSidebarFilters();
    setupTagFilters(goals);
    setupTimelineControls();
    setupGoalListeners();
    
    // Initialize charts
    initializeCharts(goals);
    
    // Display goals
    displayGoals(goals);
    
    // Add direct click handlers to the buttons
    addDirectClickHandlers();
    
    // Sync with other systems
    syncGoalsWithTasks();
    syncGoalsWithAnalytics();
    syncWithMainDashboard();
    
    console.log('Goals module initialized successfully');
}

// Make functions available for integration with other features
window.goalsModule = {
    syncGoalsWithTasks,
    syncGoalsWithAnalytics,
    syncWithMainDashboard,
    updateGoalStats,
    toggleGoalCompletion
};

// ... existing code ...