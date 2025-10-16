import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, X, Move } from 'lucide-react'

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight / 2 - 32,
  }) // right-center default
  const [showAttention, setShowAttention] = useState(false)
  const [hasShownAttention, setHasShownAttention] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Set initial position to right-center on mount
  useEffect(() => {
    const setInitialPosition = () => {
      const centerY = window.innerHeight / 2 - 32 // Subtract half button height
      const rightX = window.innerWidth - 80 // 16px margin + 64px button width
      setPosition({ x: rightX, y: centerY }) // Right center
    }

    setInitialPosition()

    // Recalculate center position on window resize
    const handleResize = () => {
      const centerY = window.innerHeight / 2 - 32
      const rightX = window.innerWidth - 80
      setPosition({ x: rightX, y: centerY })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Show attention animation after component mounts
  useEffect(() => {
    if (!hasShownAttention) {
      const timer = setTimeout(() => {
        setShowAttention(true)
        setHasShownAttention(true)

        // Hide attention after 4 seconds
        setTimeout(() => {
          setShowAttention(false)
        }, 4000)
      }, 2000) // Show after 2 seconds of page load

      return () => clearTimeout(timer)
    }
  }, [hasShownAttention])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  // Drag functionality - wrapped in useCallback
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || isOpen) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const buttonSize = isMobile ? 56 : 64 // Approximate button size

      let newX = e.clientX - dragOffset.current.x
      let newY = e.clientY - dragOffset.current.y

      // Keep button within viewport bounds
      newX = Math.max(16, Math.min(newX, viewportWidth - buttonSize - 16))
      newY = Math.max(16, Math.min(newY, viewportHeight - buttonSize - 16))

      setPosition({ x: newX, y: newY })
    },
    [isDragging, isOpen, isMobile]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || isOpen) return

      const touch = e.touches[0]
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const buttonSize = isMobile ? 56 : 64

      let newX = touch.clientX - dragOffset.current.x
      let newY = touch.clientY - dragOffset.current.y

      // Keep button within viewport bounds
      newX = Math.max(16, Math.min(newX, viewportWidth - buttonSize - 16))
      newY = Math.max(16, Math.min(newY, viewportHeight - buttonSize - 16))

      setPosition({ x: newX, y: newY })
      e.preventDefault()
    },
    [isDragging, isOpen, isMobile]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen || !buttonRef.current) return

    setIsDragging(true)
    const rect = buttonRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    e.preventDefault()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isOpen || !buttonRef.current) return

    setIsDragging(true)
    const touch = e.touches[0]
    const rect = buttonRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
    e.preventDefault()
  }

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  const handleButtonClick = () => {
    if (!isDragging) {
      setIsOpen(true)
      setShowAttention(false) // Hide attention when clicked
    }
  }

  return (
    <>
      {/* Draggable Feedback Button */}
      <div
        ref={buttonRef}
        className={`fixed z-40 transition-all duration-200 ${
          isDragging
            ? 'cursor-grabbing scale-110'
            : 'cursor-grab hover:scale-110'
        } ${showAttention ? 'animate-bounce' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Attention Bubble */}
        {showAttention && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap animate-pulse">
            <div className="relative">
              Let's hear your feedback! 💭
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
            </div>
          </div>
        )}

        <button
          onClick={handleButtonClick}
          className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-blue-300 ${
            isDragging ? 'cursor-grabbing' : 'cursor-pointer'
          }`}
          aria-label="Send Feedback (Draggable)"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />

          {/* Drag indicator */}
          <div className="absolute -top-1 -right-1 bg-white text-gray-600 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
            <Move className="w-2 h-2" />
          </div>

          {/* Pulse effect when showing attention */}
          {showAttention && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping"></div>
          )}
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full mx-4 max-w-5xl max-h-[95vh] flex flex-col animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Send Feedback
                  </h2>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Help us improve by sharing your thoughts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Close feedback form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Form Container */}
            <div className="flex-1 min-h-0 relative bg-white">
              {/* Loading State */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading feedback form...</p>
                </div>
              </div>

              {/* Google Form Iframe */}
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSf5xwCezwTOGvu8vfLbY55BHsttSUKCD7acrBW5Ap0048koVQ/viewform?embedded=true"
                className="w-full h-full border-0 rounded-b-lg"
                style={{
                  minHeight: isMobile ? '500px' : '600px',
                  height: isMobile ? 'calc(100vh - 200px)' : '600px',
                }}
                title="Feedback Form"
                loading="lazy"
                onLoad={e => {
                  const target = e.target as HTMLIFrameElement
                  const loadingDiv =
                    target.previousElementSibling as HTMLElement
                  if (loadingDiv) {
                    loadingDiv.style.display = 'none'
                  }
                }}
              >
                Loading Feedback Form…
              </iframe>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-10px);
          }
          70% {
            transform: translateY(-5px);
          }
          90% {
            transform: translateY(-2px);
          }
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </>
  )
}
