/**
 * CalQLux - Illumination Design Calculator
 * Main Application Entry Point
 */

// Import modules
import { initUI, toggleTheme } from './ui.js';
import { 
    initPointCalculations,
    initAverageCalculations,
    initCoefficientCalculations,
    initUniformityCalculations,
    initLuminanceCalculations
} from './calculations/index.js';
import { 
    initCharts,
    initDiagrams
} from './visualization/index.js';

// Application state
const appState = {
    currentCalculationType: 'point-by-point',
    currentLuminaire: 'default',
    units: {
        length: 'm',
        illuminance: 'lx'
    },
    theme: 'light',
    calculationResults: null,
    isCalculating: false
};

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing CalQLux Application...');
    
    // Check for saved preferences
    loadPreferences();
    
    // Initialize UI components
    initUI(appState);
    
    // Initialize calculation modules
    initCalculationModules();
    
    // Initialize visualization tools
    initVisualizationTools();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply theme
    applyTheme();
    
    console.log('CalQLux Application initialized');
}

/**
 * Load user preferences from localStorage
 */
function loadPreferences() {
    try {
        const savedPrefs = localStorage.getItem('calqlux-preferences');
        
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            
            if (prefs.units) {
                appState.units = { ...appState.units, ...prefs.units };
            }
            
            if (prefs.theme) {
                appState.theme = prefs.theme;
            }
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

/**
 * Save user preferences to localStorage
 */
function savePreferences() {
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

/**
 * Initialize calculation modules
 */
function initCalculationModules() {
    initPointCalculations(appState);
    initAverageCalculations(appState);
    initCoefficientCalculations(appState);
    initUniformityCalculations(appState);
    initLuminanceCalculations(appState);
}

/**
 * Initialize visualization tools
 */
function initVisualizationTools() {
    initCharts(appState);
    initDiagrams(appState);
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.main-nav a').forEach(navLink => {
        navLink.addEventListener('click', handleNavigation);
    });
    
    // Calculation type selection
    document.querySelectorAll('.calc-btn').forEach(calcBtn => {
        calcBtn.addEventListener('click', handleCalcTypeChange);
    });
    
    // Form submission
    document.getElementById('point-by-point-form').addEventListener('submit', handleFormSubmit);
    
    // Reset form
    document.getElementById('reset-form').addEventListener('click', resetForm);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', handleThemeToggle);
    
    // Custom layout toggle
    document.getElementById('luminaire-layout').addEventListener('change', handleLayoutChange);
    
    // Preset modal
    document.getElementById('preset-btn').addEventListener('click', openPresetModal);
    document.querySelector('#preset-modal .close-btn').addEventListener('click', closePresetModal);
    document.querySelector('#preset-modal .close-modal').addEventListener('click', closePresetModal);
    
    // Export buttons
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
    document.getElementById('export-csv').addEventListener('click', exportCSV);
    
    // Import IES
    document.getElementById('import-ies').addEventListener('click', importIESFile);
}

/**
 * Handle navigation clicks
 * @param {Event} e - Click event
 */
function handleNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all nav links
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    e.target.classList.add('active');
    
    // Get the view to display
    const view = e.target.dataset.view;
    
    // In a full application, we would change views here
    console.log(`Navigating to view: ${view}`);
    
    // Show toast notification for demo purposes
    showToast(`Navigation to ${view} view is not implemented in this demo`, 'info');
}

/**
 * Handle calculation type change
 * @param {Event} e - Click event
 */
function handleCalcTypeChange(e) {
    // Remove active class from all calc buttons
    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    e.target.classList.add('active');
    
    // Update current calculation type
    appState.currentCalculationType = e.target.dataset.calc;
    
    // Hide all forms
    document.querySelectorAll('.calc-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected form
    const formId = `${appState.currentCalculationType}-form`;
    const selectedForm = document.getElementById(formId);
    
    if (selectedForm) {
        selectedForm.classList.add('active');
    } else {
        // For demo, only point-by-point form is implemented
        showToast(`Form for ${appState.currentCalculationType} calculation is not implemented in this demo`, 'info');
        
        // Keep the point-by-point form active
        document.getElementById('point-by-point-form').classList.add('active');
    }
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (appState.isCalculating) {
        return;
    }
    
    // Set calculating state
    appState.isCalculating = true;
    
    // Get form data
    const formData = getFormData();
    
    // Show loading indicator
    showToast('Calculating...', 'info');
    
    // Simulate calculation process
    setTimeout(() => {
        try {
            // Perform calculation based on current type
            let results;
            
            switch (appState.currentCalculationType) {
                case 'point-by-point':
                    results = calculatePointByPoint(formData);
                    break;
                case 'average':
                    results = { average: 350, min: 120, max: 580, uniformity: 0.34 };
                    break;
                case 'utilization':
                    results = { average: 320, min: 100, max: 520, uniformity: 0.31 };
                    break;
                case 'uniformity':
                    results = { average: 380, min: 200, max: 560, uniformity: 0.53 };
                    break;
                case 'luminance':
                    results = { average: 250, min: 80, max: 420, uniformity: 0.32 };
                    break;
                default:
                    throw new Error('Unknown calculation type');
            }
            
            // Save results to state
            appState.calculationResults = results;
            
            // Display results
            displayResults(results);
            
            // Enable export buttons
            document.getElementById('export-pdf').disabled = false;
            document.getElementById('export-csv').disabled = false;
            
            // Show success notification
            showToast('Calculation completed successfully', 'success');
        } catch (error) {
            console.error('Calculation error:', error);
            showToast('Error during calculation: ' + error.message, 'error');
        } finally {
            // Reset calculating state
            appState.isCalculating = false;
        }
    }, 1000);
}

/**
 * Get form data from the current form
 * @returns {Object} - Form data object
 */
function getFormData() {
    const formId = `${appState.currentCalculationType}-form`;
    const form = document.getElementById(formId) || document.getElementById('point-by-point-form');
    
    // For demonstration purposes, get values from point-by-point form
    return {
        room: {
            length: parseFloat(document.getElementById('room-length').value),
            lengthUnit: document.getElementById('room-length-unit').value,
            width: parseFloat(document.getElementById('room-width').value),
            widthUnit: document.getElementById('room-width-unit').value,
            height: parseFloat(document.getElementById('ceiling-height').value),
            heightUnit: document.getElementById('ceiling-height-unit').value
        },
        workPlane: {
            height: parseFloat(document.getElementById('work-plane-height').value),
            heightUnit: document.getElementById('work-plane-height-unit').value
        },
        reflectances: {
            ceiling: parseFloat(document.getElementById('ceiling-refl').value) / 100,
            walls: parseFloat(document.getElementById('wall-refl').value) / 100,
            floor: parseFloat(document.getElementById('floor-refl').value) / 100
        },
        luminaires: {
            layout: document.getElementById('luminaire-layout').value,
            rows: parseInt(document.getElementById('luminaire-rows').value),
            columns: parseInt(document.getElementById('luminaire-columns').value),
            height: parseFloat(document.getElementById('luminaire-height').value),
            heightUnit: document.getElementById('luminaire-height-unit').value
        },
        calculation: {
            gridSpacing: parseFloat(document.getElementById('grid-spacing').value),
            gridSpacingUnit: document.getElementById('grid-spacing-unit').value
        }
    };
}

/**
 * Simulate point-by-point calculation
 * @param {Object} formData - Form data
 * @returns {Object} - Calculation results
 */
function calculatePointByPoint(formData) {
    console.log('Performing point-by-point calculation with data:', formData);
    
    // Convert all dimensions to meters if needed
    const lengthM = formData.room.lengthUnit === 'ft' ? formData.room.length * 0.3048 : formData.room.length;
    const widthM = formData.room.widthUnit === 'ft' ? formData.room.width * 0.3048 : formData.room.width;
    const gridSpacingM = formData.calculation.gridSpacingUnit === 'ft' ? 
        formData.calculation.gridSpacing * 0.3048 : formData.calculation.gridSpacing;
    
    // Calculate number of grid points
    const xPoints = Math.floor(lengthM / gridSpacingM) + 1;
    const yPoints = Math.floor(widthM / gridSpacingM) + 1;
    
    // Generate simulated illuminance grid
    const illuminanceGrid = [];
    let totalIlluminance = 0;
    let minIlluminance = Number.MAX_VALUE;
    let maxIlluminance = 0;
    
    for (let y = 0; y < yPoints; y++) {
        const row = [];
        for (let x = 0; x < xPoints; x++) {
            // Calculate position in space (0-1 normalized)
            const xPos = x / (xPoints - 1);
            const yPos = y / (yPoints - 1);
            
            // Simulate illuminance distribution - cosine falloff from center
            const centerX = 0.5;
            const centerY = 0.5;
            const distFromCenter = Math.sqrt(Math.pow(xPos - centerX, 2) + Math.pow(yPos - centerY, 2));
            
            // Base illuminance at center (500 lux)
            const baseIlluminance = 500;
            
            // Calculate illuminance with inverse square law approximation
            // and multiple light sources based on luminaire configuration
            let totalPointIlluminance = 0;
            
            for (let lr = 0; lr < formData.luminaires.rows; lr++) {
                for (let lc = 0; lc < formData.luminaires.columns; lc++) {
                    // Normalized luminaire position
                    const lxPos = (lc + 0.5) / formData.luminaires.columns;
                    const lyPos = (lr + 0.5) / formData.luminaires.rows;
                    
                    // Distance from this point to luminaire
                    const distToLuminaire = Math.sqrt(Math.pow(xPos - lxPos, 2) + Math.pow(yPos - lyPos, 2));
                    
                    // Inverse square law with cosine factor for distribution
                    const luminaireContribution = baseIlluminance * 
                        Math.cos(distToLuminaire * Math.PI * 0.8) / 
                        (1 + 5 * distToLuminaire * distToLuminaire);
                    
                    totalPointIlluminance += Math.max(0, luminaireContribution);
                }
            }
            
            // Add some noise to make it look more realistic
            const noise = Math.random() * 20 - 10;
            const finalIlluminance = Math.round(totalPointIlluminance + noise);
            
            row.push(finalIlluminance);
            
            // Track min, max, and total
            minIlluminance = Math.min(minIlluminance, finalIlluminance);
            maxIlluminance = Math.max(maxIlluminance, finalIlluminance);
            totalIlluminance += finalIlluminance;
        }
        illuminanceGrid.push(row);
    }
    
    // Calculate average
    const totalPoints = xPoints * yPoints;
    const avgIlluminance = Math.round(totalIlluminance / totalPoints);
    
    // Calculate uniformity ratio
    const uniformity = parseFloat((minIlluminance / avgIlluminance).toFixed(2));
    
    return {
        grid: illuminanceGrid,
        dimensions: {
            xPoints,
            yPoints,
            gridSpacingM,
            lengthM,
            widthM
        },
        average: avgIlluminance,
        min: minIlluminance,
        max: maxIlluminance,
        uniformity
    };
}

/**
 * Display calculation results
 * @param {Object} results - Calculation results
 */
function displayResults(results) {
    // Hide empty state
    document.querySelector('.empty-state').style.display = 'none';
    
    // Show results summary
    const summaryEl = document.querySelector('.results-summary');
    summaryEl.style.display = 'block';
    
    // Update summary card values
    summaryEl.querySelector('.summary-cards div:nth-child(1) .value').innerHTML = 
        `${results.average} <span class="unit">lx</span>`;
    
    summaryEl.querySelector('.summary-cards div:nth-child(2) .value').innerHTML = 
        `${results.min} <span class="unit">lx</span>`;
    
    summaryEl.querySelector('.summary-cards div:nth-child(3) .value').innerHTML = 
        `${results.max} <span class="unit">lx</span>`;
    
    summaryEl.querySelector('.summary-cards div:nth-child(4) .value').innerHTML = 
        results.uniformity.toFixed(2);
    
    // Show visualization tabs
    document.querySelector('.visualization-tabs').style.display = 'block';
    
    // Render results in the active tab
    const activeTabId = document.querySelector('.tab-btn.active').dataset.tab;
    renderTabContent(activeTabId, results);
}

/**
 * Render content for the active tab
 * @param {string} tabId - ID of the active tab
 * @param {Object} results - Calculation results
 */
function renderTabContent(tabId, results) {
    switch (tabId) {
        case 'illuminance-map':
            renderIlluminanceMap(results);
            break;
        case 'isolines':
            renderIsolines(results);
            break;
        case '3d-view':
            render3DView(results);
            break;
        case 'data-grid':
            renderDataGrid(results);
            break;
    }
}

/**
 * Render illuminance map
 * @param {Object} results - Calculation results
 */
function renderIlluminanceMap(results) {
    const canvas = document.getElementById('illuminance-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size
    const cellWidth = canvas.width / results.dimensions.xPoints;
    const cellHeight = canvas.height / results.dimensions.yPoints;
    
    // Draw illuminance map
    for (let y = 0; y < results.dimensions.yPoints; y++) {
        for (let x = 0; x < results.dimensions.xPoints; x++) {
            const illuminance = results.grid[y][x];
            
            // Calculate color based on illuminance value
            const color = getIlluminanceColor(illuminance, results.min, results.max);
            
            // Draw cell
            ctx.fillStyle = color;
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }
    
    // Generate color scale
    generateColorScale(results.min, results.max);
}

/**
 * Generate color scale for illuminance map
 * @param {number} min - Minimum illuminance value
 * @param {number} max - Maximum illuminance value
 */
function generateColorScale(min, max) {
    const scaleContainer = document.querySelector('.color-scale');
    scaleContainer.innerHTML = '';
    
    // Create 10 segments in the scale
    const segments = 10;
    const range = max - min;
    
    for (let i = 0; i < segments; i++) {
        const value = min + (i / (segments - 1)) * range;
        const color = getIlluminanceColor(value, min, max);
        
        const segment = document.createElement('div');
        segment.style.flex = 1;
        segment.style.backgroundColor = color;
        
        scaleContainer.appendChild(segment);
    }
    
    // Add min and max labels
    const minLabel = document.createElement('div');
    minLabel.className = 'scale-label min';
    minLabel.textContent = min + ' lx';
    
    const maxLabel = document.createElement('div');
    maxLabel.className = 'scale-label max';
    maxLabel.textContent = max + ' lx';
    
    scaleContainer.insertAdjacentElement('beforebegin', minLabel);
    scaleContainer.insertAdjacentElement('afterend', maxLabel);
}

/**
 * Get color for illuminance value using a heatmap scale
 * @param {number} value - Illuminance value
 * @param {number} min - Minimum illuminance value
 * @param {number} max - Maximum illuminance value
 * @returns {string} - Color in hex format
 */
function getIlluminanceColor(value, min, max) {
    // Normalize value between 0 and 1
    const normalized = (value - min) / (max - min);
    
    // Color stops from dark blue to red
    const colors = [
        { pos: 0.0, r: 13, g: 71, b: 161 },   // Dark blue
        { pos: 0.25, r: 0, g: 151, b: 230 },  // Light blue
        { pos: 0.5, r: 46, g: 204, b: 113 },  // Green
        { pos: 0.75, r: 241, g: 196, b: 15 }, // Yellow
        { pos: 1.0, r: 235, g: 59, b: 59 }    // Red
    ];
    
    // Find the two color stops that surround the normalized value
    let startColor, endColor;
    let localPos;
    
    for (let i = 0; i < colors.length - 1; i++) {
        if (normalized >= colors[i].pos && normalized <= colors[i + 1].pos) {
            startColor = colors[i];
            endColor = colors[i + 1];
            localPos = (normalized - startColor.pos) / (endColor.pos - startColor.pos);
            break;
        }
    }
    
    // If not found, use the extremes
    if (!startColor) {
        if (normalized <= 0) {
            startColor = endColor = colors[0];
            localPos = 0;
        } else {
            startColor = endColor = colors[colors.length - 1];
            localPos = 1;
        }
    }
    
    // Interpolate between the two colors
    const r = Math.round(startColor.r + localPos * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + localPos * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + localPos * (endColor.b - startColor.b));
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Render isolines visualization
 * @param {Object} results - Calculation results
 */
function renderIsolines(results) {
    const canvas = document.getElementById('isolines-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // For demo purposes, draw some placeholder isolines
    // In a real application, this would use a contour generation algorithm
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some example isolines
    const isovalues = [
        results.min,
        results.min + (results.max - results.min) * 0.25,
        results.min + (results.max - results.min) * 0.5,
        results.min + (results.max - results.min) * 0.75,
        results.max
    ];
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < isovalues.length; i++) {
        const value = isovalues[i];
        const offsetPercent = i / (isovalues.length - 1);
        
        // Draw elliptical isoline (simplified representation)
        ctx.beginPath();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radiusX = (1 - offsetPercent * 0.8) * (canvas.width * 0.4);
        const radiusY = (1 - offsetPercent * 0.8) * (canvas.height * 0.4);
        
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add value label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`${Math.round(value)} lx`, centerX + radiusX * 0.7, centerY);
    }
    
    // Add note that this is a simplified visualization
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '14px Arial';
    ctx.fillText