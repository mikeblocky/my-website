'use client'

import { useRef, useEffect } from 'react'

function seededRandom(seed: number) {
	let s = seed
	return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

interface OrganicWavesProps {
	className?: string
	layers?: number
	baseColor?: number[]
	foamColor?: number[]
	sandColor?: number[]
}

export function OrganicWaves({
	className = '',
	layers = 5,
	baseColor = [26, 58, 74],
	foamColor = [255, 255, 255],
	sandColor = [196, 181, 154]
}: OrganicWavesProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animRef = useRef<number>(0)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let dpr = 1
		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2)
			const r = canvas.getBoundingClientRect()
			canvas.width = r.width * dpr
			canvas.height = r.height * dpr
		}
		resize()
		window.addEventListener('resize', resize)

		const cfgs = Array.from({ length: layers }, (_, i) => ({
			amp1: 4 + i * 2, amp2: 2 + i * 1, amp3: 1 + i * 0.5,
			freq1: 0.003 + i * 0.0002, freq2: 0.007 - i * 0.0004, freq3: 0.013 + i * 0.0008,
			speed1: 0.45 + i * 0.1, speed2: -0.3 - i * 0.07, speed3: 0.18 + i * 0.05,
			phase: i * 1.4,
			/* surge — pushes wave forward (down=onto sand) and back */
			surgeAmp: 30 + i * 22,
			surgeSpeed: 0.08 + i * 0.018,
			surgePhase: i * 0.7,
			surge2Amp: 14 + i * 8,
			surge2Speed: 0.05 - i * 0.006,
			surge2Phase: i * 2.3,
			/* base y position (from top of canvas) */
			yBase: 20 + i * 28,
			/* visuals */
			opacity: 0.10 + i * 0.09,
			foamOpacity: 0.06 + i * 0.06,
			foamWidth: 1 + (layers - i) * 0.4
		}))

		let t = 0
		const draw = () => {
			const r = canvas.getBoundingClientRect()
			const w = r.width, h = r.height
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			ctx.clearRect(0, 0, w, h)
			t += 0.016

			for (let li = 0; li < cfgs.length; li++) {
				const c = cfgs[li]
				const surge = Math.sin(t * c.surgeSpeed + c.surgePhase) * c.surgeAmp
					+ Math.sin(t * c.surge2Speed + c.surge2Phase) * c.surge2Amp

				const ys: number[] = []
				for (let x = 0; x <= w; x += 2) {
					ys.push(c.yBase + surge
						+ Math.sin(x * c.freq1 + t * c.speed1 + c.phase) * c.amp1
						+ Math.sin(x * c.freq2 + t * c.speed2 + c.phase * 0.7) * c.amp2
						+ Math.sin(x * c.freq3 + t * c.speed3 + c.phase * 1.3) * c.amp3)
				}

				/* wet sand trail when retreating */
				if (surge < 0) {
					const a = Math.min(0.14, Math.abs(surge) * 0.003)
					ctx.beginPath(); ctx.moveTo(0, h)
					for (let xi = 0; xi < ys.length; xi++) ctx.lineTo(xi * 2, ys[xi] + 8)
					ctx.lineTo(w, h); ctx.closePath()
					ctx.fillStyle = `rgba(${sandColor[0] - 30},${sandColor[1] - 30},${sandColor[2] - 30},${a})`
					ctx.fill()
				}

				/* wave body */
				ctx.beginPath(); ctx.moveTo(0, h)
				for (let xi = 0; xi < ys.length; xi++) ctx.lineTo(xi * 2, ys[xi])
				ctx.lineTo(w, h); ctx.closePath()
				ctx.fillStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${c.opacity})`
				ctx.fill()

				/* foam crest */
				ctx.beginPath()
				for (let xi = 0; xi < ys.length; xi++) {
					if (xi === 0) ctx.moveTo(0, ys[0]); else ctx.lineTo(xi * 2, ys[xi])
				}
				ctx.strokeStyle = `rgba(${foamColor[0]},${foamColor[1]},${foamColor[2]},${c.foamOpacity})`
				ctx.lineWidth = c.foamWidth; ctx.stroke()

				/* foam specks */
				for (let x = 0; x <= w; x += 10 + Math.sin(t * 0.6 + x * 0.08) * 8) {
					const xi = Math.min(Math.floor(x / 2), ys.length - 1)
					const sz = 0.8 + Math.abs(Math.sin(x * 0.04 + t * 0.4 + li)) * 2.2
					const a = 0.06 + Math.abs(Math.sin(x * 0.02 + t * 0.5)) * 0.3
					ctx.beginPath(); ctx.arc(x, ys[xi] - 1, sz, 0, Math.PI * 2)
					ctx.fillStyle = `rgba(${foamColor[0]},${foamColor[1]},${foamColor[2]},${a})`
					ctx.fill()
				}
			}
			animRef.current = requestAnimationFrame(draw)
		}
		animRef.current = requestAnimationFrame(draw)
		return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
	}, [layers, baseColor, foamColor, sandColor])

	return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-x-0 block w-full ${className}`} />
}
