/**
 * CalQLux - Illumination Design Calculator
 * UI Module - Handles UI initialization and theme management
 */

/**
 * Initialize UI components
 * @param {Object} appState - Application state
 */
export function initUI(appState) {
    console.log('Initializing UI components...');
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize collapsible sections
    initCollapsibleSections();
    
    // Initialize form controls
    initFormControls(appState);
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize color scale
    initColorScale();
    
    console.log('UI components initialized');
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = trigger.getAttribute('data-tooltip');
        
        // Add event listeners
        trigger.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const triggerRect = trigger.getBoundingClientRect();
            tooltip.style.top = `${triggerRect.top - tooltip.offsetHeight - 5}px`;
            tooltip.style.left = `${triggerRect.left + triggerRect.width / 2 - tooltip.offsetWidth / 2}px`;
            
            // Show tooltip
            setTimeout(() => {
                tooltip.classList.add('visible');
            }, 10);
        });
        
        trigger.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
            
            // Remove tooltip after animation
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        });
    });
}

/**
 * Initialize collapsible sections
 */
function initCollapsibleSections() {
    const collapsibles = document.querySelectorAll('.collapsible-header');
    
    collapsibles.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentNode;
            
            // Toggle expanded state
            section.classList.toggle('collapsed');
            
            // Update icon
            const icon = header.querySelector('.collapse-icon');
            if (icon) {
                icon.textContent = section.classList.contains('collapsed') ? 'expand_more' : 'expand_less';
            }
            
            // Save preference if it has an ID
            if (section.id) {
                try {
                    const collapsedSections = JSON.parse(localStorage.getItem('calqlux-collapsed-sections') || '{}');
                    collapsedSections[section.id] = section.classList.contains('collapsed');
                    localStorage.setItem('calqlux-collapsed-sections', JSON.stringify(collapsedSections));
                } catch (error) {
                    console.error('Error saving section state:', error);
                }
            }
        });
        
        // Initialize state from localStorage if it has an ID
        const section = header.parentNode;
        if (section.id) {
            try {
                const collapsedSections = JSON.parse(localStorage.getItem('calqlux-collapsed-sections') || '{}');
                
                if (collapsedSections[section.id]) {
                    section.classList.add('collapsed');
                    
                    // Update icon
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) {
                        icon.textContent = 'expand_more';
                    }
                }
            } catch (error) {
                console.error('Error loading section state:', error);
            }
        }
    });
}

/**
 * Initialize form controls
 * @param {Object} appState - Application state
 */
function initFormControls(appState) {
    // Initialize unit toggles
    initUnitToggles(appState);
    
    // Initialize range inputs
    initRangeInputs();
    
    // Initialize custom luminaire layout controls
    initLuminaireLayoutControls();
    
    // Initialize material reflectance controls
    initReflectanceControls();
}

/**
 * Initialize unit toggles
 * @param {Object} appState - Application state
 */
function initUnitToggles(appState) {
    // Set initial values based on app state
    document.querySelectorAll('select[id$="-unit"]').forEach(unitSelect => {
        const baseId = unitSelect.id.replace('-unit', '');
        const unitType = getUnitType(baseId);
        
        if (unitType && appState.units[unitType]) {
            unitSelect.value = appState.units[unitType];
        }
        
        // Listen for changes
        unitSelect.addEventListener('change', () => {
            if (unitType) {
                appState.units[unitType] = unitSelect.value;
                
                // Save preferences
                try {
                    const prefsToSave = {
                        units: appState.units,
                        theme: appState.theme
                    };
                    
                    localStorage.setItem('calqlux-preferences', JSON.stringify(prefsToSave));
                } catch (error) {
                    console.error('Error saving preferences:', error);
                }
            }
        });
    });
}

/**
 * Get unit type based on element ID
 * @param {string} id - Element ID
 * @returns {string|null} - Unit type or null if not found
 */
function getUnitType(id) {
    if (id.includes('length') || id.includes('width') || id.includes('height') || 
        id.includes('spacing') || id.includes('distance')) {
        return 'length';
    } else if (id.includes('illuminance') || id.includes('lux')) {
        return 'illuminance';
    }
    
    return null;
}

/**
 * Initialize range inputs with live value display
 */
function initRangeInputs() {
    document.querySelectorAll('input[type="range"]').forEach(range => {
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'range-value';
        valueDisplay.textContent = range.value;
        
        // Insert after range input
        range.parentNode.insertBefore(valueDisplay, range.nextSibling);
        
        // Update display on input
        range.addEventListener('input', () => {
            valueDisplay.textContent = range.value;
        });
    });
}

/**
 * Initialize luminaire layout controls
 */
function initLuminaireLayoutControls() {
    const layoutSelect = document.getElementById('luminaire-layout');
    const rowsInput = document.getElementById('luminaire-rows');
    const columnsInput = document.getElementById('luminaire-columns');
    
    if (layoutSelect && rowsInput && columnsInput) {
        // Set initial state
        const customLayout = layoutSelect.value === 'custom';
        rowsInput.disabled = !customLayout;
        columnsInput.disabled = !customLayout;
        
        // Update on change
        layoutSelect.addEventListener('change', () => {
            const custom = layoutSelect.value === 'custom';
            rowsInput.disabled = !custom;
            columnsInput.disabled = !custom;
            
            // Update values for preset layouts
            if (!custom) {
                switch (layoutSelect.value) {
                    case 'single':
                        rowsInput.value = 1;
                        columnsInput.value = 1;
                        break;
                    case '2x2':
                        rowsInput.value = 2;
                        columnsInput.value = 2;
                        break;
                    case '3x3':
                        rowsInput.value = 3;
                        columnsInput.value = 3;
                        break;
                    case '3x4':
                        rowsInput.value = 3;
                        columnsInput.value = 4;
                        break;
                    case '4x4':
                        rowsInput.value = 4;
                        columnsInput.value = 4;
                        break;
                }
            }
        });
    }
}

/**
 * Initialize reflectance controls with presets
 */
function initReflectanceControls() {
    const presetSelect = document.getElementById('material-preset');
    const ceilingInput = document.getElementById('ceiling-refl');
    const wallInput = document.getElementById('wall-refl');
    const floorInput = document.getElementById('floor-refl');
    
    if (presetSelect && ceilingInput && wallInput && floorInput) {
        presetSelect.addEventListener('change', () => {
            switch (presetSelect.value) {
                case 'office':
                    ceilingInput.value = 80;
                    wallInput.value = 50;
                    floorInput.value = 20;
                    break;
                case 'classroom':
                    ceilingInput.value = 70;
                    wallInput.value = 50;
                    floorInput.value = 20;
                    break;
                case 'industrial':
                    ceilingInput.value = 60;
                    wallInput.value = 30;
                    floorInput.value = 10;
                    break;
                case 'retail':
                    ceilingInput.value = 70;
                    wallInput.value = 40;
                    floorInput.value = 20;
                    break;
                case 'custom':
                    // Do nothing, keep current values
                    break;
            }
            
            // Trigger change events to update any dependent components
            ceilingInput.dispatchEvent(new Event('input'));
            wallInput.dispatchEvent(new Event('input'));
            floorInput.dispatchEvent(new Event('input'));
        });
    }
}

/**
 * Initialize tab navigation
 */
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get tab ID from data attribute
            const tabId = button.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to selected button and panel
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Initialize color scale
 */
function initColorScale() {
    const scaleContainer = document.querySelector('.color-scale');
    
    if (scaleContainer) {
        // Create default color scale
        for (let i = 0; i < 10; i++) {
            const segment = document.createElement('div');
            segment.style.flex = 1;
            segment.style.height = '20px';
            
            // Color gradient from blue to green to red
            if (i < 5) {
                // Blue to green (0-0.5)
                const t = i / 4;
                const r = Math.round(0 * (1 - t) + 0 * t);
                const g = Math.round(0 * (1 - t) + 255 * t);
                const b = Math.round(255 * (1 - t) + 0 * t);
                segment.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            } else {
                // Green to red (0.5-1.0)
                const t = (i - 5) / 4;
                const r = Math.round(0 * (1 - t) + 255 * t);
                const g = Math.round(255 * (1 - t) + 0 * t);
                const b = Math.round(0 * (1 - t) + 0 * t);
                segment.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
            
            scaleContainer.appendChild(segment);
        }
    }
}

/**
 * Toggle theme
 * @param {Object} appState - Application state
 */
export function toggleTheme(appState) {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    applyTheme(appState.theme);
    return appState.theme;
}

/**
 * Apply theme
 * @param {string} theme - Theme name
 */
function applyTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
}