"use client"

import { useState, useEffect } from "react"
import { PlusCircle, ArrowLeft, AlertCircle, RefreshCw, BookOpen, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppProvider, useAppContext } from "@/contexts/app-context"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { LoginButton } from "@/components/login-dialog"
import GuidelineForm from "@/components/guideline-form"
import GuidelineList from "@/components/guideline-list"
import PrincipleManager from "@/components/principle-manager"
import type { Guideline, Principle, PrincipleElement } from "@/types/guideline"
import { getStorageService } from "@/services/storage-factory"
import { UnifiedImportDialogTrigger } from "@/components/unified-import-dialog-trigger"
import { ExportOptionsDialog, type ExportOptions } from "@/components/export-options-dialog"

function GuidelinesManager() {
  const { toast } = useToast()
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
  const { isAuthenticated } = useAuth()

  const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null)
  const [isAddingGuideline, setIsAddingGuideline] = useState(false)
  const [activeTab, setActiveTab] = useState("guidelines")
  const [isLoading, setIsLoading] = useState(false)
  const [isAddPrincipleDialogOpen, setIsAddPrincipleDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  // ViewMode-States für beide Ansichten
  const [principlesViewMode, setPrinciplesViewMode] = useState<"grid" | "list">("grid")
  const [guidelinesViewMode, setGuidelinesViewMode] = useState<"grid" | "list">("grid")

  // Filterzustände für Guidelines
  const [searchTermGuidelines, setSearchTermGuidelines] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filterzustände für Principles
  const [searchTermPrinciples, setSearchTermPrinciples] = useState("")
  const [selectedElement, setSelectedElement] = useState<PrincipleElement>("all")

  useEffect(() => {
    console.log(
      `Current state has ${state.guidelines.length} guidelines, ${state.categories.length} categories, and ${state.principles.length} principles`,
    )
  }, [state.guidelines.length, state.categories.length, state.principles.length])

  const handleEdit = (guideline: Guideline) => {
    if (!isAuthenticated) return
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
          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            {/* Header section */}
            <div className="container mx-auto px-4 border-b">
              <div className="flex justify-between items-center py-4">
                {/* Linker Bereich: Titel */}
                <h1 className="text-2xl font-bold text-gray-700">CX Guidelines</h1>

                {/* Mittlerer Bereich: Tabs */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="guidelines">
                        <FileText size={14} className="mr-1" />
                        CX Guidelines
                      </TabsTrigger>
                      <TabsTrigger value="principles">
                        <BookOpen size={14} className="mr-1" />
                        Psychologische Effekte
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Rechter Bereich: Aktionsbuttons */}
                <div className="flex items-center gap-2">
                  {/* Import Button */}
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const importDialog = document.getElementById("unified-import-dialog-trigger")
                        if (importDialog) {
                          ;(importDialog as HTMLButtonElement).click()
                        }
                      }}
                    >
                      Import
                    </Button>
                  )}

                  {/* Export Button */}
                  {isAuthenticated && (
                    <Button variant="outline" size="sm" onClick={openExportDialog} className="flex items-center gap-1">
                      <Download size={14} />
                      Export
                    </Button>
                  )}

                  {/* Login Button */}
                  <LoginButton />

                  {/* Kontextabhängiger Hinzufügen-Button */}
                  {isAuthenticated && (
                    <Button onClick={handleAddButtonClick} size="sm" className="ml-2">
                      <PlusCircle size={14} className="mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pass the combined header height to child components */}
            {activeTab === "guidelines" && !state.isLoading && (
              <GuidelineList
                guidelines={state.guidelines}
                principles={state.principles}
                onEdit={handleEdit}
                onDelete={handleDeleteGuideline}
                isAuthenticated={isAuthenticated}
                headerHeight={0}
                inFixedHeader={true}
                searchTerm={searchTermGuidelines}
                onSearchChange={setSearchTermGuidelines}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                viewMode={guidelinesViewMode}
                onViewModeChange={setGuidelinesViewMode}
              />
            )}

            {activeTab === "principles" && !state.isLoading && (
              <PrincipleManager
                principles={state.principles}
                onSave={savePrinciples}
                isAuthenticated={isAuthenticated}
                isAddDialogOpen={isAddPrincipleDialogOpen}
                onAddDialogOpenChange={setIsAddPrincipleDialogOpen}
                headerHeight={0}
                inFixedHeader={true}
                searchTerm={searchTermPrinciples}
                onSearchChange={setSearchTermPrinciples}
                selectedElement={selectedElement}
                onElementChange={setSelectedElement}
                viewMode={principlesViewMode}
                onViewModeChange={setPrinciplesViewMode}
              />
            )}
          </div>

          {/* Hauptinhalt mit Abstand zum Header */}
          <div className="mt-[200px]">
            {activeTab === "guidelines" ? (
              <div>
                {state.isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw size={24} className="mx-auto animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading guidelines from database...</p>
                  </div>
                ) : (
                  <GuidelineList
                    guidelines={state.guidelines}
                    principles={state.principles}
                    onEdit={handleEdit}
                    onDelete={handleDeleteGuideline}
                    isAuthenticated={isAuthenticated}
                    headerHeight={200}
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
              <div>
                {state.isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw size={24} className="mx-auto animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading principles from database...</p>
                  </div>
                ) : (
                  <PrincipleManager
                    principles={state.principles}
                    onSave={savePrinciples}
                    isAuthenticated={isAuthenticated}
                    isAddDialogOpen={isAddPrincipleDialogOpen}
                    onAddDialogOpenChange={setIsAddPrincipleDialogOpen}
                    headerHeight={200}
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
      <UnifiedImportDialogTrigger />
    </main>
  )
}

// Wrap the component with the AppProvider and AuthProvider
export default function Page() {
  return (
    <AuthProvider>
      <AppProvider>
        <GuidelinesManager />
      </AppProvider>
    </AuthProvider>
  )
}
