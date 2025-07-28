/**
 * CalQLux - Coefficient of Utilization Methods Module
 * Implements methods to calculate coefficient of utilization
 */

/**
 * Calculate coefficient of utilization for a space and luminaire combination
 * @param {Object} roomConfig - Room configuration data
 * @param {Object} luminaire - Luminaire data
 * @returns {number} - Coefficient of utilization
 */
export function calculateCoefficientOfUtilization(roomConfig, luminaire) {
    // Calculate room cavity ratio
    const rcr = calculateRoomCavityRatio(roomConfig);
    
    // Get effective reflectances
    const pc = roomConfig.reflectances.ceiling;
    const pw = roomConfig.reflectances.walls;
    const pf = roomConfig.reflectances.floor;
    
    // In a real implementation, the CU would be obtained from the luminaire's CU table
    // For this example, we'll use a formula to estimate the CU based on RCR and reflectances
    
    // Basic CU formula for direct lighting
    let cu = 0;
    
    // Check luminaire distribution type
    const distributionType = getLuminaireDistributionType(luminaire);
    
    switch (distributionType) {
        case 'direct':
            // Direct lighting (most light is directed downward)
            cu = calculateDirectCU(rcr, pc, pw, pf);
            break;
        case 'indirect':
            // Indirect lighting (most light is directed upward)
            cu = calculateIndirectCU(rcr, pc, pw, pf);
            break;
        case 'semi-direct':
            // Semi-direct lighting (more light downward than upward)
            cu = 0.7 * calculateDirectCU(rcr, pc, pw, pf) + 
                 0.3 * calculateIndirectCU(rcr, pc, pw, pf);
            break;
        case 'semi-indirect':
            // Semi-indirect lighting (more light upward than downward)
            cu = 0.3 * calculateDirectCU(rcr, pc, pw, pf) + 
                 0.7 * calculateIndirectCU(rcr, pc, pw, pf);
            break;
        case 'direct-indirect':
            // Direct-indirect lighting (equal amounts of light upward and downward)
            cu = 0.5 * calculateDirectCU(rcr, pc, pw, pf) + 
                 0.5 * calculateIndirectCU(rcr, pc, pw, pf);
            break;
        default:
            // Default to direct lighting calculation
            cu = calculateDirectCU(rcr, pc, pw, pf);
    }
    
    // Ensure CU is within valid range
    return Math.max(0, Math.min(1, cu));
}

/**
 * Calculate room cavity ratio
 * @param {Object} roomConfig - Room configuration data
 * @returns {number} - Room cavity ratio
 */
function calculateRoomCavityRatio(roomConfig) {
    const length = roomConfig.length;
    const width = roomConfig.width;
    const height = roomConfig.height - roomConfig.workPlaneHeight;
    
    // RCR = 5 * h * (L + W) / (L * W)
    const rcr = 5 * height * (length + width) / (length * width);
    
    return rcr;
}

/**
 * Calculate coefficient of utilization for direct lighting
 * @param {number} rcr - Room cavity ratio
 * @param {number} pc - Ceiling reflectance
 * @param {number} pw - Wall reflectance
 * @param {number} pf - Floor reflectance
 * @returns {number} - Coefficient of utilization
 */
function calculateDirectCU(rcr, pc, pw, pf) {
    // This is a simplified formula for direct lighting CU
    // In practice, this would use interpolation from CU tables
    
    // Effective ceiling reflectance factor
    const ceilingFactor = 0.8 + 0.2 * pc;
    
    // Effective wall reflectance factor
    const wallFactor = 0.7 + 0.3 * pw;
    
    // Effective floor reflectance factor
    const floorFactor = 0.9 + 0.1 * pf;
    
    // RCR factor (decreases as RCR increases)
    const rcrFactor = Math.exp(-0.25 * rcr);
    
    // Calculate CU
    const cu = 0.95 * ceilingFactor * wallFactor * floorFactor * rcrFactor;
    
    return cu;
}

/**
 * Calculate coefficient of utilization for indirect lighting
 * @param {number} rcr - Room cavity ratio
 * @param {number} pc - Ceiling reflectance
 * @param {number} pw - Wall reflectance
 * @param {number} pf - Floor reflectance
 * @returns {number} - Coefficient of utilization
 */
function calculateIndirectCU(rcr, pc, pw, pf) {
    // This is a simplified formula for indirect lighting CU
    // Indirect lighting depends heavily on ceiling reflectance
    
    // Effective ceiling reflectance factor (more important for indirect)
    const ceilingFactor = 0.6 + 0.4 * pc;
    
    // Effective wall reflectance factor
    const wallFactor = 0.7 + 0.3 * pw;
    
    // Floor factor (less important for indirect)
    const floorFactor = 0.95 + 0.05 * pf;
    
    // RCR factor (decreases as RCR increases, but less dramatically for indirect)
    const rcrFactor = Math.exp(-0.15 * rcr);
    
    // Calculate CU (typically lower for indirect lighting)
    const cu = 0.75 * ceilingFactor * wallFactor * floorFactor * rcrFactor;
    
    return cu;
}

/**
 * Get luminaire distribution type based on its photometric data
 * @param {Object} luminaire - Luminaire data
 * @returns {string} - Distribution type
 */
function getLuminaireDistributionType(luminaire) {
    // In a real implementation, this would analyze the photometric data
    // For this example, we'll use the luminaire type to determine distribution
    
    // Default to direct if no type is specified
    if (!luminaire.type) {
        return 'direct';
    }
    
    switch (luminaire.type.toLowerCase()) {
        case 'downlight':
        case 'highbay':
        case 'floodlight':
            return 'direct';
        
        case 'cove':
        case 'uplighting':
            return 'indirect';
        
        case 'pendant':
            // Some pendants are direct-indirect
            return 'direct-indirect';
        
        case 'wallwash':
        case 'track':
            return 'semi-direct';
            
        default:
            return 'direct';
    }
}

/**
 * Calculate spacing criterion for a luminaire
 * @param {Object} luminaire - Luminaire data
 * @returns {Object} - Spacing criterion in x and y directions
 */
export function calculateSpacingCriterion(luminaire) {
    // In a real implementation, this would be calculated from photometric data
    // For this example, we'll use luminaire type to estimate
    
    let scx, scy;
    
    switch (luminaire.type?.toLowerCase()) {
        case 'downlight':
            scx = scy = 1.0;
            break;
        
        case 'highbay':
            scx = scy = 1.2;
            break;
            
        case 'floodlight':
            scx = 1.2;
            scy = 1.0;
            break;
            
        case 'pendant':
            scx = scy = 1.3;
            break;
            
        case 'panel':
            scx = scy = 1.4;
            break;
            
        default:
            // Default spacing criterion
            scx = scy = 1.2;
    }
    
    // Adjust based on beam angle if available
    if (luminaire.beamAngle) {
        const factor = luminaire.beamAngle / 60; // Normalize to a 60° beam
        scx *= Math.min(1.5, Math.max(0.7, factor));
        scy *= Math.min(1.5, Math.max(0.7, factor));
    }
    
    return { x: scx, y: scy };
}

/**
 * Calculate recommended luminaire spacing
 * @param {Object} luminaire - Luminaire data
 * @param {number} mountingHeight - Mounting height above work plane
 * @returns {Object} - Recommended spacing in x and y directions
 */
export function calculateRecommendedSpacing(luminaire, mountingHeight) {
    const sc = calculateSpacingCriterion(luminaire);
    
    // Spacing = SC * Mounting Height
    const spacingX = sc.x * mountingHeight;
    const spacingY = sc.y * mountingHeight;
    
    return {
        x: spacingX,
        y: spacingY,
        maxX: spacingX * 1.5, // Maximum recommended spacing
        maxY: spacingY * 1.5
    };
}

/**
 * Check if luminaire spacing is appropriate
 * @param {Object} luminaire - Luminaire data
 * @param {number} spacingX - Actual spacing in x direction
 * @param {number} spacingY - Actual spacing in y direction
 * @param {number} mountingHeight - Mounting height above work plane
 * @returns {Object} - Spacing evaluation
 */
export function evaluateSpacing(luminaire, spacingX, spacingY, mountingHeight) {
    const recommended = calculateRecommendedSpacing(luminaire, mountingHeight);
    
    const ratioX = spacingX / recommended.x;
    const ratioY = spacingY / recommended.y;
    
    // Check if spacing is within recommended range
    const xStatus = ratioX <= 1.5 ? 'good' : (ratioX <= 2.0 ? 'acceptable' : 'poor');
    const yStatus = ratioY <= 1.5 ? 'good' : (ratioY <= 2.0 ? 'acceptable' : 'poor');
    
    return {
        recommended: recommended,
        actual: { x: spacingX, y: spacingY },
        ratio: { x: ratioX, y: ratioY },
        status: { x: xStatus, y: yStatus },
        overall: (xStatus === 'poor' || yStatus === 'poor') ? 'poor' : 
                (xStatus === 'acceptable' || yStatus === 'acceptable') ? 'acceptable' : 'good'
    };
}