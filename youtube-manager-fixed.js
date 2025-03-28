// Final closing bracket and listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing YouTube Manager with category management...');
    
    // Make sure the youtube manager is initialized
    if (typeof initYouTubeManager === 'function') {
        initYouTubeManager();
    }
    
    // Initialize category management
    const categoryNameInput = document.getElementById('category-name-input');
    const addNewCategoryBtn = document.getElementById('add-new-category-btn');
    const categoriesList = document.getElementById('categories-list');
    
    // Only proceed if the elements exist
    if (categoryNameInput && addNewCategoryBtn && categoriesList) {
        console.log('Category management elements found, setting up handlers...');
        
        // Load categories right away
        loadAndDisplayCategories();
        
        // Add event listener for the add category button
        addNewCategoryBtn.addEventListener('click', async function() {
            const categoryName = categoryNameInput.value.trim();
            
            if (!categoryName) {
                showNotification('Please enter a category name', 'error');
                return;
            }
            
            try {
                await addNewCategory(categoryName);
                categoryNameInput.value = '';
                showNotification('Category added successfully', 'success');
            } catch (error) {
                console.error('Error adding category:', error);
                showNotification(error.message || 'Failed to add category', 'error');
            }
        });
        
        // Allow pressing Enter to add category
        categoryNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewCategoryBtn.click();
            }
        });
    } else {
        console.warn('Some category management elements are missing');
    }
});

// This function ensures all loose ends are properly closed
console.log('YouTube Manager script loaded successfully'); 