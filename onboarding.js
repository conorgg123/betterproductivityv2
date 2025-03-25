// Onboarding/Guided Tour Module
document.addEventListener('DOMContentLoaded', function() {
    initOnboarding();
});

/**
 * Initialize the onboarding/guided tour functionality
 */
function initOnboarding() {
    console.log('Initializing onboarding/guided tour...');
    
    // Check if this is the user's first visit
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    
    if (!hasCompletedOnboarding) {
        // Show welcome modal on first visit
        showWelcomeModal();
        
        // Add onboarding button to settings
        addOnboardingToSettings();
    } else {
        // Just add the onboarding button to settings for returning users
        addOnboardingToSettings();
    }
    
    // Add onboarding tooltips to the UI
    setupOnboardingTooltips();
}

/**
 * Show welcome modal for first-time users
 */
function showWelcomeModal() {
    // Create welcome modal
    const welcomeModal = document.createElement('div');
    welcomeModal.id = 'welcome-modal';
    welcomeModal.className = 'modal';
    
    welcomeModal.innerHTML = `
        <div class="modal-content onboarding-modal">
            <div class="modal-header">
                <h3>Welcome to Daily Progress Tracker</h3>
                <button class="modal-close close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="welcome-screen">
                    <div class="welcome-icon">
                        <i class="fa-solid fa-rocket"></i>
                    </div>
                    <h2>Get Started with Your Productivity Journey</h2>
                    <p>Daily Progress Tracker helps you organize your tasks, track your goals, and optimize your workflow.</p>
                    
                    <div class="features-overview">
                        <div class="feature-item">
                            <i class="fa-solid fa-list-check"></i>
                            <h4>Task Management</h4>
                            <p>Create tasks with dependencies, due dates, and priorities</p>
                        </div>
                        <div class="feature-item">
                            <i class="fa-solid fa-bullseye"></i>
                            <h4>Goal Setting</h4>
                            <p>Set and track progress on your short and long-term goals</p>
                        </div>
                        <div class="feature-item">
                            <i class="fa-solid fa-clock"></i>
                            <h4>Pomodoro Timer</h4>
                            <p>Stay focused with timed work sessions and breaks</p>
                        </div>
                        <div class="feature-item">
                            <i class="fa-solid fa-chart-line"></i>
                            <h4>Analytics</h4>
                            <p>Visualize your productivity and track improvements</p>
                        </div>
                    </div>
                </div>
                
                <div class="welcome-actions">
                    <button id="skip-tour-btn" class="btn btn-secondary">Skip Tour</button>
                    <button id="start-tour-btn" class="btn btn-primary">Start Guided Tour</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(welcomeModal);
    
    // Show modal
    welcomeModal.style.display = 'block';
    
    // Add event listeners
    welcomeModal.querySelector('.modal-close').addEventListener('click', function() {
        welcomeModal.style.display = 'none';
        markOnboardingComplete();
    });
    
    document.getElementById('skip-tour-btn').addEventListener('click', function() {
        welcomeModal.style.display = 'none';
        markOnboardingComplete();
    });
    
    document.getElementById('start-tour-btn').addEventListener('click', function() {
        welcomeModal.style.display = 'none';
        startGuidedTour();
    });
}

/**
 * Add onboarding option to the settings panel
 */
function addOnboardingToSettings() {
    // Find the productivity settings card
    const productivitySettings = document.querySelector('.settings-card:last-of-type .settings-content .settings-group');
    
    if (productivitySettings) {
        // Create onboarding settings item
        const onboardingSettingsItem = document.createElement('div');
        onboardingSettingsItem.className = 'settings-item';
        onboardingSettingsItem.innerHTML = `
            <div class="settings-label">
                <h4>App Tour</h4>
                <p>Take a guided tour of the app's features</p>
            </div>
            <div class="settings-control">
                <button id="start-onboarding" class="settings-btn">
                    <i class="fa-solid fa-map-signs"></i> Start Tour
                </button>
            </div>
        `;
        
        // Add to settings
        productivitySettings.appendChild(onboardingSettingsItem);
        
        // Add event listener
        document.getElementById('start-onboarding').addEventListener('click', function() {
            startGuidedTour();
        });
    }
}

/**
 * Set up tooltips that provide helpful context throughout the app
 */
function setupOnboardingTooltips() {
    // Get all feature elements that should have tooltips
    const featureElements = [
        { selector: '.sidebar-nav .nav-item[data-section="dashboard"]', title: 'Dashboard', content: 'Get an overview of your daily activities and productivity' },
        { selector: '.sidebar-nav .nav-item[data-section="youtube"]', title: 'YouTube Manager', content: 'Add and organize YouTube videos for later viewing' },
        { selector: '.sidebar-nav .nav-item[data-section="scheduler"]', title: 'Scheduler', content: 'Plan your day with time blocks on the 24-hour timeline' },
        { selector: '.sidebar-nav .nav-item[data-section="tasks"]', title: 'Tasks', content: 'Create and manage tasks with dependencies and priorities' },
        { selector: '.sidebar-nav .nav-item[data-section="reminders"]', title: 'Reminders', content: 'Set up notifications for important events' },
        { selector: '.sidebar-nav .nav-item[data-section="goals"]', title: 'Goals', content: 'Set and track progress toward your objectives' },
        { selector: '.sidebar-nav .nav-item[data-section="notes"]', title: 'Notes', content: 'Keep track of your ideas and information' },
        { selector: '.sidebar-nav .nav-item[data-section="analytics"]', title: 'Analytics', content: 'Visualize your productivity data with charts and statistics' },
        { selector: '.floating-pomodoro-btn', title: 'Pomodoro Timer', content: 'Start a focused work session with timed breaks' },
        { selector: '#theme-toggle', title: 'Theme Toggle', content: 'Switch between light and dark modes' }
    ];
    
    // Add tooltip data attributes to the elements
    featureElements.forEach(feature => {
        const element = document.querySelector(feature.selector);
        if (element) {
            element.setAttribute('data-tooltip-title', feature.title);
            element.setAttribute('data-tooltip-content', feature.content);
            element.classList.add('has-tooltip');
        }
    });
    
    // Add tooltip container to the document
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltip-container';
    tooltipContainer.className = 'tooltip-container';
    document.body.appendChild(tooltipContainer);
    
    // Add event listeners for tooltip display
    document.addEventListener('mouseover', function(e) {
        const tooltipElement = e.target.closest('.has-tooltip');
        if (tooltipElement) {
            showTooltip(
                tooltipElement, 
                tooltipElement.getAttribute('data-tooltip-title'), 
                tooltipElement.getAttribute('data-tooltip-content')
            );
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.has-tooltip')) {
            hideTooltip();
        }
    });
}

/**
 * Show tooltip next to an element
 * @param {Element} element - The element to show tooltip for
 * @param {string} title - Tooltip title
 * @param {string} content - Tooltip content
 */
function showTooltip(element, title, content) {
    const tooltipContainer = document.getElementById('tooltip-container');
    if (!tooltipContainer) return;
    
    // Set tooltip content
    tooltipContainer.innerHTML = `
        <div class="tooltip-title">${title}</div>
        <div class="tooltip-content">${content}</div>
    `;
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const isRightSide = rect.left > window.innerWidth / 2;
    
    if (isRightSide) {
        tooltipContainer.style.left = (rect.left - tooltipContainer.offsetWidth - 10) + 'px';
    } else {
        tooltipContainer.style.left = (rect.right + 10) + 'px';
    }
    
    tooltipContainer.style.top = (rect.top + rect.height / 2 - tooltipContainer.offsetHeight / 2) + 'px';
    
    // Show tooltip with fade-in animation
    tooltipContainer.classList.add('visible');
}

/**
 * Hide the active tooltip
 */
function hideTooltip() {
    const tooltipContainer = document.getElementById('tooltip-container');
    if (tooltipContainer) {
        tooltipContainer.classList.remove('visible');
    }
}

/**
 * Start the guided tour for new users
 */
function startGuidedTour() {
    // Array of tour steps
    const tourSteps = [
        {
            element: '.sidebar',
            title: 'Navigation Sidebar',
            content: 'Use the sidebar to navigate between different sections of the app.',
            position: 'right'
        },
        {
            element: '.sidebar-nav .nav-item[data-section="dashboard"]',
            title: 'Dashboard',
            content: 'The Dashboard gives you an overview of your day, including task completion, focus time, and productivity metrics.',
            position: 'right'
        },
        {
            element: '.sidebar-nav .nav-item[data-section="tasks"]',
            title: 'Tasks',
            content: 'Create and manage tasks with priorities, dependencies, and deadlines. Tasks can be organized by category and dragged to the scheduler.',
            position: 'right',
            action: function() {
                // Navigate to tasks section
                document.querySelector('.sidebar-nav .nav-item[data-section="tasks"]').click();
            }
        },
        {
            element: '#tasks-section .section-header',
            title: 'Add Tasks',
            content: 'Use the Add Task button to create new tasks. You can set dependencies to create task sequences.',
            position: 'bottom'
        },
        {
            element: '.sidebar-nav .nav-item[data-section="goals"]',
            title: 'Goals',
            content: 'Set and track your short-term and long-term goals. You can add tasks to each goal to help you achieve them.',
            position: 'right',
            action: function() {
                // Navigate to goals section
                document.querySelector('.sidebar-nav .nav-item[data-section="goals"]').click();
            }
        },
        {
            element: '.sidebar-nav .nav-item[data-section="scheduler"]',
            title: 'Scheduler',
            content: 'Plan your day with time blocks. Drag tasks, reminders, and YouTube videos to the scheduler to create a visual timeline.',
            position: 'right',
            action: function() {
                // Navigate to scheduler section
                document.querySelector('.sidebar-nav .nav-item[data-section="scheduler"]').click();
            }
        },
        {
            element: '#add-time-block',
            title: 'Add Time Blocks',
            content: 'Create custom time blocks for different activities. Time blocks can represent work, breaks, meetings, or any other activity.',
            position: 'left'
        },
        {
            element: '.sidebar-nav .nav-item[data-section="analytics"]',
            title: 'Analytics',
            content: 'Track your productivity trends over time with detailed charts and statistics.',
            position: 'right',
            action: function() {
                // Navigate to analytics section
                document.querySelector('.sidebar-nav .nav-item[data-section="analytics"]').click();
            }
        },
        {
            element: '.floating-pomodoro-btn',
            title: 'Pomodoro Timer',
            content: 'Use the Pomodoro technique to stay focused. Work in 25-minute sessions followed by short breaks.',
            position: 'left'
        },
        {
            element: '.sidebar-nav .nav-item[data-section="settings"]',
            title: 'Settings',
            content: 'Customize the app appearance, notifications, and other preferences.',
            position: 'right',
            action: function() {
                // Navigate to settings section
                document.querySelector('.sidebar-nav .nav-item[data-section="settings"]').click();
            }
        },
        {
            element: '#theme-toggle',
            title: 'Theme Toggle',
            content: 'Switch between light and dark themes based on your preference.',
            position: 'top'
        }
    ];
    
    // Create tour container
    const tourContainer = document.createElement('div');
    tourContainer.id = 'tour-container';
    tourContainer.className = 'tour-container';
    document.body.appendChild(tourContainer);
    
    // Initialize tour variables
    let currentStep = 0;
    let tourHighlight = null;
    
    // Function to show a tour step
    function showTourStep(stepIndex) {
        // Get step data
        const step = tourSteps[stepIndex];
        
        // Find the target element
        const targetElement = document.querySelector(step.element);
        if (!targetElement) {
            console.error(`Target element not found: ${step.element}`);
            goToNextStep();
            return;
        }
        
        // Perform action if specified (like navigating to a section)
        if (step.action) {
            step.action();
            // Small delay to allow the UI to update
            setTimeout(() => continueTourStep(stepIndex, targetElement, step), 500);
        } else {
            continueTourStep(stepIndex, targetElement, step);
        }
    }
    
    function continueTourStep(stepIndex, targetElement, step) {
        // Remove existing highlight
        if (tourHighlight) {
            tourHighlight.remove();
        }
        
        // Create highlight element
        tourHighlight = document.createElement('div');
        tourHighlight.className = 'tour-highlight';
        document.body.appendChild(tourHighlight);
        
        // Position highlight around target element
        const rect = targetElement.getBoundingClientRect();
        tourHighlight.style.left = rect.left + 'px';
        tourHighlight.style.top = rect.top + 'px';
        tourHighlight.style.width = rect.width + 'px';
        tourHighlight.style.height = rect.height + 'px';
        
        // Scroll element into view if needed
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Set tour content
        const isLastStep = stepIndex === tourSteps.length - 1;
        const tourContent = `
            <div class="tour-step-count">Step ${stepIndex + 1} of ${tourSteps.length}</div>
            <div class="tour-title">${step.title}</div>
            <div class="tour-content">${step.content}</div>
            <div class="tour-actions">
                <button id="tour-prev" class="tour-btn" ${stepIndex === 0 ? 'disabled' : ''}>
                    <i class="fa-solid fa-arrow-left"></i> Previous
                </button>
                <button id="tour-skip" class="tour-btn">
                    Skip Tour
                </button>
                <button id="tour-next" class="tour-btn">
                    ${isLastStep ? 'Finish' : 'Next'} <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        // Position tour container
        tourContainer.innerHTML = tourContent;
        positionTourContainer(tourContainer, targetElement, step.position);
        
        // Show tour container
        tourContainer.classList.add('visible');
        
        // Add event listeners
        document.getElementById('tour-prev').addEventListener('click', goToPrevStep);
        document.getElementById('tour-next').addEventListener('click', goToNextStep);
        document.getElementById('tour-skip').addEventListener('click', endTour);
    }
    
    // Position the tour container relative to the target element
    function positionTourContainer(tourContainer, targetElement, position) {
        const rect = targetElement.getBoundingClientRect();
        const tourRect = tourContainer.getBoundingClientRect();
        
        // Reset all positioning
        tourContainer.style.top = '';
        tourContainer.style.right = '';
        tourContainer.style.bottom = '';
        tourContainer.style.left = '';
        
        // Position based on specified position
        switch (position) {
            case 'top':
                tourContainer.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
                tourContainer.style.left = (rect.left + rect.width / 2 - tourRect.width / 2) + 'px';
                break;
            case 'right':
                tourContainer.style.left = (rect.right + 10) + 'px';
                tourContainer.style.top = (rect.top + rect.height / 2 - tourRect.height / 2) + 'px';
                break;
            case 'bottom':
                tourContainer.style.top = (rect.bottom + 10) + 'px';
                tourContainer.style.left = (rect.left + rect.width / 2 - tourRect.width / 2) + 'px';
                break;
            case 'left':
                tourContainer.style.right = (window.innerWidth - rect.left + 10) + 'px';
                tourContainer.style.top = (rect.top + rect.height / 2 - tourRect.height / 2) + 'px';
                break;
            default:
                // Default to bottom
                tourContainer.style.top = (rect.bottom + 10) + 'px';
                tourContainer.style.left = (rect.left + rect.width / 2 - tourRect.width / 2) + 'px';
        }
        
        // Ensure the tour container is fully visible
        const finalRect = tourContainer.getBoundingClientRect();
        
        if (finalRect.left < 10) {
            tourContainer.style.left = '10px';
        }
        
        if (finalRect.right > window.innerWidth - 10) {
            tourContainer.style.left = (window.innerWidth - finalRect.width - 10) + 'px';
        }
        
        if (finalRect.top < 10) {
            tourContainer.style.top = '10px';
        }
        
        if (finalRect.bottom > window.innerHeight - 10) {
            tourContainer.style.top = (window.innerHeight - finalRect.height - 10) + 'px';
        }
    }
    
    // Go to the next step in the tour
    function goToNextStep() {
        currentStep++;
        
        if (currentStep >= tourSteps.length) {
            endTour();
        } else {
            showTourStep(currentStep);
        }
    }
    
    // Go to the previous step in the tour
    function goToPrevStep() {
        if (currentStep > 0) {
            currentStep--;
            showTourStep(currentStep);
        }
    }
    
    // End the tour
    function endTour() {
        // Remove tour elements
        if (tourContainer) {
            tourContainer.classList.remove('visible');
            setTimeout(() => {
                tourContainer.remove();
            }, 300);
        }
        
        if (tourHighlight) {
            tourHighlight.remove();
        }
        
        // Mark onboarding as complete
        markOnboardingComplete();
        
        // Navigate back to dashboard
        document.querySelector('.sidebar-nav .nav-item[data-section="dashboard"]').click();
    }
    
    // Start the tour with the first step
    showTourStep(0);
}

/**
 * Mark onboarding as complete in localStorage
 */
function markOnboardingComplete() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
}

// Export for use in app.js
window.initOnboarding = initOnboarding; 