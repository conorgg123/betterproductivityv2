// Global variables
let videoDetails = null;

// Initialize these variables if they aren't already declared
let youtubeUrlInput, ytValidationMessage, ytLinkSubmitBtn, linkCountElement, previewContainer;
let isElectron, electronAPIReady;

// YouTube Manager Implementation
function initYouTubeManager() {
    console.log("Initializing YouTube Manager...");
    
    // Check if we're in Electron environment
    isElectron = window.electronAPI !== undefined;
    
    // Check if Electron API is ready
    electronAPIReady = isElectron && window.electronAPI && 
                      typeof window.electronAPI.getYouTubeLinks === 'function' &&
                      typeof window.electronAPI.storeSet === 'function';
    
    console.log(`Running in Electron: ${isElectron}, API Ready: ${electronAPIReady}`);
    
    // Set storage mode
    youtubeStorageMode = electronAPIReady ? 'electron' : 'localStorage';
    console.log(`Using storage mode: ${youtubeStorageMode}`);

    // Get DOM elements
    ytLinkInput = document.getElementById('youtube-link-input');
    ytLinkValidation = document.getElementById('youtube-link-validation');
    ytAddLinkButton = document.getElementById('add-youtube-link');
    ytLinksContainer = document.getElementById('youtube-links-container');
    ytNoLinksMessage = document.getElementById('no-youtube-links-message');
    ytLinkCategory = document.getElementById('youtube-link-category');
    ytCategoryFilter = document.getElementById('youtube-category-filter');
    ytPreviewContainer = document.getElementById('youtube-preview-container');
    ytLinksList = document.getElementById('youtube-links-list');
    
    // Initialize category elements
    initializeCategoryManagement();
    
    // Load categories and links
    loadCategories().then(() => loadLinks());
    
    // Add event listeners for the YouTube link input
    if (ytLinkInput) {
        ytLinkInput.addEventListener('input', validateYouTubeLink);
        ytLinkInput.addEventListener('paste', () => {
            // Short delay to allow paste to complete
            setTimeout(validateYouTubeLink, 50);
        });
    }
    
    // Add event listener for the add link button
    if (ytAddLinkButton) {
        ytAddLinkButton.addEventListener('click', addLink);
    }
    
    // Add event listener for category filter
    if (ytCategoryFilter) {
        ytCategoryFilter.addEventListener('change', filterLinksByCategory);
    }

    // Enable drag and drop functionality for links
    if (ytLinksList) {
        enableDragAndDrop();
    }
}

/**
 * Initialize category management features
 */
function initializeCategoryManagement() {
    const categoryNameInput = document.getElementById('category-name-input');
    const addCategoryBtn = document.getElementById('add-new-category-btn');
    const categoriesList = document.getElementById('categories-list');
    
    if (addCategoryBtn && categoryNameInput) {
        // Add event listener for adding new categories
        addCategoryBtn.addEventListener('click', async () => {
            const categoryName = categoryNameInput.value.trim();
            
            if (!categoryName) {
                showNotification('Please enter a category name', 'error');
                categoryNameInput.classList.add('error');
                setTimeout(() => categoryNameInput.classList.remove('error'), 1000);
                return;
            }
            
            try {
                await addNewCategory(categoryName);
                
                // Reset input field
                categoryNameInput.value = '';
                
                // Show success message
                showNotification('Category added successfully', 'success');
            } catch (error) {
                console.error('Error adding category:', error);
                showNotification(error.message || 'Failed to add category', 'error');
            }
        });
        
        // Enable pressing Enter to add category
        categoryNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addCategoryBtn.click();
            }
        });
    }
    
    // Load categories on page load
    loadAndDisplayCategories();
}
    
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
    ytAddButton.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Add button clicked directly');
        
        // First validate the URL
        if (validateYouTubeLink()) {
            try {
                // If we don't already have video details, try to fetch them
                if (!videoDetails) {
                    console.log('Attempting to fetch video metadata before adding');
                    try {
                        await fetchVideoMetadata();
                        console.log('Metadata fetched successfully:', videoDetails);
                    } catch (error) {
                        console.error('Failed to fetch metadata, will use basic details:', error);
                        // We'll continue anyway, addLink will handle creating basic details
                    }
                }
                
                // Always proceed with adding the link, addLink will handle any fallback needed
            addLink();
            } catch (error) {
                console.error('Error in add button handler:', error);
                showNotification('Error processing the link. Please try again.', 'error');
            }
        } else {
            // URL is invalid, show error
            showNotification('Please enter a valid YouTube URL', 'error');
        }
        });
    }
    
    if (ytLinkForm) {
    ytLinkForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');
        
        // First validate the URL
        if (validateYouTubeLink()) {
            try {
                // If we don't already have video details, try to fetch them
                if (!videoDetails) {
                    console.log('Attempting to fetch video metadata before adding');
                    try {
                        await fetchVideoMetadata();
                        console.log('Metadata fetched successfully:', videoDetails);
                    } catch (error) {
                        console.error('Failed to fetch metadata, will use basic details:', error);
                        // We'll continue anyway, addLink will handle creating basic details
                    }
                }
                
                // Always proceed with adding the link, addLink will handle any fallback needed
            addLink();
            } catch (error) {
                console.error('Error in form submission handler:', error);
                showNotification('Error processing the link. Please try again.', 'error');
            }
        } else {
            // URL is invalid, show error
            showNotification('Please enter a valid YouTube URL', 'error');
        }
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
    
    // More comprehensive YouTube URL regex that handles different formats:
    // Standard: https://www.youtube.com/watch?v=VIDEOID
    // Short: https://youtu.be/VIDEOID
    // Shorts: https://www.youtube.com/shorts/VIDEOID
    // Embed: https://www.youtube.com/embed/VIDEOID
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
        
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
    const match = url.match(ytRegex);
    if (!match) {
            if (ytLinkValidation) {
                ytLinkValidation.textContent = 'Please enter a valid YouTube link';
                ytLinkValidation.style.display = 'block';
            }
            return false;
        }
    
    // Extract and store the video ID from the URL
    const videoId = match[5];
    console.log('Valid YouTube URL, video ID:', videoId);
        
        // Return true without fetching metadata
        return true;
    }
    
    /**
 * Fetches video metadata when input loses focus or Enter is pressed
 * @returns {Promise} Resolves when metadata fetch is complete
 */
function fetchVideoMetadata() {
    return new Promise((resolve, reject) => {
        // Reset validation message
        if (ytLinkValidation) {
            ytLinkValidation.textContent = '';
            ytLinkValidation.style.display = 'none';
            ytLinkValidation.className = 'validation-message';
        }
        
        // Clear previous preview
        if (ytPreviewContainer) {
            ytPreviewContainer.innerHTML = '';
            ytPreviewContainer.style.display = 'none';
        }
        
        // Get URL from input
        const youtubeUrl = ytLinkInput ? ytLinkInput.value.trim() : '';
        
        if (!youtubeUrl) {
            console.log('No YouTube URL provided');
            reject(new Error('No YouTube URL provided'));
            return;
        }
        
        // Basic validation with regex
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
        const match = youtubeUrl.match(youtubeRegex);
        
        if (!match) {
            console.error('Invalid YouTube URL:', youtubeUrl);
            if (ytLinkInput) ytLinkInput.classList.add('error');
            if (ytLinkValidation) {
                ytLinkValidation.textContent = 'Please enter a valid YouTube URL';
                ytLinkValidation.className = 'validation-message error animate-fade-in';
                ytLinkValidation.style.display = 'block';
            }
            
            // Add shake animation to input
            if (ytLinkInput) {
                ytLinkInput.classList.add('error');
                setTimeout(() => {
                    ytLinkInput.classList.remove('error');
                }, 600);
            }
            
            reject(new Error('Invalid YouTube URL'));
            return;
        }
        
        const videoId = match[4];
        
        // Show loading indicator
        if (ytLinkValidation) {
            ytLinkValidation.innerHTML = '<div class="loading-spinner"></div> Fetching video details...';
            ytLinkValidation.className = 'validation-message animate-fade-in';
            ytLinkValidation.style.display = 'block';
        }
        
        console.log('Fetching metadata for video ID:', videoId);
        
        // Try to fetch video data
        let fetchMethod = 'yt-dlp'; // Initial fetch method
        
        // First try using yt-dlp via Electron API (more detailed info)
        if (electronAPIReady && window.electronAPI.getYouTubeVideoInfo) {
            console.log('Fetching with yt-dlp via Electron API');
            window.electronAPI.getYouTubeVideoInfo(`https://www.youtube.com/watch?v=${videoId}`)
                .then(videoData => {
                    console.log('Successfully fetched video data via yt-dlp:', videoData);
                    videoDetails = {
                        id: videoId,
                        title: videoData.title,
                        channel: videoData.channel,
                        thumbnail: videoData.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        duration: videoData.duration,
                        viewCount: videoData.view_count,
                        uploadDate: videoData.upload_date,
                        description: videoData.description || '',
                        formats: videoData.formats || []
                    };
                    
                    if (ytLinkValidation) {
                        ytLinkValidation.innerHTML = '<i class="fas fa-check-circle"></i> Video details retrieved successfully';
                        ytLinkValidation.className = 'validation-message success animate-fade-in';
                    }
                    
                    showVideoPreview(videoDetails);
                    resolve(videoDetails);
                })
                .catch(error => {
                    console.error('Error fetching with yt-dlp:', error);
                    fetchMethod = 'oEmbed'; // Fallback to oEmbed
                    
                    // Try fetching with oEmbed (basic info only)
                    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Successfully fetched video data via oEmbed:', data);
                            videoDetails = {
                                id: videoId,
                                title: data.title,
                                channel: data.author_name,
                                thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                                author: data.author_name,
                                description: ''
                            };
                            
                            if (ytLinkValidation) {
                                ytLinkValidation.innerHTML = '<i class="fas fa-info-circle"></i> Basic video details retrieved (limited info)';
                                ytLinkValidation.className = 'validation-message warning animate-fade-in';
                            }
                            
                            showVideoPreview(videoDetails);
                            resolve(videoDetails);
                        })
                        .catch(error => {
                            console.error('Error fetching with oEmbed:', error);
                            handleFetchError(videoId, error.message);
                            // Still resolve with minimal details
                            resolve(videoDetails);
                        });
                });
        } else {
            // Electron API not available, try oEmbed directly
            console.log('Electron API not available, using oEmbed');
            fetchMethod = 'oEmbed';
            
            fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Successfully fetched video data via oEmbed:', data);
                        videoDetails = {
                            id: videoId,
                            title: data.title,
                        channel: data.author_name,
                        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        author: data.author_name,
                        description: ''
                    };
                    
                    if (ytLinkValidation) {
                        ytLinkValidation.innerHTML = '<i class="fas fa-info-circle"></i> Basic video details retrieved';
                        ytLinkValidation.className = 'validation-message warning animate-fade-in';
                    }
                    
                    showVideoPreview(videoDetails);
                    resolve(videoDetails);
                })
                .catch(error => {
                    console.error('Error fetching with oEmbed:', error);
                    handleFetchError(videoId, error.message);
                    // Still resolve with minimal details
                    resolve(videoDetails);
                });
        }
    });
}

/**
 * Handle errors during video fetch
 */
function handleFetchError(videoId, errorMessage) {
    console.error('Failed to fetch video details:', errorMessage);
    
    // Create minimal video details from ID as last resort
                    videoDetails = {
                        id: videoId,
                        title: 'YouTube Video',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        description: '',
        author: '',
        channel: ''
    };
    
    if (ytLinkValidation) {
        ytLinkValidation.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            Could not retrieve detailed video info. Basic details will be used. <button id="retry-fetch" class="retry-btn">Retry</button>
        `;
        ytLinkValidation.className = 'validation-message warning animate-fade-in';
        
        // Add retry button functionality
        const retryBtn = ytLinkValidation.querySelector('#retry-fetch');
        if (retryBtn) {
            retryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fetchVideoMetadata();
            });
        }
    }
    
    // Still show preview with minimal details
                showVideoPreview(videoDetails);
}

/**
 * Create a preview element to show the video details
 */
function showVideoPreview(videoDetails) {
    console.log('Showing video preview:', videoDetails);
    
    if (!videoDetails || !videoDetails.id || !ytPreviewContainer) {
        console.error('Missing video details or preview container');
        return;
    }
    
    // Set default values for missing properties
    const thumbnail = videoDetails.thumbnail || `https://i.ytimg.com/vi/${videoDetails.id}/hqdefault.jpg`;
    const title = videoDetails.title || 'YouTube Video';
    const author = videoDetails.channel || videoDetails.author || '';
    const duration = videoDetails.duration ? formatDuration(videoDetails.duration) : '';
    const viewCount = videoDetails.viewCount ? formatCount(videoDetails.viewCount) : '';
    
    // Create preview HTML with animations
    ytPreviewContainer.innerHTML = `
        <div class="video-preview-content animate-fade-in">
            <div class="video-thumbnail-container">
                <img src="${thumbnail}" alt="${title}" class="video-thumbnail">
                <button class="play-button animate-pop-in"><i class="fas fa-play"></i></button>
                ${duration ? `<span class="video-duration">${duration}</span>` : ''}
            </div>
            <div class="video-info">
                <h3 class="video-title">${title}</h3>
                ${author ? `<p class="video-author">${author}</p>` : ''}
                ${viewCount ? `<p class="video-stats">${viewCount} views</p>` : ''}
                <div class="video-actions">
                    <button class="video-action-btn play-video"><i class="fas fa-play"></i> Play</button>
                    <button class="video-action-btn open-video"><i class="fas fa-external-link-alt"></i> Open</button>
                    <button class="video-action-btn download-video"><i class="fas fa-download"></i> Download</button>
                    <button class="video-action-btn clear-preview"><i class="fas fa-times"></i> Clear</button>
                </div>
            </div>
        </div>
        
        <!-- Hidden input fields for form submission -->
        <input type="hidden" name="video-id" id="video-id" value="${videoDetails.id}">
        <input type="hidden" name="video-title" id="video-title" value="${title}">
        <input type="hidden" name="video-author" id="video-author" value="${author}">
        <input type="hidden" name="video-thumbnail" id="video-thumbnail" value="${thumbnail}">
    `;
    
    // Show the preview container with animation
    ytPreviewContainer.style.display = 'block';
    
    // Add event listeners to buttons
    const playButton = ytPreviewContainer.querySelector('.play-button');
    const playVideoBtn = ytPreviewContainer.querySelector('.play-video');
    const openVideoBtn = ytPreviewContainer.querySelector('.open-video');
    const downloadVideoBtn = ytPreviewContainer.querySelector('.download-video');
    const clearPreviewBtn = ytPreviewContainer.querySelector('.clear-preview');
    
    // Play video in a modal
    const playVideo = () => {
        // Create modal for video playback with animations
        const modal = document.createElement('div');
        modal.className = 'youtube-video-modal animate-fade-in';
        modal.innerHTML = `
            <div class="youtube-video-modal-content animate-scale-in">
                <div class="youtube-video-modal-header">
                    <h3>${title}</h3>
                    <button class="youtube-video-modal-close">&times;</button>
                </div>
                <div class="youtube-video-modal-body">
                    <iframe width="100%" height="450" src="https://www.youtube.com/embed/${videoDetails.id}?autoplay=1" 
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Close modal when clicking outside or on close button
        const closeBtn = modal.querySelector('.youtube-video-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.add('animate-fade-out');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('animate-fade-out');
                setTimeout(() => {
                    document.body.removeChild(modal);
                    document.body.style.overflow = '';
                }, 300);
            }
        });
    };
    
    // Open in YouTube
    const openVideo = () => {
        window.open(`https://www.youtube.com/watch?v=${videoDetails.id}`, '_blank');
    };
    
    // Clear preview
    const clearPreview = () => {
        // Add fade out animation
        const previewContent = ytPreviewContainer.querySelector('.video-preview-content');
        if (previewContent) {
            previewContent.classList.add('animate-fade-out');
            setTimeout(() => {
                ytPreviewContainer.innerHTML = '';
                ytPreviewContainer.style.display = 'none';
                videoDetails = null;
                if (ytLinkInput) ytLinkInput.value = '';
                if (ytLinkValidation) {
                    ytLinkValidation.textContent = '';
                    ytLinkValidation.style.display = 'none';
                }
            }, 300);
        } else {
            ytPreviewContainer.innerHTML = '';
            ytPreviewContainer.style.display = 'none';
            videoDetails = null;
            if (ytLinkInput) ytLinkInput.value = '';
            if (ytLinkValidation) {
                ytLinkValidation.textContent = '';
                ytLinkValidation.style.display = 'none';
            }
        }
    };
    
    // Download video - show download options dialog
    const showDownloadOptions = () => {
        // Add code for the download modal with animations
        // This will be expanded in separate function
    };
    
    // Add event listeners
    if (playButton) playButton.addEventListener('click', playVideo);
    if (playVideoBtn) playVideoBtn.addEventListener('click', playVideo);
    if (openVideoBtn) openVideoBtn.addEventListener('click', openVideo);
    if (downloadVideoBtn) downloadVideoBtn.addEventListener('click', showDownloadOptions);
    if (clearPreviewBtn) clearPreviewBtn.addEventListener('click', clearPreview);
}

/**
 * Helper function to format video duration
 */
function formatDuration(seconds) {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Helper function to format view count
 */
function formatCount(count) {
    if (!count) return '';
    
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    } else {
        return count.toString();
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
    
        if (ytLinkValidation) {
            ytLinkValidation.textContent = 'Please enter a YouTube link';
            ytLinkValidation.style.display = 'block';
            ytLinkValidation.className = 'validation-message error';
        }
        
        ytLinkInput.focus();
            return;
        }
        
        try {
        // Check if we have video details from preview
        if (!videoDetails) {
            console.log('No video details available, attempting to fetch metadata first');
            try {
                await fetchVideoMetadata();
            } catch (error) {
                console.error('Error fetching metadata:', error);
                // Create basic fallback details if fetching fails
                videoDetails = createBasicVideoDetails(url);
                console.log('Created fallback video details:', videoDetails);
            }
        }
        
        // If still no video details, create fallback
        if (!videoDetails) {
            console.log('Creating basic fallback video details');
            videoDetails = createBasicVideoDetails(url);
        }
        
        // Create a new YouTube link object
        const videoId = videoDetails.id || extractVideoId(url) || createFallbackId(url);
        
            const linkData = {
            id: `yt_${videoId}_${Date.now()}`,
                url: url,
                title: videoDetails.title || 'YouTube Video',
            thumbnail: videoDetails.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            author: videoDetails.channel || videoDetails.author || '',
            description: videoDetails.description || '',
            category: ytLinkCategory ? ytLinkCategory.value : 'Uncategorized',
            dateAdded: new Date().toISOString(),
            added: new Date().toISOString(),
            viewCount: 0,
            lastViewed: null,
            duration: videoDetails.duration || null
        };
        
        console.log('Created link data:', linkData);
        
        // Save the link to storage
        if (isElectron && electronAPIReady) {
            // Store via Electron API
            let links = await window.electronAPI.getYouTubeLinks();
            links.push(linkData);
            await window.electronAPI.storeSet('youtube-links', links);
            console.log('Saved link via Electron API');
        } else {
            // Store via localStorage
            let links = [];
            try {
                const savedLinksJson = localStorage.getItem('youtubeLinks');
                links = savedLinksJson ? JSON.parse(savedLinksJson) : [];
            } catch (error) {
                console.error('Error reading existing links:', error);
                links = [];
            }
            
            links.push(linkData);
            localStorage.setItem('youtubeLinks', JSON.stringify(links));
            console.log('Saved link via localStorage');
        }
        
        // Clear the input and preview
        ytLinkInput.value = '';
            if (ytPreviewContainer) {
                ytPreviewContainer.innerHTML = '';
            ytPreviewContainer.style.display = 'none';
        }
        
        // Reset video details
        videoDetails = null;
        
        // Show success notification with video title
        showNotification(`Added: "${linkData.title}"`, 'success');
        
        // Reload the links list with the current filter
        const categoryFilter = ytCategoryFilter ? ytCategoryFilter.value : 'all';
        const searchQuery = ytSearchInput ? ytSearchInput.value.trim() : '';
        await loadLinks(categoryFilter, searchQuery);
        
        } catch (error) {
        console.error('Error adding YouTube link:', error);
        showNotification('Failed to add YouTube link', 'error');
        }
    }
    
    /**
 * Load YouTube links and display them in the list
 */
async function loadLinks(categoryFilter = '', searchQuery = '') {
    console.log('Loading YouTube links with filter:', categoryFilter, 'search:', searchQuery);
    
    if (!ytLinksGrid) {
        console.error('YouTube links grid element not found');
        return;
    }
    
    try {
        // Show loading indicator
        ytLinksGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading links...</div>';
        
        // Load links from storage
        let links = [];
        
        if (isElectron && electronAPIReady && window.youtubeStorageMode === 'electron') {
            // Load from Electron store
            try {
                links = await window.electronAPI.getYouTubeLinks();
                console.log('Loaded links from Electron store:', links.length);
            } catch (electronError) {
                console.error('Error loading from Electron store:', electronError);
                console.log('Falling back to localStorage for loading');
                window.youtubeStorageMode = 'localStorage'; // Update storage mode for future operations
                
                // Try localStorage instead
                try {
                    const savedLinksJson = localStorage.getItem('youtubeLinks');
                    links = savedLinksJson ? JSON.parse(savedLinksJson) : [];
                    console.log('Loaded links from localStorage fallback:', links.length);
                } catch (fallbackError) {
                    console.error('Error loading from localStorage fallback:', fallbackError);
                    throw new Error('Failed to load links (both methods failed)');
                }
            }
        } else {
            // Load from localStorage
            try {
                const savedLinksJson = localStorage.getItem('youtubeLinks');
                links = savedLinksJson ? JSON.parse(savedLinksJson) : [];
                console.log('Loaded links from localStorage:', links.length);
            } catch (storageError) {
                console.error('Error loading from localStorage:', storageError);
                throw new Error('Failed to load links from localStorage');
            }
        }
        
        // Apply category filter
        if (categoryFilter && categoryFilter !== 'all') {
                    links = links.filter(link => link.category === categoryFilter);
            console.log(`Filtered to ${links.length} links in category: ${categoryFilter}`);
                }
                
        // Apply search filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    links = links.filter(link => 
                (link.title && link.title.toLowerCase().includes(query)) || 
                (link.author && link.author.toLowerCase().includes(query))
            );
            console.log(`Filtered to ${links.length} links matching search: ${searchQuery}`);
        }
        
        // Sort links by added date (newest first)
        links.sort((a, b) => {
            const dateA = a.added ? new Date(a.added) : new Date(0);
            const dateB = b.added ? new Date(b.added) : new Date(0);
            return dateB - dateA;
        });
        
        // Update the links count
                if (ytLinksCount) {
                    ytLinksCount.textContent = links.length;
                }
                
        // Display empty state if no links
                if (links.length === 0) {
            if (searchQuery || categoryFilter !== 'all') {
                // No results for filter
                    ytLinksGrid.innerHTML = `
                        <div class="empty-state">
                        <i class="fa-solid fa-filter-circle-xmark empty-icon"></i>
                        <p>No YouTube links match your filters</p>
                        <p class="empty-subtitle">Try changing your search or category filter</p>
                        </div>
                    `;
            } else {
                // No links at all
                ytLinksGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-film empty-icon"></i>
                        <p>No YouTube links added yet</p>
                        <p class="empty-subtitle">Add your first link above</p>
                    </div>
                `;
            }
                    return;
                }
                
        // Clear links grid and add new links
        ytLinksGrid.innerHTML = '';
                links.forEach(link => {
                    try {
                        const linkElement = createYouTubeLinkElement(link);
                        ytLinksGrid.appendChild(linkElement);
            } catch (elementError) {
                console.error('Error creating link element:', elementError, link);
            }
        });
        
        // Update the category filter dropdown
        if (ytCategoryFilter) {
            // Save current selection
            const currentSelection = ytCategoryFilter.value;
            
            // Get all categories from links
            const categories = new Set(['all']);
            links.forEach(link => {
                if (link.category) categories.add(link.category);
            });
            
            // Create options for each category
            const options = Array.from(categories).map(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category === 'all' ? 'All Categories' : category;
                option.selected = category === currentSelection;
                return option;
            });
            
            // Clear and update dropdown
            ytCategoryFilter.innerHTML = '';
            options.forEach(option => ytCategoryFilter.appendChild(option));
        }
        
        // Initialize drag and drop for scheduling
        initDragAndDrop();
        
        // Show/hide no links message
        const ytNoLinksMessage = document.getElementById('no-youtube-links-message');
        if (ytNoLinksMessage) {
            if (links.length === 0) {
                ytNoLinksMessage.style.display = 'block';
                ytNoLinksMessage.classList.add('animate-fade-in');
                
                if (searchQuery || categoryFilter !== 'all') {
                    ytNoLinksMessage.textContent = `No links found for the current filter.`;
                } else {
                    ytNoLinksMessage.textContent = 'No YouTube links added yet. Add your first link above.';
                }
            } else {
                ytNoLinksMessage.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error loading YouTube links:', error);
                        ytLinksGrid.innerHTML = `
                            <div class="error-state">
                <i class="fa-solid fa-triangle-exclamation error-icon"></i>
                <p>Error loading YouTube links</p>
                                <p class="error-message">${error.message}</p>
                <button id="retry-load-links" class="retry-btn">
                    <i class="fa-solid fa-rotate"></i> Retry
                </button>
                            </div>
                        `;
        
        // Add retry button event listener
        const retryButton = document.getElementById('retry-load-links');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                loadLinks(categoryFilter, searchQuery);
            });
        }
    }
}

/**
 * Initialize drag and drop for link scheduling
 */
function initDragAndDrop() {
    const linkItems = document.querySelectorAll('.youtube-link-item');
    
    // Add drag events to links
    linkItems.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.getAttribute('data-id'));
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });
    
    // Setup drop target (scheduler)
    const scheduleTimeline = document.getElementById('youtube-schedule-timeline');
    if (scheduleTimeline) {
        scheduleTimeline.addEventListener('dragover', (e) => {
            e.preventDefault();
            scheduleTimeline.classList.add('drag-over');
        });
        
        scheduleTimeline.addEventListener('dragleave', () => {
            scheduleTimeline.classList.remove('drag-over');
        });
        
        scheduleTimeline.addEventListener('drop', async (e) => {
            e.preventDefault();
            scheduleTimeline.classList.remove('drag-over');
            
            const linkId = e.dataTransfer.getData('text/plain');
            if (!linkId) return;
            
            try {
                // Get link data
                let linkData;
                
                if (isElectron && window.electronAPI) {
                    linkData = await window.electronAPI.getYouTubeLinkById(linkId);
                } else {
                    const savedLinksJson = localStorage.getItem('youtubeLinks');
                    if (savedLinksJson) {
                        const savedLinks = JSON.parse(savedLinksJson);
                        linkData = savedLinks.find(link => link.id === linkId);
                    }
                }
                
                if (linkData) {
                    scheduleYouTubeLink(linkData);
                } else {
                    throw new Error('Link not found');
                }
            } catch (error) {
                console.error('Error scheduling link:', error);
                showNotification('Failed to schedule video', 'error');
            }
        });
    }
}
    
    /**
     * Load categories
     */
    async function loadCategories() {
        try {
            let categories;
            
        if (isElectron && electronAPIReady) {
                // Use Electron API
                categories = await window.electronAPI.getYouTubeCategories();
            } else {
                // Browser storage fallback
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
            }
        
        // Add default category if not present
        if (!categories.includes('Uncategorized')) {
            categories.unshift('Uncategorized');
            }
            
            // Clear category options in filter and form
        if (ytCategoryFilter) {
            ytCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
        }
        
        if (ytLinkCategory) {
            ytLinkCategory.innerHTML = '<option value="Uncategorized">Uncategorized</option>';
        }
            
            // Add categories to selects
            categories.forEach(category => {
            if (ytCategoryFilter) {
                const filterOption = document.createElement('option');
                filterOption.value = category;
                filterOption.textContent = category;
                ytCategoryFilter.appendChild(filterOption);
            }
                
            if (ytLinkCategory) {
                const formOption = document.createElement('option');
                formOption.value = category;
                formOption.textContent = category;
                ytLinkCategory.appendChild(formOption);
            }
        });
        
        // Update the categories management list
        displayCategoriesList(categories);
        
        } catch (error) {
            console.error('Error loading categories:', error);
        showNotification('Error loading categories', 'error');
        }
    }
    
    /**
 * Create a YouTube link element for display in the list
     */
    function createYouTubeLinkElement(linkData) {
    if (!linkData || !linkData.id) {
        console.error('Invalid link data provided to createYouTubeLinkElement:', linkData);
        return document.createElement('div'); // Return empty div to avoid errors
    }
    
        const linkElement = document.createElement('div');
    linkElement.className = 'youtube-link-item animate-fade-in';
    linkElement.setAttribute('data-id', linkData.id);
    linkElement.setAttribute('data-category', linkData.category || 'Uncategorized');
    
    // Create thumbnail with a play button overlay
    const thumbnailElement = document.createElement('div');
    thumbnailElement.className = 'youtube-thumbnail';
    thumbnailElement.innerHTML = `
        <img src="${linkData.thumbnail || 'assets/images/default-thumbnail.jpg'}" alt="${linkData.title}">
        <div class="play-button-overlay">
            <i class="fas fa-play"></i>
            </div>
    `;
    
    // Create content section with title, URL, and category
    const contentElement = document.createElement('div');
    contentElement.className = 'youtube-link-content';
    contentElement.innerHTML = `
        <h3 class="youtube-link-title">${linkData.title || 'YouTube Video'}</h3>
        <p class="youtube-link-url">${linkData.url}</p>
                <div class="youtube-link-meta">
            <span class="category-tag">${linkData.category || 'Uncategorized'}</span>
            <span class="added-date">${new Date(linkData.dateAdded).toLocaleDateString()}</span>
                </div>
    `;
    
    // Create actions section with buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'youtube-link-actions';
    actionsElement.innerHTML = `
        <button class="action-btn change-category-btn" title="Change Category">
            <i class="fas fa-tag"></i>
                </button>
        <button class="action-btn open-link-btn" title="Open Link">
            <i class="fas fa-external-link-alt"></i>
        </button>
        <button class="action-btn delete-link-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
    `;
    
    // Add all sections to the link element
    linkElement.appendChild(thumbnailElement);
    linkElement.appendChild(contentElement);
    linkElement.appendChild(actionsElement);
    
    // Add event listeners
    
    // Click on link to open video
    linkElement.addEventListener('click', function() {
        window.open(linkData.url, '_blank');
    });
    
    // Open link in new tab
    const openButton = actionsElement.querySelector('.open-link-btn');
    openButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent link element click
        window.open(linkData.url, '_blank');
    });
    
    // Delete link
    const deleteButton = actionsElement.querySelector('.delete-link-btn');
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent link element click
        deleteLink(linkData.id);
    });
    
    // Change category
    const changeCategoryButton = actionsElement.querySelector('.change-category-btn');
    changeCategoryButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent link element click
        showChangeCategoryDialog(linkData.id);
    });
    
    // Add the link element to the container
    if (ytLinksList) {
        ytLinksList.appendChild(linkElement);
    }

        return linkElement;
    }

/**
 * Mark a link as viewed and update the view count
 */
async function markAsViewed(linkId) {
    try {
        if (isElectron && window.electronAPI) {
            // Update via Electron API
            await window.electronAPI.updateYouTubeLinkViewed(linkId);
        } else {
            // Update via localStorage
            const savedLinksJson = localStorage.getItem('youtubeLinks');
            if (savedLinksJson) {
                const savedLinks = JSON.parse(savedLinksJson);
                const linkIndex = savedLinks.findIndex(link => link.id === linkId);
                
                if (linkIndex !== -1) {
                    // Update the link's view count and last viewed time
                    savedLinks[linkIndex].viewed = true;
                    savedLinks[linkIndex].viewCount = (savedLinks[linkIndex].viewCount || 0) + 1;
                    savedLinks[linkIndex].lastViewed = new Date().toISOString();
                    
                    // Save back to localStorage
                    localStorage.setItem('youtubeLinks', JSON.stringify(savedLinks));
                }
            }
        }
        
        // Reload the links to update the UI
        const categoryFilter = ytCategoryFilter ? ytCategoryFilter.value : '';
        const searchQuery = ytSearchInput ? ytSearchInput.value.trim() : '';
        await loadLinks(categoryFilter, searchQuery);
    } catch (error) {
        console.error('Error marking link as viewed:', error);
    }
}

/**
 * Show dialog to change a link's category
 */
function showChangeCategoryDialog(linkId) {
    // Get link data
    let linkData;
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog animate-fade-in';
    dialog.innerHTML = `
        <div class="modal-content animate-scale-in">
            <div class="modal-header">
                <h3>Change Category</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="change-category-select">Select Category</label>
                    <select id="change-category-select" class="category-select">
                        <option value="Uncategorized">Uncategorized</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-change">Cancel</button>
                <button class="btn btn-primary save-change">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const selectElement = dialog.querySelector('#change-category-select');
    const closeBtn = dialog.querySelector('.modal-close');
    const cancelBtn = dialog.querySelector('.cancel-change');
    const saveBtn = dialog.querySelector('.save-change');
    
    // Load categories into select
    getAllCategories().then(categories => {
        selectElement.innerHTML = ''; // Clear existing options
        
        // Add all categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            selectElement.appendChild(option);
        });
        
        // Get link data to pre-select current category
        getLinkById(linkId).then(link => {
            linkData = link;
            if (link && link.category) {
                selectElement.value = link.category;
            }
        });
    });
    
    // Close dialog function
    const closeDialog = () => {
        dialog.classList.add('animate-fade-out');
        setTimeout(() => {
            document.body.removeChild(dialog);
        }, 300);
    };
    
    // Event listeners
    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
    
    saveBtn.addEventListener('click', async () => {
        const newCategory = selectElement.value;
        
        if (!linkData) {
            showNotification('Error: Link data not found', 'error');
            return;
        }
        
        // Save only if category changed
        if (linkData.category !== newCategory) {
            try {
                await updateLinkCategory(linkId, newCategory);
                showNotification('Category updated successfully', 'success');
                
                // Update UI without full reload
                const linkElement = document.querySelector(`.youtube-link-item[data-id="${linkId}"]`);
                if (linkElement) {
                    linkElement.setAttribute('data-category', newCategory);
                    const categoryTag = linkElement.querySelector('.category-tag');
                    if (categoryTag) {
                        categoryTag.textContent = newCategory;
                    }
                }
                
                // Reapply filter if needed
                filterLinksByCategory();
            } catch (error) {
                console.error('Error updating link category:', error);
                showNotification('Error updating category', 'error');
            }
        }
        
        closeDialog();
    });
}

/**
 * Get a link by ID
 */
async function getLinkById(id) {
    try {
        let links;
        
        if (isElectron && electronAPIReady) {
            links = await window.electronAPI.getYouTubeLinks();
        } else {
            // Browser storage fallback
            const linksJson = localStorage.getItem('youtubeLinks');
            links = linksJson ? JSON.parse(linksJson) : [];
        }
        
        return links.find(link => link.id === id);
    } catch (error) {
        console.error('Error getting link by ID:', error);
        return null;
    }
}

/**
 * Update a link's category
 */
async function updateLinkCategory(linkId, newCategory) {
    try {
        let links;
        
        if (isElectron && electronAPIReady) {
            links = await window.electronAPI.getYouTubeLinks();
            
            // Find and update the link
            const updatedLinks = links.map(link => {
                if (link.id === linkId) {
                    return { ...link, category: newCategory };
                }
                return link;
            });
            
            // Save updated links
            await window.electronAPI.storeSet('youtube-links', updatedLinks);
        } else {
            // Browser storage fallback
            const linksJson = localStorage.getItem('youtubeLinks');
            links = linksJson ? JSON.parse(linksJson) : [];
            
            // Find and update the link
            const updatedLinks = links.map(link => {
                if (link.id === linkId) {
                    return { ...link, category: newCategory };
                }
                return link;
            });
            
            // Save updated links
            localStorage.setItem('youtubeLinks', JSON.stringify(updatedLinks));
        }
        
        return true;
    } catch (error) {
        console.error('Error updating link category:', error);
        throw error;
    }
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
        // Use the same comprehensive regex as in validateYouTubeLink
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
        const match = url.match(ytRegex);
        
        if (match && match[5] && match[5].length === 11) {
            return match[5];
        }
        
        // Fallback to handle other potential formats
        if (url.includes('youtube.com/watch?v=')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const videoId = urlParams.get('v');
            if (videoId && videoId.length === 11) return videoId;
        }
        
        return null;
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
async function addNewCategory(categoryName) {
        if (!categoryName) {
            showNotification('Please enter a category name', 'error');
            return;
        }
        
        try {
            let categories;
            
        if (isElectron && electronAPIReady) {
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
            
            // Reload categories
        await loadCategories();
            
            // Show success notification
            showNotification('Category added successfully', 'success');
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification('Error adding category', 'error');
        }
}

/**
 * Update the UI to show current storage mode
 */
function updateStorageModeUI() {
    const modeIndicator = document.createElement('div');
    modeIndicator.className = 'storage-mode-indicator';
    modeIndicator.innerHTML = `
        <span class="storage-mode ${window.youtubeStorageMode === 'electron' ? 'electron-mode' : 'local-mode'}">
            <i class="fas ${window.youtubeStorageMode === 'electron' ? 'fa-desktop' : 'fa-database'}"></i>
            ${window.youtubeStorageMode === 'electron' ? 'App Storage' : 'Browser Storage'}
        </span>
        ${window.youtubeStorageMode !== 'electron' && isElectron ? 
            `<button id="retry-electron-api" class="retry-storage-btn">
                <i class="fas fa-sync-alt"></i> Retry App Storage
            </button>` : ''}
    `;
    
    // Find a good place to add the indicator
    const container = document.querySelector('.youtube-input-container');
    if (container) {
        // Check if indicator already exists and remove it
        const existingIndicator = container.querySelector('.storage-mode-indicator');
        if (existingIndicator) {
            container.removeChild(existingIndicator);
        }
        
        container.appendChild(modeIndicator);
        
        // Add event listener for retry button if it exists
        const retryBtn = document.getElementById('retry-electron-api');
        if (retryBtn) {
            retryBtn.addEventListener('click', async () => {
                // Try to reconnect to Electron API
                try {
                    // Test if API methods are accessible
                    electronAPIReady = typeof window.electronAPI.saveYouTubeLink === 'function' 
                        && typeof window.electronAPI.getYouTubeLinks === 'function';
                    
                    if (electronAPIReady) {
                        window.youtubeStorageMode = 'electron';
                        showNotification('Successfully reconnected to App Storage', 'success');
                        updateStorageModeUI();
                        await loadLinks(); // Reload links
                    } else {
                        throw new Error('API not ready');
                    }
                } catch (e) {
                    console.warn('Failed to reconnect to Electron API:', e);
                    showNotification('Could not connect to App Storage, using Browser Storage', 'warning');
                }
            });
        }
    }
}

/**
 * Display categories in the categories list
 */
function displayCategoriesList(categories) {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    if (!categories || categories.length === 0) {
        categoriesList.innerHTML = `
            <div class="empty-categories">
                <p>No categories found. Add your first category above.</p>
            </div>
        `;
        return;
    }
    
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        if (category === 'Uncategorized') return; // Skip default category
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item animate-fade-in';
        categoryItem.innerHTML = `
            <span class="category-name">${category}</span>
            <div class="category-actions">
                <button class="category-action-btn edit-category" data-category="${category}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="category-action-btn delete-category" data-category="${category}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        categoriesList.appendChild(categoryItem);
        
        // Add event listener for delete button
        const deleteBtn = categoryItem.querySelector('.delete-category');
        deleteBtn.addEventListener('click', () => {
            deleteCategory(category);
        });
        
        // Add event listener for edit button
        const editBtn = categoryItem.querySelector('.edit-category');
        editBtn.addEventListener('click', () => {
            showEditCategoryDialog(category);
        });
    });
}

/**
 * Show dialog to edit a category name
 */
function showEditCategoryDialog(category) {
    // Create a dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog animate-fade-in';
    dialog.innerHTML = `
        <div class="modal-content animate-scale-in">
            <div class="modal-header">
                <h3>Edit Category</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="edit-category-input">Category Name</label>
                    <input type="text" id="edit-category-input" class="category-input" value="${category}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-edit">Cancel</button>
                <button class="btn btn-primary save-edit">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    const closeBtn = dialog.querySelector('.modal-close');
    const cancelBtn = dialog.querySelector('.cancel-edit');
    const saveBtn = dialog.querySelector('.save-edit');
    const input = dialog.querySelector('#edit-category-input');
    
    const closeDialog = () => {
        dialog.classList.add('animate-fade-out');
        setTimeout(() => {
            document.body.removeChild(dialog);
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
    
    saveBtn.addEventListener('click', async () => {
        const newName = input.value.trim();
        
        if (!newName) {
            showNotification('Category name cannot be empty', 'error');
            return;
        }
        
        if (newName === category) {
            closeDialog();
            return;
        }
        
        try {
            await updateCategoryName(category, newName);
            showNotification('Category updated successfully', 'success');
            closeDialog();
            
            // Reload categories and links
            await loadCategories();
            await loadLinks();
        } catch (error) {
            console.error('Error updating category:', error);
            showNotification('Error updating category', 'error');
        }
    });
    
    // Allow pressing Enter to save
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
    
    // Focus the input
    input.focus();
    input.select();
}

/**
 * Update a category name
 */
async function updateCategoryName(oldName, newName) {
    if (isElectron && window.electronAPI) {
        // Get all categories
        const categories = await window.electronAPI.getYouTubeCategories();
        
        // Update the category name
        const updatedCategories = categories.map(cat => cat === oldName ? newName : cat);
        
        // Save updated categories
        await window.electronAPI.storeSet('youtube-categories', updatedCategories);
        
        // Update all links with this category
        const links = await window.electronAPI.getYouTubeLinks();
        const updatedLinks = links.map(link => {
            if (link.category === oldName) {
                link.category = newName;
            }
            return link;
        });
        
        // Save updated links
        await window.electronAPI.storeSet('youtube-links', updatedLinks);
    } else {
        // Browser storage fallback
        const categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
        const updatedCategories = categories.map(cat => cat === oldName ? newName : cat);
        localStorage.setItem('youtubeCategories', JSON.stringify(updatedCategories));
        
        // Update all links with this category
        const savedLinksJson = localStorage.getItem('youtubeLinks');
        if (savedLinksJson) {
            const savedLinks = JSON.parse(savedLinksJson);
            const updatedLinks = savedLinks.map(link => {
                if (link.category === oldName) {
                    link.category = newName;
                }
                return link;
            });
            localStorage.setItem('youtubeLinks', JSON.stringify(updatedLinks));
        }
    }
}

/**
 * Filter links by selected category
 */
function filterLinksByCategory() {
    const selectedCategory = ytCategoryFilter ? ytCategoryFilter.value : 'all';
    console.log(`Filtering by category: ${selectedCategory}`);
    
    // Get all link items
    const linkItems = document.querySelectorAll('.youtube-link-item');
    let visibleCount = 0;
    
    linkItems.forEach(item => {
        const linkCategory = item.getAttribute('data-category');
        
        if (selectedCategory === 'all' || linkCategory === selectedCategory) {
            item.style.display = 'flex';
            item.classList.add('animate-fade-in');
            visibleCount++;
        } else {
            item.style.display = 'none';
            item.classList.remove('animate-fade-in');
        }
    });
    
    // Update counter and empty message visibility
    if (ytLinksCount) {
        ytLinksCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'link' : 'links'}`;
    }
    
    // Show/hide no links message
    const ytNoLinksMessage = document.getElementById('no-youtube-links-message');
    if (ytNoLinksMessage) {
        if (visibleCount === 0) {
            ytNoLinksMessage.style.display = 'block';
            ytNoLinksMessage.classList.add('animate-fade-in');
            
            if (selectedCategory !== 'all') {
                ytNoLinksMessage.textContent = `No links found in the "${selectedCategory}" category.`;
            } else {
                ytNoLinksMessage.textContent = 'No links found. Add your first YouTube link above.';
            }
        } else {
            ytNoLinksMessage.style.display = 'none';
        }
    }
}

/**
 * Get all categories
 */
async function getAllCategories() {
    try {
        let categories = [];
        
        if (isElectron && electronAPIReady) {
            // Get categories from Electron API
            categories = await window.electronAPI.getYouTubeCategories();
        } else {
            // Browser storage fallback
            categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
        }
        
        // Ensure Uncategorized is always available
        if (!categories.includes('Uncategorized')) {
            categories.unshift('Uncategorized');
        }
        
        return categories;
    } catch (error) {
        console.error('Error getting categories:', error);
        return ['Uncategorized']; // Fallback to at least having Uncategorized
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initYouTubeManager);

// Make function available globally
window.initYouTubeManager = initYouTubeManager; 

// Add initialization for the categories management UI
document.addEventListener('DOMContentLoaded', function() {
    // Initialize category management
    const categoryNameInput = document.getElementById('category-name-input');
    const addNewCategoryBtn = document.getElementById('add-new-category-btn');
    const categoriesList = document.getElementById('categories-list');
    
    if (categoryNameInput && addNewCategoryBtn) {
        // Handle adding a new category
        addNewCategoryBtn.addEventListener('click', async function() {
            const categoryName = categoryNameInput.value.trim();
            
            if (!categoryName) {
                alert('Please enter a category name');
                return;
            }
            
            // Get existing categories
            let categories = [];
            try {
                if (window.electronAPI) {
                    categories = await window.electronAPI.getYouTubeCategories() || [];
                } else {
                    categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
                }
                
                // Check if category already exists
                if (categories.includes(categoryName)) {
                    alert('This category already exists');
                    return;
                }
                
                // Add the new category
                categories.push(categoryName);
                
                // Save the updated categories
                if (window.electronAPI) {
                    await window.electronAPI.storeSet('youtube-categories', categories);
                } else {
                    localStorage.setItem('youtubeCategories', JSON.stringify(categories));
                }
                
                // Clear the input
                categoryNameInput.value = '';
                
                // Update the UI
                displayCategories(categories);
                updateCategoryDropdowns(categories);
                
                alert('Category added successfully');
                
            } catch (error) {
                console.error('Error adding category:', error);
                alert('Failed to add category');
            }
        });
        
        // Load categories on page load
        loadAndDisplayCategories();
    }
    
    // Function to load and display categories
    async function loadAndDisplayCategories() {
        try {
            let categories = [];
            if (window.electronAPI) {
                categories = await window.electronAPI.getYouTubeCategories() || [];
            } else {
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
            }
            
            // Add Uncategorized if it doesn't exist
            if (!categories.includes('Uncategorized')) {
                categories.unshift('Uncategorized');
            }
            
            // Display categories and update dropdowns
            displayCategories(categories);
            updateCategoryDropdowns(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    // Function to display categories in the management UI
    function displayCategories(categories) {
        if (!categoriesList) return;
        
        // Clear the list
        categoriesList.innerHTML = '';
        
        if (categories.length <= 1 && categories[0] === 'Uncategorized') {
            // Show empty state if only Uncategorized exists
            categoriesList.innerHTML = `
                <div class="empty-categories">
                    <p>No custom categories found. Add your first category above.</p>
                </div>
            `;
            return;
        }
        
        // Create elements for each category (except Uncategorized)
        categories.forEach(category => {
            if (category === 'Uncategorized') return; // Skip default category
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <span class="category-name">${category}</span>
                <div class="category-actions">
                    <button class="category-action-btn edit-category" data-category="${category}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="category-action-btn delete-category" data-category="${category}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            categoriesList.appendChild(categoryItem);
            
            // Add event listeners for editing and deleting
            const editBtn = categoryItem.querySelector('.edit-category');
            const deleteBtn = categoryItem.querySelector('.delete-category');
            
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    editCategory(category);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    deleteCategory(category);
                });
            }
        });
    }
    
    // Function to update category dropdowns in the UI
    function updateCategoryDropdowns(categories) {
        // Update the category dropdown in the add form
        const categorySelect = document.getElementById('youtube-category');
        const categoryFilter = document.getElementById('category-filter');
        
        if (categorySelect) {
            categorySelect.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    }
    
    // Function to edit a category
    function editCategory(category) {
        const newName = prompt(`Edit category: ${category}`, category);
        
        if (!newName || newName === category) return;
        
        // Update the category
        updateCategoryName(category, newName);
    }
    
    // Function to update a category name
    async function updateCategoryName(oldName, newName) {
        try {
            let categories = [];
            let links = [];
            
            if (window.electronAPI) {
                categories = await window.electronAPI.getYouTubeCategories() || [];
                links = await window.electronAPI.getYouTubeLinks() || [];
            } else {
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
                links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
            }
            
            // Update the category in the categories array
            const updatedCategories = categories.map(cat => cat === oldName ? newName : cat);
            
            // Update the category in all links
            const updatedLinks = links.map(link => {
                if (link.category === oldName) {
                    link.category = newName;
                }
                return link;
            });
            
            // Save the updated data
            if (window.electronAPI) {
                await window.electronAPI.storeSet('youtube-categories', updatedCategories);
                await window.electronAPI.storeSet('youtube-links', updatedLinks);
            } else {
                localStorage.setItem('youtubeCategories', JSON.stringify(updatedCategories));
                localStorage.setItem('youtubeLinks', JSON.stringify(updatedLinks));
            }
            
            // Update the UI
            displayCategories(updatedCategories);
            updateCategoryDropdowns(updatedCategories);
            
            alert('Category updated successfully');
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category');
        }
    }
    
    // Function to delete a category
    async function deleteCategory(category) {
        if (!confirm(`Are you sure you want to delete the category "${category}"? All links in this category will be moved to "Uncategorized".`)) {
            return;
        }
        
        try {
            let categories = [];
            let links = [];
            
            if (window.electronAPI) {
                categories = await window.electronAPI.getYouTubeCategories() || [];
                links = await window.electronAPI.getYouTubeLinks() || [];
            } else {
                categories = JSON.parse(localStorage.getItem('youtubeCategories') || '[]');
                links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
            }
            
            // Remove the category
            const updatedCategories = categories.filter(cat => cat !== category);
            
            // Move all links in this category to Uncategorized
            const updatedLinks = links.map(link => {
                if (link.category === category) {
                    link.category = 'Uncategorized';
                }
                return link;
            });
            
            // Save the updated data
            if (window.electronAPI) {
                await window.electronAPI.storeSet('youtube-categories', updatedCategories);
                await window.electronAPI.storeSet('youtube-links', updatedLinks);
            } else {
                localStorage.setItem('youtubeCategories', JSON.stringify(updatedCategories));
                localStorage.setItem('youtubeLinks', JSON.stringify(updatedLinks));
            }
            
            // Update the UI
            displayCategories(updatedCategories);
            updateCategoryDropdowns(updatedCategories);
            
            alert('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    }
});

// This line ensures all loose ends are properly closed
console.log('YouTube Manager script loaded successfully'); 

/**
 * Create fallback video details from just a URL
 * @param {string} url - The YouTube URL
 * @returns {Object} Basic video details
 */
function createBasicVideoDetails(url) {
    // Try to extract video ID from the URL
    const videoId = extractVideoId(url) || createFallbackId(url);
    
    // Create basic details with what we know
    return {
        id: videoId,
        url: url,
        title: 'YouTube Video', // Generic title
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        author: '',
        channel: '',
        description: '',
        category: ytLinkCategory ? ytLinkCategory.value : 'Uncategorized',
        dateAdded: new Date().toISOString(),
        added: new Date().toISOString()
    };
}

// At the end of the file, add this emergency fix

// Emergency fix for YouTube link adding functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying emergency YouTube Manager fix...');
    
    // Get the correct elements by their IDs as shown in the UI
    const linkInput = document.getElementById('youtube-url-input'); // Direct ID reference
    const addButton = document.querySelector('.youtube-input-container button') || 
                    document.querySelector('button.btn-add') ||
                    document.getElementById('add-youtube-link');
    const categorySelect = document.querySelector('select[id^="category"]') || 
                          document.getElementById('youtube-category') ||
                          document.querySelector('.youtube-input-container select');
    const linksList = document.getElementById('youtube-links-list');
    
    console.log('Emergency fix found elements:', {
        linkInput: !!linkInput,
        addButton: !!addButton,
        categorySelect: !!categorySelect,
        linksList: !!linksList
    });
    
    if (addButton) {
        // Remove any existing event listeners by cloning and replacing the button
        const newButton = addButton.cloneNode(true);
        addButton.parentNode.replaceChild(newButton, addButton);
        
        // Add our simplified event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Emergency add button clicked');
            
            if (!linkInput) {
                console.error('Emergency fix: Cannot find link input element');
                alert('Error: Cannot find link input element');
                return;
            }
            
            const url = linkInput.value.trim();
            if (!url) {
                alert('Please enter a YouTube URL');
                return;
            }
            
            // Simple regex to extract video ID
            let videoId = null;
            
            // Try to extract ID from various URL formats
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
            } else if (url.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                videoId = urlParams.get('v');
            } else if (url.includes('youtube.com/shorts/')) {
                videoId = url.split('youtube.com/shorts/')[1].split(/[?#]/)[0];
            }
            
            if (!videoId) {
                alert('Invalid YouTube URL. Please check the format.');
                return;
            }
            
            console.log('Emergency fix extracted video ID:', videoId);
            
            // Create link data with basic info
            const linkData = {
                id: `yt_${videoId}_${Date.now()}`,
                url: url,
                title: 'YouTube Video',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                category: categorySelect ? categorySelect.value : 'Uncategorized',
                dateAdded: new Date().toISOString(),
                added: new Date().toISOString(),
                viewCount: 0
            };
            
            // Save to localStorage
            try {
                let links = [];
                const savedLinksJson = localStorage.getItem('youtubeLinks');
                links = savedLinksJson ? JSON.parse(savedLinksJson) : [];
                links.push(linkData);
                localStorage.setItem('youtubeLinks', JSON.stringify(links));
                
                console.log('Emergency fix: Saved link to localStorage');
                alert('YouTube link added successfully');
                
                // Clear input
                linkInput.value = '';
                
                // Reload page to show the new link
                window.location.reload();
            } catch (error) {
                console.error('Emergency fix error:', error);
                alert('Error saving link: ' + error.message);
            }
        });
        
        console.log('Emergency fix applied successfully');
    } else {
        console.error('Emergency fix failed: Add button not found');
    }
});