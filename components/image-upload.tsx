"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getStorageService } from "@/services/storage-factory"

interface ImageUploadProps {
  initialImageUrl?: string
  initialImageName?: string
  onImageUploaded: (imageUrl: string, imageName: string) => void
  onImageRemoved: () => void
  label?: string
}

export function ImageUpload({
  initialImageUrl,
  initialImageName,
  onImageUploaded,
  onImageRemoved,
  label = "UI-Beispielbild (optional)",
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl)
  const [imageName, setImageName] = useState<string | undefined>(initialImageName)
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Ensure the component updates when props change
  useEffect(() => {
    setImageUrl(initialImageUrl)
    setImageName(initialImageName)
    setImageError(null)
  }, [initialImageUrl, initialImageName])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setImageError(null)

      console.log(`File selected: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`)

      const storageService = getStorageService()
      // Upload image to storage
      const result = await storageService.uploadImage(file)

      if (!result) {
        throw new Error("Failed to upload image")
      }

      // Set the image URL and name
      setImageUrl(result.url)
      setImageName(result.name)
      onImageUploaded(result.url, result.name)

      toast({
        title: "Image uploaded",
        description: `The image "${file.name}" was successfully uploaded.`,
      })
    } catch (error) {
      console.error("Error uploading:", error)
      setImageError(error instanceof Error ? error.message : "The image could not be uploaded.")

      toast({
        title: "Upload error",
        description: error instanceof Error ? error.message : "The image could not be uploaded.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (imageUrl) {
      const storageService = getStorageService()
      // Delete the image from storage if it's a Blob URL
      if (imageUrl.includes("blob.vercel-storage.com")) {
        await storageService.deleteImage(imageUrl)
      }
    }

    setImageUrl(undefined)
    setImageName(undefined)
    setImageError(null)
    onImageRemoved()

    toast({
      title: "Image removed",
      description: "The image has been removed from the guideline.",
    })
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Error loading image:", e)
    setImageError(`The image could not be loaded. Please try again or choose another image.`)
    e.currentTarget.src = "/placeholder.svg"
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <X size={14} />
            Remove image
          </Button>
        )}
      </div>

      {imageError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{imageError}</AlertDescription>
        </Alert>
      )}

      {imageUrl ? (
        <div className="border rounded-md p-2">
          <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="UI example"
              className="object-contain w-full h-full"
              onError={handleImageError}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 truncate">{imageName}</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            id="image-upload"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload size={14} />
            {isUploading ? "Uploading..." : "Upload image"}
          </Button>
          <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 5MB</p>
        </div>
      )}
    </div>
  )
}
