/**
 * Categories Admin Script
 * Manages the admin interface for CX Heuristics categories
 */

// DOM-Elemente
const categoriesListElement = document.getElementById('categoriesList');
const searchInputElement = document.getElementById('searchInput');
const newCategoryButton = document.getElementById('newCategoryBtn');
const exportCategoriesButton = document.getElementById('exportCategoriesBtn');
const backupStatusElement = document.getElementById('backupStatus');
const backupTextElement = document.getElementById('backupText');

// Kategorie-Modal
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const categoryIdInput = document.getElementById('categoryId');
const categoryNameInput = document.getElementById('categoryName');
const categoryDescriptionInput = document.getElementById('categoryDescription');
const modalTitle = document.getElementById('modalTitle');
const cancelButton = document.getElementById('cancelBtn');

// Bestätigungs-Modal
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYesButton = document.getElementById('confirmYesBtn');
const confirmNoButton = document.getElementById('confirmNoBtn');
const closeModalElements = document.querySelectorAll('.close-modal');

// Aktuelle Suche
let currentSearchTerm = '';

/**
 * Initialisiert die Kategorieverwaltung
 */
function init() {
    // Daten laden
    dataManager.init().then(() => {
        // Event-Listener für Datenänderungen
        dataManager.onDataChanged = renderCategoriesList;
        dataManager.onBackupCreated = updateBackupStatus;
        
        // Event-Listener für UI-Elemente
        setupEventListeners();
        
        // Kategorien anzeigen
        renderCategoriesList();
        
        // Backup-Status aktualisieren
        updateBackupStatus();

        // Icon-Selector initialisieren
        initializeIconSelector();
    });
}

/**
 * Richtet Event-Listener ein
 */
function setupEventListeners() {
    // Suche
    searchInputElement.addEventListener('input', handleSearch);
    
    // Neue Kategorie
    newCategoryButton.addEventListener('click', () => openCategoryEditor());
    
    // Kategorien exportieren
    exportCategoriesButton.addEventListener('click', handleExportCategories);
    
    // Formular absenden
    categoryForm.addEventListener('submit', handleFormSubmit);
    
    // Abbrechen-Button
    cancelButton.addEventListener('click', () => closeModal(categoryModal));
    
    // Modals schließen
    closeModalElements.forEach(element => {
        element.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });
    
    // Bestätigen/Abbrechen
    confirmYesButton.addEventListener('click', handleConfirmYes);
    confirmNoButton.addEventListener('click', () => closeModal(confirmModal));
    
    // ESC-Taste zum Schließen von Modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });
}

/**
 * Initialisiert den Icon-Selector
 */
function initializeIconSelector() {
    const iconGrid = document.getElementById('iconGrid');
    const iconSearch = document.getElementById('iconSearch');
    const selectedIcon = document.getElementById('selectedIcon');
    const selectedIconName = document.getElementById('selectedIconName');
    
    // Material Icons hinzufügen
    renderIconGrid(window.materialIcons, iconGrid, selectedIcon, selectedIconName);
    
    // Icon-Suche
    iconSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        let filteredIcons = window.materialIcons;
        
        if (searchTerm) {
            filteredIcons = window.materialIcons.filter(icon => 
                icon.toLowerCase().includes(searchTerm)
            );
        }
        
        renderIconGrid(filteredIcons, iconGrid, selectedIcon, selectedIconName);
    });
}

/**
 * Rendert das Icon-Grid
 */
function renderIconGrid(icons, gridElement, selectedIconElement, selectedIconNameElement) {
    gridElement.innerHTML = '';
    
    icons.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        iconElement.innerHTML = `<span class="material-icons">${icon}</span>`;
        iconElement.title = icon;
        
        iconElement.addEventListener('click', function() {
            // Alle aktiven Icons entfernen
            document.querySelectorAll('.icon-item.active').forEach(item => {
                item.classList.remove('active');
            });
            
            // Dieses Icon als aktiv markieren
            this.classList.add('active');
            
            // Ausgewähltes Icon aktualisieren
            selectedIconElement.querySelector('.material-icons').textContent = icon;
            selectedIconNameElement.textContent = icon;
        });
        
        // Bereits ausgewähltes Icon als aktiv markieren
        if (selectedIconNameElement.textContent === icon) {
            iconElement.classList.add('active');
        }
        
        gridElement.appendChild(iconElement);
    });
}

/**
 * Aktualisiert den Backup-Status
 */
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

/**
 * Öffnet einen modalen Dialog
 */
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
}

/**
 * Erstellt ein Element für eine Kategorie
 */
function createCategoryElement(category) {
    const element = document.createElement('div');
    element.className = 'heuristic-card'; // Verwende die gleiche Klasse wie für Heuristiken
    element.dataset.id = category.id;
    
    // Beschreibung kürzen, wenn sie zu lang ist
    let shortDescription = category.description || '';
    if (shortDescription.length > 120) {
        shortDescription = shortDescription.substring(0, 120) + '...';
    }
    
    // HTML für das Element (im Kachel-Design)
    element.innerHTML = `
        <div class="heuristic-icon">
            <span class="material-icons">${category.icon || 'help'}</span>
        </div>
        
        <h3 class="heuristic-title">${category.name}</h3>
        
        ${shortDescription ? `<div class="heuristic-description">${shortDescription}</div>` : ''}
        
        <div class="heuristic-meta">
            <span class="heuristic-count">${dataManager.getCategoryUsageCount(category.id)} Heuristik(en)</span>
        </div>
        
        <div class="heuristic-actions">
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
        openCategoryEditor(category.id);
    });
    
    element.querySelector('.delete-button').addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteCategory(category.id, category.name);
    });
    
    // Klick auf die gesamte Karte öffnet den Editor
    element.addEventListener('click', () => {
        openCategoryEditor(category.id);
    });
    
    return element;
}

/**
 * Öffnet den Editor für eine Kategorie
 */
function openCategoryEditor(categoryId) {
    // Modal-Titel setzen
    modalTitle.textContent = categoryId ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen';
    
    // Formular zurücksetzen
    categoryForm.reset();
    document.querySelectorAll('.icon-item.active').forEach(item => {
        item.classList.remove('active');
    });
    
    // Icon-Auswahl zurücksetzen
    const selectedIcon = document.getElementById('selectedIcon').querySelector('.material-icons');
    const selectedIconName = document.getElementById('selectedIconName');
    selectedIcon.textContent = 'help';
    selectedIconName.textContent = 'Kein Icon ausgewählt';
    
    if (categoryId) {
        // Bestehende Kategorie laden
        const category = dataManager.getCategoryById(categoryId);
        
        if (category) {
            // Formular mit Daten füllen
            categoryIdInput.value = category.id;
            categoryNameInput.value = category.name;
            categoryDescriptionInput.value = category.description || '';
            
            // Icon setzen, falls vorhanden
            if (category.icon) {
                selectedIcon.textContent = category.icon;
                selectedIconName.textContent = category.icon;
                
                // Das entsprechende Icon im Grid als aktiv markieren
                const iconItems = document.querySelectorAll('.icon-item');
                iconItems.forEach(item => {
                    if (item.title === category.icon) {
                        item.classList.add('active');
                    }
                });
            }
        }
    } else {
        // Neue Kategorie, ID-Feld leeren
        categoryIdInput.value = '';
    }
    
    // Modal öffnen
    openModal(categoryModal);
}

/**
 * Verarbeitet das Absenden des Kategorie-Formulars
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Werte aus dem Formular auslesen
    const id = categoryIdInput.value;
    const name = categoryNameInput.value.trim();
    const description = categoryDescriptionInput.value.trim();
    const icon = document.getElementById('selectedIconName').textContent;
    
    // Validierung
    if (!name) {
        alert('Bitte geben Sie einen Namen für die Kategorie ein.');
        return;
    }
    
    // Kategorie-Objekt erstellen
    const category = {
        name,
        description: description || '',
        icon: icon !== 'Kein Icon ausgewählt' ? icon : null
    };
    
    // Bestehende Kategorie aktualisieren oder neue erstellen
    let success;
    
    if (id) {
        category.id = id;
        success = dataManager.updateCategory(category);
    } else {
        success = dataManager.addCategory(category);
    }
    
    if (success) {
        // Modal schließen und Liste aktualisieren
        closeModal(categoryModal);
        renderCategoriesList();
    } else {
        alert('Die Kategorie konnte nicht gespeichert werden.');
    }
}

/**
 * Öffnet den Bestätigungsdialog für das Löschen einer Kategorie
 */
function confirmDeleteCategory(categoryId, categoryName) {
    confirmMessage.textContent = `Möchten Sie die Kategorie "${categoryName}" wirklich löschen?`;
    
    // ID für den Bestätigungsdialog speichern
    confirmYesButton.dataset.categoryId = categoryId;
    
    // Modal öffnen
    openModal(confirmModal);
}

/**
 * Verarbeitet die Bestätigung zum Löschen
 */
function handleConfirmYes() {
    const categoryId = confirmYesButton.dataset.categoryId;
    
    if (categoryId) {
        // Prüfen, ob die Kategorie verwendet wird
        const usageCount = dataManager.getCategoryUsageCount(categoryId);
        
        if (usageCount > 0) {
            alert(`Diese Kategorie wird von ${usageCount} Heuristiken verwendet und kann nicht gelöscht werden.`);
            closeModal(confirmModal);
            return;
        }
        
        // Kategorie löschen
        const success = dataManager.deleteCategory(categoryId);
        
        if (success) {
            // Modal schließen und Liste aktualisieren
            closeModal(confirmModal);
            renderCategoriesList();
        } else {
            alert('Die Kategorie konnte nicht gelöscht werden.');
        }
    }
    
    // ID entfernen
    delete confirmYesButton.dataset.categoryId;
}

/**
 * Behandelt die Suche
 */
function handleSearch() {
    currentSearchTerm = searchInputElement.value.trim();
    renderCategoriesList();
}

/**
 * Behandelt den Export der Kategorien
 */
function handleExportCategories() {
    const categories = dataManager.getAllCategories();
    
    if (categories.length === 0) {
        alert('Es gibt keine Kategorien zum Exportieren.');
        return;
    }
    
    // JSON-Datei erstellen und herunterladen
    const categoriesJson = JSON.stringify(categories, null, 2);
    const blob = new Blob([categoriesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cx-heuristics-categories.json';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Rendert die Liste der Kategorien
 */
function renderCategoriesList() {
    // Kategorien abrufen
    let categories = dataManager.getAllCategories();
    
    // Nach Suchbegriff filtern
    if (currentSearchTerm) {
        categories = categories.filter(category => 
            category.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(currentSearchTerm.toLowerCase()))
        );
    }
    
    // Liste leeren
    categoriesListElement.innerHTML = '';
    
    // Keine Kategorien gefunden
    if (categories.length === 0) {
        categoriesListElement.innerHTML = '<div class="loading-indicator">Keine Kategorien gefunden</div>';
        return;
    }
    
    // Container für das Kachel-Grid erstellen
    const gridContainer = document.createElement('div');
    gridContainer.className = 'heuristics-grid';
    categoriesListElement.appendChild(gridContainer);
    
    // Kategorien anzeigen
    categories.forEach(category => {
        const categoryElement = createCategoryElement(category);
        gridContainer.appendChild(categoryElement);
    });
}

/**
 * Schließt einen modalen Dialog
 */
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Scrollen wieder erlauben
}

/**
 * Schließt alle modalen Dialoge
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => closeModal(modal));
}

// Initialisierung starten, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', init);
