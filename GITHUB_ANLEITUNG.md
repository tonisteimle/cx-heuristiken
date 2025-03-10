# GitHub-Repository für Ihr Projekt erstellen

Basierend auf Ihrer aktuellen Git-Konfiguration, erstellen wir ein passendes GitHub-Repository.

## Ihre aktuelle Git-Konfiguration

Ihr lokales Git-Repository ist wie folgt konfiguriert:
- Remote URL: `https://tonisteimle@github.com/tonisteimle/cx-heuristiken.git`
- Branch: `main`

Das bedeutet, Sie müssen ein GitHub-Repository mit genau diesen Parametern erstellen:
- Benutzername: `tonisteimle`
- Repository-Name: `cx-heuristiken`

## Schritt 1: GitHub-Repository erstellen

1. Besuchen Sie [github.com](https://github.com) und melden Sie sich mit Ihrem Konto `tonisteimle` an
2. Klicken Sie auf das "+" Symbol oben rechts und wählen Sie "New repository"
3. Geben Sie als Repository-Namen exakt `cx-heuristiken` ein (Groß-/Kleinschreibung beachten!)
4. Wählen Sie "Public" oder "Private" je nach Ihren Wünschen
5. **Wichtig:** Aktivieren Sie NICHT die Optionen wie "Add a README file" oder "Add .gitignore"
6. Klicken Sie auf "Create repository"

## Schritt 2: Lokalen Code auf GitHub pushen

Nachdem das Repository erstellt wurde, können Sie Ihren lokalen Code hochladen:

```bash
# Alle Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit"

# Zum GitHub-Repository pushen
git push -u origin main
```

Wenn Sie nach Authentifizierungsdaten gefragt werden:
1. Benutzername: `tonisteimle`
2. Passwort: Verwenden Sie ein Personal Access Token (PAT)
   - Falls Sie noch keines haben, folgen Sie der Anleitung im nächsten Abschnitt

## Schritt 3: Personal Access Token erstellen (falls benötigt)

Da GitHub die Passwort-Authentifizierung für Git-Operationen nicht mehr unterstützt, benötigen Sie ein Personal Access Token:

1. Gehen Sie zu [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Klicken Sie auf "Generate new token" (classic)
3. Geben Sie einen Namen ein (z.B. "CX-Heuristiken Deployment")
4. Setzen Sie ein Ablaufdatum (z.B. 90 Tage)
5. Aktivieren Sie die "repo" Berechtigungen (alle Checkboxen unter "repo")
6. Klicken Sie auf "Generate token"
7. **Wichtig:** Kopieren Sie das Token sofort und bewahren Sie es sicher auf

Verwenden Sie dieses Token anstelle Ihres Passworts, wenn Sie nach Anmeldedaten für Git gefragt werden.

## Schritt 4: Auf Render.com deployen

Sobald Ihr Code auf GitHub ist, folgen Sie diesen Schritten für das Deployment:

1. Melden Sie sich bei [Render.com](https://render.com) an
2. Klicken Sie auf "New +" und dann "Web Service"
3. Wählen Sie GitHub als Repository-Quelle
4. Verbinden Sie Ihren GitHub-Account, falls Sie dies noch nicht getan haben
5. Wählen Sie das Repository `tonisteimle/cx-heuristiken`
6. Konfigurieren Sie den Service mit folgenden Einstellungen:
   - Name: `cx-heuristics` (oder ein Name Ihrer Wahl)
   - Region: Wählen Sie einen Standort in Ihrer Nähe (z.B. Frankfurt)
   - Branch: `main`
   - Runtime: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node server.js`
7. Klicken Sie auf "Create Web Service"

## Fehlerbehebung

Falls Sie immer noch Probleme mit der Authentifizierung haben, können Sie versuchen:

```bash
# Gespeicherte Credentials löschen
git credential-osxkeychain erase
host=github.com
protocol=https
[drücken Sie Enter zweimal]

# Remote-URL neu setzen mit eingebettetem Token (ersetzen Sie YOUR_TOKEN)
git remote set-url origin https://tonisteimle:YOUR_TOKEN@github.com/tonisteimle/cx-heuristiken.git
```

## Nächste Schritte

Nach erfolgreicher Einrichtung werden alle Änderungen, die Sie auf GitHub pushen, automatisch auf Render.com deployt. Sie können nun normal mit Git arbeiten:

```bash
# Änderungen vornehmen, dann:
git add .
git commit -m "Beschreibung der Änderungen"
git push
```
