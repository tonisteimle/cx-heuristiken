/**
 * Data Manager für CX Heuristics Admin mit Server-Anbindung
 * Verwaltet die Kommunikation mit dem Backend-Server für Heuristik-Daten
 */

class DataManager {
    constructor() {
        // API-URL (kann für Produktionsumgebungen angepasst werden)
        this.API_URL = 'http://localhost:3000/api';
        
        // Daten
        this.heuristics = [];
        this.categories = [];
        
        // Event-Callbacks
        this.onDataChanged = null;
        this.onError = null;
        this.onBackupCreated = null;
        
        // Konstanten für LocalStorage
        this.LAST_BACKUP_TIME_KEY = 'cx_heuristics_last_backup_time';
    }
    
    /**
     * Initialisiert den DataManager und lädt Daten vom Server
     * @returns {Promise} Promise, das resolved, wenn die Daten geladen sind
     */
    init() {
        return this.loadAllData();
    }
    
    /**
     * Lädt alle Daten vom Server (Heuristiken und Kategorien)
     * @returns {Promise} Promise, das resolved, wenn die Daten geladen sind
     */
    loadAllData() {
        return fetch(`${this.API_URL}/data`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Verarbeiten der neuen Datenstruktur
                this.processData(data);
                console.log('Daten vom Server geladen');
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return data;
            })
            .catch(error => {
                console.error('Fehler beim Laden der Daten vom Server:', error);
                this.handleError(error);
                
                // Versuche Daten von lokaler JSON-Datei zu laden
                return fetch('/data/heuristics.json')
                    .then(response => {
                        if (!response.ok) {
                            throw error; // Rethrow original error if local file also fails
                        }
                        return response.json();
                    })
                    .then(data => {
                        this.processData(data);
                        console.log('Daten von lokaler JSON-Datei geladen');
                        
                        if (typeof this.onDataChanged === 'function') {
                            this.onDataChanged();
                        }
                        
                        return data;
                    })
                    .catch(() => {
                        // Wenn auch die lokale Datei nicht funktioniert, leere Daten zurückgeben
                        return { categories: [] };
                    });
            });
    }
    
    /**
     * Verarbeitet die Daten aus dem neuen Format (Kategorien mit eingebetteten Heuristiken)
     * @param {Object} data Die zu verarbeitenden Daten
     */
    processData(data) {
        this.categories = data.categories || [];
        this.heuristics = [];
        
        // Heuristiken aus den Kategorien extrahieren
        if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach(category => {
                if (category.heuristics && Array.isArray(category.heuristics)) {
                    category.heuristics.forEach(heuristic => {
                        // Heuristik mit Kategorie-Informationen anreichern
                        this.heuristics.push({
                            ...heuristic,
                            categoryId: category.id,
                            // Wenn category-Array nicht existiert, erstelle es
                            category: heuristic.category || [category.name]
                        });
                    });
                }
            });
        } else if (data.heuristics) {
            // Fallback für altes Format
            this.heuristics = data.heuristics;
        }
    }
    
    /**
     * Lädt alle Heuristiken vom Server
     * @returns {Promise} Promise, das mit den Heuristiken resolved
     */
    loadHeuristics() {
        return fetch(`${this.API_URL}/heuristics`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(heuristics => {
                this.heuristics = heuristics;
                return heuristics;
            })
            .catch(error => {
                console.error('Fehler beim Laden der Heuristiken:', error);
                this.handleError(error);
                return [];
            });
    }
    
    /**
     * Lädt alle Kategorien vom Server
     * @returns {Promise} Promise, das mit den Kategorien resolved
     */
    loadCategories() {
        return fetch(`${this.API_URL}/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(categories => {
                this.categories = categories;
                return categories;
            })
            .catch(error => {
                console.error('Fehler beim Laden der Kategorien:', error);
                this.handleError(error);
                return [];
            });
    }
    
    /**
     * Lädt eine einzelne Heuristik vom Server
     * @param {string} id Die ID der zu ladenden Heuristik
     * @returns {Promise} Promise, das mit der Heuristik resolved
     */
    loadHeuristic(id) {
        return fetch(`${this.API_URL}/heuristics/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Fehler beim Laden der Heuristik ${id}:`, error);
                this.handleError(error);
                return null;
            });
    }
    
    /**
     * Gibt alle Heuristiken zurück
     * @returns {Array} Alle Heuristiken
     */
    getAllHeuristics() {
        return this.heuristics;
    }
    
    /**
     * Gibt alle Kategorien zurück
     * @returns {Array} Alle Kategorien
     */
    getAllCategories() {
        return this.categories;
    }
    
    /**
     * Fügt eine neue Heuristik hinzu oder aktualisiert eine bestehende
     * @param {Object} heuristic Die zu speichernde Heuristik
     * @returns {Promise} Promise, das mit der gespeicherten Heuristik resolved
     */
    saveHeuristic(heuristic) {
        // Wenn keine ID vorhanden ist, erstelle eine neue Heuristik
        if (!heuristic.id) {
            return this.createHeuristic(heuristic);
        } else {
            return this.updateHeuristic(heuristic.id, heuristic);
        }
    }
    
    /**
     * Erstellt eine neue Heuristik auf dem Server
     * @param {Object} heuristic Die zu erstellende Heuristik
     * @returns {Promise} Promise, das mit der erstellten Heuristik resolved
     */
    createHeuristic(heuristic) {
        return fetch(`${this.API_URL}/heuristics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heuristic)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(newHeuristic => {
                // Lokale Daten aktualisieren
                this.heuristics.push(newHeuristic);
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return newHeuristic;
            })
            .catch(error => {
                console.error('Fehler beim Erstellen der Heuristik:', error);
                this.handleError(error);
                return null;
            });
    }
    
    /**
     * Aktualisiert eine bestehende Heuristik auf dem Server
     * @param {string} id Die ID der zu aktualisierenden Heuristik
     * @param {Object} heuristic Die aktualisierte Heuristik
     * @returns {Promise} Promise, das mit der aktualisierten Heuristik resolved
     */
    updateHeuristic(id, heuristic) {
        return fetch(`${this.API_URL}/heuristics/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heuristic)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedHeuristic => {
                // Lokale Daten aktualisieren
                const index = this.heuristics.findIndex(h => h.id === id);
                if (index !== -1) {
                    this.heuristics[index] = updatedHeuristic;
                }
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return updatedHeuristic;
            })
            .catch(error => {
                console.error(`Fehler beim Aktualisieren der Heuristik ${id}:`, error);
                this.handleError(error);
                return null;
            });
    }
    
    /**
     * Löscht eine Heuristik auf dem Server
     * @param {string} id Die ID der zu löschenden Heuristik
     * @returns {Promise} Promise, das mit der gelöschten Heuristik resolved
     */
    deleteHeuristic(id) {
        return fetch(`${this.API_URL}/heuristics/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(deletedHeuristic => {
                // Lokale Daten aktualisieren
                this.heuristics = this.heuristics.filter(h => h.id !== id);
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return deletedHeuristic;
            })
            .catch(error => {
                console.error(`Fehler beim Löschen der Heuristik ${id}:`, error);
                this.handleError(error);
                return false;
            });
    }
    
    /**
     * Speichert eine Kategorie (neu oder aktualisiert)
     * @param {Object} category Die zu speichernde Kategorie
     * @returns {Promise} Promise, das mit der gespeicherten Kategorie resolved
     */
    saveCategory(category) {
        // Wenn keine ID vorhanden ist, erstelle eine neue Kategorie
        if (!category.id) {
            return this.createCategory(category);
        } else {
            return this.updateCategory(category.id, category);
        }
    }
    
    /**
     * Erstellt eine neue Kategorie auf dem Server
     * @param {Object} category Die zu erstellende Kategorie
     * @returns {Promise} Promise, das mit der erstellten Kategorie resolved
     */
    createCategory(category) {
        return fetch(`${this.API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(newCategory => {
                // Lokale Daten aktualisieren
                this.categories.push(newCategory);
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return newCategory;
            })
            .catch(error => {
                console.error('Fehler beim Erstellen der Kategorie:', error);
                this.handleError(error);
                return null;
            });
    }
    
    /**
     * Aktualisiert eine bestehende Kategorie auf dem Server
     * @param {string} id Die ID der zu aktualisierenden Kategorie
     * @param {Object} category Die aktualisierte Kategorie
     * @returns {Promise} Promise, das mit der aktualisierten Kategorie resolved
     */
    updateCategory(id, category) {
        return fetch(`${this.API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedCategory => {
                // Lokale Daten aktualisieren
                const index = this.categories.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.categories[index] = updatedCategory;
                }
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return updatedCategory;
            })
            .catch(error => {
                console.error(`Fehler beim Aktualisieren der Kategorie ${id}:`, error);
                this.handleError(error);
                return null;
            });
    }
    
    /**
     * Löscht eine Kategorie auf dem Server
     * @param {string} id Die ID der zu löschenden Kategorie
     * @returns {Promise} Promise, das mit der gelöschten Kategorie resolved
     */
    deleteCategory(id) {
        return fetch(`${this.API_URL}/categories/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server-Fehler: ${response.status}`);
                }
                return response.json();
            })
            .then(deletedCategory => {
                // Lokale Daten aktualisieren
                this.categories = this.categories.filter(c => c.id !== id);
                
                // Event auslösen, wenn vorhanden
                if (typeof this.onDataChanged === 'function') {
                    this.onDataChanged();
                }
                
                return deletedCategory;
            })
            .catch(error => {
                console.error(`Fehler beim Löschen der Kategorie ${id}:`, error);
                this.handleError(error);
                return false;
            });
    }
    
    /**
     * Generiert eine ID aus einem Text
     * @param {string} text Der Text, aus dem die ID generiert werden soll
     * @returns {string} Die generierte ID
     */
    generateId(text) {
        return text
            .toLowerCase()
            .replace(/[äöüß]/g, match => {
                // Umlaute ersetzen
                const replacements = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
                return replacements[match] || match;
            })
            .replace(/[^a-z0-9]+/g, '-') // Nicht-alphanumerische Zeichen durch Bindestrich ersetzen
            .replace(/^-+|-+$/g, ''); // Bindestriche am Anfang und Ende entfernen
    }
    
    /**
     * Sucht Heuristiken anhand eines Suchbegriffs
     * @param {string} searchTerm Der Suchbegriff
     * @returns {Array} Die gefundenen Heuristiken
     */
    searchHeuristics(searchTerm) {
        if (!searchTerm) return this.heuristics;
        
        const term = searchTerm.toLowerCase();
        
        return this.heuristics.filter(h => {
            return (
                h.title.toLowerCase().includes(term) ||
                h.shortDescription.toLowerCase().includes(term) ||
                h.guideline.toLowerCase().includes(term) ||
                h.reasoning && h.reasoning.toLowerCase().includes(term) ||
                (h.category && h.category.some(c => c.toLowerCase().includes(term)))
            );
        });
    }
    
    /**
     * Filtert Heuristiken nach einer Kategorie
     * @param {string} categoryName Der Name der Kategorie
     * @returns {Array} Die gefilterten Heuristiken
     */
    filterByCategory(categoryName) {
        if (!categoryName) return this.heuristics;
        
        return this.heuristics.filter(h => {
            // Prüfe sowohl auf category-Array als auch auf categoryId
            return (h.category && h.category.includes(categoryName)) || 
                   (h.categoryId && this.categories.find(c => c.id === h.categoryId && c.name === categoryName));
        });
    }
    
    /**
     * Behandelt Fehler bei API-Anfragen
     * @param {Error} error Der aufgetretene Fehler
     */
    handleError(error) {
        console.error('API-Fehler:', error);
        
        if (typeof this.onError === 'function') {
            this.onError(error);
        }
    }
    
    /**
     * Exportiert alle Daten als JSON-Datei
     */
    exportData() {
        // Daten im neuen Format vorbereiten
        const exportCategories = this.categories.map(category => {
            // Deep copy der Kategorie erstellen
            const categoryCopy = { ...category };
            
            // Heuristiken dieser Kategorie finden
            const categoryHeuristics = this.heuristics.filter(h => 
                h.categoryId === category.id || 
                (h.category && h.category.includes(category.name))
            );
            
            // Bereite Heuristiken vor (entferne categoryId und andere temporäre Felder)
            categoryCopy.heuristics = categoryHeuristics.map(h => {
                const { categoryId, ...heuristicData } = h;
                return heuristicData;
            });
            
            return categoryCopy;
        });
        
        // Daten zum Export vorbereiten
        const data = {
            categories: exportCategories,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // JSON erstellen
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Download-Link erstellen
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cx-heuristics-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Lokales Backup erstellen
        this.createLocalBackup(data);
    }
    
    /**
     * Importiert Daten aus einer JSON-Datei
     * @param {File} file Die zu importierende Datei
     * @returns {Promise} Promise, das resolved, wenn die Daten importiert wurden
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            console.log("ImportData aufgerufen mit:", file);
            
            if (!file) {
                console.error("Fehler: Keine Datei übergeben");
                reject(new Error('Keine Datei ausgewählt'));
                return;
            }
            
            // JSON-Dateien haben manchmal den MIME-Type "application/json" 
            // oder bei manueller Erstellung oft "text/plain"
            if (file.type !== 'application/json' && file.type !== 'text/plain' && !file.name.endsWith('.json')) {
                console.error("Fehler: Falscher Dateityp", file.type);
                reject(new Error('Bitte wählen Sie eine JSON-Datei aus'));
                return;
            }
            
            console.log("Datei wird gelesen:", file.name, file.type, file.size + " bytes");
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                console.log("FileReader: Datei gelesen, Inhalt verfügbar");
                try {
                    // JSON parsen
                    const jsonContent = e.target.result;
                    console.log("Inhalt erhalten, Länge:", jsonContent.length);
                    
                    const data = JSON.parse(jsonContent);
                    console.log("JSON erfolgreich geparst:", Object.keys(data));
                    
                    // Daten validieren
                    if (!data.heuristics || !Array.isArray(data.heuristics)) {
                        console.error("Ungültiges Format: Keine Heuristiken gefunden");
                        reject(new Error('Die Datei enthält keine gültigen Heuristik-Daten'));
                        return;
                    }
                    
                    console.log(`${data.heuristics.length} Heuristiken in der Datei gefunden`);
                    
                    // Vorhandene und neue Kategorien zusammenführen
                    if (data.categories && Array.isArray(data.categories)) {
                        console.log(`${data.categories.length} Kategorien in der Datei gefunden`);
                        
                        // IDs für Kategorien generieren, falls nicht vorhanden
                        for (const category of data.categories) {
                            if (!category.id && category.name) {
                                category.id = this.generateId(category.name);
                            }
                        }
                        
                        // Nach Duplikaten prüfen und nur neue Kategorien hinzufügen
                        const existingCategoryIds = this.categories.map(c => c.id);
                        const newCategories = data.categories.filter(c => 
                            !existingCategoryIds.includes(c.id)
                        );
                        
                        console.log(`${newCategories.length} neue Kategorien zum Importieren`);
                        
                        // Neue Kategorien zum Server hochladen
                        for (const category of newCategories) {
                            console.log(`Kategorie wird erstellt: ${category.name}`);
                            await this.createCategory(category);
                        }
                    }
                    
                    // IDs für Heuristiken generieren, falls nicht vorhanden
                    for (const heuristic of data.heuristics) {
                        if (!heuristic.id && heuristic.title) {
                            heuristic.id = this.generateId(heuristic.title);
                        }
                    }
                    
                    // Nach Duplikaten prüfen und nur neue Heuristiken hinzufügen
                    const existingHeuristicIds = this.heuristics.map(h => h.id);
                    const newHeuristics = data.heuristics.filter(h => 
                        !existingHeuristicIds.includes(h.id)
                    );
                    
                    console.log(`${newHeuristics.length} neue Heuristiken zum Importieren`);
                    
                    // Neue Heuristiken zum Server hochladen
                    for (const heuristic of newHeuristics) {
                        console.log(`Heuristik wird erstellt: ${heuristic.title}`);
                        await this.createHeuristic(heuristic);
                    }
                    
                    // Daten neu laden
                    console.log("Daten werden neu vom Server geladen");
                    await this.loadAllData();
                    
                    const result = {
                        addedHeuristics: newHeuristics.length,
                        addedCategories: data.categories ? 
                            data.categories.filter(c => !existingCategoryIds.includes(c.id)).length : 0
                    };
                    
                    console.log("Import abgeschlossen:", result);
                    resolve(result);
                } catch (error) {
                    console.error('Fehler beim Importieren der Daten:', error);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error("FileReader Fehler:", error);
                reject(new Error('Fehler beim Lesen der Datei'));
            };
            
            reader.readAsText(file);
            console.log("FileReader.readAsText aufgerufen");
        });
    }
    
    /**
     * Erstellt ein lokales Backup der Daten
     * @param {Object} data Die zu sichernden Daten
     */
    createLocalBackup(data) {
        try {
            const now = new Date();
            localStorage.setItem('cx_heuristics_backup', JSON.stringify(data));
            localStorage.setItem(this.LAST_BACKUP_TIME_KEY, now.toISOString());
            
            // Event auslösen, wenn vorhanden
            if (typeof this.onBackupCreated === 'function') {
                this.onBackupCreated(now);
            }
            
            console.log('Lokales Backup erstellt');
        } catch (error) {
            console.error('Fehler beim Erstellen des lokalen Backups:', error);
        }
    }
}

// Globalen DataManager erstellen
const dataManager = new DataManager();
