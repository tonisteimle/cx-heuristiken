"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import type { StorageData } from "@/types/storage-data"
import type { Guideline, Principle } from "@/types/guideline"
import { getStorageService } from "@/services/storage-factory"
import { useToast } from "@/components/ui/use-toast"

// Definiere die initialen Daten
const initialData: StorageData = {
  principles: [],
  guidelines: [],
  categories: [],
  elements: [],
}

// Definiere den State-Typ
interface AppState {
  guidelines: Guideline[]
  principles: Principle[]
  categories: string[]
  elements: string[]
  isLoading: boolean
  hasError: boolean
  errorMessage: string | null
}

// Definiere die Action-Typen
type AppAction =
  | { type: "SET_DATA"; payload: StorageData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "ADD_GUIDELINE"; payload: Guideline }
  | { type: "UPDATE_GUIDELINE"; payload: Guideline }
  | { type: "DELETE_GUIDELINE"; payload: string }
  | { type: "SET_PRINCIPLES"; payload: Principle[] }

// Definiere den Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        guidelines: action.payload.guidelines || [],
        principles: action.payload.principles || [],
        categories: action.payload.categories || [],
        elements: action.payload.elements || [],
        hasError: false,
        errorMessage: null,
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        hasError: true,
        errorMessage: action.payload,
      }
    case "CLEAR_ERROR":
      return {
        ...state,
        hasError: false,
        errorMessage: null,
      }
    case "ADD_GUIDELINE":
      return {
        ...state,
        guidelines: [...state.guidelines, action.payload],
      }
    case "UPDATE_GUIDELINE":
      return {
        ...state,
        guidelines: state.guidelines.map((g) => (g.id === action.payload.id ? action.payload : g)),
      }
    case "DELETE_GUIDELINE":
      return {
        ...state,
        guidelines: state.guidelines.filter((g) => g.id !== action.payload),
      }
    case "SET_PRINCIPLES":
      return {
        ...state,
        principles: action.payload,
      }
    default:
      return state
  }
}

// Definiere den Kontext-Typ
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  addGuideline: (guideline: Guideline) => Promise<boolean>
  updateGuideline: (guideline: Guideline) => Promise<boolean>
  deleteGuideline: (id: string) => Promise<boolean>
  savePrinciples: (principles: Principle[]) => Promise<boolean>
  exportDebugLogs: () => void
  refreshData: () => Promise<boolean>
  exportData: (options: any) => Promise<boolean>
}

// Erstelle den Kontext
const AppContext = createContext<AppContextType | undefined>(undefined)

// Erstelle den Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    guidelines: [],
    principles: [],
    categories: [],
    elements: [],
    isLoading: true,
    hasError: false,
    errorMessage: null,
  })

  const { toast } = useToast()

  // Lade die Daten beim ersten Rendern
  useEffect(() => {
    async function loadData() {
      try {
        dispatch({ type: "SET_LOADING", payload: true })

        const storageService = getStorageService()
        const data = await storageService.loadData()

        dispatch({ type: "SET_DATA", payload: data })
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error)
        dispatch({
          type: "SET_ERROR",
          payload: `Fehler beim Laden der Daten: ${error instanceof Error ? error.message : String(error)}`,
        })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    loadData()
  }, [])

  // Speichere die Daten
  const saveData = useCallback(async (data: StorageData): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const storageService = getStorageService()
      const success = await storageService.saveData(data)

      if (success) {
        dispatch({ type: "SET_DATA", payload: data })
        return true
      } else {
        throw new Error("Fehler beim Speichern der Daten")
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Daten:", error)
      dispatch({
        type: "SET_ERROR",
        payload: `Fehler beim Speichern der Daten: ${error instanceof Error ? error.message : String(error)}`,
      })
      return false
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  // Füge eine Guideline hinzu
  const addGuideline = useCallback(
    async (guideline: Guideline): Promise<boolean> => {
      try {
        // Speichere die Guideline in der Datenbank
        const storageService = getStorageService()
        const success = await storageService.saveGuideline(guideline)

        if (success) {
          // Aktualisiere den State
          dispatch({ type: "ADD_GUIDELINE", payload: guideline })

          // Aktualisiere die Kategorien, wenn neue hinzugefügt wurden
          const newCategories = guideline.categories.filter((c) => !state.categories.includes(c))
          if (newCategories.length > 0) {
            const updatedData: StorageData = {
              principles: state.principles,
              guidelines: [...state.guidelines, guideline],
              categories: [...state.categories, ...newCategories],
              elements: state.elements,
            }
            await saveData(updatedData)
          }

          return true
        } else {
          throw new Error("Fehler beim Speichern der Guideline")
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Guideline:", error)
        dispatch({
          type: "SET_ERROR",
          payload: `Fehler beim Hinzufügen der Guideline: ${error instanceof Error ? error.message : String(error)}`,
        })
        return false
      }
    },
    [saveData, state.categories, state.elements, state.guidelines, state.principles],
  )

  // Aktualisiere eine Guideline
  const updateGuideline = useCallback(
    async (guideline: Guideline): Promise<boolean> => {
      try {
        // Speichere die Guideline in der Datenbank
        const storageService = getStorageService()
        const success = await storageService.saveGuideline(guideline)

        if (success) {
          // Aktualisiere den State
          dispatch({ type: "UPDATE_GUIDELINE", payload: guideline })

          // Aktualisiere die Kategorien, wenn neue hinzugefügt wurden
          const newCategories = guideline.categories.filter((c) => !state.categories.includes(c))
          if (newCategories.length > 0) {
            const updatedData: StorageData = {
              principles: state.principles,
              guidelines: state.guidelines.map((g) => (g.id === guideline.id ? guideline : g)),
              categories: [...state.categories, ...newCategories],
              elements: state.elements,
            }
            await saveData(updatedData)
          }

          return true
        } else {
          throw new Error("Fehler beim Aktualisieren der Guideline")
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren der Guideline:", error)
        dispatch({
          type: "SET_ERROR",
          payload: `Fehler beim Aktualisieren der Guideline: ${error instanceof Error ? error.message : String(error)}`,
        })
        return false
      }
    },
    [saveData, state.categories, state.elements, state.guidelines, state.principles],
  )

  // Lösche eine Guideline
  const deleteGuideline = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: "DELETE_GUIDELINE", payload: id })
      return true
    } catch (error) {
      console.error("Fehler beim Löschen der Guideline:", error)
      dispatch({
        type: "SET_ERROR",
        payload: `Fehler beim Löschen der Guideline: ${error instanceof Error ? error.message : String(error)}`,
      })
      return false
    }
  }, [])

  // Speichere die Principles
  const savePrinciples = useCallback(
    async (principles: Principle[]): Promise<boolean> => {
      try {
        const updatedData: StorageData = {
          principles,
          guidelines: state.guidelines,
          categories: state.categories,
          elements: state.elements,
        }

        const success = await saveData(updatedData)

        if (success) {
          dispatch({ type: "SET_PRINCIPLES", payload: principles })
          return true
        } else {
          throw new Error("Fehler beim Speichern der Principles")
        }
      } catch (error) {
        console.error("Fehler beim Speichern der Principles:", error)
        dispatch({
          type: "SET_ERROR",
          payload: `Fehler beim Speichern der Principles: ${error instanceof Error ? error.message : String(error)}`,
        })
        return false
      }
    },
    [saveData, state.categories, state.elements, state.guidelines],
  )

  // Exportiere Debug-Logs
  const exportDebugLogs = useCallback(() => {
    try {
      const debugData = {
        state,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }

      const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `debug-logs-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Debug-Logs exportiert",
        description: "Die Debug-Logs wurden erfolgreich exportiert.",
      })
    } catch (error) {
      console.error("Fehler beim Exportieren der Debug-Logs:", error)
      toast({
        title: "Fehler beim Exportieren der Debug-Logs",
        description: `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }, [state, toast])

  // Aktualisiere die Daten
  const refreshData = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const storageService = getStorageService()
      const data = await storageService.loadData()

      console.log("Refreshed data:", JSON.stringify(data).substring(0, 200) + "...")
      console.log(`Loaded ${data.guidelines.length} guidelines and ${data.principles.length} principles`)

      dispatch({ type: "SET_DATA", payload: data })
      return true
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Daten:", error)
      dispatch({
        type: "SET_ERROR",
        payload: `Fehler beim Aktualisieren der Daten: ${error instanceof Error ? error.message : String(error)}`,
      })
      return false
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [dispatch])

  // Exportiere die Daten
  const exportData = useCallback(
    async (options: any): Promise<boolean> => {
      try {
        // Erstelle die zu exportierenden Daten
        const exportData: StorageData = {
          principles: options.includePrinciples ? state.principles : [],
          guidelines: options.includeGuidelines ? state.guidelines : [],
          categories: options.includeCategories ? state.categories : [],
          elements: state.elements,
          lastUpdated: new Date().toISOString(),
          version: "2.0",
        }

        // Erstelle einen Blob und lade ihn herunter
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = `guidelines-export-${new Date().toISOString()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        return true
      } catch (error) {
        console.error("Fehler beim Exportieren der Daten:", error)
        dispatch({
          type: "SET_ERROR",
          payload: `Fehler beim Exportieren der Daten: ${error instanceof Error ? error.message : String(error)}`,
        })
        return false
      }
    },
    [state.categories, state.elements, state.guidelines, state.principles],
  )

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addGuideline,
        updateGuideline,
        deleteGuideline,
        savePrinciples,
        exportDebugLogs,
        refreshData,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// Hook zum Zugriff auf den Kontext
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
