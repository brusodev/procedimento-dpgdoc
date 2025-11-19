import React, { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { ArrowRight, Square, MessageSquare, Highlighter, Trash2, Save } from 'lucide-react'
import { Annotation } from '@/services/api'

interface ImageAnnotatorProps {
  imageUrl: string
  annotations?: Annotation[]
  onAnnotationsChange?: (annotations: Annotation[]) => void
}

type ToolType = 'arrow' | 'box' | 'tooltip' | 'highlight' | 'select'

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUrl,
  annotations = [],
  onAnnotationsChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Get container width - use parent width or default to larger size
    const containerWidth = Math.min(canvasRef.current.parentElement?.clientWidth || 1400, 1400)
    const maxHeight = 900 // Maximum height for the canvas

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: maxHeight,
      backgroundColor: '#f3f4f6',
    })

    fabricCanvasRef.current = canvas

    // Load background image
    fabric.Image.fromURL(imageUrl, (img) => {
      // Calculate scale to fit image in canvas while maintaining aspect ratio
      const scaleX = containerWidth / img.width!
      const scaleY = maxHeight / img.height!

      // Use the smaller scale to fit, but ensure minimum size
      let scale = Math.min(scaleX, scaleY)

      // If image is too small, scale it up to at least 800px width or 600px height
      const minWidth = 800
      const minHeight = 600
      if (img.width! * scale < minWidth && img.height! * scale < minHeight) {
        const scaleToMinWidth = minWidth / img.width!
        const scaleToMinHeight = minHeight / img.height!
        scale = Math.min(scaleToMinWidth, scaleToMinHeight)
      }

      // Adjust canvas size to match scaled image
      const canvasWidth = img.width! * scale
      const canvasHeight = img.height! * scale

      canvas.setWidth(canvasWidth)
      canvas.setHeight(canvasHeight)

      img.scale(scale)
      img.selectable = false
      img.set({ left: 0, top: 0 })
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
    })

    // Load existing annotations
    loadAnnotations(canvas, annotations)

    // Handle selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected![0])
    })

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected![0])
    })

    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    return () => {
      canvas.dispose()
    }
  }, [imageUrl])

  const loadAnnotations = (canvas: fabric.Canvas, anns: Annotation[]) => {
    anns.forEach((ann) => {
      let obj: fabric.Object | null = null

      switch (ann.type) {
        case 'arrow':
          obj = createArrow(ann.coordinates)
          break
        case 'box':
          obj = createBox(ann.coordinates)
          break
        case 'tooltip':
          obj = createTooltip(ann.coordinates, ann.text || '')
          break
        case 'highlight':
          obj = createHighlight(ann.coordinates)
          break
      }

      if (obj) {
        obj.set('annotationId', ann.id)
        canvas.add(obj)
      }
    })
  }

  const createArrow = (coords: any) => {
    const points = coords.points || [
      { x: coords.x, y: coords.y },
      { x: coords.x + 100, y: coords.y + 100 },
    ]

    const line = new fabric.Line(
      [points[0].x, points[0].y, points[1].x, points[1].y],
      {
        stroke: '#ef4444',
        strokeWidth: 3,
        selectable: true,
      }
    )

    // Add arrowhead
    const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x)
    const headlen = 15

    const arrowHead = new fabric.Triangle({
      left: points[1].x,
      top: points[1].y,
      angle: (angle * 180) / Math.PI + 90,
      width: headlen,
      height: headlen,
      fill: '#ef4444',
      selectable: false,
    })

    const group = new fabric.Group([line, arrowHead], {
      selectable: true,
    })

    // Add custom property to identify type
    group.set('annotationType', 'arrow')

    return group
  }

  const createBox = (coords: any) => {
    const rect = new fabric.Rect({
      left: coords.x,
      top: coords.y,
      width: coords.width || 100,
      height: coords.height || 100,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 3,
      rx: 5,
      ry: 5,
    })

    // Add custom property to identify type
    rect.set('annotationType', 'box')

    return rect
  }

  const createTooltip = (coords: any, text: string) => {
    const textObj = new fabric.Text(text, {
      fontSize: 16,
      fill: '#1f2937',
    })

    const rect = new fabric.Rect({
      width: textObj.width! + 20,
      height: textObj.height! + 20,
      fill: '#fbbf24',
      rx: 5,
      ry: 5,
    })

    const group = new fabric.Group([rect, textObj], {
      left: coords.x,
      top: coords.y,
    })

    // Add custom property to identify type and store text
    group.set('annotationType', 'tooltip')
    group.set('tooltipText', text)

    return group
  }

  const createHighlight = (coords: any) => {
    const rect = new fabric.Rect({
      left: coords.x,
      top: coords.y,
      width: coords.width || 150,
      height: coords.height || 50,
      fill: 'rgba(251, 191, 36, 0.3)',
      stroke: '#fbbf24',
      strokeWidth: 2,
    })

    // Add custom property to identify type
    rect.set('annotationType', 'highlight')

    return rect
  }

  const handleCanvasClick = (e: fabric.IEvent) => {
    if (!fabricCanvasRef.current || currentTool === 'select') return

    const pointer = fabricCanvasRef.current.getPointer(e.e)
    let obj: fabric.Object | null = null

    switch (currentTool) {
      case 'arrow':
        obj = createArrow({ x: pointer.x, y: pointer.y })
        break
      case 'box':
        obj = createBox({ x: pointer.x, y: pointer.y })
        break
      case 'tooltip':
        const text = prompt('Enter tooltip text:') || 'Tooltip'
        obj = createTooltip({ x: pointer.x, y: pointer.y }, text)
        break
      case 'highlight':
        obj = createHighlight({ x: pointer.x, y: pointer.y })
        break
    }

    if (obj) {
      fabricCanvasRef.current.add(obj)
      setCurrentTool('select')
    }
  }

  useEffect(() => {
    if (!fabricCanvasRef.current) return

    if (currentTool === 'select') {
      fabricCanvasRef.current.selection = true
      fabricCanvasRef.current.off('mouse:down')
    } else {
      fabricCanvasRef.current.selection = false
      fabricCanvasRef.current.on('mouse:down', handleCanvasClick)
    }
  }, [currentTool])

  const deleteSelected = () => {
    if (!fabricCanvasRef.current || !selectedObject) return
    fabricCanvasRef.current.remove(selectedObject)
    setSelectedObject(null)
  }

  const saveAnnotations = () => {
    if (!fabricCanvasRef.current || !onAnnotationsChange) return

    const objects = fabricCanvasRef.current.getObjects()
    const newAnnotations: Annotation[] = objects
      .filter((obj) => obj.selectable)
      .map((obj, index) => {
        // Get the custom annotation type we set when creating the object
        const annotationType = (obj as any).annotationType || 'box'
        const tooltipText = (obj as any).tooltipText

        const annotation: Annotation = {
          type: annotationType as any,
          coordinates: {
            x: obj.left || 0,
            y: obj.top || 0,
            width: obj.width,
            height: obj.height,
          },
          animation: 'fadeIn',
          delay: index * 200,
        }

        // Add text for tooltip annotations
        if (annotationType === 'tooltip' && tooltipText) {
          annotation.text = tooltipText
        }

        return annotation
      })

    onAnnotationsChange(newAnnotations)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-white rounded-lg shadow">
        <button
          onClick={() => setCurrentTool('select')}
          className={`p-2 rounded ${
            currentTool === 'select' ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}
          title="Select"
        >
          Select
        </button>
        <button
          onClick={() => setCurrentTool('arrow')}
          className={`p-2 rounded ${
            currentTool === 'arrow' ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}
          title="Arrow"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentTool('box')}
          className={`p-2 rounded ${
            currentTool === 'box' ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}
          title="Box"
        >
          <Square className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentTool('tooltip')}
          className={`p-2 rounded ${
            currentTool === 'tooltip' ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}
          title="Tooltip"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentTool('highlight')}
          className={`p-2 rounded ${
            currentTool === 'highlight' ? 'bg-primary-500 text-white' : 'bg-gray-200'
          }`}
          title="Highlight"
        >
          <Highlighter className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        <button
          onClick={deleteSelected}
          disabled={!selectedObject}
          className="p-2 rounded bg-red-500 text-white disabled:bg-gray-300"
          title="Delete Selected"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <button
          onClick={saveAnnotations}
          className="p-2 px-4 rounded bg-green-500 text-white flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Annotations
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow overflow-auto max-w-full">
        <div className="inline-block">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  )
}

export default ImageAnnotator
