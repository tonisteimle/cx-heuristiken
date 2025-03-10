// Global variables
let heuristicsData = null;
let categoriesData = null;
let currentCategory = null;

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
            heuristicsData = data.heuristics;
            categoriesData = data.categories;
            
            renderCategories();
            renderHeuristics();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Daten:', error);
            
            // Notfall-Fallback auf lokale Daten
            const data = getHardcodedData();
            heuristicsData = data.heuristics;
            categoriesData = data.categories;
            
            renderCategories();
            renderHeuristics();
        });
}

// Load data from API
function loadDataFromAPI() {
    return fetch(`${API_URL}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server-Fehler: ${response.status}`);
            }
            return response.json();
        });
}

// Fallback: Load hardcoded data if API fails
function getHardcodedData() {
    return {
        "heuristics": [
            {
                "id": "recognition-vs-recall",
                "title": "Erkennen statt Erinnern",
                "shortDescription": "Informationen sollten fur Nutzer sichtbar oder leicht zuganglich sein.",
                "category": ["Gedachtnisbelastung", "Kognitive Ergonomie"],
                "icon": "psychology",
                "guideline": "Informationen sollten sichtbar oder leicht zuganglich sein, anstatt von ihnen zu verlangen, sich an Details zu erinnern.",
                "reasoning": "Das Prinzip Erkennen statt Erinnern fordert, die Gedachtnisbelastung der Nutzer so gering wie moglich zu halten.",
                "examples": [
                    {
                        "title": "E-Commerce",
                        "description": "Online-Shopping-Plattformen setzen auf Wiedererkennungshilfen."
                    },
                    {
                        "title": "Software/UI",
                        "description": "Gut gestaltete Anwendungen prasentieren alle notigen Funktionen und Aktionen sichtbar im Menu oder Dashboard."
                    }
                ],
                "relatedHeuristics": ["consistency-standards", "error-prevention"]
            },
            {
                "id": "consistency-standards",
                "title": "Konsistenz und Standards",
                "shortDescription": "Folge Konventionen und halte Elemente uber die gesamte Anwendung hinweg konsistent.",
                "category": ["Konsistenz", "Erlernbarkeit"],
                "icon": "format_align_center",
                "guideline": "Folge etablierten Konventionen und halte Elemente uber die gesamte Anwendung hinweg konsistent.",
                "reasoning": "Konsistenz in der Benutzeroberflache reduziert den Lernaufwand erheblich und macht die Interaktion vorhersehbarer.",
                "examples": [
                    {
                        "title": "Benutzeroberflache",
                        "description": "Konsistentes Design zeigt sich in der durchgangigen Verwendung von UI-Elementen."
                    },
                    {
                        "title": "Navigation",
                        "description": "Navigationsmenos sollten an konsistenten Positionen bleiben und einheitlich strukturiert sein."
                    }
                ],
                "relatedHeuristics": ["recognition-vs-recall", "error-prevention"]
            },
            {
                "id": "error-prevention",
                "title": "Fehlerpravention",
                "shortDescription": "Vermeide Fehler durch sorgfaltiges Design, bevor sie auftreten.",
                "category": ["Fehlermanagement", "Benutzerfuhrung"],
                "icon": "error_outline",
                "guideline": "Gestalte Systeme so, dass Fehler von vornherein vermieden werden.",
                "reasoning": "Fehlerpravention ist effektiver als Fehlerbehebung.",
                "examples": [
                    {
                        "title": "Formulardesign",
                        "description": "Gute Formulare bieten klare Anweisungen und validieren Eingaben wahrend der Eingabe."
                    },
                    {
                        "title": "Interaktionsdesign",
                        "description": "Destruktive Aktionen werden von haufig genutzten Funktionen raumlich getrennt."
                    }
                ],
                "relatedHeuristics": ["recognition-vs-recall", "consistency-standards"]
            }
        ],
        "categories": [
            {
                "id": "gedaechtnisbelastung",
                "name": "Gedachtnisbelastung",
                "description": "Heuristiken, die sich auf die mentale Belastung des Nutzers konzentrieren",
                "icon": "memory"
            },
            {
                "id": "kognitive-ergonomie",
                "name": "Kognitive Ergonomie",
                "description": "Design-Prinzipien fur das menschliche Denken und Wahrnehmen",
                "icon": "psychology"
            },
            {
                "id": "konsistenz",
                "name": "Konsistenz",
                "description": "Prinzipien fur einheitliches und vorhersehbares Design",
                "icon": "format_align_center"
            },
            {
                "id": "erlernbarkeit",
                "name": "Erlernbarkeit",
                "description": "Heuristiken zur Optimierung der Lernkurve",
                "icon": "school"
            },
            {
                "id": "fehlermanagement",
                "name": "Fehlermanagement",
                "description": "Strategien zum Umgang mit Fehlern",
                "icon": "error_outline"
            },
            {
                "id": "benutzerfuehrung",
                "name": "Benutzerfuhrung",
                "description": "Prinzipien zur intuitiven Fuhrung des Nutzers",
                "icon": "navigation"
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
    
    // Render filtered heuristics
    renderHeuristics();
}

// Render the heuristics grid
function renderHeuristics() {
    if (!heuristicsData || !heuristicsContainer) return;
    
    // Clear loading indicator
    heuristicsContainer.innerHTML = '';
    
    // Filter heuristics by category if needed
    let filteredHeuristics = heuristicsData;
    if (currentCategory !== null) {
        filteredHeuristics = heuristicsData.filter(heuristic => 
            heuristic.category.includes(
                categoriesData.find(c => c.id === currentCategory).name
            )
        );
    }
    
    // Show message if no heuristics found
    if (filteredHeuristics.length === 0) {
        heuristicsContainer.innerHTML = '<div class="no-results">Keine Heuristiken in dieser Kategorie gefunden.</div>';
        return;
    }
    
    // Create heuristic cards
    filteredHeuristics.forEach(heuristic => {
        const heuristicCard = document.createElement('div');
        heuristicCard.classList.add('heuristic-card');
        
        let categoryTags = '';
        heuristic.category.forEach(catName => {
            categoryTags += '<span class="category-tag">' + catName + '</span>';
        });
        
        heuristicCard.innerHTML = 
            '<div class="heuristic-card-icon">' +
            '<span class="material-icons">' + heuristic.icon + '</span>' +
            '</div>' +
            '<h3>' + heuristic.title + '</h3>' +
            '<p>' + heuristic.shortDescription + '</p>' +
            '<div class="categories">' + categoryTags + '</div>';
        
        // Add click event to navigate to detail page
        heuristicCard.addEventListener('click', () => {
            window.location.href = 'details.html?id=' + heuristic.id;
        });
        
        heuristicsContainer.appendChild(heuristicCard);
    });
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
