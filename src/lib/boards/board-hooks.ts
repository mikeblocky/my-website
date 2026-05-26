'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { formatCooldown, type ApiCooldown } from './board-utils'

export function useControlledState<TValue>(
	controlledValue: TValue | undefined,
	onControlledChange: ((value: TValue) => void) | undefined,
	defaultValue: TValue
) {
	const [localValue, setLocalValue] = useState(defaultValue)

	if (controlledValue !== undefined && onControlledChange) {
		return [controlledValue, onControlledChange] as const
	}

	return [localValue, setLocalValue] as const
}

export function useTimedMessage(timeoutMs = 4000) {
	const [message, setMessage] = useState<string | null>(null)
	const timeoutRef = useRef<number | null>(null)

	const clearMessage = useCallback(() => {
		setMessage(null)
	}, [])

	const showMessage = useCallback((nextMessage: string) => {
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current)
		}
		setMessage(nextMessage)
		timeoutRef.current = window.setTimeout(() => {
			setMessage((current) => current === nextMessage ? null : current)
			timeoutRef.current = null
		}, timeoutMs)
	}, [timeoutMs])

	useEffect(() => () => {
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current)
		}
	}, [])

	return { message, showMessage, clearMessage }
}

export function useButtonFeedback(timeoutMs = 2000) {
	const [feedback, setFeedback] = useState<Record<string, string>>({})
	const timeoutRefs = useRef<number[]>([])

	const showFeedback = useCallback((key: string, message: string) => {
		setFeedback((current) => ({ ...current, [key]: message }))
		const timeout = window.setTimeout(() => {
			setFeedback((current) => {
				const next = { ...current }
				if (next[key] === message) {
					delete next[key]
				}
				return next
			})
			timeoutRefs.current = timeoutRefs.current.filter((item) => item !== timeout)
		}, timeoutMs)
		timeoutRefs.current.push(timeout)
	}, [timeoutMs])

	useEffect(() => () => {
		timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout))
		timeoutRefs.current = []
	}, [])

	return { feedback, showFeedback }
}

export function useBoardCooldown() {
	const [cooldownExpiresAt, setCooldownExpiresAt] = useState<string | null>(null)
	const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0)

	const applyCooldown = useCallback((cooldown?: ApiCooldown | null) => {
		if (!cooldown?.expiresAt || cooldown.remainingMs <= 0) {
			setCooldownExpiresAt(null)
			setCooldownRemainingMs(0)
			return
		}

		setCooldownExpiresAt(cooldown.expiresAt)
		setCooldownRemainingMs(cooldown.remainingMs)
	}, [])

	useEffect(() => {
		if (!cooldownExpiresAt) return

		const tick = () => {
			const remaining = Math.max(0, new Date(cooldownExpiresAt).getTime() - Date.now())
			setCooldownRemainingMs(remaining)
			if (remaining === 0) {
				setCooldownExpiresAt(null)
			}
		}

		tick()
		const interval = window.setInterval(tick, 1000)
		return () => window.clearInterval(interval)
	}, [cooldownExpiresAt])

	return {
		cooldownRemainingMs,
		isCooldownActive: cooldownRemainingMs > 0,
		cooldownLabel: formatCooldown(cooldownRemainingMs),
		applyCooldown,
	}
}
