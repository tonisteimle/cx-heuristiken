# CX Heuristics

Eine Web-Applikation zur Verwaltung und Präsentation von CX (Customer Experience) Heuristiken. Die Anwendung bietet sowohl eine öffentliche Webseite zur Ansicht der Heuristiken als auch einen Admin-Bereich zur Verwaltung der Inhalte.

## Funktionen

- **Öffentliche Webseite**:
  - Übersicht aller Heuristiken
  - Filtern nach Kategorien
  - Detailansicht mit ausführlichen Informationen
  - Responsive Design für alle Geräte

- **Admin-Bereich**:
  - Passwortgeschützt (Standard: "cxadmin123")
  - Erstellen, Bearbeiten und Löschen von Heuristiken
  - Verwaltung von Kategorien
  - Import/Export von Daten

## Technologie-Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js mit Express
- **Daten**: JSON-Datei (kein Datenbank-Setup nötig)

## Installation und Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) (v12 oder höher)
- NPM (kommt mit Node.js)

### Setup

1. Repository klonen oder herunterladen
   ```bash
   git clone https://github.com/ihr-username/cx-heuristics.git
   cd cx-heuristics
   ```

2. Abhängigkeiten installieren
   ```bash
   cd server
   npm install
   ```

3. Server starten
   ```bash
   npm start
   ```

4. Im Browser öffnen
   - Webseite: [http://localhost:3000](http://localhost:3000)
   - Admin-Bereich: [http://localhost:3000/admin/index.html](http://localhost:3000/admin/index.html)

Alternativ kann für die Entwicklung das Skript `./restart.sh` verwendet werden, um den Server neu zu starten.

## Deployment

### Option 1: Render.com (empfohlen)

1. Repository auf GitHub oder GitLab hosten
2. Bei [Render.com](https://render.com/) anmelden
3. "New Web Service" auswählen
4. Mit GitHub/GitLab verbinden und Repository auswählen
5. Ausführungsbefehl `npm start` und Arbeitsverzeichnis `server` eintragen
6. Optional: Disk (Speicherplatz) für `/data` hinzufügen
7. Deploy klicken

### Option 2: Andere Hosting-Dienste

Die Anwendung kann auf jedem Dienst gehostet werden, der Node.js unterstützt:
- Railway.app
- Fly.io
- Heroku
- DigitalOcean
- AWS, Azure, Google Cloud

## Admin-Bereich

Der Admin-Bereich ist unter `/admin` zugänglich. Das Standardpasswort ist "cxadmin123" und kann in der Datei `js/admin-auth.js` geändert werden.

## Lizenz

[MIT Lizenz](LICENSE)

## Mitwirkende

- Ihr Name/Team
# cx-heuristiken
# cx-heuristiken
