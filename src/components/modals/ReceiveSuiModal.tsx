import { ArrowDownLeft, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import QRCode from 'qrcode'
import { useState, useEffect } from 'react'
import { useToastContext } from '../ui/toast'

interface ReceiveSuiModalProps {
  currentAddress: string
}

export function ReceiveSuiModal({ currentAddress }: ReceiveSuiModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const { setNotification } = useToastContext()

  useEffect(() => {
    QRCode.toDataURL(currentAddress).then(_qrCode => {
      setQrCode(_qrCode)
    })
  }, [currentAddress])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentAddress)
    setNotification({
      message: 'Address copied to clipboard',
      type: 'success',
    })
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
      setIsOpen(false)
    }, 2000)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500 hover:shadow-emerald-600 hover:shadow-md duration-300 transition-all hover:scale-105"
        >
          <ArrowDownLeft />
          <p className="text-white">Receive</p>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Receive SUI
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Receive SUI to your wallet
          </AlertDialogDescription>

          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2.5 right-5 border-none rounded-full shadow-none"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDialogCancel>
        </AlertDialogHeader>

        <div className="flex flex-col items-center justify-center">
          {qrCode && (
            <div className="max-w-full p-4 bg-slate-200 rounded-lg shadow-md flex flex-col items-center justify-center">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              <p className="text-sm text-gray-500 mt-2 truncate w-48">
                {currentAddress}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 w-full flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={handleCopyAddress}
            className="hover:bg-blue-700"
          >
            {isCopied ? 'Copied' : 'Copy Address'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
