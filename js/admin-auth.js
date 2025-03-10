/**
 * Admin Authentication für CX Heuristics
 * Verwaltet die Passwortauthentifizierung für den Admin-Bereich
 */

// Festes Passwort für den Admin-Bereich
const ADMIN_PASSWORD = 'cxadmin123';

// Speicherschlüssel für localStorage
const AUTH_KEY = 'cx_heuristics_auth';

// Prüfen, ob der Benutzer bereits authentifiziert ist
function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === 'true';
}

// Authentifizierungsstatus setzen
function setAuthenticated(status) {
    localStorage.setItem(AUTH_KEY, status ? 'true' : 'false');
}

// Admin-Links abfangen und Authentifizierung prüfen
function setupAdminLinks() {
    const adminLinks = document.querySelectorAll('a.admin-link');
    
    adminLinks.forEach(link => {
        // Original-Href speichern
        const originalHref = link.getAttribute('href');
        
        // Klick-Event überschreiben
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Wenn bereits authentifiziert, direkt zum Admin-Bereich weiterleiten
            if (isAuthenticated()) {
                window.location.href = originalHref;
                return;
            }
            
            // Passwort abfragen
            const password = prompt('Bitte geben Sie das Admin-Passwort ein:');
            
            // Passwort prüfen
            if (password === ADMIN_PASSWORD) {
                setAuthenticated(true);
                window.location.href = originalHref;
            } else {
                alert('Falsches Passwort!');
            }
        });
    });
}

// Event-Listener für das DOM-Ready-Event
document.addEventListener('DOMContentLoaded', setupAdminLinks);
