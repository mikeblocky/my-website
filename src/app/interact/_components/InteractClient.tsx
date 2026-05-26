'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { useSearchParams } from 'next/navigation'
import { TalkBoard } from '@/app/talk/_components/TalkBoard'
import { DrawBoard } from '@/app/draw/_components/DrawBoard'
import { SuggestionsBoard } from '@/app/suggestions/_components/SuggestionsBoard'

type Tab = 'guestbook' | 'prompts' | 'suggestions'

export function InteractClient() {
	const searchParams = useSearchParams()
	const tabParam = searchParams.get('tab')
	const [activeTab, setActiveTab] = useState<Tab>(
		tabParam === 'prompts' ? 'prompts' : tabParam === 'suggestions' ? 'suggestions' : 'guestbook'
	)
	
	const [passcode, setPasscode] = useState('')
	const [isAdminMode, setIsAdminMode] = useState(false)

	useEffect(() => {
		const tab = searchParams.get('tab')
		if (tab === 'prompts') {
			setActiveTab('prompts')
		} else if (tab === 'guestbook') {
			setActiveTab('guestbook')
		} else if (tab === 'suggestions') {
			setActiveTab('suggestions')
		} else if (typeof window !== 'undefined' && window.location.hash) {
			if (window.location.hash.startsWith('#prompt-')) {
				setActiveTab('prompts')
			} else if (window.location.hash.startsWith('#talk-')) {
				setActiveTab('guestbook')
			}
		}
	}, [searchParams])

	const tabs = [
		{ id: 'guestbook' as Tab, label: 'Guestbook board' },
		{ id: 'prompts' as Tab, label: 'Drawing prompts' },
		{ id: 'suggestions' as Tab, label: 'Media suggestions' }
	]

	return (
		<div className="space-y-8">
			{/* Sub-navigation Tabs - flat categories pill styles */}
			<div className="flex flex-wrap gap-2 pb-1">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 focus:outline-none whitespace-nowrap",
							activeTab === tab.id
								? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20"
								: "border-slate-300 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300"
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Contents with clean borderless transitions */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.15 }}
			>
				{activeTab === 'guestbook' && (
					<TalkBoard 
						isAdminMode={isAdminMode} 
						setIsAdminMode={setIsAdminMode} 
						passcode={passcode} 
						setPasscode={setPasscode} 
					/>
				)}

				{activeTab === 'prompts' && (
					<DrawBoard 
						isAdminMode={isAdminMode} 
						setIsAdminMode={setIsAdminMode} 
						passcode={passcode} 
						setPasscode={setPasscode} 
					/>
				)}

				{activeTab === 'suggestions' && (
					<SuggestionsBoard 
						isAdminMode={isAdminMode} 
						setIsAdminMode={setIsAdminMode} 
						passcode={passcode} 
						setPasscode={setPasscode} 
					/>
				)}
			</motion.div>
		</div>
	)
}
