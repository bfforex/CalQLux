/**
 * CalQLux - Charts Module
 * Functions for creating data visualizations for lighting results
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
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size
    const cellWidth = canvas.width / (illuminanceGrid[0].length - 1);
    const cellHeight = canvas.height / (illuminanceGrid.length - 1);
    
    // Determine contour levels
    const levels = options.levels || 10;
    const interval = (max - min) / levels;
    const contourLevels = [];
    
    for (let i = 0; i <= levels; i++) {
        contourLevels.push(min + i * interval);
    }
    
    // Draw contour lines
    for (const level of contourLevels) {
        ctx.beginPath();
        ctx.strokeStyle = options.lineColor || '#333';
        ctx.lineWidth = options.lineWidth || 1;
        
        let firstPoint = true;
        
        // This is a simplified approach - real contour generation would use marching squares algorithm
        for (let y = 0; y < illuminanceGrid.length - 1; y++) {
            for (let x = 0; x < illuminanceGrid[y].length - 1; x++) {
                // Get the four corners of this grid cell
                const z1 = illuminanceGrid[y][x];
                const z2 = illuminanceGrid[y][x + 1];
                const z3 = illuminanceGrid[y + 1][x + 1];
                const z4 = illuminanceGrid[y + 1][x];
                
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
        if (options.showLabels) {
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // This is a simplification - proper labeling would place labels along the contours
            const x = canvas.width - 50;
            const y = canvas.height - (canvas.height * (level - min) / (max - min));
            
            ctx.fillText(`${Math.round(level)} lx`, x, y);
        }
    }
}

/**
 * Render illuminance histogram
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Rendering options
 */
export function renderIlluminanceHistogram(illuminanceGrid, canvas, options = {}) {
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
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Determine bin count
    const binCount = options.binCount || 20;
    const binSize = (max - min) / binCount;
    
    // Create bins
    const bins = new Array(binCount).fill(0);
    
    // Count values in each bin
    for (let y = 0; y < illuminanceGrid.length; y++) {
        for (let x = 0; x < illuminanceGrid[y].length; x++) {
            const value = illuminanceGrid[y][x];
            const binIndex = Math.min(binCount - 1, Math.floor((value - min) / binSize));
            bins[binIndex]++;
        }
    }
    
    // Find maximum bin count for scaling
    const maxBinCount = Math.max(...bins);
    
    // Set margins
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, canvas.height - margin.bottom);
    ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
    ctx.stroke();
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvas.height - margin.bottom);
    ctx.stroke();
    
    // Draw bins
    const barWidth = chartWidth / binCount;
    
    for (let i = 0; i < binCount; i++) {
        const barHeight = (bins[i] / maxBinCount) * chartHeight;
        const x = margin.left + i * barWidth;
        const y = canvas.height - margin.bottom - barHeight;
        
        ctx.fillStyle = getHeatmapColor(min + (i + 0.5) * binSize, min, max);
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        
        ctx.strokeStyle = '#333';
        ctx.strokeRect(x, y, barWidth - 1, barHeight);
    }
    
    // Draw x-axis labels
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i <= binCount; i += Math.ceil(binCount / 10)) {
        const value = min + i * binSize;
        const x = margin.left + i * barWidth;
        
        ctx.fillText(Math.round(value), x, canvas.height - margin.bottom + 5);
    }
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 10; i++) {
        const value = (i / 10) * maxBinCount;
        const y = canvas.height - margin.bottom - (i / 10) * chartHeight;
        
        ctx.fillText(Math.round(value), margin.left - 5, y);
    }
    
    // Draw axes labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    
    // X-axis label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Illuminance (lx)', margin.left + chartWidth / 2, canvas.height - 5);
    
    // Y-axis label
    ctx.save();
    ctx.translate(10, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Frequency', 0, 0);
    ctx.restore();
    
    // Draw title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Illuminance Distribution', margin.left + chartWidth / 2, 5);
}

/**
 * Create a color scale legend
 * @param {HTMLElement} container - Container element
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Object} options - Rendering options
 */
export function createColorScale(container, min, max, options = {}) {
    // Clear container
    container.innerHTML = '';
    
    // Create scale element
    const scale = document.createElement('div');
    scale.className = 'color-scale';
    scale.style.height = options.height || '30px';
    scale.style.width = options.width || '100%';
    scale.style.display = 'flex';
    scale.style.borderRadius = '4px';
    scale.style.overflow = 'hidden';
    
    // Add color segments
    const segments = options.segments || 20;
    
    for (let i = 0; i < segments; i++) {
        const value = min + (i / (segments - 1)) * (max - min);
        const color = getHeatmapColor(value, min, max);
        
        const segment = document.createElement('div');
        segment.style.flex = '1';
        segment.style.backgroundColor = color;
        
        scale.appendChild(segment);
    }
    
    // Add scale to container
    container.appendChild(scale);
    
    // Add labels
    if (options.showLabels !== false) {
        const labelsContainer = document.createElement('div');
        labelsContainer.style.display = 'flex';
        labelsContainer.style.justifyContent = 'space-between';
        labelsContainer.style.marginTop = '5px';
        
        const minLabel = document.createElement('div');
        minLabel.textContent = `${Math.round(min)} lx`;
        labelsContainer.appendChild(minLabel);
        
        const maxLabel = document.createElement('div');
        maxLabel.textContent = `${Math.round(max)} lx`;
        labelsContainer.appendChild(maxLabel);
        
        container.appendChild(labelsContainer);
    }
}