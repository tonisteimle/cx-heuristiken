"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getStorageService } from "@/services/storage-factory"

export function StorageStatus() {
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const storageService = getStorageService()
      const stats = await storageService.getStats()
      setStats(stats)
    } catch (error) {
      console.error("Error loading stats:", error)
      setError("Could not load storage statistics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Storage Status</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <p>Loading storage statistics...</p>
        ) : stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Guidelines</h3>
                <p className="text-2xl font-bold">{stats.guidelinesCount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Categories</h3>
                <p className="text-2xl font-bold">{stats.categoriesCount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Principles</h3>
                <p className="text-2xl font-bold">{stats.principlesCount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Last Updated</h3>
                <p className="text-sm">{new Date(stats.lastUpdated).toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Storage Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Data Size:</span>
                  <span>{Math.round(stats.databaseSize / 1024)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Type:</span>
                  <span>Supabase Database</span>
                </div>
              </div>
            </div>

            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cloud Storage</AlertTitle>
              <AlertDescription>
                Your data is stored in Supabase cloud storage. It will be available across devices and browsers. Regular
                backups are still recommended for important data.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <p>No storage statistics available</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={loadStats} disabled={isLoading}>
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}
