export type ApiCooldown = {
	expiresAt: string | null
	remainingMs: number
}

const boardDateFormatter = new Intl.DateTimeFormat('en', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
	timeZone: 'Asia/Bangkok',
})

const boardDateFormatterCompact = new Intl.DateTimeFormat('en', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
	timeZone: 'Asia/Bangkok',
})

export function sortByCreatedAt<TItem extends { createdAt: string }>(items: TItem[]) {
	return items.slice().sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	)
}

export function formatBoardDate(iso: string) {
	try {
		return boardDateFormatter.format(new Date(iso))
	} catch (_error) {
		return iso
	}
}

export function formatBoardDateCompact(iso: string) {
	try {
		return boardDateFormatterCompact.format(new Date(iso))
	} catch (_error) {
		return iso
	}
}

export function formatCooldown(ms: number) {
	const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	if (hours > 0) {
		return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
	}

	return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}
