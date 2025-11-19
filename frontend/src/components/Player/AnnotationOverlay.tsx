import React from 'react'
import { motion } from 'framer-motion'
import { Annotation } from '@/services/api'

interface AnnotationOverlayProps {
  annotations: Annotation[]
}

const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({ annotations }) => {
  const getAnimationVariant = (animation: string) => {
    switch (animation) {
      case 'slideIn':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
        }
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
        }
      default: // fadeIn
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
        }
    }
  }

  const renderAnnotation = (annotation: Annotation, index: number) => {
    const variant = getAnimationVariant(annotation.animation || 'fadeIn')
    const delay = (annotation.delay || 0) / 1000

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: annotation.coordinates.x,
      top: annotation.coordinates.y,
    }

    switch (annotation.type) {
      case 'arrow':
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={variant.initial}
            animate={variant.animate}
            transition={{ delay, duration: 0.5 }}
          >
            <svg width="100" height="100" className="overflow-visible">
              <defs>
                <marker
                  id={`arrowhead-${index}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
                </marker>
              </defs>
              <motion.line
                x1="0"
                y1="0"
                x2="80"
                y2="80"
                stroke="#ef4444"
                strokeWidth="3"
                markerEnd={`url(#arrowhead-${index})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.8 }}
              />
            </svg>
          </motion.div>
        )

      case 'box':
        return (
          <motion.div
            key={index}
            style={{
              ...baseStyle,
              width: annotation.coordinates.width,
              height: annotation.coordinates.height,
              border: '3px solid #3b82f6',
              borderRadius: '5px',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
            }}
            initial={variant.initial}
            animate={variant.animate}
            transition={{ delay, duration: 0.5 }}
          />
        )

      case 'tooltip':
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={variant.initial}
            animate={variant.animate}
            transition={{ delay, duration: 0.5 }}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg font-medium"
          >
            {annotation.text}
          </motion.div>
        )

      case 'highlight':
        return (
          <motion.div
            key={index}
            style={{
              ...baseStyle,
              width: annotation.coordinates.width,
              height: annotation.coordinates.height,
              backgroundColor: 'rgba(251, 191, 36, 0.3)',
              border: '2px solid #fbbf24',
            }}
            initial={variant.initial}
            animate={variant.animate}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {annotations.map((annotation, index) => renderAnnotation(annotation, index))}
    </div>
  )
}

export default AnnotationOverlay
