// Global variables
let heuristicsData = [];
let categoriesData = [];
let currentCategory = null;
let allHeuristics = []; // Flattened list of all heuristics

// DOM elements
const categoryListElement = document.getElementById('category-list');
const heuristicsContainer = document.getElementById('heuristics-container');
const currentCategoryElement = document.getElementById('current-category');

// API URL (übereinstimmend mit data-manager.js)
const API_URL = 'http://localhost:3000/api';

// Initialize the application
function init() {
    loadDataFromAPI()
        .then(data => {
            processData(data);
            renderCategories();
            renderHeuristics();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Daten:', error);
            
            // Notfall-Fallback auf lokale Daten
            const data = getHardcodedData();
            processData(data);
            renderCategories();
            renderHeuristics();
        });
}

// Process and structure the data
function processData(data) {
    if (data.categories) {
        categoriesData = data.categories;
        
        // Extract all heuristics into a flat structure
        allHeuristics = [];
        categoriesData.forEach(category => {
            if (category.heuristics && Array.isArray(category.heuristics)) {
                category.heuristics.forEach(heuristic => {
                    // Add category information to each heuristic
                    allHeuristics.push({
                        ...heuristic,
                        categoryId: category.id,
                        categoryName: category.name,
                        icon: heuristic.icon || category.icon // Use heuristic icon if available, otherwise category icon
                    });
                });
            }
        });
        
        // Set initial heuristics data to all heuristics
        heuristicsData = allHeuristics;
    }
}

// Load data from API
function loadDataFromAPI() {
    return fetch(`${API_URL}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server-Fehler: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            // Attempt to load from local file if API fails
            console.log('API nicht erreichbar, versuche lokale Datei zu laden...');
            return fetch('data/heuristics.json')
                .then(response => {
                    if (!response.ok) {
                        throw error; // Throw the original error if local file fails too
                    }
                    return response.json();
                });
        });
}

// Fallback: Load hardcoded data if both API and local file fail
function getHardcodedData() {
    return {
        "categories": [
            {
                "id": "usability",
                "name": "Usability",
                "icon": "hand-pointer",
                "description": "Usability-bezogene Heuristiken zur Verbesserung der Benutzerfreundlichkeit",
                "heuristics": [
                    {
                        "id": "usability-1",
                        "title": "Systemstatus klar kommunizieren",
                        "description": "Das System sollte den Benutzer immer über den aktuellen Status informieren, durch angemessenes Feedback innerhalb einer angemessenen Zeit.",
                        "examples": [
                            "Ladebalken zeigen Fortschritt bei zeitintensiven Operationen",
                            "Farbliche Kennzeichnung von Formularfeldern mit Validierungsfehlern",
                            "Bestätigungsnachrichten nach erfolgreicher Aktion"
                        ]
                    },
                    {
                        "id": "usability-2",
                        "title": "Konsistenz und Standards einhalten",
                        "description": "Benutzer sollten sich nicht fragen müssen, ob verschiedene Wörter, Situationen oder Aktionen dasselbe bedeuten. Folgen Sie Plattformkonventionen.",
                        "examples": [
                            "Konsistente Terminologie in der gesamten Anwendung",
                            "Einheitliches Farbschema für interaktive Elemente",
                            "Standardisierte Positionierung von Navigationselementen"
                        ]
                    }
                ]
            },
            {
                "id": "accessibility",
                "name": "Barrierefreiheit",
                "icon": "universal-access",
                "description": "Heuristiken zur Sicherstellung der Zugänglichkeit für alle Benutzer",
                "heuristics": [
                    {
                        "id": "accessibility-1",
                        "title": "Ausreichenden Farbkontrast bieten",
                        "description": "Text und interaktive Elemente sollten einen ausreichenden Kontrast zur Hintergrundfarbe aufweisen, um für Benutzer mit Sehbehinderungen lesbar zu sein.",
                        "examples": [
                            "Kontrastrate von mindestens 4,5:1 für normalen Text",
                            "Dunkler Text auf hellem Hintergrund oder umgekehrt",
                            "Keine Informationsvermittlung ausschließlich durch Farbe"
                        ]
                    },
                    {
                        "id": "accessibility-2",
                        "title": "Tastaturzugänglichkeit sicherstellen",
                        "description": "Alle Funktionen sollten über die Tastatur zugänglich sein, ohne dass spezifische Timing-Anforderungen für einzelne Tastenanschläge erforderlich sind.",
                        "examples": [
                            "Fokus-Indikatoren für alle interaktiven Elemente",
                            "Logische Tab-Reihenfolge durch das Interface",
                            "Keine Funktionen, die ausschließlich bei Hover oder Mausklick funktionieren"
                        ]
                    }
                ]
            }
        ]
    };
}

// Render the category list in the sidebar
function renderCategories() {
    if (!categoriesData || !categoryListElement) return;

    // Clear loading indicator
    categoryListElement.innerHTML = '';
    
    // Create "All" category option
    const allCategoryItem = document.createElement('li');
    allCategoryItem.innerHTML = '<span class="material-icons">view_module</span> Alle Heuristiken';
    allCategoryItem.classList.add('active');
    allCategoryItem.addEventListener('click', () => filterByCategory(null));
    categoryListElement.appendChild(allCategoryItem);
    
    // Create category items
    categoriesData.forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.innerHTML = '<span class="material-icons">' + category.icon + '</span> ' + category.name;
        categoryItem.dataset.categoryId = category.id;
        categoryItem.addEventListener('click', () => filterByCategory(category.id));
        categoryListElement.appendChild(categoryItem);
    });
}

// Filter heuristics by category
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    // Update active category in sidebar
    if (categoryListElement) {
        const categoryItems = categoryListElement.querySelectorAll('li');
        categoryItems.forEach(item => {
            if ((categoryId === null && !item.dataset.categoryId) || item.dataset.categoryId === categoryId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Update category header
    if (currentCategoryElement) {
        if (categoryId === null) {
            currentCategoryElement.innerHTML = '<h2>Alle Heuristiken</h2>';
        } else {
            const category = categoriesData.find(c => c.id === categoryId);
            if (category) {
                currentCategoryElement.innerHTML = '<h2>' + category.name + '</h2>';
            }
        }
    }
    
    // Filter heuristics based on selected category
    if (categoryId === null) {
        // Show all heuristics
        heuristicsData = allHeuristics;
    } else {
        // Filter by category ID
        heuristicsData = allHeuristics.filter(heuristic => heuristic.categoryId === categoryId);
    }
    
    // Render filtered heuristics
    renderHeuristics();
}

// Render the heuristics grid
function renderHeuristics() {
    if (!heuristicsData || !heuristicsContainer) return;
    
    // Clear loading indicator
    heuristicsContainer.innerHTML = '';
    
    // Show message if no heuristics found
    if (heuristicsData.length === 0) {
        heuristicsContainer.innerHTML = '<div class="no-results">Keine Heuristiken in dieser Kategorie gefunden.</div>';
        return;
    }
    
    // Create heuristic cards
    heuristicsData.forEach(heuristic => {
        const heuristicCard = document.createElement('div');
        heuristicCard.classList.add('heuristic-card');
        
        // Create category tag
        const categoryTag = '<span class="category-tag">' + (heuristic.categoryName || '') + '</span>';
        
        // Use the description field for display if shortDescription is not available
        const displayDescription = heuristic.shortDescription || heuristic.description;
        
        // Create material icon or use a default if not available
        const iconName = heuristic.icon || 'description';
        
        heuristicCard.innerHTML = 
            '<div class="heuristic-card-icon">' +
            '<span class="material-icons">' + iconName + '</span>' +
            '</div>' +
            '<h3>' + heuristic.title + '</h3>' +
            '<p>' + displayDescription + '</p>' +
            '<div class="categories">' + categoryTag + '</div>';
        
        // Add click event to navigate to detail page
        heuristicCard.addEventListener('click', () => {
            window.location.href = 'details.html?id=' + heuristic.id;
        });
        
        heuristicsContainer.appendChild(heuristicCard);
    });
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
