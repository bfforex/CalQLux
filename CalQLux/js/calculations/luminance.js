/**
 * CalQLux - Luminance Calculations Module
 * Implements methods to calculate luminance values
 */

/**
 * Calculate luminance from illuminance and surface reflectance
 * @param {number} illuminance - Illuminance in lux
 * @param {number} reflectance - Surface reflectance (0-1)
 * @returns {number} - Luminance in cd/m²
 */
export function calculateLuminanceFromIlluminance(illuminance, reflectance) {
    // L = E * ρ / π
    // where L is luminance in cd/m²
    // E is illuminance in lux
    // ρ is reflectance (0-1)
    // π is pi (3.14159...)
    
    return (illuminance * reflectance) / Math.PI;
}

/**
 * Calculate luminance grid from illuminance grid and surface reflectance
 * @param {Array} illuminanceGrid - 2D array of illuminance values in lux
 * @param {number} reflectance - Surface reflectance (0-1)
 * @returns {Array} - 2D array of luminance values in cd/m²
 */
export function calculateLuminanceGrid(illuminanceGrid, reflectance) {
    const luminanceGrid = [];
    
    for (let y = 0; y < illuminanceGrid.length; y++) {
        const row = [];
        
        for (let x = 0; x < illuminanceGrid[y].length; x++) {
            const illuminance = illuminanceGrid[y][x];
            const luminance = calculateLuminanceFromIlluminance(illuminance, reflectance);
            row.push(luminance);
        }
        
        luminanceGrid.push(row);
    }
    
    return luminanceGrid;
}

/**
 * Calculate average, minimum, and maximum luminance values
 * @param {Array} luminanceGrid - 2D array of luminance values
 * @returns {Object} - Min, max, and average luminance values
 */
export function calculateLuminanceStatistics(luminanceGrid) {
    let min = Number.MAX_VALUE;
    let max = 0;
    let total = 0;
    let count = 0;
    
    for (let y = 0; y < luminanceGrid.length; y++) {
        for (let x = 0; x < luminanceGrid[y].length; x++) {
            const value = luminanceGrid[y][x];
            
            min = Math.min(min, value);
            max = Math.max(max, value);
            total += value;
            count++;
        }
    }
    
    const avg = total / count;
    
    return {
        min: min,
        max: max,
        avg: avg
    };
}

/**
 * Calculate luminance from a luminaire at a specific viewing angle
 * @param {Object} luminaire - Luminaire data
 * @param {Object} viewingAngle - Viewing angle in vertical and horizontal degrees
 * @returns {number} - Luminance in cd/m²
 */
export function calculateLuminaireLuminance(luminaire, viewingAngle) {
    // In a real implementation, this would use the luminaire's photometric data
    // For this example, we'll use a simplified model
    
    // Get luminous intensity at the viewing angle
    const intensity = getLuminaireIntensity(luminaire, viewingAngle);
    
    // Calculate projected area of luminaire visible from the viewing angle
    const projectedArea = calculateProjectedArea(luminaire, viewingAngle);
    
    // Calculate luminance: L = I / A
    // where L is luminance in cd/m²
    // I is intensity in candelas
    // A is projected area in m²
    
    const luminance = projectedArea > 0 ? intensity / projectedArea : 0;
    
    return luminance;
}

/**
 * Get luminous intensity of a luminaire at a specific viewing angle
 * @param {Object} luminaire - Luminaire data
 * @param {Object} viewingAngle - Viewing angle in vertical and horizontal degrees
 * @returns {number} - Luminous intensity in candelas
 */
function getLuminaireIntensity(luminaire, viewingAngle) {
    // In a real implementation, this would interpolate from the IES data
    // For this example, we'll use a simplified model based on cosine distribution
    
    // Convert angle to radians
    const verticalRad = viewingAngle.vertical * Math.PI / 180;
    
    // Simplified cosine distribution
    let intensityFactor;
    
    switch (luminaire.type?.toLowerCase()) {
        case 'downlight':
            // Narrow distribution
            intensityFactor = Math.pow(Math.cos(verticalRad), 4);
            break;
            
        case 'panel':
            // Wide, diffuse distribution
            intensityFactor = Math.pow(Math.cos(verticalRad), 1.2);
            break;
            
        case 'highbay':
            // Medium distribution
            intensityFactor = Math.pow(Math.cos(verticalRad), 2);
            break;
            
        default:
            // Default distribution
            intensityFactor = Math.pow(Math.cos(verticalRad), 2.5);
    }
    
    // Adjust by beam angle if available
    if (luminaire.beamAngle) {
        // Narrow beam angles have more concentrated intensity
        const beamFactor = 60 / Math.max(10, luminaire.beamAngle);
        intensityFactor *= beamFactor;
    }
    
    // Calculate max intensity from luminous flux
    // This is a simplification - in reality, this would come from photometric data
    const maxIntensity = luminaire.luminousFlux / (2 * Math.PI * (1 - Math.cos(Math.PI / 4)));
    
    // Calculate intensity at the specified angle
    const intensity = maxIntensity * intensityFactor;
    
    return Math.max(0, intensity);
}

/**
 * Calculate the projected area of a luminaire from a specific viewing angle
 * @param {Object} luminaire - Luminaire data
 * @param {Object} viewingAngle - Viewing angle in vertical and horizontal degrees
 * @returns {number} - Projected area in m²
 */
function calculateProjectedArea(luminaire, viewingAngle) {
    // Convert angle to radians
    const verticalRad = viewingAngle.vertical * Math.PI / 180;
    
    let area;
    
    // Calculate luminaire area based on type
    if (luminaire.dimensions) {
        if (luminaire.dimensions.diameter) {
            // Circular luminaire
            const radius = luminaire.dimensions.diameter / 2;
            area = Math.PI * radius * radius;
        } else {
            // Rectangular luminaire
            area = luminaire.dimensions.length * luminaire.dimensions.width;
        }
    } else {
        // Default area if dimensions not provided
        area = 0.3 * 0.3; // 0.3m x 0.3m
    }
    
    // Calculate projected area: A * cos(θ)
    const projectedArea = area * Math.cos(verticalRad);
    
    return Math.max(0, projectedArea);
}

/**
 * Calculate Veiling Luminance Index (VLI)
 * @param {Object} luminaire - Luminaire data
 * @param {Object} observerPosition - Observer position
 * @param {Object} taskPosition - Task position
 * @returns {number} - Veiling Luminance Index
 */
export function calculateVeilingLuminanceIndex(luminaire, observerPosition, taskPosition) {
    // Calculate viewing angle to the luminaire
    const viewingAngle = calculateViewingAngle(luminaire, observerPosition);
    
    // Calculate luminance of the luminaire from the observer's position
    const luminaireLum = calculateLuminaireLuminance(luminaire, viewingAngle);
    
    // Calculate angle between line of sight and line to luminaire (in radians)
    const theta = calculateAngleBetweenVectors(
        { x: taskPosition.x - observerPosition.x, y: taskPosition.y - observerPosition.y, z: taskPosition.z - observerPosition.z },
        { x: luminaire.x - observerPosition.x, y: luminaire.y - observerPosition.y, z: luminaire.z - observerPosition.z }
    );
    
    // Calculate Veiling Luminance Index
    // VLI = L * cos(θ)² / θ²
    const vli = luminaireLum * Math.pow(Math.cos(theta), 2) / Math.pow(theta, 2);
    
    return vli;
}

/**
 * Calculate viewing angle to a luminaire from an observer position
 * @param {Object} luminaire - Luminaire position {x, y, z}
 * @param {Object} observer - Observer position {x, y, z}
 * @returns {Object} - Viewing angle in vertical and horizontal degrees
 */
function calculateViewingAngle(luminaire, observer) {
    // Calculate vector from observer to luminaire
    const dx = luminaire.x - observer.x;
    const dy = luminaire.y - observer.y;
    const dz = luminaire.z - observer.z;
    
    // Calculate horizontal angle (azimuth)
    const horizontalAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Calculate vertical angle (from horizontal)
    const horizontalDistance = Math.sqrt(dx*dx + dy*dy);
    const verticalAngle = Math.atan2(dz, horizontalDistance) * 180 / Math.PI;
    
    return {
        horizontal: horizontalAngle,
        vertical: verticalAngle
    };
}

/**
 * Calculate angle between two vectors in 3D space
 * @param {Object} vector1 - First vector {x, y, z}
 * @param {Object} vector2 - Second vector {x, y, z}
 * @returns {number} - Angle in radians
 */
function calculateAngleBetweenVectors(vector1, vector2) {
    // Calculate dot product
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
    
    // Calculate magnitudes
    const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y + vector1.z * vector1.z);
    const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y + vector2.z * vector2.z);
    
    // Calculate angle
    const cosTheta = dotProduct / (mag1 * mag2);
    
    // Clamp cosTheta to valid range (-1 to 1)
    const clampedCosTheta = Math.min(1, Math.max(-1, cosTheta));
    
    return Math.acos(clampedCosTheta);
}