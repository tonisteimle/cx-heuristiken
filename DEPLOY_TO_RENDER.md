# Deploying CX-Heuristics to Render

Diese Anleitung erklärt, wie Sie die CX-Heuristics-Anwendung auf Render.com deployen können.

## Schritt 1: GitHub-Repository erstellen

Da Render.com eine Verbindung zu einem Git-Repository (GitHub, GitLab oder Bitbucket) erfordert, müssen wir zuerst ein Repository erstellen:

1. Besuchen Sie [github.com](https://github.com) und melden Sie sich an
2. Klicken Sie auf das "+" Symbol oben rechts und wählen Sie "New repository"
3. Nennen Sie das Repository "cx-heuristiken" (oder einen anderen Namen Ihrer Wahl)
4. Wählen Sie "Public" oder "Private"
5. Klicken Sie auf "Create repository"

## Schritt 2: Lokales Projekt mit GitHub verbinden

Führen Sie folgende Befehle in Ihrem Terminal aus:

```bash
# Git-Repository initialisieren (falls noch nicht geschehen)
git init

# Lokale Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit"

# Remote-Repository hinzufügen (ersetzen Sie USERNAME durch Ihren GitHub-Benutzernamen)
git remote add origin https://github.com/USERNAME/cx-heuristiken.git

# Lokalen Code zum Remote-Repository pushen
git push -u origin main
```

## Schritt 3: Web Service auf Render erstellen

1. Melden Sie sich bei Ihrem Render-Dashboard an
2. Klicken Sie auf "New +" und wählen Sie "Web Service"
3. Wählen Sie zwischen GitHub, GitLab oder Bitbucket als Repository-Quelle
4. Verbinden Sie Ihr Repository mit Render, indem Sie den Anweisungen folgen
5. Wählen Sie das "cx-heuristiken"-Repository aus der Liste aus

## Schritt 4: Web Service konfigurieren

Verwenden Sie folgende Einstellungen:
- **Name**: cx-heuristics (oder ein Name Ihrer Wahl)
- **Region**: Wählen Sie einen Standort in Ihrer Nähe (z.B. Frankfurt)
- **Branch**: main
- **Runtime**: Node
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node server.js`
- **Auto-Deploy**: Aktivieren (Standard)

## Schritt 5: Umgebungsvariablen konfigurieren (optional)

Standardmäßig sind keine zusätzlichen Umgebungsvariablen erforderlich, aber Sie können hinzufügen:
- `PORT`: Render stellt dies automatisch bereit, aber Sie können es bei Bedarf überschreiben

## Schritt 6: Service deployen

1. Klicken Sie auf "Create Web Service"
2. Warten Sie, bis das Deployment abgeschlossen ist (dies kann einige Minuten dauern)

## Auf Ihre bereitgestellte Anwendung zugreifen

Nach erfolgreichem Deployment stellt Render eine URL für Ihre Anwendung bereit, typischerweise im Format:
`https://cx-heuristics.onrender.com`

## Ihre Anwendung aktualisieren

Um Ihre Anwendung nach Änderungen zu aktualisieren:
1. Nehmen Sie Änderungen an Ihrem lokalen Code vor
2. Fügen Sie die Änderungen zu Git hinzu: `git add .`
3. Erstellen Sie einen Commit: `git commit -m "Beschreiben Sie Ihre Änderungen"`
4. Pushen Sie zum GitHub-Repository: `git push`
5. Render wird automatisch ein neues Deployment starten

## Fehlerbehebung

Wenn bei Ihrem Deployment Probleme auftreten:
1. Überprüfen Sie die Render-Logs auf Fehlermeldungen
2. Stellen Sie sicher, dass alle erforderlichen Dateien in Ihrem Repository enthalten sind
3. Überprüfen Sie, ob die Build- und Start-Befehle korrekt sind
4. Stellen Sie sicher, dass Ihr Express-Server so konfiguriert ist, dass er auf die PORT-Umgebungsvariable hört

## Alternative Deployment-Methoden

Falls Sie kein GitHub-Repository verwenden möchten, bieten folgende Dienste direkte ZIP-Upload- oder CLI-Deployment-Optionen:
- [Vercel](https://vercel.com) (unterstützt lokales Deployment über die Vercel CLI)
- [Netlify](https://www.netlify.com) (unterstützt Drag & Drop-Deployment von ZIP-Dateien)
- [Heroku](https://www.heroku.com) (unterstützt Deployment über die Heroku CLI)
