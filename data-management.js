// Data Management Module for backup, restore, and export functionality
document.addEventListener('DOMContentLoaded', function() {
    initDataManagement();
});

/**
 * Initialize data management functionality
 */
function initDataManagement() {
    console.log('Initializing data management...');
    
    // Create and add the data management modal to the DOM
    const dataManagementModal = createDataManagementModal();
    document.body.appendChild(dataManagementModal);
    
    // Set up event listeners
    setupDataManagementListeners();
}

/**
 * Create the data management modal
 */
function createDataManagementModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'data-management-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content data-management-modal-content">
            <div class="modal-header">
                <h3>Data Management</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="data-management-sections">
                    <div class="data-section">
                        <h4>Backup & Restore</h4>
                        <p>Create a backup of your data or restore from a previous backup.</p>
                        <div class="data-actions">
                            <button id="create-backup" class="btn-primary">
                                <i class="fas fa-download"></i> Create Backup
                            </button>
                            <button id="restore-backup" class="btn-secondary">
                                <i class="fas fa-upload"></i> Restore from Backup
                            </button>
                            <input type="file" id="restore-file-input" accept=".json" style="display: none;">
                        </div>
                    </div>
                    
                    <div class="data-section">
                        <h4>Export</h4>
                        <p>Export your schedule, tasks, or analytics data in various formats.</p>
                        <div class="export-options">
                            <div class="export-option">
                                <h5>Export Schedule</h5>
                                <div class="export-actions">
                                    <button id="export-schedule-json" class="btn-secondary">
                                        <i class="fas fa-file-code"></i> JSON
                                    </button>
                                    <button id="export-schedule-csv" class="btn-secondary">
                                        <i class="fas fa-file-csv"></i> CSV
                                    </button>
                                    <button id="export-schedule-image" class="btn-secondary">
                                        <i class="fas fa-file-image"></i> Image
                                    </button>
                                    <button id="export-schedule-pdf" class="btn-secondary">
                                        <i class="fas fa-file-pdf"></i> PDF
                                    </button>
                                </div>
                            </div>
                            
                            <div class="export-option">
                                <h5>Export Tasks</h5>
                                <div class="export-actions">
                                    <button id="export-tasks-json" class="btn-secondary">
                                        <i class="fas fa-file-code"></i> JSON
                                    </button>
                                    <button id="export-tasks-csv" class="btn-secondary">
                                        <i class="fas fa-file-csv"></i> CSV
                                    </button>
                                </div>
                            </div>
                            
                            <div class="export-option">
                                <h5>Export Analytics</h5>
                                <div class="export-actions">
                                    <button id="export-analytics-json" class="btn-secondary">
                                        <i class="fas fa-file-code"></i> JSON
                                    </button>
                                    <button id="export-analytics-csv" class="btn-secondary">
                                        <i class="fas fa-file-csv"></i> CSV
                                    </button>
                                    <button id="export-analytics-image" class="btn-secondary">
                                        <i class="fas fa-file-image"></i> Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="data-section">
                        <h4>Data Cleanup</h4>
                        <p>Manage your data by clearing old or completed items.</p>
                        <div class="cleanup-options">
                            <button id="clear-completed-tasks" class="btn-warning">
                                <i class="fas fa-trash-alt"></i> Clear Completed Tasks
                            </button>
                            <button id="clear-old-tasks" class="btn-warning">
                                <i class="fas fa-calendar-times"></i> Clear Tasks Older Than...
                            </button>
                            <button id="reset-all-data" class="btn-danger">
                                <i class="fas fa-exclamation-triangle"></i> Reset All Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Set up event listeners for data management features
 */
function setupDataManagementListeners() {
    // Close modal buttons
    const closeBtn = document.querySelector('#data-management-modal .close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideDataManagementModal);
    }
    
    // Close on outside click
    const modal = document.getElementById('data-management-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideDataManagementModal();
            }
        });
    }
    
    // Backup & Restore
    const createBackupBtn = document.getElementById('create-backup');
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', createBackup);
    }
    
    const restoreBackupBtn = document.getElementById('restore-backup');
    const restoreFileInput = document.getElementById('restore-file-input');
    if (restoreBackupBtn && restoreFileInput) {
        restoreBackupBtn.addEventListener('click', function() {
            restoreFileInput.click();
        });
        
        restoreFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                restoreFromBackup(e.target.files[0]);
            }
        });
    }
    
    // Export buttons
    setupExportListeners();
    
    // Data cleanup buttons
    setupCleanupListeners();
}

/**
 * Setup export button event listeners
 */
function setupExportListeners() {
    // Schedule export
    document.getElementById('export-schedule-json')?.addEventListener('click', () => {
        exportData('schedule', 'json');
    });
    
    document.getElementById('export-schedule-csv')?.addEventListener('click', () => {
        exportData('schedule', 'csv');
    });
    
    document.getElementById('export-schedule-image')?.addEventListener('click', () => {
        exportData('schedule', 'image');
    });
    
    document.getElementById('export-schedule-pdf')?.addEventListener('click', () => {
        exportData('schedule', 'pdf');
    });
    
    // Tasks export
    document.getElementById('export-tasks-json')?.addEventListener('click', () => {
        exportData('tasks', 'json');
    });
    
    document.getElementById('export-tasks-csv')?.addEventListener('click', () => {
        exportData('tasks', 'csv');
    });
    
    // Analytics export
    document.getElementById('export-analytics-json')?.addEventListener('click', () => {
        exportData('analytics', 'json');
    });
    
    document.getElementById('export-analytics-csv')?.addEventListener('click', () => {
        exportData('analytics', 'csv');
    });
    
    document.getElementById('export-analytics-image')?.addEventListener('click', () => {
        exportData('analytics', 'image');
    });
}

/**
 * Setup data cleanup event listeners
 */
function setupCleanupListeners() {
    document.getElementById('clear-completed-tasks')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            clearCompletedTasks();
        }
    });
    
    document.getElementById('clear-old-tasks')?.addEventListener('click', () => {
        const daysOld = prompt('Clear tasks older than how many days?', '30');
        if (daysOld !== null) {
            const days = parseInt(daysOld);
            if (!isNaN(days) && days > 0) {
                clearOldTasks(days);
            } else {
                showToast('Please enter a valid number of days', 'error');
            }
        }
    });
    
    document.getElementById('reset-all-data')?.addEventListener('click', () => {
        if (confirm('WARNING: This will reset ALL your data. This action cannot be undone. Are you sure?')) {
            if (confirm('Are you REALLY sure? All your tasks, reminders, and settings will be lost.')) {
                resetAllData();
            }
        }
    });
}

/**
 * Create a backup of all app data
 */
function createBackup() {
    try {
        // Collect all data from localStorage
        const backup = {};
        const dataKeys = [
            'tasks', 
            'reminders', 
            'notes', 
            'youtubeLinks', 
            'settings', 
            'timeBlocks',
            'taskDependencies',
            'pomodoroSettings',
            'pomodoroHistory',
            'recurringReminders'
        ];
        
        dataKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                backup[key] = JSON.parse(data);
            }
        });
        
        // Add metadata
        backup.metadata = {
            appVersion: '1.0.0',
            backupDate: new Date().toISOString(),
            dataKeys: Object.keys(backup).filter(key => key !== 'metadata')
        };
        
        // Convert to JSON string
        const backupJSON = JSON.stringify(backup, null, 2);
        
        // Create a download link
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(backupJSON);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        
        // Create filename with date
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        downloadAnchor.setAttribute("download", `daily-progress-backup-${formattedDate}.json`);
        
        // Append, click, and remove
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        
        showToast('Backup created successfully', 'success');
    } catch (error) {
        console.error('Error creating backup:', error);
        showToast('Failed to create backup', 'error');
    }
}

/**
 * Restore data from a backup file
 * @param {File} file - The backup file to restore from
 */
function restoreFromBackup(file) {
    try {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                
                // Validate backup format
                if (!backup.metadata) {
                    throw new Error('Invalid backup file format');
                }
                
                // Confirm before restoring
                if (confirm(`This will replace your current data with the backup from ${new Date(backup.metadata.backupDate).toLocaleString()}. Continue?`)) {
                    // Restore each data type
                    const dataKeys = backup.metadata.dataKeys;
                    
                    dataKeys.forEach(key => {
                        if (backup[key]) {
                            localStorage.setItem(key, JSON.stringify(backup[key]));
                        }
                    });
                    
                    showToast('Backup restored successfully. Refreshing page...', 'success');
                    
                    // Refresh the page to load the restored data
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (parseError) {
                console.error('Error parsing backup file:', parseError);
                showToast('Invalid backup file format', 'error');
            }
        };
        
        reader.onerror = function() {
            showToast('Error reading backup file', 'error');
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error('Error restoring backup:', error);
        showToast('Failed to restore backup', 'error');
    }
}

/**
 * Export data in different formats
 * @param {string} dataType - Type of data to export ('schedule', 'tasks', 'analytics')
 * @param {string} format - Format to export as ('json', 'csv', 'image', 'pdf')
 */
function exportData(dataType, format) {
    try {
        switch(format) {
            case 'json':
                exportAsJSON(dataType);
                break;
            case 'csv':
                exportAsCSV(dataType);
                break;
            case 'image':
                exportAsImage(dataType);
                break;
            case 'pdf':
                exportAsPDF(dataType);
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    } catch (error) {
        console.error(`Error exporting ${dataType} as ${format}:`, error);
        showToast(`Failed to export ${dataType}`, 'error');
    }
}

/**
 * Export data as JSON
 * @param {string} dataType - Type of data to export
 */
function exportAsJSON(dataType) {
    let data;
    let filename;
    
    switch(dataType) {
        case 'schedule':
            data = {
                timeBlocks: JSON.parse(localStorage.getItem('timeBlocks') || '[]'),
                exportDate: new Date().toISOString()
            };
            filename = 'schedule-export.json';
            break;
        case 'tasks':
            data = {
                tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
                taskDependencies: JSON.parse(localStorage.getItem('taskDependencies') || '[]'),
                exportDate: new Date().toISOString()
            };
            filename = 'tasks-export.json';
            break;
        case 'analytics':
            data = {
                pomodoroHistory: JSON.parse(localStorage.getItem('pomodoroHistory') || '{}'),
                taskCompletionStats: JSON.parse(localStorage.getItem('taskCompletionStats') || '{}'),
                timeAllocation: JSON.parse(localStorage.getItem('timeAllocation') || '{}'),
                exportDate: new Date().toISOString()
            };
            filename = 'analytics-export.json';
            break;
        default:
            throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    
    // Append, click, and remove
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    
    showToast(`${dataType} exported as JSON successfully`, 'success');
}

/**
 * Export data as CSV
 * @param {string} dataType - Type of data to export
 */
function exportAsCSV(dataType) {
    let csvContent;
    let filename;
    
    switch(dataType) {
        case 'schedule':
            // Get time blocks
            const timeBlocks = JSON.parse(localStorage.getItem('timeBlocks') || '[]');
            
            // Create CSV header
            csvContent = 'Title,Start Time,End Time,Type,Color\n';
            
            // Add each time block as a row
            timeBlocks.forEach(block => {
                const row = [
                    `"${block.title.replace(/"/g, '""')}"`,
                    new Date(block.startTime).toLocaleString(),
                    new Date(block.endTime).toLocaleString(),
                    block.type || 'default',
                    block.color || '#3498db'
                ].join(',');
                csvContent += row + '\n';
            });
            
            filename = 'schedule-export.csv';
            break;
            
        case 'tasks':
            // Get tasks
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            
            // Create CSV header
            csvContent = 'Description,Priority,Category,Due Date,Completed,Date Added\n';
            
            // Add each task as a row
            tasks.forEach(task => {
                const row = [
                    `"${task.description.replace(/"/g, '""')}"`,
                    task.priority || 'medium',
                    task.category || 'default',
                    task.dueDate ? new Date(task.dueDate).toLocaleString() : 'None',
                    task.completed ? 'Yes' : 'No',
                    new Date(task.dateAdded).toLocaleString()
                ].join(',');
                csvContent += row + '\n';
            });
            
            filename = 'tasks-export.csv';
            break;
            
        case 'analytics':
            // Get analytics data
            const pomodoroHistory = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
            
            // Create CSV header
            csvContent = 'Date,Pomodoros Completed\n';
            
            // Add each data point as a row
            Object.entries(pomodoroHistory).forEach(([date, count]) => {
                const row = [date, count].join(',');
                csvContent += row + '\n';
            });
            
            filename = 'analytics-export.csv';
            break;
            
        default:
            throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    // Create download link
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', filename);
    
    // Append, click, and remove
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    
    showToast(`${dataType} exported as CSV successfully`, 'success');
}

/**
 * Export data as an image
 * @param {string} dataType - Type of data to export
 */
function exportAsImage(dataType) {
    // Determine which element to capture based on data type
    let elementToCapture;
    let filename;
    
    switch(dataType) {
        case 'schedule':
            elementToCapture = document.querySelector('.scheduler-container');
            filename = 'schedule-export.png';
            break;
        case 'analytics':
            elementToCapture = document.querySelector('.analytics-dashboard');
            filename = 'analytics-export.png';
            break;
        default:
            throw new Error(`Image export not supported for ${dataType}`);
    }
    
    if (!elementToCapture) {
        throw new Error(`Element to capture not found for ${dataType}`);
    }
    
    // Check if the html2canvas library is available
    if (typeof html2canvas !== 'function') {
        // html2canvas is not available, load it dynamically
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = function() {
            // Once loaded, capture the element
            captureAndDownload(elementToCapture, filename);
        };
        script.onerror = function() {
            showToast('Failed to load image export library', 'error');
        };
        document.head.appendChild(script);
    } else {
        // html2canvas is already available
        captureAndDownload(elementToCapture, filename);
    }
    
    function captureAndDownload(element, filename) {
        html2canvas(element, {
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        }).then(canvas => {
            // Convert canvas to PNG dataURL
            const imageURL = canvas.toDataURL('image/png');
            
            // Create download link
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = imageURL;
            downloadAnchor.download = filename;
            
            // Append, click, and remove
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
            
            showToast(`${dataType} exported as image successfully`, 'success');
        }).catch(error => {
            console.error('Error capturing element:', error);
            showToast('Failed to export as image', 'error');
        });
    }
}

/**
 * Export data as a PDF
 * @param {string} dataType - Type of data to export
 */
function exportAsPDF(dataType) {
    // Only supported for schedule for now
    if (dataType !== 'schedule') {
        throw new Error(`PDF export not supported for ${dataType}`);
    }
    
    const elementToCapture = document.querySelector('.scheduler-container');
    if (!elementToCapture) {
        throw new Error('Scheduler element not found');
    }
    
    // Check if jsPDF and html2canvas libraries are available
    const loadLibraries = [];
    
    if (typeof html2canvas !== 'function') {
        loadLibraries.push(new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        }));
    }
    
    if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
        loadLibraries.push(new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        }));
    }
    
    if (loadLibraries.length > 0) {
        Promise.all(loadLibraries)
            .then(() => generatePDF(elementToCapture))
            .catch(error => {
                console.error('Error loading PDF libraries:', error);
                showToast('Failed to load PDF export libraries', 'error');
            });
    } else {
        generatePDF(elementToCapture);
    }
    
    function generatePDF(element) {
        // First capture the element as an image
        html2canvas(element, {
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        }).then(canvas => {
            // Create PDF
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm'
            });
            
            // Get current date for header
            const today = new Date().toLocaleDateString();
            
            // Add a title
            pdf.setFontSize(18);
            pdf.text('Daily Schedule', 14, 15);
            
            // Add date
            pdf.setFontSize(11);
            pdf.text(`Generated on: ${today}`, 14, 22);
            
            // Calculate dimensions
            const imgWidth = 280; // A4 landscape width in mm - margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add the schedule image
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', 14, 25, imgWidth, imgHeight);
            
            // Save the PDF
            pdf.save('schedule-export.pdf');
            
            showToast('Schedule exported as PDF successfully', 'success');
        }).catch(error => {
            console.error('Error generating PDF:', error);
            showToast('Failed to export as PDF', 'error');
        });
    }
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
    try {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const filteredTasks = tasks.filter(task => !task.completed);
        
        // Only update if there are completed tasks to remove
        if (filteredTasks.length < tasks.length) {
            localStorage.setItem('tasks', JSON.stringify(filteredTasks));
            
            // Refresh tasks display if the function exists
            if (typeof displayTasks === 'function') {
                displayTasks();
            }
            
            showToast(`Cleared ${tasks.length - filteredTasks.length} completed tasks`, 'success');
        } else {
            showToast('No completed tasks to clear', 'info');
        }
    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        showToast('Failed to clear completed tasks', 'error');
    }
}

/**
 * Clear tasks older than specified days
 * @param {number} days - Number of days old to clear
 */
function clearOldTasks(days) {
    try {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.dateAdded);
            return taskDate >= cutoffDate;
        });
        
        // Only update if there are old tasks to remove
        if (filteredTasks.length < tasks.length) {
            localStorage.setItem('tasks', JSON.stringify(filteredTasks));
            
            // Refresh tasks display if the function exists
            if (typeof displayTasks === 'function') {
                displayTasks();
            }
            
            showToast(`Cleared ${tasks.length - filteredTasks.length} old tasks`, 'success');
        } else {
            showToast(`No tasks older than ${days} days found`, 'info');
        }
    } catch (error) {
        console.error('Error clearing old tasks:', error);
        showToast('Failed to clear old tasks', 'error');
    }
}

/**
 * Reset all application data
 */
function resetAllData() {
    try {
        localStorage.clear();
        showToast('All data has been reset. Refreshing page...', 'success');
        
        // Refresh the page to reset the UI
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        console.error('Error resetting data:', error);
        showToast('Failed to reset data', 'error');
    }
}

/**
 * Show data management modal
 */
function showDataManagementModal() {
    const modal = document.getElementById('data-management-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Hide data management modal
 */
function hideDataManagementModal() {
    const modal = document.getElementById('data-management-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
    // Use global toast function if available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Create a toast element if none exists
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

// Export functions for use by other modules
window.initDataManagement = initDataManagement;
window.showDataManagementModal = showDataManagementModal; 