/**
 * CalQLux - Advanced IESNA Calculation Methods
 * Implementation of advanced lighting calculation methods from the IESNA Handbook
 */

/**
 * Calculate Visual Comfort Probability (VCP)
 * @param {Object} luminaire - Luminaire data
 * @param {Object} roomConfig - Room configuration
 * @param {Object} observerPosition - Observer position coordinates
 * @returns {number} - Visual Comfort Probability (0-100%)
 */
export function calculateVCP(luminaire, roomConfig, observerPosition) {
    // Calculate background luminance (average luminance in observer's field of view)
    const backgroundLuminance = calculateBackgroundLuminance(roomConfig);
    
    // Calculate direct vertical illuminance at eye
    const directVerticalIlluminance = calculateDirectVerticalIlluminance(
        luminaire, roomConfig, observerPosition
    );
    
    // Calculate position index for each luminaire
    const positionIndices = calculatePositionIndices(luminaire, observerPosition);
    
    // Calculate discomfort glare rating (DGR)
    const DGR = calculateDiscomfortGlareRating(
        luminaire, backgroundLuminance, directVerticalIlluminance, positionIndices
    );
    
    // Convert DGR to Visual Comfort Probability
    const VCP = 100 - 4.2 * DGR + 0.0883 * Math.pow(DGR, 2) - 0.000689 * Math.pow(DGR, 3);
    
    return Math.max(0, Math.min(100, VCP));
}

/**
 * Calculate background luminance
 * @param {Object} roomConfig - Room configuration
 * @returns {number} - Background luminance in cd/m²
 */
function calculateBackgroundLuminance(roomConfig) {
    // Average reflectance of room surfaces weighted by area
    const totalArea = 2 * (
        roomConfig.length * roomConfig.width + 
        roomConfig.length * roomConfig.height + 
        roomConfig.width * roomConfig.height
    );
    
    const weightedReflectance = (
        roomConfig.reflectances.ceiling * roomConfig.length * roomConfig.width +
        roomConfig.reflectances.floor * roomConfig.length * roomConfig.width +
        roomConfig.reflectances.walls * 2 * (
            roomConfig.length * roomConfig.height + 
            roomConfig.width * roomConfig.height
        )
    ) / totalArea;
    
    // Estimate average illuminance
    const avgIlluminance = roomConfig.averageIlluminance || 500; // Default 500 lux
    
    // Background luminance = average illuminance * reflectance / π
    return (avgIlluminance * weightedReflectance) / Math.PI;
}

/**
 * Calculate direct vertical illuminance at eye level
 * @param {Object} luminaire - Luminaire data
 * @param {Object} roomConfig - Room configuration
 * @param {Object} observerPosition - Observer position coordinates
 * @returns {number} - Direct vertical illuminance at eye in lux
 */
function calculateDirectVerticalIlluminance(luminaire, roomConfig, observerPosition) {
    let totalVerticalIlluminance = 0;
    
    // For each luminaire
    for (const fixture of luminaire.fixtures) {
        // Calculate vertical illuminance contribution
        const dx = fixture.x - observerPosition.x;
        const dy = fixture.y - observerPosition.y;
        const dz = fixture.z - observerPosition.eyeHeight;
        
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Get luminous intensity in the direction of the observer
        const intensity = getIntensityInDirection(fixture, dx, dy, dz);
        
        // Calculate vertical illuminance component
        // E_v = I * sin(θ) * cos(θ) / d²
        const cosTheta = dz / distance;
        const sinTheta = Math.sqrt(dx*dx + dy*dy) / distance;
        
        const verticalComponent = intensity * sinTheta * cosTheta / (distance * distance);
        
        totalVerticalIlluminance += verticalComponent;
    }
    
    return totalVerticalIlluminance;
}

/**
 * Calculate position index for each luminaire
 * @param {Object} luminaire - Luminaire data
 * @param {Object} observerPosition - Observer position coordinates
 * @returns {Array} - Array of position indices for each fixture
 */
function calculatePositionIndices(luminaire, observerPosition) {
    const positionIndices = [];
    
    // For each luminaire fixture
    for (const fixture of luminaire.fixtures) {
        // Calculate position index P
        const dx = fixture.x - observerPosition.x;
        const dy = fixture.y - observerPosition.y;
        const dz = fixture.z - observerPosition.eyeHeight;
        
        // Calculate horizontal and vertical angular displacement
        const horizontalAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const verticalAngle = Math.atan2(dz, Math.sqrt(dx*dx + dy*dy)) * (180 / Math.PI);
        
        // Position index formula per IESNA
        let P;
        
        if (verticalAngle >= 0 && verticalAngle < 53) {
            // Source above eye level
            P = Math.exp(
                (35.2 - 0.31889 * verticalAngle - 1.22 * Math.pow(verticalAngle/10, 2)) * 
                Math.pow(10, -3) * horizontalAngle + 
                (21 + 0.26667 * verticalAngle - 0.002963 * Math.pow(verticalAngle, 2)) * 
                Math.pow(10, -5) * Math.pow(horizontalAngle, 2)
            );
        } else {
            // Source below eye level
            P = 1; // Default value for sources below eye level
        }
        
        positionIndices.push(P);
    }
    
    return positionIndices;
}

/**
 * Calculate Discomfort Glare Rating (DGR)
 * @param {Object} luminaire - Luminaire data
 * @param {number} backgroundLuminance - Background luminance in cd/m²
 * @param {number} directVerticalIlluminance - Direct vertical illuminance at eye in lux
 * @param {Array} positionIndices - Array of position indices for each fixture
 * @returns {number} - Discomfort Glare Rating
 */
function calculateDiscomfortGlareRating(
    luminaire, backgroundLuminance, directVerticalIlluminance, positionIndices
) {
    let sumOfGlareFactors = 0;
    
    // For each luminaire fixture
    for (let i = 0; i < luminaire.fixtures.length; i++) {
        const fixture = luminaire.fixtures[i];
        const positionIndex = positionIndices[i];
        
        // Calculate luminaire luminance
        // This would normally come from photometric data
        // For approximation, we'll estimate based on luminous flux and area
        const luminaireLuminance = fixture.luminousFlux / (fixture.area * Math.PI);
        
        // Calculate solid angle subtended by the luminaire at the observer's eye
        const dx = fixture.x - observerPosition.x;
        const dy = fixture.y - observerPosition.y;
        const dz = fixture.z - observerPosition.eyeHeight;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Solid angle = projected area / distance²
        const solidAngle = fixture.area * Math.abs(dz) / (distance * distance * distance);
        
        // Calculate individual glare factor
        // M = 0.5 * L^1.6 * Ω^0.8 / (P * L_b^0.85)
        const glareFactor = 0.5 * 
            Math.pow(luminaireLuminance, 1.6) * 
            Math.pow(solidAngle, 0.8) / 
            (positionIndex * Math.pow(backgroundLuminance + 0.07 * directVerticalIlluminance, 0.85));
        
        sumOfGlareFactors += glareFactor;
    }
    
    // Discomfort Glare Rating
    // DGR = 10 * log10(0.5 * sum(M))
    const DGR = 10 * Math.log10(0.5 * sumOfGlareFactors);
    
    return DGR;
}

/**
 * Calculate Unified Glare Rating (UGR)
 * @param {Object} luminaire - Luminaire data
 * @param {Object} roomConfig - Room configuration
 * @param {Object} observerPosition - Observer position coordinates
 * @returns {number} - Unified Glare Rating
 */
export function calculateUGR(luminaire, roomConfig, observerPosition) {
    // Background luminance
    const backgroundLuminance = calculateBackgroundLuminance(roomConfig);
    
    let sumOfGlareFactors = 0;
    
    // For each luminaire fixture
    for (const fixture of luminaire.fixtures) {
        // Calculate luminaire luminance in direction of observer
        const dx = fixture.x - observerPosition.x;
        const dy = fixture.y - observerPosition.y;
        const dz = fixture.z - observerPosition.eyeHeight;
        
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Get luminance in the direction of the observer
        const luminance = getLuminanceInDirection(fixture, dx, dy, dz);
        
        // Calculate solid angle subtended by the luminaire at the observer's eye
        // Solid angle = projected area / distance²
        const solidAngle = fixture.area * Math.abs(dz) / (distance * distance * distance);
        
        // Calculate position index
        const positionIndex = calculatePositionIndex(fixture, observerPosition);
        
        // Calculate individual glare factor
        // G = (L² * ω) / (P * L_b)
        const glareFactor = (luminance * luminance * solidAngle) / (positionIndex * positionIndex * backgroundLuminance);
        
        sumOfGlareFactors += glareFactor;
    }
    
    // UGR = 8 * log10(0.25 * sum(G))
    const UGR = 8 * Math.log10(0.25 * sumOfGlareFactors);
    
    return UGR;
}

/**
 * Calculate Equivalent Spherical Illuminance (ESI)
 * @param {number} horizontalIlluminance - Horizontal illuminance at point
 * @param {number} cylindricalIlluminance - Cylindrical illuminance at point
 * @returns {number} - Equivalent Spherical Illuminance in lux
 */
export function calculateESI(horizontalIlluminance, cylindricalIlluminance) {
    // ESI = (Eh + 2*Ec) / 3
    return (horizontalIlluminance + 2 * cylindricalIlluminance) / 3;
}

/**
 * Calculate Cylindrical Illuminance
 * @param {Object} luminaires - Luminaire data
 * @param {Object} point - Point coordinates
 * @returns {number} - Cylindrical illuminance in lux
 */
export function calculateCylindricalIlluminance(luminaires, point) {
    // Cylindrical illuminance is the average of vertical illuminances from all directions
    
    // We'll sample 8 directions (N, NE, E, SE, S, SW, W, NW)
    const directionCount = 8;
    let totalVerticalIlluminance = 0;
    
    for (let i = 0; i < directionCount; i++) {
        // Calculate direction vector
        const angle = (i / directionCount) * 2 * Math.PI;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Calculate vertical illuminance in this direction
        const verticalIlluminance = calculateVerticalIlluminance(luminaires, point, { dx, dy });
        
        totalVerticalIlluminance += verticalIlluminance;
    }
    
    // Average all directions
    return totalVerticalIlluminance / directionCount;
}

/**
 * Calculate Vertical Illuminance in a specific direction
 * @param {Object} luminaires - Luminaire data
 * @param {Object} point - Point coordinates
 * @param {Object} direction - Direction vector {dx, dy}
 * @returns {number} - Vertical illuminance in lux
 */
export function calculateVerticalIlluminance(luminaires, point, direction) {
    let totalVerticalIlluminance = 0;
    
    // For each luminaire
    for (const fixture of luminaires.fixtures) {
        // Vector from point to luminaire
        const lx = fixture.x - point.x;
        const ly = fixture.y - point.y;
        const lz = fixture.z - point.z;
        
        const distance = Math.sqrt(lx*lx + ly*ly + lz*lz);
        
        // Dot product of direction vector and normalized luminaire vector
        // This gives the cosine of the angle between them
        const dotProduct = (lx * direction.dx + ly * direction.dy) / Math.sqrt(lx*lx + ly*ly);
        
        // Get luminous intensity in direction of point
        const intensity = getIntensityInDirection(fixture, -lx, -ly, -lz);
        
        // Vertical illuminance component
        // E_v = I * sin(θ) * cos(α) / d²
        // Where θ is angle from vertical, α is angle from direction vector
        const sinTheta = Math.sqrt(lx*lx + ly*ly) / distance;
        const cosTheta = lz / distance;
        
        // Scale by dot product to account for direction
        const verticalComponent = intensity * sinTheta * Math.abs(dotProduct) / (distance * distance);
        
        totalVerticalIlluminance += verticalComponent;
    }
    
    return totalVerticalIlluminance;
}

/**
 * Calculate Space/Height Ratio
 * @param {number} length - Room length
 * @param {number} width - Room width
 * @param {number} mountingHeight - Luminaire mounting height above work plane
 * @returns {number} - Space/Height Ratio
 */
export function calculateSpaceHeightRatio(length, width, mountingHeight) {
    const spaceLength = length / (Math.ceil(length / mountingHeight) + 1);
    const spaceWidth = width / (Math.ceil(width / mountingHeight) + 1);
    
    return {
        lengthRatio: spaceLength / mountingHeight,
        widthRatio: spaceWidth / mountingHeight
    };
}

/**
 * Calculate Coefficient of Utilization
 * @param {Object} luminaire - Luminaire data
 * @param {Object} room - Room configuration
 * @returns {number} - Coefficient of Utilization (0-1)
 */
export function calculateCoefficientOfUtilization(luminaire, room) {
    // Calculate room cavity ratio
    const RCR = calculateRoomCavityRatio(room);
    
    // This would normally use the luminaire's CU table
    // For approximation, we'll use a formula based on RCR and reflectances
    
    // Effective ceiling cavity reflectance
    const pc = room.reflectances.ceiling;
    
    // Effective floor cavity reflectance
    const pf = room.reflectances.floor;
    
    // Effective wall reflectance
    const pw = room.reflectances.walls;
    
    // Approximate CU based on empirical formula
    // This is a simplification - real calculations would use manufacturer's CU tables
    const CU = 0.95 * Math.exp(-0.24 * RCR) * 
        (0.8 + 0.2 * pc) * 
        (0.8 + 0.2 * pf) * 
        (0.7 + 0.3 * pw);
    
    return Math.min(1, Math.max(0, CU));
}

/**
 * Calculate Room Cavity Ratio
 * @param {Object} room - Room configuration
 * @returns {number} - Room Cavity Ratio
 */
export function calculateRoomCavityRatio(room) {
    const length = room.length;
    const width = room.width;
    const height = room.height - room.workPlaneHeight;
    
    // RCR = 5 * height * (length + width) / (length * width)
    return 5 * height * (length + width) / (length * width);
}

/**
 * Calculate Lighting Power Density
 * @param {Array} luminaires - Array of luminaire data
 * @param {number} floorArea - Floor area in square meters
 * @returns {number} - Lighting Power Density in W/m²
 */
export function calculateLightingPowerDensity(luminaires, floorArea) {
    // Calculate total power
    let totalPower = 0;
    
    for (const fixture of luminaires) {
        totalPower += fixture.wattage * fixture.quantity;
    }
    
    // LPD = total power / floor area
    return totalPower / floorArea;
}

/**
 * Calculate Modelling Index
 * @param {number} cylindricalIlluminance - Cylindrical illuminance at point
 * @param {number} horizontalIlluminance - Horizontal illuminance at point
 * @returns {number} - Modelling Index
 */
export function calculateModellingIndex(cylindricalIlluminance, horizontalIlluminance) {
    // Modelling Index = Ec / Eh
    // Should be between 0.3 and 0.6 for good modelling
    return cylindricalIlluminance / horizontalIlluminance;
}