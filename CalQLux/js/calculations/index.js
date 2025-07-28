/**
 * CalQLux - Illumination Design Calculator
 * Calculation Modules Entry Point
 */

/**
 * Calculate point-by-point illuminance values
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Calculation results
 */
export function calculatePointByPoint(params) {
    const { room, luminaires, reflectances, workplane } = params;
    
    // Convert dimensions to meters for consistency
    const lengthM = room.lengthUnit === 'ft' ? room.length * 0.3048 : room.length;
    const widthM = room.widthUnit === 'ft' ? room.width * 0.3048 : room.width;
    const heightM = room.heightUnit === 'ft' ? room.height * 0.3048 : room.height;
    const workplaneHeightM = workplane.heightUnit === 'ft' ? workplane.height * 0.3048 : workplane.height;
    
    // Calculate grid points
    const gridSpacingM = params.calculation.gridSpacing;
    const xPoints = Math.floor(lengthM / gridSpacingM) + 1;
    const yPoints = Math.floor(widthM / gridSpacingM) + 1;
    
    // Generate illuminance grid
    const illuminanceGrid = [];
    let minIlluminance = Number.MAX_VALUE;
    let maxIlluminance = 0;
    let totalIlluminance = 0;
    
    // Create grid with illuminance values at each point
    for (let y = 0; y < yPoints; y++) {
        const row = [];
        for (let x = 0; x < xPoints; x++) {
            // Calculate relative position in room (0-1)
            const xPos = x / (xPoints - 1);
            const yPos = y / (yPoints - 1);
            
            // Calculate actual coordinates
            const xCoord = xPos * lengthM;
            const yCoord = yPos * widthM;
            
            // Calculate illuminance at this point using inverse square law
            let pointIlluminance = 0;
            
            // Contribution from each luminaire
            for (let lr = 0; lr < luminaires.rows; lr++) {
                for (let lc = 0; lc < luminaires.columns; lc++) {
                    // Luminaire position
                    const lxPos = (lc + 0.5) * (lengthM / luminaires.columns);
                    const lyPos = (lr + 0.5) * (widthM / luminaires.rows);
                    const lzPos = heightM - luminaires.suspensionHeight;
                    
                    // Distance from point to luminaire
                    const dx = xCoord - lxPos;
                    const dy = yCoord - lyPos;
                    const dz = lzPos - workplaneHeightM;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    // Calculate illuminance using inverse square law
                    const cosTheta = dz / distance; // Cosine of angle of incidence
                    
                    // Luminous intensity in cd (simplified - would use IES data in full implementation)
                    const luminousIntensity = luminaires.flux / (4 * Math.PI);
                    
                    // Illuminance contribution from this luminaire
                    const contrib = (luminousIntensity * Math.pow(cosTheta, 3)) / (distance * distance);
                    pointIlluminance += contrib;
                }
            }
            
            // Apply room surface reflectances (simplified)
            const reflectionFactor = 1 + (
                (reflectances.ceiling / 100) * 0.4 + 
                (reflectances.walls / 100) * 0.4 + 
                (reflectances.floor / 100) * 0.2
            );
            
            pointIlluminance *= reflectionFactor;
            
            // Round to nearest lux
            const finalIlluminance = Math.round(pointIlluminance);
            row.push(finalIlluminance);
            
            // Update stats
            minIlluminance = Math.min(minIlluminance, finalIlluminance);
            maxIlluminance = Math.max(maxIlluminance, finalIlluminance);
            totalIlluminance += finalIlluminance;
        }
        illuminanceGrid.push(row);
    }
    
    // Calculate average illuminance
    const avgIlluminance = Math.round(totalIlluminance / (xPoints * yPoints));
    
    // Calculate uniformity ratio (min/avg)
    const uniformity = minIlluminance / avgIlluminance;
    
    return {
        grid: illuminanceGrid,
        average: avgIlluminance,
        min: minIlluminance,
        max: maxIlluminance,
        uniformity: uniformity.toFixed(2),
        dimensions: {
            xPoints, yPoints, 
            gridSpacingM,
            lengthM, widthM
        }
    };
}

/**
 * Calculate average illuminance using the lumen method
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Calculation results
 */
export function calculateAverageIlluminance(params) {
    const { room, luminaires, reflectances, workplane } = params;
    
    // Convert dimensions to meters
    const lengthM = room.lengthUnit === 'ft' ? room.length * 0.3048 : room.length;
    const widthM = room.widthUnit === 'ft' ? room.width * 0.3048 : room.width;
    const heightM = room.heightUnit === 'ft' ? room.height * 0.3048 : room.height;
    const workplaneHeightM = workplane.heightUnit === 'ft' ? workplane.height * 0.3048 : workplane.height;
    
    // Calculate room cavity ratios
    const roomArea = lengthM * widthM;
    const roomPerimeter = 2 * (lengthM + widthM);
    const cavityHeight = heightM - workplaneHeightM;
    
    const roomCavityRatio = (2.5 * cavityHeight * roomPerimeter) / roomArea;
    
    // Calculate coefficient of utilization (simplified approach)
    // In a real implementation, this would use CU tables based on luminaire type
    const reflectanceAvg = (reflectances.ceiling + reflectances.walls + reflectances.floor) / 3;
    const coefficientOfUtilization = 0.6 + (0.3 * (reflectanceAvg / 100));
    
    // Calculate light loss factor (simplified)
    const lightLossFactor = 0.8; // Typical value, would vary based on environment and maintenance
    
    // Calculate total lumens from all luminaires
    const totalLumens = luminaires.flux * luminaires.rows * luminaires.columns;
    
    // Calculate average illuminance using lumen method formula
    const averageIlluminance = (totalLumens * coefficientOfUtilization * lightLossFactor) / roomArea;
    
    // Estimate min and max based on typical distribution patterns
    const minIlluminance = Math.round(averageIlluminance * 0.6); // Typical minimum 
    const maxIlluminance = Math.round(averageIlluminance * 1.4); // Typical maximum
    
    // Calculate uniformity (min/avg)
    const uniformity = minIlluminance / averageIlluminance;
    
    return {
        average: Math.round(averageIlluminance),
        min: minIlluminance,
        max: maxIlluminance,
        uniformity: uniformity.toFixed(2),
        coefficientOfUtilization: coefficientOfUtilization.toFixed(2),
        lightLossFactor: lightLossFactor.toFixed(2)
    };
}

/**
 * Calculate coefficient of utilization
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Calculation results
 */
export function calculateCoefficientUtilization(params) {
    const { room, luminaires, reflectances } = params;
    
    // Convert dimensions to meters
    const lengthM = room.lengthUnit === 'ft' ? room.length * 0.3048 : room.length;
    const widthM = room.widthUnit === 'ft' ? room.width * 0.3048 : room.width;
    const heightM = room.heightUnit === 'ft' ? room.height * 0.3048 : room.height;
    
    // Calculate room index (k) - European method
    const roomArea = lengthM * widthM;
    const mountingHeight = heightM - 0.85; // Assume 0.85m workplane height
    const roomIndex = roomArea / (mountingHeight * (lengthM + widthM));
    
    // Calculate effective ceiling cavity reflectance
    const ceilingReflectance = reflectances.ceiling / 100;
    const wallReflectance = reflectances.walls / 100;
    
    // Calculate coefficient of utilization based on zonal cavity method (simplified)
    // In a real implementation, this would use specific luminaire photometric data
    const cu = calculateCU(roomIndex, ceilingReflectance, wallReflectance);
    
    // Calculate illuminance for the space using this CU
    const totalLumens = luminaires.flux * luminaires.rows * luminaires.columns;
    const lightLossFactor = 0.8;
    const averageIlluminance = (totalLumens * cu * lightLossFactor) / roomArea;
    
    // Estimate min and max based on typical distribution
    const minIlluminance = Math.round(averageIlluminance * 0.65);
    const maxIlluminance = Math.round(averageIlluminance * 1.35);
    const uniformity = minIlluminance / averageIlluminance;
    
    return {
        average: Math.round(averageIlluminance),
        min: minIlluminance,
        max: maxIlluminance,
        uniformity: uniformity.toFixed(2),
        coefficientOfUtilization: cu.toFixed(2),
        roomIndex: roomIndex.toFixed(2)
    };
}

/**
 * Helper function to calculate Coefficient of Utilization based on room index
 * @param {number} roomIndex - Room index (k)
 * @param {number} ceilingRefl - Ceiling reflectance (0-1)
 * @param {number} wallRefl - Wall reflectance (0-1)
 * @returns {number} - Coefficient of utilization
 */
function calculateCU(roomIndex, ceilingRefl, wallRefl) {
    // Simplified CU calculation - in real implementation, this would use interpolation
    // from photometric data tables specific to the luminaire
    let baseCU = 0.4;
    
    // Adjust for room index - larger rooms have higher CU
    if (roomIndex < 1) {
        baseCU *= 0.8;
    } else if (roomIndex > 3) {
        baseCU *= 1.2;
    } else {
        baseCU *= (0.8 + (roomIndex - 1) * 0.13); // Linear interpolation
    }
    
    // Adjust for reflectances
    const reflFactor = 0.7 * ceilingRefl + 0.3 * wallRefl;
    const adjustedCU = baseCU * (0.7 + 0.3 * reflFactor);
    
    return Math.min(Math.max(adjustedCU, 0.1), 0.95); // Clamp between 0.1 and 0.95
}

/**
 * Calculate uniformity ratios
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Calculation results
 */
export function calculateUniformity(params) {
    // Use point-by-point calculation to get illuminance grid
    const pointResults = calculatePointByPoint(params);
    const { grid, average } = pointResults;
    
    // Calculate additional uniformity metrics
    const min = pointResults.min;
    const max = pointResults.max;
    
    // Min/Avg ratio (standard uniformity)
    const uniformity = min / average;
    
    // Min/Max ratio
    const minMaxRatio = min / max;
    
    // Calculate standard deviation
    let sumSquaredDifferences = 0;
    let count = 0;
    
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            sumSquaredDifferences += Math.pow(grid[y][x] - average, 2);
            count++;
        }
    }
    
    const standardDeviation = Math.sqrt(sumSquaredDifferences / count);
    const coefficientOfVariation = standardDeviation / average;
    
    return {
        average: average,
        min: min,
        max: max,
        uniformity: uniformity.toFixed(2),          // Min/Avg (standard uniformity)
        minMaxRatio: minMaxRatio.toFixed(2),        // Min/Max ratio
        standardDeviation: Math.round(standardDeviation), // Standard deviation of illuminance
        coefficientOfVariation: coefficientOfVariation.toFixed(2) // Coefficient of variation
    };
}

/**
 * Calculate luminance values
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Calculation results
 */
export function calculateLuminance(params) {
    const { room, luminaires, reflectances, workplane, observation } = params;
    
    // First calculate illuminance
    const illuminanceResults = calculatePointByPoint(params);
    
    // Calculate luminance based on illuminance and surface reflectance
    // Luminance (cd/m²) = Illuminance (lux) × Reflectance / π
    
    // Simplified luminance calculation using average illuminance and viewing angle
    const averageIlluminance = illuminanceResults.average;
    
    // Surface reflectance depends on the observed surface
    let surfaceReflectance;
    switch (observation.surface) {
        case 'ceiling':
            surfaceReflectance = reflectances.ceiling / 100;
            break;
        case 'walls':
            surfaceReflectance = reflectances.walls / 100;
            break;
        case 'floor':
            surfaceReflectance = reflectances.floor / 100;
            break;
        default:
            // Assume workplane with standard reflectance
            surfaceReflectance = 0.5; // 50% reflectance
    }
    
    // Calculate average luminance
    const averageLuminance = (averageIlluminance * surfaceReflectance) / Math.PI;
    
    // Estimate min and max luminance based on illuminance distribution
    const minLuminance = (illuminanceResults.min * surfaceReflectance) / Math.PI;
    const maxLuminance = (illuminanceResults.max * surfaceReflectance) / Math.PI;
    
    // Calculate luminance uniformity
    const uniformity = minLuminance / averageLuminance;
    
    return {
        average: Math.round(averageLuminance),
        min: Math.round(minLuminance),
        max: Math.round(maxLuminance),
        uniformity: uniformity.toFixed(2),
        surfaceReflectance: surfaceReflectance.toFixed(2),
        observedSurface: observation.surface || 'workplane'
    };
}