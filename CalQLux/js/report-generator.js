/**
 * CalQLux - Report Generator
 * Generates detailed lighting reports with compliance analysis
 */

/**
 * Standards for compliance checking
 */
const lightingStandards = {
    offices: {
        name: 'Office Spaces',
        standards: [
            {
                name: 'EN 12464-1 (Europe)',
                requirements: {
                    avgIlluminance: 500, // lux
                    uniformity: 0.6,     // min/avg ratio
                    ugr: 19,             // max UGR
                    cri: 80              // min CRI
                }
            },
            {
                name: 'IES Handbook (North America)',
                requirements: {
                    avgIlluminance: 500, // lux
                    uniformity: 0.7,     // min/avg ratio
                    vcp: 70,             // min VCP
                    cri: 80              // min CRI
                }
            }
        ]
    },
    industrial: {
        name: 'Industrial Areas',
        standards: [
            {
                name: 'EN 12464-1 (Europe)',
                requirements: {
                    avgIlluminance: 300, // lux
                    uniformity: 0.5,     // min/avg ratio
                    ugr: 25,             // max UGR
                    cri: 80              // min CRI
                }
            },
            {
                name: 'IES Handbook (North America)',
                requirements: {
                    avgIlluminance: 300, // lux
                    uniformity: 0.6,     // min/avg ratio
                    cri: 70              // min CRI
                }
            }
        ]
    },
    educational: {
        name: 'Educational Facilities',
        standards: [
            {
                name: 'EN 12464-1 (Europe)',
                requirements: {
                    avgIlluminance: 300, // lux
                    uniformity: 0.6,     // min/avg ratio
                    ugr: 19,             // max UGR
                    cri: 80              // min CRI
                }
            },
            {
                name: 'IES Handbook (North America)',
                requirements: {
                    avgIlluminance: 400, // lux
                    uniformity: 0.7,     // min/avg ratio
                    cri: 80              // min CRI
                }
            }
        ]
    },
    retail: {
        name: 'Retail Spaces',
        standards: [
            {
                name: 'EN 12464-1 (Europe)',
                requirements: {
                    avgIlluminance: 300, // lux
                    uniformity: 0.4,     // min/avg ratio
                    ugr: 22,             // max UGR
                    cri: 80              // min CRI
                }
            },
            {
                name: 'IES Handbook (North America)',
                requirements: {
                    avgIlluminance: 500, // lux
                    uniformity: 0.6,     // min/avg ratio
                    cri: 80              // min CRI
                }
            }
        ]
    },
    healthcare: {
        name: 'Healthcare Facilities',
        standards: [
            {
                name: 'EN 12464-1 (Europe)',
                requirements: {
                    avgIlluminance: 500, // lux
                    uniformity: 0.6,     // min/avg ratio
                    ugr: 19,             // max UGR
                    cri: 90              // min CRI
                }
            },
            {
                name: 'IES Handbook (North America)',
                requirements: {
                    avgIlluminance: 500, // lux
                    uniformity: 0.7,     // min/avg ratio
                    cri: 90              // min CRI
                }
            }
        ]
    },
    outdoor: {
        name: 'Outdoor Areas',
        standards: [
            {
                name: 'EN 13201 (Europe)',
                requirements: {
                    avgIlluminance: 20,  // lux
                    uniformity: 0.4,     // min/avg ratio
                    cri: 70              // min CRI
                }
            },
            {
                name: 'IES RP-8 (North America)',
                requirements: {
                    avgIlluminance: 20,  // lux
                    uniformity: 0.3,     // min/avg ratio
                    cri: 70              // min CRI
                }
            }
        ]
    }
};

/**
 * Generate a comprehensive lighting report
 * @param {Object} project - Project data
 * @param {Object} calculationResults - Calculation results
 * @param {string} spaceType - Space type for standards (e.g., 'offices', 'industrial')
 * @returns {Object} - Report data
 */
export function generateReport(project, calculationResults, spaceType) {
    // Basic report structure
    const report = {
        projectInfo: {
            name: project.name,
            description: project.description,
            date: new Date().toISOString(),
            spaceType: spaceType
        },
        roomInfo: project.roomConfig,
        luminaireInfo: project.luminaires,
        calculationResults: calculationResults,
        complianceAnalysis: {},
        energyAnalysis: {},
        recommendations: []
    };
    
    // Perform compliance analysis
    report.complianceAnalysis = analyzeCompliance(calculationResults, spaceType);
    
    // Perform energy analysis
    report.energyAnalysis = analyzeEnergy(project.luminaires, project.roomConfig);
    
    // Generate recommendations
    report.recommendations = generateRecommendations(report);
    
    return report;
}

/**
 * Analyze compliance against lighting standards
 * @param {Object} results - Calculation results
 * @param {string} spaceType - Space type for standards
 * @returns {Object} - Compliance analysis results
 */
function analyzeCompliance(results, spaceType) {
    const compliance = {
        spaceType: spaceType,
        standardsChecked: [],
        compliantWith: [],
        nonCompliantWith: []
    };
    
    // If space type isn't in our standards, return empty analysis
    if (!lightingStandards[spaceType]) {
        return compliance;
    }
    
    const standards = lightingStandards[spaceType].standards;
    compliance.spaceTypeName = lightingStandards[spaceType].name;
    
    // Check each standard
    standards.forEach(standard => {
        const requirements = standard.requirements;
        const standardCompliance = {
            name: standard.name,
            requirements: requirements,
            metrics: []
        };
        
        // Check average illuminance
        if (requirements.avgIlluminance) {
            const avgIlluminanceCompliant = results.average >= requirements.avgIlluminance;
            standardCompliance.metrics.push({
                name: 'Average Illuminance',
                required: `≥ ${requirements.avgIlluminance} lx`,
                actual: `${results.average} lx`,
                compliant: avgIlluminanceCompliant
            });
        }
        
        // Check uniformity
        if (requirements.uniformity) {
            const uniformityCompliant = results.uniformity >= requirements.uniformity;
            standardCompliance.metrics.push({
                name: 'Uniformity (Min/Avg)',
                required: `≥ ${requirements.uniformity}`,
                actual: results.uniformity.toFixed(2),
                compliant: uniformityCompliant
            });
        }
        
        // Check UGR if applicable
        if (requirements.ugr && results.ugr) {
            const ugrCompliant = results.ugr <= requirements.ugr;
            standardCompliance.metrics.push({
                name: 'UGR (Unified Glare Rating)',
                required: `≤ ${requirements.ugr}`,
                actual: results.ugr.toFixed(1),
                compliant: ugrCompliant
            });
        }
        
        // Check VCP if applicable
        if (requirements.vcp && results.vcp) {
            const vcpCompliant = results.vcp >= requirements.vcp;
            standardCompliance.metrics.push({
                name: 'VCP (Visual Comfort Probability)',
                required: `≥ ${requirements.vcp}%`,
                actual: `${results.vcp.toFixed(1)}%`,
                compliant: vcpCompliant
            });
        }
        
        // Check CRI if applicable
        if (requirements.cri && results.cri) {
            const criCompliant = results.cri >= requirements.cri;
            standardCompliance.metrics.push({
                name: 'CRI (Color Rendering Index)',
                required: `≥ ${requirements.cri}`,
                actual: results.cri,
                compliant: criCompliant
            });
        }
        
        // Add to standards checked
        compliance.standardsChecked.push(standardCompliance);
        
        // Check if compliant with all metrics
        const fullyCompliant = standardCompliance.metrics.every(metric => metric.compliant);
        
        if (fullyCompliant) {
            compliance.compliantWith.push(standard.name);
        } else {
            compliance.nonCompliantWith.push(standard.name);
        }
    });
    
    return compliance;
}

/**
 * Analyze energy efficiency
 * @param {Array} luminaires - Luminaire data
 * @param {Object} roomConfig - Room configuration
 * @returns {Object} - Energy analysis results
 */
function analyzeEnergy(luminaires, roomConfig) {
    // Calculate floor area
    const floorArea = roomConfig.length * roomConfig.width; // m²
    
    // Calculate total power and lumens
    let totalPower = 0;
    let totalLumens = 0;
    let totalQuantity = 0;
    
    luminaires.forEach(luminaire => {
        totalPower += luminaire.wattage * luminaire.quantity;
        totalLumens += luminaire.luminousFlux * luminaire.quantity;
        totalQuantity += luminaire.quantity;
    });
    
    // Calculate lighting power density (W/m²)
    const lpd = totalPower / floorArea;
    
    // Calculate installed lumens per square meter (lm/m²)
    const luminousDensity = totalLumens / floorArea;
    
    // Calculate system efficacy (lm/W)
    const systemEfficacy = totalPower > 0 ? totalLumens / totalPower : 0;
    
    // Energy benchmarks for comparison
    const benchmarks = {
        lpd: {
            excellent: 5,     // W/m²
            good: 7.5,        // W/m²
            acceptable: 10,   // W/m²
            poor: 12.5,       // W/m²
            veryPoor: 15      // W/m²
        },
        efficacy: {
            excellent: 120,   // lm/W
            good: 100,        // lm/W
            acceptable: 80,   // lm/W
            poor: 60,         // lm/W
            veryPoor: 40      // lm/W
        }
    };
    
    // Rate the energy performance
    let lpdRating;
    if (lpd <= benchmarks.lpd.excellent) lpdRating = 'Excellent';
    else if (lpd <= benchmarks.lpd.good) lpdRating = 'Good';
    else if (lpd <= benchmarks.lpd.acceptable) lpdRating = 'Acceptable';
    else if (lpd <= benchmarks.lpd.poor) lpdRating = 'Poor';
    else lpdRating = 'Very Poor';
    
    let efficacyRating;
    if (systemEfficacy >= benchmarks.efficacy.excellent) efficacyRating = 'Excellent';
    else if (systemEfficacy >= benchmarks.efficacy.good) efficacyRating = 'Good';
    else if (systemEfficacy >= benchmarks.efficacy.acceptable) efficacyRating = 'Acceptable';
    else if (systemEfficacy >= benchmarks.efficacy.poor) efficacyRating = 'Poor';
    else efficacyRating = 'Very Poor';
    
    // Calculate annual energy consumption
    // Assuming 10 hours per day, 250 days per year
    const annualHours = 10 * 250; // 2500 hours
    const annualEnergy = totalPower * annualHours / 1000; // kWh
    
    // Calculate annual energy cost
    // Assuming $0.12 per kWh
    const energyRate = 0.12; // $/kWh
    const annualCost = annualEnergy * energyRate;
    
    return {
        totalPower: totalPower, // W
        totalLumens: totalLumens, // lm
        lpd: lpd, // W/m²
        lpdRating: lpdRating,
        luminousDensity: luminousDensity, // lm/m²
        systemEfficacy: systemEfficacy, // lm/W
        efficacyRating: efficacyRating,
        annualEnergy: annualEnergy, // kWh
        annualCost: annualCost, // $
        fixtureCount: totalQuantity
    };
}

/**
 * Generate recommendations based on compliance and energy analysis
 * @param {Object} report - Report data
 * @returns {Array} - Recommendations
 */
function generateRecommendations(report) {
    const recommendations = [];
    
    // Check if non-compliant with any standards
    if (report.complianceAnalysis.nonCompliantWith.length > 0) {
        const nonCompliantStandards = report.complianceAnalysis.standardsChecked.filter(std => 
            report.complianceAnalysis.nonCompliantWith.includes(std.name)
        );
        
        // Generate recommendations for each non-compliant metric
        nonCompliantStandards.forEach(standard => {
            const nonCompliantMetrics = standard.metrics.filter(metric => !metric.compliant);
            
            nonCompliantMetrics.forEach(metric => {
                let recommendation = '';
                
                switch (metric.name) {
                    case 'Average Illuminance':
                        recommendation = `Increase illuminance levels to meet ${standard.name} requirement of ${metric.required}. Consider adding more luminaires, increasing luminaire output, or changing luminaire distribution pattern.`;
                        break;
                    case 'Uniformity (Min/Avg)':
                        recommendation = `Improve uniformity to meet ${standard.name} requirement of ${metric.required}. Consider adjusting luminaire spacing, using luminaires with wider distribution, or adding luminaires in darker areas.`;
                        break;
                    case 'UGR (Unified Glare Rating)':
                        recommendation = `Reduce glare to meet ${standard.name} UGR requirement of ${metric.required}. Consider using luminaires with better glare control, adjusting mounting height, or implementing indirect lighting.`;
                        break;
                    case 'VCP (Visual Comfort Probability)':
                        recommendation = `Improve visual comfort to meet ${standard.name} VCP requirement of ${metric.required}. Consider using luminaires with lower luminance, better shielding, or implementing task-ambient lighting strategy.`;
                        break;
                    case 'CRI (Color Rendering Index)':
                        recommendation = `Improve color rendering to meet ${standard.name} CRI requirement of ${metric.required}. Select luminaires with higher CRI light sources.`;
                        break;
                }
                
                if (recommendation) {
                    recommendations.push({
                        category: 'Compliance',
                        standard: standard.name,
                        metric: metric.name,
                        recommendation: recommendation
                    });
                }
            });
        });
    }
    
    // Energy efficiency recommendations
    if (report.energyAnalysis.lpdRating === 'Poor' || report.energyAnalysis.lpdRating === 'Very Poor') {
        recommendations.push({
            category: 'Energy',
            metric: 'Lighting Power Density',
            recommendation: `Reduce lighting power density (currently ${report.energyAnalysis.lpd.toFixed(1)} W/m²). Consider using more efficient luminaires, implementing daylight harvesting, or using controls to reduce energy consumption.`
        });
    }
    
    if (report.energyAnalysis.efficacyRating === 'Poor' || report.energyAnalysis.efficacyRating === 'Very Poor') {
        recommendations.push({
            category: 'Energy',
            metric: 'System Efficacy',
            recommendation: `Improve system efficacy (currently ${report.energyAnalysis.systemEfficacy.toFixed(1)} lm/W). Select luminaires with higher efficacy light sources.`
        });
    }
    
    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push({
            category: 'General',
            recommendation: 'The lighting design meets all checked standards and has good energy performance. Consider implementing controls to further optimize energy usage.'
        });
    }
    
    return recommendations;
}

/**
 * Generate PDF report
 * @param {Object} report - Report data
 */
export async function generatePDFReport(report) {
    try {
        // In a real implementation, this would use a PDF generation library
        // For this example, we'll simulate the process
        
        console.log('Generating PDF report...');
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a blob object that would represent the PDF
        const pdfBlob = new Blob(['PDF Report Content'], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.projectInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Error generating PDF report:', error);
        throw error;
    }
}

/**
 * Generate HTML report
 * @param {Object} report - Report data
 * @returns {string} - HTML report content
 */
export function generateHTMLReport(report) {
    // Create HTML content
    let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CalQLux Report: ${report.projectInfo.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #2962ff;
                }
                h1 {
                    color: #2962ff;
                }
                h2 {
                    color: #0039cb;
                    margin-top: 30px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #ddd;
                }
                h3 {
                    color: #0039cb;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .section {
                    margin-bottom: 30px;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                .metric-card {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 15px;
                    background-color: #f9f9f9;
                }
                .metric-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2962ff;
                }
                .metric-name {
                    font-size: 14px;
                    color: #666;
                }
                .compliant {
                    color: #00c853;
                }
                .non-compliant {
                    color: #ff1744;
                }
                .recommendation {
                    background-color: #e3f2fd;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                }
                .energy-rating {
                    font-weight: bold;
                }
                .rating-excellent {
                    color: #00c853;
                }
                .rating-good {
                    color: #64dd17;
                }
                .rating-acceptable {
                    color: #ffd600;
                }
                .rating-poor {
                    color: #ff9100;
                }
                .rating-verypoor {
                    color: #ff1744;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CalQLux Lighting Design Report</h1>
                <p>${new Date(report.projectInfo.date).toLocaleString()}</p>
            </div>
            
            <div class="section">
                <h2>Project Information</h2>
                <table>
                    <tr>
                        <th>Project Name</th>
                        <td>${report.projectInfo.name}</td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>${report.projectInfo.description || 'No description provided'}</td>
                    </tr>
                    <tr>
                        <th>Space Type</th>
                        <td>${report.complianceAnalysis.spaceTypeName || report.projectInfo.spaceType}</td>
                    </tr>
                    <tr>
                        <th>Date</th>
                        <td>${new Date(report.projectInfo.date).toLocaleDateString()}</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <h2>Room Information</h2>
                <table>
                    <tr>
                        <th>Length</th>
                        <td>${report.roomInfo.length} m</td>
                    </tr>
                    <tr>
                        <th>Width</th>
                        <td>${report.roomInfo.width} m</td>
                    </tr>
                    <tr>
                        <th>Height</th>
                        <td>${report.roomInfo.height} m</td>
                    </tr>
                    <tr>
                        <th>Work Plane Height</th>
                        <td>${report.roomInfo.workPlaneHeight} m</td>
                    </tr>
                    <tr>
                        <th>Floor Area</th>
                        <td>${(report.roomInfo.length * report.roomInfo.width).toFixed(1)} m²</td>
                    </tr>
                    <tr>
                        <th>Ceiling Reflectance</th>
                        <td>${(report.roomInfo.reflectances.ceiling * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                        <th>Wall Reflectance</th>
                        <td>${(report.roomInfo.reflectances.walls * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                        <th>Floor Reflectance</th>
                        <td>${(report.roomInfo.reflectances.floor * 100).toFixed(0)}%</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <h2>Luminaire Information</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Power (W)</th>
                            <th>Flux (lm)</th>
                            <th>Efficacy (lm/W)</th>
                            <th>CCT (K)</th>
                            <th>CRI</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Add luminaire rows
    report.luminaireInfo.forEach(luminaire => {
        html += `
            <tr>
                <td>${luminaire.name}</td>
                <td>${luminaire.quantity}</td>
                <td>${luminaire.wattage}</td>
                <td>${luminaire.luminousFlux.toLocaleString()}</td>
                <td>${luminaire.efficacy}</td>
                <td>${luminaire.colorTemperature}</td>
                <td>${luminaire.cri}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>Calculation Results</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${report.calculationResults.average} lx</div>
                        <div class="metric-name">Average Illuminance</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.calculationResults.min} lx</div>
                        <div class="metric-name">Minimum Illuminance</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.calculationResults.max} lx</div>
                        <div class="metric-name">Maximum Illuminance</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.calculationResults.uniformity.toFixed(2)}</div>
                        <div class="metric-name">Uniformity Ratio (Min/Avg)</div>
                    </div>
    `;
    
    // Add UGR if available
    if (report.calculationResults.ugr) {
        html += `
            <div class="metric-card">
                <div class="metric-value">${report.calculationResults.ugr.toFixed(1)}</div>
                <div class="metric-name">UGR (Unified Glare Rating)</div>
            </div>
        `;
    }
    
    // Add VCP if available
    if (report.calculationResults.vcp) {
        html += `
            <div class="metric-card">
                <div class="metric-value">${report.calculationResults.vcp.toFixed(1)}%</div>
                <div class="metric-name">VCP (Visual Comfort Probability)</div>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            
            <div class="section">
                <h2>Compliance Analysis</h2>
    `;
    
    // Add compliance information
    if (report.complianceAnalysis.standardsChecked.length === 0) {
        html += `<p>No compliance standards were checked for this space type.</p>`;
    } else {
        report.complianceAnalysis.standardsChecked.forEach(standard => {
            html += `
                <h3>${standard.name}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Requirement</th>
                            <th>Actual</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            standard.metrics.forEach(metric => {
                const statusClass = metric.compliant ? 'compliant' : 'non-compliant';
                const statusText = metric.compliant ? 'Compliant' : 'Non-compliant';
                
                html += `
                    <tr>
                        <td>${metric.name}</td>
                        <td>${metric.required}</td>
                        <td>${metric.actual}</td>
                        <td class="${statusClass}">${statusText}</td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        });
    }
    
    html += `
            </div>
            
            <div class="section">
                <h2>Energy Analysis</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${report.energyAnalysis.totalPower.toFixed(1)} W</div>
                        <div class="metric-name">Total Connected Load</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.energyAnalysis.lpd.toFixed(1)} W/m²</div>
                        <div class="metric-name">Lighting Power Density <span class="energy-rating rating-${report.energyAnalysis.lpdRating.toLowerCase().replace(' ', '')}">(${report.energyAnalysis.lpdRating})</span></div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.energyAnalysis.systemEfficacy.toFixed(1)} lm/W</div>
                        <div class="metric-name">System Efficacy <span class="energy-rating rating-${report.energyAnalysis.efficacyRating.toLowerCase().replace(' ', '')}">(${report.energyAnalysis.efficacyRating})</span></div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.energyAnalysis.annualEnergy.toFixed(0)} kWh</div>
                        <div class="metric-name">Annual Energy Consumption</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${report.energyAnalysis.annualCost.toFixed(2)}</div>
                        <div class="metric-name">Annual Energy Cost</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.energyAnalysis.fixtureCount}</div>
                        <div class="metric-name">Total Fixture Count</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Recommendations</h2>
    `;
    
    // Add recommendations
    if (report.recommendations.length === 0) {
        html += `<p>No recommendations to display.</p>`;
    } else {
        report.recommendations.forEach(recommendation => {
            html += `
                <div class="recommendation">
                    <strong>${recommendation.category}${recommendation.metric ? ' - ' + recommendation.metric : ''}${recommendation.standard ? ' - ' + recommendation.standard : ''}</strong>
                    <p>${recommendation.recommendation}</p>
                </div>
            `;
        });
    }
    
    html += `
            </div>
            
            <div class="footer">
                <p>Generated by CalQLux - Illumination Design Calculator</p>
                <p>Report Date: ${new Date(report.projectInfo.date).toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;
    
    return html;
}

/**
 * Display report in UI
 * @param {Object} report - Report data
 * @param {HTMLElement} container - Container element for displaying report
 */
export function displayReport(report, container) {
    // Create tabs for different sections
    container.innerHTML = `
        <div class="report-header">
            <h2>Lighting Design Report: ${report.projectInfo.name}</h2>
            <div class="report-actions">
                <button id="export-pdf-report" class="btn-primary">Export as PDF</button>
                <button id="export-html-report" class="btn-secondary">Export as HTML</button>
            </div>
        </div>
        
        <div class="report-tabs">
            <div class="tab-headers">
                <button class="tab-btn active" data-tab="summary">Summary</button>
                <button class="tab-btn" data-tab="compliance">Compliance</button>
                <button class="tab-btn" data-tab="energy">Energy</button>
                <button class="tab-btn" data-tab="recommendations">Recommendations</button>
            </div>
            
            <div class="tab-content">
                <div class="tab-panel active" id="summary-tab">
                    ${generateSummaryTab(report)}
                </div>
                <div class="tab-panel" id="compliance-tab">
                    ${generateComplianceTab(report)}
                </div>
                <div class="tab-panel" id="energy-tab">
                    ${generateEnergyTab(report)}
                </div>
                <div class="tab-panel" id="recommendations-tab">
                    ${generateRecommendationsTab(report)}
                </div>
            </div>
        </div>
    `;
    
    // Set up event listeners for tabs
    const tabButtons = container.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            container.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding panel
            const tabId = button.dataset.tab + '-tab';
            container.querySelector(`#${tabId}`).classList.add('active');
        });
    });
    
    // Set up event listeners for export buttons
    const pdfButton = container.querySelector('#export-pdf-report');
    pdfButton.addEventListener('click', async () => {
        try {
            await generatePDFReport(report);
            showToast('PDF report exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showToast('Error exporting PDF report', 'error');
        }
    });
    
    const htmlButton = container.querySelector('#export-html-report');
    htmlButton.addEventListener('click', () => {
        try {
            const htmlContent = generateHTMLReport(report);
            
            // Create blob and download
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.projectInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('HTML report exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting HTML:', error);
            showToast('Error exporting HTML report', 'error');
        }
    });
}

/**
 * Generate summary tab content
 * @param {Object} report - Report data
 * @returns {string} - HTML content
 */
function generateSummaryTab(report) {
    return `
        <div class="summary-section">
            <div class="project-info-card">
                <h3>Project Details</h3>
                <table>
                    <tr>
                        <th>Name:</th>
                        <td>${report.projectInfo.name}</td>
                    </tr>
                    <tr>
                        <th>Description:</th>
                        <td>${report.projectInfo.description || 'None'}</td>
                    </tr>
                    <tr>
                        <th>Space Type:</th>
                        <td>${report.complianceAnalysis.spaceTypeName || report.projectInfo.spaceType}</td>
                    </tr>
                    <tr>
                        <th>Room Size:</th>
                        <td>${report.roomInfo.length} m × ${report.roomInfo.width} m × ${report.roomInfo.height} m</td>
                    </tr>
                    <tr>
                        <th>Floor Area:</th>
                        <td>${(report.roomInfo.length * report.roomInfo.width).toFixed(1)} m²</td>
                    </tr>
                </table>
            </div>
            
            <h3>Key Results</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${report.calculationResults.average} lx</div>
                    <div class="metric-name">Average Illuminance</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${report.calculationResults.uniformity.toFixed(2)}</div>
                    <div class="metric-name">Uniformity (Min/Avg)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${report.energyAnalysis.lpd.toFixed(1)} W/m²</div>
                    <div class="metric-name">Power Density</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${report.energyAnalysis.fixtureCount}</div>
                    <div class="metric-name">Fixture Count</div>
                </div>
            </div>
            
            <h3>Compliance Summary</h3>
            <div class="compliance-summary">
                ${report.complianceAnalysis.compliantWith.length > 0 ? 
                `<p><strong>Compliant with:</strong> ${report.complianceAnalysis.compliantWith.join(', ')}</p>` : 
                ''}
                
                ${report.complianceAnalysis.nonCompliantWith.length > 0 ? 
                `<p><strong>Non-compliant with:</strong> ${report.complianceAnalysis.nonCompliantWith.join(', ')}</p>` : 
                ''}
                
                ${report.complianceAnalysis.compliantWith.length === 0 && report.complianceAnalysis.nonCompliantWith.length === 0 ?
                '<p>No standards were checked for compliance.</p>' :
                ''}
            </div>
            
            <h3>Key Recommendations</h3>
            <div class="recommendations-summary">
                ${report.recommendations.length > 0 ?
                `<ul>${report.recommendations.map(rec => `<li>${rec.recommendation}</li>`).join('')}</ul>` :
                '<p>No recommendations to display.</p>'}
            </div>
        </div>
    `;
}

/**
 * Generate compliance tab content
 * @param {Object} report - Report data
 * @returns {string} - HTML content
 */
function generateComplianceTab(report) {
    if (report.complianceAnalysis.standardsChecked.length === 0) {
        return `
            <div class="compliance-section">
                <p>No compliance standards were checked for this space type.</p>
            </div>
        `;
    }
    
    let html = `
        <div class="compliance-section">
            <h3>Compliance Analysis for ${report.complianceAnalysis.spaceTypeName || report.projectInfo.spaceType}</h3>
    `;
    
    report.complianceAnalysis.standardsChecked.forEach(standard => {
        const compliantMetrics = standard.metrics.filter(m => m.compliant);
        const nonCompliantMetrics = standard.metrics.filter(m => !m.compliant);
        
        html += `
            <div class="standard-card">
                <h4>${standard.name}</h4>
                <div class="compliance-status ${compliantMetrics.length === standard.metrics.length ? 'compliant' : 'non-compliant'}">
                    ${compliantMetrics.length === standard.metrics.length ? 
                    '✓ Fully Compliant' : 
                    `⚠️ ${nonCompliantMetrics.length} of ${standard.metrics.length} metrics non-compliant`}
                </div>
                
                <table class="compliance-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Requirement</th>
                            <th>Actual</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        standard.metrics.forEach(metric => {
            const statusClass = metric.compliant ? 'compliant' : 'non-compliant';
            const statusText = metric.compliant ? '✓ Compliant' : '✗ Non-compliant';
            
            html += `
                <tr>
                    <td>${metric.name}</td>
                    <td>${metric.required}</td>
                    <td>${metric.actual}</td>
                    <td class="${statusClass}">${statusText}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    html += `</div>`;
    
    return html;
}

/**
 * Generate energy tab content
 * @param {Object} report - Report data
 * @returns {string} - HTML content
 */
function generateEnergyTab(report) {
    const energy = report.energyAnalysis;
    
    return `
        <div class="energy-section">
            <h3>Energy Performance</h3>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${energy.totalPower.toFixed(1)} W</div>
                    <div class="metric-name">Total Connected Load</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${energy.lpd.toFixed(1)} W/m²</div>
                    <div class="metric-name">Lighting Power Density</div>
                    <div class="rating energy-rating rating-${energy.lpdRating.toLowerCase().replace(' ', '')}">${energy.lpdRating}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${energy.systemEfficacy.toFixed(1)} lm/W</div>
                    <div class="metric-name">System Efficacy</div>
                    <div class="rating energy-rating rating-${energy.efficacyRating.toLowerCase().replace(' ', '')}">${energy.efficacyRating}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${energy.luminousDensity.toFixed(0)} lm/m²</div>
                    <div class="metric-name">Luminous Density</div>
                </div>
            </div>
            
            <h3>Annual Energy Analysis</h3>
            <p>Based on operation of 10 hours per day, 250 days per year</p>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${energy.annualEnergy.toFixed(0)} kWh</div>
                    <div class="metric-name">Annual Energy Consumption</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">$${energy.annualCost.toFixed(2)}</div>
                    <div class="metric-name">Annual Energy Cost</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(energy.annualEnergy / (report.roomInfo.length * report.roomInfo.width)).toFixed(1)} kWh/m²</div>
                    <div class="metric-name">Annual Energy per Area</div>
                </div>
            </div>
            
            <h3>Luminaire Summary</h3>
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Power (W)</th>
                        <th>Total Power (W)</th>
                        <th>Flux (lm)</th>
                        <th>Total Flux (lm)</th>
                        <th>Efficacy (lm/W)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    report.luminaireInfo.forEach(luminaire => {
        const totalPower = luminaire.wattage * luminaire.quantity;
        const totalFlux = luminaire.luminousFlux * luminaire.quantity;
        
        return `
            <tr>
                <td>${luminaire.name}</td>
                <td>${luminaire.quantity}</td>
                <td>${luminaire.wattage}</td>
                <td>${totalPower}</td>
                <td>${luminaire.luminousFlux.toLocaleString()}</td>
                <td>${totalFlux.toLocaleString()}</td>
                <td>${luminaire.efficacy}</td>
            </tr>
        `;
    });
    
    return `
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Generate recommendations tab content
 * @param {Object} report - Report data
 * @returns {string} - HTML content
 */
function generateRecommendationsTab(report) {
    if (report.recommendations.length === 0) {
        return `
            <div class="recommendations-section">
                <p>No recommendations to display.</p>
            </div>
        `;
    }
    
    let html = `
        <div class="recommendations-section">
            <h3>Recommendations</h3>
    `;
    
    // Group recommendations by category
    const categorizedRecs = {};
    report.recommendations.forEach(rec => {
        if (!categorizedRecs[rec.category]) {
            categorizedRecs[rec.category] = [];
        }
        categorizedRecs[rec.category].push(rec);
    });
    
    // Generate HTML for each category
    Object.keys(categorizedRecs).forEach(category => {
        html += `
            <div class="recommendation-category">
                <h4>${category} Recommendations</h4>
        `;
        
        categorizedRecs[category].forEach(rec => {
            html += `
                <div class="recommendation">
                    <strong>${rec.metric || ''} ${rec.standard ? '(' + rec.standard + ')' : ''}</strong>
                    <p>${rec.recommendation}</p>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    html += `</div>`;
    
    return html;
}

/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.getElementById('toasts');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toasts';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}