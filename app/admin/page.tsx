'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ImageData {
  id: string
  referenceId: string
  filename: string
  originalName: string
  url: string
  size: number
  uploadedAt: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      loadImages()
    }
  }, [status, router])

  const loadImages = async () => {
    try {
      const response = await fetch('/api/images')
      const data = await response.json()
      setImages(data)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } catch (error) {
      alert('Failed to copy link')
    }
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setImages(images.filter(img => img.id !== id))
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      alert('Error deleting image')
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const today = new Date().toDateString()
  const todayUploads = images.filter(img => new Date(img.uploadedAt).toDateString() === today).length
  
  const filteredImages = images.filter(img => 
    img.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 flex justify-between items-center border border-white/20">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex gap-4">
            <a href="/" className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
              Upload Page
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/50"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <input
            type="text"
            placeholder="Search by reference ID or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl font-bold text-blue-400">{images.length}</div>
            <div className="text-white/70 mt-2">Total Images</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl font-bold text-green-400">{todayUploads}</div>
            <div className="text-white/70 mt-2">Today's Uploads</div>
          </div>
        </div>

        {filteredImages.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-white/70 text-xl">{searchQuery ? 'No images match your search' : 'No images uploaded yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/30 transition-all">
                <div
                  className="relative h-48 cursor-pointer"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <Image
                    src={image.url}
                    alt={image.originalName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="bg-purple-500/20 rounded-lg px-3 py-1 mb-2 inline-block">
                    <span className="text-purple-300 text-sm font-mono">{image.referenceId}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2 truncate">{image.originalName}</h3>
                  <p className="text-white/60 text-sm mb-1">{formatDate(image.uploadedAt)}</p>
                  <p className="text-white/60 text-sm mb-4">{formatSize(image.size)}</p>
                  
                  <div className="bg-black/30 rounded-lg p-3 mb-2 flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/img/${image.referenceId}`}
                      readOnly
                      className="flex-1 bg-transparent text-green-400 text-sm outline-none"
                    />
                    <button
                      onClick={() => copyLink(`${window.location.origin}/img/${image.referenceId}`)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-all"
                    >
                      Copy
                    </button>
                  </div>

                  <button
                    onClick={() => deleteImage(image.id)}
                    className="w-full py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <Image
            src={selectedImage}
            alt="Full size"
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}
