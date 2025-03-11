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
const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
const categoryDropdownContent = document.getElementById('categoryDropdownContent');
const categoryCheckboxes = document.getElementById('categoryCheckboxes');
const categorySearchInput = document.getElementById('categorySearchInput');
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

// Alle verfügbaren Kategorien
let availableCategories = [];

// Editor initialisieren
function initEditor() {
    // Event-Listener für Editor-Elemente
    heuristicForm.addEventListener('submit', handleFormSubmit);
    cancelButton.addEventListener('click', closeEditor);
    previewButton.addEventListener('click', openPreview);
    addExampleButton.addEventListener('click', addExample);
    
    // Kategorie-Dropdown-Event-Listener
    categoryDropdownBtn.addEventListener('click', toggleCategoryDropdown);
    categorySearchInput.addEventListener('input', filterCategories);
    
    // Klick außerhalb des Dropdowns schließt es
    document.addEventListener('click', (e) => {
        if (!categoryDropdownBtn.contains(e.target) && 
            !categoryDropdownContent.contains(e.target)) {
            categoryDropdownContent.classList.remove('show');
        }
    });
    
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
    console.log("Opening heuristic editor for ID:", heuristicId);
    
    // Titel des Modals setzen
    if (heuristicId) {
        modalTitle.textContent = 'Heuristik bearbeiten';
    } else {
        modalTitle.textContent = 'Neue Heuristik erstellen';
    }
    
    // Formular zurücksetzen und Event-Handler entfernen
    heuristicForm.reset();
    
    // Alte Event-Listener entfernen, um doppelte zu vermeiden
    guidelineInput.removeEventListener('input', handleGuidelineInput);
    reasoningTextarea.removeEventListener('input', handleReasoningInput);
    titleInput.removeEventListener('input', handleTitleInput);
    shortDescriptionInput.removeEventListener('input', handleShortDescriptionInput);
    
    // Bereiche leeren
    categorySelectionContainer.innerHTML = '';
    examplesContainer.innerHTML = '';
    relatedSelectionContainer.innerHTML = '';
    
    // Heuristik laden oder neue erstellen
    if (heuristicId) {
        const heuristic = dataManager.getAllHeuristics().find(h => h.id === heuristicId);
        if (heuristic) {
            currentHeuristic = JSON.parse(JSON.stringify(heuristic)); // Deep copy
            console.log("Loaded heuristic:", currentHeuristic);
        } else {
            console.error(`Heuristik mit ID ${heuristicId} nicht gefunden`);
            currentHeuristic = createEmptyHeuristic();
        }
    } else {
        currentHeuristic = createEmptyHeuristic();
    }
    
    // Laden aller verfügbaren Kategorien (wichtig: erst nach dem Laden der Heuristikdaten)
    loadAvailableCategories();
    
    // WICHTIG: Erst Formular mit Daten füllen, dann Event-Handler hinzufügen
    if (heuristicId && currentHeuristic) {
        console.log("Filling form with heuristic data:", currentHeuristic);
        fillFormWithHeuristic(currentHeuristic);
    }
    
    // Neue Event-Handler für Eingabefelder hinzufügen
    guidelineInput.addEventListener('input', handleGuidelineInput);
    reasoningTextarea.addEventListener('input', handleReasoningInput);
    titleInput.addEventListener('input', handleTitleInput);
    shortDescriptionInput.addEventListener('input', handleShortDescriptionInput);
    
    // Icon-Selector mit dem aktuellen Icon aktualisieren
    if (iconSelector) {
        iconSelector.setSelectedIcon(currentHeuristic.icon || 'help');
    }
    
    // Verwandte Heuristiken laden
    loadRelatedHeuristics();
    
    // Modal öffnen
    openModal(heuristicModal);
}

/**
 * Lädt alle verfügbaren Kategorien
 */
function loadAvailableCategories() {
    // Kategorien aus allen Heuristiken sammeln
    const heuristics = dataManager.getAllHeuristics();
    const categories = new Set();
    
    // Extrahiere alle Kategorie-Namen aus den bestehenden Heuristiken
    heuristics.forEach(heuristic => {
        if (heuristic.category && Array.isArray(heuristic.category)) {
            heuristic.category.forEach(category => {
                if (category && category.trim()) {
                    categories.add(category.trim());
                }
            });
        }
    });
    
    // Zu Array konvertieren und alphabetisch sortieren
    availableCategories = Array.from(categories).sort();
    
    // Checkboxen erstellen
    populateCategoryDropdown();
}

/**
 * Befüllt den Kategorie-Dropdown mit Checkboxen
 */
function populateCategoryDropdown() {
    categoryCheckboxes.innerHTML = '';
    
    // Checkboxen für jede Kategorie erstellen
    availableCategories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `category-${category.replace(/\s+/g, '-')}`;
        checkbox.value = category;
        checkbox.addEventListener('change', () => handleCategorySelect(category, checkbox.checked));
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = category;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        categoryCheckboxes.appendChild(item);
    });
}

/**
 * Zeigt oder versteckt den Kategorie-Dropdown
 */
function toggleCategoryDropdown() {
    categoryDropdownContent.classList.toggle('show');
    
    // Wenn der Dropdown geöffnet wird, fokussiere das Suchfeld
    if (categoryDropdownContent.classList.contains('show')) {
        categorySearchInput.focus();
    }
}

/**
 * Filtert die Kategorien im Dropdown basierend auf der Suche
 */
function filterCategories() {
    const searchTerm = categorySearchInput.value.toLowerCase();
    const dropdownItems = categoryCheckboxes.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        const label = item.querySelector('label');
        const text = label.textContent.toLowerCase();
        
        if (text.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Verarbeitet die Auswahl einer Kategorie
 */
function handleCategorySelect(category, isChecked) {
    // Ensure category array exists
    if (!currentHeuristic.category) {
        currentHeuristic.category = [];
    }
    
    if (isChecked) {
        // Zur aktuellen Heuristik hinzufügen, wenn noch nicht enthalten
        if (!currentHeuristic.category.includes(category)) {
            currentHeuristic.category.push(category);
            addCategoryTag(category);
        }
    } else {
        // Aus der aktuellen Heuristik entfernen
        currentHeuristic.category = currentHeuristic.category.filter(c => c !== category);
        
        // Kategorie-Tag im UI entfernen
        const categoryTags = categorySelectionContainer.querySelectorAll('.category-tag');
        categoryTags.forEach(tag => {
            if (tag.getAttribute('data-category') === category) {
                categorySelectionContainer.removeChild(tag);
            }
        });
    }
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

// Definiere Event-Handler-Funktionen
function handleGuidelineInput() {
    currentHeuristic.guideline = this.value;
}

function handleReasoningInput() {
    currentHeuristic.reasoning = this.value;
}

function handleTitleInput() {
    currentHeuristic.title = this.value;
}

function handleShortDescriptionInput() {
    currentHeuristic.shortDescription = this.value;
}

// Füllt das Formular mit den Daten einer Heuristik
function fillFormWithHeuristic(heuristic) {
    // Enhanced debug logging
    console.log("DEBUGGING - Full heuristic object:", {
        ...heuristic,
        hasGuideline: 'guideline' in heuristic,
        hasDescription: 'description' in heuristic,
        guidelineValue: heuristic.guideline,
        descriptionValue: heuristic.description,
        hasExamples: Array.isArray(heuristic.examples),
        examplesLength: Array.isArray(heuristic.examples) ? heuristic.examples.length : 'N/A',
        examplesContent: heuristic.examples
    });
    
    console.log("Setting form fields with values:", {
        id: heuristic.id,
        title: heuristic.title,
        shortDescription: heuristic.shortDescription,
        guideline: heuristic.guideline,
        reasoning: heuristic.reasoning
    });
    
    // Einfache Felder direkt setzen
    heuristicIdInput.value = heuristic.id || '';
    titleInput.value = heuristic.title || '';
    shortDescriptionInput.value = heuristic.shortDescription || '';
    
    // Explizit die Textarea-Werte setzen und überprüfen
    // Fallback: Wenn guideline nicht gesetzt ist, versuche description zu verwenden
    const guidelineValue = heuristic.guideline || heuristic.description || '';
    console.log("Guideline value being set:", guidelineValue);
    guidelineInput.value = guidelineValue;
    reasoningTextarea.value = heuristic.reasoning || '';
    
    // Stellen Sie sicher, dass die Werte tatsächlich gesetzt werden (Fallback)
    setTimeout(() => {
        if (heuristic.guideline && guidelineInput.value !== heuristic.guideline) {
            console.log("Manual guideline update needed");
            document.getElementById('guideline').value = heuristic.guideline;
        }
        
        if (heuristic.reasoning && reasoningTextarea.value !== heuristic.reasoning) {
            console.log("Manual reasoning update needed");
            document.getElementById('reasoning').value = heuristic.reasoning;
        }
    }, 50);
    
    // Kategorien
    if (heuristic.category && heuristic.category.length > 0) {
        heuristic.category.forEach(category => {
            addCategoryTag(category);
            
            // Entsprechende Checkbox ankreuzen
            const checkbox = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
    
    // Icon (wird vom Icon-Selector gesetzt)
    if (iconSelector && heuristic.icon) {
        iconSelector.setSelectedIcon(heuristic.icon);
    }
    
    // Debug examples data
    console.log("DEBUGGING - Examples data:", {
        hasExamples: !!heuristic.examples,
        examplesType: heuristic.examples ? typeof heuristic.examples : 'undefined',
        isArray: Array.isArray(heuristic.examples),
        length: heuristic.examples ? heuristic.examples.length : 0,
        content: heuristic.examples
    });
    
    // Ensure examples is always an array
    if (!heuristic.examples) {
        heuristic.examples = [];
        console.log("Created empty examples array");
    } else if (!Array.isArray(heuristic.examples)) {
        try {
            // If examples is a string, try to parse it as JSON
            if (typeof heuristic.examples === 'string') {
                const parsed = JSON.parse(heuristic.examples);
                if (Array.isArray(parsed)) {
                    heuristic.examples = parsed;
                    console.log("Parsed examples string into array:", parsed);
                } else {
                    heuristic.examples = [];
                    console.log("Parsed examples is not an array, created empty array");
                }
            } else {
                heuristic.examples = [];
                console.log("Examples is not a string or array, created empty array");
            }
        } catch (error) {
            console.error("Error parsing examples:", error);
            heuristic.examples = [];
        }
    }
    
    // Add examples to form
    if (heuristic.examples.length > 0) {
        console.log("Adding examples to form:", heuristic.examples);
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

/**
 * Fügt ein Kategorie-Tag zum Container hinzu
 */
function addCategoryTag(category) {
    const tag = document.createElement('div');
    tag.className = 'category-tag';
    tag.setAttribute('data-category', category);
    tag.innerHTML = `
        ${category}
        <span class="material-icons remove-category">close</span>
    `;
    
    // Entfernen-Button
    tag.querySelector('.remove-category').addEventListener('click', () => {
        // Aus dem Array entfernen
        currentHeuristic.category = currentHeuristic.category.filter(c => c !== category);
        
        // Zugehörige Checkbox abwählen
        const checkbox = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
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
    
    // Ensure relatedHeuristics array exists
    if (!currentHeuristic.relatedHeuristics) {
        currentHeuristic.relatedHeuristics = [];
    }
    
    // Tags für verwandte Heuristiken erstellen
    if (currentHeuristic.relatedHeuristics.length > 0) {
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
