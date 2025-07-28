/**
 * CalQLux - Uniformity Calculations Module
 * Implements methods to calculate illuminance uniformity
 */

/**
 * Calculate illuminance uniformity ratios
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @returns {Object} - Uniformity ratios
 */
export function calculateUniformity(illuminanceGrid) {
    // Initialize variables to track min, max, and total
    let min = Number.MAX_VALUE;
    let max = 0;
    let total = 0;
    let count = 0;
    
    // Iterate through grid to find min, max, and average
    for (let y = 0; y < illuminanceGrid.length; y++) {
        for (let x = 0; x < illuminanceGrid[y].length; x++) {
            const value = illuminanceGrid[y][x];
            
            min = Math.min(min, value);
            max = Math.max(max, value);
            total += value;
            count++;
        }
    }
    
    // Calculate average illuminance
    const avg = total / count;
    
    // Calculate uniformity ratios
    const minToAvg = min / avg;
    const minToMax = min / max;
    
    return {
        min: min,
        max: max,
        avg: avg,
        minToAvg: minToAvg,
        minToMax: minToMax
    };
}

/**
 * Evaluate illuminance uniformity based on standards
 * @param {Object} uniformityData - Uniformity ratios
 * @param {string} spaceType - Type of space (e.g., 'office', 'industrial')
 * @returns {Object} - Evaluation results
 */
export function evaluateUniformity(uniformityData, spaceType) {
    // Define minimum uniformity requirements by space type
    const requirements = {
        office: { minToAvg: 0.6, minToMax: 0.3 },
        industrial: { minToAvg: 0.5, minToMax: 0.3 },
        retail: { minToAvg: 0.4, minToMax: 0.2 },
        educational: { minToAvg: 0.6, minToMax: 0.3 },
        healthcare: { minToAvg: 0.7, minToMax: 0.4 },
        outdoor: { minToAvg: 0.3, minToMax: 0.1 },
        default: { minToAvg: 0.5, minToMax: 0.3 }
    };
    
    // Get requirements for the specified space type or use default
    const req = requirements[spaceType] || requirements.default;
    
    // Evaluate uniformity
    const minToAvgStatus = uniformityData.minToAvg >= req.minToAvg ? 'good' : 'poor';
    const minToMaxStatus = uniformityData.minToMax >= req.minToMax ? 'good' : 'poor';
    
    // Evaluate overall status
    const overallStatus = (minToAvgStatus === 'good' && minToMaxStatus === 'good') ? 'good' : 'poor';
    
    return {
        requirements: req,
        status: {
            minToAvg: minToAvgStatus,
            minToMax: minToMaxStatus,
            overall: overallStatus
        }
    };
}

/**
 * Calculate uniformity gradient
 * @param {Array} illuminanceGrid - 2D array of illuminance values
 * @param {number} gridSpacing - Spacing between grid points in meters
 * @returns {Object} - Uniformity gradient
 */
export function calculateUniformityGradient(illuminanceGrid, gridSpacing) {
    const gradientGrid = [];
    let maxGradient = 0;
    let avgGradient = 0;
    let gradientCount = 0;
    
    // Calculate gradient at each grid point
    for (let y = 0; y < illuminanceGrid.length - 1; y++) {
        const row = [];
        
        for (let x = 0; x < illuminanceGrid[y].length - 1; x++) {
            // Calculate horizontal and vertical gradients
            const horizontalDiff = Math.abs(illuminanceGrid[y][x+1] - illuminanceGrid[y][x]);
            const verticalDiff = Math.abs(illuminanceGrid[y+1][x] - illuminanceGrid[y][x]);
            
            // Calculate gradient in lux per meter
            const horizontalGradient = horizontalDiff / gridSpacing;
            const verticalGradient = verticalDiff / gridSpacing;
            
            // Use the larger gradient
            const gradient = Math.max(horizontalGradient, verticalGradient);
            row.push(gradient);
            
            // Track maximum gradient
            maxGradient = Math.max(maxGradient, gradient);
            
            // Sum for average calculation
            avgGradient += gradient;
            gradientCount++;
        }
        
        gradientGrid.push(row);
    }
    
    // Calculate average gradient
    const avgGradientValue = avgGradient / gradientCount;
    
    return {
        gradientGrid: gradientGrid,
        maxGradient: maxGradient,
        avgGradient: avgGradientValue
    };
}

/**
 * Evaluate uniformity gradient based on standards
 * @param {number} maxGradient - Maximum uniformity gradient in lux per meter
 * @param {string} taskType - Type of visual task
 * @returns {Object} - Evaluation results
 */
export function evaluateUniformityGradient(maxGradient, taskType) {
    // Define maximum uniformity gradient requirements by task type
    const requirements = {
        precisionWork: 100,    // lx/m
        detailedWork: 200,     // lx/m
        normalWork: 300,       // lx/m
        roughWork: 500,        // lx/m
        circulation: 1000,     // lx/m
        default: 300           // lx/m
    };
    
    // Get requirement for the specified task type or use default
    const maxAllowedGradient = requirements[taskType] || requirements.default;
    
    // Evaluate gradient
    const status = maxGradient <= maxAllowedGradient ? 'good' : 'poor';
    
    return {
        requirement: maxAllowedGradient,
        status: status
    };
}

/**
 * Calculate diversity (max/min ratio) for the illuminance grid
 * @param {Object} uniformityData - Uniformity data including min and max
 * @returns {number} - Diversity ratio
 */
export function calculateDiversity(uniformityData) {
    return uniformityData.max / uniformityData.min;
}

/**
 * Evaluate diversity based on standards
 * @param {number} diversity - Diversity ratio (max/min)
 * @param {string} spaceType - Type of space
 * @returns {Object} - Evaluation results
 */
export function evaluateDiversity(diversity, spaceType) {
    // Define maximum diversity requirements by space type
    const requirements = {
        office: 3.0,
        industrial: 4.0,
        retail: 5.0,
        educational: 3.0,
        healthcare: 2.5,
        outdoor: 8.0,
        default: 4.0
    };
    
    // Get requirement for the specified space type or use default
    const maxAllowedDiversity = requirements[spaceType] || requirements.default;
    
    // Evaluate diversity
    const status = diversity <= maxAllowedDiversity ? 'good' : 'poor';
    
    return {
        requirement: maxAllowedDiversity,
        status: status
    };
}