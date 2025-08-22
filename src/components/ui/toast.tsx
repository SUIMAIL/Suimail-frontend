import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import { X as XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { generateRandomId } from '@/utils/helpers'

interface ToastNotification {
  id: string
  message: string
  description?: string
  type: 'success' | 'error'
}

type ToastContextProps = {
  notification: ToastNotification | null
  setNotification: (notification: Omit<ToastNotification, 'id'> | null) => void
}

const ToastContext = createContext<ToastContextProps | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<ToastNotification | null>(
    null
  )

  const removeNotification = () => {
    setNotification(null)
  }

  const handleSetNotification = useCallback(
    (notification: Omit<ToastNotification, 'id'> | null) => {
      if (!notification) {
        setNotification(null)
        return
      }

      setNotification({
        id: generateRandomId(),
        ...notification,
      })
    },
    [setNotification]
  )

  const contextValue = useMemo(
    () => ({ notification, setNotification: handleSetNotification }),
    [notification, handleSetNotification]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {notification && (
          <Notification
            id={notification.id}
            message={notification.message}
            description={notification.description}
            type={notification.type}
            removeNotif={removeNotification}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }

  return context
}

const Notification = ({
  id,
  message,
  description,
  type,
  removeNotif,
}: ToastNotification & { removeNotif: () => void }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotif()
    }, 3000)

    return () => clearTimeout(timeoutRef)
  }, [removeNotif])

  return (
    <motion.div
      id={id}
      layout
      initial={{ y: 15, scale: 0.9, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ y: -25, scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring' }}
      className={cn(
        'p-4 w-80 flex items-center justify-between rounded-lg gap-2 text-sm font-medium shadow-lg text-white fixed z-[1000] top-4 right-4',
        type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="font-sans">{message}</span>
        {description && (
          <span className="font-sans text-[11px]">{description}</span>
        )}
      </div>
      <button className="cursor-pointer" onClick={removeNotif}>
        <XIcon className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
