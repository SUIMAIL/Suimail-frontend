import { cn } from '@/lib/utils'

interface DefaultPagePaddingProps {
  children: React.ReactNode
  className?: string
}

const DefaultPagePadding = ({
  children,
  className,
}: DefaultPagePaddingProps) => {
  return (
    <div className={cn('relative pt-20 min-h-screen', className)}>
      {children}
    </div>
  )
}

export default DefaultPagePadding
