"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function SupabaseStorageTest() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()

      // Upload the file
      const { data, error } = await supabase.storage
        .from("guidelines-images")
        .upload(`test-${Date.now()}-${file.name}`, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        throw error
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("guidelines-images").getPublicUrl(data.path)

      setUploadedUrl(urlData.publicUrl)
      setSuccess("File uploaded successfully!")
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Storage Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select a file to upload</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <Button onClick={uploadFile} disabled={!file || uploading} className="w-full">
          {uploading ? "Uploading..." : "Upload File"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {uploadedUrl && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Uploaded File:</h3>
            <img
              src={uploadedUrl || "/placeholder.svg"}
              alt="Uploaded file"
              className="max-w-full h-auto rounded-md border"
            />
            <p className="mt-2 text-xs text-gray-500 break-all">{uploadedUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
