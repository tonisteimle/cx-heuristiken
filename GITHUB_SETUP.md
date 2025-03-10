# GitHub-Repository für Ihr lokales Projekt einrichten

Diese Anleitung hilft Ihnen, ein neues GitHub-Repository zu erstellen, das zu Ihrer lokalen Git-Konfiguration passt, anstatt die lokale Konfiguration anzupassen.

## Schritt 1: Ihre aktuelle Git-Konfiguration prüfen

Zuerst überprüfen wir, wie Ihr lokales Git-Repository konfiguriert ist:

```bash
# Prüfen Sie den aktuellen Remote-URL (falls vorhanden)
git remote -v

# Prüfen Sie Ihren lokalen Benutzernamen und E-Mail
git config user.name
git config user.email

# Prüfen Sie den aktuellen Branch-Namen
git branch
```

## Schritt 2: Ein neues GitHub-Repository erstellen

1. Besuchen Sie [github.com](https://github.com) und melden Sie sich an
2. Klicken Sie auf das "+" Symbol oben rechts und wählen Sie "New repository"
3. Wichtig: Geben Sie **genau den gleichen Namen** wie in Ihrem lokalen Repository an
   - Wenn Ihr Remote-URL z.B. auf `https://github.com/tonisteimle/cx-heuristiken.git` verweist, 
     sollten Sie das Repository "cx-heuristiken" nennen
4. Wählen Sie "Public" oder "Private" nach Ihren Wünschen
5. **Aktivieren Sie NICHT** die Optionen wie "Add a README file" oder "Add .gitignore"
6. Klicken Sie auf "Create repository"

## Schritt 3: Remote-URL konfigurieren

GitHub zeigt Ihnen nach der Erstellung Anweisungen an. Wir werden diese anpassen:

```bash
# Remote-URL aktualisieren (falls bereits eine existiert)
# Ersetzen Sie USERNAME mit Ihrem GitHub-Benutzernamen und REPO mit dem Repo-Namen
git remote set-url origin https://github.com/USERNAME/REPO.git

# Oder einen neuen Remote hinzufügen, falls noch keiner existiert
git remote add origin https://github.com/USERNAME/REPO.git
```

## Schritt 4: Code auf GitHub pushen

Jetzt können Sie Ihren Code auf GitHub pushen:

```bash
# Pushen Sie Ihren aktuellen Branch (wahrscheinlich 'main' oder 'master')
git push -u origin main

# Falls der obige Befehl einen Fehler zurückgibt, versuchen Sie stattdessen:
git push -u origin master
```

Falls Sie nach Ihren Zugangsdaten gefragt werden:
1. Geben Sie Ihren GitHub-Benutzernamen ein
2. Als Passwort müssen Sie ein Personal Access Token (PAT) verwenden:
   - Gehen Sie zu [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Wählen Sie "Generate new token" (classic)
   - Aktivieren Sie die "repo" Berechtigungen
   - Kopieren Sie das Token und verwenden Sie es als Passwort

## Schritt 5: Auf Render.com deployen

Nachdem Ihr Code auf GitHub ist, können Sie ihn einfach auf Render.com deployen:

1. Melden Sie sich bei [Render.com](https://render.com) an
2. Wählen Sie "New +" und dann "Web Service"
3. Verbinden Sie Ihren GitHub-Account, falls noch nicht geschehen
4. Wählen Sie das Repository aus, das Sie gerade erstellt haben
5. Konfigurieren Sie den Service wie in DEPLOY_TO_RENDER.md beschrieben

## Vorteile dieses Ansatzes

- Sie müssen Ihre lokale Git-Konfiguration nicht ändern
- Sie vermeiden Authentifizierungsprobleme mit vorhandenen Repositories
- Sie können direkt Render.com oder andere Git-basierte Deployment-Plattformen nutzen
- Dies ist oft einfacher als das Beheben von Git-Authentifizierungsproblemen

## Nächste Schritte

Nach erfolgreicher Einrichtung können Sie weiterhin normal mit Git arbeiten:
- Änderungen mit `git add` und `git commit` vornehmen
- Mit `git push` auf GitHub hochladen
- Render.com wird automatisch neue Deployments starten, wenn Sie auf GitHub pushen
