# CalQLux - Illumination Design Calculator

## Overview

CalQLux is a sophisticated web-based application designed for lighting design professionals and engineers. It allows users to calculate, visualize, and analyze illumination levels in indoor spaces using industry-standard methods including point-by-point calculations and coefficient of utilization.

## Features

- **Multiple Calculation Methods**:
  - Point-by-point calculation
  - Average illuminance calculation
  - Coefficient of utilization
  - Uniformity ratio analysis
  - Luminance calculations

- **Rich Visualization Tools**:
  - Illuminance heatmaps
  - Isoline contour visualization
  - 3D illuminance visualization
  - Data grid view of results

- **Luminaire Management**:
  - Built-in luminaire library
  - IES file import support
  - Custom luminaire configuration

- **User-Friendly Interface**:
  - Responsive design for desktop and mobile
  - Dark/light theme support
  - Unit conversion (meters/feet, lux/footcandles)
  - Project saving and loading capabilities

## Technical Details

CalQLux is built using modern web technologies:

- Pure JavaScript (ES6+) for calculations and interactivity
- HTML5 and CSS3 for responsive layout and styling
- Chart.js for data visualization
- Local Storage API for saving preferences and projects
- Module-based architecture for maintainability

## Getting Started

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/bfforex/CalQLux.git
   ```

2. Open the project directory:
   ```bash
   cd CalQLux
   ```

3. Launch the application by opening `index.html` in a modern web browser.

### Usage

1. Select a calculation type from the sidebar.
2. Enter room dimensions, surface reflectances, and luminaire configurations.
3. Configure calculation parameters (grid spacing, etc.).
4. Click "Calculate" to perform the calculation.
5. View results in the visualization tabs (Illuminance Map, Isolines, 3D View, Data Grid).
6. Export results as CSV or PDF if needed.

## Structure

The project is organized as follows:

```
CalQLux/
├── css/                   # Stylesheets
│   ├── normalize.css      # CSS reset
│   └── styles.css         # Main application styles
├── js/                    # JavaScript modules
│   ├── app.js             # Main application entry point
│   ├── ui.js              # UI initialization and management
│   ├── calculations/      # Calculation modules
│   │   └── index.js       # Entry point for calculation functions
│   ├── visualization/     # Visualization modules
│   │   ├── charts.js      # Chart configurations
│   │   ├── diagrams.js    # Diagram rendering
│   │   └── index.js       # Entry point for visualization functions
│   ├── luminaire-library.js  # Luminaire management
│   ├── project-management.js # Project save/load functionality
│   └── report-generator.js   # PDF report generation
├── lib/                   # Third-party libraries
│   ├── chart.js           # Chart.js library
│   └── ies-parser.js      # IES file parser
├── assets/                # Images and icons
│   └── icons/             # Application icons
└── index.html             # Main HTML file
```

## Calculation Methods

### Point-by-Point

This method calculates illuminance at specific points in a space using the inverse-square law and candlepower distribution data from luminaires. It provides the most accurate representation of lighting distribution.

### Average Illuminance

Uses the lumen method to calculate the average illuminance in a space based on total lumens, room dimensions, and surface reflectances.

### Coefficient of Utilization

Calculates the efficiency of light transfer from luminaires to the work plane, accounting for room configuration and surface reflectances.

### Uniformity Ratio

Evaluates the uniformity of illuminance distribution by calculating ratios of minimum, maximum, and average illuminance values.

## Browser Compatibility

CalQLux works best with modern browsers:
- Chrome (latest version)
- Firefox (latest version)
- Edge (latest version)
- Safari (latest version)

## Future Developments

- Support for outdoor lighting calculations
- Daylight integration
- Energy consumption analysis
- Expanded luminaire library
- User account system for cloud storage of projects

## License

Copyright © 2025 CalQLux

All rights reserved. This project and its contents are protected by copyright law.

---

For questions or support, please contact us at support@calqlux.com.