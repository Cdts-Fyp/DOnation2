"use client"

import { useState, useRef, DragEvent, ChangeEvent } from "react"
import { Upload, X, Image as ImageIcon, Loader } from "lucide-react"
import ImageUploaderService from "@/lib/uploadImage"

interface ImageUploaderProps {
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved?: () => void
  className?: string
}

export default function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  className = ""
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploaderService = new ImageUploaderService()
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    
    const result = uploaderService.handleDrop(e)
    
    if (result.error) {
      setError(result.error)
      return
    }
    
    handleUpload(result.file)
  }
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    handleUpload(file)
  }
  
  const handleUpload = async (file: File) => {
    try {
      const result = await uploaderService.handleImageUpload(file, setIsUploading)
      
      if (result.error) {
        setError(result.error)
        return
      }
      
      if (result.imageUrl) {
        setPreviewUrl(result.imageUrl)
        onImageUploaded(result.imageUrl)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    }
  }
  
  const handleRemoveImage = async () => {
    if (!previewUrl) return
    
    try {
      setIsUploading(true)
      
      if (previewUrl.startsWith('http')) {
        await uploaderService.handleDeleteImage(previewUrl)
      }
      
      setPreviewUrl(null)
      if (onImageRemoved) {
        onImageRemoved()
      }
    } catch (err) {
      setError('Failed to remove image')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }
  
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <div className={`w-full ${className}`}>
      {previewUrl ? (
        <div className="relative rounded-lg border-2 border-dashed border-gray-300 p-2 h-[200px] flex items-center justify-center">
          <img 
            src={previewUrl} 
            alt="Uploaded image" 
            className="max-h-full max-w-full object-contain rounded"
          />
          
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : (
            <button 
              onClick={handleRemoveImage} 
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`w-full h-[200px] rounded-lg border-2 border-dashed ${
            isDragging ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300'
          } flex flex-col items-center justify-center p-4 transition-colors cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <Loader className="h-10 w-10 text-cyan-500 animate-spin mb-4" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 text-center mb-1">
                Drag and drop your image here, or <span className="text-cyan-600 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-gray-400 text-center">
                PNG, JPG, JPEG, or GIF (Max 5MB)
              </p>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 