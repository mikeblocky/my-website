'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Palette, Undo2, Redo2, Eraser, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/primitives/button'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'

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

interface SketchbookCanvasProps {
  onSubmit: (payload: { author: string; body: string; imageUrl: string }) => Promise<void>
  isPending: boolean
  isCooldownActive: boolean
  cooldownLabel: string
  showNotification: (msg: string) => void
}

export function SketchbookCanvas({
  onSubmit,
  isPending,
  isCooldownActive,
  cooldownLabel,
  showNotification
}: SketchbookCanvasProps) {
  // Drawing tools state
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [brushColor, setBrushColor] = useState('#1e293b')
  const [pencilSize, setPencilSize] = useState(5)
  const [eraserSize, setEraserSize] = useState(15)
  const [isDrawingTool, setIsDrawingTool] = useState<'pencil' | 'eraser'>('pencil')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const brushSize = isDrawingTool === 'eraser' ? eraserSize : pencilSize
  const setBrushSize = (val: number) => {
    if (isDrawingTool === 'eraser') {
      setEraserSize(val)
    } else {
      setPencilSize(val)
    }
  }

  // Local text state for the size input
  const [sizeInputText, setSizeInputText] = useState(String(brushSize))
  const sizeInputFocused = useRef(false)
  
  useEffect(() => {
    if (!sizeInputFocused.current) {
      setSizeInputText(String(brushSize))
    }
  }, [brushSize])

  // History stack for Undo / Redo
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })

  // Form State
  const [author, setAuthor] = useState('')
  const [caption, setCaption] = useState('')

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
  }, [brushColor, brushSize, isDrawingTool, historyState]) // Include state dependencies to prevent closure captures

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
    
    // Touchscreen compatibility
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

    // Smooth stabilize coordinates using lerp (damped tracking)
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
        try {
          tempCanvas.releasePointerCapture(e.pointerId)
        } catch (_) {}

        const tempCtx = tempCanvas.getContext('2d')
        const ctx = canvas.getContext('2d')
        if (tempCtx && ctx) {
          // Flush the stabilization
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

          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
          drawStroke(ctx, points)
        }
      }

      isDrawingRef.current = false
      pointsRef.current = []
      saveStateToHistory()
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isCooldownActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const imageUrl = canvas.toDataURL('image/png')

    if (historyRef.current.length <= 1) {
      setErrorMessage("Please draw something before submitting!")
      return
    }

    try {
      setErrorMessage(null)
      await onSubmit({
        author: author.trim() || 'anonymous',
        body: caption.trim(),
        imageUrl
      })
      setCaption('')
      initCanvas()
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.')
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col overflow-hidden pride-focus-within-glow"
    >
      {/* Top Alias input field */}
      <div className="border-b border-slate-100 dark:border-slate-900 px-4 py-3 bg-slate-50/20 dark:bg-slate-950/20">
        <input
          type="text"
          placeholder="Your alias (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={cn(
            sansFont.className,
            "w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100"
          )}
        />
      </div>

      {/* Caption textarea */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900">
        <textarea
          placeholder="Caption your artwork... (optional)"
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
            "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[50px]"
          )}
        />
      </div>

      {/* Clean Drawing Area with Canvas and settings */}
      <div className="flex flex-col items-center gap-6 px-4 pb-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/10 dark:bg-slate-950/5 w-full">
        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 w-full max-w-[900px] mx-auto">
          
          {/* Left Panel: Brush Tools */}
          <div className="w-full max-w-[400px] md:max-w-none md:w-[68px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 flex flex-col gap-4 md:gap-5 md:justify-between md:items-center shadow-lg shadow-slate-100/10 dark:shadow-black/15 order-1 md:order-1">
            
            {/* Tool Switcher */}
            <div className="flex flex-row md:flex-col bg-slate-100/60 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/40 w-full gap-1">
              <button
                type="button"
                onClick={() => setIsDrawingTool('pencil')}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer flex-1 md:w-full",
                  isDrawingTool === 'pencil' 
                    ? "pride-text bg-white dark:bg-slate-850 shadow-md shadow-black/5 pride-icon-glow scale-[1.03]" 
                    : "text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/20"
                )}
                title="Pencil mode (B)"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsDrawingTool('eraser')}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer flex-1 md:w-full",
                  isDrawingTool === 'eraser' 
                    ? "pride-text bg-white dark:bg-slate-850 shadow-md shadow-black/5 pride-icon-glow scale-[1.03]" 
                    : "text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/20"
                )}
                title="Eraser mode (E)"
              >
                <Eraser size={15} />
              </button>
            </div>

            {/* Undo, Redo, Clear */}
            <div className="flex flex-row md:flex-col bg-slate-100/60 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/40 items-center justify-between md:justify-center gap-1 w-full">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!historyState.canUndo}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex-1 md:w-full flex items-center justify-center"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!historyState.canRedo}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex-1 md:w-full flex items-center justify-center"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={14} />
              </button>
              <div className="w-[1px] md:w-4/5 h-4 md:h-[1px] bg-slate-200 dark:bg-slate-800 self-center my-0.5 md:my-1" />
              <button
                type="button"
                onClick={initCanvas}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950/30 transition-all cursor-pointer flex-1 md:w-full flex items-center justify-center"
                title="Clear board"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Brush Thickness Slider */}
            <div className="flex flex-col items-center gap-2.5 bg-slate-100/60 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200/30 dark:border-slate-800/40 w-full">
              <input
                type="range"
                min="1"
                max="40"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full md:[writing-mode:vertical-lr] md:[direction:rtl] h-1.5 md:h-24 md:w-1.5 accent-[hsl(var(--pride-glow-val))] cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-full my-1"
                title={`Brush size: ${brushSize}px`}
              />
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200/60 dark:border-slate-800/60 shadow-inner shrink-0 relative overflow-hidden">
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: `${Math.max(2, Math.min(brushSize, 20))}px`,
                    height: `${Math.max(2, Math.min(brushSize, 20))}px`,
                    backgroundColor: isDrawingTool === 'eraser' ? '#cbd5e1' : brushColor
                  }}
                />
              </div>
              <input
                type="text"
                inputMode="numeric"
                min="1"
                max="100"
                value={sizeInputText}
                onFocus={() => {
                  sizeInputFocused.current = true
                  setSizeInputText(String(brushSize))
                }}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  setSizeInputText(raw)
                }}
                onBlur={() => {
                  sizeInputFocused.current = false
                  const val = parseInt(sizeInputText)
                  if (!isNaN(val) && val >= 1) {
                    const nextSize = Math.max(1, Math.min(val, 100))
                    setBrushSize(nextSize)
                    setSizeInputText(String(nextSize))
                  } else {
                    setSizeInputText(String(brushSize))
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur()
                  }
                }}
                className={cn(
                  monoFont.className,
                  "w-9 h-6 text-center text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--pride-glow-val))] shrink-0"
                )}
                title="Type custom size (1-100)"
              />
            </div>
          </div>

          {/* Center Panel: Canvas */}
          <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-900 shadow-xl order-2 md:order-2 shrink-0">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="absolute inset-0 w-full h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]"
            />
            <canvas
              ref={tempCanvasRef}
              width={600}
              height={600}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
            />
          </div>

          {/* Right Panel: Colors */}
          <div className="w-full max-w-[400px] md:max-w-none md:w-[68px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 flex flex-col shadow-lg shadow-slate-100/10 dark:shadow-black/15 order-3 md:order-3">
            <div className="grid grid-cols-5 md:flex md:flex-col md:justify-between md:items-center md:h-full gap-2.5 md:gap-3 w-full h-full bg-slate-100/60 dark:bg-slate-950/60 px-2 py-3 rounded-xl border border-slate-200/30 dark:border-slate-800/40">
              {PRESETS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setBrushColor(color.hex)}
                  className={cn(
                    "w-[22px] h-[22px] rounded-full border border-slate-200 dark:border-slate-800 relative transition-all duration-200 scale-100 hover:scale-120 shadow-md cursor-pointer",
                    brushColor === color.hex && "ring-2 ring-[hsl(var(--pride-glow-val))] ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-lg shadow-[hsl(var(--pride-glow-val))/0.15]"
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              
              <label
                className={cn(
                  "w-[22px] h-[22px] rounded-full border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center relative cursor-pointer hover:scale-120 shadow-md bg-white dark:bg-slate-900 transition-all",
                  !PRESETS.some(p => p.hex === brushColor) && "ring-2 ring-[hsl(var(--pride-glow-val))] ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-lg shadow-[hsl(var(--pride-glow-val))/0.15]"
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

      {/* Bottom row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-3.5 bg-slate-50/20 dark:bg-slate-950/20">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 select-none">
          Draw on the canvas above to submit your artwork!
        </span>

        <div className="flex flex-col w-full sm:w-auto gap-2">
          {errorMessage && (
            <div className="rounded-lg border border-red-200/50 bg-red-50/50 dark:border-red-955/20 dark:bg-red-955/20 px-3.5 py-2 text-xs text-red-600 dark:text-red-400 font-medium">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || isCooldownActive}
            className="w-full sm:w-auto pride-button rounded-md h-9 px-4.5 text-xs font-semibold"
            title={isCooldownActive ? `You can send another artwork in ${cooldownLabel}` : undefined}
          >
            {isCooldownActive ? cooldownLabel : 'Publish artwork'}
          </Button>
        </div>
      </div>
    </form>
  )
}
