'use client'

import type React from 'react'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Mail, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SuinsClient } from '@mysten/suins'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'

const rpcUrl = getFullnodeUrl('testnet')
const client = new SuiClient({ url: rpcUrl })
const suinsClient = new SuinsClient({ client, network: 'testnet' })

interface FormSectionProps {
  handleSubmit: ({ name }: { name: string }) => void
  isProcessing: boolean
  copyToClipboard: (name: string) => void
}

export function FormSection({
  handleSubmit,
  isProcessing,
  copyToClipboard,
}: FormSectionProps) {
  const [name, setName] = useState('')
  const [availability, setAvailability] = useState<
    '' | 'checking' | 'available' | 'taken'
  >('')

  const sampleNames = ['aliceweb3', 'blockchain.dev', 'crypto.trader']

  const fullName = `${name}`

  const checkAvailability = useCallback(async () => {
    if (!name) return setAvailability('')
    setAvailability('checking')
    try {
      const record = await suinsClient.getNameRecord(fullName)
      setAvailability(record ? 'taken' : 'available')
    } catch {
      setAvailability('available')
    }
  }, [name, fullName])

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkAvailability()
    }, 500)
    return () => clearTimeout(timeout)
  }, [name, checkAvailability])

  const isValid = useMemo(() => {
    return name.length > 0 && availability === 'available'
  }, [name, availability])

  const selectSampleName = (sampleName: string) => {
    setName(sampleName)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (availability === 'available') {
      handleSubmit({ name })
    }
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
              <Label htmlFor="name">Subname</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. aliceweb3"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pr-10"
                  required
                />
                {name && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    onClick={() => setName('')}
                    className="absolute right-3 top-[30%] -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              {availability === 'checking' && (
                <p className="text-sm text-gray-500 mt-1">
                  Checking availability...
                </p>
              )}
              {availability === 'available' && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ {fullName} is available
                </p>
              )}
              {availability === 'taken' && (
                <p className="text-sm text-red-600 mt-1">
                  ❌ {fullName} is already taken
                </p>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full"
            >
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isProcessing || !isValid}
                style={{
                  background: 'linear-gradient(to bottom, #006bf9, #00c1fa)',
                }}
              >
                {isProcessing ? (
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
                {isProcessing ? 'Processing...' : 'Register'}
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
                Or choose a sample name
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {sampleNames.map((sampleName, index) => (
              <motion.div
                key={sampleName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{
                  scale: 1.01,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                }}
                className="flex items-center justify-between rounded-md border p-3 cursor-pointer"
                onClick={() => selectSampleName(sampleName)}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={cn(
                      'text-sm',
                      name === sampleName && 'font-medium text-primary'
                    )}
                  >
                    {sampleName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {name === sampleName && (
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
                      copyToClipboard(sampleName)
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
