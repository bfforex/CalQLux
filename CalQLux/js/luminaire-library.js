/**
 * CalQLux - Standard Luminaires Library
 * Collection of pre-defined luminaires with IES data
 */

export const standardLuminaires = [
    {
        id: 'ce-2x40w-led',
        name: '2 x 40W Louver Type Ceiling Mount LED',
        description: 'Standard office fixture with low glare louvers, suitable for office spaces and classrooms',
        type: 'ceiling',
        wattage: 80, // 2 x 40W
        dimensions: {
            length: 1.2, // meters
            width: 0.6,  // meters
            height: 0.08 // meters
        },
        luminousFlux: 8500, // lumens
        efficacy: 106.25, // lm/W
        colorTemperature: 4000, // K
        cri: 80, // Color Rendering Index
        beamAngle: 120, // degrees
        iesFile: 'ies/ce-2x40w-led.ies',
        thumbnail: 'assets/thumbnails/ce-2x40w-led.png',
        category: 'office'
    },
    {
        id: 'hb-500w-led',
        name: '500W High-bay Industrial LED',
        description: 'High-output industrial fixture for warehouses and manufacturing spaces with high ceilings',
        type: 'highbay',
        wattage: 500,
        dimensions: {
            diameter: 0.5, // meters
            height: 0.25  // meters
        },
        luminousFlux: 65000, // lumens
        efficacy: 130, // lm/W
        colorTemperature: 5000, // K
        cri: 75, // Color Rendering Index
        beamAngle: 90, // degrees
        iesFile: 'ies/hb-500w-led.ies',
        thumbnail: 'assets/thumbnails/hb-500w-led.png',
        category: 'industrial'
    },
    {
        id: 'fl-250w-led',
        name: '250W LED Floodlight',
        description: 'Outdoor floodlight suitable for building facades, parking lots and sports fields',
        type: 'floodlight',
        wattage: 250,
        dimensions: {
            length: 0.4, // meters
            width: 0.3,  // meters
            height: 0.15 // meters
        },
        luminousFlux: 35000, // lumens
        efficacy: 140, // lm/W
        colorTemperature: 5700, // K
        cri: 70, // Color Rendering Index
        beamAngle: 60, // degrees
        iesFile: 'ies/fl-250w-led.ies',
        thumbnail: 'assets/thumbnails/fl-250w-led.png',
        category: 'outdoor'
    },
    {
        id: 'dl-30w-led',
        name: '30W LED Downlight',
        description: 'Recessed downlight for general lighting in retail, hospitality and residential spaces',
        type: 'downlight',
        wattage: 30,
        dimensions: {
            diameter: 0.2, // meters
            height: 0.1   // meters
        },
        luminousFlux: 3600, // lumens
        efficacy: 120, // lm/W
        colorTemperature: 3000, // K
        cri: 90, // Color Rendering Index
        beamAngle: 60, // degrees
        iesFile: 'ies/dl-30w-led.ies',
        thumbnail: 'assets/thumbnails/dl-30w-led.png',
        category: 'commercial'
    },
    {
        id: 'lp-60w-led',
        name: '60W LED Linear Pendant',
        description: 'Suspended linear fixture for offices, conference rooms and educational spaces',
        type: 'pendant',
        wattage: 60,
        dimensions: {
            length: 1.5, // meters
            width: 0.1,  // meters
            height: 0.05 // meters
        },
        luminousFlux: 7200, // lumens
        efficacy: 120, // lm/W
        colorTemperature: 4000, // K
        cri: 85, // Color Rendering Index
        beamAngle: 120, // degrees
        iesFile: 'ies/lp-60w-led.ies',
        thumbnail: 'assets/thumbnails/lp-60w-led.png',
        category: 'office'
    },
    {
        id: 'tr-20w-led',
        name: '20W LED Track Light',
        description: 'Adjustable track fixture for accent lighting in retail and gallery spaces',
        type: 'track',
        wattage: 20,
        dimensions: {
            diameter: 0.12, // meters
            length: 0.18    // meters
        },
        luminousFlux: 2200, // lumens
        efficacy: 110, // lm/W
        colorTemperature: 3000, // K
        cri: 95, // Color Rendering Index
        beamAngle: 25, // degrees
        iesFile: 'ies/tr-20w-led.ies',
        thumbnail: 'assets/thumbnails/tr-20w-led.png',
        category: 'retail'
    },
    {
        id: 'wb-40w-led',
        name: '40W LED Wall Wash',
        description: 'Linear wall wash fixture for highlighting vertical surfaces in museums and architectural spaces',
        type: 'wallwash',
        wattage: 40,
        dimensions: {
            length: 1.0, // meters
            width: 0.08,  // meters
            height: 0.06 // meters
        },
        luminousFlux: 4500, // lumens
        efficacy: 112.5, // lm/W
        colorTemperature: 3500, // K
        cri: 92, // Color Rendering Index
        beamAngle: 120, // degrees (asymmetric)
        iesFile: 'ies/wb-40w-led.ies',
        thumbnail: 'assets/thumbnails/wb-40w-led.png',
        category: 'architectural'
    },
    {
        id: 'hl-100w-led',
        name: '100W LED High Lumen Panel',
        description: 'High-output flat panel for offices, healthcare, and educational facilities',
        type: 'panel',
        wattage: 100,
        dimensions: {
            length: 1.2, // meters
            width: 0.6,  // meters
            height: 0.05 // meters
        },
        luminousFlux: 12000, // lumens
        efficacy: 120, // lm/W
        colorTemperature: 4000, // K
        cri: 85, // Color Rendering Index
        beamAngle: 120, // degrees
        iesFile: 'ies/hl-100w-led.ies',
        thumbnail: 'assets/thumbnails/hl-100w-led.png',
        category: 'office'
    }
];

/**
 * Get luminaire by ID
 * @param {string} id - Luminaire ID
 * @returns {Object} - Luminaire data or null if not found
 */
export function getLuminaire(id) {
    return standardLuminaires.find(luminaire => luminaire.id === id) || null;
}

/**
 * Get luminaires by category
 * @param {string} category - Category name
 * @returns {Array} - Array of luminaires in the category
 */
export function getLuminairesByCategory(category) {
    return standardLuminaires.filter(luminaire => luminaire.category === category);
}

/**
 * Search luminaires by name or description
 * @param {string} query - Search query
 * @returns {Array} - Array of matching luminaires
 */
export function searchLuminaires(query) {
    const lowercaseQuery = query.toLowerCase();
    
    return standardLuminaires.filter(luminaire => 
        luminaire.name.toLowerCase().includes(lowercaseQuery) || 
        luminaire.description.toLowerCase().includes(lowercaseQuery)
    );
}

/**
 * Get all luminaire categories
 * @returns {Array} - Array of unique categories
 */
export function getAllCategories() {
    const categories = new Set();
    
    standardLuminaires.forEach(luminaire => {
        categories.add(luminaire.category);
    });
    
    return Array.from(categories);
}

/**
 * Load IES data for a luminaire
 * @param {string} id - Luminaire ID
 * @returns {Promise} - Promise resolving to IES data
 */
export async function loadLuminaireIES(id) {
    const luminaire = getLuminaire(id);
    
    if (!luminaire) {
        throw new Error(`Luminaire with ID ${id} not found`);
    }
    
    try {
        const response = await fetch(luminaire.iesFile);
        
        if (!response.ok) {
            throw new Error(`Failed to load IES file: ${response.statusText}`);
        }
        
        const iesData = await response.text();
        return IESParser.parse(iesData);
    } catch (error) {
        console.error('Error loading IES file:', error);
        throw error;
    }
}

/**
 * Create luminaire library UI
 * @param {HTMLElement} container - Container element for the library UI
 * @param {Function} onSelect - Callback when luminaire is selected
 */
export function createLuminaireLibraryUI(container, onSelect) {
    // Create category filter
    const categories = getAllCategories();
    
    const categoryFilter = document.createElement('div');
    categoryFilter.className = 'category-filter';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Filter by Category:';
    categoryFilter.appendChild(categoryLabel);
    
    const categorySelect = document.createElement('select');
    categorySelect.id = 'category-select';
    
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categorySelect.appendChild(allOption);
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
    
    categoryFilter.appendChild(categorySelect);
    container.appendChild(categoryFilter);
    
    // Create search box
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search luminaires...';
    searchInput.id = 'luminaire-search';
    
    searchBox.appendChild(searchInput);
    container.appendChild(searchBox);
    
    // Create luminaire grid
    const luminaireGrid = document.createElement('div');
    luminaireGrid.className = 'luminaire-grid';
    container.appendChild(luminaireGrid);
    
    // Populate grid with all luminaires initially
    populateLuminaireGrid(luminaireGrid, standardLuminaires, onSelect);
    
    // Set up event listeners
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        const query = searchInput.value.trim();
        
        filterLuminaires(luminaireGrid, category, query, onSelect);
    });
    
    searchInput.addEventListener('input', () => {
        const category = categorySelect.value;
        const query = searchInput.value.trim();
        
        filterLuminaires(luminaireGrid, category, query, onSelect);
    });
}

/**
 * Populate luminaire grid with filtered luminaires
 * @param {HTMLElement} grid - Grid container element
 * @param {Array} luminaires - Array of luminaires to display
 * @param {Function} onSelect - Callback when luminaire is selected
 */
function populateLuminaireGrid(grid, luminaires, onSelect) {
    grid.innerHTML = '';
    
    if (luminaires.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No luminaires found';
        grid.appendChild(noResults);
        return;
    }
    
    luminaires.forEach(luminaire => {
        const card = document.createElement('div');
        card.className = 'luminaire-card';
        card.dataset.id = luminaire.id;
        
        const thumbnail = document.createElement('img');
        thumbnail.src = luminaire.thumbnail;
        thumbnail.alt = luminaire.name;
        card.appendChild(thumbnail);
        
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        
        const title = document.createElement('h3');
        title.textContent = luminaire.name;
        cardContent.appendChild(title);
        
        const specs = document.createElement('div');
        specs.className = 'specs';
        
        specs.innerHTML = `
            <div><span>Power:</span> ${luminaire.wattage}W</div>
            <div><span>Output:</span> ${luminaire.luminousFlux.toLocaleString()} lm</div>
            <div><span>Efficacy:</span> ${luminaire.efficacy} lm/W</div>
            <div><span>CCT:</span> ${luminaire.colorTemperature}K</div>
        `;
        
        cardContent.appendChild(specs);
        card.appendChild(cardContent);
        
        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn-primary select-luminaire';
        selectBtn.textContent = 'Select';
        card.appendChild(selectBtn);
        
        // Add event listener
        card.addEventListener('click', () => {
            onSelect(luminaire);
        });
        
        grid.appendChild(card);
    });
}

/**
 * Filter luminaires based on category and search query
 * @param {HTMLElement} grid - Grid container element
 * @param {string} category - Category to filter by ('all' for all categories)
 * @param {string} query - Search query
 * @param {Function} onSelect - Callback when luminaire is selected
 */
function filterLuminaires(grid, category, query, onSelect) {
    let filteredLuminaires = standardLuminaires;
    
    // Filter by category
    if (category !== 'all') {
        filteredLuminaires = filteredLuminaires.filter(luminaire => 
            luminaire.category === category
        );
    }
    
    // Filter by search query
    if (query) {
        const lowercaseQuery = query.toLowerCase();
        
        filteredLuminaires = filteredLuminaires.filter(luminaire => 
            luminaire.name.toLowerCase().includes(lowercaseQuery) || 
            luminaire.description.toLowerCase().includes(lowercaseQuery)
        );
    }
    
    // Update grid
    populateLuminaireGrid(grid, filteredLuminaires, onSelect);
}