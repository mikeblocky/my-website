'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { TalkBoard } from '@/app/talk/_components/TalkBoard'
import { DrawBoard } from '@/app/draw/_components/DrawBoard'

type Tab = 'guestbook' | 'prompts'

export function InteractClient() {
	const [activeTab, setActiveTab] = useState<Tab>('guestbook')

	const tabs = [
		{ id: 'guestbook' as Tab, label: 'Guestbook board' },
		{ id: 'prompts' as Tab, label: 'Drawing prompts' }
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
					<div className="space-y-4">
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Guestbook board</h3>
							<p className="text-sm text-muted-foreground leading-relaxed mt-1">
								Share recommendations, ask questions, leave a kind message, or talk about anything!
							</p>
						</div>
						<TalkBoard />
					</div>
				)}

				{activeTab === 'prompts' && (
					<div className="space-y-4">
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Drawing prompt suggestions</h3>
							<p className="text-sm text-muted-foreground leading-relaxed mt-1">
								Suggest a scene, setting, character, or concept you'd love to see drawn next.
							</p>
						</div>
						<DrawBoard />
					</div>
				)}
			</motion.div>
		</div>
	)
}
