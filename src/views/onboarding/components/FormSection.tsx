import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Copy, Mail, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { isValidSuimailAddress } from '@/utils/helpers'

interface FormSectionProps {
  handleSubmit: ({ suimailNS }: { suimailNS: string }) => void
  isSettingUpSuimailNs: boolean
  copyToClipboard: (suimailNS: string) => void
}

export function FormSection({
  handleSubmit,
  isSettingUpSuimailNs,
  copyToClipboard,
}: FormSectionProps) {
  const [suimailNS, setSuimailNS] = useState('')

  const sampleSuimailNSs = [
    'aliceweb3@suimailapp',
    'blockchain.dev@suimailapp',
    'crypto.trader@suimailapp',
  ]

  const isValid = useMemo(() => {
    return isValidSuimailAddress(suimailNS)
  }, [suimailNS])

  const selectSampleSuimailNS = (sampleSuimailNS: string) => {
    setSuimailNS(sampleSuimailNS)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit({ suimailNS })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-card rounded-lg border shadow-sm p-6"
      >
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">SuiMail NS</Label>
              <div className="relative">
                <Input
                  id="suimailns"
                  type="text"
                  placeholder="e.g. leadzid@suimailapp"
                  value={suimailNS}
                  onChange={e => setSuimailNS(e.target.value)}
                  className="pr-10"
                  required
                />
                {suimailNS && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    onClick={() => setSuimailNS('')}
                    className="absolute right-3 top-[30%] -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full"
            >
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isSettingUpSuimailNs || !isValid}
              >
                {isSettingUpSuimailNs ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}
                    className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : null}
                {isSettingUpSuimailNs
                  ? 'Setting Up Your Account...'
                  : 'Continue'}
              </Button>
            </motion.div>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or choose a sample address
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {sampleSuimailNSs.map((sampleSuimailNS, index) => (
              <motion.div
                key={sampleSuimailNS}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{
                  scale: 1.01,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                }}
                className="flex items-center justify-between rounded-md border p-3 cursor-pointer"
                onClick={() => selectSampleSuimailNS(sampleSuimailNS)}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={cn(
                      'text-sm',
                      suimailNS === sampleSuimailNS &&
                        'font-medium text-primary'
                    )}
                  >
                    {sampleSuimailNS}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {suimailNS === sampleSuimailNS && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-primary"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation()
                      copyToClipboard(sampleSuimailNS)
                    }}
                    className="h-8 w-8"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}
