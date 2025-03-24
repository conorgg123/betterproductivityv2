// Keyboard Shortcuts Module
document.addEventListener('DOMContentLoaded', () => {
    initKeyboardShortcuts();
});

function initKeyboardShortcuts() {
    // Create and append keyboard shortcuts modal to the DOM
    const shortcutsModal = createShortcutsModal();
    document.body.appendChild(shortcutsModal);
    
    // Set up document-wide event listener for keydown events
    document.addEventListener('keydown', handleGlobalShortcuts);
    
    // Set up always-active shortcuts (works even in input fields)
    document.addEventListener('keydown', handleAlwaysActiveShortcuts);
}

function createShortcutsModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'shortcuts-modal';
    modalDiv.className = 'modal';
    
    modalDiv.innerHTML = `
        <div class="modal-content shortcuts-modal-content">
            <div class="modal-header">
                <h3>Keyboard Shortcuts</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="shortcuts-grid">
                    <div class="shortcuts-section">
                        <h4>Navigation</h4>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">D</div>
                            <div class="shortcut-description">Go to Dashboard</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Y</div>
                            <div class="shortcut-description">Go to YouTube</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">S</div>
                            <div class="shortcut-description">Go to Scheduler</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">T</div>
                            <div class="shortcut-description">Go to Tasks</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">R</div>
                            <div class="shortcut-description">Go to Reminders</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">N</div>
                            <div class="shortcut-description">Go to Notes</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">A</div>
                            <div class="shortcut-description">Go to Analytics</div>
                        </div>
                    </div>
                    
                    <div class="shortcuts-section">
                        <h4>Quick Actions</h4>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Ctrl+N</div>
                            <div class="shortcut-description">Quick Add</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Ctrl+P</div>
                            <div class="shortcut-description">Pomodoro Toggle</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Ctrl+F</div>
                            <div class="shortcut-description">Toggle Focus Mode</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Ctrl+/</div>
                            <div class="shortcut-description">Search</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">?</div>
                            <div class="shortcut-description">Show Shortcuts</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Esc</div>
                            <div class="shortcut-description">Close Modals</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys">Ctrl+D</div>
                            <div class="shortcut-description">Toggle Dark Mode</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener to close button
    modalDiv.querySelector('.close-modal').addEventListener('click', () => {
        modalDiv.style.display = 'none';
    });
    
    // Close on outside click
    modalDiv.addEventListener('click', (e) => {
        if (e.target === modalDiv) {
            modalDiv.style.display = 'none';
        }
    });
    
    return modalDiv;
}

function handleGlobalShortcuts(e) {
    // Skip if user is typing in an input, textarea, or contenteditable element
    if (isUserTyping(e.target)) {
        return;
    }
    
    // Navigation shortcuts
    switch (e.key) {
        case 'd': navigateToSection('dashboard'); break;
        case 'y': navigateToSection('youtube'); break;
        case 's': navigateToSection('scheduler'); break;
        case 't': navigateToSection('tasks'); break;
        case 'r': navigateToSection('reminders'); break;
        case 'n': navigateToSection('notes'); break;
        case 'a': navigateToSection('analytics'); break;
        case '?': showShortcutsModal(); break;
    }
}

function handleAlwaysActiveShortcuts(e) {
    // Shortcuts that work everywhere, even when typing
    
    // Quick add modal (Ctrl+N)
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault(); // Prevent new window/tab
        showQuickAddModal();
    }
    
    // Pomodoro toggle (Ctrl+P)
    else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault(); // Prevent print dialog
        togglePomodoroModal();
    }
    
    // Focus mode toggle (Ctrl+F)
    else if (e.ctrlKey && e.key === 'f' && !isUserTyping(e.target)) {
        e.preventDefault(); // Prevent browser's find
        toggleFocusMode();
    }
    
    // Search (Ctrl+/)
    else if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        focusSearchBox();
    }
    
    // Dark mode toggle (Ctrl+D)
    else if (e.ctrlKey && e.key === 'd' && !isUserTyping(e.target)) {
        e.preventDefault(); // Prevent bookmark
        toggleDarkMode();
    }
}

function isUserTyping(element) {
    return element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' || 
           element.contentEditable === 'true';
}

function navigateToSection(section) {
    // Find the corresponding sidebar nav item and click it
    const navItem = document.querySelector(`.sidebar-nav a[data-section="${section}"]`);
    if (navItem) {
        navItem.click();
    }
}

function showShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function togglePomodoroModal() {
    const modal = document.getElementById('pomodoro-modal');
    if (modal) {
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
        }
    }
}

function toggleFocusMode() {
    // This function should be defined in focus-mode.js
    if (typeof window.toggleFocusMode === 'function') {
        window.toggleFocusMode();
    }
}

function focusSearchBox() {
    const searchBox = document.querySelector('#search-box input');
    if (searchBox) {
        searchBox.focus();
    }
}

function toggleDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.click();
    }
}

// Export the initialization function for use in app.js
window.initKeyboardShortcuts = initKeyboardShortcuts; 