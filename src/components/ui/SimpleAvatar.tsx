import { useState } from 'react'

interface SimpleAvatarProps {
  src?: string
  alt?: string
  initials?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SimpleAvatar({
  src,
  alt = '',
  initials,
  className = '',
  size = 'md',
}: SimpleAvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Get initials from name if not provided
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getColor = (text: string) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-violet-500',
      'bg-fuchsia-500',
      'bg-rose-500',
    ]

    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Determine size class
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size]

  // Get display text (initials or first letter of alt)
  const displayText = initials || (alt ? getInitials(alt) : '')

  // Get background color
  const bgColor = getColor(displayText || alt || 'User')

  const handleError = () => {
    setImgError(true)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-full ${sizeClass} ${className}`}
    >
      {src && !imgError ? (
        <img
          src={src || '/placeholder.svg'}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleError}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${bgColor} text-white font-medium`}
        >
          {displayText}
        </div>
      )}
    </div>
  )
}
