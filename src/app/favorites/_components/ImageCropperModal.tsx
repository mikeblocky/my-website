'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/primitives/button'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'

export type CropAspectRatio = '3:4' | '16:9' | '1:1' | 'original'

interface ImageCropperModalProps {
	imageSrc: string
	onClose: () => void
	onCrop: (croppedDataUrl: string) => void
	defaultAspectRatio?: CropAspectRatio
}

const ASPECT_RATIO_PRESETS: { key: CropAspectRatio; label: string; ratio: number | 'original' }[] = [
	{ key: '3:4', label: '3:4 cover', ratio: 0.75 },
	{ key: '16:9', label: '16:9 screen', ratio: 16 / 9 },
	{ key: '1:1', label: '1:1 square', ratio: 1 },
	{ key: 'original', label: 'original', ratio: 'original' },
]

export function ImageCropperModal({
	imageSrc,
	onClose,
	onCrop,
	defaultAspectRatio = '3:4',
}: ImageCropperModalProps) {
	const [aspectRatio, setAspectRatio] = useState<CropAspectRatio>(defaultAspectRatio)
	const [zoom, setZoom] = useState<number>(1)
	const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
	const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [mounted, setMounted] = useState<boolean>(false)
	const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 380, height: 340 })

	const containerRef = useRef<HTMLDivElement>(null)
	const isDraggingRef = useRef<boolean>(false)
	const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const dragOffsetStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const updateOffsetRef = useRef<(dx: number, dy: number) => void>(() => {})

	// Ensure portal is only rendered on the client
	useEffect(() => {
		setMounted(true)
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
		}
	}, [])

	// Track container size dynamically for absolute responsiveness
	useEffect(() => {
		if (!containerRef.current) return
		const observer = new ResizeObserver((entries) => {
			if (entries[0]) {
				setContainerSize({
					width: entries[0].contentRect.width,
					height: entries[0].contentRect.height,
				})
			}
		})
		observer.observe(containerRef.current)
		return () => observer.disconnect()
	}, [mounted])

	// Load image dimensions
	useEffect(() => {
		if (!imageSrc) return
		setIsLoading(true)
		const img = new Image()
		img.onload = () => {
			setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight })
			setIsLoading(false)
			setZoom(1)
			setOffset({ x: 0, y: 0 })
		}
		img.src = imageSrc
	}, [imageSrc])

	// Reset zoom and pan when aspect ratio changes
	useEffect(() => {
		setZoom(1)
		setOffset({ x: 0, y: 0 })
	}, [aspectRatio])

	// Calculate aspect ratio value
	const arVal = imgDimensions
		? aspectRatio === 'original'
			? imgDimensions.width / imgDimensions.height
			: aspectRatio === '3:4'
			? 0.75
			: aspectRatio === '16:9'
			? 16 / 9
			: 1
		: 1

	// Calculate crop frame dimensions to fit inside container with padding (40px padding)
	const containerW = containerSize.width
	const containerH = containerSize.height

	const MAX_FRAME_W = containerW - 40
	const MAX_FRAME_H = containerH - 40

	let frameW = MAX_FRAME_W
	let frameH = MAX_FRAME_W / arVal

	if (frameH > MAX_FRAME_H) {
		frameH = MAX_FRAME_H
		frameW = MAX_FRAME_H * arVal
	}

	const frameX = (containerW - frameW) / 2
	const frameY = (containerH - frameH) / 2

	// Calculate base scale and image size to cover the crop frame box at zoom 1
	let baseImgWidth = 0
	let baseImgHeight = 0
	if (imgDimensions) {
		const baseScale = Math.max(frameW / imgDimensions.width, frameH / imgDimensions.height)
		baseImgWidth = imgDimensions.width * baseScale
		baseImgHeight = imgDimensions.height * baseScale
	}

	// Dynamic offset update with bounds clamping relative to the crop frame box
	useEffect(() => {
		updateOffsetRef.current = (dx: number, dy: number) => {
			if (!imgDimensions) return
			const displayedWidth = baseImgWidth * zoom
			const displayedHeight = baseImgHeight * zoom

			const maxPanX = Math.max(0, (displayedWidth - frameW) / 2)
			const maxPanY = Math.max(0, (displayedHeight - frameH) / 2)

			const startX = dragOffsetStartRef.current.x
			const startY = dragOffsetStartRef.current.y

			setOffset({
				x: Math.max(-maxPanX, Math.min(maxPanX, startX + dx)),
				y: Math.max(-maxPanY, Math.min(maxPanY, startY + dy)),
			})
		}
	}, [zoom, imgDimensions, baseImgWidth, baseImgHeight, frameW, frameH])

	// Bounds clamp when zoom or frame changes
	useEffect(() => {
		if (!imgDimensions) return
		const displayedWidth = baseImgWidth * zoom
		const displayedHeight = baseImgHeight * zoom

		const maxPanX = Math.max(0, (displayedWidth - frameW) / 2)
		const maxPanY = Math.max(0, (displayedHeight - frameH) / 2)

		setOffset((prev) => ({
			x: Math.max(-maxPanX, Math.min(maxPanX, prev.x)),
			y: Math.max(-maxPanY, Math.min(maxPanY, prev.y)),
		}))
	}, [zoom, aspectRatio, imgDimensions, baseImgWidth, baseImgHeight, frameW, frameH])

	// Mouse and touch drag handlers
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDraggingRef.current) return
			const dx = e.clientX - dragStartRef.current.x
			const dy = e.clientY - dragStartRef.current.y
			updateOffsetRef.current(dx, dy)
		}

		const handleTouchMove = (e: TouchEvent) => {
			if (!isDraggingRef.current || e.touches.length !== 1) return
			// Prevent double scroll or rubber-banding while cropping
			e.preventDefault()
			const dx = e.touches[0].clientX - dragStartRef.current.x
			const dy = e.touches[0].clientY - dragStartRef.current.y
			updateOffsetRef.current(dx, dy)
		}

		const handleMouseUp = () => {
			isDraggingRef.current = false
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
		window.addEventListener('touchmove', handleTouchMove, { passive: false })
		window.addEventListener('touchend', handleMouseUp)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
			window.removeEventListener('touchmove', handleTouchMove)
			window.removeEventListener('touchend', handleMouseUp)
		}
	}, [])

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		isDraggingRef.current = true
		dragStartRef.current = { x: e.clientX, y: e.clientY }
		dragOffsetStartRef.current = { ...offset }
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			isDraggingRef.current = true
			dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
			dragOffsetStartRef.current = { ...offset }
		}
	}

	const handleWheel = (e: React.WheelEvent) => {
		e.preventDefault()
		const zoomStep = 0.05
		const newZoom = Math.max(1, Math.min(3, zoom - e.deltaY * zoomStep * 0.01))
		setZoom(parseFloat(newZoom.toFixed(2)))
	}

	const handleSave = () => {
		if (!imgDimensions || frameW === 0 || frameH === 0) return

		const canvas = document.createElement('canvas')
		const Iw = imgDimensions.width
		const Ih = imgDimensions.height

		const baseScale = Math.max(frameW / Iw, frameH / Ih)
		const s_total = baseScale * zoom

		const W_orig = frameW / s_total
		const H_orig = frameH / s_total
		const L_orig = Iw / 2 - (frameW / 2 + offset.x) / s_total
		const T_orig = Ih / 2 - (frameH / 2 + offset.y) / s_total

		const safeL = Math.max(0, Math.min(Iw - 1, L_orig))
		const safeT = Math.max(0, Math.min(Ih - 1, T_orig))
		const safeW = Math.max(1, Math.min(Iw - safeL, W_orig))
		const safeH = Math.max(1, Math.min(Ih - safeT, H_orig))

		const currentAr = safeW / safeH

		// Output resolution (max bounding box 800px)
		let targetWidth = 800
		let targetHeight = 800 / currentAr
		if (currentAr < 1) {
			targetHeight = 800
			targetWidth = 800 * currentAr
		}

		targetWidth = Math.round(targetWidth)
		targetHeight = Math.round(targetHeight)

		canvas.width = targetWidth
		canvas.height = targetHeight

		const ctx = canvas.getContext('2d')
		if (ctx) {
			ctx.imageSmoothingEnabled = true
			ctx.imageSmoothingQuality = 'high'

			const img = new Image()
			img.onload = () => {
				ctx.drawImage(img, safeL, safeT, safeW, safeH, 0, 0, targetWidth, targetHeight)
				const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
				onCrop(croppedDataUrl)
				onClose()
			}
			img.src = imageSrc
		}
	}

	if (!mounted) return null

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
			{/* Backdrop click close */}
			<div className="absolute inset-0 cursor-default" onClick={onClose} />

			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
				className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl flex flex-col gap-4 z-10"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
					<h3 className={cn(sansFont.className, 'text-sm font-bold text-slate-900 dark:text-slate-100 lowercase')}>
						crop cover image
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
					>
						<X size={16} />
					</button>
				</div>

				{/* Cropping Workspace Area */}
				<div
					ref={containerRef}
					className="relative flex items-center justify-center bg-slate-900 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg h-[340px] w-full overflow-hidden cursor-move touch-none select-none"
					onMouseDown={handleMouseDown}
					onTouchStart={handleTouchStart}
					onWheel={handleWheel}
				>
					{isLoading || !imgDimensions ? (
						<div className="flex flex-col items-center gap-2 pointer-events-none">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--pride-glow-val))] border-t-transparent" />
							<span className={cn(monoFont.className, 'text-[10px] text-slate-400 tracking-wider lowercase')}>
								loading cover...
							</span>
						</div>
					) : (
						<>
							{/* The Image (extends outside crop frame, but contained by the workspace container) */}
							<img
								src={imageSrc}
								alt="Crop source"
								className="absolute pointer-events-none select-none max-w-none max-h-none"
								style={{
									width: baseImgWidth,
									height: baseImgHeight,
									transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
									left: '50%',
									top: '50%',
									marginLeft: -baseImgWidth / 2,
									marginTop: -baseImgHeight / 2,
									transformOrigin: 'center center',
								}}
							/>

							{/* Dark semi-transparent overlays outside the centered crop frame */}
							<div
								style={{ left: 0, top: 0, width: containerW, height: frameY }}
								className="absolute bg-slate-950/60 backdrop-blur-[0.5px] pointer-events-none"
							/>
							<div
								style={{ left: 0, top: frameY + frameH, width: containerW, bottom: 0 }}
								className="absolute bg-slate-950/60 backdrop-blur-[0.5px] pointer-events-none"
							/>
							<div
								style={{ left: 0, top: frameY, width: frameX, height: frameH }}
								className="absolute bg-slate-950/60 backdrop-blur-[0.5px] pointer-events-none"
							/>
							<div
								style={{ left: frameX + frameW, top: frameY, right: 0, height: frameH }}
								className="absolute bg-slate-950/60 backdrop-blur-[0.5px] pointer-events-none"
							/>

							{/* Center Crop Frame Highlight Border & Grid */}
							<div
								style={{
									left: frameX,
									top: frameY,
									width: frameW,
									height: frameH,
								}}
								className="absolute border border-white pointer-events-none shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
							>
								{/* Grid lines inside box */}
								<div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
									<div className="border-r border-b border-white/20" />
									<div className="border-r border-b border-white/20" />
									<div className="border-b border-white/20" />
									<div className="border-r border-b border-white/20" />
									<div className="border-r border-b border-white/20" />
									<div className="border-b border-white/20" />
									<div className="border-r border-white/20" />
									<div className="border-r border-white/20" />
									<div />
								</div>
							</div>
						</>
					)}
				</div>

				{/* Controls (Aspect Ratio & Zoom) */}
				{!isLoading && imgDimensions && (
					<div className="flex flex-col gap-4 py-1">
						{/* Zoom Control */}
						<div className="flex items-center gap-3">
							<ZoomOut size={14} className="text-slate-400" />
							<input
								type="range"
								min="1"
								max="3"
								step="0.01"
								value={zoom}
								onChange={(e) => setZoom(parseFloat(e.target.value))}
								className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--pride-glow-val))]"
							/>
							<ZoomIn size={14} className="text-slate-400" />
							<span className={cn(monoFont.className, 'text-[9px] text-slate-400 w-8 text-right font-medium')}>
								{Math.round(zoom * 100)}%
							</span>
						</div>

						{/* Aspect Ratio Presets */}
						<div className="flex flex-col gap-1.5">
							<span className={cn(monoFont.className, 'text-[9px] lowercase tracking-widest text-slate-400 font-semibold')}>
								aspect ratio
							</span>
							<div className="flex flex-wrap gap-1.5">
								{ASPECT_RATIO_PRESETS.map((preset) => (
									<button
										key={preset.key}
										type="button"
										onClick={() => setAspectRatio(preset.key)}
										className={cn(
											sansFont.className,
											'px-2.5 py-1 rounded-sm border text-[10px] tracking-wide font-semibold lowercase transition-all duration-200 cursor-pointer',
											aspectRatio === preset.key
												? 'text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10 font-bold'
												: 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
										)}
									>
										{preset.label}
									</button>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Actions Footer */}
				<div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
					<Button
						variant="outline"
						onClick={onClose}
						className="lowercase font-bold h-9 px-4 text-[11px] rounded-full"
					>
						cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={isLoading || !imgDimensions}
						className="lowercase font-bold h-9 px-4 text-[11px] rounded-full"
					>
						crop & save cover
					</Button>
				</div>
			</motion.div>
		</div>,
		document.body
	)
}
