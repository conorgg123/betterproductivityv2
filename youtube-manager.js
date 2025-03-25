// YouTube Manager Implementation
function initYouTubeManager() {
    console.log('Initializing YouTube Manager...');
    
    // Check if we're in Electron environment
    const isElectron = window.electronAPI !== undefined;
    console.log('Electron environment detected:', isElectron);
    
    // Get DOM elements with the correct IDs from index.html
    const ytLinkInput = document.getElementById('youtube-url-input');
    const ytLinkForm = document.querySelector('.youtube-input-container');
    const ytLinkTitle = document.getElementById('youtube-title-input') || document.createElement('input'); // Might not exist in HTML
    const ytLinkCategory = document.getElementById('youtube-category');
    const ytLinksGrid = document.getElementById('youtube-links-list');
    const ytLinksCount = document.querySelector('.youtube-count');
    const ytCategoryFilter = document.getElementById('category-filter');
    const ytSearchInput = document.getElementById('youtube-search-input') || document.createElement('input'); // Might not exist
    const ytLinkValidation = document.querySelector('.validation-message');
    const ytAddButton = document.getElementById('add-youtube-link');
    const ytPreviewContainer = document.querySelector('.youtube-preview');
    
    // New category elements
    const showAddCategoryBtn = document.getElementById('show-add-category');
    const addCategoryForm = document.getElementById('add-category-form');
    const newCategoryInput = document.getElementById('new-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const cancelCategoryBtn = document.getElementById('cancel-category-btn');
    
    // Check if elements exist and log warnings for missing elements
    if (!ytLinkInput) console.warn('YouTube URL input element not found');
    if (!ytLinkForm) console.warn('YouTube form container not found');
    if (!ytLinkCategory) console.warn('YouTube category select not found');
    if (!ytLinksGrid) console.warn('YouTube links list not found');
    if (!ytLinksCount) console.warn('YouTube count element not found');
    if (!ytCategoryFilter) console.warn('Category filter not found');
    if (!ytLinkValidation) console.warn('Validation message element not found');
    if (!ytAddButton) console.warn('Add button not found');
    if (!ytPreviewContainer) console.warn('Preview container not found');
    
    // Load links and categories
    loadLinks();
    loadCategories();
    
    // Add event listeners
    if (ytLinkInput) {
        ytLinkInput.addEventListener('input', validateYouTubeLink);
        ytLinkInput.addEventListener('blur', fetchVideoMetadata);
        ytLinkInput.addEventListener('paste', function(e) {
            // Short timeout to allow the pasted content to be inserted
            setTimeout(() => {
                if (validateYouTubeLink()) {
                    fetchVideoMetadata();
                }
            }, 100);
        });
    }
    
    // Add event listener directly to the Add button
    if (ytAddButton) {
        ytAddButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add button clicked directly');
            addLink();
        });
    }
    
    if (ytLinkForm) {
        ytLinkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            addLink();
        });
    }
    
    if (ytSearchInput) {
        ytSearchInput.addEventListener('input', function() {
            loadLinks(ytCategoryFilter ? ytCategoryFilter.value : '', this.value.trim());
        });
    }
    
    if (ytCategoryFilter) {
        ytCategoryFilter.addEventListener('change', function() {
            loadLinks(this.value, ytSearchInput ? ytSearchInput.value.trim() : '');
        });
    }
    
    // Add event listeners for category management
    if (showAddCategoryBtn) {
        showAddCategoryBtn.addEventListener('click', () => {
            addCategoryForm.style.display = 'flex';
            showAddCategoryBtn.style.display = 'none';
            newCategoryInput.focus();
        });
    }
    
    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', () => {
            addCategoryForm.style.display = 'none';
            showAddCategoryBtn.style.display = 'inline-flex';
            newCategoryInput.value = '';
        });
    }
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addNewCategory();
        });
    }
    
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewCategory();
        });
    }
    
    /**
     * Validate YouTube link
     */
    function validateYouTubeLink() {
        const url = ytLinkInput ? ytLinkInput.value.trim() : '';
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        
        // Clear validation message
        if (ytLinkValidation) {
            ytLinkValidation.style.display = 'none';
        }
        
        if (!url) {
            if (ytLinkValidation) {
                ytLinkValidation.textContent = 'Please enter a YouTube link';
                ytLinkValidation.style.display = 'block';
            }
            return false;
        }
        
        // Validate YouTube URL
        if (!ytRegex.test(url)) {
            if (ytLinkValidation) {
                ytLinkValidation.textContent = 'Please enter a valid YouTube link';
                ytLinkValidation.style.display = 'block';
            }
            return false;
        }
        
        // Return true without fetching metadata
        return true;
    }
    
    /**
     * Create a preview element to show the video details
     */
    function showVideoPreview(videoDetails) {
        console.log('Showing video preview:', videoDetails);
        
        if (!videoDetails || (!videoDetails.title && !videoDetails.thumbnail) || !ytPreviewContainer) {
            console.error('Invalid video details for preview or container not found');
            return;
        }
        
        // Default thumbnail if not provided
        const thumbnail = videoDetails.thumbnail || 'https://via.placeholder.com/120x68?text=No+Thumbnail';
        const title = videoDetails.title || 'YouTube Video';
        
        // Update the preview container
        ytPreviewContainer.innerHTML = `
            <div class="yt-preview">
                <div class="yt-preview-thumbnail">
                    <img src="${thumbnail}" alt="Video thumbnail" onerror="this.src='https://via.placeholder.com/120x68?text=No+Thumbnail'">
                </div>
                <div class="yt-preview-info">
                    <h4 class="yt-preview-title">${title}</h4>
                </div>
            </div>
        `;
        
        // Set the title in a hidden input or create one if it doesn't exist
        if (ytLinkTitle) {
            ytLinkTitle.value = title;
        } else {
            // Create a hidden input for the title if it doesn't exist
            const hiddenTitle = document.createElement('input');
            hiddenTitle.type = 'hidden';
            hiddenTitle.id = 'youtube-title-input';
            hiddenTitle.value = title;
            ytLinkForm.appendChild(hiddenTitle);
        }
    }
    
    /**
     * Fetch video metadata when the input loses focus
     */
    async function fetchVideoMetadata() {
        if (!ytLinkInput) return;
        
        const url = ytLinkInput.value.trim();
        if (!url) return;
        
        // Basic validation
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        if (!ytRegex.test(url)) return;
        
        // Show loading indicator
        if (ytPreviewContainer) {
            ytPreviewContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading video details...</div>';
        }
        
        try {
            let videoDetails;
            
            if (isElectron) {
                // Try using Electron API first
                try {
                    console.log('Fetching video info via Electron API:', url);
                    videoDetails = await window.electronAPI.getYouTubeInfo(url);
                    console.log('Received video details from Electron API:', videoDetails);
                } catch (electronError) {
                    console.error('Error from Electron API:', electronError);
                }
            }
            
            // If Electron API failed or not available, use oEmbed as fallback
            if (!videoDetails || !videoDetails.title) {
                const videoId = extractVideoId(url);
                if (!videoId) {
                    if (ytPreviewContainer) {
                        ytPreviewContainer.innerHTML = '<div class="error-message">Could not extract video ID</div>';
                    }
                    return;
                }
                
                try {
                    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
                    if (response.ok) {
                        const data = await response.json();
                        
                        videoDetails = {
                            id: videoId,
                            title: data.title,
                            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                        };
                        console.log('Fetched video details via oEmbed:', videoDetails);
                    } else {
                        throw new Error('oEmbed request failed');
                    }
                } catch (oembedError) {
                    console.warn('oEmbed API failed:', oembedError);
                    // Create basic details as last resort
                    videoDetails = {
                        id: videoId,
                        title: 'YouTube Video',
                        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                    };
                }
            }
            
            // Display preview if we have details
            if (videoDetails && videoDetails.title) {
                showVideoPreview(videoDetails);
            } else if (ytPreviewContainer) {
                ytPreviewContainer.innerHTML = '<div class="error-message">Could not fetch video details</div>';
            }
        } catch (error) {
            console.error('Error fetching video metadata:', error);
            if (ytPreviewContainer) {
                ytPreviewContainer.innerHTML = '<div class="error-message">Error fetching video details</div>';
            }
        }
    }
    
    /**
     * Add a new YouTube link
     */
    async function addLink() {
        if (!ytLinkInput) {
            console.error('YouTube input element not found');
            showNotification('Error: YouTube input element not found', 'error');
            return;
        }
        
        const url = ytLinkInput.value.trim();
        console.log('Add button clicked. URL:', url);
        
        if (!url) {
            console.error('Empty URL provided');
            showNotification('Please enter a YouTube URL', 'error');
            return;
        }
        
        if (!validateYouTubeLink()) {
            console.error('URL validation failed');
            return;
        }
        
        try {
            // Get video details
            console.log('Fetching video details for:', url);
            const videoDetails = await window.electronAPI.getYouTubeInfo(url);
            console.log('Video details received:', videoDetails);
            
            if (!videoDetails || videoDetails.error) {
                throw new Error(videoDetails?.error || 'Failed to fetch video details');
            }
            
            // Get selected category
            const category = ytLinkCategory ? ytLinkCategory.value : 'Uncategorized';
            
            // Create link data object
            const linkData = {
                id: Date.now().toString(),
                url: url,
                title: videoDetails.title || 'YouTube Video',
                videoId: videoDetails.id,
                thumbnail: videoDetails.thumbnail,
                duration: videoDetails.duration || 'Unknown',
                category: category,
                dateAdded: new Date().toISOString()
            };
            
            console.log('Adding link with data:', linkData);
            
            // Save to storage using IPC
            const result = await window.electronAPI.addYouTubeLink(linkData);
            console.log('Add link result:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to add link');
            }
            
            // Clear input field
            ytLinkInput.value = '';
            
            // Clear title field if it exists
            if (ytLinkTitle) {
                ytLinkTitle.value = '';
            }
            
            // Clear preview container
            if (ytPreviewContainer) {
                ytPreviewContainer.innerHTML = '';
            }
            
            // Load links directly from store to avoid errors
            await loadLinksWithRetry();
            
            // Show success notification
            showNotification('YouTube link added successfully', 'success');
        } catch (error) {
            console.error('Error in addLink function:', error);
            showNotification(`Error adding link: ${error.message}`, 'error');
        }
    }
    
    /**
     * Load YouTube links with retry mechanism
     */
    async function loadLinksWithRetry(categoryFilter = '', searchQuery = '', maxRetries = 3) {
        let retries = 0;
        let success = false;
        
        while (!success && retries < maxRetries) {
            try {
                console.log(`Attempt ${retries + 1} to load links`);
                
                // Get links from storage
                let links = await window.electronAPI.getYouTubeLinks();
                console.log('Retrieved links:', links);
                
                if (!Array.isArray(links)) {
                    console.warn('Links is not an array, using empty array instead');
                    links = [];
                }
                
                // Apply filters
                if (categoryFilter && categoryFilter !== '' && categoryFilter !== 'all') {
                    links = links.filter(link => link.category === categoryFilter);
                }
                
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    links = links.filter(link => 
                        link.title?.toLowerCase().includes(query) || 
                        link.url?.toLowerCase().includes(query)
                    );
                }
                
                // Update count
                if (ytLinksCount) {
                    ytLinksCount.textContent = links.length;
                }
                
                // Ensure grid element exists
                if (!ytLinksGrid) {
                    console.error('YouTube links grid element not found');
                    throw new Error('YouTube links grid element not found');
                }
                
                // Clear grid
                ytLinksGrid.innerHTML = '';
                
                if (links.length === 0) {
                    ytLinksGrid.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-video empty-icon"></i>
                            <p>No YouTube links found</p>
                            ${searchQuery || categoryFilter !== '' && categoryFilter !== 'all' ? '<p>Try clearing your filters</p>' : ''}
                        </div>
                    `;
                    return;
                }
                
                // Sort by date added (newest first)
                links.sort((a, b) => {
                    if (!a.dateAdded) return 1;
                    if (!b.dateAdded) return -1;
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                });
                
                // Create link cards
                links.forEach(link => {
                    try {
                        const linkElement = createYouTubeLinkElement(link);
                        ytLinksGrid.appendChild(linkElement);
                    } catch (itemError) {
                        console.error('Error creating link element:', itemError, link);
                    }
                });
                
                success = true;
            } catch (error) {
                console.error(`Error loading links (attempt ${retries + 1}):`, error);
                retries++;
                
                if (retries >= maxRetries) {
                    if (ytLinksGrid) {
                        ytLinksGrid.innerHTML = `
                            <div class="error-state">
                                <i class="fas fa-exclamation-triangle error-icon"></i>
                                <p>Error loading links</p>
                                <p class="error-message">${error.message}</p>
                            </div>
                        `;
                    }
                    showNotification('Error loading links. Please restart the application.', 'error');
                } else {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
    }

    // Replace the old loadLinks function with our new retry version
    const loadLinks = loadLinksWithRetry;
    
    /**
     * Load categories
     */
    async function loadCategories() {
        try {
            let categories;
            
            if (isElectron) {
                // Use Electron API
                categories = await window.electronAPI.getYouTubeCategories();
            } else {
                // Browser storage fallback
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
            }
            
            // Clear category options in filter and form
            ytCategoryFilter.innerHTML = '<option value="">All Categories</option>';
            ytLinkCategory.innerHTML = '<option value="">No Category</option>';
            
            // Add categories to selects
            categories.forEach(category => {
                const filterOption = document.createElement('option');
                filterOption.value = category;
                filterOption.textContent = category;
                ytCategoryFilter.appendChild(filterOption);
                
                const formOption = document.createElement('option');
                formOption.value = category;
                formOption.textContent = category;
                ytLinkCategory.appendChild(formOption);
            });
            
            // Display categories list
            ytCategoriesList.innerHTML = '';
            
            categories.forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'yt-category-item';
                categoryElement.innerHTML = `
                    <span>${category}</span>
                    <button class="yt-category-delete" data-category="${category}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                ytCategoriesList.appendChild(categoryElement);
                
                // Add delete event listener
                categoryElement.querySelector('.yt-category-delete').addEventListener('click', () => {
                    deleteCategory(category);
                });
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    /**
     * Create a link element
     */
    function createYouTubeLinkElement(linkData) {
        const linkElement = document.createElement('div');
        linkElement.className = 'youtube-link-item';
        linkElement.draggable = true;

        const thumbnailUrl = linkData.thumbnail || 'path/to/default-thumbnail.jpg';
        const title = linkData.title || 'Untitled Video';
        const duration = linkData.duration || '--:--';
        const category = linkData.category || 'Uncategorized';

        linkElement.innerHTML = `
            <div class="youtube-link-thumbnail">
                <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                <span class="youtube-link-duration">${duration}</span>
            </div>
            <div class="youtube-link-content">
                <h3 class="youtube-link-title">
                    <a href="${linkData.url}" target="_blank" title="${title}">${title}</a>
                </h3>
                <div class="youtube-link-meta">
                    <span class="youtube-link-category">${category}</span>
                </div>
            </div>
            <div class="youtube-link-actions">
                <button class="youtube-link-action-btn schedule-youtube-link" title="Schedule">
                    <i class="fas fa-calendar-plus"></i>
                </button>
                <button class="youtube-link-action-btn delete-youtube-link" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners for drag and drop
        linkElement.addEventListener('dragstart', handleDragStart);
        linkElement.addEventListener('dragend', handleDragEnd);

        // Add event listeners for actions
        const deleteBtn = linkElement.querySelector('.delete-youtube-link');
        const scheduleBtn = linkElement.querySelector('.schedule-youtube-link');

        deleteBtn.addEventListener('click', () => deleteYouTubeLink(linkData.id));
        scheduleBtn.addEventListener('click', () => scheduleYouTubeLink(linkData));

        return linkElement;
    }
    
    /**
     * Delete a category
     */
    async function deleteCategory(category) {
        if (!confirm(`Are you sure you want to delete the category "${category}"?`)) {
            return;
        }
        
        try {
            let categories;
            
            if (isElectron) {
                categories = await window.electronAPI.getYouTubeCategories();
                categories = categories.filter(c => c !== category);
                await window.electronAPI.storeSet('youtube-categories', categories);
            } else {
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
                categories = categories.filter(c => c !== category);
                localStorage.setItem('youtubeCategories', JSON.stringify(categories));
            }
            
            // Reload categories
            loadCategories();
            
            // Show success notification
            showNotification('Category deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification('Error deleting category', 'error');
        }
    }
    
    /**
     * Copy text to clipboard
     */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }
    
    /**
     * Delete a link
     */
    async function deleteYouTubeLink(id) {
        if (!confirm('Are you sure you want to delete this link?')) {
            return;
        }
        
        try {
            let links;
            
            if (isElectron) {
                links = await window.electronAPI.getYouTubeLinks();
                links = links.filter(link => link.id !== id);
                await window.electronAPI.storeSet('youtube-links', links);
            } else {
                links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
                links = links.filter(link => link.id !== id);
                localStorage.setItem('youtubeLinks', JSON.stringify(links));
            }
            
            // Reload links
            loadLinks(ytCategoryFilter ? ytCategoryFilter.value : '', ytSearchInput ? ytSearchInput.value.trim() : '');
            
            // Show success notification
            showNotification('Link deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting link:', error);
            showNotification('Error deleting link', 'error');
        }
    }
    
    /**
     * Schedule a YouTube link in the scheduler
     */
    function scheduleYouTubeLink(link) {
        // Calculate duration (default to 10 minutes if not available)
        let durationMinutes = 10;
        if (link.duration) {
            const durationParts = link.duration.split(':');
            if (durationParts.length === 2) {
                durationMinutes = parseInt(durationParts[0]) + (parseInt(durationParts[1]) / 60);
            }
        }
        
        // Get current time rounded to nearest 15 minutes
        const now = new Date();
        const minutes = Math.ceil(now.getMinutes() / 15) * 15;
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minutes);
        
        // Calculate end time (at least 15 minutes)
        const endTimeMinutes = Math.max(15, Math.ceil(durationMinutes / 15) * 15);
        const endTime = new Date(startTime.getTime() + endTimeMinutes * 60000);
        
        // Create scheduled item
        const scheduledItem = {
            id: `yt-${Date.now()}`,
            title: link.title,
            type: 'youtube',
            url: link.url,
            thumbnail: link.thumbnail,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            color: '#ff0000' // YouTube red color
        };
        
        // Dispatch custom event to be caught by scheduler.js
        const event = new CustomEvent('schedule-item', { detail: scheduledItem });
        document.dispatchEvent(event);
        
        showNotification('YouTube video scheduled', 'success');
    }
    
    /**
     * Extract video ID from YouTube URL
     */
    function extractVideoId(url) {
        try {
            // Handle YouTube Shorts URLs
            if (url.includes('youtube.com/shorts/')) {
                const shortsRegExp = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
                const match = url.match(shortsRegExp);
                return match ? match[1] : null;
            }
            
            // Handle standard YouTube URLs
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[7] && match[7].length === 11) ? match[7] : null;
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return null;
        }
    }
    
    /**
     * Create a fallback ID in case URL parsing fails
     */
    function createFallbackId(url) {
        // Generate a consistent ID based on the URL
        return 'fb_' + Math.abs(url.split('').reduce((a, b) => (a * 31 + b.charCodeAt(0)) | 0, 0)).toString(16).substring(0, 9);
    }
    
    /**
     * Format relative time (e.g., "2 days ago")
     */
    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffDay > 0) {
            return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
        } else if (diffHour > 0) {
            return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
        } else if (diffMin > 0) {
            return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
        } else {
            return 'just now';
        }
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'success') {
        // If Electron is available, use native notifications
        if (isElectron && type === 'success') {
            window.electronAPI.showNotification({
                title: 'YouTube Manager',
                body: message
            });
            return;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    /**
     * Add a new category
     */
    async function addNewCategory() {
        const categoryName = newCategoryInput.value.trim();
        
        if (!categoryName) {
            showNotification('Please enter a category name', 'error');
            return;
        }
        
        try {
            let categories;
            
            if (isElectron) {
                // Get existing categories
                categories = await window.electronAPI.getYouTubeCategories();
                
                // Check if category already exists
                if (categories.includes(categoryName)) {
                    showNotification('Category already exists', 'error');
                    return;
                }
                
                // Add new category
                categories.push(categoryName);
                await window.electronAPI.storeSet('youtube-categories', categories);
            } else {
                // Browser storage fallback
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
                
                // Check if category already exists
                if (categories.includes(categoryName)) {
                    showNotification('Category already exists', 'error');
                    return;
                }
                
                // Add new category
                categories.push(categoryName);
                localStorage.setItem('youtubeCategories', JSON.stringify(categories));
            }
            
            // Reset form
            newCategoryInput.value = '';
            addCategoryForm.style.display = 'none';
            showAddCategoryBtn.style.display = 'inline-flex';
            
            // Reload categories
            loadCategories();
            
            // Show success notification
            showNotification('Category added successfully', 'success');
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification('Error adding category', 'error');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initYouTubeManager);

// Make function available globally
window.initYouTubeManager = initYouTubeManager; 