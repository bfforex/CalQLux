/**
 * CalQLux - IES File Parser
 * Parses IES photometric data files (LM-63 format)
 */

class IESParser {
    /**
     * Parse an IES file string
     * @param {string} iesContent - IES file content as string
     * @returns {Object} - Parsed photometric data
     */
    static parse(iesContent) {
        // Split content into lines
        const lines = iesContent.split(/\r?\n/);
        
        // Parse header information
        const header = this.parseHeader(lines);
        
        // Parse tilt information if present
        let lineIndex = header.endLine;
        const tiltInfo = this.parseTilt(lines, lineIndex);
        lineIndex = tiltInfo.endLine;
        
        // Parse photometric data
        const photometricData = this.parsePhotometricData(lines, lineIndex);
        
        return {
            header: header.data,
            tilt: tiltInfo.data,
            photometric: photometricData
        };
    }
    
    /**
     * Parse IES file header
     * @param {Array} lines - IES file lines
     * @returns {Object} - Header data and end line index
     */
    static parseHeader(lines) {
        const headerData = {
            keywords: {},
            format: null
        };
        
        let lineIndex = 0;
        
        // Check if file starts with IESNA header
        if (lines[0].includes('IESNA:')) {
            headerData.format = lines[0].trim();
            lineIndex++;
        }
        
        // Parse keywords
        while (lineIndex < lines.length) {
            const line = lines[lineIndex].trim();
            
            // End of keywords section
            if (line === 'TILT=NONE' || line.startsWith('TILT=')) {
                break;
            }
            
            // Parse keyword
            if (line.startsWith('[') && line.includes(']')) {
                const keyMatch = line.match(/\[(.*?)\]/);
                if (keyMatch && keyMatch[1]) {
                    const key = keyMatch[1];
                    const value = line.substring(line.indexOf(']') + 1).trim();
                    headerData.keywords[key] = value;
                }
            }
            
            lineIndex++;
        }
        
        return {
            data: headerData,
            endLine: lineIndex
        };
    }
    
    /**
     * Parse tilt information
     * @param {Array} lines - IES file lines
     * @param {number} startLine - Starting line index
     * @returns {Object} - Tilt data and end line index
     */
    static parseTilt(lines, startLine) {
        const tiltLine = lines[startLine].trim();
        let lineIndex = startLine + 1;
        
        const tiltData = {
            type: 'NONE',
            angles: []
        };
        
        if (tiltLine === 'TILT=NONE') {
            tiltData.type = 'NONE';
        } else if (tiltLine === 'TILT=INCLUDE') {
            tiltData.type = 'INCLUDE';
            
            // Parse included tilt data
            // Implementation depends on format version
            // For demonstration, we'll skip parsing details
            
            // Skip ahead to photometric data
            lineIndex += 10; // Approximate - would need to count properly in real implementation
        } else if (tiltLine.startsWith('TILT=FILE')) {
            tiltData.type = 'FILE';
            tiltData.file = tiltLine.substring(10).trim();
        }
        
        return {
            data: tiltData,
            endLine: lineIndex
        };
    }
    
    /**
     * Parse photometric data
     * @param {Array} lines - IES file lines
     * @param {number} startLine - Starting line index
     * @returns {Object} - Photometric data
     */
    static parsePhotometricData(lines, startLine) {
        let lineIndex = startLine;
        const data = {};
        
        // Read lamp and luminaire data line
        const lampLine = lines[lineIndex++].trim().split(/\s+/).filter(Boolean);
        
        data.lampCount = parseInt(lampLine[0], 10);
        data.lumensPerLamp = parseFloat(lampLine[1]);
        data.candleMultiplier = parseFloat(lampLine[2]);
        data.angleCount = parseInt(lampLine[3], 10);
        data.horizontalAngles = parseInt(lampLine[4], 10);
        data.photometricType = parseInt(lampLine[5], 10);
        data.unitType = parseInt(lampLine[6], 10);
        data.width = parseFloat(lampLine[7]);
        data.length = parseFloat(lampLine[8]);
        data.height = parseFloat(lampLine[9]);
        
        // Read ballast factor line
        const ballastLine = lines[lineIndex++].trim().split(/\s+/).filter(Boolean);
        data.ballastFactor = parseFloat(ballastLine[0]);
        data.ballastLampFactor = parseFloat(ballastLine[1] || '1.0');
        data.inputWatts = parseFloat(ballastLine[2] || '0');
        
        // Read vertical angle increments
        const verticalAngles = [];
        let angleValuesLine = '';
        
        while (verticalAngles.length < data.angleCount) {
            angleValuesLine += ' ' + lines[lineIndex++].trim();
            const angles = angleValuesLine.trim().split(/\s+/).filter(Boolean).map(parseFloat);
            
            verticalAngles.push(...angles);
            
            // Check if we've read all angles
            if (verticalAngles.length >= data.angleCount) {
                break;
            }
        }
        
        data.verticalAngles = verticalAngles;
        
        // Read horizontal angle increments
        const horizontalAngles = [];
        angleValuesLine = '';
        
        while (horizontalAngles.length < data.horizontalAngles) {
            angleValuesLine += ' ' + lines[lineIndex++].trim();
            const angles = angleValuesLine.trim().split(/\s+/).filter(Boolean).map(parseFloat);
            
            horizontalAngles.push(...angles);
            
            // Check if we've read all angles
            if (horizontalAngles.length >= data.horizontalAngles) {
                break;
            }
        }
        
        data.horizontalAngles = horizontalAngles;
        
        // Read candela values
        const candela = [];
        
        // For each horizontal angle
        for (let h = 0; h < data.horizontalAngles; h++) {
            const horizontalSet = [];
            
            // Read all vertical angles for this horizontal angle
            let candelaLine = '';
            const verticalSet = [];
            
            while (verticalSet.length < data.angleCount) {
                candelaLine += ' ' + lines[lineIndex++].trim();
                const values = candelaLine.trim().split(/\s+/).filter(Boolean).map(parseFloat);
                
                verticalSet.push(...values);
                
                // Check if we've read all values
                if (verticalSet.length >= data.angleCount) {
                    break;
                }
            }
            
            horizontalSet.push(...verticalSet);
            candela.push(horizontalSet);
        }
        
        data.candela = candela;
        
        return data;
    }
    
    /**
     * Get intensity at specified angles
     * @param {Object} photometricData - Parsed photometric data
     * @param {number} verticalAngle - Vertical angle in degrees
     * @param {number} horizontalAngle - Horizontal angle in degrees
     * @returns {number} - Intensity in candelas
     */
    static getIntensityAtAngle(photometricData, verticalAngle, horizontalAngle) {
        // Normalize angles
        while (horizontalAngle < 0) horizontalAngle += 360;
        while (horizontalAngle >= 360) horizontalAngle -= 360;
        
        // Clamp vertical angle
        verticalAngle = Math.max(0, Math.min(180, verticalAngle));
        
        // Find nearest vertical angles
        let lowerVIndex = 0;
        let upperVIndex = photometricData.verticalAngles.length - 1;
        
        for (let i = 0; i < photometricData.verticalAngles.length - 1; i++) {
            if (verticalAngle >= photometricData.verticalAngles[i] && 
                verticalAngle <= photometricData.verticalAngles[i + 1]) {
                lowerVIndex = i;
                upperVIndex = i + 1;
                break;
            }
        }
        
        // Find nearest horizontal angles
        let lowerHIndex = 0;
        let upperHIndex = photometricData.horizontalAngles.length - 1;
        
        for (let i = 0; i < photometricData.horizontalAngles.length - 1; i++) {
            if (horizontalAngle >= photometricData.horizontalAngles[i] && 
                horizontalAngle <= photometricData.horizontalAngles[i + 1]) {
                lowerHIndex = i;
                upperHIndex = i + 1;
                break;
            }
        }
        
        // Interpolate intensity
        // This is a simplified bilinear interpolation
        
        // Get the four surrounding intensity values
        const i1 = photometricData.candela[lowerHIndex][lowerVIndex];
        const i2 = photometricData.candela[lowerHIndex][upperVIndex];
        const i3 = photometricData.candela[upperHIndex][lowerVIndex];
        const i4 = photometricData.candela[upperHIndex][upperVIndex];
        
        // Calculate weights for bilinear interpolation
        const vDelta = photometricData.verticalAngles[upperVIndex] - photometricData.verticalAngles[lowerVIndex];
        const hDelta = photometricData.horizontalAngles[upperHIndex] - photometricData.horizontalAngles[lowerHIndex];
        
        const vRatio = vDelta > 0 ? 
            (verticalAngle - photometricData.verticalAngles[lowerVIndex]) / vDelta : 0;
        const hRatio = hDelta > 0 ? 
            (horizontalAngle - photometricData.horizontalAngles[lowerHIndex]) / hDelta : 0;
        
        // Bilinear interpolation
        const intensity = 
            i1 * (1 - hRatio) * (1 - vRatio) +
            i2 * (1 - hRatio) * vRatio +
            i3 * hRatio * (1 - vRatio) +
            i4 * hRatio * vRatio;
        
        return intensity;
    }
}

// Make the parser available globally
window.IESParser = IESParser;