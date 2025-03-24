// Notes Feature Implementation
function initNotes() {
    // Get DOM elements
    const notesList = document.getElementById('notes-list');
    const notesCount = document.getElementById('notes-count');
    const notesSearchInput = document.getElementById('notes-search-input');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContent = document.getElementById('note-content');
    const noteCategorySelect = document.getElementById('note-category');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const discardNoteBtn = document.getElementById('discard-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const createFirstNoteBtn = document.getElementById('create-first-note-btn');
    const toolbarButtons = document.querySelectorAll('.note-toolbar-btn');
    
    // Variable to store the current note being edited
    let currentNoteId = null;
    let isNewNote = true;
    
    // Load notes on page load
    loadNotes();
    
    // Initialize word count
    updateWordCount();
    
    // Add event listener to search input
    notesSearchInput.addEventListener('input', function() {
        loadNotes(this.value.trim());
    });
    
    // Add event listener to note content for word count
    noteContent.addEventListener('input', function() {
        updateWordCount();
    });
    
    // Add event listener to toolbar buttons
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.dataset.format;
            applyFormat(format);
        });
    });
    
    // Add event listener to save button
    saveNoteBtn.addEventListener('click', saveNote);
    
    // Add event listener to discard button
    discardNoteBtn.addEventListener('click', discardNote);
    
    // Add event listener to delete button
    deleteNoteBtn.addEventListener('click', deleteNote);
    
    // Add event listener to new note button
    newNoteBtn.addEventListener('click', createNewNote);
    
    // Add event listener to create first note button
    createFirstNoteBtn.addEventListener('click', createNewNote);
    
    function loadNotes(searchTerm = '') {
        // Clear notes list
        const emptyState = notesList.querySelector('.notes-empty-state');
        if (emptyState) {
            notesList.innerHTML = '';
        }
        
        // Get notes from localStorage
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Update count
        notesCount.textContent = notes.length;
        
        // If no notes, show empty state
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="notes-empty-state">
                    <i class="fa-solid fa-note-sticky notes-empty-icon"></i>
                    <h3 class="notes-empty-title">No notes yet</h3>
                    <p class="notes-empty-subtitle">Start creating notes to keep track of your ideas, thoughts, and information.</p>
                    <button class="create-first-note-btn" id="create-first-note-btn">
                        <i class="fa-solid fa-plus"></i> Create your first note
                    </button>
                </div>
            `;
            
            // Add event listener to create first note button
            document.getElementById('create-first-note-btn').addEventListener('click', createNewNote);
            
            // Clear editor
            clearEditor();
            
            return;
        }
        
        // Filter notes based on search term
        const filteredNotes = searchTerm 
            ? notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                note.content.toLowerCase().includes(searchTerm.toLowerCase()))
            : notes;
        
        // If no notes match search, show message
        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="notes-empty-state">
                    <i class="fa-solid fa-search notes-empty-icon"></i>
                    <h3 class="notes-empty-title">No results found</h3>
                    <p class="notes-empty-subtitle">Try a different search term.</p>
                </div>
            `;
            return;
        }
        
        // Clear notes list before appending
        notesList.innerHTML = '';
        
        // Sort notes by last updated (newest first)
        filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        // Render each note
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesList.appendChild(noteElement);
        });
        
        // If this is the first load and there's at least one note, load the first note
        if (currentNoteId === null && filteredNotes.length > 0) {
            loadNoteIntoEditor(filteredNotes[0].id);
        }
    }
    
    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note-item');
        noteElement.setAttribute('data-id', note.id);
        
        // Add active class if this is the current note
        if (note.id === currentNoteId) {
            noteElement.classList.add('active');
        }
        
        // Get snippet by stripping HTML tags and trimming to 100 characters
        const snippet = note.content
            .replace(/<[^>]*>/g, '')
            .substring(0, 100)
            .trim() + (note.content.length > 100 ? '...' : '');
        
        // Format date as relative time (e.g., "2 hours ago")
        const updatedAt = formatRelativeTime(new Date(note.updatedAt));
        
        noteElement.innerHTML = `
            <div class="note-title">${note.title || 'Untitled Note'}</div>
            <div class="note-snippet">${snippet}</div>
            <div class="note-meta">
                <div class="note-date">
                    <i class="fa-regular fa-clock"></i>
                    ${updatedAt}
                </div>
                ${note.category ? `<div class="note-category">${note.category}</div>` : ''}
            </div>
        `;
        
        // Add event listener for clicking on a note
        noteElement.addEventListener('click', function() {
            // Load note into editor
            loadNoteIntoEditor(note.id);
            
            // Update active class
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        return noteElement;
    }
    
    function loadNoteIntoEditor(noteId) {
        // Get notes from localStorage
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Find the note
        const note = notes.find(n => n.id === noteId);
        
        if (!note) {
            return;
        }
        
        // Update current note ID
        currentNoteId = noteId;
        isNewNote = false;
        
        // Populate editor
        noteTitleInput.value = note.title || '';
        noteContent.value = note.content || '';
        noteCategorySelect.value = note.category || '';
        
        // Update word count
        updateWordCount();
        
        // Show delete button
        deleteNoteBtn.style.display = 'flex';
    }
    
    function createNewNote() {
        // Clear editor
        clearEditor();
        
        // Set current note ID to null
        currentNoteId = null;
        isNewNote = true;
        
        // Remove active class from all notes
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Focus on title input
        noteTitleInput.focus();
    }
    
    function saveNote() {
        // Get form values
        const title = noteTitleInput.value.trim() || 'Untitled Note';
        const content = noteContent.value;
        const category = noteCategorySelect.value;
        
        // Get current date
        const now = new Date().toISOString();
        
        // Create note object
        const note = {
            id: currentNoteId || Date.now().toString(),
            title,
            content,
            category,
            createdAt: isNewNote ? now : undefined,
            updatedAt: now
        };
        
        // Get notes from localStorage
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // If editing, update existing note, otherwise add new one
        if (!isNewNote && currentNoteId) {
            const index = notes.findIndex(n => n.id === currentNoteId);
            if (index !== -1) {
                // Preserve created date
                note.createdAt = notes[index].createdAt;
                notes[index] = note;
            }
        } else {
            notes.push(note);
            currentNoteId = note.id;
            isNewNote = false;
        }
        
        // Save notes to localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Reload notes
        loadNotes(notesSearchInput.value.trim());
        
        // Show delete button
        deleteNoteBtn.style.display = 'flex';
        
        // Show success message
        showToast('Note saved successfully', 'success');
    }
    
    function deleteNote() {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }
        
        // Get notes from localStorage
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Find the note index
        const index = notes.findIndex(n => n.id === currentNoteId);
        
        if (index === -1) {
            return;
        }
        
        // Remove note
        notes.splice(index, 1);
        
        // Save notes to localStorage
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Clear editor
        clearEditor();
        
        // Reload notes
        loadNotes(notesSearchInput.value.trim());
        
        // Show success message
        showToast('Note deleted', 'success');
    }
    
    function discardNote() {
        // If this is a new note, clear editor
        if (isNewNote) {
            clearEditor();
            return;
        }
        
        // Otherwise, reload the current note
        loadNoteIntoEditor(currentNoteId);
    }
    
    function clearEditor() {
        // Clear inputs
        noteTitleInput.value = '';
        noteContent.value = '';
        noteCategorySelect.value = '';
        
        // Reset word count
        updateWordCount();
        
        // Hide delete button
        deleteNoteBtn.style.display = 'none';
        
        // Reset current note ID
        currentNoteId = null;
        isNewNote = true;
    }
    
    function updateWordCount() {
        const text = noteContent.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
        charCount.textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
    }
    
    function applyFormat(format) {
        // Get selection
        const start = noteContent.selectionStart;
        const end = noteContent.selectionEnd;
        const selection = noteContent.value.substring(start, end);
        
        // Apply format based on type
        let formattedText = '';
        
        switch (format) {
            case 'bold':
                formattedText = `**${selection}**`;
                break;
            case 'italic':
                formattedText = `*${selection}*`;
                break;
            case 'underline':
                formattedText = `_${selection}_`;
                break;
            case 'heading':
                formattedText = `# ${selection}`;
                break;
            case 'list-ul':
                formattedText = `\n- ${selection.split('\n').join('\n- ')}`;
                break;
            case 'list-ol':
                formattedText = selection.split('\n').map((line, i) => `\n${i + 1}. ${line}`).join('');
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    formattedText = `[${selection || 'Link'}](${url})`;
                } else {
                    return;
                }
                break;
            case 'image':
                const imageUrl = prompt('Enter image URL:');
                if (imageUrl) {
                    formattedText = `![${selection || 'Image'}](${imageUrl})`;
                } else {
                    return;
                }
                break;
            case 'undo':
                document.execCommand('undo');
                return;
            case 'redo':
                document.execCommand('redo');
                return;
            default:
                return;
        }
        
        // Insert formatted text
        noteContent.value = noteContent.value.substring(0, start) + formattedText + noteContent.value.substring(end);
        
        // Update word count
        updateWordCount();
        
        // Set focus back to textarea
        noteContent.focus();
        
        // Set selection to end of formatted text
        noteContent.selectionStart = start + formattedText.length;
        noteContent.selectionEnd = start + formattedText.length;
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
    module.exports = { initNotes };
} 