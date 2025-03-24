// Recurring Reminders Implementation
document.addEventListener('DOMContentLoaded', function() {
    initRecurringReminders();
});

/**
 * Initialize recurring reminders functionality
 */
function initRecurringReminders() {
    console.log('Initializing recurring reminders...');
    
    // Add event listeners for recurring options
    setupRecurringOptions();
    
    // Load existing recurring reminders
    loadRecurringReminders();
    
    // Check for due reminders on startup
    checkForDueReminders();
    
    // Set interval to check for due reminders every minute
    setInterval(checkForDueReminders, 60 * 1000);
}

/**
 * Set up recurring options UI elements and listeners
 */
function setupRecurringOptions() {
    // Set up recurring type selector
    const reminderForm = document.querySelector('.reminder-form');
    if (!reminderForm) return;
    
    // Create recurring options if they don't exist
    if (!document.querySelector('.recurring-options')) {
        const recurringOptionsHTML = `
            <div class="recurring-options">
                <h4 class="recurring-options-title">Repeat</h4>
                <div class="recurring-type-selector">
                    <div class="recurring-type-option" data-type="none">
                        <input type="radio" id="recurring-none" name="recurring-type" value="none" checked>
                        <label for="recurring-none">Don't repeat</label>
                    </div>
                    <div class="recurring-type-option" data-type="daily">
                        <input type="radio" id="recurring-daily" name="recurring-type" value="daily">
                        <label for="recurring-daily">Daily</label>
                    </div>
                    <div class="recurring-type-option" data-type="weekly">
                        <input type="radio" id="recurring-weekly" name="recurring-type" value="weekly">
                        <label for="recurring-weekly">Weekly</label>
                    </div>
                    <div class="recurring-type-option" data-type="monthly">
                        <input type="radio" id="recurring-monthly" name="recurring-type" value="monthly">
                        <label for="recurring-monthly">Monthly</label>
                    </div>
                    <div class="recurring-type-option" data-type="yearly">
                        <input type="radio" id="recurring-yearly" name="recurring-type" value="yearly">
                        <label for="recurring-yearly">Yearly</label>
                    </div>
                </div>
                
                <!-- Weekly options (hidden by default) -->
                <div class="recurring-days" style="display: none;">
                    <div class="recurring-day" data-day="0">
                        <input type="checkbox" id="recurring-sun" name="recurring-day" value="0">
                        <label for="recurring-sun">Sun</label>
                    </div>
                    <div class="recurring-day" data-day="1">
                        <input type="checkbox" id="recurring-mon" name="recurring-day" value="1">
                        <label for="recurring-mon">Mon</label>
                    </div>
                    <div class="recurring-day" data-day="2">
                        <input type="checkbox" id="recurring-tue" name="recurring-day" value="2">
                        <label for="recurring-tue">Tue</label>
                    </div>
                    <div class="recurring-day" data-day="3">
                        <input type="checkbox" id="recurring-wed" name="recurring-day" value="3">
                        <label for="recurring-wed">Wed</label>
                    </div>
                    <div class="recurring-day" data-day="4">
                        <input type="checkbox" id="recurring-thu" name="recurring-day" value="4">
                        <label for="recurring-thu">Thu</label>
                    </div>
                    <div class="recurring-day" data-day="5">
                        <input type="checkbox" id="recurring-fri" name="recurring-day" value="5">
                        <label for="recurring-fri">Fri</label>
                    </div>
                    <div class="recurring-day" data-day="6">
                        <input type="checkbox" id="recurring-sat" name="recurring-day" value="6">
                        <label for="recurring-sat">Sat</label>
                    </div>
                </div>
                
                <!-- Monthly options (hidden by default) -->
                <div class="recurring-monthly-options" style="display: none;">
                    <div class="recurring-monthly-option" data-type="day">
                        <input type="radio" id="recurring-monthly-day" name="recurring-monthly-type" value="day" checked>
                        <label for="recurring-monthly-day">On day of month</label>
                    </div>
                    <div class="recurring-monthly-option" data-type="position">
                        <input type="radio" id="recurring-monthly-position" name="recurring-monthly-type" value="position">
                        <label for="recurring-monthly-position">On the
                            <select id="recurring-monthly-position">
                                <option value="1">first</option>
                                <option value="2">second</option>
                                <option value="3">third</option>
                                <option value="4">fourth</option>
                                <option value="-1">last</option>
                            </select>
                            <select id="recurring-monthly-day">
                                <option value="0">Sunday</option>
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                            </select>
                        </label>
                    </div>
                </div>
                
                <!-- End options (hidden by default) -->
                <div class="recurring-end-options" style="display: none;">
                    <h4>End</h4>
                    <div class="recurring-end-option" data-type="never">
                        <input type="radio" id="recurring-end-never" name="recurring-end-type" value="never" checked>
                        <label for="recurring-end-never">Never</label>
                    </div>
                    <div class="recurring-end-option" data-type="count">
                        <input type="radio" id="recurring-end-count" name="recurring-end-type" value="count">
                        <label for="recurring-end-count">After
                            <input type="number" id="recurring-end-count-value" min="1" value="10" disabled>
                            occurrences</label>
                    </div>
                    <div class="recurring-end-option" data-type="date">
                        <input type="radio" id="recurring-end-date" name="recurring-end-type" value="date">
                        <label for="recurring-end-date">On
                            <input type="date" id="recurring-end-date-value" disabled>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Add recurring options to form
        const submitButton = reminderForm.querySelector('button[type="submit"]');
        const formGroup = submitButton.parentElement;
        formGroup.insertAdjacentHTML('beforebegin', recurringOptionsHTML);
        
        // Set up event listeners for recurring type
        const recurringTypeOptions = document.querySelectorAll('.recurring-type-option input');
        recurringTypeOptions.forEach(option => {
            option.addEventListener('change', function() {
                updateRecurringOptions(this.value);
            });
        });
        
        // Set up event listeners for recurring end type
        const recurringEndOptions = document.querySelectorAll('.recurring-end-option input[type="radio"]');
        recurringEndOptions.forEach(option => {
            option.addEventListener('change', function() {
                updateRecurringEndOptions(this.value);
            });
        });
    }
    
    // Override form submission to include recurring options
    const reminderSubmitBtn = reminderForm.querySelector('button[type="submit"]');
    if (reminderSubmitBtn) {
        reminderSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addReminderWithRecurring();
        });
    }
}

/**
 * Update recurring options based on selected type
 * @param {string} type - The recurring type (none, daily, weekly, monthly, yearly)
 */
function updateRecurringOptions(type) {
    const recurringDays = document.querySelector('.recurring-days');
    const recurringMonthlyOptions = document.querySelector('.recurring-monthly-options');
    const recurringEndOptions = document.querySelector('.recurring-end-options');
    
    // Hide all options first
    recurringDays.style.display = 'none';
    recurringMonthlyOptions.style.display = 'none';
    recurringEndOptions.style.display = 'none';
    
    // Show relevant options based on type
    if (type === 'weekly') {
        recurringDays.style.display = 'flex';
        recurringEndOptions.style.display = 'block';
        
        // Check current day of week by default
        const currentDay = new Date().getDay();
        const dayCheckbox = document.querySelector(`.recurring-day[data-day="${currentDay}"] input`);
        if (dayCheckbox && !dayCheckbox.checked) {
            dayCheckbox.checked = true;
        }
    } else if (type === 'monthly') {
        recurringMonthlyOptions.style.display = 'block';
        recurringEndOptions.style.display = 'block';
    } else if (type === 'daily' || type === 'yearly') {
        recurringEndOptions.style.display = 'block';
    }
}

/**
 * Update recurring end options based on selected type
 * @param {string} type - The end type (never, count, date)
 */
function updateRecurringEndOptions(type) {
    const countInput = document.getElementById('recurring-end-count-value');
    const dateInput = document.getElementById('recurring-end-date-value');
    
    // Disable all inputs first
    countInput.disabled = true;
    dateInput.disabled = true;
    
    // Enable relevant input based on type
    if (type === 'count') {
        countInput.disabled = false;
    } else if (type === 'date') {
        dateInput.disabled = false;
        
        // Set default date to 1 month from now if not already set
        if (!dateInput.value) {
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
            const formattedDate = oneMonthFromNow.toISOString().split('T')[0];
            dateInput.value = formattedDate;
        }
    }
}

/**
 * Add reminder with recurring options
 */
function addReminderWithRecurring() {
    const reminderForm = document.querySelector('.reminder-form');
    const titleInput = reminderForm.querySelector('input[name="title"]');
    const datetimeInput = reminderForm.querySelector('input[name="datetime"]');
    
    // Basic validation
    if (!titleInput.value.trim()) {
        showToast('Please enter a reminder title', 'error');
        return;
    }
    
    if (!datetimeInput.value) {
        showToast('Please select a date and time', 'error');
        return;
    }
    
    // Get recurring options
    const recurringType = document.querySelector('input[name="recurring-type"]:checked').value;
    let recurringOptions = {};
    
    if (recurringType !== 'none') {
        // Get end options
        const endType = document.querySelector('input[name="recurring-end-type"]:checked').value;
        recurringOptions.endType = endType;
        
        if (endType === 'count') {
            recurringOptions.endCount = parseInt(document.getElementById('recurring-end-count-value').value);
        } else if (endType === 'date') {
            recurringOptions.endDate = document.getElementById('recurring-end-date-value').value;
        }
        
        // Get type-specific options
        if (recurringType === 'weekly') {
            const selectedDays = [];
            document.querySelectorAll('.recurring-day input:checked').forEach(checkbox => {
                selectedDays.push(parseInt(checkbox.value));
            });
            recurringOptions.days = selectedDays.length > 0 ? selectedDays : [new Date().getDay()];
        } else if (recurringType === 'monthly') {
            const monthlyType = document.querySelector('input[name="recurring-monthly-type"]:checked').value;
            recurringOptions.monthlyType = monthlyType;
            
            if (monthlyType === 'position') {
                recurringOptions.position = document.getElementById('recurring-monthly-position').value;
                recurringOptions.day = document.getElementById('recurring-monthly-day').value;
            }
        }
    }
    
    // Create reminder object
    const reminder = {
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        datetime: datetimeInput.value,
        isCompleted: false,
        isRecurring: recurringType !== 'none',
        recurringType: recurringType,
        recurringOptions: recurringOptions,
        createdAt: new Date().toISOString()
    };
    
    // Save reminder to localStorage
    saveReminder(reminder);
    
    // Reset form
    reminderForm.reset();
    
    // Show success message
    showToast('Reminder created successfully', 'success');
    
    // Reload reminders
    loadReminders();
}

/**
 * Save reminder to localStorage
 * @param {Object} reminder - The reminder object to save
 */
function saveReminder(reminder) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    reminders.push(reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

/**
 * Load existing reminders
 */
function loadRecurringReminders() {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const recurringReminders = reminders.filter(reminder => reminder.isRecurring);
    
    console.log(`Loaded ${recurringReminders.length} recurring reminders`);
}

/**
 * Check for due reminders and send notifications
 */
function checkForDueReminders() {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const now = new Date();
    
    reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.datetime);
        
        // Check if reminder is due (within the last minute)
        if (!reminder.isCompleted && reminderDate <= now && reminderDate > new Date(now - 60 * 1000)) {
            // Send notification
            sendReminderNotification(reminder);
            
            // If recurring, generate next occurrence
            if (reminder.isRecurring) {
                generateNextOccurrence(reminder);
            }
            
            // Mark as completed
            reminder.isCompleted = true;
        }
    });
    
    // Save updated reminders
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

/**
 * Send notification for a due reminder
 * @param {Object} reminder - The reminder object
 */
function sendReminderNotification(reminder) {
    // Browser notification
    if (Notification.permission === 'granted') {
        new Notification(reminder.title, {
            body: `Reminder at ${new Date(reminder.datetime).toLocaleTimeString()}`,
            icon: 'assets/icons/reminder-icon.png'
        });
    }
    
    // In-app notification
    showToast(`Reminder: ${reminder.title}`, 'info');
    
    // Play sound if enabled
    const playSound = localStorage.getItem('reminderSound') === 'true';
    if (playSound) {
        const audio = new Audio('assets/sounds/notification.mp3');
        audio.play();
    }
}

/**
 * Generate next occurrence for a recurring reminder
 * @param {Object} reminder - The recurring reminder object
 */
function generateNextOccurrence(reminder) {
    const reminderDate = new Date(reminder.datetime);
    let nextDate = null;
    
    // Calculate next date based on recurring type
    switch (reminder.recurringType) {
        case 'daily':
            nextDate = new Date(reminderDate);
            nextDate.setDate(nextDate.getDate() + 1);
            break;
            
        case 'weekly':
            nextDate = getNextWeeklyOccurrence(reminderDate, reminder.recurringOptions.days);
            break;
            
        case 'monthly':
            nextDate = getNextMonthlyOccurrence(reminderDate, reminder.recurringOptions);
            break;
            
        case 'yearly':
            nextDate = new Date(reminderDate);
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    
    if (nextDate) {
        // Check if we should create the next occurrence based on end rules
        const shouldCreateNext = shouldCreateNextOccurrence(reminder, nextDate);
        
        if (shouldCreateNext) {
            // Create new reminder for next occurrence
            const nextReminder = { ...reminder };
            nextReminder.id = Date.now().toString();
            nextReminder.datetime = nextDate.toISOString();
            nextReminder.isCompleted = false;
            
            // If end type is count, decrement the count
            if (reminder.recurringOptions.endType === 'count') {
                nextReminder.recurringOptions = { ...reminder.recurringOptions };
                nextReminder.recurringOptions.endCount--;
            }
            
            // Save to localStorage
            saveReminder(nextReminder);
        }
    }
}

/**
 * Get next weekly occurrence based on selected days
 * @param {Date} currentDate - The current reminder date
 * @param {Array} selectedDays - Array of selected days (0-6)
 * @returns {Date} The next occurrence date
 */
function getNextWeeklyOccurrence(currentDate, selectedDays) {
    // Sort days to ensure we find the next one
    const sortedDays = [...selectedDays].sort((a, b) => a - b);
    
    const currentDay = currentDate.getDay();
    let nextDay = null;
    
    // Find the next day in the selected days
    for (const day of sortedDays) {
        if (day > currentDay) {
            nextDay = day;
            break;
        }
    }
    
    // If no next day found, take the first day from next week
    if (nextDay === null && sortedDays.length > 0) {
        nextDay = sortedDays[0];
        nextDay += 7; // Add a week
    }
    
    // Calculate days to add
    const daysToAdd = nextDay - currentDay;
    
    // Create next date
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
}

/**
 * Get next monthly occurrence based on options
 * @param {Date} currentDate - The current reminder date
 * @param {Object} options - Monthly recurring options
 * @returns {Date} The next occurrence date
 */
function getNextMonthlyOccurrence(currentDate, options) {
    const nextDate = new Date(currentDate);
    
    // Move to next month
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    if (options.monthlyType === 'day') {
        // Keep the same day of month
        // If the day doesn't exist in the next month, use the last day
        const day = currentDate.getDate();
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(day, lastDayOfMonth));
    } else if (options.monthlyType === 'position') {
        const position = parseInt(options.position);
        const dayOfWeek = parseInt(options.day);
        
        // Reset to first day of month
        nextDate.setDate(1);
        
        // Find the first occurrence of the day
        while (nextDate.getDay() !== dayOfWeek) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        
        // Adjust for position
        if (position > 0) {
            // Add (position - 1) weeks
            nextDate.setDate(nextDate.getDate() + (position - 1) * 7);
        } else if (position === -1) {
            // Find the last occurrence of the day in the month
            let tempDate = new Date(nextDate);
            
            // Keep moving forward by a week until we go past the end of the month
            while (true) {
                tempDate.setDate(tempDate.getDate() + 7);
                if (tempDate.getMonth() !== nextDate.getMonth()) {
                    break;
                }
                nextDate.setDate(nextDate.getDate() + 7);
            }
        }
    }
    
    return nextDate;
}

/**
 * Check if we should create the next occurrence based on end rules
 * @param {Object} reminder - The reminder object
 * @param {Date} nextDate - The next occurrence date
 * @returns {boolean} Whether to create the next occurrence
 */
function shouldCreateNextOccurrence(reminder, nextDate) {
    const options = reminder.recurringOptions;
    const endType = options.endType || 'never';
    
    if (endType === 'never') {
        return true;
    } else if (endType === 'count') {
        return options.endCount > 1;
    } else if (endType === 'date') {
        const endDate = new Date(options.endDate);
        return nextDate <= endDate;
    }
    
    return false;
}

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info, warning)
 */
function showToast(message, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create a simple toast if the global function doesn't exist
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show and then hide the toast
        setTimeout(() => {
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 10);
    }
}

// Export for use in other modules
window.initRecurringReminders = initRecurringReminders; 