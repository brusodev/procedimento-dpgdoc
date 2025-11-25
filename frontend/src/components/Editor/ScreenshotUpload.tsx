import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle } from 'lucide-react'
import { uploadApi } from '@/services/api'

interface ScreenshotUploadProps {
  onUploadSuccess: (url: string) => void
  currentImage?: string
  onDelete?: () => void
  tutorialTitle?: string
  stepOrder?: number
}

const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
  onUploadSuccess,
  currentImage,
  onDelete,
  tutorialTitle,
  stepOrder,
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage || null)
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sync uploadedUrl with currentImage prop when it changes
  useEffect(() => {
    setUploadedUrl(currentImage || null)
  }, [currentImage])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)

    try {
      const response = await uploadApi.uploadScreenshot(file, tutorialTitle, stepOrder)
      const url = response.data.url
      const publicId = response.data.public_id
      setUploadedUrl(url)
      setUploadedPublicId(publicId)
      onUploadSuccess(url)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha no upload')
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess, tutorialTitle, stepOrder])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const clearImage = async () => {
    // Confirmar antes de deletar
    const confirmed = window.confirm('Tem certeza que deseja remover esta imagem? Ela será deletada permanentemente do Cloudinary.')

    if (!confirmed) {
      return
    }

    // Extract public_id from URL if we don't have it stored
    let publicIdToDelete = uploadedPublicId

    if (!publicIdToDelete && uploadedUrl) {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/public_id.ext
      const match = uploadedUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
      if (match) {
        publicIdToDelete = match[1]
      }
    }

    // Delete from Cloudinary if we have a public_id
    if (publicIdToDelete) {
      try {
        await uploadApi.deleteScreenshot(publicIdToDelete)
        console.log('Screenshot deleted from Cloudinary:', publicIdToDelete)
      } catch (err) {
        console.error('Failed to delete screenshot from Cloudinary:', err)
        alert('Erro ao deletar imagem do Cloudinary. Verifique o console.')
      }
    }

    setUploadedUrl(null)
    setUploadedPublicId(null)
    setError(null)

    if (onDelete) {
      onDelete()
    }
  }

  if (uploadedUrl) {
    return (
      <div className="relative">
        <img
          src={uploadedUrl}
          alt="Screenshot"
          className="w-full h-auto max-h-96 object-contain rounded-lg shadow bg-gray-100"
        />
        <button
          onClick={clearImage}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute top-2 left-2 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Enviado</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {uploading ? (
          <p className="text-gray-600">Enviando...</p>
        ) : isDragActive ? (
          <p className="text-primary-600 font-medium">Solte a captura de tela aqui</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Arraste e solte uma captura de tela aqui, ou clique para selecionar
            </p>
            <p className="text-sm text-gray-400">
              Formatos suportados: PNG, JPG, GIF, WebP (máx 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

export default ScreenshotUpload
