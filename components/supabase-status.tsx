"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"

export function SupabaseStatus() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bucketStatus, setBucketStatus] = useState<"idle" | "success" | "error">("idle")
  const [bucketErrorMessage, setBucketErrorMessage] = useState<string | null>(null)

  const checkConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("idle")
    setErrorMessage(null)
    setBucketStatus("idle")
    setBucketErrorMessage(null)

    try {
      const supabase = getSupabaseClient()

      // Test database connection
      const { data, error } = await supabase.from("version").select("*").limit(1)

      if (error) {
        setConnectionStatus("error")
        setErrorMessage(error.message)
      } else {
        setConnectionStatus("success")

        // Test storage bucket
        try {
          const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("guidelines-images")

          if (bucketError) {
            setBucketStatus("error")
            setBucketErrorMessage(bucketError.message)
          } else {
            setBucketStatus("success")
          }
        } catch (bucketError) {
          setBucketStatus("error")
          setBucketErrorMessage(bucketError instanceof Error ? bucketError.message : "Unknown error checking bucket")
        }
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking connection...</span>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2">Database Connection:</h3>
                {connectionStatus === "success" ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Connected</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Successfully connected to Supabase database.
                    </AlertDescription>
                  </Alert>
                ) : connectionStatus === "error" ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Storage Bucket:</h3>
                {bucketStatus === "success" ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Bucket Available</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Successfully connected to 'guidelines-images' bucket.
                    </AlertDescription>
                  </Alert>
                ) : bucketStatus === "error" ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Bucket Error</AlertTitle>
                    <AlertDescription>{bucketErrorMessage}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </>
          )}

          <Button onClick={checkConnection} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Connection"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
