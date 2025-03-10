# Deploying CX-Heuristics to Heroku

Diese Anleitung erklärt, wie Sie die CX-Heuristics-Anwendung auf Heroku deployen können.

## Schritt 1: Heroku-Konto erstellen

1. Besuchen Sie [heroku.com](https://www.heroku.com/)
2. Klicken Sie auf "Sign up" und erstellen Sie ein kostenloses Konto
3. Verifizieren Sie Ihre E-Mail-Adresse

## Schritt 2: Heroku CLI installieren

1. Laden Sie die Heroku Command Line Interface (CLI) herunter und installieren Sie sie:
   - Für macOS: `brew install heroku/brew/heroku`
   - Für Windows: Laden Sie das Installer-Paket von der [Heroku Dev Center](https://devcenter.heroku.com/articles/heroku-cli) herunter
   - Für Linux: `sudo snap install heroku --classic`

2. Melden Sie sich in der CLI an:
   ```bash
   heroku login
   ```
   
   Dies öffnet einen Browser, in dem Sie sich bei Ihrem Heroku-Konto anmelden können.

## Schritt 3: Anwendung für Heroku vorbereiten

Für Heroku müssen wir eine Procfile-Datei erstellen, die angibt, wie die Anwendung gestartet werden soll:

1. Erstellen Sie eine Datei namens `Procfile` (ohne Dateiendung) im Hauptverzeichnis mit folgendem Inhalt:
   ```
   web: cd server && node server.js
   ```

2. Verschieben Sie die package.json Datei aus dem server-Verzeichnis in das Hauptverzeichnis und aktualisieren Sie sie:
   ```bash
   # Kopieren Sie die package.json aus dem server-Verzeichnis
   cp server/package.json package.json
   ```

3. Bearbeiten Sie die package.json im Hauptverzeichnis, um Folgendes hinzuzufügen:
   ```json
   {
     "name": "cx-heuristics",
     "version": "1.0.0",
     "description": "CX Heuristics application",
     "engines": {
       "node": "16.x"
     },
     "scripts": {
       "start": "cd server && node server.js"
     },
     "dependencies": {
       "cors": "^2.8.5",
       "express": "^4.18.2",
       "morgan": "^1.10.0"
     }
   }
   ```

## Schritt 4: Heroku-App erstellen und deployen

1. Erstellen Sie eine neue Heroku-App:
   ```bash
   heroku create cx-heuristics
   ```
   
   Falls der Name bereits vergeben ist, können Sie einen anderen Namen wählen oder den Namen weglassen, damit Heroku einen zufälligen Namen generiert.

2. Deployen Sie Ihre Anwendung:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Heroku deployment"
   git push heroku master
   ```

   Alternativ, wenn Sie Git nicht verwenden möchten, können Sie auch das Heroku CLI-Deployment verwenden:
   ```bash
   heroku plugins:install heroku-cli-deploy
   heroku builds:create --include-vcs-ignore
   ```

## Schritt 5: App öffnen und testen

Nach erfolgreichem Deployment können Sie Ihre App öffnen:

```bash
heroku open
```

Dies öffnet Ihre App in einem Webbrowser. Die URL hat typischerweise das Format `https://app-name.herokuapp.com`.

## Schritt 6: Logs überprüfen (bei Bedarf)

Falls Probleme auftreten, können Sie die Logs überprüfen:

```bash
heroku logs --tail
```

## Ihre Anwendung aktualisieren

Um Ihre Anwendung zu aktualisieren:

1. Nehmen Sie Änderungen an Ihrem lokalen Code vor
2. Wenn Sie Git verwenden:
   ```bash
   git add .
   git commit -m "Beschreibung der Änderungen"
   git push heroku master
   ```

3. Wenn Sie das CLI-Deployment verwenden:
   ```bash
   heroku builds:create --include-vcs-ignore
   ```

## Wichtige Hinweise zu Heroku

- Heroku verwendet ein **Ephemeral Filesystem** - alle Änderungen am Dateisystem gehen beim Neustart verloren. Persistente Daten sollten in einer externen Datenbank gespeichert werden.
- Heroku-Apps werden in den Ruhezustand versetzt, wenn sie 30 Minuten lang nicht genutzt wurden, was zu einer Verzögerung bei der ersten Anfrage führen kann.
- Zum Aktivieren halten können Sie einen Service wie [Kaffeine](https://kaffeine.herokuapp.com/) verwenden, um regelmäßige Pings an Ihre App zu senden.
