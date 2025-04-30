import type { StorageInterface } from "./storage-interface"
import type { StorageData, StorageStats } from "@/types/storage-data"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import type { Guideline } from "@/types/guideline"
import { initialData } from "@/data/initial-data"

export class SupabaseStorageService implements StorageInterface {
  private readonly BUCKET_NAME = "guidelines-images"

  async saveData(data: StorageData): Promise<boolean> {
    try {
      console.log("saveData called")

      // Get the Supabase client - use server client for write operations
      const supabase = createServerSupabaseClient()

      // Save the data to Supabase
      const { error } = await supabase
        .from("guidelines_data")
        .update({
          data: data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "main")

      if (error) {
        console.error("Supabase error saving data:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error saving data:", error)
      return false
    }
  }

  async loadData(): Promise<StorageData> {
    try {
      // Use server client for better reliability
      const supabase = createServerSupabaseClient()

      console.log("Attempting to load data from Supabase...")

      const { data, error } = await supabase.from("guidelines_data").select("data").eq("id", "main").single()

      if (error) {
        console.error("Supabase error loading data:", error)
        throw error
      }

      if (data && data.data) {
        console.log("Data loaded successfully from Supabase")
        return data.data as StorageData
      } else {
        console.log("No data found, returning initial data")
        return initialData
      }
    } catch (error) {
      console.error("Error loading data:", error)

      // Fallback to initial data if there's an error
      console.log("Returning initial data due to error")
      return initialData
    }
  }

  async uploadImage(file: File): Promise<{ url: string; name: string; base64?: string } | null> {
    try {
      // First try to convert the image to Base64 for fallback
      const base64 = await this.fileToBase64(file)

      try {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("name", file.name)

        const response = await fetch("/api/supabase/upload-image", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          return {
            url: result.url,
            name: file.name,
            base64: base64, // Also store the Base64 version for fallback
          }
        }
      } catch (uploadError) {
        console.error("Error uploading to Supabase, using Base64 fallback:", uploadError)
      }

      // Fallback: Use Base64 directly
      return {
        url: base64,
        name: file.name,
        base64: base64,
      }
    } catch (error) {
      console.error("Error in image upload:", error)
      return null
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // If it's a Base64 URL, we don't need to do anything
      if (imageUrl.startsWith("data:")) {
        return true
      }

      const response = await fetch("/api/supabase/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imageUrl }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Error deleting image:", error)
      return false
    }
  }

  async getStats(): Promise<StorageStats> {
    try {
      // Try to get statistics from Supabase
      try {
        // Get the Supabase client
        const supabase = createServerSupabaseClient()

        // Get the list of files in the bucket to count them
        const { data: files, error } = await supabase.storage.from(this.BUCKET_NAME).list()

        if (!error && files) {
          // Calculate total size (this is an estimate as we don't have file sizes)
          const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)

          // Load the data to count the number of guidelines, categories, and principles
          const data = await this.loadData()

          return {
            imagesCount: files.length,
            totalSize,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            guidelinesCount: data.guidelines.length,
            categoriesCount: data.categories.length,
            principlesCount: data.principles.length,
            databaseSize: JSON.stringify(data).length,
          }
        }
      } catch (supabaseError) {
        console.error("Error getting stats from Supabase:", supabaseError)
      }

      // Fallback: Calculate statistics from local data
      const data = await this.loadData()

      return {
        imagesCount: 0,
        totalSize: JSON.stringify(data).length,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        guidelinesCount: data.guidelines.length,
        categoriesCount: data.categories.length,
        principlesCount: data.principles.length,
        databaseSize: JSON.stringify(data).length,
      }
    } catch (error) {
      console.error("Error getting storage stats:", error)
      return {
        imagesCount: 0,
        totalSize: 0,
        lastUpdated: new Date().toISOString(),
        guidelinesCount: 0,
        categoriesCount: 0,
        principlesCount: 0,
        databaseSize: 0,
      }
    }
  }

  async saveGuideline(guideline: Guideline): Promise<boolean> {
    try {
      // First try to save the guideline via the API
      try {
        const response = await fetch("/api/supabase/save-guideline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(guideline),
        })

        const result = await response.json()
        if (result.success) {
          // If the API returns a new ID, update the local guideline
          if (result.id && result.id !== guideline.id) {
            // Update the ID in the local data
            const data = await this.loadData()
            const updatedGuidelines = data.guidelines.map((g) => (g.id === guideline.id ? { ...g, id: result.id } : g))

            await this.saveData({
              ...data,
              guidelines: updatedGuidelines,
              lastUpdated: new Date().toISOString(),
            })
          }
          return true
        }
      } catch (apiError) {
        console.error("Error saving guideline via API:", apiError)
      }

      // Fallback: Update the data locally
      const data = await this.loadData()

      // Find the index of the guideline if it already exists
      const index = data.guidelines.findIndex((g) => g.id === guideline.id)

      if (index >= 0) {
        // Update the existing guideline
        data.guidelines[index] = {
          ...guideline,
          updatedAt: new Date().toISOString(), // Ensure updatedAt is an ISO string
        }
      } else {
        // Add a new guideline
        data.guidelines.push({
          ...guideline,
          createdAt: guideline.createdAt || new Date().toISOString(), // Generate new createdAt timestamp if not exists
          updatedAt: new Date().toISOString(), // Ensure updatedAt is an ISO string
        })
      }

      // Save the updated data
      return await this.saveData(data)
    } catch (error) {
      console.error("Error saving guideline:", error)
      return false
    }
  }

  async deleteGuideline(id: string): Promise<boolean> {
    try {
      // First try to delete the guideline via the API
      try {
        const response = await fetch("/api/supabase/delete-guideline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        })

        const result = await response.json()
        if (result.success) {
          return true
        }

        // Wenn die API einen Fehler zurückgibt, werfen wir ihn
        if (!result.success) {
          throw new Error(result.error || "Unbekannter Fehler beim Löschen der Guideline")
        }
      } catch (apiError) {
        console.error("Error deleting guideline via API:", apiError)
        throw apiError // Wichtig: Fehler weiterwerfen, damit der Fallback aktiviert wird
      }

      // Fallback: Delete the guideline locally
      const data = await this.loadData()

      // Filter out the guideline to be deleted
      data.guidelines = data.guidelines.filter((g) => g.id !== id)

      // Save the updated data
      return await this.saveData(data)
    } catch (error) {
      console.error("Error deleting guideline:", error)
      return false
    }
  }

  // Helper method to convert a file to Base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  }

  // Helper method to clean image references
  cleanImageReferences(data: any): any {
    return data
  }

  // Helper method to log debug information
  async logDebug(message: string, data?: any): Promise<void> {
    console.log(`[DEBUG] ${message}`, data)
  }

  // Helper method to export debug logs
  async exportDebugLogs(): Promise<boolean> {
    return true
  }
}
