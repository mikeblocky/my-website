'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/primitives/button'
import Text from '@/components/ui/text/text'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'

export function PetRoom() {
  const [isSending, setIsSending] = useState(false)
  const [lastGif, setLastGif] = useState<string | null>(null)
  const [giftCount, setGiftCount] = useState(0)

  const sendGift = async () => {
    setIsSending(true)
    try {
      const res = await fetch('/api/annoy', { method: 'POST' })
      const data = await res.json()
      if (data.gif) {
        setLastGif(data.gif)
        if (typeof data.total === 'number') {
          setGiftCount(data.total)
        }
      }
    } catch (err) {
      console.error('Failed to send gift:', err)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    async function fetchLastGif() {
      try {
        const res = await fetch('/api/annoy')
        const data = await res.json()
        if (data.gif) {
          setLastGif(data.gif)
        }
        if (typeof data.total === 'number') {
          setGiftCount(data.total)
        }
      } catch (err) {
        console.error('Failed to fetch last gift:', err)
      }
    }
    fetchLastGif()
  }, [])

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Button 
          onClick={sendGift} 
          disabled={isSending}
          variant="outline"
          className={cn(monoFont.className, "h-auto rounded-md px-6 py-2 text-xs font-semibold transition-transform active:scale-95")}
        >
          {isSending ? 'sending...' : 'send'}
        </Button>

        {giftCount > 0 && (
          <Text variant="muted" size="xs" className={cn(monoFont.className, "text-[10px]")}>
            {giftCount} {giftCount === 1 ? 'gift' : 'gifts'} shared in total
          </Text>
        )}
      </div>

      <AnimatePresence mode="wait">
        {lastGif && (
          <motion.div
            key={lastGif}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-px w-8 bg-slate-200/60 dark:bg-slate-800/60" />
              <Text size="xs" className={cn(monoFont.className, "text-[10px] tracking-wider pride-text")}>recently shared</Text>
              <div className="h-px w-8 bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
            
            <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 shadow-none">
              <Image
                src={lastGif}
                alt="Pet gift"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 24rem"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

