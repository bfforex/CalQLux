/**
 * CalQLux - Illumination Design Calculator
 * UI Management Module
 */

/**
 * Initialize the UI
 * @param {Object} appState - Application state
 */
export function initUI(appState) {
    console.log('Initializing UI components...');
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set initial form field values based on preferences
    setInitialFormValues(appState);
    
    console.log('UI components initialized');
}

/**
 * Set up tab navigation within the results area
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding panel
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Set initial form values based on user preferences
 * @param {Object} appState - Application state
 */
function setInitialFormValues(appState) {
    // Set unit selectors
    const lengthUnitSelectors = document.querySelectorAll(
        '#room-length-unit, #room-width-unit, #ceiling-height-unit, #work-plane-height-unit, ' +
        '#luminaire-height-unit, #grid-spacing-unit'
    );
    
    lengthUnitSelectors.forEach(selector => {
        selector.value = appState.units.length;
    });
}

/**
 * Toggle between light and dark theme
 * @param {Object} appState - Application state
 */
export function toggleTheme(appState) {
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('span');
    
    if (appState.theme === 'light') {
        body.classList.add('dark-theme');
        themeIcon.textContent = 'light_mode';
        appState.theme = 'dark';
    } else {
        body.classList.remove('dark-theme');
        themeIcon.textContent = 'dark_mode';
        appState.theme = 'light';
    }
}

/**
 * Display a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toasts');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove toast after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
}