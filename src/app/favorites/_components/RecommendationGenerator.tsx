'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Download, Copy, Upload, Check, Image as ImageIcon, Share2, LayoutGrid, Eye } from 'lucide-react'
import { RecommendationCard } from './RecommendationCard'
import { Button } from '@/components/ui/primitives/button'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import type { Recommendation } from '../_data/recommendations'

export function RecommendationGenerator() {
	// Items state - starts with a default manga and anime/game item (without status field in form)
	const [items, setItems] = useState<Omit<Recommendation, 'status' | 'category'>[]>([
		{
			title: 'Skip and Loafer (スキップとローファー)',
			creator: 'Misaki Takamatsu',
			medium: 'Manga',
			thought: 'Every time I reread this, I’m reminded of how rare it is for a story to treat its characters with such complete kindness. It’s my absolute comfort read because nobody changes overnight; their growth is slow, quiet, and feels so honest.',
			links: [
				{ label: 'Latest volume', url: 'https://example.com/volume' },
				{ label: 'Official Site', url: 'https://example.com/official' }
			]
		},
		{
			title: 'OMORI',
			creator: 'OMOCAT',
			medium: 'Game',
			thought: 'I like how cute and uneasy it is at the same time. It feels like walking through a mind that is trying very hard to protect itself, even when that protection has started hurting everyone around it.',
			links: [
				{ label: 'Official site', url: 'https://www.omori-game.com/' }
			]
		}
	])
	
	const [activeIndex, setActiveIndex] = useState<number>(0)
	const [previewMode, setPreviewMode] = useState<'grid' | 'row' | 'single'>('grid')
	const [isCopying, setIsCopying] = useState(false)
	const [isLinkCopying, setIsLinkCopying] = useState(false)
	const [isExporting, setIsExporting] = useState(false)
	const [dragActive, setDragActive] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Load shared items on mount or when URL query parameters change
	useEffect(() => {
		const handleLoadData = () => {
			const params = new URLSearchParams(window.location.search)
			const dataParam = params.get('data')
			if (dataParam) {
				try {
					let sanitized = dataParam.replace(/ /g, '+')
					while (sanitized.length % 4 !== 0) {
						sanitized += '='
					}
					const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/
					if (base64Regex.test(sanitized)) {
						const decoded = JSON.parse(decodeURIComponent(escape(atob(sanitized))))
						if (Array.isArray(decoded) && decoded.length > 0) {
							// Strip category/status if they were serialized
							const sanitizedItems = decoded.map(({ title, creator, medium, thought, links, imageUrl }) => ({
								title, creator, medium, thought, links, imageUrl
							}))
							setItems(sanitizedItems)
							setActiveIndex(0)
							setPreviewMode('grid')
						}
					}
				} catch (e) {
					console.error('Failed to parse shared favorites:', e)
				}
			}
		}

		handleLoadData()

		window.addEventListener('popstate', handleLoadData)
		window.addEventListener('mikeblocky-tab-url', handleLoadData)

		return () => {
			window.removeEventListener('popstate', handleLoadData)
			window.removeEventListener('mikeblocky-tab-url', handleLoadData)
		}
	}, [])

	const activeItem = items[activeIndex] || items[0]

	// Updates the fields of the item currently being edited
	const updateActiveItem = (fields: Partial<Omit<Recommendation, 'status' | 'category'>>) => {
		setItems(items.map((item, idx) => (idx === activeIndex ? { ...item, ...fields } : item)))
	}

	// Add/Remove cards
	const addNewItem = () => {
		const newItem: Omit<Recommendation, 'status' | 'category'> = {
			title: '',
			creator: '',
			medium: 'Manga',
			thought: '',
			links: []
		}
		setItems([...items, newItem])
		setActiveIndex(items.length)
	}

	const removeItem = (index: number) => {
		const nextItems = items.filter((_, idx) => idx !== index)
		setItems(nextItems.length > 0 ? nextItems : [
			{
				title: '',
				creator: '',
				medium: 'Manga',
				thought: '',
				links: []
			}
		])
		setActiveIndex(Math.max(0, index - 1))
	}

	// Image File Uploader
	const handleImageFile = (file: File) => {
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader()
			reader.onloadend = () => {
				updateActiveItem({ imageUrl: reader.result as string })
			}
			reader.readAsDataURL(file)
		}
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) handleImageFile(file)
	}

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true)
		} else if (e.type === 'dragleave') {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)
		const file = e.dataTransfer.files?.[0]
		if (file) handleImageFile(file)
	}

	// Active Item Links Actions
	const addLink = () => {
		const currentLinks = activeItem.links || []
		if (currentLinks.length < 6) {
			updateActiveItem({ links: [...currentLinks, { label: '', url: '' }] })
		}
	}

	const updateLink = (linkIdx: number, key: 'label' | 'url', value: string) => {
		const currentLinks = [...(activeItem.links || [])]
		currentLinks[linkIdx] = { ...currentLinks[linkIdx], [key]: value }
		updateActiveItem({ links: currentLinks })
	}

	const removeLink = (linkIdx: number) => {
		const currentLinks = (activeItem.links || []).filter((_, idx) => idx !== linkIdx)
		updateActiveItem({ links: currentLinks })
	}

	// Helper to build a standard Recommendation with status/category backfilled for preview/JSON
	const buildFullRecommendation = (item: Omit<Recommendation, 'status' | 'category'>): Recommendation => {
		const categoryStr = (item.medium || '').toLowerCase()
		const cleanCategory = ['manga', 'anime', 'film', 'game', 'music'].includes(categoryStr) ? categoryStr : 'manga'
		
		// Map status dynamically depending on medium so it fits recommendations.ts perfectly
		let status = 'Recommended'
		if (item.medium === 'Manga') status = 'All-time favorite'
		if (item.medium === 'Game') status = 'Emotional favorite'

		return {
			...item,
			category: cleanCategory as any,
			status
		}
	}

	// Code Config Generator
	const getJsonConfig = () => {
		const listConfigs = items.map((item) => {
			const fullRec = buildFullRecommendation(item)
			const formattedLinks = (fullRec.links || [])
				.filter(l => l.label && l.url)
				.map(l => `\t\t\t\t\t{ label: ${JSON.stringify(l.label)}, url: ${JSON.stringify(l.url)} }`)
				.join(',\n')

			return `\t\t\t{\n\t\t\t\ttitle: ${JSON.stringify(fullRec.title)},\n\t\t\t\tcreator: ${JSON.stringify(fullRec.creator)},\n\t\t\t\tcategory: ${JSON.stringify(fullRec.category)},\n\t\t\t\tmedium: ${JSON.stringify(fullRec.medium)},\n\t\t\t\tstatus: ${JSON.stringify(fullRec.status)},\n\t\t\t\timageUrl: '/recommendations/your-image.jpg',\n\t\t\t\tthought: ${JSON.stringify(fullRec.thought)},\n\t\t\t\tlinks: [\n${formattedLinks}\n\t\t\t\t]\n\t\t\t}`
		}).join(',\n')

		return `[\n${listConfigs}\n]`
	}

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(getJsonConfig())
			setIsCopying(true)
			setTimeout(() => setIsCopying(false), 2000)
		} catch (err) {
			console.error('Failed to copy config:', err)
		}
	}

	// Shareable Link Generator (strips base64 image data to stay under URL size limits)
	const getShareUrl = () => {
		const itemsToSerialize = items.map((item) => {
			const serialized = { ...item }
			if (serialized.imageUrl && serialized.imageUrl.startsWith('data:')) {
				delete serialized.imageUrl
			}
			return serialized
		})
		const json = JSON.stringify(itemsToSerialize)
		const encoded = btoa(unescape(encodeURIComponent(json)))
		return `${window.location.origin}${window.location.pathname}?tab=generator&data=${encodeURIComponent(encoded)}`
	}

	const copyShareLink = async () => {
		try {
			await navigator.clipboard.writeText(getShareUrl())
			setIsLinkCopying(true)
			setTimeout(() => setIsLinkCopying(false), 2000)
		} catch (err) {
			console.error('Failed to copy share link:', err)
		}
	}

	// PNG Card Grid / Single Exporter
	const exportCardPng = async () => {
		const element = document.getElementById('favorites-card-export-target')
		if (!element) return

		setIsExporting(true)
		// Wait for React state commit to clear the editing badges/borders before capture
		await new Promise((resolve) => setTimeout(resolve, 120))
		try {
			const { toPng } = await import('html-to-image')
			const dataUrl = await toPng(element, {
				style: {
					transform: 'none',
				},
			})

			// Download file
			const link = document.createElement('a')
			const suffix = previewMode === 'single'
				? activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
				: previewMode === 'row'
					? `row-${Math.floor(activeIndex / 2) + 1}`
					: 'grid'
			link.download = `favorites-${suffix}.png`
			link.href = dataUrl
			link.click()

			// Copy to clipboard fallback
			try {
				const res = await fetch(dataUrl)
				const blob = await res.blob()
				await navigator.clipboard.write([
					new ClipboardItem({ 'image/png': blob })
				])
			} catch (_) {}
		} catch (error) {
			console.error('Failed to export card image:', error)
		} finally {
			setIsExporting(false)
		}
	}

	const exportAllRows = async () => {
		const originalPreviewMode = previewMode
		const originalActiveIndex = activeIndex
		setIsExporting(true)

		try {
			const { toPng } = await import('html-to-image')
			const element = document.getElementById('favorites-card-export-target')
			if (!element) return

			const rowCount = Math.ceil(items.length / 2)
			for (let i = 0; i < rowCount; i++) {
				// Select a card in the target row to activate it
				setActiveIndex(i * 2)
				setPreviewMode('row')
				
				// Wait for React rendering and styling to commit
				await new Promise((resolve) => setTimeout(resolve, 200))

				const dataUrl = await toPng(element, {
					style: {
						transform: 'none',
					},
				})

				const link = document.createElement('a')
				link.download = `favorites-row-${i + 1}.png`
				link.href = dataUrl
				link.click()

				// Small delay to prevent browser download throttling
				await new Promise((resolve) => setTimeout(resolve, 300))
			}
		} catch (error) {
			console.error('Failed to export all rows:', error)
		} finally {
			setPreviewMode(originalPreviewMode)
			setActiveIndex(originalActiveIndex)
			setIsExporting(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className="space-y-6 pt-4 w-full"
		>
			{/* Card Selection Tabs (Styled like standard page tabs) */}
			<div className="flex flex-wrap gap-2 items-center">
				{items.map((item, idx) => (
					<button
						key={idx}
						type="button"
						onClick={() => setActiveIndex(idx)}
						className={cn(
							sansFont.className,
							"px-3.5 py-1.5 rounded-sm border text-[10px] tracking-wider font-semibold lowercase transition-all duration-200 flex items-center gap-2 relative cursor-pointer",
							activeIndex === idx
								? "text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10 shadow-none font-bold"
								: "border-slate-200 bg-transparent text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:border-slate-850 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
						)}
					>
						<span>{item.title || `card #${idx + 1}`}</span>
						{items.length > 1 && (
							<span
								onClick={(e) => {
									e.stopPropagation()
									removeItem(idx)
								}}
								className="text-slate-400 hover:text-red-500 rounded px-0.5 cursor-pointer ml-1 text-[11px] font-bold"
								title="Delete card"
							>
								&times;
							</span>
						)}
					</button>
				))}
				<button
					type="button"
					onClick={addNewItem}
					className={cn(
						sansFont.className,
						"px-3.5 py-1.5 rounded-sm border border-dashed border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[10px] tracking-wider font-semibold lowercase flex items-center gap-1 cursor-pointer transition-colors duration-250"
					)}
				>
					<Plus className="h-3 w-3" /> add card
				</button>
			</div>

			{/* Cohesive Grid-Split Card Form Container (Matches SuggestionForm/Guestbook aesthetic) */}
			<div className="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col overflow-hidden pride-focus-within-glow">
				
				{/* Row 1: Title & Creator (Split 2-Columns) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-100 dark:border-slate-900 bg-slate-50/10 dark:bg-slate-950/5">
					<input
						type="text"
						value={activeItem.title}
						onChange={(e) => updateActiveItem({ title: e.target.value })}
						placeholder="Title of favorite manga, anime, film, game, music..."
						className={cn(sansFont.className, "min-w-0 border-b border-slate-100 dark:border-slate-900 sm:border-b-0 sm:border-r bg-transparent px-4 py-3 text-sm font-semibold text-slate-850 dark:text-slate-150 placeholder:text-muted-foreground/50 focus:outline-none")}
						required
					/>
					<input
						type="text"
						value={activeItem.creator}
						onChange={(e) => updateActiveItem({ creator: e.target.value })}
						placeholder="Creator, author, artist, or band name..."
						className={cn(sansFont.className, "min-w-0 bg-transparent px-4 py-3 text-sm font-semibold text-slate-850 dark:text-slate-150 placeholder:text-muted-foreground/50 focus:outline-none")}
						required
					/>
				</div>

				{/* Row 2: Medium & Cover Upload (Split Grid Layout) */}
				<div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] border-b border-slate-100 dark:border-slate-900">
					<input
						type="text"
						value={activeItem.medium}
						onChange={(e) => updateActiveItem({ medium: e.target.value })}
						placeholder="Medium category (e.g. Manga, Anime, Game, Film, Music...)"
						className={cn(sansFont.className, "min-w-0 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-muted-foreground/50 focus:outline-none")}
					/>
					
					{/* Cover image upload button & mini-preview */}
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleImageChange}
						accept="image/*"
						className="hidden"
					/>
					{activeItem.imageUrl ? (
						<div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-900 px-4 py-1.5 bg-slate-50/30 dark:bg-slate-950/20 sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-900">
							<img
								src={activeItem.imageUrl}
								alt="Cover thumbnail"
								className="w-6 h-8 object-cover rounded-sm border border-slate-200 dark:border-slate-800 shrink-0"
							/>
							<button
								type="button"
								onClick={() => updateActiveItem({ imageUrl: undefined })}
								className={cn(monoFont.className, "text-[9px] text-red-500 hover:text-red-700 font-semibold cursor-pointer")}
							>
								remove cover
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							onDragEnter={handleDrag}
							onDragOver={handleDrag}
							onDragLeave={handleDrag}
							onDrop={handleDrop}
							className={cn(
								sansFont.className,
								"flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-900 px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-950/30 sm:border-l sm:border-t-0 cursor-pointer",
								dragActive && "bg-[hsl(var(--pride-glow-val))]/5 text-[hsl(var(--pride-glow-val))]"
							)}
						>
							<ImageIcon size={13} className="shrink-0" />
							<span>upload cover</span>
						</button>
					)}
				</div>

				{/* Row 3: Thoughts / Commentary */}
				<textarea
					value={activeItem.thought}
					onChange={(e) => updateActiveItem({ thought: e.target.value })}
					placeholder="Why do you recommend it? Share your thoughts, commentary, or what makes it your comfort read..."
					rows={4}
					className={cn(sansFont.className, "min-h-[110px] w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-muted-foreground/55 focus:outline-none border-b border-slate-100 dark:border-slate-900 leading-relaxed")}
				/>

				{/* Row 4: Links Manager Header */}
				<div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 px-4 py-2 bg-slate-50/10 dark:bg-slate-950/5">
					<span className={cn(monoFont.className, "text-[9px] lowercase tracking-widest text-muted-foreground font-semibold")}>
						links to access ({(activeItem.links || []).length}/6)
					</span>
					{(activeItem.links || []).length < 6 && (
						<button
							type="button"
							onClick={addLink}
							className={cn(
								monoFont.className,
								"text-[9px] font-bold lowercase tracking-wider text-[hsl(var(--pride-glow-val))] flex items-center gap-1 hover:underline cursor-pointer"
							)}
						>
							<Plus className="h-2.5 w-2.5" /> add link
						</button>
					)}
				</div>

				{/* Row 5: Dynamic Access Links List */}
				{(activeItem.links || []).length > 0 && (
					<div className="divide-y divide-slate-100 dark:divide-slate-900 bg-white/10 dark:bg-slate-950/5">
						{(activeItem.links || []).map((link, idx) => (
							<div key={idx} className="grid grid-cols-[140px_1fr_auto] items-center">
								<input
									type="text"
									value={link.label}
									onChange={(e) => updateLink(idx, 'label', e.target.value)}
									placeholder="Link label"
									className={cn(sansFont.className, "min-w-0 border-r border-slate-100 dark:border-slate-900 bg-transparent px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder:text-muted-foreground/50 focus:outline-none")}
								/>
								<input
									type="url"
									value={link.url}
									onChange={(e) => updateLink(idx, 'url', e.target.value)}
									placeholder="URL Link (https://...)"
									className={cn(sansFont.className, "min-w-0 bg-transparent px-4 py-2 text-xs text-slate-755 dark:text-slate-350 placeholder:text-muted-foreground/50 focus:outline-none")}
								/>
								<button
									type="button"
									onClick={() => removeLink(idx)}
									className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer border-l border-slate-100 dark:border-slate-900 h-full flex items-center"
									title="Remove link"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Cohesive Share Link Panel (Grid-split style) */}
			<div className="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
				<div className="flex-1 w-full space-y-1 text-left">
					<div className="flex items-center justify-between">
						<span className={cn(sansFont.className, "text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1")}>
							link to share
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={copyShareLink}
							className="rounded-full text-[10px] tracking-wider py-1.5 h-8 font-semibold lowercase cursor-pointer"
						>
							{isLinkCopying ? (
								<><Check className="h-3 w-3 shrink-0" /> copied link!</>
							) : (
								<><Share2 className="h-3 w-3 shrink-0" /> copy share link</>
							)}
						</Button>
					</div>
					<input
						type="text"
						readOnly
						value={getShareUrl()}
						onClick={(e) => (e.target as HTMLInputElement).select()}
						className={cn(monoFont.className, "w-full rounded-md border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 px-3 py-2 text-[10px] text-slate-500 select-all cursor-text focus:outline-none")}
					/>
				</div>

				{/* Actions (Native Rounded-Full Buttons) */}
				<div className="flex flex-wrap gap-3 w-full md:w-auto self-end pt-1 md:pt-0">
					<Button
						variant="outline"
						onClick={copyToClipboard}
						className="lowercase font-bold flex-1 md:flex-initial h-10 px-5 text-xs rounded-full"
					>
						{isCopying ? (
							<><Check className="h-3.5 w-3.5 shrink-0" /> copied config</>
						) : (
							<><Copy className="h-3.5 w-3.5 shrink-0" /> copy config</>
						)}
					</Button>

					{items.length > 2 && (previewMode === 'grid' || previewMode === 'row') && (
						<Button
							variant="outline"
							onClick={exportAllRows}
							disabled={isExporting}
							className="lowercase font-bold flex-1 md:flex-initial h-10 px-5 text-xs rounded-full"
						>
							{isExporting ? (
								<>generating...</>
							) : (
								<><Download className="h-3.5 w-3.5 shrink-0" /> export all rows</>
							)}
						</Button>
					)}

					<Button
						onClick={exportCardPng}
						disabled={isExporting}
						className="lowercase font-bold flex-1 md:flex-initial h-10 px-5 text-xs rounded-full"
					>
						{isExporting ? (
							<>generating...</>
						) : (
							<><Download className="h-3.5 w-3.5 shrink-0" /> {previewMode === 'single' ? 'export active card' : previewMode === 'row' ? 'export active row' : 'export full grid'}</>
						)}
					</Button>
				</div>
			</div>

			{/* Page Preview Section */}
			<div className="space-y-4 w-full">
				<div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
					<div className="flex items-center gap-2">
						<span className={cn(sansFont.className, "text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100")}>
							live page preview
						</span>
						<span className={cn(monoFont.className, "text-[9px] text-muted-foreground")}>
							(renders at your exact design size and grid columns)
						</span>
					</div>

					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setPreviewMode('single')}
							className={cn(
								sansFont.className,
								"px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 rounded border lowercase transition-colors cursor-pointer",
								previewMode === 'single'
									? "text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10"
									: "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
							)}
						>
							<Eye className="h-3 w-3" /> active card
						</button>
						{items.length > 2 && (
							<button
								type="button"
								onClick={() => setPreviewMode('row')}
								className={cn(
									sansFont.className,
									"px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 rounded border lowercase transition-colors cursor-pointer",
									previewMode === 'row'
										? "text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10"
										: "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
								)}
							>
								<LayoutGrid className="h-3 w-3" /> active row
							</button>
						)}
						<button
							type="button"
							onClick={() => setPreviewMode('grid')}
							className={cn(
								sansFont.className,
								"px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 rounded border lowercase transition-colors cursor-pointer",
								previewMode === 'grid'
									? "text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10"
									: "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
							)}
						>
							<LayoutGrid className="h-3 w-3" /> full grid ({items.length})
						</button>
					</div>
				</div>

				{/* Full Width Canvas Wrapper */}
				<div className="w-full py-4">
					<style dangerouslySetInnerHTML={{__html: `
						/* Remove selection rings, editing badges, and animations during export */
						[data-exporting="true"] [data-active-card="true"] {
							transition: none !important;
							outline: none !important;
							ring: 0 !important;
							box-shadow: none !important;
							--tw-ring-width: 0px !important;
							--tw-ring-offset-width: 0px !important;
							--tw-ring-color: transparent !important;
						}
						
						/* Remove card shadows during export to prevent clipped edge artifacts */
						[data-exporting="true"] .shadow-xl,
						[data-exporting="true"] .shadow-2xl {
							box-shadow: none !important;
						}

						/* Reset hover background shifts during export */
						[data-exporting="true"] article {
							background-color: rgba(248, 250, 252, 0.5) !important;
						}
						.dark [data-exporting="true"] article {
							background-color: rgba(15, 23, 42, 0.3) !important;
						}

						/* Force desktop dimensions and padding regardless of device viewport */
						[data-force-desktop="true"] .h-48 {
							height: 16rem !important; /* 256px - equivalent to sm:h-64 */
						}
						[data-force-desktop="true"] .p-5 {
							padding: 1.5rem !important; /* 24px - equivalent to sm:p-6 */
						}

						/* Official Site Background mimicking the body */
						.official-bg-preview {
							background-image:
								radial-gradient(circle at 10% 10%, hsl(350 85% 72% / 0.14), transparent 45rem),
								radial-gradient(circle at 30% 30%, hsl(52 92% 70% / 0.11), transparent 40rem),
								radial-gradient(circle at 50% 50%, hsl(142 76% 66% / 0.09), transparent 40rem),
								radial-gradient(circle at 75% 70%, hsl(206 90% 72% / 0.13), transparent 45rem),
								radial-gradient(circle at 95% 90%, hsl(272 75% 70% / 0.08), transparent 55rem),
								linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)),
								url('/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1') !important;
							background-size: cover !important;
							background-position: center !important;
							background-repeat: no-repeat !important;
						}
						.dark .official-bg-preview {
							background-image:
								radial-gradient(circle at 10% 10%, hsl(350 85% 72% / 0.09), transparent 45rem),
								radial-gradient(circle at 30% 30%, hsl(52 92% 70% / 0.07), transparent 40rem),
								radial-gradient(circle at 50% 50%, hsl(142 76% 66% / 0.06), transparent 40rem),
								radial-gradient(circle at 75% 70%, hsl(206 90% 72% / 0.09), transparent 45rem),
								radial-gradient(circle at 95% 90%, hsl(272 75% 70% / 0.05), transparent 55rem),
								linear-gradient(rgba(7, 12, 22, 0.95), rgba(7, 12, 22, 0.95)),
								url('/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1') !important;
							background-size: cover !important;
							background-position: center !important;
							background-repeat: no-repeat !important;
						}
					`}} />
					<div
						id="favorites-card-export-target"
						data-exporting={isExporting}
						className={cn(
							isExporting
								? "official-bg-preview rounded-xl border border-slate-200/40 dark:border-slate-850/20 shadow-md p-6 shrink-0"
								: "w-full bg-transparent"
						)}
						style={
							isExporting
								? {
									width: previewMode === 'single' ? '460px' : '896px',
									minWidth: previewMode === 'single' ? '460px' : '896px',
								  }
								: {
									maxWidth: previewMode === 'single' ? '460px' : '896px',
									margin: '0 auto',
								  }
						}
						data-force-desktop={isExporting}
					>
						{previewMode === 'single' ? (
							<div className="w-full rounded-md">
								<RecommendationCard item={buildFullRecommendation(activeItem)} viewMode="detailed" />
							</div>
						) : previewMode === 'row' ? (
							<div
								className={cn(
									"grid gap-6 w-full",
									isExporting ? "grid-cols-2" : "grid-cols-1 lg:grid-cols-2"
								)}
							>
								{items.map((item, idx) => {
									const isSameRow = Math.floor(idx / 2) === Math.floor(activeIndex / 2)
									if (!isSameRow) return null
									return (
										<div
											key={idx}
											onClick={() => setActiveIndex(idx)}
											data-active-card={activeIndex === idx}
											className={cn(
												"rounded-md h-full transition-all duration-300 cursor-pointer relative",
												(activeIndex === idx && !isExporting)
													? "ring-2 ring-[hsl(var(--pride-glow-val))] ring-offset-2 dark:ring-offset-slate-950"
													: "hover:ring-1 hover:ring-slate-350 dark:hover:ring-slate-700"
											)}
											title="Click to edit this card"
										>
											<RecommendationCard item={buildFullRecommendation(item)} viewMode="detailed" />
											{activeIndex === idx && !isExporting && (
												<div className={cn(monoFont.className, "absolute top-2 right-2 bg-[hsl(var(--pride-glow-val))]/90 text-white text-[9px] px-2 py-0.5 rounded shadow-sm tracking-wide lowercase z-10 font-bold")}>
													editing
												</div>
											)}
										</div>
									)
								})}
							</div>
						) : (
							<div
								className={cn(
									"grid gap-6 w-full",
									isExporting ? "grid-cols-2" : "grid-cols-1 lg:grid-cols-2"
								)}
							>
								{items.map((item, idx) => (
									<div
										key={idx}
										onClick={() => setActiveIndex(idx)}
										data-active-card={activeIndex === idx}
										className={cn(
											"rounded-md h-full transition-all duration-300 cursor-pointer relative",
											(activeIndex === idx && !isExporting)
												? "ring-2 ring-[hsl(var(--pride-glow-val))] ring-offset-2 dark:ring-offset-slate-950"
												: "hover:ring-1 hover:ring-slate-350 dark:hover:ring-slate-700"
										)}
										title="Click to edit this card"
									>
										<RecommendationCard item={buildFullRecommendation(item)} viewMode="detailed" />
										{activeIndex === idx && !isExporting && (
											<div className={cn(monoFont.className, "absolute top-2 right-2 bg-[hsl(var(--pride-glow-val))]/90 text-white text-[9px] px-2 py-0.5 rounded shadow-sm tracking-wide lowercase z-10 font-bold")}>
												editing
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	)
}
