// Export Options Module
document.addEventListener('DOMContentLoaded', function() {
    initExportOptions();
});

/**
 * Initialize export options functionality
 */
function initExportOptions() {
    console.log('Initializing enhanced export options...');
    
    // Add export options to the data settings card
    addExportOptions();
    
    // Set up event listeners
    setupExportListeners();
}

/**
 * Add export options to the data settings card
 */
function addExportOptions() {
    // Find the export data button in the settings
    const exportDataBtn = document.getElementById('export-data');
    if (!exportDataBtn) {
        console.error('Export data button not found');
        return;
    }
    
    // Get the parent settings item
    const settingsItem = exportDataBtn.closest('.settings-item');
    if (!settingsItem) {
        console.error('Settings item not found');
        return;
    }
    
    // Create export options dropdown
    const exportOptionsBtn = document.createElement('button');
    exportOptionsBtn.id = 'export-options-btn';
    exportOptionsBtn.className = 'settings-btn';
    exportOptionsBtn.innerHTML = '<i class="fa-solid fa-ellipsis-h"></i>';
    
    // Create the dropdown menu
    const exportDropdown = document.createElement('div');
    exportDropdown.className = 'export-dropdown';
    exportDropdown.id = 'export-dropdown';
    exportDropdown.innerHTML = `
        <div class="export-dropdown-menu">
            <button class="export-option" data-type="json">
                <i class="fa-solid fa-file-code"></i> Export as JSON
            </button>
            <button class="export-option" data-type="pdf">
                <i class="fa-solid fa-file-pdf"></i> Export Schedule as PDF
            </button>
            <button class="export-option" data-type="image">
                <i class="fa-solid fa-file-image"></i> Export Schedule as Image
            </button>
            <button class="export-option" data-type="csv">
                <i class="fa-solid fa-file-csv"></i> Export Tasks as CSV
            </button>
            <button class="export-option" data-type="calendar">
                <i class="fa-solid fa-calendar"></i> Export to Calendar (.ics)
            </button>
        </div>
    `;
    
    // Add dropdown to the settings item
    const settingsControl = settingsItem.querySelector('.settings-control');
    settingsControl.innerHTML = ''; // Clear the existing content
    settingsControl.appendChild(exportOptionsBtn);
    settingsControl.appendChild(exportDropdown);
    
    // Update the export settings item label
    const settingsLabel = settingsItem.querySelector('.settings-label');
    if (settingsLabel) {
        settingsLabel.innerHTML = `
            <h4>Export Data</h4>
            <p>Download your data in various formats</p>
        `;
    }
}

/**
 * Set up event listeners for export functionality
 */
function setupExportListeners() {
    // Toggle export options dropdown
    document.addEventListener('click', function(e) {
        const exportBtn = e.target.closest('#export-options-btn');
        if (exportBtn) {
            const dropdown = document.getElementById('export-dropdown');
            dropdown.classList.toggle('show');
            e.stopPropagation();
        } else if (!e.target.closest('.export-dropdown')) {
            // Close dropdown when clicking outside
            const dropdown = document.getElementById('export-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });
    
    // Handle export option selection
    document.addEventListener('click', function(e) {
        const exportOption = e.target.closest('.export-option');
        if (exportOption) {
            const exportType = exportOption.getAttribute('data-type');
            
            // Close the dropdown
            const dropdown = document.getElementById('export-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
            
            // Handle different export types
            switch (exportType) {
                case 'json':
                    exportAsJSON();
                    break;
                case 'pdf':
                    exportAsPDF();
                    break;
                case 'image':
                    exportAsImage();
                    break;
                case 'csv':
                    exportAsCSV();
                    break;
                case 'calendar':
                    exportAsICS();
                    break;
            }
        }
    });
}

/**
 * Export data as JSON file
 */
function exportAsJSON() {
    // Collect all data from localStorage
    const data = {};
    
    // Get all data that should be exported
    const keysToExport = [
        'tasks',
        'reminders',
        'youtubeLinks',
        'youtubeCategories',
        'timeBlocks',
        'pomodoroSettings',
        'pomodoroHistory',
        'notes',
        'goals',
        'workflowTemplates',
        'achievements',
        'breakSettings',
        'breakLog'
    ];
    
    // Add each key to the data object
    keysToExport.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                data[key] = JSON.parse(value);
            } catch (e) {
                data[key] = value;
            }
        }
    });
    
    // Add export metadata
    data.exportDate = new Date().toISOString();
    data.appVersion = '1.0.0';
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-progress-export-${formatDateForFilename(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showToast('Data exported as JSON successfully', 'success');
}

/**
 * Export schedule as PDF
 */
function exportAsPDF() {
    // Show loading toast
    showToast('Generating PDF...', 'info');
    
    // Load html2pdf library if not already loaded
    if (typeof html2pdf === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
            .then(() => {
                generatePDF();
            })
            .catch(error => {
                console.error('Failed to load html2pdf library:', error);
                showToast('Failed to load PDF generation library', 'error');
            });
    } else {
        generatePDF();
    }
    
    function generatePDF() {
        // Create a copy of the scheduler section to modify for PDF
        const scheduler = document.getElementById('scheduler-section');
        if (!scheduler) {
            showToast('Scheduler section not found', 'error');
            return;
        }
        
        const pdfContent = scheduler.cloneNode(true);
        
        // Remove any unnecessary elements for the PDF
        pdfContent.querySelectorAll('button, .add-time-block').forEach(el => el.remove());
        
        // Create a container for the PDF content
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-export-container';
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.top = '0';
        
        // Add a header with title and date
        const header = document.createElement('div');
        header.className = 'pdf-header';
        header.innerHTML = `
            <h1>Daily Progress Schedule</h1>
            <p>Exported on ${new Date().toLocaleDateString()}</p>
        `;
        
        // Add the header and content to the container
        pdfContainer.appendChild(header);
        pdfContainer.appendChild(pdfContent);
        
        // Add to document temporarily for conversion
        document.body.appendChild(pdfContainer);
        
        // Configure PDF options
        const options = {
            margin: 10,
            filename: `schedule-${formatDateForFilename(new Date())}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        // Generate the PDF
        html2pdf().from(pdfContainer).set(options).save()
            .then(() => {
                // Clean up
                document.body.removeChild(pdfContainer);
                showToast('Schedule exported as PDF successfully', 'success');
            })
            .catch(error => {
                console.error('PDF generation failed:', error);
                document.body.removeChild(pdfContainer);
                showToast('Failed to generate PDF', 'error');
            });
    }
}

/**
 * Export schedule as image
 */
function exportAsImage() {
    // Show loading toast
    showToast('Generating image...', 'info');
    
    // Load html2canvas library if not already loaded
    if (typeof html2canvas === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
            .then(() => {
                generateImage();
            })
            .catch(error => {
                console.error('Failed to load html2canvas library:', error);
                showToast('Failed to load image generation library', 'error');
            });
    } else {
        generateImage();
    }
    
    function generateImage() {
        // Get the scheduler section
        const scheduler = document.getElementById('scheduler-section');
        if (!scheduler) {
            showToast('Scheduler section not found', 'error');
            return;
        }
        
        // Create a clone of the scheduler to modify for the image
        const imageContent = scheduler.cloneNode(true);
        
        // Remove any unnecessary elements for the image
        imageContent.querySelectorAll('button, .add-time-block').forEach(el => el.remove());
        
        // Create a container for the image content
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-export-container';
        imageContainer.style.position = 'absolute';
        imageContainer.style.left = '-9999px';
        imageContainer.style.top = '0';
        imageContainer.style.width = '1200px'; // Fixed width for better quality
        
        // Add a header with title and date
        const header = document.createElement('div');
        header.className = 'image-header';
        header.innerHTML = `
            <h1>Daily Progress Schedule</h1>
            <p>Exported on ${new Date().toLocaleDateString()}</p>
        `;
        
        // Add the header and content to the container
        imageContainer.appendChild(header);
        imageContainer.appendChild(imageContent);
        
        // Add to document temporarily for conversion
        document.body.appendChild(imageContainer);
        
        // Generate the image
        html2canvas(imageContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Create download link
            const imageUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `schedule-${formatDateForFilename(new Date())}.png`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            document.body.removeChild(imageContainer);
            
            showToast('Schedule exported as image successfully', 'success');
        }).catch(error => {
            console.error('Image generation failed:', error);
            document.body.removeChild(imageContainer);
            showToast('Failed to generate image', 'error');
        });
    }
}

/**
 * Export tasks as CSV
 */
function exportAsCSV() {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    if (tasks.length === 0) {
        showToast('No tasks to export', 'warning');
        return;
    }
    
    // Create CSV header row
    let csvContent = 'Title,Description,Priority,Category,Due Date,Completed,Completion Date\n';
    
    // Add each task as a row
    tasks.forEach(task => {
        // Format values for CSV (escape commas and quotes)
        const title = formatCSVField(task.title);
        const description = formatCSVField(task.description || '');
        const priority = formatCSVField(task.priority || 'medium');
        const category = formatCSVField(task.category || 'General');
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
        const completed = task.completed ? 'Yes' : 'No';
        const completionDate = task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '';
        
        // Add row to CSV
        csvContent += `${title},${description},${priority},${category},${dueDate},${completed},${completionDate}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${formatDateForFilename(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showToast('Tasks exported as CSV successfully', 'success');
}

/**
 * Export schedule items to iCalendar (.ics) format
 */
function exportAsICS() {
    // Show loading toast
    showToast('Generating calendar file...', 'info');
    
    // Collect all schedulable items
    const timeBlocks = JSON.parse(localStorage.getItem('timeBlocks') || '[]');
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    
    if (timeBlocks.length === 0 && reminders.length === 0) {
        showToast('No schedule items to export', 'warning');
        return;
    }
    
    // Generate iCalendar content
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Daily Progress Tracker//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];
    
    // Add time blocks as events
    timeBlocks.forEach(block => {
        if (!block.startTime || !block.endTime) return;
        
        const startDate = new Date(block.startTime);
        const endDate = new Date(block.endTime);
        
        // Format dates for iCal (YYYYMMDDTHHMMSSZ)
        const start = formatDateForICS(startDate);
        const end = formatDateForICS(endDate);
        
        // Create event
        icsContent = icsContent.concat([
            'BEGIN:VEVENT',
            `UID:timeblock-${block.id}@dailyprogress`,
            `DTSTAMP:${formatDateForICS(new Date())}`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${formatICSField(block.title)}`,
            `DESCRIPTION:${formatICSField(block.description || '')}`,
            `CATEGORIES:${block.type || 'Time Block'}`,
            'END:VEVENT'
        ]);
    });
    
    // Add reminders as events
    reminders.forEach(reminder => {
        if (!reminder.datetime) return;
        
        const startDate = new Date(reminder.datetime);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 30); // Default 30 min duration for reminders
        
        // Format dates for iCal
        const start = formatDateForICS(startDate);
        const end = formatDateForICS(endDate);
        
        // Create event with alarm
        icsContent = icsContent.concat([
            'BEGIN:VEVENT',
            `UID:reminder-${reminder.id}@dailyprogress`,
            `DTSTAMP:${formatDateForICS(new Date())}`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${formatICSField(reminder.title)}`,
            'BEGIN:VALARM',
            'ACTION:DISPLAY',
            'DESCRIPTION:Reminder',
            'TRIGGER:-PT15M', // 15 minute reminder
            'END:VALARM',
            'END:VEVENT'
        ]);
    });
    
    // Close calendar
    icsContent.push('END:VCALENDAR');
    
    // Join with line breaks
    const icsString = icsContent.join('\r\n');
    
    // Create a blob and download link
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${formatDateForFilename(new Date())}.ics`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showToast('Schedule exported to calendar format successfully', 'success');
}

/**
 * Helper function to format date for filename
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Helper function to format date for iCalendar
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string for iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatDateForICS(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
}

/**
 * Helper function to format field for CSV
 * @param {string} field - Field value to format
 * @returns {string} Formatted field for CSV
 */
function formatCSVField(field) {
    if (field === null || field === undefined) return '';
    
    const stringValue = String(field);
    
    // If the field contains quotes or commas, enclose it in quotes and escape any quotes
    if (stringValue.includes('"') || stringValue.includes(',')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
}

/**
 * Helper function to format field for iCalendar
 * @param {string} field - Field value to format
 * @returns {string} Formatted field for iCalendar
 */
function formatICSField(field) {
    if (field === null || field === undefined) return '';
    
    // Replace special characters
    return String(field)
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
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
window.initExportOptions = initExportOptions; 