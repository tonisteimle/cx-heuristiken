"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { Guideline, Principle } from "@/types/guideline"
import { getStorageService } from "@/services/storage-factory"
import { useToast } from "@/components/ui/use-toast"
import type { StorageData } from "@/types/storage-data"
// Fügen Sie diesen Import am Anfang der Datei hinzu
import { FIXED_CATEGORIES } from "@/lib/constants"

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
  exportData: (options?: ExportOptions) => Promise<boolean>
  refreshData: () => Promise<void>
  batchUpdateGuidelines: (guidelines: Guideline[]) => Promise<void>
}

interface ExportOptions {
  guidelines?: boolean
  principles?: boolean
  categories?: boolean
  includeImages?: boolean
  onlyIncomplete?: boolean
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
        // Nur die fest definierten Kategorien verwenden
        categories: FIXED_CATEGORIES,
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

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { toast } = useToast()

  // Load data on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: "LOADING" })
        const storageService = getStorageService()
        const data = await storageService.loadData()
        const stats = await storageService.getStats()
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

  // Refresh data from database
  const refreshData = async () => {
    try {
      dispatch({ type: "LOADING" })
      const storageService = getStorageService()
      const data = await storageService.loadData()
      const stats = await storageService.getStats()
      dispatch({ type: "LOAD_DATA_SUCCESS", payload: data, stats })

      toast({
        title: "Data refreshed",
        description: "Your guidelines have been refreshed from the database.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)

      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Action creators
  const addGuideline = async (guideline: Guideline) => {
    try {
      const newGuideline = {
        ...guideline,
        id: guideline.id || Date.now().toString(),
        createdAt: guideline.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        principles: guideline.principles || [],
      }

      dispatch({ type: "ADD_GUIDELINE", payload: newGuideline })

      // Save to database
      const storageService = getStorageService()
      const success = await storageService.saveGuideline(newGuideline)

      if (success) {
        toast({
          title: "Guideline added",
          description: "Your guideline has been successfully saved to the database.",
        })

        // Update stats
        const stats = await storageService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      } else {
        throw new Error("Failed to save guideline to database")
      }
    } catch (error) {
      console.error("Error adding guideline:", error)

      toast({
        title: "Error adding guideline",
        description: "There was a problem adding your guideline. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateGuideline = async (guideline: Guideline) => {
    try {
      const updatedGuideline = {
        ...guideline,
        updatedAt: new Date().toISOString(),
        principles: guideline.principles || [],
      }

      dispatch({ type: "UPDATE_GUIDELINE", payload: updatedGuideline })

      // Save to database
      const storageService = getStorageService()
      const success = await storageService.saveGuideline(updatedGuideline)

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

      toast({
        title: "Error updating guideline",
        description: "There was a problem updating your guideline. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteGuideline = async (id: string) => {
    try {
      dispatch({ type: "DELETE_GUIDELINE", payload: id })

      // Delete from database
      const storageService = getStorageService()
      const success = await storageService.deleteGuideline(id)

      if (success) {
        toast({
          title: "Guideline deleted",
          description: "The guideline has been removed from the database.",
        })

        // Update stats
        const stats = await storageService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      } else {
        throw new Error("Failed to delete guideline from database")
      }
    } catch (error) {
      console.error("Error deleting guideline:", error)

      toast({
        title: "Error deleting guideline",
        description: "There was a problem deleting your guideline. Please try again.",
        variant: "destructive",
      })
    }
  }

  const savePrinciples = async (principles: Principle[]) => {
    try {
      dispatch({ type: "SAVE_PRINCIPLES", payload: principles })

      // Save to database
      const storageService = getStorageService()
      const data: StorageData = {
        guidelines: state.guidelines,
        categories: state.categories,
        principles: principles,
        lastUpdated: new Date().toISOString(),
        version: "2.0",
      }

      const success = await storageService.saveData(data)

      if (success) {
        toast({
          title: "Principles saved",
          description: `${principles.length} principles have been saved to the database.`,
        })

        // Update stats
        const stats = await storageService.getStats()
        dispatch({ type: "UPDATE_STATS", payload: stats })
      } else {
        throw new Error("Failed to save principles to database")
      }
    } catch (error) {
      console.error("Error saving principles:", error)

      toast({
        title: "Error saving principles",
        description: "There was a problem saving the principles. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportData = async (options?: ExportOptions): Promise<boolean> => {
    try {
      // Standardoptionen, falls keine angegeben wurden
      const exportOptions = options || {
        guidelines: true,
        principles: true,
        categories: true,
        includeImages: true,
        onlyIncomplete: false,
      }

      // Filtere unvollständige Guidelines, wenn die Option aktiviert ist
      let filteredGuidelines = state.guidelines
      let filteredPrinciples = state.principles

      if (exportOptions.onlyIncomplete) {
        // Filtere unvollständige Guidelines
        filteredGuidelines = state.guidelines.filter((guideline) => {
          // Eine Guideline ist unvollständig, wenn:
          return (
            !guideline.title.trim() || // Kein Titel
            !guideline.text.trim() || // Kein Text
            !guideline.justification?.trim() || // Keine Begründung
            guideline.categories.length === 0 || // Keine Kategorien
            guideline.principles.length === 0
          ) // Keine Prinzipien
        })

        // Filtere unvollständige Prinzipien
        filteredPrinciples = state.principles.filter((principle) => {
          // Ein Prinzip ist unvollständig, wenn:
          return (
            !principle.description?.trim() || // Keine Beschreibung
            !principle.evidenz?.trim() || // Keine Evidenz
            !principle.implikation?.trim() // Keine Implikation
          )
        })
      }

      // Daten für den Export vorbereiten
      const data: StorageData = {
        guidelines: exportOptions.guidelines
          ? filteredGuidelines.map((guideline) => {
              // Wenn Bilder nicht eingeschlossen werden sollen, entferne die Bildfelder
              if (!exportOptions.includeImages) {
                const { imageUrl, imageName, detailImageUrl, detailImageName, svgContent, detailSvgContent, ...rest } =
                  guideline
                return rest
              }
              return guideline
            })
          : [],
        categories: exportOptions.categories ? state.categories : [],
        principles: exportOptions.principles ? filteredPrinciples : [],
        lastUpdated: new Date().toISOString(),
        version: "2.0",
        exportDate: new Date().toISOString(),
      }

      // JSON-String mit Formatierung erstellen
      const jsonString = JSON.stringify(data, null, 2)

      // Blob mit korrektem MIME-Typ erstellen
      const blob = new Blob([jsonString], { type: "application/json" })

      // Download-Link erstellen
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")

      // Dateinamen mit Datum generieren
      const date = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD
      const filenameSuffix = exportOptions.onlyIncomplete ? "-incomplete" : ""
      a.download = `guidelines-export-${date}${filenameSuffix}.json`
      a.href = url

      // Link zum DOM hinzufügen, klicken und entfernen
      document.body.appendChild(a)
      a.click()

      // Kurze Verzögerung vor dem Aufräumen
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      // Erstelle eine Zusammenfassung der exportierten Daten
      let exportSummary = ""
      if (exportOptions.onlyIncomplete) {
        exportSummary = `${exportOptions.guidelines ? filteredGuidelines.length : 0} unvollständige Guidelines und ${exportOptions.principles ? filteredPrinciples.length : 0} unvollständige Prinzipien wurden exportiert.`
      } else {
        exportSummary = `${exportOptions.guidelines ? filteredGuidelines.length : 0} Guidelines, ${exportOptions.categories ? state.categories.length : 0} Kategorien und ${exportOptions.principles ? filteredPrinciples.length : 0} Prinzipien wurden exportiert.`
      }

      toast({
        title: "Export erfolgreich",
        description: exportSummary,
      })

      return true
    } catch (error) {
      console.error("Fehler beim Exportieren der Daten:", error)

      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })

      return false
    }
  }

  // Method for batch updates
  const batchUpdateGuidelines = async (guidelines: Guideline[]) => {
    try {
      // Update state for each guideline
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

        // Collect categories
        guideline.categories.forEach((cat) => newCategories.add(cat))
      })

      // Update state
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

      // Save to database
      const storageService = getStorageService()
      const savePromises = guidelines.map((guideline) => storageService.saveGuideline(guideline))

      await Promise.all(savePromises)

      toast({
        title: "Batch update successful",
        description: `Updated ${guidelines.length} guidelines in the database.`,
      })

      // Update stats
      const stats = await storageService.getStats()
      dispatch({ type: "UPDATE_STATS", payload: stats })
    } catch (error) {
      console.error("Error in batch update:", error)

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
    exportData,
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

export { AppContext, type StorageData }
