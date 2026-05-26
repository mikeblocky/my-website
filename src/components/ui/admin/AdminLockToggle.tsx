'use client'

import { Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

type AdminAccent = 'blue' | 'violet' | 'teal'

interface AdminLockToggleProps {
	isAdminMode: boolean
	setIsAdminMode: (value: boolean) => void
	passcode: string
	setPasscode: (value: string) => void
	showPasscodeInput: boolean
	setShowPasscodeInput: (value: boolean) => void
	onEnabled: () => void
	accent?: AdminAccent
}

const accentStyles: Record<AdminAccent, { hover: string; active: string; ring: string }> = {
	blue: {
		hover: 'hover:text-blue-650 dark:hover:text-blue-350',
		active: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
		ring: 'focus:ring-blue-500',
	},
	violet: {
		hover: 'hover:text-violet-650 dark:hover:text-violet-350',
		active: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400',
		ring: 'focus:ring-violet-500',
	},
	teal: {
		hover: 'hover:text-teal-650 dark:hover:text-teal-350',
		active: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400',
		ring: 'focus:ring-teal-500',
	},
}

export function AdminLockToggle({
	isAdminMode,
	setIsAdminMode,
	passcode,
	setPasscode,
	showPasscodeInput,
	setShowPasscodeInput,
	onEnabled,
	accent = 'blue',
}: AdminLockToggleProps) {
	const styles = accentStyles[accent]

	function enableAdmin() {
		setIsAdminMode(true)
		setShowPasscodeInput(false)
		onEnabled()
	}

	return (
		<div className="ml-2 flex items-center gap-1.5">
			<button
				type="button"
				onClick={() => {
					if (isAdminMode) {
						setIsAdminMode(false)
						setPasscode('')
					} else {
						setShowPasscodeInput(!showPasscodeInput)
					}
				}}
				className={cn(
					'flex items-center justify-center rounded-full p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-200/50 dark:hover:bg-slate-800/40',
					styles.hover,
					isAdminMode && styles.active
				)}
				title={isAdminMode ? 'Disable Admin Mode' : 'Enable Admin Mode'}
			>
				{isAdminMode ? <Unlock size={14} /> : <Lock size={14} />}
			</button>

			{showPasscodeInput && !isAdminMode && (
				<div className="flex w-[90px] items-center overflow-hidden motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-1 motion-safe:duration-150">
					<input
						type="password"
						value={passcode}
						onChange={(event) => {
							setPasscode(event.target.value)
							if (event.target.value.length >= 4) {
								enableAdmin()
							}
						}}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								enableAdmin()
							}
						}}
						placeholder="Passcode"
						className={cn(
							'w-20 rounded-md border border-slate-200 bg-background px-2 py-0.5 text-[10px] text-slate-900 focus:outline-none focus:ring-1 dark:border-slate-800 dark:text-slate-100',
							styles.ring
						)}
					/>
				</div>
			)}
		</div>
	)
}
