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
import { ImageGallery } from '@/components/ui/ImageGallery'

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
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [brushColor, setBrushColor] = useState('#1e293b')
  const [pencilSize, setPencilSize] = useState(5)
  const [eraserSize, setEraserSize] = useState(15)
  const [isDrawingTool, setIsDrawingTool] = useState<'pencil' | 'eraser'>('pencil')

  const brushSize = isDrawingTool === 'eraser' ? eraserSize : pencilSize
  const setBrushSize = (val: number) => {
    if (isDrawingTool === 'eraser') {
      setEraserSize(val)
    } else {
      setPencilSize(val)
    }
  }

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
  const stabilizedPosRef = useRef({ x: 0, y: 0 })
  const lastRawPosRef = useRef({ x: 0, y: 0 })
  const pointsRef = useRef<{ x: number; y: number }[]>([])

  // Coordinate normalizer for Pointer Events
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Clear Canvas and paint background pure white
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tempCanvas = tempCanvasRef.current
    if (tempCanvas) {
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
      }
    }

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

  // Global Keyboard Shortcuts for Undo (Ctrl+Z), Redo (Ctrl+Y), Brush (B), and Eraser (E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return
      }

      const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z'
      const isRedo = 
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z')

      const isBrush = !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'b'
      const isEraser = !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'e'

      if (isUndo) {
        e.preventDefault()
        handleUndo()
      } else if (isRedo) {
        e.preventDefault()
        handleRedo()
      } else if (isBrush) {
        e.preventDefault()
        setIsDrawingTool('pencil')
      } else if (isEraser) {
        e.preventDefault()
        setIsDrawingTool('eraser')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleUndo, handleRedo, setIsDrawingTool])

  // Helper to draw a full smooth stroke onto a given 2D context
  const drawStroke = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length === 0) return

    ctx.strokeStyle = isDrawingTool === 'eraser' ? '#ffffff' : brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (points.length === 1) {
      ctx.beginPath()
      ctx.arc(points[0].x, points[0].y, brushSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = isDrawingTool === 'eraser' ? '#ffffff' : brushColor
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y)
      } else {
        // Draw quadratic curves through midpoints for ultimate mathematical smoothness
        let i;
        for (i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }
        // Connect beautifully to the final point
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
      }
      ctx.stroke()
    }
  }

  // Drawing event handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const tempCanvas = tempCanvasRef.current
    if (!tempCanvas) return
    
    // Crucial for pointer events on touch screens:
    try {
      tempCanvas.setPointerCapture(e.pointerId)
    } catch (_) {}

    const coords = getCoordinates(e, tempCanvas)
    if (!coords) return

    isDrawingRef.current = true
    lastPosRef.current = coords
    lastRawPosRef.current = coords
    stabilizedPosRef.current = coords
    pointsRef.current = [coords]

    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    // Clear temp canvas and draw starting dot instantly
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    drawStroke(tempCtx, pointsRef.current)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    e.preventDefault()

    const tempCanvas = tempCanvasRef.current
    if (!tempCanvas) return
    const coords = getCoordinates(e, tempCanvas)
    if (!coords) return

    lastRawPosRef.current = coords

    // Smooth stabilize coordinates using lerp (damped tracking) to completely filter out hand jitter
    const lastStab = stabilizedPosRef.current
    const nextStabX = lastStab.x + (coords.x - lastStab.x) * 0.45
    const nextStabY = lastStab.y + (coords.y - lastStab.y) * 0.45
    const nextStab = { x: nextStabX, y: nextStabY }
    stabilizedPosRef.current = nextStab

    pointsRef.current.push(nextStab)

    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    // Clear temp canvas and redraw the entire active path in real-time
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    drawStroke(tempCtx, pointsRef.current)

    lastPosRef.current = nextStab
  }

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawingRef.current) {
      const tempCanvas = tempCanvasRef.current
      const canvas = canvasRef.current
      if (tempCanvas && canvas) {
        // Release pointer capture
        try {
          tempCanvas.releasePointerCapture(e.pointerId)
        } catch (_) {}

        const tempCtx = tempCanvas.getContext('2d')
        const ctx = canvas.getContext('2d')
        if (tempCtx && ctx) {
          // Flush the stabilization to pull the stroke all the way to the final raw pointer position
          const raw = lastRawPosRef.current
          let lastStab = stabilizedPosRef.current
          const points = pointsRef.current
          
          let dist = Math.hypot(raw.x - lastStab.x, raw.y - lastStab.y)
          let iterations = 0
          while (dist > 0.5 && iterations < 15) {
            const nextStabX = lastStab.x + (raw.x - lastStab.x) * 0.45
            const nextStabY = lastStab.y + (raw.y - lastStab.y) * 0.45
            lastStab = { x: nextStabX, y: nextStabY }
            points.push(lastStab)
            dist = Math.hypot(raw.x - lastStab.x, raw.y - lastStab.y)
            iterations++
          }

          // Clear the temp canvas stroke completely
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

          // Bake the entire finished stroke permanently onto the main canvas!
          drawStroke(ctx, points)
        }
      }

      isDrawingRef.current = false
      pointsRef.current = []
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
            className={cn(
              sansFont.className,
              "w-full bg-transparent text-sm font-semibold text-violet-600 placeholder:text-muted-foreground/60 focus:outline-none dark:text-violet-400"
            )}
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
            className={cn(
              sansFont.className,
              "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[60px]"
            )}
          />
        </div>

        {/* Clean Drawing Area with Canvas and settings centered */}
        <div className="flex flex-col items-center gap-6 px-4 pb-6 pt-4 border-t border-border/40 bg-slate-50/30 dark:bg-slate-950/10 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-5 w-full max-w-[900px] mx-auto">
            
            {/* Left Panel: Brush Tools, Actions, Size (Sleek, label-less, and vertically stacked/spread on desktop) */}
            <div className="w-full max-w-[400px] md:max-w-none md:w-[62px] bg-slate-100/70 dark:bg-slate-900/60 p-3 md:p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col gap-4 md:gap-0 md:justify-between md:items-center shadow-sm order-1 md:order-1">
              {/* Tool Mode: Pencil / Eraser */}
              <div className="flex flex-row md:flex-col bg-slate-200/60 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-300/30 dark:border-slate-700/40 w-full gap-1">
                <button
                  type="button"
                  onClick={() => setIsDrawingTool('pencil')}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center text-xs font-semibold select-none cursor-pointer flex-1 md:w-full",
                    isDrawingTool === 'pencil' 
                      ? "bg-violet-600 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="Pencil mode"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawingTool('eraser')}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center text-xs font-semibold select-none cursor-pointer flex-1 md:w-full",
                    isDrawingTool === 'eraser' 
                      ? "bg-violet-600 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="Eraser mode"
                >
                  <Eraser size={14} />
                </button>
              </div>

              {/* Undo, Redo, Clear */}
              <div className="flex flex-row md:flex-col bg-slate-200/60 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-300/30 dark:border-slate-700/40 items-center justify-between md:justify-center gap-1 md:gap-1.5 w-full">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!historyState.canUndo}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex-1 md:w-full flex items-center justify-center"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={!historyState.canRedo}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/60 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex-1 md:w-full flex items-center justify-center"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={13} />
                </button>
                <div className="w-[1px] md:w-full h-auto md:h-[1px] bg-slate-300 dark:bg-slate-700 self-stretch md:self-auto my-0.5 md:my-1" />
                <button
                  type="button"
                  onClick={initCanvas}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 dark:text-red-450 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer flex-1 md:w-full flex items-center justify-center"
                  title="Clear board"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Brush Thickness Slider & Dot Preview (Compact, Sleek, vertically stacked/rotated) */}
              <div className="flex flex-col items-center gap-2 bg-slate-200/30 dark:bg-slate-800/30 px-1.5 py-2 rounded-xl border border-slate-300/10 dark:border-slate-700/10 w-full">
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full md:[writing-mode:vertical-lr] md:[direction:rtl] h-1.5 md:h-24 md:w-1.5 accent-violet-600 cursor-pointer bg-slate-200 dark:bg-slate-850 rounded-full my-1"
                  title={`Brush size: ${brushSize}px`}
                />
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <div
                    className="rounded-full transition-all"
                    style={{
                      width: `${Math.max(2, Math.min(brushSize, 18))}px`,
                      height: `${Math.max(2, Math.min(brushSize, 18))}px`,
                      backgroundColor: isDrawingTool === 'eraser' ? '#cbd5e1' : brushColor
                    }}
                  />
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val)) {
                      setBrushSize(Math.max(1, Math.min(val, 100)))
                    }
                  }}
                  className="w-9 h-6 text-center text-[10px] font-bold bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shrink-0"
                  title="Type custom size (1-100)"
                />
              </div>
            </div>

            {/* Center Panel: Canvas */}
            <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white dark:border-slate-800/80 shadow-md order-2 md:order-2 shrink-0">
              {/* Main baked canvas */}
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="absolute inset-0 w-full h-full"
              />
              {/* Active temporary stroke drawing canvas */}
              <canvas
                ref={tempCanvasRef}
                width={600}
                height={600}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              />
            </div>

            {/* Right Panel: Colors (Palette presets + custom color picker - spread vertically in single column) */}
            <div className="w-full max-w-[400px] md:max-w-none md:w-[62px] bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex flex-col shadow-sm order-3 md:order-3">
              <div className="grid grid-cols-5 md:flex md:flex-col md:justify-between md:items-center md:h-full gap-2.5 md:gap-0 w-full h-full bg-slate-200/30 dark:bg-slate-800/30 px-2 py-2.5 rounded-xl border border-slate-300/10 dark:border-slate-700/10">
                {PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setBrushColor(color.hex)}
                    className={cn(
                      "w-5.5 h-5.5 rounded-full border border-slate-200 dark:border-slate-800 relative transition-all duration-100 scale-100 hover:scale-110 shadow-sm cursor-pointer",
                      brushColor === color.hex && "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 scale-105"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                
                <label
                  className={cn(
                    "w-5.5 h-5.5 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center relative cursor-pointer hover:scale-110 shadow-sm overflow-hidden bg-background transition-all",
                    !PRESETS.some(p => p.hex === brushColor) && "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 scale-105"
                  )}
                  title="Custom Color"
                >
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Palette size={11} className="text-slate-500 dark:text-slate-400" />
                </label>
              </div>
            </div>

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
              {drawings.length} masterpieces collected
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
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-900/35 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-850 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 cursor-default shadow-sm animate-in fade-in-50 duration-200"
                >
                  <div>
                    {/* Drawing Image container utilizing shared ImageGallery for premium lightbox zoom & pan */}
                    <div className="relative aspect-square w-full bg-white flex items-center justify-center overflow-hidden border-b border-slate-200/50 dark:border-slate-850" onClick={e => e.stopPropagation()}>
                      <ImageGallery urls={[drawing.imageUrl]} theme="violet" />
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
                        
                        <button
                          type="button"
                          onClick={(e) => handleDownloadDrawing(drawing.imageUrl, drawing.id, e)}
                          className="flex items-center justify-center p-1 rounded-full border border-slate-200 bg-background text-slate-500 hover:text-violet-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-violet-400 shadow-sm"
                          title="Download"
                        >
                          <Download size={13} />
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
                            className="p-1 rounded-full border border-red-250 bg-red-50 text-red-650 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 shadow-sm"
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
    </StackVertical>
  )
}
