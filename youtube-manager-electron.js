/**
 * YouTube Manager Module - Electron Version
 * Enhanced version that uses Electron's backend capabilities
 */

function initYouTubeManager() {
    console.log('Initializing YouTube Manager (Electron version)...');
    
    // Get DOM elements
    const ytLinkForm = document.getElementById('yt-link-form');
    const ytLinkInput = document.getElementById('yt-link-input');
    const ytLinkTitle = document.getElementById('yt-link-title');
    const ytLinkCategory = document.getElementById('yt-link-category');
    const ytLinkButton = document.getElementById('add-yt-link-btn');
    const ytLinksList = document.getElementById('yt-links-list');
    const ytLinksGrid = document.getElementById('yt-links-grid');
    const ytCategoryFilter = document.getElementById('yt-category-filter');
    const ytLinksCount = document.getElementById('yt-links-count');
    const ytSearchInput = document.getElementById('yt-search-input');
    const ytCategoryForm = document.getElementById('yt-category-form');
    const ytCategoryInput = document.getElementById('yt-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const ytCategoriesList = document.getElementById('yt-categories-list');
    
    // Check if Electron API is available
    const isElectron = typeof window.electronAPI !== 'undefined';
    console.log('Running in Electron mode:', isElectron);
    
    // Load links from local storage
    loadLinks();
    
    // Load categories from local storage
    loadCategories();
    
    // Add event listener for adding new link
    ytLinkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addLink();
    });
    
    // Add event listener for adding new category
    ytCategoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addCategory();
    });
    
    // Add event listener for search input
    ytSearchInput.addEventListener('input', function() {
        loadLinks(this.value.trim());
    });
    
    // Add event listener for category filter
    ytCategoryFilter.addEventListener('change', function() {
        loadLinks(ytSearchInput.value.trim(), this.value);
    });
    
    // Add event listener for input validation
    ytLinkInput.addEventListener('input', validateYouTubeLink);
    
    // Add event listener for fetching video metadata
    ytLinkInput.addEventListener('blur', async function() {
        if (isElectron && validateYouTubeLink()) {
            fetchYouTubeMetadata(ytLinkInput.value.trim());
        }
    });
    
    /**
     * Validate YouTube link format
     * @returns {boolean} True if valid, false otherwise
     */
    function validateYouTubeLink() {
        const link = ytLinkInput.value.trim();
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        
        // Check if link matches YouTube format
        if (link && !ytRegex.test(link)) {
            ytLinkInput.classList.add('invalid');
            document.getElementById('yt-link-validation').style.display = 'block';
            ytLinkButton.disabled = true;
            return false;
        } else {
            ytLinkInput.classList.remove('invalid');
            document.getElementById('yt-link-validation').style.display = 'none';
            ytLinkButton.disabled = false;
            return true;
        }
    }
    
    /**
     * Fetch video metadata from YouTube using Electron backend
     * @param {string} url - YouTube URL
     */
    async function fetchYouTubeMetadata(url) {
        if (!isElectron) return;
        
        try {
            // Show loading indicator
            ytLinkTitle.placeholder = 'Fetching video info...';
            
            // Fetch video details from Electron backend
            const result = await window.electronAPI.getYouTubeInfo(url);
            
            if (result.success) {
                // Auto-fill title if not already entered by user
                if (!ytLinkTitle.value.trim()) {
                    ytLinkTitle.value = result.title;
                }
                
                // Store additional info for later use
                ytLinkInput.dataset.videoId = result.videoId;
                ytLinkInput.dataset.thumbnailUrl = result.thumbnailUrl;
                ytLinkInput.dataset.duration = result.duration;
                ytLinkInput.dataset.channel = result.channel;
            } else {
                console.error('Error fetching video info:', result.error);
            }
        } catch (error) {
            console.error('Error in fetchYouTubeMetadata:', error);
        } finally {
            // Reset placeholder
            ytLinkTitle.placeholder = 'Enter video title (optional)';
        }
    }
    
    /**
     * Add a new YouTube link
     */
    async function addLink() {
        // Get values from form
        const url = ytLinkInput.value.trim();
        let title = ytLinkTitle.value.trim();
        const category = ytLinkCategory.value;
        
        // Validate link format
        if (!validateYouTubeLink()) {
            return;
        }
        
        // If in Electron mode and no title provided, try to fetch it
        if (isElectron && !title) {
            try {
                const result = await window.electronAPI.getYouTubeInfo(url);
                if (result.success) {
                    title = result.title;
                }
            } catch (error) {
                console.error('Error fetching video info:', error);
            }
        }
        
        // Use a fallback title if still empty
        if (!title) {
            title = 'YouTube Video';
        }
        
        // Get video ID and thumbnail from dataset if available (in Electron mode)
        let videoId = ytLinkInput.dataset.videoId;
        let thumbnailUrl = ytLinkInput.dataset.thumbnailUrl;
        
        // Fallback to extracting from URL if not available
        if (!videoId) {
            videoId = extractYouTubeID(url);
        }
        
        if (!thumbnailUrl && videoId) {
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }
        
        // Create link object
        const linkId = Date.now().toString();
        const link = {
            id: linkId,
            url: url,
            title: title,
            category: category,
            dateAdded: new Date().toISOString(),
            thumbnailUrl: thumbnailUrl,
            videoId: videoId,
            duration: ytLinkInput.dataset.duration || null,
            channel: ytLinkInput.dataset.channel || null
        };
        
        // Get existing links
        const links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        
        // Add new link
        links.push(link);
        
        // Save to local storage
        localStorage.setItem('youtubeLinks', JSON.stringify(links));
        
        // Clear form and dataset
        ytLinkInput.value = '';
        ytLinkTitle.value = '';
        ytLinkInput.dataset.videoId = '';
        ytLinkInput.dataset.thumbnailUrl = '';
        ytLinkInput.dataset.duration = '';
        ytLinkInput.dataset.channel = '';
        
        // Reload links
        loadLinks();
        
        // Show success message
        showToast('YouTube link added successfully', 'success');
    }
    
    /**
     * Add a new category
     */
    function addCategory() {
        // Get category name
        const categoryName = ytCategoryInput.value.trim();
        
        // Validate
        if (!categoryName) {
            return;
        }
        
        // Get existing categories
        const categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
        
        // Check if category already exists
        if (categories.includes(categoryName)) {
            showToast('Category already exists', 'error');
            return;
        }
        
        // Add new category
        categories.push(categoryName);
        
        // Save to local storage
        localStorage.setItem('youtubeCategories', JSON.stringify(categories));
        
        // Clear input
        ytCategoryInput.value = '';
        
        // Reload categories
        loadCategories();
        
        // Show success message
        showToast('Category added successfully', 'success');
    }
    
    /**
     * Load and display YouTube links
     * @param {string} searchTerm - Optional search term
     * @param {string} categoryFilter - Optional category filter
     */
    function loadLinks(searchTerm = '', categoryFilter = '') {
        // Get links from localStorage
        const links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        
        // Filter links based on search term and category
        const filteredLinks = links.filter(link => {
            const matchesSearch = searchTerm ? 
                link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                link.url.toLowerCase().includes(searchTerm.toLowerCase()) : 
                true;
                
            const matchesCategory = categoryFilter ? 
                link.category === categoryFilter : 
                true;
                
            return matchesSearch && matchesCategory;
        });
        
        // Update count
        ytLinksCount.textContent = filteredLinks.length;
        
        // Clear list
        ytLinksGrid.innerHTML = '';
        
        // If no links, show message
        if (filteredLinks.length === 0) {
            ytLinksGrid.innerHTML = `
                <div class="yt-empty-state">
                    <i class="fa-brands fa-youtube yt-empty-icon"></i>
                    <h3 class="yt-empty-title">No YouTube links added yet</h3>
                    <p class="yt-empty-subtitle">Add your favorite YouTube videos to keep them organized.</p>
                </div>
            `;
            return;
        }
        
        // Sort links by dateAdded (newest first)
        filteredLinks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        
        // Render each link
        filteredLinks.forEach(link => {
            const linkElement = createLinkElement(link);
            ytLinksGrid.appendChild(linkElement);
        });
    }
    
    /**
     * Load and display categories
     */
    function loadCategories() {
        // Get categories from localStorage
        const categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
        
        // Clear category filter options (except the default)
        ytCategoryFilter.innerHTML = `
            <option value="">All Categories</option>
        `;
        
        // Clear category select options (except the default)
        ytLinkCategory.innerHTML = `
            <option value="">No Category</option>
        `;
        
        // Add categories to filter and select
        categories.forEach(category => {
            // Add to filter
            const filterOption = document.createElement('option');
            filterOption.value = category;
            filterOption.textContent = category;
            ytCategoryFilter.appendChild(filterOption);
            
            // Add to select
            const selectOption = document.createElement('option');
            selectOption.value = category;
            selectOption.textContent = category;
            ytLinkCategory.appendChild(selectOption);
        });
        
        // Clear categories list
        ytCategoriesList.innerHTML = '';
        
        // Add categories to list with delete button
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'yt-category-item';
            categoryItem.innerHTML = `
                <span>${category}</span>
                <button class="delete-category-btn" data-category="${category}">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            ytCategoriesList.appendChild(categoryItem);
            
            // Add event listener for delete button
            const deleteBtn = categoryItem.querySelector('.delete-category-btn');
            deleteBtn.addEventListener('click', function() {
                deleteCategory(this.dataset.category);
            });
        });
    }
    
    /**
     * Create a YouTube link element
     * @param {Object} link - Link data
     * @returns {HTMLElement} - The link element
     */
    function createLinkElement(link) {
        // Create link element
        const linkElement = document.createElement('div');
        linkElement.className = 'yt-link-card';
        linkElement.setAttribute('draggable', 'true');
        linkElement.dataset.id = link.id;
        
        // Format date
        const dateAdded = new Date(link.dateAdded);
        const formattedDate = `${dateAdded.toLocaleDateString()} at ${dateAdded.toLocaleTimeString()}`;
        
        // Format duration if available
        let durationDisplay = '';
        if (link.duration) {
            const minutes = Math.floor(link.duration / 60);
            const seconds = link.duration % 60;
            durationDisplay = `
                <span class="yt-link-duration">
                    <i class="fa-regular fa-clock"></i>
                    ${minutes}:${seconds.toString().padStart(2, '0')}
                </span>
            `;
        }
        
        // Create thumbnail URL if not provided
        const thumbnailUrl = link.thumbnailUrl || `https://img.youtube.com/vi/${link.videoId}/0.jpg`;
        
        // Build HTML
        linkElement.innerHTML = `
            <div class="yt-link-thumbnail">
                <img src="${thumbnailUrl}" alt="${link.title}" onerror="this.src='placeholder.jpg'">
                <a href="${link.url}" target="_blank" class="yt-play-button">
                    <i class="fa-solid fa-play"></i>
                </a>
            </div>
            <div class="yt-link-content">
                <h3 class="yt-link-title">
                    <a href="${link.url}" target="_blank">${link.title}</a>
                </h3>
                <div class="yt-link-meta">
                    <span class="yt-link-platform youtube">
                        <i class="fa-brands fa-youtube"></i>
                    </span>
                    ${link.channel ? `<span class="yt-link-channel">${link.channel}</span>` : ''}
                    ${link.category ? `<span class="yt-link-category">${link.category}</span>` : ''}
                    ${durationDisplay}
                    <span class="yt-link-date" title="${formattedDate}">
                        <i class="fa-regular fa-calendar"></i>
                        ${formatRelativeTime(dateAdded)}
                    </span>
                </div>
            </div>
            <div class="yt-link-actions">
                <button class="yt-link-action-btn delete-yt-link" data-id="${link.id}" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button class="yt-link-action-btn copy-yt-link" data-url="${link.url}" title="Copy link">
                    <i class="fa-solid fa-copy"></i>
                </button>
                <button class="yt-link-action-btn schedule-yt-link" data-id="${link.id}" title="Schedule">
                    <i class="fa-solid fa-calendar-plus"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const deleteBtn = linkElement.querySelector('.delete-yt-link');
        deleteBtn.addEventListener('click', function() {
            deleteLink(this.dataset.id);
        });
        
        const copyBtn = linkElement.querySelector('.copy-yt-link');
        copyBtn.addEventListener('click', function() {
            copyToClipboard(this.dataset.url);
            showToast('Link copied to clipboard', 'success');
        });
        
        const scheduleBtn = linkElement.querySelector('.schedule-yt-link');
        scheduleBtn.addEventListener('click', function() {
            scheduleYouTubeLink(this.dataset.id);
        });
        
        // Add drag event listeners for scheduler integration
        linkElement.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'youtube',
                id: link.id
            }));
            this.classList.add('dragging');
        });
        
        linkElement.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
        
        return linkElement;
    }
    
    /**
     * Delete a YouTube link
     * @param {string} id - Link ID
     */
    function deleteLink(id) {
        // Ask for confirmation
        if (!confirm('Are you sure you want to delete this link?')) {
            return;
        }
        
        // Get links from localStorage
        let links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        
        // Filter out the link to delete
        links = links.filter(link => link.id !== id);
        
        // Save to localStorage
        localStorage.setItem('youtubeLinks', JSON.stringify(links));
        
        // Reload links
        loadLinks(ytSearchInput.value.trim(), ytCategoryFilter.value);
        
        // Show success message
        showToast('Link deleted successfully', 'success');
    }
    
    /**
     * Delete a category
     * @param {string} category - Category name
     */
    function deleteCategory(category) {
        // Ask for confirmation
        if (!confirm(`Are you sure you want to delete the category "${category}"? Links in this category will not be deleted but will no longer have a category assigned.`)) {
            return;
        }
        
        // Get categories from localStorage
        let categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
        
        // Filter out the category to delete
        categories = categories.filter(cat => cat !== category);
        
        // Save to localStorage
        localStorage.setItem('youtubeCategories', JSON.stringify(categories));
        
        // Update links to remove this category
        let links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        
        // Update each link with this category
        const updatedLinks = links.map(link => {
            if (link.category === category) {
                return { ...link, category: '' };
            }
            return link;
        });
        
        // Save updated links
        localStorage.setItem('youtubeLinks', JSON.stringify(updatedLinks));
        
        // Reload categories
        loadCategories();
        
        // Reload links
        loadLinks(ytSearchInput.value.trim(), ytCategoryFilter.value);
        
        // Show success message
        showToast('Category deleted successfully', 'success');
    }
    
    /**
     * Schedule a YouTube link in the scheduler
     * @param {string} id - Link ID
     */
    function scheduleYouTubeLink(id) {
        // Find the link
        const links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        const link = links.find(l => l.id === id);
        
        if (!link) return;
        
        // Get the current date
        const now = new Date();
        const hour = now.getHours();
        
        // Create start and end times (default duration: video duration or 30 minutes)
        const startTime = new Date();
        startTime.setHours(hour + 1, 0, 0, 0); // Schedule for next hour
        
        const endTime = new Date(startTime);
        // If we have duration from video metadata, use it
        if (link.duration) {
            endTime.setTime(startTime.getTime() + (link.duration * 1000));
        } else {
            endTime.setMinutes(startTime.getMinutes() + 30); // Default: 30 minutes
        }
        
        // Create scheduled item
        const scheduledTasks = JSON.parse(localStorage.getItem('scheduledTasks') || '[]');
        
        const newItem = {
            id: Date.now().toString(),
            youtubeId: link.id,
            title: `Watch: ${link.title}`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            category: link.category || 'entertainment',
            url: link.url,
            itemType: 'youtube',
            createdAt: new Date().toISOString()
        };
        
        scheduledTasks.push(newItem);
        
        // Save to localStorage
        localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
        
        // Update scheduler display if function exists
        if (typeof updateScheduler === 'function') {
            updateScheduler();
        }
        
        // Show success message
        showToast('YouTube video scheduled successfully', 'success');
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    function copyToClipboard(text) {
        // Use clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    // Fallback to old method
                    legacyCopyToClipboard(text);
                });
        } else {
            // Fallback for older browsers
            legacyCopyToClipboard(text);
        }
    }
    
    /**
     * Legacy method to copy text to clipboard
     * @param {string} text - Text to copy
     */
    function legacyCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Avoid scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Error in copying text: ', err);
        }
        
        document.body.removeChild(textarea);
    }
    
    /**
     * Extract YouTube video ID from URL
     * @param {string} url - YouTube URL
     * @returns {string|null} - Video ID or null if not found
     */
    function extractYouTubeID(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }
    
    /**
     * Format relative time
     * @param {Date} date - Date to format
     * @returns {string} - Formatted relative time
     */
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
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    }
    
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info)
     */
    function showToast(message, type = 'info') {
        // Check if we have a global notification function
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        
        // Check if we can use Electron's notification API
        if (isElectron) {
            window.electronAPI.showNotification({
                title: type.charAt(0).toUpperCase() + type.slice(1),
                body: message
            }).catch(err => {
                console.error('Error showing notification:', err);
                // Fallback to DOM notification
                showDOMNotification(message, type);
            });
        } else {
            // Fallback to DOM notification
            showDOMNotification(message, type);
        }
    }
    
    /**
     * Show a notification in the DOM
     * @param {string} message - Message to display
     * @param {string} type - Notification type
     */
    function showDOMNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Export the function if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initYouTubeManager };
} else {
    // Make function available globally
    window.initYouTubeManager = initYouTubeManager;
} 