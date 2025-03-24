// YouTube Manager Implementation
function initYouTubeManager() {
    console.log('Initializing YouTube Manager...');
    
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
    
    function addLink() {
        // Get values from form
        const url = ytLinkInput.value.trim();
        const title = ytLinkTitle.value.trim() || extractYouTubeTitle(url);
        const category = ytLinkCategory.value;
        
        // Validate link format
        if (!validateYouTubeLink()) {
            return;
        }
        
        // Create link object
        const linkId = Date.now().toString();
        const link = {
            id: linkId,
            url: url,
            title: title,
            category: category,
            dateAdded: new Date().toISOString(),
            thumbnailUrl: extractYouTubeThumbnail(url),
            videoId: extractYouTubeID(url)
        };
        
        // Get existing links
        const links = JSON.parse(localStorage.getItem('youtubeLinks') || '[]');
        
        // Add new link
        links.push(link);
        
        // Save to local storage
        localStorage.setItem('youtubeLinks', JSON.stringify(links));
        
        // Clear form
        ytLinkInput.value = '';
        ytLinkTitle.value = '';
        
        // Reload links
        loadLinks();
        
        // Show success message
        showToast('YouTube link added successfully', 'success');
    }
    
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
    
    function createLinkElement(link) {
        // Create link element
        const linkElement = document.createElement('div');
        linkElement.className = 'yt-link-card';
        
        // Determine video platform and icon
        let platformIcon = 'fa-brands fa-youtube';
        let platformClass = 'youtube';
        
        if (link.url.includes('youtu.be') || link.url.includes('youtube.com')) {
            platformIcon = 'fa-brands fa-youtube';
            platformClass = 'youtube';
        }
        
        // Format date
        const dateAdded = new Date(link.dateAdded);
        const formattedDate = `${dateAdded.toLocaleDateString()} at ${dateAdded.toLocaleTimeString()}`;
        
        // Create thumbnail URL if not provided
        const thumbnailUrl = link.thumbnailUrl || `https://img.youtube.com/vi/${link.videoId}/0.jpg`;
        
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
                    <span class="yt-link-platform ${platformClass}">
                        <i class="${platformIcon}"></i>
                    </span>
                    ${link.category ? `<span class="yt-link-category">${link.category}</span>` : ''}
                    <span class="yt-link-date" title="${formattedDate}">
                        <i class="fa-regular fa-clock"></i>
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
        
        return linkElement;
    }
    
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
    
    function copyToClipboard(text) {
        // Create a temporary input element
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        
        // Select the text
        input.select();
        input.setSelectionRange(0, 99999);
        
        // Copy to clipboard
        document.execCommand('copy');
        
        // Remove the input element
        document.body.removeChild(input);
    }
    
    function extractYouTubeID(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }
    
    function extractYouTubeThumbnail(url) {
        const videoId = extractYouTubeID(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
    }
    
    function extractYouTubeTitle(url) {
        // This would normally fetch the title from the YouTube API
        // For simplicity, we'll just use a placeholder
        return 'YouTube Video';
    }
    
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
}

// Export the function if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initYouTubeManager };
} 