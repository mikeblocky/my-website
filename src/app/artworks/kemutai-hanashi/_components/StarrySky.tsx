'use client'

import { useRef, useEffect } from 'react'

function seededRandom(seed: number) {
	let s = seed
	return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

export function StarrySky() {
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

		/* generate stars once */
		const rand = seededRandom(77)
		const stars = Array.from({ length: 180 }, () => ({
			x: rand(),
			y: rand(),
			r: 0.4 + rand() * 1.6,
			speed: 0.3 + rand() * 1.2,      // twinkle speed
			phase: rand() * Math.PI * 2,
			minA: 0.15 + rand() * 0.2,
			maxA: 0.55 + rand() * 0.45
		}))

		let t = 0
		const draw = () => {
			const r = canvas.getBoundingClientRect()
			const w = r.width, h = r.height
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			ctx.clearRect(0, 0, w, h)
			t += 0.016

			for (const s of stars) {
				const alpha = s.minA + (s.maxA - s.minA) * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
				ctx.beginPath()
				ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
				ctx.fillStyle = `rgba(255,255,255,${alpha})`
				ctx.fill()
			}
			animRef.current = requestAnimationFrame(draw)
		}
		animRef.current = requestAnimationFrame(draw)
		return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
	}, [])

	return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
}
