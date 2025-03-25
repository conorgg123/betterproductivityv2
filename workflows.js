// Customizable Workflows Module
document.addEventListener('DOMContentLoaded', function() {
    initWorkflows();
});

/**
 * Initialize workflows functionality
 */
function initWorkflows() {
    console.log('Initializing workflows functionality...');
    
    // Create and add workflow modal to the DOM
    const workflowModal = createWorkflowModal();
    document.body.appendChild(workflowModal);
    
    // Set up event listeners
    setupWorkflowListeners();
    
    // Create workflow menu in settings section
    createWorkflowSettings();
    
    // Load saved workflow templates
    loadWorkflowTemplates();
}

/**
 * Create workflow modal for saving/loading templates
 */
function createWorkflowModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'workflow-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content workflow-modal-content">
            <div class="modal-header">
                <h3 id="workflow-modal-title">Save Current Layout as Template</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="workflow-form">
                    <input type="hidden" id="workflow-action" value="save">
                    
                    <div class="form-group">
                        <label for="workflow-name">Template Name</label>
                        <input type="text" id="workflow-name" placeholder="e.g., Work Day, Focus Session, Weekend" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="workflow-description">Description (Optional)</label>
                        <textarea id="workflow-description" placeholder="Describe this workflow template..." rows="2"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>What to include:</label>
                        <div class="workflow-include-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-schedule" checked>
                                <span>Schedule</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-tasks" checked>
                                <span>Tasks</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-reminders">
                                <span>Reminders</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="include-pomodoro">
                                <span>Pomodoro Settings</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="workflow-preview">
                        <div class="workflow-preview-header">
                            <h4>Preview</h4>
                            <span id="workflow-preview-count"></span>
                        </div>
                        <div id="workflow-preview-container" class="workflow-preview-container">
                            <!-- Preview content will be added here dynamically -->
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancel-workflow">Cancel</button>
                        <button type="submit" class="btn-primary">Save Template</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Create workflow settings section in the settings panel
 */
function createWorkflowSettings() {
    // Find the settings section
    const settingsSection = document.getElementById('settings-section');
    if (!settingsSection) {
        console.error('Settings section not found');
        return;
    }
    
    // Check if the workflow settings card already exists
    if (document.getElementById('workflow-settings-card')) {
        return;
    }
    
    // Create workflows settings card
    const workflowsCard = document.createElement('div');
    workflowsCard.id = 'workflow-settings-card';
    workflowsCard.className = 'settings-card card';
    
    workflowsCard.innerHTML = `
        <div class="card-header">
            <h3>Workflow Templates</h3>
        </div>
        <div class="settings-content">
            <div class="settings-group">
                <div class="settings-item">
                    <div class="settings-label">
                        <h4>Saved Templates</h4>
                        <p>Save and load different workflow setups for various needs</p>
                    </div>
                    <div class="settings-control">
                        <button id="save-workflow-btn" class="btn-primary">
                            <i class="fas fa-save"></i> Save Current Layout
                        </button>
                    </div>
                </div>
                
                <div id="workflow-templates-list" class="workflow-templates-list">
                    <!-- Templates will be added here dynamically -->
                    <div class="empty-templates">
                        <p>No saved templates yet. Save your current layout to create your first template.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to settings section
    const settingsGrid = settingsSection.querySelector('.settings-grid');
    if (settingsGrid) {
        settingsGrid.appendChild(workflowsCard);
    } else {
        settingsSection.appendChild(workflowsCard);
    }
}

/**
 * Set up event listeners for workflows functionality
 */
function setupWorkflowListeners() {
    // Save workflow button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'save-workflow-btn' || e.target.closest('#save-workflow-btn')) {
            showSaveWorkflowModal();
        }
    });
    
    // Close workflow modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || e.target.id === 'cancel-workflow') {
            hideWorkflowModal();
        }
    });
    
    // Close on outside click
    const workflowModal = document.getElementById('workflow-modal');
    if (workflowModal) {
        workflowModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideWorkflowModal();
            }
        });
    }
    
    // Workflow form submission
    const workflowForm = document.getElementById('workflow-form');
    if (workflowForm) {
        workflowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const action = document.getElementById('workflow-action').value;
            
            if (action === 'save') {
                saveWorkflowTemplate();
            } else if (action === 'apply') {
                applyWorkflowTemplate();
            }
        });
    }
    
    // Workflow template include options change
    document.addEventListener('change', function(e) {
        if (e.target.id === 'include-schedule' || 
            e.target.id === 'include-tasks' || 
            e.target.id === 'include-reminders' || 
            e.target.id === 'include-pomodoro') {
            updateWorkflowPreview();
        }
    });
    
    // Load, edit, and delete template actions
    document.addEventListener('click', function(e) {
        // Load template
        if (e.target.classList.contains('load-template-btn') || e.target.closest('.load-template-btn')) {
            const button = e.target.classList.contains('load-template-btn') ? e.target : e.target.closest('.load-template-btn');
            const templateId = button.getAttribute('data-id');
            
            showApplyWorkflowModal(templateId);
        }
        
        // Edit template
        if (e.target.classList.contains('edit-template-btn') || e.target.closest('.edit-template-btn')) {
            const button = e.target.classList.contains('edit-template-btn') ? e.target : e.target.closest('.edit-template-btn');
            const templateId = button.getAttribute('data-id');
            
            showEditWorkflowModal(templateId);
        }
        
        // Delete template
        if (e.target.classList.contains('delete-template-btn') || e.target.closest('.delete-template-btn')) {
            const button = e.target.classList.contains('delete-template-btn') ? e.target : e.target.closest('.delete-template-btn');
            const templateId = button.getAttribute('data-id');
            
            deleteWorkflowTemplate(templateId);
        }
    });
}

/**
 * Show modal for saving a workflow template
 */
function showSaveWorkflowModal() {
    const modal = document.getElementById('workflow-modal');
    const modalTitle = document.getElementById('workflow-modal-title');
    const workflowForm = document.getElementById('workflow-form');
    
    if (modal && modalTitle && workflowForm) {
        // Reset form
        workflowForm.reset();
        document.getElementById('workflow-action').value = 'save';
        
        // Set title
        modalTitle.textContent = 'Save Current Layout as Template';
        
        // Show modal
        modal.style.display = 'block';
        
        // Update preview
        updateWorkflowPreview();
    }
}

/**
 * Show modal for applying a workflow template
 * @param {string} templateId - ID of the template to apply
 */
function showApplyWorkflowModal(templateId) {
    const template = getWorkflowTemplate(templateId);
    if (!template) return;
    
    const modal = document.getElementById('workflow-modal');
    const modalTitle = document.getElementById('workflow-modal-title');
    const workflowForm = document.getElementById('workflow-form');
    
    if (modal && modalTitle && workflowForm) {
        // Reset form
        workflowForm.reset();
        document.getElementById('workflow-action').value = 'apply';
        document.getElementById('workflow-name').value = template.name;
        document.getElementById('workflow-description').value = template.description || '';
        
        // Set include options based on template
        document.getElementById('include-schedule').checked = template.includeSchedule;
        document.getElementById('include-tasks').checked = template.includeTasks;
        document.getElementById('include-reminders').checked = template.includeReminders;
        document.getElementById('include-pomodoro').checked = template.includePomodoro;
        
        // Set hidden template id field
        let templateIdField = document.getElementById('workflow-template-id');
        if (!templateIdField) {
            templateIdField = document.createElement('input');
            templateIdField.type = 'hidden';
            templateIdField.id = 'workflow-template-id';
            workflowForm.appendChild(templateIdField);
        }
        templateIdField.value = templateId;
        
        // Update button text
        const submitButton = workflowForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Apply Template';
        }
        
        // Set title
        modalTitle.textContent = 'Apply Workflow Template';
        
        // Show modal
        modal.style.display = 'block';
        
        // Update preview
        updateWorkflowPreview();
    }
}

/**
 * Show modal for editing a workflow template
 * @param {string} templateId - ID of the template to edit
 */
function showEditWorkflowModal(templateId) {
    const template = getWorkflowTemplate(templateId);
    if (!template) return;
    
    const modal = document.getElementById('workflow-modal');
    const modalTitle = document.getElementById('workflow-modal-title');
    const workflowForm = document.getElementById('workflow-form');
    
    if (modal && modalTitle && workflowForm) {
        // Reset form
        workflowForm.reset();
        document.getElementById('workflow-action').value = 'edit';
        document.getElementById('workflow-name').value = template.name;
        document.getElementById('workflow-description').value = template.description || '';
        
        // Set include options based on template
        document.getElementById('include-schedule').checked = template.includeSchedule;
        document.getElementById('include-tasks').checked = template.includeTasks;
        document.getElementById('include-reminders').checked = template.includeReminders;
        document.getElementById('include-pomodoro').checked = template.includePomodoro;
        
        // Set hidden template id field
        let templateIdField = document.getElementById('workflow-template-id');
        if (!templateIdField) {
            templateIdField = document.createElement('input');
            templateIdField.type = 'hidden';
            templateIdField.id = 'workflow-template-id';
            workflowForm.appendChild(templateIdField);
        }
        templateIdField.value = templateId;
        
        // Update button text
        const submitButton = workflowForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Update Template';
        }
        
        // Set title
        modalTitle.textContent = 'Edit Workflow Template';
        
        // Show modal
        modal.style.display = 'block';
        
        // Update preview
        updateWorkflowPreview();
    }
}

/**
 * Hide workflow modal
 */
function hideWorkflowModal() {
    const modal = document.getElementById('workflow-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Update workflow preview based on selected options
 */
function updateWorkflowPreview() {
    const previewContainer = document.getElementById('workflow-preview-container');
    const previewCount = document.getElementById('workflow-preview-count');
    
    if (!previewContainer || !previewCount) return;
    
    // Get selected options
    const includeSchedule = document.getElementById('include-schedule').checked;
    const includeTasks = document.getElementById('include-tasks').checked;
    const includeReminders = document.getElementById('include-reminders').checked;
    const includePomodoro = document.getElementById('include-pomodoro').checked;
    
    // Count items for each category
    const scheduleCount = includeSchedule ? (JSON.parse(localStorage.getItem('timeBlocks') || '[]')).length : 0;
    const tasksCount = includeTasks ? (JSON.parse(localStorage.getItem('tasks') || '[]')).length : 0;
    const remindersCount = includeReminders ? (JSON.parse(localStorage.getItem('reminders') || '[]')).length : 0;
    const pomodoroSettingsCount = includePomodoro ? 1 : 0;
    
    const totalItems = scheduleCount + tasksCount + remindersCount + pomodoroSettingsCount;
    previewCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    
    // Generate preview HTML
    let previewHTML = '';
    
    if (includeSchedule) {
        previewHTML += `
            <div class="preview-item">
                <div class="preview-icon">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="preview-details">
                    <span class="preview-title">Schedule</span>
                    <span class="preview-count">${scheduleCount} block${scheduleCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
    }
    
    if (includeTasks) {
        previewHTML += `
            <div class="preview-item">
                <div class="preview-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="preview-details">
                    <span class="preview-title">Tasks</span>
                    <span class="preview-count">${tasksCount} task${tasksCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
    }
    
    if (includeReminders) {
        previewHTML += `
            <div class="preview-item">
                <div class="preview-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="preview-details">
                    <span class="preview-title">Reminders</span>
                    <span class="preview-count">${remindersCount} reminder${remindersCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
    }
    
    if (includePomodoro) {
        previewHTML += `
            <div class="preview-item">
                <div class="preview-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="preview-details">
                    <span class="preview-title">Pomodoro Settings</span>
                </div>
            </div>
        `;
    }
    
    // If no items selected
    if (totalItems === 0) {
        previewHTML = `
            <div class="empty-preview">
                <p>No items selected. Please check at least one option to include in the template.</p>
            </div>
        `;
    }
    
    previewContainer.innerHTML = previewHTML;
}

/**
 * Save a workflow template
 */
function saveWorkflowTemplate() {
    try {
        // Get form values
        const name = document.getElementById('workflow-name').value.trim();
        const description = document.getElementById('workflow-description').value.trim();
        const includeSchedule = document.getElementById('include-schedule').checked;
        const includeTasks = document.getElementById('include-tasks').checked;
        const includeReminders = document.getElementById('include-reminders').checked;
        const includePomodoro = document.getElementById('include-pomodoro').checked;
        
        // Validate input
        if (!name) {
            showToast('Please enter a template name', 'error');
            return;
        }
        
        if (!includeSchedule && !includeTasks && !includeReminders && !includePomodoro) {
            showToast('Please select at least one item to include', 'error');
            return;
        }
        
        // Get data to save based on selection
        const templateData = {};
        
        if (includeSchedule) {
            templateData.timeBlocks = JSON.parse(localStorage.getItem('timeBlocks') || '[]');
        }
        
        if (includeTasks) {
            templateData.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            templateData.taskDependencies = JSON.parse(localStorage.getItem('taskDependencies') || '[]');
        }
        
        if (includeReminders) {
            templateData.reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
            templateData.recurringReminders = JSON.parse(localStorage.getItem('recurringReminders') || '[]');
        }
        
        if (includePomodoro) {
            templateData.pomodoroSettings = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
        }
        
        // Create template object
        const action = document.getElementById('workflow-action').value;
        let templateId = '';
        
        if (action === 'edit') {
            templateId = document.getElementById('workflow-template-id').value;
        }
        
        const template = {
            id: templateId || Date.now().toString(),
            name,
            description,
            includeSchedule,
            includeTasks,
            includeReminders,
            includePomodoro,
            data: templateData,
            createdAt: action === 'edit' ? getWorkflowTemplate(templateId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const templates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
        
        if (action === 'edit') {
            // Update existing template
            const index = templates.findIndex(t => t.id === templateId);
            if (index !== -1) {
                templates[index] = template;
            }
        } else {
            // Add new template
            templates.push(template);
        }
        
        localStorage.setItem('workflowTemplates', JSON.stringify(templates));
        
        // Hide modal
        hideWorkflowModal();
        
        // Refresh templates list
        loadWorkflowTemplates();
        
        // Show success message
        showToast(`Template ${action === 'edit' ? 'updated' : 'saved'} successfully`, 'success');
    } catch (error) {
        console.error('Error saving workflow template:', error);
        showToast('Failed to save template', 'error');
    }
}

/**
 * Apply a workflow template
 */
function applyWorkflowTemplate() {
    try {
        const templateId = document.getElementById('workflow-template-id').value;
        const template = getWorkflowTemplate(templateId);
        
        if (!template) {
            showToast('Template not found', 'error');
            return;
        }
        
        // Get selected options
        const includeSchedule = document.getElementById('include-schedule').checked;
        const includeTasks = document.getElementById('include-tasks').checked;
        const includeReminders = document.getElementById('include-reminders').checked;
        const includePomodoro = document.getElementById('include-pomodoro').checked;
        
        // Confirm before applying
        if (!confirm(`This will replace your current ${[
            includeSchedule ? 'schedule' : '',
            includeTasks ? 'tasks' : '',
            includeReminders ? 'reminders' : '',
            includePomodoro ? 'pomodoro settings' : ''
        ].filter(Boolean).join(', ')}. Are you sure?`)) {
            return;
        }
        
        // Apply data based on selection
        if (includeSchedule && template.data.timeBlocks) {
            localStorage.setItem('timeBlocks', JSON.stringify(template.data.timeBlocks));
        }
        
        if (includeTasks) {
            if (template.data.tasks) {
                localStorage.setItem('tasks', JSON.stringify(template.data.tasks));
            }
            
            if (template.data.taskDependencies) {
                localStorage.setItem('taskDependencies', JSON.stringify(template.data.taskDependencies));
            }
        }
        
        if (includeReminders) {
            if (template.data.reminders) {
                localStorage.setItem('reminders', JSON.stringify(template.data.reminders));
            }
            
            if (template.data.recurringReminders) {
                localStorage.setItem('recurringReminders', JSON.stringify(template.data.recurringReminders));
            }
        }
        
        if (includePomodoro && template.data.pomodoroSettings) {
            localStorage.setItem('pomodoroSettings', JSON.stringify(template.data.pomodoroSettings));
        }
        
        // Hide modal
        hideWorkflowModal();
        
        // Show success message and reload
        showToast('Template applied successfully. Refreshing page...', 'success');
        
        // Refresh the page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (error) {
        console.error('Error applying workflow template:', error);
        showToast('Failed to apply template', 'error');
    }
}

/**
 * Delete a workflow template
 * @param {string} templateId - ID of the template to delete
 */
function deleteWorkflowTemplate(templateId) {
    try {
        if (confirm('Are you sure you want to delete this template?')) {
            const templates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
            const updatedTemplates = templates.filter(template => template.id !== templateId);
            
            localStorage.setItem('workflowTemplates', JSON.stringify(updatedTemplates));
            
            // Refresh templates list
            loadWorkflowTemplates();
            
            showToast('Template deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        showToast('Failed to delete template', 'error');
    }
}

/**
 * Get workflow template by ID
 * @param {string} templateId - ID of the template to get
 * @returns {Object} Template object or null
 */
function getWorkflowTemplate(templateId) {
    const templates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
    return templates.find(template => template.id === templateId) || null;
}

/**
 * Load workflow templates from localStorage
 */
function loadWorkflowTemplates() {
    const templatesList = document.getElementById('workflow-templates-list');
    if (!templatesList) return;
    
    // Get templates from localStorage
    const templates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
    
    if (templates.length === 0) {
        templatesList.innerHTML = `
            <div class="empty-templates">
                <p>No saved templates yet. Save your current layout to create your first template.</p>
            </div>
        `;
        return;
    }
    
    // Sort templates by update date (newest first)
    templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Generate HTML for each template
    const templatesHTML = templates.map(template => {
        // Count items in each category
        const scheduleCount = template.includeSchedule && template.data.timeBlocks ? template.data.timeBlocks.length : 0;
        const tasksCount = template.includeTasks && template.data.tasks ? template.data.tasks.length : 0;
        const remindersCount = template.includeReminders && template.data.reminders ? template.data.reminders.length : 0;
        
        return `
            <div class="workflow-template-item" data-id="${template.id}">
                <div class="template-header">
                    <h4 class="template-name">${template.name}</h4>
                    <div class="template-actions">
                        <button class="load-template-btn" data-id="${template.id}" title="Apply this template">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="edit-template-btn" data-id="${template.id}" title="Edit template">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-template-btn" data-id="${template.id}" title="Delete template">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${template.description ? `<p class="template-description">${template.description}</p>` : ''}
                
                <div class="template-contents">
                    ${template.includeSchedule ? `
                        <span class="template-content-item" title="${scheduleCount} schedule blocks">
                            <i class="fas fa-calendar-day"></i> ${scheduleCount}
                        </span>
                    ` : ''}
                    
                    ${template.includeTasks ? `
                        <span class="template-content-item" title="${tasksCount} tasks">
                            <i class="fas fa-tasks"></i> ${tasksCount}
                        </span>
                    ` : ''}
                    
                    ${template.includeReminders ? `
                        <span class="template-content-item" title="${remindersCount} reminders">
                            <i class="fas fa-bell"></i> ${remindersCount}
                        </span>
                    ` : ''}
                    
                    ${template.includePomodoro ? `
                        <span class="template-content-item" title="Pomodoro settings">
                            <i class="fas fa-clock"></i>
                        </span>
                    ` : ''}
                </div>
                
                <div class="template-date">
                    Last updated: ${new Date(template.updatedAt).toLocaleDateString()}
                </div>
            </div>
        `;
    }).join('');
    
    templatesList.innerHTML = templatesHTML;
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
window.initWorkflows = initWorkflows; 