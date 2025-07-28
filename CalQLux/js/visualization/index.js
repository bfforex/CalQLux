/**
 * CalQLux - Illumination Design Calculator
 * Visualization Modules Entry Point
 */

/**
 * Initialize charts module
 * @param {Object} appState - Application state
 */
export function initCharts(appState) {
    console.log('Initializing charts module');
    // Any initialization logic for charts
}

/**
 * Initialize diagrams module
 * @param {Object} appState - Application state
 */
export function initDiagrams(appState) {
    console.log('Initializing diagrams module');
    // Any initialization logic for diagrams
}

/**
 * Render illuminance heatmap
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Rendering options
 */
export function renderIlluminanceHeatmap(illuminanceGrid, canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    
    // Get min and max values
    let min = options.min;
    let max = options.max;
    
    if (min === undefined || max === undefined) {
        min = Number.MAX_VALUE;
        max = Number.MIN_VALUE;
        
        for (let y = 0; y < illuminanceGrid.length; y++) {
            for (let x = 0; x < illuminanceGrid[y].length; x++) {
                min = Math.min(min, illuminanceGrid[y][x]);
                max = Math.max(max, illuminanceGrid[y][x]);
            }
        }
    }
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Calculate cell size
    const cellWidth = canvas.width / illuminanceGrid[0].length;
    const cellHeight = canvas.height / illuminanceGrid.length;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw heatmap
    for (let y = 0; y < illuminanceGrid.length; y++) {
        for (let x = 0; x < illuminanceGrid[y].length; x++) {
            const value = illuminanceGrid[y][x];
            const color = getHeatmapColor(value, min, max);
            
            ctx.fillStyle = color;
            ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }
    
    // Optionally draw grid lines
    if (options.showGrid) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        
        for (let y = 0; y <= illuminanceGrid.length; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellHeight);
            ctx.lineTo(canvas.width, y * cellHeight);
            ctx.stroke();
        }
        
        for (let x = 0; x <= illuminanceGrid[0].length; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellWidth, 0);
            ctx.lineTo(x * cellWidth, canvas.height);
            ctx.stroke();
        }
    }
    
    // Optionally show values
    if (options.showValues) {
        ctx.fillStyle = 'white';
        ctx.font = `${Math.min(12, cellWidth / 3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let y = 0; y < illuminanceGrid.length; y++) {
            for (let x = 0; x < illuminanceGrid[y].length; x++) {
                const value = Math.round(illuminanceGrid[y][x]);
                const centerX = x * cellWidth + cellWidth / 2;
                const centerY = y * cellHeight + cellHeight / 2;
                
                // Add text shadow for better readability
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 2;
                ctx.fillText(value, centerX, centerY);
                ctx.shadowBlur = 0;
            }
        }
    }
    
    return { min, max };
}

/**
 * Get color for heatmap based on value
 * @param {number} value - Value to map to color
 * @param {number} min - Minimum value in range
 * @param {number} max - Maximum value in range
 * @returns {string} - Color in CSS format
 */
function getHeatmapColor(value, min, max) {
    // Normalize value to 0-1 range
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    
    // Color stops for heatmap
    const stops = [
        { position: 0.0, color: [13, 71, 161] },   // Dark blue
        { position: 0.25, color: [0, 151, 230] },  // Light blue
        { position: 0.5, color: [46, 204, 113] },  // Green
        { position: 0.75, color: [241, 196, 15] }, // Yellow
        { position: 1.0, color: [235, 59, 59] }    // Red
    ];
    
    // Find the two color stops that our value falls between
    let startStop, endStop;
    
    for (let i = 0; i < stops.length - 1; i++) {
        if (normalized >= stops[i].position && normalized <= stops[i + 1].position) {
            startStop = stops[i];
            endStop = stops[i + 1];
            break;
        }
    }
    
    // If value is outside our stops, use the extremes
    if (!startStop || !endStop) {
        if (normalized <= 0) {
            return `rgb(${stops[0].color[0]}, ${stops[0].color[1]}, ${stops[0].color[2]})`;
        } else {
            const lastStop = stops[stops.length - 1];
            return `rgb(${lastStop.color[0]}, ${lastStop.color[1]}, ${lastStop.color[2]})`;
        }
    }
    
    // Calculate interpolation factor between the two stops
    const range = endStop.position - startStop.position;
    const factor = range > 0 ? (normalized - startStop.position) / range : 0;
    
    // Interpolate RGB values
    const r = Math.round(startStop.color[0] + factor * (endStop.color[0] - startStop.color[0]));
    const g = Math.round(startStop.color[1] + factor * (endStop.color[1] - startStop.color[1]));
    const b = Math.round(startStop.color[2] + factor * (endStop.color[2] - startStop.color[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Render isolines (contour lines)
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Rendering options
 */
export function renderIsolines(illuminanceGrid, canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    
    // Implementation for rendering isolines
    console.log("Rendering isolines visualization");
}

/**
 * Render 3D illuminance visualization
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {HTMLElement} container - Container element
 * @param {Object} roomConfig - Room configuration
 * @param {Object} options - Rendering options
 */
export function render3DIlluminanceVisualization(illuminanceGrid, container, roomConfig, options = {}) {
    // Implementation for 3D visualization
    console.log("Rendering 3D illuminance visualization");
}