"use client"

import { useState, useEffect } from "react"
import { PlusCircle, ArrowLeft, AlertCircle, RefreshCw, BookOpen, FileText, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppProvider, useAppContext } from "@/contexts/app-context"
import GuidelineForm from "@/components/guideline-form"
import GuidelineList from "@/components/guideline-list"
import PrincipleManager from "@/components/principle-manager"
import HomePage from "./home"
import type { Guideline, Principle, PrincipleElement } from "@/types/guideline"
import { getStorageService } from "@/services/storage-factory"
import { ExportOptionsDialog, type ExportOptions } from "@/components/export-options-dialog"
import { Input } from "@/components/ui/input"
import { testSupabaseConnection, initializeDatabase } from "@/lib/supabase-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "next/navigation"

function GuidelinesManager() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const {
    state,
    addGuideline,
    updateGuideline,
    deleteGuideline: deleteGuidelineFromContext,
    savePrinciples,
    exportDebugLogs,
    refreshData: refreshAppContextData,
    exportData: exportAppData,
    dispatch,
  } = useAppContext()

  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null)
  const [isAddingGuideline, setIsAddingGuideline] = useState(false)
  const [activeTab, setActiveTab] = useState("guidelines")
  const [isLoading, setIsLoading] = useState(false)
  const [isAddPrincipleDialogOpen, setIsAddPrincipleDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [showHomePage, setShowHomePage] = useState(true)

  // ViewMode-States für beide Ansichten
  const [principlesViewMode, setPrinciplesViewMode] = useState<"grid" | "list">("grid")
  const [guidelinesViewMode, setGuidelinesViewMode] = useState<"grid" | "list">("grid")

  // Filterzustände für Guidelines
  const [searchTermGuidelines, setSearchTermGuidelines] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filterzustände für Principles
  const [searchTermPrinciples, setSearchTermPrinciples] = useState("")
  const [selectedElement, setSelectedElement] = useState<PrincipleElement>("all")

  // Flag to hide the Add button temporarily
  const showAddButton = false // Set to false to hide the button

  // Check Supabase connection on mount
  useEffect(() => {
    async function checkConnection() {
      setConnectionStatus("checking")
      setConnectionError(null)

      try {
        // First, try to initialize the database if needed
        const initResult = await initializeDatabase()
        if (!initResult.success) {
          setConnectionStatus("error")
          setConnectionError(`Failed to initialize database: ${initResult.error?.message || "Unknown error"}`)
          return
        }

        // Then test the connection
        const result = await testSupabaseConnection()
        if (!result.success) {
          setConnectionStatus("error")
          setConnectionError(`Failed to connect to Supabase: ${result.error?.message || "Unknown error"}`)
          return
        }

        setConnectionStatus("connected")

        // Force refresh data
        await refreshAppContextData()
      } catch (error) {
        setConnectionStatus("error")
        setConnectionError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    checkConnection()
  }, [refreshAppContextData])

  useEffect(() => {
    console.log(
      `Current state has ${state.guidelines.length} guidelines, ${state.categories.length} categories, and ${state.principles.length} principles`,
    )
  }, [state.guidelines.length, state.categories.length, state.principles.length])

  useEffect(() => {
    // Check if we should skip the homepage based on URL parameter
    const skipHome = searchParams.get("skipHome") === "true"
    if (skipHome) {
      setShowHomePage(false)
    }
  }, [searchParams])

  const handleEdit = (guideline: Guideline) => {
    setEditingGuideline(guideline)
    setIsAddingGuideline(true)
  }

  const handleSubmit = (guideline: Guideline) => {
    if (editingGuideline) {
      updateGuideline(guideline)
      setEditingGuideline(null)
      setIsAddingGuideline(false)
    } else {
      addGuideline(guideline)
      setIsAddingGuideline(false)
    }
  }

  const handleAddPrinciple = (principle: Principle) => {
    const updatedPrinciples = [...state.principles, principle]
    savePrinciples(updatedPrinciples)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  const handleDeleteGuideline = async (id: string) => {
    try {
      // Call the dedicated delete API endpoint
      const storageService = getStorageService()
      const success = await storageService.deleteGuideline(id)

      if (success) {
        // Update the UI
        deleteGuidelineFromContext(id)

        toast({
          title: "Guideline deleted",
          description: "The guideline has been removed from the database.",
        })
      } else {
        throw new Error("Failed to delete guideline from database")
      }
    } catch (error) {
      console.error("Error deleting guideline:", error)

      // Refresh data to ensure UI is in sync with server
      await refreshAppContextData()

      toast({
        title: "Error deleting guideline",
        description: "There was a problem deleting your guideline. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Kontextabhängiger Hinzufügen-Button
  const handleAddButtonClick = () => {
    if (activeTab === "guidelines") {
      setIsAddingGuideline(true)
    } else if (activeTab === "principles") {
      setIsAddPrincipleDialogOpen(true)
    }
  }

  // Öffnet den Export-Dialog
  const openExportDialog = () => {
    setIsExportDialogOpen(true)
  }

  // Führt den Export mit den ausgewählten Optionen durch
  const handleExport = async (options: ExportOptions) => {
    try {
      await exportAppData(options)
      toast({
        title: "Export erfolgreich",
        description: "Die Daten wurden erfolgreich exportiert und werden heruntergeladen.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
      throw error // Weitergeben des Fehlers an den Dialog
    }
  }

  // Zähle die Bilder in den Guidelines
  const countImagesInGuidelines = () => {
    return state.guidelines.filter((g) => g.imageUrl || g.detailImageUrl || g.svgContent || g.detailSvgContent).length
  }

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsLoading(true)
    try {
      await refreshAppContextData()
      toast({
        title: "Daten aktualisiert",
        description: "Die Daten wurden erfolgreich aktualisiert.",
      })
    } catch (error) {
      toast({
        title: "Fehler beim Aktualisieren",
        description: `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showHomePage) {
    return <HomePage />
  }

  return (
    <main className="container mx-auto px-4">
      {state.hasError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {state.errorMessage}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={exportDebugLogs}>
                Export Debug Logs
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Connection Error</AlertTitle>
          <AlertDescription>
            {connectionError}
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={handleManualRefresh}>
                Retry Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isAddingGuideline ? (
        <>
          <div className="mb-6 pt-8">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddingGuideline(false)
                setEditingGuideline(null)
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Guidelines
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{editingGuideline ? "Edit Guideline" : "Add New Guideline"}</CardTitle>
              <CardDescription>
                {editingGuideline
                  ? "Update the guideline details below"
                  : "Fill in the details to create a new guideline"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GuidelineForm
                existingCategories={state.categories}
                existingPrinciples={state.principles}
                onSubmit={handleSubmit}
                onAddPrinciple={handleAddPrinciple}
                initialData={editingGuideline}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex flex-col">
          {/* Combined header and search container with continuous background */}
          <div className={`fixed top-0 left-0 right-0 z-50 bg-white ${activeTab === "principles" ? "h-auto" : ""}`}>
            {/* Header section */}
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                {/* Linker Bereich: Titel */}
                <h1 className="text-2xl font-bold text-gray-700">CX Guidelines</h1>

                {/* Mittlerer Bereich: Tabs */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="guidelines">
                        <FileText size={14} className="mr-1" />
                        Guidelines
                      </TabsTrigger>
                      <TabsTrigger value="principles">
                        <BookOpen size={14} className="mr-1" />
                        Psychologische Grundlagen
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Rechter Bereich: Aktionsbuttons */}
                <div className="flex items-center gap-2">
                  {/* ERGOSIGN Logo */}
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-rYTABolBUBWveDJBn941qJSCd8oH9V.png"
                    alt="ERGOSIGN"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Pass the combined header height to child components */}
            {activeTab === "guidelines" && !state.isLoading && (
              <div className="container mx-auto px-4 pt-4 pb-0">
                {/* Category dropdown above search */}
                {/* Search input */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {/* Category dropdown */}
                  <div className="w-[200px]">
                    <Select
                      value={selectedCategory || "all"}
                      onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alle Kategorien" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Kategorien</SelectItem>
                        {state.categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Guidelines durchsuchen..."
                      value={searchTermGuidelines}
                      onChange={(e) => setSearchTermGuidelines(e.target.value)}
                      className="pl-9"
                    />
                    {searchTermGuidelines && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setSearchTermGuidelines("")}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {
                      state.guidelines.filter(
                        (g) =>
                          (searchTermGuidelines === "" ||
                            g.title.toLowerCase().includes(searchTermGuidelines.toLowerCase()) ||
                            g.text.toLowerCase().includes(searchTermGuidelines.toLowerCase())) &&
                          (selectedCategory === null || g.categories.includes(selectedCategory)),
                      ).length
                    }{" "}
                    von {state.guidelines.length}
                    {(searchTermGuidelines || selectedCategory) && " (gefiltert)"}
                  </div>

                  {/* Add button - temporarily hidden */}
                  {showAddButton && (
                    <div className="flex gap-2 ml-auto">
                      <Button onClick={handleAddButtonClick} size="sm" className="flex items-center gap-1">
                        <PlusCircle size={14} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "principles" && !state.isLoading && (
              <div className="container mx-auto px-4 pb-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Prinzipien durchsuchen..."
                      value={searchTermPrinciples}
                      onChange={(e) => setSearchTermPrinciples(e.target.value)}
                      className="pl-9"
                    />
                    {searchTermPrinciples && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setSearchTermPrinciples("")}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>

                  <Select
                    value={selectedElement}
                    onValueChange={(value) => setSelectedElement(value as PrincipleElement)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Alle Elemente" />
                    </SelectTrigger>
                    <SelectContent>
                      {["all", "ui", "ux", "content", "other", "decision"].map((element) => (
                        <SelectItem key={element} value={element}>
                          {element === "all" ? "Alle Elemente" : element.charAt(0).toUpperCase() + element.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {
                      state.principles.filter((principle) => {
                        const titleMatch = (principle.title || principle.name || "")
                          .toLowerCase()
                          .includes(searchTermPrinciples.toLowerCase())
                        const descriptionMatch = principle.description
                          .toLowerCase()
                          .includes(searchTermPrinciples.toLowerCase())
                        const elementMatch =
                          selectedElement === "all" ||
                          principle.element === selectedElement ||
                          (Array.isArray(principle.elements) && principle.elements.includes(selectedElement))
                        return (searchTermPrinciples === "" || titleMatch || descriptionMatch) && elementMatch
                      }).length
                    }{" "}
                    von {state.principles.length}
                    {(searchTermPrinciples || selectedElement !== "all") && " (gefiltert)"}
                  </div>

                  <div className="flex gap-2 ml-auto">
                    <Button
                      onClick={() => setIsAddPrincipleDialogOpen(true)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hauptinhalt mit Abstand zum Header */}
          <div className="mt-[73px]">
            {activeTab === "guidelines" ? (
              <div className="pt-6">
                {state.isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw size={24} className="mx-auto animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading guidelines from database...</p>
                  </div>
                ) : state.guidelines.length === 0 && connectionStatus === "connected" ? (
                  <div className="text-center py-12">
                    <AlertCircle size={24} className="mx-auto mb-4 text-amber-500" />
                    <h3 className="text-lg font-medium mb-2">No Guidelines Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Your database is connected but no guidelines were found. Try importing data or adding new
                      guidelines.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => setIsAddingGuideline(true)}>
                        <PlusCircle size={16} className="mr-2" />
                        Add Guideline
                      </Button>
                    </div>
                  </div>
                ) : (
                  <GuidelineList
                    guidelines={state.guidelines}
                    principles={state.principles}
                    onEdit={handleEdit}
                    onDelete={handleDeleteGuideline}
                    isAuthenticated={true} // Immer als authentifiziert betrachten
                    headerHeight={73}
                    inFixedHeader={false}
                    searchTerm={searchTermGuidelines}
                    onSearchChange={setSearchTermGuidelines}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    viewMode={guidelinesViewMode}
                    onViewModeChange={setGuidelinesViewMode}
                  />
                )}
              </div>
            ) : (
              <div className="pt-6">
                {state.isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw size={24} className="mx-auto animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading principles from database...</p>
                  </div>
                ) : state.principles.length === 0 && connectionStatus === "connected" ? (
                  <div className="text-center py-12">
                    <AlertCircle size={24} className="mx-auto mb-4 text-amber-500" />
                    <h3 className="text-lg font-medium mb-2">No Principles Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Your database is connected but no principles were found. Try importing data or adding new
                      principles.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => setIsAddPrincipleDialogOpen(true)}>
                        <PlusCircle size={16} className="mr-2" />
                        Add Principle
                      </Button>
                    </div>
                  </div>
                ) : (
                  <PrincipleManager
                    principles={state.principles}
                    onSave={savePrinciples}
                    isAuthenticated={true} // Immer als authentifiziert betrachten
                    isAddDialogOpen={isAddPrincipleDialogOpen}
                    onAddDialogOpenChange={setIsAddPrincipleDialogOpen}
                    headerHeight={73}
                    inFixedHeader={false}
                    searchTerm={searchTermPrinciples}
                    onSearchChange={setSearchTermPrinciples}
                    selectedElement={selectedElement}
                    onElementChange={setSelectedElement}
                    viewMode={principlesViewMode}
                    onViewModeChange={setPrinciplesViewMode}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Options Dialog */}
      <ExportOptionsDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
        guidelinesCount={state.guidelines.length}
        principlesCount={state.principles.length}
        categoriesCount={state.categories.length}
        imagesCount={countImagesInGuidelines()}
      />

      <Toaster />
    </main>
  )
}

// Wrap the component with the AppProvider
export default function Page() {
  return (
    <AppProvider>
      <GuidelinesManager />
    </AppProvider>
  )
}
