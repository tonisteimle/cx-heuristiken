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
            
            // Fallback auf lokale JSON-Datei
            loadDataFromLocalFile(heuristicId)
                .then(data => {
                    if (data.heuristic) {
                        renderHeuristicDetails(data.heuristic);
                        renderRelatedHeuristics(data.relatedHeuristics);
                    } else {
                        showError('Die gesuchte Heuristik wurde nicht gefunden.');
                    }
                })
                .catch(localError => {
                    console.error('Fehler beim Laden der lokalen Daten:', localError);
                    showError('Die Heuristik konnte nicht geladen werden.');
                });
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

// Load data from local file
function loadDataFromLocalFile(heuristicId) {
    return fetch('data/heuristics.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Lokale JSON-Datei konnte nicht geladen werden');
            }
            return response.json();
        })
        .then(data => {
            // Flattened list of all heuristics from all categories
            const allHeuristics = [];
            
            if (data.categories) {
                data.categories.forEach(category => {
                    if (category.heuristics && Array.isArray(category.heuristics)) {
                        category.heuristics.forEach(heuristic => {
                            // Add category information to the heuristic
                            allHeuristics.push({
                                ...heuristic,
                                categoryId: category.id,
                                categoryName: category.name,
                                icon: heuristic.icon || category.icon
                            });
                        });
                    }
                });
            }
            
            // Find the requested heuristic
            const heuristic = allHeuristics.find(h => h.id === heuristicId);
            
            if (!heuristic) {
                return { heuristic: null, relatedHeuristics: [] };
            }
            
            // Find related heuristics
            let relatedHeuristics = [];
            if (heuristic.relatedHeuristics) {
                relatedHeuristics = allHeuristics.filter(h => 
                    heuristic.relatedHeuristics.includes(h.id)
                );
            }
            
            return {
                heuristic: heuristic,
                relatedHeuristics: relatedHeuristics
            };
        });
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
    } else if (heuristic.categoryName) {
        // Fallback to categoryName if available
        categoryTags = `<span class="category-tag">${heuristic.categoryName}</span>`;
    }
    
    // Create examples HTML
    let examplesHTML = '';
    if (heuristic.examples && heuristic.examples.length > 0) {
        examplesHTML = '<ul class="examples-list">';
        heuristic.examples.forEach(example => {
            if (typeof example === 'string') {
                // Handle plain string examples
                examplesHTML += `<li>${example}</li>`;
            } else if (example.title && example.description) {
                // Handle object examples with title and description
                examplesHTML += `
                    <li>
                        <strong>${example.title}:</strong> ${example.description}
                    </li>
                `;
            }
        });
        examplesHTML += '</ul>';
    }
    
    // Determine content for guidelines and reasoning sections
    const guideline = heuristic.guideline || heuristic.description || '';
    const reasoning = heuristic.reasoning || '';
    
    // Create complete HTML for the detail container
    detailContainer.innerHTML = `
        <div class="heuristic-detail-header">
            <div class="icon-container">
                <span class="material-icons">${heuristic.icon || 'help'}</span>
            </div>
            <h1>${heuristic.title}</h1>
            <p>${heuristic.shortDescription || ''}</p>
            <div class="categories">${categoryTags}</div>
        </div>
        <div class="heuristic-detail-content">
            <section>
                <h2>Guideline</h2>
                <div class="guideline">${guideline}</div>
            </section>
            ${reasoning ? `
                <section>
                    <h2>Begründung</h2>
                    <div class="reasoning">${reasoning}</div>
                </section>
            ` : ''}
            ${examplesHTML ? `
                <section>
                    <h2>Beispiele</h2>
                    <div class="examples">${examplesHTML}</div>
                </section>
            ` : ''}
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
        
        // Create category tag
        let categoryTag = '';
        if (heuristic.categoryName) {
            categoryTag = `<span class="category-tag">${heuristic.categoryName}</span>`;
        } else if (heuristic.category && heuristic.category.length > 0) {
            categoryTag = `<span class="category-tag">${heuristic.category[0]}</span>`;
        }
        
        // Use the description field for display if shortDescription is not available
        const displayDescription = heuristic.shortDescription || heuristic.description || '';
        
        // Create material icon or use a default if not available
        const iconName = heuristic.icon || 'help';
        
        card.innerHTML = 
            '<div class="heuristic-icon">' +
            '<span class="material-icons">' + iconName + '</span>' +
            '</div>' +
            '<h3>' + heuristic.title + '</h3>' +
            '<p>' + displayDescription + '</p>' +
            '<div class="categories">' + categoryTag + '</div>';
        
        // Add click event to navigate to detail page
        card.addEventListener('click', () => {
            window.location.href = 'details.html?id=' + heuristic.id;
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
