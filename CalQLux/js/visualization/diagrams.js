/**
 * CalQLux - Diagrams Module
 * Functions for creating diagrams and 3D visualizations
 */

/**
 * Initialize diagrams module
 * @param {Object} appState - Application state
 */
export function initDiagrams(appState) {
    console.log('Initializing diagrams module');
    // Any initialization logic for diagrams
}

/**
 * Render 3D illuminance visualization
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {HTMLElement} container - Container element
 * @param {Object} roomConfig - Room configuration
 * @param {Object} options - Rendering options
 */
export function render3DIlluminanceVisualization(illuminanceGrid, container, roomConfig, options = {}) {
    // This is a placeholder for a 3D visualization
    // In a real implementation, this would use a 3D library like Three.js
    
    container.innerHTML = '';
    
    // Create message about 3D visualization
    const message = document.createElement('div');
    message.style.textAlign = 'center';
    message.style.padding = '20px';
    
    message.innerHTML = `
        <h3>3D Illuminance Visualization</h3>
        <p>This would render a 3D visualization of the illuminance distribution.</p>
        <p>For a complete implementation, you would integrate a 3D library like Three.js.</p>
    `;
    
    container.appendChild(message);
    
    // Create a placeholder 3D view
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 300;
    canvas.style.backgroundColor = '#f0f0f0';
    canvas.style.borderRadius = '4px';
    canvas.style.marginTop = '10px';
    
    const ctx = canvas.getContext('2d');
    
    // Draw a simple 3D-like representation
    drawSimple3DVisualization(ctx, canvas.width, canvas.height, illuminanceGrid, roomConfig);
    
    container.appendChild(canvas);
}

/**
 * Draw a simple 3D-like representation of illuminance data
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {Object} roomConfig - Room configuration
 */
function drawSimple3DVisualization(ctx, width, height, illuminanceGrid, roomConfig) {
    const gridWidth = illuminanceGrid[0].length;
    const gridHeight = illuminanceGrid.length;
    
    // Find min and max illuminance values
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            min = Math.min(min, illuminanceGrid[y][x]);
            max = Math.max(max, illuminanceGrid[y][x]);
        }
    }
    
    // Set up isometric projection
    const tileWidth = width / (gridWidth + gridHeight) * 0.8;
    const tileHeight = height / (gridWidth + gridHeight) * 1.6;
    const maxBarHeight = height * 0.4;
    
    // Center the visualization
    const offsetX = width * 0.5;
    const offsetY = height * 0.3;
    
    // Draw "floor" grid with illuminance-colored tiles
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // Get illuminance value and calculate height
            const value = illuminanceGrid[y][x];
            const normalizedValue = (value - min) / (max - min);
            const barHeight = normalizedValue * maxBarHeight;
            
            // Calculate isometric coordinates
            const isoX = (x - y) * tileWidth + offsetX;
            const isoY = (x + y) * tileHeight / 2 + offsetY;
            
            // Draw vertical bar
            ctx.fillStyle = getHeatmapColor(value, min, max);
            
            // Draw top of bar (rhombus)
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - barHeight);
            ctx.lineTo(isoX + tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.lineTo(isoX, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX - tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.closePath();
            ctx.fill();
            
            // Draw front side of bar
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX + tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.lineTo(isoX + tileWidth, isoY + tileHeight / 2);
            ctx.lineTo(isoX, isoY + tileHeight);
            ctx.closePath();
            ctx.fillStyle = shadeColor(getHeatmapColor(value, min, max), -20);
            ctx.fill();
            
            // Draw right side of bar
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX - tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.lineTo(isoX - tileWidth, isoY + tileHeight / 2);
            ctx.lineTo(isoX, isoY + tileHeight);
            ctx.closePath();
            ctx.fillStyle = shadeColor(getHeatmapColor(value, min, max), -40);
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 0.5;
            
            // Top
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - barHeight);
            ctx.lineTo(isoX + tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.lineTo(isoX, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX - tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.closePath();
            ctx.stroke();
            
            // Sides
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - barHeight + tileHeight);
            ctx.lineTo(isoX, isoY + tileHeight);
            ctx.moveTo(isoX + tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.lineTo(isoX + tileWidth, isoY + tileHeight / 2);
            ctx.moveTo(isoX - tileWidth, isoY - barHeight + tileHeight / 2);
            ctx.lineTo(isoX - tileWidth, isoY + tileHeight / 2);
            ctx.stroke();
        }
    }
    
    // Draw legend
    drawLegend(ctx, width, height, min, max);
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
        
        ctx.fillStyle = getHeatmapColor(value, min, max);
        ctx.fillRect(x, legendY, segmentWidth, legendHeight);
        
        // Draw outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, legendY, segmentWidth, legendHeight);
    }
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Min label
    ctx.fillText(`${Math.round(min)} lx`, legendX, legendY + legendHeight + 15);
    
    // Max label
    ctx.fillText(`${Math.round(max)} lx`, legendX + legendWidth, legendY + legendHeight + 15);
    
    // Title
    ctx.fillText('Illuminance (lux)', legendX + legendWidth / 2, legendY - 10);
}

/**
 * Render room layout with luminaires
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} roomConfig - Room configuration
 * @param {Array} luminaires - Array of luminaires
 * @param {Object} options - Rendering options
 */
export function renderRoomLayout(canvas, roomConfig, luminaires, options = {}) {
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Calculate scale to fit room in canvas
    const padding = 30;
    const scale = Math.min(
        (canvas.width - padding * 2) / roomConfig.length,
        (canvas.height - padding * 2) / roomConfig.width
    );
    
    // Calculate offset to center room in canvas
    const offsetX = (canvas.width - roomConfig.length * scale) / 2;
    const offsetY = (canvas.height - roomConfig.width * scale) / 2;
    
    // Draw room outline
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(offsetX, offsetY, roomConfig.length * scale, roomConfig.width * scale);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, roomConfig.length * scale, roomConfig.width * scale);
    
    // Draw grid
    if (options.showGrid) {
        const gridSpacing = options.gridSpacing || 1; // meters
        
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let x = gridSpacing; x < roomConfig.length; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(offsetX + x * scale, offsetY);
            ctx.lineTo(offsetX + x * scale, offsetY + roomConfig.width * scale);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = gridSpacing; y < roomConfig.width; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + y * scale);
            ctx.lineTo(offsetX + roomConfig.length * scale, offsetY + y * scale);
            ctx.stroke();
        }
    }
    
    // Draw luminaires
    luminaires.forEach((luminaire) => {
        drawLuminaire(ctx, luminaire, offsetX, offsetY, scale);
    });
    
    // Draw coordinate system
    if (options.showCoordinates) {
        drawCoordinateSystem(ctx, offsetX, offsetY, scale, roomConfig.length, roomConfig.width);
    }
    
    // Draw legend
    if (options.showLegend) {
        drawLuminaireLegend(ctx, canvas.width, canvas.height, luminaires);
    }
}

/**
 * Draw a luminaire on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} luminaire - Luminaire data
 * @param {number} offsetX - X offset
 * @param {number} offsetY - Y offset
 * @param {number} scale - Scale factor
 */
function drawLuminaire(ctx, luminaire, offsetX, offsetY, scale) {
    // Calculate position
    const x = offsetX + luminaire.x * scale;
    const y = offsetY + luminaire.y * scale;
    
    // Determine luminaire size based on type
    let size = 15;
    let shape = 'circle';
    
    switch (luminaire.type?.toLowerCase()) {
        case 'downlight':
            size = 10;
            shape = 'circle';
            break;
        
        case 'highbay':
            size = 20;
            shape = 'circle';
            break;
            
        case 'floodlight':
            size = 15;
            shape = 'triangle';
            break;
            
        case 'track':
            size = 8;
            shape = 'circle';
            break;
            
        case 'panel':
        case 'pendant':
            size = 20;
            shape = 'rectangle';
            break;
            
        default:
            size = 15;
            shape = 'circle';
    }
    
    // Draw luminaire
    ctx.fillStyle = '#ffcc00';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (shape === 'rectangle') {
        ctx.fillRect(x - size / 2, y - size / 2, size, size / 1.5);
        ctx.strokeRect(x - size / 2, y - size / 2, size, size / 1.5);
    } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    // Draw label if specified
    if (luminaire.label) {
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(luminaire.label, x, y + size / 2 + 10);
    }
}

/**
 * Draw coordinate system on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} offsetX - X offset
 * @param {number} offsetY - Y offset
 * @param {number} scale - Scale factor
 * @param {number} roomLength - Room length
 * @param {number} roomWidth - Room width
 */
function drawCoordinateSystem(ctx, offsetX, offsetY, scale, roomLength, roomWidth) {
    // Draw coordinate axes
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    
    // Draw x-axis (along room length)
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + roomWidth * scale + 15);
    ctx.lineTo(offsetX + roomLength * scale, offsetY + roomWidth * scale + 15);
    ctx.stroke();
    
    // Draw y-axis (along room width)
    ctx.beginPath();
    ctx.moveTo(offsetX - 15, offsetY);
    ctx.lineTo(offsetX - 15, offsetY + roomWidth * scale);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels
    for (let x = 0; x <= roomLength; x += Math.ceil(roomLength / 10)) {
        const xPos = offsetX + x * scale;
        const yPos = offsetY + roomWidth * scale + 15;
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(xPos, yPos - 3);
        ctx.lineTo(xPos, yPos + 3);
        ctx.stroke();
        
        // Draw label
        ctx.fillText(`${x}m`, xPos, yPos + 12);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    
    for (let y = 0; y <= roomWidth; y += Math.ceil(roomWidth / 10)) {
        const xPos = offsetX - 15;
        const yPos = offsetY + y * scale;
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(xPos - 3, yPos);
        ctx.lineTo(xPos + 3, yPos);
        ctx.stroke();
        
        // Draw label
        ctx.fillText(`${y}m`, xPos - 5, yPos);
    }
    
    // Draw axis titles
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Length (m)', offsetX + roomLength * scale / 2, offsetY + roomWidth * scale + 35);
    
    ctx.save();
    ctx.translate(offsetX - 35, offsetY + roomWidth * scale / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Width (m)', 0, 0);
    ctx.restore();
}

/**
 * Draw luminaire legend on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {Array} luminaires - Array of luminaires
 */
function drawLuminaireLegend(ctx, canvasWidth, canvasHeight, luminaires) {
    // Count luminaire types
    const typeCounts = {};
    
    luminaires.forEach(luminaire => {
        const type = luminaire.name || luminaire.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Calculate legend position
    const legendX = 15;
    const legendY = 15;
    const lineHeight = 20;
    
    // Draw legend background
    const types = Object.keys(typeCounts);
    const legendWidth = 200;
    const legendHeight = types.length * lineHeight + 30;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Draw legend title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Luminaires:', legendX + 10, legendY + 15);
    
    // Draw legend items
    ctx.font = '11px Arial';
    
    types.forEach((type, index) => {
        const y = legendY + 30 + index * lineHeight;
        
        // Draw symbol
        ctx.fillStyle = '#ffcc00';
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.arc(legendX + 15, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.fillText(`${type}: ${typeCounts[type]}`, legendX + 30, y + 3);
    });
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
 * Adjust color brightness
 * @param {string} color - Color in CSS format
 * @param {number} percent - Percent to adjust brightness (-100 to 100)
 * @returns {string} - Adjusted color
 */
function shadeColor(color, percent) {
    let R, G, B;
    
    if (color.startsWith('rgb')) {
        // Parse RGB format
        const rgbValues = color.match(/\d+/g);
        if (rgbValues && rgbValues.length >= 3) {
            R = parseInt(rgbValues[0]);
            G = parseInt(rgbValues[1]);
            B = parseInt(rgbValues[2]);
        }
    } else {
        // Default to black if color format not recognized
        R = G = B = 0;
    }
    
    // Adjust RGB values
    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));
    
    return `rgb(${Math.round(R)}, ${Math.round(G)}, ${Math.round(B)})`;
}

/**
 * Create a custom legend for luminaire types
 * @param {HTMLElement} container - Container element
 * @param {Array} luminaires - Array of luminaires
 */
export function createLuminaireLegend(container, luminaires) {
    // Clear container
    container.innerHTML = '';
    
    // Count luminaire types
    const typeCounts = {};
    
    luminaires.forEach(luminaire => {
        const type = luminaire.name || luminaire.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Create legend title
    const title = document.createElement('h3');
    title.textContent = 'Luminaires';
    title.style.marginBottom = '10px';
    container.appendChild(title);
    
    // Create legend list
    const list = document.createElement('ul');
    list.style.listStyleType = 'none';
    list.style.padding = '0';
    list.style.margin = '0';
    
    Object.keys(typeCounts).forEach(type => {
        const item = document.createElement('li');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.marginBottom = '8px';
        
        const symbol = document.createElement('span');
        symbol.style.display = 'inline-block';
        symbol.style.width = '12px';
        symbol.style.height = '12px';
        symbol.style.backgroundColor = '#ffcc00';
        symbol.style.border = '1px solid #333';
        symbol.style.marginRight = '8px';
        
        const text = document.createElement('span');
        text.textContent = `${type}: ${typeCounts[type]}`;
        
        item.appendChild(symbol);
        item.appendChild(text);
        list.appendChild(item);
    });
    
    container.appendChild(list);
}