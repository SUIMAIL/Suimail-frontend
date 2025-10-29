import { useState, useEffect } from 'react'
import { Loader2, Mail } from 'lucide-react'

export function Loading({ message }: { message?: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + Math.random() * 15
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="w-full flex flex-col items-center justify-center h-full min-h-screen p-6 surface-base">
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute animate-ping opacity-20 duration-1000">
            <Mail className="h-16 w-16 text-blue-base/40" />
          </div>

          <Mail className="h-16 w-16 text-blue-base relative z-10" />

          <div className="absolute inset-0 -m-4">
            <Loader2 className="h-24 w-24 text-blue-base/30 animate-spin-slow" />
          </div>
        </div>
      </div>

      <div className="w-64 h-1.5 surface-dark rounded-full overflow-hidden mb-4 elevation-1">
        <div
          className="h-full bg-blue-base rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          {progress < 30 && 'Connecting to Sui network...'}
          {progress >= 30 && progress < 70 && 'Loading your data...'}
          {progress >= 70 && 'Almost ready...'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {message || 'Loading your inbox...'}
        </p>
      </div>

      <div className="absolute bottom-8 flex gap-1.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-base/30 animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              opacity: Math.max(
                0.2,
                Math.min(progress / 100, 1) - (5 - i) * 0.15
              ),
            }}
          />
        ))}
      </div>
    </div>
  )
}
