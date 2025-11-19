import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle } from 'lucide-react'
import { uploadApi } from '@/services/api'

interface ScreenshotUploadProps {
  onUploadSuccess: (url: string) => void
  currentImage?: string
}

const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
  onUploadSuccess,
  currentImage,
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)

    try {
      const response = await uploadApi.uploadScreenshot(file)
      const url = response.data.url
      setUploadedUrl(url)
      onUploadSuccess(url)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha no upload')
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const clearImage = () => {
    setUploadedUrl(null)
    setError(null)
  }

  if (uploadedUrl) {
    return (
      <div className="relative">
        <img
          src={`http://localhost:8000${uploadedUrl}`}
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
