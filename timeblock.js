// Time Blocking Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize time blocking once the DOM is fully loaded
    initTimeBlocking();
});

/**
 * Initialize the Time Blocking functionality
 */
function initTimeBlocking() {
    console.log('Initializing enhanced time blocking...');
    
    // DOM Elements
    const schedulerGrid = document.getElementById('scheduler-grid');
    const addTimeBlockBtn = document.getElementById('add-time-block');
    const todayBtn = document.querySelector('.view-option:nth-child(3)');
    const prevDayBtn = document.querySelector('.nav-button:first-child');
    const nextDayBtn = document.querySelector('.nav-button:last-child');
    const currentDateSpan = document.querySelector('.current-date');
    const blockCreateModal = document.getElementById('block-create-modal');
    const blockCreateForm = document.getElementById('block-create-form');
    const blockCreateClose = document.querySelector('.block-create-close');
    const cancelBtn = document.getElementById('cancel-block-btn');
    
    // Current date and view
    let currentDate = new Date();
    let currentView = 'day'; // 'day', 'week', 'month'
    
    // Track if we're dragging a block
    let isDragging = false;
    let draggedBlock = null;
    let dragOffsetY = 0;
    let dragStartTime = 0;
    
    // Generate time slots for the scheduler grid
    function generateTimeSlots() {
        if (!schedulerGrid) return;
        
        // Clear existing time slots
        schedulerGrid.innerHTML = '';
        
        // Create 24 time slots (one for each hour)
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.hour = hour;
            
            // Add event listeners for drag-and-drop
            timeSlot.addEventListener('dragover', handleDragOver);
            timeSlot.addEventListener('drop', handleDrop);
            timeSlot.addEventListener('dragenter', function() {
                this.classList.add('drag-hover');
            });
            timeSlot.addEventListener('dragleave', function() {
                this.classList.remove('drag-hover');
            });
            
            // Add double-click event to create a block
            timeSlot.addEventListener('dblclick', function(e) {
                const rect = this.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const minutes = Math.floor((clickY / rect.height) * 60);
                const hour = parseInt(this.dataset.hour);
                
                // Calculate time for the new block
                const blockTime = new Date(currentDate);
                blockTime.setHours(hour);
                blockTime.setMinutes(minutes);
                blockTime.setSeconds(0);
                blockTime.setMilliseconds(0);
                
                // Show the create block modal
                showCreateBlockModal(blockTime);
            });
            
            schedulerGrid.appendChild(timeSlot);
        }
        
        // Add current time indicator
        if (currentView === 'day' && isToday(currentDate)) {
            addCurrentTimeIndicator();
        }
    }
    
    // Add current time indicator to the scheduler
    function addCurrentTimeIndicator() {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const position = hour + (minutes / 60);
        
        // Create indicator element
        const indicator = document.createElement('div');
        indicator.className = 'current-time-indicator';
        indicator.style.top = `${position * 60}px`;
        
        // Add to scheduler
        schedulerGrid.appendChild(indicator);
        
        // Update every minute
        setTimeout(updateCurrentTimeIndicator, 60000 - (now.getSeconds() * 1000));
    }
    
    // Update position of the current time indicator
    function updateCurrentTimeIndicator() {
        const indicator = document.querySelector('.current-time-indicator');
        if (indicator && isToday(currentDate) && currentView === 'day') {
            const now = new Date();
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const position = hour + (minutes / 60);
            
            indicator.style.top = `${position * 60}px`;
            
            // Update again in a minute
            setTimeout(updateCurrentTimeIndicator, 60000);
        }
    }
    
    // Check if a date is today
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    // Format a date as a readable string
    function formatDate(date) {
        const options = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        };
        return date.toLocaleDateString(undefined, options);
    }
    
    // Update the displayed date
    function updateDateDisplay() {
        if (currentDateSpan) {
            currentDateSpan.textContent = formatDate(currentDate);
        }
    }
    
    // Navigate to the previous day
    function navigateToPreviousDay() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        currentDate = newDate;
        updateDateDisplay();
        loadBlocks();
    }
    
    // Navigate to the next day
    function navigateToNextDay() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        currentDate = newDate;
        updateDateDisplay();
        loadBlocks();
    }
    
    // Navigate to today
    function navigateToToday() {
        currentDate = new Date();
        updateDateDisplay();
        loadBlocks();
    }
    
    // Handle drag over event
    function handleDragOver(e) {
        e.preventDefault();
        if (isDragging) {
            const rect = this.getBoundingClientRect();
            const top = e.clientY - rect.top - dragOffsetY;
            
            // Snap to 15-minute intervals
            const slotHeight = rect.height;
            const snapInterval = slotHeight / 4; // 15 minutes
            const snappedTop = Math.round(top / snapInterval) * snapInterval;
            
            // Update position of dragged block
            draggedBlock.style.top = `${snappedTop}px`;
        }
    }
    
    // Handle drop event
    function handleDrop(e) {
        e.preventDefault();
        
        // Get the time slot
        const timeSlot = e.target.closest('.time-slot');
        if (!timeSlot || !draggedBlock) return;
        
        const slotHour = parseInt(timeSlot.dataset.hour);
        const rect = timeSlot.getBoundingClientRect();
        const dropY = e.clientY - rect.top;
        const slotHeight = rect.height;
        
        // Calculate minutes (snap to 15-minute intervals)
        const minuteRatio = dropY / slotHeight;
        const minutes = Math.round(minuteRatio * 60 / 15) * 15;
        
        // Get block info
        const blockId = draggedBlock.dataset.id;
        const blockDuration = parseInt(draggedBlock.dataset.duration);
        
        // Calculate new start time
        const newStartTime = new Date(currentDate);
        newStartTime.setHours(slotHour);
        newStartTime.setMinutes(minutes);
        newStartTime.setSeconds(0);
        newStartTime.setMilliseconds(0);
        
        // Update block in storage
        updateBlockTime(blockId, newStartTime, blockDuration);
        
        // Reset dragging state
        isDragging = false;
        draggedBlock = null;
        
        // Remove drag-hover class from all time slots
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('drag-hover');
        });
        
        // Reload blocks to reflect changes
        loadBlocks();
    }
    
    // Update a block's time in storage
    function updateBlockTime(blockId, startTime, duration) {
        let blocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
        const blockIndex = blocks.findIndex(block => block.id === blockId);
        
        if (blockIndex !== -1) {
            blocks[blockIndex].startTime = startTime.toISOString();
            blocks[blockIndex].duration = duration;
            localStorage.setItem('timeBlocks', JSON.stringify(blocks));
        }
    }
    
    // Show the create block modal
    function showCreateBlockModal(startTime = null) {
        if (!blockCreateModal || !blockCreateForm) return;
        
        // Clear previous form data
        blockCreateForm.reset();
        
        // Set default values
        if (startTime) {
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + 60); // Default 1 hour duration
            
            document.getElementById('block-start-time').value = 
                `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            document.getElementById('block-end-time').value = 
                `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // Set event date (today by default)
        document.getElementById('block-date').valueAsDate = currentDate;
        
        // Select default color
        selectBlockColor('purple');
        
        // Show modal
        blockCreateModal.classList.add('active');
        
        // Focus first field
        document.getElementById('block-title').focus();
    }
    
    // Hide the create block modal
    function hideCreateBlockModal() {
        if (blockCreateModal) {
            blockCreateModal.classList.remove('active');
        }
    }
    
    // Select a block color
    function selectBlockColor(color) {
        // Remove active class from all options
        document.querySelectorAll('.block-color-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected color
        const selectedOption = document.querySelector(`.block-color-option.${color}`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        // Set hidden input value
        const colorInput = document.getElementById('block-color');
        if (colorInput) {
            colorInput.value = color;
        }
    }
    
    // Convert time string to minutes
    function timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return (hours * 60) + minutes;
    }
    
    // Calculate duration between start and end time
    function calculateDuration(startTime, endTime) {
        const startMinutes = timeToMinutes(startTime);
        let endMinutes = timeToMinutes(endTime);
        
        // Handle crossing midnight
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }
        
        return endMinutes - startMinutes;
    }
    
    // Create a new time block
    function createTimeBlock(blockData) {
        const blocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
        
        // Add the new block
        blocks.push(blockData);
        
        // Save to localStorage
        localStorage.setItem('timeBlocks', JSON.stringify(blocks));
        
        // Reload blocks
        loadBlocks();
    }
    
    // Load and display blocks for the current date
    function loadBlocks() {
        // Generate time slots first
        generateTimeSlots();
        
        // Get blocks from storage
        const blocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
        
        // Filter blocks for the current date
        const currentDateStr = currentDate.toISOString().split('T')[0];
        const dateBlocks = blocks.filter(block => 
            block.startTime.startsWith(currentDateStr)
        );
        
        // Render each block
        dateBlocks.forEach(renderBlock);
        
        // Check for block overlaps
        checkBlockOverlaps();
    }
    
    // Render a single block on the scheduler
    function renderBlock(block) {
        if (!schedulerGrid) return;
        
        // Parse start time
        const startTime = new Date(block.startTime);
        const hours = startTime.getHours();
        const minutes = startTime.getMinutes();
        
        // Calculate position and height
        const top = (hours * 60 + minutes) * (60 / 60); // Position in pixels
        const height = block.duration * (60 / 60); // Height in pixels
        
        // Create the block element
        const blockEl = document.createElement('div');
        blockEl.className = `time-block ${block.type}`;
        blockEl.dataset.id = block.id;
        blockEl.dataset.duration = block.duration;
        blockEl.draggable = true;
        
        // Set position and size
        blockEl.style.top = `${top}px`;
        blockEl.style.height = `${height}px`;
        
        // Calculate end time for display
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + block.duration);
        
        // Format times for display
        const startTimeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Add content
        blockEl.innerHTML = `
            <div class="block-title">${block.title}</div>
            <div class="block-time">
                <i class="fa-solid fa-clock"></i>
                <span>${startTimeStr} - ${endTimeStr}</span>
            </div>
            <div class="block-actions">
                <button class="block-action-btn edit-block" data-id="${block.id}">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="block-action-btn delete-block" data-id="${block.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for drag-and-drop
        blockEl.addEventListener('dragstart', function(e) {
            isDragging = true;
            draggedBlock = this;
            
            // Calculate drag offset
            const rect = this.getBoundingClientRect();
            dragOffsetY = e.clientY - rect.top;
            
            // Set drag image
            const dragImage = this.cloneNode(true);
            dragImage.style.opacity = '0.5';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
            
            // Set current drag time
            const hour = Math.floor(rect.top / 60);
            const minute = Math.floor((rect.top % 60) / (60/60));
            dragStartTime = hour * 60 + minute;
        });
        
        blockEl.addEventListener('dragend', function() {
            isDragging = false;
            draggedBlock = null;
            
            // Remove drag-hover class from all time slots
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('drag-hover');
            });
        });
        
        // Add the block to the scheduler
        schedulerGrid.appendChild(blockEl);
        
        // Add event listeners for edit and delete buttons
        blockEl.querySelector('.edit-block').addEventListener('click', function(e) {
            e.stopPropagation();
            editBlock(block.id);
        });
        
        blockEl.querySelector('.delete-block').addEventListener('click', function(e) {
            e.stopPropagation();
            deleteBlock(block.id);
        });
    }
    
    // Check for block overlaps
    function checkBlockOverlaps() {
        const blocks = document.querySelectorAll('.time-block');
        
        // Remove overlap class from all blocks
        blocks.forEach(block => {
            block.classList.remove('overlap');
        });
        
        // Check each pair of blocks for overlap
        for (let i = 0; i < blocks.length; i++) {
            const blockA = blocks[i];
            const aTop = parseInt(blockA.style.top);
            const aBottom = aTop + parseInt(blockA.style.height);
            
            for (let j = i + 1; j < blocks.length; j++) {
                const blockB = blocks[j];
                const bTop = parseInt(blockB.style.top);
                const bBottom = bTop + parseInt(blockB.style.height);
                
                // Check if blocks overlap
                if (!(aBottom <= bTop || aTop >= bBottom)) {
                    blockA.classList.add('overlap');
                    blockB.classList.add('overlap');
                }
            }
        }
    }
    
    // Edit an existing block
    function editBlock(blockId) {
        const blocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
        const block = blocks.find(b => b.id === blockId);
        
        if (!block) return;
        
        // Populate form with block data
        const startTime = new Date(block.startTime);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + block.duration);
        
        document.getElementById('block-id').value = block.id;
        document.getElementById('block-title').value = block.title;
        document.getElementById('block-type').value = block.type;
        document.getElementById('block-description').value = block.description || '';
        document.getElementById('block-date').valueAsDate = startTime;
        document.getElementById('block-start-time').value = 
            `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
        document.getElementById('block-end-time').value = 
            `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
        
        // Select the block color
        selectBlockColor(block.color);
        
        // Show the modal with edit title
        document.querySelector('.block-create-header h3').textContent = 'Edit Time Block';
        document.getElementById('create-block-btn').textContent = 'Update Block';
        
        blockCreateModal.classList.add('active');
    }
    
    // Delete a block
    function deleteBlock(blockId) {
        if (confirm('Are you sure you want to delete this block?')) {
            let blocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
            blocks = blocks.filter(block => block.id !== blockId);
            localStorage.setItem('timeBlocks', JSON.stringify(blocks));
            
            // Reload blocks
            loadBlocks();
        }
    }
    
    // Initialize color options
    function initColorOptions() {
        const colorOptions = document.querySelectorAll('.block-color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                const color = this.classList[1]; // Get color class (second class)
                selectBlockColor(color);
            });
        });
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Add new time block button
        if (addTimeBlockBtn) {
            addTimeBlockBtn.addEventListener('click', function() {
                showCreateBlockModal();
            });
        }
        
        // Navigation buttons
        if (todayBtn) {
            todayBtn.addEventListener('click', navigateToToday);
        }
        
        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', navigateToPreviousDay);
        }
        
        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', navigateToNextDay);
        }
        
        // Modal close button
        if (blockCreateClose) {
            blockCreateClose.addEventListener('click', hideCreateBlockModal);
        }
        
        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideCreateBlockModal();
            });
        }
        
        // Form submission
        if (blockCreateForm) {
            blockCreateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form data
                const id = document.getElementById('block-id').value || Date.now().toString();
                const title = document.getElementById('block-title').value.trim();
                const type = document.getElementById('block-type').value;
                const description = document.getElementById('block-description').value.trim();
                const date = document.getElementById('block-date').valueAsDate;
                const startTimeStr = document.getElementById('block-start-time').value;
                const endTimeStr = document.getElementById('block-end-time').value;
                const color = document.getElementById('block-color').value;
                
                // Validate
                if (!title) {
                    alert('Please enter a title for the block');
                    return;
                }
                
                if (!startTimeStr || !endTimeStr) {
                    alert('Please specify both start and end times');
                    return;
                }
                
                // Create start time
                const startTime = new Date(date);
                const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
                startTime.setHours(startHours, startMinutes, 0, 0);
                
                // Calculate duration in minutes
                const duration = calculateDuration(startTimeStr, endTimeStr);
                
                if (duration <= 0) {
                    alert('End time must be after start time');
                    return;
                }
                
                // Create block data
                const blockData = {
                    id,
                    title,
                    type,
                    description,
                    startTime: startTime.toISOString(),
                    duration,
                    color
                };
                
                // Update or create block
                let blocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
                const blockIndex = blocks.findIndex(block => block.id === id);
                
                if (blockIndex !== -1) {
                    // Update existing block
                    blocks[blockIndex] = blockData;
                } else {
                    // Add new block
                    blocks.push(blockData);
                }
                
                // Save to localStorage
                localStorage.setItem('timeBlocks', JSON.stringify(blocks));
                
                // Hide modal
                hideCreateBlockModal();
                
                // Reset form for next use
                document.querySelector('.block-create-header h3').textContent = 'Create Time Block';
                document.getElementById('create-block-btn').textContent = 'Create Block';
                document.getElementById('block-id').value = '';
                
                // Reload blocks
                loadBlocks();
            });
        }
        
        // Initialize color options
        initColorOptions();
    }
    
    // Initialize the view
    function init() {
        updateDateDisplay();
        generateTimeSlots();
        loadBlocks();
        initEventListeners();
    }
    
    // Initialize everything
    init();
} 