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
    initLuminanceCalculations,
    calculatePointByPoint,
    calculateAverageIlluminance,
    calculateCoefficientUtilization,
    calculateUniformity,
    calculateLuminance
} from './calculations/index.js';
import { 
    initCharts,
    initDiagrams,
    renderIlluminanceHeatmap,
    renderIsolines as renderChartIsolines,
    render3DIlluminanceVisualization
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
    
    // Tab navigation for results
    document.querySelectorAll('.tab-btn').forEach(tabBtn => {
        tabBtn.addEventListener('click', (e) => {
            // Remove active class from all tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Hide all tab panels
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Show selected panel
            const tabId = e.target.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            // Re-render the active tab if we have results
            if (appState.calculationResults) {
                renderTabContent(tabId, appState.calculationResults);
            }
        });
    });
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
                    results = calculateAverageIlluminance(formData);
                    break;
                case 'utilization':
                    results = calculateCoefficientUtilization(formData);
                    break;
                case 'uniformity':
                    results = calculateUniformity(formData);
                    break;
                case 'luminance':
                    results = calculateLuminance(formData);
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
        workplane: {
            height: parseFloat(document.getElementById('work-plane-height').value),
            heightUnit: document.getElementById('work-plane-height-unit').value
        },
        reflectances: {
            ceiling: parseFloat(document.getElementById('ceiling-refl').value),
            walls: parseFloat(document.getElementById('wall-refl').value),
            floor: parseFloat(document.getElementById('floor-refl').value)
        },
        luminaires: {
            layout: document.getElementById('luminaire-layout').value,
            rows: parseInt(document.getElementById('luminaire-rows').value),
            columns: parseInt(document.getElementById('luminaire-columns').value),
            height: parseFloat(document.getElementById('luminaire-height').value),
            heightUnit: document.getElementById('luminaire-height-unit').value,
            suspensionHeight: 0, // Default value
            flux: 5000 // Default luminous flux in lumens
        },
        calculation: {
            gridSpacing: parseFloat(document.getElementById('grid-spacing').value),
            gridSpacingUnit: document.getElementById('grid-spacing-unit').value
        },
        observation: {
            surface: 'workplane' // Default observation surface
        }
    };
}

/**
 * Reset the calculation form
 * @param {Event} e - Click event
 */
function resetForm(e) {
    e.preventDefault();
    
    // Get current form
    const formId = `${appState.currentCalculationType}-form`;
    const form = document.getElementById(formId) || document.getElementById('point-by-point-form');
    
    // Reset form
    form.reset();
    
    // Hide results
    document.querySelector('.results-content').classList.add('empty');
    document.querySelector('.empty-state').style.display = 'block';
    document.querySelector('.results-summary').style.display = 'none';
    document.querySelector('.visualization-tabs').style.display = 'none';
    
    // Disable export buttons
    document.getElementById('export-pdf').disabled = true;
    document.getElementById('export-csv').disabled = true;
    
    // Show toast notification
    showToast('Form has been reset', 'info');
}

/**
 * Handle theme toggle
 * @param {Event} e - Click event
 */
function handleThemeToggle(e) {
    // Toggle theme
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    
    // Apply theme
    applyTheme();
    
    // Save preferences
    savePreferences();
}

/**
 * Apply current theme
 */
function applyTheme() {
    document.body.classList.toggle('dark-theme', appState.theme === 'dark');
    
    // Update theme toggle button icon
    const themeIcon = document.querySelector('#theme-toggle .material-icons');
    if (themeIcon) {
        themeIcon.textContent = appState.theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
}

/**
 * Handle layout change
 * @param {Event} e - Change event
 */
function handleLayoutChange(e) {
    const customLayout = e.target.value === 'custom';
    
    // Toggle inputs for custom layout
    document.getElementById('luminaire-rows').disabled = !customLayout;
    document.getElementById('luminaire-columns').disabled = !customLayout;
}

/**
 * Open preset modal
 * @param {Event} e - Click event
 */
function openPresetModal(e) {
    e.preventDefault();
    document.getElementById('preset-modal').classList.add('active');
}

/**
 * Close preset modal
 * @param {Event} e - Click event
 */
function closePresetModal(e) {
    e.preventDefault();
    document.getElementById('preset-modal').classList.remove('active');
}

/**
 * Export results as PDF
 * @param {Event} e - Click event
 */
function exportPDF(e) {
    e.preventDefault();
    
    // Check if we have results
    if (!appState.calculationResults) {
        showToast('No calculation results to export', 'error');
        return;
    }
    
    // Show toast notification for demo purposes
    showToast('PDF export functionality is not implemented in this demo', 'info');
}

/**
 * Export results as CSV
 * @param {Event} e - Click event
 */
function exportCSV(e) {
    e.preventDefault();
    
    // Check if we have results
    if (!appState.calculationResults) {
        showToast('No calculation results to export', 'error');
        return;
    }
    
    // Get grid data
    const { grid } = appState.calculationResults;
    
    // Create CSV content
    let csv = 'data:text/csv;charset=utf-8,';
    
    // Add header row with X coordinates
    csv += 'Y/X,';
    for (let x = 0; x < grid[0].length; x++) {
        csv += x + ',';
    }
    csv += '\r\n';
    
    // Add data rows
    for (let y = 0; y < grid.length; y++) {
        csv += y + ',';
        for (let x = 0; x < grid[y].length; x++) {
            csv += grid[y][x] + ',';
        }
        csv += '\r\n';
    }
    
    // Create download link
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'calqlux_results.csv');
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Show toast notification
    showToast('Results exported as CSV', 'success');
}

/**
 * Import IES file
 * @param {Event} e - Click event
 */
function importIESFile(e) {
    e.preventDefault();
    
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ies';
    
    // Add event listener
    fileInput.addEventListener('change', (evt) => {
        if (evt.target.files.length === 0) {
            return;
        }
        
        const file = evt.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // In a real implementation, this would parse the IES file
                // and update the application state with the new luminaire data
                console.log('IES file loaded:', file.name);
                
                // Show toast notification for demo purposes
                showToast(`IES file "${file.name}" loaded successfully (parsing not implemented)`, 'success');
                
                // Add to luminaire list (demo)
                const luminaireList = document.querySelector('.luminaire-list');
                const newItem = document.createElement('li');
                newItem.className = 'luminaire-item';
                newItem.textContent = file.name;
                luminaireList.appendChild(newItem);
                
            } catch (error) {
                console.error('Error parsing IES file:', error);
                showToast('Error parsing IES file', 'error');
            }
        };
        
        reader.readAsText(file);
    });
    
    // Trigger file selection
    fileInput.click();
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
        results.uniformity;
    
    // Show visualization tabs
    document.querySelector('.visualization-tabs').style.display = 'block';
    
    // Render results in the active tab
    const activeTabId = document.querySelector('.tab-btn.active').dataset.tab;
    renderTabContent(activeTabId, results);
}

/**
 * Render tab content based on active tab
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
            
            // Draw value if cells are large enough
            if (cellWidth > 40 && cellHeight > 25) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(
                    x * cellWidth + cellWidth/2 - 15, 
                    y * cellHeight + cellHeight/2 - 7, 
                    30, 14
                );
                
                ctx.fillStyle = '#000';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    `${illuminance} lx`, 
                    x * cellWidth + cellWidth/2, 
                    y * cellHeight + cellHeight/2
                );
            }
        }
    }
    
    // Generate color scale
    generateColorScale(results.min, results.max);
}

/**
 * Render isolines (contour lines)
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
    
    // Draw background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size
    const cellWidth = canvas.width / results.dimensions.xPoints;
    const cellHeight = canvas.height / results.dimensions.yPoints;
    
    // Determine contour levels (create 10 evenly spaced levels)
    const levels = 10;
    const interval = (results.max - results.min) / levels;
    const contourLevels = [];
    
    for (let i = 0; i <= levels; i++) {
        contourLevels.push(results.min + i * interval);
    }
    
    // Draw contour lines
    for (const level of contourLevels) {
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        let firstPoint = true;
        
        // This is a simplified approach to contour generation
        for (let y = 0; y < results.dimensions.yPoints - 1; y++) {
            for (let x = 0; x < results.dimensions.xPoints - 1; x++) {
                // Get the four corners of this grid cell
                const z1 = results.grid[y][x];
                const z2 = results.grid[y][x + 1];
                const z3 = results.grid[y + 1][x + 1];
                const z4 = results.grid[y + 1][x];
                
                // Check if contour passes through this cell
                if ((z1 <= level && level <= z2) || (z2 <= level && level <= z1) || 
                    (z2 <= level && level <= z3) || (z3 <= level && level <= z2) || 
                    (z3 <= level && level <= z4) || (z4 <= level && level <= z3) || 
                    (z4 <= level && level <= z1) || (z1 <= level && level <= z4)) {
                    
                    // Calculate cell center
                    const centerX = (x + 0.5) * cellWidth;
                    const centerY = (y + 0.5) * cellHeight;
                    
                    if (firstPoint) {
                        ctx.moveTo(centerX, centerY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(centerX, centerY);
                    }
                }
            }
        }
        
        ctx.stroke();
        
        // Add labels for contour levels
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        const y = canvas.height - (canvas.height * (level - results.min) / (results.max - results.min));
        ctx.fillText(`${Math.round(level)} lx`, canvas.width - 10, y);
    }
    
    // Draw room boundary
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

/**
 * Render 3D view of illuminance distribution
 * @param {Object} results - Calculation results
 */
function render3DView(results) {
    const container = document.getElementById('3d-container');
    container.innerHTML = '';
    
    // Create message about 3D visualization
    const message = document.createElement('div');
    message.style.textAlign = 'center';
    message.style.padding = '10px';
    
    message.innerHTML = '<p>3D Illuminance Visualization</p>';
    container.appendChild(message);
    
    // Create a canvas for the 3D view
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 400;
    canvas.style.backgroundColor = '#f0f0f0';
    canvas.style.borderRadius = '4px';
    
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw 3D visualization
    const gridWidth = results.dimensions.xPoints;
    const gridHeight = results.dimensions.yPoints;
    
    // Set up isometric projection parameters
    const tileWidth = canvas.width / (gridWidth + gridHeight) * 0.7;
    const tileHeight = tileWidth * 0.5;
    const maxBarHeight = canvas.height * 0.5;
    
    // Center the visualization
    const offsetX = canvas.width * 0.5;
    const offsetY = canvas.height * 0.25;
    
    // Get min and max values for color scaling
    const min = results.min;
    const max = results.max;
    
    // Draw from back to front (reversed order)
    for (let y = gridHeight - 1; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            const value = results.grid[y][x];
            
            // Scale illuminance value to bar height
            const barHeight = (value / max) * maxBarHeight;
            
            // Calculate isometric position
            const isoX = offsetX + (x - y) * tileWidth;
            const isoY = offsetY + (x + y) * tileHeight;
            
            // Draw vertical bar
            
            // Top of bar (rhombus)
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - barHeight);
            ctx.lineTo(isoX + tileWidth, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX, isoY - barHeight + tileHeight * 2);
            ctx.lineTo(isoX - tileWidth, isoY - barHeight + tileHeight);
            ctx.closePath();
            
            // Fill with color based on illuminance
            ctx.fillStyle = getIlluminanceColor(value, min, max);
            ctx.fill();
            
            // Draw sides of bar
            
            // Left side
            ctx.beginPath();
            ctx.moveTo(isoX - tileWidth, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX - tileWidth, isoY + tileHeight);
            ctx.lineTo(isoX, isoY + tileHeight * 2);
            ctx.lineTo(isoX, isoY - barHeight + tileHeight * 2);
            ctx.closePath();
            ctx.fillStyle = shadeColor(getIlluminanceColor(value, min, max), -30);
            ctx.fill();
            
            // Right side
            ctx.beginPath();
            ctx.moveTo(isoX + tileWidth, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX + tileWidth, isoY + tileHeight);
            ctx.lineTo(isoX, isoY + tileHeight * 2);
            ctx.lineTo(isoX, isoY - barHeight + tileHeight * 2);
            ctx.closePath();
            ctx.fillStyle = shadeColor(getIlluminanceColor(value, min, max), -15);
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            // Add label for high values
            if (value > max * 0.8 && tileWidth > 25) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${value} lx`, isoX, isoY - barHeight + tileHeight);
            }
        }
    }
    
    // Draw legend
    drawLegend(ctx, canvas.width, canvas.height, min, max);
    
    // Add to container
    container.appendChild(canvas);
}

/**
 * Render data grid showing illuminance values
 * @param {Object} results - Calculation results
 */
function renderDataGrid(results) {
    const container = document.querySelector('.data-grid-container');
    const table = document.getElementById('results-table');
    
    // Clear existing table
    table.innerHTML = '';
    
    // Create header row with coordinates
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty corner cell
    
    // Column headers (X coordinates)
    for (let x = 0; x < results.dimensions.xPoints; x++) {
        const th = document.createElement('th');
        const xCoord = (x * results.dimensions.gridSpacingM).toFixed(1);
        th.textContent = `${xCoord}m`;
        headerRow.appendChild(th);
    }
    
    table.appendChild(headerRow);
    
    // Create data rows
    for (let y = 0; y < results.dimensions.yPoints; y++) {
        const row = document.createElement('tr');
        
        // Row header (Y coordinate)
        const yHeader = document.createElement('th');
        const yCoord = (y * results.dimensions.gridSpacingM).toFixed(1);
        yHeader.textContent = `${yCoord}m`;
        row.appendChild(yHeader);
        
        // Illuminance values
        for (let x = 0; x < results.dimensions.xPoints; x++) {
            const cell = document.createElement('td');
            const value = results.grid[y][x];
            
            // Set cell text
            cell.textContent = `${value} lx`;
            
            // Add color based on value (heatmap-like)
            const normalizedValue = (value - results.min) / (results.max - results.min);
            const bgColor = getIlluminanceColor(value, results.min, results.max);
            cell.style.backgroundColor = bgColor;
            
            // Set text color based on background brightness
            if (normalizedValue > 0.6) {
                cell.style.color = '#fff';
            }
            
            row.appendChild(cell);
        }
        
        table.appendChild(row);
    }
    
    // Add CSS styles for the table
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.textAlign = 'center';
    
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
        cell.style.padding = '4px';
        cell.style.border = '1px solid #ddd';
    });
}

/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showToast(message, type) {
    const toastContainer = document.getElementById('toasts');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Set timeout to remove toast
    setTimeout(() => {
        toast.classList.add('hiding');
        
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
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
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    
    // Use a gradient from blue (low) to green (medium) to red (high)
    let r, g, b;
    
    if (normalized < 0.5) {
        // Blue to green (0 - 0.5)
        const t = normalized * 2;
        r = Math.round(0 * (1 - t) + 0 * t);
        g = Math.round(0 * (1 - t) + 255 * t);
        b = Math.round(255 * (1 - t) + 0 * t);
    } else {
        // Green to red (0.5 - 1.0)
        const t = (normalized - 0.5) * 2;
        r = Math.round(0 * (1 - t) + 255 * t);
        g = Math.round(255 * (1 - t) + 0 * t);
        b = Math.round(0 * (1 - t) + 0 * t);
    }
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Helper function to shade a color
 * @param {string} color - RGB color string
 * @param {number} percent - Percent to lighten (positive) or darken (negative)
 * @returns {string} - New color
 */
function shadeColor(color, percent) {
    // Extract RGB components
    const rgb = color.match(/\d+/g).map(Number);
    
    // Apply shading
    const r = Math.max(0, Math.min(255, rgb[0] + (percent / 100) * rgb[0]));
    const g = Math.max(0, Math.min(255, rgb[1] + (percent / 100) * rgb[1]));
    const b = Math.max(0, Math.min(255, rgb[2] + (percent / 100) * rgb[2]));
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Draw a legend for the 3D visualization
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
function drawLegend(ctx, width, height, min, max) {
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = height - legendHeight - 20;
    
    // Draw color scale
    const segments = 50;
    const segmentWidth = legendWidth / segments;
    
    for (let i = 0; i < segments; i++) {
        const value = min + (i / (segments - 1)) * (max - min);
        const x = legendX + i * segmentWidth;
        
        ctx.fillStyle = getIlluminanceColor(value, min, max);
        ctx.fillRect(x, legendY, segmentWidth, legendHeight);
    }
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Draw min and max labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    ctx.fillText(`${Math.round(min)} lx`, legendX, legendY + legendHeight + 5);
    ctx.fillText(`${Math.round(max)} lx`, legendX + legendWidth, legendY + legendHeight + 5);
}

/**
 * Generate color scale for illuminance map
 * @param {number} min - Minimum illuminance value
 * @param {number} max - Maximum illuminance value
 */
function generateColorScale(min, max) {
    const scaleContainer = document.querySelector('.color-scale');
    scaleContainer.innerHTML = '';
    
    // Create segments in the scale
    const segments = 10;
    const range = max - min;
    
    for (let i = 0; i < segments; i++) {
        const value = min + (i / (segments - 1)) * range;
        const color = getIlluminanceColor(value, min, max);
        
        const segment = document.createElement('div');
        segment.style.flex = 1;
        segment.style.backgroundColor = color;
        segment.style.height = '20px';
        
        scaleContainer.appendChild(segment);
    }
    
    // Add min and max labels
    const minLabel = document.createElement('div');
    minLabel.className = 'scale-label min';
    minLabel.textContent = Math.round(min) + ' lx';
    
    const maxLabel = document.createElement('div');
    maxLabel.className = 'scale-label max';
    maxLabel.textContent = Math.round(max) + ' lx';
    
    // Clear previous labels
    const oldLabels = document.querySelectorAll('.scale-label');
    oldLabels.forEach(label => label.remove());
    
    // Add new labels
    scaleContainer.parentNode.insertBefore(minLabel, scaleContainer);
    scaleContainer.parentNode.appendChild(maxLabel);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);