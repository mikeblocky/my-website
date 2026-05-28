'use client'

import { FormEvent, useEffect, useRef, useState, useTransition, useMemo } from 'react'
import { Palette, Share2, Heart, Trash2, MessageSquareReply, Eye, Download, X, CornerDownRight, Bell, Undo2, Redo2, Eraser, Pencil, Trash } from 'lucide-react'
import { sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { formatBoardDate as formatDate, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import { SketchbookDrawing } from '../_types/sketchbook'
import { Button } from '@/components/ui/primitives/button'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'

const MAX_BODY_LENGTH = 300

const PRESETS = [
  { name: 'Obsidian', hex: '#1e293b' },
  { name: 'Pure Snow', hex: '#f8fafc' },
  { name: 'Crimson', hex: '#ef4444' },
  { name: 'Coral', hex: '#f97316' },
  { name: 'Amber', hex: '#eab308' },
  { name: 'Emerald', hex: '#22c55e' },
  { name: 'Ocean', hex: '#3b82f6' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Magenta', hex: '#ec4899' },
]

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Drawing tools state
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [brushColor, setBrushColor] = useState('#1e293b')
  const [brushSize, setBrushSize] = useState(5)
  const [isDrawingTool, setIsDrawingTool] = useState<'pencil' | 'eraser'>('pencil')

  // History stack for Undo / Redo
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })

  // Form State
  const [author, setAuthor] = useState('')
  const [caption, setCaption] = useState('')

  // Control passcode and admin state
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)
  const [passcode, setPasscode] = useControlledState(parentPasscode, parentSetPasscode, '')
  const [isAdminMode, setIsAdminMode] = useControlledState(parentIsAdminMode, parentSetIsAdminMode, false)

  // Admin Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')

  // Like track local storage list
  const [likedList, setLikedList] = useState<string[]>([])

  // Modal zoom
  const [zoomDrawing, setZoomDrawing] = useState<SketchbookDrawing | null>(null)

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

  // Canvas context setups
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  // Coordinate normalizer for mouse / touch
  const getCoordinates = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    } else if (e.clientX !== undefined) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
    return null
  }

  // Clear Canvas and paint background pure white
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state to history
    const dataUrl = canvas.toDataURL()
    historyRef.current = [dataUrl]
    historyIndexRef.current = 0
    setHistoryState({ canUndo: false, canRedo: false })
  }

  useEffect(() => {
    if (canvasRef.current) {
      initCanvas()
    }
  }, [canvasRef])

  // Save drawing state to history stack
  const saveStateToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()

    // Clear forward states if we were in the middle of history
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(dataUrl)

    // Keep history bounds max 40 items
    if (newHistory.length > 40) {
      newHistory.shift()
    }

    historyRef.current = newHistory
    historyIndexRef.current = newHistory.length - 1

    setHistoryState({
      canUndo: historyIndexRef.current > 0,
      canRedo: false
    })
  }

  // Undo / Redo triggers
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.src = historyRef.current[historyIndexRef.current]
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        setHistoryState({
          canUndo: historyIndexRef.current > 0,
          canRedo: historyIndexRef.current < historyRef.current.length - 1
        })
      }
    }
  }

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.src = historyRef.current[historyIndexRef.current]
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        setHistoryState({
          canUndo: historyIndexRef.current > 0,
          canRedo: historyIndexRef.current < historyRef.current.length - 1
        })
      }
    }
  }

  // Drawing event handlers
  const startDrawing = (e: any) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const coords = getCoordinates(e, canvas)
    if (!coords) return

    isDrawingRef.current = true
    lastPosRef.current = coords

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    
    // Draw a single dot on click
    ctx.lineTo(coords.x, coords.y)
    ctx.strokeStyle = isDrawingTool === 'eraser' ? '#ffffff' : brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const draw = (e: any) => {
    if (!isDrawingRef.current) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return
    const coords = getCoordinates(e, canvas)
    if (!coords) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(coords.x, coords.y)
    ctx.strokeStyle = isDrawingTool === 'eraser' ? '#ffffff' : brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    lastPosRef.current = coords
  }

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false
      saveStateToHistory()
    }
  }

  // Submit Masterpiece Drawing
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isCooldownActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to a Base64 data URL
    const imageUrl = canvas.toDataURL('image/png')

    // Basic anti-spam verify (if canvas is entirely white, don't submit)
    // We could check if history is just the initial state
    if (historyRef.current.length <= 1) {
      setErrorMessage("Please draw something before submitting!")
      return
    }

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/sketchbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: author.trim() || 'anonymous',
            body: caption.trim() || undefined,
            imageUrl
          })
        })

        const result = await response.json()
        applyCooldown(result.cooldown)

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit masterpiece.')
        }

        setDrawings(prev => [result.drawing, ...prev])
        setCaption('')
        initCanvas()
        showNotification('Drawing published successfully!')
      } catch (err: any) {
        setErrorMessage(err.message || 'Something went wrong.')
      }
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
  const handleReplySubmit = async (id: string) => {
    if (!replyBody.trim()) return

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
        setReplyingTo(null)
        setReplyBody('')
        showNotification('Reply posted successfully!')
      } catch (err) {
        showNotification('Could not post reply.')
      }
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
        if (zoomDrawing?.id === id) setZoomDrawing(null)
      } else {
        showNotification('Failed to delete drawing.')
      }
    } catch (err) {
      showNotification('Error deleting drawing.')
    }
  }

  // Share Drawing Clipboard copy
  const handleShareDrawing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/sketchbook#drawing-${id}`
    navigator.clipboard.writeText(url)
      .then(() => {
        showButtonFeedback(`share-${id}`, 'Copied!')
      })
      .catch(() => {
        showButtonFeedback(`share-${id}`, 'Failed to share')
      })
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

      {/* Simplified Editor Workspace Form (no redundant outer nested cards or titles) */}
      <form 
        onSubmit={handleSubmit} 
        className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 transition-all duration-200 border-0 focus-within:bg-slate-100/50 dark:focus-within:bg-slate-900 flex flex-col"
      >
        {/* Top Alias input field (matches TalkBoard) */}
        <div className="border-b border-border/60 px-4 py-3">
          <input
            type="text"
            placeholder="Your alias (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-violet-600 placeholder:text-muted-foreground/60 focus:outline-none dark:text-violet-400"
          />
        </div>

        {/* Caption textarea (matches TalkBoard) */}
        <div className="px-4 py-2">
          <textarea
            placeholder="Caption your masterpiece... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={MAX_BODY_LENGTH}
            onInput={(e) => {
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            rows={1}
            className="w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[60px]"
          />
        </div>

        {/* Clean Drawing Area with Canvas and settings centered */}
        <div className="flex flex-col items-center gap-4 px-4 pb-5 pt-3 border-t border-border/40 bg-slate-50/30 dark:bg-slate-950/10">
          <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white dark:border-slate-800/80 shadow-md">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>

          {/* Canvas Settings Row directly under canvas */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[400px]">
            {/* Tool Mode Pencil / Eraser */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/20 shadow-sm">
              <button
                type="button"
                onClick={() => setIsDrawingTool('pencil')}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-semibold",
                  isDrawingTool === 'pencil' 
                    ? "bg-violet-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
                title="Pencil mode"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsDrawingTool('eraser')}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-semibold",
                  isDrawingTool === 'eraser' 
                    ? "bg-violet-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
                title="Eraser mode"
              >
                <Eraser size={13} />
              </button>
            </div>

            {/* Undo, Redo, Clear */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/20 shadow-sm">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!historyState.canUndo}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-40 disabled:pointer-events-none transition-all"
                title="Undo"
              >
                <Undo2 size={13} />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!historyState.canRedo}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-40 disabled:pointer-events-none transition-all"
                title="Redo"
              >
                <Redo2 size={13} />
              </button>
              <div className="w-[1px] bg-slate-200 dark:bg-slate-700 self-stretch my-0.5 mx-1" />
              <button
                type="button"
                onClick={initCanvas}
                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 dark:text-red-450 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                title="Clear board"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Palette Presets */}
          {isDrawingTool === 'pencil' && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-[400px] bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/20 shadow-sm">
              {PRESETS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setBrushColor(color.hex)}
                  className={cn(
                    "w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 relative transition-transform duration-100 scale-100 hover:scale-110 shadow-sm",
                    brushColor === color.hex && "ring-2 ring-violet-500 scale-105"
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              <label
                className={cn(
                  "w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center relative cursor-pointer hover:scale-110 shadow-sm overflow-hidden bg-background",
                  !PRESETS.some(p => p.hex === brushColor) && "ring-2 ring-violet-500 scale-105"
                )}
                title="Custom Color"
              >
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Palette size={12} className="text-muted-foreground" />
              </label>
            </div>
          )}

          {/* Brush Thickness Slider */}
          <div className="flex items-center gap-3 w-full max-w-[400px] bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/20 shadow-sm">
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider shrink-0 select-none">Size</span>
            <input
              type="range"
              min="1"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="flex-1 accent-violet-500 cursor-pointer h-1 bg-slate-200 dark:bg-slate-800 rounded-full"
            />
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-350/10">
              <div
                className="rounded-full bg-slate-800 dark:bg-slate-100"
                style={{
                  width: `${Math.max(2, Math.min(brushSize, 14))}px`,
                  height: `${Math.max(2, Math.min(brushSize, 14))}px`,
                  backgroundColor: isDrawingTool === 'eraser' ? '#cbd5e1' : brushColor
                }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono shrink-0 select-none">{brushSize}px</span>
          </div>
        </div>

        {/* Bottom row (matches TalkBoard action bar) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border/60 px-4 py-3.5 mt-2">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 select-none">
            Draw on the canvas above to submit your masterpiece!
          </span>

          <div className="flex flex-col w-full sm:w-auto gap-2">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-950/20 dark:bg-red-950/20 px-3 py-1.5 text-xs text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending || isCooldownActive}
              className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-full bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-700 border-0 shadow-sm"
              title={isCooldownActive ? `You can send another masterpiece in ${cooldownLabel}` : undefined}
            >
              {isCooldownActive ? cooldownLabel : 'Publish masterpiece'}
            </Button>
          </div>
        </div>
      </form>

      {/* Grid Design Gallery Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
          <div className="flex items-center gap-2">
            <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg">
              Collaborative masterpieces
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

          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing ? (
              <Text variant="muted" size="xs">Refreshing...</Text>
            ) : null}
            <Text variant="muted" size="sm" className="whitespace-nowrap">
              {drawings.length} drawings collected
            </Text>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading masterpieces...
          </div>
        ) : drawings.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Text variant="muted" size="sm">No drawings found. Be the first to draw on the canvas!</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {drawings.map((drawing) => {
              const hasLiked = likedList.includes(drawing.id)
              
              return (
                <div
                  key={drawing.id}
                  id={`drawing-${drawing.id}`}
                  onClick={() => setZoomDrawing(drawing)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-900/35 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-850 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 cursor-pointer shadow-sm"
                >
                  <div>
                    {/* Drawing Image container */}
                    <div className="relative aspect-square w-full bg-white flex items-center justify-center overflow-hidden border-b border-slate-200/50 dark:border-slate-850">
                      <img
                        src={drawing.imageUrl}
                        alt={`Drawing by ${drawing.author}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      {/* Dark Overlay Zoom icon on hover */}
                      <div className="absolute inset-0 bg-black/3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                        <span className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-sm shadow-md">
                          <Eye size={18} />
                        </span>
                      </div>
                    </div>

                    {/* Author and Caption contents */}
                    <div className="p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={cn(sansFont.className, "text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100/70 rounded-full px-2.5 py-0.5 dark:text-violet-400 dark:bg-violet-950/20 dark:border-violet-900/40")}>
                          🎨 {drawing.author}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(drawing.createdAt).split(',')[0]}
                        </span>
                      </div>

                      {drawing.body && (
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-350 line-clamp-3 leading-relaxed break-words pt-1">
                          {drawing.body}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reaction Likes & Thread bubbles & Control bar */}
                  <div className="p-4 pt-0">
                    {/* Render mini replies thread (Admin replies) */}
                    {drawing.thread && drawing.thread.length > 0 && (
                      <div className="mb-3 space-y-2 border-t border-slate-200/45 dark:border-slate-800/45 pt-3">
                        {drawing.thread.map((reply) => (
                          <div key={reply.id} className="flex gap-2 items-start text-xs bg-slate-100 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200/20 dark:border-slate-700/10">
                            <CornerDownRight size={13} className="text-violet-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-semibold text-violet-600 dark:text-violet-400">mikeblocky</span>
                              <p className="text-slate-600 dark:text-slate-300 break-words leading-relaxed">{reply.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Utility actions: Like / Share / Download / Moderation */}
                    <div className="flex items-center justify-between border-t border-slate-200/35 dark:border-slate-800/35 pt-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleLike(drawing.id, e)}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all duration-150 shadow-sm",
                            hasLiked
                              ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-900/30"
                              : "bg-background border-slate-200 text-slate-500 hover:text-red-500 dark:border-slate-800 dark:text-slate-400 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-950/30"
                          )}
                          title="Like Masterpiece"
                        >
                          <Heart size={13} className={cn(hasLiked && "fill-red-500")} />
                          <span>{drawing.likes || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShareDrawing(drawing.id, e)}
                          className="flex items-center justify-center p-1 rounded-full border border-slate-200 bg-background text-slate-500 hover:text-violet-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-violet-400 shadow-sm"
                          title="Share"
                        >
                          <Share2 size={13} />
                        </button>
                      </div>

                      {/* Admin moderation controls (only shown when admin mode is turned on) */}
                      {isAdminMode && (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(replyingTo === drawing.id ? null : drawing.id)
                              setReplyBody('')
                            }}
                            className="p-1 rounded-full border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-400 shadow-sm"
                            title="Reply to drawing"
                          >
                            <MessageSquareReply size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDrawing(drawing.id, e)}
                            className="p-1 rounded-full border border-red-250 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 shadow-sm"
                            title="Delete Masterpiece"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Admin inline reply form in gallery card */}
                    {replyingTo === drawing.id && isAdminMode && (
                      <div className="mt-3 border-t border-slate-250/20 pt-3 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <textarea
                          placeholder="Mike, write feedback..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          className="w-full bg-background border border-slate-200 dark:border-slate-800 p-2 text-xs rounded-lg focus:outline-none resize-none h-12 focus:ring-1 focus:ring-violet-300 dark:text-slate-100"
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-6 text-[10px] px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full border-0"
                            disabled={!replyBody.trim()}
                            onClick={() => handleReplySubmit(drawing.id)}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Immersive Glassmorphism Zoom Modal Overlay */}
      {zoomDrawing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setZoomDrawing(null)}
        >
          {/* Modal card wrapper */}
          <div
            className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl motion-safe:animate-in motion-safe:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Upper Action Bar / Info bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className={cn(sansFont.className, "text-sm font-bold text-violet-600 bg-violet-50 border border-violet-100/70 rounded-full px-3 py-1 dark:text-violet-400 dark:bg-violet-950/20 dark:border-violet-900/40")}>
                  🎨 {zoomDrawing.author}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDate(zoomDrawing.createdAt)}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setZoomDrawing(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal drawing canvas image view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
              <div className="bg-white rounded-2xl aspect-square w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                <img
                  src={zoomDrawing.imageUrl}
                  alt={`Full size drawing by ${zoomDrawing.author}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Caption description */}
              {zoomDrawing.body && (
                <div className="bg-slate-100/55 dark:bg-slate-950/15 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-850">
                  <p className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                    {zoomDrawing.body}
                  </p>
                </div>
              )}

              {/* Mini thread Replies in zoom overlay */}
              {zoomDrawing.thread && zoomDrawing.thread.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Board Thread replies</h4>
                  {zoomDrawing.thread.map((reply) => (
                    <div key={reply.id} className="flex gap-3 items-start bg-slate-100 dark:bg-slate-850/60 p-3.5 rounded-2xl border border-slate-200/20 dark:border-slate-800/10">
                      <CornerDownRight size={15} className="text-violet-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">mikeblocky (Admin)</span>
                        <p className="text-sm text-slate-700 dark:text-slate-350 break-words leading-relaxed">{reply.body}</p>
                        <span className="text-[10px] text-muted-foreground font-mono block pt-1">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Utilities bar */}
            <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleLike(zoomDrawing.id, e)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-150 shadow-sm",
                    likedList.includes(zoomDrawing.id)
                      ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-900/30"
                      : "bg-background border-slate-200 text-slate-500 hover:text-red-500 dark:border-slate-800 dark:text-slate-400 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-950/30"
                  )}
                >
                  <Heart size={14} className={cn(likedList.includes(zoomDrawing.id) && "fill-red-500")} />
                  <span>{zoomDrawing.likes || 0} Likes</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Download */}
                <button
                  type="button"
                  onClick={(e) => handleDownloadDrawing(zoomDrawing.imageUrl, zoomDrawing.id, e)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-background hover:bg-slate-100 text-slate-600 dark:border-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 px-4 py-2 text-sm font-semibold transition-all shadow-sm"
                  title="Download image"
                >
                  <Download size={14} /> Download
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={(e) => handleShareDrawing(zoomDrawing.id, e)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-background hover:bg-slate-100 text-slate-600 dark:border-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 px-4 py-2 text-sm font-semibold transition-all shadow-sm"
                >
                  <Share2 size={14} />
                  <span>{buttonFeedback[`share-${zoomDrawing.id}`] || 'Copy Link'}</span>
                </button>

                {/* Admin moderation controls inside modal */}
                {isAdminMode && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteDrawing(zoomDrawing.id, e)}
                    className="flex items-center justify-center p-2 rounded-full border border-red-250 bg-red-50 text-red-650 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 shadow-sm"
                    title="Delete Masterpiece"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </StackVertical>
  )
}
