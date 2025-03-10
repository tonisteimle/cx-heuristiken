/**
 * Hauptskript für den CX Heuristics Admin-Bereich
 * Verwaltet die Anzeige und Interaktion mit der Admin-Oberfläche
 */

// DOM-Elemente
const heuristicsListElement = document.getElementById('heuristicsList');
const searchInputElement = document.getElementById('searchInput');
const categoryFilterElement = document.getElementById('categoryFilter');
const newHeuristicButton = document.getElementById('newHeuristicBtn');
const importDataButton = document.getElementById('importDataBtn');
const exportDataButton = document.getElementById('exportDataBtn');
const importFileInput = document.getElementById('importFileInput');
const backupStatusElement = document.getElementById('backupStatus');
const backupTextElement = document.getElementById('backupText');

// Modaler Dialog für Bestätigungen
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYesButton = document.getElementById('confirmYesBtn');
const confirmNoButton = document.getElementById('confirmNoBtn');
const closeModalElements = document.querySelectorAll('.close-modal');

// Liste der gängigen Material Icons für die Auswahl
const commonIcons = [
    'psychology', 'format_align_center', 'error_outline', 'memory', 'school', 
    'navigation', 'accessibility', 'language', 'devices', 'speed', 'palette', 
    'visibility', 'sentiment_satisfied', 'search', 'account_circle', 'touch_app',
    'thumb_up', 'build', 'star', 'lightbulb', 'extension', 'widgets', 'layers',
    'schedule', 'trending_up', 'filter_list', 'settings', 'text_format', 'brush',
    'camera', 'mic', 'videocam', 'home', 'public', 'email', 'phone', 'chat',
    'forum', 'help', 'info', 'warning', 'error', 'bookmark', 'code', 'cloud'
];

// Aktuelle Filter
let currentSearchTerm = '';
let currentCategoryFilter = '';

// Initialisiert die Admin-Oberfläche
function init() {
    // Daten laden
    dataManager.init().then(() => {
        // Event-Listener für Datenänderungen
        dataManager.onDataChanged = renderHeuristicsList;
        dataManager.onBackupCreated = updateBackupStatus;
        
        // Event-Listener für UI-Elemente
        setupEventListeners();
        
        // Kategoriefilter aktualisieren
        populateCategoryFilter();
        
        // Heuristiken anzeigen
        renderHeuristicsList();
        
        // Backup-Status aktualisieren
        updateBackupStatus();
    });
}

// Richtet Event-Listener ein
function setupEventListeners() {
    // Suche
    searchInputElement.addEventListener('input', handleSearch);
    
    // Kategoriefilter
    categoryFilterElement.addEventListener('change', handleCategoryFilter);
    
    // Buttons
    newHeuristicButton.addEventListener('click', handleNewHeuristic);
    importDataButton.addEventListener('click', () => importFileInput.click());
    exportDataButton.addEventListener('click', handleExportData);
    importFileInput.addEventListener('change', handleImportData);
    
    // Modal schließen
    closeModalElements.forEach(element => {
        element.addEventListener('click', closeAllModals);
    });
    
    // Bestätigen/Abbrechen
    confirmYesButton.addEventListener('click', handleConfirmYes);
    confirmNoButton.addEventListener('click', () => closeModal(confirmModal));
    
    // ESC-Taste zum Schließen von Modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });
}

// Füllt den Kategoriefilter mit allen verfügbaren Kategorien
function populateCategoryFilter() {
    const categories = dataManager.getAllCategories();
    
    // Vorhandene Optionen entfernen (außer der "Alle Kategorien"-Option)
    while (categoryFilterElement.options.length > 1) {
        categoryFilterElement.remove(1);
    }
    
    // Kategorien hinzufügen
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryFilterElement.appendChild(option);
    });
}

// Rendert die Liste der Heuristiken
function renderHeuristicsList() {
    // Heuristiken filtern
    let heuristics = dataManager.getAllHeuristics();
    
    // Nach Suchbegriff filtern
    if (currentSearchTerm) {
        heuristics = dataManager.searchHeuristics(currentSearchTerm);
    }
    
    // Nach Kategorie filtern
    if (currentCategoryFilter) {
        heuristics = dataManager.filterByCategory(currentCategoryFilter);
    }
    
    // Liste leeren
    heuristicsListElement.innerHTML = '';
    
    // Keine Heuristiken gefunden
    if (heuristics.length === 0) {
        heuristicsListElement.innerHTML = '<div class="loading-indicator">Keine Heuristiken gefunden</div>';
        return;
    }
    
    // Heuristiken anzeigen
    heuristics.forEach(heuristic => {
        const heuristicElement = createHeuristicElement(heuristic);
        heuristicsListElement.appendChild(heuristicElement);
    });
}

// Erstellt ein Element für eine Heuristik
function createHeuristicElement(heuristic) {
    const element = document.createElement('div');
    element.className = 'heuristic-item';
    element.dataset.id = heuristic.id;
    
    // Kategorie-Tags erstellen
    let categoryTags = '';
    if (heuristic.category && heuristic.category.length > 0) {
        heuristic.category.forEach(category => {
            categoryTags += `<span class="heuristic-item-category">${category}</span>`;
        });
    }
    
    // HTML für das Element
    element.innerHTML = `
        <div class="heuristic-item-header">
            <div class="heuristic-item-icon">
                <span class="material-icons">${heuristic.icon || 'help'}</span>
            </div>
            <h3 class="heuristic-item-title">${heuristic.title}</h3>
        </div>
        <div class="heuristic-item-description">${heuristic.shortDescription}</div>
        <div class="heuristic-item-categories">${categoryTags}</div>
        <div class="heuristic-item-actions">
            <button class="icon-button edit-button" title="Bearbeiten">
                <span class="material-icons">edit</span>
            </button>
            <button class="icon-button delete-button" title="Löschen">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `;
    
    // Event-Listener für Buttons
    element.querySelector('.edit-button').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditor(heuristic.id);
    });
    
    element.querySelector('.delete-button').addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDelete(heuristic.id, heuristic.title);
    });
    
    // Klick auf die gesamte Karte öffnet den Editor
    element.addEventListener('click', () => {
        openEditor(heuristic.id);
    });
    
    return element;
}

// Öffnet den Editor für eine Heuristik
function openEditor(heuristicId) {
    // Wir nutzen die Editorfunktion aus editor.js
    openHeuristicEditor(heuristicId);
}

// Öffnet die Bestätigungsdialog für das Löschen
function confirmDelete(heuristicId, heuristicTitle) {
    confirmMessage.textContent = `Möchten Sie die Heuristik "${heuristicTitle}" wirklich löschen?`;
    
    // ID für den Bestätigungsdialog speichern
    confirmYesButton.dataset.heuristicId = heuristicId;
    
    // Modal öffnen
    openModal(confirmModal);
}

// Verarbeitet die Bestätigung zum Löschen
function handleConfirmYes() {
    const heuristicId = confirmYesButton.dataset.heuristicId;
    
    if (heuristicId) {
        // Heuristik löschen
        const success = dataManager.deleteHeuristic(heuristicId);
        
        if (success) {
            // Modal schließen und Liste aktualisieren
            closeModal(confirmModal);
            renderHeuristicsList();
        } else {
            alert('Die Heuristik konnte nicht gelöscht werden.');
        }
    }
    
    // ID entfernen
    delete confirmYesButton.dataset.heuristicId;
}

// Behandelt die Suche
function handleSearch() {
    currentSearchTerm = searchInputElement.value.trim();
    renderHeuristicsList();
}

// Behandelt den Kategoriefilter
function handleCategoryFilter() {
    currentCategoryFilter = categoryFilterElement.value;
    renderHeuristicsList();
}

// Behandelt die Erstellung einer neuen Heuristik
function handleNewHeuristic() {
    openHeuristicEditor();
}

// Behandelt den Export der Daten
function handleExportData() {
    dataManager.exportData();
}

// Behandelt den Import von Daten
function handleImportData() {
    const file = importFileInput.files[0];
    
    if (file) {
        console.log("Datei ausgewählt, starte Import:", file.name);
        
        dataManager.importData(file)
            .then((result) => {
                // Kategoriefilter aktualisieren
                populateCategoryFilter();
                
                // Liste neu rendern
                renderHeuristicsList();
                
                // Eingabefeld zurücksetzen
                importFileInput.value = '';
                
                alert(`Die Daten wurden erfolgreich importiert: ${result.addedHeuristics} neue Heuristiken, ${result.addedCategories} neue Kategorien.`);
            })
            .catch(error => {
                console.error("Import fehlgeschlagen:", error);
                alert(`Fehler beim Importieren der Daten: ${error.message}`);
                importFileInput.value = '';
            });
    } else {
        console.log("Keine Datei ausgewählt");
    }
}

// Aktualisiert den Backup-Status
function updateBackupStatus(lastBackupTime) {
    // Wenn keine Zeit übergeben wurde, versuche sie aus dem LocalStorage zu laden
    if (!lastBackupTime) {
        const lastBackupTimeString = localStorage.getItem(dataManager.LAST_BACKUP_TIME_KEY);
        if (lastBackupTimeString) {
            lastBackupTime = new Date(lastBackupTimeString);
        }
    }
    
    if (lastBackupTime) {
        // Formatiere die Zeit
        const timeString = lastBackupTime.toLocaleTimeString();
        backupTextElement.textContent = `Letztes Backup: ${timeString}`;
        backupStatusElement.classList.add('success');
    } else {
        backupTextElement.textContent = 'Automatisches Backup aktiviert';
        backupStatusElement.classList.remove('success');
    }
}

// Öffnet einen modalen Dialog
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
}

// Schließt einen modalen Dialog
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Scrollen wieder erlauben
}

// Schließt alle modalen Dialoge
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => closeModal(modal));
}

// Initialisierung starten, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', init);
