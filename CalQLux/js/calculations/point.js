/**
 * CalQLux - Illumination Design Calculator
 * Point-by-Point Calculation Module
 */

/**
 * Calculate illuminance at a single point using the inverse square law
 * @param {Object} point - Point coordinates {x, y, z}
 * @param {Object} luminaire - Luminaire data
 * @param {Object} options - Calculation options
 * @returns {number} - Illuminance value in lux
 */
export function calculatePointIlluminance(point, luminaire, options) {
    // Distance from point to luminaire
    const dx = point.x - luminaire.x;
    const dy = point.y - luminaire.y;
    const dz = luminaire.z - point.z; // Luminaire is above point
    
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Cosine of the angle of incidence
    const cosTheta = dz / distance;
    
    // Base illuminance calculation (inverse square law)
    // E = I * cos(θ) / d²
    // Where I is the luminous intensity in the direction of the point
    
    // Get intensity from the luminaire's photometric data (IES)
    const intensity = getIntensityAtAngle(luminaire, dx, dy, dz);
    
    // Calculate illuminance
    const illuminance = intensity * cosTheta / (distance * distance);
    
    return illuminance;
}

/**
 * Get luminous intensity at a specific angle from IES data
 * @param {Object} luminaire - Luminaire data including IES distribution
 * @param {number} dx - X distance from luminaire to point
 * @param {number} dy - Y distance from luminaire to point
 * @param {number} dz - Z distance from luminaire to point
 * @returns {number} - Luminous intensity in candelas
 */
function getIntensityAtAngle(luminaire, dx, dy, dz) {
    // This would implement interpolation from the IES photometric data
    // For now, we'll use a simplified model
    
    // Calculate horizontal and vertical angles
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Vertical angle (from nadir)
    const verticalAngle = Math.acos(dz / distance) * (180 / Math.PI);
    
    // Horizontal angle
    const horizontalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // For demonstration, we'll use a simple cosine distribution
    // In a real implementation, this would look up values from the IES data
    const maxIntensity = luminaire.maxIntensity || 1000; // candelas
    const intensity = maxIntensity * Math.cos((verticalAngle * Math.PI) / 180);
    
    return Math.max(0, intensity);
}

/**
 * Calculate direct illuminance grid for a room
 * @param {Object} room - Room dimensions
 * @param {Array} luminaires - Array of luminaire objects
 * @param {Object} workPlane - Work plane height
 * @param {Object} grid - Grid spacing information
 * @returns {Array} - 2D array of illuminance values
 */
export function calculateDirectIlluminanceGrid(room, luminaires, workPlane, grid) {
    // Create the grid
    const xPoints = Math.floor(room.length / grid.spacing) + 1;
    const yPoints = Math.floor(room.width / grid.spacing) + 1;
    
    const illuminanceGrid = [];
    
    // Calculate illuminance at each grid point
    for (let y = 0; y < yPoints; y++) {
        const row = [];
        for (let x = 0; x < xPoints; x++) {
            // Point coordinates
            const point = {
                x: x * grid.spacing,
                y: y * grid.spacing,
                z: workPlane.height
            };
            
            // Sum illuminance from all luminaires
            let totalIlluminance = 0;
            
            for (const luminaire of luminaires) {
                const illuminance = calculatePointIlluminance(point, luminaire, {});
                totalIlluminance += illuminance;
            }
            
            row.push(totalIlluminance);
        }
        illuminanceGrid.push(row);
    }
    
    return illuminanceGrid;
}

/**
 * Calculate indirect illuminance using radiosity method
 * @param {Object} room - Room dimensions and reflectances
 * @param {Array} directIlluminance - Direct illuminance grid
 * @returns {Array} - 2D array of indirect illuminance values
 */
export function calculateIndirectIlluminance(room, directIlluminance) {
    // This would implement a radiosity calculation for interreflections
    // For simplicity, we'll estimate indirect as a percentage of direct
    
    const indirectFactor = estimateIndirectFactor(room.reflectances);
    
    // Apply indirect factor to direct illuminance
    return directIlluminance.map(row => 
        row.map(value => value * indirectFactor)
    );
}

/**
 * Estimate indirect factor based on room reflectances
 * @param {Object} reflectances - Room surface reflectances
 * @returns {number} - Indirect factor
 */
function estimateIndirectFactor(reflectances) {
    // Simple estimation based on average reflectance
    const avgReflectance = (reflectances.ceiling + reflectances.walls + reflectances.floor) / 3;
    
    // The higher the reflectance, the more indirect light
    // This is a simplification - real calculation would use room geometry and form factors
    return avgReflectance * 0.5; // Scale factor for demonstration
}