/**
 * CalQLux - Project Management Module
 * Functions for saving, loading, and sharing lighting design projects
 */

/**
 * Project data structure
 * @typedef {Object} Project
 * @property {string} id - Unique project ID
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} createdDate - Creation date
 * @property {string} modifiedDate - Last modification date
 * @property {Object} roomConfig - Room configuration
 * @property {Array} luminaires - Luminaire configurations
 * @property {Object} calculationSettings - Calculation settings
 * @property {Object} results - Calculation results (optional)
 */

/**
 * Create a new project
 * @param {string} name - Project name
 * @param {string} description - Project description
 * @returns {Project} - New project object
 */
export function createProject(name, description) {
    const now = new Date().toISOString();
    
    return {
        id: generateUniqueId(),
        name: name || 'Untitled Project',
        description: description || '',
        createdDate: now,
        modifiedDate: now,
        roomConfig: {
            length: 10,
            width: 8,
            height: 3,
            workPlaneHeight: 0.8,
            reflectances: {
                ceiling: 0.7,
                walls: 0.5,
                floor: 0.2
            }
        },
        luminaires: [],
        calculationSettings: {
            type: 'point-by-point',
            gridSpacing: 0.5
        },
        results: null
    };
}

/**
 * Save project to localStorage
 * @param {Project} project - Project to save
 * @returns {boolean} - Success status
 */
export function saveProject(project) {
    try {
        // Update modification date
        project.modifiedDate = new Date().toISOString();
        
        // Get existing projects
        const projectsJson = localStorage.getItem('calqlux-projects');
        const projects = projectsJson ? JSON.parse(projectsJson) : {};
        
        // Add or update project
        projects[project.id] = project;
        
        // Save back to localStorage
        localStorage.setItem('calqlux-projects', JSON.stringify(projects));
        
        return true;
    } catch (error) {
        console.error('Error saving project:', error);
        return false;
    }
}

/**
 * Load project from localStorage
 * @param {string} id - Project ID
 * @returns {Project|null} - Project object or null if not found
 */
export function loadProject(id) {
    try {
        const projectsJson = localStorage.getItem('calqlux-projects');
        
        if (!projectsJson) {
            return null;
        }
        
        const projects = JSON.parse(projectsJson);
        return projects[id] || null;
    } catch (error) {
        console.error('Error loading project:', error);
        return null;
    }
}

/**
 * Get all saved projects
 * @returns {Array} - Array of projects
 */
export function getAllProjects() {
    try {
        const projectsJson = localStorage.getItem('calqlux-projects');
        
        if (!projectsJson) {
            return [];
        }
        
        const projects = JSON.parse(projectsJson);
        return Object.values(projects).sort((a, b) => 
            new Date(b.modifiedDate) - new Date(a.modifiedDate)
        );
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

/**
 * Delete a project
 * @param {string} id - Project ID
 * @returns {boolean} - Success status
 */
export function deleteProject(id) {
    try {
        const projectsJson = localStorage.getItem('calqlux-projects');
        
        if (!projectsJson) {
            return false;
        }
        
        const projects = JSON.parse(projectsJson);
        
        if (!projects[id]) {
            return false;
        }
        
        delete projects[id];
        localStorage.setItem('calqlux-projects', JSON.stringify(projects));
        
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        return false;
    }
}

/**
 * Export project to file
 * @param {Project} project - Project to export
 */
export function exportProject(project) {
    try {
        const projectJson = JSON.stringify(project, null, 2);
        const blob = new Blob([projectJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.calqlux`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting project:', error);
        throw error;
    }
}

/**
 * Import project from file
 * @param {File} file - File to import
 * @returns {Promise<Project>} - Imported project
 */
export function importProject(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target.result);
                
                // Validate project structure
                if (!isValidProject(project)) {
                    reject(new Error('Invalid project file format'));
                    return;
                }
                
                // Generate new ID to avoid conflicts
                project.id = generateUniqueId();
                project.modifiedDate = new Date().toISOString();
                
                resolve(project);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Create a shareable link for a project
 * @param {Project} project - Project to share
 * @returns {string} - Shareable link
 */
export function createShareableLink(project) {
    try {
        // Create a copy of the project without results to reduce size
        const shareableProject = { ...project };
        delete shareableProject.results;
        
        // Compress project data
        const projectJson = JSON.stringify(shareableProject);
        const compressedData = compressData(projectJson);
        
        // Create base64 encoded string
        const base64Data = btoa(compressedData);
        
        // Create URL with data
        const url = new URL(window.location.href);
        url.searchParams.set('project', base64Data);
        
        return url.toString();
    } catch (error) {
        console.error('Error creating shareable link:', error);
        throw error;
    }
}

/**
 * Load project from shareable link
 * @returns {Project|null} - Project object or null if no project in URL
 */
export function loadProjectFromLink() {
    try {
        const url = new URL(window.location.href);
        const projectData = url.searchParams.get('project');
        
        if (!projectData) {
            return null;
        }
        
        // Decode base64 data
        const compressedData = atob(projectData);
        
        // Decompress data
        const projectJson = decompressData(compressedData);
        
        // Parse project
        const project = JSON.parse(projectJson);
        
        // Validate project
        if (!isValidProject(project)) {
            throw new Error('Invalid project data in link');
        }
        
        // Generate new ID to avoid conflicts
        project.id = generateUniqueId();
        project.modifiedDate = new Date().toISOString();
        
        return project;
    } catch (error) {
        console.error('Error loading project from link:', error);
        return null;
    }
}

/**
 * Check if project has valid structure
 * @param {Object} project - Project to validate
 * @returns {boolean} - Validation result
 */
function isValidProject(project) {
    return (
        project &&
        typeof project === 'object' &&
        typeof project.name === 'string' &&
        typeof project.roomConfig === 'object' &&
        Array.isArray(project.luminaires) &&
        typeof project.calculationSettings === 'object'
    );
}

/**
 * Generate a unique project ID
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
    return 'p_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Compress data string (simplified)
 * @param {string} data - Data to compress
 * @returns {string} - Compressed data
 */
function compressData(data) {
    // In a real implementation, you would use a compression library
    // For this example, we'll just return the original data
    // You could use something like pako.js in production
    return data;
}

/**
 * Decompress data string (simplified)
 * @param {string} compressedData - Compressed data
 * @returns {string} - Decompressed data
 */
function decompressData(compressedData) {
    // In a real implementation, you would use a compression library
    // For this example, we'll just return the original data
    return compressedData;
}

/**
 * Create project management UI
 * @param {HTMLElement} container - Container element
 * @param {Function} onLoad - Callback when project is loaded
 * @param {Function} onNew - Callback when new project is created
 */
export function createProjectManagementUI(container, onLoad, onNew) {
    container.innerHTML = `
        <div class="project-header">
            <h2>Project Management</h2>
            <button id="new-project-btn" class="btn-primary">New Project</button>
            <button id="import-project-btn" class="btn-secondary">Import Project</button>
        </div>
        
        <div class="project-filter">
            <input type="text" id="project-search" placeholder="Search projects...">
            <div class="sort-options">
                <label>Sort by:</label>
                <select id="project-sort">
                    <option value="recent">Recently Modified</option>
                    <option value="name">Name</option>
                    <option value="created">Creation Date</option>
                </select>
            </div>
        </div>
        
        <div class="projects-list"></div>
    `;
    
    // Get UI elements
    const newProjectBtn = container.querySelector('#new-project-btn');
    const importProjectBtn = container.querySelector('#import-project-btn');
    const projectSearch = container.querySelector('#project-search');
    const projectSort = container.querySelector('#project-sort');
    const projectsList = container.querySelector('.projects-list');
    
    // Set up event listeners
    newProjectBtn.addEventListener('click', () => {
        // Show new project dialog
        showNewProjectDialog(onNew);
    });
    
    importProjectBtn.addEventListener('click', () => {
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.calqlux,application/json';
        
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length === 0) {
                return;
            }
            
            try {
                const file = e.target.files[0];
                const project = await importProject(file);
                
                // Save imported project
                saveProject(project);
                
                // Update projects list
                updateProjectsList(projectsList, projectSearch.value, projectSort.value, onLoad);
                
                // Notify success
                showToast(`Project "${project.name}" imported successfully`, 'success');
                
                // Load the imported project
                onLoad(project);
            } catch (error) {
                console.error('Import error:', error);
                showToast(`Error importing project: ${error.message}`, 'error');
            }
        });
        
        // Trigger file selection
        fileInput.click();
    });
    
    projectSearch.addEventListener('input', () => {
        updateProjectsList(projectsList, projectSearch.value, projectSort.value, onLoad);
    });
    
    projectSort.addEventListener('change', () => {
        updateProjectsList(projectsList, projectSearch.value, projectSort.value, onLoad);
    });
    
    // Initial update of projects list
    updateProjectsList(projectsList, '', 'recent', onLoad);
}

/**
 * Update projects list based on search and sort
 * @param {HTMLElement} listContainer - Projects list container
 * @param {string} searchQuery - Search query
 * @param {string} sortBy - Sort method
 * @param {Function} onLoad - Callback when project is loaded
 */
function updateProjectsList(listContainer, searchQuery, sortBy, onLoad) {
    // Get all projects
    const projects = getAllProjects();
    
    // Filter by search query
    const filteredProjects = searchQuery ? 
        projects.filter(project => 
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) : projects;
    
    // Sort projects
    const sortedProjects = sortProjects(filteredProjects, sortBy);
    
    // Render projects
    renderProjectsList(listContainer, sortedProjects, onLoad);
}

/**
 * Sort projects based on sort method
 * @param {Array} projects - Projects to sort
 * @param {string} sortBy - Sort method
 * @returns {Array} - Sorted projects
 */
function sortProjects(projects, sortBy) {
    switch (sortBy) {
        case 'name':
            return [...projects].sort((a, b) => a.name.localeCompare(b.name));
        case 'created':
            return [...projects].sort((a, b) => 
                new Date(b.createdDate) - new Date(a.createdDate)
            );
        case 'recent':
        default:
            return [...projects].sort((a, b) => 
                new Date(b.modifiedDate) - new Date(a.modifiedDate)
            );
    }
}

/**
 * Render projects list
 * @param {HTMLElement} container - Container element
 * @param {Array} projects - Projects to render
 * @param {Function} onLoad - Callback when project is loaded
 */
function renderProjectsList(container, projects, onLoad) {
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="no-projects">
                <p>No projects found</p>
                <p>Click "New Project" to create a new lighting design</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        // Format dates
        const createdDate = new Date(project.createdDate).toLocaleDateString();
        const modifiedDate = new Date(project.modifiedDate).toLocaleDateString();
        
        projectCard.innerHTML = `
            <div class="project-info">
                <h3>${project.name}</h3>
                <p>${project.description || 'No description'}</p>
                <div class="project-meta">
                    <span>Created: ${createdDate}</span>
                    <span>Modified: ${modifiedDate}</span>
                </div>
            </div>
            <div class="project-actions">
                <button class="btn-primary load-project">Open</button>
                <button class="btn-secondary share-project">Share</button>
                <button class="btn-secondary export-project">Export</button>
                <button class="btn-secondary delete-project">Delete</button>
            </div>
        `;
        
        // Set up event listeners
        const loadBtn = projectCard.querySelector('.load-project');
        loadBtn.addEventListener('click', () => {
            onLoad(project);
        });
        
        const shareBtn = projectCard.querySelector('.share-project');
        shareBtn.addEventListener('click', () => {
            try {
                const shareLink = createShareableLink(project);
                
                // Show share dialog
                showShareDialog(project.name, shareLink);
            } catch (error) {
                console.error('Error sharing project:', error);
                showToast(`Error creating share link: ${error.message}`, 'error');
            }
        });
        
        const exportBtn = projectCard.querySelector('.export-project');
        exportBtn.addEventListener('click', () => {
            try {
                exportProject(project);
                showToast(`Project "${project.name}" exported successfully`, 'success');
            } catch (error) {
                console.error('Error exporting project:', error);
                showToast(`Error exporting project: ${error.message}`, 'error');
            }
        });
        
        const deleteBtn = projectCard.querySelector('.delete-project');
        deleteBtn.addEventListener('click', () => {
            // Show confirmation dialog
            if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                const success = deleteProject(project.id);
                
                if (success) {
                    showToast(`Project "${project.name}" deleted`, 'success');
                    
                    // Remove project card from DOM
                    projectCard.remove();
                    
                    // Check if list is now empty
                    if (container.children.length === 0) {
                        container.innerHTML = `
                            <div class="no-projects">
                                <p>No projects found</p>
                                <p>Click "New Project" to create a new lighting design</p>
                            </div>
                        `;
                    }
                } else {
                    showToast('Error deleting project', 'error');
                }
            }
        });
        
        container.appendChild(projectCard);
    });
}

/**
 * Show new project dialog
 * @param {Function} onNew - Callback when new project is created
 */
function showNewProjectDialog(onNew) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Project</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="project-name">Project Name</label>
                    <input type="text" id="project-name" required>
                </div>
                <div class="form-group">
                    <label for="project-description">Description</label>
                    <textarea id="project-description" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-primary create-btn">Create Project</button>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Focus name input
    const nameInput = modal.querySelector('#project-name');
    nameInput.focus();
    
    // Set up event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const createBtn = modal.querySelector('.create-btn');
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    createBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const description = modal.querySelector('#project-description').value.trim();
        
        if (!name) {
            showToast('Project name is required', 'error');
            return;
        }
        
        // Create new project
        const project = createProject(name, description);
        
        // Save project
        saveProject(project);
        
        // Close modal
        document.body.removeChild(modal);
        
        // Notify success
        showToast(`Project "${name}" created successfully`, 'success');
        
        // Call callback
        onNew(project);
    });
}

/**
 * Show share dialog
 * @param {string} projectName - Project name
 * @param {string} shareLink - Shareable link
 */
function showShareDialog(projectName, shareLink) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Share Project</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Share this link to your project "${projectName}":</p>
                <div class="share-link-container">
                    <input type="text" id="share-link" value="${shareLink}" readonly>
                    <button class="btn-primary copy-btn">Copy</button>
                </div>
                <div class="share-options">
                    <p>Or share directly:</p>
                    <div class="share-buttons">
                        <button class="btn-secondary email-share">Email</button>
                        <button class="btn-secondary twitter-share">Twitter</button>
                        <button class="btn-secondary linkedin-share">LinkedIn</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary close-modal">Close</button>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Set up event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const closeModalBtn = modal.querySelector('.close-modal');
    const copyBtn = modal.querySelector('.copy-btn');
    const shareLinkInput = modal.querySelector('#share-link');
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    closeModalBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    copyBtn.addEventListener('click', () => {
        // Select link text
        shareLinkInput.select();
        
        // Copy to clipboard
        document.execCommand('copy');
        
        // Show toast
        showToast('Link copied to clipboard', 'success');
    });
    
    // Email share
    modal.querySelector('.email-share').addEventListener('click', () => {
        const subject = encodeURIComponent(`Check out my CalQLux lighting design: ${projectName}`);
        const body = encodeURIComponent(`I've created a lighting design with CalQLux that I'd like to share with you:\n\n${shareLink}`);
        
        window.open(`mailto:?subject=${subject}&body=${body}`);
    });
    
    // Twitter share
    modal.querySelector('.twitter-share').addEventListener('click', () => {
        const text = encodeURIComponent(`Check out my CalQLux lighting design: ${projectName}`);
        
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareLink)}`);
    });
    
    // LinkedIn share
    modal.querySelector('.linkedin-share').addEventListener('click', () => {
        const title = encodeURIComponent(`CalQLux Lighting Design: ${projectName}`);
        
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}&title=${title}`);
    });
}

/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
function showToast(message, type) {
    const toastContainer = document.getElementById('toasts') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Create toast container if it doesn't exist
 * @returns {HTMLElement} - Toast container
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toasts';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}