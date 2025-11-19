import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, Video } from 'lucide-react'
import { uploadApi } from '@/services/api'

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void
  currentVideo?: string
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadSuccess,
  currentVideo,
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentVideo || null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulando progresso (em produção, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await uploadApi.uploadVideo(file)
      clearInterval(progressInterval)
      setUploadProgress(100)

      const url = response.data.url
      setUploadedUrl(url)
      onUploadSuccess(url)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha no upload')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const clearVideo = () => {
    setUploadedUrl(null)
    setError(null)
  }

  if (uploadedUrl) {
    return (
      <div className="relative">
        <video
          src={`http://localhost:8000${uploadedUrl}`}
          controls
          className="w-full h-auto max-h-96 object-contain rounded-lg shadow bg-gray-100"
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
        <button
          onClick={clearVideo}
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
        <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {uploading ? (
          <div>
            <p className="text-gray-600 mb-3">Enviando vídeo...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
          </div>
        ) : isDragActive ? (
          <p className="text-primary-600 font-medium">Solte o vídeo aqui</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Arraste e solte um vídeo aqui, ou clique para selecionar
            </p>
            <p className="text-sm text-gray-400">
              Formatos suportados: MP4, WebM, MOV, AVI (máx 100MB)
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

export default VideoUpload
