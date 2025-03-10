/**
 * Editor für CX Heuristics Admin
 * Verwaltet die Bearbeitung und Erstellung von Heuristiken
 */

// DOM-Elemente
const heuristicModal = document.getElementById('heuristicModal');
const previewModal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const heuristicForm = document.getElementById('heuristicForm');
const cancelButton = document.getElementById('cancelBtn');
const previewButton = document.getElementById('previewBtn');
const previewContainer = document.getElementById('previewContainer');

// Form-Elemente
const heuristicIdInput = document.getElementById('heuristicId');
const titleInput = document.getElementById('title');
const shortDescriptionInput = document.getElementById('shortDescription');
const categorySelectionContainer = document.getElementById('categorySelection');
const newCategoryInput = document.getElementById('newCategory');
const addCategoryButton = document.getElementById('addCategoryBtn');
const iconContainer = document.querySelector('.icon-selection');
const guidelineInput = document.getElementById('guideline');
const reasoningTextarea = document.getElementById('reasoning');
const examplesContainer = document.getElementById('examplesContainer');
const addExampleButton = document.getElementById('addExampleBtn');
const relatedSelectionContainer = document.getElementById('relatedSelection');

// Aktuell bearbeitete Heuristik
let currentHeuristic = null;

// Icon-Selector
let iconSelector = null;

// Editor initialisieren
function initEditor() {
    // Event-Listener für Editor-Elemente
    heuristicForm.addEventListener('submit', handleFormSubmit);
    cancelButton.addEventListener('click', closeEditor);
    previewButton.addEventListener('click', openPreview);
    addCategoryButton.addEventListener('click', addNewCategory);
    addExampleButton.addEventListener('click', addExample);
    
    // Icon-Selector initialisieren
    initIconSelector();
}

// Initialisiert den Icon-Selector
function initIconSelector() {
    if (!iconContainer) {
        console.warn('Icon container element not found');
        return;
    }
    
    // Icon-Selector erstellen
    iconSelector = createIconSelector({
        container: iconContainer,
        selectedIcon: currentHeuristic?.icon || 'help',
        onSelect: (icon) => {
            // Zum aktuellen Heuristik-Objekt hinzufügen
            if (currentHeuristic) {
                currentHeuristic.icon = icon;
            }
        }
    });
}

// Öffnet den Editor für eine bestehende oder neue Heuristik
function openHeuristicEditor(heuristicId = null) {
    // Titel des Modals setzen
    if (heuristicId) {
        modalTitle.textContent = 'Heuristik bearbeiten';
    } else {
        modalTitle.textContent = 'Neue Heuristik erstellen';
    }
    
    // Formular zurücksetzen
    heuristicForm.reset();
    
    // Bereiche leeren
    categorySelectionContainer.innerHTML = '';
    examplesContainer.innerHTML = '';
    relatedSelectionContainer.innerHTML = '';
    
    // Heuristik laden oder neue erstellen
    if (heuristicId) {
        const heuristic = dataManager.getAllHeuristics().find(h => h.id === heuristicId);
        if (heuristic) {
            currentHeuristic = JSON.parse(JSON.stringify(heuristic)); // Deep copy
            fillFormWithHeuristic(currentHeuristic);
        } else {
            console.error(`Heuristik mit ID ${heuristicId} nicht gefunden`);
            currentHeuristic = createEmptyHeuristic();
        }
    } else {
        currentHeuristic = createEmptyHeuristic();
    }
    
    // Event-Handler für das Reasoning-Feld hinzufügen
    reasoningTextarea.addEventListener('input', function() {
        currentHeuristic.reasoning = this.value;
    });
    
    // Icon-Selector mit dem aktuellen Icon aktualisieren
    if (iconSelector) {
        iconSelector.setSelectedIcon(currentHeuristic.icon || 'help');
    }
    
    // Verwandte Heuristiken laden
    loadRelatedHeuristics();
    
    // Modal öffnen
    openModal(heuristicModal);
}

// Erstellt eine leere Heuristik
function createEmptyHeuristic() {
    return {
        id: '',
        title: '',
        shortDescription: '',
        category: [],
        icon: 'help',
        guideline: '',
        reasoning: '',
        examples: [],
        relatedHeuristics: []
    };
}

// Füllt das Formular mit den Daten einer Heuristik
function fillFormWithHeuristic(heuristic) {
    // Einfache Felder
    heuristicIdInput.value = heuristic.id || '';
    titleInput.value = heuristic.title || '';
    shortDescriptionInput.value = heuristic.shortDescription || '';
    guidelineInput.value = heuristic.guideline || '';
    reasoningTextarea.value = heuristic.reasoning || '';
    
    // Kategorien
    if (heuristic.category && heuristic.category.length > 0) {
        heuristic.category.forEach(category => {
            addCategoryTag(category);
        });
    }
    
    // Icon (wird vom Icon-Selector gesetzt)
    if (iconSelector && heuristic.icon) {
        iconSelector.setSelectedIcon(heuristic.icon);
    }
    
    // Beispiele
    if (heuristic.examples && heuristic.examples.length > 0) {
        heuristic.examples.forEach((example, index) => {
            addExample(null, example);
        });
    }
}

// Verarbeitet die Formularabsendung
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Daten aus dem Formular in die aktuelle Heuristik übernehmen
    currentHeuristic.title = titleInput.value.trim();
    currentHeuristic.shortDescription = shortDescriptionInput.value.trim();
    currentHeuristic.guideline = guidelineInput.value.trim();
    currentHeuristic.reasoning = reasoningTextarea.value.trim();
    
    // Heuristik speichern
    const heuristicId = dataManager.saveHeuristic(currentHeuristic);
    
    // Modal schließen und Liste aktualisieren
    closeEditor();
    renderHeuristicsList();
}

// Schließt den Editor
function closeEditor() {
    // Modal schließen
    closeModal(heuristicModal);
    
    // Aktuelle Heuristik zurücksetzen
    currentHeuristic = null;
}

// Öffnet die Vorschau
function openPreview() {
    // Aktuelle Daten aus dem Formular in die Heuristik übernehmen
    const previewHeuristic = { ...currentHeuristic };
    previewHeuristic.title = titleInput.value.trim();
    previewHeuristic.shortDescription = shortDescriptionInput.value.trim();
    previewHeuristic.guideline = guidelineInput.value.trim();
    previewHeuristic.reasoning = reasoningTextarea.value.trim();
    
    // Beispiele sammeln
    const exampleElements = examplesContainer.querySelectorAll('.example-item');
    previewHeuristic.examples = Array.from(exampleElements).map(element => {
        const titleInput = element.querySelector('input[name="example-title"]');
        const descriptionTextarea = element.querySelector('textarea[name="example-description"]');
        
        return {
            title: titleInput.value.trim(),
            description: descriptionTextarea.value.trim()
        };
    });
    
    // HTML für die Vorschau erstellen
    let categoryTags = '';
    if (previewHeuristic.category && previewHeuristic.category.length > 0) {
        previewHeuristic.category.forEach(category => {
            categoryTags += `<span class="category-tag">${category}</span>`;
        });
    }
    
    let examplesHtml = '';
    if (previewHeuristic.examples && previewHeuristic.examples.length > 0) {
        previewHeuristic.examples.forEach(example => {
            examplesHtml += `
                <div class="example-item">
                    <h3>${example.title}</h3>
                    <p>${example.description}</p>
                </div>
            `;
        });
    }
    
    // Vorschau-HTML erstellen
    previewContainer.innerHTML = `
        <div class="heuristic-detail">
            <div class="heuristic-detail-header">
                <div class="icon-container">
                    <span class="material-icons">${previewHeuristic.icon || 'help'}</span>
                </div>
                <h1>${previewHeuristic.title}</h1>
                <p>${previewHeuristic.shortDescription}</p>
                <div class="categories">${categoryTags}</div>
            </div>
            <div class="heuristic-detail-content">
                <section>
                    <h2>Guideline</h2>
                    <div class="guideline">${previewHeuristic.guideline}</div>
                </section>
                <section>
                    <h2>Begründung</h2>
                    <div class="reasoning">${previewHeuristic.reasoning}</div>
                </section>
                <section>
                    <h2>Beispiele</h2>
                    <div class="examples">${examplesHtml}</div>
                </section>
            </div>
        </div>
    `;
    
    // Modal öffnen
    openModal(previewModal);
}

// Fügt eine neue Kategorie hinzu
function addNewCategory() {
    const newCategory = newCategoryInput.value.trim();
    
    if (newCategory && !currentHeuristic.category.includes(newCategory)) {
        // Zur aktuellen Heuristik hinzufügen
        currentHeuristic.category.push(newCategory);
        
        // Tag erstellen
        addCategoryTag(newCategory);
        
        // Eingabefeld leeren
        newCategoryInput.value = '';
    }
}

// Fügt ein Kategorie-Tag zum Container hinzu
function addCategoryTag(category) {
    const tag = document.createElement('div');
    tag.className = 'category-tag';
    tag.innerHTML = `
        ${category}
        <span class="material-icons remove-category">close</span>
    `;
    
    // Entfernen-Button
    tag.querySelector('.remove-category').addEventListener('click', () => {
        // Aus dem Array entfernen
        currentHeuristic.category = currentHeuristic.category.filter(c => c !== category);
        
        // Tag entfernen
        categorySelectionContainer.removeChild(tag);
    });
    
    // Zum Container hinzufügen
    categorySelectionContainer.appendChild(tag);
}


// Fügt ein Beispiel hinzu
function addExample(event, existingExample = null) {
    if (event) event.preventDefault();
    
    const exampleId = `example-${Date.now()}`;
    const exampleElement = document.createElement('div');
    exampleElement.className = 'example-item';
    exampleElement.dataset.id = exampleId;
    
    exampleElement.innerHTML = `
        <div class="example-item-header">
            <h3>Beispiel</h3>
            <span class="material-icons remove-example">delete</span>
        </div>
        <div class="form-group">
            <label for="${exampleId}-title">Titel</label>
            <input type="text" id="${exampleId}-title" name="example-title" required>
        </div>
        <div class="form-group">
            <label for="${exampleId}-description">Beschreibung</label>
            <textarea id="${exampleId}-description" name="example-description" rows="3"></textarea>
        </div>
    `;
    
    // Entfernen-Button
    exampleElement.querySelector('.remove-example').addEventListener('click', () => {
        examplesContainer.removeChild(exampleElement);
        
        // Beispiele aus dem Formular sammeln
        updateExamplesFromForm();
    });
    
    // Änderungs-Event für die Eingabefelder
    const titleInput = exampleElement.querySelector('input[name="example-title"]');
    const descriptionTextarea = exampleElement.querySelector('textarea[name="example-description"]');
    
    titleInput.addEventListener('input', updateExamplesFromForm);
    descriptionTextarea.addEventListener('input', updateExamplesFromForm);
    
    // Vorhandene Daten setzen
    if (existingExample) {
        titleInput.value = existingExample.title || '';
        descriptionTextarea.value = existingExample.description || '';
    }
    
    // Zum Container hinzufügen
    examplesContainer.appendChild(exampleElement);
    
    // Beispiele aktualisieren
    updateExamplesFromForm();
}

// Aktualisiert die Beispiele aus dem Formular
function updateExamplesFromForm() {
    const exampleElements = examplesContainer.querySelectorAll('.example-item');
    currentHeuristic.examples = Array.from(exampleElements).map(element => {
        const titleInput = element.querySelector('input[name="example-title"]');
        const descriptionTextarea = element.querySelector('textarea[name="example-description"]');
        
        return {
            title: titleInput.value.trim(),
            description: descriptionTextarea.value.trim()
        };
    });
}

// Lädt die verwandten Heuristiken
function loadRelatedHeuristics() {
    // Container leeren
    relatedSelectionContainer.innerHTML = '';
    
    // Alle Heuristiken laden (außer der aktuellen)
    const allHeuristics = dataManager.getAllHeuristics().filter(h => 
        h.id !== currentHeuristic.id
    );
    
    // Tags für verwandte Heuristiken erstellen
    if (currentHeuristic.relatedHeuristics && currentHeuristic.relatedHeuristics.length > 0) {
        currentHeuristic.relatedHeuristics.forEach(relatedId => {
            const relatedHeuristic = allHeuristics.find(h => h.id === relatedId);
            if (relatedHeuristic) {
                addRelatedHeuristicTag(relatedHeuristic);
            }
        });
    }
    
    // Dropdown für das Hinzufügen weiterer verwandter Heuristiken erstellen
    const dropdown = document.createElement('select');
    dropdown.className = 'related-dropdown';
    
    // Leere Option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Ähnliche Heuristik hinzufügen...';
    dropdown.appendChild(emptyOption);
    
    // Optionen für nicht verwandte Heuristiken hinzufügen
    allHeuristics
        .filter(h => !currentHeuristic.relatedHeuristics.includes(h.id))
        .forEach(heuristic => {
            const option = document.createElement('option');
            option.value = heuristic.id;
            option.textContent = heuristic.title;
            dropdown.appendChild(option);
        });
    
    // Change-Event
    dropdown.addEventListener('change', () => {
        const selectedId = dropdown.value;
        if (selectedId) {
            // Zur Liste hinzufügen
            if (!currentHeuristic.relatedHeuristics.includes(selectedId)) {
                currentHeuristic.relatedHeuristics.push(selectedId);
                
                // Tag erstellen
                const selectedHeuristic = allHeuristics.find(h => h.id === selectedId);
                if (selectedHeuristic) {
                    addRelatedHeuristicTag(selectedHeuristic);
                }
            }
            
            // Dropdown zurücksetzen
            dropdown.value = '';
        }
    });
    
    // Zum Container hinzufügen
    relatedSelectionContainer.appendChild(dropdown);
}

// Fügt ein Tag für eine verwandte Heuristik hinzu
function addRelatedHeuristicTag(heuristic) {
    const tag = document.createElement('div');
    tag.className = 'related-tag';
    tag.innerHTML = `
        ${heuristic.title}
        <span class="material-icons remove-related">close</span>
    `;
    
    // Entfernen-Button
    tag.querySelector('.remove-related').addEventListener('click', () => {
        // Aus dem Array entfernen
        currentHeuristic.relatedHeuristics = currentHeuristic.relatedHeuristics.filter(id => id !== heuristic.id);
        
        // Tag entfernen
        relatedSelectionContainer.removeChild(tag);
        
        // Dropdown aktualisieren
        loadRelatedHeuristics();
    });
    
    // Vor dem Dropdown einfügen
    const dropdown = relatedSelectionContainer.querySelector('.related-dropdown');
    if (dropdown) {
        relatedSelectionContainer.insertBefore(tag, dropdown);
    } else {
        relatedSelectionContainer.appendChild(tag);
    }
}

// Initialisierung, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', initEditor);
