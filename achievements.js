// Achievements and Badges Module
document.addEventListener('DOMContentLoaded', function() {
    initAchievements();
});

/**
 * Initialize achievements functionality
 */
function initAchievements() {
    console.log('Initializing achievements system...');
    
    // Create and add achievements modal to the DOM
    const achievementsModal = createAchievementsModal();
    document.body.appendChild(achievementsModal);
    
    // Set up event listeners
    setupAchievementListeners();
    
    // Check for new achievements
    checkForAchievements();
    
    // Schedule regular achievement checks
    setInterval(checkForAchievements, 3600000); // Check every hour
    
    // Add achievements menu item to settings
    addAchievementsMenuItem();
}

/**
 * Create achievements modal
 */
function createAchievementsModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'achievements-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content achievements-modal-content">
            <div class="modal-header">
                <h3>Achievements & Badges</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="achievements-stats">
                    <div class="achievement-stat">
                        <span id="achievements-earned" class="achievement-stat-value">0</span>
                        <span class="achievement-stat-label">Earned</span>
                    </div>
                    <div class="achievement-stat">
                        <span id="achievements-total" class="achievement-stat-value">0</span>
                        <span class="achievement-stat-label">Total</span>
                    </div>
                    <div class="achievement-stat">
                        <span id="achievements-percentage" class="achievement-stat-value">0%</span>
                        <span class="achievement-stat-label">Completed</span>
                    </div>
                </div>
                
                <div class="achievements-filter">
                    <button class="achievement-filter-btn active" data-filter="all">All</button>
                    <button class="achievement-filter-btn" data-filter="earned">Earned</button>
                    <button class="achievement-filter-btn" data-filter="locked">Locked</button>
                </div>
                
                <div class="achievements-grid" id="achievements-list">
                    <!-- Achievements will be loaded here dynamically -->
                </div>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Add achievements menu item to settings
 */
function addAchievementsMenuItem() {
    // Find the productivity settings card
    const productivityCard = document.querySelector('.settings-card:last-child .settings-group');
    
    if (!productivityCard) {
        console.error('Could not find productivity settings card');
        return;
    }
    
    // Create the achievements menu item
    const achievementsItem = document.createElement('div');
    achievementsItem.className = 'settings-item';
    
    achievementsItem.innerHTML = `
        <div class="settings-label">
            <h4>Achievements & Badges</h4>
            <p>Track your progress and earn achievements</p>
        </div>
        <div class="settings-control">
            <button id="view-achievements-btn" class="settings-btn">
                <i class="fa-solid fa-trophy"></i> View
            </button>
        </div>
    `;
    
    // Add the item to the settings card
    productivityCard.appendChild(achievementsItem);
}

/**
 * Set up event listeners for achievements
 */
function setupAchievementListeners() {
    // Open achievements modal
    document.addEventListener('click', function(e) {
        if (e.target.id === 'view-achievements-btn' || e.target.closest('#view-achievements-btn')) {
            openAchievementsModal();
        }
    });
    
    // Close modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') && e.target.closest('#achievements-modal')) {
            closeAchievementsModal();
        }
    });
    
    // Close on outside click
    const achievementsModal = document.getElementById('achievements-modal');
    if (achievementsModal) {
        achievementsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAchievementsModal();
            }
        });
    }
    
    // Achievement filter buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('achievement-filter-btn')) {
            const filterBtns = document.querySelectorAll('.achievement-filter-btn');
            filterBtns.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.getAttribute('data-filter');
            filterAchievements(filter);
        }
    });
}

/**
 * Open achievements modal and load achievements
 */
function openAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    if (modal) {
        loadAchievements();
        modal.style.display = 'block';
    }
}

/**
 * Close achievements modal
 */
function closeAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Load achievements into the modal
 */
function loadAchievements() {
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) return;
    
    // Get achievements from localStorage or create default ones if they don't exist
    let achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    
    if (achievements.length === 0) {
        achievements = createDefaultAchievements();
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
    
    // Count earned achievements
    const earnedCount = achievements.filter(a => a.earned).length;
    const totalCount = achievements.length;
    const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
    
    // Update stats
    document.getElementById('achievements-earned').textContent = earnedCount;
    document.getElementById('achievements-total').textContent = totalCount;
    document.getElementById('achievements-percentage').textContent = `${percentage}%`;
    
    // Sort achievements: pinned first, then earned, then locked
    achievements.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return 0;
    });
    
    // Generate HTML for each achievement
    const achievementsHTML = achievements.map(achievement => {
        const earnedDate = achievement.earnedDate ? new Date(achievement.earnedDate).toLocaleDateString() : null;
        
        return `
            <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}" data-id="${achievement.id}">
                <div class="achievement-icon ${achievement.earned ? '' : 'locked'}">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-details">
                    <h4 class="achievement-title">${achievement.title}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    ${achievement.earned ? 
                        `<div class="achievement-earned-date">Earned on ${earnedDate}</div>` : 
                        `<div class="achievement-progress">
                            <div class="achievement-progress-bar">
                                <div class="achievement-progress-fill" style="width: ${achievement.progress || 0}%"></div>
                            </div>
                            <div class="achievement-progress-text">${achievement.progress || 0}%</div>
                        </div>`
                    }
                </div>
                ${achievement.earned ? 
                    `<div class="achievement-badge">
                        <i class="fa-solid fa-award"></i>
                    </div>` : ''
                }
            </div>
        `;
    }).join('');
    
    achievementsList.innerHTML = achievementsHTML;
}

/**
 * Filter achievements by earned/locked status
 * @param {string} filter - Filter type ('all', 'earned', or 'locked')
 */
function filterAchievements(filter) {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    achievementCards.forEach(card => {
        if (filter === 'all' || 
            (filter === 'earned' && card.classList.contains('earned')) || 
            (filter === 'locked' && !card.classList.contains('earned'))) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Create default achievements
 * @returns {Array} Default achievements
 */
function createDefaultAchievements() {
    return [
        {
            id: 'first-task',
            title: 'First Steps',
            description: 'Create your first task',
            icon: 'fa-solid fa-shoe-prints',
            category: 'tasks',
            earned: false,
            progress: 0,
            condition: {
                type: 'taskCount',
                target: 1
            }
        },
        {
            id: 'task-master',
            title: 'Task Master',
            description: 'Complete 50 tasks',
            icon: 'fa-solid fa-list-check',
            category: 'tasks',
            earned: false,
            progress: 0,
            condition: {
                type: 'completedTaskCount',
                target: 50
            }
        },
        {
            id: 'productivity-guru',
            title: 'Productivity Guru',
            description: 'Complete 10 pomodoro sessions in a single day',
            icon: 'fa-solid fa-clock',
            category: 'pomodoro',
            earned: false,
            progress: 0,
            condition: {
                type: 'pomodoroInDay',
                target: 10
            }
        },
        {
            id: 'early-bird',
            title: 'Early Bird',
            description: 'Start a task before 7 AM',
            icon: 'fa-solid fa-sun',
            category: 'tasks',
            earned: false,
            progress: 0,
            condition: {
                type: 'taskStartBefore',
                target: '07:00'
            }
        },
        {
            id: 'night-owl',
            title: 'Night Owl',
            description: 'Complete a task after 10 PM',
            icon: 'fa-solid fa-moon',
            category: 'tasks',
            earned: false,
            progress: 0,
            condition: {
                type: 'taskCompletedAfter',
                target: '22:00'
            }
        },
        {
            id: 'scheduler',
            title: 'Master Scheduler',
            description: 'Create 10 time blocks in a single week',
            icon: 'fa-solid fa-calendar-days',
            category: 'scheduler',
            earned: false,
            progress: 0,
            condition: {
                type: 'timeBlocksInWeek',
                target: 10
            }
        },
        {
            id: 'goal-setter',
            title: 'Goal Setter',
            description: 'Create your first goal',
            icon: 'fa-solid fa-bullseye',
            category: 'goals',
            earned: false,
            progress: 0,
            condition: {
                type: 'goalCount',
                target: 1
            }
        },
        {
            id: 'achiever',
            title: 'Achiever',
            description: 'Complete 5 goals',
            icon: 'fa-solid fa-trophy',
            category: 'goals',
            earned: false,
            progress: 0,
            condition: {
                type: 'completedGoalCount',
                target: 5
            }
        },
        {
            id: 'consistent',
            title: 'Consistent',
            description: 'Use the app for 7 consecutive days',
            icon: 'fa-solid fa-calendar-check',
            category: 'general',
            earned: false,
            progress: 0,
            condition: {
                type: 'consecutiveDays',
                target: 7
            }
        },
        {
            id: 'note-taker',
            title: 'Note Taker',
            description: 'Create 10 notes',
            icon: 'fa-solid fa-note-sticky',
            category: 'notes',
            earned: false,
            progress: 0,
            condition: {
                type: 'noteCount',
                target: 10
            }
        }
    ];
}

/**
 * Check for new achievements
 */
function checkForAchievements() {
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    
    if (achievements.length === 0) return;
    
    let achievementsUpdated = false;
    
    // Check each achievement
    achievements.forEach(achievement => {
        if (achievement.earned) return; // Skip already earned achievements
        
        const { progress, earned } = evaluateAchievement(achievement);
        
        // Update achievement progress
        if (progress !== achievement.progress || earned !== achievement.earned) {
            achievement.progress = progress;
            
            if (earned && !achievement.earned) {
                achievement.earned = true;
                achievement.earnedDate = new Date().toISOString();
                showAchievementNotification(achievement);
                achievementsUpdated = true;
            } else if (progress !== achievement.progress) {
                achievementsUpdated = true;
            }
        }
    });
    
    // Save updated achievements
    if (achievementsUpdated) {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
    
    // Track app usage for consecutive days achievement
    trackAppUsage();
}

/**
 * Evaluate an achievement's progress and earned status
 * @param {Object} achievement - Achievement to evaluate
 * @returns {Object} Updated progress and earned status
 */
function evaluateAchievement(achievement) {
    const condition = achievement.condition;
    if (!condition) return { progress: 0, earned: false };
    
    switch (condition.type) {
        case 'taskCount':
            return evaluateTaskCount(condition.target);
            
        case 'completedTaskCount':
            return evaluateCompletedTaskCount(condition.target);
            
        case 'pomodoroInDay':
            return evaluatePomodoroInDay(condition.target);
            
        case 'taskStartBefore':
            return evaluateTaskStartBefore(condition.target);
            
        case 'taskCompletedAfter':
            return evaluateTaskCompletedAfter(condition.target);
            
        case 'timeBlocksInWeek':
            return evaluateTimeBlocksInWeek(condition.target);
            
        case 'goalCount':
            return evaluateGoalCount(condition.target);
            
        case 'completedGoalCount':
            return evaluateCompletedGoalCount(condition.target);
            
        case 'consecutiveDays':
            return evaluateConsecutiveDays(condition.target);
            
        case 'noteCount':
            return evaluateNoteCount(condition.target);
            
        default:
            return { progress: 0, earned: false };
    }
}

/**
 * Evaluate total task count achievement
 * @param {number} target - Target task count
 * @returns {Object} Progress and earned status
 */
function evaluateTaskCount(target) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const count = tasks.length;
    const progress = Math.min(Math.round((count / target) * 100), 100);
    const earned = count >= target;
    
    return { progress, earned };
}

/**
 * Evaluate completed task count achievement
 * @param {number} target - Target completed task count
 * @returns {Object} Progress and earned status
 */
function evaluateCompletedTaskCount(target) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const count = tasks.filter(task => task.completed).length;
    const progress = Math.min(Math.round((count / target) * 100), 100);
    const earned = count >= target;
    
    return { progress, earned };
}

/**
 * Evaluate pomodoro sessions in a day achievement
 * @param {number} target - Target pomodoro sessions
 * @returns {Object} Progress and earned status
 */
function evaluatePomodoroInDay(target) {
    const pomodoroHistory = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const todayCount = pomodoroHistory[today] || 0;
    
    const progress = Math.min(Math.round((todayCount / target) * 100), 100);
    const earned = todayCount >= target;
    
    return { progress, earned };
}

/**
 * Evaluate task started before specified time achievement
 * @param {string} targetTime - Target time (HH:MM)
 * @returns {Object} Progress and earned status
 */
function evaluateTaskStartBefore(targetTime) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const timeBlocks = JSON.parse(localStorage.getItem('timeBlocks') || '[]');
    
    // Check if any task was started before the target time
    let earned = false;
    
    // Check in time blocks first
    for (const block of timeBlocks) {
        if (block.type === 'task') {
            const blockTime = new Date(block.startTime);
            const blockHours = blockTime.getHours();
            const blockMinutes = blockTime.getMinutes();
            
            const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
            
            if (blockHours < targetHours || (blockHours === targetHours && blockMinutes < targetMinutes)) {
                earned = true;
                break;
            }
        }
    }
    
    // If not found in time blocks, check task start times
    if (!earned) {
        for (const task of tasks) {
            if (task.startTime) {
                const taskTime = new Date(task.startTime);
                const taskHours = taskTime.getHours();
                const taskMinutes = taskTime.getMinutes();
                
                const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
                
                if (taskHours < targetHours || (taskHours === targetHours && taskMinutes < targetMinutes)) {
                    earned = true;
                    break;
                }
            }
        }
    }
    
    return { progress: earned ? 100 : 0, earned };
}

/**
 * Evaluate task completed after specified time achievement
 * @param {string} targetTime - Target time (HH:MM)
 * @returns {Object} Progress and earned status
 */
function evaluateTaskCompletedAfter(targetTime) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Check if any task was completed after the target time
    let earned = false;
    
    for (const task of tasks) {
        if (task.completed && task.completedAt) {
            const taskTime = new Date(task.completedAt);
            const taskHours = taskTime.getHours();
            const taskMinutes = taskTime.getMinutes();
            
            const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
            
            if (taskHours > targetHours || (taskHours === targetHours && taskMinutes > targetMinutes)) {
                earned = true;
                break;
            }
        }
    }
    
    return { progress: earned ? 100 : 0, earned };
}

/**
 * Evaluate time blocks in a week achievement
 * @param {number} target - Target time block count
 * @returns {Object} Progress and earned status
 */
function evaluateTimeBlocksInWeek(target) {
    const timeBlocks = JSON.parse(localStorage.getItem('timeBlocks') || '[]');
    
    // Get the start of the current week (Sunday)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Count time blocks created this week
    const thisWeekBlocks = timeBlocks.filter(block => {
        const blockDate = new Date(block.startTime);
        return blockDate >= startOfWeek;
    });
    
    const count = thisWeekBlocks.length;
    const progress = Math.min(Math.round((count / target) * 100), 100);
    const earned = count >= target;
    
    return { progress, earned };
}

/**
 * Evaluate goal count achievement
 * @param {number} target - Target goal count
 * @returns {Object} Progress and earned status
 */
function evaluateGoalCount(target) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const count = goals.length;
    const progress = Math.min(Math.round((count / target) * 100), 100);
    const earned = count >= target;
    
    return { progress, earned };
}

/**
 * Evaluate completed goal count achievement
 * @param {number} target - Target completed goal count
 * @returns {Object} Progress and earned status
 */
function evaluateCompletedGoalCount(target) {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const count = goals.filter(goal => goal.completed).length;
    const progress = Math.min(Math.round((count / target) * 100), 100);
    const earned = count >= target;
    
    return { progress, earned };
}

/**
 * Evaluate consecutive days achievement
 * @param {number} target - Target consecutive days
 * @returns {Object} Progress and earned status
 */
function evaluateConsecutiveDays(target) {
    const appUsage = JSON.parse(localStorage.getItem('appUsage') || '{}');
    const dates = Object.keys(appUsage).sort();
    
    if (dates.length === 0) {
        return { progress: 0, earned: false };
    }
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i-1]);
        const currDate = new Date(dates[i]);
        
        // Check if dates are consecutive
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentConsecutive++;
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
            currentConsecutive = 1;
        }
    }
    
    const progress = Math.min(Math.round((maxConsecutive / target) * 100), 100);
    const earned = maxConsecutive >= target;
    
    return { progress, earned };
}

/**
 * Evaluate note count achievement
 * @param {number} target - Target note count
 * @returns {Object} Progress and earned status
 */
function evaluateNoteCount(target) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const count = notes.length;
    const progress = Math.min(Math.round((count / target) * 100), 100);
    const earned = count >= target;
    
    return { progress, earned };
}

/**
 * Track app usage for consecutive days achievement
 */
function trackAppUsage() {
    const today = new Date().toISOString().split('T')[0];
    const appUsage = JSON.parse(localStorage.getItem('appUsage') || '{}');
    
    if (!appUsage[today]) {
        appUsage[today] = true;
        localStorage.setItem('appUsage', JSON.stringify(appUsage));
    }
}

/**
 * Show a notification when an achievement is earned
 * @param {Object} achievement - Earned achievement
 */
function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    notification.innerHTML = `
        <div class="achievement-notification-icon">
            <i class="${achievement.icon}"></i>
        </div>
        <div class="achievement-notification-content">
            <div class="achievement-notification-title">Achievement Unlocked!</div>
            <div class="achievement-notification-name">${achievement.title}</div>
            <div class="achievement-notification-desc">${achievement.description}</div>
        </div>
        <button class="achievement-notification-close">&times;</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
        
        // Add close button event
        const closeButton = notification.querySelector('.achievement-notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }, 100);
    
    // Play notification sound if available
    if (typeof playNotificationSound === 'function') {
        playNotificationSound();
    }
}

/**
 * Play a notification sound
 */
function playNotificationSound() {
    // Check if notification sounds are enabled
    const soundEnabled = localStorage.getItem('notificationSound') === 'true';
    if (!soundEnabled) return;
    
    // Create audio element
    const audio = new Audio('assets/achievement-sound.mp3');
    
    // Fallback to a basic sound if the file is not found
    audio.onerror = function() {
        try {
            const fallbackAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhMxZIatlWExFgkTLj9KVGBocH2Lk5yFcVZJVzE0SessionHaSoqGqxeDo1043JVxwpsr2ybigmZOMe2ddVUSWpqzO69zuzIhrTkIcBBEpSGRwdG1PMw0Mf4qVub2wuaWhgG5qZTcZLz9CRVlnd296kJigkYaEgHFdVEEvLDRCWWBnb3N9lZR1XElLFCgnMRIEChwzKBMTJCYmHiY6TF1maHWEiZaFelX///8=');
            fallbackAudio.play();
        } catch (error) {
            console.error('Could not play notification sound', error);
        }
    };
    
    // Try to play the audio
    audio.play().catch(error => {
        console.error('Could not play notification sound', error);
    });
}

// Export for use in app.js
window.initAchievements = initAchievements;
window.checkForAchievements = checkForAchievements; 