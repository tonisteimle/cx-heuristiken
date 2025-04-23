import type { StorageInterface } from "./storage-interface"
import type { StorageData, StorageStats } from "@/types/storage-data"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { Guideline } from "@/types/guideline"
import { initialData } from "@/data/initial-data"
import { chunkArray } from "@/services/storage-factory"

export class SupabaseStorageService implements StorageInterface {
  private readonly BUCKET_NAME = "guidelines-images"
  private readonly MAX_PAYLOAD_SIZE = 100000 // Define a reasonable payload size limit in bytes (100KB)

  async saveData(data: StorageData, isIncremental = false): Promise<boolean> {
    try {
      console.log("saveData called", { isIncremental, dataSize: JSON.stringify(data).length })
      if (!data) {
        console.error("No data provided to saveData")
        return false
      }

      // Check payload size to decide if we need to use incremental save
      const estimatedSize = JSON.stringify(data).length
      const shouldUseIncremental = estimatedSize > this.MAX_PAYLOAD_SIZE || isIncremental

      // If payload is too large or incremental flag is true, use incremental saving
      if (shouldUseIncremental) {
        console.log(`Using incremental save (${estimatedSize} bytes exceeds limit or explicitly requested)`)
        return await this.saveDataIncrementally(data)
      } else {
        // Non-incremental save for small payloads
        const requestBody = JSON.stringify({ data, isIncremental: false })
        console.log(`Non-incremental request body size: ${requestBody.length} bytes`)

        const response = await fetch("/api/supabase/save-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Non-incremental API error response:", errorText)

          // If we get a size error, fallback to incremental approach
          if (errorText.includes("Data size too large")) {
            console.log("Falling back to incremental save after size error")
            return await this.saveDataIncrementally(data)
          }

          throw new Error(`API responded with status: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log("Non-incremental API result", result)

        if (!result.success) {
          console.error("Non-incremental API returned error:", result.error)
          return false
        }

        return true
      }
    } catch (error) {
      console.error("Error saving data:", error)
      // Fallback to localStorage if the API is not reachable
      try {
        localStorage.setItem(
          "guidelines_data",
          JSON.stringify({
            ...data,
            lastUpdated: new Date().toISOString(),
          }),
        )
        console.log("Data saved to localStorage as fallback")
        return true
      } catch (localStorageError) {
        console.error("Error saving to localStorage fallback:", localStorageError)
        return false
      }
    }
  }

  // Extracted incremental save logic to a separate method
  private async saveDataIncrementally(data: StorageData): Promise<boolean> {
    const chunkSize = 20 // Reduced chunk size to ensure smaller payloads
    const guidelineChunks = chunkArray(data.guidelines, chunkSize)
    let allChunksSuccessful = true

    console.log(`Saving data incrementally with ${guidelineChunks.length} chunks (${chunkSize} guidelines per chunk)`)

    for (let i = 0; i < guidelineChunks.length; i++) {
      const chunk = guidelineChunks[i]
      const chunkData: StorageData = {
        ...data,
        guidelines: chunk,
      }

      const requestBody = JSON.stringify({ data: chunkData, isIncremental: true })
      console.log(`Incremental chunk ${i + 1}/${guidelineChunks.length}, size: ${requestBody.length} bytes`)

      const response = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Incremental chunk ${i + 1} API error response:`, errorText)
        allChunksSuccessful = false

        // Add delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Try one more time with a smaller chunk
        if (chunk.length > 5) {
          console.log(`Retrying chunk ${i + 1} with a smaller size`)
          const smallerChunks = chunkArray(chunk, 5)

          for (let j = 0; j < smallerChunks.length; j++) {
            const smallerChunk = smallerChunks[j]
            const smallerChunkData: StorageData = {
              ...data,
              guidelines: smallerChunk,
            }

            const smallerRequestBody = JSON.stringify({ data: smallerChunkData, isIncremental: true })
            const retryResponse = await fetch("/api/supabase/save-data", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: smallerRequestBody,
            })

            if (!retryResponse.ok) {
              console.error(`Retry failed for chunk ${i + 1}, sub-chunk ${j + 1}`)
              return false
            }

            // Add delay between retries
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }

          // If we got here, the retry succeeded
          allChunksSuccessful = true
        } else {
          // If chunk is already small and still failing, give up
          return false
        }
      }

      const result = await response.json()
      if (!result.success) {
        console.error(`Incremental chunk ${i + 1} API returned error:`, result.error)
        allChunksSuccessful = false
        break
      }

      // Add delay between chunks to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // If all guideline chunks were successful, save the categories and principles
    if (allChunksSuccessful) {
      const finalData: StorageData = {
        ...data,
        guidelines: [], // Clear guidelines to avoid exceeding size limits
      }

      const finalRequestBody = JSON.stringify({ data: finalData, isIncremental: true })
      console.log(`Final data (categories/principles) size: ${finalRequestBody.length} bytes`)

      const finalResponse = await fetch("/api/supabase/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: finalRequestBody,
      })

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text()
        console.error("Final data API error response:", errorText)
        return false
      }

      const finalResult = await finalResponse.json()
      if (!finalResult.success) {
        console.error("Final data API returned error:", finalResult.error)
        return false
      }

      return true
    } else {
      console.error("One or more guideline chunks failed to save.")
      return false
    }
  }

  async loadData(): Promise<StorageData> {
    try {
      const response = await fetch("/api/supabase/load-data")

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        return result.data
      } else {
        console.error("Error loading data from API:", result.error)
        // Try to load from localStorage if the API fails
        const storedData = localStorage.getItem("guidelines_data")
        if (storedData) {
          console.log("Loading data from localStorage fallback")
          return JSON.parse(storedData) as StorageData
        }
        return initialData
      }
    } catch (error) {
      console.error("Error loading data from API:", error)
      // Try to load from localStorage if the API fails
      try {
        const storedData = localStorage.getItem("guidelines_data")
        if (storedData) {
          console.log("Loading data from localStorage fallback")
          return JSON.parse(storedData) as StorageData
        }
      } catch (localStorageError) {
        console.error("Error loading from localStorage fallback:", localStorageError)
      }
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
        const supabase = getSupabaseClient()

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
        data.guidelines[index] = guideline
      } else {
        // Add a new guideline
        data.guidelines.push(guideline)
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
      } catch (apiError) {
        console.error("Error deleting guideline via API:", apiError)
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
