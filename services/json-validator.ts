/**
 * Ein Service zur Validierung und Korrektur von JSON-Strukturen
 */
export class JsonValidator {
  /**
   * Überprüft und korrigiert JSON-Text
   * @param jsonText Der zu überprüfende JSON-Text
   * @returns Ein Objekt mit dem korrigierten JSON und Informationen über die Korrekturen
   */
  static validateAndFix(jsonText: string): {
    fixed: string
    valid: boolean
    corrections: string[]
    originalError?: string
  } {
    // Ergebnisobjekt initialisieren
    const result = {
      fixed: jsonText,
      valid: false,
      corrections: [] as string[],
      originalError: undefined as string | undefined,
    }

    // Zuerst prüfen, ob das JSON bereits gültig ist
    try {
      JSON.parse(jsonText)
      result.valid = true
      return result
    } catch (error) {
      // Originalen Fehler speichern
      result.originalError = error instanceof Error ? error.message : String(error)

      // Versuchen, das JSON zu korrigieren
      let fixedJson = this.cleanJsonText(jsonText)
      result.corrections.push("Grundlegende Textbereinigung durchgeführt")

      // Klammerstruktur überprüfen und korrigieren
      fixedJson = this.fixBracketStructure(fixedJson)

      // Prüfen, ob die Korrektur erfolgreich war
      try {
        JSON.parse(fixedJson)
        result.valid = true
        result.fixed = fixedJson
      } catch (secondError) {
        // Wenn immer noch Fehler auftreten, versuchen wir eine aggressivere Korrektur
        try {
          const aggressivelyFixed = this.aggressiveJsonFix(fixedJson)
          JSON.parse(aggressivelyFixed)
          result.valid = true
          result.fixed = aggressivelyFixed
          result.corrections.push("Aggressive Korrektur angewendet")
        } catch (finalError) {
          // Wenn auch das nicht funktioniert, geben wir auf
          result.valid = false
          result.corrections.push("Konnte JSON nicht vollständig korrigieren")
        }
      }

      return result
    }
  }

  /**
   * Bereinigt den JSON-Text von häufigen Problemen
   */
  private static cleanJsonText(jsonText: string): string {
    const cleanedText = jsonText
      // Zeilenumbrüche normalisieren
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Tabs durch Leerzeichen ersetzen
      .replace(/\t/g, " ")
      // Nachfolgende Kommas entfernen
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      // Mehrere aufeinanderfolgende Leerzeichen reduzieren
      .replace(/\s+/g, " ")
      // Ungültige Zeichen entfernen
      .replace(/[^\x20-\x7E\n]/g, "")
      // Ungültige Anführungszeichen korrigieren
      .replace(/[""'']/g, '"')
      // Fehlende Kommas in Objektliteralen korrigieren
      .replace(/}(\s*){/g, "},{")
      // Fehlende Kommas in Arrays korrigieren
      .replace(/](\s*)\[/g, "],[")

    return cleanedText
  }

  /**
   * Überprüft und korrigiert die Klammerstruktur im JSON
   */
  private static fixBracketStructure(jsonText: string): string {
    // Zähler für verschiedene Klammertypen
    let curlyBrackets = 0 // { }
    let squareBrackets = 0 // [ ]
    let doubleQuotes = 0 // " "

    // Ob wir uns in einem String befinden
    let inString = false

    // Durchlaufe den Text Zeichen für Zeichen
    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i]

      // Wenn wir ein Backslash haben, überspringen wir das nächste Zeichen
      if (char === "\\") {
        i++
        continue
      }

      // Anführungszeichen behandeln
      if (char === '"') {
        doubleQuotes++
        inString = !inString
        continue
      }

      // Wenn wir in einem String sind, ignorieren wir Klammern
      if (inString) continue

      // Klammern zählen
      if (char === "{") curlyBrackets++
      else if (char === "}") curlyBrackets--
      else if (char === "[") squareBrackets++
      else if (char === "]") squareBrackets--
    }

    // Korrigiere unausgeglichene Klammern
    let fixedJson = jsonText

    // Fehlende schließende geschweifte Klammern hinzufügen
    while (curlyBrackets > 0) {
      fixedJson += "}"
      curlyBrackets--
    }

    // Fehlende schließende eckige Klammern hinzufügen
    while (squareBrackets > 0) {
      fixedJson += "]"
      squareBrackets--
    }

    // Fehlende öffnende geschweifte Klammern am Anfang hinzufügen
    while (curlyBrackets < 0) {
      fixedJson = "{" + fixedJson
      curlyBrackets++
    }

    // Fehlende öffnende eckige Klammern am Anfang hinzufügen
    while (squareBrackets < 0) {
      fixedJson = "[" + fixedJson
      squareBrackets++
    }

    // Unausgeglichene Anführungszeichen korrigieren
    if (doubleQuotes % 2 !== 0) {
      fixedJson += '"'
    }

    return fixedJson
  }

  /**
   * Versucht, JSON aggressiv zu korrigieren, wenn andere Methoden fehlschlagen
   */
  private static aggressiveJsonFix(jsonText: string): string {
    // Versuche, das JSON in eine gültige Struktur zu zwingen
    let text = jsonText.trim()

    // Wenn das JSON nicht mit { oder [ beginnt, füge { hinzu
    if (!text.startsWith("{") && !text.startsWith("[")) {
      text = "{" + text
    }

    // Wenn das JSON nicht mit } oder ] endet, füge } hinzu
    if (!text.endsWith("}") && !text.endsWith("]")) {
      text = text + "}"
    }

    // Versuche, fehlende Anführungszeichen um Schlüssel zu korrigieren
    text = text.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')

    // Versuche, ungültige Kommas zu korrigieren
    text = text.replace(/,\s*[,}]/g, "}")
    text = text.replace(/,\s*[,\]]/g, "]")

    return text
  }

  /**
   * Prüft, ob ein JSON-Text gültig ist
   */
  static isValidJson(jsonText: string): boolean {
    try {
      JSON.parse(jsonText)
      return true
    } catch (error) {
      return false
    }
  }
}
