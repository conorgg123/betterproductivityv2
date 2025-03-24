// Analytics Dashboard Implementation
function initAnalytics() {
    console.log('Initializing Analytics Dashboard...');
    
    // Get DOM elements
    const taskCompletionChart = document.getElementById('task-completion-chart');
    const timeAllocationChart = document.getElementById('time-allocation-chart');
    const productivityScoreChart = document.getElementById('productivity-score-chart');
    const pomodoroStatsChart = document.getElementById('pomodoro-stats-chart');
    const activityTimeline = document.getElementById('activity-timeline');
    const timeRangeSelect = document.getElementById('time-range-select');
    const refreshStatsBtn = document.getElementById('refresh-stats-btn');
    
    // Load statistics with initial range (default: week)
    loadStatistics('week');
    
    // Add event listener for range changes
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            loadStatistics(this.value);
        });
    }
    
    // Add event listener for refresh button
    if (refreshStatsBtn) {
        refreshStatsBtn.addEventListener('click', function() {
            loadStatistics(timeRangeSelect ? timeRangeSelect.value : 'week');
        });
    }
    
    // Function to load all statistics
    function loadStatistics(timeRange) {
        // Get time period dates
        const { startDate, endDate } = getTimePeriod(timeRange);
        
        // Load each chart
        loadTaskCompletionStats(taskCompletionChart, startDate, endDate);
        loadTimeAllocationStats(timeAllocationChart, startDate, endDate);
        loadProductivityScore(productivityScoreChart, startDate, endDate);
        loadPomodoroStats(pomodoroStatsChart, startDate, endDate);
        loadRecentActivity(activityTimeline, 10); // Load last 10 activities
    }
    
    // Helper function to get date range based on selected time period
    function getTimePeriod(period) {
        const now = new Date();
        const endDate = new Date(now);
        let startDate = new Date(now);
        
        switch (period) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7); // Default to week
        }
        
        return { startDate, endDate };
    }
    
    // Load task completion statistics
    function loadTaskCompletionStats(container, startDate, endDate) {
        if (!container) return;
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Filter tasks within date range
        const filteredTasks = tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            return taskDate && taskDate >= startDate && taskDate <= endDate;
        });
        
        // Count completed and incomplete tasks
        const completedTasks = filteredTasks.filter(task => task.completed).length;
        const incompleteTasks = filteredTasks.filter(task => !task.completed).length;
        
        // Calculate completion rate
        const totalTasks = filteredTasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // Create data for the chart
        const data = [
            { label: 'Completed', value: completedTasks, color: 'var(--primary-color)' },
            { label: 'Incomplete', value: incompleteTasks, color: 'var(--border-color)' }
        ];
        
        // Create progress ring
        createProgressRing('task-completion-chart', completionRate, {
            size: 150,
            strokeWidth: 10,
            labelText: 'Tasks Completed'
        });
        
        // Update statistics values
        updateStatValue('total-tasks', totalTasks);
        updateStatValue('completed-tasks', completedTasks);
        updateStatValue('completion-rate', `${Math.round(completionRate)}%`);
        
        // Group tasks by priority
        const priorityData = [];
        const priorities = ['Low', 'Medium', 'High'];
        
        priorities.forEach(priority => {
            const count = filteredTasks.filter(task => task.priority === priority).length;
            let color;
            
            switch (priority) {
                case 'Low':
                    color = '#3B82F6'; // Blue
                    break;
                case 'Medium':
                    color = '#F59E0B'; // Amber
                    break;
                case 'High':
                    color = '#EF4444'; // Red
                    break;
                default:
                    color = 'var(--primary-color)';
            }
            
            priorityData.push({
                label: priority,
                value: count,
                color: color
            });
        });
        
        // Create chart for task priorities in the next container
        if (document.getElementById('task-priority-chart')) {
            createPieChart('task-priority-chart', priorityData, {
                size: 180,
                donut: true,
                valueFormatter: value => value + (value === 1 ? ' task' : ' tasks')
            });
        }
    }
    
    // Load time allocation statistics
    function loadTimeAllocationStats(container, startDate, endDate) {
        if (!container) return;
        
        // Get scheduled items from localStorage
        const scheduledItems = JSON.parse(localStorage.getItem('scheduledItems') || '[]');
        
        // Filter items within date range
        const filteredItems = scheduledItems.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
        
        // Prepare data structure for time categories
        const timeCategories = {
            'Work': { value: 0, color: '#3B82F6' }, // Blue
            'Personal': { value: 0, color: '#8B5CF6' }, // Purple
            'Health': { value: 0, color: '#10B981' }, // Green
            'Education': { value: 0, color: '#F59E0B' }, // Amber
            'Entertainment': { value: 0, color: '#EC4899' }, // Pink
            'Other': { value: 0, color: '#6B7280' } // Gray
        };
        
        // Calculate time spent in each category (in hours)
        filteredItems.forEach(item => {
            const startTime = new Date(`${item.date}T${item.startTime}`);
            const endTime = new Date(`${item.date}T${item.endTime}`);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);
            
            // Add to appropriate category
            if (item.category && timeCategories[item.category]) {
                timeCategories[item.category].value += durationHours;
            } else {
                timeCategories['Other'].value += durationHours;
            }
        });
        
        // Convert to array format for chart
        const timeAllocationData = Object.keys(timeCategories)
            .filter(key => timeCategories[key].value > 0) // Only include categories with values
            .map(key => ({
                label: key,
                value: timeCategories[key].value,
                color: timeCategories[key].color
            }));
        
        // Create pie chart
        if (timeAllocationData.length > 0) {
            createPieChart('time-allocation-chart', timeAllocationData, {
                size: 200,
                donut: true,
                valueFormatter: value => `${value.toFixed(1)}h`
            });
        } else {
            // Show no data message
            container.innerHTML = `
                <div class="no-data">
                    <i class="fa-solid fa-chart-pie no-data-icon"></i>
                    <h3 class="no-data-title">No time data available</h3>
                    <p class="no-data-subtitle">Start scheduling activities in your calendar to see time allocation statistics.</p>
                </div>
            `;
        }
    }
    
    // Load productivity score
    function loadProductivityScore(container, startDate, endDate) {
        if (!container) return;
        
        // Calculate productivity score based on:
        // 1. Task completion rate
        // 2. Time spent on productive activities vs. entertainment
        // 3. Pomodoro sessions completed
        
        // Get data from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const scheduledItems = JSON.parse(localStorage.getItem('scheduledItems') || '[]');
        const pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats') || '[]');
        
        // Filter by date range
        const filteredTasks = tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            return taskDate && taskDate >= startDate && taskDate <= endDate;
        });
        
        const filteredItems = scheduledItems.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
        
        const filteredPomodoros = pomodoroStats.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
        
        // Calculate task completion score (30% of total)
        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(task => task.completed).length;
        const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 30 : 0;
        
        // Calculate time allocation score (40% of total)
        let productiveTime = 0;
        let entertainmentTime = 0;
        let totalTime = 0;
        
        filteredItems.forEach(item => {
            const startTime = new Date(`${item.date}T${item.startTime}`);
            const endTime = new Date(`${item.date}T${item.endTime}`);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);
            
            totalTime += durationHours;
            
            // Consider some categories as productive
            if (['Work', 'Education', 'Health'].includes(item.category)) {
                productiveTime += durationHours;
            } else if (['Entertainment'].includes(item.category)) {
                entertainmentTime += durationHours;
            }
        });
        
        const timeScore = totalTime > 0 ? (productiveTime / totalTime) * 40 : 0;
        
        // Calculate pomodoro score (30% of total)
        const pomodoroCount = filteredPomodoros.length;
        const pomodoroScore = Math.min(pomodoroCount, 10) * 3; // Max 10 pomodoros per period = 30%
        
        // Calculate total productivity score
        const productivityScore = Math.round(taskScore + timeScore + pomodoroScore);
        
        // Create progress ring
        createProgressRing('productivity-score-chart', productivityScore, {
            size: 150,
            strokeWidth: 10,
            labelText: 'Productivity Score',
            color: getScoreColor(productivityScore)
        });
        
        // Update breakdown
        updateStatValue('task-score', `${Math.round(taskScore)}%`);
        updateStatValue('time-score', `${Math.round(timeScore)}%`);
        updateStatValue('pomodoro-score', `${Math.round(pomodoroScore)}%`);
    }
    
    // Load pomodoro statistics
    function loadPomodoroStats(container, startDate, endDate) {
        if (!container) return;
        
        // Get pomodoro stats from localStorage
        const pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats') || '[]');
        
        // Filter by date range
        const filteredStats = pomodoroStats.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
        
        // Group by day
        const days = {};
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        filteredStats.forEach(session => {
            const date = new Date(session.date);
            const day = date.toISOString().split('T')[0];
            
            if (!days[day]) {
                days[day] = {
                    date: day,
                    dayName: dayNames[date.getDay()],
                    sessions: 0,
                    totalMinutes: 0
                };
            }
            
            days[day].sessions += 1;
            days[day].totalMinutes += session.duration;
        });
        
        // Convert to array and sort by date
        const sortedDays = Object.values(days).sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // Prepare data for chart
        const chartData = sortedDays.map(day => ({
            label: day.dayName,
            value: day.sessions,
            color: 'var(--primary-color)'
        }));
        
        // Create bar chart
        if (chartData.length > 0) {
            createBarChart('pomodoro-stats-chart', chartData, {
                height: 200,
                barWidth: 20,
                valueFormatter: value => `${value} ${value === 1 ? 'session' : 'sessions'}`
            });
            
            // Update total stats
            const totalSessions = filteredStats.length;
            const totalMinutes = filteredStats.reduce((sum, session) => sum + session.duration, 0);
            const totalHours = Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            
            updateStatValue('total-pomodoros', totalSessions);
            updateStatValue('total-focus-time', `${totalHours}h ${remainingMinutes}m`);
            updateStatValue('avg-pomodoros', (totalSessions / Math.max(sortedDays.length, 1)).toFixed(1));
        } else {
            // Show no data message
            container.innerHTML = `
                <div class="no-data">
                    <i class="fa-solid fa-clock no-data-icon"></i>
                    <h3 class="no-data-title">No Pomodoro data available</h3>
                    <p class="no-data-subtitle">Start using the Pomodoro Timer to track your focus sessions.</p>
                </div>
            `;
        }
    }
    
    // Load recent activity timeline
    function loadRecentActivity(container, limit = 10) {
        if (!container) return;
        
        // Create an array to hold all activities
        const activities = [];
        
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // Add completed tasks to activities
        tasks.filter(task => task.completed && task.completedAt)
            .forEach(task => {
                activities.push({
                    type: 'task',
                    title: `Completed task: ${task.description}`,
                    date: new Date(task.completedAt),
                    priority: task.priority
                });
            });
        
        // Get pomodoro sessions
        const pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats') || '[]');
        
        // Add pomodoro sessions to activities
        pomodoroStats.forEach(session => {
            activities.push({
                type: 'pomodoro',
                title: `Completed a ${session.duration} min focus session`,
                subtitle: session.task ? `Task: ${session.task}` : null,
                date: new Date(session.date)
            });
        });
        
        // Get YouTube links added
        const youtubeLinks = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        
        // Add recently added YouTube links
        youtubeLinks.forEach(link => {
            activities.push({
                type: 'youtube',
                title: `Added YouTube video: ${link.title}`,
                subtitle: link.category ? `Category: ${link.category}` : null,
                date: new Date(link.dateAdded)
            });
        });
        
        // Sort by date (most recent first)
        activities.sort((a, b) => b.date - a.date);
        
        // Take only the most recent activities
        const recentActivities = activities.slice(0, limit);
        
        // Clear container
        container.innerHTML = '';
        
        // If no activities, show message
        if (recentActivities.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fa-solid fa-list-ul no-data-icon"></i>
                    <h3 class="no-data-title">No recent activities</h3>
                    <p class="no-data-subtitle">Your recent actions will appear here as you use the app.</p>
                </div>
            `;
            return;
        }
        
        // Create timeline
        recentActivities.forEach(activity => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            // Create timeline point with type-specific color
            const pointColor = getActivityTypeColor(activity.type);
            
            timelineItem.innerHTML = `
                <div class="timeline-point" style="background-color: ${pointColor};"></div>
                <div class="timeline-content">
                    <div class="timeline-title">${activity.title}</div>
                    ${activity.subtitle ? `<div class="timeline-subtitle">${activity.subtitle}</div>` : ''}
                    <div class="timeline-meta">
                        <span class="timeline-type ${activity.type}">${capitalizeFirstLetter(activity.type)}</span>
                        <span class="timeline-time">${formatRelativeTime(activity.date)}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(timelineItem);
        });
    }
    
    // Helper function to update statistic value
    function updateStatValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    // Helper function to get color based on score
    function getScoreColor(score) {
        if (score >= 80) return '#10B981'; // Green for excellent
        if (score >= 60) return '#3B82F6'; // Blue for good
        if (score >= 40) return '#F59E0B'; // Amber for average
        return '#EF4444'; // Red for poor
    }
    
    // Helper function to get color for activity type
    function getActivityTypeColor(type) {
        switch (type) {
            case 'task':
                return 'var(--primary-color)';
            case 'pomodoro':
                return '#10B981'; // Green
            case 'youtube':
                return '#EF4444'; // Red
            default:
                return 'var(--text-secondary)';
        }
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Helper function for relative time formatting
    function formatRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
}

// Export the function if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initAnalytics };
} 