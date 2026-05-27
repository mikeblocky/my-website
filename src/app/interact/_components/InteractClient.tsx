'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { usePersistedTab } from '@/components/ui/tabs/usePersistedTab'
import { LoadingSurface } from '@/components/ui/loading/LoadingSurface'
import { SmoothPanel } from '@/components/ui/transition/SmoothPanel'

type Tab = 'guestbook' | 'prompts' | 'suggestions'

interface SharedBoardProps {
	isAdminMode: boolean
	setIsAdminMode: (value: boolean) => void
	passcode: string
	setPasscode: (value: string) => void
}

const boardLoader = (
	<LoadingSurface label="Loading board..." />
)

const TalkBoard = dynamic<SharedBoardProps>(
	() => import('@/app/talk/_components/TalkBoard').then((mod) => mod.TalkBoard),
	{ loading: () => boardLoader }
)
const DrawBoard = dynamic<SharedBoardProps>(
	() => import('@/app/draw/_components/DrawBoard').then((mod) => mod.DrawBoard),
	{ loading: () => boardLoader }
)
const SuggestionsBoard = dynamic<SharedBoardProps>(
	() => import('@/app/suggestions/_components/SuggestionsBoard').then((mod) => mod.SuggestionsBoard),
	{ loading: () => boardLoader }
)

function getTabFromParam(tab: string | null): Tab | null {
	if (tab === 'prompts' || tab === 'guestbook' || tab === 'suggestions') {
		return tab
	}

	return null
}

function getTabFromHash(hash: string): Tab | null {
	if (hash.startsWith('#prompt-')) {
		return 'prompts'
	}

	if (hash.startsWith('#talk-')) {
		return 'guestbook'
	}

	if (hash.startsWith('#suggestion-')) {
		return 'suggestions'
	}

	return null
}

function subscribeToHashChange(onStoreChange: () => void) {
	window.addEventListener('hashchange', onStoreChange)
	return () => window.removeEventListener('hashchange', onStoreChange)
}

function getCurrentHash() {
	return window.location.hash
}

function getServerHash() {
	return ''
}

export function InteractClient() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const tabParam = searchParams.get('tab')
	const hash = useSyncExternalStore(subscribeToHashChange, getCurrentHash, getServerHash)
	const isInteractTab = useCallback((value: string): value is Tab => getTabFromParam(value) !== null, [])
	const [storedTab, setStoredTab] = usePersistedTab<Tab>('mikeblocky:interact-tab', 'guestbook', isInteractTab)
	const [selectedTab, setSelectedTab] = useState<Tab | null>(null)
	const activeTab = selectedTab ?? getTabFromParam(tabParam) ?? getTabFromHash(hash) ?? storedTab
	
	const [passcode, setPasscode] = useState('')
	const [isAdminMode, setIsAdminMode] = useState(false)

	const tabs = [
		{ id: 'guestbook' as Tab, label: 'Guestbook board' },
		{ id: 'prompts' as Tab, label: 'Drawing prompts' },
		{ id: 'suggestions' as Tab, label: 'Media suggestions' }
	]

	return (
		<div className="space-y-8">
			<PillTabs
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(tab) => {
					setSelectedTab(tab)
					setStoredTab(tab)
					const params = new URLSearchParams(searchParams.toString())
					params.set('tab', tab)
					router.replace(`${pathname}?${params.toString()}`, { scroll: false })
				}}
				className="pb-1"
				showCounts={false}
			/>

			<SmoothPanel panelKey={activeTab}>
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
			</SmoothPanel>
		</div>
	)
}
