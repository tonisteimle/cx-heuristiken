// Global variables
let heuristicData = null;
let allHeuristicsData = null;

// API URL (übereinstimmend mit data-manager.js)
const API_URL = 'http://localhost:3000/api';

// Initialize the application
function init() {
    // Get the heuristic ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const heuristicId = urlParams.get('id');
    
    if (!heuristicId) {
        showError('Keine Heuristik-ID gefunden. Bitte von der Hauptseite aus starten.');
        return;
    }
    
    loadDataFromAPI(heuristicId)
        .then(data => {
            renderHeuristicDetails(data.heuristic);
            renderRelatedHeuristics(data.relatedHeuristics);
        })
        .catch(error => {
            console.error('Fehler beim Laden der Daten:', error);
            
            // Notfall-Fallback auf lokale Daten
            const data = getHardcodedData();
            const heuristic = data.heuristics.find(h => h.id === heuristicId);
            
            if (heuristic) {
                const relatedHeuristics = getRelatedHeuristics(heuristic, data.heuristics);
                renderHeuristicDetails(heuristic);
                renderRelatedHeuristics(relatedHeuristics);
            } else {
                showError('Die gesuchte Heuristik wurde nicht gefunden.');
            }
        });
}

// Load data from API
function loadDataFromAPI(heuristicId) {
    // First load the single heuristic
    return fetch(`${API_URL}/heuristics/${heuristicId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server-Fehler: ${response.status}`);
            }
            return response.json();
        })
        .then(heuristic => {
            // Then load all heuristics to get the related ones
            return fetch(`${API_URL}/heuristics`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server-Fehler: ${response.status}`);
                    }
                    return response.json();
                })
                .then(allHeuristics => {
                    // Store all heuristics
                    allHeuristicsData = allHeuristics;
                    
                    // Get related heuristics
                    const relatedHeuristics = heuristic.relatedHeuristics 
                        ? allHeuristics.filter(h => heuristic.relatedHeuristics.includes(h.id))
                        : [];
                    
                    return {
                        heuristic: heuristic,
                        relatedHeuristics: relatedHeuristics
                    };
                });
        });
}

// Fallback: Load hardcoded data if API fails
function getHardcodedData() {
    // Use the same function as in main.js to ensure consistency
    if (typeof window.getHardcodedData === 'function') {
        return window.getHardcodedData();
    }
    
    // Define it here as fallback if main.js is not loaded
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
        ]
    };
}

// Get related heuristics from the local data
function getRelatedHeuristics(heuristic, allHeuristics) {
    if (!heuristic.relatedHeuristics || !allHeuristics) return [];
    
    return allHeuristics.filter(h => heuristic.relatedHeuristics.includes(h.id));
}

// Render the heuristic details
function renderHeuristicDetails(heuristic) {
    if (!heuristic) {
        showError('Die Heuristik konnte nicht geladen werden.');
        return;
    }
    
    heuristicData = heuristic;
    
    // Update page title
    document.title = `${heuristic.title} - CX Heuristics`;
    
    // Get the container element
    const detailContainer = document.querySelector('.heuristic-detail');
    if (!detailContainer) {
        console.error('Container element .heuristic-detail nicht gefunden');
        return;
    }
    
    // Create category tags HTML
    let categoryTags = '';
    if (heuristic.category && heuristic.category.length > 0) {
        heuristic.category.forEach(category => {
            categoryTags += `<span class="category-tag">${category}</span>`;
        });
    }
    
    // Create examples HTML
    let examplesHTML = '';
    if (heuristic.examples && heuristic.examples.length > 0) {
        heuristic.examples.forEach(example => {
            examplesHTML += `
                <div class="example">
                    <h3>${example.title}</h3>
                    <p>${example.description}</p>
                </div>
            `;
        });
    }
    
    // Create complete HTML for the detail container
    detailContainer.innerHTML = `
        <div class="heuristic-detail-header">
            <div class="icon-container">
                <span class="material-icons">${heuristic.icon || 'help'}</span>
            </div>
            <h1>${heuristic.title}</h1>
            <p>${heuristic.shortDescription}</p>
            <div class="categories">${categoryTags}</div>
        </div>
        <div class="heuristic-detail-content">
            <section>
                <h2>Guideline</h2>
                <div class="guideline">${heuristic.guideline}</div>
            </section>
            <section>
                <h2>Begründung</h2>
                <div class="reasoning">${heuristic.reasoning}</div>
            </section>
            <section>
                <h2>Beispiele</h2>
                <div class="examples">${examplesHTML}</div>
            </section>
        </div>
    `;
    
    // Show the container
    detailContainer.style.display = 'block';
}

// Render related heuristics cards
function renderRelatedHeuristics(relatedHeuristics) {
    const relatedContainer = document.getElementById('related-heuristics');
    if (!relatedContainer) {
        console.error('Container element #related-heuristics nicht gefunden');
        return;
    }
    
    // Hide if no related heuristics
    if (!relatedHeuristics || relatedHeuristics.length === 0) {
        document.querySelector('section.related-heuristics').style.display = 'none';
        return;
    }
    
    document.querySelector('section.related-heuristics').style.display = 'block';
    relatedContainer.innerHTML = '';
    
    // Create related heuristic cards - using the same structure as in main.js
    relatedHeuristics.forEach(heuristic => {
        const card = document.createElement('div');
        card.classList.add('heuristic-card');
        
        // Create category tags HTML
        let categoryTags = '';
        if (heuristic.category && heuristic.category.length > 0) {
            heuristic.category.forEach(category => {
                categoryTags += `<span class="category-tag">${category}</span>`;
            });
        }
        
        // Use the exact same HTML structure as in main.js for consistency
        card.innerHTML = 
            '<div class="heuristic-card-icon">' +
            '<span class="material-icons">' + heuristic.icon + '</span>' +
            '</div>' +
            '<h3>' + heuristic.title + '</h3>' +
            '<p>' + heuristic.shortDescription + '</p>' +
            '<div class="categories">' + categoryTags + '</div>';
        
        // Add click event
        card.addEventListener('click', () => {
            window.location.href = `details.html?id=${heuristic.id}`;
        });
        
        relatedContainer.appendChild(card);
    });
}

// Show error message
function showError(message) {
    const container = document.querySelector('.heuristic-detail');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <span class="material-icons">error</span>
                <p>${message}</p>
                <a href="index.html" class="back-button">Zurück zur Übersicht</a>
            </div>
        `;
        container.style.display = 'block';
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
