# Deploying CX-Heuristics to Netlify

Diese Anleitung erklärt, wie Sie die CX-Heuristics-Anwendung auf Netlify deployen können ohne ein Git-Repository zu benötigen.

## Schritt 1: Netlify-Konto erstellen

1. Besuchen Sie [netlify.com](https://www.netlify.com/)
2. Klicken Sie auf "Sign up" und erstellen Sie ein Konto (Sie können sich auch mit GitHub, GitLab oder anderen Diensten anmelden)
3. Verifizieren Sie Ihre E-Mail-Adresse

## Schritt 2: Anwendung für Netlify vorbereiten

Netlify ist primär für statische Websites konzipiert. Da unsere Anwendung einen Express-Server verwendet, müssen wir die Serverless-Funktionen von Netlify nutzen. Führen Sie folgende Schritte aus:

1. Verwenden Sie das bereits erstellte ZIP-Paket `cx-heuristics-deploy.zip`
2. Entpacken Sie die ZIP-Datei in ein temporäres Verzeichnis

## Schritt 3: Deployment auf Netlify

1. Melden Sie sich bei Ihrem Netlify-Dashboard an
2. Ziehen Sie die entpackte Projektordner direkt auf den Bereich "Drag and drop your site folder here" auf dem Netlify-Dashboard
   - Alternativ: Klicken Sie auf "Sites" und dann auf "Add new site" → "Deploy manually"

## Schritt 4: Site-Einstellungen konfigurieren

Nach dem Upload konfigurieren Sie:

1. **Site name**: Wählen Sie einen benutzerdefinierten Namen (z.B. "cx-heuristics") oder akzeptieren Sie den generierten Namen
2. **Build command**: Lassen Sie dieses Feld leer (wir haben die Dateien bereits vorbereitet)
3. **Publish directory**: Geben Sie `.` ein (aktuelles Verzeichnis, da wir direkt die Dateien hochgeladen haben)

## Schritt 5: Netlify Functions für den Server einrichten (optional)

Wenn Sie die vollständige Serverfunktionalität benötigen:

1. Erstellen Sie im Root-Verzeichnis eine Datei `netlify.toml` mit folgendem Inhalt:
```toml
[build]
  functions = "functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

2. Erstellen Sie einen `functions`-Ordner und verschieben Sie die Serverlogik dorthin
3. Passen Sie Ihren Express-Server an, um als Netlify-Funktion zu funktionieren

## Zugriff auf Ihre bereitgestellte Anwendung

Nach erfolgreichem Deployment stellt Netlify eine URL für Ihre Anwendung bereit, typischerweise im Format:
`https://your-site-name.netlify.app`

## Ihre Anwendung aktualisieren

Um Ihre Anwendung zu aktualisieren:
1. Nehmen Sie Änderungen an Ihrem lokalen Code vor
2. Erstellen Sie eine neue ZIP-Datei mit dem aktualisierten Projekt
3. Gehen Sie zu Ihrem Site-Dashboard auf Netlify
4. Wählen Sie "Deploys" und dann "Drag and drop" für ein manuelles Update
5. Ziehen Sie die aktualisierte ZIP-Datei oder den Projektordner in den Bereich

## Alternative: Deployment über die Netlify CLI

Für mehr Kontrolle können Sie die Netlify Command Line Interface (CLI) verwenden:

1. Installieren Sie die Netlify CLI: `npm install netlify-cli -g`
2. Melden Sie sich an: `netlify login`
3. Verbinden Sie mit Ihrer Site: `netlify link`
4. Deployen Sie: `netlify deploy --prod`

## Limitierungen bei Netlify

Bitte beachten Sie, dass die kostenlose Version von Netlify einige Einschränkungen hat:
- Serverlose Funktionen haben eine Ausführungszeitbegrenzung
- Eingeschränkte Anzahl von Build-Minuten pro Monat
- Möglicherweise müssen Sie den Express-Server für Netlify Functions anpassen

Falls Sie einen vollwertigen Node.js-Server benötigen, empfehlen sich alternativ Dienste wie Heroku oder Railway.app
