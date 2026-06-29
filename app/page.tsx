'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setFile(selectedFile)
      setError(null)
      setSuccess(null)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelect(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Uploaded successfully!\nReference ID: ${data.referenceId}`);
        setPreview(null)
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Upload Image</h1>

        {!preview ? (
          <div
            className="border-3 border-dashed border-indigo-500 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-indigo-50 transition-all"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-600 font-medium">Click or drag & drop to upload</p>
            <p className="text-gray-400 text-sm mt-2">Supports: JPG, PNG, GIF, WebP (Max 10MB)</p>
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <button
              onClick={() => {
                setPreview(null)
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]
            if (selectedFile) handleFileSelect(selectedFile)
          }}
        />

        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 whitespace-pre-line">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
