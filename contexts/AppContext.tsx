"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import type { Guideline, Principle } from "@/types/guideline"
import { JsonFileService, type StorageData } from "@/services/json-file-service"
import { useToast } from "@/components/ui/use-toast"

// State types
interface AppState {
  guidelines: Guideline[]
  categories: string[]
  principles: Principle[]
  isLoaded: boolean
  isLoading: boolean
  hasError: boolean
  errorMessage: string
  stats: {
    lastUpdated: string
    databaseSize: number
  } | null
}

// Action types
type AppAction =
  | { type: "LOADING" }
  | { type: "LOAD_DATA_SUCCESS"; payload: StorageData; stats?: any }
  | { type: "LOAD_DATA_ERROR"; payload: string }
  | { type: "ADD_GUIDELINE"; payload: Guideline }
  | { type: "UPDATE_GUIDELINE"; payload: Guideline }
  | { type: "DELETE_GUIDELINE"; payload: string }
  | { type: "SAVE_PRINCIPLES"; payload: Principle[] }
  | { type: "IMPORT_DATA"; payload: StorageData }
  | { type: "UPDATE_STATS"; payload: any }

// Context type
interface AppContextType {
  state: AppState
  addGuideline: (guideline: Guideline) => Promise<void>
  updateGuideline: (guideline: Guideline) => Promise<void>
  deleteGuideline: (id: string) => Promise<void>
  savePrinciples: (principles: Principle[]) => Promise<void>
  importPrinciplesFromText: (text: string) => Promise<void>
  exportData: () => Promise<void>
  importData: (event: React.ChangeEvent<HTMLInputElement>) => void
  exportDebugLogs: () => Promise<void>
  refreshData: () => Promise<void>
  batchUpdateGuidelines: (guidelines: Guideline[]) => Promise<void>
}

// Initial state
const initialState: AppState = {
  guidelines: [],
  categories: [],
  principles: [],
  isLoaded: false,
  isLoading: false,
  hasError: false,
  errorMessage: "",
  stats: null,
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        isLoading: true,
      }
    case "LOAD_DATA_SUCCESS":
      return {
        ...state,
        guidelines: action.payload?.guidelines || [],
        categories: action.payload?.categories || [],
        principles: action.payload?.principles || [],
        isLoaded: true,
        isLoading: false,
        hasError: false,
        errorMessage: "",
        stats: action.stats || {
          lastUpdated: action.payload?.lastUpdated || new Date().toISOString(),
          databaseSize: 0,
        },
      }
    case "LOAD_DATA_ERROR":
      return {
        ...state,
        isLoaded: true,
        isLoading: false,
        hasError: true,
        errorMessage: action.payload,
      }
    case "ADD_GUIDELINE": {
      const newGuidelines = [...state.guidelines, action.payload]

      // Extract any new categories
      const newCategories = action.payload.categories.filter((cat) => !state.categories.includes(cat))
      const updatedCategories = newCategories.length > 0 ? [...state.categories, ...newCategories] : state.categories

      return {
        ...state,
        guidelines: newGuidelines,
        categories: updatedCategories,
      }
    }
    case "UPDATE_GUIDELINE": {
      const updatedGuidelines = state.guidelines.map((g) => (g.id === action.payload.id ? action.payload : g))

      // Extract any new categories
      const newCategories = action.payload.categories.filter((cat) => !state.categories.includes(cat))
      const updatedCategories = newCategories.length > 0 ? [...state.categories, ...newCategories] : state.categories

      return {
        ...state,
        guidelines: updatedGuidelines,
        categories: updatedCategories,
      }
    }
    case "DELETE_GUIDELINE": {
      const filteredGuidelines = state.guidelines.filter((g) => g.id !== action.payload)
      return {
        ...state,
        guidelines: filteredGuidelines,
      }
    }
    case "SAVE_PRINCIPLES":
      return {
        ...state,
        principles: action.payload,
      }
    case "IMPORT_DATA":
      return {
        ...state,
        guidelines: action.payload?.guidelines || [],
        categories: action.payload?.categories || [],
        principles: action.payload?.principles || [],
      }
    case "UPDATE_STATS":
      return {
        ...state,
        stats: action.payload,
      }
    default:
      return state
  }
}

// Parse principles from text
const parsePrinciplesFromText = (text: string): Principle[] => {
  const principles: Principle[] = []
  const lines = text.split("\n")

  let currentPrinciple: Partial<Principle> | null = null

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines
    if (!trimmedLine) continue

    // If line doesn't start with a space, it's a new principle title
    if (!line.startsWith(" ") && !line.startsWith("\t")) {
      // Save previous principle if exists
      if (currentPrinciple && currentPrinciple.name && currentPrinciple.description) {
        principles.push({
          id: currentPrinciple.name.toLowerCase().replace(/\s+/g, "-"),
          name: currentPrinciple.name,
          description: currentPrinciple.description,
        })
      }

      // Start new principle
      currentPrinciple = {
        name: trimmedLine,
      }
    }
    // If we have a current principle and this is a content line, add to description
    else if (currentPrinciple && currentPrinciple.name) {
      if (!currentPrinciple.description) {
        currentPrinciple.description = trimmedLine
      } else {
        currentPrinciple.description += " " + trimmedLine
      }
    }
  }

  // Add the last principle if exists
  if (currentPrinciple && currentPrinciple.name && currentPrinciple.description) {
    principles.push({
      id: currentPrinciple.name.toLowerCase().replace(/\s+/g, "-"),
      name: currentPrinciple.name,
      description: currentPrinciple.description,
    })
  }

  return principles
}

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { toast } = useToast()
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [pendingChanges, setPendingChanges] = useState<boolean>(false)

  // Load data on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: "LOADING" })
        const data = await JsonFileService.loadData()
        const stats = await JsonFileService.getStats()
        dispatch({ type: "LOAD_DATA_SUCCESS", payload: data, stats })
      } catch (error) {
        dispatch({
          type: "LOAD_DATA_ERROR",
          payload: "Failed to load your guidelines. Please try importing a backup if available.",
        })

        toast({
          title: "Error loading data",
          description: "There was a problem loading your guidelines. Please try importing a backup.",
          variant: "destructive",
        })
      }
    }

    loadInitialData()
  }, [toast])

  // Set up auto-save interval
  useEffect(() => {
    if (!state.isLoaded) return

    // Clear any existing timer
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
    }

    // Create new timer
    const timer = setInterval(async () => {
      if (pendingChanges) {
        await JsonFileService.logDebug("Performing periodic auto-save")

        const data: StorageData = {
          guidelines: state.guidelines,
          categories: state.categories,
          principles: state.principles,
          lastUpdated: new Date().toISOString(),
          version: "2.0",
        }

        await JsonFileService.saveData(data)
        setPendingChanges(false)

        // Update stats
        const stats = await JsonFileService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      }
    }, 60000) // Auto-save every minute

    setAutoSaveTimer(timer)

    // Cleanup on unmount
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [state.isLoaded, state.guidelines, state.categories, state.principles, pendingChanges])

  // Refresh data from database
  const refreshData = async () => {
    try {
      dispatch({ type: "LOADING" })
      const data = await JsonFileService.loadData()
      const stats = await JsonFileService.getStats()
      dispatch({ type: "LOAD_DATA_SUCCESS", payload: data, stats })

      toast({
        title: "Data refreshed",
        description: "Your guidelines have been refreshed from the database.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      JsonFileService.logDebug("Error refreshing data", error)

      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Action creators
  // Stellen Sie sicher, dass die Kategorien korrekt aktualisiert werden, wenn eine Guideline hinzugefügt oder aktualisiert wird

  // Ändern Sie die addGuideline-Funktion, um sicherzustellen, dass die Kategorien korrekt aktualisiert werden
  const addGuideline = async (guideline: Guideline) => {
    try {
      const newGuideline = {
        ...guideline,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        principles: guideline.principles || [],
      }

      // Aktualisiere den lokalen State
      dispatch({ type: "ADD_GUIDELINE", payload: newGuideline })
      setPendingChanges(true)

      // Extrahiere neue Kategorien
      const newCategories = guideline.categories.filter((cat) => !state.categories.includes(cat))
      if (newCategories.length > 0) {
        // Aktualisiere den Kategorien-State
        const updatedCategories = [...state.categories, ...newCategories]
        dispatch({
          type: "LOAD_DATA_SUCCESS",
          payload: {
            guidelines: [...state.guidelines, newGuideline],
            categories: updatedCategories,
            principles: state.principles,
            lastUpdated: new Date().toISOString(),
            version: "2.0",
          },
        })
      }

      // Speichere in der Datenbank
      const success = await JsonFileService.saveGuideline(newGuideline)

      if (success) {
        toast({
          title: "Guideline added",
          description: "Your guideline has been successfully saved to the database.",
        })

        // Update stats
        const stats = await JsonFileService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      } else {
        throw new Error("Failed to save guideline to database")
      }
    } catch (error) {
      console.error("Error adding guideline:", error)
      await JsonFileService.logDebug("Error adding guideline", error)

      toast({
        title: "Error adding guideline",
        description: "There was a problem adding your guideline. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Ändern Sie die updateGuideline-Funktion, um sicherzustellen, dass die Kategorien korrekt aktualisiert werden
  const updateGuideline = async (guideline: Guideline) => {
    try {
      const updatedGuideline = {
        ...guideline,
        updatedAt: new Date().toISOString(),
        principles: guideline.principles || [],
      }

      // Aktualisiere den lokalen State
      dispatch({ type: "UPDATE_GUIDELINE", payload: updatedGuideline })
      setPendingChanges(true)

      // Extrahiere neue Kategorien
      const newCategories = guideline.categories.filter((cat) => !state.categories.includes(cat))
      if (newCategories.length > 0) {
        // Aktualisiere den Kategorien-State
        const updatedCategories = [...state.categories, ...newCategories]

        // Aktualisiere die Guidelines im State
        const updatedGuidelines = state.guidelines.map((g) => (g.id === guideline.id ? updatedGuideline : g))

        dispatch({
          type: "LOAD_DATA_SUCCESS",
          payload: {
            guidelines: updatedGuidelines,
            categories: updatedCategories,
            principles: state.principles,
            lastUpdated: new Date().toISOString(),
            version: "2.0",
          },
        })
      }

      // Speichere in der Datenbank
      const success = await JsonFileService.saveGuideline(updatedGuideline)

      if (success) {
        toast({
          title: "Guideline updated",
          description: "Your changes have been saved to the database.",
        })
      } else {
        throw new Error("Failed to save guideline to database")
      }
    } catch (error) {
      console.error("Error updating guideline:", error)
      await JsonFileService.logDebug("Error updating guideline", error)

      toast({
        title: "Error updating guideline",
        description: "There was a problem updating your guideline. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteGuideline = async (id: string) => {
    try {
      console.log(`AppContext: Lösche Guideline mit ID ${id}...`)

      // Optimistisches Update des UI
      dispatch({ type: "DELETE_GUIDELINE", payload: id })
      setPendingChanges(true)

      // Delete from database
      const success = await JsonFileService.deleteGuideline(id)

      if (success) {
        toast({
          title: "Guideline gelöscht",
          description: "Die Guideline wurde aus der Datenbank entfernt.",
        })

        // Update stats
        const stats = await JsonFileService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      } else {
        // Auch bei Fehlern nicht den UI-Zustand zurücksetzen, um Inkonsistenzen zu vermeiden
        console.warn("Löschen fehlgeschlagen, aber UI-Zustand bleibt aktualisiert")

        toast({
          title: "Hinweis",
          description:
            "Die Guideline wurde aus der Ansicht entfernt, aber es gab ein Problem bei der Datenbankaktualisierung.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error deleting guideline:", error)
      await JsonFileService.logDebug("Error deleting guideline", error)

      // Trotz Fehler nicht den UI-Zustand zurücksetzen
      toast({
        title: "Hinweis",
        description:
          "Die Guideline wurde aus der Ansicht entfernt, aber es gab ein Problem bei der Datenbankaktualisierung.",
        variant: "default",
      })
    }
  }

  const savePrinciples = async (principles: Principle[]) => {
    try {
      dispatch({ type: "SAVE_PRINCIPLES", payload: principles })
      setPendingChanges(true)

      // Save to database
      const data: StorageData = {
        guidelines: state.guidelines,
        categories: state.categories,
        principles: principles,
        lastUpdated: new Date().toISOString(),
        version: "2.0",
      }

      const success = await JsonFileService.saveData(data)

      if (success) {
        toast({
          title: "Principles saved",
          description: `${principles.length} principles have been saved to the database.`,
        })

        // Update stats
        const stats = await JsonFileService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      } else {
        throw new Error("Failed to save principles to database")
      }
    } catch (error) {
      console.error("Error saving principles:", error)
      await JsonFileService.logDebug("Error saving principles", error)

      toast({
        title: "Error saving principles",
        description: "There was a problem saving the principles. Please try again.",
        variant: "destructive",
      })
    }
  }

  const importPrinciplesFromText = async (text: string) => {
    try {
      const parsedPrinciples = parsePrinciplesFromText(text)

      if (parsedPrinciples.length === 0) {
        throw new Error("No principles found in the text")
      }

      // Verbesserte Funktion zum Importieren von Prinzipien verwenden
      const result = await JsonFileService.importPrinciples(parsedPrinciples)

      if (result.success) {
        // Daten neu laden, um die importierten Prinzipien anzuzeigen
        await refreshData()

        toast({
          title: "Principles imported",
          description: result.message,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error importing principles:", error)
      await JsonFileService.logDebug("Error importing principles", error)

      toast({
        title: "Error importing principles",
        description: "There was a problem importing the principles. Please check the format.",
        variant: "destructive",
      })
    }
  }

  const exportData = async () => {
    try {
      const data: StorageData = {
        guidelines: state.guidelines,
        categories: state.categories,
        principles: state.principles,
        lastUpdated: new Date().toISOString(),
        version: "2.0",
      }

      const success = await JsonFileService.exportData(data)

      if (success) {
        toast({
          title: "Export successful",
          description: `Exported ${state.guidelines.length} guidelines, ${state.categories.length} categories, and ${state.principles.length} principles.`,
        })
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      await JsonFileService.logDebug("Error exporting data", error)

      toast({
        title: "Export failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const result = e.target?.result
        if (typeof result !== "string") {
          throw new Error("Invalid file content")
        }

        const importResult = await JsonFileService.importData(result)

        if (importResult.success && importResult.data) {
          dispatch({ type: "IMPORT_DATA", payload: importResult.data })
          setPendingChanges(true)

          toast({
            title: "Import successful",
            description: `Imported ${importResult.data.guidelines.length} guidelines, ${importResult.data.categories.length} categories, and ${importResult.data.principles.length} principles to the database.`,
          })

          // Update stats
          const stats = await JsonFileService.getStats()
          dispatch({ type: "UPDATE_STATS", payload: stats })
        } else {
          throw importResult.error || new Error("Unknown import error")
        }
      } catch (error) {
        console.error("Error importing data:", error)
        JsonFileService.logDebug("Error importing data", error)

        toast({
          title: "Import failed",
          description: "There was a problem importing your data. Please check the file format.",
          variant: "destructive",
        })
      }

      // Reset the input
      event.target.value = ""
    }

    reader.readAsText(file)
  }

  const exportDebugLogs = async () => {
    const success = await JsonFileService.exportDebugLogs()

    if (success) {
      toast({
        title: "Debug logs exported",
        description: "Debug logs have been exported for troubleshooting.",
      })
    }
  }

  // Neue Methode für Batch-Updates
  const batchUpdateGuidelines = async (guidelines: Guideline[]) => {
    try {
      // Aktualisiere den State für jede Guideline
      const updatedGuidelines = [...state.guidelines]
      const newCategories = new Set<string>([...state.categories])

      guidelines.forEach((guideline) => {
        const index = updatedGuidelines.findIndex((g) => g.id === guideline.id)
        const updatedGuideline = {
          ...guideline,
          updatedAt: new Date().toISOString(),
          principles: guideline.principles || [],
        }

        if (index >= 0) {
          updatedGuidelines[index] = updatedGuideline
        } else {
          updatedGuidelines.push({
            ...updatedGuideline,
            id: guideline.id || Date.now().toString(),
            createdAt: guideline.createdAt || new Date().toISOString(),
          })
        }

        // Kategorien sammeln
        guideline.categories.forEach((cat) => newCategories.add(cat))
      })

      // State aktualisieren
      dispatch({
        type: "LOAD_DATA_SUCCESS",
        payload: {
          guidelines: updatedGuidelines,
          categories: Array.from(newCategories),
          principles: state.principles,
          lastUpdated: new Date().toISOString(),
          version: "2.0",
        },
      })
      setPendingChanges(true)

      // In Datenbank speichern
      const savePromises = guidelines.map((guideline) => JsonFileService.saveGuideline(guideline))

      await Promise.all(savePromises)

      toast({
        title: "Batch update successful",
        description: `Updated ${guidelines.length} guidelines in the database.`,
      })

      // Stats aktualisieren
      const stats = await JsonFileService.getStats()
      dispatch({ type: "UPDATE_STATS", payload: stats })
    } catch (error) {
      console.error("Error in batch update:", error)
      await JsonFileService.logDebug("Error in batch update", error)

      toast({
        title: "Batch update failed",
        description: "There was a problem updating multiple guidelines. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Context value
  const contextValue: AppContextType = {
    state,
    addGuideline,
    updateGuideline,
    deleteGuideline,
    savePrinciples,
    importPrinciplesFromText,
    exportData,
    importData,
    exportDebugLogs,
    refreshData,
    batchUpdateGuidelines,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

export { AppContext }
