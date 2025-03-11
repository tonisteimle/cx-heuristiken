/**
 * Icon Selector
 * Provides functionality for selecting Material Icons in the admin interface
 */

// Array of common Material Icons for quick selection
const popularIcons = [
    'psychology', 'format_align_center', 'error_outline', 'memory', 'school', 
    'navigation', 'accessibility', 'language', 'devices', 'speed', 'palette', 
    'visibility', 'sentiment_satisfied', 'search', 'account_circle', 'touch_app',
    'thumb_up', 'build', 'star', 'lightbulb', 'extension', 'widgets', 'layers',
    'schedule', 'trending_up', 'filter_list', 'settings', 'text_format', 'brush'
];

/**
 * Creates an icon selector interface
 * @param {HTMLElement|Object} containerElementOrConfig - The container element or config object
 * @param {Function} [onSelectCallback] - Callback function when an icon is selected
 * @param {string} [initialIcon] - Initial selected icon (optional)
 * @returns {Object} Object with methods to control the icon selector
 */
function createIconSelector(containerElementOrConfig, onSelectCallback, initialIcon = null) {
    let containerElement;
    let onSelect = onSelectCallback;
    let selectedIcon = initialIcon;
    let currentCategory = 'all';
    
    // Check if the first argument is an object (config) or a DOM element
    if (containerElementOrConfig && typeof containerElementOrConfig === 'object' && !(containerElementOrConfig instanceof Element)) {
        // It's a config object
        const config = containerElementOrConfig;
        containerElement = config.container;
        onSelect = config.onSelect || onSelect;
        selectedIcon = config.selectedIcon || selectedIcon;
    } else {
        // It's a DOM element
        containerElement = containerElementOrConfig;
    }
    
    // Handle direct container or get the icon-selection container 
    if (!containerElement) {
        console.error('Icon selector container element not found');
        return {
            setSelectedIcon: () => {},
            getSelectedIcon: () => '',
            refresh: () => {}
        };
    }
    
    // If containerElement is a container but not the icon-selection itself, get the icon-selection child
    const selectorContainer = containerElement.classList.contains('icon-selection') ? 
        containerElement : 
        containerElement.querySelector('.icon-selection');
        
    if (!selectorContainer) {
        console.error('Icon selection container not found');
        return {
            setSelectedIcon: () => {},
            getSelectedIcon: () => '',
            refresh: () => {}
        };
    }
    
    // Get elements from the container
    const searchInput = selectorContainer.querySelector('#iconSearch');
    const iconGrid = selectorContainer.querySelector('#iconGrid');
    const selectedIconDisplay = selectorContainer.querySelector('#selectedIcon');
    const selectedIconName = selectorContainer.querySelector('#selectedIconName');
    
    let currentSelectedIcon = selectedIcon || '';
    let allIcons = [];
    
    // Initialize with Material Icons library from the global scope
    if (window.materialIcons && Array.isArray(window.materialIcons)) {
        allIcons = window.materialIcons;
    } else {
        // Fallback to popular icons if the full library isn't available
        allIcons = popularIcons;
        console.warn('Material Icons library not found, using limited icon set');
    }
    
    // Create category tabs
    const createCategoryTabs = () => {
        // Create the category tabs container
        const categoryTabsContainer = document.createElement('div');
        categoryTabsContainer.className = 'icon-category-tabs';
        
        // If window.iconCategories exists, use it
        if (window.iconCategories && Array.isArray(window.iconCategories)) {
            window.iconCategories.forEach(category => {
                const tabElement = document.createElement('div');
                tabElement.className = 'icon-category-tab';
                if (category.id === currentCategory) {
                    tabElement.classList.add('active');
                }
                tabElement.dataset.category = category.id;
                tabElement.textContent = category.name;
                
                tabElement.addEventListener('click', () => {
                    // Remove active class from all tabs
                    document.querySelectorAll('.icon-category-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    tabElement.classList.add('active');
                    
                    // Update current category
                    currentCategory = category.id;
                    
                    // Filter icons by category and search term
                    filterIcons();
                });
                
                categoryTabsContainer.appendChild(tabElement);
            });
            
            // Insert before icon grid
            const existingTabs = selectorContainer.querySelector('.icon-category-tabs');
            if (existingTabs) {
                existingTabs.remove();
            }
            
            if (searchInput && searchInput.parentNode) {
                searchInput.parentNode.insertBefore(categoryTabsContainer, searchInput.nextSibling);
            }
        }
    };
    
    // Filter icons based on current search term and selected category
    const filterIcons = () => {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        let filteredIcons = [];
        
        // First filter by category
        if (currentCategory === 'all') {
            filteredIcons = allIcons;
        } else if (window.materialIconsByCategory && window.materialIconsByCategory[currentCategory]) {
            filteredIcons = window.materialIconsByCategory[currentCategory];
        } else {
            filteredIcons = allIcons;
        }
        
        // Then filter by search term if present
        if (searchTerm) {
            filteredIcons = filteredIcons.filter(icon => 
                icon.toLowerCase().includes(searchTerm)
            );
        }
        
        // Limit to a reasonable number if no search term
        if (!searchTerm && filteredIcons.length > 100) {
            filteredIcons = filteredIcons.slice(0, 100);
        }
        
        // Populate the grid with filtered icons
        populateIconGrid(filteredIcons);
    };
    
    // Create category tabs
    createCategoryTabs();
    
    // Set initial selected icon if provided
    if (selectedIcon) {
        updateSelectedIcon(selectedIcon);
    }
    
    // Initially show popular icons or category icons
    if (window.materialIconsByCategory && window.materialIconsByCategory[currentCategory]) {
        const categoryIcons = window.materialIconsByCategory[currentCategory];
        populateIconGrid(categoryIcons.slice(0, 100)); // Show first 100 icons in category
    } else {
        populateIconGrid(popularIcons);
    }
    
    // Event listener for the search input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterIcons();
        });
    } else {
        console.warn('Icon search input element not found');
    }
    
    
    /**
     * Populates the icon grid with the provided icons
     * @param {Array} icons - Array of icon names to display
     */
    function populateIconGrid(icons) {
        // Clear existing icons
        if (!iconGrid) {
            console.warn('Icon grid element not found');
            return;
        }
        
        iconGrid.innerHTML = '';
        
        // Add each icon to the grid
        icons.forEach(icon => {
            const iconElement = document.createElement('div');
            iconElement.className = 'icon-item';
            if (icon === currentSelectedIcon) {
                iconElement.classList.add('selected');
            }
            
            iconElement.innerHTML = `<span class="material-icons">${icon}</span>`;
            iconElement.title = icon;
            
            // Add click event to select the icon
            iconElement.addEventListener('click', () => {
                updateSelectedIcon(icon);
                
                // Call the callback with the selected icon
                if (typeof onSelect === 'function') {
                    onSelect(icon);
                }
            });
            
            iconGrid.appendChild(iconElement);
        });
    }
    
/**
 * Updates the selected icon display
 * @param {string} icon - The selected icon name
 */
function updateSelectedIcon(icon) {
    if (!icon || icon === 'undefined') {
        icon = 'help';
    }
    
    currentSelectedIcon = icon;
    
    // Update the displayed icon
    if (selectedIconDisplay) {
        const iconElement = selectedIconDisplay.querySelector('.material-icons');
        if (iconElement) {
            iconElement.textContent = icon;
        }
    }
    
    // Update the icon name
    if (selectedIconName) {
        selectedIconName.textContent = icon;
    }
    
    // Update selected state in the grid
    if (iconGrid) {
        const iconItems = iconGrid.querySelectorAll('.icon-item');
        iconItems.forEach(item => {
            if (item.title === icon) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
}
    
    // Return public methods
    return {
        /**
         * Sets the selected icon
         * @param {string} icon - The icon name to select
         */
        setSelectedIcon: function(icon) {
            updateSelectedIcon(icon);
        },
        
        /**
         * Gets the currently selected icon
         * @returns {string} The selected icon name
         */
        getSelectedIcon: function() {
            return currentSelectedIcon;
        },
        
        /**
         * Refreshes the icon grid
         */
        refresh: function() {
            filterIcons();
        }
    };
}
