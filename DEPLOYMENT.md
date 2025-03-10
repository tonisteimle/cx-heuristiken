# Deployment-Optionen für CX-Heuristics

Dieses Dokument bietet einen Überblick über die verschiedenen Möglichkeiten, wie Sie Ihre CX-Heuristics-Anwendung deployen können.

## Überblick

Die Anwendung besteht aus:
- Statischen Frontend-Dateien (HTML, CSS, JavaScript)
- Einem Node.js/Express-Backend-Server
- JSON-Datendateien zur Speicherung der Heuristiken

Je nach Ihren Anforderungen und Vorlieben können Sie zwischen verschiedenen Hosting-Plattformen wählen.

## Verfügbare Deployment-Optionen

### 1. Render.com

**Vorteile:**
- Einfache Konfiguration
- Kostenloser Einstiegsplan
- Leistungsstarkes Backend für Node.js-Anwendungen
- Automatische Deployments bei Code-Änderungen

**Nachteile:**
- Erfordert ein Git-Repository (GitHub, GitLab oder Bitbucket)
- Kostenloser Plan hat Einschränkungen (Server wird im Ruhezustand versetzt)

[Detaillierte Anleitung: DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md)

### 2. Netlify

**Vorteile:**
- Unterstützt direktes Hochladen von ZIP-Dateien oder Ordnern
- Sehr schneller CDN
- Kostenloser Einstiegsplan
- Kein Git-Repository erforderlich

**Nachteile:**
- Primär für statische Websites konzipiert
- Serverless-Funktionen haben Einschränkungen
- Express-Server muss für Serverless-Funktionen angepasst werden

[Detaillierte Anleitung: DEPLOY_TO_NETLIFY.md](./DEPLOY_TO_NETLIFY.md)

### 3. Heroku

**Vorteile:**
- Unterstützt Node.js-Anwendungen nativ
- Gut dokumentiert
- Flexible Deployment-Optionen (Git oder CLI)
- Kostenloser Einstiegsplan

**Nachteile:**
- Apps im kostenlosen Plan werden nach 30 Minuten Inaktivität in den Ruhezustand versetzt
- Ephemeres Dateisystem (Dateiänderungen gehen beim Neustart verloren)

[Detaillierte Anleitung: DEPLOY_TO_HEROKU.md](./DEPLOY_TO_HEROKU.md)

## Welche Option soll ich wählen?

- **Für Anfänger ohne Git-Erfahrung:** Netlify (ZIP-Upload) ist am einfachsten.
- **Für die beste Node.js-Unterstützung:** Render.com bietet die beste Balance aus Einfachheit und Leistung.
- **Für umfangreiche CI/CD-Integration:** Render.com oder Heroku mit Git-Deployment.
- **Für temporäre Demos oder Tests:** Netlify oder Heroku CLI-Deployment.

## Lokale Deployment-Vorbereitung

Für alle Plattformen haben wir ein praktisches ZIP-Erstellungsskript vorbereitet:

```bash
./create-deploy-zip.sh
```

Dies erstellt die Datei `cx-heuristics-deploy.zip`, die Sie für Netlify verwenden können oder als Basis für die anderen Deployment-Methoden.

## Nächste Schritte

Wählen Sie eine der oben genannten Plattformen und folgen Sie der jeweiligen Anleitung, um Ihre CX-Heuristics-Anwendung zu deployen.
