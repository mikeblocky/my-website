'use client'

import { useEffect, useState, useTransition } from 'react'
import { Bell } from 'lucide-react'
import { formatBoardDate as formatDate, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import { SketchbookDrawing } from '../_types/sketchbook'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SketchbookCanvas } from './SketchbookCanvas'
import { SketchbookCard } from './SketchbookCard'

export function SketchbookBoard({
  isAdminMode: parentIsAdminMode,
  setIsAdminMode: parentSetIsAdminMode,
  passcode: parentPasscode,
  setPasscode: parentSetPasscode
}: {
  isAdminMode?: boolean
  setIsAdminMode?: (v: boolean) => void
  passcode?: string
  setPasscode?: (v: string) => void
}) {
  const [drawings, setDrawings] = useState<SketchbookDrawing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Control passcode and admin state
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)
  const [passcode, setPasscode] = useControlledState(parentPasscode, parentSetPasscode, '')
  const [isAdminMode, setIsAdminMode] = useControlledState(parentIsAdminMode, parentSetIsAdminMode, false)

  // Like track local storage list
  const [likedList, setLikedList] = useState<string[]>([])

  const { message: notification, showMessage: showNotification } = useTimedMessage()
  const { feedback: buttonFeedback, showFeedback: showButtonFeedback } = useButtonFeedback()
  const { isCooldownActive, cooldownLabel, applyCooldown } = useBoardCooldown()

  // Initialize and load drawings
  useEffect(() => {
    // Load local storage liked list
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mikeblocky:liked-drawings')
      if (stored) {
        try {
          setLikedList(JSON.parse(stored))
        } catch (_) {}
      }
    }

    async function loadData() {
      try {
        const res = await fetch('/api/sketchbook')
        if (res.ok) {
          const payload = await res.json()
          if (Array.isArray(payload.drawings)) {
            setDrawings(payload.drawings)
          }
          applyCooldown(payload.cooldown)
        }
      } catch (err) {
        console.error('Failed loading sketchbook drawings', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [applyCooldown])

  // Submit Masterpiece Drawing
  const handleSubmit = async (payload: { author: string; body: string; imageUrl: string }) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const response = await fetch('/api/sketchbook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              author: payload.author,
              body: payload.body || undefined,
              imageUrl: payload.imageUrl
            })
          })

          const result = await response.json()
          applyCooldown(result.cooldown)

          if (!response.ok) {
            throw new Error(result.error || 'Failed to submit artwork.')
          }

          setDrawings(prev => [result.drawing, ...prev])
          showNotification('Drawing published successfully!')
          resolve()
        } catch (err: any) {
          reject(err)
        }
      })
    })
  }

  // Add Like to a drawing
  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger zoom modal
    if (likedList.includes(id)) return

    // Update local state instantly (Optimistic UI)
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, likes: (d.likes || 0) + 1 } : d))
    const updatedLikedList = [...likedList, id]
    setLikedList(updatedLikedList)
    localStorage.setItem('mikeblocky:liked-drawings', JSON.stringify(updatedLikedList))
    showButtonFeedback(`like-${id}`, 'Liked!')

    try {
      await fetch('/api/sketchbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'like' })
      })
    } catch (err) {
      console.error('Failed to register like on server', err)
    }
  }

  // Admin Reply Drawing
  const handleReplySubmit = async (id: string, replyBody: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const response = await fetch('/api/sketchbook', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              reply: replyBody,
              passcode
            })
          })

          if (!response.ok) throw new Error('Reply failed')

          const result = await response.json()
          setDrawings(prev => prev.map(d => d.id === id ? result.drawing : d))
          showNotification('Reply posted successfully!')
          resolve()
        } catch (err) {
          showNotification('Could not post reply.')
          reject(err)
        }
      })
    })
  }

  // Admin Delete Drawing
  const handleDeleteDrawing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this drawing?')) return

    try {
      const response = await fetch(`/api/sketchbook?id=${id}&passcode=${encodeURIComponent(passcode)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDrawings(prev => prev.filter(d => d.id !== id))
        showNotification('Drawing deleted.')
      } else {
        showNotification('Failed to delete drawing.')
      }
    } catch (err) {
      showNotification('Error deleting drawing.')
    }
  }

  // Share Drawing Clipboard copy
  const handleShareDrawing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/sketchbook/${id}`
    
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Sketchbook drawing',
          text: 'Collaborative sketchbook drawing on mikeblocky.com',
          url
        })
      } else {
        await navigator.clipboard.writeText(url)
      }
      showButtonFeedback(`share-${id}`, 'Copied!')
      showNotification('Link copied to clipboard!')
    } catch (err) {
      console.error('Share failed', err)
      showButtonFeedback(`share-${id}`, 'Failed')
    }
  }

  // Snap and copy drawing card to clipboard
  const handleSnapDrawing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { snapSketchbookCard } = await import('./sketchbook-snap')
      const result = await snapSketchbookCard(id)
      if (result === 'snapped') {
        showButtonFeedback(`snap-${id}`, 'Snapped!')
        showNotification('Artwork card copied to clipboard!')
      } else if (result === 'saved') {
        showButtonFeedback(`snap-${id}`, 'Saved!')
        showNotification('Artwork card saved as image!')
      }
    } catch (err) {
      console.error('Snap failed', err)
      showButtonFeedback(`snap-${id}`, 'Failed')
    }
  }

  // Download Drawing file trigger
  const handleDownloadDrawing = (imageUrl: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `mikeblocky-sketchbook-${id}.png`
    a.click()
  }

  return (
    <StackVertical gap="lg" className="w-full">
      {/* Dynamic Notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl flex items-center gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5">
          <Bell size={15} />
          {notification}
        </div>
      )}

      <SketchbookCanvas
        onSubmit={handleSubmit}
        isPending={isPending}
        isCooldownActive={isCooldownActive}
        cooldownLabel={cooldownLabel}
        showNotification={showNotification}
      />

      {/* Gallery */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-slate-200/60 pb-4 dark:border-slate-800/60">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg leading-tight">
                Artworks
              </TextHeading>

              <AdminLockToggle
                isAdminMode={isAdminMode}
                setIsAdminMode={setIsAdminMode}
                passcode={passcode}
                setPasscode={setPasscode}
                showPasscodeInput={showPasscodeInput}
                setShowPasscodeInput={setShowPasscodeInput}
                onEnabled={() => showNotification('Admin Mode active. Moderation unlocked!')}
                accent="violet"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing ? (
              <Text variant="muted" size="xs">Refreshing...</Text>
            ) : null}
            <Text variant="muted" size="sm" className="whitespace-nowrap">
              {drawings.length} artworks collected
            </Text>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading artworks...
          </div>
        ) : drawings.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Text variant="muted" size="sm">No drawings found. Be the first to draw on the canvas!</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {drawings.map((drawing) => (
              <SketchbookCard
                key={drawing.id}
                drawing={drawing}
                isAdminMode={isAdminMode}
                likedList={likedList}
                passcode={passcode}
                isPending={isPending}
                buttonFeedback={buttonFeedback}
                onLike={handleLike}
                onShare={handleShareDrawing}
                onSnap={handleSnapDrawing}
                onDownload={handleDownloadDrawing}
                onReplySubmit={handleReplySubmit}
                onDeleteDrawing={handleDeleteDrawing}
              />
            ))}
          </div>
        )}
      </div>
    </StackVertical>
  )
}
