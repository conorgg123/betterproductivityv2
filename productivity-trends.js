// Productivity Trends Module
document.addEventListener('DOMContentLoaded', function() {
    initProductivityTrends();
});

/**
 * Initialize productivity trends functionality
 */
function initProductivityTrends() {
    console.log('Initializing productivity trends...');
    
    // Add trends section to analytics
    addProductivityTrendsSection();
    
    // Set up event listeners
    setupTrendsListeners();
    
    // Load initial data
    loadProductivityData();
}

/**
 * Add productivity trends section to analytics
 */
function addProductivityTrendsSection() {
    const analyticsSection = document.getElementById('analytics-section');
    if (!analyticsSection) {
        console.error('Analytics section not found');
        return;
    }
    
    // Create trends card
    const trendsCard = document.createElement('div');
    trendsCard.className = 'analytics-card trends-card';
    trendsCard.innerHTML = `
        <div class="card-header">
            <h3>Productivity Trends</h3>
            <div class="card-actions">
                <select id="trends-timeframe" class="select-input">
                    <option value="7">Last 7 Days</option>
                    <option value="14">Last 14 Days</option>
                    <option value="30" selected>Last 30 Days</option>
                    <option value="90">Last Quarter</option>
                </select>
            </div>
        </div>
        <div class="card-content">
            <div class="trends-tabs">
                <button class="trends-tab active" data-trend="tasks">Tasks</button>
                <button class="trends-tab" data-trend="pomodoro">Pomodoro</button>
                <button class="trends-tab" data-trend="focus">Focus Time</button>
                <button class="trends-tab" data-trend="breaks">Breaks</button>
            </div>
            
            <div class="trends-container">
                <div id="trends-chart-container" class="trends-chart-container">
                    <canvas id="trends-chart"></canvas>
                </div>
                
                <div class="trends-summary">
                    <div class="trends-stat">
                        <span class="trends-stat-label">Average Daily</span>
                        <span id="avg-daily" class="trends-stat-value">0</span>
                    </div>
                    <div class="trends-stat">
                        <span class="trends-stat-label">Total</span>
                        <span id="total-count" class="trends-stat-value">0</span>
                    </div>
                    <div class="trends-stat">
                        <span class="trends-stat-label">Trend</span>
                        <span id="trend-value" class="trends-stat-value">
                            <i class="fa-solid fa-arrow-trend-up trend-up"></i> 0%
                        </span>
                    </div>
                </div>
                
                <div class="trends-insights">
                    <h4>Insights</h4>
                    <ul id="trends-insights-list">
                        <li>No insights available yet</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Add to analytics section after stats cards
    const statsCards = analyticsSection.querySelectorAll('.statistics-card');
    if (statsCards.length > 0) {
        statsCards[statsCards.length - 1].after(trendsCard);
    } else {
        analyticsSection.appendChild(trendsCard);
    }
    
    // Load Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        loadScript('https://cdn.jsdelivr.net/npm/chart.js')
            .then(() => {
                // Set Chart.js default options after loading
                Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
                Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue('font-family').trim();
            })
            .catch(error => {
                console.error('Failed to load Chart.js:', error);
            });
    }
}

/**
 * Set up event listeners for trends functionality
 */
function setupTrendsListeners() {
    // Tab switching
    document.addEventListener('click', function(e) {
        const tab = e.target.closest('.trends-tab');
        if (tab) {
            const trendType = tab.getAttribute('data-trend');
            
            // Update active tab
            const tabs = document.querySelectorAll('.trends-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Load data for selected trend
            loadProductivityData(trendType);
        }
    });
    
    // Timeframe change
    document.addEventListener('change', function(e) {
        if (e.target.id === 'trends-timeframe') {
            const activeTab = document.querySelector('.trends-tab.active');
            const trendType = activeTab ? activeTab.getAttribute('data-trend') : 'tasks';
            
            // Load data with new timeframe
            loadProductivityData(trendType);
        }
    });
}

/**
 * Load productivity data and update chart
 * @param {string} trendType - Type of trend to display (tasks, pomodoro, focus, breaks)
 */
function loadProductivityData(trendType = 'tasks') {
    const timeframeSelect = document.getElementById('trends-timeframe');
    const days = parseInt(timeframeSelect ? timeframeSelect.value : 30);
    
    // Get data based on trend type
    let data;
    switch (trendType) {
        case 'tasks':
            data = getTasksData(days);
            break;
        case 'pomodoro':
            data = getPomodoroData(days);
            break;
        case 'focus':
            data = getFocusTimeData(days);
            break;
        case 'breaks':
            data = getBreaksData(days);
            break;
        default:
            data = getTasksData(days);
    }
    
    // Update chart
    updateTrendsChart(data, trendType);
    
    // Update summary stats
    updateTrendsSummary(data, trendType);
    
    // Generate insights
    generateInsights(data, trendType, days);
}

/**
 * Get tasks data for the specified number of days
 * @param {number} days - Number of days to include
 * @returns {Object} Data object with labels and values
 */
function getTasksData(days) {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize data arrays
    const labels = [];
    const completed = [];
    const added = [];
    
    // Fill in each day
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Format date for label (e.g. "Jun 15")
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        labels.push(label);
        
        // Format date for comparison (YYYY-MM-DD)
        const dateString = date.toISOString().split('T')[0];
        
        // Count completed tasks for this day
        const completedCount = tasks.filter(task => {
            return task.completed && task.completedAt && task.completedAt.startsWith(dateString);
        }).length;
        
        // Count added tasks for this day
        const addedCount = tasks.filter(task => {
            return task.createdAt && task.createdAt.startsWith(dateString);
        }).length;
        
        completed.push(completedCount);
        added.push(addedCount);
    }
    
    return {
        labels,
        datasets: [
            {
                label: 'Completed Tasks',
                data: completed,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)'
            },
            {
                label: 'Added Tasks',
                data: added,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)'
            }
        ]
    };
}

/**
 * Get Pomodoro data for the specified number of days
 * @param {number} days - Number of days to include
 * @returns {Object} Data object with labels and values
 */
function getPomodoroData(days) {
    // Get pomodoro sessions from localStorage
    const pomodoroSessions = JSON.parse(localStorage.getItem('pomodoroHistory') || '[]');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize data arrays
    const labels = [];
    const sessionsCount = [];
    const focusMinutes = [];
    
    // Fill in each day
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Format date for label (e.g. "Jun 15")
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        labels.push(label);
        
        // Format date for comparison (YYYY-MM-DD)
        const dateString = date.toISOString().split('T')[0];
        
        // Count pomodoro sessions for this day
        const daySessions = pomodoroSessions.filter(session => {
            return session.date && session.date.startsWith(dateString);
        });
        
        const count = daySessions.length;
        
        // Calculate total focus minutes
        const minutes = daySessions.reduce((total, session) => {
            return total + (session.duration || 25);
        }, 0);
        
        sessionsCount.push(count);
        focusMinutes.push(minutes);
    }
    
    return {
        labels,
        datasets: [
            {
                label: 'Pomodoro Sessions',
                data: sessionsCount,
                borderColor: '#FF5722',
                backgroundColor: 'rgba(255, 87, 34, 0.2)',
                yAxisID: 'y'
            },
            {
                label: 'Focus Minutes',
                data: focusMinutes,
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                yAxisID: 'y1'
            }
        ]
    };
}

/**
 * Get focus time data for the specified number of days
 * @param {number} days - Number of days to include
 * @returns {Object} Data object with labels and values
 */
function getFocusTimeData(days) {
    // Get focus time logs from localStorage
    const focusLogs = JSON.parse(localStorage.getItem('focusLogs') || '[]');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize data arrays
    const labels = [];
    const focusMinutes = [];
    
    // Fill in each day
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Format date for label (e.g. "Jun 15")
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        labels.push(label);
        
        // Format date for comparison (YYYY-MM-DD)
        const dateString = date.toISOString().split('T')[0];
        
        // Count focus time for this day
        const dayLogs = focusLogs.filter(log => {
            return log.date && log.date.startsWith(dateString);
        });
        
        // Calculate total focus minutes
        const minutes = dayLogs.reduce((total, log) => {
            return total + (log.duration || 0);
        }, 0);
        
        focusMinutes.push(minutes);
    }
    
    return {
        labels,
        datasets: [
            {
                label: 'Focus Minutes',
                data: focusMinutes,
                borderColor: '#3F51B5',
                backgroundColor: 'rgba(63, 81, 181, 0.2)',
                fill: true
            }
        ]
    };
}

/**
 * Get breaks data for the specified number of days
 * @param {number} days - Number of days to include
 * @returns {Object} Data object with labels and values
 */
function getBreaksData(days) {
    // Get break logs from localStorage
    const breakLogs = JSON.parse(localStorage.getItem('breakLog') || '[]');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize data arrays
    const labels = [];
    const breakCounts = [];
    const breakMinutes = [];
    
    // Fill in each day
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Format date for label (e.g. "Jun 15")
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        labels.push(label);
        
        // Format date for comparison (YYYY-MM-DD)
        const dateString = date.toISOString().split('T')[0];
        
        // Count breaks for this day
        const dayBreaks = breakLogs.filter(log => {
            return log.timestamp && log.timestamp.startsWith(dateString);
        });
        
        const count = dayBreaks.length;
        
        // Calculate total break minutes
        const minutes = dayBreaks.reduce((total, log) => {
            return total + (log.duration || 0);
        }, 0);
        
        breakCounts.push(count);
        breakMinutes.push(minutes);
    }
    
    return {
        labels,
        datasets: [
            {
                label: 'Break Count',
                data: breakCounts,
                borderColor: '#009688',
                backgroundColor: 'rgba(0, 150, 136, 0.2)',
                yAxisID: 'y'
            },
            {
                label: 'Break Minutes',
                data: breakMinutes,
                borderColor: '#8BC34A',
                backgroundColor: 'rgba(139, 195, 74, 0.2)',
                yAxisID: 'y1'
            }
        ]
    };
}

/**
 * Update trends chart with new data
 * @param {Object} data - Chart data
 * @param {string} trendType - Type of trend
 */
function updateTrendsChart(data, trendType) {
    const chartCanvas = document.getElementById('trends-chart');
    if (!chartCanvas) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.trendsChart) {
        window.trendsChart.destroy();
    }
    
    // Configure chart options based on trend type
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: getYAxisTitle(trendType, 'primary')
                }
            }
        }
    };
    
    // Add second y-axis for certain trend types
    if (trendType === 'pomodoro' || trendType === 'breaks') {
        options.scales.y1 = {
            position: 'right',
            beginAtZero: true,
            title: {
                display: true,
                text: getYAxisTitle(trendType, 'secondary')
            },
            grid: {
                drawOnChartArea: false
            }
        };
    }
    
    // Create new chart
    window.trendsChart = new Chart(chartCanvas, {
        type: trendType === 'focus' ? 'line' : 'bar',
        data: data,
        options: options
    });
}

/**
 * Get y-axis title based on trend type
 * @param {string} trendType - Type of trend
 * @param {string} axis - Which axis (primary or secondary)
 * @returns {string} Axis title
 */
function getYAxisTitle(trendType, axis) {
    switch (trendType) {
        case 'tasks':
            return 'Task Count';
        case 'pomodoro':
            return axis === 'primary' ? 'Sessions' : 'Minutes';
        case 'focus':
            return 'Minutes';
        case 'breaks':
            return axis === 'primary' ? 'Break Count' : 'Minutes';
        default:
            return '';
    }
}

/**
 * Update summary statistics
 * @param {Object} data - Chart data
 * @param {string} trendType - Type of trend
 */
function updateTrendsSummary(data, trendType) {
    // Get the primary dataset (first one)
    const primaryData = data.datasets[0].data;
    
    // Calculate statistics
    const total = primaryData.reduce((sum, value) => sum + value, 0);
    const average = total / primaryData.length;
    
    // Calculate trend (comparing first half to second half)
    const midpoint = Math.floor(primaryData.length / 2);
    const firstHalf = primaryData.slice(0, midpoint);
    const secondHalf = primaryData.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
    
    let trendPercentage = 0;
    if (firstHalfAvg > 0) {
        trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    } else if (secondHalfAvg > 0) {
        trendPercentage = 100; // If first half was 0 and second half has values, 100% increase
    }
    
    // Update UI
    const avgDaily = document.getElementById('avg-daily');
    const totalCount = document.getElementById('total-count');
    const trendValue = document.getElementById('trend-value');
    
    if (avgDaily) {
        avgDaily.textContent = average.toFixed(1);
    }
    
    if (totalCount) {
        totalCount.textContent = total;
    }
    
    if (trendValue) {
        const trendIcon = trendPercentage >= 0 
            ? '<i class="fa-solid fa-arrow-trend-up trend-up"></i>' 
            : '<i class="fa-solid fa-arrow-trend-down trend-down"></i>';
        
        trendValue.innerHTML = `${trendIcon} ${Math.abs(trendPercentage).toFixed(1)}%`;
    }
}

/**
 * Generate insights based on the data
 * @param {Object} data - Chart data
 * @param {string} trendType - Type of trend
 * @param {number} days - Number of days in the timeframe
 */
function generateInsights(data, trendType, days) {
    const insightsList = document.getElementById('trends-insights-list');
    if (!insightsList) return;
    
    // Clear existing insights
    insightsList.innerHTML = '';
    
    // Get the primary dataset values
    const values = data.datasets[0].data;
    
    // Get labels (dates)
    const labels = data.labels;
    
    // Generate insights based on trend type
    const insights = [];
    
    // Check if we have enough data
    if (values.length < 3) {
        insights.push('Not enough data to generate insights. Continue tracking your progress.');
    } else {
        // Find most productive day
        const maxValue = Math.max(...values);
        const maxIndex = values.indexOf(maxValue);
        if (maxValue > 0) {
            const trendName = getTrendName(trendType);
            insights.push(`Your most productive day was <strong>${labels[maxIndex]}</strong> with <strong>${maxValue} ${trendName}</strong>.`);
        }
        
        // Detect upward/downward trends
        const recentTrend = detectTrend(values.slice(-7));
        if (recentTrend === 'up') {
            insights.push('You have an <strong>upward trend</strong> in the last week. Keep up the good work!');
        } else if (recentTrend === 'down') {
            insights.push('Your productivity has been <strong>declining</strong> in the last week. Consider setting some new goals.');
        }
        
        // Check for consistency
        const consistency = calculateConsistency(values);
        if (consistency > 0.7) {
            insights.push('You have been <strong>highly consistent</strong> in your productivity. Well done!');
        } else if (consistency < 0.3) {
            insights.push('Your productivity shows <strong>high variability</strong>. Try to establish a more consistent routine.');
        }
        
        // Check for zero-productivity days
        const zeroDays = values.filter(v => v === 0).length;
        const zeroPercentage = (zeroDays / values.length) * 100;
        if (zeroPercentage > 30) {
            insights.push(`You had <strong>no activity</strong> on ${zeroDays} days (${zeroPercentage.toFixed(0)}% of the time). Try to maintain regular activity.`);
        }
        
        // Add trending times for focus sessions (if applicable)
        if (trendType === 'pomodoro' || trendType === 'focus') {
            const focusLogs = JSON.parse(localStorage.getItem('focusLogs') || '[]');
            if (focusLogs.length > 5) {
                const timeDistribution = analyzeTimeDistribution(focusLogs);
                insights.push(`Your most productive time of day is typically <strong>${timeDistribution}</strong>.`);
            }
        }
    }
    
    // Update the insights list
    if (insights.length === 0) {
        insights.push('Continue tracking your productivity to see insights here.');
    }
    
    insights.forEach(insight => {
        const li = document.createElement('li');
        li.innerHTML = insight;
        insightsList.appendChild(li);
    });
}

/**
 * Get friendly name for trend type
 * @param {string} trendType - Type of trend
 * @returns {string} User-friendly name
 */
function getTrendName(trendType) {
    switch (trendType) {
        case 'tasks':
            return 'tasks completed';
        case 'pomodoro':
            return 'pomodoro sessions';
        case 'focus':
            return 'minutes of focus time';
        case 'breaks':
            return 'breaks taken';
        default:
            return 'items';
    }
}

/**
 * Detect trend direction in an array of values
 * @param {Array} values - Array of numeric values
 * @returns {string} Trend direction ('up', 'down', or 'neutral')
 */
function detectTrend(values) {
    if (values.length < 3) return 'neutral';
    
    let increases = 0;
    let decreases = 0;
    
    for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i-1]) {
            increases++;
        } else if (values[i] < values[i-1]) {
            decreases++;
        }
    }
    
    const total = increases + decreases;
    if (total === 0) return 'neutral';
    
    const increaseRatio = increases / total;
    
    if (increaseRatio > 0.6) {
        return 'up';
    } else if (increaseRatio < 0.4) {
        return 'down';
    } else {
        return 'neutral';
    }
}

/**
 * Calculate consistency score for an array of values
 * @param {Array} values - Array of numeric values
 * @returns {number} Consistency score (0-1)
 */
function calculateConsistency(values) {
    if (values.length < 2) return 1;
    
    const nonZeroValues = values.filter(v => v > 0);
    if (nonZeroValues.length === 0) return 1;
    
    const average = nonZeroValues.reduce((sum, v) => sum + v, 0) / nonZeroValues.length;
    const squareDiffs = nonZeroValues.map(v => (v - average) ** 2);
    const variance = squareDiffs.reduce((sum, v) => sum + v, 0) / nonZeroValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate coefficient of variation (lower means more consistent)
    const cv = stdDev / average;
    
    // Convert to a 0-1 score (0 = inconsistent, 1 = consistent)
    return Math.max(0, Math.min(1, 1 - cv));
}

/**
 * Analyze the time distribution of focus sessions
 * @param {Array} logs - Array of focus session logs
 * @returns {string} Most productive time period
 */
function analyzeTimeDistribution(logs) {
    // Define time periods
    const periods = {
        'morning': 0,
        'afternoon': 0,
        'evening': 0,
        'night': 0
    };
    
    // Count sessions in each period
    logs.forEach(log => {
        if (!log.timestamp) return;
        
        const date = new Date(log.timestamp);
        const hour = date.getHours();
        
        if (hour >= 5 && hour < 12) {
            periods.morning += 1;
        } else if (hour >= 12 && hour < 17) {
            periods.afternoon += 1;
        } else if (hour >= 17 && hour < 21) {
            periods.evening += 1;
        } else {
            periods.night += 1;
        }
    });
    
    // Find period with highest count
    let maxPeriod = 'morning';
    let maxCount = periods.morning;
    
    for (const [period, count] of Object.entries(periods)) {
        if (count > maxCount) {
            maxPeriod = period;
            maxCount = count;
        }
    }
    
    return maxPeriod;
}

/**
 * Helper function to load external script
 * @param {string} url - URL of the script to load
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Export for use in app.js
window.initProductivityTrends = initProductivityTrends; 