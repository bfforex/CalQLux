/**
 * CalQLux - Average Illuminance Calculations Module
 * Implements the lumen method for average illuminance calculations
 */

/**
 * Calculate average illuminance using the lumen method
 * @param {Object} roomConfig - Room configuration data
 * @param {Array} luminaires - Array of luminaires used
 * @param {Object} options - Calculation options
 * @returns {Object} - Calculation results
 */
export function calculateAverageIlluminance(roomConfig, luminaires, options = {}) {
    // Calculate room area
    const area = roomConfig.length * roomConfig.width; // m²
    
    // Calculate total luminous flux
    let totalLumens = 0;
    luminaires.forEach(luminaire => {
        totalLumens += luminaire.luminousFlux * luminaire.quantity;
    });
    
    // Calculate coefficient of utilization
    const cu = calculateCoefficientOfUtilization(roomConfig, luminaires);
    
    // Calculate light loss factor
    const llf = options.lightLossFactor || 0.8; // Default LLF if not specified
    
    // Calculate average illuminance using the lumen method
    // E_avg = (Φ * CU * LLF) / A
    const avgIlluminance = (totalLumens * cu * llf) / area;
    
    return {
        average: Math.round(avgIlluminance),
        cu: cu,
        llf: llf,
        totalLumens: totalLumens,
        area: area
    };
}

/**
 * Calculate coefficient of utilization
 * @param {Object} roomConfig - Room configuration data
 * @param {Array} luminaires - Array of luminaires used
 * @returns {number} - Coefficient of utilization
 */
function calculateCoefficientOfUtilization(roomConfig, luminaires) {
    // Calculate room cavity ratio (RCR)
    const rcr = calculateRoomCavityRatio(roomConfig);
    
    // Get effective reflectances
    const pc = roomConfig.reflectances.ceiling;
    const pw = roomConfig.reflectances.walls;
    const pf = roomConfig.reflectances.floor;
    
    // In a real implementation, we would look up CU values from tables based on RCR and reflectances
    // For this example, we'll use a simplified formula to estimate CU
    
    // Estimate CU based on room cavity ratio and reflectances
    const cu = Math.max(
        0.2,
        Math.min(
            0.95, 
            0.9 * Math.exp(-0.2 * rcr) * (0.7 + 0.3 * pc) * (0.7 + 0.3 * pw) * (0.8 + 0.2 * pf)
        )
    );
    
    return cu;
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
 * Calculate zonal cavity coefficients
 * @param {Object} roomConfig - Room configuration data
 * @returns {Object} - Zonal cavity coefficients
 */
export function calculateZonalCavityCoefficients(roomConfig) {
    const length = roomConfig.length;
    const width = roomConfig.width;
    
    // Calculate cavity heights
    const hrc = roomConfig.height - roomConfig.workPlaneHeight; // Room cavity height
    const hcc = 0; // Ceiling cavity height (assuming flush-mounted fixtures)
    const hfc = roomConfig.workPlaneHeight; // Floor cavity height
    
    // Calculate room cavity ratio
    const rcr = 5 * hrc * (length + width) / (length * width);
    
    // Calculate ceiling cavity ratio
    const ccr = 5 * hcc * (length + width) / (length * width);
    
    // Calculate floor cavity ratio
    const fcr = 5 * hfc * (length + width) / (length * width);
    
    return {
        rcr: rcr,
        ccr: ccr,
        fcr: fcr
    };
}

/**
 * Calculate effective ceiling cavity reflectance
 * @param {number} pc - Ceiling reflectance
 * @param {number} pw - Wall reflectance
 * @param {number} ccr - Ceiling cavity ratio
 * @returns {number} - Effective ceiling cavity reflectance
 */
export function calculateEffectiveCeilingReflectance(pc, pw, ccr) {
    // If ceiling cavity ratio is 0 (flush-mounted fixtures), return ceiling reflectance
    if (ccr === 0) {
        return pc;
    }
    
    // Calculate effective ceiling cavity reflectance
    // This is a simplified formula - in practice, tables would be used
    const pcc = (pc + 4 * pw * ccr / 5) / (1 + 4 * ccr / 5);
    
    return pcc;
}

/**
 * Calculate effective floor cavity reflectance
 * @param {number} pf - Floor reflectance
 * @param {number} pw - Wall reflectance
 * @param {number} fcr - Floor cavity ratio
 * @returns {number} - Effective floor cavity reflectance
 */
export function calculateEffectiveFloorReflectance(pf, pw, fcr) {
    // Calculate effective floor cavity reflectance
    // This is a simplified formula - in practice, tables would be used
    const pfc = (pf + 4 * pw * fcr / 5) / (1 + 4 * fcr / 5);
    
    return pfc;
}