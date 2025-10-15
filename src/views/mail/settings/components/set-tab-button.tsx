import { cn } from '@/lib/utils'

interface SetTabButtonProps {
  label: string
  onClick: () => void
  isActive: boolean
}

export function SetTabButton({ label, onClick, isActive }: SetTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center px-5 py-3 cursor-pointer transition-all duration-200 text-sm touch-target rounded-lg',
        isActive
          ? 'bg-blue-base/10 text-blue-base font-semibold border-l-2 border-blue-base'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium'
      )}
    >
      {label}
    </button>
  )
}
